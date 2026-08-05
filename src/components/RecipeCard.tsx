import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Flame, Heart, Users } from "lucide-react";

import { SignedImage } from "@/components/SignedImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecipeWithMeta } from "@/types";

export function RecipeCard({
  recipe,
  onToggleFavorite,
}: {
  recipe: RecipeWithMeta;
  onToggleFavorite?: (recipe: RecipeWithMeta) => void;
}) {
  const isFavorite = recipe.favorites.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow hover:shadow-lift"
    >
      <Link to="/recipes/$recipeId" params={{ recipeId: recipe.id }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SignedImage
            path={recipe.image_url}
            alt={recipe.title}
            className="transition-transform duration-500 group-hover:scale-105"
          />
          {recipe.categories && (
            <Badge className="absolute left-3 top-3 border-0 bg-card/85 text-card-foreground backdrop-blur">
              {recipe.categories.name}
            </Badge>
          )}
        </div>
      </Link>

      {onToggleFavorite && (
        <Button
          size="icon"
          variant="secondary"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          onClick={() => onToggleFavorite(recipe)}
          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-card/85 backdrop-blur hover:bg-card"
        >
          <Heart
            className={cn("h-4 w-4", isFavorite ? "fill-primary text-primary" : "text-foreground")}
          />
        </Button>
      )}

      <div className="space-y-3 p-4">
        <Link to="/recipes/$recipeId" params={{ recipeId: recipe.id }}>
          <h3 className="line-clamp-1 text-lg font-semibold">{recipe.title}</h3>
        </Link>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {recipe.description || "No description yet."}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recipe.cook_time} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {recipe.servings}
          </span>
          <span className="inline-flex items-center gap-1 capitalize">
            <Flame className="h-3.5 w-3.5" /> {recipe.difficulty}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
