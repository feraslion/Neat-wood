import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";
import { motion } from "motion/react";

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
