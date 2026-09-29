import Stripe from "stripe";

const key = process.env.STRIPE_API_KEY;
if (
  process.env.STRIPE_MODE !== "sandbox" ||
  !/^(sk|rk)_test_/.test(key ?? "")
) {
  throw new Error("This script requires a sandbox Stripe API key");
}

const stripe = new Stripe(key);
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "thb",
        unit_amount: 10000,
        product_data: {
          name: "Pawsons sandbox checkout test",
          description: "Test payment only. No product will be shipped.",
        },
      },
      quantity: 1,
    },
  ],
  success_url: `${baseUrl}/shop/stripe-demo-return?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/shop/stripe-demo-return?canceled=1`,
  metadata: { purpose: "integration_test" },
});

console.log("Sandbox Checkout URL:", session.url);
console.log("This test does not create a Pawsons order or ship a product.");
