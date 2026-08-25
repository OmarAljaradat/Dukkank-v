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

export default function SuppliersTab() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await apiListSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("تعذّر تحميل الموردين: " + formatApiError(e));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const resetForm = () => {
    setForm({ name: "", phone: "", notes: "" });
    setEditingId(null);
    setShowAdd(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("اسم المورد ورقم الهاتف مطلوبان");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await apiUpdateSupplier(editingId, form);
        toast.success("تم تحديث بيانات المورد ✅");
      } else {
        await apiCreateSupplier(form);
        toast.success("تم إضافة المورد بنجاح ✅");
      }
      resetForm();
      await fetchSuppliers();
    } catch (e) { toast.error(formatApiError(e)); }
    setSaving(false);
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, phone: s.phone, notes: s.notes || "" });
    setEditingId(s.id);
    setShowAdd(true);
  };

  const handleToggleActive = async (s) => {
    try {
      await apiUpdateSupplier(s.id, { is_active: !s.is_active });
      toast.success(s.is_active ? "تم تعطيل المورد" : "تم تفعيل المورد");
      await fetchSuppliers();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const handleDelete = async (s) => {
    if (!confirm(`حذف المورد "${s.name}"؟`)) return;
    try {
      await apiDeleteSupplier(s.id);
      toast.success("تم حذف المورد");
      await fetchSuppliers();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            إدارة الموردين
          </h2>
          <p className="text-sm text-slate-500 mt-1">أضف وأدر موردينك لتسهيل عملية إرسال الطلبات</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة مورد
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              {editingId ? "✏️ تعديل المورد" : "➕ مورد جديد"}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم المورد">
              <Input
                placeholder="مثال: أبو خالد"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="رقم الواتساب (دولي)">
              <Input
                placeholder="مثال: 962775585112"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                dir="ltr"
              />
            </Field>
          </div>
          <Field label="ملاحظات (اختياري)">
            <Textarea
              rows={2}
              placeholder="ملاحظات خاصة بالمورد..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingId ? "حفظ التعديلات" : "إضافة المورد"}
          </button>
        </div>
      )}

      {/* Suppliers List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-bold">لا يوجد موردين حتى الآن</p>
          <p className="text-sm mt-1">اضغط "إضافة مورد" لإضافة أول مورد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border-2 p-5 transition-all ${
                s.is_active ? "border-slate-200 hover:border-blue-200 shadow-sm" : "border-slate-200 opacity-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    s.is_active ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{s.name}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5" dir="ltr">
                      <Phone className="w-3.5 h-3.5" />
                      {s.phone}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {s.is_active ? "مفعّل" : "معطّل"}
                </span>
              </div>

              {s.notes && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{s.notes}</p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button onClick={() => handleEdit(s)} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" /> تعديل
                </button>
                <button onClick={() => handleToggleActive(s)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                  {s.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {s.is_active ? "تعطيل" : "تفعيل"}
                </button>
                <div className="flex-1" />
                <button onClick={() => handleDelete(s)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
