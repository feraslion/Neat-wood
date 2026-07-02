import React, { useState, useEffect } from "react";
import { Image, Palette, Check, Sparkles, AlertCircle, Link, Volume2, Monitor, Sun, Moon, Coins, User, Database, DownloadCloud, UploadCloud, ShieldAlert, Lock, Clock, Languages, Keyboard, RotateCcw } from "lucide-react";
import { CURRENCIES, KeyboardShortcut } from "../types";
import { triggerToast } from "../utils/toast";
import { getTranslation, LanguageCode } from "../utils/i18n";

interface AppSettingsProps {
  currentWallpaper: string;
  onSelectWallpaper: (val: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  autoTheme: boolean;
  onToggleAutoTheme: () => void;
  activeCurrencyCode: string;
  onChangeCurrencyCode: (code: string) => void;
  activeProfile: string;
  onChangeProfile: (id: string) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onLockScreen: () => void;
  shortcuts: KeyboardShortcut[];
  onUpdateShortcuts: (newShortcuts: KeyboardShortcut[]) => void;
}

export const WALLPAPERS = [
  // Gradients
  {
    id: "prof-cool",
    name: "رصاصي احترافي",
    type: "gradient",
    value: "bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100",
    preview: "from-slate-100 to-blue-200",
  },
  {
    id: "ocean-breeze",
    name: "نسيم المحيط",
    type: "gradient",
    value: "bg-gradient-to-br from-blue-50/80 via-indigo-50/30 to-cyan-50/50",
    preview: "from-blue-200 to-cyan-100",
  },
  {
    id: "cosmic-dark",
    name: "الكوني المظلم",
    type: "gradient",
    value: "bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950",
    preview: "from-slate-800 to-slate-950",
    darkText: true,
  },
  {
    id: "emerald-mint",
    name: "نعناع الزمرد",
    type: "gradient",
    value: "bg-gradient-to-br from-emerald-50/60 via-teal-50/20 to-slate-100",
    preview: "from-emerald-200 to-teal-100",
  },
  {
    id: "sunset-glow",
    name: "توهج الغروب",
    type: "gradient",
    value: "bg-gradient-to-br from-rose-50/60 via-amber-50/30 to-indigo-50/30",
    preview: "from-rose-200 to-amber-150",
  },
  // Images
  {
    id: "img-mountain",
    name: "الجبال الهادئة",
    type: "image",
    value: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')",
    preview: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=100&q=50",
  },
  {
    id: "img-ocean",
    name: "أعماق البحر",
    type: "image",
    value: "url('https://images.unsplash.com/photo-1473116763269-255ea7604ad6?auto=format&fit=crop&w=1200&q=80')",
    preview: "https://images.unsplash.com/photo-1473116763269-255ea7604ad6?auto=format&fit=crop&w=100&q=50",
  },
  {
    id: "img-forest",
    name: "ضباب الغابة",
    type: "image",
    value: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80')",
    preview: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=100&q=50",
  },
  {
    id: "img-city",
    name: "أضواء المدينة",
    type: "image",
    value: "url('https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=1200&q=80')",
    preview: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=100&q=50",
  },
];

// Simple encryption / decryption utilities (XOR cipher)
function encryptBackupData(text: string, key: string = "workspace_backup_secure_key"): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(encodeURIComponent(result));
}

function decryptBackupData(encodedText: string, key: string = "workspace_backup_secure_key"): string {
  try {
    const text = decodeURIComponent(atob(encodedText));
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    throw new Error("فشل فك التشفير. قد يكون الملف تالفاً أو غير صالح.");
  }
}

export default function AppSettings({
  currentWallpaper,
  onSelectWallpaper,
  soundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleTheme,
  autoTheme,
  onToggleAutoTheme,
  activeCurrencyCode,
  onChangeCurrencyCode,
  activeProfile,
  onChangeProfile,
  language,
  onChangeLanguage,
  onLockScreen,
  shortcuts,
  onUpdateShortcuts,
}: AppSettingsProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"gradients" | "images" | "custom">("gradients");
  const [recordingShortcutId, setRecordingShortcutId] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingShortcutId) return;

    const handleRecordKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isModifierOnly = ["control", "alt", "shift", "meta"].includes(e.key.toLowerCase());
      if (isModifierOnly) {
        return;
      }

      const rawKey = e.key.toUpperCase();
      if (!/^[A-Z0-9]$/.test(rawKey)) {
        triggerToast(
          language === "ar"
            ? "يرجى الضغط على مفتاح حرف (A-Z) أو رقم (0-9) مع مفاتيح الاختصار."
            : "Please press a letter key (A-Z) or a number (0-9) as your primary shortcut key.",
          "warning"
        );
        return;
      }

      const updated = shortcuts.map((s) => {
        if (s.id === recordingShortcutId) {
          return {
            ...s,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            key: rawKey,
          };
        }
        return s;
      });

      onUpdateShortcuts(updated);
      setRecordingShortcutId(null);

      const updatedShortcut = shortcuts.find((s) => s.id === recordingShortcutId);
      const displayName = language === "ar" ? updatedShortcut?.nameAr : updatedShortcut?.nameEn;
      const keyCombo = [
        e.ctrlKey ? "Ctrl" : "",
        e.altKey ? "Alt" : "",
        e.shiftKey ? "Shift" : "",
        rawKey,
      ].filter(Boolean).join(" + ");

      triggerToast(
        language === "ar"
          ? `تم تحديث اختصار "${displayName}" إلى: ${keyCombo}`
          : `Shortcut for "${displayName}" successfully set to: ${keyCombo}`,
        "success"
      );
    };

    window.addEventListener("keydown", handleRecordKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleRecordKeyDown, true);
    };
  }, [recordingShortcutId, shortcuts, language, onUpdateShortcuts]);

  const handleUpdateShortcutField = (id: string, field: keyof KeyboardShortcut, value: any) => {
    const updated = shortcuts.map((s) => {
      if (s.id === id) {
        let finalVal = value;
        if (field === "key") {
          finalVal = String(value).toUpperCase().slice(-1);
          if (!/[A-Z0-9]/.test(finalVal)) {
            triggerToast(language === "ar" ? "يرجى اختيار حرف أو رقم صالح (A-Z أو 0-9)" : "Please choose a valid letter or number (A-Z or 0-9)", "warning");
            return s;
          }
        }
        return { ...s, [field]: finalVal };
      }
      return s;
    });
    onUpdateShortcuts(updated);
  };

  const handleResetShortcuts = () => {
    const defaultShortcuts = [
      { id: "open_ai", nameAr: "فتح المساعد الذكي", nameEn: "Open AI Assistant", ctrlKey: true, altKey: true, shiftKey: false, key: "A" },
      { id: "open_tasks", nameAr: "فتح مدير المهام", nameEn: "Open Tasks Manager", ctrlKey: true, altKey: true, shiftKey: false, key: "T" },
      { id: "open_notes", nameAr: "فتح المفكرة", nameEn: "Open Notes", ctrlKey: true, altKey: true, shiftKey: false, key: "N" },
      { id: "open_calc", nameAr: "فتح الحاسبة", nameEn: "Open Calculator", ctrlKey: true, altKey: true, shiftKey: false, key: "C" },
      { id: "open_files", nameAr: "فتح مدير الملفات", nameEn: "Open Files Manager", ctrlKey: true, altKey: true, shiftKey: false, key: "F" },
      { id: "cascade", nameAr: "ترتيب النوافذ", nameEn: "Cascade Windows", ctrlKey: true, altKey: true, shiftKey: false, key: "R" },
    ];
    onUpdateShortcuts(defaultShortcuts);
    triggerToast(language === "ar" ? "تم استعادة اختصارات لوحة المفاتيح الافتراضية." : "Default keyboard shortcuts restored.", "success");
  };

  const [backupInterval, setBackupInterval] = useState(() => {
    return localStorage.getItem("workspace_backup_interval") || "manual";
  });

  const [backupInvoices, setBackupInvoices] = useState(true);
  const [backupInventory, setBackupInventory] = useState(true);
  const [backupNotes, setBackupNotes] = useState(true);

  const handleIntervalChange = (val: string) => {
    setBackupInterval(val);
    localStorage.setItem("workspace_backup_interval", val);
    const mapped = val === "manual"
      ? getTranslation("settings_manual", language)
      : val === "daily"
      ? getTranslation("settings_daily", language)
      : val === "weekly"
      ? getTranslation("settings_weekly", language)
      : getTranslation("settings_monthly", language);
    triggerToast(`${getTranslation("settings_backup_alert", language)} ${mapped}`, "info");
  };

  const handleExportBackup = () => {
    // If nothing selected
    if (!backupInvoices && !backupInventory && !backupNotes) {
      triggerToast(
        language === "ar" ? "يرجى تحديد نوع واحد على الأقل للنسخ الاحتياطي!" : "Please select at least one data type for backup!",
        "warning"
      );
      return;
    }

    const backupObject: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("workspace_") || key.includes("_workspace_"))) {
        // Exclude unselected data types
        if (key.includes("invoice") && !backupInvoices) continue;
        if ((key.includes("inventory") || key.includes("product") || key.includes("stock")) && !backupInventory) continue;
        if (key.includes("note") && !backupNotes) continue;

        backupObject[key] = localStorage.getItem(key);
      }
    }

    const jsonStr = JSON.stringify(backupObject, null, 2);
    const encrypted = encryptBackupData(jsonStr);
    
    // Create download link
    const blob = new Blob([encrypted], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workspace_backup_encrypted_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save backup timestamp
    localStorage.setItem("workspace_last_backup_time", new Date().toISOString());

    triggerToast(language === "ar" ? "تم تصدير وتحميل قاعدة البيانات المشفرة بنجاح!" : "Database exported and downloaded successfully!", "success");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const encryptedContent = event.target?.result as string;
        const decryptedContent = decryptBackupData(encryptedContent.trim());
        const backupObject = JSON.parse(decryptedContent);

        // Validate database structure
        if (typeof backupObject !== "object" || backupObject === null) {
          throw new Error("قالب ملف الاستعادة غير صالح.");
        }

        // Restore keys to localStorage
        Object.entries(backupObject).forEach(([key, val]) => {
          if (typeof val === "string") {
            localStorage.setItem(key, val);
          }
        });

        triggerToast(language === "ar" ? "تم استيراد واستعادة قاعدة البيانات بالكامل بنجاح! جاري تحديث مساحة العمل..." : "Database fully imported and restored! Refreshing workspace...", "success");
        
        // Force reload page to apply all changes cleanly after a slight delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err: any) {
        alert(err.message || (language === "ar" ? "فشل استيراد الملف. يرجى التأكد من اختيار ملف نسخ احتياطي مشفر وصحيح." : "Import failed. Please ensure a valid encrypted backup file was selected."));
      }
    };
    reader.readAsText(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    
    // Check if it's already wrapped in url()
    let formatted = customUrl.trim();
    if (!formatted.startsWith("url(")) {
      formatted = `url('${formatted}')`;
    }
    onSelectWallpaper(formatted);
  };

  const isRtl = language === "ar";

  return (
    <div 
      id="app-settings-container" 
      className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 overflow-y-auto scrollbar-thin space-y-4" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Palette size={16} className="text-blue-400" />
        <h3 className="text-xs font-bold text-slate-200">{getTranslation("settings_title", language)}</h3>
      </div>

      {/* Language Selection Section */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-600/10 rounded-lg text-violet-400">
            <Languages size={14} />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-200">{getTranslation("settings_lang", language)}</h4>
            <p className="text-[10px] text-slate-500">{getTranslation("settings_lang_desc", language)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onChangeLanguage("ar")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              language === "ar"
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
            }`}
          >
            العربية
          </button>
          <button
            onClick={() => onChangeLanguage("en")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              language === "en"
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-800/60 pb-2">
        <button
          onClick={() => setActiveTab("gradients")}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${
            activeTab === "gradients"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {getTranslation("settings_gradients", language)}
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${
            activeTab === "images"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {getTranslation("settings_nature", language)}
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${
            activeTab === "custom"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {getTranslation("settings_custom_link", language)}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "gradients" && (
          <div className="grid grid-cols-2 gap-2.5">
            {WALLPAPERS.filter((w) => w.type === "gradient").map((wp) => {
              const isSelected = currentWallpaper === wp.value;
              const wpName = language === "ar" ? wp.name : (wp.id === "prof-cool" ? "Professional Slate" : wp.id === "ocean-breeze" ? "Ocean Breeze" : wp.id === "cosmic-dark" ? "Cosmic Dark" : wp.id === "emerald-mint" ? "Emerald Mint" : "Sunset Glow");
              return (
                <button
                  key={wp.id}
                  onClick={() => onSelectWallpaper(wp.value)}
                  className={`relative p-3 rounded-xl border text-right transition group h-20 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                  }`}
                >
                  <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${wp.preview} group-hover:opacity-30 transition`} />
                  
                  <span className="text-xs font-bold text-slate-200 z-10">{wpName}</span>
                  <div className="flex justify-between items-center w-full z-10">
                    <span className="text-[9px] text-slate-500">{language === "ar" ? "مظهر متدرج" : "Gradient"}</span>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-blue-600 text-white shadow">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "images" && (
          <div className="grid grid-cols-2 gap-2.5">
            {WALLPAPERS.filter((w) => w.type === "image").map((wp) => {
              const isSelected = currentWallpaper === wp.value;
              const wpName = language === "ar" ? wp.name : (wp.id === "img-mountain" ? "Peaceful Mountains" : wp.id === "img-ocean" ? "Deep Ocean" : wp.id === "img-forest" ? "Forest Fog" : "City Lights");
              return (
                <button
                  key={wp.id}
                  onClick={() => onSelectWallpaper(wp.value)}
                  className={`relative p-3 rounded-xl border text-right transition group h-20 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.6)), url('${wp.preview}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                >
                  <span className="text-xs font-bold text-white z-10 shadow-sm">{wpName}</span>
                  <div className="flex justify-between items-center w-full z-10">
                    <span className="text-[9px] text-slate-300">{language === "ar" ? "صورة خلفية" : "Wallpaper Image"}</span>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-blue-600 text-white shadow">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "custom" && (
          <form onSubmit={handleApplyCustomUrl} className="space-y-3 bg-slate-950/40 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Link size={12} className="text-blue-400" />
              <span>{getTranslation("settings_enter_url", language)}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/wallpaper.jpg"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-250 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap"
              >
                {getTranslation("settings_apply", language)}
              </button>
            </div>
            {currentWallpaper.startsWith("url(") && (
              <div className="text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-md flex items-center gap-1.5">
                <Sparkles size={11} />
                <span>{getTranslation("settings_wallpaper_success", language)}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Dark/Light Mode Theme Switcher */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600/10 rounded-lg text-indigo-400">
            {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-200">{getTranslation("settings_theme_mode", language)}</h4>
            <p className="text-[10px] text-slate-500">{getTranslation("settings_theme_desc", language)}</p>
          </div>
        </div>
        <button
          disabled={autoTheme}
          onClick={onToggleTheme}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            autoTheme ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500" :
            isDarkMode
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-200 hover:bg-slate-300 text-slate-800"
          }`}
        >
          {isDarkMode ? (
            <>
              <span>{getTranslation("settings_dark", language)}</span>
              <Moon size={11} className="text-indigo-200" />
            </>
          ) : (
            <>
              <span>{getTranslation("settings_light", language)}</span>
              <Sun size={11} className="text-amber-600" />
            </>
          )}
        </button>
      </div>

      {/* Auto Sunset/Sunrise Night Mode Switcher */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-600/10 rounded-lg text-violet-400">
            <Clock size={14} />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-200">
              {language === "ar" ? "الوضع الليلي التلقائي" : "Auto Night Mode"}
            </h4>
            <p className="text-[10px] text-slate-500">
              {language === "ar"
                ? "تفعيل الوضع الداكن تلقائياً بناءً على الغروب (6 مساءً) والشروق (6 صباحاً)"
                : "Toggle dark mode automatically based on sunset (6 PM) and sunrise (6 AM)"}
            </p>
          </div>
        </div>
        <button
          onClick={onToggleAutoTheme}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            autoTheme
              ? "bg-violet-600 text-white hover:bg-violet-700"
              : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
          }`}
        >
          {autoTheme
            ? (language === "ar" ? "مفعل تلقائياً" : "Auto Enabled")
            : (language === "ar" ? "غير مفعل" : "Disabled")}
        </button>
      </div>

      {/* Manual Lock Screen System */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-600/10 rounded-lg text-red-400">
            <Lock size={14} />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-200">{getTranslation("settings_lock_screen", language)}</h4>
            <p className="text-[10px] text-slate-500">{getTranslation("settings_lock_screen_desc", language)}</p>
          </div>
        </div>
        <button
          onClick={onLockScreen}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
        >
          <span>{getTranslation("lock", language)}</span>
          <Lock size={11} />
        </button>
      </div>

      {/* Currency Selection System */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600/10 rounded-lg text-emerald-400">
            <Coins size={14} />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-200">{getTranslation("settings_currency", language)}</h4>
            <p className="text-[10px] text-slate-500">{getTranslation("settings_currency_desc", language)}</p>
          </div>
        </div>
        <div className="relative min-w-[140px]">
          <select
            value={activeCurrencyCode}
            onChange={(e) => onChangeCurrencyCode(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer font-bold"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {language === "ar" ? c.name : (c.code === "SAR" ? "Saudi Riyal" : c.code === "USD" ? "US Dollar" : c.code === "EUR" ? "Euro" : "Egyptian Pound")} ({c.symbol})
              </option>
            ))}
          </select>
          <div className="absolute left-2.5 top-3.5 w-1.5 h-1.5 border-r border-b border-slate-400 transform rotate-45 pointer-events-none" />
        </div>
      </div>

      {/* Audio controls */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600/10 rounded-lg text-blue-400">
            <Volume2 size={14} />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-slate-200">{getTranslation("settings_sounds", language)}</h4>
            <p className="text-[10px] text-slate-500">{getTranslation("settings_sounds_desc", language)}</p>
          </div>
        </div>
        <button
          onClick={onToggleSound}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            soundEnabled
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-800 text-slate-400 hover:bg-slate-750"
          }`}
        >
          {soundEnabled ? getTranslation("settings_enabled", language) : getTranslation("settings_disabled", language)}
        </button>
      </div>

      {/* Keyboard Shortcuts Customization Section */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/10 rounded-lg text-indigo-400">
              <Keyboard size={15} />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-bold text-slate-200">
                {language === "ar" ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
              </h4>
              <p className="text-[10px] text-slate-500">
                {language === "ar" ? "تخصيص المفاتيح السريعة لتشغيل التطبيقات" : "Customize quick keys to launch workspace apps"}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetShortcuts}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition border border-slate-700/60 cursor-pointer"
            title={language === "ar" ? "استعادة الافتراضي" : "Restore Defaults"}
          >
            <RotateCcw size={11} />
            <span>{language === "ar" ? "الافتراضي" : "Default"}</span>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut) => {
            const displayName = language === "ar" ? shortcut.nameAr : shortcut.nameEn;
            const isRecording = recordingShortcutId === shortcut.id;
            
            // Build the current visual combo string
            const currentCombo = [
              shortcut.ctrlKey ? "Ctrl" : "",
              shortcut.altKey ? "Alt" : "",
              shortcut.shiftKey ? "Shift" : "",
              shortcut.key
            ].filter(Boolean).join(" + ");

            return (
              <div 
                key={shortcut.id} 
                className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200 border ${
                  isRecording 
                    ? "bg-amber-950/30 border-amber-500/80 shadow-md shadow-amber-950/30" 
                    : "bg-slate-950/40 border-slate-800/60 hover:border-slate-700/50"
                }`}
              >
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-xs font-bold text-slate-200">{displayName}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-400">
                      {language === "ar" ? "الاختصار الحالي:" : "Current:"}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isRecording 
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse" 
                        : "bg-indigo-950/50 text-indigo-300 border border-indigo-900/40"
                    }`}>
                      {isRecording 
                        ? (language === "ar" ? "اضغط على المفاتيح معاً..." : "Press keys together...") 
                        : (currentCombo || (language === "ar" ? "بدون اختصار" : "No shortcut"))
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Dynamic Recording Button */}
                  <button
                    onClick={() => {
                      if (isRecording) {
                        setRecordingShortcutId(null);
                      } else {
                        setRecordingShortcutId(shortcut.id);
                        triggerToast(
                          language === "ar" 
                            ? "اضغط على مجموعة المفاتيح الجديدة الآن (مثال: Ctrl + Alt + S)" 
                            : "Press your new key combination now (e.g. Ctrl + Alt + S)", 
                          "info"
                        );
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
                      isRecording
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold hover:bg-amber-450"
                        : "bg-slate-900/80 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border-slate-800 hover:border-slate-750"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? "bg-red-600 animate-ping" : "bg-indigo-400"}`} />
                    <span>
                      {isRecording 
                        ? (language === "ar" ? "إلغاء التسجيل" : "Cancel") 
                        : (language === "ar" ? "تسجيل ذكي" : "Record Combo")
                      }
                    </span>
                  </button>

                  <div className="h-4 w-px bg-slate-800/80 hidden sm:block" />

                  {/* Manual Settings Fallback / Fine-Tuning */}
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-850/60">
                    {/* Ctrl */}
                    <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer px-1">
                      <input
                        type="checkbox"
                        checked={shortcut.ctrlKey}
                        onChange={(e) => handleUpdateShortcutField(shortcut.id, "ctrlKey", e.target.checked)}
                        className="w-3 h-3 accent-indigo-600 bg-slate-950 border border-slate-850 rounded"
                      />
                      <span>Ctrl</span>
                    </label>

                    {/* Alt */}
                    <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer px-1">
                      <input
                        type="checkbox"
                        checked={shortcut.altKey}
                        onChange={(e) => handleUpdateShortcutField(shortcut.id, "altKey", e.target.checked)}
                        className="w-3 h-3 accent-indigo-600 bg-slate-950 border border-slate-850 rounded"
                      />
                      <span>Alt</span>
                    </label>

                    {/* Shift */}
                    <label className="flex items-center gap-1 text-[9px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer px-1">
                      <input
                        type="checkbox"
                        checked={shortcut.shiftKey}
                        onChange={(e) => handleUpdateShortcutField(shortcut.id, "shiftKey", e.target.checked)}
                        className="w-3 h-3 accent-indigo-600 bg-slate-950 border border-slate-850 rounded"
                      />
                      <span>Shift</span>
                    </label>

                    <span className="text-[10px] text-slate-600 font-bold px-0.5">+</span>

                    {/* Letter/Key input */}
                    <input
                      type="text"
                      value={shortcut.key}
                      onChange={(e) => handleUpdateShortcutField(shortcut.id, "key", e.target.value)}
                      className="w-7 h-6 bg-slate-950 border border-slate-800/80 rounded text-center text-[11px] text-indigo-400 focus:text-indigo-300 focus:border-indigo-500 font-mono font-bold focus:outline-none uppercase"
                      maxLength={1}
                      title={language === "ar" ? "اضغط واكتب حرفاً أو رقماً" : "Click and write a letter or number"}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profiles System (نظام التبديل بين المستخدمين) */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
          <div className="p-1.5 bg-sky-600/10 rounded-lg text-sky-400">
            <User size={15} />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-extrabold text-slate-200">{getTranslation("settings_profiles", language)}</h4>
            <p className="text-[10px] text-slate-500">{getTranslation("settings_profiles_desc", language)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          {/* Admin Profile */}
          <button
            onClick={() => onChangeProfile("default")}
            className={`p-3 rounded-xl border text-right transition flex flex-col justify-between h-24 ${
              activeProfile === "default"
                ? "bg-sky-950/40 border-sky-500/80 shadow-md shadow-sky-950/50"
                : "bg-slate-950/20 border-slate-800 hover:border-slate-700 hover:bg-slate-950/40"
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-900/50 px-1.5 py-0.5 rounded">{getTranslation("settings_owner", language)}</span>
              {activeProfile === "default" && <Check size={12} className="text-sky-400" />}
            </div>
            <div className="mt-2 text-right w-full">
              <h5 className="text-xs font-bold text-slate-200">{getTranslation("adminUser", language)}</h5>
              <p className="text-[9px] text-slate-500 mt-0.5">{getTranslation("settings_owner_desc", language)}</p>
            </div>
          </button>

          {/* Sales Profile */}
          <button
            onClick={() => onChangeProfile("sales")}
            className={`p-3 rounded-xl border text-right transition flex flex-col justify-between h-24 ${
              activeProfile === "sales"
                ? "bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/50"
                : "bg-slate-950/20 border-slate-800 hover:border-slate-700 hover:bg-slate-950/40"
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-900/50 px-1.5 py-0.5 rounded">{language === "ar" ? "مبيعات" : "Sales"}</span>
              {activeProfile === "sales" && <Check size={12} className="text-amber-400" />}
            </div>
            <div className="mt-2 text-right w-full">
              <h5 className="text-xs font-bold text-slate-200">{getTranslation("settings_sales_role", language)}</h5>
              <p className="text-[9px] text-slate-500 mt-0.5">{getTranslation("settings_sales_desc", language)}</p>
            </div>
          </button>

          {/* Warehouse Keeper Profile */}
          <button
            onClick={() => onChangeProfile("inventory_keeper")}
            className={`p-3 rounded-xl border text-right transition flex flex-col justify-between h-24 ${
              activeProfile === "inventory_keeper"
                ? "bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/50"
                : "bg-slate-950/20 border-slate-800 hover:border-slate-700 hover:bg-slate-950/40"
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-1.5 py-0.5 rounded">{language === "ar" ? "مستودعات" : "Warehouse"}</span>
              {activeProfile === "inventory_keeper" && <Check size={12} className="text-emerald-400" />}
            </div>
            <div className="mt-2 text-right w-full">
              <h5 className="text-xs font-bold text-slate-200">{getTranslation("settings_keeper_role", language)}</h5>
              <p className="text-[9px] text-slate-500 mt-0.5">{getTranslation("settings_keeper_desc", language)}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Cloud Backup System (النسخ الاحتياطي السحابي المشفر) */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-600/10 rounded-lg text-violet-400">
              <Database size={15} />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-extrabold text-slate-200">{getTranslation("settings_backup_title", language)}</h4>
              <p className="text-[10px] text-slate-500">{getTranslation("settings_backup_desc", language)}</p>
            </div>
          </div>
        </div>

        {/* Custom Data Selection */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="text-[10px] font-bold text-slate-400">
            {language === "ar" ? "تحديد البيانات المراد تضمينها بالنسخة الاحتياطية:" : "Select data to include in the backup file:"}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={backupInvoices}
                onChange={(e) => setBackupInvoices(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded bg-slate-950 border border-slate-850"
              />
              <span>{language === "ar" ? "الفواتير والمبيعات" : "Invoices & Sales"}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={backupInventory}
                onChange={(e) => setBackupInventory(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded bg-slate-950 border border-slate-850"
              />
              <span>{language === "ar" ? "المخزون والمستودعات" : "Inventory & Stock"}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={backupNotes}
                onChange={(e) => setBackupNotes(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded bg-slate-950 border border-slate-850"
              />
              <span>{language === "ar" ? "الملاحظات والنصوص" : "Notes & Texts"}</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export */}
          <button
            onClick={handleExportBackup}
            className="p-3 bg-violet-950/20 hover:bg-violet-900/20 border border-violet-850/50 rounded-xl flex items-center gap-3 text-right transition group cursor-pointer"
          >
            <div className="p-2 bg-violet-600 rounded-lg text-white group-hover:scale-105 transition">
              <DownloadCloud size={16} />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200">{getTranslation("settings_export_db", language)}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{getTranslation("settings_export_desc", language)}</div>
            </div>
          </button>

          {/* Import */}
          <label className="p-3 bg-slate-950/20 hover:bg-slate-900/40 border border-slate-800 rounded-xl flex items-center gap-3 text-right transition group cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <div className="p-2 bg-slate-800 rounded-lg text-slate-300 group-hover:scale-105 transition">
              <UploadCloud size={16} />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200">{getTranslation("settings_import_db", language)}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{getTranslation("settings_import_desc", language)}</div>
            </div>
          </label>
        </div>

        {/* Backup Scheduling */}
        <div className="bg-slate-950/50 border border-slate-900/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-violet-400" />
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-300 block">{getTranslation("settings_backup_schedule", language)}</span>
              <span className="text-[9px] text-slate-500">{getTranslation("settings_backup_schedule_desc", language)}</span>
            </div>
          </div>
          <div className="relative min-w-[130px]">
            <select
              value={backupInterval}
              onChange={(e) => handleIntervalChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:border-violet-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="manual">{getTranslation("settings_manual", language)}</option>
              <option value="daily">{getTranslation("settings_daily", language)}</option>
              <option value="weekly">{getTranslation("settings_weekly", language)}</option>
              <option value="monthly">{getTranslation("settings_monthly", language)}</option>
            </select>
            <div className="absolute left-2.5 top-3 w-1.5 h-1.5 border-r border-b border-slate-400 transform rotate-45 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl flex gap-2 text-blue-300">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <div className="text-[10px] leading-relaxed text-right w-full">
          <p className="font-bold mb-0.5">{getTranslation("settings_info_title", language)}</p>
          <p>{getTranslation("settings_info_desc", language)}</p>
        </div>
      </div>
    </div>
  );
}
