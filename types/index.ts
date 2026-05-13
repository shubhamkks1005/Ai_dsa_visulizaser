// types/index.ts

import type { DefaultSession } from "next-auth";

// ═══════════════════════════════════════════════════
// NEXT-AUTH EXTENSIONS
// ═══════════════════════════════════════════════════

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id:    string;
    name:  string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?:    string;
    name?:  string | null;
    email?: string | null;
  }
}

// ═══════════════════════════════════════════════════
// APP USER
// ═══════════════════════════════════════════════════

export interface AppUser {
  id:    string;
  name:  string;
  email: string;
}

// ═══════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════

export interface HistoryItem {
  _id:           string;
  userId:        string;
  title:         string;
  language:      string;
  originalCode:  string;
  generatedHTML: string;
  createdAt:     string;
}

// ═══════════════════════════════════════════════════
// STEP TRACE
// ═══════════════════════════════════════════════════

export interface StepTrace {
  step:        number;
  description: string;
  caption:     string;       // human-readable, conversational
  variables:   Record<string, unknown>;
  highlight?:  number[];
  action?:     string;
  important?:  boolean;      // key/dramatic step flag
  timingMult?: number;       // 0.5 = slow-mo, 1.5 = faster
}

// ═══════════════════════════════════════════════════
// ANALYSIS RESULT
// Output of analyzer.ts
// ═══════════════════════════════════════════════════

export interface VariableInfo {
  name:    string;
  meaning: string;
}

export interface AnalysisResult {
  algorithmName:          string;
  category:               string;
  language:               string;
  description:            string;
  variables:              VariableInfo[];   // {name, meaning}[] — NOT string[]
  dataStructures?:        string[];
  steps:                  StepTrace[];
  timeComplexity:         string;
  spaceComplexity:        string;
  inputExample:           string;
  expectedOutput:         string;
  keyInsight:             string;
  physicalInterpretation: string;
  edgeCases?:             string[];
}

// ═══════════════════════════════════════════════════
// CREATIVE SCENE
// Output of creative chunk (DeepSeek)
// ═══════════════════════════════════════════════════

export interface HeroCharacter {
  type:          string;   // "frog", "explorer", "sorter"
  look:          string;   // emoji or visual description
  idleAnimation: string;
  moveAnimation: string;
}

export interface Environment {
  setting:          string;   // "moonlit swamp", "rainy skyline"
  backgroundLayers: string[];
  ambientEffects:   string[];
}

export interface StepSceneAction {
  stepType:  string;   // "compare", "swap", "update"
  visual:    string;   // what happens visually
  animation: string;   // which utility to use
}

export interface ColorPalette {
  primary:    string;
  secondary:  string;
  accent:     string;
  danger:     string;
  background: string;
}

export interface CreativeScene {
  metaphor:                        string;
  sceneName:                       string;
  heroCharacter:                   HeroCharacter;
  environment:                     Environment;
  objectMapping:                   Record<string, string>;
  colorPalette:                    ColorPalette;
  stepToSceneMapping:              StepSceneAction[];
  dramaticMoments:                 string[];
  nonNegotiableVisualRequirements: string[];
}

// ═══════════════════════════════════════════════════
// TECHNICAL SPEC
// Output of technical chunk (Qwen 80B)
// ═══════════════════════════════════════════════════

export interface StatBarItem {
  key:   string;
  label: string;
  side:  'left' | 'right';
}

export interface LayoutRules {
  mainScene: string;
  statsBar:  StatBarItem[];   // {key, label, side}[] — NOT string[]
  sidePanel: string;
}

export interface TechnicalSpec {
  templateType: 'array' | 'graph' | 'tree' | 'dp' | 'stackqueue' | 'recursion';
  templateReason?: string;
  layoutRules:     LayoutRules;
  animationMapping: Record<string, string>;
  baseInterval:     number;   // ms between steps at 1x speed
}

// ═══════════════════════════════════════════════════
// PROMPT RESULT
// Output of prompt-generator.ts
// ═══════════════════════════════════════════════════

export interface PromptResult {
  creativeScene:  CreativeScene;
  technicalSpec:  TechnicalSpec;
  fullPrompt:     string;
  compactPrompt:  string;
}

// ═══════════════════════════════════════════════════
// AI VISUALIZATION OUTPUT
// Output of generator.ts — input to assembler.ts
// ═══════════════════════════════════════════════════

export interface StatConfig {
  key:   string;
  label: string;
  value: number;
  side:  'left' | 'right';
}

export interface CompletionConfig {
  emoji:    string;
  title:    string;
  subtitle: string;
  stats:    { label: string; value: string | number }[];
}

export interface SceneConfig {
  algorithmName:    string;
  timeComplexity:   string;
  spaceComplexity?: string;
  stats:            StatConfig[];
  boldKeywords?:    string[];
  baseInterval?:    number;
  completionConfig?: CompletionConfig;
}

export interface AIVisualizationOutput {
  templateType:  'array' | 'graph' | 'tree' | 'dp' | 'stackqueue' | 'recursion';
  customCSS:     string;
  sceneHTML:     string;
  sceneScript:   string;
  sceneConfig:   SceneConfig;
}

// ═══════════════════════════════════════════════════
// API RESPONSE
// ═══════════════════════════════════════════════════

export interface ApiResponse<T> {
  success:  boolean;
  data?:    T;
  error?:   string;
  message?: string;
}