import { useState, useEffect } from "react";
import { getTheme, setTheme, applyTheme } from "../../lib/storage";
import { toast } from "sonner";
import { Palette, RotateCcw, Save, Sparkles, Check, Gamepad2, ShoppingCart, ShieldCheck } from "lucide-react";

const VARS = [
    { key: "brand-cream", label: "خلفية الموقع الرئيسية (Cream/Bg)", default: "38 47% 92%" },
    { key: "brand-ink", label: "لون النص والعناوين الرئيسي (Ink)", default: "215 30% 12%" },
    { key: "brand-blue-deep", label: "اللون الأزرق الملكي الداكن (Primary)", default: "211 45% 28%" },
    { key: "brand-blue", label: "الأزرق الفاتح والأوسمة (Secondary)", default: "211 39% 53%" },
    { key: "brand-red", label: "لون العروض والأحمر المميز (Promo Red)", default: "4 60% 47%" },
    { key: "brand-red-soft", label: "الأحمر الناعم للخصومات (Soft Red)", default: "4 65% 56%" },
];

const PRESETS = [
    {
        id: "original",
        name: "🔥 دُكانك الفاخر (الأصلي)",
        desc: "الثيم الكلاسيكي الملكي لمتاجر الألعاب الرقمية.",
        colors: {
            "brand-cream": "38 47% 92%",
            "brand-ink": "215 30% 12%",
            "brand-blue-deep": "211 45% 28%",
            "brand-blue": "211 39% 53%",
            "brand-red": "4 60% 47%",
            "brand-red-soft": "4 65% 56%",
        },
    },
    {
        id: "playstation",
        name: "🎮 بلايستيشن كلاسيك (PS Royal Blue)",
        desc: "ألوان سوني وبلايستيشن الملكية الرسمية.",
        colors: {
            "brand-cream": "220 25% 95%",
            "brand-ink": "222 47% 11%",
            "brand-blue-deep": "221 83% 40%",
            "brand-blue": "217 91% 60%",
            "brand-red": "262 83% 58%",
            "brand-red-soft": "270 70% 65%",
        },
    },
    {
        id: "cyber",
        name: "⚡ سايبر بانك نيون (Cyber Gamer)",
        desc: "ألوان نيون سايبر الجريئة للغيمنغ الحديث.",
        colors: {
            "brand-cream": "240 10% 96%",
            "brand-ink": "240 25% 10%",
            "brand-blue-deep": "280 80% 40%",
            "brand-blue": "185 96% 45%",
            "brand-red": "325 90% 52%",
            "brand-red-soft": "330 85% 62%",
        },
    },
    {
        id: "emerald",
        name: "💎 دبي الملكي الزمردي (Emerald Gold)",
        desc: "ثيم زاهي وفخم بلون الزمرد والأخضر الفاخر.",
        colors: {
            "brand-cream": "150 20% 95%",
            "brand-ink": "160 50% 9%",
            "brand-blue-deep": "160 84% 28%",
            "brand-blue": "160 65% 42%",
            "brand-red": "42 90% 48%",
            "brand-red-soft": "42 85% 58%",
        },
    },
    {
        id: "stealth",
        name: "🌙 مود الليلي الحالك (Stealth Black)",
        desc: "مظهر داكن غامق ومريح للعين 100%.",
        colors: {
            "brand-cream": "0 0% 12%",
            "brand-ink": "0 0% 95%",
            "brand-blue-deep": "0 0% 25%",
            "brand-blue": "0 0% 60%",
            "brand-red": "0 80% 50%",
            "brand-red-soft": "0 75% 60%",
        },
    },
];

function hslToHex(hsl) {
    if (!hsl) return "#000000";
    const parts = hsl.trim().split(/\s+/);
    let h = parseFloat(parts[0]);
    let s = parseFloat(parts[1]) / 100;
    let l = parseFloat(parts[2]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function ThemeTab() {
    const [values, setValues] = useState({});

    useEffect(() => {
        const saved = getTheme();
        const init = {};
        VARS.forEach((v) => { init[v.key] = saved[v.key] || v.default; });
        setValues(init);
    }, []);

    const save = () => {
        setTheme(values);
        applyTheme(values);
        toast.success("تم حفظ ثيم الألوان وتطبيقه على كافة أجزاء المتجر 🎨✅");
    };

    const reset = () => {
        const def = {};
        VARS.forEach((v) => { def[v.key] = v.default; });
        setValues(def);
        setTheme({});
        applyTheme({});
        toast.success("تم إعادة الألوان للثيم الأصلي المعتمد");
    };

    const applyPreset = (preset) => {
        setValues(preset.colors);
        setTheme(preset.colors);
        applyTheme(preset.colors);
        toast.success(`تم تطبيق ثيم "${preset.name}" بنجاح ✨`);
    };

    return (
        <div data-testid="theme-tab" className="space-y-6">
            {/* Header Title Card */}
            <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Palette className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <span>محرر الألوان والهوية البصرية للمتجر (Theme & Design System)</span>
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                خيارت الهوية البصرية — اختر قوالب جاهزة بنقرة واحدة أو خضّص الألوان يدوياً مع معاينة فورية!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={reset}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>إعادة تعيين</span>
                        </button>
                        <button
                            onClick={save}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
                        >
                            <Save className="w-4 h-4" />
                            <span>حفظ وتطبيق الثيم 🎨</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Presets Cards Grid */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>قوالب ألوان جاهزة بنقرة واحدة (One-Click Color Presets):</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {PRESETS.map((preset) => (
                        <div
                            key={preset.id}
                            onClick={() => applyPreset(preset)}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-2xl p-4 cursor-pointer transition shadow-sm hover:shadow-md space-y-3 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-blue-500 transition">
                                        {preset.name}
                                    </h4>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                    {preset.desc}
                                </p>
                            </div>

                            {/* Color Bar Preview */}
                            <div className="h-6 rounded-xl overflow-hidden flex border border-slate-200 dark:border-slate-800">
                                {Object.entries(preset.colors).map(([k, hsl]) => (
                                    <div
                                        key={k}
                                        className="flex-1 h-full"
                                        style={{ background: `hsl(${hsl})` }}
                                        title={k}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Color Pickers Grid & Interactive Card Preview */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Pickers Left Column */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-500" />
                        <span>تعديل قيم الألوان يدوياً (Manual HSL/HEX Controls):</span>
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {VARS.map((v) => {
                            const hsl = values[v.key] || v.default;
                            let hex = "#ffffff";
                            try { hex = hslToHex(hsl); } catch { }

                            return (
                                <div
                                    key={v.key}
                                    className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5"
                                >
                                    <label className="relative cursor-pointer shrink-0">
                                        <input
                                            type="color"
                                            value={hex}
                                            onChange={(e) => {
                                                const newHsl = hexToHsl(e.target.value);
                                                setValues((p) => ({ ...p, [v.key]: newHsl }));
                                            }}
                                            className="sr-only"
                                        />
                                        <div
                                            className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-700 shadow-md hover:scale-110 transition-transform"
                                            style={{ background: `hsl(${hsl})` }}
                                        />
                                    </label>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {v.label}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <code className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                                                {hex}
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Interactive Preview Card */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 self-start sticky top-20">
                    <div className="text-xs font-black text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <Sparkles className="w-4 h-4" />
                        <span>معاينة حية لكرت لعبة بالمتجر بالألوان المختارة:</span>
                    </div>

                    {/* Live Render Card */}
                    <div
                        className="rounded-2xl p-4 border transition-all shadow-xl space-y-3 dir-rtl"
                        style={{
                            backgroundColor: `hsl(${values["brand-cream"] || "38 47% 92%"})`,
                            color: `hsl(${values["brand-ink"] || "215 30% 12%"})`,
                            borderColor: `hsl(${values["brand-blue-deep"] || "211 45% 28%"})`,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-black text-white"
                                style={{ backgroundColor: `hsl(${values["brand-red"] || "4 60% 47%"})` }}
                            >
                                خصم 25% 🔥
                            </span>
                            <span
                                className="text-[11px] font-bold"
                                style={{ color: `hsl(${values["brand-blue-deep"] || "211 45% 28%"})` }}
                            >
                                EA SPORTS FC 25
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-black">حساب بلايستيشن 5 — تسليم فوري</div>
                            <div className="text-xs opacity-75">نسخة أصلية 100% مع ضمان ذهبي مدى الحياة.</div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-black/10">
                            <div>
                                <span className="text-xs text-red-600 line-through pl-1 font-bold">140 $</span>
                                <span
                                    className="text-sm font-black"
                                    style={{ color: `hsl(${values["brand-blue-deep"] || "211 45% 28%"})` }}
                                >
                                    99 $
                                </span>
                            </div>

                            <button
                                className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white shadow-md flex items-center gap-1 cursor-pointer"
                                style={{ backgroundColor: `hsl(${values["brand-blue-deep"] || "211 45% 28%"})` }}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>أضف للسلة</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
                        <span>تحديث فوري لبطاقات المتجر</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
