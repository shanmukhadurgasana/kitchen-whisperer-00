import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { RecipeCard } from "@/components/RecipeCard";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthProvider";
import { useRecipes, useToggleFavorite } from "@/services/recipes";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const { data: recipes = [], isLoading } = useRecipes({ favoritesOnly: true });
  const toggleFavorite = useToggleFavorite(user?.id ?? "");

  return (
    <AppShell title="Favourites" description="The recipes you keep coming back to.">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Tap the heart on any recipe to pin it here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
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
    </AppShell>
  );
}
