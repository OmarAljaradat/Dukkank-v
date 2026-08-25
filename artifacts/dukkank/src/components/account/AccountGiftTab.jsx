import { useState, useMemo } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { Gift, Sparkles, Search, ShoppingBag, X, Check, Cake, GraduationCap, Gamepad2, Heart, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AccountGiftTab({ addToCart, setCartOpen }) {
    const { games = [], subscriptions = [] } = useStoreData();

    // Dynamically compile all active products from Store Data Context
    const storeProducts = useMemo(() => {
        const list = [];

        // 1. Add Games from Database / DataContext
        (games || []).forEach(g => {
            if (g.available !== false && g.name) {
                const price = g.five != null ? Number(g.five) : (g.four != null ? Number(g.four) : 20);
                list.push({
                    id: `game-${g.id}`,
                    title: g.name,
                    sub: g.sub || "لعبة رقمية",
                    price: price,
                    image: g.image || null,
                    type: "لعبة",
                });
            }
        });

        // 2. Add Subscriptions from Database / DataContext
        (subscriptions || []).forEach(s => {
            if (s.visible !== false) {
                (s.durations || []).forEach(d => {
                    const price = d.five != null ? Number(d.five) : (d.four != null ? Number(d.four) : 25);
                    list.push({
                        id: `sub-${s.id}-${d.id}`,
                        title: `${s.name} (${d.label})`,
                        sub: s.tagline || "اشتراك بلس رقمي",
                        price: price,
                        image: null,
                        type: "اشتراك",
                    });
                });
            }
        });

        return list;
    }, [games, subscriptions]);

    // Form states
    const [selectedProduct, setSelectedProduct] = useState(storeProducts[0] || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showBrowseModal, setShowBrowseModal] = useState(false);

    const [friendName, setFriendName] = useState("");
    const [friendPhone, setFriendPhone] = useState("");
    const [message, setMessage] = useState("");
    const [theme, setTheme] = useState("birthday");

    const themes = [
        { id: "birthday", title: "عيد ميلاد 🎂", icon: Cake, bg: "from-pink-600 via-rose-600 to-red-600", text: "كل عام وأنت بخير يا أسطورة! 🎂🎮" },
        { id: "graduation", title: "نجاح وتخرج 🎓", icon: GraduationCap, bg: "from-purple-600 via-indigo-600 to-blue-600", text: "ألف مبروك النجاح والتخرج! تستاهل أطلق لعبة 🎓🔥" },
        { id: "gaming", title: "تحدي قيمنج 🎮", icon: Gamepad2, bg: "from-emerald-600 via-teal-600 to-cyan-600", text: "جتك هدية عشان نلعب سوا ونكسر بعض! 🎮⚡" },
        { id: "thanks", title: "تقدير وشكر 🌟", icon: Heart, bg: "from-amber-500 via-orange-600 to-red-600", text: "هدية بسيطة تعبيراً عن امتناني لك يا غالي 🌟❤️" },
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    // Filtered products for dropdown search
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return storeProducts.slice(0, 8);
        return storeProducts.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sub.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [storeProducts, searchQuery]);

    const activeProduct = selectedProduct || storeProducts[0] || { title: "اختر منتجاً من المتجر", price: 20 };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!activeProduct || !activeProduct.title) {
            toast.error("يرجى اختيار اللعبة أو الاشتراك المهدى من المتجر");
            return;
        }

        const finalMsg = message.trim() || currentTheme.text;
        const giftId = `GFT-${Math.floor(10000 + Math.random() * 90000)}`;

        const newGiftRecord = {
            id: giftId,
            orderId: `DK-${Math.floor(10000 + Math.random() * 90000)}`,
            senderName: "زبون المتجر",
            senderEmail: "customer@dukkank.com",
            recipientName: friendName || "صديقك",
            recipientPhone: friendPhone || "",
            gameTitle: activeProduct.title,
            price: activeProduct.price,
            theme: currentTheme.title,
            message: finalMsg,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        try {
            const saved = JSON.parse(localStorage.getItem("dukkank_admin_gifts") || "[]");
            localStorage.setItem("dukkank_admin_gifts", JSON.stringify([newGiftRecord, ...saved]));
        } catch (_) {}

        addToCart({
            key: `gift-${Date.now()}`,
            title: `🎁 هدية: ${activeProduct.title}`,
            subtitle: `مخصصة لـ: ${friendName || "صديقك"} ${friendPhone ? `(${friendPhone})` : ""}`,
            price: activeProduct.price,
        });

        setCartOpen(true);
        toast.success(`تمت إعداد هدية (${friendName || "صديقك"}) وإضافتها للسلة! 🎁`, {
            description: "أكمل عملية الدفع وسيقوم الفريق بتفعيل الحساب وإرسال بطاقة التهنئة."
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--brand-ink))]/10">
                <div>
                    <h2 className="text-xl font-black text-[hsl(var(--brand-ink))] flex items-center gap-2">
                        <Gift className="w-6 h-6 text-pink-500 animate-bounce" />
                        <span>إهداء لعبة لصديق 🎁</span>
                    </h2>
                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium mt-0.5">
                        اختر أي لعبة أو اشتراك متاح بالمتجر فوراً وفاجئ صديقك مع بطاقة تهنئة رقمية!
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 space-y-5 shadow-xs">
                    
                    {/* 1. Recipient Info */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-[hsl(var(--brand-ink))] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] flex items-center justify-center font-black">1</span>
                            <span>معلومات الصديق المهدى إليه:</span>
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                required
                                value={friendName}
                                onChange={(e) => setFriendName(e.target.value)}
                                placeholder="اسم صديقك (مثال: عبدالله)"
                                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/30 text-xs font-bold focus:outline-none focus:border-pink-500"
                            />
                            <input
                                type="tel"
                                value={friendPhone}
                                onChange={(e) => setFriendPhone(e.target.value)}
                                placeholder="رقم واتساب صديقك (اختياري)"
                                className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/30 text-xs font-bold focus:outline-none focus:border-pink-500"
                            />
                        </div>
                    </div>

                    {/* 2. DYNAMIC Store Product Selector & Search */}
                    <div className="space-y-3 pt-2 border-t border-[hsl(var(--brand-ink))]/10 relative">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-[hsl(var(--brand-ink))] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] flex items-center justify-center font-black">2</span>
                                <span>اختر اللعبة أو الاشتراك من المتجر:</span>
                            </label>
                            
                            <button
                                type="button"
                                onClick={() => setShowBrowseModal(true)}
                                className="text-xs font-black text-pink-600 hover:text-pink-700 flex items-center gap-1 hover:underline"
                            >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>تصفح كل منتجات المتجر 🛒</span>
                            </button>
                        </div>

                        {/* Selected Product Card Display */}
                        <div className="relative">
                            <div
                                onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                                className="w-full p-3.5 rounded-2xl border-2 border-pink-500/30 bg-pink-50/40 hover:bg-pink-50 cursor-pointer transition-all flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-pink-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                                        🎮
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="font-extrabold text-xs text-[hsl(var(--brand-ink))] truncate">
                                            {activeProduct.title}
                                        </div>
                                        <div className="text-[11px] text-pink-700 font-bold">
                                            السعر: ${activeProduct.price?.toFixed(2)} • {activeProduct.sub || "متوفر بالمتجر"}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-pink-600 font-bold shrink-0 bg-white px-2.5 py-1 rounded-lg border border-pink-200 shadow-xs">
                                    تغيير ⚡
                                </span>
                            </div>

                            {/* Dynamic Live Search Dropdown */}
                            {showSearchDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-2xl border border-[hsl(var(--brand-ink))]/15 shadow-xl p-3 space-y-3 max-h-72 overflow-y-auto animate-in fade-in duration-150">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-[hsl(var(--brand-ink))]/40 absolute right-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="ابحث باسم اللعبة أو الاشتراك..."
                                            className="w-full h-9 pr-8 pl-3 rounded-xl border border-[hsl(var(--brand-ink))]/15 text-xs font-bold focus:outline-none focus:border-pink-500"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        {filteredProducts.map((prod) => (
                                            <div
                                                key={prod.id}
                                                onClick={() => {
                                                    setSelectedProduct(prod);
                                                    setShowSearchDropdown(false);
                                                    setSearchQuery("");
                                                }}
                                                className="p-2.5 rounded-xl hover:bg-pink-50 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-bold text-xs text-[hsl(var(--brand-ink))] truncate">
                                                        {prod.title}
                                                    </div>
                                                    <div className="text-[10px] text-[hsl(var(--brand-ink))]/50">
                                                        {prod.type} • {prod.sub}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-pink-600 shrink-0">
                                                    ${prod.price?.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Theme Selection */}
                    <div className="space-y-3 pt-2 border-t border-[hsl(var(--brand-ink))]/10">
                        <label className="text-xs font-black text-[hsl(var(--brand-ink))] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] flex items-center justify-center font-black">3</span>
                            <span>اختر ثيم المناسبة:</span>
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {themes.map((t) => (
                                <button
                                    type="button"
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`h-10 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                                        theme === t.id
                                            ? "bg-pink-600 text-white border-pink-600 shadow-sm scale-102"
                                            : "bg-[hsl(var(--brand-cream))]/40 border-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))]/80 hover:bg-pink-50"
                                    }`}
                                >
                                    <span>{t.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Message */}
                    <div className="space-y-2 pt-2 border-t border-[hsl(var(--brand-ink))]/10">
                        <label className="text-xs font-black text-[hsl(var(--brand-ink))] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 text-[11px] flex items-center justify-center font-black">4</span>
                            <span>رسالة التهنئة المخصصة:</span>
                        </label>

                        <textarea
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={currentTheme.text}
                            className="w-full p-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/30 text-xs font-medium focus:outline-none focus:border-pink-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Gift className="w-4.5 h-4.5" />
                        <span>إضافة الهدية للسلة وإتمام الشراء (${activeProduct.price?.toFixed(2)}) 🚀</span>
                    </button>
                </form>

                {/* Live Card Preview Section */}
                <div className="lg:col-span-5 space-y-3 sticky top-4">
                    <div className="text-xs font-black text-[hsl(var(--brand-ink))]/70 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span>معاينة بطاقة الإهداء الرقمية مباشرة:</span>
                    </div>

                    {/* Dynamic Digital Gift Card */}
                    <div className={`bg-gradient-to-br ${currentTheme.bg} text-white p-6 sm:p-7 rounded-3xl shadow-xl space-y-5 relative overflow-hidden border border-white/20 transition-all duration-500`}>
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/20 rounded-full blur-2xl pointer-events-none" />

                        {/* Top Card Header */}
                        <div className="flex items-center justify-between border-b border-white/20 pb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-sm">
                                    🎁
                                </span>
                                <span className="font-black text-sm tracking-tight">بطاقة إهداء رقمية</span>
                            </div>
                            <span className="text-[10px] font-black bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/20">
                                متجر دُكانك 🎮
                            </span>
                        </div>

                        {/* Card Recipient & Game Info */}
                        <div className="space-y-3 relative z-10">
                            <div>
                                <div className="text-xs text-white/70 font-medium">مقدمة خاصة إلى:</div>
                                <div className="text-2xl font-black text-white tracking-tight">
                                    {friendName || "اسم صديقك العزيز"}
                                </div>
                            </div>

                            <div className="bg-white/15 backdrop-blur p-3.5 rounded-2xl border border-white/20 space-y-1">
                                <div className="text-[10px] text-white/80 font-bold">الهدية المختارة:</div>
                                <div className="text-sm font-black text-yellow-300">
                                    {activeProduct.title}
                                </div>
                            </div>

                            {/* Message Quote Box */}
                            <div className="bg-black/20 backdrop-blur p-4 rounded-2xl border border-white/10 text-xs text-white/90 font-medium leading-relaxed italic">
                                "{message.trim() || currentTheme.text}"
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/80 font-bold relative z-10">
                            <span>تفعيل فوري آمن ⚡</span>
                            <span>تفعيل الحساب يُسّلم فوراً 🎮</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* FULL STORE BROWSE MODAL */}
            {showBrowseModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-[hsl(var(--brand-ink))]/10 pb-4">
                            <div>
                                <h3 className="font-black text-lg text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-pink-600" />
                                    <span>اختر من جميع منتجات المتجر المتاحة 🎮</span>
                                </h3>
                                <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">
                                    يتم تحديث هذه القائمة تلقائياً مع أي منتج جديد في المتجر.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowBrowseModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search Input in Modal */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-[hsl(var(--brand-ink))]/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث باسم اللعبة أو الاشتراك..."
                                className="w-full h-11 pr-9 pl-4 rounded-xl border border-[hsl(var(--brand-ink))]/15 text-xs font-bold focus:outline-none focus:border-pink-500"
                            />
                        </div>

                        {/* Products Grid inside Modal */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
                            {filteredProducts.map((prod) => (
                                <div
                                    key={prod.id}
                                    onClick={() => {
                                        setSelectedProduct(prod);
                                        setShowBrowseModal(false);
                                        toast.success(`تم اختيار: ${prod.title} 🎁`);
                                    }}
                                    className="p-3.5 rounded-2xl border border-[hsl(var(--brand-ink))]/10 hover:border-pink-500 bg-white hover:bg-pink-50/50 cursor-pointer flex items-center justify-between gap-3 transition-all group"
                                >
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="font-extrabold text-xs text-[hsl(var(--brand-ink))] truncate group-hover:text-pink-600">
                                            {prod.title}
                                        </div>
                                        <div className="text-[11px] text-[hsl(var(--brand-ink))]/50 truncate">
                                            {prod.type} • {prod.sub}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-black text-pink-600">
                                            ${prod.price?.toFixed(2)}
                                        </div>
                                        <span className="text-[10px] text-pink-500 font-bold underline">
                                            اختيار ➔
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
