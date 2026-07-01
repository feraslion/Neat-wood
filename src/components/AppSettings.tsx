import React, { useState } from "react";
import { Image, Palette, Check, Sparkles, AlertCircle, Link, Volume2, Monitor, Sun, Moon, Coins, User, Database, DownloadCloud, UploadCloud, ShieldAlert, Lock, Clock } from "lucide-react";
import { CURRENCIES } from "../types";
import { triggerToast } from "../utils/toast";

interface AppSettingsProps {
  currentWallpaper: string;
  onSelectWallpaper: (val: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeCurrencyCode: string;
  onChangeCurrencyCode: (code: string) => void;
  activeProfile: string;
  onChangeProfile: (id: string) => void;
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
  activeCurrencyCode,
  onChangeCurrencyCode,
  activeProfile,
  onChangeProfile,
}: AppSettingsProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"gradients" | "images" | "custom">("gradients");

  const [backupInterval, setBackupInterval] = useState(() => {
    return localStorage.getItem("workspace_backup_interval") || "manual";
  });

  const handleIntervalChange = (val: string) => {
    setBackupInterval(val);
    localStorage.setItem("workspace_backup_interval", val);
    triggerToast(`تم ضبط جدولة النسخ الاحتياطي الدوري ليكون: ${
      val === "manual" ? "يدوي فقط" : val === "daily" ? "يومياً تلقائياً" : val === "weekly" ? "أسبوعياً تلقائياً" : "شهرياً تلقائياً"
    }`, "info");
  };

  const handleExportBackup = () => {
    const backupObject: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("workspace_") || key.includes("_workspace_"))) {
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

    triggerToast("تم تصدير وتحميل قاعدة البيانات المشفرة بنجاح!", "success");
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

        triggerToast("تم استيراد واستعادة قاعدة البيانات بالكامل بنجاح! جاري تحديث مساحة العمل...", "success");
        
        // Force reload page to apply all changes cleanly after a slight delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err: any) {
        alert(err.message || "فشل استيراد الملف. يرجى التأكد من اختيار ملف نسخ احتياطي مشفر وصحيح.");
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

  return (
    <div id="app-settings-container" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 overflow-y-auto scrollbar-thin space-y-4" dir="rtl">
      {/* Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Palette size={16} className="text-blue-400" />
        <h3 className="text-xs font-bold text-slate-200">تخصيص مظهر مساحة العمل والتحكم بالنظام</h3>
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
          ألوان متدرجة
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${
            activeTab === "images"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          معرض الصور الطبيعية
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${
            activeTab === "custom"
              ? "bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          رابط مخصص
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "gradients" && (
          <div className="grid grid-cols-2 gap-2.5">
            {WALLPAPERS.filter((w) => w.type === "gradient").map((wp) => {
              const isSelected = currentWallpaper === wp.value;
              return (
                <button
                  key={wp.id}
                  onClick={() => onSelectWallpaper(wp.value)}
                  className={`relative p-3 rounded-xl border text-right transition group h-20 flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                  }`}
                >
                  {/* Small background preview inside */}
                  <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${wp.preview} group-hover:opacity-30 transition`} />
                  
                  <span className="text-xs font-bold text-slate-200 z-10">{wp.name}</span>
                  <div className="flex justify-between items-center w-full z-10">
                    <span className="text-[9px] text-slate-500">مظهر متدرج</span>
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
                  <span className="text-xs font-bold text-white z-10 shadow-sm">{wp.name}</span>
                  <div className="flex justify-between items-center w-full z-10">
                    <span className="text-[9px] text-slate-300">صورة خلفية</span>
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
              <span>أدخل رابط الصورة (مثال من Unsplash أو أي رابط مباشر):</span>
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
                تطبيق
              </button>
            </div>
            {currentWallpaper.startsWith("url(") && (
              <div className="text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-2 rounded-md flex items-center gap-1.5">
                <Sparkles size={11} />
                <span>تم تطبيق الخلفية المخصصة بنجاح!</span>
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
          <div>
            <h4 className="text-xs font-bold text-slate-200">وضع المظهر (Theme)</h4>
            <p className="text-[10px] text-slate-500">التبديل بين الوضع الفاتح والداكن على مستوى النظام</p>
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            isDarkMode
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-200 hover:bg-slate-300 text-slate-800"
          }`}
        >
          {isDarkMode ? (
            <>
              <span>الوضع الداكن</span>
              <Moon size={11} className="text-indigo-200" />
            </>
          ) : (
            <>
              <span>الوضع الفاتح</span>
              <Sun size={11} className="text-amber-600" />
            </>
          )}
        </button>
      </div>

      {/* Currency Selection System */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600/10 rounded-lg text-emerald-400">
            <Coins size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">العملة الافتراضية للنظام</h4>
            <p className="text-[10px] text-slate-500">تحويل تلقائي لأسعار المنتجات والفواتير والتقارير</p>
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
                {c.name} ({c.symbol})
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
          <div>
            <h4 className="text-xs font-bold text-slate-200">أصوات النظام التفاعلية</h4>
            <p className="text-[10px] text-slate-500">المؤثرات الصوتية عند فتح وإغلاق النوافذ</p>
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
          {soundEnabled ? "مفعل" : "معطل"}
        </button>
      </div>

      {/* User Profiles System (نظام التبديل بين المستخدمين) */}
      <div className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
          <div className="p-1.5 bg-sky-600/10 rounded-lg text-sky-400">
            <User size={15} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-200">حسابات وأدوار الموظفين (User Profiles)</h4>
            <p className="text-[10px] text-slate-500">عزل تام للمخازن والفواتير والملاحظات لكل موظف على نفس الجهاز</p>
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
              <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 border border-sky-900/50 px-1.5 py-0.5 rounded">المالك الأساسي</span>
              {activeProfile === "default" && <Check size={12} className="text-sky-400" />}
            </div>
            <div className="mt-2">
              <h5 className="text-xs font-bold text-slate-200">المدير العام</h5>
              <p className="text-[9px] text-slate-500 mt-0.5">صلاحيات كاملة للتحكم بكل الأدوات</p>
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
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-900/50 px-1.5 py-0.5 rounded">مبيعات</span>
              {activeProfile === "sales" && <Check size={12} className="text-amber-400" />}
            </div>
            <div className="mt-2">
              <h5 className="text-xs font-bold text-slate-200">كاشير المبيعات</h5>
              <p className="text-[9px] text-slate-500 mt-0.5">فاتورة مبيعات سريعة وحساب مستقل</p>
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
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-1.5 py-0.5 rounded">مستودعات</span>
              {activeProfile === "inventory_keeper" && <Check size={12} className="text-emerald-400" />}
            </div>
            <div className="mt-2">
              <h5 className="text-xs font-bold text-slate-200">أمين المستودع</h5>
              <p className="text-[9px] text-slate-500 mt-0.5">مراقبة المخازن وكميات النقص والأمان</p>
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
            <div>
              <h4 className="text-xs font-extrabold text-slate-200">النسخ الاحتياطي السحابي المشفر</h4>
              <p className="text-[10px] text-slate-500">حفظ كافة البيانات واستعادتها بملف مشفر للحماية القصوى</p>
            </div>
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
            <div>
              <div className="text-xs font-bold text-slate-200">تصدير قاعدة البيانات</div>
              <div className="text-[9px] text-slate-500 mt-0.5">تحميل ملف مشفر بالكامل (.json)</div>
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
            <div>
              <div className="text-xs font-bold text-slate-200">استيراد واستعادة البيانات</div>
              <div className="text-[9px] text-slate-500 mt-0.5">استعادة ملف النسخة المشفرة تلقائياً</div>
            </div>
          </label>
        </div>

        {/* Backup Scheduling */}
        <div className="bg-slate-950/50 border border-slate-900/50 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-violet-400" />
            <div>
              <span className="text-[10px] font-bold text-slate-300 block">جدولة النسخ الاحتياطي الدوري</span>
              <span className="text-[9px] text-slate-500">تنبيهات دورية ذكية لحث الموظفين على حفظ البيانات</span>
            </div>
          </div>
          <div className="relative min-w-[130px]">
            <select
              value={backupInterval}
              onChange={(e) => handleIntervalChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 focus:border-violet-500 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="manual">يدوي فقط</option>
              <option value="daily">يومياً تلقائياً</option>
              <option value="weekly">أسبوعياً تلقائياً</option>
              <option value="monthly">شهرياً تلقائياً</option>
            </select>
            <div className="absolute left-2.5 top-3 w-1.5 h-1.5 border-r border-b border-slate-400 transform rotate-45 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl flex gap-2 text-blue-300">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <div className="text-[10px] leading-relaxed">
          <p className="font-bold mb-0.5">مساحة عمل متجاوبة:</p>
          <p>يمكنك تحريك النوافذ وسحبها من شريط العناوين، وتغيير حجمها بحرية لتناسب أسلوب عملك الفريد.</p>
        </div>
      </div>
    </div>
  );
}
