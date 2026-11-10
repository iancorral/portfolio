import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { folders, person, type FolderId } from '../data/site';
import { tossCards } from './desk';
import { fitTagline, isTaglineSplit } from './fit';
import { isMotionReduced } from './motion';

gsap.registerPlugin(SplitText);

// Folder change, in seconds. The open folder's contents go away, the new folder falls forward
// from behind the tabs like a flap closing, and its contents come out last.
const TUCK = 0.2;
const FLAP_START = 0.12;
const FLAP = 0.46;
const CONTENT_START = FLAP_START + FLAP - 0.04;

const root = document.documentElement;
const ids = folders.map((folder) => folder.id);
const isFolder = (id: string): id is FolderId => (ids as string[]).includes(id);

const layers = new Map(ids.map((id) => [id, document.querySelector<HTMLElement>(`[data-layer="${id}"]`)!]));
const panels = new Map(ids.map((id) => [id, document.querySelector<HTMLElement>(`[data-folder-panel="${id}"]`)!]));
const rail = document.querySelector<HTMLElement>('[data-rail]')!;
const stack = document.querySelector<HTMLElement>('[data-stack]')!;

let active = root.dataset.folder as FolderId;
let order: FolderId[] = [active, ...ids.filter((id) => id !== active)];
let transition: gsap.core.Timeline | null = null;
let scene: gsap.Context | null = null;
let hint: gsap.core.Tween | null = null;

function titleFor(id: FolderId) {
  const base = `${person.name} | ${person.role}`;
  if (id === 'home') return base;
  return `${folders.find((folder) => folder.id === id)!.label} | ${person.name}`;
}

function markCurrent(id: FolderId) {
  layers.forEach((layer, layerId) => {
    const ear = layer.querySelector('[data-ear]')!;
    if (layerId === id) ear.setAttribute('aria-current', 'true');
    else ear.removeAttribute('aria-current');
  });
  document.title = titleFor(id);
}

// Everything inside a folder animates here, so leaving the folder can undo it all in one call.
function playScene(panel: HTMLElement, delay: number) {
  scene = gsap.context(() => {
    const tl = gsap.timeline({ delay });

    if (panel.id === 'home') fitTagline({ animate: true, delay: delay + 0.35 });

    const title = panel.querySelector<HTMLElement>('[data-split]');
    if (title) {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      tl.from(split.lines, {
        yPercent: 118,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.07,
        onComplete: () => split.revert(),
      }, 0);
    }

    const supporting = panel.querySelectorAll(
      '.eyebrow, .folder__intro, .files > li, .pending, .cover__who, .cover__copy, .cover__links, .desk__mark',
    );
    tl.from(supporting, { y: 14, autoAlpha: 0, duration: 0.55, ease: 'power3.out', stagger: 0.04 }, 0.08);

    // Papers come up out of the folder, clipped by its bottom edge.
    const card = panel.querySelector('.biz');
    if (card) tl.from(card, { y: () => Math.min(panel.clientHeight, innerHeight), rotation: 7, duration: 0.85, ease: 'expo.out' }, 0.1);

    const papers = panel.querySelector('.papers');
    if (papers) {
      tl.from(papers, { y: () => Math.min(panel.clientHeight, innerHeight), duration: 0.8, ease: 'expo.out' }, 0.06);
      const stamp = papers.querySelector('.is-current [data-stamp]');
      if (stamp) tl.from(stamp, { scale: 2.3, autoAlpha: 0, duration: 0.28, ease: 'power4.in' }, 0.48);
    }

    const counters = panel.querySelectorAll<HTMLElement>('[data-count]');
    counters.forEach((el) => {
      const counter = { value: 0 };
      tl.to(counter, {
        value: Number(el.dataset.count),
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.value));
        },
      }, 0.2);
    });

    // A reverted tween doesn't restore text, so put the real numbers back on the way out.
    return () => counters.forEach((el) => {
      el.textContent = el.dataset.count ?? '';
    });
  }, panel);

  if (panel.id === 'home') tossCards(delay + 0.05);
}

function open(to: FolderId, { push = true } = {}) {
  if (to === active) {
    const top = stack.getBoundingClientRect().top + scrollY - rail.offsetHeight;
    if (scrollY > top) scrollTo({ top, behavior: isMotionReduced() ? 'instant' : 'smooth' });
    return;
  }

  transition?.progress(1);
  hint?.kill();
  scene?.revert();
  scene = null;

  const fromPanel = panels.get(active)!;
  const toPanel = panels.get(to)!;
  const toLayer = layers.get(to)!;
  const outgoing = fromPanel.querySelectorAll('[data-content] > *');

  active = to;
  order = [to, ...order.filter((id) => id !== to)];
  markCurrent(to);
  if (push) history.pushState(null, '', `#${to}`);

  // Keep the old folder on screen while the new one covers it.
  fromPanel.style.display = 'block';
  fromPanel.style.position = 'relative';
  fromPanel.style.zIndex = '1';
  root.dataset.folder = to;

  // On a scrolling layout, return to the top of the stack without the old folder visibly jumping.
  const top = stack.getBoundingClientRect().top + scrollY - rail.offsetHeight;
  const overshoot = Math.max(0, scrollY - top);
  if (overshoot > 0) {
    scrollTo({ top, behavior: 'instant' });
    gsap.set(fromPanel, { y: -overshoot });
  }

  const finish = () => {
    gsap.set(outgoing, { clearProps: 'all' });
    gsap.set(fromPanel, { clearProps: 'all' });
    fromPanel.removeAttribute('style');
    gsap.set(toPanel, { clearProps: 'all' });
    stack.style.removeProperty('perspective');
    transition = null;
  };

  const focusTitle = () => {
    toPanel.querySelector<HTMLElement>('[tabindex="-1"]')?.focus({ preventScroll: true });
  };

  if (isMotionReduced()) {
    order.forEach((id, depth) => {
      const layer = layers.get(id)!;
      layer.style.setProperty('--d', String(depth));
      layer.style.zIndex = String(10 - depth);
    });
    finish();
    if (to === 'home') fitTagline();
    focusTitle();
    return;
  }

  // Must stay well beyond the panel's height, or a tall flap would swing past the camera.
  stack.style.perspective = `${Math.max(1800, toPanel.offsetHeight * 2.4)}px`;

  playScene(toPanel, CONTENT_START);

  const tl = gsap.timeline({ onComplete: finish });
  transition = tl;

  tl.to(outgoing, { y: 26, autoAlpha: 0, duration: TUCK, ease: 'power2.in', stagger: 0.015 }, 0);

  order.forEach((id, depth) => {
    const layer = layers.get(id)!;
    layer.style.zIndex = id === to ? '20' : String(10 - depth);
    tl.to(layer, { '--d': depth, duration: 0.5, ease: 'power3.inOut' }, 0.02);
  });

  // Picked up by its tab first, then dropped into place at the front.
  tl.fromTo(toLayer, { '--lift': 0 }, { '--lift': -14, duration: FLAP_START + 0.08, ease: 'power2.out' }, 0);
  tl.to(toLayer, { '--lift': 0, duration: 0.5, ease: 'back.out(2.2)' }, FLAP_START + 0.08);
  tl.set(toLayer, { zIndex: 10 }, FLAP_START + 0.6);

  tl.fromTo(
    toPanel,
    { rotationX: 88, transformOrigin: '50% 0%' },
    { rotationX: 0, duration: FLAP, ease: 'power2.in' },
    FLAP_START,
  );
  // From an explicit value: starting at "none" would flash black, since GSAP reads it as brightness 0.
  tl.fromTo(fromPanel, { filter: 'brightness(1)' }, { filter: 'brightness(0.72)', duration: FLAP, ease: 'power2.in' }, FLAP_START);

  focusTitle();
}

export async function initCabinet() {
  markCurrent(active);

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || !isFolder(link.hash.slice(1))) return;
    event.preventDefault();
    open(link.hash.slice(1) as FolderId);
  });

  addEventListener('popstate', () => {
    const hash = location.hash.slice(1);
    open(isFolder(hash) ? hash : 'home', { push: false });
  });

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (active === 'home' && !transition) fitTagline();
    }, 120);
  });

  // Line splitting and the tagline need the real font, so it's requested explicitly:
  // document.fonts.ready can resolve before a preloaded font is in use. A slow font still can't hold the page back.
  const fontArrived = await Promise.race([
    document.fonts.load('640 16px "Archivo Variable"').then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 900)),
  ]);
  if (!fontArrived) {
    const refit = () => {
      if (isTaglineSplit()) setTimeout(refit, 300);
      else if (active === 'home' && !transition) fitTagline();
    };
    document.fonts.addEventListener('loadingdone', refit, { once: true });
  }

  if (isMotionReduced()) {
    fitTagline();
  } else {
    const panel = panels.get(active)!;
    const ordered = order.map((id) => layers.get(id)!).reverse();
    gsap.from(ordered, { '--lift': 90, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05 });
    playScene(panel, 0.12);

    // A small nudge of the closed tabs, to show they can be picked up.
    hint = gsap.to(order.slice(1).map((id) => layers.get(id)!), {
      '--lift': -8,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      stagger: 0.07,
      delay: 1.5,
    });
  }

  root.classList.add('ready');
}
