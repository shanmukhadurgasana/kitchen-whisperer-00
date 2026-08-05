import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { MealPlanEntry, MealSlot, ShoppingItem, ShoppingList } from "@/types";

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function weekDays(from: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    return d;
  });
}

export function useMealPlans(weekStart: Date) {
  const days = weekDays(weekStart);
  const from = toISODate(days[0]!);
  const to = toISODate(days[6]!);

  return useQuery({
    queryKey: ["meal-plans", from],
    queryFn: async (): Promise<MealPlanEntry[]> => {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*, recipes(id, title, image_url, cook_time)")
        .gte("plan_date", from)
        .lte("plan_date", to);
      if (error) throw error;
      return (data ?? []) as unknown as MealPlanEntry[];
    },
  });
}

export function useAssignMeal(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      slot,
      recipeId,
    }: {
      date: string;
      slot: MealSlot;
      recipeId: string | null;
    }) => {
      if (!recipeId) {
        const { error } = await supabase
          .from("meal_plans")
          .delete()
          .eq("plan_date", date)
          .eq("slot", slot)
          .eq("user_id", userId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("meal_plans")
        .upsert(
          { user_id: userId, plan_date: date, slot, recipe_id: recipeId },
          { onConflict: "user_id,plan_date,slot" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["meal-plans"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useShoppingList() {
  return useQuery({
    queryKey: ["shopping-list"],
    queryFn: async (): Promise<{ list: ShoppingList | null; items: ShoppingItem[] }> => {
      const { data: lists, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .order("created_at")
        .limit(1);
      if (error) throw error;

      const list = lists?.[0] ?? null;
      if (!list) return { list: null, items: [] };

      const { data: items, error: itemsError } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("list_id", list.id)
        .order("purchased")
        .order("created_at");
      if (itemsError) throw itemsError;

      return { list, items: items ?? [] };
    },
  });
}

async function ensureList(userId: string): Promise<string> {
  const { data } = await supabase.from("shopping_lists").select("id").limit(1);
  if (data?.[0]) return data[0].id;
  const { data: created, error } = await supabase
    .from("shopping_lists")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

export function useGenerateShoppingList(userId: string, weekStart: Date) {
  const qc = useQueryClient();
  const days = weekDays(weekStart);

  return useMutation({
    mutationFn: async () => {
      const listId = await ensureList(userId);

      const { data: plans, error } = await supabase
        .from("meal_plans")
        .select("recipe_id")
        .gte("plan_date", toISODate(days[0]!))
        .lte("plan_date", toISODate(days[6]!));
      if (error) throw error;

      const recipeIds = [...new Set((plans ?? []).map((p) => p.recipe_id).filter(Boolean))];
      if (recipeIds.length === 0) throw new Error("Plan some meals first to build a list");

      const { data: ingredients, error: ingError } = await supabase
        .from("ingredients")
        .select("name, quantity")
        .in("recipe_id", recipeIds as string[]);
      if (ingError) throw ingError;

      const { data: existing } = await supabase
        .from("shopping_items")
        .select("name")
        .eq("list_id", listId);
      const known = new Set((existing ?? []).map((i) => i.name.toLowerCase()));

      const merged = new Map<string, string[]>();
      for (const ing of ingredients ?? []) {
        const key = ing.name.trim().toLowerCase();
        if (known.has(key)) continue;
        const list = merged.get(key) ?? [];
        if (ing.quantity) list.push(ing.quantity);
        merged.set(key, list);
      }

      if (merged.size === 0) throw new Error("Nothing new to add — your list is up to date");

      const rows = [...merged.entries()].map(([name, quantities]) => ({
        user_id: userId,
        list_id: listId,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        quantity: quantities.join(" + ") || null,
      }));

      const { error: insertError } = await supabase.from("shopping_items").insert(rows);
      if (insertError) throw insertError;
      return rows.length;
    },
    onSuccess: (count) => {
      void qc.invalidateQueries({ queryKey: ["shopping-list"] });
      void qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(`Shopping list generated — ${count} item${count === 1 ? "" : "s"} added`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useShoppingItemMutations(userId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["shopping-list"] });
    void qc.invalidateQueries({ queryKey: ["stats"] });
  };

  const addItem = useMutation({
    mutationFn: async ({ name, quantity }: { name: string; quantity: string }) => {
      const listId = await ensureList(userId);
      const { error } = await supabase.from("shopping_items").insert({
        user_id: userId,
        list_id: listId,
        name: name.trim(),
        quantity: quantity.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Item added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<Pick<ShoppingItem, "name" | "quantity" | "purchased">>;
    }) => {
      const { error } = await supabase.from("shopping_items").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shopping_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Item removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const clearPurchased = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("shopping_items")
        .delete()
        .eq("purchased", true)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Completed items cleared");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { addItem, updateItem, deleteItem, clearPurchased };
}
