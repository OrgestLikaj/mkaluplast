// Sitemaps in the same shape and at the same URLs as the old WordPress core sitemap,
// so Search Console keeps reading /wp-sitemap.xml (and /it/wp-sitemap.xml):
//   /wp-sitemap.xml                        index
//   /wp-sitemap-posts-page-1.xml           pages + products
//   /wp-sitemap-posts-post-1.xml           blog articles
//   /wp-sitemap-taxonomies-category-1.xml  blog index
// The same set exists under /it/ and /sq/.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getProducts, getPosts, splitId } from '../lib/content';
import { locales, routes, productUrl, blogUrl, type Lang } from '../i18n/ui';

type Entry = { loc: string; lastmod?: Date };

const site = import.meta.env.SITE.replace(/\/$/, '');
const abs = (path: string) => `${site}${path}`;
const prefix = (lang: Lang) => routes.home[lang].slice(1); // '' | 'it/' | 'sq/'

async function sections(lang: Lang) {
  const products = await getProducts(lang);
  const posts = await getPosts(lang);
  const pages: Entry[] = [
    routes.home[lang],
    routes.about[lang],
    routes.contact[lang],
    routes.partners[lang],
    routes.faq[lang],
    routes.products[lang],
    ...products.map((p) => productUrl(lang, splitId(p.id).slug)),
  ].map((path) => ({ loc: abs(path) }));
  const articles: Entry[] = posts.map((p) => ({
    loc: abs(blogUrl(lang, splitId(p.id).slug, p.data.date)),
    lastmod: p.data.date,
  }));
  // WordPress only lists the category archive when it has posts.
  const categories: Entry[] = posts.length ? [{ loc: abs(routes.blog[lang]) }] : [];
  return {
    'posts-post-1': articles,
    'posts-page-1': pages,
    'taxonomies-category-1': categories,
  };
}

const urlset = (entries: Entry[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
    .map(
      (e) =>
        `<url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString().replace('.000Z', '+00:00')}</lastmod>` : ''}</url>`,
    )
    .join('')}</urlset>\n`;

const sitemapindex = (locs: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locs
    .map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`)
    .join('')}</sitemapindex>\n`;

export const getStaticPaths = (async () => {
  const paths = [];
  for (const lang of locales) {
    const parts = Object.entries(await sections(lang)).filter(([, entries]) => entries.length > 0);
    const file = (name: string) => `${prefix(lang)}wp-sitemap-${name}.xml`;
    paths.push({
      params: { sitemap: `${prefix(lang)}wp-sitemap.xml` },
      props: { body: sitemapindex(parts.map(([name]) => abs(`/${file(name)}`))) },
    });
    for (const [name, entries] of parts) {
      paths.push({ params: { sitemap: file(name) }, props: { body: urlset(entries) } });
    }
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(props.body as string, { headers: { 'Content-Type': 'application/xml; charset=UTF-8' } });
