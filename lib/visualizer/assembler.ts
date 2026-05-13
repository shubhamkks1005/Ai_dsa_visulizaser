// lib/visualizer/assembler.ts

import { getBaseShell }            from './core/shell';
import { getArrayTemplate }        from './templates/array';
import { getGraphTemplate }        from './templates/graph';
import { getTreeTemplate }         from './templates/tree';
import { getDPTemplate }           from './templates/dp';
import { getStackQueueTemplate }   from './templates/stackqueue';
import { getRecursionTemplate }    from './templates/recursion';
import { AnalysisResult }          from '@/types';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

/**
 * AIVisualizationOutput
 * This is what generator.ts returns after AI generation.
 * AI generates ONLY these parts — everything else is prebuilt.
 */
export interface AIVisualizationOutput {
  templateType:     TemplateType;
  customCSS:        string;   // algorithm-specific styles
  sceneHTML:        string;   // extra scene elements (character, env)
  sceneScript:      string;   // full JS: STEPS[], renderScene(), initVisualization()
  sceneConfig:      SceneConfig;
}

export type TemplateType =
  | 'array'
  | 'graph'
  | 'tree'
  | 'dp'
  | 'stackqueue'
  | 'recursion';

export interface SceneConfig {
  algorithmName:    string;
  timeComplexity:   string;
  spaceComplexity?: string;
  stats:            StatConfig[];
  boldKeywords?:    string[];
  baseInterval?:    number;
  completionConfig?: CompletionConfig;
}

export interface StatConfig {
  key:   string;
  label: string;
  value: number;
  side:  'left' | 'right';
}

export interface CompletionConfig {
  emoji:    string;
  title:    string;
  subtitle: string;
  stats:    { label: string; value: string | number }[];
}

// ═══════════════════════════════════════════════════
// TEMPLATE SELECTOR
// ═══════════════════════════════════════════════════

/**
 * getTemplate(templateType, analysis)
 * Returns the HTML string for the requested template.
 */
function getTemplate(
  templateType: TemplateType,
  analysis:     AnalysisResult
): string {
  switch (templateType) {
    case 'array':
      return getArrayTemplate(analysis);
    case 'graph':
      return getGraphTemplate(analysis);
    case 'tree':
      return getTreeTemplate(analysis);
    case 'dp':
      return getDPTemplate(analysis);
    case 'stackqueue':
      return getStackQueueTemplate(analysis);
    case 'recursion':
      return getRecursionTemplate(analysis);
    default:
      // Fallback to array template
      console.warn(`[Assembler] Unknown templateType "${templateType}", falling back to array`);
      return getArrayTemplate(analysis);
  }
}

// ═══════════════════════════════════════════════════
// SLOT REPLACER
// ═══════════════════════════════════════════════════

/**
 * replaceSlot(html, startMarker, endMarker, content)
 * Replaces content between start and end markers.
 * Markers must exist in the shell HTML.
 */
function replaceSlot(
  html:        string,
  startMarker: string,
  endMarker:   string,
  content:     string
): string {
  const startIdx = html.indexOf(startMarker);
  const endIdx   = html.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) {
    console.warn(`[Assembler] Slot marker not found: ${startMarker}`);
    return html;
  }

  const before = html.slice(0, startIdx + startMarker.length);
  const after  = html.slice(endIdx);

  return before + '\n' + content + '\n' + after;
}

// ═══════════════════════════════════════════════════
// CSS SANITIZER
// ═══════════════════════════════════════════════════

/**
 * sanitizeCSS(css)
 * Basic safety check on AI-generated CSS.
 * Removes potentially harmful rules.
 */
function sanitizeCSS(css: string): string {
  if (!css) return '';

  return css
    // Remove @import (external resources)
    .replace(/@import\s+[^;]+;/gi, '')
    // Remove javascript: in any value
    .replace(/javascript\s*:/gi, '')
    // Remove expression() (IE hack)
    .replace(/expression\s*\(/gi, '')
    // Remove fixed positioning on body/html
    // (could break layout)
    .replace(/(html|body)\s*\{[^}]*position\s*:\s*fixed[^}]*\}/gi, '');
}

// ═══════════════════════════════════════════════════
// SCRIPT SANITIZER
// ═══════════════════════════════════════════════════

/**
 * sanitizeScript(script)
 * Basic safety check on AI-generated script.
 * Removes markdown fences if AI included them.
 */
function sanitizeScript(script: string): string {
  if (!script) return '';

  // Strip markdown code fences
  script = script
    .replace(/^```(?:javascript|js|html)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Remove document.write (can break srcdoc)
  script = script.replace(/document\.write\s*\(/gi, '// document.write(');

  // Remove window.location changes
  script = script.replace(/window\.location\s*=/gi, '// window.location =');

  return script;
}

// ═══════════════════════════════════════════════════
// HTML SANITIZER
// ═══════════════════════════════════════════════════

/**
 * sanitizeSceneHTML(html)
 * Safety check on AI-generated scene HTML.
 */
function sanitizeSceneHTML(html: string): string {
  if (!html) return '';

  // Remove <script> tags from scene HTML
  // (scripts go in scene script slot, not scene HTML slot)
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove <style> tags from scene HTML
  // (styles go in CSS slot)
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return html;
}

// ═══════════════════════════════════════════════════
// FALLBACK SCRIPT GENERATOR
// ═══════════════════════════════════════════════════

/**
 * generateFallbackScript(analysis, templateType)
 * If AI script is missing or invalid, generate a minimal
 * working script so visualization doesn't break completely.
 */
function generateFallbackScript(
  analysis:     AnalysisResult,
  templateType: TemplateType
): string {
  const steps = analysis.steps || [];

  // Build minimal STEPS array from analysis
  const stepsJSON = JSON.stringify(
    steps.map((s, i) => ({
      step:        s.step ?? i,
      action:      s.action      || 'process',
      caption:     s.caption     || s.description || `Step ${i + 1}`,
      variables:   s.variables   || {},
      highlight:   s.highlight   || [],
      important:   s.important   || false,
      timingMult:  s.timingMult  || 1.0,
    })),
    null,
    2
  );

  return `
/* ─── FALLBACK SCRIPT (AI generation failed) ─── */
window.STEPS = ${stepsJSON};

function renderScene(step, index) {
  // Minimal fallback — just show caption
  // Template: ${templateType}
  console.log('[Fallback] Step', index, step.action);
}

// Minimal stats
const fallbackStats = [
  { key: 'currentStep', label: 'Step',    value: 0,    side: 'left'  },
  { key: 'totalSteps',  label: 'Total',   value: ${steps.length}, side: 'right' },
];

initVisualization({
  steps:           window.STEPS,
  algorithmName:   ${JSON.stringify(analysis.algorithmName || 'Algorithm')},
  timeComplexity:  ${JSON.stringify(analysis.timeComplexity  || '')},
  spaceComplexity: ${JSON.stringify(analysis.spaceComplexity || '')},
  stats:           fallbackStats,
  baseInterval:    1200,
  boldKeywords:    [],
  completionConfig: {
    emoji:    '✅',
    title:    'Complete!',
    subtitle: ${JSON.stringify(analysis.algorithmName || 'Algorithm')} + ' finished.',
    stats:    [{ label: 'Steps', value: ${steps.length} }],
  },
  onInit: function() {
    // No scene init in fallback
  },
});
  `.trim();
}

// ═══════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════

/**
 * validateAIOutput(output)
 * Check if AI output has required fields.
 * Returns list of issues (empty = valid).
 */
function validateAIOutput(output: AIVisualizationOutput): string[] {
  const issues: string[] = [];

  if (!output) {
    issues.push('AI output is null/undefined');
    return issues;
  }

  if (!output.templateType) {
    issues.push('Missing templateType');
  }

  if (!output.sceneScript) {
    issues.push('Missing sceneScript');
  } else {
    if (!output.sceneScript.includes('window.STEPS')) {
      issues.push('sceneScript missing window.STEPS');
    }
    if (!output.sceneScript.includes('renderScene')) {
      issues.push('sceneScript missing renderScene function');
    }
    if (!output.sceneScript.includes('initVisualization')) {
      issues.push('sceneScript missing initVisualization call');
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════
// MAIN ASSEMBLER
// ═══════════════════════════════════════════════════

/**
 * assembleHTML(aiOutput, analysis)
 *
 * Main function — combines prebuilt shell + template + AI output
 * into final complete HTML string.
 *
 * Flow:
 *  1. Get base shell (theme + animations + engines)
 *  2. Select template based on templateType
 *  3. Validate AI output
 *  4. Sanitize AI parts (CSS, HTML, Script)
 *  5. Replace slots in shell
 *  6. Return final HTML string
 *
 * @param aiOutput   What AI generated
 * @param analysis   Full analysis result (for template + fallback)
 * @returns          Complete HTML string ready for iframe srcdoc
 */
export function assembleHTML(
  aiOutput:  AIVisualizationOutput,
  analysis:  AnalysisResult
): string {
  console.log('[Assembler] Starting HTML assembly...');

  // ── Step 1: Get base shell ────────────────────────
  let shell: string;
  try {
    shell = getBaseShell();
  } catch (err) {
    console.error('[Assembler] getBaseShell() failed:', err);
    throw new Error('Failed to generate base shell');
  }

  // ── Step 2: Determine template type ───────────────
  const templateType: TemplateType =
    (aiOutput?.templateType as TemplateType) || 'array';

  // ── Step 3: Get template HTML ─────────────────────
  let templateHTML: string;
  try {
    templateHTML = getTemplate(templateType, analysis);
  } catch (err) {
    console.error('[Assembler] getTemplate() failed:', err);
    templateHTML = `<div style="color:var(--text-muted);padding:20px;">
      Template error — using minimal view
    </div>`;
  }

  // ── Step 4: Validate AI output ────────────────────
  const issues = validateAIOutput(aiOutput);
  if (issues.length > 0) {
    console.warn('[Assembler] AI output issues:', issues);
  }

  // ── Step 5: Prepare parts ─────────────────────────

  // CSS: sanitize AI CSS
  const sceneCSSRaw = aiOutput?.customCSS || '';
  const sceneCSS    = sanitizeCSS(sceneCSSRaw);

  // HTML: template + AI scene HTML
  const sceneHTMLRaw = aiOutput?.sceneHTML || '';
  const sceneHTMLSanitized = sanitizeSceneHTML(sceneHTMLRaw);

  // Combine template + AI extra HTML
  const combinedSceneHTML = `
${templateHTML}
${sceneHTMLSanitized}
  `.trim();

  // Script: use AI script or fallback
  let sceneScript: string;
  const scriptIssues = issues.filter(i =>
    i.includes('sceneScript') ||
    i.includes('STEPS')       ||
    i.includes('renderScene') ||
    i.includes('initVisualization')
  );

  if (scriptIssues.length > 0 || !aiOutput?.sceneScript) {
    console.warn('[Assembler] Using fallback script due to:', scriptIssues);
    sceneScript = generateFallbackScript(analysis, templateType);
  } else {
    sceneScript = sanitizeScript(aiOutput.sceneScript);
  }

  // ── Step 6: Replace slots in shell ────────────────

  // Replace CSS slot
  shell = replaceSlot(
    shell,
    '/* __SCENE_CSS_START__ */',
    '/* __SCENE_CSS_END__ */',
    sceneCSS
  );

  // Replace HTML slot
  shell = replaceSlot(
    shell,
    '<!-- __SCENE_HTML_START__ -->',
    '<!-- __SCENE_HTML_END__ -->',
    combinedSceneHTML
  );

  // Replace Script slot
  shell = replaceSlot(
    shell,
    '<!-- __SCENE_SCRIPT_START__ -->',
    '<!-- __SCENE_SCRIPT_END__ -->',
    `<script>\n${sceneScript}\n</script>`
  );

  console.log('[Assembler] ✅ Assembly complete. HTML length:', shell.length);

  return shell;
}

// ═══════════════════════════════════════════════════
// QUICK VALIDATE FINAL HTML
// ═══════════════════════════════════════════════════

/**
 * validateFinalHTML(html)
 * Quick sanity check on assembled HTML.
 * Returns { valid, issues }
 */
export function validateFinalHTML(html: string): {
  valid:  boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!html || html.length < 500) {
    issues.push('HTML too short — likely empty or failed');
  }

  if (!html.includes('<!DOCTYPE html>')) {
    issues.push('Missing DOCTYPE');
  }

  if (!html.includes('id="app"')) {
    issues.push('Missing app container');
  }

  if (!html.includes('id="scene-content"')) {
    issues.push('Missing scene-content');
  }

  if (!html.includes('window.STEPS')) {
    issues.push('Missing STEPS array');
  }

  if (!html.includes('renderScene')) {
    issues.push('Missing renderScene function');
  }

  if (!html.includes('initVisualization')) {
    issues.push('Missing initVisualization call');
  }

  if (!html.includes('</html>')) {
    issues.push('HTML not properly closed');
  }

  return {
    valid:  issues.length === 0,
    issues,
  };
}