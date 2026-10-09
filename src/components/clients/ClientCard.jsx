import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, MoreVertical, Edit, Trash2, Dumbbell, Eye, Utensils, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
  paused: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
};

const statusLabels = {
  active: "Đang tập",
  inactive: "Hoàn thành",
  paused: "Tạm dừng",
  completed: "Đã hoàn thành"
};

export default function ClientCard({ 
  client, 
  onEdit, 
  onDelete, 
  onViewDetails, 
  onWorkout, 
  onMealPlan 
}) {
  const navigate = useNavigate();

  const handleOpenProfile = () => {
    navigate(createPageUrl("ClientProfile") + "?id=" + client.id);
  };

  return (
    <div 
      onClick={handleOpenProfile}
      className="glass-card rounded-2xl p-5 hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer relative flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-emerald-500/20 shadow-md">
            <AvatarImage src={client.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-foreground text-lg font-black">
              {client.full_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground text-base truncate group-hover:text-emerald-500 transition-colors">
                {client.full_name}
              </h3>
              <Badge className={cn("text-xs border", statusStyles[client.status] || statusStyles.active)}>
                {statusLabels[client.status] || "Đang tập"}
              </Badge>
            </div>
            
            <div className="mt-2 space-y-1">
              {client.email && (
                <a 
                  href={`mailto:${client.email}`} 
                  onClick={e => e.stopPropagation()} 
                  className="flex items-center gap-2 text-xs text-foreground/80 hover:text-emerald-500 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </a>
              )}
              {client.phone && (
                <a 
                  href={`tel:${client.phone}`} 
                  onClick={e => e.stopPropagation()} 
                  className="flex items-center gap-2 text-xs text-foreground/80 hover:text-emerald-500 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{client.phone}</span>
                </a>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground hover:bg-accent -mr-2"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground">
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onViewDetails) onViewDetails(client);
                  else handleOpenProfile();
                }} 
                className="gap-2 font-medium"
              >
                <Eye className="w-4 h-4 text-emerald-500" /> Xem chi tiết hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(client); }} className="gap-2">
                <Edit className="w-4 h-4" /> Sửa thông tin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(createPageUrl("Workouts") + "?client_id=" + client.id); }} className="gap-2">
                <Dumbbell className="w-4 h-4 text-amber-500" /> Xem giáo án
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(createPageUrl("Meals") + "?client_id=" + client.id); }} className="gap-2">
                <Utensils className="w-4 h-4 text-emerald-500" /> Xem thực đơn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(client); }} className="gap-2 text-red-500 focus:text-red-500 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" /> Xóa học viên
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Goals or Notes snippet */}
        {(client.goals || client.fitness_goal) && (
          <p className="mt-3 text-xs text-foreground bg-secondary/70 rounded-xl p-2.5 border border-border line-clamp-2">
            🎯 <strong className="text-foreground">Mục tiêu:</strong> {client.fitness_goal || client.goals}
          </p>
        )}
      </div>

      {/* Prominent CTA Actions */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 h-8"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(client);
            else handleOpenProfile();
          }}
        >
          <Eye className="w-3.5 h-3.5" />
          Xem Chi Tiết
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-xs font-medium text-foreground hover:bg-accent h-8 gap-1 px-2.5"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenProfile();
          }}
        >
          <span>Hồ Sơ</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
}