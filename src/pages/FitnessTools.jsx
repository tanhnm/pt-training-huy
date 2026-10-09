import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Dumbbell, Apple, MoreVertical, Edit, Trash2, Users, Calendar, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import FitnessProgramForm from "@/components/fitness/FitnessProgramForm";
import CalorieLogForm from "@/components/fitness/CalorieLogForm";
import CalorieLogDetailModal from "@/components/fitness/CalorieLogDetailModal";

function TrainerNoteField({ log, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(log.trainer_notes || "");
  if (!isEditing) {
    return (
      <div className="mt-4 p-3 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors" onClick={() => setIsEditing(true)}>
        <p className="text-xs font-semibold text-muted-foreground mb-1">Ghi Chú Của HLV</p>
        <p className="text-sm text-foreground">{log.trainer_notes || "Bấm để thêm dặn dò, lưu ý..."}</p>
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-2">
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nhập ghi chú cho học viên..." className="bg-secondary text-sm border-border text-foreground" />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
        <Button size="sm" onClick={() => { onSave(notes); setIsEditing(false); }} className="bg-primary text-primary-foreground">Lưu</Button>
      </div>
    </div>
  );
}

export default function FitnessTools() {
  const [user, setUser] = useState(null);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showCalorieForm, setShowCalorieForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [deletingProgram, setDeletingProgram] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null);
  const [detailCalorieLog, setDetailCalorieLog] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: programs = [] } = useQuery({
    queryKey: ["fitnessPrograms", user?.id],
    queryFn: () => base44.entities.FitnessProgram.filter({ trainer_id: user.id }, "-created_date"),
    enabled: !!user
  });

  const { data: calorieLogs = [] } = useQuery({
    queryKey: ["calorieLogs", user?.id],
    queryFn: () => base44.entities.CalorieLog.filter({ trainer_id: user.id }, "-created_date"),
    enabled: !!user
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list()
  });

  const createProgram = useMutation({
    mutationFn: async (data) => {
      let clientUserId = data.client_id;
      if (data.client_id) {
        const client = clients.find((c) => c.id === data.client_id);
        if (client?.user_id) clientUserId = client.user_id;
      }
      return base44.entities.FitnessProgram.create({ ...data, trainer_id: user.id, client_user_id: clientUserId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitnessPrograms"] });
      setShowProgramForm(false);
      setEditingProgram(null);
    }
  });

  const updateProgram = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FitnessProgram.update(id, { ...data, trainer_id: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitnessPrograms"] });
      setShowProgramForm(false);
      setEditingProgram(null);
    }
  });

  const deleteProgram = useMutation({
    mutationFn: (id) => base44.entities.FitnessProgram.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitnessPrograms"] });
      setDeletingProgram(null);
    }
  });

  const createLog = useMutation({
    mutationFn: (data) => base44.entities.CalorieLog.create({ ...data, trainer_id: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calorieLogs"] });
      setShowCalorieForm(false);
      setEditingLog(null);
    }
  });

  const updateLog = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CalorieLog.update(id, { ...data, trainer_id: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calorieLogs"] });
      setShowCalorieForm(false);
      setEditingLog(null);
    }
  });

  const deleteLog = useMutation({
    mutationFn: (id) => base44.entities.CalorieLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calorieLogs"] });
      setDeletingLog(null);
    }
  });

  const handleSubmitProgram = async (data) => {
    if (editingProgram?.id) {
      await updateProgram.mutateAsync({ id: editingProgram.id, data });
    } else {
      await createProgram.mutateAsync(data);
    }
    
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
         queryClient.invalidateQueries({ queryKey: ["clients"] });
      }
    }
  };

  const handleSubmitLog = async (data) => {
    if (editingLog?.id) await updateLog.mutateAsync({ id: editingLog.id, data });
    else await createLog.mutateAsync(data);
  };

  const getClientName = (id) => clients.find((c) => c.id === id)?.full_name || "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">Công Cụ Thể Hình</h1>
        <p className="text-muted-foreground mt-1">Quản lý chương trình thể hình chuyên sâu & nhật ký calo dinh dưỡng</p>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="programs" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Dumbbell className="w-4 h-4" /> Chương Trình Tập Luyện
          </TabsTrigger>
          <TabsTrigger value="calories" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Apple className="w-4 h-4" /> Nhật Ký Calo
          </TabsTrigger>
        </TabsList>

        {/* Training Programs */}
        <TabsContent value="programs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Danh Sách Chương Trình</h2>
            <Button onClick={() => { setEditingProgram(null); setShowProgramForm(true); }} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Thêm Chương Trình
            </Button>
          </div>
          {programs.length === 0 ? (
            <Card className="glass-card border-border">
              <CardContent className="flex flex-col items-center py-12">
                <Dumbbell className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có chương trình nào</h3>
                <p className="text-muted-foreground text-center mb-4">Tạo chương trình thể hình với lịch tập và theo dõi tuần.</p>
                <Button onClick={() => { setEditingProgram(null); setShowProgramForm(true); }} variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Tạo Chương Trình Đầu Tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((prog) => (
                <Card key={prog.id} className="hover:shadow-lg transition-all glass-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-foreground">{prog.client_name || "Chương Trình Thể Hình"}</CardTitle>
                        <CardDescription className="text-muted-foreground">{prog.trainer_name && `HLV: ${prog.trainer_name}`}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem onClick={() => { setEditingProgram(prog); setShowProgramForm(true); }}>
                            <Edit className="w-4 h-4 mr-2" /> Chỉnh Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingProgram(prog)} className="text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {prog.client_id && (
                      <div className="flex items-center gap-1.5 text-foreground"><Users className="w-3.5 h-3.5 text-primary" /> {getClientName(prog.client_id)}</div>
                    )}
                    {prog.start_date && (
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Bắt đầu: {prog.start_date}</div>
                    )}
                    {prog.weekly_tracking?.length > 0 && (
                      <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                        {prog.weekly_tracking.length} tuần đã theo dõi
                      </Badge>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {[prog.warmup?.filter((e) => e.name), prog.strength?.filter((e) => e.name), prog.cardio?.filter((e) => e.name)].flat().length} bài tập đã lên kế hoạch
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calorie Logs */}
        <TabsContent value="calories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Danh Sách Nhật Ký Calo</h2>
            <Button onClick={() => { setEditingLog(null); setShowCalorieForm(true); }} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold">
              <Plus className="w-4 h-4 mr-2" /> Ghi Nhận Calo Mới
            </Button>
          </div>
          {calorieLogs.length === 0 ? (
            <Card className="glass-card border-border">
              <CardContent className="flex flex-col items-center py-12">
                <Apple className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có nhật ký calo nào</h3>
                <p className="text-muted-foreground text-center mb-4">Ghi nhận lượng thức ăn hàng ngày, tính toán calo và tỷ lệ chất béo.</p>
                <Button onClick={() => { setEditingLog(null); setShowCalorieForm(true); }} variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Tạo Nhật Ký Đầu Tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calorieLogs.map((log) => {
                const totalCals = log.entries?.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0) || 0;
                const totalFat = log.entries?.reduce((s, e) => s + (parseFloat(e.fat_grams) || 0), 0) || 0;
                const fatPct = totalCals > 0 ? (totalFat * 9 / totalCals * 100).toFixed(1) : 0;
                const isOver = fatPct > 30;

                return (
                  <Card key={log.id} className="hover:shadow-lg transition-all glass-card border-border hover:border-amber-500/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle 
                            className="text-base text-foreground cursor-pointer hover:text-amber-500 transition-colors flex items-center gap-1.5"
                            onClick={() => setDetailCalorieLog(log)}
                          >
                            {log.log_name || "Nhật Ký Calo"}
                            <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            {log.week_start && `Tuần từ ${log.week_start}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold"
                            onClick={() => setDetailCalorieLog(log)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Chi Tiết
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                              <DropdownMenuItem onClick={() => { setEditingLog(log); setShowCalorieForm(true); }}>
                                <Edit className="w-4 h-4 mr-2" /> Chỉnh Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingLog(log)} className="text-red-500">
                                <Trash2 className="w-4 h-4 mr-2" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {log.client_id && (
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Users className="w-3.5 h-3.5 text-primary" /> {getClientName(log.client_id)}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-center mt-2">
                        <div className="bg-secondary/60 border border-border rounded-lg p-2.5">
                          <div className="font-bold text-foreground text-base">{Math.round(totalCals)}</div>
                          <div className="text-xs text-muted-foreground">Tổng Calories</div>
                        </div>
                        <div className={`rounded-lg p-2.5 border border-border ${isOver ? "bg-red-500/15" : "bg-emerald-500/15"}`}>
                          <div className={`font-bold text-base ${isOver ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{fatPct}%</div>
                          <div className="text-xs text-muted-foreground">Calo Từ Béo</div>
                        </div>
                      </div>
                      {log.entries?.length > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
                          <span>{log.entries.length} món ăn đã ghi nhận</span>
                          <span className="text-foreground font-medium">{Math.round(totalFat)}g chất béo</span>
                        </div>
                      )}
                      {/* Trainer notes */}
                      <TrainerNoteField log={log} onSave={(notes) => updateLog.mutateAsync({ id: log.id, data: { trainer_notes: notes } })} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FitnessProgramForm
        open={showProgramForm}
        onOpenChange={setShowProgramForm}
        program={editingProgram}
        clients={clients}
        onSubmit={handleSubmitProgram}
      />

      <CalorieLogForm
        open={showCalorieForm}
        onOpenChange={setShowCalorieForm}
        log={editingLog}
        clients={clients}
        onSubmit={handleSubmitLog}
      />

      <CalorieLogDetailModal
        log={detailCalorieLog}
        open={!!detailCalorieLog}
        onOpenChange={(open) => !open && setDetailCalorieLog(null)}
        onEdit={() => {
          setEditingLog(detailCalorieLog);
          setShowCalorieForm(true);
          setDetailCalorieLog(null);
        }}
      />

      <AlertDialog open={!!deletingProgram} onOpenChange={() => setDeletingProgram(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Chương Trình</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc muốn xóa chương trình "{deletingProgram?.client_name}"? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteProgram.mutate(deletingProgram.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingLog} onOpenChange={() => setDeletingLog(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa Nhật Ký Calo</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Bạn có chắc muốn xóa nhật ký "{deletingLog?.log_name}"? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteLog.mutate(deletingLog.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}