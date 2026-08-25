import React, { useState, useMemo, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import {
    apiCreateReview,
    apiUpdateReview,
    apiDeleteReview,
    formatApiError,
} from "../../lib/api";
import { toast } from "sonner";
import { lsGet, lsSet } from "../../lib/storage";
import {
    Star, Plus, Trash2, Save, Loader2, Pencil, X, MessageCircle,
    CheckCircle2, ShieldCheck, Search, Filter, Sparkles, ThumbsUp,
    Eye, EyeOff, CornerDownLeft, RefreshCw, Award, Heart, Pin
} from "lucide-react";

const INITIAL_DEMO_REVIEWS = [
    { id: "rev-101", name: "عبدالعزيز الشمري 🇸🇦", rating: 5, text: "متجر سرعة وإنجاز خيالية! استلمت حساب FC 25 خلال 3 دقائق فقط والحساب شغال 100%، شكراً لكم على التعامل الراقي ❤️🎮", product: "EA SPORTS FC 25 Ultimate Edition", verified: true, visible: true, pinned: true, adminReply: "يسعدنا جداً خدمتك أخي عبدالعزيز! نتمنى لك أوقاتاً ممتعة 🎮🔥", date: "2026-07-27" },
    { id: "rev-102", name: "فهد العتيبي 🇸🇦", rating: 5, text: "أفخم متجر لشحن اشتراكات البلس! السعر أرخص من الاستور الرسمي والتفعيل فوري ⚡", product: "PlayStation Plus Deluxe 12 Month", verified: true, visible: true, pinned: true, adminReply: "", date: "2026-07-27" },
    { id: "rev-103", name: "محمد الخالدي 🇰🇼", rating: 5, text: "ثقة وسرعة بالتجاوب بالواتساب. الدعم الفني ماشاء الله رد سريع ومحترم.", product: "GTA VI (Pre-Order)", verified: true, visible: true, pinned: true, adminReply: "شكراً لك أخي محمد على ثقتك العالية بمتجرنا 🤝✨", date: "2026-07-26" },
    { id: "rev-104", name: "سلطان المطيري 🇸🇦", rating: 5, text: "أفضل خدمة عملاء شفتها بمتاجر الألعاب. المود حليليم ويردون بدقيقة.", product: "Call of Duty: Black Ops 6", verified: true, visible: true, pinned: true, adminReply: "", date: "2026-07-26" },
    { id: "rev-105", name: "عبدالله الستريمر 🇦🇪", rating: 5, text: "طلبنا 5 حسابات للبث المباشر وتم تسليمها كلها بنفس اللحظة. متجر يبيض الوجه!", product: "PlayStation Plus Extra 12M", verified: true, visible: true, pinned: true, adminReply: "كل التوفيق لك ولجمهورك الحبيب أخي عبدالله 🚀❤️", date: "2026-07-25" },
    { id: "rev-106", name: "حمد آل ثاني 🇶🇦", rating: 5, text: "شحنت روبوكس لعيالي ووصلت ثواني معدودة بعد الدفع! أنصح التعامل معهم شديد.", product: "Roblox 10,000 Robux", verified: true, visible: true, pinned: true, adminReply: "", date: "2026-07-25" },
    { id: "rev-107", name: "تركي السديري 🇸🇦", rating: 5, text: "جربت كثير من المتاجر وهذا الأفضل بكل المقاييس. المتجر موثوق، توصيل فوري، ودعم جاهز.", product: "Elden Ring Shadow of Erdtree", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-24" },
    { id: "rev-108", name: "يوسف العنزي 🇰🇼", rating: 5, text: "أسعار البطاقات عندهم تحطيم للسوق الرسمي. كود ستيم وصلني بالإيميل والواتس فوراً.", product: "Steam Wallet $100 Card", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-24" },
    { id: "rev-109", name: "سعود القحطاني 🇸🇦", rating: 5, text: "شراء كوينز فيفا بدون أي تبنيد! شحنت مليون كوينز وأسلوب التكنيك عندهم آمن جداً.", product: "EA SPORTS FC 25 Coins (1 Million)", verified: true, visible: true, pinned: false, adminReply: "المحافظة على أمان حسابات عملائنا هي أولويتنا دائماً أخي سعود 🛡️✨", date: "2026-07-23" },
    { id: "rev-110", name: "عمر البلوشي 🇴🇲", rating: 5, text: "التفعيل للأكس بوكس جيم باس شغال ممتاز بدون أي مشاكل وسعر مميز جداً.", product: "Xbox Game Pass Ultimate 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-23" },
    { id: "rev-111", name: "خالد آل خليفة 🇧🇭", rating: 5, text: "أسرع شحن فورتنايت في البحرين والخليج! 13 ألف فـي بوكس بحسابي بلمح البصر.", product: "Fortnite 13,500 V-Bucks", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-22" },
    { id: "rev-112", name: "أحمد الزهراني 🇸🇦", rating: 5, text: "شحنت فالورانت نقاط VP والأسعار عندهم أطلق من المتجر المباشر بصراحة.", product: "Valorant 5,350 VP Points", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-22" },
    { id: "rev-113", name: "بدر الحربي 🇸🇦", rating: 5, text: "تعامل راقي جداً والتسليم كان فوري. اشتراك البلس اشتغل فوراً على السوني 5.", product: "PlayStation Plus Essential 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-21" },
    { id: "rev-114", name: "نايف الدوسري 🇸🇦", rating: 5, text: "من أفضل التجارب بالأونلاين، الشراء سهل والدعم الفني تواصلوا معي لتأكيد الاستلام.", product: "EA SPORTS FC 25 Standard Edition", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-21" },
    { id: "rev-115", name: "ماجد الرشيدي 🇰🇼", rating: 5, text: "أخذت إضافة سايبك بنك وكان الكود شغال 100% بدون أي أخطاء. يعطيكم الف عافية.", product: "Cyberpunk 2077 Phantom Liberty", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-20" },
    { id: "rev-116", name: "سليمان المهندي 🇶🇦", rating: 5, text: "سنة ديسكورد نيترو بسعر خيالي وتفعيل رسمي بالحساب بدون مشاكل.", product: "Discord Nitro 1 Year Subscription", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-20" },
    { id: "rev-117", name: "طارق الشمري 🇸🇦", rating: 5, text: "طلب مسبق لكود كول اوف ديوتي الفولت اديشن واستلمت الهدايا باللعبة فوراً.", product: "Call of Duty: Black Ops 6 Vault Edition", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-19" },
    { id: "rev-118", name: "عصام النابلسي 🇯🇴", rating: 5, text: "خدمة فائقة السرعة والمصداقية 100%. شحنت محفظة ستيم وشغالة تمام.", product: "Steam Wallet Card $50", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-19" },
    { id: "rev-119", name: "مصطفى العراقي 🇮🇶", rating: 5, text: "عاشت ايديكم متجر ممتاز وسريع جدا بالتسليم والتعامل ارقى ما يكون.", product: "EA SPORTS FC 25 Ultimate Edition", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-18" },
    { id: "rev-120", name: "حسن المصري 🇪🇬", rating: 5, text: "شحن ببجي يوسي فوري ووصلت الحساب في نفس الدقيقة، متجر محترم جداً.", product: "PUBG Mobile 8,100 UC", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-18" },
    { id: "rev-121", name: "سعيد المزروعي 🇦🇪", rating: 5, text: "اشتراك البلس الديلوكس شغال زي الفل، والسعر توفير ممتاز.", product: "PlayStation Plus Deluxe 12 Month", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-17" },
    { id: "rev-122", name: "عادل الغامدي 🇸🇦", rating: 5, text: "شحنت 12 ألف نقاط نقاط اف سي والتسليم كان فوري تلقائي.", product: "FC Points 12,000 Pack", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-17" },
    { id: "rev-123", name: "منصور السبيعي 🇸🇦", rating: 5, text: "حجزت قراند 6 بري أوردر ومتحمس للعبة! المتجر مضمون ومعروف سمعته طيبة.", product: "GTA VI (Pre-Order)", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-16" },
    { id: "rev-124", name: "طلال الهاجري 🇰🇼", rating: 5, text: "اشتراك نينتندو سويتش اونلاين عائلي بسعر ممتاز جداً وتفعيل فوري.", product: "Nintendo Switch Online 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-16" },
    { id: "rev-125", name: "راشد المري 🇶🇦", rating: 5, text: "متجركم الصراحة ينشد فيه الظهر، مصداقية وسرعة بالواتساب.", product: "EA SPORTS FC 25 Standard Edition", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-15" },
    { id: "rev-126", name: "مشاري المطيري 🇸🇦", rating: 5, text: "سنة كاملة بلس اكسترا والسعر يفرق 40% عن الاستور الرسمي!", product: "PlayStation Plus Extra 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-15" },
    { id: "rev-127", name: "فيصل العجمي 🇰🇼", rating: 5, text: "شحن روبوكس سريع وآمن للعيال، شكراً لكم على الاحترافية.", product: "Roblox 4,500 Robux", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-14" },
    { id: "rev-128", name: "عمران الظاهري 🇦🇪", rating: 5, text: "بطاقة ستيم 200 دولار وصلت خلال ثواني وفعّلتها مباشرة.", product: "Steam Wallet $200 Card", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-14" },
    { id: "rev-129", name: "زياد العمري 🇸🇦", rating: 5, text: "كول اوف ديوتي كود شغال ومضمون وسعر منافس جداً.", product: "Call of Duty: Black Ops 6", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-13" },
    { id: "rev-130", name: "مبارك العازمي 🇰🇼", rating: 5, text: "أفضل خدمة جيم باس التيميت للأكس بوكس والبي سي.", product: "Xbox Game Pass Ultimate 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-13" },
    { id: "rev-131", name: "سالم الكعبي 🇴🇲", rating: 5, text: "سرعة في نقل الكوينز وأمان تام للحساب دون أي مشاكل.", product: "EA SPORTS FC 25 Coins (500k)", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-12" },
    { id: "rev-132", name: "خالد البوعينين 🇧🇭", rating: 5, text: "فورتنايت 5 آلاف V-Bucks وصلوني بنفس اللحظة شكراً لكم.", product: "Fortnite 5,000 V-Bucks", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-12" },
    { id: "rev-133", name: "مروان الحمادي 🇦🇪", rating: 5, text: "نقاط فالورانت 10 آلاف نقطة بسعر ممتاز جداً والتسليم أوتوماتيكي.", product: "Valorant 10,500 VP Points", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-11" },
    { id: "rev-134", name: "ثامر الجوف 🇸🇦", rating: 5, text: "نقاط فيفا بوينتس وصلوا الحساب بدقيقة واحدة بعد الشراء.", product: "FC Points 5,900 Pack", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-11" },
    { id: "rev-135", name: "وليد الشامي 🇯🇴", rating: 5, text: "تعامل ممتاز وشحن ستيم سريع جداً، تحياتي لكم من الأردن.", product: "Steam Wallet Card $50", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-10" },
    { id: "rev-136", name: "سامر التميمي 🇮🇶", rating: 5, text: "شغلة مضمونة ومتجر ثقة، طلبنا قراند 6 ومستعدين للانطلاق.", product: "GTA VI (Pre-Order)", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-10" },
    { id: "rev-137", name: "محمود الشربيني 🇪🇬", rating: 5, text: "بطاقة جوجل بلاي شغالة 100% والتسليم أسرع من التوقعات.", product: "Google Play Card $50", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-09" },
    { id: "rev-138", name: "مشعل المالكي 🇸🇦", rating: 5, text: "سنة بلس ديلوكس بسعر ممتاز وخدمة دعم واتساب 24 ساعة.", product: "PlayStation Plus Deluxe 12 Month", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-09" },
    { id: "rev-139", name: "عبدالرحمن البقمي 🇸🇦", rating: 5, text: "أخذت اف سي 25 الالتيميت اديشن والحساب شغال تمام والتفعيل فوري.", product: "EA SPORTS FC 25 Ultimate Edition", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-08" },
    { id: "rev-140", name: "فهد المطوع 🇰🇼", rating: 5, text: "شحن روبوكس 10 آلاف حبة بحساب العيال بنفس اللحظة ممتازين.", product: "Roblox 10,000 Robux", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-08" },
    { id: "rev-141", name: "سعود الكواري 🇶🇦", rating: 5, text: "كول اوف ديوتي كود التفعيل وصل بالواتساب والإيميل ثواني.", product: "Call of Duty: Black Ops 6", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-07" },
    { id: "rev-142", name: "حمدان الشامسي 🇦🇪", rating: 5, text: "اشتراك البلس اكسترا ممتاز وسعر بطل، شكراً متجر دُكانك.", product: "PlayStation Plus Extra 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-07" },
    { id: "rev-143", name: "صالح الحارثي 🇸🇦", rating: 5, text: "إضافة الدن رينغ شغالة تمام بدون أي مشاكل بالسوني 5.", product: "Elden Ring Shadow of Erdtree", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-06" },
    { id: "rev-144", name: "عيسى الخاطر 🇶🇦", rating: 5, text: "كود ستيم 100 دولار وصل بالدقيقة والتفعيل تم بنجاح.", product: "Steam Wallet $100 Card", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-06" },
    { id: "rev-145", name: "بدر العبدلي 🇰🇼", rating: 5, text: "شحن كوينز فيفا آمن جداً وما قصروا بالدعم الفني بالواتس.", product: "EA SPORTS FC 25 Coins (1M)", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-05" },
    { id: "rev-146", name: "نواف السهلي 🇸🇦", rating: 5, text: "اشتراك البلس اسينشال بسعر ممتاز جداً وتفعيل فوري على الحساب.", product: "PlayStation Plus Essential 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-05" },
    { id: "rev-147", name: "هيثم المعمري 🇴🇲", rating: 5, text: "جيم باس التيميت للأكس بوكس شغال 100% وسعر رائع.", product: "Xbox Game Pass Ultimate 12M", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-04" },
    { id: "rev-148", name: "جاسم النعيمي 🇧🇭", rating: 5, text: "شحن فورتنايت رائع وسريع في البحرين، تجربة ممتازة جداً.", product: "Fortnite 13,500 V-Bucks", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-04" },
    { id: "rev-149", name: "فراس العلي 🇯🇴", rating: 5, text: "شحنت نقاط فالورانت ووصلت الحساب في أقل من دقيقتين.", product: "Valorant 5,350 VP Points", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-03" },
    { id: "rev-150", name: "أحمد الكردي 🇮🇶", rating: 5, text: "خدمة ممتازة وسريعة جداً تسليم تلقائي فور اتمام الدفع.", product: "EA SPORTS FC 25 Ultimate Edition", verified: true, visible: true, pinned: false, adminReply: "", date: "2026-07-03" },
];

function StarPicker({ value, onChange }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                >
                    <Star
                        className={`w-6 h-6 ${
                            n <= value
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function ReviewsTab({ onChanged }) {
    const { reviews: storeReviews, setReviews: setStoreReviews } = useStoreData();
    const [reviews, setLocalReviews] = useState(() => {
        const saved = lsGet("store_reviews_list", null);
        if (saved && Array.isArray(saved) && saved.length >= 45) return saved;
        lsSet("store_reviews_list", INITIAL_DEMO_REVIEWS);
        return INITIAL_DEMO_REVIEWS;
    });

    const [editing, setEditing] = useState(null);
    const [replyingId, setReplyingId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "approved"
    const [starFilter, setStarFilter] = useState("all");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        lsSet("store_reviews_list", reviews);
        if (setStoreReviews) setStoreReviews(reviews);
    }, [reviews, setStoreReviews]);

    // Pending count
    const pendingCount = useMemo(() => {
        return reviews.filter(r => r.status === "pending" || r.visible === false).length;
    }, [reviews]);

    const startNew = () => setEditing({
        id: "rev-" + Date.now().toString(36),
        name: "",
        rating: 5,
        text: "",
        product: "EA SPORTS FC 25",
        verified: true,
        visible: true,
        adminReply: "",
        date: new Date().toISOString().split('T')[0],
    });

    const startEdit = (r) => setEditing({ ...r });

    const saveReview = async () => {
        if (!editing?.name?.trim() || !editing?.text?.trim()) {
            toast.error("يرجى كتابة اسم العميل ونص التقييم");
            return;
        }

        setBusy(true);
        try {
            const exists = reviews.some((r) => r.id === editing.id);
            const updated = exists
                ? reviews.map((r) => (r.id === editing.id ? editing : r))
                : [editing, ...reviews];

            setLocalReviews(updated);

            try {
                if (exists) await apiUpdateReview(editing.id, editing);
                else await apiCreateReview(editing);
            } catch { /* graceful fallback */ }

            toast.success(exists ? "تم تحديث التقييم بنجاح ⭐" : "تمت إضافة التقييم بنجاح ⭐");
            setEditing(null);
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setBusy(false);
        }
    };

    const removeReview = async (id) => {
        if (!window.confirm("هل تريد حذف هذا التقييم نهائياً؟")) return;
        try {
            const updated = reviews.filter((r) => r.id !== id);
            setLocalReviews(updated);
            try { await apiDeleteReview(id); } catch {}
            toast.success("تم حذف التقييم بنجاح 🗑️");
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        }
    };

    const toggleVisibility = (id) => {
        const updated = reviews.map((r) => r.id === id ? { ...r, visible: !r.visible } : r);
        setLocalReviews(updated);
        toast.success("تم تحديث حالة ظهور التقييم 👁️");
    };

    const togglePin = (id) => {
        const target = reviews.find((r) => r.id === id);
        const currentlyPinnedCount = reviews.filter((r) => r.pinned).length;

        if (!target?.pinned && currentlyPinnedCount >= 6) {
            toast.error("يمكنك تثبيت 6 تقييمات كحد أقصى في الواجهة الرئيسية. يرجى إلغاء تثبيت أحدهم أولاً 📌");
            return;
        }

        const updated = reviews.map((r) => r.id === id ? { ...r, pinned: !r.pinned } : r);
        setLocalReviews(updated);
        toast.success(target?.pinned ? "تم إلغاء التثبيت من الواجهة الرئيسية 📌" : "تم تثبيت التقييم في 6 الواجهة الرئيسية 📌🔥");
    };

    const saveAdminReply = (id) => {
        const updated = reviews.map((r) => r.id === id ? { ...r, adminReply: replyText.trim() } : r);
        setLocalReviews(updated);
        setReplyingId(null);
        setReplyText("");
        toast.success("تم إضافة رد الإدارة على التقييم 💬✨");
    };

    const generateDemoBatch = () => {
        setLocalReviews(INITIAL_DEMO_REVIEWS);
        lsSet("store_reviews_list", INITIAL_DEMO_REVIEWS);
        if (setStoreReviews) setStoreReviews(INITIAL_DEMO_REVIEWS);
        toast.success("تم إعادة ضبط وتحميل الـ 50 تقييم المتنوعة بنجاح 🌟🔥");
    };

    // Filtered Reviews
    const filteredReviews = useMemo(() => {
        return reviews.filter((r) => {
            const q = search.toLowerCase().trim();
            const matchesSearch = r.name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q) || (r.product && r.product.toLowerCase().includes(q));
            const matchesStar = starFilter === "all" ? true : r.rating === Number(starFilter);
            
            let matchesStatus = true;
            if (statusFilter === "pending") {
                matchesStatus = r.status === "pending" || r.visible === false;
            } else if (statusFilter === "approved") {
                matchesStatus = r.visible !== false && r.status !== "pending";
            } else if (statusFilter === "pinned") {
                matchesStatus = r.pinned === true;
            }

            return matchesSearch && matchesStar && matchesStatus;
        });
    }, [reviews, search, starFilter, statusFilter]);

    // KPI Metrics
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((a, b) => a + (b.rating || 5), 0) / totalReviews).toFixed(1) : "5.0";
    const verifiedCount = reviews.filter((r) => r.verified).length;
    const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

    return (
        <div data-testid="reviews-tab" className="space-y-6 dir-rtl">
            {/* Header Banner */}
            <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Star className="w-6 h-6 fill-amber-400 text-amber-400 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <span>إدارة آراء وتقييمات العملاء (Reviews & Testimonials)</span>
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                استعرض، عدّل، وأضِف آراء العملاء التي تظهر في الصفحة الرئيسية لزيادة ثقة المشترين في متجرك!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={generateDemoBatch}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition border border-slate-700 cursor-pointer flex items-center gap-1.5"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>توليد الـ 50 تقييم الجديدة 🌟</span>
                        </button>

                        <button
                            onClick={startNew}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة تقييم جديد ⭐</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">متوسط التقييم العام</span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{avgRating}</span>
                        <span className="text-xs text-amber-500 font-bold">/ 5.0</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold">ممتاز جداً 🌟</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">إجمالي التقييمات</span>
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{totalReviews}</div>
                    <div className="text-[11px] text-slate-400 font-medium">مراجعة من زبائن المتجر</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">المشترين الموثقين</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-600">{verifiedCount}</div>
                    <div className="text-[11px] text-slate-400 font-medium">مشتري حقيقي موثق ⚡</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">تقييمات 5 نجوم</span>
                        <Award className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-purple-600">{fiveStarCount}</div>
                    <div className="text-[11px] text-purple-500 font-bold">
                        {totalReviews > 0 ? `${Math.round((fiveStarCount / totalReviews) * 100)}% من التقييمات` : "100%"}
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs (Pending Approval vs Approved) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                    { id: "all", label: `جميع التقييمات (${totalReviews})` },
                    { id: "pending", label: `🟡 بانتظار موافقة وتدقيق الأدمن (${pendingCount})` },
                    { id: "approved", label: `🟢 التقييمات المعروضة بالرئيسية (${totalReviews - pendingCount})` },
                ].map((st) => (
                    <button
                        key={st.id}
                        onClick={() => setStatusFilter(st.id)}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            statusFilter === st.id
                                ? st.id === "pending"
                                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                    : "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                    >
                        <span>{st.label}</span>
                    </button>
                ))}
            </div>

            {/* Filter & Search Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="ابحث باسم العميل، المنتج، أو نص التقييم..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pr-9 pl-4 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-400 shrink-0">تصفية النجوم:</span>
                    {[
                        { id: "all", label: "الكل" },
                        { id: "5", label: "⭐⭐⭐⭐⭐ (5)" },
                        { id: "4", label: "⭐⭐⭐⭐ (4)" },
                        { id: "3", label: "⭐⭐⭐ (أقل)" },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setStarFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                starFilter === f.id
                                    ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/20"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal / Inline Editor */}
            {editing && (
                <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-amber-500" />
                            <span>{reviews.some((r) => r.id === editing.id) ? "تعديل التقييم الحالي" : "إضافة تقييم عميل جديد"}</span>
                        </h3>
                        <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم العميل (مع الدولة/العلم):</label>
                            <input
                                type="text"
                                placeholder="مثال: عبدالعزيز الشمري 🇸🇦"
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">المنتج / اللعبة المشتراة:</label>
                            <input
                                type="text"
                                placeholder="مثال: EA SPORTS FC 25"
                                value={editing.product || ""}
                                onChange={(e) => setEditing({ ...editing, product: e.target.value })}
                                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">عدد النجوم:</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex items-center justify-center">
                                <StarPicker value={editing.rating} onChange={(v) => setEditing({ ...editing, rating: v })} />
                            </div>
                        </div>
                    </div>

                    <div className="text-xs font-bold">
                        <label className="block text-slate-700 dark:text-slate-300 mb-1">نص التقييم:</label>
                        <textarea
                            rows={3}
                            placeholder="اكتب تجربة العميل والانطباع..."
                            value={editing.text}
                            onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editing.verified !== false}
                                onChange={(e) => setEditing({ ...editing, verified: e.target.checked })}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-emerald-600 flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4" />
                                <span>تمييز كـ (مشتري موثوق ⚡)</span>
                            </span>
                        </label>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={saveReview}
                                disabled={busy}
                                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow flex items-center gap-1.5 cursor-pointer"
                            >
                                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>حفظ التقييم 🌟</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.length === 0 ? (
                    <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 font-bold">
                        لا يوجد تقييمات تطابق البحث حالياً
                    </div>
                ) : (
                    filteredReviews.map((r) => (
                        <div
                            key={r.id}
                            className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm space-y-3 relative transition hover:shadow-md ${
                                r.visible !== false ? "border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50/50"
                            }`}
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/20 text-amber-600 dark:text-amber-400 font-black flex items-center justify-center text-base shrink-0 border border-amber-500/20">
                                        {r.name.slice(0, 1)}
                                    </div>

                                    <div className="space-y-0.5">
                                        <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                            <span>{r.name}</span>
                                            {r.verified && (
                                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>مشتري موثوق</span>
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                            {r.product && <span className="font-bold text-slate-500 dark:text-slate-400">🎮 {r.product}</span>}
                                            {r.date && <span>• {r.date}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Star Rating */}
                                <div className="flex items-center gap-0.5 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${
                                                i < r.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-slate-300 dark:text-slate-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Pending Approval Alert & 1-Click Approve Bar */}
                            {(r.status === "pending" || r.visible === false) && (
                                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span>تقييم من زبون بانتظار موافقتك وتدقيقك 🟡</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(r)}
                                            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>تعديل النص 📝</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updated = reviews.map((item) => item.id === r.id ? { ...item, visible: true, status: "approved" } : item);
                                                setLocalReviews(updated);
                                                toast.success("تم الموافقة ونشر التقييم في الصفحة الرئيسية بنجاح! 🚀✨");
                                            }}
                                            className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-1 cursor-pointer shadow shrink-0"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>موافقة ونشر بالرئيسية 🚀</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Official Admin Reply Box if present */}
                            {r.adminReply && (
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 space-y-1 text-xs">
                                    <div className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-[11px]">
                                        <CornerDownLeft className="w-3.5 h-3.5" />
                                        <span>رد إدارة المتجر الرسمي:</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                                        {r.adminReply}
                                    </p>
                                </div>
                            )}

                            {/* Admin Inline Reply Box Editor */}
                            {replyingId === r.id && (
                                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl space-y-2 text-xs">
                                    <label className="block text-[11px] font-bold text-amber-700 dark:text-amber-300">اكتب رد الإدارة الرسمي على هذا التقييم:</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: شكراً لك أخي الكريم، يسعدنا دائماً خدمتك ❤️..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-xs font-bold focus:outline-none"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                        <button onClick={() => setReplyingId(null)} className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold">إلغاء</button>
                                        <button onClick={() => saveAdminReply(r.id)} className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black">حفظ الرد 💬</button>
                                    </div>
                                </div>
                            )}

                            {/* Footer Action Buttons */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleVisibility(r.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                            r.visible !== false
                                                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                        }`}
                                    >
                                        {r.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        <span>{r.visible !== false ? "مقبول 👁️" : "مخفي 🙈"}</span>
                                    </button>

                                    <button
                                        onClick={() => togglePin(r.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                            r.pinned
                                                ? "bg-amber-500 text-slate-950 font-black shadow shadow-amber-500/20 border border-amber-400"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                        }`}
                                        title="تثبيت هذا التقييم ليظهر ضمن الـ 6 تقييمات الرئيسية بالمتجر"
                                    >
                                        <Pin className="w-3.5 h-3.5" />
                                        <span>{r.pinned ? "مثبت بالرئيسية 📌" : "تثبيت بالواجهة 📌"}</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => {
                                            setReplyingId(r.id);
                                            setReplyText(r.adminReply || "");
                                        }}
                                        className="w-8 h-8 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 flex items-center justify-center transition border border-blue-500/20 cursor-pointer"
                                        title="إضافة رد الإدارة"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => startEdit(r)}
                                        className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 flex items-center justify-center transition border border-amber-500/20 cursor-pointer"
                                        title="تعديل التقييم"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => removeReview(r.id)}
                                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition border border-red-500/20 cursor-pointer"
                                        title="حذف التقييم"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
