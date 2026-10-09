import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Apple, Utensils, FileText, Loader2, HeartPulse } from "lucide-react";
import { storageEngine } from "@/lib/storageEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function MealPlanPdfModal({ open, onOpenChange, plan, client }) {
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const coach = storageEngine.getCoachProfile();

  if (!plan) return null;

  // Normalize meals structure
  let dailyMeals = {};
  if (plan.daily_meals && Object.keys(plan.daily_meals).length > 0) {
    dailyMeals = plan.daily_meals;
  } else if (Array.isArray(plan.meals)) {
    plan.meals.forEach((m) => {
      const day = m.day || 1;
      const type = m.meal_type || "lunch";
      if (!dailyMeals[day]) dailyMeals[day] = {};
      if (!dailyMeals[day][type]) dailyMeals[day][type] = { foods: [] };
      dailyMeals[day][type].foods = m.foods || [];
    });
  }

  // Fallback if empty
  if (Object.keys(dailyMeals).length === 0) {
    dailyMeals["1"] = {
      breakfast: {
        foods: [
          { name: "Yến mạch nấu sữa không đường", amount: "60g yến mạch + 200ml sữa", calories: 340, protein: 16, carbs: 54, fat: 6 },
          { name: "Trứng gà luộc", amount: "2 quả", calories: 145, protein: 13, carbs: 1, fat: 10 }
        ]
      },
      lunch: {
        foods: [
          { name: "Cơm gạo lứt / Cơm trắng", amount: "1.5 chén (200g)", calories: 260, protein: 6, carbs: 58, fat: 1 },
          { name: "Ức gà áp chảo sốt tiêu", amount: "180g", calories: 290, protein: 55, carbs: 4, fat: 5 },
          { name: "Rau củ luộc xanh", amount: "150g", calories: 60, protein: 3, carbs: 12, fat: 0 }
        ]
      },
      dinner: {
        foods: [
          { name: "Khoai lang luộc / hấp", amount: "1 củ vừa (180g)", calories: 160, protein: 3, carbs: 37, fat: 0 },
          { name: "Thịt thăn bò / Cá hồi", amount: "160g", calories: 300, protein: 36, carbs: 0, fat: 16 }
        ]
      }
    };
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading("Đang xuất file thực đơn PDF...");

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const cleanFileName = `Thuc-Don-${(plan.name || "Dinh-Duong").replace(/\s+/g, "-")}.pdf`;
      pdf.save(cleanFileName);

      toast.success("Xuất file PDF thực đơn thành công!", { id: toastId });
    } catch (error) {
      console.error("PDF Export error:", error);
      toast.error("Không thể xuất file PDF. Vui lòng chọn In / Lưu PDF.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const mealTypeLabels = {
    breakfast: "Bữa Sáng (Breakfast)",
    lunch: "Bữa Trưa (Lunch)",
    dinner: "Bữa Tối (Dinner)",
    snack: "Bữa Phụ / Bữa Lỡ (Snack)"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-900 text-slate-100 border-slate-800">
        <DialogHeader className="no-print flex flex-row items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Apple className="w-5 h-5 text-emerald-400" />
              Xuất Thực Đơn Dinh Dưỡng (PDF Preview)
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              File thực đơn chi tiết calo và macro phân bổ theo từng bữa ăn gửi trực tiếp cho học viên.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              In / Lưu PDF
            </Button>
            <Button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              size="sm"
              className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Tải File PDF (.pdf)
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Canvas */}
        <div className="bg-slate-950 p-2 sm:p-4 rounded-xl flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm font-sans"
            style={{ boxSizing: "border-box" }}
          >
            {/* Header / Studio Branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                    A
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                    {coach.business_name || "APEX NUTRITION & FITNESS"}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Kế Hoạch Dinh Dưỡng Khoa Học Cá Nhân Hóa (Evidence-Based Nutrition)
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{coach.full_name}</p>
                {coach.phone && <p>Hotline: {coach.phone}</p>}
                {coach.email && <p>Email: {coach.email}</p>}
                <p className="text-slate-400">Ngày tạo: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            {/* Plan Overview & Macros */}
            <div className="bg-emerald-50/70 rounded-lg p-5 mb-6 border border-emerald-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    CHẾ ĐỘ ĂN & NĂNG LƯỢNG MỤC TIÊU
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1.5">{plan.name}</h2>
                  {plan.description && (
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">{plan.description}</p>
                  )}
                  <p className="text-xs text-slate-700 mt-2">
                    Áp dụng cho học viên: <strong className="text-slate-900">{client?.full_name || "Học viên"}</strong>
                  </p>
                </div>

                {/* Macro Target Boxes */}
                <div className="text-right bg-white p-3 rounded-lg border border-emerald-200 shadow-sm min-w-[200px]">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                    Năng Lượng Mục Tiêu
                  </span>
                  <div className="text-2xl font-black text-emerald-700">
                    {plan.calories_target || 2000} <span className="text-xs font-normal text-slate-500">kcal/ngày</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-100 text-center text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Đạm (P)</span>
                      <strong className="text-slate-900">{plan.protein_target_g || 150}g</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Carb (C)</span>
                      <strong className="text-slate-900">{plan.carbs_target_g || 200}g</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Béo (F)</span>
                      <strong className="text-slate-900">{plan.fat_target_g || 60}g</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals Table Breakdown */}
            <div className="space-y-6">
              {Object.entries(dailyMeals).map(([dayNumber, mealsObj]) => (
                <div key={dayNumber} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center">
                    <h3 className="font-bold text-sm tracking-wide">
                      THỰC ĐƠN TIÊU CHUẨN NGÀY {dayNumber}
                    </h3>
                    <span className="text-xs text-emerald-300 font-medium">
                      Phân bổ 3-4 bữa trong ngày
                    </span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {Object.entries(mealsObj).map(([mealType, mealData]) => {
                      const foods = mealData.foods || [];
                      if (foods.length === 0) return null;

                      const mealCalories = foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
                      const mealProtein = foods.reduce((sum, f) => sum + (Number(f.protein) || 0), 0);

                      return (
                        <div key={mealType} className="p-4 bg-white">
                          <div className="flex justify-between items-center mb-2.5">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {mealTypeLabels[mealType] || mealType}
                            </h4>
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              ~{mealCalories} kcal | {mealProtein}g Protein
                            </span>
                          </div>

                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-semibold uppercase">
                                <th className="pb-1.5 px-2">Tên Thực Phẩm / Món Ăn</th>
                                <th className="pb-1.5 px-2 text-center w-36">Khối Lượng / Khẩu Phần</th>
                                <th className="pb-1.5 px-2 text-center w-20">Calo</th>
                                <th className="pb-1.5 px-2 text-center w-20">Protein</th>
                                <th className="pb-1.5 px-2 text-center w-20">Carbs</th>
                                <th className="pb-1.5 px-2 text-center w-20">Fat</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {foods.map((food, fIdx) => (
                                <tr key={fIdx} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-2 font-medium text-slate-900">{food.name}</td>
                                  <td className="py-2 px-2 text-center text-slate-600 font-semibold">{food.amount || "1 phần"}</td>
                                  <td className="py-2 px-2 text-center text-slate-700">{food.calories ? `${food.calories} kcal` : "-"}</td>
                                  <td className="py-2 px-2 text-center text-emerald-700 font-semibold">{food.protein ? `${food.protein}g` : "-"}</td>
                                  <td className="py-2 px-2 text-center text-slate-600">{food.carbs ? `${food.carbs}g` : "-"}</td>
                                  <td className="py-2 px-2 text-center text-slate-600">{food.fat ? `${food.fat}g` : "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Principles & Golden Rules */}
            <div className="mt-8 pt-5 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                  5 NGUYÊN TẮC DINH DƯỠNG CỐT LÕI:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li><strong>Uống nước:</strong> Tối thiểu 2.5 - 3.5 lít nước lọc mỗi ngày.</li>
                  <li><strong>Gia vị:</strong> Hạn chế nêm nhiều đường, nước mắm mặn hoặc dầu ăn chiên lại.</li>
                  <li><strong>Thời điểm ăn:</strong> Không bỏ bữa sáng, bữa tối nên cách giờ ngủ ít nhất 2.5 tiếng.</li>
                  <li><strong>Rau củ:</strong> Ăn đa dạng các loại rau có màu xanh đậm (Bông cải, bina, xà lách).</li>
                  <li>Báo ngay cho Coach nếu cảm thấy đói lả hoặc đầy bụng khó tiêu để điều chỉnh!</li>
                </ol>
              </div>
              <div className="text-right flex flex-col justify-end items-end space-y-1">
                <p className="text-slate-500">Chuyên gia dinh dưỡng / Huấn luyện viên</p>
                <div className="h-10 border-b border-slate-400 w-44 mt-2"></div>
                <p className="font-bold text-slate-900 text-sm mt-1">{coach.full_name}</p>
                <p className="text-[11px] text-slate-400">Ký duyệt lộ trình</p>
              </div>
            </div>

            {/* Bottom Footer Brand */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
              <span>ApexCoach Nutrition — Lộ trình dành riêng cho học viên cá nhân</span>
              <span>Bản quyền thuộc {coach.business_name || "Apex Coach"}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
