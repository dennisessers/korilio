import europe from '../data/europe.js';
import { createGame } from './game.js';
import { createMap } from './map.js';
import { createFlagView } from './flags.js';
import { createUI, createSound } from './ui.js';

const ADVANCE_MS = 1400;
const $ = (id) => document.getElementById(id);

window.addEventListener('error', (e) => {
  const box = $('error-box');
  box.textContent = `Oeps: ${e.message}`;
  box.hidden = false;
});

// Lets iOS Safari apply :active styles on touch.
document.addEventListener('touchstart', () => {}, { passive: true });

const map = createMap($('map'), europe);
createMap($('menu-map'), europe);
const flagView = createFlagView($('flag'));
const ui = createUI();
const sound = createSound($('sound-toggle'));

const MODES = {
  kaart: {
    prompt: 'Welk land licht op?',
    show: (country) => map.highlight(country),
    wrong: (code) => map.flashGuess(code),
    correct: (code) => map.markCorrect(code),
  },
  vlaggen: {
    prompt: 'Van welk land is deze vlag?',
    show: (country) => flagView.show(country),
    wrong: () => {},
    correct: () => flagView.markCorrect(),
  },
};

let modeKey = null;
let game = null;
let advanceTimer = null;

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
  document.body.dataset.screen = 'menu';
}

function startGame(key) {
  stopGame();
  modeKey = key;
  document.body.dataset.screen = key;
  if (key === 'vlaggen') flagView.preloadAll(europe.playable);
  game = createGame(europe.playable);
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
    ui.showSummary(game.progress(), () => startGame(modeKey), goToMenu);
  }, ADVANCE_MS);
}

function goToMenu() {
  location.hash = '';
}

function route() {
  const key = location.hash.slice(1);
  if (MODES[key]) startGame(key);
  else showMenu();
}

for (const btn of document.querySelectorAll('[data-mode]')) {
  btn.addEventListener('click', () => {
    sound.unlock();
    location.hash = btn.dataset.mode;
  });
}
$('home').addEventListener('click', goToMenu);
window.addEventListener('hashchange', route);
route();
