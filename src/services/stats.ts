import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, toISODate, weekDays } from "@/services/planner";
import type { RecipeWithMeta } from "@/types";

export type DashboardStats = {
  totalRecipes: number;
  favoriteCount: number;
  plannedMeals: number;
  shoppingTotal: number;
  shoppingPurchased: number;
  recent: RecipeWithMeta[];
  byCategory: { name: string; count: number }[];
  byDifficulty: { name: string; count: number }[];
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const week = weekDays(startOfWeek());

      const [recipesRes, favoritesRes, plansRes, itemsRes] = await Promise.all([
        supabase
          .from("recipes")
          .select("*, categories(id, name), favorites(id), ingredients(id)")
          .order("created_at", { ascending: false }),
        supabase.from("favorites").select("id"),
        supabase
          .from("meal_plans")
          .select("id")
          .gte("plan_date", toISODate(week[0]!))
          .lte("plan_date", toISODate(week[6]!)),
        supabase.from("shopping_items").select("id, purchased"),
      ]);

      if (recipesRes.error) throw recipesRes.error;

      const recipes = (recipesRes.data ?? []) as unknown as RecipeWithMeta[];
      const items = itemsRes.data ?? [];

      const categoryCounts = new Map<string, number>();
      const difficultyCounts = new Map<string, number>();
      for (const recipe of recipes) {
        const cat = recipe.categories?.name ?? "Uncategorised";
        categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
        difficultyCounts.set(
          recipe.difficulty,
          (difficultyCounts.get(recipe.difficulty) ?? 0) + 1,
        );
      }

      return {
        totalRecipes: recipes.length,
        favoriteCount: favoritesRes.data?.length ?? 0,
        plannedMeals: plansRes.data?.length ?? 0,
        shoppingTotal: items.length,
        shoppingPurchased: items.filter((i) => i.purchased).length,
        recent: recipes.slice(0, 4),
        byCategory: [...categoryCounts.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6),
        byDifficulty: [...difficultyCounts.entries()].map(([name, count]) => ({ name, count })),
      };
    },
  });
}
