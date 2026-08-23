import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';

// ── Types ────────────────────────────────────────────────
type PayslipRow = {
  ALTERNATE_ID:  string;
  RPT_NAME:      string;
  DESG_CODE:     string;
  DESG_NAME:     string;
  COMPANY_CODE:  string;
  COMP_NAME:     string;
  DIV_CODE:      string;
  DIV_NAME:      string;
  DEPT_CODE:     string;
  DEPT_NAME:     string;
  NET_SALARY:    number;
};

type DivisionOption = { DIV_CODE: string; DIV_NAME: string };

type DivGroup = { divCode: string; divName: string; rows: PayslipRow[] };

// pay_month / pay_year are 0 while unset — this is what makes them mandatory.
type Filters = {
  div_codes: string[]; // empty array = All divisions
  pay_month: number;   // 1–12, 0 = not selected
  pay_year:  number;   // 0 = not selected
};

type FilterOptions = {
  divisions: { code: string; name: string }[];
};

type SortConfig = { col: keyof PayslipRow | null; dir: 'asc' | 'desc' };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BASE_YEAR = 2026;

const DEFAULT_FILTERS: Filters = { div_codes: [], pay_month: 0, pay_year: 0 };

// ── Helpers ───────────────────────────────────────────────
function formatAmount(n: number) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupRows(rows: PayslipRow[]): DivGroup[] {
  const divMap: Record<string, DivGroup> = {};
  for (const r of rows) {
    const divKey = r.DIV_CODE || 'UNASSIGNED';
    if (!divMap[divKey])
      divMap[divKey] = { divCode: r.DIV_CODE, divName: r.DIV_NAME || 'Unassigned Division', rows: [] };
    divMap[divKey].rows.push(r);
  }
  return Object.values(divMap);
}

// ── Sort Arrow ────────────────────────────────────────────
function SortArrow({ col, sort }: { col: keyof PayslipRow; sort: SortConfig }) {
  if (sort.col !== col) return <span style={{ opacity: 0.35, marginLeft: 4 }}>⇅</span>;
  return <span style={{ marginLeft: 4 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

// ── Division Dropdown ───────────────────────────────────────
function DivisionDropdown({
  options, selected, onChange,
}: {
  options:  { code: string; name: string }[];
  selected: string[];
  onChange: (codes: string[]) => void;
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const wrapRef             = useRef<HTMLDivElement>(null);

  const allSelected = selected.length === options.length;

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(d => d.name.toLowerCase().includes(q));
  }, [options, query]);

  const isChecked = (code: string) => selected.includes(code);

  const toggleOne = (code: string) => {
    const base = selected;
    const set = new Set(base);
    set.has(code) ? set.delete(code) : set.add(code);
    onChange(set.size === options.length ? [] : Array.from(set));
  };

  const selectAll = () => onChange(options.map(d => d.code));
  const clearAll = () => onChange([]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isNoneSelected = selected.length === 1 && selected[0] === '__NONE_SELECTED__';
  const label = isNoneSelected
  ? 'None selected'
  : selected.length === options.length
    ? 'All Divisions'
    : `${selected.length} of ${options.length} selected`;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db',
          borderRadius: 7, background: '#fff', outline: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ marginLeft: 8, color: '#6b7280', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 250, overflow: 'hidden',
        }}>
          <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search division…"
              style={{
                width: '100%', padding: '7px 9px', fontSize: 12.5, border: '1.5px solid #d1d5db',
                borderRadius: 6, outline: 'none', color: '#111', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 10px', borderBottom: '1px solid #f3f4f6', background: '#fafafa',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: '#111', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => (allSelected ? clearAll() : selectAll())}
                style={{ cursor: 'pointer', width: 14, height: 14 }}
              />
              Select All
            </label>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{label}</span>
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filteredOptions.length === 0 && (
              <div style={{ padding: '10px', fontSize: 12.5, color: '#9ca3af' }}>No matches.</div>
            )}
            {filteredOptions.map(d => (
              <label
                key={d.code}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                  fontSize: 13, color: '#111', cursor: 'pointer', borderBottom: '1px solid #f3f4f6',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked(d.code)}
                  onChange={() => toggleOne(d.code)}
                  style={{ cursor: 'pointer', width: 15, height: 15, flexShrink: 0 }}
                />
                <span style={{ flex: 1 }}>{d.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter Panel ──────────────────────────────────────────
// `allowClose` gates whether the panel can be dismissed. While false (i.e.
// no valid Month/Year has ever been applied), the X button and
// click-outside-to-close are disabled and a mandatory-fields banner shows.
function FilterPanel({
  options, filters, onChange, onApply, onReset, open, onClose, allowClose,
}: {
  options:    FilterOptions;
  filters:    Filters;
  onChange:   (f: Filters) => void;
  onApply:    () => void;
  onReset:    () => void;
  open:       boolean;
  onClose:    () => void;
  allowClose: boolean;
}) {
  if (!open) return null;

  const nowYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: Math.max(1, nowYear - BASE_YEAR + 1) },
    (_, i) => BASE_YEAR + i,
  );

  const monthValid = !!filters.pay_month;
  const yearValid  = !!filters.pay_year;
  const canApply   = monthValid && yearValid;

  const handleOverlayClick = () => { if (allowClose) onClose(); };

  return (
    <>
      <div onClick={handleOverlayClick} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)',
        zIndex: 199, backdropFilter: 'blur(1px)',
        cursor: allowClose ? 'pointer' : 'default',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: 310,
        background: '#fff', borderLeft: '1px solid #e5e7eb',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', zIndex: 200,
        display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '50px 20px 16px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fafafa',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, color: '#1f2937' }}>⚙</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Parameters</span>
          </div>
          {allowClose && (
            <button
              onClick={onClose}
              style={{
                border: 'none', background: '#f3f4f6', cursor: 'pointer',
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#6b7280', marginRight: 8, flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; }}
            >×</button>
          )}
        </div>

        {!allowClose && (
          <div style={{
            margin: '14px 20px 0', padding: '10px 12px', background: '#fffbeb',
            border: '1px solid #fde68a', borderRadius: 7, fontSize: 12, color: '#92400e',
            lineHeight: 1.5,
          }}>
            Month and Year are required. Select both and click <b>Apply Filters</b> to view the report.
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Division dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Division
            </label>
            <DivisionDropdown
              options={options.divisions}
              selected={filters.div_codes}
              onChange={codes => onChange({ ...filters, div_codes: codes })}
            />
          </div>

          {/* Month dropdown — mandatory */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Month <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              required
              value={filters.pay_month}
              onChange={e => onChange({ ...filters, pay_month: Number(e.target.value) })}
              style={{
                width: '100%', padding: '9px 10px', fontSize: 13, color: '#111',
                border: `1.5px solid ${monthValid ? '#d1d5db' : '#ef4444'}`, borderRadius: 7,
                background: '#fff', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value={0} disabled>Select month…</option>
              {MONTH_NAMES.map((name, idx) => <option key={name} value={idx + 1}>{name}</option>)}
            </select>
          </div>

          {/* Year dropdown — mandatory */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Year <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              required
              value={filters.pay_year}
              onChange={e => onChange({ ...filters, pay_year: Number(e.target.value) })}
              style={{
                width: '100%', padding: '9px 10px', fontSize: 13, color: '#111',
                border: `1.5px solid ${yearValid ? '#d1d5db' : '#ef4444'}`, borderRadius: 7,
                background: '#fff', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value={0} disabled>Select year…</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

        </div>

        <div style={{ padding: '16px 20px 40px', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 8, background: '#fafafa' }}>
          {!canApply && (
            <div style={{ fontSize: 11.5, color: '#ef4444', fontWeight: 600 }}>Month and Year are required.</div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onReset} style={{ flex: 1, padding: '9px', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>Reset</button>
            <button
              onClick={() => { if (canApply) { onApply(); onClose(); } }}
              disabled={!canApply}
              style={{
                flex: 2, padding: '9px', border: 'none', borderRadius: 7,
                background: canApply ? '#1f2937' : '#9ca3af', cursor: canApply ? 'pointer' : 'not-allowed',
                fontSize: 13, color: '#fff', fontWeight: 700,
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Access control ────────────────────────────────────────
const ALLOWED_LOGIN_IDS = ['10103', '10521'];

function AccessDenied({ loginId }: { loginId?: string }) {
  return (
    <div style={{
      height: '100vh', width: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#f4f6f9',
      fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 24,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{
        width: 76, height: 76, borderRadius: '50%', background: '#1f2937',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22,
        boxShadow: '0 6px 18px rgba(31,41,55,0.25)',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="#fff" strokeWidth="1.8" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="15.2" r="1.3" fill="#fff" />
        </svg>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Access Denied
      </div>
      <div style={{ fontSize: 13.5, color: '#6b7280', maxWidth: 340, lineHeight: 1.6 }}>
        You don't have permission to view the Cash Payslip Report.
        {loginId && <> Your login ID (<b style={{ color: '#374151' }}>{loginId}</b>) is not authorized to access this report.</>}
        {' '}Please contact your administrator if you believe this is a mistake.
      </div>
    </div>
  );
}

// ── Locked report placeholder ─────────────────────────────
function ReportLocked({ onOpenParams }: { onOpenParams: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '90px 24px', color: '#6b7280', textAlign: 'center',
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%', background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontSize: 26,
      }}>⚙</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
        Select Month and Year to continue
      </div>
      <div style={{ fontSize: 13, maxWidth: 320, lineHeight: 1.6, marginBottom: 18 }}>
        Month and Year are required before the Cash Payslip Report can be generated.
      </div>
      <button
        onClick={onOpenParams}
        style={{
          padding: '8px 16px', border: 'none', borderRadius: 7, background: '#1f2937',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        ⚙ Open Parameters
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
const CashPayslipReport: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAuthorized = ALLOWED_LOGIN_IDS.includes(user?.loginid1 ?? '');

  // Panel opens automatically and the report starts locked until Month/Year are applied.
  const [panelOpen, setPanelOpen]           = useState(true);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [applied,   setApplied]   = useState<Filters>(DEFAULT_FILTERS);
  const [pending,   setPending]   = useState<Filters>(DEFAULT_FILTERS);

  const [collapsedDivs, setCollapsedDivs] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState<SortConfig>({ col: null, dir: 'asc' });

  const printDate   = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser   = user?.username;
  const periodLabel = applied.pay_month && applied.pay_year
    ? `${MONTH_NAMES[applied.pay_month - 1]} ${applied.pay_year}`
    : 'Not selected';

  // ── Fetch rows for the selected period (Month + Year drive the query) ──
  const { data: allRows = [], isLoading } = useQuery<PayslipRow[]>({
    queryKey: ['bohc_payslip_hdr_cash', applied.pay_year, applied.pay_month],
    queryFn: async () => {
      const sql = `
        SELECT ALTERNATE_ID, RPT_NAME, DESG_CODE, DESG_NAME, COMPANY_CODE, COMP_NAME,
               DIV_CODE, DIV_NAME, DEPT_CODE, DEPT_NAME, NET_SALARY
        FROM VW_BOHC_PAYSLIP_HDR
        WHERE PAYMENT_MODE = 'C'
          AND PAY_YEAR  = ${applied.pay_year}
          AND PAY_MONTH = ${applied.pay_month}
        ORDER BY EMPLOYEE_CODE
      `;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as PayslipRow[]) || [];
    },
    enabled: isAuthorized && !!applied.pay_month && !!applied.pay_year,
  });

  // ── Division options for the filter — sourced from MS_HR_DIVISION, ──
  // independent of whatever payslip period is currently loaded.
  const { data: divisionRows = [] } = useQuery<DivisionOption[]>({
    queryKey: ['ms_hr_division'],
    queryFn: async () => {
      const sql = `SELECT DIV_CODE, DIV_NAME FROM MS_HR_DIVISION ORDER BY DIV_NAME`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as DivisionOption[]) || [];
    },
    enabled: isAuthorized,
  });

  const filterOptions: FilterOptions = useMemo(() => ({
    divisions: divisionRows.map(d => ({ code: d.DIV_CODE, name: d.DIV_NAME })),
  }), [divisionRows]);

  // ── Client-side filtering (Division multi-select + free-text quick search) ──
  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (applied.div_codes.length > 0 && !applied.div_codes.includes(r.DIV_CODE)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !r.RPT_NAME?.toLowerCase().includes(q) &&
          !r.ALTERNATE_ID?.toLowerCase().includes(q) &&
          !r.DIV_NAME?.toLowerCase().includes(q) &&
          !r.DESG_NAME?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [allRows, applied, search]);

  // ── Sort ──
  const sortedRows = useCallback((rows: PayslipRow[]) => {
    if (!sort.col) return rows;
    return [...rows].sort((a, b) => {
      const col = sort.col!;
      let aVal: any = a[col];
      let bVal: any = b[col];
      if (col === 'NET_SALARY') {
        aVal = parseFloat(String(aVal)) || 0; bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase(); bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1  : -1;
      return 0;
    });
  }, [sort]);

  const divGroups   = useMemo(() => groupRows(filteredRows), [filteredRows]);
  const isFiltered  = applied.div_codes.length > 0 || search.trim().length > 0;

  // ── Collapse helpers ──
  const toggleDiv = (key: string) => setCollapsedDivs(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const allDivKeys   = divGroups.map(d => d.divCode);
  const allCollapsed = collapsedDivs.size === allDivKeys.length && allDivKeys.length > 0;

  const handleCollapseAll = () => {
    setCollapsedDivs(allCollapsed ? new Set() : new Set(allDivKeys));
  };

  const handleSort = (col: keyof PayslipRow) => {
    setSort(prev => prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' });
  };

  const handlePrint = () => { if (reportUnlocked) window.print(); };

  // ── Excel Export ──
  const handleExcel = async () => {
    if (!reportUnlocked) return;
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['Cash Payslip Report'],
      [`Period: ${periodLabel}`],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Division', 'Employee Code', 'Employee Name', 'Designation', 'Net Salary'],
    ];

    divGroups.forEach(div => {
      sortedRows(div.rows).forEach(row => {
        summaryData.push([
          div.divName,
          row.ALTERNATE_ID,
          row.RPT_NAME,
          row.DESG_NAME,
          parseFloat(String(row.NET_SALARY)) || 0,
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [
      { wch: 24 }, { wch: 16 }, { wch: 26 }, { wch: 20 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Cash Payslip');
    XLSX.writeFile(wb, 'Cash_Payslip_Report.xlsx');
  };

  // ── PDF Download ──
  const handleDownloadPDF = async () => {
    if (!reportUnlocked) return;
    const { jsPDF }              = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY   = [31, 41, 55]     as [number, number, number];
    const WHITE  = [255, 255, 255]  as [number, number, number];
    const DARK   = [55, 65, 81]     as [number, number, number];
    const BORDER = [209, 213, 219]  as [number, number, number];

    const getBase64FromUrl = (url: string): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });

    let logoBase64 = '';
    try { logoBase64 = await getBase64FromUrl(companyLogo); } catch { /* skip */ }

    const HEADER_H  = 36;
    const TITLE_Y   = 27;
    const TABLE_TOP = 39;

    const drawPageHeader = (data: any) => {
      const pg = data.pageNumber as number;
      if (logoBase64) pdf.addImage(logoBase64, 'PNG', margin, 5, 32, 16);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
      pdf.text(`Page ${pg}`,                pageW - margin, 9,  { align: 'right' });
      pdf.text(`Print Date : ${printDate}`, pageW - margin, 14, { align: 'right' });
      pdf.text(`Print User : ${printUser}`, pageW - margin, 19, { align: 'right' });
      pdf.setFillColor(...NAVY);
      pdf.rect(margin, TITLE_Y, pageW - margin * 2, 8, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(...WHITE);
      pdf.text(`Cash Payslip Report — ${periodLabel}`, pageW / 2, TITLE_Y + 5.5, { align: 'center' });
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5, right: 5 };

    divGroups.forEach(div => {
      body.push([{
        content: `Division :  ${div.divName}`,
        colSpan: 4,
        styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8.5, cellPadding: cellPad },
      }]);

      sortedRows(div.rows).forEach(row => {
        body.push([
          { content: row.ALTERNATE_ID, styles: { fontSize: 7 } },
          { content: row.RPT_NAME,      styles: { fontSize: 7 } },
          { content: row.DESG_NAME,     styles: { fontSize: 7 } },
          { content: formatAmount(parseFloat(String(row.NET_SALARY)) || 0), styles: { halign: 'right', fontSize: 7, fontStyle: 'bold' } },
        ]);
      });
    });

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 'auto' as any },
        2: { cellWidth: 44 },
        3: { cellWidth: 28 },
      },
      head: [[
        { content: 'Employee Code', styles: { halign: 'left',  fontSize: 7 } },
        { content: 'Employee Name', styles: { halign: 'left',  fontSize: 7 } },
        { content: 'Designation',   styles: { halign: 'left',  fontSize: 7 } },
        { content: 'Net Salary',    styles: { halign: 'right', fontSize: 7 } },
      ]],
      body,
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
      bodyStyles: { fontSize: 7, textColor: DARK, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, overflow: 'linebreak', minCellHeight: 0 },
      tableLineColor: BORDER,
      tableLineWidth: 0.25,
      didDrawPage: drawPageHeader,
      didDrawCell: (data) => {
        const { cell, doc } = data;
        doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
        doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
      },
    });

    pdf.save('Cash_Payslip_Report.pdf');
  };

  // ── Access gate — placed after all hooks above, so hook order stays stable ──
  if (!isAuthorized) {
    return <AccessDenied loginId={user?.loginid1} />;
  }

  const disabledBtn: React.CSSProperties = { opacity: 0.45, cursor: 'not-allowed', pointerEvents: 'none' };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .cp-report-root {
          font-family: 'DM Sans', sans-serif;
          background: #f4f6f9;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .cp-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 28px; background: #fff; border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0; z-index: 100; gap: 12px;
        }
        .cp-toolbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .cp-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }
        .cp-btn {
          padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .cp-btn-ghost   { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
        .cp-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
        .cp-btn-primary { border: none; background: #1f2937; color: #fff; }
        .cp-btn-primary:hover { background: #111827; }
        .cp-btn-success { border: none; background: #4b5563; color: #fff; }
        .cp-btn-success:hover { background: #374151; }
        .cp-btn-filter  { border: 1.5px solid #d1d5db; background: #fff; color: #374151; position: relative; }
        .cp-btn-filter.active { border-color: #1f2937; color: #1f2937; background: #f3f4f6; }
        .filter-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
          position: absolute; top: 5px; right: 5px;
        }

        .cp-search {
          padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111;
          outline: none; width: 240px; background: #fff; transition: border-color 0.15s;
        }
        .cp-search:focus { border-color: #1f2937; }
        .cp-search-wrap { position: relative; display: flex; align-items: center; }
        .cp-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }

        .cp-body        { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .cp-report-area { padding: 12px 28px 20px; flex: 1; overflow-y: auto; }
        .cp-page        {
          background: #fff; border-radius: 8px;
          border: 1px solid #e5e7eb; overflow: hidden;
        }

        .cp-report-header {
          padding: 16px 24px 14px; border-bottom: 1px solid #e5e7eb;
          display: flex; justify-content: space-between; align-items: center;
        }
        .cp-report-header-right { text-align: right; font-size: 12px; color: #6b7280; line-height: 2; padding-top: 20px; }

        .cp-title-bar {
          background: #1f2937; color: #fff; text-align: center;
          padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
        }

        .cp-table-wrap { overflow-x: auto; }

        table.cp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          table-layout: fixed;
        }

        .cp-table col.c0 { width: 15%; }
        .cp-table col.c1 { width: 35%; }
        .cp-table col.c2 { width: 30%; }
        .cp-table col.c3 { width: 20%; }

        .cp-table thead th {
          background: #1f2937; color: #fff; font-weight: 700;
          font-size: 10.5px; padding: 8px 6px; text-align: left; line-height: 1.25;
          white-space: normal; word-break: normal; overflow-wrap: normal; border-right: 1px solid rgba(255,255,255,0.12);
          user-select: none; cursor: pointer; vertical-align: bottom;
        }
        .cp-table thead th:last-child { border-right: none; }
        .cp-table thead th.num { text-align: right; }
        .cp-table thead th:hover { background: #111827; }
        .th-inner {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 4px; width: 100%;
        }
        .cp-table thead th.num .th-inner { flex-direction: row-reverse; }
        .th-inner > span:first-child { flex: 1; }

        .cp-table tr.div-row td {
          background: #1f2937; color: #fff; font-weight: 700;
          font-size: 12px; padding: 5px 14px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          border-bottom: 1px solid rgba(255,255,255,0.08); cursor: pointer;
        }
        .cp-table tr.div-row:hover td { background: #111827; }

        .cp-table tbody tr.data-row td {
          padding: 5px 10px; border-bottom: 1px solid #e5e7eb;
          color: #374151; vertical-align: middle; font-size: 11.5px;
          white-space: normal; word-wrap: break-word; line-height: 1.3;
        }
        .cp-table tbody tr.data-row:hover td { background: #f9fafb; }
        .cp-table td.num { text-align: right; font-variant-numeric: tabular-nums; }

        .cp-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

        .amount-strong { color: #111827; font-weight: 700; }

        .chevron { display: inline-block; margin-right: 6px; font-size: 10px; transition: transform 0.15s; }
        .chevron.open { transform: rotate(90deg); }

        @media print {
          @page { margin: 0; size: A4 portrait; }
          .cp-toolbar, .no-print { display: none !important; }
          .cp-report-root { background: white; height: auto; overflow: visible; }
          .cp-body        { overflow: visible; }
          .cp-report-area { padding: 0; overflow: visible; flex: none; }
          .cp-page        { border: none; border-radius: 0; box-shadow: none; }
          .cp-table tbody tr.data-row td { border-bottom: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb; }
          .print-logo-only { display: block !important; }
        }
        .print-logo-only { display: none; }
      `}</style>

      <div className="cp-report-root">
        {/* ── Toolbar ── */}
        <div className="cp-toolbar no-print">
          <div className="cp-toolbar-left">
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
              Cash Payslip Report
            </span>
            <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', borderRadius: 4, padding: '3px 9px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {periodLabel}
            </span>
            {isFiltered && reportUnlocked && (
              <span style={{ fontSize: 11, background: '#f3f4f6', color: '#1f2937', borderRadius: 4, padding: '3px 9px', fontWeight: 600 }}>
                Filtered
              </span>
            )}
            <div className="cp-search-wrap" style={!reportUnlocked ? disabledBtn : undefined}>
              <span className="cp-search-icon">🔍</span>
              <input
                className="cp-search"
                placeholder="Search employee / division / designation…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={!reportUnlocked}
              />
            </div>
          </div>
          <div className="cp-toolbar-right">
            <button className="cp-btn cp-btn-ghost" onClick={handleCollapseAll} disabled={!reportUnlocked} style={!reportUnlocked ? disabledBtn : undefined}>
              {allCollapsed ? '⊞ Expand All' : '⊟ Collapse All'}
            </button>
            <button className={`cp-btn cp-btn-filter ${applied.div_codes.length > 0 ? 'active' : ''}`} onClick={() => setPanelOpen(true)}>
              {applied.div_codes.length > 0 && <span className="filter-dot" />}
              ⚙ Parameters
            </button>
            <button className="cp-btn cp-btn-ghost"   onClick={handlePrint}        disabled={!reportUnlocked} style={!reportUnlocked ? disabledBtn : undefined}>🖨 Print</button>
            <button className="cp-btn cp-btn-success" onClick={handleExcel}        disabled={!reportUnlocked} style={!reportUnlocked ? disabledBtn : undefined}>📊 Excel</button>
            <button className="cp-btn cp-btn-primary" onClick={handleDownloadPDF}  disabled={!reportUnlocked} style={!reportUnlocked ? disabledBtn : undefined}>⬇ PDF</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="cp-body">
          <div className="cp-report-area">
            <div className="cp-page" ref={printRef}>

              {!reportUnlocked ? (
                <ReportLocked onOpenParams={() => setPanelOpen(true)} />
              ) : (
                <>
                  {/* Report header */}
                  <div className="cp-report-header">
                    <img src={companyLogo} alt="Logo" className="print-logo-only" style={{ height: 54, width: 200, objectFit: 'fill' }} />
                    <div className="cp-report-header-right">
                      <div><b style={{ color: '#374151' }}>Print Date:</b> {printDate}</div>
                      <div><b style={{ color: '#374151' }}>Print User:</b> {printUser}</div>
                    </div>
                  </div>

                  <div className="cp-title-bar">Cash Payslip Report — {periodLabel}</div>

                  {/* Table — no subtotal / grand total rows */}
                  <div className="cp-table-wrap">
                    {isLoading ? (
                      <div className="cp-empty">Loading data…</div>
                    ) : divGroups.length === 0 ? (
                      <div className="cp-empty">No records found.</div>
                    ) : (
                      <table className="cp-table">
                        <colgroup>
                          <col className="c0" /><col className="c1" /><col className="c2" /><col className="c3" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('ALTERNATE_ID')}><span className="th-inner"><span>Emp No</span><SortArrow col="ALTERNATE_ID" sort={sort} /></span></th>
                            <th onClick={() => handleSort('RPT_NAME')}><span className="th-inner"><span>Employee Name</span><SortArrow col="RPT_NAME" sort={sort} /></span></th>
                            <th onClick={() => handleSort('DESG_NAME')}><span className="th-inner"><span>Designation</span><SortArrow col="DESG_NAME" sort={sort} /></span></th>
                            <th className="num" onClick={() => handleSort('NET_SALARY')}><span className="th-inner"><span>Net Salary</span><SortArrow col="NET_SALARY" sort={sort} /></span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {divGroups.map(div => {
                            const divOpen = !collapsedDivs.has(div.divCode);
                            const rows = sortedRows(div.rows);
                            return (
                              <React.Fragment key={div.divCode}>
                                <tr className="div-row" onClick={() => toggleDiv(div.divCode)}>
                                  <td colSpan={4}>
                                    <span className={`chevron ${divOpen ? 'open' : ''}`}>▶</span>
                                    Division : {div.divName}
                                  </td>
                                </tr>

                                {divOpen && rows.map((row, ri) => (
                                  <tr key={`${row.ALTERNATE_ID}-${ri}`} className="data-row">
                                    <td>{row.ALTERNATE_ID}</td>
                                    <td>{row.RPT_NAME}</td>
                                    <td>{row.DESG_NAME}</td>
                                    <td className="num amount-strong">{formatAmount(parseFloat(String(row.NET_SALARY)) || 0)}</td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FilterPanel
        options={filterOptions}
        filters={pending}
        onChange={setPending}
        onApply={() => { setApplied({ ...pending }); setReportUnlocked(true); }}
        onReset={() => {
          setPending(DEFAULT_FILTERS);
          setApplied(DEFAULT_FILTERS);
          setReportUnlocked(false);
          setPanelOpen(true);
        }}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        allowClose={reportUnlocked}
      />
    </>
  );
};

export default CashPayslipReport;