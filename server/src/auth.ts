import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

function getSecret(): string {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

function readToken(req: Request): TokenPayload | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

// Extend Express Request with an optional `user`.
export interface AuthedRequest extends Request {
  user?: TokenPayload;
}

// Attaches req.user if a valid token is present; never blocks.
export function optionalAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) {
  const payload = readToken(req);
  if (payload) req.user = payload;
  next();
}

// Blocks the request with 401 if there is no valid token.
export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const payload = readToken(req);
  if (!payload) {
    return res.status(401).json({ error: "Authentication required." });
  }
  req.user = payload;
  next();
}

// Blocks if user is not an admin
export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const payload = readToken(req);
  if (!payload) {
    return res.status(401).json({ error: "Authentication required." });
  }
  if (!payload.isAdmin) {
    return res.status(403).json({ error: "Admin access required." });
  }
  req.user = payload;
  next();
}

