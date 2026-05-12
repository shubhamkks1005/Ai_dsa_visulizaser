import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "@/types";
import {
  buildVisualizationPrompt,
  buildShortVisualizationPrompt,
} from "@/lib/ai/prompts";

// ═══════════════════════════════════════
// HELPER: Extract HTML
// ═══════════════════════════════════════

function extractHTML(text: string): string {
  const htmlMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (htmlMatch) return htmlMatch[1].trim();

  const trimmed = text.trim();
  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML")
  )
    return trimmed;

  const docTypeMatch = trimmed.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (docTypeMatch) return docTypeMatch[1].trim();

  return trimmed;
}

function validateHTML(html: string): boolean {
  if (!html || html.length < 200) return false;
  if (!html.includes("<html") && !html.includes("<!DOCTYPE")) return false;
  if (!html.includes("<script")) return false;
  if (!html.includes("<style")) return false;
  return true;
}

// ═══════════════════════════════════════
// 1. Claude 3.5 Sonnet (BEST)
// ═══════════════════════════════════════

async function generateWithClaude(analysis: AnalysisResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const anthropic = new Anthropic({ apiKey });
  const prompt = buildVisualizationPrompt(analysis);

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in Claude response");
  }

  const html = extractHTML(textBlock.text);
  if (!validateHTML(html)) throw new Error("Claude returned invalid HTML");
  return html;
}

// ═══════════════════════════════════════
// 2. OpenRouter — Multiple Free Models
// ═══════════════════════════════════════

async function generateWithOpenRouter(
  analysis: AnalysisResult
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });

  const prompt = buildVisualizationPrompt(analysis);

  const models = [
    "deepseek/deepseek-chat:free",
    "deepseek/deepseek-r1:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];

  let lastError: Error | null = null;

  for (const modelName of models) {
    try {
      console.log(`[Generator] Trying OpenRouter model: ${modelName}...`);

      const completion = await client.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: "system",
            content:
              "You are an expert frontend visualization architect. Generate production-quality, single-file, self-contained HTML visualizations with beautiful animations. Output ONLY valid complete HTML starting with <!DOCTYPE html>. No markdown fences. No explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 8192,
      });

      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error("Empty response");

      const html = extractHTML(text);
      if (!validateHTML(html)) {
        throw new Error(`${modelName} returned invalid HTML`);
      }

      console.log(`[Generator] ✅ OpenRouter ${modelName} succeeded`);
      return html;
    } catch (error) {
      console.log(`[Generator] ❌ OpenRouter ${modelName} failed`);
      lastError =
        error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("All OpenRouter models failed");
}

// ═══════════════════════════════════════
// 3. Google Gemini (New SDK)
// ═══════════════════════════════════════

async function generateWithGemini(
  analysis: AnalysisResult
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });

  const models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  const prompt = buildVisualizationPrompt(analysis);
  let lastError: Error | null = null;

  for (const modelName of models) {
    try {
      console.log(`[Generator] Trying Gemini model: ${modelName}...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const html = extractHTML(text);
      if (!validateHTML(html)) {
        throw new Error(`${modelName} returned invalid HTML`);
      }

      console.log(`[Generator] ✅ Gemini ${modelName} succeeded`);
      return html;
    } catch (error) {
      console.log(`[Generator] ❌ Gemini ${modelName} failed`);
      lastError =
        error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

// ═══════════════════════════════════════
// 4. Groq (SHORT prompt — last resort)
// ═══════════════════════════════════════

async function generateWithGroq(
  analysis: AnalysisResult
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const groq = new Groq({ apiKey });
  const prompt = buildShortVisualizationPrompt(analysis);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert frontend developer specializing in animated algorithm visualizations. Output ONLY complete self-contained HTML. No markdown. No explanation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 6000,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");

  const html = extractHTML(text);
  if (!validateHTML(html)) throw new Error("Groq returned invalid HTML");
  return html;
}

// ═══════════════════════════════════════
// MAIN EXPORT — Full Chain
// ═══════════════════════════════════════

export async function generateVisualization(
  analysis: AnalysisResult
): Promise<string> {
  // Try 1: Claude (Best)
  try {
    console.log("[Generator] Trying Claude 3.5 Sonnet...");
    const result = await generateWithClaude(analysis);
    console.log("[Generator] ✅ Claude succeeded");
    return result;
  } catch (error) {
    console.error("[Generator] ❌ Claude failed:", error);
  }

  // Try 2: OpenRouter (Free, full prompt)
  try {
    console.log("[Generator] Trying OpenRouter...");
    const result = await generateWithOpenRouter(analysis);
    return result;
  } catch (error) {
    console.error("[Generator] ❌ All OpenRouter models failed:", error);
  }

  // Try 3: Gemini (Full prompt)
  try {
    console.log("[Generator] Trying Gemini...");
    const result = await generateWithGemini(analysis);
    return result;
  } catch (error) {
    console.error("[Generator] ❌ All Gemini models failed:", error);
  }

  // Try 4: Groq (Short prompt, last resort)
  try {
    console.log("[Generator] Trying Groq Llama 3.3 70B...");
    const result = await generateWithGroq(analysis);
    console.log("[Generator] ✅ Groq succeeded");
    return result;
  } catch (error) {
    console.error("[Generator] ❌ Groq failed:", error);
  }

  throw new Error(
    "All generator models failed. Please check your API keys and try again."
  );
}