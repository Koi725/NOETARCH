export type RecipeExecution = "local" | "cloud";

// Prefill for the Live-run launcher. Present only on recipes that map to the linear runner
// (question → retrieve → dedup → screen → synthesize). Recipes that operate on an already
// gathered evidence set do not carry this and therefore do not offer "Use as run template".
export interface RecipePrefill {
  maxResults?: number;
  budgetUsd?: number;
  yearFrom?: number;
  yearTo?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  execution: RecipeExecution;
  steps: string[];
  inputs: string[];
  outputs: string[];
  estimatedCost: string;
  estimatedTime: string;
  providers: string[];
  privacyPolicy: string;
  prefill?: RecipePrefill;
}

export interface CustomRecipe extends Recipe {
  originalId: string;
  customName: string;
}

export interface RecipeLibraryProps {
  recipes?: Recipe[];
}
