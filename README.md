# Ivorist website

The public site for **Ivorist**: a hardware & software studio. 
Live at [ivorists.com](https://ivorists.com).

Plain HTML/CSS/JS: no build step, no dependencies.

- `*.html`: multi-page site (index, about, archivist, contact, projects, services, team)
- `projects.json`: project directory data

Adding a project: append an object to `projects.json`. Required: `id`,
`number`, `name`, `category`, `summary`, `url`, `status`, `highlights`.
Optional: `liveUrl` and `repoUrl` (link buttons only render when filled in)
and `feature` (the longer paragraph shown in the home page feature section).
The projects page and the home page feature section render from the JSON
at load time, with the static markup as a no-JS fallback.
- `styles.css` / `script.js`: shared styling and interactions (contact form posts to `/api/message`)
- `logo.png`: brand mark, the faceted gem (transparent background; also used as favicon)
- `worker.js`: form endpoint, emails every submission to the team mailbox
- `wrangler.jsonc`: Cloudflare config (assets, worker, email binding)

## Deploying

Cloudflare Workers (static assets + a small email handler):

```
npx wrangler deploy
```

Make sure you're authenticated (`npx wrangler login`). The custom domain
`ivorists.com` is attached from the Cloudflare dashboard (the DNS zone is
externally managed, so `wrangler.jsonc` carries no routes config); `www`
redirects to the apex via a Cloudflare redirect rule.
