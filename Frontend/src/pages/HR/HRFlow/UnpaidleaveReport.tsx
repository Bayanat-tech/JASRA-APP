import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';

// ── Types ────────────────────────────────────────────────
// Matches VW_HR_LEAVE_REQUEST_FLOW — one row per unpaid leave request.
type LeaveRow = {
  REQUEST_NUMBER:   string;
  ALTERNATE_ID:    string;
  EMPLOYEE_NAME:    string;
  LEAVE_TYPE_DESC:   string;
  LEAVE_DAYS:      string;
  LEAVE_START_DATE: string;
  LEAVE_END_DATE:   string;
  REMARKS:          string;
};

type Filters = {
  date_from: string;
  date_to:   string;
};

function describeFilters(applied: Filters, search: string): string {
  const parts: string[] = [];
  if (applied.date_from || applied.date_to) {
    const from = applied.date_from ? formatDateDisplay(applied.date_from) : '…';
    const to   = applied.date_to   ? formatDateDisplay(applied.date_to)   : '…';
    parts.push(`Date Range: ${from} - ${to}`);
  }
  if (search.trim()) parts.push(`Search: "${search.trim()}"`);
  return parts.join(' | ');
}

type SortConfig = { col: keyof LeaveRow | null; dir: 'asc' | 'desc' };

// ── Helpers ───────────────────────────────────────────────
function formatDateDisplay(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function overlapsRange(row: LeaveRow, from: string, to: string): boolean {
  if (!from && !to) return true;
  const start = row.LEAVE_START_DATE ? new Date(row.LEAVE_START_DATE) : null;
  const end   = row.LEAVE_END_DATE   ? new Date(row.LEAVE_END_DATE)   : start;
  if (!start) return false;

  const fromDate = from ? new Date(from) : null;
  const toDate   = to   ? new Date(to)   : null;

  if (fromDate && end   && end   < fromDate) return false;
  if (toDate   && start && start > toDate)   return false;
  return true;
}

// ── Sort Arrow ────────────────────────────────────────────
function SortArrow({ col, sort }: { col: keyof LeaveRow; sort: SortConfig }) {
  if (sort.col !== col) return <span style={{ opacity: 0.35, marginLeft: 4 }}>⇅</span>;
  return <span style={{ marginLeft: 4 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

// ── Filter Panel ──────────────────────────────────────────
function FilterPanel({
  filters, onChange, onApply, onReset, open, onClose,
}: {
  filters:  Filters;
  onChange: (f: Filters) => void;
  onApply:  () => void;
  onReset:  () => void;
  open:     boolean;
  onClose:  () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)',
        zIndex: 199, backdropFilter: 'blur(1px)',
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
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Date range — matched against LEAVE_START_DATE / LEAVE_END_DATE */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={e => onChange({ ...filters, date_from: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={e => onChange({ ...filters, date_to: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 5, lineHeight: 1.4 }}>
              Shows any request whose leave period (Start – End) overlaps this date range.
            </div>
          </div>

        </div>

        <div style={{ padding: '16px 20px 40px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, background: '#fafafa' }}>
          <button onClick={onReset} style={{ flex: 1, padding: '9px', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>Reset</button>
          <button onClick={() => { onApply(); onClose(); }} style={{ flex: 2, padding: '9px', border: 'none', borderRadius: 7, background: '#1f2937', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700 }}>Apply Filters</button>
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
        You don't have permission to view the Unpaid Leave Report.
        {loginId && <> Your login ID (<b style={{ color: '#374151' }}>{loginId}</b>) is not authorized to access this report.</>}
        {' '}Please contact your administrator if you believe this is a mistake.
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
const UnpaidLeaveReport: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAuthorized = ALLOWED_LOGIN_IDS.includes(user?.loginid1 ?? '');

  const EMPTY_FILTERS: Filters = { date_from: '', date_to: '' };
  const [panelOpen, setPanelOpen] = useState(false);
  const [applied,   setApplied]   = useState<Filters>(EMPTY_FILTERS);
  const [pending,   setPending]   = useState<Filters>(EMPTY_FILTERS);

  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState<SortConfig>({ col: null, dir: 'asc' });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;

  const { data: allRows = [], isLoading } = useQuery<LeaveRow[]>({
    queryKey: ['hr_unpaid_leave_request_flow'],
    queryFn: async () => {
      const sql = `SELECT request_number, alternate_id, employee_name, LEAVE_TYPE_DESC, LEAVE_DAYS, leave_start_date, 
      leave_end_date, remarks FROM vw_hr_leave_request_flow where leave_type = '001'`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as LeaveRow[]) || [];
    },
    enabled: isAuthorized, // don't fetch report data for unauthorized users
  });

  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (!overlapsRange(r, applied.date_from, applied.date_to)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !r.REQUEST_NUMBER?.toLowerCase().includes(q) &&
          !r.ALTERNATE_ID?.toLowerCase().includes(q) &&
          !r.EMPLOYEE_NAME?.toLowerCase().includes(q) &&
          !r.LEAVE_TYPE_DESC?.toLowerCase().includes(q) &&
          !r.LEAVE_DAYS?.toLowerCase().includes(q) &&
          !r.REMARKS?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [allRows, applied, search]);

  // ── Sort ──
  const sortedRows = useCallback((rows: LeaveRow[]) => {
    if (!sort.col) return rows;
    return [...rows].sort((a, b) => {
      const col = sort.col!;
      let aVal: any = a[col];
      let bVal: any = b[col];
      if (col === 'LEAVE_START_DATE' || col === 'LEAVE_END_DATE') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase(); bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1  : -1;
      return 0;
    });
  }, [sort]);

  const displayRows = useMemo(() => sortedRows(filteredRows), [filteredRows, sortedRows]);

  const isFiltered = Boolean(applied.date_from) || Boolean(applied.date_to) || search.trim().length > 0;

  const handleSort = (col: keyof LeaveRow) => {
    setSort(prev => prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' });
  };

  const handlePrint = () => window.print();

  // ── Excel Export ──
  const handleExcel = async () => {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['Unpaid Leave Report'],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Request No.', 'Employee Code', 'Employee Name', 'Leave Type', 'Leave Days', 'Leave Start Date', 'Leave End Date', 'Remarks'],
    ];

    displayRows.forEach(row => {
      summaryData.push([
        row.REQUEST_NUMBER,
        row.ALTERNATE_ID,
        row.EMPLOYEE_NAME,
        row.LEAVE_TYPE_DESC,
        row.LEAVE_DAYS,
        formatDateDisplay(row.LEAVE_START_DATE),
        formatDateDisplay(row.LEAVE_END_DATE),
        row.REMARKS,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [
      { wch: 16 }, { wch: 16 }, { wch: 26 }, { wch: 16 },
      { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Unpaid Leave');
    XLSX.writeFile(wb, 'Unpaid_Leave_Report.xlsx');
  };

  // ── PDF Download ──
  const handleDownloadPDF = async () => {
    const { jsPDF }              = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY  = [31, 41, 55]     as [number, number, number];
    const WHITE = [255, 255, 255]  as [number, number, number];
    const DARK  = [55, 65, 81]     as [number, number, number];
    const BORDER= [209, 213, 219]  as [number, number, number];

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
    const TABLE_TOP = isFiltered ? 44 : 39;

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
      pdf.text('Unpaid Leave Report', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      if (pg === 1 && isFiltered) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(107, 114, 128);
        const parts = describeFilters(applied, '');
        if (parts) pdf.text(`Filter: ${parts}`, margin, TABLE_TOP - 2);
      }
    };

    const body = displayRows.map(row => ([
      { content: row.REQUEST_NUMBER,                     styles: { fontSize: 7.5 } },
      { content: row.ALTERNATE_ID,                       styles: { fontSize: 7.5 } },
      { content: row.EMPLOYEE_NAME,                       styles: { fontSize: 7.5 } },
      { content: row.LEAVE_TYPE_DESC,                      styles: { fontSize: 7.5 } },
      { content: row.LEAVE_DAYS,                         styles: { fontSize: 7.5 } },
      { content: formatDateDisplay(row.LEAVE_START_DATE), styles: { fontSize: 7.5 } },
      { content: formatDateDisplay(row.LEAVE_END_DATE),   styles: { fontSize: 7.5 } },
      { content: row.REMARKS,                             styles: { fontSize: 7.5 } },
    ]));

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 26 },
        2: { cellWidth: 44 },
        3: { cellWidth: 26 },
        4: { cellWidth: 26 },
        5: { cellWidth: 26 },
        6: { cellWidth: 26 },
        7: { cellWidth: 'auto' as any },
      },
      head: [[
        { content: 'Request No.',       styles: { fontSize: 7.5 } },
        { content: 'Employee Code',     styles: { fontSize: 7.5 } },
        { content: 'Employee Name',     styles: { fontSize: 7.5 } },
        { content: 'Leave Type',        styles: { fontSize: 7.5 } },
        { content: 'Leave Days',        styles: { fontSize: 7.5 } },
        { content: 'Leave Start Date',  styles: { fontSize: 7.5 } },
        { content: 'Leave End Date',    styles: { fontSize: 7.5 } },
        { content: 'Remarks',           styles: { fontSize: 7.5 } },
      ]],
      body,
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
      bodyStyles: { fontSize: 7.5, textColor: DARK, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, overflow: 'linebreak', minCellHeight: 0 },
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

    pdf.save('Unpaid_Leave_Report.pdf');
  };

  // ── Access gate — placed after all hooks above, so hook order stays stable ──
  if (!isAuthorized) {
    return <AccessDenied loginId={user?.loginid1} />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .ul-report-root {
          font-family: 'DM Sans', sans-serif;
          background: #f4f6f9;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Toolbar ── */
        .ul-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 28px; background: #fff; border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0; z-index: 100; gap: 12px;
        }
        .ul-toolbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .ul-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }
        .ul-btn {
          padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .ul-btn-ghost   { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
        .ul-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
        .ul-btn-primary { border: none; background: #1f2937; color: #fff; }
        .ul-btn-primary:hover { background: #111827; }
        .ul-btn-success { border: none; background: #4b5563; color: #fff; }
        .ul-btn-success:hover { background: #374151; }
        .ul-btn-filter  { border: 1.5px solid #d1d5db; background: #fff; color: #374151; position: relative; }
        .ul-btn-filter.active { border-color: #1f2937; color: #1f2937; background: #f3f4f6; }
        .filter-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
          position: absolute; top: 5px; right: 5px;
        }

        /* Search */
        .ul-search {
          padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111;
          outline: none; width: 240px; background: #fff; transition: border-color 0.15s;
        }
        .ul-search:focus { border-color: #1f2937; }
        .ul-search-wrap { position: relative; display: flex; align-items: center; }
        .ul-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }

        /* ── Body layout ── */
        .ul-body        { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .ul-report-area { padding: 12px 28px 20px; flex: 1; overflow-y: auto; }
        .ul-page        {
          background: #fff; border-radius: 8px;
          border: 1px solid #e5e7eb; overflow: hidden;
        }

        /* Report header */
        .ul-report-header {
          padding: 16px 24px 14px; border-bottom: 1px solid #e5e7eb;
          display: flex; justify-content: space-between; align-items: center;
        }
        .ul-report-header-right { text-align: right; font-size: 12px; color: #6b7280; line-height: 2; padding-top: 20px; }

        /* Title bar */
        .ul-title-bar {
          background: #1f2937; color: #fff; text-align: center;
          padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
        }

        /* Meta row */
        .ul-meta {
          display: flex; gap: 32px; padding: 9px 24px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
          font-size: 12px; color: #6b7280; flex-wrap: wrap; min-height: 10px;
        }

        /* ── Table ── */
        .ul-table-wrap { overflow-x: auto; }

        table.ul-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          table-layout: fixed;
        }

        .ul-table col.c0 { width: 11%; } /* Request No. */
        .ul-table col.c1 { width: 11%; } /* Employee Code */
        .ul-table col.c2 { width: 18%; } /* Employee Name */
        .ul-table col.c3 { width: 12%; } /* Leave Type */
        .ul-table col.c4 { width: 12%; } /* Leave Days */
        .ul-table col.c5 { width: 11%; } /* Leave Start Date */
        .ul-table col.c6 { width: 11%; } /* Leave End Date */
        .ul-table col.c7 { width: 14%; } /* Remarks */

        .ul-table thead th {
          background: #1f2937; color: #fff; font-weight: 700;
          font-size: 10.5px; padding: 8px 6px; text-align: left; line-height: 1.25;
          white-space: normal; word-break: normal; overflow-wrap: normal; border-right: 1px solid rgba(255,255,255,0.12);
          user-select: none; cursor: pointer; vertical-align: bottom;
        }
        .ul-table thead th:last-child { border-right: none; }
        .ul-table thead th:hover { background: #111827; }
        .th-inner {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 4px; width: 100%;
        }
        .th-inner > span:first-child { flex: 1; }

        /* Data rows */
        .ul-table tbody tr.data-row td {
          padding: 6px 10px; border-bottom: 1px solid #e5e7eb;
          color: #374151; vertical-align: middle; font-size: 11.5px;
          white-space: normal; word-wrap: break-word; line-height: 1.3;
        }
        .ul-table tbody tr.data-row:hover td { background: #f9fafb; }

        .ul-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

        /* Print */
        @media print {
          @page { margin: 0; size: A4 landscape; }
          .ul-toolbar, .no-print { display: none !important; }
          .ul-report-root { background: white; height: auto; overflow: visible; }
          .ul-body        { overflow: visible; }
          .ul-report-area { padding: 0; overflow: visible; flex: none; }
          .ul-page        { border: none; border-radius: 0; box-shadow: none; }
          .ul-table tbody tr.data-row td { border-bottom: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb; }
          .print-logo-only { display: block !important; }
        }
        .print-logo-only { display: none; }
      `}</style>

      <div className="ul-report-root">
        {/* ── Toolbar ── */}
        <div className="ul-toolbar no-print">
          <div className="ul-toolbar-left">
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
              Unpaid Leave Report
            </span>
            {isFiltered && (
              <span style={{ fontSize: 11, background: '#f3f4f6', color: '#1f2937', borderRadius: 4, padding: '3px 9px', fontWeight: 600 }}>
                Filtered
              </span>
            )}
            <div className="ul-search-wrap">
              <span className="ul-search-icon">🔍</span>
              <input
                className="ul-search"
                placeholder="Search request / employee / status…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="ul-toolbar-right">
            <button className={`ul-btn ul-btn-filter ${isFiltered ? 'active' : ''}`} onClick={() => setPanelOpen(true)}>
              {isFiltered && <span className="filter-dot" />}
              ⚙ Parameters
            </button>
            <button className="ul-btn ul-btn-ghost"   onClick={handlePrint}>🖨 Print</button>
            <button className="ul-btn ul-btn-success" onClick={handleExcel}>📊 Excel</button>
            <button className="ul-btn ul-btn-primary" onClick={handleDownloadPDF}>⬇ PDF</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ul-body">
          <div className="ul-report-area">
            <div className="ul-page" ref={printRef}>

              {/* Report header */}
              <div className="ul-report-header">
                <img src={companyLogo} alt="Logo" className="print-logo-only" style={{ height: 54, width: 200, objectFit: 'fill' }} />
                <div className="ul-report-header-right">
                  <div><b style={{ color: '#374151' }}>Print Date:</b> {printDate}</div>
                  <div><b style={{ color: '#374151' }}>Print User:</b> {printUser}</div>
                </div>
              </div>

              <div className="ul-title-bar">Unpaid Leave Report</div>

              <div className="ul-meta">
                {isFiltered && (
                  <span>
                    <b>Filter:</b>{' '}
                    {describeFilters(applied, search)}
                  </span>
                )}
              </div>

              {/* Table */}
              <div className="ul-table-wrap">
                {isLoading ? (
                  <div className="ul-empty">Loading data…</div>
                ) : displayRows.length === 0 ? (
                  <div className="ul-empty">No records found.</div>
                ) : (
                  <table className="ul-table">
                    <colgroup>
                      <col className="c0" /><col className="c1" /><col className="c2" />
                      <col className="c3" /><col className="c4" /><col className="c5" />
                      <col className="c6" /><col className="c7" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('REQUEST_NUMBER')}><span className="th-inner"><span>Request No.</span><SortArrow col="REQUEST_NUMBER" sort={sort} /></span></th>
                        <th onClick={() => handleSort('ALTERNATE_ID')}><span className="th-inner"><span>Employee Code</span><SortArrow col="ALTERNATE_ID" sort={sort} /></span></th>
                        <th onClick={() => handleSort('EMPLOYEE_NAME')}><span className="th-inner"><span>Employee Name</span><SortArrow col="EMPLOYEE_NAME" sort={sort} /></span></th>
                        <th onClick={() => handleSort('LEAVE_TYPE_DESC')}><span className="th-inner"><span>Leave Type</span><SortArrow col="LEAVE_TYPE_DESC" sort={sort} /></span></th>
                        <th onClick={() => handleSort('LEAVE_DAYS')}><span className="th-inner"><span>Leave Days</span><SortArrow col="LEAVE_DAYS" sort={sort} /></span></th>
                        <th onClick={() => handleSort('LEAVE_START_DATE')}><span className="th-inner"><span>Leave Start Date</span><SortArrow col="LEAVE_START_DATE" sort={sort} /></span></th>
                        <th onClick={() => handleSort('LEAVE_END_DATE')}><span className="th-inner"><span>Leave End Date</span><SortArrow col="LEAVE_END_DATE" sort={sort} /></span></th>
                        <th onClick={() => handleSort('REMARKS')}><span className="th-inner"><span>Remarks</span><SortArrow col="REMARKS" sort={sort} /></span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((row, ri) => (
                        <tr key={`${row.REQUEST_NUMBER}-${ri}`} className="data-row">
                          <td>{row.REQUEST_NUMBER}</td>
                          <td>{row.ALTERNATE_ID}</td>
                          <td>{row.EMPLOYEE_NAME}</td>
                          <td>{row.LEAVE_TYPE_DESC}</td>
                          <td>{row.LEAVE_DAYS}</td>
                          <td>{formatDateDisplay(row.LEAVE_START_DATE)}</td>
                          <td>{formatDateDisplay(row.LEAVE_END_DATE)}</td>
                          <td>{row.REMARKS}</td>
                        </tr>
                      ))}   
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterPanel
        filters={pending}
        onChange={setPending}
        onApply={() => setApplied({ ...pending })}
        onReset={() => { setPending(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); }}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </>
  );
};

export default UnpaidLeaveReport;