import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export const encrypt = async (data: Buffer, secretKey: string) => {
  const algorithm = 'aes-256-ctr';

  const iv = randomBytes(16);

  const key = (await promisify(scrypt)(secretKey, 'salt', 32)) as Buffer;

  const cipher = createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]);

  return encrypted;
};

export const decrypt = async (data: Buffer, secretKey: string) => {
  const algorithm = 'aes-256-ctr';
  const iv = data.subarray(0, 16);
  const encrypted = data.subarray(16);

  const key = (await promisify(scrypt)(secretKey, 'salt', 32)) as Buffer;

  const decipher = createDecipheriv(algorithm, key, iv);

  const decrpyted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrpyted;
};
