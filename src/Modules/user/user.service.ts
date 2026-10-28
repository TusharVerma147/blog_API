import { Types } from "mongoose";
import { userRepository } from "../../Repository/user.repository";
import { sanitizeUser } from "../../utils/sanitizeUser";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { redisKeys, REDIS_TTL } from "../../constants/redis";
import { getJSON, setJSON, delKeys } from "../../utils/cache";
import { AuthUser } from "../../types/express";
import { UpdateMeInput } from "./user.validation";

type PublicProfile = ReturnType<typeof sanitizeUser>;

export class UserService {
  async getMe(
    user: AuthUser
  ): Promise<{ profile: PublicProfile; cacheStatus: "HIT" | "MISS" }> {
    const key = redisKeys.userProfile(user._id.toString());
    console.log("[Redis] GET /users/me — checking profile cache...");
    const cached = await getJSON<PublicProfile>(key);

    if (cached) {
      console.log("[Redis] Profile cache HIT");
      return { profile: cached, cacheStatus: "HIT" };
    }

    console.log("[Redis] Profile cache MISS — will save profile for 1 hour");
    const profile = sanitizeUser(user);
    await setJSON(key, profile, REDIS_TTL.USER_PROFILE);

    return { profile, cacheStatus: "MISS" };
  }

  async updateMe(userId: Types.ObjectId, input: UpdateMeInput) {
    const updated = await userRepository.updateName(userId, input.name);

    if (!updated) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    console.log(
      "[Redis] Profile updated in MongoDB — deleting old profile cache"
    );
    await delKeys(redisKeys.userProfile(userId.toString()));

    return sanitizeUser(updated);
  }
}

export const userService = new UserService();
