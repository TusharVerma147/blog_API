import { getRedis } from "../providers/redis/connection";
import { redisKeys, REDIS_TTL } from "../constants/redis";
import { AppError } from "./AppError";
import { HTTP_STATUS } from "../constants/httpStatus";

const MAX_ATTEMPTS = 5;

/**
 * If Redis is down, rate limiting is skipped (assignment allows this).
 */
export async function assertLoginAllowed(email: string): Promise<void> {
  try {
    const key = redisKeys.loginFail(email);
    const redis = getRedis();
    const count = Number((await redis.get(key)) || 0);

    console.log(
      `[Redis] Login attempts for ${email}: ${count}/${MAX_ATTEMPTS}`
    );

    if (count < MAX_ATTEMPTS) {
      return;
    }

    const ttl = await redis.ttl(key);
    const minutes = Math.max(1, Math.ceil(Math.max(ttl, 0) / 60));

    console.log(
      `[Redis] Too many failed logins for ${email}. Blocked for ~${minutes} minute(s).`
    );

    throw new AppError(
      `Too many login attempts. Try again in ${minutes} minutes`,
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Redis login rate limit check failed:", (error as Error).message);
  }
}

export async function recordFailedLogin(email: string): Promise<void> {
  try {
    const key = redisKeys.loginFail(email);
    const redis = getRedis();
    const count = await redis.incr(key);

    console.log(`[Redis] Failed login #${count} for ${email}`);

    if (count === 1) {
      console.log(
        `[Redis] Starting 15-minute fail window for ${email}`
      );
      await redis.expire(key, REDIS_TTL.LOGIN_FAIL);
    }
  } catch (error) {
    console.error("Redis recordFailedLogin failed:", (error as Error).message);
  }
}

export async function clearFailedLogins(email: string): Promise<void> {
  try {
    console.log(`[Redis] Clearing failed-login counter for ${email}`);
    await getRedis().del(redisKeys.loginFail(email));
  } catch (error) {
    console.error("Redis clearFailedLogins failed:", (error as Error).message);
  }
}
