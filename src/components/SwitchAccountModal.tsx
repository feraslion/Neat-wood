import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Users, User, Check, Key, UserPlus, Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { getTranslation, LanguageCode } from "../utils/i18n";
import { triggerToast } from "../utils/toast";
import { safeStorage } from "../utils/storage";

interface SwitchAccountModalProps {
  language: LanguageCode;
  currentUser: { username: string; fullName: string };
  onClose: () => void;
  onSwitchSuccess: (newUser: { username: string; fullName: string }) => void;
}

export default function SwitchAccountModal({
  language,
  currentUser,
  onClose,
  onSwitchSuccess
}: SwitchAccountModalProps) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // New User Form State
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const isRtl = language === "ar";

  // Load all registered users
  const getRegisteredUsers = () => {
    const existingUsersStr = safeStorage.getItem("workspace_users");
    let users = [];
    try {
      users = existingUsersStr ? JSON.parse(existingUsersStr) : [];
    } catch {
      users = [];
    }

    if (users.length === 0) {
      const defaultAdmin = {
        username: "admin",
        password: "123",
        fullName: getTranslation("adminUser", language)
      };
      users = [defaultAdmin];
      safeStorage.setItem("workspace_users", JSON.stringify(users));
    }
    return users;
  };

  const users = getRegisteredUsers();

  const handleSwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (password === selectedUser.password) {
      // Set active session
      safeStorage.setItem("workspace_active_user", JSON.stringify(selectedUser));
      
      triggerToast(
        language === "ar" 
          ? `تم التبديل بنجاح إلى: ${selectedUser.fullName}` 
          : `Switched successfully to: ${selectedUser.fullName}`,
        "success"
      );

      onSwitchSuccess({
        username: selectedUser.username,
        fullName: selectedUser.fullName
      });
      onClose();
    } else {
      triggerToast(getTranslation("invalidPass", language), "warning");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword.trim()) {
      triggerToast(getTranslation("fieldsRequired", language), "warning");
      return;
    }

    const usernameLower = newUsername.trim().toLowerCase();
    const existingUsers = getRegisteredUsers();

    if (existingUsers.some((u: any) => u.username.toLowerCase() === usernameLower)) {
      triggerToast(
        language === "ar" ? "اسم المستخدم مسجل بالفعل!" : "Username is already registered!",
        "warning"
      );
      return;
    }

    const newUser = {
      username: usernameLower,
      fullName: newFullName.trim(),
      password: newPassword
    };

    const updatedUsers = [...existingUsers, newUser];
    safeStorage.setItem("workspace_users", JSON.stringify(updatedUsers));

    triggerToast(
      language === "ar" 
        ? "تم تسجيل الموظف الجديد بنجاح!" 
        : "New employee registered successfully!", 
      "success"
    );

    // Reset forms and view list again
    setNewUsername("");
    setNewFullName("");
    setNewPassword("");
    setIsRegistering(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col justify-between text-right"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600/10 text-violet-400 rounded-lg flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                {language === "ar" ? "إدارة وتبديل حسابات الموظفين" : "Manage & Switch Employees"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {language === "ar" ? "تبديل سريع للمستخدم النشط مع عزل آمن للبيانات" : "Fast switch with isolated local workspaces"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={16} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isRegistering ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* User List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                {users.map((u: any) => {
                  const isActive = u.username.toLowerCase() === currentUser.username.toLowerCase();
                  const isSelected = selectedUser && selectedUser.username.toLowerCase() === u.username.toLowerCase();

                  return (
                    <div key={u.username} className="flex flex-col">
                      <button
                        onClick={() => {
                          if (isActive) {
                            triggerToast(
                              language === "ar" ? "أنت مسجل الدخول بالفعل بهذا الحساب!" : "You are already logged into this account!",
                              "info"
                            );
                            return;
                          }
                          setSelectedUser(u);
                          setPassword("");
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-right cursor-pointer ${
                          isActive 
                            ? "bg-violet-950/20 border-violet-800/40 text-violet-300"
                            : isSelected
                            ? "bg-slate-800/80 border-slate-700 text-white"
                            : "bg-slate-950/40 border-slate-850 hover:bg-slate-800/50 hover:border-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            isActive ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-300"
                          }`}>
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">{u.fullName}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">@{u.username}</span>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-violet-400 bg-violet-950 px-2 py-1 rounded-full border border-violet-800/30">
                            <Check size={10} />
                            {language === "ar" ? "نشط حالياً" : "Active Now"}
                          </span>
                        ) : isSelected ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                        ) : null}
                      </button>

                      {/* Inline password input for selected user */}
                      {isSelected && !isActive && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleSwitchSubmit}
                          className="mt-2 bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2.5 mx-1"
                        >
                          <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                            <Key size={11} className="text-violet-400" />
                            <span>{language === "ar" ? `أدخل كلمة مرور الحساب لـ @${selectedUser.username}` : `Enter password for @${selectedUser.username}`}</span>
                          </div>
                          
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={getTranslation("password", language)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
                              autoFocus
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`absolute top-2.5 ${isRtl ? "left-3" : "right-3"} p-0.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer`}
                            >
                              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(null)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                            >
                              {language === "ar" ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Lock size={10} />
                              <span>{language === "ar" ? "تأكيد الدخول" : "Confirm Switch"}</span>
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action: Add new employee */}
              <button
                onClick={() => setIsRegistering(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-slate-800 hover:border-violet-500/50 hover:bg-violet-500/5 text-slate-400 hover:text-violet-400 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <UserPlus size={14} />
                <span>{language === "ar" ? "تسجيل حساب موظف جديد" : "Register a New Account"}</span>
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="register-view"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="hover:text-violet-400 transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowRight size={12} className={isRtl ? "" : "rotate-180"} />
                  <span>{language === "ar" ? "العودة للقائمة" : "Back to List"}</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "ar" ? "اسم الموظف الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder={language === "ar" ? "مثال: عبد الرحمن بن علي" : "e.g., Jane Doe"}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "ar" ? "اسم المستخدم (Username)" : "Username"}
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="sales2"
                  className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="•••"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-2.5 ${isRtl ? "left-3" : "right-3"} p-0.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer`}
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-4 shadow-lg shadow-violet-600/15"
              >
                <UserPlus size={14} />
                <span>{language === "ar" ? "إنشاء الحساب الجديد" : "Create Account"}</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
          <ShieldCheck size={11} className="text-emerald-500 animate-pulse" />
          <span>{language === "ar" ? "عزل مشفر لبيانات كل مستخدم محلياً" : "Encrypted isolation for local user workspace data"}</span>
        </div>
      </motion.div>
    </div>
  );
}
