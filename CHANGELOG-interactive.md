# CHANGELOG: Interactive PWA

## Features & Modes Shipped
- **Morning Card:** Settle → Refuge/Bodhicitta → Four Immeasurables (1x) → Short Dedication.
- **Four Breaths:** Ultra-light one phrase per breath flow (classic order).
- **Guided Formal Sit:** Step-by-step with equanimity-first (Kongtrul/MSB) default, with a toggle for classic order.
- **Single Quality Micro:** 30–90s landing for a selected quality (Loving-Kindness, Compassion, Empathetic Joy, Equanimity).
- **Offline Ready PWA:** Service worker caches core assets and generated Blender images for offline use.
- **Time-of-day Theming:** Auto-detects hour to shift between morning (warm gold), midday (bright cream), and night (indigo). Includes manual override.

## Fidelity Rules Honored
- **Exact Daily Prayers Liturgy:** Copied character-for-character for the four qualities. No invented language.
- **Equanimity as Base:** Maintained Kongtrul/MSB formal cycle order as the default for Guided Formal Sit.
- **All Beings Focus:** Kept the focus on "all sentient beings" rather than western metta circles. 
- **Subtle Visuals:** Generated and integrated soft Blender assets (light washes, subtle gold dust) rather than loud or distracting UI.
- **No Trackers/Analytics:** Kept purely offline and local. 

The `daily-practice/` audio path was kept intact and accessible via the home screen.

## Fidelity follow-up (post-agy polish)
- Softened Morning Card Refuge/Dedication to short placeholders pointing to Daily Prayers p.2 (removed invented long liturgy).
- Four exact Daily Prayers lines remain character-for-character.
- Blender assets compressed for phone-perf under `assets/blender/`.
