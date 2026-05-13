// lib/visualizer/templates/tree.ts

import { AnalysisResult } from "@/types";

/**
 * Tree Template.
 * Generates HTML structure for tree visualizations.
 *
 * Algorithms using this template:
 *  - BST (insert, delete, search)
 *  - Tree Traversals (inorder, preorder, postorder)
 *  - Heap (max-heap, min-heap)
 *  - AVL Tree
 *  - Recursion Trees
 *  - Segment Tree
 *
 * Structure:
 *  <div id="tree-container">
 *    <svg id="tree-edges-svg">  ← edges drawn here
 *    </svg>
 *    <div class="tree-node" id="tnode-0">...</div>
 *    ...
 *  </div>
 *
 * Layout: top-down hierarchical.
 * Edge positions: calculated from parent → child centers.
 */
export function getTreeTemplate(analysis: AnalysisResult): string {

  // ── Extract tree data from analysis ───────────────
  const treeData = extractTreeData(analysis);
  const { nodes, edges } = treeData;

  // ── Calculate hierarchical positions ──────────────
  const positioned = calculateTreeLayout(nodes);

  // ── Generate SVG edges ────────────────────────────
  const edgesHTML = edges.map(edge => {
    const parent = positioned[edge.parent];
    const child  = positioned[edge.child];
    if (!parent || !child) return '';

    return `
    <line
      class="tree-edge"
      id="tedge-${edge.parent}-${edge.child}"
      data-parent="${edge.parent}"
      data-child="${edge.child}"
      x1="${parent.x}%"
      y1="${parent.y}%"
      x2="${child.x}%"
      y2="${child.y}%"
    />`;
  }).join('\n');

  // ── Generate node HTML ────────────────────────────
  const nodesHTML = Object.values(positioned).map(node => {
    return `
  <div
    class="tree-node"
    id="tnode-${node.id}"
    data-id="${node.id}"
    data-value="${node.value}"
    data-depth="${node.depth}"
    style="left:${node.x}%;top:${node.y}%;transform:translate(-50%,-50%);"
  >
    <div class="tree-node-inner">
      <span class="tree-node-value">${node.value}</span>
    </div>
    <div class="tree-node-tag" id="tnode-tag-${node.id}"></div>
  </div>`;
  }).join('\n');

  // ── Traversal result display ───────────────────────
  const traversalHTML = `
  <div id="tree-traversal-bar" class="tree-traversal-bar">
    <span class="tree-traversal-label">Traversal:</span>
    <div id="tree-traversal-result" class="tree-traversal-result"></div>
  </div>`;

  // ── Return complete template ───────────────────────
  return `
<!-- ─────────────────────────────────────────────────────────────
     TREE TEMPLATE
     Nodes: ${nodes.length}
──────────────────────────────────────────────────────────────────── -->
<div id="tree-container" class="tree-layout">

  <!-- SVG Layer for edges -->
  <svg
    id="tree-edges-svg"
    class="tree-svg"
    xmlns="http://www.w3.org/2000/svg"
    style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:2;"
  >
    <defs>
      <!-- Glow filter for active edges -->
      <filter id="tree-edge-glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Tree edges -->
    ${edgesHTML}
  </svg>

  <!-- Tree nodes -->
  ${nodesHTML}

  <!-- Traversal result bar -->
  ${traversalHTML}

  <!-- Current pointer indicator -->
  <div id="tree-pointer" class="tree-pointer">
    <div class="tree-pointer-arrow">▼</div>
    <div class="tree-pointer-label">current</div>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface TreeNode {
  id:       number;
  value:    number | string;
  parentId: number | null;
  depth:    number;
  left?:    number | null;
  right?:   number | null;
}

interface PositionedNode extends TreeNode {
  x: number;
  y: number;
}

interface TreeEdge {
  parent: number;
  child:  number;
}

interface TreeData {
  nodes: TreeNode[];
  edges: TreeEdge[];
}

// ═══════════════════════════════════════════════════
// TREE DATA EXTRACTOR
// ═══════════════════════════════════════════════════

function extractTreeData(analysis: AnalysisResult): TreeData {
  const input    = analysis.inputExample || '';
  const category = analysis.category    || '';

  let nodes: TreeNode[] = [];
  let edges: TreeEdge[] = [];

  // ── Pattern 1: array representation ──────────────
  // e.g., "[1, 2, 3, 4, 5, null, 6]" (level-order)
  const arrayMatch = input.match(/\[([^\]]+)\]/);
  if (arrayMatch) {
    const parts = arrayMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const values: (number | null)[] = parts.map(p =>
      p === 'null' || p === 'None' || p === '#' ? null : Number(p)
    );

    if (values.length > 0 && values[0] !== null) {
      // Build from level-order array
      nodes = [];
      edges = [];

      values.forEach((val, i) => {
        if (val === null) return;

        const depth = Math.floor(Math.log2(i + 1));
        nodes.push({
          id:       i,
          value:    val,
          parentId: i === 0 ? null : Math.floor((i - 1) / 2),
          depth,
        });

        if (i > 0) {
          const parentIdx = Math.floor((i - 1) / 2);
          if (values[parentIdx] !== null) {
            edges.push({ parent: parentIdx, child: i });
          }
        }
      });
    }
  }

  // ── Pattern 2: insert sequence ────────────────────
  // e.g., "Insert 5, 3, 7, 1, 4 into BST"
  // or just plain numbers: "5 3 7 1 4 6 8"
  if (nodes.length === 0) {
    const numMatch = input.match(/(-?\d+)/g);
    if (numMatch && numMatch.length >= 3) {
      const vals = numMatch.slice(0, 15).map(Number); // cap at 15 nodes
      const bst  = buildBST(vals);
      nodes = bst.nodes;
      edges = bst.edges;
    }
  }

  // ── Fallback: default balanced BST ───────────────
  if (nodes.length === 0) {
    const defaultVals = category.toLowerCase().includes('heap')
      ? [50, 30, 70, 20, 40, 60, 80]   // heap-like
      : [40, 20, 60, 10, 30, 50, 70];  // balanced BST

    const bst = buildBST(defaultVals);
    nodes = bst.nodes;
    edges = bst.edges;
  }

  // ── Safety: cap at 15 nodes ───────────────────────
  if (nodes.length > 15) {
    const maxDepth = 3;
    nodes = nodes.filter(n => n.depth <= maxDepth);
    edges = edges.filter(e =>
      nodes.some(n => n.id === e.parent) &&
      nodes.some(n => n.id === e.child)
    );
  }

  return { nodes, edges };
}

// ═══════════════════════════════════════════════════
// BST BUILDER
// ═══════════════════════════════════════════════════

function buildBST(values: number[]): TreeData {
  interface BSTNode {
    id:       number;
    value:    number;
    parentId: number | null;
    depth:    number;
    left:     number | null;
    right:    number | null;
  }

  const nodes: BSTNode[] = [];
  const edges: TreeEdge[] = [];
  let   nextId = 0;

  function insert(
    value:    number,
    parentId: number | null,
    depth:    number,
    isLeft:   boolean | null
  ): number {
    const id = nextId++;
    nodes.push({
      id,
      value,
      parentId,
      depth,
      left:  null,
      right: null,
    });

    if (parentId !== null) {
      edges.push({ parent: parentId, child: id });
      // Update parent's left/right
      const parent = nodes.find(n => n.id === parentId);
      if (parent) {
        if (isLeft) parent.left  = id;
        else        parent.right = id;
      }
    }

    return id;
  }

  function insertBST(
    value:    number,
    nodeId:   number | null,
    parentId: number | null,
    depth:    number,
    isLeft:   boolean | null
  ): number {
    if (nodeId === null) {
      return insert(value, parentId, depth, isLeft);
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return insert(value, parentId, depth, isLeft);

    if (value < node.value) {
      node.left = insertBST(value, node.left ?? null, nodeId, depth + 1, true);
    } else if (value > node.value) {
      node.right = insertBST(value, node.right ?? null, nodeId, depth + 1, false);
    }
    // Ignore duplicates

    return nodeId;
  }

  let rootId: number | null = null;

  values.forEach((val, i) => {
    if (i === 0) {
      rootId = insert(val, null, 0, null);
    } else {
      insertBST(val, rootId, null, 0, null);
    }
  });

  return { nodes, edges };
}

// ═══════════════════════════════════════════════════
// TREE LAYOUT CALCULATOR
// Top-down hierarchical layout using Reingold-Tilford
// simplified approach (x spacing per level)
// ═══════════════════════════════════════════════════

function calculateTreeLayout(
  nodes: TreeNode[]
): Record<number, PositionedNode> {
  const positioned: Record<number, PositionedNode> = {};

  if (nodes.length === 0) return positioned;

  // Find max depth
  const maxDepth = Math.max(...nodes.map(n => n.depth));

  // Group nodes by depth
  const byDepth: Record<number, TreeNode[]> = {};
  nodes.forEach(n => {
    if (!byDepth[n.depth]) byDepth[n.depth] = [];
    byDepth[n.depth].push(n);
  });

  // Y positions: evenly spaced from 12% to 82%
  // leave room for traversal bar at bottom
  const yStart  = 12;
  const yEnd    = maxDepth === 0 ? 50 : 78;
  const yStep   = maxDepth === 0 ? 0 : (yEnd - yStart) / maxDepth;

  // X positions: evenly distributed per level
  Object.keys(byDepth).forEach(depthStr => {
    const depth      = Number(depthStr);
    const levelNodes = byDepth[depth];
    const count      = levelNodes.length;
    const y          = yStart + depth * yStep;

    // X padding: more nodes → less padding
    const xPad  = Math.max(8, 35 - count * 3);
    const xStep = count === 1 ? 0 : (100 - xPad * 2) / (count - 1);

    levelNodes.forEach((node, i) => {
      const x = count === 1
        ? 50
        : xPad + i * xStep;

      positioned[node.id] = {
        ...node,
        x,
        y,
      };
    });
  });

  return positioned;
}