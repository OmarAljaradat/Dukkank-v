// ══════════════════════════════════════════════════════════════════════════════
// ── OrderDukkank v1.0 — Suppliers Management Tab ─────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Truck, Plus, Trash2, Edit3, Phone, Save, Loader2, X, Check, User, ToggleLeft, ToggleRight
} from "lucide-react";
import {
  apiListSuppliers, apiCreateSupplier, apiUpdateSupplier, apiDeleteSupplier, formatApiError
} from "../../lib/api";
import { Input, Field, Textarea } from "./_widgets";

const LOCAL_SUPPLIERS_KEY = "dukkank_suppliers_list";

const getSavedSuppliers = () => {
  try {
    const val = localStorage.getItem(LOCAL_SUPPLIERS_KEY);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

const saveLocalSuppliers = (list) => {
  try { localStorage.setItem(LOCAL_SUPPLIERS_KEY, JSON.stringify(list)); } catch {}
};

export default function SuppliersTab() {
  const [suppliers, setSuppliers] = useState(() => getSavedSuppliers() || []);
  const [loading, setLoading] = useState(() => !getSavedSuppliers());
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await apiListSuppliers();
      const serverList = Array.isArray(data) ? data : [];
      const localList = getSavedSuppliers() || [];
      
      // Merge unique by ID or name
      const mergedMap = new Map();
      localList.forEach(s => mergedMap.set(String(s.id || s.name), s));
      serverList.forEach(s => mergedMap.set(String(s.id || s.name), s));
      const merged = Array.from(mergedMap.values());
      
      const finalList = merged.length > 0 ? merged : serverList;
      setSuppliers(finalList);
      saveLocalSuppliers(finalList);
    } catch (e) {
      const localList = getSavedSuppliers();
      if (!localList || localList.length === 0) {
        toast.error("تعذّر تحميل الموردين: " + formatApiError(e));
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const resetForm = () => {
    setForm({ name: "", phone: "", notes: "" });
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("اسم المورد ورقم الهاتف مطلوبان ⚠️");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const nextList = suppliers.map((s) => (s.id === editingId ? { ...s, ...form } : s));
        setSuppliers(nextList);
        saveLocalSuppliers(nextList);
        try { await apiUpdateSupplier(editingId, form); } catch {}
        toast.success("تم تحديث بيانات المورد بنجاح ✅");
      } else {
        const tempId = Date.now();
        const newSupplier = {
          id: tempId,
          name: form.name.trim(),
          phone: form.phone.trim(),
          notes: form.notes.trim() || undefined,
          is_active: true,
          created_at: new Date().toISOString()
        };
        const nextList = [newSupplier, ...suppliers];
        setSuppliers(nextList);
        saveLocalSuppliers(nextList);
        try { await apiCreateSupplier(form); } catch {}
        toast.success("تمت إضافة المورد الجديد بنجاح ✅");
      }
      resetForm();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, phone: s.phone, notes: s.notes || "" });
    setEditingId(s.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (s) => {
    const nextState = !s.is_active;
    const nextList = suppliers.map((x) => (x.id === s.id ? { ...x, is_active: nextState } : x));
    setSuppliers(nextList);
    saveLocalSuppliers(nextList);
    try {
      await apiUpdateSupplier(s.id, { is_active: nextState });
      toast.success(nextState ? `تم تفعيل المورد (${s.name}) 🟢` : `تم تعطيل المورد (${s.name}) ⚪`);
    } catch (e) {
      toast.error(formatApiError(e));
      await fetchSuppliers();
    }
  };

  const handleDelete = async (s) => {
    if (!confirm(`هل أنت متأكد من حذف المورد "${s.name}"؟`)) return;
    const nextList = suppliers.filter((x) => x.id !== s.id);
    setSuppliers(nextList);
    saveLocalSuppliers(nextList);
    try {
      await apiDeleteSupplier(s.id);
      toast.success(`تم حذف المورد "${s.name}" 🗑️`);
    } catch (e) {
      toast.error(formatApiError(e));
      await fetchSuppliers();
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black flex items-center gap-2">
              <span>إدارة الموردين (Suppliers Master)</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">أضف وأدر موردينك لتسهيل عملية إرسال وتمرير طلبات العملاء فوراً</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showAdd && !editingId) {
              setShowAdd(false);
            } else {
              resetForm();
              setShowAdd(true);
            }
          }}
          className={`flex items-center justify-center gap-2 px-5 h-11 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg ${
            showAdd
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAdd ? "إغلاق النموذج" : "إضافة مورد جديد +"}</span>
        </button>
      </div>

      {/* Add/Edit Form Box */}
      {showAdd && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-blue-500/40 p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{editingId ? "✏️ تعديل بيانات المورد" : "➕ إضافة مورد جديد للقائمة"}</span>
            </h3>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم المورد أو جهة التزويد *">
              <Input
                required
                placeholder="مثال: أبو خالد (مورد الحسابات)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="رقم الواتساب للتواصل وتمرير الطلبات *">
              <Input
                required
                placeholder="مثال: 962775585112"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label="ملاحظات وشروط التزويد (اختياري)">
            <Textarea
              rows={2}
              placeholder="مثال: متاح للتسليم يومياً من الساعة 10 صباحاً وحتى 2 ليلاً..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs disabled:opacity-50 transition-all cursor-pointer shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "حفظ التعديلات ✅" : "إضافة المورد لقائمتي ✅"}</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-4 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Suppliers List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Truck className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-40" />
          <p className="font-black text-slate-700 dark:text-slate-300 text-base">لا يوجد موردين مسجلين حتى الآن</p>
          <p className="text-xs text-slate-400 mt-1">اضغط على زر "إضافة مورد جديد +" في الأعلى لإضافة أول مورد في متجرك</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                s.is_active ? "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700" : "border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-950"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      s.is_active ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-800" : "bg-slate-100 text-slate-400"
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white text-sm">{s.name}</h4>
                      <a
                        href={`https://wa.me/${String(s.phone).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline mt-0.5"
                        dir="ltr"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{s.phone}</span>
                      </a>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    s.is_active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" : "bg-slate-100 text-slate-500"
                  }`}>
                    {s.is_active ? "🟢 مفعّل" : "⚪ معطّل"}
                  </span>
                </div>

                {s.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                    {s.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleEdit(s)}
                  className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {s.is_active ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{s.is_active ? "تعطيل" : "تفعيل"}</span>
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  title="حذف المورد"
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
