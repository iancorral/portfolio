import gsap from 'gsap';
import { isMotionReduced } from './motion';

// Inside a folder, the small tabs on the side choose which paper sits on top.
export function initPapers() {
  document.querySelectorAll<HTMLElement>('[data-files]').forEach((group) => {
    const tabs = [...group.querySelectorAll<HTMLButtonElement>('[data-file-tab]')];
    const paperFor = (id: string) => group.querySelector<HTMLElement>(`[data-paper="${id}"]`)!;
    let swap: gsap.core.Timeline | null = null;

    const setCurrentPaper = (paper: HTMLElement) => {
      group.querySelectorAll('[data-paper]').forEach((other) => other.classList.toggle('is-current', other === paper));
      paper.scrollTop = 0;
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.getAttribute('aria-current') === 'true') return;
        swap?.progress(1);

        const current = group.querySelector<HTMLElement>('[data-paper].is-current')!;
        const next = paperFor(tab.dataset.fileTab!);
        tabs.forEach((other) => {
          if (other === tab) other.setAttribute('aria-current', 'true');
          else other.removeAttribute('aria-current');
        });

        if (isMotionReduced()) {
          setCurrentPaper(next);
          return;
        }

        const stamp = next.querySelector('[data-stamp]');
        swap = gsap
          .timeline({
            onComplete: () => {
              gsap.set([current, next], { clearProps: 'all' });
              if (stamp) gsap.set(stamp, { clearProps: 'all' });
              swap = null;
            },
          })
          .to(current, { x: -36, y: 18, rotation: -1.6, autoAlpha: 0, duration: 0.18, ease: 'power2.in' })
          .add(() => setCurrentPaper(next))
          .fromTo(
            next,
            { x: 30, y: 26, rotation: 1.2, autoAlpha: 0 },
            { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.55, ease: 'expo.out' },
          );
        if (stamp) swap.from(stamp, { scale: 2.3, autoAlpha: 0, duration: 0.26, ease: 'power4.in' }, 0.34);
      });
    });
  });
}
