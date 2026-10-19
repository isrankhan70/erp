import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BookOpen,
  Users,
  Truck,
  Code2,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  Language,
  ModuleId,
  Product,
  SalesOrder,
  LedgerEntry,
  Employee,
  Supplier,
  PurchaseOrder,
  PaymentMethod,
  AttendanceStatus,
} from './types/erp';
import {
  INITIAL_PRODUCTS,
  INITIAL_SALES_ORDERS,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_EMPLOYEES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  formatBDT,
} from './data/initialErpData';
import { DashboardModule } from './components/DashboardModule';
import { InventoryModule } from './components/InventoryModule';
import { SalesPosModule } from './components/SalesPosModule';
import { AccountingModule } from './components/AccountingModule';
import { HrPayrollModule } from './components/HrPayrollModule';
import { PurchaseCrmModule } from './components/PurchaseCrmModule';
import { PythonBackendModule } from './components/PythonBackendModule';

const STORAGE_KEY = 'barakah_nexus_erp_state_v1';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).products || INITIAL_PRODUCTS;
    } catch {
      // ignore storage errors
    }
    return INITIAL_PRODUCTS;
  });

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).salesOrders || INITIAL_SALES_ORDERS;
    } catch {
      // ignore
    }
    return INITIAL_SALES_ORDERS;
  });

  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved)
        return JSON.parse(saved).ledgerEntries || INITIAL_LEDGER_ENTRIES;
    } catch {
      // ignore
    }
    return INITIAL_LEDGER_ENTRIES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).employees || INITIAL_EMPLOYEES;
    } catch {
      // ignore
    }
    return INITIAL_EMPLOYEES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).suppliers || INITIAL_SUPPLIERS;
    } catch {
      // ignore
    }
    return INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved)
        return JSON.parse(saved).purchaseOrders || INITIAL_PURCHASE_ORDERS;
    } catch {
      // ignore
    }
    return INITIAL_PURCHASE_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          products,
          salesOrders,
          ledgerEntries,
          employees,
          suppliers,
          purchaseOrders,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [
    products,
    salesOrders,
    ledgerEntries,
    employees,
    suppliers,
    purchaseOrders,
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const todayStr = '2026-10-18';

  // Cross-Module Handlers
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'lastUpdated'>) => {
    const created: Product = {
      ...newProd,
      id: `prd-${Date.now()}`,
      lastUpdated: todayStr,
    };
    setProducts((prev) => [created, ...prev]);
    triggerToast(
      lang === 'en'
        ? `SKU ${created.sku} added to ${created.warehouse}`
        : `SKU ${created.sku} ওয়্যারহাউসে যুক্ত হয়েছে`
    );
  };

  const handleAdjustStock = (
    productId: string,
    delta: number,
    reason: string
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextStock = Math.max(0, p.stock + delta);
        return { ...p, stock: nextStock, lastUpdated: todayStr };
      })
    );
    const target = products.find((p) => p.id === productId);
    triggerToast(
      lang === 'en'
        ? `Stock updated (${delta > 0 ? `+${delta}` : delta}) for ${
            target?.sku || 'SKU'
          } · ${reason}`
        : `${target?.sku || 'SKU'} পণ্যের স্টক আপডেট হয়েছে`
    );
  };

  const handleQuickReorder = (product: Product) => {
    const qty = 25;
    const cost = qty * product.costPrice;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, stock: p.stock + qty, lastUpdated: todayStr }
          : p
      )
    );
    const voucherNo = `VCH-2026-${Math.floor(810 + Math.random() * 180)}`;
    const newLedger: LedgerEntry = {
      id: `ldg-${Date.now()}`,
      voucherNo,
      date: todayStr,
      referenceNo: `RESTOCK-${product.sku}`,
      accountHead: 'Inventory Asset',
      entryType: 'Debit',
      category: 'Purchase',
      amount: cost,
      paymentMethod: 'Bank Transfer',
      narration: `Emergency restock of 25 ${product.unit} for ${product.nameEn}`,
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);
    triggerToast(
      lang === 'en'
        ? `Restocked +25 ${product.unit} for ${product.sku} & posted Ledger Debit ${formatBDT(cost, 'en')}`
        : `${product.sku}-এর ২৫টি স্টক যুক্ত হয়েছে এবং লেজার আপডেট হয়েছে`
    );
  };

  const handleCreateSale = (
    orderData: Omit<SalesOrder, 'id' | 'invoiceNo' | 'date'>
  ): SalesOrder => {
    const invoiceNo = `INV-2026-${1042 + salesOrders.length}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: `so-${Date.now()}`,
      invoiceNo,
      date: todayStr,
    };

    // 1. Deduct stock from Inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const soldLine = orderData.items.find((i) => i.productId === prod.id);
        if (!soldLine) return prod;
        return {
          ...prod,
          stock: Math.max(0, prod.stock - soldLine.quantity),
          lastUpdated: todayStr,
        };
      })
    );

    // 2. Save Sales Order
    setSalesOrders((prev) => [newOrder, ...prev]);

    // 3. Post Revenue Credit to General Ledger
    if (orderData.paidAmount > 0) {
      const voucherNo = `VCH-2026-${820 + ledgerEntries.length}`;
      const newEntry: LedgerEntry = {
        id: `ldg-${Date.now()}`,
        voucherNo,
        date: todayStr,
        referenceNo: invoiceNo,
        accountHead: 'Sales Revenue',
        entryType: 'Credit',
        category: 'Revenue',
        amount: orderData.paidAmount,
        paymentMethod: orderData.paymentMethod,
        narration: `POS Sales Receipt from ${orderData.customerName} (${invoiceNo})`,
      };
      setLedgerEntries((prev) => [newEntry, ...prev]);
    }

    triggerToast(
      lang === 'en'
        ? `Invoice ${invoiceNo} completed · Stock deducted & Ledger credited`
        : `ইনভয়েস ${invoiceNo} তৈরি হয়েছে · স্টক এবং লেজার আপডেট সম্পন্ন`
    );
    return newOrder;
  };

  const handleCollectDue = (
    orderId: string,
    amountCollected: number,
    method: PaymentMethod
  ) => {
    const targetOrder = salesOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paidAmount: o.paidAmount + amountCollected,
              dueAmount: 0,
              status: 'Paid',
            }
          : o
      )
    );

    const voucherNo = `VCH-2026-${830 + ledgerEntries.length}`;
    const newEntry: LedgerEntry = {
      id: `ldg-${Date.now()}`,
      voucherNo,
      date: todayStr,
      referenceNo: targetOrder.invoiceNo,
      accountHead: 'Accounts Receivable',
      entryType: 'Credit',
      category: 'Revenue',
      amount: amountCollected,
      paymentMethod: method,
      narration: `Due settlement collected from ${targetOrder.customerName} (${targetOrder.invoiceNo})`,
    };
    setLedgerEntries((prev) => [newEntry, ...prev]);

    triggerToast(
      lang === 'en'
        ? `Due ${formatBDT(amountCollected, 'en')} collected for ${targetOrder.invoiceNo}`
        : `${targetOrder.invoiceNo}-এর বকেয়া পরিশোধ গ্রহণ করা হয়েছে`
    );
  };

  const handleAddLedgerEntry = (
    entryData: Omit<LedgerEntry, 'id' | 'voucherNo' | 'date'>
  ) => {
    const voucherNo = `VCH-2026-${840 + ledgerEntries.length}`;
    const created: LedgerEntry = {
      ...entryData,
      id: `ldg-${Date.now()}`,
      voucherNo,
      date: todayStr,
    };
    setLedgerEntries((prev) => [created, ...prev]);
    triggerToast(
      lang === 'en'
        ? `Voucher ${voucherNo} posted to General Ledger`
        : `ভাউচার ${voucherNo} জেনারেল লেজারে যুক্ত হয়েছে`
    );
  };

  const handleUpdateAttendance = (
    empId: string,
    status: AttendanceStatus
  ) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === empId ? { ...e, attendanceStatus: status } : e
      )
    );
  };

  const handleDisburseSingleSalary = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp || emp.payrollStatus === 'Paid') return;
    const netPay = emp.basicSalary + emp.allowance - emp.deduction;

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === empId
          ? { ...e, payrollStatus: 'Paid', lastPaidMonth: 'October 2026' }
          : e
      )
    );

    const voucherNo = `VCH-2026-${850 + ledgerEntries.length}`;
    setLedgerEntries((prev) => [
      {
        id: `ldg-${Date.now()}`,
        voucherNo,
        date: todayStr,
        referenceNo: `PAY-${emp.empCode}`,
        accountHead: 'Salary & Payroll Expense',
        entryType: 'Debit',
        category: 'Payroll',
        amount: netPay,
        paymentMethod: 'Bank Transfer',
        narration: `October 2026 salary disbursed to ${emp.nameEn} (${emp.designation})`,
      },
      ...prev,
    ]);

    triggerToast(
      lang === 'en'
        ? `Salary ${formatBDT(netPay, 'en')} disbursed to ${emp.nameEn}`
        : `${emp.nameBn}-এর বেতন পরিশোধ ও লেজারে অন্তর্ভুক্ত হয়েছে`
    );
  };

  const handleDisburseAllPayroll = () => {
    const pendingStaff = employees.filter((e) => e.payrollStatus === 'Pending');
    if (pendingStaff.length === 0) return;

    const totalPayout = pendingStaff.reduce(
      (sum, e) => sum + e.basicSalary + e.allowance - e.deduction,
      0
    );

    setEmployees((prev) =>
      prev.map((e) => ({
        ...e,
        payrollStatus: 'Paid',
        lastPaidMonth: 'October 2026',
      }))
    );

    const voucherNo = `VCH-2026-${860 + ledgerEntries.length}`;
    setLedgerEntries((prev) => [
      {
        id: `ldg-${Date.now()}`,
        voucherNo,
        date: todayStr,
        referenceNo: 'PAY-OCT-2026-BATCH',
        accountHead: 'Salary & Payroll Expense',
        entryType: 'Debit',
        category: 'Payroll',
        amount: totalPayout,
        paymentMethod: 'Bank Transfer',
        narration: `Batch monthly payroll disbursement for ${pendingStaff.length} staff (October 2026)`,
      },
      ...prev,
    ]);

    triggerToast(
      lang === 'en'
        ? `Disbursed ${formatBDT(totalPayout, 'en')} to ${pendingStaff.length} employees`
        : `${pendingStaff.length} জন কর্মীর মাসিক বেতন পরিশোধ সম্পন্ন হয়েছে`
    );
  };

  const handleAddEmployee = (
    empData: Omit<
      Employee,
      'id' | 'attendanceStatus' | 'payrollStatus' | 'lastPaidMonth'
    >
  ) => {
    const created: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      attendanceStatus: 'Present',
      payrollStatus: 'Pending',
      lastPaidMonth: 'New Joiner',
    };
    setEmployees((prev) => [...prev, created]);
    triggerToast(
      lang === 'en'
        ? `Employee ${created.nameEn} onboarded to HR directory`
        : `${created.nameBn} এইচআর তালিকায় যুক্ত হয়েছেন`
    );
  };

  const handleReceivePurchaseOrder = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'Received') return;

    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status: 'Received' } : p))
    );

    // Increment Warehouse Stock
    setProducts((prev) =>
      prev.map((prod) => {
        const line = po.items.find((i) => i.productId === prod.id);
        if (!line) return prod;
        return {
          ...prod,
          stock: prod.stock + line.quantity,
          lastUpdated: todayStr,
        };
      })
    );

    // Post Purchase Ledger Entry
    const voucherNo = `VCH-2026-${870 + ledgerEntries.length}`;
    setLedgerEntries((prev) => [
      {
        id: `ldg-${Date.now()}`,
        voucherNo,
        date: todayStr,
        referenceNo: po.poNumber,
        accountHead: 'Inventory Asset',
        entryType: 'Debit',
        category: 'Purchase',
        amount: po.totalAmount,
        paymentMethod: po.paymentMethod,
        narration: `Stock received against ${po.poNumber} from ${po.supplierName}`,
      },
      ...prev,
    ]);

    triggerToast(
      lang === 'en'
        ? `${po.poNumber} received · Warehouse stock incremented & Ledger updated`
        : `${po.poNumber} গুদামে গৃহীত হয়েছে এবং স্টক বৃদ্ধি পেয়েছে`
    );
  };

  const handleCreatePurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'date'>
  ) => {
    const poNumber = `PO-2026-${504 + purchaseOrders.length}`;
    const created: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
      date: todayStr,
    };
    setPurchaseOrders((prev) => [created, ...prev]);
    triggerToast(
      lang === 'en'
        ? `Purchase Order ${poNumber} issued to ${poData.supplierName}`
        : `পারচেজ অর্ডার ${poNumber} ইস্যু করা হয়েছে`
    );
  };

  const handlePaySupplier = (supplierId: string, amount: number) => {
    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup || amount <= 0) return;

    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId ? { ...s, balancePayable: 0 } : s
      )
    );

    const voucherNo = `VCH-2026-${880 + ledgerEntries.length}`;
    setLedgerEntries((prev) => [
      {
        id: `ldg-${Date.now()}`,
        voucherNo,
        date: todayStr,
        referenceNo: sup.supplierCode,
        accountHead: 'Accounts Payable',
        entryType: 'Debit',
        category: 'Liability',
        amount,
        paymentMethod: 'Bank Transfer',
        narration: `Vendor payable settled with ${sup.companyName}`,
      },
      ...prev,
    ]);

    triggerToast(
      lang === 'en'
        ? `Payable ${formatBDT(amount, 'en')} settled with ${sup.companyName}`
        : `${sup.companyName}-এর বকেয়া পরিশোধ সম্পন্ন হয়েছে`
    );
  };

  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProducts(INITIAL_PRODUCTS);
    setSalesOrders(INITIAL_SALES_ORDERS);
    setLedgerEntries(INITIAL_LEDGER_ENTRIES);
    setEmployees(INITIAL_EMPLOYEES);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    triggerToast(
      lang === 'en'
        ? 'ERP database reset to factory seed state'
        : 'ইআরপি ডাটাবেস প্রাথমিক অবস্থায় রিসেট করা হয়েছে'
    );
  };

  const sidebarItems: {
    id: ModuleId;
    labelEn: string;
    labelBn: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'dashboard',
      labelEn: 'Executive Dashboard',
      labelBn: 'এক্সিকিউটিভ ড্যাশবোর্ড',
      icon: LayoutDashboard,
    },
    {
      id: 'inventory',
      labelEn: 'Inventory & Warehouse',
      labelBn: 'ইনভেন্টরি ও ওয়্যারহাউস',
      icon: Package,
    },
    {
      id: 'sales',
      labelEn: 'Sales & POS Billing',
      labelBn: 'সেলস ও পিওএস বিলিং',
      icon: ShoppingCart,
    },
    {
      id: 'accounting',
      labelEn: 'Accounting & Ledger',
      labelBn: 'একাউন্টিং ও লেজার',
      icon: BookOpen,
    },
    {
      id: 'hr',
      labelEn: 'HR & Payroll',
      labelBn: 'এইচআর ও পেরোল',
      icon: Users,
    },
    {
      id: 'purchase',
      labelEn: 'Purchase & Suppliers',
      labelBn: 'পারচেজ ও সাপ্লায়ার',
      icon: Truck,
    },
    {
      id: 'python_backend',
      labelEn: 'Python FastAPI Studio',
      labelBn: 'Python FastAPI কোড',
      icon: Code2,
    },
  ];

  const currentModuleTitle =
    sidebarItems.find((i) => i.id === activeModule)?.[
      lang === 'en' ? 'labelEn' : 'labelBn'
    ] || 'Overview';

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
      {/* Fixed 260px Enterprise Slate Left Sidebar */}
      <aside className="w-[260px] bg-[#0F172A] text-slate-200 flex-col justify-between shrink-0 hidden md:flex no-print">
        <div>
          <div className="h-14 px-5 flex items-center border-b border-slate-800">
            <span className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
              Barakah Nexus ERP
            </span>
          </div>

          <nav className="p-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {lang === 'en' ? item.labelEn : item.labelBn}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3 text-xs text-slate-400">
          <div>
            <div className="text-slate-200 font-medium">
              {lang === 'en' ? 'Dhaka HQ · BDT (৳)' : 'ঢাকা হেড অফিস · টাকা (৳)'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              FastAPI + SQLAlchemy Ready
            </div>
          </div>
          <button
            onClick={handleResetDemo}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Reset Demo Database' : 'ডেমো ডাটা রিসেট করুন'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Strict 3-Zone Top Bar Contract */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8 shrink-0 no-print">
          {/* Zone 1: Single text element breadcrumb wordmark */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left"
          >
            Barakah Nexus / {currentModuleTitle}
          </button>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveModule('dashboard')}
              className={`hover:text-slate-900 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                activeModule === 'dashboard' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {lang === 'en' ? 'Overview' : 'ড্যাশবোর্ড'}
            </button>
            <button
              onClick={() => setActiveModule('inventory')}
              className={`hover:text-slate-900 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                activeModule === 'inventory' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {lang === 'en' ? 'Inventory' : 'ইনভেন্টরি'}
            </button>
            <button
              onClick={() => setActiveModule('sales')}
              className={`hover:text-slate-900 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                activeModule === 'sales' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {lang === 'en' ? 'Sales POS' : 'পিওএস বিলিং'}
            </button>
            <button
              onClick={() => setActiveModule('accounting')}
              className={`hover:text-slate-900 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                activeModule === 'accounting' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              {lang === 'en' ? 'Ledger' : 'লেজার'}
            </button>
            <button
              onClick={() => setActiveModule('python_backend')}
              className={`hover:text-slate-900 hover:underline transition-colors whitespace-nowrap shrink-0 ${
                activeModule === 'python_backend'
                  ? 'text-blue-600 font-semibold'
                  : ''
              }`}
            >
              {lang === 'en' ? 'Python Code' : 'Python কোড'}
            </button>
          </nav>

          {/* Zone 3: 1 primary action (Bilingual Switcher) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setLang((prev) => (prev === 'en' ? 'bn' : 'en'))}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'বাংলা ভাষায় দেখুন' : 'Switch to English'}
            </button>
          </div>
        </header>

        {/* Mobile Module Switcher Bar */}
        <div className="md:hidden bg-slate-900 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-print">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                activeModule === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              {lang === 'en' ? item.labelEn : item.labelBn}
            </button>
          ))}
        </div>

        {/* Toast Feedback Banner */}
        {toastMessage && (
          <div className="mx-6 mt-4 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center justify-between shadow-md no-print">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active Module Viewport */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">
          {activeModule === 'dashboard' && (
            <DashboardModule
              lang={lang}
              products={products}
              salesOrders={salesOrders}
              ledgerEntries={ledgerEntries}
              employees={employees}
              purchaseOrders={purchaseOrders}
              onNavigate={setActiveModule}
              onQuickReorder={handleQuickReorder}
            />
          )}

          {activeModule === 'inventory' && (
            <InventoryModule
              lang={lang}
              products={products}
              onAddProduct={handleAddProduct}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeModule === 'sales' && (
            <SalesPosModule
              lang={lang}
              products={products}
              salesOrders={salesOrders}
              onCreateSale={handleCreateSale}
              onCollectDue={handleCollectDue}
            />
          )}

          {activeModule === 'accounting' && (
            <AccountingModule
              lang={lang}
              ledgerEntries={ledgerEntries}
              onAddLedgerEntry={handleAddLedgerEntry}
            />
          )}

          {activeModule === 'hr' && (
            <HrPayrollModule
              lang={lang}
              employees={employees}
              onUpdateAttendance={handleUpdateAttendance}
              onDisburseSingleSalary={handleDisburseSingleSalary}
              onDisburseAllPayroll={handleDisburseAllPayroll}
              onAddEmployee={handleAddEmployee}
            />
          )}

          {activeModule === 'purchase' && (
            <PurchaseCrmModule
              lang={lang}
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              products={products}
              onReceivePurchaseOrder={handleReceivePurchaseOrder}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
              onPaySupplier={handlePaySupplier}
            />
          )}

          {activeModule === 'python_backend' && (
            <PythonBackendModule
              lang={lang}
              products={products}
              salesOrders={salesOrders}
              ledgerEntries={ledgerEntries}
              employees={employees}
              suppliers={suppliers}
            />
          )}
        </main>
      </div>
    </div>
  );
}
