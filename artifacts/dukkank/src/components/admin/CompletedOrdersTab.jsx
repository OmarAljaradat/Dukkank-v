// ══════════════════════════════════════════════════════════════════════════════
// ── OrderDukkank v1.0 — Delivered & Completed Accounts Archive ──────────────
// ══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Archive, Search, Copy, Download, RefreshCw, Mail, KeyRound, ShieldCheck,
  User, Phone, DollarSign, Calendar, Truck, CheckCircle2, MessageCircle,
  ExternalLink, Filter, Loader2, Package
} from "lucide-react";
import { apiListOrders, formatApiError } from "../../lib/api";

export default function CompletedOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");

  const fetchCompletedOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiListOrders();
      const all = Array.isArray(data) ? data : [];
      // Filter for delivered or completed orders only
      const completedOnly = all.filter(
        (o) => o.status === "completed" || o.status === "delivered" || o.account_credentials
      );
      setOrders(completedOnly);
    } catch (e) {
      toast.error("تعذّر تحميل أرشيف الحسابات: " + formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedOrders();
  }, [fetchCompletedOrders]);

  // Filtered orders
  const filtered = orders.filter((o) => {
    if (productFilter === "games" && o.product_type !== "game") return false;
    if (productFilter === "subs" && o.product_type !== "subscription") return false;

    if (search) {
      const q = search.toLowerCase();
      return [
        o.order_number, o.customer_name, o.customer_phone, o.contact_whatsapp,
        o.customer_email, o.game_name, o.subscription_type, o.account_credentials, o.supplier
      ].some((f) => f && String(f).toLowerCase().includes(q));
    }
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const headers = ["رقم الطلب", "اسم العميل", "هاتف العميل", "المنتج", "بيانات الحساب", "سعر البيع", "تكلفة المورد", "تاريخ التسليم"];
    const rows = filtered.map((o) => [
      o.order_number || "",
      o.customer_name || "",
      o.customer_phone || o.contact_whatsapp || "",
      o.game_name || o.subscription_type || o.product_type || "",
      (o.account_credentials || "").replace(/\n/g, " | "),
      o.customer_paid || "0",
      o.cost_price || "0",
      o.delivered_at || o.created_at || ""
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `dukkank-accounts-archive-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير أرشيف الحسابات بنجاح 📄");
  };

  // Helper to extract credentials
  const parseCreds = (str) => {
    if (!str) return null;
    const emailMatch = str.match(/الإيميل:\s*([^\n]+)/);
    const passMatch = str.match(/كلمة السر:\s*([^\n]+)/);
    const codesMatch = str.match(/أكواد الأمان:\s*([\s\S]+)/);
    if (emailMatch || passMatch) {
      return {
        email: emailMatch ? emailMatch[1].trim() : "",
        password: passMatch ? passMatch[1].trim() : "",
        codes: codesMatch ? codesMatch[1].trim() : ""
      };
    }
    return null;
  };

  const totalDeliveredRevenue = filtered.reduce((s, o) => s + (parseFloat(o.customer_paid) || 0), 0);
  const totalCost = filtered.reduce((s, o) => s + (parseFloat(o.cost_price) || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── Header Banner ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Archive className="w-4 h-4" /> أرشيف الحسابات والأوامر المكتملة
          </div>
          <h2 className="text-2xl font-black">سجل الحسابات والطلبات المسلّمة للعملاء</h2>
          <p className="text-slate-300 text-sm mt-1">سجل دائم وشامل لجميع بيانات الحسابات والإيميلات والباسووردات التي تسلمها الزبائن</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            تصدير الأرشيف (CSV)
          </button>
          <button
            onClick={fetchCompletedOrders}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="تحديث الأرشيف"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Stats Summary Bar ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">إجمالي الحسابات المسلمة</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{filtered.length} حساب</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">إجمالي قيمة المبيعات</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">${totalDeliveredRevenue.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">صافي تكلفة المشتريات</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">${totalCost.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-xl w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بإيميل الحساب، كلمة السر، اسم العميل، رقم الهاتف، أو اسم اللعبة..."
            className="w-full h-11 pr-10 pl-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-sm font-medium focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {[
            { key: "all", label: "جميع المنتجات" },
            { key: "games", label: "🎮 ألعاب فقط" },
            { key: "subs", label: "📦 اشتراكات فقط" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setProductFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                productFilter === f.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Accounts Archive Cards Grid / Table ─────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <span className="font-bold">جاري استرجاع أرشيف الحسابات...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/10 p-8">
          <Archive className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">لا توجد حسابات مسجلة في الأرشيف حتى الآن</h3>
          <p className="text-xs text-slate-400 mt-1">الطلبات المسلمة ستحفظ بيانات حساباتها هنا تلقائياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const creds = parseCreds(order.account_credentials);
            const phone = order.customer_phone || order.contact_whatsapp;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-black border border-blue-500/20">
                      {order.order_number || "#"}
                    </span>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      🎮 {order.game_name || order.subscription_type || order.product_type}
                      {order.platform && <span className="text-xs font-bold text-blue-500 mr-2">({order.platform})</span>}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 dir-ltr text-sm font-mono">
                      ${order.customer_paid ? parseFloat(order.customer_paid).toFixed(2) : "0.00"}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>
                      {order.delivered_at || order.created_at
                        ? new Date(order.delivered_at || order.created_at).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" })
                        : ""}
                    </span>
                  </div>
                </div>

                {/* Customer Details Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-white/[0.03] p-3 rounded-2xl text-xs font-medium border border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">العميل:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{order.customer_name}</span>
                  </div>

                  {phone && (
                    <div className="flex items-center gap-2 dir-ltr">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-mono text-slate-600 dark:text-slate-300">{phone}</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(phone); toast.success("تم نسخ الرقم"); }}
                        className="p-1 hover:text-blue-500"
                        title="نسخ رقم الهاتف"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {order.supplier && (
                    <div className="text-slate-500">
                      <span className="font-bold">المورد:</span> {order.supplier}
                    </div>
                  )}
                </div>

                {/* Credentials Cards */}
                {order.account_credentials ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> بيانات الحساب والرمز المسلم للعميل
                      </span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(order.account_credentials); toast.success("تم نسخ بيانات الحساب بالكامل"); }}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-lg"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ البيانات كاملة
                      </button>
                    </div>

                    {creds ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 dir-ltr text-left">
                        {/* Email */}
                        {creds.email && (
                          <div className="bg-white/90 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <div className="text-[10px] text-slate-400 font-bold uppercase">الإيميل (Email)</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">{creds.email}</div>
                            </div>
                            <button
                              onClick={() => { navigator.clipboard.writeText(creds.email); toast.success("تم نسخ الإيميل"); }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shrink-0"
                              title="نسخ الإيميل"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Password */}
                        {creds.password && (
                          <div className="bg-white/90 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <div className="text-[10px] text-slate-400 font-bold uppercase">كلمة السر (Password)</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">{creds.password}</div>
                            </div>
                            <button
                              onClick={() => { navigator.clipboard.writeText(creds.password); toast.success("تم نسخ كلمة السر"); }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shrink-0"
                              title="نسخ كلمة السر"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Backup Codes */}
                        {creds.codes && (
                          <div className="bg-white/90 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
                            <div className="min-w-0 pr-2">
                              <div className="text-[10px] text-slate-400 font-bold uppercase">أكواد الأمان (Security / Codes)</div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">{creds.codes}</div>
                            </div>
                            <button
                              onClick={() => { navigator.clipboard.writeText(creds.codes); toast.success("تم نسخ أكواد الأمان"); }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shrink-0"
                              title="نسخ الأكواد"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono bg-white/50 dark:bg-black/30 p-3 rounded-xl border border-amber-500/10 dir-ltr text-left">
                        {order.account_credentials}
                      </pre>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">لا توجد بيانات حساب مسجلة لهذا الطلب</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
