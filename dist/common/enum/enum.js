"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutEnum = exports.TokenTypeEnum = exports.EmailSubjectEnum = exports.StatusEnum = exports.providerEnum = exports.roleEnum = exports.genderEnum = void 0;
var genderEnum;
(function (genderEnum) {
    genderEnum[genderEnum["Male"] = 0] = "Male";
    genderEnum[genderEnum["Female"] = 1] = "Female";
})(genderEnum || (exports.genderEnum = genderEnum = {}));
;
var roleEnum;
(function (roleEnum) {
    roleEnum[roleEnum["User"] = 0] = "User";
    roleEnum[roleEnum["Admin"] = 1] = "Admin";
})(roleEnum || (exports.roleEnum = roleEnum = {}));
;
var providerEnum;
(function (providerEnum) {
    providerEnum[providerEnum["System"] = 0] = "System";
    providerEnum[providerEnum["google"] = 1] = "google";
})(providerEnum || (exports.providerEnum = providerEnum = {}));
;
var StatusEnum;
(function (StatusEnum) {
    StatusEnum[StatusEnum["Pending"] = 0] = "Pending";
    StatusEnum[StatusEnum["Accepted"] = 1] = "Accepted";
    StatusEnum[StatusEnum["Rejected"] = 2] = "Rejected";
})(StatusEnum || (exports.StatusEnum = StatusEnum = {}));
;
var EmailSubjectEnum;
(function (EmailSubjectEnum) {
    EmailSubjectEnum["CONFIRM_EMAIL"] = "Confirm email";
    EmailSubjectEnum["FORGOT_PASSWORD"] = "Forget Password";
    EmailSubjectEnum["LOGIN_ATTEMPTS"] = "loginAttempts";
    EmailSubjectEnum["TWO_STEP_VERIFICATION"] = "twoStepVerify";
})(EmailSubjectEnum || (exports.EmailSubjectEnum = EmailSubjectEnum = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["Access"] = 0] = "Access";
    TokenTypeEnum[TokenTypeEnum["Refresh"] = 1] = "Refresh";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum[LogoutEnum["Device"] = 0] = "Device";
    LogoutEnum[LogoutEnum["All"] = 1] = "All";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
