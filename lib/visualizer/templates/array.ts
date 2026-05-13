// lib/visualizer/templates/array.ts

import { AnalysisResult } from "@/types";

/**
 * Array / Bar Template.
 * Generates HTML structure for horizontal array visualizations.
 *
 * Algorithms using this template:
 *  - Sorting (Bubble, Selection, Insertion, Merge, Quick, Heap)
 *  - Two Pointers (Binary Search, Pair Sum, Water Container)
 *  - Sliding Window
 *  - Linear DP (Frog Jump, Staircase)
 *
 * Structure:
 *  <div id="array-container" class="array-layout">
 *    <div class="bar-item" id="bar-0" data-value="10">...</div>
 *    ...
 *  </div>
 */
export function getArrayTemplate(analysis: AnalysisResult): string {
  // ── Extract values from analysis ──────────────────
  // Try to parse inputExample string (e.g., "[10, 20, 30]" or "10 20 30")
  let values: number[] = [];

  if (analysis.inputExample) {
    // Match numbers in brackets or space separated
    const match = analysis.inputExample.match(/(-?\d+(\.\d+)?)/g);
    if (match) {
      values = match.map(Number);
    }
  }

  // Fallback: if no numbers found, generate generic placeholder
  if (values.length === 0) {
    // Generate based on algorithm description hint or default
    values = [30, 45, 20, 85, 50, 10, 65, 25];
  }

  // Cap max bars for visual safety (max ~20)
  if (values.length > 20) values = values.slice(0, 20);

  // ── Normalize heights ───────────────────────────────
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values);

  // Generate bar HTML
  const barsHTML = values.map((val, idx) => {
    // Normalize height to percentage (relative to max)
    // Ensure min height of 5% for visibility
    const heightPct = Math.max(5, (val / maxVal) * 100);

    return `
      <div class="bar-item" id="bar-${idx}" data-value="${val}" data-index="${idx}">
        <div class="bar-body"></div>
        <div class="bar-value">${val}</div>
        <div class="bar-index">${idx}</div>
      </div>
    `;
  }).join('\n    ');

  // ── Return full template string ────────────────────
  return `
<!-- ─────────────────────────────────────────────────────────────
     ARRAY / BAR TEMPLATE
──────────────────────────────────────────────────────────────────── -->
<div id="array-container" class="array-layout">
  ${barsHTML}
</div>
  `.trim();
}