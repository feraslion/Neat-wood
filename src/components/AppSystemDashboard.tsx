import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  HardDrive, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  BarChart2,
  Bot,
  CheckSquare,
  Notebook,
  Calculator,
  Palette,
  Folder,
  Boxes,
  Receipt,
  TrendingUp,
  Monitor,
  Power,
  Activity,
  XCircle
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { triggerToast } from "../utils/toast";
import { WindowInstance } from "../types";
import { safeStorage } from "../utils/storage";

interface PerformancePoint {
  time: string;
  cpu: number;
  ram: number;
}

interface AppSystemDashboardProps {
  windows?: WindowInstance[];
  onCloseWindow?: (id: string) => void;
}

export default function AppSystemDashboard({ windows = [], onCloseWindow }: AppSystemDashboardProps) {
  const [cpu, setCpu] = useState(32);
  const [ram, setRam] = useState(48); // Start around 48%
  const [history, setHistory] = useState<PerformancePoint[]>(() => {
    // Generate initial history points
    const points: PerformancePoint[] = [];
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 3000);
      points.push({
        time: t.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        cpu: Math.floor(Math.random() * 20) + 15,
        ram: Math.floor(Math.random() * 5) + 45,
      });
    }
    return points;
  });

  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedBytes, setCleanedBytes] = useState<string | null>(null);

  const [appMetrics, setAppMetrics] = useState<Record<string, { ram: number; latency: number; pid: number }>>({
    ai: { ram: 310, latency: 14, pid: 4892 },
    tasks: { ram: 115, latency: 3, pid: 1024 },
    notes: { ram: 90, latency: 2, pid: 1240 },
    calc: { ram: 42, latency: 1, pid: 3012 },
    files: { ram: 175, latency: 4, pid: 2840 },
    inventory: { ram: 205, latency: 5, pid: 4055 },
    invoices: { ram: 235, latency: 6, pid: 4120 },
    reports: { ram: 275, latency: 8, pid: 5122 },
    settings: { ram: 68, latency: 2, pid: 1812 },
    system: { ram: 145, latency: 3, pid: 1100 },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setAppMetrics((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const ramDelta = Math.floor(Math.random() * 7) - 3;
          const latencyDelta = Math.floor(Math.random() * 3) - 1;
          next[key] = {
            ...next[key],
            ram: Math.max(20, next[key].ram + ramDelta),
            latency: Math.max(1, next[key].latency + latencyDelta),
          };
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleForceClose = (id: string, title: string) => {
    if (onCloseWindow) {
      onCloseWindow(id);
      const isAr = safeStorage.getItem("workspace_language") === "ar";
      triggerToast(
        isAr ? `تم إنهاء عملية تطبيق "${title}" قسرياً بنجاح!` : `Force closed "${title}" process successfully!`,
        "success"
      );
    }
  };

  const renderAppIcon = (iconName: string, size = 16) => {
    switch (iconName) {
      case "Bot": return <Bot size={size} className="text-blue-400" />;
      case "CheckSquare": return <CheckSquare size={size} className="text-emerald-400" />;
      case "Notebook": return <Notebook size={size} className="text-indigo-400" />;
      case "Calculator": return <Calculator size={size} className="text-amber-400" />;
      case "Palette": return <Palette size={size} className="text-purple-400" />;
      case "Folder": return <Folder size={size} className="text-yellow-500" />;
      case "Boxes": return <Boxes size={size} className="text-orange-400" />;
      case "Receipt": return <Receipt size={size} className="text-teal-400" />;
      case "TrendingUp": return <TrendingUp size={size} className="text-rose-400" />;
      case "Activity": return <Activity size={size} className="text-emerald-400" />;
      default: return <Monitor size={size} className="text-sky-400" />;
    }
  };

  // Fluctuating real-time CPU and RAM telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCleaning) return; // Don't fluctuate normally during cleaning

      setCpu((prev) => {
        const delta = Math.floor(Math.random() * 15) - 7; // -7 to +7
        return Math.max(12, Math.min(88, prev + delta));
      });

      setRam((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1.5; // slow changes
        return Math.max(30, Math.min(95, prev + delta));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isCleaning]);

  // Keep history updated
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    setHistory((prev) => {
      const updated = [...prev, { time: timeStr, cpu, ram }];
      if (updated.length > 12) {
        updated.shift();
      }
      return updated;
    });
  }, [cpu, ram]);

  // Handle Memory Cleaner Trigger
  const handleCleanMemory = () => {
    if (isCleaning) return;
    setIsCleaning(true);
    setCleanedBytes(null);

    triggerToast(
      safeStorage.getItem("workspace_language") === "ar"
        ? "جاري فحص الذاكرة وتطهير العمليات غير النشطة..."
        : "Scanning memory and clearing inactive processes...",
      "info"
    );

    setTimeout(() => {
      // Sweeping simulation completes
      setCpu(8); // drop CPU temporarily
      setRam(18); // drop RAM significantly to 18%
      const released = (Math.random() * 1.5 + 1.2).toFixed(2); // 1.2 to 2.7 GB
      setCleanedBytes(released);
      setIsCleaning(false);

      triggerToast(
        safeStorage.getItem("workspace_language") === "ar"
          ? `تم تنظيف الذاكرة وتحرير ${released} جيجابايت بنجاح!`
          : `Memory cleaned, released ${released} GB successfully!`,
        "success"
      );

      // Dispatches a workspace update so any global RAM indicator also updates
      safeStorage.setItem("workspace_ram_usage", "18");
      window.dispatchEvent(new Event("workspace-update"));
    }, 2000);
  };

  return (
    <div id="app-system-dashboard" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 space-y-4 overflow-y-auto scrollbar-thin" dir="rtl">
      {/* Overview stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* CPU Card */}
        <div className="bg-gradient-to-br from-slate-950/80 to-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-400 font-bold block">تحميل المعالج (CPU)</span>
            <span className="text-xl font-extrabold text-blue-400 font-mono">{cpu}%</span>
            <span className="text-[9px] text-slate-500 block">النواة النشطة: 8 / 8</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
            <Cpu size={22} className={cpu > 70 ? "animate-bounce" : ""} />
          </div>
        </div>

        {/* RAM Card */}
        <div className="bg-gradient-to-br from-slate-950/80 to-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="space-y-1 text-right">
            <span className="text-[10px] text-slate-400 font-bold block">استهلاك الذاكرة (RAM)</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{ram}%</span>
            <span className="text-[9px] text-slate-500 block">
              {(16 * (ram / 100)).toFixed(1)} GB / 16.0 GB
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
            <HardDrive size={22} className={isCleaning ? "animate-spin" : ""} />
          </div>
        </div>
      </div>

      {/* Memory Cleaning Tools Card */}
      <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl flex flex-col items-center text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Layers size={80} className="text-indigo-400" />
        </div>

        <div className="z-10">
          <h3 className="text-xs font-bold text-slate-200">تحسين مساحة العمل وتسريع النظام</h3>
          <p className="text-[10px] text-slate-400 mt-1 max-w-sm leading-relaxed">
            تراكم الملفات المؤقتة وسجلات التتبع في المتصفح قد يبطئ من استجابة النوافذ. اضغط أدناه لتحرير مساحة الذاكرة المهدورة فوراً.
          </p>
        </div>

        <button
          onClick={handleCleanMemory}
          disabled={isCleaning}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer ${
            isCleaning
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-600/10"
          }`}
        >
          <RefreshCw size={13} className={isCleaning ? "animate-spin" : ""} />
          <span>{isCleaning ? "جاري تنظيف مساحة الذاكرة..." : "تطهير وتنظيف الذاكرة العشوائية"}</span>
        </button>

        {cleanedBytes && (
          <div className="z-10 animate-in fade-in slide-in-from-bottom-2 duration-300 text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <CheckCircle size={11} />
            <span>تم بنجاح تحرير <strong>{cleanedBytes} GB</strong> من سعة الذاكرة المستهلكة!</span>
          </div>
        )}
      </div>

      {/* Real-time Graph Area */}
      <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl flex flex-col h-48">
        <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 mb-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
            <BarChart2 size={13} className="text-blue-400" />
            <span>مخطط الاستهلاك البياني الفوري</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500">التحديث كل 2 ثانية</span>
        </div>

        <div className="flex-1 w-full text-[9px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: -15, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" fontSize={8} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#475569" fontSize={8} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded text-[9px] text-slate-200">
                        <p className="font-bold">{payload[0].payload.time}</p>
                        <p className="text-blue-400 mt-0.5">المعالج: {payload[0].value}%</p>
                        <p className="text-emerald-400">الذاكرة: {payload[1].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="ram" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Application Performance Monitor */}
      <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex flex-col space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-200">مراقبة أداء التطبيقات النشطة</h3>
          </div>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
            {windows.filter((w) => w.isOpen).length} عمليات جارية
          </span>
        </div>

        {windows.filter((w) => w.isOpen).length === 0 ? (
          <div className="text-center py-4 text-slate-500 text-[10px]">
            لا توجد تطبيقات مفتوحة حالياً في مساحة العمل.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {windows.filter((w) => w.isOpen).map((app) => {
              const metrics = appMetrics[app.id] || { ram: 120, latency: 4, pid: 2100 };
              const isHighLatency = metrics.latency > 10;
              
              return (
                <div key={app.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/50 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                      {renderAppIcon(app.icon, 14)}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-200 block">{app.title}</span>
                      <span className="text-[8px] text-slate-500 font-mono block">PID: {metrics.pid}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* RAM */}
                    <div className="text-right shrink-0">
                      <span className="text-[8px] text-slate-400 block">الذاكرة (RAM)</span>
                      <span className="text-[11px] font-bold text-emerald-400 font-mono">{metrics.ram} MB</span>
                    </div>

                    {/* Latency */}
                    <div className="text-right shrink-0">
                      <span className="text-[8px] text-slate-400 block">الاستجابة</span>
                      <span className={`text-[11px] font-bold font-mono ${isHighLatency ? "text-amber-400" : "text-blue-400"}`}>
                        {metrics.latency} ms
                      </span>
                    </div>

                    {/* Force Close */}
                    <button
                      onClick={() => handleForceClose(app.id, app.title)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition-all duration-200 cursor-pointer"
                      title="إنهاء العملية قسرياً"
                    >
                      <Power size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workspace System Diagnostics */}
      <div className="bg-slate-950/20 border border-slate-800/40 p-3 rounded-xl space-y-2 text-[10px]">
        <h4 className="font-bold text-slate-300 border-r-2 border-indigo-500 pr-1.5">تشخيصات العمل الحالية</h4>
        <div className="grid grid-cols-2 gap-2 text-slate-400">
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span>استقرار النظام:</span>
            <span className="text-emerald-400 font-bold">100% ممتاز</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span>سرعة الاستجابة:</span>
            <span className="text-emerald-400 font-bold">4 ms</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span>بروتوكول الواجهة:</span>
            <span className="font-mono text-slate-300">HTTP/2 TLS</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/40 pb-1">
            <span>خادم الويب:</span>
            <span className="text-slate-300">Nginx Container</span>
          </div>
        </div>
      </div>
    </div>
  );
}
