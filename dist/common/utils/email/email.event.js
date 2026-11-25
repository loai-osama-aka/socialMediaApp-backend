"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const send_email_1 = require("./send.email");
const enum_js_1 = require("../../enum/enum.js");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ subject = enum_js_1.EmailSubjectEnum.CONFIRM_EMAIL, recipients, html }) => {
    try {
        console.log(recipients, "recipients");
        await (0, send_email_1.sendEmail)({ ...recipients, subject, html });
    }
    catch (error) {
        console.error("Failed to send email:", error);
    }
});
