"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("redis");
const env_service_1 = require("../../config/env.service");
class CacheService {
    client;
    constructor() {
        this.client = (0, redis_1.createClient)({ url: env_service_1.env.redisUri });
        this.connect();
    }
    async connect() {
        try {
            await this.client.connect();
            console.log("Redis Connection stablished successfully");
        }
        catch (error) {
            console.log(error);
        }
    }
    async get({ key }) {
        let value = await this.client.get(key);
        try {
            value = JSON.parse(value);
            return value;
        }
        catch (error) {
            return value;
        }
    }
    async set({ key, value, ttl = undefined }) {
        if (typeof (value) == 'object') {
            value = JSON.stringify(value);
        }
        return await this.client.set(key, value, ttl ? { EX: ttl } : {});
    }
    async exists({ key }) {
        return await this.client.exists(key);
    }
    async update({ key, value, ttl = undefined }) {
        if (!await this.exists({ key })) {
            return 0;
        }
        return await this.set({ key, value, ttl });
    }
    async del({ key }) {
        return await this.client.del(key);
    }
    async keys({ prefix }) {
        return await this.client.keys(`${prefix}*`);
    }
    async ttl({ key }) {
        return await this.client.ttl(key);
    }
    async expire({ key, expireAfter }) {
        return await this.client.expire(key, expireAfter);
    }
    async incrBy({ key, incrValue = 1 }) {
        return await this.client.incrBy(key, incrValue);
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
