"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const Application_exception_js_1 = require("../common/exceptions/Application.exception.js");
const authorization = (role) => {
    return async (req, res, next) => {
        if (req.user.role < role) {
            throw new Application_exception_js_1.ForebiddenException("not Allowed");
        }
    };
};
exports.authorization = authorization;
