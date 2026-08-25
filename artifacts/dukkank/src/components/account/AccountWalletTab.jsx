import { useState, useEffect } from "react";
import { Wallet, PlusCircle, CreditCard, Ticket, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AccountWalletTab({ walletBalance, topUpWallet, addToCart, setCartOpen }) {
    const MAX_WALLET_CAP = 100.00; // Maximum allowed wallet balance cap in USD

    const [customAmount, setCustomAmount] = useState("");
    const [voucherCode, setVoucherCode] = useState("");
    const [transactions, setTransactions] = useState([]);

    const TRANSACTIONS_KEY = "dukkank_wallet_tx_history";

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        try {
            const saved = localStorage.getItem(TRANSACTIONS_KEY);
            if (saved) {
                setTransactions(JSON.parse(saved));
            } else {
                const initialTx = [
                    {
                        id: "TX-901",
                        type: "topup",
                        title: "شحن رصيد المحفظة اونلاين",
                        amount: 25.00,
                        date: new Date().toLocaleDateString("ar-EG"),
                    },
                    {
                        id: "TX-892",
                        type: "purchase",
                        title: "شراء لعبة EA Sports FC 26 — PS5",
                        amount: -22.98,
                        date: new Date(Date.now() - 86400000).toLocaleDateString("ar-EG"),
                    }
                ];
                setTransactions(initialTx);
                localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialTx));
            }
        } catch (_) {}
    };

    const addTransaction = (type, title, amount) => {
        const newTx = {
            id: `TX-${Math.floor(100 + Math.random() * 900)}`,
            type,
            title,
            amount,
            date: new Date().toLocaleDateString("ar-EG"),
        };
        const updated = [newTx, ...transactions];
        setTransactions(updated);
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
    };

    // Realistic Checkout Top-Up trigger (Adds to cart for payment)
    const handleInitiateTopUp = (amount) => {
        const currentBal = walletBalance || 0;
        if (currentBal + amount > MAX_WALLET_CAP) {
            const remainingAllowed = Math.max(0, MAX_WALLET_CAP - currentBal);
            toast.error(`⚠️ الحد الأقصى لرصيد المحفظة هو $${MAX_WALLET_CAP.toFixed(2)}!`, {
                description: `رصيدك الحالي $${currentBal.toFixed(2)}. يمكنك شحن حتى $${remainingAllowed.toFixed(2)} كحد أقصى.`
            });
            return;
        }

        addToCart({
            key: `wallet-topup-${Date.now()}`,
            title: `💳 شحن محفظة رصيد (+$${amount})`,
            subtitle: "رصيد رقمي مباشر للشراء الفوري",
            price: amount,
        });

        if (setCartOpen) setCartOpen(true);
        toast.success(`تمت إضافة شحن المحفظة بـ $${amount} للسلة! 💳`, {
            description: "يرجى إتمام عملية الدفع وسيتم إضافة المبلغ لرصيدك فوراً."
        });
    };

    const handleCustomTopUp = (e) => {
        e.preventDefault();
        const amt = parseFloat(customAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("يرجى إدخال مبلغ شحن صحيح");
            return;
        }
        handleInitiateTopUp(amt);
        setCustomAmount("");
    };

    const handleRedeemVoucher = (e) => {
        e.preventDefault();
        const code = voucherCode.trim().toUpperCase();
        if (!code) return;

        const currentBal = walletBalance || 0;

        let bonusAmount = 0;
        if (code === "DUKKANK10" || code === "WELCOME10") bonusAmount = 10;
        else if (code === "VIP25" || code === "GIFT25") bonusAmount = 25;

        if (bonusAmount > 0) {
            if (currentBal + bonusAmount > MAX_WALLET_CAP) {
                toast.error(`⚠️ تعذر إضافة القسيمة! تجاوز الحد الأقصى للمحفظة ($${MAX_WALLET_CAP.toFixed(2)})`);
                return;
            }

            topUpWallet(bonusAmount);
            addTransaction("bonus", `استرداد قسيمة شحن (${code})`, bonusAmount);
            setVoucherCode("");
        } else {
            toast.error("كود القسيمة غير صحيح أو منتهي الصلاحية");
        }
    };

    const remainingToCap = Math.max(0, MAX_WALLET_CAP - (walletBalance || 0));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--brand-ink))]/10">
                <div>
                    <h2 className="text-xl font-black text-[hsl(var(--brand-ink))] flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-emerald-600" />
                        <span>محفظتي ورصيدي الإلكتروني</span>
                    </h2>
                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium mt-0.5">
                        رصيدك الرقمي للشراء الفوري السريع • الحد الأقصى للمحفظة: ${MAX_WALLET_CAP.toFixed(2)} USD
                    </p>
                </div>
            </div>

            {/* Main Wallet Card Showcase */}
            <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden space-y-6 border border-emerald-500/20">
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-emerald-500/20 backdrop-blur border border-emerald-400/30 text-emerald-300">
                            <CreditCard className="w-5 h-5" />
                        </span>
                        <span className="text-xs font-black text-emerald-200">بطاقة رصيد دُكانك</span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur text-emerald-300 text-xs font-black border border-emerald-400/30 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                        <span>الحد الأقصى $100</span>
                    </span>
                </div>

                <div className="relative z-10 space-y-1">
                    <div className="text-xs text-emerald-200/80 font-semibold flex items-center gap-2">
                        <span>الرصيد المتاح حالياً:</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-emerald-300">
                            متبقي حتى الحد الأقصى: ${remainingToCap.toFixed(2)}
                        </span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-2">
                        <span>${(walletBalance || 0).toFixed(2)}</span>
                        <span className="text-xs font-bold text-emerald-300">/ $100.00 USD</span>
                    </div>
                </div>

                {/* Quick Top-Up Preset Buttons */}
                <div className="pt-4 border-t border-white/15 relative z-10 space-y-3">
                    <div className="text-xs font-black text-emerald-200 flex items-center justify-between">
                        <span>اختر مبلغ الشحن (يتم الانتقال للدفع والدفع أونلاين 💳):</span>
                        <span className="text-[11px] text-emerald-300/80">دفع آمن 100%</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[10, 25, 50, 100].map((amt) => {
                            const isOverCap = (walletBalance || 0) + amt > MAX_WALLET_CAP;
                            return (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => handleInitiateTopUp(amt)}
                                    disabled={isOverCap}
                                    className={`h-11 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 backdrop-blur ${
                                        isOverCap
                                            ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed opacity-50"
                                            : "bg-white/15 hover:bg-white/30 text-white border-white/20 hover:scale-102 cursor-pointer"
                                    }`}
                                >
                                    <PlusCircle className="w-4 h-4 text-emerald-300" />
                                    <span>شحن +${amt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top-Up Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Custom Amount Top-Up */}
                <form onSubmit={handleCustomTopUp} className="bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 font-black text-xs text-[hsl(var(--brand-ink))]">
                        <PlusCircle className="w-4.5 h-4.5 text-emerald-600" />
                        <span>شحن بمبلغ مخصص أونلاين:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="text-xs font-bold text-[hsl(var(--brand-ink))]/40 absolute left-3 top-1/2 -translate-y-1/2">$</span>
                            <input
                                type="number"
                                min="1"
                                max={remainingToCap}
                                step="any"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder={`مبلغ الشحن (حتى $${remainingToCap.toFixed(0)})`}
                                className="w-full h-11 pr-4 pl-7 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/30 text-xs font-bold focus:outline-none focus:border-emerald-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors shrink-0 cursor-pointer"
                        >
                            انتقال للدفع 💳
                        </button>
                    </div>
                </form>

                {/* 2. Redeem Gift Card Code */}
                <form onSubmit={handleRedeemVoucher} className="bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 font-black text-xs text-[hsl(var(--brand-ink))]">
                        <Ticket className="w-4.5 h-4.5 text-purple-600" />
                        <span>استرداد كود قسيمة أو كارت شحن:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            placeholder="ادخل كود القسيمة (مثال: DUKKANK10)"
                            className="w-full h-11 px-4 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/30 text-xs font-bold focus:outline-none focus:border-purple-600 uppercase"
                        />
                        <button
                            type="submit"
                            className="h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-colors shrink-0 cursor-pointer"
                        >
                            استرداد ✨
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 3: Transaction History Ledger */}
            <div className="bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[hsl(var(--brand-ink))]/10 pb-3">
                    <h3 className="font-black text-sm text-[hsl(var(--brand-ink))] flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-emerald-600" />
                        <span>سجل حركات وعمليات المحفظة:</span>
                    </h3>
                    <span className="text-xs text-[hsl(var(--brand-ink))]/50 font-bold">
                        {transactions.length} حركات
                    </span>
                </div>

                <div className="space-y-2.5">
                    {transactions.map((tx) => {
                        const isIncome = tx.amount > 0;
                        return (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[hsl(var(--brand-cream))]/40 border border-[hsl(var(--brand-ink))]/5 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                    }`}>
                                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>

                                    <div>
                                        <div className="font-extrabold text-xs text-[hsl(var(--brand-ink))]">
                                            {tx.title}
                                        </div>
                                        <div className="text-[10px] text-[hsl(var(--brand-ink))]/50 font-medium">
                                            {tx.date} • المعاملة #{tx.id}
                                        </div>
                                    </div>
                                </div>

                                <div className={`font-black text-sm ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                                    {isIncome ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
