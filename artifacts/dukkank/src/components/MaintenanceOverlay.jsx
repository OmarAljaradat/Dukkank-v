import { useEffect, useState } from "react";
import { Wrench, Sparkles, Clock } from "lucide-react";

/**
 * Beautiful full-screen maintenance overlay.
 * Animated gear, floating particles, gradient backdrop.
 */
export const MaintenanceOverlay = ({ title, message, estimatedReturn }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        // lock body scroll while overlay is open
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    // Floating particle positions (stable across renders)
    const particles = Array.from({ length: 24 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        delay: `${(i * 0.31) % 5}s`,
        duration: `${6 + (i % 5)}s`,
        size: 4 + (i % 4) * 2,
    }));

    return (
        <div
            dir="rtl"
            data-testid="maintenance-overlay"
            className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
                mounted ? "opacity-100" : "opacity-0"
            }`}
            style={{
                background:
                    "radial-gradient(circle at 20% 20%, #1e3a5f 0%, #0f172a 50%, #020617 100%)",
                fontFamily: "'Tajawal', sans-serif",
            }}
        >
            {/* Animated gradient mesh */}
            <div className="absolute inset-0 opacity-40">
                <div
                    className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse"
                    style={{ background: "radial-gradient(circle, #5b86b8 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse"
                    style={{
                        background: "radial-gradient(circle, #dc2626 0%, transparent 70%)",
                        animationDelay: "1.5s",
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl animate-pulse"
                    style={{
                        background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
                        animationDelay: "0.8s",
                    }}
                />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((p, i) => (
                    <span
                        key={i}
                        className="absolute rounded-full bg-white/40"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            animation: `floatParticle ${p.duration} ease-in-out ${p.delay} infinite`,
                            boxShadow: "0 0 12px rgba(255,255,255,0.6)",
                        }}
                    />
                ))}
            </div>

            {/* Main card */}
            <div className="relative z-10 max-w-2xl mx-4 px-8 sm:px-12 py-10 sm:py-14 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.5)] text-center">
                {/* Animated gear icon */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_10px_40px_-5px_rgba(251,191,36,0.5)]" />
                    <div
                        className="absolute inset-3 rounded-full bg-slate-900/30 flex items-center justify-center"
                        style={{ animation: "spinSlow 8s linear infinite" }}
                    >
                        <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" strokeWidth={2.5} />
                    </div>
                    <Sparkles
                        className="absolute -top-2 -right-2 w-6 h-6 text-amber-300"
                        style={{ animation: "twinkle 2.5s ease-in-out infinite" }}
                    />
                    <Sparkles
                        className="absolute -bottom-1 -left-3 w-5 h-5 text-amber-200"
                        style={{ animation: "twinkle 2.5s ease-in-out 0.8s infinite" }}
                    />
                </div>

                {/* Title */}
                <h1
                    className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight"
                    style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                >
                    {title || "الموقع تحت الصيانة"}
                </h1>

                {/* Animated separator */}
                <div className="flex items-center justify-center gap-2 mb-5">
                    <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-amber-400" />
                    <span className="text-amber-400 text-xl">⚙</span>
                    <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-amber-400" />
                </div>

                {/* Message */}
                {message && (
                    <p className="text-base sm:text-lg text-white/85 leading-relaxed whitespace-pre-line mb-6 font-medium">
                        {message}
                    </p>
                )}

                {/* Estimated return */}
                {estimatedReturn && (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>الرجوع المتوقع: {estimatedReturn}</span>
                    </div>
                )}

                {/* Pulsing dot */}
                <div className="mt-8 flex items-center justify-center gap-2 text-white/60 text-xs uppercase tracking-[0.2em]">
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>نشتغل عليه الحين</span>
                </div>
            </div>

            <style>{`
                @keyframes floatParticle {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
                    50% { transform: translateY(-30px) translateX(15px); opacity: 1; }
                }
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0.4; transform: scale(0.9); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
};

export default MaintenanceOverlay;
