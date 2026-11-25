import { HydratedDocument } from "mongoose";
import { ConflictException } from "../../common/exceptions/Application.exception.js";
import { IUser } from "../../common/interface/IUser.interface.js";
import { JwtPayloadType, TokenService } from "../../common/services/token.service";
import { env } from "../../config/env.service.js";
import { tokenService } from './../../common/services/token.service';
import { cacheService, CacheService } from './../../common/services/redis.service';
import { LogoutEnum } from "../../common/enum/enum.js";
import { UserRepo } from './../../common/Repository/user.repository';

export class UserService {
    private readonly tokenService: TokenService;
    private readonly userRepository: UserRepo;
    private readonly casheService: CacheService;
    constructor() {
        this.tokenService = tokenService;
        this.casheService = cacheService;
        this.userRepository = new UserRepo();

    }

    async getAllUser() {
        const users = await this.userRepository.find({});
        return users;
    }

    async rotateToken(payload: JwtPayloadType, user: HydratedDocument<IUser>, issuer: string) {
        console.log({ payload, user });
        const expireAccessAt = (payload.iat + env.access_token_expiresIN) * 1000;//راجع بال milliseconds
        const currentTime = Date.now() + (5 * 60000); //يقدر يعمل اكسس توكن لما يكون فاضل خمس دقايق
        if (currentTime < expireAccessAt) {//لسه ال access token منتهاش
            throw new ConflictException('sorry we cannot create new  login credentials while current access token still valid');

        }
        const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user, issuer });
        await this.tokenService.createRevokeToken({ payload });
        return { accessToken, refreshToken };
    }

    async logout(payload: JwtPayloadType, user: HydratedDocument<IUser>, { action = LogoutEnum.Device }: { action: LogoutEnum; }) {
        switch (action) {
            case LogoutEnum.All:
                user.changeCredentialsTime = new Date();
                await user.save();
                console.log({ k: await this.casheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }) }) });
                console.log(this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }));

                await this.casheService.del({
                    key: await this.casheService.keys({
                        prefix: this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub })
                    })
                });

                break;

            default:
                await this.tokenService.createRevokeToken({ payload });
                break;
        }
        return;
    }



}

export const userService = new UserService();