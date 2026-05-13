// lib/visualizer/core/playback.ts

/**
 * Base renderStep function — the bridge between
 * PlaybackEngine and algorithm-specific renderScene().
 *
 * Returns JavaScript code as a string — injected into <script> in final HTML.
 *
 * Flow per step:
 *  1. Get step data from steps array
 *  2. Update caption via CaptionEngine
 *  3. Update stats + variables via StatsEngine
 *  4. Call algorithm-specific renderScene(step)
 *  5. Handle important step effects
 *  6. Handle completion step effects
 */
export function getPlaybackEngine(): string {
  return `
/* ═══════════════════════════════════════════════════
   BASE RENDER STEP — Bridge between engine + scene
═══════════════════════════════════════════════════ */

/**
 * renderStep(index)
 *
 * Called by PlaybackEngine on every step change.
 * DO NOT redefine this in algorithm-specific code.
 *
 * Algorithm code should define:
 *   renderScene(step) — handles visual updates for one step
 *   STEPS             — precomputed array of step objects
 */
function renderStep(index) {
  // ── Guard ─────────────────────────────────────
  if (!window.STEPS || index < 0 || index >= window.STEPS.length) return;

  const step  = window.STEPS[index];
  const total = window.STEPS.length;

  if (!step) return;

  // ── 1. Caption update ─────────────────────────
  if (typeof CaptionEngine !== 'undefined') {
    const text        = step.caption || step.description || '';
    const isImportant = step.important === true;

    if (isImportant) {
      // Important steps get dramatic caption
      CaptionEngine.showImportantCaption(text, index, 2000);
    } else {
      CaptionEngine.setCaption(text, index, false, false);
    }
  }

  // ── 2. Stats + variables update ───────────────
  if (typeof StatsEngine !== 'undefined') {
    // Auto-update variables from step
    StatsEngine.showStepSummary(step, index);

    // Update current step counter if registered
    StatsEngine.update('currentStep', index + 1, false);
  }

  // ── 3. Algorithm-specific scene render ────────
  if (typeof renderScene === 'function') {
    try {
      renderScene(step, index);
    } catch (err) {
      console.error('[renderStep] renderScene error at step', index, err);
    }
  }

  // ── 4. Important step effects ─────────────────
  if (step.important) {
    // Camera shake on dramatic moments
    if (typeof cameraShake === 'function' && step.action !== 'initialize') {
      setTimeout(() => cameraShake(null, 3, 300), 100);
    }
  }

  // ── 5. Action-based global effects ────────────
  _handleGlobalActionEffects(step, index);

  // ── 6. First step special handling ────────────
  if (index === 0) {
    _handleFirstStep(step);
  }

  // ── 7. Last step special handling ─────────────
  if (index === total - 1) {
    _handleLastStep(step, total);
  }
}

/* ─────────────────────────────────────────────────
   GLOBAL ACTION EFFECTS
   Common visual effects triggered by step.action
───────────────────────────────────────────────── */
function _handleGlobalActionEffects(step, index) {
  if (!step || !step.action) return;

  const action = step.action.toLowerCase();

  switch (action) {

    case 'initialize':
      // Subtle fade-in on init — handled by scene
      break;

    case 'compare':
      // Slight comparison flash — scene handles details
      if (step.important && typeof glowFlash === 'function') {
        const sceneEl = document.getElementById('scene-content');
        if (sceneEl) {
          // Very subtle — scene's own compare animation is primary
        }
      }
      break;

    case 'swap':
      // Camera micro-shake on swap
      if (typeof cameraShake === 'function') {
        setTimeout(() => cameraShake(null, 2, 200), 50);
      }
      break;

    case 'found':
    case 'complete':
    case 'return':
      // Victory effects — scene handles primary
      // Global: slight brightness boost
      if (typeof finalReveal === 'function') {
        setTimeout(() => finalReveal(), 200);
      }
      break;

    case 'error':
    case 'backtrack':
      // Shake on error/backtrack
      if (typeof cameraShake === 'function') {
        setTimeout(() => cameraShake(null, 4, 350), 50);
      }
      break;

    default:
      break;
  }
}

/* ─────────────────────────────────────────────────
   FIRST STEP HANDLER
───────────────────────────────────────────────── */
function _handleFirstStep(step) {
  // Clear any leftover state from previous run
  if (typeof StatsEngine !== 'undefined') {
    StatsEngine.reset();
  }

  // Remove completion overlay if visible
  const overlay = document.getElementById('completion-overlay');
  if (overlay) overlay.classList.remove('visible');

  // Scene intro — slight zoom in effect
  const sceneContent = document.getElementById('scene-content');
  if (sceneContent && typeof fadeInScale === 'function') {
    // Only on very first render (not reset)
    if (!window._hasRenderedFirstStep) {
      window._hasRenderedFirstStep = true;
      sceneContent.style.opacity = '0';
      setTimeout(() => {
        sceneContent.style.transition = 'opacity 500ms ease';
        sceneContent.style.opacity    = '1';
      }, 100);
    }
  }
}

/* ─────────────────────────────────────────────────
   LAST STEP HANDLER
───────────────────────────────────────────────── */
function _handleLastStep(step, total) {
  // Update stats with final values
  if (typeof StatsEngine !== 'undefined') {
    const state = typeof PlaybackEngine !== 'undefined'
      ? PlaybackEngine.getState()
      : null;

    // Update completion card stats dynamically
    _updateCompletionStats(total);
  }
}

/* ─────────────────────────────────────────────────
   COMPLETION STATS UPDATER
   Reads current StatsEngine values for card
───────────────────────────────────────────────── */
function _updateCompletionStats(totalSteps) {
  // Try to get live stats for completion card
  if (typeof StatsEngine === 'undefined') return;

  const statsEl = document.getElementById('completion-stats');
  if (!statsEl) return;

  // Build stats from StatsEngine current values
  const statKeys = ['comparisons', 'swaps', 'visited', 'pushes', 'pops'];
  const liveStats = [];

  statKeys.forEach(key => {
    const val = StatsEngine.get(key);
    if (val !== undefined && val !== 0) {
      liveStats.push({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: val,
      });
    }
  });

  // Always add total steps
  liveStats.push({ label: 'Steps', value: totalSteps });

  if (liveStats.length > 0) {
    statsEl.innerHTML = liveStats.map(s =>
      '<div class="completion-stat">' +
      '  <div class="completion-stat-value">' + s.value + '</div>' +
      '  <div class="completion-stat-label">' + s.label + '</div>' +
      '</div>'
    ).join('');
  }
}

/* ═══════════════════════════════════════════════════
   INITIALIZATION ORCHESTRATOR
   Called once when page loads — sets everything up
═══════════════════════════════════════════════════ */

/**
 * initVisualization(config)
 *
 * Master init function — call this from algorithm code.
 * Sets up StatsEngine, CaptionEngine, PlaybackEngine
 * in correct order.
 *
 * config = {
 *   // Required
 *   steps: [],                  // precomputed STEPS array
 *
 *   // Stats bar
 *   algorithmName:   string,
 *   timeComplexity:  string,
 *   spaceComplexity: string,
 *   stats: [
 *     { key, label, value, side }
 *   ],
 *
 *   // Caption
 *   boldKeywords: [],           // extra words to bold
 *
 *   // Playback
 *   baseInterval: 1200,         // ms between steps at 1x
 *   onStepChange: fn(step, i),
 *   onComplete:   fn(),
 *   onReset:      fn(),
 *
 *   // Completion card
 *   completionConfig: {
 *     emoji:    '🎉',
 *     title:    'Done!',
 *     subtitle: 'Algorithm complete.',
 *     stats:    [],
 *   },
 *
 *   // Scene init
 *   onInit: fn(),               // called after engines init
 *                               // use to build initial scene DOM
 * }
 */
function initVisualization(config) {
  config = config || {};

  // Store steps globally so renderStep can access
  window.STEPS = config.steps || [];

  // ── 1. Init StatsEngine ─────────────────────────
  if (typeof StatsEngine !== 'undefined') {
    StatsEngine.init({
      algorithmName:   config.algorithmName   || 'Algorithm',
      timeComplexity:  config.timeComplexity  || '',
      spaceComplexity: config.spaceComplexity || '',
      totalSteps:      window.STEPS.length,
      stats:           config.stats           || [],
    });
  }

  // ── 2. Init CaptionEngine ───────────────────────
  if (typeof CaptionEngine !== 'undefined') {
    CaptionEngine.setTotalSteps(window.STEPS.length);
    if (config.boldKeywords) {
      CaptionEngine.addBoldKeywords(config.boldKeywords);
    }
  }

  // ── 3. Call onInit — build initial scene DOM ────
  if (typeof config.onInit === 'function') {
    try {
      config.onInit();
    } catch(e) {
      console.error('[initVisualization] onInit error:', e);
    }
  }

  // ── 4. Init PlaybackEngine ──────────────────────
  if (typeof PlaybackEngine !== 'undefined') {
    PlaybackEngine.init({
      steps:           window.STEPS,
      baseInterval:    config.baseInterval    || 1200,
      onStepChange:    config.onStepChange    || null,
      onComplete:      config.onComplete      || null,
      onReset:         config.onReset         || null,
      completionConfig: config.completionConfig || {
        emoji:    '✅',
        title:    'Complete!',
        subtitle: 'Algorithm finished successfully.',
        stats:    [],
      },
    });
  }
}

/* ═══════════════════════════════════════════════════
   SCENE HELPER UTILITIES
   Used by renderScene() in algorithm code
═══════════════════════════════════════════════════ */

/**
 * clearScene()
 * Clears all dynamic content from scene-content.
 * Call at start of scene rebuild.
 */
function clearScene() {
  const el = document.getElementById('scene-content');
  if (el) el.innerHTML = '';
}

/**
 * clearSVG()
 * Clears SVG canvas (removes all drawn lines/arrows).
 */
function clearSVG() {
  const svg = document.getElementById('svg-canvas');
  if (svg) {
    // Keep defs (marker definitions)
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);
  }
}

/**
 * getSceneDimensions()
 * Returns current scene area dimensions.
 * Use for positioning elements correctly.
 */
function getSceneDimensions() {
  const el = document.getElementById('scene-area');
  if (!el) return { width: 800, height: 500, cx: 400, cy: 250 };
  const rect = el.getBoundingClientRect();
  return {
    width:  rect.width,
    height: rect.height,
    cx:     rect.width  / 2,
    cy:     rect.height / 2,
  };
}

/**
 * createElement(tag, attrs, styles, parent?)
 * Quick DOM element creator with attrs + styles.
 * Returns created element.
 */
function createElement(tag, attrs, styles, parent) {
  const el = document.createElement(tag || 'div');

  if (attrs) {
    Object.keys(attrs).forEach(k => {
      if (k === 'className') el.className = attrs[k];
      else if (k === 'textContent') el.textContent = attrs[k];
      else if (k === 'innerHTML') el.innerHTML = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
  }

  if (styles) {
    Object.assign(el.style, styles);
  }

  const parentEl = parent
    ? (typeof parent === 'string' ? document.getElementById(parent) : parent)
    : document.getElementById('scene-content');

  if (parentEl) parentEl.appendChild(el);
  return el;
}

/**
 * createSVGElement(tag, attrs, parent?)
 * Quick SVG element creator.
 */
function createSVGElement(tag, attrs, parent) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) {
    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
  }
  const parentEl = parent
    ? (typeof parent === 'string' ? document.getElementById(parent) : parent)
    : document.getElementById('svg-canvas');
  if (parentEl) parentEl.appendChild(el);
  return el;
}

/**
 * positionElement(el, x, y, centerX?, centerY?)
 * Positions element absolutely at (x, y).
 * If centerX/centerY true, offsets by element half-size.
 */
function positionElement(el, x, y, centerX, centerY) {
  el = typeof el === 'string' ? document.getElementById(el) : el;
  if (!el) return;

  el.style.position = 'absolute';

  if (centerX) {
    el.style.left = (x - el.offsetWidth  / 2) + 'px';
  } else {
    el.style.left = x + 'px';
  }

  if (centerY) {
    el.style.top = (y - el.offsetHeight / 2) + 'px';
  } else {
    el.style.top = y + 'px';
  }
}

/**
 * addToScene(el)
 * Appends element to scene-content.
 */
function addToScene(el) {
  const scene = document.getElementById('scene-content');
  if (scene && el) scene.appendChild(el);
}

/**
 * removeFromScene(id)
 * Removes element by id from scene-content.
 */
function removeFromScene(id) {
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/**
 * setSceneBackground(css)
 * Sets scene area background.
 */
function setSceneBackground(css) {
  const el = document.getElementById('scene-area');
  if (el) el.style.background = css;
}

/**
 * showToast(message, type?, duration?)
 * Shows a toast notification.
 * type: 'info' | 'success' | 'error'
 */
function showToast(message, type, duration) {
  type     = type     || 'info';
  duration = duration || 2500;

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className   = 'toast ' + type;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'opacity 300ms ease, transform 300ms ease';
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
  }, duration);
}
  `.trim();
}