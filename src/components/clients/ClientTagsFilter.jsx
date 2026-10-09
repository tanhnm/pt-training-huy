import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const COMMON_TAGS = [
  { id: "beginner", label: "Mới bắt đầu" },
  { id: "athlete", label: "Vận động viên" },
  { id: "weight loss", label: "Giảm cân" },
  { id: "strength", label: "Tăng cơ / Sức mạnh" },
  { id: "endurance", label: "Sức bền" },
  { id: "flexibility", label: "Dẻo dai" },
  { id: "nutrition", label: "Dinh dưỡng" },
  { id: "injury recovery", label: "Phục hồi chấn thương" },
  { id: "senior", label: "Trung niên" },
  { id: "youth", label: "Thanh thiếu niên" }
];

export default function ClientTagsFilter({ selectedTags, onTagsChange }) {
  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const clearAll = () => onTagsChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Lọc theo thẻ (tags)</h3>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">
            Xóa bộ lọc
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {COMMON_TAGS.map(tag => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Badge
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={cn(
                "cursor-pointer transition-all border text-xs",
                isSelected
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent border-border"
              )}
            >
              {tag.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}