# KORILIO: map and flag quiz for kids

A geography game with two modules, chosen on an opening screen, each playable for six regions (163 countries in total):
- **Kaart** (map): a country lights up on the map, and the child taps its name from four big buttons.
- **Vlaggen** (flags): a flag is shown, and the child taps the country name from four big buttons.
- **Regions:** Europa (40), Noord- en Midden-Amerika (16), Zuid-Amerika (12), Afrika (50), West- en Centraal-Azië (22) and Zuid- en Oost-Azië (23). The child picks one after choosing Kaart or Vlaggen.

Everything is in Dutch, built for touch on an iPad, with no timer and no penalties.

- **Play:** https://dennisessers.github.io/korilio/ (lowercase! `/KORILIO/` gives a 404). Direct links: `#kaart/europa`, `#vlaggen/zuid-amerika`, etc. (`#kaart` alone opens the region choice)
- **Code:** https://github.com/dennisessers/korilio (public, because GitHub Pages needs that)
- **Idea:** @DennisEssers. Built with Claude Code.

## State of affairs (2026-10-02)

**Live and working** at https://dennisessers.github.io/korilio/, with everything committed and pushed in both repos (`korilio` and the umbrella `claude_tryouts`).

**What's there:**
- An opening menu, "Kies een spel" (choose a game), with two cards: **Kaart** and **Vlaggen**.
- Then a region screen, "Kaart: kies een werelddeel" (choose a continent), with six cards in a grid (3 × 2 in landscape, 2 × 3 in portrait): **Europa**, **Noord- en Midden-Amerika**, **Zuid-Amerika**, **Afrika**, **West- en Centraal-Azië** and **Zuid- en Oost-Azië**.
  - The cards show a mini map of the region in the Kaart game, and 4 flags in the Vlaggen game.
- **Kaart:** the countries of the chosen region light up on that region's map. The kid picks the Dutch name from 4 buttons (all 4 from the same region).
- **Vlaggen:** the flags of the same countries, with the same 4-button question.
- **Shared by both:**
  - Dutch text, no timer; after a wrong answer the kid just tries again.
  - Score ⭐ and streak 🔥; an end screen with 1–3 stars, "Nog een keer" (play again) and "Menu".
  - A soft applause for a correct answer (can be muted, and the setting is remembered).
  - 🏠 back to the main menu; navigation through the URL hash (`#kaart/europa` etc.).
  - Works on iPad in portrait and landscape.
- There's no build step: pushing to `main` updates the live site within about a minute.

**Tested:**
- In Chrome, both modules have been played through from start to finish.
- The layout was checked in landscape and at iPad-portrait size (768×1024).
- The user plays the map game on a real iPad.
- **Sound on the iPad works** (confirmed by the user, 2026-10-01) since the switch to `<audio>` elements. Before that the iPad stayed silent; see *Sound*.
- The Americas regions: all four combinations (Kaart/Vlaggen × North/South) played through in Chrome. Europe still works after switching maps.
- Afrika and both Asia regions (2026-10-02), in Chrome:
  - all 12 region × module combinations start with a valid first round;
  - all 161 flags load (163 since Rusland and Belarus were added);
  - every country name fits on a button, upright and sideways (at most 2 lines);
  - the region screen fits without scrolling.

  Full play-throughs were only possible for part of Afrika, because Chrome throttles timers in the background test tab (see *Testing locally*).

**Not done yet / open:**
- **Not yet checked on a real iPad:** the flag game, the Americas, Afrika and Asia (tested in Chrome only).
- **Git layout:** KORILIO's git data still sits in `KORILIO/.git` instead of `.git/modules/` (see *Repo and git workflow*). It works; tidying it is optional.
- **URL capitals:** the URL is case-sensitive; a redirect for `/KORILIO/` was offered but not built.
- **Difficulty levels, hints, reverse mode:** not built (see *Ideas for later*).

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
| `3b62af0` | Second module **Vlaggen** plus an opening menu with the choice "Kaart" / "Vlaggen", hash navigation, 🏠 button, "Menu" on the end screen |
| `1808bb4` | Regions: Noord- en Midden-Amerika (16) and Zuid-Amerika (12) added next to Europa, a region screen after choosing Kaart/Vlaggen, `data/europe.js` renamed to `data/europa.js`, extractor builds all regions, tiny-country dot now based on on-screen size |
| `8a3c3aa` … `a4f63b9` | Sound on iPad: Web Audio workarounds, then `geluidstest.html`, then the switch to `<audio>` elements with generated sound files |
| `493dba7` | Afrika (50), West- en Centraal-Azië (22), Zuid- en Oost-Azië (23) and Cyprus in Europa. Region screen as a 3 × 2 / 2 × 3 grid. Tiny-country dot also for thin countries (area < 150 px²). Version numbers on all changed imports, including the data files |
| `ac64e41` + this commit | PROJECT.md brought up to date with the current state |

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
| `index.html` | Page: header (🏠, logo, progress, sound button), opening menu `#menu` (two cards), region screen `#regions` (cards built by `main.js`), game area `.stage` with `.map-wrap` (`<svg id="map">`) and `.flag-wrap` (`<img id="flag">`), prompt, answer buttons, footer credit, end-screen overlay (Nog een keer / Menu), error box |
| `css/style.css` | All styling. Colours are variables in `:root`. Touch rules, landscape/portrait layout, screen switching via `body[data-screen]` and `body[data-mode]`, menu and region cards, flag frame, map layers (`.map-svg`, shared by the game map and the menu picture), animations |
| `js/main.js` | Connects everything: `MODES` (kaart/vlaggen), builds the region cards (`buildMenus`), hash routing (`route`, `showMenu`, `showRegions`, `startGame(mode, region)`), rebuilds the game map when the region changes, round flow, double-tap protection and cancelling the pending round (`advanceTimer`) |
| `js/regions.js` | `REGIONS`: key (used in the URL), Dutch name, data file and the 4 flags shown on the region card |
| `js/game.js` | Pure game logic, no DOM: `createGame`, `shuffle`, `pickDistractors`, `DEFAULT_SETTINGS` |
| `js/map.js` | `createMap(svg, data)` draws the layers and provides `highlight`, `markCorrect`, `flashGuess` and `clear` |
| `js/flags.js` | `createFlagView(img)`: `show(country)`, `markCorrect()` (green frame), `preloadAll(countries)`; `flagUrl(code)` |
| `js/ui.js` | `createUI()` (buttons, prompt, progress, end screen, `hideSummary`) and `createSound()` (`<audio>` players for applause, wrong-answer tone and ding; `unlock()`, `play(kind)`, `stop()`) |
| `data/<region>.js` (`europa`, `noord-amerika`, `zuid-amerika`, `afrika`, `west-azie`, `oost-azie`) | **Generated**, one per region (11–31 KB each). `{ viewBox, playable:[{code,name,d,cx,cy}], context:[{code,d}] }` |
| `tools/extract_map.py` | Generates every `data/<region>.js` from `tools/world.js` (config in `REGIONS`) and downloads any missing `flags/<code>.svg`. Python standard library only |
| `flags/<code>.svg` | 4×3 flags from flag-icons (commit `086f7e9`), lowercase ISO codes (`xk` = Kosovo). 163 files, 1.1 MB in total. Per region: Europa 390 KB, Noord-Amerika 304 KB, Zuid-Amerika 159 KB, Afrika 65 KB, West-Azië 108 KB, Oost-Azië 88 KB. The big ones are flags with detailed coats of arms: Servië 181 KB, Bolivia 103 KB, Mexico 85 KB, Spanje 81 KB, El Salvador 77 KB |
| `tools/FLAG_ICONS_LICENSE` | MIT licence of flag-icons |
| `tools/world.js` | Pinned copy of jsvectormap's `world.js` (commit `08283f0`) |
| `tools/JSVECTORMAP_LICENSE` | MIT licence of jsvectormap |
| `sounds/applause.wav` | Source applause, 5.5 s, mono, 24 kHz (~260 KB). Not played directly; `geluidstest.html` uses it |
| `sounds/applause-short.wav`, `applause-long.wav`, `wrong.wav`, `ding.wav` | **Generated** by `tools/make_sounds.py`: the game's sounds with volume and fades built in (2.2 s applause at 60 %, 5.5 s applause at 90 %, a low 220 Hz tone, an 880 Hz ding) |
| `tools/make_sounds.py` | Generates the four sound files above from `sounds/applause.wav`. Python standard library only |
| `geluidstest.html` | Sound test page for a device: tries a Web Audio beep, Web Audio applause and `<audio>` applause, and shows the system version, audio state and errors on screen |
| `README.md` | Short public description |
| `.nojekyll`, `.gitignore`, `.gitattributes` | GitHub Pages without Jekyll; ignores `__pycache__` and OS clutter; LF line endings in the repo |
| `THIRD_PARTY_NOTICES.md` | Licences and sources of the map data, flags and sound |

## How it works

### Screens and navigation (`js/main.js`)

- `body[data-screen]` is `menu`, `regions` or `game`; `body[data-mode]` is `kaart` or `vlaggen` (empty on the menu). The HTML starts as `menu`, so nothing flashes on load. The CSS hides what isn't needed:
  - only the current screen (`#menu`, `#regions` or `.stage`) is shown;
  - 🏠 is hidden on the menu, and the progress is only visible in a game;
  - per mode, the other game's picture (`.map-wrap` or `.flag-wrap`) and the other kind of region picture (`.region-map` or `.region-flags`) are hidden.
- **URL hash is the source of truth:** `route()` runs on load and on every `hashchange`.
  - The hash is `#<mode>/<region>`. `#kaart/europa` → `startGame('kaart', 'europa')`; `#kaart` alone → `showRegions('kaart')`; anything else → `showMenu()`.
  - The menu cards, region cards and 🏠 only change `location.hash`. So the browser back button (game → region screen → menu), the iPad back swipe, refresh and direct links all work.
- **Region data:** all six data files are imported at start (about 155 KB together). The game map `<svg id="map">` is rebuilt with `createMap` only when the Kaart game switches to another region; the choices always come from the same region.
- **Leaving or restarting a game** (`stopGame`) clears the pending next-round timer, stops the applause and closes the end screen, so nothing from the old game fires later.
- **`MODES`** holds, per module: the question (`prompt`) plus `show(country)`, `wrong(code)` and `correct(code)`.
  - **Kaart:** `map.highlight` / `map.flashGuess` / `map.markCorrect`.
  - **Vlaggen:** `flagView.show`, nothing extra on a wrong answer (the button still greys out), and a green frame on a correct one.
  - Adding a third module means one more entry in `MODES`, a menu card, and a hide rule in the CSS.
  - Adding a region: see *Adding a region* below.
- **Audio unlock:** tapping a menu card calls `sound.unlock()`, so on iOS the applause works from the very first answer. If a game is opened directly via a link (without the menu), the first answer tap unlocks the audio instead.
- **Menu pictures:**
  - The Kaart card is a second `createMap(...)` drawn into `<svg id="menu-map">` (non-interactive, `preserveAspectRatio="xMidYMid slice"`).
  - The Vlaggen card is a 2×2 grid of `<img>` elements (NL, BE, FR, DE).
  - Landscape: the cards sit side by side. Portrait: stacked, with 16:9 pictures.

### Flags (`js/flags.js`)

- `flags/<code>.svg`, a 4:3 flag in `.flag-frame`. The frame is sized with container-query units (`min(100cqw, 133.33cqh)`), so it's always as large as possible without distortion.
- `preloadAll` loads the flags of the chosen region as soon as its flag game starts (at most 390 KB, for Europe), so there's no flicker between rounds. Flags already loaded are skipped.
- The `alt` text is deliberately generic ("Vlag van een land"), so it doesn't give the answer away.
- The menu pictures have `pointer-events: none`. Otherwise a tap on the picture would count as dragging an image, and the button wouldn't respond.

### Game rules (`js/game.js`)

- **Order:** at the start, all countries are shuffled into a queue (Fisher–Yates). Each country comes up exactly once per game.
- **Choices:** each round has the correct country plus 3 random other countries (`pickDistractors`, mode `'random'`). A `'near'` mode already exists that picks neighbouring countries; it's meant for a harder level later.
- **Wrong answer:** the button greys out, the prompt says "Bijna! Probeer het nog eens!" and the child tries again. In the Kaart game, the guessed country also flashes purple on the map for a moment. The game never subtracts points.
- **Score:** ⭐ counts countries answered correctly on the first try. 🔥 appears for a streak of 3 or more.
- **Correct answer:** the button turns green, the prompt says e.g. "Knap gedaan! Dat is Albanië!", the applause plays, and the next round starts after 1.4 s (`ADVANCE_MS` in `main.js`).
- **End screen:** 1–3 stars (90% or more = 3, 60% or more = 2), the number correct on the first try, the longest streak (if 3 or more), and the buttons "Nog een keer" (same module again) and "Menu".
- **Future settings:** `DEFAULT_SETTINGS` (`choices`, `timerSeconds`, `hints`, `distractorMode`) is ready for difficulty levels, but both modules currently use the defaults.

### Map (`js/map.js` + CSS)

The SVG layers, drawn bottom to top:
1. `rect.sea`: the light-blue sea.
2. `g.base`: every country again, with a thick stroke in its own land colour (`stroke-width: 1.2px` in **map units**, `vector-effect: none`). This fills the narrow gaps between neighbours. The source shapes are simplified separately, so neighbours don't touch exactly, and without this layer the sea shows through (it made Kosovo look like a hole). Don't remove it.
3. `g.context`: grey countries that are never asked about in this region (in Europe e.g. Turkey, Georgia, North Africa; in the Asia maps e.g. Russia).
4. `g.playable`: the quiz countries (cream), each with `data-code`.
5. `g.markers`: a pulsing ring around the target country.
   - Countries that are small on screen also get a solid orange **dot** (`.dot`). "Small" means less than 14 px on their longest side (`TINY_PX`) or less than 150 px² in area (`TINY_AREA_PX`, for thin countries like Gambia), measured at the moment they light up. The dot turns green after a correct answer.
   - On a laptop screen, these countries get a dot:
     - Europa: Luxemburg, Cyprus.
     - Noord-Amerika: Belize, El Salvador, Jamaica, Haïti, Bahama's, Trinidad en Tobago.
     - Afrika: Gambia, Djibouti, Equatoriaal-Guinea, Rwanda, Burundi, Eswatini.
     - West-Azië: Palestina, Qatar.
     - Oost-Azië: Brunei, Oost-Timor.

     On a smaller screen (iPad portrait) a few more can qualify, such as Kosovo, Libanon or Koeweit.

Borders are white 1px lines with `vector-effect: non-scaling-stroke`, so they look the same at any screen size.

### Touch and iPad

- `touch-action: manipulation` (no double-tap zoom and no tap delay).
- No text selection or long-press menus.
- No page scrolling (`100dvh`, `overflow: hidden`).
- Buttons are at least 76px tall.
- Hover styles only apply in `@media (hover: hover)`.
- **Layout:**
  - Landscape (at least 700px wide): the picture (map or flag) on the left, the 4 buttons in one column on the right.
  - Portrait: the picture on top, a 2×2 button grid below.
- **Pictures inside buttons** (the menu cards) have `pointer-events: none`, so a tap never gets caught as an image drag.
- `apple-mobile-web-app-capable`, so "Zet op beginscherm" (Add to Home Screen) opens the game full-screen.

### Sound (`js/ui.js` → `createSound`)

- **Why `<audio>` and not Web Audio:** on the user's iPad, Web Audio stayed silent, even with every known iOS workaround (`audioSession = 'playback'`, a silent buffer started in the tap, resuming from `interrupted`). `geluidstest.html` showed that a plain `<audio>` element does play. So the game uses one `<audio>` element per sound.
- **No volume or fades in code:** iPad Safari ignores `audio.volume`. Loudness and fades are therefore built into the files by `tools/make_sounds.py`:
  - `correct` → `applause-short.wav`;
  - `finish` → `applause-long.wav`;
  - `wrong` → `wrong.wav`;
  - `ding` → `ding.wav`.
- **Unlocking (`unlock()`):** iOS only lets an `<audio>` element play without a tap (like the end-of-game applause, which starts from a timer) if it was once started from a tap.
  - On the first tap (menu card, sound button or answer), `unlock()` starts all four players **muted** and pauses them again as soon as they run.
  - `play(kind)` unmutes the player it needs. The unlock step leaves an unmuted player running, so a sound requested in that same first tap still plays.
  - `stop()` (leaving a game) only pauses players that aren't muted, because pausing a player that is still being unlocked would abort the unlock (`AbortError`).
- **Sound check:** tapping 🔇 → 🔊 plays the ding straight away, so it's easy to hear whether sound works on a device.
- The 🔊/🔇 setting is saved in `localStorage` under `korilio.sound`.
- **Changing a sound:** edit `tools/make_sounds.py` (clip length, volume, tone frequency), run `python tools/make_sounds.py`, and raise the `?v=` numbers (see *Testing locally*).

## Countries (163 in 6 regions)

The codes are ISO alpha-2; `XK` is used for Kosovo. The Dutch names come from `NAMES` in `tools/extract_map.py`, the lists per region from `REGIONS` there.

**Europa (40):**
> GB Verenigd Koninkrijk · IE Ierland · IS IJsland · NO Noorwegen · SE Zweden · FI Finland · DK Denemarken · NL Nederland · BE België · FR Frankrijk · ES Spanje · PT Portugal · DE Duitsland · CH Zwitserland · AT Oostenrijk · IT Italië · PL Polen · CZ Tsjechië · HU Hongarije · RO Roemenië · BG Bulgarije · GR Griekenland · HR Kroatië · UA Oekraïne · RS Servië · EE Estland · LV Letland · LT Litouwen · SK Slowakije · SI Slovenië · BA Bosnië en Herzegovina · AL Albanië · MK Noord-Macedonië · ME Montenegro · MD Moldavië · LU Luxemburg · XK Kosovo · CY Cyprus · BY Belarus · RU Rusland

**Noord- en Midden-Amerika (16):**
> CA Canada · US Verenigde Staten · MX Mexico · GT Guatemala · BZ Belize · SV El Salvador · HN Honduras · NI Nicaragua · CR Costa Rica · PA Panama · CU Cuba · JM Jamaica · HT Haïti · DO Dominicaanse Republiek · BS Bahama's · TT Trinidad en Tobago

**Zuid-Amerika (12):**
> CO Colombia · VE Venezuela · GY Guyana · SR Suriname · EC Ecuador · PE Peru · BR Brazilië · BO Bolivia · PY Paraguay · UY Uruguay · AR Argentinië · CL Chili

**Afrika (50):**
> MA Marokko · EH Westelijke Sahara · DZ Algerije · TN Tunesië · LY Libië · EG Egypte · MR Mauritanië · ML Mali · NE Niger · TD Tsjaad · SD Soedan · ER Eritrea · SN Senegal · GM Gambia · GW Guinee-Bissau · GN Guinee · SL Sierra Leone · LR Liberia · CI Ivoorkust · BF Burkina Faso · GH Ghana · TG Togo · BJ Benin · NG Nigeria · CM Kameroen · CF Centraal-Afrikaanse Republiek · SS Zuid-Soedan · ET Ethiopië · DJ Djibouti · SO Somalië · GQ Equatoriaal-Guinea · GA Gabon · CG Congo-Brazzaville · CD Congo-Kinshasa · UG Oeganda · KE Kenia · RW Rwanda · BI Burundi · TZ Tanzania · AO Angola · ZM Zambia · MW Malawi · MZ Mozambique · ZW Zimbabwe · MG Madagaskar · NA Namibië · BW Botswana · ZA Zuid-Afrika · SZ Eswatini · LS Lesotho

**West- en Centraal-Azië (22):**
> TR Turkije · SY Syrië · LB Libanon · IL Israël · PS Palestina · JO Jordanië · IQ Irak · IR Iran · SA Saoedi-Arabië · KW Koeweit · QA Qatar · AE Verenigde Arabische Emiraten · OM Oman · YE Jemen · GE Georgië · AM Armenië · AZ Azerbeidzjan · KZ Kazachstan · UZ Oezbekistan · TM Turkmenistan · TJ Tadzjikistan · KG Kirgizië

**Zuid- en Oost-Azië (23):**
> AF Afghanistan · PK Pakistan · IN India · NP Nepal · BT Bhutan · BD Bangladesh · LK Sri Lanka · CN China · MN Mongolië · KP Noord-Korea · KR Zuid-Korea · JP Japan · TW Taiwan · MM Myanmar · LA Laos · VN Vietnam · TH Thailand · KH Cambodja · MY Maleisië · ID Indonesië · PH Filipijnen · BN Brunei · TL Oost-Timor

The Americas are split in two because a single map from Canada to Chile would be very tall. Central America and the Caribbean would then be only a few pixels on an iPad. Asia is split for the same reason: the Middle East is crowded with small countries. Turkey, Georgia, Armenia, Azerbaijan and Kazakhstan count as Asia here; Turkey's European part (around Istanbul) is part of its shape.

**Mainly independent countries are playable** (the user's choice). Exceptions the user explicitly chose (2026-10-01): **Kosovo**, **Taiwan**, **Palestina** and **Westelijke Sahara**. **Cyprus** is in Europa (an EU member, and it fits inside the Europe map frame).
- Greenland, Puerto Rico, the Falklands and French Guiana are grey on the map.
- For the United States, Alaska is included; Hawaii and the Aleutian pieces on the far side of the world map are dropped (`exclude` box and frame in `REGIONS`).
- The small Caribbean island states (Barbados, Grenada, St. Lucia, St. Vincent, Antigua, St. Kitts, Dominica) are **not in the source data**.
- **Africa:** Somaliland and Noord-Cyprus are grey. The island states Kaapverdië, Comoren, Mauritius, Seychellen and São Tomé are **not in the source data**.
- **Asia:** Russia is grey on the Asia maps (the user's choice; it would stretch them across Siberia). It is playable in Europa instead. Papua New Guinea (Oceania) is grey. Bahrain, Singapore and the Maldives are **not in the source data**.

**Russia in Europa (a "partial" country):** the user wanted Russia and Belarus in Europa without making the map bigger (2026-10-02).
- Belarus fits inside the existing map frame.
- Russia is listed under `partial` in the Europa entry of `REGIONS`:
  - it doesn't count when the map frame is calculated;
  - only the parts of its shape that reach into the frame are kept (the European mainland part and Kaliningrad);
  - its ring is placed in the middle of the visible part (roughly west of Moscow), not at the centre of the whole country, which would be far off the map.
- When Russia lights up, it fills the right-hand edge of the map. The map frame (`viewBox` `354.29 62.31 173.03 137.08`) is the same as before.

**Europe, not playable (grey only):** Turkey (in West-Azië), Georgia, North Africa.
- **Micro-states** (Andorra, Monaco, San Marino, Vatican, Liechtenstein, Malta) are **not in the source data at all**, so they can't be added without other map data.

### Adding or removing a country

1. In `tools/extract_map.py`, add the code to the region's `playable` list in `REGIONS`, and the Dutch name to `NAMES`.
2. Run `python tools/extract_map.py`. This rewrites every `data/<region>.js`, prints each country's bounding box, and downloads the flag to `flags/<code>.svg` if it's missing. Check that flag-icons has the code: https://github.com/lipis/flag-icons/tree/main/flags/4x3
   - The map frame (`viewBox`) is recalculated from all playable countries of that region.
   - Pieces of a country whose centre lies outside the region's `frame`, or inside one of its `exclude` boxes, are dropped (French Guiana and Svalbard for Europe, Hawaii for North America).
   - A big country that should be playable without enlarging the map goes in the region's `partial` list too (like Russia in Europa); see *Countries*.
3. Test locally (see below). Check that the country is visible when highlighted, that the flag shows in the flag game, and that the longest name still fits on a button.
4. Update the country count in `README.md`, then commit and push (in both repos).

### Adding a region (e.g. Afrika, Azië)

1. In `tools/extract_map.py`, add an entry to `REGIONS`:
   - a key (lowercase, also used in the URL);
   - the `playable` codes;
   - a `frame` (source coordinates: x 0–900, y 0–441; the world map uses the Miller projection with its central meridian at 11.5°E);
   - optionally `exclude` boxes.

   Add Dutch names for the codes to `NAMES`.
2. Run the script. It writes `data/<key>.js` and downloads the flags.
3. In `js/regions.js`: import the data file and add the region with its Dutch name and 4 flags for the card. The region screen picks it up automatically.
4. Check that the region cards still fit (the grid has 3 columns in landscape and 2 in portrait; a 7th region adds a row, so check the height). Then test both modules and check which countries get a dot. Give the new data import in `regions.js` the current `?v=` number.

Source-data gotchas:
- Some territories have placeholder keys (`_0`, `_1`, `_2`). The script maps them to proper codes through `CODE_BY_NAME`.
- The source uses English names, some of them abbreviated ("Czech Rep.", "Macedonia"). The game always shows the Dutch name from `NAMES`.

## Testing locally

```
cd KORILIO
python -m http.server 8765
```

Then open http://localhost:8765. ES modules don't work over `file://`, so double-clicking `index.html` won't work.
- **Go straight to a game:** http://localhost:8765/#kaart/noord-amerika, http://localhost:8765/#vlaggen/europa, etc. `#kaart` alone gives the region screen; without a hash you get the menu.
- **Test both modules and several regions** after any change to `main.js`, `ui.js` or the CSS: menu → Kaart → region → a few rounds → back → another region → 🏠 → Vlaggen → region → end screen → "Menu".
- **Cache-busting:** the current version is `v=7`.
  - `index.html` loads `css/style.css?v=7` and `js/main.js?v=7`.
  - `main.js` imports `./regions.js?v=7`, `./map.js?v=7` and `./ui.js?v=7`.
  - `regions.js` imports every `../data/<region>.js?v=7`.

  Raise the number (everywhere at once is simplest) after a change, so iPads don't mix old and new files. Modules without a version (`game.js`, `flags.js`) can be cached for up to 10 minutes. Chrome also caches unversioned data files: after regenerating, Europa still showed 37 countries until the version was added.
- **Background-tab throttling:** the Claude in Chrome tab is usually `hidden`.
  - The first 5 minutes, timers run about normally; after that Chrome throttles them heavily. A full play-through (which waits 1.4 s per round) then takes far longer than the tool's 45 s limit.
  - `requestAnimationFrame` never fires in a hidden tab, so don't await it.
  - A script that times out keeps running in the page. Don't start a second loop on top of it; use a lock, or a fresh tab.
  - Tips:
    - Open a fresh tab for each long test.
    - Play in batches of about 12 rounds.
    - To switch screens without waiting, run `history.replaceState(null, '', '#kaart/afrika')` followed by `dispatchEvent(new HashChangeEvent('hashchange'))`. That calls `route()` synchronously.
- **Sound can't be heard in the Chrome test tab:** the tab controlled by Claude in Chrome is usually `hidden` (the window is in the background). Chrome then postpones loading `<audio>` files, so `play()` stays pending. Test the *calls* instead, by wrapping `HTMLMediaElement.prototype.play`/`pause`, and test the real sound on a device (`geluidstest.html` helps).
- **When the browser tool isn't available:** a headless Edge smoke test still catches JavaScript errors: `msedge --headless=new --virtual-time-budget=4000 --dump-dom "http://localhost:8765/#kaart/europa"`, then check that `body` has `data-screen="game"`, there are 4 `class="choice"` elements, and the error box is still `hidden`. Sound can only be tested with a real tap.
- **iPad view:** use Chrome DevTools → device toolbar (iPad, portrait and landscape). Or embed the page in an `<iframe>` of 768×1024.
- **Real iPad:** push, wait about a minute, then refresh the Pages URL in Safari. GitHub Pages caches files for up to about 10 minutes, so the old version can briefly reappear.
- **Test scripts in the browser (Claude in Chrome):** a round takes about 1.5 s, so play a full game in batches of about 14 rounds per script call, or the tool times out after 45 s. The screenshot tool sometimes returns a wrongly zoomed image right after a timeout; measure with `getBoundingClientRect()` instead.
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
- Sound on iPad: the game uses `<audio>` elements because Web Audio stayed silent on the user's iPad. `<audio>` normally also plays in silent mode; the volume buttons and the 🔊 button still apply.
- The flag frame uses container-query units (`cqw`/`cqh`), which need iPadOS/Safari 16 or newer (2022+). On older devices the flag may show at the wrong size.

## Ideas for later

- **Difficulty levels:** "near" distractors (neighbouring countries), more choices, an optional timer. The `DEFAULT_SETTINGS` in `game.js` are ready for this.
- **Hints:** first letter, the flag as a hint in the Kaart game (the files are already there), or reading the name aloud (Web Speech API, Dutch voice) for children who can't read yet.
- **Smaller flags:** optimise the big SVGs (Servië, Spanje, Montenegro) with e.g. SVGO if loading on a slow connection becomes a problem.
- **Reverse mode:** show a name and the child taps the country on the map (a new entry in `MODES`).
- **Flag game, harder:** choose distractors with similar-looking flags (e.g. NL/LU, RO/MD, IE/IT).
- **More regions:** Oceanië (Australia, New Zealand, Papua New Guinea, a few Pacific islands; many small island states are missing from the source data). See *Adding a region*. A 7th card adds a row to the region grid.
- **"Hele wereld" as its own region:** probably only as a flag game; the world map is too small for Central America or Europe's small countries.

## Picking this back up

1. `cd "C:\Users\denni\OneDrive\Documents\Claude tryouts\KORILIO"`
2. `git pull`, and `git -C .. pull` for the umbrella repo.
3. Read this file. Then run `python -m http.server 8765` and play a round of both modules (Kaart and Vlaggen) in a couple of regions at localhost.
4. After changes: commit and push in `KORILIO`, then `git add KORILIO` and commit and push in the umbrella repo. Wait for Pages to show `built`, then check on the iPad.
