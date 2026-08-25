import { useState, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { apiUpdateSiteSettings, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Save, Loader2, Wrench, MousePointer2, Eye, EyeOff, Shield, CameraOff, FileText } from "lucide-react";
import { MaintenanceOverlay } from "../MaintenanceOverlay";

const Field = ({ label, hint, children }) => (
    <label className="block">
        <span className="block text-xs font-bold text-[hsl(var(--brand-ink))]/70 mb-1.5">{label}</span>
        {children}
        {hint && <span className="block text-[11px] text-[hsl(var(--brand-ink))]/50 mt-1">{hint}</span>}
    </label>
);

const Input = (props) => (
    <input
        {...props}
        className={`w-full h-11 rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none ${
            props.className || ""
        }`}
    />
);

const Toggle = ({ checked, onChange, label, testId }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        data-testid={testId}
        className={`relative inline-flex items-center gap-3 rounded-2xl border-2 px-4 py-3 w-full transition-colors cursor-pointer ${
            checked
                ? "border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/20"
                : "border-[hsl(var(--brand-ink))]/15 bg-white dark:bg-slate-900 hover:bg-[hsl(var(--brand-cream))]/50"
        }`}
    >
        <span
            dir="ltr"
            className={`relative inline-block w-11 h-6 rounded-full transition-colors shrink-0 ${
                checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
        >
            <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    checked ? "left-[22px]" : "left-[2px]"
                }`}
            />
        </span>
        <span className="text-sm font-bold text-[hsl(var(--brand-ink))] dark:text-white">{label}</span>
    </button>
);

export default function SiteSettingsTab({ onChanged }) {
    const { siteSettings } = useStoreData();
    const [maintEnabled, setMaintEnabled] = useState(false);
    const [maintTitle, setMaintTitle] = useState("الموقع تحت الصيانة");
    const [maintMessage, setMaintMessage] = useState("");
    const [maintReturn, setMaintReturn] = useState("");
    
    const [disableSelection, setDisableSelection] = useState(false);
    const [disableRightClick, setDisableRightClick] = useState(false);
    const [disableScreenshot, setDisableScreenshot] = useState(false);
    
    const [policies, setPolicies] = useState({
        privacy: "",
        terms: "",
        refund: "",
        warranty: ""
    });

    const [preview, setPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!siteSettings) return;
        const m = siteSettings.maintenanceMode || {};
        setMaintEnabled(!!m.enabled);
        setMaintTitle(m.title || "الموقع تحت الصيانة");
        setMaintMessage(m.message || "");
        setMaintReturn(m.estimatedReturn || "");
        
        setDisableSelection(!!siteSettings.disableTextSelection);
        setDisableRightClick(!!siteSettings.disableRightClick);
        setDisableScreenshot(!!siteSettings.disableScreenshot);
        
        const p = siteSettings.policies || {};
        setPolicies({
            privacy: p.privacy || "",
            terms: p.terms || "",
            refund: p.refund || "",
            warranty: p.warranty || ""
        });
    }, [siteSettings]);

    const onSave = async () => {
        setSaving(true);
        try {
            await apiUpdateSiteSettings({
                maintenanceMode: {
                    enabled: maintEnabled,
                    title: maintTitle,
                    message: maintMessage,
                    estimatedReturn: maintReturn,
                    showCountdown: false,
                },
                disableTextSelection: disableSelection,
                disableRightClick: disableRightClick,
                disableScreenshot: disableScreenshot,
                policies: policies,
            });
            toast.success("تم حفظ إعدادات الموقع");
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* MAINTENANCE MODE */}
            <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 sm:p-8 card-elevated">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-red))]/10 text-[hsl(var(--brand-red))] flex items-center justify-center">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--brand-ink))]">
                            وضع الصيانة
                        </h2>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/60 mt-0.5">
                            لما يكون مفعّل، الزوار يشوفون شاشة صيانة جميلة. أنت كأدمن تقدر تتجاوزها وتدخل عادي.
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-5">
                    <Toggle
                        checked={maintEnabled}
                        onChange={setMaintEnabled}
                        label={maintEnabled ? "✓ وضع الصيانة مفعّل" : "وضع الصيانة معطّل"}
                        testId="maintenance-toggle"
                    />
                    <button
                        type="button"
                        onClick={() => setPreview(true)}
                        data-testid="maintenance-preview"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-blue-deep))] hover:bg-[hsl(var(--brand-blue-deep))] hover:text-white transition-colors px-5 h-auto py-3 text-sm font-bold"
                    >
                        <Eye className="w-4 h-4" />
                        معاينة الشاشة
                    </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="عنوان الصفحة" hint="مثال: نعمل على ترقيات للموقع">
                        <Input
                            data-testid="maintenance-title"
                            value={maintTitle}
                            onChange={(e) => setMaintTitle(e.target.value)}
                            placeholder="الموقع تحت الصيانة"
                        />
                    </Field>
                    <Field label="وقت الرجوع المتوقع (اختياري)" hint="مثال: خلال ساعة • غداً 9 صباحاً">
                        <Input
                            data-testid="maintenance-return"
                            value={maintReturn}
                            onChange={(e) => setMaintReturn(e.target.value)}
                            placeholder="خلال ساعة"
                        />
                    </Field>
                </div>

                <div className="mt-4">
                    <Field label="رسالة للزوار" hint="مدعومة الأسطر المتعددة">
                        <textarea
                            data-testid="maintenance-message"
                            value={maintMessage}
                            onChange={(e) => setMaintMessage(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 py-3 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none"
                            placeholder="نعمل على تحسينات رهيبة وراح نرجعلكم قريباً 🚀"
                        />
                    </Field>
                </div>
            </section>

            {/* PROTECTION SETTINGS */}
            <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 sm:p-8 card-elevated">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-blue))]/15 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--brand-ink))]">
                            حماية المحتوى
                        </h2>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/60 mt-0.5">
                            إعدادات لمنع سرقة أو نسخ محتوى المتجر.
                        </p>
                    </div>
                </div>
                
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                    <Toggle
                        checked={disableSelection}
                        onChange={setDisableSelection}
                        label={disableSelection ? "✓ منع تحديد النص" : "تحديد النص مسموح"}
                        testId="disable-selection-toggle"
                    />
                    <Toggle
                        checked={disableRightClick}
                        onChange={setDisableRightClick}
                        label={disableRightClick ? "✓ منع الزر الأيمن" : "الزر الأيمن مسموح"}
                        testId="disable-rightclick-toggle"
                    />
                    <Toggle
                        checked={disableScreenshot}
                        onChange={setDisableScreenshot}
                        label={disableScreenshot ? "✓ تشويش لقطات الشاشة" : "لقطات الشاشة مسموحة"}
                        testId="disable-screenshot-toggle"
                    />
                </div>
            </section>
            
            {/* POLICIES */}
            <section className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 sm:p-8 card-elevated">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[hsl(var(--brand-ink))]">
                            السياسات والأحكام
                        </h2>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/60 mt-0.5">
                            تحرير سياسات المتجر ليتم عرضها في صفحات الفوتر للعملاء.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="سياسة الخصوصية">
                        <textarea
                            value={policies.privacy}
                            onChange={(e) => setPolicies({...policies, privacy: e.target.value})}
                            rows={5}
                            className="w-full rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 py-3 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none resize-y"
                            placeholder="اكتب سياسة الخصوصية هنا..."
                        />
                    </Field>
                    
                    <Field label="الشروط والأحكام">
                        <textarea
                            value={policies.terms}
                            onChange={(e) => setPolicies({...policies, terms: e.target.value})}
                            rows={5}
                            className="w-full rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 py-3 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none resize-y"
                            placeholder="اكتب الشروط والأحكام هنا..."
                        />
                    </Field>
                    
                    <Field label="سياسة الاسترجاع والاستبدال">
                        <textarea
                            value={policies.refund}
                            onChange={(e) => setPolicies({...policies, refund: e.target.value})}
                            rows={5}
                            className="w-full rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 py-3 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none resize-y"
                            placeholder="اكتب سياسة الاسترجاع والاستبدال هنا..."
                        />
                    </Field>
                    
                    <Field label="سياسة الضمان الذهبي">
                        <textarea
                            value={policies.warranty}
                            onChange={(e) => setPolicies({...policies, warranty: e.target.value})}
                            rows={5}
                            className="w-full rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 py-3 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none resize-y"
                            placeholder="اكتب سياسة الضمان الذهبي هنا..."
                        />
                    </Field>
                </div>
            </section>

            {/* SAVE BAR */}
            <div className="sticky bottom-3 z-10">
                <div className="rounded-2xl bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] shadow-2xl px-5 py-3 flex items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm opacity-80">
                        {maintEnabled
                            ? "⚠️ وضع الصيانة مفعّل — الزوار راح يشوفوا شاشة الصيانة"
                            : "كل التغييرات تنطبق فوراً بعد الحفظ"}
                    </span>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        data-testid="save-site-settings"
                        className="inline-flex items-center gap-2 rounded-full px-5 h-10 bg-[hsl(var(--brand-red))] hover:bg-[hsl(var(--brand-red))]/85 text-white text-sm font-bold disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                </div>
            </div>

            {/* Preview modal */}
            {preview && (
                <div className="fixed inset-0 z-[9998]">
                    <MaintenanceOverlay
                        title={maintTitle}
                        message={maintMessage}
                        estimatedReturn={maintReturn}
                    />
                    <button
                        type="button"
                        onClick={() => setPreview(false)}
                        data-testid="maintenance-preview-close"
                        className="fixed top-4 right-4 z-[10000] inline-flex items-center gap-2 rounded-full px-5 h-11 bg-white text-[hsl(var(--brand-ink))] text-sm font-bold shadow-2xl hover:bg-[hsl(var(--brand-cream))]"
                    >
                        <EyeOff className="w-4 h-4" />
                        إغلاق المعاينة
                    </button>
                </div>
            )}
        </div>
    );
}
