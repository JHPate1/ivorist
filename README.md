# Ivorist website

The public site for **Ivorist** — a hardware & software studio. 
Live at [ivorists.com](https://ivorists.com).

Plain HTML/CSS/JS — no build step, no dependencies.

- `index.html` — the whole site (hero, about, solutions, process, team, contact)
- `styles.css` — styling (dark theme, green accent, diamond motif)
- `script.js` — nav, scroll reveal, contact form
- `wrangler.jsonc` — Cloudflare config (static assets + custom domains)

## Deploying

Cloudflare Workers (static assets):

```
npx wrangler deploy
```

Make sure you're authenticated (`npx wrangler login`) and the `ivorists.com`
zone is attached to the Cloudflare account — the custom domain routes come
from `wrangler.jsonc`.
