import { getRedis } from "../providers/redis/connection";

/**
 * Safe Redis helpers. On any Redis failure: log and return null / no-op
 * so the API can fall back to MongoDB.
 *
 * Never use the Redis KEYS command (assignment rule). Prefer exact key
 * deletes or SCAN if a pattern search is ever required.
 */
export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    console.log(`[Redis] Reading JSON from key: ${key}`);
    const value = await getRedis().get(key);

    if (value === null) {
      console.log(`[Redis] MISS — nothing found for: ${key}`);
      return null;
    }

    console.log(`[Redis] HIT — found data for: ${key}`);
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Redis getJSON failed:", (error as Error).message);
    return null;
  }
}

export async function setJSON(
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<boolean> {
  try {
    if (ttlSeconds <= 0) {
      return false;
    }
    console.log(
      `[Redis] Saving JSON to key: ${key} (expires in ${ttlSeconds} seconds)`
    );
    await getRedis().set(key, JSON.stringify(value), "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error("Redis setJSON failed:", (error as Error).message);
    return false;
  }
}

export async function delKeys(...keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  try {
    console.log(`[Redis] Deleting key(s): ${keys.join(", ")}`);
    await getRedis().del(...keys);
  } catch (error) {
    console.error("Redis delKeys failed:", (error as Error).message);
  }
}

export async function getString(key: string): Promise<string | null> {
  try {
    console.log(`[Redis] Reading string from key: ${key}`);
    const value = await getRedis().get(key);

    if (value === null) {
      console.log(`[Redis] MISS — nothing found for: ${key}`);
    } else {
      console.log(`[Redis] HIT — found string for: ${key}`);
    }

    return value;
  } catch (error) {
    console.error("Redis getString failed:", (error as Error).message);
    return null;
  }
}

export async function setString(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<boolean> {
  try {
    if (ttlSeconds <= 0) {
      return false;
    }
    console.log(
      `[Redis] Saving string to key: ${key} (expires in ${ttlSeconds} seconds)`
    );
    await getRedis().set(key, value, "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error("Redis setString failed:", (error as Error).message);
    return false;
  }
}

/** SCAN-based pattern delete — use instead of KEYS if ever needed */
export async function scanAndDelete(pattern: string): Promise<void> {
  try {
    console.log(`[Redis] SCAN + delete for pattern: ${pattern}`);
    const redis = getRedis();
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error("Redis scanAndDelete failed:", (error as Error).message);
  }
}
