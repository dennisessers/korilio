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

let audioCtx = null;
const SOUND_KEY = 'korilio.sound';

// Applause by Sandermotions (CC0), trimmed; see THIRD_PARTY_NOTICES.md.
const APPLAUSE_URL = 'sounds/applause.wav';
const CLIPS = {
  correct: { seconds: 2.2, volume: 0.6 },
  finish: { seconds: 5.5, volume: 0.9 },
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
  let playing = null;
  const raw = fetch(APPLAUSE_URL).then((r) => r.arrayBuffer()).catch(() => null);
  let decoded = null;

  function stopApplause() {
    try {
      playing?.stop();
    } catch {}
    playing = null;
  }

  function render() {
    toggleBtn.textContent = enabled ? '🔊' : '🔇';
    toggleBtn.setAttribute('aria-label', enabled ? 'Geluid aan' : 'Geluid uit');
  }

  toggleBtn.addEventListener('click', () => {
    enabled = !enabled;
    if (!enabled) stopApplause();
    try {
      localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
    } catch {}
    render();
  });
  render();

  function load() {
    decoded ??= raw
      .then((buf) => buf && new Promise((ok, fail) => audioCtx.decodeAudioData(buf, ok, fail)))
      .catch(() => null);
    return decoded;
  }

  function unlock() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      load();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  async function applause(kind) {
    const buffer = await load();
    if (!buffer || !enabled) return;
    stopApplause();
    const src = audioCtx.createBufferSource();
    const g = audioCtx.createGain();
    src.buffer = buffer;
    const t = audioCtx.currentTime;
    const { seconds, volume } = CLIPS[kind];
    const len = Math.min(seconds, buffer.duration);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.05);
    g.gain.setValueAtTime(volume, t + len - 0.7);
    g.gain.linearRampToValueAtTime(0, t + len);
    src.connect(g).connect(audioCtx.destination);
    src.start(t);
    src.stop(t + len);
    playing = src;
  }

  function tone(freq, duration, gain) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  function play(kind) {
    if (!enabled || !audioCtx) return;
    if (kind === 'wrong') tone(220, 0.25, 0.12);
    else applause(kind);
  }

  return { unlock, play, stop: stopApplause };
}
