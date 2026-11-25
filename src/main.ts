import express from "express";
import { authRouter, userRouter } from "./modules";
import { globalErrorHandling } from './middleware/error.middleware';
import { databaseConnection } from "./DB/connection.db";

const app: express.Application = express();
app.use(express.json());
databaseConnection(app);
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use(globalErrorHandling);

