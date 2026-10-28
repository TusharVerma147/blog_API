import { IUser } from "../model/User";
import { AuthUser } from "../types/express";

export function sanitizeUser(user: IUser | AuthUser) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
