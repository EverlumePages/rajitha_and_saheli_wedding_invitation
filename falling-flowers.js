// A decorative layer only: the invitation and its controls remain interactive.
const layer = document.createElement('div');
layer.className = 'falling-flowers';
layer.setAttribute('aria-hidden', 'true');
const flowers = [
  [5, 29, 24, -8, 32], [14, 22, 29, -23, -24],
  [23, 37, 26, -16, 35], [32, 25, 31, -3, -32],
  [41, 30, 28, -21, 24], [50, 21, 25, -11, -28],
  [59, 34, 30, -26, 38], [68, 24, 27, -6, -30],
  [77, 39, 32, -19, 22], [86, 27, 26, -14, -35],
  [94, 23, 29, -2, -26], [10, 32, 33, -29, 28],
  [18, 28, 28, -5, 30], [36, 34, 32, -17, -24],
  [54, 26, 27, -24, 34], [72, 32, 30, -10, -28],
  [89, 30, 29, -20, -32], [45, 25, 31, -13, 25]
];
for (const [left, size, duration, delay, drift] of flowers) {
  const petal = document.createElement('span');
  petal.className = 'falling-flower';
  petal.style.cssText = `--left:${left}%;--size:${Math.round(size * 1.12)}px;--duration:${duration}s;--delay:${delay}s;--drift:${drift}px;--turn:${drift > 0 ? 235 : -210}deg`;
  const img = document.createElement('img');
  img.src = 'assests/flower.jpg';
  img.alt = '';
  img.decoding = 'async';
  img.draggable = false;
  petal.append(img);
  layer.append(petal);
}
document.body.append(layer);
function syncVisibility() { layer.classList.toggle('is-paused', document.hidden); }
document.addEventListener('visibilitychange', syncVisibility);
syncVisibility();
