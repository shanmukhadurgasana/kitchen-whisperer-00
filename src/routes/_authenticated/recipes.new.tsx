import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RecipeForm } from "@/components/RecipeForm";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthProvider";
import { useCreateRecipe } from "@/services/recipes";

export const Route = createFileRoute("/_authenticated/recipes/new")({
  component: NewRecipePage,
});

function NewRecipePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createRecipe = useCreateRecipe(user?.id ?? "");

  return (
    <AppShell title="New recipe" description="Add a dish to your collection.">
      {user && (
        <RecipeForm
          userId={user.id}
          submitLabel="Save recipe"
          pending={createRecipe.isPending}
          onSubmit={(input) =>
            createRecipe.mutate(input, {
              onSuccess: (id) => navigate({ to: "/recipes/$recipeId", params: { recipeId: id } }),
            })
          }
        />
      )}
    </AppShell>
  );
}
