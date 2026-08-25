import { useState, useEffect } from "react";
import { Gift, MessageCircle, CheckCircle2, Clock, Phone, User, Sparkles, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function GiftsTab() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);

    const STORAGE_KEY = "dukkank_admin_gifts";

    useEffect(() => {
        loadGifts();
    }, []);

    const loadGifts = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setGifts(JSON.parse(saved));
            } else {
                // Demo seed gifts if empty
                const demoGifts = [
                    {
                        id: "GFT-90812",
                        orderId: "DK-90812",
                        senderName: "أحمد العتيبي",
                        senderEmail: "ahmed@gmail.com",
                        recipientName: "عبدالله الشمري",
                        recipientPhone: "966501234567",
                        gameTitle: "EA Sports FC 26 — PS5 Edition",
                        price: 22.98,
                        theme: "عيد ميلاد 🎂",
                        message: "كل عام وأنت بخير يا أسطورة! تستاهل أطلق لعبة 🎂🎮",
                        status: "pending", // pending | fulfilled
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: "GFT-81723",
                        orderId: "DK-81723",
                        senderName: "سارة خالد",
                        senderEmail: "sara@gmail.com",
                        recipientName: "نورة علي",
                        recipientPhone: "966509876543",
                        gameTitle: "PlayStation Plus Extra — 12 Month",
                        price: 42.00,
                        theme: "تخرج 🎓",
                        message: "ألف مبروك النجاح والتخرج! 🎓🔥",
                        status: "fulfilled",
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    }
                ];
                setGifts(demoGifts);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(demoGifts));
            }
        } catch (e) {
            console.error("Load gifts error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = (giftId) => {
        const updated = gifts.map((g) => {
            if (g.id === giftId) {
                const nextStatus = g.status === "pending" ? "fulfilled" : "pending";
                toast.success(`تم تحديث حالة الهدية إلى: ${nextStatus === "fulfilled" ? "تم التفعيل والإرسال 🟢" : "قيد المعالجة 🟡"}`);
                return { ...g, status: nextStatus };
            }
            return g;
        });
        setGifts(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleDelete = (giftId) => {
        if (!confirm("هل أنت تأكد من حذف سجل هذه الهدية؟")) return;
        const updated = gifts.filter((g) => g.id !== giftId);
        setGifts(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        toast.info("تم حذف سجل الهدية");
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-pink-900 via-rose-950 to-slate-950 text-white p-6 sm:p-7 rounded-3xl border border-pink-500/20 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-pink-500/20 border border-pink-400/30 text-pink-300">
                                <Gift className="w-5 h-5" />
                            </span>
                            <h2 className="text-xl font-black tracking-tight">إدارة طلبات الهدايا الرقمية 🎁</h2>
                        </div>
                        <p className="text-xs text-pink-200/80 font-medium">
                            متابعة هدايا العملاء للأصدقاء والتفعيل المباشر عبر الواتساب
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1 rounded-full bg-white/10 text-white text-xs font-black border border-white/15">
                            إجمالي الهدايا: {gifts.length}
                        </span>
                        <button
                            onClick={loadGifts}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="تحديث البيانات"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* List Table/Cards */}
            {gifts.length === 0 ? (
                <div className="bg-white dark:bg-white/[0.04] rounded-3xl p-12 text-center border border-[hsl(var(--brand-ink))]/10 space-y-3">
                    <Gift className="w-12 h-12 text-pink-300 mx-auto" />
                    <p className="font-extrabold text-base">لا توجد طلبات هدايا حالياً</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {gifts.map((gift) => {
                        const isFulfilled = gift.status === "fulfilled";
                        const waMsg = `أهلاً بك أخي ${gift.recipientName} 👋✨\nوصلتك هدية رقمية مميزة من صديقك (${gift.senderName}) بمناسبة (${gift.theme}) 🎁\n\nالمنتج: *${gift.gameTitle}*\nالرسالة: "${gift.message}"\n\nيرجى فتح جهازي السوني وتزويدنا بصورة الـ QR Code لنقوم بتفعيل اللعبة في جهازك فوراً! 🎮`;

                        return (
                            <div
                                key={gift.id}
                                className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                            >
                                {/* Top Bar */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 font-black flex items-center justify-center text-sm border border-pink-500/20">
                                            🎁
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm text-[hsl(var(--brand-ink))]">
                                                    {gift.id}
                                                </span>
                                                <span className="text-xs text-[hsl(var(--brand-ink))]/40">
                                                    (طلب: {gift.orderId || "مستقل"})
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                                    isFulfilled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                }`}>
                                                    {isFulfilled ? "تم التفعيل والإرسال 🟢" : "قيد المعالجة 🟡"}
                                                </span>
                                            </div>
                                            <div className="text-xs text-[hsl(var(--brand-ink))]/50 font-semibold mt-0.5">
                                                المناسبة: {gift.theme} • السعر: ${gift.price?.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Toggle */}
                                    <button
                                        onClick={() => handleStatusToggle(gift.id)}
                                        className={`px-3.5 h-9 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors shrink-0 ${
                                            isFulfilled
                                                ? "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100"
                                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                                        }`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{isFulfilled ? "إعادة لـ قيد الانتظار 🟡" : "تحديد كـ تم التفعيل 🟢"}</span>
                                    </button>
                                </div>

                                {/* Sender -> Recipient Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Sender Details */}
                                    <div className="bg-[hsl(var(--brand-cream))]/40 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-[hsl(var(--brand-ink))]/5 space-y-1">
                                        <div className="text-xs font-black text-[hsl(var(--brand-ink))]/70 flex items-center gap-1">
                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                            <span>المُهدي (العميل):</span>
                                        </div>
                                        <div className="text-xs font-bold text-[hsl(var(--brand-ink))]">
                                            {gift.senderName} ({gift.senderEmail})
                                        </div>
                                    </div>

                                    {/* Recipient Details */}
                                    <div className="bg-pink-50/50 dark:bg-pink-950/20 p-3.5 rounded-2xl border border-pink-500/10 space-y-1">
                                        <div className="text-xs font-black text-pink-700 dark:text-pink-400 flex items-center gap-1">
                                            <Gift className="w-3.5 h-3.5" />
                                            <span>المُهدى إليه (الصديق):</span>
                                        </div>
                                        <div className="text-xs font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                            <span>{gift.recipientName}</span>
                                            {gift.recipientPhone && (
                                                <span className="text-[11px] text-pink-600 font-mono">({gift.recipientPhone})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Product & Message Box */}
                                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2 font-bold">
                                        <span className="text-yellow-300">الهدية: {gift.gameTitle}</span>
                                        <span className="text-slate-400">تاريخ الطلب: {new Date(gift.createdAt).toLocaleDateString("ar-EG")}</span>
                                    </div>
                                    <div className="text-xs text-slate-200 font-medium italic">
                                        الرسالة المرفقة: "{gift.message}"
                                    </div>
                                </div>

                                {/* Bottom Direct WhatsApp Action for Admin */}
                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <a
                                        href={`https://wa.me/${gift.recipientPhone || "962790000000"}?text=${encodeURIComponent(waMsg)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-5 rounded-xl bg-[#25D366] hover:bg-[#1DA851] text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-colors"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span>تفعيل الهدية وإرسالها للصديق عبر الواتساب 💬</span>
                                    </a>

                                    <button
                                        onClick={() => handleDelete(gift.id)}
                                        className="w-9 h-9 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                                        title="حذف الهدية"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
