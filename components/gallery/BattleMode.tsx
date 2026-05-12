"use client";

interface BattleModeProps {
  onExit: () => void;
}

export default function BattleMode({ onExit }: BattleModeProps) {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center gap-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <p className="font-rajdhani text-lg" style={{ color: "var(--text-secondary)" }}>
        Battle Mode is not available in this version.
      </p>
      <button
        onClick={onExit}
        className="rounded-lg px-6 py-2 font-orbitron text-sm font-bold transition-all hover:brightness-125"
        style={{
          background: "linear-gradient(135deg, #f97316, #9f7aea)",
          color: "#fff",
        }}
      >
        ← Go Back
      </button>
    </div>
  );
}