import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Notebook, 
  CheckSquare, 
  Calculator, 
  Folder, 
  Boxes, 
  Receipt, 
  TrendingUp, 
  Palette, 
  Sparkles,
  LayoutGrid,
  RotateCcw,
  Plus,
  Eye,
  EyeOff,
  Sliders,
  Check
} from "lucide-react";
import { DesktopIcon } from "../types";
import { LanguageCode } from "../utils/i18n";
import { triggerToast } from "../utils/toast";

interface DesktopIconsProps {
  language: LanguageCode;
  desktopIcons: DesktopIcon[];
  onUpdateIcons: (updated: DesktopIcon[]) => void;
  openWindow: (id: string) => void;
}

export default function DesktopIcons({
  language,
  desktopIcons,
  onUpdateIcons,
  openWindow
}: DesktopIconsProps) {
  const [showConfig, setShowConfig] = useState(false);
  const isRtl = language === "ar";

  const ALL_POSSIBLE_ICONS = [
    { id: "ai", titleAr: "المساعد الذكي", titleEn: "AI Assistant", iconName: "Bot" },
    { id: "tasks", titleAr: "مدير المهام", titleEn: "Tasks Manager", iconName: "CheckSquare" },
    { id: "notes", titleAr: "المفكرة", titleEn: "Smart Notes", iconName: "Notebook" },
    { id: "calc", titleAr: "الحاسبة السريعة", titleEn: "Quick Calc", iconName: "Calculator" },
    { id: "files", titleAr: "الملفات والكتب", titleEn: "File Manager", iconName: "Folder" },
    { id: "inventory", titleAr: "المخزون والمستودع", titleEn: "Inventory", iconName: "Boxes" },
    { id: "invoices", titleAr: "الفواتير والمبيعات", titleEn: "Invoices", iconName: "Receipt" },
    { id: "reports", titleAr: "التقارير المالية", titleEn: "Reports", iconName: "TrendingUp" },
    { id: "settings", titleAr: "إعدادات المظهر", titleEn: "Settings", iconName: "Palette" }
  ];

  // Auto Arrange Desktop Icons in a nice clean grid columns
  const handleAutoArrange = () => {
    const colSpacing = 100;
    const rowSpacing = 95;
    const startX = 24;
    const startY = 24;
    const maxRows = 5;

    const arranged = desktopIcons.map((icon, idx) => {
      const col = Math.floor(idx / maxRows);
      const row = idx % maxRows;
      return {
        ...icon,
        x: startX + col * colSpacing,
        y: startY + row * rowSpacing
      };
    });

    onUpdateIcons(arranged);
    triggerToast(
      language === "ar" ? "تم إعادة ترتيب الأيقونات تلقائياً!" : "Icons arranged automatically!",
      "success"
    );
  };

  // Reset desktop icons to defaults
  const handleResetDefaults = () => {
    const defaults: DesktopIcon[] = ALL_POSSIBLE_ICONS.map((item, idx) => {
      const maxRows = 5;
      const col = Math.floor(idx / maxRows);
      const row = idx % maxRows;
      return {
        id: item.id,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        iconName: item.iconName,
        x: 24 + col * 100,
        y: 24 + row * 95
      };
    });
    onUpdateIcons(defaults);
    triggerToast(
      language === "ar" ? "تمت استعادة اختصارات سطح المكتب الافتراضية!" : "Desktop shortcuts reset to defaults!",
      "success"
    );
  };

  // Drag handler
  const handleDragEnd = (id: string, info: any) => {
    // Math.max to prevent dragging offscreen to negative coordinates
    const targetIcon = desktopIcons.find(icon => icon.id === id);
    if (!targetIcon) return;

    const newX = Math.max(10, targetIcon.x + info.offset.x);
    const newY = Math.max(10, targetIcon.y + info.offset.y);

    const updated = desktopIcons.map(icon => 
      icon.id === id ? { ...icon, x: newX, y: newY } : icon
    );
    onUpdateIcons(updated);
  };

  // Toggle icon shortcut
  const toggleIconVisibility = (item: typeof ALL_POSSIBLE_ICONS[0]) => {
    const exists = desktopIcons.some(icon => icon.id === item.id);
    if (exists) {
      // Remove it
      const filtered = desktopIcons.filter(icon => icon.id !== item.id);
      onUpdateIcons(filtered);
    } else {
      // Add it at the next available spot
      const nextIdx = desktopIcons.length;
      const col = Math.floor(nextIdx / 5);
      const row = nextIdx % 5;
      const newIcon: DesktopIcon = {
        id: item.id,
        titleAr: item.titleAr,
        titleEn: item.titleEn,
        iconName: item.iconName,
        x: 24 + col * 100,
        y: 24 + row * 95
      };
      onUpdateIcons([...desktopIcons, newIcon]);
    }
  };

  const getIconComponent = (name: string) => {
    const size = 26;
    switch (name) {
      case "Bot": return <Bot size={size} />;
      case "CheckSquare": return <CheckSquare size={size} />;
      case "Notebook": return <Notebook size={size} />;
      case "Calculator": return <Calculator size={size} />;
      case "Folder": return <Folder size={size} />;
      case "Boxes": return <Boxes size={size} />;
      case "Receipt": return <Receipt size={size} />;
      case "TrendingUp": return <TrendingUp size={size} />;
      case "Palette": return <Palette size={size} />;
      default: return <Sparkles size={size} />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none">
      {/* Desktop Icons list */}
      <div className="relative w-full h-full">
        {desktopIcons.map((icon) => {
          return (
            <motion.div
              key={icon.id}
              drag
              dragMomentum={false}
              dragElastic={0.05}
              onDragEnd={(e, info) => handleDragEnd(icon.id, info)}
              style={{ 
                left: icon.x, 
                top: icon.y,
                position: "absolute"
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="pointer-events-auto flex flex-col items-center justify-center p-2 w-[84px] text-center cursor-grab active:cursor-grabbing rounded-xl group transition-colors duration-150 select-none hover:bg-white/10 dark:hover:bg-slate-900/40 hover:backdrop-blur-[1px]"
              title={language === "ar" ? "اسحب لتغيير المكان - انقر للتشغيل" : "Drag to move - Click to open"}
              onDoubleClick={() => openWindow(icon.id)}
              onClick={(e) => {
                // Also support single click for quick friendliness
                if (e.detail === 1) {
                  // Wait brief delay so double click doesn't conflict or just open directly
                  openWindow(icon.id);
                }
              }}
            >
              {/* App Icon Circle container */}
              <div className="w-12 h-12 bg-white/80 dark:bg-slate-900/85 text-slate-800 dark:text-slate-100 rounded-2xl flex items-center justify-center shadow-lg border border-white/40 dark:border-slate-800 group-hover:shadow-xl group-hover:border-blue-500/30 transition-all duration-200">
                <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  {getIconComponent(icon.iconName)}
                </div>
              </div>

              {/* Title label */}
              <span 
                className="mt-1.5 text-[10px] font-bold text-white tracking-wide block truncate w-full"
                style={{
                  textShadow: "0 1px 3px rgba(0,0,0,0.85), 0 1px 1px rgba(0,0,0,0.6)"
                }}
              >
                {language === "ar" ? icon.titleAr : icon.titleEn}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Control Pill for desktop icons */}
      <div className="absolute bottom-4 right-4 pointer-events-auto z-40 flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 rounded-full shadow-lg">
        <button
          onClick={handleAutoArrange}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition cursor-pointer"
          title={language === "ar" ? "ترتيب تلقائي للأيقونات" : "Auto Arrange Icons"}
        >
          <LayoutGrid size={13} />
        </button>

        <button
          onClick={handleResetDefaults}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition cursor-pointer"
          title={language === "ar" ? "استعادة الاختصارات الافتراضية" : "Reset Desktop Shortcuts"}
        >
          <RotateCcw size={13} />
        </button>

        <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`p-1.5 rounded-full transition flex items-center gap-1 cursor-pointer text-xs font-bold ${
            showConfig 
              ? "bg-violet-600 text-white" 
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
          title={language === "ar" ? "تخصيص أيقونات سطح المكتب" : "Customize Desktop Shortcuts"}
        >
          <Sliders size={13} />
          <span className="hidden md:inline">{language === "ar" ? "تخصيص سطح المكتب" : "Desktop Icons"}</span>
        </button>
      </div>

      {/* Customize Desktop Icons Drawer Modal */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto" 
              onClick={() => setShowConfig(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl text-right pointer-events-auto"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-200">
                  {language === "ar" ? "تخصيص اختصارات سطح المكتب" : "Customize Desktop Shortcuts"}
                </span>
                <button 
                  onClick={() => setShowConfig(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                {language === "ar" 
                  ? "قم بتفعيل أو تعطيل التطبيقات التي ترغب بظهور اختصاراتها على خلفية سطح المكتب لسهولة الوصول:" 
                  : "Enable or disable application shortcuts directly on the wallpaper background:"}
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {ALL_POSSIBLE_ICONS.map((item) => {
                  const isVisible = desktopIcons.some(icon => icon.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleIconVisibility(item)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-right transition cursor-pointer ${
                        isVisible
                          ? "bg-violet-950/20 border-violet-800/40 text-violet-300"
                          : "bg-slate-950/30 border-slate-850 hover:bg-slate-800/50 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-slate-300">
                          {getIconComponent(item.iconName)}
                        </div>
                        <span className="text-xs font-semibold">
                          {language === "ar" ? item.titleAr : item.titleEn}
                        </span>
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isVisible 
                          ? "bg-violet-600 border-violet-500 text-white" 
                          : "border-slate-700"
                      }`}>
                        {isVisible && <Check size={12} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    handleAutoArrange();
                    setShowConfig(false);
                  }}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  {language === "ar" ? "ترتيب الأيقونات وحفظ" : "Arrange & Save"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom X icon placeholder
function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
