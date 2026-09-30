# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Thai young working adults, roughly 22–35. They arrive mostly on phones, often from a shared link on social media, looking for a soft, low-pressure break: a moment to learn something about themselves and meet a character they like. Returning visitors come back for new contents, their room, and merch of the character they identify with.

## Product Purpose

Pawsons is a character IP brand. The web app exists to make people attach to the Pawsons characters and houses: take the quiz, meet "their" Pawson, read about the character and its house, keep coming back for contents, and eventually own something of theirs from the shop.

Success means people finish the quiz, recognise themselves in a character, share the result, and return. The shop follows from that attachment rather than driving it.

## Positioning

A cast of 16 original characters (Caine, Mavis, Conrad, …) grouped into four houses (Lavender "The Visionaries", Clover "The Velveteens", Forget-me-not "The Vigils", Dandelion "The Voyageurs"), each with its own Thai description, motto, and colour identity. The personality quiz is only a way into this world. Visitors come away with a named character and a house they belong to, not a four-letter type.

## Operating Context

- Main journey: `/` → `/quiz` → `/results/[type]` → `/share/[type]` (a 1080×1920 story-card PNG for Instagram/TikTok stories) → `/characters/[type]` and `/houses/[house]`.
- Ongoing reasons to return: `/contents` (editorial articles managed in Supabase), `/room` (signed-in profile room), and `/letters` (coming soon).
- Commerce: `/shop` catalog, cart drawer, Stripe Checkout, and signed-in order history with shipping status and tracking.
- Admins (`profiles.role = 'admin'`) manage contents, the shop catalog, orders, and member roles under `/admin`.
- Sign-in uses Supabase auth, including Google.

## Capabilities and Constraints

- The quiz maps answers to one of 16 types. It is playful content, **not** a validated personality assessment. Never present it as an official or real MBTI test, and never claim scientific accuracy.
- Mobile is the primary context. Every surface must work first at phone width; desktop is secondary.
- Copy shown to users is Thai; house names, character names, group titles, and mottos are in English.
- Prices are read server-side from the catalog; the site still renders without Supabase configured, but auth, contents, and the shop need it.
- Stack is fixed by the existing codebase (Next.js 16, Supabase, Stripe); see README.md.

## Brand Commitments

- Name: Pawsons (a single character is "a Pawson"). Tagline: "A little place to be you." Meta description: "พักสักนิด ทำความรู้จักตัวเอง และพบเพื่อนตัวน้อยในโลกของ Pawsons".
- Voice: gentle, warm, reassuring, and small-scale ("เรื่องเล็ก ๆ", "พื้นที่ที่สบายใจ"). The copy invites and never judges or pushes.
- Four houses with fixed names, Thai titles, group titles, mottos, and colour identities defined in `src/lib/data.ts`.
- Assets: logos in `public/logos/`, character art in `public/characters/` (16 illustrations plus `faces/`), house sigils in `public/houses/`, and doodle, pattern, and wave art in `public/`.

## Evidence on Hand

- Real content: the 16 characters, 4 houses, quiz questions, and scoring (`src/lib/data.ts`), editorial contents in Supabase, and the shop catalog.
- **None yet:** testimonials, reviews, user counts, sales figures, press, or partner logos. Future work must not invent these or imply that they exist.

## Product Principles

1. **The character is the product.** Every surface should deepen a visitor's bond with a Pawson or a house. Features that don't do that come second.
2. **Belonging over labelling.** Results speak in terms of who you are like and where you belong, not clinical type descriptions.
3. **A soft place to land.** Keep pressure low: no urgency tactics, no guilt, and no dense walls of UI. It should feel like a break, not a task.
4. **Built for the thumb and the share.** The phone is where people arrive and where they share, so result and share moments carry the most weight.
5. **Honest by default.** Don't overstate the quiz's accuracy, and don't fabricate social proof.
