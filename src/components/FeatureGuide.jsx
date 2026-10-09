import React, { useState, useEffect } from "react";
import { HelpCircle, X, Lightbulb, ChevronRight } from "lucide-react";

/**
 * FeatureGuide — first-time walkthrough cards for every major page.
 *
 * The first time a user opens a page, an instruction card explains what the
 * page is for and how to use it. Dismissing it collapses it to a small
 * "Page guide" button so it can be reopened anytime. Seen-state is stored
 * per page in localStorage.
 */

const GUIDES = {
  /* ---------------- Trainer portal ---------------- */
  Dashboard: {
    title: "Hướng dẫn sử dụng Bảng điều khiển",
    steps: [
      "Bấm '+ Thêm Học Viên' để tạo hồ sơ học viên mới nhanh chóng.",
      "Chọn 'Giáo Án Tập' hoặc 'Thực Đơn Ăn' để lên lịch tập và chế độ dinh dưỡng.",
      "Bấm nút 'Xuất PDF' ở bất kỳ mục nào để tải file gửi trực tiếp qua Zalo cho học viên.",
    ],
  },
  Clients: {
    title: "Quản lý danh sách học viên",
    steps: [
      "Bấm '+ Thêm Học Viên Mới' để nhập thông tin và mục tiêu luyện tập.",
      "Bấm vào từng học viên để xem và quản lý Giáo Án, Thực Đơn và Chỉ Số.",
      "Dữ liệu được lưu trữ tự động trên thiết bị của bạn an toàn và bảo mật.",
    ],
  },
  Workouts: {
    title: "Soạn giáo án & Xuất PDF",
    steps: [
      "Bấm '+ Tạo Giáo Án Mới' để thêm các bài tập theo ngày trong tuần.",
      "Bấm nút 'Xuất PDF' để tải file giáo án hoàn chỉnh gửi cho học viên qua Zalo.",
      "Học viên xem trực tiếp file PDF không cần phải đăng nhập tài khoản.",
    ],
  },
  Meals: {
    title: "Lên thực đơn dinh dưỡng & Xuất PDF",
    steps: [
      "Bấm '+ Tạo Thực Đơn Mới' để thêm thực phẩm cho từng bữa ăn (Sáng, Trưa, Tối, Phụ).",
      "Bấm nút 'Xuất PDF' để có ngay bản thực đơn dinh dưỡng chuyên nghiệp gửi cho học viên.",
    ],
  },
  Schedule: {
    title: "Lịch Dạy & Lịch Hẹn Tập",
    steps: [
      "Bấm 'Tạo Buổi Mới' hoặc bấm vào từng ngày để lên lịch tập cho học viên.",
      "Theo dõi lịch theo tuần trực quan, có phân loại màu sắc theo loại hình tập.",
      "Đánh dấu trạng thái: Hoàn thành, Hủy buổi hoặc Vắng mặt sau mỗi buổi dạy.",
    ],
  },
  Messages: {
    title: "Tin Nhắn & Trao Đổi",
    steps: [
      "Chọn học viên từ danh sách để bắt đầu trò chuyện trực tiếp.",
      "Hỗ trợ gửi hình ảnh, video hướng dẫn bài tập hoặc nhận xét form tập.",
    ],
  },
  CRM: {
    title: "Quản Lý Khách Hàng Tiềm Năng",
    steps: [
      "Theo dõi khách hàng tiềm năng qua từng giai đoạn tiếp cận.",
      "Chuyển đổi khách hàng thành học viên chính thức khi bắt đầu lộ trình.",
    ],
  },
  Contracts: {
    title: "Hợp Đồng & Cam Kết",
    steps: [
      "Quản lý thỏa thuận tập luyện, bảng khảo sát sức khỏe PAR-Q và cam kết miễn trừ trách nhiệm.",
    ],
  },
  Resources: {
    title: "Kho Tài Liệu Chia Sẻ",
    steps: [
      "Lưu trữ kiến thức, bài viết, video kỹ thuật và công thức nấu ăn chia sẻ cho học viên.",
    ],
  },
  Recipes: {
    title: "Thư Viện Món Ăn",
    steps: [
      "Tạo công thức món ăn dinh dưỡng, phân tích calo và macro để đưa vào thực đơn.",
    ],
  },
  BusinessHub: {
    title: "Quản Lý Thu Chi & Kinh Doanh",
    steps: [
      "Theo dõi các khoản chi phí, nguồn thu và hiệu quả công việc huấn luyện viên.",
    ],
  },
  Settings: {
    title: "Cài Đặt & Sao Lưu Dữ Liệu",
    steps: [
      "Hồ sơ cá nhân: Cập nhật tên, số điện thoại, logo phòng gym xuất trên đầu trang file PDF.",
      "Cấu hình Gemini AI: Dán API Key miễn phí từ Google AI Studio để kích hoạt trợ lý AI thông minh.",
      "Sao lưu & Phục hồi: Xuất file JSON lưu trên máy tính hoặc chuyển sang điện thoại khác bất cứ lúc nào.",
      "Giao diện: Chọn chế độ Sáng / Tối hoặc tự động theo thiết bị.",
    ],
  },
  TrainerCommunity: {
    title: "Cộng Đồng Huấn Luyện Viên",
    steps: [
      "Giao lưu, chia sẻ kinh nghiệm huấn luyện và bài tập với các đồng nghiệp.",
    ],
  },
  TrainerAssistant: {
    title: "Trợ Lý AI Tự Động Thông Minh",
    steps: [
      "Gõ yêu cầu tự nhiên: ví dụ 'Tạo học viên Hoàng Long 26 tuổi, siết cơ, tạo giáo án 4 buổi và thực đơn 2200 calo'.",
      "AI tự động khởi tạo hồ sơ, giáo án và thực đơn lưu trực tiếp vào hệ thống.",
      "Bấm nút 'Xuất PDF Gửi Zalo' ngay trên thẻ kết quả để gửi ngay cho học viên.",
    ],
  },

  /* ---------------- Client portal ---------------- */
  ClientDashboard: {
    title: "Welcome to ApexCoach!",
    steps: [
      "This is your Today screen — today's workout, habit checklist, and next session at a glance.",
      "Tap “Start” on your workout card to begin training.",
      "Check off habits as you complete them each day to build your streak.",
      "Use the bottom bar to reach Workouts, Nutrition, and Progress. “More” opens the full menu.",
    ],
  },
  ClientWorkouts: {
    title: "Your workouts",
    steps: [
      "Your trainer's plans appear here. Open one to see each day's exercises with demo images.",
      "Tap “Start Workout” to train, then log your completion — your trainer sees it immediately.",
      "The Progress Analytics tab charts your strength over time for every exercise.",
    ],
  },
  ClientMeals: {
    title: "Your nutrition",
    steps: [
      "Follow the meal plans your trainer assigns, with foods, portions, and macros.",
      "Use the AI Meal Scanner: snap a photo of any meal and it estimates the calories and macros.",
      "Log what you eat so your trainer can keep your plan on track.",
    ],
  },
  ClientProgress: {
    title: "Tracking progress",
    steps: [
      "Tap “Log Progress” to record weight and measurements — charts build automatically over time.",
      "Add progress photos from your dashboard; three or more unlocks the timelapse view.",
      "Your trainer sees everything you log, so they can adjust your plan.",
    ],
  },
  ClientHabits: {
    title: "Habits & focus",
    steps: [
      "Check off your daily habits — streaks build as you stay consistent.",
      "Use the Focus Timer for distraction-free work or meal-prep sessions.",
      "Open My Journal to reflect daily; your trainer can see AI summaries to coach you better.",
    ],
  },
  ClientSchedule: {
    title: "Your schedule",
    steps: [
      "Sessions your trainer books appear on this calendar.",
      "Message your trainer to request a new time or reschedule.",
    ],
  },
  ClientJournal: {
    title: "Daily reflection",
    steps: [
      "Answer the daily prompt (or tap “New Prompt” for a different one) and save your entry.",
      "Journaling helps your trainer understand how you're really doing — entries are summarized with AI insights.",
    ],
  },
  ClientResources: {
    title: "Resources",
    steps: [
      "Files, videos, recipes, and guides your trainer shares appear here, organized by category.",
    ],
  },
  ClientCommunity: {
    title: "Community",
    steps: [
      "Share wins and encouragement with your trainer's other clients.",
      "Add photos to your posts to celebrate milestones.",
    ],
  },

  /* ---------------- Solo portal ---------------- */
  IndependentDashboard: {
    title: "Welcome, solo athlete!",
    steps: [
      "This is your home base — workouts, meals, and progress in one view.",
      "Tap “Start Workout” to train. Build plans in the Workouts tab.",
      "Upload progress photos to build your transformation timelapse.",
      "AI Journal gives you personalized insights as you log your training.",
    ],
  },
};

export default function FeatureGuide({ currentPageName }) {
  const guide = GUIDES[currentPageName];
  const storageKey = `guide_seen_${currentPageName}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!guide) return;
    try {
      setOpen(localStorage.getItem(storageKey) !== "1");
    } catch {
      setOpen(false);
    }
  }, [currentPageName]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!guide) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch { /* ignore */ }
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Hướng dẫn trang
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-2xl border border-primary/25 bg-primary/5 p-5 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition"
        aria-label="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">{guide.title}</h3>
      </div>
      <ul className="space-y-2 mb-4">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{step}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={dismiss}
        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
      >
        Đã hiểu
      </button>
    </div>
  );
}
