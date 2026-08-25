import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Gamepad2, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCustomer } from "../contexts/CustomerContext";

const SECTIONS = [
    { id: "top",       label: "الرئيسية",  Icon: Home,      href: "#top"      },
    { id: "games",     label: "الألعاب",   Icon: Gamepad2,  href: "#games"    },
    { id: "account",   label: "حسابي",     Icon: User,      action: "account" },
    { id: "wishlist",  label: "المفضلة",   Icon: Heart,     action: "wishlist"},
    { id: "cart",      label: "السلة",     Icon: ShoppingBag,action: "cart"   },
];

export function MobileBottomNav({ onOpenCart, onOpenWishlist, onOpenCustomerAuth }) {
    const { totalQty } = useCart();
    const { count: wishCount } = useWishlist();
    const { customer } = useCustomer();
    const [active, setActive] = useState("top");
    const location = useLocation();
    const navigate = useNavigate();

    // Track active section with IntersectionObserver
    useEffect(() => {
        if (location.pathname !== "/") return;
        const targets = ["essential", "extra", "bundles", "games", "reviews", "faq"]
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (!targets.length) return;

        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length) {
                    const id = visible[0].target.id;
                    if (["essential", "extra"].includes(id)) setActive("essential");
                    else if (id === "games") setActive("games");
                    else setActive("top");
                } else {
                    if (window.scrollY < 200) setActive("top");
                }
            },
            { threshold: 0.25 }
        );

        targets.forEach((t) => obs.observe(t));
        return () => obs.disconnect();
    }, [location.pathname]);

    const handleClick = (item) => {
        if (item.action === "cart") { navigate("/cart"); return; }
        if (item.action === "wishlist") { onOpenWishlist(); return; }
        if (item.action === "account") { navigate("/account"); return; }
        if (item.id === "games") { navigate("/games"); return; }
        setActive(item.id);

        if (location.pathname === "/") {
            const el = item.href === "#top" ? document.body : document.querySelector(item.href);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } else {
            navigate(`/${item.href || ""}`);
            setTimeout(() => {
                const el = item.href === "#top" ? document.body : document.querySelector(item.href);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                else window.scrollTo({ top: 0, behavior: "smooth" });
            }, 250);
        }
    };

    return (
        <nav
            aria-label="التنقل الرئيسي"
            className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            {/* Glass backdrop */}
            <div className="bg-[hsl(var(--brand-cream))]/92 dark:bg-[hsl(220_26%_8%)]/92 backdrop-blur-xl border-t border-[hsl(var(--brand-ink))]/12 dark:border-white/10">
                <div className="flex items-stretch h-[58px]">
                    {SECTIONS.map((item) => {
                        const isActive = item.id === active;
                        const badge = item.id === "cart" ? totalQty : item.id === "wishlist" ? wishCount : 0;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleClick(item)}
                                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative min-h-[58px] active:scale-95 transition-transform duration-100"
                                aria-label={item.label}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-[hsl(var(--brand-blue-deep))]" />
                                )}

                                <div className="relative">
                                    <item.Icon
                                        className={`w-[22px] h-[22px] transition-colors duration-150 ${
                                            isActive
                                                ? "text-[hsl(var(--brand-blue-deep))]"
                                                : "text-[hsl(var(--brand-ink))]/45"
                                        } ${item.id === "wishlist" && wishCount > 0 ? "fill-[hsl(var(--brand-red))]/20 text-[hsl(var(--brand-red))]" : ""}`}
                                    />
                                    {badge > 0 && (
                                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand-red))] text-white text-[9px] font-bold ring-1.5 ring-[hsl(var(--brand-cream))]">
                                            {badge > 9 ? "9+" : badge}
                                        </span>
                                    )}
                                </div>

                                <span
                                    className={`text-[9px] font-bold leading-none transition-colors duration-150 ${
                                        isActive
                                            ? "text-[hsl(var(--brand-blue-deep))]"
                                            : "text-[hsl(var(--brand-ink))]/45"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
