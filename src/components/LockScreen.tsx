import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Unlock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { getTranslation, LanguageCode } from "../utils/i18n";
import { triggerToast } from "../utils/toast";

interface LockScreenProps {
  language: LanguageCode;
  fullName: string;
  username: string;
  onUnlock: () => void;
}

export default function LockScreen({
  language,
  fullName,
  username,
  onUnlock
}: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      );
      setDateStr(
        now.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check password from workspace_users matching this username
    const existingUsersStr = localStorage.getItem("workspace_users");
    let users = [];
    try {
      users = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    } catch {
      users = [];
    }

    const foundUser = users.find(
      (u: any) => u.username.toLowerCase() === username.toLowerCase()
    );

    // If default user or no users, fallback password is "123"
    const correctPassword = foundUser ? foundUser.password : "123";

    if (password === correctPassword) {
      triggerToast(
        language === "ar" ? "تم إلغاء قفل الشاشة بنجاح!" : "Workspace unlocked successfully!",
        "success"
      );
      onUnlock();
    } else {
      triggerToast(getTranslation("invalidPass", language), "warning");
    }
  };

  const isRtl = language === "ar";

  return (
    <div 
      className="fixed inset-0 z-[11000] flex flex-col items-center justify-between bg-slate-950/90 backdrop-blur-2xl p-6 font-sans select-none"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.75) 0%, rgba(2, 6, 23, 0.98) 95%)"
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Upper part: Big Clock */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mt-12 space-y-2"
      >
        <span className="font-mono text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-200 to-sky-400 tracking-wider block">
          {time}
        </span>
        <span className="text-xs font-semibold text-slate-400 tracking-wide block">
          {dateStr}
        </span>
      </motion.div>

      {/* Middle part: Unlock Form */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-full max-w-sm bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-5"
      >
        {/* User avatar/badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-lg shadow-inner">
            {fullName ? fullName.slice(0, 2) : "US"}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1 rounded-full border border-slate-900 shadow">
            <Lock size={12} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-200">{fullName || getTranslation("adminUser", language)}</h3>
          <p className="text-[10px] text-slate-500 mt-1">@{username || "admin"}</p>
        </div>

        <form onSubmit={handleUnlockSubmit} className="w-full space-y-3">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={getTranslation("password", language)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none text-center"
              autoFocus
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute top-3 ${isRtl ? "left-3.5" : "right-3.5"} p-0.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer`}
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Unlock size={13} />
            <span>{getTranslation("unlock", language)}</span>
          </button>
        </form>
      </motion.div>

      {/* Footer message */}
      <div className="mb-6 flex items-center gap-1.5 text-[10px] text-slate-500">
        <ShieldAlert size={12} className="text-violet-500 animate-pulse" />
        <span>{getTranslation("sessionSecured", language)}</span>
      </div>
    </div>
  );
}
