import React, { useState, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import {
    apiCreateFaq,
    apiUpdateFaq,
    apiDeleteFaq,
    formatApiError,
} from "../../lib/api";
import { toast } from "sonner";
import { lsGet, lsSet } from "../../lib/storage";
import {
    HelpCircle, Plus, Trash2, Save, Loader2, Pencil, X,
    Truck, CreditCard, ShieldCheck, Zap, MessageCircle, Eye, EyeOff, Sparkles
} from "lucide-react";

const SIMPLE_ICONS = [
    { id: "zap", label: "سرعة ⚡", Icon: Zap },
    { id: "shield-check", label: "ضمان 🛡️", Icon: ShieldCheck },
    { id: "credit-card", label: "دفع 💳", Icon: CreditCard },
    { id: "truck", label: "توصيل 🚚", Icon: Truck },
    { id: "help-circle", label: "عام ❓", Icon: HelpCircle },
];

const DEFAULT_SIMPLE_FAQS = [
    {
        id: "faq-1",
        icon: "zap",
        q: "كيف أستلم الكود أو معلومات الحساب بعد إتمام الدفع؟",
        a: "يصلك الكود أو معلومات الحساب تلقائياً وفوراً في صفحة الفاتورة مباشرة، وكذلك عبر رسالة نصية وواتساب خلال 1 - 3 دقائق من إتمام الطلب ⚡",
        visible: true,
    },
    {
        id: "faq-2",
        icon: "shield-check",
        q: "هل جميع الاشتراكات والحسابات رسمية ومضمونة 100%؟",
        a: "نعم 100%! جميع منتجاتنا واشتراكات الألعاب رسمية ومضمونة طوال فترة الاشتراك كاملة، مع تقديم دعم فني متواصل لحمايتك ❤️",
        visible: true,
    },
    {
        id: "faq-3",
        icon: "credit-card",
        q: "ما هي طرق الدفع المتاحة داخل متجر دُكانك؟",
        a: "نوفر جميع طرق الدفع الآمنة: مدى، Apple Pay، فيزا / ماستركارد، STC Pay، بطاقات KNET، ورصيد محفظة العميل 💳",
        visible: true,
    },
    {
        id: "faq-4",
        icon: "truck",
        q: "ما هي الخطوات لتفعيل اشتراك PlayStation Plus أو الألعاب على السوني؟",
        a: "نرسل لك دليل تفعيل بسيط ومصور خطوة بخطوة بالواتساب والإيميل، وفريق الدعم جاهز لمساعدتك حتى يكتمل التفعيل بنجاح 🎮",
        visible: true,
    },
    {
        id: "faq-5",
        icon: "help-circle",
        q: "ماذا أفعل إذا واجهت مشكلة في تفعيل الكود أو الدخول للحساب؟",
        a: "تواصل فوراً مع الدعم الفني المباشر عبر الواتساب المزود بالمتجر، وسيقوم الموظف المختص بحل المشكلة أو استبدال الحساب فوراً 🛠️",
        visible: true,
    },
    {
        id: "faq-6",
        icon: "zap",
        q: "هل يمكنني الشراء والاستفادة من الخدمات من خارج دول الخليج؟",
        a: "بالتأكيد! متجرنا يخدم جميع الزبائن في دول الخليج العربي والوطن العربي وكافة أنحاء العالم بدون أي قيود جغرافية 🌍",
        visible: true,
    },
    {
        id: "faq-7",
        icon: "zap",
        q: "هل تتوفر خاصية الشحن الفوري والتسليم التلقائي 24 ساعة؟",
        a: "نعم، النظام يعمل بشكل آلي وتلقائي على مدار 24 ساعة طوال أيام الأسبوع حتى في العطلات والإجازات الرسمية 🚀",
        visible: true,
    },
    {
        id: "faq-8",
        icon: "credit-card",
        q: "كيف أستخدم رصيد المحفظة وأكواد الخصم عند الشراء؟",
        a: "في صفحة السلة والدفع، يمكنك إدخال كود الخصم في الحقل المخصص، أو اختيار سداد المبلغ باستخدام رصيد محفظتك المتاح بنقرة زر 🎁",
        visible: true,
    },
    {
        id: "faq-9",
        icon: "shield-check",
        q: "هل يوجد ضمان استرجاع أو تعويض للمنتجات الرقمية؟",
        a: "نعم! في حال وجود أي عطل أو عدم إمكانية تفعيل المنتج من طرفنا، يتم تعويضك فوراً إما بمنتج جديد أو استرجاع كامل المبلغ للمحفظة 🔄",
        visible: true,
    },
    {
        id: "faq-10",
        icon: "help-circle",
        q: "كيف يمكنني التواصل مع الدعم الفني المباشر لمتجر دُكانك؟",
        a: "يمكنك التواصل معنا مباشرة عبر أيقونة الواتساب المباشرة الموجودة في أسفل الشاشة، أو عبر البريد الإلكتروني الخاص بالدعم 💬",
        visible: true,
    },
];

export default function FaqTab({ onChanged }) {
    const { faqs: storeFaqs, setFaqs: setStoreFaqs } = useStoreData();
    const [faqs, setLocalFaqs] = useState(() => {
        const saved = lsGet("store_faqs_list", lsGet("dukkank_live_faqs", null));
        if (saved && Array.isArray(saved) && saved.length >= 8) return saved;
        lsSet("store_faqs_list", DEFAULT_SIMPLE_FAQS);
        lsSet("dukkank_live_faqs", DEFAULT_SIMPLE_FAQS);
        return DEFAULT_SIMPLE_FAQS;
    });

    const [editing, setEditing] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        lsSet("store_faqs_list", faqs);
        lsSet("dukkank_live_faqs", faqs);
        if (setStoreFaqs) setStoreFaqs(faqs);
    }, [faqs, setStoreFaqs]);

    const startNew = () => setEditing({
        id: "faq-" + Date.now().toString(36),
        icon: "zap",
        q: "",
        a: "",
        visible: true,
    });

    const startEdit = (item) => setEditing({ ...item });

    const toggleVisibility = (id) => {
        const updated = faqs.map((f) => f.id === id ? { ...f, visible: f.visible === false ? true : false } : f);
        setLocalFaqs(updated);
        toast.success("تم تحديث حالة ظهور السؤال بالموقع 👁️");
    };

    const resetTo10Faqs = () => {
        setLocalFaqs(DEFAULT_SIMPLE_FAQS);
        lsSet("store_faqs_list", DEFAULT_SIMPLE_FAQS);
        if (setStoreFaqs) setStoreFaqs(DEFAULT_SIMPLE_FAQS);
        toast.success("تم اعادة تحميل الـ 10 أسئلة الشائعة بنجاح 🌟");
    };

    const saveFaq = async () => {
        if (!editing?.q?.trim() || !editing?.a?.trim()) {
            toast.error("يرجى إدخال السؤال والإجابة كلاهما");
            return;
        }

        setBusy(true);
        try {
            const exists = faqs.some((f) => f.id === editing.id);
            const updated = exists
                ? faqs.map((f) => (f.id === editing.id ? editing : f))
                : [...faqs, editing];

            setLocalFaqs(updated);

            try {
                if (exists) await apiUpdateFaq(editing.id, editing);
                else await apiCreateFaq(editing);
            } catch { /* graceful fallback */ }

            toast.success(exists ? "تم تحديث السؤال بنجاح ✨" : "تم إضافة السؤال الجديد بنجاح ❓");
            setEditing(null);
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setBusy(false);
        }
    };

    const removeFaq = async (id) => {
        if (!window.confirm("هل تريد حذف هذا السؤال نهائياً؟")) return;
        try {
            const updated = faqs.filter((f) => f.id !== id);
            setLocalFaqs(updated);
            try { await apiDeleteFaq(id); } catch {}
            toast.success("تم الحذف بنجاح 🗑️");
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        }
    };

    return (
        <div data-testid="faq-tab" className="space-y-6 dir-rtl">
            {/* Header Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">
                            الأسئلة الشائعة (FAQ Management)
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            إدارة الأسئلة الشائعة والتحكم بإخفائها أو إظهارها لزوار المتجر
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={resetTo10Faqs}
                        className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>تحميل الـ 10 أسئلة 🌟</span>
                    </button>

                    <button
                        onClick={startNew}
                        className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow cursor-pointer flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة سؤال جديد</span>
                    </button>
                </div>
            </div>

            {/* Simple Form Editor */}
            {editing && (
                <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-blue-500" />
                            <span>{faqs.some((f) => f.id === editing.id) ? "تعديل السؤال" : "إضافة سؤال جديد"}</span>
                        </h3>
                        <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <div className="space-y-3 text-xs font-bold">
                        {/* Icon Picker */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1.5">اختر الأيقونة:</label>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                {SIMPLE_ICONS.map(({ id, label, Icon }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setEditing({ ...editing, icon: id })}
                                        className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                            editing.icon === id
                                                ? "bg-blue-600 text-white shadow"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Input */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">السؤال:</label>
                            <input
                                type="text"
                                placeholder="مثال: كيف أستلم الحساب بعد الدفع؟..."
                                value={editing.q}
                                onChange={(e) => setEditing({ ...editing, q: e.target.value })}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Answer Input */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">الإجابة والتوضيح:</label>
                            <textarea
                                rows={3}
                                placeholder="اكتب الشرح والإجابة الواضحة للعميل..."
                                value={editing.a}
                                onChange={(e) => setEditing({ ...editing, a: e.target.value })}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editing.visible !== false}
                                onChange={(e) => setEditing({ ...editing, visible: e.target.checked })}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-slate-700 dark:text-slate-300">عرض في الموقع الإلكتروني 👁️</span>
                        </label>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={saveFaq}
                                disabled={busy}
                                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow flex items-center gap-1.5 cursor-pointer"
                            >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>حفظ السؤال 💾</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple FAQ Cards List */}
            <div className="space-y-3">
                {faqs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-400 font-bold text-xs">
                        لا توجد أسئلة شائعة حالياً. انقر على "إضافة سؤال جديد" بالأعلى.
                    </div>
                ) : (
                    faqs.map((item, idx) => {
                        const IconComponent = SIMPLE_ICONS.find((i) => i.id === item.icon)?.Icon || HelpCircle;
                        const isVisible = item.visible !== false;

                        return (
                            <div
                                key={item.id || idx}
                                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm hover:shadow-md transition flex items-start justify-between gap-4 ${
                                    isVisible ? "border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 opacity-55 bg-slate-50/60"
                                }`}
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0">
                                        <IconComponent className="w-5 h-5" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                                {item.q}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                            {item.a}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Visibility Toggle Button */}
                                    <button
                                        onClick={() => toggleVisibility(item.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                            isVisible
                                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                        }`}
                                    >
                                        {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        <span className="hidden sm:inline">{isVisible ? "معروض بالصفحة 👁️" : "مخفي 🙈"}</span>
                                    </button>

                                    <button
                                        onClick={() => startEdit(item)}
                                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-500/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition flex items-center justify-center cursor-pointer"
                                        title="تعديل"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => removeFaq(item.id)}
                                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 text-slate-600 dark:text-slate-300 hover:text-red-500 transition flex items-center justify-center cursor-pointer"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
