import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { AnalysisResult } from "@/types";
import { buildVisualizationPrompt } from "@/lib/ai/prompts";

// ═══════════════════════════════════════
// HELPER: Extract HTML from response
// ═══════════════════════════════════════

function extractHTML(text: string): string {
  // Try to extract from code fences first
  const htmlMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }

  // If response starts with <!DOCTYPE or <html, use as-is
  const trimmed = text.trim();
  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML")
  ) {
    return trimmed;
  }

  // Try to find HTML block anywhere in response
  const docTypeMatch = trimmed.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (docTypeMatch) {
    return docTypeMatch[1].trim();
  }

  // Last resort: return as-is
  return trimmed;
}

// ═══════════════════════════════════════
// HELPER: Validate HTML
// ═══════════════════════════════════════

function validateHTML(html: string): boolean {
  if (!html || html.length < 200) return false;
  if (!html.includes("<html") && !html.includes("<!DOCTYPE")) return false;
  if (!html.includes("<script")) return false;
  if (!html.includes("<style")) return false;
  return true;
}

// ═══════════════════════════════════════
// PRIMARY: Anthropic Claude 3.5 Sonnet
// ═══════════════════════════════════════

async function generateWithClaude(
  analysis: AnalysisResult
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const anthropic = new Anthropic({ apiKey });

  const prompt = buildVisualizationPrompt(analysis);

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in Claude response");
  }

  const html = extractHTML(textBlock.text);

  if (!validateHTML(html)) {
    throw new Error("Claude returned invalid HTML");
  }

  return html;
}

// ═══════════════════════════════════════
// FALLBACK 1: Google Gemini 1.5 Pro
// ═══════════════════════════════════════

async function generateWithGemini(
  analysis: AnalysisResult
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = buildVisualizationPrompt(analysis);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const html = extractHTML(text);

  if (!validateHTML(html)) {
    throw new Error("Gemini returned invalid HTML");
  }

  return html;
}

// ═══════════════════════════════════════
// FALLBACK 2: Groq Llama 3.1 70B
// ═══════════════════════════════════════

async function generateWithGroq(
  analysis: AnalysisResult
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const groq = new Groq({ apiKey });

  const prompt = buildVisualizationPrompt(analysis);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert HTML visualization generator. Generate a single self-contained HTML file with all CSS and JS inline. Output ONLY the HTML code, nothing else.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");

  const html = extractHTML(text);

  if (!validateHTML(html)) {
    throw new Error("Groq returned invalid HTML");
  }

  return html;
}

// ═══════════════════════════════════════
// MAIN EXPORT — with fallback chain
// ═══════════════════════════════════════

export async function generateVisualization(
  analysis: AnalysisResult
): Promise<string> {
  // Try 1: Claude 3.5 Sonnet
  try {
    console.log("[Generator] Trying Claude 3.5 Sonnet...");
    const result = await generateWithClaude(analysis);
    console.log("[Generator] ✅ Claude succeeded");
    return result;
  } catch (error) {
    console.error("[Generator] ❌ Claude failed:", error);
  }

  // Try 2: Gemini 1.5 Pro
  try {
    console.log("[Generator] Trying Gemini 1.5 Pro...");
    const result = await generateWithGemini(analysis);
    console.log("[Generator] ✅ Gemini succeeded");
    return result;
  } catch (error) {
    console.error("[Generator] ❌ Gemini failed:", error);
  }

  // Try 3: Groq Llama 3.1 70B
  try {
    console.log("[Generator] Trying Groq Llama 3.1 70B...");
    const result = await generateWithGroq(analysis);
    console.log("[Generator] ✅ Groq succeeded");
    return result;
  } catch (error) {
    console.error("[Generator] ❌ Groq failed:", error);
  }

  // All failed
  throw new Error(
    "All generator models failed. Please check your API keys and try again."
  );
}