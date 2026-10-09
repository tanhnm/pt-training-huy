import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutDashboard, Users, Dumbbell, Utensils, Calendar, MessageSquare,
  FileText, Library, LineChart, Bot, Settings as SettingsIcon, UserCircle,
  BookOpen, Receipt, Users2, Sun, Moon, Plus,
} from "lucide-react";
import { useTheme } from "@/components/hooks/useTheme";

const TRAINER_PAGES = [
  { label: "Trang Chủ (Dashboard)", page: "Dashboard", icon: LayoutDashboard },
  { label: "Học Viên", page: "Clients", icon: Users },
  { label: "Giáo Án Tập", page: "Workouts", icon: Dumbbell },
  { label: "Thực Đơn Ăn", page: "Meals", icon: Utensils },
  { label: "Lịch Tập & Hẹn", page: "Schedule", icon: Calendar },
  { label: "Tin Nhắn", page: "Messages", icon: MessageSquare },
  { label: "Hợp Đồng & Cam Kết", page: "Contracts", icon: FileText },
  { label: "Tài Liệu & Thư Viện", page: "Resources", icon: Library },
  { label: "Chỉ Số & Tiến Độ", page: "Progress", icon: LineChart },
  { label: "Công Thức Món Ăn", page: "Recipes", icon: Utensils },
  { label: "Khách Hàng Tiềm Năng (CRM)", page: "CRM", icon: Users2 },
  { label: "Doanh Thu & Kinh Doanh", page: "BusinessHub", icon: Receipt },
  { label: "Chi Phí", page: "TrainerExpenses", icon: Receipt },
  { label: "Sổ Tay Học Viên", page: "ClientNotebooks", icon: BookOpen },
  { label: "Nhật Ký Học Viên", page: "TrainerJournalInsights", icon: BookOpen },
  { label: "Trợ Lý AI", page: "TrainerAssistant", icon: Bot },
  { label: "Cài Đặt & Sao Lưu", page: "Settings", icon: SettingsIcon },
];

const CLIENT_PAGES = [
  { label: "Hôm Nay", page: "ClientDashboard", icon: LayoutDashboard },
  { label: "Bài Tập Của Tôi", page: "ClientWorkouts", icon: Dumbbell },
  { label: "Dinh Dưỡng Của Tôi", page: "ClientMeals", icon: Utensils },
  { label: "Tiến Độ Của Tôi", page: "ClientProgress", icon: LineChart },
  { label: "Hồi Phục & Thể Trạng", page: "ClientRecovery", icon: LineChart },
  { label: "Thói Quen", page: "ClientHabits", icon: Calendar },
  { label: "Nhật Ký", page: "ClientJournal", icon: BookOpen },
  { label: "Tài Liệu Của Tôi", page: "ClientDocuments", icon: FileText },
  { label: "Thư Viện Tài Liệu", page: "ClientResources", icon: Library },
  { label: "Tin Nhắn", page: "Messages", icon: MessageSquare },
  { label: "Cài Đặt", page: "Settings", icon: SettingsIcon },
];

/**
 * Global ⌘K / Ctrl+K palette: jump to any page or client without hunting
 * through the sidebar. Client list is only fetched once the palette opens.
 */
export default function CommandPalette({ isClient = false }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("apex:open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("apex:open-command-palette", onOpenEvent);
    };
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ["paletteClients"],
    queryFn: () => base44.entities.Client.list("-created_date", 200),
    enabled: open && !isClient,
    staleTime: 60000,
  });

  const pages = useMemo(() => (isClient ? CLIENT_PAGES : TRAINER_PAGES), [isClient]);

  const go = (fn) => { setOpen(false); setTimeout(fn, 0); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tìm kiếm trang, học viên, thao tác..." />
      <CommandList>
        <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>

        <CommandGroup heading="Đi Đến Trang">
          {pages.map(({ label, page, icon: Icon }) => (
            <CommandItem
              key={page + label}
              value={`${label} ${page}`}
              onSelect={() => go(() => navigate(createPageUrl(page)))}
            >
              <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>

        {!isClient && clients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Học Viên">
              {clients.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.full_name || "Học viên"} ${c.email || ""}`}
                  onSelect={() => go(() => navigate(createPageUrl(`ClientProfile?id=${c.id}`)))}
                >
                  <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{c.full_name || "Học viên chưa đặt tên"}</span>
                  {c.email && (
                    <span className="ml-2 truncate text-xs text-muted-foreground">{c.email}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {!isClient && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tạo Nhanh">
              <CommandItem value="thêm học viên mới onboard" onSelect={() => go(() => navigate(createPageUrl("Clients")))}>
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" /> Thêm học viên mới
              </CommandItem>
              <CommandItem value="tạo giáo án tập mới workout" onSelect={() => go(() => navigate(createPageUrl("Workouts")))}>
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" /> Tạo giáo án tập mới
              </CommandItem>
              <CommandItem value="tạo thực đơn mới meal plan" onSelect={() => go(() => navigate(createPageUrl("Meals")))}>
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" /> Tạo thực đơn mới
              </CommandItem>
              <CommandItem value="đặt lịch hẹn tập mới session booking" onSelect={() => go(() => navigate(createPageUrl("Schedule")))}>
                <Plus className="mr-2 h-4 w-4 text-muted-foreground" /> Đặt lịch hẹn mới
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Giao Diện">
          <CommandItem
            value="chuyển giao diện sáng tối toggle theme dark light mode"
            onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark"
              ? <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
              : <Moon className="mr-2 h-4 w-4 text-muted-foreground" />}
            Chuyển sang chế độ {theme === "dark" ? "Sáng" : "Tối"}
            <CommandShortcut>Giao diện</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
