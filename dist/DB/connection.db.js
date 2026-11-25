"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConnection = databaseConnection;
const mongoose_1 = __importDefault(require("mongoose"));
const env_service_js_1 = require("../config/env.service.js");
async function databaseConnection(app) {
    mongoose_1.default
        .connect(env_service_js_1.env.databaseUri)
        .then(() => {
        console.log("connected to database");
        app.listen(env_service_js_1.env.port, () => {
            console.log(`server running on port ${env_service_js_1.env.port}`);
        });
    })
        .catch((error) => {
        console.log(error);
    });
}
