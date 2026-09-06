export type RecipeExecution = "local" | "cloud";

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
}

export interface CustomRecipe extends Recipe {
  originalId: string;
  customName: string;
}

export interface RecipeLibraryProps {
  recipes?: Recipe[];
}
