import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthProvider";
import { useShoppingItemMutations, useShoppingList } from "@/services/planner";

export const Route = createFileRoute("/_authenticated/shopping")({
  component: ShoppingPage,
});

function ShoppingPage() {
  const { user } = useAuth();
  const { data } = useShoppingList();
  const { addItem, updateItem, deleteItem, clearPurchased } = useShoppingItemMutations(
    user?.id ?? "",
  );
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const items = data?.items ?? [];

  return (
    <AppShell
      title="Shopping list"
      description="Everything you need for the week, in one place."
      actions={
        <Button size="sm" variant="ghost" onClick={() => clearPurchased.mutate()}>
          Clear ticked
        </Button>
      }
    >
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          addItem.mutate(
            { name, quantity },
            {
              onSuccess: () => {
                setName("");
                setQuantity("");
              },
            },
          );
        }}
      >
        <Input
          className="w-28"
          placeholder="2"
          aria-label="Quantity"
          value={quantity}
          maxLength={40}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Input
          className="min-w-48 flex-1"
          placeholder="Add an item"
          aria-label="Item name"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your list is empty"
          description="Add items by hand, or generate the list from your weekly meal plan."
        />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card shadow-soft">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <Checkbox
                checked={item.purchased}
                aria-label={`Mark ${item.name} as bought`}
                onCheckedChange={(checked) =>
                  updateItem.mutate({ id: item.id, values: { purchased: checked === true } })
                }
              />
              <span
                className={
                  item.purchased ? "flex-1 text-muted-foreground line-through" : "flex-1"
                }
              >
                {item.name}
              </span>
              <span className="text-sm text-muted-foreground">{item.quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${item.name}`}
                onClick={() => deleteItem.mutate(item.id)}
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
