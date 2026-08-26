import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
    Gift, Sparkles, Clock, Rocket, MessageCircle, CheckCircle2,
    Users, Link2, DollarSign, Plus, Trash2, Edit3, Copy, Search,
    Percent, Check, X, Share2, TrendingUp, AlertCircle, Phone, ArrowUpRight
} from "lucide-react";
import { lsGet, lsSet } from "../../lib/storage";

const DEFAULT_AFFILIATES = [
    {
        id: "aff-1",
        name: "عبدالله الجيمر (TikTok)",
        code: "ABOOD10",
        phone: "966501234567",
        commissionType: "percent", // 'percent' | 'fixed'
        commissionRate: 10,
        salesCount: 42,
        totalSalesAmount: 1890,
        totalCommission: 189,
        paidCommission: 150,
        active: true,
        createdAt: "2026-06-15",
    },
    {
        id: "aff-2",
        name: "سلطان كود (YouTube)",
        code: "SULTAN",
        phone: "96599887766",
        commissionType: "percent",
        commissionRate: 12,
        salesCount: 68,
        totalSalesAmount: 3200,
        totalCommission: 384,
        paidCommission: 300,
        active: true,
        createdAt: "2026-06-20",
    },
    {
        id: "aff-3",
        name: "راكان ألعاب (Instagram)",
        code: "RAKAN5",
        phone: "971509988112",
        commissionType: "fixed",
        commissionRate: 3, // $3 per sale
        salesCount: 25,
        totalSalesAmount: 1100,
        totalCommission: 75,
        paidCommission: 75,
        active: true,
        createdAt: "2026-07-01",
    }
];

export default function AffiliateTab() {
    const [affiliates, setAffiliates] = useState(() => {
        return lsGet("store_affiliates_list", DEFAULT_AFFILIATES);
    });

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAff, setEditingAff] = useState(null);

    const [form, setForm] = useState({
        name: "",
        code: "",
        phone: "",
        commissionType: "percent",
        commissionRate: 10,
    });

    useEffect(() => {
        lsSet("store_affiliates_list", affiliates);
    }, [affiliates]);

    const stats = useMemo(() => {
        const totalAff = affiliates.length;
        const totalSales = affiliates.reduce((sum, a) => sum + (a.totalSalesAmount || 0), 0);
        const totalComm = affiliates.reduce((sum, a) => sum + (a.totalCommission || 0), 0);
        const totalPaid = affiliates.reduce((sum, a) => sum + (a.paidCommission || 0), 0);
        const pending = totalComm - totalPaid;
        return { totalAff, totalSales, totalComm, totalPaid, pending };
    }, [affiliates]);

    const filtered = useMemo(() => {
        if (!search.trim()) return affiliates;
        const q = search.toLowerCase();
        return affiliates.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q) ||
            a.phone.includes(q)
        );
    }, [affiliates, search]);

    const handleOpenCreate = () => {
        setEditingAff(null);
        setForm({
            name: "",
            code: "",
            phone: "",
            commissionType: "percent",
            commissionRate: 10,
        });
        setShowModal(true);
    };

    const handleOpenEdit = (aff) => {
        setEditingAff(aff);
        setForm({
            name: aff.name,
            code: aff.code,
            phone: aff.phone,
            commissionType: aff.commissionType,
            commissionRate: aff.commissionRate,
        });
        setShowModal(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.code.trim()) {
            toast.error("يرجى ملء اسم المسوق وكود الخصم");
            return;
        }

        const cleanCode = form.code.toUpperCase().replace(/\s+/g, "");

        if (editingAff) {
            const updated = affiliates.map(a => {
                if (a.id === editingAff.id) {
                    return {
                        ...a,
                        name: form.name.trim(),
                        code: cleanCode,
                        phone: form.phone.trim(),
                        commissionType: form.commissionType,
                        commissionRate: Number(form.commissionRate) || 10,
                    };
                }
                return a;
            });
            setAffiliates(updated);
            toast.success("تم تعديل بيانات المسوق بنجاح ✨");
        } else {
            const newAff = {
                id: "aff-" + Date.now(),
                name: form.name.trim(),
                code: cleanCode,
                phone: form.phone.trim(),
                commissionType: form.commissionType,
                commissionRate: Number(form.commissionRate) || 10,
                salesCount: 0,
                totalSalesAmount: 0,
                totalCommission: 0,
                paidCommission: 0,
                active: true,
                createdAt: new Date().toISOString().split("T")[0],
            };
            setAffiliates([newAff, ...affiliates]);
            toast.success(`تمت إضافة المسوق (${newAff.name}) بنجاح 🚀`);
        }

        setShowModal(false);
    };

    const handleToggleActive = (id) => {
        const updated = affiliates.map(a => a.id === id ? { ...a, active: !a.active } : a);
        setAffiliates(updated);
        toast.success("تم تحديث حالة تفعيل المسوق 🔄");
    };

    const handleDelete = (id, name) => {
        if (!window.confirm(`هل أنت متأكد من حذف المسوق "${name}"؟`)) return;
        const updated = affiliates.filter(a => a.id !== id);
        setAffiliates(updated);
        toast.success("تم حذف المسوق بنجاح 🗑️");
    };

    const handleMarkSettled = (aff) => {
        const remaining = (aff.totalCommission || 0) - (aff.paidCommission || 0);
        if (remaining <= 0) {
            toast.info("جميع مستحقات هذا المسوق مسددة بالكامل ✅");
            return;
        }
        const updated = affiliates.map(a => {
            if (a.id === aff.id) {
                return { ...a, paidCommission: a.totalCommission };
            }
            return a;
        });
        setAffiliates(updated);
        toast.success(`تم تسجيل تسوية مبلغ $${remaining.toFixed(2)} بنجاح 💰`);
    };

    const getWhatsAppStatementUrl = (aff) => {
        const remaining = (aff.totalCommission || 0) - (aff.paidCommission || 0);
        const msg = `مرحباً أخي ${aff.name} 🌟\nإليك كشف حساب أرباحك وعمولاتك من متجر *دُكانك* 🎮:\n\n🏷️ كود الخصم الخاص بك: *${aff.code}*\n📦 عدد الطلبات المكتملة: *${aff.salesCount}*\n💰 إجمالي المبيعات المحققة: *$${aff.totalSalesAmount}*\n✨ إجمالي عمولتك: *$${aff.totalCommission}*\n💵 المبالغ المستلمة سابقاً: *$${aff.paidCommission}*\n⏳ الرصيد المستحق الحالي: *$${remaining.toFixed(2)}*\n\nشكراً لجهودك ويسعدنا دائماً استمرار تعاوننا 🤝🔥`;
        const cleanPhone = (aff.phone || "").replace(/\D/g, "");
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    };

    return (
        <div data-testid="affiliate-tab" className="space-y-6">
            {/* Header Banner */}
            <div className="relative rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                            <Rocket className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <span>نظام التسويق بالعمولة والمؤثرين (Affiliate & Influencer Hub)</span>
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                إدارة أكواد المشاهير والمسوقين، احتساب العمولات التلقائية، وإرسال كشوف الأرباح عبر الواتساب بنقرة واحدة!
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مسوّق جديد ➕</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>إجمالي المسوقين</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalAff}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>مبيعات الإحالات</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${stats.totalSales}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <span>إجمالي العمولات</span>
                    </div>
                    <div className="text-2xl font-black text-amber-500">${stats.totalComm}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1">
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>مستحقات معلقة</span>
                    </div>
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400">${stats.pending.toFixed(2)}</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ابحث باسم المسوق، كود الخصم، أو رقم الهاتف..."
                    className="w-full bg-transparent text-xs font-bold focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                />
            </div>

            {/* Affiliates List */}
            <div className="space-y-3">
                {filtered.map((aff) => {
                    const remaining = (aff.totalCommission || 0) - (aff.paidCommission || 0);
                    return (
                        <div
                            key={aff.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-emerald-500/50 transition"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-sm text-slate-900 dark:text-white">{aff.name}</h4>
                                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs">
                                                {aff.code}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                aff.active ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300"
                                            }`}>
                                                {aff.active ? "نشط 🟢" : "معطل 🔴"}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-3">
                                            <span>📱 {aff.phone || "غير محدد"}</span>
                                            <span>• نسبة العمولة: {aff.commissionType === "percent" ? `${aff.commissionRate}%` : `$${aff.commissionRate} لكل طلب`}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(aff.id)}
                                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                                    >
                                        {aff.active ? "تعطيل ⏸️" : "تفعيل ▶️"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(aff)}
                                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold transition cursor-pointer"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 inline ml-1" />
                                        تعديل
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(aff.id, aff.name)}
                                        className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Performance Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                <div>
                                    <div className="text-[11px] text-slate-400 font-bold">الطلبات المحققة</div>
                                    <div className="text-sm font-black text-slate-800 dark:text-slate-100">{aff.salesCount} طلب</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 font-bold">إجمالي المبيعات</div>
                                    <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">${aff.totalSalesAmount}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 font-bold">إجمالي العمولات</div>
                                    <div className="text-sm font-black text-amber-500">${aff.totalCommission}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-slate-400 font-bold">المتبقي للصرف</div>
                                    <div className="text-sm font-black text-purple-600 dark:text-purple-400">${remaining.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <a
                                    href={getWhatsAppStatementUrl(aff)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>إرسال كشف الحساب بالواتساب 📲</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => handleMarkSettled(aff)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>تسجيل تسوية المستحقات 💰</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white">
                                {editingAff ? "تعديل بيانات المسوق" : "إضافة مسوّق جديد"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
            </div>
        </div>
    );
}
