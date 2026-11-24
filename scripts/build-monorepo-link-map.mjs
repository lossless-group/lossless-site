#!/usr/bin/env node
/**
 * Build src/config/monorepo-link-map.json: every relative link in content that
 * points into the monorepo (e.g. ../../ai-labs/corpora-builder/context-v/specs/X.md)
 * mapped to a public URL.
 *
 *   1. The doc's page on the context-v-corpus site, when the corpus has a
 *      published copy (matched on the collator's `source_path`, confirmed
 *      against the corpus sitemap).
 *   2. Otherwise the file on GitHub, in the repo that contains it.
 *
 * Paths are keyed monorepo-root-relative with leading ../ and ./ stripped, which
 * is how remark-monorepo-links looks them up. Needs the monorepo checked out
 * locally; the output is committed so deploy builds don't.
 *
 * Usage: node scripts/build-monorepo-link-map.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, relative, dirname, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const siteDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(siteDir, 'src/config/monorepo-links.json'), 'utf8'));
const root = resolve(siteDir, config.monorepoRoot);
const contentDir = resolve(siteDir, config.contentDir);
const corpusDir = resolve(siteDir, config.corpus.dir);
const outFile = join(siteDir, 'src/config/monorepo-link-map.json');

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const normalize = (url) => decodeURI(url.split('#')[0]).replace(/^(\.\.?\/)+/, '');

// Astro's glob id: frontmatter slug if set, else each path segment slugged.
const slugSegment = (s) =>
  s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');

// ── 1. Links in content ─────────────────────────────────────────────────────
const linkRe = /\]\((\.\.\/[^)\s]+)\)/g;
const wanted = new Set();
for (const file of walk(contentDir)) {
  for (const m of readFileSync(file, 'utf8').matchAll(linkRe)) {
    const key = normalize(m[1]);
    if (key && existsSync(join(root, key))) wanted.add(key);
  }
}

// ── 2. Corpus pages, by source_path ─────────────────────────────────────────
let live = null;
try {
  const xml = await (await fetch(config.corpus.sitemapUrl)).text();
  live = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
} catch {
  console.warn('Could not fetch the corpus sitemap; corpus links will not be verified.');
}
const corpus = new Map();
if (existsSync(corpusDir)) {
  for (const file of walk(corpusDir)) {
    let data;
    try { ({ data } = matter(readFileSync(file, 'utf8'))); } catch { continue; }
    if (!data.source_path || data.publish === false || data.private === true) continue;
    const id = typeof data.slug === 'string' && data.slug.trim()
      ? data.slug.trim()
      : relative(corpusDir, file).replace(/\.md$/, '').split(sep).map(slugSegment).join('/');
    const url = `${config.corpus.siteUrl}${id}/`;
    if (live && !live.has(url)) continue;
    corpus.set(data.source_path, url);
  }
}

// ── 3. GitHub fallback ──────────────────────────────────────────────────────
const repoCache = new Map();
function githubUrl(key) {
  let dir = dirname(join(root, key));
  while (dir.startsWith(root) && !existsSync(join(dir, '.git'))) dir = dirname(dir);
  if (!repoCache.has(dir)) {
    let base = null;
    try {
      const remote = execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
      const m = remote.match(/github\.com[:/](.+?)(\.git)?$/);
      if (m) base = `https://github.com/${m[1]}`;
    } catch {}
    repoCache.set(dir, base);
  }
  const base = repoCache.get(dir);
  if (!base) return null;
  const kind = statSync(join(root, key)).isDirectory() ? 'tree' : 'blob';
  const path = relative(dir, join(root, key)).split(sep).map(encodeURIComponent).join('/');
  return `${base}/${kind}/${config.githubFallback.defaultBranch}/${path}`;
}

const map = {};
let toCorpus = 0, toGithub = 0, missed = [];
for (const key of [...wanted].sort()) {
  const url = corpus.get(key) ?? githubUrl(key);
  if (!url) { missed.push(key); continue; }
  corpus.has(key) ? toCorpus++ : toGithub++;
  map[key] = url;
}

writeFileSync(outFile, JSON.stringify(map, null, 2) + '\n');
console.log(`${Object.keys(map).length} links → ${toCorpus} corpus, ${toGithub} GitHub. Wrote ${relative(siteDir, outFile)}.`);
if (missed.length) console.log(`Unresolved (${missed.length}):\n  ${missed.join('\n  ')}`);
