import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// Serialize a product for the API (sizes stored as CSV -> array).
function serialize(p: {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string;
  stock: number;
  featured: boolean;
}) {
  return { ...p, sizes: p.sizes.split(",").map((s) => s.trim()) };
}

// GET /api/products?category=Men&q=denim&featured=true
router.get("/", async (req, res) => {
  const { category, q, featured } = req.query;
  const where: Record<string, unknown> = {};

  if (category && category !== "All") where.category = String(category);
  if (featured === "true") where.featured = true;
  if (q && String(q).trim()) {
    const term = String(q).trim();
    where.OR = [
      { name: { contains: term } },
      { description: { contains: term } },
      { category: { contains: term } },
    ];
  }

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });
    console.log(`Public products fetched: ${products.length}`);
    res.json(products.map(serialize));
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/categories  (defined before :id)
router.get("/categories", async (_req, res) => {
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  res.json(rows.map((r) => r.category));
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  if (!product) return res.status(404).json({ error: "Product not found." });
  res.json(serialize(product));
});

export default router;
