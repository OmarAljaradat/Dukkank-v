import { Search, ShoppingCart, CreditCard, CheckCircle } from "lucide-react";
import { useStoreData } from "../contexts/DataContext";

const ICONS = {
  search: Search,
  cart: ShoppingCart,
  payment: CreditCard,
  check: CheckCircle,
};

const STEP_COLORS = [
  "from-[hsl(var(--brand-blue-deep))] to-[hsl(var(--brand-blue))]",
  "from-[hsl(var(--brand-red))] to-[hsl(var(--brand-red-soft))]",
  "from-indigo-600 to-blue-600",
  "from-emerald-500 to-teal-400",
];

export function HowItWorks() {
  const { content } = useStoreData();
  const c = content?.howItWorks || {};

  const steps = [
    {
      number: "١",
      icon: "search",
      title: c.step1Title || "اختر ما تبي",
      desc: c.step1Desc || "تصفّح الألعاب والاشتراكات واختار اللي يناسبك.",
    },
    {
      number: "٢",
      icon: "cart",
      title: c.step2Title || "أضف للسلة",
      desc: "حدد الجهاز والنوع وأضف المنتجات للسلة بسهولة.",
    },
    {
      number: "٣",
      icon: "payment",
      title: "ادفع أونلاين بأمان",
      desc: "ادفع فوراً عبر فيزا أو ماستركارد بأعلى معايير الأمان والتشفير.",
    },
    {
      number: "٤",
      icon: "check",
      title: c.step4Title || "استلم فوراً",
      desc: c.step4Desc || "بعد تأكيد الدفع، تسليم فوري خلال دقائق.",
    },
  ];

  return (
    <section
      id="how-it-works"
      data-testid="how-it-works-section"
      className="bg-[hsl(var(--brand-cream))] py-14 sm:py-20"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-block text-xs font-bold uppercase tracking-[0.18em] mb-3 text-[hsl(var(--brand-blue-deep))] dark:text-[hsl(var(--brand-blue))]">
            {c.eyebrow || "كيف تشتري؟"}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[hsl(var(--brand-ink))] leading-tight">
            {c.title || "٤ خطوات وتوصلك اللعبة"}
          </h2>
          {c.description && (
            <p className="mt-3 text-base sm:text-lg text-[hsl(var(--brand-ink))]/65 max-w-xl mx-auto leading-relaxed">
              {c.description}
            </p>
          )}
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[52px] right-[12.5%] left-[12.5%] h-0.5 bg-gradient-to-l from-emerald-400/40 via-blue-500/40 via-[hsl(var(--brand-red))]/40 to-[hsl(var(--brand-blue-deep))]/40" />

          {steps.map((step, idx) => {
            const Icon = ICONS[step.icon] || CheckCircle;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                {/* Icon circle */}
                <div
                  className={`w-[88px] h-[88px] rounded-full bg-gradient-to-br ${STEP_COLORS[idx]} flex items-center justify-center shadow-xl mb-5 relative z-10 transition-transform group-hover:scale-110 duration-300`}
                >
                  <Icon className="w-8 h-8 text-white" />
                  {/* Step number badge */}
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-[hsl(220_22%_13%)] border-2 border-[hsl(var(--brand-ink))]/10 dark:border-white/10 flex items-center justify-center text-[13px] font-extrabold text-[hsl(var(--brand-ink))]">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[hsl(var(--brand-ink))]/65 leading-relaxed max-w-[200px]">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
