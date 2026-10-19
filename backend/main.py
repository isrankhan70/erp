"""
Barakah Nexus ERP — Production FastAPI Application
Run locally with:
    pip install -r requirements.txt
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


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Barakah Nexus ERP FastAPI Engine",
        "currency": "BDT (৳)",
    }


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


@app.patch("/api/v1/inventory/products/{product_id}/stock")
def adjust_stock(product_id: str, delta: int, db: Session = Depends(get_db)):
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock + delta < 0:
        raise HTTPException(status_code=400, detail="Insufficient warehouse stock")
    product.stock += delta
    product.last_updated = str(date.today())
    db.commit()
    return {"id": product.id, "sku": product.sku, "new_stock": product.stock}


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

    # Automatic Double-Entry Ledger Posting
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


@app.get("/api/v1/accounting/ledger")
def list_ledger_entries(db: Session = Depends(get_db)):
    return db.query(LedgerEntryModel).order_by(LedgerEntryModel.date.desc()).all()


@app.post("/api/v1/accounting/ledger")
def create_ledger_entry(payload: LedgerEntryCreate, db: Session = Depends(get_db)):
    entry = LedgerEntryModel(
        id=f"ldg-{uuid.uuid4().hex[:8]}",
        voucher_no=f"VCH-{date.today().year}-{uuid.uuid4().int % 9000 + 1000}",
        date=str(date.today()),
        **payload.model_dump(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.post("/api/v1/hr/payroll/disburse")
def process_monthly_payroll(month_label: str, db: Session = Depends(get_db)):
    pending_staff = db.query(EmployeeModel).filter(EmployeeModel.payroll_status == "Pending").all()
    if not pending_staff:
        return {"disbursed_count": 0, "total_payout_bdt": 0}

    total_payout = 0.0
    for emp in pending_staff:
        net_pay = emp.basic_salary + emp.allowance - emp.deduction
        total_payout += net_pay
        emp.payroll_status = "Paid"
        emp.last_paid_month = month_label

    voucher = LedgerEntryModel(
        id=f"ldg-{uuid.uuid4().hex[:8]}",
        voucher_no=f"VCH-{date.today().year}-{uuid.uuid4().int % 9000 + 1000}",
        date=str(date.today()),
        reference_no=f"PAY-{month_label.upper().replace(' ', '-')}",
        account_head="Salary & Payroll Expense",
        entry_type="Debit",
        category="Payroll",
        amount=total_payout,
        payment_method="Bank Transfer",
        narration=f"Monthly salary disbursement for {len(pending_staff)} employees ({month_label})",
    )
    db.add(voucher)
    db.commit()
    return {"disbursed_count": len(pending_staff), "total_payout_bdt": total_payout}
