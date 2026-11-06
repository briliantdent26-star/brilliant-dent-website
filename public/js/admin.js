let data = null;
let panel = 'staff';
let editing = null;

const panelEl = () => document.querySelector('#panel');
async function api(url, options = {}) {
  const opts = { method: options.method || 'GET', credentials: 'same-origin' };
  if (options.body instanceof FormData) opts.body = options.body;
  else if (options.body) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, opts);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Gabim');
  return payload;
}
async function refresh() {
  const current = editing?.id;
  data = await api('/api/admin/content');
  if (current) editing = data.doctors.find((doctor) => doctor.id === current) || null;
  draw();
}
function langs(value, onType, multiline = true) {
  const grid = document.createElement('div');
  grid.className = 'lang-grid';
  ['sq', 'en', 'de', 'fr'].forEach((lang) => {
    const field = document.createElement(multiline ? 'textarea' : 'input');
    field.placeholder = lang.toUpperCase();
    field.value = value?.[lang] || '';
    field.addEventListener('input', () => onType(lang, field.value));
    grid.appendChild(field);
  });
  return grid;
}
function button(label, action) {
  const node = document.createElement('button');
  node.className = 'tiny';
  node.type = 'button';
  node.textContent = label;
  node.addEventListener('click', action);
  return node;
}

function drawStaff() {
  const root = panelEl();
  root.replaceChildren();
  root.append(Object.assign(document.createElement('h2'), { textContent: 'Stafi' }));
  root.append(button('Shto mjek / staf', () => { editing = blankDoctor(); draw(); }));
  data.doctors.forEach((doctor, index) => {
    const row = document.createElement('div');
    row.className = 'staff-row';
    const img = document.createElement(doctor.photo ? 'img' : 'div');
    if (doctor.photo) img.src = doctor.photo;
    else { img.className = 'ph'; img.textContent = doctor.fullName.slice(0, 1); }
    const info = document.createElement('div');
    info.innerHTML = `<strong></strong><div class="muted"></div>`;
    info.querySelector('strong').textContent = `${doctor.fullName}${doctor.visible ? '' : ' · i fshehur'}`;
    info.querySelector('.muted').textContent = `${(doctor.clinics || []).join(', ')} · /doktori/${doctor.slug}`;
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.append(
      button('↑', () => moveDoctor(index, -1)),
      button('↓', () => moveDoctor(index, 1)),
      button('Ndrysho', () => { editing = structuredClone(doctor); draw(); }),
      button(doctor.visible ? 'Fshih' : 'Shfaq', () => toggleDoctor(doctor)),
      button('Fshi', () => removeDoctor(doctor))
    );
    row.append(img, info, actions);
    root.appendChild(row);
  });
  if (editing) root.appendChild(editor(editing));
}
function blankDoctor() {
  return {
    fullName: '', slug: '', title: {}, bio: {}, education: {}, experience: {}, certifications: {},
    email: '', emails: [], phone: '', phones: [], instagram: '', facebook: '', tiktok: '',
    clinics: ['dent'], theme: 'dent', services: [], visible: true, gallery: []
  };
}
function editor(doctor) {
  const box = document.createElement('form');
  box.className = 'edit-card';
  box.innerHTML = `<h3>${doctor.id ? 'Ndrysho profilin' : 'Profil i ri'}</h3>`;
  const name = document.createElement('input');
  name.placeholder = 'Emri i plotë';
  name.value = doctor.fullName || '';
  name.required = true;
  const addLang = (label, key, multi = true) => {
    const title = document.createElement('p');
    title.className = 'muted';
    title.textContent = label;
    box.append(title, langs(doctor[key], (lang, value) => { doctor[key] = { ...(doctor[key] || {}), [lang]: value }; }, multi));
  };
  box.append(name);
  addLang('Titulli / specializimi', 'title');
  addLang('Biografia', 'bio');
  addLang('Arsimimi', 'education');
  addLang('Përvoja', 'experience');
  addLang('Certifikimet', 'certifications');
  const phoneRows = contactRows('Telefonat', doctor.phones?.length ? doctor.phones : [doctor.phone].filter(Boolean), 'Telefoni', 'Shto telefon');
  const emailRows = contactRows('Email-et', doctor.emails?.length ? doctor.emails : [doctor.email].filter(Boolean), 'Email', 'Shto email');
  box.append(phoneRows.box, emailRows.box);
  [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].forEach(([key, label]) => {
    const input = document.createElement('input');
    input.placeholder = label;
    input.value = doctor[key] || '';
    input.addEventListener('input', () => { doctor[key] = input.value; });
    box.appendChild(input);
  });
  const clinics = document.createElement('div');
  ['dent', 'aesthetic'].forEach((clinic) => {
    const label = document.createElement('label');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = (doctor.clinics || []).includes(clinic);
    check.addEventListener('change', () => {
      doctor.clinics = [...clinics.querySelectorAll('input:checked')].map((item) => item.value);
    });
    check.value = clinic;
    label.append(check, document.createTextNode(clinic === 'dent' ? ' Klinika dentare' : ' Klinika estetike'));
    clinics.appendChild(label);
  });
  const theme = document.createElement('select');
  theme.innerHTML = '<option value="dent">Faqja e profilit: dentare</option><option value="aesthetic">Faqja e profilit: estetike</option>';
  theme.value = doctor.theme || 'dent';
  theme.addEventListener('change', () => { doctor.theme = theme.value; });
  const visible = document.createElement('label');
  const vis = document.createElement('input');
  vis.type = 'checkbox';
  vis.checked = doctor.visible !== false;
  vis.addEventListener('change', () => { doctor.visible = vis.checked; });
  visible.append(vis, document.createTextNode(' Shfaqet në faqe'));
  box.append(clinics, theme, visible);
  const services = document.createElement('div');
  const paintServices = () => {
    services.replaceChildren(Object.assign(document.createElement('p'), { className: 'muted', textContent: 'Shërbimet e këtij mjeku' }));
    (doctor.services || []).forEach((service, index) => {
      services.append(langs(service, (lang, value) => { doctor.services[index][lang] = value; }));
      services.append(button('Hiq shërbimin', () => { doctor.services.splice(index, 1); paintServices(); }));
    });
    services.append(button('Shto shërbim', () => { doctor.services.push({ sq: '', en: '', de: '' }); paintServices(); }));
  };
  paintServices();
  box.appendChild(services);
  const save = document.createElement('button');
  save.className = 'btn btn-navy';
  save.type = 'submit';
  save.textContent = 'Ruaj profilin';
  box.appendChild(save);
  box.addEventListener('submit', async (event) => {
    event.preventDefault();
    doctor.fullName = name.value;
    const phoneList = phoneRows.read();
    const emailList = emailRows.read();
    doctor.phones = phoneList;
    doctor.phone = phoneList[0] || '';
    doctor.emails = emailList;
    doctor.email = emailList[0] || '';
    const body = { ...doctor };
    try {
      if (doctor.id) await api(`/api/admin/doctors/${doctor.id}`, { method: 'PUT', body });
      else {
        const created = await api('/api/admin/doctors', { method: 'POST', body });
        editing = created.doctor;
      }
      await refresh();
    } catch (err) { alert(err.message); }
  });
  if (doctor.id) {
    box.append(photoField(doctor));
    box.append(fileLine('Foto pune', `/api/admin/doctors/${doctor.id}/gallery`, 'file'));
    const pair = document.createElement('form');
    pair.className = 'edit-card';
    pair.innerHTML = '<p class="muted">Para & pas për këtë mjek</p>';
    const before = document.createElement('input');
    before.type = 'file'; before.name = 'before'; before.accept = 'image/*'; before.required = true;
    const after = document.createElement('input');
    after.type = 'file'; after.name = 'after'; after.accept = 'image/*'; after.required = true;
    const send = document.createElement('button');
    send.className = 'tiny'; send.type = 'submit'; send.textContent = 'Shto çiftin';
    pair.append(before, after, send);
    pair.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(pair);
      await api(`/api/admin/doctors/${doctor.id}/pair`, { method: 'POST', body: form });
      await refresh();
    });
    box.appendChild(pair);
    (doctor.gallery || []).forEach((item) => {
      const line = document.createElement('div');
      line.textContent = item.mediaType === 'pair' ? 'Para / pas' : 'Foto';
      line.append(button('Fshi', async () => {
        await api(`/api/admin/doctor-gallery/${item.id}`, { method: 'DELETE' });
        await refresh();
      }));
      box.appendChild(line);
    });
    const view = document.createElement('a');
    view.href = `/doktori/${doctor.slug}`;
    view.target = '_blank';
    view.textContent = 'Hap profilin publik';
    box.appendChild(view);
  }
  return box;
}
function photoField(doctor) {
  const box = document.createElement('div');
  box.className = 'edit-card';
  const title = document.createElement('p');
  title.className = 'muted';
  title.textContent = 'Foto e profilit';
  const preview = document.createElement('div');
  preview.className = 'photo-preview';
  if (doctor.photo) {
    const image = document.createElement('img');
    image.src = doctor.photo;
    image.alt = doctor.fullName;
    preview.appendChild(image);
  } else preview.appendChild(Object.assign(document.createElement('div'), { className: 'monogram', textContent: initials(doctor.fullName) }));
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.hidden = true;
  const choose = button('Ngarko foto', () => input.click());
  const crop = document.createElement('div');
  crop.className = 'crop-box';
  crop.hidden = true;
  box.append(title, preview, choose, input, crop);
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    openCrop(crop, file, async (blob) => {
      const body = new FormData();
      body.append('file', blob, 'photo.webp');
      await api(`/api/admin/doctors/${doctor.id}/photo`, { method: 'POST', body });
      await refresh();
    });
  });
  return box;
}
function openCrop(crop, file, onSave) {
  crop.hidden = false;
  crop.replaceChildren();
  const frame = document.createElement('div');
  frame.className = 'crop-frame';
  const image = document.createElement('img');
  image.src = URL.createObjectURL(file);
  image.alt = '';
  frame.appendChild(image);
  const zoom = document.createElement('input');
  zoom.type = 'range';
  zoom.min = '1';
  zoom.max = '3';
  zoom.step = '0.01';
  zoom.value = '1';
  const hint = document.createElement('p');
  hint.className = 'muted';
  hint.textContent = 'Tërhiqeni foton dhe zmadhoni, pastaj ruani.';
  crop.append(frame, zoom, hint, button('Ruaj foton', () => saveCrop(image, frame, zoom, onSave)), button('Anulo', () => { crop.hidden = true; crop.replaceChildren(); }));
  const state = { scale: 1, x: 0, y: 0, base: 1, ready: false };
  image.addEventListener('load', () => {
    state.base = Math.max(frame.clientWidth / image.naturalWidth, frame.clientHeight / image.naturalHeight);
    state.scale = 1;
    state.x = (frame.clientWidth - image.naturalWidth * state.base) / 2;
    state.y = (frame.clientHeight - image.naturalHeight * state.base) / 2;
    state.ready = true;
    paint();
  });
  function paint() {
    const width = image.naturalWidth * state.base * state.scale;
    const height = image.naturalHeight * state.base * state.scale;
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    image.style.left = `${state.x}px`;
    image.style.top = `${state.y}px`;
  }
  function clamp() {
    const width = image.naturalWidth * state.base * state.scale;
    const height = image.naturalHeight * state.base * state.scale;
    state.x = Math.min(0, Math.max(frame.clientWidth - width, state.x));
    state.y = Math.min(0, Math.max(frame.clientHeight - height, state.y));
  }
  zoom.addEventListener('input', () => {
    state.scale = Number(zoom.value);
    clamp();
    paint();
  });
  let drag = null;
  frame.addEventListener('pointerdown', (event) => {
    drag = { x: event.clientX, y: event.clientY, ox: state.x, oy: state.y };
    frame.setPointerCapture(event.pointerId);
  });
  frame.addEventListener('pointermove', (event) => {
    if (!drag) return;
    state.x = drag.ox + event.clientX - drag.x;
    state.y = drag.oy + event.clientY - drag.y;
    clamp();
    paint();
  });
  frame.addEventListener('pointerup', () => { drag = null; });
  function saveCrop(node, box, range, save) {
    if (!state.ready) return;
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ratio = canvas.width / box.clientWidth;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(node, state.x * ratio, state.y * ratio, node.naturalWidth * state.base * state.scale * ratio, node.naturalHeight * state.base * state.scale * ratio);
    canvas.toBlob(async (blob) => {
      const fileBlob = blob || await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!fileBlob) return;
      await save(fileBlob);
    }, 'image/webp', 0.9);
  }
}
function fileLine(label, url, field) {
  const form = document.createElement('form');
  form.className = 'edit-card';
  const title = document.createElement('p');
  title.className = 'muted';
  title.textContent = label;
  const input = document.createElement('input');
  input.type = 'file'; input.name = field; input.accept = 'image/*'; input.required = true;
  const send = document.createElement('button');
  send.className = 'tiny'; send.type = 'submit'; send.textContent = 'Ngarko';
  form.append(title, input, send);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await api(url, { method: 'POST', body: new FormData(form) });
    await refresh();
  });
  return form;
}
async function moveDoctor(index, step) {
  const next = index + step;
  if (next < 0 || next >= data.doctors.length) return;
  const ids = data.doctors.map((doctor) => doctor.id);
  [ids[index], ids[next]] = [ids[next], ids[index]];
  await api('/api/admin/doctors/reorder', { method: 'POST', body: { ids } });
  editing = null;
  await refresh();
}
async function toggleDoctor(doctor) {
  await api(`/api/admin/doctors/${doctor.id}`, { method: 'PUT', body: { ...doctor, visible: !doctor.visible } });
  await refresh();
}
async function removeDoctor(doctor) {
  if (!confirm(`Të fshihet ${doctor.fullName}?`)) return;
  await api(`/api/admin/doctors/${doctor.id}`, { method: 'DELETE' });
  editing = null;
  await refresh();
}

function drawClinic(slug) {
  const clinic = data[slug];
  const root = panelEl();
  root.replaceChildren();
  const form = document.createElement('form');
  form.className = 'edit-card';
  form.append(Object.assign(document.createElement('h2'), { textContent: slug === 'dent' ? 'Stomatologjia' : 'Estetika' }));
  const fields = [
    ['kicker', 'Sytitulli'], ['heroTitle', 'Titulli kryesor'], ['heroSubtitle', 'Nëntitulli'],
    ['aboutTitle', 'Titulli rreth nesh'], ['aboutBody', 'Teksti rreth nesh']
  ];
  fields.forEach(([key, label]) => {
    form.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: label }));
    form.append(langs(clinic[key], (lang, value) => { clinic[key] = { ...(clinic[key] || {}), [lang]: value }; }));
  });
  const video = document.createElement('input');
  video.placeholder = 'Lidhja e videos TikTok ose Instagram';
  video.value = clinic.heroVideoUrl || '';
  form.append(video);
  const save = document.createElement('button');
  save.className = 'btn btn-navy'; save.type = 'submit'; save.textContent = 'Ruaj tekstet';
  form.append(save);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clinic.heroVideoUrl = video.value;
    await api(`/api/admin/clinics/${slug}`, { method: 'PUT', body: clinic });
    alert('U ruajt.');
  });
  root.appendChild(form);
  clinic.services.forEach((service) => {
    const card = document.createElement('form');
    card.className = 'edit-card';
    card.append(langs(service.title, (lang, value) => { service.title = { ...service.title, [lang]: value }; }));
    card.append(langs(service.description, (lang, value) => { service.description = { ...service.description, [lang]: value }; }));
    card.append(button('Ruaj shërbimin', async () => {
      await api(`/api/admin/services/${service.id}`, { method: 'PUT', body: service });
      alert('U ruajt.');
    }));
    card.append(button('Fshi', async () => {
      await api(`/api/admin/services/${service.id}`, { method: 'DELETE' });
      await refresh();
    }));
    root.appendChild(card);
  });
  root.append(button('Shto shërbim', async () => {
    await api('/api/admin/services', { method: 'POST', body: { clinic: slug, title: { sq: 'Shërbim i ri' }, description: { sq: '' }, sortOrder: clinic.services.length } });
    await refresh();
  }));
  root.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: 'Fotot dhe videot ndërrohen te Galeria: slideri në mes dhe galeria.' }));
  const pair = document.createElement('form');
  pair.className = 'edit-card';
  pair.innerHTML = '<p class="muted">Para & pas i klinikës</p>';
  const before = Object.assign(document.createElement('input'), { type: 'file', name: 'before', accept: 'image/*', required: true });
  const after = Object.assign(document.createElement('input'), { type: 'file', name: 'after', accept: 'image/*', required: true });
  pair.append(before, after);
  pair.append(button('Shto', async () => {
    const body = new FormData(pair);
    body.append('clinic', slug);
    await api('/api/admin/before-after', { method: 'POST', body });
    await refresh();
  }));
  root.appendChild(pair);
  clinic.beforeAfter.forEach((item) => {
    root.append(button('Fshi një para/pas', async () => {
      await api(`/api/admin/before-after/${item.id}`, { method: 'DELETE' });
      await refresh();
    }));
  });
  clinic.social.forEach((link) => {
    const row = document.createElement('div');
    row.className = 'edit-card';
    const net = Object.assign(document.createElement('input'), { value: link.network });
    const href = Object.assign(document.createElement('input'), { value: link.url });
    row.append(net, href, button('Ruaj', async () => {
      await api(`/api/admin/social/${link.id}`, { method: 'PUT', body: { network: net.value, url: href.value, label: link.label } });
      alert('U ruajt.');
    }), button('Fshi', async () => {
      await api(`/api/admin/social/${link.id}`, { method: 'DELETE' });
      await refresh();
    }));
    root.appendChild(row);
  });
  root.append(button('Shto rrjet social', async () => {
    await api('/api/admin/social', { method: 'POST', body: { clinic: slug, network: 'instagram', url: 'https://', label: { sq: 'Instagram' } } });
    await refresh();
  }));
}

async function moveGallery(items, index, direction) {
  const next = index + direction;
  if (next < 0 || next >= items.length) return;
  const ids = items.map((item) => item.id);
  [ids[index], ids[next]] = [ids[next], ids[index]];
  await api('/api/admin/gallery-order', { method: 'POST', body: { ids } });
  await refresh();
}
function drawHero() {
  const root = panelEl();
  root.replaceChildren(Object.assign(document.createElement('h2'), { textContent: 'Hero Slider' }));
  const note = document.createElement('p');
  note.className = 'muted';
  note.textContent = 'Sllajdet lexohen nga databaza. Teksti mbi foto është opsional.';
  root.appendChild(note);
  ['dent', 'aesthetic'].forEach((slug) => {
    const clinic = data[slug];
    const slides = clinic.gallery.filter((item) => item.placement === 'hero');
    const block = document.createElement('section');
    block.className = 'edit-card';
    block.append(Object.assign(document.createElement('h3'), { textContent: slug === 'dent' ? 'Stomatologjia' : 'Estetika' }));
    const upload = document.createElement('form');
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*,video/mp4,video/webm';
    file.multiple = true;
    file.required = true;
    const overlay = document.createElement('input');
    overlay.placeholder = 'Teksti mbi foto, opsional';
    upload.append(file, overlay, button('Ngarko', async () => {
      if (!file.files.length) return;
      let order = slides.reduce((max, item) => Math.max(max, item.sortOrder || 0), -1) + 1;
      for (const one of file.files) {
        const body = new FormData();
        body.append('file', one);
        body.append('clinic', slug);
        body.append('placement', 'hero');
        body.append('sortOrder', String(order));
        body.append('caption', JSON.stringify({ sq: overlay.value, en: overlay.value, de: overlay.value, fr: overlay.value }));
        await api('/api/admin/gallery', { method: 'POST', body });
        order += 1;
      }
      await refresh();
    }));
    block.appendChild(upload);
    slides.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `hero-admin${item.visible === false ? ' is-off' : ''}`;
      if (item.mediaType === 'video') {
        const video = document.createElement('video');
        video.src = item.url;
        video.muted = true;
        video.className = 'admin-thumb';
        card.appendChild(video);
      } else {
        const thumb = document.createElement('img');
        thumb.src = item.url;
        thumb.alt = '';
        thumb.className = 'admin-thumb';
        card.appendChild(thumb);
      }
      card.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: 'Teksti mbi foto' }));
      card.append(langs(item.caption || {}, (lang, value) => { item.caption = { ...(item.caption || {}), [lang]: value }; }, false));
      const replace = document.createElement('input');
      replace.type = 'file';
      replace.accept = 'image/*,video/mp4,video/webm';
      replace.hidden = true;
      replace.addEventListener('change', async () => {
        if (!replace.files[0]) return;
        const body = new FormData();
        body.append('file', replace.files[0]);
        await api(`/api/admin/gallery/${item.id}/file`, { method: 'POST', body });
        await refresh();
      });
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      actions.append(
        button('Ruaj tekstin', async () => {
          await api(`/api/admin/gallery/${item.id}`, { method: 'PUT', body: { caption: item.caption } });
          alert('U ruajt.');
        }),
        button(item.visible === false ? 'Aktivizo' : 'Fshih', async () => {
          await api(`/api/admin/gallery/${item.id}`, { method: 'PUT', body: { visible: item.visible === false } });
          await refresh();
        }),
        button('↑', () => moveGallery(slides, index, -1)),
        button('↓', () => moveGallery(slides, index, 1)),
        button('Zëvendëso', () => replace.click()),
        button('Fshi', async () => {
          if (!confirm('Të fshihet ky sllajd?')) return;
          await api(`/api/admin/gallery/${item.id}`, { method: 'DELETE' });
          await refresh();
        })
      );
      card.append(replace, actions);
      block.appendChild(card);
    });
    root.appendChild(block);
  });
}
function drawGallery() {
  const root = panelEl();
  root.replaceChildren(Object.assign(document.createElement('h2'), { textContent: 'Galeria' }));
  const note = document.createElement('p');
  note.className = 'muted';
  note.textContent = 'Ngarkoni foto ose video MP4. «Zëvendëso» e ndërron foton. Slideri në mes është mes shërbimeve dhe stafit.';
  root.appendChild(note);
  ['dent', 'aesthetic'].forEach((slug) => {
    const block = document.createElement('section');
    block.className = 'edit-card';
    block.append(Object.assign(document.createElement('h3'), { textContent: slug === 'dent' ? 'Stomatologjia' : 'Estetika' }));
    block.appendChild(mediaGroup(slug, 'middle', 'Slideri në mes'));
    block.appendChild(mediaGroup(slug, 'gallery', 'Galeria'));
    root.appendChild(block);
  });
}
function mediaGroup(slug, placement, title) {
  const clinic = data[slug];
  const items = clinic.gallery.filter((item) => item.placement === placement);
  const box = document.createElement('div');
  box.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: title }));
  const upload = document.createElement('form');
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'image/*,video/mp4,video/webm';
  file.multiple = true;
  const overlay = document.createElement('input');
  overlay.placeholder = 'Përshkrimi, opsional';
  upload.append(file, overlay, button('Ngarko foto ose video', async () => {
    if (!file.files.length) return;
    let order = items.reduce((max, item) => Math.max(max, item.sortOrder || 0), -1) + 1;
    for (const one of file.files) {
      const body = new FormData();
      body.append('file', one);
      body.append('clinic', slug);
      body.append('placement', placement);
      body.append('sortOrder', String(order));
      body.append('caption', JSON.stringify({ sq: overlay.value, en: overlay.value, de: overlay.value, fr: overlay.value }));
      await api('/api/admin/gallery', { method: 'POST', body });
      order += 1;
    }
    await refresh();
  }));
  box.appendChild(upload);
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'hero-admin';
    if (item.mediaType === 'video') {
      const video = document.createElement('video');
      video.src = item.url;
      video.muted = true;
      video.controls = true;
      video.className = 'admin-thumb';
      card.appendChild(video);
    } else if (item.mediaType === 'image') {
      const thumb = document.createElement('img');
      thumb.src = item.url;
      thumb.alt = '';
      thumb.className = 'admin-thumb';
      card.appendChild(thumb);
    } else card.append(Object.assign(document.createElement('p'), { textContent: item.url }));
    card.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: item.mediaType === 'video' ? 'Video' : 'Foto' }));
    card.append(langs(item.caption || {}, (lang, value) => { item.caption = { ...(item.caption || {}), [lang]: value }; }, false));
    const replace = document.createElement('input');
    replace.type = 'file';
    replace.accept = 'image/*,video/mp4,video/webm';
    replace.hidden = true;
    replace.addEventListener('change', async () => {
      if (!replace.files[0]) return;
      const body = new FormData();
      body.append('file', replace.files[0]);
      await api(`/api/admin/gallery/${item.id}/file`, { method: 'POST', body });
      await refresh();
    });
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.append(
      button('Ruaj përshkrimin', async () => {
        await api(`/api/admin/gallery/${item.id}`, { method: 'PUT', body: { caption: item.caption } });
        alert('U ruajt.');
      }),
      button('↑', () => moveGallery(items, index, -1)),
      button('↓', () => moveGallery(items, index, 1)),
      button('Zëvendëso', () => replace.click()),
      button('Fshi', async () => {
        if (!confirm('Të fshihet kjo?')) return;
        await api(`/api/admin/gallery/${item.id}`, { method: 'DELETE' });
        await refresh();
      })
    );
    card.append(replace, actions);
    box.appendChild(card);
  });
  return box;
}
function drawContact() {
  const contact = data.contact;
  const root = panelEl();
  const form = document.createElement('form');
  form.className = 'edit-card';
  form.append(Object.assign(document.createElement('h2'), { textContent: 'Kontakti' }));
  form.append(langs(contact.address, (lang, value) => { contact.address = { ...contact.address, [lang]: value }; }));
  const phones = contactRows('Telefonat', contact.phones?.length ? contact.phones : [contact.phone, contact.phoneSecondary].filter(Boolean), 'Telefoni', 'Shto telefon');
  const emails = contactRows('Email-et', contact.emails?.length ? contact.emails : [contact.email].filter(Boolean), 'Email', 'Shto email');
  const whatsapp = Object.assign(document.createElement('input'), { value: contact.whatsapp || '', placeholder: 'WhatsApp, p.sh. +383 44 654 129' });
  form.append(phones.box, emails.box, whatsapp);
  const save = document.createElement('button');
  save.className = 'btn btn-navy'; save.textContent = 'Ruaj'; save.type = 'submit';
  form.append(save);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phoneList = phones.read();
    const emailList = emails.read();
    await api('/api/admin/contact', {
      method: 'PUT',
      body: {
        ...contact,
        phones: phoneList,
        phone: phoneList[0] || '',
        phoneSecondary: phoneList[1] || '',
        emails: emailList,
        email: emailList[0] || '',
        whatsapp: whatsapp.value
      }
    });
    alert('U ruajt.');
    await refresh();
  });
  root.replaceChildren(form);
}
function contactRows(title, values, placeholder, addLabel) {
  const box = document.createElement('div');
  box.className = 'contact-list';
  box.append(Object.assign(document.createElement('p'), { className: 'muted', textContent: title }));
  const rows = document.createElement('div');
  function add(value) {
    const row = document.createElement('div');
    row.className = 'contact-row';
    const input = Object.assign(document.createElement('input'), { value: value || '', placeholder });
    row.append(input, button('Hiq', () => row.remove()));
    rows.appendChild(row);
  }
  (values.length ? values : ['']).forEach(add);
  box.append(rows, button(addLabel, () => add('')));
  return { box, read: () => [...rows.querySelectorAll('input')].map((input) => input.value.trim()).filter(Boolean) };
}
function drawAppointments() {
  const labels = { new: 'e re', confirmed: 'e konfirmuar', cancelled: 'e anuluar', contacted: 'e kontaktuar', closed: 'e mbyllur' };
  const clinics = { dent: 'Stomatologji', aesthetic: 'Estetikë' };
  const root = panelEl();
  root.replaceChildren(Object.assign(document.createElement('h2'), { textContent: 'Terminet' }));
  if (!(data.appointments || []).length) root.append(Object.assign(document.createElement('p'), { textContent: 'Nuk ka termine.' }));
  (data.appointments || []).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'edit-card';
    const title = document.createElement('strong');
    title.textContent = `${item.full_name} · ${labels[item.status] || item.status}`;
    const detail = document.createElement('p');
    detail.className = 'muted';
    detail.textContent = `${item.preferred_date || ''} ${item.preferred_time || ''} · ${clinics[item.clinic] || item.clinic} · ${item.doctor_name || ''} · ${item.service_name || ''}`;
    const contact = document.createElement('p');
    contact.textContent = `${item.phone || ''} · ${item.email || ''}${item.message ? ` · ${item.message}` : ''}`;
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.append(
      button('Konfirmo', async () => {
        await api(`/api/admin/appointments/${item.id}`, { method: 'PATCH', body: { status: 'confirmed' } });
        await refresh();
      }),
      button('Anulo', async () => {
        await api(`/api/admin/appointments/${item.id}`, { method: 'PATCH', body: { status: 'cancelled' } });
        await refresh();
      }),
      button('Fshi', async () => {
        await api(`/api/admin/appointments/${item.id}`, { method: 'DELETE' });
        await refresh();
      })
    );
    row.append(title, detail, contact, actions);
    root.appendChild(row);
  });
}
let editingReview = null;
function blankReview() {
  return { clinic: 'dent', patientName: '', anonymous: false, rating: 5, body: { sq: '', en: '', de: '' }, reviewDate: '', visible: true };
}
function drawTestimonials() {
  const root = panelEl();
  root.replaceChildren(Object.assign(document.createElement('h2'), { textContent: 'Vlerësimet' }));
  root.append(button('Shto vlerësim', () => { editingReview = blankReview(); draw(); }));
  const statusLabel = { pending: 'në pritje', approved: 'i aprovuar', rejected: 'i refuzuar' };
  const reviews = [...(data.testimonials || [])].sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1));
  reviews.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'edit-card';
    const title = document.createElement('strong');
    title.textContent = `${item.anonymous ? 'Anonim' : item.patientName} · ${item.clinic === 'aesthetic' ? 'Estetikë' : 'Stomatologji'} · ${item.rating}/5 · ${statusLabel[item.status] || item.status}`;
    const text = document.createElement('p');
    text.textContent = item.body?.sq || '';
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    const saveStatus = async (status) => {
      await api(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        body: {
          clinic: item.clinic, patientName: item.patientName, anonymous: item.anonymous,
          rating: item.rating, body: item.body, reviewDate: item.reviewDate, status, visible: status === 'approved'
        }
      });
      await refresh();
    };
    actions.append(
      button('Aprovo', () => saveStatus('approved')),
      button('Refuzo', () => saveStatus('rejected')),
      button('Ndrysho', () => { editingReview = structuredClone(item); draw(); }),
      button('Fshi', async () => {
        await api(`/api/admin/testimonials/${item.id}`, { method: 'DELETE' });
        editingReview = null;
        await refresh();
      })
    );
    row.append(title, text, actions);
    root.appendChild(row);
  });
  if (!editingReview) return;
  const review = editingReview;
  const form = document.createElement('form');
  form.className = 'edit-card';
  const clinic = document.createElement('select');
  clinic.append(new Option('Stomatologji', 'dent'), new Option('Estetikë', 'aesthetic'));
  clinic.value = review.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
  const name = Object.assign(document.createElement('input'), { value: review.patientName || '', placeholder: 'Emri i pacientit' });
  const anonymous = document.createElement('input');
  anonymous.type = 'checkbox';
  anonymous.checked = review.anonymous === true;
  const anonLabel = document.createElement('label');
  anonLabel.append(anonymous, document.createTextNode(' Anonim'));
  const rating = document.createElement('select');
  [5, 4, 3, 2, 1].forEach((value) => rating.append(new Option(`${value} yje`, String(value))));
  rating.value = String(review.rating || 5);
  const date = Object.assign(document.createElement('input'), { type: 'date', value: review.reviewDate || '' });
  const visible = document.createElement('input');
  visible.type = 'checkbox';
  visible.checked = review.visible !== false;
  const visibleLabel = document.createElement('label');
  visibleLabel.append(visible, document.createTextNode(' I dukshëm në faqe'));
  const save = document.createElement('button');
  save.className = 'btn btn-navy';
  save.type = 'submit';
  save.textContent = 'Ruaj';
  form.append(clinic, name, anonLabel, rating, langs(review.body, (lang, value) => { review.body = { ...review.body, [lang]: value }; }), date, visibleLabel, save);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = {
      clinic: clinic.value,
      patientName: name.value,
      anonymous: anonymous.checked,
      rating: Number(rating.value),
      body: review.body,
      reviewDate: date.value,
      visible: visible.checked,
      status: visible.checked ? 'approved' : 'rejected'
    };
    if (review.id) await api(`/api/admin/testimonials/${review.id}`, { method: 'PUT', body });
    else await api('/api/admin/testimonials', { method: 'POST', body });
    editingReview = null;
    await refresh();
  });
  root.appendChild(form);
}
function drawPassword() {
  const form = document.createElement('form');
  form.className = 'edit-card';
  const next = Object.assign(document.createElement('input'), { type: 'password', placeholder: 'Fjalëkalimi i ri', required: true, minLength: 8, autocomplete: 'new-password' });
  const again = Object.assign(document.createElement('input'), { type: 'password', placeholder: 'Përsëriteni fjalëkalimin', required: true, minLength: 8, autocomplete: 'new-password' });
  const note = document.createElement('p');
  note.className = 'error';
  const save = document.createElement('button');
  save.className = 'btn btn-navy'; save.textContent = 'Ndrysho fjalëkalimin'; save.type = 'submit';
  form.append(
    Object.assign(document.createElement('h2'), { textContent: 'Fjalëkalimi i pronarit' }),
    Object.assign(document.createElement('p'), { className: 'muted', textContent: 'Të paktën 8 shenja. Me këtë hyni në panel.' }),
    next, again, note, save
  );
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    note.textContent = '';
    if (next.value !== again.value) {
      note.textContent = 'Fjalëkalimet nuk përputhen.';
      return;
    }
    try {
      await api('/api/admin/password', { method: 'POST', body: { password: next.value } });
      note.textContent = '';
      alert('Fjalëkalimi u ndryshua. Herën tjetër hyni me të riun.');
      form.reset();
    } catch (err) {
      note.textContent = err.message;
    }
  });
  panelEl().replaceChildren(form);
}
function draw() {
  if (panel === 'staff') drawStaff();
  else if (panel === 'hero') drawHero();
  else if (panel === 'gallery') drawGallery();
  else if (panel === 'dent' || panel === 'aesthetic') drawClinic(panel);
  else if (panel === 'contact') drawContact();
  else if (panel === 'appointments') drawAppointments();
  else if (panel === 'testimonials') drawTestimonials();
  else drawPassword();
  document.querySelectorAll('.side button[data-panel]').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.panel === panel ? 'true' : 'false');
  });
}

document.querySelector('#login').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    await api('/api/admin/login', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
    document.querySelector('#login').hidden = true;
    document.querySelector('#app').hidden = false;
    await refresh();
  } catch (err) {
    document.querySelector('#loginError').textContent = err.message;
  }
});
document.querySelector('#logout').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' });
  location.reload();
});
document.querySelectorAll('.side button[data-panel]').forEach((button) => {
  button.addEventListener('click', () => { panel = button.dataset.panel; editing = null; draw(); });
});
api('/api/admin/content').then((payload) => {
  data = payload;
  document.querySelector('#login').hidden = true;
  document.querySelector('#app').hidden = false;
  draw();
}).catch(() => {});
