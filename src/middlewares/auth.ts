import { NextFunction, Request, Response } from "express";
import { AUTH } from "../constants/auth";
import { HTTP_STATUS } from "../constants/httpStatus";
import { AppError } from "../utils/AppError";
import { sessionRepository } from "../Repository/session.repository";
import { userRepository } from "../Repository/user.repository";
import { AuthUser } from "../types/express";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[AUTH.COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);
    }

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

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } satisfies AuthUser;

    next();
  } catch (error) {
    next(error);
  }
}
