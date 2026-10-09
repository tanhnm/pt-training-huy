import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, AlertCircle, Apple } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

const defaultEntry = (day = "Thứ 2") => ({ day, food: "", calories: "", fat_grams: "" });

export default function CalorieLogForm({ open, onOpenChange, log, clients = [], onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: "",
    log_name: "",
    week_start: new Date().toISOString().split("T")[0],
    entries: DAYS.map(d => defaultEntry(d)),
  });

  useEffect(() => {
    if (open) {
      if (log) {
        setFormData({
          client_id: log.client_id || (clients?.length === 1 ? clients[0].id : ""),
          log_name: log.log_name || "",
          week_start: log.week_start || new Date().toISOString().split("T")[0],
          entries: log.entries?.length ? log.entries : DAYS.map(d => defaultEntry(d)),
        });
      } else {
        const defaultClientId = clients?.length === 1 ? clients[0].id : (clients?.[0]?.id || "");
        const todayStr = new Date().toLocaleDateString('vi-VN');
        setFormData({
          client_id: defaultClientId,
          log_name: `Nhật ký calo tuần ${todayStr}`,
          week_start: new Date().toISOString().split("T")[0],
          entries: DAYS.map(d => defaultEntry(d))
        });
      }
    }
  }, [log, open, clients]);

  const updateEntry = (i, field, val) => {
    setFormData(prev => {
      const entries = [...prev.entries];
      entries[i] = { ...entries[i], [field]: val };
      // Tự động tính calo từ chất béo (fat_grams * 9)
      if (field === "fat_grams" || field === "calories") {
        const fat = parseFloat(field === "fat_grams" ? val : entries[i].fat_grams) || 0;
        entries[i].calories_from_fat = fat * 9;
        const cals = parseFloat(field === "calories" ? val : entries[i].calories) || 0;
        entries[i].fat_percentage = cals > 0 ? ((fat * 9) / cals) : 0;
      }
      return { ...prev, entries };
    });
  };

  const addEntry = () => setFormData(prev => ({ ...prev, entries: [...prev.entries, defaultEntry("Thứ 2")] }));
  const removeEntry = (i) => setFormData(prev => ({ ...prev, entries: prev.entries.filter((_, idx) => idx !== i) }));

  // Summary calculations
  const totalCalories = formData.entries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0);
  const totalFatGrams = formData.entries.reduce((s, e) => s + (parseFloat(e.fat_grams) || 0), 0);
  const totalCaloriesFromFat = totalFatGrams * 9;
  const fatPercentage = totalCalories > 0 ? (totalCaloriesFromFat / totalCalories) * 100 : 0;
  const fatWarning = fatPercentage > 30;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const targetClientId = formData.client_id || (clients?.length === 1 ? clients[0].id : (clients?.[0]?.id || ""));
      const targetLogName = formData.log_name?.trim() || `Nhật ký calo ${formData.week_start || new Date().toLocaleDateString('vi-VN')}`;

      await onSubmit({
        ...formData,
        client_id: targetClientId,
        log_name: targetLogName
      });
      toast.success(log?.id ? "Đã cập nhật nhật ký calo!" : "Đã lưu nhật ký calo thành công!");
      onOpenChange(false);
    } catch (err) {
      console.error("[CalorieLogForm] Submit error:", err);
      toast.error("Không thể lưu nhật ký calo: " + (err?.message || "Vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-border text-foreground p-6 bg-card shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4a017] to-[#f5c842] flex items-center justify-center text-black">
              <Apple className="w-5 h-5" />
            </div>
            {log?.id ? "Chỉnh Sửa Nhật Ký Calo" : "Ghi Nhận Calo & Tỷ Lệ Chất Béo"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Theo dõi năng lượng calo nạp vào hàng ngày. Khuyến nghị chất béo dưới 30% tổng calo để giữ dáng và cơ bắp tối ưu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/60 border border-border rounded-2xl">
            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-xs">Học Viên Phụ Trách</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={val => setFormData(p => ({ ...p, client_id: val }))}
              >
                <SelectTrigger className="bg-background border-border text-foreground font-medium">
                  <SelectValue placeholder="Chọn học viên..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  {clients?.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name || "Học viên"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-xs">Tên Nhật Ký / Ghi Chú Tuần</Label>
              <Input 
                value={formData.log_name} 
                onChange={e => setFormData(p => ({ ...p, log_name: e.target.value }))} 
                placeholder="Ví dụ: Calo tuần 1, Theo dõi xả cơ..." 
                className="bg-background border-border text-foreground placeholder:text-muted-foreground" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground font-semibold text-xs">Ngày Bắt Đầu Tuần</Label>
              <Input 
                type="date" 
                value={formData.week_start} 
                onChange={e => setFormData(p => ({ ...p, week_start: e.target.value }))} 
                className="bg-background border-border text-foreground" 
              />
            </div>
          </div>

          {/* Summary Panel */}
          <div className={`p-4 rounded-2xl border transition-all ${fatWarning ? "bg-red-500/10 border-red-500/30 text-foreground" : "bg-emerald-500/10 border-emerald-500/30 text-foreground"}`}>
            <h3 className="font-bold text-sm mb-3 flex items-center justify-between text-foreground">
              <span>Tổng Hợp Dinh Dưỡng</span>
              {fatWarning ? (
                <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Vượt khuyến nghị (30% calo từ béo)
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Tỷ lệ chất béo trong mức an toàn
                </span>
              )}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
                <div className="text-2xl font-black text-foreground">{Math.round(totalCalories)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Tổng Calo Tiêu Thụ (kcal)</div>
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
                <div className={`text-2xl font-black ${fatWarning ? "text-red-500 font-extrabold" : "text-emerald-600 dark:text-emerald-400 font-extrabold"}`}>
                  {fatPercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">% Calo Từ Chất Béo</div>
              </div>
            </div>
          </div>

          {/* Food Log Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base">Bảng Chi Tiết Món Ăn Trong Tuần</h3>
                <p className="text-xs text-muted-foreground">Nhập thực phẩm, năng lượng calo và số gam chất béo</p>
              </div>
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={addEntry} 
                className="gap-1 border-border text-foreground hover:bg-accent font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Món
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary/70 border-b border-border">
                  <tr>
                    <th className="text-left p-3 font-semibold text-foreground text-xs w-32">Thứ</th>
                    <th className="text-left p-3 font-semibold text-foreground text-xs">Món Ăn / Thực Phẩm</th>
                    <th className="text-left p-3 font-semibold text-foreground text-xs w-28">Calo (kcal)</th>
                    <th className="text-left p-3 font-semibold text-foreground text-xs w-28">Chất béo (g)</th>
                    <th className="text-left p-3 font-semibold text-foreground text-xs w-28">Calo từ béo</th>
                    <th className="text-left p-3 font-semibold text-foreground text-xs w-24">% Béo</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {formData.entries.map((entry, i) => (
                    <tr key={i} className="hover:bg-accent/40 transition-colors">
                      <td className="p-2">
                        <Select value={entry.day} onValueChange={val => updateEntry(i, "day", val)}>
                          <SelectTrigger className="h-8 text-xs bg-background border-border text-foreground font-medium">
                            <SelectValue placeholder="Chọn ngày" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-foreground">
                            {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input 
                          value={entry.food} 
                          onChange={e => updateEntry(i, "food", e.target.value)} 
                          className="h-8 text-sm bg-background border-border text-foreground placeholder:text-muted-foreground" 
                          placeholder="Ví dụ: Ức gà, cơm gạo lứt..." 
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number" 
                          value={entry.calories} 
                          onChange={e => updateEntry(i, "calories", e.target.value)} 
                          className="h-8 text-sm bg-background border-border text-foreground font-medium" 
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2">
                        <Input 
                          type="number" 
                          value={entry.fat_grams} 
                          onChange={e => updateEntry(i, "fat_grams", e.target.value)} 
                          className="h-8 text-sm bg-background border-border text-foreground font-medium" 
                          placeholder="0"
                        />
                      </td>
                      <td className="p-2 px-3 text-foreground font-medium text-xs">
                        {entry.calories_from_fat != null ? Math.round(entry.calories_from_fat) : "—"}
                      </td>
                      <td className="p-2 px-3 text-xs">
                        {entry.fat_percentage != null && entry.calories > 0 ? (
                          <span className={entry.fat_percentage > 0.3 ? "text-red-500 font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
                            {(entry.fat_percentage * 100).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-2 text-center">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeEntry(i)} 
                          className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="border-border text-foreground hover:bg-accent font-medium"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-gradient-to-r from-[#d4a017] to-[#f5c842] text-black font-bold border-none hover:opacity-90 shadow-md"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {log?.id ? "Cập Nhật Nhật Ký" : "Lưu Nhật Ký Calo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}