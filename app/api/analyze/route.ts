// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeCode } from "@/lib/ai/analyzer";
import { generatePromptArtifacts } from "@/lib/ai/prompts";
import { generateVisualization } from "@/lib/ai/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Increase timeout for Vercel (default is 10s, we need more)
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    // ── Auth Check ──────────────────────────────────
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Please log in to analyze code." },
        { status: 401 }
      );
    }

    // ── Parse Input ─────────────────────────────────
    const body = await request.json();
    const code =
      typeof body.code === "string" ? body.code.trim() : "";
    const language =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim()
        : "javascript";

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Please paste some code first." },
        { status: 400 }
      );
    }

    if (code.length > 20000) {
      return NextResponse.json(
        {
          success: false,
          error: "Your code is too large. Please try a smaller example.",
        },
        { status: 400 }
      );
    }

    // ── Step 1: Analyze Code + Get Creative Direction ──
    console.log("[API] Step 1: Analyzing code...");

    const { analysis, creativeDirection } = await analyzeCode(code, language);

    console.log(
      `[API] Analysis complete: ${analysis.algorithmName} | ` +
        `${(analysis as any).steps?.length || 0} steps | ` +
        `Scene: ${creativeDirection.sceneName}`
    );

    // ── Step 2: Build 48-Section Personalized Prompt ──
    console.log("[API] Step 2: Building personalized prompt...");

    const promptArtifacts = generatePromptArtifacts(analysis, creativeDirection);

    console.log(
      `[API] Prompt built: template=${promptArtifacts.templateType} | ` +
        `fullPrompt=${promptArtifacts.fullPrompt.length} chars | ` +
        `compactPrompt=${promptArtifacts.compactPrompt.length} chars`
    );

    // ── Step 3: Generate Complete HTML ──────────────
    console.log("[API] Step 3: Generating HTML visualization...");

    const generatorOutput = await generateVisualization(
      promptArtifacts,
      analysis,
      creativeDirection
    );

    console.log(
      `[API] HTML generated: model=${generatorOutput.model} | ` +
        `${generatorOutput.html.length} chars | ` +
        `repaired=${generatorOutput.repaired} | ` +
        `truncated=${generatorOutput.truncated}`
    );

    // ── Return Everything ───────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: {
          analysis,
          creativeDirection,
          templateType: promptArtifacts.templateType,
          html: generatorOutput.html,
          model: generatorOutput.model,
          repaired: generatorOutput.repaired,
          truncated: generatorOutput.truncated,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    // ── Friendly Error Messages ─────────────────────
    if (
      message.includes("API_KEY") ||
      message.includes("not set") ||
      message.includes("configured") ||
      message.includes("Gemini API key")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI service is not configured yet. Please add your Gemini API key in .env.local.",
        },
        { status: 500 }
      );
    }

    if (
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("rate limit") ||
      message.includes("resource exhausted")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI service is temporarily busy. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    if (
      message.includes("JSON") ||
      message.includes("parse") ||
      message.includes("Invalid analysis") ||
      message.includes("Invalid analyzer")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't understand that code clearly. Please try again or simplify the input.",
        },
        { status: 500 }
      );
    }

    if (
      message.includes("timeout") ||
      message.includes("TIMEOUT") ||
      message.includes("deadline")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Generation took too long. Please try with simpler code or try again.",
        },
        { status: 504 }
      );
    }

    if (
      message.includes("All Gemini") ||
      message.includes("all attempts") ||
      message.includes("failed")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI models are currently unavailable. Please try again in a few minutes.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while generating your visualization. Please try again.",
      },
      { status: 500 }
    );
  }
}