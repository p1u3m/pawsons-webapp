import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_API_KEY;
  const mode = process.env.STRIPE_MODE ?? "sandbox";

  if (mode !== "sandbox" && mode !== "live") {
    throw new Error("STRIPE_MODE must be sandbox or live");
  }

  if (!key) {
    throw new Error("STRIPE_API_KEY is not configured");
  }

  const expectedPrefix =
    mode === "sandbox" ? /^(sk|rk)_test_/ : /^(sk|rk)_live_/;
  if (!expectedPrefix.test(key)) {
    throw new Error("STRIPE_API_KEY does not match STRIPE_MODE");
  }

  stripeClient ??= new Stripe(key, { maxNetworkRetries: 2 });
  return stripeClient;
}
