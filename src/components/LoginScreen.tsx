import React, { useState } from "react";
import { motion } from "motion/react";
import { KeyRound, User, UserPlus, ShieldCheck, Languages, Eye, EyeOff } from "lucide-react";
import { getTranslation, LanguageCode } from "../utils/i18n";
import { triggerToast } from "../utils/toast";
import { safeStorage } from "../utils/storage";

interface LoginScreenProps {
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onLoginSuccess: (user: { username: string; fullName: string }) => void;
}

export default function LoginScreen({
  language,
  onChangeLanguage,
  onLoginSuccess
}: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || (isSignUp && !fullName.trim())) {
      triggerToast(getTranslation("fieldsRequired", language), "warning");
      return;
    }

    // Get current users from safeStorage or default
    const existingUsersStr = safeStorage.getItem("workspace_users");
    let users = [];
    try {
      users = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    } catch {
      users = [];
    }

    // Default admin user if missing
    if (users.length === 0) {
      users.push({
        username: "admin",
        password: "123",
        fullName: getTranslation("adminUser", language)
      });
      safeStorage.setItem("workspace_users", JSON.stringify(users));
    }

    if (isSignUp) {
      // Sign Up process
      const userExists = users.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
      if (userExists) {
        triggerToast(
          language === "ar" ? "اسم المستخدم مسجل بالفعل!" : "Username is already registered!",
          "warning"
        );
        return;
      }

      const newUser = {
        username: username.trim().toLowerCase(),
        password: password,
        fullName: fullName.trim()
      };

      users.push(newUser);
      safeStorage.setItem("workspace_users", JSON.stringify(users));
      triggerToast(getTranslation("registerSuccess", language), "success");
      setIsSignUp(false);
      setPassword("");
    } else {
      // Sign In process
      const foundUser = users.find(
        (u: any) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password
      );

      if (foundUser) {
        triggerToast(getTranslation("loginSuccess", language), "success");
        
        // Handle persistence
        if (rememberMe) {
          safeStorage.setItem("workspace_remember_me", "true");
          safeStorage.setItem("workspace_last_user", JSON.stringify(foundUser));
        } else {
          safeStorage.removeItem("workspace_remember_me");
          safeStorage.removeItem("workspace_last_user");
        }

        // Set session
        safeStorage.setItem("workspace_active_user", JSON.stringify(foundUser));
        
        onLoginSuccess({
          username: foundUser.username,
          fullName: foundUser.fullName
        });
      } else {
        triggerToast(getTranslation("loginError", language), "warning");
      }
    }
  };

  const isRtl = language === "ar";

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950 overflow-hidden font-sans select-none"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(2, 6, 23, 1) 85%)"
      }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Decorative floating blurred lights */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Language Switcher bar in top right/left */}
      <div className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} z-[10100] flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-full p-1 shadow-md backdrop-blur-sm`}>
        <button
          onClick={() => onChangeLanguage("ar")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            language === "ar" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Languages size={11} />
          العربية
        </button>
        <button
          onClick={() => onChangeLanguage("en")}
          className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            language === "en" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Languages size={11} />
          English
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mx-4 bg-slate-900/40 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col justify-between"
      >
        <div className="text-center mb-6">
          {/* Logo Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl mb-4 shadow-inner shadow-violet-500/10">
            <ShieldCheck size={28} className="animate-pulse" />
          </div>

          <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">
            {getTranslation("welcomeTitle", language)}
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed px-2">
            {getTranslation("welcomeDesc", language)}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {getTranslation("fullName", language)}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === "ar" ? "مثال: أحمد الغامدي" : "e.g., John Doe"}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none transition-all"
                  required
                />
                <User size={13} className={`absolute top-3.5 ${isRtl ? "left-3.5" : "right-3.5"} text-slate-500`} />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation("username", language)}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none transition-all"
                required
              />
              <User size={13} className={`absolute top-3.5 ${isRtl ? "left-3.5" : "right-3.5"} text-slate-500`} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {getTranslation("password", language)}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none transition-all"
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
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 text-violet-600 focus:ring-violet-500 bg-slate-950 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors">
                  {getTranslation("rememberMe", language)}
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSignUp ? <UserPlus size={14} /> : <KeyRound size={14} />}
            <span>{isSignUp ? getTranslation("signUp", language) : getTranslation("signIn", language)}</span>
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setUsername("");
              setPassword("");
              setFullName("");
            }}
            className="text-[10px] font-medium text-violet-400 hover:text-violet-300 transition cursor-pointer"
          >
            {isSignUp ? getTranslation("haveAccount", language) : getTranslation("noAccount", language)}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{getTranslation("systemStatus", language)}</span>
        </div>
      </motion.div>
    </div>
  );
}
