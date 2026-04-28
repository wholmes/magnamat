# mag·na·mat

**Magnetic maker mat for the Eufy Maker system** — marketing landing with a WebGL hero, scroll-driven product motion, and spec-driven storytelling.

**Repository:** [github.com/wholmes/magnamat](https://github.com/wholmes/magnamat)

---

## Product positioning (site copy)

### One-liner

Precision-engineered **magnetic print surface** for the Eufy Maker system: thousands of **micro-pin contacts** for strong adhesion during printing and **effortless release** when the print is done.

### Hero headline

**Grip. · Hold. · Release.** (Hold in brand red, Release in brand blue.)

### Eyebrow

**Eufy Maker System — Compatible**

### Hero stats (above the fold)

| Stat | Label |
|------|--------|
| **250+** | Pin contacts |
| **255°C** | Max bed temp |
| **0.1s** | Release time |

### Marquee ticker (repeating strip)

Blue gradient bar with white uppercase ticker text. Phrases include:

- Magnetic micro-pin matrix  
- Flex steel substrate  
- Eufy Maker compatible  
- 250+ contact points  
- 255°C rated  
- PLA · PETG · ABS · TPU · ASA  
- 0.01mm tolerance  
- 1,000+ cycle rating  

Animation: infinite horizontal scroll (`css/styles.css` — `.marquee-track`, ~22s linear); pauses on hover.

---

## Section: Features (`#features`)

**Label:** `// 01 — Engineering`  
**Headline:** Built **different.** (accent on “different.”)

### Card 1 — Micro-Pin Matrix

- **250+** individually tuned magnetic contact pins, distributed grip, **no dead zones**, even adhesion **edge to edge**.
- Visual: pin texture block labeled **60× magnified surface pattern** (decorative / sim, not literal microscopy).

### Card 2 — Flex-Release Tech

- **Spring steel core**: pop parts with a **single bow** — no tools, no scraping, no warped prints; mat returns **flat in under 0.1 seconds**.
- Decorative “flex 9.4 / 10” meter; **Hold** (during print) / **Pop** (when done) callouts.

### Card 3 — Material Agnostic

- **255°C** sustained bed temperature messaging; **1,000+ print cycles** without degradation.
- Filament tags: **PLA, PETG, ABS, TPU, ASA**, +more.

---

## Section: Specs (`#specs`)

**Label:** `// 02 — Technical`  
**Headline:** Spec **Sheet.** (accent on “Sheet.”)

### Callout tiles (left column)

| Value | Caption |
|-------|---------|
| **60×** | vs standard PEI |
| **∞** | Reuse cycles |

### Spec table (right column)

| Field | Value |
|-------|--------|
| Build surface | **235 × 235 mm** |
| Pin count | **250+** |
| Max bed temp | **255°C** |
| Surface tolerance | **±0.01 mm** |
| Substrate | **Flex spring steel** |
| Cycle rating | **1,000+ prints** |
| Release time | `< 0.1 s` |
| Adhesion vs PEI | **60× stronger** |
| Materials | **PLA · PETG · ABS · TPU · ASA** |

---

## Section: Compatibility (`#compat`)

**Label:** `// 03 — System`  
**Headline:** Designed for **Eufy.**

**Body:** Drop-in compatible with the full Eufy Maker platform; magnetic locking base plate; zero recalibration; no hardware mods — place and print.

**Badges**

| Status | Model |
|--------|--------|
| ✓ | Eufy Maker S3 |
| ✓ | Eufy Maker S2 |
| ○ | Future models (placeholder) |

---

## Navigation & footer

- **Nav:** Logo, anchor links to Features / Specs / Compatible, **Pre-Order** CTA (buttons are presentational unless wired later).
- **Footer:** © **2026** mag·na·mat — Precision Magnetic Surfaces; placeholder links Privacy / Terms / Contact.

---

## Visual design system (`css/styles.css`)

CSS custom properties (high level):

| Token | Role |
|-------|------|
| `--red` | Primary CTA, accents (`#E5342A`) |
| `--blue` | Secondary accent (`#3B9BE5`) |
| `--page`, `--page-2`, `--page-3`, `--card` | Background layers |
| `--ink`, `--ink-muted`, `--ink-soft`, `--ink-faint` | Text hierarchy |
| `--border` | Hairline UI |

**Typography (`next/font/google` in `app/fonts.ts`)**

- **Barlow** — body  
- **Barlow Condensed** — UI / stats / marquee  
- **Orbitron** — display utility (`font-display` in markup)  
- **Space Mono** — labels, specs, mono UI  

**Other UI**

- Fixed nav with blur; hero uses layered **gradients + grid** (`.hero-above-fold`).
- **Scroll reveal:** `.reveal` / `.revealed` via `IntersectionObserver` + one sync pass in `lib/mat-scene.ts`.
- **Nav spy:** `lib/nav-spy.ts` highlights in-nav section links while scrolling (`/features`, `/specs`, `/compat` or hash equivalents).

---

## 3D hero (`lib/mat-scene.ts` + `#mat-canvas`)

- **Eufy plate reference photo** — `public/images/hero-product-pinfield.png`, rendered with **`next/image`** in `components/marketing/hero-section.tsx` behind the canvas (`css/styles.css` — `.hero-product-photo`). Stays visible through the WebGL layer; the hero **shader sky** uses **moderate alpha** so the wash does not read as an opaque gray slab over the photo.
- **Three.js** `0.160.0` via npm; runtime booted from `components/client-runtime.tsx` after paint.
- **OrbitControls** — damped orbit, pan off, distance clamp, polar limits for overhead views.
- **Scene:** ACES tone mapping, soft shadows, hemisphere + directional lights, large **shader sky** sphere (subtle animated wash).
- **Product:** “Sandwich” — black base affix, steel frame + build plate, **instanced pin field** (Lambert pins), blue top sheet; gaps animate apart on **scroll** and extra on **hover** over the canvas.
- **Scroll “travel”:** `hero3dRoot` group wraps mat + field lines; long-scroll smoothstep drives **tilt / lift / drift** so the stack moves in frame without fighting orbit. **`prefers-reduced-motion: reduce`** disables that world travel (stack spread still follows scroll).
- **Default camera:** loaded from **CMS → Site & metadata → Hero 3D camera** (Postgres), injected as JSON in the marketing layout; bundled **`FALLBACK_HERO_SCENE_CAMERA`** in `lib/cms/hero-scene-camera.ts` if the DB row is missing.
- **View lock-in (`?adjust=1`)**
  - Panel: **Save view (this device)** → `localStorage` backup while tuning; **Copy JSON** → paste into CMS Hero 3D camera and save for all visitors; **Open CMS** → `/admin`; **Save zoom only** → localStorage orbit distance without `?adjust=1`; **Clear local & reload**.
  - While `?adjust=1` is on, a full **localStorage** preset still overrides the CMS script for that session so you can iterate without publishing.
  - **Console:** `window.__magnamatScene` — `saveLockedView()`, `clearLockedView()`, `copyJsonForCms()`, `logDefaultAngle()` (debug).

---

## Project layout

```
magnamat/
├── app/                  # Next.js App Router (layout, page, fonts, /admin CMS)
├── middleware.ts       # /features, /specs, /compat → rewrite /
├── vercel.json         # Vercel: Next preset, build/install, /index.html → /
├── components/         # React sections, nav, cart, client runtime
├── lib/                # mat-scene (Three), nav-spy, cart, yt-lightbox, CMS queries
├── prisma/             # PostgreSQL schema, migrations, seed
├── public/images/      # Static assets (logos, hero-product-pinfield.png, etc.)
├── legacy/
│   └── index.html      # Pre-Next single-page reference (not used by `next dev`)
├── favicon.svg
├── package.json
├── tailwind.config.js
├── css/
│   ├── styles.css      # Design tokens, hero, marquee, cards, reveals
│   ├── tailwind-input.css
│   └── tailwind.css    # Generated (run build:css)
├── images/             # Source art; key vectors copied to public/images/
├── scripts/
│   ├── trace-logo-svg.py
│   └── requirements-trace.txt
└── font-preview.html     # Optional font scratch page
```

---

## Database (PostgreSQL)

The app uses **PostgreSQL** via Prisma so you can use **Neon** in production and a **local Postgres** (Docker, Homebrew, or a Neon dev branch) for development.

- **`DATABASE_URL`** — only required variable in `prisma/schema.prisma`. Use your normal Postgres or Neon connection string here.
- **Neon + connection pooling:** if `prisma migrate` (not `db push`) ever errors against a pooled URL, run that command once using Neon’s **direct** (non-pooler) connection string, or reintroduce `directUrl` in the Prisma schema per [Neon’s Prisma guide](https://neon.tech/docs/guides/prisma).

Example local Postgres with Docker:

```bash
docker run --name magnamat-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=magnamat -p 5432:5432 -d postgres:16
```

Or use **`docker compose up -d`** with this repo’s `docker-compose.yml` (Postgres on **5434** — see `.env.docker.example`).

Then set `DATABASE_URL` in `.env` to point at `127.0.0.1:5432` (see `.env.example`).

---

## CMS (your own admin)

- **Sign in:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (production: `/admin/login` on your domain).
- **After login:** authenticated **CMS shell** with a **left sidebar** — navigate between **Site & metadata** (`/admin`: chrome JSON, settings, SEO) and **Home page** (`/admin/content`: full marketing JSON). **View live site** and **Log out** live in the sidebar footer.
- **Home page copy** uses `MarketingPageContent` in `lib/cms/marketing-content.ts`; saves go to `MarketingPage`. Server actions call **`revalidateAfterCmsWrite()`** so `/`, `/features`, `/specs`, `/compat`, `/robots.txt`, and admin routes pick up new data without a redeploy.
- **Hero 3D camera** — JSON on **`HeroSceneCamera`** (Site & metadata). Injected into the marketing layout as `#magnamat-hero-scene-config`; `lib/mat-scene.ts` reads it on load. Use **`?adjust=1`** to tune, then paste the same JSON shape into the CMS (localStorage still wins while `?adjust=1` is on).
- **SEO / staging:** in **Site & metadata → SEO**, **Discourage search indexing** sets `noindex` on pages and a restrictive **`/robots.txt`** (use for preview hosts).
- **Environment:** set **`CMS_ADMIN_PASSWORD`** and **`CMS_SESSION_SECRET`** (≥ 24 characters) in `.env`. The session cookie is **httpOnly**, **signed** (HMAC), scoped to **`/admin`**, and cleared on **Log out**.

There is no third-party CMS product — only this repo’s Prisma models + admin UI.

### Database & migrations

- Prefer **`npm run db:migrate:deploy`** (or **`db:migrate:dev`** locally) over `db push` for anything that should ship to production.
- If the app errors with **`SeoSettings.noIndex` does not exist** (older DB from `db push`), run **`npm run db:fix-seo-noindex`** once.
- If core tables are missing (e.g. seed fails with **`MarketingPage` does not exist**), run **`npm run db:bootstrap-db`** once, or **`npm run db:ensure-core-tables`** then **`npm run db:seed`**. (`db:fix-hero-scene-camera` is an alias for `db:ensure-core-tables`.)
- **Docker Postgres on port 5434:** `npm run db:up` (see `.env.docker.example` → copy to `.env.docker`), then `npm run db:migrate:deploy:local` and `npm run db:seed:local`.
- **Upgrading an older DB** that was created with `db push` only: add missing columns to match `prisma/schema.prisma`, then **`npx prisma migrate resolve`** / baseline per [Prisma docs](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining), or reset the database and run **`npm run db:migrate:deploy`** on an empty instance.

**Internal UTM helpers** for future nav/CTA work: `lib/utm.ts` (`appendUtmToUrl`).

---

## Deployment (Vercel)

- **Framework:** Next.js App Router. Repo **`vercel.json`** pins **`framework: "nextjs"`**, **`buildCommand`**: `prisma generate && next build`, **`installCommand`**: `npm install`, and clears a bad dashboard override with **`outputDirectory": null`**. Set **`DATABASE_URL`** (and CMS secrets if you use admin) in the Vercel project environment.
- **Clean URLs** for `/features`, `/specs`, `/compat` are handled in **`middleware.ts`** (rewrite to `/`); do not point legacy **`vercel.json` rewrites** at a non-existent **`/index.html`** (that caused platform **`NOT_FOUND`** before this setup).
- **Project settings:** root directory **`.`**, framework **Next.js**, leave **Output directory** empty unless you know you need an override (wrong output dir can serve an empty tree and 404 everything).

---

## Local development

**Next.js app:** copy `.env.example` to `.env`, fill Postgres URLs and CMS secrets, then migrate and seed.

```bash
cp .env.example .env
# edit .env — DATABASE_URL, CMS_ADMIN_PASSWORD, CMS_SESSION_SECRET
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

**Stale `.next` / missing chunk errors** (e.g. `Cannot find module './124.js'`): stop all dev and start processes, then run **`npm run clean`** and **`npm run build`** (or **`npm run dev:fresh`** to clean and start dev). Avoid running **`next dev`** and **`next build`** against the same `.next` folder at the same time.

For a quick throwaway DB without migration history you can still use `npx prisma db push`, but production-style deploys should use **`db:migrate:deploy`**.

If **`db:migrate:deploy`** fails with an empty / non-baselined database (e.g. P3005 on Neon), run **`npm run db:bootstrap-db`** once instead: it creates core tables from `prisma/sql/ensure_core_cms_tables.sql`, applies the `noIndex` column fix, and seeds.

**Rebuild Tailwind** after editing `css/tailwind-input.css` (if you still use the CLI pipeline):

```bash
npm install
npm run build:css
```

---

## Disclaimer

This repository is a **marketing / demo** site. Product claims, model names (Eufy Maker S2/S3), and metrics mirror on-page copy and are **not independently verified** in this README. Wire CTAs, legal pages, and analytics before production launch.
