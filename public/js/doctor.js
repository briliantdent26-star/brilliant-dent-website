const slug = location.pathname.split('/').filter(Boolean).pop();
let payload;

function section(title, text) {
  if (!text) return null;
  const block = el('section', 'profile-block');
  block.append(el('p', 'kicker', title), el('div', 'prose', text));
  block.querySelector('.prose').style.whiteSpace = 'pre-wrap';
  return block;
}

function render() {
  const doctor = payload.doctor;
  document.body.dataset.theme = doctor.theme === 'aesthetic' ? 'aesthetic' : 'dent';
  document.title = `${doctor.fullName} · Brilliant Dent`;
  const photo = document.querySelector('#photo');
  photo.replaceChildren();
  if (doctor.photo) {
    const image = el('img');
    image.src = /burim\.webp/.test(doctor.photo) ? `${doctor.photo}?v=2` : doctor.photo;
    image.alt = doctor.fullName;
    photo.appendChild(image);
  } else photo.appendChild(el('div', 'monogram', initials(doctor.fullName)));
  document.querySelector('#name').textContent = doctor.fullName;
  document.querySelector('#title').textContent = tx(doctor.title);
  const back = document.querySelector('#back');
  const homeClinic = (doctor.clinics || []).includes('aesthetic') && doctor.theme === 'aesthetic' ? '/estetike' : '/dent';
  back.href = homeClinic;
  document.querySelector('#icons').replaceChildren(socialLinks(doctor));
  const contact = document.querySelector('#direct');
  contact.replaceChildren();
  if (doctor.phone) {
    const phone = el('a', 'btn btn-navy', doctor.phone);
    phone.href = `tel:${doctor.phone.replace(/\s/g, '')}`;
    contact.appendChild(phone);
  }
  if (doctor.email) {
    const email = el('a', 'btn btn-line', doctor.email);
    email.href = `mailto:${doctor.email}`;
    contact.appendChild(email);
  }
  const story = document.querySelector('#story');
  story.replaceChildren();
  [section(t('bio'), tx(doctor.bio)), section(t('education'), tx(doctor.education)), section(t('experience'), tx(doctor.experience)), section(t('certs'), tx(doctor.certifications))]
    .filter(Boolean)
    .forEach((block) => story.appendChild(block));
  const services = document.querySelector('#offers');
  services.replaceChildren();
  (doctor.services || []).forEach((service) => {
    const label = tx(service);
    if (label) services.appendChild(el('li', '', label));
  });
  document.querySelector('#offersWrap').hidden = !services.children.length;
  const work = document.querySelector('#work');
  work.replaceChildren();
  (doctor.gallery || []).forEach((item) => {
    if (item.mediaType === 'pair' && item.beforeUrl && item.afterUrl) {
      const box = el('div', 'ba');
      const after = el('img');
      after.src = item.afterUrl;
      after.alt = tx(item.caption) || t('after');
      after.loading = 'lazy';
      const before = el('img', 'before');
      before.src = item.beforeUrl;
      before.alt = t('before');
      before.loading = 'lazy';
      const range = document.createElement('input');
      range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50';
      box.append(after, before, range, el('div', 'handle'));
      work.appendChild(box);
      compare(box);
      return;
    }
    if (!item.url) return;
    const button = el('button', 'gallery-card');
    const image = el('img');
    image.src = item.url;
    image.alt = tx(item.caption) || doctor.fullName;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.appendChild(image);
    button.addEventListener('click', () => openLightbox(item.url, image.alt));
    work.appendChild(button);
  });
  document.querySelector('#workWrap').hidden = !work.children.length;
  const book = document.querySelector('#book');
  book.href = `${homeClinic}#kontakt`;
  applyI18n();
  document.title = `${doctor.fullName} · Brilliant Dent`;
  const ogTitle = document.head.querySelector('meta[property="og:title"]');
  const twTitle = document.head.querySelector('meta[name="twitter:title"]');
  if (ogTitle) ogTitle.content = document.title;
  if (twTitle) twTitle.content = document.title;
}

bindLang(() => render());
window.bdaI18n.then(() => fetch(`/api/doctors/${slug}`).then(async (response) => {
  if (!response.ok) throw new Error('missing');
  payload = await response.json();
  render();
}).catch(() => {
  document.querySelector('#name').textContent = 'Profili nuk u gjet.';
}));
