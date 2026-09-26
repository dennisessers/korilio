export const flagUrl = (code) => `flags/${code.toLowerCase()}.svg`;

export function createFlagView(img) {
  const frame = img.parentElement;
  let preloaded = false;

  function show(country) {
    frame.classList.remove('correct');
    img.src = flagUrl(country.code);
  }

  function markCorrect() {
    frame.classList.add('correct');
  }

  function preloadAll(countries) {
    if (preloaded) return;
    preloaded = true;
    for (const c of countries) new Image().src = flagUrl(c.code);
  }

  return { show, markCorrect, preloadAll };
}
