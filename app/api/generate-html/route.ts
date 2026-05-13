// app/api/generate-html/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateVisualization } from "@/lib/ai/generator";
import { assembleHTML, validateFinalHTML } from "@/lib/visualizer/assembler";
import { AnalysisResult, CreativeScene, TechnicalSpec } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════
// MAX TIMEOUT
// Vercel free tier: 60s max
// We set 55s to leave buffer
// ═══════════════════════════════════════════════════
export const maxDuration = 55;

// ═══════════════════════════════════════════════════
// INPUT VALIDATOR
// ═══════════════════════════════════════════════════

function validateInput(body: Record<string, unknown>): {
  valid:          boolean;
  error?:         string;
  compactPrompt?: string;
  creativeScene?: CreativeScene;
  technicalSpec?: TechnicalSpec;
  analysis?:      AnalysisResult;
} {
  // compactPrompt
  if (
    !body.compactPrompt ||
    typeof body.compactPrompt !== 'string' ||
    body.compactPrompt.trim().length < 50
  ) {
    return { valid: false, error: 'Missing or invalid compactPrompt.' };
  }

  // creativeScene
  if (!body.creativeScene || typeof body.creativeScene !== 'object') {
    return { valid: false, error: 'Missing or invalid creativeScene.' };
  }

  const cs = body.creativeScene as Record<string, unknown>;
  if (!cs.metaphor || !cs.sceneName || !cs.heroCharacter) {
    return { valid: false, error: 'creativeScene is incomplete — missing metaphor/sceneName/heroCharacter.' };
  }

  // technicalSpec
  if (!body.technicalSpec || typeof body.technicalSpec !== 'object') {
    return { valid: false, error: 'Missing or invalid technicalSpec.' };
  }

  const ts = body.technicalSpec as Record<string, unknown>;
  if (!ts.templateType) {
    return { valid: false, error: 'technicalSpec missing templateType.' };
  }

  // analysis
  if (!body.analysis || typeof body.analysis !== 'object') {
    return { valid: false, error: 'Missing or invalid analysis.' };
  }

  const a = body.analysis as Record<string, unknown>;
  if (!a.algorithmName || !Array.isArray(a.steps) || a.steps.length === 0) {
    return { valid: false, error: 'analysis is incomplete — missing algorithmName or steps.' };
  }

  return {
    valid:         true,
    compactPrompt: body.compactPrompt as string,
    creativeScene: body.creativeScene as CreativeScene,
    technicalSpec: body.technicalSpec as TechnicalSpec,
    analysis:      body.analysis      as AnalysisResult,
  };
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

    // ── Validate input ──────────────────────────────
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error:   validation.error || 'Invalid input data.',
        },
        { status: 400 }
      );
    }

    const {
      compactPrompt,
      creativeScene,
      technicalSpec,
      analysis,
    } = validation;

    console.log(
      '[API/generate-html] Starting generation for:',
      analysis!.algorithmName,
      '| Template:', technicalSpec!.templateType,
      '| Scene:', creativeScene!.sceneName
    );

    // ── Step 1: Generate AI visualization output ────
    console.log('[API/generate-html] Calling generateVisualization...');

    const aiOutput = await generateVisualization(
      compactPrompt!,
      creativeScene!,
      technicalSpec!,
      analysis!
    );

    console.log('[API/generate-html] AI output received');
    console.log('[API/generate-html] templateType:', aiOutput.templateType);
    console.log('[API/generate-html] customCSS length:', aiOutput.customCSS?.length ?? 0);
    console.log('[API/generate-html] sceneScript length:', aiOutput.sceneScript?.length ?? 0);

    // ── Step 2: Assemble final HTML ─────────────────
    console.log('[API/generate-html] Assembling final HTML...');

    const finalHTML = assembleHTML(aiOutput, analysis!);

    console.log('[API/generate-html] Final HTML length:', finalHTML.length);

    // ── Step 3: Validate assembled HTML ────────────
    const { valid, issues } = validateFinalHTML(finalHTML);

    if (!valid) {
      console.warn('[API/generate-html] HTML validation issues:', issues);

      // If critical issues — return error
      const criticalIssues = issues.filter(i =>
        i.includes('too short')     ||
        i.includes('DOCTYPE')       ||
        i.includes('app container') ||
        i.includes('STEPS array')
      );

      if (criticalIssues.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error:   'Generated visualization is incomplete. Please try again.',
            debug:   process.env.NODE_ENV === 'development' ? issues : undefined,
          },
          { status: 500 }
        );
      }

      // Non-critical issues — return HTML with warning
      console.warn('[API/generate-html] Non-critical issues, returning HTML with warning');
      return NextResponse.json(
        {
          success: true,
          html:    finalHTML,
          warning: 'Visualization generated with minor issues — some features may not work perfectly.',
          issues:  process.env.NODE_ENV === 'development' ? issues : undefined,
        },
        { status: 200 }
      );
    }

    // ── Step 4: Return final HTML ───────────────────
    console.log('[API/generate-html] ✅ Generation complete');

    return NextResponse.json(
      {
        success: true,
        html:    finalHTML,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API/generate-html] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // ── API key errors ──────────────────────────────
    if (
      message.includes('API_KEY')    ||
      message.includes('not set')    ||
      message.includes('OPENROUTER') ||
      message.includes('GROQ')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'AI service is not configured. Please add your API keys in .env.local.',
        },
        { status: 500 }
      );
    }

    // ── Rate limit errors ───────────────────────────
    if (
      message.includes('rate limit') ||
      message.includes('Rate limit') ||
      message.includes('429')        ||
      message.includes('quota')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'AI service is busy. Please wait a moment and try again.',
        },
        { status: 429 }
      );
    }

    // ── Timeout errors ──────────────────────────────
    if (
      message.includes('timeout')  ||
      message.includes('Timeout')  ||
      message.includes('ETIMEDOUT')||
      message.includes('timed out')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'Generation took too long. Please try again — it usually works on retry.',
        },
        { status: 504 }
      );
    }

    // ── All models failed ───────────────────────────
    if (message.includes('All') && message.includes('failed')) {
      return NextResponse.json(
        {
          success: false,
          error:   'Could not generate visualization right now. Please try again in a moment.',
        },
        { status: 500 }
      );
    }

    // ── Assembly errors ─────────────────────────────
    if (
      message.includes('assemble')   ||
      message.includes('shell')      ||
      message.includes('template')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:   'Failed to build the visualization. Please try again.',
        },
        { status: 500 }
      );
    }

    // ── Generic fallback ────────────────────────────
    return NextResponse.json(
      {
        success: false,
        error:   'Something went wrong while generating the visualization. Please try again.',
      },
      { status: 500 }
    );
  }
}