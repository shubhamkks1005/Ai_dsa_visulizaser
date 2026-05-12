"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 200);
    setTimeout(() => setSubtitleVisible(true), 900);
    setTimeout(() => setBtnVisible(true), 1500);
  }, []);

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6">

      {/* Decorative code brackets */}
      <div
        className="mb-8 flex items-center gap-3 transition-all duration-700"
        style={{
          opacity: visible ? 0.15 : 0,
          transform: visible ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        <span className="font-jetbrains text-5xl" style={{ color: "#63b3ed" }}>
          {"{"}
        </span>
        <div className="flex gap-1.5">
          {[32, 48, 24, 56, 16, 40].map((h, i) => (
            <div
              key={i}
              className="w-2 rounded-sm transition-all duration-500"
              style={{
                height: `${h}px`,
                background: "#63b3ed",
                opacity: 0.5,
                transitionDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
        <span className="font-jetbrains text-5xl" style={{ color: "#63b3ed" }}>
          {"}"}
        </span>
      </div>

      {/* Main Heading */}
      <h1
        className="mb-4 text-center font-orbitron font-bold leading-tight transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          fontSize: "clamp(2rem, 6vw, 4.5rem)",
          letterSpacing: "0.08em",
          color: "var(--text-primary)",
        }}
      >
        <span className="whitespace-nowrap">DSA</span>{" "}
        <span className="whitespace-nowrap" style={{ color: "#63b3ed" }}>
          Visualizer
        </span>
      </h1>

      {/* AI Badge */}
      <div
        className="mb-4 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <span
          className="rounded-full px-4 py-1 font-rajdhani text-xs font-semibold tracking-[2px]"
          style={{
            background: "rgba(159, 122, 234, 0.15)",
            border: "1px solid rgba(159, 122, 234, 0.4)",
            color: "#9f7aea",
          }}
        >
          ✨ NOW WITH AI-POWERED VISUALIZATIONS
        </span>
      </div>

      {/* Subtitle */}
      <p
        className="mb-10 max-w-lg text-center transition-all duration-700"
        style={{
          opacity: subtitleVisible ? 1 : 0,
          transform: subtitleVisible ? "translateY(0)" : "translateY(10px)",
          color: "var(--text-secondary)",
          fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
          lineHeight: 1.7,
        }}
      >
        Understand algorithms through interactive, step-by-step visualizations.
        <br />
        <span style={{ color: "#4a5568" }}>
          Sorting · Trees · Graphs · Stacks · Queues · Dynamic Programming
        </span>
      </p>

      {/* CTA Buttons */}
      <div
        className="flex flex-col items-center gap-3 transition-all duration-700"
        style={{
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? "translateY(0)" : "translateY(15px)",
        }}
      >
        {/* Primary CTA — Gallery */}
        <button
          onClick={() => router.push("/gallery")}
          className="font-orbitron text-sm tracking-[3px] px-10 py-4 rounded-lg transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #63b3ed, #9f7aea)",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 20px rgba(99,179,237,0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,179,237,0.35)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,179,237,0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          START EXPLORING
        </button>

        {/* Secondary CTA — AI Visualizer */}
        <Link
          href="/visualizer"
          className="font-orbitron text-xs tracking-[2px] px-8 py-3 rounded-lg transition-all duration-300 text-center"
          style={{
            background: "transparent",
            color: "var(--accent)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          💻 AI CODE VISUALIZER
        </Link>
      </div>

      {/* Features Row */}
      <div
        className="mt-16 flex flex-wrap justify-center gap-4 transition-all duration-700"
        style={{ opacity: btnVisible ? 1 : 0 }}
      >
        {[
          {
            icon: "🤖",
            title: "AI Powered",
            desc: "Paste any code — AI analyzes and visualizes it",
          },
          {
            icon: "⚡",
            title: "Step by Step",
            desc: "Watch every comparison, swap, and traversal",
          },
          {
            icon: "🌐",
            title: "5 Languages",
            desc: "JavaScript, Python, Java, C++, C",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl px-6 py-4 text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              width: "200px",
            }}
          >
            <span className="text-2xl">{f.icon}</span>
            <span
              className="font-orbitron text-xs font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {f.title}
            </span>
            <span
              className="font-rajdhani text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {f.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div
        className="mt-12 flex gap-10 transition-all duration-700"
        style={{ opacity: btnVisible ? 1 : 0 }}
      >
        {[
          { n: "56", l: "Algorithms" },
          { n: "6", l: "Categories" },
          { n: "5", l: "Languages" },
          { n: "AI", l: "Powered" },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div
              className="font-orbitron text-lg font-bold"
              style={{ color: "#63b3ed" }}
            >
              {s.n}
            </div>
            <div className="text-xs" style={{ color: "#4a5568" }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}