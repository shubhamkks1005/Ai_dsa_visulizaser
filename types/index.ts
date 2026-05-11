import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
  }
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface HistoryItem {
  _id: string;
  userId: string;
  title: string;
  language: string;
  originalCode: string;
  generatedHTML: string;
  createdAt: string;
}

export interface StepTrace {
  step: number;
  description: string;
  variables: Record<string, unknown>;
  highlight?: number[];
  action?: string;
  timingMult?: number;
}

export interface AnalysisResult {
  algorithmName: string;
  category: string;
  language: string;
  description: string;
  variables: string[];
  dataStructures?: string[];
  steps: StepTrace[];
  timeComplexity: string;
  spaceComplexity: string;
  inputExample: string;
  expectedOutput: string;
  keyInsight: string;
  physicalInterpretation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}