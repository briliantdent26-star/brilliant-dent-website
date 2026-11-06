const clinicKey = location.pathname.startsWith('/estetike') ? 'aesthetic' : 'dent';
document.body.dataset.theme = clinicKey === 'aesthetic' ? 'aesthetic' : 'dent';
document.body.dataset.clinic = clinicKey;

let content;

let heroTimer;
let roomTimer;
let aboutTimer;

function carousel(images) {
  clearInterval(heroTimer);
  const media = document.querySelector('.hero-media');
  const controls = document.querySelector('.hero-controls');
  const dots = document.querySelector('.hero-dots');
  media.replaceChildren();
  dots.replaceChildren();
  if (!images.length) {
    controls.hidden = true;
    return;
  }
  let index = 0;
  const slides = [];
  images.forEach((item, itemIndex) => {
    const slide = el('div', `slide${itemIndex === 0 ? ' is-on' : ''}`);
    const image = el('img');
    image.src = item.url === '/media/dent/hero-1.webp' ? `${item.url}?v=3` : item.url;
    image.alt = tx(item.caption) || t(clinicKey === 'aesthetic' ? 'altAesHero' : 'altDentHero');
    image.loading = itemIndex === 0 ? 'eager' : 'lazy';
    if (itemIndex === 0) image.fetchPriority = 'high';
    image.decoding = 'async';
    image.style.objectPosition = clinicKey === 'dent' && itemIndex === 0 ? 'center 18%' : 'center center';
    if (item.fit === 'contain') slide.classList.add('is-poster');
    slide.appendChild(image);
    media.appendChild(slide);
    slides.push(slide);
    const dot = el('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', String(itemIndex + 1));
    if (itemIndex === 0) dot.classList.add('is-on');
    dot.addEventListener('click', () => show(itemIndex));
    dots.appendChild(dot);
  });
  controls.hidden = images.length < 2;
  function show(next) {
    slides[index].classList.remove('is-on');
    dots.children[index].classList.remove('is-on');
    index = (next + slides.length) % slides.length;
    slides[index].classList.add('is-on');
    const dot = dots.children[index];
    dot.classList.remove('is-on');
    void dot.offsetWidth;
    dot.classList.add('is-on');
    arm();
  }
  function arm() {
    clearInterval(heroTimer);
    if (images.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroTimer = setInterval(() => show(index + 1), 6400);
  }
  controls.querySelector('.prev').onclick = () => show(index - 1);
  controls.querySelector('.next').onclick = () => show(index + 1);
  arm();
}

function roomShow() {
  clearInterval(roomTimer);
  const section = document.querySelector('#roomShow');
  const frame = document.querySelector('#roomFrame');
  if (!section || !frame) return;
  if (clinicKey !== 'dent') {
    section.hidden = true;
    frame.replaceChildren();
    return;
  }
  const lang = getLang();
  const photos = [
    ['/media/dent/room-1.webp', { sq: 'Kabineti i estetikës', en: 'Aesthetic treatment room', de: 'Ästhetik-Behandlungsraum', fr: 'Salle de soin esthétique' }],
    ['/media/dent/room-2.webp', { sq: 'Recepsioni', en: 'Reception', de: 'Empfang', fr: 'Réception' }],
    ['/media/dent/room-3.webp', { sq: 'Hapësira e pritjes', en: 'Waiting area', de: 'Wartebereich', fr: "Salle d'attente" }],
    ['/media/dent/room-4.webp', { sq: 'Hapësira e pritjes', en: 'Waiting area', de: 'Wartebereich', fr: "Salle d'attente" }],
    ['/media/dent/room-5.webp', { sq: 'Hyrja e kabinetit', en: 'Treatment room entrance', de: 'Eingang zum Behandlungsraum', fr: 'Entrée du cabinet' }]
  ];
  section.hidden = false;
  frame.replaceChildren();
  let index = 0;
  const slides = photos.map(([url, caption], itemIndex) => {
    const slide = el('div', `slide${itemIndex === 0 ? ' is-on' : ''}`);
    const image = el('img');
    image.src = url;
    image.alt = caption[lang] || caption.sq;
    image.decoding = 'async';
    image.loading = itemIndex === 0 ? 'eager' : 'lazy';
    slide.appendChild(image);
    frame.appendChild(slide);
    return slide;
  });
  const nav = el('div', 'room-nav');
  const prev = el('button', 'hero-nav');
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Fotoja e mëparshme');
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  const next = el('button', 'hero-nav');
  next.type = 'button';
  next.setAttribute('aria-label', 'Fotoja tjetër');
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  const dots = el('div', 'hero-dots');
  photos.forEach((_, itemIndex) => {
    const dot = el('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', String(itemIndex + 1));
    if (itemIndex === 0) dot.classList.add('is-on');
    dot.addEventListener('click', () => show(itemIndex));
    dots.appendChild(dot);
  });
  nav.append(prev, dots, next);
  frame.appendChild(nav);
  function show(nextIndex) {
    slides[index].classList.remove('is-on');
    dots.children[index].classList.remove('is-on');
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add('is-on');
    dots.children[index].classList.add('is-on');
    arm();
  }
  function arm() {
    clearInterval(roomTimer);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    roomTimer = setInterval(() => show(index + 1), 4200);
  }
  prev.onclick = () => show(index - 1);
  next.onclick = () => show(index + 1);
  arm();
}

function aboutPhotos(page) {
  clearInterval(aboutTimer);
  const frame = document.querySelector('#aboutPhotos');
  if (!frame) return;
  const lang = getLang();
  const clean = clinicKey === 'dent'
    ? [
        ['/media/dent/room-2.webp', { sq: 'Recepsioni', en: 'Reception', de: 'Empfang', fr: 'Réception' }],
        ['/media/dent/room-3.webp', { sq: 'Hapësira e pritjes', en: 'Waiting area', de: 'Wartebereich', fr: "Salle d'attente" }],
        ['/media/dent/room-4.webp', { sq: 'Hapësira e pritjes', en: 'Waiting area', de: 'Wartebereich', fr: "Salle d'attente" }],
        ['/media/dent/room-5.webp', { sq: 'Hyrja e kabinetit', en: 'Treatment room entrance', de: 'Eingang zum Behandlungsraum', fr: 'Entrée du cabinet' }],
        ['/media/dent/room-1.webp', { sq: 'Kabineti i estetikës', en: 'Aesthetic treatment room', de: 'Ästhetik-Behandlungsraum', fr: 'Salle de soin esthétique' }]
      ]
    : page.gallery.filter((item) => item.mediaType === 'image' && item.placement === 'hero').slice(0, 2).map((item) => [item.url, item.caption]);
  frame.replaceChildren();
  if (!clean.length) return;
  let index = 0;
  const slides = clean.map(([url, caption], itemIndex) => {
    const slide = el('div', `slide${itemIndex === 0 ? ' is-on' : ''}`);
    const image = el('img');
    image.src = url;
    image.alt = (caption && (caption[lang] || caption.sq)) || t('altAbout');
    image.decoding = 'async';
    slide.appendChild(image);
    frame.appendChild(slide);
    return slide;
  });
  if (slides.length < 2) return;
  function show(nextIndex) {
    slides[index].classList.remove('is-on');
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add('is-on');
    arm();
  }
  function arm() {
    clearInterval(aboutTimer);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    aboutTimer = setInterval(() => show(index + 1), 3800);
  }
  arm();
}

function render() {
  const page = content[clinicKey];
  const lang = getLang();
  document.title = t(clinicKey === 'dent' ? 'metaDentTitle' : 'metaAesTitle');
  const primary = document.querySelector('.hero-actions .btn-gold');
  primary.dataset.i18n = clinicKey === 'aesthetic' ? 'exploreAes' : 'exploreDent';
  document.querySelector('[name="preferredDate"]').min = new Date().toISOString().slice(0, 10);
  document.querySelector('[data-bind="kicker"]').textContent = tx(page.kicker);
  document.querySelector('[data-bind="hero"]').textContent = tx(page.heroTitle);
  document.querySelector('[data-bind="sub"]').textContent = tx(page.heroSubtitle);
  document.querySelector('[data-bind="aboutTitle"]').textContent = tx(page.aboutTitle);
  document.querySelector('[data-bind="aboutBody"]').textContent = tx(page.aboutBody);
  const heroes = page.gallery.filter((item) => item.placement === 'hero' && item.mediaType === 'image');
  if (clinicKey === 'aesthetic') {
    heroes.unshift({
      url: '/media/aes/hero-prx.webp',
      fit: 'contain',
      caption: {
        sq: 'PRX-T33, Brilliant Aesthetic Clinic',
        en: 'PRX-T33, Brilliant Aesthetic Clinic',
        de: 'PRX-T33, Brilliant Aesthetic Clinic',
        fr: 'PRX-T33, Brilliant Aesthetic Clinic'
      }
    });
  }
  carousel(heroes);

  const services = document.querySelector('#services');
  services.replaceChildren();
  page.services.forEach((service, index) => {
    const card = el('article', 'service-card reveal');
    if (String(service.icon || '').includes('fa-')) {
      const icon = document.createElement('i');
      icon.className = service.icon;
      icon.setAttribute('aria-hidden', 'true');
      card.appendChild(icon);
    } else card.appendChild(el('div', 'num', String(index + 1).padStart(2, '0')));
    card.append(el('h3', '', tx(service.title)), el('p', '', tx(service.description)));
    services.appendChild(card);
  });
  roomShow();

  const doctors = document.querySelector('#doctors');
  doctors.replaceChildren();
  page.doctors.forEach((doctor) => {
    const card = el('article', 'doctor-card reveal');
    const link = el('a', 'stretch');
    link.href = `/doktori/${doctor.slug}`;
    const photo = el('div', 'doctor-photo');
    if (doctor.photo) {
      const image = el('img');
      image.src = /burim\.webp/.test(doctor.photo) ? `${doctor.photo}?v=2` : doctor.photo;
      image.alt = doctor.fullName;
      image.loading = 'lazy';
      photo.appendChild(image);
    } else photo.appendChild(el('div', 'monogram', initials(doctor.fullName)));
    const body = el('div', 'doctor-body');
    body.append(el('h3', '', doctor.fullName), el('p', '', tx(doctor.title)));
    link.append(photo, body);
    const icons = socialLinks(doctor);
    icons.style.padding = '0 1.1rem 1rem';
    card.append(link, icons);
    doctors.appendChild(card);
  });

  const pairs = document.querySelector('#pairs');
  pairs.replaceChildren();
  page.beforeAfter.forEach((pair) => {
    const box = el('div', 'ba reveal');
    const after = el('img');
    after.src = pair.afterUrl;
    after.alt = tx(pair.caption) || t('after');
    after.loading = 'lazy';
    const before = el('img', 'before');
    before.src = pair.beforeUrl;
    before.alt = t('before');
    before.loading = 'lazy';
    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.value = '50';
    range.setAttribute('aria-label', t('work'));
    const handle = el('div', 'handle');
    box.append(after, before, range, handle, el('p', '', tx(pair.caption)));
    pairs.appendChild(box);
    compare(box);
  });

  const gallery = document.querySelector('#gallery');
  gallery.replaceChildren();
  if (page.heroVideoUrl) gallery.appendChild(mountEmbed(page.heroVideoUrl));
  const slides = [];
  const masonry = el('div', 'gallery-masonry');
  page.gallery.filter((item) => item.placement !== 'hero' || item.mediaType !== 'image').forEach((item) => {
    if (item.mediaType === 'tiktok' || item.mediaType === 'instagram') {
      gallery.appendChild(mountEmbed(item.url));
      return;
    }
    const caption = tx(item.caption);
    const index = slides.length;
    slides.push({ url: item.url, caption, mediaType: item.mediaType === 'video' ? 'video' : 'image' });
    const button = el('button', 'gallery-card');
    button.type = 'button';
    if (item.mediaType === 'video') {
      const video = document.createElement('video');
      video.src = item.url;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      button.appendChild(video);
    } else {
      const image = el('img');
      image.src = item.url;
      image.alt = caption || t('altGallery');
      image.loading = 'lazy';
      image.decoding = 'async';
      button.appendChild(image);
    }
    if (caption) button.appendChild(el('span', 'cap', caption));
    button.addEventListener('click', () => openLightbox(slides, index));
    masonry.appendChild(button);
  });
  if (masonry.children.length) gallery.appendChild(masonry);

  aboutPhotos(page);
  document.querySelector('#puna').hidden = page.beforeAfter.length === 0;

  const pick = document.querySelector('#clinicPick');
  if (!pick.dataset.ready) {
    pick.value = clinicKey;
    pick.dataset.ready = '1';
  }
  fillBooking();
  renderTestimonials();

  const contact = content.contact;
  document.querySelector('#address').textContent = tx(contact.address);
  document.querySelector('#email').textContent = contact.email;
  document.querySelector('#email').href = `mailto:${contact.email}`;
  const phones = document.querySelector('#phones');
  phones.replaceChildren();
  [contact.phone, contact.phoneSecondary].filter(Boolean).forEach((phone) => {
    const link = el('a', '', phone);
    link.href = `tel:${phone.replace(/\s/g, '')}`;
    phones.append(link, document.createTextNode(' · '));
  });
  const hours = document.querySelector('#hours');
  hours.replaceChildren();
  (contact.hours || []).forEach((row) => {
    const li = el('li');
    li.append(el('span', '', tx(row.days)), el('span', '', tx(row.time)));
    hours.appendChild(li);
  });
  const mapQuery = 'Rruga Riza Goga, 94, Ferizaj, Kosovo';
  const map = document.querySelector('#map');
  map.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`;
  const directions = document.querySelector('#directions');
  directions.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;

  const social = document.querySelector('#footerSocial');
  social.replaceChildren();
  const networkIcon = { instagram: 'fa-brands fa-instagram', facebook: 'fa-brands fa-facebook-f', tiktok: 'fa-brands fa-tiktok' };
  page.social.forEach((item) => {
    const network = networkIcon[item.network] ? item.network : 'instagram';
    const label = tx(item.label) || (network === 'facebook' ? 'Facebook' : network === 'tiktok' ? 'TikTok' : 'Instagram');
    const link = el('a', `social-btn ${network}`);
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', label);
    const icon = el('i', networkIcon[network]);
    icon.setAttribute('aria-hidden', 'true');
    const name = el('span');
    name.textContent = label;
    link.append(icon, name);
    social.appendChild(link);
  });
  document.querySelector('#year').textContent = String(new Date().getFullYear());
  document.querySelector('#reviewClinic').textContent = `${t('yourClinic')}: ${clinicKey === 'aesthetic' ? 'Brilliant Aesthetic' : 'Brilliant Dent'}`;
  applyI18n();
  document.querySelectorAll('.reveal').forEach((node) => window.bdaObserve?.(node));
}

function timeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 19; hour += 1) {
    const hh = String(hour).padStart(2, '0');
    slots.push(`${hh}:00`, `${hh}:30`);
  }
  return slots;
}
function fillBooking() {
  const clinic = document.querySelector('#clinicPick').value === 'aesthetic' ? 'aesthetic' : 'dent';
  const page = content[clinic];
  const doctor = document.querySelector('#doctor');
  const previousDoctor = doctor.value;
  doctor.replaceChildren(new Option(t('choose'), ''));
  (page.doctors || []).forEach((item) => doctor.append(new Option(item.fullName, item.id)));
  if ([...doctor.options].some((option) => option.value === previousDoctor)) doctor.value = previousDoctor;
  const select = document.querySelector('#service');
  const previousService = select.value;
  select.replaceChildren(new Option(t('choose'), ''));
  page.services.forEach((service) => select.append(new Option(tx(service.title), tx(service.title))));
  if ([...select.options].some((option) => option.value === previousService)) select.value = previousService;
  const slot = document.querySelector('#slot');
  const previousSlot = slot.value;
  const date = document.querySelector('[name="preferredDate"]').value;
  const sunday = Boolean(date) && new Date(`${date}T12:00:00`).getDay() === 0;
  slot.replaceChildren(new Option(t('choose'), ''));
  timeSlots().forEach((value) => slot.append(new Option(value, value)));
  slot.disabled = sunday;
  slot.required = !sunday;
  if (!sunday && [...slot.options].some((option) => option.value === previousSlot)) slot.value = previousSlot;
  document.querySelector('#slotHint').textContent = sunday ? t('closedSunday') : '';
}
let slide = 0;
let slideTimer = 0;
function moveSlides() {
  const track = document.querySelector('#tTrack');
  track.style.transform = `translateX(-${slide * 100}%)`;
}
function renderTestimonials() {
  const items = content[clinicKey]?.testimonials || [];
  const summary = document.querySelector('#ratingSummary');
  if (!items.length) summary.textContent = t('noReviews');
  else {
    const avg = items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / items.length;
    const full = Math.round(avg);
    summary.textContent = `${'★'.repeat(full)}${'☆'.repeat(5 - full)} ${avg.toFixed(1)}/5 · ${items.length} ${t('reviewsCount')}`;
  }
  const carousel = document.querySelector('#testimonials');
  carousel.hidden = items.length === 0;
  const track = document.querySelector('#tTrack');
  track.replaceChildren();
  items.forEach((item) => {
    const slideBox = el('div', 't-slide');
    const card = el('article', 't-card');
    card.append(
      el('div', 'stars', `${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}`),
      el('p', 'quote', tx(item.body)),
      el('p', 'who', item.anonymous || !item.patientName ? t('anonymous') : item.patientName),
      el('p', 'when', item.reviewDate || '')
    );
    slideBox.appendChild(card);
    track.appendChild(slideBox);
  });
  document.querySelector('.t-prev').hidden = items.length < 2;
  document.querySelector('.t-next').hidden = items.length < 2;
  slide = 0;
  moveSlides();
  window.clearInterval(slideTimer);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (items.length > 1 && !reduce) {
    slideTimer = window.setInterval(() => {
      slide = (slide + 1) % items.length;
      moveSlides();
    }, 6000);
  }
}
const starPick = document.querySelector('#starPick');
let reviewRating = 0;
for (let score = 1; score <= 5; score += 1) {
  const star = el('button', '', '★');
  star.type = 'button';
  star.setAttribute('aria-label', String(score));
  star.addEventListener('click', () => {
    reviewRating = score;
    [...starPick.children].forEach((node, index) => node.classList.toggle('is-on', index < score));
  });
  starPick.appendChild(star);
}
document.querySelector('#reviewForm [name="anonymous"]').addEventListener('change', (event) => {
  const name = document.querySelector('#reviewForm [name="patientName"]');
  name.required = !event.target.checked;
  name.disabled = event.target.checked;
});
document.querySelector('#reviewForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const note = document.querySelector('#reviewNote');
  const data = Object.fromEntries(new FormData(form));
  note.textContent = '';
  if (!reviewRating) {
    note.textContent = t('choose');
    return;
  }
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinic: clinicKey,
        rating: reviewRating,
        patientName: data.patientName || '',
        anonymous: data.anonymous === 'on',
        text: data.text || '',
        website: data.website || ''
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    note.textContent = t('reviewPending');
    form.reset();
    reviewRating = 0;
    [...starPick.children].forEach((node) => node.classList.remove('is-on'));
    document.querySelector('#reviewForm [name="patientName"]').disabled = false;
  } catch (err) {
    note.textContent = err.message;
  }
});
document.querySelector('#clinicPick').addEventListener('change', () => { if (content) fillBooking(); });
document.querySelector('[name="preferredDate"]').addEventListener('change', () => { if (content) fillBooking(); });
document.querySelector('.t-next').addEventListener('click', () => {
  const count = document.querySelectorAll('.t-slide').length;
  if (count < 2) return;
  slide = (slide + 1) % count;
  moveSlides();
});
document.querySelector('.t-prev').addEventListener('click', () => {
  const count = document.querySelectorAll('.t-slide').length;
  if (count < 2) return;
  slide = (slide - 1 + count) % count;
  moveSlides();
});

document.querySelector('#form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const note = document.querySelector('.note');
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  note.textContent = '';
  if (data.preferredDate && new Date(`${data.preferredDate}T12:00:00`).getDay() === 0) {
    note.textContent = t('closedSunday');
    return;
  }
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error);
    note.textContent = payload.emailSent ? t('sent') : t('savedNoMail');
    form.reset();
    document.querySelector('#clinicPick').value = clinicKey;
    if (content) fillBooking();
  } catch (err) {
    note.textContent = err.message;
  }
});

bindLang(() => render());
window.bdaI18n.then(() => loadContent().then((data) => { content = data; render(); }).catch(() => {
  document.querySelector('[data-bind="hero"]').textContent = 'Brilliant Dent';
}));
