import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Truck,
  PackageCheck,
  X,
} from 'lucide-react';
import {
  Supplier,
  PurchaseOrder,
  Product,
  WarehouseLocation,
  PaymentMethod,
  Language,
} from '../types/erp';
import { formatBDT } from '../data/initialErpData';

interface PurchaseCrmModuleProps {
  lang: Language;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onReceivePurchaseOrder: (poId: string) => void;
  onCreatePurchaseOrder: (
    po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'date'>
  ) => void;
  onPaySupplier: (supplierId: string, amount: number) => void;
}

export const PurchaseCrmModule: React.FC<PurchaseCrmModuleProps> = ({
  lang,
  suppliers,
  purchaseOrders,
  products,
  onReceivePurchaseOrder,
  onCreatePurchaseOrder,
  onPaySupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'po' | 'suppliers'>('po');
  const [showCreatePoModal, setShowCreatePoModal] = useState(false);

  // Create PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    suppliers[0]?.id || 'sup-1'
  );
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id || 'prd-1'
  );
  const [warehouse, setWarehouse] =
    useState<WarehouseLocation>('Dhaka Central');
  const [quantity, setQuantity] = useState<number>(15);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Bank Transfer');

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const product = products.find((p) => p.id === selectedProductId);
    if (!supplier || !product || quantity <= 0) return;

    const lineTotal = quantity * product.costPrice;
    onCreatePurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      warehouse,
      items: [
        {
          productId: product.id,
          sku: product.sku,
          nameEn: product.nameEn,
          quantity,
          unitCost: product.costPrice,
          lineTotal,
        },
      ],
      totalAmount: lineTotal,
      paidAmount: lineTotal,
      paymentMethod,
      status: 'Ordered',
    });
    setShowCreatePoModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Purchase Orders, Procurement & Supplier CRM'
              : 'পারচেজ অর্ডার (PO), ক্রয় ও সাপ্লায়ার সিআরএম'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              {lang === 'en'
                ? 'Receiving a Purchase Order automatically increments warehouse stock & updates ledger'
                : 'পারচেজ অর্ডার রিসিভ করলে স্বয়ংক্রিয়ভাবে ওয়্যারহাউস স্টক বৃদ্ধি পাবে'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('po')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'po'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Purchase Orders' : 'পারচেজ অর্ডার'}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'en' ? 'Supplier Directory' : 'সাপ্লায়ার তালিকা'}
            </button>
          </div>

          <button
            onClick={() => setShowCreatePoModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Create Purchase Order' : 'নতুন পারচেজ অর্ডার'}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'po' ? (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Ordered Items</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Warehouse Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {purchaseOrders.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {po.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {po.items.map((item, idx) => (
                        <div key={idx}>
                          <span className="font-mono tabular-nums font-semibold">
                            {item.quantity}×
                          </span>{' '}
                          {item.nameEn}{' '}
                          <span className="text-[11px] font-mono text-slate-400">
                            ({item.sku})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {po.warehouse}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {formatBDT(po.totalAmount, lang)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {po.status === 'Received' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'en' ? 'Stock Received' : 'গুদামে গৃহীত'}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{po.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {po.status !== 'Received' ? (
                        <button
                          onClick={() => onReceivePurchaseOrder(po.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'en'
                              ? 'Receive into Stock'
                              : 'স্টকে গ্রহণ করুন'}
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Inventory Updated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Accounts Payable</th>
                  <th className="py-3 px-4 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {suppliers.map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {sup.supplierCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {sup.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500">{sup.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{sup.contactPerson}</div>
                      <div className="text-[11px] font-mono tabular-nums text-slate-500">
                        {sup.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{sup.city}</td>
                    <td className="py-3 px-4 text-slate-600">{sup.category}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {formatBDT(sup.balancePayable, lang)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {sup.balancePayable > 0 ? (
                        <button
                          onClick={() =>
                            onPaySupplier(sup.id, sup.balancePayable)
                          }
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          {lang === 'en'
                            ? 'Settle Payable'
                            : 'বকেয়া পরিশোধ'}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          {lang === 'en' ? 'Cleared' : 'পরিশোধিত'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {showCreatePoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en'
                  ? 'Issue New Purchase Order (PO)'
                  : 'নতুন পারচেজ অর্ডার (PO) তৈরি করুন'}
              </h3>
              <button
                onClick={() => setShowCreatePoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Select Supplier' : 'সাপ্লায়ার নির্বাচন করুন'}
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Product SKU to Order' : 'পণ্য নির্বাচন করুন'}
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.nameEn} (Cost: ৳{p.costPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Order Quantity' : 'পরিমাণ'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Receiving Warehouse' : 'ওয়্যারহাউস'}
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) =>
                      setWarehouse(e.target.value as WarehouseLocation)
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="Dhaka Central">Dhaka Central</option>
                    <option value="Chattogram Port">Chattogram Port</option>
                    <option value="Gazipur Factory">Gazipur Factory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreatePoModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {lang === 'en' ? 'Issue PO' : 'PO ইস্যু করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
