// lib/ai/analyzer.ts

import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "@/types";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface CreativeDirection {
  metaphor: string;
  sceneName: string;
  heroCharacter: {
    type: string;
    look: string;
    personality: string;
    idleAnimation: string;
    moveAnimation: string;
  };
  environment: {
    setting: string;
    backgroundLayers: string[];
    ambientEffects: string[];
  };
  objectMapping: Record<string, string>;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    background: string;
  };
  domainAnimations: string[];
  dramaticMoments: string[];
  nonNegotiableVisualRequirements: string[];
}

export interface AnalyzerOutput {
  analysis: AnalysisResult;
  creativeDirection: CreativeDirection;
}

// ═══════════════════════════════════════════════════
// MODEL CONFIG
// Gemini-only chain
// ═══════════════════════════════════════════════════

const GEMINI_MODELS = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

const MAX_OUTPUT_TOKENS = 4096;
const MAX_RETRIES_PER_MODEL = 2;

// ═══════════════════════════════════════════════════
// PROMPT BUILDER
// One call = analysis + creative seed
// Detailed but token-safe
// ═══════════════════════════════════════════════════

function buildAnalyzerPrompt(code: string, language: string): string {
  return `
You are an elite Algorithm Analysis + Visualization Planning AI.

Your task has TWO goals:

GOAL 1 — Analyze the code exactly
GOAL 2 — Infer a cinematic, non-generic visualization direction from the algorithm's real behavior

You are NOT generating HTML right now.
You are ONLY generating structured JSON.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INPUT CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Language: ${language}

\`\`\`${language}
${code}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU MUST DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP A — Understand the code deeply
- Identify the exact algorithm/problem
- Infer the real goal of the function
- Detect important variables, pointers, structures, loops, conditions, recursion
- Mentally trace the code with a concrete example input
- Produce a step-by-step execution trace
- Compute expected output
- Infer time and space complexity
- List edge cases

STEP B — Infer strong visual creativity from the algorithm's behavior
You must infer a NON-GENERIC cinematic metaphor from what the algorithm physically feels like.

Examples:
- Trapping Rain Water → rainy skyline, buildings, trapped water rising between walls
- Frog Jump → actual frog jumping across stones/lily pads
- Bubble Sort → floating bubbles, underwater swapping, gentle fluid motion
- Graph shortest path → GPS map, roads, route glow, navigation pin
- Tree traversal → branches, bird hopping, glowing path through a tree
- Binary Search → detective spotlight narrowing suspects
- DP → puzzle board or blueprint filling up
- Stack / Queue → trays, plates, people in line, conveyor system

Creativity rules:
- DO NOT say generic things like "array elements are boxes" unless there is no better metaphor
- The hero character must feel real and visible, not just "pointer"
- The environment must feel like a scene, not just a color
- Object mapping must explain WHY the algorithm behaves the way it does
- Non-negotiable requirements must be specific and visual

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
Return ONLY valid JSON. No markdown. No explanations.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "analysis": {
    "algorithmName": "Exact algorithm/problem name",
    "category": "Sorting / Graph / DP / Two Pointers / Divide & Conquer / Tree / Linked List / Stack / Queue / Binary Search / Greedy / Backtracking / Recursion / String / Math / Other",
    "language": "${language}",
    "description": "2-3 sentence plain English explanation of what the algorithm does",
    "variables": [
      { "name": "variableName", "meaning": "what this variable represents in the algorithm" }
    ],
    "dataStructures": ["array", "stack", "queue", "tree", "graph", "hash map"],
    "steps": [
      {
        "step": 1,
        "description": "technical action at this moment",
        "caption": "human-friendly educational explanation",
        "variables": { "var1": "value1", "var2": "value2" },
        "highlight": [0],
        "action": "initialize",
        "important": true,
        "timingMult": 1.0
      }
    ],
    "timeComplexity": "O(...) with short explanation",
    "spaceComplexity": "O(...) with short explanation",
    "inputExample": "exact traced input example",
    "expectedOutput": "exact expected result for traced input",
    "keyInsight": "the one sentence that explains why the algorithm works",
    "physicalInterpretation": "a simple vivid real-world explanation that even a child could imagine",
    "edgeCases": [
      "edge case 1",
      "edge case 2"
    ]
  },
  "creativeDirection": {
    "metaphor": "One vivid sentence like: A storm-water engineer scans a rainy skyline to measure how much water gets trapped between tall buildings.",
    "sceneName": "short cinematic scene title",
    "heroCharacter": {
      "type": "frog / explorer / engineer / detective / navigator / bubble / bird / etc",
      "look": "specific visual look",
      "personality": "one short personality phrase",
      "idleAnimation": "what the hero does while waiting",
      "moveAnimation": "how the hero moves"
    },
    "environment": {
      "setting": "2-3 sentence rich environment description",
      "backgroundLayers": [
        "far background layer",
        "mid background layer",
        "near background layer"
      ],
      "ambientEffects": [
        "ambient effect 1",
        "ambient effect 2"
      ]
    },
    "objectMapping": {
      "array": "what the main array becomes visually",
      "leftPointer": "what left pointer becomes visually",
      "rightPointer": "what right pointer becomes visually",
      "result": "what the result looks like visually"
    },
    "colorPalette": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "danger": "#hex",
      "background": "#hex"
    },
    "domainAnimations": [
      "domain-specific animation 1",
      "domain-specific animation 2",
      "domain-specific animation 3"
    ],
    "dramaticMoments": [
      "first major reveal",
      "midway insight moment",
      "biggest operation moment",
      "completion moment"
    ],
    "nonNegotiableVisualRequirements": [
      "very specific visual requirement 1",
      "very specific visual requirement 2",
      "very specific visual requirement 3",
      "very specific visual requirement 4"
    ]
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STRICT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Output ONLY valid JSON
2. Do not use placeholders like "etc", "something", "generic object"
3. Steps must be meaningful and ordered
4. Captions must be human-readable and educational
5. Every important variable should appear in the steps' variables object
6. If code has no example input, infer a small representative one and clearly state it
7. Creativity must match the actual algorithm behavior
8. Avoid generic "colored bars" unless the algorithm truly gives no stronger metaphor
9. The scene should be recognizable from visuals alone
10. Be specific, concrete, vivid, and useful
11. CRITICAL JSON RULES — your output will be parsed by JSON.parse():
    - All string values must be on ONE line only
    - Do NOT put actual line breaks inside JSON string values
    - Use \\n if you need a newline inside a string value
    - Use \\" if you need quotes inside a string value
    - No trailing commas
    - No comments
    - No single quotes for JSON strings
    - Return one valid parseable JSON object only
     - IMPORTANT: Keep spaces between words (e.g., "The frog jumps" NOT "Thefrogjumps")
`.trim();
}
// ═══════════════════════════════════════════════════
// ENV / KEY HELPERS
// Supports either:
//   GEMINI_API_KEY=...
//   GEMINI_API_KEYS=key1,key2,key3
// ═══════════════════════════════════════════════════

function getGeminiApiKeys(): string[] {
  const single = process.env.GEMINI_API_KEY?.trim() || "";
  const multiRaw = process.env.GEMINI_API_KEYS?.trim() || "";

  const multi = multiRaw
    .split(/[,\n]/)
    .map((key) => key.trim())
    .filter(Boolean);

  const keys = [...(single ? [single] : []), ...multi];

  const unique = Array.from(new Set(keys));

  if (unique.length === 0) {
    throw new Error(
      "Gemini API key not configured. Add GEMINI_API_KEY or GEMINI_API_KEYS in .env.local"
    );
  }

  return unique;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("503") ||
    message.includes("500") ||
    message.includes("overloaded") ||
    message.includes("timeout") ||
    message.includes("unavailable")
  );
}

// ═══════════════════════════════════════════════════
// PARSING
// ═══════════════════════════════════════════════════

function extractJSONObject(text: string): string {
  let clean = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Fix common JSON issues from AI output
  function attemptFix(json: string): string {
    // Fix unescaped newlines inside strings
    let result = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < json.length; i++) {
      const ch = json[i];

      if (escaped) {
        result += ch;
        escaped = false;
        continue;
      }

      if (ch === "\\") {
        escaped = true;
        result += ch;
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        result += ch;
        continue;
      }

      if (inString) {
        if (ch === "\n") { result += "\\n"; continue; }
        if (ch === "\r") { result += "\\r"; continue; }
        if (ch === "\t") { result += "\\t"; continue; }
        const code = ch.charCodeAt(0);
        if (code < 32) {
          result += "\\u" + code.toString(16).padStart(4, "0");
          continue;
        }
      }

      result += ch;
    }

    // Fix trailing commas
    result = result.replace(/,(\s*[\]}])/g, "$1");

    return result;
  }

  // Try 1: direct parse
  try {
    JSON.parse(clean);
    return clean;
  } catch {
    // continue
  }

  // Try 2: extract { ... }
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    const sliced = clean.slice(start, end + 1);

    // Try 3: parse sliced directly
    try {
      JSON.parse(sliced);
      return sliced;
    } catch {
      // continue
    }

    // Try 4: fix + parse sliced
    try {
      const fixed = attemptFix(sliced);
      JSON.parse(fixed);
      return fixed;
    } catch {
      // continue
    }

    // Try 5: aggressive fix
    try {
      const aggressive = sliced
        .replace(/[\x00-\x1F\x7F]/g, " ")
        .replace(/,(\s*[\]}])/g, "$1");
      JSON.parse(aggressive);
      return aggressive;
    } catch {
      // continue
    }
  }

  // Try 6: fix full clean text
  try {
    const fixed = attemptFix(clean);
    JSON.parse(fixed);
    return fixed;
  } catch {
    // continue
  }

  throw new Error("Failed to parse analyzer response as JSON");
}

function parseAnalyzerOutput(text: string): AnalyzerOutput {
  const jsonText = extractJSONObject(text);
  const parsed = JSON.parse(jsonText) as Partial<AnalyzerOutput>;

  if (!parsed.analysis || typeof parsed.analysis !== "object") {
    throw new Error("Analyzer response missing analysis object");
  }

  const analysis = normalizeAnalysis(parsed.analysis as AnalysisResult);
  const creativeDirection = normalizeCreativeDirection(
    parsed.creativeDirection,
    analysis
  );

  return {
    analysis,
    creativeDirection,
  };
}

// ═══════════════════════════════════════════════════
// NORMALIZATION — ANALYSIS
// ═══════════════════════════════════════════════════

function normalizeAnalysis(raw: AnalysisResult): AnalysisResult {
  const analysis = { ...raw } as AnalysisResult;

  if (!analysis.algorithmName || typeof analysis.algorithmName !== "string") {
    throw new Error("Invalid analyzer response: missing algorithmName");
  }

  if (!analysis.category || typeof analysis.category !== "string") {
    analysis.category = "Other";
  }

  if (!analysis.language || typeof analysis.language !== "string") {
    analysis.language = "javascript";
  }

  if (!analysis.description || typeof analysis.description !== "string") {
    analysis.description = `${analysis.algorithmName} algorithm implementation.`;
  }

  if (!analysis.keyInsight || typeof analysis.keyInsight !== "string") {
    analysis.keyInsight =
      `${analysis.algorithmName} works by repeatedly making the next correct decision based on the current state.`;
  }

  if (!analysis.physicalInterpretation || typeof analysis.physicalInterpretation !== "string") {
    analysis.physicalInterpretation =
      `A real-world process that models how ${analysis.algorithmName} works step by step.`;
  }

  if (!analysis.timeComplexity || typeof analysis.timeComplexity !== "string") {
    analysis.timeComplexity = "O(n)";
  }

  if (!analysis.spaceComplexity || typeof analysis.spaceComplexity !== "string") {
    analysis.spaceComplexity = "O(1)";
  }

  if (!analysis.inputExample || typeof analysis.inputExample !== "string") {
    analysis.inputExample = "Representative example inferred from code";
  }

  if (!analysis.expectedOutput || typeof analysis.expectedOutput !== "string") {
    analysis.expectedOutput = "Expected output inferred from traced execution";
  }

  if (!Array.isArray((analysis as any).variables)) {
    (analysis as any).variables = [];
  }

  (analysis as any).variables = ((analysis as any).variables as any[]).map((item) => {
    if (typeof item === "string") {
      return { name: item, meaning: item };
    }

    return {
      name: typeof item?.name === "string" ? item.name : "variable",
      meaning:
        typeof item?.meaning === "string" && item.meaning.trim()
          ? item.meaning
          : typeof item?.name === "string"
          ? item.name
          : "algorithm variable",
    };
  });

  if (!Array.isArray((analysis as any).dataStructures)) {
    (analysis as any).dataStructures = inferDataStructuresFromCategory(analysis.category);
  }

  if (!Array.isArray((analysis as any).steps) || (analysis as any).steps.length === 0) {
    throw new Error("Invalid analyzer response: missing steps");
  }

  (analysis as any).steps = ((analysis as any).steps as any[]).map((step, index, arr) => ({
    step: typeof step?.step === "number" ? step.step : index + 1,
    description:
      typeof step?.description === "string" && step.description.trim()
        ? step.description
        : `Step ${index + 1}`,
    caption:
      typeof step?.caption === "string" && step.caption.trim()
        ? step.caption
        : typeof step?.description === "string" && step.description.trim()
        ? step.description
        : `Step ${index + 1}`,
    variables:
      step?.variables && typeof step.variables === "object" && !Array.isArray(step.variables)
        ? step.variables
        : {},
    highlight: Array.isArray(step?.highlight) ? step.highlight : [],
    action:
      typeof step?.action === "string" && step.action.trim()
        ? step.action
        : index === 0
        ? "initialize"
        : index === arr.length - 1
        ? "complete"
        : "process",
    important:
      typeof step?.important === "boolean"
        ? step.important
        : index === 0 || index === arr.length - 1,
    timingMult:
      typeof step?.timingMult === "number" && Number.isFinite(step.timingMult)
        ? step.timingMult
        : 1.0,
  }));

  if (!Array.isArray((analysis as any).edgeCases) || (analysis as any).edgeCases.length === 0) {
    (analysis as any).edgeCases = [
      "Empty input",
      "Single element input",
      "Already solved input",
    ];
  }

  return analysis;
}

function inferDataStructuresFromCategory(category: string): string[] {
  const c = category.toLowerCase();

  if (c.includes("graph")) return ["graph", "array"];
  if (c.includes("tree")) return ["tree"];
  if (c.includes("stack")) return ["stack"];
  if (c.includes("queue")) return ["queue"];
  if (c.includes("linked")) return ["linked list"];
  if (c.includes("dp")) return ["array", "table"];
  if (c.includes("recursion")) return ["call stack"];
  return ["array"];
}

// ═══════════════════════════════════════════════════
// NORMALIZATION — CREATIVE DIRECTION
// Strong fallback so output never becomes empty/generic
// ═══════════════════════════════════════════════════

function normalizeCreativeDirection(
  raw: Partial<CreativeDirection> | undefined,
  analysis: AnalysisResult
): CreativeDirection {
  const fallback = inferCreativeFallback(analysis);

  return {
    metaphor:
      typeof raw?.metaphor === "string" && raw.metaphor.trim()
        ? raw.metaphor
        : fallback.metaphor,

    sceneName:
      typeof raw?.sceneName === "string" && raw.sceneName.trim()
        ? raw.sceneName
        : fallback.sceneName,

    heroCharacter: {
      type:
        typeof raw?.heroCharacter?.type === "string" && raw.heroCharacter.type.trim()
          ? raw.heroCharacter.type
          : fallback.heroCharacter.type,
      look:
        typeof raw?.heroCharacter?.look === "string" && raw.heroCharacter.look.trim()
          ? raw.heroCharacter.look
          : fallback.heroCharacter.look,
      personality:
        typeof raw?.heroCharacter?.personality === "string" &&
        raw.heroCharacter.personality.trim()
          ? raw.heroCharacter.personality
          : fallback.heroCharacter.personality,
      idleAnimation:
        typeof raw?.heroCharacter?.idleAnimation === "string" &&
        raw.heroCharacter.idleAnimation.trim()
          ? raw.heroCharacter.idleAnimation
          : fallback.heroCharacter.idleAnimation,
      moveAnimation:
        typeof raw?.heroCharacter?.moveAnimation === "string" &&
        raw.heroCharacter.moveAnimation.trim()
          ? raw.heroCharacter.moveAnimation
          : fallback.heroCharacter.moveAnimation,
    },

    environment: {
      setting:
        typeof raw?.environment?.setting === "string" && raw.environment.setting.trim()
          ? raw.environment.setting
          : fallback.environment.setting,
      backgroundLayers:
        Array.isArray(raw?.environment?.backgroundLayers) &&
        raw!.environment!.backgroundLayers.length > 0
          ? raw!.environment!.backgroundLayers
          : fallback.environment.backgroundLayers,
      ambientEffects:
        Array.isArray(raw?.environment?.ambientEffects) &&
        raw!.environment!.ambientEffects.length > 0
          ? raw!.environment!.ambientEffects
          : fallback.environment.ambientEffects,
    },

    objectMapping:
      raw?.objectMapping && Object.keys(raw.objectMapping).length > 0
        ? raw.objectMapping
        : fallback.objectMapping,

    colorPalette: {
      primary:
        typeof raw?.colorPalette?.primary === "string" && raw.colorPalette.primary.trim()
          ? raw.colorPalette.primary
          : fallback.colorPalette.primary,
      secondary:
        typeof raw?.colorPalette?.secondary === "string" && raw.colorPalette.secondary.trim()
          ? raw.colorPalette.secondary
          : fallback.colorPalette.secondary,
      accent:
        typeof raw?.colorPalette?.accent === "string" && raw.colorPalette.accent.trim()
          ? raw.colorPalette.accent
          : fallback.colorPalette.accent,
      danger:
        typeof raw?.colorPalette?.danger === "string" && raw.colorPalette.danger.trim()
          ? raw.colorPalette.danger
          : fallback.colorPalette.danger,
      background:
        typeof raw?.colorPalette?.background === "string" && raw.colorPalette.background.trim()
          ? raw.colorPalette.background
          : fallback.colorPalette.background,
    },

    domainAnimations:
      Array.isArray(raw?.domainAnimations) && raw.domainAnimations.length > 0
        ? raw.domainAnimations
        : fallback.domainAnimations,

    dramaticMoments:
      Array.isArray(raw?.dramaticMoments) && raw.dramaticMoments.length > 0
        ? raw.dramaticMoments
        : fallback.dramaticMoments,

    nonNegotiableVisualRequirements:
      Array.isArray(raw?.nonNegotiableVisualRequirements) &&
      raw.nonNegotiableVisualRequirements.length > 0
        ? raw.nonNegotiableVisualRequirements
        : fallback.nonNegotiableVisualRequirements,
  };
}

function inferCreativeFallback(analysis: AnalysisResult): CreativeDirection {
  const algorithm = analysis.algorithmName.toLowerCase();
  const category = analysis.category.toLowerCase();

  if (algorithm.includes("trapping rain water") || algorithm.includes("rain water")) {
    return {
      metaphor:
        "A storm-water engineer scans a rainy city skyline and measures how much water gets trapped between taller buildings after the storm.",
      sceneName: "Rainy Skyline Survey",
      heroCharacter: {
        type: "storm-water engineer",
        look: "small hooded engineer with a glowing survey lamp and blue raincoat",
        personality: "patient, observant, methodical",
        idleAnimation: "stands on a rooftop while raincoat flutters and survey lamp glows softly",
        moveAnimation: "glides roof-to-roof with a measured scanning beam and light arc",
      },
      environment: {
        setting:
          "A moody rainy city at dusk with dark wet buildings forming the skyline. Water gathers between taller structures while distant storm clouds and reflective puddles make the whole scene feel alive and physical.",
        backgroundLayers: [
          "far skyline silhouettes with occasional lightning flicker",
          "mid-layer rainy apartment towers with glowing windows",
          "near wet rooftops, puddles, gutters, and visible water basins between buildings",
        ],
        ambientEffects: [
          "steady rain streaks",
          "small puddle ripples",
          "soft mist near the base of buildings",
        ],
      },
      objectMapping: {
        array: "a row of wet buildings whose heights match the input values",
        "array values": "building heights",
        leftPointer: "green survey beacon on the left roofline",
        rightPointer: "red survey beacon on the right roofline",
        leftMax: "highest left retaining wall discovered so far",
        rightMax: "highest right retaining wall discovered so far",
        result: "blue water volume visibly trapped between taller buildings",
      },
      colorPalette: {
        primary: "#4f8cff",
        secondary: "#5b6c8f",
        accent: "#7dd3fc",
        danger: "#ff6b6b",
        background: "#0b1020",
      },
      domainAnimations: [
        "rain falls continuously across the skyline",
        "trapped water rises smoothly between buildings with translucent blue fill",
        "new water capture creates a ripple ring and splash droplets",
      ],
      dramaticMoments: [
        "The first visible water pocket forms between two taller buildings",
        "Halfway through, the engineer realizes one boundary is strong enough to trap more water",
        "A deep basin fills dramatically after both walls are confirmed",
        "At the end, the full skyline reveals every trapped water pocket at once",
      ],
      nonNegotiableVisualRequirements: [
        "Show actual rain in the environment, not just blue bars",
        "Show buildings as the main representation of heights",
        "Show trapped water physically filling the valleys between buildings",
        "Show left and right scanning markers moving across rooftops",
      ],
    };
  }

  if (algorithm.includes("frog jump")) {
    return {
      metaphor:
        "A determined frog plans careful jumps across stones to reach the far side while spending the least energy possible.",
      sceneName: "Moonlit Frog Crossing",
      heroCharacter: {
        type: "frog",
        look: "bright green frog with big eyes and tiny scarf",
        personality: "careful, smart, adventurous",
        idleAnimation: "blinks, crouches gently, and bobs in place on a stone",
        moveAnimation: "leaps in a smooth arc with a tiny sparkle trail",
      },
      environment: {
        setting:
          "A moonlit pond stretches across the scene with stepping stones representing choices. Reeds sway at the edge, water glows softly, and the destination shines invitingly on the far side.",
        backgroundLayers: [
          "dark blue night sky with moon and fireflies",
          "soft pond mist and distant reeds",
          "foreground stepping stones over shimmering water",
        ],
        ambientEffects: [
          "fireflies drifting slowly",
          "water shimmer under moonlight",
          "tiny ripple circles around stones",
        ],
      },
      objectMapping: {
        array: "a sequence of stepping stones or lily pads",
        index: "stone position in the crossing path",
        frog: "the hero making the jump decisions",
        dp: "energy markings shown above stones",
        result: "the final successful crossing path",
      },
      colorPalette: {
        primary: "#7ed957",
        secondary: "#60a5fa",
        accent: "#facc15",
        danger: "#fb7185",
        background: "#07111f",
      },
      domainAnimations: [
        "frog jumps in smooth arcs from stone to stone",
        "landing creates water ripples around the destination stone",
        "best path stones glow brighter once chosen",
      ],
      dramaticMoments: [
        "The frog commits to the first meaningful jump",
        "Midway, the smarter cheaper path becomes clear",
        "A difficult long jump creates tension before landing",
        "The frog reaches the final stone and celebrates",
      ],
      nonNegotiableVisualRequirements: [
        "Show an actual frog as the hero character",
        "Show stones or lily pads as the positions",
        "Show arc-based jumps between positions",
        "Show visible destination success at the far side",
      ],
    };
  }

  if (algorithm.includes("bubble sort")) {
    return {
      metaphor:
        "A patient bubble keeper guides heavier and lighter bubbles through water until the whole column settles into order.",
      sceneName: "Underwater Bubble Lab",
      heroCharacter: {
        type: "bubble keeper",
        look: "tiny diver with glowing visor and bubble wand",
        personality: "gentle, patient, precise",
        idleAnimation: "floats softly while air bubbles drift upward",
        moveAnimation: "swims side-to-side leaving a faint bubble trail",
      },
      environment: {
        setting:
          "A calm underwater chamber where values appear as floating bubble-columns that gently wobble with the current. Larger values feel heavier and more dramatic when they move.",
        backgroundLayers: [
          "deep ocean gradient with drifting particles",
          "midwater plants and soft current lines",
          "foreground bubble-columns resting above a glowing seabed",
        ],
        ambientEffects: [
          "small rising bubbles",
          "soft water caustic light",
          "gentle suspended particles",
        ],
      },
      objectMapping: {
        array: "floating bubble-columns or rounded water capsules",
        compare: "a bright comparison beam between neighboring bubbles",
        swap: "two bubbles crossing in curved underwater arcs",
        sorted: "settled bubbles glowing cool green-blue",
        result: "a clean ordered line of settled bubbles",
      },
      colorPalette: {
        primary: "#38bdf8",
        secondary: "#818cf8",
        accent: "#facc15",
        danger: "#fb7185",
        background: "#06131f",
      },
      domainAnimations: [
        "neighbor comparisons create soft sonar pulses",
        "swaps happen as curved underwater crossings",
        "sorted region settles with a calming green wave",
      ],
      dramaticMoments: [
        "The first swap proves the bubbles are out of order",
        "Midway, a large bubble drifts into a more correct place",
        "The last major swap calms the remaining disorder",
        "A final cool wave confirms everything is sorted",
      ],
      nonNegotiableVisualRequirements: [
        "Do not use plain rectangle bars as the only visual",
        "Use a bubble or underwater fluid theme clearly",
        "Show swaps as curved floating motion, not teleporting",
        "Show the sorted region visually settling into calm order",
      ],
    };
  }

  if (algorithm.includes("binary search")) {
    return {
      metaphor:
        "A detective narrows a suspect lineup by repeatedly checking the middle clue until the target is found.",
      sceneName: "Noir Search Room",
      heroCharacter: {
        type: "detective",
        look: "noir detective with hat, trench coat, and flashlight",
        personality: "focused, clever, efficient",
        idleAnimation: "stands still while flashlight cone sways gently",
        moveAnimation: "spotlight slides sharply to the next candidate",
      },
      environment: {
        setting:
          "A dark noir investigation room displays a lineup of suspects as ordered cards. A narrow spotlight shrinks the search range until only the true target remains.",
        backgroundLayers: [
          "dim wall with blinds-shadow pattern",
          "floating dust in the light beam",
          "foreground suspect cards in a clean ordered row",
        ],
        ambientEffects: [
          "slow dust motes in spotlight",
          "soft flicker from a hanging lamp",
        ],
      },
      objectMapping: {
        array: "a sorted suspect lineup",
        mid: "the suspect under the central spotlight",
        left: "left boundary marker",
        right: "right boundary marker",
        result: "the confirmed suspect card glowing gold",
      },
      colorPalette: {
        primary: "#f59e0b",
        secondary: "#94a3b8",
        accent: "#fde68a",
        danger: "#ef4444",
        background: "#0f0f12",
      },
      domainAnimations: [
        "spotlight narrows around the active range",
        "eliminated half dims and tilts away",
        "found card flashes with a golden reveal",
      ],
      dramaticMoments: [
        "The first elimination cuts the search space in half",
        "Midway, the spotlight range becomes noticeably tight",
        "A near miss adds tension before the final check",
        "The target is found with a bright gold pulse",
      ],
      nonNegotiableVisualRequirements: [
        "Show a narrowing spotlight or range bracket",
        "Show eliminated halves fading out visually",
        "Show the middle element as the key suspect each turn",
        "Show a dramatic found moment when the target is reached",
      ],
    };
  }

  if (category.includes("graph")) {
    return {
      metaphor:
        "A navigator explores a living map, lighting roads and destinations while searching for the best route forward.",
      sceneName: "Glowing Route Map",
      heroCharacter: {
        type: "navigator",
        look: "small glowing map pin with a scanning pulse",
        personality: "curious, steady, strategic",
        idleAnimation: "pulses softly at the current node",
        moveAnimation: "travels along roads as a moving light packet",
      },
      environment: {
        setting:
          "A dark map-like interface glows with roads, nodes, and route pulses. Explored regions awaken gradually while the best path becomes visually brighter than the rest.",
        backgroundLayers: [
          "dim grid map with faint coordinates",
          "soft city-light clusters",
          "foreground roads and glowing nodes",
        ],
        ambientEffects: [
          "network pulse glows",
          "tiny moving data particles on edges",
        ],
      },
      objectMapping: {
        graph: "a live city map or route network",
        node: "city or checkpoint marker",
        edge: "road or route segment",
        queue: "frontier panel of next destinations",
        result: "highlighted final route",
      },
      colorPalette: {
        primary: "#60a5fa",
        secondary: "#a78bfa",
        accent: "#22d3ee",
        danger: "#fb7185",
        background: "#06101d",
      },
      domainAnimations: [
        "nodes pulse as they are visited",
        "roads draw themselves during traversal",
        "final path glows brighter than all other routes",
      ],
      dramaticMoments: [
        "The first expansion lights nearby destinations",
        "Midway, the explored region forms a readable frontier",
        "A key shortest-path update changes the route strategy",
        "The final route glows from start to finish",
      ],
      nonNegotiableVisualRequirements: [
        "Show nodes as actual places or checkpoints",
        "Show edge traversal as movement along connections",
        "Show visited vs unvisited regions clearly",
        "Show final path as a distinguished glowing route",
      ],
    };
  }

  return {
    metaphor:
      `A focused problem-solver works through ${analysis.algorithmName} step by step inside a cinematic scene that reveals why each decision matters.`,
    sceneName: `${analysis.algorithmName} Studio`,
    heroCharacter: {
      type: "algorithm guide",
      look: "small glowing guide with expressive eyes and a light pointer staff",
      personality: "smart, patient, educational",
      idleAnimation: "breathes softly and emits a faint glow pulse",
      moveAnimation: "slides or hops smoothly toward the active region",
    },
    environment: {
      setting:
        "A dark cinematic data workshop reshapes itself around the algorithm's state. The scene uses depth, glow, and meaningful objects instead of generic flat UI blocks.",
      backgroundLayers: [
        "far atmospheric gradient with subtle texture",
        "mid-layer geometric structures related to the problem",
        "foreground algorithm objects and state markers",
      ],
      ambientEffects: [
        "soft particles drifting across the scene",
        "gentle glow pulses around active regions",
      ],
    },
    objectMapping: {
      input: "problem-specific physical objects instead of abstract boxes",
      activeState: "a bright highlighted focus state",
      result: "a clearly resolved final structure or target state",
    },
    colorPalette: {
      primary: "#60a5fa",
      secondary: "#a78bfa",
      accent: "#22d3ee",
      danger: "#fb7185",
      background: "#0b1020",
    },
    domainAnimations: [
      "active objects glow and step into focus",
      "major state changes create visible motion, not instant teleports",
      "completion resolves into a calm final reveal",
    ],
    dramaticMoments: [
      "The first key operation reveals how the algorithm behaves",
      "The midpoint clarifies the algorithm's strategy",
      "The biggest state change becomes the emotional peak",
      "The completion moment resolves the whole scene cleanly",
    ],
    nonNegotiableVisualRequirements: [
      "Do not make the whole visualization generic flat boxes",
      "Show a visible hero guide or active character marker",
      "Show a real environment with at least three visual layers",
      "Show one domain-specific animation that fits this algorithm's behavior",
    ],
  };
}

// ═══════════════════════════════════════════════════
// GEMINI CALLER
// ═══════════════════════════════════════════════════

async function callGeminiOnce(
  apiKey: string,
  model: string,
  prompt: string
): Promise<AnalyzerOutput> {
  const client = new GoogleGenAI({ apiKey });

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.25,
      responseMimeType: "application/json",
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  const text = response.text;

  if (!text || !text.trim()) {
    throw new Error(`Empty response from Gemini model ${model}`);
  }

  return parseAnalyzerOutput(text);
}

async function runGeminiAnalyzer(prompt: string): Promise<AnalyzerOutput> {
  const keys = getGeminiApiKeys();

  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      for (const key of keys) {
        try {
          const result = await callGeminiOnce(key, model, prompt);

          console.log(
            `[Analyzer] ✅ Success via ${model} (attempt ${attempt})`
          );

          return result;
        } catch (error) {
          lastError = error;

          console.warn(
            `[Analyzer] Failed via ${model} (attempt ${attempt}):`,
            error instanceof Error ? error.message : String(error)
          );

          if (isRetryableGeminiError(error)) {
            await sleep(700 * attempt);
            continue;
          }
        }
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini analyzer attempts failed");
}

// ═══════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════

export async function analyzeCode(
  code: string,
  language: string
): Promise<AnalyzerOutput> {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    throw new Error("No code provided for analysis");
  }

  const prompt = buildAnalyzerPrompt(trimmedCode, language);

  console.log("[Analyzer] Starting Gemini-only analysis...");
  console.log("[Analyzer] Language:", language);
  console.log("[Analyzer] Code length:", trimmedCode.length);

  const result = await runGeminiAnalyzer(prompt);

  console.log(
    `[Analyzer] Analysis complete: ${result.analysis.algorithmName} | ` +
      `${result.analysis.steps.length} steps | ` +
      `Scene: ${result.creativeDirection.sceneName}`
  );

  return result;
}