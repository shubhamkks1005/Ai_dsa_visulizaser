// lib/visualizer/core/stats.ts

/**
 * Stats engine for algorithm visualizations.
 * Returns JavaScript code as a string — injected into <script> in final HTML.
 *
 * Features:
 *  - Dynamic stat items (comparisons, swaps, steps, etc.)
 *  - Animated count-up on value change
 *  - Flash highlight on update
 *  - Algorithm name + complexity badges in stats bar
 *  - Variable tracker (syncs with sidebar)
 *  - Batch update support
 */
export function getStatsEngine(): string {
  return `
/* ═══════════════════════════════════════════════════
   STATS ENGINE
═══════════════════════════════════════════════════ */

const StatsEngine = (() => {

  // ── Internal state ───────────────────────────────
  let _stats        = {};   // { key: { label, value, el } }
  let _prevValues   = {};   // for change detection
  let _variables    = {};   // sidebar variable tracker
  let _initialized  = false;

  // ── DOM helpers ──────────────────────────────────
  function _statsBar()    { return document.getElementById('stats-bar'); }
  function _statsLeft()   { return document.getElementById('stats-left'); }
  function _statsRight()  { return document.getElementById('stats-right'); }
  function _sidebar()     { return document.getElementById('sidebar-content'); }

  // ── Internal: animate number change ─────────────
  function _animateValue(el, oldVal, newVal, duration) {
    if (!el) return;
    duration = duration || 400;

    const oldNum = parseFloat(oldVal);
    const newNum = parseFloat(newVal);

    // If both numeric, count up
    if (!isNaN(oldNum) && !isNaN(newNum) && oldNum !== newNum) {
      const start     = performance.now();
      const diff      = newNum - oldNum;
      const isInt     = Number.isInteger(newNum);
      const suffix    = String(newVal).replace(/[0-9.\-]/g, '');

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = oldNum + diff * eased;
        el.textContent = (isInt ? Math.round(current) : current.toFixed(2)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = newVal;
      }
      requestAnimationFrame(step);
    } else {
      // Non-numeric: just update with flash
      el.textContent = newVal;
    }

    // Flash effect
    el.classList.remove('flash');
    void el.offsetWidth; // reflow
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 500);
  }

  // ── Internal: create stat item DOM ───────────────
  function _createStatItem(key, label, value, side) {
    const container = side === 'right' ? _statsRight() : _statsLeft();
    if (!container) return null;

    const item = document.createElement('div');
    item.className   = 'stat-item';
    item.dataset.key = key;

    const labelEl = document.createElement('div');
    labelEl.className   = 'stat-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className   = 'stat-value';
    valueEl.id          = 'stat-val-' + key;
    valueEl.textContent = String(value);

    item.appendChild(labelEl);
    item.appendChild(valueEl);
    container.appendChild(item);

    return valueEl;
  }

  // ── Internal: update sidebar variable card ───────
  function _updateSidebarVar(name, value, changed) {
    const sidebar = _sidebar();
    if (!sidebar) return;

    const cardId = 'var-card-' + name.replace(/[^a-zA-Z0-9]/g, '_');
    let card     = document.getElementById(cardId);

    if (!card) {
      // Create new card
      card    = document.createElement('div');
      card.id = cardId;
      card.className = 'var-card';

      const nameEl = document.createElement('span');
      nameEl.className   = 'var-name';
      nameEl.textContent = name;

      const valEl = document.createElement('span');
      valEl.className   = 'var-value';
      valEl.id          = cardId + '-val';
      valEl.textContent = String(value);

      card.appendChild(nameEl);
      card.appendChild(valEl);
      sidebar.appendChild(card);
    } else {
      // Update existing
      const valEl = document.getElementById(cardId + '-val');
      if (valEl) {
        valEl.textContent = String(value);
        if (changed) {
          valEl.classList.remove('changed');
          void valEl.offsetWidth;
          valEl.classList.add('changed');
          setTimeout(() => valEl.classList.remove('changed'), 600);
        }
      }
    }
  }

  // ── Public API ────────────────────────────────────

  /**
   * init(config)
   * Initialize stats bar with algorithm info and stat definitions.
   *
   * config = {
   *   algorithmName:  string,
   *   timeComplexity: string,
   *   spaceComplexity: string,   // optional
   *   totalSteps:     number,
   *   stats: [
   *     { key: 'comparisons', label: 'Comparisons', value: 0, side: 'left' },
   *     { key: 'swaps',       label: 'Swaps',       value: 0, side: 'left' },
   *     { key: 'steps',       label: 'Steps',       value: 0, side: 'right' },
   *   ]
   * }
   */
  function init(config) {
    if (_initialized) return;
    _initialized = true;
    config = config || {};

    const bar = _statsBar();
    if (!bar) return;

    // Clear bar
    bar.innerHTML = '';

    // ── Left side: algo badge + custom stats ─────
    const leftDiv = document.createElement('div');
    leftDiv.id        = 'stats-left';
    leftDiv.className = 'stats-left';

    // Algorithm name badge
    if (config.algorithmName) {
      const badge = document.createElement('div');
      badge.className   = 'algo-badge';
      badge.textContent = config.algorithmName;
      leftDiv.appendChild(badge);
    }

    bar.appendChild(leftDiv);

    // ── Right side: complexity + step counter ────
    const rightDiv = document.createElement('div');
    rightDiv.id        = 'stats-right';
    rightDiv.className = 'stats-right';

    // Time complexity badge
    if (config.timeComplexity) {
      const badge = document.createElement('div');
      badge.className   = 'complexity-badge';
      badge.title       = 'Time Complexity';
      badge.textContent = config.timeComplexity;
      rightDiv.appendChild(badge);
    }

    // Space complexity badge
    if (config.spaceComplexity) {
      const badge = document.createElement('div');
      badge.className   = 'complexity-badge';
      badge.title       = 'Space Complexity';
      badge.textContent = config.spaceComplexity;
      badge.style.background = 'rgba(159,122,234,0.12)';
      badge.style.borderColor = 'rgba(159,122,234,0.25)';
      badge.style.color       = 'var(--accent-purple)';
      rightDiv.appendChild(badge);
    }

    bar.appendChild(rightDiv);

    // ── Register custom stat items ────────────────
    if (Array.isArray(config.stats)) {
      config.stats.forEach(s => {
        const el = _createStatItem(
          s.key,
          s.label,
          s.value !== undefined ? s.value : 0,
          s.side || 'left'
        );
        _stats[s.key] = {
          label: s.label,
          value: s.value !== undefined ? s.value : 0,
          el:    el,
        };
        _prevValues[s.key] = s.value !== undefined ? s.value : 0;
      });
    }

    // Total steps stat (always shown right)
    if (config.totalSteps) {
      const el = _createStatItem('_totalSteps', 'Total Steps', config.totalSteps, 'right');
      _stats['_totalSteps'] = {
        label: 'Total Steps',
        value: config.totalSteps,
        el:    el,
      };
    }

    // Set total steps in caption engine too
    if (typeof CaptionEngine !== 'undefined' && config.totalSteps) {
      CaptionEngine.setTotalSteps(config.totalSteps);
    }
  }

  /**
   * update(key, value, animate?)
   * Update a single stat value.
   *
   * @param key     Stat key (must match one registered in init)
   * @param value   New value (string or number)
   * @param animate If false, skip count-up animation
   */
  function update(key, value, animate) {
    const stat = _stats[key];
    if (!stat || !stat.el) return;

    animate = animate !== false; // default true

    const oldVal = String(stat.value);
    const newVal = String(value);

    if (oldVal === newVal) return; // no change

    stat.value = value;

    if (animate) {
      _animateValue(stat.el, oldVal, newVal, 350);
    } else {
      stat.el.textContent = newVal;
    }

    _prevValues[key] = value;
  }

  /**
   * updateAll(statsObj, animate?)
   * Update multiple stats at once.
   *
   * @param statsObj { key: value, key2: value2, ... }
   * @param animate  If false, skip animation
   */
  function updateAll(statsObj, animate) {
    if (!statsObj) return;
    Object.keys(statsObj).forEach(key => {
      update(key, statsObj[key], animate);
    });
  }

  /**
   * increment(key, by?)
   * Increment a numeric stat by amount (default 1).
   */
  function increment(key, by) {
    const stat = _stats[key];
    if (!stat) return;
    by = by !== undefined ? by : 1;
    const newVal = (parseFloat(stat.value) || 0) + by;
    update(key, newVal);
  }

  /**
   * reset(key?)
   * Reset a stat to 0, or all stats if no key given.
   */
  function reset(key) {
    if (key) {
      update(key, 0, false);
    } else {
      Object.keys(_stats).forEach(k => {
        if (k !== '_totalSteps') update(k, 0, false);
      });
    }
  }

  /**
   * updateVariables(vars, animate?)
   * Update sidebar variable cards from step.variables object.
   *
   * @param vars    { varName: value, ... }
   * @param animate If true, flash changed values
   */
  function updateVariables(vars, animate) {
    if (!vars) return;
    animate = animate !== false;

    Object.keys(vars).forEach(name => {
      const newVal = vars[name];
      const oldVal = _variables[name];
      const changed = animate && (oldVal !== undefined) && (String(oldVal) !== String(newVal));

      _variables[name] = newVal;
      _updateSidebarVar(name, newVal, changed);
    });
  }

  /**
   * clearVariables()
   * Remove all variable cards from sidebar.
   */
  function clearVariables() {
    _variables = {};
    const sidebar = _sidebar();
    if (sidebar) {
      const cards = sidebar.querySelectorAll('.var-card');
      cards.forEach(c => c.remove());
    }
  }

  /**
   * setSidebarContent(html)
   * Set arbitrary HTML in sidebar content area.
   * Useful for step-specific side panel info.
   */
  function setSidebarContent(html) {
    const sidebar = _sidebar();
    if (sidebar) sidebar.innerHTML = html;
  }

  /**
   * appendSidebarItem(label, value, active?)
   * Append a sidebar item (e.g., stack frame, queue item).
   */
  function appendSidebarItem(label, value, active) {
    const sidebar = _sidebar();
    if (!sidebar) return;

    const item = document.createElement('div');
    item.className = 'sidebar-item' + (active ? ' active' : '');

    const labelEl = document.createElement('div');
    labelEl.className   = 'sidebar-item-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('div');
    valueEl.className   = 'sidebar-item-value';
    valueEl.textContent = String(value);

    item.appendChild(labelEl);
    item.appendChild(valueEl);
    sidebar.appendChild(item);
    return item;
  }

  /**
   * clearSidebar()
   * Clear all sidebar content.
   */
  function clearSidebar() {
    const sidebar = _sidebar();
    if (sidebar) sidebar.innerHTML = '';
  }

  /**
   * get(key)
   * Get current value of a stat.
   */
  function get(key) {
    return _stats[key] ? _stats[key].value : undefined;
  }

  /**
   * highlight(key, color?, duration?)
   * Briefly highlight a stat item.
   */
  function highlightStat(key, color, duration) {
    const stat = _stats[key];
    if (!stat || !stat.el) return;
    color    = color    || 'var(--accent)';
    duration = duration || 600;

    stat.el.style.transition = 'color ' + (duration/2) + 'ms ease';
    stat.el.style.color      = color;
    setTimeout(() => {
      stat.el.style.color = '';
    }, duration);
  }

  /**
   * showStepSummary(step)
   * Auto-update stats + variables from a step object.
   * Convenience method — call from renderStep().
   *
   * step = {
   *   variables: { i: 2, j: 0, ... },
   *   action: 'compare',
   *   important: true,
   * }
   */
  function showStepSummary(step, stepIndex) {
    if (!step) return;

    // Update variables in sidebar
    if (step.variables) {
      updateVariables(step.variables, true);
    }

    // Auto-increment common stats if tracked
    const action = (step.action || '').toLowerCase();
    if (action === 'compare'  && _stats['comparisons']) increment('comparisons');
    if (action === 'swap'     && _stats['swaps'])        increment('swaps');
    if (action === 'push'     && _stats['pushes'])       increment('pushes');
    if (action === 'pop'      && _stats['pops'])         increment('pops');
    if (action === 'visit'    && _stats['visited'])      increment('visited');
    if (action === 'enqueue'  && _stats['enqueued'])     increment('enqueued');
    if (action === 'dequeue'  && _stats['dequeued'])     increment('dequeued');

    // Always update step counter if tracked
    if (_stats['currentStep'] && stepIndex !== undefined) {
      update('currentStep', stepIndex + 1, false);
    }
  }

  // ── Return public interface ───────────────────────
  return {
    init,
    update,
    updateAll,
    increment,
    reset,
    get,
    highlightStat,
    updateVariables,
    clearVariables,
    setSidebarContent,
    appendSidebarItem,
    clearSidebar,
    showStepSummary,
  };

})();

/* ═══════════════════════════════════════════════════
   CONVENIENCE ALIASES (global)
═══════════════════════════════════════════════════ */

/**
 * updateStat(key, value, animate?)
 * Global shorthand for StatsEngine.update
 */
function updateStat(key, value, animate) {
  StatsEngine.update(key, value, animate);
}

/**
 * updateStats(obj, animate?)
 * Global shorthand for StatsEngine.updateAll
 */
function updateStats(obj, animate) {
  StatsEngine.updateAll(obj, animate);
}

/**
 * incrementStat(key, by?)
 * Global shorthand for StatsEngine.increment
 */
function incrementStat(key, by) {
  StatsEngine.increment(key, by);
}

/**
 * updateVariables(vars, animate?)
 * Global shorthand for StatsEngine.updateVariables
 */
function updateVariables(vars, animate) {
  StatsEngine.updateVariables(vars, animate);
}

/**
 * setSidebarContent(html)
 * Global shorthand for StatsEngine.setSidebarContent
 */
function setSidebarContent(html) {
  StatsEngine.setSidebarContent(html);
}

/**
 * clearSidebar()
 * Global shorthand for StatsEngine.clearSidebar
 */
function clearSidebar() {
  StatsEngine.clearSidebar();
}
  `.trim();
}