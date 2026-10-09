import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIosPrompt, setIsIosPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed prompt recently
    const dismissedUntil = localStorage.getItem("pwa_prompt_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Check if device is iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    // Check if already installed on iOS
    const isInStandaloneMode = () => {
      return ('standalone' in window.navigator) && window.navigator.standalone;
    };

    // If it's iOS and not already installed, show the iOS specific prompt
    if (isIos() && !isInStandaloneMode()) {
      setIsIosPrompt(true);
      setShowPrompt(true);
    }

    // Android / Chrome standard PWA prompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem("pwa_prompt_dismissed_until", (Date.now() + 7 * 86400000).toString());
    } catch (e) {
      // ignore
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-20 lg:bottom-6 left-4 lg:left-80 max-w-sm w-[calc(100vw-32px)] sm:w-80 shadow-2xl border-emerald-500/30 bg-card/95 backdrop-blur-md z-40 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Cài Đặt Ứng Dụng</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Dùng mượt mà hơn và mở nhanh ngay trên màn hình chính</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isIosPrompt ? (
          <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
            Để cài đặt: bấm nút <strong>Chia sẻ</strong> trên Safari rồi chọn <strong>Thêm vào màn hình chính (Add to Home Screen)</strong>.
          </div>
        ) : (
          <Button onClick={handleInstall} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold shadow-md">
            Cài Đặt Ngay
          </Button>
        )}
      </CardContent>
    </Card>
  );
}