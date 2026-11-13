# Megha Pareek, portfolio

Multi-page static site built with Astro. Each project is a story page, and the three analysis projects carry an interactive exhibit drawn from the project's own data.

## Run it

```
npm install
npm run dev      # local development
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Pages

| Route | File |
|---|---|
| `/` | `src/pages/index.astro` |
| `/work/` | `src/pages/work/index.astro` |
| `/work/<project>/` | `src/pages/work/[slug].astro`, one page per file in `src/content/projects/` |
| `/about/` | `src/pages/about.astro` |
| `/contact/` | `src/pages/contact.astro` |

## Adding a project

1. Copy any file in `src/content/projects/` and rename it. The file name becomes the URL.
2. Edit the front matter: `question` (the headline), `summary`, `hue` (card colour), `art` (illustration), `order`, `tags`, `stack`, and optional `stats`, `links`, `method`, `limits`.
3. Set `lens` ranks for the roles it suits (`analytics`, `science`, `engineering`, `ai`). Rank 1 shows first for that role. Leave a role out if the project is not relevant to it.
4. Write the story in Markdown below the front matter.

The home page, work index, filters and role switch pick it up automatically. Allowed values for `hue`, `art` and `exhibit` are listed in `src/content.config.ts`. A new illustration is a new entry in `src/components/Art.astro`.

## Role lens

The switch reorders projects by area of work. The choice is kept in the address as `?lens=analytics` (or `science`, `engineering`, `ai`), so a link can be sent already set to the right role. Intro lines per lens are in `lenses` in `src/data/content.ts`.

## Other content

- `src/data/content.ts`: contact details, lens text, experience, education, awards, skills, quotes, and the text for the three exhibits.
- **Photo**: put the image in `public/` and set `person.photoUrl`.
- **Resume**: put the PDF in `public/` and set `person.resumeUrl`.
- **Contact form**: create a free access key at web3forms.com and set `person.formKey`. The form stays hidden until then.
- **Quotes**: add entries to `quotes`; the section appears once the list is non-empty.

## Updating the UPI charts

After re-running the UPI analysis, copy `master.json`, `forecast.json` and `brand_share.json` from `UPI/analysis/dashboard/` into `src/data/upi/`, then update the figures quoted in `content.ts`, `src/content/projects/upi-payments.md` and the end labels in `src/exhibits/upi/`.

## Deploying

```
npm run deploy
```

This builds the site and publishes it to the `gh-pages` branch, which GitHub Pages serves at https://megha9306.github.io. Push source changes to `main` separately with `git push`.

To deploy automatically on every push instead, grant the GitHub CLI the workflow permission (`gh auth refresh -s workflow`), move `.github/deploy-workflow.yml.disabled` to `.github/workflows/deploy.yml`, and set the Pages source to GitHub Actions in the repository settings.
