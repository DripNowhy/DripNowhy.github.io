# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static academic portfolio for Yi Ding (PhD student, Purdue CS), deployed via GitHub Pages at `https://dripnowhy.github.io/`. Pure HTML/CSS/JS — no build step, no package manager, no CI. Pushing to `main` publishes.

## Development Server

`config.yml` is fetched at runtime, so `file://` will not work. Serve over HTTP:

```bash
python -m http.server    # or: npx http-server
```

## Cache Busting (do not forget)

`index.html` loads its own assets with version query strings:

```html
<link rel="stylesheet" href="styles.css?v=20260805-paper-1">
<script defer src="script.js?v=20260805-paper-1"></script>
```

After editing `styles.css` or `script.js`, bump the corresponding `?v=` value. GitHub Pages caches aggressively; without a bump, returning visitors get stale assets.

## Content: index.html is the source of truth, config.yml partially overrides it

Nearly all content (about, research, news, publications, education, services) is hand-written HTML in `index.html`.

`config.yml` covers only three things — profile block, nav links, social links — and those exist **twice**: hardcoded in `index.html` *and* re-rendered from YAML at runtime by `renderProfile` / `renderNavigation` / `renderSocialLinks` (`script.js`). Keep both in sync:
- The HTML is what search crawlers and no-JS visitors see.
- The YAML wins once JS runs.

Two normalizers smooth over drift between the files (`script.js:57-79`): `normalizeIcon` rewrites legacy FontAwesome 5 classes (`fas` → `fa-solid`, `fa-twitter` → `fa-x-twitter`), and `normalizeAnchor` maps `config.yml`'s `#about-anchor`-style hrefs onto the real section ids (`#about`). A `fallbackConfig` at the top of `script.js` is used if the fetch or YAML parse fails.

`externalizeLinks()` adds `target="_blank" rel="noopener noreferrer"` to every non-hash, non-mailto link after render — don't add those attributes by hand.

## Design system

Single centred column (`--page-width: 760px`), cool neutral palette (deliberately **not** warm — no cream or yellow casts), and three fonts with strictly separate jobs:

| Token | Font | Used for |
| --- | --- | --- |
| `--font-serif` | EB Garamond, 19px | all reading text, publication/repo/education titles |
| `--font-hand` | Annie Use Your Telescope | hero name, `.section-title`, `.interest-keyword`, motto, topbar name |
| `--font-mono` | JetBrains Mono | *every* piece of metadata — nav, venue labels, dates, years, tags, footer |

Keep that split when adding anything: prose is serif, a heading is the hand font, and anything date/label/tag-like is mono and small. Mixing them arbitrarily is what made the earlier Inter-everywhere version look generic.

**Annie Use Your Telescope ships a single weight (400).** Every `var(--font-hand)` rule nonetheless asks for `font-weight: 700` — this is a deliberate choice to let the browser synthesise the bold, because the natural weight read too light at display sizes. Consequence: **never set `font-synthesis-weight: none`** anywhere up the tree, or all five headings silently snap back to regular. If the synthesised bold ever looks mushy, the fix is a family that ships a real bold (Kalam or Caveat), not a lighter `font-weight`.

It also has an unusually tall cap-height (0.713 em) and deep descenders (−0.409 em), so hand-font sizes run ~12% smaller than you would set for a typical script face, with `line-height` at 1.16–1.35 rather than 1. Swapping this family out means re-tuning both.

Colours are custom properties declared twice at the top of `styles.css`: once under `:root, :root[data-theme="light"]` and once under `:root[data-theme="dark"]`. **Add new colours as tokens in both blocks** — no raw hex values below the token blocks, apart from the sprite flash effects.

Section headings use `.section-title`, a flex row whose `::after` is a hairline rule that fills the remaining width. An optional `.section-note` span sits between the text and the rule.

There is no CSS framework and no build step, so the cascade is hand-managed: `styles.css` is ordered base → topbar → hero → trail → sections → responsive.

## The trail (the one decorative element)

`.trail` is a `position: fixed` strip pinned to the bottom of the viewport (`--trail-height`), holding a hairline horizon and two sprite characters (a person and a cat). It doubles as a reading progress bar: `initScrollSpy()` writes scroll progress (0…1) into the CSS variable `--journey-progress` on `.trail`, and CSS consumes it twice —

- `.traveler-stage` is placed with `inset-inline-start: calc(var(--journey-progress) * 100%)` plus `translateX(calc(var(--journey-progress) * -100%))`, so the pair sits flush left at the top of the page and flush right at the bottom, never overhanging either edge.
- `.trail-line` is a gradient whose colour-stop sits at the same percentage, so the path behind them is drawn in `--accent` and the path ahead stays `--rule`.

`.trail` spans the viewport (so its `::before` can fade page content out edge to edge), but everything visible lives inside `.trail-track`, which repeats `.page`'s `width: min(100% - 3rem, var(--page-width))`. **Keep those two width rules in sync** — the walked path is meant to line up with the reading column. `.trail-readout` is the small mono percentage at the right end.

`.trail` is `pointer-events: none` with `.traveler-stage` re-enabling them. `.page` reserves `--trail-height` as bottom padding so the footer clears it. Character size is `--stage-width`; the sprite box is square, so the trail must stay at least `--stage-width + 20px` tall or the characters clip out of the band.

## Conway background

`initLifeField()` runs Conway's Game of Life on `.life-canvas`, a fixed full-viewport canvas at `z-index: 0` with `.page` lifted to `z-index: 1` above it. Deliberately near-invisible: cell colour comes from the `--life-cell` token (accent at ~6% alpha) and each cell keeps a separate `alpha` value that eases toward 0 or 1, so cells fade in as they are born and dissolve as they die instead of popping.

The field is confined to the two side gutters. A `mask-image` on the canvas punches out the reading column, with stops derived from the same `min(100% - 3rem, var(--page-width))` expression `.page` uses — **change one and you must change the other**, or the cells will creep under the text. The simulation still runs edge to edge underneath, so patterns cross behind the column and re-emerge. `toggleAt()` bails on clicks inside `.page`'s bounding rect so the playable area matches the painted area, and the canvas is hidden below 720px where the gutters collapse to ~16px.

- The grid wraps toroidally, and `step()` re-sprinkles when population drops below 2.5% — a plain Conway field stalls into still lifes within a minute otherwise.
- The canvas itself is `pointer-events: none`; clicks arrive through the same empty-space handler in `initScrollSpy()` that pokes the characters. `toggleAt()` wipes a 3×3 patch if the area is already populated, otherwise stamps a ragged 3×3 colony (a single cell would just die on the next tick).
- It reads `--life-cell` through `getComputedStyle`, so `initThemeToggle()` must call `life.syncTheme()` whenever the theme changes.
- Skipped entirely under reduced motion, and paused on `visibilitychange`.

Both this and the trail are the *only* animated flourishes — the previous full-height GSAP scene system was removed; do not reintroduce page-wide scroll choreography.

## CLI garnish

Three small terminal cues, and deliberately no more: the blinking `▍` caret after `.hero-role` (a `::after`, so `renderProfile()`'s `textContent` write cannot clobber it), the `.trail-readout` percentage, and JetBrains Mono on every metadata slot. Resist adding prompts, `$` prefixes or monospace body text — the restraint is the point.

**`createCharacterJourney(stage, reducedMotion)`** is the sprite-sheet animator and the one genuinely intricate piece of code left. Each `.webp` in `images/characters/` is an 8-frame horizontal strip; a frame is selected by setting the CSS var `--sprite-offset` to `frame * -12.5%` on `.character-sprite-sheet` (which is `width: 800%` inside an `overflow: hidden` box whose `aspect-ratio` matches one frame — those per-sprite ratios in `styles.css` must match the source images). Modes are toggled as classes on `.traveler-stage`: walking (default), `is-rest-action` (person on phone, cat sitting), `is-cat-rolling`, plus `is-walking` / `is-reversing` / `is-character-resting` / `is-flashing`. It returns no-op stubs if the stage or any sprite is missing, and under reduced motion.

**`initScrollSpy()`** is the only scroll listener: rAF-throttled, it toggles `.topbar.is-stuck`, resolves the active section from a reading line at 35% viewport height to sync nav `.active` / `aria-current`, centres the active link on mobile, and forwards scroll velocity to `journey.move()`. It also hijacks nav clicks for smooth scroll plus `history.pushState`, and routes clicks on empty page space to `journey.interact()`. It returns `{ refresh }`, called again after the GitHub repos land because they change page height.

`move()` takes px/sec — sign sets facing direction, magnitude decides walk vs. settle into the rest pose.

### Adding or renaming a section

1. `index.html` — the `<section id="x" class="section">` with an `<h2 class="section-title">`
2. `index.html` — the `.nav-links` list item in the topbar
3. `config.yml` — `navigation:` entry (plus `normalizeAnchor`'s map in `script.js` if you use an `-anchor` suffix)

## Theme

Three-state in effect: follows `prefers-color-scheme` until the visitor clicks `.theme-toggle`, after which `localStorage.theme` pins it. An inline script in `<head>` resolves the theme onto `document.documentElement.dataset.theme` **before first paint** — keep it inline and keep it first, or dark-mode users get a white flash. `initThemeToggle()` swaps the moon/sun icon and listens for OS changes while no explicit choice is stored.

## GitHub section

`loadAndRenderGitHubRepos()` fetches `api.github.com/users/DripNowhy/repos`, drops forks, sorts by stars, and renders the top 3 into `.github-repo-section`. Unauthenticated, so it is rate-limited; failures fall back to a plain error message. All interpolated fields go through `escapeHtml`.

## Adding Publications

Publications are static `<article>` blocks in `#publications`, newest first:

```html
<article class="pub">
    <div class="pub-thumb">
        <img src="images/figure.png" alt="Paper title">
    </div>
    <div class="pub-body">
        <span class="pub-venue">ICML 2026</span>
        <h3 class="pub-title">Paper Title</h3>
        <p class="pub-authors">Coauthors, <span class="highlight-name">Yi Ding</span>, More Coauthors</p>
        <p class="pub-tldr">One-sentence summary.</p>
        <div class="pub-links">
            <a href="..."><i class="fa-solid fa-file-lines" aria-hidden="true"></i> Paper</a>
            <a href="..."><i class="fa-brands fa-github" aria-hidden="true"></i> Code</a>
            <a href="..."><i class="fa-solid fa-globe" aria-hidden="true"></i> Project</a>
        </div>
    </div>
</article>
```

`.pub-venue` is the only venue label — there is deliberately no second long-form journal line. Keep it short (`ICML 2026`, `EMNLP 2025 · Main`); it renders uppercase in mono, in the accent colour. `<span class="highlight-name">` bolds Yi Ding, and `*` on an author marks equal contribution (explained by the `.section-note` in the heading). Use FontAwesome 6 class names (`fa-solid` / `fa-brands`), not FA5's `fas` / `fab`.

Figures are shown bare — fixed 176px column width, `height: auto`, no border, background or crop — so the whole figure is always visible and the row height follows its aspect ratio. Landscape teasers work best; a portrait figure will make its row unusually tall.

## SEO surface

`index.html`'s `<head>` carries a full metadata stack that duplicates profile facts: title/description, OpenGraph, Twitter card, and a JSON-LD `@graph` with `Person` + `WebSite` nodes (affiliation, `sameAs` profile links, `knowsAbout` topics). When affiliation, research topics, or social links change, update the JSON-LD too — it is not generated from `config.yml`. Also present: `robots.txt`, `sitemap.xml` (bump `lastmod` on meaningful content changes), a canonical link, and a Google Search Console verification meta tag.

## Project Pages

`ETA.html` is a standalone paper page using Bulma + carousel/slider extensions. Unlike `index.html`, its CSS/JS are **vendored locally** under `eta/` (only jQuery, Google Fonts, and academicons come from CDNs). Copy `ETA.html` and its asset directory as the starting point for a new paper page, and add the new URL to `sitemap.xml`.

## Assets

- `images/` — profile photos, publication figures, logos; `images/characters/` holds the 8-frame sprite sheets
- `pdf/CV.pdf`
- Keep publication figures around 500KB max; prefer SVG for logos
