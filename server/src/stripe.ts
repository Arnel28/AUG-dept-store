import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY?.trim();

// Stripe is only enabled when a secret key is provided. Otherwise the app
// runs in "demo mode" where checkout is simulated (no real payment).
export const isStripeEnabled = Boolean(key);

export const stripe: Stripe | null = key
  ? new Stripe(key, { apiVersion: "2024-12-18.acacia" })
  : null;

if (!isStripeEnabled) {
  console.log(
    "[stripe] No STRIPE_SECRET_KEY set — running checkout in DEMO mode."
  );
} else {
  console.log("[stripe] Stripe enabled (test/live per your key).");
}
