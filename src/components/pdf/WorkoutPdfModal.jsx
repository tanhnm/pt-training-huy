import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Dumbbell, Calendar, User, CheckCircle, FileText, Loader2 } from "lucide-react";
import { storageEngine } from "@/lib/storageEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function WorkoutPdfModal({ open, onOpenChange, workout, client }) {
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const coach = storageEngine.getCoachProfile();

  if (!workout) return null;

  // Normalize exercises list per day
  const dailyExercises = {};
  if (workout.daily_exercises && Object.keys(workout.daily_exercises).length > 0) {
    Object.assign(dailyExercises, workout.daily_exercises);
  } else if (Array.isArray(workout.exercises)) {
    workout.exercises.forEach((ex) => {
      const day = ex.day || 1;
      if (!dailyExercises[day]) dailyExercises[day] = [];
      dailyExercises[day].push(ex);
    });
  }

  // Fallback if empty
  if (Object.keys(dailyExercises).length === 0) {
    dailyExercises["1"] = [
      { name: "Barbell Bench Press", sets: 3, reps: "8-10", target_rir: 2, rest_seconds: 90, notes: "Khởi động kỹ" }
    ];
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading("Đang khởi tạo file PDF...");

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
      const cleanFileName = `Giao-An-${(workout.name || "Workout").replace(/\s+/g, "-")}.pdf`;
      pdf.save(cleanFileName);

      toast.success("Xuất file PDF thành công!", { id: toastId });
    } catch (error) {
      console.error("PDF Export error:", error);
      toast.error("Không thể xuất file PDF. Vui lòng thử nút In / Lưu PDF.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-900 text-slate-100 border-slate-800">
        <DialogHeader className="no-print flex flex-row items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-amber-400" />
              Xuất Giáo Án Tập Luyện (PDF Preview)
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              Xem trước và xuất file PDF gửi trực tiếp cho học viên qua Zalo / Messenger / Email.
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
              className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-black font-semibold"
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

        {/* Printable Paper Canvas (Styled in Clean Pure White for PDF & Printing) */}
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
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg">
                    A
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                    {coach.business_name || "APEX COACHING STUDIO"}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Personal Training & Athletic Performance Development
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{coach.full_name}</p>
                {coach.phone && <p>Hotline: {coach.phone}</p>}
                {coach.email && <p>Email: {coach.email}</p>}
                <p className="text-slate-400">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            {/* Program Title Banner */}
            <div className="bg-slate-100 rounded-lg p-5 mb-6 border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    GIÁO ÁN TẬP LUYỆN ĐỘC QUYỀN
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1.5">{workout.name}</h2>
                  {workout.description && (
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">{workout.description}</p>
                  )}
                </div>
                <div className="text-right text-xs space-y-1">
                  <div className="bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500">Thời lượng: </span>
                    <strong className="text-slate-900">{workout.duration_weeks || 4} Tuần</strong>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
                    <span className="text-slate-500">Tần suất: </span>
                    <strong className="text-slate-900">{workout.days_per_week || 3} Buổi / Tuần</strong>
                  </div>
                </div>
              </div>

              {/* Client Info Bar */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Học viên:</span>
                  <strong className="text-slate-900 text-sm">
                    {client?.full_name || "Học viên chỉ định"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Mục tiêu:</span>
                  <strong className="text-slate-800">
                    {client?.fitness_goal || "Tăng cơ bắp & Cải thiện sức bền"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Trình độ:</span>
                  <strong className="text-slate-800 capitalize">
                    {workout.difficulty || "Trung cấp"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Daily Exercises Schedule */}
            <div className="space-y-6">
              {Object.entries(dailyExercises).map(([dayNumber, exercises]) => (
                <div key={dayNumber} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-black">
                        {dayNumber}
                      </div>
                      <h3 className="font-bold text-sm tracking-wide">
                        BUỔI {dayNumber}: {exercises[0]?.target_muscle || exercises[0]?.body_part || "LỊCH TẬP CHI TIẾT"}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-300 font-medium">
                      {exercises.length} Bài tập
                    </span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3 w-10 text-center">STT</th>
                        <th className="py-2.5 px-3">Tên Bài Tập</th>
                        <th className="py-2.5 px-2 text-center w-16">Số Set</th>
                        <th className="py-2.5 px-2 text-center w-20">Số Reps</th>
                        <th className="py-2.5 px-2 text-center w-16">RIR</th>
                        <th className="py-2.5 px-2 text-center w-20">Nghỉ (s)</th>
                        <th className="py-2.5 px-3">Lưu Ý Kỹ Thuật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exercises.map((ex, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{ex.name}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/50">
                            {ex.sets || 3}
                          </td>
                          <td className="py-2.5 px-2 text-center font-semibold text-slate-800">
                            {ex.reps || "10-12"}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600">
                            {ex.target_rir != null ? ex.target_rir : "1-2"}
                          </td>
                          <td className="py-2.5 px-2 text-center text-slate-600">
                            {ex.rest_seconds ? `${ex.rest_seconds}s` : "60s"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 italic">
                            {ex.notes || "Kiểm soát chuyển động chậm, hít thở đều."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Important Notes & Coach Sign-off */}
            <div className="mt-8 pt-5 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">
                  HƯỚNG DẪN QUAN TRỌNG TỪ COACH:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Khởi động làm nóng khớp 5-10 phút trước mỗi buổi tập.</li>
                  <li><strong>RIR (Reps in Reserve):</strong> Số reps bạn còn có thể làm được trước khi kiệt sức.</li>
                  <li>Uống đủ từ 500ml - 1 lít nước trong suốt buổi tập.</li>
                  <li>Chụp ảnh hoặc quay video gửi Coach nếu bạn thấy chưa quen động tác!</li>
                </ul>
              </div>
              <div className="text-right flex flex-col justify-end items-end space-y-1">
                <p className="text-slate-500">Huấn luyện viên phụ trách</p>
                <div className="h-10 border-b border-slate-400 w-44 mt-2"></div>
                <p className="font-bold text-slate-900 text-sm mt-1">{coach.full_name}</p>
                <p className="text-[11px] text-slate-400">Chữ ký xác nhận</p>
              </div>
            </div>

            {/* Bottom Footer Brand */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
              <span>ApexCoach Pro Platform — Không yêu cầu tài khoản học viên</span>
              <span>Bản quyền thuộc {coach.business_name || "Apex Coach"}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
