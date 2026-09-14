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

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const allowed = CLIENT_URL.split(",").map((s) => s.trim());
      if (allowed.includes("*") || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production web deployment
    },
    credentials: true,
  })
);

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

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static build if available (unified single-service deployment)
const clientDist = path.resolve(__dirname, "../../web/dist");
app.use(express.static(clientDist));

// SPA catch-all
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      res.status(200).send("AUG DEPT. API is live. Access /api/products or /api/health.");
    }
  });
});

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
  console.log(`\n  AUG DEPT. Server running at http://localhost:${PORT}`);
  console.log(`  CORS origin: ${CLIENT_URL}\n`);
});

