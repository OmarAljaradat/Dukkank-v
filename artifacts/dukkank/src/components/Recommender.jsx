import { useState, useMemo } from "react";
import { Sparkles, Gamepad2, Plus, Check, Zap, Filter, Compass, ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useStoreData } from "../contexts/DataContext";
import { GameCard } from "./GameCard";
import { toast } from "sonner";

const TIER_LABEL = { four: "PS4", five: "PS5" };

const MOODS = [
    { id: "all", label: "🔥 الكل", keywords: [] },
    { id: "action", label: "⚔️ أكشن وشوتر", keywords: ["call of duty", "cod", "warfare", "black ops", "shooter", "action", "battlefield", "ghost"] },
    { id: "sports", label: "⚽ كورة ورياضة", keywords: ["fifa", "fc", "sports", "football", "soccer", "ea sports"] },
    { id: "racing", label: "🏎️ سباق وسيارات", keywords: ["need for speed", "nfs", "racing", "cars", "drive", "heat"] },
    { id: "stealth", label: "🕵️ غموض وتسلل", keywords: ["hitman", "stealth", "assassin", "agent 47", "horror", "resident evil"] },
    { id: "openworld", label: "🤠 عالم مفتوح", keywords: ["red dead", "gta", "open world", "rdr", "rdr2", "cowboy", "witcher", "cyberpunk"] },
    { id: "party", label: "🎉 ضحك وجماعي", keywords: ["gang beasts", "party", "multiplayer", "fun", "friends", "overcooked", "it takes two"] },
];

const BUDGETS = [
    { id: "all", label: "الكل" },
    { id: "low", label: "💸 أقل من 15$", maxPrice: 15 },
    { id: "mid", label: "💰 15$ - 30$", minPrice: 15, maxPrice: 30 },
    { id: "high", label: "👑 أكثر من 30$", minPrice: 30 },
];

export function Recommender() {
    const { games } = useStoreData();
    const { add } = useCart();
    const { format } = useCurrency();

    const [selectedMood, setSelectedMood] = useState("all");
    const [selectedBudget, setSelectedBudget] = useState("all");
    const [addingId, setAddingId] = useState(null);

    const availableGames = useMemo(() => (games || []).filter((g) => g.available !== false && g.visible !== false && !g.hidden), [games]);

    // Filter games instantly based on mood & budget
    const matchedGames = useMemo(() => {
        return availableGames.filter((g) => {
            // Mood filter
            if (selectedMood !== "all") {
                const moodObj = MOODS.find((m) => m.id === selectedMood);
                if (moodObj && moodObj.keywords.length > 0) {
                    const blob = `${g.name || ""} ${g.sub || ""} ${(g.tags || []).join(" ")}`.toLowerCase();
                    const matchesMood = moodObj.keywords.some((k) => blob.includes(k.toLowerCase()));
                    if (!matchesMood) return false;
                }
            }

            // Budget filter
            const price = g.five != null ? g.five : (g.four != null ? g.four : 0);
            if (selectedBudget === "low" && price >= 15) return false;
            if (selectedBudget === "mid" && (price < 15 || price > 30)) return false;
            if (selectedBudget === "high" && price <= 30) return false;

            return true;
        });
    }, [availableGames, selectedMood, selectedBudget]);

    return (
        <section id="smart-picker" data-testid="recommender-section" className="py-14 sm:py-20 bg-white/40 dark:bg-white/[0.02] border-y border-[hsl(var(--brand-ink))]/10">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
                
                {/* Header */}
                <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] text-xs font-extrabold border border-[hsl(var(--brand-blue-deep))]/20">
                        <Compass className="w-4 h-4 animate-spin-slow" />
                        <span>مُرشّح الألعاب الفوري الذكي</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--brand-ink))] leading-tight">
                        ما عرفت شو تلعب؟ <span className="text-[hsl(var(--brand-blue-deep))]">اختر مودك وتعرّف على لعبتك!</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-[hsl(var(--brand-ink))]/70 font-medium leading-relaxed">
                        اختر التصنيف المفضل وميزانيتك المناسبة لتكتشف أفضل الألعاب المتوافقة مع اهتمامك فوراً.
                    </p>
                </div>

                {/* Filters Control Card */}
                <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 sm:p-8 space-y-6 shadow-sm">
                    
                    {/* 1. Mood Filter */}
                    <div className="space-y-3">
                        <div className="text-xs font-extrabold text-[hsl(var(--brand-ink))]/70 flex items-center gap-1.5">
                            <Gamepad2 className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                            <span>اختر المود أو تصنيف اللعبة:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {MOODS.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMood(m.id)}
                                    className={`px-4 h-10 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 ${
                                        selectedMood === m.id
                                            ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-md scale-105"
                                            : "bg-[hsl(var(--brand-cream))] dark:bg-white/10 text-[hsl(var(--brand-ink))]/80 hover:bg-[hsl(var(--brand-ink))]/10"
                                    }`}
                                >
                                    <span>{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[hsl(var(--brand-ink))]/10" />

                    {/* 2. Budget Filter */}
                    <div className="space-y-3">
                        <div className="text-xs font-extrabold text-[hsl(var(--brand-ink))]/70 flex items-center gap-1.5">
                            <Filter className="w-4 h-4 text-[hsl(var(--brand-gold))]" />
                            <span>اختر الميزانية المناسبة لك:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {BUDGETS.map((b) => (
                                <button
                                    key={b.id}
                                    onClick={() => setSelectedBudget(b.id)}
                                    className={`px-4 h-10 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 active:scale-95 ${
                                        selectedBudget === b.id
                                            ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-md scale-105"
                                            : "bg-[hsl(var(--brand-cream))] dark:bg-white/10 text-[hsl(var(--brand-ink))]/80 hover:bg-[hsl(var(--brand-ink))]/10"
                                    }`}
                                >
                                    <span>{b.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Matched Games Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[hsl(var(--brand-ink))]/70 px-1">
                        <span>🎯 وجدنا لك ({matchedGames.length}) لعبة مطابقة لاختيارك:</span>
                        {(selectedMood !== "all" || selectedBudget !== "all") && (
                            <button
                                onClick={() => { setSelectedMood("all"); setSelectedBudget("all"); }}
                                className="text-[hsl(var(--brand-red))] hover:underline"
                            >
                                إزالة الفلاتر ✕
                            </button>
                        )}
                    </div>

                    {matchedGames.length === 0 ? (
                        <div className="bg-white dark:bg-white/[0.04] rounded-3xl p-12 text-center border border-[hsl(var(--brand-ink))]/10 space-y-3">
                            <Gamepad2 className="w-12 h-12 text-[hsl(var(--brand-ink))]/30 mx-auto" />
                            <p className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">لا توجد ألعاب مطابقة لهذا الفلتر حالياً</p>
                            <p className="text-xs text-[hsl(var(--brand-ink))]/50">جرب تغيير المود أو خفض نطاق الميزانية لإعادة العثور على ألعاب.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                            {matchedGames.slice(0, 6).map((g) => (
                                <GameCard key={g.id} game={g} />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
