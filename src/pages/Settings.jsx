import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  User,
  Mail,
  Phone,
  Building,
  Save,
  Camera,
  Bell,
  Key,
  Trash2,
  AlertTriangle,
  MonitorSmartphone,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  Sun,
  Moon,
  Sparkles,
  ExternalLink } from
"lucide-react";
import { storageEngine } from "@/lib/storageEngine";
import { getGeminiApiKey, setGeminiApiKey, getGeminiModel, setGeminiModel } from "@/lib/aiService";
// Beta keys are managed via the BetaKey entity
import { Button } from "@/components/ui/button";
import InstallGuide from "@/components/InstallGuide";
import NotificationSettings from "@/components/NotificationSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { useUnitSystem } from "@/components/hooks/useUnitSystem";
import { useTheme } from "@/components/hooks/useTheme";
import ClientPortalSettings from "@/components/settings/ClientPortalSettings";
import ComplianceSettings from "@/components/settings/ComplianceSettings";
import BillingSettings from "@/components/settings/BillingSettings";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  // Billing is a trainer concern; a trainer who also has a client record still needs it.
  const isTrainer = user?.user_type === "trainer" || user?.role === "admin";
  // Beta-key trainers are comped for life, so billing is irrelevant to them —
  // hide the tab entirely rather than showing a plan they will never buy.
  const isCompedTrainer = !!(
    user?.beta_key_used || user?.data?.beta_key_used ||
    user?.beta_key_verified || user?.data?.beta_key_verified
  );
  const showBilling = isTrainer && !isCompedTrainer;
  const { system, setUnitSystem } = useUnitSystem();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    business_name: "",
    specializations: "",
    require_onboarding_forms: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email_reminders: true,
    session_alerts: true,
    client_updates: false,
    progress_updates: true,
    achievement_alerts: true,
    new_messages: true,
    gamification_alerts: true,
    new_plans: true,
    trainer_feedback: true
  });
  const [betaKey, setBetaKey] = useState("");
  const [betaKeyVerified, setBetaKeyVerified] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [geminiModelVal, setGeminiModelVal] = useState(getGeminiModel());
  const [betaKeyError, setBetaKeyError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        // Check if user is a client
        let isClientUser = userData.role === 'user' && userData.user_type === 'client';
        if (!isClientUser) {
          const clientRecords = await base44.entities.Client.filter({ email: userData.email });
          isClientUser = clientRecords.length > 0;
        }
        setIsClient(isClientUser && userData.role !== 'admin');

        setFormData({
          full_name: userData.data?.full_name || userData.full_name || "",
          phone: userData.data?.phone || userData.phone || "",
          bio: userData.data?.bio || userData.bio || "",
          business_name: userData.data?.business_name || userData.business_name || "",
          specializations: userData.data?.specializations || userData.specializations || "",
          require_onboarding_forms: userData.data?.require_onboarding_forms ?? userData.require_onboarding_forms ?? true,
          payout_method: userData.data?.payout_method || userData.payout_method || "stripe"
        });
        setBetaKeyVerified(userData.data?.beta_key_verified || userData?.beta_key_verified || false);

        const userNotes = userData.data?.notifications || {};
        setNotifications({
          email_reminders: userNotes.email_reminders ?? true,
          session_alerts: userNotes.session_alerts ?? true,
          client_updates: userNotes.client_updates ?? false,
          progress_updates: userNotes.progress_updates ?? true,
          achievement_alerts: userNotes.achievement_alerts ?? true,
          new_messages: userNotes.new_messages ?? true,
          gamification_alerts: userNotes.gamification_alerts ?? true,
          new_plans: userNotes.new_plans ?? true,
          trainer_feedback: userNotes.trainer_feedback ?? true
        });
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadUser();
  }, []);

  const handleNotificationChange = async (field, value) => {
    const newNotifications = { ...notifications, [field]: value };
    setNotifications(newNotifications);
    try {
      await base44.auth.updateMe({ notifications: newNotifications });
    } catch (error) {
      console.error("Failed to update notifications:", error);
      toast.error("Failed to update preferences");
    }
  };

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const json = storageEngine.exportDatabase();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ApexCoach-Backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã tải về tệp sao lưu dữ liệu JSON thành công!");
    } catch (e) {
      toast.error("Lỗi khi xuất dữ liệu: " + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        storageEngine.importDatabase(text);
        toast.success("Khôi phục dữ liệu thành công! Đang làm mới...");
        setTimeout(() => window.location.reload(), 600);
      } catch (err) {
        toast.error("Không thể nhập tệp sao lưu: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm("Bạn có chắc muốn đặt lại toàn bộ dữ liệu về trạng thái mẫu ban đầu?")) {
      storageEngine.resetToDefault();
      toast.success("Đã đặt lại dữ liệu mẫu thành công!");
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving form data:", formData);
      const saveResponse = await base44.auth.updateMe({
        ...formData,
        full_name: formData.full_name // Still try to set root level
      });

      // In Base44, full_name is built-in. If an admin updated data.full_name, we should keep it in sync.
      // We can do this by calling a simple backend function or we just rely on root full_name.
      // Actually, since we updated TrainerManagement to set data.full_name, let's also clear data.full_name here.
      // But we can't do that easily via updateMe since it doesn't allow nested data updates directly.
      // Let's just update the root. It should be fine.
      console.log("Save response:", saveResponse);
      console.log("Update successful");
      const updatedUser = await base44.auth.me();
      console.log("Updated user:", updatedUser);
      setUser(updatedUser);
      setFormData({
      full_name: updatedUser.data?.full_name || updatedUser.full_name || "",
      phone: updatedUser.data?.phone || updatedUser.phone || "",
      bio: updatedUser.data?.bio || updatedUser.bio || "",
      business_name: updatedUser.data?.business_name || updatedUser.business_name || "",
      specializations: updatedUser.data?.specializations || updatedUser.specializations || "",
      require_onboarding_forms: updatedUser.data?.require_onboarding_forms ?? updatedUser.require_onboarding_forms ?? true,
      payout_method: updatedUser.data?.payout_method || updatedUser.payout_method || "stripe"
      });
      window.dispatchEvent(new Event('profileUpdated'));
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings: " + error.message);
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBetaKeyVerify = async () => {
    setBetaKeyError("");
    if (!betaKey.trim()) {
      setBetaKeyError("Please enter a beta key");
      return;
    }

    try {
      const upperKey = betaKey.toUpperCase();
      const keys = await base44.entities.BetaKey.filter({ key: upperKey });

      if (keys.length === 0) {
        setBetaKeyError("Invalid beta key. Please check and try again.");
        return;
      }

      const keyRecord = keys[0];

      if (keyRecord.status === "assigned" && keyRecord.trainer_id && keyRecord.trainer_id !== user.id) {
        setBetaKeyError("This beta key has already been claimed.");
        return;
      }

      await base44.entities.BetaKey.update(keyRecord.id, {
        status: "assigned",
        trainer_id: user.id,
        trainer_email: user.email
      });

      await base44.auth.updateMe({ beta_key_verified: true, beta_key: upperKey });
      setBetaKeyVerified(true);
      setBetaKey("");

      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      window.dispatchEvent(new Event('profileUpdated'));

      toast.success("Beta key verified successfully!");
    } catch (error) {
      console.error(error);
      setBetaKeyError("Failed to verify beta key. Please try again.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadPromise = async () => {
      const res = await base44.integrations.Core.UploadFile({ file });
      const file_url = res.file_url || res.data?.file_url;
      await base44.auth.updateMe({ avatar_url: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      window.dispatchEvent(new Event('profileUpdated'));
    };

    toast.promise(uploadPromise(), {
      loading: 'Uploading photo...',
      success: 'Profile photo updated!',
      error: 'Failed to upload photo'
    });
    
    e.target.value = '';
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadPromise = async () => {
      const res = await base44.integrations.Core.UploadFile({ file });
      const file_url = res.file_url || res.data?.file_url;
      await base44.auth.updateMe({ business_logo_url: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      window.dispatchEvent(new Event('profileUpdated'));
    };

    toast.promise(uploadPromise(), {
      loading: 'Uploading logo...',
      success: 'Business logo updated!',
      error: 'Failed to upload logo'
    });
    
    e.target.value = '';
  };


  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      await base44.auth.deleteMe();
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => {
        base44.auth.logout();
      }, 1500);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account: " + error.message);
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>);

  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cài Đặt & Sao Lưu</h1>
        <p className="text-muted-foreground mt-1">Quản lý hồ sơ huấn luyện viên, giao diện ứng dụng và sao lưu dữ liệu</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="flex justify-center w-full pb-2">
          <TabsList className="bg-secondary border border-border p-1 flex flex-wrap h-auto justify-center w-full sm:w-auto max-w-full gap-1 rounded-xl">
            <TabsTrigger value="profile" className="flex-1 sm:flex-none text-xs sm:text-sm gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Hồ Sơ & Thông Tin
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-1 sm:flex-none text-xs sm:text-sm gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Sao Lưu & Dữ Liệu
            </TabsTrigger>
            <TabsTrigger value="pwa" className="flex-1 sm:flex-none text-xs sm:text-sm gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg">
              <MonitorSmartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Giao Diện & App
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 sm:flex-none text-xs sm:text-sm gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Thông Báo
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ảnh Đại Diện</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                  <AvatarImage src={user.avatar_url || user.data?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-foreground text-2xl font-bold">
                    {(user.data?.full_name || user.full_name)?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{user.data?.full_name || user.full_name || "Huấn Luyện Viên"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">Tải ảnh đại diện để cá nhân hóa hồ sơ làm việc</p>
              </div>
            </div>
          </div>

          {!isClient && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Logo Thương Hiệu / Phòng Gym</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg bg-black">
                    {(user.data?.business_logo_url || user.business_logo_url) ? (
                      <AvatarImage src={user.data?.business_logo_url || user.business_logo_url} className="object-contain" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl">
                        <Building className="w-8 h-8" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-foreground">Logo Xuất Hiện Trên File PDF</p>
                  <p className="text-xs text-muted-foreground mt-1">Logo sẽ được chèn tự động vào góc tiêu đề khi xuất file PDF cho học viên</p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Thông Tin Cá Nhân & Liên Hệ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-foreground space-y-2">
                <Label htmlFor="full_name" className="text-muted-foreground">Họ và Tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                  <Input
                    id="full_name"
                    placeholder="Họ và tên huấn luyện viên"
                    className="pl-10 input-frosted"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)} />
                </div>
              </div>

              <div className="text-foreground space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="pl-10 input-frosted opacity-50" />
                </div>
              </div>

              <div className="text-foreground space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground">Số Điện Thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                  <Input
                    id="phone"
                    placeholder="0912 345 678"
                    className="pl-10 input-frosted"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
              </div>

              {!isClient && (
                <div className="text-foreground space-y-2">
                  <Label htmlFor="business_name" className="text-muted-foreground">Tên Thương Hiệu / Phòng Gym</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                    <Input
                      id="business_name"
                      placeholder="Ví dụ: Apex Fitness Studio"
                      className="pl-10 input-frosted"
                      value={formData.business_name}
                      onChange={(e) => handleChange("business_name", e.target.value)} />
                  </div>
                </div>
              )}

              {!isClient && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="specializations" className="text-muted-foreground">Chuyên Môn Huấn Luyện</Label>
                  <Input
                    id="specializations"
                    placeholder="Ví dụ: Tăng cơ Hypertrophy, Giảm mỡ Fat Loss, Calisthenics, Phục hồi..."
                    className="input-frosted"
                    value={formData.specializations}
                    onChange={(e) => handleChange("specializations", e.target.value)} />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="text-muted-foreground">Giới Thiệu Bản Thân / Triết Lý Huấn Luyện</Label>
                <Textarea
                  id="bio"
                  placeholder="Kinh nghiệm làm việc, chứng chỉ bằng cấp, phương pháp tiếp cận..."
                  className="min-h-[100px] input-frosted"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary">
                  <div>
                    <Label className="text-foreground font-medium text-base">Hệ Thống Đơn Vị Đo</Label>
                    <p className="text-sm text-muted-foreground mt-1">Chọn giữa Hệ Mét (kg/cm) và Hệ Imperial (lbs/inch).</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${system === 'imperial' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>lbs / inch</span>
                    <Switch
                      checked={system === 'metric'}
                      onCheckedChange={(v) => setUnitSystem(v ? 'metric' : 'imperial')}
                    />
                    <span className={`text-sm ${system === 'metric' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>kg / cm</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  console.log("Button clicked!");
                  handleSave();
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-bold"
                disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {!isClient && !betaKeyVerified &&
        <TabsContent value="beta" className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Beta Access Required</h3>
              <p className="text-sm text-foreground mb-6">
                This is a beta feature. Enter your beta key to unlock full access.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="beta_key" className="text-muted-foreground">Beta Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                    <Input
                    id="beta_key"
                    placeholder="e.g., JSMITH-4K7X8Q2P"
                    className="pl-10 uppercase input-frosted"
                    value={betaKey}
                    onChange={(e) => {
                      setBetaKey(e.target.value);
                      setBetaKeyError("");
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleBetaKeyVerify()} />

                  </div>
                  {betaKeyError &&
                <p className="text-sm text-red-600 mt-1">{betaKeyError}</p>
                }
                </div>

                <Button
                onClick={handleBetaKeyVerify}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 w-full">

                  Verify Beta Key
                </Button>
              </div>
            </div>
          </TabsContent>
        }

        {!isClient &&
        <TabsContent value="portal" className="space-y-6">
          <ClientPortalSettings />
        </TabsContent>
        }

        <TabsContent value="notifications" className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tùy Chọn Thông Báo</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Nhắc Nhở Email</p>
                  <p className="text-sm text-muted-foreground">Nhận email nhắc nhở trước các buổi tập</p>
                </div>
                <Switch
                  checked={notifications.email_reminders}
                  onCheckedChange={(v) => handleNotificationChange('email_reminders', v)} />

              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Thông Báo Buổi Tập</p>
                  <p className="text-sm text-muted-foreground">Nhận cảnh báo khi sắp đến giờ tập với học viên</p>
                </div>
                <Switch
                  checked={notifications.session_alerts}
                  onCheckedChange={(v) => handleNotificationChange('session_alerts', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Tin Nhắn Mới</p>
                  <p className="text-sm text-muted-foreground">Thông báo ngay khi có tin nhắn trao đổi mới</p>
                </div>
                <Switch
                  checked={notifications.new_messages}
                  onCheckedChange={(v) => handleNotificationChange('new_messages', v)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Huy Hiệu & Cột Mốc</p>
                  <p className="text-sm text-muted-foreground">Thông báo khi đạt cấp độ mới hoặc mở khóa huy hiệu</p>
                </div>
                <Switch
                  checked={notifications.gamification_alerts}
                  onCheckedChange={(v) => handleNotificationChange('gamification_alerts', v)} />
              </div>

              {isClient && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">New Plans</p>
                      <p className="text-sm text-foreground">Get notified when your trainer assigns a new plan</p>
                    </div>
                    <Switch
                      checked={notifications.new_plans}
                      onCheckedChange={(v) => handleNotificationChange('new_plans', v)} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Trainer Feedback</p>
                      <p className="text-sm text-foreground">Notifications when your trainer leaves feedback</p>
                    </div>
                    <Switch
                      checked={notifications.trainer_feedback}
                      onCheckedChange={(v) => handleNotificationChange('trainer_feedback', v)} />
                  </div>
                </>
              )}
              {!isClient && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Cập Nhật Từ Học Viên</p>
                      <p className="text-sm text-muted-foreground">Thông báo khi học viên cập nhật thông tin cá nhân</p>
                    </div>
                    <Switch
                      checked={notifications.client_updates}
                      onCheckedChange={(v) => handleNotificationChange('client_updates', v)} />

                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Tiến Độ & Chỉ Số</p>
                      <p className="text-sm text-muted-foreground">Thông báo khi học viên ghi nhận cột mốc chỉ số mới</p>
                    </div>
                    <Switch
                      checked={notifications.progress_updates}
                      onCheckedChange={(v) => handleNotificationChange('progress_updates', v)} />

                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Cột Mốc Thành Tích</p>
                      <p className="text-sm text-muted-foreground">Chúc mừng khi học viên hoàn thành mục tiêu tập luyện</p>
                    </div>
                    <Switch
                      checked={notifications.achievement_alerts}
                      onCheckedChange={(v) => handleNotificationChange('achievement_alerts', v)} />

                  </div>
                </>
              )}
                </div>
                </div>
                <div className="mt-6">
                  <NotificationSettings />
                </div>
                </TabsContent>

        <TabsContent value="pwa" className="space-y-6">
          {/* Appearance */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">Giao Diện & Màu Sắc</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chọn giao diện hiển thị cho ApexCoach trên thiết bị này. "Theo Hệ Thống" sẽ tự động đồng bộ theo chế độ sáng/tối của máy bạn.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { value: "light", label: "Sáng", Icon: Sun },
                { value: "dark", label: "Tối", Icon: Moon },
                { value: "system", label: "Hệ Thống", Icon: MonitorSmartphone },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                    theme === value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Mẹo: Nhấn tổ hợp phím <kbd className="px-1 py-0.5 rounded border border-border bg-secondary">Ctrl</kbd>
              {" + "}<kbd className="px-1 py-0.5 rounded border border-border bg-secondary">K</kbd> ở bất kỳ đâu
              để mở thanh tìm kiếm nhanh và chuyển đổi giao diện tức thì.
            </p>
          </div>

          <InstallGuide />
        </TabsContent>

        {showBilling && (
          <TabsContent value="billing" className="space-y-6">
            <BillingSettings />
          </TabsContent>
        )}

        {!isClient && (
          <TabsContent value="compliance" className="space-y-6">
            <ComplianceSettings />
          </TabsContent>
        )}

        <TabsContent value="account" className="space-y-6">
          {/* Google Gemini AI Configuration */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Cấu Hình Google Gemini AI & Trợ Lý Tự Động</h3>
                <p className="text-xs text-muted-foreground">Tự động tạo học viên, giáo án và thực đơn chỉ với một tin nhắn</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="gemini_key" className="text-xs font-semibold text-foreground">Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="gemini_key"
                    type="password"
                    placeholder="Dán API Key (AIzaSy...)"
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="font-mono text-xs flex-1 input-frosted"
                  />
                  <Button
                    onClick={() => {
                      setGeminiApiKey(geminiKeyInput);
                      setGeminiModel(geminiModelVal);
                      toast.success("Đã lưu cấu hình Google Gemini API thành công!");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs whitespace-nowrap"
                  >
                    Lưu Key
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Trạng thái: {geminiKeyInput ? <strong className="text-emerald-400 font-semibold">Đã cấu hình ✨</strong> : <span className="text-blue-400">Đang dùng chế độ tự động nội bộ (Miễn phí)</span>}</span>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Lấy key miễn phí tại Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right of access — download everything we hold on this account */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Sao Lưu & Khôi Phục Dữ Liệu (Backup & Restore)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Toàn bộ danh sách học viên, giáo án, thực đơn và lịch sử tiến độ được lưu trực tiếp trên thiết bị của bạn.
              Bạn có thể tải về tệp JSON để sao lưu hoặc chuyển đổi sang thiết bị khác bất cứ lúc nào.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportData} disabled={isExporting} className="gap-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExporting ? "Đang xuất..." : "Tải Bản Sao Lưu (.json)"}
              </Button>

              <label className="cursor-pointer">
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                <Button variant="outline" asChild className="gap-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10">
                  <span>
                    <Upload className="w-4 h-4" />
                    Khôi Phục Bản Sao Lưu (.json)
                  </span>
                </Button>
              </label>

              <Button variant="ghost" onClick={handleResetData} className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800">
                <RefreshCw className="w-4 h-4" />
                Đặt Lại Dữ Liệu Mẫu
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-400">Vùng Nguy Hiểm</p>
                <p className="text-sm text-red-300">Xóa dữ liệu tài khoản là vĩnh viễn và không thể khôi phục</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">Xóa Toàn Bộ Dữ Liệu</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Khi bạn xóa dữ liệu, toàn bộ danh sách học viên, giáo án, thực đơn, chỉ số tiến độ và tin nhắn sẽ được dọn sạch khỏi thiết bị này. Hành động này không thể hoàn tác, vui lòng tải bản sao lưu JSON ở trên trước nếu bạn cần lưu lại.
            </p>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 font-bold">

              <Trash2 className="w-4 h-4" />
              Xóa Dữ Liệu Khỏi Máy
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-card border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Bạn có chắc chắn muốn xóa không?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-muted-foreground">
              <p>Thao tác này sẽ dọn sạch toàn bộ dữ liệu đang lưu trữ trên máy bạn bao gồm:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-foreground">
                <li>Hồ sơ học viên và lịch sử chỉ số cơ thể</li>
                <li>Toàn bộ giáo án tập luyện và thực đơn dinh dưỡng</li>
                <li>Lịch hẹn và các ghi chú huấn luyện</li>
              </ul>
              <p className="font-semibold text-red-400 mt-4">Hành động này không thể hoàn tác.</p>
              <div className="space-y-2 mt-4 text-left">
                <Label htmlFor="delete-confirm" className="text-foreground">Nhập chữ XOA để xác nhận</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="XOA"
                  className="uppercase input-frosted border-red-500/30 focus:border-red-500 text-foreground" />

              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmText("");
            }} className="bg-secondary text-foreground hover:bg-accent border-0">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "XOA" && deleteConfirmText !== "DELETE" || isDeleting}
              className="bg-red-600 hover:bg-red-700">

              {isDeleting ? "Đang xóa..." : "Xác Nhận Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}