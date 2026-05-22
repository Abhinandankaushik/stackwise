import type { Request, Response, NextFunction } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.socket.remoteAddress ?? "unknown";
}

export function rateLimit(limit: number, windowMs: number, keyPrefix: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyPrefix}:${clientIp(req)}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      return res.status(429).json({ error: "Too many requests", retryAfterSec });
    }

    entry.count += 1;
    next();
  };
}
