import { AnalysisResult } from "@/types";

// ═══════════════════════════════════════════════════
// ANALYZER PROMPT — Code to JSON
// ═══════════════════════════════════════════════════

export function buildAnalyzerPrompt(code: string, language: string): string {
  return `You are an expert algorithm analyzer. Analyze the following ${language} code and return a structured JSON response.

CODE:
\`\`\`${language}
${code}
\`\`\`

Return ONLY valid JSON (no markdown, no explanation). Follow this exact structure:

{
  "algorithmName": "Exact algorithm name",
  "category": "Sorting / Graph / DP / Two Pointers / Divide & Conquer / Tree / Linked List / Stack / Queue / Binary Search / Greedy / Backtracking / Recursion / String / Math / Other",
  "language": "${language}",
  "description": "Clear 2-sentence plain English description with real-world analogy",
  "variables": ["list", "of", "all", "key", "variables"],
  "dataStructures": ["array", "stack", "queue", "tree", "graph", "hash map", "linked list"],
  "steps": [
    {
      "step": 1,
      "description": "Clear explanation of what happens at this exact step",
      "variables": {"var1": "val1", "var2": "val2"},
      "highlight": [0, 1],
      "action": "initialize / compare / swap / update / push / pop / insert / delete / merge / split / return"
    }
  ],
  "timeComplexity": "O(...) with short explanation",
  "spaceComplexity": "O(...) with short explanation",
  "inputExample": "Example input used in the code or a good default",
  "expectedOutput": "Expected output for the given input",
  "keyInsight": "One sentence explaining WHY this algorithm works",
  "physicalInterpretation": "Real-world physical metaphor a 5-year-old could understand"
}

RULES:
- Trace through the code step-by-step mentally with the given input.
- Every individual comparison, swap, assignment, push, pop = a separate step.
- Do NOT combine multiple distinct operations into one step.
- Minimum 8-15 steps for non-trivial code.
- Variables map must show ALL variable values at that specific moment.
- Output ONLY the JSON, nothing else.`;
}

// ═══════════════════════════════════════════════════
// FULL 49-SECTION GENERATOR PROMPT
// Used by: Claude, DeepSeek, Gemini
// ═══════════════════════════════════════════════════

export function buildVisualizationPrompt(analysis: AnalysisResult): string {
  const analysisJSON = JSON.stringify(analysis, null, 2);
  const categoryRules = getCategoryRules(analysis.category);

  return `You are an Algorithm Visualization Generator AI and an expert frontend animation director.

I have already analyzed the code. Here is the structured analysis:

\`\`\`json
${analysisJSON}
\`\`\`

Using this analysis, generate a SINGLE self-contained HTML file that creates a beautiful, cinematic, production-quality animated visualization of this algorithm.

═══════════════════════════════════════════════════════════
PHASE 1 — IDENTITY & SCENE DESIGN
═══════════════════════════════════════════════════════════

SECTION 1 — Algorithm Identity:
- NAME: ${analysis.algorithmName}
- CATEGORY: ${analysis.category}
- LANGUAGE: ${analysis.language}
- TIME: ${analysis.timeComplexity}
- SPACE: ${analysis.spaceComplexity}
- GOAL: ${analysis.description}
- KEY INSIGHT: ${analysis.keyInsight}
- INPUT: ${analysis.inputExample}
- OUTPUT: ${analysis.expectedOutput}
- PHYSICAL METAPHOR: ${analysis.physicalInterpretation || "AI must infer a vivid real-world metaphor from the algorithm behavior"}

SECTION 2 — Real-World Object Mapping (MANDATORY):
For EVERY abstract element, choose a CONCRETE visual representation:
- Array elements → buildings/cards/books/tiles/bubbles/pins (NOT plain rectangles)
- Pointers/indices → animated arrows/spotlights/markers with variable name labels
- Comparisons → light beams/bridges/rays between compared elements
- Result → filled regions/glowing paths/sorted shelves/collected items
- Auxiliary DS → trays/panels/card stacks/conveyor belts

SECTION 3 — Data Structures:
- PRIMARY: ${analysis.dataStructures?.join(", ") || "Array"}
- Track these variables at every step: ${analysis.variables.join(", ")}
- Visual form must match DS type: arrays=horizontal boxes or vertical bars, trees=hierarchical nodes, graphs=force-directed circles, stacks=vertical pile

SECTION 4 — Step Trace:
${analysis.steps.map((s) => `Step ${s.step}: ${s.description} [Action: ${s.action}] [Vars: ${JSON.stringify(s.variables)}]`).join("\n")}

SECTION 5 — Edge Cases:
- Empty input → friendly message, controls disabled
- Single element → show it highlighted, skip to completion
- Already solved → brief celebration immediately
- No solution → red flash, descriptive caption

═══════════════════════════════════════════════════════════
PHASE 2 — VISUAL DESIGN & LAYOUT
═══════════════════════════════════════════════════════════

SECTION 6 — Visual Design Tokens:
BACKGROUND: #0d1117 with subtle grid overlay (rgba(99,179,237,0.03) lines, 60px spacing)
FONT: Sans-serif (Inter/system-ui) for UI, monospace for data values
ELEMENT SHAPE: Based on algorithm type (bars for sorting, circles for graphs, cards for arrays)
ELEMENT SIZE: Responsive — width = min(60px, containerWidth / n), with gap

COLOR PALETTE (STRICT — every color has ONE meaning):
- Default/Untouched:   #2d3748 (dim gray, low saturation)
- Active/In-Scope:     #63b3ed (bright cyan with box-shadow glow)
- Comparing:           #f6e05e (vivid gold/yellow)
- Swapping/Modifying:  #fc8181 (red/coral)
- Sorted/Final/Found:  #68d391 (confident green glow)
- Special (pivot/src):  #9f7aea (purple, elevated, scale 1.15)
- Eliminated/Out:      #4a5568 at opacity 0.4 (faded, blur 0.5px)
- Created/New:         #f687b3 (pink pulse)

TIMING TIERS:
- Fast:   150ms → color shifts, highlights
- Medium: 400ms → pointer slides, value updates
- Slow:   700ms → swaps, merges, major operations
- Epic:  1200ms → final reveal, completion celebration

SECTION 7 — Scene Vocabulary:
SCENE must match the algorithm's physical metaphor. Examples:
- Sorting → "Workshop with weighted blocks on a shelf"
- Graph/BFS → "Explorer mapping a cave system with a torch"
- Binary Search → "Detective narrowing down suspects"
- DP → "Puzzle builder filling a grid"
- Two Pointers → "Two scanners converging on a target"
Choose a scene that makes a viewer GUESS the algorithm just by watching.

SECTION 8 — Layout Structure (CSS Grid):
\`\`\`
display: grid;
grid-template-rows: auto 1fr auto auto;
height: 100vh; width: 100vw; overflow: hidden;

Row 1 (auto):  Header bar — algorithm name, category badge, phase text
Row 2 (1fr):   Main workspace — visualization elements + optional sidebar
Row 3 (auto):  Caption box — step description (min-height: 60px)
Row 4 (auto):  Controls bar — buttons centered
\`\`\`
Sidebar (if needed): 260px fixed width, contains legend, variable tracker, history log.
Sidebar panels: max-height with overflow-y: auto.

SECTION 9 — Input Size Adaptation:
n < 15: Full cinematic detail, all labels, slower pacing
15 < n < 50: Slightly smaller elements, faster timing
n > 50: Thin elements, skip trivial steps, simplified animations
Current: n = ${analysis.steps.length} steps → apply appropriate detail level

SECTION 10 — Initialization Build Sequence:
1. Background gradient + grid texture fades in
2. Elements enter with staggered animation (50-80ms each): scale(0)→scale(1) + opacity 0→1
3. Labels/indices fade in
4. Pointers/markers appear
5. Stats bar initializes (all zeros)
6. First caption appears
7. Controls enabled
Total intro: 800-1500ms

SECTION 11 — Color Accessibility:
- NEVER rely on color alone — pair with shape/pattern/icon
- Active: glow + scale(1.08)
- Sorted: green + checkmark icon ✓
- Comparing: yellow + pulse animation
- Error: red + shake animation
- Pointers: distinct geometric shapes (▼ ▲ ◆) with text labels

═══════════════════════════════════════════════════════════
PHASE 3 — ANIMATION PHYSICS ENGINE
═══════════════════════════════════════════════════════════

SECTION 12 — Core Animation Rules:
FUNDAMENTAL: NOTHING appears, disappears, or changes instantly.
- Enter: scale(0) → scale(1) + fade in (300ms)
- Exit: scale(1) → scale(0) + fade out (300ms)
- Movement: cubic-bezier(0.34, 1.56, 0.64, 1) — springy overshoot
- Color transitions: min 300ms ease

SWAP ANIMATION (CRITICAL — must be parabolic arc):
- Element A: translateY(-60px) → translateX(targetX) → translateY(0) (arc UP then across)
- Element B: translateY(60px) → translateX(targetX) → translateY(0) (arc DOWN then across)
- Duration: 600-800ms with slight overshoot bounce on landing
- Both elements must move SIMULTANEOUSLY

POINTER MOVEMENT:
- Smooth slide (CSS transition 400ms ease-in-out)
- NEVER teleport — actual physical gliding
- Ghost trail: previous 2 positions at 20%, 10% opacity, fade in 600ms

SECTION 13 — Creation & Destruction:
Create: Ghost outline → label types in → background fills → border solidifies (400ms total)
Delete: Content fades → element shakes twice → particles burst → gone (500ms total)
Merge: Both glow → slide toward each other → overlap → pulse → merge (800ms)

SECTION 14 — Value Change Animation:
Old value: translateY(-20px) + opacity 0 (flies UP and fades)
New value: translateY(20px) → translateY(0) + opacity 1 (flies IN from below)
Duration: 250ms. Counter/stat increments: tween from old→new over 200ms.

SECTION 15 — Pointer & Reference Rules:
ALWAYS use actual geometric indicators — NOT just color changes:
- Array pointer: Triangle ▼ below element, labeled with variable name
- Multiple pointers: different colors + labels, NEVER overlapping
- Two pointers: LEFT = green ▶ arrow, RIGHT = red ◀ arrow
- When pointers meet: spark/flash effect (scale 0→1.5→1, 300ms)

SECTION 16 — Split/Merge/Partition (if applicable):
${categoryRules}

SECTION 17 — 3D Depth Illusion:
- Comparing elements: rotateY(15deg) toward each other — "looking at each other"
- Active elements: scale(1.08), translateZ(10px), higher z-index
- Inactive: blur(0.5px), opacity 0.7 — depth of field effect
- Special elements (pivot/source): translateY(-8px) — floating above, shadow below

SECTION 18 — Physical Weight Properties:
- Large values: move slightly SLOWER (heavier feel, slight wobble on landing)
- Small values: move slightly FASTER, subtle bounce
- Final position: overshoot + spring back — cubic-bezier(0.34, 1.56, 0.64, 1)

═══════════════════════════════════════════════════════════
PHASE 4 — CINEMATIC STORYTELLING
═══════════════════════════════════════════════════════════

SECTION 19 — Category-Specific Animations:
${categoryRules}

SECTION 20 — Algorithm Personality:
Match the animation FEEL to the algorithm's behavior:
- Bubble Sort → gentle, patient, floating bubbles
- Quick Sort → aggressive, fast, decisive lightning
- Merge Sort → organized, surgical, methodical
- Binary Search → detective, spotlight narrowing
- BFS → explorer, ripple waves expanding
- DFS → cave explorer, torch-lit depth dive
- DP → puzzle builder, cells glowing as filled
- Two Pointers → efficient scanners converging

SECTION 21 — Metaphor (MANDATORY):
Create ONE metaphor sentence: "[Character] is [doing what] to [achieve what]"
Map EVERY code element to a real-world object.
Map EVERY operation to a real-world action.

SECTION 22 — Creative Quality Gate (STRICT):
The visualization is INVALID if:
❌ It looks like every other algorithm (just colored boxes moving)
❌ You cannot tell WHICH algorithm it is from visuals alone
❌ There is no domain-specific animation
The visualization is VALID only if:
✅ A viewer can guess the algorithm type just by watching
✅ At least ONE unique animation exists that matches this specific algorithm
✅ Scene metaphor is defined and visible

SECTION 23 — Tension & Suspense:
PRE-COMPARISON PAUSE: Before every comparison:
- 200ms pause (brief freeze)
- Both elements get spotlight (rest dims to 40% opacity)
- Comparison beam/line appears between them
- Beam color: green if condition true, red if false (400ms)
- Then operation executes

CLIMAX MOMENT (when key element found / sort complete):
- Everything freezes 300ms
- Element pulses 3x (scale 1→1.3→1)
- Screen edge glow
- Large centered caption
- Particle burst (6-8 CSS particles)

SECTION 24 — Speed Effects (SPARINGLY):
- Fast movement (>3 positions): motion blur (CSS blur 2px during transit)
- Impact: single-frame white flash (20ms opacity pulse)
- Exclamation: ! for swaps, ? for searching, ✓ for found (scale 0→1.5→1, 300ms)

SECTION 25 — Background & Particles:
BACKGROUND: Not solid black. Use:
- Subtle grid pattern (very low opacity, 60px spacing)
- OR noise texture overlay (CSS repeating gradient)
GLOW: Active elements get box-shadow glow matching their state color
PARTICLES (CSS only, max 6-8 per event):
- Swap complete → small dots burst outward from swap point
- Sort complete → sparkle wave left to right
- Search found → confetti burst from found element

SECTION 26 — Visual Sound Equivalents:
- Comparison: both elements vibrate (translateX ±2px, 80ms)
- Swap: stronger vibration before executing
- Operation ripple: CSS radial gradient expanding + fading from operation point

SECTION 27 — Algorithm Dialogue (4-6 lines max):
Generate brief personality quotes for key moments:
- Mid-algorithm insight: "Getting closer..." or "Half eliminated!"
- Struggle: "This is getting complex..."
- Success: "Found it!" or "Perfectly sorted!"
Show as small caption bubble near active element, fade after 1.5s.

═══════════════════════════════════════════════════════════
PHASE 5 — UI PANELS & COMPLETION
═══════════════════════════════════════════════════════════

SECTION 28 — Caption & Stats:
HEADER (top): Algorithm name (glow text) + category badge + current phase
STATS BAR: Step X/Y progress bar + all tracked variable values (live updating with count animation)
CAPTION (bottom): Human-readable step description. Text fades in word-by-word (~40ms/word). Previous caption fades up+out, new fades in from below. Bold key words with accent color.

SECTION 29 — Annotations:
Speech bubble near active element showing WHY this decision was made.
Conversational tone: "Because 8 > 3, the bigger one moves right"
NOT technical: "Comparison: arr[i] > arr[j], swap required"
Max 2 annotations per step. Progressive disclosure: detailed first 3 steps, shorter hints after.

SECTION 30 — Recursion Panel (if recursion detected):
Right sidebar: call stack as stacked cards.
Call: new card slides in from bottom with rotation.
Return: return value appears in card, card slides up+out.
Color by depth: depth 0=teal, 1=purple, 2=yellow, 3=red.

SECTION 31 — History & Trails:
Ghost trail: moving pointer leaves 2 previous positions at 20%, 10% opacity.
Comparison history: last 5 comparisons as mini log entries in sidebar panel.

SECTION 32 — Phase Transitions:
INTRO (1.5s): Algorithm name types itself, elements animate into position.
PHASE CHANGE: horizontal wipe, caption "Phase Complete → Now: [next]"
MID-INSIGHT (halfway): Brief pause, complexity meter, "Halfway — X operations so far"

SECTION 33 — Completion Sequence (MANDATORY):
1. All elements transition to final color (green wave, left→right, 100ms stagger)
2. Stats card animates in from bottom:
   ✓ Algorithm Complete! | Total Steps: X | Comparisons: Y | Swaps: Z | Time: O(?) | Space: O(?)
3. Background subtly brightens (warm shift)
4. Optional: "Best / Worst / Your Case" comparison
5. Controls: only Reset active

═══════════════════════════════════════════════════════════
PHASE 6 — POLISH & REALISM
═══════════════════════════════════════════════════════════

SECTION 34 — Domain Physics:
Sorting → gravity (heavy elements sink), weight-based speed
Graph → edge traversal marker travels along edge with easing
Tree → branch sway (subtle idle animation), node drops with gravity
Water → sine wave surface, splash droplets, smooth water rise

SECTION 35 — Ambient Environment:
Background evolves with algorithm state:
- Intense operations → environment intensifies (stronger glow, faster particles)
- Calm/idle → soft, gentle
- Completion → everything calms, settles, resolves

SECTION 36 — Element Material:
Elements must NOT look like plain CSS divs. Add:
- Subtle gradient (top lighter, bottom darker)
- Thin highlight line at top (glass effect)
- Soft drop shadow (depth perception)
- Border-radius: 6-8px (not sharp corners)

SECTION 37 — Lighting:
- Spotlight: follows active element (radial gradient overlay)
- Active elements: brighter, rim glow (thin bright border)
- Settled elements: smaller shadow (grounded feel)
- Completion: global brightness increase (warm tint)

SECTION 38 — Micro Idle Animations:
NOTHING should be 100% still:
- Elements: subtle breathing (scale 0.99↔1.01, 4s cycle)
- Pointers: gentle bounce (translateY ±1px, 2s cycle)
- Guide lines: opacity pulse (0.3↔0.5, 3s cycle)

SECTION 39 — Dramatic Text (MAX 4 per visualization):
At KEY moments only: first significant operation, halfway, biggest operation, completion.
Scale: 0→1.2→1 (600ms), hold 400ms, fade out 300ms.
Position: centered, large bold text (28-36px), white + text-shadow glow.

SECTION 40 — Completion Environment:
When complete:
1. Particles settle
2. Background warms slightly
3. All elements pulse once together
4. Calm final state (700ms pause)
5. Gold/green outline around complete structure
6. Stats card appears

═══════════════════════════════════════════════════════════
PHASE 7 — ADVANCED CINEMATIC
═══════════════════════════════════════════════════════════

SECTION 41 — Camera Dynamics:
- Default: wide shot (full structure visible)
- Comparison: subtle zoom 1.03x on active area (400ms)
- Completion: quick zoom IN (1.05x) then OUT (1x)
- Impact: micro-shake (translateX ±2px, 80ms) on major operations

SECTION 42 — Post-Processing:
- Film grain: very subtle (2%) noise overlay
- Vignette: slight corner darkening (12-15% opacity)
- Bloom: glow overflow on bright active elements

SECTION 43 — Adaptive Timing:
Each step has implicit importance:
- Boring/repetitive steps: 1.5x faster
- First occurrence (first swap, first comparison): 0.5x slower (teaching moment)
- Critical decision: 0.5x slower (dramatic emphasis)
- Final step: 0.7x (climactic, savored)
User speed buttons ALWAYS override.

SECTION 44 — Theme Particles:
Sorting → tiny sparks on collision
Graph → data packets flowing along edges
Tree → falling leaf particles
DP → puzzle piece particles
General → subtle floating geometric shapes (very low opacity, slow drift)

SECTION 45 — Hover Interaction:
Hover on any element → pause animation + tooltip showing:
- Element value, current state, times touched

SECTION 46 — State Diff:
Changed values get brief yellow flash highlight (200ms).
Previous pointer position shown as ghost (15% opacity, fades in 600ms).

═══════════════════════════════════════════════════════════
PHASE 8 — SAFETY & ACCESSIBILITY
═══════════════════════════════════════════════════════════

SECTION 47 — Fail-Safe:
NEVER crash, blank screen, or show raw errors.
If step data missing → show "Step unavailable" gracefully, continue.
If input empty → friendly message, controls disabled.
ALWAYS render at least base layout + message.

SECTION 48 — Accessibility:
prefers-reduced-motion: reduce durations by 50%, skip particles, no shake.
Color-blind: ALWAYS pair color with shape/pattern/icon.
Keyboard: Space=Play/Pause, ←=Prev, →=Next, R=Reset.
Stats and captions: aria-live regions.

SECTION 49 — Layout Safety (CRITICAL):
Z-INDEX HIERARCHY (strict):
- z:1 background → z:5 elements → z:15 pointers → z:25 annotations → z:30 final card → z:40 intro overlay

OVERFLOW: Main container overflow:hidden. Sidebar panels overflow-y:auto with thin scrollbar.
POSITIONING: All absolute positions clamped within parent bounds. Never exceed viewport.
ANIMATION SAFETY: Only animate transform, opacity, filter, box-shadow, background-color. NEVER animate width/height/margin/padding.
RESIZE: Recalculate positions on window resize (debounced 200ms).
NO scrollbars on main page.

═══════════════════════════════════════════════════════════
MANDATORY CONTROLS
═══════════════════════════════════════════════════════════

Bottom bar: [Reset] | [◀ Prev] | [▶ Play/Pause] | [Next ▶] | [Speed: 0.5x, 1x, 2x]
Keyboard: Space=Play/Pause, ←=Prev, →=Next, R=Reset
All buttons must be styled, visible, and functional at all times.

═══════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════

Output a SINGLE self-contained HTML file.
- ALL CSS in <style> tags
- ALL JS in <script> tags
- No external files (anime.js/GSAP CDN acceptable if needed)
- Must work inside iframe srcdoc
- All steps PRECOMPUTED as JS array
- Dark theme (#0d1117 background)
- Starts with <!DOCTYPE html>

DO NOT output explanations, markdown fences, or commentary.
Output ONLY the complete HTML.`;
}

// ═══════════════════════════════════════════════════
// SHORT PROMPT — For Groq (token-limited models)
// ═══════════════════════════════════════════════════

export function buildShortVisualizationPrompt(analysis: AnalysisResult): string {
  return `Generate a self-contained HTML visualization for this algorithm:

Algorithm: ${analysis.algorithmName}
Category: ${analysis.category}
Language: ${analysis.language}
Time Complexity: ${analysis.timeComplexity}
Space Complexity: ${analysis.spaceComplexity}
Description: ${analysis.description}
Input: ${analysis.inputExample}
Output: ${analysis.expectedOutput}
Key Insight: ${analysis.keyInsight}
Steps Count: ${analysis.steps.length}

Step Details:
${analysis.steps.slice(0, 12).map((s) => `Step ${s.step}: ${s.description} [${s.action}]`).join("\n")}

Requirements:
- Single self-contained HTML file with ALL CSS in <style> and ALL JS in <script>
- Dark theme background (#0d1117), accent (#63b3ed), text white
- Animated step-by-step visualization with smooth CSS transitions (min 300ms)
- Visual representation matching algorithm type:
  * Sorting: vertical bars with height proportional to value, parabolic arc swaps
  * Graph: circles as nodes with SVG/div line edges
  * Tree: hierarchical node layout
  * Array: horizontal boxes with values
- Precomputed steps array in JavaScript
- Controls bar: Reset | ◀ Prev | ▶ Play/Pause | Next ▶ | Speed (0.5x, 1x, 2x)
- Caption area showing current step explanation
- Stats: current step, total steps, comparisons, key variables
- Color states: default=#2d3748, active=#63b3ed, comparing=#f6e05e, swapping=#fc8181, sorted=#68d391
- Smooth element movement using CSS transforms (never teleport)
- Intro animation (staggered element entry)
- Completion celebration (green wave + stats card)
- Works inside iframe srcdoc
- No external files (CDN for anime.js ok)

Output ONLY the complete HTML. No markdown. No explanation.`;
}

// ═══════════════════════════════════════════════════
// HELPER — Category-specific animation rules
// ═══════════════════════════════════════════════════

function getCategoryRules(category: string): string {
  const rules: Record<string, string> = {
    Sorting: `SORTING ALGORITHM:
- Elements as vertical bars, height proportional to value
- Swap: parabolic arc path (Element A arcs UP+across, B arcs DOWN+across simultaneously)
- After each pass: green wave on sorted portion (left→right, 80ms stagger)
- Comparison: both bars glow yellow, beam between them
- Height labels inside or above bars
- Comparison counter live update`,

    "Divide & Conquer": `DIVIDE & CONQUER:
- Split: original glows → crack/line appears → halves slide apart with gap
- Each recursion level gets its own visual row (tree of arrays)
- Merge: elements alternate flying into result position
- Color: left half=blue tint, right half=purple tint → merged=teal
- Connecting lines from parent to children arrays`,

    Graph: `GRAPH ALGORITHM:
- Nodes as circles with soft inner glow and labels
- Edges: SVG lines or CSS div lines connecting nodes
- BFS: expanding concentric circle pulse from current node (sonar ping effect)
- DFS: thick trail line, backtrack = trail fades to dotted
- Queue/Stack visualization panel below or beside
- Edge traversal: animated dot traveling along edge`,

    "Binary Search": `BINARY SEARCH:
- Elements as horizontal cards/boxes
- Eliminated half: tilt 15deg + opacity 0.3 + scale(0.9) + slide away
- Active range: animated bracket [ ] that shrinks
- Mid pointer: prominent arrow with "mid" label
- Found: particle burst + golden glow + scale(1.3) pulse`,

    "Linked List": `LINKED LIST:
- Each node: rounded rectangle with value + next pointer arrow
- Node creation: materializes with ripple effect
- Arrow: draws itself (stroke-dashoffset animation)
- Delete: node cracks/shakes → arrows reroute around it → node fades
- Insert: new node drops from above, arrows redirect with animation`,

    Tree: `TREE OPERATIONS:
- Nodes as circles with value labels, connected by lines
- Insert: node bounces down from root following path
- Rotation: subtree physically rotates around pivot node
- Branch sway: subtle idle animation on all branches
- Highlight path from root to target with glow`,

    DP: `DYNAMIC PROGRAMMING:
- Table/grid visualization with cells
- Cell fill: glow + ripple effect when computed
- Dependency arrows: dotted lines from source cells to current
- Final path: gold highlight tracing back through optimal cells
- Color intensity proportional to cell value`,

    "Two Pointers": `TWO POINTERS:
- LEFT pointer: green arrow ▶ pointing right, labeled
- RIGHT pointer: red arrow ◀ pointing left, labeled
- Pointers slide smoothly toward each other
- When they meet: spark/flash collision effect
- Active window/range highlighted between pointers`,

    Stack: `STACK:
- Vertical stack of cards/blocks
- Push: new card slides in from right, settles on top with bounce
- Pop: top card lifts up with slight rotation, flies away
- Peek: top card glows without moving
- Stack grows upward visually`,

    Queue: `QUEUE:
- Horizontal line of elements
- Enqueue: new element slides in from right
- Dequeue: leftmost element slides out to left with fade
- Front/rear markers visible`,

    Greedy: `GREEDY:
- Chosen element: golden glow + confident scale(1.1)
- Rejected element: fade to gray (opacity 0.4)
- Decision beam: spotlight on current choice
- Running total/result builds visually`,

    Backtracking: `BACKTRACKING:
- Forward: element advances with cautious animation (slower)
- Dead end: red flash + shake, retreat animation (backtrack)
- Solution found: green path illuminates from start to end
- Tried paths: dotted gray trail`,

    Recursion: `RECURSION:
- Call stack panel (right sidebar): cards stack up
- Function call: new card slides in from bottom-right with slight rotation
- Return: value appears in card, card slides up+out
- Depth color coding: depth 0=teal, 1=purple, 2=yellow, 3=red
- Active call = brightest card`,

    String: `STRING:
- Characters as individual tiles/cards in a row
- Pattern matching: sliding window highlight moves across
- Match: matched chars flash green simultaneously
- Mismatch: brief red flash + shift`,

    Math: `MATH:
- Numbers as prominent centered display
- Operations shown with mathematical notation
- Result builds up with counting animation
- Key formula shown above visualization`,
  };

  return rules[category] || `AI must infer the closest physical metaphor for this "${category}" algorithm and design:
- Unique element shapes matching the domain
- Domain-specific animations for key operations
- A scene that makes viewers guess the algorithm type
Reference categories: ${Object.keys(rules).join(", ")}`;
}