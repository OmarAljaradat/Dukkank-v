import React, { useState, useEffect } from "react";
import { useStoreData } from "../contexts/DataContext";
import { Gift, X, Sparkles, Copy, Check, ShoppingBag, Flame } from "lucide-react";
import { toast } from "sonner";

export function OfferPopupModal() {
  const { promo } = useStoreData();
  const popup = promo?.popupModal || {
    enabled: false,
    title: "🎁 هدية خاصة لزيارتك الأولى!",
    description: "احصل على خصم 10% فوري على طلبتك الأولى بمتجر دُكانك 🎮",
    code: "WELCOME10",
    discount: 10,
    buttonText: "تفعيل الخصم 🚀",
    delaySeconds: 3
  };

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!popup.enabled) return;
    try {
      const dismissed = sessionStorage.getItem("dukkank_dismissed_popup_modal");
      if (dismissed === "true") return;
    } catch {}

    const timer = setTimeout(() => {
      setOpen(true);
    }, (popup.delaySeconds || 3) * 1000);

    return () => clearTimeout(timer);
  }, [popup.enabled, popup.delaySeconds]);

  if (!open || !popup.enabled) return null;

  const handleClose = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("dukkank_dismissed_popup_modal", "true");
    } catch {}
  };

  const handleCopyCode = () => {
    if (!popup.code) return;
    navigator.clipboard.writeText(popup.code);
    setCopied(true);
    toast.success(`تم نسخ كود الخصم (${popup.code}) بنجاح 🎉!`);
    setTimeout(() => {
      setCopied(false);
      handleClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 dir-rtl text-right">
      <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-white/20 p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300">
        {/* Top glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Gift className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
              <span>{popup.title}</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed px-4">
              {popup.description}
            </p>
          </div>
        </div>

        {/* Coupon Code Display Box */}
        {popup.code && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <div className="text-[11px] font-bold text-amber-300">رمز الكوبون الخاص بك:</div>
            <div className="text-2xl font-black font-mono text-amber-400 tracking-widest">{popup.code}</div>
            {popup.discount && (
              <div className="text-[11px] text-emerald-400 font-bold">يمنحك خصماً فورياً بقيمة {popup.discount}% عند إتمام طلبك!</div>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleCopyCode}
            className="w-full h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "تم النسخ بنجاح!" : (popup.buttonText || "تفعيل الخصم 🚀")}</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-200 py-1"
          >
            شكراً، تصفّح المنتجات بدون خصم
          </button>
        </div>
      </div>
    </div>
  );
}
