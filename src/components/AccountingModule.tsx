import React, { useState } from 'react';
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';
import {
  LedgerEntry,
  AccountHead,
  PaymentMethod,
  Language,
} from '../types/erp';
import { formatBDT } from '../data/initialErpData';

interface AccountingModuleProps {
  lang: Language;
  ledgerEntries: LedgerEntry[];
  onAddLedgerEntry: (
    entry: Omit<LedgerEntry, 'id' | 'voucherNo' | 'date'>
  ) => void;
}

const ACCOUNT_HEADS: AccountHead[] = [
  'Sales Revenue',
  'Warehouse & Utility Expense',
  'Logistics & Transport Expense',
  'Salary & Payroll Expense',
  'Inventory Asset',
  'Cost of Goods Sold',
  'Cash in Hand',
  'City Bank Corporate A/C',
  'Mobile Money (bKash/Nagad)',
  'Accounts Receivable',
  'Accounts Payable',
  'Owner Equity',
];

export const AccountingModule: React.FC<AccountingModuleProps> = ({
  lang,
  ledgerEntries,
  onAddLedgerEntry,
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'Credit' | 'Debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // New Voucher Form State
  const [referenceNo, setReferenceNo] = useState('EXP-2026-901');
  const [accountHead, setAccountHead] = useState<AccountHead>(
    'Warehouse & Utility Expense'
  );
  const [entryType, setEntryType] = useState<'Credit' | 'Debit'>('Debit');
  const [category, setCategory] = useState<
    'Revenue' | 'Expense' | 'Asset' | 'Liability' | 'Payroll' | 'Purchase'
  >('Expense');
  const [amount, setAmount] = useState<number>(18500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [narration, setNarration] = useState('');

  const filteredEntries = ledgerEntries.filter((entry) => {
    const matchesType =
      typeFilter === 'all' || entry.entryType === typeFilter;
    const matchesSearch =
      entry.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.accountHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.narration.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCredits = ledgerEntries
    .filter((e) => e.entryType === 'Credit')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalDebits = ledgerEntries
    .filter((e) => e.entryType === 'Debit')
    .reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalCredits - totalDebits;

  // Group by Account Head for Chart of Accounts Summary
  const accountSummary = ACCOUNT_HEADS.map((head) => {
    const entries = ledgerEntries.filter((e) => e.accountHead === head);
    const creditSum = entries
      .filter((e) => e.entryType === 'Credit')
      .reduce((s, e) => s + e.amount, 0);
    const debitSum = entries
      .filter((e) => e.entryType === 'Debit')
      .reduce((s, e) => s + e.amount, 0);
    return {
      head,
      count: entries.length,
      creditSum,
      debitSum,
    };
  }).filter((a) => a.count > 0);

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !narration.trim()) return;
    onAddLedgerEntry({
      referenceNo: referenceNo.trim() || 'JRN-MANUAL',
      accountHead,
      entryType,
      category,
      amount: Number(amount),
      paymentMethod,
      narration: narration.trim(),
    });
    setNarration('');
    setReferenceNo(`VCH-REF-${Math.floor(100 + Math.random() * 899)}`);
    setShowVoucherModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Double-Entry Accounting, General Ledger & Expense'
              : 'ডাবল-এন্ট্রি একাউন্টিং, জেনারেল লেজার ও ব্যয় হিসাব'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              {lang === 'en'
                ? 'IFRS & Bangladesh Accounting Standard (BAS) compliant voucher register'
                : 'বাংলাদেশ একাউন্টিং স্ট্যান্ডার্ড অনুযায়ী ক্রেডিট ও ডেবিট ভাউচার রেজিস্টার'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowVoucherModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>
            {lang === 'en'
              ? 'Post Journal / Expense Voucher'
              : 'নতুন জার্নাল / খরচের ভাউচার'}
          </span>
        </button>
      </div>

      {/* 3-Column Trial Balance & P&L Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en'
                ? 'Total Credits (Revenue & Inflows)'
                : 'মোট ক্রেডিট (আয় ও জমা)'}
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {formatBDT(totalCredits, lang)}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en'
                ? 'Total Debits (Purchases, Payroll & Expenses)'
                : 'মোট ডেবিট (ক্রয়, বেতন ও খরচ)'}
            </span>
            <ArrowDownRight className="w-4 h-4 text-slate-700" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatBDT(totalDebits, lang)}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {lang === 'en'
                ? 'Net Operating Cash Balance'
                : 'নিট অপারেটিং ক্যাশ ব্যালেন্স'}
            </span>
          </div>
          <div
            className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
              netBalance >= 0 ? 'text-blue-700' : 'text-red-600'
            }`}
          >
            {formatBDT(netBalance, lang)}
          </div>
        </div>
      </div>

      {/* Chart of Accounts Trial Balance Breakdown */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            {lang === 'en'
              ? 'Chart of Accounts — Trial Balance Summary'
              : 'চার্ট অব একাউন্টস — ট্রায়াল ব্যালেন্স সামারি'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-4">
                  {lang === 'en' ? 'Account Head' : 'হিসাব খাত'}
                </th>
                <th className="py-2.5 px-4 text-right">
                  {lang === 'en' ? 'Vouchers' : 'ভাউচার সংখ্যা'}
                </th>
                <th className="py-2.5 px-4 text-right">
                  {lang === 'en' ? 'Total Debit (৳)' : 'মোট ডেবিট (৳)'}
                </th>
                <th className="py-2.5 px-4 text-right">
                  {lang === 'en' ? 'Total Credit (৳)' : 'মোট ক্রেডিট (৳)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accountSummary.map((row) => (
                <tr key={row.head} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {row.head}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                    {row.count}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                    {row.debitSum > 0 ? formatBDT(row.debitSum, lang) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                    {row.creditSum > 0 ? formatBDT(row.creditSum, lang) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Ledger Filter & Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-lg">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search voucher no, account head, reference, or narration...'
                  : 'ভাউচার নম্বর, হিসাব খাত বা বিবরণ দিয়ে খুঁজুন...'
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['all', 'Credit', 'Debit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all'
                  ? lang === 'en'
                    ? 'All Entries'
                    : 'সব এন্ট্রি'
                  : t === 'Credit'
                  ? lang === 'en'
                    ? 'Credits (+)'
                    : 'ক্রেডিট (+)'
                  : lang === 'en'
                  ? 'Debits (-)'
                  : 'ডেবিট (-)'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Account Head</th>
                  <th className="py-3 px-4">Narration</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Type</th>
                  <th className="py-3 px-4 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {entry.voucherNo}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {entry.referenceNo}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {entry.accountHead}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {entry.narration}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {entry.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          entry.entryType === 'Credit'
                            ? 'text-emerald-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {entry.entryType}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums font-bold whitespace-nowrap ${
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

      {/* Post Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en'
                  ? 'Post General Ledger Voucher'
                  : 'নতুন জেনারেল লেজার ভাউচার এন্ট্রি'}
              </h3>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateVoucher}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Entry Type' : 'এন্ট্রির ধরণ'}
                  </label>
                  <select
                    value={entryType}
                    onChange={(e) => {
                      const val = e.target.value as 'Credit' | 'Debit';
                      setEntryType(val);
                      setCategory(val === 'Credit' ? 'Revenue' : 'Expense');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="Debit">Debit (Expense / Outflow)</option>
                    <option value="Credit">Credit (Income / Inflow)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Reference No
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Account Head' : 'হিসাব খাত'}
                </label>
                <select
                  value={accountHead}
                  onChange={(e) =>
                    setAccountHead(e.target.value as AccountHead)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                >
                  {ACCOUNT_HEADS.map((head) => (
                    <option key={head} value={head}>
                      {head}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Amount (৳) *' : 'পরিমাণ (৳) *'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Payment Mode' : 'পেমেন্ট মাধ্যম'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en'
                    ? 'Voucher Narration / Particulars *'
                    : 'ভাউচারের বিস্তারিত বিবরণ *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly generator fuel & warehouse maintenance"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {lang === 'en' ? 'Post Voucher' : 'ভাউচার সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
