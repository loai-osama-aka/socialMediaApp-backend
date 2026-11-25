import { NextFunction, Request, Response, Router } from "express";
import { successResponse } from './../../common/utils/successResponse';
import { validation } from "../../middleware/validation.middleware";

import { IUser } from "../../common/interface/IUser.interface";
import { getIssuer } from "../../common/utils/issuer.js";
import { auth } from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../common/enum/enum.js";
import { userService } from "./user.service.js";

const router = Router();


router.get('/get-users', auth(), async (req: Request, res: Response) => {
    const data = await userService.getAllUser();
    return successResponse({ res, data });
});

router.post('/rotate-token', auth(TokenTypeEnum.Refresh), async (req: Request, res: Response) => {
    const data = await userService.rotateToken(req.payload, req.user, getIssuer(req));
    return successResponse({ res, data });
});

router.post('/logout', auth(), async (req: Request, res: Response) => {
    const data = await userService.logout(req.payload, req.user, req.body);
    return successResponse({ res, data });
});



export default router;