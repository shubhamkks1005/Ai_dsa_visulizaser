// app/api/generate-prompt/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePrompt } from "@/lib/ai/prompt-generator";
import { AnalysisResult } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════
// VALIDATION HELPER
// ═══════════════════════════════════════════════════

function validateAnalysisInput(analysis: unknown): {
  valid:   boolean;
  error?:  string;
  data?:   AnalysisResult;
} {
  if (!analysis || typeof analysis !== 'object') {
    return { valid: false, error: 'Analysis data is missing or invalid.' };
  }

  const a = analysis as Record<string, unknown>;

  if (!a.algorithmName || typeof a.algorithmName !== 'string') {
    return { valid: false, error: 'Analysis missing algorithmName.' };
  }

  if (!a.category || typeof a.category !== 'string') {
    return { valid: false, error: 'Analysis missing category.' };
  }

  if (!Array.isArray(a.steps) || a.steps.length === 0) {
    return { valid: false, error: 'Analysis missing steps array.' };
  }

  return { valid: true, data: analysis as AnalysisResult };
}

// ═══════════════════════════════════════════════════
// POST HANDLER
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {

    // ── Auth check ──────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error:   'Please log in to generate visualizations.',
        },
        { status: 401 }
      );
    }

    // ── Parse body ──────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:   'Invalid request body — expected JSON.',
        },
        { status: 400 }
      );
    }

    // ── Validate analysis ───────────────────────────
    const validation = validateAnalysisInput(body.analysis);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error:   validation.error || 'Invalid analysis data.',
        },
        { status: 400 }
      );
    }

    const analysis = validation.data!;

    console.log(
      '[API/generate-prompt] Generating prompt for:',
      analysis.algorithmName,
      '| Category:', analysis.category,
      '| Steps:', analysis.steps.length
    );

    // ── Generate prompt chunks ──────────────────────
    const result = await generatePrompt(analysis);

    // ── Return result ───────────────────────────────
    return NextResponse.json(
      {
        success:       true,
        creativeScene: result.creativeScene,
        technicalSpec: result.technicalSpec,
        fullPrompt:    result.fullPrompt,
        compactPrompt: result.compactPrompt,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API/generate-prompt] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // ── API key errors ──────────────────────────────
    if (
      message.includes('API_KEY')        ||
      message.includes('not set')        ||
      message.includes('OPENROUTER')     ||
      message.includes('configured')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'AI service is not configured. Please add your API keys in .env.local.',
        },
        { status: 500 }
      );
    }

    // ── Model/rate limit errors ─────────────────────
    if (
      message.includes('rate limit')     ||
      message.includes('Rate limit')     ||
      message.includes('429')            ||
      message.includes('quota')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'AI service is busy right now. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }

    // ── All models failed ───────────────────────────
    if (message.includes('All') && message.includes('failed')) {
      return NextResponse.json(
        {
          success: false,
          error:   'Could not create visualization plan. Please try again.',
        },
        { status: 500 }
      );
    }

    // ── JSON parse errors ───────────────────────────
    if (
      message.includes('JSON')           ||
      message.includes('parse')          ||
      message.includes('valid JSON')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'AI returned an unexpected response. Please try again.',
        },
        { status: 500 }
      );
    }

    // ── Generic fallback ────────────────────────────
    return NextResponse.json(
      {
        success: false,
        error:   'Something went wrong while creating the visualization plan. Please try again.',
      },
      { status: 500 }
    );
  }
}