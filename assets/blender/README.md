# Blender visual assets

Sacred/calm decorative PNGs for the interactive PWA (phone-perf first).
Generated headlessly via `/opt/homebrew/bin/blender` and `scripts/blender_export_assets.py`.

- `lotus-soft.png` — soft lotus / bloom
- `orb-light.png` — gentle light-orb
- `gold-dust.png` — subtle gold dust particles
- `wash-{saffron,teal,jade,indigo}.png` — quality color washes
- `bloom-gold-thread.png` — faint gold-thread accent

Re-export:
```bash
/opt/homebrew/bin/blender -b --python scripts/blender_export_assets.py
```
