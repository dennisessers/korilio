const $ = (id) => document.getElementById(id);

const CHEERS = ['Great job!', 'Yes! Well done!', 'Super!', 'You got it!', 'Awesome!'];

export function createUI() {
  const choicesEl = $('choices');
  const promptEl = $('prompt');
  const progressEl = $('progress');
  const buttons = new Map();

  function renderChoices(choices, onPick) {
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
    promptEl.textContent = 'Which country is lit up?';
    promptEl.className = 'prompt';
  }

  function markWrong(code) {
    const b = buttons.get(code);
    b.classList.add('wrong');
    b.disabled = true;
    promptEl.textContent = 'Not quite – try again!';
    promptEl.className = 'prompt try';
  }

  function markCorrect(code, name) {
    for (const [c, b] of buttons) {
      b.disabled = true;
      if (c === code) b.classList.add('correct');
    }
    promptEl.textContent = `${CHEERS[Math.floor(Math.random() * CHEERS.length)]} That's ${name}!`;
    promptEl.className = 'prompt yay';
  }

  function updateProgress({ played, total, firstTryCorrect, streak }) {
    const fire = streak >= 3 ? `   🔥 ${streak}` : '';
    progressEl.textContent = `Country ${Math.min(played + 1, total)} of ${total}   ⭐ ${firstTryCorrect}${fire}`;
  }

  function showSummary({ firstTryCorrect, total, bestStreak }, onPlayAgain) {
    const ratio = firstTryCorrect / total;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    $('summary-stars').textContent = '⭐'.repeat(stars);
    $('summary-title').textContent = stars === 3 ? 'Amazing!' : stars === 2 ? 'Great work!' : 'Well done!';
    $('summary-text').textContent =
      `You found ${firstTryCorrect} of ${total} countries on the first try.` +
      (bestStreak >= 3 ? ` Best streak: ${bestStreak} in a row!` : '');
    const overlay = $('summary');
    overlay.hidden = false;
    $('play-again').onclick = () => {
      overlay.hidden = true;
      onPlayAgain();
    };
  }

  return { renderChoices, markWrong, markCorrect, updateProgress, showSummary };
}

let audioCtx = null;
const SOUND_KEY = 'korilio.sound';

function readSoundPref() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function createSound(toggleBtn) {
  let enabled = readSoundPref();

  function render() {
    toggleBtn.textContent = enabled ? '🔊' : '🔇';
    toggleBtn.setAttribute('aria-label', enabled ? 'Sound on' : 'Sound off');
  }

  toggleBtn.addEventListener('click', () => {
    enabled = !enabled;
    try {
      localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    } catch {}
    render();
  });
  render();

  function unlock() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function tone(freq, start, duration, type = 'sine', gain = 0.18) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  function play(kind) {
    if (!enabled || !audioCtx) return;
    if (kind === 'correct') {
      tone(523, 0, 0.15);
      tone(659, 0.1, 0.15);
      tone(784, 0.2, 0.3);
    } else if (kind === 'wrong') {
      tone(220, 0, 0.25, 'triangle', 0.12);
    } else if (kind === 'finish') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35));
    }
  }

  return { unlock, play };
}
