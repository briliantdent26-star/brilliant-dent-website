let UI = { sq: {}, en: {}, de: {}, fr: {} };

window.bdaI18n = fetch('/translations.json')
  .then((response) => response.json())
  .then((data) => {
    UI = data;
    applyI18n();
    return data;
  })
  .catch(() => UI);

function getLang() {
  const saved = localStorage.getItem('bda-lang');
  return saved === 'en' || saved === 'de' || saved === 'fr' ? saved : 'sq';
}
function setLang(lang) {
  const next = lang === 'en' || lang === 'de' || lang === 'fr' ? lang : 'sq';
  localStorage.setItem('bda-lang', next);
  document.documentElement.lang = next;
}
function t(key) {
  const pack = UI[getLang()] || UI.sq || {};
  return pack[key] || (UI.sq && UI.sq[key]) || key;
}
function gearLabels() {
  const pack = UI[getLang()] || UI.sq || {};
  return Array.isArray(pack.gear) ? pack.gear : ((UI.sq && UI.sq.gear) || []);
}
function tx(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[getLang()] || value.sq || value.en || '';
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function setHeadMeta(selector, attrs, content) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}
function applySeo() {
  if (location.pathname.startsWith('/admin')) return;
  const path = location.pathname;
  let titleKey = 'metaHomeTitle';
  let descKey = 'metaHomeDesc';
  let image = '/media/dent/hero-1.webp';
  let canonical = 'https://briliantdent.com/';
  if (path.startsWith('/dent')) {
    titleKey = 'metaDentTitle';
    descKey = 'metaDentDesc';
    canonical = 'https://briliantdent.com/dent';
  } else if (path.startsWith('/estetike')) {
    titleKey = 'metaAesTitle';
    descKey = 'metaAesDesc';
    image = '/media/aes/hero-1.webp';
    canonical = 'https://briliantdent.com/estetike';
  } else if (path.startsWith('/doktori')) {
    titleKey = 'metaDoctorTitle';
    descKey = 'metaDoctorDesc';
    canonical = `https://briliantdent.com${path}`;
  }
  const title = t(titleKey);
  const description = t(descKey);
  if (!path.startsWith('/doktori') && title !== titleKey) document.title = title;
  const imageUrl = `https://briliantdent.com${image}`;
  const shownTitle = path.startsWith('/doktori') ? document.title : title;
  setHeadMeta('meta[name="description"]', { name: 'description' }, description);
  setHeadMeta('meta[name="keywords"]', { name: 'keywords' }, t('metaKeywords'));
  setHeadMeta('meta[property="og:title"]', { property: 'og:title' }, shownTitle);
  setHeadMeta('meta[property="og:description"]', { property: 'og:description' }, description);
  setHeadMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl);
  setHeadMeta('meta[property="og:url"]', { property: 'og:url' }, canonical);
  setHeadMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
  setHeadMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
  setHeadMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, shownTitle);
  setHeadMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);
  setHeadMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl);
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = canonical;
}
function applyI18n() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-alt]').forEach((node) => { node.alt = t(node.dataset.i18nAlt); });
  document.querySelectorAll('.langs button').forEach((button) => {
    button.setAttribute('aria-pressed', button.dataset.lang === getLang() ? 'true' : 'false');
  });
  applySeo();
}
function bindLang(redraw) {
  document.querySelectorAll('.langs button').forEach((button) => {
    button.addEventListener('click', () => { setLang(button.dataset.lang); applyI18n(); redraw(); });
  });
  const menu = document.querySelector('.menu-btn');
  if (menu) menu.addEventListener('click', () => document.querySelector('.nav')?.classList.toggle('open'));
}
function initials(name) {
  return String(name || '').split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}
function socialLinks(person) {
  const row = el('div', 'icon-row');
  const items = [
    [person.email ? `mailto:${person.email}` : '', 'fa-solid fa-envelope', 'Email'],
    [person.phone ? `tel:${person.phone.replace(/\s/g, '')}` : '', 'fa-solid fa-phone', 'Phone'],
    [person.instagram, 'fa-brands fa-instagram', 'Instagram'],
    [person.facebook, 'fa-brands fa-facebook-f', 'Facebook'],
    [person.tiktok, 'fa-brands fa-tiktok', 'TikTok']
  ];
  items.forEach(([href, icon, label]) => {
    if (!href) return;
    const link = el('a');
    link.href = href;
    link.target = href.startsWith('http') ? '_blank' : '';
    link.rel = 'noopener';
    link.setAttribute('aria-label', label);
    link.innerHTML = `<i class="${icon}"></i>`;
    link.addEventListener('click', (event) => event.stopPropagation());
    row.appendChild(link);
  });
  return row;
}
function mountEmbed(url) {
  const wrap = el('div', 'embed-frame');
  const tiktok = String(url).match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktok) {
    const quote = document.createElement('blockquote');
    quote.className = 'tiktok-embed';
    quote.cite = url;
    quote.setAttribute('data-video-id', tiktok[1]);
    quote.style.maxWidth = '605px';
    quote.style.minWidth = '280px';
    quote.appendChild(document.createElement('section'));
    wrap.appendChild(quote);
    if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
    return wrap;
  }
  if (/instagram\.com\/(p|reel)\//.test(url)) {
    const quote = document.createElement('blockquote');
    quote.className = 'instagram-media';
    quote.dataset.instgrmPermalink = url;
    quote.dataset.instgrmVersion = '14';
    wrap.appendChild(quote);
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return wrap;
  }
  const link = el('a', '', url);
  link.href = url;
  link.target = '_blank';
  wrap.appendChild(link);
  return wrap;
}
let lbItems = [];
let lbIndex = 0;
function paintLightbox() {
  const box = document.querySelector('.lightbox');
  const item = lbItems[lbIndex];
  if (!box || !item) return;
  const image = box.querySelector('img');
  const video = box.querySelector('video');
  if (item.mediaType === 'video') {
    image.hidden = true;
    video.hidden = false;
    if (video.src !== item.url) video.src = item.url;
    video.controls = true;
  } else {
    video.pause();
    video.hidden = true;
    video.removeAttribute('src');
    image.hidden = false;
    image.src = item.url;
    image.alt = item.caption || '';
  }
  box.querySelector('.lb-cap').textContent = item.caption || '';
  const many = lbItems.length > 1;
  box.querySelector('.lb-prev').hidden = !many;
  box.querySelector('.lb-next').hidden = !many;
}
function shiftLightbox(step) {
  if (lbItems.length < 2) return;
  lbIndex = (lbIndex + step + lbItems.length) % lbItems.length;
  paintLightbox();
}
function openLightbox(src, alt) {
  lbItems = Array.isArray(src) ? src : [{ url: src, caption: alt || '', mediaType: 'image' }];
  lbIndex = Array.isArray(src) ? Math.max(0, Number(alt) || 0) : 0;
  let box = document.querySelector('.lightbox');
  if (!box) {
    box = el('div', 'lightbox');
    const close = el('button', 'lb-close', '×');
    const prev = el('button', 'lb-prev', '‹');
    const next = el('button', 'lb-next', '›');
    const image = el('img');
    const video = document.createElement('video');
    video.playsInline = true;
    const cap = el('p', 'lb-cap');
    close.addEventListener('click', () => { video.pause(); box.classList.remove('open'); });
    prev.addEventListener('click', () => shiftLightbox(-1));
    next.addEventListener('click', () => shiftLightbox(1));
    box.append(close, prev, next, image, video, cap);
    box.addEventListener('click', (event) => { if (event.target === box) { video.pause(); box.classList.remove('open'); } });
    let startX = 0;
    box.addEventListener('touchstart', (event) => {
      if (event.target.closest('video')) return;
      startX = event.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener('touchend', (event) => {
      if (event.target.closest('video')) return;
      const delta = event.changedTouches[0].clientX - startX;
      if (delta > 50) shiftLightbox(-1);
      if (delta < -50) shiftLightbox(1);
    });
    document.addEventListener('keydown', (event) => {
      if (!box.classList.contains('open')) return;
      if (event.key === 'Escape') { video.pause(); box.classList.remove('open'); }
      if (event.key === 'ArrowRight') shiftLightbox(1);
      if (event.key === 'ArrowLeft') shiftLightbox(-1);
    });
    document.body.appendChild(box);
  }
  box.classList.add('open');
  paintLightbox();
}
function compare(root) {
  const range = root.querySelector('input');
  const before = root.querySelector('.before');
  const handle = root.querySelector('.handle');
  const paint = () => {
    const value = `${range.value}%`;
    before.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`;
    handle.style.left = value;
  };
  range.addEventListener('input', paint);
  paint();
}
async function loadContent() {
  const response = await fetch('/api/content');
  if (!response.ok) throw new Error('content');
  return response.json();
}
function mountWhatsapp(number) {
  const digits = String(number || '').replace(/[^\d]/g, '');
  if (digits.length < 8) return;
  let link = document.querySelector('.whatsapp');
  if (!link) {
    link = document.createElement('a');
    link.className = 'whatsapp';
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'WhatsApp');
    link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5zM12 20.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.5.6.6-3.4-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.3a.5.5 0 0 0 0-.5l-.5-1.2c-.1-.4-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.2 3.7c.5.2 1 .4 1.4.5a3.4 3.4 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.2-.1-.4-.2z"/></svg>';
    document.body.appendChild(link);
  }
  link.href = `https://wa.me/${digits}`;
}
fetch('/api/content').then((response) => response.ok ? response.json() : null).then((data) => {
  mountWhatsapp(data?.contact?.whatsapp || data?.contact?.phone || '');
}).catch(() => {});

function mountMotion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = new WeakSet();
  const animateCount = (node) => {
    if (seen.has(node)) return;
    seen.add(node);
    const target = Number(node.dataset.count);
    const suffix = node.dataset.suffix || '';
    const locales = { sq: 'sq-AL', en: 'en-US', de: 'de-DE', fr: 'fr-FR' };
    const locale = locales[getLang()] || 'sq-AL';
    const paint = (value) => { node.textContent = `${Number(value).toLocaleString(locale)}${suffix}`; };
    if (reduce || !target) { paint(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 1100);
      paint(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      if (entry.target.dataset.count != null) animateCount(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  window.bdaObserve = (node) => io.observe(node);
  document.querySelectorAll('.reveal, .count').forEach((node) => io.observe(node));
  const bar = document.querySelector('.nav, .home-bar');
  const onScroll = () => {
    if (bar) bar.classList.toggle('solid', window.scrollY > 28);
    if (reduce) return;
    document.querySelectorAll('[data-parallax]').forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      const shift = Math.max(-36, Math.min(36, box.top * -0.06));
      img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.08)`;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
mountMotion();
