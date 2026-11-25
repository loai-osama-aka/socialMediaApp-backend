"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const base_repository_1 = require("./base.repository");
const user_model_1 = require("../../DB/model/user.model");
class UserRepo extends base_repository_1.DatabaseRepo {
    constructor() {
        super(user_model_1.UserModel);
    }
}
exports.UserRepo = UserRepo;
