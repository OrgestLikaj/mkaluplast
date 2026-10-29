import { getCollection, type CollectionEntry } from 'astro:content';
import { categories } from '../content.config';
import { locales, productUrl, blogUrl, type Lang } from '../i18n/ui';
import site from '../content/settings/site.json';

export { site, categories };
export type Category = (typeof categories)[number];

/** Entry ids look like "en/pvc-windows" — split into locale + slug. */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

export async function getProducts(lang: Lang) {
  const all = await getCollection('products', ({ id }) => splitId(id).lang === lang);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getPosts(lang: Lang) {
  const all = await getCollection(
    'posts',
    ({ id, data }) => splitId(id).lang === lang && !data.draft,
  );
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPage(lang: Lang, key: string) {
  const all = await getCollection('pages');
  return (
    all.find((p) => splitId(p.id).lang === lang && p.data.translationKey === key) ??
    all.find((p) => splitId(p.id).lang === 'en' && p.data.translationKey === key)
  );
}

export function groupByCategory(products: CollectionEntry<'products'>[]) {
  return categories
    .map((cat) => ({ cat, items: products.filter((p) => p.data.category === cat) }))
    .filter((g) => g.items.length > 0);
}

type Alternates = Partial<Record<Lang, string>>;

/** Map of locale → URL for the other-language versions of a product or post. */
export async function alternatesFor(
  collection: 'products' | 'posts',
  translationKey: string,
): Promise<Alternates> {
  const entries = await getCollection(collection);
  const out: Alternates = {};
  for (const e of entries) {
    if (e.data.translationKey !== translationKey) continue;
    const { lang, slug } = splitId(e.id);
    out[lang] = e.collection === 'posts' ? blogUrl(lang, slug, e.data.date) : productUrl(lang, slug);
  }
  return out;
}

/** Main markets for schema.org `areaServed` (the business also takes projects elsewhere). */
export function areaServedLd() {
  const countries = site.areaServed ?? [];
  return countries.length ? countries.map((name) => ({ '@type': 'Country', name })) : undefined;
}

/** Opening hours in the visitor's language (falls back to English). */
export function hoursFor(lang: Lang) {
  const localized: Partial<Record<Lang, string>> = { it: site.hoursIt, sq: site.hoursSq };
  return localized[lang] || site.hours;
}

/** URL-safe id from a display name: "greenEvolution flex / flex A" → "greenevolution-flex-flex-a". */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readingTime(body = '') {
  return Math.max(1, Math.round(body.split(/\s+/).length / 200));
}

export function isLang(v: string): v is Lang {
  return (locales as readonly string[]).includes(v);
}
