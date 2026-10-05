// Rehype plugin for product pages: every `### Heading` immediately followed by a
// bullet list becomes a spec card, and consecutive cards are grouped into a grid.
// Editors keep writing plain Markdown in the CMS; only product files are touched.

const isEl = (node, tag) => node?.type === 'element' && node.tagName === tag;
const isBlank = (node) => node?.type === 'text' && !node.value.trim();

export default function rehypeSpecCards() {
  return (tree, file) => {
    const path = String(file?.path ?? file?.history?.[0] ?? '').replace(/\\/g, '/');
    if (!path.includes('/content/products/')) return;

    const kids = tree.children;
    const out = [];
    let grid = null;

    for (let i = 0; i < kids.length; i++) {
      const node = kids[i];
      if (isEl(node, 'h3')) {
        let j = i + 1;
        while (isBlank(kids[j])) j++;
        if (isEl(kids[j], 'ul')) {
          if (!grid) {
            grid = { type: 'element', tagName: 'div', properties: { className: ['spec-grid'] }, children: [] };
            out.push(grid);
          }
          grid.children.push({
            type: 'element',
            tagName: 'div',
            properties: { className: ['spec-card'] },
            children: [node, kids[j]],
          });
          i = j;
          continue;
        }
      }
      if (grid && isBlank(node)) continue;
      grid = null;
      out.push(node);
    }
    tree.children = out;
  };
}
