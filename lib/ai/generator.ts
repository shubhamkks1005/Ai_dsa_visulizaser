// lib/ai/generator.ts

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { AnalysisResult, CreativeScene, TechnicalSpec } from "@/types";
import { AIVisualizationOutput, TemplateType } from "@/lib/visualizer/assembler";
import {
  callWithGeminiRotation,
  runModelChain,
  getGroqKey,
  MODELS,
  GEMINI_RETRY_CONFIG,
  type ModelFn,
} from "@/lib/ai/ai-utils";

export type { CreativeScene, TechnicalSpec };

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface GeneratorPart1 {
  templateType: string;
  sceneConfig: {
    algorithmName:     string;
    timeComplexity:    string;
    spaceComplexity?:  string;
    stats:             any[];
    boldKeywords:      string[];
    baseInterval:      number;
    completionConfig?: any;
  };
}

// Part 2 = plain text CSS string (no interface needed)



// ═══════════════════════════════════════════════════
// JSON PARSER
// ═══════════════════════════════════════════════════

function parseJSON<T>(text: string, label: string): T {
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty response from ${label}`);
  }

  let clean = text.trim();
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  clean = fixJSONEscaping(clean);

  try {
    return JSON.parse(clean) as T;
  } catch {
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(clean.slice(start, end + 1)) as T;
      } catch (e) {
        throw new Error(
          `Failed to parse ${label} JSON: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }
    throw new Error(`No valid JSON found in ${label} response`);
  }
}

function fixJSONEscaping(text: string): string {
  try {
    JSON.parse(text);
    return text;
  } catch {
    let result   = '';
    let inString = false;
    let escaped  = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (escaped) {
        result  += ch;
        escaped  = false;
        continue;
      }

      if (ch === '\\') {
        escaped = true;
        result += ch;
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        result  += ch;
        continue;
      }

      if (inString) {
        if (ch === '\n')      { result += '\\n';  continue; }
        if (ch === '\r')      { result += '\\r';  continue; }
        if (ch === '\t')      { result += '\\t';  continue; }
        const code = ch.charCodeAt(0);
        if (code < 32) {
          result += '\\u' + code.toString(16).padStart(4, '0');
          continue;
        }
      }

      result += ch;
    }

    return result;
  }
}

// ═══════════════════════════════════════════════════
// SCRIPT EXTRACTOR — Plain text JS response
// ═══════════════════════════════════════════════════

function extractScript(text: string, label: string): string {
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty script response from ${label}`);
  }

  let clean = text.trim();

  // Strip think tags
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  const fenceMatch = clean.match(/```(?:javascript|js)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  // Strip JSON wrapper if model wrapped it anyway
  // { "sceneScript": "..." }
  if (clean.startsWith('{') && clean.includes('sceneScript')) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed.sceneScript) return parsed.sceneScript;
    } catch {
      // Try extracting value manually
      const match = clean.match(/"sceneScript"\s*:\s*"([\s\S]*?)"\s*\}/);
      if (match) return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }

  return clean;
}

function validateScript(script: string, label: string): void {
  if (!script || script.trim().length < 100) {
    throw new Error(`${label}: script too short`);
  }
  if (!script.includes('STEPS') && !script.includes('window.STEPS')) {
    throw new Error(`${label}: missing STEPS`);
  }
  if (!script.includes('renderScene')) {
    throw new Error(`${label}: missing renderScene`);
  }
  if (!script.includes('initVisualization')) {
    throw new Error(`${label}: missing initVisualization`);
  }
}

// ═══════════════════════════════════════════════════
// CSS EXTRACTOR — Plain text response
// ═══════════════════════════════════════════════════

function extractCSS(text: string, label: string): string {
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty CSS response from ${label}`);
  }

  let clean = text.trim();

  // Strip think tags
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  const fenceMatch = clean.match(/```(?:css)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  // Strip <style> tags if present
  const styleMatch = clean.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) return styleMatch[1].trim();

  // Return as-is (plain CSS)
  return clean;
}

// ═══════════════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════════════

function validatePart1(part1: GeneratorPart1, label: string): void {
  const validTemplates = ['array','graph','tree','dp','stackqueue','recursion'];
  if (!part1.templateType || !validTemplates.includes(part1.templateType)) {
    throw new Error(`${label}: invalid templateType "${part1.templateType}"`);
  }
  if (!part1.sceneConfig || !part1.sceneConfig.algorithmName) {
    throw new Error(`${label}: missing sceneConfig`);
  }
  if (!Array.isArray(part1.sceneConfig.stats)) {
    throw new Error(`${label}: missing stats array`);
  }
}

function validateCSS(css: string, label: string): void {
  if (!css || css.trim().length < 10) {
    throw new Error(`${label}: CSS too short or empty`);
  }
}

function validatePart3(part3: GeneratorPart3, label: string): void {
  if (!part3.sceneScript || part3.sceneScript.trim().length < 100) {
    throw new Error(`${label}: missing or too-short sceneScript`);
  }
  if (!part3.sceneScript.includes('window.STEPS') &&
      !part3.sceneScript.includes('STEPS =')) {
    throw new Error(`${label}: sceneScript missing STEPS`);
  }
  if (!part3.sceneScript.includes('renderScene')) {
    throw new Error(`${label}: sceneScript missing renderScene`);
  }
  if (!part3.sceneScript.includes('initVisualization')) {
    throw new Error(`${label}: sceneScript missing initVisualization`);
  }
}

// ═══════════════════════════════════════════════════
// NORMALIZERS
// ═══════════════════════════════════════════════════

function normalizePart1(
  part1:         GeneratorPart1,
  analysis:      AnalysisResult,
  technicalSpec: TechnicalSpec
): GeneratorPart1 {
  const validTemplates: TemplateType[] = [
    'array','graph','tree','dp','stackqueue','recursion'
  ];

  if (!validTemplates.includes(part1.templateType as TemplateType)) {
    part1.templateType = technicalSpec.templateType || 'array';
  }

  if (!part1.sceneConfig) {
    part1.sceneConfig = {
      algorithmName:   analysis.algorithmName,
      timeComplexity:  analysis.timeComplexity,
      spaceComplexity: analysis.spaceComplexity || '',
      stats: [
        { key: 'comparisons', label: 'Comparisons', value: 0, side: 'left'  },
        { key: 'swaps',       label: 'Swaps',       value: 0, side: 'left'  },
        { key: 'currentStep', label: 'Step',        value: 0, side: 'right' },
      ],
      boldKeywords: [],
      baseInterval: technicalSpec.baseInterval || 1200,
    };
  }

  // Ensure required fields
  part1.sceneConfig.algorithmName   = part1.sceneConfig.algorithmName   || analysis.algorithmName;
  part1.sceneConfig.timeComplexity  = part1.sceneConfig.timeComplexity  || analysis.timeComplexity;
  part1.sceneConfig.spaceComplexity = part1.sceneConfig.spaceComplexity || analysis.spaceComplexity || '';
  part1.sceneConfig.boldKeywords    = part1.sceneConfig.boldKeywords    || [];
  part1.sceneConfig.baseInterval    = part1.sceneConfig.baseInterval    || 1200;

  if (!Array.isArray(part1.sceneConfig.stats) || part1.sceneConfig.stats.length === 0) {
    part1.sceneConfig.stats = [
      { key: 'comparisons', label: 'Comparisons', value: 0, side: 'left'  },
      { key: 'swaps',       label: 'Swaps',       value: 0, side: 'left'  },
      { key: 'currentStep', label: 'Step',        value: 0, side: 'right' },
    ];
  }

  return part1;
}

function normalizePart3(part3: GeneratorPart3): GeneratorPart3 {
  if (part3.sceneScript) {
    part3.sceneScript = part3.sceneScript
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/^```(?:javascript|js)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  }
  return part3;
}

// ═══════════════════════════════════════════════════
// GEMINI CALLER
// ═══════════════════════════════════════════════════

async function callGeminiJSON<T>(
  modelName:  string,
  prompt:     string,
  label:      string,
  maxTokens:  number = 4000
): Promise<T> {
  return callWithGeminiRotation(modelName, async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model:    modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens:  maxTokens,
      },
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error(`Empty response from ${label}`);
    }

    return parseJSON<T>(text, label);
  }, GEMINI_RETRY_CONFIG);
}

async function callGeminiText(
  modelName:  string,
  prompt:     string,
  label:      string,
  maxTokens:  number = 4000
): Promise<string> {
  return callWithGeminiRotation(modelName, async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model:    modelName,
      contents: prompt,
      config: {
        maxOutputTokens: maxTokens,
      },
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error(`Empty response from ${label}`);
    }

    return text;
  }, GEMINI_RETRY_CONFIG);
}

// ═══════════════════════════════════════════════════
// GROQ CALLERS
// ═══════════════════════════════════════════════════

async function callGroqJSON<T>(
  systemPrompt: string,
  userPrompt:   string,
  label:        string,
  maxTokens:    number = 4000
): Promise<T> {
  const groq = new Groq({ apiKey: getGroqKey() });

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature: 0.2,
    max_tokens:  maxTokens,
  });

  const text = completion.choices[0]?.message?.content;
  return parseJSON<T>(text || '', label);
}

async function callGroqText(
  systemPrompt: string,
  userPrompt:   string,
  label:        string,
  maxTokens:    number = 4000
): Promise<string> {
  const groq = new Groq({ apiKey: getGroqKey() });

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature: 0.2,
    max_tokens:  maxTokens,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error(`Empty response from ${label}`);
  return text;
}

// ═══════════════════════════════════════════════════
// PART 1 SYSTEM PROMPT — Config + templateType only
// ═══════════════════════════════════════════════════

function buildPart1SystemPrompt(): string {
  return `You are a technical architect for algorithm visualizations.

Generate the CONFIGURATION for a visualization. No CSS, no HTML, no JavaScript.

Return ONLY a valid JSON object:

{
  "templateType": "array | graph | tree | dp | stackqueue | recursion",
  "sceneConfig": {
    "algorithmName": "string",
    "timeComplexity": "string",
    "spaceComplexity": "string",
    "stats": [
      { "key": "string", "label": "string", "value": 0, "side": "left | right" }
    ],
    "boldKeywords": ["word1", "word2"],
    "baseInterval": 1200,
    "completionConfig": {
      "emoji": "🎉",
      "title": "string",
      "subtitle": "string",
      "stats": []
    }
  }
}

RULES:
1. Return ONLY the JSON object
2. No text before or after
3. No markdown
4. Choose templateType based on algorithm category
5. stats should reflect the algorithm (comparisons/swaps for sorting, etc.)
6. boldKeywords = important algorithm-specific words for caption highlighting
7. baseInterval = ms between steps (slower for complex algorithms)`;
}

// ═══════════════════════════════════════════════════
// PART 2 SYSTEM PROMPT — CSS only (plain text)
// ═══════════════════════════════════════════════════

function buildPart2SystemPrompt(
  part1:         GeneratorPart1,
  creativeScene: CreativeScene,
  analysis:      AnalysisResult
): string {
  return `You are an expert CSS designer for algorithm visualizations.

Generate ONLY the CSS for this visualization. No JavaScript. No HTML. No JSON.

ALGORITHM: ${analysis.algorithmName}
CATEGORY:  ${analysis.category}
TEMPLATE:  ${part1.templateType}
SCENE:     ${creativeScene.sceneName}
METAPHOR:  ${creativeScene.metaphor}

HERO CHARACTER:
  Type: ${creativeScene.heroCharacter.type}
  Look: ${creativeScene.heroCharacter.look}

ENVIRONMENT:
  Setting: ${creativeScene.environment.setting}
  Layers:  ${creativeScene.environment.backgroundLayers.join(', ')}
  Ambient: ${creativeScene.environment.ambientEffects.join(', ')}

COLOR PALETTE:
  primary:    ${creativeScene.colorPalette.primary}
  secondary:  ${creativeScene.colorPalette.secondary}
  accent:     ${creativeScene.colorPalette.accent}
  danger:     ${creativeScene.colorPalette.danger}
  background: ${creativeScene.colorPalette.background}

OBJECT MAPPING:
${Object.entries(creativeScene.objectMapping).map(([k,v]) => `  ${k} = ${v}`).join('\n')}

WHAT TO STYLE (be specific and creative):
1. Scene background — match the environment setting
2. Background layers — create depth (parallax-ready classes)
3. Array bars / main elements — themed to the metaphor
4. Active element state — glowing, highlighted
5. Sorted/complete element state — victory styling
6. Hero character — position, size, emoji/visual
7. Pointer/marker styles
8. Ambient effects — CSS animations for environment
9. Any scene-specific decorative elements

NON-NEGOTIABLE VISUAL REQUIREMENTS:
${creativeScene.nonNegotiableVisualRequirements.map((r,i) => `${i+1}. ${r}`).join('\n')}

RULES:
1. Return ONLY raw CSS — no <style> tags, no JSON, no explanation
2. Use the exact color palette provided
3. Use CSS variables: --scene-primary, --scene-secondary, --scene-accent, --scene-danger, --scene-bg
4. Make it cinematic and thematic — not generic
5. Include CSS @keyframes for ambient animations
6. CSS classes must match what the JavaScript will use`;
}

// ═══════════════════════════════════════════════════
// PART 3 SYSTEM PROMPT — sceneScript only
// ═══════════════════════════════════════════════════

function buildPart3SystemPrompt(
  part1:         GeneratorPart1,
  creativeScene: CreativeScene,
  analysis:      AnalysisResult
): string {

  // Compact steps — only essential fields
  const stepsCompact = analysis.steps.map(s => ({
    step:      s.step,
    action:    s.action,
    caption:   s.caption,
    vars:      s.variables,
    important: s.important,
  }));

  return `You are an expert JavaScript animation coder for algorithm visualizations.

Generate ONLY raw JavaScript code. No JSON wrapper. No explanation. No markdown.
Return pure JavaScript that will be injected directly into a <script> tag.

ALGORITHM: ${analysis.algorithmName}
CATEGORY:  ${analysis.category}
TEMPLATE:  ${part1.templateType}
SCENE:     ${creativeScene.sceneName}
METAPHOR:  ${creativeScene.metaphor}

HERO CHARACTER:
  Type:  ${creativeScene.heroCharacter.type}
  Look:  ${creativeScene.heroCharacter.look}
  Idle:  ${creativeScene.heroCharacter.idleAnimation}
  Move:  ${creativeScene.heroCharacter.moveAnimation}

ENVIRONMENT:
  Setting: ${creativeScene.environment.setting}
  Layers:  ${creativeScene.environment.backgroundLayers.join(', ')}
  Ambient: ${creativeScene.environment.ambientEffects.join(', ')}

OBJECT MAPPING:
${Object.entries(creativeScene.objectMapping).map(([k,v]) => `  ${k} = ${v}`).join('\n')}

STEP TO SCENE:
${creativeScene.stepToSceneMapping.map(s => `  [${s.stepType}] → ${s.visual} via ${s.animation}`).join('\n')}

DRAMATIC MOMENTS:
${creativeScene.dramaticMoments.map((d,i) => `  ${i+1}. ${d}`).join('\n')}

NON-NEGOTIABLE VISUAL REQUIREMENTS:
${creativeScene.nonNegotiableVisualRequirements.map((r,i) => `${i+1}. ${r}`).join('\n')}

STATS AVAILABLE: ${part1.sceneConfig.stats.map((s:any) => s.key).join(', ')}
BASE INTERVAL: ${part1.sceneConfig.baseInterval}ms

PREBUILT FRAMEWORK — call directly, do NOT redefine:
  initVisualization(config), renderStep(index)
  setCaption(text, i, imp), showImportantCaption(text, i)
  updateStat(key, value), updateVariables(vars)
  clearScene(), getSceneDimensions()
  createElement(tag, attrs, styles, parent), addToScene(el)

Animation utilities:
  moveTo, moveArc, moveArcHigh, springTo
  fadeIn, fadeOut, fadeInUp, fadeInScale
  highlight, glowPulse, glowFlash, spotlight, neonFlicker
  popIn, popOut, breathe, squashAndStretch
  shake, wobble, jello, spin
  typeWords, countUp, valueChange, dramaticText
  splashBurst, confettiBurst, ripple, shockwave, sparkle, bubbles
  waterFill, waterRipple, waterSplash, waterDrop
  drawLine, drawArc, drawArrow, connectionBeam
  zoomIn, zoomOut, cameraShake, focusOn
  markSorted, markActive, markVisited, markCurrent, markError, markInactive
  characterIdle, characterJump, characterCelebrate, characterWalk
  celebrationWave, victoryBurst, goldOutline, finalReveal
  stagger, sequence, chainAnimations, delay

STEPS DATA (${analysis.steps.length} total):
${JSON.stringify(stepsCompact, null, 2)}

YOUR OUTPUT MUST CONTAIN:
1. window.STEPS = [...] — ALL ${analysis.steps.length} steps
2. function renderScene(step, index) { ... }
   - handles ALL actions: ${[...new Set(analysis.steps.map(s => s.action))].join(', ')}
   - animates hero character per step
   - calls updateStat() and updateVariables()
   - uses animation utilities
3. initVisualization({
     steps: window.STEPS,
     algorithmName: '${part1.sceneConfig.algorithmName}',
     timeComplexity: '${part1.sceneConfig.timeComplexity}',
     spaceComplexity: '${part1.sceneConfig.spaceComplexity || ''}',
     stats: ${JSON.stringify(part1.sceneConfig.stats)},
     boldKeywords: ${JSON.stringify(part1.sceneConfig.boldKeywords)},
     baseInterval: ${part1.sceneConfig.baseInterval},
     completionConfig: ${JSON.stringify(part1.sceneConfig.completionConfig || {
       emoji: '🎉',
       title: part1.sceneConfig.algorithmName + ' Complete!',
       subtitle: 'Algorithm finished successfully.',
       stats: []
     })},
     onInit: function() {
       // Build initial scene DOM
       // Create hero character
       // Create environment layers
       // Create array bars or main elements
     }
   });

RETURN ONLY RAW JAVASCRIPT. No JSON. No markdown. No explanation.`;
}
// ═══════════════════════════════════════════════════
// PART 1 CHAIN — Config + templateType (JSON)
// ═══════════════════════════════════════════════════

function buildPart1Chain(
  compactPrompt:  string,
  analysis:       AnalysisResult,
  technicalSpec:  TechnicalSpec
): ModelFn<GeneratorPart1>[] {
  const systemPrompt = buildPart1SystemPrompt();
  const prompt       = `${systemPrompt}

ALGORITHM DETAILS:
Name:          ${analysis.algorithmName}
Category:      ${analysis.category}
Time:          ${analysis.timeComplexity}
Space:         ${analysis.spaceComplexity || 'O(n)'}
Steps count:   ${analysis.steps.length}
Template type: ${technicalSpec.templateType}
Stats needed:  Based on category — comparisons/swaps for sorting, etc.`;

  return [
    {
      name: 'Gemini Flash (Config)',
      fn: async () => {
        const part1 = await callGeminiJSON<GeneratorPart1>(
          MODELS.gemini.flash,
          prompt,
          'Gemini Flash Config',
          2000
        );
        validatePart1(part1, 'Gemini Flash Config');
        return normalizePart1(part1, analysis, technicalSpec);
      },
    },
    {
      name: 'Gemini Flash Lite (Config)',
      fn: async () => {
        const part1 = await callGeminiJSON<GeneratorPart1>(
          MODELS.gemini.flashLite,
          prompt,
          'Gemini Flash Lite Config',
          2000
        );
        validatePart1(part1, 'Gemini Flash Lite Config');
        return normalizePart1(part1, analysis, technicalSpec);
      },
    },
    {
      name: 'Groq (Config)',
      fn: async () => {
        const part1 = await callGroqJSON<GeneratorPart1>(
          systemPrompt,
          `ALGORITHM CONTEXT:\n${compactPrompt}`,
          'Groq Config',
          2000
        );
        validatePart1(part1, 'Groq Config');
        return normalizePart1(part1, analysis, technicalSpec);
      },
    },
  ];
}

// ═══════════════════════════════════════════════════
// PART 2 CHAIN — CSS (plain text)
// ═══════════════════════════════════════════════════

function buildPart2Chain(
  part1:         GeneratorPart1,
  creativeScene: CreativeScene,
  analysis:      AnalysisResult
): ModelFn<string>[] {
  const systemPrompt = buildPart2SystemPrompt(part1, creativeScene, analysis);

  return [
    {
      name: 'Gemini Flash (CSS)',
      fn: async () => {
        const text = await callGeminiText(
          MODELS.gemini.flash,
          systemPrompt,
          'Gemini Flash CSS',
          3000
        );
        const css = extractCSS(text, 'Gemini Flash CSS');
        validateCSS(css, 'Gemini Flash CSS');
        return css;
      },
    },
    {
      name: 'Gemini Flash Lite (CSS)',
      fn: async () => {
        const text = await callGeminiText(
          MODELS.gemini.flashLite,
          systemPrompt,
          'Gemini Flash Lite CSS',
          3000
        );
        const css = extractCSS(text, 'Gemini Flash Lite CSS');
        validateCSS(css, 'Gemini Flash Lite CSS');
        return css;
      },
    },
    {
      name: 'Groq (CSS)',
      fn: async () => {
        const text = await callGroqText(
          systemPrompt,
          'Generate the CSS now. Return only raw CSS, no explanation.',
          'Groq CSS',
          3000
        );
        const css = extractCSS(text, 'Groq CSS');
        validateCSS(css, 'Groq CSS');
        return css;
      },
    },
  ];
}

// ═══════════════════════════════════════════════════
// PART 3 CHAIN — sceneScript (JSON)
// ═══════════════════════════════════════════════════

function buildPart3Chain(
  part1:         GeneratorPart1,
  creativeScene: CreativeScene,
  analysis:      AnalysisResult,
  compactPrompt: string
): ModelFn<string>[] {
  const prompt = buildPart3SystemPrompt(part1, creativeScene, analysis);

  return [
    // 1. Gemini Pro — best quality JS
    {
      name: 'Gemini Pro (Script)',
      fn: async () => {
        const text = await callGeminiText(
          MODELS.gemini.pro,
          prompt,
          'Gemini Pro Script',
          8000
        );
        const script = extractScript(text, 'Gemini Pro Script');
        validateScript(script, 'Gemini Pro Script');
        return script;
      },
    },

    // 2. Gemini Flash — faster fallback
    {
      name: 'Gemini Flash (Script)',
      fn: async () => {
        const text = await callGeminiText(
          MODELS.gemini.flash,
          prompt,
          'Gemini Flash Script',
          8000
        );
        const script = extractScript(text, 'Gemini Flash Script');
        validateScript(script, 'Gemini Flash Script');
        return script;
      },
    },

    // 3. Gemini Flash Lite — last resort
    {
      name: 'Gemini Flash Lite (Script)',
      fn: async () => {
        const text = await callGeminiText(
          MODELS.gemini.flashLite,
          prompt,
          'Gemini Flash Lite Script',
          8000
        );
        const script = extractScript(text, 'Gemini Flash Lite Script');
        validateScript(script, 'Gemini Flash Lite Script');
        return script;
      },
    },
  ];
}
// ═══════════════════════════════════════════════════
// COMBINER
// ═══════════════════════════════════════════════════

function combineOutputs(
  part1:      GeneratorPart1,
  customCSS:  string,
  sceneScript: string
): AIVisualizationOutput {
  return {
    templateType: part1.templateType as TemplateType,
    customCSS,
    sceneHTML:    '',
    sceneScript,
    sceneConfig:  part1.sceneConfig,
  };
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

/**
 * generateVisualization()
 *
 * 3-call architecture:
 *   Call 1: Config (JSON)      → Gemini Flash → Flash Lite → Groq
 *   Call 2: CSS (plain text)   → Gemini Flash → Flash Lite → Groq
 *   Call 3: Script (JSON)      → Gemini Pro   → Flash → Groq
 *
 * Sequential calls — no parallel to avoid rate spikes.
 * No JSON escaping issues in CSS (plain text).
 * Gemini Pro focused only on JS — best quality script.
 */
export async function generateVisualization(
  compactPrompt:  string,
  creativeScene:  CreativeScene,
  technicalSpec:  TechnicalSpec,
  analysis:       AnalysisResult
): Promise<AIVisualizationOutput> {

  console.log('[Generator] Starting 3-call generation...');
  console.log('[Generator] Algorithm:', analysis.algorithmName);
  console.log('[Generator] Template:', technicalSpec.templateType);
  console.log('[Generator] Scene:', creativeScene.sceneName);

  // ── Call 1: Config ────────────────────────────────
  console.log('[Generator] Call 1: Config...');
  const part1Chain = buildPart1Chain(compactPrompt, analysis, technicalSpec);
  const { result: part1, model: model1 } = await runModelChain(
    part1Chain,
    GEMINI_RETRY_CONFIG,
    'Generator-Config'
  );
  console.log(`[Generator] ✅ Config via ${model1}`);
  console.log(`[Generator] Template: ${part1.templateType}`);

  // ── Call 2: CSS ───────────────────────────────────
  console.log('[Generator] Call 2: CSS...');
  const part2Chain = buildPart2Chain(part1, creativeScene, analysis);
  const { result: customCSS, model: model2 } = await runModelChain(
    part2Chain,
    GEMINI_RETRY_CONFIG,
    'Generator-CSS'
  );
  console.log(`[Generator] ✅ CSS via ${model2} — ${customCSS.length} chars`);

  
   // ── Call 3: Script ────────────────────────────────
  console.log('[Generator] Call 3: Script...');
  const part3Chain = buildPart3Chain(part1, creativeScene, analysis, compactPrompt);
  const { result: sceneScript, model: model3 } = await runModelChain(
    part3Chain,
    GEMINI_RETRY_CONFIG,
    'Generator-Script'
  );
  console.log(`[Generator] ✅ Script via ${model3} — ${sceneScript.length} chars`);

  // ── Combine ───────────────────────────────────────
  const output = combineOutputs(part1, customCSS, sceneScript);

  console.log('[Generator] ✅ Generation complete');
  console.log(`[Generator] Config via:  ${model1}`);
  console.log(`[Generator] CSS via:     ${model2}`);
  console.log(`[Generator] Script via:  ${model3}`);

  return output;
}

// ═══════════════════════════════════════════════════
// LEGACY EXPORT
// ═══════════════════════════════════════════════════

/**
 * @deprecated Use generateVisualization() + assembleHTML()
 */
export async function generateHTML(
  compactPrompt:  string,
  creativeScene:  CreativeScene,
  technicalSpec:  TechnicalSpec,
  analysis:       AnalysisResult
): Promise<string> {
  const { assembleHTML } = await import('@/lib/visualizer/assembler');
  const aiOutput = await generateVisualization(
    compactPrompt,
    creativeScene,
    technicalSpec,
    analysis
  );
  return assembleHTML(aiOutput, analysis);
}