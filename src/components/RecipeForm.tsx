import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { SignedImage } from "@/components/SignedImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategories, type RecipeInput } from "@/services/recipes";
import { uploadImage } from "@/services/storage";
import { DIFFICULTIES, type Difficulty, type IngredientDraft, type RecipeDetail } from "@/types";

type FormValues = {
  title: string;
  description: string;
  cook_time: number;
  servings: number;
  instructions: string;
  notes: string;
};

export function RecipeForm({
  userId,
  recipe,
  submitLabel,
  pending,
  onSubmit,
}: {
  userId: string;
  recipe?: RecipeDetail;
  submitLabel: string;
  pending: boolean;
  onSubmit: (input: RecipeInput) => void;
}) {
  const { data: categories = [] } = useCategories();
  const [categoryId, setCategoryId] = useState<string>(recipe?.category_id ?? "none");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    (recipe?.difficulty as Difficulty) ?? "easy",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(recipe?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    recipe?.ingredients.length
      ? recipe.ingredients.map((i) => ({ name: i.name, quantity: i.quantity ?? "" }))
      : [{ name: "", quantity: "" }],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: recipe?.title ?? "",
      description: recipe?.description ?? "",
      cook_time: recipe?.cook_time ?? 30,
      servings: recipe?.servings ?? 2,
      instructions: recipe?.instructions ?? "",
      notes: recipe?.notes ?? "",
    },
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setUploading(true);
    try {
      setImageUrl(await uploadImage("recipe-images", userId, file));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function submit(values: FormValues) {
    if (ingredients.every((i) => !i.name.trim())) {
      toast.error("Add at least one ingredient");
      return;
    }
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      instructions: values.instructions.trim(),
      notes: values.notes.trim(),
      cook_time: Number(values.cook_time),
      servings: Number(values.servings),
      difficulty,
      category_id: categoryId === "none" ? null : categoryId,
      image_url: imageUrl,
      ingredients,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Creamy lemon risotto"
                {...register("title", { required: "Title is required", maxLength: 120 })}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="A bright, silky risotto that comes together in one pan."
                {...register("description", { maxLength: 500 })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cook_time">Cooking time (min)</Label>
                <Input
                  id="cook_time"
                  type="number"
                  min={1}
                  max={1440}
                  {...register("cook_time", { required: true, min: 1, max: 1440 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  max={50}
                  {...register("servings", { required: true, min: 1, max: 50 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingredients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  aria-label={`Ingredient ${index + 1} quantity`}
                  className="w-28"
                  placeholder="200 g"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    setIngredients((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, quantity: e.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  aria-label={`Ingredient ${index + 1} name`}
                  placeholder="Arborio rice"
                  value={ingredient.name}
                  onChange={(e) =>
                    setIngredients((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, name: e.target.value } : item,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove ingredient"
                  onClick={() =>
                    setIngredients((prev) =>
                      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIngredients((prev) => [...prev, { name: "", quantity: "" }])}
            >
              <Plus className="mr-1 h-4 w-4" /> Add ingredient
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Method &amp; notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions">Cooking instructions</Label>
              <Textarea
                id="instructions"
                rows={8}
                placeholder={"1. Toast the rice.\n2. Add stock a ladle at a time..."}
                {...register("instructions", { maxLength: 8000 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Great with a green salad."
                {...register("notes", { maxLength: 2000 })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-[4/3] overflow-hidden rounded-xl border">
              <SignedImage path={imageUrl} alt="Recipe photo preview" />
            </div>
            <Label
              htmlFor="recipe-image"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-3 text-sm font-medium hover:bg-secondary"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload image"}
            </Label>
            <input
              id="recipe-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
            {imageUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
                Remove photo
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorised</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={pending || uploading}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
