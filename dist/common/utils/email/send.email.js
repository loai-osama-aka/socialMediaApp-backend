"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.UserEmailTrialKey = exports.UserEmailKey = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_service_js_1 = require("../../../config/env.service.js");
const Application_exception_js_1 = require("../../exceptions/Application.exception.js");
const UserEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}::OTP`;
};
exports.UserEmailKey = UserEmailKey;
const UserEmailTrialKey = ({ email, subject }) => {
    return `User::${email}::${subject}::trials`;
};
exports.UserEmailTrialKey = UserEmailTrialKey;
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: env_service_js_1.env.sendEmail,
        pass: env_service_js_1.env.pass
    }
});
const sendEmail = async ({ to, cc, bcc, subject, text, html, attachments = [] }) => {
    if (!to?.length && !cc?.length && !bcc?.length) {
        throw new Application_exception_js_1.BadRequestException("invalid recipients");
    }
    if (!html?.length && !text?.length && !attachments.length) {
        throw new Application_exception_js_1.BadRequestException("invalid content");
    }
    return await transporter.sendMail({
        from: `"Social Media" <${env_service_js_1.env.sendEmail}>`,
        to,
        cc,
        bcc,
        attachments,
        subject,
        html,
        text
    });
};
exports.sendEmail = sendEmail;
