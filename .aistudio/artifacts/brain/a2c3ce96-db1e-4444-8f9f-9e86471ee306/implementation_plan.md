# Barakah Nexus ERP — Enterprise Resource Planning Suite

An all-in-one, standard enterprise ERP platform built for Bangladeshi and international businesses, unifying Inventory & Warehouse, Sales & POS Invoicing, Double-Entry Accounting, HR & Payroll, and Purchase & Supplier CRM in a bilingual (English / বাংলা) interface with BDT (`৳`) currency support and a full Python FastAPI backend export suite.

### User Review & Critical Decisions

> [!IMPORTANT]
> Please review the confirmed functional scope and architectural decisions below before we build the application.

- **Confirmed Decision 1 — All-in-One Enterprise ERP Scope**: The platform will include an Executive Overview plus all five core operational modules: Inventory & Warehouse, Sales & POS Billing, Accounting & Ledger, HR & Payroll, and Purchase & Supplier CRM.
- **Confirmed Decision 2 — Live Web ERP + Python FastAPI Backend Suite**: Because the live browser preview runs in a web container, the application will run as a full-featured interactive ERP in the browser while providing a built-in **Python FastAPI + SQLAlchemy ERP Backend Studio** where you can inspect, customize, and download the complete Python backend (`FastAPI` routes, `SQLAlchemy` models, `Pydantic` schemas, and `SQLite/PostgreSQL` database setup) synchronized with your live ERP data model.
- **Confirmed Decision 3 — BDT (`৳`) Currency & Bilingual (English / বাংলা) Interface**: All financial figures, invoices, ledgers, and payslips will be formatted in Bangladeshi Taka (`৳`) with tabular numeral alignment, alongside an instant one-click language switcher between **English** and **বাংলা (Bangla)**.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a centralized command center for managing end-to-end business operations—from purchasing raw goods from suppliers and tracking multi-warehouse stock levels to generating VAT-compliant POS sales invoices, recording double-entry accounting transactions, and processing monthly employee payroll.
- **Target Audience / Persona**: Business owners, operations managers, accountants, and store managers in Bangladesh looking for a clean, standard, high-efficiency ERP system without visual clutter.
- **Key Value**: Eliminates fragmented spreadsheets by linking every operational action together—completing a Sale or Purchase Order automatically updates Inventory stock quantities and posts the corresponding Journal Entry into the Financial Ledger.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Executive Command Dashboard**: View real-time revenue, net profit, accounts receivable/payable, low-stock alerts, cash-flow trends, and recent cross-module transactions, with quick-action triggers.
  2. **Inventory & Warehouse Management**: Filter products by warehouse (`Dhaka Central`, `Chattogram Port`, `Gazipur Factory`) or stock state, adjust stock levels, transfer items, and add new SKUs with cost price, selling price, and reorder thresholds.
  3. **Sales, Billing & POS Terminal**: Create itemized customer invoices or run fast POS checkout with barcode/SKU search, automatic VAT (%) and discount calculation, payment method selection (`Cash`, `bKash`, `Nagad`, `Bank Transfer`), and printable A4/thermal invoice receipts.
  4. **Accounting, General Ledger & Expenses**: Track Chart of Accounts (`Assets`, `Liabilities`, `Equity`, `Revenue`, `Expenses`), post balanced journal entries or operational expenses, and inspect real-time Trial Balance and Profit & Loss summaries.
  5. **HR, Attendance & Payroll**: Manage employee profiles, designations, departments, daily attendance status (`Present`, `Late`, `Leave`), and run 1-click monthly salary sheet generation with basic pay, allowances, and deductions.
  6. **Purchase Orders & Supplier CRM**: Maintain vendor directory, track supplier balances, issue Purchase Orders (PO), and mark POs as "Received" to automatically increment warehouse inventory.
  7. **Python FastAPI Backend Exporter**: Open the Python Backend drawer/view to inspect and download ready-to-run Python ERP code (`FastAPI` REST endpoints, `SQLAlchemy` ORM models, and live SQLite seed script reflecting current ERP records).

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-craft Enterprise SaaS & Financial Workspace—crisp, authoritative, and scannable, following strict anti-slop and single-elevation depth principles.
  - *Color Palette & Mood (60-30-10 Discipline)*:
    - **60% Dominant Canvas**: Crisp Alabaster Slate (`#F8FAFC`) main workspace canvas with pure white (`#FFFFFF`) primary data surfaces.
    - **30% Structural Surfaces**: Deep Enterprise Slate (`#0F172A`) left navigation sidebar and subtle hairline borders (`#E2E8F0`) separating table rows and metric cells without nested card shadows.
    - **10% Accent Budget**: Royal Indigo (`#2563EB`) for primary actions and active navigation states, paired with semantic status indicators always accompanied by explicit text labels: Emerald (`#16A34A`) for Paid / In Stock / Present, Amber (`#D97706`) for Low Stock / Pending / Partial, and Crimson (`#DC2626`) for Overdue / Out of Stock / Absent.
  - *Typography & Hierarchy (2+1 Font Rule)*:
    - **Display & Navigation**: `Plus Jakarta Sans` (SemiBold/Bold 600–700) for clean executive headers and section titles.
    - **Body & Bilingual UI**: `Public Sans` (paired with clean Bangla system/Noto rendering) at `13px–15px` for dense table scannability.
    - **Financials, SKUs & Telemetry**: `JetBrains Mono` with strict `font-variant-numeric: tabular-nums` so every BDT (`৳`) column, quantity, invoice ID, and date aligns vertically to the decimal point.
  - *Component Styling & Layout*:
    - **Workspace Canvas**: `260px` fixed left sidebar navigation + single-row Top Bar adhering strictly to the 3-zone contract (Contextual Breadcrumb trail on the left, quick module switcher in the center, and Language Toggle `EN / বাংলা` + primary contextual CTA button on the right) + full-width `1440px` fluid data viewport.
    - **High-Density Data Grids**: `40px` compact row heights, left-aligned text columns, right-aligned numeric/currency columns, and unboxed metadata using clean typographic separators (`·`).

- **Interactive Feedback & Motion**:
  - Instant client-side search, warehouse/category segmented filtering, and column sorting within `150ms`.
  - Clean slide-over drawers and modals for creating new products, invoices, journal entries, employees, and purchase orders with validation and instant state updates.
  - Dedicated printable invoice preview modal for customer billing and salary slips.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Cross-Module Reactive State Synchronization**:
  - *Chosen Approach*: A unified reactive ERP store with automatic cross-module side effects and persistent browser storage (`localStorage` + seed reset/import/export).
  - *Why*: When you complete a POS Sale in the Sales module, the ERP immediately deducts the sold quantities from the Inventory module and records a Revenue receipt in the Accounting Ledger—behaving like a real enterprise ERP rather than disconnected static screens.
  - *Alternatives Considered*: Separate isolated mock arrays per tab were rejected because changes in one module would not reflect in financial totals or stock counts.
- **Decision 2 — Live Web Execution + Complete Python FastAPI Code Suite**:
  - *Chosen Approach*: Deliver a 100% interactive web ERP alongside a dedicated **Python FastAPI + SQLAlchemy Architecture & Export Module** containing complete, production-ready Python source code (`FastAPI` REST routers, `SQLAlchemy` database models, `Pydantic` validation schemas, JWT auth middleware, and an exportable SQLite seed script dynamically populated with your current ERP data).
  - *Why*: Gives you immediate visual, interactive use of the full ERP inside the live preview while fulfilling your requirement for an expert Python ERP codebase that you can run locally with `uvicorn`.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     BARAKAH NEXUS ERP — SYSTEM ARCHITECTURE                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
       ┌───────────────────────────────┴───────────────────────────────┐
       ▼                                                               ▼
┌─────────────────────────────────────────────┐   ┌────────────────────────────┐
│     Unified ERP Reactive Store & Engine     │   │ Bilingual I18n Dictionary  │
│  (Products, Invoices, Ledger, HR, Vendors)  │   │  (English & বাংলা + ৳ BDT) │
└──────────────────────┬──────────────────────┘   └─────────────┬──────────────┘
                       │                                        │
       ┌───────────────┴───────────────┬────────────────────────┘
       ▼                               ▼
┌─────────────────────────────┐ ┌──────────────────────────────────────────────┐
│ Cross-Module Event Rules    │ │          Workspace Layout Shell              │
│ • Sale -> -Stock & +Ledger  │ │ • 260px Enterprise Sidebar Navigation        │
│ • PO Receive -> +Stock      │ │ • 3-Zone Top Bar (Breadcrumb | Nav | Action) │
│ • Payroll -> +Expense Entry │ └──────────────────────┬───────────────────────┘
└─────────────────────────────┘                        │
         ┌───────────────┬───────────────┬─────────────┼─────────────┬──────────────┐
         ▼               ▼               ▼             ▼             ▼              ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐
  │ Executive  │  │ Inventory  │  │ Sales POS  │ │Accounting │ │  HR &     │ │ Purchase & │
  │ Dashboard  │  │ & Warehouse│  │ & Invoicing│ │ & Ledger  │ │  Payroll  │ │ Python API │
  │  Module    │  │   Module   │  │   Module   │ │  Module   │ │  Module   │ │  Exporter  │
  └────────────┘  └────────────┘  └────────────┘ └───────────┘ └───────────┘ └────────────┘
```

- **Data Model & State**:
  - **Products & Inventory (`Product`)**: SKU code, name (EN/BN), category, warehouse location, unit, cost price (`৳`), selling price (`৳`), current stock quantity, reorder threshold, and supplier reference.
  - **Sales & Invoices (`SalesOrder`)**: Invoice ID (`INV-2026-XXXX`), customer name & phone, line items (product, qty, unit price, line total), subtotal, discount (`৳`), VAT (`15%` or custom), grand total (`৳`), paid amount, due amount, payment method (`Cash`, `bKash`, `Nagad`, `Bank`), and status (`Paid`, `Partial`, `Due`).
  - **Accounting & General Ledger (`LedgerEntry` & `Account`)**: Entry ID (`JRN-XXXX`), date, reference ID, account head (`Cash in Hand`, `Bank Account`, `Sales Revenue`, `Inventory Asset`, `Accounts Payable`, `Salary Expense`, `Office Utility`), entry type (`Credit` / `Debit` / `Income` / `Expense`), amount (`৳`), and narration.
  - **HR & Payroll (`Employee` & `PayrollRecord`)**: Employee ID (`EMP-XXX`), full name, department, designation, phone, join date, basic salary (`৳`), house/medical allowance (`৳`), attendance status (`Present`, `Late`, `Absent`, `On Leave`), and monthly payroll disbursement state (`Paid`, `Pending`).
  - **Purchases & Suppliers (`Supplier` & `PurchaseOrder`)**: PO ID (`PO-2026-XXXX`), supplier company, contact person, phone, ordered items, total cost (`৳`), payment status, and delivery state (`Ordered`, `In Transit`, `Received`).

- **Interactive Component & State Mapping**:
  - **Executive Dashboard**: Interactive period filter (`This Month`, `Last Quarter`, `FY 2026`), live KPI summary strip calculated directly from active store records, interactive Cash Flow & Category Breakdown visualizations, low-stock reorder trigger, and quick-create modals.
  - **Inventory Grid & Stock Adjuster**: Search by SKU/name, filter by warehouse or stock status (`All`, `In Stock`, `Low Stock`, `Out of Stock`), "+ Add Product" modal with validation, and quick "+/- Adjust Stock" inline handler.
  - **POS & Invoice Builder**: Interactive cart/invoice builder where selecting products adds/increments line items, adjusts quantities against available stock, computes VAT/discounts in real time, and commits the sale—opening a formatted printable receipt modal and updating Inventory + Ledger.
  - **Accounting Ledger & Trial Balance**: Filter by account head or entry type, "+ Record Journal / Expense" modal, and automated Trial Balance / P&L calculation bar.
  - **HR Attendance & Payroll Processor**: One-click daily attendance status switcher per employee, "+ Add Employee" modal, and "Process Monthly Payroll" batch action that generates salary slips and logs salary expense in the Accounting Ledger.
  - **Purchase Order & Supplier Workflow**: "+ Create Purchase Order" modal, supplier directory view, and a "Mark as Received" button on pending POs that automatically increments warehouse stock for the ordered items and logs Accounts Payable/Cash outflow.
  - **Python FastAPI Backend Studio**: Interactive code tab viewer (`app/main.py`, `app/models.py`, `app/schemas.py`, `seed_data.py`, `requirements.txt`) with one-click copy and `.py` file download, dynamically embedding your live ERP data into the Python seed script.
