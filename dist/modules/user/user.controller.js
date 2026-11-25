"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const successResponse_1 = require("./../../common/utils/successResponse");
const issuer_js_1 = require("../../common/utils/issuer.js");
const authentication_middleware_js_1 = require("../../middleware/authentication.middleware.js");
const enum_js_1 = require("../../common/enum/enum.js");
const user_service_js_1 = require("./user.service.js");
const router = (0, express_1.Router)();
router.get('/get-users', (0, authentication_middleware_js_1.auth)(), async (req, res) => {
    const data = await user_service_js_1.userService.getAllUser();
    return (0, successResponse_1.successResponse)({ res, data });
});
router.post('/rotate-token', (0, authentication_middleware_js_1.auth)(enum_js_1.TokenTypeEnum.Refresh), async (req, res) => {
    const data = await user_service_js_1.userService.rotateToken(req.payload, req.user, (0, issuer_js_1.getIssuer)(req));
    return (0, successResponse_1.successResponse)({ res, data });
});
router.post('/logout', (0, authentication_middleware_js_1.auth)(), async (req, res) => {
    const data = await user_service_js_1.userService.logout(req.payload, req.user, req.body);
    return (0, successResponse_1.successResponse)({ res, data });
});
exports.default = router;
