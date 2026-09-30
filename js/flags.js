export const flagUrl = (code) => `flags/${code.toLowerCase()}.svg`;

export function createFlagView(img) {
  const frame = img.parentElement;
  const preloaded = new Set();

  function show(country) {
    frame.classList.remove('correct');
    img.src = flagUrl(country.code);
  }

  function markCorrect() {
    frame.classList.add('correct');
  }

  function preloadAll(countries) {
    for (const c of countries) {
      if (preloaded.has(c.code)) continue;
      preloaded.add(c.code);
      new Image().src = flagUrl(c.code);
    }
  }

  return { show, markCorrect, preloadAll };
}
