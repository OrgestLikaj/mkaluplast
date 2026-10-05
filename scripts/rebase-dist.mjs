// Rewrites root-relative URLs in dist/ so the site works under a sub-path,
// e.g. GitHub Pages at https://<user>.github.io/mkaluplast/.
// Usage: node scripts/rebase-dist.mjs /mkaluplast
// Only used for the GitHub Pages preview — the Namecheap build is served from the root.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const base = (process.argv[2] ?? '').replace(/\/+$/, '');
if (!base.startsWith('/')) {
  console.error('Pass the sub-path, e.g. /mkaluplast');
  process.exit(1);
}

// attr="/path" (not protocol-relative "//"), later srcset entries and CSS url(/path)
const prefix = (s) =>
  s
    .replace(/(\s[\w:-]+=)(["'])\/(?!\/)/g, `$1$2${base}/`)
    .replace(/(srcset=["'][^"']*)/g, (m) => m.replace(/(,\s*)\/(?!\/)/g, `$1${base}/`))
    .replace(/url\((["']?)\/(?!\/)/g, `url($1${base}/`);

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}

let count = 0;
for await (const file of files('dist')) {
  if (!['.html', '.css'].includes(extname(file))) continue;
  const src = await readFile(file, 'utf8');
  const out = prefix(src);
  if (out !== src) {
    await writeFile(file, out);
    count++;
  }
}
console.log(`Rebased ${count} files under ${base}/`);
