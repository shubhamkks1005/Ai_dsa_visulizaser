// lib/visualizer/core/caption.ts

/**
 * Caption engine for algorithm visualizations.
 * Returns JavaScript code as a string — injected into <script> in final HTML.
 *
 * Features:
 *  - Word-by-word animated reveal
 *  - Bold/accent keyword highlighting
 *  - Important step styling (yellow)
 *  - Step counter indicator (Step X / Total)
 *  - Smooth transition between captions
 *  - Queue system (prevents caption flash overlap)
 */
export function getCaptionEngine(): string {
  return `
/* ═══════════════════════════════════════════════════
   CAPTION ENGINE
═══════════════════════════════════════════════════ */

const CaptionEngine = (() => {

  // ── State ────────────────────────────────────────
  let _currentText    = '';
  let _isAnimating    = false;
  let _queue          = [];
  let _boldKeywords   = [];
  let _totalSteps     = 0;
  let _revealTimer    = null;

  // ── DOM refs (resolved lazily) ───────────────────
  function _captionEl()   { return document.getElementById('caption-text'); }
  function _indicatorEl() { return document.getElementById('step-indicator'); }

  // ── Keyword sets ─────────────────────────────────
  const ALWAYS_BOLD = [
    // Algorithm actions
    'jump','jumped','jumping','swap','swapped','swapping',
    'compare','comparing','compared','found','complete','done',
    'sorted','searching','reached','start','finish','return',
    'push','pop','enqueue','dequeue','insert','delete','visit',
    'merge','split','divide','conquer','backtrack','recurse',
    // Values / emphasis
    'minimum','maximum','optimal','best','worst','final',
    'first','last','only','empty','full','overflow',
    // Structural
    'left','right','mid','pivot','root','leaf','parent','child',
  ];

  // ── Internal: render words with animation ────────
  function _renderWords(text, isImportant) {
    const el = _captionEl();
    if (!el) return;

    // Clear previous content instantly
    el.innerHTML = '';

    const words = text.split(/\s+/).filter(w => w.length > 0);

    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';

      // Determine if word should be bold/accent
      const clean    = word.replace(/[*_.,!?:;]/g, '').toLowerCase();
      const isManual = word.startsWith('*') || word.startsWith('_');
      const isAuto   = ALWAYS_BOLD.includes(clean);
      const isBold   = _boldKeywords.includes(clean) || isManual || isAuto;

      // Clean display text
      span.textContent = word.replace(/^[*_]+|[*_]+$/g, '') + ' ';

      if (isBold && isImportant) {
        span.classList.add('important'); // yellow
      } else if (isBold) {
        span.classList.add('bold');      // cyan
      }

      // Staggered reveal timing
      const baseDelay = i * 55;
      span.style.animationDelay = baseDelay + 'ms';
      el.appendChild(span);
    });

    // Total animation time
    return words.length * 55 + 300;
  }

  // ── Internal: process queue ───────────────────────
  function _processQueue() {
    if (_queue.length === 0) {
      _isAnimating = false;
      return;
    }

    _isAnimating = true;
    const { text, stepIndex, isImportant } = _queue.shift();
    _currentText = text;

    // Update step indicator
    _updateIndicator(stepIndex);

    // Fade out → render → fade in
    const el = _captionEl();
    if (el) {
      el.style.transition = 'opacity 120ms ease';
      el.style.opacity    = '0';

      setTimeout(() => {
        const duration = _renderWords(text, isImportant);
        el.style.opacity = '1';

        // After animation completes, process next
        setTimeout(() => {
          _isAnimating = false;
          if (_queue.length > 0) _processQueue();
        }, Math.min(duration, 800));

      }, 130);
    }
  }

  // ── Internal: update step indicator ──────────────
  function _updateIndicator(stepIndex) {
    const el = _indicatorEl();
    if (!el) return;

    if (stepIndex === null || stepIndex === undefined || _totalSteps === 0) {
      el.textContent = '';
      return;
    }

    const current = stepIndex + 1;
    const total   = _totalSteps;

    el.textContent = current + ' / ' + total;

    // Flash on update
    el.style.transition = 'color 200ms ease';
    el.style.color      = 'var(--accent)';
    setTimeout(() => {
      el.style.color = 'var(--text-muted)';
    }, 400);
  }

  // ── Public API ────────────────────────────────────

  /**
   * setCaption(text, stepIndex?, isImportant?, immediate?)
   * Main function to set caption text.
   * Queues if currently animating, or shows immediately.
   *
   * @param text        Caption text. Wrap words in * for bold.
   * @param stepIndex   Current step index (for indicator)
   * @param isImportant If true, bold words become yellow
   * @param immediate   If true, skip queue and show instantly
   */
  function setCaption(text, stepIndex, isImportant, immediate) {
    if (!text) return;
    isImportant = isImportant || false;

    if (immediate) {
      // Clear queue, show immediately
      _queue      = [];
      _isAnimating = false;
      clearTimeout(_revealTimer);
      _renderWords(text, isImportant);
      _updateIndicator(stepIndex);
      return;
    }

    // Add to queue
    _queue.push({ text, stepIndex, isImportant });

    if (!_isAnimating) {
      _processQueue();
    }
  }

  /**
   * clearCaption(immediate?)
   * Clears caption text.
   */
  function clearCaption(immediate) {
    _queue = [];
    const el = _captionEl();
    if (!el) return;

    if (immediate) {
      el.innerHTML = '';
      return;
    }

    el.style.transition = 'opacity 200ms ease';
    el.style.opacity    = '0';
    setTimeout(() => {
      el.innerHTML    = '';
      el.style.opacity = '1';
    }, 210);
  }

  /**
   * setTotalSteps(total)
   * Must be called once at init with total step count.
   */
  function setTotalSteps(total) {
    _totalSteps = total || 0;
  }

  /**
   * addBoldKeywords(keywords)
   * Add custom words that should always appear bold/accented.
   * @param keywords Array of lowercase strings
   */
  function addBoldKeywords(keywords) {
    if (Array.isArray(keywords)) {
      _boldKeywords = _boldKeywords.concat(
        keywords.map(k => k.toLowerCase())
      );
    }
  }

  /**
   * showImportantCaption(text, stepIndex?, duration?)
   * Shows a large dramatic caption overlay for key moments.
   * Different from normal caption — appears in scene area.
   */
  function showImportantCaption(text, stepIndex, duration) {
    duration = duration || 2200;

    // Also update normal caption bar
    setCaption(text, stepIndex, true, true);

    // Create overlay dramatic text in scene
    const scene = document.getElementById('scene-area');
    if (!scene) return;

    // Remove existing overlay if any
    const existing = document.getElementById('_dramatic_caption');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id    = '_dramatic_caption';
    Object.assign(overlay.style, {
      position:      'absolute',
      bottom:        '80px',
      left:          '50%',
      transform:     'translateX(-50%)',
      zIndex:        '27',
      fontSize:      '18px',
      fontWeight:    '800',
      color:         'var(--accent-yellow)',
      textShadow:    '0 0 20px rgba(246,224,94,0.6)',
      letterSpacing: '0.04em',
      textAlign:     'center',
      pointerEvents: 'none',
      whiteSpace:    'nowrap',
      maxWidth:      '80%',
      opacity:       '0',
      transition:    'opacity 300ms ease, transform 300ms ease',
    });
    overlay.textContent = text;
    scene.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity   = '1';
        overlay.style.transform = 'translateX(-50%) translateY(-8px)';
      });
    });

    // Animate out
    setTimeout(() => {
      overlay.style.opacity   = '0';
      overlay.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 350);
    }, duration - 350);
  }

  /**
   * updateStepIndicator(stepIndex, total?)
   * Manually update the step indicator.
   */
  function updateStepIndicator(stepIndex, total) {
    if (total !== undefined) _totalSteps = total;
    _updateIndicator(stepIndex);
  }

  /**
   * flashCaption(text, color?, duration?)
   * Briefly flashes a colored message in caption bar.
   * Used for quick feedback (e.g., "Already sorted!")
   */
  function flashCaption(text, color, duration) {
    color    = color    || 'var(--accent-green)';
    duration = duration || 1500;

    const el = _captionEl();
    if (!el) return;

    // Save current
    const savedHTML  = el.innerHTML;
    const savedColor = el.style.color;

    // Flash new text
    el.innerHTML    = '<span class="word bold" style="animation:none;opacity:1;color:' + color + '">' + text + '</span>';
    el.style.color  = color;

    setTimeout(() => {
      el.innerHTML   = savedHTML;
      el.style.color = savedColor;
    }, duration);
  }

  // ── Return public interface ───────────────────────
  return {
    setCaption,
    clearCaption,
    setTotalSteps,
    addBoldKeywords,
    showImportantCaption,
    updateStepIndicator,
    flashCaption,
  };

})();

/* ═══════════════════════════════════════════════════
   CONVENIENCE ALIASES (global)
═══════════════════════════════════════════════════ */

/**
 * setCaption(text, stepIndex?, isImportant?, immediate?)
 * Global shorthand for CaptionEngine.setCaption
 */
function setCaption(text, stepIndex, isImportant, immediate) {
  CaptionEngine.setCaption(text, stepIndex, isImportant, immediate);
}

/**
 * showImportantCaption(text, stepIndex?, duration?)
 * Global shorthand for CaptionEngine.showImportantCaption
 */
function showImportantCaption(text, stepIndex, duration) {
  CaptionEngine.showImportantCaption(text, stepIndex, duration);
}

/**
 * flashCaption(text, color?, duration?)
 * Global shorthand for CaptionEngine.flashCaption
 */
function flashCaption(text, color, duration) {
  CaptionEngine.flashCaption(text, color, duration);
}
  `.trim();
}