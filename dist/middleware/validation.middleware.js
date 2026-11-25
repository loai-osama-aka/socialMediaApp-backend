"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const Application_exception_js_1 = require("../common/exceptions/Application.exception.js");
const validation = (schema) => {
    return (req, res, next) => {
        const validationResult = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        if (!validationResult.success) {
            throw new Application_exception_js_1.BadRequestException('validation error', validationResult.error.issues);
        }
        req.validate = validationResult.data;
        next();
    };
};
exports.validation = validation;
