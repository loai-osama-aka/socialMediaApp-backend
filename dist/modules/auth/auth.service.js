"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const Application_exception_1 = require("./../../common/exceptions/Application.exception");
const user_repository_1 = require("./../../common/Repository/user.repository");
const redis_service_1 = require("../../common/services/redis.service");
const hash_security_1 = require("../../common/security/hash.security");
const enum_js_1 = require("../../common/enum/enum.js");
const send_email_1 = require("./../../common/utils/email/send.email");
const email_event_1 = require("./../../common/utils/email/email.event");
const encryption_security_1 = require("./../../common/security/encryption.security");
const token_service_1 = require("./../../common/services/token.service");
const maxLoginAttempts_1 = require("./../../common/utils/maxLoginAttempts");
const env_service_js_1 = require("../../config/env.service.js");
const google_auth_library_1 = require("google-auth-library");
class AuthService {
    userRepository;
    cashService;
    tokenService;
    client;
    constructor() {
        this.userRepository = new user_repository_1.UserRepo();
        this.cashService = redis_service_1.cacheService;
        this.tokenService = token_service_1.tokenService;
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async login(body, issuer) {
        const { email, password } = body;
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new Application_exception_1.NotFoundException("user does not exist");
        }
        if (user.provider == 1) {
            throw new Application_exception_1.BadRequestException("this user logged in with google please sign in with google");
        }
        const isMatched = await (0, hash_security_1.compareHash)({ plainText: password, hashedPassword: user.password });
        if (isMatched) {
            if (await this.cashService.ttl({ key: (0, send_email_1.UserEmailTrialKey)({ email, subject: enum_js_1.EmailSubjectEnum.LOGIN_ATTEMPTS }) }) < 0) {
                await this.cashService.del({ key: (0, send_email_1.UserEmailTrialKey)({ email, subject: enum_js_1.EmailSubjectEnum.LOGIN_ATTEMPTS }) });
                if (user.twoStepVerification) {
                    await this.sendEmailOtp({ email, subject: enum_js_1.EmailSubjectEnum.TWO_STEP_VERIFICATION, title: 'Confirm two step verification' });
                    return { message: "please verify your email an otp sent to your gmail" };
                }
                const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user, issuer });
                return { message: "login successfully", accessToken, refreshToken };
            }
            else {
                throw new Application_exception_1.BadRequestException("you can't login now try again later");
            }
        }
        else {
            return await (0, maxLoginAttempts_1.maxLoginAttempts)({ email, subject: enum_js_1.EmailSubjectEnum.LOGIN_ATTEMPTS });
        }
    }
    ;
    async signup(body) {
        const { userName, email, phone, age, password, confirmPassword, gender } = body;
        let existedMail = await this.userRepository.findOne({ filter: { email } });
        if (existedMail) {
            throw new Application_exception_1.ConflictException("email already exist!");
        }
        if (password !== confirmPassword) {
            throw new Application_exception_1.BadRequestException("password and confirm password doesnot match");
        }
        const hashedPassword = await (0, hash_security_1.generateHash)({ plainText: password });
        const user = await this.userRepository.createOne({
            data: {
                userName,
                email,
                phone: await (0, encryption_security_1.encrypt)(phone),
                age,
                password: hashedPassword,
                gender
            },
            options: { validateBeforeSave: true }
        });
        await this.sendEmailOtp({ email, subject: enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL, title: 'Confirm email otp' });
        return user;
    }
    ;
    async sendEmailOtp({ email, subject, title, timeToLive = 120, maxTrial = 3, blockTime = 300 }) {
        const existOTP_TTL = await this.cashService.ttl({ key: (0, send_email_1.UserEmailKey)({ email, subject }) });
        console.log(existOTP_TTL, 'exist OTP');
        if (existOTP_TTL > 0) {
            throw new Application_exception_1.ConflictException(`cant generate another otp while the old one still valid please wait ${existOTP_TTL} seconds`);
        }
        const oldtrials = await this.cashService.get({ key: (0, send_email_1.UserEmailTrialKey)({ email, subject }) }) ?? 0;
        if (oldtrials >= maxTrial) {
            throw new Application_exception_1.TooManyRequestsException("maximum otp trials reached please try again after 300 seconds");
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        await this.cashService.set({ key: (0, send_email_1.UserEmailKey)({ email, subject }), value: otp, ttl: timeToLive });
        let current = await this.cashService.incrBy({ key: (0, send_email_1.UserEmailTrialKey)({ email, subject }), incrValue: 1 });
        if (current == maxTrial) {
            await this.cashService.expire({ key: (0, send_email_1.UserEmailTrialKey)({ email, subject }), expireAfter: blockTime });
        }
        email_event_1.emailEvent.emit('sendEmail', {
            recipients: { to: [email] },
            subject: enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL,
            html: `<h1>OTP ${otp}</h1>`
        });
    }
    async verifyOtp({ email, subject, otp, maxAttempts = 5, blockTime = 300 }) {
        const key = (0, send_email_1.UserEmailKey)({ email, subject });
        const attemptsKey = (0, send_email_1.UserEmailTrialKey)({ email, subject });
        const expected = await this.cashService.get({ key });
        if (expected === null || expected === undefined) {
            throw new Application_exception_1.BadRequestException("otp is expired or was never requested, please request a new one");
        }
        if (`${otp}` !== `${expected}`) {
            const attempts = await this.cashService.incrBy({ key: attemptsKey, incrValue: 1 });
            if (attempts === 1) {
                await this.cashService.expire({ key: attemptsKey, expireAfter: blockTime });
            }
            if (attempts >= maxAttempts) {
                await this.cashService.del({ key });
                await this.cashService.del({ key: attemptsKey });
                throw new Application_exception_1.TooManyRequestsException("too many wrong attempts, please request a new otp");
            }
            throw new Application_exception_1.BadRequestException(`wrong OTP, ${maxAttempts - attempts} attempts left`);
        }
        await this.cashService.del({ key: attemptsKey });
    }
    async verifyAccount({ otp, email }) {
        const user = await this.userRepository.findOne({ filter: { email, provider: enum_js_1.providerEnum.System } });
        if (!user) {
            throw new Application_exception_1.NotFoundException("no email found ");
        }
        if (user.isVerified) {
            throw new Application_exception_1.BadRequestException("user already verified");
        }
        await this.verifyOtp({ email, subject: enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL, otp });
        user.isVerified = true;
        await user.save();
        const getKeys = await this.cashService.keys({ prefix: (0, send_email_1.UserEmailKey)({ email, subject: enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL }) });
        await this.cashService.del({ key: getKeys });
        return;
    }
    ;
    async reSendVerifyAccount({ email }) {
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new Application_exception_1.NotFoundException("no email found ");
        }
        if (user.isVerified) {
            throw new Application_exception_1.BadRequestException("user already verified");
        }
        await this.sendEmailOtp({ email, subject: enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL, title: 'Confirm email otp' });
        return;
    }
    ;
    async forgetPassword(email) {
        const user = await this.userRepository.findOne({ filter: { email, isVerified: true, provider: enum_js_1.providerEnum.System } });
        if (!user) {
            throw new Application_exception_1.NotFoundException("no email found ");
        }
        await this.sendEmailOtp({ email, subject: enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD, title: 'Forget password otp' });
        return { message: 'OTP sent successfully' };
    }
    ;
    async verifyForgetPassword(otp, email) {
        const user = await this.userRepository.findOne({ filter: { email } });
        if (!user) {
            throw new Application_exception_1.NotFoundException("no email found ");
        }
        await this.verifyOtp({ email, subject: enum_js_1.EmailSubjectEnum.FORGOT_PASSWORD, otp });
        return { message: 'user verified successfully', user };
    }
    ;
    async resetForgetPassword(otp, email, password) {
        const { user } = await this.verifyForgetPassword(otp, email);
        if (user.provider == enum_js_1.providerEnum.google) {
            throw new Application_exception_1.BadRequestException("this account signs in with google, so it has no password to reset");
        }
        if (await (0, hash_security_1.compareHash)({ plainText: password, hashedPassword: user.password })) {
            throw new Application_exception_1.ConflictException("enter a new password you entered the same old password");
        }
        user.password = await (0, hash_security_1.generateHash)({ plainText: password });
        await user.save();
        const getKeys = await this.cashService.keys({ prefix: `User::${email}::forgetPassword::*` });
        await this.cashService.del({ key: getKeys });
        return { message: "password changed successfully" };
    }
    async verifyGoogleAccount(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: env_service_js_1.env.googleClientId,
        });
        const payload = ticket.getPayload();
        return payload;
    }
    async signupOrLoginWithGoogle(idToken, issuer) {
        if (!idToken) {
            throw new Application_exception_1.BadRequestException("Google credential is required.");
        }
        const payload = await this.verifyGoogleAccount(idToken);
        console.log({ payload });
        if (payload.email_verified !== true) {
            throw new Application_exception_1.BadRequestException("email not verified by Google");
        }
        const existEmail = await this.userRepository.findOne({ filter: { email: payload.email } });
        if (existEmail) {
            if (existEmail.provider == enum_js_1.providerEnum.System) {
                throw new Application_exception_1.BadRequestException("you cant login using gmail please enter your email and password");
            }
            const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user: existEmail, issuer });
            return { message: "user created successfully", tokens: { accessToken, refreshToken }, user: existEmail };
        }
        const user = await this.userRepository.create({
            data: {
                userName: payload.name,
                email: payload.email,
                isVerified: payload.email_verified,
                profileImage: payload.picture,
                provider: enum_js_1.providerEnum.google,
            }
        });
        const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user, issuer });
        return { message: "user created successfully", tokens: { accessToken, refreshToken }, user };
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
