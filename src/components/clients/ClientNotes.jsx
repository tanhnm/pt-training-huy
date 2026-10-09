import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  general: { label: "Chung", className: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30" },
  medical: { label: "Y tế & Chấn thương", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" },
  progress: { label: "Tiến độ & Kết quả", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  goal: { label: "Mục tiêu tập luyện", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  session: { label: "Buổi tập / Thực chiến", className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30" }
};

export default function ClientNotes({ clientId, trainerId }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [category, setCategory] = useState("general");
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ["clientNotes", clientId],
    queryFn: () => base44.entities.ClientNote.filter({ client_id: clientId }, "-created_date"),
    enabled: !!clientId,
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.ClientNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientNotes"] });
      setNewNote("");
      setCategory("general");
      setIsAdding(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clientNotes"] }),
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    createNoteMutation.mutate({
      client_id: clientId,
      trainer_id: trainerId,
      content: newNote,
      category
    });
  };

  return (
    <Card className="glass-card border-border shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Ghi Chú Học Viên
          </CardTitle>
          <Button
            size="sm"
            variant={isAdding ? "outline" : "default"}
            onClick={() => setIsAdding(!isAdding)}
            className={!isAdding ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold" : "border-border text-foreground"}
          >
            {isAdding ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Hủy
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Thêm Ghi Chú
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="space-y-3 p-4 bg-secondary/50 border border-border rounded-xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Phân loại ghi chú</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="hover:bg-accent cursor-pointer">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Nội dung ghi chú</label>
              <Textarea
                placeholder="Nhập chi tiết ghi chú, dặn dò hoặc lưu ý về học viên..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px] bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="border-border text-foreground">
                Hủy
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddNote}
                disabled={!newNote.trim() || createNoteMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold"
              >
                <Check className="w-4 h-4 mr-1" />
                Lưu Ghi Chú
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => {
              const cfg = categoryConfig[note.category] || categoryConfig.general;
              return (
                <div key={note.id} className="p-4 bg-card rounded-xl border border-border shadow-sm space-y-2.5 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={cn("text-xs font-medium border", cfg.className)}>
                      {cfg.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      title="Xóa ghi chú"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {new Date(note.created_date).toLocaleDateString('vi-VN', { 
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Chưa có ghi chú nào. Hãy thêm ghi chú để lưu lại thông tin quan trọng của học viên.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}