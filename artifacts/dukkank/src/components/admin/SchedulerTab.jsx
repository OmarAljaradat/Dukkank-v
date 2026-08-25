import { useState, useEffect } from "react";
import { GAMES, SUBSCRIPTIONS } from "../../data/products";
import { getSchedules, setSchedules } from "../../lib/storage";
import { toast } from "sonner";
import { CalendarClock, Save, Trash2, Clock } from "lucide-react";

function fmtDate(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" });
}

export default function SchedulerTab() {
    const [schedules, setScheds] = useState([]);
    const [form, setForm] = useState({ productId: "", productType: "game", action: "available", scheduledAt: "" });

    useEffect(() => { setScheds(getSchedules()); }, []);

    const allProducts = [
        ...GAMES.map((g) => ({ id: g.id, name: g.name, type: "game" })),
        ...SUBSCRIPTIONS.flatMap((s) => s.durations.map((d) => ({ id: d.id, name: `${s.name} — ${d.label}`, type: "subscription" }))),
    ];

    const add = () => {
        if (!form.productId || !form.scheduledAt) { toast.error("اختر المنتج والوقت"); return; }
        const ts = new Date(form.scheduledAt).getTime();
        if (ts <= Date.now()) { toast.error("الوقت يجب أن يكون في المستقبل"); return; }
        const product = allProducts.find((p) => p.id === form.productId);
        const newEntry = { ...form, scheduledAt: ts, productName: product?.name || form.productId, id: Date.now().toString(36) };
        const updated = [...schedules, newEntry];
        setScheds(updated);
        setSchedules(updated);
        setForm({ productId: "", productType: "game", action: "available", scheduledAt: "" });
        toast.success("تمت جدولة التغيير ✅");
    };

    const remove = (id) => {
        const updated = schedules.filter((s) => s.id !== id);
        setScheds(updated);
        setSchedules(updated);
        toast.success("تم حذف الجدولة");
    };

    const now = Date.now();
    const pending  = schedules.filter((s) => s.scheduledAt > now);
    const executed = schedules.filter((s) => s.scheduledAt <= now);

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
                <h2 className="font-bold text-lg text-[hsl(var(--brand-ink))]">جدولة توفر المنتجات</h2>
            </div>

            {/* Form */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 p-5 space-y-4">
                <h3 className="font-bold text-[hsl(var(--brand-ink))]">إضافة جدولة جديدة</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[hsl(var(--brand-ink))]/70 mb-1.5">المنتج</label>
                        <select value={form.productId} onChange={(e) => {
                            const p = allProducts.find((p) => p.id === e.target.value);
                            setForm({ ...form, productId: e.target.value, productType: p?.type || "game" });
                        }} className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-white px-3 text-sm">
                            <option value="">اختر منتجاً</option>
                            <optgroup label="الألعاب">
                                {GAMES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </optgroup>
                            <optgroup label="الاشتراكات">
                                {SUBSCRIPTIONS.flatMap((s) => s.durations.map((d) => (
                                    <option key={d.id} value={d.id}>{s.name} — {d.label}</option>
                                )))}
                            </optgroup>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[hsl(var(--brand-ink))]/70 mb-1.5">الإجراء</label>
                        <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}
                            className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-white px-3 text-sm">
                            <option value="available">جعله متوفراً ✅</option>
                            <option value="unavailable">جعله غير متوفر ❌</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[hsl(var(--brand-ink))]/70 mb-1.5">وقت التنفيذ</label>
                        <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                            min={new Date().toISOString().slice(0, 16)} dir="ltr"
                            className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-white px-3 text-sm" />
                    </div>
                </div>
                <button onClick={add} className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full bg-[hsl(var(--brand-blue-deep))] text-white text-sm font-bold">
                    <Save className="w-4 h-4" /> جدولة
                </button>
            </div>

            {/* Pending schedules */}
            {pending.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <h3 className="font-bold text-[hsl(var(--brand-ink))]">مجدوَل ({pending.length})</h3>
                    </div>
                    {pending.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[hsl(var(--brand-ink))] truncate">{s.productName}</div>
                                <div className="text-xs text-[hsl(var(--brand-ink))]/50">
                                    <span className={s.action === "available" ? "text-green-600" : "text-[hsl(var(--brand-red))]"}>
                                        {s.action === "available" ? "✅ متوفر" : "❌ غير متوفر"}
                                    </span>
                                    {" · "}{fmtDate(s.scheduledAt)}
                                </div>
                            </div>
                            <button onClick={() => remove(s.id)} className="text-[hsl(var(--brand-red))]/50 hover:text-[hsl(var(--brand-red))]">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Executed schedules */}
            {executed.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 p-5 space-y-3 opacity-60">
                    <h3 className="font-bold text-xs text-[hsl(var(--brand-ink))]/60 uppercase tracking-wider">منفّذ ({executed.length})</h3>
                    {executed.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[hsl(var(--brand-ink))]/[0.03] border border-[hsl(var(--brand-ink))]/8">
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-[hsl(var(--brand-ink))]/70">{s.productName}</span>
                                <span className="text-xs text-[hsl(var(--brand-ink))]/40 ml-2">{fmtDate(s.scheduledAt)}</span>
                            </div>
                            <button onClick={() => remove(s.id)} className="text-[hsl(var(--brand-ink))]/20 hover:text-[hsl(var(--brand-red))]">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {schedules.length === 0 && (
                <div className="text-center py-10 text-sm text-[hsl(var(--brand-ink))]/40">
                    <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    لا توجد جدولة — أضف جدولة أولاً
                </div>
            )}
        </div>
    );
}
