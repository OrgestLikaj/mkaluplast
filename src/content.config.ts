import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Entries live in <collection>/<locale>/<slug>.md so the CMS can manage translations side by side.
// `translationKey` is identical across locales and links an EN page to its IT counterpart.

export const categories = [
  'windows',
  'doors',
  'shutters',
  'flyscreens',
  'railings',
  'partitions',
  'shade',
] as const;

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    title: z.string(),
    translationKey: z.string(),
    category: z.enum(categories),
    order: z.number().default(100),
    summary: z.string(),
    heroImage: z.string(),
    heroAlt: z.string().default(''),
    features: z
      .array(z.object({ title: z.string(), text: z.string() }))
      .default([]),
    types: z
      .array(
        z.object({
          name: z.string(),
          text: z.string().default(''),
          image: z.string().optional(),
          /** Technical data for this specific system, e.g. "Glazing: up to 48 mm". */
          specs: z.array(z.string()).default([]),
        }),
      )
      .default([]),
    gallery: z.array(z.string()).default([]),
    seoDescription: z.string().optional(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    translationKey: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    cover: z.string().optional(),
    coverAlt: z.string().default(''),
    /** Product category the article is about — drives filters and related products. */
    topic: z.enum(categories).optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    translationKey: z.string(),
    lead: z.string().optional(),
    heroImage: z.string().optional(),
    seoDescription: z.string().optional(),
    // Optional structured sections (used by the About page)
    headline: z.string().optional(),
    foundedYear: z.number().optional(),
    secondaryImage: z.string().optional(),
    statement: z.string().optional(),
    mission: z.string().optional(),
    timeline: z
      .array(z.object({ label: z.string(), title: z.string(), text: z.string() }))
      .default([]),
    reasons: z
      .array(z.object({ title: z.string(), text: z.string(), icon: z.string().optional() }))
      .default([]),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    items: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/home' }),
  schema: z.object({
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    heroImage: z.string(),
    // About-us teaser images; its text comes from the About page.
    aboutImage: z.string().optional(),
    aboutImageSecondary: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), text: z.string(), icon: z.string().optional() }))
      .default([]),
  }),
});

export const collections = { products, posts, pages, faq, home };
