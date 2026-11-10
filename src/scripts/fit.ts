import gsap from 'gsap';

const NARROWEST = 62;
const WIDEST = 125;

export const isTaglineSplit = () => document.querySelector('[data-fit-title] .split-line') !== null;

// The tagline says "software that fits", so it literally does: the font's width axis
// is adjusted until the line reaches the edge of its column, on any screen.
export function fitTagline({ animate = false, delay = 0 } = {}) {
  const title = document.querySelector<HTMLElement>('[data-fit-title]');
  const line = title?.querySelector<HTMLElement>('em');
  // While the title is split into animated lines, this element's width means nothing.
  if (!title || !line || title.clientWidth === 0 || isTaglineSplit()) return;
  gsap.killTweensOf(title);

  const widthAt = (stretch: number) => {
    title.style.setProperty('--fit', String(stretch));
    return line.offsetWidth;
  };

  let low = NARROWEST;
  let high = WIDEST;
  for (let step = 0; step < 10; step++) {
    const middle = (low + high) / 2;
    // A few pixels of slack, because the last glyph's ink can reach past its advance width.
    if (widthAt(middle) > title.clientWidth - 4) high = middle;
    else low = middle;
  }

  if (animate) {
    gsap.fromTo(title, { '--fit': NARROWEST }, { '--fit': low, duration: 1.25, ease: 'expo.out', delay });
  } else {
    title.style.setProperty('--fit', String(low));
  }
}
