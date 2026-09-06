import type { Recipe } from "@/contracts/recipe";

export interface RecipeService {
  getRecipes(): Recipe[];
}

import { recipes } from "@/data/RecipeLibrary/RecipeLibrary-data";

export const mockRecipeService: RecipeService = {
  getRecipes: () => recipes as Recipe[],
};

// ─── M6 async client ────────────────────────────────────────────────────────

/**
 * Fetches recipes from the real backend when NEXT_PUBLIC_API_BASE is set.
 * Falls back to mock data when the env var is absent, so the app runs standalone.
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return mockRecipeService.getRecipes();
  }
  const res = await fetch(`${apiBase}/api/v1/recipes`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Recipes API error: ${res.status}`);
  }
  return (await res.json()) as Recipe[];
}
