# BrandPilot

Production AI marketing SaaS built with Next.js, Supabase, OpenAI, and Stripe.

## Setup

1. Copy `.env.example` to `.env.local` and add real credentials.
2. Run both SQL files in `drizzle/` through the Supabase SQL Editor, in filename order.
3. In Supabase Authentication, enable Email sign-in and set the production Site URL.
4. Create a recurring Stripe price and set `STRIPE_PRO_PRICE_ID`.
5. Add a Stripe webhook for subscription created, updated, and deleted events, pointing to `/api/stripe/webhook`.
6. Run `npm install` and `npm run dev`.

## Vercel

Add every non-commented value from `.env.example` to Vercel Environment Variables. Never expose the service-role, OpenAI, or Stripe secret keys as `NEXT_PUBLIC_*` values.

All user-owned APIs require a valid Supabase access token, database tables use row-level security, Stripe webhooks are signature-verified, and generation limits are enforced server-side.
