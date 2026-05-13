// lib/ai/prompt-generator.ts

import OpenAI from "openai";
import Groq from "groq-sdk";
import { AnalysisResult, CreativeScene, TechnicalSpec } from "@/types";
import {
  buildCreativePrompt,
  buildTechnicalPrompt,
  combineFullPrompt,
  combineCompactPrompt,
} from "@/lib/ai/prompts";
import {
  runModelChain,
  getOpenRouterKey,
  getGroqKey,
  MODELS,
  OPENROUTER_HEADERS,
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
// JSON PARSER HELPER
// ═══════════════════════════════════════════════════

function parseJSONResponse<T>(text: string, label: string): T {
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty response from ${label}`);
  }

  // Strip thinking tags
  let clean = text.trim();
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  // Direct parse
  try {
    return JSON.parse(clean) as T;
  } catch {
    // Extract first { to last }
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
    throw new Error(`No valid JSON object found in ${label} response`);
  }
}

// ═══════════════════════════════════════════════════
// CLIENT HELPERS
// ═══════════════════════════════════════════════════

function getOpenRouterClient(): OpenAI {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey:  getOpenRouterKey(),
    defaultHeaders: OPENROUTER_HEADERS,
  });
}

function getGroqClient(): Groq {
  return new Groq({ apiKey: getGroqKey() });
}

// ═══════════════════════════════════════════════════
// GENERIC OPENROUTER CALLER
// ═══════════════════════════════════════════════════

async function callOpenRouter<T>(
  model:        string,
  systemPrompt: string,
  userPrompt:   string,
  maxTokens:    number,
  temperature:  number,
  label:        string
): Promise<T> {
  const client = getOpenRouterClient();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    max_tokens:  maxTokens,
    temperature,
  });

  const text = completion.choices[0]?.message?.content;
  return parseJSONResponse<T>(text || '', label);
}

// ═══════════════════════════════════════════════════
// GENERIC GROQ CALLER
// ═══════════════════════════════════════════════════

async function callGroq<T>(
  systemPrompt: string,
  userPrompt:   string,
  maxTokens:    number,
  temperature:  number,
  label:        string
): Promise<T> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    temperature,
    max_tokens:      maxTokens,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content;
  return parseJSONResponse<T>(text || '', label);
}

// ═══════════════════════════════════════════════════
// CREATIVE SCENE VALIDATORS
// ═══════════════════════════════════════════════════

function validateCreativeScene(scene: CreativeScene): void {
  if (!scene) throw new Error('Creative scene is null/undefined');

  if (!scene.metaphor)  throw new Error('Creative scene missing metaphor');
  if (!scene.sceneName) throw new Error('Creative scene missing sceneName');

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
      { stepType: 'initialize', visual: 'elements appear',    animation: 'fadeInScale' },
      { stepType: 'compare',    visual: 'elements highlight',  animation: 'glowPulse'  },
      { stepType: 'swap',       visual: 'elements exchange',   animation: 'moveArc'    },
      { stepType: 'complete',   visual: 'celebration',         animation: 'confettiBurst' },
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

  // Template type
  const validTemplates = ['array','graph','tree','dp','stackqueue','recursion'];
  if (!spec.templateType || !validTemplates.includes(spec.templateType)) {
    console.warn(`[PromptGen] Invalid templateType "${spec.templateType}", defaulting to array`);
    spec.templateType = 'array';
  }

  // Layout rules
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

  // Animation mapping
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

  // Base interval
  if (
    !spec.baseInterval ||
    typeof spec.baseInterval !== 'number' ||
    spec.baseInterval < 300 ||
    spec.baseInterval > 5000
  ) {
    spec.baseInterval = 1200;
  }
}

// ═══════════════════════════════════════════════════
// CREATIVE MODEL CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildCreativeChain(analysis: AnalysisResult): ModelFn<CreativeScene>[] {
  const systemPrompt = 'You are a creative visual director. Return ONLY valid JSON. No explanation, no markdown, no thinking tags.';
  const userPrompt   = buildCreativePrompt(analysis);

  return [
    // 1. Llama 3.3 70B Instruct (best for creative)
    {
      name: 'Llama 3.3 Instruct',
      fn: () => callOpenRouter<CreativeScene>(
        MODELS.openrouter.llama70BInstruct,
        systemPrompt,
        userPrompt,
        3000,
        0.7,
        'Llama creative'
      ).then(scene => { validateCreativeScene(scene); return scene; }),
    },

    // 2. GPT-OSS 120B (strong backup)
    {
      name: 'GPT-OSS 120B',
      fn: () => callOpenRouter<CreativeScene>(
        MODELS.openrouter.gptOSS120B,
        systemPrompt,
        userPrompt,
        3000,
        0.7,
        'GPT-OSS creative'
      ).then(scene => { validateCreativeScene(scene); return scene; }),
    },

    // 3. Gemma 31B (creative fallback)
    {
      name: 'Gemma 31B',
      fn: () => callOpenRouter<CreativeScene>(
        MODELS.openrouter.gemma31B,
        systemPrompt,
        userPrompt,
        3000,
        0.7,
        'Gemma creative'
      ).then(scene => { validateCreativeScene(scene); return scene; }),
    },

    // 4. Groq Llama (final fallback)
    {
      name: 'Groq Llama',
      fn: () => callGroq<CreativeScene>(
        systemPrompt,
        userPrompt,
        3000,
        0.7,
        'Groq creative'
      ).then(scene => { validateCreativeScene(scene); return scene; }),
    },
  ];
}

// ═══════════════════════════════════════════════════
// TECHNICAL MODEL CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildTechnicalChain(analysis: AnalysisResult): ModelFn<TechnicalSpec>[] {
  const systemPrompt = 'You are a technical architect for visualizations. Return ONLY valid JSON. No explanation, no markdown, no thinking tags.';
  const userPrompt   = buildTechnicalPrompt(analysis);

  return [
    // 1. Qwen Coder (best for technical/coding specs)
    {
      name: 'Qwen Coder',
      fn: () => callOpenRouter<TechnicalSpec>(
        MODELS.openrouter.qwenCoder,
        systemPrompt,
        userPrompt,
        2000,
        0.2,
        'Qwen technical'
      ).then(spec => { validateTechnicalSpec(spec); return spec; }),
    },

    // 2. Llama 3.3 Instruct (reliable fallback)
    {
      name: 'Llama 3.3 Instruct',
      fn: () => callOpenRouter<TechnicalSpec>(
        MODELS.openrouter.llama70BInstruct,
        systemPrompt,
        userPrompt,
        2000,
        0.2,
        'Llama technical'
      ).then(spec => { validateTechnicalSpec(spec); return spec; }),
    },

    // 3. GPT-OSS 20B (lightweight backup)
    {
      name: 'GPT-OSS 20B',
      fn: () => callOpenRouter<TechnicalSpec>(
        MODELS.openrouter.gptOSS20B,
        systemPrompt,
        userPrompt,
        2000,
        0.2,
        'GPT-OSS-20B technical'
      ).then(spec => { validateTechnicalSpec(spec); return spec; }),
    },

    // 4. Groq Llama (final fallback)
    {
      name: 'Groq Llama',
      fn: () => callGroq<TechnicalSpec>(
        systemPrompt,
        userPrompt,
        2000,
        0.2,
        'Groq technical'
      ).then(spec => { validateTechnicalSpec(spec); return spec; }),
    },
  ];
}

// ═══════════════════════════════════════════════════
// RETRY CONFIG FOR PROMPT GENERATION
// ═══════════════════════════════════════════════════

const PROMPT_RETRY_CONFIG = {
  maxRetries:  2,
  baseDelayMs: 1200,
  maxDelayMs:  10000,
  jitterMs:    300,
};

// ═══════════════════════════════════════════════════
// MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════

/**
 * generatePrompt(analysis)
 *
 * Orchestrates creative + technical chunk generation.
 * Runs both chunks in PARALLEL for speed.
 * Combines using backend functions (no extra AI call).
 *
 * Creative chain:
 *   1. OpenRouter Llama 3.3 70B Instruct
 *   2. OpenRouter GPT-OSS 120B
 *   3. OpenRouter Gemma 31B
 *   4. Groq Llama 3.3 70B
 *
 * Technical chain:
 *   1. OpenRouter Qwen Coder
 *   2. OpenRouter Llama 3.3 70B Instruct
 *   3. OpenRouter GPT-OSS 20B
 *   4. Groq Llama 3.3 70B
 *
 * @param analysis  Validated AnalysisResult from analyzer
 * @returns         PromptGeneratorResult with all prompt artifacts
 */
export async function generatePrompt(
  analysis: AnalysisResult
): Promise<PromptGeneratorResult> {
  console.log('[PromptGen] Starting prompt generation for:', analysis.algorithmName);

  // Build model chains
  const creativeChain  = buildCreativeChain(analysis);
  const technicalChain = buildTechnicalChain(analysis);

  // ── Run creative + technical in PARALLEL ──────────
  const [creativeResult, technicalResult] = await Promise.all([
    runModelChain(creativeChain,  PROMPT_RETRY_CONFIG, 'Creative'),
    runModelChain(technicalChain, PROMPT_RETRY_CONFIG, 'Technical'),
  ]);

  const creativeScene = creativeResult.result;
  const technicalSpec = technicalResult.result;

  // ── Combine using backend functions (no AI) ───────
  console.log('[PromptGen] Combining chunks...');

  const fullPrompt    = combineFullPrompt(analysis, creativeScene, technicalSpec);
  const compactPrompt = combineCompactPrompt(analysis, creativeScene, technicalSpec);

  console.log('[PromptGen] ✅ Prompt generation complete');
  console.log(`[PromptGen] Creative via: ${creativeResult.model}`);
  console.log(`[PromptGen] Technical via: ${technicalResult.model}`);
  console.log(`[PromptGen] Template type: ${technicalSpec.templateType}`);
  console.log(`[PromptGen] Metaphor: ${creativeScene.metaphor}`);
  console.log(`[PromptGen] Scene: ${creativeScene.sceneName}`);
  console.log(`[PromptGen] Full prompt length: ${fullPrompt.length}`);
  console.log(`[PromptGen] Compact prompt length: ${compactPrompt.length}`);

  return {
    creativeScene,
    technicalSpec,
    fullPrompt,
    compactPrompt,
  };
}