import { createFileRoute } from "@tanstack/react-router";
import { Tags, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthProvider";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/services/recipes";

export const Route = createFileRoute("/_authenticated/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory(user?.id ?? "");
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState("");

  return (
    <AppShell title="Categories" description="Organise your recipes however you cook.">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          createCategory.mutate(name, { onSuccess: () => setName("") });
        }}
      >
        <Input
          className="max-w-sm"
          placeholder="Weeknight dinners"
          aria-label="Category name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Add category</Button>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create your first category to group recipes."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-soft"
            >
              <span className="font-medium">{category.name}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Delete ${category.name}`}
                onClick={() => deleteCategory.mutate(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
