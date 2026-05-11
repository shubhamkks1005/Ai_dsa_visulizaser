"use client";

import { useState, useEffect, useCallback } from "react";
import HistoryCard from "./HistoryCard";
import { HistoryItem } from "@/types";

interface HistoryGridProps {
  onPreview: (item: HistoryItem) => void;
}

export default function HistoryGrid({ onPreview }: HistoryGridProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history");
      const data = await res.json();

      if (!res.ok) {
        setError("Failed to load history");
        return;
      }

      setHistory(data.data || []);
    } catch {
      setError("Network error. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((item) => item._id !== id));
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="glass p-5 animate-pulse"
            style={{ height: "180px", borderRadius: "12px" }}
          >
            <div
              className="h-4 rounded mb-3"
              style={{ background: "var(--bg-card-hover)", width: "60%" }}
            />
            <div
              className="h-3 rounded mb-2"
              style={{ background: "var(--bg-card-hover)", width: "40%" }}
            />
            <div
              className="h-12 rounded mb-4"
              style={{ background: "var(--bg-card-hover)" }}
            />
            <div
              className="h-8 rounded"
              style={{ background: "var(--bg-card-hover)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="glass p-8 text-center"
        style={{ borderRadius: "12px" }}
      >
        <p style={{ color: "#fc8181" }}>⚠️ {error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 rounded-lg text-sm"
          style={{
            background: "var(--accent)",
            color: "#0d1117",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <div
        className="glass p-12 text-center"
        style={{ borderRadius: "12px" }}
      >
        <div className="text-4xl mb-4">🧠</div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          No visualizations yet
        </h3>
        <p
          className="text-sm mb-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Paste any algorithm code and generate your first visualization
        </p>
        <a
          href="/visualizer"
          className="px-6 py-3 rounded-lg text-sm font-semibold inline-block"
          style={{
            background: "var(--accent)",
            color: "#0d1117",
            fontFamily: "Orbitron, sans-serif",
          }}
        >
          Start Visualizing →
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Count */}
      <p
        className="text-sm mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        {history.length} / 20 visualizations saved
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <HistoryCard
            key={item._id}
            item={item}
            onDelete={handleDelete}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}