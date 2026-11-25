import { genderEnum, providerEnum, roleEnum } from "../enum/enum";

export interface IUser {
    userName: string;
    email: string;
    password: string;
    gender: genderEnum;
    role: roleEnum;
    provider: providerEnum;
    age?: number;
    phone?: string;
    profileImage?: string;
    convertImage?: string[];
    isVerified?: boolean;
    twoStepVerification?: boolean;
    changeCredentialsTime?: Date;
    createdAt?: string;
    updatedAt?: string;
}

