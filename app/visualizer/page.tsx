"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CodeEditor, { DEFAULT_CODE } from "@/components/visualizer/CodeEditor";
import ProgressBar from "@/components/visualizer/ProgressBar";
import PreviewFrame from "@/components/visualizer/PreviewFrame";
import { AnalysisResult } from "@/types";

export default function VisualizerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Editor state
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");

  // Generation state
  const [stage, setStage] = useState(0); // 0=idle, 1-5=stages, 6=complete, -1=error
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Results
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generatedHTML, setGeneratedHTML] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Smooth stage transition helper
  const advanceStage = useCallback(
    (targetStage: number): Promise<void> => {
      return new Promise((resolve) => {
        setStage(targetStage);
        setTimeout(resolve, 400); // min 400ms per stage
      });
    },
    []
  );

  // ═══════════════════════════════════════
  // MAIN GENERATION FLOW
  // ═══════════════════════════════════════

  const handleGenerate = async () => {
    if (!code.trim()) return;

    setIsGenerating(true);
    setStage(0);
    setErrorMessage("");
    setAnalysis(null);
    setGeneratedHTML("");
    setSaved(false);

    try {
      // Stage 1: Reading code
      await advanceStage(1);

      // Stage 2: Analyzing with AI
      await advanceStage(2);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(
          analyzeData.error || "Failed to analyze code"
        );
      }

      const analysisResult: AnalysisResult = analyzeData.data;
      setAnalysis(analysisResult);

      // Stage 3: Planning visualization
      await advanceStage(3);

      // Stage 4: Generating animation
      await advanceStage(4);

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: analysisResult }),
      });

      const generateData = await generateRes.json();

      if (!generateRes.ok || !generateData.success) {
        throw new Error(
          generateData.error || "Failed to generate visualization"
        );
      }

      const html = generateData.data.html;
      setGeneratedHTML(html);

      // Stage 5: Almost ready
      await advanceStage(5);

      // Stage 6: Complete
      await advanceStage(6);
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

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="grid-overlay" />

      <div className="relative z-10">
        {/* Top Bar */}
        <div
          className="px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div>
              <h1
                className="text-xl font-bold glow-cyan"
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

            <div className="flex items-center gap-3">
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

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: "calc(100vh - 120px)" }}>
            {/* LEFT — Code Editor */}
            <div className="flex flex-col gap-4">
              {/* Editor */}
              <div className="flex-1" style={{ minHeight: "400px" }}>
                <CodeEditor
                  code={code}
                  language={language}
                  onCodeChange={setCode}
                  onLanguageChange={setLanguage}
                  disabled={isGenerating}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !code.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300"
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
                {isGenerating
                  ? "⏳ Generating..."
                  : "⚡ Generate Visualization"}
              </button>
            </div>

            {/* RIGHT — Preview + Info */}
            <div className="flex flex-col gap-4">
              {/* Analysis Info Card (shows after analysis) */}
              {analysis && stage >= 3 && (
                <div
                  className="glass p-4 animate-slide-up-fade"
                  style={{ borderRadius: "12px" }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {/* Algorithm name */}
                      <h3
                        className="text-sm font-bold"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "Orbitron, sans-serif",
                        }}
                      >
                        {analysis.algorithmName}
                      </h3>

                      {/* Category badge */}
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

                      {/* Complexity */}
                      <span
                        className="text-xs"
                        style={{
                          color: "var(--text-muted)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {analysis.timeComplexity}
                      </span>
                    </div>

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
                        {saved
                          ? "✅ Saved"
                          : saving
                          ? "Saving..."
                          : "💾 Save"}
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {analysis.description}
                  </p>
                </div>
              )}

              {/* Progress Bar (during generation) */}
              {(stage > 0 && stage < 6) || stage === -1 ? (
                <div className="flex-1 flex items-center justify-center">
                  <ProgressBar
                    stage={stage}
                    errorMessage={errorMessage}
                  />
                </div>
              ) : (
                /* Preview Frame (after generation or idle) */
                <div className="flex-1 relative" style={{ minHeight: "400px" }}>
                  <PreviewFrame
                    html={generatedHTML}
                    loading={false}
                    error=""
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}