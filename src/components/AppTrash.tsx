import React, { useState, useEffect } from "react";
import { Trash2, RotateCcw, FileText, Folder, CheckSquare, RefreshCw, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerToast } from "../utils/toast";
import { safeStorage } from "../utils/storage";

interface TrashItem {
  id: string;
  originalId: string;
  name: string;
  type: "task" | "file" | "folder";
  deletedAt: string;
  originalData: any;
}

export default function AppTrash() {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);

  // Load trash items
  const loadTrash = () => {
    try {
      const saved = safeStorage.getItem("workspace_trash");
      setTrashItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setTrashItems([]);
    }
  };

  useEffect(() => {
    loadTrash();
    // Listen for storage changes or updates
    const handleUpdate = () => loadTrash();
    window.addEventListener("workspace-update", handleUpdate);
    return () => window.removeEventListener("workspace-update", handleUpdate);
  }, []);

  const saveTrashAndSync = (items: TrashItem[]) => {
    setTrashItems(items);
    safeStorage.setItem("workspace_trash", JSON.stringify(items));
    window.dispatchEvent(new Event("workspace-update"));
  };

  // Restore item
  const handleRestore = (item: TrashItem) => {
    if (item.type === "task") {
      try {
        const savedTasks = JSON.parse(safeStorage.getItem("workspace_tasks") || "[]");
        // Check if task already exists
        if (!savedTasks.some((t: any) => t.id === item.originalId)) {
          safeStorage.setItem("workspace_tasks", JSON.stringify([item.originalData, ...savedTasks]));
        }
        triggerToast("تم استعادة المهمة بنجاح!", "success");
      } catch (e) {}
    } else if (item.type === "file" || item.type === "folder") {
      try {
        const savedFiles = JSON.parse(safeStorage.getItem("workspace_files") || "[]");
        const { item: originalFile, subItems } = item.originalData;

        // If it was a folder, we need to restore the folder and all its subItems
        if (item.type === "folder" && Array.isArray(subItems)) {
          const filesToAdd = subItems.filter((sub: any) => !savedFiles.some((f: any) => f.id === sub.id));
          safeStorage.setItem("workspace_files", JSON.stringify([...savedFiles, ...filesToAdd]));
        } else {
          // It's a file
          if (!savedFiles.some((f: any) => f.id === originalFile.id)) {
            safeStorage.setItem("workspace_files", JSON.stringify([...savedFiles, originalFile]));
          }
        }
        triggerToast("تم استعادة الملف بنجاح!", "success");
      } catch (e) {}
    }

    // Remove from trash
    const updatedTrash = trashItems.filter((i) => i.id !== item.id);
    saveTrashAndSync(updatedTrash);
  };

  // Permanent Delete Item
  const handlePermanentDelete = (id: string, name: string) => {
    if (confirm(`هل تريد بالتأكيد حذف "${name}" نهائياً؟ لا يمكن استرجاع هذا العنصر.`)) {
      const updatedTrash = trashItems.filter((i) => i.id !== id);
      saveTrashAndSync(updatedTrash);
      triggerToast("تم حذف العنصر نهائياً!", "success");
    }
  };

  // Empty Trash Bin
  const handleEmptyTrash = () => {
    if (trashItems.length === 0) return;
    if (confirm("هل تريد بالتأكيد تفريغ سلة المهملات بالكامل؟")) {
      saveTrashAndSync([]);
      triggerToast("تم تفريغ سلة المهملات بنجاح!", "success");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare size={16} className="text-indigo-400" />;
      case "folder":
        return <Folder size={16} className="text-blue-400" />;
      default:
        return <FileText size={16} className="text-emerald-400" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "task":
        return "مهمة";
      case "folder":
        return "مجلد";
      default:
        return "ملف";
    }
  };

  return (
    <div id="app-trash-container" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 space-y-4 overflow-hidden" dir="rtl">
      {/* Action Header */}
      <div className="flex justify-between items-center bg-slate-950/60 border border-slate-800 p-3 rounded-xl shrink-0">
        <div>
          <h3 className="text-xs font-bold text-slate-200">سلة المهملات</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">استرجع المهام والملفات المحذوفة أو تخلص منها نهائياً</p>
        </div>
        {trashItems.length > 0 ? (
          <button
            onClick={handleEmptyTrash}
            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 border border-red-500/30 hover:border-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>تفريغ السلة</span>
          </button>
        ) : (
          <div className="text-[10px] text-slate-500 font-semibold bg-slate-900/35 px-2.5 py-1.5 rounded-lg border border-slate-850">
            السلة فارغة
          </div>
        )}
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 space-y-2">
        <AnimatePresence initial={false}>
          {trashItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-slate-500 py-12 text-center"
            >
              <div className="w-12 h-12 bg-slate-950/50 rounded-2xl flex items-center justify-center border border-slate-850 mb-3 text-slate-600">
                <Trash2 size={24} />
              </div>
              <p className="text-xs font-bold text-slate-400">سلة المهملات فارغة</p>
              <p className="text-[10px] text-slate-500 mt-1">تظهر هنا العناصر والمهام والملفات التي تقوم بحذفها</p>
            </motion.div>
          ) : (
            trashItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="flex justify-between items-center p-3 bg-slate-950/50 border border-slate-850 hover:border-slate-800 rounded-xl transition"
              >
                {/* Left Side: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-900/80 rounded-lg shrink-0 border border-slate-800">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-200 block truncate max-w-[200px] leading-tight">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-1">
                      النوع: {getTypeName(item.type)} • حُذف في: {item.deletedAt}
                    </span>
                  </div>
                </div>

                {/* Right Side: Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    className="p-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg transition"
                    title="استعادة العنصر"
                  >
                    <RotateCcw size={12} />
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(item.id, item.name)}
                    className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-350 border border-red-500/20 hover:border-red-500/40 rounded-lg transition"
                    title="حذف نهائي"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Info panel */}
      <div className="bg-slate-950/30 p-2.5 rounded-xl border border-slate-850/60 flex items-center gap-2 text-slate-400 shrink-0">
        <Info size={12} className="text-indigo-400" />
        <span className="text-[9px] leading-snug">
          يتيح نظام سلة المهملات تتبع آمن للمستندات والمهام المحذوفة لحمايتها من الحذف غير المقصود مع عزل كامل لكل موظف.
        </span>
      </div>
    </div>
  );
}
