const GEAR = {
  sq: [
    ['fa-solid fa-x-ray', 'Skaner CBCT 3D'],
    ['fa-solid fa-bolt', 'Laser Er:YAG'],
    ['fa-solid fa-gears', 'Sistem CAD/CAM'],
    ['fa-solid fa-tooth', 'Skanerë të përshtypjes digjitale'],
    ['fa-solid fa-microscope', 'Mikroskop kirurgjik'],
    ['fa-solid fa-sun', 'Sistem zbardhimi LED'],
    ['fa-solid fa-chair', 'Karrige dentare të gjeneratës së fundit']
  ],
  en: [
    ['fa-solid fa-x-ray', 'CBCT 3D scanner'],
    ['fa-solid fa-bolt', 'Er:YAG laser'],
    ['fa-solid fa-gears', 'CAD/CAM system'],
    ['fa-solid fa-tooth', 'Digital impression scanners'],
    ['fa-solid fa-microscope', 'Surgical microscope'],
    ['fa-solid fa-sun', 'LED whitening system'],
    ['fa-solid fa-chair', 'Latest-generation dental chairs']
  ],
  de: [
    ['fa-solid fa-x-ray', 'CBCT-3D-Scanner'],
    ['fa-solid fa-bolt', 'Er:YAG-Laser'],
    ['fa-solid fa-gears', 'CAD/CAM-System'],
    ['fa-solid fa-tooth', 'Digitale Abformscanner'],
    ['fa-solid fa-microscope', 'Operationsmikroskop'],
    ['fa-solid fa-sun', 'LED-Bleaching-System'],
    ['fa-solid fa-chair', 'Zahnarztstühle der neuesten Generation']
  ]
};

function doctorBy(data, slug) {
  return [...data.dent.doctors, ...data.aesthetic.doctors].find((item) => item.slug === slug);
}

function paint(data) {
  const dent = data.dent.gallery.find((item) => item.placement === 'hero' && item.mediaType === 'image') || data.dent.gallery.find((item) => item.mediaType === 'image');
  const aes = data.aesthetic.gallery.find((item) => item.placement === 'hero' && item.mediaType === 'image') || data.aesthetic.gallery.find((item) => item.mediaType === 'image');
  const dentImg = document.querySelector('#doorDent');
  const aesImg = document.querySelector('#doorAes');
  if (dent) { dentImg.src = dent.url; dentImg.alt = tx(dent.caption) || 'Brilliant Dent'; }
  if (aes) { aesImg.src = aes.url; aesImg.alt = tx(aes.caption) || 'Brilliant Aesthetic'; }
  document.querySelector('#story').textContent = t('story');
  document.querySelector('#learn').textContent = t('learn');
  document.querySelector('#year').textContent = String(new Date().getFullYear());

  const stats = document.querySelector('#stats');
  stats.replaceChildren();
  [[15, '+', 'statYears'], [14, '+', 'statRooms'], [50000, '+', 'statPatients'], [99, '%', 'statSat']].forEach(([count, suffix, key]) => {
    const card = el('article', 'stat reveal');
    const number = el('b', 'count', '0');
    number.dataset.count = String(count);
    number.dataset.suffix = suffix;
    card.append(number, el('span', '', t(key)));
    stats.appendChild(card);
    window.bdaObserve?.(card);
    window.bdaObserve?.(number);
  });

  const equip = document.querySelector('#equip');
  equip.replaceChildren();
  (GEAR[getLang()] || GEAR.sq).forEach(([icon, label]) => {
    const card = el('article', 'reveal');
    const mark = el('i', icon);
    mark.setAttribute('aria-hidden', 'true');
    card.append(mark, el('h3', '', label));
    equip.appendChild(card);
    window.bdaObserve?.(card);
  });

  const bios = document.querySelector('#bios');
  bios.replaceChildren();
  ['burim-buzhala', 'vjollca-buzhala'].forEach((slug) => {
    const doctor = doctorBy(data, slug);
    if (!doctor) return;
    const card = el('article', 'bio-card reveal');
    const photo = el('div', 'bio-photo');
    if (doctor.photo) {
      const image = el('img');
      image.src = doctor.photo;
      image.alt = doctor.fullName;
      image.loading = 'lazy';
      photo.appendChild(image);
    } else photo.appendChild(el('div', 'monogram', initials(doctor.fullName)));
    const copy = el('div', 'bio-copy');
    copy.append(
      el('p', 'kicker', doctor.theme === 'aesthetic' ? 'Brilliant Aesthetic' : 'Brilliant Dent'),
      el('h3', '', doctor.fullName),
      el('p', 'role', tx(doctor.title)),
      el('p', '', tx(doctor.bio)),
      el('p', '', tx(doctor.certifications))
    );
    card.append(photo, copy);
    bios.appendChild(card);
    window.bdaObserve?.(card);
  });
  applyI18n();
}

bindLang(() => { if (window.__bda) paint(window.__bda); });
loadContent().then((data) => { window.__bda = data; paint(data); });
