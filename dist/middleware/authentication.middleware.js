"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.bearerAuth = void 0;
const enum_js_1 = require("../common/enum/enum.js");
const token_service_1 = require("./../common/services/token.service");
const Application_exception_js_1 = require("../common/exceptions/Application.exception.js");
const bearerAuth = async ({ req, tokenType = enum_js_1.TokenTypeEnum.Access }) => {
    const [key, token] = req.headers['authorization']?.split(" ") || [];
    const { user, payload } = await token_service_1.tokenService.decodeToken({ token: token, tokenType });
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const auth = (tokenType = enum_js_1.TokenTypeEnum.Access) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new Application_exception_js_1.UnAuthorizedException("unauthorized account");
        }
        const [key, token] = authorization.split(" ") || [];
        switch (key) {
            case 'Bearer':
                await (0, exports.bearerAuth)({ req, tokenType });
                next();
                break;
            default:
                throw new Application_exception_js_1.BadRequestException("INvalid authentication approach");
                break;
        }
    };
};
exports.auth = auth;
