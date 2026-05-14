// lib/visualizer/animations.ts

// ═══════════════════════════════════════════════════
// ANIMATION CSS — All @keyframes
// Injected into <style> tag of shell HTML
// ═══════════════════════════════════════════════════

export const animationCSS = `
/* ═══════════════════════════════════════════════════
   FADE ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOutDown {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(20px); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* ═══════════════════════════════════════════════════
   POP / SCALE ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes popOut {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}
@keyframes bounceIn {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.12); }
  80% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes squashStretch {
  0%, 100% { transform: scaleX(1) scaleY(1); }
  30% { transform: scaleX(1.12) scaleY(0.88); }
  60% { transform: scaleX(0.94) scaleY(1.06); }
}

/* ═══════════════════════════════════════════════════
   SHAKE / WOBBLE ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-6px); }
  30% { transform: translateX(5px); }
  45% { transform: translateX(-4px); }
  60% { transform: translateX(3px); }
  75% { transform: translateX(-2px); }
}
@keyframes wobble {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-4deg); }
  40% { transform: rotate(3deg); }
  60% { transform: rotate(-2deg); }
  80% { transform: rotate(1deg); }
}
@keyframes jello {
  0%, 100% { transform: scale(1, 1); }
  30% { transform: scale(1.15, 0.85); }
  50% { transform: scale(0.92, 1.08); }
  70% { transform: scale(1.05, 0.95); }
}
@keyframes vibrate {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
}

/* ═══════════════════════════════════════════════════
   GLOW / HIGHLIGHT ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 5px var(--glow-color, #63b3ed); }
  50% { box-shadow: 0 0 25px var(--glow-color, #63b3ed), 0 0 50px var(--glow-color, #63b3ed); }
}
@keyframes spotlight {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
  100% { box-shadow: 0 0 0 40px rgba(255,255,255,0); }
}
@keyframes neonFlicker {
  0%, 100% { opacity: 1; text-shadow: 0 0 10px var(--glow-color, #63b3ed); }
  33% { opacity: 0.85; text-shadow: 0 0 5px var(--glow-color, #63b3ed); }
  66% { opacity: 0.95; text-shadow: 0 0 20px var(--glow-color, #63b3ed); }
}
@keyframes rimLight {
  0%, 100% { box-shadow: inset 0 0 3px var(--glow-color, #63b3ed); }
  50% { box-shadow: inset 0 0 12px var(--glow-color, #63b3ed); }
}
@keyframes goldGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 0 50px rgba(255, 215, 0, 0.3); }
}

/* ═══════════════════════════════════════════════════
   SLIDE ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideInUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slideInDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slideOutLeft {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
}
@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* ═══════════════════════════════════════════════════
   PARTICLE / EFFECT ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes rippleEffect {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
@keyframes sparkleAnim {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
@keyframes confettiDrop {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
}
@keyframes shockwaveAnim {
  0% { transform: scale(0); opacity: 0.8; border-width: 4px; }
  100% { transform: scale(3); opacity: 0; border-width: 0px; }
}

/* ═══════════════════════════════════════════════════
   WATER / FLUID ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes waterFillAnim {
  from { height: 0%; }
  to { height: var(--fill-height, 50%); }
}
@keyframes waterWave {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(3px) translateY(-2px); }
  50% { transform: translateX(-2px) translateY(1px); }
  75% { transform: translateX(1px) translateY(-1px); }
}
@keyframes rainDrop {
  from { transform: translateY(-20px); opacity: 0.8; }
  to { transform: translateY(100%); opacity: 0.2; }
}
@keyframes waterDropSplash {
  0% { transform: scale(0); opacity: 1; border-radius: 50%; }
  50% { transform: scale(1.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}

/* ═══════════════════════════════════════════════════
   COMPLETION / CELEBRATION ANIMATIONS
   ═══════════════════════════════════════════════════ */
@keyframes victoryGlow {
  0% { box-shadow: 0 0 5px gold; }
  50% { box-shadow: 0 0 30px gold, 0 0 60px gold; }
  100% { box-shadow: 0 0 5px gold; }
}
@keyframes celebrationBounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-15px); }
  50% { transform: translateY(-8px); }
  75% { transform: translateY(-12px); }
}
@keyframes goldOutlineAnim {
  0% { outline: 2px solid transparent; }
  50% { outline: 3px solid gold; outline-offset: 4px; }
  100% { outline: 2px solid gold; outline-offset: 2px; }
}
@keyframes finalRevealAnim {
  0% { filter: blur(5px); opacity: 0.5; }
  100% { filter: blur(0); opacity: 1; }
}

/* ═══════════════════════════════════════════════════
   STATE MARKER CLASSES
   ═══════════════════════════════════════════════════ */
.anim-active {
  outline: 2px solid #63b3ed !important;
  box-shadow: 0 0 12px rgba(99, 179, 237, 0.5) !important;
  z-index: 10 !important;
}
.anim-sorted {
  outline: 2px solid #68d391 !important;
  box-shadow: 0 0 8px rgba(104, 211, 145, 0.4) !important;
}
.anim-visited {
  outline: 2px solid #a78bfa !important;
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.4) !important;
}
.anim-current {
  outline: 2px solid #fbbf24 !important;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.5) !important;
  z-index: 11 !important;
}
.anim-error {
  outline: 2px solid #fb7185 !important;
  box-shadow: 0 0 12px rgba(251, 113, 133, 0.5) !important;
}
`;

// ═══════════════════════════════════════════════════
// ANIMATION JS — All functions
// Injected into <script> tag of shell HTML
// ═══════════════════════════════════════════════════

export const animationJS = `
/* ═══════════════════════════════════════════════════
   HELPER — Get element safely
   ═══════════════════════════════════════════════════ */
function _getEl(elOrId) {
  if (!elOrId) return null;
  if (typeof elOrId === 'string') return document.getElementById(elOrId);
  if (elOrId instanceof HTMLElement) return elOrId;
  return null;
}

function _applyAnim(elOrId, animName, duration, onDone) {
  var el = _getEl(elOrId);
  if (!el) return;
  var dur = duration || 500;
  el.style.animation = animName + ' ' + dur + 'ms ease';
  if (onDone) {
    setTimeout(function() { onDone(el); }, dur);
  } else {
    setTimeout(function() { el.style.animation = ''; }, dur);
  }
}

/* ═══════════════════════════════════════════════════
   MOVEMENT
   ═══════════════════════════════════════════════════ */
function moveTo(elOrId, x, y, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var dur = duration || 500;
  el.style.transition = 'left ' + dur + 'ms ease, top ' + dur + 'ms ease, transform ' + dur + 'ms ease';
  if (x !== undefined && x !== null) el.style.left = x + 'px';
  if (y !== undefined && y !== null) el.style.top = y + 'px';
}

function moveArc(elOrId, fromX, fromY, toX, toY, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var dur = duration || 600;
  var midX = (fromX + toX) / 2;
  var midY = Math.min(fromY, toY) - 60;
  el.style.position = 'absolute';
  el.style.transition = 'none';
  el.style.left = fromX + 'px';
  el.style.top = fromY + 'px';

  var startTime = null;
  function animate(time) {
    if (!startTime) startTime = time;
    var progress = Math.min((time - startTime) / dur, 1);
    var t = progress;
    var cx = (1-t)*(1-t)*fromX + 2*(1-t)*t*midX + t*t*toX;
    var cy = (1-t)*(1-t)*fromY + 2*(1-t)*t*midY + t*t*toY;
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function arcJump(elOrId, fromX, fromY, toX, toY, duration) {
  moveArc(elOrId, fromX, fromY, toX, toY, duration || 700);
}

function springTo(elOrId, x, y, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var dur = duration || 600;
  el.style.transition = 'left ' + dur + 'ms cubic-bezier(0.34, 1.56, 0.64, 1), top ' + dur + 'ms cubic-bezier(0.34, 1.56, 0.64, 1)';
  if (x !== undefined && x !== null) el.style.left = x + 'px';
  if (y !== undefined && y !== null) el.style.top = y + 'px';
}

function slideIn(elOrId, direction, duration) {
  var dir = direction || 'left';
  var animName = 'slideIn' + dir.charAt(0).toUpperCase() + dir.slice(1);
  _applyAnim(elOrId, animName, duration || 500);
}

function slideOut(elOrId, direction, duration) {
  var dir = direction || 'left';
  var animName = 'slideOut' + dir.charAt(0).toUpperCase() + dir.slice(1);
  _applyAnim(elOrId, animName, duration || 500);
}

/* ═══════════════════════════════════════════════════
   VISIBILITY
   ═══════════════════════════════════════════════════ */
function fadeIn(elOrId, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.opacity = '0';
  el.style.display = '';
  _applyAnim(elOrId, 'fadeIn', duration || 400, function(e) {
    e.style.opacity = '1';
    e.style.animation = '';
  });
}

function fadeOut(elOrId, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  _applyAnim(elOrId, 'fadeOut', duration || 400, function(e) {
    e.style.opacity = '0';
    e.style.animation = '';
  });
}

function fadeInUp(elOrId, duration) {
  _applyAnim(elOrId, 'fadeInUp', duration || 500, function(e) {
    e.style.opacity = '1';
    e.style.transform = 'translateY(0)';
    e.style.animation = '';
  });
}

function fadeOutDown(elOrId, duration) {
  _applyAnim(elOrId, 'fadeOutDown', duration || 500, function(e) {
    e.style.opacity = '0';
    e.style.animation = '';
  });
}

function blink(elOrId, times) {
  var el = _getEl(elOrId);
  if (!el) return;
  var count = times || 3;
  var i = 0;
  var interval = setInterval(function() {
    el.style.opacity = el.style.opacity === '0' ? '1' : '0';
    i++;
    if (i >= count * 2) {
      clearInterval(interval);
      el.style.opacity = '1';
    }
  }, 150);
}

/* ═══════════════════════════════════════════════════
   GLOW / HIGHLIGHT
   ═══════════════════════════════════════════════════ */
function highlight(elOrId, color, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var c = color || '#63b3ed';
  var dur = duration || 800;
  el.style.setProperty('--glow-color', c);
  el.style.outline = '2px solid ' + c;
  el.style.boxShadow = '0 0 15px ' + c;
  el.style.zIndex = '10';
  setTimeout(function() {
    el.style.outline = '';
    el.style.boxShadow = '';
    el.style.zIndex = '';
  }, dur);
}

function glowPulse(elOrId, color, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.setProperty('--glow-color', color || '#63b3ed');
  _applyAnim(elOrId, 'glowPulse', duration || 1000);
}

function spotlight(elOrId, duration) {
  _applyAnim(elOrId, 'spotlight', duration || 800);
}

function neonFlicker(elOrId, color, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.setProperty('--glow-color', color || '#63b3ed');
  _applyAnim(elOrId, 'neonFlicker', duration || 1000);
}

function rimLight(elOrId, color, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.setProperty('--glow-color', color || '#63b3ed');
  _applyAnim(elOrId, 'rimLight', duration || 800);
}

/* ═══════════════════════════════════════════════════
   SCALE / TRANSFORM
   ═══════════════════════════════════════════════════ */
function popIn(elOrId, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.display = '';
  _applyAnim(elOrId, 'popIn', duration || 500, function(e) {
    e.style.transform = 'scale(1)';
    e.style.opacity = '1';
    e.style.animation = '';
  });
}

function popOut(elOrId, duration) {
  _applyAnim(elOrId, 'popOut', duration || 400, function(e) {
    e.style.transform = 'scale(0)';
    e.style.opacity = '0';
    e.style.animation = '';
  });
}

function breathe(elOrId, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.animation = 'breathe ' + (duration || 2000) + 'ms ease-in-out infinite';
}

function squashAndStretch(elOrId, duration) {
  _applyAnim(elOrId, 'squashStretch', duration || 500);
}

function scaleUp(elOrId, scale, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var s = scale || 1.2;
  var dur = duration || 400;
  el.style.transition = 'transform ' + dur + 'ms cubic-bezier(0.34, 1.56, 0.64, 1)';
  el.style.transform = 'scale(' + s + ')';
  setTimeout(function() {
    el.style.transform = 'scale(1)';
  }, dur);
}

function scaleDown(elOrId, scale, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var s = scale || 0.8;
  var dur = duration || 400;
  el.style.transition = 'transform ' + dur + 'ms ease';
  el.style.transform = 'scale(' + s + ')';
  setTimeout(function() {
    el.style.transform = 'scale(1)';
  }, dur);
}

/* ═══════════════════════════════════════════════════
   SHAKE / WOBBLE
   ═══════════════════════════════════════════════════ */
function shake(elOrId, intensity, duration) {
  _applyAnim(elOrId, 'shake', duration || 500);
}

function wobble(elOrId, duration) {
  _applyAnim(elOrId, 'wobble', duration || 600);
}

function jello(elOrId, duration) {
  _applyAnim(elOrId, 'jello', duration || 700);
}

function vibrate(elOrId, duration) {
  _applyAnim(elOrId, 'vibrate', duration || 400);
}

/* ═══════════════════════════════════════════════════
   TEXT ANIMATIONS
   ═══════════════════════════════════════════════════ */
function typeWords(elOrId, text, speed) {
  var el = _getEl(elOrId);
  if (!el) return;
  var words = text.split(' ');
  var spd = speed || 50;
  el.textContent = '';
  words.forEach(function(word, i) {
    setTimeout(function() {
      el.textContent += (i > 0 ? ' ' : '') + word;
    }, i * spd);
  });
}

function countUp(elOrId, from, to, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var dur = duration || 500;
  var start = from || 0;
  var end = to;
  var startTime = null;
  function animate(time) {
    if (!startTime) startTime = time;
    var progress = Math.min((time - startTime) / dur, 1);
    var value = Math.floor(start + (end - start) * progress);
    el.textContent = value;
    if (progress < 1) requestAnimationFrame(animate);
    else el.textContent = end;
  }
  requestAnimationFrame(animate);
}

function dramaticText(text, duration) {
  var dur = duration || 1500;
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:9999;pointer-events:none;';
  var textEl = document.createElement('div');
  textEl.textContent = text;
  textEl.style.cssText = 'font-size:36px;font-weight:900;color:white;text-shadow:0 0 30px rgba(99,179,237,0.8);animation:popIn 500ms ease;';
  overlay.appendChild(textEl);
  document.body.appendChild(overlay);
  setTimeout(function() {
    textEl.style.animation = 'fadeOut 500ms ease';
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 500);
  }, dur - 500);
}

/* ═══════════════════════════════════════════════════
   PARTICLES / EFFECTS
   ═══════════════════════════════════════════════════ */
function splashBurst(elOrId, color, count) {
  var el = _getEl(elOrId);
  if (!el) return;
  var rect = el.getBoundingClientRect();
  var cx = rect.left + rect.width / 2;
  var cy = rect.top + rect.height / 2;
  var c = color || '#63b3ed';
  var n = count || 8;
  for (var i = 0; i < n; i++) {
    var p = document.createElement('div');
    var angle = (i / n) * Math.PI * 2;
    var dist = 30 + Math.random() * 40;
    p.style.cssText = 'position:fixed;width:6px;height:6px;border-radius:50%;background:' + c + ';left:' + cx + 'px;top:' + cy + 'px;z-index:9998;pointer-events:none;transition:all 600ms ease-out;opacity:1;';
    document.body.appendChild(p);
    requestAnimationFrame(function(particle, a, d) {
      return function() {
        particle.style.left = (cx + Math.cos(a) * d) + 'px';
        particle.style.top = (cy + Math.sin(a) * d) + 'px';
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0.3)';
      };
    }(p, angle, dist));
    setTimeout(function(particle) {
      return function() {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      };
    }(p), 700);
  }
}

function confettiBurst(elOrId) {
  var el = _getEl(elOrId);
  var cx, cy;
  if (el) {
    var rect = el.getBoundingClientRect();
    cx = rect.left + rect.width / 2;
    cy = rect.top + rect.height / 2;
  } else {
    cx = window.innerWidth / 2;
    cy = window.innerHeight / 2;
  }
  var colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6eb4','#a78bfa'];
  for (var i = 0; i < 20; i++) {
    var p = document.createElement('div');
    var c = colors[Math.floor(Math.random() * colors.length)];
    var size = 4 + Math.random() * 6;
    p.style.cssText = 'position:fixed;width:' + size + 'px;height:' + size + 'px;background:' + c + ';left:' + cx + 'px;top:' + cy + 'px;z-index:9998;pointer-events:none;border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';';
    p.style.animation = 'confettiDrop ' + (800 + Math.random() * 600) + 'ms ease-out forwards';
    p.style.animationDelay = (Math.random() * 200) + 'ms';
    var dx = (Math.random() - 0.5) * 200;
    p.style.marginLeft = dx + 'px';
    document.body.appendChild(p);
    setTimeout(function(particle) {
      return function() {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      };
    }(p), 1500);
  }
}

function ripple(elOrId, color) {
  var el = _getEl(elOrId);
  if (!el) return;
  var rect = el.getBoundingClientRect();
  var r = document.createElement('div');
  var c = color || 'rgba(99, 179, 237, 0.4)';
  r.style.cssText = 'position:fixed;border-radius:50%;border:3px solid ' + c + ';width:20px;height:20px;pointer-events:none;z-index:9998;left:' + (rect.left + rect.width/2 - 10) + 'px;top:' + (rect.top + rect.height/2 - 10) + 'px;animation:rippleEffect 800ms ease-out forwards;';
  document.body.appendChild(r);
  setTimeout(function() {
    if (r.parentNode) r.parentNode.removeChild(r);
  }, 900);
}

function shockwave(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  var rect = el.getBoundingClientRect();
  var s = document.createElement('div');
  s.style.cssText = 'position:fixed;border-radius:50%;border:3px solid rgba(255,255,255,0.5);width:30px;height:30px;pointer-events:none;z-index:9998;left:' + (rect.left + rect.width/2 - 15) + 'px;top:' + (rect.top + rect.height/2 - 15) + 'px;animation:shockwaveAnim 600ms ease-out forwards;';
  document.body.appendChild(s);
  setTimeout(function() {
    if (s.parentNode) s.parentNode.removeChild(s);
  }, 700);
}

function sparkle(elOrId, count) {
  var el = _getEl(elOrId);
  if (!el) return;
  var rect = el.getBoundingClientRect();
  var n = count || 5;
  for (var i = 0; i < n; i++) {
    var s = document.createElement('div');
    var x = rect.left + Math.random() * rect.width;
    var y = rect.top + Math.random() * rect.height;
    s.textContent = '✦';
    s.style.cssText = 'position:fixed;color:gold;font-size:14px;pointer-events:none;z-index:9998;left:' + x + 'px;top:' + y + 'px;animation:sparkleAnim 800ms ease forwards;';
    s.style.animationDelay = (i * 100) + 'ms';
    document.body.appendChild(s);
    setTimeout(function(sp) {
      return function() {
        if (sp.parentNode) sp.parentNode.removeChild(sp);
      };
    }(s), 1000 + i * 100);
  }
}

/* ═══════════════════════════════════════════════════
   WATER / FLUID
   ═══════════════════════════════════════════════════ */
function waterFill(elOrId, percentage, duration) {
  var el = _getEl(elOrId);
  if (!el) return;
  var pct = percentage || 50;
  var dur = duration || 800;
  el.style.setProperty('--fill-height', pct + '%');
  el.style.transition = 'height ' + dur + 'ms ease-out';
  el.style.height = pct + '%';
}

function waterRipple(elOrId, duration) {
  _applyAnim(elOrId, 'waterWave', duration || 1500);
}

function waterDrop(x, y, duration) {
  var drop = document.createElement('div');
  drop.style.cssText = 'position:fixed;width:8px;height:12px;background:rgba(99,179,237,0.7);border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;left:' + x + 'px;top:' + y + 'px;z-index:9998;pointer-events:none;animation:rainDrop ' + (duration || 1000) + 'ms linear forwards;';
  document.body.appendChild(drop);
  setTimeout(function() {
    if (drop.parentNode) drop.parentNode.removeChild(drop);
  }, (duration || 1000) + 100);
}

function rain(containerOrId, intensity) {
  var container = _getEl(containerOrId);
  if (!container) container = document.getElementById('scene-content');
  if (!container) return;
  var count = intensity || 15;
  var rect = container.getBoundingClientRect();
  for (var i = 0; i < count; i++) {
    setTimeout(function() {
      var x = rect.left + Math.random() * rect.width;
      waterDrop(x, rect.top - 10, 1500 + Math.random() * 1000);
    }, Math.random() * 2000);
  }
}

/* ═══════════════════════════════════════════════════
   STATE MARKERS
   ═══════════════════════════════════════════════════ */
function markActive(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.classList.remove('anim-sorted','anim-visited','anim-current','anim-error');
  el.classList.add('anim-active');
}

function markSorted(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.classList.remove('anim-active','anim-visited','anim-current','anim-error');
  el.classList.add('anim-sorted');
}

function markVisited(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.classList.remove('anim-active','anim-sorted','anim-current','anim-error');
  el.classList.add('anim-visited');
}

function markCurrent(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.classList.remove('anim-active','anim-sorted','anim-visited','anim-error');
  el.classList.add('anim-current');
}

function markError(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.classList.remove('anim-active','anim-sorted','anim-visited','anim-current');
  el.classList.add('anim-error');
}

function clearMark(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.classList.remove('anim-active','anim-sorted','anim-visited','anim-current','anim-error');
}

/* ═══════════════════════════════════════════════════
   CHARACTER
   ═══════════════════════════════════════════════════ */
function characterIdle(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.animation = 'breathe 2000ms ease-in-out infinite';
}

function characterJump(elOrId, fromX, fromY, toX, toY) {
  arcJump(elOrId, fromX, fromY, toX, toY, 700);
}

function characterCelebrate(elOrId) {
  var el = _getEl(elOrId);
  if (!el) return;
  el.style.animation = 'celebrationBounce 800ms ease 3';
  setTimeout(function() {
    el.style.animation = 'breathe 2000ms ease-in-out infinite';
  }, 2500);
}

/* ═══════════════════════════════════════════════════
   COMPLETION
   ═══════════════════════════════════════════════════ */
function celebrationWave(containerOrId) {
  var container = _getEl(containerOrId);
  if (!container) container = document.getElementById('scene-content');
  if (!container) return;
  var children = container.children;
  for (var i = 0; i < children.length; i++) {
    (function(child, idx) {
      setTimeout(function() {
        child.style.animation = 'bounceIn 500ms ease';
        setTimeout(function() { child.style.animation = ''; }, 600);
      }, idx * 100);
    })(children[i], i);
  }
}

function victoryBurst(elOrId) {
  confettiBurst(elOrId);
  _applyAnim(elOrId, 'victoryGlow', 1500);
}

function goldOutline(elOrId) {
  _applyAnim(elOrId, 'goldOutlineAnim', 1500);
}

function finalReveal(elOrId) {
  _applyAnim(elOrId, 'finalRevealAnim', 800, function(e) {
    e.style.filter = '';
    e.style.opacity = '1';
    e.style.animation = '';
  });
}

/* ═══════════════════════════════════════════════════
   UTILITY
   ═══════════════════════════════════════════════════ */
function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms || 500);
  });
}

function stagger(ids, fn, delayMs) {
  var d = delayMs || 80;
  ids.forEach(function(id, i) {
    setTimeout(function() { fn(id); }, i * d);
  });
}

function clearAllAnimations(containerOrId) {
  var container = _getEl(containerOrId);
  if (!container) container = document.getElementById('scene-content');
  if (!container) return;
  var all = container.querySelectorAll('*');
  for (var i = 0; i < all.length; i++) {
    all[i].style.animation = '';
    all[i].style.transition = '';
    all[i].classList.remove('anim-active','anim-sorted','anim-visited','anim-current','anim-error');
  }
}
`;