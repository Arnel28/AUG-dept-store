import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import checkoutRoutes, { stripeWebhook } from "./routes/checkout";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Stripe webhook needs the raw body, so it is registered BEFORE express.json().
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin", adminRoutes);

// Fallback error handler
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
);

app.listen(PORT, () => {
  console.log(`\n  Verve API running at http://localhost:${PORT}`);
  console.log(`  CORS origin: ${CLIENT_URL}\n`);
});
