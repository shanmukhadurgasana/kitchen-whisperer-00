import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { removeImage } from "@/services/storage";
import type {
  Category,
  Difficulty,
  IngredientDraft,
  RecipeDetail,
  RecipeWithMeta,
} from "@/types";

const RECIPE_SELECT =
  "*, categories(id, name), favorites(id), ingredients(id)";

export type RecipeFilters = {
  search?: string;
  categoryId?: string;
  difficulty?: Difficulty | "all";
  maxTime?: number;
  sort?: "newest" | "oldest" | "alpha";
  favoritesOnly?: boolean;
};

export function recipesQuery(filters: RecipeFilters = {}) {
  return {
    queryKey: ["recipes", filters] as const,
    queryFn: async (): Promise<RecipeWithMeta[]> => {
      let query = supabase.from("recipes").select(RECIPE_SELECT);

      if (filters.search) query = query.ilike("title", `%${filters.search}%`);
      if (filters.categoryId && filters.categoryId !== "all")
        query = query.eq("category_id", filters.categoryId);
      if (filters.difficulty && filters.difficulty !== "all")
        query = query.eq("difficulty", filters.difficulty);
      if (filters.maxTime) query = query.lte("cook_time", filters.maxTime);

      if (filters.sort === "alpha") query = query.order("title", { ascending: true });
      else query = query.order("created_at", { ascending: filters.sort === "oldest" });

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as unknown as RecipeWithMeta[];
      return filters.favoritesOnly ? rows.filter((r) => r.favorites.length > 0) : rows;
    },
  };
}

export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery(recipesQuery(filters));
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async (): Promise<RecipeDetail> => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*, categories(id, name), ingredients(*), favorites(id)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Recipe not found");
      const recipe = data as unknown as RecipeDetail;
      recipe.ingredients.sort((a, b) => a.position - b.position);
      return recipe;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type RecipeInput = {
  title: string;
  description: string;
  category_id: string | null;
  image_url: string | null;
  cook_time: number;
  servings: number;
  difficulty: Difficulty;
  instructions: string;
  notes: string;
  ingredients: IngredientDraft[];
};

async function saveIngredients(
  userId: string,
  recipeId: string,
  ingredients: IngredientDraft[],
) {
  await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
  const rows = ingredients
    .filter((i) => i.name.trim().length > 0)
    .map((i, index) => ({
      user_id: userId,
      recipe_id: recipeId,
      name: i.name.trim(),
      quantity: i.quantity.trim() || null,
      position: index,
    }));
  if (rows.length === 0) return;
  const { error } = await supabase.from("ingredients").insert(rows);
  if (error) throw error;
}

function invalidateRecipes(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: ["recipes"] });
  void qc.invalidateQueries({ queryKey: ["stats"] });
}

export function useCreateRecipe(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecipeInput) => {
      const { ingredients, ...recipe } = input;
      const { data, error } = await supabase
        .from("recipes")
        .insert({ ...recipe, user_id: userId })
        .select("id")
        .single();
      if (error) throw error;
      await saveIngredients(userId, data.id, ingredients);
      return data.id;
    },
    onSuccess: () => {
      invalidateRecipes(qc);
      toast.success("Recipe added");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateRecipe(userId: string, recipeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RecipeInput) => {
      const { ingredients, ...recipe } = input;
      const { error } = await supabase.from("recipes").update(recipe).eq("id", recipeId);
      if (error) throw error;
      await saveIngredients(userId, recipeId, ingredients);
      return recipeId;
    },
    onSuccess: () => {
      invalidateRecipes(qc);
      void qc.invalidateQueries({ queryKey: ["recipe", recipeId] });
      toast.success("Recipe updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: { id: string; image_url: string | null }) => {
      const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
      if (error) throw error;
      await removeImage(recipe.image_url);
    },
    onSuccess: () => {
      invalidateRecipes(qc);
      toast.success("Recipe deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useToggleFavorite(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipeId, isFavorite }: { recipeId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", userId);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase
        .from("favorites")
        .insert({ recipe_id: recipeId, user_id: userId });
      if (error) throw error;
      return true;
    },
    onSuccess: (added, vars) => {
      invalidateRecipes(qc);
      void qc.invalidateQueries({ queryKey: ["recipe", vars.recipeId] });
      toast.success(added ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateCategory(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("categories")
        .insert({ name: name.trim(), user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      invalidateRecipes(qc);
      toast.success("Category deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
