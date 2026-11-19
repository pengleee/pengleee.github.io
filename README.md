# pengleee.github.io

Personal academic website of Peng Li. Plain HTML and one stylesheet, served by GitHub Pages; no build step.

## Structure

| Page | Content |
|---|---|
| `index.html` | Home: short bio, current research, projects, writing |
| `research.html`, `scopeshift.html` | Research interests; the ScopeShift study |
| `projects.html`, `rag.html`, `misinformation.html` | Course projects |
| `writing.html` + essays | Research sketch and essays |
| `cv.html`, `assets/Peng_Li_CV.pdf` | CV (HTML) and its printed PDF |
| `about.html`, `current-work.html`, `life.html` | Redirects kept for old links |

Design: one typeface (Source Serif 4 via Google Fonts, system-serif fallback), one accent colour, and a margin-label grid (`.intro`, `.row` > `.label` + `.body`) that stacks below 760px; light, dark, and print styles live in `styles.css`.

Every page repeats the same masthead (`<nav aria-label="Main navigation">`) and footer (`<div class="contact">`). When adding or renaming a page, update both on every page, `sitemap.xml`, and the page's own `description` and `canonical` tags; the tests check all of these.

## Preview and checks

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node tests/site.test.mjs
```

## CV

The source of truth for the CV is the separate `pengli-cv` repository. `cv.html` mirrors it without phone numbers. After changing `cv.html`, regenerate the PDF by printing the page (Chrome: Print → Save as PDF, Letter, default margins) to `assets/Peng_Li_CV.pdf`.

ScopeShift's repository is private; summarise its results on the site but do not link to it.
