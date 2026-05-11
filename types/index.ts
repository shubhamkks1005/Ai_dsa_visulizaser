export interface User {
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

export interface AnalysisResult {
  algorithmName: string;
  category: string;
  language: string;
  variables: string[];
  steps: StepTrace[];
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
}

export interface StepTrace {
  step: number;
  description: string;
  variables: Record<string, unknown>;
  highlight?: number[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}