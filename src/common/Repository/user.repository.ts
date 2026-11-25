import { IUser } from "../interface/IUser.interface";
import { DatabaseRepo } from "./base.repository";
import { UserModel } from "../../DB/model/user.model";

export class UserRepo extends DatabaseRepo<IUser> {
    constructor() {
        super(UserModel);
    }


} 