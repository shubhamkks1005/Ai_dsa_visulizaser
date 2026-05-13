// app/visualizer/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CodeEditor, { DEFAULT_CODE } from "@/components/visualizer/CodeEditor";
import ProgressBar from "@/components/visualizer/ProgressBar";
import PreviewFrame from "@/components/visualizer/PreviewFrame";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface AnalysisData {
  algorithmName: string;
  category: string;
  language: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  steps: any[];
  [key: string]: any;
}

interface CreativeData {
  sceneName: string;
  metaphor: string;
  heroCharacter: {
    type: string;
    look: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface GenerationResult {
  analysis: AnalysisData;
  creativeDirection: CreativeData;
  templateType: string;
  html: string;
  model: string;
  repaired: boolean;
  truncated: boolean;
}

// ═══════════════════════════════════════════════════
// PROGRESS SIMULATION
// Smooth progress that feels real during single API call
// ═══════════════════════════════════════════════════

function useProgressSimulation() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [stageLabel, setStageLabel] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = useCallback(() => {
    setProgress(0);
    setStage(1);
    setStageLabel("Reading your code...");

    let currentProgress = 0;

    // Stage transitions with smooth progress
    const stages = [
      { at: 0, label: "Reading your code...", stage: 1 },
      { at: 15, label: "Analyzing algorithm...", stage: 2 },
      { at: 30, label: "Creating visual scene...", stage: 3 },
      { at: 50, label: "Building 48-section prompt...", stage: 4 },
      { at: 65, label: "Generating cinematic HTML...", stage: 5 },
      { at: 80, label: "Polishing animations...", stage: 6 },
      { at: 90, label: "Almost ready...", stage: 7 },
    ];

    intervalRef.current = setInterval(() => {
      // Slow down as we approach 92% (never reach 100 until done)
      if (currentProgress < 50) {
        currentProgress += Math.random() * 2.5 + 0.8;
      } else if (currentProgress < 75) {
        currentProgress += Math.random() * 1.5 + 0.4;
      } else if (currentProgress < 88) {
        currentProgress += Math.random() * 0.8 + 0.2;
      } else if (currentProgress < 92) {
        currentProgress += Math.random() * 0.3 + 0.05;
      }

      currentProgress = Math.min(currentProgress, 92);
      setProgress(Math.round(currentProgress));

      // Update stage label
      for (let i = stages.length - 1; i >= 0; i--) {
        if (currentProgress >= stages[i].at) {
          setStage(stages[i].stage);
          setStageLabel(stages[i].label);
          break;
        }
      }
    }, 300);
  }, []);

  const completeProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setProgress(95);
    setStage(8);
    setStageLabel("Rendering visualization...");

    timeoutRef.current = setTimeout(() => {
      setProgress(100);
      setStage(9);
      setStageLabel("Done!");
    }, 500);
  }, []);

  const failProgress = useCallback((errorMsg: string) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setStage(-1);
    setStageLabel(errorMsg);
  }, []);

  const resetProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setProgress(0);
    setStage(0);
    setStageLabel("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    progress,
    stage,
    stageLabel,
    startProgress,
    completeProgress,
    failProgress,
    resetProgress,
  };
}

// ═══════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════

export default function VisualizerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Editor state
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState("javascript");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Results
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generatedHTML, setGeneratedHTML] = useState("");

  // Save state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Panel collapse
  const [codeCollapsed, setCodeCollapsed] = useState(false);

  // Progress simulation
  const {
    progress,
    stage,
    stageLabel,
    startProgress,
    completeProgress,
    failProgress,
    resetProgress,
  } = useProgressSimulation();

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ═══════════════════════════════════════
  // MAIN GENERATION FLOW — Single API Call
  // ═══════════════════════════════════════

  const handleGenerate = async () => {
    if (!code.trim() || isGenerating) return;

    // Reset everything
    setIsGenerating(true);
    setErrorMessage("");
    setResult(null);
    setGeneratedHTML("");
    setSaved(false);
    resetProgress();

    // Start progress simulation
    startProgress();

    try {
      // Single API call — does everything
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate visualization");
      }

      const generationResult: GenerationResult = data.data;

      // Set results
      setResult(generationResult);
      setGeneratedHTML(generationResult.html);

      // Complete progress
      completeProgress();

      // Auto-collapse code panel after short delay
      setTimeout(() => {
        setCodeCollapsed(true);
      }, 800);
    } catch (error) {
      console.error("Generation error:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setErrorMessage(msg);
      failProgress(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // ═══════════════════════════════════════
  // SAVE TO HISTORY
  // ═══════════════════════════════════════

  const handleSave = async () => {
    if (!result || !generatedHTML || saving) return;

    setSaving(true);

    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.analysis.algorithmName,
          language: result.analysis.language,
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

  // ═══════════════════════════════════════
  // LOADING SCREEN
  // ═══════════════════════════════════════

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
  const showPreview = stage === 9 || (stage === 0 && !isGenerating);
  const showProgress = stage > 0 && stage < 9;
  const showError = stage === -1;

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
              {/* Toggle code panel */}
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
            ALGORITHM INFO BAR
        ═══════════════════════════════════════════ */}
        {result && (showPreview || showProgress) && (
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
                  {result.analysis.algorithmName}
                </h3>

                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(99, 179, 237, 0.15)",
                    color: "var(--accent)",
                    border: "1px solid rgba(99, 179, 237, 0.3)",
                  }}
                >
                  {result.analysis.category}
                </span>

                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {result.analysis.timeComplexity}
                </span>

                <span
                  className="text-xs italic"
                  style={{ color: "var(--text-muted)" }}
                >
                  🎨 {result.creativeDirection.sceneName}
                </span>

                {/* Model + Repair info */}
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)", opacity: 0.6 }}
                >
                  via {result.model}
                  {result.repaired ? " (repaired)" : ""}
                  {result.truncated ? " ⚠️" : ""}
                </span>
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

                {/* Regenerate Button */}
                {generatedHTML && !isGenerating && (
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: "rgba(159, 122, 234, 0.15)",
                      color: "#d6bcfa",
                      border: "1px solid rgba(159, 122, 234, 0.3)",
                      fontFamily: "Orbitron, sans-serif",
                    }}
                  >
                    🔄 Regenerate
                  </button>
                )}
              </div>
            </div>

            {result.analysis.description && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {result.analysis.description}
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
              borderRight: codeCollapsed
                ? "none"
                : "1px solid var(--border)",
              opacity: codeCollapsed ? 0 : 1,
            }}
          >
            {/* Code Editor */}
            <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              <CodeEditor
                code={code}
                language={language}
                onCodeChange={setCode}
                onLanguageChange={setLanguage}
                disabled={isGenerating}
              />
            </div>

            {/* Generate Button */}
            <div
              className="p-3 flex-shrink-0"
              style={{ borderTop: "1px solid var(--border)" }}
            >
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
            {/* Progress / Loading State */}
            {(showProgress || showError) && (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Progress Bar */}
                <div
                  className="w-full max-w-md mb-8"
                  style={{ maxWidth: "480px" }}
                >
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: showError
                          ? "#fb7185"
                          : "linear-gradient(90deg, var(--accent), #9f7aea)",
                      }}
                    />
                  </div>

                  {/* Stage Label */}
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className="text-sm"
                      style={{
                        color: showError
                          ? "#fb7185"
                          : "var(--text-secondary)",
                      }}
                    >
                      {stageLabel}
                    </span>
                    {!showError && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {progress}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Animated Icon */}
                {showProgress && (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="text-4xl animate-pulse"
                      style={{ animationDuration: "1.5s" }}
                    >
                      {stage <= 2 && "🔍"}
                      {stage === 3 && "🎨"}
                      {stage === 4 && "📝"}
                      {stage === 5 && "⚙️"}
                      {stage === 6 && "✨"}
                      {stage >= 7 && "🚀"}
                    </div>
                    <p
                      className="text-xs text-center max-w-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {stage <= 2 &&
                        "Understanding your algorithm and tracing its execution..."}
                      {stage === 3 &&
                        "Creating a cinematic visual scene with characters and environment..."}
                      {stage === 4 &&
                        "Building a detailed 48-section personalized prompt..."}
                      {stage === 5 &&
                        "Generating complete HTML with animations, controls, and visuals..."}
                      {stage === 6 &&
                        "Adding final cinematic polish and accessibility features..."}
                      {stage >= 7 &&
                        "Preparing your visualization for display..."}
                    </p>
                  </div>
                )}

                {/* Error State */}
                {showError && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-4xl">❌</div>
                    <p
                      className="text-sm text-center max-w-md"
                      style={{ color: "#fb7185" }}
                    >
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleGenerate}
                      className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--accent), #9f7aea)",
                        color: "#0d1117",
                        fontFamily: "Orbitron, sans-serif",
                      }}
                    >
                      🔄 Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preview Frame */}
            {showPreview && (
              <div className="flex-1 relative overflow-hidden">
                {hasVisualization ? (
                  <PreviewFrame html={generatedHTML} loading={false} error="" />
                ) : (
                  /* Empty State */
                  <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
                    <div className="text-6xl mb-6 opacity-30">🎬</div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "Orbitron, sans-serif",
                      }}
                    >
                      Ready to Visualize
                    </h3>
                    <p
                      className="text-sm text-center max-w-md mb-6"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Paste any algorithm code on the left and click Generate.
                      The AI will create a cinematic, interactive visualization
                      with characters, animations, and educational captions.
                    </p>
                    <div
                      className="flex flex-wrap items-center justify-center gap-2"
                    >
                      {[
                        "Bubble Sort",
                        "Binary Search",
                        "Frog Jump",
                        "Rain Water",
                        "Dijkstra",
                        "Merge Sort",
                      ].map((name) => (
                        <span
                          key={name}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{
                            background: "rgba(99, 179, 237, 0.08)",
                            color: "var(--text-muted)",
                            border: "1px solid rgba(99, 179, 237, 0.15)",
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            FLOATING EDIT CODE BUTTON (when collapsed)
        ═══════════════════════════════════════════ */}
        {codeCollapsed && (
          <button
            onClick={() => setCodeCollapsed(false)}
            className="fixed bottom-6 left-6 px-4 py-3 rounded-xl font-bold text-xs transition-all duration-300 z-50"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), #9f7aea)",
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