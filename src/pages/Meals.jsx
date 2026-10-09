import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/empty-state";
import SkeletonList from "@/components/ui/skeleton-list";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MealPlanForm from "../components/meals/MealPlanForm";
import ShoppingListView from "../components/meals/ShoppingListView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Apple,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Loader2,
  Send,
  ShoppingCart,
  Play,
  FileDown,
  Sparkles,
  Eye
} from "lucide-react";
import MealPlanPdfModal from "@/components/pdf/MealPlanPdfModal";
import MealPlanDetailModal from "@/components/meals/MealPlanDetailModal";

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  archived: "bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30"
};

const categoryStyles = {
  weight_loss: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  muscle_gain: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  maintenance: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  performance: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  health: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

export default function Meals() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlClientId = new URLSearchParams(location.search).get("client_id");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("plans");
  const [sendingPlan, setSendingPlan] = useState(null);
  const [shoppingListPlan, setShoppingListPlan] = useState(null);
  const [pdfPlan, setPdfPlan] = useState(null);
  const [detailPlan, setDetailPlan] = useState(null);

  const queryClient = useQueryClient();

  const { data: mealPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["mealPlans"],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.MealPlan.filter({ trainer_id: currentUser.id }, "-updated_date");
    },
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["mealTemplates"],
    queryFn: () => base44.entities.MealPlanTemplate.list("-updated_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MealPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setShowForm(false);
      setEditingPlan(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      setDeletingPlan(null);
    },
  });

  const handleSubmit = async (data) => {
    try {
      const user = await base44.auth.me();
      const submitData = { ...data, trainer_id: user.id };
      
      if (editingPlan?.id) {
        await updateMutation.mutateAsync({ id: editingPlan.id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }

      if (urlClientId) {
        navigate(createPageUrl("ClientProfile") + "?id=" + urlClientId);
      }
    } catch (error) {
      console.error('Error submitting meal plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deletingPlan) {
      await deleteMutation.mutateAsync(deletingPlan.id);
    }
  };

  const handleDuplicate = async (plan) => {
    const newPlan = {
      ...plan,
      name: `${plan.name} (Copy)`,
      status: "draft",
      client_id: null,
    };
    delete newPlan.id;
    delete newPlan.created_date;
    delete newPlan.updated_date;
    await createMutation.mutateAsync(newPlan);
  };

  const handleStatusChange = async (plan, newStatus) => {
    await updateMutation.mutateAsync({
      id: plan.id,
      data: { ...plan, status: newStatus },
    });
  };

  const handleUseTemplate = (template) => {
    setEditingPlan({
      name: template.name,
      description: template.description,
      duration_days: template.duration_days,
      calories_target: template.calories_target,
      protein_target_g: template.protein_target_g,
      carbs_target_g: template.carbs_target_g,
      fat_target_g: template.fat_target_g,
      meals: template.meals || [],
      status: urlClientId ? "active" : "draft",
      client_id: urlClientId || null
    });
    setShowForm(true);
    setActiveTab("plans");
  };

  const handleSendToClient = async (plan) => {
    if (!plan.client_id) {
      return;
    }

    const client = clients.find(c => c.id === plan.client_id);
    if (!client || !client.user_id) {
      return;
    }

    const user = await base44.auth.me();
    
    // Format meal plan details
    let messageContent = `📋 **${plan.name}**\n\n`;
    if (plan.description) {
      messageContent += `${plan.description}\n\n`;
    }
    
    messageContent += `**Nutrition Targets:**\n`;
    if (plan.calories_target) messageContent += `• Calories: ${plan.calories_target} cal/day\n`;
    if (plan.protein_target_g) messageContent += `• Protein: ${plan.protein_target_g}g\n`;
    if (plan.carbs_target_g) messageContent += `• Carbs: ${plan.carbs_target_g}g\n`;
    if (plan.fat_target_g) messageContent += `• Fat: ${plan.fat_target_g}g\n`;
    
    if (plan.meals && plan.meals.length > 0) {
      messageContent += `\n**Meals:**\n\n`;
      
      plan.meals.forEach((meal, idx) => {
        messageContent += `**Day ${meal.day} - ${meal.meal_type}**: ${meal.name || 'Meal'}\n`;
        
        if (meal.foods && meal.foods.length > 0) {
          meal.foods.forEach(food => {
            messageContent += `  • ${food.name} (${food.amount} ${food.unit})`;
            if (food.calories || food.protein || food.carbs || food.fat) {
              messageContent += ` - ${food.calories || 0}cal, ${food.protein || 0}g protein, ${food.carbs || 0}g carbs, ${food.fat || 0}g fat`;
            }
            messageContent += `\n`;
          });
        }
        
        if (meal.instructions) {
          messageContent += `  Instructions: ${meal.instructions}\n`;
        }
        messageContent += `\n`;
      });
    }

    const conversationId = [user.id, client.user_id].sort().join('-');
    
    await base44.entities.Message.create({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_name: user.full_name,
      receiver_id: client.user_id,
      receiver_name: client.full_name,
      content: messageContent,
      read: false,
      timestamp: new Date().toISOString()
    });

    await base44.entities.Notification.create({
      user_id: client.user_id,
      type: "meal_assigned",
      title: "New Meal Plan",
      message: `Your trainer assigned you a meal plan: ${plan.name}`,
      link: "ClientMeals"
    });

    setSendingPlan(null);
  };

  const filteredPlans = mealPlans.filter(
    (plan) => {
      const matchesSearch = plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClient = urlClientId ? (plan.client_id === urlClientId) : true;
      return matchesSearch && matchesClient;
    }
  );

  const filteredTemplates = templates.filter(
    (template) =>
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientName = (clientId) => {
    const client = clients.find((c) => (c.user_id || c.id) === clientId);
    return client?.full_name || "Unassigned";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {urlClientId && (
        <Link to={createPageUrl("ClientProfile") + `?id=${urlClientId}`}>
          <Button variant="ghost" className="mb-2 text-muted-foreground hover:text-foreground pl-0">
            &larr; Back to Client Profile
          </Button>
        </Link>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Apple className="w-7 h-7 text-white" />
            </div>
            {urlClientId ? "Thực Đơn Của Học Viên" : "Thực Đơn Dinh Dưỡng"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {urlClientId ? "Quản lý chế độ ăn và xuất PDF cho học viên này" : "Soạn bữa ăn và xuất PDF 1 chạm gửi qua Zalo cho học viên"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to={createPageUrl("TrainerAssistant")}>
            <Button
              variant="outline"
              className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
              Tạo Bằng AI 1 Chạm
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingPlan(urlClientId ? { client_id: urlClientId, status: "active" } : null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/25 rounded-xl font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            + Tạo Thực Đơn Mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm thực đơn dinh dưỡng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full sm:w-auto grid-cols-2 mb-6">
          <TabsTrigger value="plans">Thực Đơn Học Viên</TabsTrigger>
          <TabsTrigger value="templates">Thực Đơn Mẫu</TabsTrigger>
        </TabsList>

        {/* Client Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          {plansLoading ? (
            <SkeletonList count={6} columns={3} avatar={false} lines={3} />
          ) : filteredPlans.length === 0 ? (
            <EmptyState
              icon={Apple}
              title="Chưa có thực đơn nào"
              description="Thiết lập mục tiêu calo, đạm, tinh bột, chất béo và xây dựng bữa ăn cho học viên để xuất PDF nhanh chóng."
              actionLabel="+ Tạo thực đơn đầu tiên"
              onAction={() => { setEditingPlan(null); setShowForm(true); }}
              hints={[
                "Bấm Thêm Món trong từng bữa để tra cứu dữ liệu dinh dưỡng thật (calo, đạm, carb, chất béo tự động tính toán).",
                "Có thể tạo thực đơn mẫu để áp dụng cho nhiều học viên khác nhau chỉ với 1 chạm.",
                "Sau khi soạn xong, bấm Xuất PDF để gửi trực tiếp cho học viên qua Zalo / Messenger.",
              ]}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 
                          onClick={() => setDetailPlan(plan)}
                          className="text-lg font-bold text-foreground mb-1 cursor-pointer hover:text-emerald-500 transition-colors truncate"
                          title="Bấm để xem chi tiết thực đơn"
                        >
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description || "Chưa có mô tả"}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem onClick={() => setDetailPlan(plan)} className="font-semibold text-emerald-500">
                            <Eye className="w-4 h-4 mr-2" /> Xem Chi Tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(plan, "active")}>
                            <Play className="w-4 h-4 mr-2" /> Đặt làm Đang áp dụng
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(plan, "draft")}>
                            <Clock className="w-4 h-4 mr-2" /> Chuyển về Bản nháp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(plan, "completed")}>
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Đánh dấu Hoàn thành
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(plan)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPdfPlan(plan)}>
                            <FileDown className="w-4 h-4 mr-2 text-emerald-500" />
                            Xuất File PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShoppingListPlan(plan)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Danh Sách Mua Sắm
                          </DropdownMenuItem>
                          {plan.client_id && (
                            <DropdownMenuItem onClick={() => handleSendToClient(plan)}>
                              <Send className="w-4 h-4 mr-2" />
                              Gửi Cho Học Viên
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Nhân Bản
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingPlan(plan)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa Thực Đơn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusStyles[plan.status] || statusStyles.active}>
                        {plan.status === "active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {plan.status === "draft" && <Clock className="w-3 h-3 mr-1" />}
                        {plan.status === "active" ? "Đang áp dụng" : plan.status === "draft" ? "Bản nháp" : plan.status === "completed" ? "Hoàn thành" : "Lưu trữ"}
                      </Badge>
                      {plan.client_id && (
                        <Badge variant="outline" className="gap-1 text-muted-foreground border-border">
                          <Users className="w-3 h-3" />
                          {getClientName(plan.client_id)}
                        </Badge>
                      )}
                    </div>

                    {plan.calories_target && (
                      <div className="text-sm text-foreground">
                        <strong className="text-muted-foreground">Mục tiêu:</strong> {plan.calories_target} kcal/ngày
                      </div>
                    )}

                    {plan.duration_days && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {plan.duration_days} ngày
                      </div>
                    )}

                    {plan.meals && plan.meals.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          {plan.meals.length} bữa ăn trong kế hoạch
                        </div>
                        <div className="max-h-28 overflow-y-auto text-xs text-muted-foreground space-y-1 border-t border-border pt-2">
                          {(plan.meals || []).slice(0, 4).map((meal, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span><strong className="text-foreground">Ngày {meal.day} - {meal.name || meal.meal_type}:</strong></span>
                              <span>{meal.foods?.length || 0} món</span>
                            </div>
                          ))}
                          {(plan.meals || []).length > 4 && (
                            <div className="text-[11px] text-emerald-500 font-medium text-center pt-0.5">
                              + {(plan.meals || []).length - 4} bữa khác (bấm Xem Chi Tiết)
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-1.5 h-8"
                        onClick={() => setDetailPlan(plan)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem Chi Tiết
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-sm h-8"
                        onClick={() => setPdfPlan(plan)}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Xuất PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-border h-8 px-2.5 text-foreground hover:bg-accent"
                        onClick={() => handleEdit(plan)}
                        title="Chỉnh sửa thực đơn"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="glass-card rounded-2xl">
              <div className="flex flex-col items-center justify-center py-12">
                <Apple className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Chưa có thực đơn mẫu nào
                </h3>
                <p className="text-muted-foreground text-center">
                  Thực đơn mẫu sẽ hiển thị tại đây khi bạn tạo
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => setDetailPlan(template)}
                      className="text-lg font-bold text-foreground cursor-pointer hover:text-emerald-500 transition-colors"
                      title="Bấm để xem chi tiết thực đơn"
                    >
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {template.description || "Chưa có mô tả"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Badge className={categoryStyles[template.category]}>
                      {template.category?.replace("_", " ")}
                    </Badge>

                    {template.calories_target && (
                      <div className="text-sm text-foreground">
                        <strong className="text-muted-foreground">Mục tiêu:</strong> {template.calories_target} kcal/ngày
                      </div>
                    )}

                    {template.duration_days && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {template.duration_days} ngày
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      onClick={() => setDetailPlan(template)}
                      variant="outline"
                      size="sm"
                      className="flex-1 font-semibold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 h-8"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem Chi Tiết
                    </Button>
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8"
                    >
                      Dùng Mẫu Này
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meal Plan Detail Modal */}
      <MealPlanDetailModal
        open={!!detailPlan}
        onOpenChange={(open) => !open && setDetailPlan(null)}
        plan={detailPlan}
        client={clients.find((c) => (c.user_id || c.id) === detailPlan?.client_id)}
        onEdit={(p) => handleEdit(p)}
        onExportPdf={(p) => setPdfPlan(p)}
      />

      {/* Meal Plan Form */}
      <MealPlanForm
        open={showForm}
        onOpenChange={setShowForm}
        plan={editingPlan}
        clients={clients}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingPlan}
        onOpenChange={() => setDeletingPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa Thực Đơn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thực đơn "{deletingPlan?.name}" không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa Vĩnh Viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Shopping List View */}
      {shoppingListPlan && (
        <ShoppingListView
          mealPlanId={shoppingListPlan.id}
          mealPlanName={shoppingListPlan.name}
          onOpenChange={(open) => !open && setShoppingListPlan(null)}
        />
      )}

      {/* PDF Export Modal */}
      <MealPlanPdfModal
        open={!!pdfPlan}
        onOpenChange={(open) => !open && setPdfPlan(null)}
        plan={pdfPlan}
        client={clients.find((c) => (c.user_id || c.id) === pdfPlan?.client_id)}
      />
    </div>
  );
}