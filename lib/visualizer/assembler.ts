// lib/visualizer/assembler.ts

import { buildShellHTML } from "./shell";
import type { ShellConfig } from "./shell";
import type { AnalysisResult } from "@/types";
import type { CreativeDirection } from "@/lib/ai/analyzer";

// ═══════════════════════════════════════════════════
// TYPES — AI Output Format
// ═══════════════════════════════════════════════════

export interface AISceneOutput {
  customCSS: string;
  sceneHTML: string;
  steps: Array<{
    step: number;
    action: string;
    caption: string;
    variables: Record<string, unknown>;
    highlight: number[];
    important: boolean;
    timingMult: number;
  }>;
  renderScene: string;
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT — Assemble final HTML
// ═══════════════════════════════════════════════════

export function assembleVisualization(
  aiOutput: AISceneOutput | null,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  console.log("[Assembler] Starting assembly...");

  const scene = normalizeAIOutput(aiOutput, analysis, creativeDirection);
  const stats = inferStats(analysis);
  const boldKeywords = inferBoldKeywords(analysis);
  const sceneScript = buildSceneScript(scene);

  const shellConfig: ShellConfig = {
    algorithmName: safe(analysis.algorithmName, "Algorithm"),
    category: safe(analysis.category, "—"),
    timeComplexity: safe(analysis.timeComplexity, ""),
    spaceComplexity: safe(analysis.spaceComplexity, ""),
    customCSS: scene.customCSS,
    sceneHTML: scene.sceneHTML,
    sceneScript: sceneScript,
    stats: stats,
    baseInterval: 1200,
    boldKeywords: boldKeywords,
  };

  const html = buildShellHTML(shellConfig);

  console.log(
    `[Assembler] ✅ Complete: ${analysis.algorithmName} | ` +
      `${scene.steps.length} steps | ` +
      `CSS: ${scene.customCSS.length} chars | ` +
      `HTML: ${scene.sceneHTML.length} chars | ` +
      `Script: ${scene.renderScene.length} chars`
  );

  return html;
}

// ═══════════════════════════════════════════════════
// NORMALIZE AI OUTPUT
// ═══════════════════════════════════════════════════

function normalizeAIOutput(
  raw: AISceneOutput | null,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): AISceneOutput {
  if (!raw) {
    console.warn("[Assembler] No AI output, using complete fallback");
    return buildFallbackScene(analysis, creativeDirection);
  }

  const output: AISceneOutput = {
    customCSS: "",
    sceneHTML: "",
    steps: [],
    renderScene: "",
  };

  if (typeof raw.customCSS === "string" && raw.customCSS.trim().length > 0) {
    output.customCSS = raw.customCSS;
  } else {
    output.customCSS = buildFallbackCSS(creativeDirection);
    console.warn("[Assembler] Missing customCSS, using fallback");
  }

  if (typeof raw.sceneHTML === "string" && raw.sceneHTML.trim().length > 0) {
    output.sceneHTML = raw.sceneHTML;
  } else {
    output.sceneHTML = buildFallbackSceneHTML(analysis, creativeDirection);
    console.warn("[Assembler] Missing sceneHTML, using fallback");
  }

  if (Array.isArray(raw.steps) && raw.steps.length > 0) {
    output.steps = normalizeSteps(raw.steps, analysis);
  } else {
    output.steps = buildFallbackSteps(analysis);
    console.warn("[Assembler] Missing steps, using fallback from analysis");
  }

  if (typeof raw.renderScene === "string" && raw.renderScene.trim().length > 10) {
    output.renderScene = raw.renderScene;
  } else {
    output.renderScene = buildFallbackRenderScene();
    console.warn("[Assembler] Missing renderScene, using fallback");
  }

  return output;
}

// ═══════════════════════════════════════════════════
// NORMALIZE STEPS
// ═══════════════════════════════════════════════════

function normalizeSteps(
  rawSteps: any[],
  analysis: AnalysisResult
): AISceneOutput["steps"] {
  return rawSteps.map((step: any, index: number) => ({
    step: typeof step?.step === "number" ? step.step : index + 1,
    action:
      typeof step?.action === "string" && step.action.trim()
        ? step.action
        : index === 0
        ? "initialize"
        : index === rawSteps.length - 1
        ? "complete"
        : "process",
    caption:
      typeof step?.caption === "string" && step.caption.trim()
        ? step.caption
        : typeof step?.description === "string" && step.description.trim()
        ? step.description
        : `Step ${index + 1}`,
    variables:
      step?.variables &&
      typeof step.variables === "object" &&
      !Array.isArray(step.variables)
        ? step.variables
        : {},
    highlight: Array.isArray(step?.highlight) ? step.highlight : [],
    important:
      typeof step?.important === "boolean"
        ? step.important
        : index === 0 || index === rawSteps.length - 1,
    timingMult:
      typeof step?.timingMult === "number" && Number.isFinite(step.timingMult)
        ? step.timingMult
        : 1.0,
  }));
}

// ═══════════════════════════════════════════════════
// BUILD SCENE SCRIPT
// ═══════════════════════════════════════════════════

function buildSceneScript(scene: AISceneOutput): string {
  const stepsJSON = JSON.stringify(scene.steps, null, 2);

  let renderFn = scene.renderScene.trim();

  // Common AI mistakes fix
  renderFn = renderFn.replace(/\bsteps\.length\b/g, "window.STEPS.length");
  renderFn = renderFn.replace(/\bsteps\[/g, "window.STEPS[");
  renderFn = renderFn.replace(/\bsteps\.forEach\b/g, "window.STEPS.forEach");
  renderFn = renderFn.replace(/\bsteps\.map\b/g, "window.STEPS.map");
  renderFn = renderFn.replace(/\bsteps\.filter\b/g, "window.STEPS.filter");

  // Replace direct getElementById with safe getter
  renderFn = renderFn.replace(
    /document\.getElementById\(([^)]+)\)/g,
    "_safeGetEl($1)"
  );

  // If AI returned only body, wrap it
  if (!renderFn.startsWith("function renderScene")) {
    if (!renderFn.includes("function renderScene")) {
      renderFn = "function renderScene(step, index) {\n" + renderFn + "\n}";
    }
  }

  const safeWrapper = `
var _dummyEl = document.createElement('div');

function _safeGetEl(id) {
  if (!id) return _dummyEl;
  var el = document.getElementById(String(id));
  if (!el) {
    var sc = document.getElementById('scene-content');
    if (sc) {
      var newEl = document.createElement('div');
      newEl.id = String(id);
      newEl.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-width:40px;min-height:40px;margin:4px;padding:6px;background:rgba(99,179,237,0.15);border:1px solid rgba(99,179,237,0.3);border-radius:6px;color:#e2e8f0;font-size:13px;font-weight:600;transition:all 0.3s ease;';
      sc.appendChild(newEl);
      return newEl;
    }
    return _dummyEl;
  }
  return el;
}

window.STEPS = ${stepsJSON};
var STEPS = window.STEPS;
var steps = window.STEPS;

var _userRenderScene = ${renderFn};

function renderScene(step, index) {
  try {
    var sc = document.getElementById('scene-content');
    if (sc) {
      var marked = sc.querySelectorAll('.anim-active, .anim-current, .anim-error');
      marked.forEach(function(el) {
        el.classList.remove('anim-active', 'anim-current', 'anim-error');
      });
    }
  } catch (_) {}

  try {
    _userRenderScene(step, index);
  } catch (e) {
    console.warn('[RenderScene] Error at step ' + index + ':', e);
    try {
      if (step && step.variables && typeof updateVariables === 'function') {
        updateVariables(step.variables);
      }
      if (step && step.caption && typeof setCaption === 'function') {
        setCaption(step.caption, !!step.important);
      }
    } catch (_) {}
  }
}
`;

  return safeWrapper;
}

// ═══════════════════════════════════════════════════
// FALLBACK BUILDERS
// ═══════════════════════════════════════════════════

function buildFallbackScene(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): AISceneOutput {
  return {
    customCSS: buildFallbackCSS(creativeDirection),
    sceneHTML: buildFallbackSceneHTML(analysis, creativeDirection),
    steps: buildFallbackSteps(analysis),
    renderScene: buildFallbackRenderScene(),
  };
}

function buildFallbackCSS(creativeDirection: CreativeDirection): string {
  const palette = creativeDirection?.colorPalette || {
    primary: "#63b3ed",
    secondary: "#a78bfa",
    accent: "#63b3ed",
    danger: "#fb7185",
    background: "#0d1117",
  };

  return `
#scene-content {
  background: ${palette.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
}

.fallback-title {
  font-size: 24px;
  font-weight: 700;
  color: ${palette.primary};
  text-align: center;
}

.fallback-metaphor {
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
  max-width: 500px;
  line-height: 1.6;
}

.fallback-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.fallback-badge {
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(99, 179, 237, 0.1);
  border: 1px solid rgba(99, 179, 237, 0.2);
  color: ${palette.accent};
  font-size: 12px;
}
`;
}

function buildFallbackSceneHTML(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName, "Algorithm");
  const metaphor = safe(
    creativeDirection?.metaphor,
    "Step-by-step algorithm visualization"
  );
  const scene = safe(creativeDirection?.sceneName, "Visualization");
  const input = safe(analysis.inputExample, "See steps below");

  return `
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;padding:40px;">
  <div class="fallback-title">${escapeHTML(scene)}</div>
  <div class="fallback-metaphor">${escapeHTML(metaphor)}</div>
  <div class="fallback-info">
    <span class="fallback-badge">${escapeHTML(name)}</span>
    <span class="fallback-badge">Input: ${escapeHTML(input)}</span>
  </div>
  <div style="font-size:13px;color:#64748b;margin-top:12px;">
    Press <kbd style="padding:2px 6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:4px;font-family:monospace;">Play</kbd> to step through the algorithm
  </div>
</div>
`;
}

function buildFallbackSteps(analysis: AnalysisResult): AISceneOutput["steps"] {
  const rawSteps = Array.isArray((analysis as any).steps)
    ? (analysis as any).steps
    : [];

  if (rawSteps.length === 0) {
    return [
      {
        step: 1,
        action: "initialize",
        caption: `Starting ${safe(analysis.algorithmName, "algorithm")} visualization.`,
        variables: {},
        highlight: [],
        important: true,
        timingMult: 0.5,
      },
      {
        step: 2,
        action: "complete",
        caption: `${safe(analysis.algorithmName, "Algorithm")} complete.`,
        variables: {},
        highlight: [],
        important: true,
        timingMult: 0.5,
      },
    ];
  }

  return rawSteps.map((step: any, index: number) => ({
    step: step?.step ?? index + 1,
    action: step?.action || "process",
    caption: step?.caption || step?.description || `Step ${index + 1}`,
    variables: step?.variables || {},
    highlight: step?.highlight || [],
    important: step?.important ?? (index === 0 || index === rawSteps.length - 1),
    timingMult: step?.timingMult ?? 1.0,
  }));
}

function buildFallbackRenderScene(): string {
  return `function renderScene(step, index) {
  if (step.action === 'reset') {
    clearAllAnimations('scene-content');
    return;
  }

  if (step.action === 'initialize') {
    fadeIn('scene-content', 500);
  }

  if (step.action === 'complete') {
    var sceneContent = document.getElementById('scene-content');
    if (sceneContent) {
      celebrationWave('scene-content');
    }
  }

  if (step.variables) {
    Object.keys(step.variables).forEach(function(key) {
      updateStat(key, step.variables[key]);
    });
  }
}`;
}

// ═══════════════════════════════════════════════════
// STATS INFERENCE
// ═══════════════════════════════════════════════════

function inferStats(
  analysis: AnalysisResult
): Array<{ key: string; label: string; value: number }> {
  const category = safe(analysis.category, "").toLowerCase();
  const name = safe(analysis.algorithmName, "").toLowerCase();

  if (category.includes("sorting")) {
    return [
      { key: "comparisons", label: "Comparisons", value: 0 },
      { key: "swaps", label: "Swaps", value: 0 },
    ];
  }

  if (category.includes("graph")) {
    return [
      { key: "visited", label: "Visited", value: 0 },
      { key: "distance", label: "Best Dist", value: 0 },
    ];
  }

  if (category.includes("dp")) {
    return [
      { key: "cellsFilled", label: "Filled", value: 0 },
      { key: "best", label: "Best", value: 0 },
    ];
  }

  if (category.includes("binary search")) {
    return [
      { key: "left", label: "Left", value: 0 },
      { key: "mid", label: "Mid", value: 0 },
      { key: "right", label: "Right", value: 0 },
    ];
  }

  if (name.includes("rain water") || name.includes("trapping")) {
    return [
      { key: "leftMax", label: "Left Max", value: 0 },
      { key: "rightMax", label: "Right Max", value: 0 },
      { key: "water", label: "Water", value: 0 },
    ];
  }

  if (name.includes("frog")) {
    return [
      { key: "position", label: "Position", value: 0 },
      { key: "energy", label: "Energy", value: 0 },
    ];
  }

  if (name.includes("queen")) {
    return [
      { key: "row", label: "Row", value: 0 },
      { key: "queens", label: "Queens", value: 0 },
      { key: "backtracks", label: "Backtracks", value: 0 },
    ];
  }

  return [
    { key: "operations", label: "Operations", value: 0 },
    { key: "progress", label: "Progress", value: 0 },
  ];
}

// ═══════════════════════════════════════════════════
// BOLD KEYWORDS INFERENCE
// ═══════════════════════════════════════════════════

function inferBoldKeywords(analysis: AnalysisResult): string[] {
  const name = safe(analysis.algorithmName, "").toLowerCase();
  const category = safe(analysis.category, "").toLowerCase();

  const keywords: string[] = [];

  if (name.includes("bubble")) keywords.push("swap", "compare", "sorted", "pass", "bubble");
  if (name.includes("merge")) keywords.push("split", "merge", "divide", "combine");
  if (name.includes("quick")) keywords.push("pivot", "partition", "swap");
  if (name.includes("binary")) keywords.push("mid", "target", "found", "eliminate", "half");
  if (name.includes("frog")) keywords.push("jump", "stone", "energy", "cost", "land");
  if (name.includes("rain") || name.includes("trap")) keywords.push("water", "trapped", "boundary", "fill", "height");
  if (name.includes("dijkstra")) keywords.push("distance", "shortest", "path", "relax", "visit");
  if (name.includes("queen")) keywords.push("queen", "safe", "backtrack", "place", "conflict");
  if (name.includes("bfs")) keywords.push("queue", "level", "visit", "neighbor", "explore");
  if (name.includes("dfs")) keywords.push("stack", "depth", "backtrack", "visit", "explore");

  if (category.includes("sorting")) keywords.push("swap", "compare", "sorted");
  if (category.includes("graph")) keywords.push("visit", "path", "node", "edge");
  if (category.includes("dp")) keywords.push("optimal", "subproblem", "memoize", "state");
  if (category.includes("tree")) keywords.push("node", "left", "right", "root", "leaf");
  if (category.includes("stack")) keywords.push("push", "pop", "top", "stack");
  if (category.includes("queue")) keywords.push("enqueue", "dequeue", "front", "queue");

  keywords.push("complete", "found", "result", "final", "best");

  return Array.from(new Set(keywords));
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

function safe(value: unknown, fallback: string = ""): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════════════════
// PARSE AI JSON SAFELY
// ═══════════════════════════════════════════════════

export function parseAISceneOutput(text: string): AISceneOutput | null {
  if (!text || text.trim().length === 0) return null;

  let clean = text.trim();

  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === "object") return parsed as AISceneOutput;
  } catch {}

  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    const sliced = clean.slice(start, end + 1);

    try {
      const parsed = JSON.parse(sliced);
      if (parsed && typeof parsed === "object") return parsed as AISceneOutput;
    } catch {}

    try {
      const fixed = sliced
        .replace(/[\x00-\x1F\x7F]/g, " ")
        .replace(/,(\s*[\]}])/g, "$1");
      const parsed = JSON.parse(fixed);
      if (parsed && typeof parsed === "object") return parsed as AISceneOutput;
    } catch {}
  }

  console.warn("[Assembler] Failed to parse AI scene output as JSON");
  return null;
}