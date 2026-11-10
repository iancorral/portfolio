const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)');

// The in-page toggle wins over the OS setting, in either direction.
export function isMotionReduced() {
  const choice = document.documentElement.dataset.motion;
  if (choice === 'reduced') return true;
  if (choice === 'full') return false;
  return prefersReduced.matches;
}
