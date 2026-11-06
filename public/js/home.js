const GEAR_ICONS = [
  'fa-solid fa-x-ray',
  'fa-solid fa-bolt',
  'fa-solid fa-gears',
  'fa-solid fa-tooth',
  'fa-solid fa-microscope',
  'fa-solid fa-sun',
  'fa-solid fa-chair'
];

function doctorBy(data, slug) {
  return [...data.dent.doctors, ...data.aesthetic.doctors].find((item) => item.slug === slug);
}

function paint(data) {
  const dent = data.dent.gallery.find((item) => item.placement === 'hero' && item.mediaType === 'image') || data.dent.gallery.find((item) => item.mediaType === 'image');
  const aes = data.aesthetic.gallery.find((item) => item.placement === 'hero' && item.mediaType === 'image') || data.aesthetic.gallery.find((item) => item.mediaType === 'image');
  const dentImg = document.querySelector('#doorDent');
  const aesImg = document.querySelector('#doorAes');
  if (dent) { dentImg.src = dent.url === '/media/dent/hero-1.webp' ? `${dent.url}?v=3` : dent.url; dentImg.alt = tx(dent.caption) || t('altDoorDent'); }
  if (aes) { aesImg.src = aes.url; aesImg.alt = tx(aes.caption) || t('altDoorAes'); }
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
  gearLabels().forEach((label, index) => {
    const icon = GEAR_ICONS[index] || 'fa-solid fa-tooth';
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
      image.src = /burim\.webp/.test(doctor.photo) ? `${doctor.photo}?v=2` : doctor.photo;
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
window.bdaI18n.then(() => loadContent().then((data) => { window.__bda = data; paint(data); }));
