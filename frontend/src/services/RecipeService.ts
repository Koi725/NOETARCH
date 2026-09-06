import type { Recipe } from "@/contracts/recipe";

export interface RecipeService {
  getRecipes(): Recipe[];
}

import { recipes } from "@/data/RecipeLibrary/RecipeLibrary-data";

export const mockRecipeService: RecipeService = {
  getRecipes: () => recipes as Recipe[],
};
