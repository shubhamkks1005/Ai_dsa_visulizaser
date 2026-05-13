// lib/ai/generator.ts

import OpenAI from "openai";
import Groq from "groq-sdk";
import { AnalysisResult, CreativeScene, TechnicalSpec } from "@/types";
import { AIVisualizationOutput, TemplateType } from "@/lib/visualizer/assembler";
import {
  runModelChain,
  getOpenRouterKey,
  getGroqKey,
  MODELS,
  OPENROUTER_HEADERS,
  type ModelFn,
} from "@/lib/ai/ai-utils";

export type { CreativeScene, TechnicalSpec };

// ═══════════════════════════════════════════════════
// JSON PARSER
// ═══════════════════════════════════════════════════

function parseAIOutput(text: string, modelName: string): AIVisualizationOutput {
  if (!text || text.trim().length === 0) {
    throw new Error(`Empty response from ${modelName}`);
  }

  let clean = text.trim();

  // Strip <think>...</think> blocks
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  clean = clean
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Fix common JSON escaping issues from AI models
  // Replace actual newlines inside string values with \\n
  clean = fixJSONEscaping(clean);

  // Direct parse
  try {
    return JSON.parse(clean) as AIVisualizationOutput;
  } catch {
    // Extract first { to last }
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(clean.slice(start, end + 1)) as AIVisualizationOutput;
      } catch (e) {
        throw new Error(
          `Failed to parse ${modelName} output JSON: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
    throw new Error(`No valid JSON object found in ${modelName} response`);
  }
}

/**
 * fixJSONEscaping(text)
 * Fixes common JSON escaping issues from AI models.
 * AI often puts real newlines/tabs inside JSON string values
 * which breaks JSON.parse.
 */
function fixJSONEscaping(text: string): string {
  // Strategy: Find string values and escape unescaped control chars
  // This is tricky — we do a simple approach:
  // Replace literal \n \t \r inside JSON string values

  try {
    // Try parsing first — if it works, no fix needed
    JSON.parse(text);
    return text;
  } catch {
    // Fix: replace unescaped newlines inside string values
    // We do this by processing character by character
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
        // Replace problematic control characters
        if (ch === '\n')      { result += '\\n';  continue; }
        if (ch === '\r')      { result += '\\r';  continue; }
        if (ch === '\t')      { result += '\\t';  continue; }
        // Replace other control chars
        const code = ch.charCodeAt(0);
        if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
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
// VALIDATOR
// ═══════════════════════════════════════════════════

function validateAIOutput(output: AIVisualizationOutput, modelName: string): string[] {
  const issues: string[] = [];

  if (!output) {
    issues.push('Output is null/undefined');
    return issues;
  }

  const validTemplates = ['array','graph','tree','dp','stackqueue','recursion'];
  if (!output.templateType || !validTemplates.includes(output.templateType)) {
    issues.push(`Invalid templateType: "${output.templateType}"`);
  }

  if (!output.sceneScript || output.sceneScript.trim().length < 100) {
    issues.push('Missing or too-short sceneScript');
  } else {
    if (!output.sceneScript.includes('window.STEPS') &&
        !output.sceneScript.includes('STEPS')) {
      issues.push('sceneScript missing STEPS definition');
    }
    if (!output.sceneScript.includes('renderScene')) {
      issues.push('sceneScript missing renderScene function');
    }
    if (!output.sceneScript.includes('initVisualization')) {
      issues.push('sceneScript missing initVisualization call');
    }
  }

  if (!output.customCSS || output.customCSS.trim().length < 10) {
    issues.push('Missing or empty customCSS');
  }

  if (issues.length > 0) {
    console.warn(`[Generator] ${modelName} output issues:`, issues);
  }

  return issues;
}

// ═══════════════════════════════════════════════════
// NORMALIZER
// ═══════════════════════════════════════════════════

function normalizeAIOutput(
  output:        AIVisualizationOutput,
  analysis:      AnalysisResult,
  technicalSpec: TechnicalSpec
): AIVisualizationOutput {

  // Fix templateType
  const validTemplates: TemplateType[] = [
    'array','graph','tree','dp','stackqueue','recursion'
  ];
  if (!validTemplates.includes(output.templateType as TemplateType)) {
    output.templateType = (technicalSpec.templateType as TemplateType) || 'array';
  }

  // Fix missing fields
  if (!output.sceneHTML)  output.sceneHTML  = '';
  if (!output.customCSS) {
    output.customCSS = `/* ${analysis.algorithmName} — minimal fallback styles */
#scene-content { display: flex; align-items: center; justify-content: center; }`;
  }

  // Fix missing sceneConfig
  if (!output.sceneConfig) {
    output.sceneConfig = {
      algorithmName:   analysis.algorithmName,
      timeComplexity:  analysis.timeComplexity,
      spaceComplexity: analysis.spaceComplexity || '',
      stats: [
        { key: 'comparisons', label: 'Comparisons', value: 0, side: 'left'  },
        { key: 'swaps',       label: 'Swaps',       value: 0, side: 'left'  },
        { key: 'currentStep', label: 'Step',        value: 0, side: 'right' },
      ],
      boldKeywords:  [],
      baseInterval:  technicalSpec.baseInterval || 1200,
    };
  }

  // Clean sceneScript
  if (output.sceneScript) {
    output.sceneScript = output.sceneScript
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/^```(?:javascript|js)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  }

  // Clean customCSS
  if (output.customCSS) {
    output.customCSS = output.customCSS
      .replace(/^<style[^>]*>\s*/i, '')
      .replace(/\s*<\/style>$/i, '')
      .trim();
  }

  // Clean sceneHTML
  if (output.sceneHTML) {
    output.sceneHTML = output.sceneHTML
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim();
  }

  return output;
}

// ═══════════════════════════════════════════════════
// SYSTEM PROMPT BUILDER
// ═══════════════════════════════════════════════════

function buildGeneratorSystemPrompt(): string {
  return `You are an expert algorithm visualization coder.

Your job is to generate the algorithm-specific parts of a visualization system.
The base framework (shell, controls, animations, engines) is already built.
You only generate the algorithm-specific JSON payload.

CRITICAL OUTPUT RULES:
1. Return ONLY a valid JSON object
2. No text before the JSON
3. No text after the JSON
4. No markdown code fences
5. No explanations
6. No <think> tags in output
7. The JSON must have exactly these fields:
   - templateType (string)
   - customCSS (string — all CSS as a single string, use \\n for newlines)
   - sceneHTML (string — extra HTML elements as a single string)
   - sceneScript (string — complete JavaScript as a single string, use \\n for newlines)
   - sceneConfig (object)

IMPORTANT for string fields:
- customCSS, sceneHTML, sceneScript are STRING values in JSON
- You MUST escape newlines as \\n inside these strings
- You MUST escape quotes as \\" inside these strings
- Do NOT put actual line breaks inside JSON string values`;
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
// GENERIC OPENROUTER GENERATOR CALLER
// ═══════════════════════════════════════════════════

async function callOpenRouterGenerator(
  model:         string,
  compactPrompt: string,
  modelName:     string
): Promise<AIVisualizationOutput> {
  const client = getOpenRouterClient();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildGeneratorSystemPrompt() },
      { role: 'user',   content: compactPrompt },
    ],
    max_tokens:  7500,
    temperature: 0.2,
  });

  const text   = completion.choices[0]?.message?.content;
  const output = parseAIOutput(text || '', modelName);

  const issues = validateAIOutput(output, modelName);
  if (issues.length > 2) {
    throw new Error(`${modelName} output has ${issues.length} critical issues: ${issues.join(', ')}`);
  }

  return output;
}

// ═══════════════════════════════════════════════════
// GROQ GENERATOR CALLER
// ═══════════════════════════════════════════════════

async function callGroqGenerator(
  compactPrompt: string
): Promise<AIVisualizationOutput> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: buildGeneratorSystemPrompt() },
      { role: 'user',   content: compactPrompt },
    ],
    temperature: 0.2,
    max_tokens:  7500,
  });

  const text   = completion.choices[0]?.message?.content;
  const output = parseAIOutput(text || '', 'Groq Llama');

  const issues = validateAIOutput(output, 'Groq Llama');
  if (issues.length > 2) {
    throw new Error(`Groq output has ${issues.length} critical issues: ${issues.join(', ')}`);
  }

  return output;
}

// ═══════════════════════════════════════════════════
// GENERATOR MODEL CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildGeneratorChain(compactPrompt: string): ModelFn<AIVisualizationOutput>[] {
  return [
    // 1. Qwen Coder (best free coding model)
    {
      name: 'Qwen Coder',
      fn: () => callOpenRouterGenerator(
        MODELS.openrouter.qwenCoder,
        compactPrompt,
        'Qwen Coder'
      ),
    },

    // 2. GPT-OSS 120B (strong backup)
    {
      name: 'GPT-OSS 120B',
      fn: () => callOpenRouterGenerator(
        MODELS.openrouter.gptOSS120B,
        compactPrompt,
        'GPT-OSS 120B'
      ),
    },

    // 3. Llama 3.3 Instruct (reliable fallback)
    {
      name: 'Llama 3.3 Instruct',
      fn: () => callOpenRouterGenerator(
        MODELS.openrouter.llama70BInstruct,
        compactPrompt,
        'Llama 3.3 Instruct'
      ),
    },

    // 4. Groq Llama (last resort)
    {
      name: 'Groq Llama',
      fn: () => callGroqGenerator(compactPrompt),
    },
  ];
}

// ═══════════════════════════════════════════════════
// GENERATOR RETRY CONFIG
// ═══════════════════════════════════════════════════

const GENERATOR_RETRY_CONFIG = {
  maxRetries:  2,
  baseDelayMs: 2000,
  maxDelayMs:  15000,
  jitterMs:    500,
};

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

/**
 * generateVisualization(compactPrompt, creativeScene, technicalSpec, analysis)
 *
 * Generates AIVisualizationOutput JSON using AI models.
 * This output is then passed to assembler.ts to create final HTML.
 *
 * Model chain:
 *   1. Qwen Coder         (OpenRouter) — best free coding model
 *   2. GPT-OSS 120B       (OpenRouter) — strong fallback
 *   3. Llama 3.3 Instruct (OpenRouter) — reliable fallback
 *   4. Groq Llama 3.3 70B              — last resort
 *
 * @param compactPrompt  Token-safe prompt from combineCompactPrompt()
 * @param creativeScene  Creative chunk from generatePrompt()
 * @param technicalSpec  Technical chunk from generatePrompt()
 * @param analysis       Full analysis result
 * @returns              AIVisualizationOutput ready for assembler
 */
export async function generateVisualization(
  compactPrompt:  string,
  creativeScene:  CreativeScene,
  technicalSpec:  TechnicalSpec,
  analysis:       AnalysisResult
): Promise<AIVisualizationOutput> {

  console.log('[Generator] Starting visualization generation...');
  console.log('[Generator] Algorithm:', analysis.algorithmName);
  console.log('[Generator] Template:', technicalSpec.templateType);
  console.log('[Generator] Scene:', creativeScene.sceneName);

  // Build model chain
  const chain = buildGeneratorChain(compactPrompt);

  // Run chain with backoff
  const { result, model } = await runModelChain(
    chain,
    GENERATOR_RETRY_CONFIG,
    'Generator'
  );

  // Normalize output
  const normalized = normalizeAIOutput(result, analysis, technicalSpec);

  console.log(`[Generator] ✅ Generation complete via ${model}`);
  console.log(`[Generator] Template: ${normalized.templateType}`);
  console.log(`[Generator] CSS length: ${normalized.customCSS?.length ?? 0}`);
  console.log(`[Generator] Script length: ${normalized.sceneScript?.length ?? 0}`);
  console.log(`[Generator] HTML length: ${normalized.sceneHTML?.length ?? 0}`);

  return normalized;
}

// ═══════════════════════════════════════════════════
// LEGACY EXPORT (backwards compatibility)
// ═══════════════════════════════════════════════════

/**
 * @deprecated Use generateVisualization() + assembleHTML() instead
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