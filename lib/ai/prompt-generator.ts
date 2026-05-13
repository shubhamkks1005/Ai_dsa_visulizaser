// lib/ai/prompt-generator.ts

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { AnalysisResult, CreativeScene, TechnicalSpec } from "@/types";
import {
  buildCreativePrompt,
  buildTechnicalPrompt,
  combineFullPrompt,
  combineCompactPrompt,
} from "@/lib/ai/prompts";
import {
  callWithGeminiRotation,
  runModelChain,
  getGroqKey,
  MODELS,
  GeminiKeyRotator,
  GEMINI_RETRY_CONFIG,
  GROQ_RETRY_CONFIG,
  type ModelFn,
} from "@/lib/ai/ai-utils";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface PromptGeneratorResult {
  creativeScene:  CreativeScene;
  technicalSpec:  TechnicalSpec;
  fullPrompt:     string;
  compactPrompt:  string;
}

// ═══════════════════════════════════════════════════
// JSON PARSER
// ═══════════════════════════════════════════════════

function parseJSONResponse<T>(text: string, label: string): T {
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty response from ${label}`);
  }

  let clean = text.trim();
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

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
          `Failed to parse ${label} JSON: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
    throw new Error(`No valid JSON found in ${label} response`);
  }
}

// ═══════════════════════════════════════════════════
// GEMINI CALLER — Generic
// ═══════════════════════════════════════════════════

async function callGemini<T>(
  modelName:    string,
  systemPrompt: string,
  userPrompt:   string,
  label:        string
): Promise<T> {
  return callWithGeminiRotation(modelName, async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await ai.models.generateContent({
      model:    modelName,
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error(`Empty response from Gemini ${modelName}`);
    }

    return parseJSONResponse<T>(text, label);
  }, GEMINI_RETRY_CONFIG);
}

// ═══════════════════════════════════════════════════
// GROQ CALLER — Generic
// ═══════════════════════════════════════════════════

async function callGroq<T>(
  systemPrompt: string,
  userPrompt:   string,
  maxTokens:    number,
  label:        string
): Promise<T> {
  const groq = new Groq({ apiKey: getGroqKey() });

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature:     0.5,
    max_tokens:      maxTokens,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content;
  return parseJSONResponse<T>(text || '', label);
}

// ═══════════════════════════════════════════════════
// CREATIVE SCENE VALIDATOR
// ═══════════════════════════════════════════════════

function validateCreativeScene(scene: CreativeScene): void {
  if (!scene) throw new Error('Creative scene is null/undefined');
  if (!scene.metaphor)  throw new Error('Missing metaphor');
  if (!scene.sceneName) throw new Error('Missing sceneName');

  // Hero character
  if (!scene.heroCharacter) {
    scene.heroCharacter = {
      type:          'explorer',
      look:          '🔍 curious explorer',
      idleAnimation: 'gentle breathing',
      moveAnimation: 'smooth glide',
    };
  } else {
    scene.heroCharacter.type          = scene.heroCharacter.type          || 'explorer';
    scene.heroCharacter.look          = scene.heroCharacter.look          || '🔍 explorer';
    scene.heroCharacter.idleAnimation = scene.heroCharacter.idleAnimation || 'breathing';
    scene.heroCharacter.moveAnimation = scene.heroCharacter.moveAnimation || 'smooth move';
  }

  // Environment
  if (!scene.environment) {
    scene.environment = {
      setting:          'Dark algorithmic space',
      backgroundLayers: ['deep space', 'grid lines', 'floating elements'],
      ambientEffects:   ['subtle glow', 'particle drift'],
    };
  } else {
    if (!Array.isArray(scene.environment.backgroundLayers)) {
      scene.environment.backgroundLayers = ['background', 'midground', 'foreground'];
    }
    if (!Array.isArray(scene.environment.ambientEffects)) {
      scene.environment.ambientEffects = ['ambient glow'];
    }
  }

  // Object mapping
  if (!scene.objectMapping || typeof scene.objectMapping !== 'object') {
    scene.objectMapping = { 'array elements': 'glowing bars' };
  }

  // Color palette
  if (!scene.colorPalette) {
    scene.colorPalette = {
      primary:    '#63b3ed',
      secondary:  '#9f7aea',
      accent:     '#68d391',
      danger:     '#fc8181',
      background: '#0d1117',
    };
  } else {
    scene.colorPalette.primary    = scene.colorPalette.primary    || '#63b3ed';
    scene.colorPalette.secondary  = scene.colorPalette.secondary  || '#9f7aea';
    scene.colorPalette.accent     = scene.colorPalette.accent     || '#68d391';
    scene.colorPalette.danger     = scene.colorPalette.danger     || '#fc8181';
    scene.colorPalette.background = scene.colorPalette.background || '#0d1117';
  }

  // Step to scene mapping
  if (!Array.isArray(scene.stepToSceneMapping)) {
    scene.stepToSceneMapping = [
      { stepType: 'initialize', visual: 'elements appear',   animation: 'fadeInScale'    },
      { stepType: 'compare',    visual: 'elements highlight', animation: 'glowPulse'      },
      { stepType: 'swap',       visual: 'elements exchange',  animation: 'moveArc'        },
      { stepType: 'complete',   visual: 'celebration',        animation: 'confettiBurst'  },
    ];
  }

  // Dramatic moments
  if (!Array.isArray(scene.dramaticMoments) || scene.dramaticMoments.length === 0) {
    scene.dramaticMoments = [
      'First operation begins',
      'Halfway through',
      'Critical moment',
      'Final completion',
    ];
  }

  // Non-negotiable requirements
  if (
    !Array.isArray(scene.nonNegotiableVisualRequirements) ||
    scene.nonNegotiableVisualRequirements.length === 0
  ) {
    scene.nonNegotiableVisualRequirements = [
      'Hero character must be visible and animated',
      'Background environment must match the metaphor',
      'Each step must show a clear visual change',
      'Completion must trigger celebration animation',
    ];
  }
}

// ═══════════════════════════════════════════════════
// TECHNICAL SPEC VALIDATOR
// ═══════════════════════════════════════════════════

function validateTechnicalSpec(spec: TechnicalSpec): void {
  if (!spec) throw new Error('Technical spec is null/undefined');

  const validTemplates = ['array','graph','tree','dp','stackqueue','recursion'];
  if (!spec.templateType || !validTemplates.includes(spec.templateType)) {
    console.warn(`[PromptGen] Invalid templateType "${spec.templateType}", defaulting to array`);
    spec.templateType = 'array';
  }

  if (!spec.layoutRules) {
    spec.layoutRules = {
      mainScene: 'centered elements with equal spacing',
      statsBar:  [
        { key: 'comparisons', label: 'Comparisons', side: 'left'  },
        { key: 'swaps',       label: 'Swaps',       side: 'left'  },
        { key: 'currentStep', label: 'Step',        side: 'right' },
      ],
      sidePanel: 'current variable values',
    };
  } else {
    if (!spec.layoutRules.mainScene) {
      spec.layoutRules.mainScene = 'centered elements';
    }
    if (!Array.isArray(spec.layoutRules.statsBar)) {
      spec.layoutRules.statsBar = [
        { key: 'comparisons', label: 'Comparisons', side: 'left'  },
        { key: 'currentStep', label: 'Step',        side: 'right' },
      ];
    }
    if (!spec.layoutRules.sidePanel) {
      spec.layoutRules.sidePanel = 'variable values';
    }
  }

  if (!spec.animationMapping || typeof spec.animationMapping !== 'object') {
    spec.animationMapping = {
      initialize: 'stagger + fadeInScale',
      compare:    'highlight + glowPulse',
      swap:       'moveArc + splashBurst',
      update:     'valueChange + glowFlash',
      found:      'dramaticText + confettiBurst',
      complete:   'celebrationWave + victoryBurst',
    };
  } else {
    if (!spec.animationMapping.initialize) {
      spec.animationMapping.initialize = 'stagger + fadeInScale';
    }
    if (!spec.animationMapping.complete) {
      spec.animationMapping.complete = 'celebrationWave + victoryBurst';
    }
  }

  if (
    !spec.baseInterval ||
    typeof spec.baseInterval !== 'number' ||
    spec.baseInterval < 300  ||
    spec.baseInterval > 5000
  ) {
    spec.baseInterval = 1200;
  }
}

// ═══════════════════════════════════════════════════
// CREATIVE CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildCreativeChain(analysis: AnalysisResult): ModelFn<CreativeScene>[] {
  const systemPrompt =
    'You are a creative visual director for algorithm animations. ' +
    'Return ONLY valid JSON. No explanation, no markdown.';
  const userPrompt = buildCreativePrompt(analysis);

  return [
    // 1. Gemini Pro — best creativity
    {
      name: 'Gemini Pro (Creative)',
      fn: async () => {
        const scene = await callGemini<CreativeScene>(
          MODELS.gemini.pro,
          systemPrompt,
          userPrompt,
          'Gemini Pro creative'
        );
        validateCreativeScene(scene);
        return scene;
      },
    },

    // 2. Gemini Flash — fast fallback
    {
      name: 'Gemini Flash (Creative)',
      fn: async () => {
        const scene = await callGemini<CreativeScene>(
          MODELS.gemini.flash,
          systemPrompt,
          userPrompt,
          'Gemini Flash creative'
        );
        validateCreativeScene(scene);
        return scene;
      },
    },

    // 3. Groq — last resort
    {
      name: 'Groq (Creative)',
      fn: async () => {
        const scene = await callGroq<CreativeScene>(
          systemPrompt,
          userPrompt,
          3000,
          'Groq creative'
        );
        validateCreativeScene(scene);
        return scene;
      },
    },
  ];
}

// ═══════════════════════════════════════════════════
// TECHNICAL CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildTechnicalChain(analysis: AnalysisResult): ModelFn<TechnicalSpec>[] {
  const systemPrompt =
    'You are a technical architect for algorithm visualizations. ' +
    'Return ONLY valid JSON. No explanation, no markdown.';
  const userPrompt = buildTechnicalPrompt(analysis);

  return [
    // 1. Gemini Flash — fast + accurate for technical
    {
      name: 'Gemini Flash (Technical)',
      fn: async () => {
        const spec = await callGemini<TechnicalSpec>(
          MODELS.gemini.flash,
          systemPrompt,
          userPrompt,
          'Gemini Flash technical'
        );
        validateTechnicalSpec(spec);
        return spec;
      },
    },

    // 2. Gemini Flash Lite — cheaper fallback
    {
      name: 'Gemini Flash Lite (Technical)',
      fn: async () => {
        const spec = await callGemini<TechnicalSpec>(
          MODELS.gemini.flashLite,
          systemPrompt,
          userPrompt,
          'Gemini Flash Lite technical'
        );
        validateTechnicalSpec(spec);
        return spec;
      },
    },

    // 3. Groq — last resort
    {
      name: 'Groq (Technical)',
      fn: async () => {
        const spec = await callGroq<TechnicalSpec>(
          systemPrompt,
          userPrompt,
          2000,
          'Groq technical'
        );
        validateTechnicalSpec(spec);
        return spec;
      },
    },
  ];
}

// ═══════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════

/**
 * generatePrompt(analysis)
 *
 * Creative chain:  Gemini Pro → Gemini Flash → Groq
 * Technical chain: Gemini Flash → Gemini Flash Lite → Groq
 *
 * NOTE: Sequential (not parallel) to avoid rate limit spikes.
 */
export async function generatePrompt(
  analysis: AnalysisResult
): Promise<PromptGeneratorResult> {
  console.log('[PromptGen] Starting for:', analysis.algorithmName);

  // ── Creative first ────────────────────────────────
  const creativeChain = buildCreativeChain(analysis);
  const creativeResult = await runModelChain(
    creativeChain,
    GEMINI_RETRY_CONFIG,
    'Creative'
  );
  const creativeScene = creativeResult.result;

  // ── Technical second (sequential to avoid rate spike) ──
  const technicalChain = buildTechnicalChain(analysis);
  const technicalResult = await runModelChain(
    technicalChain,
    GEMINI_RETRY_CONFIG,
    'Technical'
  );
  const technicalSpec = technicalResult.result;

  // ── Combine ───────────────────────────────────────
  console.log('[PromptGen] Combining chunks...');

  const fullPrompt    = combineFullPrompt(analysis, creativeScene, technicalSpec);
  const compactPrompt = combineCompactPrompt(analysis, creativeScene, technicalSpec);

  console.log('[PromptGen] ✅ Complete');
  console.log(`[PromptGen] Creative via:  ${creativeResult.model}`);
  console.log(`[PromptGen] Technical via: ${technicalResult.model}`);
  console.log(`[PromptGen] Template:      ${technicalSpec.templateType}`);
  console.log(`[PromptGen] Metaphor:      ${creativeScene.metaphor}`);
  console.log(`[PromptGen] Scene:         ${creativeScene.sceneName}`);

  return {
    creativeScene,
    technicalSpec,
    fullPrompt,
    compactPrompt,
  };
}