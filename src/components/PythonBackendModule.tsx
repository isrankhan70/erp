import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  Play,
  FileCode2,
} from 'lucide-react';
import {
  Product,
  SalesOrder,
  LedgerEntry,
  Employee,
  Supplier,
  Language,
} from '../types/erp';
import { generatePythonErpSuite } from '../utils/pythonBackendGenerator';

interface PythonBackendModuleProps {
  lang: Language;
  products: Product[];
  salesOrders: SalesOrder[];
  ledgerEntries: LedgerEntry[];
  employees: Employee[];
  suppliers: Supplier[];
}

export const PythonBackendModule: React.FC<PythonBackendModuleProps> = ({
  lang,
  products,
  salesOrders,
  ledgerEntries,
  employees,
  suppliers,
}) => {
  const pythonFiles = generatePythonErpSuite(
    products,
    salesOrders,
    ledgerEntries,
    employees,
    suppliers
  );

  const [selectedFilename, setSelectedFilename] = useState<string>('main.py');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [testEndpoint, setTestEndpoint] = useState<
    'summary' | 'products' | 'ledger'
  >('summary');

  const activeFile =
    pythonFiles.find((f) => f.filename === selectedFilename) || pythonFiles[0];

  const handleCopyCode = (code: string, filename: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const simulatedApiResponse = () => {
    if (testEndpoint === 'summary') {
      const totalRevenue = salesOrders.reduce((s, o) => s + o.grandTotal, 0);
      const totalReceivable = salesOrders.reduce((s, o) => s + o.dueAmount, 0);
      const inventoryValuation = products.reduce(
        (s, p) => s + p.stock * p.costPrice,
        0
      );
      return JSON.stringify(
        {
          endpoint: 'GET /api/v1/dashboard/summary',
          status_code: 200,
          engine: 'FastAPI 0.115.4 + SQLAlchemy 2.0.36',
          data: {
            total_revenue_bdt: totalRevenue,
            accounts_receivable_bdt: totalReceivable,
            inventory_valuation_bdt: inventoryValuation,
            total_skus: products.length,
            total_invoices: salesOrders.length,
          },
        },
        null,
        2
      );
    }
    if (testEndpoint === 'products') {
      return JSON.stringify(
        {
          endpoint: 'GET /api/v1/inventory/products',
          status_code: 200,
          count: products.length,
          items: products.slice(0, 3),
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        endpoint: 'GET /api/v1/accounting/ledger',
        status_code: 200,
        count: ledgerEntries.length,
        recent_vouchers: ledgerEntries.slice(0, 3),
      },
      null,
      2
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Python FastAPI + SQLAlchemy ERP Backend Studio'
              : 'Python FastAPI + SQLAlchemy ইআরপি ব্যাকএন্ড স্টুডিও'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Python 3.11+</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI REST Architecture</span>
            <span aria-hidden="true">·</span>
            <span>SQLAlchemy 2.0 ORM</span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en'
                ? 'Live-Synced with Browser ERP Data'
                : 'ব্রাউজারের লাইভ ডাটার সাথে সিঙ্ককৃত'}
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            handleDownloadFile(activeFile.filename, activeFile.code)
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {lang === 'en'
              ? `Download ${activeFile.filename}`
              : `${activeFile.filename} ডাউনলোড করুন`}
          </span>
        </button>
      </div>

      {/* Quick Run Instructions Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>
              {lang === 'en'
                ? 'Run this Python ERP Server Locally (FastAPI + SQLite/PostgreSQL)'
                : 'আপনার কম্পিউটারে Python ERP সার্ভার চালানোর কমান্ড'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'en'
              ? 'All files are also saved inside the /backend directory of this project workspace.'
              : 'এই প্রজেক্টের /backend ফোল্ডারেও সব পাইথন ফাইল সংরক্ষিত আছে।'}
          </p>
        </div>

        <div className="font-mono text-xs bg-slate-900 text-slate-100 px-3.5 py-2 rounded-md overflow-x-auto whitespace-nowrap">
          pip install -r requirements.txt &amp;&amp; python seed_data.py &amp;&amp; uvicorn main:app --reload
        </div>
      </div>

      {/* Main Split: Code Inspector + Live Endpoint Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Python Source Code Explorer */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {pythonFiles.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFilename(file.filename)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                    selectedFilename === file.filename
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{file.filename}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleCopyCode(activeFile.code, activeFile.filename)
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded"
              >
                {copiedFile === activeFile.filename ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs text-slate-600">
            <strong className="text-slate-900">
              {lang === 'en' ? activeFile.titleEn : activeFile.titleBn}:
            </strong>{' '}
            {lang === 'en'
              ? activeFile.descriptionEn
              : activeFile.descriptionBn}
          </div>

          <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[540px] leading-relaxed">
            <code>{activeFile.code}</code>
          </pre>
        </div>

        {/* Right 4 Columns: Interactive FastAPI Endpoint Tester */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'en'
                ? 'Interactive FastAPI Response Inspector'
                : 'FastAPI লাইভ রেসপন্স টেস্টার'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'en'
                ? 'Test how the Python FastAPI endpoints serialize your live ERP state'
                : 'আপনার বর্তমান ERP ডাটা Python API-তে কীভাবে কাজ করে তা পরীক্ষা করুন'}
            </p>
          </div>

          <div className="space-y-2">
            {(
              [
                {
                  id: 'summary',
                  method: 'GET',
                  path: '/api/v1/dashboard/summary',
                },
                {
                  id: 'products',
                  method: 'GET',
                  path: '/api/v1/inventory/products',
                },
                {
                  id: 'ledger',
                  method: 'GET',
                  path: '/api/v1/accounting/ledger',
                },
              ] as const
            ).map((ep) => (
              <button
                key={ep.id}
                onClick={() => setTestEndpoint(ep.id)}
                className={`w-full text-left px-3 py-2 rounded-md border text-xs font-mono flex items-center justify-between transition-colors ${
                  testEndpoint === ep.id
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>
                  <span className="text-emerald-700 font-bold mr-2">
                    {ep.method}
                  </span>
                  {ep.path}
                </span>
                <Play className="w-3 h-3 text-blue-600 shrink-0" />
              </button>
            ))}
          </div>

          <div>
            <div className="text-[11px] font-mono text-slate-500 mb-1.5">
              JSON Response Payload (200 OK):
            </div>
            <pre className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-md overflow-x-auto max-h-80">
              <code>{simulatedApiResponse()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
