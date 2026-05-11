import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { AnalysisResult } from "@/types";
import { buildAnalyzerPrompt } from "@/lib/ai/prompts";

// ═══════════════════════════════════════
// PRIMARY: Google Gemini 2.0 Flash
// ═══════════════════════════════════════

async function analyzeWithGemini(
  code: string,
  language: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = buildAnalyzerPrompt(code, language);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Extract JSON from response (handle markdown code fences)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

  const analysis: AnalysisResult = JSON.parse(jsonString);

  // Validate required fields
  if (!analysis.algorithmName || !analysis.steps || analysis.steps.length === 0) {
    throw new Error("Invalid analysis: missing required fields");
  }

  return analysis;
}

// ═══════════════════════════════════════
// FALLBACK: Groq Llama 3.1 70B
// ═══════════════════════════════════════

async function analyzeWithGroq(
  code: string,
  language: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const groq = new Groq({ apiKey });

  const prompt = buildAnalyzerPrompt(code, language);

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert algorithm analyzer. Always respond with valid JSON only. No markdown, no explanation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");

  const analysis: AnalysisResult = JSON.parse(text);

  if (!analysis.algorithmName || !analysis.steps || analysis.steps.length === 0) {
    throw new Error("Invalid analysis: missing required fields");
  }

  return analysis;
}

// ═══════════════════════════════════════
// MAIN EXPORT — with fallback chain
// ═══════════════════════════════════════

export async function analyzeCode(
  code: string,
  language: string
): Promise<AnalysisResult> {
  // Try 1: Gemini 2.0 Flash
  try {
    console.log("[Analyzer] Trying Gemini 2.0 Flash...");
    const result = await analyzeWithGemini(code, language);
    console.log("[Analyzer] ✅ Gemini succeeded");
    return result;
  } catch (error) {
    console.error("[Analyzer] ❌ Gemini failed:", error);
  }

  // Try 2: Groq Llama 3.1 70B
  try {
    console.log("[Analyzer] Trying Groq Llama 3.1 70B...");
    const result = await analyzeWithGroq(code, language);
    console.log("[Analyzer] ✅ Groq succeeded");
    return result;
  } catch (error) {
    console.error("[Analyzer] ❌ Groq failed:", error);
  }

  // All failed
  throw new Error(
    "All analyzer models failed. Please check your API keys and try again."
  );
}