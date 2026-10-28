import { statsRepository } from "../../Repository/stats.repository";
import { redisKeys, REDIS_TTL } from "../../constants/redis";
import { getJSON, setJSON } from "../../utils/cache";
import { CacheStatus } from "../../utils/postCache";

export class StatsService {
  async getStats(): Promise<{
    data: Awaited<ReturnType<typeof statsRepository.getBlogStats>>;
    cacheStatus: CacheStatus;
  }> {
    const key = redisKeys.stats();
    console.log("[Redis] GET /stats — checking stats cache...");
    const cached = await getJSON<
      Awaited<ReturnType<typeof statsRepository.getBlogStats>>
    >(key);

    if (cached) {
      console.log("[Redis] Stats cache HIT (skipping heavy aggregation)");
      return { data: cached, cacheStatus: "HIT" };
    }

    console.log(
      "[Redis] Stats cache MISS — running MongoDB aggregation, then cache 5 min"
    );
    const data = await statsRepository.getBlogStats();
    await setJSON(key, data, REDIS_TTL.STATS);

    return { data, cacheStatus: "MISS" };
  }
}

export const statsService = new StatsService();
