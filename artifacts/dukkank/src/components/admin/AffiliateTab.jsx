import React, { useState } from "react";
import { toast } from "sonner";
import {
    Gift, Sparkles, Clock, Lock, Rocket, MessageCircle, CheckCircle2,
    Users, Link2, DollarSign, Bell
} from "lucide-react";

export default function AffiliateTab() {
    const [notify, setNotify] = useState(false);

    return (
        <div data-testid="affiliate-tab" className="space-y-6 dir-rtl">
            {/* Header Hero Banner */}
            <div className="relative rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 shadow-2xl overflow-hidden">
                {/* Glowing Background Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
                    <div className="space-y-3 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                            <Rocket className="w-4 h-4 animate-bounce" />
                            <span>قريباً في التحديث القادم 🚀</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                            برنامج التسويق بالعمولة والإحالات (Affiliate Engine)
                        </h2>

                        <p className="text-sm text-slate-300 font-medium leading-relaxed">
                            نعمل حالياً على تطوير نظام تسويق بالعمولة متكامل ومتقدم يُمكنكم من إدارة أكواد المسوقين والمؤثرين، تتبع مبيعاتهم تلقائياً، وتوليد العمولات ورسائل التسوية بالواتساب بضغطة زر واحدة!
                        </p>

                        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button
                                onClick={() => {
                                    setNotify(!notify);
                                    if (!notify) toast.success("تم تفعيل إشعار التحديث! سنحيطك علماً عند إطلاق الخدمة 🔔");
                                }}
                                className={`px-5 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg ${
                                    notify
                                        ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                                }`}
                            >
                                <Bell className="w-4 h-4" />
                                <span>{notify ? "تم تفعيل التنبيه 🔔" : "تنبيهي عند الإطلاق 🔔"}</span>
                            </button>

                            <a
                                href="https://wa.me/966500000000?text=%D8%A3%D9%87%D9%84%D8%A3%D9%8B%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D8%AA%D8%B3%D9%88%D9%8A%D9%82%20%D8%A8%D8%A7%D9%84%D8%B9%D9%85%D9%88%D9%84%D8%A9"
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs transition border border-emerald-500/30 flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>تواصل مع المطورين لطلب تفعيل مسبق 💬</span>
                            </a>
                        </div>
                    </div>

                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-2xl relative">
                        <Gift className="w-16 h-16 md:w-20 md:h-20 animate-pulse" />
                        <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] shadow">
                            قريباً ⏳
                        </span>
                    </div>
                </div>
            </div>

            {/* Feature Previews Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>المميزات القادمة في نظام الإحالات والتسويق:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2 opacity-80 hover:opacity-100 transition shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                            <Gift className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">أكواد خصم المؤثرين</h4>
                        <p className="text-xs text-slate-400 font-medium">إنشاء وتخصيص أكواد خصم مميزة لمشاهير تيك توك ويوتيوب بنسب عمولة مخصصة.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2 opacity-80 hover:opacity-100 transition shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">روابط تتبع وQR Code</h4>
                        <p className="text-xs text-slate-400 font-medium">توليد روابط تتبع ذكية ورموز QR قابلة للمسح مباشرة من الاستوري ومقاطع الفيديو.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2 opacity-80 hover:opacity-100 transition shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">تسويات وتحويلات فورية</h4>
                        <p className="text-xs text-slate-400 font-medium">احتساب تلقائي لأرباح المسوّقين مع إمكانية إرسال كشف حساب بالواتساب وتسوية المبالغ.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2 opacity-80 hover:opacity-100 transition shadow-sm">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                            <Users className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">إحالة الأصدقاء بين الزبائن</h4>
                        <p className="text-xs text-slate-400 font-medium">دعوة صديق وحصول كلاهما على رصيد محفظة مجاني عند الشراء لأول مرة.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
