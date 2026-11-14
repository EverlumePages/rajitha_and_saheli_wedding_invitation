// Entrance and scroll animations.
// Nothing is hidden unless motion is allowed and IntersectionObserver exists, so the page
// reads normally with JavaScript off or with "reduce motion" switched on.
const motionOK = 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches;

// Opening section, played in sequence once the opening film closes: [selector, effect, delay (s), extra delay per match].
const heroSteps = [
  ['.site-header > *', 'down', 0, .07],
  ['.hero-sprig', 'bloom', .1, .15],
  ['.hero-arch', 'curtain', 0],
  ['.ornament--top', 'zoom', .25],
  ['.hero-eyebrow', 'up', .35],
  ['.hero .welcome', 'up', .45],
  ['.ornament--rings', 'zoom', .55],
  ['.hero-couple', 'rise', .5],
  ['.hero h1 .name-1', 'left', .65],
  ['.hero h1 .name-2', 'left', .8],
  ['.hero h1 em', 'pop', 1],
  ['.hero-flourish', 'draw', 1.1],
  ['.hero-date', 'up', 1.2],
  ['.ornament--small', 'zoom', 1.3],
  ['.hero-place', 'up', 1.38],
  ['.hero-button', 'up', 1.5],
  ['.ornament--bottom', 'zoom', 1.65],
];

// Everything below the opening section reveals as it scrolls into view. First match wins.
const scrollTargets = [
  ['.section-kicker', 'up'],
  ['.invitation-card', 'zoom'],
  ['.invitation-card .small-rule', 'line'],
  ['.invitation-card > *', 'up'],
  ['.day-heading > *', 'up'],
  ['#schedule > li', 'right'],
  ['.venue-art', 'curtain'],
  ['.venue-copy .small-rule', 'line'],
  ['.venue-copy > *', 'up'],
  ['.rsvp-copy > *', 'up'],
  ['.rsvp-form', 'up'],
  ['.closing > *', 'up'],
];

function mark(el, effect, delay) {
  if (el.dataset.reveal) return;
  el.dataset.reveal = effect;
  if (delay != null) el.style.setProperty('--reveal-delay', `${delay}s`);
}

let started = false;

/** Tag the elements and hide them, ready to animate. Call once the page content is in place. */
export function setupReveal() {
  if (!motionOK) return;
  document.documentElement.classList.add('reveal-on');
  for (const [selector, effect, delay, step = 0] of heroSteps)
    document.querySelectorAll(selector).forEach((el, i) => mark(el, effect, delay + i * step));
  for (const [selector, effect] of scrollTargets)
    document.querySelectorAll(selector).forEach(el => mark(el, effect));
}

/** Play the opening sequence and start watching the rest of the page. Safe to call more than once. */
export function startReveal() {
  if (!motionOK || started) return;
  started = true;
  requestAnimationFrame(() => {
    for (const [selector] of heroSteps) document.querySelectorAll(selector).forEach(el => el.classList.add('is-visible'));
    const observer = new IntersectionObserver(entries => {
      let batch = 0;
      for (const entry of entries) {
        const above = entry.boundingClientRect.bottom < 0; // already scrolled past (e.g. reload mid-page)
        if (!entry.isIntersecting && !above) continue;
        entry.target.style.setProperty('--reveal-delay', above ? '0s' : `${Math.min(batch++ * .1, .6)}s`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => observer.observe(el));
  });
}
