"""
Barakah Nexus ERP — SQLAlchemy 2.0 Database Models
Supports SQLite (local development) and PostgreSQL (production deployment).
"""

from datetime import date
from sqlalchemy import String, Integer, Float, Date, ForeignKey, create_engine
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
