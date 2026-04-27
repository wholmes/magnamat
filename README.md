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
| Release time | **&lt; 0.1 s** |
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

**Typography (Google Fonts)**

- **Barlow** — body  
- **Barlow Condensed** — UI / stats / marquee  
- **Orbitron** — display utility (`font-display` in markup)  
- **Space Mono** — labels, specs, mono UI  

**Other UI**

- Fixed nav with blur; hero uses layered **gradients + grid** (`.hero-above-fold`).
- **Scroll reveal:** `.reveal` / `.revealed` via `IntersectionObserver` + one sync pass in `js/main.mjs`.
- **Nav spy:** `js/nav-spy.mjs` highlights in-nav section links while scrolling (`#features`, `#specs`, `#compat`).

---

## 3D hero (`js/main.mjs` + `#mat-canvas`)

- **Three.js** `0.160.0` via **import map** in `index.html` (jsDelivr ESM).
- **OrbitControls** — damped orbit, pan off, distance clamp, polar limits for overhead views.
- **Scene:** ACES tone mapping, soft shadows, hemisphere + directional lights, large **shader sky** sphere (subtle animated wash).
- **Product:** “Sandwich” — black base affix, steel frame + build plate, **instanced pin field** (Lambert pins), blue top sheet; gaps animate apart on **scroll** and extra on **hover** over the canvas.
- **Scroll “travel”:** `hero3dRoot` group wraps mat + field lines; long-scroll smoothstep drives **tilt / lift / drift** so the stack moves in frame without fighting orbit. **`prefers-reduced-motion: reduce`** disables that world travel (stack spread still follows scroll).
- **Default camera (no saved preset):** spherical placement around orbit target; default distance **`CAM_DISTANCE = 16.35`**, polar **38°**, azimuth **128°** (tune in code).
- **View lock-in**
  - **`?adjust=1`:** panel to save view to **`localStorage`** key `magnamat-view-preset`, copy a **`main.mjs` snippet**, or clear. That save is **only on your machine** until you paste into the repo.
  - **Default for every visitor:** use **Copy main.mjs snippet** (or `__magnamatScene.copyLockedViewSnippet()`), replace the **`else`** branch defaults in `startScene()` — the `CAM_DISTANCE` / `CAM_POLAR_DEG` / `CAM_AZIMUTH_DEG` + `orbitTarget` block and the default **`matGroup.rotation`** lines — then commit and deploy. Optional: drop the `loadViewPreset()` branches if you no longer want localStorage to override shipped angles.
  - **Console:** `window.__magnamatScene` — `saveLockedView()`, `clearLockedView()`, `copyLockedViewSnippet()`, `logDefaultAngle()` (alternate debug paste).

---

## Project layout

```
magnamat/
├── index.html          # Page structure, import map, sections
├── favicon.svg
├── package.json        # Tailwind build script
├── tailwind.config.js
├── css/
│   ├── styles.css      # Design tokens, hero, marquee, cards, reveals
│   ├── tailwind-input.css
│   └── tailwind.css    # Generated (run build:css)
├── js/
│   ├── main.mjs        # WebGL scene, scroll physics, reveal helper
│   └── nav-spy.mjs     # Active nav state vs scroll
├── images/
│   ├── logo.png               # raster source (reference)
│   ├── logo-transparent.svg   # site logo (vector, transparent)
│   └── logo.svg               # same artwork + white backdrop (optional export)
├── scripts/
│   ├── trace-logo-svg.py   # Regenerate logo.svg (vector contours, not pixel rects)
│   └── requirements-trace.txt  # pip install -r scripts/requirements-trace.txt
└── font-preview.html     # Optional font scratch page
```

---

## Local development

No bundler: open **`index.html`** through a **local static server** (ES modules + import map require HTTP(S), not `file://`).

Examples:

```bash
npx serve .
# or
python3 -m http.server 8080
```

**Rebuild Tailwind** after editing `css/tailwind-input.css`:

```bash
npm install
npm run build:css
```

---

## Disclaimer

This repository is a **marketing / demo** site. Product claims, model names (Eufy Maker S2/S3), and metrics mirror on-page copy and are **not independently verified** in this README. Wire CTAs, legal pages, and analytics before production launch.
