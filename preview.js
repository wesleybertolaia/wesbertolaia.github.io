const { t, url: localizedUrl } = window.siteLocale;
const cards = [...document.querySelectorAll('.project-card')];
const frame = document.querySelector('#demo-frame');
const title = document.querySelector('#preview-title');
const external = document.querySelector('#open-demo');
const compact = matchMedia('(max-width: 740px)');
let active = cards[0];
const fitOnDesktop = matchMedia('(min-width: 1050px) and (min-height: 700px)');
let contentObserver;
let observedBody;
let pendingFit;

function resizeDemo() {
  pendingFit = undefined;
  const body = observedBody;
  if (!body) return;

  const heightAt = (zoom) => {
    body.style.zoom = zoom;
    return Math.ceil(body.getBoundingClientRect().height) + 1;
  };

  let height = heightAt(1);
  if (fitOnDesktop.matches) {
    const top = frame.getBoundingClientRect().top + window.scrollY;
    const available = Math.floor(innerHeight - top - 12);
    if (height > available) {
      let low = .6;
      let high = 1;
      for (let i = 0; i < 8; i += 1) {
        const mid = (low + high) / 2;
        if (heightAt(mid) <= available) low = mid;
        else high = mid;
      }
      height = heightAt(low);
    }
  }
  if (height > 1) frame.style.height = height + 'px';
}

function scheduleFit() {
  if (pendingFit === undefined) pendingFit = requestAnimationFrame(resizeDemo);
}

function watchDemo() {
  contentObserver?.disconnect();
  const doc = frame.contentDocument;
  observedBody = doc?.body;
  if (!observedBody) return;

  // The portfolio supplies navigation for its own embedded project pages.
  const isProject = cards.some(card => {
    const url = new URL(card.dataset.url);
    return url.origin === doc.location.origin && url.pathname === doc.location.pathname;
  });
  if (isProject) {
    const header = doc.querySelector('body > header');
    if (header) {
      header.style.display = 'none';
      observedBody.style.display = 'flow-root';
    }
  }
  contentObserver = new MutationObserver(scheduleFit);
  contentObserver.observe(observedBody, {
    subtree: true, childList: true, characterData: true, attributes: true,
    attributeFilter: ['hidden', 'class', 'open'],
  });
  doc.addEventListener('load', scheduleFit, true);
  if (doc.URL !== 'about:blank' && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    frame.animate([{opacity: .68}, {opacity: 1}], { duration: 230, easing: 'ease-out' });
  }
  scheduleFit();
}

window.addEventListener('resize', scheduleFit);
frame.addEventListener('load', watchDemo);
if (frame.contentDocument?.readyState === 'complete') watchDemo();

function select(card, focusPreview = false) {
  if (card !== active) {
    active = card;
    for (const item of cards) item.setAttribute('aria-pressed', String(item === card));
    const name = card.querySelector('strong').textContent;
    title.textContent = t(name + ' live demo');
    frame.title = title.textContent;
    contentObserver?.disconnect();
    observedBody = undefined;
    frame.src = localizedUrl(card.dataset.url);
    external.href = localizedUrl(card.dataset.url);
  }
  if (focusPreview) title.focus();
}

for (const card of cards) {
  card.addEventListener('click', () => select(card, compact.matches));
}
const legacyHash = location.hash.slice(1);
if (legacyHash === 'work' || cards.some(card => card.dataset.project === legacyHash)) {
  location.replace(localizedUrl('./case-studies.html' + (legacyHash === 'work' ? '' : '#' + legacyHash)));
} else {
  const wanted = new URLSearchParams(location.search).get('demo');
  const requested = cards.find(card => card.dataset.project === wanted);
  if (requested && requested !== active) select(requested);
  else {
    const source = localizedUrl(active.dataset.url);
    if (frame.src !== source) frame.src = source;
  }
}
