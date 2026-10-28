import { getRedis } from "../providers/redis/connection";
import { redisKeys } from "../constants/redis";
import { AUTH } from "../constants/auth";
import { delKeys, getString, setString } from "./cache";

export async function cacheSession(
  token: string,
  userId: string,
  ttlSeconds: number
): Promise<void> {
  if (ttlSeconds <= 0) {
    return;
  }

  try {
    const redis = getRedis();
    const sessionKey = redisKeys.session(token);
    const setKey = redisKeys.userSessions(userId);

    console.log(
      `[Redis] Saving session for user ${userId} (TTL ${ttlSeconds}s)`
    );
    await redis.set(sessionKey, userId, "EX", ttlSeconds);

    console.log(`[Redis] Adding token to user's session list: ${setKey}`);
    await redis.sadd(setKey, token);
    await redis.expire(setKey, AUTH.SESSION_DAYS * 24 * 60 * 60);
  } catch (error) {
    console.error("Redis cacheSession failed:", (error as Error).message);
  }
}

export async function getCachedSessionUserId(
  token: string
): Promise<string | null> {
  console.log("[Redis] Looking up session in cache...");
  return getString(redisKeys.session(token));
}

export async function removeCachedSession(
  token: string,
  userId?: string
): Promise<void> {
  try {
    const redis = getRedis();
    console.log("[Redis] Removing session from cache (logout)");
    await redis.del(redisKeys.session(token));

    if (userId) {
      console.log(`[Redis] Removing token from user ${userId} session list`);
      await redis.srem(redisKeys.userSessions(userId), token);
    }
  } catch (error) {
    console.error("Redis removeCachedSession failed:", (error as Error).message);
  }
}

export async function setSessionString(
  token: string,
  userId: string,
  ttlSeconds: number
): Promise<void> {
  await setString(redisKeys.session(token), userId, ttlSeconds);
}

export async function deleteSessionKey(token: string): Promise<void> {
  await delKeys(redisKeys.session(token));
}
