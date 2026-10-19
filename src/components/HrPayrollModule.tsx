import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  CreditCard,
  Printer,
  X,
} from 'lucide-react';
import {
  Employee,
  AttendanceStatus,
  Language,
} from '../types/erp';
import { formatBDT, formatNum } from '../data/initialErpData';

interface HrPayrollModuleProps {
  lang: Language;
  employees: Employee[];
  onUpdateAttendance: (empId: string, status: AttendanceStatus) => void;
  onDisburseSingleSalary: (empId: string) => void;
  onDisburseAllPayroll: () => void;
  onAddEmployee: (
    emp: Omit<
      Employee,
      'id' | 'attendanceStatus' | 'payrollStatus' | 'lastPaidMonth'
    >
  ) => void;
}

export const HrPayrollModule: React.FC<HrPayrollModuleProps> = ({
  lang,
  employees,
  onUpdateAttendance,
  onDisburseSingleSalary,
  onDisburseAllPayroll,
  onAddEmployee,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [payslipEmp, setPayslipEmp] = useState<Employee | null>(null);

  // Add Employee Form State
  const [empCode, setEmpCode] = useState('EMP-107');
  const [nameEn, setNameEn] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [department, setDepartment] = useState<Employee['department']>('Operations');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('01711-');
  const [joinDate, setJoinDate] = useState('2026-10-01');
  const [basicSalary, setBasicSalary] = useState<number>(35000);
  const [allowance, setAllowance] = useState<number>(12000);
  const [deduction, setDeduction] = useState<number>(500);

  const filteredEmployees = employees.filter(
    (e) => departmentFilter === 'All' || e.department === departmentFilter
  );

  const totalMonthlyPayroll = employees.reduce(
    (sum, e) => sum + e.basicSalary + e.allowance - e.deduction,
    0
  );
  const pendingPayrollAmount = employees
    .filter((e) => e.payrollStatus === 'Pending')
    .reduce((sum, e) => sum + e.basicSalary + e.allowance - e.deduction, 0);
  const pendingCount = employees.filter(
    (e) => e.payrollStatus === 'Pending'
  ).length;

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !designation.trim()) return;
    onAddEmployee({
      empCode: empCode.trim().toUpperCase(),
      nameEn: nameEn.trim(),
      nameBn: nameBn.trim() || nameEn.trim(),
      department,
      designation: designation.trim(),
      phone: phone.trim(),
      joinDate,
      basicSalary: Number(basicSalary) || 0,
      allowance: Number(allowance) || 0,
      deduction: Number(deduction) || 0,
    });
    setNameEn('');
    setNameBn('');
    setDesignation('');
    setEmpCode(`EMP-${Math.floor(108 + Math.random() * 89)}`);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lang === 'en'
              ? 'Human Resources, Daily Attendance & Payroll'
              : 'মানবসম্পদ (HR), দৈনিক হাজিরা এবং মাসিক বেতন'}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>
              {lang === 'en' ? 'Total Monthly Salary Sheet:' : 'মাসিক মোট বেতন:'}{' '}
              <strong className="font-mono tabular-nums text-slate-800">
                {formatBDT(totalMonthlyPayroll, lang)}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'en' ? 'Pending Disbursement:' : 'বকেয়া বেতন:'}{' '}
              <strong className="font-mono tabular-nums text-amber-700">
                {formatBDT(pendingPayrollAmount, lang)} ({pendingCount}{' '}
                {lang === 'en' ? 'Staff' : 'জন'})
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {pendingCount > 0 && (
            <button
              onClick={onDisburseAllPayroll}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {lang === 'en'
                  ? `Disburse Pending Payroll (${formatBDT(pendingPayrollAmount, 'en')})`
                  : `সব বকেয়া বেতন পরিশোধ করুন (${formatBDT(pendingPayrollAmount, 'bn')})`}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Add Employee' : 'নতুন কর্মী যুক্ত করুন'}</span>
          </button>
        </div>
      </div>

      {/* Department Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-lg">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {(
            [
              'All',
              'Operations',
              'Finance & Accounts',
              'Sales & Distribution',
              'Supply Chain',
              'IT & Systems',
            ] as const
          ).map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                departmentFilter === dept
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {dept === 'All'
                ? lang === 'en'
                  ? 'All Departments'
                  : 'সব বিভাগ'
                : dept}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500">
          {lang === 'en' ? 'Showing' : 'দেখানো হচ্ছে'}{' '}
          <strong className="font-mono tabular-nums text-slate-900">
            {formatNum(filteredEmployees.length, lang)}
          </strong>{' '}
          {lang === 'en' ? 'active staff records' : 'জন কর্মীর তথ্য'}
        </div>
      </div>

      {/* Employee Attendance & Salary Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">
                  {lang === 'en' ? 'Employee & Designation' : 'কর্মীর নাম ও পদবী'}
                </th>
                <th className="py-3 px-4">
                  {lang === 'en' ? 'Department' : 'বিভাগ'}
                </th>
                <th className="py-3 px-4">
                  {lang === 'en' ? "Today's Attendance" : 'আজকের হাজিরা'}
                </th>
                <th className="py-3 px-4 text-right">
                  {lang === 'en' ? 'Basic + Allowance' : 'মূল বেতন + ভাতা'}
                </th>
                <th className="py-3 px-4 text-right">
                  {lang === 'en' ? 'Net Payable' : 'নিট বেতন'}
                </th>
                <th className="py-3 px-4">
                  {lang === 'en' ? 'Payroll Status' : 'বেতনের অবস্থা'}
                </th>
                <th className="py-3 px-4 text-right">
                  {lang === 'en' ? 'Actions' : 'অ্যাকশন'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const netPay =
                  emp.basicSalary + emp.allowance - emp.deduction;
                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {emp.empCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {lang === 'en' ? emp.nameEn : emp.nameBn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {emp.designation} ·{' '}
                        <span className="font-mono tabular-nums">
                          {emp.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {emp.department}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={emp.attendanceStatus}
                        onChange={(e) =>
                          onUpdateAttendance(
                            emp.id,
                            e.target.value as AttendanceStatus
                          )
                        }
                        className={`px-2.5 py-1 text-xs font-medium border rounded-md bg-white ${
                          emp.attendanceStatus === 'Present'
                            ? 'border-emerald-200 text-emerald-700'
                            : emp.attendanceStatus === 'Late'
                            ? 'border-amber-200 text-amber-700'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <option value="Present">Present (উপস্থিত)</option>
                        <option value="Late">Late (বিলম্ব)</option>
                        <option value="On Leave">On Leave (ছুটি)</option>
                        <option value="Absent">Absent (অনুপস্থিত)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatBDT(emp.basicSalary, lang)} +{' '}
                      {formatBDT(emp.allowance, lang)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {formatBDT(netPay, lang)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {emp.payrollStatus === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid (Oct 2026)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {emp.payrollStatus === 'Pending' && (
                          <button
                            onClick={() => onDisburseSingleSalary(emp.id)}
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                          >
                            {lang === 'en' ? 'Pay Salary' : 'বেতন দিন'}
                          </button>
                        )}
                        <button
                          onClick={() => setPayslipEmp(emp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{lang === 'en' ? 'Payslip' : 'পে-স্লিপ'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'en'
                  ? 'Onboard New Employee'
                  : 'নতুন কর্মকর্তা / কর্মচারী নিবন্ধন'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateEmployee}
              className="mt-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {lang === 'en' ? 'Department' : 'বিভাগ'}
                  </label>
                  <select
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value as Employee['department'])
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Sales & Distribution">Sales & Distribution</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="IT & Systems">IT & Systems</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    নাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive, Accounts"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Basic Salary (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Allowances (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={allowance}
                    onChange={(e) => setAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Deductions (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={deduction}
                    onChange={(e) => setDeduction(Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono tabular-nums border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600"
                >
                  {lang === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {lang === 'en' ? 'Save Employee' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Salary Slip Modal */}
      {payslipEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  BARAKAH NEXUS ERP — SALARY SLIP
                </h3>
                <p className="text-xs text-slate-500">
                  Payroll Period: October 2026
                </p>
              </div>
              <button
                onClick={() => setPayslipEmp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {payslipEmp.empCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">
                  {lang === 'en' ? payslipEmp.nameEn : payslipEmp.nameBn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Designation:</span>
                <span className="text-slate-800">{payslipEmp.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800">{payslipEmp.department}</span>
              </div>
            </div>

            <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-mono tabular-nums">
                  {formatBDT(payslipEmp.basicSalary, lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">
                  House Rent & Medical Allowance
                </span>
                <span className="font-mono tabular-nums text-emerald-700">
                  +{formatBDT(payslipEmp.allowance, lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax / Provident Deduction</span>
                <span className="font-mono tabular-nums text-red-600">
                  -{formatBDT(payslipEmp.deduction, lang)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Net Take-Home Salary</span>
                <span className="font-mono tabular-nums text-blue-700">
                  {formatBDT(
                    payslipEmp.basicSalary +
                      payslipEmp.allowance -
                      payslipEmp.deduction,
                    lang
                  )}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Print Payslip' : 'প্রিন্ট করুন'}</span>
              </button>
              <button
                onClick={() => setPayslipEmp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600"
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
