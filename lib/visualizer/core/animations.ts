// lib/visualizer/core/animations.ts

/**
 * Complete animation utility library.
 * Returns JavaScript code as a string — injected into <script> in final HTML.
 * All functions run in browser DOM context.
 *
 * Categories:
 *  - Movement    : moveTo, moveArc, moveArcHigh, springTo, slideIn, slideOut
 *  - Visibility  : fadeIn, fadeOut, fadeInUp, fadeOutUp, fadeInScale, blink
 *  - Glow/Color  : highlight, glowPulse, glowFlash, spotlight, colorShift, neonFlicker
 *  - Scale       : popIn, popOut, breathe, squashAndStretch, scaleUp, scaleDown
 *  - Rotation    : shake, wobble, jello, spin, swing
 *  - Text        : typeWords, countUp, valueChange, dramaticText, scrambleText
 *  - Particles   : splashBurst, confettiBurst, ripple, shockwave, sparkle, bubbles
 *  - Water       : waterFill, waterRipple, waterSplash, waterDrop
 *  - Drawing     : drawLine, drawArc, drawArrow, connectionBeam, pathHighlight
 *  - Camera      : zoomIn, zoomOut, panTo, cameraShake, focusOn
 *  - State       : markSorted, markActive, markVisited, markCurrent, markError
 *  - Character   : characterIdle, characterJump, characterCelebrate, characterWalk
 *  - Completion  : celebrationWave, victoryBurst, goldOutline, finalReveal
 *  - Timing      : delay, stagger, sequence, chainAnimations
 */
export function getAnimationLibrary(): string {
  return `
/* ═══════════════════════════════════════════════════
   ANIMATION UTILITY LIBRARY
   All functions available globally in visualization.
═══════════════════════════════════════════════════ */

// ─── INTERNAL HELPERS ────────────────────────────────────────────

function _el(id) {
  return typeof id === 'string' ? document.getElementById(id) : id;
}

function _els(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function _css(el, props) {
  el = _el(el);
  if (!el) return;
  Object.assign(el.style, props);
}

function _after(ms, fn) {
  return setTimeout(fn, ms);
}

function _raf(fn) {
  return requestAnimationFrame(fn);
}

// Clamp a value between min and max
function _clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// Get element bounding rect relative to a container
function _relRect(el, container) {
  const er = _el(el).getBoundingClientRect();
  const cr = (container ? _el(container) : document.body).getBoundingClientRect();
  return {
    x: er.x - cr.x,
    y: er.y - cr.y,
    w: er.width,
    h: er.height,
    cx: er.x - cr.x + er.width / 2,
    cy: er.y - cr.y + er.height / 2,
  };
}

// Create a temporary DOM element for particles/effects
function _tempEl(tag, css, parent) {
  const el = document.createElement(tag || 'div');
  if (css) Object.assign(el.style, css);
  (parent ? _el(parent) : document.body).appendChild(el);
  return el;
}

// Remove element after delay
function _removeAfter(el, ms) {
  _after(ms, () => { if (el && el.parentNode) el.parentNode.removeChild(el); });
}

// ─────────────────────────────────────────────────────────────────
// MOVEMENT UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * moveTo(el, x, y, duration?, easing?)
 * Moves element to absolute position using transform.
 */
function moveTo(el, x, y, duration, easing) {
  el = _el(el); if (!el) return;
  duration = duration || 400;
  easing   = easing   || 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  el.style.transition = 'transform ' + duration + 'ms ' + easing;
  el.style.transform  = 'translate(' + x + 'px, ' + y + 'px)';
}

/**
 * moveArc(el, targetX, targetY, arcHeight?, duration?)
 * Moves element along a parabolic arc — for swaps, jumps.
 */
function moveArc(el, targetX, targetY, arcHeight, duration) {
  el = _el(el); if (!el) return;
  arcHeight = arcHeight || -80;
  duration  = duration  || 600;

  const startRect = el.getBoundingClientRect();
  const keyframes = [
    { transform: 'translate(0px, 0px)', offset: 0 },
    {
      transform: 'translate(' +
        (targetX / 2) + 'px, ' +
        (arcHeight)   + 'px)',
      offset: 0.5
    },
    { transform: 'translate(' + targetX + 'px, ' + targetY + 'px)', offset: 1 }
  ];

  el.animate(keyframes, {
    duration: duration,
    easing:   'ease-in-out',
    fill:     'forwards'
  });
}

/**
 * moveArcHigh(el, targetX, targetY, duration?)
 * High dramatic arc — for hero character jumps.
 */
function moveArcHigh(el, targetX, targetY, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 800;
  const arcH = -140;

  const keyframes = [
    { transform: 'translate(0,0) scaleX(1)',          offset: 0    },
    { transform: 'translate(0,' + arcH + 'px) scaleX(0.9)',  offset: 0.3  },
    {
      transform: 'translate(' + (targetX * 0.7) + 'px,' + (arcH * 0.6) + 'px) scaleX(1.1)',
      offset: 0.6
    },
    {
      transform: 'translate(' + targetX + 'px,' + targetY + 'px) scaleX(1)',
      offset: 1
    }
  ];

  el.animate(keyframes, {
    duration: duration,
    easing:   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill:     'forwards'
  });
}

/**
 * springTo(el, x, y, duration?)
 * Spring/bounce movement — feels physical.
 */
function springTo(el, x, y, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 500;
  el.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.34, 1.56, 0.64, 1)';
  el.style.transform  = 'translate(' + x + 'px, ' + y + 'px)';
}

/**
 * slideIn(el, direction?, duration?)
 * Slides element in from a direction.
 * direction: 'left' | 'right' | 'up' | 'down'
 */
function slideIn(el, direction, duration) {
  el = _el(el); if (!el) return;
  direction = direction || 'left';
  duration  = duration  || 400;

  const startMap = {
    left:  'translateX(-60px)',
    right: 'translateX(60px)',
    up:    'translateY(-60px)',
    down:  'translateY(60px)',
  };

  el.style.opacity   = '0';
  el.style.transform = startMap[direction] || startMap.left;
  _raf(() => {
    _raf(() => {
      el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms cubic-bezier(0.34,1.2,0.64,1)';
      el.style.opacity    = '1';
      el.style.transform  = 'translate(0,0)';
    });
  });
}

/**
 * slideOut(el, direction?, duration?, remove?)
 * Slides element out in a direction, optionally removes it.
 */
function slideOut(el, direction, duration, remove) {
  el = _el(el); if (!el) return;
  direction = direction || 'left';
  duration  = duration  || 350;

  const endMap = {
    left:  'translateX(-60px)',
    right: 'translateX(60px)',
    up:    'translateY(-60px)',
    down:  'translateY(60px)',
  };

  el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms ease';
  el.style.opacity    = '0';
  el.style.transform  = endMap[direction] || endMap.left;
  if (remove) _removeAfter(el, duration + 50);
}

// ─────────────────────────────────────────────────────────────────
// VISIBILITY UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * fadeIn(el, duration?, delay?)
 */
function fadeIn(el, duration, delay) {
  el = _el(el); if (!el) return;
  duration = duration || 300;
  delay    = delay    || 0;
  el.style.transition = 'opacity ' + duration + 'ms ease ' + delay + 'ms';
  el.style.opacity    = '1';
  el.style.pointerEvents = 'auto';
}

/**
 * fadeOut(el, duration?, delay?)
 */
function fadeOut(el, duration, delay) {
  el = _el(el); if (!el) return;
  duration = duration || 300;
  delay    = delay    || 0;
  el.style.transition = 'opacity ' + duration + 'ms ease ' + delay + 'ms';
  el.style.opacity    = '0';
  el.style.pointerEvents = 'none';
}

/**
 * fadeInUp(el, duration?, distance?)
 * Fades in while moving up — for elements appearing from below.
 */
function fadeInUp(el, duration, distance) {
  el = _el(el); if (!el) return;
  duration = duration || 400;
  distance = distance || 20;
  el.style.opacity   = '0';
  el.style.transform = 'translateY(' + distance + 'px)';
  _raf(() => {
    _raf(() => {
      el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms cubic-bezier(0.34,1.2,0.64,1)';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    });
  });
}

/**
 * fadeOutUp(el, duration?)
 * Fades out while moving up — for elements disappearing.
 */
function fadeOutUp(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 300;
  el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms ease';
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(-20px)';
}

/**
 * fadeInScale(el, duration?)
 * Fades in while scaling up from 0.8 — cinematic appear.
 */
function fadeInScale(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 400;
  el.style.opacity   = '0';
  el.style.transform = 'scale(0.8)';
  _raf(() => {
    _raf(() => {
      el.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms cubic-bezier(0.34,1.56,0.64,1)';
      el.style.opacity    = '1';
      el.style.transform  = 'scale(1)';
    });
  });
}

/**
 * blink(el, times?, interval?)
 * Blinks element — for attention.
 */
function blink(el, times, interval) {
  el = _el(el); if (!el) return;
  times    = times    || 3;
  interval = interval || 200;
  let count = 0;
  const iv = setInterval(() => {
    el.style.opacity = (count % 2 === 0) ? '0.2' : '1';
    count++;
    if (count >= times * 2) {
      clearInterval(iv);
      el.style.opacity = '1';
    }
  }, interval);
}

// ─────────────────────────────────────────────────────────────────
// GLOW / COLOR UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * highlight(el, color?, duration?)
 * Temporarily highlights element background.
 */
function highlight(el, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || 'rgba(99,179,237,0.25)';
  duration = duration || 600;
  const prev = el.style.background;
  el.style.transition = 'background ' + (duration/2) + 'ms ease';
  el.style.background = color;
  _after(duration, () => {
    el.style.transition = 'background ' + (duration/2) + 'ms ease';
    el.style.background = prev;
  });
}

/**
 * glowPulse(el, color?, duration?)
 * Adds a pulsing glow — for active elements.
 */
function glowPulse(el, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || 'rgba(99,179,237,0.6)';
  duration = duration || 1000;

  el.animate([
    { boxShadow: '0 0 0px ' + color },
    { boxShadow: '0 0 20px ' + color + ', 0 0 40px ' + color },
    { boxShadow: '0 0 0px ' + color },
  ], { duration: duration, easing: 'ease-in-out', iterations: 2 });
}

/**
 * glowFlash(el, color?, duration?)
 * Single bright flash — for found/complete moments.
 */
function glowFlash(el, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || 'rgba(246,224,94,0.8)';
  duration = duration || 400;

  el.animate([
    { boxShadow: '0 0 0px ' + color,                               opacity: '1'   },
    { boxShadow: '0 0 40px ' + color + ', 0 0 80px ' + color,      opacity: '1'   },
    { boxShadow: '0 0 8px '  + color,                               opacity: '0.9' },
  ], { duration: duration, easing: 'ease-out', fill: 'forwards' });
}

/**
 * spotlight(el, radius?)
 * Creates a spotlight overlay effect around element.
 */
function spotlight(el, radius) {
  el = _el(el); if (!el) return;
  radius = radius || 120;
  const rect = el.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;

  const overlay = _tempEl('div', {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '29',
    background: 'radial-gradient(circle ' + radius + 'px at ' + cx + 'px ' + cy + 'px, transparent 0%, rgba(0,0,0,0.7) 100%)',
    opacity: '0',
    transition: 'opacity 400ms ease',
  });
  overlay.id = '_spotlight_overlay';
  _raf(() => { _raf(() => { overlay.style.opacity = '1'; }); });
}

/**
 * unspotlight(duration?)
 * Removes spotlight overlay.
 */
function unspotlight(duration) {
  duration = duration || 400;
  const overlay = document.getElementById('_spotlight_overlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  _removeAfter(overlay, duration + 50);
}

/**
 * colorShift(el, fromColor, toColor, duration?)
 * Smoothly shifts element background color.
 */
function colorShift(el, fromColor, toColor, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 500;
  el.animate([
    { background: fromColor },
    { background: toColor   },
  ], { duration: duration, easing: 'ease', fill: 'forwards' });
}

/**
 * neonFlicker(el, color?, duration?)
 * Neon sign flicker effect — for found/highlight moments.
 */
function neonFlicker(el, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || '#63b3ed';
  duration = duration || 800;

  const shadow = '0 0 10px ' + color + ', 0 0 20px ' + color + ', 0 0 40px ' + color;
  el.animate([
    { boxShadow: shadow,   opacity: '1'   },
    { boxShadow: 'none',   opacity: '0.4' },
    { boxShadow: shadow,   opacity: '1'   },
    { boxShadow: 'none',   opacity: '0.6' },
    { boxShadow: shadow,   opacity: '1'   },
  ], { duration: duration, easing: 'steps(1)', fill: 'forwards' });
}

// ─────────────────────────────────────────────────────────────────
// SCALE / BOUNCE UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * popIn(el, scale?, duration?)
 * Element pops in with spring — for appearing elements.
 */
function popIn(el, scale, duration) {
  el = _el(el); if (!el) return;
  scale    = scale    || 1;
  duration = duration || 400;

  el.style.display = el.style.display === 'none' ? 'block' : el.style.display;
  el.animate([
    { transform: 'scale(0)',       opacity: '0' },
    { transform: 'scale(' + (scale * 1.15) + ')', opacity: '1', offset: 0.75 },
    { transform: 'scale(' + scale + ')',           opacity: '1' },
  ], { duration: duration, easing: 'ease-out', fill: 'forwards' });
}

/**
 * popOut(el, duration?, remove?)
 * Element pops out — for disappearing elements.
 */
function popOut(el, duration, remove) {
  el = _el(el); if (!el) return;
  duration = duration || 300;

  el.animate([
    { transform: 'scale(1)',    opacity: '1' },
    { transform: 'scale(1.1)', opacity: '0.8', offset: 0.3 },
    { transform: 'scale(0)',   opacity: '0' },
  ], { duration: duration, easing: 'ease-in', fill: 'forwards' });
  if (remove) _removeAfter(el, duration + 50);
}

/**
 * breathe(el, scale?, duration?)
 * Gentle breathing animation — for idle/waiting elements.
 */
function breathe(el, scale, duration) {
  el = _el(el); if (!el) return;
  scale    = scale    || 1.05;
  duration = duration || 2000;

  el.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(' + scale + ')' },
    { transform: 'scale(1)' },
  ], { duration: duration, easing: 'ease-in-out', iterations: Infinity });
}

/**
 * squashAndStretch(el, direction?, duration?)
 * Physical squash and stretch — for bouncing/landing elements.
 * direction: 'land' | 'launch'
 */
function squashAndStretch(el, direction, duration) {
  el = _el(el); if (!el) return;
  direction = direction || 'land';
  duration  = duration  || 400;

  const frames = direction === 'land'
    ? [
        { transform: 'scaleX(1)   scaleY(1)'    },
        { transform: 'scaleX(1.4) scaleY(0.6)', offset: 0.4 },
        { transform: 'scaleX(0.9) scaleY(1.15)', offset: 0.7 },
        { transform: 'scaleX(1)   scaleY(1)'    },
      ]
    : [
        { transform: 'scaleX(1)   scaleY(1)'    },
        { transform: 'scaleX(0.8) scaleY(1.3)',  offset: 0.4 },
        { transform: 'scaleX(1)   scaleY(1)'    },
      ];

  el.animate(frames, { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * scaleUp(el, to?, duration?)
 */
function scaleUp(el, to, duration) {
  el = _el(el); if (!el) return;
  to       = to       || 1.2;
  duration = duration || 300;
  el.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.34,1.56,0.64,1)';
  el.style.transform  = 'scale(' + to + ')';
}

/**
 * scaleDown(el, to?, duration?)
 */
function scaleDown(el, to, duration) {
  el = _el(el); if (!el) return;
  to       = to       || 1;
  duration = duration || 300;
  el.style.transition = 'transform ' + duration + 'ms ease';
  el.style.transform  = 'scale(' + to + ')';
}

// ─────────────────────────────────────────────────────────────────
// ROTATION / WOBBLE UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * shake(el, intensity?, duration?)
 * Horizontal shake — for errors, rejections.
 */
function shake(el, intensity, duration) {
  el = _el(el); if (!el) return;
  intensity = intensity || 8;
  duration  = duration  || 400;

  el.animate([
    { transform: 'translateX(0)'            },
    { transform: 'translateX(-' + intensity + 'px)' },
    { transform: 'translateX(' + intensity + 'px)'  },
    { transform: 'translateX(-' + (intensity*0.7) + 'px)' },
    { transform: 'translateX(' + (intensity*0.7) + 'px)'  },
    { transform: 'translateX(-' + (intensity*0.4) + 'px)' },
    { transform: 'translateX(0)'            },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * wobble(el, duration?)
 * Wobble rotation — for playful feedback.
 */
function wobble(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 500;

  el.animate([
    { transform: 'rotate(0deg)'   },
    { transform: 'rotate(-8deg)',  offset: 0.2 },
    { transform: 'rotate(6deg)',   offset: 0.4 },
    { transform: 'rotate(-4deg)',  offset: 0.6 },
    { transform: 'rotate(2deg)',   offset: 0.8 },
    { transform: 'rotate(0deg)'   },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * jello(el, duration?)
 * Jello effect — for celebration/found moments.
 */
function jello(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 600;

  el.animate([
    { transform: 'skewX(0) skewY(0)'       },
    { transform: 'skewX(-12deg) skewY(-12deg)', offset: 0.2 },
    { transform: 'skewX(8deg) skewY(8deg)',     offset: 0.35 },
    { transform: 'skewX(-4deg) skewY(-4deg)',   offset: 0.5  },
    { transform: 'skewX(2deg) skewY(2deg)',     offset: 0.65 },
    { transform: 'skewX(0) skewY(0)',           offset: 0.75 },
    { transform: 'skewX(0) skewY(0)'       },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * spin(el, times?, duration?)
 */
function spin(el, times, duration) {
  el = _el(el); if (!el) return;
  times    = times    || 1;
  duration = duration || 500;
  el.animate([
    { transform: 'rotate(0deg)'          },
    { transform: 'rotate(' + (360 * times) + 'deg)' },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * swing(el, duration?)
 * Pendulum swing — for idle decoration elements.
 */
function swing(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 1500;
  el.animate([
    { transform: 'rotate(-8deg)', offset: 0    },
    { transform: 'rotate(8deg)',  offset: 0.5  },
    { transform: 'rotate(-8deg)', offset: 1    },
  ], { duration: duration, easing: 'ease-in-out', iterations: Infinity });
}

// ─────────────────────────────────────────────────────────────────
// TEXT UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * typeWords(el, text, delayPerWord?, boldWords?)
 * Reveals text word by word — for captions.
 * boldWords: array of words to make accent colored.
 */
function typeWords(el, text, delayPerWord, boldWords) {
  el = _el(el); if (!el) return;
  delayPerWord = delayPerWord || 80;
  boldWords    = boldWords    || [];

  el.innerHTML = '';
  const words  = text.split(' ');
  words.forEach((word, i) => {
    const span     = document.createElement('span');
    span.className = 'word';
    const cleanWord = word.replace(/[*_]/g, '');
    span.textContent = cleanWord + ' ';

    // Bold if in boldWords list or wrapped in *
    if (boldWords.includes(cleanWord) || word.startsWith('*')) {
      span.classList.add('bold');
    }

    span.style.animationDelay = (i * delayPerWord) + 'ms';
    el.appendChild(span);
  });
}

/**
 * countUp(el, from, to, duration?, suffix?)
 * Animates number counting up.
 */
function countUp(el, from, to, duration, suffix) {
  el = _el(el); if (!el) return;
  duration = duration || 600;
  suffix   = suffix   || '';
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const value    = Math.round(from + (to - from) * eased);
    el.textContent = value + suffix;
    if (progress < 1) _raf(step);
  }
  _raf(step);
}

/**
 * valueChange(el, newValue, flashColor?)
 * Instantly updates a value with a flash animation.
 */
function valueChange(el, newValue, flashColor) {
  el = _el(el); if (!el) return;
  flashColor = flashColor || 'rgba(99,179,237,0.4)';
  el.textContent = newValue;
  el.animate([
    { color: 'var(--accent)',  transform: 'scale(1.15)' },
    { color: 'inherit',        transform: 'scale(1)'    },
  ], { duration: 400, easing: 'ease-out', fill: 'forwards' });
}

/**
 * dramaticText(el, text, duration?)
 * Shows bold dramatic text with glow — for key moments.
 */
function dramaticText(el, text, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 2000;

  el.textContent = text;
  el.style.display = 'block';

  el.animate([
    { opacity: '0', transform: 'scale(0.8) translateY(10px)' },
    { opacity: '1', transform: 'scale(1.05) translateY(0)',   offset: 0.4 },
    { opacity: '1', transform: 'scale(1) translateY(0)',       offset: 0.7 },
    { opacity: '0', transform: 'scale(0.95) translateY(-5px)'              },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * scrambleText(el, finalText, duration?)
 * Matrix-style text scramble reveal.
 */
function scrambleText(el, finalText, duration) {
  el = _el(el); if (!el) return;
  duration  = duration || 800;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const revealed = Math.floor(progress * finalText.length);
    let result     = finalText.slice(0, revealed);

    for (let i = revealed; i < finalText.length; i++) {
      result += finalText[i] === ' '
        ? ' '
        : chars[Math.floor(Math.random() * chars.length)];
    }

    el.textContent = result;
    if (progress < 1) _raf(step);
  }
  _raf(step);
}

// ─────────────────────────────────────────────────────────────────
// PARTICLE UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * splashBurst(x, y, color?, count?, container?)
 * Creates a burst of particles at position.
 */
function splashBurst(x, y, color, count, container) {
  color     = color     || '#63b3ed';
  count     = count     || 12;
  const parent = container ? _el(container) : document.getElementById('scene-area') || document.body;
  const rect   = parent.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const angle  = (i / count) * Math.PI * 2;
    const speed  = 40 + Math.random() * 60;
    const dx     = Math.cos(angle) * speed;
    const dy     = Math.sin(angle) * speed;
    const size   = 3 + Math.random() * 5;

    const p = _tempEl('div', {
      position: 'absolute',
      left:     (x - size/2) + 'px',
      top:      (y - size/2) + 'px',
      width:    size + 'px',
      height:   size + 'px',
      borderRadius: '50%',
      background: color,
      pointerEvents: 'none',
      zIndex: '28',
      boxShadow: '0 0 4px ' + color,
    }, parent);

    p.animate([
      { transform: 'translate(0,0)',             opacity: '1' },
      { transform: 'translate(' + dx + 'px,' + dy + 'px)', opacity: '0' },
    ], { duration: 500 + Math.random() * 300, easing: 'ease-out', fill: 'forwards' });

    _removeAfter(p, 900);
  }
}

/**
 * confettiBurst(x, y, count?, container?)
 * Colorful confetti celebration burst.
 */
function confettiBurst(x, y, count, container) {
  count  = count || 30;
  const colors = ['#63b3ed','#9f7aea','#68d391','#f6ad55','#fc8181','#f6e05e','#f687b3'];
  const parent = container ? _el(container) : document.getElementById('scene-area') || document.body;

  for (let i = 0; i < count; i++) {
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const angle  = Math.random() * Math.PI * 2;
    const speed  = 60 + Math.random() * 80;
    const dx     = Math.cos(angle) * speed;
    const dy     = Math.sin(angle) * speed - 40;
    const rot    = Math.random() * 720 - 360;
    const w      = 4 + Math.random() * 6;
    const h      = 6 + Math.random() * 8;

    const p = _tempEl('div', {
      position: 'absolute',
      left:     x + 'px',
      top:      y + 'px',
      width:    w + 'px',
      height:   h + 'px',
      background: color,
      borderRadius: '2px',
      pointerEvents: 'none',
      zIndex: '28',
    }, parent);

    p.animate([
      { transform: 'translate(0,0) rotate(0deg)',                          opacity: '1' },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)', opacity: '0' },
    ], {
      duration: 700 + Math.random() * 400,
      easing:   'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill:     'forwards',
    });

    _removeAfter(p, 1200);
  }
}

/**
 * ripple(el, color?, duration?)
 * Expanding ring ripple from element center.
 */
function ripple(el, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || 'rgba(99,179,237,0.5)';
  duration = duration || 700;

  const rect   = el.getBoundingClientRect();
  const parent = el.parentElement || document.body;
  const pRect  = parent.getBoundingClientRect();
  const cx     = rect.left - pRect.left + rect.width  / 2;
  const cy     = rect.top  - pRect.top  + rect.height / 2;
  const size   = Math.max(rect.width, rect.height) * 2.5;

  const ring = _tempEl('div', {
    position:     'absolute',
    left:         (cx - size/2) + 'px',
    top:          (cy - size/2) + 'px',
    width:        size + 'px',
    height:       size + 'px',
    borderRadius: '50%',
    border:       '2px solid ' + color,
    pointerEvents: 'none',
    zIndex:       '20',
    transform:    'scale(0)',
    opacity:      '1',
  }, parent);

  ring.animate([
    { transform: 'scale(0)', opacity: '1'   },
    { transform: 'scale(1)', opacity: '0'   },
  ], { duration: duration, easing: 'ease-out', fill: 'forwards' });

  _removeAfter(ring, duration + 50);
}

/**
 * shockwave(el, color?, duration?)
 * Stronger shockwave ring — for big impact moments.
 */
function shockwave(el, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || 'rgba(246,224,94,0.6)';
  duration = duration || 500;

  // 3 rings with stagger
  for (let i = 0; i < 3; i++) {
    _after(i * 80, () => ripple(el, color, duration));
  }
}

/**
 * sparkle(el, count?, duration?)
 * Sparkle stars around element.
 */
function sparkle(el, count, duration) {
  el = _el(el); if (!el) return;
  count    = count    || 6;
  duration = duration || 800;

  const rect   = el.getBoundingClientRect();
  const parent = el.parentElement || document.body;
  const pRect  = parent.getBoundingClientRect();
  const cx     = rect.left - pRect.left + rect.width  / 2;
  const cy     = rect.top  - pRect.top  + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const angle  = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist   = 20 + Math.random() * 30;
    const x      = cx + Math.cos(angle) * dist;
    const y      = cy + Math.sin(angle) * dist;

    const star = _tempEl('div', {
      position:  'absolute',
      left:      x + 'px',
      top:       y + 'px',
      fontSize:  (8 + Math.random() * 8) + 'px',
      zIndex:    '28',
      pointerEvents: 'none',
    }, parent);
    star.textContent = '✦';
    star.style.color = ['#f6e05e','#63b3ed','#f687b3','#68d391'][i % 4];

    star.animate([
      { transform: 'scale(0) rotate(0deg)',   opacity: '0' },
      { transform: 'scale(1) rotate(180deg)', opacity: '1', offset: 0.4 },
      { transform: 'scale(0) rotate(360deg)', opacity: '0' },
    ], { duration: duration, easing: 'ease-in-out', delay: i * 60, fill: 'forwards' });

    _removeAfter(star, duration + i * 60 + 100);
  }
}

/**
 * bubbles(container, count?, color?)
 * Floating bubbles rising — for bubble sort / water themes.
 */
function bubbles(container, count, color) {
  container = _el(container) || document.getElementById('scene-area');
  if (!container) return;
  count = count || 8;
  color = color || 'rgba(99,179,237,0.3)';

  const rect = container.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const size = 6 + Math.random() * 14;
    const x    = Math.random() * (rect.width - size);
    const riseH = 60 + Math.random() * 120;

    const b = _tempEl('div', {
      position:     'absolute',
      left:         x + 'px',
      bottom:       '10px',
      width:        size + 'px',
      height:       size + 'px',
      borderRadius: '50%',
      border:       '1px solid ' + color,
      background:   color.replace('0.3', '0.1'),
      pointerEvents: 'none',
      zIndex:       '10',
    }, container);

    b.animate([
      { transform: 'translateY(0) scale(1)',           opacity: '0.8' },
      { transform: 'translateY(-' + riseH + 'px) scale(1.1)', opacity: '0' },
    ], {
      duration: 1000 + Math.random() * 800,
      easing:   'ease-out',
      delay:    i * 150,
      fill:     'forwards',
    });

    _removeAfter(b, 2000 + i * 150);
  }
}

// ─────────────────────────────────────────────────────────────────
// WATER UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * waterFill(el, percent, color?, duration?)
 * Fills element with animated water up to percent (0–100).
 * Element must have position:relative and overflow:hidden.
 */
function waterFill(el, percent, color, duration) {
  el = _el(el); if (!el) return;
  color    = color    || 'rgba(99,179,237,0.5)';
  duration = duration || 800;

  percent = _clamp(percent, 0, 100);

  // Find or create water fill div inside element
  let fill = el.querySelector('._water_fill');
  if (!fill) {
    fill = document.createElement('div');
    fill.className = '_water_fill';
    Object.assign(fill.style, {
      position:     'absolute',
      bottom:       '0',
      left:         '0',
      right:        '0',
      height:       '0%',
      background:   color,
      transition:   'height ' + duration + 'ms cubic-bezier(0.25,0.46,0.45,0.94)',
      pointerEvents: 'none',
      zIndex:       '2',
    });
    // Wave top
    fill.innerHTML = '<div style="position:absolute;top:-4px;left:-10%;width:120%;height:8px;background:' + color + ';border-radius:50%;animation:waterWaveAnim 1.5s ease-in-out infinite;"></div>';
    el.style.position = el.style.position || 'relative';
    el.style.overflow  = 'hidden';
    el.appendChild(fill);
  }

  fill.style.background  = color;
  fill.style.transition  = 'height ' + duration + 'ms cubic-bezier(0.25,0.46,0.45,0.94)';
  _raf(() => { _raf(() => { fill.style.height = percent + '%'; }); });
}

/**
 * waterDrain(el, duration?)
 * Drains water fill from element.
 */
function waterDrain(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 600;
  const fill = el.querySelector('._water_fill');
  if (fill) {
    fill.style.transition = 'height ' + duration + 'ms ease-in';
    fill.style.height     = '0%';
  }
}

/**
 * waterRipple(el, color?, duration?)
 * Water ripple on surface — for water theme.
 */
function waterRipple(el, color, duration) {
  ripple(el, color || 'rgba(99,179,237,0.4)', duration || 600);
}

/**
 * waterSplash(x, y, container?, color?)
 * Water splash particles upward.
 */
function waterSplash(x, y, container, color) {
  color = color || '#63b3ed';
  const parent = container ? _el(container) : document.getElementById('scene-area') || document.body;

  for (let i = 0; i < 10; i++) {
    const angle  = -Math.PI + (i / 9) * Math.PI; // upward arc
    const speed  = 30 + Math.random() * 50;
    const dx     = Math.cos(angle) * speed;
    const dy     = Math.sin(angle) * speed;
    const size   = 2 + Math.random() * 4;

    const drop = _tempEl('div', {
      position:     'absolute',
      left:         x + 'px',
      top:          y + 'px',
      width:        size + 'px',
      height:       size + 'px',
      borderRadius: '50%',
      background:   color,
      pointerEvents: 'none',
      zIndex:       '25',
      opacity:      '0.8',
    }, parent);

    drop.animate([
      { transform: 'translate(0,0)',    opacity: '0.8' },
      { transform: 'translate(' + dx + 'px,' + (dy - 20) + 'px)', opacity: '0.6', offset: 0.5 },
      { transform: 'translate(' + (dx*1.2) + 'px,' + (dy + 30) + 'px)', opacity: '0' },
    ], { duration: 500 + Math.random() * 300, easing: 'ease-in', fill: 'forwards' });

    _removeAfter(drop, 900);
  }
}

/**
 * waterDrop(x, y, container?, color?)
 * Single water drop falling.
 */
function waterDrop(x, y, container, color) {
  color = color || '#63b3ed';
  const parent = container ? _el(container) : document.getElementById('scene-area') || document.body;

  const drop = _tempEl('div', {
    position:     'absolute',
    left:         x + 'px',
    top:          (y - 20) + 'px',
    width:        '6px',
    height:       '10px',
    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
    background:   color,
    boxShadow:    '0 0 6px ' + color,
    pointerEvents: 'none',
    zIndex:       '25',
  }, parent);

  drop.animate([
    { transform: 'translateY(-10px)', opacity: '1'   },
    { transform: 'translateY(20px)',  opacity: '0.8' },
    { transform: 'translateY(0)',     opacity: '0'   },
  ], { duration: 400, easing: 'ease-in', fill: 'forwards' });

  _removeAfter(drop, 500);
}

// ─────────────────────────────────────────────────────────────────
// DRAWING UTILITIES (SVG-based)
// ─────────────────────────────────────────────────────────────────

/**
 * drawLine(svgEl, x1, y1, x2, y2, color?, width?, id?)
 * Draws a line in SVG — with animated stroke-dashoffset reveal.
 */
function drawLine(svgEl, x1, y1, x2, y2, color, width, id) {
  svgEl = _el(svgEl) || document.getElementById('svg-canvas');
  if (!svgEl) return;
  color = color || '#63b3ed';
  width = width || 2;

  // Remove existing if id provided
  if (id) { const old = svgEl.querySelector('#' + id); if (old) old.remove(); }

  const length = Math.hypot(x2 - x1, y2 - y1);
  const line   = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', width);
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('stroke-dasharray', length);
  line.setAttribute('stroke-dashoffset', length);
  if (id) line.setAttribute('id', id);

  line.style.transition = 'stroke-dashoffset 400ms ease';
  svgEl.appendChild(line);
  _raf(() => { _raf(() => { line.setAttribute('stroke-dashoffset', '0'); }); });
  return line;
}

/**
 * drawArrow(svgEl, x1, y1, x2, y2, color?, id?)
 * Draws an arrow with animated reveal.
 */
function drawArrow(svgEl, x1, y1, x2, y2, color, id) {
  svgEl = _el(svgEl) || document.getElementById('svg-canvas');
  if (!svgEl) return;
  color = color || '#63b3ed';

  // Ensure marker exists
  const markerId = '_arrow_' + (color.replace(/[^a-zA-Z0-9]/g, ''));
  if (!svgEl.querySelector('#' + markerId)) {
    const defs   = svgEl.querySelector('defs') || svgEl.insertBefore(
      document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svgEl.firstChild
    );
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', color);
    marker.appendChild(path);
    defs.appendChild(marker);
  }

  if (id) { const old = svgEl.querySelector('#' + id); if (old) old.remove(); }

  const length = Math.hypot(x2 - x1, y2 - y1);
  const line   = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('marker-end', 'url(#' + markerId + ')');
  line.setAttribute('stroke-dasharray', length);
  line.setAttribute('stroke-dashoffset', length);
  if (id) line.setAttribute('id', id);

  line.style.transition = 'stroke-dashoffset 400ms ease';
  svgEl.appendChild(line);
  _raf(() => { _raf(() => { line.setAttribute('stroke-dashoffset', '0'); }); });
  return line;
}

/**
 * drawArc(svgEl, x1, y1, x2, y2, curvature?, color?, id?)
 * Draws a curved arc between two points.
 */
function drawArc(svgEl, x1, y1, x2, y2, curvature, color, id) {
  svgEl = _el(svgEl) || document.getElementById('svg-canvas');
  if (!svgEl) return;
  color     = color     || '#9f7aea';
  curvature = curvature || -60;

  const mx  = (x1 + x2) / 2;
  const my  = (y1 + y2) / 2 + curvature;
  const d   = 'M ' + x1 + ' ' + y1 + ' Q ' + mx + ' ' + my + ' ' + x2 + ' ' + y2;

  if (id) { const old = svgEl.querySelector('#' + id); if (old) old.remove(); }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  if (id) path.setAttribute('id', id);

  const len = path.getTotalLength ? 200 : 200;
  path.setAttribute('stroke-dasharray', '200');
  path.setAttribute('stroke-dashoffset', '200');
  path.style.transition = 'stroke-dashoffset 500ms ease';
  svgEl.appendChild(path);
  _raf(() => { _raf(() => { path.setAttribute('stroke-dashoffset', '0'); }); });
  return path;
}

/**
 * connectionBeam(el1, el2, svgEl?, color?, id?)
 * Draws a glowing connection beam between two DOM elements.
 */
function connectionBeam(el1, el2, svgEl, color, id) {
  el1   = _el(el1); el2 = _el(el2);
  svgEl = _el(svgEl) || document.getElementById('svg-canvas');
  if (!el1 || !el2 || !svgEl) return;
  color = color || '#63b3ed';

  const r1   = el1.getBoundingClientRect();
  const r2   = el2.getBoundingClientRect();
  const sr   = svgEl.getBoundingClientRect();
  const x1   = r1.left - sr.left + r1.width  / 2;
  const y1   = r1.top  - sr.top  + r1.height / 2;
  const x2   = r2.left - sr.left + r2.width  / 2;
  const y2   = r2.top  - sr.top  + r2.height / 2;

  return drawLine(svgEl, x1, y1, x2, y2, color, 2, id);
}

/**
 * pathHighlight(svgEl, points, color?, id?)
 * Highlights a path through points — for graph traversal.
 */
function pathHighlight(svgEl, points, color, id) {
  svgEl = _el(svgEl) || document.getElementById('svg-canvas');
  if (!svgEl || !points || points.length < 2) return;
  color = color || '#68d391';

  if (id) { const old = svgEl.querySelector('#' + id); if (old) old.remove(); }

  const d = 'M ' + points.map(p => p[0] + ' ' + p[1]).join(' L ');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '3');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('filter', 'drop-shadow(0 0 4px ' + color + ')');
  if (id) path.setAttribute('id', id);
  svgEl.appendChild(path);
  return path;
}

// ─────────────────────────────────────────────────────────────────
// CAMERA UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * zoomIn(container?, scale?, duration?)
 * Scales scene in.
 */
function zoomIn(container, scale, duration) {
  container = _el(container) || document.getElementById('scene-content');
  if (!container) return;
  scale    = scale    || 1.15;
  duration = duration || 500;
  container.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.34,1.2,0.64,1)';
  container.style.transform  = 'scale(' + scale + ')';
}

/**
 * zoomOut(container?, duration?)
 * Returns scene to normal scale.
 */
function zoomOut(container, duration) {
  container = _el(container) || document.getElementById('scene-content');
  if (!container) return;
  duration  = duration || 500;
  container.style.transition = 'transform ' + duration + 'ms ease';
  container.style.transform  = 'scale(1)';
}

/**
 * panTo(container?, x, y, duration?)
 * Pans scene to position.
 */
function panTo(container, x, y, duration) {
  container = _el(container) || document.getElementById('scene-content');
  if (!container) return;
  duration = duration || 500;
  container.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.34,1.2,0.64,1)';
  container.style.transform  = 'translate(' + x + 'px, ' + y + 'px)';
}

/**
 * cameraShake(container?, intensity?, duration?)
 * Shakes the scene camera — for impact moments.
 */
function cameraShake(container, intensity, duration) {
  container = _el(container) || document.getElementById('scene-area');
  if (!container) return;
  intensity = intensity || 6;
  duration  = duration  || 400;

  container.animate([
    { transform: 'translate(0,0)'                     },
    { transform: 'translate(-' + intensity + 'px,' + intensity + 'px)'   },
    { transform: 'translate(' + intensity + 'px,-' + intensity + 'px)'   },
    { transform: 'translate(-' + (intensity*0.6) + 'px,-' + (intensity*0.6) + 'px)' },
    { transform: 'translate(' + (intensity*0.6) + 'px,' + (intensity*0.6) + 'px)'   },
    { transform: 'translate(0,0)'                     },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * focusOn(el, dimOthers?, duration?)
 * Focuses camera on element with slight zoom.
 */
function focusOn(el, dimOthers, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 400;
  if (dimOthers) {
    spotlight(el, 150);
    _after(1500, () => unspotlight(duration));
  }
  el.scrollIntoView && el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─────────────────────────────────────────────────────────────────
// STATE MARKER UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * markSorted(el)
 * Marks element as sorted/done — green glow.
 */
function markSorted(el) {
  el = _el(el); if (!el) return;
  el.classList.remove('el-active','el-current','el-error','el-visited');
  el.classList.add('el-sorted');
}

/**
 * markActive(el)
 * Marks element as currently active — cyan glow.
 */
function markActive(el) {
  el = _el(el); if (!el) return;
  el.classList.remove('el-sorted','el-current','el-error','el-visited');
  el.classList.add('el-active');
}

/**
 * markVisited(el)
 * Marks element as visited/processed — dimmed.
 */
function markVisited(el) {
  el = _el(el); if (!el) return;
  el.classList.remove('el-active','el-current','el-error','el-sorted');
  el.classList.add('el-visited');
}

/**
 * markCurrent(el)
 * Marks element as current/focus — yellow glow.
 */
function markCurrent(el) {
  el = _el(el); if (!el) return;
  el.classList.remove('el-active','el-sorted','el-error','el-visited');
  el.classList.add('el-current');
}

/**
 * markError(el)
 * Marks element as error/rejected — red glow.
 */
function markError(el) {
  el = _el(el); if (!el) return;
  el.classList.remove('el-active','el-sorted','el-current','el-visited');
  el.classList.add('el-error');
}

/**
 * markInactive(el)
 * Clears all state markers from element.
 */
function markInactive(el) {
  el = _el(el); if (!el) return;
  el.classList.remove('el-active','el-sorted','el-current','el-error','el-visited');
}

// ─────────────────────────────────────────────────────────────────
// CHARACTER UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * characterIdle(charEl)
 * Sets character to breathing idle state.
 */
function characterIdle(charEl) {
  charEl = _el(charEl); if (!charEl) return;
  charEl.classList.remove('jumping','celebrating','walking');
  charEl.classList.add('idle');
}

/**
 * characterJump(charEl, targetX, targetY, duration?, onLand?)
 * Makes character jump to position with arc.
 */
function characterJump(charEl, targetX, targetY, duration, onLand) {
  charEl = _el(charEl); if (!charEl) return;
  duration = duration || 700;
  charEl.classList.remove('idle','celebrating');
  charEl.classList.add('jumping');

  moveArcHigh(charEl, targetX, targetY, duration);

  _after(duration, () => {
    squashAndStretch(charEl, 'land', 300);
    charEl.classList.remove('jumping');
    charEl.classList.add('idle');
    if (onLand) onLand();
  });
}

/**
 * characterWalk(charEl, targetX, targetY, duration?)
 * Makes character walk (slide) to position.
 */
function characterWalk(charEl, targetX, targetY, duration) {
  charEl = _el(charEl); if (!charEl) return;
  duration = duration || 600;
  charEl.classList.add('walking');
  springTo(charEl, targetX, targetY, duration);
  _after(duration, () => {
    charEl.classList.remove('walking');
    charEl.classList.add('idle');
  });
}

/**
 * characterCelebrate(charEl, duration?)
 * Puts character in celebrate mode.
 */
function characterCelebrate(charEl, duration) {
  charEl = _el(charEl); if (!charEl) return;
  duration = duration || 3000;
  charEl.classList.remove('idle','jumping','walking');
  charEl.classList.add('celebrating');
  _after(duration, () => characterIdle(charEl));
}

/**
 * characterThink(charEl, duration?)
 * Character thinking — wobble + dim.
 */
function characterThink(charEl, duration) {
  charEl = _el(charEl); if (!charEl) return;
  duration = duration || 800;
  wobble(charEl, duration);
}

/**
 * characterPoint(charEl, direction?)
 * Character points in a direction — tilt.
 */
function characterPoint(charEl, direction) {
  charEl = _el(charEl); if (!charEl) return;
  direction = direction || 'right';
  const rot = direction === 'right' ? '15deg' : '-15deg';
  charEl.style.transition = 'transform 300ms ease';
  charEl.style.transform  = (charEl.style.transform || '') + ' rotate(' + rot + ')';
  _after(800, () => {
    charEl.style.transform = charEl.style.transform.replace(/rotate\([^)]+\)/, '');
  });
}

// ─────────────────────────────────────────────────────────────────
// COMPLETION UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * celebrationWave(container?)
 * Sends a ripple wave across all scene elements.
 */
function celebrationWave(container) {
  const parent  = _el(container) || document.getElementById('scene-content');
  if (!parent) return;
  const elements = parent.querySelectorAll('.scene-element, .bar-el, .node-el, .cell-el, .card-el');
  elements.forEach((el, i) => {
    _after(i * 60, () => {
      el.animate([
        { transform: 'translateY(0) scale(1)'     },
        { transform: 'translateY(-12px) scale(1.08)' },
        { transform: 'translateY(0) scale(1)'     },
      ], { duration: 400, easing: 'ease-in-out' });
    });
  });
}

/**
 * victoryBurst(x, y, container?)
 * Big celebration particle burst.
 */
function victoryBurst(x, y, container) {
  confettiBurst(x, y, 50, container);
  _after(150, () => confettiBurst(x, y, 30, container));
  _after(300, () => splashBurst(x, y, '#f6e05e', 20, container));
}

/**
 * goldOutline(el, duration?)
 * Gives element a golden glowing outline — for victory/optimal.
 */
function goldOutline(el, duration) {
  el = _el(el); if (!el) return;
  duration = duration || 1500;
  el.animate([
    { boxShadow: '0 0 0px rgba(246,224,94,0)',  borderColor: 'transparent' },
    { boxShadow: '0 0 20px rgba(246,224,94,0.8), 0 0 40px rgba(246,224,94,0.4)', borderColor: '#f6e05e' },
    { boxShadow: '0 0 8px rgba(246,224,94,0.4)',  borderColor: '#f6e05e' },
  ], { duration: duration, easing: 'ease-in-out', fill: 'forwards' });
}

/**
 * finalReveal(container?)
 * Dramatic final reveal — brightens scene.
 */
function finalReveal(container) {
  container = _el(container) || document.getElementById('scene-area');
  if (!container) return;
  container.animate([
    { filter: 'brightness(1) saturate(1)'       },
    { filter: 'brightness(1.3) saturate(1.4)',   offset: 0.3 },
    { filter: 'brightness(1.05) saturate(1.1)'  },
  ], { duration: 1000, easing: 'ease-in-out', fill: 'forwards' });
}

// ─────────────────────────────────────────────────────────────────
// TIMING UTILITIES
// ─────────────────────────────────────────────────────────────────

/**
 * delay(ms)
 * Returns a Promise that resolves after ms.
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * stagger(elements, fn, interval?)
 * Calls fn(el, index) for each element with stagger delay.
 */
function stagger(elements, fn, interval) {
  interval = interval || 80;
  if (typeof elements === 'string') elements = _els(elements);
  elements.forEach((el, i) => _after(i * interval, () => fn(el, i)));
}

/**
 * sequence(fns, interval?)
 * Calls array of functions in sequence with interval.
 */
function sequence(fns, interval) {
  interval = interval || 200;
  fns.forEach((fn, i) => _after(i * interval, fn));
}

/**
 * chainAnimations(steps)
 * Chain: [{fn, delay}, ...] — runs each after delay.
 */
function chainAnimations(steps) {
  let cumulative = 0;
  steps.forEach(step => {
    cumulative += (step.delay || 0);
    const t = cumulative;
    _after(t, () => step.fn && step.fn());
  });
}

/* ═══════════════════════════════════════════════════
   WATER WAVE CSS KEYFRAMES
   (needed by waterFill)
═══════════════════════════════════════════════════ */
(function() {
  const style = document.createElement('style');
  style.textContent = '@keyframes waterWaveAnim { 0%,100%{transform:translateX(0) scaleY(1)} 50%{transform:translateX(-5%) scaleY(1.3)} }';
  document.head.appendChild(style);
})();
  `.trim();
}