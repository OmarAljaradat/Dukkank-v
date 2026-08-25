import { Shield, Gift, Zap } from "lucide-react";
import { useStoreData } from "../contexts/DataContext";

export function AboutStore() {
    const { store } = useStoreData();
    const storeName = store?.name || "دُكانك";

    return (
        <section
            id="about-store"
            data-testid="about-store-section"
            className="py-16 sm:py-24 bg-[hsl(var(--brand-cream))]/30 relative overflow-hidden"
        >
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
                
                {/* Main White Card Container */}
                <div className="relative bg-white dark:bg-white/[0.04] rounded-3xl sm:rounded-[36px] border border-[hsl(var(--brand-ink))]/10 shadow-xl p-8 sm:p-14 text-center">
                    
                    {/* Top Overlapping Logo Badge */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-white dark:bg-[hsl(var(--brand-ink))] border-2 border-[hsl(var(--brand-blue-deep))]/20 shadow-md flex items-center justify-center overflow-hidden p-2">
                        <img src="/logo.png" alt={storeName} className="w-full h-full object-contain" />
                    </div>

                    {/* Section Titles */}
                    <div className="pt-4 mb-10 sm:mb-14 space-y-2">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[hsl(var(--brand-ink))] tracking-tight">
                            لماذا متجر <span className="text-[hsl(var(--brand-blue-deep))]">{storeName}</span>؟
                        </h2>
                        <p className="text-sm sm:text-base text-[hsl(var(--brand-ink))]/65 font-medium max-w-xl mx-auto">
                            نعمل جاهدين لتقديم أفضل خدمة شحن وألعاب وخدمات رقمية مع أعلى درجات الموثوقية
                        </p>
                    </div>

                    {/* 3 Columns Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-stretch">
                        
                        {/* 1. Secure Payments (وسائل دفع آمنة) */}
                        <div className="flex flex-col items-center text-center p-4 sm:p-6 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center shadow-inner">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-extrabold text-[hsl(var(--brand-ink))]">
                                وسائل دفع آمنة
                            </h3>
                            <p className="text-xs sm:text-sm text-[hsl(var(--brand-ink))]/70 leading-relaxed max-w-xs font-medium">
                                نقدم خدماتنا بأعلى معايير الأمان مع تشفير تام لبياناتك ووسائل دفع معتمدة وموثوقة لحماية معاملاتك.
                            </p>
                        </div>

                        {/* 2. Gifts & Discounts (هدايا وخصومات - with vertical borders) */}
                        <div className="flex flex-col items-center text-center p-4 sm:p-6 space-y-4 md:border-x border-[hsl(var(--brand-ink))]/10">
                            <div className="relative w-14 h-14 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center shadow-inner">
                                <Gift className="w-7 h-7" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(var(--brand-gold))] text-[#3a2400] text-[9px] font-extrabold flex items-center justify-center shadow">
                                    %
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-extrabold text-[hsl(var(--brand-ink))]">
                                هدايا وخصومات
                            </h3>
                            <p className="text-xs sm:text-sm text-[hsl(var(--brand-ink))]/70 leading-relaxed max-w-xs font-medium">
                                خصومات مستمرة وعروض حصرية متجددة، بالإضافة إلى نظام نقاط الولاء الذي يمنحك كوينز إضافية وهدايا مجانية مع كل طلب!
                            </p>
                        </div>

                        {/* 3. Fast Delivery & Fulfillment (سرعة بالإنجاز وتسليم الطلب) */}
                        <div className="flex flex-col items-center text-center p-4 sm:p-6 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center shadow-inner">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-extrabold text-[hsl(var(--brand-ink))]">
                                سرعة بالإنجاز وتسليم الطلب
                            </h3>
                            <p className="text-xs sm:text-sm text-[hsl(var(--brand-ink))]/70 leading-relaxed max-w-xs font-medium">
                                فريق عمل محترف متواجد على مدار الساعة لخدمتكم وشحن طلباتكم بأسرع وقت ممكن وبأعلى درجات الأمان والضمان.
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}
