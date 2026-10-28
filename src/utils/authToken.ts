import { Request } from "express";

/**
 * Read session token from headers (Authorization: Bearer <token>).
 * Also accepts x-session-token for convenience.
 */
export function getTokenFromRequest(req: Request): string | undefined {
  const authHeader = req.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      return token;
    }
  }

  const headerToken = req.get("x-session-token")?.trim();
  if (headerToken) {
    return headerToken;
  }

  return undefined;
}

export function remainingTtlSeconds(expiresAt: Date): number {
  return Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
}
