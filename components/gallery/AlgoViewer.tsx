"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { algorithmsByCategory, categoryColors, categoryNames } from "@/data/algorithms";
import type { Algorithm } from "@/data/algorithms";
import { getCode } from "@/data/codeSnippets";
import InteractiveDS from "@/components/gallery/InteractiveDS";
import BattleMode from "@/components/gallery/BattleMode";

interface AlgoViewerProps {
  category: string;
  onBack: () => void;
}

interface Step {
  array?: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  current?: number;
  visited?: number[];
  message: string;
  codeLine?: number;
  dpTable?: number[][];
  activeCell?: [number, number];
  dpTitle?: string;
  dpDesc?: string;
  dpHighlights?: { r: number; c: number; color: string }[];
  dpMemo?: (number | null)[];
  dpRowHeaders?: string[];
  dpColHeaders?: string[];
  dpExtra?: string;
  treeNodes?: { value: number; state: string; x: number; y: number; parentIdx: number }[];
  graphNodes?: { id: number; state: string }[];
  graphEdges?: { from: number; to: number; state: string }[];
  output?: number[];
  auxQueue?: number[];
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

function formatComplexity(raw: string): string {
  return raw.replace(/^O\(/, "").replace(/\)$/, "");
}

interface TNode {
  value: number;
  left?: TNode;
  right?: TNode;
}

function insertBST(root: TNode | undefined, val: number): TNode {
  if (!root) return { value: val };
  if (val < root.value) root.left = insertBST(root.left, val);
  else root.right = insertBST(root.right, val);
  return root;
}

interface FlatNode {
  value: number;
  x: number;
  y: number;
  parentIdx: number;
  state: string;
}

function flattenTree(
  root: TNode | undefined,
  x: number,
  y: number,
  spread: number,
  parentIdx: number,
  result: FlatNode[],
): void {
  if (!root) return;
  const idx = result.length;
  result.push({ value: root.value, x, y, parentIdx, state: "default" });
  flattenTree(root.left, x - spread, y + 58, spread * 0.5, idx, result);
  flattenTree(root.right, x + spread, y + 58, spread * 0.5, idx, result);
}

function buildStaticTree(arr: number[]): FlatNode[] {
  let root: TNode | undefined;
  for (const v of arr) root = insertBST(root, v);
  const flat: FlatNode[] = [];
  flattenTree(root, 280, 35, 120, -1, flat);
  return flat;
}

function computeViewBox(
  nodes: { x: number; y: number }[],
  pad = 30,
): { vb: string; w: number; h: number } {
  if (!nodes.length) return { vb: "0 0 560 300", w: 560, h: 300 };

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }

  const x = minX - pad;
  const y = minY - pad;
  const w = Math.max(300, maxX - minX + pad * 2);
  const h = Math.max(200, maxY - minY + pad * 2);

  return { vb: `${x} ${y} ${w} ${h}`, w, h };
}

function getTraversalOrder(root: TNode | undefined, type: string): number[] {
  const result: number[] = [];

  function inorder(n: TNode | undefined) {
    if (!n) return;
    inorder(n.left);
    result.push(n.value);
    inorder(n.right);
  }

  function preorder(n: TNode | undefined) {
    if (!n) return;
    result.push(n.value);
    preorder(n.left);
    preorder(n.right);
  }

  function postorder(n: TNode | undefined) {
    if (!n) return;
    postorder(n.left);
    postorder(n.right);
    result.push(n.value);
  }

  if (type.includes("inorder")) inorder(root);
  else if (type.includes("preorder")) preorder(root);
  else if (type.includes("postorder")) postorder(root);
  else preorder(root);

  return result;
}

interface TraversalStep {
  nodeValue: number;
  action: "move" | "visit";
  message: string;
}

function getTraversalPath(root: TNode | undefined, type: string): TraversalStep[] {
  const path: TraversalStep[] = [];
  const typeName = type.includes("inorder")
    ? "Inorder"
    : type.includes("preorder")
      ? "Preorder"
      : type.includes("postorder")
        ? "Postorder"
        : "Traversal";

  function inorder(n: TNode | undefined) {
    if (!n) return;
    path.push({ nodeValue: n.value, action: "move", message: `${typeName}: Move to ${n.value}` });
    if (n.left) {
      inorder(n.left);
      path.push({ nodeValue: n.value, action: "move", message: `Return to ${n.value}` });
    }
    path.push({
      nodeValue: n.value,
      action: "visit",
      message: `Visit ${n.value} (Left done → process root)`,
    });
    if (n.right) {
      inorder(n.right);
      path.push({ nodeValue: n.value, action: "move", message: `Return to ${n.value}` });
    }
  }

  function preorder(n: TNode | undefined) {
    if (!n) return;
    path.push({ nodeValue: n.value, action: "visit", message: `Visit ${n.value} (root first)` });
    if (n.left) {
      preorder(n.left);
      path.push({ nodeValue: n.value, action: "move", message: `Return to ${n.value}` });
    }
    if (n.right) {
      preorder(n.right);
      path.push({ nodeValue: n.value, action: "move", message: `Return to ${n.value}` });
    }
  }

  function postorder(n: TNode | undefined) {
    if (!n) return;
    path.push({ nodeValue: n.value, action: "move", message: `${typeName}: Move to ${n.value}` });
    if (n.left) {
      postorder(n.left);
      path.push({ nodeValue: n.value, action: "move", message: `Return to ${n.value}` });
    }
    if (n.right) {
      postorder(n.right);
      path.push({ nodeValue: n.value, action: "move", message: `Return to ${n.value}` });
    }
    path.push({
      nodeValue: n.value,
      action: "visit",
      message: `Visit ${n.value} (children done → process node)`,
    });
  }

  if (type.includes("inorder")) inorder(root);
  else if (type.includes("preorder")) preorder(root);
  else if (type.includes("postorder")) postorder(root);

  return path;
}

interface GraphPreset {
  nodes: number[];
  edges: { from: number; to: number }[];
  pos: { x: number; y: number }[];
  labels: string[];
}

const GRAPH_PRESETS: GraphPreset[] = [
  {
    nodes: [0, 1, 2, 3, 4, 5, 6],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 5 },
      { from: 4, to: 5 },
      { from: 3, to: 6 },
      { from: 4, to: 6 },
      { from: 5, to: 6 },
    ],
    pos: [
      { x: 200, y: 30 },
      { x: 100, y: 95 },
      { x: 300, y: 95 },
      { x: 45, y: 170 },
      { x: 155, y: 170 },
      { x: 265, y: 170 },
      { x: 375, y: 170 },
    ],
    labels: ["A", "B", "C", "D", "E", "F", "G"],
  },
  {
    nodes: [0, 1, 2, 3, 4, 5],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
    pos: [
      { x: 210, y: 25 },
      { x: 100, y: 85 },
      { x: 320, y: 85 },
      { x: 140, y: 155 },
      { x: 280, y: 155 },
      { x: 210, y: 195 },
    ],
    labels: ["P", "Q", "R", "S", "T", "U"],
  },
  {
    nodes: [0, 1, 2, 3, 4, 5, 6, 7],
    edges: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 0 },
      { from: 0, to: 4 },
      { from: 2, to: 6 },
    ],
    pos: [
      { x: 210, y: 25 },
      { x: 330, y: 55 },
      { x: 380, y: 130 },
      { x: 330, y: 185 },
      { x: 210, y: 195 },
      { x: 90, y: 185 },
      { x: 40, y: 130 },
      { x: 90, y: 55 },
    ],
    labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
  },
  {
    nodes: [0, 1, 2, 3, 4],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 1 },
    ],
    pos: [
      { x: 210, y: 100 },
      { x: 100, y: 30 },
      { x: 340, y: 50 },
      { x: 340, y: 170 },
      { x: 100, y: 185 },
    ],
    labels: ["X", "Y", "Z", "W", "V"],
  },
  {
    nodes: [0, 1, 2, 3, 4, 5, 6],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 5 },
      { from: 3, to: 6 },
      { from: 4, to: 6 },
      { from: 5, to: 6 },
    ],
    pos: [
      { x: 210, y: 25 },
      { x: 80, y: 100 },
      { x: 210, y: 100 },
      { x: 340, y: 100 },
      { x: 110, y: 180 },
      { x: 210, y: 180 },
      { x: 310, y: 180 },
    ],
    labels: ["M", "N", "O", "P", "Q", "R", "S"],
  },
];

function getDefaultArrayInput(category: string): string {
  if (category === "tree") return "50,30,70,20,40,60,80";
  if (category === "stack") return "((A+B)*C-(D-E))^(F+G/H)";
  if (category === "sorting") {
    return "38,27,43,3,9,82,10,55,71,19,64,25,88,41,6,47,33,58,14,76,21,69,4";
  }
  return "38,27,43,3,9,82,10";
}

export default function AlgoViewer({ category, onBack }: AlgoViewerProps) {
  const algorithms = algorithmsByCategory[category] || [];
  const categoryName = categoryNames[category] || category.toUpperCase();
  const accent = categoryColors[category] || "#63b3ed";

  const INTERACTIVE_IDS = ["basic-stack-ops", "basic-queue-ops", "circular-queue-ops"];
  const BST_OPS = ["bst-insert", "bst-delete", "bst-search"];

  const [battleMode, setBattleMode] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(algorithms[0] || null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "cpp" | "c">("cpp");
  const [copied, setCopied] = useState(false);
  const [showUseCase, setShowUseCase] = useState(false);
  const [graphIdx, setGraphIdx] = useState(0);
  const [graphStartNode, setGraphStartNode] = useState(0);
  const [dryRunMode, setDryRunMode] = useState(true);
  const [sortSize, setSortSize] = useState(23);
  const [arrayInput, setArrayInput] = useState(getDefaultArrayInput(category));
  const [nInput, setNInput] = useState("10");
  const [weightsInput, setWeightsInput] = useState("2,3,4,5");
  const [valuesInput, setValuesInput] = useState("3,4,5,6");
  const [capacityInput, setCapacityInput] = useState("8");
  const [str1Input, setStr1Input] = useState("ABCBDAB");
  const [str2Input, setStr2Input] = useState("BDCAB");

  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef(false);

  const gp = GRAPH_PRESETS[graphIdx] ?? GRAPH_PRESETS[0];

  useEffect(() => {
    setSelectedAlgo(algorithms[0] || null);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setBattleMode(false);
    setArrayInput(getDefaultArrayInput(category));
    setGraphIdx(0);
    setGraphStartNode(0);
    autoRef.current = false;
  }, [category, algorithms]);

  const staticTreeNodes = useMemo(() => {
    if (category !== "tree") return [];
    return buildStaticTree(
      arrayInput
        .split(",")
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
    );
  }, [category, arrayInput]);

  const sections = [...new Set(algorithms.map((a) => a.section).filter(Boolean))];
  const hasSections = sections.length > 0;

  const stats = useMemo(() => {
    let comparisons = 0;
    let swaps = 0;

    for (const s of steps.slice(0, currentStep + 1)) {
      if (s.comparing?.length) comparisons++;
      if (s.swapping?.length) swaps++;
    }

    return { comparisons, swaps };
  }, [steps, currentStep]);

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const speedLabel =
    speed < 15
      ? "0.25x"
      : speed < 35
        ? "0.5x"
        : speed < 55
          ? "1x"
          : speed < 75
            ? "2x"
            : speed < 95
              ? "5x"
              : "10x";

  const genSorting = useCallback((arr: number[], id: string): Step[] => {
    const s: Step[] = [];
    const a = [...arr];
    const n = a.length;

    if (id === "bubble") {
      s.push({ array: [...a], message: "Initial array", sorted: [], codeLine: 0 });
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          s.push({
            array: [...a],
            comparing: [j, j + 1],
            message: `Comparing ${a[j]} & ${a[j + 1]}`,
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
            codeLine: 3,
          });
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            s.push({
              array: [...a],
              swapping: [j, j + 1],
              message: `Swapped ${a[j + 1]} ↔ ${a[j]}`,
              sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
              codeLine: 5,
            });
          }
        }
      }
      s.push({
        array: [...a],
        message: "✅ Sorted!",
        sorted: Array.from({ length: n }, (_, i) => i),
        codeLine: 0,
      });
    } else if (id === "selection") {
      s.push({ array: [...a], message: "Initial array", sorted: [], codeLine: 0 });
      for (let i = 0; i < n - 1; i++) {
        let m = i;
        for (let j = i + 1; j < n; j++) {
          s.push({
            array: [...a],
            comparing: [m, j],
            message: `Comparing ${a[m]} & ${a[j]}`,
            sorted: Array.from({ length: i }, (_, k) => k),
            codeLine: 4,
          });
          if (a[j] < a[m]) m = j;
        }
        if (m !== i) {
          [a[i], a[m]] = [a[m], a[i]];
          s.push({
            array: [...a],
            swapping: [i, m],
            message: `Swapped ${a[m]} ↔ ${a[i]}`,
            sorted: Array.from({ length: i }, (_, k) => k),
            codeLine: 6,
          });
        }
      }
      s.push({
        array: [...a],
        message: "✅ Sorted!",
        sorted: Array.from({ length: n }, (_, i) => i),
        codeLine: 0,
      });
    } else if (id === "insertion") {
      s.push({ array: [...a], message: "Initial array", sorted: [0], codeLine: 0 });
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        s.push({
          array: [...a],
          current: i,
          message: `Inserting ${key}`,
          sorted: Array.from({ length: i }, (_, k) => k),
          codeLine: 2,
        });
        while (j >= 0 && a[j] > key) {
          a[j + 1] = a[j];
          s.push({
            array: [...a],
            swapping: [j, j + 1],
            message: `Shift ${a[j]}`,
            sorted: Array.from({ length: i }, (_, k) => k),
            codeLine: 4,
          });
          j--;
        }
        a[j + 1] = key;
        s.push({
          array: [...a],
          message: `Placed ${key}`,
          sorted: Array.from({ length: i + 1 }, (_, k) => k),
          codeLine: 6,
        });
      }
      s.push({
        array: [...a],
        message: "✅ Sorted!",
        sorted: Array.from({ length: n }, (_, i) => i),
        codeLine: 0,
      });
    } else if (id === "merge") {
      s.push({ array: [...a], message: "Merge Sort — divide and conquer", sorted: [] });

      const mergeSortSteps = (_arr: number[], lo: number, hi: number) => {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        s.push({
          array: [...a],
          message: `Split [${lo}..${hi}] → [${lo}..${mid}] and [${mid + 1}..${hi}]`,
          comparing: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
          sorted: [],
        });
        mergeSortSteps(_arr, lo, mid);
        mergeSortSteps(_arr, mid + 1, hi);

        const left = a.slice(lo, mid + 1);
        const right = a.slice(mid + 1, hi + 1);
        let i = 0;
        let j = 0;
        let k = lo;

        s.push({
          array: [...a],
          message: `Merging [${lo}..${mid}] and [${mid + 1}..${hi}]`,
          comparing: [lo, hi],
          sorted: [],
        });

        while (i < left.length && j < right.length) {
          s.push({
            array: [...a],
            comparing: [k, mid + 1 + j < hi + 1 ? mid + 1 + j : k],
            message: `Compare ${left[i]} vs ${right[j]}`,
            sorted: [],
          });

          if (left[i] <= right[j]) {
            a[k] = left[i];
            i++;
          } else {
            a[k] = right[j];
            j++;
          }

          s.push({
            array: [...a],
            swapping: [k],
            message: `Place ${a[k]} at position ${k}`,
            sorted: [],
          });

          k++;
        }

        while (i < left.length) {
          a[k] = left[i];
          s.push({
            array: [...a],
            swapping: [k],
            message: `Place remaining ${a[k]}`,
            sorted: [],
          });
          i++;
          k++;
        }

        while (j < right.length) {
          a[k] = right[j];
          s.push({
            array: [...a],
            swapping: [k],
            message: `Place remaining ${a[k]}`,
            sorted: [],
          });
          j++;
          k++;
        }

        s.push({
          array: [...a],
          message: `Merged [${lo}..${hi}] ✓`,
          sorted: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
        });
      };

      mergeSortSteps(a, 0, n - 1);
      s.push({
        array: [...a],
        message: "✅ Merge Sort complete!",
        sorted: Array.from({ length: n }, (_, i) => i),
      });
    } else if (id === "quick") {
      s.push({ array: [...a], message: "Quick Sort — partition around pivot", sorted: [] });

      const quickSortSteps = (lo: number, hi: number) => {
        if (lo >= hi) {
          if (lo === hi) {
            s.push({
              array: [...a],
              message: `Element ${a[lo]} in place`,
              sorted: [lo],
            });
          }
          return;
        }

        const pivot = a[hi];
        s.push({
          array: [...a],
          current: hi,
          message: `Pivot = ${pivot} (index ${hi})`,
          comparing: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
          sorted: [],
        });

        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
          s.push({
            array: [...a],
            comparing: [j, hi],
            current: hi,
            message: `Compare ${a[j]} with pivot ${pivot}`,
            sorted: [],
          });

          if (a[j] < pivot) {
            i++;
            if (i !== j) {
              [a[i], a[j]] = [a[j], a[i]];
              s.push({
                array: [...a],
                swapping: [i, j],
                current: hi,
                message: `Swap ${a[j]} ↔ ${a[i]} (${a[j]} < pivot)`,
                sorted: [],
              });
            }
          }
        }

        [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
        s.push({
          array: [...a],
          swapping: [i + 1, hi],
          message: `Pivot ${pivot} placed at index ${i + 1}`,
          sorted: [i + 1],
        });

        quickSortSteps(lo, i);
        quickSortSteps(i + 2, hi);
      };

      quickSortSteps(0, n - 1);
      s.push({
        array: [...a],
        message: "✅ Quick Sort complete!",
        sorted: Array.from({ length: n }, (_, i) => i),
      });
    } else if (id === "heap") {
      s.push({ array: [...a], message: "Heap Sort — build max-heap, then extract", sorted: [] });

      const heapify = (size: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size && a[left] > a[largest]) largest = left;
        if (right < size && a[right] > a[largest]) largest = right;

        if (largest !== i) {
          s.push({
            array: [...a],
            comparing: [i, largest],
            message: `Heapify: compare ${a[i]} (parent) with ${a[largest]} (child)`,
            sorted: Array.from({ length: n - size }, (_, k) => n - 1 - k),
          });

          [a[i], a[largest]] = [a[largest], a[i]];

          s.push({
            array: [...a],
            swapping: [i, largest],
            message: `Swap ${a[largest]} ↔ ${a[i]}`,
            sorted: Array.from({ length: n - size }, (_, k) => n - 1 - k),
          });

          heapify(size, largest);
        }
      };

      s.push({ array: [...a], message: "Phase 1: Building max-heap...", sorted: [] });
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        s.push({
          array: [...a],
          current: i,
          message: `Heapify node at index ${i} (value ${a[i]})`,
          sorted: [],
        });
        heapify(n, i);
      }

      s.push({ array: [...a], message: "Max-heap built ✓ — root is maximum", sorted: [] });
      s.push({ array: [...a], message: "Phase 2: Extract max elements...", sorted: [] });

      for (let i = n - 1; i > 0; i--) {
        s.push({
          array: [...a],
          comparing: [0, i],
          message: `Extract max ${a[0]} → swap with index ${i}`,
          sorted: Array.from({ length: n - 1 - i }, (_, k) => n - 1 - k),
        });

        [a[0], a[i]] = [a[i], a[0]];

        s.push({
          array: [...a],
          swapping: [0, i],
          message: `${a[i]} placed at end, heapify remaining`,
          sorted: Array.from({ length: n - i }, (_, k) => n - 1 - k),
        });

        heapify(i, 0);
      }

      s.push({
        array: [...a],
        message: "✅ Heap Sort complete!",
        sorted: Array.from({ length: n }, (_, i) => i),
      });
    } else {
      s.push({ array: [...a], message: "Initial array", sorted: [] });
      a.sort((x, y) => x - y);
      s.push({
        array: [...a],
        message: "✅ Sorted!",
        sorted: Array.from({ length: n }, (_, i) => i),
      });
    }

    return s;
  }, []);

  const genDP = useCallback(
    (id: string): Step[] => {
      const s: Step[] = [];
      const snap = (t: number[][]) => t.map((r) => [...r]);
      const Y = "#f6e05e";
      const C = "#63b3ed";
      const G = "#68d391";
      const P = "#9f7aea";
      void P;

      if (id === "fibonacci") {
        const n = Math.min(parseInt(nInput) || 8, 20);
        const memo: (number | null)[] = Array(n + 1).fill(null);
        memo[0] = 0;
        memo[1] = 1;

        s.push({
          message: "Initialize memo",
          dpTitle: "Initialize Memo Table",
          dpDesc: `Creating memo[0..${n}]. All cells empty except base cases.`,
          dpMemo: [...memo],
          dpHighlights: [
            { r: 0, c: 0, color: G },
            { r: 0, c: 1, color: G },
          ],
        });

        s.push({
          message: "Base cases",
          dpTitle: "Base Cases",
          dpDesc: `memo[0] = 0, memo[1] = 1. These are our starting values.`,
          dpMemo: [...memo],
          dpHighlights: [
            { r: 0, c: 0, color: G },
            { r: 0, c: 1, color: G },
          ],
        });

        for (let i = 2; i <= n; i++) {
          s.push({
            message: `Computing fib(${i})`,
            dpTitle: `Computing fib(${i})`,
            dpDesc: `Need fib(${i - 1}) = ${memo[i - 1]} and fib(${i - 2}) = ${memo[i - 2]}`,
            dpMemo: [...memo],
            dpHighlights: [
              { r: 0, c: i - 1, color: C },
              { r: 0, c: i - 2, color: C },
              { r: 0, c: i, color: Y },
            ],
          });

          memo[i] = (memo[i - 1] || 0) + (memo[i - 2] || 0);

          s.push({
            message: `fib(${i}) = ${memo[i]}`,
            dpTitle: `fib(${i}) = ${memo[i - 1]} + ${memo[i - 2]} = ${memo[i]}`,
            dpDesc: `Stored memo[${i}] = ${memo[i]}`,
            dpMemo: [...memo],
            dpHighlights: [{ r: 0, c: i, color: G }],
          });
        }

        s.push({
          message: `✅ fib(${n}) = ${memo[n]}`,
          dpTitle: `✅ Complete! fib(${n}) = ${memo[n]}`,
          dpDesc: `All ${n + 1} subproblems solved with O(n) time instead of O(2^n)`,
          dpMemo: [...memo],
          dpHighlights: memo.map((_, i) => ({ r: 0, c: i, color: G })),
        });
      } else if (id === "knapsack") {
        const wt = weightsInput
          .split(",")
          .map(Number)
          .filter((n) => !Number.isNaN(n));
        const val = valuesInput
          .split(",")
          .map(Number)
          .filter((n) => !Number.isNaN(n));
        const W = parseInt(capacityInput) || 8;
        const n = Math.min(wt.length, val.length);
        const dp: number[][] = Array(n + 1)
          .fill(null)
          .map(() => Array(W + 1).fill(0));

        const rH = ["0", ...wt.map((_, i) => `I${i + 1}(w${wt[i]},v${val[i]})`)];
        const cH = Array.from({ length: W + 1 }, (_, i) => String(i));

        s.push({
          message: "Init table",
          dpTitle: "Initialize Knapsack Table",
          dpDesc: `${n} items, capacity ${W}. Row 0 and col 0 = 0 (base case).`,
          dpTable: snap(dp),
          dpRowHeaders: rH,
          dpColHeaders: cH,
          dpHighlights: [],
        });

        for (let i = 1; i <= n; i++) {
          s.push({
            message: `Item ${i}`,
            dpTitle: `Processing Item ${i}: weight=${wt[i - 1]}, value=${val[i - 1]}`,
            dpDesc: `Deciding for each capacity whether to include Item ${i}`,
            dpTable: snap(dp),
            dpRowHeaders: rH,
            dpColHeaders: cH,
            dpExtra: `Item ${i}: w=${wt[i - 1]}, v=${val[i - 1]}`,
            dpHighlights: [],
          });

          for (let w = 1; w <= W; w++) {
            if (wt[i - 1] > w) {
              dp[i][w] = dp[i - 1][w];
              s.push({
                message: `Skip item ${i}`,
                dpTitle: `Item ${i} too heavy for capacity ${w}`,
                dpDesc: `weight ${wt[i - 1]} > capacity ${w}. dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}`,
                dpTable: snap(dp),
                dpRowHeaders: rH,
                dpColHeaders: cH,
                dpHighlights: [
                  { r: i, c: w, color: Y },
                  { r: i - 1, c: w, color: C },
                ],
              });
            } else {
              const excl = dp[i - 1][w];
              const incl = val[i - 1] + dp[i - 1][w - wt[i - 1]];

              s.push({
                message: "Choose",
                dpTitle: `Include or Exclude Item ${i}? (cap=${w})`,
                dpDesc: `Exclude: dp[${i - 1}][${w}]=${excl}. Include: ${val[i - 1]}+dp[${i - 1}][${w - wt[i - 1]}]=${val[i - 1]}+${dp[i - 1][w - wt[i - 1]]}=${incl}`,
                dpTable: snap(dp),
                dpRowHeaders: rH,
                dpColHeaders: cH,
                dpHighlights: [
                  { r: i, c: w, color: Y },
                  { r: i - 1, c: w, color: C },
                  { r: i - 1, c: w - wt[i - 1], color: P },
                ],
              });

              dp[i][w] = Math.max(excl, incl);
              const chose = dp[i][w] === incl ? "Include" : "Exclude";

              s.push({
                message: `${chose}`,
                dpTitle: `${chose}! dp[${i}][${w}] = ${dp[i][w]}`,
                dpDesc: `max(${excl}, ${incl}) = ${dp[i][w]}`,
                dpTable: snap(dp),
                dpRowHeaders: rH,
                dpColHeaders: cH,
                dpHighlights: [{ r: i, c: w, color: G }],
              });
            }
          }
        }

        s.push({
          message: `✅ Max value = ${dp[n][W]}`,
          dpTitle: `✅ Maximum Value = ${dp[n][W]}`,
          dpDesc: `Best value achievable with ${n} items and capacity ${W}`,
          dpTable: snap(dp),
          dpRowHeaders: rH,
          dpColHeaders: cH,
          dpHighlights: [{ r: n, c: W, color: G }],
        });
      } else if (id === "lcs") {
        const a = str1Input || "ABCBDAB";
        const b = str2Input || "BDCAB";
        const m = a.length;
        const n = b.length;

        const dp: number[][] = Array(m + 1)
          .fill(null)
          .map(() => Array(n + 1).fill(0));

        const rH = ["ε", ...a.split("")];
        const cH = ["ε", ...b.split("")];

        s.push({
          message: "Init",
          dpTitle: "Initialize LCS Table",
          dpDesc: `Comparing "${a}" (length ${m}) with "${b}" (length ${n}). Base row/col = 0.`,
          dpTable: snap(dp),
          dpRowHeaders: rH,
          dpColHeaders: cH,
          dpHighlights: [],
        });

        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const ch1 = a[i - 1];
            const ch2 = b[j - 1];

            s.push({
              message: "Compare",
              dpTitle: `Comparing '${ch1}' with '${ch2}'`,
              dpDesc: `str1[${i}]='${ch1}' vs str2[${j}]='${ch2}'`,
              dpTable: snap(dp),
              dpRowHeaders: rH,
              dpColHeaders: cH,
              dpHighlights: [{ r: i, c: j, color: Y }],
            });

            if (ch1 === ch2) {
              dp[i][j] = dp[i - 1][j - 1] + 1;
              s.push({
                message: "Match!",
                dpTitle: `Match! '${ch1}' = '${ch2}'`,
                dpDesc: `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}`,
                dpTable: snap(dp),
                dpRowHeaders: rH,
                dpColHeaders: cH,
                dpHighlights: [
                  { r: i, c: j, color: G },
                  { r: i - 1, c: j - 1, color: C },
                ],
              });
            } else {
              dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
              const fromAbove = dp[i - 1][j];
              const fromLeft = dp[i][j - 1];

              s.push({
                message: "No match",
                dpTitle: `No Match. max(${fromAbove}, ${fromLeft}) = ${dp[i][j]}`,
                dpDesc: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${fromAbove}, ${fromLeft}) = ${dp[i][j]}`,
                dpTable: snap(dp),
                dpRowHeaders: rH,
                dpColHeaders: cH,
                dpHighlights: [
                  { r: i, c: j, color: Y },
                  { r: i - 1, c: j, color: C },
                  { r: i, c: j - 1, color: C },
                ],
              });
            }
          }
        }

        let lcsStr = "";
        let ti = m;
        let tj = n;
        const traceHL: { r: number; c: number; color: string }[] = [];

        while (ti > 0 && tj > 0) {
          if (a[ti - 1] === b[tj - 1]) {
            lcsStr = a[ti - 1] + lcsStr;
            traceHL.push({ r: ti, c: tj, color: G });
            ti--;
            tj--;
          } else if (dp[ti - 1][tj] > dp[ti][tj - 1]) ti--;
          else tj--;
        }

        s.push({
          message: `✅ LCS = "${lcsStr}" (length ${dp[m][n]})`,
          dpTitle: `✅ LCS = "${lcsStr}", Length = ${dp[m][n]}`,
          dpDesc: "Traced back through table to find the subsequence",
          dpTable: snap(dp),
          dpRowHeaders: rH,
          dpColHeaders: cH,
          dpHighlights: traceHL,
        });
      } else if (id === "lis") {
        const arr = arrayInput
          .split(",")
          .map(Number)
          .filter((n) => !Number.isNaN(n));
        const n = arr.length;
        const dp = Array(n).fill(1);

        s.push({
          message: "Init",
          dpTitle: "Initialize LIS",
          dpDesc: `Array: [${arr.join(", ")}]. Every element alone is LIS of length 1.`,
          array: [...arr],
          dpTable: [[...dp]],
          dpHighlights: arr.map((_, i) => ({ r: 0, c: i, color: C })),
        });

        for (let i = 1; i < n; i++) {
          s.push({
            message: `Process ${arr[i]}`,
            dpTitle: `Processing arr[${i}] = ${arr[i]}`,
            dpDesc: `Finding longest increasing subsequence ending at index ${i}`,
            array: [...arr],
            dpTable: [[...dp]],
            dpHighlights: [{ r: 0, c: i, color: Y }],
            comparing: [i],
          });

          for (let j = 0; j < i; j++) {
            if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
              dp[i] = dp[j] + 1;
              s.push({
                message: "Extend",
                dpTitle: `${arr[j]} < ${arr[i]} → dp[${i}] = dp[${j}] + 1 = ${dp[i]}`,
                dpDesc: `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}. Extending: dp[${j}]+1 = ${dp[j]}+1 = ${dp[i]}`,
                array: [...arr],
                dpTable: [[...dp]],
                dpHighlights: [
                  { r: 0, c: i, color: G },
                  { r: 0, c: j, color: C },
                ],
                comparing: [j, i],
              });
            }
          }

          s.push({
            message: `dp[${i}]=${dp[i]}`,
            dpTitle: `dp[${i}] finalized = ${dp[i]}`,
            dpDesc: `Best LIS ending at index ${i} has length ${dp[i]}`,
            array: [...arr],
            dpTable: [[...dp]],
            dpHighlights: [{ r: 0, c: i, color: G }],
          });
        }

        const maxLIS = Math.max(...dp);
        const maxIdx = dp.indexOf(maxLIS);

        s.push({
          message: `✅ LIS = ${maxLIS}`,
          dpTitle: `✅ LIS Length = ${maxLIS}`,
          dpDesc: `Longest increasing subsequence has length ${maxLIS}, ending at index ${maxIdx} (value ${arr[maxIdx]})`,
          array: [...arr],
          dpTable: [[...dp]],
          dpHighlights: [{ r: 0, c: maxIdx, color: G }],
        });
      } else if (id === "mcm") {
        const dims = [10, 20, 30, 40, 30];
        const n = dims.length - 1;
        const dp: number[][] = Array(n)
          .fill(null)
          .map(() => Array(n).fill(0));
        const mNames = Array.from(
          { length: n },
          (_, i) => `M${i + 1}(${dims[i]}×${dims[i + 1]})`,
        );
        const cH = mNames.map((_, i) => `M${i + 1}`);

        s.push({
          message: "Init",
          dpTitle: "Matrix Chain Multiplication",
          dpDesc: `${n} matrices: ${mNames.join(", ")}. Goal: minimize scalar multiplications.`,
          dpTable: snap(dp),
          dpColHeaders: cH,
          dpRowHeaders: cH,
          dpHighlights: Array.from({ length: n }, (_, i) => ({ r: i, c: i, color: C })),
        });

        for (let len = 2; len <= n; len++) {
          for (let i = 0; i < n - len + 1; i++) {
            const j = i + len - 1;
            dp[i][j] = Infinity;

            s.push({
              message: `Solving dp[${i}][${j}]`,
              dpTitle: `Chain M${i + 1} to M${j + 1} (length ${len})`,
              dpDesc: `Finding minimum cost to multiply matrices ${i + 1} through ${j + 1}`,
              dpTable: snap(dp),
              dpColHeaders: cH,
              dpRowHeaders: cH,
              dpHighlights: [{ r: i, c: j, color: Y }],
            });

            for (let k = i; k < j; k++) {
              const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
              const isBetter = cost < dp[i][j];
              if (isBetter) dp[i][j] = cost;

              s.push({
                message: `Split k=${k + 1}`,
                dpTitle: `Split at k=${k + 1}: cost = ${cost}${isBetter ? " ← new min!" : ""}`,
                dpDesc: `dp[${i}][${k}] + dp[${k + 1}][${j}] + ${dims[i]}×${dims[k + 1]}×${dims[j + 1]} = ${dp[i][k]}+${dp[k + 1][j]}+${dims[i] * dims[k + 1] * dims[j + 1]} = ${cost}`,
                dpTable: snap(dp),
                dpColHeaders: cH,
                dpRowHeaders: cH,
                dpHighlights: [
                  { r: i, c: j, color: isBetter ? G : Y },
                  { r: i, c: k, color: C },
                  { r: k + 1, c: j, color: P },
                ],
              });
            }
          }
        }

        s.push({
          message: `✅ Min cost = ${dp[0][n - 1]}`,
          dpTitle: `✅ Minimum Multiplications = ${dp[0][n - 1]}`,
          dpDesc: `Optimal cost to multiply all ${n} matrices`,
          dpTable: snap(dp),
          dpColHeaders: cH,
          dpRowHeaders: cH,
          dpHighlights: [{ r: 0, c: n - 1, color: G }],
        });
      } else {
        s.push({ message: "Click Visualize", dpTable: [[0]] });
      }

      return s;
    },
    [nInput, str1Input, str2Input, weightsInput, valuesInput, capacityInput, arrayInput],
  );

  const genGraph = useCallback((): Step[] => {
    const s: Step[] = [];
    const { nodes, edges, labels } = gp;
    const iN = nodes.map((id) => ({ id, state: "default" }));
    const iE = edges.map((e) => ({ ...e, state: "default" }));
    const startN = graphStartNode < nodes.length ? graphStartNode : 0;

    s.push({
      graphNodes: iN.map((n) => ({ ...n })),
      graphEdges: iE.map((e) => ({ ...e })),
      message: `Graph — ${nodes.length} nodes, start: ${labels[startN]}`,
      visited: [],
      output: [],
      auxQueue: [startN],
    });

    const vis: number[] = [];
    const q = [startN];
    vis.push(startN);
    const output: number[] = [];

    while (q.length > 0) {
      const c = q.shift()!;
      output.push(c);
      const neighbors: number[] = [];

      for (const e of edges) {
        let nb = -1;
        if (e.from === c && !vis.includes(e.to)) nb = e.to;
        if (e.to === c && !vis.includes(e.from)) nb = e.from;

        if (nb !== -1 && !vis.includes(nb)) {
          vis.push(nb);
          q.push(nb);
          neighbors.push(nb);
        }
      }

      s.push({
        graphNodes: iN.map((n) => ({
          ...n,
          state: vis.includes(n.id) ? (n.id === c ? "current" : "visited") : "default",
        })),
        graphEdges: iE.map((e) => ({
          ...e,
          state: vis.includes(e.from) && vis.includes(e.to) ? "used" : "default",
        })),
        message: `Dequeue ${labels[c]}${neighbors.length ? `, enqueue ${neighbors.map((n) => labels[n]).join(",")}` : ""}`,
        visited: [...vis],
        output: [...output],
        auxQueue: [...q],
      });
    }

    s.push({
      graphNodes: iN.map((n) => ({ ...n, state: "visited" })),
      graphEdges: iE.map((e) => ({ ...e, state: "used" })),
      message: "✅ Traversal complete!",
      visited: vis,
      output,
      auxQueue: [],
    });

    return s;
  }, [gp, graphStartNode]);

  const genTree = useCallback((arr: number[], algoId: string): Step[] => {
    const s: Step[] = [];
    let root: TNode | undefined;

    for (const v of arr) root = insertBST(root, v);

    const flat: FlatNode[] = [];
    flattenTree(root, 280, 35, 120, -1, flat);

    const isTraversal =
      algoId.includes("inorder") ||
      algoId.includes("preorder") ||
      algoId.includes("postorder");

    const toN = (visited: number[], cur?: number, moving?: number) =>
      flat.map((n) => ({
        ...n,
        state:
          n.value === cur
            ? "current"
            : n.value === moving
              ? "move"
              : visited.includes(n.value)
                ? "visited"
                : "default",
      }));

    s.push({ message: `BST: [${arr.join(", ")}]`, treeNodes: toN([]), output: [] });

    if (isTraversal) {
      const path = getTraversalPath(root, algoId);
      const visited: number[] = [];
      const movementTrail: number[] = [];

      for (const step of path) {
        if (!movementTrail.includes(step.nodeValue)) movementTrail.push(step.nodeValue);

        if (step.action === "visit") {
          visited.push(step.nodeValue);
          s.push({
            message: step.message,
            treeNodes: toN(visited, step.nodeValue),
            output: [...visited],
          });
        } else {
          s.push({
            message: step.message,
            treeNodes: toN(visited, undefined, step.nodeValue),
            output: [...visited],
          });
        }
      }

      const typeName = algoId.includes("inorder")
        ? "Inorder"
        : algoId.includes("preorder")
          ? "Preorder"
          : "Postorder";

      s.push({
        message: `✅ ${typeName}: ${visited.join(" → ")}`,
        treeNodes: toN(visited),
        output: visited,
      });
    } else {
      const order = getTraversalOrder(root, algoId);
      const visited: number[] = [];

      for (const val of order) {
        visited.push(val);
        s.push({
          message: `Visiting ${val}`,
          treeNodes: toN(visited, val),
          output: [...visited],
        });
      }

      s.push({
        message: `✅ Complete: ${order.join(" → ")}`,
        treeNodes: toN(order),
        output: order,
      });
    }

    return s;
  }, []);

  const STACK_DEFAULTS: Record<string, string> = {
    "balanced-parens": "{[(a+b)*(c-d)]+((e/f)+g)}",
    "infix-postfix": "((A+B)*C-(D-E))^(F+G/H)",
    "infix-prefix": "(A+B*C-(D/E^F)*G)*H",
    "postfix-eval": "2 3 * 5 4 * + 9 2 / - 7 +",
    "prefix-eval": "- + 7 * 4 5 + 2 0",
  };

  const genStackAlgo = useCallback((id: string, input: string): Step[] => {
    const s: Step[] = [];
    const raw = input.trim();
    const expr = raw || STACK_DEFAULTS[id] || "";

    if (!expr) {
      s.push({ message: "⚠️ Please enter an expression", array: [], output: [] });
      return s;
    }

    const prec: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
    const isOp = (c: string) => "+-*/^".includes(c);
    const isOpen = (c: string) => "([{".includes(c);
    const isClose = (c: string) => ")]}".includes(c);
    const matchMap: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

    if (id === "balanced-parens") {
      const stack: string[] = [];
      s.push({ message: `Checking: "${expr}"`, array: [], output: [] });
      let ok = true;

      for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (isOpen(ch)) {
          stack.push(ch);
          s.push({
            message: `[${i}] '${ch}' is opening → Push → Stack: [ ${stack.join("  ")} ]`,
            array: stack.map((c) => c.charCodeAt(0)),
            output: [],
            current: stack.length - 1,
          });
        } else if (isClose(ch)) {
          if (!stack.length || stack[stack.length - 1] !== matchMap[ch]) {
            s.push({
              message: `[${i}] ❌ '${ch}' — no matching '${matchMap[ch]}' on stack!`,
              array: stack.map((c) => c.charCodeAt(0)),
              output: [],
            });
            ok = false;
            break;
          }

          stack.pop();
          s.push({
            message: `[${i}] '${ch}' matches → Pop ✓ → Stack: [ ${stack.join("  ")} ]`,
            array: stack.map((c) => c.charCodeAt(0)),
            output: [],
            swapping: [stack.length],
          });
        }
      }

      if (ok && stack.length) {
        ok = false;
        s.push({
          message: `❌ Unmatched openers left: [ ${stack.join("  ")} ]`,
          array: stack.map((c) => c.charCodeAt(0)),
          output: [],
        });
      }

      if (ok) s.push({ message: "✅ Expression is BALANCED!", array: [], output: [] });
    } else if (id === "infix-postfix") {
      const stack: string[] = [];
      const out: string[] = [];
      s.push({ message: `Infix → Postfix: "${expr}"`, array: [], output: [] });

      for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (ch === " ") continue;

        if (/[a-zA-Z0-9]/.test(ch)) {
          out.push(ch);
          s.push({
            message: `[${i}] Operand '${ch}' → add to output`,
            array: stack.map((c) => c.charCodeAt(0)),
            output: out.map((c) => c.charCodeAt(0)),
          });
        } else if (isOpen(ch)) {
          stack.push(ch);
          s.push({
            message: `[${i}] Push '${ch}'`,
            array: stack.map((c) => c.charCodeAt(0)),
            output: out.map((c) => c.charCodeAt(0)),
            current: stack.length - 1,
          });
        } else if (isClose(ch)) {
          const opener = matchMap[ch] || "(";
          while (stack.length && stack[stack.length - 1] !== opener) out.push(stack.pop()!);
          stack.pop();
          s.push({
            message: `[${i}] '${ch}' → pop until '${opener}' → Output: ${out.join("")}`,
            array: stack.map((c) => c.charCodeAt(0)),
            output: out.map((c) => c.charCodeAt(0)),
          });
        } else if (isOp(ch)) {
          while (
            stack.length &&
            !isOpen(stack[stack.length - 1]) &&
            (prec[stack[stack.length - 1]] || 0) >= prec[ch]
          ) {
            out.push(stack.pop()!);
          }

          stack.push(ch);
          s.push({
            message: `[${i}] Op '${ch}' (prec ${prec[ch]}) → Stack: [ ${stack.join("  ")} ]`,
            array: stack.map((c) => c.charCodeAt(0)),
            output: out.map((c) => c.charCodeAt(0)),
            current: stack.length - 1,
          });
        }
      }

      while (stack.length) out.push(stack.pop()!);

      s.push({
        message: `✅ Postfix: ${out.join("")}`,
        array: [],
        output: out.map((c) => c.charCodeAt(0)),
        sorted: out.map((_, i) => i),
      });
    } else if (id === "infix-prefix") {
      const chars = expr
        .split("")
        .reverse()
        .map((c) =>
          isOpen(c)
            ? ({ "(": ")", "[": "]", "{": "}" }[c] || c)
            : isClose(c)
              ? ({ ")": "(", "]": "[", "}": "{" }[c] || c)
              : c,
        );

      const rev = chars.join("");
      s.push({ message: `Step 1: Reverse & swap brackets → "${rev}"`, array: [], output: [] });

      const stack: string[] = [];
      const out: string[] = [];

      for (let i = 0; i < rev.length; i++) {
        const ch = rev[i];
        if (ch === " ") continue;

        if (/[a-zA-Z0-9]/.test(ch)) out.push(ch);
        else if (isOpen(ch)) stack.push(ch);
        else if (isClose(ch)) {
          const opener = matchMap[ch] || "(";
          while (stack.length && stack[stack.length - 1] !== opener) out.push(stack.pop()!);
          stack.pop();
        } else if (isOp(ch)) {
          while (
            stack.length &&
            !isOpen(stack[stack.length - 1]) &&
            (prec[stack[stack.length - 1]] || 0) > prec[ch]
          ) {
            out.push(stack.pop()!);
          }
          stack.push(ch);
        }

        s.push({
          message: `Step 2[${i}]: '${ch}' → Stack: [${stack.join(" ")}]  Out: ${out.join("")}`,
          array: stack.map((c) => c.charCodeAt(0)),
          output: out.map((c) => c.charCodeAt(0)),
        });
      }

      while (stack.length) out.push(stack.pop()!);

      s.push({
        message: `Postfix of reversed: "${out.join("")}"`,
        array: [],
        output: out.map((c) => c.charCodeAt(0)),
      });

      const prefix = out.reverse().join("");
      s.push({
        message: `Step 3: Reverse → "${prefix}"`,
        array: [],
        output: prefix.split("").map((c) => c.charCodeAt(0)),
      });
      s.push({
        message: `✅ Prefix: ${prefix}`,
        array: [],
        output: prefix.split("").map((c) => c.charCodeAt(0)),
        sorted: prefix.split("").map((_, i) => i),
      });
    } else if (id === "postfix-eval") {
      const hasSpaces = expr.includes(" ");
      const tokens = hasSpaces
        ? expr.split(/\s+/).filter((t) => t)
        : expr.split("").filter((c) => c !== " ");

      const stack: number[] = [];
      s.push({ message: `Evaluating Postfix: "${expr}"`, array: [], output: [] });
      let err = false;

      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        if (!Number.isNaN(Number(t)) && t !== "") {
          stack.push(Number(t));
          s.push({
            message: `[${i}] Push operand ${t} → Stack: [${stack.join(", ")}]`,
            array: [...stack],
            output: [],
            current: stack.length - 1,
          });
        } else if (isOp(t)) {
          if (stack.length < 2) {
            s.push({ message: `❌ Not enough operands for '${t}'`, array: [...stack], output: [] });
            err = true;
            break;
          }

          const b = stack.pop()!;
          const a = stack.pop()!;
          let r: number;

          if (t === "+") r = a + b;
          else if (t === "-") r = a - b;
          else if (t === "*") r = a * b;
          else if (t === "/") {
            if (b === 0) {
              s.push({ message: `❌ Division by zero: ${a}/${b}`, array: [...stack], output: [] });
              err = true;
              break;
            }
            r = a / b;
          } else r = Math.pow(a, b);

          r = Math.round(r * 1000) / 1000;
          stack.push(r);

          s.push({
            message: `[${i}] Op '${t}' → ${a} ${t} ${b} = ${r} → Push ${r}`,
            array: [...stack],
            output: [],
            swapping: [stack.length - 1],
          });
        } else {
          s.push({ message: `❌ Invalid token: '${t}'`, array: [...stack], output: [] });
          err = true;
          break;
        }
      }

      if (!err) {
        s.push({
          message: stack.length === 1 ? `✅ Result = ${stack[0]}` : `❌ Invalid expression (${stack.length} values left)`,
          array: [...stack],
          output: [],
          sorted: stack.length === 1 ? [0] : [],
        });
      }
    } else if (id === "prefix-eval") {
      const hasSpaces = expr.includes(" ");
      const tokens = hasSpaces
        ? expr.split(/\s+/).filter((t) => t)
        : expr.split("").filter((c) => c !== " ");
      const rev = [...tokens].reverse();
      const stack: number[] = [];

      s.push({ message: `Evaluating Prefix: "${expr}" — scanning right→left`, array: [], output: [] });
      let err = false;

      for (let i = 0; i < rev.length; i++) {
        const t = rev[i];

        if (!Number.isNaN(Number(t)) && t !== "") {
          stack.push(Number(t));
          s.push({
            message: `[${tokens.length - 1 - i}] Push operand ${t} → Stack: [${stack.join(", ")}]`,
            array: [...stack],
            output: [],
            current: stack.length - 1,
          });
        } else if (isOp(t)) {
          if (stack.length < 2) {
            s.push({ message: `❌ Not enough operands for '${t}'`, array: [...stack], output: [] });
            err = true;
            break;
          }

          const a = stack.pop()!;
          const b = stack.pop()!;
          let r: number;

          if (t === "+") r = a + b;
          else if (t === "-") r = a - b;
          else if (t === "*") r = a * b;
          else if (t === "/") {
            if (b === 0) {
              s.push({ message: `❌ Division by zero: ${a}/${b}`, array: [...stack], output: [] });
              err = true;
              break;
            }
            r = a / b;
          } else r = Math.pow(a, b);

          r = Math.round(r * 1000) / 1000;
          stack.push(r);

          s.push({
            message: `[${tokens.length - 1 - i}] Op '${t}' → ${a} ${t} ${b} = ${r} → Push ${r}`,
            array: [...stack],
            output: [],
            swapping: [stack.length - 1],
          });
        } else {
          s.push({ message: `❌ Invalid token: '${t}'`, array: [...stack], output: [] });
          err = true;
          break;
        }
      }

      if (!err) {
        s.push({
          message: stack.length === 1 ? `✅ Result = ${stack[0]}` : `❌ Invalid expression (${stack.length} values left)`,
          array: [...stack],
          output: [],
          sorted: stack.length === 1 ? [0] : [],
        });
      }
    } else {
      s.push({ message: "Select an algorithm and click Visualize", array: [], output: [] });
    }

    return s;
  }, []);

  const generate = useCallback(() => {
    if (!selectedAlgo || INTERACTIVE_IDS.includes(selectedAlgo.id)) return;

    let ns: Step[] = [];

    if (category === "sorting") {
      const arr = arrayInput
        .split(",")
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      if (arr.length > 0) ns = genSorting(arr, selectedAlgo.id);
    } else if (category === "dp") ns = genDP(selectedAlgo.id);
    else if (category === "graph") ns = genGraph();
    else if (category === "tree") {
      const arr = arrayInput
        .split(",")
        .map(Number)
        .filter((n) => !Number.isNaN(n));
      if (arr.length > 0) ns = genTree(arr, selectedAlgo.id);
    } else if (category === "stack") {
      ns = genStackAlgo(selectedAlgo.id, arrayInput);
    }

    const isBstOp =
      category === "tree" &&
      selectedAlgo &&
      ["bst-insert", "bst-delete", "bst-search"].includes(selectedAlgo.id);

    setSteps(ns);
    setCurrentStep(0);
    setIsPlaying(isBstOp ? false : true);
  }, [selectedAlgo, category, arrayInput, genSorting, genDP, genGraph, genTree, genStackAlgo]);

  useEffect(() => {
    if (
      !autoRef.current &&
      selectedAlgo &&
      !INTERACTIVE_IDS.includes(selectedAlgo.id) &&
      !(category === "tree" && BST_OPS.includes(selectedAlgo.id))
    ) {
      autoRef.current = true;
      setTimeout(() => {
        try {
          generate();
        } catch {}
      }, 300);
    }
  }, [selectedAlgo, generate, graphIdx, category, BST_OPS, INTERACTIVE_IDS]);

  useEffect(() => {
    autoRef.current = false;
  }, [selectedAlgo?.id]);

  useEffect(() => {
    if (category === "stack" && selectedAlgo && !INTERACTIVE_IDS.includes(selectedAlgo.id)) {
      const def = STACK_DEFAULTS[selectedAlgo.id];
      if (def) setArrayInput(def);
    }
  }, [selectedAlgo?.id, category, INTERACTIVE_IDS, STACK_DEFAULTS]);

  const randomize = () => {
    if (category === "graph") {
      try {
        const newIdx =
          (graphIdx + 1 + Math.floor(Math.random() * (GRAPH_PRESETS.length - 1))) %
          GRAPH_PRESETS.length;
        setGraphIdx(newIdx);
        setSteps([]);
        setCurrentStep(0);
        setIsPlaying(false);
        autoRef.current = false;
      } catch {}
      return;
    }

    if (category === "sorting") {
      setArrayInput(
        Array.from({ length: sortSize }, () => Math.floor(Math.random() * 90) + 5).join(","),
      );
    } else if (category === "tree") {
      setArrayInput(
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 5).join(","),
      );
    } else if (category === "dp") {
      if (selectedAlgo?.id === "fibonacci") setNInput(String(Math.floor(Math.random() * 15) + 5));
      else if (selectedAlgo?.id === "knapsack") {
        setWeightsInput(
          Array.from({ length: 4 }, () => Math.floor(Math.random() * 5) + 1).join(","),
        );
        setValuesInput(
          Array.from({ length: 4 }, () => Math.floor(Math.random() * 10) + 1).join(","),
        );
        setCapacityInput(String(Math.floor(Math.random() * 10) + 5));
      } else if (selectedAlgo?.id === "lcs") {
        const c = "ABCDEFG";
        setStr1Input(
          Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join(""),
        );
        setStr2Input(
          Array.from({ length: 5 }, () => c[Math.floor(Math.random() * c.length)]).join(""),
        );
      } else if (selectedAlgo?.id === "lis") {
        setArrayInput(
          Array.from({ length: 8 }, () => Math.floor(Math.random() * 50) + 1).join(","),
        );
      }
    }
  };

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      playRef.current = setInterval(() => {
        setCurrentStep((p) => {
          if (p >= steps.length - 1) {
            setIsPlaying(false);
            return p;
          }
          return p + 1;
        });
      }, 1100 - speed * 10);
    } else if (playRef.current) {
      clearInterval(playRef.current);
      playRef.current = null;
    }

    return () => {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [isPlaying, speed, steps.length]);

  const copyCode = async () => {
    if (!selectedAlgo) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(getCode(selectedAlgo.id, language));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const cur = steps[currentStep];
  const isStackAlgo =
    category === "stack" && !!selectedAlgo && !INTERACTIVE_IDS.includes(selectedAlgo.id);
  const showArr = category === "sorting" || category === "tree" || selectedAlgo?.id === "lis";

  const isVisualizerPage = !!selectedAlgo;
  if (!isVisualizerPage) return null;

  if (category === "sorting" && battleMode) {
    return <BattleMode onExit={() => setBattleMode(false)} />;
  }

  const timeRaw = formatComplexity(selectedAlgo.timeComplexity);
  const spaceRaw = formatComplexity(selectedAlgo.spaceComplexity);

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      <header
        className="flex h-[46px] shrink-0 items-center justify-between px-5"
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-rajdhani text-sm transition-colors hover:text-white"
          style={{ color: "#63b3ed" }}
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          <span className="font-orbitron text-xs tracking-[3px]" style={{ color: "#8892b0" }}>
            {categoryName}
          </span>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span className="text-xs font-rajdhani" style={{ color: "#63b3ed" }}>
            Time — <span className="font-jetbrains">{timeRaw}</span>
          </span>
          <span className="text-xs font-rajdhani" style={{ color: "#68d391" }}>
            Space — <span className="font-jetbrains">{spaceRaw}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {[
            { l: "Current", c: "#f6e05e" },
            { l: "Visited", c: "#68d391" },
            { l: "Default", c: "#4299e1" },
          ].map((i) => (
            <div key={i.l} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: i.c }} />
              <span className="font-rajdhani text-[11px]" style={{ color: "#8892b0" }}>
                {i.l}
              </span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="shrink-0 overflow-y-auto p-3"
          style={{
            width: "250px",
            background: "var(--bg-secondary)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="mb-1 text-[10px] tracking-[3px]" style={{ color: "var(--text-muted)" }}>
            ALGORITHMS
          </div>
          <div
            className="mb-3 font-orbitron text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>

          <div className="space-y-0.5">
            {hasSections
              ? sections.map((sec) => (
                  <div key={sec}>
                    <div
                      className="mb-1.5 mt-3 px-1 font-rajdhani text-[9px] tracking-[2px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {(sec || "").toUpperCase()}
                    </div>

                    {algorithms
                      .filter((a) => a.section === sec)
                      .map((al) => (
                        <AI
                          key={al.id}
                          a={al}
                          sel={selectedAlgo?.id}
                          ac={accent}
                          cat={category}
                          click={() => {
                            setSelectedAlgo(al);
                            setSteps([]);
                            setCurrentStep(0);
                            setIsPlaying(false);
                          }}
                        />
                      ))}
                  </div>
                ))
              : algorithms.map((al) => (
                  <AI
                    key={al.id}
                    a={al}
                    sel={selectedAlgo?.id}
                    ac={accent}
                    cat={category}
                    click={() => {
                      setSelectedAlgo(al);
                      setSteps([]);
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                  />
                ))}
          </div>

          {category === "sorting" && (
            <button
              onClick={() => setBattleMode(true)}
              className="mt-3 w-full rounded-lg p-2.5 text-xs font-bold transition-all"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.3)",
                color: "#f97316",
              }}
            >
              ⚔️ Battle Mode
            </button>
          )}
        </div>

        {selectedAlgo && INTERACTIVE_IDS.includes(selectedAlgo.id) ? (
          <InteractiveDS
            type={category === "stack" ? "stack" : "queue"}
            accent={accent}
            variant={selectedAlgo.id === "circular-queue-ops" ? "circular" : undefined}
          />
        ) : (
          <>
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex flex-1 flex-col overflow-y-auto p-4">
                <div className="mb-2 flex items-center gap-3">
                  <h2
                    className="font-orbitron text-xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedAlgo.name}
                  </h2>

                  <span
                    className="rounded px-2 py-0.5 text-[10px]"
                    style={{
                      background: `rgba(${hx(accent)},0.2)`,
                      color: accent,
                    }}
                  >
                    {category.toUpperCase()}
                  </span>

                  <p className="ml-2 flex-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {selectedAlgo.description}
                  </p>

                  <button
                    onClick={() => setShowUseCase(true)}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:brightness-125"
                    style={{
                      background: "#1a2233",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#f6e05e",
                    }}
                  >
                    💡 Use Case
                  </button>
                </div>

                {(category === "tree" || category === "graph") &&
                  cur?.output &&
                  cur.output.length > 0 && (
                    <div
                      className="mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5"
                      style={{
                        background: "#1a2233",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span
                        className="shrink-0 font-orbitron text-[10px] tracking-wider"
                        style={{ color: "#4a5568" }}
                      >
                        OUTPUT
                      </span>
                      <div className="h-3 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                      <div className="flex items-center gap-1 overflow-x-auto font-jetbrains text-xs">
                        {cur.output.map((v, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span style={{ color: "#4a5568" }}>→</span>}
                            <span
                              className="rounded px-1.5 py-0.5"
                              style={{
                                background:
                                  i === cur.output!.length - 1
                                    ? `rgba(${hx(accent)},0.3)`
                                    : "transparent",
                                color:
                                  i === cur.output!.length - 1
                                    ? accent
                                    : "#8892b0",
                              }}
                            >
                              {category === "graph" ? gp.labels[v] : v}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div
                  className="mb-3 flex flex-1 items-center justify-center overflow-auto rounded-xl p-5"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    minHeight: "220px",
                  }}
                >
                  {steps.length === 0 ? (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      {category === "sorting" && (
                        <div className="mb-4 flex h-32 items-end gap-[1px] opacity-30">
                          {[38, 27, 43, 3, 9, 82, 10, 55, 71, 19, 64, 25, 88, 41, 6, 47, 33, 58, 14, 76, 21, 69, 4].map(
                            (v, i) => (
                              <div
                                key={i}
                                className="rounded-t"
                                style={{
                                  width: "12px",
                                  height: `${v * 1.1 + 6}px`,
                                  background: accent,
                                }}
                              />
                            ),
                          )}
                        </div>
                      )}

                      {category === "graph" &&
                        (() => {
                          const gvb = computeViewBox(gp.pos, 25);
                          return (
                            <svg
                              className="mb-4 opacity-25"
                              viewBox={gvb.vb}
                              style={{ width: "200px", height: "120px" }}
                            >
                              {gp.edges.map((e, i) => (
                                <line
                                  key={i}
                                  x1={gp.pos[e.from].x}
                                  y1={gp.pos[e.from].y}
                                  x2={gp.pos[e.to].x}
                                  y2={gp.pos[e.to].y}
                                  stroke={accent}
                                  strokeWidth="1.5"
                                />
                              ))}

                              {gp.pos.map((p, i) => (
                                <g key={i}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={12}
                                    fill="#1a2233"
                                    stroke={accent}
                                    strokeWidth="1.5"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y + 4}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize="10"
                                  >
                                    {gp.labels[i]}
                                  </text>
                                </g>
                              ))}
                            </svg>
                          );
                        })()}

                      {category === "dp" && (
                        <div className="mb-4 flex flex-col items-center gap-2 opacity-30">
                          <div className="flex gap-1">
                            {[0, 1, 1, 2, 3, 5, 8, 13].map((v, i) => (
                              <div
                                key={i}
                                className="flex h-9 w-9 items-center justify-center rounded font-jetbrains text-xs"
                                style={{
                                  background: "#1a2233",
                                  border: `1px solid ${accent}30`,
                                  color: accent,
                                }}
                              >
                                {v}
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px]" style={{ color: "#4a5568" }}>
                            memo table
                          </div>
                        </div>
                      )}

                      {category === "stack" && (
                        <div className="mb-4 flex flex-col-reverse items-center gap-1 opacity-25">
                          {["(", "{", "["].map((v, i) => (
                            <div
                              key={i}
                              className="flex h-8 w-14 items-center justify-center rounded font-jetbrains text-sm"
                              style={{ background: accent, color: "#0d1117" }}
                            >
                              {v}
                            </div>
                          ))}
                        </div>
                      )}

                      {category === "tree" &&
                        staticTreeNodes.length > 0 &&
                        (() => {
                          const { vb, w, h } = computeViewBox(staticTreeNodes);
                          return (
                            <svg
                              viewBox={vb}
                              style={{
                                width: "100%",
                                height: "100%",
                                minWidth: `${Math.max(400, w)}px`,
                                minHeight: `${Math.max(200, h)}px`,
                              }}
                            >
                              {staticTreeNodes.map((n, i) => {
                                if (n.parentIdx < 0) return null;
                                const p = staticTreeNodes[n.parentIdx];
                                return (
                                  <line
                                    key={`se${i}`}
                                    x1={p.x}
                                    y1={p.y + 18}
                                    x2={n.x}
                                    y2={n.y - 18}
                                    stroke="rgba(104,211,145,0.5)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                );
                              })}

                              {staticTreeNodes.map((n, i) => (
                                <g key={i}>
                                  <circle
                                    cx={n.x}
                                    cy={n.y}
                                    r={18}
                                    fill="#1a2233"
                                    stroke={accent}
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={n.x}
                                    y={n.y + 5}
                                    textAnchor="middle"
                                    fill="#fff"
                                    className="font-orbitron text-xs font-bold"
                                  >
                                    {n.value}
                                  </text>
                                </g>
                              ))}
                            </svg>
                          );
                        })()}

                      {category !== "tree" && (
                        <p className="animate-pulse text-sm" style={{ color: "#4a5568" }}>
                          Click <strong style={{ color: accent }}>Visualize</strong> to start
                        </p>
                      )}

                      {category === "tree" && (
                        <p className="mt-2 text-xs" style={{ color: "#4a5568" }}>
                          Click <strong style={{ color: accent }}>Visualize</strong> to run traversal
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="h-full w-full">
                      {category === "sorting" && cur?.array && (
                        <div className="flex h-full items-end justify-center gap-[3px] pt-6">
                          {cur.array.map((v, i) => {
                            let c = "#4299e1";
                            if (cur.sorted?.includes(i)) c = "#68d391";
                            else if (cur.swapping?.includes(i)) c = "#fc8181";
                            else if (cur.comparing?.includes(i)) c = "#f6e05e";
                            else if (cur.current === i) c = "#9f7aea";
                            const w = Math.max(16, Math.floor(560 / (cur.array?.length || 1)));

                            return (
                              <div
                                key={i}
                                className="relative rounded-t transition-all duration-300"
                                style={{
                                  width: `${w}px`,
                                  height: `${v * 2.5 + 16}px`,
                                  background: c,
                                  boxShadow:
                                    cur.comparing?.includes(i) || cur.swapping?.includes(i)
                                      ? `0 0 12px ${c}`
                                      : "none",
                                }}
                              >
                                <span
                                  className="absolute left-1/2 -top-5 -translate-x-1/2 font-jetbrains text-[10px]"
                                  style={{ color: "#8892b0" }}
                                >
                                  {v}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {category === "dp" && cur && (
                        <div className="flex h-full w-full flex-col overflow-auto">
                          {cur.dpTitle && (
                            <div className="mb-3 px-1">
                              <div className="mb-1 font-orbitron text-sm font-bold text-white">
                                {cur.dpTitle}
                              </div>
                              <div className="text-xs" style={{ color: "#8892b0" }}>
                                {cur.dpDesc}
                              </div>
                              {cur.dpExtra && (
                                <div
                                  className="mt-1 rounded px-2 py-1 text-xs"
                                  style={{ background: "#1a2233", color: "#f6ad55" }}
                                >
                                  {cur.dpExtra}
                                </div>
                              )}
                            </div>
                          )}

                          {cur.dpMemo && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2">
                              <div className="flex flex-wrap justify-center gap-1">
                                {cur.dpMemo.map((v, i) => {
                                  const highlight = cur.dpHighlights?.find((h) => h.c === i);
                                  return (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                      <div
                                        className="font-jetbrains text-[9px]"
                                        style={{ color: "#4a5568" }}
                                      >
                                        {i}
                                      </div>
                                      <div
                                        className="flex h-11 w-11 items-center justify-center rounded-lg font-jetbrains text-sm font-bold transition-all duration-300"
                                        style={{
                                          background: highlight?.color || "#1a2233",
                                          color: highlight ? "#0d1117" : "#4a5568",
                                          border: "1px solid rgba(255,255,255,0.06)",
                                          boxShadow: highlight
                                            ? `0 0 8px ${highlight.color}`
                                            : "none",
                                        }}
                                      >
                                        {v !== null ? v : "—"}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div
                                className="mt-2 font-jetbrains text-[10px]"
                                style={{ color: "#4a5568" }}
                              >
                                memo[0..{cur.dpMemo.length - 1}]
                              </div>
                            </div>
                          )}

                          {cur.array && cur.dpTable && !cur.dpMemo && cur.dpTable.length === 1 && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3">
                              <div>
                                <div
                                  className="mb-1 text-center font-orbitron text-[9px] tracking-wider"
                                  style={{ color: "#4a5568" }}
                                >
                                  ARRAY
                                </div>
                                <div className="flex gap-1">
                                  {cur.array.map((v, i) => {
                                    const highlight = cur.comparing?.includes(i);
                                    return (
                                      <div
                                        key={i}
                                        className="flex h-10 w-10 items-center justify-center rounded font-jetbrains text-xs font-bold transition-all duration-300"
                                        style={{
                                          background: highlight ? "#f6e05e" : "#1a2233",
                                          color: highlight ? "#0d1117" : "#fff",
                                          border: "1px solid rgba(255,255,255,0.06)",
                                        }}
                                      >
                                        {v}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <div
                                  className="mb-1 text-center font-orbitron text-[9px] tracking-wider"
                                  style={{ color: "#4a5568" }}
                                >
                                  DP (LIS length)
                                </div>
                                <div className="flex gap-1">
                                  {cur.dpTable[0].map((v, i) => {
                                    const highlight = cur.dpHighlights?.find((h) => h.c === i);
                                    return (
                                      <div
                                        key={i}
                                        className="flex h-10 w-10 items-center justify-center rounded font-jetbrains text-xs font-bold transition-all duration-300"
                                        style={{
                                          background: highlight?.color || "#1a2233",
                                          color: highlight ? "#0d1117" : "#8892b0",
                                          border: "1px solid rgba(255,255,255,0.06)",
                                          boxShadow: highlight
                                            ? `0 0 6px ${highlight.color}`
                                            : "none",
                                        }}
                                      >
                                        {v}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {cur.dpTable &&
                            !cur.dpMemo &&
                            (cur.dpTable.length > 1 || (cur.dpTable.length === 1 && !cur.array)) && (
                              <div className="flex flex-1 items-start justify-center overflow-auto">
                                <table className="border-collapse">
                                  {cur.dpColHeaders && (
                                    <thead>
                                      <tr>
                                        <th className="h-7 w-8" />
                                        {cur.dpColHeaders.map((h, j) => (
                                          <th
                                            key={j}
                                            className="h-7 w-9 text-center font-jetbrains text-[9px]"
                                            style={{ color: accent }}
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                  )}
                                  <tbody>
                                    {cur.dpTable.map((row, i) => (
                                      <tr key={i}>
                                        {cur.dpRowHeaders && (
                                          <td
                                            className="h-8 w-8 pr-1 text-right font-jetbrains text-[9px]"
                                            style={{ color: accent }}
                                          >
                                            {cur.dpRowHeaders[i] || ""}
                                          </td>
                                        )}

                                        {row.map((cell, j) => {
                                          const highlight = cur.dpHighlights?.find(
                                            (h) => h.r === i && h.c === j,
                                          );
                                          const isInf = cell === Infinity || cell > 999999;

                                          return (
                                            <td
                                              key={j}
                                              className="h-8 w-9 text-center font-jetbrains text-[11px] transition-all duration-300"
                                              style={{
                                                background: highlight?.color || "#1a2233",
                                                color: highlight
                                                  ? "#0d1117"
                                                  : isInf
                                                    ? "#2d3748"
                                                    : "#8892b0",
                                                border: "1px solid rgba(255,255,255,0.04)",
                                                boxShadow: highlight
                                                  ? `0 0 6px ${highlight.color}`
                                                  : "none",
                                                fontWeight: highlight ? 700 : 400,
                                              }}
                                            >
                                              {isInf ? "∞" : cell}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                        </div>
                      )}

                      {category === "graph" && cur?.graphNodes && (
                        <div className="relative h-full w-full">
                          <svg
                            viewBox={computeViewBox(gp.pos, 30).vb}
                            style={{
                              width: "100%",
                              height: "100%",
                              minWidth: `${Math.max(350, computeViewBox(gp.pos, 30).w)}px`,
                              minHeight: `${Math.max(180, computeViewBox(gp.pos, 30).h)}px`,
                            }}
                          >
                            {cur.graphEdges?.map((e, i) => (
                              <line
                                key={i}
                                x1={gp.pos[e.from].x}
                                y1={gp.pos[e.from].y}
                                x2={gp.pos[e.to].x}
                                y2={gp.pos[e.to].y}
                                stroke={
                                  e.state === "used"
                                    ? "#68d391"
                                    : "rgba(99,179,237,0.2)"
                                }
                                strokeWidth={e.state === "used" ? 2.5 : 1.5}
                                className="transition-all duration-300"
                              />
                            ))}

                            {cur.graphNodes.map((n) => {
                              let f = "#1a2233";
                              if (n.state === "current") f = "#f6e05e";
                              else if (n.state === "visited") f = "#68d391";

                              return (
                                <g key={n.id}>
                                  <circle
                                    cx={gp.pos[n.id].x}
                                    cy={gp.pos[n.id].y}
                                    r={20}
                                    fill={f}
                                    stroke={accent}
                                    strokeWidth={2}
                                    className="transition-all duration-300"
                                  />
                                  <text
                                    x={gp.pos[n.id].x}
                                    y={gp.pos[n.id].y + 5}
                                    textAnchor="middle"
                                    fill={n.state !== "default" ? "#0d1117" : "#fff"}
                                    className="font-orbitron text-sm font-bold"
                                  >
                                    {gp.labels[n.id]}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>

                          {cur.auxQueue !== undefined && (
                            <div
                              className="absolute right-2 top-2 rounded-lg p-2"
                              style={{
                                background: "rgba(15,21,32,0.9)",
                                border: "1px solid rgba(79,209,197,0.3)",
                                minWidth: "60px",
                              }}
                            >
                              <div
                                className="mb-1.5 text-center font-orbitron text-[9px] tracking-wider"
                                style={{ color: "#4fd1c5" }}
                              >
                                QUEUE
                              </div>

                              <div className="flex justify-center gap-1">
                                {cur.auxQueue.length === 0 ? (
                                  <span
                                    className="font-rajdhani text-[10px]"
                                    style={{ color: "#4a5568" }}
                                  >
                                    empty
                                  </span>
                                ) : (
                                  cur.auxQueue.map((id, i) => (
                                    <div
                                      key={i}
                                      className="flex h-7 w-7 items-center justify-center rounded font-orbitron text-[10px] font-bold transition-all duration-300"
                                      style={{
                                        background: i === 0 ? "#4fd1c5" : "#1a2233",
                                        color: i === 0 ? "#0d1117" : "#4fd1c5",
                                        border: "1px solid #4fd1c540",
                                      }}
                                    >
                                      {gp.labels[id]}
                                    </div>
                                  ))
                                )}
                              </div>

                              {cur.auxQueue.length > 0 && (
                                <div className="mt-1 flex justify-between">
                                  <span className="text-[8px]" style={{ color: "#4a5568" }}>
                                    front
                                  </span>
                                  <span className="text-[8px]" style={{ color: "#4a5568" }}>
                                    rear
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {category === "tree" &&
                        cur?.treeNodes &&
                        (() => {
                          const tvb = computeViewBox(cur.treeNodes);

                          return (
                            <svg
                              viewBox={tvb.vb}
                              style={{
                                width: "100%",
                                height: "100%",
                                minWidth: `${Math.max(400, tvb.w)}px`,
                                minHeight: `${Math.max(200, tvb.h)}px`,
                              }}
                            >
                              {cur.treeNodes.map((n, i) => {
                                if (n.parentIdx < 0) return null;
                                const p = cur.treeNodes![n.parentIdx];
                                return (
                                  <line
                                    key={`solid${i}`}
                                    x1={p.x}
                                    y1={p.y + 18}
                                    x2={n.x}
                                    y2={n.y - 18}
                                    stroke="rgba(104,211,145,0.45)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                );
                              })}

                              {cur.treeNodes.map((n, i) => {
                                const active =
                                  n.state === "visited" ||
                                  n.state === "current" ||
                                  n.state === "found" ||
                                  n.state === "move";

                                if (n.parentIdx < 0 || !active) return null;
                                const p = cur.treeNodes![n.parentIdx];
                                const edgeColor = n.state === "move" ? "#9f7aea" : "#68d391";

                                return (
                                  <line
                                    key={`act${i}`}
                                    x1={p.x}
                                    y1={p.y + 18}
                                    x2={n.x}
                                    y2={n.y - 18}
                                    stroke={edgeColor}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    style={{
                                      filter: `drop-shadow(0 0 4px ${edgeColor})`,
                                      transition: "all 0.4s ease",
                                    }}
                                  />
                                );
                              })}

                              {cur.output &&
                                cur.output.length > 1 &&
                                (() => {
                                  const visited = cur.output!;
                                  const nodeMap = new Map(
                                    cur.treeNodes!.map((n) => [n.value, n]),
                                  );
                                  const pts = visited
                                    .map((v) => nodeMap.get(v))
                                    .filter(Boolean) as typeof cur.treeNodes;
                                  if (pts.length < 2) return null;
                                  const d = pts
                                    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
                                    .join(" ");

                                  return (
                                    <path
                                      d={d}
                                      fill="none"
                                      stroke="#f6e05e"
                                      strokeWidth="2"
                                      strokeDasharray="8 4"
                                      opacity="0.6"
                                      className="transition-all duration-300"
                                    />
                                  );
                                })()}

                              {cur.treeNodes.map((n, i) => {
                                let f = "#1a2233";
                                if (n.state === "current") f = "#f6e05e";
                                else if (n.state === "visited") f = "#68d391";
                                else if (n.state === "found") f = "#63b3ed";
                                else if (n.state === "move") f = "#9f7aea";

                                const isActive = n.state !== "default";

                                return (
                                  <g key={`n${i}`}>
                                    {n.state === "move" && (
                                      <circle
                                        cx={n.x}
                                        cy={n.y}
                                        r={24}
                                        fill="none"
                                        stroke="#9f7aea"
                                        strokeWidth={1.5}
                                        opacity={0.5}
                                        style={{ transition: "all 0.3s ease" }}
                                      />
                                    )}

                                    <circle
                                      cx={n.x}
                                      cy={n.y}
                                      r={18}
                                      fill={f}
                                      stroke={accent}
                                      strokeWidth={2}
                                      style={{
                                        filter:
                                          n.state === "current"
                                            ? `drop-shadow(0 0 10px ${f})`
                                            : n.state === "move"
                                              ? "drop-shadow(0 0 8px #9f7aea)"
                                              : n.state === "found"
                                                ? "drop-shadow(0 0 12px #63b3ed)"
                                                : "none",
                                        transition: "all 0.4s ease",
                                      }}
                                    />

                                    <text
                                      x={n.x}
                                      y={n.y + 5}
                                      textAnchor="middle"
                                      fill={isActive ? "#0d1117" : "#fff"}
                                      className="font-orbitron text-xs font-bold"
                                      style={{ transition: "all 0.3s ease" }}
                                    >
                                      {n.value}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          );
                        })()}

                      {category === "stack" &&
                        cur?.array &&
                        (() => {
                          const isCharMode =
                            selectedAlgo?.id === "infix-postfix" ||
                            selectedAlgo?.id === "infix-prefix" ||
                            selectedAlgo?.id === "balanced-parens";

                          const fmt = (v: number) => (isCharMode ? String.fromCharCode(v) : String(v));

                          return (
                            <div className="flex h-full items-center justify-center gap-8">
                              <div className="flex flex-col-reverse items-center gap-1">
                                <div
                                  className="font-orbitron text-[9px] tracking-wider"
                                  style={{ color: "#4a5568" }}
                                >
                                  BOTTOM
                                </div>

                                {cur.array.map((v, i) => {
                                  let bg = "#f6ad55";
                                  if (cur.sorted?.includes(i)) bg = "#68d391";
                                  else if (cur.swapping?.includes(i)) bg = "#fc8181";
                                  else if (cur.current === i) bg = "#f6e05e";
                                  const isTop = i === cur.array!.length - 1;

                                  return (
                                    <div key={i} className="relative">
                                      {isTop && (
                                        <div
                                          className="absolute left-1/2 -top-5 -translate-x-1/2 whitespace-nowrap font-orbitron text-[9px]"
                                          style={{ color: "#f6e05e" }}
                                        >
                                          TOP ↓
                                        </div>
                                      )}

                                      <div
                                        className="flex h-9 w-16 items-center justify-center rounded font-jetbrains text-sm font-bold transition-all duration-300"
                                        style={{
                                          background: bg,
                                          color: "#0d1117",
                                          boxShadow:
                                            cur.current === i || cur.swapping?.includes(i)
                                              ? `0 0 12px ${bg}`
                                              : "none",
                                        }}
                                      >
                                        {fmt(v)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {cur.output && cur.output.length > 0 && (
                                <div className="flex flex-col items-center gap-1">
                                  <div
                                    className="mb-1 font-orbitron text-[9px] tracking-wider"
                                    style={{ color: "#4a5568" }}
                                  >
                                    OUTPUT
                                  </div>

                                  <div className="flex max-w-[240px] flex-wrap justify-center gap-1">
                                    {cur.output.map((v, i) => (
                                      <div
                                        key={i}
                                        className="flex h-8 w-8 items-center justify-center rounded font-jetbrains text-xs font-bold"
                                        style={{
                                          background: "#1a2233",
                                          border: "1px solid #68d39140",
                                          color: "#68d391",
                                        }}
                                      >
                                        {fmt(v)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </div>

                <div
                  className="mb-2 flex items-center gap-3 px-2 py-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="text-[9px] font-semibold tracking-wider">LEGEND</span>
                  {(category === "sorting"
                    ? [
                        { c: "#63b3ed", l: "Default" },
                        { c: "#f6e05e", l: "Comparing" },
                        { c: "#fc8181", l: "Swapping" },
                        { c: "#68d391", l: "Sorted" },
                        { c: "#9f7aea", l: "Pivot" },
                      ]
                    : category === "tree"
                      ? [
                          { c: "#f6e05e", l: "Current" },
                          { c: "#9f7aea", l: "Moving" },
                          { c: "#68d391", l: "Visited" },
                          { c: "#63b3ed", l: "Found" },
                        ]
                      : category === "graph"
                        ? [
                            { c: "#f6e05e", l: "Current" },
                            { c: "#68d391", l: "Visited" },
                            { c: "#4fd1c5", l: "Queue" },
                          ]
                        : category === "dp"
                          ? [
                              { c: "#f6e05e", l: "Computing" },
                              { c: "#63b3ed", l: "Reading" },
                              { c: "#68d391", l: "Done" },
                              { c: "#9f7aea", l: "Option" },
                            ]
                          : [
                              { c: "#f6ad55", l: "Active" },
                              { c: "#68d391", l: "Done" },
                              { c: "#fc8181", l: "Removed" },
                            ]
                  ).map((x) => (
                    <div key={x.l} className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded-sm" style={{ background: x.c }} />
                      <span className="text-[10px]">{x.l}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="mb-2 flex items-center gap-3 rounded-lg p-2.5"
                  style={{
                    background: "var(--bg-card-hover)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    className="shrink-0 rounded px-2 py-0.5 font-jetbrains text-xs"
                    style={{
                      background: `rgba(${hx(accent)},0.15)`,
                      color: accent,
                    }}
                  >
                    Step {steps.length > 0 ? currentStep + 1 : 0}/{steps.length}
                  </span>

                  <div
                    className="h-1 flex-1 overflow-hidden rounded-full"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg,${accent},#9f7aea)`,
                      }}
                    />
                  </div>

                  <span
                    className="flex-1 truncate font-rajdhani text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {cur?.message || "Ready"}
                  </span>

                  <span
                    className="shrink-0 font-jetbrains text-xs"
                    style={{ color: "#4a5568" }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>

                <div
                  className="mb-2 flex items-center justify-between gap-3 rounded-lg p-2.5"
                  style={{ background: "var(--bg-card-hover)" }}
                >
                  <div className="flex items-center gap-1.5">
                    {[
                      {
                        i: "⏮",
                        f: () => {
                          setCurrentStep(Math.max(0, currentStep - 1));
                          setIsPlaying(false);
                        },
                        d: currentStep === 0 || !steps.length,
                      },
                      {
                        i: isPlaying ? "⏸" : "▶",
                        f: () => setIsPlaying(!isPlaying),
                        d: !steps.length,
                        p: true,
                      },
                      {
                        i: "⏭",
                        f: () => {
                          setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                          setIsPlaying(false);
                        },
                        d: currentStep >= steps.length - 1 || !steps.length,
                      },
                      {
                        i: "🔄",
                        f: () => {
                          setCurrentStep(0);
                          setIsPlaying(false);
                        },
                        d: !steps.length,
                      },
                    ].map((b, idx) => (
                      <button
                        key={idx}
                        onClick={b.f}
                        disabled={b.d}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all"
                        style={{
                          background: b.p ? (isPlaying ? "#fc8181" : accent) : "var(--bg-card)",
                          border: `1px solid ${b.p ? "transparent" : "var(--border)"}`,
                          color: b.p ? "#fff" : b.d ? "var(--text-muted)" : "var(--accent)",
                          opacity: b.d && !b.p ? 0.4 : 1,
                        }}
                      >
                        {b.i}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-rajdhani text-xs" style={{ color: "#8892b0" }}>
                      Speed
                    </span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-20"
                      style={{ accentColor: accent }}
                    />
                    <span
                      className="w-8 text-right font-jetbrains text-xs"
                      style={{ color: accent }}
                    >
                      {speedLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => setDryRunMode((p) => !p)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                    style={{
                      background: dryRunMode
                        ? "rgba(159,122,234,0.2)"
                        : "rgba(159,122,234,0.08)",
                      color: "#9f7aea",
                      border: `1px solid ${
                        dryRunMode ? "#9f7aea" : "rgba(159,122,234,0.3)"
                      }`,
                      boxShadow: dryRunMode ? "0 0 16px rgba(159,122,234,0.35)" : "none",
                    }}
                  >
                    {dryRunMode ? "💻 Dry Run ON" : "💻 Dry Run"}
                  </button>
                </div>

                {category === "sorting" && (
                  <div className="mb-2 flex items-center gap-2 px-2.5">
                    <span className="text-[11px]" style={{ color: "#8892b0" }}>
                      Array Size
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={sortSize}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setSortSize(v);
                        setArrayInput(
                          Array.from({ length: v }, () => Math.floor(Math.random() * 90) + 5).join(","),
                        );
                      }}
                      className="flex-1"
                      style={{ accentColor: accent }}
                    />
                    <span
                      className="w-6 text-right font-jetbrains text-xs"
                      style={{ color: accent }}
                    >
                      {sortSize}
                    </span>
                  </div>
                )}

                {category === "graph" && (
                  <div className="mb-2 flex items-center gap-2 px-2.5">
                    <span className="text-[11px]" style={{ color: "#8892b0" }}>
                      Start Node
                    </span>
                    <div className="flex gap-1">
                      {gp.labels.map((label, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setGraphStartNode(idx);
                            setSteps([]);
                            autoRef.current = false;
                          }}
                          className="h-7 w-7 rounded text-xs font-orbitron font-bold transition-all"
                          style={{
                            background: graphStartNode === idx ? accent : "#131720",
                            color: graphStartNode === idx ? "#0d1117" : "#8892b0",
                            border: `1px solid ${
                              graphStartNode === idx ? accent : "rgba(255,255,255,0.08)"
                            }`,
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="flex flex-wrap items-end gap-2 rounded-lg p-2.5"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {showArr && (
                    <div className={category === "graph" ? "w-full" : "min-w-[180px] flex-1"}>
                      <label
                        className="mb-1 block font-rajdhani text-[11px]"
                        style={{ color: "#8892b0" }}
                      >
                        {category === "tree" ? "BST values" : "Array values"}
                      </label>
                      <input
                        type="text"
                        value={arrayInput}
                        onChange={(e) => setArrayInput(e.target.value)}
                        placeholder={
                          category === "tree"
                            ? "e.g. 50,30,70,20,40"
                            : "e.g. 38,27,43,3,9"
                        }
                        className="w-full rounded-lg p-2 font-jetbrains text-sm"
                        style={{
                          background: "#0d1117",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#fff",
                        }}
                      />
                    </div>
                  )}

                  {isStackAlgo && (
                    <div className="min-w-[200px] flex-1">
                      <label className="mb-1 block text-[11px]" style={{ color: "#8892b0" }}>
                        {selectedAlgo?.id === "postfix-eval" || selectedAlgo?.id === "prefix-eval"
                          ? "Expression (space-separated or single-digit)"
                          : "Expression"}
                      </label>
                      <input
                        type="text"
                        value={arrayInput}
                        onChange={(e) => setArrayInput(e.target.value)}
                        placeholder={STACK_DEFAULTS[selectedAlgo?.id || ""] || "Enter expression"}
                        className="w-full rounded-lg p-2 font-jetbrains text-sm"
                        style={{
                          background: "#0d1117",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#fff",
                        }}
                      />
                    </div>
                  )}

                  {selectedAlgo.id === "fibonacci" && (
                    <div className="w-28">
                      <label
                        className="mb-1 block font-rajdhani text-[11px]"
                        style={{ color: "#8892b0" }}
                      >
                        n
                      </label>
                      <input
                        type="number"
                        value={nInput}
                        onChange={(e) => setNInput(e.target.value)}
                        className="w-full rounded-lg p-2 font-jetbrains text-sm"
                        style={{
                          background: "#0d1117",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#fff",
                        }}
                      />
                    </div>
                  )}

                  {selectedAlgo.id === "knapsack" && (
                    <>
                      <div className="min-w-[100px] flex-1">
                        <label
                          className="mb-1 block font-rajdhani text-[11px]"
                          style={{ color: "#8892b0" }}
                        >
                          Weights
                        </label>
                        <input
                          type="text"
                          value={weightsInput}
                          onChange={(e) => setWeightsInput(e.target.value)}
                          className="w-full rounded-lg p-2 font-jetbrains text-sm"
                          style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        />
                      </div>

                      <div className="min-w-[100px] flex-1">
                        <label
                          className="mb-1 block font-rajdhani text-[11px]"
                          style={{ color: "#8892b0" }}
                        >
                          Values
                        </label>
                        <input
                          type="text"
                          value={valuesInput}
                          onChange={(e) => setValuesInput(e.target.value)}
                          className="w-full rounded-lg p-2 font-jetbrains text-sm"
                          style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        />
                      </div>

                      <div className="w-20">
                        <label
                          className="mb-1 block font-rajdhani text-[11px]"
                          style={{ color: "#8892b0" }}
                        >
                          Cap
                        </label>
                        <input
                          type="number"
                          value={capacityInput}
                          onChange={(e) => setCapacityInput(e.target.value)}
                          className="w-full rounded-lg p-2 font-jetbrains text-sm"
                          style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {selectedAlgo.id === "lcs" && (
                    <>
                      <div className="min-w-[100px] flex-1">
                        <label
                          className="mb-1 block font-rajdhani text-[11px]"
                          style={{ color: "#8892b0" }}
                        >
                          String 1
                        </label>
                        <input
                          type="text"
                          value={str1Input}
                          onChange={(e) => setStr1Input(e.target.value)}
                          className="w-full rounded-lg p-2 font-jetbrains text-sm"
                          style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        />
                      </div>

                      <div className="min-w-[100px] flex-1">
                        <label
                          className="mb-1 block font-rajdhani text-[11px]"
                          style={{ color: "#8892b0" }}
                        >
                          String 2
                        </label>
                        <input
                          type="text"
                          value={str2Input}
                          onChange={(e) => setStr2Input(e.target.value)}
                          className="w-full rounded-lg p-2 font-jetbrains text-sm"
                          style={{
                            background: "#0d1117",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {category === "tree" &&
                    selectedAlgo &&
                    BST_OPS.includes(selectedAlgo.id) && (
                      <div className="flex items-end gap-1.5">
                        <input
                          type="number"
                          id="tree-op-input"
                          placeholder={
                            selectedAlgo.id === "bst-delete"
                              ? "Delete"
                              : selectedAlgo.id === "bst-search"
                                ? "Search"
                                : "Insert"
                          }
                          className="w-24 rounded-lg p-2 text-center font-jetbrains text-sm"
                          style={{
                            background: "#0d1117",
                            border: `1px solid ${accent}40`,
                            color: "#fff",
                          }}
                        />

                        <button
                          onClick={() => {
                            const inp = document.getElementById("tree-op-input") as HTMLInputElement | null;
                            const v = parseInt(inp?.value || "");
                            if (Number.isNaN(v)) return;

                            const arr = arrayInput
                              .split(",")
                              .map(Number)
                              .filter((n) => !Number.isNaN(n));

                            let root: TNode | undefined;
                            for (const val of arr) root = insertBST(root, val);

                            const flat: FlatNode[] = [];
                            flattenTree(root, 280, 35, 120, -1, flat);

                            const toN = (
                              vis: number[],
                              cur?: number,
                              found?: number,
                              mv?: number,
                            ) =>
                              flat.map((n) => ({
                                ...n,
                                state:
                                  n.value === found
                                    ? "found"
                                    : n.value === cur
                                      ? "current"
                                      : n.value === mv
                                        ? "move"
                                        : vis.includes(n.value)
                                          ? "visited"
                                          : "default",
                              }));

                            const ns: Step[] = [];

                            if (selectedAlgo.id === "bst-search") {
                              ns.push({ message: `🔍 Searching for ${v}...`, treeNodes: toN([]), output: [] });
                              let node = root;
                              const path: number[] = [];

                              while (node) {
                                path.push(node.value);
                                if (v === node.value) {
                                  ns.push({
                                    message: `At ${node.value} — Found!`,
                                    treeNodes: toN(path, node.value),
                                    output: [...path],
                                  });
                                  ns.push({
                                    message: `✅ Found ${v}`,
                                    treeNodes: toN(path, undefined, v),
                                    output: [...path],
                                  });
                                  break;
                                }

                                const dir =
                                  v < node.value
                                    ? `left (${v}<${node.value})`
                                    : `right (${v}>${node.value})`;

                                ns.push({
                                  message: `At ${node.value} → go ${dir}`,
                                  treeNodes: toN(path, undefined, undefined, node.value),
                                  output: [...path],
                                });

                                node = v < node.value ? node.left : node.right;
                              }

                              if (!node) {
                                ns.push({
                                  message: "❌ Not Found",
                                  treeNodes: toN(path),
                                  output: [...path],
                                });
                              }
                            } else if (selectedAlgo.id === "bst-delete") {
                              if (!arr.includes(v)) {
                                ns.push({
                                  message: `❌ Node Not Present — ${v} does not exist`,
                                  treeNodes: toN([]),
                                  output: [],
                                });
                                setSteps(ns);
                                setCurrentStep(0);
                                setIsPlaying(false);
                                if (inp) inp.value = "";
                                return;
                              }

                              ns.push({ message: `🗑️ Deleting ${v}...`, treeNodes: toN([]), output: [] });

                              let node = root;
                              const path: number[] = [];

                              while (node) {
                                path.push(node.value);
                                if (v === node.value) {
                                  ns.push({
                                    message: `Found ${v} — determining deletion case`,
                                    treeNodes: toN(path, node.value),
                                    output: [...path],
                                  });
                                  break;
                                }

                                const dir = v < node.value ? "left" : "right";
                                ns.push({
                                  message: `At ${node.value} → go ${dir}`,
                                  treeNodes: toN(path, undefined, undefined, node.value),
                                  output: [...path],
                                });
                                node = v < node.value ? node.left : node.right;
                              }

                              if (node) {
                                const hasLeft = !!node.left;
                                const hasRight = !!node.right;

                                if (!hasLeft && !hasRight) {
                                  ns.push({
                                    message: `Case: Leaf node — simply remove ${v}`,
                                    treeNodes: toN(path, undefined, v),
                                    output: [...path],
                                  });
                                } else if (!hasLeft || !hasRight) {
                                  const child = hasLeft ? node.left!.value : node.right!.value;
                                  ns.push({
                                    message: `Case: One child — replace ${v} with child ${child}`,
                                    treeNodes: toN(path, undefined, v),
                                    output: [...path],
                                  });
                                } else {
                                  let succ = node.right;
                                  while (succ?.left) succ = succ.left;

                                  ns.push({
                                    message: "Case: Two children — find inorder successor",
                                    treeNodes: toN(path, undefined, v),
                                    output: [...path],
                                  });

                                  ns.push({
                                    message: `Inorder successor = ${succ!.value} → replace ${v} with ${succ!.value}`,
                                    treeNodes: toN([...path, succ!.value], succ!.value, v),
                                    output: [...path],
                                  });
                                }

                                ns.push({
                                  message: `✅ Yes, Deleted ${v}`,
                                  treeNodes: toN(path, undefined, v),
                                  output: [...path],
                                });

                                const newArr = arr.filter((x) => x !== v);
                                const newFlat = buildStaticTree(newArr);

                                ns.push({
                                  message: `Tree rebuilt without ${v}`,
                                  treeNodes: newFlat.map((n) => ({ ...n, state: "default" })),
                                  output: [],
                                });

                                setArrayInput(newArr.join(","));
                              }
                            } else {
                              ns.push({ message: `➕ Inserting ${v}...`, treeNodes: toN([]), output: [] });

                              if (!root) {
                                ns.push({
                                  message: `Tree is empty — ${v} becomes root`,
                                  treeNodes: toN([]),
                                  output: [],
                                });
                              } else {
                                let node: TNode | undefined = root;
                                const path: number[] = [];

                                while (node) {
                                  path.push(node.value);
                                  const dir =
                                    v < node.value
                                      ? `left (${v}<${node.value})`
                                      : `right (${v}≥${node.value})`;

                                  ns.push({
                                    message: `At ${node.value} → go ${dir}`,
                                    treeNodes: toN(path, undefined, undefined, node.value),
                                    output: [...path],
                                  });

                                  if (v < node.value) {
                                    if (!node.left) break;
                                    node = node.left;
                                  } else {
                                    if (!node.right) break;
                                    node = node.right;
                                  }
                                }

                                ns.push({
                                  message: `Insert ${v} here`,
                                  treeNodes: toN(path),
                                  output: [...path],
                                });
                              }

                              const newArr = [...arr, v];
                              const newFlat = buildStaticTree(newArr);
                              const newNodeIdx = newFlat.findIndex((n) => n.value === v);

                              ns.push({
                                message: `✅ Inserted ${v}`,
                                treeNodes: newFlat.map((n, i) => ({
                                  ...n,
                                  state: i === newNodeIdx ? "current" : "default",
                                })),
                                output: [],
                              });

                              setArrayInput(newArr.join(","));
                            }

                            setSteps(ns);
                            setCurrentStep(0);
                            setIsPlaying(true);
                            if (inp) inp.value = "";
                          }}
                          className="whitespace-nowrap rounded-lg px-3 py-2 font-orbitron text-xs font-bold text-white"
                          style={{
                            background: `linear-gradient(135deg,${accent},#9f7aea)`,
                          }}
                        >
                          {selectedAlgo.id === "bst-search"
                            ? "🔍 Search"
                            : selectedAlgo.id === "bst-delete"
                              ? "❌ Delete"
                              : "➕ Insert"}
                        </button>
                      </div>
                    )}

                  <button
                    onClick={generate}
                    className={`${category === "graph" || category === "tree" ? "flex-1" : ""} whitespace-nowrap rounded-lg px-4 py-2 font-orbitron text-xs font-bold text-white`}
                    style={{
                      background: `linear-gradient(135deg,${accent},#9f7aea)`,
                    }}
                  >
                    ▶ Visualize
                  </button>

                  <button
                    onClick={randomize}
                    className={`${category === "graph" || category === "tree" ? "flex-1" : ""} whitespace-nowrap rounded-lg px-3 py-2 font-orbitron text-xs`}
                    style={{
                      background: "#1a2233",
                      border: `1px solid ${accent}40`,
                      color: accent,
                    }}
                  >
                    🎲 Random
                  </button>
                </div>
              </div>
            </div>

            <div
              className="flex shrink-0 flex-col overflow-hidden"
              style={{
                width: "340px",
                background: "var(--bg-secondary)",
                borderLeft: "1px solid var(--border)",
              }}
            >
              <div
                className="overflow-y-auto p-4"
                style={{
                  height: "40%",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="mb-3 font-rajdhani text-[10px] tracking-[3px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  STATISTICS
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid rgba(99,179,237,0.15)",
                    }}
                  >
                    <div
                      className="mb-1 font-rajdhani text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      TIME
                    </div>
                    <div className="font-jetbrains text-sm" style={{ color: "#63b3ed" }}>
                      Time — {timeRaw}
                    </div>
                  </div>

                  <div
                    className="rounded-lg p-3"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid rgba(104,211,145,0.15)",
                    }}
                  >
                    <div
                      className="mb-1 font-rajdhani text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      SPACE
                    </div>
                    <div className="font-jetbrains text-sm" style={{ color: "#68d391" }}>
                      Space — {spaceRaw}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {category === "sorting" && (
                    <>
                      <Stat label="Comparisons" value={stats.comparisons} color="#f6e05e" icon="🔍" />
                      <Stat label="Swaps" value={stats.swaps} color="#fc8181" icon="🔄" />
                    </>
                  )}
                  {category === "graph" && (
                    <Stat
                      label="Nodes Visited"
                      value={cur?.visited?.length || 0}
                      color="#68d391"
                      icon="🟢"
                    />
                  )}
                  {category === "tree" && (
                    <Stat
                      label="Nodes Visited"
                      value={cur?.output?.length || 0}
                      color="#68d391"
                      icon="🌳"
                    />
                  )}
                  {category === "dp" && (
                    <Stat
                      label="Cells Computed"
                      value={currentStep + 1}
                      color="#9f7aea"
                      icon="📊"
                    />
                  )}
                  <Stat label="Progress" value={`${Math.round(progress)}%`} color={accent} icon="📈" />
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden p-4" style={{ height: "60%" }}>
                <div className="mb-2 flex items-center justify-between">
                  <div
                    className="font-rajdhani text-[10px] tracking-[3px]"
                    style={{ color: "#4a5568" }}
                  >
                    CODE
                  </div>
                  <button
                    onClick={copyCode}
                    className="rounded px-2 py-0.5 font-rajdhani text-[11px] transition-colors"
                    style={{
                      background: "var(--bg-card)",
                      color: copied ? "#68d391" : "var(--accent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>

                <div
                  className="mb-2 flex gap-0.5 rounded-lg p-0.5"
                  style={{ background: "var(--bg-card)" }}
                >
                  {(["javascript", "python", "java", "cpp", "c"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className="flex-1 rounded-md py-1 font-rajdhani text-[11px] transition-all"
                      style={{
                        color: language === l ? "var(--text-primary)" : "var(--text-muted)",
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

                {dryRunMode && cur?.message && (
                  <div
                    className="mb-1.5 rounded px-2 py-1 text-[11px] transition-all duration-300"
                    style={{
                      background: "rgba(159,122,234,0.08)",
                      border: "1px solid rgba(159,122,234,0.2)",
                      color: "#9f7aea",
                    }}
                  >
                    💡 {cur.message}
                  </div>
                )}

                <div
                  className="relative flex-1 overflow-hidden rounded-lg"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <pre
                    className="h-full overflow-auto p-3 font-jetbrains text-[11px] leading-[1.8]"
                    style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                  >
                    <code>
                      {(() => {
                        const codeLines = getCode(selectedAlgo.id, language).split("\n");
                        const stepLine = cur?.codeLine;
                        const activeLineIdx = !dryRunMode
                          ? -1
                          : stepLine !== undefined && stepLine >= 0
                            ? stepLine
                            : steps.length > 0
                              ? Math.floor(
                                  (currentStep / Math.max(1, steps.length - 1)) *
                                    Math.max(0, codeLines.length - 3),
                                ) + 1
                              : -1;

                        return codeLines.map((line, i) => {
                          const isActive = i === activeLineIdx;
                          return (
                            <div
                              key={i}
                              className="flex transition-all duration-250"
                              style={{
                                background: isActive ? "rgba(99,179,237,0.15)" : "transparent",
                                borderLeft: isActive
                                  ? "3px solid #63b3ed"
                                  : "3px solid transparent",
                                borderRadius: isActive ? "0 6px 6px 0" : "0",
                                paddingLeft: isActive ? "4px" : "0",
                                opacity: dryRunMode && !isActive ? 0.45 : 1,
                              }}
                            >
                              <span
                                className="w-7 shrink-0 select-none pr-3 text-right"
                                style={{
                                  color: isActive ? "#63b3ed" : "#2d3748",
                                  fontWeight: isActive ? 700 : 400,
                                }}
                              >
                                {i + 1}
                              </span>

                              <span
                                style={{ color: isActive ? "#fff" : undefined }}
                                dangerouslySetInnerHTML={{ __html: hl(line, language) }}
                              />
                            </div>
                          );
                        });
                      })()}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showUseCase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUseCase(false)}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          />
          <div
            className="relative w-full max-w-lg overflow-y-auto rounded-xl p-6"
            style={{
              background: "#131720",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowUseCase(false)}
              className="absolute right-3 top-3 text-lg transition-colors hover:text-white"
              style={{ color: "#4a5568" }}
            >
              ✕
            </button>

            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <h3 className="font-orbitron text-lg font-bold text-white">
                Real-World Use Cases
              </h3>
            </div>

            <div className="space-y-3 text-sm" style={{ color: "#c0c8e0" }}>
              {useCaseData[category]?.map((uc, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3"
                  style={{
                    background: "#1a2233",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="mb-1 font-semibold text-white">{uc.title}</div>
                  <p style={{ color: "#8892b0" }}>{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const useCaseData: Record<string, { title: string; desc: string }[]> = {
  sorting: [
    {
      title: "📊 Database Indexing",
      desc: "Databases sort records for fast binary search lookups on indexed columns.",
    },
    {
      title: "🏆 Ranking Systems",
      desc: "Leaderboards, search results, and recommendation engines rank items using sorting.",
    },
    {
      title: "📁 File Management",
      desc: "Operating systems sort files by name, date, or size in file explorers.",
    },
    {
      title: "📈 Data Analytics",
      desc: "Statistical analysis requires sorted data for median, percentile, and distribution computations.",
    },
  ],
  dp: [
    {
      title: "🧬 DNA Sequence Alignment",
      desc: "Bioinformatics uses LCS and edit distance algorithms to compare genetic sequences.",
    },
    {
      title: "💰 Resource Allocation",
      desc: "Knapsack problem models budget optimization, portfolio selection, and cargo loading.",
    },
    {
      title: "🗺️ Route Planning",
      desc: "GPS navigation uses dynamic programming for shortest path calculations.",
    },
    {
      title: "📝 Text Editors",
      desc: "Spell checkers and autocomplete use edit distance (DP) to suggest corrections.",
    },
  ],
  graph: [
    {
      title: "🗺️ Maps & Navigation",
      desc: "Google Maps uses Dijkstra and A* algorithms to find shortest routes.",
    },
    {
      title: "🌐 Social Networks",
      desc: "Friend suggestions, community detection, and influence analysis use graph traversals.",
    },
    {
      title: "🔌 Network Routing",
      desc: "Internet packet routing uses shortest path algorithms (OSPF protocol).",
    },
    {
      title: "🎮 Game AI",
      desc: "Pathfinding in games (NPC movement) uses BFS/DFS and A* on grid graphs.",
    },
  ],
  tree: [
    {
      title: "📂 File Systems",
      desc: "Directories and files are organized as tree structures in every OS.",
    },
    {
      title: "🔍 Database Indexes",
      desc: "B-trees and B+ trees power database indexing for fast read/write operations.",
    },
    {
      title: "🌐 DOM in Browsers",
      desc: "HTML document structure is a tree — manipulated via JavaScript DOM APIs.",
    },
    {
      title: "🤖 Decision Trees",
      desc: "Machine learning uses decision trees for classification and regression tasks.",
    },
  ],
  stack: [
    {
      title: "↩️ Undo/Redo",
      desc: "Text editors, Photoshop, and browsers use stacks to implement undo/redo functionality.",
    },
    {
      title: "🧮 Expression Evaluation",
      desc: "Compilers convert and evaluate mathematical expressions using stacks (infix→postfix).",
    },
    {
      title: "📞 Function Call Stack",
      desc: "Every programming language uses a call stack to manage function calls and recursion.",
    },
    {
      title: "🔙 Browser History",
      desc: "Back button navigation is implemented using a stack of visited URLs.",
    },
  ],
  queue: [
    {
      title: "🖨️ Print Queue",
      desc: "Print jobs are queued and processed in FIFO order by the printer spooler.",
    },
    {
      title: "📡 Message Queues",
      desc: "Systems like RabbitMQ and Kafka use queues for async message processing.",
    },
    {
      title: "🎮 Game Event Handling",
      desc: "Input events (keystrokes, clicks) are queued and processed sequentially.",
    },
    {
      title: "🏥 Task Scheduling",
      desc: "Operating systems use priority queues to schedule CPU processes fairly.",
    },
  ],
};

function Stat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg p-2.5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <span className="text-sm">{icon}</span>
      <span
        className="flex-1 font-rajdhani text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      <span className="font-orbitron text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function AI({
  a,
  sel,
  ac,
  cat,
  click,
}: {
  a: Algorithm;
  sel?: string;
  ac: string;
  cat: string;
  click: () => void;
}) {
  const s = sel === a.id;

  return (
    <div
      onClick={click}
      className="cursor-pointer rounded-lg p-2 transition-all duration-200"
      style={{
        background: s ? `rgba(${hx(ac)},0.1)` : "transparent",
        border: s ? `1px solid rgba(${hx(ac)},0.4)` : "1px solid transparent",
        borderLeft: s ? `3px solid ${ac}` : "3px solid transparent",
      }}
    >
      <div className="mb-0.5 flex items-start justify-between">
        <span
          className="font-orbitron text-[12px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {a.name}
        </span>
        <span
          className="ml-1 shrink-0 rounded px-1 py-0.5 font-rajdhani text-[8px]"
          style={{
            background: `rgba(${hx(ac)},0.15)`,
            color: ac,
          }}
        >
          {cat.toUpperCase()}
        </span>
      </div>
      <p className="line-clamp-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
        {a.description}
      </p>
    </div>
  );
}

function hx(hex: string): string {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(
    hex.slice(5, 7),
    16,
  )}`;
}