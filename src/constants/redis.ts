import { config } from "./config";

/** Every Redis key starts with blog_<name>: (same as DB name) */
export const REDIS_PREFIX = `${config.dbName}:`;

export const REDIS_TTL = {
  /** Profile cache: 1 hour */
  USER_PROFILE: 60 * 60,
  /** Single published post: 10 minutes */
  POST: 10 * 60,
  /** Published post list: 60 seconds */
  POST_LIST: 60,
  /** Stats: 5 minutes */
  STATS: 5 * 60,
  /** Login fail counter window: 15 minutes */
  LOGIN_FAIL: 15 * 60,
  /** Comments list cache (bonus): 60 seconds */
  COMMENTS_LIST: 60,
} as const;

export const redisKeys = {
  session: (token: string) => `${REDIS_PREFIX}session:${token}`,

  userSessions: (userId: string) => `${REDIS_PREFIX}user:${userId}:sessions`,

  userProfile: (userId: string) => `${REDIS_PREFIX}user:${userId}`,

  loginFail: (email: string) =>
    `${REDIS_PREFIX}login:fail:${email.toLowerCase()}`,

  post: (postId: string) => `${REDIS_PREFIX}post:${postId}`,

  postsListVersion: () => `${REDIS_PREFIX}posts:list:version`,

  postsList: (params: {
    version: number | string;
    page: number;
    limit: number;
    search: string;
    tag: string;
    sort: string;
  }) =>
    `${REDIS_PREFIX}posts:list:v${params.version}:p${params.page}:l${params.limit}:s${params.search}:t${params.tag}:o${params.sort}`,

  stats: () => `${REDIS_PREFIX}stats`,

  postCommentsVersion: (postId: string) =>
    `${REDIS_PREFIX}post:${postId}:comments:version`,
};
