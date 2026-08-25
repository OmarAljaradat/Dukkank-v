import React, { useState } from "react";
import { toast } from "sonner";
import { Star, MessageCircle, Send, CheckCircle2, X, Sparkles, ShieldCheck } from "lucide-react";
import { lsGet, lsSet } from "../lib/storage";
import { apiCreateReview } from "../lib/api";

export default function PostPurchaseReviewModal({ isOpen, onClose, defaultProduct = "EA SPORTS FC 25" }) {
    const [name, setName] = useState("");
    const [rating, setRating] = useState(5);
    const [text, setText] = useState("");
    const [product, setProduct] = useState(defaultProduct);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) {
            toast.error("يرجى كتابة اسمك ونص تجاربك وتقييمك أولاً");
            return;
        }

        const newReview = {
            id: "rev-" + Date.now().toString(36),
            name: name.trim() + " 🇸🇦",
            rating: Number(rating),
            text: text.trim(),
            product: product.trim() || "متجر دُكانك",
            verified: true,
            status: "pending", // Pending admin approval
            visible: false, // Hidden until admin approves
            adminReply: "",
            date: new Date().toISOString().split("T")[0],
        };

        try {
            const list = lsGet("store_reviews_list", []);
            list.unshift(newReview);
            lsSet("store_reviews_list", list);

            try { await apiCreateReview(newReview); } catch {}

            setSubmitted(true);
            toast.success("تم إرسال تقييمك بنجاح ❤️! وسيطهر بالصفحة الرئيسية فور موافقة الإدارة ✨");
        } catch {
            toast.error("حدث خطأ أثناء إرسال التقييم، يرجى المحاولة لاحقاً");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                            <Star className="w-5 h-5 fill-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                شاركنا رأيك وتجربتك في متجر دُكانك ⭐
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">رأيك يهمنا ويظهر بالصفحة الرئيسية للمتجر</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {submitted ? (
                    <div className="text-center py-8 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h4 className="font-black text-lg text-slate-900 dark:text-white">شكراً جزيلاً لتقييمك الرائع ❤️!</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                            تم استلام تقييمك بنجاح وسوف يتم مراجعته من قبل إدارة المتجر ونشره بالصفحة الرئيسية فوراً ✨
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs transition cursor-pointer shadow"
                        >
                            إغلاق النافذة
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
                        {/* Rating Picker */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                            <label className="block text-slate-700 dark:text-slate-300">اختر عدد النجوم لتقييم تجربة الشراء:</label>
                            <div className="flex items-center justify-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRating(num)}
                                        className="p-1 hover:scale-125 transition cursor-pointer"
                                    >
                                        <Star
                                            className={`w-7 h-7 ${
                                                num <= rating
                                                    ? "fill-amber-400 text-amber-400 drop-shadow"
                                                    : "text-slate-300 dark:text-slate-700"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Customer Name */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">اسمك الكريـم:</label>
                            <input
                                type="text"
                                placeholder="مثال: عبدالعزيز الشمري..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        {/* Product / Game Name */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">المنتج أو الخدمة التي اشتريتها:</label>
                            <input
                                type="text"
                                placeholder="مثال: EA SPORTS FC 25 / PS Plus 12M..."
                                value={product}
                                onChange={(e) => setProduct(e.target.value)}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        {/* Review Content Text */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">رأيك وتجربتك بالتفصيل:</label>
                            <textarea
                                rows={3}
                                placeholder="اكتب انطباعك عن السرعة، الخدمة، والسعر..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                            >
                                <Send className="w-4 h-4" />
                                <span>إرسال التقييم للإدارة ⭐</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
