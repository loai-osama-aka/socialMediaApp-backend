import nodemailer from "nodemailer";
import { env } from "../../../config/env.service.js";
import { BadRequestException } from "../../exceptions/Application.exception.js";
import { EmailSubjectEnum } from "../../enum/enum.js";


export const UserEmailKey = ({ email, subject }: { email: string, subject: EmailSubjectEnum; }): string => {
    return `User::${email}::${subject}::OTP`;
};
// key for trial attempts
export const UserEmailTrialKey = ({ email, subject }: { email: string, subject: EmailSubjectEnum; }): string => {
    return `User::${email}::${subject}::trials`;
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.sendEmail,
        pass: env.pass
    }
});


export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments = []
}: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    text?: string;
    subject: string;
    html?: string;
    attachments?: any[];
}) => {

    if (!to?.length && !cc?.length && !bcc?.length) {
        throw new BadRequestException("invalid recipients");
    }

    if (!html?.length && !text?.length && !attachments.length) {
        throw new BadRequestException("invalid content");
    }

    return await transporter.sendMail({
        from: `"Social Media" <${env.sendEmail}>`,
        to,
        cc,
        bcc,
        attachments,
        subject,
        html,
        text
    });
};
