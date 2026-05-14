// lib/visualizer/controls.ts

// ═══════════════════════════════════════════════════
// CONTROLS CSS
// ═══════════════════════════════════════════════════

export const controlsCSS = `
/* ═══════════════════════════════════════════════════
   CONTROLS BAR — Always visible at very bottom
   ═══════════════════════════════════════════════════ */
#controls-bar {
  flex-shrink: 0;
  padding: 8px 16px;
  background: rgba(13, 17, 23, 0.97);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 60;
}

/* Progress bar */
#progress-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

#progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #63b3ed, #9f7aea);
  border-radius: 4px;
  transition: width 0.3s ease;
}

#progress-container:hover {
  height: 6px;
}

#progress-container:hover #progress-fill {
  background: linear-gradient(90deg, #7dd3fc, #c084fc);
}

/* Button row */
#controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Control buttons */
.ctrl-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: #e2e8f0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  outline: none;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.ctrl-btn:active {
  transform: scale(0.96);
}

.ctrl-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}

/* Play button special styling */
#btn-play {
  padding: 6px 20px;
  background: rgba(99, 179, 237, 0.15);
  border-color: rgba(99, 179, 237, 0.3);
  color: #63b3ed;
  font-weight: 700;
}

#btn-play:hover {
  background: rgba(99, 179, 237, 0.25);
}

#btn-play.playing {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

/* Speed buttons */
#speed-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 12px;
  padding: 2px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.speed-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
  outline: none;
}

.speed-btn:hover {
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
}

.speed-btn.active {
  background: rgba(99, 179, 237, 0.2);
  color: #63b3ed;
}

/* Keyboard hint */
#keyboard-hint {
  font-size: 10px;
  color: #475569;
  text-align: center;
  margin-top: 2px;
  letter-spacing: 0.3px;
}

#keyboard-hint kbd {
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: monospace;
  font-size: 10px;
  color: #64748b;
}
`;

// ═══════════════════════════════════════════════════
// CONTROLS HTML
// ═══════════════════════════════════════════════════

export const controlsHTML = `
<div id="controls-bar">
  <div id="progress-container" title="Click to seek">
    <div id="progress-fill"></div>
  </div>
  <div id="controls-row">
    <button class="ctrl-btn" id="btn-reset" title="Reset (R)">⟲ Reset</button>
    <button class="ctrl-btn" id="btn-prev" title="Previous Step (←)">◂ Prev</button>
    <button class="ctrl-btn" id="btn-play" title="Play/Pause (Space)">▶ Play</button>
    <button class="ctrl-btn" id="btn-next" title="Next Step (→)">Next ▸</button>
    <div id="speed-controls">
      <button class="speed-btn" data-speed="0.5">0.5x</button>
      <button class="speed-btn active" data-speed="1">1x</button>
      <button class="speed-btn" data-speed="2">2x</button>
      <button class="speed-btn" data-speed="3">3x</button>
    </div>
  </div>
  <div id="keyboard-hint">
    <kbd>Space</kbd> Play/Pause &nbsp;
    <kbd>←</kbd> Prev &nbsp;
    <kbd>→</kbd> Next &nbsp;
    <kbd>R</kbd> Reset
  </div>
</div>
`;

// ═══════════════════════════════════════════════════
// CONTROLS JS
// ═══════════════════════════════════════════════════

export const controlsJS = `
/* ═══════════════════════════════════════════════════
   PLAYBACK ENGINE
   ═══════════════════════════════════════════════════ */

window.STEPS = window.STEPS || [];
window.currentStep = -1;
window.isPlaying = false;
window.playbackSpeed = 1;
window.baseInterval = 1200;
window._playTimer = null;

/* ─── Core playback functions ──────────────────── */

function _getStepInterval() {
  if (!window.STEPS || window.STEPS.length === 0) return window.baseInterval;
  var step = window.STEPS[window.currentStep];
  var mult = (step && typeof step.timingMult === 'number') ? step.timingMult : 1;
  return Math.max(200, (window.baseInterval * mult) / window.playbackSpeed);
}

function _updateProgress() {
  var fill = document.getElementById('progress-fill');
  if (!fill) return;
  var total = window.STEPS.length;
  if (total === 0) { fill.style.width = '0%'; return; }
  var pct = ((window.currentStep + 1) / total) * 100;
  fill.style.width = pct + '%';
}

function _updateButtonStates() {
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var btnPlay = document.getElementById('btn-play');
  var btnReset = document.getElementById('btn-reset');

  if (btnPrev) btnPrev.disabled = window.currentStep <= 0;
  if (btnNext) btnNext.disabled = window.currentStep >= window.STEPS.length - 1;

  if (btnPlay) {
    if (window.isPlaying) {
      btnPlay.textContent = '⏸ Pause';
      btnPlay.classList.add('playing');
    } else {
      btnPlay.textContent = '▶ Play';
      btnPlay.classList.remove('playing');
    }
    btnPlay.disabled = !window.STEPS || window.STEPS.length === 0;
  }

  if (btnReset) btnReset.disabled = window.currentStep < 0;
}

function _executeStep(index) {
  if (!window.STEPS || index < 0 || index >= window.STEPS.length) return;

  window.currentStep = index;
  var step = window.STEPS[index];

  // Update step counter
  if (typeof updateStepCounter === 'function') {
    updateStepCounter(index + 1, window.STEPS.length);
  }

  // Update caption
  if (typeof setCaption === 'function' && step.caption) {
    setCaption(step.caption, step.important);
  }

  // Update variables in stats
  if (typeof updateVariables === 'function' && step.variables) {
    updateVariables(step.variables);
  }

  // Call AI's renderScene function
  if (typeof renderScene === 'function') {
    try {
      renderScene(step, index);
    } catch (e) {
      console.warn('renderScene error at step ' + index + ':', e);
    }
  }

  // Update progress bar
  _updateProgress();

  // Update button states
  _updateButtonStates();

  // Check if completed
  if (index === window.STEPS.length - 1 && window.isPlaying) {
    setTimeout(function() {
      stopPlayback();
    }, _getStepInterval());
  }
}

/* ─── Public playback controls ─────────────────── */

function nextStep() {
  if (!window.STEPS || window.STEPS.length === 0) return;
  if (window.currentStep >= window.STEPS.length - 1) return;
  _executeStep(window.currentStep + 1);
}

function prevStep() {
  if (window.currentStep <= 0) return;
  _executeStep(window.currentStep - 1);
}

function resetPlayback() {
  stopPlayback();
  window.currentStep = -1;

  // Reset step counter
  if (typeof updateStepCounter === 'function') {
    updateStepCounter(0, window.STEPS.length);
  }

  // Reset caption
  if (typeof clearCaption === 'function') {
    clearCaption();
  }

  // Reset progress
  _updateProgress();

  // Reset button states
  _updateButtonStates();

  // Clear animations
  if (typeof clearAllAnimations === 'function') {
    clearAllAnimations('scene-content');
  }

  // Call renderScene reset if exists
  if (typeof renderScene === 'function') {
    try {
      renderScene({ action: 'reset', step: 0, caption: '', variables: {}, highlight: [], important: false, timingMult: 1 }, -1);
    } catch (e) {
      // Ignore reset errors
    }
  }
}

function startPlayback() {
  if (!window.STEPS || window.STEPS.length === 0) return;
  if (window.isPlaying) return;

  window.isPlaying = true;
  _updateButtonStates();

  // If at end, restart
  if (window.currentStep >= window.STEPS.length - 1) {
    window.currentStep = -1;
  }

  // If not started, begin
  if (window.currentStep < 0) {
    _executeStep(0);
  }

  function playLoop() {
    if (!window.isPlaying) return;
    if (window.currentStep >= window.STEPS.length - 1) {
      stopPlayback();
      return;
    }

    window._playTimer = setTimeout(function() {
      if (!window.isPlaying) return;
      nextStep();
      playLoop();
    }, _getStepInterval());
  }

  playLoop();
}

function stopPlayback() {
  window.isPlaying = false;
  if (window._playTimer) {
    clearTimeout(window._playTimer);
    window._playTimer = null;
  }
  _updateButtonStates();
}

function togglePlayback() {
  if (window.isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function setSpeed(speed) {
  window.playbackSpeed = speed || 1;

  // Update speed button styles
  var speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(function(btn) {
    var btnSpeed = parseFloat(btn.getAttribute('data-speed'));
    if (btnSpeed === speed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // If playing, restart with new speed
  if (window.isPlaying) {
    stopPlayback();
    startPlayback();
  }
}

function seekTo(index) {
  if (!window.STEPS || index < 0 || index >= window.STEPS.length) return;
  var wasPlaying = window.isPlaying;
  if (wasPlaying) stopPlayback();
  _executeStep(index);
  if (wasPlaying) startPlayback();
}

/* ─── Button event listeners ──────────────────── */

function _initControls() {
  var btnReset = document.getElementById('btn-reset');
  var btnPrev = document.getElementById('btn-prev');
  var btnPlay = document.getElementById('btn-play');
  var btnNext = document.getElementById('btn-next');
  var progressBar = document.getElementById('progress-container');

  if (btnReset) btnReset.addEventListener('click', resetPlayback);
  if (btnPrev) btnPrev.addEventListener('click', prevStep);
  if (btnPlay) btnPlay.addEventListener('click', togglePlayback);
  if (btnNext) btnNext.addEventListener('click', nextStep);

  // Speed buttons
  var speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var speed = parseFloat(btn.getAttribute('data-speed'));
      setSpeed(speed);
    });
  });

  // Progress bar click to seek
  if (progressBar) {
    progressBar.addEventListener('click', function(e) {
      if (!window.STEPS || window.STEPS.length === 0) return;
      var rect = progressBar.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      var index = Math.floor(pct * window.STEPS.length);
      index = Math.max(0, Math.min(index, window.STEPS.length - 1));
      seekTo(index);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Don't capture if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        togglePlayback();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevStep();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextStep();
        break;
      case 'KeyR':
        e.preventDefault();
        resetPlayback();
        break;
    }
  });

  // Initial button states
  _updateButtonStates();

  // Initial step counter
  if (typeof updateStepCounter === 'function') {
    updateStepCounter(0, window.STEPS ? window.STEPS.length : 0);
  }
}
`;