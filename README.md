# TUMIMURIM — Local Development

This repo contains a simple static site (`index.html`) and a lightweight Node.js backend to accept newsletter subscriptions.

## Backend

The backend exposes a single endpoint:

- `POST /api/subscribe` — accepts form data `{ email: "user@example.com" }` and stores it in `subscribers.json`.

### Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

The server listens on port `3000` by default. While the server is running, the site can POST to `/api/subscribe`.

### Notes

- `subscribers.json` will be created in the repo root. Add it to `.gitignore` if you don't want to commit it.
- For production use you should replace file storage with a proper database and add email confirmation.

### Confirmation flow (development)

- The backend now creates a confirmation token when a user signs up. A confirmation URL is logged to the server console and appended to `confirmation_links.json` for development inspection.
- To confirm an address, visit the URL printed by the server or call `GET /api/confirm?token=...`.

### CORS & HTTPS (deployment notes)

- The server enables CORS for development. For production, restrict allowed origins to your domain by configuring the `cors` middleware with an `origin` option.
- Serve the site over HTTPS in production. If deploying behind a proxy (e.g., Nginx, Vercel, Fly.io), terminate TLS at the proxy and forward requests to the Node process.
- Store subscriber data in a secured database, and send confirmation emails via a trusted transactional email provider (SendGrid, Mailgun, SES) rather than logging links.

### Quick dev commands

Install dependencies and start the server:

```bash
npm install --no-audit --no-fund
npm start
```

Test subscription via `curl`:

```bash
curl -X POST http://localhost:3000/api/subscribe -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

After subscribing, check the server console for a confirmation URL or inspect `confirmation_links.json`.

### Deploying the static site to Netlify

- This repo contains a static front-end and a simple Node backend. Netlify hosts the static site; if you want Netlify to proxy `/api/*` to an external backend, add a redirect to `netlify.toml` or the `_redirects` file.
- In `netlify.toml` and `_redirects` there is an example rule that forwards `/api/*` to `https://your-backend.example.com/api/:splat`. Replace that URL with your backend host.
- If you want to host the API on Netlify as serverless functions, you'll need to port the Express endpoints into Netlify Functions under `netlify/functions/` (each handler exported as `exports.handler`). This repo does not automatically convert the Express app.

Example Netlify workflow:

1. Set your production backend URL in `netlify.toml` (or keep the proxy rule to an external API).
2. Commit and push to GitHub.
3. Connect the repository to Netlify and trigger a deploy.

After deployment, the front-end will call `/api/subscribe` and Netlify will forward those requests to the backend URL you configured.

### Deploying to Vercel

- Vercel can host the static front-end directly from this repository.
- The `api/subscribe.mjs` file is a Vercel Function, so the newsletter form can post to `/api/subscribe` on the same deployment.
- The `vercel.json` file keeps the static output directory at the project root and avoids legacy `builds`/`routes` entries that would exclude static assets.
- The Vercel Function uses in-memory storage for demo submissions. For production subscriber storage, connect a database or email marketing provider.

Example Vercel workflow:

1. Commit and push your changes to GitHub.
2. Connect the repository to Vercel and choose the root folder as the project.
3. Deploy the project with the default settings.
4. Test the live `/api/subscribe` endpoint from the newsletter form.

### Deploying the Express backend to Render (recommended)

1. Create a Render account and connect your GitHub repository: https://render.com
2. Create a new Web Service and choose "Docker" (or "Node") as the environment. If you choose Docker, Render will use the `Dockerfile` in this repo.
3. Set environment variables on Render:
	- `NODE_ENV=production`
	- Optionally set any email provider credentials for sending confirmation emails.
4. Deploy: Render will automatically build and run the service. Your service will be available at `https://<your-service>.onrender.com`.

Optional: Add a Render deploy hook (Settings → Deploy Hooks) and copy the hook URL into your GitHub repository secrets as `RENDER_DEPLOY_HOOK`. The included GitHub Actions workflow will trigger that hook after building.

After you have a Render URL, update `netlify.toml` and `_redirects` to point `/api/*` to `https://<your-service>.onrender.com/api/:splat`.
