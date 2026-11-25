import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../common/exceptions/Application.exception.js";
import { ZodType } from "zod";


type validationSchemaType = ZodType;

export const validation = (schema: validationSchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // console.log(req.query);

        const validationResult = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            // files: req.files,
            // file: req.file,
        });

        // console.log(req.validation);
        if (!validationResult.success) {
            throw new BadRequestException('validation error', validationResult.error.issues);
        }
        // i reopen the request interface and add validate
        req.validate = validationResult.data;

        next();
    };
};
