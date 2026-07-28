/* ===========================================================
   Portfolio data — add new entries here.
   type: "image" | "gif" | "video" | "embed"
   - image/gif: src points to an image file (gif works identically to image)
   - video: src points to a local video file (mp4/webm), rendered with <video controls>
   - embed: src is an embeddable URL (e.g. YouTube/Vimeo embed link), rendered in an <iframe>
   =========================================================== */
const portfolioItems = [
  {
    type: 'image',
    src: 'assets/portfolio-melee.svg',
    tag: 'Convoy',
    title: 'Cinematic Melee System',
    caption: 'Placeholder art — cinematic melee combat system in Convoy: weighty swings, hit-stop, and camera reactivity built in GameMaker.'
  },
  {
    type: 'image',
    src: 'assets/portfolio-unreal.svg',
    tag: 'ProjectScraps',
    title: 'Unreal Blueprint Prototype',
    caption: 'Placeholder art — early Blueprint-only prototyping in Unreal Engine, exploring node-based systems outside GameMaker.'
  },
  {
    type: 'slideshow',
    link: 'https://nicklesimba.itch.io/kib-kitties-in-black',
    images: [
      'assets/kib/kib-shot-1.png',
      'assets/kib/kib-shot-2.png',
      'assets/kib/kib-shot-3.png',
      'assets/kib/kib-shot-4.png',
      'assets/kib/kib-gato-boss.png'
    ],
    tag: 'itch.io',
    title: 'K.I.B.',
    caption: 'Kitties in Black — live and playable now on itch.io.'
  }

  // Example of a gif entry:
  // { type: 'gif', src: 'assets/some-clip.gif', tag: 'Convoy', title: 'Combo Chain', caption: 'A short combo chain in motion.' },

  // Example of a self-hosted video entry:
  // { type: 'video', src: 'assets/some-clip.mp4', tag: 'Convoy', title: 'Boss Fight', caption: 'Full boss encounter, first pass.' },

  // Example of an embedded video (YouTube/Vimeo):
  // { type: 'embed', src: 'https://www.youtube.com/embed/VIDEO_ID', tag: 'Convoy', title: 'Devlog #1', caption: 'First devlog walkthrough.' },
];

/* ---------------- Hero showcase ---------------- */
function heroThumbSrc(item) {
  if (item.type === 'slideshow') return item.images[0];
  if (item.type === 'video') return item.poster || null;
  if (item.type === 'embed') return item.thumb || null;
  return item.thumb || item.src;
}

const heroSlides = portfolioItems
  .map((item) => ({ src: heroThumbSrc(item), tag: item.tag, title: item.title }))
  .filter((slide) => slide.src);

const heroTrack = document.getElementById('hero-showcase-track');
const heroTagEl = document.getElementById('hero-showcase-tag');
const heroTitleEl = document.getElementById('hero-showcase-title');

if (heroTrack && heroSlides.length) {
  heroTrack.innerHTML = heroSlides
    .map((s, i) => `<img class="slide${i === 0 ? ' active' : ''}" src="${s.src}" alt="${s.title}" loading="lazy">`)
    .join('');

  const heroImgs = heroTrack.querySelectorAll('.slide');
  let heroIndex = 0;

  function updateHeroInfo() {
    heroTagEl.textContent = heroSlides[heroIndex].tag;
    heroTitleEl.textContent = heroSlides[heroIndex].title;
  }
  updateHeroInfo();

  function showHeroSlide(newIndex) {
    heroImgs[heroIndex].classList.remove('active');
    heroIndex = (newIndex + heroImgs.length) % heroImgs.length;
    heroImgs[heroIndex].classList.add('active');
    updateHeroInfo();
  }

  if (heroImgs.length > 1) {
    setInterval(() => showHeroSlide(heroIndex + 1), 4000);
  }
}

/* ---------------- Render portfolio grid ---------------- */
const grid = document.getElementById('portfolio-grid');

function mediaThumbHTML(item) {
  if (item.type === 'video') {
    return `<video src="${item.src}" muted loop playsinline preload="metadata"></video>`;
  }
  if (item.type === 'slideshow') {
    const slides = item.images.map((src, i) =>
      `<img class="slide${i === 0 ? ' active' : ''}" src="${src}" alt="${item.title}" loading="lazy">`
    ).join('');
    return `
      <div class="slideshow-track">${slides}</div>
      <button class="slide-btn slide-prev" type="button" aria-label="Previous screenshot">&#8249;</button>
      <button class="slide-btn slide-next" type="button" aria-label="Next screenshot">&#8250;</button>
    `;
  }
  // image, gif, and embed thumbnails all render as <img> in the grid
  // (for embeds you'd typically also set a "thumb" field; falling back to src here)
  return `<img src="${item.thumb || item.src}" alt="${item.title}" loading="lazy">`;
}

const SLIDESHOW_INTERVAL_MS = 3500;

function initSlideshow(card, item) {
  const slides = card.querySelectorAll('.slide');
  let index = 0;
  let timer = null;

  function show(newIndex) {
    slides[index].classList.remove('active');
    index = (newIndex + slides.length) % slides.length;
    slides[index].classList.add('active');
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => show(index + 1), SLIDESHOW_INTERVAL_MS);
  }

  card.querySelector('.slide-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    show(index - 1);
    restartTimer();
  });
  card.querySelector('.slide-next').addEventListener('click', (e) => {
    e.stopPropagation();
    show(index + 1);
    restartTimer();
  });

  restartTimer();
}

portfolioItems.forEach((item, i) => {
  const card = document.createElement('article');
  card.className = 'card reveal';
  card.style.setProperty('--i', i);
  const isSlideshow = item.type === 'slideshow';
  const titleHTML = isSlideshow
    ? `<a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>`
    : item.title;
  card.innerHTML = `
    <div class="card-media${isSlideshow ? ' slideshow' : ''}">
      <span class="card-tag">${item.tag}</span>
      ${mediaThumbHTML(item)}
      <div class="card-expand" aria-hidden="true">&#8599;</div>
    </div>
    <div class="card-body">
      <h3>${titleHTML}</h3>
      <p>${item.caption}</p>
    </div>
  `;

  if (isSlideshow) {
    initSlideshow(card, item);
    card.addEventListener('click', (e) => {
      if (e.target.closest('.slide-btn') || e.target.closest('.card-body a')) return;
      window.open(item.link, '_blank', 'noopener');
    });
  } else {
    card.addEventListener('click', () => openLightbox(i));
  }

  grid.appendChild(card);
});

/* ---------------- Lightbox ---------------- */
const lightbox = document.getElementById('lightbox');
const lightboxMedia = document.getElementById('lightbox-media');
const lightboxCaption = document.getElementById('lightbox-caption');
const btnClose = document.getElementById('lightbox-close');
const btnPrev = document.getElementById('lightbox-prev');
const btnNext = document.getElementById('lightbox-next');

let currentIndex = 0;

function mediaFullHTML(item) {
  switch (item.type) {
    case 'video':
      return `<video src="${item.src}" controls autoplay playsinline></video>`;
    case 'embed':
      return `<iframe src="${item.src}" width="960" height="540" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    case 'gif':
    case 'image':
    default:
      return `<img src="${item.src}" alt="${item.title}">`;
  }
}

function openLightbox(index) {
  currentIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxMedia.innerHTML = '';
  document.body.style.overflow = '';
}

function renderLightbox() {
  const item = portfolioItems[currentIndex];
  lightboxMedia.innerHTML = mediaFullHTML(item);
  lightboxCaption.textContent = item.caption;
}

function step(delta) {
  currentIndex = (currentIndex + delta + portfolioItems.length) % portfolioItems.length;
  renderLightbox();
}

btnClose.addEventListener('click', closeLightbox);
btnPrev.addEventListener('click', () => step(-1));
btnNext.addEventListener('click', () => step(1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

/* ---------------- Scroll reveal ---------------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

/* ---------------- Nav scroll state + active link ---------------- */
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('[data-nav]');
const sections = ['work', 'about', 'contact'].map((id) => document.getElementById(id));

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach((s) => s && sectionObserver.observe(s));

/* ---------------- Cursor glow ---------------- */
const glow = document.getElementById('cursor-glow');
let glowVisible = false;
window.addEventListener('mousemove', (e) => {
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  if (!glowVisible) {
    glow.style.opacity = '1';
    glowVisible = true;
  }
});
window.addEventListener('mouseleave', () => {
  glow.style.opacity = '0';
  glowVisible = false;
});

/* ---------------- Particle background ---------------- */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  initParticles();
}

function initParticles() {
  const count = Math.floor((window.innerWidth * window.innerHeight) / 22000);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + 0.4,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    hue: Math.random() > 0.5 ? '90, 209, 255' : '160, 107, 255',
    alpha: Math.random() * 0.5 + 0.15
  }));
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = window.innerWidth;
    if (p.x > window.innerWidth) p.x = 0;
    if (p.y < 0) p.y = window.innerHeight;
    if (p.y > window.innerHeight) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(tick);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(tick);

/* ---------------- Misc ---------------- */
document.getElementById('year').textContent = new Date().getFullYear();
