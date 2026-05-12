"use client";

interface PreviewFrameProps {
  html: string;
  loading: boolean;
  error?: string;
}

export default function PreviewFrame({
  html,
  loading,
  error,
}: PreviewFrameProps) {
  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden relative"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        minHeight: "400px",
      }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mb-6"
            style={{ borderColor: "var(--accent)" }}
          />
          <p
            className="text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Rendering visualization...
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            Your animated algorithm is loading
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full p-8">
          <div
            className="glass p-8 text-center max-w-md"
            style={{ borderRadius: "12px" }}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "#fc8181" }}
            >
              Preview failed
            </p>
            <p
              className="text-xs mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: "var(--accent)",
                color: "#0d1117",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      ) : html ? (
        <iframe
          srcDoc={html}
          className="w-full border-0"
          sandbox="allow-scripts allow-same-origin"
          title="Algorithm Visualization"
          style={{
            height: "100%",
            minHeight: "500px",
            background: "#0d1117",
            borderRadius: "12px",
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full p-8 text-center">
          <div className="max-w-md">
            <div className="text-6xl mb-6 opacity-20">🎬</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{
                color: "var(--text-primary)",
                fontFamily: "Orbitron, sans-serif",
              }}
            >
              Visualization Preview
            </h3>
            <p
              className="text-sm mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Your generated animation will appear here once processing is complete.
            </p>
            <div
              className="text-xs px-4 py-2 rounded-full inline-block"
              style={{
                background: "rgba(99, 179, 237, 0.1)",
                border: "1px solid rgba(99, 179, 237, 0.2)",
                color: "var(--accent)",
              }}
            >
              Ready for your first visualization
            </div>
          </div>
        </div>
      )}
    </div>
  );
}