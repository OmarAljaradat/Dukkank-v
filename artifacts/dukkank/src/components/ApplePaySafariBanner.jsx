import React, { useState } from "react";
import { useStoreData } from "../contexts/DataContext";
import { Copy, Check, Compass } from "lucide-react";
import { toast } from "sonner";

export function ApplePaySafariBanner({ compact = false }) {
  const { promo } = useStoreData();
  const notice = promo?.applePayNotice || {
    enabled: true,
    title: "تنبيه الدفع السريع عبر Apple Pay ",
    subtitle: "للدفع المباشر السلس عبر Apple Pay، يرجى فتح المتجر في متصفح Safari. إذا كنت تتصفح من انستغرام، انسخ الرابط وافتحه بسفاري.",
    buttonText: "📋 نسخ رابط المتجر لـ Safari"
  };

  const [copied, setCopied] = useState(false);

  // If disabled by Admin in MarketingTab, DO NOT RENDER!
  if (notice.enabled === false) return null;

  const handleCopyLink = () => {
    const storeUrl = typeof window !== "undefined" ? window.location.href : "https://dukkank.com";
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("تم نسخ رابط المتجر! افتحه في Safari للدفع عبر Apple Pay ");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="my-3 p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg dir-rtl text-right space-y-3 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Authentic Apple Pay Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Authentic Black Apple Pay Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-black border border-white/20 text-white flex items-center justify-center font-black text-sm tracking-tight shadow-md shrink-0 select-none">
            <span className="text-base leading-none font-bold mr-0.5"></span> Pay
          </div>

          <div className="leading-tight">
            <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>{notice.title || "تنبيه الدفع السريع عبر Apple Pay"}</span>
            </h4>
            <span className="text-[10px] font-bold text-amber-400">متصفح Safari مطلوب 🧭</span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4" />
        </div>
      </div>

      {/* Notice Message */}
      <p className="text-xs text-slate-300 font-medium leading-relaxed bg-white/5 p-2.5 rounded-2xl border border-white/10">
        {notice.subtitle || "لإتاحة الدفع المباشر عبر Apple Pay يرجى التأكد من تصفّح المتجر عبر متصفح Safari."}
      </p>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-800" />}
        <span>{copied ? "تم النسخ بنجاح! افتحه في Safari" : (notice.buttonText || "📋 نسخ رابط المتجر لـ Safari")}</span>
      </button>
    </div>
  );
}
