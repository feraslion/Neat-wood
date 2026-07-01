import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  DollarSign,
  Briefcase,
  Layers,
  FileText,
  Printer,
  X,
  RefreshCw,
  Info,
  Sliders,
  AlertCircle,
  Package
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { CURRENCIES } from "../types";

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

interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  date: string; // Arabic format like "١/٧/٢٠٢٦" or "1/7/2026"
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  totalAmount: number;
  status: "paid" | "unpaid" | "draft";
  notes?: string;
}

interface AppReportsProps {
  activeCurrencyCode?: string;
  activeProfile?: string;
}

// Arabic Month mapper helper
const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export default function AppReports({ activeCurrencyCode = "SAR", activeProfile = "default" }: AppReportsProps) {
  const getProfileKey = (key: string) => {
    if (!activeProfile || activeProfile === "default") return key;
    return `${activeProfile}_${key}`;
  };

  const activeCurrency = CURRENCIES.find((c) => c.code === activeCurrencyCode) || CURRENCIES[0];

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [profitMargin, setProfitMargin] = useState<number>(40); // default 40% net profit margin
  const [activeTab, setActiveTab] = useState<"monthly" | "annual" | "categories" | "table">("monthly");
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Load data from localStorage on mount and when profile changes
  const loadData = () => {
    const savedInvoices = localStorage.getItem(getProfileKey("workspace_invoices"));
    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices));
      } catch (e) {
        console.error(e);
      }
    } else {
      setInvoices([]);
    }
    const savedInventory = localStorage.getItem(getProfileKey("workspace_inventory"));
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error(e);
      }
    } else {
      setInventory([]);
    }
  };

  useEffect(() => {
    loadData();
    // Add window listener to refresh data when storage changes
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, [activeProfile, activeTab]);

  // Filter paid invoices
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  // Format date parts to parse year and month from Arabic string
  const parseInvoiceDate = (dateStr: string) => {
    // Standardize arabic numerals if any
    const normalized = dateStr
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .trim();
    
    // Parse parts "d/m/yyyy" or "dd/mm/yyyy" or "yyyy-mm-dd"
    const parts = normalized.split(/[\/\-]/);
    if (parts.length === 3) {
      let day = parseInt(parts[0]);
      let month = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // If year is the first part (yyyy/mm/dd)
      if (parts[0].length === 4) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      }
      return { day, month, year };
    }
    return { day: 1, month: 7, year: 2026 }; // default fallback
  };

  // Group invoices by Month for Monthly Chart
  const getMonthlyData = () => {
    const groups: { [key: string]: { revenue: number; profit: number; count: number } } = {};
    
    paidInvoices.forEach((inv) => {
      const { month, year } = parseInvoiceDate(inv.date);
      const key = `${year}-${String(month).padStart(2, "0")}`;
      if (!groups[key]) {
        groups[key] = { revenue: 0, profit: 0, count: 0 };
      }
      // totalAmount is stored in SAR base, convert to active currency
      const revenueConverted = inv.totalAmount * activeCurrency.rate;
      groups[key].revenue += revenueConverted;
      groups[key].profit += revenueConverted * (profitMargin / 100);
      groups[key].count += 1;
    });

    // Convert to sorted array
    const sortedKeys = Object.keys(groups).sort();
    
    // If empty, generate some default months for visual preview
    if (sortedKeys.length === 0) {
      return MONTHS_AR.slice(4, 8).map((name, i) => {
        const rev = (12000 + i * 4500) * activeCurrency.rate;
        return {
          monthKey: `2026-0${5 + i}`,
          monthName: name,
          revenue: Math.round(rev),
          profit: Math.round(rev * (profitMargin / 100)),
          count: 3 + i
        };
      });
    }

    return sortedKeys.map((key) => {
      const [year, month] = key.split("-");
      const monthIdx = parseInt(month) - 1;
      const monthName = `${MONTHS_AR[monthIdx]} ${year}`;
      return {
        monthKey: key,
        monthName,
        revenue: parseFloat(groups[key].revenue.toFixed(2)),
        profit: parseFloat(groups[key].profit.toFixed(2)),
        count: groups[key].count
      };
    });
  };

  // Group invoices by Year for Annual Chart
  const getAnnualData = () => {
    const groups: { [key: string]: { revenue: number; profit: number; count: number } } = {};

    paidInvoices.forEach((inv) => {
      const { year } = parseInvoiceDate(inv.date);
      const key = String(year);
      if (!groups[key]) {
        groups[key] = { revenue: 0, profit: 0, count: 0 };
      }
      const revenueConverted = inv.totalAmount * activeCurrency.rate;
      groups[key].revenue += revenueConverted;
      groups[key].profit += revenueConverted * (profitMargin / 100);
      groups[key].count += 1;
    });

    const sortedKeys = Object.keys(groups).sort();
    
    if (sortedKeys.length === 0) {
      const rev1 = 45000 * activeCurrency.rate;
      const rev2 = 72000 * activeCurrency.rate;
      return [
        { year: "2025", revenue: Math.round(rev1), profit: Math.round(rev1 * (profitMargin / 100)), count: 12 },
        { year: "2026", revenue: Math.round(rev2), profit: Math.round(rev2 * (profitMargin / 100)), count: 18 }
      ];
    }

    return sortedKeys.map((key) => ({
      year: key,
      revenue: parseFloat(groups[key].revenue.toFixed(2)),
      profit: parseFloat(groups[key].profit.toFixed(2)),
      count: groups[key].count
    }));
  };

  // Group by Product Category for Pie Chart
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};

    paidInvoices.forEach((inv) => {
      inv.items.forEach((item) => {
        // Find product category in inventory
        const prod = inventory.find((p) => p.id === item.productId);
        const cat = prod?.category || "عام";
        const itemTotalConverted = (item.price * item.quantity) * activeCurrency.rate;
        categories[cat] = (categories[cat] || 0) + itemTotalConverted;
      });
    });

    const data = Object.keys(categories).map((cat) => ({
      name: cat,
      value: parseFloat(categories[cat].toFixed(2))
    }));

    if (data.length === 0) {
      return [
        { name: "ملحقات", value: 3000 * activeCurrency.rate },
        { name: "شاشات", value: 5500 * activeCurrency.rate },
        { name: "أجهزة لوحية", value: 4200 * activeCurrency.rate },
        { name: "أخرى", value: 1500 * activeCurrency.rate }
      ];
    }

    return data;
  };

  // Calculate Overall Metrics
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount * activeCurrency.rate), 0);
  const totalProfit = totalRevenue * (profitMargin / 100);
  const averageInvoice = paidInvoices.length > 0 ? (totalRevenue / paidInvoices.length) : 0;
  const currentInventoryValue = inventory.reduce((sum, item) => sum + ((item.price * activeCurrency.rate) * item.quantity), 0);

  // Recharts colors
  const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6"];

  const monthlyData = getMonthlyData();
  const annualData = getAnnualData();
  const categoryData = getCategoryData();

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const triggerActualPrint = () => {
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div
      id="app-reports-root"
      className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans select-none overflow-hidden"
      dir="rtl"
    >
      {/* Top Navbar */}
      <div className="flex bg-slate-950/45 border-b border-slate-800/80 p-2 shrink-0 items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "monthly"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp size={13} />
            التقرير الشهري
          </button>
          <button
            onClick={() => setActiveTab("annual")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "annual"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart2 size={13} />
            التحليل السنوي
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "categories"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <PieIcon size={13} />
            توزيع السلع
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "table"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText size={13} />
            جدول البيانات
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Action */}
          <button
            onClick={loadData}
            title="تحديث البيانات"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
          
          {/* PDF Export button */}
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer size={13} />
            <span>تصدير تقرير PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* KPI Summaries Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold">إجمالي الإيرادات المحصلة</span>
            <span className="text-sm font-extrabold text-blue-400 mt-1">
              {totalRevenue.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
            </span>
          </div>
          <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between relative overflow-hidden">
            <span className="text-[10px] text-slate-400 font-bold">صافي الأرباح التقديرية</span>
            <span className="text-sm font-extrabold text-emerald-400 mt-1">
              {totalProfit.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
            </span>
            <span className="absolute top-1 left-2 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-1 py-0.5 rounded font-bold">
              {profitMargin}% هامش
            </span>
          </div>
          <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold">متوسط قيمة الفواتير</span>
            <span className="text-sm font-extrabold text-indigo-400 mt-1">
              {averageInvoice.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
            </span>
          </div>
          <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold">قيمة تقييم المخزون الحالي</span>
            <span className="text-sm font-extrabold text-amber-400 mt-1">
              {currentInventoryValue.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
            </span>
          </div>
        </div>

        {/* Sliders / Margin adjustment panel */}
        <div className="bg-slate-950/20 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-indigo-400" />
            <div>
              <h5 className="text-[11px] font-bold text-slate-200">التحكم في هامش الأرباح الافتراضي</h5>
              <p className="text-[9px] text-slate-500">يتم تعديل قيمة الأرباح المتبقية بناء على تكاليف التشغيل والبضائع</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400">هامش الربح الصافي:</span>
            <input
              type="range"
              min={5}
              max={95}
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseInt(e.target.value))}
              className="w-32 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <span className="text-xs font-bold text-indigo-400 min-w-[28px] text-left">{profitMargin}%</span>
          </div>
        </div>

        {/* Tab 1: Monthly Curve */}
        {activeTab === "monthly" && (
          <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300">منحنى الأداء المالي والمبيعات التقديرية (شهرياً)</h4>
              <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full px-2 py-0.5">
                تدرج الإيرادات والأرباح
              </span>
            </div>
            <div className="h-64 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="monthName" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ fontWeight: "bold", color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name={`الإيرادات (${activeCurrency.symbol})`} stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="profit" name={`الأرباح الصافية (${activeCurrency.symbol})`} stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Annual Performance */}
        {activeTab === "annual" && (
          <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300">مقارنة السنوات المالية الإجمالية</h4>
              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full px-2 py-0.5">
                أداء سنوي مجمع
              </span>
            </div>
            <div className="h-64 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ fontWeight: "bold", color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name={`إجمالي الإيرادات (${activeCurrency.symbol})`} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name={`الأرباح الصافية (${activeCurrency.symbol})`} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Categorical Pie Chart */}
        {activeTab === "categories" && (
          <div className="bg-slate-950/25 border border-slate-850 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-300">توزيع المبيعات المادية على تصنيفات السلع</h4>
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">
                توزيع النسب الإجمالية
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="h-64 w-full text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-slate-400">ملخص حصص الفئات والمخازن:</h5>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {categoryData.map((entry, idx) => {
                    const totalVal = categoryData.reduce((s, d) => s + d.value, 0);
                    const percentage = totalVal > 0 ? ((entry.value / totalVal) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-950/15 rounded">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="font-bold text-slate-200">{entry.name}</span>
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-slate-100">{entry.value.toLocaleString("ar-EG")} {activeCurrency.symbol}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">{percentage}% من المبيعات</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tabular Data */}
        {activeTab === "table" && (
          <div className="bg-slate-950/25 border border-slate-850 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/65 border-b border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">الفترة الزمنية / الشهر</th>
                    <th className="p-3 text-center">عدد الفواتير الكلي</th>
                    <th className="p-3">إجمالي الإيرادات</th>
                    <th className="p-3">الأرباح الصافية التقديرية</th>
                    <th className="p-3 text-center">الحصة من الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-slate-500">
                        <Briefcase size={28} className="mx-auto mb-2 text-slate-600" />
                        لا توجد مبيعات مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    monthlyData.map((item, idx) => {
                      const totalMthVal = monthlyData.reduce((s, d) => s + d.revenue, 0);
                      const mthPercentage = totalMthVal > 0 ? ((item.revenue / totalMthVal) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={idx} className="hover:bg-slate-900/40 transition">
                          <td className="p-3 font-bold text-slate-200">{item.monthName}</td>
                          <td className="p-3 text-center text-slate-400">{item.count} فاتورة</td>
                          <td className="p-3 font-semibold text-blue-400">
                            {item.revenue.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                          </td>
                          <td className="p-3 font-extrabold text-emerald-400">
                            {item.profit.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                          </td>
                          <td className="p-3 text-center font-bold text-indigo-400 font-mono">
                            {mthPercentage}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <footer className="h-9 bg-slate-950/45 border-t border-slate-800/80 flex items-center px-4 shrink-0 text-[10px] text-slate-500 font-medium justify-between">
        <div className="flex items-center gap-1">
          <Info size={11} />
          <span>يتم حساب وتحليل كافة بيانات الفواتير والأرباح تلقائياً بدقة بالغة.</span>
        </div>
        <div>
          <span>نظام التقارير الذكي v1.1.0</span>
        </div>
      </footer>

      {/* Printable Sheet Report modal for PDF export */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="flex justify-between items-center bg-slate-950/60 border-b border-slate-850 p-4 shrink-0">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText size={16} />
                <span className="text-xs font-bold text-slate-200">تقرير الأداء المالي والربحي الموحد</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerActualPrint}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer size={13} />
                  <span>تأكيد الطباعة / حفظ PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Simulated printable report document layout */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900" id="reports-print-sheet" dir="rtl">
              {/* Report Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-300 pb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">مؤسسة الحلول المبتكرة للتقنية</h2>
                  <p className="text-[10px] text-slate-500 mt-1">المملكة العربية السعودية، الرياض</p>
                  <p className="text-[10px] text-slate-500">تقرير الأداء المالي السنوي والربحية التقديرية المجمعة</p>
                </div>

                <div className="text-left">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded text-[9px] font-bold">
                    مستند مالي داخلي سرّي
                  </span>
                  <p className="text-[10px] text-slate-600 mt-2 font-bold">تاريخ المستند: {new Date().toLocaleDateString("ar-EG")}</p>
                  <p className="text-[9px] text-slate-500">العملة النشطة: {activeCurrency.name} ({activeCurrency.symbol})</p>
                </div>
              </div>

              {/* Metrics Summary Blocks */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                  <span className="text-[9px] text-slate-500 font-bold block">إجمالي المبيعات</span>
                  <span className="text-base font-extrabold text-blue-700 block mt-1">
                    {totalRevenue.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                  </span>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                  <span className="text-[9px] text-slate-500 font-bold block">الأرباح الصافية التقديرية</span>
                  <span className="text-base font-extrabold text-emerald-700 block mt-1">
                    {totalProfit.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                  </span>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                  <span className="text-[9px] text-slate-500 font-bold block">متوسط السلة الشرائية</span>
                  <span className="text-base font-extrabold text-indigo-700 block mt-1">
                    {averageInvoice.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                  </span>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                  <span className="text-[9px] text-slate-500 font-bold block">تقييم الأصول بالمستودع</span>
                  <span className="text-base font-extrabold text-amber-700 block mt-1">
                    {currentInventoryValue.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-800 mb-3 border-r-4 border-indigo-600 pr-2">تحليل المبيعات الشهرية المجمعة</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-[10px] border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-l border-slate-200">الفترة الزمنية / الشهر</th>
                        <th className="p-2 text-center border-l border-slate-200">الفواتير المكتملة</th>
                        <th className="p-2 border-l border-slate-200">المبيعات المحققة</th>
                        <th className="p-2">الأرباح التقديرية ({profitMargin}%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {monthlyData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 border-l border-slate-200 font-bold text-slate-800">{item.monthName}</td>
                          <td className="p-2 text-center border-l border-slate-200">{item.count} فواتير ممتازة</td>
                          <td className="p-2 border-l border-slate-200 font-bold text-blue-700">
                            {item.revenue.toLocaleString("ar-EG")} {activeCurrency.symbol}
                          </td>
                          <td className="p-2 font-extrabold text-emerald-700">
                            {item.profit.toLocaleString("ar-EG")} {activeCurrency.symbol}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-800 mb-3 border-r-4 border-emerald-600 pr-2">توزيع المبيعات على تصنيف المواد</h4>
                <div className="grid grid-cols-2 gap-4">
                  {categoryData.map((entry, idx) => {
                    const totalVal = categoryData.reduce((s, d) => s + d.value, 0);
                    const percentage = totalVal > 0 ? ((entry.value / totalVal) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={idx} className="border border-slate-200 p-2 rounded-lg flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-700">{entry.name}</span>
                        <div className="text-left">
                          <span className="font-bold text-slate-950 block">{entry.value.toLocaleString("ar-EG")} {activeCurrency.symbol}</span>
                          <span className="text-[8px] text-slate-500 font-mono block">الحصة: {percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signature section */}
              <div className="flex justify-between items-center pt-12 mt-12 border-t border-slate-200 text-[9px] text-slate-500">
                <div>
                  <span>توقيع المدير المالي:</span>
                  <div className="w-40 h-10 border-b border-dashed border-slate-300 mt-2"></div>
                </div>
                <div className="text-left">
                  <span>توقيع المراجعة والاعتماد:</span>
                  <div className="w-40 h-10 border-b border-dashed border-slate-300 mt-2"></div>
                </div>
              </div>

              <div className="text-center pt-8 text-[8px] text-slate-400">
                تم تصدير وحساب هذا التقرير تلقائياً عبر نظام التحليلات الذكي في مساحة العمل.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
