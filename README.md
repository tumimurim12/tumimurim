# TUMIMURIM — Building in My 20s

A personal site for thoughtful growth, disciplined living, and God-centered transformation.
Static front-end (`index.html`, `style.css`, images) deployed on **Vercel**.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | The full site — markup, styles, and inline scripts (blog feed, carousel, forms) |
| `style.css` | Shared base styles |
| `carousel-1.jpg`, `carousel-2.jpg`, `carousel-3.jpg`, `tumi.jpg` | Images |
| `vercel.json` | Vercel deployment config |
| `.vercelignore` | Files excluded from the Vercel build |

## Newsletter

Email signups are handled entirely by **[Kit](https://thummim-assefa.kit.com) (ConvertKit)**.
The inline subscribe form on the page posts directly to Kit — there is no custom backend to run or maintain.

## Local preview

It's a static site, so any static server works:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

## Deploying

The site auto-deploys to Vercel on every push to `main`.

1. Commit and push your changes.
2. Vercel builds and serves the static files from the repo root (per `vercel.json`).

No build step or server is required.
