import { isMotionReduced } from './motion';

const root = document.documentElement;

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private windows can block storage. The choice still applies to this visit.
  }
}

// The visible word and the switch state always change together.
function showState(toggle: Element, on: boolean) {
  toggle.setAttribute('aria-checked', String(on));
  const state = toggle.querySelector('[data-state]');
  if (state) state.textContent = on ? 'On' : 'Off';
}

function initTheme() {
  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;
  showState(toggle, root.dataset.theme === 'dark');
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
    };
    remember('theme', next);
    showState(toggle, next === 'dark');
    if (document.startViewTransition && !isMotionReduced()) document.startViewTransition(apply);
    else apply();
  });
}

function initMotionToggle() {
  const toggle = document.querySelector('[data-motion-toggle]');
  if (!toggle) return;
  showState(toggle, !isMotionReduced());
  toggle.addEventListener('click', () => {
    const next = isMotionReduced() ? 'full' : 'reduced';
    root.dataset.motion = next;
    remember('motion', next);
    showState(toggle, next === 'full');
  });
}

// On the contact card, the local time tells a remote reader when a reply is likely.
function initClock() {
  const clock = document.querySelector('[data-clock]');
  if (!clock) return;
  const format = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chihuahua', hour: 'numeric', minute: '2-digit' });
  const tick = () => {
    clock.textContent = `${format.format(new Date()).toLowerCase()} right now in Chihuahua, Mexico`;
  };
  tick();
  setInterval(tick, 30_000);
}

function initCopy() {
  const button = document.querySelector<HTMLElement>('[data-copy]');
  const label = button?.querySelector('[data-copy-label]');
  if (!button || !label) return;
  let timer = 0;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy ?? '');
      label.textContent = 'Copied';
      button.classList.add('is-copied');
    } catch {
      label.textContent = 'Press Ctrl+C';
    }
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      label.textContent = 'Copy';
      button.classList.remove('is-copied');
    }, 1800);
  });
}

export function initControls() {
  initTheme();
  initMotionToggle();
  initClock();
  initCopy();
}
