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

## 3D / WebGL (`lib/mat-scene.ts`)

Runtime is booted from `components/client-runtime.tsx` after paint. **`js/main.mjs`** mirrors the same URL flags and preset keys for **`legacy/index.html`**.

### Hero (`#mat-canvas`)

- **Eufy plate reference photo** — `public/images/hero-product-pinfield.png`, rendered with **`next/image`** in `components/marketing/hero-section.tsx` behind the canvas (`css/styles.css` — `.hero-product-photo`). Stays visible through the WebGL layer; the hero **shader sky** uses **moderate alpha** so the wash does not read as an opaque gray slab over the photo.
- **Three.js** `0.160.0` via npm.
- **OrbitControls** — damped orbit, pan off, distance clamp, polar limits for overhead views.
- **Scene:** ACES tone mapping, soft shadows, hemisphere + directional lights, large **shader sky** sphere (subtle animated wash).
- **Product:** “Sandwich” — black base affix, steel frame + build plate, **instanced pin field** (Lambert pins), blue top sheet; gaps animate apart on **scroll** and extra on **hover** over the canvas.
- **Scroll “travel”:** `hero3dRoot` group wraps mat + field lines; long-scroll smoothstep drives **tilt / lift / drift** so the stack moves in frame without fighting orbit. **`prefers-reduced-motion: reduce`** disables that world travel (stack spread still follows scroll).
- **Default camera:** loaded from **CMS → Site & metadata → Hero 3D camera** (Postgres), injected as JSON in the marketing layout; bundled **`FALLBACK_HERO_SCENE_CAMERA`** in `lib/cms/hero-scene-camera.ts` if the DB row is missing.

### Features — “Built different” (`#mat-canvas-scroll`)

- Second scene in the Features section: **mug / 3D model** modes, **CSS2D** callouts (Top sheet, Pin matrix, Flex steel), print preset toolbar; shares the same procedural mat stack as the hero path where applicable.
- **Default camera:** if **Site & metadata → Features 3D camera** (`FeaturesSceneCamera` in Postgres) is saved, the marketing layout injects **`#magnamat-features-scene-config`** (same JSON shape as the hero). Otherwise the client uses the **hero** CMS camera plus a small **built-in framing nudge** for the jig. **`prefers-reduced-motion: reduce`** skips booting this canvas entirely.
- **Tuning is separate from the hero:** use **`?adjustFeatures=1`** or **`?adjustScroll=1`** (alias). Legacy **`?adjust=1` alone does not** turn on the features tuner — only the hero — so you can tune one viewport without the other.
- **While tuning:** `localStorage` **`magnamat-view-preset-features`** overrides the injected CMS JSON for that session (hero uses **`magnamat-view-preset`**). Publish by pasting **Copy JSON** into **Features 3D camera** in admin and saving.
- **Console (when features tuning is on):** `window.__magnamatSceneFeatures` — `saveLockedView()`, `clearLockedView()`, `copyJsonForCms()`, `logDefaultAngle()`, etc.

### View lock-in — URL flags

| Query (or hash, e.g. `#?adjustFeatures=1`) | Effect |
|--------------------------------------------|--------|
| **`adjust=1`** | **Hero** tuning: floating panel, wheel zoom on canvas, touch orbit unlock on narrow viewports. Full preset in **`magnamat-view-preset`** overrides CMS for that session. |
| **`adjustHero=1`** | Same as **`adjust=1`** for the hero only (explicit hero flag). |
| **`adjustHero=0`** | Turns **hero** tuning **off** even if **`adjust=1`** is present (useful with **`adjustFeatures=1`**). |
| **`adjustFeatures=1`** | **Features** column WebGL only: panel + zoom/orbit unlock; preset **`magnamat-view-preset-features`**. |
| **`adjustScroll=1`** | Alias for **`adjustFeatures=1`** (matches the scroll canvas id). |

**Hero panel:** **Save view (this device)** → `magnamat-view-preset`; **Copy JSON** → CMS **Hero 3D camera**; **Open CMS** → `/admin`; **Save zoom only** → `magnamat-default-zoom` (also applies without adjust flags); **Clear local & reload** clears hero preset + default zoom.

**Features panel:** same actions scoped to **`magnamat-view-preset-features`**; **Open CMS** opens **`/admin`** (paste into **Features 3D camera**); clear does **not** remove **`magnamat-default-zoom`** (shared zoom key).

**Console — hero:** `window.__magnamatScene` — `saveLockedView()`, `clearLockedView()`, `copyJsonForCms()`, `logDefaultAngle()`.

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

The app uses **PostgreSQL** via Prisma. **Use a local database for day-to-day development** (Docker in this repo, or Homebrew Postgres). Pointing **`next dev`** at a remote Neon branch is brittle: cold starts, pooler timeouts, and network blips surface as random “can’t reach database” errors during CMS saves.

- **`DATABASE_URL`** — required in `prisma/schema.prisma`. For local work, keep it on **127.0.0.1** (see `.env.example`, default **5434** to match `docker-compose.yml`).
- **Production / Vercel:** set `DATABASE_URL` in the project environment to Neon or any managed Postgres. That string does not belong in the `.env` you use for local `next dev` unless you are deliberately debugging against production data.
- **Neon + migrations:** if `prisma migrate deploy` errors against a **pooled** Neon URL, run it once with Neon’s **direct** (non-pooler) connection string, or add `directUrl` per [Neon’s Prisma guide](https://neon.tech/docs/guides/prisma).

**Recommended local stack** (matches `.env.example`):

```bash
npm run db:up
npm run db:migrate:deploy
npm run db:seed
```

If **`port is already allocated`** on **5434**, something else is using that port (old container, another Postgres). Either stop it (`docker ps`, `docker stop …`) or pick a free port in **`.env`**: set **`POSTGRES_HOST_PORT`** and **`DATABASE_URL`** to the same port (for example `55434`), then run **`npm run db:up`** again. Compose reads **`.env`** in the repo root for `POSTGRES_HOST_PORT`.

Optional one-off container on port **5432** instead:

```bash
docker run --name magnamat-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=magnamat -p 5432:5432 -d postgres:16
```

If you use **5432**, set `DATABASE_URL` in `.env` accordingly.

**Prisma CLI + separate env file:** `npm run db:migrate:deploy:local` and `npm run db:seed:local` load **`.env.docker`** (see `.env.docker.example`). That is optional; if `DATABASE_URL` in `.env` already points at the compose DB on **5434**, plain `db:migrate:deploy` / `db:seed` are enough.

---

## CMS (your own admin)

- **Sign in:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (production: `/admin/login` on your domain).
- **After login:** authenticated **CMS shell** with a **left sidebar** — navigate between **Site & metadata** (`/admin`: chrome JSON, settings, SEO) and **Home page** (`/admin/content`: full marketing JSON). **View live site** and **Log out** live in the sidebar footer.
- **Home page copy** uses `MarketingPageContent` in `lib/cms/marketing-content.ts`; saves go to `MarketingPage`. Server actions call **`revalidateAfterCmsWrite()`** so `/`, `/features`, `/specs`, `/compat`, `/robots.txt`, and admin routes pick up new data without a redeploy.
- **Hero 3D camera** — JSON on **`HeroSceneCamera`** (Site & metadata). Injected as `#magnamat-hero-scene-config`. Use **`?adjust=1`** or **`?adjustHero=1`** to tune; **`magnamat-view-preset`** in localStorage still wins for the hero while those flags are on.
- **Features 3D camera** — JSON on **`FeaturesSceneCamera`** (same schema as hero). Injected as **`#magnamat-features-scene-config`** only after you save a row in Site & metadata. Until then, the features canvas uses the hero CMS preset + built-in nudge. Tune with **`?adjustFeatures=1`**; **`magnamat-view-preset-features`** overrides for that session until you publish via CMS.
- **SEO / staging:** in **Site & metadata → SEO**, **Discourage search indexing** sets `noindex` on pages and a restrictive **`/robots.txt`** (use for preview hosts).
- **Environment:** set **`CMS_ADMIN_PASSWORD`** and **`CMS_SESSION_SECRET`** (≥ 24 characters) in `.env`. The session cookie is **httpOnly**, **signed** (HMAC), scoped to **`/admin`**, and cleared on **Log out**.

There is no third-party CMS product — only this repo’s Prisma models + admin UI.

### Database & migrations

- Prefer **`npm run db:migrate:deploy`** (or **`db:migrate:dev`** locally) over `db push` for anything that should ship to production.
- **`P3015` / “Could not find the migration file at migration.sql”:** every folder under **`prisma/migrations/`** (except `migration_lock.toml`) must contain **`migration.sql`**. Remove stray empty directories (e.g. an aborted `migrate dev` folder). If files are missing, run **`git checkout -- prisma/migrations`**. After a failed deploy, reset the local DB volume if needed: **`docker compose down -v`** then **`npm run db:up`** and migrate again.
- If the app errors with **`SeoSettings.noIndex` does not exist** (older DB from `db push`), run **`npm run db:fix-seo-noindex`** once.
- If core tables are missing (e.g. seed fails with **`MarketingPage` does not exist**), run **`npm run db:bootstrap-db`** once, or **`npm run db:ensure-core-tables`** then **`npm run db:seed`**. (`db:fix-hero-scene-camera` is an alias for `db:ensure-core-tables`.)
- If **`FeaturesSceneCamera` does not exist** (admin save on Features 3D camera fails), run **`npm run db:migrate:deploy`** on that database, or once: **`npm run db:fix-features-scene-camera`** (idempotent `CREATE TABLE IF NOT EXISTS`).
- **Docker Postgres on port 5434:** `npm run db:up`, then `npm run db:migrate:deploy` and `npm run db:seed` with `DATABASE_URL` in `.env` pointing at **5434** (default in `.env.example`). The `db:*:local` scripts are for a separate **`.env.docker`** file only if you use that workflow.
- **Upgrading an older DB** that was created with `db push` only: add missing columns to match `prisma/schema.prisma`, then **`npx prisma migrate resolve`** / baseline per [Prisma docs](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining), or reset the database and run **`npm run db:migrate:deploy`** on an empty instance.

**Internal UTM helpers** for future nav/CTA work: `lib/utm.ts` (`appendUtmToUrl`).

---

## Deployment (Vercel)

- **Framework:** Next.js App Router. Repo **`vercel.json`** pins **`framework: "nextjs"`**, **`buildCommand`**: `prisma generate && next build`, **`installCommand`**: `npm install`, and clears a bad dashboard override with **`outputDirectory": null`**. Set **`DATABASE_URL`** (and CMS secrets if you use admin) in the Vercel project environment.
- **Clean URLs** for `/features`, `/specs`, `/compat` are handled in **`middleware.ts`** (rewrite to `/`); do not point legacy **`vercel.json` rewrites** at a non-existent **`/index.html`** (that caused platform **`NOT_FOUND`** before this setup).
- **Project settings:** root directory **`.`**, framework **Next.js**, leave **Output directory** empty unless you know you need an override (wrong output dir can serve an empty tree and 404 everything).
- **Node version:** `package.json` **`engines.node`** (`>=20.9.0`) is honored by many hosts (including Vercel) so production builds use a compatible Node release unless you override it in the project dashboard.

---

## Local development

**Next.js app:** copy `.env.example` to `.env`, set CMS secrets, start **local** Postgres, then migrate and seed.

```bash
cp .env.example .env
# edit .env — CMS_ADMIN_PASSWORD, CMS_SESSION_SECRET (DATABASE_URL defaults to Docker on 5434)
npm run db:up
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Restart **`next dev`** whenever you change `DATABASE_URL` in `.env`.

**Stale `.next` / missing chunk errors** (e.g. `Cannot find module './124.js'`): stop all dev and start processes, then run **`npm run clean`** and **`npm run build`** (or **`npm run dev:fresh`** to clean and start dev). Avoid running **`next dev`** and **`next build`** against the same `.next` folder at the same time.

**Node.js version (`package.json` → `engines`):** The repo sets **`"engines": { "node": ">=20.9.0" }`** — that is npm’s way of declaring the **supported Node.js runtime** (not WebGL or any other “engine”). It nudges local tooling and platforms such as **Vercel** toward **Node 20.9+**, which matches **Next.js 15** expectations. If your machine is older, upgrade Node (e.g. `nvm`, Volta, or your OS installer); `npm install` may warn when the range is not satisfied.

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
