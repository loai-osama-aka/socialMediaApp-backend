"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const Application_exception_js_1 = require("../../common/exceptions/Application.exception.js");
const env_service_js_1 = require("../../config/env.service.js");
const token_service_1 = require("./../../common/services/token.service");
const redis_service_1 = require("./../../common/services/redis.service");
const enum_js_1 = require("../../common/enum/enum.js");
const user_repository_1 = require("./../../common/Repository/user.repository");
class UserService {
    tokenService;
    userRepository;
    casheService;
    constructor() {
        this.tokenService = token_service_1.tokenService;
        this.casheService = redis_service_1.cacheService;
        this.userRepository = new user_repository_1.UserRepo();
    }
    async getAllUser() {
        const users = await this.userRepository.find({});
        return users;
    }
    async rotateToken(payload, user, issuer) {
        console.log({ payload, user });
        const expireAccessAt = (payload.iat + env_service_js_1.env.access_token_expiresIN) * 1000;
        const currentTime = Date.now() + (5 * 60000);
        if (currentTime < expireAccessAt) {
            throw new Application_exception_js_1.ConflictException('sorry we cannot create new  login credentials while current access token still valid');
        }
        const { accessToken, refreshToken } = await this.tokenService.createLoginCredentials({ user, issuer });
        await token_service_1.tokenService.createRevokeToken({ payload });
        return { accessToken, refreshToken };
    }
    async logout(payload, user, { action = enum_js_1.LogoutEnum.Device }) {
        switch (action) {
            case enum_js_1.LogoutEnum.All:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.casheService.del({ key: await this.casheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }) }) });
                break;
            default:
                await this.tokenService.createRevokeToken({ payload });
                break;
        }
        return;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
