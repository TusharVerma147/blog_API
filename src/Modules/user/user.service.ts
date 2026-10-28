import { Types } from "mongoose";
import { userRepository } from "../../Repository/user.repository";
import { sanitizeUser } from "../../utils/sanitizeUser";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { AuthUser } from "../../types/express";
import { UpdateMeInput } from "./user.validation";

export class UserService {
  getMe(user: AuthUser) {
    return sanitizeUser(user);
  }

  async updateMe(userId: Types.ObjectId, input: UpdateMeInput) {
    const updated = await userRepository.updateName(userId, input.name);

    if (!updated) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    return sanitizeUser(updated);
  }
}

export const userService = new UserService();
