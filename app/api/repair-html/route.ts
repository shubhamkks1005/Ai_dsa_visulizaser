// app/api/repair-html/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import Groq from "groq-sdk";
import {
  runModelChain,
  getOpenRouterKey,
  getGroqKey,
  MODELS,
  OPENROUTER_HEADERS,
  type ModelFn,
} from "@/lib/ai/ai-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 55;

// ═══════════════════════════════════════════════════
// HTML EXTRACTION
// ═══════════════════════════════════════════════════

function extractHTML(text: string): string {
  if (!text) return '';

  // Strip think tags
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Strip markdown fences
  const fenceMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  // If starts with DOCTYPE or html tag
  const trimmed = text.trim();
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html')
  ) {
    return trimmed;
  }

  // Try to extract DOCTYPE...html block
  const docMatch = trimmed.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (docMatch) return docMatch[1].trim();

  return trimmed;
}

function validateRepairedHTML(html: string): boolean {
  if (!html || html.length < 500)          return false;
  if (!html.includes('<!DOCTYPE'))         return false;
  if (!html.includes('id="app"'))          return false;
  if (!html.includes('window.STEPS'))      return false;
  if (!html.includes('renderScene'))       return false;
  if (!html.includes('initVisualization')) return false;
  if (!html.includes('</html>'))           return false;
  return true;
}

// ═══════════════════════════════════════════════════
// REPAIR PROMPT BUILDERS
// ═══════════════════════════════════════════════════

function buildRepairSystemPrompt(): string {
  return `You are an expert HTML/CSS/JS debugger specializing in algorithm visualizations.

Your task: Fix issues in a visualization HTML file without changing its creative content.

WHAT TO FIX:
1. Unclosed or malformed HTML tags
2. Z-index conflicts (controls/caption hidden behind scene elements)
3. Overflow issues (content clipping outside bounds)
4. Controls bar not visible (ensure #controls-bar is always visible)
5. Caption text clipping (ensure #caption-bar has enough height)
6. Sidebar not scrollable (ensure overflow-y: auto on #sidebar-content)
7. Scene elements overflowing outside #scene-area
8. Missing </script> or </style> closing tags
9. JavaScript syntax errors (unclosed brackets, missing semicolons)
10. initVisualization() not called or called multiple times
11. window.STEPS empty or undefined at runtime
12. renderScene() missing required action handlers

WHAT NOT TO CHANGE:
- The creative theme, colors, metaphor
- The hero character design
- The environment/background
- The step data and captions
- The algorithm logic
- Any working animations

Z-INDEX RULES (enforce these):
  background elements: z-index 1-4
  scene elements:      z-index 5-14
  pointers/chars:      z-index 15-24
  panels/UI:           z-index 25-29
  overlays:            z-index 30+

OUTPUT RULES:
- Return ONLY the complete fixed HTML
- Start with <!DOCTYPE html>
- End with </html>
- No explanation before or after
- No markdown fences`;
}

function buildRepairUserPrompt(
  html:           string,
  algorithmName:  string,
  compactPrompt?: string,
  maxChars?:      number
): string {
  const limit       = maxChars || 12000;
  const htmlPreview  = html.length > limit
    ? html.slice(0, limit) + '\n\n... [truncated for repair] ...\n</body>\n</html>'
    : html;

  return `Fix this ${algorithmName} visualization HTML.

Algorithm: ${algorithmName}
${compactPrompt ? `Context: ${compactPrompt.slice(0, 300)}` : ''}

HTML TO REPAIR:
${htmlPreview}

Return the complete fixed HTML starting with <!DOCTYPE html>.`;
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
// GENERIC REPAIR CALLERS
// ═══════════════════════════════════════════════════

async function callOpenRouterRepair(
  model:         string,
  html:          string,
  algorithmName: string,
  compactPrompt: string | undefined,
  modelName:     string,
  maxChars?:     number
): Promise<string> {
  const client = getOpenRouterClient();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildRepairSystemPrompt() },
      { role: 'user',   content: buildRepairUserPrompt(html, algorithmName, compactPrompt, maxChars) },
    ],
    max_tokens:  7500,
    temperature: 0.1,
  });

  const text     = completion.choices[0]?.message?.content;
  const repaired = extractHTML(text || '');

  if (!validateRepairedHTML(repaired)) {
    throw new Error(`${modelName} repair produced invalid HTML`);
  }

  return repaired;
}

async function callGroqRepair(
  html:          string,
  algorithmName: string,
  compactPrompt: string | undefined
): Promise<string> {
  const groq = getGroqClient();

  // Groq has stricter limits — send less HTML
  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: buildRepairSystemPrompt() },
      { role: 'user',   content: buildRepairUserPrompt(html, algorithmName, compactPrompt, 8000) },
    ],
    temperature: 0.1,
    max_tokens:  7500,
  });

  const text     = completion.choices[0]?.message?.content;
  const repaired = extractHTML(text || '');

  if (!validateRepairedHTML(repaired)) {
    throw new Error('Groq repair produced invalid HTML');
  }

  return repaired;
}

// ═══════════════════════════════════════════════════
// REPAIR MODEL CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildRepairChain(
  html:          string,
  algorithmName: string,
  compactPrompt: string | undefined
): ModelFn<string>[] {
  return [
    // 1. Qwen Coder (best for code fixes)
    {
      name: 'Qwen Coder',
      fn: () => callOpenRouterRepair(
        MODELS.openrouter.qwenCoder,
        html, algorithmName, compactPrompt,
        'Qwen Coder'
      ),
    },

    // 2. Llama 3.3 Instruct (reliable fallback)
    {
      name: 'Llama 3.3 Instruct',
      fn: () => callOpenRouterRepair(
        MODELS.openrouter.llama70BInstruct,
        html, algorithmName, compactPrompt,
        'Llama 3.3 Instruct'
      ),
    },

    // 3. Groq Llama (last resort — shorter context)
    {
      name: 'Groq Llama',
      fn: () => callGroqRepair(html, algorithmName, compactPrompt),
    },
  ];
}

// ═══════════════════════════════════════════════════
// REPAIR RETRY CONFIG
// ═══════════════════════════════════════════════════

const REPAIR_RETRY_CONFIG = {
  maxRetries:  1,     // repair is optional — fewer retries
  baseDelayMs: 1000,
  maxDelayMs:  8000,
  jitterMs:    300,
};

// ═══════════════════════════════════════════════════
// QUICK LOCAL FIXER
// Fast regex-based fixes before AI repair
// ═══════════════════════════════════════════════════

function quickLocalFix(html: string): { fixed: string; changesApplied: string[] } {
  if (!html) return { fixed: html, changesApplied: [] };

  let fixed   = html;
  const changes: string[] = [];

  // Fix 1: controls-bar z-index < 25
  const controlsMatch = fixed.match(/(#controls-bar\s*\{[^}]*?)z-index\s*:\s*(\d+)/);
  if (controlsMatch && parseInt(controlsMatch[2]) < 25) {
    fixed = fixed.replace(
      /(#controls-bar\s*\{[^}]*?)z-index\s*:\s*\d+/,
      '$1z-index: 25'
    );
    changes.push('controls-bar z-index → 25');
  }

  // Fix 2: caption-bar z-index < 25
  const captionMatch = fixed.match(/(#caption-bar\s*\{[^}]*?)z-index\s*:\s*(\d+)/);
  if (captionMatch && parseInt(captionMatch[2]) < 25) {
    fixed = fixed.replace(
      /(#caption-bar\s*\{[^}]*?)z-index\s*:\s*\d+/,
      '$1z-index: 25'
    );
    changes.push('caption-bar z-index → 25');
  }

  // Fix 3: stats-bar z-index < 25
  const statsMatch = fixed.match(/(#stats-bar\s*\{[^}]*?)z-index\s*:\s*(\d+)/);
  if (statsMatch && parseInt(statsMatch[2]) < 25) {
    fixed = fixed.replace(
      /(#stats-bar\s*\{[^}]*?)z-index\s*:\s*\d+/,
      '$1z-index: 25'
    );
    changes.push('stats-bar z-index → 25');
  }

  // Fix 4: scene-element position:fixed → absolute
  if (fixed.includes('.scene-element') && fixed.includes('position: fixed')) {
    fixed = fixed.replace(
      /(\.scene-element\s*\{[^}]*?)position\s*:\s*fixed/g,
      '$1position: absolute'
    );
    changes.push('scene-element position fixed → absolute');
  }

  // Fix 5: sidebar overflow
  const sidebarMatch = fixed.match(/#sidebar-content\s*\{([^}]*)\}/);
  if (sidebarMatch && !sidebarMatch[1].includes('overflow')) {
    fixed = fixed.replace(
      /(#sidebar-content\s*\{)([^}]*?)(\})/,
      '$1$2overflow-y: auto;\n$3'
    );
    changes.push('sidebar overflow-y: auto added');
  }

  // Fix 6: duplicate </html>
  const htmlCloseCount = (fixed.match(/<\/html>/gi) || []).length;
  if (htmlCloseCount > 1) {
    const lastIdx = fixed.lastIndexOf('</html>');
    fixed = fixed.slice(0, lastIdx).replace(/<\/html>/gi, '') + '</html>';
    changes.push(`removed ${htmlCloseCount - 1} duplicate </html>`);
  }

  // Fix 7: unclosed <script> tags
  const openScripts  = (fixed.match(/<script/gi)    || []).length;
  const closeScripts = (fixed.match(/<\/script>/gi)  || []).length;
  if (openScripts > closeScripts) {
    const diff = openScripts - closeScripts;
    fixed = fixed.replace('</html>', '\n</script>'.repeat(diff) + '\n</html>');
    changes.push(`added ${diff} missing </script> tag(s)`);
  }

  // Fix 8: unclosed <style> tags
  const openStyles  = (fixed.match(/<style/gi)    || []).length;
  const closeStyles = (fixed.match(/<\/style>/gi) || []).length;
  if (openStyles > closeStyles) {
    const diff = openStyles - closeStyles;
    fixed = fixed.replace('</head>', '\n</style>'.repeat(diff) + '\n</head>');
    changes.push(`added ${diff} missing </style> tag(s)`);
  }

  // Fix 9: scene-area overflow hidden
  const sceneAreaMatch = fixed.match(/#scene-area\s*\{([^}]*)\}/);
  if (sceneAreaMatch && !sceneAreaMatch[1].includes('overflow')) {
    fixed = fixed.replace(
      /(#scene-area\s*\{)([^}]*?)(\})/,
      '$1$2overflow: hidden;\n$3'
    );
    changes.push('scene-area overflow: hidden added');
  }

  return { fixed, changesApplied: changes };
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
        { success: false, error: 'Please log in.' },
        { status: 401 }
      );
    }

    // ── Parse body ──────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    // ── Extract inputs ──────────────────────────────
    const html          = typeof body.html          === 'string' ? body.html          : '';
    const algorithmName = typeof body.algorithmName === 'string' ? body.algorithmName : 'Algorithm';
    const compactPrompt = typeof body.compactPrompt === 'string' ? body.compactPrompt : undefined;

    if (!html || html.trim().length < 200) {
      return NextResponse.json(
        { success: false, error: 'No HTML provided to repair.' },
        { status: 400 }
      );
    }

    console.log(
      '[Repair] Starting repair for:', algorithmName,
      '| HTML length:', html.length
    );

    // ── Step 1: Quick local fixes ───────────────────
    const { fixed: locallyFixed, changesApplied } = quickLocalFix(html);

    if (changesApplied.length > 0) {
      console.log('[Repair] Local fixes applied:', changesApplied);
    } else {
      console.log('[Repair] No local fixes needed');
    }

    // ── Step 2: Check if local fix is enough ────────
    if (validateRepairedHTML(locallyFixed) && changesApplied.length === 0) {
      console.log('[Repair] HTML already valid — skipping AI repair');
      return NextResponse.json(
        {
          success:     true,
          html:        locallyFixed,
          repairModel: 'none',
          warning:     'No issues found — returned original HTML.',
        },
        { status: 200 }
      );
    }

    // If local fixes were enough and HTML is valid, return without AI
    if (validateRepairedHTML(locallyFixed) && changesApplied.length > 0) {
      console.log('[Repair] Local fixes sufficient — skipping AI repair');
      return NextResponse.json(
        {
          success:     true,
          html:        locallyFixed,
          repairModel: 'local',
          fixes:       changesApplied,
        },
        { status: 200 }
      );
    }

    // ── Step 3: AI repair needed ────────────────────
    console.log('[Repair] Local fixes insufficient — trying AI repair...');

    const chain = buildRepairChain(locallyFixed, algorithmName, compactPrompt);

    try {
      const { result: repairedHTML, model: repairModel } = await runModelChain(
        chain,
        REPAIR_RETRY_CONFIG,
        'Repair'
      );

      console.log(`[Repair] ✅ AI repair complete via ${repairModel}`);
      console.log('[Repair] Repaired HTML length:', repairedHTML.length);

      return NextResponse.json(
        {
          success:     true,
          html:        repairedHTML,
          repairModel,
          localFixes:  changesApplied,
        },
        { status: 200 }
      );

    } catch (aiError) {
      // All AI repairs failed — return locally fixed version
      console.warn('[Repair] ❌ All AI repairs failed:', aiError);
      console.log('[Repair] Returning locally fixed HTML as fallback');

      return NextResponse.json(
        {
          success:     true,
          html:        locallyFixed,
          repairModel: 'local-only',
          warning:     'AI repair unavailable — basic fixes applied.',
          localFixes:  changesApplied,
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('[Repair] Unexpected error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('API_KEY') || message.includes('not set')) {
      return NextResponse.json(
        { success: false, error: 'Repair service not configured.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Repair failed — the original visualization will be used.' },
      { status: 500 }
    );
  }
}