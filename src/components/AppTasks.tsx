import React, { useState, useEffect } from "react";
import { Plus, Check, Trash2, Calendar, BookOpen, AlertCircle, Circle, FolderOpen, BarChart2, Clock } from "lucide-react";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { triggerToast } from "../utils/toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

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
  const [showChart, setShowChart] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    localStorage.setItem("workspace_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem("workspace_tasks");
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    };
    window.addEventListener("workspace-update", handleUpdate);
    return () => window.removeEventListener("workspace-update", handleUpdate);
  }, []);

  const getNextDueDate = (dateStr: string, pattern: "daily" | "weekly" | "monthly"): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const now = new Date();
      if (pattern === "daily") now.setDate(now.getDate() + 1);
      else if (pattern === "weekly") now.setDate(now.getDate() + 7);
      else if (pattern === "monthly") now.setMonth(now.getMonth() + 1);
      return now.toISOString().split("T")[0];
    }
    
    if (pattern === "daily") d.setDate(d.getDate() + 1);
    else if (pattern === "weekly") d.setDate(d.getDate() + 7);
    else if (pattern === "monthly") d.setMonth(d.getMonth() + 1);
    
    return d.toISOString().split("T")[0];
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      category,
      createdAt: new Date().toLocaleDateString("ar-EG"),
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      recurrence: recurrence !== "none" ? recurrence : undefined,
      notified: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setInput("");
    setDueDate("");
    setDueTime("");
    setRecurrence("none");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === id);
      if (taskIndex === -1) return prev;
      const t = prev[taskIndex];
      const isCompleting = !t.completed;
      
      let nextTasks = [...prev];
      nextTasks[taskIndex] = { ...t, completed: isCompleting };

      if (isCompleting && t.recurrence && t.recurrence !== "none") {
        const currentDateStr = t.dueDate || new Date().toISOString().split("T")[0];
        const nextDate = getNextDueDate(currentDateStr, t.recurrence);
        
        const recurringCopy: Task = {
          id: "recur_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
          text: t.text,
          completed: false,
          category: t.category,
          createdAt: new Date().toLocaleDateString("ar-EG"),
          dueDate: nextDate,
          dueTime: t.dueTime,
          recurrence: t.recurrence,
          notified: false
        };
        
        nextTasks = [recurringCopy, ...nextTasks];
        
        setTimeout(() => {
          triggerToast(
            localStorage.getItem("workspace_language") === "ar"
              ? `تمت جدولة التكرار القادم بنجاح بتاريخ ${nextDate}`
              : `Next recurrence scheduled for ${nextDate}`,
            "success"
          );
        }, 100);
      }

      return nextTasks;
    });
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      try {
        const trash = JSON.parse(localStorage.getItem("workspace_trash") || "[]");
        const newTrashItem = {
          id: "trash_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
          originalId: taskToDelete.id,
          name: taskToDelete.text,
          type: "task",
          deletedAt: new Date().toLocaleDateString("ar-EG") + " " + new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          originalData: taskToDelete
        };
        localStorage.setItem("workspace_trash", JSON.stringify([...trash, newTrashItem]));
        window.dispatchEvent(new Event("workspace-update"));
      } catch (e) {}

      setTasks((prev) => prev.filter((t) => t.id !== id));
      triggerToast(
        localStorage.getItem("workspace_language") === "ar" ? "تم نقل المهمة إلى سلة المهملات" : "Task moved to trash bin",
        "info"
      );
    }
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

  // Calendar View Helpers and State Derivatives
  const MONTHS_AR = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  const DAYS_WEEK = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: Array<{ type: "empty" | "day"; value: number | ""; dateStr: string }> = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ type: "empty", value: "", dateStr: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ type: "day", value: d, dateStr });
  }

  const selectedDateTasks = tasks.filter((t) => t.dueDate === selectedCalendarDate);

  return (
    <div id="app-tasks-container" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans p-4 space-y-3 overflow-y-auto scrollbar-thin" dir="rtl">
      {/* View Switcher Tabs */}
      <div className="flex bg-slate-950/40 p-1 border border-slate-800 rounded-xl shrink-0">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
            viewMode === "list"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          قائمة المهام اليومية
        </button>
        <button
          onClick={() => {
            setViewMode("calendar");
            // Set default selected date if not set
            if (!selectedCalendarDate) {
              setSelectedCalendarDate(new Date().toISOString().split("T")[0]);
            }
          }}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
            viewMode === "calendar"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          عرض التقويم (Calendar)
        </button>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Progress Card */}
          <div className="bg-gradient-to-l from-indigo-950/60 to-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md shrink-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">معدل إنجاز المهام اليومية</h3>
                <p className="text-[11px] text-slate-400">لقد أنجزت {completedCount} من أصل {totalCount} مهمة</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-2xl font-bold text-indigo-400">{progressPercent}%</span>
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <BarChart2 size={12} />
                  {showChart ? "إخفاء الرسم البياني" : "عرض الرسم البياني"}
                </button>
              </div>
            </div>
            
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="bg-indigo-500 h-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Recharts Graphical Completion Visualizer */}
            {showChart && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 pt-4 border-t border-slate-800/50 overflow-hidden"
              >
                <h4 className="text-xs font-bold text-slate-300 mb-3 text-right">نسبة الإنجاز الفعلية حسب الفئات</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={["work", "personal", "urgent", "ideas"].map((cat) => {
                        const catTasks = tasks.filter((t) => t.category === cat);
                        const total = catTasks.length;
                        const completed = catTasks.filter((t) => t.completed).length;
                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                        return {
                          name: getCategoryName(cat),
                          percent,
                          total,
                          completed,
                          color: cat === "work" ? "#6366f1" : cat === "urgent" ? "#f43f5e" : cat === "personal" ? "#10b981" : "#f59e0b"
                        };
                      })}
                      margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                    >
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-[10px] text-slate-200 text-right">
                                <p className="font-bold">{data.name}</p>
                                <p className="mt-0.5">نسبة الإنجاز: {data.percent}%</p>
                                <p className="text-slate-500">({data.completed} من {data.total} مهام)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="percent" radius={[4, 4, 0, 0]} barSize={32}>
                        {["work", "personal", "urgent", "ideas"].map((cat, index) => {
                          const color = cat === "work" ? "#6366f1" : cat === "urgent" ? "#f43f5e" : cat === "personal" ? "#10b981" : "#f59e0b";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2.5 shrink-0">
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                إضافة
              </button>
            </div>

            {/* Category Selector */}
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-slate-400 shrink-0">التصنيف:</span>
              <div className="flex gap-1.5 overflow-x-auto py-1">
                {(["work", "personal", "ideas", "urgent"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] border transition capitalize cursor-pointer ${
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

            {/* Due Date, Time & Recurrence Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-900 pt-2 text-[10px]">
              <div className="flex gap-2 items-center">
                <span className="text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock size={11} className="text-indigo-400" />
                  الاستحقاق والتنبيه:
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 items-center justify-start sm:justify-end">
                <span className="text-slate-400">تكرار المهمة:</span>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="none">بدون تكرار</option>
                  <option value="daily">يومي (Daily)</option>
                  <option value="weekly">أسبوعي (Weekly)</option>
                  <option value="monthly">شهري (Monthly)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Filters */}
          <div className="flex gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none shrink-0">
            {(["all", "work", "personal", "ideas", "urgent"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs transition border shrink-0 cursor-pointer ${
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
                  className="flex flex-col items-center justify-center text-slate-500 h-full py-12 space-y-2"
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
                        className={`p-1 rounded-md border transition shrink-0 cursor-pointer ${
                          task.completed
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                            : "bg-slate-900 border-slate-800 hover:border-slate-600 text-transparent"
                        }`}
                      >
                        <Check size={12} className={task.completed ? "opacity-100" : "opacity-0"} />
                      </button>

                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          onClick={() => toggleTask(task.id)}
                          className={`text-xs cursor-pointer select-none truncate ${
                            task.completed ? "line-through text-slate-500" : "text-slate-200"
                          }`}
                        >
                          {task.text}
                        </span>
                        {task.dueDate && (
                          <span className="text-[9px] text-indigo-400 mt-1 flex items-center gap-1 font-sans flex-wrap">
                            <Clock size={10} />
                            الموعد: {task.dueDate} {task.dueTime || ""}
                            {task.recurrence && (
                              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1 rounded text-[8px] mr-1.5">
                                تكرار: {task.recurrence === "daily" ? "يومي" : task.recurrence === "weekly" ? "أسبوعي" : "شهري"}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] border ${getCategoryColor(task.category)}`}>
                        {getCategoryName(task.category)}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-md transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* Calendar View rendering */
        <div className="space-y-4 flex flex-col h-full">
          {/* Calendar Controller Header */}
          <div className="flex justify-between items-center bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 shrink-0">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-800/80 transition cursor-pointer"
            >
              الشهر السابق
            </button>
            <span className="text-xs font-bold text-slate-200 font-sans tracking-wide">
              {MONTHS_AR[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-800/80 transition cursor-pointer"
            >
              الشهر التالي
            </button>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 shrink-0 shadow-inner">
            {/* Weekdays row */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold text-slate-400">
              {DAYS_WEEK.map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (cell.type === "empty") {
                  return <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-lg" />;
                }

                const isTodayStr = new Date().toISOString().split("T")[0];
                const isToday = cell.dateStr === isTodayStr;
                const isSelected = selectedCalendarDate === cell.dateStr;
                
                // Get tasks for this date
                const dayTasks = tasks.filter((t) => t.dueDate === cell.dateStr);
                const pendingTasks = dayTasks.filter((t) => !t.completed);
                
                return (
                  <button
                    key={`day-${cell.value}`}
                    onClick={() => setSelectedCalendarDate(cell.dateStr)}
                    className={`aspect-square p-1 rounded-xl border flex flex-col justify-between items-stretch transition relative group cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/10"
                        : isToday
                        ? "bg-indigo-950/45 border-indigo-800 text-indigo-300"
                        : "bg-slate-900/60 border-slate-800/60 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    {/* Day number */}
                    <span className="text-[10px] font-bold font-sans self-start">{cell.value}</span>
                    
                    {/* Category bar dots indicators inside cell */}
                    <div className="flex gap-0.5 justify-center mt-1 flex-wrap max-h-[12px] overflow-hidden">
                      {pendingTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.category === "urgent"
                              ? "bg-rose-500"
                              : t.category === "work"
                              ? "bg-indigo-500"
                              : t.category === "ideas"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          title={t.text}
                        />
                      ))}
                      {pendingTasks.length > 3 && (
                        <span className="text-[6px] text-slate-400 leading-none font-bold self-center">
                          +{pendingTasks.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Day Tasks List */}
          <div className="flex-1 bg-slate-950/20 border border-slate-800/60 rounded-2xl p-4 min-h-[160px] flex flex-col">
            <div className="flex justify-between items-center mb-3 shrink-0 border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-300">
                المهام المجدولة لتاريخ:{" "}
                <span className="text-indigo-400 font-sans">
                  {selectedCalendarDate ? selectedCalendarDate : "لم يتم التحديد"}
                </span>
              </h4>
              <span className="text-[9px] text-slate-500">({selectedDateTasks.length} مهام)</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {selectedDateTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-8 space-y-1">
                  <Calendar size={22} className="text-slate-600 animate-pulse" />
                  <p className="text-[10px]">لا توجد أي مهام مجدولة لهذا التاريخ</p>
                  <button
                    onClick={() => {
                      setDueDate(selectedCalendarDate || "");
                      setViewMode("list");
                    }}
                    className="text-[9px] font-bold text-indigo-400 hover:underline cursor-pointer"
                  >
                    اضغط لجدولة مهمة جديدة لهذا اليوم
                  </button>
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex justify-between items-center p-2.5 rounded-xl border transition ${
                      task.completed
                        ? "bg-slate-950/25 border-slate-900 text-slate-500"
                        : "bg-slate-950/50 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`p-1 rounded-md border transition shrink-0 cursor-pointer ${
                          task.completed
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-400"
                            : "bg-slate-900 border-slate-800 hover:border-slate-600 text-transparent"
                        }`}
                      >
                        <Check size={10} className={task.completed ? "opacity-100" : "opacity-0"} />
                      </button>
                      <span
                        onClick={() => toggleTask(task.id)}
                        className={`text-[11px] cursor-pointer select-none truncate ${
                          task.completed ? "line-through text-slate-500" : "text-slate-200"
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] border ${getCategoryColor(task.category)}`}>
                        {getCategoryName(task.category)}
                      </span>
                      {task.recurrence && (
                        <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1 rounded text-[8px]">
                          {task.recurrence === "daily" ? "يومي" : task.recurrence === "weekly" ? "أسبوعي" : "شهري"}
                        </span>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 hover:text-red-400 rounded transition cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
