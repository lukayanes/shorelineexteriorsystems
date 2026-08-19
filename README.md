# Shoreline Exterior Systems — website

Static site. No build step required to deploy: everything in this folder is the site.

## Deploy (GitHub Pages)
1. Push the contents of this folder to the repo root.
2. Settings → Pages → Deploy from a branch → `main` / `root`.
3. Custom domain: `shorelineexteriorsystems.com` (the `CNAME` file is already here). Enable *Enforce HTTPS*.

## Editing
Pages are generated from `build.py` (kept alongside the project, not deployed).
Change the data at the top of that script and re-run it to regenerate every page —
that keeps the nav, footer, and shared sections identical across all 25 pages.

## Key values
- Phone: (941) 265-1028
- Email: shorelineexteriorsystems@gmail.com
- Quote form: GoHighLevel inline form (`https://links.summitflowcrm.com/widget/form/PtxB1LEEP12T8JGlHb1I`)
- Analytics: GA4 `G-BRMXR8MN86`
