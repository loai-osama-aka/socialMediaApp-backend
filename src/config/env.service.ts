import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(`./.env.${process.env.NODE_ENV}`) });

const port: number = parseInt(process.env.PORT ?? "5000");
const saltRounds: number = parseInt(process.env.SALT_ROUNDS ?? "10");
const databaseUri: string = process.env.DATABASE_URI as string;
const redisUri: string = process.env.REDIS_URI as string;
const mood: string = process.env.MOOD as string;

const iv_Length: number = parseInt(process.env.IV_LENGTH ?? "16") as number;
const ENC_KEY: string = process.env.ENC_KEY as string;

// access token
const userAccessTokenSignature: string = process.env.USER_ACCESS_TOKEN_SIGNATURE as string;
const adminAcessTokenSignature: string = process.env.ADMIN_ACCESS_TOKEN_SIGNATURE as string;
const access_token_expiresIN: number = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m');

// refresh token
const user_refresh_token_signature: string = process.env.USER_REFRESH_TOKEN_SIGNATURE as string;
const admin_refresh_token_signature: string = process.env.ADMIN_REFRESH_TOKEN_SIGNATURE as string;
const refresh_token_expiresIN: number = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1m");


//send email
const sendEmail: string = process.env.SEND_EMAIL as string;
const pass: string = process.env.APP_PASS as string;

// GOOGLE_CLIENT_ID
const googleClientId: string = process.env.GOOGLE_CLIENT_ID as string;

export const env = {
  port,
  databaseUri,
  redisUri,
  saltRounds,
  mood,
  userAccessTokenSignature,
  adminAcessTokenSignature,
  access_token_expiresIN,
  user_refresh_token_signature,
  admin_refresh_token_signature,
  refresh_token_expiresIN,
  sendEmail,
  pass,
  googleClientId,
  iv_Length,
  ENC_KEY
};
