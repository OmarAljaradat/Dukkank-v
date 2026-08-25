import { useState } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Globe, Clock, TrendingUp, ShoppingBag, DollarSign, Award, Target, ShoppingCart, ArrowRight } from "lucide-react";

const DUKKANK_TRAFFIC = [
    { date: "07-19", visits: 420 },
    { date: "07-20", visits: 580 },
    { date: "07-21", visits: 920 },
    { date: "07-22", visits: 640 },
    { date: "07-23", visits: 380 },
    { date: "07-24", visits: 510 },
    { date: "07-25", visits: 470 },
];

const HOURLY_PEAK = [
    { hour: "0:00", count: 40 },
    { hour: "2:00", count: 20 },
    { hour: "4:00", count: 5 },
    { hour: "8:00", count: 30 },
    { hour: "12:00", count: 120 },
    { hour: "15:00", count: 180 },
    { hour: "18:00", count: 240 },
    { hour: "21:00", count: 390 },
    { hour: "23:00", count: 210 },
];

const GEO_DATA = [
    { country: "السعودية", count: 1450, fill: "#10b981" },
    { country: "الإمارات", count: 820, fill: "#3b82f6" },
    { country: "الأردن", count: 540, fill: "#06b6d4" },
    { country: "الكويت", count: 320, fill: "#ef4444" },
    { country: "قطر", count: 210, fill: "#f59e0b" },
    { country: "عمان", count: 140, fill: "#8b5cf6" },
    { country: "مصر", count: 180, fill: "#f97316" },
];

const SOURCES_DONUT = [
    { name: "تيك توك (TikTok Ads)", value: 40, color: "#000000" },
    { name: "إنستغرام (Instagram)", value: 25, color: "#ec4899" },
    { name: "مباشر (Direct)", value: 15, color: "#334155" },
    { name: "جوجل (Google Search)", value: 10, color: "#3b82f6" },
    { name: "واتساب (WhatsApp Support)", value: 10, color: "#10b981" },
];

const TOP_PROFITABLE_GAMES = [
    { name: "EA SPORTS FC 25 (حساب PS5/PS4)", revenue: "$1,440", profit: "$580", badge: "🏆 الأكثر ربحاً" },
    { name: "اشتراك PS Plus Extra (12 شهر)", revenue: "$960", profit: "$340", badge: "🔥 الأكثر طلباً" },
    { name: "Grand Theft Auto V (PS5)", revenue: "$620", profit: "$210", badge: "⭐ مبيعات عالية" },
    { name: "اشتراك PS Plus Deluxe (12 شهر)", revenue: "$540", profit: "$190", badge: "💎 أرباح ممتازة" },
    { name: "Black Ops 6 (حساب PS5)", revenue: "$480", profit: "$160", badge: "🎮 ألعاب جديدة" },
];

const CHECKOUT_FUNNEL_STEPS = [
    { step: "1. الضغط على شراء سريع ⚡", count: "240 زائر", pct: "100%", color: "bg-blue-500", text: "text-blue-600" },
    { step: "2. الوصول لصفحة السلة والدفع 🛒", count: "198 زائر", pct: "82.5%", color: "bg-amber-500", text: "text-amber-600" },
    { step: "3. إتمام الدفع الإلكتروني بنجاح 💳", count: "168 طلب", pct: "70.0%", color: "bg-emerald-500", text: "text-emerald-600" },
];

export default function InsightsTab() {
    return (
        <div className="space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-slate-500">إجمالي زيارات المتجر</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">3,420</div>
                </div>

                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-slate-500">متوسط الزيارات اليومي</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">488</div>
                </div>

                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-slate-500">معدل شراء الألعاب الفوري</div>
                    <div className="text-3xl font-black text-emerald-600">4.2%</div>
                </div>

                {/* Added Feature: Cart Abandonment Rate */}
                <div className="bg-amber-50/70 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/30 shadow-sm space-y-1">
                    <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span>مؤشر ترك السلة قبل الدفع</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-800/40 font-black">14.5%</span>
                    </div>
                    <div className="text-3xl font-black text-amber-600">42 سلة</div>
                    <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">فرصة مبيعات ضائعة: $1,280</div>
                </div>
            </div>

            {/* Traffic Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Traffic */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>زيارات المتجر اليومية (حركة المرور)</span>
                    </h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={DUKKANK_TRAFFIC}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Peak Hours */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>ساعات ذروة طلب الألعاب (أوقات المساء)</span>
                    </h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={HOURLY_PEAK}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Visitor Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Geo Distribution */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        <span>الدول الأكثر شراءً للألعاب</span>
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={GEO_DATA} margin={{ left: 20 }}>
                                <XAxis type="number" tick={{ fontSize: 9 }} />
                                <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                    {GEO_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visitor Sources Donut */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>مصادر زيارات المتجر والتسويق</span>
                    </h3>
                    <div className="h-48 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={SOURCES_DONUT} innerRadius={40} outerRadius={70} dataKey="value">
                                    {SOURCES_DONUT.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Upgraded Business Analytics Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Profitable Games */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span>🏆 الألعاب والاشتراكات الأكثر ربحية</span>
                        </h3>
                    </div>
                    <div className="space-y-2.5">
                        {TOP_PROFITABLE_GAMES.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold transition hover:bg-slate-100">
                                <div>
                                    <div className="text-slate-900 dark:text-white">{item.name}</div>
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">{item.badge}</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-emerald-600 font-black text-sm">{item.revenue}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">ربح: {item.profit}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkout Funnel Conversion */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span>🎯 مسار تحول الشراء الفوري (Conversion Funnel)</span>
                    </h3>
                    <div className="space-y-4 pt-1">
                        {CHECKOUT_FUNNEL_STEPS.map((s, idx) => (
                            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between text-xs font-extrabold">
                                    <span className="text-slate-900 dark:text-white">{s.step}</span>
                                    <span className={s.text}>{s.count} ({s.pct})</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: s.pct }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
