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

  const algorithmLogic = buildAlgorithmLogicBreakdown(analysis);
  const decisionRules = buildDecisionRuleCatalog(analysis, steps);
  const stateEvolution = buildStateEvolutionTable(analysis, steps);
  const correctnessProof = buildCorrectnessProof(analysis);
  const complexityTrace = buildComplexityReasoningTrace(analysis, steps);
  const logicEdgeCases = buildLogicEdgeCaseProofs(analysis);
  const stepTrace = buildDetailedStepTrace(analysis, creativeDirection);

  return `
You are an Algorithm Visualization Generator AI.

When given this analyzed algorithm specification, generate a SINGLE self-contained HTML file.

═══════════════════════════════════════════════════════════
PRIMARY OBJECTIVE
═══════════════════════════════════════════════════════════
Generate a cinematic, educational, non-generic algorithm visualization that:
- works directly in a browser
- works inside iframe srcdoc
- uses Vanilla HTML/CSS/JS only
- uses DOM-based visual elements (not canvas-only)
- precomputes all replay steps as a JavaScript array
- includes controls: Reset | Prev | Play/Pause | Next | Speed
- includes a clear top stats area, bottom caption area, and right info panel
- never renders as a blank screen
- feels specific to THIS algorithm, not a generic template demo
- TEACHES the algorithm logic step-by-step, not just shows pretty animations

═══════════════════════════════════════════════════════════
OUTPUT RULES
═══════════════════════════════════════════════════════════
- Output ONLY a single complete HTML file
- Include all CSS inside <style> tags
- Include all JS inside <script> tags
- HTML must end with </html>
- No markdown fences
- No explanations before or after the HTML
- No React, Vue, TypeScript, build tools, or external local files
- Optional CDN usage is allowed only if absolutely necessary, but prefer self-contained vanilla implementation
- The input example MUST use at least 7-8 meaningful values so that the algorithm trace is sufficiently detailed to teach the logic
- If the provided input example has fewer than 8 values, generate a representative example with 8+ values that demonstrates the algorithm's behavior clearly (including edge conditions where possible: duplicates, zeros, extremes)
- The total number of precomputed STEPS must be sufficient to cover the complete logical execution — do NOT compress or skip steps. Every comparison, swap, update, visit, state transition, or decision must be represented as its own step.

═══════════════════════════════════════════════════════════
THE 58-SECTION PERSONALIZED SPEC
═══════════════════════════════════════════════════════════

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

SECTION 4 — Step-by-Step Execution Trace (Story + Logic + Why)
─────────────────────────────────────────────────────────────
${stepTrace}

SECTION 5 — Edge Cases to Handle
────────────────────────────────
${buildEdgeCaseSection(analysis, creativeDirection)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1B — ALGORITHM LOGIC DEEP DIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 6 — Algorithm Logic Breakdown
─────────────────────────────────────
${algorithmLogic}

SECTION 7 — Decision Rule Catalog
─────────────────────────────────
${decisionRules}

SECTION 8 — State Evolution Table (Variable Tracking)
────────────────────────────────────────────────────
${stateEvolution}

SECTION 9 — Correctness Proof (Why this algorithm works)
───────────────────────────────────────────────────────
${correctnessProof}

SECTION 10 — Complexity Reasoning Tied to Steps
──────────────────────────────────────────────
${complexityTrace}

SECTION 11 — Edge-Case Logic Proofs
────────────────────────────────────
${logicEdgeCases}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — LAYOUT & STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 12 — Visual Design Specs (Base Style Tokens)
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

SECTION 13 — Object Mapping & Scene Vocabulary
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

SECTION 14 — Layout Engine & Positioning Math
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

SECTION 15 — Input Size Adaptation Rules
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

SECTION 16 — State Initialization & Setup Logic
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
- If steps > 2000: simplify repetitive visuals (but keep all steps in STEPS array)
- If steps > 5000: show large-input simplified mode message (but keep all steps)
- For this algorithm: total steps = ${steps.length}
- IMPORTANT: Every step in the STEPS array must be reachable via playback. Do NOT delete steps to save space.

SECTION 17 — Semantic Color System
─────────────────────────────────
${colorMeanings}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — ANIMATION CORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 18 — Animation Physics & Easing
──────────────────────────────────────
- ENTER: scale(0.85) + fade in + slight rise
- EXIT: fade out + scale down + soften glow
- MOVEMENT EASING: cubic-bezier(0.34, 1.56, 0.64, 1)
- SWAP / CROSSING MOTION: ${inferSwapAnimation(analysis, creativeDirection)}
- POINTER MOVEMENT: smooth physical travel, never teleport
- STAGGER RULE: 70-90ms domino delay when many elements update
- TIMING HIERARCHY must respect each step's timingMult field

SECTION 19 — Creation & Destruction Animations
─────────────────────────────────────────────
CREATION RULES:
- Main objects appear as ${inferCreationSequence(analysis, creativeDirection)}
- Hero appears with a brief character reveal and idle settle
- Auxiliary panels slide in with low drama so main scene stays primary

DESTRUCTION RULES:
- Removed / rejected / eliminated objects use ${inferDestructionSequence(analysis, creativeDirection)}
- Deleted links retract physically
- Merged objects must visually combine rather than instantly replacing one another

SECTION 20 — Value Change Animations
───────────────────────────────────
- Numeric changes should animate old → new visibly
- Live counters in the stats bar should count upward, not snap
- Updated values in the scene should briefly glow, then settle
- If value changes correspond to ${domain}, reinforce that change with domain-specific motion

SECTION 21 — Pointer & Reference Rules
─────────────────────────────────────
${buildPointerRules(analysis, creativeDirection)}

SECTION 22 — Split / Merge / Partition Special Animations
────────────────────────────────────────────────────────
${buildSplitMergeRules(analysis, creativeDirection)}

SECTION 23 — 3D Moments / Depth Illusion
───────────────────────────────────────
- Active elements: scale(1.04-1.1), stronger shadow, slight foreground lift
- Inactive elements: mild opacity reduction and subtle blur where appropriate
- Hero character should sit above base elements in z-index
- Finalized / stable regions should feel calmer and more grounded than active zones
- If recursion depth or hierarchy exists, smaller deeper layers should feel physically further away

SECTION 24 — Physical Properties of Elements
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

SECTION 25 — Conditional Creative Rules (Generic Fallback Engine)
──────────────────────────────────────────────────────────────
${categoryRules}

SECTION 26 — Algorithm Personality / Theme Mapping
────────────────────────────────────────────────
- ALGORITHM PERSONALITY: ${personality.name}
- BEHAVIOR FEEL: ${personality.behavior}
- BACKGROUND STYLE: ${personality.background}
- TYPOGRAPHY FEEL: ${personality.typography}
- ANIMATION FEEL: ${personality.motionStyle}
- VIEWER EMOTION TARGET: ${personality.emotion}

SECTION 27 — Metaphor System (Mandatory)
──────────────────────────────────────
1. METAPHOR SENTENCE:
${safe(creativeDirection.metaphor)}

2. OBJECT MAPPING:
${formatObjectMapping(objectMapping)}

3. OPERATION MAPPING:
${buildOperationMapping(analysis, creativeDirection)}

RULE:
The metaphor must explain WHY the algorithm behaves this way, not just decorate it.

SECTION 28 — Creative Intelligence / Non-Generic Rule
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

SECTION 29 — Tension & Suspense Mechanics
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

SECTION 30 — High-Speed Visual Effects
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

SECTION 31 — Background, Glow, Particles, Trail & Depth
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

SECTION 32 — Visual Sound Equivalents
───────────────────────────────────
- Use micro-vibration on active comparisons
- Use ripple at points of important interaction
- Use subtle equalizer / activity bars only if they match the scene tone
- Intensity should reflect algorithm activity, not random noise
- Calm sections should visibly relax

SECTION 33 — Algorithm Emotion & Personality Dialogue
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

SECTION 34 — Caption Box, Stats Bar & Algorithm Header
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
- Captions must explain the LOGIC of what is happening, not just describe the action
- Example format: "Comparing arr[2]=5 with arr[3]=3 → 5 > 3, so swap them to move the larger value toward the end (bubble sort invariant: after pass k, the k largest elements are in their final positions)"

SECTION 35 — Annotation / Explain Mode System
────────────────────────────────────────────
- Provide explain mode toggle
- Use short speech-bubble annotations near active elements
- Good style: conversational, plain English, specific to THIS algorithm
- Early steps = fuller explanation
- Middle = shorter hints
- Late = concise reinforcement
- Max 2 annotations per step
- Annotations should explain the WHY behind each action, not just the WHAT

SECTION 36 — Function Call / Recursion Panel
──────────────────────────────────────────
${buildRecursionPanelRules(analysis)}

SECTION 37 — Heatmap, Ghost Trail, Footprints & History
────────────────────────────────────────────────────
- Heatmap toggle: optional but useful
- Ghost trail: show last 2-3 meaningful pointer or hero positions
- Footprints / touch markers: brief and subtle
- Comparison / action history panel:
  show recent operations from this action set:
  ${stepActionSet.join(", ")}

SECTION 38 — Phase Transitions, Intro, Mid-Insight & Failure
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

SECTION 39 — Completion Sequence & Final Stats
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

SECTION 40 — Domain-Specific Physics Layer
────────────────────────────────────────
DOMAIN DETECTED: ${domain}

Apply these physical rules:
${buildDomainPhysics(analysis, creativeDirection)}

SECTION 41 — Ambient Environment System
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

SECTION 42 — Element Texture & Material System
────────────────────────────────────────────
MATERIAL SYSTEM:
${sceneMaterials}

RULE:
Elements should not feel like flat anonymous divs. Material must match the metaphor.

SECTION 43 — Cinematic Lighting System
───────────────────────────────────
- Spotlight follows active region, not the whole screen
- Rim light for active elements in ${safe(creativeDirection.colorPalette.accent)}
- Soft grounded shadows for main objects
- Completion lighting warms / brightens slightly
- Use light to guide attention, not to overwhelm readability

SECTION 44 — Micro Interaction & Idle Animations
──────────────────────────────────────────────
- Hero idle: ${safe(creativeDirection.heroCharacter.idleAnimation)}
- Active idle: subtle breathing and gentle pulse
- Pointers: tiny bob or glow shift
- Background effects: slow continuous life
- Completed scene: almost still, but not dead

SECTION 45 — Dramatic Moment Text System
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

SECTION 46 — Environment Transition on Completion
───────────────────────────────────────────────
- Calm ambient effects
- Shift background slightly warmer / cleaner
- Pulse final result once
- Pause briefly before final stats card
- Make completion feel like the end of a short film, not just a stopped animation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — ADVANCED CINEMATIC & INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 47 — Cinematic Camera Dynamics
───────────────────────────────────
- Default = wide shot
- Auto close-up on critical comparison / jump / route update / merge
- Gentle pan when focus region moves
- Small impact shake only on major events
- Dramatic zoom reserved for discovery / finish

SECTION 48 — Post-Processing Film Layer
─────────────────────────────────────
- Subtle bloom on active glow
- Very light film grain overlay
- Mild vignette to keep focus centered
- Chromatic aberration only if the algorithm personality supports aggression / speed
- Keep readability above style

SECTION 49 — Adaptive Timing (Speed Ramping)
──────────────────────────────────────────
Every step should respect its timingMult field.
Use these rules:
- boring / repetitive steps → faster
- first major occurrence → slower
- critical decision → slower
- repetitive same-type runs → slightly faster
- final step → slower for closure

The precomputed steps array MUST include timingMult for every step.

SECTION 50 — Atmospheric Ambient Particles
────────────────────────────────────────
Theme-specific particles should follow this scene:
${buildAmbientParticles(analysis, creativeDirection)}

Rules:
- subtle by default
- stronger only on key events
- completion should settle particles rather than endlessly looping chaos

SECTION 51 — Interactive Inspection Layer
──────────────────────────────────────
- Hover any main element:
  show value + state + metadata if available
- Hover connections / links:
  show relation info if relevant
- Click to pin:
  keep one selected element highlighted
- Optional X-Ray mode:
  show raw variables + step number + structure state without blocking animation

SECTION 52 — State Ghost / Diff Visualization
────────────────────────────────────────────
- Show previous-state ghost subtly behind changed elements
- Highlight changed values
- Show pointer movement trails
- New additions should briefly glow brighter than stable ones
- Diff visualization should support learning, not clutter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7B — LOGIC ENFORCEMENT & STEP QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 53 — Step Completeness Rules
────────────────────────────────────
EVERY meaningful algorithm operation MUST have its own step in the STEPS array:
- Each comparison → one step with caption showing what is compared and why
- Each swap/exchange → one step with caption showing before/after values
- Each value update → one step with caption showing old → new and the reason
- Each visit/mark → one step with caption showing what was discovered
- Each state transition → one step with caption showing the state change
- Each decision (if/else/branch) → one step with caption explaining the condition and outcome
- Initialization → one step
- Completion → one step

Do NOT merge multiple operations into one step to save space.
Do NOT skip "obvious" steps — they are educational.

SECTION 54 — Caption Quality Rules
──────────────────────────────────
Every caption MUST contain:
1. WHAT is happening (the concrete action: compare, swap, update, visit, etc.)
2. WHERE it is happening (indices, positions, node names, variable names)
3. WHY it is happening (the algorithm rule, invariant, condition, or recurrence)
4. The concrete VALUES involved (actual numbers, not placeholders)

Good caption example:
"Comparing arr[3]=2 with arr[4]=4 → 2 < 4, no swap needed because arr[3] should be smaller (bubble sort invariant)"

Bad caption example:
"Processing element" or "Step 5: compare"

SECTION 55 — Variable Tracking Rules
────────────────────────────────────
All tracked variables (from Section 3) must appear in EVERY step's variables object:
- Even if a variable didn't change, include it with its current value
- Use the actual computed values, not placeholders
- Pointers/indices must show their exact position at each step
- Accumulators must show the running total
- State flags must show true/false

This ensures the sidebar can display live state at every moment.

SECTION 56 — Step Timing Logic
──────────────────────────────
timingMult values must follow these rules:
- Initialization step: timingMult = 1.5 (give viewer time to understand setup)
- Simple comparison that doesn't result in action: timingMult = 0.7
- Swap / major update: timingMult = 1.2
- Key decision / branching point: timingMult = 1.3
- Repetitive same-type operations: timingMult = 0.6 (but never below 0.5)
- Final step / completion: timingMult = 1.8 (let the result sink in)
- Steps marked important: always timingMult >= 1.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — SAFETY & ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 57 — Fail-Safe Fallback System
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

SECTION 58 — Accessibility & Performance Guardrails
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
✅ Captions are educational, logic-rich, and human-readable
✅ Every caption explains WHAT + WHERE + WHY + VALUES
✅ Every algorithm operation has its own step (no merging)
✅ Controls exist and work
✅ Keyboard shortcuts exist
✅ Non-negotiable visual requirements are implemented
✅ No blank screen fallback
✅ Input example has 7+ meaningful values
✅ Total steps are sufficient for complete algorithm trace
✅ Output ends with </html>

═══════════════════════════════════════════════════════════
FINAL REMINDER
═══════════════════════════════════════════════════════════
CRITICAL REQUIREMENTS:
1. Generate the final result now as ONE complete HTML file only.
2. The HTML MUST include a JavaScript array called STEPS with ALL algorithm steps.
3. The STEPS array must have EXACTLY ${getSteps(analysis).length} steps.
4. Each step object MUST include:
   - step
   - action
   - caption (must explain the logic, not just the action)
   - variables (all tracked variables with actual values)
   - highlight
   - important
   - timingMult
5. There MUST be a renderStep(index) function that reads the current step and updates:
   - the visual scene
   - the caption
   - the step counter
   - the stats
6. There MUST be working playback controls:
   - Reset
   - Prev
   - Play/Pause
   - Next
   - Speed
7. The Play button must move through all steps automatically.
8. The step counter must NEVER show 0/0 unless there are truly no steps.
9. The caption must preserve spaces between words.
10. Word-by-word caption rendering must use spaces correctly, for example words.join(" ").
11. Do not explain the code.
12. Do not summarize it.
13. Do not wrap it in markdown.
14. Start with <!DOCTYPE html> and end with </html>.
15. Only output the full HTML.
16. The input example must use at least 7-8 values.
17. Every step must have a caption that teaches the algorithm logic, not just describes the animation.
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

  const algorithmLogic = buildAlgorithmLogicBreakdown(analysis);

  return `
Generate a SINGLE self-contained HTML algorithm visualization.

Algorithm:
- Name: ${safe(analysis.algorithmName)}
- Category: ${safe(analysis.category)}
- Language: ${safe(analysis.language)}
- Template: ${templateType}
- Time Complexity: ${safe(analysis.timeComplexity)}
- Space Complexity: ${safe(analysis.spaceComplexity)}
- Input Example: ${safe(analysis.inputExample)}
- Expected Output: ${safe(analysis.expectedOutput)}
- Key Insight: ${safe(analysis.keyInsight)}

Algorithm Logic (MUST be reflected in steps and captions):
${algorithmLogic}

Creative Direction:
- Metaphor: ${safe(creativeDirection.metaphor)}
- Scene: ${safe(creativeDirection.sceneName)}
- Hero: ${safe(creativeDirection.heroCharacter.type)} — ${safe(
    creativeDirection.heroCharacter.look
  )}
- Hero Idle: ${safe(creativeDirection.heroCharacter.idleAnimation)}
- Hero Move: ${safe(creativeDirection.heroCharacter.moveAnimation)}
- Environment: ${safe(creativeDirection.environment.setting)}
- Background Layers: ${creativeDirection.environment.backgroundLayers.join(" | ")}
- Ambient Effects: ${creativeDirection.environment.ambientEffects.join(" | ")}

Object Mapping:
${formatObjectMapping(objectMapping)}

Color Palette:
- primary: ${safe(creativeDirection.colorPalette.primary)}
- secondary: ${safe(creativeDirection.colorPalette.secondary)}
- accent: ${safe(creativeDirection.colorPalette.accent)}
- danger: ${safe(creativeDirection.colorPalette.danger)}
- background: ${safe(creativeDirection.colorPalette.background)}

Important Variables:
${variables.map((v) => `- ${v.name}: ${v.meaning}`).join("\n")}

Non-Negotiable Visual Requirements:
${creativeDirection.nonNegotiableVisualRequirements
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

Domain Animations:
${creativeDirection.domainAnimations
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

Dramatic Moments:
${creativeDirection.dramaticMoments
  .map((item, index) => `${index + 1}. ${item}`)
  .join("\n")}

Steps (${steps.length} total):
${steps
  .map(
    (step) =>
      `${step.step}. [${step.action}${step.important ? " ★" : ""}] ${step.caption} | vars=${compactJSON(
        step.variables
      )} | timing=${step.timingMult}`
  )
  .join("\n")}

Required Output Rules:
- Output ONLY one full HTML document
- Use Vanilla HTML/CSS/JS
- Must work in iframe srcdoc
- MUST include const STEPS = [...] array with ALL ${getSteps(analysis).length} steps
- Each step MUST have: step, action, caption, variables, highlight, important, timingMult
- MUST include renderStep(index) function that updates visuals per step
- MUST include playback controls: Reset, Prev, Play/Pause, Next, Speed
- MUST show step counter as "X / Y" format (never show 0 / 0)
- MUST show caption with proper spaces between words
- Play button must auto-advance through all steps with timing delays
- Include stats bar, caption bar, right sidebar
- No markdown
- HTML must start with <!DOCTYPE html> and end with </html>
- Must look specific to ${safe(analysis.algorithmName)}, not generic
- Word-by-word caption must use words.join(" ") with spaces preserved
- Input example must use at least 7-8 values — if provided input is shorter, generate a representative example
- Every caption must explain the LOGIC: what is happening, where, why, and with what values
- Do not merge multiple operations into one step
- Every comparison, swap, update, visit, and decision must be its own step
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
    return Math.max(arrayMatches.length, 8);
  }

  if (text.includes(",")) {
    return Math.max(text.split(",").length, 8);
  }

  return Math.max(Math.min(stepCount, 12), 8);
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
      const logicReason = inferLogicReason(step.action, analysis, step);
      const decisionRule = inferDecisionRule(step.action, analysis, step);
      const stateBeforeAfter = inferStateBeforeAfter(step, analysis);

      return `STEP ${step.step}${step.important ? " ⭐" : ""}:
  State: ${compactJSON(step.variables)}
  Technical Action: ${step.description}
  Logic Reason: ${logicReason}
  Decision Rule: ${decisionRule}
  State Before → After: ${stateBeforeAfter}
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

// ═══════════════════════════════════════════════════
// LOGIC ENHANCEMENT HELPERS (NEW)
// ═══════════════════════════════════════════════════

function buildAlgorithmLogicBreakdown(analysis: AnalysisResult): string {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();
  const description = safe(analysis.description);
  const keyInsight = safe(analysis.keyInsight);
  const timeComplexity = safe(analysis.timeComplexity);
  const spaceComplexity = safe(analysis.spaceComplexity);
  const expectedOutput = safe(analysis.expectedOutput);

  const lines: string[] = [];

  lines.push(`ALGORITHM GOAL (what it computes):`);
  lines.push(`${description}`);
  lines.push(``);

  lines.push(`EXPECTED OUTPUT FORMAT:`);
  lines.push(`${expectedOutput}`);
  lines.push(``);

  lines.push(`KEY INSIGHT (the core idea that makes this algorithm work):`);
  lines.push(`${keyInsight}`);
  lines.push(``);

  if (category.includes("sorting")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Comparison-based sorting`);
    lines.push(`- Invariant: After each pass/phase, a portion of the array is in its final sorted position`);
    lines.push(`- Approach: Repeatedly compare adjacent or candidate elements and reorder them`);
    lines.push(`- Termination: When the full array is sorted (no more swaps needed or all subarrays merged)`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Every comparison produces correct relative ordering information`);
    lines.push(`- Every swap moves an element closer to its final position`);
    lines.push(`- The algorithm terminates because progress is guaranteed each iteration`);
  } else if (category.includes("graph")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Graph traversal / search`);
    lines.push(`- Invariant: Visited set tracks explored nodes; frontier tracks candidates`);
    lines.push(`- Approach: Systematically explore neighbors, update distances/states`);
    lines.push(`- Termination: When frontier is empty or target is found`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Each node is visited at most once (or with an optimal guarantee)`);
    lines.push(`- Distance updates follow the relaxation / expansion property`);
    lines.push(`- The search order ensures correctness (FIFO for BFS, priority for Dijkstra, etc.)`);
  } else if (category.includes("dp")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Dynamic Programming / tabulation or memoization`);
    lines.push(`- Invariant: Each subproblem's answer is computed exactly once from smaller subproblems`);
    lines.push(`- Approach: Build a table of solutions bottom-up (or top-down with memo)`);
    lines.push(`- Termination: When the final subproblem (the answer) is computed`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Optimal substructure: optimal solution contains optimal solutions to subproblems`);
    lines.push(`- Overlapping subproblems: same subproblems are solved multiple times (hence memo)`);
    lines.push(`- Table fill order respects dependencies (no subproblem is used before it is computed)`);
  } else if (category.includes("binary search")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Divide and conquer / search`);
    lines.push(`- Invariant: The target, if it exists, lies within [left, right]`);
    lines.push(`- Approach: Eliminate half the search space each iteration by comparing mid with target`);
    lines.push(`- Termination: When left > right (not found) or mid == target (found)`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Each iteration reduces the search space by at least half`);
    lines.push(`- The invariant is maintained: if target exists, it stays in [left, right]`);
    lines.push(`- Logarithmic number of iterations guarantees O(log n) time`);
  } else if (category.includes("two pointer")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Two pointer / boundary scan`);
    lines.push(`- Invariant: The active window or boundary correctly partitions processed and unprocessed elements`);
    lines.push(`- Approach: Move left/right pointers based on a condition, narrowing or expanding the window`);
    lines.push(`- Termination: When pointers meet/cross or the full array is processed`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Each pointer movement makes progress (advances toward termination)`);
    lines.push(`- The condition being checked at each step correctly identifies the needed property`);
    lines.push(`- No valid solution is skipped because the pointer movement rules are exhaustive`);
  } else if (category.includes("backtracking")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Backtracking / exhaustive search with pruning`);
    lines.push(`- Invariant: The current path is always a valid partial solution`);
    lines.push(`- Approach: Try each option, recurse, undo (backtrack) if it doesn't lead to a solution`);
    lines.push(`- Termination: When all paths are explored or a complete solution is found`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Every possible solution is either explored or provably pruned`);
    lines.push(`- Backtracking correctly restores state so the next option can be tried cleanly`);
    lines.push(`- Pruning (if any) only skips branches that cannot contain a valid solution`);
  } else if (category.includes("recursion")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Recursive divide-and-conquer or recursive enumeration`);
    lines.push(`- Invariant: Each recursive call solves a strictly smaller subproblem`);
    lines.push(`- Approach: Break the problem into subproblems, solve recursively, combine results`);
    lines.push(`- Termination: Base case is reached (smallest subproblem with known answer)`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Base case is correct (handles the smallest input correctly)`);
    lines.push(`- Recursive step correctly reduces the problem and combines sub-results`);
    lines.push(`- The recursion terminates because each call strictly reduces the problem size`);
  } else if (category.includes("greedy")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Greedy / locally optimal choice`);
    lines.push(`- Invariant: After each step, the partial solution can still be extended to an optimal solution`);
    lines.push(`- Approach: At each step, make the locally best choice without reconsidering past choices`);
    lines.push(`- Termination: When all elements are processed or the solution is complete`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Greedy choice property: a locally optimal choice is part of some globally optimal solution`);
    lines.push(`- No backtracking needed because earlier choices never need to be undone`);
    lines.push(`- The algorithm is correct if the greedy choice property and optimal substructure both hold`);
  } else if (category.includes("stack") || category.includes("queue")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Stack/Queue-based processing`);
    lines.push(`- Invariant: The data structure maintains the correct processing order (LIFO/FIFO)`);
    lines.push(`- Approach: Push/enqueue candidates, pop/dequeue and process in order`);
    lines.push(`- Termination: When the structure is empty or the goal is reached`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- The order of processing matches the algorithm's requirements`);
    lines.push(`- Each element is processed exactly once (or a bounded number of times)`);
    lines.push(`- The structure's LIFO/FIFO discipline ensures correctness`);
  } else if (category.includes("tree")) {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Type: Tree traversal / tree DP / tree manipulation`);
    lines.push(`- Invariant: Each node is visited in an order that respects parent-child dependencies`);
    lines.push(`- Approach: Traverse the tree (pre/in/post/level order), compute values at each node`);
    lines.push(`- Termination: When all nodes have been visited`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- The traversal order ensures children are processed before/after parents as needed`);
    lines.push(`- Tree properties (acyclic, connected) guarantee each node is visited exactly once`);
    lines.push(`- Results combine correctly along the tree structure`);
  } else {
    lines.push(`ALGORITHM STRATEGY:`);
    lines.push(`- Approach: ${description}`);
    lines.push(`- Key Insight: ${keyInsight}`);
    lines.push(``);
    lines.push(`LOGICAL CORRECTNESS:`);
    lines.push(`- Each step makes measurable progress toward the final answer`);
    lines.push(`- The algorithm terminates because progress is bounded and monotonic`);
    lines.push(`- The final state correctly represents the solution`);
  }

  lines.push(``);
  lines.push(`COMPLEXITY:`);
  lines.push(`- Time: ${timeComplexity}`);
  lines.push(`- Space: ${spaceComplexity}`);

  return lines.join("\n");
}

function buildDecisionRuleCatalog(
  analysis: AnalysisResult,
  steps: NormalizedStep[]
): string {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();
  const lines: string[] = [];

  lines.push(`Every critical decision point in the algorithm must be explicitly explained in the visualization.`);
  lines.push(``);

  if (category.includes("sorting")) {
    lines.push(`DECISION RULES FOR SORTING:`);
    lines.push(`1. COMPARISON: Compare two elements A[i] and A[j]`);
    lines.push(`   - If A[i] > A[j] → swap (or select A[j] for merge)`);
    lines.push(`   - If A[i] ≤ A[j] → no action, elements are in correct relative order`);
    lines.push(`   - WHY: Maintains the sorted invariant for the processed portion`);
    lines.push(`2. SWAP DECISION: Swap only when the relative order is wrong`);
    lines.push(`   - WHY: Each swap reduces the number of inversions by exactly 1`);
    lines.push(`3. PASS COMPLETION: When no swaps occur in a pass → array is sorted`);
    lines.push(`   - WHY: If no element is out of order relative to its neighbor, the array is fully sorted`);
  } else if (name.includes("merge sort")) {
    lines.push(`DECISION RULES FOR MERGE SORT:`);
    lines.push(`1. SPLIT DECISION: Divide array into two halves`);
    lines.push(`   - WHY: Halving guarantees O(log n) levels of recursion`);
    lines.push(`2. MERGE COMPARISON: Compare left[i] and right[j]`);
    lines.push(`   - If left[i] ≤ right[j] → take left[i]`);
    lines.push(`   - If left[i] > right[j] → take right[j]`);
    lines.push(`   - WHY: Since both halves are already sorted, the smallest remaining element is always at left[i] or right[j]`);
    lines.push(`3. EXHAUSTION: When one half is exhausted → copy remaining elements from the other half`);
    lines.push(`   - WHY: Remaining elements are already sorted and larger than all placed elements`);
  } else if (name.includes("quick sort")) {
    lines.push(`DECISION RULES FOR QUICK SORT:`);
    lines.push(`1. PIVOT SELECTION: Choose a pivot element`);
    lines.push(`   - WHY: The pivot divides the problem into two independent subproblems`);
    lines.push(`2. PARTITION DECISION: For each element, compare with pivot`);
    lines.push(`   - If element ≤ pivot → place in left partition`);
    lines.push(`   - If element > pivot → place in right partition`);
    lines.push(`   - WHY: After partition, pivot is in its final sorted position`);
    lines.push(`3. RECURSE: Sort left and right partitions independently`);
    lines.push(`   - WHY: Elements in different partitions never need to be compared again`);
  } else if (category.includes("binary search")) {
    lines.push(`DECISION RULES FOR BINARY SEARCH:`);
    lines.push(`1. MIDPOINT CALCULATION: mid = Math.floor((left + right) / 2)`);
    lines.push(`   - WHY: Checking the middle element eliminates half the search space`);
    lines.push(`2. COMPARISON DECISION: Compare arr[mid] with target`);
    lines.push(`   - If arr[mid] === target → FOUND, return mid`);
    lines.push(`   - If arr[mid] < target → search right half (left = mid + 1)`);
    lines.push(`   - If arr[mid] > target → search left half (right = mid - 1)`);
    lines.push(`   - WHY: Sorted order guarantees target can only be in one half`);
    lines.push(`3. TERMINATION: left > right → target not found`);
    lines.push(`   - WHY: Search space is empty, target cannot exist`);
  } else if (category.includes("graph")) {
    lines.push(`DECISION RULES FOR GRAPH TRAVERSAL:`);
    lines.push(`1. FRONTIER POP: Remove next node from frontier (queue for BFS, stack for DFS, priority for Dijkstra)`);
    lines.push(`   - WHY: The order of exploration determines the traversal type and correctness`);
    lines.push(`2. NEIGHBOR EVALUATION: For each unvisited neighbor`);
    lines.push(`   - Mark as visited`);
    lines.push(`   - Update distance/state if better`);
    lines.push(`   - Add to frontier`);
    lines.push(`   - WHY: Systematic exploration ensures all reachable nodes are found`);
    lines.push(`3. VISITED CHECK: Skip already-visited nodes`);
    lines.push(`   - WHY: Prevents infinite loops and redundant work in cyclic graphs`);
  } else if (category.includes("dp")) {
    lines.push(`DECISION RULES FOR DYNAMIC PROGRAMMING:`);
    lines.push(`1. BASE CASE: Initialize known answers for smallest subproblems`);
    lines.push(`   - WHY: These serve as the foundation for building larger solutions`);
    lines.push(`2. TRANSITION / RECURRENCE: Compute dp[i] from previously computed values`);
    lines.push(`   - dp[i] = f(dp[i-1], dp[i-2], ...)`);
    lines.push(`   - WHY: Optimal substructure means the answer to a larger problem depends on smaller ones`);
    lines.push(`3. FILL ORDER: Process subproblems in dependency order`);
    lines.push(`   - WHY: A subproblem can only be computed after all its dependencies are ready`);
    lines.push(`4. ANSWER EXTRACTION: The final answer is at a specific table location`);
    lines.push(`   - WHY: The table builds up the solution incrementally to this point`);
  } else if (category.includes("two pointer")) {
    lines.push(`DECISION RULES FOR TWO POINTER:`);
    lines.push(`1. POINTER INITIALIZATION: left = 0, right = n-1 (or similar)`);
    lines.push(`   - WHY: Start from the two extremes to maximize the initial window/range`);
    lines.push(`2. MOVEMENT DECISION: Based on condition at current (left, right)`);
    lines.push(`   - If condition satisfied → move one pointer (record/update answer)`);
    lines.push(`   - If condition not satisfied → move the other pointer`);
    lines.push(`   - WHY: Each movement makes progress and maintains correctness`);
    lines.push(`3. TERMINATION: Pointers meet or cross`);
    lines.push(`   - WHY: All relevant pairs/windows have been considered`);
  } else {
    lines.push(`DECISION RULES (derive from algorithm behavior):`);
    lines.push(`1. Identify the key condition/branch in the algorithm`);
    lines.push(`2. For each branch: what triggers it and what does it accomplish?`);
    lines.push(`3. What guarantees termination?`);
    lines.push(`4. What invariant is maintained at each step?`);
  }

  lines.push(``);
  lines.push(`DECISION STEPS FOUND IN TRACE: ${steps.filter(s => s.action.toLowerCase().includes("compare") || s.action.toLowerCase().includes("decide") || s.action.toLowerCase().includes("check") || s.action.toLowerCase().includes("if")).length} decision points`);

  return lines.join("\n");
}

function buildStateEvolutionTable(
  analysis: AnalysisResult,
  steps: NormalizedStep[]
): string {
  const variables = getVariables(analysis);
  const lines: string[] = [];

  lines.push(`Track these variables through EVERY step. Their values must appear in the variables object of each step.`);
  lines.push(``);

  if (variables.length === 0) {
    lines.push(`- stepIndex: current step number (always present)`);
    lines.push(`- activeState: what the algorithm is currently doing`);
    lines.push(`- result: accumulated or computed result so far`);
  } else {
    variables.forEach((v) => {
      lines.push(`- ${v.name}: ${v.meaning}`);
      lines.push(`  MUST appear in every step's variables object with its current value`);
    });
  }

  lines.push(``);
  lines.push(`EVOLUTION PATTERN:`);
  lines.push(`- Initialization step: all variables at their starting values`);
  lines.push(`- Processing steps: variables change according to the algorithm's logic`);
  lines.push(`- Decision steps: may or may not change variables (but still show current values)`);
  lines.push(`- Completion step: all variables at their final values`);
  lines.push(``);
  lines.push(`Total steps in trace: ${steps.length}`);
  lines.push(`Unique actions: ${Array.from(new Set(steps.map(s => s.action))).join(", ")}`);

  return lines.join("\n");
}

function buildCorrectnessProof(analysis: AnalysisResult): string {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();
  const keyInsight = safe(analysis.keyInsight);
  const lines: string[] = [];

  lines.push(`WHY THIS ALGORITHM IS CORRECT:`);
  lines.push(``);

  if (category.includes("sorting")) {
    lines.push(`1. INVARIANT: After each pass/merge/partition, the processed portion is correctly sorted`);
    lines.push(`2. PROGRESS: Each operation reduces the "disorder" (inversions, unsorted portions)`);
    lines.push(`3. TERMINATION: The number of operations is bounded (at most n² comparisons, or n log n phases)`);
    lines.push(`4. CORRECTNESS: When the algorithm terminates, the invariant covers the entire array → fully sorted`);
  } else if (category.includes("binary search")) {
    lines.push(`1. INVARIANT: The target, if it exists, is always in the range [left, right]`);
    lines.push(`2. PROGRESS: Each iteration reduces the range by at least half (left advances or right retreats)`);
    lines.push(`3. TERMINATION: The range shrinks each iteration, so left > right is reached in O(log n) steps`);
    lines.push(`4. CORRECTNESS: If found, mid === target. If not found, the range is empty → target doesn't exist`);
  } else if (category.includes("dp")) {
    lines.push(`1. OPTIMAL SUBSTRUCTURE: An optimal solution to the full problem uses optimal solutions to subproblems`);
    lines.push(`2. OVERLAPPING SUBPROBLEMS: The same subproblems recur, so computing each once saves exponential work`);
    lines.push(`3. BASE CASE CORRECTNESS: The smallest subproblems are initialized with correct known values`);
    lines.push(`4. TRANSITION CORRECTNESS: Each dp[i] is correctly computed from its dependencies`);
    lines.push(`5. FINAL ANSWER: The table entry corresponding to the full problem contains the correct answer`);
  } else if (category.includes("graph")) {
    lines.push(`1. COMPLETENESS: Every reachable node is eventually visited (frontier exhausts all reachable nodes)`);
    lines.push(`2. CORRECTNESS OF UPDATES: Distance/state updates use the correct relaxation/expansion rule`);
    lines.push(`3. NO DUPLICATES: Visited set prevents reprocessing (or priority queue ensures optimal first visit)`);
    lines.push(`4. TERMINATION: Finite graph + no-revisit guarantee → algorithm terminates`);
  } else if (category.includes("greedy")) {
    lines.push(`1. GREEDY CHOICE PROPERTY: The locally optimal choice at each step is part of some globally optimal solution`);
    lines.push(`2. OPTIMAL SUBSTRUCTURE: After making the greedy choice, the remaining problem has the same structure`);
    lines.push(`3. NO BACKTRACKING NEEDED: Earlier choices are never reconsidered because they are provably correct`);
  } else if (category.includes("backtracking")) {
    lines.push(`1. EXHAUSTIVENESS: Every possible solution is either generated or provably pruned`);
    lines.push(`2. PRUNING SAFETY: Only branches that cannot lead to valid solutions are cut`);
    lines.push(`3. STATE RESTORATION: Backtracking correctly undoes choices so the next option can be tried`);
    lines.push(`4. TERMINATION: Bounded depth + finite choices at each level → eventually all paths are explored`);
  } else if (category.includes("two pointer")) {
    lines.push(`1. INVARIANT: The pointers correctly partition the array into processed and unprocessed regions`);
    lines.push(`2. EXHAUSTIVENESS: No valid pair/window is missed because the movement rules cover all cases`);
    lines.push(`3. PROGRESS: At least one pointer moves each iteration, so termination is guaranteed`);
  } else {
    lines.push(`1. The algorithm maintains an invariant that is true before and after each step`);
    lines.push(`2. Each step makes measurable progress toward the final answer`);
    lines.push(`3. Termination is guaranteed by a bounded number of operations`);
    lines.push(`4. When the algorithm terminates, the invariant implies the answer is correct`);
  }

  lines.push(``);
  lines.push(`KEY INSIGHT (reinforced): "${keyInsight}"`);

  return lines.join("\n");
}

function buildComplexityReasoningTrace(
  analysis: AnalysisResult,
  steps: NormalizedStep[]
): string {
  const timeComplexity = safe(analysis.timeComplexity);
  const spaceComplexity = safe(analysis.spaceComplexity);
  const category = safe(analysis.category).toLowerCase();
  const lines: string[] = [];

  lines.push(`TIME COMPLEXITY: ${timeComplexity}`);
  lines.push(`WHERE IT COMES FROM IN THE TRACE:`);

  if (timeComplexity.includes("n²") || timeComplexity.includes("n^2")) {
    lines.push(`- The algorithm has nested iterations (outer pass × inner scan)`);
    lines.push(`- Each pass processes O(n) elements`);
    lines.push(`- There are O(n) passes → total O(n²) operations`);
    lines.push(`- In this trace: ${steps.length} steps for the given input`);
  } else if (timeComplexity.includes("n log n") || timeComplexity.includes("n·log")) {
    lines.push(`- The algorithm divides the problem O(log n) times (levels of recursion/splits)`);
    lines.push(`- Each level processes O(n) total work (merging, partitioning, etc.)`);
    lines.push(`- Total: O(n) × O(log n) = O(n log n)`);
    lines.push(`- In this trace: ${steps.length} steps for the given input`);
  } else if (timeComplexity.includes("log n")) {
    lines.push(`- Each iteration eliminates roughly half the search space`);
    lines.push(`- Starting with n elements, halving log₂(n) times leaves 1 element`);
    lines.push(`- Total: O(log n) iterations`);
    lines.push(`- In this trace: ${steps.length} steps for the given input`);
  } else if (timeComplexity.includes("n")) {
    lines.push(`- The algorithm processes each element a constant number of times`);
    lines.push(`- Total: O(n) operations`);
    lines.push(`- In this trace: ${steps.length} steps for the given input`);
  } else {
    lines.push(`- Refer to the algorithm's loop structure and recursion depth`);
    lines.push(`- In this trace: ${steps.length} steps for the given input`);
  }

  lines.push(``);
  lines.push(`SPACE COMPLEXITY: ${spaceComplexity}`);
  lines.push(`WHERE IT COMES FROM:`);

  if (spaceComplexity.includes("n")) {
    lines.push(`- The algorithm uses additional data structures proportional to input size`);
  } else if (spaceComplexity.includes("log n")) {
    lines.push(`- The algorithm's recursion depth or auxiliary space is O(log n)`);
  } else {
    lines.push(`- The algorithm uses a constant amount of extra space`);
  }

  lines.push(``);
  lines.push(`NOTE FOR VISUALIZATION: The stats bar should show live step count, and the final stats card should show the total number of steps (${steps.length}) alongside the complexity to help the viewer connect the abstract complexity to the concrete execution.`);

  return lines.join("\n");
}

function buildLogicEdgeCaseProofs(analysis: AnalysisResult): string {
  const category = safe(analysis.category).toLowerCase();
  const name = safe(analysis.algorithmName).toLowerCase();
  const lines: string[] = [];

  lines.push(`EDGE CASES — LOGIC PROOF (not just UI behavior):`);
  lines.push(``);

  lines.push(`1. EMPTY INPUT (n = 0):`);
  if (category.includes("sorting")) {
    lines.push(`   - Logic: No elements to compare → no iterations → trivially sorted`);
    lines.push(`   - Output: empty array or zero`);
  } else if (category.includes("binary search")) {
    lines.push(`   - Logic: Range [0, -1] is invalid immediately → left > right → not found`);
    lines.push(`   - Output: -1 or false`);
  } else if (category.includes("dp")) {
    lines.push(`   - Logic: No subproblems to solve → base case answer is the final answer`);
    lines.push(`   - Output: base case value (often 0, 1, or empty)`);
  } else {
    lines.push(`   - Logic: No work to do → return trivial/default answer`);
  }
  lines.push(``);

  lines.push(`2. SINGLE ELEMENT (n = 1):`);
  if (category.includes("sorting")) {
    lines.push(`   - Logic: One element is trivially sorted → no comparisons needed`);
  } else if (category.includes("binary search")) {
    lines.push(`   - Logic: mid = 0 → one comparison → found or not found`);
  } else {
    lines.push(`   - Logic: One element is the base case or trivially solved`);
  }
  lines.push(``);

  lines.push(`3. ALREADY IN CORRECT STATE:`);
  if (category.includes("sorting")) {
    lines.push(`   - Logic: Array already sorted → comparisons still happen but no swaps occur`);
    lines.push(`   - Best case applies (O(n) for bubble sort with early termination)`);
  } else {
    lines.push(`   - Logic: Algorithm still runs but no corrective actions are needed`);
  }
  lines.push(``);

  lines.push(`4. DUPLICATES:`);
  lines.push(`   - Logic: Algorithm must handle equal values correctly (stability, comparison rules)`);
  lines.push(`   - Equal elements should follow the algorithm's tie-breaking rule`);
  lines.push(``);

  lines.push(`5. REVERSE / WORST CASE ORDER:`);
  if (category.includes("sorting")) {
    lines.push(`   - Logic: Maximum number of inversions → maximum swaps/comparisons`);
    lines.push(`   - Worst case complexity applies`);
  } else {
    lines.push(`   - Logic: The algorithm may take more steps but still produces the correct answer`);
  }
  lines.push(``);

  lines.push(`6. NEGATIVE / ZERO VALUES (if applicable):`);
  lines.push(`   - Logic: Algorithm should work with any comparable values, not just positive integers`);
  lines.push(`   - Verify comparison rules handle negative values correctly`);

  return lines.join("\n");
}

function inferLogicReason(
  action: string,
  analysis: AnalysisResult,
  step: NormalizedStep
): string {
  const lower = action.toLowerCase();
  const category = safe(analysis.category).toLowerCase();
  const keyInsight = safe(analysis.keyInsight);

  if (lower.includes("initialize")) {
    return "Setting up initial state so the algorithm has a known starting point. All accumulators start at zero, pointers at their starting positions, and the input is loaded into the working structure.";
  }

  if (lower.includes("compare")) {
    if (category.includes("sorting")) {
      return "Comparing two elements to determine their relative order. If they are out of order, a swap is needed to maintain the sorted invariant. This comparison reveals which element should come first.";
    }
    if (category.includes("binary search")) {
      return "Comparing the middle element with the target. This comparison determines which half of the search space can be safely eliminated, reducing the problem by half.";
    }
    return "Comparing two values to make a decision. The comparison result determines the next action (swap, move pointer, update state, etc.).";
  }

  if (lower.includes("swap")) {
    if (category.includes("sorting")) {
      return "Exchanging two out-of-order elements. Each swap reduces the number of inversions by at least 1, moving the array closer to sorted order.";
    }
    return "Swapping two elements to correct their relative position or to rearrange the data structure.";
  }

  if (lower.includes("update")) {
    return `Recording a new value for a tracked variable. This update reflects new information discovered by the algorithm: ${keyInsight}`;
  }

  if (lower.includes("visit")) {
    if (category.includes("graph")) {
      return "Marking a node as visited and processing its neighbors. This ensures each node is handled exactly once and its connections are explored.";
    }
    return "Accessing a new element or position. This represents progress through the data structure.";
  }

  if (lower.includes("push") || lower.includes("enqueue")) {
    return "Adding an element to the working structure for later processing. The order of addition determines the processing order (LIFO for stack, FIFO for queue).";
  }

  if (lower.includes("pop") || lower.includes("dequeue")) {
    return "Removing the next element to process. This element was added earlier and is now ready for action.";
  }

  if (lower.includes("split") || lower.includes("divide")) {
    return "Dividing the problem into smaller subproblems. Each subproblem is strictly smaller, ensuring progress toward the base case.";
  }

  if (lower.includes("merge")) {
    return "Combining two sorted sub-arrays into one sorted array. Since both halves are sorted, we only need to compare the front elements.";
  }

  if (lower.includes("return") || lower.includes("backtrack")) {
    return "Returning a result to the caller or undoing a choice. This represents either combining sub-results or exploring an alternative path.";
  }

  if (lower.includes("found")) {
    return "The algorithm has identified the target / completed the solution. This is the termination condition being satisfied.";
  }

  if (lower.includes("complete")) {
    return "The algorithm has finished all work. The final state represents the correct answer to the problem.";
  }

  if (step.important) {
    return `This is a critical step in the algorithm. The key insight applies here: "${keyInsight}"`;
  }

  return "This step advances the algorithm's progress. It applies the algorithm's core logic to transform the current state closer to the final answer.";
}

function inferDecisionRule(
  action: string,
  analysis: AnalysisResult,
  step: NormalizedStep
): string {
  const lower = action.toLowerCase();
  const category = safe(analysis.category).toLowerCase();
  const vars = step.variables as Record<string, any>;

  if (lower.includes("compare")) {
    const varKeys = Object.keys(vars);
    if (varKeys.length >= 2) {
      const entries = varKeys.slice(0, 4).map(k => `${k}=${vars[k]}`).join(", ");
      return `Based on current state (${entries}): determine relative order or condition, then take appropriate action (swap / advance / update).`;
    }
    return "Evaluate the condition between two values, then branch to the appropriate action.";
  }

  if (lower.includes("swap")) {
    return "The comparison showed incorrect relative order → swap to fix it.";
  }

  if (lower.includes("update")) {
    const varKeys = Object.keys(vars);
    if (varKeys.length > 0) {
      const entries = varKeys.slice(0, 3).map(k => `${k}=${vars[k]}`).join(", ");
      return `New information computed → update affected variables (${entries}).`;
    }
    return "New information was computed → update the relevant variables.";
  }

  if (lower.includes("decide") || lower.includes("check") || lower.includes("if")) {
    return "Evaluate a condition: if true, take one branch; if false, take another.";
  }

  if (lower.includes("visit")) {
    return "The node/element has not been visited yet → mark it and process its connections.";
  }

  if (lower.includes("push") || lower.includes("enqueue")) {
    return "This element needs future processing → add it to the working structure.";
  }

  if (lower.includes("pop") || lower.includes("dequeue")) {
    return "The next element in the structure is ready → remove and process it.";
  }

  return "Apply the algorithm's logic rule to the current state and determine the next action.";
}

function inferStateBeforeAfter(
  step: NormalizedStep,
  analysis: AnalysisResult
): string {
  const vars = step.variables as Record<string, any>;
  const varKeys = Object.keys(vars);

  if (varKeys.length === 0) {
    return "State variables are shown in the step's variables object. Compare with the previous step to see what changed.";
  }

  const changes = varKeys.map(k => `${k}=${vars[k]}`).join(", ");
  return `Current state after this step: ${changes}`;
}