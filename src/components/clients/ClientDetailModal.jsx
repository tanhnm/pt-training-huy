import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Ruler, 
  Weight, 
  Target, 
  HeartPulse, 
  FileText, 
  Edit, 
  FileDown, 
  Dumbbell, 
  Apple, 
  Activity, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
};

const statusLabels = {
  active: "Đang tập",
  inactive: "Hoàn thành",
  paused: "Tạm dừng",
  completed: "Đã hoàn thành"
};

export default function ClientDetailModal({ 
  open, 
  onOpenChange, 
  client, 
  onEdit, 
  onExportPdf, 
  onViewWorkouts, 
  onViewMeals 
}) {
  if (!client) return null;

  // Calculate BMI
  const heightM = client.height_cm ? client.height_cm / 100 : (client.height ? client.height / 100 : null);
  const weightVal = client.weight_kg || client.weight;
  let bmi = null;
  let bmiCategory = "";
  let bmiColor = "";

  if (heightM && weightVal) {
    bmi = (weightVal / (heightM * heightM)).toFixed(1);
    const numBmi = parseFloat(bmi);
    if (numBmi < 18.5) {
      bmiCategory = "Gầy / Thiếu cân";
      bmiColor = "text-amber-500";
    } else if (numBmi < 24.9) {
      bmiCategory = "Cân đối / Bình thường";
      bmiColor = "text-emerald-600 dark:text-emerald-400";
    } else if (numBmi < 29.9) {
      bmiCategory = "Thừa cân nhẹ";
      bmiColor = "text-orange-500";
    } else {
      bmiCategory = "Nguy cơ béo phì";
      bmiColor = "text-red-500";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-border text-foreground p-6 bg-card shadow-2xl">
        <DialogHeader className="pb-4 border-b border-border space-y-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-emerald-500/20 shadow-lg">
              <AvatarImage src={client.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-foreground text-2xl font-black">
                {client.full_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {client.full_name}
                </DialogTitle>
                <Badge className={statusStyles[client.status] || statusStyles.active}>
                  {statusLabels[client.status] || "Đang tập"}
                </Badge>
                {client.custom_id && (
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground font-mono">
                    ID: {client.custom_id}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-foreground">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <span>{client.email}</span>
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>{client.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Biometrics & Physical Stats */}
        <div className="space-y-4 my-2">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Chỉ Số Thể Lực & Thể Trạng
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-secondary/60 border border-border">
              <span className="text-xs text-muted-foreground block">Tuổi</span>
              <span className="text-xl font-black text-foreground">
                {client.age ? `${client.age} tuổi` : client.date_of_birth ? `${new Date().getFullYear() - new Date(client.date_of_birth).getFullYear()} tuổi` : "—"}
              </span>
              <span className="text-[11px] text-muted-foreground block capitalize">
                {client.gender === "male" ? "Nam" : client.gender === "female" ? "Nữ" : client.gender || "—"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/60 border border-border">
              <span className="text-xs text-muted-foreground block">Chiều Cao</span>
              <span className="text-xl font-black text-foreground">
                {client.height_cm || client.height || "—"} <span className="text-xs font-normal">cm</span>
              </span>
              <span className="text-[11px] text-muted-foreground block">Chuẩn thước đo</span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/60 border border-border">
              <span className="text-xs text-muted-foreground block">Cân Nặng</span>
              <span className="text-xl font-black text-foreground">
                {client.weight_kg || client.weight || "—"} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[11px] text-muted-foreground block">Hiện tại</span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/60 border border-border">
              <span className="text-xs text-muted-foreground block">Chỉ Số BMI</span>
              <span className="text-xl font-black text-foreground">{bmi || "—"}</span>
              <span className={`text-[11px] font-semibold block ${bmiColor || "text-muted-foreground"}`}>
                {bmiCategory || "Chưa đủ dữ liệu"}
              </span>
            </div>
          </div>

          {/* Measurements if any */}
          {client.measurements && Object.values(client.measurements).some(Boolean) && (
            <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
              <span className="text-xs font-semibold text-foreground block">Số Đo Các Vòng (cm)</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                {client.measurements.chest && <div className="p-2 rounded-lg bg-card border border-border">Ngực: <strong>{client.measurements.chest}cm</strong></div>}
                {client.measurements.waist && <div className="p-2 rounded-lg bg-card border border-border">Eo: <strong>{client.measurements.waist}cm</strong></div>}
                {client.measurements.hips && <div className="p-2 rounded-lg bg-card border border-border">Mông: <strong>{client.measurements.hips}cm</strong></div>}
                {client.measurements.biceps_left && <div className="p-2 rounded-lg bg-card border border-border">Tay trái: <strong>{client.measurements.biceps_left}cm</strong></div>}
                {client.measurements.biceps_right && <div className="p-2 rounded-lg bg-card border border-border">Tay phải: <strong>{client.measurements.biceps_right}cm</strong></div>}
                {client.measurements.thigh_left && <div className="p-2 rounded-lg bg-card border border-border">Đùi trái: <strong>{client.measurements.thigh_left}cm</strong></div>}
                {client.measurements.thigh_right && <div className="p-2 rounded-lg bg-card border border-border">Đùi phải: <strong>{client.measurements.thigh_right}cm</strong></div>}
              </div>
            </div>
          )}
        </div>

        {/* Goals & Background */}
        <div className="space-y-3 pt-2 border-t border-border">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Mục Tiêu & Lộ Trình Huấn Luyện
          </h3>

          <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2">
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Mục Tiêu Chính:</span>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {client.fitness_goal || client.goals || "Chưa thiết lập mục tiêu cụ thể"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              {client.fitness_level && (
                <div>
                  <span className="text-muted-foreground">Trình độ tập:</span>
                  <span className="font-bold text-foreground ml-2 capitalize">
                    {client.fitness_level === "beginner" ? "Người mới bắt đầu" : client.fitness_level === "advanced" ? "Nâng cao" : "Trung cấp"}
                  </span>
                </div>
              )}
              {client.activity_level && (
                <div>
                  <span className="text-muted-foreground">Mức độ vận động:</span>
                  <span className="font-bold text-foreground ml-2 capitalize">
                    {client.activity_level.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Health & Medical Notes */}
        <div className="space-y-3 pt-2 border-t border-border">
          <h3 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-500" />
            Sức Khỏe & Ghi Chú Đặc Biệt
          </h3>

          <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-3 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Tiền Sử Bệnh Lý / Chấn Thương:</span>
              <p className="text-foreground font-medium mt-0.5">
                {client.medical_conditions || client.medical_notes || "Không có tiền sử bệnh lý hoặc chấn thương ghi nhận."}
              </p>
            </div>

            {client.notes && (
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Ghi Chú Của Huấn Luyện Viên:</span>
                <p className="text-foreground font-medium mt-0.5 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </div>
            )}

            {client.emergency_contact && (
              <div>
                <span className="text-xs text-muted-foreground font-semibold">Liên Hệ Khẩn Cấp:</span>
                <p className="text-foreground font-medium mt-0.5">
                  {client.emergency_contact}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-border mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-accent font-medium"
          >
            Đóng
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {onViewWorkouts && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 text-xs font-semibold border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                onClick={() => {
                  onOpenChange(false);
                  onViewWorkouts(client);
                }}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                Giáo Án Tập
              </Button>
            )}

            {onViewMeals && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 text-xs font-semibold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                onClick={() => {
                  onOpenChange(false);
                  onViewMeals(client);
                }}
              >
                <Apple className="w-3.5 h-3.5" />
                Thực Đơn Ăn
              </Button>
            )}

            {onExportPdf && (
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 text-xs font-semibold border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                onClick={() => {
                  onOpenChange(false);
                  onExportPdf(client);
                }}
              >
                <FileDown className="w-3.5 h-3.5" />
                Xuất Báo Cáo PDF
              </Button>
            )}

            {onEdit && (
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs shadow-sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(client);
                }}
              >
                <Edit className="w-3.5 h-3.5" />
                Chỉnh Sửa Hồ Sơ
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
