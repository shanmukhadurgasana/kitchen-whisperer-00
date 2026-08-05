import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Flame, Heart, Trash2, Users } from "lucide-react";

import { RecipeForm } from "@/components/RecipeForm";
import { SignedImage } from "@/components/SignedImage";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthProvider";
import {
  useDeleteRecipe,
  useRecipe,
  useToggleFavorite,
  useUpdateRecipe,
} from "@/services/recipes";

export const Route = createFileRoute("/_authenticated/recipes/$recipeId")({
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const { recipeId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: recipe, isLoading } = useRecipe(recipeId);
  const toggleFavorite = useToggleFavorite(user?.id ?? "");
  const updateRecipe = useUpdateRecipe(user?.id ?? "", recipeId);
  const deleteRecipe = useDeleteRecipe();

  if (isLoading || !recipe || !user) {
    return (
      <AppShell title="Recipe">
        <Skeleton className="h-96 rounded-2xl" />
      </AppShell>
    );
  }

  const isFavorite = recipe.favorites.length > 0;

  return (
    <AppShell
      title={recipe.title}
      description={recipe.description || undefined}
      actions={
        <>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => toggleFavorite.mutate({ recipeId, isFavorite })}
          >
            <Heart className={isFavorite ? "mr-1 h-4 w-4 fill-primary text-primary" : "mr-1 h-4 w-4"} />
            {isFavorite ? "Saved" : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              deleteRecipe.mutate(
                { id: recipe.id, image_url: recipe.image_url },
                { onSuccess: () => navigate({ to: "/recipes" }) },
              )
            }
          >
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </>
      }
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl border">
              <SignedImage path={recipe.image_url} alt={recipe.title} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {recipe.instructions || "No instructions added yet."}
                </p>
              </CardContent>
            </Card>
            {recipe.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {recipe.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="flex flex-wrap gap-4 p-5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {recipe.cook_time} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {recipe.servings} servings
                </span>
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <Flame className="h-4 w-4" /> {recipe.difficulty}
                </span>
                {recipe.categories && <Badge variant="secondary">{recipe.categories.name}</Badge>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex justify-between gap-3 border-b pb-2">
                      <span>{ingredient.name}</span>
                      <span className="text-muted-foreground">{ingredient.quantity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <RecipeForm
            userId={user.id}
            recipe={recipe}
            submitLabel="Save changes"
            pending={updateRecipe.isPending}
            onSubmit={(input) => updateRecipe.mutate(input)}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
