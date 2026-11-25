import mongoose from "mongoose";
import { genderEnum, providerEnum, roleEnum } from './../../common/enum/enum';
import { IUser } from './../../common/interface/IUser.interface';

const userSchema = new mongoose.Schema<IUser>(
    {
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
            required: function (): boolean {
                return this.provider == providerEnum.System;
            },
        },
        age: {
            type: Number,
        },
        phone: String,
        gender: {
            type: Number,
            enum: genderEnum,
            default: genderEnum.Male,
        },
        role: {
            type: Number,
            enum: roleEnum,
            default: roleEnum.User,
        },
        provider: {
            type: Number,
            enum: providerEnum,
            default: providerEnum.System,
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


    },
    { timestamps: true },
);
export const UserModel = mongoose.model<IUser>("user", userSchema);
