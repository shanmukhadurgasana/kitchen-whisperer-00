import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthProvider";
import {
  startOfWeek,
  toISODate,
  useAssignMeal,
  useGenerateShoppingList,
  useMealPlans,
  weekDays,
} from "@/services/planner";
import { useRecipes } from "@/services/recipes";
import { MEAL_SLOTS } from "@/types";

export const Route = createFileRoute("/_authenticated/planner")({
  component: PlannerPage,
});

function PlannerPage() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const days = weekDays(weekStart);
  const { data: plans = [] } = useMealPlans(weekStart);
  const { data: recipes = [] } = useRecipes();
  const assignMeal = useAssignMeal(user?.id ?? "");
  const generate = useGenerateShoppingList(user?.id ?? "", weekStart);

  function shift(weeks: number) {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + weeks * 7);
    setWeekStart(next);
  }

  return (
    <AppShell
      title="Meal planner"
      description="Assign recipes to each slot, then build your shopping list."
      actions={
        <Button size="sm" onClick={() => generate.mutate()} disabled={generate.isPending}>
          <ShoppingCart className="mr-1 h-4 w-4" /> Generate list
        </Button>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => shift(-1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <p className="text-sm font-medium">
          {days[0]!.toLocaleDateString(undefined, { day: "numeric", month: "short" })} –{" "}
          {days[6]!.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
        </p>
        <Button variant="ghost" size="sm" onClick={() => shift(1)}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => {
          const date = toISODate(day);
          return (
            <div key={date} className="space-y-3 rounded-2xl border bg-card p-4 shadow-soft">
              <div>
                <p className="font-medium">
                  {day.toLocaleDateString(undefined, { weekday: "long" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {day.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                </p>
              </div>
              {MEAL_SLOTS.map((slot) => {
                const entry = plans.find((p) => p.plan_date === date && p.slot === slot);
                return (
                  <div key={slot} className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{slot}</p>
                    <Select
                      value={entry?.recipe_id ?? "none"}
                      onValueChange={(value) =>
                        assignMeal.mutate({
                          date,
                          slot,
                          recipeId: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger aria-label={`${slot} on ${date}`}>
                        <SelectValue placeholder="Add a recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Empty</SelectItem>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
