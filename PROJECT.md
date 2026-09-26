# KORILIO: map and flag quiz for kids

A geography game with two modules for the same 37 European countries, chosen on an opening screen:
- **Kaart** (map): a country lights up on a map of Europe, and the child taps its name from four big buttons.
- **Vlaggen** (flags): a flag is shown, and the child taps the country name from four big buttons.

Everything is in Dutch, built for touch on an iPad, with no timer and no penalties.

- **Play:** https://dennisessers.github.io/korilio/ (lowercase! `/KORILIO/` gives a 404). Direct links: `#kaart`, `#vlaggen`
- **Code:** https://github.com/dennisessers/korilio (public, because GitHub Pages needs that)
- **Idea:** @DennisEssers. Built with Claude Code.

## Status (2026-09-26)

Live with two modules (Kaart and Vlaggen) and an opening menu: 37 European countries, Dutch text, an applause sound, and it works on iPad in both orientations. There's no build step: pushing to `main` updates the live site within about a minute.

### How we got here

| Commit | What |
|---|---|
| `058832a` | v1: vanilla HTML/CSS/JS, 25 countries, map shapes extracted from jsvectormap, touch-friendly layout, GitHub Pages |
| `fe025b2` | Everything translated into Dutch (UI text and country names) |
| `6cef71a` | Crowd cheer as the sound for a correct answer, and Estland/Letland/Litouwen added |
| `42bbef9` | Slowakije, Slovenië, Bosnië en Herzegovina added |
| `d1f47e3` | Albanië, Noord-Macedonië, Montenegro added |
| `7fd8383` | Cheer replaced by a small applause (the user didn't like the cheer) |
| `22f1ce6` | Moldavië and Luxemburg added, plus a dot marker for tiny countries |
| `71eb26d` | Kosovo added (the source stored it under the placeholder key `_1`) |
| `feafb24` | Sea-coloured gaps between neighbouring countries filled (made Kosovo look like a hole) |
| `9b58ee5` | "Idee: @DennisEssers" added to the footer |
| `cc2b7f4` | This PROJECT.md |
| *(commit "Add flag game…")* | Second module **Vlaggen** plus an opening menu with the choice "Kaart" / "Vlaggen", hash navigation, 🏠 button, "Menu" on the end screen |

## Repo and git workflow

- `KORILIO/` is its **own git repo** (`dennisessers/korilio`). It is also a **submodule** of the umbrella repo `dennisessers/claude_tryouts` (private), next to `star_wars_games` and `rest_is_history`.
- Every change takes two steps:
  1. Inside `KORILIO/`: `git add …`, `git commit`, `git push`. This also deploys the site.
  2. In the umbrella root: `git add KORILIO`, `git commit -m "Update KORILIO submodule: …"`, `git push`.
- Unlike the other submodules, KORILIO's git data is still at `KORILIO/.git`, not in `.git/modules/KORILIO`. Running `git submodule absorbgitdirs KORILIO` failed with "Permission denied", most likely because OneDrive or the dev server had the folder locked. It works fine as it is. If you want it tidied, retry that command when nothing else is running in the folder.
- **GitHub Pages** serves the root of `main` (`.nojekyll` is present, so no Jekyll build runs). To check the deployment status: `gh api repos/dennisessers/korilio/pages/builds/latest --jq .status`.

## Files

| File | Role |
|---|---|
| `index.html` | Page: header (🏠, logo, progress, sound button), opening menu `#menu` (two cards), game area `.stage` with `.map-wrap` (`<svg id="map">`) and `.flag-wrap` (`<img id="flag">`), prompt, answer buttons, footer credit, end-screen overlay (Nog een keer / Menu), error box |
| `css/style.css` | All styling. Colours are variables in `:root`. Touch rules, landscape/portrait layout, screen switching via `body[data-screen]`, menu, flag frame, map layers (`.map-svg`, shared by the game map and the menu picture), animations |
| `js/main.js` | Connects everything: `MODES` (kaart/vlaggen), hash routing (`route`, `showMenu`, `startGame`), round flow, double-tap protection and cancelling the pending round (`advanceTimer`) |
| `js/game.js` | Pure game logic, no DOM: `createGame`, `shuffle`, `pickDistractors`, `DEFAULT_SETTINGS` |
| `js/map.js` | `createMap(svg, data)` draws the layers and provides `highlight`, `markCorrect`, `flashGuess` and `clear` |
| `js/flags.js` | `createFlagView(img)`: `show(country)`, `markCorrect()` (green frame), `preloadAll(countries)`; `flagUrl(code)` |
| `js/ui.js` | `createUI()` (buttons, prompt, progress, end screen, `hideSummary`) and `createSound()` (applause, a soft tone for a wrong answer, `stop()`) |
| `data/europe.js` | **Generated.** `{ viewBox, playable:[{code,name,d,cx,cy}], context:[{code,d}] }` |
| `tools/extract_map.py` | Generates `data/europe.js` from `tools/world.js` and downloads any missing `flags/<code>.svg`. Python standard library only |
| `flags/<code>.svg` | 4×3 flags from flag-icons (commit `086f7e9`), lowercase ISO codes (`xk` = Kosovo) |
| `tools/FLAG_ICONS_LICENSE` | MIT licence of flag-icons |
| `tools/world.js` | Pinned copy of jsvectormap's `world.js` (commit `08283f0`) |
| `tools/JSVECTORMAP_LICENSE` | MIT licence of jsvectormap |
| `sounds/applause.wav` | Applause, 5.5 s, mono, 24 kHz (~260 KB) |
| `README.md` | Short public description |
| `THIRD_PARTY_NOTICES.md` | Licences and sources of the map data, flags and sound |

## How it works

### Screens and navigation (`js/main.js`)

- `body[data-screen]` is `menu`, `kaart` or `vlaggen`. The CSS hides what isn't needed:
  - on the menu: `.stage` and the `.game-only` elements (🏠 and progress);
  - in a game: `.menu` and the other game's picture (`.map-wrap` or `.flag-wrap`).
- **URL hash is the source of truth:** `route()` runs on load and on every `hashchange`.
  - `#kaart` or `#vlaggen` → `startGame(key)`; anything else → `showMenu()`.
  - The menu cards and 🏠 only change `location.hash`. So the browser back button, the iPad back swipe, refresh and direct links all work.
- **Leaving or restarting a game** (`stopGame`) clears the pending next-round timer, stops the applause and closes the end screen, so nothing from the old game fires later.
- **`MODES`** holds, per module: the question (`prompt`) plus `show(country)`, `wrong(code)` and `correct(code)`.
  - **Kaart:** `map.highlight` / `map.flashGuess` / `map.markCorrect`.
  - **Vlaggen:** `flagView.show`, nothing extra on a wrong answer (the button still greys out), and a green frame on a correct one.
  - Adding a third module means one more entry in `MODES`, a menu card, and a hide rule in the CSS.
- **Audio unlock:** tapping a menu card calls `sound.unlock()`, so on iOS the applause works from the very first answer.

### Flags (`js/flags.js`)

- `flags/<code>.svg`, a 4:3 flag in `.flag-frame`. The frame is sized with container-query units (`min(100cqw, 133.33cqh)`), so it's always as large as possible without distortion.
- `preloadAll` loads all 37 flags as soon as the flag game starts, so there's no flicker between rounds.
- The `alt` text is deliberately generic ("Vlag van een Europees land"), so it doesn't give the answer away.
- The menu pictures have `pointer-events: none`. Otherwise a tap on the picture would count as dragging an image, and the button wouldn't respond.

### Game rules (`js/game.js`)

- **Order:** at the start, all countries are shuffled into a queue (Fisher–Yates). Each country comes up exactly once per game.
- **Choices:** each round has the correct country plus 3 random other countries (`pickDistractors`, mode `'random'`). A `'near'` mode already exists that picks neighbouring countries; it's meant for a harder level later.
- **Wrong answer:** the button greys out and the child tries again. The game never subtracts points.
- **Score:** ⭐ counts countries answered correctly on the first try. 🔥 appears for a streak of 3 or more.
- **End screen:** 1–3 stars (90% or more = 3, 60% or more = 2) and a "Nog een keer" (play again) button.
- **Future settings:** `DEFAULT_SETTINGS` (`choices`, `timerSeconds`, `hints`, `distractorMode`) is ready for difficulty levels, but v1 always uses the defaults.

### Map (`js/map.js` + CSS)

The SVG layers, drawn bottom to top:
1. `rect.sea`: the light-blue sea.
2. `g.base`: every country again, with a thick stroke in its own land colour (`stroke-width: 1.2px` in **map units**, `vector-effect: none`). This fills the narrow gaps between neighbours. The source shapes are simplified separately, so neighbours don't touch exactly, and without this layer the sea shows through (it made Kosovo look like a hole). Don't remove it.
3. `g.context`: grey countries that are never asked about (Russia, Belarus, Turkey, North Africa, …).
4. `g.playable`: the quiz countries (cream), each with `data-code`.
5. `g.markers`: a pulsing ring around the target country.
   - Countries smaller than 40% of the ring radius also get a solid orange **dot** (`.dot`, currently only Luxemburg). It turns green after a correct answer.

Borders are white 1px lines with `vector-effect: non-scaling-stroke`, so they look the same at any screen size.

### Touch and iPad

- `touch-action: manipulation` (no double-tap zoom and no tap delay).
- No text selection or long-press menus.
- No page scrolling (`100dvh`, `overflow: hidden`).
- Buttons are at least 76px tall.
- Hover styles only apply in `@media (hover: hover)`.
- Layout: side by side in landscape (at least 700px wide), map on top with a 2×2 button grid in portrait.
- `apple-mobile-web-app-capable`, so "Zet op beginscherm" (Add to Home Screen) opens the game full-screen.

### Sound (`js/ui.js` → `createSound`)

- iOS only allows audio after a tap, so the `AudioContext` is created on the first tap (`unlock()`). The WAV file is fetched when the page loads and decoded at that first tap.
- **Correct answer:** the first 2.2 s of the applause at volume 0.6. **End of game:** the full 5.5 s at volume 0.9. Both fade in and out.
- **Wrong answer:** a soft low triangle-wave tone (Web Audio, no file).
- The 🔊/🔇 setting is saved in `localStorage` under `korilio.sound`. The iPad's silent switch also mutes the game.

## Countries (37)

The codes are ISO alpha-2; `XK` is used for Kosovo. The Dutch names come from `NAMES` in `tools/extract_map.py`.

> GB Verenigd Koninkrijk · IE Ierland · IS IJsland · NO Noorwegen · SE Zweden · FI Finland · DK Denemarken · NL Nederland · BE België · FR Frankrijk · ES Spanje · PT Portugal · DE Duitsland · CH Zwitserland · AT Oostenrijk · IT Italië · PL Polen · CZ Tsjechië · HU Hongarije · RO Roemenië · BG Bulgarije · GR Griekenland · HR Kroatië · UA Oekraïne · RS Servië · EE Estland · LV Letland · LT Litouwen · SK Slowakije · SI Slovenië · BA Bosnië en Herzegovina · AL Albanië · MK Noord-Macedonië · ME Montenegro · MD Moldavië · LU Luxemburg · XK Kosovo

**Not playable (grey only):**
- **Russia:** it would stretch the map across Asia.
- **Belarus, Turkey, Cyprus:** could be added. Belarus is easy. Turkey and Cyprus would widen or shift the map frame to the south-east.
- **Micro-states** (Andorra, Monaco, San Marino, Vatican, Liechtenstein, Malta) are **not in the source data at all**, so they can't be added without other map data.

### Adding or removing a country

1. In `tools/extract_map.py`, add the code to `PLAYABLE` and the Dutch name to `NAMES`.
2. Run `python tools/extract_map.py`. This rewrites `data/europe.js`, prints each country's bounding box, and downloads the flag to `flags/<code>.svg` if it's missing. Check that flag-icons has the code: https://github.com/lipis/flag-icons/tree/main/flags/4x3
   - The map frame (`viewBox`) is recalculated from all playable countries.
   - Overseas pieces outside `EUROPE_FRAME` (such as French Guiana and Svalbard) are dropped automatically.
3. Test locally (see below). Check that the country is visible when highlighted, that the flag shows in the flag game, and that the longest name still fits on a button.
4. Update the country count in `README.md`, then commit and push (in both repos).

Source-data gotchas:
- Some territories have placeholder keys (`_0`, `_1`, `_2`). The script maps them to proper codes through `CODE_BY_NAME`.
- The source uses English names, some of them abbreviated ("Czech Rep.", "Macedonia"). The game always shows the Dutch name from `NAMES`.

## Testing locally

```
cd KORILIO
python -m http.server 8765
```

Then open http://localhost:8765. ES modules don't work over `file://`, so double-clicking `index.html` won't work.
- **iPad view:** use Chrome DevTools → device toolbar (iPad, portrait and landscape). Or embed the page in an `<iframe>` of 768×1024.
- **Real iPad:** push, wait about a minute, then refresh the Pages URL in Safari. GitHub Pages caches files for up to about 10 minutes, so the old version can briefly reappear.
- **Node is not installed** on this PC; the tooling is Python only. There's also no ffmpeg; audio was trimmed with Python's `wave` module.

## Licences and credits

- **Flags:** flag-icons © 2013 Panayiotis Lipiridis, MIT. The full text is in `THIRD_PARTY_NOTICES.md` and `tools/FLAG_ICONS_LICENSE`, and it's credited in the footer.
- **Map shapes:** jsvectormap © 2020 Mustafa Omar, MIT. The full text is in `THIRD_PARTY_NOTICES.md` and `tools/JSVECTORMAP_LICENSE`, and it's credited in the in-game footer.
- **Applause:** "277021 sandermotions applause-2.wav" by Sandermotions (Wikimedia Commons, CC0). No credit is required, but it's credited anyway.
- **Earlier cheer** (removed): Gregor Quendel, CC BY 4.0. If it ever comes back, the credit is required.
- **Own code:** no licence set, so all rights reserved.

## Known limitations

- Coastlines are coarse, because the source is a world map at low resolution. Small islands are simplified or missing.
- Montenegro, Kosovo and Slovenië are small (about 15–20 px on an iPad), so the ring is important.
- The URL is case-sensitive (`/korilio/`). A forgiving redirect would need a user-site repo `dennisessers.github.io` with a 404 redirect. That was offered but not built.
- Sound on iPad depends on the silent switch and Control Centre.
- The flag frame uses container-query units (`cqw`/`cqh`), which need iPadOS/Safari 16 or newer (2022+). On older devices the flag may show at the wrong size.

## Ideas for later

- **Difficulty levels:** "near" distractors (neighbouring countries), more choices, an optional timer. The `DEFAULT_SETTINGS` in `game.js` are ready for this.
- **Hints:** first letter, flag, or reading the name aloud (Web Speech API, Dutch voice) for children who can't read yet.
- **Reverse mode:** show a name and the child taps the country on the map (a new entry in `MODES`).
- **Flag game, harder:** choose distractors with similar-looking flags (e.g. NL/LU, RO/MD, IE/IT).
- **More regions / the whole world:** give `extract_map.py` a different `PLAYABLE` list and `EUROPE_FRAME`, and write it to e.g. `data/world.js`. `main.js` would then choose a region (for example via `?regio=`).

## Picking this back up

1. `cd "C:\Users\denni\OneDrive\Documents\Claude tryouts\KORILIO"`
2. `git pull`, and `git -C .. pull` for the umbrella repo.
3. Read this file. Then run `python -m http.server 8765` and play a round at localhost.
4. After changes: commit and push in `KORILIO`, then `git add KORILIO` and commit and push in the umbrella repo. Wait for Pages to show `built`, then check on the iPad.
