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
  Palette,
  Folder,
  Search,
  FileText,
  Boxes,
  Receipt,
  TrendingUp,
  Bell,
  Trash,
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { WindowInstance } from "./types";
import DesktopWindow from "./components/DesktopWindow";
import AppAI from "./components/AppAI";
import AppTasks from "./components/AppTasks";
import AppNotes from "./components/AppNotes";
import AppCalc from "./components/AppCalc";
import AppSettings from "./components/AppSettings";
import AppFiles from "./components/AppFiles";
import AppInventory from "./components/AppInventory";
import AppInvoices from "./components/AppInvoices";
import AppReports from "./components/AppReports";

export default function App() {
  // Current date & time for taskbar
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  // Universal Spotlight Search State & Ref
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  const [wallpaper, setWallpaper] = useState(() => {
    return localStorage.getItem("workspace_wallpaper") || "bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100";
  });

  const handleSelectWallpaper = (val: string) => {
    setWallpaper(val);
    localStorage.setItem("workspace_wallpaper", val);
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("workspace_theme") === "dark";
  });

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("workspace_theme", next ? "dark" : "light");
      return next;
    });
  };

  // Window states
  const [windows, setWindows] = useState<WindowInstance[]>(() => {
    const defaultWindows: WindowInstance[] = [
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
      {
        id: "settings",
        title: "إعدادات المظهر والتحكم",
        icon: "Palette",
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        width: 420,
        height: 480,
        x: 150,
        y: 150,
      },
      {
        id: "files",
        title: "مدير الملفات والمستندات",
        icon: "Folder",
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 2,
        width: 620,
        height: 460,
        x: 200,
        y: 120,
      },
      {
        id: "inventory",
        title: "إدارة المخازن والمخزون الذكي",
        icon: "Boxes",
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        width: 630,
        height: 490,
        x: 250,
        y: 140,
      },
      {
        id: "invoices",
        title: "إدارة الفواتير والمبيعات",
        icon: "Receipt",
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        width: 650,
        height: 520,
        x: 220,
        y: 110,
      },
      {
        id: "reports",
        title: "التقارير والتحليلات المالية",
        icon: "TrendingUp",
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 1,
        width: 680,
        height: 540,
        x: 180,
        y: 100,
      },
    ];

    const saved = localStorage.getItem("workspace_windows");
    if (saved) {
      try {
        const parsed: WindowInstance[] = JSON.parse(saved);
        if (!parsed.some((w) => w.id === "inventory")) {
          parsed.push({
            id: "inventory",
            title: "إدارة المخازن والمخزون الذكي",
            icon: "Boxes",
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            zIndex: 1,
            width: 630,
            height: 490,
            x: 250,
            y: 140,
          });
        }
        if (!parsed.some((w) => w.id === "invoices")) {
          parsed.push({
            id: "invoices",
            title: "إدارة الفواتير والمبيعات",
            icon: "Receipt",
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            zIndex: 1,
            width: 650,
            height: 520,
            x: 220,
            y: 110,
          });
        }
        if (!parsed.some((w) => w.id === "reports")) {
          parsed.push({
            id: "reports",
            title: "التقارير والتحليلات المالية",
            icon: "TrendingUp",
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            zIndex: 1,
            width: 680,
            height: 540,
            x: 180,
            y: 100,
          });
        }
        return parsed;
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    return defaultWindows;
  });

  // Save windows state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("workspace_windows", JSON.stringify(windows));
  }, [windows]);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [activeProfile, setActiveProfile] = useState(() => {
    return localStorage.getItem("workspace_active_profile") || "default";
  });

  interface ToastItem {
    id: string;
    message: string;
    type: "success" | "warning" | "info" | "error";
    timestamp: string;
  }

  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<ToastItem[]>(() => {
    const saved = localStorage.getItem("workspace_notifications_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);

  const handleChangeProfile = (id: string) => {
    setActiveProfile(id);
    localStorage.setItem("workspace_active_profile", id);
    const nameMap: Record<string, string> = {
      default: "المدير العام",
      sales: "كاشير المبيعات",
      inventory_keeper: "أمين المستودع",
    };
    playSystemSound("window");
    
    // Dispatch system-toast event immediately
    window.dispatchEvent(
      new CustomEvent("system-toast", {
        detail: { 
          message: `تم التبديل بنجاح إلى ملف: ${nameMap[id] || id}. تم عزل البيانات بنجاح!`, 
          type: "success" 
        },
      })
    );
  };

  useEffect(() => {
    const handleSystemToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: "success" | "warning" | "info" | "error" }>;
      if (!customEvent.detail) return;
      const { message, type } = customEvent.detail;
      const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
      const timestamp = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
      const newToast: ToastItem = { id, message, type: type || "info", timestamp };

      setActiveToasts((prev) => [...prev, newToast]);
      setNotificationHistory((prev) => {
        const updated = [newToast, ...prev].slice(0, 100);
        localStorage.setItem("workspace_notifications_history", JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener("system-toast", handleSystemToast as EventListener);
    return () => window.removeEventListener("system-toast", handleSystemToast as EventListener);
  }, []);

  const [activeCurrencyCode, setActiveCurrencyCode] = useState(() => {
    return localStorage.getItem("workspace_currency") || "SAR";
  });

  const handleChangeCurrencyCode = (code: string) => {
    setActiveCurrencyCode(code);
    localStorage.setItem("workspace_currency", code);
  };

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

  // Universal Spotlight search results
  const searchResults = React.useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      desc: string;
      type: "app" | "note" | "task" | "file";
      icon: any;
      onClick: () => void;
    }> = [];

    // All available app tools
    const appsList = [
      { id: "ai", title: "المساعد الذكي (Gemini API)", desc: "اطرح الأسئلة واستعن بالذكاء الاصطناعي", icon: Bot, action: () => openWindow("ai") },
      { id: "tasks", title: "مدير المهام والإنتاجية", desc: "نظم مهامك اليومية وتابع إنتاجيتك", icon: CheckSquare, action: () => openWindow("tasks") },
      { id: "notes", title: "مفكرة النصوص الذكية", desc: "دون أفكارك وملاحظاتك ونصوصك بسرعة", icon: Notebook, action: () => openWindow("notes") },
      { id: "calc", title: "الحاسبة السريعة", desc: "أجرِ العمليات الحسابية والرياضية فوراً", icon: Calculator, action: () => openWindow("calc") },
      { id: "files", title: "مدير الملفات والمستندات", desc: "نظم ملفاتك محلياً واستورد الملاحظات والمهام", icon: Folder, action: () => openWindow("files") },
      { id: "inventory", title: "إدارة المخازن والمخزون الذكي", desc: "أضف منتجاتك، تتبع الكميات والأسعار وتنبيهات النفاد", icon: Boxes, action: () => openWindow("inventory") },
      { id: "invoices", title: "إدارة الفواتير والمبيعات", desc: "أنشئ فواتير جديدة، حدد العميل والمنتجات، واحسب الإجمالي", icon: Receipt, action: () => openWindow("invoices") },
      { id: "settings", title: "إعدادات المظهر والتحكم", desc: "تخصيص مظهر مساحة العمل والتحكم بالنظام", icon: Palette, action: () => openWindow("settings") },
    ];

    if (!query) {
      // If query is empty, suggest the default apps as quick starts!
      return appsList.map(app => ({
        id: app.id,
        title: app.title,
        desc: app.desc,
        type: "app" as const,
        icon: app.icon,
        onClick: () => {
          app.action();
          setGlobalSearch("");
          setIsSearchFocused(false);
        }
      }));
    }

    // 1. Match Apps
    appsList.forEach(app => {
      if (app.title.toLowerCase().includes(query) || app.desc.toLowerCase().includes(query)) {
        results.push({
          id: app.id,
          title: app.title,
          desc: app.desc,
          type: "app",
          icon: app.icon,
          onClick: () => {
            app.action();
            setGlobalSearch("");
            setIsSearchFocused(false);
          }
        });
      }
    });

    // 2. Match Notes (read from localStorage)
    try {
      const savedNotesRaw = localStorage.getItem("workspace_notes");
      if (savedNotesRaw) {
        const savedNotes = JSON.parse(savedNotesRaw);
        savedNotes.forEach((note: any) => {
          if (
            (note.title && note.title.toLowerCase().includes(query)) ||
            (note.content && note.content.toLowerCase().includes(query))
          ) {
            results.push({
              id: `note_${note.id}`,
              title: note.title || "ملاحظة غير معنونة",
              desc: note.content ? (note.content.substring(0, 60) + "...") : "ملاحظة فارغة",
              type: "note",
              icon: Notebook,
              onClick: () => {
                openWindow("notes");
                // Emit custom event
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("open-item", {
                    detail: { app: "notes", id: note.id }
                  }));
                }, 100);
                setGlobalSearch("");
                setIsSearchFocused(false);
              }
            });
          }
        });
      }
    } catch (e) {}

    // 3. Match Tasks
    try {
      const savedTasksRaw = localStorage.getItem("workspace_tasks");
      if (savedTasksRaw) {
        const savedTasks = JSON.parse(savedTasksRaw);
        savedTasks.forEach((task: any) => {
          if (task.text && task.text.toLowerCase().includes(query)) {
            results.push({
              id: `task_${task.id}`,
              title: task.text,
              desc: `مهمة [فئة: ${task.category === "work" ? "عمل" : task.category === "personal" ? "شخصي" : task.category === "ideas" ? "أفكار" : "عاجل"}] - ${task.completed ? "مكتملة" : "قيد التنفيذ"}`,
              type: "task",
              icon: CheckSquare,
              onClick: () => {
                openWindow("tasks");
                setGlobalSearch("");
                setIsSearchFocused(false);
              }
            });
          }
        });
      }
    } catch (e) {}

    // 4. Match Files
    try {
      const savedFilesRaw = localStorage.getItem("workspace_files");
      if (savedFilesRaw) {
        const savedFiles = JSON.parse(savedFilesRaw);
        savedFiles.forEach((file: any) => {
          if (
            (file.name && file.name.toLowerCase().includes(query)) ||
            (file.content && file.content.toLowerCase().includes(query))
          ) {
            results.push({
              id: `file_${file.id}`,
              title: file.name,
              desc: file.type === "folder" ? "مجلد ملفات" : "ملف نصي افتراضي",
              type: "file",
              icon: file.type === "folder" ? Folder : FileText,
              onClick: () => {
                openWindow("files");
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("open-item", {
                    detail: { app: "files", id: file.id }
                  }));
                }, 100);
                setGlobalSearch("");
                setIsSearchFocused(false);
              }
            });
          }
        });
      }
    } catch (e) {}

    return results;
  }, [globalSearch, windows]);

  // Keyboard shortcuts event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.ctrlKey && e.altKey) {
        const key = e.key.toLowerCase();
        
        // Ctrl+Alt+A (ش): المساعد الذكي
        if (key === "a" || key === "ش" || e.code === "KeyA") {
          e.preventDefault();
          openWindow("ai");
        }
        // Ctrl+Alt+T (ف): مدير المهام
        else if (key === "t" || key === "ف" || e.code === "KeyT") {
          e.preventDefault();
          openWindow("tasks");
        }
        // Ctrl+Alt+N (ى): مفكرة النصوص
        else if (key === "n" || key === "ى" || e.code === "KeyN") {
          e.preventDefault();
          openWindow("notes");
        }
        // Ctrl+Alt+C (ؤ): الحاسبة
        else if (key === "c" || key === "ؤ" || e.code === "KeyC") {
          e.preventDefault();
          openWindow("calc");
        }
        // Ctrl+Alt+F (ب): مدير الملفات
        else if (key === "f" || key === "ب" || e.code === "KeyF") {
          e.preventDefault();
          openWindow("files");
        }
        // Ctrl+Alt+R (ق): ترتيب النوافذ
        else if (key === "r" || key === "ق" || e.code === "KeyR") {
          e.preventDefault();
          cascadeWindows();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [soundEnabled]);

  return (
    <div
      id="desktop-root"
      className={`h-screen w-full flex flex-col overflow-hidden font-sans antialiased text-slate-800 select-none relative ${isDarkMode ? "dark" : ""} ${
        wallpaper.startsWith("url(") ? "" : wallpaper
      }`}
      style={wallpaper.startsWith("url(") ? { backgroundImage: wallpaper, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      dir="rtl"
    >
      {/* BACKGROUND GRAPHIC (Professional Polish Style) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60 dark:opacity-30"></div>

      {/* HEADER / NAVIGATION BAR (Professional Polish Layout) */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between shrink-0 shadow-sm z-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-none">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-slate-100">
              مساحة العمل الاحترافية
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          {/* Controls to re-align windows */}
          <button
            onClick={cascadeWindows}
            title="ترتيب النوافذ تلقائياً"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-transparent dark:border-blue-800/50 rounded-lg transition"
          >
            <LayoutGrid size={13} />
            ترتيب النوافذ
          </button>
        </div>

        {/* Universal Spotlight Search Bar */}
        <div className="relative flex-1 max-w-xs md:max-w-md mx-4 z-50">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-2.5 text-slate-400 animate-pulse" />
            <input
              ref={searchInputRef}
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="البحث السريع عن أداة، ملاحظة، أو ملف... (Ctrl+K)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl pr-9 pl-16 py-1.5 text-xs focus:outline-none text-slate-800 dark:text-slate-200 transition-all duration-200 shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
            />
            <div className="absolute left-3 top-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded text-[9px] text-slate-500 dark:text-slate-400 font-mono pointer-events-none select-none">
              <span>Ctrl</span>
              <span>+</span>
              <span>K</span>
            </div>
          </div>

          {/* Search Results Dropdown overlay */}
          {isSearchFocused && (
            <>
              {/* Invisible backdrop to close the dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => {
                  setIsSearchFocused(false);
                  setGlobalSearch("");
                }}
              />
              
              <div className="absolute right-0 left-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50 p-2 space-y-1 scrollbar-thin">
                <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1 flex justify-between">
                  <span>{globalSearch ? "نتائج البحث المطابقة" : "اقتراحات مساحة العمل والأدوات"}</span>
                  <span>{searchResults.length} عنصر</span>
                </div>
                
                {searchResults.length === 0 ? (
                  <div className="text-center py-5 text-xs text-slate-400 dark:text-slate-500">
                    لا توجد نتائج مطابقة لـ "{globalSearch}"
                  </div>
                ) : (
                  searchResults.map((res) => {
                    const IconComponent = res.icon;
                    return (
                      <button
                        key={res.id}
                        onClick={res.onClick}
                        className="w-full flex items-center gap-3 p-2 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl text-right transition group cursor-pointer"
                      >
                        <div className={`p-2 rounded-xl shrink-0 transition ${
                          res.type === "app" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100/80 dark:group-hover:bg-blue-900/60" :
                          res.type === "note" ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100/80 dark:group-hover:bg-amber-900/60" :
                          res.type === "task" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100/80 dark:group-hover:bg-indigo-900/60" :
                          "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100/80 dark:group-hover:bg-emerald-900/60"
                        }`}>
                          <IconComponent size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {res.title}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {res.desc}
                          </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold border ${
                          res.type === "app" ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400" :
                          res.type === "note" ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400" :
                          res.type === "task" ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400" :
                          "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {res.type === "app" ? "أداة" :
                           res.type === "note" ? "ملاحظة" :
                           res.type === "task" ? "مهمة" : "ملف"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Date, Time and Status panel */}
        <div className="flex items-center gap-6">
          {/* Calendar Display */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CalendarIcon size={14} className="text-slate-400" />
            <span>{dateStr}</span>
          </div>

          {/* Real-time Clock */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-xs font-bold shadow-inner">
            <Clock size={13} className="text-blue-600" />
            <span>{time}</span>
          </div>

          {/* Audio Toggler */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400"
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
        <aside className="w-20 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-5 shrink-0 shadow-sm z-40 transition-colors">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-2">
            الأدوات
          </div>

          {/* Application icons inside dock */}
          <div className="flex flex-col gap-4 w-full px-2">
            {windows.map((win) => {
              const isActive = win.isOpen && !win.isMinimized;
              let iconColor = "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200";
              let activeBadge = "";

              if (isActive) {
                iconColor = "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-100 dark:shadow-none";
                activeBadge = "bg-blue-500 ring-2 ring-white dark:ring-slate-900";
              } else if (win.isOpen && win.isMinimized) {
                iconColor = "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50";
                activeBadge = "bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse";
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
                  case "Palette":
                    return <Palette size={size} />;
                  case "Folder":
                    return <Folder size={size} />;
                  case "Boxes":
                    return <Boxes size={size} />;
                  case "Receipt":
                    return <Receipt size={size} />;
                  case "TrendingUp":
                    return <TrendingUp size={size} />;
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
                      : win.id === "calc"
                      ? "الحاسبة"
                      : win.id === "settings"
                      ? "المظهر"
                      : win.id === "inventory"
                      ? "المخزون"
                      : win.id === "invoices"
                      ? "الفواتير"
                      : win.id === "reports"
                      ? "التقارير"
                      : "الملفات"}
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

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 w-full flex flex-col items-center text-center">
            <span className="text-[9px] text-slate-400 font-semibold mb-1">الذاكرة</span>
            <div className="w-1.5 h-16 bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1">38%</span>
          </div>
        </aside>

        {/* WORKSPACE AREA (Holds windows) */}
        <main className="flex-1 relative overflow-hidden p-6" id="desktop-window-container">
          {/* Welcome Dashboard Background */}
          {windows.every((w) => !w.isOpen) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40 dark:bg-slate-950/40">
              <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 rounded-2xl shadow-xl dark:shadow-none flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <Monitor size={32} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">مرحباً بك في لوحة تحكم العمل</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  جميع النوافذ مغلقة حالياً. انقر على أيقونات الأدوات في القائمة الجانبية لتشغيل التطبيقات الذكية ومتابعة أعمالك.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={() => openWindow("ai")}
                    className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Bot size={13} />
                    المساعد الذكي
                  </button>
                  <button
                    onClick={() => openWindow("tasks")}
                    className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl text-xs font-bold transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <CheckSquare size={13} />
                    لوحة المهام
                  </button>
                  <button
                    onClick={() => openWindow("inventory")}
                    className="flex items-center justify-center gap-1.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Boxes size={13} />
                    إدارة المخزون
                  </button>
                  <button
                    onClick={() => openWindow("invoices")}
                    className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <Receipt size={13} />
                    إدارة الفواتير
                  </button>
                  <button
                    onClick={() => openWindow("reports")}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <TrendingUp size={13} />
                    لوحة التقارير والتحليلات المالية
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
                {win.id === "settings" && (
                  <AppSettings
                    currentWallpaper={wallpaper}
                    onSelectWallpaper={handleSelectWallpaper}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled(!soundEnabled)}
                    isDarkMode={isDarkMode}
                    onToggleTheme={handleToggleTheme}
                    activeCurrencyCode={activeCurrencyCode}
                    onChangeCurrencyCode={handleChangeCurrencyCode}
                    activeProfile={activeProfile}
                    onChangeProfile={handleChangeProfile}
                  />
                )}
                {win.id === "files" && <AppFiles />}
                {win.id === "inventory" && <AppInventory activeCurrencyCode={activeCurrencyCode} activeProfile={activeProfile} />}
                {win.id === "invoices" && <AppInvoices activeCurrencyCode={activeCurrencyCode} activeProfile={activeProfile} />}
                {win.id === "reports" && <AppReports activeCurrencyCode={activeCurrencyCode} activeProfile={activeProfile} />}
              </DesktopWindow>
            );
          })}
        </main>
      </div>

      {/* ACTIVE TOAST NOTIFICATIONS (Upper Corner) */}
      <div className="fixed top-18 right-4 z-[9999] flex flex-col gap-2.5 w-80 pointer-events-none">
        {activeToasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";
          const isError = toast.type === "error";

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 pointer-events-auto transition-all duration-300 bg-slate-950/95 backdrop-blur-md animate-in slide-in-from-right-8 ${
                isSuccess
                  ? "border-emerald-500/40 text-emerald-100 shadow-emerald-950/20"
                  : isWarning
                  ? "border-amber-500/40 text-amber-100 shadow-amber-950/20"
                  : "border-blue-500/40 text-blue-100 shadow-blue-950/20"
              }`}
            >
              <div
                className={`p-1 rounded-lg shrink-0 mt-0.5 ${
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-400"
                    : isWarning
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {isSuccess ? (
                  <Check size={14} />
                ) : isWarning ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Info size={14} />
                )}
              </div>
              <div className="flex-1 text-xs font-bold leading-normal">
                {toast.message}
              </div>
              <button
                onClick={() => setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-500 hover:text-slate-300 transition shrink-0 mt-0.5"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* NOTIFICATIONS HISTORY DRAWER (Popup above taskbar) */}
      {showNotificationsDrawer && (
        <div className="fixed bottom-13 left-4 w-80 max-h-96 bg-slate-950/95 backdrop-blur-lg border border-slate-800/80 rounded-2xl shadow-2xl z-[9998] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-blue-400">
              <Bell size={13} className="animate-bounce" />
              <span className="text-[11px] font-extrabold text-slate-200">سجل الإشعارات والتنبيهات</span>
            </div>
            {notificationHistory.length > 0 && (
              <button
                onClick={() => {
                  setNotificationHistory([]);
                  localStorage.removeItem("workspace_notifications_history");
                }}
                className="text-[9px] font-bold text-red-400 hover:text-red-350 bg-red-950/30 border border-red-900/40 px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer"
              >
                <Trash size={10} />
                مسح السجل
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1.5 min-h-[160px]">
            {notificationHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 space-y-2">
                <Bell size={24} className="opacity-30" />
                <span className="text-[10px] font-bold">السجل فارغ تماماً</span>
                <span className="text-[9px] text-slate-600">لا توجد إشعارات سابقة حتى الآن.</span>
              </div>
            ) : (
              notificationHistory.map((item) => {
                const isSuccess = item.type === "success";
                const isWarning = item.type === "warning";
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/45 hover:bg-slate-900/30 transition flex items-start gap-2"
                  >
                    <div
                      className={`p-1 rounded mt-0.5 shrink-0 ${
                        isSuccess
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {isSuccess ? (
                        <Check size={11} />
                      ) : isWarning ? (
                        <AlertTriangle size={11} />
                      ) : (
                        <Info size={11} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-slate-250 leading-tight">
                        {item.message}
                      </p>
                      <span className="text-[8px] text-slate-500 font-mono mt-1 block">
                        {item.timestamp}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const updated = notificationHistory.filter((n) => n.id !== item.id);
                        setNotificationHistory(updated);
                        localStorage.setItem("workspace_notifications_history", JSON.stringify(updated));
                      }}
                      className="text-slate-600 hover:text-slate-400 transition"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FOOTER TASKBAR */}
      <footer className="h-11 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          {/* Quick status badge */}
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] text-slate-400 font-semibold">اتصال النظام آمن ومستقر</span>

          {/* Toggle Bell/Notification Drawer Button */}
          <button
            onClick={() => setShowNotificationsDrawer(!showNotificationsDrawer)}
            className={`p-1.5 rounded-lg border transition relative cursor-pointer flex items-center justify-center ${
              showNotificationsDrawer
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="سجل التنبيهات والاشعارات السابقة"
          >
            <Bell size={13} className={activeToasts.length > 0 ? "animate-swing" : ""} />
            {notificationHistory.length > 0 && (
              <span className="absolute -top-1 -left-1 px-1 py-0.25 bg-red-500 text-white text-[7px] font-extrabold rounded-full animate-pulse">
                {notificationHistory.length}
              </span>
            )}
          </button>
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
