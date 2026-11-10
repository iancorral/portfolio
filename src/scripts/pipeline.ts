import gsap from 'gsap';
import { isMotionReduced } from './motion';

export function initPipeline() {
  const pipe = document.querySelector<HTMLElement>('[data-pipe]');
  if (!pipe) return;

  const fill = pipe.querySelector<HTMLElement>('[data-pipe-fill]')!;
  const note = pipe.querySelector<HTMLElement>('[data-pipe-note]')!;
  const nodes = gsap.utils.toArray<HTMLButtonElement>(pipe.querySelectorAll('[data-pipe-step]'));
  let run: gsap.core.Timeline | null = null;

  const select = (node: HTMLButtonElement) => {
    nodes.forEach((other) => other.setAttribute('aria-pressed', String(other === node)));
    note.textContent = node.dataset.note ?? '';
  };

  const settle = () => {
    run?.kill();
    run = null;
    nodes.forEach((node) => node.classList.add('is-done'));
    fill.style.setProperty('--p', '1');
    note.setAttribute('aria-live', 'polite');
  };

  const reset = () => {
    nodes.forEach((node) => node.classList.remove('is-done'));
    fill.style.setProperty('--p', '0');
  };

  const play = () => {
    settle();
    if (isMotionReduced()) return;
    reset();
    // The steps would otherwise be read aloud one after another.
    note.setAttribute('aria-live', 'off');

    const tl = gsap.timeline({ onComplete: settle });
    nodes.forEach((node, i) => {
      if (i > 0) tl.to(fill, { '--p': i / (nodes.length - 1), duration: 0.42, ease: 'power1.inOut' });
      tl.call(() => {
        node.classList.add('is-done');
        select(node);
      });
      tl.fromTo(
        node.querySelector('.pipe__light'),
        { scale: 0.6 },
        { scale: 1, duration: 0.3, ease: 'back.out(3)' },
        '<',
      );
    });
    run = tl;
  };

  nodes.forEach((node) => {
    node.addEventListener('click', () => {
      settle();
      select(node);
    });
  });
  pipe.querySelector('[data-pipe-run]')?.addEventListener('click', play);

  if (isMotionReduced()) return;

  // Waits with its lights off, and runs the first time it scrolls into view.
  reset();
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      play();
    },
    { threshold: 0.5 },
  );
  observer.observe(pipe);
}
