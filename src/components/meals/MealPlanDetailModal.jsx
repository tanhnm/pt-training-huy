import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, FileDown, Edit, Calendar, Clock, User, Flame, CheckCircle2, ChevronRight, X } from "lucide-react";

const MEAL_TYPE_LABELS = {
  breakfast: "Bữa Sáng",
  lunch: "Bữa Trưa",
  dinner: "Bữa Tối",
  snack: "Bữa Phụ"
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

export default function MealPlanDetailModal({ open, onOpenChange, plan: rawPlan, mealPlan, client, onEdit, onExportPdf }) {
  const plan = rawPlan || mealPlan;
  if (!plan) return null;

  // Group meals by day
  const mealsByDay = {};
  if (plan.meals && Array.isArray(plan.meals)) {
    plan.meals.forEach((m) => {
      const d = m.day || 1;
      if (!mealsByDay[d]) mealsByDay[d] = [];
      mealsByDay[d].push(m);
    });
  }

  // Also support plan.daily_meals object structure if present
  if (plan.daily_meals && typeof plan.daily_meals === "object") {
    Object.entries(plan.daily_meals).forEach(([day, mealTypes]) => {
      if (!mealsByDay[day]) mealsByDay[day] = [];
      Object.entries(mealTypes).forEach(([type, mData]) => {
        mealsByDay[day].push({
          meal_type: type,
          name: mData.name || MEAL_TYPE_LABELS[type] || type,
          foods: mData.foods || [],
          instructions: mData.instructions || ""
        });
      });
    });
  }

  const daysList = Object.keys(mealsByDay).sort((a, b) => Number(a) - Number(b));

  // Calculate total macros kcal
  const pGrams = plan.protein_target_g || 0;
  const cGrams = plan.carbs_target_g || 0;
  const fGrams = plan.fat_target_g || 0;
  const pKcal = pGrams * 4;
  const cKcal = cGrams * 4;
  const fKcal = fGrams * 9;
  const totalMacroKcal = pKcal + cKcal + fKcal || 1;
  const pPct = Math.round((pKcal / totalMacroKcal) * 100);
  const cPct = Math.round((cKcal / totalMacroKcal) * 100);
  const fPct = Math.round((fKcal / totalMacroKcal) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border text-foreground p-6 bg-card shadow-2xl">
        <DialogHeader className="space-y-2 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                  <Apple className="w-5 h-5" />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {plan.name || "Thực Đơn Dinh Dưỡng"}
                </DialogTitle>
                <Badge className={statusStyles[plan.status] || statusStyles.active}>
                  {statusLabels[plan.status] || "Đang áp dụng"}
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground pt-1">
                {plan.description || "Kế hoạch phân bổ bữa ăn và dinh dưỡng đa lượng hàng ngày dành cho học viên."}
              </DialogDescription>
            </div>
          </div>

          {/* Quick Info Tags */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            {client?.full_name && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                Học viên: <strong className="text-foreground">{client.full_name}</strong>
              </span>
            )}
            {plan.duration_days && (
              <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                Thời lượng: <strong className="text-foreground">{plan.duration_days} ngày</strong>
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border text-foreground font-medium">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Tổng bữa: <strong className="text-foreground">{plan.meals?.length || daysList.length || 0} bữa</strong>
            </span>
          </div>
        </DialogHeader>

        {/* Macro Targets Card */}
        <div className="my-4 p-4 rounded-2xl bg-secondary/60 border border-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Mục Tiêu Năng Lượng & Macros Hàng Ngày
            </h3>
            {plan.calories_target && (
              <span className="text-sm font-bold text-foreground bg-background px-3 py-1 rounded-lg border border-border">
                {plan.calories_target} kcal/ngày
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-xs text-muted-foreground font-medium">Mục Tiêu Calo</div>
              <div className="text-2xl font-black text-foreground mt-0.5">{plan.calories_target || 0}</div>
              <div className="text-[11px] text-muted-foreground">kcal / ngày</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-xs text-blue-500 font-semibold">Đạm (Protein)</div>
              <div className="text-2xl font-black text-foreground mt-0.5">{pGrams}g</div>
              <div className="text-[11px] text-muted-foreground">{pPct}% calo</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-xs text-amber-500 font-semibold">Tinh Bột (Carbs)</div>
              <div className="text-2xl font-black text-foreground mt-0.5">{cGrams}g</div>
              <div className="text-[11px] text-muted-foreground">{cPct}% calo</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
              <div className="text-xs text-red-500 font-semibold">Chất Béo (Fat)</div>
              <div className="text-2xl font-black text-foreground mt-0.5">{fGrams}g</div>
              <div className="text-[11px] text-muted-foreground">{fPct}% calo</div>
            </div>
          </div>

          {/* Macro Visual Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Tỷ lệ phân bổ năng lượng</span>
              <span>Đạm: {pPct}% · Carb: {cPct}% · Béo: {fPct}%</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-secondary border border-border">
              <div style={{ width: `${pPct}%` }} className="bg-blue-500 h-full" title={`Protein: ${pPct}%`} />
              <div style={{ width: `${cPct}%` }} className="bg-amber-500 h-full" title={`Carbs: ${cPct}%`} />
              <div style={{ width: `${fPct}%` }} className="bg-red-500 h-full" title={`Fat: ${fPct}%`} />
            </div>
          </div>
        </div>

        {/* Days & Meals Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-foreground text-base">Chi Tiết Từng Ngày & Bữa Ăn</h3>

          {daysList.length === 0 ? (
            <div className="text-center py-8 bg-secondary/40 rounded-xl border border-border text-muted-foreground text-sm">
              Thực đơn này chưa có danh sách món ăn cụ thể. Bấm "Chỉnh Sửa" để bổ sung món ăn theo ngày.
            </div>
          ) : (
            <div className="space-y-4">
              {daysList.map((day) => {
                const dayMeals = mealsByDay[day] || [];
                const dayTotalCals = dayMeals.reduce((acc, m) => {
                  return acc + (m.foods?.reduce((sum, f) => sum + (parseFloat(f.calories) || 0), 0) || 0);
                }, 0);

                return (
                  <div key={day} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    {/* Day Header */}
                    <div className="px-4 py-3 bg-secondary/70 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                          N{day}
                        </span>
                        <h4 className="font-bold text-foreground text-sm">Ngày {day}</h4>
                      </div>
                      <span className="text-xs text-foreground font-semibold">
                        {dayMeals.length} bữa ăn {dayTotalCals > 0 && `· ~${Math.round(dayTotalCals)} kcal`}
                      </span>
                    </div>

                    {/* Meal Slots */}
                    <div className="p-4 space-y-3">
                      {dayMeals.map((m, mIdx) => (
                        <div key={mIdx} className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🍽️</span>
                              <span className="font-bold text-foreground text-sm">
                                {m.name || MEAL_TYPE_LABELS[m.meal_type] || m.meal_type || `Bữa ${mIdx + 1}`}
                              </span>
                              {m.meal_type && (
                                <Badge variant="outline" className="text-[11px] border-border text-muted-foreground">
                                  {MEAL_TYPE_LABELS[m.meal_type] || m.meal_type}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              {m.foods?.length || 0} món
                            </span>
                          </div>

                          {/* Foods Table / List */}
                          {m.foods && m.foods.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                              <table className="w-full text-xs">
                                <thead className="bg-secondary/70 border-b border-border">
                                  <tr>
                                    <th className="text-left p-2 font-semibold text-foreground">Tên Món Ăn</th>
                                    <th className="text-center p-2 font-semibold text-foreground w-20">Định lượng</th>
                                    <th className="text-center p-2 font-semibold text-foreground w-20">Calo</th>
                                    <th className="text-center p-2 font-semibold text-foreground w-16">Đạm</th>
                                    <th className="text-center p-2 font-semibold text-foreground w-16">Carb</th>
                                    <th className="text-center p-2 font-semibold text-foreground w-16">Béo</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {m.foods.map((food, fIdx) => (
                                    <tr key={fIdx} className="hover:bg-accent/40">
                                      <td className="p-2 font-medium text-foreground">{food.name}</td>
                                      <td className="p-2 text-center text-muted-foreground font-medium">
                                        {food.amount ? `${food.amount} ${food.unit || "g"}` : "—"}
                                      </td>
                                      <td className="p-2 text-center font-bold text-foreground">
                                        {food.calories != null ? `${food.calories}` : "—"}
                                      </td>
                                      <td className="p-2 text-center text-blue-500 font-medium">
                                        {food.protein != null ? `${food.protein}g` : "—"}
                                      </td>
                                      <td className="p-2 text-center text-amber-500 font-medium">
                                        {food.carbs != null ? `${food.carbs}g` : "—"}
                                      </td>
                                      <td className="p-2 text-center text-red-500 font-medium">
                                        {food.fat != null ? `${food.fat}g` : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic pl-6">Chưa có danh sách món cụ thể cho bữa này.</p>
                          )}

                          {m.instructions && (
                            <div className="text-xs bg-card p-2.5 rounded-lg border border-border text-foreground">
                              <strong className="text-muted-foreground">💡 Lưu ý / Chế biến:</strong> {m.instructions}
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
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-border mt-6">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-sm"
                onClick={() => {
                  onOpenChange(false);
                  onExportPdf(plan);
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
                className="border-[#d4a017]/40 text-[#d4a017] hover:bg-[#d4a017]/10 font-bold gap-1.5"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(plan);
                }}
              >
                <Edit className="w-4 h-4" />
                Chỉnh Sửa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
