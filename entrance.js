(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const easing = 'cubic-bezier(.2,.7,.25,1)';
  const running = new Set();

  function reveal(element, delay, distance = 8) {
    if (!element || reducedMotion.matches || element.contains(document.activeElement)) return;
    const animation = element.animate(
      [
        { opacity: 0, translate: `0 ${distance}px` },
        { opacity: 1, translate: '0 0' },
      ],
      { duration: 360, delay, easing, fill: 'backwards' }
    );
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
  opening.forEach((selector, index) => reveal(document.querySelector(selector), index * 52));

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
      elements.forEach((element, index) => reveal(element, index * 55, 12));
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
