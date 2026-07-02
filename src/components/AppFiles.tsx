import React, { useState, useEffect } from "react";
import { 
  Folder, 
  File, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  FolderPlus, 
  FilePlus, 
  Download, 
  Upload, 
  ArrowRight,
  Sparkles,
  Info,
  Notebook,
  CheckSquare,
  Search,
  X,
  Save,
  FileText
} from "lucide-react";
import { FileSystemItem, Note, Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { triggerToast } from "../utils/toast";
import ReactMarkdown from "react-markdown";
import { safeStorage } from "../utils/storage";

export default function AppFiles() {
  const [items, setItems] = useState<FileSystemItem[]>(() => {
    const saved = safeStorage.getItem("workspace_files");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    
    // Default virtual filesystem template
    return [
      {
        id: "folder_docs",
        name: "المستندات والتقارير",
        type: "folder",
        parentId: null,
        createdAt: new Date().toLocaleDateString("ar-EG"),
      },
      {
        id: "folder_ideas",
        name: "العصف الذهني والأفكار",
        type: "folder",
        parentId: null,
        createdAt: new Date().toLocaleDateString("ar-EG"),
      },
      {
        id: "file_welcome",
        name: "أهلاً بك في مساحة الملفات.txt",
        type: "file",
        extension: "txt",
        content: "مرحباً بك في مدير الملفات الافتراضي المدمج!\n\nيمكنك الآن:\n1. إنشاء مجلدات جديدة لتنظيم ملفاتك.\n2. كتابة وتعديل ملفات نصية مخصصة بحرية.\n3. استيراد الملاحظات النشطة من تطبيق المفكرة الذكية.\n4. حفظ نسخة من قائمة المهام اليومية كملف نصي للتوثيق.\n\nتُحفظ كافة التغييرات محلياً وتلقائياً في جهازك.",
        parentId: null,
        size: "350 B",
        createdAt: new Date().toLocaleDateString("ar-EG"),
      },
      {
        id: "file_report",
        name: "تقرير_الأداء_الأسبوعي.txt",
        type: "file",
        extension: "txt",
        content: "تقرير الأداء الأسبوعي لمساحة العمل:\n- تم إنجاز معظم المهام المحددة.\n- المساعد الذكي قدم مساعدة فعالة في صياغة الأكواد وتوفير حلول برمجية.\n- الذاكرة تعمل بشكل مستقر والأداء متميز.",
        parentId: "folder_docs",
        size: "180 B",
        createdAt: new Date().toLocaleDateString("ar-EG"),
      }
    ];
  });

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Drag and drop states
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain") || draggedItemId;
    if (!itemId) return;

    if (itemId === targetFolderId) {
      triggerToast(
        safeStorage.getItem("workspace_language") === "ar"
          ? "لا يمكن نقل المجلد إلى نفسه!"
          : "Cannot move folder to itself!",
        "warning"
      );
      return;
    }

    // Verify targetFolderId is not a child of itemId
    const checkIsChild = (parentFolderId: string, searchFolderId: string | null): boolean => {
      if (!searchFolderId) return false;
      const folder = items.find((f) => f.id === searchFolderId);
      if (!folder) return false;
      if (folder.parentId === parentFolderId) return true;
      return checkIsChild(parentFolderId, folder.parentId);
    };

    if (checkIsChild(itemId, targetFolderId)) {
      triggerToast(
        safeStorage.getItem("workspace_language") === "ar"
          ? "لا يمكن نقل المجلد داخل أحد المجلدات الفرعية التابعة له!"
          : "Cannot move a folder inside one of its own subfolders!",
        "warning"
      );
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, parentId: targetFolderId }
          : item
      )
    );

    const movedItem = items.find((item) => item.id === itemId);
    const targetFolder = items.find((f) => f.id === targetFolderId);
    const targetFolderName = targetFolder ? targetFolder.name : "الرئيسية";

    triggerToast(
      safeStorage.getItem("workspace_language") === "ar"
        ? `تم نقل "${movedItem?.name}" إلى "${targetFolderName}" بنجاح!`
        : `Moved "${movedItem?.name}" to "${targetFolderName}" successfully!`,
      "success"
    );

    setDraggedItemId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Modals / Create controls
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  
  // File viewer / Editor Modal
  const [editingFile, setEditingFile] = useState<FileSystemItem | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [fileViewMode, setFileViewMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    safeStorage.setItem("workspace_files", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = safeStorage.getItem("workspace_files");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {}
      }
    };
    window.addEventListener("workspace-update", handleUpdate);
    return () => window.removeEventListener("workspace-update", handleUpdate);
  }, []);

  // Listen to open-item events for quick navigation from global search
  useEffect(() => {
    const handleOpenItem = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.app === "files") {
        const targetId = customEvent.detail.id;
        const found = items.find((item) => item.id === targetId);
        if (found) {
          setCurrentFolderId(found.parentId);
          setSelectedItemId(found.id);
          if (found.type === "file") {
            setEditingFile(found);
            setEditingContent(found.content || "");
          }
        }
      }
    };
    window.addEventListener("open-item", handleOpenItem);
    return () => {
      window.removeEventListener("open-item", handleOpenItem);
    };
  }, [items]);

  // Navigation utilities
  const currentItems = items.filter(
    (item) => item.parentId === currentFolderId && 
    (searchQuery.trim() === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentFolder = items.find((f) => f.id === currentFolderId);

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedItemId(null);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: FileSystemItem = {
      id: "folder_" + Date.now(),
      name: newFolderName.trim(),
      type: "folder",
      parentId: currentFolderId,
      createdAt: new Date().toLocaleDateString("ar-EG"),
    };

    setItems((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let finalName = newFileName.trim();
    if (!finalName.endsWith(".txt")) {
      finalName += ".txt";
    }

    const newFile: FileSystemItem = {
      id: "file_" + Date.now(),
      name: finalName,
      type: "file",
      extension: "txt",
      content: "",
      parentId: currentFolderId,
      size: "0 B",
      createdAt: new Date().toLocaleDateString("ar-EG"),
    };

    setItems((prev) => [...prev, newFile]);
    setNewFileName("");
    setIsCreatingFile(false);
    
    // Open editor immediately for the new file
    setEditingFile(newFile);
    setEditingContent("");
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = items.find((item) => item.id === id);
    if (itemToDelete) {
      if (confirm(`هل تريد بالتأكيد نقل "${itemToDelete.name}" إلى سلة المهملات؟`)) {
        // Recursive delete logic for folders
        const getIdsToDelete = (targetId: string): string[] => {
          const children = items.filter((item) => item.parentId === targetId);
          let ids = [targetId];
          children.forEach((child) => {
            ids = [...ids, ...getIdsToDelete(child.id)];
          });
          return ids;
        };

        const idsToDelete = getIdsToDelete(id);
        const subItems = items.filter((item) => idsToDelete.includes(item.id));

        try {
          const trash = JSON.parse(safeStorage.getItem("workspace_trash") || "[]");
          const newTrashItem = {
            id: "trash_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
            originalId: itemToDelete.id,
            name: itemToDelete.name,
            type: itemToDelete.type,
            deletedAt: new Date().toLocaleDateString("ar-EG") + " " + new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            originalData: {
              item: itemToDelete,
              subItems: subItems
            }
          };
          safeStorage.setItem("workspace_trash", JSON.stringify([...trash, newTrashItem]));
          window.dispatchEvent(new Event("workspace-update"));
        } catch (e) {}

        setItems((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
        if (selectedItemId === id) setSelectedItemId(null);
        triggerToast(
          safeStorage.getItem("workspace_language") === "ar" ? "تم نقل العنصر إلى سلة المهملات" : "Item moved to trash bin",
          "info"
        );
      }
    }
  };

  const handleSaveFileContent = () => {
    if (!editingFile) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === editingFile.id
          ? {
              ...item,
              content: editingContent,
              size: `${new Blob([editingContent]).size} B`,
            }
          : item
      )
    );
    setEditingFile(null);
  };

  // Import Active Notes
  const handleImportNotes = () => {
    const activeNotesRaw = safeStorage.getItem("workspace_notes");
    if (!activeNotesRaw) {
      alert("لم يتم العثور على أي ملاحظات للاستيراد!");
      return;
    }

    try {
      const activeNotes: Note[] = JSON.parse(activeNotesRaw);
      if (activeNotes.length === 0) {
        alert("تطبيق المفكرة لا يحتوي على أي ملاحظات حالياً.");
        return;
      }

      let importedCount = 0;
      const newItems: FileSystemItem[] = [];

      activeNotes.forEach((note) => {
        // Prevent importing exact duplicates in the current folder
        const exists = items.some(
          (item) => item.parentId === currentFolderId && item.name === `${note.title}.note.txt`
        );
        if (!exists) {
          newItems.push({
            id: `imported_note_${note.id}_${Date.now()}`,
            name: `${note.title || "ملاحظة غير معنونة"}.note.txt`,
            type: "file",
            extension: "txt",
            content: note.content || "ملاحظة فارغة",
            parentId: currentFolderId,
            size: `${new Blob([note.content]).size} B`,
            createdAt: new Date().toLocaleDateString("ar-EG"),
          });
          importedCount++;
        }
      });

      if (importedCount > 0) {
        setItems((prev) => [...prev, ...newItems]);
        alert(`تم بنجاح استيراد ${importedCount} ملاحظة كملفات نصية!`);
      } else {
        alert("مستندات هذه الملاحظات مستوردة بالفعل في هذا المجلد.");
      }
    } catch (e) {
      alert("فشل استيراد الملاحظات.");
    }
  };

  // Import Tasks Summary
  const handleImportTasks = () => {
    const activeTasksRaw = safeStorage.getItem("workspace_tasks");
    if (!activeTasksRaw) {
      alert("لم يتم العثور على أي مهام نشطة حالياً!");
      return;
    }

    try {
      const activeTasks: Task[] = JSON.parse(activeTasksRaw);
      if (activeTasks.length === 0) {
        alert("تطبيق المهام فارغ تماماً.");
        return;
      }

      const tasksSummary = activeTasks
        .map((t, idx) => `${idx + 1}. [${t.completed ? "✓ مكتملة" : "  قيد الانتظار"}] [${t.category}] - ${t.text}`)
        .join("\n");

      const fileTitle = `ملخص_المهام_اليومية_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.txt`;

      const exists = items.some(
        (item) => item.parentId === currentFolderId && item.name === fileTitle
      );

      if (exists) {
        alert("لقد قمت بحفظ ملخص للمهام اليوم في هذا المجلد مسبقاً.");
        return;
      }

      const newFile: FileSystemItem = {
        id: `imported_tasks_${Date.now()}`,
        name: fileTitle,
        type: "file",
        extension: "txt",
        content: `ملخص تقرير المهام والإنتاجية اليومية\nتم التصدير في: ${new Date().toLocaleString("ar-EG")}\n\n==================================\n${tasksSummary}\n==================================\nإجمالي المهام: ${activeTasks.length}\nالمهام المكتملة: ${activeTasks.filter(t => t.completed).length}`,
        parentId: currentFolderId,
        size: `${new Blob([tasksSummary]).size} B`,
        createdAt: new Date().toLocaleDateString("ar-EG"),
      };

      setItems((prev) => [...prev, newFile]);
      alert("تم بنجاح استيراد وتوثيق قائمة المهام كملف نصي!");
    } catch (e) {
      alert("فشل استيراد المهام.");
    }
  };

  const selectedItem = items.find((item) => item.id === selectedItemId);

  return (
    <div id="app-files-container" className="flex h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans select-none overflow-hidden" dir="rtl">
      {/* Sidebar Utilities Panel */}
      <aside className="w-1/4 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-4 shrink-0 space-y-4">
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
          إجراءات سريعة
        </div>

        {/* Action Button Links */}
        <button
          onClick={handleImportNotes}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition text-right"
        >
          <Notebook size={14} className="text-amber-500 shrink-0" />
          <span>استيراد الملاحظات بنصوص</span>
        </button>

        <button
          onClick={handleImportTasks}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition text-right"
        >
          <CheckSquare size={14} className="text-indigo-500 shrink-0" />
          <span>حفظ ملخص المهام اليومية</span>
        </button>

        {/* Selected File/Folder details */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center">
                  {selectedItem.type === "folder" ? (
                    <Folder size={36} className="text-blue-500" />
                  ) : (
                    <FileText size={36} className="text-emerald-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all leading-snug">
                    {selectedItem.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1">تاريخ الإنشاء: {selectedItem.createdAt}</p>
                  {selectedItem.type === "file" && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-550">الحجم: {selectedItem.size || "0 B"}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedItem.type === "file" && (
                    <button
                      onClick={() => {
                        setEditingFile(selectedItem);
                        setEditingContent(selectedItem.content || "");
                      }}
                      className="flex-1 py-1.5 text-center text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                    >
                      عرض وتعديل
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="flex-1 py-1.5 text-center text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                  >
                    حذف العنصر
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Info size={14} className="mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                <span>اختر ملفًا أو مجلدًا لعرض التفاصيل والإجراءات.</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main File Explorer View */}
      <main className="flex-1 flex flex-col">
        {/* Explorer Header */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 justify-between shrink-0">
          {/* Path Navigation Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button
              onClick={() => handleNavigate(null)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, null)}
              className={`hover:text-blue-600 dark:hover:text-blue-400 transition rounded px-1 ${
                dragOverFolderId === null && draggedItemId ? "bg-blue-500/20 border border-dashed border-blue-400" : ""
              } ${currentFolderId === null ? "text-slate-800 dark:text-slate-100 font-bold" : ""}`}
            >
              الرئيسية
            </button>
            {currentFolderId !== null && (
              <>
                <ChevronLeft size={12} className="text-slate-300 dark:text-slate-700" />
                <span className="text-slate-800 dark:text-slate-100 font-bold truncate max-w-[120px]">
                  {currentFolder?.name}
                </span>
                <button
                  onClick={() => handleNavigate(currentFolder?.parentId || null)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, currentFolder?.parentId || null)}
                  className={`mr-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 ${
                    draggedItemId ? "bg-indigo-500/10 border border-dashed border-indigo-400/40 animate-pulse" : ""
                  }`}
                  title="رجوع للمجلد الأعلى أو إسقاط الملف هنا لنقله"
                >
                  <ArrowRight size={13} />
                </button>
              </>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-44">
            <Search size={12} className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث هنا..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pr-7 pl-2 py-1.5 text-[11px] focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          {/* Actions to Create */}
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setIsCreatingFolder(true);
                setIsCreatingFile(false);
              }}
              className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition"
              title="مجلد جديد"
            >
              <FolderPlus size={14} />
            </button>
            <button
              onClick={() => {
                setIsCreatingFile(true);
                setIsCreatingFolder(false);
              }}
              className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition"
              title="ملف نصي جديد"
            >
              <FilePlus size={14} />
            </button>
          </div>
        </header>

        {/* Grid Area of current folder contents */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
          {/* Create Folder Inline Prompt */}
          <AnimatePresence>
            {isCreatingFolder && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateFolder}
                className="mb-4 p-3 bg-white border border-blue-200 rounded-xl shadow-sm flex items-center gap-3"
              >
                <Folder size={18} className="text-blue-500 shrink-0" />
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="اسم المجلد الجديد..."
                  autoFocus
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  إنشاء
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </motion.form>
            )}

            {/* Create File Inline Prompt */}
            {isCreatingFile && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateFile}
                className="mb-4 p-3 bg-white border border-emerald-200 rounded-xl shadow-sm flex items-center gap-3"
              >
                <FileText size={18} className="text-emerald-500 shrink-0" />
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="اسم الملف الجديد (مثال: جدول.txt)..."
                  autoFocus
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  إنشاء
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Directory Content List */}
          {currentItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <Folder size={32} className="text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {searchQuery.trim() !== "" ? `لا توجد نتائج مطابقة لـ "${searchQuery}"` : "المجلد فارغ تماماً"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {searchQuery.trim() !== "" ? "تأكد من كتابة اسم الملف أو المجلد بشكل صحيح داخل هذا المجلد" : "ابدأ بإنشاء مجلد أو ملف نصي جديد"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={(e) => {
                      if (item.type === "folder") {
                        e.preventDefault();
                        setDragOverFolderId(item.id);
                      }
                    }}
                    onDragLeave={() => {
                      if (item.type === "folder") {
                        setDragOverFolderId(null);
                      }
                    }}
                    onDrop={(e) => {
                      if (item.type === "folder") {
                        setDragOverFolderId(null);
                        handleDrop(e, item.id);
                      }
                    }}
                    onClick={() => setSelectedItemId(item.id)}
                    onDoubleClick={() => {
                      if (item.type === "folder") {
                        handleNavigate(item.id);
                      } else {
                        setEditingFile(item);
                        setEditingContent(item.content || "");
                        setFileViewMode(item.extension === "md" || item.name.endsWith(".md") ? "preview" : "edit");
                      }
                    }}
                    className={`p-3 rounded-xl border transition cursor-grab active:cursor-grabbing flex flex-col justify-between group h-28 relative ${
                      dragOverFolderId === item.id
                        ? "bg-blue-100 dark:bg-blue-900/40 border-blue-600 scale-[1.02] shadow-md ring-2 ring-blue-500/30"
                        : isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/10"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm"
                    }`}
                  >
                    {/* Folder / File Visual Container */}
                    <div className="h-12 bg-slate-50 dark:bg-slate-850 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition">
                      {item.type === "folder" ? (
                        <Folder size={24} className="text-blue-500" />
                      ) : (
                        <FileText size={24} className="text-emerald-500" />
                      )}
                    </div>
                    
                    <div className="truncate">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                        {item.type === "folder" ? "مجلد ملفات" : item.size || "0 B"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Editor Modal for files */}
      <AnimatePresence>
        {editingFile && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg h-5/6 flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 dark:bg-slate-850 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileText size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold truncate max-w-[180px]">{editingFile.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFileViewMode(fileViewMode === "edit" ? "preview" : "edit")}
                    className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 hover:text-blue-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {fileViewMode === "edit" ? "معاينة المنسق (Markdown)" : "تحرير النص الخام"}
                  </button>
                  <button
                    onClick={() => setEditingFile(null)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Text Area Content or Markdown Viewer */}
              <div className="flex-1 p-4 overflow-hidden flex flex-col">
                {fileViewMode === "edit" ? (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    placeholder="اكتب محتوى الملف النصي هنا..."
                    className="w-full h-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl p-3 text-xs leading-relaxed focus:outline-none resize-none text-slate-850 dark:text-slate-200 flex-1"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs leading-relaxed overflow-y-auto text-slate-850 dark:text-slate-200 prose dark:prose-invert max-w-none flex-1">
                    <ReactMarkdown>{editingContent || "*الملف فارغ*"}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Save Footer */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-1.5 text-xs text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveFileContent}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <Save size={13} />
                  حفظ وتحديث
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
