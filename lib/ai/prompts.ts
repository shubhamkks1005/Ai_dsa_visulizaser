// lib/ai/prompts.ts

import type { AnalysisResult } from "@/types";
import type { CreativeDirection } from "@/lib/ai/analyzer";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type TemplateType =
  | "array"
  | "graph"
  | "tree"
  | "dp"
  | "stackqueue"
  | "recursion";

export interface PromptArtifacts {
  templateType: TemplateType;
  fullPrompt: string;
  compactPrompt: string;
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════

export function generatePromptArtifacts(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): PromptArtifacts {
  const templateType = inferTemplateType(analysis);
  const fullPrompt = buildFullPersonalizedPrompt(
    analysis,
    creativeDirection,
    templateType
  );
  const compactPrompt = buildCompactPrompt(
    analysis,
    creativeDirection,
    templateType
  );

  return {
    templateType,
    fullPrompt,
    compactPrompt,
  };
}

function inferPhaseName(analysis: AnalysisResult): string {
  const name = safe(analysis.algorithmName).toLowerCase();
  const category = safe(analysis.category).toLowerCase();

  if (name.includes("bubble sort")) return "Comparison Pass";
  if (name.includes("merge sort")) return "Split & Merge";
  if (name.includes("quick sort")) return "Partition";
  if (name.includes("binary search")) return "Range Search";
  if (name.includes("frog")) return "Jump Planning";
  if (name.includes("rain water")) return "Boundary Scan";
  if (name.includes("dijkstra")) return "Path Relaxation";
  if (name.includes("bfs")) return "Level Expansion";
  if (name.includes("dfs")) return "Deep Traversal";

  if (category.includes("sorting")) return "Sorting Pass";
  if (category.includes("graph")) return "Graph Traversal";
  if (category.includes("dp")) return "State Building";
  if (category.includes("tree")) return "Tree Traversal";
  if (category.includes("binary search")) return "Range Reduction";
  if (category.includes("two pointer")) return "Pointer Scan";
  if (category.includes("recursion")) return "Recursive Call";
  if (category.includes("backtracking")) return "Path Exploration";
  if (category.includes("greedy")) return "Greedy Selection";
  if (category.includes("stack")) return "Stack Operation";
  if (category.includes("queue")) return "Queue Operation";

  return "Processing";
}

export function buildFullPersonalizedPrompt(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection,
  templateType: TemplateType = inferTemplateType(analysis)
): string {
  const steps = getSteps(analysis);
  const variables = getVariables(analysis);
  const dataStructures = getDataStructures(analysis);
  const inputSize = estimateInputSize(analysis.inputExample, steps.length);
  const detailLevel = inferDetailLevel(inputSize);
  const stats = inferStats(analysis);
  const objectMapping = normalizeObjectMapping(creativeDirection.objectMapping);
  const colorMeanings = buildSemanticColorMap(creativeDirection);
  const categoryRules = getCategorySpecificRules(analysis);
  const personality = inferAlgorithmPersonality(analysis);
  const domain = inferDomain(analysis, creativeDirection);
  const sceneMaterials = inferMaterialSystem(analysis, creativeDirection);
  const voiceLines = buildAlgorithmDialogue(analysis, creativeDirection);
  const stepActionSet = Array.from(new Set(steps.map((step) => step.action)));
  const currentPhaseName = inferPhaseName(analysis);

  return `
You are an Algorithm Visualization Generator AI.

When given this analyzed algorithm specification, generate a SINGLE self-contained HTML file.

You are an Algorithm Visualization Scene Generator AI.

═══════════════════════════════════════════════════════════
PRIMARY OBJECTIVE
═══════════════════════════════════════════════════════════
Generate a JSON object with ONLY the scene-specific parts for an algorithm visualization.

The layout, controls, caption engine, stats bar, playback engine, and animation library
are ALREADY BUILT. You must NOT recreate them.

You ONLY generate:
  1. customCSS — scene-specific styling (colors, backgrounds, themed objects)
  2. sceneHTML — scene objects HTML (buildings, frog, nodes, grid, etc.)
  3. steps — precomputed array of ALL algorithm steps
  4. renderScene — JavaScript function that updates the scene per step

═══════════════════════════════════════════════════════════
PREBUILT SYSTEM — DO NOT RECREATE
═══════════════════════════════════════════════════════════
The following are ALREADY BUILT and available in the page.
Do NOT recreate them. Only CALL them.

Fixed UI Elements (already in DOM):
  #stats-bar      — algorithm name, category, stat counters
  #scene-area     — outer scene wrapper
  #scene-content  — YOUR scene HTML goes inside here
  #caption-bar    — caption text display (word-by-word engine)
  #controls-bar   — playback controls (Play/Pause/Next/Prev/Reset/Speed)
  #step-counter   — shows "X / Y" automatically
  #progress-fill  — progress bar (auto-updated)

Fixed Functions (call directly in renderScene):
  setCaption(text, important)         — updates caption
  updateStat(key, value)              — updates a stat counter
  updateStepCounter(current, total)   — updates step display
  updateVariables(vars)               — bulk update stats from variables object
  clearAllAnimations(containerId)     — reset all animations in container

Available Animation Functions (call by name with element ID):
  MOVEMENT:
    moveTo(el, x, y, duration)
    moveArc(el, fromX, fromY, toX, toY, duration)
    arcJump(el, fromX, fromY, toX, toY, duration)
    springTo(el, x, y, duration)
    slideIn(el, direction, duration)
    slideOut(el, direction, duration)

  VISIBILITY:
    fadeIn(el, duration)
    fadeOut(el, duration)
    fadeInUp(el, duration)
    fadeOutDown(el, duration)
    blink(el, times)

  GLOW / HIGHLIGHT:
    highlight(el, color, duration)
    glowPulse(el, color, duration)
    spotlight(el, duration)
    neonFlicker(el, color, duration)
    rimLight(el, color, duration)

  SCALE / TRANSFORM:
    popIn(el, duration)
    popOut(el, duration)
    breathe(el, duration)
    squashAndStretch(el, duration)
    scaleUp(el, scale, duration)
    scaleDown(el, scale, duration)

  SHAKE / WOBBLE:
    shake(el, intensity, duration)
    wobble(el, duration)
    jello(el, duration)
    vibrate(el, duration)

  TEXT:
    typeWords(el, text, speed)
    countUp(el, from, to, duration)
    dramaticText(text, duration)

  PARTICLES:
    splashBurst(el, color, count)
    confettiBurst(el)
    ripple(el, color)
    shockwave(el)
    sparkle(el, count)

  WATER / FLUID:
    waterFill(el, percentage, duration)
    waterRipple(el, duration)
    waterDrop(x, y, duration)
    rain(containerId, intensity)

  STATE MARKERS:
    markActive(el)
    markSorted(el)
    markVisited(el)
    markCurrent(el)
    markError(el)
    clearMark(el)

  CHARACTER:
    characterIdle(el)
    characterJump(el, fromX, fromY, toX, toY)
    characterCelebrate(el)

  COMPLETION:
    celebrationWave(containerId)
    victoryBurst(el)
    goldOutline(el)
    finalReveal(el)

  UTILITY:
    delay(ms)
    stagger(elementIds[], fn, delayMs)
    clearAllAnimations(containerId)

Available CSS Utility Classes (use in sceneHTML):
    .scene-element    — absolute positioned with smooth transitions
    .scene-bar        — bar chart element (position absolute, bottom-aligned)
    .scene-node       — circular node for graphs
    .scene-card       — styled card element
    .scene-pointer    — pointer/marker element
    .scene-label      — small label text
    .scene-hero       — hero character element (large, z-index high)
    .scene-water      — water fill element
    .scene-connection — line/edge between nodes
    .scene-row        — flex row layout for scene
    .scene-centered   — centered flex layout
    .scene-absolute   — full absolute positioned layer
    .scene-bg-layer   — background layer
    .scene-particles  — particles container
    .scene-overlay    — overlay layer

═══════════════════════════════════════════════════════════
OUTPUT FORMAT — Generate ONLY this JSON
═══════════════════════════════════════════════════════════
Output ONLY a valid JSON object with these exact 4 fields:

{
  "customCSS": "All scene-specific CSS here. Use #scene-content as parent. Define colors, backgrounds, element shapes, custom keyframes if needed.",

  "sceneHTML": "All scene object HTML here. Goes inside #scene-content div. Give each element a unique ID. Use scene utility classes.",

  "steps": [
    {
      "step": 1,
      "action": "initialize",
      "caption": "Human readable explanation of this step with proper spaces.",
      "variables": { "var1": "value1" },
      "highlight": [0],
      "important": true,
      "timingMult": 0.5
    }
  ],

  "renderScene": "function renderScene(step, index) { /* Use prebuilt animation functions to update scene. Call highlight(), shake(), waterFill(), arcJump() etc by name. Update stats with updateStat(). Do NOT recreate controls or caption. */ }"
}

CRITICAL JSON RULES:
1. Output ONLY the JSON object — no text before or after
2. All string values on ONE line (no actual newlines)
3. Use \\n for newlines inside string values
4. No trailing commas
5. No comments inside JSON
6. renderScene must be a complete function definition as a string
7. steps array must have ALL ${getSteps(analysis).length} steps
8. Each step must have: step, action, caption, variables, highlight, important, timingMult
9. customCSS must scope styles to #scene-content
10. sceneHTML elements must have unique IDs for animation targeting

═══════════════════════════════════════════════════════════
THE 48-SECTION PERSONALIZED SPEC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — IDENTITY & ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1 — Algorithm / Problem Identity
────────────────────────────────────────
- ALGORITHM/PROBLEM NAME: ${safe(analysis.algorithmName)}
- CATEGORY: ${safe(analysis.category)}
- FAMOUS PROBLEM: ${inferFamousProblem(analysis)}
- LANGUAGE DETECTED: ${safe(analysis.language)}
- FUNCTION NAME(S): ${inferFunctionNames(analysis)}
- TIME COMPLEXITY: ${safe(analysis.timeComplexity)}
- SPACE COMPLEXITY: ${safe(analysis.spaceComplexity)}
- CORE GOAL (plain language): ${safe(analysis.description)}
- PHYSICAL / REAL-WORLD INTERPRETATION: ${safe(analysis.physicalInterpretation)}
- INPUT (example from code): ${safe(analysis.inputExample)}
- EXPECTED OUTPUT: ${safe(analysis.expectedOutput)}
- KEY INSIGHT: ${safe(analysis.keyInsight)}

SECTION 2 — Problem Semantics & Real-World Interpretation
─────────────────────────────────────────────────────────
- What do input elements represent?
  ${buildInputMeaning(analysis, creativeDirection)}
- What do indices/positions represent?
  ${buildIndexMeaning(analysis, creativeDirection)}
- What do pointers/variables represent in the scene?
  ${buildPointerMeaning(analysis, creativeDirection)}
- What is the PROCESS physically?
  ${buildPhysicalProcessMeaning(analysis, creativeDirection)}
- What is the RESULT physically?
  ${buildResultMeaning(analysis, creativeDirection)}
- What do auxiliary data structures represent?
  ${buildAuxiliaryMeaning(analysis, creativeDirection)}

SECTION 3 — Data Structures to Visualize (Semantic Mapping)
───────────────────────────────────────────────────────────
PRIMARY STRUCTURE:
- Name: ${inferPrimaryStructure(analysis)}
- Visual form: ${inferPrimaryVisualForm(analysis, creativeDirection)}
- How values map to visuals: ${inferValueToVisualMapping(analysis, creativeDirection)}

SECONDARY STRUCTURES (list ALL):
${buildSecondaryStructures(analysis, creativeDirection)}

TRACK THESE AT EVERY STEP:
${buildTrackedVariablesList(analysis)}

SECTION 4 — Step-by-Step Execution Trace (Story + Why)
─────────────────────────────────────────────────────
${buildDetailedStepTrace(analysis, creativeDirection)}

SECTION 5 — Edge Cases to Handle
────────────────────────────────
${buildEdgeCaseSection(analysis, creativeDirection)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — LAYOUT & STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 6 — Visual Design Specs (Base Style Tokens)
──────────────────────────────────────────────────
LAYOUT: ${inferLayoutDescription(templateType, analysis)}
ELEMENT SHAPE: ${inferElementShape(analysis, creativeDirection)}
ELEMENT SIZE: ${inferElementSizeRule(templateType, inputSize)}
FONT: ${inferTypography(analysis, creativeDirection)}

COLOR PALETTE:
${buildColorPaletteLines(creativeDirection)}

TIMING TIERS:
- Fast: 120-150ms → highlight change, small glow shift, pointer focus
- Medium: 300-400ms → pointer movement, counter update, range shift
- Slow: 500-700ms → swap, merge, partition, jump, route traversal
- Epic: 1000-1200ms → first reveal, major insight, final completion moment

UI LAYOUT:
- Top-left: ${safe(analysis.algorithmName)} + live phase label (${currentPhaseName})
- Top-center/right: ${stats.map((s) => s.label).join(", ")}
- Center: main ${templateType} scene with cinematic depth
- Bottom: word-by-word explanatory caption
- Right sidebar: legend + variables + state summary + optional history
- Bottom bar: Reset / Prev / Play-Pause / Next / Speed

SECTION 7 — Object Mapping & Scene Vocabulary
────────────────────────────────────────────
SCENE NAME: ${safe(creativeDirection.sceneName)}

For EACH abstract element, choose a CONCRETE visual:
${formatObjectMapping(objectMapping)}

SCENE ASSETS:
${buildSceneAssets(analysis, creativeDirection)}

NO-GENERIC RULE:
The main visualization must visually read as:
"${safe(creativeDirection.metaphor)}"
Do NOT collapse this into plain colored boxes unless absolutely impossible.

SECTION 8 — Layout Engine & Positioning Math
───────────────────────────────────────────
COORDINATE SYSTEM: ${inferCoordinateSystem(templateType)}

SPACING FORMULAS:
${buildSpacingFormulas(templateType, inputSize)}

VIEWPORT RULES:
- If elements do not fit: ${inferViewportBehavior(templateType, inputSize)}
- Camera bounds: min zoom 0.82, max zoom 1.18
- Auto-focus: center active region on meaningful operations, not on every trivial micro-step

COLLISION AVOIDANCE:
- Labels must avoid overlapping values or hero character
- Pointers must offset vertically when multiple are active
- Edge labels must not sit directly on top of nodes
- Sidebar width must stay stable even during value changes

PANEL SIZING:
- Right sidebar: 270px to 300px
- Bottom caption: minimum 84px height
- Stats bar: responsive grid of compact stat cards

SECTION 9 — Input Size Adaptation Rules
──────────────────────────────────────
n < 15:
- Full cinematic detail
- All labels visible
- All ambient effects enabled

15 < n < 50:
- Slightly smaller elements
- Reduce decorative particle frequency
- Keep educational captions but shorten repeated notes

50 < n < 100:
- Thin elements / smaller labels
- Faster default timings
- Skip low-value repetitive annotations

n > 100:
- Simplified rendering
- Windowing / scroll / aggregation if needed
- Only major operations emphasized

CURRENT INPUT SIZE: n ≈ ${inputSize}
DETAIL LEVEL FOR THIS INPUT: ${detailLevel}

SECTION 10 — State Initialization & Setup Logic
──────────────────────────────────────────────
BUILD SEQUENCE:
1. Background + atmosphere appears for "${safe(creativeDirection.sceneName)}"
2. Main structure enters using ${inferIntroEntryMotion(analysis, creativeDirection)}
3. Labels and indices fade in
4. Hero character appears: ${safe(creativeDirection.heroCharacter.look)}
5. Secondary markers / pointers / helper guides initialize
6. Sidebar and stats start at zero / base values
7. First caption introduces the problem in plain language
8. Controls become enabled after the intro build

INITIAL VALUES:
${buildInitialValues(analysis)}

ANIMATION FOR INITIAL BUILD:
- Elements enter: ${inferIntroEntryMotion(analysis, creativeDirection)}
- Stagger: 55-80ms between primary elements
- Total intro build time: 900-1400ms

PRE-COMPUTATION SANITY CHECK:
- If steps > 2000: simplify repetitive visuals
- If steps > 5000: show large-input simplified mode message
- For this algorithm: total steps = ${steps.length}

SECTION 11 — Semantic Color System
─────────────────────────────────
${colorMeanings}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — ANIMATION CORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 12 — Animation Physics & Easing
──────────────────────────────────────
- ENTER: scale(0.85) + fade in + slight rise
- EXIT: fade out + scale down + soften glow
- MOVEMENT EASING: cubic-bezier(0.34, 1.56, 0.64, 1)
- SWAP / CROSSING MOTION: ${inferSwapAnimation(analysis, creativeDirection)}
- POINTER MOVEMENT: smooth physical travel, never teleport
- STAGGER RULE: 70-90ms domino delay when many elements update
- TIMING HIERARCHY must respect each step's timingMult field

SECTION 13 — Creation & Destruction Animations
─────────────────────────────────────────────
CREATION RULES:
- Main objects appear as ${inferCreationSequence(analysis, creativeDirection)}
- Hero appears with a brief character reveal and idle settle
- Auxiliary panels slide in with low drama so main scene stays primary

DESTRUCTION RULES:
- Removed / rejected / eliminated objects use ${inferDestructionSequence(analysis, creativeDirection)}
- Deleted links retract physically
- Merged objects must visually combine rather than instantly replacing one another

SECTION 14 — Value Change Animations
───────────────────────────────────
- Numeric changes should animate old → new visibly
- Live counters in the stats bar should count upward, not snap
- Updated values in the scene should briefly glow, then settle
- If value changes correspond to ${domain}, reinforce that change with domain-specific motion

SECTION 15 — Pointer & Reference Rules
─────────────────────────────────────
${buildPointerRules(analysis, creativeDirection)}

SECTION 16 — Split / Merge / Partition Special Animations
────────────────────────────────────────────────────────
${buildSplitMergeRules(analysis, creativeDirection)}

SECTION 17 — 3D Moments / Depth Illusion
───────────────────────────────────────
- Active elements: scale(1.04-1.1), stronger shadow, slight foreground lift
- Inactive elements: mild opacity reduction and subtle blur where appropriate
- Hero character should sit above base elements in z-index
- Finalized / stable regions should feel calmer and more grounded than active zones
- If recursion depth or hierarchy exists, smaller deeper layers should feel physically further away

SECTION 18 — Physical Properties of Elements
───────────────────────────────────────────
- Weight system: larger / more significant values should feel heavier during movement
- Gravity: drops accelerate in, lifts ease out
- Elastic settle: overshoot then relax
- Resistance: hesitation can be shown before a difficult move
- Active scale: 1.06
- Settled scale: 0.98
- Special element scale: 1.12 with accent glow
- Motion should feel ${personality.motionStyle}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — CINEMATIC & FEEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 19 — Conditional Creative Rules (Generic Fallback Engine)
──────────────────────────────────────────────────────────────
${categoryRules}

SECTION 20 — Algorithm Personality / Theme Mapping
────────────────────────────────────────────────
- ALGORITHM PERSONALITY: ${personality.name}
- BEHAVIOR FEEL: ${personality.behavior}
- BACKGROUND STYLE: ${personality.background}
- TYPOGRAPHY FEEL: ${personality.typography}
- ANIMATION FEEL: ${personality.motionStyle}
- VIEWER EMOTION TARGET: ${personality.emotion}

SECTION 21 — Metaphor System (Mandatory)
──────────────────────────────────────
1. METAPHOR SENTENCE:
${safe(creativeDirection.metaphor)}

2. OBJECT MAPPING:
${formatObjectMapping(objectMapping)}

3. OPERATION MAPPING:
${buildOperationMapping(analysis, creativeDirection)}

RULE:
The metaphor must explain WHY the algorithm behaves this way, not just decorate it.

SECTION 22 — Creative Intelligence / Non-Generic Rule
───────────────────────────────────────────────────
QUALITY GATE:
- The output is INVALID if it looks like a reusable textbook demo with only colored rectangles
- The output is VALID only if:
  ✅ scene name is visible through environment + objects
  ✅ hero character is visibly present
  ✅ at least one domain-specific animation exists
  ✅ a beginner could roughly guess what is happening from visuals + captions
  ✅ "${safe(creativeDirection.sceneName)}" feels specific to ${safe(analysis.algorithmName)}

MANDATORY NON-NEGOTIABLE REQUIREMENTS:
${creativeDirection.nonNegotiableVisualRequirements
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

SECTION 23 — Tension & Suspense Mechanics
────────────────────────────────────────
- Before key comparisons / decisions, apply a short focus pause
- Use spotlight / accent emphasis on meaningful state changes
- Key decision beam should indicate success/failure when applicable
- CLIMAX MOMENTS:
${creativeDirection.dramaticMoments
  .map((item, index) => `  ${index + 1}. ${item}`)
  .join("\n")}
- Use dramatic pacing on first major insight, midpoint, and completion
- Do not overuse freeze frames

SECTION 24 — High-Speed Visual Effects
─────────────────────────────────────
- Speed lines only for large-distance motion
- Impact flash only for high-value events
- Motion blur only for fast pointer / hero travel
- Stress lines only for heavy / difficult movement
- Exclamation effects:
  ! = major update / swap
  ? = uncertain search
  ✓ = confirmed result
- Shockwave reserved for biggest operation and final reveal

SECTION 25 — Background, Glow, Particles, Trail & Depth
──────────────────────────────────────────────────────
BACKGROUND:
${buildBackgroundGuidance(analysis, creativeDirection)}

GLOW EFFECTS:
- Active state uses ${safe(creativeDirection.colorPalette.accent)} glow
- Important state uses brighter rim lighting
- Final state uses calmer completion pulse

PARTICLE EFFECTS:
${buildParticleGuidance(analysis, creativeDirection)}

TRAIL EFFECTS:
- Hero movement leaves a subtle trail matching ${safe(
    creativeDirection.colorPalette.accent
  )}
- Previous pointer positions fade out gently

DEPTH / LAYERS:
- Background, midground, foreground must remain visually distinct

SECTION 26 — Visual Sound Equivalents
───────────────────────────────────
- Use micro-vibration on active comparisons
- Use ripple at points of important interaction
- Use subtle equalizer / activity bars only if they match the scene tone
- Intensity should reflect algorithm activity, not random noise
- Calm sections should visibly relax

SECTION 27 — Algorithm Emotion & Personality Dialogue
──────────────────────────────────────────────────
ELEMENT EXPRESSIONS:
- Comfortable: calm glow
- Active: brighter focus + mild tension
- Final position: satisfied settle
- Special state: elevated confidence

PROGRESS EMOTION:
- 0-30%: learning / setup
- 30-70%: strategy becomes visible
- 70-90%: urgency and confidence increase
- 90-100%: final resolution

PERSONALITY DIALOGUE (brief optional chat bubbles or dramatic lines):
${voiceLines.map((line) => `- ${line}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — UI, INFO & COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 28 — Caption Box, Stats Bar & Algorithm Header
───────────────────────────────────────────────────
ALGORITHM HEADER:
- Show "${safe(analysis.algorithmName)}"
- Show current phase / operation band
- Use subtle glow consistent with scene colors

STATS BAR:
${stats
  .map(
    (stat) =>
      `- ${stat.label}: live-updated metric using key "${stat.key}" with animated counting`
  )
  .join("\n")}

CAPTION BOX:
- Every step must show an educational caption
- Reveal words progressively
- Important keywords can be bolded in accent color
- Use captions already derived from the analysis step trace

SECTION 29 — Annotation / Explain Mode System
────────────────────────────────────────────
- Provide explain mode toggle
- Use short speech-bubble annotations near active elements
- Good style: conversational, plain English, specific to THIS algorithm
- Early steps = fuller explanation
- Middle = shorter hints
- Late = concise reinforcement
- Max 2 annotations per step

SECTION 30 — Function Call / Recursion Panel
──────────────────────────────────────────
${buildRecursionPanelRules(analysis)}

SECTION 31 — Heatmap, Ghost Trail, Footprints & History
────────────────────────────────────────────────────
- Heatmap toggle: optional but useful
- Ghost trail: show last 2-3 meaningful pointer or hero positions
- Footprints / touch markers: brief and subtle
- Comparison / action history panel:
  show recent operations from this action set:
  ${stepActionSet.join(", ")}

SECTION 32 — Phase Transitions, Intro, Mid-Insight & Failure
──────────────────────────────────────────────────────────
INTRO:
- Start with scene reveal + algorithm title + input overview

PHASE CHANGE:
- If algorithm naturally has phases, show a clean transition title:
  ${inferNaturalPhaseTransitions(analysis)}

MID-ALGORITHM INSIGHT:
- Pause briefly around halfway and reinforce the key idea:
  "${safe(analysis.keyInsight)}"

COMPLETION TRANSITION:
- Zoom out slightly
- Calm the environment
- Present final result clearly

FAILURE CASE:
- If no result / not found / impossible state applies, show clear visual failure without crashing

SECTION 33 — Completion Sequence & Final Stats
────────────────────────────────────────────
COMPLETION SEQUENCE:
1. Final state settles into resolved arrangement
2. Completion wave passes across result region
3. Stats card appears with:
   - Total Steps: ${steps.length}
   - Time Complexity: ${safe(analysis.timeComplexity)}
   - Space Complexity: ${safe(analysis.spaceComplexity)}
   - Output: ${safe(analysis.expectedOutput)}
4. Main result gets one celebratory emphasis
5. Keep final screen stable enough for user inspection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — REALISM & POLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 34 — Domain-Specific Physics Layer
────────────────────────────────────────
DOMAIN DETECTED: ${domain}

Apply these physical rules:
${buildDomainPhysics(analysis, creativeDirection)}

SECTION 35 — Ambient Environment System
──────────────────────────────────────
- Base environment:
  ${safe(creativeDirection.environment.setting)}
- Ambient layers:
${creativeDirection.environment.backgroundLayers
  .map((layer) => `  - ${layer}`)
  .join("\n")}
- Ambient effects:
${creativeDirection.environment.ambientEffects
  .map((effect) => `  - ${effect}`)
  .join("\n")}
- During intense steps, environment should briefly intensify
- During calm steps, environment should relax
- At completion, environment should resolve peacefully

SECTION 36 — Element Texture & Material System
────────────────────────────────────────────
MATERIAL SYSTEM:
${sceneMaterials}

RULE:
Elements should not feel like flat anonymous divs. Material must match the metaphor.

SECTION 37 — Cinematic Lighting System
───────────────────────────────────
- Spotlight follows active region, not the whole screen
- Rim light for active elements in ${safe(creativeDirection.colorPalette.accent)}
- Soft grounded shadows for main objects
- Completion lighting warms / brightens slightly
- Use light to guide attention, not to overwhelm readability

SECTION 38 — Micro Interaction & Idle Animations
──────────────────────────────────────────────
- Hero idle: ${safe(creativeDirection.heroCharacter.idleAnimation)}
- Active idle: subtle breathing and gentle pulse
- Pointers: tiny bob or glow shift
- Background effects: slow continuous life
- Completed scene: almost still, but not dead

SECTION 39 — Dramatic Moment Text System
──────────────────────────────────────
At most 4 dramatic texts:
${creativeDirection.dramaticMoments
  .slice(0, 4)
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

Rules:
- Use large text sparingly
- Center-screen emphasis
- Strong readability
- Never spam this system

SECTION 40 — Environment Transition on Completion
───────────────────────────────────────────────
- Calm ambient effects
- Shift background slightly warmer / cleaner
- Pulse final result once
- Pause briefly before final stats card
- Make completion feel like the end of a short film, not just a stopped animation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — ADVANCED CINEMATIC & INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 41 — Cinematic Camera Dynamics
───────────────────────────────────
- Default = wide shot
- Auto close-up on critical comparison / jump / route update / merge
- Gentle pan when focus region moves
- Small impact shake only on major events
- Dramatic zoom reserved for discovery / finish

SECTION 42 — Post-Processing Film Layer
─────────────────────────────────────
- Subtle bloom on active glow
- Very light film grain overlay
- Mild vignette to keep focus centered
- Chromatic aberration only if the algorithm personality supports aggression / speed
- Keep readability above style

SECTION 43 — Adaptive Timing (Speed Ramping)
──────────────────────────────────────────
Every step should respect its timingMult field.
Use these rules:
- boring / repetitive steps → faster
- first major occurrence → slower
- critical decision → slower
- repetitive same-type runs → slightly faster
- final step → slower for closure

The precomputed steps array MUST include timingMult for every step.

SECTION 44 — Atmospheric Ambient Particles
────────────────────────────────────────
Theme-specific particles should follow this scene:
${buildAmbientParticles(analysis, creativeDirection)}

Rules:
- subtle by default
- stronger only on key events
- completion should settle particles rather than endlessly looping chaos

SECTION 45 — Interactive Inspection Layer
──────────────────────────────────────
- Hover any main element:
  show value + state + metadata if available
- Hover connections / links:
  show relation info if relevant
- Click to pin:
  keep one selected element highlighted
- Optional X-Ray mode:
  show raw variables + step number + structure state without blocking animation

SECTION 46 — State Ghost / Diff Visualization
────────────────────────────────────────────
- Show previous-state ghost subtly behind changed elements
- Highlight changed values
- Show pointer movement trails
- New additions should briefly glow brighter than stable ones
- Diff visualization should support learning, not clutter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — SAFETY & ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 47 — Fail-Safe Fallback System
───────────────────────────────────
Visualization must NEVER blank out.
If something is uncertain:
- still render base layout
- still render main objects
- still render captions
- still keep controls usable

Fallback rules:
- unknown visualization detail → use clean metaphor-consistent substitute
- invalid / empty input → show friendly message in-scene
- failed step → show "step unavailable" gracefully and continue
- no solution → show clear but non-crashing failure state

SECTION 48 — Accessibility & Performance Guardrails
─────────────────────────────────────────────────
ACCESSIBILITY:
- respect prefers-reduced-motion
- pair color with labels / icons / shapes
- keyboard controls:
  Space = Play/Pause
  ← / → = Prev / Next
  R = Reset
  E = Explain mode
  H = Heatmap
  X = X-Ray
- captions / step changes should support aria-live announcements

PERFORMANCE:
- reuse DOM nodes where possible
- prefer transforms over layout thrashing
- keep animation smooth on a normal laptop
- auto-reduce decorative effects if scene becomes too heavy
- avoid memory leaks on replay or reset

═══════════════════════════════════════════════════════════
FINAL SELF-CHECK BEFORE GENERATING HTML
═══════════════════════════════════════════════════════════
✅ Metaphor is visible and specific
✅ Hero character is actually present
✅ Environment has multiple layers
✅ Main data structure uses meaningful visual objects
✅ Steps are precomputed and replayable
✅ Captions are educational and human-readable
✅ Controls exist and work
✅ Keyboard shortcuts exist
✅ Non-negotiable visual requirements are implemented
✅ No blank screen fallback
✅ Output ends with </html>

FINAL REMINDER
═══════════════════════════════════════════════════════════
CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON with 4 fields: customCSS, sceneHTML, steps, renderScene.
2. steps array must have EXACTLY ${getSteps(analysis).length} steps.
3. Each step must have: step, action, caption, variables, highlight, important, timingMult.
4. renderScene must be a complete function: function renderScene(step, index) { ... }
5. renderScene must use the prebuilt animation functions listed above.
6. renderScene must NOT recreate controls, caption, layout, or playback logic.
7. customCSS must scope to #scene-content (do not override body, #app, #stats-bar, etc.)
8. sceneHTML goes inside #scene-content — give each element a unique ID.
9. Captions must be complete sentences with proper spaces between words.
10. Do NOT output full HTML. Do NOT output markdown. ONLY output the JSON object.
11. The scene must be creative and specific to ${safe(analysis.algorithmName)}.
12. Use the creative direction: hero = ${safe(creativeDirection.heroCharacter.type)}, scene = ${safe(creativeDirection.sceneName)}.
`.trim();
}

export function buildCompactPrompt(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection,
  templateType: TemplateType = inferTemplateType(analysis)
): string {
  const steps = getSteps(analysis);
  const variables = getVariables(analysis);
  const objectMapping = normalizeObjectMapping(creativeDirection.objectMapping);

  return `
Generate a JSON object with scene-specific parts for an algorithm visualization.
Controls, layout, caption, stats, playback, and 30+ animation functions are ALREADY BUILT.

Algorithm:
- Name: ${safe(analysis.algorithmName)}
- Category: ${safe(analysis.category)}
- Input: ${safe(analysis.inputExample)}
- Output: ${safe(analysis.expectedOutput)}
- Time: ${safe(analysis.timeComplexity)}
- Steps: ${steps.length} total

Creative Direction:
- Metaphor: ${safe(creativeDirection.metaphor)}
- Scene: ${safe(creativeDirection.sceneName)}
- Hero: ${safe(creativeDirection.heroCharacter.type)} — ${safe(creativeDirection.heroCharacter.look)}
- Environment: ${safe(creativeDirection.environment.setting)}

Object Mapping:
${formatObjectMapping(objectMapping)}

Colors:
- primary: ${safe(creativeDirection.colorPalette.primary)}
- secondary: ${safe(creativeDirection.colorPalette.secondary)}
- accent: ${safe(creativeDirection.colorPalette.accent)}
- danger: ${safe(creativeDirection.colorPalette.danger)}
- background: ${safe(creativeDirection.colorPalette.background)}

Non-Negotiable:
${creativeDirection.nonNegotiableVisualRequirements.map((r, i) => (i + 1) + ". " + r).join("\\n")}

Available Animation Functions (call by name in renderScene):
  Movement: moveTo, moveArc, arcJump, springTo, slideIn, slideOut
  Visibility: fadeIn, fadeOut, fadeInUp, blink
  Glow: highlight, glowPulse, spotlight, neonFlicker
  Scale: popIn, popOut, breathe, scaleUp
  Shake: shake, wobble, jello, vibrate
  Particles: splashBurst, confettiBurst, ripple, sparkle
  Water: waterFill, waterRipple, waterDrop, rain
  State: markActive, markSorted, markVisited, markCurrent, markError, clearMark
  Character: characterIdle, characterJump, characterCelebrate
  Completion: celebrationWave, victoryBurst, goldOutline
  Stats: updateStat(key, value), updateVariables(vars)

CSS Classes: .scene-bar, .scene-node, .scene-hero, .scene-water, .scene-pointer, .scene-label

Steps Data (${steps.length} steps):
${steps.map((s) => s.step + ". [" + s.action + (s.important ? " ★" : "") + "] " + s.caption).join("\\n")}
 
SCENE COMPLETENESS RULES (ABSOLUTELY CRITICAL):

Step 1 — Look at input data length first:
  - If input is array [a,b,c,d,e] → count = 5
  - If input is grid like 9x9 → count = 81
  - If input has stack with 6 elements → count = 6

Step 2 — In sceneHTML, create EXACTLY that many elements:
  - For 5 array items: 5 <div> elements with id="el-0" to "el-4"
  - For 9x9 sudoku: 81 cells with id="cell-0-0" to "cell-8-8"
  - For 6 stack items: 6 <div> elements with id="stack-0" to "stack-5"

Step 3 — In renderScene(), ONLY update existing elements:
  - document.getElementById("el-0").style.background = ...
  - document.getElementById("el-0").textContent = ...
  - DO NOT use innerHTML = "..." in renderScene
  - DO NOT use createElement in renderScene
  - DO NOT use appendChild in renderScene

Step 4 — All elements MUST be visible from step 0:
  - Even if value is 0 or empty, show the slot
  - Empty cells should still render as visible boxes
  - Hidden elements break the visualization

WRONG (don't do this):
  function renderScene(step) {
    document.getElementById("scene-content").innerHTML = "";  // ❌ NEVER
    step.array.forEach(v => {                                 // ❌ NEVER
      var div = document.createElement("div");                // ❌ NEVER
      ...
    });
  }

CORRECT (always do this):
  // sceneHTML has all elements pre-created
  function renderScene(step) {
    step.array.forEach((v, i) => {
      var el = document.getElementById("el-" + i);
      if (el) {
        el.textContent = v;
        el.style.height = (v * 10) + "px";
      }
    });
  }

SCENE SIZING RULES (CRITICAL):
- All scene elements MUST fit inside #scene-content
- Use percentage-based positioning (left: 10%, top: 20%) NOT fixed pixels
- Element width should scale based on count
- NEVER use fixed pixel positions like left: 800px
- Use vw/vh or % units for sizing
- For long arrays, allow flex-wrap: wrap
- Keep margin/padding small (5-10px max)

  
Output ONLY this JSON:
{
  "customCSS": "scene-specific CSS scoped to #scene-content",
  "sceneHTML": "scene objects HTML with unique IDs",
  "steps": [{ step, action, caption, variables, highlight, important, timingMult }],
  "renderScene": "function renderScene(step, index) { use prebuilt animations }"
  SCENE SIZING RULES (CRITICAL):
- All scene elements MUST fit inside #scene-content
- Use percentage-based positioning (left: 10%, top: 20%) NOT fixed pixels
- For arrays/lists, use flex layout with auto wrap
- Element width should scale: width = 100% / count for arrays
- NEVER use fixed pixel positions like left: 800px
- Use vw/vh or % units for sizing
- For long arrays, allow wrapping with flex-wrap: wrap
- Keep margin/padding small (5-10px max)
}

Rules:
- Output ONLY JSON, no markdown, no HTML
- steps must have ALL ${steps.length} steps with proper captions with spaces
- renderScene must use prebuilt animation functions
- Do NOT create controls, caption, layout, or playback logic
- sceneHTML elements must have unique IDs
- customCSS must NOT override body, #app, #stats-bar, #caption-bar, #controls-bar
- Must look specific to ${safe(analysis.algorithmName)}, not generic
`.trim();
}

export function inferTemplateType(analysis: AnalysisResult): TemplateType {
  const category = safe(analysis.category).toLowerCase();
  const ds = getDataStructures(analysis).join(" ").toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();

  if (
    category.includes("graph") ||
    ds.includes("graph") ||
    name.includes("dijkstra") ||
    name.includes("bfs") ||
    name.includes("dfs")
  ) {
    return "graph";
  }

  if (category.includes("tree") || ds.includes("tree")) {
    return "tree";
  }

  if (category.includes("dp") || name.includes("dynamic programming")) {
    return "dp";
  }

  if (
    category.includes("stack") ||
    category.includes("queue") ||
    ds.includes("stack") ||
    ds.includes("queue")
  ) {
    return "stackqueue";
  }

  if (
    category.includes("recursion") ||
    category.includes("backtracking") ||
    ds.includes("call stack") ||
    name.includes("recursion")
  ) {
    return "recursion";
  }

  return "array";
}

// ═══════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════

interface NormalizedStep {
  step: number;
  description: string;
  caption: string;
  variables: Record<string, unknown>;
  highlight: number[];
  action: string;
  important: boolean;
  timingMult: number;
}

interface NormalizedVariable {
  name: string;
  meaning: string;
}

interface StatSpec {
  key: string;
  label: string;
}

function getSteps(analysis: AnalysisResult): NormalizedStep[] {
  const raw = Array.isArray((analysis as any).steps) ? (analysis as any).steps : [];

  return raw.map((step: any, index: number) => ({
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
        : index === raw.length - 1
        ? "complete"
        : "process",
    important:
      typeof step?.important === "boolean"
        ? step.important
        : index === 0 || index === raw.length - 1,
    timingMult:
      typeof step?.timingMult === "number" && Number.isFinite(step.timingMult)
        ? step.timingMult
        : 1,
  }));
}

function getVariables(analysis: AnalysisResult): NormalizedVariable[] {
  const raw = Array.isArray((analysis as any).variables) ? (analysis as any).variables : [];

  return raw.map((item: any) => {
    if (typeof item === "string") {
      return { name: item, meaning: item };
    }

    return {
      name:
        typeof item?.name === "string" && item.name.trim() ? item.name : "variable",
      meaning:
        typeof item?.meaning === "string" && item.meaning.trim()
          ? item.meaning
          : typeof item?.name === "string"
          ? item.name
          : "algorithm variable",
    };
  });
}

function getDataStructures(analysis: AnalysisResult): string[] {
  const raw = Array.isArray((analysis as any).dataStructures)
    ? (analysis as any).dataStructures
    : [];

  return raw.map((item: unknown) => String(item));
}

function safe(value: unknown, fallback = "Not specified"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function compactJSON(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}

function estimateInputSize(inputExample: string, stepCount: number): number {
  const text = safe(inputExample, "");
  const arrayMatches = text.match(/-?\d+/g);

  if (arrayMatches && arrayMatches.length > 0) {
    return arrayMatches.length;
  }

  if (text.includes(",")) {
    return Math.max(2, text.split(",").length);
  }

  return Math.max(2, Math.min(stepCount, 12));
}

function inferDetailLevel(n: number): string {
  if (n < 15) return "full";
  if (n < 50) return "moderate";
  if (n < 100) return "reduced";
  return "simplified";
}

function inferStats(analysis: AnalysisResult): StatSpec[] {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();

  if (category.includes("sorting")) {
    return [
      { key: "comparisons", label: "Comparisons" },
      { key: "swaps", label: "Swaps" },
      { key: "currentStep", label: "Step" },
      { key: "pass", label: "Pass" },
    ];
  }

  if (category.includes("graph")) {
    return [
      { key: "visited", label: "Visited" },
      { key: "frontier", label: "Frontier" },
      { key: "distance", label: "Best Distance" },
      { key: "currentStep", label: "Step" },
    ];
  }

  if (category.includes("dp")) {
    return [
      { key: "cellsFilled", label: "Cells Filled" },
      { key: "currentValue", label: "Current Value" },
      { key: "currentStep", label: "Step" },
      { key: "best", label: "Best So Far" },
    ];
  }

  if (category.includes("binary search")) {
    return [
      { key: "left", label: "Left" },
      { key: "mid", label: "Mid" },
      { key: "right", label: "Right" },
      { key: "currentStep", label: "Step" },
    ];
  }

  if (name.includes("frog")) {
    return [
      { key: "energy", label: "Energy" },
      { key: "position", label: "Position" },
      { key: "bestJump", label: "Best Jump" },
      { key: "currentStep", label: "Step" },
    ];
  }

  if (name.includes("rain water") || name.includes("trapping")) {
    return [
      { key: "leftMax", label: "Left Max" },
      { key: "rightMax", label: "Right Max" },
      { key: "water", label: "Water" },
      { key: "currentStep", label: "Step" },
    ];
  }

  return [
    { key: "currentStep", label: "Step" },
    { key: "progress", label: "Progress" },
    { key: "active", label: "Active" },
    { key: "result", label: "Result" },
  ];
}

function normalizeObjectMapping(
  mapping: Record<string, string> | undefined
): Record<string, string> {
  if (!mapping || Object.keys(mapping).length === 0) {
    return {
      input: "problem-specific scene objects",
      activeState: "focused highlighted object",
      result: "resolved final state",
    };
  }

  return mapping;
}

function formatObjectMapping(mapping: Record<string, string>): string {
  return Object.entries(mapping)
    .map(([key, value]) => `- ${key} → ${value}`)
    .join("\n");
}

function buildSemanticColorMap(creativeDirection: CreativeDirection): string {
  return `
SEMANTIC COLOR MAP:
- Primary ${safe(creativeDirection.colorPalette.primary)}: default scene identity / major object body
- Secondary ${safe(creativeDirection.colorPalette.secondary)}: support layer / secondary object state
- Accent ${safe(creativeDirection.colorPalette.accent)}: active, selected, currently important
- Danger ${safe(creativeDirection.colorPalette.danger)}: error, rejection, conflict, bad comparison, failed path
- Background ${safe(creativeDirection.colorPalette.background)}: cinematic scene base

COLOR RULES:
- Never rely on color alone; combine with labels, icons, shape, glow, or pattern
- Active state should become more saturated, not just different
- Final stable state should feel calmer and cleaner than active state
- Use smooth transitions of at least 250-300ms where readable
`.trim();
}

function inferFamousProblem(analysis: AnalysisResult): string {
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("trapping rain water")) return "LeetCode 42 — Trapping Rain Water";
  if (name.includes("frog jump")) return "Classic Frog Jump / DP-style stepping problem";
  if (name.includes("bubble sort")) return "Classic Bubble Sort";
  if (name.includes("binary search")) return "Classic Binary Search";
  if (name.includes("dijkstra")) return "Classic Dijkstra Shortest Path";
  if (name.includes("merge sort")) return "Classic Merge Sort";
  if (name.includes("quick sort")) return "Classic Quick Sort";
  return "Inferred from submitted code";
}

function inferFunctionNames(analysis: AnalysisResult): string {
  const text = safe(analysis.description, "");
  const functionMatches = text.match(/[a-zA-Z_]\w*\(/g);

  if (functionMatches && functionMatches.length) {
    return Array.from(new Set(functionMatches.map((item) => item.replace("(", "")))).join(", ");
  }

  return "Derived from submitted code";
}

function buildInputMeaning(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const objectMapping = normalizeObjectMapping(creativeDirection.objectMapping);
  const first = objectMapping.array || objectMapping.input || objectMapping["array values"];

  if (first) {
    return `${safe(analysis.inputExample)} should visually appear as ${first}.`;
  }

  return `The input should become concrete scene objects that match "${safe(
    creativeDirection.sceneName
  )}".`;
}

function buildIndexMeaning(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const category = safe(analysis.category).toLowerCase();

  if (category.includes("graph")) {
    return "Indices or positions represent map coordinates, processing order, or node identity in the route network.";
  }

  if (category.includes("tree")) {
    return "Positions represent hierarchy depth, branch placement, and parent-child structure.";
  }

  return "Indices should represent physical slots, stone positions, building blocks, shelves, lanes, or ordered locations in the scene.";
}

function buildPointerMeaning(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const variables = getVariables(analysis);
  const pointerLike = variables.filter((v) =>
    /(left|right|i|j|k|mid|ptr|pointer|lo|hi|start|end|slow|fast)/i.test(v.name)
  );

  if (pointerLike.length === 0) {
    return "Active variables should still appear as visible markers, labels, highlights, or guide beams near the relevant scene objects.";
  }

  return pointerLike
    .map((v) => {
      const mapped =
        creativeDirection.objectMapping[v.name] ||
        creativeDirection.objectMapping[`${v.name}Pointer`] ||
        `${v.name} marker`;
      return `- ${v.name}: ${v.meaning} → visualized as ${mapped}`;
    })
    .join("\n");
}

function buildPhysicalProcessMeaning(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  return `${safe(
    creativeDirection.metaphor
  )} The process should visually explain why decisions are made at each step.`;
}

function buildResultMeaning(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  return (
    creativeDirection.objectMapping.result ||
    `The result should feel like the scene has been resolved into "${safe(
      analysis.expectedOutput
    )}".`
  );
}

function buildAuxiliaryMeaning(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const ds = getDataStructures(analysis)
    .filter((item) => item.toLowerCase() !== "array")
    .map((item) => item.toLowerCase());

  if (ds.length === 0) {
    return "If no major auxiliary structure exists, use the sidebar to show live variables and state memory.";
  }

  return ds
    .map((item) => {
      if (item.includes("stack")) {
        return "- stack → visible stack of cards, trays, plates, or call frames";
      }
      if (item.includes("queue")) {
        return "- queue → waiting line, conveyor lane, or frontier tray";
      }
      if (item.includes("graph")) {
        return "- graph metadata → route panel, distance labels, or visited legend";
      }
      if (item.includes("tree")) {
        return "- tree support → branch highlights, traversal result strip, depth labels";
      }
      if (item.includes("call stack")) {
        return "- call stack → layered recursive frame cards in sidebar";
      }
      return `- ${item} → visible support structure in sidebar or scene overlay`;
    })
    .join("\n");
}

function inferPrimaryStructure(analysis: AnalysisResult): string {
  const template = inferTemplateType(analysis);

  switch (template) {
    case "graph":
      return "Graph / route network";
    case "tree":
      return "Hierarchical tree";
    case "dp":
      return "DP table / memo structure";
    case "stackqueue":
      return "Stack / queue operation structure";
    case "recursion":
      return "Recursive frames + main data view";
    default:
      return "Ordered linear structure (array / list / sequence)";
  }
}

function inferPrimaryVisualForm(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const template = inferTemplateType(analysis);

  switch (template) {
    case "graph":
      return "glowing nodes and edges arranged as a route map or network";
    case "tree":
      return "branching nodes with clear levels and connecting edges";
    case "dp":
      return "cells or tiles in a grid / row with formula-aware labels";
    case "stackqueue":
      return "cards, blocks, trays, or waiting-line objects with clear order";
    case "recursion":
      return "main data structure plus recursive frame cards and return flow";
    default:
      return (
        creativeDirection.objectMapping.array ||
        "ordered scene objects laid out linearly with values and active markers"
      );
  }
}

function inferValueToVisualMapping(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("rain water")) {
    return "Value height ∝ building height, and trapped result ∝ visible water depth between buildings.";
  }

  if (name.includes("frog")) {
    return "Indices map to stone positions, and computed cost / energy appears above or near each stone.";
  }

  if (name.includes("bubble sort")) {
    return "Value can influence size, order, or floating level, while state influences glow and motion.";
  }

  return `Values should map to physically understandable differences such as height, position, label, distance, fill level, or emphasis within "${safe(
    creativeDirection.sceneName
  )}".`;
}

function buildSecondaryStructures(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const variables = getVariables(analysis);

  if (variables.length === 0) {
    return "- No named secondary structures extracted; use sidebar variables and status chips.";
  }

  return variables
    .map((v) => {
      const mapping =
        creativeDirection.objectMapping[v.name] ||
        `${v.name} badge / guide marker / state label`;
      return `- ${v.name} → ${mapping} → ${v.meaning}`;
    })
    .join("\n");
}

function buildTrackedVariablesList(analysis: AnalysisResult): string {
  const variables = getVariables(analysis);

  if (variables.length === 0) {
    return "- Track current step index, active state, and result progress.";
  }

  return variables
    .map((v) => `- ${v.name}: ${v.meaning}`)
    .join("\n");
}

function buildDetailedStepTrace(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const steps = getSteps(analysis);

  return steps
    .map((step) => {
      const visualChange = inferVisualChangeForAction(
        step.action,
        analysis,
        creativeDirection,
        step
      );
      const sceneMeaning = inferSceneMeaningForAction(
        step.action,
        analysis,
        creativeDirection,
        step
      );
      const whyThisMatters = inferWhyThisMatters(
        step.action,
        analysis,
        step
      );

      return `STEP ${step.step}${step.important ? " ⭐" : ""}:
  State: ${compactJSON(step.variables)}
  Technical Action: ${step.description}
  Visual Change: ${visualChange}
  Scene Meaning: ${sceneMeaning}
  Why This Matters: ${whyThisMatters}
  Caption: ${step.caption}
  timingMult: ${step.timingMult}`;
    })
    .join("\n\n");
}

function buildEdgeCaseSection(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const edgeCases = Array.isArray((analysis as any).edgeCases)
    ? ((analysis as any).edgeCases as unknown[]).map((item) => String(item))
    : [];

  if (edgeCases.length === 0) {
    return `- Empty input → show calm empty scene with friendly message, controls mostly disabled
- Single element → show one resolved object already in final state
- Already solved input → quick confirmation animation and completion
- Invalid input → graceful in-scene error card using ${safe(
      creativeDirection.colorPalette.danger
    )}`;
  }

  return edgeCases
    .map((edge) => {
      const lower = edge.toLowerCase();

      if (lower.includes("empty")) {
        return `- ${edge}
  Visual behavior: empty but themed scene with message card
  Caption message: "There is nothing to process here yet."
  Controls disabled: Play/Next disabled, Reset allowed`;
      }

      if (lower.includes("single")) {
        return `- ${edge}
  Visual behavior: one object enters and is immediately marked resolved
  Caption message: "Only one item exists, so the answer is already settled."
  Controls disabled: Playback can be minimal but still available`;
      }

      if (lower.includes("already")) {
        return `- ${edge}
  Visual behavior: short confirmation sweep, then completion
  Caption message: "Everything is already in the right place."
  Controls disabled: No`;
      }

      if (lower.includes("invalid")) {
        return `- ${edge}
  Visual behavior: themed warning panel in-scene, no crash
  Caption message: "This input cannot be visualized in its current form."
  Controls disabled: Play disabled, Reset allowed`;
      }

      if (lower.includes("no solution") || lower.includes("not found")) {
        return `- ${edge}
  Visual behavior: failure glow and respectful end state
  Caption message: "We checked every valid path, but no answer was found."
  Controls disabled: No`;
      }

      return `- ${edge}
  Visual behavior: preserve scene theme, show special-case state clearly
  Caption message: explain the case in plain human language
  Controls disabled: only if playback would be meaningless`;
    })
    .join("\n\n");
}

function inferLayoutDescription(
  templateType: TemplateType,
  analysis: AnalysisResult
): string {
  switch (templateType) {
    case "graph":
      return "graph canvas with nodes and connecting routes";
    case "tree":
      return "top-down hierarchy with centered parent-child spacing";
    case "dp":
      return "table or tiled grid with supporting formula / dependency overlays";
    case "stackqueue":
      return "physical stack or queue lane with operation history";
    case "recursion":
      return "central active scene plus visible recursive call stack";
    default:
      return "linear array / bar / object strip with room for markers and character movement";
  }
}

function inferElementShape(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("bubble")) return "rounded capsules / bubbles";
  if (name.includes("rain")) return "buildings, basins, beacons, water shapes";
  if (name.includes("frog")) return "stones / lily pads / glowing markers";
  if (inferTemplateType(analysis) === "graph") return "circles / pins / route nodes";
  if (inferTemplateType(analysis) === "tree") return "branch nodes with rounded cards";
  return "rounded cards, themed blocks, or problem-specific objects";
}

function inferElementSizeRule(templateType: TemplateType, n: number): string {
  switch (templateType) {
    case "graph":
      return "node radius scales with viewport and label density; keep labels readable above all";
    case "tree":
      return "node size decreases slightly with depth and total node count";
    case "dp":
      return `cell size = clamp(28px, ${Math.max(
        32,
        90 - n
      )}px, 72px) depending on rows/cols`;
    default:
      return `element width = responsive clamp based on n ≈ ${n}; preserve label readability before decoration`;
  }
}

function inferTypography(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const personality = inferAlgorithmPersonality(analysis);

  return `${personality.typography} for headers, clean readable sans-serif for captions and stats.`;
}

function buildColorPaletteLines(creativeDirection: CreativeDirection): string {
  return `- default/untouched → ${safe(creativeDirection.colorPalette.primary)}
- active/comparing → ${safe(creativeDirection.colorPalette.accent)}
- processing left / first side → ${safe(creativeDirection.colorPalette.secondary)}
- processing right / opposite side → ${safe(creativeDirection.colorPalette.danger)}
- swapping/modifying → ${safe(creativeDirection.colorPalette.accent)}
- sorted/finalized → calmer resolved variant of ${safe(
    creativeDirection.colorPalette.primary
  )}
- frontier/candidate → brighter accent highlight
- special / key object → strongest glow using accent + rim light
- eliminated/out → dimmed desaturated version of base colors
- error/stale → ${safe(creativeDirection.colorPalette.danger)}
- created/new → brief bright bloom then settle
- result/merged → polished success state with balanced glow`;
}

function buildSceneAssets(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const assets = new Set<string>();

  creativeDirection.environment.backgroundLayers.forEach((item) =>
    assets.add(item)
  );
  creativeDirection.environment.ambientEffects.forEach((item) =>
    assets.add(item)
  );
  creativeDirection.domainAnimations.forEach((item) => assets.add(item));

  const algorithm = safe(analysis.algorithmName).toLowerCase();

  if (algorithm.includes("rain")) {
    assets.add("rain streaks");
    assets.add("water basins");
    assets.add("wet building reflections");
  }

  if (algorithm.includes("frog")) {
    assets.add("frog hero");
    assets.add("stones or lily pads");
    assets.add("water ripples");
  }

  if (algorithm.includes("bubble")) {
    assets.add("underwater particles");
    assets.add("soft bubbles");
    assets.add("current lines");
  }

  return Array.from(assets)
    .map((item) => `- ${item}`)
    .join("\n");
}

function inferCoordinateSystem(templateType: TemplateType): string {
  switch (templateType) {
    case "graph":
      return "graph network with fixed or semi-fixed node coordinates";
    case "tree":
      return "level-based hierarchy with parent-centered branching";
    case "dp":
      return "grid / table coordinate system";
    case "stackqueue":
      return "single-axis ordered lane";
    case "recursion":
      return "central scene + stacked side frame coordinates";
    default:
      return "horizontal linear coordinate system";
  }
}

function buildSpacingFormulas(templateType: TemplateType, n: number): string {
  switch (templateType) {
    case "graph":
      return `- Node positions should preserve clear edges and readable labels
- Edge routing should avoid heavy overlap
- Active route should have enough breathing room for glow and travel animation`;
    case "tree":
      return `- y(level) = topPadding + level * verticalGap
- sibling spacing widens for upper levels and compresses slightly for lower dense levels
- keep subtree centering visually balanced`;
    case "dp":
      return `- x(col) = leftPadding + col * cellWidth
- y(row) = topPadding + row * cellHeight
- formula labels should appear above or beside active cells`;
    default:
      return `- x(i) = leftPadding + i * gap
- gap adjusts based on n ≈ ${n}
- y baseline remains stable while values / states animate above it`;
  }
}

function inferViewportBehavior(templateType: TemplateType, n: number): string {
  if (n > 100) {
    return "prefer simplified view with scroll or viewport windowing";
  }

  if (templateType === "graph") {
    return "auto-fit graph bounds with margin and avoid edge clipping";
  }

  return "auto-fit main structure within safe scene area; allow gentle scaling if necessary";
}

function inferIntroEntryMotion(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const algorithm = safe(analysis.algorithmName).toLowerCase();

  if (algorithm.includes("frog")) return "soft rise from the water with moonlit glow";
  if (algorithm.includes("rain")) return "fade in through rain and mist with vertical reveal";
  if (algorithm.includes("bubble")) return "float upward from below with soft wobble";

  return `staggered ${safe(
    creativeDirection.heroCharacter.moveAnimation
  )} feel mixed with fade and scale`;
}

function buildInitialValues(analysis: AnalysisResult): string {
  const variables = getVariables(analysis);
  const steps = getSteps(analysis);
  const firstStep = steps[0];

  const lines = variables.map((v) => {
    const value =
      firstStep && Object.prototype.hasOwnProperty.call(firstStep.variables, v.name)
        ? (firstStep.variables as any)[v.name]
        : "initial / inferred";
    return `- ${v.name} = ${String(value)} (${v.meaning})`;
  });

  if (lines.length === 0) {
    return "- Initialize main structure from input\n- Initialize current step = 1\n- Initialize stats to zero";
  }

  return lines.join("\n");
}

function inferSwapAnimation(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("bubble")) {
    return "two bubble objects crossing in curved underwater arcs";
  }

  if (name.includes("rain")) {
    return "beacons and active highlights shift roof-to-roof rather than swapping bodies";
  }

  return "parabolic arc crossing with clear left/right identity preserved";
}

function inferCreationSequence(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const templateType = inferTemplateType(analysis);

  if (templateType === "graph") {
    return "soft node pop-in, line draw, then label reveal";
  }

  if (templateType === "tree") {
    return "node drop-in with branch draw and gentle settle";
  }

  return `ghost outline → fill reveal → label settle → gentle idle state within "${safe(
    creativeDirection.sceneName
  )}"`;
}

function inferDestructionSequence(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const category = safe(analysis.category).toLowerCase();

  if (category.includes("binary search")) {
    return "tilt, dim, and collapse out of active range";
  }

  if (category.includes("backtracking")) {
    return "path fades and retracts with a step-back feel";
  }

  return "fade, shrink slightly, and release particles or light depending on scene tone";
}

function buildPointerRules(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const variables = getVariables(analysis);

  if (variables.some((v) => /slow/i.test(v.name)) && variables.some((v) => /fast/i.test(v.name))) {
    return `- Slow pointer: turtle-like slower marker
- Fast pointer: rabbit-like quicker marker
- Both must be visibly different by icon + label + color
- Movement should show different pacing clearly`;
  }

  if (safe(analysis.category).toLowerCase().includes("two pointer")) {
    return `- LEFT pointer should feel distinct and directional
- RIGHT pointer should feel distinct and directional
- Meeting or crossing should create a small spark or convergence emphasis
- Labels must remain visible: left / right or variable names`;
  }

  return `- Pointers should never be represented by color alone
- Use arrows, beams, markers, labels, or character focus indicators
- Movement must be smooth and visible
- If multiple markers exist, stack them vertically or offset them safely`;
}

function buildSplitMergeRules(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();
  const category = safe(analysis.category).toLowerCase();

  if (name.includes("merge sort") || category.includes("divide")) {
    return `- SPLIT: crack / separate / drift apart with visible structure
- MERGE: winning elements travel into a resolved center lane
- Parent-child relation between split levels should remain readable`;
  }

  if (name.includes("quick sort") || name.includes("partition")) {
    return `- Pivot must visibly stand out
- Partition boundary should move physically through the structure
- Lesser and greater groups separate with directionality`;
  }

  return "Not applicable — if the algorithm has no split / merge / partition phase, keep this section as a no-op.";
}

function inferAlgorithmPersonality(analysis: AnalysisResult): {
  name: string;
  behavior: string;
  background: string;
  typography: string;
  motionStyle: string;
  emotion: string;
} {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("bubble sort")) {
    return {
      name: "Gentle & Patient",
      behavior: "careful, repetitive, soothing, physically settling",
      background: "cool underwater laboratory with calm motion",
      typography: "rounded modern display font feel",
      motionStyle: "soft floating motion with curved swaps",
      emotion: "satisfying gradual order emerging from chaos",
    };
  }

  if (name.includes("quick sort")) {
    return {
      name: "Aggressive & Decisive",
      behavior: "sharp, fast, surgical, confident",
      background: "high-contrast dramatic workspace",
      typography: "clean angular headline style",
      motionStyle: "snappy movement with strong pivots and cuts",
      emotion: "speed, clarity, decisive tension",
    };
  }

  if (name.includes("merge sort")) {
    return {
      name: "Organized & Methodical",
      behavior: "precise, balanced, layered, constructive",
      background: "cool structured environment with neat levels",
      typography: "clean technical sans-serif / modern mono hybrid",
      motionStyle: "measured splits and satisfying merges",
      emotion: "calm confidence and structured progress",
    };
  }

  if (name.includes("binary search")) {
    return {
      name: "Detective Efficient",
      behavior: "narrowing, focused, intelligent, economical",
      background: "noir investigation room with spotlight",
      typography: "sharp headline + readable body text",
      motionStyle: "tight range reduction and confident focus shifts",
      emotion: "aha-moment efficiency",
    };
  }

  if (category.includes("graph")) {
    return {
      name: "Explorer / Navigator",
      behavior: "outward scanning, route discovery, strategic exploration",
      background: "glowing map or route network",
      typography: "clean technical map-like display",
      motionStyle: "path tracing, pulses, route highlights",
      emotion: "discovery and orientation",
    };
  }

  if (category.includes("dp")) {
    return {
      name: "Puzzle Builder",
      behavior: "incremental, thoughtful, memory-driven",
      background: "grid workshop / blueprint table",
      typography: "structured geometric sans",
      motionStyle: "cell fills, dependency glows, optimal reconstruction",
      emotion: "clarity emerging from many small decisions",
    };
  }

  if (category.includes("backtracking")) {
    return {
      name: "Cautious Detective",
      behavior: "try, test, retreat, refine",
      background: "maze / branching mystery environment",
      typography: "focused readable display with a dramatic edge",
      motionStyle: "advance, pause, backtrack",
      emotion: "tension, trial, and satisfying resolution",
    };
  }

  return {
    name: "Focused Problem Solver",
    behavior: "educational, deliberate, strategy-revealing",
    background: "cinematic dark data studio",
    typography: "clean modern sans-serif",
    motionStyle: "clear guided motion with calm readability",
    emotion: "understanding through visible cause and effect",
  };
}

function getCategorySpecificRules(
  analysis: AnalysisResult
): string {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();

  if (category.includes("sorting")) {
    return `KNOWN MATCH: SORTING
- comparisons must feel physical and visible
- swaps must use actual motion, not instant teleportation
- sorted region should visually calm down after each resolved pass
- comparison counters should feel alive`;
  }

  if (name.includes("merge sort")) {
    return `KNOWN MATCH: MERGE SORT
- split into visible subgroups or levels
- preserve parent-child relation between layers
- merge should visibly choose the next winning value
- final merge should feel deeply satisfying`;
  }

  if (category.includes("graph")) {
    return `KNOWN MATCH: GRAPH / PATH
- nodes must feel like places or checkpoints
- edges must feel traversable
- visited/unvisited difference must be obvious
- route discovery must feel directional and accumulative`;
  }

  if (category.includes("binary search")) {
    return `KNOWN MATCH: BINARY SEARCH
- active range must shrink visually
- eliminated half must leave the scene or clearly dim out
- middle element must become the dramatic focus each iteration`;
  }

  if (category.includes("tree")) {
    return `KNOWN MATCH: TREE
- preserve hierarchy and parent-child readability
- traversal must light connected branches
- branch depth should feel meaningful`;
  }

  if (category.includes("dp")) {
    return `KNOWN MATCH: DYNAMIC PROGRAMMING
- cells must fill based on dependency logic
- previous state should visibly influence next state
- final path / answer should be reconstructed or highlighted cleanly`;
  }

  if (category.includes("two pointer")) {
    return `KNOWN MATCH: TWO POINTERS
- left and right markers must remain distinct
- convergence should create anticipation
- decisions must feel like narrowing a valid window or scanning a boundary`;
  }

  if (category.includes("stack") || category.includes("queue")) {
    return `KNOWN MATCH: STACK / QUEUE
- push/pop or enqueue/dequeue must feel physically ordered
- top/front/rear identity must always remain readable
- operation log should reinforce sequence meaning`;
  }

  if (category.includes("recursion") || category.includes("backtracking")) {
    return `KNOWN MATCH: RECURSION / BACKTRACKING
- recursive depth or branching should be visible
- call and return must be separate visual events
- failure paths must retreat cleanly instead of disappearing ambiguously`;
  }

  return `UNKNOWN / CUSTOM MATCH
- infer physical meaning from algorithm behavior
- choose one clear metaphor and commit to it
- make the visuals educational first and decorative second
- the viewer should still understand the strategy by watching`;
}

function buildOperationMapping(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const actions = Array.from(new Set(getSteps(analysis).map((step) => step.action)));

  return actions
    .map((action) => `- ${action} → ${inferSceneMeaningForAction(action, analysis, creativeDirection)}`)
    .join("\n");
}

function buildBackgroundGuidance(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  return `Use "${safe(
    creativeDirection.sceneName
  )}" as the real scene, not just a flat dark panel. Base environment: ${safe(
    creativeDirection.environment.setting
  )}`;
}

function buildParticleGuidance(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  if (creativeDirection.domainAnimations.length > 0) {
    return creativeDirection.domainAnimations
      .map((item) => `- ${item}`)
      .join("\n");
  }

  return "- use subtle particles only around meaningful interactions";
}

function buildAlgorithmDialogue(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string[] {
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("rain")) {
    return [
      "The shorter wall decides how much water can stay here.",
      "This basin can finally hold rain now.",
      "A stronger boundary means more water can be trapped safely.",
      "The skyline is starting to reveal its hidden pools.",
    ];
  }

  if (name.includes("frog")) {
    return [
      "That jump costs less energy — smart move!",
      "I only need the best path to this stone, not every path.",
      "A longer jump might save effort here.",
      "Almost there — one more good landing!",
    ];
  }

  if (name.includes("bubble")) {
    return [
      "These two are out of order — let them trade places.",
      "The biggest one is drifting toward where it belongs.",
      "Bit by bit, the chaos is calming down.",
      "Now the whole stream feels settled.",
    ];
  }

  return [
    "Let's focus on the most important change first.",
    "This decision reveals the algorithm's strategy.",
    "The pattern is becoming clearer now.",
    "We are close to the final resolved state.",
  ];
}

function buildRecursionPanelRules(analysis: AnalysisResult): string {
  const template = inferTemplateType(analysis);
  const category = safe(analysis.category).toLowerCase();

  if (template === "recursion" || category.includes("recursion") || category.includes("backtracking")) {
    return `- Show a right-side call stack / path stack panel
- Each call / branch should appear as a visible card
- Returns or backtracks must be separate visual events
- Active depth should be brightest`;
  }

  return "No dedicated recursion panel required; use sidebar for current variables and state summary.";
}

function inferNaturalPhaseTransitions(analysis: AnalysisResult): string {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("merge sort")) return "Split → Recursive Solve → Merge";
  if (name.includes("quick sort")) return "Choose Pivot → Partition → Recurse";
  if (name.includes("rain")) return "Initialize Boundaries → Scan → Accumulate Water → Finish";
  if (name.includes("frog")) return "Setup Stones → Evaluate Jumps → Improve Costs → Reach Goal";
  if (category.includes("graph")) return "Initialize Frontier → Explore → Update Best State → Finish";
  if (category.includes("dp")) return "Initialize Base Cases → Fill States → Resolve Answer";
  return "Initialize → Process → Resolve Result";
}

function inferDomain(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();
  const category = safe(analysis.category).toLowerCase();
  const metaphor = safe(creativeDirection.metaphor).toLowerCase();

  if (name.includes("rain") || metaphor.includes("water") || metaphor.includes("storm")) {
    return "Water / Fluid";
  }

  if (name.includes("frog") || metaphor.includes("jump") || metaphor.includes("stones")) {
    return "Traversal / Physical Movement";
  }

  if (category.includes("sorting")) {
    return "Sorting / Settling / Reordering";
  }

  if (category.includes("graph")) {
    return "Path / Navigation";
  }

  if (category.includes("tree")) {
    return "Hierarchy / Branching";
  }

  if (category.includes("dp")) {
    return "Puzzle / Accumulation";
  }

  if (category.includes("stack") || category.includes("queue")) {
    return "Stacking / Waiting Line";
  }

  if (category.includes("binary search")) {
    return "Search / Elimination";
  }

  return "Abstract problem-specific physical analogy";
}

function buildDomainPhysics(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const domain = inferDomain(analysis, creativeDirection);

  switch (domain) {
    case "Water / Fluid":
      return `- water should rise smoothly, not snap
- ripples and splashes should appear when new volume is captured
- rain or moisture can reinforce the atmosphere
- surfaces should feel fluid and layered`;

    case "Traversal / Physical Movement":
      return `- movement should feel like actual travel between positions
- landings should produce impact feedback
- route decisions should show direction clearly
- the hero's body language should support the algorithm's logic`;

    case "Sorting / Settling / Reordering":
      return `- heavier values should feel heavier during swaps
- settled regions should calm down physically
- comparisons should create visible tension before resolution
- repeated passes should feel like disorder gradually disappearing`;

    case "Path / Navigation":
      return `- traversal should move along visible routes
- frontier updates should pulse outward
- better paths should visibly replace weaker ones
- destination clarity should improve over time`;

    case "Hierarchy / Branching":
      return `- depth should feel spatial
- parent-child motion should follow branches
- traversal should activate connected paths in sequence
- deletions or backtracks should retreat up the hierarchy`;

    case "Puzzle / Accumulation":
      return `- new state should visibly build on previous state
- cells should fill with cause-and-effect logic
- solution reconstruction should travel backward through meaningful dependencies
- progress should feel cumulative`;

    case "Stacking / Waiting Line":
      return `- push/pop or enqueue/dequeue must respect order
- collisions and landings should feel physical
- top/front identity should stay obvious
- state changes should preserve queue / stack semantics`;

    case "Search / Elimination":
      return `- candidate narrowing should feel spatially smaller
- rejections should leave the focus area
- key checks should feel like an investigative spotlight
- found state should create a crisp payoff`;

    default:
      return `- infer one coherent physical behavior and stay consistent
- movement must always explain logic
- scene reactions should support educational clarity`;
  }
}

function inferMaterialSystem(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();
  const domain = inferDomain(analysis, creativeDirection);

  if (name.includes("rain")) {
    return `- Buildings: wet concrete / glass with reflective highlights
- Water: translucent layered blue fill with soft surface shimmer
- Markers: neon survey beacons
- Ground accents: puddles and drainage reflections`;
  }

  if (name.includes("frog")) {
    return `- Stones / lily pads: soft natural textured surfaces
- Water: moonlit reflective pond surface
- Hero: expressive frog silhouette with readable body posture
- Goal marker: warm glowing destination object`;
  }

  if (name.includes("bubble")) {
    return `- Main objects: translucent bubble-like capsules with watery highlights
- Background: soft underwater gradients and caustic lighting
- Active glow: smooth underwater bloom rather than harsh neon`;
  }

  if (domain === "Path / Navigation") {
    return `- Nodes: polished map pins / glowing checkpoints
- Edges: route lines, roads, or energy paths
- Background: subtle map grid / radar style`;
  }

  return `- Main objects should have themed material consistent with "${safe(
    creativeDirection.sceneName
  )}"
- Use gradients, shadows, highlights, and translucency carefully
- Avoid plain flat gray rectangles unless the metaphor demands them`;
}

function buildAmbientParticles(
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection
): string {
  const name = safe(analysis.algorithmName).toLowerCase();

  if (name.includes("rain")) {
    return `- rain streaks
- mist specks
- tiny splash droplets on capture
- calm settling droplets on completion`;
  }

  if (name.includes("frog")) {
    return `- fireflies
- tiny ripple rings
- soft sparkle trail on jumps
- quiet pond shimmer at completion`;
  }

  if (name.includes("bubble")) {
    return `- rising micro-bubbles
- underwater dust motes
- soft current particles
- calm sparkle wave on completion`;
  }

  return creativeDirection.environment.ambientEffects
    .map((item) => `- ${item}`)
    .join("\n");
}

function inferVisualChangeForAction(
  action: string,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection,
  step: NormalizedStep
): string {
  const lower = action.toLowerCase();
  const scene = safe(creativeDirection.sceneName);

  if (lower.includes("initialize")) {
    return `The ${scene} scene builds in, the main structure appears, and the hero character enters in a readable starting position.`;
  }

  if (lower.includes("compare")) {
    return `The active objects receive a focused spotlight, comparison emphasis, and a short tension pause before the decision resolves.`;
  }

  if (lower.includes("swap")) {
    return `The two active objects cross in a visible arc-based motion with clear before/after identity.`;
  }

  if (lower.includes("update")) {
    return `The changed value glows, updates visibly, and settles into its new state with a brief result pulse.`;
  }

  if (lower.includes("push") || lower.includes("enqueue")) {
    return `A new object physically enters the auxiliary structure and takes its rightful place with ordered motion.`;
  }

  if (lower.includes("pop") || lower.includes("dequeue")) {
    return `The leading object exits the structure visibly, leaving the remaining order intact and readable.`;
  }

  if (lower.includes("visit")) {
    return `The active target lights up clearly, and the surrounding scene acknowledges that it has been reached.`;
  }

  if (lower.includes("return") || lower.includes("backtrack")) {
    return `The current focus retreats or resolves, showing how control or state moves back to the previous context.`;
  }

  if (lower.includes("found")) {
    return `The discovered result gets a high-clarity highlight, dramatic text, and a payoff moment.`;
  }

  if (lower.includes("complete")) {
    return `The full scene settles into its final resolved arrangement with completion emphasis and calm closure.`;
  }

  return `The active region changes visibly in a way that supports the educational meaning of the step.`;
}

function inferSceneMeaningForAction(
  action: string,
  analysis: AnalysisResult,
  creativeDirection: CreativeDirection,
  step?: NormalizedStep
): string {
  const lower = action.toLowerCase();
  const metaphor = safe(creativeDirection.metaphor);

  if (lower.includes("initialize")) {
    return `The world is being set up so the viewer understands the problem before the algorithm starts acting.`;
  }

  if (lower.includes("compare")) {
    return `The algorithm is evaluating which choice makes sense next within the metaphor: ${metaphor}`;
  }

  if (lower.includes("swap")) {
    return `Two scene objects are changing relative order or position to move the system closer to the correct arrangement.`;
  }

  if (lower.includes("update")) {
    return `A new best-known state, count, boundary, or value is being recorded in the world.`;
  }

  if (lower.includes("push") || lower.includes("enqueue")) {
    return `Something important is being stored or queued for later processing.`;
  }

  if (lower.includes("pop") || lower.includes("dequeue")) {
    return `The next waiting item is now ready to act or be resolved.`;
  }

  if (lower.includes("visit")) {
    return `The algorithm has reached a new meaningful location or state.`;
  }

  if (lower.includes("return")) {
    return `The algorithm is sending a computed result back to an earlier context.`;
  }

  if (lower.includes("backtrack")) {
    return `This path did not work, so the algorithm is retreating and trying a better option.`;
  }

  if (lower.includes("found")) {
    return `The desired answer has been identified inside the scene.`;
  }

  if (lower.includes("complete")) {
    return `The world reaches its final solved state.`;
  }

  return `This step advances the scene toward the final answer in a way consistent with the metaphor.`;
}

function inferWhyThisMatters(
  action: string,
  analysis: AnalysisResult,
  step: NormalizedStep
): string {
  const lower = action.toLowerCase();

  if (lower.includes("initialize")) {
    return "A good setup gives the viewer the mental model needed for the rest of the algorithm.";
  }

  if (lower.includes("compare")) {
    return "The algorithm's core logic is usually revealed through how it compares candidates.";
  }

  if (lower.includes("swap")) {
    return "This physically changes the state and moves the structure closer to the correct answer.";
  }

  if (lower.includes("update")) {
    return "A remembered value or better state often drives all future decisions.";
  }

  if (lower.includes("push") || lower.includes("enqueue")) {
    return "Storing work in the right order is essential to the algorithm's correctness.";
  }

  if (lower.includes("pop") || lower.includes("dequeue")) {
    return "Removing the next item reveals the processing discipline of the algorithm.";
  }

  if (lower.includes("visit")) {
    return "This marks progress into a new part of the search or structure.";
  }

  if (lower.includes("return") || lower.includes("backtrack")) {
    return "This shows how the algorithm reuses solved sub-results or abandons a bad path.";
  }

  if (lower.includes("found")) {
    return "This is the payoff where the search or construction succeeds.";
  }

  if (lower.includes("complete")) {
    return "The final state confirms the strategy worked from start to finish.";
  }

  if (step.important) {
    return `This is a highlighted learning moment tied to the key insight: ${safe(
      analysis.keyInsight
    )}`;
  }

  return "This step contributes to the algorithm's gradual progress and should remain readable.";
}

