import gsap from 'gsap';
import { isMotionReduced } from './motion';

// The full-page capture drifts slowly on its own, and follows the pointer while hovered.
export function initPreviews() {
  document.querySelectorAll<HTMLElement>('[data-preview]').forEach((preview) => {
    const view = preview.querySelector<HTMLElement>('[data-preview-view]')!;
    const image = preview.querySelector<HTMLImageElement>('[data-preview-image]')!;
    let drift: gsap.core.Tween | null = null;
    let visible = false;
    let hovering = false;

    const travel = () => Math.max(0, image.offsetHeight - view.clientHeight);

    const startDrift = () => {
      drift?.kill();
      drift = null;
      if (!visible || hovering || isMotionReduced() || !image.complete || travel() === 0) return;
      const end = -travel();
      const position = Number(gsap.getProperty(image, 'y'));
      drift = gsap.to(image, {
        y: end,
        // Same speed no matter where it resumes from.
        duration: Math.max(1, (position - end) / 70),
        ease: 'none',
        onComplete: () => {
          gsap.to(image, { y: 0, duration: 0.9, ease: 'power2.inOut', delay: 1.2, onComplete: startDrift });
        },
      });
    };

    image.addEventListener('load', startDrift);

    new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) startDrift();
      else {
        drift?.kill();
        drift = null;
      }
    }, { threshold: 0.4 }).observe(view);

    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    view.addEventListener('pointerenter', () => {
      hovering = true;
      drift?.kill();
      drift = null;
    });
    view.addEventListener('pointermove', (event) => {
      const bounds = view.getBoundingClientRect();
      const ratio = gsap.utils.clamp(0, 1, (event.clientY - bounds.top) / bounds.height);
      gsap.to(image, { y: -ratio * travel(), duration: isMotionReduced() ? 0 : 0.5, ease: 'power2.out', overwrite: true });
    });
    view.addEventListener('pointerleave', () => {
      hovering = false;
      startDrift();
    });
  });
}
