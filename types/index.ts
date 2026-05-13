// types/index.ts

import { DefaultSession } from "next-auth";

// ═══════════════════════════════════════════════════
// ANALYSIS TYPES
// ═══════════════════════════════════════════════════

export interface AnalysisVariable {
  name: string;
  meaning: string;
}

export interface AnalysisStep {
  step: number;
  description: string;
  caption: string;
  variables: Record<string, unknown>;
  highlight: number[];
  action: string;
  important: boolean;
  timingMult: number;
}

export interface AnalysisResult {
  algorithmName: string;
  category: string;
  language: string;
  description: string;
  variables: AnalysisVariable[];
  dataStructures: string[];
  steps: AnalysisStep[];
  timeComplexity: string;
  spaceComplexity: string;
  inputExample: string;
  expectedOutput: string;
  keyInsight: string;
  physicalInterpretation: string;
  edgeCases: string[];
}

// ═══════════════════════════════════════════════════
// HISTORY / SAVED VISUALIZATION TYPES
// ═══════════════════════════════════════════════════

export interface HistoryItem {
  _id?: string;
  userId?: string;
  title: string;
  language: string;
  originalCode: string;
  generatedHTML: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// ═══════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ═══════════════════════════════════════════════════
// AUTH TYPES
// NOTE:
// We are intentionally NOT augmenting "next-auth/jwt"
// because Render build is failing to resolve that module.
// Session/User augmentation is enough for this app.
// ═══════════════════════════════════════════════════

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export {};