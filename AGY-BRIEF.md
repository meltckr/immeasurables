# Antigravity brief: Interactive Four Immeasurables Daily PWA

You are rebuilding Mel Tucker's Four Immeasurables iPhone practice into a polished, interactive, smooth, enjoyable Progressive Web App he will look forward to opening every day.

## Working directory
`/Users/meltucker/Projects/immeasurables` (you are already here on branch `feat/interactive-daily-pwa`).

## READ FIRST (liturgy fidelity — do not invent)
Source pack already available on disk (READ IT):
`/Users/meltucker/Documents/Obsidian Vault/Agentic OS/Memories/Four-Immeasurables-Practice-Pack.md`

Existing site (preserve icons, keep audio as optional listen path):
- Root: `index.html`, `manifest.json`, `icon-180.png`, `icon-192.png`, `icon-512.png`
- Audio practice: `daily-practice/` (keep audio + player as optional "listen" path; primary UX is interactive self-paced)

Older production notes (optional context only — do NOT overwrite liturgy with plain-English adaptations from there):
`/Users/meltucker/Documents/Tuck's Vajra Ocean Lesson Plans/four-immeasurables-practice/`

## HARD CONTENT RULES (MSB / Vajra Ocean / Daily Prayers fidelity)

Exact Daily Prayers phrases ONLY for the four — copy character-for-character:

1. May all sentient beings enjoy happiness and the root of happiness.  
   (byams pa / loving-kindness / maitrī)

2. May they be free from suffering and the root of suffering.  
   (snying rje / compassion / karuṇā)

3. May they not be separated from the great happiness devoid of suffering.  
   (dga' ba / empathetic joy / muditā — name **Empathetic Joy** (Wisdom Dojo) alongside the quality; "sympathetic joy" ok as synonym)

4. May they dwell in the great equanimity free from passion, aggression, and prejudice.  
   (btang snyoms / equanimity / upekṣā)

STRICT:
- Do NOT invent counts, visualizations, or replacement liturgy.
- Formal sit preference: Kongtrul/MSB **equanimity-as-base** then loving-kindness → compassion → empathetic joy. Also support classic order as an optional toggle.
- Optional brief "May I…" warm-up only; then return to all beings. Never use "May I rest in evenness."
- Morning card arc: Refuge + Bodhicitta → Four Immeasurables 1× → Short Dedication of Merit. Keep Refuge/Dedication as short soft placeholders Mel can expand (or soft prompts pointing to Daily Prayers p.2). Do not invent long new liturgy.
- Near/far enemies are optional study, not liturgy — put them behind a subtle "About" or hide them.
- This is a **general map, not a transmission**. Quiet footer note is fine.

## PRODUCT / UX (critical — Mel’s bar)

Interactive, intuitive, smooth, enjoyable — something he looks forward to on iPhone daily. NOT a long scroll essay.
Must support anytime: morning, noon, night.

### Required modes (home / mode picker)
1. **Morning card** — Refuge + Bodhicitta → Four 1× → Short Dedication
2. **Four breaths** — ultra-light, one phrase per breath screen
3. **Guided formal sit** — equanimity-first (Kongtrul/MSB); optional classic-order toggle
4. **Single quality micro** — pick one of the four for a 30–90s landing

Also: optional link/entry to existing audio listen path at `./daily-practice/` (do not break it).

### Interaction design
- Gesture-friendly **one-screen-at-a-time** flow
- Tap **Next** / tap the phrase card to advance; soft Back
- Big readable type, generous spacing
- Soft CSS transitions (fade/slide ~250–400ms) — haptic-feel, not flashy
- Progress dots or ring showing where you are in the sequence
- Large tap targets (min ~48px)
- Safe-area insets for iPhone notch/home indicator

### Four-breath mode
- One phrase per breath screen
- Large Tibetan name (Wylie) + English quality label
- Exact English Daily Prayers verse in elegant serif
- Calm breathe cue: subtle circle/pulse animation (CSS), NOT a loud timer unless optional gentle pulse toggle
- Order for four-breath ultra-light can follow classic LK→C→EJ→Eq OR equanimity-first — default classic for micro speed is fine; label clearly

### Formal sit screens (equanimity-first default)
Step through one focused screen each:
1. Settle
2. Optional refuge cue (short placeholder / soft prompt)
3. Equanimity (exact verse)
4. Loving-kindness (exact verse)
5. Compassion (exact verse)
6. Empathetic joy (exact verse)
7. Rest
8. Dedicate (short placeholder / soft prompt)

### Time-of-day theming (subtle, auto by local hour)
- Morning (~5–11): warm gold / saffron
- Midday (~11–17): clearer bright cream/white with gold accents
- Night (~17–5): deeper indigo with saffron accents
Still bright elegant Buddhist — not gloomy. Allow manual override if easy.

### Color language for the four
- Loving-kindness: warm saffron / coral
- Compassion: deep teal / blue
- Empathetic joy: fresh green / jade
- Equanimity: soft indigo / lapis
- Gold thread tying them; paper/cream fields
- High contrast for outdoor iPhone readability

### Typography
- Elegant serif for verses: load **Cormorant Garamond** (Google Fonts) or similar
- Clean sans for UI: system stack or Inter / similar
- Offline-safe: if using Google Fonts, also ship a fallback; ideally self-host or use font-display:swap. For PWA offline, prefer system + optional webfont with cache.

### PWA requirements
- `manifest.json` (update name/short_name/description/theme-color for interactive practice)
- `apple-mobile-web-app-capable`, apple-touch-icon 180
- Icons 192/512 (reuse existing `icon-180.png`, `icon-192.png`, `icon-512.png`)
- `theme-color` meta + manifest
- `display: standalone`
- Service worker that caches static assets so **core practice screens work offline**
- No account, no tracking, no analytics, no external beacons
- Optional tasteful localStorage streak/check-in — dismissible, never naggy

### Tech preference
Prefer **clean static HTML/CSS/JS** at repo root for simple GitHub Pages deploy (root of this repo = Pages).
- Rewrite `index.html` into the interactive SPA shell
- Put CSS in `css/app.css` (or inline critical + linked)
- Put JS in `js/app.js`
- Add `sw.js` service worker + register it
- Keep `daily-practice/` intact as optional audio listen path
- Keep `.nojekyll`
- Update `README.md` briefly to describe the interactive PWA + fidelity note
- Do NOT change GitHub Pages settings
- Do NOT merge to main
- Deploy simplicity > framework. Only use Vite if you already must; static is preferred.

### Accessibility / polish
- Prefer `prefers-reduced-motion` to tone down animations
- Focus-visible for keyboard
- Semantic headings / ARIA labels on mode cards and progress
- Prevent accidental overscroll rubber-band ugliness where reasonable (`overscroll-behavior`)

## Implementation checklist (do all of these)
1. Read the fidelity pack path above.
2. Build the interactive PWA as described (home + 4 modes + theming + colors + fonts + SW + manifest).
3. Verify exact liturgy strings appear character-for-character in the code.
4. Smoke-test by opening files / grepping for the four exact phrases.
5. Leave `daily-practice/` working.
6. Write a short `CHANGELOG-interactive.md` noting modes shipped and fidelity rules honored.
7. Do not git commit unless asked — the parent agent will commit. Just leave a clean working tree of files ready to commit.
8. Print a final summary: files created/changed, modes, confirmation of exact liturgy.

## Quality bar
Mel will open this on iPhone in Safari / Add to Home Screen. It must feel like a calm, beautiful daily ritual instrument — not a blog, not a timer app, not a CMS. One breath, one phrase, one screen. Soft gold thread. Ready every time of day.


## OPTION A LOCK (Mel confirmed) — Blender visual assets

Also generate elegant Buddhist visual assets with Blender at `/opt/homebrew/bin/blender` (headless `-b --python`).

Create directory `assets/blender/` and export lightweight web-ready PNGs (prefer transparent where useful, phone-perf first — keep each file ideally under ~200KB; 512–1024px max on long edge unless a soft wash needs 1280):

1. `lotus-soft.png` — soft lotus / bloom, sacred calm, not gamey
2. `orb-light.png` — gentle light-orb / glow
3. `gold-dust.png` — subtle gold dust / particle sprinkle (transparent BG)
4. `wash-saffron.png` — soft color wash (loving-kindness)
5. `wash-teal.png` — soft color wash (compassion)
6. `wash-jade.png` — soft color wash (empathetic joy)
7. `wash-indigo.png` — soft color wash (equanimity)
8. Optional: `bloom-gold-thread.png` — faint gold thread / mandala-hint accent

Use Cycles or EEVEE; keep samples low for speed. Sacred/calm polish — paper/cream friendly, soft bloom, no sci-fi, no game HUD. Wire these into the PWA CSS as subtle backgrounds / decorative accents (low opacity), not loud wallpaper.

If Blender MCP tools are available in your session, you may use them; otherwise write a Python script under `scripts/blender_export_assets.py` and run:
`/opt/homebrew/bin/blender -b --python scripts/blender_export_assets.py`

Native SwiftUI / TestFlight is PARKED — do not touch Xcode.

