import { getRedis } from "../providers/redis/connection";
import { redisKeys, REDIS_TTL } from "../constants/redis";
import { delKeys, getJSON, setJSON } from "./cache";
import { ListPostsQuery } from "../Modules/post/post.validation";

export type CacheStatus = "HIT" | "MISS";

export type PostListResponse = {
  data: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function normalizeListQuery(query: ListPostsQuery) {
  return {
    page: query.page,
    limit: query.limit,
    search: (query.search || "").trim().toLowerCase(),
    tag: (query.tag || "").trim().toLowerCase(),
    sort: query.sort,
  };
}

async function getListVersion(): Promise<number> {
  try {
    const value = await getRedis().get(redisKeys.postsListVersion());
    const version = Number(value || 0);
    console.log(`[Redis] Current posts list version: ${version}`);
    return version;
  } catch (error) {
    console.error("Redis getListVersion failed:", (error as Error).message);
    return 0;
  }
}

export async function bumpPostsListVersion(): Promise<void> {
  try {
    const next = await getRedis().incr(redisKeys.postsListVersion());
    console.log(
      `[Redis] Bumped posts list version to ${next} (old list cache ignored)`
    );
  } catch (error) {
    console.error("Redis bumpPostsListVersion failed:", (error as Error).message);
  }
}

export async function invalidatePostCache(postId: string): Promise<void> {
  console.log(
    `[Redis] Post ${postId} changed — clearing post cache + bumping list version`
  );
  await delKeys(redisKeys.post(postId));
  await bumpPostsListVersion();
}

export async function getCachedPost<T>(
  postId: string
): Promise<{ post: T; cacheStatus: CacheStatus } | null> {
  console.log(`[Redis] Checking cache for post ${postId}...`);
  const cached = await getJSON<T>(redisKeys.post(postId));
  if (!cached) {
    return null;
  }
  console.log(`[Redis] Post ${postId} served from cache (HIT)`);
  return { post: cached, cacheStatus: "HIT" };
}

export async function setCachedPost(
  postId: string,
  post: unknown
): Promise<void> {
  console.log(`[Redis] Caching published post ${postId} for 10 minutes`);
  await setJSON(redisKeys.post(postId), post, REDIS_TTL.POST);
}

export async function getCachedPostList(
  query: ListPostsQuery
): Promise<{ body: PostListResponse; cacheStatus: CacheStatus } | null> {
  const normalized = normalizeListQuery(query);
  const version = await getListVersion();
  const key = redisKeys.postsList({
    version,
    ...normalized,
  });

  console.log("[Redis] Checking cache for posts list...");
  const cached = await getJSON<PostListResponse>(key);
  if (!cached) {
    return null;
  }

  console.log("[Redis] Posts list served from cache (HIT)");
  return { body: cached, cacheStatus: "HIT" };
}

export async function setCachedPostList(
  query: ListPostsQuery,
  body: PostListResponse
): Promise<void> {
  const normalized = normalizeListQuery(query);
  const version = await getListVersion();
  const key = redisKeys.postsList({
    version,
    ...normalized,
  });

  console.log("[Redis] Caching posts list for 60 seconds");
  await setJSON(key, body, REDIS_TTL.POST_LIST);
}
