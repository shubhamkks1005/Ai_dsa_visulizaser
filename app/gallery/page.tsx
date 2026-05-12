"use client";

import { useState } from "react";
import CategoryCard from "@/components/gallery/CategoryCard";
import AlgoViewer from "@/components/gallery/AlgoViewer";
import { algorithmsByCategory, categoryColors, categoryNames } from "@/data/algorithms";

const categoryMeta: Record<string, { subtitle: string; tags: string }> = {
  sorting: {
    subtitle: "6 Algorithms",
    tags: "Bubble • Selection • Insertion • Merge • Quick • Heap",
  },
  dp: {
    subtitle: "5 Algorithms",
    tags: "Fibonacci • Knapsack • LCS • LIS • MCM",
  },
  graph: {
    subtitle: "7 Algorithms",
    tags: "BFS • DFS • Dijkstra • Bellman-Ford • Floyd • Kruskal • Prim",
  },
  tree: {
    subtitle: "6 Algorithms",
    tags: "Insert • Delete • Search • Inorder • Preorder • Postorder",
  },
  stack: {
    subtitle: "6 Algorithms",
    tags: "Basic Ops • Balanced Parens • Infix↔Postfix • Evaluation",
  },
  queue: {
    subtitle: "2 Algorithms",
    tags: "Basic Queue • Circular Queue",
  },
};

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Agar category select ho gayi hai toh viewer dikhao
  if (selectedCategory) {
    return (
      <AlgoViewer
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  const categories = Object.keys(algorithmsByCategory);

  return (
    <div
      className="flex min-h-screen flex-col items-center px-6 py-12"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <h1
          className="font-orbitron text-3xl font-bold tracking-wider sm:text-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          DSA GALLERY
        </h1>
        <div
          className="mx-auto mt-2 h-0.5 w-16 rounded-full"
          style={{ background: "linear-gradient(90deg, #63b3ed, #9f7aea)" }}
        />
      </div>

      <p
        className="mb-10 max-w-xl text-center font-rajdhani text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        Explore step-by-step visualizations of fundamental data structures and algorithms.
        Pick a category to begin.
      </p>

      {/* Category Grid */}
      <div className="flex flex-wrap justify-center gap-6">
        {categories.map((cat, i) => {
          const meta = categoryMeta[cat];
          const name = categoryNames[cat] || cat.toUpperCase();
          const color = categoryColors[cat] || "#63b3ed";

          return (
            <CategoryCard
              key={cat}
              title={name}
              subtitle={meta?.subtitle || `${(algorithmsByCategory[cat] || []).length} Algorithms`}
              tags={meta?.tags || ""}
              accent={color}
              index={i}
              category={cat}
              onClick={() => setSelectedCategory(cat)}
            />
          );
        })}
      </div>

      {/* Footer hint */}
      <p
        className="mt-12 font-rajdhani text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Click any card to explore algorithms with interactive visualizations
      </p>
    </div>
  );
}