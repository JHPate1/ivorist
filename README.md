# Ivorist website

The public site for **Ivorist**: a hardware & software studio. 
Live at [ivorists.com](https://ivorists.com).

Plain HTML/CSS/JS: no build step, no dependencies.

- `*.html`: multi-page site (index, about, archivist, contact, projects, services, team)
- `projects.json`: project directory data
- `styles.css` / `script.js`: shared styling and interactions (contact form posts to `/api/message`)
- `logo.svg`: brand mark, the faceted gem (also inlined in every page and used as favicon)
- `worker.js`: form endpoint, emails every submission to the team mailbox
- `wrangler.jsonc`: Cloudflare config (assets, worker, email binding)

## Deploying

Cloudflare Workers (static assets + a small email handler):

```
npx wrangler deploy
```

Make sure you're authenticated (`npx wrangler login`). The custom domain
`ivorists.com` is attached through the `routes` config; `www` redirects
to the apex via a Cloudflare redirect rule.
