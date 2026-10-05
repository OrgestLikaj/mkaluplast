// One-off migration: move "### <type name>" + bullet lists out of product Markdown
// bodies into the matching type's `specs` field (frontmatter), and keep the section
// heading as `specsTitle`. Only blocks whose heading exactly matches a type name move;
// anything else stays in the body untouched.
//
//   node scripts/migrate-specs.mjs [--dry]

import { readFile, writeFile } from 'node:fs/promises';
import { globSync } from 'node:fs';
import yaml from 'js-yaml';

const dry = process.argv.includes('--dry');
const files = globSync('src/content/products/*/*.md');

for (const file of files) {
  const raw = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) continue;
  const data = yaml.load(match[1]);
  let body = match[2];
  const types = data.types ?? [];
  if (!types.length || !/^### /m.test(body)) continue;

  // Find each "## Section" that contains "### " blocks.
  const sections = [...body.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)];
  let moved = 0;
  for (const [sectionText, title, content] of sections) {
    const blocks = [...content.matchAll(/^### (.+)\n+((?:- .*\n?)+)/gm)];
    if (!blocks.length) continue;

    const leftover = content.replace(/^### (.+)\n+((?:- .*\n?)+)/gm, (whole, name, list) => {
      const type = types.find((t) => t.name.trim() === name.trim());
      if (!type) return whole;
      type.specs = list
        .trim()
        .split('\n')
        .map((l) => l.replace(/^- /, '').trim())
        .filter(Boolean);
      moved++;
      return '';
    });

    if (leftover.trim() === '') {
      body = body.replace(sectionText, '');
      data.specsTitle = title.trim();
    } else {
      body = body.replace(sectionText, `## ${title}\n${leftover}`);
    }
  }

  if (!moved) continue;
  body = body.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  const front = yaml.dump(data, { lineWidth: -1, quotingType: '"', forceQuotes: true, noRefs: true });
  console.log(`${file}: moved ${moved} spec blocks${data.specsTitle ? ` (title: ${data.specsTitle})` : ''}`);
  if (!dry) await writeFile(file, `---\n${front}---\n\n${body.trimStart()}`);
}
