// ══════════════════════════════════════════════════════════════════════════════
// ── OrderDukkank v1.0 — Premium Modern Orders Dashboard (Stripe/Shopify Style)
// ══════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Package, Search, Filter, ChevronDown, ChevronUp, User, Phone, Mail,
  Send, Truck, CheckCircle2, XCircle, Clock, ArrowRight, DollarSign,
  MessageCircle, Loader2, Eye, Trash2, Plus, RefreshCw, ShoppingCart,
  PackageCheck, PackagePlus, AlertCircle, TrendingUp, Hash, Calendar,
  ExternalLink, Copy, X, ArrowUpRight, Zap, ShieldCheck, CreditCard,
  Sparkles, ChevronLeft, KeyRound, EyeOff
} from "lucide-react";
import {
  apiListOrders, apiUpdateOrder, apiDeleteOrder,
  apiForwardToSupplier, apiReceiveAccount, apiDeliverOrder, apiCompleteOrder,
  apiListSuppliers, apiGetCustomerProfile, formatApiError
} from "../../lib/api";
import { Input, Textarea, Field } from "./_widgets";

// ── Status Config & Stepper Pipeline ─────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: "new",              label: "طلب جديد",       icon: PackagePlus,  color: "blue" },
  { key: "supplier_sent",    label: "بانتظار المورد",  icon: Send,         color: "amber" },
  { key: "account_received", label: "جاهز للتسليم",   icon: PackageCheck, color: "orange" },
  { key: "delivered",        label: "تم التسليم",      icon: Truck,        color: "emerald" },
  { key: "completed",        label: "مكتمل",           icon: CheckCircle2, color: "green" },
];

const STATUS_CONFIG = {
  new:               { label: "طلب جديد",       icon: PackagePlus,  bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  supplier_sent:     { label: "أُرسل للمورد",    icon: Send,         bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  account_received:  { label: "تم استلام الحساب", icon: PackageCheck, bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  delivered:         { label: "تم التسليم",      icon: Truck,        bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  completed:         { label: "مكتمل",           icon: CheckCircle2, bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-700 dark:text-green-400", dot: "bg-green-600" },
  cancelled:         { label: "ملغي",            icon: XCircle,      bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
  pending:           { label: "قيد المعالجة",     icon: Clock,        bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

// ── Status Badge Component ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = getStatusConfig(status);
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm shadow-sm ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

// ── Visual Stepper Component ─────────────────────────────────────────────────
const VisualStepper = ({ currentStatus }) => {
  if (currentStatus === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50">
        <XCircle className="w-4 h-4" />
        تم إلغاء هذا الطلب
      </div>
    );
  }

  const stepOrder = ["new", "supplier_sent", "account_received", "delivered", "completed"];
  const currentIdx = stepOrder.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1 w-full max-w-md">
      {PIPELINE_STEPS.map((step, idx) => {
        const isPassed = currentIdx >= idx;
        const isCurrent = currentIdx === idx;
        const StepIcon = step.icon;

        return (
          <div key={step.key} className="flex-1 flex items-center gap-1">
            <div
              title={step.label}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                isCurrent
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 ring-2 ring-blue-400/50 shadow-md shadow-blue-500/20"
                  : isPassed
                  ? "bg-emerald-500"
                  : "bg-slate-200 dark:bg-white/10"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

// ── Customer Profile Modal ───────────────────────────────────────────────────
const CustomerProfileModal = ({ phone, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) return;
    setLoading(true);
    apiGetCustomerProfile(phone)
      .then(setData)
      .catch(() => toast.error("تعذّر تحميل بروفايل العميل"))
      .finally(() => setLoading(false));
  }, [phone]);

  if (!phone) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 relative">
          <button onClick={onClose} className="absolute left-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black shadow-inner">
              👤
            </div>
            <div>
              <h3 className="text-xl font-black">{data?.customer?.name || "عميل دُكانك"}</h3>
              <p className="text-white/80 text-sm font-mono dir-ltr flex items-center gap-2 mt-0.5">
                <span>{phone}</span>
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : data ? (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3.5 text-center">
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{data.stats?.totalOrders || 0}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الطلبات</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-center">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.stats?.completedOrders || 0}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">مكتملة</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3.5 text-center">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">${(data.stats?.totalSpent || 0).toFixed(2)}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المشتريات</div>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                سجل طلبات العميل
              </h4>
              {data.orders?.length > 0 ? (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {data.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 text-sm transition-all hover:border-blue-400">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="text-blue-600 font-mono text-xs">{o.order_number}</span>
                          <span>{o.game_name || o.subscription_type || o.product_type}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString("ar-JO") : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {o.customer_paid && <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">${o.customer_paid}</span>}
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">لا توجد طلبات سابقة لهذا العميل</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ── Main: OrdersDashboardTab ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function OrdersDashboardTab() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("new");
  const [expandedId, setExpandedId] = useState(null);
  const [profilePhone, setProfilePhone] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ── Data Fetch ─────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiListOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("تعذّر تحميل الطلبات: " + formatApiError(e));
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await apiListSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch { /* fallback in memory */ }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchSuppliers()]);
    setLoading(false);
  }, [fetchOrders, fetchSuppliers]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Filter & Search ────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return [o.customer_name, o.order_number, o.game_name, o.subscription_type,
              o.contact_whatsapp, o.customer_phone, o.customer_email, o.supplier, o.account_email]
        .some((f) => f && String(f).toLowerCase().includes(q));
    }
    return true;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    supplierSent: orders.filter((o) => o.status === "supplier_sent").length,
    accountReceived: orders.filter((o) => o.status === "account_received").length,
    delivered: orders.filter((o) => o.status === "delivered" || o.status === "completed").length,
    revenue: orders.reduce((s, o) => s + (parseFloat(o.customer_paid) || 0), 0),
    profit: orders.reduce((s, o) => {
      const paid = parseFloat(o.customer_paid) || 0;
      const fee = parseFloat(o.gateway_fee) || 0;
      const cost = parseFloat(o.cost_price) || 0;
      return s + (paid - fee - cost);
    }, 0),
  };

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleForwardToSupplier = async (order, supplierId, costPrice) => {
    setActionLoading(order.id);
    try {
      await apiForwardToSupplier(order.id, { supplier_id: supplierId, cost_price: costPrice || null });
      toast.success("تم تسجيل إرسال الطلب للمورد 🚀");
      await fetchOrders();
    } catch (e) { toast.error(formatApiError(e)); }
    setActionLoading(null);
  };

  const handleReceiveAccount = async (order, credentials, costPrice) => {
    setActionLoading(order.id);
    try {
      await apiReceiveAccount(order.id, { account_credentials: credentials, cost_price: costPrice || null });
      toast.success("تم تسجيل استلام الحساب من المورد 📦");
      await fetchOrders();
    } catch (e) { toast.error(formatApiError(e)); }
    setActionLoading(null);
  };

  const handleDeliver = async (order) => {
    setActionLoading(order.id);
    try {
      await apiDeliverOrder(order.id);
      toast.success("تم تسجيل تسليم الحساب للعميل 🚀");
      await fetchOrders();
    } catch (e) { toast.error(formatApiError(e)); }
    setActionLoading(null);
  };

  const handleComplete = async (order) => {
    setActionLoading(order.id);
    try {
      await apiCompleteOrder(order.id);
      toast.success("تم إكمال الطلب بنجاح ✅");
      await fetchOrders();
    } catch (e) { toast.error(formatApiError(e)); }
    setActionLoading(null);
  };

  const handleCancel = async (order) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    setActionLoading(order.id);
    try {
      await apiUpdateOrder(order.id, { status: "cancelled" });
      toast.success("تم إلغاء الطلب");
      await fetchOrders();
    } catch (e) { toast.error(formatApiError(e)); }
    setActionLoading(null);
  };

  const handleDelete = async (order) => {
    if (!confirm(`حذف الطلب ${order.order_number}؟ لا يمكن التراجع!`)) return;
    try {
      await apiDeleteOrder(order.id);
      toast.success("تم حذف الطلب");
      await fetchOrders();
    } catch (e) { toast.error(formatApiError(e)); }
  };

  const openSupplierWhatsApp = (order, supplier) => {
    const phone = supplier?.phone || "";
    const productName = order.game_name || order.subscription_type || order.product_type || "منتج";
    const platform = order.platform || "";
    const msg = encodeURIComponent(
      `السلام عليكم 👋\nطلب جديد من متجر دُكانك:\n\n🔖 رقم الطلب: *${order.order_number}*\n🎮 المنتج: ${productName}\n📱 المنصة: ${platform}\n\nيرجى تجهيز الحساب وشكراً 🌟`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
  };

  // ── Filter Tabs ────────────────────────────────────────────────────────────
  const filterTabs = [
    { key: "new",               label: "طلبات جديدة",    count: stats.new, icon: PackagePlus },
    { key: "supplier_sent",     label: "بانتظار المورد",  count: stats.supplierSent, icon: Send },
    { key: "account_received",  label: "جاهزة للتسليم",   count: stats.accountReceived, icon: PackageCheck },
    { key: "delivered",         label: "تم التسليم",      count: stats.delivered, icon: Truck },
    { key: "cancelled",         label: "ملغية",           count: orders.filter(o => o.status === "cancelled").length, icon: XCircle },
    { key: "all",               label: "جميع الطلبات",    count: stats.total, icon: Package },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // ── RENDER ─────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">

      {/* ── Modern SaaS Glassmorphic Stat Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "طلبات جديدة", value: stats.new, icon: PackagePlus, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "بانتظار المورد", value: stats.supplierSent, icon: Send, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "جاهزة للتسليم", value: stats.accountReceived, icon: PackageCheck, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "تم التسليم", value: stats.delivered, icon: Truck, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "إجمالي الإيرادات", value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
          { label: "صافي الربح", value: `$${stats.profit.toFixed(0)}`, icon: TrendingUp, color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/20" },
        ].map((s, i) => {
          const IconComponent = s.icon;
          return (
            <div key={i} className={`rounded-2xl border p-4 backdrop-blur-md transition-all hover:scale-[1.02] shadow-sm ${s.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${s.color}`} />
                <span className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</span>
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Search & Actions Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب، اسم العميل، رقم الهاتف، اسم اللعبة..."
            className="w-full h-11 pr-10 pl-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Reload Button */}
        <button
          onClick={loadAll}
          className="flex items-center justify-center gap-2 px-5 h-11 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-sm font-bold shadow-md transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          تحديث البيانات
        </button>
      </div>

      {/* ── Status Filter Tabs ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((t) => {
          const Icon = t.icon;
          const isActive = statusFilter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500"
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Modern Orders Cards List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
          <span className="font-bold">جاري تحميل لوحة الطلبات...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/10 p-8">
          <Package className="w-14 h-14 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">لا توجد طلبات تطابق هذا الفلتر</h3>
          <p className="text-xs text-slate-400 mt-1">الطلبات الجديدة المنفذة عبر المتجر ستظهر هنا تلقائياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const selectedSupplier = suppliers.find((s) => s.id === order.supplier_id);

            return (
              <div
                key={order.id}
                className={`bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border transition-all duration-200 ${
                  isExpanded
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xl"
                    : "border-slate-200/80 dark:border-white/10 hover:border-blue-400 shadow-sm"
                }`}
              >
                {/* ── Order Header Row ───────────────────────────────────────── */}
                <div
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Left: Order Info & Customer */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-blue-500 uppercase">طلب</span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                        {order.order_number ? order.order_number.replace("DK-", "") : "#"}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); setProfilePhone(order.customer_phone || order.contact_whatsapp); }}
                          className="font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base truncate"
                        >
                          {order.customer_name || "عميل دُكانك"}
                        </button>
                        {(order.customer_phone || order.contact_whatsapp) && (
                          <span className="text-xs text-slate-400 font-mono dir-ltr bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-lg">
                            {order.customer_phone || order.contact_whatsapp}
                          </span>
                        )}
                        {order.order_source === "paytabs" && (
                          <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            💳 دفع أونلاين
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 truncate">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          🎮 {order.game_name || order.subscription_type || order.product_type}
                        </span>
                        {order.platform && (
                          <span className="text-[10px] bg-slate-200 dark:bg-white/15 text-slate-700 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded">
                            {order.platform}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Stepper Pipeline */}
                  <div className="hidden lg:block w-72 shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 mb-1">مرحلة الطلب الحالية:</div>
                    <VisualStepper currentStatus={order.status} />
                  </div>

                  {/* Right: Price & Quick Action */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-white/5">
                    <div className="text-left dir-ltr">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {order.customer_paid ? `$${parseFloat(order.customer_paid).toFixed(2)}` : "—"}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString("ar-JO", { month: "short", day: "numeric" }) : ""}
                      </div>
                    </div>

                    <StatusBadge status={order.status} />

                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* ── Expanded Workflow Details ──────────────────────────────── */}
                {isExpanded && (
                  <OrderExpandedPanel
                    order={order}
                    suppliers={suppliers}
                    selectedSupplier={selectedSupplier}
                    actionLoading={actionLoading}
                    onForward={handleForwardToSupplier}
                    onReceive={handleReceiveAccount}
                    onDeliver={handleDeliver}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    openSupplierWhatsApp={openSupplierWhatsApp}
                    onViewProfile={(phone) => setProfilePhone(phone)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Customer Profile Modal ──────────────────────────────────────── */}
      {profilePhone && (
        <CustomerProfileModal phone={profilePhone} onClose={() => setProfilePhone(null)} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Expanded Order Panel (Interactive Workflow Steps) ─────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function OrderExpandedPanel({
  order, suppliers, selectedSupplier, actionLoading,
  onForward, onReceive, onDeliver, onComplete, onCancel, onDelete,
  openSupplierWhatsApp, onViewProfile
}) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(order.supplier_id || "");
  const [costPrice, setCostPrice] = useState(order.cost_price || "");
  
  // Step 2 Structured Fields State
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const isLoading = actionLoading === order.id;
  const customerPhone = order.customer_phone || order.contact_whatsapp;

  const paid = parseFloat(order.customer_paid) || 0;
  const fee = parseFloat(order.gateway_fee) || paid * 0.05;
  const cost = parseFloat(costPrice) || parseFloat(order.cost_price) || 0;
  const profit = paid - fee - cost;

  const handleReceiveSubmit = () => {
    const parts = [];
    if (accountEmail.trim()) parts.push(`الإيميل: ${accountEmail.trim()}`);
    if (accountPassword.trim()) parts.push(`كلمة السر: ${accountPassword.trim()}`);
    if (backupCodes.trim()) parts.push(`أكواد الأمان: ${backupCodes.trim()}`);
    const fullCredentials = parts.join("\n");

    if (!fullCredentials.trim()) {
      toast.error("يرجى إدخال إيميل أو كلمة سر الحساب على الأقل");
      return;
    }
    onReceive(order, fullCredentials, costPrice);
  };

  // Helper to extract email, password, codes from stored string if present
  const parseCredentials = (str) => {
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

  const parsedCreds = parseCredentials(order.account_credentials);

  return (
    <div className="border-t border-slate-200 dark:border-white/10 p-6 space-y-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-3xl">

      {/* ── Stepper Pipeline (Mobile View) ───────────────────────────── */}
      <div className="lg:hidden bg-white dark:bg-white/[0.04] p-4 rounded-2xl border border-slate-200 dark:border-white/10">
        <div className="text-xs font-bold text-slate-500 mb-2">مرحلة الطلب الحالية:</div>
        <VisualStepper currentStatus={order.status} />
      </div>

      {/* ── Customer & Order Info Bar ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">👤 بيانات العميل</span>
          <div className="flex items-center justify-between">
            <button onClick={() => onViewProfile(customerPhone)} className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-sm">
              {order.customer_name}
            </button>
            {customerPhone && (
              <button
                onClick={() => { navigator.clipboard.writeText(customerPhone); toast.success("تم نسخ الرقم"); }}
                className="text-xs font-mono text-slate-500 flex items-center gap-1 hover:text-blue-500"
              >
                <Copy className="w-3 h-3" /> {customerPhone}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">🎮 معلومات المنتج والمنصة</span>
          <div className="font-bold text-slate-800 dark:text-white text-sm">
            {order.game_name || order.subscription_type || order.product_type}
            {order.platform && <span className="text-blue-500 mr-2">({order.platform})</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">💳 وسيلة الدفع</span>
          <div className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            {order.payment_platform || "PayTabs أونلاين"}
          </div>
        </div>
      </div>

      {/* ── Workflow Steps Cards ─────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Step 1: Forward to Supplier */}
        <div className={`rounded-2xl p-5 border-2 transition-all ${
          order.status === "new"
            ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10 shadow-md"
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                order.status === "new" ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" : "bg-slate-200 dark:bg-white/10 text-slate-500"
              }`}>1</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">إرسال الطلب للمورد</h4>
            </div>
            {order.supplier_forwarded_at && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ✅ تم الإرسال للمورد
              </span>
            )}
          </div>

          {order.status === "new" && (
            <div className="space-y-4 mt-4 pr-11">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">اختر المورد:</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">اختر المورد المطلوب...</option>
                    {suppliers.filter(s => s.is_active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">تكلفة المورد ($):</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="مثال: 25.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={!selectedSupplierId || isLoading}
                  onClick={() => {
                    const sup = suppliers.find(s => String(s.id) === String(selectedSupplierId));
                    if (sup) openSupplierWhatsApp(order, sup);
                  }}
                  className="flex items-center gap-2 px-5 h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  إرسال رسالة واتساب جاهزة للمورد 📲
                </button>
                <button
                  disabled={!selectedSupplierId || isLoading}
                  onClick={() => onForward(order, selectedSupplierId, costPrice)}
                  className="flex items-center gap-2 px-5 h-11 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-40 transition-all shadow-md shadow-blue-600/20"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  تأكيد الانتقال لخطوة بانتظار المورد
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Receive Account from Supplier */}
        <div className={`rounded-2xl p-5 border-2 transition-all ${
          order.status === "supplier_sent"
            ? "border-orange-500/50 bg-orange-500/5 dark:bg-orange-500/10 shadow-md"
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                order.status === "supplier_sent"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : ["account_received", "delivered", "completed"].includes(order.status)
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-white/10 text-slate-500"
              }`}>2</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">استلام الحساب من المورد وتسجيل بياناته</h4>
            </div>
            {order.account_received_at && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ✅ تم استلام بيانات الحساب
              </span>
            )}
          </div>

          {order.status === "supplier_sent" && (
            <div className="space-y-4 mt-4 pr-11">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Account Email Field */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" /> إيميل الحساب (PSN Email)
                  </label>
                  <Input
                    placeholder="example@email.com"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    dir="ltr"
                  />
                </div>

                {/* Account Password Field */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" /> كلمة سر الحساب (Password)
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Backup / Security Codes (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> أكواد الأمان / احتياطية (Security / Backup Codes - اختياري)
                </label>
                <Input
                  placeholder="مثال: 84920491, 10293847"
                  value={backupCodes}
                  onChange={(e) => setBackupCodes(e.target.value)}
                  dir="ltr"
                />
              </div>

              <button
                disabled={(!accountEmail.trim() && !accountPassword.trim()) || isLoading}
                onClick={handleReceiveSubmit}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 disabled:opacity-40 transition-all shadow-md shadow-orange-500/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                تسجيل الحساب واعتماد الجاهزية للتسليم 📦
              </button>
            </div>
          )}

          {/* Show Saved Account Credentials if available */}
          {order.account_credentials && order.status !== "supplier_sent" && (
            <div className="mt-3 pr-11">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> بيانات الحساب المسجلة
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(order.account_credentials); toast.success("تم نسخ جميع بيانات الحساب"); }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800 dark:text-amber-400 flex items-center gap-1 bg-amber-500/20 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> نسخ الكل
                  </button>
                </div>

                {parsedCreds ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 dir-ltr text-left">
                    {/* Email Pill */}
                    {parsedCreds.email && (
                      <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">الإيميل (Email)</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white font-mono truncate">{parsedCreds.email}</div>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(parsedCreds.email); toast.success("تم نسخ الإيميل"); }}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shrink-0 transition-colors"
                          title="نسخ الإيميل"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Password Pill */}
                    {parsedCreds.password && (
                      <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">كلمة السر (Password)</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white font-mono truncate">{parsedCreds.password}</div>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(parsedCreds.password); toast.success("تم نسخ كلمة السر"); }}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shrink-0 transition-colors"
                          title="نسخ كلمة السر"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Security Codes Pill */}
                    {parsedCreds.codes && (
                      <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">أكواد الأمان (Backup Codes)</div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white font-mono truncate">{parsedCreds.codes}</div>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(parsedCreds.codes); toast.success("تم نسخ أكواد الأمان"); }}
                          className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg shrink-0 transition-colors"
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
            </div>
          )}
        </div>

        {/* Step 3: Deliver to Customer */}
        <div className={`rounded-2xl p-5 border-2 transition-all ${
          order.status === "account_received"
            ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-md"
            : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03]"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                order.status === "account_received"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                  : ["delivered", "completed"].includes(order.status)
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-white/10 text-slate-500"
              }`}>3</div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">تسليم الحساب للعميل وإكمال الطلب</h4>
            </div>
            {order.delivered_at && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ✅ تم التسليم بنجاح
              </span>
            )}
          </div>

          {order.status === "account_received" && (
            <div className="mt-4 pr-11">
              <button
                disabled={isLoading}
                onClick={() => onDeliver(order)}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 transition-all shadow-md shadow-emerald-600/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                تأكيد تسليم الحساب للعميل 🚀
              </button>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="mt-4 pr-11">
              <button
                disabled={isLoading}
                onClick={() => onComplete(order)}
                className="flex items-center gap-2 px-6 h-11 rounded-xl bg-green-700 text-white font-bold text-sm hover:bg-green-800 disabled:opacity-40 transition-all shadow-md shadow-green-700/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                إكمال وتسكير الطلب بالكامل ✅
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Dark Financial Summary Card ───────────────────────────────── */}
      {paid > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 rounded-2xl p-5 text-white shadow-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-400" /> الملخص المالي والأرباح
            </h4>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300 font-mono">
              النسب المعتمدة: 5% رسوم بوابة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-xl font-black text-white">${paid.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">مدفوعات العميل</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-xl font-black text-red-400">-${fee.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">رسوم بوابة الدفع (5%)</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-xl font-black text-amber-400">-${cost.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-1">تكلفة المورد</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
              <div className={`text-xl font-black ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${profit.toFixed(2)}
              </div>
              <div className="text-[10px] font-bold text-emerald-400/80 mt-1">صافي الأرباح 📈</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notes Section ───────────────────────────────────────────── */}
      {order.notes && (
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-slate-200 dark:border-white/10">
          <span className="text-xs font-bold text-slate-400 block mb-1">📝 ملاحظات الطلب</span>
          <p className="text-sm text-slate-700 dark:text-slate-300">{order.notes}</p>
        </div>
      )}

      {/* ── Footer Actions ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
        {order.status !== "cancelled" && order.status !== "completed" && (
          <button onClick={() => onCancel(order)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors">
            <XCircle className="w-4 h-4" /> إلغاء هذا الطلب
          </button>
        )}
        <button onClick={() => onDelete(order)} className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1.5 transition-colors mr-auto">
          <Trash2 className="w-4 h-4" /> حذف سجل الطلب نهائياً
        </button>
      </div>
    </div>
  );
}
