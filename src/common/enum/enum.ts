export enum genderEnum {
    Male,
    Female,
};
export enum roleEnum {
    User,
    Admin,
};
export enum providerEnum {
    System,
    google,
};

export enum StatusEnum {
    Pending,
    Accepted,
    Rejected
};

export enum EmailSubjectEnum {
    CONFIRM_EMAIL = "Confirm email",
    FORGOT_PASSWORD = "Forget Password",
    LOGIN_ATTEMPTS = "loginAttempts",
    TWO_STEP_VERIFICATION = "twoStepVerify"
}

export enum TokenTypeEnum {
    Access,
    Refresh
}

export enum LogoutEnum {
    Device,
    All
}