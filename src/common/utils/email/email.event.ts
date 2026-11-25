import { EventEmitter } from 'node:events';
import { sendEmail } from './send.email';
import { EmailSubjectEnum } from '../../enum/enum.js';

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    recipients,
    html
}: {
    subject: EmailSubjectEnum,
    recipients: { to: string[], cc?: string[], bcc?: string[]; },
    html: string;
}) => {
    try {
        console.log(recipients, "recipients");

        await sendEmail({ ...recipients, subject, html });

    } catch (error) {
        console.error("Failed to send email:", error);

    }
});