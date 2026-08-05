import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Recipe = Tables<"recipes">;
export type Ingredient = Tables<"ingredients">;
export type Favorite = Tables<"favorites">;
export type MealPlan = Tables<"meal_plans">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingItem = Tables<"shopping_items">;

export type Difficulty = "easy" | "medium" | "hard";
export type MealSlot = "breakfast" | "lunch" | "dinner";

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];
export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export type RecipeWithMeta = Recipe & {
  categories: Pick<Category, "id" | "name"> | null;
  favorites: { id: string }[];
  ingredients: { id: string }[];
};

export type RecipeDetail = Recipe & {
  categories: Pick<Category, "id" | "name"> | null;
  ingredients: Ingredient[];
  favorites: { id: string }[];
};

export type MealPlanEntry = MealPlan & {
  recipes: Pick<Recipe, "id" | "title" | "image_url" | "cook_time"> | null;
};

export type IngredientDraft = { name: string; quantity: string };
