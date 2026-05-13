// lib/visualizer/core/theme.ts

/**
 * Base theme system for all algorithm visualizations.
 * Returns a CSS string that gets injected into the final HTML shell.
 * Includes: CSS variables, dark theme, layout base, utility classes,
 *           film grain, vignette, glow effects, panel/button styles.
 */
export function getBaseTheme(): string {
  return `
    /* ═══════════════════════════════════════════════════
       CSS VARIABLES — Dark Cinematic Theme
    ═══════════════════════════════════════════════════ */
    :root {
      /* Core backgrounds */
      --bg-primary:      #0d1117;
      --bg-secondary:    #161b22;
      --bg-card:         #1c2128;
      --bg-card-hover:   #22272e;
      --bg-overlay:      rgba(13, 17, 23, 0.85);

      /* Borders */
      --border:          rgba(255, 255, 255, 0.08);
      --border-strong:   rgba(255, 255, 255, 0.15);

      /* Text */
      --text-primary:    #e6edf3;
      --text-secondary:  #8b949e;
      --text-muted:      #484f58;
      --text-code:       #79c0ff;

      /* Accent colors */
      --accent:          #63b3ed;
      --accent-purple:   #9f7aea;
      --accent-green:    #68d391;
      --accent-orange:   #f6ad55;
      --accent-red:      #fc8181;
      --accent-yellow:   #f6e05e;
      --accent-pink:     #f687b3;
      --accent-teal:     #4fd1c5;

      /* Glow colors */
      --glow-cyan:       rgba(99, 179, 237, 0.4);
      --glow-purple:     rgba(159, 122, 234, 0.4);
      --glow-green:      rgba(104, 211, 145, 0.4);
      --glow-orange:     rgba(246, 173, 85, 0.4);
      --glow-red:        rgba(252, 129, 129, 0.4);
      --glow-yellow:     rgba(246, 224, 94, 0.4);

      /* Algorithm-specific scene colors (overridden per scene) */
      --scene-primary:   #63b3ed;
      --scene-secondary: #9f7aea;
      --scene-accent:    #68d391;
      --scene-danger:    #fc8181;
      --scene-bg:        #0d1117;

      /* Layout dimensions */
      --stats-bar-height:   56px;
      --caption-height:     64px;
      --controls-height:    60px;
      --sidebar-width:      220px;
      --progress-height:    4px;

      /* Z-index layers */
      --z-bg:            1;
      --z-elements:      5;
      --z-pointers:      15;
      --z-panels:        25;
      --z-overlays:      30;
      --z-modal:         50;
      --z-toast:         100;

      /* Animation timing */
      --transition-fast:   150ms ease;
      --transition-base:   300ms ease;
      --transition-slow:   600ms ease;
      --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
      --transition-cinematic: 800ms cubic-bezier(0.16, 1, 0.3, 1);

      /* Spacing */
      --gap-xs:  4px;
      --gap-sm:  8px;
      --gap-md:  16px;
      --gap-lg:  24px;
      --gap-xl:  32px;

      /* Border radius */
      --radius-sm:  6px;
      --radius-md:  10px;
      --radius-lg:  16px;
      --radius-xl:  24px;
      --radius-full: 9999px;
    }

    /* ═══════════════════════════════════════════════════
       RESET + BASE
    ═══════════════════════════════════════════════════ */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-primary);
      background: var(--scene-bg, var(--bg-primary));
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ═══════════════════════════════════════════════════
       APP LAYOUT — Fixed regions
    ═══════════════════════════════════════════════════ */
    #app {
      width: 100vw;
      height: 100vh;
      display: grid;
      grid-template-rows:
        var(--stats-bar-height)
        1fr
        var(--caption-height)
        var(--controls-height);
      grid-template-columns: 1fr var(--sidebar-width);
      grid-template-areas:
        "stats   stats"
        "scene   sidebar"
        "caption sidebar"
        "controls controls";
      overflow: hidden;
      position: relative;
    }

    #stats-bar     { grid-area: stats; }
    #scene-area    { grid-area: scene; }
    #caption-bar   { grid-area: caption; }
    #controls-bar  { grid-area: controls; }
    #sidebar-panel { grid-area: sidebar; }

    /* ═══════════════════════════════════════════════════
       STATS BAR
    ═══════════════════════════════════════════════════ */
    #stats-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--gap-lg);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      z-index: var(--z-panels);
      gap: var(--gap-md);
    }

    .stats-left {
      display: flex;
      align-items: center;
      gap: var(--gap-lg);
    }

    .stats-right {
      display: flex;
      align-items: center;
      gap: var(--gap-lg);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1px;
    }

    .stat-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
    }

    .stat-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
      transition: color var(--transition-base);
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
    }

    .stat-value.flash {
      animation: statFlash 0.4s ease;
    }

    @keyframes statFlash {
      0%   { color: var(--text-primary); }
      40%  { color: var(--accent); transform: scale(1.15); }
      100% { color: var(--text-primary); transform: scale(1); }
    }

    .algo-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      background: rgba(99, 179, 237, 0.12);
      border: 1px solid rgba(99, 179, 237, 0.25);
      color: var(--accent);
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    .complexity-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: rgba(159, 122, 234, 0.12);
      border: 1px solid rgba(159, 122, 234, 0.25);
      color: var(--accent-purple);
      font-family: 'JetBrains Mono', monospace;
    }

    /* ═══════════════════════════════════════════════════
       SCENE AREA
    ═══════════════════════════════════════════════════ */
    #scene-area {
      position: relative;
      overflow: hidden;
      background: var(--scene-bg, var(--bg-primary));
      z-index: var(--z-bg);
    }

    #scene-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    /* Scene-specific content wrapper */
    #scene-content {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ═══════════════════════════════════════════════════
       CAPTION BAR
    ═══════════════════════════════════════════════════ */
    #caption-bar {
      display: flex;
      align-items: center;
      padding: 0 var(--gap-lg);
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      z-index: var(--z-panels);
      overflow: hidden;
    }

    #caption-text {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      line-height: 1.5;
      transition: opacity var(--transition-fast);
    }

    #caption-text .word {
      display: inline-block;
      opacity: 0;
      transform: translateY(4px);
      animation: wordReveal 0.25s ease forwards;
    }

    #caption-text .word.bold {
      color: var(--accent);
      font-weight: 700;
    }

    #caption-text .word.important {
      color: var(--accent-yellow);
      font-weight: 700;
    }

    @keyframes wordReveal {
      to { opacity: 1; transform: translateY(0); }
    }

    /* Step indicator in caption */
    #step-indicator {
      margin-left: auto;
      font-size: 11px;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      white-space: nowrap;
      padding-left: var(--gap-md);
      flex-shrink: 0;
    }

    /* ═══════════════════════════════════════════════════
       CONTROLS BAR
    ═══════════════════════════════════════════════════ */
    #controls-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--gap-sm);
      padding: 0 var(--gap-lg);
      background: var(--bg-secondary);
      border-top: 1px solid var(--border);
      z-index: var(--z-panels);
      position: relative;
    }

    /* Progress bar lives at top of controls */
    #progress-bar-track {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--progress-height);
      background: var(--border);
      overflow: hidden;
    }

    #progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--accent-purple));
      transition: width var(--transition-base);
      border-radius: 0 var(--radius-full) var(--radius-full) 0;
      box-shadow: 0 0 8px var(--glow-cyan);
    }

    /* Control buttons */
    .ctrl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 14px;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast),
        color var(--transition-fast),
        transform var(--transition-fast),
        box-shadow var(--transition-fast);
      user-select: none;
      -webkit-user-select: none;
    }

    .ctrl-btn:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-strong);
      color: var(--text-primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    .ctrl-btn:active {
      transform: translateY(0) scale(0.95);
    }

    .ctrl-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none;
    }

    /* Play/Pause is larger */
    .ctrl-btn.play-btn {
      width: 44px;
      height: 44px;
      font-size: 18px;
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      border: none;
      color: #0d1117;
      box-shadow: 0 4px 16px var(--glow-cyan);
    }

    .ctrl-btn.play-btn:hover {
      box-shadow: 0 6px 24px var(--glow-cyan);
      transform: translateY(-2px) scale(1.05);
    }

    /* Speed button */
    .ctrl-btn.speed-btn {
      width: auto;
      padding: 0 var(--gap-sm);
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent-orange);
      border-color: rgba(246, 173, 85, 0.25);
      letter-spacing: 0.02em;
    }

    .ctrl-btn.speed-btn:hover {
      background: rgba(246, 173, 85, 0.08);
      border-color: rgba(246, 173, 85, 0.4);
    }

    /* Controls separator */
    .ctrl-separator {
      width: 1px;
      height: 24px;
      background: var(--border);
      margin: 0 var(--gap-xs);
    }

    /* ═══════════════════════════════════════════════════
       SIDEBAR PANEL
    ═══════════════════════════════════════════════════ */
    #sidebar-panel {
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      z-index: var(--z-panels);
      overflow: hidden;
    }

    .sidebar-header {
      padding: var(--gap-sm) var(--gap-md);
      border-bottom: 1px solid var(--border);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--gap-sm);
      display: flex;
      flex-direction: column;
      gap: var(--gap-xs);

      /* Custom scrollbar */
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
    }

    .sidebar-content::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-content::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: var(--radius-full);
    }

    /* Sidebar items */
    .sidebar-item {
      padding: var(--gap-sm);
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .sidebar-item:hover {
      background: var(--bg-card);
      border-color: var(--border);
    }

    .sidebar-item.active {
      background: rgba(99, 179, 237, 0.08);
      border-color: rgba(99, 179, 237, 0.2);
    }

    .sidebar-item-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .sidebar-item-value {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'JetBrains Mono', monospace;
      word-break: break-all;
    }

    /* Variable card in sidebar */
    .var-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 8px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      gap: var(--gap-sm);
    }

    .var-name {
      font-size: 11px;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .var-value {
      font-size: 11px;
      color: var(--text-primary);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      background: var(--bg-primary);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast), color var(--transition-fast);
    }

    .var-value.changed {
      background: rgba(99, 179, 237, 0.15);
      color: var(--accent);
      animation: varChanged 0.5s ease;
    }

    @keyframes varChanged {
      0%   { background: rgba(99, 179, 237, 0.4); transform: scale(1.05); }
      100% { background: rgba(99, 179, 237, 0.15); transform: scale(1); }
    }

    /* ═══════════════════════════════════════════════════
       CINEMATIC OVERLAYS
    ═══════════════════════════════════════════════════ */

    /* Film grain */
    #film-grain {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: var(--z-overlays);
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
      animation: grainShift 0.5s steps(1) infinite;
    }

    @keyframes grainShift {
      0%  { transform: translate(0, 0); }
      25% { transform: translate(-2px, 1px); }
      50% { transform: translate(1px, -2px); }
      75% { transform: translate(2px, 1px); }
      100%{ transform: translate(-1px, 2px); }
    }

    /* Vignette */
    #vignette {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: calc(var(--z-overlays) - 1);
      background: radial-gradient(
        ellipse at center,
        transparent 50%,
        rgba(0, 0, 0, 0.35) 100%
      );
    }

    /* Scanlines (subtle) */
    #scanlines {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: calc(var(--z-overlays) - 2);
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.03) 2px,
        rgba(0, 0, 0, 0.03) 4px
      );
    }

    /* ═══════════════════════════════════════════════════
       COMPLETION OVERLAY
    ═══════════════════════════════════════════════════ */
    #completion-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(13, 17, 23, 0.75);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-slow);
    }

    #completion-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .completion-card {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-xl);
      padding: var(--gap-xl) var(--gap-xl);
      text-align: center;
      max-width: 320px;
      width: 90%;
      box-shadow:
        0 24px 64px rgba(0,0,0,0.5),
        0 0 0 1px rgba(255,255,255,0.05) inset;
      transform: translateY(20px) scale(0.95);
      transition: transform var(--transition-spring);
    }

    #completion-overlay.visible .completion-card {
      transform: translateY(0) scale(1);
    }

    .completion-emoji {
      font-size: 48px;
      margin-bottom: var(--gap-md);
      display: block;
      animation: emojiPop 0.5s var(--transition-spring);
    }

    @keyframes emojiPop {
      0%   { transform: scale(0) rotate(-10deg); }
      60%  { transform: scale(1.2) rotate(5deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    .completion-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: var(--gap-sm);
      letter-spacing: 0.02em;
    }

    .completion-subtitle {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: var(--gap-lg);
      line-height: 1.6;
    }

    .completion-stats {
      display: flex;
      justify-content: center;
      gap: var(--gap-lg);
      padding: var(--gap-md);
      background: var(--bg-primary);
      border-radius: var(--radius-md);
      margin-bottom: var(--gap-md);
    }

    .completion-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .completion-stat-value {
      font-size: 20px;
      font-weight: 800;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .completion-stat-label {
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    .completion-close-btn {
      display: block;
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, var(--accent), var(--accent-purple));
      border: none;
      border-radius: var(--radius-md);
      color: #0d1117;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      letter-spacing: 0.04em;
      transition: all var(--transition-fast);
    }

    .completion-close-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 8px 24px var(--glow-cyan);
    }

    /* ═══════════════════════════════════════════════════
       UTILITY CLASSES
    ═══════════════════════════════════════════════════ */

    /* Glow effects */
    .glow-cyan    { box-shadow: 0 0 12px var(--glow-cyan); }
    .glow-purple  { box-shadow: 0 0 12px var(--glow-purple); }
    .glow-green   { box-shadow: 0 0 12px var(--glow-green); }
    .glow-orange  { box-shadow: 0 0 12px var(--glow-orange); }
    .glow-red     { box-shadow: 0 0 12px var(--glow-red); }
    .glow-yellow  { box-shadow: 0 0 12px var(--glow-yellow); }

    /* Text glow */
    .text-glow-cyan   { text-shadow: 0 0 8px var(--glow-cyan); }
    .text-glow-purple { text-shadow: 0 0 8px var(--glow-purple); }
    .text-glow-green  { text-shadow: 0 0 8px var(--glow-green); }

    /* Quick animations */
    .pulse {
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Visibility helpers */
    .hidden   { display: none !important; }
    .invisible{ opacity: 0; pointer-events: none; }
    .visible  { opacity: 1; pointer-events: auto; }

    /* Flex helpers */
    .flex         { display: flex; }
    .flex-col     { display: flex; flex-direction: column; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .gap-sm       { gap: var(--gap-sm); }
    .gap-md       { gap: var(--gap-md); }

    /* ═══════════════════════════════════════════════════
       SCENE ELEMENT BASE STYLES
       (Templates extend these)
    ═══════════════════════════════════════════════════ */

    /* Generic element */
    .scene-element {
      position: absolute;
      transition:
        transform var(--transition-base),
        opacity var(--transition-base),
        box-shadow var(--transition-base),
        background var(--transition-base),
        border-color var(--transition-base);
      will-change: transform, opacity;
    }

    /* Active highlight state */
    .el-active {
      border-color: var(--accent) !important;
      box-shadow: 0 0 16px var(--glow-cyan) !important;
    }

    /* Sorted/done state */
    .el-sorted {
      border-color: var(--accent-green) !important;
      box-shadow: 0 0 12px var(--glow-green) !important;
    }

    /* Error/danger state */
    .el-error {
      border-color: var(--accent-red) !important;
      box-shadow: 0 0 12px var(--glow-red) !important;
    }

    /* Visited state */
    .el-visited {
      opacity: 0.6;
      border-color: var(--text-muted) !important;
    }

    /* Current state */
    .el-current {
      border-color: var(--accent-yellow) !important;
      box-shadow: 0 0 16px var(--glow-yellow) !important;
    }

    /* ═══════════════════════════════════════════════════
       CHARACTER BASE STYLES
    ═══════════════════════════════════════════════════ */
    .character {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: var(--z-pointers);
      transition: transform var(--transition-spring);
      will-change: transform;
      cursor: default;
      user-select: none;
    }

    .character-body {
      font-size: 32px;
      line-height: 1;
      transition: transform var(--transition-spring);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
    }

    .character.idle .character-body {
      animation: characterBreathe 3s ease-in-out infinite;
    }

    @keyframes characterBreathe {
      0%, 100% { transform: translateY(0) scale(1); }
      50%       { transform: translateY(-3px) scale(1.02); }
    }

    .character.jumping .character-body {
      animation: none;
    }

    .character.celebrating .character-body {
      animation: characterCelebrateAnim 0.6s ease infinite alternate;
    }

    @keyframes characterCelebrateAnim {
      0%   { transform: translateY(0) rotate(-5deg) scale(1); }
      100% { transform: translateY(-8px) rotate(5deg) scale(1.1); }
    }

    /* ═══════════════════════════════════════════════════
       POINTER / ARROW BASE STYLES
    ═══════════════════════════════════════════════════ */
    .pointer-marker {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      z-index: var(--z-pointers);
      transition: transform var(--transition-spring);
      will-change: transform;
    }

    .pointer-arrow {
      font-size: 14px;
      line-height: 1;
      filter: drop-shadow(0 0 4px currentColor);
    }

    .pointer-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      padding: 1px 5px;
      border-radius: var(--radius-sm);
      background: rgba(0,0,0,0.4);
      border: 1px solid currentColor;
      white-space: nowrap;
    }

    /* ═══════════════════════════════════════════════════
       SVG CANVAS (for graph/tree edges)
    ═══════════════════════════════════════════════════ */
    #svg-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: var(--z-elements);
      overflow: visible;
    }

    /* ═══════════════════════════════════════════════════
       TOAST NOTIFICATIONS
    ═══════════════════════════════════════════════════ */
    #toast-container {
      position: fixed;
      top: calc(var(--stats-bar-height) + var(--gap-md));
      right: var(--gap-md);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--gap-sm);
      pointer-events: none;
    }

    .toast {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-strong);
      background: var(--bg-card);
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: toastIn 0.3s var(--transition-spring) forwards;
      max-width: 240px;
    }

    .toast.success { border-color: rgba(104, 211, 145, 0.4); color: var(--accent-green); }
    .toast.error   { border-color: rgba(252, 129, 129, 0.4); color: var(--accent-red); }
    .toast.info    { border-color: rgba(99, 179, 237, 0.4);  color: var(--accent); }

    @keyframes toastIn {
      0%   { opacity: 0; transform: translateX(20px); }
      100% { opacity: 1; transform: translateX(0); }
    }

    /* ═══════════════════════════════════════════════════
       RESPONSIVE SAFETY
    ═══════════════════════════════════════════════════ */
    @media (max-width: 640px) {
      :root {
        --sidebar-width: 0px;
        --stats-bar-height: 48px;
        --caption-height: 56px;
        --controls-height: 56px;
      }

      #sidebar-panel { display: none; }
      #app { grid-template-columns: 1fr; }

      .stats-right { display: none; }
    }

    @media (max-width: 400px) {
      :root {
        font-size: 12px;
      }
      .ctrl-btn { width: 32px; height: 32px; font-size: 12px; }
      .ctrl-btn.play-btn { width: 40px; height: 40px; }
    }
  `.trim();
}