import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Activity,
  Target,
  Calendar,
  Heart,
  Sparkles,
  CheckCircle2
} from "lucide-react";

const goalTranslations = {
  weight_loss: "Giảm cân / Đốt mỡ",
  muscle_gain: "Tăng cơ / Phát triển hình thể",
  endurance: "Tăng sức bền / Thể lực",
  strength: "Tăng sức mạnh (Strength)",
  general_fitness: "Cải thiện sức khỏe chung",
  rehabilitation: "Phục hồi chức năng / Vận động"
};

const levelTranslations = {
  beginner: "Mới bắt đầu",
  intermediate: "Trung cấp",
  advanced: "Nâng cao"
};

const activityTranslations = {
  sedentary: "Ít vận động (Ngồi nhiều)",
  light: "Vận động nhẹ",
  moderate: "Vận động vừa phải",
  active: "Vận động nhiều",
  very_active: "Rất năng động / Cường độ cao"
};

export default function OnboardingResponses({ onboarding }) {
  if (!onboarding || !onboarding.questionnaire_responses) {
    return (
      <Card className="glass-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          Chưa có dữ liệu khảo sát tiếp nhận cho học viên này.
        </CardContent>
      </Card>
    );
  }

  const data = onboarding.questionnaire_responses;

  return (
    <div className="space-y-4">
      <Card className="glass-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Tóm Tắt Khảo Sát Khởi Động (Onboarding)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {onboarding.status === 'completed' ? 'Đã hoàn thành' : (onboarding.status || 'Đã tiếp nhận')}
            </Badge>
          </div>
          {onboarding.completed_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ngày hoàn thành</span>
              <span className="font-medium text-foreground">
                {new Date(onboarding.completed_date).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="glass-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <User className="w-5 h-5 text-blue-500" />
            Thông Tin Cá Nhân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.date_of_birth && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Ngày sinh:</span>
              <p className="font-medium text-foreground">{new Date(data.date_of_birth).toLocaleDateString('vi-VN')}</p>
            </div>
          )}
          {data.gender && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Giới tính:</span>
              <p className="font-medium text-foreground capitalize">
                {data.gender === 'male' ? 'Nam' : data.gender === 'female' ? 'Nữ' : data.gender}
              </p>
            </div>
          )}
          {data.height_cm && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Chiều cao:</span>
              <p className="font-medium text-foreground">{data.height_cm} cm</p>
            </div>
          )}
          {data.weight_kg && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Cân nặng ban đầu:</span>
              <p className="font-medium text-foreground">{data.weight_kg} kg</p>
            </div>
          )}
          {data.emergency_contact && (
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Liên hệ khẩn cấp:</span>
              <p className="font-medium text-foreground">{data.emergency_contact}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fitness Background */}
      <Card className="glass-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Activity className="w-5 h-5 text-emerald-500" />
            Nền Tảng Thể Lực & Sức Khỏe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.fitness_level && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Trình độ tập luyện:</span>
              <p className="font-medium text-foreground">{levelTranslations[data.fitness_level] || data.fitness_level}</p>
            </div>
          )}
          {data.activity_level && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Mức độ vận động hàng ngày:</span>
              <p className="font-medium text-foreground">{activityTranslations[data.activity_level] || data.activity_level}</p>
            </div>
          )}
          {data.medical_notes && (
            <div className="pt-1">
              <span className="text-sm text-muted-foreground block mb-1">Tiền sử y tế / Chấn thương:</span>
              <p className="font-medium text-rose-500 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{data.medical_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals & Motivation */}
      <Card className="glass-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Target className="w-5 h-5 text-purple-500" />
            Mục Tiêu & Động Lực
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.primary_goal && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Mục tiêu chính:</span>
              <p className="font-medium text-primary">{goalTranslations[data.primary_goal] || data.primary_goal}</p>
            </div>
          )}
          {data.target_weight_kg && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Cân nặng mục tiêu:</span>
              <p className="font-medium text-foreground">{data.target_weight_kg} kg</p>
            </div>
          )}
          {data.goals && (
            <div className="pt-1">
              <span className="text-sm text-muted-foreground block mb-1">Mục tiêu chi tiết:</span>
              <p className="font-medium text-foreground bg-secondary/50 p-3 rounded-lg border border-border">{data.goals}</p>
            </div>
          )}
          {data.motivation && (
            <div className="pt-1">
              <span className="text-sm text-muted-foreground block mb-1">Động lực tập luyện:</span>
              <p className="font-medium text-foreground bg-secondary/50 p-3 rounded-lg border border-border">{data.motivation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lifestyle & Availability */}
      <Card className="glass-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Calendar className="w-5 h-5 text-amber-500" />
            Lối Sống & Lịch Sinh Hoạt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.workout_days_per_week && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Số buổi tập/tuần:</span>
              <p className="font-medium text-foreground">{data.workout_days_per_week} buổi</p>
            </div>
          )}
          {data.preferred_workout_time && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Khung giờ tập yêu thích:</span>
              <p className="font-medium text-foreground">{data.preferred_workout_time}</p>
            </div>
          )}
          {data.sleep_hours && (
            <div className="flex justify-between items-center py-1 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Thời gian ngủ trung bình:</span>
              <p className="font-medium text-foreground">{data.sleep_hours} giờ/đêm</p>
            </div>
          )}
          {data.stress_level && (
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Mức độ áp lực / Stress:</span>
              <p className="font-medium text-foreground capitalize">{data.stress_level}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}