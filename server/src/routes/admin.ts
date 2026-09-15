import { Router } from "express";
import { prisma } from "../db";
import { requireAdmin, type AuthedRequest } from "../auth";

const router = Router();

// Protect all admin routes
router.use(requireAdmin);

function serializeProduct(p: {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string;
  stock: number;
  featured: boolean;
  createdAt: Date;
}) {
  return { ...p, sizes: p.sizes ? p.sizes.split(",").map((s) => s.trim()) : [] };
}

// GET /api/admin/stats
router.get("/stats", async (_req: AuthedRequest, res) => {
  const [totalProducts, orders, lowStockProducts] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.product.count({
      where: {
        stock: { lte: 5 },
      },
    }),
  ]);

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "shipped" || o.status === "complete")
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  res.json({
    totalRevenue,
    totalOrders,
    totalProducts,
    lowStockCount: lowStockProducts,
    pendingOrders,
  });
});

// GET /api/admin/products
router.get("/products", async (_req: AuthedRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log(`Admin fetched ${products.length} products`);
    res.json(products.map(serializeProduct));
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/admin/products
router.post("/products", async (req: AuthedRequest, res) => {
  const { name, description, price, category, image, sizes, stock, featured } =
    req.body ?? {};

  if (!name || !description || price == null || !category || !image) {
    return res.status(400).json({ error: "Missing required product fields." });
  }

  const sizesStr = Array.isArray(sizes) ? sizes.join(",") : String(sizes || "One Size");

  const product = await prisma.product.create({
    data: {
      name: String(name).trim(),
      description: String(description).trim(),
      price: Math.round(Number(price)),
      category: String(category).trim(),
      image: String(image).trim(),
      sizes: sizesStr,
      stock: stock != null ? Number(stock) : 100,
      featured: Boolean(featured),
    },
  });

  res.status(201).json(serializeProduct(product));
});

// PATCH /api/admin/products/:id
router.patch("/products/:id", async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { name, description, price, category, image, sizes, stock, featured } =
    req.body ?? {};

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Product not found." });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = String(name).trim();
  if (description !== undefined) data.description = String(description).trim();
  if (price !== undefined) data.price = Math.round(Number(price));
  if (category !== undefined) data.category = String(category).trim();
  if (image !== undefined) data.image = String(image).trim();
  if (sizes !== undefined) {
    data.sizes = Array.isArray(sizes) ? sizes.join(",") : String(sizes);
  }
  if (stock !== undefined) data.stock = Math.max(0, Number(stock));
  if (featured !== undefined) data.featured = Boolean(featured);

  const updated = await prisma.product.update({
    where: { id },
    data,
  });

  res.json(serializeProduct(updated));
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Product not found." });

  await prisma.product.delete({ where: { id } });
  res.json({ ok: true, id });
});

// GET /api/admin/orders
router.get("/orders", async (_req: AuthedRequest, res) => {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// PATCH /api/admin/orders/:id/status
router.patch("/orders/:id/status", async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  const validStatuses = ["pending", "paid", "shipped", "complete", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Order not found." });

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });

  res.json(updated);
});

export default router;
