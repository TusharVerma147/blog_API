import bcrypt from "bcryptjs";
import { AUTH } from "../constants/auth";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
