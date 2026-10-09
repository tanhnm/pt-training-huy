import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Search, 
  Dumbbell,
  Calendar,
  User,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  CheckCircle,
  LayoutTemplate,
  Clock,
  FileDown,
  Sparkles,
  Eye
} from "lucide-react";
import WorkoutPdfModal from "@/components/pdf/WorkoutPdfModal";
import WorkoutPlanDetailModal from "@/components/workouts/WorkoutPlanDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import WorkoutForm from "@/components/workouts/WorkoutForm";
import AIWorkoutGenerator from "@/components/ai/AIWorkoutGenerator";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/empty-state";
import { toast } from "sonner";

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  archived: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
};

const difficultyStyles = {
  beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  intermediate: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
};

export default function Workouts() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlClientId = new URLSearchParams(location.search).get("client_id");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [deleteWorkout, setDeleteWorkout] = useState(null);
  const [activeTab, setActiveTab] = useState("plans");
  const [pdfWorkout, setPdfWorkout] = useState(null);
  const [detailWorkout, setDetailWorkout] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      return base44.entities.WorkoutPlan.filter({ trainer_id: currentUser.id }, "-created_date");
    },
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["fitness-templates"],
    queryFn: () => base44.entities.FitnessTemplate.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (data) => {
      if (!user?.id) {
        const currentUser = await base44.auth.me();
        if (!currentUser?.id) throw new Error('User not loaded');
        return base44.entities.WorkoutPlan.create({ ...data, trainer_id: currentUser.id });
      }
      return base44.entities.WorkoutPlan.create({ ...data, trainer_id: user.id });
    },
    onMutate: async (newWorkout) => {
      await queryClient.cancelQueries({ queryKey: ["workouts"] });
      const previous = queryClient.getQueryData(["workouts"]);
      queryClient.setQueryData(["workouts"], (old) => {
        return [{ id: `temp-${Date.now()}`, status: "active", ...newWorkout }, ...(old || [])];
      });
      setShowWorkoutForm(false);
      return { previous };
    },
    onError: (err, newWorkout, context) => {
      queryClient.setQueryData(["workouts"], context.previous);
      toast.error("Failed to create workout plan");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["workouts"] }),
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkoutPlan.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["workouts"] });
      const previous = queryClient.getQueryData(["workouts"]);
      queryClient.setQueryData(["workouts"], (old) => {
        return (old || []).map(w => w.id === id ? { ...w, ...data } : w);
      });
      setShowWorkoutForm(false);
      setEditingWorkout(null);
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["workouts"], context.previous);
      toast.error("Failed to update workout plan");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["workouts"] }),
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkoutPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workouts"] }),
  });

  const handleSubmitWorkout = async (data) => {
    try {
      if (editingWorkout?.id) {
        await updateWorkoutMutation.mutateAsync({ id: editingWorkout.id, data });
      } else {
        const { trainer_id, id, created_date, updated_date, created_by, ...cleanData } = data;
        await createWorkoutMutation.mutateAsync(cleanData);
      }
      setEditingWorkout(null);
      setShowWorkoutForm(false);

      if (urlClientId) {
        navigate(createPageUrl("ClientProfile") + "?id=" + urlClientId);
      }
    } catch (error) {
      console.error('Error submitting workout:', error);
    }
  };

  const handleDeleteWorkout = async () => {
    if (deleteWorkout) {
      await deleteWorkoutMutation.mutateAsync(deleteWorkout.id);
      setDeleteWorkout(null);
    }
  };

  const handleDuplicate = async (workout) => {
    const { id, created_date, updated_date, created_by, trainer_id, ...rest } = workout;
    await createWorkoutMutation.mutateAsync({
      ...rest,
      name: `${rest.name} (Copy)`,
      status: "draft",
      trainer_id: user?.id
    });
  };

  const handleStatusChange = async (workout, newStatus) => {
    await updateWorkoutMutation.mutateAsync({ id: workout.id, data: { status: newStatus } });
  };

  const handleUseTemplate = (template) => {
    const { id, created_date, updated_date, created_by, category, ...templateData } = template;
    setEditingWorkout({
      ...templateData,
      status: urlClientId ? "active" : "draft",
      client_id: urlClientId || null,
      exercises: template.exercises || []
    });
    setShowWorkoutForm(true);
    setActiveTab("plans");
  };

  const getClientById = (clientId) => clients.find(c => (c.user_id || c.id) === clientId);

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || workout.status === statusFilter;
    const matchesClient = urlClientId ? workout.client_id === urlClientId : true;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const filteredTemplates = templates.filter(template => {
    return template.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      {urlClientId && (
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 text-muted-foreground hover:text-foreground pl-0">
          &larr; Quay lại hồ sơ học viên
        </Button>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {urlClientId ? "Giáo Án Của Học Viên" : "Giáo Án Tập Luyện"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Soạn lịch tập luyện và xuất file PDF 1 chạm gửi qua Zalo cho học viên
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to={createPageUrl("TrainerAssistant")}>
            <Button
              variant="outline"
              className="border-purple-500/40 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-xl font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              Tạo Bằng AI 1 Chạm
            </Button>
          </Link>
          <Button 
            onClick={() => { setEditingWorkout(urlClientId ? { client_id: urlClientId, status: "active" } : null); setShowWorkoutForm(true); }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25 rounded-xl font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            + Tạo Giáo Án Mới
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 flex flex-wrap h-auto">
          <TabsTrigger value="plans">Giáo Án Học Viên</TabsTrigger>
          <TabsTrigger value="templates">Giáo Án Mẫu</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "plans" ? "Tìm kiếm giáo án tập luyện..." : "Tìm kiếm mẫu giáo án..."}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeTab === "plans" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="active">Đang áp dụng</SelectItem>
                <SelectItem value="completed">Đã hoàn thành</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="plans" className="mt-6">
          {/* Client Plans Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                  <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
                  <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
                  <div className="h-4 bg-secondary rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((workout) => {
            const client = getClientById(workout.client_id);
            return (
              <div
                key={workout.id}
                className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 
                          onClick={() => setDetailWorkout(workout)}
                          className="font-bold text-foreground cursor-pointer hover:text-amber-500 transition-colors truncate"
                          title="Bấm để xem chi tiết giáo án"
                        >
                          {workout.name}
                        </h3>
                        {client && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3 text-emerald-500" /> {client.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                        <DropdownMenuItem onClick={() => setDetailWorkout(workout)} className="font-semibold text-amber-500">
                          <Eye className="w-4 h-4 mr-2" /> Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(workout, "active")}>
                          <Play className="w-4 h-4 mr-2" /> Đặt làm Đang áp dụng
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(workout, "draft")}>
                          <Clock className="w-4 h-4 mr-2" /> Chuyển về Bản nháp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(workout, "completed")}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Đánh dấu Hoàn thành
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingWorkout(workout); setShowWorkoutForm(true); }}>
                          <Edit className="w-4 h-4 mr-2" /> Chỉnh Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPdfWorkout(workout)}>
                          <FileDown className="w-4 h-4 mr-2 text-amber-500" /> Xuất File PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(workout)}>
                          <Copy className="w-4 h-4 mr-2" /> Nhân Bản
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteWorkout(workout)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa Giáo Án
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {workout.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{workout.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={statusStyles[workout.status] || statusStyles.draft}>
                      {workout.status === "active" ? "Đang áp dụng" : workout.status === "draft" ? "Bản nháp" : workout.status === "completed" ? "Hoàn thành" : "Lưu trữ"}
                    </Badge>
                    <Badge className={difficultyStyles[workout.difficulty] || difficultyStyles.intermediate}>
                      {workout.difficulty === "beginner" ? "Cơ bản" : workout.difficulty === "advanced" ? "Nâng cao" : "Trung cấp"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {workout.duration_weeks || 4} tuần
                    </span>
                    <span>{workout.days_per_week || 3} buổi/tuần</span>
                    <span>{workout.exercises?.length || 0} bài tập</span>
                  </div>

                  {/* Quick actions + PDF export */}
                  <div className="pt-3 border-t border-border flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold text-xs gap-1.5 h-8"
                      onClick={() => setDetailWorkout(workout)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Xem Chi Tiết
                    </Button>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5 shadow-sm h-8"
                      onClick={() => setPdfWorkout(workout)}
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Xuất PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-border h-8 px-2.5 text-foreground hover:bg-accent"
                      onClick={() => { setEditingWorkout(workout); setShowWorkoutForm(true); }}
                      title="Chỉnh sửa giáo án"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          ) : (
            <EmptyState
              icon={Dumbbell}
              filtered={!!searchQuery || statusFilter !== "all"}
              onClearFilters={() => { setSearchQuery(""); setStatusFilter("all"); }}
              title="Chưa có giáo án tập luyện nào"
              description="Lên lịch tập luyện theo từng buổi, giao cho học viên và xuất PDF 1 chạm để gửi ngay."
              actionLabel="+ Tạo giáo án đầu tiên"
              onAction={() => setShowWorkoutForm(true)}
              hints={[
                "Mỗi giáo án có thể chia thành nhiều buổi (Buổi 1, Buổi 2,...). Tên bài tập được giữ nguyên theo chuẩn tiếng Anh gym (Bench Press, Squat, Lat Pulldown...).",
                "Có thể thiết lập số hiệp (Sets), số lần (Reps) và mục tiêu RIR cho từng bài.",
                "Bấm Xuất PDF để tạo file tài liệu đẹp mắt gửi qua Zalo cho học viên.",
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          {/* Templates Grid */}
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                  <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
                  <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
                  <div className="h-4 bg-secondary rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <LayoutTemplate className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <h3 
                            onClick={() => setDetailWorkout(template)}
                            className="font-bold text-foreground cursor-pointer hover:text-amber-500 transition-colors"
                            title="Bấm để xem chi tiết giáo án"
                          >
                            {template.name}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                        </div>
                      </div>
                    </div>

                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={difficultyStyles[template.difficulty] || difficultyStyles.intermediate}>
                        {difficultyLabels[template.difficulty] || (template.difficulty === "beginner" ? "Cơ bản" : template.difficulty === "advanced" ? "Nâng cao" : "Trung cấp")}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {template.duration_weeks || 4} tuần
                      </span>
                      <span>{template.days_per_week || 3} buổi/tuần</span>
                      <span>{template.exercises?.length || 0} bài tập</span>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border mt-3">
                      <Button
                        onClick={() => setDetailWorkout(template)}
                        variant="outline"
                        size="sm"
                        className="flex-1 font-semibold text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1.5 h-8"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem Chi Tiết
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 font-bold text-xs h-8"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Dùng Mẫu Này
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-2xl">
              <LayoutTemplate className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có mẫu giáo án nào</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery ? "Thử điều chỉnh từ khóa tìm kiếm" : "Tạo mẫu giáo án đầu tiên để tái sử dụng nhanh chóng"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* AI Workout Generator — only on main workouts page, not when editing for a specific client (handled in ClientProfile) */}
      {!urlClientId && !showWorkoutForm && (
        <div className="mt-6">
          <AIWorkoutGenerator
            client={clients[0]}
            onPlanGenerated={() => queryClient.invalidateQueries({ queryKey: ["workouts"] })}
          />
        </div>
      )}

      {/* Workout Detail Modal */}
      <WorkoutPlanDetailModal
        open={!!detailWorkout}
        onOpenChange={(open) => !open && setDetailWorkout(null)}
        workout={detailWorkout}
        client={clients.find((c) => (c.user_id || c.id) === detailWorkout?.client_id)}
        onEdit={(w) => {
          setEditingWorkout(w);
          setShowWorkoutForm(true);
        }}
        onExportPdf={(w) => setPdfWorkout(w)}
      />

      <WorkoutForm
        open={showWorkoutForm}
        onOpenChange={setShowWorkoutForm}
        workout={editingWorkout}
        clients={clients}
        onSubmit={handleSubmitWorkout}
      />

      <WorkoutPdfModal
        open={!!pdfWorkout}
        onOpenChange={(open) => !open && setPdfWorkout(null)}
        workout={pdfWorkout}
        client={clients.find((c) => (c.user_id || c.id) === pdfWorkout?.client_id)}
      />

      <AlertDialog open={!!deleteWorkout} onOpenChange={() => setDeleteWorkout(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Xóa Giáo Án</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giáo án "{deleteWorkout?.name}" không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-red-600 hover:bg-red-700">
              Xóa Vĩnh Viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}