import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Edit, Calendar, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CalorieLogDetailModal({ open, onOpenChange, log, client, onEdit }) {
  if (!log) return null;

  const entries = log.entries || [];
  const totalCalories = entries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0);
  const totalFatGrams = entries.reduce((s, e) => s + (parseFloat(e.fat_grams) || 0), 0);
  const totalCaloriesFromFat = totalFatGrams * 9;
  const fatPercentage = totalCalories > 0 ? (totalCaloriesFromFat / totalCalories) * 100 : 0;
  const fatWarning = fatPercentage > 30;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-border text-foreground p-6 bg-card shadow-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4a017] to-[#f5c842] flex items-center justify-center text-black shadow-sm">
              <Apple className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {log.log_name || "Nhật Ký Calo"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Bảng theo dõi calo tiêu thụ và tỷ lệ chất béo từng ngày của học viên.
          </DialogDescription>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {client?.full_name && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                Học viên: <strong className="text-foreground">{client.full_name}</strong>
              </span>
            )}
            {log.week_start && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Tuần bắt đầu: <strong className="text-foreground">{log.week_start}</strong>
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Nutrition Summary Stats */}
        <div className={`my-4 p-4 rounded-2xl border transition-all ${fatWarning ? "bg-red-500/10 border-red-500/30 text-foreground" : "bg-emerald-500/10 border-emerald-500/30 text-foreground"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-foreground">Tổng Hợp Dinh Dưỡng</h3>
            {fatWarning ? (
              <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Vượt ngưỡng khuyến nghị (30% calo từ béo)
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Tỷ lệ chất béo trong mức an toàn
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-black text-foreground">{Math.round(totalCalories)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Tổng Calo Nạp (kcal)</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-black text-foreground">{Math.round(totalFatGrams)}g</div>
              <div className="text-xs text-muted-foreground mt-0.5">Lượng Chất Béo (g)</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-2xl font-black text-foreground">{Math.round(totalCaloriesFromFat)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Calo Từ Chất Béo</div>
            </div>
            <div className={`rounded-xl p-3 shadow-sm border ${fatWarning ? "bg-red-500/20 border-red-500/40" : "bg-card border-border"}`}>
              <div className={`text-2xl font-black ${fatWarning ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                {fatPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">% Calo Từ Chất Béo</div>
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-foreground text-base">Danh Sách Món Ăn Trong Tuần</h3>

          {entries.length === 0 ? (
            <div className="text-center py-6 bg-secondary/50 rounded-xl border border-border text-muted-foreground text-sm">
              Chưa có món ăn nào trong nhật ký này.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary/70 border-b border-border">
                  <tr>
                    <th className="text-left p-3 font-semibold text-foreground text-xs w-28">Thứ</th>
                    <th className="text-left p-3 font-semibold text-foreground text-xs">Món Ăn / Thực Phẩm</th>
                    <th className="text-center p-3 font-semibold text-foreground text-xs w-28">Calo (kcal)</th>
                    <th className="text-center p-3 font-semibold text-foreground text-xs w-28">Chất béo (g)</th>
                    <th className="text-center p-3 font-semibold text-foreground text-xs w-28">Calo từ béo</th>
                    <th className="text-center p-3 font-semibold text-foreground text-xs w-24">% Béo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-accent/40 transition-colors">
                      <td className="p-3 font-semibold text-foreground text-xs">{entry.day || "—"}</td>
                      <td className="p-3 font-medium text-foreground">{entry.food || "—"}</td>
                      <td className="p-3 text-center font-bold text-foreground">{entry.calories || 0}</td>
                      <td className="p-3 text-center text-foreground font-medium">{entry.fat_grams || 0}g</td>
                      <td className="p-3 text-center text-foreground font-medium">
                        {entry.calories_from_fat != null ? Math.round(entry.calories_from_fat) : "—"}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {entry.fat_percentage != null && entry.calories > 0 ? (
                          <span className={entry.fat_percentage > 0.3 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}>
                            {(entry.fat_percentage * 100).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-accent font-medium"
          >
            Đóng
          </Button>

          {onEdit && (
            <Button
              type="button"
              className="bg-gradient-to-r from-[#d4a017] to-[#f5c842] text-black font-bold border-none hover:opacity-90 gap-1.5 shadow-sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(log);
              }}
            >
              <Edit className="w-4 h-4" />
              Chỉnh Sửa Nhật Ký
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
