export const DEFAULT_SETTINGS = {
  choices: 4,
  timerSeconds: null,
  hints: false,
  distractorMode: 'random',
};

export function shuffle(items, rng = Math.random) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickDistractors(target, pool, n, mode = 'random', rng = Math.random) {
  const others = pool.filter((c) => c.code !== target.code);
  if (mode === 'near') {
    const dist = (c) => (c.cx - target.cx) ** 2 + (c.cy - target.cy) ** 2;
    return others.sort((a, b) => dist(a) - dist(b)).slice(0, n);
  }
  return shuffle(others, rng).slice(0, n);
}

export function createGame(countries, settings = {}, rng = Math.random) {
  const opts = { ...DEFAULT_SETTINGS, ...settings };
  let queue, round, firstTryCorrect, streak, bestStreak, played;

  function reset() {
    queue = shuffle(countries, rng);
    round = null;
    firstTryCorrect = 0;
    streak = 0;
    bestStreak = 0;
    played = 0;
  }

  function nextRound() {
    const target = queue.shift();
    if (!target) {
      round = null;
      return null;
    }
    const wrong = pickDistractors(target, countries, opts.choices - 1, opts.distractorMode, rng);
    round = { target, choices: shuffle([target, ...wrong], rng), tries: 0, eliminated: new Set(), done: false };
    return round;
  }

  function answer(code) {
    if (!round || round.done || round.eliminated.has(code)) return null;
    round.tries++;
    const correct = code === round.target.code;
    if (!correct) {
      round.eliminated.add(code);
      streak = 0;
      return { correct, firstTry: false };
    }
    round.done = true;
    played++;
    const firstTry = round.tries === 1;
    if (firstTry) {
      firstTryCorrect++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    }
    return { correct, firstTry };
  }

  reset();
  return {
    settings: opts,
    reset,
    nextRound,
    answer,
    current: () => round,
    isFinished: () => queue.length === 0 && (!round || round.done),
    progress: () => ({ played, total: countries.length, firstTryCorrect, streak, bestStreak }),
  };
}
