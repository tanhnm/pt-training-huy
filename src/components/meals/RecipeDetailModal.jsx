import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, Flame, Edit, CheckCircle2, Utensils } from "lucide-react";

const CATEGORY_MAP = {
  all: "Tất cả",
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ",
  dessert: "Tráng miệng",
  smoothie: "Sinh tố / Smoothie"
};

export default function RecipeDetailModal({ open, onOpenChange, recipe, onEdit }) {
  if (!recipe) return null;

  const totalTime = (parseInt(recipe.prep_time_minutes) || 0) + (parseInt(recipe.cook_time_minutes) || 0);

  // Normalize ingredients
  let ingredientsList = [];
  if (Array.isArray(recipe.ingredients)) {
    ingredientsList = recipe.ingredients;
  } else if (typeof recipe.ingredients === "string") {
    ingredientsList = recipe.ingredients.split("\n").filter(Boolean).map(line => {
      const parts = line.split(",").map(p => p.trim());
      return {
        name: parts[0] || line,
        amount: parts[1] || "",
        unit: parts[2] || ""
      };
    });
  }

  // Normalize instructions
  const instructionSteps = typeof recipe.instructions === "string"
    ? recipe.instructions.split("\n").filter(s => s.trim().length > 0)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-border bg-card text-foreground p-6 shadow-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                  <ChefHat className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {recipe.name}
                </DialogTitle>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {CATEGORY_MAP[recipe.category] || recipe.category}
                </Badge>
              </div>
              {recipe.description && (
                <DialogDescription className="text-sm text-muted-foreground pt-1">
                  {recipe.description}
                </DialogDescription>
              )}
            </div>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border text-foreground hover:bg-secondary shrink-0"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(recipe);
                }}
              >
                <Edit className="w-4 h-4 text-emerald-500" />
                <span>Chỉnh Sửa</span>
              </Button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Thời gian: <strong className="text-foreground">{totalTime} phút</strong>
                {recipe.prep_time_minutes ? ` (Chuẩn bị: ${recipe.prep_time_minutes}m` : ""}
                {recipe.cook_time_minutes ? `, Nấu: ${recipe.cook_time_minutes}m)` : ""}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <Users className="w-3.5 h-3.5 text-yellow-500" />
                Khẩu phần: <strong className="text-foreground">{recipe.servings} phần</strong>
              </span>
            )}
            {recipe.calories_per_serving && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Năng lượng: <strong className="text-foreground">{recipe.calories_per_serving} kcal/khẩu phần</strong>
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Nutrition Breakdown */}
        {(recipe.calories_per_serving || recipe.protein_per_serving || recipe.carbs_per_serving || recipe.fat_per_serving) && (
          <div className="my-3 p-4 rounded-2xl bg-secondary/60 border border-border space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Dinh Dưỡng Mỗi Khẩu Phần (Macros per Serving)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-card border border-border rounded-xl p-2.5">
                <div className="text-xs text-muted-foreground font-medium">Calories</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{recipe.calories_per_serving || 0}</div>
                <div className="text-[10px] text-muted-foreground">kcal</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-2.5">
                <div className="text-xs text-blue-500 font-semibold">Chất Đạm (Protein)</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{recipe.protein_per_serving || 0}g</div>
                <div className="text-[10px] text-muted-foreground">protein</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-2.5">
                <div className="text-xs text-amber-500 font-semibold">Tinh Bột (Carbs)</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{recipe.carbs_per_serving || 0}g</div>
                <div className="text-[10px] text-muted-foreground">carbohydrate</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-2.5">
                <div className="text-xs text-red-500 font-semibold">Chất Béo (Fat)</div>
                <div className="text-xl font-bold text-foreground mt-0.5">{recipe.fat_per_serving || 0}g</div>
                <div className="text-[10px] text-muted-foreground">lipid</div>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients & Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
          {/* Ingredients */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" />
              Nguyên Liệu Cần Chuẩn Bị
            </h4>
            {ingredientsList.length > 0 ? (
              <ul className="space-y-2">
                {ingredientsList.map((ing, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/40 border border-border/40">
                    <span className="font-medium text-foreground">{ing.name}</span>
                    <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                      {ing.amount} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground italic">Chưa có danh sách nguyên liệu cụ thể.</p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              Các Bước Chế Biến
            </h4>
            {instructionSteps.length > 0 ? (
              <ol className="space-y-2.5">
                {instructionSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm p-2 rounded-lg bg-secondary/30 border border-border/30">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground italic">Chưa có hướng dẫn chế biến cụ thể.</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && (Array.isArray(recipe.tags) ? recipe.tags.length > 0 : Boolean(recipe.tags)) && (
          <div className="pt-3 border-t border-border flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Thẻ phân loại:</span>
            {(Array.isArray(recipe.tags) ? recipe.tags : recipe.tags.split(",").map(t => t.trim())).map((tag, idx) => (
              <Badge key={idx} variant="outline" className="text-xs border-border bg-secondary text-muted-foreground">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
