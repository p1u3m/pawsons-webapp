# Pawsons Stripe integration checkpoint

Updated 28 September 2026. This records the result of Stripe's `stripe_implementation_planner` for the Pawsons Shop.

## Confirmed decisions

- Pawsons sells its own physical stickers and postcards. Purchases are one-time payments on the existing Next.js website.
- The merchant account is in Thailand. Development uses the separate **แซนด์บ็อกซ์ Pluem** Stripe sandbox. Live-mode payments remain disabled.
- Ship to Thailand and international destinations from the first launch. The supported country list and shipping rates are still needed.
- Product names, prices, stock counts, product photographs and shipping rules are not ready. Current Shop cards are previews and cannot be purchased.
- The Stripe planner's accepted integration shape is **Stripe-hosted Checkout on the web** (`checkout_type: hosted`, `origin_context: web`).
- Pawsons is the only seller. Connect is not part of this launch. Revisit Connect if independent sellers must onboard, receive payouts or share revenue through Pawsons.

## Build order

1. Finish the real physical product catalog: SKU, title, variant, image, price in THB minor units, available stock and sale status.
2. Define allowed shipping countries, rates or carrier rules, handling times, return policy and responsibility for customs duties. Checkout must offer only destinations the store can fulfill.
3. Add cart and server-side validation. The browser sends product IDs and quantities; the server retrieves trusted prices and stock.
4. Create a pending order and a Stripe Checkout Session on the server. Use an idempotency key and one stable order ID. Keep the Shop purchase control behind a feature flag until the whole flow passes sandbox testing.
5. Verify Stripe webhook signatures using the raw request body. Fulfill only after Stripe confirms a paid payment. Record event IDs and make fulfillment repeat-safe.
6. Add order success/cancel pages, order history and an admin shipping queue. Test successful, failed, delayed, canceled and duplicate-event cases in the sandbox.
7. Review business verification, taxes, shipping, refund policy, production secrets and live webhook configuration before enabling real payments.

## Local sandbox key setup

1. In the Stripe Dashboard account picker, select **แซนด์บ็อกซ์ Pluem**. Confirm you are not in live mode.
2. Open the [API keys page](https://dashboard.stripe.com/apikeys). Copy a sandbox server key (`sk_test_...` or a suitably permissioned `rk_test_...`).
3. In the project root's ignored `.env.local`, add `STRIPE_MODE=sandbox` and `STRIPE_API_KEY=<your sandbox key>`. Do not paste the key into chat or a tracked source file.
4. Restart the local Next.js server after changing environment variables. The webhook signing secret is a separate value and will be added when the webhook endpoint exists.

The server client in `src/lib/stripe/server.ts` rejects a live key while `STRIPE_MODE=sandbox`. Stripe OAuth for the MCP planner is separate from the API key used by the Pawsons web server.

## References

- [Stripe Checkout for web payments](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted)
- [Stripe API keys and sandboxes](https://docs.stripe.com/keys)
- [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Stripe webhooks](https://docs.stripe.com/webhooks)
- [Stripe Connect overview](https://docs.stripe.com/connect)

## Sandbox Checkout smoke test

With the local sandbox key configured, run `node --env-file=.env.local scripts/test-stripe-checkout.mjs` from the project root. The script creates a new Stripe-hosted Checkout Session for a clearly labeled 100 THB test item and prints its URL. It never creates a Pawsons order, changes stock or ships anything. The return page at `/shop/stripe-demo-return` retrieves that test session from Stripe and displays its payment status. It is unavailable when `STRIPE_MODE` is not `sandbox`.

Use only Stripe's [test payment details](https://docs.stripe.com/testing#cards). A successful sandbox payment validates Checkout navigation and Stripe authentication; it does not validate order fulfillment, stock handling or webhooks. Those belong to the later product and order stages.

### Verified sandbox result

On 28 September 2026, the first 100 THB sandbox Checkout test completed with Stripe session `payment_status=paid` and `status=complete`. The Pawsons return page independently retrieved the same paid status. This confirms the API key, hosted Checkout redirect and read-back path. It does **not** confirm webhook delivery, order creation, stock reservation, shipping collection or fulfillment.

The temporary sandbox API key used for this smoke test was removed from `.env.local` afterward. Before continuing, rotate or expire the previously shared key in the Stripe Dashboard and add a fresh sandbox key directly to `.env.local` without sending it through chat.

## Guest checkout and webhook checkpoint

The first physical-goods release will allow checkout without a Pawsons login. Stripe Checkout will collect buyer email and shipping address; the Pawsons server must keep a trusted order snapshot and use an unguessable order reference for any order lookup. Do not make customer email alone an authorization token.

A separate sandbox-only probe exists at `POST /api/stripe/demo-webhook`. It requires `STRIPE_MODE=sandbox` and `STRIPE_DEMO_WEBHOOK_SECRET`, verifies the raw request body and Stripe signature, and never fulfills products. A forged signature returned HTTP 400. On 28 September 2026, Stripe CLI forwarded a signed `checkout.session.completed` sandbox event and received HTTP 200. The real order webhook still needs database-backed event deduplication, order state transitions and fulfillment logic before sale.

## Try Checkout from the Shop page

Run `npm run dev`, then open `http://localhost:3000/shop`. In local development with `STRIPE_MODE=sandbox` and a configured `STRIPE_API_KEY`, a separate **SANDBOX ONLY** panel appears above the preview cards. Its 100 THB button posts to `/api/stripe/demo-checkout`, which creates a sandbox Checkout Session on the server and redirects to Stripe. Use only Stripe's test payment details. The return page reads the Session back from Stripe. No real product, order, stock or shipping record is created.

This button and endpoint are disabled in production builds. The separate test endpoint is not the future real checkout route.

## Where Supabase fits

A payment-only demo can use Stripe without Supabase. For a real Pawsons store, keep trusted catalog data, product variants, stock, order snapshots, customer contact/shipping information and webhook event IDs in Supabase. Stripe Checkout handles the payment UI and payment state. A verified webhook moves a matching Pawsons order to paid and into the shipping queue. The Shop must never trust a price sent by the browser or fulfill an order merely because the customer returned to the success page.
