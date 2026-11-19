(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const easing = 'cubic-bezier(.2,.7,.25,1)';
  const running = new Set();

  const motion = {
    rise: [{ opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' }],
    headline: [
      { opacity: 0, translate: '0 32px', clipPath: 'inset(0 0 100% 0)' },
      { opacity: 1, translate: '0 0', clipPath: 'inset(0 0 0% 0)' },
    ],
    screen: [
      { opacity: 0, translate: '0 38px', scale: '.955', clipPath: 'inset(7% 0 7% 0 round 18px)' },
      { opacity: 1, translate: '0 0', scale: '1', clipPath: 'inset(0 round 12px)' },
    ],
  };

  function reveal(element, delay, style = 'rise') {
    if (!element || reducedMotion.matches || element.contains(document.activeElement)) return;
    const animation = element.animate(motion[style], {
      duration: style === 'rise' ? 620 : 940,
      delay,
      easing,
      fill: 'backwards',
    });
    running.add(animation);
    animation.onfinish = animation.oncancel = () => running.delete(animation);
  }

  const opening = [
    '.site-identity .eyebrow',
    '.site-name',
    '.masthead nav',
    '.about-label',
    '#about-title',
    '.profile-summary',
  ];
  opening.forEach((selector, index) => {
    reveal(document.querySelector(selector), index * 95, selector === '#about-title' ? 'headline' : 'rise');
  });

  const sequences = new Map([
    ['.profile-details > section', 'h2, .experience-list li, .stack-list'],
    ['.project-list', 'h2, .project-card'],
    ['.preview-panel', null],
    ['.project-notes', 'h2, [data-project-note]:not([hidden])'],
  ].flatMap(([selector, children]) =>
    [...document.querySelectorAll(selector)].map(section => [section, children])
  ));

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const section = entry.target;
      const children = sequences.get(section);
      const elements = children ? [...section.querySelectorAll(children)] : [section];
      const lead = section.matches('.project-notes') ? 220 : section.matches('.profile-details > section') ? 320 : 0;
      elements.forEach((element, index) => {
        reveal(element, lead + index * 95, section.matches('.preview-panel') ? 'screen' : 'rise');
      });
      observer.unobserve(section);
    }
  }, { threshold: .08 });

  for (const section of sequences.keys()) observer.observe(section);
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    for (const animation of running) animation.cancel();
    observer.disconnect();
  });
  document.addEventListener('focusin', event => {
    for (const animation of running) {
      if (animation.effect.target.contains(event.target)) animation.finish();
    }
  });
})();
