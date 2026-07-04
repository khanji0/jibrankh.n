# jibrankh.n

Personal portfolio website — a static site built with plain HTML, CSS, and JavaScript.

## Structure

- `index.html` — landing page
- `hub.html` — hub / gallery page
- `css/` — stylesheets (`style.css`, `hub.css`)
- `js/` — scripts (`main.js`, `hub.js`)
- `images/` — optimized images and thumbnails used by the site

## Development

No build step required — open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deployment

Deployed on Vercel. `.vercelignore` excludes source assets and local tooling from the deploy.
