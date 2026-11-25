"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(`./.env.${process.env.NODE_ENV}`) });
const port = parseInt(process.env.PORT ?? "5000");
const saltRounds = parseInt(process.env.SALT_ROUNDS ?? "10");
const databaseUri = process.env.DATABASE_URI;
const redisUri = process.env.REDIS_URI;
const mood = process.env.MOOD;
const iv_Length = parseInt(process.env.IV_LENGTH ?? "16");
const ENC_KEY = process.env.ENC_KEY;
const userAccessTokenSignature = process.env.USER_ACCESS_TOKEN_SIGNATURE;
const adminAcessTokenSignature = process.env.ADMIN_ACCESS_TOKEN_SIGNATURE;
const access_token_expiresIN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m');
const user_refresh_token_signature = process.env.USER_REFRESH_TOKEN_SIGNATURE;
const admin_refresh_token_signature = process.env.ADMIN_REFRESH_TOKEN_SIGNATURE;
const refresh_token_expiresIN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1m");
const sendEmail = process.env.SEND_EMAIL;
const pass = process.env.APP_PASS;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
exports.env = {
    port,
    databaseUri,
    redisUri,
    saltRounds,
    mood,
    userAccessTokenSignature,
    adminAcessTokenSignature,
    access_token_expiresIN,
    user_refresh_token_signature,
    admin_refresh_token_signature,
    refresh_token_expiresIN,
    sendEmail,
    pass,
    googleClientId,
    iv_Length,
    ENC_KEY
};
