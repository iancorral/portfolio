function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-waiting');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  // Only what starts below the fold animates, so the first screen never waits.
  items.forEach((item) => {
    if (item.getBoundingClientRect().top < innerHeight * 0.9) return;
    item.classList.add('is-waiting');
    observer.observe(item);
  });
}

function initQuote() {
  const form = document.querySelector<HTMLFormElement>('[data-quote]');
  if (!form) return;
  const preview = form.querySelector<HTMLElement>('[data-quote-preview]')!;
  const whatsappLink = form.querySelector<HTMLAnchorElement>('[data-quote-whatsapp]');
  const emailLink = form.querySelector<HTMLAnchorElement>('[data-quote-correo]')!;

  const buildMessage = () => {
    const data = new FormData(form);
    const needs = data.getAll('necesidad').map(String);
    const business = String(data.get('negocio') ?? '').trim();
    const details = String(data.get('detalles') ?? '').trim();
    const lines = ['Hola Ian, vi tu página de servicios y me gustaría platicar de un proyecto.'];
    if (business) lines.push(`Mi negocio: ${business}`);
    if (needs.length) lines.push(`Necesito: ${needs.join(', ')}`);
    if (details) lines.push(details);
    return lines.join('\n');
  };

  const update = () => {
    const message = buildMessage();
    preview.textContent = message;
    const text = encodeURIComponent(message);
    if (whatsappLink) whatsappLink.href = `https://wa.me/${form.dataset.whatsapp}?text=${text}`;
    emailLink.href = `mailto:${form.dataset.correo}?subject=${encodeURIComponent('Proyecto para mi negocio')}&body=${text}`;
  };

  form.addEventListener('input', update);
  form.addEventListener('submit', (event) => event.preventDefault());
}

function initNav() {
  const top = document.querySelector<HTMLElement>('[data-top]');
  if (!top) return;
  const links = [...top.querySelectorAll<HTMLAnchorElement>('[data-spy]')];

  // On phones the section links scroll sideways, so the current one is brought to the middle of the strip.
  // This only moves the strip, never the page.
  const strip = top.querySelector<HTMLElement>('.sv-nav');
  const revealInStrip = (link: HTMLElement) => {
    if (!strip || strip.scrollWidth <= strip.clientWidth || !strip.contains(link)) return;
    const stripBox = strip.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    const left = strip.scrollLeft + (linkBox.left - stripBox.left) - (stripBox.width - linkBox.width) / 2;
    strip.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const hero = document.querySelector<HTMLElement>('.sv-hero');
  const onScroll = () => {
    // "Past" allows for the folder tab of the next section, which overlaps the hero's last few pixels,
    // plus room for where a jump from the menu lands.
    const pastHero = hero ? hero.getBoundingClientRect().bottom <= top.offsetHeight + 96 : scrollY > 8;
    top.classList.toggle('is-scrolled', pastHero);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // The current section is the last one whose top has passed a line a little below the bar.
  // Short sections still count when you jump to them, and the last one wins at the bottom of the page.
  const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  let current = '';
  let queued = false;
  const spy = () => {
    queued = false;
    const line = top.offsetHeight + innerHeight * 0.3;
    const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    let id = '';
    for (const section of sections) if (section.getBoundingClientRect().top <= line) id = section.id;
    if (atBottom) id = sections.at(-1)?.id ?? id;
    if (id === current) return;
    current = id;
    links.forEach((link) => {
      if (link.hash === `#${id}`) {
        link.setAttribute('aria-current', 'true');
        revealInStrip(link);
      } else link.removeAttribute('aria-current');
    });
  };
  const queueSpy = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(spy);
  };
  addEventListener('scroll', queueSpy, { passive: true });
  addEventListener('resize', queueSpy);
  spy();
}

// The floating contact button only appears when nothing else on screen offers the same thing.
function initDock() {
  const dock = document.querySelector<HTMLElement>('[data-dock]');
  if (!dock) return;
  const overlapping = new Set<Element>();
  const update = () => dock.classList.toggle('is-visible', overlapping.size === 0);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) overlapping.add(entry.target);
        else overlapping.delete(entry.target);
      });
      update();
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll('.sv-hero .sv-actions, #cotizar .sv-quote').forEach((el) => observer.observe(el));
  update();
}

initReveal();
initQuote();
initNav();
initDock();
