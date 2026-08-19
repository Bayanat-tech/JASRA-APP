import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';

// ── Types ────────────────────────────────────────────────
// Matches VW_HR_EMP_LEAVE_SUMMARY — one row per employee,
// with each leave type as its own numeric column.
type LeaveRow = {
  EMPLOYEE_ID:          string;
  RPT_NAME:             string;
  DIV_CODE:             string;
  DIV_NAME:             string;
  DEPT_CODE:            string;
  DEPT_NAME:            string;
  ANNUAL_LEAVE:         number;
  COMPENSATORY_LEAVE:   number;
  COMPASSIONATE_LEAVE:  number;
  FLOATING_LEAVE:       number;
  SICK_LEAVE:           number;
  TOTAL_LEAVES:         number;
};

type DeptGroup = { deptCode: string; deptName: string; rows: LeaveRow[] };
type DivGroup  = { divCode: string; divName: string; departments: DeptGroup[] };

type Filters = {
  div_code:   string;
  dept_code:  string;
  emp_search: string;
};

type FilterOptions = {
  divisions:   { code: string; name: string }[];
  departments: { code: string; name: string }[];
};

type SortConfig = { col: keyof LeaveRow | null; dir: 'asc' | 'desc' };

// ── Helpers ───────────────────────────────────────────────
function formatDays(n: number) {
  return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// ── Grouping: Division → Department → Details ────────────
function groupRows(rows: LeaveRow[]): DivGroup[] {
  const divMap: Record<string, any> = {};
  for (const r of rows) {
    const divKey  = r.DIV_CODE || 'UNASSIGNED';
    const deptKey = r.DEPT_CODE || 'UNASSIGNED';

    if (!divMap[divKey])
      divMap[divKey] = { divCode: r.DIV_CODE, divName: r.DIV_NAME || 'Unassigned Division', departments: {} };
    if (!divMap[divKey].departments[deptKey])
      divMap[divKey].departments[deptKey] = { deptCode: r.DEPT_CODE, deptName: r.DEPT_NAME || 'Unassigned Department', rows: [] };

    divMap[divKey].departments[deptKey].rows.push(r);
  }
  return Object.values(divMap).map((d: any) => ({
    ...d,
    departments: Object.values(d.departments),
  }));
}

// ── Sort Arrow ────────────────────────────────────────────
function SortArrow({ col, sort }: { col: keyof LeaveRow; sort: SortConfig }) {
  if (sort.col !== col) return <span style={{ opacity: 0.35, marginLeft: 4 }}>⇅</span>;
  return <span style={{ marginLeft: 4 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

// ── Filter Panel ──────────────────────────────────────────
function FilterPanel({
  options, filters, onChange, onApply, onReset, open, onClose,
}: {
  options:  FilterOptions;
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

          {/* Employee search */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employee</label>
            <input
              type="text"
              placeholder="Search employee name / ID…"
              value={filters.emp_search}
              onChange={e => onChange({ ...filters, emp_search: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Division dropdown — displays name, filters by code */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Division</label>
            <select value={filters.div_code} onChange={e => onChange({ ...filters, div_code: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', cursor: 'pointer' }}>
              <option value="">All</option>
              {options.divisions.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
          </div>

          {/* Department dropdown — displays name, filters by code */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Department</label>
            <select value={filters.dept_code} onChange={e => onChange({ ...filters, dept_code: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', cursor: 'pointer' }}>
              <option value="">All</option>
              {options.departments.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
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
        You don't have permission to view the Leave Balance Report.
        {loginId && <> Your login ID (<b style={{ color: '#374151' }}>{loginId}</b>) is not authorized to access this report.</>}
        {' '}Please contact your administrator if you believe this is a mistake.
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
const LeaveBalanceReport: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAuthorized = ALLOWED_LOGIN_IDS.includes(user?.loginid1 ?? '');

  const EMPTY_FILTERS: Filters = { div_code: '', dept_code: '', emp_search: '' };
  const [panelOpen, setPanelOpen] = useState(false);
  const [applied,   setApplied]   = useState<Filters>(EMPTY_FILTERS);
  const [pending,   setPending]   = useState<Filters>(EMPTY_FILTERS);

  const [collapsedDivs,  setCollapsedDivs]  = useState<Set<string>>(new Set());
  const [collapsedDepts, setCollapsedDepts] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState<SortConfig>({ col: null, dir: 'asc' });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;

  // ── Fetch all rows (no server-side filter for client-side flexibility) ──
  const { data: allRows = [], isLoading } = useQuery<LeaveRow[]>({
    queryKey: ['hr_emp_leave_summary'],
    queryFn: async () => {
      const sql = `SELECT * FROM VW_HR_EMP_LEAVE_SUMMARY ORDER BY EMPLOYEE_ID`; // returns EMPLOYEE_ID, RPT_NAME, DIV_CODE, DIV_NAME, DEPT_CODE, DEPT_NAME, ANNUAL_LEAVE, COMPENSATORY_LEAVE, COMPASSIONATE_LEAVE, FLOATING_LEAVE, SICK_LEAVE, TOTAL_LEAVES
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as LeaveRow[]) || [];
    },
    enabled: isAuthorized, // don't fetch report data for unauthorized users
  });

  // ── Filter options (name shown, code used for filtering) ──
  const filterOptions: FilterOptions = useMemo(() => {
    const divMap: Record<string, string> = {};
    const deptMap: Record<string, string> = {};
    allRows.forEach(r => {
      if (r.DIV_CODE)  divMap[r.DIV_CODE]   = r.DIV_NAME;
      if (r.DEPT_CODE) deptMap[r.DEPT_CODE] = r.DEPT_NAME;
    });
    return {
      divisions:   Object.entries(divMap).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name)),
      departments: Object.entries(deptMap).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [allRows]);

  // ── Client-side filtering ──
  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (applied.div_code   && r.DIV_CODE   !== applied.div_code)   return false;
      if (applied.dept_code  && r.DEPT_CODE  !== applied.dept_code)  return false;
      if (applied.emp_search) {
        const q = applied.emp_search.toLowerCase();
        if (!r.RPT_NAME?.toLowerCase().includes(q) && !r.EMPLOYEE_ID?.toLowerCase().includes(q)) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !r.RPT_NAME?.toLowerCase().includes(q) &&
          !r.EMPLOYEE_ID?.toLowerCase().includes(q) &&
          !r.DIV_NAME?.toLowerCase().includes(q) &&
          !r.DEPT_NAME?.toLowerCase().includes(q)
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
      if (['ANNUAL_LEAVE', 'COMPENSATORY_LEAVE', 'COMPASSIONATE_LEAVE', 'FLOATING_LEAVE', 'SICK_LEAVE', 'TOTAL_LEAVES'].includes(col)) {
        aVal = parseFloat(String(aVal)) || 0; bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase(); bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1  : -1;
      return 0;
    });
  }, [sort]);

  const divGroups  = useMemo(() => groupRows(filteredRows), [filteredRows]);
  const isFiltered = Object.values(applied).some(Boolean) || search.trim().length > 0;

  // ── Collapse helpers ──
  const toggleDiv  = (key: string) => setCollapsedDivs(prev  => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleDept = (key: string) => setCollapsedDepts(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const allDivKeys  = divGroups.map(d => d.divCode);
  const allDeptKeys = divGroups.flatMap(d => d.departments.map(dep => `${d.divCode}|||${dep.deptCode}`));
  const allCollapsed = collapsedDivs.size === allDivKeys.length && allDivKeys.length > 0;

  const handleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedDivs(new Set());
      setCollapsedDepts(new Set());
    } else {
      setCollapsedDivs(new Set(allDivKeys));
      setCollapsedDepts(new Set(allDeptKeys));
    }
  };

  const handleSort = (col: keyof LeaveRow) => {
    setSort(prev => prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' });
  };

  const handlePrint = () => window.print();

  // ── Excel Export ──
  const handleExcel = async () => {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['Leave Balance Report'],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Division', 'Department', 'Employee ID', 'Employee Name', 'Annual', 'Compensatory', 'Compassionate', 'Floating', 'Sick', 'Total'],
    ];

    divGroups.forEach(div => {
      div.departments.forEach(dept => {
        sortedRows(dept.rows).forEach(row => {
          summaryData.push([
            div.divName,
            dept.deptName,
            row.EMPLOYEE_ID,
            row.RPT_NAME,
            parseFloat(String(row.ANNUAL_LEAVE)) || 0,
            parseFloat(String(row.COMPENSATORY_LEAVE)) || 0,
            parseFloat(String(row.COMPASSIONATE_LEAVE)) || 0,
            parseFloat(String(row.FLOATING_LEAVE)) || 0,
            parseFloat(String(row.SICK_LEAVE)) || 0,
            parseFloat(String(row.TOTAL_LEAVES)) || 0,
          ]);
        });
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [
      { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 26 },
      { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Balance');
    XLSX.writeFile(wb, 'Leave_Balance_Report.xlsx');
  };

  // ── PDF Download ──
  const handleDownloadPDF = async () => {
    const { jsPDF }              = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY  = [31, 41, 55]     as [number, number, number]; // dark gray/black
    const DIV   = [229, 231, 235]  as [number, number, number]; // light gray
    // const DEPT  = [243, 244, 246]  as [number, number, number]; // lighter gray
    const WHITE = [255, 255, 255]  as [number, number, number];
    const DARK  = [55, 65, 81]     as [number, number, number];
    const NVYTX = [31, 41, 55]     as [number, number, number];
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
      pdf.text('Leave Balance Report', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      if (pg === 1 && isFiltered) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(107, 114, 128);
        const parts = Object.entries(applied).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ');
        if (parts) pdf.text(`Filter: ${parts}`, margin, TABLE_TOP - 2);
      }
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5, right: 5 };
    const indPad1 = { top: 3,   bottom: 3,   left: 12, right: 5 };

    divGroups.forEach(div => {
      // Division header row
      body.push([{
        content: `Division :  ${div.divName}`,
        colSpan: 8,
        styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 8.5, cellPadding: cellPad },
      }]);

      div.departments.forEach(dept => {
        body.push([{
          content: `Department :  ${dept.deptName}`,
          colSpan: 8,
          styles: { fillColor: DIV, textColor: NVYTX, fontStyle: 'bold', fontSize: 8, cellPadding: indPad1 },
        }]);

        sortedRows(dept.rows).forEach(row => {
          body.push([
            { content: row.EMPLOYEE_ID, styles: { fontSize: 7 } },
            { content: row.RPT_NAME,    styles: { fontSize: 7 } },
            { content: formatDays(parseFloat(String(row.ANNUAL_LEAVE)) || 0),        styles: { halign: 'right', fontSize: 7 } },
            { content: formatDays(parseFloat(String(row.COMPENSATORY_LEAVE)) || 0),  styles: { halign: 'right', fontSize: 7 } },
            { content: formatDays(parseFloat(String(row.COMPASSIONATE_LEAVE)) || 0), styles: { halign: 'right', fontSize: 7 } },
            { content: formatDays(parseFloat(String(row.FLOATING_LEAVE)) || 0),      styles: { halign: 'right', fontSize: 7 } },
            { content: formatDays(parseFloat(String(row.SICK_LEAVE)) || 0),          styles: { halign: 'right', fontSize: 7 } },
            { content: formatDays(parseFloat(String(row.TOTAL_LEAVES)) || 0),        styles: { halign: 'right', fontSize: 7, fontStyle: 'bold' } },
          ]);
        });
      });
    });

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: {
        0: { cellWidth: 20 },        // Employee ID
        1: { cellWidth: 'auto' as any }, // Employee Name (fills remaining space, wraps)
        2: { cellWidth: 16 },        // Annual
        3: { cellWidth: 20 },        // Compensatory
        4: { cellWidth: 20 },        // Compassionate
        5: { cellWidth: 16 },        // Floating
        6: { cellWidth: 14 },        // Sick
        7: { cellWidth: 16 },        // Total
      },
      head: [[
        { content: 'Employee ID',    styles: { halign: 'left',  fontSize: 7 } },
        { content: 'Employee Name',  styles: { halign: 'left',  fontSize: 7 } },
        { content: 'Annual',         styles: { halign: 'right', fontSize: 7 } },
        { content: 'Compensatory',   styles: { halign: 'right', fontSize: 7 } },
        { content: 'Compassionate',  styles: { halign: 'right', fontSize: 7 } },
        { content: 'Floating',       styles: { halign: 'right', fontSize: 7 } },
        { content: 'Sick',           styles: { halign: 'right', fontSize: 7 } },
        { content: 'Total',          styles: { halign: 'right', fontSize: 7 } },
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

    pdf.save('Leave_Balance_Report.pdf');
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

        .lb-report-root {
          font-family: 'DM Sans', sans-serif;
          background: #f4f6f9;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Toolbar ── */
        .lb-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 28px; background: #fff; border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0; z-index: 100; gap: 12px;
        }
        .lb-toolbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .lb-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }
        .lb-btn {
          padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .lb-btn-ghost   { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
        .lb-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
        .lb-btn-primary { border: none; background: #1f2937; color: #fff; }
        .lb-btn-primary:hover { background: #111827; }
        .lb-btn-success { border: none; background: #4b5563; color: #fff; }
        .lb-btn-success:hover { background: #374151; }
        .lb-btn-filter  { border: 1.5px solid #d1d5db; background: #fff; color: #374151; position: relative; }
        .lb-btn-filter.active { border-color: #1f2937; color: #1f2937; background: #f3f4f6; }
        .filter-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
          position: absolute; top: 5px; right: 5px;
        }

        /* Search */
        .lb-search {
          padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111;
          outline: none; width: 240px; background: #fff; transition: border-color 0.15s;
        }
        .lb-search:focus { border-color: #1f2937; }
        .lb-search-wrap { position: relative; display: flex; align-items: center; }
        .lb-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }

        /* ── Body layout ── */
        .lb-body        { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .lb-report-area { padding: 12px 28px 20px; flex: 1; overflow-y: auto; }
        .lb-page        {
          background: #fff; border-radius: 8px;
          border: 1px solid #e5e7eb; overflow: hidden;
        }

        /* Report header */
        .lb-report-header {
          padding: 16px 24px 14px; border-bottom: 1px solid #e5e7eb;
          display: flex; justify-content: space-between; align-items: center;
        }
        .lb-report-header-right { text-align: right; font-size: 12px; color: #6b7280; line-height: 2; padding-top: 20px; }

        /* Title bar */
        .lb-title-bar {
          background: #1f2937; color: #fff; text-align: center;
          padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
        }

        /* Meta row */
        .lb-meta {
          display: flex; gap: 32px; padding: 9px 24px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
          font-size: 12px; color: #6b7280; flex-wrap: wrap; min-height: 10px;
        }

        /* ── Table ── */
        .lb-table-wrap { overflow-x: auto; }

        table.lb-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          table-layout: fixed;
        }

        /* Column widths */
        .lb-table col.c0 { width: 9%;  } /* Employee ID */
        .lb-table col.c1 { width: 30%; } /* Employee Name */
        .lb-table col.c2 { width: 10%; } /* Annual */
        .lb-table col.c3 { width: 12%; } /* Compensatory */
        .lb-table col.c4 { width: 12%; } /* Compassionate */
        .lb-table col.c5 { width: 10%; } /* Floating */
        .lb-table col.c6 { width: 8%;  } /* Sick */
        .lb-table col.c7 { width: 9%;  } /* Total */

        .lb-table thead th {
          background: #1f2937; color: #fff; font-weight: 700;
          font-size: 10.5px; padding: 8px 6px; text-align: left; line-height: 1.25;
          white-space: normal; word-break: normal; overflow-wrap: normal; border-right: 1px solid rgba(255,255,255,0.12);
          user-select: none; cursor: pointer; vertical-align: bottom;
        }
        .lb-table thead th:last-child { border-right: none; }
        .lb-table thead th.num { text-align: right; }
        .lb-table thead th:hover { background: #111827; }
        .th-inner {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 4px; width: 100%;
        }
        .lb-table thead th.num .th-inner { flex-direction: row-reverse; }
        .th-inner > span:first-child { flex: 1; }

        /* Division group row */
        .lb-table tr.div-row td {
          background: #1f2937; color: #fff; font-weight: 700;
          font-size: 12px; padding: 5px 14px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          border-bottom: 1px solid rgba(255,255,255,0.08); cursor: pointer;
        }
        .lb-table tr.div-row:hover td { background: #111827; }

        /* Department group row */
        .lb-table tr.dept-row td {
          background: #e5e7eb; color: #1f2937; font-weight: 700;
          font-size: 12px; padding: 6px 14px 6px 24px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          border-bottom: 1px solid #d1d5db; cursor: pointer;
        }
        .lb-table tr.dept-row:hover td { background: #d1d5db; }

        /* Data rows */
        .lb-table tbody tr.data-row td {
          padding: 5px 10px; border-bottom: 1px solid #e5e7eb;
          color: #374151; vertical-align: middle; font-size: 11.5px;
          white-space: normal; word-wrap: break-word; line-height: 1.3;
        }
        .lb-table tbody tr.data-row:hover td { background: #f9fafb; }
        .lb-table td.num { text-align: right; font-variant-numeric: tabular-nums; }

        .lb-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

        /* Balance badge coloring */
        .balance-neg { color: #111827; font-weight: 700; text-decoration: underline; }
        .balance-pos { color: #374151; font-weight: 700; }

        /* Chevron */
        .chevron { display: inline-block; margin-right: 6px; font-size: 10px; transition: transform 0.15s; }
        .chevron.open { transform: rotate(90deg); }

        /* Print */
        @media print {
          @page { margin: 0; size: A4 portrait; }
          .lb-toolbar, .no-print { display: none !important; }
          .lb-report-root { background: white; height: auto; overflow: visible; }
          .lb-body        { overflow: visible; }
          .lb-report-area { padding: 0; overflow: visible; flex: none; }
          .lb-page        { border: none; border-radius: 0; box-shadow: none; }
          .lb-table tbody tr.data-row td { border-bottom: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb; }
          .print-logo-only { display: block !important; }
        }
        .print-logo-only { display: none; }
      `}</style>

      <div className="lb-report-root">
        {/* ── Toolbar ── */}
        <div className="lb-toolbar no-print">
          <div className="lb-toolbar-left">
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
              Leave Balance Report
            </span>
            {isFiltered && (
              <span style={{ fontSize: 11, background: '#f3f4f6', color: '#1f2937', borderRadius: 4, padding: '3px 9px', fontWeight: 600 }}>
                Filtered
              </span>
            )}
            <div className="lb-search-wrap">
              <span className="lb-search-icon">🔍</span>
              <input
                className="lb-search"
                placeholder="Search employee / division / dept…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="lb-toolbar-right">
            <button className="lb-btn lb-btn-ghost" onClick={handleCollapseAll}>
              {allCollapsed ? '⊞ Expand All' : '⊟ Collapse All'}
            </button>
            <button className={`lb-btn lb-btn-filter ${isFiltered ? 'active' : ''}`} onClick={() => setPanelOpen(true)}>
              {isFiltered && <span className="filter-dot" />}
              ⚙ Parameters
            </button>
            <button className="lb-btn lb-btn-ghost"   onClick={handlePrint}>🖨 Print</button>
            <button className="lb-btn lb-btn-success" onClick={handleExcel}>📊 Excel</button>
            <button className="lb-btn lb-btn-primary" onClick={handleDownloadPDF}>⬇ PDF</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="lb-body">
          <div className="lb-report-area">
            <div className="lb-page" ref={printRef}>

              {/* Report header */}
              <div className="lb-report-header">
                <img src={companyLogo} alt="Logo" className="print-logo-only" style={{ height: 54, width: 200, objectFit: 'fill' }} />
                <div className="lb-report-header-right">
                  <div><b style={{ color: '#374151' }}>Print Date:</b> {printDate}</div>
                  <div><b style={{ color: '#374151' }}>Print User:</b> {printUser}</div>
                </div>
              </div>

              <div className="lb-title-bar">Leave Balance Report</div>

              <div className="lb-meta">
                {isFiltered && (
                  <span>
                    <b>Filter:</b>{' '}
                    {[
                      ...Object.entries(applied).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`),
                      ...(search.trim() ? [`search: "${search.trim()}"`] : []),
                    ].join(' | ')}
                  </span>
                )}
              </div>

              {/* Table */}
              <div className="lb-table-wrap">
                {isLoading ? (
                  <div className="lb-empty">Loading data…</div>
                ) : divGroups.length === 0 ? (
                  <div className="lb-empty">No records found.</div>
                ) : (
                  <table className="lb-table">
                    <colgroup>
                      <col className="c0" /><col className="c1" /><col className="c2" />
                      <col className="c3" /><col className="c4" /><col className="c5" />
                      <col className="c6" /><col className="c7" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('EMPLOYEE_ID')}><span className="th-inner"><span>Emp ID</span><SortArrow col="EMPLOYEE_ID" sort={sort} /></span></th>
                        <th onClick={() => handleSort('RPT_NAME')}><span className="th-inner"><span>Employee Name</span><SortArrow col="RPT_NAME" sort={sort} /></span></th>
                        <th className="num" onClick={() => handleSort('ANNUAL_LEAVE')}><span className="th-inner"><span>Annual</span><SortArrow col="ANNUAL_LEAVE" sort={sort} /></span></th>
                        <th className="num" onClick={() => handleSort('COMPENSATORY_LEAVE')}><span className="th-inner"><span>Compensatory</span><SortArrow col="COMPENSATORY_LEAVE" sort={sort} /></span></th>
                        <th className="num" onClick={() => handleSort('COMPASSIONATE_LEAVE')}><span className="th-inner"><span>Compassionate</span><SortArrow col="COMPASSIONATE_LEAVE" sort={sort} /></span></th>
                        <th className="num" onClick={() => handleSort('FLOATING_LEAVE')}><span className="th-inner"><span>Floating</span><SortArrow col="FLOATING_LEAVE" sort={sort} /></span></th>
                        <th className="num" onClick={() => handleSort('SICK_LEAVE')}><span className="th-inner"><span>Sick</span><SortArrow col="SICK_LEAVE" sort={sort} /></span></th>
                        <th className="num" onClick={() => handleSort('TOTAL_LEAVES')}><span className="th-inner"><span>Total</span><SortArrow col="TOTAL_LEAVES" sort={sort} /></span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {divGroups.map(div => {
                        const divOpen = !collapsedDivs.has(div.divCode);
                        return (
                          <React.Fragment key={div.divCode}>
                            {/* Division header */}
                            <tr className="div-row" onClick={() => toggleDiv(div.divCode)}>
                              <td colSpan={8}>
                                <span className={`chevron ${divOpen ? 'open' : ''}`}>▶</span>
                                Division : {div.divName}
                              </td>
                            </tr>

                            {divOpen && div.departments.map(dept => {
                              const deptKey  = `${div.divCode}|||${dept.deptCode}`;
                              const deptOpen = !collapsedDepts.has(deptKey);
                              return (
                                <React.Fragment key={deptKey}>
                                  {/* Department row */}
                                  <tr className="dept-row" onClick={() => toggleDept(deptKey)}>
                                    <td colSpan={8}>
                                      <span className={`chevron ${deptOpen ? 'open' : ''}`}>▶</span>
                                      Department : {dept.deptName}
                                    </td>
                                  </tr>

                                  {/* Data rows (details level) */}
                                  {deptOpen && sortedRows(dept.rows).map((row, ri) => {
                                    const total = parseFloat(String(row.TOTAL_LEAVES)) || 0;
                                    return (
                                      <tr key={`${row.EMPLOYEE_ID}-${ri}`} className="data-row">
                                        <td>{row.EMPLOYEE_ID}</td>
                                        <td>{row.RPT_NAME}</td>
                                        <td className="num">{formatDays(parseFloat(String(row.ANNUAL_LEAVE)) || 0)}</td>
                                        <td className="num">{formatDays(parseFloat(String(row.COMPENSATORY_LEAVE)) || 0)}</td>
                                        <td className="num">{formatDays(parseFloat(String(row.COMPASSIONATE_LEAVE)) || 0)}</td>
                                        <td className="num">{formatDays(parseFloat(String(row.FLOATING_LEAVE)) || 0)}</td>
                                        <td className="num">{formatDays(parseFloat(String(row.SICK_LEAVE)) || 0)}</td>
                                        <td className={`num ${total < 0 ? 'balance-neg' : 'balance-pos'}`}>{formatDays(total)}</td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterPanel
        options={filterOptions}
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

export default LeaveBalanceReport;