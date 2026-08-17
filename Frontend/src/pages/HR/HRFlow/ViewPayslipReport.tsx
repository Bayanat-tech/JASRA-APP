import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Printer, FileDown, ArrowLeft , AlertCircle, FileQuestion } from 'lucide-react';
import HrServiceInstance from 'service/Service.hr';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import useAuth from 'hooks/useAuth';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface IHrEmployee {
  EMPLOYEE_ID: string;
  EMPLOYEE_CODE: string;
  RPT_NAME: string;
}

interface IPaySlipHeader {
  EMPLOYEE_ID: string;
  RPT_NAME: string;
  DESG_NAME: string;
  DIV_NAME: string;
  DEPT_NAME: string;
  DEPT_CODE: string;
  SECTION_NAME: string;
  PAYMENT_MODE: string;
  SALARY_ACCT_NO: string;
  BANK_NAME?: string;
  PAY_MONTH: string;
  PAY_YEAR: string;
  CURR_NAME: string;
  COMPANY_CODE?: string;
  DIV_CODE?: string;
  REF_JV_DOC_NO?: string;
  GROSS_EARNINGS?: number;
  GROSS_DEDUCTIONS?: number;
  NET_SALARY?: number;
}

interface IPayComponent {
  PAY_COMP_ID?: string;
  PAY_COMP_DESC: string;
  PAY_COMP_AMT: number;
  SORT_ORDER?: number;
}

interface IAttendanceRow {
  ATTEND_TYPE: string;
  NO_OF_DAYS: number;
  ATTEND_DESC: string;
}

interface IVisaExpiryRow {
  LABOURCARD_VALID_TO?: string;
  VISA_VALID_TO?: string;
  PPT_VALID_TO?: string;
}

// Logo URLs
const headerLogoForDiv10 = "https://objectstorage.me-dubai-1.oraclecloud.com/n/axpnrpp1t5qs/b/app-dev-bucket-test/o/JASRALOGO%2Fmfs1.jpg";
const headerTopForDiv10 = "https://objectstorage.me-dubai-1.oraclecloud.com/n/axpnrpp1t5qs/b/app-dev-bucket-test/o/JASRALOGO%2Fmfs2.jpg";

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

/** Label : value row with a fixed-width label, mirroring the old MUI LabelValue */
const LabelValue = ({
  label,
  value,
  labelWidth = 115
}: {
  label: string;
  value?: string | number | null;
  labelWidth?: number;
}) => (
  <div className="flex text-[0.75rem] leading-[1.4]">
    <span className="font-bold text-black shrink-0" style={{ width: labelWidth }}>
      {label}
    </span>
    <span className="text-black">: {value ?? ''}</span>
  </div>
);

const Spinner = () => (
  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ViewPayslipReport = () => {
  const { employeeId, month, year } = useParams<{ employeeId: string; month: string; year: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPrintView = searchParams.get('print') === 'true';
  const { user } = useAuth();

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const isAllowedYear = year === currentYear.toString() || year === previousYear.toString();

  const { payrollMonth: liveCurrentMonth, payrollYear: liveCurrentYear } = React.useMemo(() => {
    const now = new Date();
    const thisMonth0 = now.getMonth();
    if (thisMonth0 === 0) {
      return { payrollMonth: 12, payrollYear: now.getFullYear() - 1 };
    }
    return { payrollMonth: thisMonth0, payrollYear: now.getFullYear() };
  }, []);

  const isCurrentMonthView = React.useMemo(() => {
    return parseInt(month || '0', 10) === liveCurrentMonth && parseInt(year || '0', 10) === liveCurrentYear;
  }, [month, year, liveCurrentMonth, liveCurrentYear]);

  const { data: currentSupervisorEmployeeData, isLoading: isLoadingSupervisor } = useQuery<IHrEmployee[]>({
    queryKey: ['currentSupervisorEmployeeData', user?.loginid1],
    queryFn: async (): Promise<IHrEmployee[]> => {
      if (!user?.loginid1) {
        return [];
      }
      try {
        const sql = `
              SELECT DISTINCT * 
              FROM (
                  SELECT EMPLOYEE_ID
                  FROM VW_HR_EMPLOYEE
                  WHERE EMP_STATUS <> 'S'
                  START WITH
                      EMPLOYEE_ID = '${user.loginid1}'
                      OR SUPERVISOR_EMPID = '${user.loginid1}'
                      OR DEPT_HEAD_EMPID = '${user.loginid1}'
                      OR MANGR_EMPID = '${user.loginid1}'
                  CONNECT BY NOCYCLE PRIOR EMPLOYEE_ID = SUPERVISOR_EMPID
                      OR PRIOR EMPLOYEE_ID = DEPT_HEAD_EMPID
                      OR PRIOR EMPLOYEE_ID = MANGR_EMPID
              )
        `;
        const data = await HrServiceInstance.executeRawSql(sql);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Error fetching supervisor team:', err);
        return [];
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });
  
  console.log('currentSupervisorEmployeeData',currentSupervisorEmployeeData);

  const hasPermission = React.useMemo(() => {
    // Allow if the user is viewing their own payslip
    if (user?.loginid1 === employeeId) {
      return true;
    }

    // Allow if the user is a supervisor/manager and the employee is under them
    if (currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0) {
      return currentSupervisorEmployeeData.some(emp => emp.EMPLOYEE_ID === employeeId);
    }

    return false;
  }, [user?.loginid1, employeeId, currentSupervisorEmployeeData, isLoadingSupervisor]);

  const headerSql = `
    SELECT DISTINCT *
    FROM VW_BOHC_PAYSLIP_HDR
    WHERE EMPLOYEE_ID = '${employeeId}'
    AND PAY_MONTH = '${month}'
    AND PAY_YEAR = '${year}'
  `;

  const { data: headerData, isLoading: headerLoading, error: headerError } = useQuery({
    queryKey: ['payslip_header', employeeId, month, year],
    queryFn: () => HrServiceInstance.executeRawSql(headerSql),
    enabled: hasPermission && !!employeeId && !!month && !!year && isAllowedYear,
    refetchOnWindowFocus: false
  });

  const header: IPaySlipHeader | undefined = headerData?.[0];
  const companyCode = header?.COMPANY_CODE || '';

  const HISTORY_SOURCE_FLAG = 'P';

  const earningsSql = isCurrentMonthView
    ? `
      SELECT DISTINCT PAY_COMP_ID, PAY_COMP_DESC, PAY_COMP_AMT, SORT_ORDER
      FROM VW_CURRENTMONTH_EARNING
      WHERE EMPLOYEE_ID = '${employeeId}'
      AND PAY_MONTH = '${month}'
      AND PAY_YEAR = '${year}'
      ORDER BY SORT_ORDER
    `
    : `
      SELECT
        PAY_COMP_ID, PAY_COMP_AMT, ARREARS, COMPANY_CODE, PAY_COMP_DESC, SORT_ORDER,
        MUTLI_CURR_SALDISBURSE, QUOTE_CURR, ADDN_CURR, DTL_CURR, BASE_CURR
      FROM VW_HISTORY_EARNING
      WHERE PAY_MONTH = '${month}'
      AND PAY_YEAR = '${year}'
      AND DEPT_CODE = '${header?.DEPT_CODE}'
      AND SOURCE_FLAG = '${HISTORY_SOURCE_FLAG}'
      AND EMPLOYEE_ID = '${employeeId}'
      ORDER BY SORT_ORDER
    `;

  const deductionsSql = isCurrentMonthView
    ? `
      SELECT DISTINCT PAY_COMP_ID, PAY_COMP_DESC, PAY_COMP_AMT, SORT_ORDER
      FROM VW_CURRENTMONTH_DEDUCTION
      WHERE EMPLOYEE_ID = '${employeeId}'
      AND PAY_MONTH = '${month}'
      AND PAY_YEAR = '${year}'
      ORDER BY SORT_ORDER
    `
    : `
      SELECT
        PAY_COMP_ID, PAY_COMP_AMT, ARREARS, COMPANY_CODE, PAY_COMP_DESC, SORT_ORDER,
        MUTLI_CURR_SALDISBURSE, QUOTE_CURR, ADDN_CURR, DTL_CURR, BASE_CURR
      FROM VW_HISTORY_DEDUCTION
      WHERE PAY_MONTH = '${month}'
      AND PAY_YEAR = '${year}'
      AND DEPT_CODE = '${header?.DEPT_CODE}'
      AND SOURCE_FLAG = '${HISTORY_SOURCE_FLAG}'
      AND EMPLOYEE_ID = '${employeeId}'
      ORDER BY SORT_ORDER
    `;

  const attendanceSql = isCurrentMonthView
    ? `
      SELECT ATTEND_TYPE, NO_OF_DAYS, ATTEND_DESC
      FROM VW_CURRENTMONTH_ATTENDANCE
      WHERE EMPLOYEE_ID = '${employeeId}'
      AND COMPANY_CODE = '${companyCode}'
      AND PAY_MONTH = '${month}'
      AND PAY_YEAR = '${year}'
    `
    : `
      SELECT ATTEND_TYPE, NO_OF_DAYS, ATTEND_DESC
      FROM VW_HISTORY_ATTENDANCE
      WHERE EMPLOYEE_ID = '${employeeId}'
      AND COMPANY_CODE = '${companyCode}'
      AND PAY_MONTH = '${month}'
      AND PAY_YEAR = '${year}'
    `;

  const visaExpirySql = isCurrentMonthView
    ? `
      SELECT LABOURCARD_VALID_TO, VISA_VALID_TO, PPT_VALID_TO
      FROM VW_CURRENTMONTH_VISAEXPIRY
      WHERE EMPLOYEE_ID = '${employeeId}'
    `
    : `
      SELECT LABOURCARD_VALID_TO, VISA_VALID_TO, PPT_VALID_TO
      FROM VW_HISTORY_VISAEXPIRY
      WHERE EMPLOYEE_ID = '${employeeId}'
    `;

  const earningsDeductionsEnabled = hasPermission && !!employeeId && !!month && !!year && isAllowedYear;
  const attendanceVisaEnabled = earningsDeductionsEnabled && !!header;

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['payslip_earnings', employeeId, month, year, isCurrentMonthView , headerData],
    queryFn: () => HrServiceInstance.executeRawSql(earningsSql),
    enabled: earningsDeductionsEnabled,
    refetchOnWindowFocus: false
  });

  const { data: deductionsData, isLoading: deductionsLoading } = useQuery({
    queryKey: ['payslip_deductions', employeeId, month, year, isCurrentMonthView ,headerData],
    queryFn: () => HrServiceInstance.executeRawSql(deductionsSql),
    enabled: earningsDeductionsEnabled,
    refetchOnWindowFocus: false
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery<IAttendanceRow[]>({
    queryKey: ['payslip_attendance', employeeId, companyCode, month, year, isCurrentMonthView],
    queryFn: async () => (await HrServiceInstance.executeRawSql(attendanceSql)) ?? [],
    enabled: attendanceVisaEnabled,
    refetchOnWindowFocus: false
  });

  const { data: visaExpiryData, isLoading: visaExpiryLoading } = useQuery<IVisaExpiryRow[]>({
    queryKey: ['payslip_visa_expiry', employeeId, isCurrentMonthView],
    queryFn: async () => (await HrServiceInstance.executeRawSql(visaExpirySql)) ?? [],
    enabled: attendanceVisaEnabled,
    refetchOnWindowFocus: false
  });

  const isLoading = headerLoading || earningsLoading || deductionsLoading || attendanceLoading || visaExpiryLoading;

  React.useEffect(() => {
    if (isPrintView && !isLoading && headerData?.[0]) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [isPrintView, isLoading, headerData]);

  // ---------------------------------------------------------------------
  // Early return states
  // ---------------------------------------------------------------------

  if (isLoadingSupervisor) {
    return (
      <div className="mx-auto flex h-[50vh] max-w-5xl items-center justify-center px-4">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-lg font-medium text-gray-700">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="mx-auto mt-8 max-w-5xl px-4">
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="text-lg font-semibold">Access Denied</p>
          <p>You don't have permission to view this employee's payslip</p>
        </div>
        <div className="text-center">
          <button
            className="rounded bg-blue-600 px-5 py-2.5 text-base font-medium text-white hover:bg-blue-700"
            onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
          >
            Back to Payslip Search
          </button>
        </div>
      </div>
    );
  }

  if (!isAllowedYear) {
    return (
      <div className="mx-auto mt-8 max-w-5xl px-4">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-800">
          You can only access payslips for the current year ({currentYear}). Selected year: {year}
        </div>
        <div className="mt-4 text-center">
          <button
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex h-[50vh] max-w-5xl items-center justify-center px-4">
        <Spinner />
      </div>
    );
  }

  if (headerError || !header) {
    const isError = !!headerError;
    return (
      <div className="mx-auto mt-10 max-w-3xl px-4">
        <div className="overflow-hidden rounded-lg border border-red-200 bg-white shadow-sm">
          {/* Card header with icon and title */}
          <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-6 py-4">
            {isError ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : (
              <FileQuestion className="h-6 w-6 text-amber-600" />
            )}
            <h2 className="text-lg font-semibold text-red-800">
              {isError ? 'Failed to Load Payslip' : 'No Payslip Found'}
            </h2>
          </div>

          {/* Card body with message and action */}
          <div className="px-6 py-5">
            <p className="text-gray-700">
              {isError
                ? 'There was a problem loading the payslip data. Please try again or contact support if the issue persists.'
                : 'No payslip data was found for the selected employee, month, and year. Please verify the search criteria and try again.'}
            </p>
            <div className="mt-5">
              <button
                onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------

  const earnings: IPayComponent[] = earningsData || [];
  const deductions: IPayComponent[] = deductionsData || [];
  const attendance: IAttendanceRow[] = attendanceData || [];
  const visaExpiry: IVisaExpiryRow | undefined = visaExpiryData?.[0];

  const grossEarnings = header.GROSS_EARNINGS ?? earnings.reduce((sum, item) => sum + (item.PAY_COMP_AMT || 0), 0);
  const grossDeductions = header.GROSS_DEDUCTIONS ?? deductions.reduce((sum, item) => sum + (item.PAY_COMP_AMT || 0), 0);
  const netSalary = header.NET_SALARY ?? grossEarnings - grossDeductions;

const exportToPDF = async () => {
  const element = document.getElementById('payslip-content');
  if (!element) {
    alert('Cannot generate PDF: Payslip content not found');
    return;
  }

  try {
    // Clone the element to avoid modifying the visible UI
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove action buttons if they are inside the clone (usually they are outside)
    const noPrintEls = clone.querySelectorAll('.no-print');
    noPrintEls.forEach((el) => el.remove());

    // Style the clone for reliable off‑screen rendering
    clone.style.position = 'absolute';          // absolute is more reliable than fixed
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '800px';
    clone.style.backgroundColor = 'white';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.visibility = 'visible';          // make sure it's not hidden by any inherited rule

    document.body.appendChild(clone);

    // Wait a moment for images and layout to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: clone.scrollWidth,
      height: clone.scrollHeight,
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, usableWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    pdf.save(`Payslip_${employeeId}_${month}_${year}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

  const handlePrint = () => window.print();

  const formatCurrency = (amount: number | undefined): string =>
    (amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const getMonthAbbr = (monthNum: string) => {
    const monthAbbrs = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return monthAbbrs[parseInt(monthNum, 10) - 1] || monthNum || '';
  };

  const payRowCount = Math.max(earnings.length, deductions.length, 1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Print-only rules: hide EVERYTHING in the page (navbar, sidebar, menu,
          action buttons, etc.) except the payslip itself. This works
          regardless of where those elements live in the DOM, since the app
          shell is outside this component's control. */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body { margin: 0; padding: 0; background-color: #fff; }
          body * { visibility: hidden; }
          #payslip-content, #payslip-content * { visibility: visible; }
          .no-print, .no-print * { display: none !important; }
          #payslip-content {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            border: none;
            box-shadow: none;
          }
          /* Force the employee-info block to stay two columns in print,
             regardless of the md: breakpoint (the app shell's own layout
             width can prevent that breakpoint from ever triggering here). */
          .payslip-info-grid {
            display: grid !important;
            grid-template-columns: 7fr 5fr !important;
          }
          .print-avoid-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Action Buttons */}
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <button
          className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => navigate('/hr/Activity/Request/employee_payslip')}
        >
          <ArrowLeft size={16} />
          Back to Search
        </button>
        <div className="flex gap-2">
          <button
            title="Print"
            onClick={handlePrint}
            className="rounded border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
          >
            <Printer size={18} />
          </button>
          <button
            title="Download PDF"
            onClick={exportToPDF}
            className="rounded border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
          >
            <FileDown size={18} />
          </button>
        </div>
      </div>

      {/* Main Payslip Content */}
      {/* <div
        id="payslip-content"
        className="mx-auto border border-black bg-white px-7 py-6"
        style={{ fontFamily: '"Segoe UI", Arial, sans-serif' }}
      > */}
      <div
        id="payslip-content"
        className="mx-auto bg-white px-7 py-6"
        style={{ fontFamily: '"Segoe UI", Arial, sans-serif' }}
      >
        {/* ===== HEADER WITH LOGOS ===== */}
        <div className="flex items-center justify-between pb-1">
          <div className="w-[180px]">
            <img
              src={headerTopForDiv10}
              alt="Company Logo Left"
              className="h-auto w-full object-contain"
              style={{ maxHeight: 70 }}
            />
          </div>
          <div className="w-[120px]">
            <img
              src={headerLogoForDiv10}
              alt="Company Logo Right"
              className="h-auto w-full object-contain"
              style={{ maxHeight: 65 }}
            />
          </div>
        </div>

        {/* Divider Line */}
        {/* <div className="mb-2 mt-0.5 border-t-2 border-black" /> */}

        {/* ===== PAYSLIP TITLE ===== */}
        <p className="mb-4 border-b border-gray-300 pb-2 text-[0.95rem] font-bold tracking-[3px] text-black">
          P a y s l i p &nbsp;( Division : {header.DIV_CODE ?? ''} )
        </p>

        {/* ===== EMPLOYEE & PAYMENT INFO ===== */}
        <div className="payslip-info-grid mb-4 grid grid-cols-1 gap-0 md:grid-cols-12">
          <div className="md:col-span-6">
            <LabelValue label="Employee Code" value={header.EMPLOYEE_ID} labelWidth={115} />
            <LabelValue label="Name" value={header.RPT_NAME} labelWidth={115} />
            <LabelValue label="Designation" value={header.DESG_NAME} labelWidth={115} />
            <LabelValue label="Division" value={header.DIV_NAME} labelWidth={115} />
            <LabelValue label="Department" value={header.DEPT_NAME} labelWidth={115} />
            <LabelValue label="Section" value={header.SECTION_NAME} labelWidth={115} />
          </div>
          <div className="md:col-span-6">
            <LabelValue label="Period" value={`${getMonthAbbr(header.PAY_MONTH)} / ${header.PAY_YEAR ?? ''}`} labelWidth={115} />
            <LabelValue label="Currency" value={header.CURR_NAME} labelWidth={115} />
            <LabelValue label="Bank Name" value={header.BANK_NAME} labelWidth={115} />
            <LabelValue label="Account No." value={header.SALARY_ACCT_NO} labelWidth={115} />
            <LabelValue label="Mode of Payment" value={header.PAYMENT_MODE} labelWidth={115} />
            <LabelValue label="Ref JV Doc No" value={header.REF_JV_DOC_NO} labelWidth={115} />
          </div>
        </div>

        {/* ===== EARNINGS / DEDUCTIONS TABLE ===== */}
        <div className="print-avoid-break border border-black">
          <table className="w-full table-fixed border-collapse bg-white">
            <colgroup>
              <col style={{ width: '34%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '34%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <tbody>
              {/* Header Row */}
              <tr>
                <td colSpan={2} className="border-b border-r border-black py-1 text-center text-[0.85rem] font-bold text-black">
                  Earnings
                </td>
                <td colSpan={2} className="border-b border-black py-1 text-center text-[0.85rem] font-bold text-black">
                  Deductions
                </td>
              </tr>
              {/* Currency Row */}
              <tr>
                <td colSpan={2} className="border-b border-r border-black py-0.5 text-[0.7rem] font-bold text-[#555]">
                  &nbsp;{header.CURR_NAME}
                </td>
                <td colSpan={2} className="border-b border-black py-0.5" />
              </tr>
              {/* Data Rows */}
              {Array.from({ length: payRowCount }).map((_, i) => (
                <tr key={i}>
                  <td className="truncate py-0.5 pl-2 text-[0.75rem] text-black">{earnings[i]?.PAY_COMP_DESC || ''}</td>
                  <td className="border-r border-black py-0.5 pr-2 text-right text-[0.75rem] text-black">
                    {earnings[i] ? formatCurrency(earnings[i].PAY_COMP_AMT) : ''}
                  </td>
                  <td className="truncate py-0.5 pl-2 text-[0.75rem] text-black">{deductions[i]?.PAY_COMP_DESC || ''}</td>
                  <td className="py-0.5 pr-2 text-right text-[0.75rem] text-black">
                    {deductions[i] ? formatCurrency(deductions[i].PAY_COMP_AMT) : ''}
                  </td>
                </tr>
              ))}
              {/* SPACING ROW - ~60px of white space before totals, matching the reference PDF */}
              <tr>
                <td colSpan={4} className="h-[60px] p-0" />
              </tr>
              {/* Totals Row */}
              <tr>
                <td className="border-r border-t border-black py-1 pl-2 text-[0.75rem] font-bold text-black">Gross Earnings</td>
                <td className="border-r border-t border-black py-1 pr-2 text-right text-[0.75rem] font-bold text-black">
                  {formatCurrency(grossEarnings)}
                </td>
                <td className="border-t border-black py-1 pl-2 text-[0.75rem] font-bold text-black">Gross Deductions</td>
                <td className="border-t border-black py-1 pr-2 text-right text-[0.75rem] font-bold text-black">
                  {formatCurrency(grossDeductions)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== TOTAL PAID SALARY ===== */}
        <div className="print-avoid-break flex items-center justify-between border border-t-0 border-black px-3 py-1.5">
          <p className="text-[0.7rem] text-[#555]">Normal OT (Hrs): &nbsp;&nbsp;&nbsp; Holiday OT (Hrs):</p>
          <p className="text-[0.85rem] font-bold text-black">
            Total Paid Salary : {header.CURR_NAME} {formatCurrency(netSalary)}
          </p>
        </div>

        {/* ===== ATTENDANCE & EXPIRY DETAILS ===== */}
        <div className="print-avoid-break border border-t-0 border-gray-300">
          <p className="border-b border-gray-300 px-3 py-1 text-[0.78rem] font-bold text-black">Attendance Details</p>
          <div className="flex flex-wrap gap-6 px-3 py-1.5">
            <div className="min-w-[140px] flex-1">
              <table className="w-full bg-white">
                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((row, i) => (
                      <tr key={i}>
                        <td className="py-0.5 text-[0.72rem] text-black">{row.ATTEND_DESC}</td>
                        <td className="py-0.5 text-right text-[0.72rem] font-semibold text-black">{row.NO_OF_DAYS}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-0.5 text-[0.7rem] text-gray-400">No attendance data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="w-[200px] shrink-0 border border-gray-300 px-2.5 py-1">
              <p className="mb-0.5 text-[0.72rem] font-bold text-black">Expiry Details</p>
              <LabelValue label="Civil Card" value={visaExpiry?.LABOURCARD_VALID_TO} labelWidth={85} />
              <LabelValue label="Visa" value={visaExpiry?.VISA_VALID_TO} labelWidth={85} />
              <LabelValue label="Passport" value={visaExpiry?.PPT_VALID_TO} labelWidth={85} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPayslipReport;