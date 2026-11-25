import { createClient, RedisClientType } from "redis";
import { env } from '../../config/env.service';

export class CacheService {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({ url: env.redisUri });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
            console.log("Redis Connection stablished successfully");
        } catch (error) { console.log(error); }
    }

    // get
    async get({ key }: { key: string; }) {
        let value = await this.client.get(key);
        try {
            value = JSON.parse(value as string);

            return value;

        } catch (error) {


            return value;
        }
    }
    // set
    async set({ key, value, ttl = undefined }: { key: string, value: any, ttl?: number | undefined; }) {
        if (typeof (value) == 'object') {
            value = JSON.stringify(value);
        }
        return await this.client.set(key, value, ttl ? { EX: ttl } : {});
    }
    // exist
    async exists({ key }: { key: string; }) {

        return await this.client.exists(key);
    }
    // update
    async update({ key, value, ttl = undefined }: { key: string, value: any, ttl?: number; }) {
        if (!await this.exists({ key })) {
            return 0;
        }

        return await this.set({ key, value, ttl });
    }
    // del
    async del({ key }: { key: string | string[]; }) {
        return await this.client.del(key);
    }
    // keys
    async keys({ prefix }: { prefix: string; }) {

        return await this.client.keys(`${prefix}*`);
    }
    // ttl
    async ttl({ key }: { key: string; }) {

        return await this.client.ttl(key);
    }
    // expire
    async expire({ key, expireAfter }: { key: string, expireAfter: number; }) {

        return await this.client.expire(key, expireAfter);
    }

    async incrBy({ key, incrValue = 1 }: { key: string, incrValue?: number; }) {

        return await this.client.incrBy(key, incrValue);
    }

}

export const cacheService = new CacheService();