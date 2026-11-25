import { NextFunction, Request, Response } from "express";
import { ForebiddenException } from "../common/exceptions/Application.exception.js";
import { roleEnum } from "../common/enum/enum.js";

export const authorization = (role: roleEnum) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.user.role < role) {
            throw new ForebiddenException("not Allowed");
        }
    };
};