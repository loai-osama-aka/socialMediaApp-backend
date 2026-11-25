import mongoose, { HydratedDocument } from 'mongoose';
import { UserRepo } from './../Repository/user.repository';
import { cacheService, CacheService } from './redis.service';
import { env } from './../../config/env.service';
import jwt, { JwtPayload, PublicKey, Secret, SignOptions } from 'jsonwebtoken';
import { roleEnum, TokenTypeEnum } from '../enum/enum.js';
import { BadRequestException, UnAuthorizedException } from '../exceptions/Application.exception.js';
import { toObjectId } from './../utils/toObjectId';
import { NotFoundException } from './../exceptions/Application.exception';
import { IUser } from './../interface/IUser.interface';
import { randomUUID } from 'node:crypto';
type UserIdType = mongoose.Types.ObjectId | string;

export type JwtPayloadType = JwtPayload & {
    sub: string,
    aud: number[];
    jti: string;
    iat: number;
};
export class TokenService {
    private readonly userRepository: UserRepo;
    private readonly cacheService: CacheService;
    constructor() {
        this.userRepository = new UserRepo();
        this.cacheService = cacheService;
    }

    userBaseKey({ userId }: { userId: UserIdType; }) {
        return `User::${userId.toString()}`;
    }

    userBaseRevokeTokenKey({ userId }: { userId: UserIdType; }) {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }

    userRevokeTokenKey({ userId, jti }: { userId: UserIdType, jti: string; }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }

    async createToken({
        payload,
        options,
        secret = env.userAccessTokenSignature
    }: {
        payload: string | Buffer | object,
        options?: SignOptions,
        secret: Secret,
    }): Promise<string> {
        return jwt.sign(payload, secret, options);
    }

    async verifyToken({
        token,
        secret = env.userAccessTokenSignature
    }: {
        token: string,
        secret: Secret | PublicKey,
    }): Promise<JwtPayloadType> {
        return jwt.verify(token, secret) as JwtPayloadType;
    }

    async getTokenSignature({
        role = roleEnum.User
    }: {
        role: roleEnum;
    }): Promise<{ accessSignature: string, refreshSignature: string; }> {

        let signatures: { accessSignature: string, refreshSignature: string; };
        switch (role) {
            case roleEnum.Admin:
                signatures = { accessSignature: env.adminAcessTokenSignature, refreshSignature: env.admin_refresh_token_signature };
                break;
            default:
                signatures = { accessSignature: env.userAccessTokenSignature, refreshSignature: env.user_refresh_token_signature };
                break;


        }
        return signatures;
    }

    async getSignature({
        tokenType = TokenTypeEnum.Access,
        role = roleEnum.User
    }: {
        tokenType: TokenTypeEnum,
        role?: roleEnum;
    }): Promise<string> {


        const { accessSignature, refreshSignature } = await this.getTokenSignature({ role });
        return tokenType == TokenTypeEnum.Access ? accessSignature : refreshSignature;
    }

    async decodeToken({
        token,
        tokenType = TokenTypeEnum.Access
    }: {
        token: string,
        tokenType?: TokenTypeEnum;
    }): Promise<{ user: HydratedDocument<IUser>, payload: JwtPayloadType; }> {
        let decode = jwt.decode(token) as JwtPayloadType;
        let payload;
        payload = await this.verifyToken({
            token,
            secret: await this.getSignature({ tokenType, role: decode.aud![0] as unknown as roleEnum })
        });



        if (!payload.sub) {
            throw new BadRequestException('missing token payload');
        }

        if (await this.cacheService.exists({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti! }) })) {
            throw new UnAuthorizedException("Expired login credentials");
        }


        const user = await this.userRepository.findByID({ id: toObjectId(payload.sub) });


        if (!user) {
            throw new NotFoundException("Invalid user account");
        }

        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new UnAuthorizedException("Expired login credentials");
        }

        return { user, payload };
    }

    async createLoginCredentials({ user, issuer }: { user: HydratedDocument<IUser>, issuer: string; }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignature({ role: user.role });
        const jwtid = randomUUID();
        const accessToken = await this.createToken({
            payload: {},
            secret: accessSignature,
            options: {
                subject: user.id,
                issuer,
                audience: [user.role as unknown as string],
                expiresIn: env.access_token_expiresIN,
                jwtid
            }
        });

        const refreshToken = await this.createToken({
            payload: {},
            secret: refreshSignature,
            options: {
                subject: user.id,
                issuer,
                audience: [user.role as unknown as string],
                expiresIn: env.refresh_token_expiresIN,
                jwtid
            }
        });

        return { accessToken, refreshToken };
    }

    async createRevokeToken({ payload }: { payload: JwtPayloadType; }) {
        const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat);
        const refreshExpiresIn = payload.iat + env.refresh_token_expiresIN;
        const ttl = refreshExpiresIn - consumedTime; // left time
        await this.cacheService.set({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
        return;
    }

}

export const tokenService = new TokenService();