"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
];

const DEFAULT_CODE = `// Paste your algorithm code here
// Example: Bubble Sort

function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

const result = bubbleSort([64, 34, 25, 12, 22, 11, 90]);
console.log(result);`;

export default function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  disabled = false,
}: CodeEditorProps) {
  const [editorLoaded, setEditorLoaded] = useState(false);

  const getMonacoLanguage = (lang: string): string => {
    const map: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      rust: "rust",
      go: "go",
    };
    return map[lang] || "javascript";
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <span
            className="text-xs font-medium"
            style={{
              color: "var(--text-muted)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            code.{language === "cpp" ? "cpp" : language === "python" ? "py" : language === "java" ? "java" : language === "typescript" ? "ts" : "js"}
          </span>
        </div>

        {/* Language Selector */}
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-lg outline-none transition-all duration-200"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontFamily: "JetBrains Mono, monospace",
            cursor: "pointer",
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        {!editorLoaded && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="text-center">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-2"
                style={{ borderColor: "var(--accent)" }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Loading editor...
              </span>
            </div>
          </div>
        )}
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code || DEFAULT_CODE}
          onChange={(value) => onCodeChange(value || "")}
          onMount={() => setEditorLoaded(true)}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            readOnly: disabled,
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>
    </div>
  );
}

export { DEFAULT_CODE };