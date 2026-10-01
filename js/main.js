import { REGIONS } from './regions.js?v=7';
import { createGame } from './game.js';
import { createMap } from './map.js?v=7';
import { createFlagView, flagUrl } from './flags.js';
import { createUI, createSound } from './ui.js?v=7';

const ADVANCE_MS = 1400;
const SVG_NS = 'http://www.w3.org/2000/svg';
const $ = (id) => document.getElementById(id);

window.addEventListener('error', (e) => {
  const box = $('error-box');
  box.textContent = `Oeps: ${e.message}`;
  box.hidden = false;
});

// Lets iOS Safari apply :active styles on touch.
document.addEventListener('touchstart', () => {}, { passive: true });

const flagView = createFlagView($('flag'));
const ui = createUI();
const sound = createSound($('sound-toggle'));
const mapSvg = $('map');
let map = null;
let mapRegion = null;

const MODES = {
  kaart: {
    title: 'Kaart',
    prompt: 'Welk land licht op?',
    show: (country) => map.highlight(country),
    wrong: (code) => map.flashGuess(code),
    correct: (code) => map.markCorrect(code),
  },
  vlaggen: {
    title: 'Vlaggen',
    prompt: 'Van welk land is deze vlag?',
    show: (country) => flagView.show(country),
    wrong: () => {},
    correct: () => flagView.markCorrect(),
  },
};

let modeKey = null;
let regionKey = null;
let game = null;
let advanceTimer = null;

function buildMenus() {
  createMap($('menu-map'), REGIONS.europa.data);

  for (const btn of document.querySelectorAll('.menu-card[data-mode]')) {
    btn.addEventListener('click', () => {
      sound.unlock();
      location.hash = btn.dataset.mode;
    });
  }

  for (const [key, region] of Object.entries(REGIONS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-card region-card';

    const mapPic = document.createElement('span');
    mapPic.className = 'menu-pic region-map';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'map-svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    mapPic.append(svg);

    const flagPic = document.createElement('span');
    flagPic.className = 'menu-pic menu-flags region-flags';
    for (const code of region.flags) {
      const img = document.createElement('img');
      img.src = flagUrl(code);
      img.alt = '';
      flagPic.append(img);
    }

    const label = document.createElement('span');
    label.className = 'menu-label';
    label.textContent = region.name;

    btn.append(mapPic, flagPic, label);
    btn.addEventListener('click', () => {
      sound.unlock();
      location.hash = `${modeKey}/${key}`;
    });
    $('region-cards').append(btn);
    createMap(svg, region.data);
  }
}

function setScreen(screen) {
  document.body.dataset.screen = screen;
  document.body.dataset.mode = modeKey ?? '';
}

function stopGame() {
  clearTimeout(advanceTimer);
  advanceTimer = null;
  sound.stop();
  ui.hideSummary();
  game = null;
}

function showMenu() {
  stopGame();
  modeKey = null;
  regionKey = null;
  setScreen('menu');
}

function showRegions(mode) {
  stopGame();
  modeKey = mode;
  regionKey = null;
  $('regions-title').textContent = `${MODES[mode].title}: kies een werelddeel`;
  setScreen('regions');
}

function startGame(mode, region) {
  stopGame();
  modeKey = mode;
  regionKey = region;
  setScreen('game');
  const { data } = REGIONS[region];
  if (mode === 'kaart' && mapRegion !== region) {
    mapSvg.replaceChildren();
    map = createMap(mapSvg, data);
    mapRegion = region;
  }
  if (mode === 'vlaggen') flagView.preloadAll(data.playable);
  game = createGame(data.playable);
  startRound();
}

function startRound() {
  const round = game.nextRound();
  if (!round) return;
  MODES[modeKey].show(round.target);
  ui.renderChoices(round.choices, onPick, MODES[modeKey].prompt);
  ui.updateProgress(game.progress());
}

function onPick(code) {
  if (!game || advanceTimer) return;
  sound.unlock();
  const result = game.answer(code);
  if (!result) return;
  const mode = MODES[modeKey];

  if (!result.correct) {
    ui.markWrong(code);
    mode.wrong(code);
    sound.play('wrong');
    return;
  }

  ui.markCorrect(code, game.current().target.name);
  mode.correct(code);
  sound.play('correct');

  advanceTimer = setTimeout(() => {
    advanceTimer = null;
    if (!game.isFinished()) {
      startRound();
      return;
    }
    sound.play('finish');
    ui.showSummary(game.progress(), () => startGame(modeKey, regionKey), goToMenu);
  }, ADVANCE_MS);
}

function goToMenu() {
  location.hash = '';
}

function route() {
  const [mode, region] = location.hash.slice(1).split('/');
  if (!MODES[mode]) showMenu();
  else if (!REGIONS[region]) showRegions(mode);
  else startGame(mode, region);
}

buildMenus();
$('home').addEventListener('click', goToMenu);
window.addEventListener('hashchange', route);
route();
