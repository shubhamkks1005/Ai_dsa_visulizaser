"use client";

import { useState } from "react";
import { HistoryItem } from "@/types";

interface HistoryCardProps {
  item: HistoryItem;
  onDelete: (id: string) => void;
  onPreview: (item: HistoryItem) => void;
}

export default function HistoryCard({
  item,
  onDelete,
  onPreview,
}: HistoryCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this visualization?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/history/${item._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
       if (item._id) {
        onDelete(item._id);
}
      }
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: "#f7df1e",
      typescript: "#3178c6",
      python: "#3572A5",
      java: "#b07219",
      cpp: "#f34b7d",
      c: "#555555",
      rust: "#dea584",
      go: "#00ADD8",
    };
    return colors[lang.toLowerCase()] || "var(--accent)";
  };

  return (
    <div
      className="glass p-5 transition-smooth hover:shadow-glow-cyan group"
      style={{ borderRadius: "12px" }}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm truncate mb-1"
            style={{
              color: "var(--text-primary)",
              fontFamily: "Orbitron, sans-serif",
            }}
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-2">
            {/* Language badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${getLanguageColor(item.language)}20`,
                color: getLanguageColor(item.language),
                border: `1px solid ${getLanguageColor(item.language)}40`,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {item.language}
            </span>
            {/* Date */}
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {formatDate(item.createdAt ? String(item.createdAt) : "")}
            </span>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div
        className="rounded-lg p-3 mb-4 text-xs overflow-hidden"
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border)",
          fontFamily: "JetBrains Mono, monospace",
          color: "var(--text-muted)",
          maxHeight: "60px",
          lineHeight: "1.5",
        }}
      >
        <pre className="truncate whitespace-pre-wrap">
          {item.originalCode.slice(0, 100)}...
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onPreview(item)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
          style={{
            background: "var(--accent)",
            color: "#0d1117",
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          ▶ Preview
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-2 rounded-lg text-xs transition-all duration-200"
          style={{
            background: "rgba(252, 129, 129, 0.1)",
            border: "1px solid rgba(252, 129, 129, 0.2)",
            color: "#fc8181",
          }}
        >
          {deleting ? "..." : "🗑"}
        </button>
      </div>
    </div>
  );
}