import crypto from "crypto";
import { userRepository } from "../../Repository/user.repository";
import { sessionRepository } from "../../Repository/session.repository";
import { hashPassword, comparePassword } from "../../utils/password";
import { sanitizeUser } from "../../utils/sanitizeUser";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/httpStatus";
import { AUTH } from "../../constants/auth";
import { remainingTtlSeconds } from "../../utils/authToken";
import { cacheSession, removeCachedSession } from "../../utils/sessionCache";
import {
  assertLoginAllowed,
  clearFailedLogins,
  recordFailedLogin,
} from "../../utils/loginRateLimit";
import { SignupInput, LoginInput } from "./auth.validation";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

export class AuthService {
  async signup(input: SignupInput) {
    const hashedPassword = await hashPassword(input.password);

    try {
      const user = await userRepository.create({
        name: input.name,
        email: input.email.toLowerCase(),
        password: hashedPassword,
      });

      return sanitizeUser(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new AppError(
          "A user with this email already exists",
          HTTP_STATUS.CONFLICT
        );
      }
      throw error;
    }
  }

  async login(input: LoginInput, userAgent: string) {
    const email = input.email.toLowerCase();

    await assertLoginAllowed(email);

    const user = await userRepository.findByEmail(email);

    if (!user || !user.password) {
      await recordFailedLogin(email);
      throw new AppError(
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const isMatch = await comparePassword(input.password, user.password);

    if (!isMatch) {
      await recordFailedLogin(email);
      throw new AppError(
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    await clearFailedLogins(email);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH.SESSION_DAYS);

    await sessionRepository.create({
      userId: user._id,
      token,
      expiresAt,
      userAgent,
    });

    await cacheSession(
      token,
      user._id.toString(),
      remainingTtlSeconds(expiresAt)
    );

    return {
      token,
      expiresAt,
      user: sanitizeUser(user),
    };
  }

  async logout(token: string | undefined) {
    if (!token) {
      return;
    }

    const session = await sessionRepository.deleteByToken(token);
    const userId = session?.userId?.toString();
    await removeCachedSession(token, userId);
  }
}

export const authService = new AuthService();
