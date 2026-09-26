import europe from '../data/europe.js';
import { createGame } from './game.js';
import { createMap } from './map.js';
import { createUI, createSound } from './ui.js';

const ADVANCE_MS = 1400;

window.addEventListener('error', (e) => {
  const box = document.getElementById('error-box');
  box.textContent = `Oops: ${e.message}`;
  box.hidden = false;
});

// Lets iOS Safari apply :active styles on touch.
document.addEventListener('touchstart', () => {}, { passive: true });

const map = createMap(document.getElementById('map'), europe);
const ui = createUI();
const sound = createSound(document.getElementById('sound-toggle'));
const game = createGame(europe.playable);
let advancing = false;

function startRound() {
  const round = game.nextRound();
  if (!round) return;
  map.highlight(round.target);
  ui.renderChoices(round.choices, onPick);
  ui.updateProgress(game.progress());
}

function onPick(code) {
  if (advancing) return;
  sound.unlock();
  const result = game.answer(code);
  if (!result) return;
  const round = game.current();

  if (!result.correct) {
    ui.markWrong(code);
    map.flashGuess(code);
    sound.play('wrong');
    return;
  }

  advancing = true;
  ui.markCorrect(code, round.target.name);
  map.markCorrect(code);
  sound.play('correct');

  setTimeout(() => {
    advancing = false;
    if (game.isFinished()) {
      sound.play('finish');
      ui.showSummary(game.progress(), () => {
        game.reset();
        startRound();
      });
    } else {
      startRound();
    }
  }, ADVANCE_MS);
}

startRound();
