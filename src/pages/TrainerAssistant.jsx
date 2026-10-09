import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Send, User, Loader2, Plus, MessageSquare, Zap, ChevronRight, Dumbbell, Utensils, TrendingUp, Calendar,
  Key, ExternalLink, FileDown, ShieldCheck, Trash2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WorkoutPdfModal from "@/components/pdf/WorkoutPdfModal";
import MealPlanPdfModal from "@/components/pdf/MealPlanPdfModal";
import { getGeminiApiKey, setGeminiApiKey, getGeminiModel, setGeminiModel } from "@/lib/aiService";

// Interactive Action Card rendered inside AI responses
const ActionCard = ({ item, onOpenWorkoutPdf, onOpenMealPdf }) => {
  const navigate = useNavigate();

  if (!item || !item.item) return null;
  const data = item.item;

  if (item.type === 'client') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base flex-shrink-0">
            {data.full_name?.[0] || 'H'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground truncate">{data.full_name}</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-[10px] py-0">Đã tạo</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {data.age ? `${data.age} tuổi · ` : ''}{data.weight ? `${data.weight}kg · ` : ''}{data.fitness_goal || 'Học viên mới'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(createPageUrl(`ClientProfile?id=${data.id}`))}
          className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs w-full sm:w-auto"
        >
          <User className="w-3.5 h-3.5 mr-1.5" /> Xem Hồ Sơ
        </Button>
      </div>
    );
  }

  if (item.type === 'workout_plan') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground truncate">{data.name}</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px] py-0">Giáo Án</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {data.days_per_week || Object.keys(data.daily_exercises || {}).length} buổi/tuần · Độ khó: {data.difficulty || 'Cơ bản'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={() => onOpenWorkoutPdf(data)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs flex-1 sm:flex-none font-semibold shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" /> Xuất PDF Gửi Zalo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(createPageUrl("Workouts"))}
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 text-xs flex-1 sm:flex-none"
          >
            Chi Tiết
          </Button>
        </div>
      </div>
    );
  }

  if (item.type === 'meal_plan') {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground truncate">{data.name}</span>
              <Badge className="bg-amber-500/20 text-amber-400 border-0 text-[10px] py-0">Thực Đơn</Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {data.calories_target} kcal · Đạm: {data.protein_target_g}g · Carb: {data.carbs_target_g}g · Béo: {data.fat_target_g}g
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={() => onOpenMealPdf(data)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs flex-1 sm:flex-none font-semibold shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5" /> Xuất PDF Gửi Zalo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(createPageUrl("Meals"))}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs flex-1 sm:flex-none"
          >
            Chi Tiết
          </Button>
        </div>
      </div>
    );
  }

  if (item.type === 'progress') {
    return (
      <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Ghi Nhận Chỉ Số: {data.weight} kg</div>
            <p className="text-xs text-muted-foreground">
              {data.body_fat ? `Tỉ lệ mỡ: ${data.body_fat}% · ` : ''}Ngày: {data.date}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(createPageUrl(`Progress?clientId=${data.client_id}`))}
          className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-xs"
        >
          Xem Tiến Độ
        </Button>
      </div>
    );
  }

  if (item.type === 'session') {
    return (
      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Lịch Hẹn: {data.start_time} - {data.end_time}</div>
            <p className="text-xs text-muted-foreground">Ngày {data.date} · {data.client_name}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(createPageUrl("Schedule"))}
          className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs"
        >
          Xem Lịch
        </Button>
      </div>
    );
  }

  return null;
};

// Message Bubble
const MessageBubble = ({ message, onOpenWorkoutPdf, onOpenMealPdf }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn("max-w-[85%] sm:max-w-[80%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium" : "glass-card border border-border text-foreground"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="space-y-3">
                <ReactMarkdown
                  className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5"
                >
                  {message.content}
                </ReactMarkdown>

                {/* Render interactive action cards if items were created */}
                {message.createdItems && Array.isArray(message.createdItems) && message.createdItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Dữ liệu đã tự động tạo vào hệ thống:
                    </p>
                    {message.createdItems.map((item, iIdx) => (
                      <ActionCard
                        key={iIdx}
                        item={item}
                        onOpenWorkoutPdf={onOpenWorkoutPdf}
                        onOpenMealPdf={onOpenMealPdf}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5 border border-border">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default function TrainerAssistant() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("all");

  // API Key settings modal
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey());
  const [selectedModel, setSelectedModelState] = useState(getGeminiModel());
  const [hasApiKey, setHasApiKey] = useState(!!getGeminiApiKey());

  // PDF Preview Modals
  const [activeWorkoutPdf, setActiveWorkoutPdf] = useState(null);
  const [activeMealPdf, setActiveMealPdf] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const [convos, clientList] = await Promise.all([
        base44.agents.listConversations({ agent_name: "trainer_assistant" }),
        base44.entities.Client.list()
      ]);
      setConversations(convos || []);
      setClients(clientList || []);

      // If conversations exist, pick the newest or create a fresh default conversation
      if (convos && convos.length > 0) {
        selectConversation(convos[0]);
      } else {
        await startNewChat();
      }
    } catch (e) {
      console.error("Error loading assistant data:", e);
    }
  };

  const startNewChat = async (targetClientId = null) => {
    let clientName = "Chung";
    let clientId = null;

    if (targetClientId && targetClientId !== "all") {
      const c = clients.find(cl => cl.id === targetClientId);
      if (c) {
        clientName = c.full_name;
        clientId = c.id;
      }
    }

    try {
      const convo = await base44.agents.createConversation({
        agent_name: "trainer_assistant",
        metadata: {
          name: targetClientId && targetClientId !== "all" ? `Học viên: ${clientName}` : "Hội thoại mới",
          client_id: clientId,
          client_name: clientName
        }
      });

      // Default welcome message from AI
      convo.messages = [
        {
          role: "assistant",
          content: `👋 **Xin chào Coach!** Tôi là **Trợ Lý AI Toàn Năng (ApexCoach AI)**.\n\n` +
            `Bạn chỉ cần **nhắn tin bất kỳ yêu cầu nào**, tôi sẽ tự động thiết lập và lưu dữ liệu ngay lập tức:\n\n` +
            `• 👤 **Tạo học viên mới**: *"Tạo học viên Trần Văn Nam 28 tuổi, nam, nặng 75kg, mục tiêu giảm mỡ"*\n` +
            `• 🏋️ **Lên giáo án tập luyện**: *"Tạo giáo án tăng cơ 4 buổi Push Pull Legs cho Nam"*\n` +
            `• 🥗 **Lên thực đơn dinh dưỡng**: *"Lên thực đơn 2000 calo giàu đạm cho Nam"*\n` +
            `• 🎯 **Tạo trọn gói 1-chạm**: *"Tạo học viên Lê Thị Mai 26 tuổi và tạo luôn giáo án 3 buổi + thực đơn 1600 calo"*\n` +
            `• 📈 **Ghi nhận cân nặng**: *"Hôm nay Nam cân được 73kg, mỡ 19%"*\n\n` +
            `Bạn muốn thực hiện thao tác gì hôm nay?`,
          ts: new Date().toISOString()
        }
      ];

      await base44.entities.AgentConversation.update(convo.id, { messages: convo.messages });

      const updatedConvos = await base44.agents.listConversations({ agent_name: "trainer_assistant" });
      setConversations(updatedConvos);
      selectConversation(convo);
    } catch (e) {
      console.error("Error starting new chat:", e);
      toast.error("Không thể khởi tạo cuộc trò chuyện mới");
    }
  };

  const selectConversation = (convo) => {
    setSelectedConversation(convo);
    setMessages(convo.messages || []);

    if (window.currentUnsubscribe) {
      window.currentUnsubscribe();
    }

    window.currentUnsubscribe = base44.agents.subscribeToConversation(convo.id, (data) => {
      setMessages(data.messages || []);
    });
  };

  const sendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !selectedConversation || loading) return;

    if (!customText) setInputMessage("");
    setLoading(true);

    try {
      await base44.agents.addMessage(selectedConversation, {
        role: "user",
        content: textToSend.trim()
      });
    } catch (e) {
      console.error("Failed to send message:", e);
      toast.error("Gửi tin nhắn thất bại");
    }
    setLoading(false);
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    setGeminiModel(selectedModel);
    setHasApiKey(!!apiKeyInput.trim());
    setApiKeyModalOpen(false);
    toast.success("Đã lưu cấu hình Google Gemini API thành công!");
  };

  // Quick Chips prompts for 1-click execution
  const QUICK_PROMPTS = [
    { label: "➕ Tạo học viên mới", text: "Tạo học viên Trần Văn Nam, 26 tuổi, nam, nặng 74kg, mục tiêu giảm mỡ thừa và săn chắc cơ thể" },
    { label: "🏋️ Giáo án 4 buổi", text: "Tạo giáo án tăng cơ 4 buổi Push Pull Legs Upper với các bài tập chuẩn tiếng Anh cho học viên" },
    { label: "🥗 Thực đơn 2000 calo", text: "Tạo thực đơn dinh dưỡng 2000 calo giàu protein chia làm 4 bữa một ngày" },
    { label: "🎯 Tạo trọn gói (Học viên + Giáo án + Thực đơn)", text: "Tạo học viên Lê Thị Thu, 25 tuổi, nữ, giảm mỡ. Tạo luôn giáo án 3 buổi Full Body và thực đơn 1600 calo cho bạn ấy" },
    { label: "📈 Ghi nhận cân nặng", text: "Ghi nhận hôm nay học viên cân nặng 72.5kg, tỉ lệ mỡ 19%, vòng eo 82cm" },
    { label: "📅 Đặt lịch tập 1-1", text: "Đặt lịch tập cá nhân 1-1 cho học viên vào ngày mai lúc 09:00 đến 10:00" },
  ];

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col lg:flex-row gap-4">
      {/* Sidebar: Conversation List & Client Filter */}
      <div className="w-full lg:w-80 glass-card rounded-2xl flex flex-col overflow-hidden flex-shrink-0 border border-border">
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground">ApexCoach AI</h2>
              <p className="text-[11px] text-muted-foreground">Tự động tạo mọi dữ liệu</p>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setApiKeyModalOpen(true)}
            title="Cài đặt Gemini API Key"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Key className="w-4 h-4" />
          </Button>
        </div>

        {/* API Status Banner */}
        <div className="px-4 py-2 bg-accent/40 border-b border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Chế độ AI:</span>
          {hasApiKey ? (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] py-0 cursor-pointer" onClick={() => setApiKeyModalOpen(true)}>
              ✨ Gemini {selectedModel.includes('2.5') ? '2.5' : 'Flash'}
            </Badge>
          ) : (
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] py-0 cursor-pointer" onClick={() => setApiKeyModalOpen(true)}>
              ⚡ Tự Động Nội Bộ
            </Badge>
          )}
        </div>

        {/* New Chat & Client Context Selector */}
        <div className="p-3 border-b border-border space-y-2 bg-card">
          <Select value={selectedClientId} onValueChange={(val) => { setSelectedClientId(val); startNewChat(val); }}>
            <SelectTrigger className="h-9 text-xs bg-secondary border-border text-foreground">
              <SelectValue placeholder="Chọn học viên (hoặc Chung)..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all">💬 Cuộc trò chuyện chung (Tất cả)</SelectItem>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  👤 {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => startNewChat(selectedClientId)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm text-xs h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tạo Đoạn Chat Mới
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Chưa có đoạn chat nào
            </div>
          ) : (
            conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => selectConversation(convo)}
                className={cn(
                  "w-full text-left p-2.5 rounded-xl transition-all text-xs border flex items-center justify-between",
                  selectedConversation?.id === convo.id
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold"
                    : "bg-secondary/40 border-transparent hover:border-border hover:bg-accent text-foreground"
                )}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="truncate font-medium">{convo.metadata?.name || "Cuộc trò chuyện"}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{convo.metadata?.client_name || "Chung"}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border border-border">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-secondary/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                {selectedConversation?.metadata?.name || "ApexCoach AI"}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sẵn sàng tạo học viên, giáo án & thực đơn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApiKeyModalOpen(true)}
              className="text-xs border-border h-8 gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{hasApiKey ? "Cấu Hình API Key" : "Nhập Gemini Key"}</span>
            </Button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {messages.map((message, idx) => (
            <MessageBubble
              key={idx}
              message={message}
              onOpenWorkoutPdf={(routine) => setActiveWorkoutPdf(routine)}
              onOpenMealPdf={(plan) => setActiveMealPdf(plan)}
            />
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="glass-card border border-border rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>AI đang phân tích và tự động khởi tạo dữ liệu...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-border/40 bg-secondary/30 overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Gợi ý nhanh:
          </span>
          {QUICK_PROMPTS.map((chip, cIdx) => (
            <button
              key={cIdx}
              onClick={() => sendMessage(chip.text)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-card hover:bg-accent border border-border hover:border-emerald-500/40 text-foreground whitespace-nowrap transition-colors flex-shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập yêu cầu: Ví dụ 'Tạo học viên Nguyễn Văn A 28t, giảm mỡ, tạo giáo án 4 buổi và thực đơn 2000 calo'..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={loading}
              className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-sm h-11"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 h-11 shadow-md"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Gemini API Key Configuration Modal */}
      <Dialog open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5 text-emerald-400" /> Cài Đặt Google Gemini API
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kết nối trực tiếp với Google Gemini để AI tự động thiết kế bài tập, tính toán calo và tạo dữ liệu thông minh nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Gemini API Key</label>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Chưa có key? Lấy miễn phí trong 10 giây tại:</span>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Mô Hình AI (Model)</label>
              <Select value={selectedModel} onValueChange={setSelectedModelState}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">gemini-2.5-flash (Khuyên dùng - Nhanh & Chuẩn xác)</SelectItem>
                  <SelectItem value="gemini-3.8-flash">gemini-3.8-flash (Model mới)</SelectItem>
                  <SelectItem value="gemini-1.5-flash">gemini-1.5-flash (Dự phòng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Hoạt động an toàn 100%
              </div>
              <p className="text-[11px] text-muted-foreground">
                API Key của bạn chỉ được lưu trên trình duyệt của máy bạn (Local Storage) và không bao giờ gửi về bất kỳ máy chủ trung gian nào. Nếu không nhập key, hệ thống vẫn dùng bộ máy tự động nội bộ để tạo dữ liệu!
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {hasApiKey && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setApiKeyInput("");
                  setGeminiApiKey("");
                  setHasApiKey(false);
                  setApiKeyModalOpen(false);
                  toast.success("Đã xóa API Key");
                }}
                className="text-xs mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa Key
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApiKeyModalOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveApiKey}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              Lưu Cấu Hình
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Modals directly in the chat view */}
      {activeWorkoutPdf && (
        <WorkoutPdfModal
          open={!!activeWorkoutPdf}
          onOpenChange={(open) => !open && setActiveWorkoutPdf(null)}
          routine={activeWorkoutPdf}
        />
      )}

      {activeMealPdf && (
        <MealPlanPdfModal
          open={!!activeMealPdf}
          onOpenChange={(open) => !open && setActiveMealPdf(null)}
          mealPlan={activeMealPdf}
        />
      )}
    </div>
  );
}