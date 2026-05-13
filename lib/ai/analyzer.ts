// lib/ai/analyzer.ts

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { AnalysisResult } from "@/types";
import {
  callWithGeminiRotation,
  runModelChain,
  getGroqKey,
  getOpenRouterKey,
  MODELS,
  OPENROUTER_HEADERS,
  GeminiKeyRotator,
  type ModelFn,
} from "@/lib/ai/ai-utils";

// ═══════════════════════════════════════════════════
// ANALYZER PROMPT
// ═══════════════════════════════════════════════════

function buildAnalyzerPrompt(code: string, language: string): string {
  return `You are an expert algorithm analyzer. Analyze the following ${language} code and return a structured JSON response.

CODE:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown, no explanation). Follow this EXACT structure:

{
  "algorithmName": "Exact algorithm name (e.g., Bubble Sort, Frog Jump, Trapping Rain Water)",
  "category": "One of: Sorting / Graph / DP / Two Pointers / Divide & Conquer / Tree / Linked List / Stack / Queue / Binary Search / Greedy / Backtracking / Recursion / String / Math / Other",
  "language": "${language}",
  "description": "Clear 2-sentence plain English description with real-world analogy",
  "variables": [
    { "name": "varName", "meaning": "what this variable represents" }
  ],
  "dataStructures": ["array", "stack", "queue", "tree", "graph", "hash map", "linked list"],
  "steps": [
    {
      "step": 1,
      "description": "Technical description of what code does at this step",
      "caption": "Human-friendly conversational explanation (e.g. The frog jumps to stone 3)",
      "variables": { "var1": "val1", "var2": "val2" },
      "highlight": [0, 1],
      "action": "initialize / compare / swap / update / push / pop / insert / delete / merge / split / return / found / backtrack / visit / enqueue / dequeue",
      "important": false,
      "timingMult": 1.0
    }
  ],
  "timeComplexity": "O(...) with short explanation",
  "spaceComplexity": "O(...) with short explanation",
  "inputExample": "The exact input used when tracing — e.g. [10, 20, 30, 5] or heights=[3,0,2,1,4]",
  "expectedOutput": "Expected output for the given input",
  "keyInsight": "One sentence explaining WHY this algorithm works",
  "physicalInterpretation": "Real-world physical metaphor a 5-year-old could understand. Be vivid and specific. Example: A frog jumping across stepping stones choosing the cheapest path",
  "edgeCases": ["Empty input", "Single element", "Already sorted", "etc"]
}

CRITICAL RULES:
1. Trace through the code step-by-step mentally with a CONCRETE input example.
2. Every individual comparison, swap, assignment, push, pop = a SEPARATE step.
3. Do NOT combine multiple distinct operations into one step.
4. Minimum 8 steps for non-trivial code. Aim for 12-20 steps.
5. variables map MUST show ALL variable values at that exact moment.
6. caption MUST be conversational and vivid:
   GOOD: "The frog leaps from stone 2 to stone 5 — cost is 3"
   BAD:  "arr[2] accessed, dp[5] = min(dp[5], dp[2] + cost[2])"
7. Mark first step, last step, and key operations as important: true
8. Set timingMult: 0.5 for important steps (slow down), 1.5 for trivial steps (speed up)
9. physicalInterpretation MUST be vivid and metaphor-rich — this drives the visual theme.
10. Output ONLY the JSON object. Nothing else. No markdown.`;
}

// ═══════════════════════════════════════════════════
// JSON PARSER
// ═══════════════════════════════════════════════════

function parseAnalysisJSON(text: string): AnalysisResult {
  // Strip thinking tags
  let clean = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = fenceMatch ? fenceMatch[1].trim() : clean;

  // Direct parse
  try {
    return JSON.parse(jsonString);
  } catch {
    // Extract first { to last }
    const start = jsonString.indexOf('{');
    const end   = jsonString.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(jsonString.slice(start, end + 1));
      } catch {
        throw new Error('Failed to parse analysis JSON — invalid structure');
      }
    }
    throw new Error('Failed to parse analysis JSON — no JSON object found');
  }
}

// ═══════════════════════════════════════════════════
// VALIDATION + NORMALIZATION
// ═══════════════════════════════════════════════════

function validateAnalysis(analysis: AnalysisResult): void {

  // Required fields
  if (!analysis.algorithmName || typeof analysis.algorithmName !== 'string') {
    throw new Error('Invalid analysis: missing algorithmName');
  }

  if (!analysis.category || typeof analysis.category !== 'string') {
    throw new Error('Invalid analysis: missing category');
  }

  if (!Array.isArray(analysis.steps) || analysis.steps.length === 0) {
    throw new Error('Invalid analysis: missing or empty steps array');
  }

  // Normalize steps
  analysis.steps = analysis.steps.map((step, index) => ({
    step:        step.step        ?? index,
    description: step.description || `Step ${index + 1}`,
    caption:     step.caption     || step.description || `Step ${index + 1}`,
    variables:   step.variables   || {},
    highlight:   Array.isArray(step.highlight) ? step.highlight : [],
    action:      step.action      || 'process',
    important:   step.important   ??
                 (index === 0 || index === analysis.steps.length - 1),
    timingMult:  step.timingMult  ?? 1.0,
  }));

  // Normalize variables: string[] → {name, meaning}[]
  if (Array.isArray(analysis.variables)) {
    analysis.variables = (analysis.variables as any[]).map(v => {
      if (typeof v === 'string') {
        return { name: v, meaning: v };
      }
      return {
        name:    v.name    || String(v),
        meaning: v.meaning || v.name || String(v),
      };
    });
  } else {
    analysis.variables = [];
  }

  // Normalize dataStructures
  if (!Array.isArray(analysis.dataStructures)) {
    const category = (analysis.category || '').toLowerCase();
    if (category.includes('sort') || category.includes('two pointer') ||
        category.includes('binary search') || category.includes('dp')) {
      analysis.dataStructures = ['array'];
    } else if (category.includes('graph')) {
      analysis.dataStructures = ['graph', 'array'];
    } else if (category.includes('tree')) {
      analysis.dataStructures = ['tree'];
    } else if (category.includes('stack')) {
      analysis.dataStructures = ['stack'];
    } else if (category.includes('queue')) {
      analysis.dataStructures = ['queue'];
    } else {
      analysis.dataStructures = ['array'];
    }
  }

  // Normalize physicalInterpretation
  if (!analysis.physicalInterpretation ||
      analysis.physicalInterpretation.trim().length < 10) {
    analysis.physicalInterpretation =
      analysis.description
        ? analysis.description
        : `A step-by-step process that solves the ${analysis.algorithmName} problem.`;
  }

  // Normalize edgeCases
  if (!Array.isArray(analysis.edgeCases) || analysis.edgeCases.length === 0) {
    analysis.edgeCases = [
      'Empty input → return default value',
      'Single element → already solved',
      'All same values → handle duplicates',
    ];
  }

  // Normalize optional string fields
  if (!analysis.description) {
    analysis.description = `${analysis.algorithmName} algorithm implementation.`;
  }

  if (!analysis.keyInsight) {
    analysis.keyInsight = `${analysis.algorithmName} achieves its goal by processing elements systematically.`;
  }

  if (!analysis.timeComplexity) {
    analysis.timeComplexity = 'O(n) — depends on input size';
  }

  if (!analysis.spaceComplexity) {
    analysis.spaceComplexity = 'O(1) — constant extra space';
  }

  if (!analysis.inputExample) {
    analysis.inputExample = 'See code for example input';
  }

  if (!analysis.expectedOutput) {
    analysis.expectedOutput = 'See code for expected output';
  }

  if (!analysis.language) {
    analysis.language = 'javascript';
  }
}

// ═══════════════════════════════════════════════════
// MODEL CALLERS
// ═══════════════════════════════════════════════════

/**
 * Gemini caller — uses key rotation
 */
async function callGemini(
  code:      string,
  language:  string,
  modelName: string
): Promise<AnalysisResult> {
  const prompt = buildAnalyzerPrompt(code, language);

  return callWithGeminiRotation(modelName, async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model:    modelName,
      contents: prompt,
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }

    const analysis = parseAnalysisJSON(text);
    validateAnalysis(analysis);

    return analysis;
  });
}

/**
 * Groq Llama caller
 */
async function callGroqAnalyzer(
  code:     string,
  language: string
): Promise<AnalysisResult> {
  const groq   = new Groq({ apiKey: getGroqKey() });
  const prompt = buildAnalyzerPrompt(code, language);

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      {
        role:    'system',
        content: 'You are an expert algorithm analyzer. Always respond with valid JSON only. No markdown, no explanation, no extra text.',
      },
      {
        role:    'user',
        content: prompt,
      },
    ],
    temperature:     0.2,
    max_tokens:      4096,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from Groq');
  }

  const analysis = parseAnalysisJSON(text);
  validateAnalysis(analysis);

  return analysis;
}

/**
 * OpenRouter GPT-OSS 120B caller
 */
async function callOpenRouterAnalyzer(
  code:     string,
  language: string
): Promise<AnalysisResult> {
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey:  getOpenRouterKey(),
    defaultHeaders: OPENROUTER_HEADERS,
  });

  const prompt = buildAnalyzerPrompt(code, language);

  const completion = await client.chat.completions.create({
    model: MODELS.openrouter.gptOSS120B,
    messages: [
      {
        role:    'system',
        content: 'You are an expert algorithm analyzer. Always respond with valid JSON only. No markdown, no explanation, no extra text.',
      },
      {
        role:    'user',
        content: prompt,
      },
    ],
    max_tokens:  4096,
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from OpenRouter GPT-OSS');
  }

  const analysis = parseAnalysisJSON(text);
  validateAnalysis(analysis);

  return analysis;
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

/**
 * analyzeCode(code, language)
 *
 * Analyzes algorithm code and returns structured AnalysisResult.
 *
 * Model chain:
 *   1. Gemini 2.5 Flash     (with key rotation + backoff)
 *   2. Gemini 2.5 Flash Lite (with key rotation + backoff)
 *   3. Groq Llama 3.3 70B   (with backoff)
 *   4. OpenRouter GPT-OSS 120B (with backoff)
 *
 * @param code     Raw algorithm code string
 * @param language Programming language
 * @returns        Validated AnalysisResult
 */
export async function analyzeCode(
  code:     string,
  language: string
): Promise<AnalysisResult> {
  console.log('[Analyzer] Starting analysis...');

  // Build model chain
  const models: ModelFn<AnalysisResult>[] = [];

  // ── Gemini models (only if keys available) ────────
  if (GeminiKeyRotator.hasAnyKey()) {
    models.push({
      name: `Gemini ${MODELS.gemini.flash}`,
      fn:   () => callGemini(code, language, MODELS.gemini.flash),
    });

    models.push({
      name: `Gemini ${MODELS.gemini.flashLite}`,
      fn:   () => callGemini(code, language, MODELS.gemini.flashLite),
    });
  } else {
    console.warn('[Analyzer] No Gemini keys found, skipping Gemini models');
  }

  // ── Groq ──────────────────────────────────────────
  models.push({
    name: 'Groq Llama 3.3 70B',
    fn:   () => callGroqAnalyzer(code, language),
  });

  // ── OpenRouter GPT-OSS 120B ───────────────────────
  models.push({
    name: 'OpenRouter GPT-OSS 120B',
    fn:   () => callOpenRouterAnalyzer(code, language),
  });

  // Run model chain
  const { result, model, attempt } = await runModelChain(
    models,
    {
      maxRetries:  2,
      baseDelayMs: 1500,
      maxDelayMs:  12000,
      jitterMs:    400,
    },
    'Analysis'
  );

  console.log(
    `[Analyzer] ✅ Analysis complete via ${model} (attempt ${attempt})` +
    ` — ${result.steps.length} steps, algo: ${result.algorithmName}`
  );

  return result;
}