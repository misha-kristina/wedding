// Wedding date: 27 June 2026, 12:30 local time
const WEDDING_DATE = new Date('2026-09-12T11:00:00.000Z');

// Current language
let currentLanguage = 'ru';

// ── Language switching ────────────────────────────────────
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('selectedLanguage', lang);
  
  // Update all elements with data-* attributes
  document.querySelectorAll('[data-ru]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      if (el.innerHTML && el.innerHTML.includes('<')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
  
  // Update all input placeholders
  document.querySelectorAll('[data-ru-placeholder]').forEach(el => {
    const placeholder = el.getAttribute(`data-${lang}-placeholder`);
    if (placeholder) {
      el.placeholder = placeholder;
    }
  });
  
  // Update map toggle button
  const mapBtn = document.getElementById('map-toggle-btn');
  if (mapBtn && !mapBtn.classList.contains('open')) {
    const openTexts = { ru: 'Открыть карту', en: 'Open map', pl: 'Otwórz mapę', it: 'Apri mappa' };
    mapBtn.textContent = openTexts[lang] || 'Открыть карту';
  }
  
  // Update survey thanks message
  const surveyThanks = document.getElementById('survey-thanks');
  if (surveyThanks && surveyThanks.classList.contains('survey-thanks--visible')) {
    const thanksTexts = { 
      ru: 'Спасибо! Ждём вас 27 июня!',
      en: 'Thank you! We look forward to seeing you on June 27!',
      pl: 'Dziękujemy! Czekamy na Ciebie 27 czerwca!',
      it: 'Grazie! Ti aspettiamo il 27 giugno!'
    };
    surveyThanks.querySelector('.survey-thanks__text').textContent = thanksTexts[lang];
  }
}

// Load saved language on page load
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('selectedLanguage');
  if (saved && saved !== 'ru') {
    setLanguage(saved);
  }
});

// ── Countdown ─────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const now  = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    const cd = document.getElementById('countdown');
    if (cd) cd.innerHTML = '<p style="font-family:var(--font-serif);font-size:2rem;font-style:italic;color:var(--dark)">Сегодня этот день! ♡</p>';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent    = pad(days);
  document.getElementById('cd-hours').textContent   = pad(hours);
  document.getElementById('cd-minutes').textContent = pad(minutes);
  document.getElementById('cd-seconds').textContent = pad(seconds);
}

tick();
setInterval(tick, 1000);

// ── Music ─────────────────────────────────────────────────
const music    = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let musicPlaying = false;

function setMusicState(playing) {
  musicPlaying = playing;
  const icon = playing ? '♫' : '♪';
  if (musicBtn) {
    musicBtn.textContent = icon;
    musicBtn.classList.toggle('music-btn--playing', playing);
  }
}

function toggleMusic() {
  if (musicPlaying) {
    music.pause();
    setMusicState(false);
  } else {
    music.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
  }
}

// ── Splash ───────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const splash   = document.getElementById('splash');
  const enterBtn = document.getElementById('splash-enter');

  enterBtn.addEventListener('click', () => {
    splash.classList.add('splash--hidden');
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    if (musicBtn) musicBtn.classList.add('visible');
    // Show language selector
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) langSelector.classList.add('visible');
    // Start music on enter
    music.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
  });
});

// ── Map toggle ────────────────────────────────────────────
function toggleMap() {
  const container = document.getElementById('map-container');
  const btn       = document.getElementById('map-toggle-btn');
  if (!container) return;
  const open = container.classList.toggle('open');
  const hideTexts = { ru: 'Скрыть карту', en: 'Hide map', pl: 'Ukryj mapę', it: 'Nascondi mappa' };
  const showTexts = { ru: 'Открыть карту', en: 'Open map', pl: 'Otwórz mapę', it: 'Apri mappa' };
  btn.textContent = open ? hideTexts[currentLanguage] : showTexts[currentLanguage];
}

// ── Survey ────────────────────────────────────────────────
function submitSurvey(e) {
  e.preventDefault();
  const form = document.getElementById('survey-form');
  const data = new FormData(form);

  fetch(form.action, {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  })
  .then(res => {
    if (res.ok) {
      form.style.display = 'none';
      document.getElementById('survey-thanks').classList.add('survey-thanks--visible');
    } else {
      return res.json().then(d => { throw new Error(d.error || 'Ошибка отправки'); });
    }
  })
  .catch(err => {
    const errorTexts = {
      ru: 'Не удалось отправить анкету. Попробуйте ещё раз.\n',
      en: 'Failed to submit the form. Please try again.\n',
      pl: 'Nie udało się wysłać formularza. Spróbuj ponownie.\n',
      it: 'Errore nell\'invio del modulo. Riprova.\n'
    };
    alert((errorTexts[currentLanguage] || errorTexts.ru) + err.message);
  });
}

// ── Scroll reveal ─────────────────────────────────────────
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -100px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
