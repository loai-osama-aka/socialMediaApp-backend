"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const env_service_1 = require("./../../config/env.service");
const encrypt = async (plainText) => {
    const iv = node_crypto_1.default.randomBytes(env_service_1.env.iv_Length);
    const cipherIv = node_crypto_1.default.createCipheriv('aes-256-cbc', env_service_1.env.ENC_KEY, iv);
    let cipherText = cipherIv.update(plainText, 'utf-8', 'hex');
    cipherText += cipherIv.final('hex');
    return `${iv.toString('hex')}::${cipherText}`;
};
exports.encrypt = encrypt;
const decrypt = async (cipherText) => {
    let [iv, encryptedData] = cipherText.split("::");
    iv = Buffer.from(iv, 'hex');
    const deCipherIv = node_crypto_1.default.createDecipheriv('aes-256-cbc', env_service_1.env.ENC_KEY, iv);
    let plainText = deCipherIv.update(encryptedData, 'hex', 'utf-8');
    plainText += deCipherIv.final('utf-8');
    return plainText;
};
exports.decrypt = decrypt;
