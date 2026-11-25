import { NextFunction, Request, Response, Router } from "express";
import authService from "./auth.service.js";
import { successResponse } from './../../common/utils/successResponse';
import { validation } from "../../middleware/validation.middleware";
import * as validator from './auth.validation';
import { IUser } from "../../common/interface/IUser.interface";
import { getIssuer } from "../../common/utils/issuer.js";
import { auth } from "../../middleware/authentication.middleware.js";

const router = Router();

router.post('/signup', validation(validator.signupSchema), async (req: Request, res: Response, next: NextFunction): Promise<Response<IUser>> => {
    const data = await authService.signup(req.validate.body);
    return successResponse({ res, data, status: 201 });
});

//verify email
router.patch('/verify-account', auth(), validation(validator.confirmEmailSchema), async (req, res) => {
    const { otp, email } = req.body;
    const response = await authService.verifyAccount({ email, otp });
    return successResponse({ res, data: response, message: "email has been verified" });
});

//resend verify email
router.post('/resend-verify-account', auth(), async (req, res) => {
    const { email } = req.body;
    const response = await authService.reSendVerifyAccount({ email });
    return successResponse({ res, data: response, message: "an otp has been sent to your email" });

});

// LOGIN
router.post('/login', validation(validator.loginValidation), async (req: Request, res: Response, next: NextFunction): Promise<Response<{ accessToken: string, refreshToken: string; }>> => {
    const data = await authService.login(req.validate.body, getIssuer(req));
    return successResponse({ res, data, status: 201 });
});



//forgetPassword
router.post('/forget-password', auth(), validation(validator.confirmEmailSchema), async (req, res) => {
    const { email } = req.body;
    const data = await authService.forgetPassword(email);
    return successResponse({ res, data });
});

//verifyForgetPassword
router.post('/verify-forget-password', auth(), validation(validator.confirmEmailSchema), async (req, res) => {
    const { email, otp } = req.body;
    const data = await authService.verifyForgetPassword(otp, email);
    return successResponse({ res, data });
});

//reset password 
router.patch('/reset-forget-password', auth(), validation(validator.resetForgetPasswordSchema), async (req, res) => {
    const { email, otp, password } = req.body;
    const data = await authService.resetForgetPassword(otp, email, password);
    return successResponse({ res, data });
});

// signup & login using google
router.post("/google", async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const response = await authService.signupOrLoginWithGoogle(idToken, getIssuer(req));
    return successResponse({ res, data: response, status: 201 });
});




export default router;