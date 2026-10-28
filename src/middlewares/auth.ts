import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { HTTP_STATUS } from "../constants/httpStatus";
import { AppError } from "../utils/AppError";
import { getTokenFromRequest, remainingTtlSeconds } from "../utils/authToken";
import {
  cacheSession,
  getCachedSessionUserId,
} from "../utils/sessionCache";
import { sessionRepository } from "../Repository/session.repository";
import { userRepository } from "../Repository/user.repository";
import { AuthUser } from "../types/express";

function toAuthUser(user: {
  _id: Types.ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): AuthUser {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    // 1) Redis first (no Mongo session query on hit)
    const cachedUserId = await getCachedSessionUserId(token);

    if (cachedUserId) {
      console.log(
        `[Redis] Auth: session found in Redis for user ${cachedUserId}`
      );
      const user = await userRepository.findById(cachedUserId);

      if (!user) {
        throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
      }

      req.user = toAuthUser(user);
      next();
      return;
    }

    console.log(
      "[Redis] Auth: session not in Redis — checking MongoDB..."
    );

    // 2) MongoDB fallback, then re-warm Redis
    const session = await sessionRepository.findByToken(token);

    if (!session) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await sessionRepository.deleteByToken(token);
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await userRepository.findById(session.userId);

    if (!user) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

    console.log("[Redis] Auth: valid Mongo session — saving back into Redis");
    await cacheSession(
      token,
      user._id.toString(),
      remainingTtlSeconds(session.expiresAt)
    );

    req.user = toAuthUser(user);
    next();
  } catch (error) {
    next(error);
  }
}
