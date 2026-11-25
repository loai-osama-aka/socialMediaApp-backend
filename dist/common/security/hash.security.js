"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const env_service_js_1 = require("../../config/env.service.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateHash = async ({ plainText, salt = env_service_js_1.env.saltRounds }) => {
    const hashedPassword = await bcrypt_1.default.hash(plainText, Number(salt));
    return hashedPassword;
};
exports.generateHash = generateHash;
const compareHash = async ({ plainText, hashedPassword }) => {
    const isMatched = await bcrypt_1.default.compare(plainText, hashedPassword);
    return isMatched;
};
exports.compareHash = compareHash;
