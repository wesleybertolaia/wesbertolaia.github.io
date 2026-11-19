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
  const bookingActions = ['Book daycare', 'Book a stay', 'Book grooming'];
  const overnightStay = () => service()[3] === 'per night';

  function countNights() {
    return (Date.parse(end.value) - Date.parse(start.value)) / 86400000;
  }

  function stayRate(nights) {
    return t(nights === 1 ? '{count} night at {price}' : '{count} nights at {price}')
      .replace('{count}', nights).replace('{price}', money(service()[2]));
  }

  function renderEstimate() {
    const overnight = overnightStay();
    get('stay-estimate').hidden = !overnight;
    if (!overnight) return;
    const nights = countNights();
    const valid = start.value >= localToday() && Number.isInteger(nights) && nights > 0;
    get('stay-rate').textContent = valid ? stayRate(nights) : price(service());
    get('stay-total').textContent = valid ? money(nights * service()[2]) : t('Choose both dates');
  }

  function show(element) {
    element.focus({ preventScroll: true });
  }

  const dialog = get('booking-dialog');
  const services = get('services');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 664px), (max-height: 399px)');
  let currentPanel = 'home';

  function placeServices() {
    if (compact.matches) get('service-dialog-slot').append(services);
    else get('service-placement').after(services);
    services.hidden = compact.matches && currentPanel !== 'services';
  }

  function animatePanel(element, origin) {
    if (reducedMotion.matches) return;
    const destination = element.getBoundingClientRect();
    const start = origin ? {
      transformOrigin: '0 0', opacity: .4,
      transform: `translate(${origin.left - destination.left}px, ${origin.top - destination.top}px) scale(${Math.min(.82, origin.width / destination.width)}, ${Math.min(.85, origin.height / destination.height)})`,
    } : { transform: 'translateY(10px)', opacity: .45 };
    element.animate([start, { transform: 'none', opacity: 1 }], {
      duration: origin ? 500 : 300, easing: 'cubic-bezier(.2,.75,.23,1)',
    });
  }

  function navigate(view, origin) {
    currentPanel = view;
    const panelHeading = { home: 'headline', services: 'services-title', booking: 'booking-title', bookings: 'bookings-title' }[view];
    placeServices();
    booking.hidden = view !== 'booking';
    bookings.hidden = view !== 'bookings';
    const showDialog = view === 'booking' || view === 'bookings' || (view === 'services' && compact.matches);
    if (showDialog) {
      dialog.setAttribute('aria-labelledby', panelHeading);
      if (!dialog.open) {
        dialog.showModal();
        animatePanel(dialog, origin);
      } else {
        animatePanel(get(view));
      }
    } else if (dialog.open) {
      dialog.close();
    }
    show(get(panelHeading));
  }

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    currentPanel = 'home';
    placeServices();
  });
  compact.addEventListener('change', () => {
    if (dialog.open && currentPanel === 'services') navigate('services');
    else placeServices();
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const view = link.hash.slice(1);
    if (!['home', 'services', 'bookings'].includes(view)) return;
    event.preventDefault();
    navigate(view);
  });

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
      const [name, description, rate, unit] = entry;
      const card = node('article', undefined, 'service');
      const heading = node('header', undefined, 'service-heading');
      const cost = node('p', undefined, 'service-price');
      cost.append(node('strong', money(rate)), node('span', t(unit)));
      heading.append(node('h3', t(name)), cost);
      if (unit === 'per night') card.classList.add('service-stay');
      const button = node('button', t(bookingActions[index]), 'service-action');
      button.append(node('span', '↗'));
      button.lastElementChild.setAttribute('aria-hidden', 'true');
      button.type = 'button';
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
        renderEstimate();
        navigate('booking', card.getBoundingClientRect());
      });
      card.append(heading, node('p', t(description), 'service-description'), button);
      return card;
    }));
  }

  function renderSummary() {
    const overnight = overnightStay();
    get('arrival-label').textContent = t(overnight ? 'Check-in date' : 'Start date');
    get('booking-title').textContent = t(overnight ? 'Book an overnight stay' : 'Plan a visit');
    get('service-summary').textContent = overnight ? t(service()[1]) : t(service()[0]) + ' · ' + price(service());
  }

  function renderReview() {
    const fields = [['Pet', draft.pet], ['Service', t(draft.name)],
      ['Visit', dateRange(draft)]];
    if (draft.end) fields.push(['Nightly rate', stayRate(countNights())]);
    fields.push(['Total', money(draft.total)]);
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
      document.querySelector('.portrait').dataset.pet = species;
      draft = undefined;
      pet.replaceChildren();
      renderServices();
      if (!reducedMotion.matches) {
        [...list.children].forEach((card, index) => card.animate(
          [{ transform: 'translateY(9px) scale(.98)', opacity: .35 }, { transform: 'none', opacity: 1 }],
          { duration: 380, delay: index * 65, easing: 'cubic-bezier(.2,.75,.23,1)', fill: 'backwards' },
        ));
      }
    });
  }

  start.addEventListener('change', () => {
    end.min = start.value || start.min;
    get('booking-error').textContent = '';
    renderEstimate();
  });
  end.addEventListener('change', () => {
    get('booking-error').textContent = '';
    renderEstimate();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const [name, , rate, unit] = service();
    const overnight = unit === 'per night';
    const nights = overnight ? countNights() : 1;
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
    animatePanel(review);
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
    navigate('bookings');
  });

  document.body.toggleAttribute('data-embedded', window.self !== window.top);
  renderServices();
  renderHistory();
  placeServices();
  if (location.hash === '#bookings') navigate('bookings');
  if (location.hash === '#services') navigate('services');
  document.addEventListener('portfolio-language-change', () => {
    renderServices();
    if (!booking.hidden) {
      renderSummary();
      renderEstimate();
    }
    if (!booking.hidden && !review.hidden) renderReview();
    renderHistory();
  });
})();
