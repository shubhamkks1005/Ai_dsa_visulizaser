"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CodeEditor, { DEFAULT_CODE } from "@/components/visualizer/CodeEditor";
import ProgressBar from "@/components/visualizer/ProgressBar";
import PreviewFrame from "@/components/visualizer/PreviewFrame";
import { AnalysisResult } from "@/types";
import type { CreativeScene, TechnicalSpec } from "@/lib/ai/generator";

export default function VisualizerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Editor state
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");

  // Generation state
  const [stage, setStage] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [creativeScene, setCreativeScene] = useState<CreativeScene | null>(null);
  const [technicalSpec, setTechnicalSpec] = useState<TechnicalSpec | null>(null);
  const [compactPrompt, setCompactPrompt] = useState("");
  const [generatedHTML, setGeneratedHTML] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Panel collapse state
  const [codeCollapsed, setCodeCollapsed] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Smooth stage transition helper
  const advanceStage = useCallback((targetStage: number): Promise<void> => {
    return new Promise((resolve) => {
      setStage(targetStage);
      setTimeout(resolve, 400);
    });
  }, []);

  // ═══════════════════════════════════════
  // MAIN GENERATION FLOW
  // ═══════════════════════════════════════

  const handleGenerate = async () => {
    if (!code.trim()) return;

    setIsGenerating(true);
    setStage(0);
    setErrorMessage("");
    setAnalysis(null);
    setCreativeScene(null);
    setTechnicalSpec(null);
    setCompactPrompt("");
    setGeneratedHTML("");
    setSaved(false);

    try {
      // ── Stage 1: Reading code (0–20%) ──────────────────────
      await advanceStage(1);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || "Failed to analyze code");
      }

      const analysisResult: AnalysisResult = analyzeData.data;
      setAnalysis(analysisResult);

      // ── Stage 2: Creating personalized visualization (20–45%) ──
      await advanceStage(2);

      const promptRes = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: analysisResult }),
      });

      const promptData = await promptRes.json();

      if (!promptRes.ok || promptData.error) {
        throw new Error(promptData.error || "Failed to create visualization plan");
      }

      const { creativeScene: cs, technicalSpec: ts, compactPrompt: cp } = promptData;
      setCreativeScene(cs);
      setTechnicalSpec(ts);
      setCompactPrompt(cp);

      // ── Stage 3: Generating animation code (45–85%) ────────
      await advanceStage(3);

      const htmlRes = await fetch("/api/generate-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compactPrompt: cp,
          creativeScene: cs,
          technicalSpec: ts,
          analysis: analysisResult,
        }),
      });

      const htmlData = await htmlRes.json();

      if (!htmlRes.ok || htmlData.error) {
        throw new Error(htmlData.error || "Failed to generate visualization");
      }

      let html: string = htmlData.html;

      // ── Stage 4: Final polish (85–95%) ─────────────────────
      await advanceStage(4);

      try {
        const repairRes = await fetch("/api/repair-html", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html,
            compactPrompt: cp,
            algorithmName: analysisResult.algorithmName,
          }),
        });

        const repairData = await repairRes.json();

        if (repairRes.ok && repairData.html) {
          html = repairData.html;
          if (repairData.warning) {
            console.warn("[Visualizer] Repair warning:", repairData.warning);
          }
        }
      } catch (repairError) {
        console.warn("[Visualizer] Repair skipped:", repairError);
      }

      setGeneratedHTML(html);

      // ── Stage 5: Almost ready (95–100%) ────────────────────
      await advanceStage(5);
      await new Promise((r) => setTimeout(r, 600));

      // ── Stage 6: Complete ───────────────────────────────────
      await advanceStage(6);

      // Auto-collapse code panel when visualization is ready
      setCodeCollapsed(true);
    } catch (error) {
      console.error("Generation error:", error);
      setStage(-1);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ═══════════════════════════════════════
  // SAVE TO HISTORY
  // ═══════════════════════════════════════

  const handleSave = async () => {
    if (!analysis || !generatedHTML || saving) return;

    setSaving(true);

    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: analysis.algorithmName,
          language: analysis.language,
          originalCode: code,
          generatedHTML: generatedHTML,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaved(true);
      } else {
        alert(data.error || "Failed to save. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading screen
  if (status === "loading") {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)" }}
        />
      </main>
    );
  }

  // ═══════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════

  const hasVisualization = generatedHTML.length > 0;
  const showPreview = stage === 6 || (stage === 0 && !isGenerating);
  const showProgress = (stage > 0 && stage < 6) || stage === -1;

  // Dynamic widths
  const codeWidth = codeCollapsed ? "0px" : "27%";
  const vizWidth  = codeCollapsed ? "100%" : "73%";

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="grid-overlay" />

      <div className="relative z-10 flex flex-col h-screen">

        {/* ═══════════════════════════════════════════
            TOP BAR
        ═══════════════════════════════════════════ */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-lg font-bold glow-cyan"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  color: "var(--text-primary)",
                }}
              >
                AI Visualizer
              </h1>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Paste any algorithm → Get animated visualization
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle code panel button */}
              {hasVisualization && (
                <button
                  onClick={() => setCodeCollapsed(!codeCollapsed)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  title={codeCollapsed ? "Show code" : "Hide code"}
                >
                  {codeCollapsed ? "◀ Show Code" : "▶ Hide Code"}
                </button>
              )}

              <a
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-xs transition-smooth"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Dashboard
              </a>
              <a
                href="/gallery"
                className="px-3 py-1.5 rounded-lg text-xs transition-smooth"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Gallery
              </a>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ALGORITHM INFO BAR (above code, below topbar)
        ═══════════════════════════════════════════ */}
        {analysis && stage >= 2 && (
          <div
            className="px-4 py-2 flex-shrink-0 animate-slide-up-fade"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >
                  {analysis.algorithmName}
                </h3>

                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(99, 179, 237, 0.15)",
                    color: "var(--accent)",
                    border: "1px solid rgba(99, 179, 237, 0.3)",
                  }}
                >
                  {analysis.category}
                </span>

                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {analysis.timeComplexity}
                </span>

                {creativeScene && (
                  <span
                    className="text-xs italic"
                    style={{ color: "var(--text-muted)" }}
                  >
                    🎨 {creativeScene.sceneName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Save Button */}
                {generatedHTML && (
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: saved
                        ? "rgba(104, 211, 145, 0.15)"
                        : "var(--accent)",
                      color: saved ? "#68d391" : "#0d1117",
                      border: saved
                        ? "1px solid rgba(104, 211, 145, 0.3)"
                        : "none",
                      fontFamily: "Orbitron, sans-serif",
                    }}
                  >
                    {saved ? "✅ Saved" : saving ? "Saving..." : "💾 Save"}
                  </button>
                )}
              </div>
            </div>

            {analysis.description && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {analysis.description}
              </p>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MAIN CONTENT — Code + Preview
        ═══════════════════════════════════════════ */}
        <div className="flex-1 flex overflow-hidden">

          {/* ─── LEFT: Code Editor Panel ──────────── */}
          <div
            className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden"
            style={{
              width: codeCollapsed ? "0px" : "27%",
              minWidth: codeCollapsed ? "0px" : "280px",
              maxWidth: codeCollapsed ? "0px" : "420px",
              borderRight: codeCollapsed ? "none" : "1px solid var(--border)",
              opacity: codeCollapsed ? 0 : 1,
            }}
          >
            {/* Code Editor */}
            <div
              className="flex-1 overflow-hidden"
              style={{ minHeight: 0 }}
            >
              <CodeEditor
                code={code}
                language={language}
                onCodeChange={setCode}
                onLanguageChange={setLanguage}
                disabled={isGenerating}
              />
            </div>

            {/* Generate Button */}
            <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !code.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300"
                style={{
                  background:
                    isGenerating || !code.trim()
                      ? "var(--bg-card-hover)"
                      : "linear-gradient(135deg, var(--accent), #9f7aea)",
                  color:
                    isGenerating || !code.trim()
                      ? "var(--text-muted)"
                      : "#0d1117",
                  fontFamily: "Orbitron, sans-serif",
                  letterSpacing: "0.08em",
                  boxShadow:
                    isGenerating || !code.trim()
                      ? "none"
                      : "0 4px 20px rgba(99, 179, 237, 0.3)",
                }}
              >
                {isGenerating ? "⏳ Generating..." : "⚡ Generate"}
              </button>
            </div>
          </div>

          {/* ─── RIGHT: Preview Panel ─────────────── */}
          <div
            className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
            style={{ minWidth: 0 }}
          >
            {showProgress ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <ProgressBar stage={stage} errorMessage={errorMessage} />
              </div>
            ) : (
              <div className="flex-1 relative overflow-hidden">
                <PreviewFrame html={generatedHTML} loading={false} error="" />
              </div>
            )}
          </div>

        </div>

        {/* ═══════════════════════════════════════════
            FLOATING GENERATE BUTTON (when code collapsed)
        ═══════════════════════════════════════════ */}
        {codeCollapsed && (
          <button
            onClick={() => setCodeCollapsed(false)}
            className="fixed bottom-6 left-6 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-300 z-50"
            style={{
              background: "linear-gradient(135deg, var(--accent), #9f7aea)",
              color: "#0d1117",
              fontFamily: "Orbitron, sans-serif",
              boxShadow: "0 8px 32px rgba(99, 179, 237, 0.4)",
              letterSpacing: "0.06em",
            }}
          >
            ◀ Edit Code
          </button>
        )}

      </div>
    </main>
  );
}