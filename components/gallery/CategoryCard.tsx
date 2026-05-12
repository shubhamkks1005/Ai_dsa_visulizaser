"use client";

import { useEffect, useId, useRef, useState } from "react";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  tags: string;
  accent: string;
  index: number;
  category: string;
  onClick: () => void;
}

function SortingIcon({ accent }: { accent: string }) {
  const [heights, setHeights] = useState<number[]>([20, 35, 15, 40, 25, 30, 45, 10]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights((prev) => {
        const next = [...prev];
        const i = Math.floor(Math.random() * next.length);
        const j = Math.floor(Math.random() * next.length);
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-12 items-end justify-center gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-2 rounded-sm"
          style={{
            height: `${h}px`,
            background: accent,
            boxShadow: `0 0 6px ${accent}`,
            transition: "height 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      ))}
    </div>
  );
}

function DPIcon({ accent }: { accent: string }) {
  const [filled, setFilled] = useState<number[]>([]);

  useEffect(() => {
    let current = 0;
    const cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const interval = setInterval(() => {
      if (current >= cells.length) {
        current = 0;
        setFilled([]);
      } else {
        setFilled((prev) => [...prev, cells[current]]);
        current++;
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto grid h-14 w-14 grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm transition-all duration-300"
          style={{
            background: filled.includes(i) ? accent : "rgba(255,255,255,0.05)",
            boxShadow: filled.includes(i) ? `0 0 8px ${accent}` : "none",
            border: `1px solid ${
              filled.includes(i) ? accent : "rgba(255,255,255,0.06)"
            }`,
          }}
        />
      ))}
    </div>
  );
}

function GraphIcon({ accent }: { accent: string }) {
  const [activeNode, setActiveNode] = useState(0);
  const glowId = useId().replace(/:/g, "");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 4);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const gNodes = [
    { x: 18, y: 10 },
    { x: 42, y: 10 },
    { x: 10, y: 38 },
    { x: 50, y: 38 },
  ];

  const gEdges: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
  ];

  return (
    <svg width="60" height="50" viewBox="0 0 60 50" className="mx-auto">
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="1.5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {gEdges.map(([from, to], i) => (
        <line
          key={i}
          x1={gNodes[from].x}
          y1={gNodes[from].y}
          x2={gNodes[to].x}
          y2={gNodes[to].y}
          stroke={accent}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.6"
          style={{ animation: "dash-flow 1.5s linear infinite" }}
        />
      ))}

      {gNodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i === activeNode ? 7 : 5}
          fill={i === activeNode ? accent : "#1a2233"}
          stroke={accent}
          strokeWidth="1.5"
          filter={i === activeNode ? `url(#${glowId})` : undefined}
          style={{ transition: "all 0.3s ease" }}
        />
      ))}
    </svg>
  );
}

function StackIcon({ accent }: { accent: string }) {
  const [top, setTop] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setTop((prev) => (prev === 5 ? 1 : prev + 1));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-12 flex-col items-center justify-end gap-[3px]">
      {[5, 4, 3, 2, 1].map((i) => (
        <div
          key={i}
          className="rounded-sm transition-all duration-300"
          style={{
            width: "40px",
            height: "8px",
            background: i <= top ? accent : "rgba(255,255,255,0.05)",
            boxShadow: i === top ? `0 0 8px ${accent}` : "none",
            border: `1px solid ${i <= top ? accent : "rgba(255,255,255,0.06)"}`,
          }}
        />
      ))}
    </div>
  );
}

function QueueIcon({ accent }: { accent: string }) {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((prev) => (prev + 1) % 5);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-12 items-center justify-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-sm transition-all duration-300"
          style={{
            width: "10px",
            height: i === pos ? "36px" : "24px",
            background: i === pos ? accent : "rgba(255,255,255,0.08)",
            boxShadow: i === pos ? `0 0 8px ${accent}` : "none",
            border: `1px solid ${i === pos ? accent : "rgba(255,255,255,0.06)"}`,
          }}
        />
      ))}
      <span className="ml-1 text-xs" style={{ color: accent }}>
        →
      </span>
    </div>
  );
}

function TreeIcon({ accent }: { accent: string }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const treeNodes = [
    { x: 30, y: 8 },
    { x: 15, y: 24 },
    { x: 45, y: 24 },
    { x: 8, y: 40 },
    { x: 22, y: 40 },
    { x: 38, y: 40 },
    { x: 52, y: 40 },
  ];

  const treeEdges: Array<[number, number]> = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % 7);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg width="60" height="50" viewBox="0 0 60 50" className="mx-auto">
      {treeEdges.map(([from, to], i) => (
        <line
          key={i}
          x1={treeNodes[from].x}
          y1={treeNodes[from].y}
          x2={treeNodes[to].x}
          y2={treeNodes[to].y}
          stroke={accent}
          strokeWidth="1"
          opacity="0.4"
        />
      ))}

      {treeNodes.map((node, i) => (
        <circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={i === activeIdx ? 6 : 4}
          fill={i === activeIdx ? accent : "#1a2233"}
          stroke={accent}
          strokeWidth="1.5"
          style={{
            transition: "all 0.3s ease",
            filter: i === activeIdx ? `drop-shadow(0 0 4px ${accent})` : "none",
          }}
        />
      ))}
    </svg>
  );
}

export default function CategoryCard({
  title,
  subtitle,
  tags,
  accent,
  index,
  category,
  onClick,
}: CategoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const renderIcon = () => {
    switch (category) {
      case "sorting":
        return <SortingIcon accent={accent} />;
      case "dp":
        return <DPIcon accent={accent} />;
      case "graph":
        return <GraphIcon accent={accent} />;
      case "tree":
        return <TreeIcon accent={accent} />;
      case "stack":
        return <StackIcon accent={accent} />;
      case "queue":
        return <QueueIcon accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={cardRef}
      data-interactive
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="animate-slide-up-fade"
      style={{
        animationDelay: `${index * 0.15}s`,
        animationFillMode: "forwards",
      }}
    >
      <div
        className="glass flex h-[200px] w-[280px] select-none flex-col items-center justify-between p-6 transition-all duration-500"
        style={{
          borderColor: isHovered ? `rgba(${hexToRgb(accent)}, 0.7)` : "var(--border)",
          boxShadow: isHovered ? `0 0 20px rgba(${hexToRgb(accent)}, 0.25)` : "none",
          transform: isHovered ? "translateY(-12px)" : "translateY(0)",
          background: isHovered ? "var(--bg-card-hover)" : "var(--bg-card)",
          cursor: "pointer",
        }}
      >
        <div className="mb-2">{renderIcon()}</div>

        <h3
          className="font-orbitron text-lg font-bold sm:text-xl"
          style={{
            color: accent,
            textShadow: isHovered ? `0 0 10px rgba(${hexToRgb(accent)}, 0.4)` : "none",
            transition: "text-shadow 0.3s ease",
          }}
        >
          {title}
        </h3>

        <p className="font-rajdhani text-sm" style={{ color: "var(--text-secondary)" }}>
          {subtitle}
        </p>

        <p
          className="mt-1 text-center font-rajdhani text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {tags}
        </p>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const normalized = hex.trim();

  if (!/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
    return "255,255,255";
  }

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return `${r},${g},${b}`;
}