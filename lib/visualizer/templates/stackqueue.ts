// lib/visualizer/templates/stackqueue.ts

import { AnalysisResult } from "@/types";

/**
 * Stack / Queue Template.
 * Generates HTML structure for stack and queue visualizations.
 *
 * Algorithms using this template:
 *  Stack:
 *   - Stack operations (push, pop, peek)
 *   - Expression evaluation (infix, postfix)
 *   - Balanced parentheses
 *   - Next Greater Element
 *   - Monotonic Stack
 *
 *  Queue:
 *   - Queue operations (enqueue, dequeue)
 *   - Circular Queue
 *   - Priority Queue
 *   - BFS (uses queue panel)
 *
 * Structure (Stack):
 *  <div id="stack-container">
 *    <div id="stack-body">
 *      <div class="stack-frame" id="frame-0">...</div>
 *    </div>
 *    <div id="stack-base"></div>
 *  </div>
 *
 * Structure (Queue):
 *  <div id="queue-container">
 *    <div id="queue-body">
 *      <div class="queue-item" id="qitem-0">...</div>
 *    </div>
 *  </div>
 */
export function getStackQueueTemplate(analysis: AnalysisResult): string {

  // ── Detect stack vs queue ─────────────────────────
  const config = detectStackOrQueue(analysis);

  if (config.type === 'stack') {
    return generateStackTemplate(config);
  } else if (config.type === 'both') {
    return generateBothTemplate(config);
  } else {
    return generateQueueTemplate(config);
  }
}

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface StackQueueConfig {
  type:         'stack' | 'queue' | 'both';
  initialItems: (string | number)[];
  maxSize:      number;
  inputDisplay: string;
  title:        string;
  isCircular:   boolean;
  isPriority:   boolean;
}

// ═══════════════════════════════════════════════════
// STACK TEMPLATE
// ═══════════════════════════════════════════════════

function generateStackTemplate(config: StackQueueConfig): string {

  // Pre-render initial items (bottom to top)
  const initialFrames = config.initialItems.map((val, i) => `
    <div
      class="stack-frame"
      id="frame-${i}"
      data-value="${val}"
      data-index="${i}"
      style="opacity:0;"
    >
      <div class="stack-frame-value">${val}</div>
      <div class="stack-frame-index">index: ${i}</div>
    </div>`
  ).join('\n');

  return `
<!-- ─────────────────────────────────────────────────────────────
     STACK TEMPLATE
     Max Size: ${config.maxSize}
──────────────────────────────────────────────────────────────────── -->
<div id="stack-scene" class="stack-scene">

  <!-- Input display (expression / sequence) -->
  ${config.inputDisplay ? `
  <div id="input-display" class="sq-input-display">
    <div class="sq-input-label">Input:</div>
    <div class="sq-input-content" id="input-content">${config.inputDisplay}</div>
    <div class="sq-input-pointer" id="input-pointer">▲</div>
  </div>` : ''}

  <!-- Stack structure -->
  <div id="stack-wrapper" class="stack-wrapper">

    <!-- TOP label -->
    <div id="stack-top-label" class="stack-top-label">
      <span class="stack-marker-arrow">◀</span>
      <span class="stack-marker-text">TOP</span>
    </div>

    <!-- Stack body (frames stack up here) -->
    <div id="stack-body" class="stack-body">
      <!-- Frames injected by renderScene() -->
      ${initialFrames}

      <!-- Empty state -->
      <div id="stack-empty" class="sq-empty-state">
        Stack is empty
      </div>
    </div>

    <!-- Stack base -->
    <div id="stack-base" class="stack-base">
      <div class="stack-base-line"></div>
      <div class="stack-base-label">BOTTOM</div>
    </div>

  </div>

  <!-- Operation log -->
  <div id="sq-operation-log" class="sq-operation-log">
    <div class="sq-log-title">Operations</div>
    <div id="sq-log-items" class="sq-log-items"></div>
  </div>

  <!-- Result display -->
  <div id="sq-result" class="sq-result hidden">
    <span class="sq-result-label">Result:</span>
    <span id="sq-result-value" class="sq-result-value"></span>
  </div>

  <!-- Current operation indicator -->
  <div id="sq-operation-badge" class="sq-operation-badge hidden">
    <span id="sq-operation-text"></span>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// QUEUE TEMPLATE
// ═══════════════════════════════════════════════════

function generateQueueTemplate(config: StackQueueConfig): string {

  const isCircular = config.isCircular;

  // Pre-render initial items
  const initialItems = config.initialItems.map((val, i) => `
    <div
      class="queue-item"
      id="qitem-${i}"
      data-value="${val}"
      data-index="${i}"
      style="opacity:0;"
    >
      <div class="queue-item-value">${val}</div>
      <div class="queue-item-index">${i}</div>
    </div>`
  ).join('\n');

  return `
<!-- ─────────────────────────────────────────────────────────────
     QUEUE TEMPLATE
     Type: ${isCircular ? 'Circular' : 'Linear'} | Max: ${config.maxSize}
──────────────────────────────────────────────────────────────────── -->
<div id="queue-scene" class="queue-scene">

  <!-- Input display -->
  ${config.inputDisplay ? `
  <div id="input-display" class="sq-input-display">
    <div class="sq-input-label">Input:</div>
    <div class="sq-input-content" id="input-content">${config.inputDisplay}</div>
  </div>` : ''}

  <!-- Queue structure -->
  <div id="queue-wrapper" class="queue-wrapper">

    <!-- FRONT label -->
    <div id="queue-front-label" class="queue-end-label queue-front">
      <div class="queue-end-arrow">▶</div>
      <div class="queue-end-text">FRONT<br/><span class="queue-end-subtext">dequeue</span></div>
    </div>

    <!-- Queue body -->
    <div id="queue-body" class="queue-body ${isCircular ? 'circular' : ''}">

      <!-- Empty state -->
      <div id="queue-empty" class="sq-empty-state">
        Queue is empty
      </div>

      <!-- Items rendered here -->
      ${initialItems}

    </div>

    <!-- REAR label -->
    <div id="queue-rear-label" class="queue-end-label queue-rear">
      <div class="queue-end-text">REAR<br/><span class="queue-end-subtext">enqueue</span></div>
      <div class="queue-end-arrow">◀</div>
    </div>

  </div>

  <!-- Circular queue visual (shown only if circular) -->
  ${isCircular ? `
  <div id="circular-queue-display" class="circular-queue-display">
    <svg id="circular-svg" viewBox="0 0 200 200" style="width:200px;height:200px;">
      <circle cx="100" cy="100" r="80" class="circular-track"/>
      ${Array.from({ length: config.maxSize }, (_, i) => {
        const angle = (i / config.maxSize) * Math.PI * 2 - Math.PI / 2;
        const x     = 100 + 80 * Math.cos(angle);
        const y     = 100 + 80 * Math.sin(angle);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"
          class="circular-slot" id="cslot-${i}"/>
          <text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}"
          class="circular-slot-text" id="cslot-text-${i}" text-anchor="middle">-</text>`;
      }).join('\n      ')}
    </svg>
  </div>` : ''}

  <!-- Queue size indicator -->
  <div id="queue-size-display" class="sq-size-display">
    <span class="sq-size-label">Size:</span>
    <span id="queue-size-value" class="sq-size-value">0</span>
    <span class="sq-size-sep">/</span>
    <span class="sq-size-max">${config.maxSize}</span>
  </div>

  <!-- Operation log -->
  <div id="sq-operation-log" class="sq-operation-log">
    <div class="sq-log-title">Operations</div>
    <div id="sq-log-items" class="sq-log-items"></div>
  </div>

  <!-- Result display -->
  <div id="sq-result" class="sq-result hidden">
    <span class="sq-result-label">Result:</span>
    <span id="sq-result-value" class="sq-result-value"></span>
  </div>

  <!-- Operation badge -->
  <div id="sq-operation-badge" class="sq-operation-badge hidden">
    <span id="sq-operation-text"></span>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// BOTH (Stack + Queue side by side)
// Used for: algorithms that use both simultaneously
// e.g., expression evaluation, some graph algorithms
// ═══════════════════════════════════════════════════

function generateBothTemplate(config: StackQueueConfig): string {
  return `
<!-- ─────────────────────────────────────────────────────────────
     STACK + QUEUE TEMPLATE (Both)
──────────────────────────────────────────────────────────────────── -->
<div id="sq-both-scene" class="sq-both-scene">

  <!-- Input display -->
  <div id="input-display" class="sq-input-display sq-input-centered">
    <div class="sq-input-label">Input:</div>
    <div class="sq-input-content" id="input-content">${config.inputDisplay}</div>
    <div id="input-pointer" class="sq-input-pointer-both">▼</div>
  </div>

  <!-- Side by side layout -->
  <div class="sq-both-layout">

    <!-- Stack (left) -->
    <div class="sq-both-panel">
      <div class="sq-panel-title">Stack</div>
      <div id="stack-top-label" class="stack-top-label">
        <span class="stack-marker-arrow">◀</span>
        <span class="stack-marker-text">TOP</span>
      </div>
      <div id="stack-body" class="stack-body stack-body-sm">
        <div id="stack-empty" class="sq-empty-state">Empty</div>
      </div>
      <div id="stack-base" class="stack-base">
        <div class="stack-base-line"></div>
      </div>
    </div>

    <!-- Output / Result (center) -->
    <div class="sq-both-panel sq-center-panel">
      <div class="sq-panel-title">Output</div>
      <div id="sq-output-area" class="sq-output-area">
        <div id="sq-output-items" class="sq-output-items"></div>
      </div>
      <div id="sq-result" class="sq-result">
        <span class="sq-result-label">Result:</span>
        <span id="sq-result-value" class="sq-result-value">—</span>
      </div>
    </div>

    <!-- Queue (right) -->
    <div class="sq-both-panel">
      <div class="sq-panel-title">Queue</div>
      <div id="queue-body" class="queue-body queue-body-vertical">
        <div id="queue-empty" class="sq-empty-state">Empty</div>
      </div>
      <div class="queue-end-label queue-front" style="margin-top:4px;">
        <span class="queue-end-text" style="font-size:9px;">FRONT</span>
      </div>
    </div>

  </div>

  <!-- Operation badge -->
  <div id="sq-operation-badge" class="sq-operation-badge hidden">
    <span id="sq-operation-text"></span>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// DETECTOR — Stack vs Queue vs Both
// ═══════════════════════════════════════════════════

function detectStackOrQueue(analysis: AnalysisResult): StackQueueConfig {
  const name     = (analysis.algorithmName || '').toLowerCase();
  const desc     = (analysis.description   || '').toLowerCase();
  const category = (analysis.category      || '').toLowerCase();
  const input    = analysis.inputExample   || '';

  // ── Detect type ───────────────────────────────────
  const isStack =
    name.includes('stack')          ||
    name.includes('postfix')        ||
    name.includes('infix')          ||
    name.includes('parenthes')      ||
    name.includes('bracket')        ||
    name.includes('monotonic')      ||
    name.includes('next greater')   ||
    name.includes('largest rect')   ||
    desc.includes('stack')          ||
    category.includes('stack');

  const isQueue =
    name.includes('queue')          ||
    name.includes('circular')       ||
    name.includes('priority')       ||
    name.includes('deque')          ||
    desc.includes('queue')          ||
    category.includes('queue');

  const isBoth =
    name.includes('expression')     ||
    (isStack && isQueue);

  // ── Detect circular ───────────────────────────────
  const isCircular =
    name.includes('circular')       ||
    desc.includes('circular')       ||
    desc.includes('ring buffer');

  // ── Detect priority ───────────────────────────────
  const isPriority =
    name.includes('priority')       ||
    desc.includes('priority')       ||
    desc.includes('heap');

  // ── Extract initial items from input ──────────────
  let initialItems: (string | number)[] = [];
  let inputDisplay = '';

  // Check for expression string (e.g., "3 + 4 * 2")
  const exprMatch = input.match(/"([^"]+)"/);
  if (exprMatch) {
    inputDisplay = exprMatch[1];
    initialItems = [];
  } else {
    // Numbers or chars
    const numMatch = input.match(/(-?\d+)/g);
    if (numMatch) {
      initialItems = numMatch.slice(0, 8).map(Number);
    }
  }

  // ── Max size ──────────────────────────────────────
  const maxSize = isCircular
    ? Math.max(initialItems.length, 6)
    : Math.max(initialItems.length, 8);

  // ── Build title ───────────────────────────────────
  const title = analysis.algorithmName || (
    isStack ? 'Stack' : isQueue ? 'Queue' : 'Stack & Queue'
  );

  return {
    type:         isBoth  ? 'both'  :
                  isStack ? 'stack' : 'queue',
    initialItems,
    maxSize,
    inputDisplay,
    title,
    isCircular,
    isPriority,
  };
}