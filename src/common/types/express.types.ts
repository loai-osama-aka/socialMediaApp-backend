import { HydratedDocument } from "mongoose";
import { JwtPayloadType } from "../services/token.service.js";
import { IUser } from './../interface/IUser.interface';

declare module "express-serve-static-core" {
    interface Request {
        validate: any;
        user: HydratedDocument<IUser>;
        payload: JwtPayloadType;
    }
}