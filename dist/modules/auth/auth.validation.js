"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForgetPasswordSchema = exports.ResendConfirmEmailSchema = exports.confirmEmailSchema = exports.signupSchema = exports.loginValidation = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .email({ message: "Please enter a valid Gmail address" })
        .refine((email) => email.endsWith("@gmail.com"), {
        message: "Email must be a Gmail address",
    }),
    password: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/)
});
exports.loginValidation = zod_1.z.object({
    body: exports.loginSchema,
    query: zod_1.z.object({
        lang: zod_1.z.enum(['ar', 'en']).default('ar')
    }),
});
exports.signupSchema = zod_1.z.object({
    body: exports.loginSchema.extend({
        confirmPassword: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/),
        userName: zod_1.z.string().min(2, { message: "minimum username length is 2 char" }),
        phone: zod_1.z.e164(),
        age: zod_1.z.number(),
        gender: zod_1.z.enum(['0', '1'], { message: "enter 0 for male or 1 for female" }).default('0').optional(),
    }).refine((data) => {
        return data.password === data.confirmPassword;
    }, { message: 'password mismatch with confirm password' }),
});
exports.confirmEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .email({ message: "Please enter a valid Gmail address" })
            .refine((email) => email.endsWith("@gmail.com"), {
            message: "Email must be a Gmail address",
        }),
        otp: zod_1.z.string().regex(/^\d{6}$/, {
            message: "OTP must be  6 digits",
        })
    }),
});
exports.ResendConfirmEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .email({ message: "Please enter a valid Gmail address" })
            .refine((email) => email.endsWith("@gmail.com"), {
            message: "Email must be a Gmail address",
        }),
    }),
});
exports.resetForgetPasswordSchema = zod_1.z.object({
    body: zod_1.z.strictObject({
        email: zod_1.z
            .email({ message: "Please enter a valid Gmail address" })
            .refine((email) => email.endsWith("@gmail.com"), {
            message: "Email must be a Gmail address",
        }),
        otp: zod_1.z.string().regex(/[\d]{5,6}/),
        password: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/),
        confirmPassword: zod_1.z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/)
    }).refine((data) => {
        return data.password == data.confirmPassword;
    }, { message: 'password mismatch with confirm password' })
});
