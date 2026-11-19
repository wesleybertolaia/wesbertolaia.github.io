const { t, url: localizedUrl } = window.siteLocale;
const cards = [...document.querySelectorAll('.project-card')];
const viewport = document.querySelector('.demo-viewport');
const title = document.querySelector('#preview-title');
const external = document.querySelector('#open-demo');
const status = document.querySelector('#preview-status');
const notes = document.querySelectorAll('[data-project-note]');
const compact = matchMedia('(max-width: 740px)');
const canvasMinWidth = 880;
let active = cards[0];
let displayed;
let pending;

function frameDimensions() {
  const width = Math.max(canvasMinWidth, viewport.clientWidth);
  const scale = viewport.clientWidth / width;
  const aspectHeight = width * 9 / 16;
  const availableHeight = scale && viewport.clientHeight ? viewport.clientHeight / scale : aspectHeight;
  return { width, height: Math.floor(Math.min(aspectHeight, availableHeight)) };
}

function fitPreview(preview) {
  const { frame, doc } = preview;
  if (!doc || !viewport.clientWidth || !viewport.clientHeight) return;
  const initial = frameDimensions();
  let { width, height } = initial;
  const root = doc.documentElement;

  // Start at the reference viewport so shorter views can use more of the stage again.
  for (let pass = 0; pass < 4; pass += 1) {
    frame.style.width = width + 'px';
    frame.style.height = height + 'px';
    const nextWidth = Math.max(width, root.scrollWidth);
    const nextHeight = Math.max(height, root.scrollHeight);
    if (nextWidth === width && nextHeight === height) break;
    width = nextWidth;
    height = nextHeight;
  }
  frame.style.width = width + 'px';
  frame.style.height = height + 'px';
  const scale = Math.min(1, viewport.clientWidth / width, viewport.clientHeight / height);
  frame.style.setProperty('--demo-scale', scale);
}

function scheduleFit(preview) {
  if (preview.fitRequest || !preview.frame.isConnected) return;
  preview.fitRequest = requestAnimationFrame(() => {
    preview.fitRequest = 0;
    fitPreview(preview);
  });
}

function removePreview(preview) {
  if (!preview) return;
  clearTimeout(preview.timeout);
  cancelAnimationFrame(preview.fitRequest);
  preview.observer?.disconnect();
  preview.frame.remove();
}

function setStatus(message = '') {
  status.textContent = message;
  status.hidden = !message;
}

function showLoaded(preview) {
  if (pending !== preview) return;
  clearTimeout(preview.timeout);
  fitPreview(preview);
  removePreview(displayed);
  preview.frame.id = 'demo-frame';
  preview.frame.inert = false;
  preview.frame.removeAttribute('aria-hidden');
  preview.frame.classList.add('is-visible');
  displayed = preview;
  pending = undefined;
  title.textContent = preview.frame.title;
  setStatus();
}

function pageLoaded(preview) {
  if (pending !== preview && displayed !== preview) return;
  const doc = preview.frame.contentDocument;
  if (!doc?.body || doc.URL === 'about:blank') return;
  preview.doc = doc;
  preview.observer?.disconnect();

  const embeddedStyle = doc.createElement('style');
  embeddedStyle.textContent = 'html { overflow: hidden; scrollbar-width: none; }';
  doc.head.append(embeddedStyle);
  doc.documentElement.toggleAttribute('data-portfolio-preview', true);
  const header = doc.querySelector('body > header');
  if (header) header.style.display = 'none';

  preview.observer = new MutationObserver(() => scheduleFit(preview));
  preview.observer.observe(doc.body, { childList: true, subtree: true, attributes: true, characterData: true });
  doc.fonts?.ready.then(() => {
    if (displayed === preview || pending === preview) scheduleFit(preview);
  });
  doc.addEventListener('load', () => scheduleFit(preview), true);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (pending === preview) showLoaded(preview);
    else if (displayed === preview) fitPreview(preview);
  }));
}

function updatePreview() {
  const name = active.querySelector('strong').textContent;
  const source = localizedUrl(active.dataset.url);
  external.href = source;
  if (pending?.source === source) return;
  removePreview(pending);
  pending = undefined;

  if (displayed?.source === source) {
    setStatus();
    return;
  }
  const frame = document.createElement('iframe');
  frame.className = 'demo-frame';
  frame.title = t(name + ' live demo');
  frame.inert = true;
  frame.setAttribute('aria-hidden', 'true');
  const dimensions = frameDimensions();
  frame.style.width = dimensions.width + 'px';
  frame.style.height = dimensions.height + 'px';
  const preview = { frame, source, fitRequest: 0 };
  pending = preview;
  setStatus(t('Loading {project}…').replace('{project}', name));
  frame.addEventListener('load', () => pageLoaded(preview));
  frame.src = source;
  viewport.insertBefore(frame, status);
  preview.timeout = setTimeout(() => {
    if (pending !== preview) return;
    removePreview(preview);
    pending = undefined;
    setStatus(t('Preview unavailable. Open the full site or select the project again.'));
  }, 12000);
}

new ResizeObserver(() => {
  if (displayed) scheduleFit(displayed);
  if (pending?.doc) scheduleFit(pending);
}).observe(viewport);

document.addEventListener('portfolio-language-change', updatePreview);

function select(card, focusPreview = false) {
  if (card !== active) {
    active = card;
    for (const note of notes) note.hidden = note.dataset.projectNote !== card.dataset.project;
    for (const item of cards) item.setAttribute('aria-pressed', String(item === card));
  }
  updatePreview();
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
  select(cards.find(card => card.dataset.project === wanted) || active);
}
