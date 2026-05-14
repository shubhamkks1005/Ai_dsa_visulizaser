// lib/visualizer/stats.ts

// ═══════════════════════════════════════════════════
// STATS CSS
// ═══════════════════════════════════════════════════

export const statsCSS = `
/* ═══════════════════════════════════════════════════
   STATS BAR — Always visible at top
   ═══════════════════════════════════════════════════ */
#stats-bar {
  flex-shrink: 0;
  padding: 8px 16px;
  background: rgba(13, 17, 23, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 50;
  min-height: 44px;
  flex-wrap: wrap;
}

/* Left section — algo info */
#stats-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

#algo-name {
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

#algo-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(99, 179, 237, 0.15);
  color: #63b3ed;
  border: 1px solid rgba(99, 179, 237, 0.25);
  white-space: nowrap;
}

#algo-complexity {
  font-size: 11px;
  color: #64748b;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
}

/* Center section — custom stats */
#stat-counters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
  min-width: 20px;
  text-align: center;
  transition: color 0.3s ease;
  font-family: 'Courier New', monospace;
}

.stat-value.stat-changed {
  color: #63b3ed;
  transform: scale(1.15);
  transition: color 0.1s ease, transform 0.1s ease;
}

/* Right section — step counter */
#stats-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

#step-counter {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  padding: 3px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

#step-counter .step-current {
  color: #63b3ed;
  font-weight: 800;
}

#step-counter .step-total {
  color: #64748b;
}

/* Phase label */
#phase-label {
  font-size: 10px;
  color: #94a3b8;
  font-style: italic;
  white-space: nowrap;
}
`;

// ═══════════════════════════════════════════════════
// STATS HTML
// ═══════════════════════════════════════════════════

export const statsHTML = `
<div id="stats-bar">
  <div id="stats-left">
    <div id="algo-name">Algorithm</div>
    <div id="algo-category">—</div>
    <div id="algo-complexity"></div>
  </div>
  <div id="stat-counters"></div>
  <div id="stats-right">
    <div id="phase-label"></div>
    <div id="step-counter">
      <span class="step-current">0</span>
      <span class="step-total"> / 0</span>
    </div>
  </div>
</div>
`;

// ═══════════════════════════════════════════════════
// STATS JS
// ═══════════════════════════════════════════════════

export const statsJS = `
/* ═══════════════════════════════════════════════════
   STATS ENGINE
   ═══════════════════════════════════════════════════ */

var _statsData = {};
var _statsElements = {};

function setAlgorithmInfo(name, category, timeComplexity, spaceComplexity) {
  var nameEl = document.getElementById('algo-name');
  var catEl = document.getElementById('algo-category');
  var compEl = document.getElementById('algo-complexity');

  if (nameEl) nameEl.textContent = name || 'Algorithm';
  if (catEl) catEl.textContent = category || '—';
  if (compEl) {
    var parts = [];
    if (timeComplexity) parts.push('T: ' + timeComplexity);
    if (spaceComplexity) parts.push('S: ' + spaceComplexity);
    compEl.textContent = parts.join(' | ');
  }
}

function initStats(statsConfig) {
  var container = document.getElementById('stat-counters');
  if (!container) return;
  container.innerHTML = '';
  _statsData = {};
  _statsElements = {};

  if (!statsConfig || !Array.isArray(statsConfig)) return;

  statsConfig.forEach(function(stat) {
    var key = stat.key || stat.label || 'stat';
    var label = stat.label || key;
    var value = stat.value || 0;

    _statsData[key] = value;

    var item = document.createElement('div');
    item.className = 'stat-item';
    item.id = 'stat-item-' + key;

    var labelEl = document.createElement('span');
    labelEl.className = 'stat-label';
    labelEl.textContent = label;

    var valueEl = document.createElement('span');
    valueEl.className = 'stat-value';
    valueEl.id = 'stat-value-' + key;
    valueEl.textContent = String(value);

    item.appendChild(labelEl);
    item.appendChild(valueEl);
    container.appendChild(item);

    _statsElements[key] = valueEl;
  });
}

function updateStat(key, value) {
  if (!key) return;

  var el = _statsElements[key] || document.getElementById('stat-value-' + key);
  if (!el) return;

  var oldValue = _statsData[key];
  _statsData[key] = value;

  // Animate if value changed
  if (oldValue !== value) {
    el.textContent = String(value);
    el.classList.add('stat-changed');
    setTimeout(function() {
      el.classList.remove('stat-changed');
    }, 300);
  }
}

function updateStepCounter(current, total) {
  var counterEl = document.getElementById('step-counter');
  if (!counterEl) return;

  var cur = (typeof current === 'number') ? current : 0;
  var tot = (typeof total === 'number') ? total : 0;

  counterEl.innerHTML =
    '<span class="step-current">' + cur + '</span>' +
    '<span class="step-total"> / ' + tot + '</span>';
}

function setPhaseLabel(text) {
  var el = document.getElementById('phase-label');
  if (!el) return;
  el.textContent = text || '';
}

function updateVariables(vars) {
  if (!vars || typeof vars !== 'object') return;

  Object.keys(vars).forEach(function(key) {
    updateStat(key, vars[key]);
  });
}

function getAllStats() {
  return Object.assign({}, _statsData);
}
`;