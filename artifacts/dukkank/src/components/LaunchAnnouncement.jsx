import { useState, useEffect } from "react";
import { useStoreData } from "../contexts/DataContext";
import { X, ShoppingCart, Zap, Shield, Sparkles, Check, Flame, Clock, Gift, ShieldCheck, Gamepad2, Award } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { toast } from "sonner";

const SESSION_KEY = "dukkank_launch_seen_v5";

// Live Countdown Timer Hook
function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!targetDate) return;
        const target = new Date(targetDate).getTime();

        const update = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, target - now);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearTimeout(timer);
    }, [targetDate]);

    return timeLeft;
}

export function LaunchHeroBanner() {
    const { launchAnnouncement } = useStoreData();
    const { add } = useCart();
    const [selectedPlatform, setSelectedPlatform] = useState("five");

    const countdown = useCountdown(launchAnnouncement?.countdownTarget || "2026-10-25");

    if (!launchAnnouncement || launchAnnouncement.enabled === false) return null;

    const la = launchAnnouncement;
    const gameName = la.gameName || "Marvel's Spider-Man 2";
    const price5 = la.price5 != null ? la.price5 : 29.85;
    const price4 = la.price4 != null ? la.price4 : 19.5;
    const price = selectedPlatform === "five" ? price5 : price4;

    const handleAddToCart = () => {
        if (!price || Number(price) <= 0) return;
        const itemKey = `launch-${la.gameId || "game"}-${selectedPlatform}`;
        const itemTitle = `${gameName} (${selectedPlatform === "five" ? "PS5" : "PS4"}) — إطلاق ضخم`;

        add({
            key: itemKey,
            type: "game",
            title: itemTitle,
            subtitle: selectedPlatform === "five" ? "نسخة بلايستيشن 5 أصلية" : "نسخة بلايستيشن 4 أصلية",
            price: Number(price),
        });

        toast.success(`تمت إضافة ${gameName} إلى السلة 🛒!`, {
            description: `النسخة: ${selectedPlatform === "five" ? "PS5" : "PS4"} بسعر $${price}`,
        });
    };

    // Game Specific Visual Theme Builder
    const getGameThemeStyle = () => {
        const theme = la.theme || "gold";
        switch (theme) {
            case "eafc":
            case "green":
            case "emerald":
                return {
                    accentText: "text-emerald-400",
                    accentBg: "bg-emerald-500/20 border-emerald-500/60 text-emerald-300",
                    gradientOverlay: "from-emerald-950/90 via-slate-950/90 to-black/95",
                    glowColor: "rgba(16, 185, 129, 0.35)",
                    btnBg: "from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950",
                };
            case "red":
                return {
                    accentText: "text-red-400",
                    accentBg: "bg-red-500/20 border-red-500/60 text-red-300",
                    gradientOverlay: "from-red-950/90 via-slate-950/90 to-black/95",
                    glowColor: "rgba(239, 68, 68, 0.35)",
                    btnBg: "from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400",
                };
            case "blue":
                return {
                    accentText: "text-blue-400",
                    accentBg: "bg-blue-500/20 border-blue-500/60 text-blue-300",
                    gradientOverlay: "from-blue-950/90 via-slate-950/90 to-black/95",
                    glowColor: "rgba(59, 130, 246, 0.35)",
                    btnBg: "from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400",
                };
            case "cyber":
                return {
                    accentText: "text-purple-400",
                    accentBg: "bg-purple-500/20 border-purple-500/60 text-purple-300",
                    gradientOverlay: "from-purple-950/90 via-slate-950/90 to-black/95",
                    glowColor: "rgba(168, 85, 247, 0.35)",
                    btnBg: "from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400",
                };
            case "vice":
                return {
                    accentText: "text-pink-400",
                    accentBg: "bg-pink-500/20 border-pink-500/60 text-pink-300",
                    gradientOverlay: "from-pink-950/90 via-slate-950/90 to-black/95",
                    glowColor: "rgba(255, 45, 120, 0.4)",
                    btnBg: "from-pink-600 to-orange-400 hover:from-pink-500 hover:to-orange-300 text-white",
                };
            case "gold":
            default:
                return {
                    accentText: "text-amber-400",
                    accentBg: "bg-amber-500/20 border-amber-500/60 text-amber-300",
                    gradientOverlay: "from-amber-950/90 via-slate-950/90 to-black/95",
                    glowColor: "rgba(245, 158, 11, 0.35)",
                    btnBg: "from-amber-500 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950",
                };
        }
    };

    const style = getGameThemeStyle();

    return (
        <section id="gamelaunch" data-testid="gamelaunch-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            {/* Main Epic Hero Container with High Impact Background */}
            <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-amber-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-white">
                {/* Full-Bleed Game Backdrop Artwork with Smooth Zoom Animation */}
                {la.image && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <img
                            src={la.image}
                            alt={gameName}
                            className="w-full h-full object-cover object-center filter blur-[4px] scale-110 opacity-35 transition duration-1000 transform hover:scale-105"
                        />
                    </div>
                )}

                {/* Cinematic Multi-Layer Gradient Overlays */}
                <div className={`absolute inset-0 z-0 bg-gradient-to-r ${style.gradientOverlay}`} />
                <div className="absolute inset-0 z-0 bg-radial from-transparent via-slate-950/60 to-black/95" />

                {/* Animated Ambient Light Spheres */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-40 -right-40 w-[35rem] h-[35rem] rounded-full blur-[120px] animate-pulse" style={{ background: style.glowColor }} />
                    <div className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] rounded-full blur-[120px] animate-pulse" style={{ background: "rgba(16, 185, 129, 0.25)" }} />
                </div>

                {/* Grid Content Overlay */}
                <div className="relative z-10 p-6 sm:p-12 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-right dir-rtl" dir="rtl">
                    {/* Left Column (7 cols): Huge Game Title, Poster Artwork & Countdown */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Top Badges & Countdown */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black shadow-lg backdrop-blur-md ${style.accentBg}`}>
                                <Flame className="w-4 h-4 animate-bounce" />
                                <span>{la.badge || "🔥 متوفر الآن للطلب المباشر والتسليم الفوري"}</span>
                            </span>

                            {la.countdownTarget && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-xs font-mono font-black text-amber-400 shadow backdrop-blur-md">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    <span>{countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s</span>
                                </div>
                            )}
                        </div>

                        {/* Main Game Card with High Quality Artwork Cover */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {la.image && (
                                <div className="relative group shrink-0">
                                    <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-blue-600 rounded-3xl blur-lg opacity-80 group-hover:opacity-100 transition duration-700 animate-pulse" />
                                    <img
                                        src={la.image}
                                        alt={gameName}
                                        className="relative w-32 h-40 sm:w-40 sm:h-52 rounded-2xl object-cover border-2 border-white/20 shadow-2xl transition duration-500 transform group-hover:scale-105"
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className={`text-xs font-black tracking-[0.25em] uppercase flex items-center gap-1.5 ${style.accentText}`}>
                                    <Sparkles className="w-4 h-4" />
                                    <span>الإصدار الحصري والأكثر انتظاراً 👑</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                                    {gameName}
                                </h1>

                                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl drop-shadow">
                                    {la.subtitle || "احصل على حسابك الأصلي المضمون فوراً بأسعار توفيرية وسرعة تسليم خيالية."}
                                </p>
                            </div>
                        </div>

                        {/* Bonus Gift Highlight */}
                        {la.bonusGift && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent border-r-4 border-amber-400 text-xs font-black text-amber-300 flex items-center gap-2.5 shadow-lg backdrop-blur-md">
                                <Gift className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                                <span>{la.bonusGift}</span>
                            </div>
                        )}

                        {/* Gaming Features Badges Bar */}
                        <div className="grid grid-cols-3 gap-3 bg-white/10 p-4 rounded-2xl border border-white/15 text-center text-xs font-extrabold text-slate-100 backdrop-blur-md">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                                <span>ضمان ذهبي شامل 🛡️</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                <Zap className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                                <span>تسليم وتفعيل فوري ⚡</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                <Award className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                                <span>حساب أصلي Primary</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (5 cols): Glassmorphic Console Platform Cards & Express Cart Button */}
                    <div className="lg:col-span-5 bg-slate-900/90 p-6 sm:p-8 rounded-[2.5rem] border border-amber-500/40 space-y-6 shadow-2xl backdrop-blur-xl">
                        <div className="space-y-1 border-b border-white/10 pb-3">
                            <div className={`text-xs font-black flex items-center gap-1.5 ${style.accentText}`}>
                                <Gamepad2 className="w-4 h-4" />
                                <span>اختر نسخة جهازك المطلوبة:</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">تسليم أوتوماتيكي ومباشر مع الدعم الفني</p>
                        </div>

                        {/* Glassmorphic Platform Selector Cards */}
                        <div className="space-y-3.5">
                            <button
                                type="button"
                                onClick={() => setSelectedPlatform("five")}
                                className={`w-full p-4.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between group ${
                                    selectedPlatform === "five"
                                        ? "border-amber-400 bg-amber-500/30 text-white shadow-2xl scale-[1.02]"
                                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
                                }`}
                            >
                                <div className="space-y-0.5">
                                    <div className="font-black text-sm text-white flex items-center gap-2">
                                        <span>نسخة بلايستيشن 5 (PS5)</span>
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-300">أصلية 4K HDR</span>
                                    </div>
                                    <div className="text-xs text-slate-300 font-bold">حساب منفصل أصلي وتسليم أوتوماتيكي</div>
                                </div>
                                <div className="text-left shrink-0">
                                    <div className="text-xl font-black text-amber-300">${price5}</div>
                                    {selectedPlatform === "five" && <Check className="w-4 h-4 text-amber-400 ms-auto" />}
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedPlatform("four")}
                                className={`w-full p-4.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex items-center justify-between group ${
                                    selectedPlatform === "four"
                                        ? "border-blue-400 bg-blue-500/30 text-white shadow-2xl scale-[1.02]"
                                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
                                }`}
                            >
                                <div className="space-y-0.5">
                                    <div className="font-black text-sm text-white flex items-center gap-2">
                                        <span>نسخة بلايستيشن 4 (PS4)</span>
                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300">أصلية Full HD</span>
                                    </div>
                                    <div className="text-xs text-slate-300 font-bold">حساب منفصل أصلي وتسليم أوتوماتيكي</div>
                                </div>
                                <div className="text-left shrink-0">
                                    <div className="text-xl font-black text-blue-300">${price4}</div>
                                    {selectedPlatform === "four" && <Check className="w-4 h-4 text-blue-400 ms-auto" />}
                                </div>
                            </button>
                        </div>

                        {/* Total & Final Express Buy Button */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xs text-slate-400 font-bold">المجموع السعري النهائي:</div>
                                <div className="text-3xl font-black text-emerald-400">${price}</div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className={`px-7 py-4 rounded-2xl bg-gradient-to-r ${style.btnBg} font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition cursor-pointer active:scale-95`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>{la.ctaLabel || "شراء الآن والتسليم ⚡"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function LaunchAnnouncement() {
    const { launchAnnouncement } = useStoreData();
    const [visible, setVisible] = useState(false);
    const [entered, setEntered] = useState(false);
    const { add } = useCart();
    const [selectedPlatform, setSelectedPlatform] = useState("five");

    useEffect(() => {
        if (!launchAnnouncement?.enabled) return;
        if (sessionStorage.getItem(SESSION_KEY)) return;
        const t = setTimeout(() => {
            setVisible(true);
            requestAnimationFrame(() => setTimeout(() => setEntered(true), 30));
        }, 600);
        return () => clearTimeout(t);
    }, [launchAnnouncement?.enabled]);

    function dismiss() {
        setEntered(false);
        setTimeout(() => {
            sessionStorage.setItem(SESSION_KEY, "1");
            setVisible(false);
        }, 350);
    }

    if (!visible || !launchAnnouncement?.enabled) return null;

    const la = launchAnnouncement;
    const gameName = la.gameName || "Marvel's Spider-Man 2";
    const price5 = la.price5 != null ? la.price5 : 29.85;
    const price4 = la.price4 != null ? la.price4 : 19.5;
    const price = selectedPlatform === "five" ? price5 : price4;

    const handleAddToCart = () => {
        if (!price || Number(price) <= 0) return;
        const itemKey = `launch-${la.gameId || "game"}-${selectedPlatform}`;
        const itemTitle = `${gameName} (${selectedPlatform === "five" ? "PS5" : "PS4"}) — إطلاق ضخم`;

        add({
            key: itemKey,
            type: "game",
            title: itemTitle,
            subtitle: selectedPlatform === "five" ? "نسخة بلايستيشن 5 أصلية" : "نسخة بلايستيشن 4 أصلية",
            price: Number(price),
        });

        toast.success(`تمت إضافة ${gameName} إلى السلة 🛒!`, {
            description: `النسخة: ${selectedPlatform === "five" ? "PS5" : "PS4"} بسعر $${price}`,
        });
        dismiss();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            style={{
                background: entered ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0)",
                backdropFilter: "blur(12px)",
                transition: "background 0.4s ease, backdrop-filter 0.4s ease",
            }}
            onClick={(e) => e.target === e.currentTarget && dismiss()}
        >
            <div
                className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40 text-white"
                style={{
                    transform: entered ? "scale(1) translateY(0)" : "scale(0.92) translateY(30px)",
                    opacity: entered ? 1 : 0,
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease",
                    background: "linear-gradient(145deg, #0f0a00 0%, #171003 35%, #070913 70%, #030408 100%)",
                }}
            >
                <button
                    onClick={dismiss}
                    className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative z-10 p-6 sm:p-8 text-right space-y-6" dir="rtl">
                    <div className="flex items-center justify-start">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black shadow-lg">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>{la.badge || "🔥 متوفر الآن للطلب المباشر والتسليم الفوري"}</span>
                        </span>
                    </div>

                    <div className="flex items-start gap-4">
                        {la.image && (
                            <img
                                src={la.image}
                                alt={gameName}
                                className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl shrink-0"
                            />
                        )}

                        <div className="space-y-1.5">
                            <div className="text-[11px] font-black text-amber-400 tracking-widest uppercase">
                                الإصدار الأضخم والمنتظر 👑
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                {gameName}
                            </h2>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                {la.subtitle || "احصل على حسابك الأصلي المضمون فوراً بأسعار توفيرية وسرعة تسليم خيالية."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-2xl border border-white/10 text-center text-[11px] font-extrabold text-slate-200">
                        <div className="flex flex-col items-center gap-1">
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>ضمان كامل الفترة 🛡️</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>تسليم فوري ⚡</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span>حساب رئيسي Primary</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-300">اختر جهاز اللعب الخاص بك:</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedPlatform("five")}
                                className={`p-3.5 rounded-2xl border-2 text-right transition cursor-pointer flex items-center justify-between ${
                                    selectedPlatform === "five"
                                        ? "border-amber-400 bg-amber-500/20 text-white shadow-lg"
                                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                                }`}
                            >
                                <div>
                                    <div className="font-black text-xs text-white">نسخة PS5 🎮</div>
                                    <div className="text-[11px] font-bold text-amber-300 mt-0.5">${price5}</div>
                                </div>
                                {selectedPlatform === "five" && <Check className="w-4 h-4 text-amber-400" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedPlatform("four")}
                                className={`p-3.5 rounded-2xl border-2 text-right transition cursor-pointer flex items-center justify-between ${
                                    selectedPlatform === "four"
                                        ? "border-blue-400 bg-blue-500/20 text-white shadow-lg"
                                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                                }`}
                            >
                                <div>
                                    <div className="font-black text-xs text-white">نسخة PS4 🎮</div>
                                    <div className="text-[11px] font-bold text-blue-300 mt-0.5">${price4}</div>
                                </div>
                                {selectedPlatform === "four" && <Check className="w-4 h-4 text-blue-400" />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                        <div>
                            <div className="text-xs text-slate-400 font-bold">السعر النهائي:</div>
                            <div className="text-3xl font-black text-emerald-400 mt-0.5">
                                ${price}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={dismiss}
                                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
                            >
                                لاحقاً
                            </button>

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl transition cursor-pointer active:scale-95"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>{la.ctaLabel || "إضافة للسلة والتسليم ⚡"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
