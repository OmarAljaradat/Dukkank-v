import { useState, useEffect, useCallback } from "react";
import { getToken } from "../../lib/api";
import { toast } from "sonner";
import {
    Plus, RefreshCw, Trash2, Pencil, X, CheckCircle,
    Clock, XCircle, Search, ChevronDown, ChevronUp, FileText,
    DollarSign, ShieldCheck
} from "lucide-react";

const API = "/api/admin/store-orders";
const PLATFORM_OPTIONS = ["PS4", "PS5", "كلاهما"];
const SUB_TYPES = ["Essential (أساسي)", "Extra (إضافي)"];
const SUB_DURATIONS = ["شهر واحد", "٣ أشهر", "٦ أشهر", "١٢ شهر"];
const STATUS_OPTIONS = ["completed", "pending", "cancelled"];
const PAYMENT_PLATFORMS = ["منصة زبوني", "كليك", "عملات رقمية", "باي بال", "تحويل بنكي", "نقدي"];
const STATUS_LABELS = { pending: "معلّق", completed: "مكتمل", cancelled: "ملغي" };
const STATUS_COLORS = {
    pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const todayStr = () => new Date().toISOString().split("T")[0];
const addMonths = (dateStr, n) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T12:00:00");
    d.setMonth(d.getMonth() + n);
    return d.toISOString().split("T")[0];
};

function fmtDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" });
}
function fmtDateOnly(d) {
    if (!d) return "—";
    const s = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
    return new Date(s + "T12:00:00").toLocaleDateString("ar-SA", { dateStyle: "medium" });
}

const EMPTY_FORM = {
    customer_name: "",
    product_type: "subscription",
    game_name: "",
    subscription_type: "Essential (أساسي)",
    subscription_duration: "شهر واحد",
    contact_instagram: "",
    contact_whatsapp: "",
    account_email: "",
    platform: "PS5",
    notes: "",
    status: "completed",
    order_number: "",
    customer_paid: "",
    payment_platform: "منصة زبوني",
    gateway_fee: "",
    cost_price: "",
    supplier: "",
    warranty_start: todayStr(),
    warranty_end: addMonths(todayStr(), 6),
};

function OrderForm({ initial = EMPTY_FORM, onSave, onCancel, title }) {
    const [form, setForm] = useState(initial);
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => {
        const next = { ...f, [k]: v };
        if (k === "customer_paid") {
            const amt = parseFloat(v) || 0;
            next.gateway_fee = amt > 0 ? (amt * 0.05).toFixed(2) : "";
        }
        if (k === "warranty_start") {
            next.warranty_end = addMonths(v, 6);
        }
        return next;
    });

    const profit = (() => {
        const paid = parseFloat(form.customer_paid) || 0;
        const fee  = parseFloat(form.gateway_fee)  || 0;
        const cost = parseFloat(form.cost_price)   || 0;
        if (!paid && !cost) return null;
        return paid - fee - cost;
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try { await onSave(form); }
        finally { setSaving(false); }
    };

    const labelCls = "block text-xs font-bold text-[hsl(var(--brand-ink))]/70 mb-1";
    const inputCls = "w-full rounded-xl border border-[hsl(var(--brand-ink))]/15 dark:border-white/10 bg-white dark:bg-white/[0.06] text-[hsl(var(--brand-ink))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/40 transition";
    const selectCls = inputCls + " appearance-none cursor-pointer";
    const roInputCls = "w-full rounded-xl border border-[hsl(var(--brand-ink))]/10 dark:border-white/8 bg-[hsl(var(--brand-ink))]/[0.04] dark:bg-white/[0.03] text-[hsl(var(--brand-ink))]/60 px-3 py-2.5 text-sm cursor-default";
    const sectionCls = "rounded-2xl border border-[hsl(var(--brand-ink))]/8 dark:border-white/8 bg-[hsl(var(--brand-ink))]/[0.015] dark:bg-white/[0.015] p-4 space-y-3";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-base font-bold text-[hsl(var(--brand-ink))] mb-5 pb-3 border-b border-[hsl(var(--brand-ink))]/10 dark:border-white/10">
                {title}
            </div>

            {/* رقم الطلب + اسم الزبون */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>رقم الطلب (اختياري — يولَّد تلقائياً)</label>
                    <input className={inputCls} placeholder="DK-00001"
                        value={form.order_number} onChange={e => set("order_number", e.target.value)} />
                </div>
                <div>
                    <label className={labelCls}>اسم الزبون *</label>
                    <input required className={inputCls} placeholder="محمد الأحمد"
                        value={form.customer_name} onChange={e => set("customer_name", e.target.value)} />
                </div>
            </div>

            {/* نوع المنتج */}
            <div>
                <label className={labelCls}>نوع المنتج *</label>
                <div className="flex gap-3">
                    {[["subscription", "📦 اشتراك PS Plus"], ["game", "🎮 لعبة"]].map(([val, lbl]) => (
                        <button key={val} type="button" onClick={() => set("product_type", val)}
                            className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.product_type === val ? "bg-[hsl(var(--brand-blue-deep))] text-white border-[hsl(var(--brand-blue-deep))]" : "border-[hsl(var(--brand-ink))]/15 dark:border-white/10 text-[hsl(var(--brand-ink))]/70 hover:border-[hsl(var(--brand-blue-deep))]/40"}`}>
                            {lbl}
                        </button>
                    ))}
                </div>
            </div>

            {/* اللعبة أو الاشتراك */}
            {form.product_type === "game" ? (
                <div>
                    <label className={labelCls}>اسم اللعبة *</label>
                    <input required className={inputCls} placeholder="God of War Ragnarök"
                        value={form.game_name} onChange={e => set("game_name", e.target.value)} />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>نوع الاشتراك</label>
                        <select className={selectCls} value={form.subscription_type} onChange={e => set("subscription_type", e.target.value)}>
                            {SUB_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>المدة</label>
                        <select className={selectCls} value={form.subscription_duration} onChange={e => set("subscription_duration", e.target.value)}>
                            {SUB_DURATIONS.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* الجهاز */}
            <div>
                <label className={labelCls}>الجهاز</label>
                <div className="flex gap-2">
                    {PLATFORM_OPTIONS.map(p => (
                        <button key={p} type="button" onClick={() => set("platform", p)}
                            className={`flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all ${form.platform === p ? "bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] border-[hsl(var(--brand-ink))]" : "border-[hsl(var(--brand-ink))]/15 dark:border-white/10 text-[hsl(var(--brand-ink))]/70"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* بيانات التواصل */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelCls}>إنستا / تواصل</label>
                    <input className={inputCls} placeholder="@username"
                        value={form.contact_instagram} onChange={e => set("contact_instagram", e.target.value)} />
                </div>
                <div>
                    <label className={labelCls}>واتساب (رقم كامل)</label>
                    <input className={inputCls} type="tel" placeholder="9665XXXXXXXX"
                        value={form.contact_whatsapp} onChange={e => set("contact_whatsapp", e.target.value)} />
                </div>
            </div>

            {/* بريد الحساب */}
            <div>
                <label className={labelCls}>بريد الحساب المُسلَّم للزبون</label>
                <input className={inputCls} type="email" placeholder="account@example.com"
                    value={form.account_email} onChange={e => set("account_email", e.target.value)} />
            </div>

            {/* ── التفاصيل المالية ─────────────────────────────────────── */}
            <div className={sectionCls}>
                <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--brand-ink))]">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    التفاصيل المالية
                </div>

                {/* دفع الزبون + منصة الدفع */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>دفع الزبون ($)</label>
                        <input className={inputCls} type="number" min="0" step="0.01"
                            placeholder="0.00" value={form.customer_paid}
                            onChange={e => set("customer_paid", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>منصة الدفع</label>
                        <select className={selectCls} value={form.payment_platform}
                            onChange={e => set("payment_platform", e.target.value)}>
                            {PAYMENT_PLATFORMS.map(p => <option key={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* رسوم البوابة (auto) + ربح لحظي */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>رسوم البوابة (5% تلقائي) 🔒</label>
                        <input className={roInputCls} readOnly
                            value={form.gateway_fee ? `$${parseFloat(form.gateway_fee).toFixed(2)}` : "—"} />
                    </div>
                    <div>
                        <label className={labelCls}>الربح المتوقع 🔒</label>
                        <input className={`${roInputCls} ${profit !== null ? (profit >= 0 ? "!text-green-600 dark:!text-green-400 font-bold" : "!text-red-600 dark:!text-red-400 font-bold") : ""}`}
                            readOnly value={profit !== null ? `$${profit.toFixed(2)}` : "—"} />
                    </div>
                </div>

                {/* تكلفة الحساب + المورد */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>تكلفة الحساب ($)</label>
                        <input className={inputCls} type="number" min="0" step="0.01"
                            placeholder="0.00" value={form.cost_price}
                            onChange={e => set("cost_price", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>المورد</label>
                        <input className={inputCls} placeholder="اسم المورد / المصدر"
                            value={form.supplier} onChange={e => set("supplier", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* ── الضمان ───────────────────────────────────────────────── */}
            <div className={sectionCls}>
                <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--brand-ink))]">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    تاريخ الضمان
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelCls}>بداية الضمان</label>
                        <input type="date" className={inputCls}
                            value={form.warranty_start}
                            onChange={e => set("warranty_start", e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>نهاية الضمان (6 أشهر تلقائي)</label>
                        <input type="date" className={inputCls}
                            value={form.warranty_end}
                            onChange={e => set("warranty_end", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* حالة الطلب */}
            <div>
                <label className={labelCls}>حالة الطلب</label>
                <div className="flex gap-2">
                    {STATUS_OPTIONS.map(s => (
                        <button key={s} type="button" onClick={() => set("status", s)}
                            className={`flex-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${form.status === s ? `border-transparent ${STATUS_COLORS[s]}` : "border-[hsl(var(--brand-ink))]/15 dark:border-white/10 text-[hsl(var(--brand-ink))]/60"}`}>
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ملاحظات */}
            <div>
                <label className={labelCls}>ملاحظات</label>
                <textarea className={inputCls} rows={2} placeholder="أي ملاحظات إضافية..."
                    value={form.notes} onChange={e => set("notes", e.target.value)} />
            </div>

            {/* أزرار */}
            <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                    className="flex-1 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white py-2.5 text-sm font-bold transition hover:opacity-90 disabled:opacity-50">
                    {saving ? "جاري الحفظ..." : "💾 حفظ الطلب"}
                </button>
                <button type="button" onClick={onCancel}
                    className="flex-1 rounded-xl border border-[hsl(var(--brand-ink))]/15 dark:border-white/10 text-[hsl(var(--brand-ink))]/70 py-2.5 text-sm font-bold transition hover:bg-[hsl(var(--brand-ink))]/5">
                    إلغاء
                </button>
            </div>
        </form>
    );
}

function InfoRow({ label, value, colored }) {
    if (!value && value !== 0) return null;
    return (
        <div>
            <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">{label}</div>
            <div className={`font-semibold text-[hsl(var(--brand-ink))] break-all ${colored || ""}`}>{value}</div>
        </div>
    );
}

function OrderRow({ order, onEdit, onDelete, onStatusChange }) {
    const [open, setOpen] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setLoadingStatus(true);
        try { await onStatusChange(order.id, newStatus); }
        finally { setLoadingStatus(false); }
    };

    const profit = (() => {
        const p = parseFloat(order.customer_paid) || 0;
        const f = parseFloat(order.gateway_fee) || 0;
        const c = parseFloat(order.cost_price) || 0;
        if (!p && !c) return null;
        return p - f - c;
    })();

    return (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[hsl(var(--brand-ink))]/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                onClick={() => setOpen(o => !o)}>
                <div className="font-mono text-xs font-bold text-[hsl(var(--brand-blue-deep))] dark:text-[hsl(var(--brand-blue))] bg-[hsl(var(--brand-blue-deep))]/8 dark:bg-[hsl(var(--brand-blue))]/15 px-2 py-0.5 rounded-lg flex-shrink-0">
                    {order.order_number}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[hsl(var(--brand-ink))] truncate">{order.customer_name}</div>
                    <div className="text-xs text-[hsl(var(--brand-ink))]/55 truncate">
                        {order.product_type === "game"
                            ? `🎮 ${order.game_name || "—"}`
                            : `📦 ${order.subscription_type || ""} — ${order.subscription_duration || ""}`}
                        {order.platform ? ` • ${order.platform}` : ""}
                        {order.customer_paid ? ` • $${parseFloat(order.customer_paid).toFixed(2)}` : ""}
                    </div>
                </div>
                {profit !== null && (
                    <div className={`hidden sm:block text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-lg ${profit >= 0 ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                        {profit >= 0 ? "+" : ""}{profit.toFixed(2)}$
                    </div>
                )}
                <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                </span>
                <div className="text-[11px] text-[hsl(var(--brand-ink))]/40 flex-shrink-0 hidden sm:block">{fmtDate(order.created_at)}</div>
                <button className="flex-shrink-0 text-[hsl(var(--brand-ink))]/40">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {open && (
                <div className="border-t border-[hsl(var(--brand-ink))]/8 dark:border-white/8 px-4 py-4 bg-[hsl(var(--brand-ink))]/[0.015] dark:bg-white/[0.02] space-y-4">
                    {/* بيانات الطلب الأساسية */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <InfoRow label="رقم الطلب" value={order.order_number} />
                        <InfoRow label="الزبون" value={order.customer_name} />
                        <InfoRow label="الجهاز" value={order.platform} />
                        <InfoRow label="إنستا/تواصل" value={order.contact_instagram} />
                        <InfoRow label="واتساب" value={order.contact_whatsapp} />
                        <InfoRow label="بريد الحساب" value={order.account_email} />
                        <InfoRow label="تاريخ الطلب" value={fmtDate(order.created_at)} />
                        <InfoRow label="آخر تحديث" value={fmtDate(order.updated_at)} />
                    </div>

                    {/* بيانات مالية */}
                    {(order.customer_paid || order.cost_price) && (
                        <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/8 dark:border-white/8 p-3">
                            <div className="text-xs font-bold text-[hsl(var(--brand-ink))]/50 mb-2.5 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5" /> التفاصيل المالية
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">دفع الزبون</div>
                                    <div className="font-bold text-blue-600 dark:text-blue-400">{order.customer_paid ? `$${parseFloat(order.customer_paid).toFixed(2)}` : "—"}</div>
                                </div>
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">منصة الدفع</div>
                                    <div className="font-semibold text-[hsl(var(--brand-ink))]">{order.payment_platform || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">رسوم البوابة</div>
                                    <div className="font-semibold text-purple-600 dark:text-purple-400">{order.gateway_fee ? `$${parseFloat(order.gateway_fee).toFixed(2)}` : "—"}</div>
                                </div>
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">تكلفة الحساب</div>
                                    <div className="font-semibold text-amber-600 dark:text-amber-400">{order.cost_price ? `$${parseFloat(order.cost_price).toFixed(2)}` : "—"}</div>
                                </div>
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">المورد</div>
                                    <div className="font-semibold text-[hsl(var(--brand-ink))]">{order.supplier || "—"}</div>
                                </div>
                                {profit !== null && (
                                    <div className="col-span-2 sm:col-span-1">
                                        <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">الربح</div>
                                        <div className={`text-base font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                            {profit >= 0 ? "+" : ""}{profit.toFixed(2)}$
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* بيانات الضمان */}
                    {(order.warranty_start || order.warranty_end) && (
                        <div className="rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/40 dark:border-blue-700/20 p-3">
                            <div className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> الضمان
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">بداية الضمان</div>
                                    <div className="font-semibold text-[hsl(var(--brand-ink))]">{fmtDateOnly(order.warranty_start)}</div>
                                </div>
                                <div>
                                    <div className="text-[hsl(var(--brand-ink))]/45 mb-0.5">نهاية الضمان</div>
                                    <div className="font-semibold text-[hsl(var(--brand-ink))]">{fmtDateOnly(order.warranty_end)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {order.notes && (
                        <div className="text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-3">
                            <span className="font-bold text-amber-800 dark:text-amber-400">ملاحظات: </span>
                            <span className="text-[hsl(var(--brand-ink))]/80">{order.notes}</span>
                        </div>
                    )}

                    {/* تغيير الحالة */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-[hsl(var(--brand-ink))]/50">تغيير الحالة:</span>
                        {STATUS_OPTIONS.map(s => s !== order.status && (
                            <button key={s} onClick={() => handleStatusChange(s)} disabled={loadingStatus}
                                className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[s]} opacity-70 hover:opacity-100 transition disabled:opacity-40`}>
                                {STATUS_LABELS[s]}
                            </button>
                        ))}
                    </div>

                    {/* الإجراءات */}
                    <div className="flex gap-2 pt-1">
                        <button onClick={() => onEdit(order)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[hsl(var(--brand-blue-deep))]/10 dark:bg-[hsl(var(--brand-blue))]/20 text-[hsl(var(--brand-blue-deep))] dark:text-[hsl(var(--brand-blue))] hover:opacity-80 transition">
                            <Pencil className="w-3.5 h-3.5" /> تعديل
                        </button>
                        <button onClick={() => onDelete(order.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[hsl(var(--brand-red))]/10 text-[hsl(var(--brand-red))] hover:opacity-80 transition">
                            <Trash2 className="w-3.5 h-3.5" /> حذف
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const headers = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(API, { headers });
            if (r.ok) setOrders(await r.json());
        } catch { toast.error("فشل تحميل الطلبات"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async (form) => {
        const r = await fetch(API, { method: "POST", headers, body: JSON.stringify(form) });
        if (!r.ok) { toast.error("فشل إضافة الطلب"); return; }
        toast.success("✅ تم إضافة الطلب بنجاح");
        setShowForm(false);
        await load();
    };

    const handleUpdate = async (form) => {
        const r = await fetch(`${API}/${editOrder.id}`, { method: "PUT", headers, body: JSON.stringify(form) });
        if (!r.ok) { toast.error("فشل تعديل الطلب"); return; }
        toast.success("✅ تم تعديل الطلب");
        setEditOrder(null);
        await load();
    };

    const handleDelete = async (id) => {
        if (!confirm("حذف هذا الطلب نهائياً؟")) return;
        const r = await fetch(`${API}/${id}`, { method: "DELETE", headers });
        if (!r.ok) { toast.error("فشل الحذف"); return; }
        toast.success("تم الحذف");
        await load();
    };

    const handleStatusChange = async (id, status) => {
        const r = await fetch(`${API}/${id}`, { method: "PUT", headers, body: JSON.stringify({ status }) });
        if (!r.ok) { toast.error("فشل تغيير الحالة"); return; }
        toast.success(`الحالة: ${STATUS_LABELS[status]}`);
        await load();
    };

    const filtered = orders.filter(o => {
        const matchSearch = !search || [o.customer_name, o.order_number, o.game_name, o.contact_instagram, o.contact_whatsapp, o.account_email, o.supplier]
            .some(v => v?.toLowerCase().includes(search.toLowerCase()));
        const matchStatus = filterStatus === "all" || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const completed = orders.filter(o => o.status === "completed");
    const totalRevenue = completed.reduce((s, o) => s + (parseFloat(o.customer_paid) || 0), 0);
    const totalProfit = completed.reduce((s, o) => {
        const p = parseFloat(o.customer_paid) || 0;
        const f = parseFloat(o.gateway_fee) || 0;
        const c = parseFloat(o.cost_price) || 0;
        return s + (p - f - c);
    }, 0);

    const counts = {
        total: orders.length,
        completed: completed.length,
        pending: orders.filter(o => o.status === "pending").length,
        cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    if (showForm || editOrder) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-5 sm:p-7">
                    <OrderForm
                        title={editOrder ? `تعديل الطلب: ${editOrder.order_number}` : "➕ إضافة طلب جديد"}
                        initial={editOrder ? { ...EMPTY_FORM, ...editOrder, order_number: editOrder.order_number, warranty_start: editOrder.warranty_start ? String(editOrder.warranty_start).slice(0, 10) : todayStr(), warranty_end: editOrder.warranty_end ? String(editOrder.warranty_end).slice(0, 10) : addMonths(todayStr(), 6) } : EMPTY_FORM}
                        onSave={editOrder ? handleUpdate : handleCreate}
                        onCancel={() => { setShowForm(false); setEditOrder(null); }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[hsl(var(--brand-ink))]">🛒 إدارة الطلبات</h2>
                    <p className="text-xs text-[hsl(var(--brand-ink))]/50 mt-0.5">كل الطلبات محفوظة في قاعدة البيانات</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 dark:border-white/10 px-3 py-2 text-xs font-bold text-[hsl(var(--brand-ink))]/70 hover:bg-[hsl(var(--brand-ink))]/5 transition">
                        <RefreshCw className="w-3.5 h-3.5" /> تحديث
                    </button>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white px-4 py-2 text-xs font-bold hover:opacity-90 transition">
                        <Plus className="w-3.5 h-3.5" /> طلب جديد
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: "إجمالي الطلبات", value: counts.total,     icon: FileText,     color: "blue"  },
                    { label: "مكتملة",          value: counts.completed, icon: CheckCircle,  color: "green" },
                    { label: "معلّقة",           value: counts.pending,   icon: Clock,        color: "amber" },
                    { label: "ملغية",            value: counts.cancelled, icon: XCircle,      color: "red"   },
                    { label: "إجمالي الإيرادات", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "teal" },
                    { label: "صافي الأرباح",     value: `$${totalProfit.toFixed(2)}`,  icon: totalProfit >= 0 ? CheckCircle : XCircle, color: totalProfit >= 0 ? "purple" : "red" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-3.5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            color === "blue"   ? "bg-[hsl(var(--brand-blue))]/15 text-[hsl(var(--brand-blue-deep))] dark:text-[hsl(var(--brand-blue))]" :
                            color === "green"  ? "bg-green-500/15 text-green-700 dark:text-green-400" :
                            color === "amber"  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                            color === "red"    ? "bg-[hsl(var(--brand-red))]/15 text-[hsl(var(--brand-red))]" :
                            color === "teal"   ? "bg-teal-500/15 text-teal-700 dark:text-teal-400" :
                            "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                        }`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-base font-bold text-[hsl(var(--brand-ink))] truncate">{value}</div>
                            <div className="text-[10px] text-[hsl(var(--brand-ink))]/50 leading-tight">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--brand-ink))]/40" />
                    <input
                        className="w-full rounded-xl border border-[hsl(var(--brand-ink))]/15 dark:border-white/10 bg-white dark:bg-white/[0.06] text-[hsl(var(--brand-ink))] pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/30"
                        placeholder="بحث باسم الزبون أو رقم الطلب أو المورد..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5">
                    {["all", ...STATUS_OPTIONS].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`text-xs font-bold px-3 py-2 rounded-xl transition ${filterStatus === s ? "bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))]" : "border border-[hsl(var(--brand-ink))]/15 dark:border-white/10 text-[hsl(var(--brand-ink))]/60 hover:bg-[hsl(var(--brand-ink))]/5"}`}>
                            {s === "all" ? "الكل" : STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders list */}
            {loading ? (
                <div className="text-center py-12 text-[hsl(var(--brand-ink))]/40 text-sm">جاري التحميل...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-[hsl(var(--brand-ink))]/15 dark:border-white/10">
                    <div className="text-3xl mb-3">📭</div>
                    <div className="text-sm font-bold text-[hsl(var(--brand-ink))]/50">لا توجد طلبات</div>
                    <button onClick={() => setShowForm(true)} className="mt-4 text-xs font-bold text-[hsl(var(--brand-blue-deep))] dark:text-[hsl(var(--brand-blue))] hover:underline">
                        أضف أول طلب الآن
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(o => (
                        <OrderRow key={o.id} order={o}
                            onEdit={setEditOrder}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
