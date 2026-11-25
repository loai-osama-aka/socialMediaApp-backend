"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxLoginAttempts = void 0;
const redis_service_js_1 = require("../services/redis.service.js");
const send_email_js_1 = require("./email/send.email.js");
const Application_exception_1 = require("./../exceptions/Application.exception");
const maxLoginAttempts = async ({ maxAttempts = 5, email, subject, blockTime = 300 }) => {
    let TTL_trial = await redis_service_js_1.cacheService.ttl({ key: (0, send_email_js_1.UserEmailTrialKey)({ email, subject }) });
    console.log(TTL_trial);
    let count = await redis_service_js_1.cacheService.get({ key: (0, send_email_js_1.UserEmailTrialKey)({ email, subject }) }) ?? 0;
    console.log(count);
    count = await redis_service_js_1.cacheService.incrBy({ key: (0, send_email_js_1.UserEmailTrialKey)({ email, subject }), incrValue: 1 });
    if (count == maxAttempts) {
        await redis_service_js_1.cacheService.expire({ key: (0, send_email_js_1.UserEmailTrialKey)({ email, subject }), expireAfter: blockTime });
    }
    if (TTL_trial > 0) {
        throw new Application_exception_1.TooManyRequestsException(`you have reached the maximum attempts please try again after ${TTL_trial}`);
    }
    throw new Application_exception_1.BadRequestException("Invalid email or password");
};
exports.maxLoginAttempts = maxLoginAttempts;
