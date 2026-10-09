import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, TrendingUp, FileText, Loader2, Award, Scale, Ruler } from "lucide-react";
import { storageEngine } from "@/lib/storageEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function ProgressPdfModal({ open, onOpenChange, client, progressEntries = [] }) {
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const coach = storageEngine.getCoachProfile();

  if (!client) return null;

  // Sort progress by date asc
  const sortedEntries = [...progressEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const initialEntry = sortedEntries[0] || {};
  const latestEntry = sortedEntries[sortedEntries.length - 1] || {};

  const weightChange = latestEntry.weight && initialEntry.weight
    ? (Number(latestEntry.weight) - Number(initialEntry.weight)).toFixed(1)
    : null;

  const waistChange = latestEntry.waist && initialEntry.waist
    ? (Number(latestEntry.waist) - Number(initialEntry.waist)).toFixed(1)
    : null;

  const bodyFatChange = latestEntry.body_fat && initialEntry.body_fat
    ? (Number(latestEntry.body_fat) - Number(initialEntry.body_fat)).toFixed(1)
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    const toastId = toast.loading("Đang xuất báo cáo tiến độ PDF...");

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
      const cleanFileName = `Bao-Cao-Tien-Do-${(client.full_name || "Client").replace(/\s+/g, "-")}.pdf`;
      pdf.save(cleanFileName);

      toast.success("Xuất file báo cáo thành công!", { id: toastId });
    } catch (error) {
      console.error("PDF Export error:", error);
      toast.error("Không thể xuất file PDF.", { id: toastId });
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
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Báo Cáo Tiến Độ Huấn Luyện (Progress Report PDF)
            </DialogTitle>
            <p className="text-xs text-slate-400 mt-1">
              File tổng kết chỉ số cơ thể, cân nặng và lời nhận xét gửi cho học viên theo từng chu kỳ.
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
              className="gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
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
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                    A
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                    {coach.business_name || "APEX ATHLETIC PERFORMANCE"}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Báo Cáo Phân Tích Chỉ Số Cơ Thể & Đánh Giá Tiến Bộ
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{coach.full_name}</p>
                {coach.phone && <p>Hotline: {coach.phone}</p>}
                {coach.email && <p>Email: {coach.email}</p>}
                <p className="text-slate-400">Kỳ báo cáo: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            {/* Client Profile Overview */}
            <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    HỒ SƠ HỌC VIÊN
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{client.full_name}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mục tiêu: <strong className="text-slate-800">{client.fitness_goal || "Cải thiện vóc dáng"}</strong>
                  </p>
                </div>
                <div className="flex gap-4 text-xs text-slate-600">
                  <div className="bg-white p-2.5 rounded border border-slate-200 text-center min-w-[70px]">
                    <span className="block text-[10px] text-slate-400">Tuổi</span>
                    <strong className="text-slate-900 text-sm">{client.age || "--"}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 text-center min-w-[70px]">
                    <span className="block text-[10px] text-slate-400">Chiều cao</span>
                    <strong className="text-slate-900 text-sm">{client.height ? `${client.height} cm` : "--"}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 text-center min-w-[70px]">
                    <span className="block text-[10px] text-slate-400">Hiện tại</span>
                    <strong className="text-slate-900 text-sm">{latestEntry.weight ? `${latestEntry.weight} kg` : `${client.weight || "--"} kg`}</strong>
                  </div>
                </div>
              </div>

              {/* Milestone Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200">
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Biến Động Cân Nặng</span>
                  <div className={`text-xl font-black mt-0.5 ${Number(weightChange) < 0 ? "text-emerald-600" : "text-blue-600"}`}>
                    {weightChange ? `${Number(weightChange) > 0 ? "+" : ""}${weightChange} kg` : "Đang theo dõi"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Vòng Eo (Waist)</span>
                  <div className={`text-xl font-black mt-0.5 ${Number(waistChange) < 0 ? "text-emerald-600" : "text-slate-800"}`}>
                    {waistChange ? `${Number(waistChange) > 0 ? "+" : ""}${waistChange} cm` : "Đang theo dõi"}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Tỷ Lệ Mỡ (Body Fat)</span>
                  <div className={`text-xl font-black mt-0.5 ${Number(bodyFatChange) < 0 ? "text-emerald-600" : "text-blue-600"}`}>
                    {bodyFatChange ? `${Number(bodyFatChange) > 0 ? "+" : ""}${bodyFatChange} %` : "Đang theo dõi"}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Measurements Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-slate-900 text-white px-4 py-2.5 flex justify-between items-center">
                <h3 className="font-bold text-sm tracking-wide">
                  LỊCH SỬ ĐO ĐẠC CHỈ SỐ CƠ THỂ
                </h3>
                <span className="text-xs text-blue-300">
                  {sortedEntries.length} Kỳ đo đã lưu
                </span>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Ngày Đo</th>
                    <th className="py-2.5 px-2 text-center">Cân Nặng (kg)</th>
                    <th className="py-2.5 px-2 text-center">Mỡ (%)</th>
                    <th className="py-2.5 px-2 text-center">Ngực (cm)</th>
                    <th className="py-2.5 px-2 text-center">Eo (cm)</th>
                    <th className="py-2.5 px-2 text-center">Mông (cm)</th>
                    <th className="py-2.5 px-2 text-center">Bắp Tay (cm)</th>
                    <th className="py-2.5 px-3">Nhận Xét Của Coach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{entry.date || "N/A"}</td>
                        <td className="py-2.5 px-2 text-center font-bold text-blue-700">{entry.weight || "--"}</td>
                        <td className="py-2.5 px-2 text-center text-slate-700">{entry.body_fat ? `${entry.body_fat}%` : "--"}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600">{entry.chest || "--"}</td>
                        <td className="py-2.5 px-2 text-center font-semibold text-emerald-700">{entry.waist || "--"}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600">{entry.hips || "--"}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600">{entry.arms || "--"}</td>
                        <td className="py-2.5 px-3 text-slate-600 italic">{entry.notes || "Duy trì phong độ tốt."}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        Chưa có dữ liệu đo đạc nào được ghi nhận.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Coach Review & Next Stage Plan */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-5 mb-6 text-xs">
              <h4 className="font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-blue-600" />
                ĐÁNH GIÁ CHUYÊN MÔN TỪ HUẤN LUYỆN VIÊN:
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {latestEntry.notes ||
                  "Học viên có sự tiến bộ rất rõ rệt về mặt thể lực và form chuyển động. Tỷ lệ cơ bắp cải thiện tốt, các chỉ số số đo đi đúng lộ trình đã đề ra. Trong chu kỳ tiếp theo, chúng ta sẽ tăng thêm cường độ tạ (progressive overload) và tiếp tục duy trì lượng đạm mục tiêu."}
              </p>
            </div>

            {/* Coach Sign-off */}
            <div className="mt-8 pt-5 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">ApexCoach Performance Studio</p>
                <p className="text-[11px] text-slate-400">Hệ thống quản lý huấn luyện cá nhân chuyên nghiệp</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Huấn luyện viên phụ trách</p>
                <div className="h-10 border-b border-slate-400 w-44 mt-2"></div>
                <p className="font-bold text-slate-900 text-sm mt-1">{coach.full_name}</p>
                <p className="text-[11px] text-slate-400">Ký xác nhận tiến độ</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
