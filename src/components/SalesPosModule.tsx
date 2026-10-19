import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  Receipt,
  X,
} from 'lucide-react';
import {
  Product,
  SalesOrder,
  SalesOrderItem,
  PaymentMethod,
  WarehouseLocation,
  Language,
} from '../types/erp';
import { formatBDT, formatNum } from '../data/initialErpData';

interface SalesPosModuleProps {
  lang: Language;
  products: Product[];
  salesOrders: SalesOrder[];
  onCreateSale: (
    orderData: Omit<SalesOrder, 'id' | 'invoiceNo' | 'date'>
  ) => SalesOrder;
  onCollectDue: (orderId: string, amountCollected: number, method: PaymentMethod) => void;
}

export const SalesPosModule: React.FC<SalesPosModuleProps> = ({
  lang,
  products,
  salesOrders,
  onCreateSale,
  onCollectDue,
}) => {
  const [activeView, setActiveView] = useState<'pos' | 'history'>('pos');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All');

  // POS Cart State
  const [cart, setCart] = useState<SalesOrderItem[]>([
    {
      productId: products[0]?.id || 'prd-1',
      sku: products[0]?.sku || 'BNX-ELC-101',
      nameEn: products[0]?.nameEn || 'Industrial Voltage Stabilizer 10kVA',
      nameBn: products[0]?.nameBn || 'ইন্ডাস্ট্রিয়াল ভোল্টেজ স্ট্যাবিলাইজার ১০কেভিএ',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 41000,
      costPrice: products[0]?.costPrice || 32500,
      lineTotal: products[0]?.sellingPrice || 41000,
    },
  ]);
  const [customerName, setCustomerName] = useState('Walk-in / Corporate Client');
  const [customerPhone, setCustomerPhone] = useState('01711-000000');
  const [discount, setDiscount] = useState<number>(0);
  const [vatRate, setVatRate] = useState<number>(5);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Cash');
  const [customPaidInput, setCustomPaidInput] = useState<string>('');

  // Invoice Print Preview Modal
  const [previewOrder, setPreviewOrder] = useState<SalesOrder | null>(null);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'Paid' | 'Due'>('all');

  const availableProducts = products.filter((p) => {
    const matchesQuery =
      p.sku.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.nameBn.includes(catalogSearch);
    const matchesWh =
      warehouseFilter === 'All' || p.warehouse === warehouseFilter;
    return matchesQuery && matchesWh;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: nextQty, lineTotal: nextQty * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          nameEn: product.nameEn,
          nameBn: product.nameBn,
          quantity: 1,
          unitPrice: product.sellingPrice,
          costPrice: product.costPrice,
          lineTotal: product.sellingPrice,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    const maxStock = product ? product.stock : 999;

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = Math.min(maxStock, item.quantity + delta);
          if (nextQty <= 0) return null;
          return {
            ...item,
            quantity: nextQty,
            lineTotal: nextQty * item.unitPrice,
          };
        })
        .filter(Boolean) as SalesOrderItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.lineTotal, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const vatAmount = Math.round(taxableAmount * (vatRate / 100));
  const grandTotal = taxableAmount + vatAmount;
  const paidAmount =
    customPaidInput === ''
      ? grandTotal
      : Math.max(0, Math.min(grandTotal, Number(customPaidInput) || 0));
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const status: 'Paid' | 'Partial' | 'Due' =
      dueAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Due';

    const createdOrder = onCreateSale({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      warehouse:
        (warehouseFilter === 'All'
          ? 'Dhaka Central'
          : (warehouseFilter as WarehouseLocation)) || 'Dhaka Central',
      items: cart,
      subtotal,
      discount,
      vatRate,
      vatAmount,
      grandTotal,
      paidAmount,
      dueAmount,
      paymentMethod,
      status,
    });

    setCart([]);
    setDiscount(0);
    setCustomPaidInput('');
    setPreviewOrder(createdOrder);
  };

  const filteredHistory = salesOrders.filter((so) => {
    if (historyFilter === 'Paid') return so.status === 'Paid';
    if (historyFilter === 'Due') return so.dueAmount > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Sales, POS Billing & VAT Invoice Terminal'
              : 'সেলস, পিওএস বিলিং এবং ভ্যাট ইনভয়েস টার্মিনাল'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              {lang === 'en'
                ? 'Auto-deducts warehouse stock & posts double-entry revenue voucher'
                : 'বিক্রয় সম্পন্ন হলে স্বয়ংক্রিয়ভাবে স্টক কমবে এবং লেজারে জমা হবে'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveView('pos')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'pos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'en' ? 'POS & New Invoice' : 'পিওএস ও নতুন বিল'}
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'en'
              ? `Invoice Register (${salesOrders.length})`
              : `ইনভয়েস তালিকা (${formatNum(salesOrders.length, 'bn')})`}
          </button>
        </div>
      </div>

      {activeView === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Columns: Searchable Product Catalog */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Scan barcode, SKU, or type product name...'
                      : 'বারকোড, SKU বা পণ্যের নাম লিখুন...'
                  }
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700"
              >
                <option value="All">
                  {lang === 'en' ? 'All Warehouses' : 'সব ওয়্যারহাউস'}
                </option>
                <option value="Dhaka Central">Dhaka Central</option>
                <option value="Chattogram Port">Chattogram Port</option>
                <option value="Gazipur Factory">Gazipur Factory</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">
                      {lang === 'en' ? 'Item Description' : 'পণ্যের বিবরণ'}
                    </th>
                    <th className="py-2.5 px-4 text-right">
                      {lang === 'en' ? 'Stock' : 'মজুদ'}
                    </th>
                    <th className="py-2.5 px-4 text-right">
                      {lang === 'en' ? 'Unit Price' : 'দর'}
                    </th>
                    <th className="py-2.5 px-4 text-right">
                      {lang === 'en' ? 'Action' : 'যুক্ত করুন'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {availableProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-900">
                          {lang === 'en' ? product.nameEn : product.nameBn}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {product.warehouse} · {product.category}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={
                            product.stock === 0
                              ? 'text-red-600 font-semibold'
                              : product.stock <= product.reorderLevel
                              ? 'text-amber-700 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {formatNum(product.stock, lang)} {product.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatBDT(product.sellingPrice, lang)}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{lang === 'en' ? 'Add' : 'যোগ'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 5 Columns: Active POS Invoice Builder */}
          <form
            onSubmit={handleCheckout}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {lang === 'en' ? 'Active Sales Invoice' : 'চলমান সেলস ইনভয়েস'}
                </h2>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {cart.length} {lang === 'en' ? 'Line Items' : 'টি পদ'}
              </span>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Customer / Company' : 'কাস্টমার / প্রতিষ্ঠান'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'}
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 font-mono tabular-nums border border-slate-200 rounded-md"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {lang === 'en'
                    ? 'No items in invoice. Click "+ Add" from the product list.'
                    : 'ইনভয়েসে কোনো পণ্য নেই। বাম পাশের তালিকা থেকে "+ যোগ" ক্লিক করুন।'}
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 truncate">
                        {lang === 'en' ? item.nameEn : item.nameBn}
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500">
                        {formatBDT(item.unitPrice, lang)} × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, -1)}
                        className="p-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-mono tabular-nums font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, 1)}
                        className="p-1 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-24 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatBDT(item.lineTotal, lang)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Pricing & Tax Controls */}
            <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  {lang === 'en' ? 'Discount (৳)' : 'ডিসকাউন্ট (৳)'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 font-mono tabular-nums border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  {lang === 'en' ? 'VAT Rate (%)' : 'ভ্যাট হার (%)'}
                </label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono tabular-nums border border-slate-200 rounded-md bg-white"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5% (Trade)</option>
                  <option value={7.5}>7.5% (Standard)</option>
                  <option value={15}>15% (Mushak 6.3)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  {lang === 'en' ? 'Payment Mode' : 'পেমেন্ট মাধ্যম'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Cash">Cash (নগদ)</option>
                  <option value="bKash">bKash Merchant</option>
                  <option value="Nagad">Nagad Merchant</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{lang === 'en' ? 'Subtotal' : 'উপ-মোট'}</span>
                <span className="font-mono tabular-nums">
                  {formatBDT(subtotal, lang)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{lang === 'en' ? 'Less Discount' : 'বাদ ডিসকাউন্ট'}</span>
                <span className="font-mono tabular-nums text-slate-700">
                  -{formatBDT(discount, lang)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {lang === 'en'
                    ? `VAT (${vatRate}%)`
                    : `ভ্যাট (${vatRate}%)`}
                </span>
                <span className="font-mono tabular-nums">
                  +{formatBDT(vatAmount, lang)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>{lang === 'en' ? 'Grand Total Payable' : 'সর্বমোট প্রদেয় বিল'}</span>
                <span className="font-mono tabular-nums text-blue-700">
                  {formatBDT(grandTotal, lang)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <label className="text-slate-700 font-medium">
                  {lang === 'en'
                    ? 'Paid Amount (Leave blank for Full Paid):'
                    : 'জমা টাকা (পূর্ণ পরিশোধ হলে খালি রাখুন):'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={grandTotal}
                  placeholder={String(grandTotal)}
                  value={customPaidInput}
                  onChange={(e) => setCustomPaidInput(e.target.value)}
                  className="w-32 px-2.5 py-1 text-right font-mono tabular-nums bg-white border border-slate-300 rounded"
                />
              </div>
              {dueAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-medium pt-1">
                  <span>{lang === 'en' ? 'Balance Due (Receivable)' : 'বকেয়া থাকবে'}</span>
                  <span className="font-mono tabular-nums">
                    {formatBDT(dueAmount, lang)}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={cart.length === 0}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>
                {lang === 'en'
                  ? 'Complete Sale & Generate Invoice'
                  : 'বিক্রয় সম্পন্ন ও ইনভয়েস তৈরি করুন'}
              </span>
            </button>
          </form>
        </div>
      ) : (
        /* Invoice History & Due Collection Register */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              {(['all', 'Paid', 'Due'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setHistoryFilter(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    historyFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all'
                    ? lang === 'en'
                      ? 'All Invoices'
                      : 'সব ইনভয়েস'
                    : st === 'Paid'
                    ? lang === 'en'
                      ? 'Fully Paid'
                      : 'পরিশোধিত'
                    : lang === 'en'
                    ? 'Has Balance Due'
                    : 'বকেয়া আছে'}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              {lang === 'en' ? 'Total Outstanding Receivable:' : 'মোট বকেয়া পাওনা:'}{' '}
              <strong className="font-mono tabular-nums text-amber-700">
                {formatBDT(
                  salesOrders.reduce((s, o) => s + o.dueAmount, 0),
                  lang
                )}
              </strong>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredHistory.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {order.invoiceNo}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500">
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatBDT(order.grandTotal, lang)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 whitespace-nowrap">
                        {formatBDT(order.paidAmount, lang)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-amber-700 whitespace-nowrap">
                        {formatBDT(order.dueAmount, lang)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {order.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Paid' : 'পরিশোধিত'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{order.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {order.dueAmount > 0 && (
                            <button
                              onClick={() =>
                                onCollectDue(
                                  order.id,
                                  order.dueAmount,
                                  'Bank Transfer'
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                            >
                              {lang === 'en' ? 'Collect Due' : 'বকেয়া আদায়'}
                            </button>
                          )}
                          <button
                            onClick={() => setPreviewOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span>{lang === 'en' ? 'Receipt' : 'রিসিপ্ট'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Receipt Modal */}
      {previewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  BARAKAH NEXUS ERP — TAX INVOICE
                </h3>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  {previewOrder.invoiceNo} · Date: {previewOrder.date} · Warehouse:{' '}
                  {previewOrder.warehouse}
                </p>
              </div>
              <button
                onClick={() => setPreviewOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-md border border-slate-200">
              <div>
                <div className="text-slate-400">Billed To:</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {previewOrder.customerName}
                </div>
                <div className="font-mono tabular-nums text-slate-600">
                  Phone: {previewOrder.customerPhone}
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">Settlement Details:</div>
                <div className="font-semibold text-slate-900 mt-0.5">
                  Method: {previewOrder.paymentMethod}
                </div>
                <div className="text-emerald-700 font-medium">
                  Status: {previewOrder.status}
                </div>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs my-4">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <div className="font-medium text-slate-900">
                        {lang === 'en' ? item.nameEn : item.nameBn}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {item.sku}
                      </div>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">
                      {formatBDT(item.unitPrice, lang)}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums font-semibold">
                      {formatBDT(item.lineTotal, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-mono tabular-nums">
                  {formatBDT(previewOrder.subtotal, lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount:</span>
                <span className="font-mono tabular-nums">
                  -{formatBDT(previewOrder.discount, lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  VAT ({previewOrder.vatRate}%):
                </span>
                <span className="font-mono tabular-nums">
                  +{formatBDT(previewOrder.vatAmount, lang)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono tabular-nums">
                  {formatBDT(previewOrder.grandTotal, lang)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Paid Amount:</span>
                <span className="font-mono tabular-nums">
                  {formatBDT(previewOrder.paidAmount, lang)}
                </span>
              </div>
              {previewOrder.dueAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Balance Due:</span>
                  <span className="font-mono tabular-nums">
                    {formatBDT(previewOrder.dueAmount, lang)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Print Invoice' : 'প্রিন্ট করুন'}</span>
              </button>
              <button
                onClick={() => setPreviewOrder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
