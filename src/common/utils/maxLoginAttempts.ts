import { number } from "zod";
import { EmailSubjectEnum } from "../enum/enum.js";
import { cacheService } from "../services/redis.service.js";
import { UserEmailTrialKey } from "./email/send.email.js";
import { BadRequestException, TooManyRequestsException } from './../exceptions/Application.exception';

export const maxLoginAttempts = async ({
    maxAttempts = 5,
    email,
    subject,
    blockTime = 300
}: {
    maxAttempts?: number,
    email: string,
    subject: EmailSubjectEnum,
    blockTime?: number;
}): Promise<void> => {
    let TTL_trial = await cacheService.ttl({ key: UserEmailTrialKey({ email, subject }) });
    console.log(TTL_trial);

    let count = await cacheService.get({ key: UserEmailTrialKey({ email, subject }) }) ?? 0;
    console.log(count);


    count = await cacheService.incrBy({ key: UserEmailTrialKey({ email, subject }), incrValue: 1 });
    // console.log(count, 'count');
    if (count == maxAttempts) {
        await cacheService.expire({ key: UserEmailTrialKey({ email, subject }), expireAfter: blockTime });
    }
    if (TTL_trial > 0) {
        throw new TooManyRequestsException(`you have reached the maximum attempts please try again after ${TTL_trial}`);
    }
    throw new BadRequestException("Invalid email or password");

};