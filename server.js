const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const multer = require('multer');
const sharp = require('sharp');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL) {
  try {
    const fs = require('fs');
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
      }
    }
  } catch (err) {
    console.error(err);
  }
}

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 40 * 1024 * 1024 }
});

function sbAnon() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function bucketFor(clinic) {
  return clinic === 'aesthetic' ? 'aesthetic-media' : 'dental-media';
}

function storageRef(url) {
  const match = String(url || '').match(/\/storage\/v1\/object\/public\/(dental-media|aesthetic-media)\/(.+)$/);
  if (!match) return null;
  return { bucket: match[1], path: decodeURIComponent(match[2]) };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function asObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return {
    sq: String(value.sq || '').slice(0, 8000),
    en: String(value.en || '').slice(0, 8000),
    de: String(value.de || '').slice(0, 8000),
    fr: String(value.fr || '').slice(0, 8000)
  };
}

function clinicsOf(value) {
  const list = Array.isArray(value) ? value : [];
  return [...new Set(list.filter((item) => item === 'dent' || item === 'aesthetic'))];
}

const CLINIC_EMAIL = 'briliantdent26@gmail.com';

function bookingSlots() {
  const slots = [];
  for (let hour = 9; hour <= 19; hour += 1) {
    const hh = String(hour).padStart(2, '0');
    slots.push(`${hh}:00`, `${hh}:30`);
  }
  return slots;
}

function shapeTestimonial(item) {
  return {
    id: item.id,
    clinic: item.clinic,
    patientName: item.patient_name || '',
    anonymous: item.anonymous === true,
    rating: item.rating,
    body: item.body || {},
    reviewDate: item.review_date || '',
    visible: item.visible !== false,
    status: item.status || 'approved',
    sortOrder: item.sort_order
  };
}

function reviewPayload(body) {
  const rating = Number(body.rating);
  const clinic = body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
  const anonymous = body.anonymous === true;
  const patientName = String(body.patientName || '').trim().slice(0, 120);
  if (!anonymous && patientName.length < 2) {
    const error = new Error('Shkruani emrin ose shënojeni si anonim.');
    error.status = 400;
    throw error;
  }
  if (![1, 2, 3, 4, 5].includes(rating)) {
    const error = new Error('Zgjidhni vlerësimin nga 1 deri në 5.');
    error.status = 400;
    throw error;
  }
  const text = asObject(body.body);
  if (!String(text.sq || '').trim()) {
    const error = new Error('Shkruani tekstin e vlerësimit.');
    error.status = 400;
    throw error;
  }
  const reviewDate = String(body.reviewDate || '');
  const status = ['pending', 'approved', 'rejected'].includes(body.status) ? body.status : 'approved';
  return {
    clinic,
    patient_name: anonymous ? '' : patientName,
    anonymous,
    rating,
    body: text,
    review_date: /^\d{4}-\d{2}-\d{2}$/.test(reviewDate) ? reviewDate : null,
    status,
    visible: status === 'approved' && body.visible !== false
  };
}

async function sendBookingEmail(booking) {
  const pass = process.env.SMTP_PASS;
  const user = process.env.SMTP_USER || CLINIC_EMAIL;
  if (!pass) return false;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_PORT || '') === '465',
    auth: { user, pass }
  });
  const clinicName = booking.clinic === 'aesthetic' ? 'Brilliant Aesthetic' : 'Brilliant Dent';
  const lines = [
    `Klinikë: ${clinicName}`,
    `Mjeku: ${booking.doctorName}`,
    `Shërbimi: ${booking.serviceName}`,
    `Data: ${booking.preferredDate}`,
    `Ora: ${booking.preferredTime}`,
    `Pacienti: ${booking.fullName}`,
    `Telefoni: ${booking.phone}`,
    `Email: ${booking.email}`,
    booking.message ? `Mesazhi: ${booking.message}` : ''
  ].filter(Boolean);
  await transport.sendMail({
    from: `"Brilliant Dent" <${user}>`,
    to: CLINIC_EMAIL,
    replyTo: booking.email,
    subject: `Termin i ri — ${booking.fullName} — ${clinicName}`,
    text: lines.join('\n')
  });
  return true;
}

function shapeGallery(row) {
  return {
    id: row.id,
    clinic: row.clinic,
    placement: row.placement,
    mediaType: row.media_type,
    url: row.url,
    caption: row.caption || {},
    sortOrder: row.sort_order,
    visible: row.visible !== false
  };
}

function shapePair(row) {
  return {
    id: row.id,
    clinic: row.clinic,
    beforeUrl: row.before_url,
    afterUrl: row.after_url,
    caption: row.caption || {},
    sortOrder: row.sort_order
  };
}

function shapeDoctor(row, gallery) {
  return {
    id: row.id,
    slug: row.slug,
    fullName: row.full_name,
    title: row.title || {},
    bio: row.bio || {},
    education: row.education || {},
    experience: row.experience || {},
    certifications: row.certifications || {},
    email: row.email || '',
    phone: row.phone || '',
    instagram: row.instagram || '',
    facebook: row.facebook || '',
    tiktok: row.tiktok || '',
    photo: row.photo || '',
    clinics: row.clinics || [],
    theme: row.theme || 'dent',
    services: Array.isArray(row.services) ? row.services : [],
    visible: row.visible !== false,
    sortOrder: row.sort_order || 0,
    gallery: (gallery || []).map((item) => ({
      id: item.id,
      mediaType: item.media_type,
      url: item.url || '',
      beforeUrl: item.before_url || '',
      afterUrl: item.after_url || '',
      caption: item.caption || {},
      sortOrder: item.sort_order || 0
    }))
  };
}

async function loadBundle(sb) {
  const [clinics, doctors, services, gallery, pairs, contact, social, work, testimonials] = await Promise.all([
    sb.from('clinics').select('*'),
    sb.from('doctors').select('*').order('sort_order', { ascending: true }),
    sb.from('services').select('*').order('sort_order', { ascending: true }),
    sb.from('gallery_items').select('*').order('sort_order', { ascending: true }),
    sb.from('before_after').select('*').order('sort_order', { ascending: true }),
    sb.from('contact_info').select('*').eq('id', 1).maybeSingle(),
    sb.from('social_links').select('*').order('sort_order', { ascending: true }),
    sb.from('doctor_gallery').select('*').order('sort_order', { ascending: true }),
    sb.from('testimonials').select('*').order('sort_order', { ascending: true })
  ]);
  const failed = [clinics, doctors, services, gallery, pairs, contact, social, work, testimonials].find((item) => item.error);
  if (failed) throw new Error(failed.error.message);
  return {
    clinics: clinics.data || [],
    doctors: doctors.data || [],
    services: services.data || [],
    gallery: gallery.data || [],
    pairs: pairs.data || [],
    contact: contact.data,
    social: social.data || [],
    work: work.data || [],
    testimonials: testimonials.data || []
  };
}

function present(bundle, { includeHidden = false } = {}) {
  const doctors = bundle.doctors
    .filter((doctor) => includeHidden || doctor.visible !== false)
    .map((doctor) => shapeDoctor(doctor, bundle.work.filter((item) => item.doctor_id === doctor.id)));
  const testimonials = (bundle.testimonials || [])
    .filter((item) => includeHidden || (item.visible !== false && (item.status || 'approved') === 'approved'))
    .map(shapeTestimonial)
    .sort((a, b) => String(b.reviewDate).localeCompare(String(a.reviewDate)));
  const pack = (slug) => {
    const clinic = bundle.clinics.find((item) => item.slug === slug) || {};
    return {
      slug,
      kicker: clinic.kicker || {},
      heroTitle: clinic.hero_title || {},
      heroSubtitle: clinic.hero_subtitle || {},
      aboutTitle: clinic.about_title || {},
      aboutBody: clinic.about_body || {},
      heroVideoUrl: clinic.hero_video_url || '',
      services: bundle.services
        .filter((item) => item.clinic === slug)
        .map((item) => ({
          id: item.id,
          icon: item.icon,
          title: item.title || {},
          description: item.description || {},
          sortOrder: item.sort_order
        })),
      gallery: bundle.gallery
        .filter((item) => item.clinic === slug && (includeHidden || item.visible !== false))
        .map(shapeGallery),
      beforeAfter: bundle.pairs.filter((item) => item.clinic === slug).map(shapePair),
      doctors: doctors.filter((doctor) => (doctor.clinics || []).includes(slug)),
      testimonials: testimonials.filter((item) => item.clinic === slug),
      social: bundle.social
        .filter((item) => item.clinic === slug)
        .map((item) => ({
          id: item.id,
          clinic: item.clinic,
          network: item.network,
          label: item.label || {},
          url: item.url,
          sortOrder: item.sort_order
        }))
    };
  };
  return {
    contact: bundle.contact
      ? {
          address: bundle.contact.address || {},
          phone: bundle.contact.phone || '',
          phoneSecondary: bundle.contact.phone_secondary || '',
          email: bundle.contact.email || '',
          whatsapp: bundle.contact.whatsapp || '',
          hours: bundle.contact.hours || [],
          mapQuery: bundle.contact.map_query || ''
        }
      : null,
    dent: pack('dent'),
    aesthetic: pack('aesthetic'),
    doctors,
    testimonials
  };
}

async function removeStored(sb, url) {
  const ref = storageRef(url);
  if (!ref) return;
  await sb.storage.from(ref.bucket).remove([ref.path]);
}

async function storeFile(sb, bucket, file) {
  const image = /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype);
  const video = /^video\/(mp4|webm)$/.test(file.mimetype);
  if (!image && !video) {
    const error = new Error('Lejohen vetëm foto JPG, PNG, WEBP ose video MP4/WEBM.');
    error.status = 400;
    throw error;
  }
  let buffer = file.buffer;
  let contentType = file.mimetype;
  let ext = image ? 'webp' : (file.mimetype === 'video/webm' ? 'webm' : 'mp4');
  if (image && file.mimetype !== 'image/gif') {
    buffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toBuffer();
    contentType = 'image/webp';
  }
  const objectPath = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(objectPath, buffer, { contentType, upsert: false });
  if (error) throw error;
  return sb.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

function doctorPayload(body, fallbackSlug) {
  const clinics = clinicsOf(body.clinics);
  if (!clinics.length) {
    const error = new Error('Zgjidhni të paktën një klinikë.');
    error.status = 400;
    throw error;
  }
  const fullName = String(body.fullName || '').trim().slice(0, 140);
  if (fullName.length < 2) {
    const error = new Error('Shkruani emrin e plotë.');
    error.status = 400;
    throw error;
  }
  const theme = body.theme === 'aesthetic' || body.theme === 'dent' ? body.theme : clinics[0];
  const services = Array.isArray(body.services)
    ? body.services.slice(0, 24).map((item) => asObject(item)).filter((item) => item.sq || item.en || item.de || item.fr)
    : [];
  return {
    slug: slugify(body.slug || fallbackSlug || fullName),
    full_name: fullName,
    title: asObject(body.title),
    bio: asObject(body.bio),
    education: asObject(body.education),
    experience: asObject(body.experience),
    certifications: asObject(body.certifications),
    email: String(body.email || '').trim().slice(0, 160),
    phone: String(body.phone || '').trim().slice(0, 40),
    instagram: String(body.instagram || '').trim().slice(0, 300),
    facebook: String(body.facebook || '').trim().slice(0, 300),
    tiktok: String(body.tiktok || '').trim().slice(0, 300),
    clinics,
    theme: clinics.includes(theme) ? theme : clinics[0],
    services,
    visible: body.visible !== false
  };
}

const app = express();
app.use(compression());
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'brilliant-dent-local',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 12
  }
}));

const loginAttempts = new Map();
const reviewAttempts = new Map();

const SITE = 'https://briliantdent.com';

function escHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function businessJson(kind) {
  const hours = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: day,
    opens: '09:00',
    closes: '20:00'
  }));
  const shared = {
    email: 'briliantdent26@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rruga Riza Goga 94',
      addressLocality: 'Ferizaj',
      addressCountry: 'XK'
    },
    geo: { '@type': 'GeoCoordinates', latitude: 42.3702, longitude: 21.1553 },
    openingHours: 'Mo-Sa 09:00-20:00',
    openingHoursSpecification: hours,
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+38344654129', contactType: 'customer service', availableLanguage: ['sq', 'en', 'de', 'fr'] },
      { '@type': 'ContactPoint', telephone: '+38344417318', contactType: 'customer service', availableLanguage: ['sq', 'en', 'de', 'fr'] }
    ]
  };
  const dent = {
    '@type': ['LocalBusiness', 'DentalClinic'],
    name: 'Brilliant Dent Clinic',
    url: `${SITE}/dent`,
    image: `${SITE}/media/dent/hero-1.webp`,
    telephone: '+38344654129',
    ...shared
  };
  const aesthetic = {
    '@type': ['LocalBusiness', 'MedicalBusiness'],
    name: 'Brilliant Aesthetic Clinic',
    url: `${SITE}/estetike`,
    image: `${SITE}/media/aes/hero-1.webp`,
    telephone: '+38344417318',
    ...shared
  };
  if (kind === 'dent') return { '@context': 'https://schema.org', ...dent };
  if (kind === 'aesthetic') return { '@context': 'https://schema.org', ...aesthetic };
  return { '@context': 'https://schema.org', '@graph': [dent, aesthetic] };
}

function seoBlock(kind, canonicalPath) {
  const pages = {
    home: {
      title: 'Brilliant Dent & Aesthetic Clinic | Ferizaj, Kosovë',
      description: 'Brilliant Dent & Aesthetic Clinic në Ferizaj — stomatologji moderne dhe estetikë fytyre. Rruga Riza Goga 94. E hënë–e shtunë, 09:00–20:00.',
      image: `${SITE}/media/dent/hero-1.webp`
    },
    dent: {
      title: 'Brilliant Dent Clinic | Stomatologji Moderne në Ferizaj, Kosovë',
      description: 'Implantologji, Smile Design dhe stomatologji me lazer në Ferizaj. Dr. Burim Buzhala. Rruga Riza Goga 94. E hënë–e shtunë, 09:00–20:00.',
      image: `${SITE}/media/dent/hero-1.webp`
    },
    aesthetic: {
      title: 'Brilliant Aesthetic Clinic | Estetikë Fytyre në Ferizaj, Kosovë',
      description: 'Estetikë fytyre në Ferizaj: PRX-T33, buzë dhe kujdes lëkure me Vjollca S. Buzhala. Rruga Riza Goga 94. E hënë–e shtunë, 09:00–20:00.',
      image: `${SITE}/media/aes/hero-1.webp`
    },
    doctor: {
      title: 'Profili | Brilliant Dent',
      description: 'Profili i stafit në Brilliant Dent & Aesthetic Clinic, Rruga Riza Goga 94, Ferizaj.',
      image: `${SITE}/media/dent/hero-1.webp`
    }
  };
  const info = pages[kind] || pages.home;
  const canonical = `${SITE}${canonicalPath}`;
  const json = JSON.stringify(businessJson(kind === 'home' || kind === 'doctor' ? 'both' : kind)).replace(/</g, '\\u003c');
  return [
    `<title>${escHtml(info.title)}</title>`,
    `<meta name="description" content="${escHtml(info.description)}">`,
    `<meta name="keywords" content="stomatolog Ferizaj, dentist Ferizaj, implantologji, estetikë fytyre, Brilliant Dent, Brilliant Aesthetic">`,
    `<link rel="canonical" href="${escHtml(canonical)}">`,
    `<meta property="og:title" content="${escHtml(info.title)}">`,
    `<meta property="og:description" content="${escHtml(info.description)}">`,
    `<meta property="og:image" content="${escHtml(info.image)}">`,
    `<meta property="og:url" content="${escHtml(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escHtml(info.title)}">`,
    `<meta name="twitter:description" content="${escHtml(info.description)}">`,
    `<meta name="twitter:image" content="${escHtml(info.image)}">`,
    `<script type="application/ld+json">${json}</script>`
  ].join('\n');
}

function page(file, kind) {
  return (req, res) => {
    if (!kind) return res.sendFile(path.join(publicDir, file));
    let html = fs.readFileSync(path.join(publicDir, file), 'utf8');
    html = html.replace(/<title>[^<]*<\/title>/, '');
    const canonicalPath = kind === 'home' ? '/' : req.path;
    html = html.replace('</head>', `${seoBlock(kind, canonicalPath)}\n</head>`);
    res.type('html').send(html);
  };
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/content', async (req, res) => {
  try {
    const bundle = await loadBundle(sbAnon());
    res.json(present(bundle));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Përmbajtja nuk u ngarkua.' });
  }
});

app.get('/api/doctors/:slug', async (req, res) => {
  try {
    const bundle = await loadBundle(sbAnon());
    const doctor = present(bundle).doctors.find((item) => item.slug === req.params.slug);
    if (!doctor) return res.status(404).json({ error: 'Profili nuk u gjet.' });
    res.json({ doctor, contact: present(bundle).contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profili nuk u ngarkua.' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    if (req.body.website) return res.json({ ok: true });
    const clinic = req.body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
    const fullName = String(req.body.fullName || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim();
    const preferred = String(req.body.preferredDate || '');
    const preferredTime = String(req.body.preferredTime || '');
    const serviceName = String(req.body.serviceName || '').trim();
    if (fullName.length < 2 || phone.length < 6) {
      return res.status(400).json({ error: 'Shkruani emrin dhe telefonin.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email-i nuk është i vlefshëm.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferred)) {
      return res.status(400).json({ error: 'Zgjidhni datën.' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(`${preferred}T12:00:00`);
    if (chosen < today) return res.status(400).json({ error: 'Data nuk mund të jetë në të kaluarën.' });
    if (chosen.getDay() === 0) return res.status(400).json({ error: 'Të dielën klinika është e mbyllur.' });
    if (!bookingSlots().includes(preferredTime)) return res.status(400).json({ error: 'Zgjidhni orarin.' });
    const page = present(await loadBundle(sbAnon()))[clinic];
    const doctor = page.doctors.find((item) => item.id === String(req.body.doctorId || ''));
    if (!doctor) return res.status(400).json({ error: 'Zgjidhni mjekun.' });
    const serviceOk = page.services.some((service) => ['sq', 'en', 'de', 'fr'].some((lang) => String(service.title?.[lang] || '') === serviceName));
    if (!serviceOk) return res.status(400).json({ error: 'Zgjidhni shërbimin.' });
    const booking = {
      clinic,
      fullName: fullName.slice(0, 140),
      phone: phone.slice(0, 40),
      email: email.slice(0, 160),
      serviceName: serviceName.slice(0, 180),
      doctorName: doctor.fullName,
      preferredDate: preferred,
      preferredTime,
      message: String(req.body.message || '').slice(0, 2000)
    };
    const { error } = await sbAnon().from('appointments').insert({
      clinic: booking.clinic,
      full_name: booking.fullName,
      phone: booking.phone,
      email: booking.email,
      service_name: booking.serviceName,
      doctor_name: booking.doctorName,
      doctor_id: doctor.id,
      preferred_date: booking.preferredDate,
      preferred_time: booking.preferredTime,
      message: booking.message
    });
    if (error) throw error;
    let emailSent = false;
    try {
      emailSent = await sendBookingEmail(booking);
    } catch (mailError) {
      console.error(mailError);
    }
    res.json({ ok: true, emailSent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kërkesa nuk u ruajt. Provoni përsëri ose na telefononi.' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    if (req.body.website) return res.json({ ok: true });
    const now = Date.now();
    const key = req.ip;
    const hits = (reviewAttempts.get(key) || []).filter((time) => now - time < 10 * 60 * 1000);
    if (hits.length >= 5) return res.status(429).json({ error: 'Mund të dërgoni deri në 5 vlerësime në 10 minuta.' });
    const clinic = req.body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
    const anonymous = req.body.anonymous === true || req.body.anonymous === 'true';
    const patientName = String(req.body.patientName || '').trim();
    const text = String(req.body.text || '').trim();
    const rating = Number(req.body.rating);
    if (!anonymous && patientName.length < 2) return res.status(400).json({ error: 'Shkruani emrin ose zgjidhni anonim.' });
    if (![1, 2, 3, 4, 5].includes(rating)) return res.status(400).json({ error: 'Zgjidhni vlerësimin nga 1 deri në 5.' });
    if (text.length < 8) return res.status(400).json({ error: 'Shkruani vlerësimin.' });
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await sbAnon().from('testimonials').insert({
      clinic,
      patient_name: anonymous ? '' : patientName.slice(0, 120),
      anonymous,
      rating,
      body: { sq: text.slice(0, 2000), en: text.slice(0, 2000), de: text.slice(0, 2000), fr: text.slice(0, 2000) },
      review_date: today,
      status: 'pending',
      visible: false
    });
    if (error) throw error;
    hits.push(now);
    reviewAttempts.set(key, hits);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Vlerësimi nuk u dërgua. Provoni përsëri.' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const key = req.ip;
  const now = Date.now();
  const attempt = loginAttempts.get(key) || { count: 0, reset: now + 10 * 60 * 1000 };
  if (now > attempt.reset) {
    attempt.count = 0;
    attempt.reset = now + 10 * 60 * 1000;
  }
  if (attempt.count >= 8) return res.status(429).json({ error: 'Shumë përpjekje. Prisni pak minuta.' });
  const { data, error } = await sbAnon().auth.signInWithPassword({
    email: String(req.body.email || '').trim(),
    password: String(req.body.password || '')
  });
  if (error || !data.session) {
    attempt.count += 1;
    loginAttempts.set(key, attempt);
    return res.status(401).json({ error: 'Email-i ose fjalëkalimi nuk përputhet.' });
  }
  loginAttempts.delete(key);
  req.session.access_token = data.session.access_token;
  req.session.refresh_token = data.session.refresh_token;
  res.json({ ok: true, email: data.user.email });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

async function requireAdmin(req, res, next) {
  try {
    if (!req.session.access_token || !req.session.refresh_token) {
      return res.status(401).json({ error: 'Duhet të hyni.' });
    }
    const sb = sbAnon();
    const { data, error } = await sb.auth.setSession({
      access_token: req.session.access_token,
      refresh_token: req.session.refresh_token
    });
    if (error || !data.session) return res.status(401).json({ error: 'Seanca ka skaduar.' });
    req.session.access_token = data.session.access_token;
    req.session.refresh_token = data.session.refresh_token;
    req.sb = sb;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Seanca ka skaduar.' });
  }
}

app.get('/api/admin/content', requireAdmin, async (req, res) => {
  try {
    const bundle = await loadBundle(req.sb);
    const appointments = await req.sb.from('appointments').select('*').order('created_at', { ascending: false }).limit(200);
    if (appointments.error) throw appointments.error;
    res.json({
      ...present(bundle, { includeHidden: true }),
      appointments: appointments.data || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Paneli nuk u ngarkua.' });
  }
});

app.put('/api/admin/clinics/:slug', requireAdmin, async (req, res) => {
  const slug = req.params.slug === 'aesthetic' ? 'aesthetic' : 'dent';
  const { error } = await req.sb.from('clinics').update({
    kicker: asObject(req.body.kicker),
    hero_title: asObject(req.body.heroTitle),
    hero_subtitle: asObject(req.body.heroSubtitle),
    about_title: asObject(req.body.aboutTitle),
    about_body: asObject(req.body.aboutBody),
    hero_video_url: String(req.body.heroVideoUrl || '').trim().slice(0, 400)
  }).eq('slug', slug);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.put('/api/admin/contact', requireAdmin, async (req, res) => {
  const hours = Array.isArray(req.body.hours) ? req.body.hours.slice(0, 8).map((row) => ({
    days: asObject(row.days),
    time: asObject(typeof row.time === 'string' ? { sq: row.time, en: row.time, de: row.time, fr: row.time } : row.time)
  })) : [];
  const { error } = await req.sb.from('contact_info').update({
    address: asObject(req.body.address),
    phone: String(req.body.phone || '').slice(0, 40),
    phone_secondary: String(req.body.phoneSecondary || '').slice(0, 40),
    email: String(req.body.email || '').slice(0, 160),
    whatsapp: String(req.body.whatsapp || '').slice(0, 40),
    hours,
    map_query: String(req.body.mapQuery || '').slice(0, 180)
  }).eq('id', 1);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/services', requireAdmin, async (req, res) => {
  const clinic = req.body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
  const { data, error } = await req.sb.from('services').insert({
    clinic,
    icon: String(req.body.icon || 'care').slice(0, 40),
    title: asObject(req.body.title),
    description: asObject(req.body.description),
    sort_order: Number(req.body.sortOrder) || 0
  }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ service: data });
});

app.put('/api/admin/services/:id', requireAdmin, async (req, res) => {
  const { error } = await req.sb.from('services').update({
    icon: String(req.body.icon || 'care').slice(0, 40),
    title: asObject(req.body.title),
    description: asObject(req.body.description),
    sort_order: Number(req.body.sortOrder) || 0
  }).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/admin/services/:id', requireAdmin, async (req, res) => {
  const { error } = await req.sb.from('services').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/social', requireAdmin, async (req, res) => {
  const clinic = req.body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
  const { data, error } = await req.sb.from('social_links').insert({
    clinic,
    network: String(req.body.network || 'instagram').slice(0, 30),
    label: asObject(req.body.label),
    url: String(req.body.url || '').trim().slice(0, 400),
    sort_order: Number(req.body.sortOrder) || 0
  }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ link: data });
});

app.put('/api/admin/social/:id', requireAdmin, async (req, res) => {
  const { error } = await req.sb.from('social_links').update({
    network: String(req.body.network || 'instagram').slice(0, 30),
    label: asObject(req.body.label),
    url: String(req.body.url || '').trim().slice(0, 400)
  }).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/admin/social/:id', requireAdmin, async (req, res) => {
  const { error } = await req.sb.from('social_links').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/gallery', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const clinic = req.body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
    const placement = req.body.placement === 'hero' ? 'hero' : 'gallery';
    let mediaType = 'image';
    let url = String(req.body.url || '').trim();
    if (req.file) {
      mediaType = /^video\//.test(req.file.mimetype) ? 'video' : 'image';
      url = await storeFile(req.sb, bucketFor(clinic), req.file);
    } else if (/tiktok\.com/i.test(url)) mediaType = 'tiktok';
    else if (/instagram\.com/i.test(url)) mediaType = 'instagram';
    else if (!url) return res.status(400).json({ error: 'Shtoni një foto ose një lidhje videoje.' });
    const { data, error } = await req.sb.from('gallery_items').insert({
      clinic,
      placement,
      media_type: mediaType,
      url: url.slice(0, 800),
      caption: asObject(JSON.parse(req.body.caption || '{}')),
      sort_order: Number(req.body.sortOrder) || 0
    }).select('*').single();
    if (error) throw error;
    res.json({ item: shapeGallery(data) });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ error: err.message || 'Ngarkimi dështoi.' });
  }
});

app.put('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  const patch = {};
  if (req.body.caption) patch.caption = asObject(req.body.caption);
  if (req.body.sortOrder != null) patch.sort_order = Number(req.body.sortOrder) || 0;
  if (typeof req.body.visible === 'boolean') patch.visible = req.body.visible;
  const { error } = await req.sb.from('gallery_items').update(patch).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/gallery/:id/file', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Zgjidhni një foto ose video.' });
    const existing = await req.sb.from('gallery_items').select('url, clinic').eq('id', req.params.id).maybeSingle();
    if (!existing.data) return res.status(404).json({ error: 'Nuk u gjet.' });
    const mediaType = /^video\//.test(req.file.mimetype) ? 'video' : 'image';
    const url = await storeFile(req.sb, bucketFor(existing.data.clinic), req.file);
    await removeStored(req.sb, existing.data.url);
    const { error } = await req.sb.from('gallery_items').update({ url, media_type: mediaType }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ url, mediaType });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ error: err.message || 'Zëvendësimi dështoi.' });
  }
});

app.post('/api/admin/gallery-order', requireAdmin, async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  for (let index = 0; index < ids.length; index += 1) {
    const { error } = await req.sb.from('gallery_items').update({ sort_order: index }).eq('id', ids[index]);
    if (error) return res.status(400).json({ error: error.message });
  }
  res.json({ ok: true });
});

app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
  const existing = await req.sb.from('gallery_items').select('url').eq('id', req.params.id).maybeSingle();
  if (existing.data) await removeStored(req.sb, existing.data.url);
  const { error } = await req.sb.from('gallery_items').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/before-after', requireAdmin, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), async (req, res) => {
  try {
    const clinic = req.body.clinic === 'aesthetic' ? 'aesthetic' : 'dent';
    const before = req.files?.before?.[0];
    const after = req.files?.after?.[0];
    if (!before || !after) return res.status(400).json({ error: 'Ngarkoni foton para dhe foton pas.' });
    const beforeUrl = await storeFile(req.sb, bucketFor(clinic), before);
    const afterUrl = await storeFile(req.sb, bucketFor(clinic), after);
    const { data, error } = await req.sb.from('before_after').insert({
      clinic,
      before_url: beforeUrl,
      after_url: afterUrl,
      caption: asObject(JSON.parse(req.body.caption || '{}')),
      sort_order: Number(req.body.sortOrder) || 0
    }).select('*').single();
    if (error) throw error;
    res.json({ item: shapePair(data) });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ error: err.message || 'Ngarkimi dështoi.' });
  }
});

app.delete('/api/admin/before-after/:id', requireAdmin, async (req, res) => {
  const existing = await req.sb.from('before_after').select('before_url, after_url').eq('id', req.params.id).maybeSingle();
  if (existing.data) {
    await removeStored(req.sb, existing.data.before_url);
    await removeStored(req.sb, existing.data.after_url);
  }
  const { error } = await req.sb.from('before_after').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/doctors', requireAdmin, async (req, res) => {
  try {
    const row = doctorPayload(req.body);
    const maxOrder = await req.sb.from('doctors').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
    row.sort_order = (maxOrder.data?.sort_order || 0) + 1;
    const { data, error } = await req.sb.from('doctors').insert(row).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ doctor: shapeDoctor(data, []) });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

app.put('/api/admin/doctors/:id', requireAdmin, async (req, res) => {
  try {
    const row = doctorPayload(req.body);
    const { data, error } = await req.sb.from('doctors').update(row).eq('id', req.params.id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ doctor: shapeDoctor(data, []) });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

app.post('/api/admin/doctors/reorder', requireAdmin, async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  for (let index = 0; index < ids.length; index += 1) {
    const { error } = await req.sb.from('doctors').update({ sort_order: index }).eq('id', ids[index]);
    if (error) return res.status(400).json({ error: error.message });
  }
  res.json({ ok: true });
});

app.delete('/api/admin/doctors/:id', requireAdmin, async (req, res) => {
  const existing = await req.sb.from('doctors').select('photo').eq('id', req.params.id).maybeSingle();
  const work = await req.sb.from('doctor_gallery').select('url, before_url, after_url').eq('doctor_id', req.params.id);
  if (existing.data) await removeStored(req.sb, existing.data.photo);
  for (const item of work.data || []) {
    await removeStored(req.sb, item.url);
    await removeStored(req.sb, item.before_url);
    await removeStored(req.sb, item.after_url);
  }
  const { error } = await req.sb.from('doctors').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/doctors/:id/photo', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Zgjidhni një foto.' });
    const current = await req.sb.from('doctors').select('photo, theme').eq('id', req.params.id).maybeSingle();
    if (!current.data) return res.status(404).json({ error: 'Mjeku nuk u gjet.' });
    const url = await storeFile(req.sb, bucketFor(current.data.theme), req.file);
    await removeStored(req.sb, current.data.photo);
    const { error } = await req.sb.from('doctors').update({ photo: url }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ photo: url });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ error: err.message || 'Fotoja nuk u ngarkua.' });
  }
});

app.post('/api/admin/doctors/:id/gallery', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const doctor = await req.sb.from('doctors').select('theme').eq('id', req.params.id).maybeSingle();
    if (!doctor.data) return res.status(404).json({ error: 'Mjeku nuk u gjet.' });
    if (!req.file) return res.status(400).json({ error: 'Zgjidhni një foto.' });
    const url = await storeFile(req.sb, bucketFor(doctor.data.theme), req.file);
    const { data, error } = await req.sb.from('doctor_gallery').insert({
      doctor_id: req.params.id,
      media_type: 'image',
      url,
      caption: asObject(JSON.parse(req.body.caption || '{}'))
    }).select('*').single();
    if (error) throw error;
    res.json({ item: data });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ error: err.message || 'Ngarkimi dështoi.' });
  }
});

app.post('/api/admin/doctors/:id/pair', requireAdmin, upload.fields([{ name: 'before', maxCount: 1 }, { name: 'after', maxCount: 1 }]), async (req, res) => {
  try {
    const doctor = await req.sb.from('doctors').select('theme').eq('id', req.params.id).maybeSingle();
    if (!doctor.data) return res.status(404).json({ error: 'Mjeku nuk u gjet.' });
    const before = req.files?.before?.[0];
    const after = req.files?.after?.[0];
    if (!before || !after) return res.status(400).json({ error: 'Ngarkoni foton para dhe foton pas.' });
    const beforeUrl = await storeFile(req.sb, bucketFor(doctor.data.theme), before);
    const afterUrl = await storeFile(req.sb, bucketFor(doctor.data.theme), after);
    const { data, error } = await req.sb.from('doctor_gallery').insert({
      doctor_id: req.params.id,
      media_type: 'pair',
      before_url: beforeUrl,
      after_url: afterUrl,
      caption: asObject(JSON.parse(req.body.caption || '{}'))
    }).select('*').single();
    if (error) throw error;
    res.json({ item: data });
  } catch (err) {
    console.error(err);
    res.status(err.status || 400).json({ error: err.message || 'Ngarkimi dështoi.' });
  }
});

app.delete('/api/admin/doctor-gallery/:id', requireAdmin, async (req, res) => {
  const existing = await req.sb.from('doctor_gallery').select('url, before_url, after_url').eq('id', req.params.id).maybeSingle();
  if (existing.data) {
    await removeStored(req.sb, existing.data.url);
    await removeStored(req.sb, existing.data.before_url);
    await removeStored(req.sb, existing.data.after_url);
  }
  const { error } = await req.sb.from('doctor_gallery').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.patch('/api/admin/appointments/:id', requireAdmin, async (req, res) => {
  const status = ['new', 'confirmed', 'cancelled', 'contacted', 'closed'].includes(req.body.status) ? req.body.status : 'new';
  const { error } = await req.sb.from('appointments').update({ status }).eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/testimonials', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await req.sb.from('testimonials').insert(reviewPayload(req.body)).select('*').single();
    if (error) throw error;
    res.json({ item: shapeTestimonial(data) });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || 'Vlerësimi nuk u ruajt.' });
  }
});

app.put('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await req.sb.from('testimonials').update(reviewPayload(req.body)).eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || 'Vlerësimi nuk u ruajt.' });
  }
});

app.delete('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
  const { error } = await req.sb.from('testimonials').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.delete('/api/admin/appointments/:id', requireAdmin, async (req, res) => {
  const { error } = await req.sb.from('appointments').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.post('/api/admin/password', requireAdmin, async (req, res) => {
  const password = String(req.body.password || '');
  if (password.length < 8) return res.status(400).json({ error: 'Fjalëkalimi duhet të ketë të paktën 8 shenja.' });
  const { error } = await req.sb.auth.updateUser({ password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/', page('index.html', 'home'));
app.get('/dent', page('clinic.html', 'dent'));
app.get('/estetike', page('clinic.html', 'aesthetic'));
app.get('/doktori/:slug', page('doctor.html', 'doctor'));
app.get('/admin', page('admin.html'));
app.use(express.static(publicDir));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Brilliant Dent listening on ${PORT}`);
});
