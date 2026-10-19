export type Language = 'en' | 'bn';

export type ModuleId =
  | 'dashboard'
  | 'inventory'
  | 'sales'
  | 'accounting'
  | 'hr'
  | 'purchase'
  | 'python_backend';

export type WarehouseLocation =
  | 'Dhaka Central'
  | 'Chattogram Port'
  | 'Gazipur Factory';

export interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  category: string;
  warehouse: WarehouseLocation;
  unit: 'Pcs' | 'Box' | 'Kg' | 'Roll' | 'Set';
  costPrice: number;
  sellingPrice: number;
  stock: number;
  reorderLevel: number;
  supplierName: string;
  lastUpdated: string;
}

export interface SalesOrderItem {
  productId: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  lineTotal: number;
}

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';

export interface SalesOrder {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  warehouse: WarehouseLocation;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  status: 'Paid' | 'Partial' | 'Due';
}

export type AccountHead =
  | 'Cash in Hand'
  | 'City Bank Corporate A/C'
  | 'Mobile Money (bKash/Nagad)'
  | 'Sales Revenue'
  | 'Inventory Asset'
  | 'Cost of Goods Sold'
  | 'Accounts Receivable'
  | 'Accounts Payable'
  | 'Salary & Payroll Expense'
  | 'Warehouse & Utility Expense'
  | 'Logistics & Transport Expense'
  | 'Owner Equity';

export interface LedgerEntry {
  id: string;
  voucherNo: string;
  date: string;
  referenceNo: string;
  accountHead: AccountHead;
  entryType: 'Credit' | 'Debit';
  category: 'Revenue' | 'Expense' | 'Asset' | 'Liability' | 'Payroll' | 'Purchase';
  amount: number;
  paymentMethod: PaymentMethod;
  narration: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'On Leave' | 'Absent';

export interface Employee {
  id: string;
  empCode: string;
  nameEn: string;
  nameBn: string;
  department: 'Operations' | 'Finance & Accounts' | 'Sales & Distribution' | 'Supply Chain' | 'IT & Systems';
  designation: string;
  phone: string;
  joinDate: string;
  basicSalary: number;
  allowance: number;
  deduction: number;
  attendanceStatus: AttendanceStatus;
  payrollStatus: 'Paid' | 'Pending';
  lastPaidMonth: string;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  balancePayable: number;
}

export interface PurchaseOrderItem {
  productId: string;
  sku: string;
  nameEn: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  warehouse: WarehouseLocation;
  items: PurchaseOrderItem[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  status: 'Ordered' | 'In Transit' | 'Received';
}
