import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard — DSA AI Visualizer",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main
      className="min-h-screen p-8"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="grid-overlay" />
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold glow-cyan mb-2"
            style={{
              fontFamily: "Orbitron, sans-serif",
              color: "var(--text-primary)",
            }}
          >
            Welcome, {session.user?.name} 👋
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Your DSA visualization dashboard
          </p>
        </div>

        {/* Placeholder content */}
        <div className="glass p-8 text-center">
          <p style={{ color: "var(--text-secondary)" }}>
            Dashboard — History system will be built in Phase 3
          </p>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Logged in as: {session.user?.email}
          </p>
        </div>
      </div>
    </main>
  );
}