# Finny

Your AI finance buddy for small businesses. One-page website for a class project, built by Sebastián Barrantes.

Finny is **in development**. The site is static (HTML/CSS only): no authentication, database, payments, or AI features yet.

- Page: `site/index.html`
- Deploy: `.github/workflows/pages.yml` publishes `site/` to GitHub Pages on every push.

## Enable GitHub Pages (one time)

Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. Then re-run the "Deploy to GitHub Pages" workflow (Actions tab).

## Preview locally

Open `site/index.html` in a browser.

## Vercel

`vercel.json` tells Vercel to serve the `site/` folder as-is (no build step). Import the repo in Vercel with the framework preset "Other"; settings in `vercel.json` take priority over the dashboard.
