import { Router } from "express";
import { prisma } from "../db";
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  type AuthedRequest,
} from "../auth";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !EMAIL_RE.test(email))
    return res.status(400).json({ error: "A valid email is required." });
  if (!password || password.length < 6)
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  if (!name || !name.trim())
    return res.status(400).json({ error: "Name is required." });

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing)
    return res
      .status(409)
      .json({ error: "An account with that email already exists." });

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name: name.trim(),
      passwordHash: await hashPassword(password),
    },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash)))
    return res.status(401).json({ error: "Invalid email or password." });

  const token = signToken({
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
  });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, isAdmin: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user });
});

export default router;
