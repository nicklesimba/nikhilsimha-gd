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
    link: 'https://youtu.be/6LGuYfwRs9Y',
    cta: 'Watch the demo',
    thumb: 'assets/convoy/convoy-combo.png',
    images: [
      'assets/convoy/convoy-combo.png',
      'assets/convoy/convoy-sc-5.png',
      'assets/convoy/convoy-sc-6.png',
      'assets/convoy/convoy-sc.png',
      'assets/convoy/convoy-sc-2.png',
      'assets/convoy/convoy-sc-3.png',
      'assets/convoy/convoy-sc-4.png'
    ],
    video: 'assets/video/convoy.mp4',
  },
  {
    tag: 'GameMaker',
    title: 'K.I.B.',
    blurb: 'Kitties in Black, a playable prototype made for a game jam over the course of four days.',
    link: 'https://nicklesimba.itch.io/kib-kitties-in-black',
    cta: 'Play on itch.io',
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
    thumb: 'assets/logo/gm-forge-mcp.svg',
    thumbFit: 'logo',
  },
  {
    tag: 'Tooling',
    title: 'agones-conductor-mcp',
    blurb: 'A Go server that hooks AI agents into Agones, which runs dedicated game server fleets on Kubernetes. Checks on fleets and game servers without a kubectl detour.',
    link: 'https://github.com/nicklesimba/agones-conductor-mcp',
    cta: 'View on GitHub',
    thumb: 'assets/logo/agones-conductor-mcp.svg',
    thumbFit: 'logo',
  },
];

/* The list row takes the static thumb; the preview takes every still. */
const thumbOf = (p) => p.thumb || (p.images && p.images[0]) || null;

/* The preview is paged by project. A project appears once it has stills, or
   once it is flagged comingSoon so it can hold a slot before it has any. */
const previewProjects = projects.filter(
  (p) => (p.images && p.images.length) || p.comingSoon
);

const slidesFor = (project) =>
  (project.images && project.images.length ? project.images : [null]).map((src) => ({
    src,
    project,
    // Every still of a project rolls that project's clip on hover.
    video: project.video || null
  }));

/* A reload lands on the site proper, whatever section the reader was parked
   at. Drop the fragment without adding a history entry, and stop the browser
   from restoring the old scroll offset on top of that. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) {
  history.replaceState(null, '', location.pathname + location.search);
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================================
   Secondary type over the spill

   While a clip is rolling it sits between the page and the overview, so what
   the grey subtext contrasts against is whatever is on screen. Sample the
   clip, work out the composite luminance, and pick whichever colour actually
   wins on contrast.

   Worth knowing which way this lands: the page shows through underneath, so
   at the current 50% spill even a black frame only reaches L=0.445, where
   white scores 2.12:1 against the grey's 2.57:1 and a near-black 6.89:1. So
   it darkens rather than whitens. White only starts winning below L=0.400,
   which needs the spill past roughly 70%. Raise it and this flips on its own.
   ============================================================================ */
const PAGE_LUM = 0.889;                                  // luminance of --bg
// Every grey that sits over the landing, each as: default, darker, white.
const LIVE_TONES = {
  '--text-dim-live':   ['#6b6873', '#2a2733', '#ffffff'],
  '--text-faint-live': ['#9a96a3', '#46424f', '#ffffff']
};

const toLinear = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lumOf = (r, g, b) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hexLum = (hex) => lumOf(
  parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)
);
const LIVE_LUMS = Object.fromEntries(
  Object.entries(LIVE_TONES).map(([name, tones]) => [name, tones.map(hexLum)])
);

const sampler = document.createElement('canvas');
sampler.width = sampler.height = 8;
const samplerCtx = sampler.getContext('2d', { willReadFrequently: true });
let spillTimer = null;

function tuneDimColour() {
  if (!ambientVideo || ambientVideo.readyState < 2) return;

  let videoLum;
  try {
    samplerCtx.drawImage(ambientVideo, 0, 0, 8, 8);
    const { data } = samplerCtx.getImageData(0, 0, 8, 8);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += lumOf(data[i], data[i + 1], data[i + 2]);
    videoLum = sum / (data.length / 4);
  } catch {
    return;   // a frame that cannot be read yet is simply skipped
  }

  // Read the spill strength off the stylesheet so the two cannot drift apart.
  const alpha = parseFloat(getComputedStyle(ambientVideo).opacity) || 0;
  const behind = alpha * videoLum + (1 - alpha) * PAGE_LUM;

  for (const [name, tones] of Object.entries(LIVE_TONES)) {
    const lums = LIVE_LUMS[name];
    let best = 0;
    for (let i = 1; i < tones.length; i++) {
      if (contrast(lums[i], behind) > contrast(lums[best], behind)) best = i;
    }
    document.documentElement.style.setProperty(name, tones[best]);
  }
}

function watchSpill(on) {
  clearInterval(spillTimer);
  if (!on) {
    for (const [name, tones] of Object.entries(LIVE_TONES)) {
      document.documentElement.style.setProperty(name, tones[0]);
    }
    return;
  }
  tuneDimColour();
  spillTimer = setInterval(tuneDimColour, 250);
}

/* Rows and titles are links, but their text still has to be selectable. Once
   something is selected, the mouseup that ends the drag must not navigate. */
const hasSelection = () => String(window.getSelection() || '').trim().length > 0;

function keepSelectable(el) {
  el.draggable = false;
  el.addEventListener('click', (e) => {
    if (hasSelection()) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  });
}

/* ============================================================================
   Showcase — still fades into silent preview footage, click opens the project
   ============================================================================ */
const ambient = document.getElementById('ambient');
const ambientVideo = document.getElementById('ambient-video');
const track = document.getElementById('showcase-track');
const railThumbs = document.getElementById('showcase-rail-thumbs');
const linkEl = document.getElementById('showcase-link');
const linkLabelEl = document.getElementById('showcase-link-label');
const tagEl = document.getElementById('showcase-tag');
const titleEl = document.getElementById('showcase-title');
const blurbEl = document.getElementById('showcase-blurb');
const ctaEl = document.getElementById('showcase-cta');
if (titleEl) keepSelectable(titleEl);

const STILL_DWELL_MS = 5000;

if (track && previewProjects.length) {
  let projectIndex = 0;
  let previewSlides = [];
  let slides = [];
  let rail = [];
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
  /* Both the picture and its blurred backdrop are clips, so they start and
     stop together and the backdrop is nudged onto the picture's timestamp. */
  const play = (v) => {
    if (!v) return;
    const played = v.play();
    // A rejected play (autoplay policy, or a pause landing first) just leaves
    // the still up, which is the correct fallback either way.
    if (played && played.catch) played.catch(() => {});
  };

  function stopVideo(slide) {
    if (ambientVideo) ambientVideo.pause();
    if (!slide) return;
    slide.querySelectorAll('video').forEach((v) => v.pause());
  }

  function startVideo(slide) {
    if (!slide) return;
    const fg = slide.querySelector('.slide-video');
    const bg = slide.querySelector('.slide-backdrop-video');
    if (fg && bg && Number.isFinite(fg.currentTime)) bg.currentTime = fg.currentTime;

    // The spill runs the same clip, matched to the picture's timestamp.
    if (fg && ambientVideo) {
      const src = fg.getAttribute('src');
      if (ambientVideo.getAttribute('src') !== src) ambientVideo.src = src;
      if (Number.isFinite(fg.currentTime)) ambientVideo.currentTime = fg.currentTime;
      play(ambientVideo);
    }

    // No seek to zero: coming back to a clip resumes where it left off.
    slide.querySelectorAll('video').forEach(play);
  }

  function go(next) {
    stopVideo(slides[index]);
    slides[index].classList.remove('active');
    if (rail[index]) {
      rail[index].classList.remove('active');
      rail[index].setAttribute('aria-selected', 'false');
    }

    index = (next + slides.length) % slides.length;
    const project = previewSlides[index].project;

    slides[index].classList.add('active');
    if (rail[index]) {
      rail[index].classList.add('active');
      rail[index].setAttribute('aria-selected', 'true');
    }

    tagEl.textContent = project.tag;
    titleEl.textContent = project.title;
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

  /* Paging to a project rebuilds the frame and the rail for that project. */
  function loadProject(nextProject) {
    clearTimeout(timer);
    projectIndex = (nextProject + previewProjects.length) % previewProjects.length;
    const project = previewProjects[projectIndex];
    previewSlides = slidesFor(project);

    /* Each slide is a blurred cover-scaled backdrop with the whole frame laid
       over it just inside a fit, so nothing is ever cropped and the letterbox
       reads as part of the image rather than as dead space. */
    track.innerHTML = previewSlides.map((s, i) => `
      <div class="slide${i === 0 ? ' active' : ''}">
        ${s.src ? `<img class="slide-backdrop" src="${s.src}" alt="" aria-hidden="true">` : ''}
        ${s.video && !reduceMotion
          ? `<video class="slide-backdrop-video" src="${s.video}" muted loop playsinline preload="none" aria-hidden="true"></video>`
          : ''}
        ${s.src ? `<img class="slide-poster" src="${s.src}" alt="${s.project.title}">` : ''}
        ${s.video && !reduceMotion
          ? `<video class="slide-video" src="${s.video}" muted loop playsinline preload="none"></video>`
          : ''}
      </div>
    `).join('');

    railThumbs.innerHTML = previewSlides
      .filter((s) => s.src)
      .map((s, i) => {
        const tag = project.link ? 'a' : 'button';
        const attrs = project.link
          ? `href="${project.link}" target="_blank" rel="noopener"`
          : 'type="button"';
        return `
          <${tag} class="rail-thumb${i === 0 ? ' active' : ''}" ${attrs} role="tab"
                  aria-label="${project.title}" aria-selected="${i === 0}">
            <img src="${s.src}" alt="" loading="lazy">
          </${tag}>`;
      }).join('');

    slides = [...track.querySelectorAll('.slide')];
    rail = [...railThumbs.querySelectorAll('.rail-thumb')];
    index = 0;

    /* Drive the crossfade off the media's own events, bound once per element.
       play() is a promise, so a listener added per call could fire after a
       later pause and bring the clip back over a deliberately chosen still. */
    slides.forEach((slide) => {
      const v = slide.querySelector('.slide-video');
      if (!v) return;
      v.addEventListener('playing', () => {
        slide.classList.add('playing');
        if (ambient) ambient.classList.add('on');
        watchSpill(true);
      });
      v.addEventListener('pause', () => {
        slide.classList.remove('playing');
        if (ambient) ambient.classList.remove('on');
        watchSpill(false);
      });
    });

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

    go(0);
  }

  const frame = track.closest('.showcase-frame');

  // Project arrows. Hidden outright when there is only one project to show.
  const prevBtn = document.getElementById('showcase-prev');
  const nextBtn = document.getElementById('showcase-next');
  if (previewProjects.length < 2) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
    frame.classList.add('no-arrows');
  } else {
    prevBtn.addEventListener('click', () => loadProject(projectIndex - 1));
    nextBtn.addEventListener('click', () => loadProject(projectIndex + 1));
  }

  /* Anywhere over the picture rolls the clip. This listens on mouseover, not
     mouseenter: mouseenter fires once on the way into the frame, so crossing
     from an arrow or the column back onto the picture would never re-evaluate
     and the footage would sit paused. mouseover fires on every transition
     between descendants, so each of those moves is reconsidered. */
  frame.addEventListener('mouseover', (e) => {
    paused = true;
    clearTimeout(timer);

    // The column is not the picture: anywhere in it holds the footage, gaps
    // and padding included, not just the thumbnails themselves.
    if (e.target.closest('.showcase-rail')) {
      stopVideo(slides[index]);
      return;
    }
    // Arrows sit over the picture, so they neither start nor stop it.
    if (reduceMotion || e.target.closest('.showcase-arrow')) return;

    startVideo(slides[index]);
  });

  const release = () => {
    paused = false;
    stopVideo(slides[index]);
    schedule(STILL_DWELL_MS);
  };
  frame.addEventListener('mouseleave', release);
  frame.addEventListener('focusin', () => { paused = true; clearTimeout(timer); });
  frame.addEventListener('focusout', release);

  // Don't burn cycles on a showcase that is scrolled off screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) schedule(STILL_DWELL_MS);
    else { clearTimeout(timer); stopVideo(slides[index]); }
  }, { threshold: 0.25 }).observe(frame);

  loadProject(0);
} else if (track) {
  track.closest('.showcase').style.display = 'none';
}

/* ============================================================================
   Project list — every row is clickable. Rows with a link open it; rows
   without one open their stills in the lightbox.
   ============================================================================ */
const list = document.getElementById('project-list');

/* Stills a project can show full size when it has nowhere external to link. */
function shotsFor(project) {
  const srcs = project.images && project.images.length
    ? project.images
    : [thumbOf(project)];
  return srcs.filter(Boolean).map((src) => ({ src, project }));
}

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
  keepSelectable(row);

  if (project.link) {
    row.href = project.link;
    row.target = '_blank';
    row.rel = 'noopener';
  } else {
    row.type = 'button';
    const hasShots = shotsFor(project).length > 0;
    row.addEventListener('click', () => {
      if (hasShots) openLightbox(project);
    });
    if (!hasShots) row.classList.add('is-pending');
  }

  row.innerHTML = `
    <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
    <span class="project-thumb${project.thumbFit === 'logo' ? ' is-logo' : ''}">${thumbHTML(project)}</span>
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
let lightboxShots = [];
let currentIndex = 0;

function renderLightbox() {
  const shot = lightboxShots[currentIndex];
  lightboxMedia.innerHTML = shot.project.video
    ? `<video src="${shot.project.video}" controls autoplay muted loop playsinline></video>`
    : `<img src="${shot.src}" alt="${shot.project.title}">`;
  lightboxCaption.textContent = `${shot.project.title}: ${shot.project.blurb}`;
}

function openLightbox(project) {
  lightboxShots = shotsFor(project);
  if (!lightboxShots.length) return;
  currentIndex = 0;
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
  if (!lightboxShots.length) return;
  currentIndex = (currentIndex + delta + lightboxShots.length) % lightboxShots.length;
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

/* The landing sizes itself against the viewport minus the nav, so measure the
   nav rather than hard-coding a height that font loading could change. */
const hero = document.getElementById('top');

function syncNavHeight() {
  document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
  // The spill reaches exactly to the foot of the hero and no further, so the
  // Projects bar never picks up colour from whatever is playing above it.
  /* Measured off the box, not offsetTop: main is positioned, so it is the
     hero's offset parent and offsetTop reads 0, which left the spill short
     by exactly the height of the nav. */
  if (hero) {
    const bottom = hero.getBoundingClientRect().bottom + window.scrollY;
    document.documentElement.style.setProperty('--ambient-h', `${Math.round(bottom)}px`);
  }
}
syncNavHeight();
window.addEventListener('resize', syncNavHeight);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncNavHeight);
if (hero && 'ResizeObserver' in window) new ResizeObserver(syncNavHeight).observe(hero);

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
