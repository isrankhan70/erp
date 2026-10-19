import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Plus,
  FileText,
  Package,
  Code2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  Product,
  SalesOrder,
  LedgerEntry,
  Employee,
  PurchaseOrder,
  Language,
  ModuleId,
} from '../types/erp';
import { formatBDT, formatNum } from '../data/initialErpData';

interface DashboardModuleProps {
  lang: Language;
  products: Product[];
  salesOrders: SalesOrder[];
  ledgerEntries: LedgerEntry[];
  employees: Employee[];
  purchaseOrders: PurchaseOrder[];
  onNavigate: (mod: ModuleId) => void;
  onQuickReorder: (product: Product) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  lang,
  products,
  salesOrders,
  ledgerEntries,
  employees,
  purchaseOrders,
  onNavigate,
  onQuickReorder,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | 'oct' | 'today'>('all');

  const filteredSales = salesOrders.filter((so) => {
    if (periodFilter === 'today') return so.date === '2026-10-18';
    if (periodFilter === 'oct') return so.date.startsWith('2026-10');
    return true;
  });

  const filteredLedger = ledgerEntries.filter((le) => {
    if (periodFilter === 'today') return le.date === '2026-10-18';
    if (periodFilter === 'oct') return le.date.startsWith('2026-10');
    return true;
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalCollected = filteredSales.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalReceivable = filteredSales.reduce((acc, s) => acc + s.dueAmount, 0);

  const totalCredits = filteredLedger
    .filter((e) => e.entryType === 'Credit')
    .reduce((acc, e) => acc + e.amount, 0);
  const totalDebits = filteredLedger
    .filter((e) => e.entryType === 'Debit')
    .reduce((acc, e) => acc + e.amount, 0);
  const netCashFlow = totalCredits - totalDebits;

  const inventoryValue = products.reduce(
    (acc, p) => acc + p.stock * p.costPrice,
    0
  );
  const lowStockProducts = products.filter((p) => p.stock <= p.reorderLevel);

  const warehouseStats = (
    ['Dhaka Central', 'Chattogram Port', 'Gazipur Factory'] as const
  ).map((wh) => {
    const whProducts = products.filter((p) => p.warehouse === wh);
    const totalValuation = whProducts.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0
    );
    const totalUnits = whProducts.reduce((sum, p) => sum + p.stock, 0);
    return {
      warehouse: wh,
      skuCount: whProducts.length,
      totalUnits,
      totalValuation,
    };
  });

  const presentCount = employees.filter(
    (e) => e.attendanceStatus === 'Present' || e.attendanceStatus === 'Late'
  ).length;
  const pendingPoCount = purchaseOrders.filter(
    (po) => po.status !== 'Received'
  ).length;

  return (
    <div className="space-y-6">
      {/* Executive Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Executive ERP Operations Overview'
              : 'এক্সিকিউটিভ ইআরপি অপারেশনস ওভারভিউ'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              {lang === 'en'
                ? 'Fiscal Year 2026–2027'
                : 'অর্থবছর ২০২৬–২০২৭'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en'
                ? '3 Active Warehouses'
                : '৩টি সক্রিয় ওয়্যারহাউস'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en'
                ? 'Double-Entry Ledger Synced'
                : 'ডাবল-এন্ট্রি লেজার সিঙ্কড'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                periodFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'All Records' : 'সব রেকর্ড'}
            </button>
            <button
              onClick={() => setPeriodFilter('oct')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                periodFilter === 'oct'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'October 2026' : 'অক্টোবর ২০২৬'}
            </button>
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                periodFilter === 'today'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Today' : 'আজকের হিসাব'}
            </button>
          </div>

          <button
            onClick={() => onNavigate('sales')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'New POS Invoice' : 'নতুন সেলস ইনভয়েস'}</span>
          </button>
        </div>
      </div>

      {/* 4-Column Financial & Operational KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en' ? 'Gross Sales Revenue' : 'মোট বিক্রয় আয় (Gross Sales)'}
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatBDT(totalRevenue, lang)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-700 font-medium">
              {lang === 'en' ? 'Collected:' : 'আদায়:'}{' '}
              <span className="font-mono tabular-nums">
                {formatBDT(totalCollected, lang)}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-mono tabular-nums">
                {formatNum(filteredSales.length, lang)}
              </span>{' '}
              {lang === 'en' ? 'Invoices' : 'টি ইনভয়েস'}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en' ? 'Net Ledger Cash Flow' : 'নিট ক্যাশ ফ্লো (Ledger)'}
            </span>
            {netCashFlow >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              netCashFlow >= 0 ? 'text-slate-900' : 'text-red-600'
            }`}
          >
            {formatBDT(netCashFlow, lang)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>
              {lang === 'en' ? 'Inflow:' : 'জমা:'}{' '}
              <span className="font-mono tabular-nums text-slate-700">
                {formatBDT(totalCredits, lang)}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en' ? 'Outflow:' : 'খরচ:'}{' '}
              <span className="font-mono tabular-nums text-slate-700">
                {formatBDT(totalDebits, lang)}
              </span>
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en' ? 'Inventory Asset Valuation' : 'মজুদ পণ্যের মোট মূল্য'}
            </span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatBDT(inventoryValue, lang)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>
              <span className="font-mono tabular-nums font-medium text-slate-700">
                {formatNum(products.length, lang)}
              </span>{' '}
              {lang === 'en' ? 'Active SKUs' : 'টি পণ্য'}
            </span>
            <span aria-hidden="true">·</span>
            <span className={lowStockProducts.length > 0 ? 'text-amber-700 font-medium' : 'text-emerald-700'}>
              <span className="font-mono tabular-nums">
                {formatNum(lowStockProducts.length, lang)}
              </span>{' '}
              {lang === 'en' ? 'Low Stock Alerts' : 'টি স্টক অ্যালার্ট'}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en'
                ? 'Receivables & Workforce'
                : 'বকেয়া পাওনা ও জনবল'}
            </span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatBDT(totalReceivable, lang)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>
              {lang === 'en' ? 'Staff Present:' : 'উপস্থিত কর্মী:'}{' '}
              <span className="font-mono tabular-nums font-medium text-slate-700">
                {formatNum(presentCount, lang)}/{formatNum(employees.length, lang)}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en' ? 'Active POs:' : 'চলমান PO:'}{' '}
              <span className="font-mono tabular-nums font-medium text-slate-700">
                {formatNum(pendingPoCount, lang)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Middle Split: Multi-Warehouse Valuation & Low Stock Reorder Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Cols: Multi-Warehouse Stock & Financial Distribution */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {lang === 'en'
                    ? 'Multi-Warehouse Inventory & Valuation'
                    : 'ওয়্যারহাউস ভিত্তিক স্টক ও মূল্যায়ন'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Real-time stock valuation across Dhaka, Chattogram, and Gazipur facilities'
                    : 'ঢাকা, চট্টগ্রাম এবং গাজীপুর ওয়্যারহাউসের বর্তমান মজুদ হিসাব'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0"
              >
                {lang === 'en' ? 'Manage Inventory →' : 'ইনভেন্টরি দেখুন →'}
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {warehouseStats.map((w) => {
                const sharePercent =
                  inventoryValue > 0
                    ? Math.round((w.totalValuation / inventoryValue) * 100)
                    : 0;
                return (
                  <div key={w.warehouse} className="py-3.5 first:pt-1 last:pb-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-medium text-slate-900">
                        {w.warehouse}
                      </div>
                      <div className="font-mono tabular-nums font-semibold text-slate-900">
                        {formatBDT(w.totalValuation, lang)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                      <div className="flex items-center gap-2">
                        <span>
                          <span className="font-mono tabular-nums">{w.skuCount}</span> SKUs
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          <span className="font-mono tabular-nums">
                            {formatNum(w.totalUnits, lang)}
                          </span>{' '}
                          {lang === 'en' ? 'Total Units' : 'ইউনিট মজুদ'}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-600">
                        {sharePercent}% {lang === 'en' ? 'of asset value' : 'অংশ'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.max(6, sharePercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Code2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Python FastAPI + SQLAlchemy Backend is synchronized with live ERP records.'
                  : 'Python FastAPI + SQLAlchemy ব্যাকএন্ড কোড আপনার লাইভ ডাটার সাথে সিঙ্ক করা আছে।'}
              </span>
            </div>
            <button
              onClick={() => onNavigate('python_backend')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Open Python FastAPI Studio' : 'Python কোড স্টুডিও খুলুন'}
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Low Stock Reorder Action Queue */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {lang === 'en'
                    ? 'Reorder & Stock Alert Queue'
                    : 'স্টক অ্যালার্ট ও রি-অর্ডার তালিকা'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Items below minimum safety threshold across warehouses'
                    : 'যেসব পণ্যের মজুদ সর্বনিম্ন সীমার নিচে নেমেছে'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('purchase')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0"
              >
                {lang === 'en' ? 'Purchase Orders →' : 'পারচেজ অর্ডার →'}
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-800">
                  {lang === 'en'
                    ? 'All SKUs are above safety stock levels'
                    : 'সব পণ্যের পর্যাপ্ত স্টক রয়েছে'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'en'
                    ? 'No urgent purchase orders required right now.'
                    : 'এই মুহূর্তে জরুরি পারচেজ অর্ডারের প্রয়োজন নেই।'}
                </p>
              </div>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {lowStockProducts.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 shrink-0 ${
                            item.stock === 0 ? 'text-red-600' : 'text-amber-600'
                          }`}
                        />
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {lang === 'en' ? item.nameEn : item.nameBn}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono tabular-nums">{item.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.warehouse}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-mono tabular-nums font-medium ${
                            item.stock === 0 ? 'text-red-600' : 'text-amber-700'
                          }`}
                        >
                          {lang === 'en' ? 'Stock:' : 'মজুদ:'} {item.stock}{' '}
                          {item.unit} (Min: {item.reorderLevel})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onQuickReorder(item)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      {lang === 'en' ? '+ Restock 25 Units' : '+ ২৫টি স্টক যুক্ত করুন'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en'
                ? 'Quick restock immediately updates warehouse inventory & ledger.'
                : 'কুইক রিস্টক বাটনে ক্লিক করলে ওয়্যারহাউস স্টক তাৎক্ষণিক আপডেট হবে।'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Split: Recent Sales Invoices & Recent General Ledger Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Invoices */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {lang === 'en' ? 'Recent Sales Invoices' : 'সাম্প্রতিক বিক্রয় ইনভয়েস'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Latest customer billing and POS transactions'
                  : 'সর্বশেষ কাস্টমার বিলিং এবং পিওএস লেনদেন'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'All Invoices →' : 'সব ইনভয়েস →'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">{lang === 'en' ? 'Invoice' : 'ইনভয়েস'}</th>
                  <th className="py-2.5 px-4">{lang === 'en' ? 'Customer' : 'কাস্টমার'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'en' ? 'Total' : 'মোট বিল'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSales.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                      {order.invoiceNo}
                      <div className="text-[11px] text-slate-400 font-sans">
                        {order.date} · {order.paymentMethod}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {formatBDT(order.grandTotal, lang)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {order.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Paid' : 'পরিশোধিত'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'en' ? 'Due:' : 'বকেয়া:'}{' '}
                            <span className="font-mono tabular-nums">
                              {formatBDT(order.dueAmount, lang)}
                            </span>
                          </span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent General Ledger Vouchers */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {lang === 'en'
                  ? 'Recent General Ledger Postings'
                  : 'সাম্প্রতিক জেনারেল লেজার ভাউচার'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en'
                  ? 'Real-time double-entry credit and debit journal records'
                  : 'রিয়েল-টাইম ক্রেডিট ও ডেবিট জার্নাল এন্ট্রি'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('accounting')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Full Ledger →' : 'সম্পূর্ণ লেজার →'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">{lang === 'en' ? 'Voucher' : 'ভাউচার'}</th>
                  <th className="py-2.5 px-4">{lang === 'en' ? 'Account Head' : 'হিসাব খাত'}</th>
                  <th className="py-2.5 px-4">{lang === 'en' ? 'Type' : 'ধরণ'}</th>
                  <th className="py-2.5 px-4 text-right">{lang === 'en' ? 'Amount' : 'পরিমাণ'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLedger.slice(0, 5).map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                      {entry.voucherNo}
                      <div className="text-[11px] text-slate-400 font-sans">
                        {entry.date} · {entry.referenceNo}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{entry.accountHead}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {entry.narration}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-medium ${
                          entry.entryType === 'Credit'
                            ? 'text-emerald-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {entry.entryType}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                        entry.entryType === 'Credit'
                          ? 'text-emerald-700'
                          : 'text-slate-900'
                      }`}
                    >
                      {entry.entryType === 'Credit' ? '+' : '-'}
                      {formatBDT(entry.amount, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
