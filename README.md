# Finny

Your AI finance buddy for small businesses. Built by Sebastián Barrantes.

Finny turns a monthly P&L or bank CSV into a plain-language Monthly Report and a Business Tips Report, in English or Spanish.

## Tech

- Next.js 15 (App Router) + React 19 + TypeScript
- Deployed on Vercel (`vercel.json` pins the framework to Next.js)

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Secrets

Never commit API keys. Put them in `.env.local` (ignored by git) for local work and in Vercel → Project → Settings → Environment Variables for the live site.

## Environment variables

Set these in `.env.local` (local, git-ignored) and in Vercel → Settings → Environment Variables (live). Never commit them.

| Name | What it is |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string (added by the Vercel Neon integration) |
| `ANTHROPIC_API_KEY` | Claude API key, used to write the reports |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` in test mode) |
| `STRIPE_PRICE_ID` | Price ID of the $29/month Finny product (`price_...`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook pointing at `/api/stripe/webhook` (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`); optional, Checkout is hosted by Stripe |

Database tables are created automatically on first request.
