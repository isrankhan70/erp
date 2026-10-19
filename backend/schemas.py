"""
Barakah Nexus ERP — Pydantic v2 Validation Schemas
"""

from typing import List, Optional
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
