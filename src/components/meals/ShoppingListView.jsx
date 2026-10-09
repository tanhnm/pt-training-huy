import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Download, Printer, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShoppingListView({ mealPlanId, mealPlanName, onOpenChange }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [customItem, setCustomItem] = useState("");
  const [customItems, setCustomItems] = useState([]);

  React.useEffect(() => {
    if (mealPlanId) {
      fetchShoppingList();
    }
  }, [mealPlanId]);

  const fetchShoppingList = async () => {
    setIsLoading(true);
    try {
      const mealPlans = await base44.entities.MealPlan.filter({ id: mealPlanId });
      if (!mealPlans || mealPlans.length === 0 || !mealPlans[0].meals) {
        setShoppingList([]);
        return;
      }
      
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a shopping list based on the following meals from a meal plan:\n${JSON.stringify(mealPlans[0].meals)}\n\nAggregate identical ingredients and convert units appropriately to make shopping easy in Vietnamese. Return a JSON array of items with 'name' (Vietnamese), 'amount' (number), and 'unit' (string).`,
        response_json_schema: {
          type: "object",
          properties: {
            shoppingList: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  amount: { type: "number" },
                  unit: { type: "string" }
                }
              }
            }
          },
          required: ["shoppingList"]
        }
      });
      setShoppingList(res.shoppingList || []);
      setCheckedItems({});
    } catch (error) {
      console.error('Error generating shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (itemKey) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const addCustomItem = () => {
    if (customItem.trim()) {
      setCustomItems([...customItems, customItem]);
      setCustomItem("");
    }
  };

  const removeCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const listText = [
      `DANH SÁCH MUA SẮM - ${mealPlanName || "Thực Đơn"}`,
      `Khởi tạo ngày: ${new Date().toLocaleDateString('vi-VN')}`,
      "",
      "NGUYÊN LIỆU THEO THỰC ĐƠN:",
      ...shoppingList.map(item => {
        const checked = checkedItems[`${item.fdc_id || item.name}`] ? "✓" : " ";
        return `[${checked}] ${item.name} - ${item.amount} ${item.unit}`;
      }),
      ...(customItems.length > 0 ? ["", "MÓN THÊM TÙY CHỌN:", ...customItems.map(item => `[ ] ${item}`)] : [])
    ].join("\n");

    const blob = new Blob([listText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `danh-sach-di-cho-${mealPlanName || "thuc-don"}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
            Danh Sách Mua Sắm - {mealPlanName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-secondary border-border text-foreground">
                Đã chọn {checkedCount} / {shoppingList.length + customItems.length} món
              </Badge>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="border-border text-foreground hover:bg-secondary">
                  <Printer className="w-4 h-4 mr-2" /> In Danh Sách
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleDownload} className="border-border text-foreground hover:bg-secondary">
                  <Download className="w-4 h-4 mr-2" /> Tải File (.txt)
                </Button>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Nguyên Liệu Thực Đơn</CardTitle>
                <CardDescription className="text-muted-foreground">{shoppingList.length} nguyên liệu được tổng hợp tự động</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {shoppingList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có nguyên liệu nào trong thực đơn này.</p>
                ) : (
                  shoppingList.map((item, idx) => {
                    const itemKey = `${item.fdc_id || item.name}`;
                    const isChecked = checkedItems[itemKey];
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(itemKey)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm ${isChecked ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.amount} {item.unit}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-foreground">Món Thêm Thủ Công</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Thêm món mua sắm khác..."
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomItem} className="border-border text-foreground hover:bg-secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {customItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Checkbox
                        checked={checkedItems[`custom-${idx}`]}
                        onCheckedChange={() => toggleItem(`custom-${idx}`)}
                      />
                      <div className="flex-1">
                        <div className={`text-sm ${checkedItems[`custom-${idx}`] ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                          {item}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomItem(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}