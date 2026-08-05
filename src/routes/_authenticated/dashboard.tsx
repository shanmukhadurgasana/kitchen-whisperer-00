import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  ChefHat,
  Heart,
  Plus,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { RecipeCard } from "@/components/RecipeCard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthProvider";
import { useToggleFavorite } from "@/services/recipes";
import { useDashboardStats } from "@/services/stats";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const toggleFavorite = useToggleFavorite(user?.id ?? "");

  const shoppingProgress =
    stats && stats.shoppingTotal > 0
      ? Math.round((stats.shoppingPurchased / stats.shoppingTotal) * 100)
      : 0;
  const planProgress = stats ? Math.round((stats.plannedMeals / 21) * 100) : 0;

  const tiles = [
    { label: "Recipes", value: stats?.totalRecipes ?? 0, icon: UtensilsCrossed },
    { label: "Favourites", value: stats?.favoriteCount ?? 0, icon: Heart },
    { label: "Meals planned this week", value: stats?.plannedMeals ?? 0, icon: CalendarDays },
    { label: "Shopping items", value: stats?.shoppingTotal ?? 0, icon: ShoppingCart },
  ];

  const maxCategory = Math.max(1, ...(stats?.byCategory.map((c) => c.count) ?? [1]));

  return (
    <AppShell
      title="Dashboard"
      description="A quick look at your kitchen this week."
      actions={
        <Button asChild size="sm">
          <Link to="/recipes/new">
            <Plus className="mr-1 h-4 w-4" /> New recipe
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="shadow-soft">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <tile.icon className="h-5 w-5" />
              </span>
              <div>
                {isLoading ? (
                  <Skeleton className="h-7 w-10" />
                ) : (
                  <p className="text-2xl font-semibold">{tile.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{tile.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">This week&apos;s plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={planProgress} />
            <p className="text-sm text-muted-foreground">
              {stats?.plannedMeals ?? 0} of 21 meal slots filled.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link to="/planner">Open planner</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Shopping progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={shoppingProgress} />
            <p className="text-sm text-muted-foreground">
              {stats?.shoppingPurchased ?? 0} of {stats?.shoppingTotal ?? 0} items ticked off.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link to="/shopping">Open list</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Recipes by category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(stats?.byCategory ?? []).slice(0, 5).map((row) => (
              <div key={row.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{row.name}</span>
                  <span className="font-medium">{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(row.count / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {!isLoading && (stats?.byCategory.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Add a recipe to see the breakdown.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently added</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/recipes">View all</Link>
          </Button>
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (stats?.recent.length ?? 0) === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No recipes yet"
            description="Add your first recipe and Recipe Hub will start building your plan and shopping list."
            action={
              <Button asChild className="mt-2">
                <Link to="/recipes/new">Add a recipe</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats?.recent.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={(r) =>
                  toggleFavorite.mutate({ recipeId: r.id, isFavorite: r.favorites.length > 0 })
                }
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
