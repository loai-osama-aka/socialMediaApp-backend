"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modules_1 = require("./modules");
const error_middleware_1 = require("./middleware/error.middleware");
const connection_db_1 = require("./DB/connection.db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
(0, connection_db_1.databaseConnection)(app);
app.use('/auth', modules_1.authRouter);
app.use('/user', modules_1.userRouter);
app.use(error_middleware_1.globalErrorHandling);
