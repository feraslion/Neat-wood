import React, { useState, useEffect } from "react";
import {
  Bot,
  Notebook,
  CheckSquare,
  Calculator,
  RefreshCw,
  Clock,
  Calendar as CalendarIcon,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Layers,
  HelpCircle,
  LayoutGrid,
  Monitor,
  Volume2,
  VolumeX,
} from "lucide-react";
import { WindowInstance } from "./types";
import DesktopWindow from "./components/DesktopWindow";
import AppAI from "./components/AppAI";
import AppTasks from "./components/AppTasks";
import AppNotes from "./components/AppNotes";
import AppCalc from "./components/AppCalc";

export default function App() {
  // Current date & time for taskbar
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Window states
  const [windows, setWindows] = useState<WindowInstance[]>([
    {
      id: "ai",
      title: "المساعد الذكي (Gemini API)",
      icon: "Bot",
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 10,
      width: 440,
      height: 520,
      x: 30,
      y: 80,
    },
    {
      id: "tasks",
      title: "مدير المهام والإنتاجية",
      icon: "CheckSquare",
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 5,
      width: 400,
      height: 480,
      x: 500,
      y: 50,
    },
    {
      id: "notes",
      title: "مفكرة النصوص الذكية",
      icon: "Notebook",
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      width: 550,
      height: 400,
      x: 350,
      y: 200,
    },
    {
      id: "calc",
      title: "الحاسبة السريعة",
      icon: "Calculator",
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      width: 300,
      height: 420,
      x: 100,
      y: 250,
    },
  ]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play a beautiful micro-interaction audio using synthesize patterns or web-audio api
  const playSystemSound = (type: "click" | "window" | "close") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "click") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "window") {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "close") {
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio context might be blocked or unsupported in some sandboxes
    }
  };

  // Focus a window (bring to front)
  const focusWindow = (id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w));
    });
  };

  // Open/toggle window
  const openWindow = (id: string) => {
    playSystemSound("window");
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isOpen: true, isMinimized: false } : w
      )
    );
    focusWindow(id);
  };

  // Close window
  const closeWindow = (id: string) => {
    playSystemSound("close");
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))
    );
  };

  // Minimize window
  const minimizeWindow = (id: string) => {
    playSystemSound("click");
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  };

  // Maximize / Restore window
  const toggleMaximizeWindow = (id: string) => {
    playSystemSound("click");
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  // Move window
  const moveWindow = (id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  };

  // Resize window
  const resizeWindow = (id: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, width, height } : w))
    );
  };

  // Distribute / cascade windows neatly
  const cascadeWindows = () => {
    playSystemSound("window");
    setWindows((prev) =>
      prev.map((w, index) => ({
        ...w,
        isMaximized: false,
        isMinimized: false,
        isOpen: true,
        x: 60 + index * 40,
        y: 90 + index * 45,
        zIndex: 10 + index,
      }))
    );
  };

  return (
    <div
      id="desktop-root"
      className="h-screen w-full flex flex-col overflow-hidden font-sans antialiased text-slate-800 bg-slate-50 select-none relative"
      dir="rtl"
    >
      {/* BACKGROUND GRAPHIC (Professional Polish Style) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60"></div>

      {/* HEADER / NAVIGATION BAR (Professional Polish Layout) */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">
              مساحة العمل الاحترافية
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Controls to re-align windows */}
          <button
            onClick={cascadeWindows}
            title="ترتيب النوافذ تلقائياً"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
          >
            <LayoutGrid size={13} />
            ترتيب النوافذ
          </button>
        </div>

        {/* Date, Time and Status panel */}
        <div className="flex items-center gap-6">
          {/* Calendar Display */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <CalendarIcon size={14} className="text-slate-400" />
            <span>{dateStr}</span>
          </div>

          {/* Real-time Clock */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200/60 rounded-lg text-slate-700 font-mono text-xs font-bold shadow-inner">
            <Clock size={13} className="text-blue-600" />
            <span>{time}</span>
          </div>

          {/* Audio Toggler */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                : "bg-red-50 border-red-100 text-red-500"
            }`}
            title={soundEnabled ? "كتم المؤثرات الصوتية" : "تفعيل المؤثرات الصوتية"}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </header>

      {/* MAIN DESKTOP AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR DOCK (For starting / reopening tools) */}
        <aside className="w-20 bg-white border-l border-slate-200 flex flex-col items-center py-6 gap-5 shrink-0 shadow-sm z-40">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            الأدوات
          </div>

          {/* Application icons inside dock */}
          <div className="flex flex-col gap-4 w-full px-2">
            {windows.map((win) => {
              const isActive = win.isOpen && !win.isMinimized;
              let iconColor = "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800";
              let activeBadge = "";

              if (isActive) {
                iconColor = "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-100";
                activeBadge = "bg-blue-500 ring-2 ring-white";
              } else if (win.isOpen && win.isMinimized) {
                iconColor = "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100";
                activeBadge = "bg-amber-500 ring-2 ring-white animate-pulse";
              }

              // Get icon component
              const renderDockIcon = () => {
                const size = 20;
                switch (win.icon) {
                  case "Bot":
                    return <Bot size={size} />;
                  case "CheckSquare":
                    return <CheckSquare size={size} />;
                  case "Notebook":
                    return <Notebook size={size} />;
                  case "Calculator":
                    return <Calculator size={size} />;
                  default:
                    return <Sparkles size={size} />;
                }
              };

              return (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isOpen && !win.isMinimized) {
                      minimizeWindow(win.id);
                    } else {
                      openWindow(win.id);
                    }
                  }}
                  className={`w-full py-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 relative group cursor-pointer ${iconColor}`}
                  title={win.title}
                >
                  {renderDockIcon()}
                  <span className="text-[10px] font-bold line-clamp-1 truncate px-1">
                    {win.id === "ai"
                      ? "المساعد"
                      : win.id === "tasks"
                      ? "المهام"
                      : win.id === "notes"
                      ? "المفكرة"
                      : "الحاسبة"}
                  </span>

                  {/* Dot status badge */}
                  {win.isOpen && (
                    <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${activeBadge}`} />
                  )}

                  {/* Tooltip */}
                  <div className="absolute left-full mr-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap shadow-xl z-50">
                    {win.title}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 w-full flex flex-col items-center text-center">
            <span className="text-[9px] text-slate-400 font-semibold mb-1">الذاكرة</span>
            <div className="w-1.5 h-16 bg-slate-100 rounded-full relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-[9px] text-slate-500 font-bold mt-1">38%</span>
          </div>
        </aside>

        {/* WORKSPACE AREA (Holds windows) */}
        <main className="flex-1 relative overflow-hidden p-6" id="desktop-window-container">
          {/* Welcome Dashboard Background */}
          {windows.every((w) => !w.isOpen) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40">
              <div className="max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Monitor size={32} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">مرحباً بك في لوحة تحكم العمل</h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  جميع النوافذ مغلقة حالياً. انقر على أيقونات الأدوات في القائمة الجانبية لتشغيل التطبيقات الذكية ومتابعة أعمالك.
                </p>
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    onClick={() => openWindow("ai")}
                    className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <Bot size={14} />
                    المساعد الذكي
                  </button>
                  <button
                    onClick={() => openWindow("tasks")}
                    className="flex items-center justify-center gap-2 py-2 bg-slate-150 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition border border-slate-250"
                  >
                    <CheckSquare size={14} />
                    لوحة المهام
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Desktop Windows */}
          {windows.map((win) => {
            if (!win.isOpen) return null;

            return (
              <DesktopWindow
                key={win.id}
                window={win}
                onFocus={focusWindow}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onMaximize={toggleMaximizeWindow}
                onMove={moveWindow}
                onResize={resizeWindow}
              >
                {win.id === "ai" && <AppAI />}
                {win.id === "tasks" && <AppTasks />}
                {win.id === "notes" && <AppNotes />}
                {win.id === "calc" && <AppCalc />}
              </DesktopWindow>
            );
          })}
        </main>
      </div>

      {/* FOOTER TASKBAR */}
      <footer className="h-11 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-2">
          {/* Quick status badge */}
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-slate-400 font-semibold">اتصال النظام آمن ومستقر</span>
        </div>

        {/* Taskbar active icons */}
        <div className="flex gap-1.5">
          {windows
            .filter((w) => w.isOpen)
            .map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  if (w.isMinimized) {
                    openWindow(w.id);
                  } else {
                    minimizeWindow(w.id);
                  }
                }}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1.5 border ${
                  w.isMinimized
                    ? "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200"
                    : "bg-blue-600/20 border-blue-500/40 text-blue-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${w.isMinimized ? "bg-amber-400" : "bg-blue-400"}`}></span>
                {w.title.split(" ")[0]}
              </button>
            ))}
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          © {new Date().getFullYear()} نظام النوافذ التفاعلي
        </div>
      </footer>
    </div>
  );
}
