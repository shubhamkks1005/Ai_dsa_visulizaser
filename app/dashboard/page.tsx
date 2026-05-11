"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import HistoryGrid from "@/components/dashboard/HistoryGrid";
import { HistoryItem } from "@/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const [previewHTML, setPreviewHTML] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handlePreview = async (item: HistoryItem) => {
    setPreviewItem(item);
    setLoadingPreview(true);

    try {
      const res = await fetch(`/api/history/${item._id}`);
      const data = await res.json();
      if (data.success) {
        setPreviewHTML(data.data.generatedHTML);
      }
    } catch {
      setPreviewHTML("<p>Failed to load preview</p>");
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewItem(null);
    setPreviewHTML("");
  };

  if (status === "loading") {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--accent)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="grid-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-3xl font-bold glow-cyan mb-1"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  color: "var(--text-primary)",
                }}
              >
                Dashboard
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Welcome back,{" "}
                <span style={{ color: "var(--accent)" }}>
                  {session?.user?.name}
                </span>{" "}
                👋
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href="/gallery"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-smooth"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                🎨 Gallery
              </a>
              <a
                href="/visualizer"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-smooth"
                style={{
                  background: "var(--accent)",
                  color: "#0d1117",
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                + New Visualization
              </a>
            </div>
          </div>

          {/* Divider */}
          <div
            className="mt-6 h-px"
            style={{
              background:
                "linear-gradient(90deg, var(--accent), transparent)",
              opacity: 0.3,
            }}
          />
        </div>

        {/* History Section */}
        <div>
          <h2
            className="text-lg font-semibold mb-6"
            style={{
              color: "var(--text-primary)",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            Your Visualizations
          </h2>
          <HistoryGrid onPreview={handlePreview} />
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={closePreview}
        >
          <div
            className="w-full max-w-5xl rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "Orbitron, sans-serif",
                  }}
                >
                  {previewItem.title}
                </h3>
                <span
                  className="text-xs"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {previewItem.language}
                </span>
              </div>
              <button
                onClick={closePreview}
                className="text-xl w-8 h-8 flex items-center justify-center rounded-lg transition-smooth"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-primary)",
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ height: "70vh" }}>
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "var(--accent)" }}
                  />
                </div>
              ) : (
                <iframe
                  srcDoc={previewHTML}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title={previewItem.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}