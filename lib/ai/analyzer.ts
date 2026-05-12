import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { AnalysisResult } from "@/types";
import { buildAnalyzerPrompt } from "@/lib/ai/prompts";

async function analyzeWithGemini(
  code: string,
  language: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const ai = new GoogleGenAI({ apiKey });

  const models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  const prompt = buildAnalyzerPrompt(code, language);
  let lastError: Error | null = null;

  for (const modelName of models) {
    try {
      console.log(`[Analyzer] Trying Gemini model: ${modelName}...`);

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) throw new Error("Empty response");

      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

      const analysis: AnalysisResult = JSON.parse(jsonString);

      if (
        !analysis.algorithmName ||
        !analysis.steps ||
        analysis.steps.length === 0
      ) {
        throw new Error("Invalid analysis: missing required fields");
      }

      console.log(`[Analyzer] ✅ Gemini ${modelName} succeeded`);
      return analysis;
    } catch (error) {
      console.log(`[Analyzer] ❌ Gemini ${modelName} failed:`, error);
      lastError =
        error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

async function analyzeWithGroq(
  code: string,
  language: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const groq = new Groq({ apiKey });
  const prompt = buildAnalyzerPrompt(code, language);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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

  if (
    !analysis.algorithmName ||
    !analysis.steps ||
    analysis.steps.length === 0
  ) {
    throw new Error("Invalid analysis: missing required fields");
  }

  return analysis;
}

export async function analyzeCode(
  code: string,
  language: string
): Promise<AnalysisResult> {
  // Try 1: Gemini
  try {
    console.log("[Analyzer] Trying Gemini...");
    const result = await analyzeWithGemini(code, language);
    return result;
  } catch (error) {
    console.error("[Analyzer] ❌ All Gemini models failed:", error);
  }

  // Try 2: Groq
  try {
    console.log("[Analyzer] Trying Groq Llama 3.3 70B...");
    const result = await analyzeWithGroq(code, language);
    console.log("[Analyzer] ✅ Groq succeeded");
    return result;
  } catch (error) {
    console.error("[Analyzer] ❌ Groq failed:", error);
  }

  throw new Error(
    "All analyzer models failed. Please check your API keys and try again."
  );
}