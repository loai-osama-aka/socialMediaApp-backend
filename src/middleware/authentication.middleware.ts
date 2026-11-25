import { TokenTypeEnum } from "../common/enum/enum.js";
import { NextFunction, Request, Response } from 'express';
import { tokenService } from './../common/services/token.service';
import { BadRequestException, UnAuthorizedException } from "../common/exceptions/Application.exception.js";


export const bearerAuth = async ({
    req,
    tokenType = TokenTypeEnum.Access
}: {
    req: Request,
    tokenType: TokenTypeEnum;
}) => {
    const [key, token] = req.headers['authorization']?.split(" ") || [];
    const { user, payload } = await tokenService.decodeToken({ token: token as string, tokenType });
    req.user = user;
    req.payload = payload;
};

export const auth = (tokenType = TokenTypeEnum.Access) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new UnAuthorizedException("unauthorized account");
        }
        const [key, token] = authorization.split(" ") || [];

        switch (key) {
            case 'Bearer':
                await bearerAuth({ req, tokenType });
                next();

                break;

            default:
                throw new BadRequestException("INvalid authentication approach");
                break;
        }

    };
};