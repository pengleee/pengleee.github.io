// Static checks for the site. Run: node tests/site.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root, p), 'utf8');
const all = readdirSync(root).filter(p => p.endsWith('.html'));
const isRedirect = html => /http-equiv="refresh"/.test(html);
const special = new Set(['404.html']);
const pages = all.filter(p => !special.has(p) && !isRedirect(read(p)));

// Terms that must never be published. Stored as SHA-256 so this public file does not
// itself disclose them. To add one: node -e "console.log(require('crypto').createHash('sha256').update('TERM').digest('hex'), 'TERM'.length)"
// `digits` entries are matched against the page with all non-digits removed (phone numbers).
const BLOCKED = {
  text: [
    ['ac2e5da71c01c035d594c8ead71745bfc500348689c03cbf4e0c77829e3d0fbb', 2],
    ['296daf46975532f1b68e038c92975cfa6dfd5633b5ca055aa1d9948e15af0560', 5],
    ['5b35379a1a604492fb6a692893b450da77ac30b2463b4b010a9fef242e7099f4', 14],
    ['564bc04ebb5f83f0e4d79044e24b0a979f9f6da069e59b7928f1b63d71f92fd1', 11],
    ['b69b09aa53dc835046c7cbd08ba8331776fe3ebe54b35d18935096df9d820153', 11],
    ['5a32ac6f7e4040b3820edaa3bd0c4e5a0b2c10cedeeae974cd93285f8a6f6809', 20],
  ],
  digits: [
    ['155da58bf7337445a30518982e4da3624095d2ab19b2e33bde47987c4d151bdd', 11],
    ['7f0eb72d231516b070b33475db6844305933e9dfa5fa7fdb415deb93713c5360', 11],
  ],
};
const sha = s => createHash('sha256').update(s).digest('hex');
function containsBlocked(text, list) {
  for (const [hash, len] of list) {
    for (let i = 0; i + len <= text.length; i++) if (sha(text.slice(i, i + len)) === hash) return true;
  }
  return false;
}

const navOf = html => (html.match(/<nav aria-label="Main navigation">([\s\S]*?)<\/nav>/) || [])[1]?.replace(/ aria-current="page"/g, '');
const contactOf = html => (html.match(/<div class="contact">([\s\S]*?)<\/div>/) || [])[1];
const referenceNav = navOf(read('index.html'));
const referenceContact = contactOf(read('index.html'));

for (const page of all) {
  const html = read(page);
  for (const [, url] of html.matchAll(/(?:href|src|content)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(url) || !/\.(html|css|js|svg|jpe?g|pdf|xml)(#.*)?$/.test(url) && !url.startsWith('#')) continue;
    const [path, fragment] = url.replace(/^\d+; url=/, '').split('#');
    const target = resolve(root, (path || page).replace(/^\//, '') || 'index.html');
    assert.ok(existsSync(target), `${page}: missing ${url}`);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), `${page}: broken fragment ${url}`);
  }
  assert.ok(!containsBlocked(html, BLOCKED.text), `${page}: contains a blocked private term`);
  assert.ok(!containsBlocked(html.replace(/\D/g, ''), BLOCKED.digits), `${page}: contains a private phone number`);
  assert.doesNotMatch(html, /users\.noreply|\/Users\/|©|Last updated|Getting started with LaTeX|https:\/\/linkedin\.com"/, `${page}: stale content`);
}

for (const page of pages) {
  const html = read(page);
  assert.match(html, /<html lang="en">/, `${page}: page language`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${page}: one primary heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: unique IDs`);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `${page}: current navigation`);
  assert.equal(navOf(html), referenceNav, `${page}: navigation differs from index.html`);
  assert.equal(contactOf(html), referenceContact, `${page}: sidebar contact differs from index.html`);
  assert.match(html, /<meta name="description" content="[^"]{40,}">/, `${page}: description`);
  assert.match(html, /<link rel="canonical" href="https:\/\/pengleee\.github\.io\//, `${page}: canonical URL`);
  for (const [, alt] of html.matchAll(/<img\b[^>]*?alt="([^"]*)"/g)) assert.ok(alt.length > 0, `${page}: image alt text`);
}
const descriptions = pages.map(p => read(p).match(/<meta name="description" content="([^"]+)"/)[1]);
assert.equal(new Set(descriptions).size, descriptions.length, 'each page has its own description');

// Every indexable page is in the sitemap, and nothing else is.
const sitemap = read('sitemap.xml');
const listed = [...sitemap.matchAll(/<loc>https:\/\/pengleee\.github\.io\/([^<]*)<\/loc>/g)].map(m => m[1] || 'index.html');
assert.deepEqual([...listed].sort(), [...pages].sort(), 'sitemap matches indexable pages');

// Academic record: Georgetown is coursework, not a degree.
for (const page of pages) assert.doesNotMatch(read(page), /Master of Science|M\.S\.|master's degree/i, `${page}: no completed master's degree`);
assert.match(read('cv.html'), /Graduate coursework in Data Science and Analytics/);

// ScopeShift's repository is private: never link it.
for (const page of all) assert.doesNotMatch(read(page), /github\.com\/pengleee\/scopeshift/i, `${page}: private repository link`);

for (const retired of ['teaching.html', 'documentary.html', 'profile.css']) {
  assert.ok(!existsSync(resolve(root, retired)), `${retired}: retired file must not be published`);
}
assert.ok(existsSync(resolve(root, 'assets/Peng_Li_CV.pdf')), 'CV PDF is published');

console.log(`Passed: ${pages.length} pages (+${all.length - pages.length} redirects/404): links, navigation, metadata, sitemap, privacy.`);
