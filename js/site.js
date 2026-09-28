// OPPIA ROBOTICS — site betiği
// Takım, robotlar, sayaçlar, ödüller ve galeri içerikleri content/*.json dosyalarından okunur.
// Bu dosyalar yönetim panelinden (/admin) düzenlenebilir.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// HTML'e yazılan her metin kaçışlanır
function esc(value){
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function loadJSON(path){
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(path + ' yüklenemedi (' + res.status + ')');
  return res.json();
}

// ---------------------------------------------------------
// TAKIM ÜYELERİ
// ---------------------------------------------------------
function memberCard(m, extraClass){
  const edu = (m.education || []).map((e, i) => {
    const dept = e.department ? `<p class="mt-2 text-[11px] text-oppia-cyan font-medium">${esc(e.department)}</p>` : '';
    const school = e.school ? `<p class="${e.department ? 'mt-1' : 'mt-2'} text-[11px] text-oppia-muted leading-relaxed">${esc(e.school)}</p>` : '';
    return dept + school;
  }).join('');
  const initials = String(m.name || '').split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const photo = m.photo
    ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" class="w-full h-full object-cover rounded-full" loading="lazy">`
    : `<div class="w-full h-full bg-oppia-panel2 flex items-center justify-center"><span class="font-display font-bold text-xl text-oppia-cyan" aria-hidden="true">${esc(initials)}</span></div>`;
  const role = m.role
    ? `<p class="mt-2 inline-block px-2 py-0.5 border border-oppia-amber/50 text-[10px] font-mono font-semibold uppercase tracking-wide text-oppia-amber">${esc(m.role)}</p>`
    : '';
  return `
    <div class="corners bg-oppia-panel border border-oppia-line p-6 text-center hover:border-oppia-cyan/60 transition-colors ${extraClass || ''}">
      <div class="mx-auto w-20 h-20 rounded-full overflow-hidden border border-oppia-line mb-4">${photo}</div>
      <h3 class="font-display font-semibold text-sm">${esc(m.name)}</h3>
      ${role}
      ${edu}
    </div>`;
}

function renderTeam(data){
  const members = data.members || [];
  const featured = members.filter(m => m.featured);
  const others = members.filter(m => !m.featured);
  const featuredEl = document.getElementById('team-featured');
  const othersEl = document.getElementById('team-members');
  featuredEl.innerHTML = featured.map(m => memberCard(m, 'w-[calc(50%-0.625rem)] sm:w-52')).join('');
  featuredEl.classList.toggle('hidden', featured.length === 0);
  othersEl.innerHTML = others.map(m => memberCard(m)).join('');
  othersEl.classList.toggle('mt-5', featured.length > 0);
  othersEl.classList.toggle('mt-12', featured.length === 0);
}

// ---------------------------------------------------------
// ROBOTLAR
// ---------------------------------------------------------
function renderRobots(data){
  const robots = data.robots || [];
  const el = document.getElementById('robots-grid');
  el.innerHTML = robots.map((r, i) => {
    // Son satırda tek kart kalırsa geniş ekranda ortala
    const center = (i === robots.length - 1 && robots.length % 3 === 1 && robots.length > 1) ? ' lg:col-start-2' : '';
    const title = r.name ? `${r.code} "${r.name}"` : r.code;
    const features = (r.features || []).length
      ? `<ul class="mt-4 space-y-1.5 text-xs text-oppia-muted">${r.features.map(f => `<li class="flex gap-2"><span class="text-oppia-cyan">▸</span>${esc(f)}</li>`).join('')}</ul>`
      : '';
    return `
      <article class="corners bg-oppia-panel border border-oppia-line overflow-hidden hover:border-oppia-cyan/60 transition-colors${center}">
        <div class="relative aspect-[4/3] bg-oppia-panel2 border-b border-oppia-line">
          ${r.image ? `<img src="${esc(r.image)}" alt="${esc(r.alt || title)}" class="w-full h-full object-cover" loading="lazy">` : ''}
        </div>
        <div class="p-6">
          <span class="text-xs font-mono text-oppia-amber">${esc(r.code)}</span>
          <h3 class="font-display font-bold text-lg mt-2">${esc(title)}</h3>
          ${r.competition ? `<p class="mt-1 text-xs text-oppia-muted">${esc(r.competition)}</p>` : ''}
          ${r.result ? `<p class="mt-1 text-xs text-oppia-cyan font-medium">${esc(r.result)}</p>` : ''}
          ${r.description ? `<p class="mt-3 text-sm text-oppia-muted leading-relaxed">${esc(r.description)}</p>` : ''}
          ${features}
        </div>
      </article>`;
  }).join('');
}

// ---------------------------------------------------------
// SAYAÇLAR
// ---------------------------------------------------------
function renderStats(data){
  const stats = data.stats || [];
  const el = document.getElementById('stats-grid');
  const cols = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[stats.length] || 'sm:grid-cols-3';
  el.classList.remove('sm:grid-cols-3');
  el.classList.add(cols);
  el.innerHTML = stats.map(s => `
    <div class="p-8 text-center">
      <div class="font-display font-black text-4xl sm:text-5xl text-oppia-cyan glow-cyan"><span class="counter" data-target="${parseInt(s.value, 10) || 0}">0</span></div>
      <p class="mt-2 text-xs sm:text-sm text-oppia-muted font-medium">${esc(s.label)}</p>
    </div>`).join('');
  initCounters();
}

function animateCounter(el){
  const target = parseInt(el.dataset.target, 10) || 0;
  if (reduceMotion) { el.textContent = target; return; }
  const duration = 1200;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

// Sayaç animasyonu (bölüm görünür olunca çalışır)
function initCounters(){
  const counters = document.querySelectorAll('.counter');
  const statsSection = document.getElementById('basarilar');
  if (!statsSection || !counters.length) return;
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        counters.forEach(animateCounter);
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(statsSection);
}

// ---------------------------------------------------------
// ÖDÜLLER & DERECELER
// ---------------------------------------------------------
const TROPHY_ICON = '<svg class="w-5 h-5 text-oppia-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0V4Z"/><path stroke-linecap="round" d="M7 5H4.5A2.5 2.5 0 0 0 7 9.5M17 5h2.5A2.5 2.5 0 0 1 17 9.5"/></svg>';

function renderAwards(data){
  const awards = data.awards || [];
  document.getElementById('awards-list').innerHTML = awards.map(a => `
    <div class="p-5 sm:p-6 flex items-start gap-4">
      <span class="w-10 h-10 rounded-full bg-oppia-cyan/10 border border-oppia-cyan/30 flex items-center justify-center shrink-0">${TROPHY_ICON}</span>
      <div>
        <p class="text-sm sm:text-base font-medium text-oppia-text">${esc(a.title)}</p>
        ${a.result ? `<p class="mt-1 text-xs sm:text-sm text-oppia-cyan font-medium">${esc(a.result)}</p>` : ''}
      </div>
    </div>`).join('');
}

// ---------------------------------------------------------
// ARENADAN KARELER (galeri)
// Oklar/noktalar radyo düğmeleri + CSS ile çalışır; JS otomatik geçiş ve kaydırma ekler
// ---------------------------------------------------------
const ARROW_L = '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>';
const ARROW_R = '<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';

function renderGallery(data){
  const slides = data.slides || [];
  const root = document.getElementById('memories');
  const n = slides.length;
  if (!n){ root.closest('.hero-in').classList.add('hidden'); return; }
  const pad = i => String(i).padStart(2, '0');
  const idx = [...Array(n).keys()].map(i => i + 1);

  // Kare sayısına göre CSS kuralları
  const css = idx.map(i => `
    #mem-r${i}:checked ~ .mem-stage .mem-track{ transform:translateX(-${(i - 1) * 100}%); }
    #mem-r${i}:checked ~ .mem-stage .mem-nav-${i}{ display:block; }
    #mem-r${i}:checked ~ .mem-dots .mem-dot-${i}{ width:24px; background:#00E5FF; }
    #mem-r${i}:checked ~ div .mem-count-${i}{ display:inline; }`).join('');
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const radios = idx.map(i => `<input type="radio" name="mem" id="mem-r${i}" class="mem-radio"${i === 1 ? ' checked' : ''} aria-label="${i}. kare">`).join('');
  const counts = idx.map(i => `<span class="mem-count mem-count-${i}">${pad(i)} / ${pad(n)}</span>`).join('');
  const figures = slides.map(s => `
    <figure class="mem-slide relative shrink-0 w-full h-full">
      <img src="${esc(s.image)}" alt="${esc(s.alt || s.title)}" class="relative w-full h-full object-contain">
      <figcaption class="absolute inset-x-0 bottom-0 px-5 pt-12 pb-5 bg-gradient-to-t from-oppia-bg via-oppia-bg/80 to-transparent">
        <p class="font-display font-semibold text-sm sm:text-base">${esc(s.title)}</p>
        ${s.caption ? `<p class="mt-1 text-xs text-oppia-muted">${esc(s.caption)}</p>` : ''}
      </figcaption>
    </figure>`).join('');
  const navs = n > 1 ? idx.map(i => {
    const prev = i === 1 ? n : i - 1;
    const next = i === n ? 1 : i + 1;
    return `<div class="mem-nav mem-nav-${i}">
      <label for="mem-r${prev}" class="mem-arrow mem-arrow-l" title="Önceki kare">${ARROW_L}</label>
      <label for="mem-r${next}" class="mem-arrow mem-arrow-r" title="Sonraki kare">${ARROW_R}</label>
    </div>`;
  }).join('') : '';
  const dots = n > 1 ? idx.map(i => `<label for="mem-r${i}" class="mem-dot mem-dot-${i}" title="${i}. kare"></label>`).join('') : '';

  root.innerHTML = `
    ${radios}
    <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-oppia-line">
      <div>
        <p class="font-display font-bold text-sm tracking-wide">ARENADAN <span class="text-oppia-cyan">KARELER</span></p>
        <p class="text-[11px] text-oppia-muted mt-0.5">Yarış günlerimizden hatıralar</p>
      </div>
      <span class="text-xs font-mono text-oppia-amber">${counts}</span>
    </div>
    <div class="mem-stage relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:h-[min(58vh,540px)] overflow-hidden bg-oppia-panel2">
      <div class="mem-track flex h-full">${figures}</div>
      ${navs}
    </div>
    <div class="mem-dots flex justify-center gap-2 py-3.5">${dots}</div>`;

  if (n > 1) initGalleryAutoplay(root);
}

function initGalleryAutoplay(root){
  const radios = [...root.querySelectorAll('.mem-radio')];
  const track = root.querySelector('.mem-track');
  let timer = null;
  const cur = () => radios.findIndex(r => r.checked);
  const go = n => { radios[(n + radios.length) % radios.length].checked = true; };
  function start(){ if (reduceMotion) return; stop(); timer = setInterval(() => go(cur() + 1), 6000); }
  function stop(){ if (timer) clearInterval(timer); timer = null; }
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('click', start);
  let x0 = null;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(cur() + (dx < 0 ? 1 : -1));
    x0 = null; start();
  });
  start();
}

// ---------------------------------------------------------
// GENEL METİNLER (hero, hakkımızda, tarihçe, iletişim)
// ---------------------------------------------------------
const SOCIAL_ICONS = {
  instagram: { label: 'Instagram', svg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="19" height="19" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>' },
  youtube:   { label: 'YouTube', svg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none"/></svg>' },
  linkedin:  { label: 'LinkedIn', svg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="2.5" width="19" height="19" rx="3"/><path stroke-linecap="round" d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M11.5 13c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v3.5"/></svg>' },
  x:         { label: 'X (Twitter)', svg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" d="M4 4l16 16M20 4 4 20"/></svg>' },
  github:    { label: 'GitHub', svg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6.2 0C6.6 2.8 5.6 3.1 5.6 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>' },
  website:   { label: 'Web sitesi', svg: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z"/></svg>' },
};

function renderSite(data){
  // data-field="bolum.alan" olan öğelerin metnini güncelle (boş alanlar sayfadaki metni korur)
  document.querySelectorAll('[data-field]').forEach(el => {
    const value = el.dataset.field.split('.').reduce((obj, key) => (obj == null ? obj : obj[key]), data);
    if (typeof value === 'string' && value.trim()) el.textContent = value;
  });

  const events = (data.history && data.history.events) || [];
  if (events.length){
    document.getElementById('history-events').innerHTML = events.map((ev, i) => {
      const last = i === events.length - 1;
      return `
        <div class="flex gap-5">
          <div class="flex flex-col items-center">
            <span class="w-3 h-3 rounded-full bg-oppia-cyan mt-1.5 shrink-0${last ? '' : ' shadow-[0_0_0_4px_rgba(0,229,255,.15)]'}"></span>
            ${last ? '' : '<span class="w-px flex-1 bg-oppia-line mt-1"></span>'}
          </div>
          <div${last ? '' : ' class="pb-9"'}>
            <p class="text-xs font-mono text-oppia-amber">${esc(ev.date)}</p>
            <h4 class="font-display font-semibold text-base mt-1">${esc(ev.title)}</h4>
            ${ev.text ? `<p class="mt-1.5 text-sm text-oppia-muted leading-relaxed">${esc(ev.text)}</p>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  const socials = ((data.contact && data.contact.socials) || []).filter(s => /^https?:\/\//i.test(s.url || ''));
  if (socials.length){
    document.getElementById('social-links').innerHTML = socials.map(s => {
      const icon = SOCIAL_ICONS[s.platform] || SOCIAL_ICONS.website;
      return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(icon.label)}" class="w-11 h-11 flex items-center justify-center border border-oppia-line hover:border-oppia-cyan hover:text-oppia-cyan text-oppia-muted transition">${icon.svg}</a>`;
    }).join('');
  }
}

// ---------------------------------------------------------
// İÇERİKLERİ YÜKLE
// ---------------------------------------------------------
const sections = [
  ['content/site.json', renderSite],
  ['content/gallery.json', renderGallery],
  ['content/team.json', renderTeam],
  ['content/robots.json', renderRobots],
  ['content/stats.json', renderStats],
  ['content/awards.json', renderAwards],
];
sections.forEach(([path, render]) => {
  loadJSON(path).then(render).catch(err => console.error(err));
});

// ---------------------------------------------------------
// MOBİL MENÜ
// ---------------------------------------------------------
const menuBtn   = document.getElementById('menu-btn');
const mobileMenu= document.getElementById('mobile-menu');
const iconOpen  = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');
menuBtn.addEventListener('click', () => {
  const isHidden = mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden');
  iconOpen.classList.toggle('hidden');
  iconClose.classList.toggle('hidden');
  menuBtn.setAttribute('aria-expanded', String(isHidden));
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// ---------------------------------------------------------
// İLETİŞİM FORMU — FormSubmit servisine AJAX ile gönderim
// ---------------------------------------------------------
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
const errorMsg = document.getElementById('form-error');
const submitBtn = document.getElementById('cf-submit');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.classList.add('hidden');
  errorMsg.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Gönderiliyor...';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      status.classList.remove('hidden');
      form.reset();
      setTimeout(() => status.classList.add('hidden'), 6000);
    } else {
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Mesajı Gönder';
  }
});

// Sabit navbar: kaydırıldığında hafif belirginleştirme
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 12) nav.classList.add('shadow-[0_8px_30px_rgba(0,0,0,.35)]');
  else nav.classList.remove('shadow-[0_8px_30px_rgba(0,0,0,.35)]');
});
