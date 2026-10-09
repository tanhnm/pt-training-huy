import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Plus, ChefHat, Clock, Users, Flame, Edit, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import AIRecipeGenerator from "@/components/ai/AIRecipeGenerator";
import RecipeDetailModal from "@/components/meals/RecipeDetailModal";

const CATEGORY_MAP = {
  all: "Tất cả danh mục",
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ",
  dessert: "Tráng miệng",
  smoothie: "Sinh tố / Smoothie"
};

export default function Recipes() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [detailRecipe, setDetailRecipe] = useState(null);
  const [deleteRecipeTarget, setDeleteRecipeTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "lunch",
    prep_time_minutes: "",
    cook_time_minutes: "",
    servings: "",
    ingredients: "",
    instructions: "",
    calories_per_serving: "",
    protein_per_serving: "",
    carbs_per_serving: "",
    fat_per_serving: "",
    tags: ""
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list(),
    enabled: true,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create({
      ...data,
      ingredients: data.ingredients.split('\n').filter(i => i.trim()).map(i => {
        const parts = i.split(',').map(p => p.trim());
        return {
          name: parts[0] || '',
          amount: parseFloat(parts[1]) || 0,
          unit: parts[2] || ''
        };
      }),
      tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setFormOpen(false);
      resetForm();
      toast.success("Đã thêm công thức thành công!");
    },
    onError: (error) => {
      console.error("Create failed:", error);
      toast.error("Không thể tạo công thức.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, {
      ...data,
      ingredients: typeof data.ingredients === 'string'
        ? data.ingredients.split('\n').filter(i => i.trim()).map(i => {
            const parts = i.split(',').map(p => p.trim());
            return { name: parts[0] || '', amount: parseFloat(parts[1]) || 0, unit: parts[2] || '' };
          })
        : data.ingredients,
      tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setFormOpen(false);
      setEditingRecipe(null);
      resetForm();
      toast.success("Đã cập nhật công thức thành công!");
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast.error("Không thể cập nhật công thức.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setDeleteRecipeTarget(null);
      toast.success("Đã xóa công thức thành công!");
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      toast.error("Không thể xóa công thức.");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "lunch",
      prep_time_minutes: "",
      cook_time_minutes: "",
      servings: "",
      ingredients: "",
      instructions: "",
      calories_per_serving: "",
      protein_per_serving: "",
      carbs_per_serving: "",
      fat_per_serving: "",
      tags: ""
    });
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || "",
      category: recipe.category,
      prep_time_minutes: recipe.prep_time_minutes || "",
      cook_time_minutes: recipe.cook_time_minutes || "",
      servings: recipe.servings || "",
      ingredients: recipe.ingredients?.map(i => `${i.name}, ${i.amount}, ${i.unit}`).join('\n') || "",
      instructions: recipe.instructions || "",
      calories_per_serving: recipe.calories_per_serving || "",
      protein_per_serving: recipe.protein_per_serving || "",
      carbs_per_serving: recipe.carbs_per_serving || "",
      fat_per_serving: recipe.fat_per_serving || "",
      tags: recipe.tags?.join(', ') || ""
    });
    setFormOpen(true);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || recipe.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kho Công Thức Món Ăn</h1>
          <p className="text-muted-foreground mt-1">Quản lý và tra cứu công thức dinh dưỡng khoa học cho học viên</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AIRecipeGenerator onRecipeGenerated={() => queryClient.invalidateQueries({ queryKey: ['recipes'] })} />
          <Button 
            onClick={() => { resetForm(); setFormOpen(true); }} 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm Công Thức
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm công thức món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56 bg-secondary/60 border-border text-foreground">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="breakfast">Bữa sáng</SelectItem>
            <SelectItem value="lunch">Bữa trưa</SelectItem>
            <SelectItem value="dinner">Bữa tối</SelectItem>
            <SelectItem value="snack">Bữa phụ</SelectItem>
            <SelectItem value="dessert">Tráng miệng</SelectItem>
            <SelectItem value="smoothie">Sinh tố / Smoothie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recipe List */}
      {filteredRecipes.length === 0 ? (
        <Card className="text-center py-12 bg-card border-border">
          <CardContent>
            <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-lg font-medium text-foreground">Không tìm thấy công thức nào</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              {searchTerm || categoryFilter !== "all" 
                ? "Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác" 
                : "Bắt đầu tạo công thức dinh dưỡng đầu tiên cho kho lưu trữ của bạn"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              className="bg-card border-border hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => setDetailRecipe(recipe)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-foreground group-hover:text-emerald-500 transition-colors text-base sm:text-lg">
                      <ChefHat className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="truncate">{recipe.name}</span>
                    </CardTitle>
                    {recipe.description && (
                      <CardDescription className="mt-1 line-clamp-2 text-muted-foreground text-xs sm:text-sm">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8"
                      onClick={() => handleEdit(recipe)}
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                      onClick={() => setDeleteRecipeTarget(recipe)}
                      title="Xóa công thức"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="capitalize bg-secondary/80 border-border text-foreground text-xs">
                    {CATEGORY_MAP[recipe.category] || recipe.category}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailRecipe(recipe);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem Chi Tiết
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1 text-muted-foreground">
                  {recipe.prep_time_minutes ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>{recipe.prep_time_minutes}m</span>
                    </div>
                  ) : <div />}
                  {recipe.servings ? (
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-yellow-500" />
                      <span>{recipe.servings} phần</span>
                    </div>
                  ) : <div />}
                  {recipe.calories_per_serving ? (
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>{recipe.calories_per_serving} kcal</span>
                    </div>
                  ) : <div />}
                </div>

                {(recipe.protein_per_serving || recipe.carbs_per_serving || recipe.fat_per_serving) && (
                  <div className="pt-2.5 border-t border-border space-y-1">
                    <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Macros / khẩu phần</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {recipe.protein_per_serving && (
                        <span className="bg-secondary px-2 py-0.5 rounded text-foreground">
                          <strong className="text-blue-500">{recipe.protein_per_serving}g</strong> Đạm
                        </span>
                      )}
                      {recipe.carbs_per_serving && (
                        <span className="bg-secondary px-2 py-0.5 rounded text-foreground">
                          <strong className="text-amber-500">{recipe.carbs_per_serving}g</strong> Carb
                        </span>
                      )}
                      {recipe.fat_per_serving && (
                        <span className="bg-secondary px-2 py-0.5 rounded text-foreground">
                          <strong className="text-red-500">{recipe.fat_per_serving}g</strong> Béo
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(recipe.tags || []).slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-secondary/50 border-border text-muted-foreground">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <RecipeDetailModal
        recipe={detailRecipe}
        open={!!detailRecipe}
        onOpenChange={(open) => !open && setDetailRecipe(null)}
        onEdit={handleEdit}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteRecipeTarget} onOpenChange={(open) => !open && setDeleteRecipeTarget(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa công thức món ăn?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa công thức <strong className="text-foreground">"{deleteRecipeTarget?.name}"</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-secondary">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(deleteRecipeTarget.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Xóa Công Thức
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create / Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editingRecipe ? 'Chỉnh Sửa Công Thức Món Ăn' : 'Thêm Công Thức Mới'}
            </DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingRecipe) {
                updateMutation.mutate({ id: editingRecipe.id, data: formData });
              } else {
                createMutation.mutate(formData);
              }
            }} 
            className="space-y-4 mt-4"
          >
            <div>
              <Label htmlFor="name" className="text-foreground">Tên Món Ăn *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border text-foreground mt-1"
                placeholder="VD: Ức gà áp chảo sốt bơ tỏi"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">Mô Tả Ngắn</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-secondary border-border text-foreground mt-1"
                placeholder="Mô tả hương vị, độ tiện lợi hoặc mục tiêu dinh dưỡng..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Danh Mục</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="bg-secondary border-border text-foreground mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="breakfast">Bữa sáng</SelectItem>
                    <SelectItem value="lunch">Bữa trưa</SelectItem>
                    <SelectItem value="dinner">Bữa tối</SelectItem>
                    <SelectItem value="snack">Bữa phụ</SelectItem>
                    <SelectItem value="dessert">Tráng miệng</SelectItem>
                    <SelectItem value="smoothie">Sinh tố / Smoothie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="servings" className="text-foreground">Số Khẩu Phần (Người ăn)</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="VD: 1 hoặc 2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prep_time_minutes" className="text-foreground">Thời Gian Chuẩn Bị (phút)</Label>
                <Input
                  id="prep_time_minutes"
                  type="number"
                  value={formData.prep_time_minutes}
                  onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="VD: 15"
                />
              </div>

              <div>
                <Label htmlFor="cook_time_minutes" className="text-foreground">Thời Gian Nấu (phút)</Label>
                <Input
                  id="cook_time_minutes"
                  type="number"
                  value={formData.cook_time_minutes}
                  onChange={(e) => setFormData({ ...formData, cook_time_minutes: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="VD: 20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ingredients" className="text-foreground">Nguyên Liệu (Mỗi dòng một nguyên liệu: tên, số lượng, đơn vị)</Label>
              <Textarea
                id="ingredients"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder={"Ức gà, 200, gram\nDầu ô liu, 1, muỗng canh\nTỏi băm, 2, tép"}
                className="bg-secondary border-border text-foreground mt-1 font-mono text-sm"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="instructions" className="text-foreground">Hướng Dẫn Chế Biến</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder={"Bước 1: Rửa sạch ức gà và thấm khô...\nBước 2: Ướp với một chút muối, tiêu trong 10 phút...\nBước 3: Làm nóng chảo và áp chảo mỗi mặt 5-6 phút..."}
                className="bg-secondary border-border text-foreground mt-1"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="calories_per_serving" className="text-foreground">Năng Lượng (kcal)</Label>
                <Input
                  id="calories_per_serving"
                  type="number"
                  value={formData.calories_per_serving}
                  onChange={(e) => setFormData({ ...formData, calories_per_serving: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="450"
                />
              </div>
              <div>
                <Label htmlFor="protein_per_serving" className="text-foreground">Chất Đạm (g)</Label>
                <Input
                  id="protein_per_serving"
                  type="number"
                  value={formData.protein_per_serving}
                  onChange={(e) => setFormData({ ...formData, protein_per_serving: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="40"
                />
              </div>
              <div>
                <Label htmlFor="carbs_per_serving" className="text-foreground">Tinh Bột (g)</Label>
                <Input
                  id="carbs_per_serving"
                  type="number"
                  value={formData.carbs_per_serving}
                  onChange={(e) => setFormData({ ...formData, carbs_per_serving: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="fat_per_serving" className="text-foreground">Chất Béo (g)</Label>
                <Input
                  id="fat_per_serving"
                  type="number"
                  value={formData.fat_per_serving}
                  onChange={(e) => setFormData({ ...formData, fat_per_serving: parseInt(e.target.value) || "" })}
                  className="bg-secondary border-border text-foreground mt-1"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags" className="text-foreground">Thẻ Phân Loại (cách nhau bởi dấu phẩy)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="giau-dam, it-beo, nhanh-gon, keto"
                className="bg-secondary border-border text-foreground mt-1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" className="border-border text-foreground hover:bg-secondary" onClick={() => setFormOpen(false)}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : (editingRecipe ? 'Cập Nhật' : 'Tạo Mới')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}