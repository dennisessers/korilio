# KORILIO

A geography game for kids. A country lights up on the map of Europe, and the player taps its name from four big buttons.

**Play:** https://dennisessers.github.io/korilio/ (works on iPad in Safari; use *Share → Add to Home Screen* to run it full-screen)

## How it plays

- All 25 countries come up once, in random order, before the game ends.
- A wrong answer greys out that button and marks where the guessed country really is on the map. The player then simply tries again, and there is no timer.
- ⭐ counts countries found on the first try. 🔥 shows a streak of 3 or more.
- 🔊/🔇 turns the sound on or off. The setting is remembered. The iPad's silent switch also mutes it.

## Run locally

The game uses ES modules, so it needs a small web server; double-clicking `index.html` won't work:

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Change the countries

1. Edit `PLAYABLE` (and `NAME_OVERRIDES` if needed) in `tools/extract_map.py`.
2. Run the script again:

```
python tools/extract_map.py
```

This rewrites `data/europe.js`, including the map frame (viewBox). The script uses only the Python standard library.

## Layout

| File | Role |
|---|---|
| `index.html`, `css/style.css` | Page and touch-friendly layout: map on top in portrait, beside the buttons in landscape |
| `js/main.js` | Connects the game, map, UI and sound |
| `js/game.js` | Game rules only, no DOM code: shuffled queue, answer choices, scoring, `DEFAULT_SETTINGS` for future difficulty options |
| `js/map.js` | Draws the SVG, highlights the target country, shows a locator ring |
| `js/ui.js` | Answer buttons, feedback, progress, end screen, Web Audio tones |
| `data/europe.js` | Generated map data |

## Credits

Map shapes come from [jsvectormap](https://github.com/themustafaomar/jsvectormap), © 2020 Mustafa Omar, MIT License. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
