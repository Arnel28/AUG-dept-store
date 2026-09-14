import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, optionalAuth, type AuthedRequest } from "../auth";

const router = Router();

// GET /api/orders  — the signed-in user's order history
router.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// GET /api/orders/:id — a single order (used by the success page).
// The cuid id acts as an unguessable capability token for guest orders;
// if the caller is signed in, we additionally allow their own orders.
router.get("/:id", optionalAuth, async (req: AuthedRequest, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found." });
  res.json(order);
});

export default router;
