// app/api/repair-html/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import {
  callWithGeminiRotation,
  runModelChain,
  getGroqKey,
  MODELS,
  GEMINI_RETRY_CONFIG,
  type ModelFn,
} from "@/lib/ai/ai-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 55;

// ═══════════════════════════════════════════════════
// HTML HELPERS
// ═══════════════════════════════════════════════════

function extractHTML(text: string): string {
  if (!text) return '';

  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  const fenceMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();

  const trimmed = text.trim();
  if (
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html')
  ) {
    return trimmed;
  }

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
// REPAIR PROMPTS
// ═══════════════════════════════════════════════════

function buildRepairSystemPrompt(): string {
  return `You are an expert HTML/CSS/JS debugger for algorithm visualizations.

Fix issues in the visualization HTML without changing creative content.

WHAT TO FIX:
1. Unclosed or malformed HTML tags
2. Z-index conflicts (controls/caption hidden behind scene)
3. Overflow issues (content clipping outside bounds)
4. Controls bar not visible (#controls-bar z-index >= 25)
5. Caption not visible (#caption-bar z-index >= 25)
6. Sidebar not scrollable (overflow-y: auto)
7. Missing </script> or </style> tags
8. JavaScript syntax errors
9. initVisualization() not called or called multiple times
10. window.STEPS empty or undefined

WHAT NOT TO CHANGE:
- Creative theme, colors, metaphor
- Hero character design
- Environment and background
- Step data and captions
- Algorithm logic
- Working animations

Z-INDEX RULES:
  background:  1-4
  elements:    5-14
  pointers:    15-24
  panels/UI:   25-29
  overlays:    30+

OUTPUT RULES:
- Return ONLY the complete fixed HTML
- Start with <!DOCTYPE html>
- End with </html>
- No explanation, no markdown`;
}

function buildRepairUserPrompt(
  html:          string,
  algorithmName: string,
  maxChars:      number = 12000
): string {
  const htmlPreview = html.length > maxChars
    ? html.slice(0, maxChars) + '\n\n... [truncated] ...\n</body>\n</html>'
    : html;

  return `Fix this ${algorithmName} visualization HTML.

HTML TO REPAIR:
${htmlPreview}

Return the complete fixed HTML starting with <!DOCTYPE html>.`;
}

// ═══════════════════════════════════════════════════
// QUICK LOCAL FIXER
// ═══════════════════════════════════════════════════

function quickLocalFix(html: string): {
  fixed:         string;
  changesApplied: string[];
} {
  if (!html) return { fixed: html, changesApplied: [] };

  let fixed           = html;
  const changes: string[] = [];

  // Fix 1: controls-bar z-index
  const ctrlMatch = fixed.match(/(#controls-bar\s*\{[^}]*?)z-index\s*:\s*(\d+)/);
  if (ctrlMatch && parseInt(ctrlMatch[2]) < 25) {
    fixed = fixed.replace(
      /(#controls-bar\s*\{[^}]*?)z-index\s*:\s*\d+/,
      '$1z-index: 25'
    );
    changes.push('controls-bar z-index → 25');
  }

  // Fix 2: caption-bar z-index
  const capMatch = fixed.match(/(#caption-bar\s*\{[^}]*?)z-index\s*:\s*(\d+)/);
  if (capMatch && parseInt(capMatch[2]) < 25) {
    fixed = fixed.replace(
      /(#caption-bar\s*\{[^}]*?)z-index\s*:\s*\d+/,
      '$1z-index: 25'
    );
    changes.push('caption-bar z-index → 25');
  }

  // Fix 3: stats-bar z-index
  const statsMatch = fixed.match(/(#stats-bar\s*\{[^}]*?)z-index\s*:\s*(\d+)/);
  if (statsMatch && parseInt(statsMatch[2]) < 25) {
    fixed = fixed.replace(
      /(#stats-bar\s*\{[^}]*?)z-index\s*:\s*\d+/,
      '$1z-index: 25'
    );
    changes.push('stats-bar z-index → 25');
  }

  // Fix 4: scene-element position fixed → absolute
  if (fixed.includes('.scene-element') && fixed.includes('position: fixed')) {
    fixed = fixed.replace(
      /(\.scene-element\s*\{[^}]*?)position\s*:\s*fixed/g,
      '$1position: absolute'
    );
    changes.push('scene-element position fixed → absolute');
  }

  // Fix 5: sidebar overflow
  if (fixed.includes('#sidebar-content')) {
    const sidebarMatch = fixed.match(/#sidebar-content\s*\{([^}]*)\}/);
    if (sidebarMatch && !sidebarMatch[1].includes('overflow')) {
      fixed = fixed.replace(
        /(#sidebar-content\s*\{)([^}]*?)(\})/,
        '$1$2overflow-y: auto;\n$3'
      );
      changes.push('sidebar-content overflow-y: auto');
    }
  }

  // Fix 6: duplicate </html>
  const htmlCloseCount = (fixed.match(/<\/html>/gi) || []).length;
  if (htmlCloseCount > 1) {
    const lastIdx = fixed.lastIndexOf('</html>');
    fixed = fixed.slice(0, lastIdx).replace(/<\/html>/gi, '') + '</html>';
    changes.push(`removed ${htmlCloseCount - 1} duplicate </html>`);
  }

  // Fix 7: unclosed <script>
  const openScripts  = (fixed.match(/<script/gi)   || []).length;
  const closeScripts = (fixed.match(/<\/script>/gi) || []).length;
  if (openScripts > closeScripts) {
    const diff = openScripts - closeScripts;
    fixed = fixed.replace('</html>', '\n</script>'.repeat(diff) + '\n</html>');
    changes.push(`added ${diff} missing </script>`);
  }

  // Fix 8: unclosed <style>
  const openStyles  = (fixed.match(/<style/gi)   || []).length;
  const closeStyles = (fixed.match(/<\/style>/gi) || []).length;
  if (openStyles > closeStyles) {
    const diff = openStyles - closeStyles;
    fixed = fixed.replace('</head>', '\n</style>'.repeat(diff) + '\n</head>');
    changes.push(`added ${diff} missing </style>`);
  }

  // Fix 9: scene-area overflow
  if (fixed.includes('#scene-area')) {
    const sceneAreaMatch = fixed.match(/#scene-area\s*\{([^}]*)\}/);
    if (sceneAreaMatch && !sceneAreaMatch[1].includes('overflow')) {
      fixed = fixed.replace(
        /(#scene-area\s*\{)([^}]*?)(\})/,
        '$1$2overflow: hidden;\n$3'
      );
      changes.push('scene-area overflow: hidden');
    }
  }

  return { fixed, changesApplied: changes };
}

// ═══════════════════════════════════════════════════
// GEMINI REPAIR CALLER
// ═══════════════════════════════════════════════════

async function callGeminiRepair(
  modelName:     string,
  html:          string,
  algorithmName: string,
  label:         string
): Promise<string> {
  return callWithGeminiRotation(modelName, async (apiKey) => {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model:    modelName,
      contents: buildRepairSystemPrompt() + '\n\n' +
                buildRepairUserPrompt(html, algorithmName, 12000),
    });

    const text     = response.text;
    const repaired = extractHTML(text || '');

    if (!validateRepairedHTML(repaired)) {
      throw new Error(`${label} repair produced invalid HTML`);
    }

    return repaired;
  }, GEMINI_RETRY_CONFIG);
}

// ═══════════════════════════════════════════════════
// GROQ REPAIR CALLER
// ═══════════════════════════════════════════════════

async function callGroqRepair(
  html:          string,
  algorithmName: string
): Promise<string> {
  const groq = new Groq({ apiKey: getGroqKey() });

  const completion = await groq.chat.completions.create({
    model: MODELS.groq.llama70B,
    messages: [
      { role: 'system', content: buildRepairSystemPrompt() },
      { role: 'user',   content: buildRepairUserPrompt(html, algorithmName, 8000) },
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
// REPAIR CHAIN BUILDER
// ═══════════════════════════════════════════════════

function buildRepairChain(
  html:          string,
  algorithmName: string
): ModelFn<string>[] {
  return [
    // 1. Gemini Flash Lite — cheap + fast for repair
    {
      name: 'Gemini Flash Lite (Repair)',
      fn:   () => callGeminiRepair(
        MODELS.gemini.flashLite,
        html,
        algorithmName,
        'Gemini Flash Lite'
      ),
    },

    // 2. Groq — last resort
    {
      name: 'Groq (Repair)',
      fn:   () => callGroqRepair(html, algorithmName),
    },
  ];
}

// ═══════════════════════════════════════════════════
// REPAIR RETRY CONFIG
// ═══════════════════════════════════════════════════

const REPAIR_RETRY_CONFIG = {
  maxRetries:  1,
  baseDelayMs: 1000,
  maxDelayMs:  6000,
  jitterMs:    200,
};

// ═══════════════════════════════════════════════════
// POST HANDLER
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {

    // ── Auth ────────────────────────────────────────
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

    const html          = typeof body.html          === 'string' ? body.html          : '';
    const algorithmName = typeof body.algorithmName === 'string' ? body.algorithmName : 'Algorithm';

    if (!html || html.trim().length < 200) {
      return NextResponse.json(
        { success: false, error: 'No HTML provided to repair.' },
        { status: 400 }
      );
    }

    console.log('[Repair] Starting for:', algorithmName, '| Length:', html.length);

    // ── Step 1: Local fixes ─────────────────────────
    const { fixed: locallyFixed, changesApplied } = quickLocalFix(html);

    if (changesApplied.length > 0) {
      console.log('[Repair] Local fixes:', changesApplied);
    }

    // ── Step 2: If no changes + already valid → return
    if (validateRepairedHTML(locallyFixed) && changesApplied.length === 0) {
      console.log('[Repair] Already valid — no repair needed');
      return NextResponse.json(
        {
          success:     true,
          html:        locallyFixed,
          repairModel: 'none',
        },
        { status: 200 }
      );
    }

    // ── Step 3: If local fixes sufficient → return
    if (validateRepairedHTML(locallyFixed)) {
      console.log('[Repair] Local fixes sufficient');
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

    // ── Step 4: AI repair needed ────────────────────
    console.log('[Repair] AI repair needed...');

    const chain = buildRepairChain(locallyFixed, algorithmName);

    try {
      const { result: repairedHTML, model: repairModel } = await runModelChain(
        chain,
        REPAIR_RETRY_CONFIG,
        'Repair'
      );

      console.log(`[Repair] ✅ Complete via ${repairModel}`);

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
      // AI repair failed — return locally fixed as best effort
      console.warn('[Repair] AI repair failed — using local fixes:', aiError);

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

    return NextResponse.json(
      {
        success: false,
        error:   'Repair failed — original visualization will be used.',
      },
      { status: 500 }
    );
  }
}