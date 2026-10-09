import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Wand2, ChefHat } from "lucide-react";
import { toast } from "sonner";

export default function AIRecipeGenerator({ onRecipeGenerated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("high_protein");
  const [category, setCategory] = useState("dinner");
  const [dietary, setDietary] = useState("none");
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional chef and nutritionist. Generate a single healthy fitness recipe.

Category: ${category}
Nutritional Goal: ${goal.replace("_", " ")}
Dietary Preference: ${dietary === "none" ? "No restriction" : dietary}
${prompt ? `Special Request: ${prompt}` : ""}

Create a practical, delicious recipe that supports the nutritional goal. Use common ingredients.

Return ONLY valid JSON (no markdown):
{
  "name": "Recipe name",
  "description": "1-2 sentence description",
  "meal_type": "${category}",
  "prep_time_minutes": 10,
  "cook_time_minutes": 20,
  "servings": 2,
  "ingredients": [
    { "name": "ingredient", "quantity": "200g" }
  ],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "calories": 450,
  "macros": {
    "protein": 40,
    "carbs": 35,
    "fat": 15
  },
  "tags": ["high-protein", "quick"]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            meal_type: { type: "string" },
            prep_time_minutes: { type: "number" },
            cook_time_minutes: { type: "number" },
            servings: { type: "number" },
            ingredients: { type: "array" },
            instructions: { type: "array" },
            calories: { type: "number" },
            macros: { type: "object" },
            tags: { type: "array" }
          }
        }
      });

      // Save to Recipe entity
      const saved = await base44.entities.Recipe.create({
        name: response.name,
        description: response.description,
        meal_type: response.meal_type,
        calories: response.calories,
        macros: response.macros,
        ingredients: response.ingredients,
        instructions: response.instructions,
        tags: response.tags || []
      });

      toast.success(`AI generated "${response.name}"! 🍽️`);
      onRecipeGenerated?.(saved);
      setOpen(false);
      setPrompt("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 font-bold"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        AI Gợi Ý Món Ăn
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <ChefHat className="w-5 h-5 text-purple-500" />
              AI Gợi Ý Món Ăn & Công Thức
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bữa Ăn</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="breakfast">Bữa sáng (Breakfast)</SelectItem>
                  <SelectItem value="lunch">Bữa trưa (Lunch)</SelectItem>
                  <SelectItem value="dinner">Bữa tối (Dinner)</SelectItem>
                  <SelectItem value="snack">Bữa phụ / Ăn nhẹ (Snack)</SelectItem>
                  <SelectItem value="smoothie">Sinh tố / Smoothie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mục Tiêu Dinh Dưỡng</label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="high_protein">Giàu Protein (High Protein)</SelectItem>
                  <SelectItem value="low_carb">Ít Tinh Bột (Low Carb)</SelectItem>
                  <SelectItem value="weight_loss">Giảm Cân / Đốt Mỡ</SelectItem>
                  <SelectItem value="muscle_gain">Tăng Trưởng Cơ Bắp</SelectItem>
                  <SelectItem value="balanced">Cân Bằng Dinh Dưỡng</SelectItem>
                  <SelectItem value="pre_workout">Nạp Năng Lượng Trước Tập</SelectItem>
                  <SelectItem value="post_workout">Phục Hồi Nhanh Sau Tập</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Chế Độ Ăn</label>
              <Select value={dietary} onValueChange={setDietary}>
                <SelectTrigger className="bg-card border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="none">Không kiêng khem</SelectItem>
                  <SelectItem value="vegan">Thuần chay (Vegan)</SelectItem>
                  <SelectItem value="vegetarian">Ăn chay (Vegetarian)</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="gluten_free">Không Gluten (Gluten-Free)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Yêu Cầu Riêng (Tùy chọn)</label>
              <Input
                placeholder="Ví dụ: Nấu nhanh 15 phút, dùng ức gà và rau củ..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tạo công thức món ăn...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Tạo Công Thức Món Ăn</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}