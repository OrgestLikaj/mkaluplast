// Converts heavy images in public/uploads to WebP (max 2000px wide) and rewrites
// references in src/. Originals are moved to .originals/ (gitignored), not deleted.
//
//   node scripts/optimize-images.mjs [--min-kb=250]

import { readdir, stat, readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const UPLOADS = 'public/uploads';
const ORIGINALS = '.originals/uploads';
const MAX_WIDTH = 2000;
const minKb = Number(process.argv.find((a) => a.startsWith('--min-kb='))?.split('=')[1] ?? 250);

async function walk(dir, exts) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p, exts)));
    else if (exts.includes(path.extname(entry.name).toLowerCase())) out.push(p);
  }
  return out;
}

const candidates = await walk(UPLOADS, ['.png', '.jpg', '.jpeg', '.avif', '.svg', '.webp']);
const renames = new Map();
let before = 0;
let after = 0;

await mkdir(ORIGINALS, { recursive: true });

for (const file of candidates) {
  const { size } = await stat(file);
  if (size < minKb * 1024) continue;

  const ext = path.extname(file).toLowerCase();
  const target = file.slice(0, -ext.length) + '.webp';
  // SVGs from Canva often just wrap a PNG — rasterise them at high density.
  const input = ext === '.svg' ? sharp(file, { density: 200 }) : sharp(file);
  const buffer = await input
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toBuffer();

  if (ext === '.webp' && buffer.length >= size) continue;

  await rename(file, path.join(ORIGINALS, path.basename(file)));
  await writeFile(target, buffer);
  before += size;
  after += buffer.length;

  const from = '/' + path.relative('public', file).split(path.sep).join('/');
  const to = '/' + path.relative('public', target).split(path.sep).join('/');
  if (from !== to) renames.set(from, to);
  console.log(`${from}  ${(size / 1024).toFixed(0)}KB → ${to}  ${(buffer.length / 1024).toFixed(0)}KB`);
}

// Rewrite references in content, components and CMS config.
const sources = [
  ...(await walk('src', ['.md', '.json', '.astro', '.ts'])),
  'public/admin/config.yml',
];
for (const file of sources) {
  let text = await readFile(file, 'utf8');
  let changed = false;
  for (const [from, to] of renames) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    await writeFile(file, text);
    console.log(`updated refs in ${file}`);
  }
}

console.log(`\nTotal: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB`);
