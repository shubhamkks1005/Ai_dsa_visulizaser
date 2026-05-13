// lib/visualizer/templates/dp.ts

import { AnalysisResult } from "@/types";

/**
 * DP Table Template.
 * Generates HTML structure for dynamic programming visualizations.
 *
 * Algorithms using this template:
 *  - LCS (Longest Common Subsequence)
 *  - Edit Distance
 *  - Knapsack (0/1)
 *  - Coin Change
 *  - Matrix Chain Multiplication
 *  - Longest Increasing Subsequence
 *  - Grid DP (Unique Paths, Min Path Sum)
 *
 * Structure (2D):
 *  <div id="dp-container">
 *    <table id="dp-table">
 *      <thead> row headers </thead>
 *      <tbody>
 *        <tr> <td class="dp-cell" id="cell-0-0"> </td> ... </tr>
 *      </tbody>
 *    </table>
 *  </div>
 *
 * Structure (1D):
 *  <div id="dp-container">
 *    <div id="dp-1d-row">
 *      <div class="dp-cell-1d" id="cell-0"> </div>
 *      ...
 *    </div>
 *  </div>
 */
export function getDPTemplate(analysis: AnalysisResult): string {

  // ── Extract DP config from analysis ───────────────
  const dpConfig = extractDPConfig(analysis);
  const { is2D, rows, cols, rowLabels, colLabels, title } = dpConfig;

  if (is2D) {
    return generate2DTemplate(rows, cols, rowLabels, colLabels, title);
  } else {
    return generate1DTemplate(cols, colLabels, title);
  }
}

// ═══════════════════════════════════════════════════
// 2D TABLE GENERATOR
// ═══════════════════════════════════════════════════

function generate2DTemplate(
  rows:      number,
  cols:      number,
  rowLabels: string[],
  colLabels: string[],
  title:     string
): string {

  // ── Header row ────────────────────────────────────
  const headerCells = colLabels.map((label, j) =>
    `<th class="dp-header-cell dp-col-header" data-col="${j}">${label}</th>`
  ).join('\n          ');

  // ── Body rows ─────────────────────────────────────
  const bodyRows = Array.from({ length: rows }, (_, i) => {
    const rowLabel = rowLabels[i] ?? String(i);
    const cells    = Array.from({ length: cols }, (_, j) => {
      return `<td
            class="dp-cell"
            id="cell-${i}-${j}"
            data-row="${i}"
            data-col="${j}"
            data-value=""
          ><span class="dp-cell-value">-</span></td>`;
    }).join('\n          ');

    return `
        <tr class="dp-row" id="dp-row-${i}" data-row="${i}">
          <th class="dp-header-cell dp-row-header" data-row="${i}">${rowLabel}</th>
          ${cells}
        </tr>`;
  }).join('\n');

  return `
<!-- ─────────────────────────────────────────────────────────────
     DP TABLE TEMPLATE (2D)
     Rows: ${rows} | Cols: ${cols}
──────────────────────────────────────────────────────────────────── -->
<div id="dp-container" class="dp-layout">

  <!-- Title -->
  <div class="dp-title">${title}</div>

  <!-- Table wrapper for scroll -->
  <div class="dp-table-wrapper">
    <table id="dp-table" class="dp-table">
      <thead>
        <tr>
          <!-- Corner cell -->
          <th class="dp-header-cell dp-corner">i \\ j</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody id="dp-tbody">
        ${bodyRows}
      </tbody>
    </table>
  </div>

  <!-- Formula display -->
  <div id="dp-formula-bar" class="dp-formula-bar">
    <span class="dp-formula-label">Formula:</span>
    <span id="dp-formula-text" class="dp-formula-text">—</span>
  </div>

  <!-- Current computation highlight -->
  <div id="dp-computation-bar" class="dp-computation-bar">
    <span id="dp-computation-text" class="dp-computation-text"></span>
  </div>

  <!-- Optimal path overlay toggle -->
  <div id="dp-path-info" class="dp-path-info">
    <span class="dp-path-label">Result:</span>
    <span id="dp-result-value" class="dp-result-value">—</span>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// 1D ROW GENERATOR
// ═══════════════════════════════════════════════════

function generate1DTemplate(
  cols:      number,
  colLabels: string[],
  title:     string
): string {

  // ── Index labels row ──────────────────────────────
  const indexLabels = colLabels.map((label, j) =>
    `<div class="dp-1d-label" data-col="${j}">${label}</div>`
  ).join('\n    ');

  // ── Cells row ─────────────────────────────────────
  const cells = Array.from({ length: cols }, (_, j) =>
    `<div
      class="dp-cell-1d"
      id="cell-${j}"
      data-col="${j}"
      data-value=""
    ><span class="dp-cell-value">-</span></div>`
  ).join('\n    ');

  return `
<!-- ─────────────────────────────────────────────────────────────
     DP TABLE TEMPLATE (1D)
     Cols: ${cols}
──────────────────────────────────────────────────────────────────── -->
<div id="dp-container" class="dp-layout">

  <!-- Title -->
  <div class="dp-title">${title}</div>

  <!-- 1D DP visualization -->
  <div id="dp-1d-wrapper" class="dp-1d-wrapper">

    <!-- Index labels -->
    <div id="dp-1d-labels" class="dp-1d-labels">
      ${indexLabels}
    </div>

    <!-- DP cells -->
    <div id="dp-1d-row" class="dp-1d-row">
      ${cells}
    </div>

    <!-- Value labels below cells -->
    <div id="dp-1d-value-labels" class="dp-1d-value-labels">
      ${Array.from({ length: cols }, (_, j) =>
        `<div class="dp-1d-val-label" id="val-label-${j}">dp[${j}]</div>`
      ).join('\n      ')}
    </div>

  </div>

  <!-- Arrow layer for dependency arrows -->
  <svg
    id="dp-arrow-svg"
    class="dp-arrow-svg"
    xmlns="http://www.w3.org/2000/svg"
    style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:5;"
  >
    <defs>
      <marker
        id="dp-arrow-marker"
        viewBox="0 0 10 10"
        refX="9" refY="5"
        markerWidth="5" markerHeight="5"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-purple)" />
      </marker>
    </defs>
  </svg>

  <!-- Formula bar -->
  <div id="dp-formula-bar" class="dp-formula-bar">
    <span class="dp-formula-label">Formula:</span>
    <span id="dp-formula-text" class="dp-formula-text">—</span>
  </div>

  <!-- Current computation -->
  <div id="dp-computation-bar" class="dp-computation-bar">
    <span id="dp-computation-text" class="dp-computation-text"></span>
  </div>

  <!-- Result display -->
  <div id="dp-path-info" class="dp-path-info">
    <span class="dp-path-label">Result:</span>
    <span id="dp-result-value" class="dp-result-value">—</span>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// DP CONFIG EXTRACTOR
// ═══════════════════════════════════════════════════

interface DPConfig {
  is2D:      boolean;
  rows:      number;
  cols:      number;
  rowLabels: string[];
  colLabels: string[];
  title:     string;
}

function extractDPConfig(analysis: AnalysisResult): DPConfig {
  const input    = analysis.inputExample  || '';
  const desc     = analysis.description   || '';
  const name     = analysis.algorithmName || '';
  const category = analysis.category      || '';

  // ── Determine if 1D or 2D DP ──────────────────────
  const is2DAlgorithm =
    name.toLowerCase().includes('lcs')                  ||
    name.toLowerCase().includes('edit distance')        ||
    name.toLowerCase().includes('longest common')       ||
    name.toLowerCase().includes('knapsack')             ||
    name.toLowerCase().includes('matrix chain')         ||
    name.toLowerCase().includes('unique paths')         ||
    name.toLowerCase().includes('min path')             ||
    name.toLowerCase().includes('grid')                 ||
    desc.toLowerCase().includes('2d')                   ||
    desc.toLowerCase().includes('two string')           ||
    desc.toLowerCase().includes('two sequence');

  // ── Extract strings / arrays from input ───────────
  // Look for two strings: "abcde", "ace"
  const stringMatches = input.match(/"([^"]+)"/g);
  let str1 = '';
  let str2 = '';

  if (stringMatches && stringMatches.length >= 2) {
    str1 = stringMatches[0].replace(/"/g, '');
    str2 = stringMatches[1].replace(/"/g, '');
  }

  // Look for array of numbers
  const numMatch = input.match(/(-?\d+)/g);
  const nums     = numMatch ? numMatch.map(Number) : [];

  if (is2DAlgorithm) {
    // ── 2D DP configuration ───────────────────────

    // LCS / Edit Distance: rows = str1, cols = str2
    if (str1 && str2) {
      const rowLabels = ['', ...str1.split('')];
      const colLabels = ['', ...str2.split('')];
      return {
        is2D:      true,
        rows:      str1.length + 1,
        cols:      str2.length + 1,
        rowLabels,
        colLabels,
        title:     name,
      };
    }

    // Knapsack: rows = items, cols = capacity
    if (name.toLowerCase().includes('knapsack')) {
      // Try to extract capacity
      const capacityMatch = input.match(/capacity[:\s]+(\d+)/i);
      const capacity      = capacityMatch ? Number(capacityMatch[1]) : 8;
      const itemCount     = Math.min(nums.length > 0 ? Math.ceil(nums.length / 2) : 4, 6);

      const rowLabels = ['0', ...Array.from({ length: itemCount }, (_, i) => `Item ${i + 1}`)];
      const colLabels = Array.from({ length: capacity + 1 }, (_, j) => String(j));

      return {
        is2D:      true,
        rows:      itemCount + 1,
        cols:      capacity + 1,
        rowLabels,
        colLabels,
        title:     name,
      };
    }

    // Grid DP (Unique Paths, Min Path Sum)
    if (
      name.toLowerCase().includes('unique paths') ||
      name.toLowerCase().includes('min path')     ||
      name.toLowerCase().includes('grid')
    ) {
      const gridMatch = input.match(/(\d+)\s*[x×*]\s*(\d+)/i);
      const gridRows  = gridMatch ? Math.min(Number(gridMatch[1]), 7) : 4;
      const gridCols  = gridMatch ? Math.min(Number(gridMatch[2]), 7) : 4;

      return {
        is2D:      true,
        rows:      gridRows,
        cols:      gridCols,
        rowLabels: Array.from({ length: gridRows }, (_, i) => String(i)),
        colLabels: Array.from({ length: gridCols }, (_, j) => String(j)),
        title:     name,
      };
    }

    // Default 2D fallback: 5x5
    return {
      is2D:      true,
      rows:      5,
      cols:      6,
      rowLabels: ['', 'A', 'B', 'C', 'D'],
      colLabels: ['', 'X', 'Y', 'Z', 'W', 'V'],
      title:     name,
    };

  } else {
    // ── 1D DP configuration ───────────────────────

    // Coin Change: cols = amount + 1
    if (name.toLowerCase().includes('coin')) {
      const amountMatch = input.match(/amount[:\s]+(\d+)/i);
      const amount      = amountMatch
        ? Math.min(Number(amountMatch[1]), 15)
        : (nums.length > 0 ? Math.min(Math.max(...nums) + 1, 15) : 8);

      return {
        is2D:      false,
        rows:      1,
        cols:      amount + 1,
        rowLabels: [],
        colLabels: Array.from({ length: amount + 1 }, (_, j) => String(j)),
        title:     name,
      };
    }

    // Fibonacci / Staircase / Climbing Stairs
    if (
      name.toLowerCase().includes('fibonacci') ||
      name.toLowerCase().includes('stair')     ||
      name.toLowerCase().includes('climb')
    ) {
      const n = nums.length > 0 ? Math.min(nums[nums.length - 1], 12) : 8;
      return {
        is2D:      false,
        rows:      1,
        cols:      n + 1,
        rowLabels: [],
        colLabels: Array.from({ length: n + 1 }, (_, j) => String(j)),
        title:     name,
      };
    }

    // LIS / Frog Jump
    if (
      name.toLowerCase().includes('lis')       ||
      name.toLowerCase().includes('increasing') ||
      name.toLowerCase().includes('frog')       ||
      name.toLowerCase().includes('jump')
    ) {
      const size = nums.length > 0 ? Math.min(nums.length, 10) : 6;
      return {
        is2D:      false,
        rows:      1,
        cols:      size,
        rowLabels: [],
        colLabels: nums.slice(0, size).map(String),
        title:     name,
      };
    }

    // Generic 1D fallback
    const size = nums.length > 0
      ? Math.min(nums.length, 10)
      : 8;

    return {
      is2D:      false,
      rows:      1,
      cols:      size,
      rowLabels: [],
      colLabels: Array.from({ length: size }, (_, j) => String(j)),
      title:     name,
    };
  }
}