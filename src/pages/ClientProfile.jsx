import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Zap,
  Dumbbell,
  Apple,
  TrendingUp,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Edit,
  Plus,
  Trash2,
  MoreVertical,
  FileText,
  Target,
  Sparkles,
  Play,
  Clock,
  CheckCircle,
  FileDown,
  Eye,
  Loader2 } from
"lucide-react";
import WorkoutPdfModal from "@/components/pdf/WorkoutPdfModal";
import MealPlanPdfModal from "@/components/pdf/MealPlanPdfModal";
import ProgressPdfModal from "@/components/pdf/ProgressPdfModal";
import ClientDetailModal from "@/components/clients/ClientDetailModal";
import MealPlanDetailModal from "@/components/meals/MealPlanDetailModal";
import CalorieLogDetailModal from "@/components/fitness/CalorieLogDetailModal";
import WorkoutPlanDetailModal from "@/components/workouts/WorkoutPlanDetailModal";
import OnboardingResponses from "@/components/onboarding/OnboardingResponses";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import FitnessProgramForm from "@/components/fitness/FitnessProgramForm";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import CalorieLogForm from "@/components/fitness/CalorieLogForm";
import MealPlanForm from "@/components/meals/MealPlanForm";
import ProgressForm from "@/components/progress/ProgressForm";
import ProgressCharts from "@/components/progress/ProgressCharts";
import ClientNotes from "@/components/clients/ClientNotes";
import ProgressPhotos from "@/components/clients/ProgressPhotos";
import TrophyHabitTracker from "@/components/habits/TrophyHabitTracker";
import WorkoutRoutineCard from "@/components/workouts/WorkoutRoutineCard";
import ItemCompletionTracker from "@/components/ItemCompletionTracker";
import ProgressChartForm from "@/components/forms/ProgressChartForm";
import ParQForm from "@/components/forms/ParQForm";
import ClientIntakeForm from "@/components/forms/ClientIntakeForm";
import MedicalReleaseForm from "@/components/forms/MedicalReleaseForm";
import MedicalReleaseFormPrintable from "@/components/forms/MedicalReleaseFormPrintable";
import ReadinessAnalyzer from "@/components/analytics/ReadinessAnalyzer";
import TrainerClientOnboarding from "@/components/clients/TrainerClientOnboarding";
import ClientDocuments from "@/components/clients/ClientDocuments";
import AIWorkoutGenerator from "@/components/ai/AIWorkoutGenerator";
import AIRecipeGenerator from "@/components/ai/AIRecipeGenerator";
import AIMealPlanGenerator from "@/components/ai/AIMealPlanGenerator";
import { useUnitSystem } from "@/components/hooks/useUnitSystem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  archived: "bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30"
};

const statusLabels = {
  active: "Đang áp dụng",
  inactive: "Hoàn thành",
  paused: "Tạm dừng",
  draft: "Bản nháp",
  completed: "Đã hoàn thành",
  archived: "Lưu trữ"
};

export default function ClientProfile() {
  const { convertWeightDisplay, convertHeightDisplay, weightUnit, heightUnit } = useUnitSystem();
  const location = useLocation();
  const navigate = useNavigate();
  const clientId = new URLSearchParams(location.search).get("id");
  
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showFitnessProgramForm, setShowFitnessProgramForm] = useState(false);
  const [editingFitnessProgram, setEditingFitnessProgram] = useState(null);
  const [deleteFitnessProgram, setDeleteFitnessProgram] = useState(null);
  const [showMealForm, setShowMealForm] = useState(false);
  const [showCalorieForm, setShowCalorieForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editingCalorieLog, setEditingCalorieLog] = useState(null);
  const [editingProgress, setEditingProgress] = useState(null);
  const [deleteWorkout, setDeleteWorkout] = useState(null);
  const [deleteMeal, setDeleteMeal] = useState(null);
  const [deleteCalorieLog, setDeleteCalorieLog] = useState(null);
  const [deleteProgress, setDeleteProgress] = useState(null);
  const [showProgressChart, setShowProgressChart] = useState(false);
  const [showParQ, setShowParQ] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [showMedicalRelease, setShowMedicalRelease] = useState(false);
  const [showClientEdit, setShowClientEdit] = useState(false);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [detailMeal, setDetailMeal] = useState(null);
  const [detailCalorieLog, setDetailCalorieLog] = useState(null);
  const [detailWorkout, setDetailWorkout] = useState(null);
  const [pdfWorkout, setPdfWorkout] = useState(null);
  const [pdfMeal, setPdfMeal] = useState(null);
  const [showProgressPdf, setShowProgressPdf] = useState(false);

  const queryClient = useQueryClient();

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ["client", clientId, user?.id],
    queryFn: async () => {
      if (!clientId) return null;
      try {
        const direct = await base44.entities.Client.get(clientId);
        if (direct) return direct;
      } catch (e) {}
      const allClients = await base44.entities.Client.filter({});
      return allClients.find((c) => c.id === clientId || c.id === `client_${clientId}` || c.user_id === clientId) || allClients[0] || null;
    },
    enabled: true
  });

  const { data: fitnessPrograms = [] } = useQuery({
    queryKey: ["clientFitnessPrograms", clientId, client?.user_id],
    queryFn: async () => {
      const p1 = await base44.entities.FitnessProgram.filter({ client_id: clientId }, "-created_date", 100).catch(() => []);
      const p2 = client?.user_id ? await base44.entities.FitnessProgram.filter({ client_user_id: client.user_id }, "-created_date", 100).catch(() => []) : [];
      const p3 = client?.user_id ? await base44.entities.FitnessProgram.filter({ client_id: client.user_id }, "-created_date", 100).catch(() => []) : [];
      const combined = [...p1, ...p2, ...p3];
      return combined.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    },
    enabled: !!clientId && !!client
  });

  const { data: workouts = [] } = useQuery({
    queryKey: ["workouts", clientId, client?.user_id],
    queryFn: async () => {
      const p1 = await base44.entities.WorkoutPlan.filter({ client_id: clientId }, "-created_date", 100).catch(() => []);
      const p2 = client?.user_id ? await base44.entities.WorkoutPlan.filter({ client_id: client.user_id }, "-created_date", 100).catch(() => []) : [];
      const combined = [...p1, ...p2];
      return combined.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    },
    enabled: !!clientId && !!client
  });

  const { data: calorieLogs = [] } = useQuery({
    queryKey: ["calorieLogs", clientId, client?.user_id],
    queryFn: async () => {
      const p1 = await base44.entities.CalorieLog.filter({ client_id: clientId }, "-created_date", 100).catch(() => []);
      const p2 = client?.user_id ? await base44.entities.CalorieLog.filter({ client_id: client.user_id }, "-created_date", 100).catch(() => []) : [];
      const combined = [...p1, ...p2];
      return combined.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    },
    enabled: !!clientId && !!client
  });

  const { data: meals = [] } = useQuery({
    queryKey: ["meals", clientId, client?.user_id],
    queryFn: async () => {
      const p1 = await base44.entities.MealPlan.filter({ client_id: clientId }, "-created_date", 100).catch(() => []);
      const p2 = client?.user_id ? await base44.entities.MealPlan.filter({ client_id: client.user_id }, "-created_date", 100).catch(() => []) : [];
      const combined = [...p1, ...p2];
      return combined.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    },
    enabled: !!clientId && !!client
  });

  const { data: progressLogs = [] } = useQuery({
    queryKey: ["progress", clientId, client?.user_id],
    queryFn: async () => {
      const p1 = await base44.entities.ProgressLog.filter({ client_id: clientId }, "-date", 100).catch(() => []);
      const p2 = client?.user_id ? await base44.entities.ProgressLog.filter({ client_id: client.user_id }, "-date", 100).catch(() => []) : [];
      const combined = [...p1, ...p2];
      return combined.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    enabled: !!clientId && !!client
  });

  const { data: onboarding } = useQuery({
    queryKey: ["onboarding", clientId],
    queryFn: async () => {
      const records = await base44.entities.Onboarding.filter({ client_id: clientId });
      return records[0] || null;
    },
    enabled: !!clientId
  });

  const createWorkoutMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkoutPlan.create({
      ...data,
      trainer_id: user?.id,
      status: data.client_id ? 'active' : 'draft'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", clientId] });
      setShowWorkoutForm(false);
      setEditingWorkout(null);
    }
  });

  const updateWorkoutMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkoutPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", clientId] });
      setShowWorkoutForm(false);
      setEditingWorkout(null);
    }
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkoutPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts", clientId] });
      setDeleteWorkout(null);
    }
  });

  const createMealMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create({
      ...data,
      trainer_id: user?.id,
      status: data.client_id ? 'active' : 'draft'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", clientId] });
      setShowMealForm(false);
      setEditingMeal(null);
    }
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MealPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", clientId] });
      setShowMealForm(false);
      setEditingMeal(null);
    }
  });

  const deleteMealMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", clientId] });
      setDeleteMeal(null);
    }
  });

  const createCalorieLogMutation = useMutation({
    mutationFn: (data) => base44.entities.CalorieLog.create({
      ...data,
      trainer_id: user?.id,
      client_id: client?.user_id || clientId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calorieLogs", clientId] });
      setShowCalorieForm(false);
      setEditingCalorieLog(null);
    }
  });

  const updateCalorieLogMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CalorieLog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calorieLogs", clientId] });
      setShowCalorieForm(false);
      setEditingCalorieLog(null);
    }
  });

  const deleteCalorieLogMutation = useMutation({
    mutationFn: (id) => base44.entities.CalorieLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calorieLogs", clientId] });
      setDeleteCalorieLog(null);
    }
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgressLog.create({ ...data, client_id: clientId, trainer_id: user?.id }),
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({ queryKey: ["progress", clientId, client?.user_id] });
      const previous = queryClient.getQueryData(["progress", clientId, client?.user_id]);
      queryClient.setQueryData(["progress", clientId, client?.user_id], (old) => {
        return [{ id: `temp-${Date.now()}`, ...newLog }, ...(old || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
      setShowProgressForm(false);
      setEditingProgress(null);
      return { previous };
    },
    onError: (err, newLog, context) => {
      queryClient.setQueryData(["progress", clientId, client?.user_id], context.previous);
      toast.error("Failed to add progress log");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", clientId, client?.user_id] });
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProgressLog.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["progress", clientId, client?.user_id] });
      const previous = queryClient.getQueryData(["progress", clientId, client?.user_id]);
      queryClient.setQueryData(["progress", clientId, client?.user_id], (old) => {
        return (old || []).map((p) => p.id === id ? { ...p, ...data } : p);
      });
      setShowProgressForm(false);
      setEditingProgress(null);
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["progress", clientId, client?.user_id], context.previous);
      toast.error("Failed to update progress log");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", clientId, client?.user_id] });
    }
  });

  const deleteProgressMutation = useMutation({
    mutationFn: (id) => base44.entities.ProgressLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", clientId] });
      setDeleteProgress(null);
    }
  });

  const createFitnessProgramMutation = useMutation({
    mutationFn: (data) => base44.entities.FitnessProgram.create({
      ...data,
      trainer_id: user?.id,
      client_id: clientId,
      client_user_id: client?.user_id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientFitnessPrograms", clientId] });
      setShowFitnessProgramForm(false);
      setEditingFitnessProgram(null);
    }
  });

  const updateFitnessProgramMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FitnessProgram.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientFitnessPrograms", clientId] });
      setShowFitnessProgramForm(false);
      setEditingFitnessProgram(null);
    }
  });

  const deleteFitnessProgramMutation = useMutation({
    mutationFn: (id) => base44.entities.FitnessProgram.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientFitnessPrograms", clientId] });
      setDeleteFitnessProgram(null);
    }
  });

  const handleSubmitFitnessProgram = async (data) => {
    if (editingFitnessProgram) {
      await updateFitnessProgramMutation.mutateAsync({ id: editingFitnessProgram.id, data });
    } else {
      await createFitnessProgramMutation.mutateAsync(data);
    }
    
    // Sync to client profile
    if (data.client_id && data.client_info) {
      const updates = {};
      if (data.client_info.weight_lbs) updates.weight_kg = Math.round(data.client_info.weight_lbs / 2.20462);
      if (data.client_info.body_fat) updates.body_fat_percentage = parseFloat(data.client_info.body_fat);
      if (data.client_info.height_feet) {
         const ft = parseFloat(data.client_info.height_feet) || 0;
         const inch = parseFloat(data.client_info.height_inches) || 0;
         updates.height_cm = Math.round((ft * 12 + inch) * 2.54);
      }
      if (data.client_info.gender) updates.gender = data.client_info.gender.toLowerCase();
      
      if (Object.keys(updates).length > 0) {
         await base44.entities.Client.update(data.client_id, updates).catch(console.error);
         queryClient.invalidateQueries({ queryKey: ["client", data.client_id] });
      }
    }
  };

  const handleSubmitWorkout = async (data) => {
    try {
      if (editingWorkout) {
        await updateWorkoutMutation.mutateAsync({ id: editingWorkout.id, data });
      } else {
        await createWorkoutMutation.mutateAsync({ ...data, client_id: client?.user_id || clientId });
      }
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const handleSubmitMeal = async (data) => {
    try {
      if (editingMeal) {
        await updateMealMutation.mutateAsync({ id: editingMeal.id, data });
      } else {
        await createMealMutation.mutateAsync({ ...data, client_id: client?.user_id || clientId });
      }
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleSubmitCalorieLog = async (data) => {
    if (editingCalorieLog) {
      await updateCalorieLogMutation.mutateAsync({ id: editingCalorieLog.id, data });
    } else {
      await createCalorieLogMutation.mutateAsync(data);
    }
  };

  const handleSubmitProgress = async (data) => {
    if (editingProgress) {
      await updateProgressMutation.mutateAsync({ id: editingProgress.id, data });
    } else {
      await createProgressMutation.mutateAsync(data);
    }
  };

  if (!clientId) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-foreground mb-2">Chưa chọn học viên</h2>
        <p className="text-muted-foreground mb-6">Vui lòng chọn một học viên từ danh sách để xem hồ sơ và quản lý giáo án.</p>
        <button
          onClick={() => navigate(createPageUrl("Clients"))}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        >
          Quay Lại Danh Sách Học Viên
        </button>
      </div>
    );
  }

  if (clientLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Không tìm thấy thông tin học viên</h2>
        <p className="text-muted-foreground">Học viên này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Button onClick={() => navigate(createPageUrl("Clients"))} className="bg-primary text-primary-foreground font-semibold">
          Quay lại danh sách Học Viên
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border">
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div 
            onClick={() => setShowClientDetail(true)}
            className="cursor-pointer group relative"
            title="Nhấn để xem chi tiết toàn bộ hồ sơ học viên"
          >
            <Avatar className="h-16 w-16 ring-4 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-lg">
              <AvatarImage src={client.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-foreground text-2xl font-bold">
                {client.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full shadow-md text-xs group-hover:scale-110 transition-transform">
              <Eye className="w-3 h-3" />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 
                onClick={() => setShowClientDetail(true)}
                className="text-foreground text-2xl font-bold hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
                title="Nhấn để xem chi tiết toàn bộ hồ sơ học viên"
              >
                {client.full_name}
                <Eye className="w-4 h-4 text-muted-foreground hover:text-primary opacity-60" />
              </h1>
              <Badge className={statusStyles[client.status] || statusStyles.active}>
                {statusLabels[client.status] || client.status || "Đang tập"}
              </Badge>
              {client.client_code && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground font-mono">
                  {client.client_code}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-500 transition-colors">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  {client.email}
                </a>
              )}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-emerald-500 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  {client.phone}
                </a>
              )}
              {client.age && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {client.age} tuổi
                </span>
              )}
              {client.weight_kg && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {convertWeightDisplay(client.weight_kg)} {weightUnit}
                </span>
              )}
              {client.height_cm && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {convertHeightDisplay(client.height_cm)} {heightUnit}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
          <Button
            variant="outline"
            className="gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold"
            onClick={() => setShowClientDetail(true)}
          >
            <Eye className="w-4 h-4" />
            <span>Xem Chi Tiết Hồ Sơ</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-semibold"
            onClick={() => setShowProgressPdf(true)}
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Báo Cáo PDF</span>
          </Button>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-accent"
            onClick={() => setShowClientEdit(true)}
          >
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Chỉnh Sửa</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workouts" className="space-y-6">
        <TabsList className="bg-card border border-border flex flex-wrap h-auto gap-2 p-1.5 rounded-2xl">
          <TabsTrigger value="workouts" className="gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all">
            <Dumbbell className="w-4 h-4" />
            Giáo Án Tập
          </TabsTrigger>
          <TabsTrigger value="meals" className="gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all">
            <Apple className="w-4 h-4" />
            Thực Đơn Ăn
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all">
            <TrendingUp className="w-4 h-4" />
            Chỉ Số & Tiến Độ
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground transition-all">
            <FileText className="w-4 h-4" />
            Ghi Chú
          </TabsTrigger>
        </TabsList>

        {/* Workouts Tab */}
        <TabsContent value="workouts" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-foreground">Giáo Án Tập Luyện</h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => {
                  setEditingFitnessProgram(null);
                  setShowFitnessProgramForm(true);
                }}
                variant="outline" 
                className="border-[#8b5cf6]/30 text-[#a78bfa] hover:bg-[#8b5cf6]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Chương Trình
              </Button>
              <Button
                className="bg-gradient-to-r from-[#d4a017] to-[#f5c842] text-black font-bold border-none hover:opacity-90"
                onClick={() => navigate(createPageUrl("Workouts") + `?client_id=${clientId}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Trang Giáo Án
              </Button>
            </div>
          </div>

          {workouts.length > 0 || fitnessPrograms.length > 0 ?
          <div className="grid gap-4">
              {fitnessPrograms.map((prog) => (
                <Card key={prog.id} className="glass-card border-border hover:border-border transition-all">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-3 text-foreground">
                        <Dumbbell className="w-5 h-5 text-[#8b5cf6]" />
                        {prog.client_name ? `${prog.client_name}'s Program` : 'Fitness Program'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {prog.start_date && `Start: ${prog.start_date}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem
                            className="hover:bg-accent focus:bg-secondary"
                            onClick={() => {
                              setEditingFitnessProgram(prog);
                              setShowFitnessProgramForm(true);
                            }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteFitnessProgram(prog)}
                            className="text-red-400 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                      <div>
                        <span className="font-medium text-muted-foreground">Total Exercises:</span> {[prog.warmup?.filter(e=>e.name), prog.strength?.filter(e=>e.name), prog.cardio?.filter(e=>e.name)].flat().length}
                      </div>
                      {prog.weekly_tracking?.length > 0 && (
                        <div>
                          <span className="font-medium text-muted-foreground">Tracking:</span> {prog.weekly_tracking.length} weeks
                        </div>
                      )}
                    </div>
                    {prog.client_info && Object.values(prog.client_info).some(v => v) && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Program Metrics & Targets</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-card border border-border">
                          {prog.client_info.weight_lbs && <div><span className="text-muted-foreground text-xs block">Weight</span><span className="text-sm font-medium text-foreground">{convertWeightDisplay(prog.client_info.weight_lbs / 2.20462)} {weightUnit}</span></div>}
                          {prog.client_info.body_fat && <div><span className="text-muted-foreground text-xs block">Body Fat</span><span className="text-sm font-medium text-foreground">{prog.client_info.body_fat}%</span></div>}
                          {prog.client_info.bmi && <div><span className="text-muted-foreground text-xs block">BMI</span><span className="text-sm font-medium text-foreground">{prog.client_info.bmi}</span></div>}
                          {(prog.client_info.height_feet || prog.client_info.height_inches) && <div><span className="text-muted-foreground text-xs block">Height</span><span className="text-sm font-medium text-foreground">{convertHeightDisplay(((parseFloat(prog.client_info.height_feet) || 0) * 12 + (parseFloat(prog.client_info.height_inches) || 0)) * 2.54)} {heightUnit}</span></div>}
                          {prog.client_info.target_body_fat && <div><span className="text-[#d4a017]/70 text-xs block">Target Fat</span><span className="text-sm font-medium text-[#d4a017]">{prog.client_info.target_body_fat}%</span></div>}
                          {prog.client_info.target_bmi && <div><span className="text-[#d4a017]/70 text-xs block">Target BMI</span><span className="text-sm font-medium text-[#d4a017]">{prog.client_info.target_bmi}</span></div>}
                          {prog.client_info.suggestions && <div className="col-span-full mt-1"><span className="text-muted-foreground text-xs block">Suggestions</span><span className="text-sm text-muted-foreground">{prog.client_info.suggestions}</span></div>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {workouts.map((workout) =>
            <Card key={workout.id} className="glass-card border-border hover:border-amber-500/30 transition-all">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle 
                        className="flex items-center gap-3 text-foreground cursor-pointer hover:text-amber-500 transition-colors"
                        onClick={() => setDetailWorkout(workout)}
                        title="Nhấn để xem chi tiết giáo án"
                      >
                        <Dumbbell className="w-5 h-5 text-[#d4a017]" />
                        {workout.name}
                        <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                      </CardTitle>
                      {workout.description &&
                  <p className="text-sm text-muted-foreground">{workout.description}</p>
                  }
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`${statusStyles[workout.status]} cursor-pointer hover:opacity-80`}>
                            {statusLabels[workout.status] || workout.status}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'active' } })}>Đang áp dụng</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'draft' } })}>Bản nháp</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'completed' } })}>Hoàn thành</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'archived' } })}>Lưu trữ</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold gap-1.5 h-8 text-xs"
                        onClick={() => setDetailWorkout(workout)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem Chi Tiết
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold gap-1.5 h-8 text-xs"
                        onClick={() => setPdfWorkout(workout)}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Xuất PDF
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'active' } })}>
                            <Play className="w-4 h-4 mr-2" /> Đặt làm Đang áp dụng
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'draft' } })}>
                            <Clock className="w-4 h-4 mr-2" /> Chuyển về Bản nháp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateWorkoutMutation.mutate({ id: workout.id, data: { status: 'completed' } })}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Đánh dấu Hoàn thành
                          </DropdownMenuItem>
                          <DropdownMenuItem
                        className="hover:bg-accent focus:bg-secondary"
                        onClick={() => {
                          setEditingWorkout(workout);
                          setShowWorkoutForm(true);
                        }}>

                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPdfWorkout(workout)}>
                            <FileDown className="w-4 h-4 mr-2 text-amber-500" />
                            Xuất File PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                        onClick={() => setDeleteWorkout(workout)}
                        className="text-red-400 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">

                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa Giáo Án
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                      <div>
                        <span className="font-medium text-muted-foreground">Thời lượng:</span> {workout.duration_weeks} tuần
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Số buổi/tuần:</span> {workout.days_per_week}
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Số bài tập:</span> {workout.exercises?.length || 0}
                      </div>
                    </div>
                    {workout.status === 'active' && workout.exercises && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(
                          (workout.exercises || []).reduce((acc, ex) => {
                            const d = ex.day || 1;
                            if (!acc[d]) acc[d] = [];
                            acc[d].push(ex);
                            return acc;
                          }, {})
                        ).map(([day, exercises]) => (
                          <WorkoutRoutineCard
                            key={day}
                            day={Number(day)}
                            exercises={exercises}
                            clientId={clientId}
                            trainerId={user?.id}
                            isTrainer={true}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            )}
            </div> :

          <Card className="glass-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Chưa có giáo án tập nào</h3>
                <p className="text-muted-foreground mt-2">Tạo giáo án tập luyện phù hợp cho học viên này</p>
              </CardContent>
            </Card>
          }
        </TabsContent>

        {/* Meals Tab */}
        <TabsContent value="meals" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-foreground">Thực Đơn Dinh Dưỡng & Nhật Ký Calo</h2>
            <div className="flex flex-wrap gap-2">
              <AIMealPlanGenerator
                client={client}
                clients={[client]}
                onPlanGenerated={() => queryClient.invalidateQueries({ queryKey: ["meals", clientId] })}
              />
              <AIRecipeGenerator onRecipeGenerated={() => {}} />
              <Button 
                onClick={() => {
                  setEditingCalorieLog(null);
                  setShowCalorieForm(true);
                }}
                variant="outline" 
                className="border-[#d4a017]/30 text-[#d4a017] hover:bg-[#d4a017]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ghi Nhận Calo
              </Button>
              <Button
                className="bg-gradient-to-r from-[#d4a017] to-[#f5c842] text-black font-bold border-none hover:opacity-90"
                onClick={() => navigate(createPageUrl("Meals") + `?client_id=${clientId}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Trang Thực Đơn
              </Button>
            </div>
          </div>

          {meals.length > 0 || calorieLogs.length > 0 ?
          <div className="grid gap-4">
              {calorieLogs.map((log) => {
                const totalCals = log.entries?.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0) || 0;
                const totalFat = log.entries?.reduce((s, e) => s + (parseFloat(e.fat_grams) || 0), 0) || 0;
                const fatPct = totalCals > 0 ? (totalFat * 9 / totalCals * 100).toFixed(1) : 0;
                
                return (
                  <Card key={log.id} className="glass-card border-border hover:border-amber-500/30 transition-all">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1 flex-1">
                        <CardTitle 
                          className="flex items-center gap-3 text-foreground cursor-pointer hover:text-amber-500 transition-colors"
                          onClick={() => setDetailCalorieLog(log)}
                          title="Nhấn để xem chi tiết nhật ký calo"
                        >
                          <Apple className="w-5 h-5 text-[#d4a017]" />
                          {log.log_name || "Nhật Ký Calo"}
                          <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {log.week_start && `Tuần từ: ${log.week_start}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold gap-1.5 h-8 text-xs"
                          onClick={() => setDetailCalorieLog(log)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem Chi Tiết
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            <DropdownMenuItem
                              className="hover:bg-accent focus:bg-secondary"
                              onClick={() => {
                                setEditingCalorieLog(log);
                                setShowCalorieForm(true);
                              }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Chỉnh Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteCalorieLog(log)}
                              className="text-red-400 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                        <div>
                          <span className="font-medium text-foreground">Tổng Calo:</span> {Math.round(totalCals)} kcal
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Chất Béo:</span> {Math.round(totalFat)}g
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Tỷ Lệ Từ Béo:</span> <span className={Number(fatPct) > 30 ? "text-amber-400 font-semibold" : "text-emerald-400"}>{fatPct}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {meals.map((meal) =>
            <Card key={meal.id} className="glass-card border-border hover:border-emerald-500/30 transition-all">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle 
                        className="flex items-center gap-3 text-foreground cursor-pointer hover:text-emerald-500 transition-colors"
                        onClick={() => setDetailMeal(meal)}
                        title="Nhấn để xem chi tiết thực đơn"
                      >
                        <Apple className="w-5 h-5 text-[#22c55e]" />
                        {meal.name}
                        <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                      </CardTitle>
                      {meal.description &&
                  <p className="text-sm text-muted-foreground">{meal.description}</p>
                  }
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`${statusStyles[meal.status]} cursor-pointer hover:opacity-80`}>
                            {statusLabels[meal.status] || meal.status}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'active' } })}>Đang áp dụng</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'draft' } })}>Bản nháp</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'completed' } })}>Hoàn thành</DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-accent focus:bg-secondary" onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'archived' } })}>Lưu trữ</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-bold gap-1.5 h-8 text-xs"
                        onClick={() => setDetailMeal(meal)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem Chi Tiết
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-bold gap-1.5 h-8 text-xs"
                        onClick={() => setPdfMeal(meal)}
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Xuất PDF
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'active' } })}>
                            <Play className="w-4 h-4 mr-2" /> Đặt làm Đang áp dụng
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'draft' } })}>
                            <Clock className="w-4 h-4 mr-2" /> Chuyển về Bản nháp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMealMutation.mutate({ id: meal.id, data: { status: 'completed' } })}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Đánh dấu Hoàn thành
                          </DropdownMenuItem>
                          <DropdownMenuItem
                        className="hover:bg-accent focus:bg-secondary"
                        onClick={() => {
                          setEditingMeal(meal);
                          setShowMealForm(true);
                        }}>

                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPdfMeal(meal)}>
                            <FileDown className="w-4 h-4 mr-2 text-emerald-500" />
                            Xuất File PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                        onClick={() => setDeleteMeal(meal)}
                        className="text-red-400 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">

                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa Thực Đơn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                      <div>
                        <span className="font-medium text-foreground">Thời lượng:</span> {meal.duration_days} ngày
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Mục tiêu Calo:</span> {meal.calories_target} kcal
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Mục tiêu Đạm:</span> {meal.protein_target_g}g
                      </div>
                    </div>
                    
                    {meal.status === 'active' && meal.meals && (
                      <div className="mt-4 space-y-2">
                        {Object.entries(
                          (meal.meals || []).reduce((acc, m) => {
                            const d = m.day || 1;
                            if (!acc[d]) acc[d] = [];
                            acc[d].push(m);
                            return acc;
                          }, {})
                        ).map(([day, dailyMeals]) => (
                          <div key={day} className="rounded-lg overflow-hidden border border-border/40 bg-card/40">
                            <div className="px-3 py-2 text-xs font-semibold text-amber-500 bg-secondary/50">
                              Ngày {day}
                            </div>
                            <div className="divide-y divide-border/20">
                              {dailyMeals.map((m, idx) => (
                                <div key={idx} className="flex items-center gap-3 px-3 py-2">
                                  <ItemCompletionTracker
                                    clientId={clientId}
                                    trainerId={user?.id}
                                    type="meal"
                                    itemId={`D${day}-${m.name || m.meal_type}`}
                                    isTrainer={true}
                                  />
                                  <span className="text-lg">🍽️</span>
                                  <div 
                                    className="flex-1 cursor-pointer hover:opacity-85 transition-opacity"
                                    onClick={() => setDetailMeal(meal)}
                                    title="Nhấn để xem chi tiết thực đơn"
                                  >
                                    <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
                                      {m.name || m.meal_type}
                                      <Eye className="w-3 h-3 text-emerald-500 opacity-70" />
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {m.foods?.length || 0} món ăn
                                      {m.foods?.reduce((sum, f) => sum + (f.calories || 0), 0) > 0 &&
                                        ` · ${m.foods.reduce((sum, f) => sum + (f.calories || 0), 0)} cal`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            )}
            </div> :

          <Card className="glass-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Apple className="w-16 h-16 text-emerald-500/40 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Chưa có thực đơn nào</h3>
                <p className="text-muted-foreground mt-2">Tạo thực đơn dinh dưỡng để áp dụng và xuất PDF cho học viên này</p>
              </CardContent>
            </Card>
          }
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Theo Dõi Chỉ Số & Tiến Độ</h2>
            <Button
              onClick={() => {
                setEditingProgress(null);
                setShowProgressForm(true);
              }}
              className="bg-gradient-to-r from-[#d4a017] to-[#f5c842] text-black font-bold border-none hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Ghi Nhận Chỉ Số
            </Button>
          </div>

          <ProgressPhotos clientId={clientId} />

          <ProgressCharts logs={progressLogs} />

          {/* Progress Logs List */}
          {progressLogs.length > 0 &&
          <div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Lịch Sử Đo Chỉ Số</h3>
              <div className="space-y-3">
                {progressLogs.map((log) =>
              <Card key={log.id} className="glass-card border-border">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2 text-foreground">
                          <CalendarIcon className="w-4 h-4 text-[#8b5cf6]" />
                          {new Date(log.date).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem
                        className="hover:bg-accent focus:bg-secondary"
                        onClick={() => {
                          setEditingProgress(log);
                          setShowProgressForm(true);
                        }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                        onClick={() => setDeleteProgress(log)}
                        className="text-red-400 focus:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-foreground">
                        {log.weight_kg &&
                    <div>
                            <span className="text-muted-foreground">Cân nặng:</span>
                            <span className="font-medium ml-2">{convertWeightDisplay(log.weight_kg)} {weightUnit}</span>
                          </div>
                    }
                        {log.body_fat_percentage &&
                    <div>
                            <span className="text-muted-foreground">Tỷ lệ mỡ:</span>
                            <span className="font-medium ml-2">{log.body_fat_percentage}%</span>
                          </div>
                    }
                        {log.measurements?.waist &&
                    <div>
                            <span className="text-muted-foreground">Vòng eo:</span>
                            <span className="font-medium ml-2">{convertHeightDisplay(log.measurements.waist)} {heightUnit}</span>
                          </div>
                    }
                        {log.performance_metrics?.bench_press_kg &&
                    <div>
                            <span className="text-muted-foreground">Bench:</span>
                            <span className="font-medium ml-2">{convertWeightDisplay(log.performance_metrics.bench_press_kg)} {weightUnit}</span>
                          </div>
                    }
                      </div>
                      {(log.notes || log.client_feedback) &&
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                          {log.notes &&
                    <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Notes:</span> {log.notes}
                            </p>
                    }
                          {log.client_feedback &&
                    <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Client Feedback:</span> {log.client_feedback}
                            </p>
                    }
                        </div>
                  }
                    </CardContent>
                  </Card>
              )}
              </div>
            </div>
          }
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <ClientNotes clientId={clientId} trainerId={user?.id} />
        </TabsContent>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-4">
          <TrophyHabitTracker clientId={clientId} trainerId={user?.id} readOnly={false} />
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <h2 className="text-xl font-semibold">Onboarding Responses</h2>
          <OnboardingResponses onboarding={onboarding} />
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card cursor-pointer hover:border-[#8b5cf6]/50 transition-all group" onClick={() => setShowProgressChart(!showProgressChart)}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground group-hover:text-[#8b5cf6] transition-colors">
                  <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
                  Fitness Progress Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track measurements and fitness assessments over time</p>
              </CardContent>
            </Card>

            <Card className="glass-card cursor-pointer hover:border-[#d4a017]/50 transition-all group" onClick={() => setShowParQ(!showParQ)}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground group-hover:text-[#d4a017] transition-colors">
                  <FileText className="w-5 h-5 text-[#d4a017]" />
                  PAR-Q Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Physical Activity Readiness Questionnaire</p>
              </CardContent>
            </Card>

            <Card className="glass-card cursor-pointer hover:border-border/50 transition-all group" onClick={() => setShowIntake(!showIntake)}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground group-hover:text-[#22c55e] transition-colors">
                  <FileText className="w-5 h-5 text-[#22c55e]" />
                  Client Intake Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Client assessment and goal setting</p>
              </CardContent>
            </Card>

            <Card className="glass-card cursor-pointer hover:border-[#ef4444]/50 transition-all group" onClick={() => setShowMedicalRelease(!showMedicalRelease)}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground group-hover:text-[#ef4444] transition-colors">
                  <FileText className="w-5 h-5 text-[#ef4444]" />
                  Medical Release Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">For client to print and bring to physician</p>
              </CardContent>
            </Card>
          </div>

          {showProgressChart &&
          <Card className="mt-6 glass-card border-[#8b5cf6]/30">
              <CardHeader>
                <CardTitle className="text-foreground">Fitness Progress Chart Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChartForm
                clientId={clientId}
                onComplete={(data) => {
                  setShowProgressChart(false);
                  toast.success("Progress chart saved");
                }} />

              </CardContent>
            </Card>
          }

          {showParQ &&
          <Card className="mt-6 glass-card border-[#d4a017]/30">
              <CardHeader>
                <CardTitle className="text-foreground">Physical Activity Readiness Questionnaire</CardTitle>
              </CardHeader>
              <CardContent>
                <ParQForm
                clientId={clientId}
                onComplete={(data) => {
                  setShowParQ(false);
                  toast.success("PAR-Q form submitted");
                }} />

              </CardContent>
            </Card>
          }

          {showIntake &&
          <Card className="mt-6 glass-card border-border/30">
              <CardHeader>
                <CardTitle className="text-foreground">Client Intake Form</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientIntakeForm
                clientId={clientId}
                onComplete={(data) => {
                  setShowIntake(false);
                  toast.success("Intake form submitted");
                }} />

              </CardContent>
            </Card>
          }

          {showMedicalRelease &&
          <Card className="mt-6 glass-card border-[#ef4444]/30">
              <CardHeader>
                <CardTitle className="text-foreground">Medical Release Form</CardTitle>
              </CardHeader>
              <CardContent>
                <MedicalReleaseFormPrintable
                clientName={client.full_name}
                trainerName={user?.full_name} />

              </CardContent>
            </Card>
          }
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Client Documents</h2>
              <p className="text-muted-foreground text-sm mt-0.5">All contracts, signed forms, and uploaded documents</p>
            </div>
          </div>
          <ClientDocuments clientId={clientId} trainerId={user?.id} />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {client &&
      <>
          <CalorieLogForm
            open={showCalorieForm}
            onOpenChange={setShowCalorieForm}
            log={editingCalorieLog}
            clients={[client]}
            onSubmit={handleSubmitCalorieLog} 
          />

          <FitnessProgramForm
            open={showFitnessProgramForm}
            onOpenChange={setShowFitnessProgramForm}
            program={editingFitnessProgram}
            clients={[client]}
            onSubmit={handleSubmitFitnessProgram} 
          />

          <WorkoutForm
          open={showWorkoutForm}
          onOpenChange={setShowWorkoutForm}
          workout={editingWorkout}
          clients={[client]}
          onSubmit={handleSubmitWorkout} />


          <MealPlanForm
          open={showMealForm}
          onOpenChange={setShowMealForm}
          plan={editingMeal}
          clients={[client]}
          onSubmit={handleSubmitMeal} />


          <ProgressForm
          open={showProgressForm}
          onOpenChange={setShowProgressForm}
          client={client}
          log={editingProgress}
          onSubmit={handleSubmitProgress} />

          <TrainerClientOnboarding
            open={showClientEdit}
            onOpenChange={setShowClientEdit}
            client={client}
            onSubmit={async (data) => {
              await base44.entities.Client.update(client.id, data);
              queryClient.invalidateQueries({ queryKey: ["client", client.id] });
            }}
          />
        </>
      }

      {/* Delete Dialogs */}
      <AlertDialog open={!!deleteWorkout} onOpenChange={() => setDeleteWorkout(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Giáo Án Tập Luyện</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa giáo án "{deleteWorkout?.name}"? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteWorkoutMutation.mutate(deleteWorkout.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteMeal} onOpenChange={() => setDeleteMeal(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Thực Đơn Dinh Dưỡng</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa thực đơn "{deleteMeal?.name}"? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMealMutation.mutate(deleteMeal.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteFitnessProgram} onOpenChange={() => setDeleteFitnessProgram(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Chương Trình Thể Hình</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa chương trình này? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFitnessProgramMutation.mutate(deleteFitnessProgram.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteCalorieLog} onOpenChange={() => setDeleteCalorieLog(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Nhật Ký Calo</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa nhật ký calo này? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCalorieLogMutation.mutate(deleteCalorieLog.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteProgress} onOpenChange={() => setDeleteProgress(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Bản Ghi Chỉ Số</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc chắn muốn xóa bản ghi chỉ số này? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProgressMutation.mutate(deleteProgress.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Modals */}
      <WorkoutPdfModal
        open={!!pdfWorkout}
        onOpenChange={(open) => !open && setPdfWorkout(null)}
        workout={pdfWorkout}
        client={client}
      />

      <MealPlanPdfModal
        open={!!pdfMeal}
        onOpenChange={(open) => !open && setPdfMeal(null)}
        plan={pdfMeal}
        client={client}
      />

      <ProgressPdfModal
        open={showProgressPdf}
        onOpenChange={setShowProgressPdf}
        client={client}
        progressEntries={progressLogs}
      />

      {/* Detail Modals */}
      <ClientDetailModal
        client={client}
        open={showClientDetail}
        onOpenChange={setShowClientDetail}
        onEdit={() => {
          setShowClientDetail(false);
          setShowClientEdit(true);
        }}
      />

      <MealPlanDetailModal
        mealPlan={detailMeal}
        open={!!detailMeal}
        onOpenChange={(open) => !open && setDetailMeal(null)}
        onExportPdf={() => {
          setPdfMeal(detailMeal);
          setDetailMeal(null);
        }}
        onEdit={() => {
          setEditingMeal(detailMeal);
          setShowMealForm(true);
          setDetailMeal(null);
        }}
      />

      <CalorieLogDetailModal
        log={detailCalorieLog}
        open={!!detailCalorieLog}
        onOpenChange={(open) => !open && setDetailCalorieLog(null)}
        onEdit={() => {
          setEditingCalorieLog(detailCalorieLog);
          setShowCalorieForm(true);
          setDetailCalorieLog(null);
        }}
      />

      <WorkoutPlanDetailModal
        workout={detailWorkout}
        open={!!detailWorkout}
        onOpenChange={(open) => !open && setDetailWorkout(null)}
        onExportPdf={() => {
          setPdfWorkout(detailWorkout);
          setDetailWorkout(null);
        }}
        onEdit={() => {
          setEditingWorkout(detailWorkout);
          setShowWorkoutForm(true);
          setDetailWorkout(null);
        }}
      />
    </div>);

}