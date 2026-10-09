import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, Loader2, Video } from "lucide-react";
import { showSuccess } from "@/components/ui/success-toast";

export default function SessionForm({ open, onOpenChange, session, clients, onSubmit }) {
  const [formData, setFormData] = useState(session || {
    client_id: "",
    date: "",
    start_time: "09:00",
    end_time: "10:00",
    type: "personal_training",
    status: "scheduled",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    timeSlots.push(`${hour}:00`, `${hour}:15`, `${hour}:30`, `${hour}:45`);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const selectedClient = clients?.find(c => (c.user_id || c.id) === formData.client_id);
    
    let submitData = {
      ...formData,
      client_name: selectedClient?.full_name || ""
    };
    
    if (formData.type === "video_call" && !formData.video_room_id) {
      submitData.video_room_id = `apex-coach-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    
    await onSubmit(submitData);
    showSuccess(session ? "Cập Nhật Thành Công!" : "Đã Đặt Lịch Hẹn!", session ? "Thay đổi buổi hẹn đã được lưu" : "Buổi tập đã được thêm vào lịch");
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            {session ? "Chỉnh Sửa Buổi Hẹn" : "Đặt Lịch Buổi Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label>Học Viên *</Label>
            <Select value={formData.client_id} onValueChange={(v) => handleChange("client_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn học viên" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.user_id || client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Loại Buổi Hẹn</Label>
            <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal_training">Tập Cá Nhân (1-1)</SelectItem>
                <SelectItem value="group_class">Lớp Nhóm</SelectItem>
                <SelectItem value="assessment">Kiểm Tra Thể Lực</SelectItem>
                <SelectItem value="consultation">Tư Vấn</SelectItem>
                <SelectItem value="video_call">Gọi Trực Tuyến</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Ngày *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="date"
                type="date"
                className="pl-10 block w-full [color-scheme:light] dark:[color-scheme:dark]"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Giờ Bắt Đầu *</Label>
              <Select value={formData.start_time} onValueChange={(v) => handleChange("start_time", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">Giờ Kết Thúc *</Label>
              <Select value={formData.end_time} onValueChange={(v) => handleChange("end_time", v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trạng Thái</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="no_show">Vắng mặt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi Chú</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú buổi tập..."
              className="min-h-[80px]"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {session ? "Lưu Thay Đổi" : "Lên Lịch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}