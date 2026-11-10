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

  const hero = document.querySelector<HTMLElement>('.sv-hero');
  const onScroll = () => {
    const pastHero = hero ? hero.getBoundingClientRect().bottom <= top.offsetHeight : scrollY > 8;
    top.classList.toggle('is-scrolled', pastHero);
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // The section crossing the middle of the screen is the one you're reading.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  document.querySelectorAll('main > section[id]').forEach((section) => observer.observe(section));
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
