import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Users, 
  Dumbbell, 
  Utensils, 
  UserPlus, 
  FileDown, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Phone, 
  Target,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AdminFullDashboard from "@/components/admin/AdminFullDashboard";
import ClientForm from "@/components/clients/ClientForm";
import ProgressPdfModal from "@/components/pdf/ProgressPdfModal";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClientForm, setShowClientForm] = useState(false);
  const [pdfClient, setPdfClient] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await base44.auth.me();
      if (!userData) return;
      setUser(userData);
    };
    checkAuth();
  }, []);

  // Queries
  const { data: clients = [], isLoading: clientsLoading } = useQuery({ 
    queryKey: ["clients", user?.id], 
    queryFn: () => base44.entities.Client.filter({ trainer_id: user?.id }, "-created_date"), 
    enabled: !!user 
  });

  const { data: workouts = [] } = useQuery({ 
    queryKey: ["workouts", user?.id], 
    queryFn: () => base44.entities.WorkoutPlan.filter({ trainer_id: user?.id }), 
    enabled: !!user 
  });

  const { data: meals = [] } = useQuery({ 
    queryKey: ["meals", user?.id], 
    queryFn: () => base44.entities.MealPlan.filter({ trainer_id: user?.id }), 
    enabled: !!user 
  });

  // Client mutation
  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create({ ...data, trainer_id: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Đã thêm học viên mới thành công!");
      setShowClientForm(false);
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thêm học viên");
    }
  });

  const adminViewMode = (() => { 
    try { 
      const v = localStorage.getItem('adminViewMode'); 
      return v ? JSON.parse(v) : 'trainer'; 
    } catch { 
      return 'trainer'; 
    } 
  })();

  const isAdmin = user?.role === 'admin' && adminViewMode === 'full';

  if (!user) return <div className="min-h-screen bg-background"></div>;

  if (isAdmin) {
    return (
      <AdminFullDashboard 
        user={user}
        onLogout={() => base44.auth.logout()}
      />
    );
  }

  const activeClients = clients.filter(c => c.status === "active");
  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.goals?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-secondary/60 to-background border border-emerald-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Hệ thống Huấn Luyện Viên Tinh Gọn</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Xin chào, {user.data?.full_name || user.full_name || "Huấn Luyện Viên"}! 👋
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
              Quản lý học viên, soạn giáo án tập và thực đơn dinh dưỡng. Xuất file PDF 1 chạm gửi trực tiếp qua Zalo cho học viên.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowClientForm(true)}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-6 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 text-base transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              <span>+ Thêm Học Viên</span>
            </Button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 2. 3 Nút Hành Động Lớn (Hero Quick Actions) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Tác vụ thường dùng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Thêm học viên */}
          <div 
            onClick={() => setShowClientForm(true)}
            className="group cursor-pointer bg-card/60 hover:bg-card border border-border hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  Thêm Học Viên Mới
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Nhập họ tên, số điện thoại và mục tiêu luyện tập của học viên.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <span>Bấm để thêm ngay</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Giáo án tập */}
          <Link 
            to={createPageUrl("Workouts")}
            className="group cursor-pointer bg-card/60 hover:bg-card border border-border hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Dumbbell className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  Giáo Án Tập & Xuất PDF
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Xem danh sách bài tập, tạo giáo án mới và xuất file PDF gửi Zalo.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-blue-400 text-sm font-bold">
              <span>Mở trang Giáo Án</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Thực đơn ăn */}
          <Link 
            to={createPageUrl("Meals")}
            className="group cursor-pointer bg-card/60 hover:bg-card border border-border hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Utensils className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors">
                  Thực Đơn Ăn & Xuất PDF
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Soạn chế độ ăn dinh dưỡng từng bữa và xuất file PDF đẹp mắt.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm font-bold">
              <span>Mở trang Thực Đơn</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. 3 Thẻ Thống Kê Số Liệu Tinh Gọn */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/40 border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Học viên đang tập</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{activeClients.length}</p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">{clients.length} học viên tổng cộng</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card/40 border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Giáo án đã lập</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{workouts.length}</p>
            <p className="text-xs text-blue-400 mt-1 font-medium">Sẵn sàng xuất PDF</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card/40 border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Thực đơn dinh dưỡng</p>
            <p className="text-3xl font-extrabold text-foreground mt-1">{meals.length}</p>
            <p className="text-xs text-amber-400 mt-1 font-medium">Sẵn sàng xuất PDF</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. Danh Sách Học Viên & Thao Tác 1 Chạm */}
      <div className="bg-card/60 border border-border rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Danh Sách Học Viên Của Bạn
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Bấm vào tên học viên để xem hồ sơ, hoặc bấm nút Xuất PDF để gửi cho học viên.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, SĐT học viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-background border-border"
              />
            </div>
            <Link to={createPageUrl("Clients")}>
              <Button variant="outline" className="rounded-xl border-border whitespace-nowrap">
                Xem Tất Cả
              </Button>
            </Link>
          </div>
        </div>

        {/* Client List Rows */}
        {clientsLoading ? (
          <div className="py-12 text-center text-muted-foreground">Đang tải danh sách học viên...</div>
        ) : filteredClients.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-2xl space-y-3">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="text-foreground font-semibold">Chưa tìm thấy học viên nào</p>
            <p className="text-muted-foreground text-sm">Bấm "Thêm Học Viên" phía trên để tạo học viên đầu tiên.</p>
            <Button onClick={() => setShowClientForm(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" /> Thêm Học Viên Ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((c) => (
              <div 
                key={c.id}
                className="bg-secondary/40 hover:bg-secondary/80 border border-border/80 hover:border-emerald-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30">
                        <AvatarImage src={c.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                          {c.full_name?.[0]?.toUpperCase() || "H"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-foreground text-base group-hover:text-emerald-400 transition-colors">
                          {c.full_name}
                        </h4>
                        {c.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {c.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={c.status === "active" ? "bg-emerald-500/20 text-emerald-300 border-0 text-xs" : "bg-slate-500/20 text-slate-300 border-0 text-xs"}>
                      {c.status === "active" ? "Đang tập" : "Tạm dừng"}
                    </Badge>
                  </div>

                  {c.goals && (
                    <div className="bg-background/60 rounded-xl p-2.5 text-xs text-muted-foreground border border-border/40 flex items-start gap-2 mb-4">
                      <Target className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{c.goals}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                  <Button
                    onClick={() => setPdfClient(c)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl text-xs font-semibold border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Xuất PDF
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("ClientProfile") + `?id=${c.id}`)}
                    size="sm"
                    className="flex-1 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 gap-1.5"
                  >
                    Xem Hồ Sơ
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Mẹo Hướng Dẫn Nhanh Dành Cho PT */}
      <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-sm text-blue-200">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-300">Hướng dẫn nhanh cho Huấn Luyện Viên: </span>
          Mọi dữ liệu học viên, giáo án và thực đơn đều được lưu tự động trên trình duyệt. Bạn chỉ cần bấm 
          <span className="font-bold text-white"> "Xuất PDF" </span> 
          ở bất kỳ mục nào để tải file hoặc in ra và gửi trực tiếp qua Zalo / Messenger cho học viên mà không cần bắt học viên phải tạo tài khoản hay đăng nhập.
        </div>
      </div>

      {/* Form Thêm Học Viên Modal */}
      <ClientForm
        open={showClientForm}
        onOpenChange={setShowClientForm}
        onSubmit={(data) => createClientMutation.mutate(data)}
      />

      {/* Modal Xuất PDF Báo Cáo Nhanh */}
      {pdfClient && (
        <ProgressPdfModal
          open={!!pdfClient}
          onOpenChange={(isOpen) => !isOpen && setPdfClient(null)}
          client={pdfClient}
          trainer={user}
        />
      )}
    </div>
  );
}