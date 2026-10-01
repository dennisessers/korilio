# KORILIO

A geography game for kids, entirely in Dutch, with two games, each for three regions: Europa (37 countries), Noord- en Midden-Amerika (16) and Zuid-Amerika (12).

- **Kaart** (map): a country lights up on the map of the chosen region, and the player taps its name from four big buttons.
- **Vlaggen** (flags): a flag is shown, and the player taps the matching country name from four big buttons.

**Play:** https://dennisessers.github.io/korilio/ (works on iPad in Safari; use *Share → Add to Home Screen* to run it full-screen). The opening screen lets you choose between *Kaart* and *Vlaggen*, then a region. Direct links such as `…/korilio/#kaart/europa` or `…/korilio/#vlaggen/zuid-amerika` open a game straight away.

Full project documentation (history, architecture, how to add countries, workflow): see [PROJECT.md](PROJECT.md).

## How it plays

- All countries of the chosen region come up once, in random order, before the game ends. The four answer choices always come from the same region.
- A wrong answer greys out that button; in the map game it also marks where the guessed country really is. The player then simply tries again, and there is no timer.
- ⭐ counts countries found on the first try. 🔥 shows a streak of 3 or more.
- A correct answer gets a short, soft applause, and finishing the game gets a longer one. 🔊/🔇 turns the sound on or off. The setting is remembered. Switching sound on plays a short ding, as a quick check. If there's no sound on a device, open `geluidstest.html` to see which sound technique works there.
- 🏠 goes back to the opening screen. The end screen offers *Nog een keer* (play again) and *Menu*.

## Run locally

The game uses ES modules, so it needs a small web server; double-clicking `index.html` won't work:

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Change the countries

1. Edit a region's `playable` list in `REGIONS` and the Dutch display names in `NAMES` in `tools/extract_map.py`.
2. Run the script again:

```
python tools/extract_map.py
```

This rewrites every `data/<region>.js`, including each map frame (viewBox). It also downloads any missing flag into `flags/`. The script uses only the Python standard library.

## Layout

| File | Role |
|---|---|
| `index.html`, `css/style.css` | Opening menu, both games, and a touch-friendly layout: picture on top in portrait, beside the buttons in landscape |
| `js/main.js` | Menu, region screen and game modes (`MODES`), navigation through the URL hash, round flow |
| `js/regions.js` | The regions: name, data file, flags on the region card |
| `js/game.js` | Game rules only, no DOM code: shuffled queue, answer choices, scoring, `DEFAULT_SETTINGS` for future difficulty options |
| `js/map.js` | Draws the SVG map, highlights the target country, shows a locator ring |
| `js/flags.js` | Shows the flag for the flag game and preloads the region's flags |
| `js/ui.js` | Answer buttons, feedback, progress, end screen, sound |
| `data/<region>.js` | Generated map data, one file per region |
| `flags/*.svg` | Flags (from flag-icons) |

## Credits

- **Map shapes:** [jsvectormap](https://github.com/themustafaomar/jsvectormap), © 2020 Mustafa Omar, MIT License.
- **Flags:** [flag-icons](https://github.com/lipis/flag-icons), © 2013 Panayiotis Lipiridis, MIT License.
- **Applause:** by Sandermotions (CC0).

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
