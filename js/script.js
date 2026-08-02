/* ============================================================================
   PROJECT DATA — this is the only block you need to edit to add work.

   Fields
   ------
   tag      Small label above the title (studio, jam, platform).
   title    Project name. Used in the list below.
   previewTitle
            Optional longer name for the preview caption bar only, when the
            slide wants more context than the list row does.
   blurb    One or two sentences. What you built, not what the game is about.
   link     Where a click goes: itch page, YouTube WIP demo, GitHub. Omit or
            leave null and the card simply is not clickable.
   cta      Short label for the click target, e.g. "Play on itch.io",
            "Watch the demo". Shown on hover in the showcase.
   thumb    One static image, used for this project's row in the list below.
   images   Stills for the preview slideshow up top. List as many as you like;
            each becomes its own slide and links back to this project.
   video    Optional silent clip (a few seconds), played on hover over the
            project's first preview slide. Use .mp4 (H.264) for browser support.

   The preview and the list are deliberately separate: images[] feeds the
   slideshow, thumb feeds the row. A project needs at least one of them.

   Drop media in:  assets/poster/   and   assets/video/
   ============================================================================ */
const projects = [
  {
    tag: 'GameMaker',
    title: 'Convoy',
    blurb: 'Cinematic melee combat: weighty swings, hit-stop, camera reactivity, and enemy spacing that keeps a crowd readable.',
    // link: 'https://www.youtube.com/watch?v=YOUR_WIP_DEMO',
    cta: 'Watch the demo',
    // thumb:  'assets/poster/convoy.png',
    // images: ['assets/poster/convoy.png'],
    // video:  'assets/video/convoy.mp4',
  },
  {
    tag: 'itch.io',
    title: 'K.I.B.',
    blurb: 'Kitties in Black, a finished and playable release. Enemy patterns, boss encounter, and full game loop.',
    link: 'https://nicklesimba.itch.io/kib-kitties-in-black',
    cta: 'Play on itch.io',
    previewTitle: 'K.I.B. - game jam prototype made in 4 days',
    thumb: 'assets/kib/kib-thumb.png',
    images: [
      'assets/kib/kib-sc-1.png',
      'assets/kib/kib-sc-2.png',
      'assets/kib/kib-sc-3.png',
      'assets/kib/kib-sc-4.png',
      'assets/kib/gato-boss.png'
    ],
    video: 'assets/video/kib.mp4',
  },
  {
    tag: 'GMTK Jam 2026',
    title: 'Jam Entry',
    blurb: 'Space shooter built in GameMaker over the jam weekend. Ship-and-rider control scheme with a settable lives system.',
    // link: 'https://nicklesimba.itch.io/YOUR_JAM_GAME',
    cta: 'Play the jam build',
    // thumb:  'assets/poster/gmtk.png',
    // images: ['assets/poster/gmtk.png'],
    // video:  'assets/video/gmtk.mp4',
  },
  {
    tag: 'Unreal',
    title: 'ProjectScraps',
    blurb: 'Blueprint-first prototyping in Unreal, translating combat systems built in GML into a node-based engine.',
    cta: 'Watch the demo',
    // thumb:  'assets/poster/scraps.png',
    // images: ['assets/poster/scraps.png'],
    // video:  'assets/video/scraps.mp4',
  },
  {
    tag: 'Tooling',
    title: 'gm-forge-mcp',
    blurb: 'A GameMaker Studio integration with 44 tools that let an AI agent edit objects, sprites, rooms, and events inside a live project rather than hand back code to paste.',
    link: 'https://github.com/nicklesimba/gm-forge-mcp',
    cta: 'View on GitHub',
    // thumb: 'assets/poster/gm-forge.png',
  },
];

/* The list row takes the static thumb; the preview takes every still. */
const thumbOf = (p) => p.thumb || (p.images && p.images[0]) || null;

const previewSlides = projects.flatMap((project) =>
  (project.images || []).map((src) => ({
    src,
    project,
    // Every still of a project rolls that project's clip on hover.
    video: project.video || null
  }))
);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================================
   Showcase — still fades into silent preview footage, click opens the project
   ============================================================================ */
const track = document.getElementById('showcase-track');
const railEl = document.getElementById('showcase-rail');
const railThumbs = document.getElementById('showcase-rail-thumbs');
const linkEl = document.getElementById('showcase-link');
const linkLabelEl = document.getElementById('showcase-link-label');
const tagEl = document.getElementById('showcase-tag');
const titleEl = document.getElementById('showcase-title');
const blurbEl = document.getElementById('showcase-blurb');
const ctaEl = document.getElementById('showcase-cta');

const STILL_DWELL_MS = 5000;
const MIN_VIDEO_DWELL_MS = 6000;

if (track && previewSlides.length) {
  track.innerHTML = previewSlides.map((s, i) => `
    <div class="slide${i === 0 ? ' active' : ''}">
      <img class="slide-poster" src="${s.src}" alt="${s.project.title}"
           ${i === 0 ? '' : 'loading="lazy"'}>
      ${s.video && !reduceMotion
        ? `<video class="slide-video" src="${s.video}" muted loop playsinline preload="none"></video>`
        : ''}
    </div>
  `).join('');

  /* Thumbnail rail. Hovering one shows it; clicking one goes to the project. */
  railThumbs.innerHTML = previewSlides.map((s, i) => {
    const tag = s.project.link ? 'a' : 'button';
    const attrs = s.project.link
      ? `href="${s.project.link}" target="_blank" rel="noopener"`
      : 'type="button"';
    return `
      <${tag} class="rail-thumb${i === 0 ? ' active' : ''}" ${attrs} role="tab"
              aria-label="${s.project.title}" aria-selected="${i === 0}">
        <img src="${s.src}" alt="" loading="lazy">
      </${tag}>`;
  }).join('');

  const slides = [...track.querySelectorAll('.slide')];
  const rail = [...railThumbs.querySelectorAll('.rail-thumb')];
  let index = 0;
  let timer = null;
  let paused = false;

  /* Drive the crossfade off the media's own events, bound once. play() is a
     promise, so a listener added per call could fire after a later pause and
     bring the clip back over a still the viewer had deliberately selected. */
  slides.forEach((slide) => {
    const v = slide.querySelector('.slide-video');
    if (!v) return;
    v.addEventListener('playing', () => slide.classList.add('playing'));
    v.addEventListener('pause', () => slide.classList.remove('playing'));
  });

  function schedule(ms) {
    clearTimeout(timer);
    if (slides.length < 2) return;
    timer = setTimeout(() => { if (!paused) go(index + 1); }, ms);
  }

  /* Footage is a hover reward, not an autoplay. Thumbnails hold the frame
     until someone points at them, which also keeps the clips off mobile. */
  function stopVideo(slide) {
    const v = slide && slide.querySelector('.slide-video');
    if (v) v.pause();
  }

  function startVideo(slide) {
    const v = slide && slide.querySelector('.slide-video');
    if (!v) return;
    // No seek to zero: coming back to a clip resumes where it left off.
    const played = v.play();
    // A rejected play (autoplay policy, or a pause landing first) just leaves
    // the still up, which is the correct fallback either way.
    if (played && played.catch) played.catch(() => {});
  }

  function go(next) {
    stopVideo(slides[index]);
    slides[index].classList.remove('active');
    rail[index].classList.remove('active');
    rail[index].setAttribute('aria-selected', 'false');

    index = (next + slides.length) % slides.length;
    const project = previewSlides[index].project;

    slides[index].classList.add('active');
    rail[index].classList.add('active');
    rail[index].setAttribute('aria-selected', 'true');

    tagEl.textContent = project.tag;
    titleEl.textContent = project.previewTitle || project.title;
    blurbEl.textContent = project.blurb;
    ctaEl.textContent = project.link ? (project.cta || 'View project') : 'Coming soon';

    if (project.link) {
      linkEl.href = project.link;
      linkEl.removeAttribute('aria-hidden');
      linkEl.tabIndex = 0;
      linkLabelEl.textContent = `${project.cta || 'View'}: ${project.title}`;
      titleEl.href = project.link;
    } else {
      linkEl.removeAttribute('href');
      linkEl.setAttribute('aria-hidden', 'true');
      linkEl.tabIndex = -1;
      linkLabelEl.textContent = '';
      titleEl.removeAttribute('href');
    }

    schedule(STILL_DWELL_MS);
  }

  // The rail browses stills: hovering a thumbnail shows that screenshot and
  // holds the footage. Clicks are left alone, these are links to the project.
  rail.forEach((thumb, i) => {
    const show = () => {
      if (i !== index) go(i);
      stopVideo(slides[index]);
    };
    thumb.addEventListener('mouseenter', show);
    thumb.addEventListener('focus', show);
  });

  // Back off the column but still inside the frame: the clip picks up again.
  railEl.addEventListener('mouseleave', () => {
    if (paused && !reduceMotion) startVideo(slides[index]);
  });

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
  const still = thumbOf(project);
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
    const firstSlide = previewSlides.findIndex((s) => s.project === project);
    row.addEventListener('click', () => {
      if (firstSlide > -1) openLightbox(firstSlide);
    });
    if (firstSlide === -1) row.classList.add('is-pending');
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
  const slide = previewSlides[currentIndex];
  lightboxMedia.innerHTML = slide.video
    ? `<video src="${slide.video}" controls autoplay muted loop playsinline></video>`
    : `<img src="${slide.src}" alt="${slide.project.title}">`;
  lightboxCaption.textContent = `${slide.project.title}: ${slide.project.blurb}`;
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
  currentIndex = (currentIndex + delta + previewSlides.length) % previewSlides.length;
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
