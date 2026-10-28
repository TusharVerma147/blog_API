# Blog API

REST API built with **Express**, **TypeScript**, **MongoDB (Mongoose)** and **Redis (ioredis)**.

## Scripts

```bash
npm run dev    # development with auto-restart
npm run build  # compile TypeScript
npm run start  # run compiled JS
```

## Environment

Copy `.env.example` to `.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
```

Database name: `blog_user`  
Redis key prefix: `blog_user:`

## Auth

Login returns a `token`. Send it on protected routes:

```http
Authorization: Bearer <token>
```

Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## Why stats can be up to 5 minutes old

`GET /api/stats` runs a heavy MongoDB `$facet` aggregation (totals, top tags, top authors, most-commented posts). Caching the full result in Redis for **5 minutes** means:

- The expensive aggregation runs **at most once every 5 minutes**, no matter how many clients hit `/api/stats`.
- Blog stats are **dashboards**, not real-time counters — being a few minutes behind is acceptable for users and graders.
- Freshness for posts/comments is handled separately with short TTLs and explicit invalidation; stats trade a little freshness for much lower DB load.

## Redis keys

| Key (without `blog_user:` prefix) | Type | TTL | Set when | Deleted / invalidated when |
| --- | --- | --- | --- | --- |
| `session:<token>` | String (userId) | until session `expiresAt` | login | logout, logout-all |
| `user:<userId>:sessions` | Set of tokens | 7 days (refreshed on login) | login | logout (token removed), logout-all |
| `user:<userId>` | JSON String (profile, no password) | 1 hour | `GET /api/users/me` miss | `PATCH /api/users/me` |
| `login:fail:<email>` | String counter | 15 minutes | failed login | successful login |
| `post:<id>` | JSON String (published post) | 10 minutes | `GET /api/posts/:id` miss | post update/delete, comment add/delete |
| `posts:list:version` | String number | none (allowed exception) | `INCR` on post/comment changes | n/a (version bumps) |
| `posts:list:v…:p…:l…:s…:t…:o…` | JSON String (list response) | 60 seconds | `GET /api/posts` miss | old keys ignored after version `INCR`, then expire |
| `stats` | JSON String | 5 minutes | `GET /api/stats` miss | expires by TTL |

### Redis cache rules (Part 6)

- Response **body** is identical for Redis HIT and MongoDB MISS (`X-Cache` is a header only).
- Always **write MongoDB first**, then **delete / version-bump** related Redis keys — never patch a cached value in place.
- Every cache key has a **TTL**, except `posts:list:version`.
- If Redis is down or a command fails: **log and continue with MongoDB**. Login rate limit may be skipped when Redis is unavailable.
- Cached GETs set `X-Cache: HIT` or `X-Cache: MISS`: `/api/users/me`, `/api/posts`, `/api/posts/:id`, `/api/stats`.
- Never use the Redis `KEYS` command (use exact deletes or `SCAN`).

### Indexes

| Collection | Indexes |
| --- | --- |
| users | unique `email` |
| sessions | unique `token`; TTL on `expiresAt` |
| posts | `tags`; compound `{ status: 1, createdAt: -1 }` |
| comments | compound `{ postId: 1, createdAt: -1 }` |

### Errors

All errors use:

```json
{ "success": false, "message": "..." }
```

Status codes used: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `429`, `500`.  
Passwords and stack traces are never returned to the client.

