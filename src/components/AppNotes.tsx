import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Search, FileText, Calendar, Sparkles, Eye, Edit3, FileDown } from "lucide-react";
import { Note, FileSystemItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { triggerToast } from "../utils/toast";
import { safeStorage } from "../utils/storage";

export default function AppNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = safeStorage.getItem("workspace_notes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "1",
        title: "مسودة الأفكار والملاحظات",
        content: "أهلاً بك في المفكرة الذكية لمساحة العمل. يمكنك كتابة وحفظ نصوصك البرمجية ومسودات رسائلك هنا بشكل آمن وسريع.\n\nتتميز المفكرة بالحفظ التلقائي في ذاكرة المتصفح المحلية.\n\n### تجربة ميزة المنسق (Markdown):\n- **خط عريض**\n- *خط مائل*\n- قائمة نقطية\n\n> اقتباس ملهم: التطوير المستمر هو مفتاح النجاح الباهر.",
        category: "عام",
        updatedAt: new Date().toLocaleDateString("ar-EG"),
      },
    ];
  });

  const [activeId, setActiveId] = useState<string>("1");
  const [search, setSearch] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    safeStorage.setItem("workspace_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (activeId) {
      safeStorage.setItem("workspace_active_note_id", activeId);
    }
  }, [activeId]);

  // Listen to open-item events for quick navigation from global search
  useEffect(() => {
    const handleOpenItem = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.app === "notes") {
        setActiveId(customEvent.detail.id);
      }
    };
    window.addEventListener("open-item", handleOpenItem);
    return () => {
      window.removeEventListener("open-item", handleOpenItem);
    };
  }, []);

  const activeNote = notes.find((n) => n.id === activeId) || notes[0];

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "ملاحظة جديدة غير معنونة",
      content: "",
      category: "عام",
      updatedAt: new Date().toLocaleDateString("ar-EG"),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
    setIsPreview(false);
  };

  const handleUpdateNote = (field: "title" | "content" | "category", value: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? { ...n, [field]: value, updatedAt: new Date().toLocaleDateString("ar-EG") }
          : n
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    if (notes.length <= 1) {
      alert("يجب أن تظل هناك ملاحظة واحدة على الأقل!");
      return;
    }
    if (confirm("هل تريد بالتأكيد حذف هذه الملاحظة؟")) {
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      setActiveId(remaining[0].id);
    }
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    try {
      const savedFilesRaw = safeStorage.getItem("workspace_files") || "[]";
      const savedFiles: FileSystemItem[] = JSON.parse(savedFilesRaw);
      
      const fileName = `${activeNote.title || "ملاحظة غير معنونة"}.md`;
      
      const newFile: FileSystemItem = {
        id: `note_md_${activeNote.id}_${Date.now()}`,
        name: fileName,
        type: "file",
        extension: "md",
        content: activeNote.content,
        parentId: null,
        size: `${new Blob([activeNote.content]).size} B`,
        createdAt: new Date().toLocaleDateString("ar-EG"),
      };

      safeStorage.setItem("workspace_files", JSON.stringify([newFile, ...savedFiles]));
      window.dispatchEvent(new Event("workspace-update"));
      
      triggerToast(
        safeStorage.getItem("workspace_language") === "ar"
          ? "تم حفظ الملاحظة كملف Markdown بنجاح!"
          : "Note saved as Markdown file successfully!",
        "success"
      );
    } catch (e) {
      triggerToast("فشل تصدير الملف كـ Markdown", "warning");
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="app-notes-container" className="flex h-full bg-slate-900/40 text-slate-100 font-sans select-none" dir="rtl">
      {/* Sidebar List of Notes */}
      <div className="w-1/3 border-l border-slate-800 flex flex-col bg-slate-950/40">
        {/* Search & Actions Header */}
        <div className="p-2 border-b border-slate-800 space-y-2">
          <button
            onClick={handleCreateNote}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Plus size={14} />
            ملاحظة جديدة
          </button>
          <div className="relative">
            <Search size={12} className="absolute right-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن ملاحظة..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-8 pl-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500/50 text-slate-200 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Note List Items */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setActiveId(note.id);
                setIsPreview(false);
              }}
              className={`p-2 rounded-lg cursor-pointer transition text-right group relative ${
                activeId === note.id
                  ? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-300"
                  : "hover:bg-slate-900/60 border border-transparent text-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <FileText size={12} className={activeId === note.id ? "text-indigo-400" : "text-slate-500"} />
                <h4 className="text-xs font-semibold truncate flex-1 leading-snug">
                  {note.title || "ملاحظة فارغة"}
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 truncate mb-1">
                {note.content ? note.content.substring(0, 45) : "لا يوجد محتوى..."}
              </p>
              <div className="flex justify-between items-center text-[9px] text-slate-600">
                <span>{note.updatedAt}</span>
                {notes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 hover:bg-slate-950 rounded-md transition duration-150"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-center text-[11px] text-slate-600 py-6">لم يتم العثور على أي ملاحظات</p>
          )}
        </div>
      </div>

      {/* Editing Workspace Panel */}
      <div className="flex-1 flex flex-col bg-slate-950/20 p-3 overflow-hidden">
        {activeNote ? (
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            {/* Title & Toolbar Input */}
            <div className="flex flex-col gap-2 border-b border-slate-800/40 pb-2 shrink-0">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote("title", e.target.value)}
                placeholder="عنوان الملاحظة..."
                className="w-full bg-transparent border-none text-sm font-semibold text-slate-100 focus:outline-none placeholder-slate-500"
              />
              
              {/* Toolbar for Markdown & Export */}
              <div className="flex justify-between items-center bg-slate-950/50 p-1 rounded-lg border border-slate-850">
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsPreview(false)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      !isPreview
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Edit3 size={11} />
                    تحرير
                  </button>
                  <button
                    onClick={() => setIsPreview(true)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      isPreview
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Eye size={11} />
                    معاينة Markdown
                  </button>
                </div>
                
                <button
                  onClick={handleExportMarkdown}
                  className="px-2 py-1 text-[10px] font-bold bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded transition flex items-center gap-1 cursor-pointer"
                  title="حفظ كملف Markdown في مدير الملفات"
                >
                  <FileDown size={11} />
                  تصدير لمدير الملفات
                </button>
              </div>
            </div>

            {/* Editing Textarea or Markdown View */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {!isPreview ? (
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote("content", e.target.value)}
                  placeholder="ابدأ في كتابة ملاحظاتك هنا (يمكنك استخدام Markdown لتهيئة النصوص)..."
                  className="w-full h-full bg-transparent border-none text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert text-xs text-slate-300 leading-relaxed max-w-none p-1 scrollbar-thin">
                  <ReactMarkdown>{activeNote.content || "*ملاحظة فارغة*"}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Auto-Save indicator */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/40 pt-2 shrink-0">
              <span className="flex items-center gap-1">
                <Sparkles size={10} className="text-teal-400 animate-pulse" />
                مفعل: الحفظ التلقائي والتهيئة لمدير الملفات
              </span>
              <span>تحديث الأخير: {activeNote.updatedAt}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <FileText size={40} className="text-slate-600 mb-2" />
            <p className="text-xs">يرجى اختيار ملاحظة أو إنشاء واحدة جديدة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}
