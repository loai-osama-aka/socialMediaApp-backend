"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("./../../common/enum/enum");
const userSchema = new mongoose_1.default.Schema({
    userName: {
        type: String,
        required: true,
        min: 3,
        max: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.provider == enum_1.providerEnum.System;
        },
    },
    age: {
        type: Number,
    },
    phone: String,
    gender: {
        type: Number,
        enum: enum_1.genderEnum,
        default: enum_1.genderEnum.Male,
    },
    role: {
        type: Number,
        enum: enum_1.roleEnum,
        default: enum_1.roleEnum.User,
    },
    provider: {
        type: Number,
        enum: enum_1.providerEnum,
        default: enum_1.providerEnum.System,
    },
    profileImage: {
        type: String,
    },
    convertImage: {
        type: [String],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    twoStepVerification: {
        type: Boolean,
        default: false
    },
    changeCredentialsTime: Date
}, { timestamps: true });
exports.UserModel = mongoose_1.default.model("user", userSchema);
