import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(root).filter(p => p.endsWith('.html'));
for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8');
  assert.match(html, /<html lang="en">/, `${page}: page language`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${page}: one primary heading`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${page}: unique IDs`);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    const [path, fragment] = url.split('#');
    const target = resolve(root, path || page);
    assert.ok(existsSync(target), `${page}: missing ${url}`);
    if (fragment) assert.ok(readFileSync(target, 'utf8').includes(`id="${fragment}"`), `${page}: broken fragment ${url}`);
  }
  assert.doesNotMatch(html, /users\.noreply|\/Users\/|apple-notes-id|Employee ID|李鹏|Getting started with LaTeX|OPAN 3256|湖畔栽梧人|©|Last updated|Full-Stack Developer|CorpComment|https:\/\/linkedin.com"/, `${page}: stale or private content`);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1, `${page}: current navigation`);
}
console.log(`Passed: ${pages.length} pages, internal links, fragments, navigation, and privacy/stale-content checks.`);

for (const page of ['about.html', 'cv.html']) {
  const html = readFileSync(resolve(root, page), 'utf8');
  assert.match(html, /Graduate coursework in Data Science &amp; Analytics, 2024–2026/);
  assert.doesNotMatch(html, /Master of Science|M\.S\./);
}
for (const retired of ['teaching.html', 'documentary.html']) {
  assert.ok(!existsSync(resolve(root, retired)), `${retired}: retired content must not remain publicly accessible`);
}
