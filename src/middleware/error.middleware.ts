import { NextFunction, Request, Response } from "express";
import { IError } from "../common/interface/IError.interface";



export const globalErrorHandling = (error: IError, req: Request, res: Response, next: NextFunction): Response => {
    // console.log(error.status);

    return res.status(error.status ?? 500).json({ error_message: error.message || 'server error', cause: error.cause, error, stack: error.stack });
};
