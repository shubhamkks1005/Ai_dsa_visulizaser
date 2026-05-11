"use client";

interface ProgressBarProps {
  stage: number; // 0 = idle, 1-5 = stages, 6 = complete, -1 = error
  errorMessage?: string;
}

const STAGES = [
  { percent: 0, message: "" },
  { percent: 15, message: "Reading your code..." },
  { percent: 40, message: "Understanding the algorithm..." },
  { percent: 60, message: "Planning the visualization..." },
  { percent: 90, message: "Generating animation..." },
  { percent: 97, message: "Almost ready..." },
  { percent: 100, message: "Visualization ready!" },
];

export default function ProgressBar({
  stage,
  errorMessage,
}: ProgressBarProps) {
  // Error state
  if (stage === -1) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div
          className="glass p-6 text-center"
          style={{ borderRadius: "12px" }}
        >
          {/* Error icon */}
          <div className="text-3xl mb-3">⚠️</div>

          <p
            className="text-sm font-medium mb-2"
            style={{ color: "#fc8181" }}
          >
            Something went wrong
          </p>

          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {errorMessage || "Please try again."}
          </p>
        </div>
      </div>
    );
  }

  // Idle state — nothing to show
  if (stage === 0) return null;

  const currentStage = STAGES[Math.min(stage, 6)];
  const isComplete = stage === 6;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className="glass p-6"
        style={{ borderRadius: "12px" }}
      >
        {/* Stage message */}
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-medium"
            style={{
              color: isComplete
                ? "#68d391"
                : "var(--text-primary)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isComplete ? "✅ " : ""}
            {currentStage.message}
          </p>
          <span
            className="text-xs font-mono"
            style={{
              color: isComplete
                ? "#68d391"
                : "var(--accent)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {currentStage.percent}%
          </span>
        </div>

        {/* Progress bar track */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: "6px",
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Progress bar fill */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${currentStage.percent}%`,
              background: isComplete
                ? "linear-gradient(90deg, #68d391, #38a169)"
                : "linear-gradient(90deg, var(--accent), #9f7aea)",
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isComplete
                ? "0 0 12px rgba(104, 211, 145, 0.4)"
                : "0 0 12px rgba(99, 179, 237, 0.3)",
            }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex justify-between mt-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className="flex items-center gap-1"
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background:
                    stage >= s
                      ? isComplete
                        ? "#68d391"
                        : "var(--accent)"
                      : "var(--bg-card-hover)",
                  boxShadow:
                    stage === s
                      ? "0 0 6px rgba(99, 179, 237, 0.5)"
                      : "none",
                }}
              />
              <span
                className="text-xs hidden sm:inline"
                style={{
                  color:
                    stage >= s
                      ? "var(--text-secondary)"
                      : "var(--text-muted)",
                  fontSize: "10px",
                }}
              >
                {s === 1
                  ? "Read"
                  : s === 2
                  ? "Analyze"
                  : s === 3
                  ? "Plan"
                  : s === 4
                  ? "Generate"
                  : "Render"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}