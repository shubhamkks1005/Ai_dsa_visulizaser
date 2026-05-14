// lib/visualizer/shell.ts

import { animationCSS, animationJS } from "./animations";
import { captionCSS, captionHTML, captionJS } from "./caption";
import { statsCSS, statsHTML, statsJS } from "./stats";
import { controlsCSS, controlsHTML, controlsJS } from "./controls";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface ShellConfig {
  algorithmName: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  customCSS: string;
  sceneHTML: string;
  sceneScript: string;
  stats: Array<{
    key: string;
    label: string;
    value?: number;
  }>;
  baseInterval?: number;
  boldKeywords?: string[];
}

// ═══════════════════════════════════════════════════
// BASE LAYOUT CSS
// Fixed layout that NEVER changes
// ═══════════════════════════════════════════════════

const baseCSS = `
/* ═══════════════════════════════════════════════════
   RESET + BASE
   ═══════════════════════════════════════════════════ */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: #0d1117;
  color: #e2e8f0;
}

/* ═══════════════════════════════════════════════════
   APP LAYOUT — Flex column, full viewport
   ═══════════════════════════════════════════════════ */
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* ═══════════════════════════════════════════════════
   SCENE AREA — Takes ALL remaining space
   ═══════════════════════════════════════════════════ */
#scene-area {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: #0d1117;
}

#scene-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: auto;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

#scene-content > * {
  max-width: 100%;
  max-height: 100%;
}

/* ═══════════════════════════════════════════════════
   SCENE UTILITY CLASSES
   AI can use these in sceneHTML
   ═══════════════════════════════════════════════════ */
.scene-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.scene-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  padding: 40px 20px 20px 20px;
}

.scene-grid {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.scene-absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* ═══════════════════════════════════════════════════
   COMMON ELEMENT STYLES
   AI can use these classes
   ═══════════════════════════════════════════════════ */
.scene-element {
  position: absolute;
  transition: all 0.4s ease;
}

.scene-bar {
  position: absolute;
  bottom: 0;
  border-radius: 4px 4px 0 0;
  transition: all 0.4s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  min-width: 30px;
}

.scene-node {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #e2e8f0;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
}

.scene-card {
  padding: 8px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: #e2e8f0;
  transition: all 0.3s ease;
}

.scene-pointer {
  position: absolute;
  font-size: 18px;
  text-align: center;
  transition: all 0.4s ease;
  z-index: 20;
}

.scene-label {
  position: absolute;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.scene-hero {
  position: absolute;
  font-size: 32px;
  z-index: 25;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
}

.scene-water {
  position: absolute;
  bottom: 0;
  background: rgba(99, 179, 237, 0.35);
  border-radius: 2px;
  transition: height 0.6s ease-out;
  z-index: 5;
}

.scene-connection {
  position: absolute;
  height: 2px;
  background: rgba(255, 255, 255, 0.15);
  transform-origin: left center;
  transition: all 0.4s ease;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════
   AMBIENT / ENVIRONMENT CLASSES
   AI can use these for background effects
   ═══════════════════════════════════════════════════ */
.scene-bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.scene-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 30;
  overflow: hidden;
}

.scene-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 35;
}

/* ═══════════════════════════════════════════════════
   DRAMATIC TEXT OVERLAY
   ═══════════════════════════════════════════════════ */
.dramatic-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 40;
}

.dramatic-text {
  font-size: 28px;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 30px rgba(99, 179, 237, 0.6);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dramatic-text.visible {
  opacity: 1;
  transform: scale(1);
}

/* ═══════════════════════════════════════════════════
   TOOLTIP
   ═══════════════════════════════════════════════════ */
.scene-tooltip {
  position: absolute;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.85);
  color: #e2e8f0;
  font-size: 12px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 50;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ═══════════════════════════════════════════════════
   SCROLLBAR (thin dark)
   ═══════════════════════════════════════════════════ */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
`;

// ═══════════════════════════════════════════════════
// INITIALIZATION JS
// Wires everything together after DOM loads
// ═══════════════════════════════════════════════════

const initJS = `
/* ═══════════════════════════════════════════════════
   INITIALIZATION — Runs after DOM ready
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {

  // 1. Set algorithm info
  setAlgorithmInfo(
    window._shellConfig.algorithmName,
    window._shellConfig.category,
    window._shellConfig.timeComplexity,
    window._shellConfig.spaceComplexity
  );

  // 2. Initialize stat counters
  initStats(window._shellConfig.stats);

  // 3. Set caption keywords
  if (window._shellConfig.boldKeywords) {
    setCaptionKeywords(window._shellConfig.boldKeywords);
  }

  // 4. Set base interval
  if (window._shellConfig.baseInterval) {
    window.baseInterval = window._shellConfig.baseInterval;
  }

  // 5. Initialize controls
  _initControls();

  // 6. Update step counter with initial values
  var totalSteps = (window.STEPS && window.STEPS.length) ? window.STEPS.length : 0;
  updateStepCounter(0, totalSteps);

  // 7. IMPORTANT: render first step immediately so scene is visible
 if (window.STEPS && window.STEPS.length > 0 && typeof renderScene === 'function') {
    try {
      // Render first step but DO NOT mark playback as started
      window.currentStep = 0;
      var firstStep = window.STEPS[0];

      if (typeof updateStepCounter === 'function') {
        updateStepCounter(1, window.STEPS.length);
      }
      if (typeof setCaption === 'function' && firstStep.caption) {
        setCaption(firstStep.caption, firstStep.important);
      }
      if (typeof updateVariables === 'function' && firstStep.variables) {
        updateVariables(firstStep.variables);
      }
      renderScene(firstStep, 0);
    } catch (e) {
      console.warn('[Shell] Initial step render failed:', e);
    }
  }

  // 8. Log ready status
  console.log('[Shell] Ready: ' + window._shellConfig.algorithmName +
    ' | ' + totalSteps + ' steps' +
    ' | Scene loaded');
});
`;

// ═══════════════════════════════════════════════════
// MAIN EXPORT — Build complete HTML
// ═══════════════════════════════════════════════════

export function buildShellHTML(config: ShellConfig): string {
  const {
    algorithmName,
    category,
    timeComplexity,
    spaceComplexity,
    customCSS,
    sceneHTML,
    sceneScript,
    stats,
    baseInterval,
    boldKeywords,
  } = config;

  // Build shell config object for JS
  const shellConfigJSON = JSON.stringify({
    algorithmName: algorithmName || "Algorithm",
    category: category || "—",
    timeComplexity: timeComplexity || "",
    spaceComplexity: spaceComplexity || "",
    stats: stats || [],
    baseInterval: baseInterval || 1200,
    boldKeywords: boldKeywords || [],
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(algorithmName || "Algorithm")} Visualization</title>
<style>
/* ═══════════════════════════════════════════════════
   FIXED BASE LAYOUT
   ═══════════════════════════════════════════════════ */
${baseCSS}

/* ═══════════════════════════════════════════════════
   FIXED ANIMATION LIBRARY
   ═══════════════════════════════════════════════════ */
${animationCSS}

/* ═══════════════════════════════════════════════════
   FIXED STATS BAR
   ═══════════════════════════════════════════════════ */
${statsCSS}

/* ═══════════════════════════════════════════════════
   FIXED CAPTION BAR
   ═══════════════════════════════════════════════════ */
${captionCSS}

/* ═══════════════════════════════════════════════════
   FIXED CONTROLS BAR
   ═══════════════════════════════════════════════════ */
${controlsCSS}

/* ═══════════════════════════════════════════════════
   AI CUSTOM CSS — Scene-specific styling
   ═══════════════════════════════════════════════════ */
${customCSS || "/* No custom CSS provided */"}
</style>
</head>
<body>
<div id="app">

  <!-- ═══════════════════════════════════════════
       FIXED STATS BAR
  ═══════════════════════════════════════════ -->
  ${statsHTML}

  <!-- ═══════════════════════════════════════════
       SCENE AREA — AI fills this
  ═══════════════════════════════════════════ -->
  <div id="scene-area">
    <div id="scene-content">
      ${sceneHTML || "<!-- No scene HTML provided -->"}
    </div>
  </div>

  <!-- ═══════════════════════════════════════════
       FIXED CAPTION BAR
  ═══════════════════════════════════════════ -->
  ${captionHTML}

  <!-- ═══════════════════════════════════════════
       FIXED CONTROLS BAR
  ═══════════════════════════════════════════ -->
  ${controlsHTML}

</div>

<script>
/* ═══════════════════════════════════════════════════
   SHELL CONFIG
   ═══════════════════════════════════════════════════ */
window._shellConfig = ${shellConfigJSON};

/* ═══════════════════════════════════════════════════
   FIXED ANIMATION LIBRARY JS
   ═══════════════════════════════════════════════════ */
${animationJS}

/* ═══════════════════════════════════════════════════
   FIXED STATS ENGINE JS
   ═══════════════════════════════════════════════════ */
${statsJS}

/* ═══════════════════════════════════════════════════
   FIXED CAPTION ENGINE JS
   ═══════════════════════════════════════════════════ */
${captionJS}

/* ═══════════════════════════════════════════════════
   FIXED CONTROLS + PLAYBACK ENGINE JS
   ═══════════════════════════════════════════════════ */
${controlsJS}

/* ═══════════════════════════════════════════════════
   AI SCENE SCRIPT — Steps + renderScene
   ═══════════════════════════════════════════════════ */
${sceneScript || "/* No scene script provided */\nwindow.STEPS = [];\nfunction renderScene(step, index) {}"}

/* ═══════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════ */
${initJS}
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}