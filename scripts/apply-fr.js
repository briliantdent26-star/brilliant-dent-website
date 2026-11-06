const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const root = path.join(__dirname, '..');
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const pack = JSON.parse(fs.readFileSync(path.join(__dirname, 'fr-pack.json'), 'utf8'));
const email = process.env.BDA_ADMIN_EMAIL || 'briliantdent26@gmail.com';
const password = process.env.BDA_ADMIN_PASSWORD;
if (!password) {
  console.error('BDA_ADMIN_PASSWORD missing');
  process.exit(1);
}

function withFr(value, french) {
  const base = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return { ...base, fr: french };
}

async function main() {
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  const auth = await sb.auth.signInWithPassword({ email, password });
  if (auth.error) throw auth.error;

  for (const [slug, fields] of Object.entries(pack.clinics)) {
    const current = await sb.from('clinics').select('kicker,hero_title,hero_subtitle,about_title,about_body').eq('slug', slug).single();
    if (current.error) throw current.error;
    const row = current.data;
    const update = await sb.from('clinics').update({
      kicker: withFr(row.kicker, fields.kicker),
      hero_title: withFr(row.hero_title, fields.heroTitle),
      hero_subtitle: withFr(row.hero_subtitle, fields.heroSubtitle),
      about_title: withFr(row.about_title, fields.aboutTitle),
      about_body: withFr(row.about_body, fields.aboutBody)
    }).eq('slug', slug);
    if (update.error) throw update.error;
  }

  const services = await sb.from('services').select('id,title,description');
  if (services.error) throw services.error;
  let serviceCount = 0;
  for (const row of services.data) {
    const french = pack.services[row.id];
    if (!french) continue;
    const update = await sb.from('services').update({
      title: withFr(row.title, french.title),
      description: withFr(row.description, french.description)
    }).eq('id', row.id);
    if (update.error) throw update.error;
    serviceCount += 1;
  }

  const doctors = await sb.from('doctors').select('id,title,bio,education,experience,certifications,services');
  if (doctors.error) throw doctors.error;
  for (const row of doctors.data) {
    const french = pack.doctors[row.id];
    if (!french) continue;
    const servicesList = Array.isArray(row.services) ? row.services : [];
    const update = await sb.from('doctors').update({
      title: withFr(row.title, french.title),
      bio: withFr(row.bio, french.bio),
      education: withFr(row.education, french.education),
      experience: withFr(row.experience, french.experience),
      certifications: withFr(row.certifications, french.certifications),
      services: servicesList.map((item, index) => withFr(item, french.services[index] || item.fr || item.en || item.sq || ''))
    }).eq('id', row.id);
    if (update.error) throw update.error;
  }

  const contact = await sb.from('contact_info').select('address,hours').eq('id', 1).single();
  if (contact.error) throw contact.error;
  const hours = Array.isArray(contact.data.hours) ? contact.data.hours.map((row, index) => {
    const french = pack.contact.hours[index];
    if (!french) return row;
    return {
      days: withFr(row.days, french.days),
      time: withFr(row.time, french.time)
    };
  }) : [];
  const contactUpdate = await sb.from('contact_info').update({
    address: withFr(contact.data.address, pack.contact.address),
    hours
  }).eq('id', 1);
  if (contactUpdate.error) throw contactUpdate.error;

  const gallery = await sb.from('gallery_items').select('id,caption');
  if (gallery.error) throw gallery.error;
  let captionCount = 0;
  for (const row of gallery.data) {
    const french = pack.captions[row.caption?.sq];
    if (!french) continue;
    const update = await sb.from('gallery_items').update({ caption: withFr(row.caption, french) }).eq('id', row.id);
    if (update.error) throw update.error;
    captionCount += 1;
  }

  const social = await sb.from('social_links').select('id,label');
  if (social.error) throw social.error;
  let socialCount = 0;
  for (const row of social.data) {
    const french = pack.social[row.label?.sq];
    if (!french) continue;
    const update = await sb.from('social_links').update({ label: withFr(row.label, french) }).eq('id', row.id);
    if (update.error) throw update.error;
    socialCount += 1;
  }

  console.log(JSON.stringify({ services: serviceCount, doctors: doctors.data.length, captions: captionCount, social: socialCount }));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
