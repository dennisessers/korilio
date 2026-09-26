const SVG_NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function createMap(svg, data) {
  svg.setAttribute('viewBox', data.viewBox);
  const [vx, vy, vw, vh] = data.viewBox.split(' ').map(Number);

  svg.append(el('rect', { class: 'sea', x: vx, y: vy, width: vw, height: vh }));
  const contextLayer = el('g', { class: 'context' });
  const playLayer = el('g', { class: 'playable' });
  const markerLayer = el('g', { class: 'markers' });
  svg.append(contextLayer, playLayer, markerLayer);

  for (const c of data.context) contextLayer.append(el('path', { d: c.d }));

  const paths = new Map();
  for (const c of data.playable) {
    const p = el('path', { d: c.d, 'data-code': c.code });
    paths.set(c.code, p);
    playLayer.append(p);
  }

  const ringRadius = Math.max(vw, vh) * 0.035;

  function clear() {
    for (const p of paths.values()) p.removeAttribute('class');
    markerLayer.replaceChildren();
  }

  function highlight(country) {
    clear();
    const p = paths.get(country.code);
    p.setAttribute('class', 'target');
    playLayer.append(p);
    markerLayer.append(
      el('circle', { class: 'ring', cx: country.cx, cy: country.cy, r: ringRadius }),
    );
  }

  function markCorrect(code) {
    paths.get(code).setAttribute('class', 'correct');
    markerLayer.replaceChildren();
  }

  function flashGuess(code) {
    const p = paths.get(code);
    if (!p || p.getAttribute('class')) return;
    p.setAttribute('class', 'guess');
    setTimeout(() => {
      if (p.getAttribute('class') === 'guess') p.removeAttribute('class');
    }, 1200);
  }

  return { highlight, markCorrect, flashGuess, clear };
}
