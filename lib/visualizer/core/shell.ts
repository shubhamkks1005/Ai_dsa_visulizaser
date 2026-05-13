// lib/visualizer/core/shell.ts

import { getBaseTheme }        from './theme';
import { getAnimationLibrary } from './animations';
import { getCaptionEngine }    from './caption';
import { getStatsEngine }      from './stats';
import { getControlsHTML, getControlsEngine } from './controls';
import { getPlaybackEngine }   from './playback';

/**
 * getBaseShell()
 *
 * Returns the complete base HTML string for all visualizations.
 * This is the FIXED part — never changes between algorithms.
 *
 * Structure:
 * <!DOCTYPE html>
 *   <head>
 *     <style> BASE THEME CSS </style>
 *   </head>
 *   <body>
 *     <div id="app">
 *       stats-bar
 *       scene-area      ← template HTML injected here
 *       caption-bar
 *       controls-bar
 *       sidebar-panel
 *     </div>
 *     cinematic overlays
 *     completion overlay
 *
 *     <script> ANIMATION LIBRARY      </script>
 *     <script> CAPTION ENGINE         </script>
 *     <script> STATS ENGINE           </script>
 *     <script> CONTROLS ENGINE        </script>
 *     <script> PLAYBACK/RENDER ENGINE </script>
 *
 *     <!-- SLOT: SCENE_CSS    -->   ← assembler injects here
 *     <!-- SLOT: SCENE_HTML   -->   ← assembler injects here
 *     <!-- SLOT: SCENE_SCRIPT -->   ← assembler injects here
 *   </body>
 * </html>
 *
 * Assembler replaces slots with algorithm-specific content.
 */
export function getBaseShell(): string {
  const theme        = getBaseTheme();
  const animations   = getAnimationLibrary();
  const captionEng   = getCaptionEngine();
  const statsEng     = getStatsEngine();
  const controlsHTML = getControlsHTML();
  const controlsEng  = getControlsEngine();
  const playbackEng  = getPlaybackEngine();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Algorithm Visualization</title>

  <!-- Google Fonts -->
  <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
    crossorigin
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@700;800;900&display=swap"
    rel="stylesheet"
  />

  <style>
/* ═══════════════ BASE THEME ═══════════════ */
${theme}

/* ═══════════════ SCENE STYLES SLOT ═══════════════
   Assembler injects algorithm-specific CSS here.
   Marker must stay on its own line exactly as shown.
═════════════════════════════════════════════════ */
/* __SCENE_CSS_START__ */
/* __SCENE_CSS_END__ */
  </style>
</head>

<body>

<!-- ═══════════════════════════════════════════
     APP SHELL
═══════════════════════════════════════════ -->
<div id="app">

  <!-- STATS BAR -->
  <div id="stats-bar">
    <!-- StatsEngine.init() populates this -->
  </div>

  <!-- SCENE AREA -->
  <div id="scene-area">
    <div id="scene-container">
      <div id="scene-content">

        <!-- SVG Canvas for lines/arrows/arcs -->
        <svg
          id="svg-canvas"
          xmlns="http://www.w3.org/2000/svg"
          style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;overflow:visible;"
        >
          <defs></defs>
        </svg>

        <!-- SCENE HTML SLOT
             Assembler injects template + scene elements here.
             Marker must stay on its own line exactly as shown.
        -->
        <!-- __SCENE_HTML_START__ -->
        <!-- __SCENE_HTML_END__ -->

      </div>
    </div>

    <!-- Completion Overlay (inside scene-area) -->
    <div id="completion-overlay">
      <div class="completion-card">
        <span class="completion-emoji" id="completion-emoji">✅</span>
        <div class="completion-title"   id="completion-title">Complete!</div>
        <div class="completion-subtitle" id="completion-subtitle">
          Algorithm finished successfully.
        </div>
        <div class="completion-stats" id="completion-stats"></div>
        <button class="completion-close-btn" id="completion-close-btn">
          Watch Again
        </button>
      </div>
    </div>

  </div><!-- /scene-area -->

  <!-- CAPTION BAR -->
  <div id="caption-bar">
    <div id="caption-text"></div>
    <div id="step-indicator"></div>
  </div>

  <!-- CONTROLS BAR -->
  <div id="controls-bar">
    ${controlsHTML}
  </div>

  <!-- SIDEBAR PANEL -->
  <div id="sidebar-panel">
    <div class="sidebar-header">Variables</div>
    <div class="sidebar-content" id="sidebar-content">
      <!-- StatsEngine.updateVariables() populates this -->
    </div>
  </div>

</div><!-- /app -->

<!-- ═══════════════════════════════════════════
     CINEMATIC OVERLAYS
═══════════════════════════════════════════ -->
<div id="film-grain"></div>
<div id="vignette"></div>
<div id="scanlines"></div>

<!-- Toast container -->
<div id="toast-container"></div>

<!-- ═══════════════════════════════════════════
     CORE SCRIPTS — Fixed, always present
     Order matters:
     1. Animation utilities  (no deps)
     2. Caption engine       (uses animation utils)
     3. Stats engine         (uses CaptionEngine)
     4. Controls engine      (uses Stats + Caption)
     5. Playback engine      (uses all above)
     6. Scene script         (uses all above)
═══════════════════════════════════════════ -->

<!-- 1. Animation Utilities -->
<script>
${animations}
</script>

<!-- 2. Caption Engine -->
<script>
${captionEng}
</script>

<!-- 3. Stats Engine -->
<script>
${statsEng}
</script>

<!-- 4. Controls Engine -->
<script>
${controlsEng}
</script>

<!-- 5. Playback / RenderStep Engine -->
<script>
${playbackEng}
</script>

<!-- 6. SCENE SCRIPT SLOT
     Assembler injects algorithm-specific JS here.
     This script must define:
       - window.STEPS = [...]
       - renderScene(step, index)
       - Call initVisualization({...}) at end
     Marker must stay on its own line exactly as shown.
-->
<!-- __SCENE_SCRIPT_START__ -->
<!-- __SCENE_SCRIPT_END__ -->

</body>
</html>`;
}