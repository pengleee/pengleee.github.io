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

Design: one typeface (Source Sans 3 via Google Fonts, system sans-serif fallback), one accent colour, and a margin-label grid (`.intro`, `.row` > `.label` + `.body`) that stacks below 760px; light, dark, and print styles live in `styles.css`.

Every page repeats the same masthead (`<nav aria-label="Main navigation">`) and footer (`<div class="contact">`). When adding or renaming a page, update both on every page, `sitemap.xml`, and the page's own `description` and `canonical` tags; the tests check all of these.

## Preview and checks

```sh
python3 -m http.server 4173 --bind 127.0.0.1
node tests/site.test.mjs
```

## CV

The source of truth for the CV is the separate `pengli-cv` repository. `cv.html` mirrors it without phone numbers. After changing `cv.html`, regenerate the PDF by printing the page (Chrome: Print → Save as PDF, Letter, default margins) to `assets/Peng_Li_CV.pdf`.

## ScopeShift paper

`assets/Li_2026_ScopeShift.pdf` is a byte-for-byte copy of `paper/main.pdf` on the `master` branch of the private ScopeShift repository (the signed `preprint` build, not the anonymous `scopeshift-acl` review copy). Replace it whenever that PDF is rebuilt, and update the summary on `scopeshift.html` to match.

ScopeShift's repository is private; summarise its results on the site but do not link to it.
