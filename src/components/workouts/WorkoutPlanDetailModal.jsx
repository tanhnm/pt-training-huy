import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, FileDown, Edit, Calendar, Clock, User, Flame, CheckCircle2, ChevronRight, Activity } from "lucide-react";

const difficultyStyles = {
  beginner: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  intermediate: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
};

const difficultyLabels = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao"
};

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  archived: "bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30"
};

const statusLabels = {
  active: "Đang áp dụng",
  draft: "Bản nháp",
  completed: "Hoàn thành",
  archived: "Lưu trữ"
};

export default function WorkoutPlanDetailModal({ open, onOpenChange, workout, client, onEdit, onExportPdf }) {
  if (!workout) return null;

  // Group exercises by day
  const exercisesByDay = {};
  if (workout.exercises && Array.isArray(workout.exercises)) {
    workout.exercises.forEach((ex) => {
      const d = ex.day || 1;
      if (!exercisesByDay[d]) exercisesByDay[d] = [];
      exercisesByDay[d].push(ex);
    });
  }

  // Also support workout.daily_exercises structure
  if (workout.daily_exercises && typeof workout.daily_exercises === "object") {
    Object.entries(workout.daily_exercises).forEach(([d, exList]) => {
      if (!exercisesByDay[d]) exercisesByDay[d] = [];
      if (Array.isArray(exList)) {
        exercisesByDay[d] = [...exercisesByDay[d], ...exList];
      }
    });
  }

  const daysList = Object.keys(exercisesByDay).sort((a, b) => Number(a) - Number(b));
  const totalExercises = Object.values(exercisesByDay).flat().length;
  const totalSets = Object.values(exercisesByDay).flat().reduce((sum, e) => sum + (parseInt(e.sets) || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border text-foreground p-6 bg-card shadow-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold shadow-sm">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {workout.name || "Giáo Án Tập Luyện"}
                </DialogTitle>
                <Badge className={statusStyles[workout.status] || statusStyles.active}>
                  {statusLabels[workout.status] || "Đang áp dụng"}
                </Badge>
                {workout.difficulty && (
                  <Badge className={difficultyStyles[workout.difficulty] || difficultyStyles.intermediate}>
                    {difficultyLabels[workout.difficulty] || workout.difficulty}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-sm text-muted-foreground pt-1">
                {workout.description || "Lộ trình bài tập và số hiệp được thiết kế theo tuần cho học viên."}
              </DialogDescription>
            </div>
          </div>

          {/* Quick stats tags */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            {client?.full_name && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                Học viên: <strong className="text-foreground">{client.full_name}</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Thời lượng: <strong className="text-foreground">{workout.duration_weeks || 4} tuần</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Tần suất: <strong className="text-foreground">{workout.days_per_week || daysList.length || 3} buổi / tuần</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
              <Activity className="w-3.5 h-3.5 text-purple-500" />
              Tổng: <strong className="text-foreground">{totalExercises} bài tập · {totalSets} hiệp</strong>
            </span>
          </div>
        </DialogHeader>

        {/* Days and Exercises Details */}
        <div className="space-y-4 my-2">
          <h3 className="font-bold text-foreground text-base">Danh Sách Buổi Tập & Bài Tập Chi Tiết</h3>

          {daysList.length === 0 ? (
            <div className="text-center py-8 bg-secondary/40 rounded-xl border border-border text-muted-foreground text-sm">
              Giáo án này chưa có bài tập cụ thể. Bấm "Chỉnh Sửa" để bổ sung bài tập.
            </div>
          ) : (
            <div className="space-y-4">
              {daysList.map((day) => {
                const dayExercises = exercisesByDay[day] || [];
                const daySets = dayExercises.reduce((sum, e) => sum + (parseInt(e.sets) || 0), 0);

                return (
                  <div key={day} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    {/* Day Header */}
                    <div className="px-4 py-3 bg-secondary/70 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                          B{day}
                        </span>
                        <h4 className="font-bold text-foreground text-sm">Buổi {day}</h4>
                      </div>
                      <span className="text-xs text-foreground font-semibold">
                        {dayExercises.length} bài tập · {daySets} hiệp
                      </span>
                    </div>

                    {/* Exercise List */}
                    <div className="p-4 space-y-3">
                      {dayExercises.map((ex, eIdx) => (
                        <div key={eIdx} className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-2">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                                {eIdx + 1}
                              </span>
                              <h5 className="font-bold text-foreground text-sm">{ex.name}</h5>
                              {ex.target_muscle && (
                                <Badge variant="outline" className="text-[11px] border-border text-muted-foreground">
                                  {ex.target_muscle}
                                </Badge>
                              )}
                            </div>

                            {/* Sets x Reps highlight badge */}
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-foreground font-black text-xs">
                                {ex.sets || 3} hiệp × {ex.reps || 10} reps
                              </span>
                              {ex.target_rir != null && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
                                  RIR {ex.target_rir}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Exercise Meta Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                            {ex.rest_seconds && (
                              <div className="p-1.5 rounded-md bg-card border border-border text-muted-foreground">
                                Nghỉ: <strong className="text-foreground">{ex.rest_seconds}s</strong>
                              </div>
                            )}
                            {ex.tempo && (
                              <div className="p-1.5 rounded-md bg-card border border-border text-muted-foreground">
                                Nhịp (Tempo): <strong className="text-foreground">{ex.tempo}</strong>
                              </div>
                            )}
                            {ex.equipment && (
                              <div className="p-1.5 rounded-md bg-card border border-border text-muted-foreground">
                                Dụng cụ: <strong className="text-foreground">{ex.equipment}</strong>
                              </div>
                            )}
                            {ex.weight_target && (
                              <div className="p-1.5 rounded-md bg-card border border-border text-muted-foreground">
                                Mức tạ: <strong className="text-foreground">{ex.weight_target}</strong>
                              </div>
                            )}
                          </div>

                          {ex.notes && (
                            <div className="text-xs bg-card p-2.5 rounded-lg border border-border text-foreground">
                              <strong className="text-muted-foreground">💡 Kỹ thuật / Lưu ý:</strong> {ex.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-border mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-accent font-medium"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            {onExportPdf && (
              <Button
                type="button"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5 text-xs shadow-sm"
                onClick={() => {
                  onOpenChange(false);
                  onExportPdf(workout);
                }}
              >
                <FileDown className="w-4 h-4" />
                Xuất PDF Gửi Zalo
              </Button>
            )}

            {onEdit && (
              <Button
                type="button"
                variant="outline"
                className="border-border text-foreground hover:bg-accent font-semibold gap-1.5 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(workout);
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                Chỉnh Sửa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
