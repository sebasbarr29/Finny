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
