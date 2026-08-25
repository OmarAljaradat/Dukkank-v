import { useState, useEffect } from "react";
import { getToken } from "../../lib/api";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

const API = "/api/admin/content";

function useAdminContent(data, reload) {
    const [form, setForm] = useState(() => data || {});
    const [saving, setSaving] = useState(false);

    const save = async (section, updates) => {
        setSaving(true);
        try {
            const r = await fetch(API, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ [section]: updates }),
            });
            if (!r.ok) throw new Error();
            toast.success("✅ تم الحفظ");
            if (reload) reload();
        } catch {
            toast.error("فشل الحفظ");
        } finally {
            setSaving(false);
        }
        return saving;
    };

    return { form, setForm, save, saving };
}

const inputClass = "w-full rounded-xl border border-[hsl(var(--brand-ink))]/15 dark:border-white/10 bg-white dark:bg-white/[0.06] text-[hsl(var(--brand-ink))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/40 transition";
const labelClass = "block text-xs font-bold text-[hsl(var(--brand-ink))]/65 mb-1.5";

function SectionEditor({ title, icon, fields, values, onSave, saving }) {
    const [local, setLocal] = useState({ ...values });

    const handleSave = () => onSave(local);
    const set = (k, v) => setLocal(l => ({ ...l, [k]: v }));

    return (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-[hsl(var(--brand-ink))]/8 dark:border-white/8 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="font-bold text-[hsl(var(--brand-ink))]">{title}</h3>
            </div>
            <div className="p-5 space-y-4">
                {fields.map(({ key, label, type = "text", placeholder }) => (
                    <div key={key}>
                        <label className={labelClass}>{label}</label>
                        {type === "textarea" ? (
                            <textarea className={inputClass} rows={3} placeholder={placeholder}
                                value={local[key] || ""} onChange={e => set(key, e.target.value)} />
                        ) : (
                            <input className={inputClass} type={type} placeholder={placeholder}
                                value={local[key] || ""} onChange={e => set(key, e.target.value)} />
                        )}
                    </div>
                ))}
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ التغييرات
                </button>
            </div>
        </div>
    );
}

export default function StoreInfoTab({ onChanged }) {
    const [saving, setSaving] = useState(false);

    const save = async (section, values) => {
        setSaving(true);
        try {
            const r = await fetch(API, {
                method: "PUT",
                headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
                body: JSON.stringify({ [section]: values }),
            });
            if (!r.ok) throw new Error();
            toast.success("✅ تم الحفظ بنجاح");
            if (onChanged) onChanged();
        } catch {
            toast.error("فشل حفظ المحتوى");
        } finally {
            setSaving(false);
        }
    };

    const HOW_IT_WORKS_FIELDS = [
        { key: "eyebrow", label: "العنوان الفرعي الصغير", placeholder: "كيف تشتري؟" },
        { key: "title", label: "العنوان الرئيسي", placeholder: "٤ خطوات وتوصلك اللعبة" },
        { key: "description", label: "الوصف (اختياري)", type: "textarea", placeholder: "جملة قصيرة..." },
        { key: "step1Title", label: "الخطوة الأولى — العنوان", placeholder: "اختر ما تبي" },
        { key: "step1Desc", label: "الخطوة الأولى — الوصف", type: "textarea", placeholder: "تصفّح الألعاب..." },
        { key: "step2Title", label: "الخطوة الثانية — العنوان", placeholder: "أضف للسلة" },
        { key: "step2Desc", label: "الخطوة الثانية — الوصف", type: "textarea", placeholder: "حدد الجهاز والمدة..." },
        { key: "step3Title", label: "الخطوة الثالثة — العنوان", placeholder: "أرسل طلبك" },
        { key: "step3Desc", label: "الخطوة الثالثة — الوصف", type: "textarea", placeholder: "ينفتح واتساب..." },
        { key: "step4Title", label: "الخطوة الرابعة — العنوان", placeholder: "استلم فوراً" },
        { key: "step4Desc", label: "الخطوة الرابعة — الوصف", type: "textarea", placeholder: "بعد تأكيد الدفع..." },
    ];

    const ABOUT_FIELDS = [
        { key: "eyebrow", label: "العنوان الفرعي الصغير", placeholder: "عن المتجر" },
        { key: "title", label: "العنوان الرئيسي", placeholder: "دُكانك — متجرك الموثوق" },
        { key: "aboutTitle", label: "بطاقة «من نحن» — عنوان", placeholder: "من نحن" },
        { key: "aboutText", label: "بطاقة «من نحن» — نص", type: "textarea", placeholder: "دُكانك متجر..." },
        { key: "deliveryTitle", label: "بطاقة «التسليم» — عنوان", placeholder: "طريقة التسليم" },
        { key: "deliveryText", label: "بطاقة «التسليم» — نص", type: "textarea", placeholder: "التسليم يتم فوراً..." },
        { key: "accountTitle", label: "بطاقة «الحساب» — عنوان", placeholder: "نوع الحساب" },
        { key: "accountText", label: "بطاقة «الحساب» — نص", type: "textarea", placeholder: "الاشتراكات تفعَّل..." },
    ];

    const GUARANTEE_FIELDS = [
        { key: "eyebrow", label: "العنوان الفرعي الصغير", placeholder: "الضمان الذهبي" },
        { key: "title", label: "العنوان الرئيسي", placeholder: "نضمن لك ١٠٠٪" },
        { key: "description", label: "الوصف", type: "textarea", placeholder: "راحة بالك أهم شي عنا." },
        { key: "badgeText", label: "نص الشارة السفلية", placeholder: "ضمانك معنا على كل طلب..." },
        { key: "item1Title", label: "ضمان ١ — عنوان", placeholder: "حسابات أصلية مضمونة" },
        { key: "item1Desc", label: "ضمان ١ — وصف", type: "textarea", placeholder: "كل منتجاتنا أصلية..." },
        { key: "item2Title", label: "ضمان ٢ — عنوان", placeholder: "تسليم فوري" },
        { key: "item2Desc", label: "ضمان ٢ — وصف", type: "textarea", placeholder: "طلبك يوصلك خلال دقائق..." },
        { key: "item3Title", label: "ضمان ٣ — عنوان", placeholder: "دعم ٢٤/٧" },
        { key: "item3Desc", label: "ضمان ٣ — وصف", type: "textarea", placeholder: "فريقنا موجود دائماً..." },
        { key: "item4Title", label: "ضمان ٤ — عنوان", placeholder: "ضمان حل المشاكل" },
        { key: "item4Desc", label: "ضمان ٤ — وصف", type: "textarea", placeholder: "في حال أي إشكال..." },
    ];

    const sections = [
        { key: "howItWorks", title: "كيف يعمل الموقع", icon: "🪜", fields: HOW_IT_WORKS_FIELDS },
        { key: "aboutStore", title: "عن المتجر والتسليم", icon: "🏪", fields: ABOUT_FIELDS },
        { key: "goldenGuarantee", title: "الضمان الذهبي", icon: "🏅", fields: GUARANTEE_FIELDS },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[hsl(var(--brand-ink))]">🏪 أقسام المتجر الجديدة</h2>
                <p className="text-xs text-[hsl(var(--brand-ink))]/50 mt-1">
                    عدّل محتوى الأقسام الثلاثة الجديدة. يجب تفعيلها من «ترتيب الأقسام» لتظهر في الموقع.
                </p>
            </div>
            {sections.map(({ key, title, icon, fields }) => (
                <DefaultSection key={key} sectionKey={key} title={title} icon={icon} fields={fields} onSave={save} saving={saving} />
            ))}
        </div>
    );
}

function DefaultSection({ sectionKey, title, icon, fields, onSave, saving }) {
    const [local, setLocal] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const r = await fetch("/api/content");
                if (r.ok && mounted) {
                    const data = await r.json();
                    setLocal(data[sectionKey] || {});
                }
            } catch {}
        };
        load();
        return () => { mounted = false; };
    }, [sectionKey]);

    const set = (k, v) => setLocal(l => ({ ...l, [k]: v }));

    return (
        <div className="rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-[hsl(var(--brand-ink))]/8 dark:border-white/8 flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className="font-bold text-[hsl(var(--brand-ink))]">{title}</h3>
            </div>
            <div className="p-5 space-y-4">
                {fields.map(({ key, label, type = "text", placeholder }) => (
                    <div key={key}>
                        <label className={labelClass}>{label}</label>
                        {type === "textarea" ? (
                            <textarea className={inputClass} rows={2} placeholder={placeholder}
                                value={local[key] || ""} onChange={e => set(key, e.target.value)} />
                        ) : (
                            <input className={inputClass} type={type} placeholder={placeholder}
                                value={local[key] || ""} onChange={e => set(key, e.target.value)} />
                        )}
                    </div>
                ))}
                <button onClick={() => onSave(sectionKey, local)} disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ {title}
                </button>
            </div>
        </div>
    );
}
