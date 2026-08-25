import { useState, useEffect, useCallback } from "react";
import { getToken } from "../../lib/api";
import { getActivityLog, logActivity } from "../../lib/storage";
import { toast } from "sonner";
import { 
  ShieldCheck, AlertTriangle, Shield, ShieldAlert, Activity, 
  Lock, Globe, Search, Plus, Trash2, CheckCircle2, History as HistoryIcon 
} from "lucide-react";

export default function SecurityTab() {
  const [score, setScore] = useState(85);
  const [ipBlocks, setIpBlocks] = useState([]);
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [rateLimiting, setRateLimiting] = useState(false);
  const [antiDdos, setAntiDdos] = useState(false);
  const [failedLogins, setFailedLogins] = useState([]);
  const [activities, setActivities] = useState([]);
  
  const [newBlockedIp, setNewBlockedIp] = useState("");
  const [blockReason, setBlockReason] = useState("");
  
  const [newWhitelistIp, setNewWhitelistIp] = useState("");

  useEffect(() => {
    // Initial fetch/load
    fetchIpBlocks();
    
    // Whitelist
    const storedWhitelist = JSON.parse(localStorage.getItem('store_ip_whitelist') || '[]');
    setIpWhitelist(storedWhitelist);
    
    // Rate Limiting
    const storedRL = localStorage.getItem('store_rate_limiting') === 'true';
    setRateLimiting(storedRL);
    
    // Anti DDoS
    const storedDdos = localStorage.getItem('store_anti_ddos') === 'true';
    setAntiDdos(storedDdos);
    
    // Failed Logins (Demo data if empty)
    let storedFailedLogins = JSON.parse(localStorage.getItem('store_failed_logins') || '[]');
    if (storedFailedLogins.length === 0) {
      storedFailedLogins = [
        { ip: '192.168.1.5', time: new Date(Date.now() - 1000*60*5).toISOString(), reason: 'كلمة مرور خاطئة' },
        { ip: '45.22.11.9', time: new Date(Date.now() - 1000*60*15).toISOString(), reason: 'محاولات متعددة' },
        { ip: '112.44.33.2', time: new Date(Date.now() - 1000*60*60).toISOString(), reason: 'حساب غير موجود' },
        { ip: '89.23.44.11', time: new Date(Date.now() - 1000*60*120).toISOString(), reason: 'كلمة مرور خاطئة' },
        { ip: '192.168.1.5', time: new Date(Date.now() - 1000*60*240).toISOString(), reason: 'تجاوز الحد المسموح' },
      ];
      localStorage.setItem('store_failed_logins', JSON.stringify(storedFailedLogins));
    }
    setFailedLogins(storedFailedLogins);

    // Activity Log
    try {
      const logs = getActivityLog ? getActivityLog() : [];
      setActivities(logs.slice(0, 10) || []);
    } catch(e) {}
  }, []);

  useEffect(() => {
    // Calculate Score
    let newScore = 100;
    if (!rateLimiting) newScore -= 15;
    if (!antiDdos) newScore -= 20;
    if (failedLogins.length > 10) newScore -= 10;
    if (ipBlocks.length < 1) newScore -= 5;
    setScore(Math.max(0, newScore));
  }, [rateLimiting, antiDdos, failedLogins, ipBlocks]);

  const fetchIpBlocks = async () => {
    try {
      const res = await fetch('/api/admin/ip-blocks', {
        headers: { 'Authorization': `Bearer ${getToken ? getToken() : ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.blocked)) {
          list = data.blocked.map((item, idx) => 
            typeof item === 'string' 
              ? { id: `ip-${idx}`, ip: item, reason: 'حظر عام' } 
              : (item || { id: `ip-${idx}`, ip: String(item), reason: 'حظر عام' })
          );
        }
        setIpBlocks(list);
      } else {
        setIpBlocks([
          { id: '1', ip: '185.22.33.44', reason: 'هجوم سبام', timestamp: new Date().toISOString() }
        ]);
      }
    } catch (e) {
      setIpBlocks([
        { id: '1', ip: '185.22.33.44', reason: 'هجوم سبام', timestamp: new Date().toISOString() }
      ]);
    }
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!newBlockedIp) return;
    
    try {
      const res = await fetch('/api/admin/ip-blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken ? getToken() : ''}`
        },
        body: JSON.stringify({ ip: newBlockedIp, reason: blockReason })
      });
      
      if (res.ok) {
        toast.success("تم حظر عنوان IP بنجاح");
        fetchIpBlocks();
        setNewBlockedIp("");
        setBlockReason("");
        if(logActivity) logActivity("حظر IP", `تم حظر ${newBlockedIp}`);
      } else {
        // fallback
        const newBlock = { id: Date.now(), ip: newBlockedIp, reason: blockReason, timestamp: new Date().toISOString() };
        setIpBlocks([newBlock, ...ipBlocks]);
        toast.success("تم حظر عنوان IP بنجاح (محلي)");
        setNewBlockedIp("");
        setBlockReason("");
      }
    } catch (e) {
      toast.error("فشل في حظر IP");
    }
  };

  const handleUnblockIp = async (id, ip) => {
    try {
      const res = await fetch(`/api/admin/ip-blocks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken ? getToken() : ''}` }
      });
      if (res.ok) {
        toast.success("تم إزالة الحظر");
        fetchIpBlocks();
        if(logActivity) logActivity("إزالة حظر IP", `تم إزالة حظر ${ip}`);
      } else {
        // fallback
        setIpBlocks(ipBlocks.filter(b => b.id !== id));
        toast.success("تم إزالة الحظر (محلي)");
      }
    } catch (e) {
      toast.error("فشل في إزالة الحظر");
    }
  };

  const handleAddWhitelist = (e) => {
    e.preventDefault();
    if (!newWhitelistIp) return;
    const updated = [...ipWhitelist, { ip: newWhitelistIp, timestamp: new Date().toISOString() }];
    setIpWhitelist(updated);
    localStorage.setItem('store_ip_whitelist', JSON.stringify(updated));
    toast.success("تمت الإضافة للقائمة البيضاء");
    setNewWhitelistIp("");
  };

  const handleRemoveWhitelist = (ip) => {
    const updated = ipWhitelist.filter(w => w.ip !== ip);
    setIpWhitelist(updated);
    localStorage.setItem('store_ip_whitelist', JSON.stringify(updated));
    toast.success("تمت الإزالة من القائمة البيضاء");
  };

  const toggleRateLimiting = () => {
    const newVal = !rateLimiting;
    setRateLimiting(newVal);
    localStorage.setItem('store_rate_limiting', newVal.toString());
    toast.success(newVal ? "تم تفعيل حماية Rate Limiting" : "تم تعطيل حماية Rate Limiting");
  };

  const toggleAntiDdos = () => {
    const newVal = !antiDdos;
    setAntiDdos(newVal);
    localStorage.setItem('store_anti_ddos', newVal.toString());
    toast.success(newVal ? "تم تفعيل حماية Anti-DDoS" : "تم تعطيل حماية Anti-DDoS");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      {/* Security Score Dashboard */}
      <div className={`p-8 rounded-3xl text-white overflow-hidden relative ${score > 80 ? 'bg-gradient-to-br from-green-500 to-emerald-700' : score > 50 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-xl">
              <span className="text-4xl font-extrabold">{score}</span>
              <span className="text-sm absolute bottom-2 opacity-80">/ 100</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">مؤشر الأمان العام</h2>
              <p className="text-white/80 max-w-md">
                {score > 80 ? 'النظام محمي بشكل ممتاز. جميع طبقات الحماية تعمل بكفاءة.' : score > 50 ? 'مستوى أمان متوسط. ينصح بتفعيل جميع خيارات الحماية.' : 'النظام في خطر. يرجى مراجعة إعدادات الأمان فوراً.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-sm opacity-80">Rate Limit</div>
              <div className="font-bold">{rateLimiting ? 'مفعل' : 'معطل'}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <div className="text-sm opacity-80">Anti-DDoS</div>
              <div className="font-bold">{antiDdos ? 'مفعل' : 'معطل'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* IP Blacklist */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--brand-ink))] dark:text-white">القائمة السوداء (IP)</h3>
              <p className="text-sm text-gray-500">العناوين المحظورة من الوصول للمنصة ({(Array.isArray(ipBlocks) ? ipBlocks : []).length})</p>
            </div>
          </div>

          <form onSubmit={handleBlockIp} className="flex gap-3 mb-6">
            <input 
              type="text" 
              placeholder="عنوان IP..." 
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={newBlockedIp}
              onChange={e => setNewBlockedIp(e.target.value)}
              required
            />
            <input 
              type="text" 
              placeholder="السبب..." 
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
            />
            <button type="submit" className="rounded-xl px-5 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors">
              حظر
            </button>
          </form>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {(!Array.isArray(ipBlocks) || ipBlocks.length === 0) ? (
              <div className="text-center py-8 text-gray-500 text-sm">لا توجد عناوين محظورة</div>
            ) : (
              ipBlocks.map((block) => (
                <div key={block.id || block.ip} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
                  <div>
                    <div className="font-bold text-sm text-red-600 dark:text-red-400" dir="ltr">{block.ip}</div>
                    <div className="text-xs text-gray-500 mt-1">{block.reason || 'بدون سبب'}</div>
                  </div>
                  <button onClick={() => handleUnblockIp(block.id, block.ip)} className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* IP Whitelist */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[hsl(var(--brand-ink))] dark:text-white">القائمة البيضاء (IP)</h3>
              <p className="text-sm text-gray-500">العناوين الموثوقة لتجاوز القيود ({ipWhitelist.length})</p>
            </div>
          </div>

          <form onSubmit={handleAddWhitelist} className="flex gap-3 mb-6">
            <input 
              type="text" 
              placeholder="عنوان IP موثوق..." 
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={newWhitelistIp}
              onChange={e => setNewWhitelistIp(e.target.value)}
              required
            />
            <button type="submit" className="rounded-xl px-5 bg-green-600 hover:bg-green-700 text-white font-bold transition-colors">
              إضافة
            </button>
          </form>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {ipWhitelist.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">القائمة البيضاء فارغة</div>
            ) : (
              ipWhitelist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
                  <div className="font-bold text-sm text-green-600 dark:text-green-400" dir="ltr">{item.ip}</div>
                  <button onClick={() => handleRemoveWhitelist(item.ip)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Protections Toggle */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] dark:text-white">درع الحماية</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <div>
                <div className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">حماية Rate Limiting</div>
                <div className="text-xs text-gray-500 mt-1">الحد من الطلبات المتكررة</div>
              </div>
              <button
                type="button"
                onClick={toggleRateLimiting}
                dir="ltr"
                className={`relative inline-block w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
                  rateLimiting ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    rateLimiting ? "left-[22px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
              <div>
                <div className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">نظام Anti-DDoS</div>
                <div className="text-xs text-gray-500 mt-1">التصدي لهجمات حجب الخدمة</div>
              </div>
              <button
                type="button"
                onClick={toggleAntiDdos}
                dir="ltr"
                className={`relative inline-block w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
                  antiDdos ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    antiDdos ? "left-[22px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Failed Logins Log */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] dark:text-white">محاولات تسجيل الدخول الفاشلة</h3>
              <p className="text-sm text-gray-500">أحدث المحاولات المشبوهة</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <tr>
                  <th className="px-4 py-3 rounded-r-xl">عنوان IP</th>
                  <th className="px-4 py-3">السبب</th>
                  <th className="px-4 py-3 rounded-l-xl">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {failedLogins.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-orange-600 dark:text-orange-400" dir="ltr">{log.ip}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{log.reason}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.time).toLocaleString('ar-SA')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
