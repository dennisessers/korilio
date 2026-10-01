const $ = (id) => document.getElementById(id);

const CHEERS = ['Goed zo!', 'Super!', 'Knap gedaan!', 'Helemaal goed!', 'Top!'];

export function createUI() {
  const choicesEl = $('choices');
  const promptEl = $('prompt');
  const progressEl = $('progress');
  const buttons = new Map();

  function renderChoices(choices, onPick, prompt) {
    buttons.clear();
    choicesEl.replaceChildren();
    for (const c of choices) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.textContent = c.name;
      b.addEventListener('click', () => onPick(c.code));
      buttons.set(c.code, b);
      choicesEl.append(b);
    }
    promptEl.textContent = prompt;
    promptEl.className = 'prompt';
  }

  function markWrong(code) {
    const b = buttons.get(code);
    b.classList.add('wrong');
    b.disabled = true;
    promptEl.textContent = 'Bijna! Probeer het nog eens!';
    promptEl.className = 'prompt try';
  }

  function markCorrect(code, name) {
    for (const [c, b] of buttons) {
      b.disabled = true;
      if (c === code) b.classList.add('correct');
    }
    promptEl.textContent = `${CHEERS[Math.floor(Math.random() * CHEERS.length)]} Dat is ${name}!`;
    promptEl.className = 'prompt yay';
  }

  function updateProgress({ played, total, firstTryCorrect, streak }) {
    const fire = streak >= 3 ? `   🔥 ${streak}` : '';
    progressEl.textContent = `Land ${Math.min(played + 1, total)} van ${total}   ⭐ ${firstTryCorrect}${fire}`;
  }

  function hideSummary() {
    $('summary').hidden = true;
  }

  function showSummary({ firstTryCorrect, total, bestStreak }, onPlayAgain, onMenu) {
    const ratio = firstTryCorrect / total;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    $('summary-stars').textContent = '⭐'.repeat(stars);
    $('summary-title').textContent = stars === 3 ? 'Geweldig!' : stars === 2 ? 'Heel goed!' : 'Goed gedaan!';
    $('summary-text').textContent =
      `Je had ${firstTryCorrect} van de ${total} landen in één keer goed.` +
      (bestStreak >= 3 ? ` Langste reeks: ${bestStreak} op rij!` : '');
    const overlay = $('summary');
    overlay.hidden = false;
    $('play-again').onclick = () => {
      overlay.hidden = true;
      onPlayAgain();
    };
    $('summary-menu').onclick = () => {
      overlay.hidden = true;
      onMenu();
    };
  }

  return { renderChoices, markWrong, markCorrect, updateProgress, showSummary, hideSummary };
}

const SOUND_KEY = 'korilio.sound';

// iPad Safari blocks Web Audio here but plays <audio>, which can't change volume,
// so loudness and fades are baked into these files (tools/make_sounds.py).
// Applause by Sandermotions (CC0); see THIRD_PARTY_NOTICES.md.
const FILES = {
  correct: 'sounds/applause-short.wav',
  finish: 'sounds/applause-long.wav',
  wrong: 'sounds/wrong.wav',
  ding: 'sounds/ding.wav',
};

function readSoundPref() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function createSound(toggleBtn) {
  let enabled = readSoundPref();
  let unlocked = false;
  const players = {};
  for (const [kind, url] of Object.entries(FILES)) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    players[kind] = audio;
  }

  function stopApplause() {
    for (const kind of ['correct', 'finish']) {
      // A muted player is still being unlocked; pausing it now would abort that.
      if (!players[kind].muted) players[kind].pause();
    }
  }

  function render() {
    toggleBtn.textContent = enabled ? '🔊' : '🔇';
    toggleBtn.setAttribute('aria-label', enabled ? 'Geluid aan' : 'Geluid uit');
  }

  toggleBtn.addEventListener('click', () => {
    enabled = !enabled;
    if (enabled) {
      unlock();
      play('ding');
    } else {
      stopApplause();
    }
    try {
      localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    } catch {}
    render();
  });
  render();

  // Must run inside a tap: iOS only lets an <audio> element play later (e.g. the
  // end-of-game applause from a timer) once it has been started from a gesture.
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    for (const audio of Object.values(players)) {
      audio.muted = true;
      const started = audio.play();
      // play() below unmutes a player it really wants, so leave that one running.
      const reset = () => {
        if (!audio.muted) return;
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      };
      const failed = (e) => {
        audio.muted = false;
        if (e?.name === 'NotAllowedError') unlocked = false;
      };
      if (started?.then) started.then(reset, failed);
      else reset();
    }
  }

  function play(kind) {
    if (!enabled) return;
    if (kind === 'correct' || kind === 'finish') stopApplause();
    const audio = players[kind];
    audio.muted = false;
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }

  return { unlock, play, stop: stopApplause };
}
