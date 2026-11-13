# Finny

Your AI finance buddy for small businesses. Built by Sebastián Barrantes.

Finny turns a monthly P&L or bank export (CSV or Excel) into a plain-language Monthly Report, a Business Tips Report and a prioritized action plan, in English or Spanish. Owners can ask follow-up questions (Ask Finny) answered only from their saved, calculated numbers.

## How it works

- **Math in code, words from AI.** `lib/finance.ts` calculates revenue, expenses, net profit, margin, top expenses and month-over-month changes. Claude (`lib/ai.ts`) only writes explanations, and a guard rejects any dollar amount or percentage that isn't in the calculated data.
- **App screens** (`app/(app)/`): Dashboard, Upload (review numbers before generating), Reports (EN/ES switch, print), Business Tips, Action Plan (ticks saved in Neon), Ask Finny, Billing (Stripe), Settings.
- **Plans:** Free = 1 report + 5 Ask Finny questions. Pro ($29/month, Stripe) = unlimited. The demo account (`demo@demo.com`) has full access for grading and is labeled as not a subscription.
- **Data:** Neon Postgres. Tables are created automatically on first request. Every query is scoped to the logged-in user.

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
