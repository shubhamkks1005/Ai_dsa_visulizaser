// lib/ai/generator.ts

import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "@/types";
import type { CreativeDirection } from "@/lib/ai/analyzer";
import type { PromptArtifacts } from "@/lib/ai/prompts";
import { assembleVisualization, parseAISceneOutput } from "@/lib/visualizer/assembler";
import type { AISceneOutput } from "@/lib/visualizer/assembler";

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const GEMINI_MODELS = {
  primary: "gemini-2.5-pro",
  secondary: "gemini-2.5-flash",
  tertiary: "gemini-2.5-flash-lite",
} as const;

const MAX_OUTPUT_TOKENS = 32000;
const MAX_RETRIES_PER_MODEL = 2;

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface GeneratorOutput {
  html: string;
  model: string;
  repaired: boolean;
  truncated: boolean;
  usedFallback: boolean;
}

// ═══════════════════════════════════════════════════
// ENV / KEY HELPERS
// ═══════════════════════════════════════════════════

function getGeminiApiKeys(): string[] {
  const single = process.env.GEMINI_API_KEY?.trim() || "";
  const multiRaw = process.env.GEMINI_API_KEYS?.trim() || "";

  const multi = multiRaw
    .split(/[,\n]/)
    .map((key) => key.trim())
    .filter(Boolean);

  const keys = [...(single ? [single] : []), ...multi];
  const unique = Array.from(new Set(keys));

  if (unique.length === 0) {
    throw new Error(
      "Gemini API key not configured. Add GEMINI_API_KEY in .env.local"
    );
  }

  return unique;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("503") ||
    message.includes("500") ||
    message.includes("overloaded") ||
    message.includes("timeout") ||
    message.includes("unavailable")
  );
}

// ═══════════════════════════════════════════════════
// DETECT IF RESPONSE IS FULL HTML OR JSON
// ═══════════════════════════════════════════════════

function isFullHTML(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    (trimmed.includes("<html") &&
      trimmed.includes("</html>") &&
      trimmed.includes("<script"))
  );
}

// ═══════════════════════════════════════════════════
// EXTRACT + CLEAN RAW TEXT
// ═══════════════════════════════════════════════════

function cleanResponse(rawText: string): string {
  let text = rawText.trim();

  // Remove think tags
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Remove markdown fences
  text = text.replace(/^```(?:json|html|javascript|js)?\s*/i, "");
  text = text.replace(/```\s*$/i, "");

  return text.trim();
}

// ═══════════════════════════════════════════════════
// VALIDATE AI SCENE OUTPUT
// ═══════════════════════════════════════════════════

function validateAIScene(scene: AISceneOutput): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!scene.customCSS || scene.customCSS.trim().length < 10) {
    issues.push("customCSS too short or missing");
  }

  if (!scene.sceneHTML || scene.sceneHTML.trim().length < 10) {
    issues.push("sceneHTML too short or missing");
  }

  if (!Array.isArray(scene.steps) || scene.steps.length === 0) {
    issues.push("steps array missing or empty");
  }

  if (!scene.renderScene || scene.renderScene.trim().length < 20) {
    issues.push("renderScene missing or too short");
  }

  // Check steps have captions
  if (Array.isArray(scene.steps) && scene.steps.length > 0) {
    const hasAnyCaptions = scene.steps.some(
      (s) => typeof s.caption === "string" && s.caption.trim().length > 0
    );
    if (!hasAnyCaptions) {
      issues.push("steps have no captions");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// ═══════════════════════════════════════════════════
// VALIDATE FULL HTML (backward compat)
// ═══════════════════════════════════════════════════

function validateFullHTML(html: string): boolean {
  if (html.length < 500) return false;

  const lower = html.toLowerCase();
  const hasScript = lower.includes("<script") && lower.includes("</script>");
  const hasStyle = lower.includes("<style") && lower.includes("</style>");
  const hasBody = lower.includes("<body") && lower.includes("</body>");

  return hasScript && hasStyle && hasBody;
}

// ═══════════════════════════════════════════════════
// GEMINI CALLER
// ═══════════════════════════════════════════════════

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const client = new GoogleGenAI({ apiKey });

 const isPro = model.includes("2.5-pro");

const response = await client.models.generateContent({
  model,
  contents: String(prompt),
  config: {
    temperature: 0.3,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    ...(isPro ? {} : {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    }),
  },
});

  const text = response.text;

  if (!text || text.trim().length === 0) {
    throw new Error(`Empty response from Gemini ${model}`);
  }

  return text;
}

// ═══════════════════════════════════════════════════
// RUN GENERATOR — Try models in order
// ═══════════════════════════════════════════════════

async function runGenerator(
  prompt: string
): Promise<{ rawText: string; model: string }> {
  const keys = getGeminiApiKeys();
  const modelOrder = [
    GEMINI_MODELS.primary,
    GEMINI_MODELS.secondary,
    GEMINI_MODELS.tertiary,
  ];

  let lastError: unknown = null;

  for (const model of modelOrder) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      for (const key of keys) {
        try {
          console.log(
            `[Generator] Trying ${model} (attempt ${attempt})...`
          );

          const rawText = await callGemini(key, model, prompt);
          const cleaned = cleanResponse(rawText);

          if (cleaned.length < 50) {
            console.warn(
              `[Generator] ${model} returned too-short response, trying next...`
            );
            continue;
          }

          console.log(
            `[Generator] ✅ Got response from ${model} — ${cleaned.length} chars`
          );

          return { rawText: cleaned, model };
        } catch (error) {
          lastError = error;

          console.warn(
            `[Generator] ${model} attempt ${attempt} failed:`,
            error instanceof Error ? error.message : String(error)
          );

          if (isRetryableError(error)) {
            await sleep(800 * attempt);
            continue;
          }
        }
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini generator attempts failed");
}

// ═══════════════════════════════════════════════════
// PROCESS RESPONSE — JSON or Full HTML
// ═══════════════════════════════════════════════════

function processResponse(
  rawText: string,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): { html: string; usedFallback: boolean } {
  // ── Check if AI returned full HTML ──────────────
  if (isFullHTML(rawText)) {
    console.log("[Generator] AI returned full HTML (backward compat)");

    if (validateFullHTML(rawText)) {
      return { html: rawText, usedFallback: false };
    }

    console.warn("[Generator] Full HTML invalid, trying to parse as JSON...");
  }

  // ── Try parsing as JSON (expected format) ───────
  const aiScene = parseAISceneOutput(rawText);

  if (aiScene) {
    const validation = validateAIScene(aiScene);

    console.log("[Generator] AI Scene validation:", {
      valid: validation.valid,
      issues: validation.issues,
      stepsCount: aiScene.steps?.length || 0,
    });

    // Even if not fully valid, assembler will handle fallbacks
    const html = assembleVisualization(aiScene, analysis, creativeDirection);
    return { html, usedFallback: !validation.valid };
  }

  // ── Both failed — use complete fallback ─────────
  console.warn("[Generator] Could not parse response as JSON or HTML, using fallback");
  const html = assembleVisualization(null, analysis, creativeDirection);
  return { html, usedFallback: true };
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

export async function generateVisualization(
  promptArtifacts: PromptArtifacts,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): Promise<GeneratorOutput> {
  console.log("[Generator] Starting generation...");
  console.log("[Generator] Algorithm:", analysis.algorithmName);
  console.log("[Generator] Scene:", creativeDirection.sceneName);

  try {
    // ── Step 1: Generate via Gemini ─────────────────
    const prompt = promptArtifacts.fullPrompt;
    const { rawText, model } = await runGenerator(prompt);

    // ── Step 2: Process response ────────────────────
    const { html, usedFallback } = processResponse(
      rawText,
      analysis,
      creativeDirection
    );

    console.log(
      `[Generator] ✅ Complete via ${model} | ` +
        `HTML: ${html.length} chars | ` +
        `Fallback: ${usedFallback}`
    );

    return {
      html,
      model,
      repaired: false,
      truncated: false,
      usedFallback,
    };
  } catch (error) {
    console.error(
      "[Generator] Fatal error:",
      error instanceof Error ? error.message : String(error)
    );

    // ── Total failure — use complete fallback ───────
    console.warn("[Generator] Using complete fallback visualization");

    const html = assembleVisualization(null, analysis, creativeDirection);

    return {
      html,
      model: "fallback",
      repaired: false,
      truncated: false,
      usedFallback: true,
    };
  }
}