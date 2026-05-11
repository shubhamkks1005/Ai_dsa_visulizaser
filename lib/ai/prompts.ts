import { AnalysisResult } from "@/types";

// ═══════════════════════════════════════════════════
// ANALYZER PROMPT — Tells AI how to analyze code
// ═══════════════════════════════════════════════════

export function buildAnalyzerPrompt(code: string, language: string): string {
  return `You are an expert algorithm analyzer. Analyze the following ${language} code and return a structured JSON response.

CODE:
\`\`\`${language}
${code}
\`\`\`

You must return ONLY valid JSON (no markdown, no explanation, no code fences). The JSON must follow this exact structure:

{
  "algorithmName": "Name of the algorithm or problem being solved",
  "category": "Category: Sorting / Graph / DP / Two Pointers / Divide & Conquer / Tree / Linked List / Stack / Queue / Binary Search / Greedy / Backtracking / Recursion / String / Math / Other",
  "language": "${language}",
  "description": "1-2 sentence plain English description of what this code does",
  "variables": ["list", "of", "all", "key", "variables"],
  "dataStructures": ["list of data structures used: array, stack, queue, tree, graph, linked list, hash map, etc."],
  "steps": [
    {
      "step": 1,
      "description": "What happens at this step in plain English",
      "variables": {"var1": "value1", "var2": "value2"},
      "highlight": [0, 1],
      "action": "initialize / compare / swap / update / push / pop / insert / delete / merge / split / return"
    }
  ],
  "timeComplexity": "O(n log n) — with brief explanation",
  "spaceComplexity": "O(n) — with brief explanation",
  "inputExample": "The example input used in the code, or a good default",
  "expectedOutput": "The expected output for the given input",
  "keyInsight": "The one sentence that explains WHY this algorithm works",
  "physicalInterpretation": "Real-world analogy a 5-year-old could understand"
}

RULES:
- Trace through the code with the given input (or a sensible default input)
- Every comparison, swap, update, push, pop = a separate step
- Do NOT skip steps or combine multiple operations
- First step = initialization
- Last step = completion with final result
- Include at least 8-15 steps minimum for any non-trivial algorithm
- Variables object must show ALL variable values at that step
- Return ONLY the JSON, nothing else`;
}

// ═══════════════════════════════════════════════════
// GENERATOR PROMPT — 49-Section Master Prompt
// ═══════════════════════════════════════════════════

export function buildVisualizationPrompt(analysis: AnalysisResult): string {
  const analysisJSON = JSON.stringify(analysis, null, 2);

  return `You are an Algorithm Visualization Generator AI.

I have already analyzed the code. Here is the structured analysis:

\`\`\`json
${analysisJSON}
\`\`\`

Using this analysis, generate a SINGLE self-contained HTML file that visualizes this algorithm step by step.

═══════════════════════════════════════════════════════════
THE 48-SECTION STRUCTURE — Follow this EXACTLY
═══════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — IDENTITY & ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1 — Algorithm Identity (from analysis):
- ALGORITHM NAME: ${analysis.algorithmName}
- CATEGORY: ${analysis.category}
- LANGUAGE: ${analysis.language}
- TIME COMPLEXITY: ${analysis.timeComplexity}
- SPACE COMPLEXITY: ${analysis.spaceComplexity}
- CORE GOAL: ${analysis.description}
- KEY INSIGHT: ${analysis.keyInsight}
- INPUT: ${analysis.inputExample}
- OUTPUT: ${analysis.expectedOutput}
- PHYSICAL INTERPRETATION: ${analysis.physicalInterpretation || "AI must infer from algorithm behavior"}

SECTION 2 — Map every element to a real-world visual:
- What do input elements represent? (heights=buildings, prices=candlesticks, nodes=cities)
- What do pointers represent? (markers, scanners, explorers)
- What is the PROCESS physically?
- What is the RESULT physically?

SECTION 3 — Data Structures to Visualize:
- PRIMARY: ${analysis.dataStructures?.join(", ") || "Array"}
- Variables to track: ${analysis.variables.join(", ")}

SECTION 4 — Step Trace (from analysis):
${analysis.steps.map((s) => `Step ${s.step}: ${s.description} | Action: ${s.action} | Variables: ${JSON.stringify(s.variables)}`).join("\n")}

SECTION 5 — Edge Cases: Handle empty input, single element, already solved, no solution.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — LAYOUT & STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 6 — Visual Design:
- Dark theme background (#0d1117)
- Element colors based on state (active=cyan, comparing=yellow, sorted=green, etc.)
- Layout: topbar + main scene + caption + controls

SECTION 7 — Scene: Choose a concrete visual metaphor (NOT plain boxes)

SECTION 8 — Positioning: Calculate element positions based on container size

SECTION 9 — Input size ${analysis.steps.length} steps: Apply appropriate detail level

SECTION 10 — Initialization: Staggered element entry animation

SECTION 11 — Semantic colors: Every color carries meaning, color-blind safe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — ANIMATION CORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 12 — Physics: Nothing appears/disappears instantly. Smooth easing. Swap = arc path.
SECTION 13 — Creation/Destruction: Typewriter labels, ghost outlines, particle explosions.
SECTION 14 — Value changes: Old flies up, new flies in from below.
SECTION 15 — Pointers: Actual geometric arrows, not just color. Labels visible.
SECTION 16 — Split/Merge: If applicable, cinematic animations.
SECTION 17 — 3D moments: CSS preserve-3d for comparisons.
SECTION 18 — Physical properties: Heavy values move slower.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — CINEMATIC & FEEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 19 — Category-specific animations:
${getCategoryRules(analysis.category)}

SECTION 20 — Algorithm personality and theme
SECTION 21 — Real-world metaphor (mandatory)
SECTION 22 — Creative quality gate: Must NOT look like generic colored boxes
SECTION 23 — Tension/suspense: Pre-operation pause, comparison beams, climax moments
SECTION 24 — Speed effects: Speed lines, impact frames (sparingly)
SECTION 25 — Background glow, particles, trails
SECTION 26 — Visual sound equivalents: Vibration, ripple
SECTION 27 — Algorithm emotion and personality dialogue

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — UI, INFO & COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 28 — Caption (word-by-word), stats bar (live counters), algorithm header
SECTION 29 — Annotations: Speech bubbles, conversational, progressive disclosure
SECTION 30 — Recursion panel (if applicable)
SECTION 31 — Heatmap, ghost trails, comparison history
SECTION 32 — Phase transitions, intro, mid-insight, completion
SECTION 33 — Final stats card with complexity info

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — REALISM & POLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 34 — Domain-specific physics
SECTION 35 — Ambient environment (evolves with algorithm)
SECTION 36 — Element textures/materials
SECTION 37 — Cinematic lighting (spotlight follows active)
SECTION 38 — Idle micro-animations (nothing 100% still)
SECTION 39 — Dramatic moment text (max 4 times)
SECTION 40 — Completion environment transition

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — ADVANCED CINEMATIC & INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 41 — Camera dynamics (wide shot, close-up, follow, shake)
SECTION 42 — Post-processing (bloom, film grain, vignette)
SECTION 43 — Adaptive timing (boring steps faster, critical steps slower)
SECTION 44 — Atmospheric particles (theme-specific)
SECTION 45 — Interactive inspection (hover tooltips)
SECTION 46 — State ghost / diff visualization

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — SAFETY & ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 47 — Fail-safe: Never crash, never blank. Always show fallback.
SECTION 48 — Accessibility: prefers-reduced-motion, color-blind safe, keyboard controls (Space=play, arrows=prev/next, R=reset)
SECTION 49 — Layout safety: z-index hierarchy, overflow rules, responsive grid, clamped positions, no scrollbars on main page.

═══════════════════════════════════════════════════════════
MANDATORY CONTROLS
═══════════════════════════════════════════════════════════

Bottom bar with: Reset | ◀ Prev | ▶ Play/Pause | Next ▶ | Speed (0.5x, 1x, 2x)
Keyboard: Space=Play/Pause, ←=Prev, →=Next, R=Reset

═══════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════

Output a SINGLE self-contained HTML file.
- ALL CSS in <style> tags
- ALL JS in <script> tags
- No external files (CDN for anime.js/GSAP is OK)
- Must work inside iframe srcdoc
- All steps PRECOMPUTED as JS array
- Dark theme (#0d1117 background)
- Copy-paste ready

DO NOT output explanations.
DO NOT split into files.
Just output the COMPLETE HTML.`;
}

// ═══════════════════════════════════════════════════
// HELPER — Category-specific animation rules
// ═══════════════════════════════════════════════════

function getCategoryRules(category: string): string {
  const rules: Record<string, string> = {
    Sorting: `SORTING: Swap → Boxes arc over each other. After each pass → green wave. Height ∝ value. Comparison count live update.`,
    "Divide & Conquer": `DIVIDE & CONQUER: Split → boxes spread apart. Each level gets own row. Merge → elements fly into center. Lines connecting parent to children.`,
    Graph: `GRAPH: Nodes as circles with glow. Edge creation → line draws itself. BFS → expanding circle pulse. DFS → thick trail, backtrack = trail fades. Queue/Stack shown below.`,
    "Binary Search": `BINARY SEARCH: Eliminated half → boxes tilt + fade + collapse. Active range → bracket that shrinks. Found → particle burst.`,
    "Linked List": `LINKED LIST: Node materializes with ripple. Arrow draws itself. Delete → cracks/shatters, arrows reroute. Insert → drops from above.`,
    Tree: `TREE: Insert → bounces down from root. Rotation → subtree rotates with pivot animation. Branch sway idle animation.`,
    DP: `DYNAMIC PROGRAMMING: Table cells fill with glow + ripple. Dependency arrows from cell to cell. Final path → gold highlight trace back.`,
    "Two Pointers": `TWO POINTERS: LEFT pointer → green arrow right. RIGHT pointer → red arrow left. When they meet → spark/flash effect.`,
    Stack: `STACK: Physical stacking of cards. Push → slides in from side. Pop → lifts up and away.`,
    Queue: `QUEUE: Physical queue line. Enqueue → enters from right. Dequeue → exits from left.`,
    Greedy: `GREEDY: Decisive animations. Element chosen → golden glow. Rejected → fade to gray. Confidence feel.`,
    Backtracking: `BACKTRACKING: Try path → advance with caution. Dead end → red flash, retreat. Solution → green path illuminates.`,
    Recursion: `RECURSION: Call stack panel mandatory. Function call → new card slides in. Return → floats back to caller. Depth color coding.`,
    String: `STRING: Characters as individual tiles/cards. Pattern matching → sliding window highlight. Match → green flash.`,
    Math: `MATH: Numbers as prominent display. Operations shown with mathematical notation. Result builds up.`,
  };

  return rules[category] || `AI must infer the closest category from: ${Object.keys(rules).join(", ")} and apply matching animation rules. If none match, design scene vocabulary based on algorithm behavior.`;
}