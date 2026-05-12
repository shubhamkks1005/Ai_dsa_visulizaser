"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/visualizer", label: "Visualizer" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Don't show navbar on gallery algorithm viewer (full screen)
  // Gallery page itself is fine, only the inner viewer takes full height
  const isGalleryViewer =
    pathname === "/gallery" && typeof window !== "undefined";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: "rgba(13, 17, 23, 0.85)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-orbitron text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #63b3ed, #9f7aea)",
              color: "#fff",
            }}
          >
            D
          </div>
          <div className="flex flex-col">
            <span
              className="font-orbitron text-sm font-bold tracking-wider"
              style={{ color: "var(--text-primary)" }}
            >
              DSA
              <span
                className="ml-1"
                style={{
                  background: "linear-gradient(90deg, #63b3ed, #9f7aea)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI
              </span>
            </span>
            <span
              className="font-rajdhani text-[9px] tracking-[2px]"
              style={{ color: "var(--text-muted)" }}
            >
              VISUALIZER
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            // Hide Visualizer and Dashboard links if not logged in
            if (
              (link.href === "/visualizer" || link.href === "/dashboard") &&
              status !== "authenticated"
            ) {
              return null;
            }

            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 font-rajdhani text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "#63b3ed" : "var(--text-secondary)",
                  background: active ? "rgba(99, 179, 237, 0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Side — Auth + Theme */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {themeMode === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Auth Buttons */}
          {status === "loading" ? (
            <div
              className="h-8 w-20 animate-pulse rounded-lg"
              style={{ background: "var(--bg-card)" }}
            />
          ) : status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full font-orbitron text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg, #63b3ed, #9f7aea)",
                    color: "#fff",
                  }}
                >
                  {(session.user.name || session.user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span
                  className="max-w-[100px] truncate font-rajdhani text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {session.user.name || session.user.email}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg px-3 py-1.5 font-rajdhani text-xs font-semibold transition-all hover:brightness-125"
                style={{
                  background: "rgba(252, 129, 129, 0.1)",
                  border: "1px solid rgba(252, 129, 129, 0.3)",
                  color: "#fc8181",
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 font-rajdhani text-xs font-semibold transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-lg px-3 py-1.5 font-rajdhani text-xs font-bold transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #63b3ed, #9f7aea)",
                  color: "#fff",
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 md:hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="border-t px-4 py-3 md:hidden"
          style={{
            background: "rgba(13, 17, 23, 0.95)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              if (
                (link.href === "/visualizer" || link.href === "/dashboard") &&
                status !== "authenticated"
              ) {
                return null;
              }

              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 font-rajdhani text-sm font-medium transition-all"
                  style={{
                    color: active ? "#63b3ed" : "var(--text-secondary)",
                    background: active ? "rgba(99, 179, 237, 0.1)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}