"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const user_repository_1 = require("./../Repository/user.repository");
const redis_service_1 = require("./redis.service");
const env_service_1 = require("./../../config/env.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enum_js_1 = require("../enum/enum.js");
const Application_exception_js_1 = require("../exceptions/Application.exception.js");
const toObjectId_1 = require("./../utils/toObjectId");
const Application_exception_1 = require("./../exceptions/Application.exception");
const node_crypto_1 = require("node:crypto");
class TokenService {
    userRepository;
    cacheService;
    constructor() {
        this.userRepository = new user_repository_1.UserRepo();
        this.cacheService = redis_service_1.cacheService;
    }
    userBaseKey({ userId }) {
        return `User::${userId.toString()}`;
    }
    userBaseRevokeTokenKey({ userId }) {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }
    userRevokeTokenKey({ userId, jti }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    async createToken({ payload, options, secret = env_service_1.env.userAccessTokenSignature }) {
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    async verifyToken({ token, secret = env_service_1.env.userAccessTokenSignature }) {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    async getTokenSignature({ role = enum_js_1.roleEnum.User }) {
        let signatures;
        switch (role) {
            case enum_js_1.roleEnum.Admin:
                signatures = { accessSignature: env_service_1.env.adminAcessTokenSignature, refreshSignature: env_service_1.env.admin_refresh_token_signature };
                break;
            default:
                signatures = { accessSignature: env_service_1.env.userAccessTokenSignature, refreshSignature: env_service_1.env.user_refresh_token_signature };
                break;
        }
        return signatures;
    }
    async getSignature({ tokenType = enum_js_1.TokenTypeEnum.Access, role = enum_js_1.roleEnum.User }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignature({ role });
        return tokenType == enum_js_1.TokenTypeEnum.Access ? accessSignature : refreshSignature;
    }
    async decodeToken({ token, tokenType = enum_js_1.TokenTypeEnum.Access }) {
        let decode = jsonwebtoken_1.default.decode(token);
        let payload;
        payload = await this.verifyToken({
            token,
            secret: await this.getSignature({ tokenType, role: decode.aud[0] })
        });
        if (!payload.sub) {
            throw new Application_exception_js_1.BadRequestException('missing token payload');
        }
        if (await this.cacheService.exists({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
            throw new Application_exception_js_1.UnAuthorizedException("Expired login credentials");
        }
        const user = await this.userRepository.findByID({ id: (0, toObjectId_1.toObjectId)(payload.sub) });
        if (!user) {
            throw new Application_exception_1.NotFoundException("Invalid user account");
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new Application_exception_js_1.UnAuthorizedException("Expired login credentials");
        }
        return { user, payload };
    }
    async createLoginCredentials({ user, issuer }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignature({ role: user.role });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const accessToken = await this.createToken({
            payload: {},
            secret: accessSignature,
            options: {
                subject: user.id,
                issuer,
                audience: [user.role],
                expiresIn: env_service_1.env.access_token_expiresIN,
                jwtid
            }
        });
        const refreshToken = await this.createToken({
            payload: {},
            secret: refreshSignature,
            options: {
                subject: user.id,
                issuer,
                audience: [user.role],
                expiresIn: env_service_1.env.refresh_token_expiresIN,
                jwtid
            }
        });
        return { accessToken, refreshToken };
    }
    async createRevokeToken({ payload }) {
        const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat);
        const refreshExpiresIn = payload.iat + env_service_1.env.refresh_token_expiresIN;
        const ttl = refreshExpiresIn - consumedTime;
        await this.cacheService.set({ key: this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
        return;
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
