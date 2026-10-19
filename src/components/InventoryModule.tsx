import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';
import {
  Product,
  WarehouseLocation,
  Language,
} from '../types/erp';
import { formatBDT, formatNum } from '../data/initialErpData';

interface InventoryModuleProps {
  lang: Language;
  products: Product[];
  onAddProduct: (newProduct: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onAdjustStock: (productId: string, delta: number, reason: string) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  lang,
  products,
  onAddProduct,
  onAdjustStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<
    'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  >('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(
    null
  );
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>(
    'Manual Warehouse Audit Adjustment'
  );

  // New Product Form State
  const [sku, setSku] = useState('BNX-IND-901');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('Electrical Equipment');
  const [warehouse, setWarehouse] = useState<WarehouseLocation>('Dhaka Central');
  const [unit, setUnit] = useState<'Pcs' | 'Box' | 'Kg' | 'Roll' | 'Set'>('Pcs');
  const [costPrice, setCostPrice] = useState<number>(12000);
  const [sellingPrice, setSellingPrice] = useState<number>(15500);
  const [stock, setStock] = useState<number>(25);
  const [reorderLevel, setReorderLevel] = useState<number>(10);
  const [supplierName, setSupplierName] = useState(
    'Meghna Electro Dynamics Ltd.'
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameBn.includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWarehouse =
      warehouseFilter === 'All' || p.warehouse === warehouseFilter;

    const matchesStock =
      stockStatusFilter === 'all'
        ? true
        : stockStatusFilter === 'out_of_stock'
        ? p.stock === 0
        : stockStatusFilter === 'low_stock'
        ? p.stock > 0 && p.stock <= p.reorderLevel
        : p.stock > p.reorderLevel;

    return matchesSearch && matchesWarehouse && matchesStock;
  });

  const totalCostValuation = filteredProducts.reduce(
    (sum, p) => sum + p.stock * p.costPrice,
    0
  );
  const totalRetailValuation = filteredProducts.reduce(
    (sum, p) => sum + p.stock * p.sellingPrice,
    0
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !sku.trim()) return;
    onAddProduct({
      sku: sku.trim().toUpperCase(),
      nameEn: nameEn.trim(),
      nameBn: nameBn.trim() || nameEn.trim(),
      category,
      warehouse,
      unit,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stock: Number(stock) || 0,
      reorderLevel: Number(reorderLevel) || 5,
      supplierName: supplierName.trim() || 'Direct Procurement',
    });
    setNameEn('');
    setNameBn('');
    setSku(`BNX-IND-${Math.floor(100 + Math.random() * 899)}`);
    setShowAddModal(false);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct || adjustDelta === 0) return;
    onAdjustStock(adjustModalProduct.id, adjustDelta, adjustReason);
    setAdjustModalProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Inventory, Stock & Multi-Warehouse Control'
              : 'ইনভেন্টরি, স্টক ও মাল্টি-ওয়্যারহাউস ব্যবস্থাপনা'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              {lang === 'en' ? 'Cost Valuation:' : 'ক্রয়মূল্যে মজুদ:'}{' '}
              <strong className="font-mono tabular-nums text-slate-800">
                {formatBDT(totalCostValuation, lang)}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en' ? 'Retail Valuation:' : 'বিক্রয়মূল্যে মজুদ:'}{' '}
              <strong className="font-mono tabular-nums text-slate-800">
                {formatBDT(totalRetailValuation, lang)}
              </strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Add New Product SKU' : 'নতুন পণ্য যুক্ত করুন'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Search by SKU, product name (EN/BN), or category...'
                : 'SKU কোড, পণ্যের নাম বা ক্যাটাগরি দিয়ে খুঁজুন...'
            }
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Warehouse Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['All', 'Dhaka Central', 'Chattogram Port', 'Gazipur Factory'] as const).map(
              (wh) => (
                <button
                  key={wh}
                  onClick={() => setWarehouseFilter(wh)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    warehouseFilter === wh
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {wh === 'All'
                    ? lang === 'en'
                      ? 'All Warehouses'
                      : 'সব ওয়্যারহাউস'
                    : wh}
                </button>
              )
            )}
          </div>

          {/* Stock Status Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) =>
              setStockStatusFilter(
                e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
              )
            }
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-blue-600"
          >
            <option value="all">
              {lang === 'en' ? 'All Stock Levels' : 'সব স্টক লেভেল'}
            </option>
            <option value="in_stock">
              {lang === 'en' ? 'In Stock (Healthy)' : 'পর্যাপ্ত মজুদ (In Stock)'}
            </option>
            <option value="low_stock">
              {lang === 'en' ? 'Low Stock (Reorder)' : 'কম মজুদ (Low Stock)'}
            </option>
            <option value="out_of_stock">
              {lang === 'en' ? 'Out of Stock (0)' : 'স্টক আউট (০)'}
            </option>
          </select>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">{lang === 'en' ? 'SKU Code' : 'SKU কোড'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Product & Category' : 'পণ্যের নাম ও বিভাগ'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Warehouse' : 'ওয়্যারহাউস'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Cost Price' : 'ক্রয়মূল্য'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Selling Price' : 'বিক্রয়মূল্য'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Available Stock' : 'বর্তমান মজুদ'}</th>
                <th className="py-3 px-4">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                <th className="py-3 px-4 text-right">{lang === 'en' ? 'Stock Actions' : 'স্টক সমন্বয়'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    {lang === 'en'
                      ? 'No inventory items match the selected filter.'
                      : 'নির্বাচিত ফিল্টারে কোনো পণ্য পাওয়া যায়নি।'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOut = product.stock === 0;
                  const isLow =
                    product.stock > 0 && product.stock <= product.reorderLevel;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {lang === 'en' ? product.nameEn : product.nameBn}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{product.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{product.supplierName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {product.warehouse}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatBDT(product.costPrice, lang)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatBDT(product.sellingPrice, lang)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                        {formatNum(product.stock, lang)}{' '}
                        <span className="font-sans font-normal text-slate-500">
                          {product.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Out of Stock' : 'স্টক আউট'}</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Low Stock' : 'কম মজুদ'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'In Stock' : 'পর্যাপ্ত'}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              onAdjustStock(
                                product.id,
                                10,
                                'Quick +10 Warehouse Inward'
                              )
                            }
                            className="px-2 py-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => {
                              if (product.stock > 0) {
                                onAdjustStock(
                                  product.id,
                                  -1,
                                  'Quick -1 Sample/Damage Dispatch'
                                );
                              }
                            }}
                            disabled={product.stock === 0}
                            className="px-2 py-1 text-[11px] font-mono font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded transition-colors"
                            title="Deduct 1 unit"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => {
                              setAdjustModalProduct(product);
                              setAdjustDelta(20);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                          >
                            <ArrowUpDown className="w-3 h-3" />
                            <span>{lang === 'en' ? 'Audit' : 'সমন্বয়'}</span>
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en'
                  ? 'Register New Inventory SKU'
                  : 'নতুন ইনভেন্টরি পণ্য নিবন্ধন করুন'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Warehouse Location' : 'ওয়্যারহাউস'}
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
                  {lang === 'en' ? 'Product Name (English) *' : 'পণ্যের নাম (ইংরেজি) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industrial Servo Stabilizer 15kVA"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Product Name (বাংলা)' : 'পণ্যের নাম (বাংলা)'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ইন্ডাস্ট্রিয়াল সার্ভো স্ট্যাবিলাইজার ১৫কেভিএ"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Category' : 'ক্যাটাগরি'}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Unit' : 'একক (Unit)'}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) =>
                      setUnit(e.target.value as 'Pcs' | 'Box' | 'Kg' | 'Roll' | 'Set')
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Roll">Roll</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cost Price (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Selling Price (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Reorder Alert
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Primary Supplier' : 'মূল সাপ্লায়ার'}
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {lang === 'en' ? 'Save SKU to Warehouse' : 'পণ্য সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Audit Adjustment Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en' ? 'Stock Audit & Adjustment' : 'স্টক অডিট ও সমন্বয়'}
              </h3>
              <button
                onClick={() => setAdjustModalProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="font-semibold text-slate-900">
                  {lang === 'en'
                    ? adjustModalProduct.nameEn
                    : adjustModalProduct.nameBn}
                </div>
                <div className="text-slate-500 mt-0.5 font-mono tabular-nums">
                  {adjustModalProduct.sku} · Current Stock: {adjustModalProduct.stock}{' '}
                  {adjustModalProduct.unit}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en'
                    ? 'Quantity Change (+ to Add, - to Deduct)'
                    : 'পরিমাণ পরিবর্তন (+ যোগ করতে, - কমাতে)'}
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {lang === 'en' ? 'Audit Narration / Reason' : 'সমন্বয়ের কারণ'}
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {lang === 'en' ? 'Confirm Stock Update' : 'স্টক আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
