import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Calendar, BookOpen, AlertCircle, Circle, FolderOpen } from "lucide-react";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function AppTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("workspace_tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: "1", text: "استكشاف خصائص مساحة العمل المتكاملة", completed: true, category: "work", createdAt: new Date().toLocaleDateString() },
      { id: "2", text: "كتابة مسودة تقرير الأسبوع بمفكرة النصوص", completed: false, category: "work", createdAt: new Date().toLocaleDateString() },
      { id: "3", text: "مراسلة المساعد الذكي لتعديل خطة العمل", completed: false, category: "ideas", createdAt: new Date().toLocaleDateString() },
    ];
  });

  const [input, setInput] = useState("");
  const [category, setCategory] = useState<"work" | "personal" | "ideas" | "urgent">("work");
  const [filter, setFilter] = useState<"all" | "work" | "personal" | "ideas" | "urgent">("all");

  useEffect(() => {
    localStorage.setItem("workspace_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      category,
      createdAt: new Date().toLocaleDateString("ar-EG"),
    };

    setTasks((prev) => [newTask, ...prev]);
    setInput("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => filter === "all" || t.category === filter);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "urgent":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "work":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "ideas":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case "urgent":
        return "عاجل";
      case "work":
        return "عمل";
      case "ideas":
        return "أفكار";
      default:
        return "شخصي";
    }
  };

  return (
    <div id="app-tasks-container" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 space-y-4 overflow-y-auto scrollbar-thin" dir="rtl">
      {/* Progress Card */}
      <div className="bg-gradient-to-l from-indigo-950/60 to-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">معدل إنجاز المهام اليومية</h3>
            <p className="text-[11px] text-slate-400">لقد أنجزت {completedCount} من أصل {totalCount} مهمة</p>
          </div>
          <span className="text-2xl font-bold text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="bg-indigo-500 h-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="أضف مهمة جديدة اليوم..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none placeholder-slate-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1 transition shrink-0"
          >
            <Plus size={14} />
            إضافة
          </button>
        </div>

        {/* Category selector */}
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-slate-400 shrink-0">التصنيف:</span>
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {(["work", "personal", "ideas", "urgent"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] border transition capitalize ${
                  category === cat
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {(["all", "work", "personal", "ideas", "urgent"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs transition border shrink-0 ${
              filter === f
                ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-medium"
                : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            {f === "all" ? "الكل" : getCategoryName(f)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="flex-1 min-h-[150px] space-y-2">
        <AnimatePresence initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-slate-500 h-full py-6 space-y-2"
            >
              <FolderOpen size={28} className="text-slate-600" />
              <p className="text-xs">لا يوجد أي مهام في هذا التصنيف</p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`flex justify-between items-center p-3 rounded-xl border transition ${
                  task.completed
                    ? "bg-slate-950/20 border-slate-900 text-slate-500"
                    : "bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`p-1 rounded-md border transition shrink-0 ${
                      task.completed
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                        : "bg-slate-900 border-slate-800 hover:border-slate-600 text-transparent"
                    }`}
                  >
                    <Check size={12} className={task.completed ? "opacity-100" : "opacity-0"} />
                  </button>

                  <span
                    onClick={() => toggleTask(task.id)}
                    className={`text-xs cursor-pointer select-none truncate flex-1 ${
                      task.completed ? "line-through text-slate-500" : "text-slate-200"
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] border ${getCategoryColor(task.category)}`}>
                    {getCategoryName(task.category)}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-md transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
