"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_js_1 = __importDefault(require("./auth.service.js"));
const successResponse_1 = require("./../../common/utils/successResponse");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const validator = __importStar(require("./auth.validation"));
const issuer_js_1 = require("../../common/utils/issuer.js");
const authentication_middleware_js_1 = require("../../middleware/authentication.middleware.js");
const router = (0, express_1.Router)();
router.post('/signup', (0, validation_middleware_1.validation)(validator.signupSchema), async (req, res, next) => {
    const data = await auth_service_js_1.default.signup(req.validate.body);
    return (0, successResponse_1.successResponse)({ res, data, status: 201 });
});
router.patch('/verify-account', (0, authentication_middleware_js_1.auth)(), (0, validation_middleware_1.validation)(validator.confirmEmailSchema), async (req, res) => {
    const { otp, email } = req.body;
    const response = await auth_service_js_1.default.verifyAccount({ email, otp });
    return (0, successResponse_1.successResponse)({ res, data: response, message: "email has been verified" });
});
router.post('/resend-verify-account', (0, authentication_middleware_js_1.auth)(), async (req, res) => {
    const { email } = req.body;
    const response = await auth_service_js_1.default.reSendVerifyAccount({ email });
    return (0, successResponse_1.successResponse)({ res, data: response, message: "an otp has been sent to your email" });
});
router.post('/login', (0, validation_middleware_1.validation)(validator.loginValidation), async (req, res, next) => {
    const data = await auth_service_js_1.default.login(req.validate.body, (0, issuer_js_1.getIssuer)(req));
    return (0, successResponse_1.successResponse)({ res, data, status: 201 });
});
router.post('/forget-password', (0, authentication_middleware_js_1.auth)(), (0, validation_middleware_1.validation)(validator.confirmEmailSchema), async (req, res) => {
    const { email } = req.body;
    const data = await auth_service_js_1.default.forgetPassword(email);
    return (0, successResponse_1.successResponse)({ res, data });
});
router.post('/verify-forget-password', (0, authentication_middleware_js_1.auth)(), (0, validation_middleware_1.validation)(validator.confirmEmailSchema), async (req, res) => {
    const { email, otp } = req.body;
    const data = await auth_service_js_1.default.verifyForgetPassword(otp, email);
    return (0, successResponse_1.successResponse)({ res, data });
});
router.patch('/reset-forget-password', (0, authentication_middleware_js_1.auth)(), (0, validation_middleware_1.validation)(validator.resetForgetPasswordSchema), async (req, res) => {
    const { email, otp, password } = req.body;
    const data = await auth_service_js_1.default.resetForgetPassword(otp, email, password);
    return (0, successResponse_1.successResponse)({ res, data });
});
router.post("/google", async (req, res) => {
    const { idToken } = req.body;
    const response = await auth_service_js_1.default.signupOrLoginWithGoogle(idToken, (0, issuer_js_1.getIssuer)(req));
    return (0, successResponse_1.successResponse)({ res, data: response, status: 201 });
});
exports.default = router;
