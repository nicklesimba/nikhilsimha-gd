/* ============================================================================
   PROJECT DATA — this is the only block you need to edit to add work.

   Fields
   ------
   tag      Small label above the title (studio, jam, platform).
   title    Project name.
   blurb    One or two sentences. What you built, not what the game is about.
   link     Where a click goes: itch page, YouTube WIP demo, GitHub. Omit or
            leave null and the card simply is not clickable.
   cta      Short label for the click target, e.g. "Play on itch.io",
            "Watch the demo". Shown on hover in the showcase.
   poster   Still image. REQUIRED for a project to appear in the top showcase.
   video    Optional silent preview clip (a few seconds). The poster fades into
            it automatically. Use .mp4 (H.264) — widest browser support.
   images   Optional extra stills. If present, the grid card becomes a
            slideshow. images[0] is used as the poster if poster is omitted.

   Drop media in:  assets/poster/   and   assets/video/
   ============================================================================ */
const projects = [
  {
    tag: 'GameMaker',
    title: 'Convoy',
    blurb: 'Cinematic melee combat: weighty swings, hit-stop, camera reactivity, and enemy spacing that keeps a crowd readable.',
    // link: 'https://www.youtube.com/watch?v=YOUR_WIP_DEMO',
    cta: 'Watch the demo',
    // poster: 'assets/poster/convoy.png',
    // video:  'assets/video/convoy.mp4',
  },
  {
    tag: 'itch.io',
    title: 'K.I.B.',
    blurb: 'Kitties in Black — a finished, playable release. Enemy patterns, boss encounter, and full game loop.',
    link: 'https://nicklesimba.itch.io/kib-kitties-in-black',
    cta: 'Play on itch.io',
    images: [
      'assets/kib/kib-shot-1.png',
      'assets/kib/kib-shot-2.png',
      'assets/kib/kib-shot-3.png',
      'assets/kib/kib-shot-4.png',
      'assets/kib/kib-gato-boss.png'
    ],
    // video: 'assets/video/kib.mp4',
  },
  {
    tag: 'GMTK Jam 2026',
    title: 'Jam Entry',
    blurb: 'Space shooter built in GameMaker over the jam weekend. Ship-and-rider control scheme with a settable lives system.',
    // link: 'https://nicklesimba.itch.io/YOUR_JAM_GAME',
    cta: 'Play the jam build',
    // poster: 'assets/poster/gmtk.png',
    // video:  'assets/video/gmtk.mp4',
  },
  {
    tag: 'Unreal',
    title: 'ProjectScraps',
    blurb: 'Blueprint-first prototyping in Unreal, translating combat systems built in GML into a node-based engine.',
    cta: 'Watch the demo',
    // poster: 'assets/poster/scraps.png',
    // video:  'assets/video/scraps.mp4',
  },
  {
    tag: 'Tooling',
    title: 'gm-forge-mcp',
    blurb: 'A GameMaker Studio integration with 44 tools that let an AI agent edit objects, sprites, rooms, and events inside a live project rather than hand back code to paste.',
    link: 'https://github.com/nicklesimba/gm-forge-mcp',
    cta: 'View on GitHub',
    // poster: 'assets/poster/gm-forge.png',
  },
];

/* Projects only surface where they have real media. A project with no poster
   and no images is skipped entirely rather than shown with filler art. */
const posterOf = (p) => p.poster || (p.images && p.images[0]) || null;
const shown = projects.filter(posterOf);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================================
   Showcase — still fades into silent preview footage, click opens the project
   ============================================================================ */
const track = document.getElementById('showcase-track');
const dotsWrap = document.getElementById('showcase-dots');
const linkEl = document.getElementById('showcase-link');
const linkLabelEl = document.getElementById('showcase-link-label');
const tagEl = document.getElementById('showcase-tag');
const titleEl = document.getElementById('showcase-title');
const ctaEl = document.getElementById('showcase-cta');

const STILL_DWELL_MS = 5000;
const MIN_VIDEO_DWELL_MS = 6000;

if (track && shown.length) {
  track.innerHTML = shown.map((p, i) => `
    <div class="slide${i === 0 ? ' active' : ''}">
      <img class="slide-poster" src="${posterOf(p)}" alt="${p.title}"
           ${i === 0 ? '' : 'loading="lazy"'}>
      ${p.video && !reduceMotion
        ? `<video class="slide-video" src="${p.video}" muted loop playsinline preload="none"></video>`
        : ''}
    </div>
  `).join('');

  dotsWrap.innerHTML = shown.map((p, i) => `
    <button class="dot${i === 0 ? ' active' : ''}" type="button" role="tab"
            aria-label="${p.title}" aria-selected="${i === 0}"></button>
  `).join('');

  const slides = [...track.querySelectorAll('.slide')];
  const dots = [...dotsWrap.querySelectorAll('.dot')];
  let index = 0;
  let timer = null;
  let paused = false;

  function schedule(ms) {
    clearTimeout(timer);
    if (slides.length < 2) return;
    timer = setTimeout(() => { if (!paused) go(index + 1); }, ms);
  }

  /* Footage is a hover reward, not an autoplay. Thumbnails hold the frame
     until someone points at them, which also keeps the clips off mobile. */
  function stopVideo(slide) {
    const v = slide && slide.querySelector('.slide-video');
    if (!v) return;
    slide.classList.remove('playing');
    v.pause();
  }

  function startVideo(slide) {
    const v = slide && slide.querySelector('.slide-video');
    if (!v) return;
    v.addEventListener('playing', () => slide.classList.add('playing'), { once: true });
    v.currentTime = 0;
    const played = v.play();
    // A rejected autoplay just leaves the still up, which is a fine fallback.
    if (played && played.catch) played.catch(() => {});
  }

  function go(next) {
    stopVideo(slides[index]);
    slides[index].classList.remove('active');
    dots[index].classList.remove('active');
    dots[index].setAttribute('aria-selected', 'false');

    index = (next + slides.length) % slides.length;
    const project = shown[index];

    slides[index].classList.add('active');
    dots[index].classList.add('active');
    dots[index].setAttribute('aria-selected', 'true');

    tagEl.textContent = project.tag;
    titleEl.textContent = project.title;
    ctaEl.textContent = project.link ? (project.cta || 'View project') : '';

    if (project.link) {
      linkEl.href = project.link;
      linkEl.removeAttribute('aria-hidden');
      linkEl.tabIndex = 0;
      linkLabelEl.textContent = `${project.cta || 'View'}: ${project.title}`;
    } else {
      linkEl.removeAttribute('href');
      linkEl.setAttribute('aria-hidden', 'true');
      linkEl.tabIndex = -1;
      linkLabelEl.textContent = '';
    }

    schedule(STILL_DWELL_MS);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));

  const frame = track.closest('.showcase-frame');

  // Pointing at the frame holds the slide and rolls its clip; leaving resets it.
  const hold = () => {
    paused = true;
    clearTimeout(timer);
    if (!reduceMotion) startVideo(slides[index]);
  };
  const release = () => {
    paused = false;
    stopVideo(slides[index]);
    schedule(STILL_DWELL_MS);
  };
  frame.addEventListener('mouseenter', hold);
  frame.addEventListener('mouseleave', release);
  frame.addEventListener('focusin', hold);
  frame.addEventListener('focusout', release);

  // Don't burn cycles on a showcase that is scrolled off screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) schedule(STILL_DWELL_MS);
    else { clearTimeout(timer); stopVideo(slides[index]); }
  }, { threshold: 0.25 }).observe(frame);

  go(0);
} else if (track) {
  track.closest('.showcase').style.display = 'none';
}

/* ============================================================================
   Project list — every row is clickable. Rows with a link open it; rows
   without one open their stills in the lightbox.
   ============================================================================ */
const list = document.getElementById('project-list');

document.getElementById('project-count').textContent =
  `${String(projects.length).padStart(2, '0')} entries`;

function thumbHTML(project) {
  const still = posterOf(project);
  if (still) return `<img src="${still}" alt="${project.title}" loading="lazy">`;
  // No capture yet: a flat tile, never filler art passed off as gameplay.
  return `<span class="thumb-empty" aria-hidden="true">${project.title.charAt(0)}</span>`;
}

projects.forEach((project, i) => {
  const row = document.createElement(project.link ? 'a' : 'button');
  row.className = 'project-row reveal';
  row.style.setProperty('--i', Math.min(i, 6));

  if (project.link) {
    row.href = project.link;
    row.target = '_blank';
    row.rel = 'noopener';
  } else {
    row.type = 'button';
    const stillIndex = shown.indexOf(project);
    row.addEventListener('click', () => {
      if (stillIndex > -1) openLightbox(stillIndex);
    });
    if (stillIndex === -1) row.classList.add('is-pending');
  }

  row.innerHTML = `
    <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
    <span class="project-thumb">${thumbHTML(project)}</span>
    <span class="project-info">
      <span class="project-tag">${project.tag}</span>
      <span class="project-title">${project.title}</span>
      <span class="project-blurb">${project.blurb}</span>
    </span>
    <span class="project-cta">${project.link ? (project.cta || 'View project') : 'Coming soon'}</span>
    <span class="project-arrow" aria-hidden="true">&#8594;</span>
  `;

  list.appendChild(row);
});

/* ============================================================================
   Lightbox — full-size stills for projects with no external link
   ============================================================================ */
const lightbox = document.getElementById('lightbox');
const lightboxMedia = document.getElementById('lightbox-media');
const lightboxCaption = document.getElementById('lightbox-caption');
let currentIndex = 0;

function renderLightbox() {
  const project = shown[currentIndex];
  lightboxMedia.innerHTML = project.video
    ? `<video src="${project.video}" controls autoplay muted loop playsinline></video>`
    : `<img src="${posterOf(project)}" alt="${project.title}">`;
  lightboxCaption.textContent = `${project.title} — ${project.blurb}`;
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

function step(delta) {
  currentIndex = (currentIndex + delta + shown.length) % shown.length;
  renderLightbox();
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => step(-1));
document.getElementById('lightbox-next').addEventListener('click', () => step(1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

/* ============================================================================
   Scroll reveal + nav state
   ============================================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const navLinks = document.querySelectorAll('[data-nav]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { threshold: 0.4 });
['work', 'contact']
  .map((id) => document.getElementById(id))
  .forEach((s) => s && sectionObserver.observe(s));

document.getElementById('year').textContent = new Date().getFullYear();
