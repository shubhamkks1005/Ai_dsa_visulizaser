export default function GalleryPage() {
  return (
    <main
      className="min-h-screen p-8"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="grid-overlay" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1
          className="text-3xl font-bold glow-cyan mb-4"
          style={{
            fontFamily: "Orbitron, sans-serif",
            color: "var(--text-primary)",
          }}
        >
          DSA Gallery
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Gallery will be built in Phase 6
        </p>
      </div>
    </main>
  );
}