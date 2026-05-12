import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Providers from "@/components/shared/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSA AI Visualizer",
  description:
    "Visualize any algorithm with AI-powered step-by-step animations. Explore sorting, graphs, trees, DP and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} min-h-screen`}
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <Providers>
          {/* Gradient orbs background */}
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background: `
                radial-gradient(circle at 20% 20%, rgba(99, 179, 237, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(159, 122, 234, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(66, 153, 225, 0.03) 0%, transparent 50%)
              `,
            }}
          />

          {/* Navbar */}
          <Navbar />

          {/* Page content */}
          <main className="relative z-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}