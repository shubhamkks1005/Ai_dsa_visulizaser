// lib/ai/prompts.ts

import { AnalysisResult } from "@/types";
import { CreativeScene, TechnicalSpec } from "@/types";

// ═══════════════════════════════════════════════════
// 1. CREATIVE PROMPT
// Model: DeepSeek V3 (primary) → Qwen 80B (fallback)
// Output: CreativeScene JSON
// ═══════════════════════════════════════════════════

export function buildCreativePrompt(analysis: AnalysisResult): string {
  const categoryHints = getCreativityHints(analysis.category);

  // Build variable list for context
  const varList = Array.isArray(analysis.variables)
    ? analysis.variables
        .map((v: any) =>
          typeof v === 'string' ? v : `${v.name} (${v.meaning})`
        )
        .join(', ')
    : '';

  return `You are a world-class creative visual director specializing in cinematic algorithm animations.

Your job: Given an algorithm analysis, create a RICH and SPECIFIC visual scene specification.
This will be used to generate a beautiful HTML/CSS/JS visualization.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALGORITHM ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:                 ${analysis.algorithmName}
Category:             ${analysis.category}
Description:          ${analysis.description}
Physical Metaphor:    ${analysis.physicalInterpretation}
Key Insight:          ${analysis.keyInsight}
Input Example:        ${analysis.inputExample}
Variables:            ${varList}
Steps Count:          ${analysis.steps?.length ?? 0}
Time Complexity:      ${analysis.timeComplexity}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${categoryHints}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY CREATIVITY RULES:
1. METAPHOR: You MUST infer a vivid real-world metaphor from the algorithm behavior.
   Do NOT use generic terms like "elements" or "process".
   Use specific physical scenarios.

2. HERO CHARACTER: You MUST define a specific hero character — NOT just a pointer/arrow.
   Examples: a frog, an explorer, a chef, a GPS navigator, a bubble, a detective.
   The character must have personality and a specific look.

3. ENVIRONMENT: You MUST define a rich environment — NOT just a background color.
   Examples: moonlit swamp with lily pads, rainy city skyline, ancient cave system.
   Include multiple background layers and ambient effects.

4. OBJECT MAPPING: You MUST map EVERY code element to a specific visual object.
   Example:
     heights[] = stone platforms of varying heights
     left pointer = glowing green beacon
     right pointer = glowing red beacon
     water = blue translucent liquid fill

5. STEP MAPPING: You MUST describe what happens VISUALLY for each action type.
   Be specific about animations, not vague.

6. NON-NEGOTIABLE: List requirements that MUST appear in the final visualization.
   These override everything else.
   Be very specific: "Show an actual frog sprite jumping with arc trajectory"
   NOT: "show movement"

THINK ABOUT:
- What would Pixar show in 5 seconds to explain this algorithm?
- Can a viewer GUESS the algorithm just by watching?
- What makes this visualization DIFFERENT from generic bars?
- What emotions should the viewer feel? (excitement, tension, satisfaction)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY valid JSON. No explanation before or after.

{
  "metaphor": "One vivid sentence: [Character] is [doing what] to [achieve what goal]",
  "sceneName": "Short evocative scene name (3-5 words)",
  "heroCharacter": {
    "type": "frog / explorer / detective / sorter / navigator / bubble / chef / etc",
    "look": "Specific emoji or visual description (e.g. 🐸 green frog with big eyes)",
    "idleAnimation": "What character does when waiting (e.g. breathing gently, eyes blinking)",
    "moveAnimation": "How character moves between positions (e.g. arcing jump with trail)"
  },
  "environment": {
    "setting": "Full rich scene description (2-3 sentences)",
    "backgroundLayers": [
      "layer1 description (furthest back)",
      "layer2 description (middle)",
      "layer3 description (closest)"
    ],
    "ambientEffects": [
      "effect1 (e.g. fireflies floating, rain drops, dust motes)",
      "effect2"
    ]
  },
  "objectMapping": {
    "codeElementName": "visual representation description",
    "anotherElement": "visual representation description"
  },
  "colorPalette": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor",
    "danger": "#hexcolor",
    "background": "#hexcolor"
  },
  "stepToSceneMapping": [
    {
      "stepType": "initialize / compare / swap / update / found / complete / etc",
      "visual": "Specific description of what appears visually",
      "animation": "Which animation style (arc jump / water fill / shake / glow / etc)"
    }
  ],
  "dramaticMoments": [
    "Description of first key dramatic moment",
    "Description of halfway milestone",
    "Description of the biggest single operation",
    "Description of the final completion moment"
  ],
  "nonNegotiableVisualRequirements": [
    "Very specific requirement 1 (what MUST be visible)",
    "Very specific requirement 2",
    "Very specific requirement 3",
    "Very specific requirement 4"
  ]
}`;
}

// ═══════════════════════════════════════════════════
// 2. TECHNICAL PROMPT
// Model: Qwen 80B (primary) → DeepSeek V3 (fallback)
// Output: TechnicalSpec JSON
// ═══════════════════════════════════════════════════

export function buildTechnicalPrompt(analysis: AnalysisResult): string {

  // Build steps summary for context
  const stepsSummary = (analysis.steps || [])
    .slice(0, 10) // first 10 for context
    .map(s => `  ${s.step}. [${s.action}] ${s.caption}`)
    .join('\n');

  // Build variable list
  const varList = Array.isArray(analysis.variables)
    ? analysis.variables
        .map((v: any) =>
          typeof v === 'string' ? v : v.name
        )
        .slice(0, 8)
        .join(', ')
    : '';

  return `You are a senior technical architect for algorithm visualizations.

Your job: Given an algorithm analysis, define the TECHNICAL SPECIFICATION
for a prebuilt visualization system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALGORITHM ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:            ${analysis.algorithmName}
Category:        ${analysis.category}
Variables:       ${varList}
Data Structures: ${(analysis.dataStructures || []).join(', ')}
Steps Count:     ${analysis.steps?.length ?? 0}
Time Complexity: ${analysis.timeComplexity}

First 10 Steps:
${stepsSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREBUILT SYSTEM CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following are ALREADY BUILT and available.
Do NOT describe regenerating them. Only reference by name.

FIXED UI (always present):
  - Top stats bar with animated counters
  - Bottom caption bar with word-by-word reveal
  - Controls: Reset, Prev, Play/Pause, Next, Speed (0.5x→3x)
  - Progress bar (top of controls)
  - Right sidebar panel (variables auto-updated)
  - Layout grid: stats / scene / caption / controls / sidebar

FIXED JS ENGINE (always present):
  - renderStep(index) — calls renderScene(step, index)
  - PlaybackEngine — play/pause/next/prev/reset/speed
  - CaptionEngine  — setCaption(), showImportantCaption()
  - StatsEngine    — updateStat(), updateVariables()
  - initVisualization(config) — master init function

AVAILABLE ANIMATION UTILITIES (call by name):
  Movement:   moveTo, moveArc, moveArcHigh, springTo, slideIn, slideOut
  Visibility: fadeIn, fadeOut, fadeInUp, fadeOutUp, fadeInScale, blink
  Glow:       highlight, glowPulse, glowFlash, spotlight, colorShift, neonFlicker
  Scale:      popIn, popOut, breathe, squashAndStretch, scaleUp, scaleDown
  Rotation:   shake, wobble, jello, spin, swing
  Text:       typeWords, countUp, valueChange, dramaticText, scrambleText
  Particles:  splashBurst, confettiBurst, ripple, shockwave, sparkle, bubbles
  Water:      waterFill, waterRipple, waterSplash, waterDrop
  Drawing:    drawLine, drawArc, drawArrow, connectionBeam, pathHighlight
  Camera:     zoomIn, zoomOut, panTo, cameraShake, focusOn
  State:      markSorted, markActive, markVisited, markCurrent, markError
  Character:  characterIdle, characterJump, characterCelebrate, characterWalk
  Completion: celebrationWave, victoryBurst, goldOutline, finalReveal
  Timing:     delay, stagger, sequence, chainAnimations

AVAILABLE TEMPLATES (pick ONE):
  array      — horizontal bars/cards with value+index labels, pointer slots below
  graph      — circular node layout with SVG edges, distance labels, queue panel
  tree       — hierarchical node layout, SVG edges, traversal result bar
  dp         — 1D or 2D table with formula/computation/result bars
  stackqueue — vertical stack or horizontal queue with operation log
  recursion  — call stack panel + center scene + return values panel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on the algorithm, specify:
1. Which template to use (and why briefly)
2. What stats to show in the stats bar (3-5 stats)
3. Which animation utilities to trigger for each action type
4. Any layout-specific rules

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY valid JSON. No explanation before or after.

{
  "templateType": "array / graph / tree / dp / stackqueue / recursion",
  "templateReason": "One sentence why this template fits",
  "layoutRules": {
    "mainScene": "Description of main scene layout and spacing",
    "statsBar": [
      { "key": "comparisons", "label": "Comparisons", "side": "left"  },
      { "key": "swaps",       "label": "Swaps",       "side": "left"  },
      { "key": "currentStep", "label": "Step",        "side": "right" }
    ],
    "sidePanel": "Description of what variables/info goes in sidebar"
  },
  "animationMapping": {
    "initialize": "stagger + fadeInScale",
    "compare":    "highlight + glowPulse",
    "swap":       "moveArc + splashBurst + cameraShake",
    "update":     "valueChange + glowFlash",
    "found":      "dramaticText + confettiBurst + goldOutline",
    "complete":   "celebrationWave + victoryBurst + finalReveal"
  },
  "baseInterval": 1200
}`;
}

// ═══════════════════════════════════════════════════
// 3. COMBINE FULL PROMPT (debug / inspection)
// Human-readable. NOT sent to generator.
// ═══════════════════════════════════════════════════

export function combineFullPrompt(
  analysis:  AnalysisResult,
  creative:  CreativeScene,
  technical: TechnicalSpec
): string {
  // Build variable list
  const varList = Array.isArray(analysis.variables)
    ? analysis.variables
        .map((v: any) =>
          typeof v === 'string' ? v : `${v.name}: ${v.meaning}`
        )
        .join('\n  ')
    : '';

  return `
╔══════════════════════════════════════════════════════════════╗
║         ALGORITHM VISUALIZATION — FULL PERSONALIZED PROMPT  ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALGORITHM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:       ${analysis.algorithmName}
Category:   ${analysis.category}
Language:   ${analysis.language}
Time:       ${analysis.timeComplexity}
Space:      ${analysis.spaceComplexity}

Description:
  ${analysis.description}

Key Insight:
  ${analysis.keyInsight}

Input:  ${analysis.inputExample}
Output: ${analysis.expectedOutput}

Variables:
  ${varList}

Data Structures: ${(analysis.dataStructures || []).join(', ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUAL METAPHOR (Creative Chunk)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Metaphor:   ${creative.metaphor}
Scene:      ${creative.sceneName}

Hero Character:
  Type:  ${creative.heroCharacter.type}
  Look:  ${creative.heroCharacter.look}
  Idle:  ${creative.heroCharacter.idleAnimation}
  Move:  ${creative.heroCharacter.moveAnimation}

Environment:
  Setting: ${creative.environment.setting}
  Layers:  ${creative.environment.backgroundLayers.join(' → ')}
  Ambient: ${creative.environment.ambientEffects.join(', ')}

Object Mapping:
${Object.entries(creative.objectMapping)
  .map(([k, v]) => `  ${k} → ${v}`)
  .join('\n')}

Color Palette:
  Primary:    ${creative.colorPalette.primary}
  Secondary:  ${creative.colorPalette.secondary}
  Accent:     ${creative.colorPalette.accent}
  Danger:     ${creative.colorPalette.danger}
  Background: ${creative.colorPalette.background}

Step-to-Scene Mapping:
${creative.stepToSceneMapping
  .map(s => `  [${s.stepType}] → ${s.visual} via ${s.animation}`)
  .join('\n')}

Dramatic Moments:
${creative.dramaticMoments.map(d => `  ★ ${d}`).join('\n')}

NON-NEGOTIABLE VISUAL REQUIREMENTS:
${creative.nonNegotiableVisualRequirements.map(r => `  ✅ ${r}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL SPEC (Technical Chunk)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Template:  ${technical.templateType}
Reason:    ${(technical as any).templateReason || ''}
Interval:  ${technical.baseInterval ?? 1200}ms

Layout:
  Main:  ${technical.layoutRules.mainScene}
  Stats: ${JSON.stringify(technical.layoutRules.statsBar)}
  Side:  ${technical.layoutRules.sidePanel}

Animation Mapping:
${Object.entries(technical.animationMapping)
  .map(([k, v]) => `  ${k} → ${v}`)
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP TRACE (${analysis.steps.length} steps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analysis.steps
  .map(s =>
    `Step ${s.step}${s.important ? ' ⭐' : ''}:\n` +
    `  Action:    ${s.action}\n` +
    `  Caption:   ${s.caption}\n` +
    `  Variables: ${JSON.stringify(s.variables)}`
  )
  .join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDGE CASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${(analysis.edgeCases || []).map(e => `  • ${e}`).join('\n')}
`.trim();
}

// ═══════════════════════════════════════════════════
// 4. COMBINE COMPACT PROMPT
// Token-safe. Sent to HTML generator model.
// Tells AI exactly what to generate in AIVisualizationOutput format.
// ═══════════════════════════════════════════════════

export function combineCompactPrompt(
  analysis:  AnalysisResult,
  creative:  CreativeScene,
  technical: TechnicalSpec
): string {

  // Compact steps (only what generator needs)
  const stepsCompact = (analysis.steps || []).map(s => ({
    step:      s.step,
    action:    s.action,
    caption:   s.caption,
    vars:      s.variables,
    important: s.important,
    timing:    s.timingMult,
  }));

  // Stats config for initVisualization
  const statsConfig = Array.isArray(technical.layoutRules?.statsBar)
    ? technical.layoutRules.statsBar
        .map((s: any) => ({
          key:   s.key   || s,
          label: s.label || s,
          value: 0,
          side:  s.side  || 'left',
        }))
    : [
        { key: 'comparisons', label: 'Comparisons', value: 0, side: 'left'  },
        { key: 'swaps',       label: 'Swaps',       value: 0, side: 'left'  },
        { key: 'currentStep', label: 'Step',        value: 0, side: 'right' },
      ];

  return `You are an expert HTML/CSS/JS visualization coder.

Generate a COMPLETE algorithm visualization using the prebuilt framework below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALGORITHM IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Algorithm:  ${analysis.algorithmName}
Category:   ${analysis.category}
Language:   ${analysis.language}
Input:      ${analysis.inputExample}
Output:     ${analysis.expectedOutput}
Time:       ${analysis.timeComplexity}
Space:      ${analysis.spaceComplexity || 'O(n)'}
Template:   ${technical.templateType}
Steps:      ${stepsCompact.length} total

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATIVE DIRECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Metaphor:    ${creative.metaphor}
Scene:       ${creative.sceneName}
Hero:        ${creative.heroCharacter.type} — ${creative.heroCharacter.look}
Hero Idle:   ${creative.heroCharacter.idleAnimation}
Hero Move:   ${creative.heroCharacter.moveAnimation}
Setting:     ${creative.environment.setting}
Ambient:     ${creative.environment.ambientEffects.join(', ')}
Background:  ${creative.colorPalette.background}

Object Mapping:
${Object.entries(creative.objectMapping)
  .map(([k, v]) => `  ${k} = ${v}`)
  .join('\n')}

Colors:
  primary=${creative.colorPalette.primary}
  secondary=${creative.colorPalette.secondary}
  accent=${creative.colorPalette.accent}
  danger=${creative.colorPalette.danger}

Animation Map:
${Object.entries(technical.animationMapping)
  .map(([k, v]) => `  ${k}: ${v}`)
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NON-NEGOTIABLE VISUAL REQUIREMENTS
These MUST appear in output. No exceptions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${creative.nonNegotiableVisualRequirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DRAMATIC MOMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${creative.dramaticMoments.map(d => `  ★ ${d}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP TRACE (${stepsCompact.length} steps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${stepsCompact
  .map(s =>
    `${s.step}. [${s.action}${s.important ? ' ⭐' : ''}] ${s.caption}` +
    (s.vars && Object.keys(s.vars).length > 0
      ? '\n   vars: ' + JSON.stringify(s.vars)
      : '')
  )
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREBUILT CONTRACT — DO NOT REGENERATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following are ALREADY BUILT in the framework.
Do NOT rewrite them. Reference them in your code.

Fixed HTML (already in DOM):
  #stats-bar      — top stats bar
  #scene-area     — main visualization area
  #scene-content  — inner scene (your elements go here)
  #svg-canvas     — SVG for lines/arrows
  #caption-bar    — bottom caption
  #controls-bar   — playback controls
  #sidebar-panel  — right sidebar
  #completion-overlay — end screen

Fixed JS (available globally):
  initVisualization(config) — call this ONCE at end of your script
  renderStep(index)         — called by engine, calls renderScene()
  setCaption(text, i, important)
  showImportantCaption(text, i)
  updateStat(key, value)
  updateVariables(vars)
  clearScene()
  clearSVG()
  getSceneDimensions()
  createElement(tag, attrs, styles, parent)
  addToScene(el)
  showToast(msg, type)

Animation utils (call directly):
  moveTo, moveArc, moveArcHigh, springTo
  fadeIn, fadeOut, fadeInUp, fadeOutUp, fadeInScale
  highlight, glowPulse, glowFlash, spotlight, neonFlicker
  popIn, popOut, breathe, squashAndStretch, shake, wobble, jello
  typeWords, countUp, valueChange, dramaticText
  splashBurst, confettiBurst, ripple, shockwave, sparkle, bubbles
  waterFill, waterRipple, waterSplash, waterDrop
  drawLine, drawArc, drawArrow, connectionBeam
  zoomIn, zoomOut, cameraShake, focusOn
  markSorted, markActive, markVisited, markCurrent, markError
  characterIdle, characterJump, characterCelebrate, characterWalk
  celebrationWave, victoryBurst, goldOutline, finalReveal
  stagger, sequence, chainAnimations, delay

Template already in DOM (${technical.templateType}):
  Use existing element IDs from the ${technical.templateType} template.
  Do NOT recreate the template structure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU MUST GENERATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate a JSON object with these exact fields:

{
  "templateType": "${technical.templateType}",

  "customCSS": "/* All algorithm-specific CSS here */",

  "sceneHTML": "<!-- Any EXTRA scene HTML beyond the template -->",

  "sceneScript": "/* Complete JS:
    1. window.STEPS = [...] — precomputed array of ALL ${stepsCompact.length} steps
       Each step: { step, action, caption, variables, highlight, important, timingMult }
    2. function renderScene(step, index) { ... } — visual updates per step
    3. initVisualization({
         steps: window.STEPS,
         algorithmName: '${analysis.algorithmName}',
         timeComplexity: '${analysis.timeComplexity}',
         spaceComplexity: '${analysis.spaceComplexity || ''}',
         stats: ${JSON.stringify(statsConfig)},
         boldKeywords: [...algorithm-specific words...],
         baseInterval: ${technical.baseInterval ?? 1200},
         completionConfig: {
           emoji: '🎉',
           title: '...',
           subtitle: '...',
           stats: [...]
         },
         onInit: function() { ...build initial scene DOM... }
       });
    */",

  "sceneConfig": {
    "algorithmName": "${analysis.algorithmName}",
    "timeComplexity": "${analysis.timeComplexity}",
    "spaceComplexity": "${analysis.spaceComplexity || ''}",
    "stats": ${JSON.stringify(statsConfig)},
    "boldKeywords": [],
    "baseInterval": ${technical.baseInterval ?? 1200}
  }
}

CRITICAL RULES:
1. Output ONLY the JSON object — no text before or after
2. sceneScript must be complete working JavaScript
3. window.STEPS must have ALL ${stepsCompact.length} steps
4. renderScene() must handle ALL action types: ${[...new Set((analysis.steps || []).map(s => s.action))].join(', ')}
5. initVisualization() must be called EXACTLY ONCE at the end
6. Use the creative direction — hero character MUST appear
7. Non-negotiable requirements MUST be implemented
8. customCSS must use the color palette provided
9. No external fetches, no CDN imports
10. All animations use the prebuilt utility functions`;
}

// ═══════════════════════════════════════════════════
// CREATIVITY HINTS — Category-specific
// ═══════════════════════════════════════════════════

function getCreativityHints(category: string): string {
  const hints: Record<string, string> = {
    Sorting: `CREATIVITY HINTS FOR SORTING:
Think: bubbles rising in water, blocks falling by gravity, cards being dealt by a dealer.
Hero ideas: floating bubble, weighted block, card dealer's hand, gravity sorter machine.
Environment: underwater bubble stream, physics sandbox, card table under spotlight.
Key visuals:
  - Swap = two elements arc over each other (parabolic path, not teleport)
  - Sorted portion = green wave spreading left to right
  - Active comparison = golden spotlight on two elements
  - Each pass should feel like a physical "settling" motion`,

    "Divide & Conquer": `CREATIVITY HINTS FOR DIVIDE & CONQUER:
Think: surgeon making precise cuts, librarian splitting book piles, DNA splitting.
Hero ideas: surgeon's hands, librarian, DNA strand splitter, crystal splitting tool.
Environment: surgical theater, library with book piles, crystal laboratory.
Key visuals:
  - Split = crack animation → elements drift apart → gap grows
  - Each level = one floor deeper in a building
  - Merge = zipper closing or puzzle pieces snapping together
  - Completion = building reconstructed floor by floor`,

    Graph: `CREATIVITY HINTS FOR GRAPH:
Think: GPS navigator finding routes, explorer mapping caves, ink spreading on paper.
Hero ideas: GPS pin/car, explorer with torch, data packet, ink drop.
Environment: city map view, cave system, paper map, network hub room.
Key visuals:
  - BFS = ripple wave expanding outward from source
  - DFS = torch beam moving deep, darkness returns on backtrack
  - Edge traversal = road lighting up as car drives it
  - Shortest path = golden highlighted route
  - Unvisited nodes = dark/dim, visited = lit up`,

    "Binary Search": `CREATIVITY HINTS FOR BINARY SEARCH:
Think: detective eliminating suspects, sniper narrowing crosshair, librarian finding book.
Hero ideas: detective with magnifying glass, sniper scope, library assistant.
Environment: suspect lineup, foggy range, endless bookshelf corridor.
Key visuals:
  - Eliminated half = tilts sideways and fades out
  - Active search range = bright spotlight narrowing
  - Mid element = emphasized with golden glow
  - Found = bullseye hit, neon sign lights up, confetti`,

    Tree: `CREATIVITY HINTS FOR TREE:
Think: bird hopping between branches, family tree explorer, file system navigator.
Hero ideas: bird, tree climber, data packet traveling branches, glowing orb.
Environment: ancient mystical tree, family tree wall, glowing circuit tree.
Key visuals:
  - Node visit = glows up as character arrives
  - Edge traversal = branch lights up sequentially
  - Backtrack = path dims back
  - Tree sways gently in idle state`,

    DP: `CREATIVITY HINTS FOR DP:
Think: puzzle master placing pieces, architect filling a building blueprint, memory palace.
Hero ideas: puzzle master, architect's hand, memory crystal, brick layer.
Environment: puzzle workshop, blueprint table, glowing memory grid room.
Key visuals:
  - Cell fill = puzzle piece slides in with satisfying click
  - Dependency arrows = glowing lines showing where values come from
  - Optimal path = golden trail traced back through table
  - Completion = full table glows, puzzle complete`,

    "Two Pointers": `CREATIVITY HINTS FOR TWO POINTERS:
Think: two scanners converging from opposite sides, pincer military move, two spotlights.
Hero ideas: two colored beams/scanners, left=green explorer right=red explorer.
Environment: dark corridor with two lights approaching each other.
Key visuals:
  - Left pointer = green beacon moving right
  - Right pointer = red beacon moving left
  - Valid pair found = beams meet with spark collision
  - Sum too small = green moves right (needs bigger)
  - Sum too big = red moves left (needs smaller)`,

    Stack: `CREATIVITY HINTS FOR STACK:
Think: chef stacking plates, tower of blocks, undo history stack.
Hero ideas: chef's hands, construction crane, magic floating tray.
Environment: busy kitchen counter, construction site, wizard's potion lab.
Key visuals:
  - Push = item slides down from top with bounce landing
  - Pop = top item flies upward and off screen
  - Stack overflow = wobbling tower about to fall
  - Top marker = glowing halo on topmost item`,

    Queue: `CREATIVITY HINTS FOR QUEUE:
Think: people waiting in line, airport conveyor belt, printer job queue.
Hero ideas: queue manager, conveyor belt, ticket dispenser.
Environment: airport terminal, amusement park queue, post office.
Key visuals:
  - Enqueue = new person/item slides in from right end
  - Dequeue = front item slides out left and disappears
  - Front/Rear markers = glowing arrows at each end
  - Queue fills up = items pack tighter`,

    Recursion: `CREATIVITY HINTS FOR RECURSION:
Think: Russian dolls opening, mirrors reflecting mirrors, dream within a dream.
Hero ideas: time traveler going to smaller versions, mirror reflections.
Environment: infinite corridor of mirrors, nested dream rooms, fractal landscape.
Key visuals:
  - Each recursive call = smaller glowing frame appears inside current
  - Base case = innermost frame, solid gold color
  - Return = frame closes and value floats up to parent
  - Call stack depth = visible as physical depth/layers`,

    Greedy: `CREATIVITY HINTS FOR GREEDY:
Think: treasure hunter always grabbing nearest gold, opportunistic food collector.
Hero ideas: treasure hunter, pirate, magpie bird collecting shiny things.
Environment: treasure cave, pirate ship deck, forest floor with items.
Key visuals:
  - Chosen item = golden glow, character grabs it confidently
  - Rejected items = gray fade, crossed out
  - Decision point = spotlight on available choices
  - Running total = treasure chest filling up`,

    Backtracking: `CREATIVITY HINTS FOR BACKTRACKING:
Think: maze explorer trying paths, lock combination cracker, cautious detective.
Hero ideas: maze runner, lockpick expert, cautious explorer with flashlight.
Environment: dark maze, foggy forest with dead ends, mysterious room with locked doors.
Key visuals:
  - Forward move = cautious step, path lights up green
  - Dead end = red flash, path goes dark, character steps back
  - Backtrack = footsteps retrace, light fades
  - Solution found = full path illuminates golden`,
  };

  return hints[category] || `CREATIVITY HINTS FOR ${category.toUpperCase()}:
Think: What does this algorithm PHYSICALLY do in the real world?
What character would naturally perform this task?
What environment would make this feel cinematic?
What would make a 5-year-old immediately understand what's happening?
Be specific, vivid, and unexpected — avoid generic visualizations.`;
}

// ═══════════════════════════════════════════════════
// CATEGORY RULES (kept for backwards compat)
// ═══════════════════════════════════════════════════

export function getCategoryRules(category: string): string {
  const rules: Record<string, string> = {
    Sorting:             'bars height∝value, parabolic arc swaps, green wave on sorted portion',
    "Divide & Conquer":  'split animation, each level own row, merge zipper style',
    Graph:               'circle nodes with glow, SVG edges, BFS=ripple DFS=torch trail',
    "Binary Search":     'eliminated half tilts+fades, active range brackets shrink',
    Tree:                'hierarchical nodes, traversal cursor, edge pulse',
    DP:                  'grid cells fill with glow+ripple, dependency arrows, gold path',
    "Two Pointers":      'L=green▶ R=red◀, smooth converge, meeting=spark',
    Stack:               'vertical pile, push=slide+bounce, pop=lift+fly',
    Queue:               'horizontal line, enqueue=slide right, dequeue=slide left',
    Recursion:           'call stack cards, depth colors, call=card in, return=card out',
    Greedy:              'chosen=golden glow+scale, rejected=gray fade',
    Backtracking:        'forward=cautious, dead end=red+shake+retreat, solution=green path',
  };

  return rules[category] ||
    `Design unique visuals that make "${category}" immediately recognizable`;
}