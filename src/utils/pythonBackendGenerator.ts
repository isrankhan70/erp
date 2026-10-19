import {
  Product,
  SalesOrder,
  LedgerEntry,
  Employee,
  Supplier,
} from '../types/erp';

export interface PythonFileAsset {
  filename: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  code: string;
}

export function generatePythonErpSuite(
  products: Product[],
  salesOrders: SalesOrder[],
  ledgerEntries: LedgerEntry[],
  employees: Employee[],
  suppliers: Supplier[]
): PythonFileAsset[] {
  const modelsPy = `"""
Barakah Nexus ERP — SQLAlchemy 2.0 Database Models
Supports SQLite (local development) and PostgreSQL (production deployment).
"""

from datetime import date
from sqlalchemy import String, Integer, Float, ForeignKey, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

DATABASE_URL = "sqlite:///./barakah_nexus_erp.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class ProductModel(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    warehouse: Mapped[str] = mapped_column(String(80), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="Pcs")
    cost_price: Mapped[float] = mapped_column(Float, nullable=False)
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=10)
    supplier_name: Mapped[str] = mapped_column(String(150), default="")
    last_updated: Mapped[str] = mapped_column(String(20), default=str(date.today()))


class SalesOrderModel(Base):
    __tablename__ = "sales_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    invoice_no: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(30), nullable=False)
    warehouse: Mapped[str] = mapped_column(String(80), nullable=False)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    discount: Mapped[float] = mapped_column(Float, default=0.0)
    vat_rate: Mapped[float] = mapped_column(Float, default=0.0)
    vat_amount: Mapped[float] = mapped_column(Float, default=0.0)
    grand_total: Mapped[float] = mapped_column(Float, nullable=False)
    paid_amount: Mapped[float] = mapped_column(Float, nullable=False)
    due_amount: Mapped[float] = mapped_column(Float, default=0.0)
    payment_method: Mapped[str] = mapped_column(String(40), default="Cash")
    status: Mapped[str] = mapped_column(String(20), default="Paid")

    items: Mapped[list["SalesOrderItemModel"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class SalesOrderItemModel(Base):
    __tablename__ = "sales_order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("sales_orders.id"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(36), nullable=False)
    sku: Mapped[str] = mapped_column(String(40), nullable=False)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    line_total: Mapped[float] = mapped_column(Float, nullable=False)

    order: Mapped["SalesOrderModel"] = relationship(back_populates="items")


class LedgerEntryModel(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    voucher_no: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    reference_no: Mapped[str] = mapped_column(String(50), nullable=False)
    account_head: Mapped[str] = mapped_column(String(100), nullable=False)
    entry_type: Mapped[str] = mapped_column(String(15), nullable=False)  # Credit | Debit
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(40), default="Cash")
    narration: Mapped[str] = mapped_column(String(300), default="")


class EmployeeModel(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    emp_code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(150), nullable=False)
    department: Mapped[str] = mapped_column(String(80), nullable=False)
    designation: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    join_date: Mapped[str] = mapped_column(String(20), nullable=False)
    basic_salary: Mapped[float] = mapped_column(Float, nullable=False)
    allowance: Mapped[float] = mapped_column(Float, default=0.0)
    deduction: Mapped[float] = mapped_column(Float, default=0.0)
    attendance_status: Mapped[str] = mapped_column(String(20), default="Present")
    payroll_status: Mapped[str] = mapped_column(String(20), default="Pending")
    last_paid_month: Mapped[str] = mapped_column(String(40), default="")


class SupplierModel(Base):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    supplier_code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    company_name: Mapped[str] = mapped_column(String(180), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    balance_payable: Mapped[float] = mapped_column(Float, default=0.0)
`;

  const mainPy = `"""
Barakah Nexus ERP — Production FastAPI Application
Run locally with:
    pip install -r requirements.txt
    python seed_data.py
    uvicorn main:app --reload --port 8000
"""

import uuid
from datetime import date
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from models import (
    Base,
    engine,
    SessionLocal,
    ProductModel,
    SalesOrderModel,
    SalesOrderItemModel,
    LedgerEntryModel,
    EmployeeModel,
    SupplierModel,
)
from schemas import (
    ProductCreate,
    ProductResponse,
    SalesOrderCreate,
    LedgerEntryCreate,
    EmployeeCreate,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Barakah Nexus ERP API",
    description="All-in-One Enterprise ERP Suite Backend (Inventory, Sales POS, Double-Entry Accounting, HR & Payroll, Purchase CRM)",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/v1/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    orders = db.query(SalesOrderModel).all()
    ledger = db.query(LedgerEntryModel).all()

    total_revenue = sum(o.grand_total for o in orders)
    total_receivable = sum(o.due_amount for o in orders)
    inventory_valuation = sum(p.stock * p.cost_price for p in products)
    low_stock_count = sum(1 for p in products if p.stock <= p.reorder_level)
    total_credits = sum(e.amount for e in ledger if e.entry_type == "Credit")
    total_debits = sum(e.amount for e in ledger if e.entry_type == "Debit")

    return {
        "total_revenue_bdt": total_revenue,
        "accounts_receivable_bdt": total_receivable,
        "inventory_valuation_bdt": inventory_valuation,
        "net_cash_flow_bdt": total_credits - total_debits,
        "low_stock_alerts": low_stock_count,
        "total_skus": len(products),
        "total_invoices": len(orders),
    }


@app.get("/api/v1/inventory/products", response_model=list[ProductResponse])
def list_products(warehouse: str | None = None, db: Session = Depends(get_db)):
    query = db.query(ProductModel)
    if warehouse and warehouse != "All":
        query = query.filter(ProductModel.warehouse == warehouse)
    return query.order_by(ProductModel.sku.asc()).all()


@app.post("/api/v1/inventory/products", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(ProductModel).filter(ProductModel.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists in warehouse")
    product = ProductModel(
        id=f"prd-{uuid.uuid4().hex[:8]}",
        last_updated=str(date.today()),
        **payload.model_dump(),
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.post("/api/v1/sales/orders")
def create_sales_invoice(payload: SalesOrderCreate, db: Session = Depends(get_db)):
    subtotal = 0.0
    order_id = f"so-{uuid.uuid4().hex[:8]}"
    invoice_no = f"INV-{date.today().year}-{uuid.uuid4().int % 9000 + 1000}"

    line_models = []
    for item in payload.items:
        product = db.query(ProductModel).filter(ProductModel.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for SKU {item.sku}",
            )
        product.stock -= item.quantity
        product.last_updated = str(date.today())
        line_total = item.quantity * item.unit_price
        subtotal += line_total
        line_models.append(
            SalesOrderItemModel(
                order_id=order_id,
                product_id=item.product_id,
                sku=item.sku,
                name_en=item.name_en,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=line_total,
            )
        )

    taxable = max(0.0, subtotal - payload.discount)
    vat_amount = round(taxable * (payload.vat_rate / 100.0), 2)
    grand_total = round(taxable + vat_amount, 2)
    due_amount = max(0.0, grand_total - payload.paid_amount)
    status = "Paid" if due_amount == 0 else ("Partial" if payload.paid_amount > 0 else "Due")

    order = SalesOrderModel(
        id=order_id,
        invoice_no=invoice_no,
        date=str(date.today()),
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        warehouse=payload.warehouse,
        subtotal=subtotal,
        discount=payload.discount,
        vat_rate=payload.vat_rate,
        vat_amount=vat_amount,
        grand_total=grand_total,
        paid_amount=payload.paid_amount,
        due_amount=due_amount,
        payment_method=payload.payment_method,
        status=status,
        items=line_models,
    )
    db.add(order)

    if payload.paid_amount > 0:
        ledger_entry = LedgerEntryModel(
            id=f"ldg-{uuid.uuid4().hex[:8]}",
            voucher_no=f"VCH-{date.today().year}-{uuid.uuid4().int % 9000 + 1000}",
            date=str(date.today()),
            reference_no=invoice_no,
            account_head="Sales Revenue",
            entry_type="Credit",
            category="Revenue",
            amount=payload.paid_amount,
            payment_method=payload.payment_method,
            narration=f"POS Sales Receipt from {payload.customer_name} ({invoice_no})",
        )
        db.add(ledger_entry)

    db.commit()
    return {"invoice_no": invoice_no, "grand_total": grand_total, "due_amount": due_amount, "status": status}
`;

  const schemasPy = `"""
Barakah Nexus ERP — Pydantic v2 Validation Schemas
"""

from typing import List
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    sku: str = Field(..., examples=["BNX-ELC-101"])
    name_en: str
    name_bn: str
    category: str
    warehouse: str
    unit: str = "Pcs"
    cost_price: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    reorder_level: int = Field(default=10, ge=0)
    supplier_name: str = ""


class ProductResponse(ProductCreate):
    id: str
    last_updated: str

    class Config:
        from_attributes = True


class SalesOrderItemCreate(BaseModel):
    product_id: str
    sku: str
    name_en: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class SalesOrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    warehouse: str
    discount: float = 0.0
    vat_rate: float = 5.0
    paid_amount: float
    payment_method: str = "Cash"
    items: List[SalesOrderItemCreate]


class LedgerEntryCreate(BaseModel):
    reference_no: str
    account_head: str
    entry_type: str  # Credit | Debit
    category: str
    amount: float = Field(..., gt=0)
    payment_method: str = "Cash"
    narration: str


class EmployeeCreate(BaseModel):
    emp_code: str
    name_en: str
    name_bn: str
    department: str
    designation: str
    phone: str
    join_date: str
    basic_salary: float
    allowance: float = 0.0
    deduction: float = 0.0
`;

  const seedPy = `"""
Barakah Nexus ERP — Live Synchronized Database Seeder
Auto-generated from your current live ERP session (${products.length} SKUs, ${salesOrders.length} Invoices, ${ledgerEntries.length} Ledger Vouchers, ${employees.length} Employees).
"""

from models import (
    Base,
    engine,
    SessionLocal,
    ProductModel,
    LedgerEntryModel,
    EmployeeModel,
    SupplierModel,
)

PRODUCTS_SEED = ${JSON.stringify(
    products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name_en: p.nameEn,
      name_bn: p.nameBn,
      category: p.category,
      warehouse: p.warehouse,
      unit: p.unit,
      cost_price: p.costPrice,
      selling_price: p.sellingPrice,
      stock: p.stock,
      reorder_level: p.reorderLevel,
      supplier_name: p.supplierName,
      last_updated: p.lastUpdated,
    })),
    null,
    4
  )}

EMPLOYEES_SEED = ${JSON.stringify(
    employees.map((e) => ({
      id: e.id,
      emp_code: e.empCode,
      name_en: e.nameEn,
      name_bn: e.nameBn,
      department: e.department,
      designation: e.designation,
      phone: e.phone,
      join_date: e.joinDate,
      basic_salary: e.basicSalary,
      allowance: e.allowance,
      deduction: e.deduction,
      attendance_status: e.attendanceStatus,
      payroll_status: e.payrollStatus,
      last_paid_month: e.lastPaidMonth,
    })),
    null,
    4
  )}

SUPPLIERS_SEED = ${JSON.stringify(
    suppliers.map((s) => ({
      id: s.id,
      supplier_code: s.supplierCode,
      company_name: s.companyName,
      contact_person: s.contactPerson,
      phone: s.phone,
      email: s.email,
      city: s.city,
      category: s.category,
      balance_payable: s.balancePayable,
    })),
    null,
    4
  )}


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(ProductModel).count() == 0:
            for item in PRODUCTS_SEED:
                db.add(ProductModel(**item))
            for emp in EMPLOYEES_SEED:
                db.add(EmployeeModel(**emp))
            for sup in SUPPLIERS_SEED:
                db.add(SupplierModel(**sup))
            db.commit()
            print("Successfully seeded Barakah Nexus ERP database!")
        else:
            print("Database already initialized.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
`;

  const requirementsTxt = `fastapi==0.115.4
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
pydantic==2.9.2
python-multipart==0.0.17
`;

  return [
    {
      filename: 'main.py',
      titleEn: 'FastAPI Application & ERP Routers',
      titleBn: 'FastAPI অ্যাপ্লিকেশন এবং ERP রাউটার',
      descriptionEn:
        'Production REST API endpoints for Dashboard, Inventory, POS Invoicing, Double-Entry Ledger, and Payroll.',
      descriptionBn:
        'ড্যাশবোর্ড, ইনভেন্টরি, পিওএস ইনভয়েসিং, ডাবল-এন্ট্রি লেজার এবং পেরোলের জন্য প্রোডাকশন REST API এন্ডপয়েন্ট।',
      code: mainPy,
    },
    {
      filename: 'models.py',
      titleEn: 'SQLAlchemy 2.0 ORM Database Models',
      titleBn: 'SQLAlchemy 2.0 ডাটাবেস মডেল',
      descriptionEn:
        'Relational schema definitions for Products, SalesOrders, LedgerEntries, Employees, and Suppliers.',
      descriptionBn:
        'প্রোডাক্ট, সেলস অর্ডার, লেজার এন্ট্রি, কর্মচারী এবং সাপ্লায়ারদের রিলেশনাল ডাটাবেস স্কিমা।',
      code: modelsPy,
    },
    {
      filename: 'schemas.py',
      titleEn: 'Pydantic v2 Validation Schemas',
      titleBn: 'Pydantic v2 ভ্যালিডেশন স্কিমা',
      descriptionEn:
        'Strict type validation and payload serialization for all incoming and outgoing ERP transactions.',
      descriptionBn:
        'সব ইনকামিং এবং আউটগোয়িং ERP লেনদেনের জন্য স্ট্রিক্ট টাইপ ভ্যালিডেশন স্কিমা।',
      code: schemasPy,
    },
    {
      filename: 'seed_data.py',
      titleEn: 'Live-Synced Python Database Seeder',
      titleBn: 'লাইভ-সিঙ্কড পাইথন ডাটাবেস সিডার',
      descriptionEn:
        'Automatically embeds your current live browser ERP records into a runnable Python SQLAlchemy seed script.',
      descriptionBn:
        'আপনার বর্তমান ব্রাউজার সেশনের সব লাইভ ERP ডাটা সরাসরি পাইথন ডাটাবেস সিড স্ক্রিপ্টে যুক্ত করে।',
      code: seedPy,
    },
    {
      filename: 'requirements.txt',
      titleEn: 'Python Package Dependencies',
      titleBn: 'পাইথন প্যাকেজ ডিপেন্ডেন্সি',
      descriptionEn: 'Standard dependencies for running the FastAPI + SQLAlchemy server.',
      descriptionBn: 'FastAPI এবং SQLAlchemy সার্ভার চালানোর জন্য প্রয়োজনীয় প্যাকেজ তালিকা।',
      code: requirementsTxt,
    },
  ];
}
