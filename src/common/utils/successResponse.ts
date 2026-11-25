import { Response } from "express";
import { IResponse } from './../interface/IResponse.interface';


export const successResponse = ({ res, message = 'done', data, status = 200 }: IResponse) => {
    return res.status(status).json({ message, status, data });
};