import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  Search,
  Package,
  AlertTriangle,
  FileDown,
  FileUp,
  TrendingDown,
  RefreshCw,
  Edit3,
  CheckCircle,
  FileText,
  DollarSign,
  Layers,
  Info,
  ChevronDown
} from "lucide-react";
import { FileSystemItem, CURRENCIES } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  minAlert: number;
  description: string;
  category: string;
  updatedAt: string;
}

import { triggerToast } from "../utils/toast";

interface AppInventoryProps {
  activeCurrencyCode?: string;
  activeProfile?: string;
}

export default function AppInventory({ activeCurrencyCode = "SAR", activeProfile = "default" }: AppInventoryProps) {
  const getProfileKey = (key: string) => {
    if (!activeProfile || activeProfile === "default") return key;
    return `${activeProfile}_${key}`;
  };

  const activeCurrency = CURRENCIES.find((c) => c.code === activeCurrencyCode) || CURRENCIES[0];
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(getProfileKey("workspace_inventory"));
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default mock data for inventory
    return [
      {
        id: "inv-1",
        name: "جهاز حاسوب محمول Pro 15",
        quantity: 12,
        price: 4500,
        minAlert: 5,
        description: "أجهزة لابتوب مخصصة للمطورين والمصممين مع معالج حديث وذاكرة 32 جيجابايت",
        category: "أجهزة إلكترونية",
        updatedAt: new Date().toLocaleDateString("ar-EG"),
      },
      {
        id: "inv-2",
        name: "شاشة عرض UltraWide 34",
        quantity: 3,
        price: 1800,
        minAlert: 5,
        description: "شاشات عرض منحنية بدقة 4K تناسب العمل المكتبي والبرمجة",
        category: "ملحقات",
        updatedAt: new Date().toLocaleDateString("ar-EG"),
      },
      {
        id: "inv-3",
        name: "لوحة مفاتيح ميكانيكية لاسلكية",
        quantity: 25,
        price: 350,
        minAlert: 8,
        description: "لوحات مفاتيح هادئة ومريحة للكتابة الطويلة مع إضاءة خلفية",
        category: "ملحقات",
        updatedAt: new Date().toLocaleDateString("ar-EG"),
      },
      {
        id: "inv-4",
        name: "فأرة لاسلكية مريحة MX",
        quantity: 4,
        price: 280,
        minAlert: 6,
        description: "فأرة تدعم التوصيل بمتعدد الأجهزة وسرعة استجابة فائقة",
        category: "ملحقات",
        updatedAt: new Date().toLocaleDateString("ar-EG"),
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<"list" | "add" | "files">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form states for Add/Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(100);
  const [minAlert, setMinAlert] = useState<number>(5);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("عام");

  // Import/Export / Sync Status States
  const [workspaceFiles, setWorkspaceFiles] = useState<FileSystemItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [exportFileName, setExportFileName] = useState("بيانات_المخزون");
  const [selectedFileToImport, setSelectedFileToImport] = useState<string>("");

  useEffect(() => {
    localStorage.setItem(getProfileKey("workspace_inventory"), JSON.stringify(items));
  }, [items]);

  // Load Virtual Files system from localStorage
  const loadWorkspaceFiles = () => {
    const filesRaw = localStorage.getItem(getProfileKey("workspace_files"));
    if (filesRaw) {
      try {
        const parsed: FileSystemItem[] = JSON.parse(filesRaw);
        setWorkspaceFiles(parsed);
      } catch (e) {
        setWorkspaceFiles([]);
      }
    }
  };

  useEffect(() => {
    loadWorkspaceFiles();
  }, [activeTab]);

  const triggerStatus = (text: string, type: "success" | "error" | "info" = "success") => {
    setStatusMessage({ text, type });
    // Sound effect
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(147, audioCtx.currentTime + 0.15); // D3
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      // Ignored if sound is blocked or not supported
    }

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Add or Edit item
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerStatus("يرجى إدخال اسم المنتج أولاً", "error");
      return;
    }

    if (editingId) {
      // Edit mode
      const newQty = Number(quantity);
      const limit = Number(minAlert);
      if (newQty <= limit) {
        triggerToast(`تنبيه: منتج "${name.trim()}" تمت تهيئته بكمية تحت حد الأمان (${newQty} وحدات)`, "warning");
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: name.trim(),
                quantity: newQty,
                price: Number(price) / activeCurrency.rate,
                minAlert: limit,
                description: description.trim(),
                category: category.trim() || "عام",
                updatedAt: new Date().toLocaleDateString("ar-EG"),
              }
            : item
        )
      );
      triggerStatus("تم تعديل المنتج بنجاح!", "success");
      setEditingId(null);
    } else {
      // Add mode
      const newQty = Number(quantity);
      const limit = Number(minAlert);
      if (newQty <= limit) {
        triggerToast(`تنبيه: تمت إضافة منتج "${name.trim()}" وهو تحت حد الأمان المطلوب!`, "warning");
      }
      const newItem: InventoryItem = {
        id: "inv-" + Date.now(),
        name: name.trim(),
        quantity: newQty,
        price: Number(price) / activeCurrency.rate,
        minAlert: limit,
        description: description.trim(),
        category: category.trim() || "عام",
        updatedAt: new Date().toLocaleDateString("ar-EG"),
      };
      setItems((prev) => [newItem, ...prev]);
      triggerStatus("تمت إضافة المنتج بنجاح للمخزون", "success");
    }

    // Reset form
    setName("");
    setQuantity(10);
    setPrice(100);
    setMinAlert(5);
    setDescription("");
    setCategory("عام");
    setActiveTab("list");
  };

  // Select item for editing
  const handleEditClick = (item: InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setPrice(item.price * activeCurrency.rate);
    setMinAlert(item.minAlert);
    setDescription(item.description);
    setCategory(item.category);
    setActiveTab("add");
  };

  // Delete product
  const handleDeleteItem = (id: string, itemName: string) => {
    if (confirm(`هل تريد بالتأكيد حذف المنتج "${itemName}" من المخزون؟`)) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      triggerStatus("تم حذف المنتج من المخزون بنجاح", "info");
    }
  };

  // Increment or Decrement Quantities with quick actions
  const adjustQuantity = (id: string, amount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + amount);
          if (newQty <= item.minAlert && item.quantity > item.minAlert) {
            triggerToast(`تنبيه نفاد المخزون: شارف منتج "${item.name}" على النفاد! الكمية المتبقية: ${newQty}`, "warning");
          }
          return {
            ...item,
            quantity: newQty,
            updatedAt: new Date().toLocaleDateString("ar-EG"),
          };
        }
        return item;
      })
    );
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalValue = items.reduce((sum, item) => sum + (item.price * activeCurrency.rate) * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = items.filter((item) => item.quantity <= item.minAlert).length;
  const uniqueItemsCount = items.length;

  // Categories list
  const categories = Array.from(new Set(items.map((i) => i.category || "عام")));

  // FILE SYSTEM SYNC: Export to file manager (workspace_files)
  const handleExportToFileSystem = () => {
    let finalFileName = exportFileName.trim();
    if (!finalFileName) {
      triggerStatus("يرجى إدخال اسم ملف صالح للتصدير", "error");
      return;
    }
    if (!finalFileName.endsWith(".json")) {
      finalFileName += ".json";
    }

    const jsonString = JSON.stringify(items, null, 2);
    const sizeInBytes = new Blob([jsonString]).size;
    const formattedSize = sizeInBytes > 1024 ? `${(sizeInBytes / 1024).toFixed(1)} KB` : `${sizeInBytes} B`;

    // Read existing files
    const filesRaw = localStorage.getItem(getProfileKey("workspace_files"));
    let currentFiles: FileSystemItem[] = [];
    if (filesRaw) {
      try {
        currentFiles = JSON.parse(filesRaw);
      } catch (e) {
        currentFiles = [];
      }
    }

    // Check if file already exists in root folder (parentId = null)
    const existingFileIndex = currentFiles.findIndex(
      (f) => f.name === finalFileName && f.type === "file" && f.parentId === null
    );

    if (existingFileIndex >= 0) {
      // Update file content
      currentFiles[existingFileIndex].content = jsonString;
      currentFiles[existingFileIndex].size = formattedSize;
      currentFiles[existingFileIndex].createdAt = new Date().toLocaleDateString("ar-EG");
    } else {
      // Add new file
      const newFile: FileSystemItem = {
        id: "file_inv_" + Date.now(),
        name: finalFileName,
        type: "file",
        extension: "json",
        content: jsonString,
        parentId: null,
        size: formattedSize,
        createdAt: new Date().toLocaleDateString("ar-EG"),
      };
      currentFiles.push(newFile);
    }

    localStorage.setItem(getProfileKey("workspace_files"), JSON.stringify(currentFiles));
    setWorkspaceFiles(currentFiles);
    triggerStatus(`تم حفظ وتصدير ملف المخزون بنجاح باسم "${finalFileName}" في مدير الملفات!`, "success");
  };

  // FILE SYSTEM SYNC: Import from file manager
  const handleImportFromFileSystem = () => {
    if (!selectedFileToImport) {
      triggerStatus("يرجى تحديد ملف من القائمة أولاً للاستيراد", "error");
      return;
    }

    const selectedFile = workspaceFiles.find((f) => f.id === selectedFileToImport);
    if (!selectedFile || !selectedFile.content) {
      triggerStatus("الملف المحدد فارغ أو غير موجود", "error");
      return;
    }

    try {
      const parsedData = JSON.parse(selectedFile.content);
      if (Array.isArray(parsedData)) {
        // Validate fields of the first item to ensure it's indeed inventory
        const isValid = parsedData.every(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.quantity === "number" &&
            typeof item.price === "number"
        );

        if (isValid) {
          setItems(parsedData);
          triggerStatus(`تم استيراد ${parsedData.length} منتج بنجاح من ملف "${selectedFile.name}"!`, "success");
          setActiveTab("list");
        } else {
          triggerStatus("تنسيق ملف المخزون غير صحيح! يجب أن يحتوي على الكميات والأسعار بصيغة رقمية.", "error");
        }
      } else {
        triggerStatus("صيغة الملف غير متوافقة مع هيكل بيانات المخزون (يجب أن يكون مصفوفة منتجات).", "error");
      }
    } catch (e) {
      triggerStatus("فشل تحليل الملف. يرجى التحقق من أنه ملف JSON صالح.", "error");
    }
  };

  // Get JSON files in Workspace Files for importing
  const jsonFiles = workspaceFiles.filter(
    (f) => f.type === "file" && (f.name.endsWith(".json") || f.extension === "json")
  );

  return (
    <div
      id="app-inventory-root"
      className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans select-none overflow-hidden"
      dir="rtl"
    >
      {/* Navigation tabs */}
      <div className="flex bg-slate-950/45 border-b border-slate-800/80 p-2 shrink-0 items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => {
              setActiveTab("list");
              setEditingId(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "list"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Package size={13} />
            قائمة المخزون
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "add"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Plus size={13} />
            {editingId ? "تعديل منتج" : "إضافة منتج جديد"}
          </button>
          <button
            onClick={() => {
              setActiveTab("files");
              loadWorkspaceFiles();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "files"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers size={13} />
            الربط مع مدير الملفات
          </button>
        </div>

        {/* Status Message Display */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border flex items-center gap-1.5 shadow-sm max-w-[280px] truncate ${
                statusMessage.type === "success"
                  ? "bg-emerald-950/30 border-emerald-800 text-emerald-400"
                  : statusMessage.type === "error"
                  ? "bg-rose-950/30 border-rose-800 text-rose-400"
                  : "bg-blue-950/30 border-blue-800 text-blue-400"
              }`}
            >
              <CheckCircle size={11} className="shrink-0" />
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Dashboard and Product list */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold">إجمالي القيمة المادية</span>
                <span className="text-sm font-extrabold text-blue-400 mt-1">
                  {totalValue.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
                </span>
              </div>
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold">إجمالي كمية السلع</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1">
                  {totalItemsCount.toLocaleString("ar-EG")} <span className="text-[9px] text-slate-500 font-medium">وحدة</span>
                </span>
              </div>
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold">المنتجات الفريدة</span>
                <span className="text-sm font-extrabold text-indigo-400 mt-1">
                  {uniqueItemsCount.toLocaleString("ar-EG")} <span className="text-[9px] text-slate-500 font-medium">نوع</span>
                </span>
              </div>
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between relative overflow-hidden">
                <span className="text-[10px] text-slate-400 font-bold">سلع منخفضة المخزون</span>
                <span className={`text-sm font-extrabold mt-1 flex items-center gap-1.5 ${
                  lowStockCount > 0 ? "text-amber-400" : "text-slate-400"
                }`}>
                  {lowStockCount.toLocaleString("ar-EG")}
                  {lowStockCount > 0 && <AlertTriangle size={12} className="text-amber-400 animate-pulse" />}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex gap-2 bg-slate-950/20 border border-slate-850 p-2 rounded-xl">
              <div className="relative flex-1">
                <Search size={13} className="absolute right-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="البحث عن منتج، تصنيف، أو وصف في المخزون..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-blue-500 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Category dropdown */}
              <div className="relative min-w-[120px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">كل التصنيفات</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute left-2.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Inventory list table */}
            <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 font-bold">
                    <tr>
                      <th className="p-3">اسم المنتج</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">السعر</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3">إجمالي القيمة</th>
                      <th className="p-3 text-center">التحكم السريع</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/80">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-slate-500">
                          <Package size={28} className="mx-auto mb-2 text-slate-600" />
                          لا توجد منتجات مطابقة في المخزون حالياً.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const isLow = item.quantity <= item.minAlert;
                        const isOut = item.quantity === 0;

                        return (
                          <tr key={item.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-200">{item.name}</div>
                              {item.description && (
                                <div className="text-[10px] text-slate-500 max-w-xs truncate mt-0.5" title={item.description}>
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-800/60 border border-slate-700/40 rounded-full text-[10px] text-slate-400">
                                {item.category || "عام"}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-300">
                              {(item.price * activeCurrency.rate).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500">{activeCurrency.symbol}</span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`font-extrabold ${
                                  isOut ? "text-rose-500" : isLow ? "text-amber-400" : "text-slate-100"
                                }`}>
                                  {item.quantity.toLocaleString("ar-EG")}
                                </span>
                                {isOut ? (
                                  <span className="text-[8px] font-bold text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 mt-1">
                                    نفذت الكمية!
                                  </span>
                                ) : isLow ? (
                                  <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 mt-1">
                                    مخزون منخفض! (حد {item.minAlert})
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="p-3 font-extrabold text-blue-400">
                              {(item.price * activeCurrency.rate * item.quantity).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{" "}
                              <span className="text-[9px] text-slate-500 font-normal">{activeCurrency.symbol}</span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => adjustQuantity(item.id, -1)}
                                  className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center cursor-pointer text-xs"
                                  title="تقليل الكمية بـ 1"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => adjustQuantity(item.id, 1)}
                                  className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded flex items-center justify-center cursor-pointer text-xs"
                                  title="زيادة الكمية بـ 1"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="p-1 text-blue-400 hover:bg-blue-500/10 rounded-md transition cursor-pointer"
                                  title="تعديل تفاصيل المنتج"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
                                  title="حذف المنتج"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Add or Edit product */}
        {activeTab === "add" && (
          <div className="bg-slate-950/35 border border-slate-800/80 p-5 rounded-2xl max-w-xl mx-auto">
            <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Plus size={14} className="text-blue-500" />
              {editingId ? "تعديل بيانات منتج حالي" : "إضافة منتج جديد لدفتر المخازن والأسعار"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">اسم المنتج المالي أو التجاري *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: لوحة مفاتيح ميكانيكية لاسلكية RGB"
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">التصنيف / الفئة</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: ملحقات، أجهزة إلكترونية..."
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Unit Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">السعر الفردي للوحدة ({activeCurrency.symbol}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Initial Quantity */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">الكمية الحالية المتوفرة *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Low stock limit threshold */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">حد تنبيه انخفاض المخزون *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minAlert}
                    onChange={(e) => setMinAlert(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">وصف إضافي وملاحظات فنية</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مواصفات إضافية، الموردين، أو ملاحظات هامة..."
                    rows={3}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setEditingId(null);
                    setActiveTab("list");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition cursor-pointer text-slate-300"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save size={13} />
                  {editingId ? "تحديث بيانات المنتج" : "حفظ وإضافة للمخزن"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: الربط والمزامنة مع ملفات مساحة العمل */}
        {activeTab === "files" && (
          <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Exporting section */}
            <div className="bg-slate-950/35 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-3 mb-3 flex items-center gap-2">
                  <FileDown size={14} className="text-blue-400" />
                  حفظ وتصدير بيانات المخزون
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  يقوم هذا الإجراء بتحويل قائمة المخزون الحالية لملف بترميز JSON وحفظه افتراضياً في المجلد الرئيسي لمدير الملفات. يمكنك استخدامه كنسخة احتياطية أو تحرير البيانات يدوياً هناك.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">اسم الملف المصدر</label>
                    <div className="flex items-center bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-1 text-xs">
                      <input
                        type="text"
                        value={exportFileName}
                        onChange={(e) => setExportFileName(e.target.value)}
                        placeholder="بيانات_المخزون"
                        className="flex-1 bg-transparent text-slate-200 focus:outline-none py-1 text-xs text-left placeholder-slate-600"
                      />
                      <span className="text-slate-500 mr-1 text-[11px] font-mono select-none">.json</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-900/40 mt-4">
                <button
                  onClick={handleExportToFileSystem}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-xl text-white shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  تصدير وحفظ في مدير الملفات
                </button>
              </div>
            </div>

            {/* Importing section */}
            <div className="bg-slate-950/35 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-3 mb-3 flex items-center gap-2">
                  <FileUp size={14} className="text-emerald-400" />
                  استيراد وتحميل بيانات المخزون
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                  يمكنك استرجاع أو تحديث المخزون عبر تحديد ملف بيانات مهيأ بصيغة JSON متوافق مع نظام المخزون من ملفات مساحة العمل الحالية الخاصة بك.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">اختر ملف من مدير الملفات</label>
                    {jsonFiles.length === 0 ? (
                      <div className="bg-slate-950/30 border border-dashed border-slate-800 p-3 rounded-xl text-center text-[10px] text-slate-500">
                        لم يتم العثور على أي ملفات بامتداد .json بمدير الملفات حالياً لتسهيل الاستيراد.
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedFileToImport}
                          onChange={(e) => setSelectedFileToImport(e.target.value)}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="">-- اختر الملف للتحميل منه --</option>
                          {jsonFiles.map((file) => (
                            <option key={file.id} value={file.id}>
                              {file.name} ({file.size || "حجم مجهول"})
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={11} className="absolute left-2.5 top-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-900/40 mt-4">
                <button
                  onClick={handleImportFromFileSystem}
                  disabled={!selectedFileToImport}
                  className={`w-full py-2 px-4 text-xs font-bold rounded-xl text-white shadow-sm transition flex items-center justify-center gap-1.5 ${
                    selectedFileToImport
                      ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw size={14} className={selectedFileToImport ? "animate-spin-slow" : ""} />
                  استيراد وتحديث قائمة المخازن
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <footer className="h-9 bg-slate-950/45 border-t border-slate-800/80 flex items-center px-4 shrink-0 text-[10px] text-slate-500 font-medium justify-between">
        <div className="flex items-center gap-1">
          <Info size={11} />
          <span>يتم حفظ وتحديث كافة البيانات تلقائياً في ذاكرة المتصفح المحلية.</span>
        </div>
        <div>
          <span>نظام المخازن والأسعار v1.1.0</span>
        </div>
      </footer>
    </div>
  );
}
