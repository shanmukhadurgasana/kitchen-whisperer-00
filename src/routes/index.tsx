import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChefHat,
  Heart,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Recipe Hub — Your recipes, meal plan and shopping list" },
      {
        name: "description",
        content:
          "Recipe Hub is a calm home for the food you actually cook: save recipes, plan the week and generate a shopping list in one tap.",
      },
      { property: "og:title", content: "Recipe Hub — Your recipes, meal plan and shopping list" },
      {
        property: "og:description",
        content: "Save recipes, plan the week and generate your shopping list automatically.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "A recipe box that scales",
    body: "Ingredients, method, photos, timings and categories — searchable and filterable in a second.",
  },
  {
    icon: CalendarDays,
    title: "Plan the week visually",
    body: "Drop recipes into breakfast, lunch and dinner across a seven-day board.",
  },
  {
    icon: ShoppingCart,
    title: "Shopping list, generated",
    body: "Savora merges every ingredient from your plan into one tickable list.",
  },
  {
    icon: Heart,
    title: "Favourites at hand",
    body: "Star the keepers so the meals you love are never more than a click away.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="gradient-brand flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Recipe Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth" search={{ mode: "signup" }}>
              Get started
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Recipes, planning and shopping in one place
            </span>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Cook better weeks, <span className="text-primary">not just meals</span>.
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Savora keeps your recipe box, weekly meal plan and shopping list perfectly in sync —
              so deciding what&apos;s for dinner stops being a daily negotiation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create your free account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth">I already have one</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-panel relative rounded-3xl p-5 shadow-lift"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg">This week</p>
                <span className="text-xs text-muted-foreground">18 recipes · 21 meals</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div key={day} className="rounded-xl border bg-card/70 p-3">
                    <p className="text-muted-foreground">{day}</p>
                    <p className="mt-1 font-medium">
                      {
                        [
                          "Lemon risotto",
                          "Miso salmon",
                          "Chickpea curry",
                          "Ragù rigatoni",
                          "Tacos",
                          "Roast chicken",
                        ][index]
                      }
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border bg-card/70 p-4">
                <p className="text-sm font-medium">Shopping list · 12 items</p>
                <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <p>200 g arborio rice</p>
                  <p>2 lemons</p>
                  <p>Bunch of coriander</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t bg-secondary/40 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="font-display text-3xl tracking-tight">Everything a home cook needs</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border bg-card p-5 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Recipe Hub</p>
          <Link to="/auth" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
