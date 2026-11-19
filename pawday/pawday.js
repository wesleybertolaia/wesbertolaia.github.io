(() => {
  const { t } = window.siteLocale;
  const get = id => document.getElementById(id);
  const catalog = {
    dog: [
      ['Daycare', 'A day of supervised play with quiet breaks.', 29, 'per visit'],
      ['Boarding', 'Overnight care with a walk and your usual feeding routine.', 49, 'per night'],
      ['Grooming', 'A bath, brush and nail trim.', 39, 'per visit'],
    ],
    cat: [
      ['Daycare', 'A quiet daytime stay with a hideaway and room to climb.', 22, 'per visit'],
      ['Boarding', 'A private cat suite away from the dog play area.', 36, 'per night'],
      ['Grooming', 'A gentle brush-out and nail trim in a quiet room.', 32, 'per visit'],
    ],
  };
  const pets = { dog: ['Maple', 'Otis'], cat: ['Juniper', 'Mochi'] };
  const list = get('service-list');
  const booking = get('booking');
  const form = get('visit-form');
  const review = get('review');
  const bookings = get('bookings');
  const confirm = get('confirm');
  const { pet, start, end, time } = form.elements;
  const key = 'pawday.bookings.v1';
  let species = 'dog';
  let serviceIndex = 0;
  let draft;
  let records = [];
  let recordIndex = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved)) records = saved;
  } catch { /* Start with an empty list when storage is unavailable. */ }

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  const service = () => catalog[species][serviceIndex];
  const money = amount => new Intl.NumberFormat(window.siteLocale.language, {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(amount);
  const price = ([, , rate, unit]) => money(rate) + ' / ' + t(unit);

  function show(element) {
    element.focus({ preventScroll: true });
  }

  function display(view, focusHeading = true) {
    document.body.dataset.view = view;
    booking.hidden = view !== 'booking';
    bookings.hidden = view !== 'bookings';
    if (focusHeading) {
      const headings = { home: 'headline', services: 'services-title', booking: 'booking-title', bookings: 'bookings-title' };
      show(get(headings[view]));
    }
  }

  function readView(focusHeading = true) {
    const view = location.hash.slice(1);
    if (view === 'booking' && pet.options.length) display(view, focusHeading);
    else if (view === 'services' || view === 'booking') display('services', focusHeading);
    else display(view === 'bookings' ? view : 'home', focusHeading);
  }

  function navigate(view) {
    const hash = '#' + view;
    if (location.hash !== hash) history.pushState(null, '', hash);
    display(view);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    navigate(link.hash.slice(1));
  });
  window.addEventListener('popstate', () => readView());
  window.addEventListener('hashchange', () => readView());

  function dayLabel(value) {
    return new Intl.DateTimeFormat(window.siteLocale.language, {
      dateStyle: 'medium', timeZone: 'UTC',
    }).format(new Date(value));
  }

  function dateRange({ start: first, end: last, time: slot }) {
    return dayLabel(first) + (last ? ' – ' + dayLabel(last) : ' · ' + slot);
  }

  function localToday() {
    const now = new Date();
    return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
      .map(value => String(value).padStart(2, '0')).join('-');
  }

  function renderServices() {
    for (const button of document.querySelectorAll('[data-species]')) {
      button.setAttribute('aria-pressed', String(button.dataset.species === species));
    }
    list.replaceChildren(...catalog[species].map((entry, index) => {
      const [name, description] = entry;
      const card = node('article', undefined, 'service');
      const button = node('button', t('Choose service'));
      button.type = 'button';
      button.setAttribute('aria-label', t('Choose service') + ': ' + t(name));
      button.addEventListener('click', () => {
        serviceIndex = index;
        draft = undefined;
        form.reset();
        pet.replaceChildren(...pets[species].map(name => node('option', name)));
        start.min = localToday();
        end.min = start.min;
        const overnight = entry[3] === 'per night';
        end.required = overnight;
        end.disabled = get('end-label').hidden = !overnight;
        time.disabled = get('time-label').hidden = overnight;
        form.hidden = false;
        review.hidden = true;
        get('booking-error').textContent = '';
        renderSummary();
        navigate('booking');
      });
      card.append(node('h3', t(name)), node('p', t(description)),
        node('strong', price(entry)), button);
      return card;
    }));
  }

  function renderSummary() {
    get('service-summary').textContent = t(service()[0]) + ' · ' + price(service());
  }

  function renderReview() {
    const fields = [['Pet', draft.pet], ['Service', t(draft.name)],
      ['Visit', dateRange(draft)], ['Total', money(draft.total)]];
    get('review-details').replaceChildren(...fields.flatMap(([label, value]) =>
      [node('dt', t(label)), node('dd', value)]));
  }

  function save(message) {
    try {
      localStorage.setItem(key, JSON.stringify(records));
      get('booking-status').textContent = t(message);
    } catch {
      get('booking-status').textContent = t('Saved for this session only.');
    }
    renderHistory();
  }

  function renderHistory() {
    const historyList = get('history');
    const record = records[recordIndex];
    get('booking-pages').hidden = records.length <= 1;
    get('previous-booking').disabled = recordIndex === 0;
    get('next-booking').disabled = recordIndex >= records.length - 1;
    get('booking-page').textContent = (recordIndex + 1) + ' / ' + records.length;
    if (!record) {
      historyList.replaceChildren(node('p', t('No bookings yet.')));
      return;
    }
    const row = node('article', undefined, 'record');
    const details = node('div');
    details.append(node('strong', record.pet + ' · ' + t(record.name)), node('p', dateRange(record)),
      node('p', record.reference + ' · ' + money(record.total) + ' · ' + t(record.cancelled ? 'Cancelled' : 'Confirmed')));
    row.append(details);
    if (!record.cancelled) {
      const button = node('button', t('Cancel booking'));
      button.type = 'button';
      button.addEventListener('click', () => {
        record.cancelled = true;
        save('Sample booking cancelled.');
        show(get('bookings-title'));
      });
      row.append(button);
    }
    historyList.replaceChildren(row);
  }

  get('previous-booking').addEventListener('click', () => {
    recordIndex -= 1;
    renderHistory();
  });
  get('next-booking').addEventListener('click', () => {
    recordIndex += 1;
    renderHistory();
  });

  for (const button of document.querySelectorAll('[data-species]')) {
    button.addEventListener('click', () => {
      if (species === button.dataset.species) return;
      species = button.dataset.species;
      draft = undefined;
      pet.replaceChildren();
      renderServices();
    });
  }

  start.addEventListener('change', () => {
    end.min = start.value || start.min;
    get('booking-error').textContent = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const [name, , rate, unit] = service();
    const overnight = unit === 'per night';
    const nights = overnight ? (Date.parse(end.value) - Date.parse(start.value)) / 86400000 : 1;
    if (start.value < localToday() || !Number.isInteger(nights) || nights < 1) {
      get('booking-error').textContent = t(start.value < localToday()
        ? 'Choose today or a future start date.' : 'Choose a checkout date after the start date.');
      return;
    }
    get('booking-error').textContent = '';
    draft = { name, pet: pet.value, start: start.value, end: overnight ? end.value : '',
      time: time.value, total: rate * nights };
    renderReview();
    form.hidden = true;
    review.hidden = false;
    show(confirm);
  });

  get('edit').addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    show(pet);
  });

  confirm.addEventListener('click', () => {
    if (!draft) return;
    const reference = 'PD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    records.unshift({ ...draft, reference, cancelled: false });
    draft = undefined;
    recordIndex = 0;
    save('Sample booking confirmed.');
    history.replaceState(null, '', '#bookings');
    display('bookings');
  });

  document.body.toggleAttribute('data-embedded', window.self !== window.top);
  renderServices();
  renderHistory();
  readView(false);
  document.addEventListener('portfolio-language-change', () => {
    renderServices();
    if (!booking.hidden) renderSummary();
    if (!booking.hidden && !review.hidden) renderReview();
    renderHistory();
  });
})();
