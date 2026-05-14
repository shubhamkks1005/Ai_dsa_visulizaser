// lib/visualizer/caption.ts

// ═══════════════════════════════════════════════════
// CAPTION CSS
// ═══════════════════════════════════════════════════

export const captionCSS = `
/* ═══════════════════════════════════════════════════
   CAPTION BAR — Always visible at bottom
   ═══════════════════════════════════════════════════ */
#caption-bar {
  flex-shrink: 0;
  min-height: 70px;
  max-height: 110px;
  padding: 12px 20px;
  background: rgba(13, 17, 23, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 50;
  overflow: hidden;
}

#caption-text {
  font-size: 15px;
  line-height: 1.6;
  color: #cbd5e1;
  text-align: center;
  max-width: 800px;
  width: 100%;
  min-height: 24px;
  transition: opacity 0.3s ease;
  word-spacing: normal;
  letter-spacing: normal;
  white-space: normal;
}

#caption-text .caption-word {
  display: inline;
  opacity: 0;
  transition: opacity 0.15s ease;
  margin-right: 0;
}

#caption-text .caption-word.visible {
  opacity: 1;
}

#caption-text .caption-word.bold-word {
  color: #63b3ed;
  font-weight: 700;
}

#caption-text .caption-important {
  color: #fbbf24;
  font-weight: 600;
  font-size: 16px;
}

/* Caption fade animation */
@keyframes captionFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes captionFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-8px); }
}

#caption-text.caption-entering {
  animation: captionFadeIn 0.3s ease forwards;
}

#caption-text.caption-exiting {
  animation: captionFadeOut 0.2s ease forwards;
}
`;

// ═══════════════════════════════════════════════════
// CAPTION HTML
// ═══════════════════════════════════════════════════

export const captionHTML = `
<div id="caption-bar">
  <div id="caption-text">
    <span style="color: #64748b; font-style: italic;">Click Play or Next to begin...</span>
  </div>
</div>
`;

// ═══════════════════════════════════════════════════
// CAPTION JS
// ═══════════════════════════════════════════════════

export const captionJS = `
/* ═══════════════════════════════════════════════════
   CAPTION ENGINE
   ═══════════════════════════════════════════════════ */

var _captionBoldKeywords = [];
var _captionWordTimer = null;
var _captionCurrentText = '';

function setCaptionKeywords(keywords) {
  _captionBoldKeywords = keywords || [];
}

function setCaption(text, important) {
  if (!text) return;
  
  var captionEl = document.getElementById('caption-text');
  if (!captionEl) return;
  
  // Same text, skip
  if (text === _captionCurrentText) return;
  _captionCurrentText = text;
  
  // Clear existing word timer
  if (_captionWordTimer) {
    clearTimeout(_captionWordTimer);
    _captionWordTimer = null;
  }
  
  // Exit animation
  captionEl.classList.remove('caption-entering');
  captionEl.classList.add('caption-exiting');
  
  setTimeout(function() {
    captionEl.classList.remove('caption-exiting');
    
    // Split text into words
    var words = text.split(' ').filter(function(w) { return w.length > 0; });
    
    if (words.length === 0) {
      captionEl.textContent = text;
      captionEl.classList.add('caption-entering');
      return;
    }
    
    // Build word spans
    var html = '';
    words.forEach(function(word, i) {
      var isBold = false;
      var cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      for (var k = 0; k < _captionBoldKeywords.length; k++) {
        if (cleanWord === _captionBoldKeywords[k].toLowerCase()) {
          isBold = true;
          break;
        }
      }
      
      var classes = 'caption-word';
      if (isBold) classes += ' bold-word';
      if (important) classes += ' caption-important';
      
      // Add space before word (except first)
      if (i > 0) html += ' ';
      html += '<span class="' + classes + '">' + word + '</span>';
    });
    
    captionEl.innerHTML = html;
    captionEl.classList.add('caption-entering');
    
    // Reveal words one by one
    var wordSpans = captionEl.querySelectorAll('.caption-word');
    var wordDelay = Math.max(30, Math.min(80, 2000 / words.length));
    
    wordSpans.forEach(function(span, i) {
      _captionWordTimer = setTimeout(function() {
        span.classList.add('visible');
      }, i * wordDelay);
    });
    
  }, 200); // Wait for exit animation
}

function showImportantCaption(text) {
  setCaption(text, true);
}

function clearCaption() {
  var captionEl = document.getElementById('caption-text');
  if (!captionEl) return;
  _captionCurrentText = '';
  captionEl.innerHTML = '<span style="color: #64748b; font-style: italic;">Click Play or Next to begin...</span>';
}
`;