import { BadRequestException, ConflictException, NotFoundException, TooManyRequestsException } from './../../common/exceptions/Application.exception';
import { confirmEmailTypeDTO, LoginDto, ResendConfirmEmailTypeDTO, signupTypeDTO } from './DTO/auth.dto';
import { UserRepo } from './../../common/Repository/user.repository';
import { cacheService, CacheService } from '../../common/services/redis.service';
import { compareHash, generateHash } from '../../common/security/hash.security';
import { EmailSubjectEnum, providerEnum } from '../../common/enum/enum.js';
import { UserEmailKey, UserEmailTrialKey } from './../../common/utils/email/send.email';
import { emailEvent } from './../../common/utils/email/email.event';
import { encrypt } from './../../common/security/encryption.security';
import { IUser } from './../../common/interface/IUser.interface';
import { TokenService, tokenService } from './../../common/services/token.service';
import { maxLoginAttempts } from './../../common/utils/maxLoginAttempts';
import { env } from '../../config/env.service.js';
import { OAuth2Client } from 'google-auth-library';
import { getIssuer } from './../../common/utils/issuer';
export class AuthService {
    private userRepository: UserRepo;
    private cashService: CacheService;
    private tokenService: TokenService;
    private client: OAuth2Client;

    constructor() {
        // console.log('inst');
        this.userRepository = new UserRepo();
        this.cashService = cacheService;
        this.tokenService = tokenService;
        this.client = new OAuth2Client();

    }

    //login api
    async login(body: LoginDto, issuer: string) {
        const { email, password } = body;
        const user = await this.userRepository.findOne({ filter: { email } });
        // console.log(user);



        if (!user) {
            throw new NotFoundException("user does not exist");
        }
        // if (!user.isVerified) {
        //     throw new BadRequestException("user is not verified yet");
        // }
        if (user.provider == 1) {
            throw new BadRequestException("this user logged in with google please sign in with google");
        }
        const isMatched = await compareHash({ plainText: password, hashedPassword: user.password });

        if (isMatched) {
            // no max attempts reached yet
            if (await this.cashService.ttl({ key: UserEmailTrialKey({ email, subject: EmailSubjectEnum.LOGIN_ATTEMPTS }) }) < 0) {
                await this.cashService.del({ key: UserEmailTrialKey({ email, subject: EmailSubjectEnum.LOGIN_ATTEMPTS }) });
                if (user.twoStepVerification) {
                    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.TWO_STEP_VERIFICATION, title: 'Confirm two step verification' });

                    return { message: "please verify your email an otp sent to your gmail" };
                }
                const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user, issuer });

                return { message: "login successfully", accessToken, refreshToken };
            } else {
                // after the all atttempts reached
                throw new BadRequestException("you can't login now try again later");
            }
        } else {

            return await maxLoginAttempts({ email, subject: EmailSubjectEnum.LOGIN_ATTEMPTS });


        }
    };


    //signup api

    async signup(body: signupTypeDTO['body']) {
        const { userName, email, phone, age, password, confirmPassword, gender } = body;
        let existedMail = await this.userRepository.findOne({ filter: { email } });
        if (existedMail) {
            throw new ConflictException("email already exist!");
        }
        if (password !== confirmPassword) {
            throw new BadRequestException("password and confirm password doesnot match");
        }
        const hashedPassword = await generateHash({ plainText: password });
        // generate OTP
        const user = await this.userRepository.createOne({
            data: {
                userName,
                email,
                phone: await encrypt(phone),
                age,
                password: hashedPassword,
                gender
            },
            options: { validateBeforeSave: true }
        });

        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL, title: 'Confirm email otp' });

        return user;
    };

    private async sendEmailOtp({
        email,
        subject,
        title,
        timeToLive = 120,
        maxTrial = 3,
        blockTime = 300 }: {
            email: string,
            subject: EmailSubjectEnum;
            title: string;
            timeToLive?: number,
            maxTrial?: number,
            blockTime?: number;
        }) {
        // console.log(subject);

        const existOTP_TTL: number = await this.cashService.ttl({ key: UserEmailKey({ email, subject }) });
        console.log(existOTP_TTL, 'exist OTP');

        if (existOTP_TTL > 0) {
            throw new ConflictException(`cant generate another otp while the old one still valid please wait ${existOTP_TTL} seconds`);
        }
        const oldtrials = await this.cashService.get({ key: UserEmailTrialKey({ email, subject }) }) ?? 0;
        // console.log(oldtrials);

        if (oldtrials as number >= maxTrial) {
            throw new TooManyRequestsException("maximum otp trials reached please try again after 300 seconds");
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        await this.cashService.set({ key: UserEmailKey({ email, subject }), value: otp, ttl: timeToLive });
        // console.log(otp);

        let current = await this.cashService.incrBy({ key: UserEmailTrialKey({ email, subject }), incrValue: 1 });
        // console.log(current, 'current');


        if (current == maxTrial) {
            await this.cashService.expire({ key: UserEmailTrialKey({ email, subject }), expireAfter: blockTime });
        }
        emailEvent.emit('sendEmail', {
            recipients: { to: [email] },
            subject: EmailSubjectEnum.CONFIRM_EMAIL,
            html: `<h1>OTP ${otp}</h1>`
        });

    }

    // checks the submitted otp and counts the wrong attempts,
    // otherwise a 6 digit code can be brute forced while it is still valid
    private async verifyOtp({
        email,
        subject,
        otp,
        maxAttempts = 5,
        blockTime = 300
    }: {
        email: string,
        subject: EmailSubjectEnum,
        otp: string,
        maxAttempts?: number,
        blockTime?: number;
    }) {
        const key = UserEmailKey({ email, subject });
        const attemptsKey = UserEmailTrialKey({ email, subject });
        const expected = await this.cashService.get({ key });

        if (expected === null || expected === undefined) {
            throw new BadRequestException("otp is expired or was never requested, please request a new one");
        }

        if (`${otp}` !== `${expected}`) {
            const attempts = await this.cashService.incrBy({ key: attemptsKey, incrValue: 1 });

            if (attempts === 1) {
                await this.cashService.expire({ key: attemptsKey, expireAfter: blockTime });
            }
            if (attempts >= maxAttempts) {
                // burn the otp, a new one can only be requested through the rate limited sendEmailOtp.
                // the counter is dropped too, otherwise a freshly requested otp would be blocked by it
                await this.cashService.del({ key });
                await this.cashService.del({ key: attemptsKey });
                throw new TooManyRequestsException("too many wrong attempts, please request a new otp");
            }

            throw new BadRequestException(`wrong OTP, ${maxAttempts - attempts} attempts left`);
        }

        await this.cashService.del({ key: attemptsKey });
    }



    // verify account (Confirm email)
    async verifyAccount({ otp, email }: confirmEmailTypeDTO) {
        const user = await this.userRepository.findOne({ filter: { email, provider: providerEnum.System } });
        if (!user) {
            throw new NotFoundException("no email found ");
        }
        if (user.isVerified) {
            throw new BadRequestException("user already verified");
        }
        await this.verifyOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL, otp });
        user.isVerified = true;
        await user.save();
        const getKeys = await this.cashService.keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) });

        await this.cashService.del({ key: getKeys });


        return;
    };

    // reSend otp to VerifyAccount
    async reSendVerifyAccount({ email }: ResendConfirmEmailTypeDTO) {
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new NotFoundException("no email found ");
        }
        if (user.isVerified) {
            throw new BadRequestException("user already verified");
        }

        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL, title: 'Confirm email otp' });
        return;
    };

    // forgetPassword
    async forgetPassword(email: string) {
        const user = await this.userRepository.findOne({ filter: { email, isVerified: true, provider: providerEnum.System } });
        if (!user) {
            throw new NotFoundException("no email found ");
        }

        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD, title: 'Forget password otp' });
        return { message: 'OTP sent successfully' };
    };

    // verify forgetPassword
    async verifyForgetPassword(otp: string, email: string) {
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new NotFoundException("no email found ");
        }
        await this.verifyOtp({ email, subject: EmailSubjectEnum.FORGOT_PASSWORD, otp });

        return { message: 'user verified successfully', user };
    };

    // reset forgetPassword
    async resetForgetPassword(otp: string, email: string, password: string) {
        const { user } = await this.verifyForgetPassword(otp, email);

        // google accounts have no password, bcrypt would throw on an undefined hash
        if (user.provider == providerEnum.google) {
            throw new BadRequestException("this account signs in with google, so it has no password to reset");
        }

        if (await compareHash({ plainText: password, hashedPassword: user.password })) {
            throw new ConflictException("enter a new password you entered the same old password");
        }
        user.password = await generateHash({ plainText: password });
        await user.save();
        const getKeys = await this.cashService.keys({ prefix: `User::${email}::forgetPassword::*` });
        await this.cashService.del({ key: getKeys });
        return { message: "password changed successfully" };
    }




    private async verifyGoogleAccount(idToken: string) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: env.googleClientId,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        return payload;
    }

    // signup & login using google
    async signupOrLoginWithGoogle(idToken: string, issuer: string) {
        if (!idToken) {
            // console.log('errorrrr');

            throw new BadRequestException("Google credential is required.");
        }
        // console.log({ idToken });
        const payload = await this.verifyGoogleAccount(idToken);
        console.log({ payload });


        if (payload!.email_verified !== true) {
            throw new BadRequestException("email not verified by Google");
        }

        const existEmail = await this.userRepository.findOne({ filter: { email: payload!.email as string } });
        // console.log(existEmail, 'exist');

        if (existEmail) {
            //user  login using system provider so it should throw error so he login with email and password
            if (existEmail.provider == providerEnum.System) {
                throw new BadRequestException("you cant login using gmail please enter your email and password");
            }
            // means the user exist and trying to login using gmail 

            const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user: existEmail, issuer });
            return { message: "user created successfully", tokens: { accessToken, refreshToken }, user: existEmail };
        }




        //means user has not been created yet so it will be created and login aswell
        const user = await this.userRepository.create({
            data: {
                userName: payload!.name as string,
                email: payload!.email,
                isVerified: payload!.email_verified,
                profileImage: payload!.picture,
                provider: providerEnum.google,

            }
        });
        const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user, issuer });
        return { message: "user created successfully", tokens: { accessToken, refreshToken }, user };


    }



}

export default new AuthService();