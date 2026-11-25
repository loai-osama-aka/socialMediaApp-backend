// export interface ISignup {
//     userName: string,
//     email: string,
//     age: number,
//     phone: string,
//     password: string;
//     confirmPassword: string;
// }
import z from "zod";
import { confirmEmailSchema, loginValidation, signupSchema } from "../auth.validation";
import { ResendConfirmEmailSchema } from './../auth.validation';

export type signupTypeDTO = z.infer<typeof signupSchema>;
export type confirmEmailTypeDTO = z.infer<typeof confirmEmailSchema>['body'];
export type ResendConfirmEmailTypeDTO = z.infer<typeof ResendConfirmEmailSchema>['body'];
export type LoginDto = z.infer<typeof loginValidation>['body'];