import gsap from 'gsap';
import { clock, validStarts } from '../lib/slots';
import { localTime } from '../lib/zones';
import { isMotionReduced } from './motion';

function initSlots() {
  const demo = document.querySelector<HTMLElement>('[data-slots]');
  if (!demo) return;
  const chips = [...demo.querySelectorAll<HTMLButtonElement>('[data-service]')];
  const slots = [...demo.querySelectorAll<HTMLElement>('[data-start]')];
  const readout = demo.querySelector('[data-slots-readout]')!;

  const update = () => {
    const minutes = chips
      .filter((chip) => chip.getAttribute('aria-pressed') === 'true')
      .reduce((total, chip) => total + Number(chip.dataset.service), 0);
    const valid = validStarts(minutes);

    const lit = slots.filter((slot) => {
      const isValid = valid.includes(Number(slot.dataset.start));
      slot.classList.toggle('is-valid', isValid);
      return isValid;
    });
    if (!isMotionReduced() && lit.length) {
      gsap.fromTo(lit, { scaleY: 0.4 }, { scaleY: 1, duration: 0.4, ease: 'back.out(2.5)', stagger: 0.025, overwrite: true });
    }

    if (minutes === 0) readout.textContent = 'Pick at least one service.';
    else if (valid.length === 0) readout.textContent = `Nothing fits ${minutes} minutes that day, so the client never sees a slot that can’t work.`;
    else readout.textContent = `${valid.length} valid start ${valid.length === 1 ? 'time' : 'times'}: ${valid.map(clock).join(', ')}.`;
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
      update();
    });
  });
}

function initZones() {
  const demo = document.querySelector<HTMLElement>('[data-zones]');
  if (!demo) return;
  const input = demo.querySelector<HTMLInputElement>('[data-zones-input]')!;
  const hourLabel = demo.querySelector('[data-zones-hour]')!;
  const weekButtons = [...demo.querySelectorAll<HTMLButtonElement>('[data-zones-week]')];
  const times = [...demo.querySelectorAll<HTMLElement>('[data-zones-time]')];

  const update = () => {
    const hour = Number(input.value);
    const week = weekButtons.find((button) => button.getAttribute('aria-pressed') === 'true')!.dataset.zonesWeek!;
    hourLabel.textContent = `${hour}:00`;
    times.forEach((el) => {
      const next = localTime(hour, week, el.dataset.zonesTime!);
      if (next === el.textContent) return;
      el.textContent = next;
      if (!isMotionReduced()) gsap.fromTo(el, { y: 6, opacity: 0.3 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: true });
    });
  };

  input.addEventListener('input', update);
  weekButtons.forEach((button) => {
    button.addEventListener('click', () => {
      weekButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      update();
    });
  });
}

export function initDemos() {
  initSlots();
  initZones();
}
