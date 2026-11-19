const { t, url: localizedUrl } = window.siteLocale;
const cards = [...document.querySelectorAll('.project-card')];
const frame = document.querySelector('#demo-frame');
const title = document.querySelector('#preview-title');
const external = document.querySelector('#open-demo');
const compact = matchMedia('(max-width: 740px)');
let active = cards[0];
function watchDemo() {
  const doc = frame.contentDocument;
  if (!doc?.body) return;

  // The portfolio already provides navigation when a project is embedded.
  const isProject = cards.some(card => {
    const url = new URL(card.dataset.url);
    return url.origin === doc.location.origin && url.pathname === doc.location.pathname;
  });
  if (isProject) {
    const header = doc.querySelector('body > header');
    if (header) header.style.display = 'none';
  }
}

frame.addEventListener('load', watchDemo);
if (frame.contentDocument?.readyState === 'complete') watchDemo();

const notes = document.querySelectorAll("[data-project-note]");

function updatePreview() {
  const name = active.querySelector('strong').textContent;
  title.textContent = t(name + ' live demo');
  frame.title = title.textContent;
  const source = localizedUrl(active.dataset.url);
  if (frame.src !== source) frame.src = source;
  external.href = source;
}

document.addEventListener('portfolio-language-change', updatePreview);

function select(card, focusPreview = false) {
  if (card !== active) {
    active = card;
    for (const note of notes) note.hidden = note.dataset.projectNote !== card.dataset.project;
    for (const item of cards) item.setAttribute('aria-pressed', String(item === card));
    updatePreview();
  }
  if (focusPreview) title.focus({ preventScroll: true });
}

for (const card of cards) {
  card.addEventListener('click', () => select(card, compact.matches));
}
const legacyHash = location.hash.slice(1);
if (legacyHash === 'work' || ['carepath', 'dentaldesk', 'shiftledger'].includes(legacyHash)) {
  location.replace(localizedUrl('./case-studies.html' + (legacyHash === 'work' ? '' : '#' + legacyHash)));
} else {
  const wanted = new URLSearchParams(location.search).get('demo');
  const requested = cards.find(card => card.dataset.project === wanted);
  if (requested && requested !== active) select(requested);
  else updatePreview();
}
