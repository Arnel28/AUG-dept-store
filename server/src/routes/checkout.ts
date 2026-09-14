import { Router, type Request, type Response } from "express";
import { prisma } from "../db";
import { optionalAuth, type AuthedRequest } from "../auth";
import { stripe, isStripeEnabled } from "../stripe";

const router = Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

interface IncomingItem {
  productId: string;
  size: string;
  quantity: number;
}
interface Shipping {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

// POST /api/checkout
router.post("/", optionalAuth, async (req: AuthedRequest, res) => {
  const items: IncomingItem[] = req.body?.items ?? [];
  const shipping: Shipping = req.body?.shipping ?? ({} as Shipping);

  // Validate shipping
  for (const f of ["name", "email", "address", "city", "zip", "country"] as const) {
    if (!shipping[f] || !String(shipping[f]).trim())
      return res.status(400).json({ error: `Shipping ${f} is required.` });
  }
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "Your cart is empty." });

  // Look up real products; NEVER trust prices sent by the client.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const orderItems: {
    productId: string;
    name: string;
    price: number;
    size: string;
    quantity: number;
  }[] = [];
  let total = 0;

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product)
      return res
        .status(400)
        .json({ error: `Product ${item.productId} is unavailable.` });

    const validSizes = product.sizes.split(",").map((s) => s.trim());
    if (!validSizes.includes(item.size))
      return res
        .status(400)
        .json({ error: `Invalid size "${item.size}" for ${product.name}.` });

    const qty = Math.max(1, Math.min(10, Math.floor(Number(item.quantity) || 1)));
    total += product.price * qty;
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: item.size,
      quantity: qty,
    });
  }

  // Create the pending order + items.
  const order = await prisma.order.create({
    data: {
      userId: req.user?.userId ?? null,
      email: shipping.email.trim().toLowerCase(),
      total,
      status: "pending",
      shippingName: shipping.name.trim(),
      shippingAddress: shipping.address.trim(),
      shippingCity: shipping.city.trim(),
      shippingZip: shipping.zip.trim(),
      shippingCountry: shipping.country.trim(),
      items: { create: orderItems },
    },
    include: { items: true },
  });

  // --- Real Stripe Checkout ---
  if (isStripeEnabled && stripe) {
    const productsById = byId;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      line_items: order.items.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency: "php",
          unit_amount: it.price,
          product_data: {
            name: `${it.name} (${it.size})`,
            images: [productsById.get(it.productId)?.image].filter(
              Boolean
            ) as string[],
          },
        },
      })),
      metadata: { orderId: order.id },
      success_url: `${CLIENT_URL}/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/checkout?canceled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return res.json({ mode: "stripe", url: session.url });
  }

  // --- Demo mode: simulate a successful payment ---
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid" },
  });
  res.json({ mode: "demo", orderId: order.id });
});

// POST /api/checkout/confirm  { sessionId }
// Called by the success page after a Stripe redirect to finalize the order
// without needing a public webhook during local development.
router.post("/confirm", async (req, res) => {
  if (!isStripeEnabled || !stripe)
    return res.json({ ok: true, demo: true });

  const sessionId = req.body?.sessionId;
  if (!sessionId)
    return res.status(400).json({ error: "sessionId is required." });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = session.metadata?.orderId;
  if (!orderId) return res.status(404).json({ error: "Order not found." });

  if (session.payment_status === "paid") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "paid" },
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  res.json({ ok: true, order });
});

// Stripe webhook (for production). Mounted with a raw body parser in index.ts.
export async function stripeWebhook(req: Request, res: Response) {
  if (!isStripeEnabled || !stripe) return res.json({ received: true });

  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (secret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, secret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error("[stripe] webhook signature error:", err);
    return res.status(400).send("Webhook Error");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "paid" },
      });
    }
  }

  res.json({ received: true });
}

export default router;
