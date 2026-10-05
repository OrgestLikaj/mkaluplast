# MK AluPlast — website

Static Astro site (EN default + IT + SQ/Albanian) with a Git-based CMS. Hosted on Namecheap shared hosting.

```
GitHub repo ──push──▶ GitHub Action (build) ──FTPS──▶ Namecheap public_html
     ▲
     └── client edits content at /admin (Sveltia CMS commits to the repo)
```

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # output in dist/
```

## Content

All content is in `src/content/`, one folder per language:

| What | Where | URL |
|---|---|---|
| Products | `products/{en,it,sq}/<slug>.md` | `/<slug>/`, `/it/<slug>/` (same URLs as the old WordPress site), `/sq/<slug>/` |
| Blog | `posts/{en,it,sq}/<slug>.md` | `/blog/<slug>/`, `/it/blog/<slug>/`, `/sq/blog/<slug>/` |
| About page | `pages/{en,it,sq}/about.md` | `/about/`, `/it/chi-siamo/`, `/sq/rreth-nesh/` |
| Homepage texts | `home/{en,it,sq}.json` | `/`, `/it/`, `/sq/` |
| FAQ | `faq/{en,it,sq}.json` | `/faq/`, `/it/faq/`, `/sq/pyetje/` |
| Phone, email, address, partners | `settings/site.json` | everywhere |
| Images | `public/uploads/` | `/uploads/…` |

`translationKey` links an English entry to its Italian and Albanian translations, so all of them must use the same value. UI labels (buttons, menu) live in `src/i18n/ui.ts`; the language-switcher flags are `public/flags/<locale>.svg` (from the MIT-licensed flag-icons project).

## One-time server setup (Namecheap cPanel)

1. **PHP version:** cPanel → *Select PHP Version* → 8.1 or newer.
2. **Email:** create the mailbox used as `mail_from` (e.g. `noreply@mkaluplast.com`) so form emails pass SPF.
3. **Config file:** upload `deploy/mk-config.example.php` to your home directory, **one level above** `public_html`, rename it to `mk-config.php`, and fill it in.
4. **FTP account:** cPanel → *FTP Accounts*. Then add these GitHub repo secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`.
5. **Staging first:** create the subdomain `new.mkaluplast.com` and point `FTP_SERVER_DIR` at its folder. Set the repo variable `NOINDEX=true`. Change `base_url` in `public/admin/config.yml` to the staging domain while testing.
6. **Go live:** back up the WordPress files and database, empty `public_html` (keep `.well-known/`), set `FTP_SERVER_DIR=public_html/`, remove `NOINDEX`, and re-run the workflow.

## CMS login (/admin)

1. GitHub → Settings → Developer settings → **OAuth Apps** → New:
   - Homepage URL: `https://mkaluplast.com`
   - Callback URL: `https://mkaluplast.com/oauth/callback.php`
2. Put the client ID and secret in `mk-config.php`.
3. Set `backend.repo` in `public/admin/config.yml` to the real repo.
4. Add the client as a collaborator on the GitHub repo. They sign in at `https://mkaluplast.com/admin/` with GitHub.

Each save in the CMS creates a commit, and the site redeploys automatically within about 2 minutes.
