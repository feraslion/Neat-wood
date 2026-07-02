import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, RefreshCw, FileText, Check } from "lucide-react";
import { ChatMessage, Task } from "../types";
import { motion } from "motion/react";
import { triggerToast } from "../utils/toast";

export default function AppAI() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("workspace_ai_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        text: "مرحباً! أنا مساعدك الذكي المدمج في بيئة العمل. كيف يمكنني مساعدتك اليوم؟ يمكنني تلخيص أفكارك، كتابة نصوص، أو مساعدتك في تنظيم مهامك اليومية.",
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("workspace_ai_chat", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleAnalyzeContext = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, title } = customEvent.detail;
      
      const activeProfile = localStorage.getItem("workspace_active_profile") || "default";
      const getProfileKey = (key: string) => {
        if (!activeProfile || activeProfile === "default") return key;
        return `${activeProfile}_${key}`;
      };

      let prompt = "";
      
      if (id === "invoices") {
        const saved = localStorage.getItem(getProfileKey("workspace_invoices"));
        let invoices: any[] = [];
        try { invoices = saved ? JSON.parse(saved) : []; } catch (err) {}
        
        const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const paidCount = invoices.filter(inv => inv.status === "paid").length;
        const unpaidCount = invoices.filter(inv => inv.status === "unpaid").length;
        
        prompt = `أرجو تحليل قائمة الفواتير المالية الحالية في النظام وتقديم قراءة تحليلية للمبيعات والتحصيلات، واقترح استراتيجيات لتحسين التدفق المالي.\n\nالبيانات الإجمالية:\n- إجمالي الفواتير: ${invoices.length} فواتير.\n- المبيعات الإجمالية: ${totalSales.toLocaleString()} ريال.\n- الفواتير المدفوعة: ${paidCount}\n- الفواتير غير المدفوعة/المستحقة: ${unpaidCount}\n\nتفاصيل الفواتير الحالية:\n` +
          invoices.map((inv: any) => `- فاتورة رقم ${inv.invoiceNumber} للعميل ${inv.customerName} بقيمة ${inv.totalAmount} ريال (${inv.status === "paid" ? "مدفوعة" : "غير مدفوعة"}) تاريخ: ${inv.date}`).join("\n");
      } 
      else if (id === "inventory") {
        const saved = localStorage.getItem(getProfileKey("workspace_inventory"));
        let inventory: any[] = [];
        try { inventory = saved ? JSON.parse(saved) : []; } catch (err) {}
        
        const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalValue = inventory.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
        const lowStock = inventory.filter(item => (item.quantity || 0) <= (item.minAlert || 5));
        
        prompt = `أرجو تحليل بيانات المخزون والمستودع الحالي في النظام وتقديم تقرير عن حالة المستودع، وتحديد المنتجات التي قاربت على النفاد، مع نصائح تنظيمية لتحسين إدارة المستودع.\n\nالبيانات الإجمالية للمستودع:\n- إجمالي المنتجات المسجلة: ${inventory.length}\n- إجمالي عدد القطع المتوفرة: ${totalItems} قطع.\n- القيمة الإجمالية للمخزون: ${totalValue.toLocaleString()} ريال.\n- منتجات منخفضة المخزون: ${lowStock.length} منتجات.\n\nتفاصيل المنتجات المتوفرة:\n` +
          inventory.map((item: any) => `- ${item.name} (${item.category}): الكمية المتوفرة: ${item.quantity} (حد الإنذار: ${item.minAlert})، سعر القطعة: ${item.price} ريال`).join("\n");
      } 
      else if (id === "tasks") {
        const saved = localStorage.getItem("workspace_tasks");
        let tasks: any[] = [];
        try { tasks = saved ? JSON.parse(saved) : []; } catch (err) {}
        
        const completed = tasks.filter(t => t.completed).length;
        const pending = tasks.filter(t => !t.completed).length;
        
        prompt = `أرجو تحليل قائمة المهام الحالية وتوزيعها، وتصميم خطة عمل نموذجية مخصصة لإنجاز المهام المتراكمة وتنظيم وقتي بشكل أفضل.\n\nالبيانات الإحصائية:\n- إجمالي المهام: ${tasks.length}\n- المهام المنجزة: ${completed}\n- المهام المعلقة: ${pending}\n\nقائمة المهام:\n` +
          tasks.map((t: any) => `- ${t.text} [التصنيف: ${t.category}] (${t.completed ? "منجزة" : "معلقة"})${t.dueDate ? ` - تاريخ الاستحقاق: ${t.dueDate}` : ""}${t.recurrence && t.recurrence !== "none" ? ` - التكرار: ${t.recurrence}` : ""}`).join("\n");
      }
      else if (id === "notes") {
        const activeId = localStorage.getItem("workspace_active_note_id");
        const savedNotesRaw = localStorage.getItem("workspace_notes") || "[]";
        let notesList: any[] = [];
        try { notesList = JSON.parse(savedNotesRaw); } catch (e) {}

        const activeNote = notesList.find((n) => n.id === activeId) || notesList[0];
        if (!activeNote || !activeNote.content.trim()) {
          triggerToast(
            localStorage.getItem("workspace_language") === "ar"
              ? "يرجى كتابة وفتح ملاحظة أولاً ليتمكن المساعد من تحليلها."
              : "Please open a note with content first to analyze it.",
            "warning"
          );
          return;
        }
        prompt = `يرجى قراءة وتحليل النص التالي المأخوذ من ملاحظتي النشطة بعنوان "${activeNote.title}" واستخراج جميع المهام المطلوبة أو الأفكار القابلة للتنفيذ بشكل مباشر.\n\nقدم ردك بتحليل مختصر للملاحظة أولاً، ثم اذكر المهام المستخرجة كقائمة في نهاية الرد بحيث تبدأ كل مهمة بسطر مستقل تماماً بالتنسيق التالي بالتفصيل:\n- [مهمة] نص المهمة (تصنيفها)\n\nالتصنيفات المتاحة هي: (عمل، شخصي، عاجل، أفكار) فقط.\n\nالنص المراد تحليله:\n${activeNote.content}`;
      }
      else if (id === "files") {
        const saved = localStorage.getItem("workspace_files");
        let items: any[] = [];
        try { items = saved ? JSON.parse(saved) : []; } catch (err) {}
        
        prompt = `أرجو مراجعة وتحليل بنية المجلدات والملفات الحالية في مدير الملفات، وتقديم اقتراحات لتنظيم وتوثيق هذه الملفات لتسهيل الوصول للمستندات والعمل المشترك.\n\nهيكل الملفات والمستندات الحالي:\n` +
          items.map((item: any) => `- [${item.type === "folder" ? "مجلد" : "ملف"}] ${item.name} (${item.type === "file" ? `الحجم: ${item.size || "0 B"}` : "مجلد فرعي"})${item.createdAt ? ` - تاريخ الإنشاء: ${item.createdAt}` : ""}`).join("\n");
      }
      else {
        prompt = `أرجو مراجعة وتحليل نظام مساحة العمل النشط (${title}) وتقديم قراءة حول كيفية دمج عمليات ومميزات هذا التطبيق مع أهداف عملي الحالية.`;
      }

      if (prompt) {
        triggerToast(
          localStorage.getItem("workspace_language") === "ar"
            ? `جاري استيراد سياق نافذة "${title}" للتحليل...`
            : `Importing context from window "${title}"...`,
          "info"
        );
        handleSend(prompt);
      }
    };

    window.addEventListener("analyze_window_context", handleAnalyzeContext);
    return () => {
      window.removeEventListener("analyze_window_context", handleAnalyzeContext);
    };
  }, [messages]);

  // Direct Task Extraction Logic
  interface ExtractedTask {
    text: string;
    category: "work" | "personal" | "ideas" | "urgent";
  }

  const parseExtractedTasks = (text: string): ExtractedTask[] => {
    const lines = text.split("\n");
    const extracted: ExtractedTask[] = [];
    
    // Matches lines like: - [مهمة] نص المهمة (عمل) or - [task] task text (work)
    const taskRegex = /^-\s*\[(?:مهمة|task)\]\s*(.+?)\s*(?:\((عمل|شخصي|عاجل|أفكار|work|personal|urgent|ideas)\))?$/i;

    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(taskRegex);
      if (match) {
        const taskText = match[1].trim();
        const categoryRaw = match[2]?.toLowerCase() || "ideas";
        
        let category: "work" | "personal" | "ideas" | "urgent" = "ideas";
        if (categoryRaw === "عمل" || categoryRaw === "work") category = "work";
        else if (categoryRaw === "شخصي" || categoryRaw === "personal") category = "personal";
        else if (categoryRaw === "عاجل" || categoryRaw === "urgent") category = "urgent";
        else if (categoryRaw === "أفكار" || categoryRaw === "ideas") category = "ideas";

        extracted.push({ text: taskText, category });
      }
    }
    return extracted;
  };

  const handleAddTaskDirectly = (text: string, category: "work" | "personal" | "ideas" | "urgent") => {
    try {
      const savedTasksRaw = localStorage.getItem("workspace_tasks") || "[]";
      let currentTasks: Task[] = [];
      try {
        currentTasks = JSON.parse(savedTasksRaw);
      } catch (e) {
        currentTasks = [];
      }

      const newTask: Task = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        text,
        completed: false,
        category,
        createdAt: new Date().toISOString()
      };

      const updatedTasks = [newTask, ...currentTasks];
      localStorage.setItem("workspace_tasks", JSON.stringify(updatedTasks));

      // Dispatch event to refresh AppTasks UI dynamically
      window.dispatchEvent(new CustomEvent("workspace-update"));

      triggerToast(
        localStorage.getItem("workspace_language") === "ar"
          ? `تمت إضافة المهمة بنجاح: "${text}"`
          : `Task added successfully: "${text}"`,
        "success"
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeOpenNote = () => {
    try {
      const activeId = localStorage.getItem("workspace_active_note_id");
      const savedNotesRaw = localStorage.getItem("workspace_notes") || "[]";
      let notesList: any[] = [];
      try {
        notesList = JSON.parse(savedNotesRaw);
      } catch (e) {
        notesList = [];
      }

      const activeNote = notesList.find((n) => n.id === activeId) || notesList[0];
      if (!activeNote || !activeNote.content.trim()) {
        triggerToast(
          localStorage.getItem("workspace_language") === "ar"
            ? "يرجى كتابة وفتح ملاحظة أولاً ليتمكن المساعد من تحليلها."
            : "Please open a note with content first to analyze it.",
          "warning"
        );
        return;
      }

      // Format custom instructions prompt
      const prompt = `يرجى قراءة وتحليل النص التالي المأخوذ من ملاحظتي النشطة بعنوان "${activeNote.title}" واستخراج جميع المهام المطلوبة أو الأفكار القابلة للتنفيذ بشكل مباشر.\n\nقدم ردك بتحليل مختصر للملاحظة أولاً، ثم اذكر المهام المستخرجة كقائمة في نهاية الرد بحيث تبدأ كل مهمة بسطر مستقل تماماً بالتنسيق التالي بالتفصيل:\n- [مهمة] نص المهمة (تصنيفها)\n\nالتصنيفات المتاحة هي: (عمل، شخصي، عاجل، أفكار) فقط.\n\nمثال:\n- [مهمة] مراجعة التقرير المالي لشهر يوليو (عمل)\n- [مهمة] الاتصال بالطبيب لحجز موعد (شخصي)\n\nالنص المراد تحليله:\n${activeNote.content}`;

      handleSend(prompt);
    } catch (e) {
      console.error(e);
    }
  };

  const ExtractedTasksPanel = ({ text }: { text: string }) => {
    const extracted = parseExtractedTasks(text);
    const [addedIndices, setAddedIndices] = useState<Record<number, boolean>>({});

    if (extracted.length === 0) return null;

    const handleAdd = (task: ExtractedTask, index: number) => {
      handleAddAddTaskDirectly(task, index);
    };

    const handleAddAddTaskDirectly = (task: ExtractedTask, index: number) => {
      handleAddTaskDirectly(task.text, task.category);
      setAddedIndices(prev => ({ ...prev, [index]: true }));
    };

    return (
      <div className="mt-3 p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2.5" dir="rtl">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-400">
          <Sparkles size={13} className="animate-pulse" />
          <span>المهام المستخرجة ذكياً:</span>
        </div>
        <div className="space-y-2">
          {extracted.map((task, idx) => {
            const isAdded = addedIndices[idx];
            const catColors = {
              work: "bg-blue-600/10 text-blue-400 border-blue-500/20",
              personal: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20",
              urgent: "bg-rose-600/10 text-rose-400 border-rose-500/20",
              ideas: "bg-amber-600/10 text-amber-400 border-amber-500/20"
            };
            const catNamesAr = {
              work: "عمل",
              personal: "شخصي",
              urgent: "عاجل",
              ideas: "أفكار"
            };

            return (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-slate-900/60 border border-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${catColors[task.category]}`}>
                    {catNamesAr[task.category]}
                  </span>
                  <span className="text-xs font-medium text-slate-200 line-clamp-2">{task.text}</span>
                </div>
                <button
                  onClick={() => handleAdd(task, idx)}
                  disabled={isAdded}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                    isAdded
                      ? "bg-slate-800 text-slate-500 border border-slate-750"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/20"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <span>تمت الإضافة</span>
                      <Check size={10} />
                    </>
                  ) : (
                    <>
                      <span>إضافة كـ مهمة</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build simple conversation history for context
      // Limit to last 8 messages to stay within prompt limits
      const historyContext = messages
        .filter((m) => m.id !== "welcome")
        .slice(-8)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyContext }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "حدث خطأ ما أثناء الاتصال بخوادم المساعد.");
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "عذراً، فشل المساعد في الاستجابة.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("هل تريد بالتأكيد مسح تاريخ المحادثة؟")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: "مرحباً! تم مسح سجل المحادثة. كيف يمكنني مساعدتك الآن؟",
          timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  const suggestions = [
    "اكتب لي قائمة بمهام ريادية لتنظيم يومي",
    "اقترح فكرة مشروع تطبيق هاتف ذكي جديد",
    "ساعدني في صياغة بريد إلكتروني اعتذار رسمي",
    "كيف يمكنني زيادة إنتاجيتي في العمل؟",
  ];

  return (
    <div id="app-ai-container" className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans" dir="rtl">
      {/* Active Note Analyzer Header */}
      <div className="p-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-teal-400" />
          <span className="text-[11px] font-bold text-slate-300">تحليل الملاحظات الذكي</span>
        </div>
        <button
          onClick={handleAnalyzeOpenNote}
          className="flex items-center gap-1 px-3 py-1.5 bg-teal-600/10 hover:bg-teal-600 border border-teal-500/20 hover:border-teal-500 text-teal-400 hover:text-white rounded-lg text-[10px] font-bold transition shadow-sm cursor-pointer"
        >
          <Sparkles size={11} className="animate-pulse" />
          <span>استخراج المهام من الملاحظة المفتوحة</span>
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 max-w-[85%] ${
              msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
            }`}
          >
            <div
              className={`p-2 rounded-full shadow-sm shrink-0 ${
                msg.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-800 text-teal-400 border border-slate-700"
              }`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className="flex flex-col">
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-800/90 text-slate-100 border border-slate-700 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>

              {/* Show Extracted Tasks Checklist */}
              {msg.role === "assistant" && <ExtractedTasksPanel text={msg.text} />}

              <span className={`text-[10px] mt-1 text-slate-400 px-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2 ml-auto max-w-[85%]">
            <div className="p-2 rounded-full bg-slate-800 text-teal-400 border border-slate-700 animate-spin">
              <RefreshCw size={16} />
            </div>
            <div className="bg-slate-800/90 text-slate-300 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-xs text-slate-400 mr-2">جاري التفكير وصياغة الرد...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <div>
              <p className="font-semibold">تنبيه النظام:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {messages.length === 1 && !isLoading && (
          <div className="pt-2">
            <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-teal-400 animate-pulse" />
              اقتراحات للبدء:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="p-2.5 text-right text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition duration-200 text-slate-300 hover:text-white hover:border-indigo-500/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center gap-2 rounded-b-xl">
        <button
          onClick={clearChat}
          title="مسح المحادثة"
          className="p-2.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 border border-slate-700 rounded-xl transition duration-200 text-slate-400 shrink-0"
        >
          <Trash2 size={16} />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex-1 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="اكتب رسالتك للمساعد الذكي هنا..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500/70 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-40 disabled:hover:bg-indigo-600 shrink-0 flex items-center justify-center"
          >
            <Send size={16} className="rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
}
