// lib/ai/generator.ts

import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "@/types";
import type { CreativeDirection } from "@/lib/ai/analyzer";
import type { PromptArtifacts } from "@/lib/ai/prompts";

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════

const GEMINI_MODELS = {
   primary: "gemini-2.5-pro",
  secondary: "gemini-2.5-flash",
  tertiary: "gemini-2.5-flash-lite",
} as const;

const MAX_OUTPUT_TOKENS = 32000;
const MAX_REPAIR_TOKENS = 16000;
const MAX_RETRIES_PER_MODEL = 2;

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface GeneratorOutput {
  html: string;
  model: string;
  repaired: boolean;
  truncated: boolean;
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
      "Gemini API key not configured. Add GEMINI_API_KEY or GEMINI_API_KEYS in .env.local"
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
// HTML EXTRACTION + VALIDATION
// ═══════════════════════════════════════════════════

function extractHTML(rawText: string): string {
  let text = rawText.trim();

  // Remove think tags
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Remove markdown fences
  text = text.replace(/^```html\s*/i, "").replace(/^```\s*/i, "");
  text = text.replace(/```\s*$/i, "");
  text = text.trim();

  // Try to find <!DOCTYPE or <html
  const doctypeIndex = text.search(/<!DOCTYPE\s+html/i);
  const htmlIndex = text.search(/<html/i);
  const startIndex = doctypeIndex !== -1 ? doctypeIndex : htmlIndex;

  if (startIndex > 0) {
    text = text.slice(startIndex);
  }

  // Try to find </html>
  const htmlEndIndex = text.lastIndexOf("</html>");
  if (htmlEndIndex !== -1) {
    text = text.slice(0, htmlEndIndex + 7);
  }

  return text.trim();
}

function isHTMLComplete(html: string): boolean {
  const lower = html.toLowerCase();

  const hasDoctype = /<!doctype\s+html/i.test(html);
  const hasHtmlOpen = /<html/i.test(html);
  const hasHtmlClose = lower.includes("</html>");
  const hasHead = /<head/i.test(html) && lower.includes("</head>");
  const hasBody = /<body/i.test(html) && lower.includes("</body>");
  const hasStyle = /<style/i.test(html) && lower.includes("</style>");
  const hasScript = /<script/i.test(html) && lower.includes("</script>");

  return hasHtmlOpen && hasHtmlClose && hasBody && hasStyle && hasScript;
}

function isTruncated(html: string): boolean {
  const lower = html.toLowerCase().trim();

  // Missing closing tags
  if (!lower.includes("</html>")) return true;
  if (!lower.includes("</script>")) return true;
  if (!lower.includes("</body>")) return true;

  // Ends abruptly
  if (lower.endsWith("...")) return true;
  if (lower.endsWith("//")) return true;
  if (lower.endsWith("/*")) return true;

  // Unclosed braces in last script
  const lastScriptStart = html.lastIndexOf("<script");
  const lastScriptEnd = html.lastIndexOf("</script>");

  if (lastScriptStart !== -1 && lastScriptEnd > lastScriptStart) {
    const scriptContent = html.slice(lastScriptStart, lastScriptEnd);
    const openBraces = (scriptContent.match(/\{/g) || []).length;
    const closeBraces = (scriptContent.match(/\}/g) || []).length;

    if (openBraces - closeBraces > 3) return true;
  }

  return false;
}

function hasMinimumContent(html: string): boolean {
  // Must have reasonable length
  if (html.length < 500) return false;

  // Must have some CSS
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (!styleMatch || styleMatch[1].trim().length < 50) return false;

  // Must have some JS
  const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch || scriptMatch[1].trim().length < 100) return false;

  return true;
}

function validateHTML(html: string): {
  valid: boolean;
  complete: boolean;
  truncated: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const complete = isHTMLComplete(html);
  const truncated = isTruncated(html);
  const hasContent = hasMinimumContent(html);

  if (!complete) issues.push("HTML structure incomplete");
  if (truncated) issues.push("HTML appears truncated");
  if (!hasContent) issues.push("HTML has insufficient content");

  return {
    valid: hasContent,
    complete,
    truncated,
    issues,
  };
}

// ═══════════════════════════════════════════════════
// REPAIR SYSTEM
// ═══════════════════════════════════════════════════

function buildRepairPrompt(
  brokenHTML: string,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  // Take the last portion of HTML to identify where it broke
  const lastPart = brokenHTML.slice(-2000);

  return `
You are an expert HTML repair AI.

The following HTML visualization was cut off / truncated during generation.
Your job is to COMPLETE it — not restart it.

ALGORITHM: ${analysis.algorithmName}
SCENE: ${creativeDirection.sceneName}
METAPHOR: ${creativeDirection.metaphor}

The HTML so far ends with:
\`\`\`
${lastPart}
\`\`\`

RULES:
1. Output ONLY the REMAINING part that completes the HTML
2. Start exactly where it was cut off
3. Close all open tags, braces, functions
4. Make sure the final output includes:
   - closing </script> tag
   - closing </body> tag
   - closing </html> tag
5. If renderScene() or initVisualization() was cut, complete them
6. If window.STEPS array was cut, complete it with remaining steps
7. Do NOT restart the HTML from scratch
8. Do NOT include <!DOCTYPE> or <html> — only the remaining completion part

Output ONLY the completion code. No markdown. No explanation.
`.trim();
}

async function repairHTML(
  brokenHTML: string,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): Promise<string | null> {
  const keys = getGeminiApiKeys();
  const repairPrompt = buildRepairPrompt(brokenHTML, analysis, creativeDirection);
  const models = [GEMINI_MODELS.primary, GEMINI_MODELS.secondary];

  for (const model of models) {
    for (const key of keys) {
      try {
        console.log(`[Generator] Attempting repair via ${model}...`);

        const client = new GoogleGenAI({ apiKey: key });

        const response = await client.models.generateContent({
          model,
          contents: repairPrompt,
          config: {
            temperature: 0.1,
            maxOutputTokens: MAX_REPAIR_TOKENS,
          },
        });

        const completionText = response.text;

        if (!completionText || completionText.trim().length < 20) {
          console.warn("[Generator] Repair response too short, skipping");
          continue;
        }

        let completion = completionText.trim();

        // Remove markdown fences
        completion = completion
          .replace(/^```(?:html|javascript|js)?\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        // Find where to stitch
        // Remove any overlap with original
        const repairedHTML = stitchHTML(brokenHTML, completion);
        const validation = validateHTML(repairedHTML);

        if (validation.valid && validation.complete) {
          console.log(`[Generator] ✅ Repair successful via ${model}`);
          return repairedHTML;
        }

        console.warn(
          `[Generator] Repair via ${model} did not fully fix:`,
          validation.issues
        );
      } catch (error) {
        console.warn(
          `[Generator] Repair failed via ${model}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  return null;
}

function stitchHTML(original: string, completion: string): string {
  let combined = original;

  // If completion starts with closing tags or continuation code
  // just append it
  const trimmedCompletion = completion.trim();

  // Check for overlap (last 100 chars of original vs first 100 of completion)
  const overlapCheckLength = Math.min(100, original.length, trimmedCompletion.length);
  const originalEnd = original.slice(-overlapCheckLength);

  // Find if completion starts with something already in original
  let overlapIndex = -1;
  for (let len = overlapCheckLength; len >= 10; len--) {
    const chunk = originalEnd.slice(-len);
    if (trimmedCompletion.startsWith(chunk)) {
      overlapIndex = len;
      break;
    }
  }

  if (overlapIndex > 0) {
    // Remove overlap
    combined = original + trimmedCompletion.slice(overlapIndex);
  } else {
    combined = original + "\n" + trimmedCompletion;
  }

  // Ensure proper closing
  const lower = combined.toLowerCase();
  if (!lower.includes("</script>") && lower.includes("<script")) {
    combined += "\n</script>";
  }
  if (!lower.includes("</body>")) {
    combined += "\n</body>";
  }
  if (!lower.includes("</html>")) {
    combined += "\n</html>";
  }

  return combined;
}

// ═══════════════════════════════════════════════════
// MAIN GEMINI HTML GENERATOR
// ═══════════════════════════════════════════════════

async function callGeminiGenerator(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });

  const text = response.text;

  if (!text || text.trim().length === 0) {
    throw new Error(`Empty response from Gemini ${model}`);
  }

  return text;
}

async function runGenerator(
  prompt: string
): Promise<{ rawHTML: string; model: string }> {
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

          const rawText = await callGeminiGenerator(key, model, prompt);
          const html = extractHTML(rawText);

          if (!hasMinimumContent(html)) {
            console.warn(
              `[Generator] ${model} returned insufficient content, trying next...`
            );
            continue;
          }

          console.log(
            `[Generator] ✅ Got HTML from ${model} — ${html.length} chars`
          );

          return { rawHTML: html, model };
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
// FALLBACK HTML
// If everything fails, return a basic but functional HTML
// ═══════════════════════════════════════════════════

function buildFallbackHTML(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const steps = Array.isArray((analysis as any).steps)
    ? (analysis as any).steps
    : [];

  const stepsJSON = JSON.stringify(
    steps.map((s: any, i: number) => ({
      step: s.step ?? i + 1,
      caption: s.caption ?? s.description ?? `Step ${i + 1}`,
      action: s.action ?? "process",
      variables: s.variables ?? {},
      important: s.important ?? false,
    }))
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${analysis.algorithmName} Visualization</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: ${creativeDirection.colorPalette.background};
    color: #e2e8f0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .header {
    padding: 16px 24px;
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header h1 {
    font-size: 18px;
    color: ${creativeDirection.colorPalette.accent};
  }
  .header .meta {
    font-size: 12px;
    color: #94a3b8;
  }
  .scene {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
    position: relative;
  }
  .scene-title {
    font-size: 24px;
    font-weight: 700;
    color: ${creativeDirection.colorPalette.primary};
  }
  .scene-metaphor {
    font-size: 14px;
    color: #94a3b8;
    max-width: 600px;
    text-align: center;
    line-height: 1.6;
  }
  .caption-bar {
    padding: 16px 24px;
    min-height: 72px;
    background: rgba(255,255,255,0.03);
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
    color: #cbd5e1;
  }
  .controls {
    padding: 12px 24px;
    background: rgba(255,255,255,0.02);
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .controls button {
    padding: 8px 18px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }
  .controls button:hover {
    background: rgba(255,255,255,0.12);
  }
  .controls button.active {
    background: ${creativeDirection.colorPalette.accent};
    color: #0d1117;
    border-color: ${creativeDirection.colorPalette.accent};
  }
  .step-counter {
    font-size: 13px;
    color: #94a3b8;
    min-width: 80px;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${analysis.algorithmName}</h1>
    <span class="meta">${analysis.category} · ${analysis.timeComplexity}</span>
  </div>
  <div class="scene">
    <div class="scene-title">${creativeDirection.sceneName}</div>
    <div class="scene-metaphor">${creativeDirection.metaphor}</div>
  </div>
  <div class="caption-bar" id="caption">Loading visualization...</div>
  <div class="controls">
    <button onclick="reset()">⟲ Reset</button>
    <button onclick="prev()">◂ Prev</button>
    <button onclick="togglePlay()" id="playBtn">▶ Play</button>
    <button onclick="next()">Next ▸</button>
    <span class="step-counter" id="stepCounter">0 / 0</span>
    <button onclick="setSpeed(0.5)">0.5x</button>
    <button onclick="setSpeed(1)" class="active" id="speed1">1x</button>
    <button onclick="setSpeed(2)">2x</button>
  </div>
<script>
  const STEPS = ${stepsJSON};
  let currentStep = -1;
  let playing = false;
  let playInterval = null;
  let speed = 1;
  const caption = document.getElementById('caption');
  const stepCounter = document.getElementById('stepCounter');
  const playBtn = document.getElementById('playBtn');

  function showStep(index) {
    if (index < 0 || index >= STEPS.length) return;
    currentStep = index;
    const step = STEPS[currentStep];
    caption.textContent = step.caption;
    stepCounter.textContent = (currentStep + 1) + ' / ' + STEPS.length;
  }

  function next() {
    if (currentStep < STEPS.length - 1) showStep(currentStep + 1);
    else stopPlay();
  }

  function prev() {
    if (currentStep > 0) showStep(currentStep - 1);
  }

  function reset() {
    stopPlay();
    currentStep = -1;
    caption.textContent = 'Click Play or Next to begin.';
    stepCounter.textContent = '0 / ' + STEPS.length;
  }

  function togglePlay() {
    if (playing) stopPlay();
    else startPlay();
  }

  function startPlay() {
    playing = true;
    playBtn.textContent = '⏸ Pause';
    if (currentStep < 0) showStep(0);
    playInterval = setInterval(() => { next(); }, 1200 / speed);
  }

  function stopPlay() {
    playing = false;
    playBtn.textContent = '▶ Play';
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
  }

  function setSpeed(s) {
    speed = s;
    document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
    if (playing) { stopPlay(); startPlay(); }
  }

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight') next();
    if (e.code === 'ArrowLeft') prev();
    if (e.code === 'KeyR') reset();
  });

  // Auto-start
  caption.textContent = 'Click Play or Next to begin exploring ${analysis.algorithmName}.';
  stepCounter.textContent = '0 / ' + STEPS.length;
</script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

export async function generateVisualization(
  promptArtifacts: PromptArtifacts,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): Promise<GeneratorOutput> {
  console.log("[Generator] Starting HTML generation...");
  console.log("[Generator] Algorithm:", analysis.algorithmName);
  console.log("[Generator] Scene:", creativeDirection.sceneName);
  console.log("[Generator] Template:", promptArtifacts.templateType);

  // Decide which prompt to use
  // fullPrompt is more detailed, compactPrompt is token-safe fallback
  const prompt = promptArtifacts.fullPrompt;

  try {
    // ── Step 1: Generate HTML ──────────────────────
    const { rawHTML, model } = await runGenerator(prompt);

    // ── Step 2: Validate ───────────────────────────
    const validation = validateHTML(rawHTML);

    console.log("[Generator] Validation:", {
      valid: validation.valid,
      complete: validation.complete,
      truncated: validation.truncated,
      issues: validation.issues,
      length: rawHTML.length,
    });

    // ── Step 3: Repair if truncated ────────────────
    if (validation.truncated && validation.valid) {
      console.log("[Generator] HTML truncated, attempting repair...");

      const repaired = await repairHTML(rawHTML, analysis, creativeDirection);

      if (repaired) {
        return {
          html: repaired,
          model,
          repaired: true,
          truncated: false,
        };
      }

      console.warn("[Generator] Repair failed, using truncated HTML with forced closing tags");

      // Force close the HTML
      let forceClosed = rawHTML;
      const lower = forceClosed.toLowerCase();

      if (!lower.includes("</script>") && lower.includes("<script")) {
        // Try to close any open JS constructs
        forceClosed += "\n})();\n</script>";
      }
      if (!lower.includes("</body>")) {
        forceClosed += "\n</body>";
      }
      if (!lower.includes("</html>")) {
        forceClosed += "\n</html>";
      }

      return {
        html: forceClosed,
        model,
        repaired: false,
        truncated: true,
      };
    }

    // ── Step 4: Valid and complete ──────────────────
    if (validation.valid && validation.complete) {
      return {
        html: rawHTML,
        model,
        repaired: false,
        truncated: false,
      };
    }

    // ── Step 5: Not valid — try compact prompt ─────
    if (!validation.valid) {
      console.warn("[Generator] Full prompt output invalid, trying compact prompt...");

      try {
        const { rawHTML: compactHTML, model: compactModel } =
          await runGenerator(promptArtifacts.compactPrompt);

        const compactValidation = validateHTML(compactHTML);

        if (compactValidation.valid) {
          return {
            html: compactHTML,
            model: compactModel,
            repaired: false,
            truncated: compactValidation.truncated,
          };
        }
      } catch (compactError) {
        console.warn(
          "[Generator] Compact prompt also failed:",
          compactError instanceof Error ? compactError.message : String(compactError)
        );
      }
    }

    // ── Step 6: Return whatever we got ─────────────
    if (rawHTML.length > 200) {
      return {
        html: rawHTML,
        model,
        repaired: false,
        truncated: validation.truncated,
      };
    }

    // ── Step 7: Total failure — use fallback ───────
    console.warn("[Generator] All attempts produced poor results, using fallback HTML");

    return {
      html: buildFallbackHTML(analysis, creativeDirection),
      model: "fallback",
      repaired: false,
      truncated: false,
    };
  } catch (error) {
    console.error(
      "[Generator] Fatal error:",
      error instanceof Error ? error.message : String(error)
    );

    // Return fallback instead of crashing
    return {
      html: buildFallbackHTML(analysis, creativeDirection),
      model: "fallback",
      repaired: false,
      truncated: false,
    };
  }
}