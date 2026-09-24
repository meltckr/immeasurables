const LITURGY = {
  lk: {
    tib: "byams pa",
    en: "Loving-Kindness",
    verse: "May all sentient beings enjoy happiness and the root of happiness.",
    color: "var(--color-lk)"
  },
  compassion: {
    tib: "snying rje",
    en: "Compassion",
    verse: "May they be free from suffering and the root of suffering.",
    color: "var(--color-compassion)"
  },
  joy: {
    tib: "dga' ba",
    en: "Empathetic Joy",
    verse: "May they not be separated from the great happiness devoid of suffering.",
    color: "var(--color-joy)"
  },
  equanimity: {
    tib: "btang snyoms",
    en: "Equanimity",
    verse: "May they dwell in the great equanimity free from passion, aggression, and prejudice.",
    color: "var(--color-equanimity)"
  }
};

const MODES = {
  MORNING: 'morning',
  BREATHS: 'breaths',
  FORMAL: 'formal',
  MICRO: 'micro'
};

let currentSequence = [];
let currentIndex = 0;
let isFormalEquanimityFirst = true;

document.addEventListener('DOMContentLoaded', () => {
  bindHomeEvents();
  bindPractice();
  try {
    initTheme();
    bindSettings();
  } catch (err) {
    console.error(err);
  }
  registerSW();
});

function on(id, event, handler) {
  const el = document.getElementById(id);
  if (!el) return null;
  el.addEventListener(event, handler);
  return el;
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(console.error);
  }
}

function applyTheme(name) {
  document.body.className = `theme-${name}`;
  const meta = document.querySelector('meta[name="theme-color"]');
  const colors = { morning: '#fcf8eb', midday: '#ffffff', night: '#121526' };
  if (meta && colors[name]) meta.setAttribute('content', colors[name]);
}

function applyAutoTheme() {
  const hour = new Date().getHours();
  let theme = 'midday';
  if (hour >= 5 && hour < 11) theme = 'morning';
  else if (hour >= 17 || hour < 5) theme = 'night';
  applyTheme(theme);
}

function initTheme() {
  applyAutoTheme();
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = 'auto';
    themeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'auto') applyAutoTheme();
      else applyTheme(e.target.value);
    });
  }
  const orderToggle = document.getElementById('order-toggle');
  if (orderToggle) {
    orderToggle.addEventListener('change', (e) => {
      isFormalEquanimityFirst = e.target.checked;
    });
  }
}

function showScreen(id, direction = 'forward') {
  document.querySelectorAll('.screen').forEach(el => {
    if (el.classList.contains('active')) {
      el.classList.remove('active');
      el.classList.add(direction === 'forward' ? 'exiting-up' : 'exiting-down');
      setTimeout(() => el.classList.remove('exiting-up', 'exiting-down'), 400);
    }
  });
  
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('exiting-up', 'exiting-down');
    target.classList.add('active');
  }
}

function bindHomeEvents() {
  on('btn-morning', 'click', () => startMorning());
  on('btn-breaths', 'click', () => startBreaths());
  on('btn-formal', 'click', () => startFormal());
  on('btn-micro', 'click', () => showMicroMenu());

  document.querySelectorAll('.micro-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const q = e.currentTarget.dataset.quality;
      startMicro(q);
    });
  });

  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentIndex > 0 && currentSequence.length > 0 && !btn.closest('#screen-micro-menu')) {
        prevStep();
      } else {
        goHome();
      }
    });
  });
}

function bindPractice() {
  on('practice-content', 'click', () => nextStep());
  on('btn-continue', 'click', (e) => {
    e.stopPropagation();
    nextStep();
  });
}

function bindSettings() {
  const overlay = document.getElementById('settings-modal');
  const openBtn = document.getElementById('btn-settings');
  const closeBtn = document.getElementById('btn-close-settings');
  if (openBtn && overlay) {
    openBtn.addEventListener('click', () => overlay.classList.add('active'));
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  }
}

function updateAdvanceButton() {
  const btn = document.getElementById('btn-continue');
  if (!btn || currentSequence.length === 0) return;
  const last = currentIndex >= currentSequence.length - 1;
  const label = last ? "What's Next" : 'Continue';
  btn.textContent = label;
  btn.setAttribute('aria-label', label);
}

function goHome() {
  currentSequence = [];
  currentIndex = 0;
  showScreen('screen-home', 'backward');
  document.querySelector('.bg-layer').style.opacity = '0.05';
  document.querySelector('.bg-layer').className = 'bg-layer bg-dust';
}

function showMicroMenu() {
  showScreen('screen-micro-menu', 'forward');
}

// Generators for sequences
function buildSequence(mode) {
  let seq = [];
  if (mode === MODES.MORNING) {
    seq.push({ type: 'text', title: 'Refuge & Bodhicitta', verse: "Bring Refuge and Bodhicitta to mind.", note: "Soft prompt — use your Daily Prayers wording (p.2)." });
    seq.push({ type: 'quality', q: 'lk' });
    seq.push({ type: 'quality', q: 'compassion' });
    seq.push({ type: 'quality', q: 'joy' });
    seq.push({ type: 'quality', q: 'equanimity' });
    seq.push({ type: 'text', title: 'Short Dedication of Merit', verse: "Dedicate whatever goodness arose here\nfor the benefit of all sentient beings.", note: "Soft placeholder — expand with your Daily Prayers dedication." });
  } 
  else if (mode === MODES.BREATHS) {
    // Default classic order for breaths
    seq.push({ type: 'quality', q: 'lk', cue: 'Breathe in, breathe out.' });
    seq.push({ type: 'quality', q: 'compassion', cue: 'Breathe in, breathe out.' });
    seq.push({ type: 'quality', q: 'joy', cue: 'Breathe in, breathe out.' });
    seq.push({ type: 'quality', q: 'equanimity', cue: 'Breathe in, breathe out.' });
  }
  else if (mode === MODES.FORMAL) {
    seq.push({ type: 'text', title: 'Settle', verse: "Arrive fully before you begin.\nThere is nowhere else to be.", note: "Take three slow breaths." });
    seq.push({ type: 'text', title: 'Opening Prayer', verse: "Optional: bring Refuge and Bodhicitta to mind.", note: "Soft prompt." });
    
    if (isFormalEquanimityFirst) {
      seq.push({ type: 'quality', q: 'equanimity' });
      seq.push({ type: 'quality', q: 'lk' });
      seq.push({ type: 'quality', q: 'compassion' });
      seq.push({ type: 'quality', q: 'joy' });
    } else {
      seq.push({ type: 'quality', q: 'lk' });
      seq.push({ type: 'quality', q: 'compassion' });
      seq.push({ type: 'quality', q: 'joy' });
      seq.push({ type: 'quality', q: 'equanimity' });
    }
    
    seq.push({ type: 'text', title: 'Rest in Awareness', verse: "Let the words fall away.\nLet even the wish dissolve.", note: "Rest in open, spacious awareness." });
    seq.push({ type: 'text', title: 'Closing Dedication', verse: "Hold nothing back for yourself.", note: "Short placeholder to dedicate merit." });
  }
  return seq;
}

function startMorning() {
  currentSequence = buildSequence(MODES.MORNING);
  currentIndex = 0;
  renderCurrentStep('forward');
  showScreen('screen-practice', 'forward');
}

function startBreaths() {
  currentSequence = buildSequence(MODES.BREATHS);
  currentIndex = 0;
  renderCurrentStep('forward');
  showScreen('screen-practice', 'forward');
}

function startFormal() {
  currentSequence = buildSequence(MODES.FORMAL);
  currentIndex = 0;
  renderCurrentStep('forward');
  showScreen('screen-practice', 'forward');
}

function startMicro(quality) {
  currentSequence = [{ type: 'quality', q: quality, cue: 'Take 30-90 seconds to land this.' }];
  currentIndex = 0;
  renderCurrentStep('forward');
  showScreen('screen-practice', 'forward');
}

function nextStep() {
  if (currentSequence.length === 0) return;
  if (currentIndex < currentSequence.length - 1) {
    currentIndex++;
    renderCurrentStep('forward');
  } else {
    goHome();
  }
}

function prevStep() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentStep('backward');
  }
}

function renderCurrentStep(direction) {
  const step = currentSequence[currentIndex];
  const container = document.getElementById('practice-content');
  const dotsContainer = document.getElementById('progress-dots');
  const bgLayer = document.querySelector('.bg-layer');
  if (!step || !container || !dotsContainer || !bgLayer) return;
  updateAdvanceButton();
  
  // Render dots
  dotsContainer.innerHTML = '';
  if (currentSequence.length > 1) {
    for (let i = 0; i < currentSequence.length; i++) {
      const d = document.createElement('div');
      d.className = `dot ${i === currentIndex ? 'active' : ''}`;
      dotsContainer.appendChild(d);
    }
  }

  // Fade out content, update, fade in
  container.style.opacity = 0;
  setTimeout(() => {
    if (step.type === 'text') {
      container.innerHTML = `
        <div class="english-label">${step.title}</div>
        <div class="verse-text" style="font-size: 1.6rem">${step.verse.replace(/\n/g, '<br>')}</div>
        <div class="step-note">${step.note}</div>
      `;
      bgLayer.className = 'bg-layer bg-dust';
    } else {
      const qData = LITURGY[step.q];
      container.innerHTML = `
        <div class="tibetan-name">${qData.tib}</div>
        <div class="english-label">${qData.en}</div>
        <div class="verse-text">${qData.verse}</div>
        ${step.cue ? `<div class="pulse-ring" style="opacity: 0.3"></div>` : ''}
      `;
      // Update background wash
      const bgMap = {
        'lk': 'wash-saffron.png',
        'compassion': 'wash-teal.png',
        'joy': 'wash-jade.png',
        'equanimity': 'wash-indigo.png'
      };
      bgLayer.style.backgroundImage = `url('./assets/blender/${bgMap[step.q]}')`;
      bgLayer.style.opacity = '0.3';
    }
    
    container.style.opacity = 1;
  }, 200); // match transition partially
}
