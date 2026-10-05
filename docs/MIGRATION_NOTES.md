# Migration notes: mkaluplast.com (WordPress) to Astro

Source scraped on 2026-10-02 from https://mkaluplast.com (EN default) and https://mkaluplast.com/it/ (Italian, WPML).
Italian counterparts were found through each EN page's `hreflang="it"` alternate link.

## 1. Migrated URLs and their new files

### Products

| Old EN URL | EN file | Old IT URL | IT file |
|---|---|---|---|
| /pvc-windows/ | products/en/pvc-windows.md | /it/finestre-in-pvc/ | products/it/finestre-in-pvc.md |
| /thermal-aluminum-windows/ | products/en/thermal-aluminum-windows.md | /it/finestre-in-alluminio-a-taglio-termico/ | products/it/finestre-in-alluminio-a-taglio-termico.md |
| /pvc-doors/ | products/en/pvc-doors.md | /it/porte-in-pvc/ | products/it/porte-in-pvc.md |
| /thermal-aluminum-doors/ | products/en/thermal-aluminum-doors.md | /it/porte-in-alluminio-a-taglio-termico/ | products/it/porte-in-alluminio-a-taglio-termico.md |
| /security-doors/ | products/en/security-doors.md | /it/porte-blindate/ | products/it/porte-blindate.md |
| /shutters/ | products/en/shutters.md | /it/persiane/ | products/it/persiane.md |
| /flyscreen-systems/ | products/en/flyscreen-systems.md | /it/sistemi-di-zanzariere/ | products/it/sistemi-di-zanzariere.md |
| /railings/ | products/en/railings.md | /it/ringhiere/ | products/it/ringhiere.md |
| /wall-partitions/ | products/en/wall-partitions.md | /it/pareti-divisorie/ | products/it/pareti-divisorie.md |
| /outdoor-shade-systems/ | products/en/outdoor-shade-systems.md | /it/sistemi-di-ombreggiatura-per-esterni/ | products/it/sistemi-di-ombreggiatura-per-esterni.md |

`translationKey` is the EN slug for both languages.

### Blog posts (EN only, no Italian versions exist)

| Old URL | New file |
|---|---|
| /2026/02/14/flyscreen-systems-fresh-air-without-insects-and-without-compromising-style/ | posts/en/flyscreen-systems-fresh-air-without-insects-and-without-compromising-style.md |
| /2026/02/14/how-to-reduce-outside-noise-with-better-windows-and-doors/ | posts/en/how-to-reduce-outside-noise-with-better-windows-and-doors.md |
| /2026/02/14/partition-walls-a-smart-way-to-create-more-space-without-major-construction/ | posts/en/partition-walls-a-smart-way-to-create-more-space-without-major-construction.md |
| /2026/02/14/pvc-vs-aluminium-windows-which-one-is-better-for-insulation-and-comfort/ | posts/en/pvc-vs-aluminium-windows-which-one-is-better-for-insulation-and-comfort.md |
| /2026/02/14/rolling-shutters-security-shade-and-better-energy-efficiency-in-one-upgrade/ | posts/en/rolling-shutters-security-shade-and-better-energy-efficiency-in-one-upgrade.md |

### Pages and data

| Old URL | New file |
|---|---|
| / (home) | home/en.json (hero rewritten; intro, steps from site copy) |
| /it/ | home/it.json |
| /about-company/ | pages/en/about.md |
| /it/informazioni-sullazienda/ | pages/it/about.md |
| /faqs/ + home page FAQ block | faq/en.json |
| /it/faq-domande-frequenti/ + IT home FAQ block | faq/it.json |
| /contact-us/, footer, IT footer | settings/site.json |
| /partners/, /it/partneri/ | partner logos only, in settings/site.json (`partners`); page body not migrated (demo text) |
| /careers/, /it/carriere/ | not migrated (see issues) |
| /category/blog/, /it/category/blog/ | replaced by the new blog index |

## 2. Redirect map (old to new)

Product URLs keep their slugs, so they need no redirect: `/pvc-windows/` stays `/pvc-windows/`, `/it/persiane/` stays `/it/persiane/`, and so on for all 10 products in both languages.

```
# Blog
/2026/02/14/flyscreen-systems-fresh-air-without-insects-and-without-compromising-style/   /blog/flyscreen-systems-fresh-air-without-insects-and-without-compromising-style/   301
/2026/02/14/how-to-reduce-outside-noise-with-better-windows-and-doors/                     /blog/how-to-reduce-outside-noise-with-better-windows-and-doors/                     301
/2026/02/14/partition-walls-a-smart-way-to-create-more-space-without-major-construction/   /blog/partition-walls-a-smart-way-to-create-more-space-without-major-construction/   301
/2026/02/14/pvc-vs-aluminium-windows-which-one-is-better-for-insulation-and-comfort/       /blog/pvc-vs-aluminium-windows-which-one-is-better-for-insulation-and-comfort/       301
/2026/02/14/rolling-shutters-security-shade-and-better-energy-efficiency-in-one-upgrade/   /blog/rolling-shutters-security-shade-and-better-energy-efficiency-in-one-upgrade/   301
/category/blog/                     /blog/        301
/it/category/blog/                  /it/blog/     301
/it/2026/05/21/3047/                /it/blog/     301   (broken IT post, already 404 on the old site)
# Generic pattern for any IT post that gets added later: /it/YYYY/MM/DD/<slug>/ -> /it/blog/<slug>/

# Pages
/about-company/                     /about/       301
/it/informazioni-sullazienda/       /it/about/    301
/contact-us/                        /contact/     301
/it/contattaci/                     /it/contact/  301
/faqs/                              /faq/         301
/it/faq-domande-frequenti/          /it/faq/      301

# Pages not rebuilt (send to a sensible destination until the client provides content)
/partners/                          /about/       302
/it/partneri/                       /it/about/    302
/careers/                           /contact/     302
/it/carriere/                       /it/contact/  302
```

## 3. Images

All images are in `public/uploads/` and referenced as `/uploads/<file>`. Originals were downloaded with WordPress size suffixes stripped (for example `4-1280x600.png` became `4.png`, saved as `pvc-windows.png`). Exceptions:

- `blog-partition-walls.jpg` uses the WP `-scaled` (2560px) version. The true original is 4.4 MB.
- `about-hero.jpg` (4979x3319) was extracted from the JPEG embedded in the old `PVC-Windows-1700-x-1000-px.svg`.
- Several "SVG" files (Alumil series, flyscreen and railing drawings, partner logos, logos) are Canva exports that wrap PNG data. They are heavy (up to 1.4 MB each), so consider converting them to WebP/PNG.

Downloaded but not referenced in content yet. They are available for layouts:
- `logo-mk-aluplast.svg`, `logo-mk-aluplast-small.svg`: brand logos.
- `category-windows.png`, `category-doors.png`, `rolling-shutters.png` (this one is also used on the shutters page), `category-railings-fences.png`, `category-partition-walls.png`, `category-flyscreen-systems.png`: home page category icons.
- `window-type-sliding.gif`, `window-type-hinged.webp`, `window-type-folding.webp`, `shutter-type-*.webp`, `flyscreen-type-*.webp`: mega-menu "by type" thumbnails.
- `pvc-windows-doors.webp`, `glass-aluminium-railings.webp`, `door-shutters-persian-roll-up.webp`, `aluminium-doors-windows.webp`, `solar-awnings.webp`: "What we do" slider on the old home page. These are social-media posters with baked-in text and the phone number, so they are not suitable as hero photos.
- `nature.webp`: home "Climate" card (400x700 portrait).
- `about-brand.webp`: the "mkaluplast logo" image from the About page (file name says ChatGPT-generated).
- `partner-*-photo.jpg`: partner photos from the Partners page (they look like they came from Facebook).

Skipped as theme demo assets: everything under `/uploads/2017/` (businesswoman-corporate-colleagues, video.jpg, slider_3a.jpg, hipster-manager, architecture-construction, stock-market-trading, team portraits 23.jpg/tt3.jpg/tt4.jpg, country flag SVGs), and the WPML flag icons.

## 4. Content issues to raise with the client

### Placeholder or demo content on the live site
1. **Contact page is entirely theme filler** (EN and IT): "GLB United States, 2307 Beverley Rd Brooklyn, New York 11226", GLB Canada (36 Toronto Street) and GLB UK (Witan Gate House, Milton Keynes) addresses, the phone numbers +0 712-0610-3314 / +1 416 865 4311 / +44 (0) 117923 0600, the email `sales@glb.theme`, and fake team members (Ar. Melligeri, Jennifer Ashley, Jack Durburg, each with an @glb.theme email). The form's subject options (Investor Relations and so on) are also theme defaults.
2. **EN footer** still shows "Find us: 2307 Beverley Rd, Brooklyn, New York 11226, United States" and phone "0712-0610-3314". The **IT footer** has the real number, +355 68 82 82 474, and no address. The IT footer also shows "Errore: Modulo di contatto non trovato." (the contact form is missing).
3. **No real email, street address, city, map, WhatsApp, Facebook, LinkedIn or YouTube** were found anywhere. `settings/site.json` leaves these empty. Only the phone (+355 68 82 82 474, also printed on the social posters), Instagram (@mkaluplast), opening hours (Mon to Sat, 07:00 to 18:00, from the IT footer) and the country (Albania, from the About page) are confirmed. Confirm whether the +355 number is also on WhatsApp.
   - The LinkedIn link in the footer (`linkedin.com/in/orgestlikaj`) is the developer credit ("Designed and developed by O.L"), not a company profile.
   - The YouTube video embedded on the home page (`HfQa1ZQ32vc`, with the 2017 `video.jpg` poster) is a theme demo and no longer resolves.
4. **About page** (EN and IT) contains demo blocks: "Our Services: Tackling the complexity that lies beneath business processes…" and "Industries: Understanding business process requires understanding the industry…", with stock photos from 2017. The "Our Mission is to Become The Best Aluminium Provider in Albania" banner is untranslated on the IT page. The demo blocks were dropped; the real company text was kept.
5. **FAQ page** hero is a demo stock photo (alt text "Software & Hi-Tech"), and the section heading says "Corporate". Not migrated.
6. **Partners page**: the intro is generic theme text ("ecosystem of partners… world's leading business and technology companies"), and the CTA asks people to email `business.partnerships@glb.theme`. The partner photos have no captions. Only the 4 brand logos were migrated.
7. **Careers page**: the counters show "0+ Countries, 0+ Industries, 0 You" (broken counters). The job text is generic, with no role title, location or way to apply. Not migrated; decide whether a careers page is needed.
8. **Home page**: the "Climate / Unique Project / Customers" cards are still in English on the IT home page, and one card uses a 2017 demo photo (businesswoman-corporate-colleagues). On the IT home, the "Doors" category tile is mislabelled "FINESTRE IN PVC E ALLUMINIO".
9. **Footer CTA** text says the company helps choose "aluminium windows and doors" only, while the business also does PVC. Minor, but worth aligning.

### Copy and data errors on product pages
10. **Shutters**: the ZIP shutters description is copy-pasted from Rolling shutters. All three shutter types share identical "technical characteristics" (aluminium slats, 50 mm frame depth, powder coating). The new site uses the mega-menu descriptions for ZIP and hinged shutters and shows the specs once for the whole range. Ask for per-type specs.
11. **Flyscreens**: the hinged and sliding descriptions are identical on the old page, so the mega-menu descriptions were used instead. The EN heading says "Slided Flyscreen Systems"; this is fixed. The mega-menu thumbnails for "minimal" and "hinged" flyscreens are the same image file.
12. **PVC windows**: "greenEvolution curve" reuses the "straight" image, and "flex / flex A" reuses the "box" image. The site lacks distinct images for these. The "greenEvolution free" description ("The standard design's design window…") was garbled and has been rewritten. greenEvolution straight lists sound insulation and burglar resistance as "currently being tested"; confirm whether figures are available now.
13. **PVC doors**: bluEvolution 82 uses an image file named `bluevolution-92-1`, and its description has no product-specific information. Confirm the image and specs. The PVC doors hero image is named `pvc-windows.png` on the old site and its alt text describes windows.
14. **Thermal aluminium windows and doors**: both pages list the same five Alumil series with identical text. Confirm which series apply to windows and which to doors. The S77 entry has no sash depth.
15. **Security doors**: no models, specs or types are given; there are only photos. Ask for models, security class, and so on.
16. **Outdoor shade systems**: no types or specs are given. The awning types in the new content (retractable, balcony, patio, window) come from the page prose. The hero photo shows a third-party shop front ("rouvalis Flowers & Gardens"), so check the image rights or replace it with the company's own project photo.
17. **Wall partitions**: there is only a short description. The type list ("Glass partitions") comes from the mega menu. Consider asking for specs.
18. **Railings and partitions images**: the type images are Canva SVGs with embedded PNGs. Real project photos would be better.
19. **About page** mentions "shower cabins" in the product portfolio, but there is no product page for them. Ask whether a page is wanted.

### Italian translation gaps
20. **No Italian blog posts.** The IT blog archive lists a post "Zanzariere Scorrevoli" (21 May 2026) at `/it/2026/05/21/3047/`, which returns **404**. The 5 EN posts have no IT versions.
21. Several IT pages contain untranslated English fragments, for example on finestre-in-pvc ("Installation height up to 2.80 m", "up to Uw = …", "Burglar resistance: up to RC 3") and on finestre-in-alluminio ("Minimum visible width frame-vent", "2.6 inch"). These were translated in the new IT files. Have a native speaker review them.
22. The IT partners page keeps EN alt texts for Alumil, Weiss and Everest, and the H1 "Partnerships & Affiliations" is in English.
23. `pages/it/about.md` uses the existing Italian page (lightly edited); no machine translation was needed. The IT "Chi siamo" title replaces the old "Informazioni sull'azienda".

### Missing or weak images
24. There are no real project or installation photos; most visuals are renders, stock photos or Canva posters. A gallery of completed projects would strengthen the site considerably.
25. The rolling-shutters blog post cover actually shows hinged wooden shutters, and the image is small (800x350).
26. The mega-menu brand logo SVGs (`/2026/02/1.svg` to `4.svg`) duplicate the partner logos and were not downloaded. Their alt text misspells "Wiess Profil".

### Editorial decisions made during migration
- The home hero was rewritten ("Windows and doors, built to measure." / "Finestre e porte, realizzate su misura."). The hero image is `about-hero.jpg`, the largest architectural photo available.
- Home stats use only figures the site states: founded 1999, and "more than two decades" of experience (shown as 20+). No other numbers were invented.
- The 4 process steps (consultation and measuring, profile and glass selection, manufacturing, installation) are based on the footer and FAQ copy ("From measuring and profile selection to glazing options and installation planning…", "we'll arrange measurement + a tailored offer").
- Product `features` are distilled from each page's prose. `types` hold the profile systems or variants shown on each page, and technical facts are kept verbatim in the markdown body under "Technical data" / "Dati tecnici". Imperial conversions (inches) were dropped.
- The EN and IT FAQs merge the FAQ page with the 3-question FAQ block on the home page; duplicate questions were combined.
