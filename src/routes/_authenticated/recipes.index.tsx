import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { RecipeCard } from "@/components/RecipeCard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthProvider";
import { useCategories, useRecipes, useToggleFavorite } from "@/services/recipes";
import { DIFFICULTIES, type Difficulty } from "@/types";

export const Route = createFileRoute("/_authenticated/recipes/")({
  component: RecipesPage,
});

function RecipesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "alpha">("newest");

  const { data: categories = [] } = useCategories();
  const { data: recipes = [], isLoading } = useRecipes({ search, categoryId, difficulty, sort });
  const toggleFavorite = useToggleFavorite(user?.id ?? "");

  return (
    <AppShell
      title="Recipes"
      description="Your whole collection, searchable and filterable."
      actions={
        <Button asChild size="sm">
          <Link to="/recipes/new">
            <Plus className="mr-1 h-4 w-4" /> New recipe
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search recipes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search recipes"
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={difficulty}
          onValueChange={(v) => setDifficulty(v as Difficulty | "all")}
        >
          <SelectTrigger aria-label="Filter by difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any difficulty</SelectItem>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d} className="capitalize">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger aria-label="Sort recipes">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="alpha">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Nothing matches"
          description="Try a different search or add a new recipe to your collection."
          action={
            <Button asChild className="mt-2">
              <Link to="/recipes/new">Add a recipe</Link>
            </Button>
          }
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
