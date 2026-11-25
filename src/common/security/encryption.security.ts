import crypto from 'node:crypto';
import { env } from './../../config/env.service';

export const encrypt = async (plainText: string): Promise<string> => {
    const iv = crypto.randomBytes(env.iv_Length);
    const cipherIv = crypto.createCipheriv('aes-256-cbc', env.ENC_KEY, iv);
    let cipherText = cipherIv.update(plainText, 'utf-8', 'hex');
    cipherText += cipherIv.final('hex');
    return `${iv.toString('hex')}::${cipherText}`;
};


export const decrypt = async (cipherText: string): Promise<string> => {
    let [iv, encryptedData] = cipherText.split("::") as [string | Buffer, string];
    iv = Buffer.from(iv as string, 'hex');

    const deCipherIv = crypto.createDecipheriv('aes-256-cbc', env.ENC_KEY, iv);
    let plainText = deCipherIv.update(encryptedData, 'hex', 'utf-8');
    plainText += deCipherIv.final('utf-8');
    return plainText;
};