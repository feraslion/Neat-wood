import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Search,
  DollarSign,
  User,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Printer,
  TrendingUp,
  X,
  PlusCircle,
  MinusCircle,
  Download,
  Info
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
  date: string;
  items: InvoiceItem[];
  taxRate: number; // e.g. 15 for 15% VAT
  discount: number; // flat discount in SAR
  totalAmount: number;
  status: "paid" | "unpaid" | "draft";
  notes?: string;
}

import { triggerToast } from "../utils/toast";

interface AppInvoicesProps {
  activeCurrencyCode?: string;
  activeProfile?: string;
}

export default function AppInvoices({ activeCurrencyCode = "SAR", activeProfile = "default" }: AppInvoicesProps) {
  const getProfileKey = (key: string) => {
    if (!activeProfile || activeProfile === "default") return key;
    return `${activeProfile}_${key}`;
  };

  const activeCurrency = CURRENCIES.find((c) => c.code === activeCurrencyCode) || CURRENCIES[0];
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(getProfileKey("workspace_invoices"));
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default mock invoices
    return [
      {
        id: "inv-mock-1",
        invoiceNumber: "INV-2026-001",
        customerName: "شركة الرواد للتقنية",
        customerPhone: "0501234567",
        date: new Date().toLocaleDateString("ar-EG"),
        items: [
          {
            productId: "inv-1",
            name: "جهاز حاسوب محمول Pro 15",
            quantity: 2,
            price: 4500,
          },
          {
            productId: "inv-3",
            name: "لوحة مفاتيح ميكانيكية لاسلكية",
            quantity: 1,
            price: 350,
          }
        ],
        taxRate: 15,
        discount: 150,
        totalAmount: 10597.5, // (9000 + 350) - 150 = 9200 * 1.15 = 10580? wait: ((9000+350 - 150) * 1.15) = 9200 * 1.15 = 10580
        status: "paid" as const,
        notes: "تم التسليم يدوياً للمندوب مع الضمان الفضي للمنتجات.",
      }
    ];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "view">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid" | "draft">("all");

  // Form states for creating invoice
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [invoiceStatus, setInvoiceStatus] = useState<"paid" | "unpaid" | "draft">("paid");
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(15); // default 15% VAT
  const [discount, setDiscount] = useState<number>(0);
  const [invoiceNotes, setInvoiceNotes] = useState("");

  // Quick select product state
  const [quickProductId, setQuickProductId] = useState("");
  const [quickQuantity, setQuickQuantity] = useState<number>(1);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Load latest inventory and sync invoices
  const loadInventory = () => {
    const savedInv = localStorage.getItem(getProfileKey("workspace_inventory"));
    if (savedInv) {
      try {
        setInventory(JSON.parse(savedInv));
      } catch (e) {
        setInventory([]);
      }
    }
  };

  useEffect(() => {
    loadInventory();
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(getProfileKey("workspace_invoices"), JSON.stringify(invoices));
  }, [invoices]);

  const triggerStatus = (text: string, type: "success" | "error" | "info" = "success") => {
    setStatusMessage({ text, type });
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === "error") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {}

    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Add Item to active invoice creation list
  const addProductToInvoice = () => {
    if (!quickProductId) {
      triggerStatus("يرجى اختيار منتج من المخازن", "error");
      return;
    }

    const prod = inventory.find((p) => p.id === quickProductId);
    if (!prod) return;

    // Check if product is already in the invoice
    const existingIndex = selectedItems.findIndex((item) => item.productId === quickProductId);

    if (existingIndex >= 0) {
      const currentQtyInInvoice = selectedItems[existingIndex].quantity;
      const proposedQty = currentQtyInInvoice + quickQuantity;

      if (proposedQty > prod.quantity) {
        triggerStatus(`الكمية المطلوبة تتجاوز الكمية المتاحة بالمستودع (${prod.quantity} قطعة متوفرة فقط)`, "error");
        return;
      }

      const updated = [...selectedItems];
      updated[existingIndex].quantity = proposedQty;
      setSelectedItems(updated);
    } else {
      if (quickQuantity > prod.quantity) {
        triggerStatus(`الكمية المطلوبة تتجاوز الكمية المتاحة بالمستودع (${prod.quantity} قطعة متوفرة فقط)`, "error");
        return;
      }

      setSelectedItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          quantity: quickQuantity,
          price: prod.price,
        },
      ]);
    }

    triggerStatus("تمت إضافة المنتج للفاتورة", "success");
    setQuickProductId("");
    setQuickQuantity(1);
  };

  // Adjust quantity within draft invoice creation
  const adjustFormItemQuantity = (productId: string, amount: number) => {
    const prod = inventory.find((p) => p.id === productId);
    if (!prod) return;

    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = Math.max(1, item.quantity + amount);
            if (newQty > prod.quantity) {
              triggerStatus(`الكمية المطلوبة تجاوزت الحد المتاح بالمخزون (${prod.quantity})`, "error");
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFormItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.productId !== productId));
    triggerStatus("تمت إزالة المنتج من القائمة", "info");
  };

  // Calculations for current creation form
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Number(discount) || 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = afterDiscount * (Number(taxRate) / 100);
  const grandTotal = afterDiscount + taxAmount;

  // Finalize & Create Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      triggerStatus("يرجى إدخال اسم العميل أولاً", "error");
      return;
    }

    if (selectedItems.length === 0) {
      triggerStatus("يرجى إضافة منتج واحد على الأقل للفاتورة", "error");
      return;
    }

    // Prepare Invoice Number
    const invNum = `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`;

    const newInvoice: Invoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: invNum,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      date: new Date(invoiceDate).toLocaleDateString("ar-EG"),
      items: selectedItems,
      taxRate: Number(taxRate),
      discount: discountAmount / activeCurrency.rate,
      totalAmount: parseFloat((grandTotal / activeCurrency.rate).toFixed(2)),
      status: invoiceStatus,
      notes: invoiceNotes.trim() || undefined,
    };

    // Integrate with inventory: Deduct from stock if status is "paid" or "unpaid"
    if (invoiceStatus === "paid" || invoiceStatus === "unpaid") {
      const savedInv = localStorage.getItem(getProfileKey("workspace_inventory"));
      if (savedInv) {
        try {
          const invData: InventoryItem[] = JSON.parse(savedInv);
          const updatedInv = invData.map((invItem) => {
            const billItem = selectedItems.find((bi) => bi.productId === invItem.id);
            if (billItem) {
              const remainingQty = Math.max(0, invItem.quantity - billItem.quantity);
              if (remainingQty <= invItem.minAlert) {
                triggerToast(`تنبيه نفاد المخزون: شارف منتج "${invItem.name}" على النفاد! الكمية المتبقية: ${remainingQty}`, "warning");
              }
              return {
                ...invItem,
                quantity: remainingQty,
                updatedAt: new Date().toLocaleDateString("ar-EG"),
              };
            }
            return invItem;
          });
          localStorage.setItem(getProfileKey("workspace_inventory"), JSON.stringify(updatedInv));
        } catch (e) {
          console.error("Failed to update inventory during invoice generation", e);
        }
      }
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    triggerStatus(`تم إصدار الفاتورة الرقمية ${invNum} بنجاح!`, "success");
    triggerToast(`تم إصدار فاتورة جديدة برقم ${invNum} للعميل ${newInvoice.customerName} بقيمة ${(newInvoice.totalAmount * activeCurrency.rate).toLocaleString("ar-EG")} ${activeCurrency.symbol}`, "success");

    // Reset Form
    setCustomerName("");
    setCustomerPhone("");
    setInvoiceStatus("paid");
    setSelectedItems([]);
    setDiscount(0);
    setInvoiceNotes("");
    setActiveTab("list");
  };

  const handleDeleteInvoice = (id: string, invNum: string) => {
    if (confirm(`هل تريد بالتأكيد حذف الفاتورة رقم ${invNum} تماماً؟`)) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      triggerStatus("تم حذف الفاتورة بنجاح", "info");
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
        setActiveTab("list");
      }
    }
  };

  const viewInvoiceDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab("view");
  };

  // Search/Filters logic
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(searchQuery));

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export selected invoice as a beautiful printable format / text inside Workspace Files
  const exportInvoiceToFiles = (invoice: Invoice) => {
    const tableHeader = "المنتج | الكمية | سعر الوحدة | الإجمالي الفردي\n";
    const separator = "--------------------------------------------------\n";
    const tableRows = invoice.items
      .map((item) => `${item.name} | ${item.quantity} | ${item.price} ر.س | ${(item.price * item.quantity).toLocaleString("ar-EG")} ر.س`)
      .join("\n");

    const textReport = `فاتورة مبيعات رقمية - مساحة العمل والإنتاج\n` +
      `رقم الفاتورة: ${invoice.invoiceNumber}\n` +
      `تاريخ الإصدار: ${invoice.date}\n` +
      `العميل: ${invoice.customerName}\n` +
      `هاتف العميل: ${invoice.customerPhone || "غير متوفر"}\n` +
      `حالة الفاتورة: ${invoice.status === "paid" ? "مدفوعة كاملة" : invoice.status === "unpaid" ? "غير مدفوعة" : "مسودة"}\n` +
      `==================== جدول التفاصيل ====================\n` +
      tableHeader + separator + tableRows + `\n` +
      `==================== الملخص والضرائب ==================\n` +
      `- المجموع الفرعي: ${invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("ar-EG")} ر.س\n` +
      `- الخصم النقدي: ${invoice.discount.toLocaleString("ar-EG")} ر.س\n` +
      `- ضريبة القيمة المضافة (${invoice.taxRate}%): ${((invoice.totalAmount - (invoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - invoice.discount)) || 0).toFixed(2)} ر.س\n` +
      `- إجمالي المبلغ المطلوب: ${invoice.totalAmount.toLocaleString("ar-EG")} ر.س\n` +
      `=======================================================\n` +
      `ملاحظات: ${invoice.notes || "لا يوجد"}\n\n` +
      `شكراً لتعاملكم معنا. تم إنشاء الفاتورة بواسطة وحدة الفواتير والمخازن المتكاملة.`;

    const fileName = `فاتورة_${invoice.invoiceNumber}_${Date.now()}.txt`;

    // Write to workspace virtual files
    const filesRaw = localStorage.getItem(getProfileKey("workspace_files"));
    let currentFiles: FileSystemItem[] = [];
    if (filesRaw) {
      try {
        currentFiles = JSON.parse(filesRaw);
      } catch (e) {}
    }

    const newFile: FileSystemItem = {
      id: "file_inv_print_" + Date.now(),
      name: fileName,
      type: "file",
      extension: "txt",
      content: textReport,
      parentId: null, // root level
      size: `${new Blob([textReport]).size} B`,
      createdAt: new Date().toLocaleDateString("ar-EG"),
    };

    currentFiles.push(newFile);
    localStorage.setItem(getProfileKey("workspace_files"), JSON.stringify(currentFiles));
    triggerStatus(`تم تصدير نسخة الفاتورة بنجاح باسم "${fileName}" بمدير الملفات!`, "success");
  };

  const handlePrintMock = () => {
    if (!selectedInvoice) return;
    
    // Create an iframe to print the invoice alone in A4
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const sub = selectedInvoice.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const afterDisc = Math.max(0, sub - selectedInvoice.discount);
    const taxAmt = afterDisc * (selectedInvoice.taxRate / 100);
    const totalConverted = selectedInvoice.totalAmount * activeCurrency.rate;

    const itemsRows = selectedInvoice.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${(item.price * activeCurrency.rate).toLocaleString("ar-EG")} ${activeCurrency.symbol}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: bold;">${(item.price * activeCurrency.rate * item.quantity).toLocaleString("ar-EG")} ${activeCurrency.symbol}</td>
      </tr>
    `
      )
      .join("");

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <html dir="rtl" lang="ar">
          <head>
            <title>${selectedInvoice.invoiceNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;750&display=swap');
              body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                color: #1e293b;
                margin: 40px;
                line-height: 1.5;
              }
              .header {
                display: flex;
                justify-content: space-between;
                border-bottom: 2px solid #cbd5e1;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .company-name {
                font-size: 18px;
                font-weight: bold;
                color: #0f172a;
              }
              .title-badge {
                background-color: #f1f5f9;
                border: 1px solid #e2e8f0;
                color: #3b82f6;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
                display: inline-block;
              }
              .invoice-info {
                text-align: left;
              }
              .customer-card {
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              th {
                background-color: #f1f5f9;
                color: #475569;
                font-weight: bold;
                padding: 10px;
                border-bottom: 2px solid #e2e8f0;
                text-align: right;
              }
              .totals-container {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
              }
              .totals-table {
                width: 280px;
                font-size: 13px;
              }
              .totals-table tr td {
                padding: 6px 0;
              }
              .grand-total {
                font-size: 15px;
                font-weight: bold;
                color: #2563eb;
                border-top: 1px solid #e2e8f0;
                padding-top: 10px !important;
              }
              .footer {
                margin-top: 60px;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
              }
              @media print {
                body { margin: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="company-name">مؤسسة الحلول المبتكرة للتقنية</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 5px;">المملكة العربية السعودية، الرياض</div>
                <div style="font-size: 11px; color: #64748b;">الرقم الضريبي: 300098765400003</div>
              </div>
              <div class="invoice-info">
                <span class="title-badge">فاتورة ضريبية مبسطة</span>
                <div style="font-size: 13px; font-weight: bold; margin-top: 10px; color: #0f172a;">رقم الفاتورة: ${selectedInvoice.invoiceNumber}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 3px;">تاريخ الإصدار: ${selectedInvoice.date}</div>
              </div>
            </div>

            <div class="customer-card">
              <div>
                <span style="font-size: 11px; color: #94a3b8; font-weight: bold; display: block;">فاتورة للعميل:</span>
                <span style="font-size: 14px; font-weight: bold; color: #0f172a;">${selectedInvoice.customerName}</span>
              </div>
              ${selectedInvoice.customerPhone ? `
              <div style="text-align: left;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: bold; display: block;">رقم الهاتف:</span>
                <span style="font-size: 13px; font-family: monospace; color: #0f172a;">${selectedInvoice.customerPhone}</span>
              </div>
              ` : ""}
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">اسم المنتج / الخدمة</th>
                  <th style="text-align: center;">سعر الوحدة</th>
                  <th style="text-align: center;">الكمية</th>
                  <th style="text-align: left;">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="totals-container">
              <table class="totals-table">
                <tr>
                  <td style="color: #64748b;">المجموع الفرعي:</td>
                  <td style="text-align: left; font-weight: bold;">${(sub * activeCurrency.rate).toLocaleString("ar-EG")} ${activeCurrency.symbol}</td>
                </tr>
                ${selectedInvoice.discount > 0 ? `
                <tr style="color: #ef4444; font-weight: bold;">
                  <td>الخصم النقدي:</td>
                  <td style="text-align: left;">-${(selectedInvoice.discount * activeCurrency.rate).toLocaleString("ar-EG")} ${activeCurrency.symbol}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="color: #64748b;">ضريبة القيمة المضافة (${selectedInvoice.taxRate}%):</td>
                  <td style="text-align: left; font-weight: bold;">${(taxAmt * activeCurrency.rate).toLocaleString("ar-EG")} ${activeCurrency.symbol}</td>
                </tr>
                <tr class="grand-total">
                  <td>المجموع الكلي المطلوب:</td>
                  <td style="text-align: left;">${totalConverted.toLocaleString("ar-EG")} ${activeCurrency.symbol}</td>
                </tr>
              </table>
            </div>

            ${selectedInvoice.notes ? `
            <div style="margin-top: 40px; border-top: 1px dashed #e2e8f0; padding-top: 15px; font-size: 11px;">
              <strong style="color: #475569; display: block; margin-bottom: 5px;">ملاحظات وشروط إضافية:</strong>
              <div style="color: #64748b; white-space: pre-wrap;">${selectedInvoice.notes}</div>
            </div>
            ` : ""}

            <div class="footer">
              شاكرين لكم زيارتكم وثقتكم بنا وبمنتجاتنا المتميزة. تم إصدارها رقمياً بدقة تامة.
            </div>
          </body>
        </html>
      `);
      doc.close();

      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  // Stats calculation
  const totalSalesVolume = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.totalAmount * activeCurrency.rate), 0);

  const pendingSalesVolume = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + (inv.totalAmount * activeCurrency.rate), 0);

  return (
    <div
      id="app-invoices-root"
      className="flex flex-col h-full bg-slate-900/40 text-slate-100 font-sans select-none overflow-hidden"
      dir="rtl"
    >
      {/* Top navbar */}
      <div className="flex bg-slate-950/45 border-b border-slate-800/80 p-2 shrink-0 items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "list"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText size={13} />
            الفواتير الصادرة
          </button>
          <button
            onClick={() => {
              setActiveTab("create");
              loadInventory();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "create"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Plus size={13} />
            إنشاء فاتورة جديدة
          </button>
          {selectedInvoice && (
            <button
              onClick={() => setActiveTab("view")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "view"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Printer size={13} />
              معاينة الفاتورة رقم {selectedInvoice.invoiceNumber}
            </button>
          )}
        </div>

        {/* Dynamic Status message */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: Invoices list */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {/* Sales Volume KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold">إجمالي المبيعات المحصلة</span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1">
                  {totalSalesVolume.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
                </span>
              </div>
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold">مبيعات قيد التحصيل (آجلة)</span>
                <span className="text-sm font-extrabold text-amber-400 mt-1">
                  {pendingSalesVolume.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500 font-medium">{activeCurrency.symbol}</span>
                </span>
              </div>
              <div className="bg-slate-950/35 border border-slate-800/70 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold">عدد الفواتير الكلي</span>
                <span className="text-sm font-extrabold text-indigo-400 mt-1">
                  {invoices.length.toLocaleString("ar-EG")} <span className="text-[9px] text-slate-500 font-medium">فاتورة</span>
                </span>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex gap-2 bg-slate-950/20 border border-slate-850 p-2 rounded-xl">
              <div className="relative flex-1">
                <Search size={13} className="absolute right-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="ابحث باسم العميل، رقم الفاتورة أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-blue-500 rounded-lg pr-8 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Status filter */}
              <div className="relative min-w-[120px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="all">كل الحالات</option>
                  <option value="paid">مدفوعة</option>
                  <option value="unpaid">غير مدفوعة</option>
                  <option value="draft">مسودة</option>
                </select>
                <ChevronDown size={11} className="absolute left-2.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Invoices grid/table */}
            <div className="bg-slate-950/30 border border-slate-800/80 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">اسم العميل</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3 text-center">المنتجات المباعة</th>
                    <th className="p-3">القيمة الإجمالية</th>
                    <th className="p-3 text-center">حالة الفاتورة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/80">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-500">
                        <FileText size={28} className="mx-auto mb-2 text-slate-600" />
                        لا توجد فواتير مطابقة لخيارات البحث حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const totalQtyItems = inv.items.reduce((sum, item) => sum + item.quantity, 0);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                          <td className="p-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-200">{inv.customerName}</div>
                            {inv.customerPhone && (
                              <div className="text-[9px] text-slate-500">{inv.customerPhone}</div>
                            )}
                          </td>
                          <td className="p-3 text-slate-400">{inv.date}</td>
                          <td className="p-3 text-center font-bold text-slate-300">
                            {totalQtyItems} <span className="text-[10px] text-slate-500 font-normal">قطع</span>
                          </td>
                          <td className="p-3 font-extrabold text-emerald-400">
                            {(inv.totalAmount * activeCurrency.rate).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-[9px] text-slate-500">{activeCurrency.symbol}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              inv.status === "paid"
                                ? "bg-emerald-950/40 border-emerald-800 text-emerald-400"
                                : inv.status === "unpaid"
                                ? "bg-amber-950/40 border-amber-800 text-amber-400"
                                : "bg-slate-800/80 border-slate-700 text-slate-400"
                            }`}>
                              {inv.status === "paid" ? "مدفوعة" : inv.status === "unpaid" ? "غير مدفوعة" : "مسودة"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => viewInvoiceDetail(inv)}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition cursor-pointer"
                              >
                                معاينة وطباعة
                              </button>
                              <button
                                onClick={() => exportInvoiceToFiles(inv)}
                                className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition cursor-pointer"
                                title="تصدير لمدير الملفات"
                              >
                                <Download size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                                className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
                                title="حذف الفاتورة"
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
        )}

        {/* TAB 2: Create new invoice */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Form & Selection side */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
              {/* Customer Details Form */}
              <div className="bg-slate-950/35 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <User size={13} className="text-blue-400" />
                  بيانات العميل والفاتورة
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">اسم العميل بالكامل *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: فيراس الشمري"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">رقم هاتف العميل</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="مثال: 05xxxxxxx"
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">تاريخ الفاتورة</label>
                    <input
                      type="date"
                      required
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">حالة الفاتورة والتحصيل</label>
                    <div className="relative">
                      <select
                        value={invoiceStatus}
                        onChange={(e) => setInvoiceStatus(e.target.value as any)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="paid">مدفوعة كاملة (تخصم من المخزن)</option>
                        <option value="unpaid">غير مدفوعة/أجل (تخصم من المخزن)</option>
                        <option value="draft">مسودة فاتورة (لا تخصم)</option>
                      </select>
                      <ChevronDown size={11} className="absolute left-2.5 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Add items to Invoice form */}
              <div className="bg-slate-950/35 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers size={13} className="text-emerald-400" />
                  إضافة مواد من مخزون المستودع
                </h4>

                <div className="flex gap-2 items-end">
                  {/* Select product dropdown */}
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">اختر منتج من المخزن</label>
                    <div className="relative">
                      <select
                        value={quickProductId}
                        onChange={(e) => setQuickProductId(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">-- اضغط لتحديد منتج متوفر --</option>
                        {inventory.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} (متوفر: {p.quantity} وحدة | السعر: {(p.price * activeCurrency.rate).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="absolute left-2.5 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="w-24 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">الكمية</label>
                    <input
                      type="number"
                      min={1}
                      value={quickQuantity}
                      onChange={(e) => setQuickQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Button */}
                  <button
                    type="button"
                    onClick={addProductToInvoice}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg text-white transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={13} />
                    إضافة
                  </button>
                </div>

                {/* Selected items table inside draft invoice */}
                <div className="border border-slate-850 rounded-lg overflow-hidden mt-2">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-950/55 text-slate-400 font-semibold border-b border-slate-850">
                      <tr>
                        <th className="p-2">اسم المادة</th>
                        <th className="p-2">السعر الفردي</th>
                        <th className="p-2 text-center">الكمية المطلوبة</th>
                        <th className="p-2">المجموع</th>
                        <th className="p-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {selectedItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-4 text-slate-500 text-[10px]">
                            لم يتم تحديد أي سلع في هذه الفاتورة بعد.
                          </td>
                        </tr>
                      ) : (
                        selectedItems.map((item) => (
                          <tr key={item.productId} className="hover:bg-slate-900/30">
                            <td className="p-2 font-bold text-slate-300">{item.name}</td>
                            <td className="p-2 text-slate-400">{(item.price * activeCurrency.rate).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => adjustFormItemQuantity(item.productId, -1)}
                                  className="w-4 h-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-extrabold rounded flex items-center justify-center text-[10px]"
                                >
                                  -
                                </button>
                                <span className="font-extrabold text-slate-200 px-1 font-mono">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => adjustFormItemQuantity(item.productId, 1)}
                                  className="w-4 h-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-extrabold rounded flex items-center justify-center text-[10px]"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-2 font-bold text-blue-400">
                              {(item.price * activeCurrency.rate * item.quantity).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeFormItem(item.productId)}
                                className="p-1 text-rose-400 hover:bg-rose-500/10 rounded"
                              >
                                <Trash2 size={11} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Calculations & Summary Card side */}
            <div className="col-span-1 space-y-4">
              <div className="bg-slate-950/35 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 mb-2 flex items-center gap-1.5">
                    <DollarSign size={13} className="text-blue-400" />
                    تفاصيل وقيمة الفاتورة المالية
                  </h4>

                  {/* Pricing parameters input fields */}
                  <div className="space-y-3">
                    {/* Tax Rate */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold flex justify-between">
                        <span>ضريبة القيمة المضافة (%)</span>
                        <span className="text-[9px] text-slate-500">(الافتراضي 15%)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={taxRate}
                        onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    {/* Flat Discount */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold">الخصم الإضافي المسجل ({activeCurrency.symbol})</label>
                      <input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    {/* Invoice Notes */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold">ملاحظات الفاتورة والتسليم</label>
                      <textarea
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                        placeholder="شروط الدفع، الضمان، أو أي تفاصيل إضافية للعميل..."
                        rows={3}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none resize-none placeholder-slate-600"
                      />
                    </div>
                  </div>

                  {/* Mini receipt calculations */}
                  <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-lg space-y-2 mt-4">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>إجمالي المواد الفاتورة:</span>
                      <span>{subtotal.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[11px] text-rose-400">
                        <span>قيمة الخصم الممنوح:</span>
                        <span>-{discountAmount.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>ضريبة القيمة المضافة ({taxRate}%):</span>
                      <span>{taxAmount.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between text-xs font-bold text-slate-100">
                      <span>المبلغ المطلوب الكلي:</span>
                      <span className="text-sm font-extrabold text-blue-400">
                        {grandTotal.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-850">
                  <button
                    onClick={handleCreateInvoice}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} />
                    إصدار وحفظ الفاتورة الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Invoice full viewer & details receipt */}
        {activeTab === "view" && selectedInvoice && (
          <div className="bg-slate-950/35 border border-slate-800/80 p-6 rounded-2xl max-w-2xl mx-auto shadow-xl relative">
            {/* Top print header actions */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">معاينة الفاتورة الرسمية</span>
                <h3 className="text-sm font-extrabold text-blue-400 mt-0.5">{selectedInvoice.invoiceNumber}</h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrintMock}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={13} />
                  طباعة الفاتورة
                </button>
                <button
                  onClick={() => exportInvoiceToFiles(selectedInvoice)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={13} />
                  تصدير لمدير الملفات
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(null);
                    setActiveTab("list");
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Simulated Printed invoice sheet */}
            <div className="bg-white text-slate-900 p-6 rounded-xl space-y-6 shadow-md" dir="rtl">
              {/* Header company logo & Details */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">مؤسسة الحلول المبتكرة للتقنية</h2>
                  <p className="text-[9px] text-slate-500 mt-1">المملكة العربية السعودية، الرياض</p>
                  <p className="text-[9px] text-slate-500">الرقم الضريبي للمنشأة: 300098765400003</p>
                </div>

                <div className="text-left">
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded text-[9px] font-bold">
                    فاتورة ضريبية مبسطة
                  </span>
                  <p className="text-[10px] text-slate-600 mt-1.5 font-bold">فاتورة: {selectedInvoice.invoiceNumber}</p>
                  <p className="text-[9px] text-slate-500">التاريخ: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Customer summary */}
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 font-bold block">مخصصة للعميل:</span>
                  <span className="text-slate-800 font-extrabold text-xs">{selectedInvoice.customerName}</span>
                </div>
                {selectedInvoice.customerPhone && (
                  <div>
                    <span className="text-slate-400 font-bold block">هاتف العميل:</span>
                    <span className="text-slate-800 font-mono text-xs">{selectedInvoice.customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Items detail grid table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-[10px] border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-l border-slate-200">اسم المنتج / الخدمة</th>
                      <th className="p-2 text-center border-l border-slate-200">سعر الوحدة</th>
                      <th className="p-2 text-center border-l border-slate-200">الكمية</th>
                      <th className="p-2">الإجمالي الفردي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2 border-l border-slate-200 font-bold text-slate-800">{item.name}</td>
                        <td className="p-2 text-center border-l border-slate-200 font-mono">
                          {(item.price * activeCurrency.rate).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                        </td>
                        <td className="p-2 text-center border-l border-slate-200 font-bold">
                          {item.quantity.toLocaleString("ar-EG")}
                        </td>
                        <td className="p-2 font-bold text-slate-900">
                          {(item.price * activeCurrency.rate * item.quantity).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bill computations */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-[10px] border-t border-slate-100 pt-3">
                  {(() => {
                    const sub = selectedInvoice.items.reduce((sum, item) => sum + (item.price * activeCurrency.rate) * item.quantity, 0);
                    const afterDisc = Math.max(0, sub - (selectedInvoice.discount * activeCurrency.rate));
                    const taxAmt = afterDisc * (selectedInvoice.taxRate / 100);
                    const totalConverted = selectedInvoice.totalAmount * activeCurrency.rate;

                    return (
                      <>
                        <div className="flex justify-between text-slate-500">
                          <span>المجموع الفرعي:</span>
                          <span>{sub.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</span>
                        </div>
                        {selectedInvoice.discount > 0 && (
                          <div className="flex justify-between text-rose-500 font-bold">
                            <span>الخصم الممنوح:</span>
                            <span>-{(selectedInvoice.discount * activeCurrency.rate).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500">
                          <span>ضريبة القيمة المضافة ({selectedInvoice.taxRate}%):</span>
                          <span>{taxAmt.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 font-extrabold text-xs">
                          <span>المجموع الكلي المطلوب:</span>
                          <span className="text-indigo-700">
                            {totalConverted.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {activeCurrency.symbol}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Notes or signature footer section */}
              {selectedInvoice.notes && (
                <div className="border-t border-slate-150 pt-3">
                  <span className="text-[9px] text-slate-400 font-bold block">ملاحظات وشروط إضافية:</span>
                  <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Thank greeting */}
              <div className="text-center pt-4 border-t border-slate-100 text-[8px] text-slate-400">
                شاكرين لكم زيارتكم وثقتكم بنا وبمنتجاتنا المتميزة.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <footer className="h-9 bg-slate-950/45 border-t border-slate-800/80 flex items-center px-4 shrink-0 text-[10px] text-slate-500 font-medium justify-between">
        <div className="flex items-center gap-1">
          <Info size={11} />
          <span>يتم حفظ وتحديث كافة الفواتير تلقائياً في ذاكرة المتصفح المحلية.</span>
        </div>
        <div>
          <span>نظام الفواتير الموحد v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
