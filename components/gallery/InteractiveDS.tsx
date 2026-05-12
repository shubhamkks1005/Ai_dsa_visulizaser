"use client";

import { useCallback, useRef, useState } from "react";
import { getCode } from "@/data/codeSnippets";

interface Props {
  type: "stack" | "queue";
  accent: string;
  variant?: "circular";
}

interface LogEntry {
  id: number;
  message: string;
  type: "push" | "pop" | "peek" | "info" | "error";
}

function hl(code: string, lang: string): string {
  let h = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  h = h.replace(
    /(\/\/.*$|#.*$)/gm,
    '<span style="color:#4a5568;font-style:italic">$1</span>',
  );
  h = h.replace(
    /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    '<span style="color:#68d391">$&</span>',
  );
  h = h.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f6e05e">$1</span>');

  const kw =
    lang === "python"
      ? "def|return|if|else|elif|for|while|in|not|and|or|True|False|None|class|import|from|as|range|len|append|pop|print|is"
      : lang === "java"
        ? "public|private|static|void|int|float|double|boolean|char|String|return|if|else|for|while|new|class|null|true|false|final|this|break|continue"
        : lang === "cpp" || lang === "c"
          ? "void|int|float|double|char|bool|return|if|else|for|while|do|switch|case|break|continue|struct|class|public|private|const|auto|vector|map|set|stack|queue|pair|string|cout|cin|endl|sizeof|memset|NULL|nullptr|true|false"
          : "function|return|if|else|for|while|const|let|var|new|class|null|undefined|true|false|this|push|pop|shift|length|console|log|Math|Array|from";

  h = h.replace(
    new RegExp(`\\b(${kw})\\b`, "g"),
    '<span style="color:#c084fc;font-weight:600">$1</span>',
  );
  h = h.replace(
    /(\w+)(\s*\()/g,
    '<span style="color:#63b3ed">$1</span>$2',
  );

  return h;
}

const MAX = 10;

export default function InteractiveDS({ type, accent, variant }: Props) {
  const [items, setItems] = useState<number[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [animIdx, setAnimIdx] = useState<number | null>(null);
  const [animType, setAnimType] = useState<"in" | "out" | null>(null);
  const [pushCount, setPushCount] = useState(0);
  const [popCount, setPopCount] = useState(0);
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp" | "c">(
    "javascript",
  );
  const [copied, setCopied] = useState(false);

  const lidRef = useRef(Date.now());

  const isStack = type === "stack";
  const isCircular = variant === "circular";
  const label = isCircular ? "Circular Queue" : isStack ? "Stack" : "Queue";
  const addLabel = isStack ? "Push" : "Enqueue";
  const removeLabel = isStack ? "Pop" : "Dequeue";

  const log = useCallback((msg: string, t: LogEntry["type"]) => {
    const id = lidRef.current++;
    setLogs((prev) => [{ id, message: msg, type: t }, ...prev].slice(0, 15));
  }, []);

  const animIn = (i: number) => {
    setAnimIdx(i);
    setAnimType("in");
    setTimeout(() => {
      setAnimIdx(null);
      setAnimType(null);
    }, 400);
  };

  const animOut = (i: number) =>
    new Promise<void>((r) => {
      setAnimIdx(i);
      setAnimType("out");
      setTimeout(() => {
        setAnimIdx(null);
        setAnimType(null);
        r();
      }, 350);
    });

  const handleAdd = () => {
    const v = parseInt(inputVal);
    if (Number.isNaN(v)) {
      log("⚠️ Enter a valid number", "error");
      return;
    }
    if (items.length >= MAX) {
      log(`⚠️ ${label} is full! (${MAX}/${MAX})`, "error");
      return;
    }

    const n = [...items, v];
    setItems(n);
    setPushCount((p) => p + 1);
    animIn(n.length - 1);
    log(`✅ ${addLabel}ed ${v}`, "push");
    setInputVal("");
    setHighlightIdx(null);
  };

  const handleRemove = async () => {
    if (!items.length) {
      log(`⚠️ ${label} is empty!`, "error");
      return;
    }

    const idx = isStack ? items.length - 1 : 0;
    const v = items[idx];
    await animOut(idx);

    setItems(isStack ? items.slice(0, -1) : items.slice(1));
    setPopCount((p) => p + 1);
    log(`🔴 ${removeLabel}d ${v}`, "pop");
    setHighlightIdx(null);
  };

  const handlePeek = (pos: "top" | "front" | "rear") => {
    if (!items.length) {
      log(`⚠️ ${label} is empty!`, "error");
      return;
    }

    const idx =
      pos === "top" ? items.length - 1 : pos === "front" ? 0 : items.length - 1;
    const lbl = pos === "top" ? "Top" : pos === "front" ? "Front" : "Rear";

    setHighlightIdx(idx);
    log(`👁️ ${lbl} = ${items[idx]}`, "peek");
    setTimeout(() => setHighlightIdx(null), 2000);
  };

  const handleIsEmpty = () =>
    log(
      items.length === 0
        ? `✅ ${label} IS empty`
        : `❌ NOT empty (size ${items.length})`,
      "info",
    );

  const handleIsFull = () =>
    log(
      items.length >= MAX
        ? `✅ ${label} IS full`
        : `❌ NOT full (${items.length}/${MAX})`,
      "info",
    );

  const handleClear = () => {
    setItems([]);
    setPushCount(0);
    setPopCount(0);
    setHighlightIdx(null);
    log("🗑️ Cleared", "info");
  };

  const codeId = isStack ? "stack-push" : isCircular ? "circular-queue" : "queue-enqueue";

  const copy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(getCode(codeId, language));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const logClr = (t: LogEntry["type"]) =>
    t === "push"
      ? "#68d391"
      : t === "pop"
        ? "#fc8181"
        : t === "peek"
          ? "#63b3ed"
          : t === "error"
            ? "#f6ad55"
            : "#8892b0";

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ═══ CENTER ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          {/* Visualization */}
          <div
            className="mb-3 flex flex-1 items-center justify-center overflow-auto rounded-xl p-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              minHeight: "200px",
            }}
          >
            {items.length === 0 ? (
              <div className="text-center">
                <div className="mb-3 text-4xl opacity-30">{isStack ? "📚" : "🔄"}</div>
                <p className="text-sm" style={{ color: "#4a5568" }}>
                  {label} is empty — {addLabel} to begin
                </p>
              </div>
            ) : (
              <div
                className={`flex ${isStack ? "flex-col-reverse" : "flex-row"} items-center gap-2`}
              >
                {isStack && (
                  <div
                    className="mb-1 font-orbitron text-[10px] tracking-wider"
                    style={{ color: "#4a5568" }}
                  >
                    BOTTOM
                  </div>
                )}

                {!isStack && (
                  <div
                    className="mr-3 font-orbitron text-[10px] tracking-wider"
                    style={{ color: accent }}
                  >
                    FRONT →
                  </div>
                )}

                {items.map((v, i) => {
                  const isTop = isStack && i === items.length - 1;
                  const isFront = !isStack && i === 0;
                  const isRear = !isStack && i === items.length - 1;
                  const isHl = highlightIdx === i;
                  const isAIn = animIdx === i && animType === "in";
                  const isAOut = animIdx === i && animType === "out";

                  let bg = accent;
                  if (isHl) bg = "#63b3ed";
                  if (isAOut) bg = "#fc8181";

                  return (
                    <div key={`${i}-${v}`} className="relative">
                      {isTop && (
                        <div
                          className="absolute left-1/2 -top-6 -translate-x-1/2 whitespace-nowrap font-orbitron text-[10px]"
                          style={{ color: "#f6e05e" }}
                        >
                          TOP ↓
                        </div>
                      )}

                      {isFront && (
                        <div
                          className="absolute left-1/2 -top-5 -translate-x-1/2 font-orbitron text-[10px]"
                          style={{ color: "#f6e05e" }}
                        >
                          FRONT
                        </div>
                      )}

                      {isRear && items.length > 1 && (
                        <div
                          className="absolute left-1/2 -top-5 -translate-x-1/2 font-orbitron text-[10px]"
                          style={{ color: "#f6ad55" }}
                        >
                          REAR
                        </div>
                      )}

                      <div
                        className={`${isStack ? "h-12 w-20" : "h-14 w-16"} flex items-center justify-center rounded-lg font-orbitron text-lg font-bold transition-all duration-300`}
                        style={{
                          background: bg,
                          color: "#0d1117",
                          boxShadow: isHl
                            ? `0 0 20px ${bg}`
                            : isAIn
                              ? `0 0 15px ${accent}`
                              : "none",
                          transform: isAIn ? "scale(1.15)" : isAOut ? "scale(0.7)" : "scale(1)",
                          opacity: isAOut ? 0.3 : 1,
                          border: isHl ? "3px solid #fff" : "2px solid transparent",
                        }}
                      >
                        {v}
                      </div>

                      <div
                        className="mt-1 text-center font-jetbrains text-[9px]"
                        style={{ color: "#4a5568" }}
                      >
                        [{i}]
                      </div>
                    </div>
                  );
                })}

                {!isStack && (
                  <div
                    className="ml-3 font-orbitron text-[10px] tracking-wider"
                    style={{ color: accent }}
                  >
                    ← REAR
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Operations Panel */}
          <div
            className="mb-2 rounded-lg p-3"
            style={{
              background: "#1a2233",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Value"
                className="w-24 rounded-lg p-2 text-center font-jetbrains text-sm"
                style={{
                  background: "#0d1117",
                  border: `1px solid ${accent}50`,
                  color: "#fff",
                }}
              />

              <button
                onClick={handleAdd}
                className="rounded-lg px-4 py-2 font-orbitron text-xs font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, #9f7aea)` }}
              >
                {addLabel}
              </button>

              <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              <button
                onClick={handleRemove}
                className="rounded-lg px-4 py-2 font-orbitron text-xs"
                style={{
                  background: "#131720",
                  border: "1px solid rgba(252,129,129,0.4)",
                  color: "#fc8181",
                }}
              >
                {removeLabel}
              </button>

              <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              {isStack ? (
                <button
                  onClick={() => handlePeek("top")}
                  className="rounded-lg px-3 py-2 font-orbitron text-xs"
                  style={{
                    background: "#131720",
                    border: "1px solid rgba(99,179,237,0.3)",
                    color: "#63b3ed",
                  }}
                >
                  Peek
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handlePeek("front")}
                    className="rounded-lg px-3 py-2 font-orbitron text-xs"
                    style={{
                      background: "#131720",
                      border: "1px solid rgba(99,179,237,0.3)",
                      color: "#63b3ed",
                    }}
                  >
                    Front
                  </button>

                  <button
                    onClick={() => handlePeek("rear")}
                    className="rounded-lg px-3 py-2 font-orbitron text-xs"
                    style={{
                      background: "#131720",
                      border: "1px solid rgba(246,173,85,0.3)",
                      color: "#f6ad55",
                    }}
                  >
                    Rear
                  </button>
                </>
              )}

              <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              <button
                onClick={handleIsEmpty}
                className="rounded-lg px-3 py-2 font-orbitron text-xs"
                style={{
                  background: "#131720",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#8892b0",
                }}
              >
                isEmpty
              </button>

              <button
                onClick={handleIsFull}
                className="rounded-lg px-3 py-2 font-orbitron text-xs"
                style={{
                  background: "#131720",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#8892b0",
                }}
              >
                isFull
              </button>

              <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              <button
                onClick={handleClear}
                className="rounded-lg px-3 py-2 font-orbitron text-xs"
                style={{
                  background: "#131720",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#4a5568",
                }}
              >
                🗑 Clear
              </button>
            </div>
          </div>

          {/* Log */}
          <div
            className="overflow-hidden rounded-lg"
            style={{
              background: "#0f1520",
              border: "1px solid rgba(255,255,255,0.06)",
              maxHeight: "120px",
            }}
          >
            <div
              className="flex items-center justify-between px-3 py-1.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="font-rajdhani text-[10px] tracking-[2px]"
                style={{ color: "#4a5568" }}
              >
                OUTPUT LOG
              </span>
              <span className="font-jetbrains text-[10px]" style={{ color: "#4a5568" }}>
                {items.length}/{MAX}
              </span>
            </div>

            <div className="space-y-0.5 overflow-y-auto p-2" style={{ maxHeight: "85px" }}>
              {logs.length === 0 ? (
                <p className="py-2 text-center text-xs" style={{ color: "#4a5568" }}>
                  Perform an operation
                </p>
              ) : (
                logs.map((l) => (
                  <div
                    key={l.id}
                    className="rounded px-2 py-1 font-rajdhani text-xs"
                    style={{ color: logClr(l.type) }}
                  >
                    {l.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div
        className="flex shrink-0 flex-col overflow-hidden"
        style={{
          width: "340px",
          background: "#0f1520",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Stats */}
        <div
          className="overflow-y-auto p-4"
          style={{
            height: "40%",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="mb-3 font-rajdhani text-[10px] tracking-[3px]"
            style={{ color: "#4a5568" }}
          >
            STATISTICS
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg p-3 text-center" style={{ background: "#131720" }}>
              <div className="font-orbitron text-2xl font-bold" style={{ color: accent }}>
                {items.length}
              </div>
              <div className="mt-1 font-rajdhani text-[10px]" style={{ color: "#4a5568" }}>
                Size
              </div>
            </div>

            <div className="rounded-lg p-3 text-center" style={{ background: "#131720" }}>
              <div
                className="font-orbitron text-2xl font-bold"
                style={{ color: items.length >= MAX ? "#fc8181" : "#68d391" }}
              >
                {MAX - items.length}
              </div>
              <div className="mt-1 font-rajdhani text-[10px]" style={{ color: "#4a5568" }}>
                Remaining
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <StatRow
              icon={isStack ? "⬆" : "➡"}
              label={`${addLabel} Count`}
              value={pushCount}
              color="#68d391"
            />
            <StatRow
              icon={isStack ? "⬇" : "⬅"}
              label={`${removeLabel} Count`}
              value={popCount}
              color="#fc8181"
            />
            <StatRow
              icon="📊"
              label={isStack ? "Top" : "Front"}
              value={items.length > 0 ? (isStack ? items[items.length - 1] : items[0]) : "—"}
              color="#63b3ed"
            />
            {!isStack && (
              <StatRow
                icon="📊"
                label="Rear"
                value={items.length > 0 ? items[items.length - 1] : "—"}
                color="#f6ad55"
              />
            )}
          </div>
        </div>

        {/* Code */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="mb-2 flex items-center justify-between">
            <div
              className="font-rajdhani text-[10px] tracking-[3px]"
              style={{ color: "#4a5568" }}
            >
              CODE
            </div>
            <button
              onClick={copy}
              className="rounded px-2 py-0.5 font-rajdhani text-[11px]"
              style={{
                background: "#131720",
                color: copied ? "#68d391" : "#63b3ed",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div className="mb-2 flex gap-0.5 rounded-lg p-0.5" style={{ background: "#131720" }}>
            {(["javascript", "python", "java", "cpp", "c"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className="flex-1 rounded-md py-1 font-rajdhani text-[11px] transition-all"
                style={{
                  color: language === l ? "#fff" : "#4a5568",
                  background: language === l ? `${accent}30` : "transparent",
                  fontWeight: language === l ? 600 : 400,
                }}
              >
                {l === "cpp"
                  ? "C++"
                  : l === "javascript"
                    ? "JS"
                    : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>

          <div
            className="flex-1 overflow-hidden rounded-lg"
            style={{
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <pre className="h-full overflow-auto p-3 font-jetbrains text-[12px] leading-[1.85]">
              <code>
                {getCode(codeId, language)
                  .split("\n")
                  .map((line, i) => (
                    <div
                      key={i}
                      className="flex rounded-sm hover:bg-white/[0.02]"
                    >
                      <span
                        className="w-7 shrink-0 select-none pr-3 text-right"
                        style={{ color: "#2d3748" }}
                      >
                        {i + 1}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: hl(line, language) }} />
                    </div>
                  ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg p-2.5"
      style={{
        background: "#131720",
        border: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span className="text-sm">{icon}</span>
      <span className="flex-1 font-rajdhani text-xs" style={{ color: "#8892b0" }}>
        {label}
      </span>
      <span className="font-orbitron text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}