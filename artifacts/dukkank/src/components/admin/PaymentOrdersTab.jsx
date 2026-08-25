import { useState } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Gamepad2 } from "lucide-react";

const DAILY_REVENUE = [
    { date: "19 يوليو", sales: 140, profit: 130 },
    { date: "20 يوليو", sales: 380, profit: 360 },
    { date: "21 يوليو", sales: 950, profit: 900 },
    { date: "22 يوليو", sales: 450, profit: 430 },
    { date: "23 يوليو", sales: 310, profit: 290 },
    { date: "24 يوليو", sales: 400, profit: 380 },
    { date: "25 يوليو", sales: 460, profit: 440 },
];

const SERVICE_DIST = [
    { name: "ألعاب بلايستيشن (PS5/PS4)", value: 48 },
    { name: "اشتراكات PS Plus Extra", value: 32 },
    { name: "اشتراكات PS Plus Deluxe", value: 18 },
    { name: "بطاقات وإهداء الأصدقاء 🎁", value: 9 },
];

const PLATFORM_SHARE = [
    { name: "أجهزة بلايستيشن 5 (PS5)", value: 65, color: "#1e3a8a" },
    { name: "أجهزة بلايستيشن 4 (PS4)", value: 35, color: "#d97706" },
];

export default function PaymentOrdersTab() {
    const [range, setRange] = useState("7");

    return (
        <div className="space-y-6">
            {/* Header & Date Range Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-blue-600" />
                        <span>تحليل مبيعات الألعاب والاشتراكات الفورية</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">تتبع حجم الإيرادات وصافي الأرباح التقديرية وتوزيع مبيعات الألعاب بحسب الأجهزة (PS5 vs PS4)</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button
                        onClick={() => setRange("7")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                            range === "7" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        آخر 7 أيام
                    </button>
                    <button
                        onClick={() => setRange("30")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                            range === "30" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        آخر 30 يوم
                    </button>
                    <button
                        onClick={() => setRange("all")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                            range === "all" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        كل الأوقات
                    </button>
                </div>
            </div>

            {/* 7 Interactive KPIs Grid Tailored to Dukkank */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {/* 1. Revenue Card (Dark Navy) */}
                <div className="bg-[#0f172a] text-white p-4 rounded-3xl shadow-md space-y-1">
                    <div className="text-[11px] font-bold text-slate-300">مبيعات الألعاب الكلية</div>
                    <div className="text-2xl font-black">$2,527.55</div>
                    <div className="text-[10px] text-slate-400">إجمالي المبيعات ($)</div>
                </div>

                {/* 2. Supplier Cost (Gold) */}
                <div className="bg-[#d97706] text-white p-4 rounded-3xl shadow-md space-y-1">
                    <div className="text-[11px] font-bold opacity-90">تكلفة شراء الحسابات</div>
                    <div className="text-2xl font-black">$110.33</div>
                    <div className="text-[10px] opacity-80">تكلفة التوريد المخصومة</div>
                </div>

                {/* 3. Estimated Profit (Green) */}
                <div className="bg-[#059669] text-white p-4 rounded-3xl shadow-md space-y-1">
                    <div className="text-[11px] font-bold opacity-90">صافي ربح دُكانك</div>
                    <div className="text-2xl font-black">$2,417.22</div>
                    <div className="text-[10px] opacity-80">الربح الصافي للمتجر ($)</div>
                </div>

                {/* 4. Total Orders */}
                <div className="bg-white dark:bg-white/[0.04] p-4 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-[11px] font-bold text-slate-500">إجمالي طلبات الألعاب</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">84</div>
                    <div className="text-[10px] text-emerald-600 font-bold">100% تم تسليمها للزبائن</div>
                </div>

                {/* 5. AOV */}
                <div className="bg-white dark:bg-white/[0.04] p-4 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-[11px] font-bold text-slate-500">متوسط سلة الشراء (AOV)</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">$30.08</div>
                    <div className="text-[10px] text-slate-400">متوسط قيمة الطلب</div>
                </div>

                {/* 6. Completion Speed (Purple) */}
                <div className="bg-[#7c3aed] text-white p-4 rounded-3xl shadow-md space-y-1">
                    <div className="text-[11px] font-bold opacity-90">سرعة تسليم الحساب</div>
                    <div className="text-2xl font-black">فوري ⚡</div>
                    <div className="text-[10px] opacity-80">تسليم تلقائي فوري للمشتري</div>
                </div>

                {/* 7. Golden Warranty (Amber/Green) */}
                <div className="bg-emerald-600 text-white p-4 rounded-3xl shadow-md space-y-1">
                    <div className="text-[11px] font-bold opacity-90">الضمان الذهبي</div>
                    <div className="text-2xl font-black">100%</div>
                    <div className="text-[10px] opacity-80">ضمان واستبدال رسمي</div>
                </div>
            </div>

            {/* Daily Growth Dual Line Chart */}
            <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">منحنى نمو إيرادات مبيعات الألعاب اليومية</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={DAILY_REVENUE}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="إجمالي مبيعات الألعاب ($)" />
                            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="صافي الأرباح ($)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Distribution Bar Chart */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">توزيع مبيعات المنتجات حسب الفئة</h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={SERVICE_DIST}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} name="عدد الطلبات المكتملة" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Share Donut */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">توزيع المبيعات حسب نوع الجهاز (PS5 vs PS4)</h3>
                    <div className="h-56 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={PLATFORM_SHARE} innerRadius={50} outerRadius={80} dataKey="value">
                                    {PLATFORM_SHARE.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
