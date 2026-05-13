// lib/visualizer/templates/graph.ts

import { AnalysisResult } from "@/types";

/**
 * Graph Template.
 * Generates HTML + SVG structure for graph visualizations.
 *
 * Algorithms using this template:
 *  - BFS / DFS
 *  - Dijkstra
 *  - Prim / Kruskal (MST)
 *  - Bellman-Ford
 *  - Topological Sort
 *  - Floyd-Warshall
 *
 * Structure:
 *  <div id="graph-container">
 *    <svg id="graph-edges">  ← edges drawn here
 *      <line/path per edge>
 *    </svg>
 *    <div class="graph-node" id="node-A">A</div>
 *    ...
 *  </div>
 *
 * Node positions: circular layout by default.
 * Edge positions: calculated from node centers.
 */
export function getGraphTemplate(analysis: AnalysisResult): string {

  // ── Try to extract graph structure from analysis ──
  // Look for adjacency info in description/inputExample
  const graphData = extractGraphData(analysis);

  const { nodes, edges, isDirected, isWeighted } = graphData;

  // ── Calculate node positions (circular layout) ────
  const nodeCount  = nodes.length;
  const cx         = 50; // percent center X
  const cy         = 50; // percent center Y
  const radiusPct  = nodeCount <= 5 ? 35 : nodeCount <= 8 ? 38 : 40;

  const nodePositions: Record<string, { x: number; y: number }> = {};

  nodes.forEach((node, i) => {
    const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
    nodePositions[node.id] = {
      x: cx + radiusPct * Math.cos(angle),
      y: cy + radiusPct * Math.sin(angle),
    };
  });

  // ── Generate SVG edges ────────────────────────────
  const edgesHTML = edges.map((edge, idx) => {
    const from = nodePositions[edge.from];
    const to   = nodePositions[edge.to];
    if (!from || !to) return '';

    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;

    // For directed: add arrowhead marker
    const markerId = isDirected ? 'url(#graph-arrow)' : '';

    // Weight label position (midpoint with offset)
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    return `
    <!-- Edge: ${edge.from} → ${edge.to} -->
    <g class="graph-edge-group" id="edge-${edge.from}-${edge.to}" data-from="${edge.from}" data-to="${edge.to}" data-weight="${edge.weight ?? ''}">
      <line
        class="graph-edge"
        x1="${x1}%" y1="${y1}%"
        x2="${x2}%" y2="${y2}%"
        ${isDirected ? `marker-end="${markerId}"` : ''}
      />
      ${isWeighted && edge.weight !== undefined ? `
      <text class="graph-edge-weight" x="${mx}%" y="${my}%">${edge.weight}</text>
      ` : ''}
    </g>`;
  }).join('\n');

  // ── Generate node HTML ────────────────────────────
  const nodesHTML = nodes.map((node) => {
    const pos = nodePositions[node.id];
    if (!pos) return '';

    return `
  <div
    class="graph-node"
    id="node-${node.id}"
    data-id="${node.id}"
    data-value="${node.value ?? node.id}"
    style="left:${pos.x}%;top:${pos.y}%;transform:translate(-50%,-50%);"
  >
    <div class="graph-node-inner">
      <span class="graph-node-label">${node.label ?? node.id}</span>
    </div>
    <div class="graph-node-dist" id="dist-${node.id}">∞</div>
  </div>`;
  }).join('\n');

  // ── Return complete template ───────────────────────
  return `
<!-- ─────────────────────────────────────────────────────────────
     GRAPH TEMPLATE
     Nodes: ${nodes.length} | Edges: ${edges.length}
     Directed: ${isDirected} | Weighted: ${isWeighted}
──────────────────────────────────────────────────────────────────── -->
<div id="graph-container" class="graph-layout">

  <!-- SVG Layer for edges -->
  <svg
    id="graph-edges-svg"
    class="graph-svg"
    xmlns="http://www.w3.org/2000/svg"
    style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;"
  >
    <defs>
      <!-- Arrow marker for directed edges -->
      <marker
        id="graph-arrow"
        viewBox="0 0 10 10"
        refX="20"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" class="graph-arrow-head" />
      </marker>
      <!-- Glow filter -->
      <filter id="graph-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Edges -->
    ${edgesHTML}
  </svg>

  <!-- Node elements -->
  ${nodesHTML}

  <!-- Queue / Stack side panel for BFS/DFS -->
  <div id="graph-queue-panel" class="graph-side-panel">
    <div class="graph-side-panel-title" id="graph-queue-title">Queue</div>
    <div class="graph-side-panel-items" id="graph-queue-items"></div>
  </div>

  <!-- Path display panel -->
  <div id="graph-path-panel" class="graph-path-display">
    <span class="graph-path-label">Path:</span>
    <span id="graph-path-text">—</span>
  </div>

</div>
  `.trim();
}

// ═══════════════════════════════════════════════════
// GRAPH DATA EXTRACTOR
// ═══════════════════════════════════════════════════

interface GraphNode {
  id:     string;
  label?: string;
  value?: string | number;
}

interface GraphEdge {
  from:    string;
  to:      string;
  weight?: number;
}

interface GraphData {
  nodes:      GraphNode[];
  edges:      GraphEdge[];
  isDirected: boolean;
  isWeighted: boolean;
}

function extractGraphData(analysis: AnalysisResult): GraphData {
  const input       = analysis.inputExample || '';
  const description = analysis.description  || '';
  const category    = analysis.category     || '';

  let nodes: GraphNode[] = [];
  let edges: GraphEdge[] = [];
  let isDirected = false;
  let isWeighted = false;

  // ── Try adjacency list format ─────────────────────
  // e.g., "0: [1,2], 1: [2,3], 2: [3]"
  // or "A-B, B-C, A-C"
  // or "0→1(5), 1→2(3)"

  // Pattern 1: weighted directed "0→1(5), 1→2(3)"
  const weightedDirected = input.match(/(\w+)\s*[→>]\s*(\w+)\s*\((\d+)\)/g);
  if (weightedDirected) {
    isDirected = true;
    isWeighted = true;
    const nodeSet = new Set<string>();
    weightedDirected.forEach(e => {
      const m = e.match(/(\w+)\s*[→>]\s*(\w+)\s*\((\d+)\)/);
      if (m) {
        nodeSet.add(m[1]);
        nodeSet.add(m[2]);
        edges.push({ from: m[1], to: m[2], weight: Number(m[3]) });
      }
    });
    nodes = Array.from(nodeSet).map(id => ({ id, label: id }));
  }

  // Pattern 2: unweighted directed "0→1, 1→2, 0→2"
  if (nodes.length === 0) {
    const directed = input.match(/(\w+)\s*[→>]\s*(\w+)/g);
    if (directed) {
      isDirected = true;
      const nodeSet = new Set<string>();
      directed.forEach(e => {
        const m = e.match(/(\w+)\s*[→>]\s*(\w+)/);
        if (m) {
          nodeSet.add(m[1]);
          nodeSet.add(m[2]);
          edges.push({ from: m[1], to: m[2] });
        }
      });
      nodes = Array.from(nodeSet).map(id => ({ id, label: id }));
    }
  }

  // Pattern 3: weighted undirected "A-B(3), B-C(5)"
  if (nodes.length === 0) {
    const weightedUndirected = input.match(/(\w+)\s*-\s*(\w+)\s*\((\d+)\)/g);
    if (weightedUndirected) {
      isWeighted = true;
      const nodeSet = new Set<string>();
      weightedUndirected.forEach(e => {
        const m = e.match(/(\w+)\s*-\s*(\w+)\s*\((\d+)\)/);
        if (m) {
          nodeSet.add(m[1]);
          nodeSet.add(m[2]);
          edges.push({ from: m[1], to: m[2], weight: Number(m[3]) });
          edges.push({ from: m[2], to: m[1], weight: Number(m[3]) });
        }
      });
      nodes = Array.from(nodeSet).map(id => ({ id, label: id }));
    }
  }

  // Pattern 4: simple undirected "A-B, B-C, A-C"
  if (nodes.length === 0) {
    const undirected = input.match(/(\w+)\s*-\s*(\w+)/g);
    if (undirected) {
      const nodeSet = new Set<string>();
      undirected.forEach(e => {
        const m = e.match(/(\w+)\s*-\s*(\w+)/);
        if (m) {
          nodeSet.add(m[1]);
          nodeSet.add(m[2]);
          edges.push({ from: m[1], to: m[2] });
          edges.push({ from: m[2], to: m[1] });
        }
      });
      nodes = Array.from(nodeSet).map(id => ({ id, label: id }));
    }
  }

  // Pattern 5: adjacency list "0:[1,2], 1:[2,3]"
  if (nodes.length === 0) {
    const adjList = input.match(/(\d+)\s*:\s*\[([^\]]*)\]/g);
    if (adjList) {
      const nodeSet = new Set<string>();
      adjList.forEach(item => {
        const m = item.match(/(\d+)\s*:\s*\[([^\]]*)\]/);
        if (m) {
          const from = m[1];
          nodeSet.add(from);
          const neighbors = m[2].split(',').map(s => s.trim()).filter(Boolean);
          neighbors.forEach(to => {
            nodeSet.add(to);
            edges.push({ from, to });
          });
        }
      });
      nodes = Array.from(nodeSet)
        .sort((a, b) => Number(a) - Number(b))
        .map(id => ({ id, label: id }));
    }
  }

  // ── Fallback: generate default 6-node graph ───────
  if (nodes.length === 0) {
    nodes = ['A','B','C','D','E','F'].map(id => ({ id, label: id }));

    // Determine if weighted from category
    isWeighted = category.toLowerCase().includes('dijkstra')
      || category.toLowerCase().includes('weighted')
      || description.toLowerCase().includes('weight')
      || description.toLowerCase().includes('distance');

    isDirected = category.toLowerCase().includes('directed')
      || description.toLowerCase().includes('directed');

    // Default edges forming connected graph
    const defaultEdges: GraphEdge[] = [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 2 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'C', to: 'D', weight: 8 },
      { from: 'C', to: 'E', weight: 10 },
      { from: 'D', to: 'E', weight: 2 },
      { from: 'D', to: 'F', weight: 6 },
      { from: 'E', to: 'F', weight: 3 },
    ];

    edges = isWeighted ? defaultEdges : defaultEdges.map(e => ({ from: e.from, to: e.to }));

    // Add reverse edges if undirected
    if (!isDirected) {
      const reverseEdges = edges.map(e => ({ from: e.to, to: e.from, weight: e.weight }));
      edges = [...edges, ...reverseEdges];
    }
  }

  // ── Safety: cap nodes ─────────────────────────────
  if (nodes.length > 12) {
    nodes = nodes.slice(0, 12);
    edges = edges.filter(e =>
      nodes.some(n => n.id === e.from) &&
      nodes.some(n => n.id === e.to)
    );
  }

  return { nodes, edges, isDirected, isWeighted };
}