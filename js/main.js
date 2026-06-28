/**
 * صفحة ذكرى — محمد البحيري
 * ─────────────────────────────
 * لتخصيص التلاوات: عدّل مصفوفة PLAYLIST أدناه
 * وضع روابط ملفاتك الصوتية المستضافة.
 */

// ═══════════════════════════════════════════
//  قائمة التلاوات — استبدل الروابط بملفاتك
// ═══════════════════════════════════════════
const PLAYLIST = [
  {
    id: 'anam',
    surah: 'ما تيسر من سورة الأنعام',
    reciter: 'محمد أيمن البحيري',
    url: 'assets/audio/anam.mp3',
    filename: 'ما-تيسر-من-سورة-الأنعام.mp3',
  },
  {
    id: 'aljinn',
    surah: 'ما تيسر من سورة الجن',
    reciter: 'محمد أيمن البحيري',
    url: 'assets/audio/سورة-الجن-20ـ28.mp3',
    filename: 'سورة-الجن-20ـ28.mp3',
  },
  {
    id: 'fatiha',
    surah: 'سورة الفاتحة',
    reciter: 'الشيخ مشاري العفاسي',
    url: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3',
    filename: 'سورة-الفاتحة.mp3',
  },
  {
    id: 'ikhlas',
    surah: 'سورة الإخلاص',
    reciter: 'الشيخ مشاري العفاسي',
    url: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/112.mp3',
    filename: 'سورة-الإخلاص.mp3',
  },
  {
    id: 'falaq',
    surah: 'سورة الفلق',
    reciter: 'الشيخ مشاري العفاسي',
    url: 'hhttps://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/113.mp3',
    filename: 'سورة-الفلق.mp3',
  },
  {
    id: 'nas',
    surah: 'سورة الناس',
    reciter: 'الشيخ مشاري العفاسي',
    url: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/114.mp3',
    filename: 'سورة-الناس.mp3',
  },
  {
    id: 'yasin',
    surah: 'سورة يس',
    reciter: 'الشيخ مشاري العفاسي',
    url: 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/36.mp3',
    filename: 'سورة-يس.mp3',
  },
];

// ═══════════════════════════════════════════
//  مشغل الصوت
// ═══════════════════════════════════════════
const audio = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const downloadCurrentBtn = document.getElementById('download-current-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const currentSurahEl = document.getElementById('current-surah');
const currentReciterEl = document.getElementById('current-reciter');
const currentTrackStatsEl = document.getElementById('current-track-stats');
const playlistEl = document.getElementById('playlist');

let currentTrack = 0;
let isPlaying = false;
let playSessionCounted = false;

function getTrackStats(index) {
  return AudioStats.getTrack(PLAYLIST[index].id);
}

function formatStatsLabel(plays, downloads) {
  return `
    <span class="track-stat" title="مرات التشغيل">
      <svg class="track-stat-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z"/>
      </svg>
      ${plays}
    </span>
    <span class="track-stat" title="مرات التحميل">
      <svg class="track-stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"/>
      </svg>
      ${downloads}
    </span>
  `;
}

function updateTrackStatsUI(index) {
  const { plays, downloads } = getTrackStats(index);
  const statsHtml = formatStatsLabel(plays, downloads);

  const rowStats = document.querySelector(
    `.playlist-item[data-index="${index}"] .track-stats`
  );
  if (rowStats) rowStats.innerHTML = statsHtml;

  if (index === currentTrack) {
    currentTrackStatsEl.innerHTML = statsHtml;
  }
}

function updateCurrentTrackStats() {
  currentTrackStatsEl.innerHTML = formatStatsLabel(
    getTrackStats(currentTrack).plays,
    getTrackStats(currentTrack).downloads
  );
}

function incrementPlayCount(index) {
  AudioStats.recordPlay(PLAYLIST[index].id);
}

function incrementDownloadCount(index) {
  AudioStats.recordDownload(PLAYLIST[index].id);
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getDownloadFilename(track) {
  return track.filename || `${track.surah.replace(/\s+/g, '-')}.mp3`;
}

async function downloadTrack(index) {
  const track = PLAYLIST[index];
  const filename = getDownloadFilename(track);
  const btn = document.querySelector(`.download-track-btn[data-index="${index}"]`);

  if (btn) btn.disabled = true;
  showToast('جاري تحضير التحميل...');

  try {
    const response = await fetch(track.url);
    if (!response.ok) throw new Error('fetch failed');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
    incrementDownloadCount(index);
    showToast('تم بدء التحميل');
  } catch {
    const link = document.createElement('a');
    link.href = track.url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener';
    link.click();
    incrementDownloadCount(index);
    showToast('تعذّر التحميل المباشر — تم فتح الملف');
  } finally {
    if (btn) btn.disabled = false;
  }
}

function playAudio() {
  return audio.play().catch(() => {
    showToast('تعذّر تشغيل الملف الصوتي');
    updatePlayState(false);
  });
}

function loadTrack(index, { autoplay = false } = {}) {
  currentTrack = index;
  const track = PLAYLIST[index];
  playSessionCounted = false;

  audio.pause();
  audio.src = track.url;
  audio.load();

  currentSurahEl.textContent = track.surah;
  currentReciterEl.textContent = track.reciter;

  document.querySelectorAll('.playlist-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  progressBar.value = 0;
  currentTimeEl.textContent = '0:00';
  durationTimeEl.textContent = '0:00';
  updateCurrentTrackStats();

  if (autoplay) playAudio();
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
  } else {
    playAudio();
  }
}

function updatePlayState(playing) {
  isPlaying = playing;
  playIcon.classList.toggle('hidden', playing);
  pauseIcon.classList.toggle('hidden', !playing);
}

function buildPlaylist() {
  playlistEl.innerHTML = PLAYLIST.map((track, i) => {
    const { plays, downloads } = getTrackStats(i);
    return `
    <li class="playlist-item ${i === 0 ? 'active' : ''}" data-index="${i}">
      <button type="button" class="playlist-play" data-index="${i}" aria-label="تشغيل ${track.surah}">
        <span class="playlist-main">
          <span class="playlist-row">
            <span class="track-num">${i + 1}</span>
            <span class="playlist-text">${track.surah}</span>
            <span class="playlist-reciter">${track.reciter}</span>
          </span>
          <span class="track-stats">${formatStatsLabel(plays, downloads)}</span>
        </span>
      </button>
      <button
        type="button"
        class="download-track-btn"
        data-index="${i}"
        aria-label="تحميل ${track.surah}"
        title="تحميل"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"/>
        </svg>
      </button>
    </li>
  `;
  }).join('');

  playlistEl.querySelectorAll('.playlist-play').forEach((btn) => {
    btn.addEventListener('click', () => {
      loadTrack(parseInt(btn.dataset.index, 10), { autoplay: true });
    });
  });

  playlistEl.querySelectorAll('.download-track-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadTrack(parseInt(btn.dataset.index, 10));
    });
  });
}

playBtn.addEventListener('click', togglePlay);
downloadCurrentBtn.addEventListener('click', () => downloadTrack(currentTrack));

prevBtn.addEventListener('click', () => {
  const prev = currentTrack > 0 ? currentTrack - 1 : PLAYLIST.length - 1;
  loadTrack(prev, { autoplay: isPlaying });
});

nextBtn.addEventListener('click', () => {
  const next = currentTrack < PLAYLIST.length - 1 ? currentTrack + 1 : 0;
  loadTrack(next, { autoplay: isPlaying });
});

audio.addEventListener('play', () => {
  updatePlayState(true);
  if (!playSessionCounted) {
    incrementPlayCount(currentTrack);
    playSessionCounted = true;
  }
});
audio.addEventListener('pause', () => updatePlayState(false));

audio.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  currentTimeEl.textContent = formatTime(audio.currentTime);
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

progressBar.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
});

audio.addEventListener('error', () => {
  showToast('تعذّر تحميل الملف الصوتي');
  updatePlayState(false);
});

audio.addEventListener('ended', () => {
  if (currentTrack < PLAYLIST.length - 1) {
    loadTrack(currentTrack + 1, { autoplay: true });
  } else {
    updatePlayState(false);
  }
});

async function initApp() {
  await Promise.all([
    AudioStats.init().then(() => {
      AudioStats.onUpdate((trackId) => {
        const index = PLAYLIST.findIndex((track) => track.id === trackId);
        if (index !== -1) updateTrackStatsUI(index);
      });
      buildPlaylist();
      loadTrack(0);
    }),
    Condolences.init(renderMemoriesCarousel),
  ]);
}

initApp();

// ═══════════════════════════════════════════
//  نافذة الدعاء
// ═══════════════════════════════════════════
const prayerBtn = document.getElementById('prayer-btn');
const prayerModal = document.getElementById('prayer-modal');
const closePrayer = document.getElementById('close-prayer');
const sharePrayer = document.getElementById('share-prayer');

function openModal() {
  prayerModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  prayerModal.classList.add('hidden');
  document.body.style.overflow = '';
}

prayerBtn.addEventListener('click', openModal);
closePrayer.addEventListener('click', closeModal);
prayerModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

sharePrayer.addEventListener('click', () => {
  closeModal();
  document.getElementById('visitor-message').value =
    'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مَدْخَلَهُ.';
  document.getElementById('condolences').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('visitor-name').focus();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !prayerModal.classList.contains('hidden')) {
    closeModal();
  }
});

// ═══════════════════════════════════════════
//  سجل التعازي + Carousel الذكريات
// ═══════════════════════════════════════════
const MESSAGE_MAX_LENGTH = 400;

const condolenceForm = document.getElementById('condolence-form');
const visitorMessage = document.getElementById('visitor-message');
const charCountEl = document.getElementById('char-count');
const memoriesCarousel = document.getElementById('memories-carousel');
const memoriesCarouselHost = document.getElementById('memories-carousel-host');
const memoriesEmpty = document.getElementById('memories-empty');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');
const carouselDots = document.getElementById('carousel-dots');
const carouselCounter = document.getElementById('carousel-counter');

let carouselIndex = 0;
let carouselTotal = 0;

const CAROUSEL_SHOW_ALL_DOTS = 7;
const CAROUSEL_WINDOW_SIZE = 3;

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateCharCount() {
  charCountEl.textContent = visitorMessage.value.length;
}

visitorMessage.addEventListener('input', updateCharCount);

function renderMemoriesCarousel(list) {
  const items = list ?? Condolences.items;

  if (items.length === 0) {
    memoriesEmpty.classList.remove('hidden');
    memoriesCarouselHost.classList.add('hidden');
    memoriesCarousel.innerHTML = '';
    carouselDots.innerHTML = '';
    return;
  }

  memoriesEmpty.classList.add('hidden');
  memoriesCarouselHost.classList.remove('hidden');

  memoriesCarousel.innerHTML = items
    .map(
      (item) => `
      <article class="memory-slide memory-card" data-id="${item.id || ''}">
        <p class="memory-slide__message">${escapeHtml(item.message)}</p>
        <footer class="memory-slide__meta">
          <span class="memory-slide__name">${escapeHtml(item.name)}</span>
          <time class="memory-slide__date" datetime="${item.date}">${formatDate(item.date)}</time>
        </footer>
      </article>
    `
    )
    .join('');

  carouselIndex = 0;
  buildCarouselDots(items.length);
  observeCarouselSlides();
  updateCarouselControls();
  goToCarouselSlide(0, false);
}

let carouselObserver = null;

function observeCarouselSlides() {
  if (carouselObserver) carouselObserver.disconnect();

  const slides = memoriesCarousel.querySelectorAll('.memory-slide');
  if (!slides.length) return;

  carouselObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.55) return;
        const index = [...slides].indexOf(entry.target);
        if (index !== -1 && index !== carouselIndex) {
          carouselIndex = index;
          updateCarouselControls();
        }
      });
    },
    { root: memoriesCarousel, threshold: [0.55, 0.75, 1] }
  );

  slides.forEach((slide) => carouselObserver.observe(slide));
}

function buildCarouselDots(count) {
  carouselTotal = count;
  renderCarouselPagination();
}

function getCarouselDotIndices() {
  if (carouselTotal <= CAROUSEL_SHOW_ALL_DOTS) {
    return Array.from({ length: carouselTotal }, (_, i) => i);
  }

  let start = carouselIndex - 1;
  if (start < 0) start = 0;
  if (start > carouselTotal - CAROUSEL_WINDOW_SIZE) {
    start = carouselTotal - CAROUSEL_WINDOW_SIZE;
  }

  return Array.from({ length: CAROUSEL_WINDOW_SIZE }, (_, offset) => start + offset);
}

function getCarouselDotState(index) {
  const distance = Math.abs(index - carouselIndex);
  if (distance === 0) return 'active';
  if (distance === 1) return 'near';
  return 'far';
}

function renderCarouselPagination() {
  if (carouselTotal <= 1) {
    carouselCounter.classList.add('hidden');
    carouselCounter.textContent = '';
    carouselDots.innerHTML = '';
    return;
  }

  carouselCounter.classList.remove('hidden');
  carouselCounter.textContent = `${carouselIndex + 1} من ${carouselTotal}`;

  const indices = getCarouselDotIndices();
  carouselDots.innerHTML = indices
    .map(
      (index) => `
      <button
        type="button"
        class="carousel-dot ${getCarouselDotState(index)}"
        data-index="${index}"
        aria-label="تعزية ${index + 1}"
        ${index === carouselIndex ? 'aria-current="true"' : ''}
      ></button>
    `
    )
    .join('');

  carouselDots.querySelectorAll('.carousel-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      goToCarouselSlide(parseInt(dot.dataset.index, 10));
    });
  });
}

function goToCarouselSlide(index, smooth = true) {
  const slides = memoriesCarousel.querySelectorAll('.memory-slide');
  if (!slides.length) return;

  carouselIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides[carouselIndex].scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    inline: 'start',
    block: 'nearest',
  });
  updateCarouselControls();
}

function updateCarouselControls() {
  const slides = memoriesCarousel.querySelectorAll('.memory-slide');
  carouselTotal = slides.length;

  carouselPrev.disabled = carouselIndex <= 0;
  carouselNext.disabled = carouselIndex >= carouselTotal - 1;

  renderCarouselPagination();
}

carouselPrev.addEventListener('click', () => goToCarouselSlide(carouselIndex - 1));
carouselNext.addEventListener('click', () => goToCarouselSlide(carouselIndex + 1));

condolenceForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('visitor-name').value.trim();
  const message = visitorMessage.value.trim();
  const submitBtn = condolenceForm.querySelector('[type="submit"]');

  if (!name || !message) return;
  if (message.length > MESSAGE_MAX_LENGTH) {
    showToast(`الحد الأقصى ${MESSAGE_MAX_LENGTH} حرفاً`);
    return;
  }

  submitBtn.disabled = true;
  const result = await Condolences.submit(name, message);
  submitBtn.disabled = false;

  if (result.ok) {
    condolenceForm.reset();
    updateCharCount();
    goToCarouselSlide(0);
    showToast('تم إرسال تعزيتك — ستظهر في السيرة والذكريات');
  } else {
    showToast('تعذّر إرسال التعزية — حاول مرة أخرى');
  }
});

// ═══════════════════════════════════════════
//  إشعار Toast
// ═══════════════════════════════════════════
let toastTimeout;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ═══════════════════════════════════════════
//  التنقل والهيدر
// ═══════════════════════════════════════════
const header = document.getElementById('header');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

menuToggle.addEventListener('click', () => {
  const isOpen = !mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden');
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
});

document.querySelectorAll('.mobile-nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// تمييز القسم النشط أثناء التمرير
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach((section) => observer.observe(section));
