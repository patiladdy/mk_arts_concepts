# MK Art Concepts — Portfolio Website

**Concept:** *Line to Living* — every room starts as a sketch and becomes a real space.
Pure **HTML + CSS + JavaScript**. No frameworks, no build tools, no paid libraries. Works on GitHub Pages as is.

## What's inside

| Page | What it does |
|---|---|
| `index.html` | Hero you can drag from sketch to photo · selected work with an "x-ray" sketch lens on hover · pinned room-by-room walkthrough with a floor-plan minimap and tape-measure progress bar · golden-hour-to-night slider · material swatches · services with hover previews · process · studio · contact with map, WhatsApp and call |
| `project.html?p=…` | Monograph page for each project: sketch/photo hero, spec sheet, sticky room navigation, editorial gallery, full-screen lightbox (keyboard + swipe), next-project link |
| `materials.html` | Moodboard you can drag (with inertia). Filter by material (brass, jaali, velvet, leather, 3D panels, tile, timber, stone, glass, drapery, light, greenery) |
| `404.html` | Branded not-found page |

The **Day / Night** switch in the nav changes the whole site and the hero photo. On a first visit, the site picks the mode from the visitor's local time (night after 7 pm). The choice is remembered after that.

## Projects (auto-identified from the photos)

| # | Name (placeholder) | Type | Frames |
|---|---|---|---|
| 01 | The Terrace House | Residence | 36 |
| 02 | The Chamber | Commercial · Office | 11 |
| 03 | The Floating Stair House | Residence · Duplex | 19 |

78 photos were supplied: **66 are used** and 12 were left out (people in the frame, clothes or clutter, near-duplicates).
See `PHOTO_MAP.csv` for where every original photo went.

## Deploy to GitHub Pages (5 minutes)

1. Create a new GitHub repository, e.g. `mkartconcepts`.
2. Upload **everything in this folder** (keep the folder structure).
3. Go to **Settings → Pages → Build and deployment**, set Source to **Deploy from a branch**, then select `main` / `root` and **Save**.
4. After about a minute, the site is live at `https://<your-username>.github.io/mkartconcepts/`.
5. Optional: add a custom domain such as `mkartconcepts.in` under Settings → Pages.

## Editing content

* **Project names, descriptions, captions:** edit `assets/js/data.js` (plain text: `title`, `lede`, `kind`, `cap`).
* **Material swatches:** these are in `window.MATERIALS` at the bottom of `assets/js/data.js`.
* **Phone / address / opening time:** edit `window.SITE` at the top of `assets/js/main.js`.
  ⚠ The opening time is set to **10:00** as an assumption. Only "closes 7:30 pm" was provided, so please confirm.
* **Shared header/footer:** edit `_source/partials/*.html` and `_source/src/*.html`, then run `python _source/build.py`.
  (Or just edit `index.html` / `project.html` / `materials.html` directly.)

## Adding a new project

1. Export photos as `.webp`: one large version (about 1800 px on the long side) named `01-living.webp`, plus a small one (about 760 px) named `01-living-s.webp`.
2. Put them in `assets/img/<project-id>/`.
3. Add a project block in `assets/js/data.js`, copying an existing one.
4. Optional: add a sketch at `assets/img/sketch/<project-id>.webp` (same size as the cover photo). The hover lens and hero reveal use it.

## Tech notes

* Fonts are loaded from Google Fonts: Fraunces (display), Manrope (body), JetBrains Mono (labels), Caveat (notes).
* All motion is custom vanilla JS: IntersectionObserver reveals, parallax, a pinned horizontal scroll, inertial dragging and a custom cursor.
* `prefers-reduced-motion` is respected. Images are WebP with `srcset` and lazy loading.
* The "sketches" are generated from the real photos using edge detection. You can replace them with Manoj's actual hand sketches or CAD drawings (same filename and size) for an even stronger story.
