// lib/visualizer/templates/recursion.ts

import { AnalysisResult } from "@/types";

/**
 * Recursion / Call Stack Template.
 * Generates HTML structure for recursion visualizations.
 *
 * Algorithms using this template:
 *  - Factorial / Fibonacci (simple recursion)
 *  - Merge Sort (divide + conquer)
 *  - Quick Sort (partition recursion)
 *  - Tower of Hanoi
 *  - Backtracking (N-Queens, Sudoku, Permutations)
 *  - Binary Search (recursive)
 *  - Power function
 *
 * Structure:
 *  <div id="recursion-container">
 *
 *    <!-- Left: Call Stack panel -->
 *    <div id="call-stack-panel">
 *      <div class="call-frame" id="frame-0">fn(n)</div>
 *    </div>
 *
 *    <!-- Center: Main scene (algorithm specific) -->
 *    <div id="recursion-scene">
 *      <!-- divide/conquer tree OR hanoi pegs OR grid -->
 *    </div>
 *
 *    <!-- Right: Return values panel -->
 *    <div id="return-panel">
 *      <div class="return-item" id="ret-0">return 1</div>
 *    </div>
 *
 *  </div>
 */
export function getRecursionTemplate(analysis: AnalysisResult): string {

  // ── Detect recursion sub-type ─────────────────────
  const config = detectRecursionType(analysis);

  // ── Generate center scene based on type ───────────
  const centerScene = generateCenterScene(config, analysis);

  return `
<!-- ─────────────────────────────────────────────────────────────
     RECURSION / CALL STACK TEMPLATE
     Type: ${config.type} | Max Depth: ${config.maxDepth}
──────────────────────────────────────────────────────────────────── -->
<div id="recursion-container" class="recursion-layout">

  <!-- ── LEFT: Call Stack Panel ──────────────────── -->
  <div id="call-stack-panel" class="call-stack-panel">

    <div class="call-stack-header">
      <span class="call-stack-title">Call Stack</span>
      <span id="stack-depth-badge" class="stack-depth-badge">depth: 0</span>
    </div>

    <!-- Frames rendered here by renderScene() -->
    <div id="call-stack-frames" class="call-stack-frames">
      <div id="call-stack-empty" class="sq-empty-state">
        No active calls
      </div>
    </div>

    <!-- Stack overflow warning -->
    <div id="stack-overflow-warning" class="stack-overflow-warning hidden">
      ⚠ Stack limit reached
    </div>

  </div>

  <!-- ── CENTER: Algorithm Scene ─────────────────── -->
  <div id="recursion-scene" class="recursion-scene">

    <!-- SVG layer for tree edges / connections -->
    <svg
      id="recursion-svg"
      xmlns="http://www.w3.org/2000/svg"
      style="position:absolute;inset:0;width:100%;height:100%;
             pointer-events:none;overflow:visible;z-index:2;"
    >
      <defs>
        <marker
          id="rec-arrow"
          viewBox="0 0 10 10"
          refX="9" refY="5"
          markerWidth="5" markerHeight="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-purple)"/>
        </marker>
        <filter id="rec-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>

    <!-- Center scene content -->
    ${centerScene}

  </div>

  <!-- ── RIGHT: Return Values Panel ──────────────── -->
  <div id="return-panel" class="return-panel">

    <div class="return-panel-header">
      <span class="return-panel-title">Returns</span>
    </div>

    <!-- Return values rendered here -->
    <div id="return-items" class="return-items">
      <div id="return-empty" class="sq-empty-state">
        No returns yet
      </div>
    </div>

    <!-- Final result -->
    <div id="final-result-box" class="final-result-box hidden">
      <div class="final-result-label">Final Result</div>
      <div id="final-result-value" class="final-result-value">—</div>
    </div>

  </div>

</div>

<!-- ── DEPTH VISUALIZER (horizontal bar) ──────────── -->
<div id="depth-visualizer" class="depth-visualizer">
  ${Array.from({ length: config.maxDepth }, (_, i) => `
  <div
    class="depth-level-indicator"
    id="depth-ind-${i}"
    data-depth="${i}"
    title="Depth ${i}"
  >
    <span class="depth-level-num">${i}</span>
  </div>`).join('\n  ')}
</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// CENTER SCENE GENERATORS
// ═══════════════════════════════════════════════════

function generateCenterScene(
  config:   RecursionConfig,
  analysis: AnalysisResult
): string {

  switch (config.type) {

    // ── Merge Sort: split array levels ────────────
    case 'mergesort':
      return generateMergeSortScene(config, analysis);

    // ── Tower of Hanoi: 3 pegs ────────────────────
    case 'hanoi':
      return generateHanoiScene(config);

    // ── Backtracking: grid/board ──────────────────
    case 'backtracking':
      return generateBacktrackingScene(config, analysis);

    // ── Simple recursion: tree diagram ────────────
    case 'simple':
    default:
      return generateRecursionTreeScene(config, analysis);
  }
}

// ── Merge Sort Scene ──────────────────────────────
function generateMergeSortScene(
  config:   RecursionConfig,
  analysis: AnalysisResult
): string {
  // Extract values
  const numMatch = (analysis.inputExample || '').match(/(-?\d+)/g);
  const values   = numMatch
    ? numMatch.slice(0, 8).map(Number)
    : [38, 27, 43, 3, 9, 82, 10];

  return `
  <!-- Merge Sort: Array levels -->
  <div id="mergesort-scene" class="mergesort-scene">

    <!-- Level 0: Full array -->
    <div class="ms-level" id="ms-level-0" data-level="0">
      <div class="ms-array" id="ms-array-0">
        ${values.map((v, i) =>
          `<div class="ms-cell" id="ms-cell-0-${i}" data-value="${v}">${v}</div>`
        ).join('')}
      </div>
    </div>

    <!-- Levels 1-3: split arrays (populated by renderScene) -->
    <div class="ms-level" id="ms-level-1" data-level="1">
      <div class="ms-subarray-group" id="ms-group-1"></div>
    </div>

    <div class="ms-level" id="ms-level-2" data-level="2">
      <div class="ms-subarray-group" id="ms-group-2"></div>
    </div>

    <div class="ms-level" id="ms-level-3" data-level="3">
      <div class="ms-subarray-group" id="ms-group-3"></div>
    </div>

    <!-- Merge arrows layer handled by SVG -->

    <!-- Result row -->
    <div class="ms-level ms-result-level" id="ms-level-result">
      <div class="ms-array ms-result-array" id="ms-result-array">
        ${values.map((_, i) =>
          `<div class="ms-cell ms-cell-result" id="ms-result-${i}" data-value="">-</div>`
        ).join('')}
      </div>
    </div>

  </div>`;
}

// ── Tower of Hanoi Scene ──────────────────────────
function generateHanoiScene(config: RecursionConfig): string {
  const diskCount = Math.min(config.diskCount, 6);

  // Generate disks for peg A (initial state)
  const disks = Array.from({ length: diskCount }, (_, i) => {
    const diskNum  = diskCount - i;         // largest at bottom
    const widthPct = 30 + diskNum * 10;     // width scales with size
    const color    = `hsl(${(diskNum / diskCount) * 240}, 70%, 60%)`;

    return `
      <div
        class="hanoi-disk"
        id="disk-${diskNum}"
        data-size="${diskNum}"
        style="width:${widthPct}%;background:${color};border-color:${color};"
      >
        ${diskNum}
      </div>`;
  }).join('\n');

  return `
  <!-- Tower of Hanoi: 3 pegs -->
  <div id="hanoi-scene" class="hanoi-scene">

    <!-- Peg A (Source) -->
    <div class="hanoi-peg-wrapper" id="peg-wrapper-A">
      <div class="hanoi-disks" id="peg-A">
        ${disks}
      </div>
      <div class="hanoi-rod" id="rod-A"></div>
      <div class="hanoi-base"></div>
      <div class="hanoi-peg-label">A<br/><span>Source</span></div>
    </div>

    <!-- Peg B (Auxiliary) -->
    <div class="hanoi-peg-wrapper" id="peg-wrapper-B">
      <div class="hanoi-disks" id="peg-B"></div>
      <div class="hanoi-rod" id="rod-B"></div>
      <div class="hanoi-base"></div>
      <div class="hanoi-peg-label">B<br/><span>Auxiliary</span></div>
    </div>

    <!-- Peg C (Target) -->
    <div class="hanoi-peg-wrapper" id="peg-wrapper-C">
      <div class="hanoi-disks" id="peg-C"></div>
      <div class="hanoi-rod" id="rod-C"></div>
      <div class="hanoi-base"></div>
      <div class="hanoi-peg-label">C<br/><span>Target</span></div>
    </div>

    <!-- Move counter -->
    <div id="hanoi-move-display" class="hanoi-move-display">
      Move: <span id="hanoi-move-text">—</span>
    </div>

  </div>`;
}

// ── Backtracking Scene ────────────────────────────
function generateBacktrackingScene(
  config:   RecursionConfig,
  analysis: AnalysisResult
): string {
  const n    = config.gridSize;
  const name = (analysis.algorithmName || '').toLowerCase();

  // Determine cell content type
  const isNQueens     = name.includes('queen');
  const isSudoku      = name.includes('sudoku');
  const cellSymbol    = isNQueens ? '♛' : isSudoku ? '' : '•';

  // Generate grid
  const gridRows = Array.from({ length: n }, (_, row) =>
    `<div class="bt-row" id="bt-row-${row}">
      ${Array.from({ length: n }, (_, col) =>
        `<div
          class="bt-cell"
          id="bt-cell-${row}-${col}"
          data-row="${row}"
          data-col="${col}"
          data-value=""
        ><span class="bt-cell-content"></span></div>`
      ).join('')}
    </div>`
  ).join('\n    ');

  return `
  <!-- Backtracking: Grid/Board -->
  <div id="backtracking-scene" class="backtracking-scene">

    <div class="bt-grid-wrapper">
      <div id="bt-grid" class="bt-grid bt-grid-${n}x${n}">
        ${gridRows}
      </div>
    </div>

    <!-- Current attempt indicator -->
    <div id="bt-attempt-bar" class="bt-attempt-bar">
      <span class="bt-attempt-label">Trying:</span>
      <span id="bt-attempt-text" class="bt-attempt-text">—</span>
    </div>

    <!-- Solutions found counter -->
    <div id="bt-solutions-bar" class="bt-solutions-bar">
      <span class="bt-solutions-label">Solutions:</span>
      <span id="bt-solutions-count" class="bt-solutions-count">0</span>
    </div>

  </div>`;
}

// ── Simple Recursion Tree Scene ───────────────────
function generateRecursionTreeScene(
  config:   RecursionConfig,
  analysis: AnalysisResult
): string {
  const name = analysis.algorithmName || 'f(n)';

  // Generate initial tree nodes (placeholder)
  // renderScene() will populate these with actual calls
  const maxNodes = Math.pow(2, config.maxDepth + 1) - 1;

  return `
  <!-- Simple Recursion: Tree diagram -->
  <div id="rec-tree-scene" class="rec-tree-scene">

    <!-- Tree nodes rendered dynamically by renderScene() -->
    <div id="rec-tree-nodes" class="rec-tree-nodes">

      <!-- Root call (always present) -->
      <div
        class="rec-node"
        id="rec-node-0"
        data-id="0"
        data-depth="0"
        data-call=""
        style="left:50%;top:8%;transform:translateX(-50%);opacity:0;"
      >
        <div class="rec-node-call" id="rec-call-0">${name}(n)</div>
        <div class="rec-node-return" id="rec-ret-0"></div>
      </div>

    </div>

    <!-- Current call highlight box -->
    <div id="rec-current-box" class="rec-current-box hidden">
      <div class="rec-current-label">Executing:</div>
      <div id="rec-current-call" class="rec-current-call"></div>
    </div>

    <!-- Base case indicator -->
    <div id="rec-base-indicator" class="rec-base-indicator hidden">
      <span>📍 Base case reached</span>
    </div>

  </div>`;
}

// ═══════════════════════════════════════════════════
// RECURSION TYPE DETECTOR
// ═══════════════════════════════════════════════════

interface RecursionConfig {
  type:       'mergesort' | 'hanoi' | 'backtracking' | 'simple';
  maxDepth:   number;
  diskCount:  number;
  gridSize:   number;
  fnName:     string;
}

function detectRecursionType(analysis: AnalysisResult): RecursionConfig {
  const name = (analysis.algorithmName || '').toLowerCase();
  const desc = (analysis.description   || '').toLowerCase();
  const input = analysis.inputExample  || '';

  // ── Type detection ────────────────────────────────
  const isMergeSort =
    name.includes('merge sort') ||
    name.includes('mergesort')  ||
    (name.includes('merge') && name.includes('sort'));

  const isHanoi =
    name.includes('hanoi')  ||
    name.includes('tower')  ||
    desc.includes('hanoi');

  const isBacktracking =
    name.includes('queen')        ||
    name.includes('sudoku')       ||
    name.includes('permutation')  ||
    name.includes('combination')  ||
    name.includes('backtrack')    ||
    name.includes('n-queen')      ||
    desc.includes('backtrack');

  // ── Extract numeric input ─────────────────────────
  const numMatch = input.match(/(-?\d+)/g);
  const n        = numMatch ? Math.min(Number(numMatch[0]), 8) : 4;

  // ── Max depth calculation ─────────────────────────
  let maxDepth = 4;
  if (isMergeSort)    maxDepth = Math.ceil(Math.log2(Math.max(n, 2))) + 1;
  if (isHanoi)        maxDepth = Math.min(n, 6);
  if (isBacktracking) maxDepth = Math.min(n, 5);
  maxDepth = Math.min(maxDepth, 6); // safety cap

  // ── Grid size for backtracking ────────────────────
  let gridSize = 4;
  if (name.includes('8-queen') || name.includes('8 queen')) gridSize = 8;
  else if (name.includes('queen')) {
    const qMatch = name.match(/(\d+)[\s-]?queen/);
    gridSize = qMatch ? Math.min(Number(qMatch[1]), 8) : 4;
  }
  if (name.includes('sudoku')) gridSize = 9;

  // ── Function name ─────────────────────────────────
  const fnName =
    name.includes('factorial')  ? 'fact'  :
    name.includes('fibonacci')  ? 'fib'   :
    name.includes('power')      ? 'pow'   :
    name.includes('merge sort') ? 'merge' :
    name.includes('hanoi')      ? 'hanoi' :
    'f';

  return {
    type:
      isMergeSort    ? 'mergesort'    :
      isHanoi        ? 'hanoi'        :
      isBacktracking ? 'backtracking' :
      'simple',
    maxDepth,
    diskCount:  Math.min(n, 6),
    gridSize,
    fnName,
  };
}