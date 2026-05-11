"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Signup successful — redirect to login
      router.push("/login?signup=success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold mb-2 glow-cyan"
          style={{
            fontFamily: "Orbitron, sans-serif",
            color: "var(--text-primary)",
          }}
        >
          Create Account
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Start visualizing algorithms today
        </p>
      </div>

      {/* Form Card */}
      <div className="glass p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid var(--accent)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(99, 179, 237, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid var(--accent)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(99, 179, 237, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid var(--accent)";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(99, 179, 237, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(252, 129, 129, 0.1)",
                border: "1px solid rgba(252, 129, 129, 0.3)",
                color: "#fc8181",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              background: loading
                ? "var(--bg-card-hover)"
                : "var(--accent)",
              color: loading ? "var(--text-muted)" : "#0d1117",
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login Link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: "var(--text-secondary)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--accent)" }}
            className="hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}