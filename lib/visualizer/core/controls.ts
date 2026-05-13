// lib/visualizer/core/controls.ts

/**
 * Controls system for algorithm visualizations.
 * Two exports:
 *  - getControlsHTML()   → HTML string for controls bar content
 *  - getControlsEngine() → JS string for controls logic
 *
 * Features:
 *  - Play / Pause toggle
 *  - Next / Prev step
 *  - Reset to beginning
 *  - Speed cycling (0.5x → 1x → 1.5x → 2x → 3x)
 *  - Progress bar fill
 *  - Keyboard shortcuts (Space, ←, →, R)
 *  - Button state management (disabled at boundaries)
 *  - Auto-pause at last step
 *  - Callbacks: onStepChange, onComplete, onReset
 */

export function getControlsHTML(): string {
  return `
<!-- Progress Bar -->
<div id="progress-bar-track">
  <div id="progress-bar-fill" style="width:0%"></div>
</div>

<!-- Reset -->
<button
  class="ctrl-btn"
  id="ctrl-reset"
  title="Reset (R)"
  aria-label="Reset"
>
  ↺
</button>

<!-- Prev -->
<button
  class="ctrl-btn"
  id="ctrl-prev"
  title="Previous step (←)"
  aria-label="Previous"
  disabled
>
  ◀
</button>

<!-- Play / Pause -->
<button
  class="ctrl-btn play-btn"
  id="ctrl-play"
  title="Play / Pause (Space)"
  aria-label="Play"
>
  ▶
</button>

<!-- Next -->
<button
  class="ctrl-btn"
  id="ctrl-next"
  title="Next step (→)"
  aria-label="Next"
>
  ▶▶
</button>

<div class="ctrl-separator"></div>

<!-- Speed -->
<button
  class="ctrl-btn speed-btn"
  id="ctrl-speed"
  title="Change speed"
  aria-label="Speed"
>
  1×
</button>
  `.trim();
}

export function getControlsEngine(): string {
  return `
/* ═══════════════════════════════════════════════════
   PLAYBACK ENGINE + CONTROLS
═══════════════════════════════════════════════════ */

const PlaybackEngine = (() => {

  // ── State ────────────────────────────────────────
  let _steps        = [];       // full steps array
  let _currentIndex = 0;        // current step index
  let _isPlaying    = false;    // play/pause state
  let _playTimer    = null;     // setInterval handle
  let _speed        = 1.0;      // current speed multiplier
  let _baseInterval = 1200;     // base ms between steps at 1x
  let _initialized  = false;

  // ── Callbacks (set by algorithm) ─────────────────
  let _onStepChange = null;   // fn(step, index)
  let _onComplete   = null;   // fn()
  let _onReset      = null;   // fn()

  // ── Speed options ─────────────────────────────────
  const SPEEDS = [0.5, 1, 1.5, 2, 3];
  let _speedIndex = 1; // default 1x

  // ── DOM refs ─────────────────────────────────────
  const _btn = {
    play:  () => document.getElementById('ctrl-play'),
    prev:  () => document.getElementById('ctrl-prev'),
    next:  () => document.getElementById('ctrl-next'),
    reset: () => document.getElementById('ctrl-reset'),
    speed: () => document.getElementById('ctrl-speed'),
  };
  const _progressFill = () => document.getElementById('progress-bar-fill');

  // ── Internal: update progress bar ────────────────
  function _updateProgress() {
    const fill  = _progressFill();
    if (!fill) return;
    const total = _steps.length;
    if (total === 0) { fill.style.width = '0%'; return; }
    const pct = (_currentIndex / Math.max(total - 1, 1)) * 100;
    fill.style.width = _clamp(pct, 0, 100) + '%';
  }

  // ── Internal: update button states ───────────────
  function _updateButtons() {
    const play  = _btn.play();
    const prev  = _btn.prev();
    const next  = _btn.next();
    const reset = _btn.reset();

    if (play) {
      play.textContent = _isPlaying ? '⏸' : '▶';
      play.title       = _isPlaying ? 'Pause (Space)' : 'Play (Space)';
    }

    if (prev)  prev.disabled  = (_currentIndex <= 0);
    if (next)  next.disabled  = (_currentIndex >= _steps.length - 1);
    if (reset) reset.disabled = (_currentIndex === 0 && !_isPlaying);
  }

  // ── Internal: get interval for current speed ──────
  function _getInterval() {
    // Apply step timing multiplier if available
    const step     = _steps[_currentIndex];
    const timingMult = (step && step.timingMult) ? step.timingMult : 1.0;
    return (_baseInterval / _speed) * timingMult;
  }

  // ── Internal: execute renderStep ─────────────────
  function _executeStep(index) {
    if (index < 0 || index >= _steps.length) return;
    _currentIndex = index;

    // Call user-provided renderStep
    if (typeof renderStep === 'function') {
      try {
        renderStep(index);
      } catch(e) {
        console.error('[PlaybackEngine] renderStep error at index', index, e);
      }
    }

    _updateProgress();
    _updateButtons();

    // Update caption step indicator
    if (typeof CaptionEngine !== 'undefined') {
      CaptionEngine.updateStepIndicator(index);
    }

    // Call onStepChange callback
    if (_onStepChange) {
      try { _onStepChange(_steps[index], index); } catch(e) {}
    }
  }

  // ── Internal: start play loop ─────────────────────
  function _startLoop() {
    _stopLoop();
    _playTimer = setInterval(() => {
      if (_currentIndex >= _steps.length - 1) {
        _stopLoop();
        _isPlaying = false;
        _updateButtons();
        _onCompleteHandler();
        return;
      }
      _executeStep(_currentIndex + 1);
    }, _getInterval());
  }

  // ── Internal: stop play loop ──────────────────────
  function _stopLoop() {
    if (_playTimer) {
      clearInterval(_playTimer);
      _playTimer = null;
    }
  }

  // ── Internal: completion handler ──────────────────
  function _onCompleteHandler() {
    // Show completion overlay
    const overlay = document.getElementById('completion-overlay');
    if (overlay) {
      // Fill completion stats
      _fillCompletionCard();
      overlay.classList.add('visible');
    }

    // Trigger completion animations
    if (typeof celebrationWave === 'function') {
      setTimeout(() => celebrationWave(), 200);
    }

    // Call user callback
    if (_onComplete) {
      try { _onComplete(); } catch(e) {}
    }
  }

  // ── Internal: fill completion card ───────────────
  function _fillCompletionCard() {
    // Completion emoji
    const emojiEl = document.getElementById('completion-emoji');
    if (emojiEl) emojiEl.textContent = _completionConfig.emoji || '✅';

    // Title
    const titleEl = document.getElementById('completion-title');
    if (titleEl) titleEl.textContent = _completionConfig.title || 'Complete!';

    // Subtitle
    const subtitleEl = document.getElementById('completion-subtitle');
    if (subtitleEl) subtitleEl.textContent = _completionConfig.subtitle || 'Algorithm finished successfully.';

    // Stats
    const statsEl = document.getElementById('completion-stats');
    if (statsEl && _completionConfig.stats) {
      statsEl.innerHTML = _completionConfig.stats.map(s =>
        '<div class="completion-stat">' +
        '  <div class="completion-stat-value">' + s.value + '</div>' +
        '  <div class="completion-stat-label">' + s.label + '</div>' +
        '</div>'
      ).join('');
    }
  }

  // ── Completion config (set by algorithm) ─────────
  let _completionConfig = {
    emoji:    '✅',
    title:    'Complete!',
    subtitle: 'Algorithm finished successfully.',
    stats:    [],
  };

  // ── Public API ────────────────────────────────────

  /**
   * init(config)
   * Initialize playback engine.
   *
   * config = {
   *   steps:        [],          // precomputed steps array
   *   baseInterval: 1200,        // ms between steps at 1x speed
   *   onStepChange: fn(step,i),  // called on every step
   *   onComplete:   fn(),        // called when last step reached
   *   onReset:      fn(),        // called on reset
   *   completionConfig: {
   *     emoji:    '🎉',
   *     title:    'Sorted!',
   *     subtitle: 'Bubble sort complete.',
   *     stats:    [{ label: 'Swaps', value: 12 }],
   *   }
   * }
   */
  function init(config) {
    if (_initialized) return;
    _initialized = true;
    config = config || {};

    _steps        = config.steps        || [];
    _baseInterval = config.baseInterval || 1200;
    _onStepChange = config.onStepChange || null;
    _onComplete   = config.onComplete   || null;
    _onReset      = config.onReset      || null;

    if (config.completionConfig) {
      _completionConfig = Object.assign(_completionConfig, config.completionConfig);
    }

    // Bind button events
    _bindButtons();

    // Bind keyboard
    _bindKeyboard();

    // Bind completion overlay close
    _bindCompletionClose();

    // Render first step
    if (_steps.length > 0) {
      _executeStep(0);
    }

    _updateButtons();
    _updateProgress();
  }

  /**
   * play()
   * Start auto-play.
   */
  function play() {
    if (_isPlaying) return;
    if (_currentIndex >= _steps.length - 1) {
      // At end — restart from beginning
      _executeStep(0);
    }
    _isPlaying = true;
    _updateButtons();
    _startLoop();
  }

  /**
   * pause()
   * Pause auto-play.
   */
  function pause() {
    if (!_isPlaying) return;
    _isPlaying = false;
    _stopLoop();
    _updateButtons();
  }

  /**
   * togglePlay()
   * Toggle between play and pause.
   */
  function togglePlay() {
    if (_isPlaying) pause();
    else            play();
  }

  /**
   * next()
   * Go to next step.
   */
  function next() {
    if (_currentIndex >= _steps.length - 1) return;
    pause();
    _executeStep(_currentIndex + 1);
  }

  /**
   * prev()
   * Go to previous step.
   */
  function prev() {
    if (_currentIndex <= 0) return;
    pause();
    _executeStep(_currentIndex - 1);
  }

  /**
   * reset()
   * Reset to step 0.
   */
  function reset() {
    pause();
    _currentIndex = 0;

    // Hide completion overlay
    const overlay = document.getElementById('completion-overlay');
    if (overlay) overlay.classList.remove('visible');

    // Clear sidebar
    if (typeof StatsEngine !== 'undefined') {
      StatsEngine.reset();
      StatsEngine.clearVariables();
    }

    // Clear caption
    if (typeof CaptionEngine !== 'undefined') {
      CaptionEngine.clearCaption(true);
    }

    // Call user reset callback
    if (_onReset) {
      try { _onReset(); } catch(e) {}
    }

    // Re-render first step
    _executeStep(0);
    _updateButtons();
    _updateProgress();
  }

  /**
   * goTo(index)
   * Jump to a specific step index.
   */
  function goTo(index) {
    pause();
    const clamped = _clamp(index, 0, _steps.length - 1);
    _executeStep(clamped);
  }

  /**
   * cycleSpeed()
   * Cycle through speed options.
   */
  function cycleSpeed() {
    _speedIndex = (_speedIndex + 1) % SPEEDS.length;
    _speed      = SPEEDS[_speedIndex];

    const btn = _btn.speed();
    if (btn) {
      btn.textContent = _speed + '×';
      // Flash
      btn.style.transition = 'color 200ms ease, transform 200ms ease';
      btn.style.color      = 'var(--accent-yellow)';
      btn.style.transform  = 'scale(1.15)';
      setTimeout(() => {
        btn.style.color     = '';
        btn.style.transform = '';
      }, 300);
    }

    // Restart loop with new speed if playing
    if (_isPlaying) {
      _startLoop();
    }
  }

  /**
   * setSpeed(multiplier)
   * Set exact speed (0.5 | 1 | 1.5 | 2 | 3).
   */
  function setSpeed(multiplier) {
    const idx = SPEEDS.indexOf(multiplier);
    if (idx !== -1) {
      _speedIndex = idx;
      _speed      = multiplier;
      const btn   = _btn.speed();
      if (btn) btn.textContent = _speed + '×';
      if (_isPlaying) _startLoop();
    }
  }

  /**
   * getState()
   * Returns current engine state.
   */
  function getState() {
    return {
      currentIndex: _currentIndex,
      totalSteps:   _steps.length,
      isPlaying:    _isPlaying,
      speed:        _speed,
      currentStep:  _steps[_currentIndex] || null,
    };
  }

  // ── Internal: bind button click events ───────────
  function _bindButtons() {
    const playBtn  = _btn.play();
    const prevBtn  = _btn.prev();
    const nextBtn  = _btn.next();
    const resetBtn = _btn.reset();
    const speedBtn = _btn.speed();

    if (playBtn)  playBtn.addEventListener('click',  togglePlay);
    if (prevBtn)  prevBtn.addEventListener('click',  prev);
    if (nextBtn)  nextBtn.addEventListener('click',  next);
    if (resetBtn) resetBtn.addEventListener('click', reset);
    if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);
  }

  // ── Internal: keyboard shortcuts ─────────────────
  function _bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          reset();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(_steps.length - 1);
          break;
      }
    });
  }

  // ── Internal: completion overlay close ───────────
  function _bindCompletionClose() {
    // Close button
    const closeBtn = document.getElementById('completion-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const overlay = document.getElementById('completion-overlay');
        if (overlay) overlay.classList.remove('visible');
      });
    }

    // Click outside card to close
    const overlay = document.getElementById('completion-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
      });
    }
  }

  // ── Return public interface ───────────────────────
  return {
    init,
    play,
    pause,
    togglePlay,
    next,
    prev,
    reset,
    goTo,
    cycleSpeed,
    setSpeed,
    getState,
  };

})();

/* ═══════════════════════════════════════════════════
   CONVENIENCE ALIASES (global)
   renderStep() is defined by the algorithm — 
   PlaybackEngine calls it internally.
═══════════════════════════════════════════════════ */

// Global clamp (needed by engine — defined here if
// animations.ts not loaded yet)
if (typeof _clamp === 'undefined') {
  var _clamp = function(val, min, max) {
    return Math.min(Math.max(val, min), max);
  };
}

/**
 * initPlayback(config)
 * Global shorthand for PlaybackEngine.init
 */
function initPlayback(config) {
  PlaybackEngine.init(config);
}

/**
 * playVisualization()
 * Global play shorthand.
 */
function playVisualization() {
  PlaybackEngine.play();
}

/**
 * pauseVisualization()
 * Global pause shorthand.
 */
function pauseVisualization() {
  PlaybackEngine.pause();
}

/**
 * resetVisualization()
 * Global reset shorthand.
 */
function resetVisualization() {
  PlaybackEngine.reset();
}
  `.trim();
}