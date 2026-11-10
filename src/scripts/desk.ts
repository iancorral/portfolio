import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { isMotionReduced } from './motion';

gsap.registerPlugin(Draggable, InertiaPlugin);

const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
let tossed = false;

// Plays once. After that the cards stay wherever the visitor left them.
export function tossCards(delay: number) {
  if (tossed) return;
  tossed = true;
  gsap.from(cards, {
    x: () => gsap.utils.random(40, 150),
    y: () => gsap.utils.random(-170, -70),
    rotation: () => gsap.utils.random(-24, 24),
    autoAlpha: 0,
    duration: 1,
    ease: 'expo.out',
    stagger: 0.09,
    delay,
  });
}

export function initDesk() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  // Kept to the first screen, so a hard throw can't lose a card.
  const bounds = document.querySelector('.cover');
  let z = 5;

  cards.forEach((el) => {
    Draggable.create(el, {
      type: 'x,y',
      bounds,
      minimumMovement: 4,
      edgeResistance: 0.75,
      throwResistance: 2600,
      inertia: !isMotionReduced(),
      onPress() {
        el.style.zIndex = String(++z);
        gsap.to(el, { scale: 1.04, duration: 0.2, overwrite: 'auto' });
      },
      onRelease() {
        gsap.to(el, { scale: 1, duration: 0.3, overwrite: 'auto' });
      },
    });
  });
}
