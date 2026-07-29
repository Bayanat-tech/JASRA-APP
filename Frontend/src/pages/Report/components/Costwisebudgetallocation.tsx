import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Printer, ChevronDown, Check, BarChart2 } from 'lucide-react';
import WmsSerivceInstance from 'service/wms/service.wms';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import GroupedReportTable, {
  ColumnDef,
  GroupByConfig,
  formatAmount,
} from '../../../components/reports/GroupedReport';

// ── Props ──────────────────────────────────────────────────────────────────────
interface CostwiseBudgetAllocationProps {
  required_values: {
    divCode: string;
    companyCode?: string;
  };
}

// ── Row type ──────────────────────────────────────────────────────────────────
// Matches actual columns returned by VW_PROJECT_COST_BUDGET_ALLOCATION
// (per Toad screenshot): COMPANY_CODE, DIV_CODE, DIV_NAME, PROJECT_CODE,
// PROJECT_NAME, COST_CODE, COST_NAME, TOTAL_APPROVED_AMT.
type CostAllocationRow = {
  COMPANY_CODE?:        string;
  DIV_CODE?:            string;
  DIV_NAME?:            string;
  PROJECT_CODE?:        string;
  PROJECT_NAME?:        string;
  COST_CODE?:           string;
  COST_NAME?:           string;
  TOTAL_APPROVED_AMT?:  number;
};

// ── Division row type (from MS_HR_DIVISION) ──────────────────────────────────
type DivisionRow = {
  DIV_CODE: string;
  DIV_NAME: string;
};

// ── Column definitions ────────────────────────────────────────────────────────
const COSTWISE_COLUMNS: ColumnDef<CostAllocationRow>[] = [
  { key: 'COST_CODE',          label: 'Cost Code',          width: '15%', align: 'left' },
  { key: 'COST_NAME',          label: 'Cost Name',          width: '55%', align: 'left' },
  { key: 'TOTAL_APPROVED_AMT', label: 'Total Approved Amt', width: '30%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
];

const PROJECTWISE_COLUMNS: ColumnDef<CostAllocationRow>[] = [
  { key: 'PROJECT_CODE',       label: 'Project Code',       width: '20%', align: 'left' },
  { key: 'PROJECT_NAME',       label: 'Project Name',       width: '60%', align: 'left' },
  { key: 'TOTAL_APPROVED_AMT', label: 'Total Approved Amt', width: '20%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
];

// ── Grouping: Project only (matches screenshot) ───────────────────────────────
// Grouping: Division -> Project (used for both cost-wise and project-wise views)
const GROUP_BY_DIVISION_PROJECT: GroupByConfig<CostAllocationRow>[] = [
  { key: 'DIV_NAME',     label: 'Division', subKey: 'DIV_CODE' },
  { key: 'PROJECT_NAME', label: 'Project',  subKey: 'PROJECT_CODE' },
];

// ── Parameter form types / helpers ────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
}

interface Filters {
  division:     string[];
  project_name: string[];
}

const DEFAULT_FILTERS: Filters = {
  division:     ['All'],
  project_name: ['All'],
};

const uniqueOptions = (rows: CostAllocationRow[], key: keyof CostAllocationRow): Option[] =>
  Array.from(new Set(rows.map((r) => String(r[key] ?? '')).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ value: v, label: v }));

// Division options come from MS_HR_DIVISION (separate query), not from the
// budget view rows — this gives the full division master list rather than
// only divisions that happen to already have rows.
const divisionOptionsFromMaster = (rows: DivisionRow[]): Option[] =>
  rows
    .filter((r) => r.DIV_CODE)
    .sort((a, b) => a.DIV_CODE.localeCompare(b.DIV_CODE))
    .map((r) => ({ value: r.DIV_CODE, label: `${r.DIV_CODE} | ${r.DIV_NAME}` }));

// ── Shared field styling (matches BudgetStatusSummary) ────────────────────────

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: 2,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const BG = '#EEF5FD';

function FloatLabel({ label, required, children, bgColor = '#fff' }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  bgColor?: string;
}) {
  return (
    <div style={{ position: 'relative', marginTop: 6 }}>
      <span style={{
        position: 'absolute',
        top: -8,
        left: 10,
        fontSize: 11,
        color: '#6b7280',
        background: bgColor,
        padding: '0 4px',
        zIndex: 1,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 500,
      }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </span>
      {children}
    </div>
  );
}

// ── Select base styling ────────────────────────────────────────────────────────

const selectBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  fontSize: 12,
  color: '#111827',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  cursor: 'pointer',
};

// ── MultiSelectField (dropdown with checkboxes, "All" support) ──────────────

const MultiSelectField: React.FC<{
  label: string;
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
  loading?: boolean;
  placeholder?: string;
}> = ({ label, options, value, onChange, loading, placeholder }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAll = value.includes('All') || value.length === 0;

  const toggleAll = () => onChange(['All']);

  const toggleValue = (v: string) => {
    if (isAll) {
      onChange([v]);
      return;
    }
    if (value.includes(v)) {
      const next = value.filter((x) => x !== v);
      onChange(next.length ? next : ['All']);
    } else {
      onChange([...value, v]);
    }
  };

  const summaryText = isAll
    ? (placeholder ?? 'All')
    : value.length === 1
      ? (options.find((o) => o.value === value[0])?.label ?? value[0])
      : `${value.length} selected`;

  return (
    <div ref={rootRef} style={{ marginBottom: 14, position: 'relative' }}>
      {label && <label style={fieldLabelStyle}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{
          ...selectBaseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          color: '#111827',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading…' : summaryText}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, marginLeft: 6, color: '#6b7280' }} />
      </button>

      {open && !loading && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 50,
            maxHeight: 220,
            overflowY: 'auto',
            padding: 4,
          }}
        >
          <div
            onClick={toggleAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              fontSize: 12,
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 600,
              color: '#185FA5',
              background: isAll ? '#EEF5FD' : 'transparent',
            }}
          >
            <span style={{
              width: 14, height: 14, borderRadius: 3,
              border: '1px solid #185FA5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isAll ? '#185FA5' : '#fff',
            }}>
              {isAll && <Check size={10} color="#fff" />}
            </span>
            All
          </div>

          {options.map((opt) => {
            const checked = !isAll && value.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleValue(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  fontSize: 12,
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: '#374151',
                  background: checked ? '#EEF5FD' : 'transparent',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: 3,
                  border: '1px solid #d1d5db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: checked ? '#185FA5' : '#fff',
                  borderColor: checked ? '#185FA5' : '#d1d5db',
                  flexShrink: 0,
                }}>
                  {checked && <Check size={10} color="#fff" />}
                </span>
                {opt.label}
              </div>
            );
          })}

          {options.length === 0 && (
            <div style={{ padding: '10px 8px', fontSize: 12, color: '#9ca3af' }}>No options</div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const CostwiseBudgetAllocation: React.FC<CostwiseBudgetAllocationProps> = ({ required_values }) => {
  const { divCode, companyCode } = required_values;
  const { user } = useAuth();
  const printUser = user?.username;
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [pending, setPending] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);
  const [mode, setMode] = useState<'cost' | 'project'>('cost');

  const setPendingField = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setPending((prev) => ({ ...prev, [key]: val }));

  // ── Division master list (MS_HR_DIVISION) ─────────────────────────────────
  const { data: divisionRows = [], isLoading: isDivisionLoading } = useQuery<DivisionRow[]>({
    queryKey: ['ms_hr_division_all'],
    queryFn: async () => {
      const sql = `
        SELECT DIV_CODE, DIV_NAME
        FROM MS_HR_DIVISION
        WHERE DIV_CODE IS NOT NULL
        ORDER BY DIV_CODE
      `;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as DivisionRow[]) || [];
    },
  });

  const divisionOptions = useMemo(() => divisionOptionsFromMaster(divisionRows), [divisionRows]);

  // ── Data fetch (cost allocation rows) ──────────────────────────────────────
  const viewName = mode === 'project' ? 'VW_PROJECT_WISE_ALLOCATION' : 'VW_PROJECT_COST_BUDGET_ALLOCATION';
  const { data: allRows = [], isLoading } = useQuery<CostAllocationRow[]>({
    queryKey: ['project_cost_budget_allocation_all', mode, divCode, companyCode, viewName],
    queryFn: async () => {
      const staticConditions: string[] = [];
      if (divCode) staticConditions.push(`DIV_CODE = '${divCode.replace(/'/g, "''")}'`);
      if (companyCode) staticConditions.push(`COMPANY_CODE = '${companyCode.replace(/'/g, "''")}'`);
      const whereClause = staticConditions.length
        ? `WHERE ${staticConditions.join('\n    AND ')}`
        : '';

      const orderBy = mode === 'project' ? 'PROJECT_NAME' : 'PROJECT_NAME, COST_CODE';

      const sql = `
        SELECT *
        FROM ${viewName}
        ${whereClause}
        ORDER BY
          ${orderBy}
      `;
      console.log('BudgetAllocation: executing SQL for view', viewName);
      const response = await WmsSerivceInstance.executeRawSql(sql);
      console.log('BudgetAllocation: raw response length', Array.isArray(response) ? response.length : response);
      return (response as CostAllocationRow[]) || [];
    },
  });

  useEffect(() => {
    console.log('BudgetAllocation: fetched rows for', viewName, allRows?.length, allRows?.slice?.(0, 3));
  }, [allRows, viewName]);

  // ── Parameter dropdown options, derived from loaded rows ──────────────────
  const projectOptions = useMemo(() => {
    const selectedDivisions = pending.division;

    const rows =
      selectedDivisions.includes('All') || selectedDivisions.length === 0
        ? allRows
        : allRows.filter((r) => selectedDivisions.includes(r.DIV_CODE ?? ''));

    return uniqueOptions(rows, 'PROJECT_NAME');
  }, [allRows, pending.division]);

  // ── Apply the *applied* filters to build the rows the report will show ───
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      const inOrAll = (values: string[], rowVal: string | undefined) =>
        values.includes('All') || values.length === 0 || values.includes(rowVal ?? '');

      if (!inOrAll(applied.division, r.DIV_CODE)) return false;
      if (!inOrAll(applied.project_name, r.PROJECT_NAME)) return false;

      return true;
    });
  }, [allRows, applied]);

  const handleGenerateReport = () => {
    setApplied({ ...pending });
    setHasGeneratedReport(true);
    setActiveTab('report');
  };

  const handleReset = () => {
    setPending(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setHasGeneratedReport(false);
    setActiveTab('parameters');
  };

  // ── Excel export ───────────────────────────────────────────────────────────
  const handleExcel = async (filteredRows: CostAllocationRow[]) => {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    if (mode === 'project') {
      // Aggregate by project and write a simple project-wise summary
      const agg: Record<string, { projectCode?: string; projectName?: string; total: number }> = {};
      for (const r of filteredRows) {
        const key = `${r.PROJECT_CODE || ''}|||${r.PROJECT_NAME || ''}`;
        const amt = parseFloat(String(r.TOTAL_APPROVED_AMT)) || 0;
        if (!agg[key]) agg[key] = { projectCode: r.PROJECT_CODE, projectName: r.PROJECT_NAME, total: 0 };
        agg[key].total += amt;
      }
      const rows = Object.values(agg);
      const grandTotal = rows.reduce((s, x) => s + x.total, 0);

      const summaryData: any[][] = [
        ['Project Wise Budget Allocation'],
        [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
        [],
        ['Project Code', 'Project Name', 'Total Approved Amt'],
      ];
      rows.forEach((r) => summaryData.push([r.projectCode, r.projectName, r.total]));
      summaryData.push([]);
      summaryData.push(['', 'Grand Total', grandTotal]);

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      ws['!cols'] = [{ wch: 18 }, { wch: 50 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Project Allocation');
      XLSX.writeFile(wb, 'Projectwise_Budget_Allocation.xlsx');
      return;
    }

    // Default: cost-wise detailed export (existing behavior)
    type ProjMap = Record<string, {
      projectName?: string; projectCode?: string; rows: CostAllocationRow[]; total: number;
    }>;

    const projMap: ProjMap = {};
    for (const r of filteredRows) {
      const projKey = `${r.PROJECT_NAME || ''}|||${r.PROJECT_CODE || ''}`;
      const amount = parseFloat(String(r.TOTAL_APPROVED_AMT)) || 0;

      if (!projMap[projKey])
        projMap[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, rows: [], total: 0 };

      projMap[projKey].rows.push(r);
      projMap[projKey].total += amount;
    }

    const projects = Object.values(projMap);
    const grandTotal = projects.reduce((s, p) => s + p.total, 0);

    const summaryData: any[][] = [
      ['Budget Allocation'],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Cost Code', 'Cost Name', 'Total Approved Amt', 'Project'],
    ];

    projects.forEach((proj) => {
      proj.rows.forEach((row) => {
        const amount = parseFloat(String(row.TOTAL_APPROVED_AMT)) || 0;
        summaryData.push([
          row.COST_CODE,
          row.COST_NAME,
          amount,
          `${proj.projectCode} | ${proj.projectName}`,
        ]);
      });
      summaryData.push(['', `Total For ${proj.projectCode} | ${proj.projectName}`, proj.total, '']);
    });
    summaryData.push([]);
    summaryData.push(['', 'Grand Total', grandTotal, '']);

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 14 }, { wch: 34 }, { wch: 18 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Budget Allocation');

    XLSX.writeFile(wb, 'Costwise_Budget_Allocation.xlsx');
  };

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handlePDF = async (filteredRows: CostAllocationRow[]) => {
    const { jsPDF }              = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY      = [30, 58, 95]    as [number, number, number];
    const PTOT      = [213, 220, 232] as [number, number, number];
    const WHITE     = [255, 255, 255] as [number, number, number];
    const DARK      = [55,  65,  81]  as [number, number, number];
    const BORDER    = [209, 213, 219] as [number, number, number];

    const getBase64FromUrl = (url: string): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });

    let logoBase64 = '';
    try { logoBase64 = await getBase64FromUrl(companyLogo); } catch { /* skip */ }

    if (mode === 'project') {
      // Simple project-wise PDF: list projects with totals
      const agg: Record<string, { projectCode?: string; projectName?: string; total: number }> = {};
      for (const r of filteredRows) {
        const key = `${r.PROJECT_CODE || ''}|||${r.PROJECT_NAME || ''}`;
        const amt = parseFloat(String(r.TOTAL_APPROVED_AMT)) || 0;
        if (!agg[key]) agg[key] = { projectCode: r.PROJECT_CODE, projectName: r.PROJECT_NAME, total: 0 };
        agg[key].total += amt;
      }
      const rows = Object.values(agg);
      const grandTotal = rows.reduce((s, x) => s + x.total, 0);

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
        pdf.text('Project Wise Budget Allocation', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      };

      const body: any[] = [];
      rows.forEach((r) => {
        body.push([
          { content: r.projectCode || '', styles: { halign: 'left', fontSize: 9 } },
          { content: r.projectName || '', styles: { halign: 'left', fontSize: 9 } },
          { content: formatAmount(r.total), styles: { halign: 'right', fontSize: 9 } },
        ]);
      });

      // Grand total row
      body.push([
        { content: 'Grand Total', colSpan: 2, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      ]);

      autoTable(pdf, {
        startY: TABLE_TOP,
        margin: { left: margin, right: margin, top: HEADER_H + 4 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 110 }, 2: { cellWidth: 40 } },
        head: [[
          { content: 'Project Code', styles: { halign: 'left', fontSize: 10 } },
          { content: 'Project Name', styles: { halign: 'left', fontSize: 10 } },
          { content: 'Total Approved Amt', styles: { halign: 'right', fontSize: 10 } },
        ]],
        body,
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10 },
        didDrawPage: drawPageHeader,
        tableLineColor: BORDER,
      });

      pdf.save('Projectwise_Budget_Allocation.pdf');
      return;
    }

    // Default: cost-wise PDF (existing behavior)
    const projMap: Record<string, any> = {};
    for (const r of filteredRows) {
      const projKey = `${r.PROJECT_NAME || ''}|||${r.PROJECT_CODE || ''}`;
      const amount = parseFloat(String(r.TOTAL_APPROVED_AMT)) || 0;
      if (!projMap[projKey]) projMap[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, rows: [], total: 0 };
      projMap[projKey].rows.push(r);
      projMap[projKey].total += amount;
    }
    const projects = Object.values(projMap);
    const grandTotal = projects.reduce((s: number, p: any) => s + p.total, 0);

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
      pdf.text('Budget Allocation', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5, right: 5 };

    projects.forEach((proj: any) => {
      body.push([{ content: `Project :  ${proj.projectCode} | ${proj.projectName}`, colSpan: 3, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } }]);
      proj.rows.forEach((row: CostAllocationRow) => {
        const amount = parseFloat(String(row.TOTAL_APPROVED_AMT)) || 0;
        body.push([
          { content: row.COST_CODE || '',          styles: { fontSize: 8, halign: 'left' } },
          { content: row.COST_NAME || '',          styles: { fontSize: 8, halign: 'left' } },
          { content: formatAmount(amount),         styles: { halign: 'right', fontSize: 8 } },
        ]);
      });
      body.push([
        { content: `Total For ${proj.projectCode} | ${proj.projectName}`, colSpan: 2, styles: { fillColor: PTOT, textColor: DARK, fontStyle: 'bold', fontSize: 9, cellPadding: cellPad } },
        { content: formatAmount(proj.total), styles: { fillColor: PTOT, textColor: DARK, fontStyle: 'bold', halign: 'right', fontSize: 9 } },
      ]);
    });

    body.push([
      { content: 'Grand Total', colSpan: 2, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
    ]);

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 98 }, 2: { cellWidth: 42 } },
      head: [[
        { content: 'Cost Code',          styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Cost Name',          styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Total Approved Amt', styles: { halign: 'right', fontSize: 10 } },
      ]],
      body,
      headStyles:    { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
      bodyStyles:    { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'ellipsize', minCellHeight: 0 },
      alternateRowStyles: {},
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

    pdf.save('Costwise_Budget_Allocation.pdf');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f3f4f6', padding: '6px 10px', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .action-btn-primary:hover { background: #1e40af !important; }
        .action-btn-ghost:hover { background: #EBF4FF !important; border-color: #185FA5 !important; color: #185FA5 !important; }
        .field-row { background: #EEF5FD; border-radius: 8px; padding: 10px 12px; }

        /* Print fixes — scoped to this page only, does not touch GroupedReport.tsx */
        @media print {
          /* Hide this page's own tab bar (Parameters / Report Generated) —
             it lives outside GroupedReportTable so its internal .no-print rule
             never covered it. */
          .cwba-hide-print { display: none !important; }

          /* GroupedReportTable renders a wide 3-column table that clips on
             portrait A4. Force landscape + shrink the table's own print
             typography so the right-most (amount) column stays on the page.
             These class names (.grt-*) are global CSS from GroupedReport.tsx's
             injected <style>, so overriding them here for print only affects
             this page while it's mounted — GroupedReport.tsx itself is untouched. */
          @page { size: landscape; margin: 8mm; }
          .grt-table { font-size: 10px !important; }
          .grt-table thead th { padding: 6px 8px !important; font-size: 10.5px !important; }
          .grt-table tbody tr.data-row td { padding: 2px 6px !important; }
          .grt-table tr.group-row-0 td,
          .grt-table tr.group-row-1 td,
          .grt-table tr.group-row-2 td { padding: 3px 8px !important; }
          .grt-table tr.total-row-0 td,
          .grt-table tr.total-row-1 td,
          .grt-table tr.total-row-2 td { padding: 3px 8px !important; }
          .grt-report-header-right { font-size: 10px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Tab bar — always visible on screen. Report tab is only clickable once a
            report has actually been generated; until then it stays disabled.
            Marked cwba-hide-print so it doesn't leak into the printed report
            (see @media print rules above). */}
          <div className="cwba-hide-print" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10,
            padding: 5, marginBottom: 10,
          }}>
          <button
            onClick={() => setActiveTab('parameters')}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: activeTab === 'parameters' ? '#185FA5' : 'transparent',
              color: activeTab === 'parameters' ? '#fff' : '#374151',
              transition: 'background 0.15s',
            }}
          >
            ⚙ Parameters
          </button>
          <button
            onClick={() => hasGeneratedReport && setActiveTab('report')}
            disabled={!hasGeneratedReport}
            title={hasGeneratedReport ? undefined : 'Generate a report first'}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 7, border: 'none',
              cursor: hasGeneratedReport ? 'pointer' : 'not-allowed',
              fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: activeTab === 'report' ? '#185FA5' : 'transparent',
              color: !hasGeneratedReport ? '#9ca3af' : (activeTab === 'report' ? '#fff' : '#374151'),
              transition: 'background 0.15s',
            }}
          >
            <BarChart2 size={13} /> Report
            {hasGeneratedReport && (
              <span style={{
                fontSize: 9.5, background: activeTab === 'report' ? 'rgba(255,255,255,0.25)' : '#d1fae5',
                color: activeTab === 'report' ? '#fff' : '#065f46',
                padding: '1px 7px', borderRadius: 10, fontWeight: 600,
              }}>
                Generated
              </span>
            )}
          </button>
        </div>

        <div style={{
          display: activeTab === 'parameters' ? 'block' : 'none',
          background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '8px 12px',
          marginBottom: 12,
        }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Budget Allocation</span>
            {hasGeneratedReport && (
              <span style={{
                fontSize: 10, background: '#d1fae5', color: '#065f46',
                padding: '2px 10px', borderRadius: 12, fontWeight: 500,
              }}>
                Report Generated
              </span>
            )}
            {/* Debug info: show which view is queried and row counts */}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b7280' }}>
              <div>View: <strong>{viewName}</strong></div>
              <div>Total rows: <strong>{allRows?.length ?? 0}</strong></div>
              <div>Shown rows: <strong>{filteredRows?.length ?? 0}</strong></div>
            </div>
          </div>

          {/* Parameter form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="field-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <FloatLabel label="Division" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={divisionOptions}
                  value={pending.division}
                  onChange={(v) => {
                    setPending((prev) => ({
                      ...prev,
                      division: v,
                      project_name: ['All'],
                    }));
                  }}
                  loading={isDivisionLoading}
                />
              </FloatLabel>
              <FloatLabel label="Project" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={projectOptions}
                  value={pending.project_name}
                  onChange={(v) => setPendingField('project_name', v)}
                />
              </FloatLabel>
              <FloatLabel label="Mode" bgColor={BG}>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'cost' | 'project')}
                  style={{ ...selectBaseStyle, padding: '8px 10px' }}
                >
                  <option value="cost">Cost Wise</option>
                  <option value="project">Project Wise</option>
                </select>
              </FloatLabel>
            </div>
          </div>

          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #e5e7eb' }}>
            <button
              className="action-btn-ghost"
              onClick={handleReset}
              disabled={isLoading}
              style={{
                padding: '7px 16px', border: '0.5px solid #d1d5db', background: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                gap: 6, fontSize: 12, borderRadius: 6, color: '#374151', opacity: isLoading ? 0.6 : 1,
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>

            <button
              className="action-btn-primary"
              onClick={handleGenerateReport}
              disabled={isLoading}
              style={{
                padding: '7px 16px', border: '0.5px solid #185FA5', background: isLoading ? '#94a3b8' : '#185FA5',
                cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                gap: 6, fontSize: 12, borderRadius: 6, color: '#fff', transition: 'background 0.2s',
              }}
            >
              <Printer size={13} /> {isLoading ? 'Loading data…' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report only appears after Generate Report is clicked, and only while the Report tab is active */}
        {hasGeneratedReport && activeTab === 'report' && (
          <GroupedReportTable<CostAllocationRow>
            title="Budget Allocation"
            rows={filteredRows}
            isLoading={isLoading}
            columns={mode === 'cost' ? COSTWISE_COLUMNS : PROJECTWISE_COLUMNS}
            groupBy={GROUP_BY_DIVISION_PROJECT}
            amountKey="TOTAL_APPROVED_AMT"
            filterDefs={[]}
            searchKeys={mode === 'cost' ? ['PROJECT_NAME', 'COST_NAME', 'COST_CODE'] : ['PROJECT_NAME', 'PROJECT_CODE']}
            logo={companyLogo}
            printUser={printUser}
            onExcel={handleExcel}
            onPDF={handlePDF}
          />
        )}
      </div>
    </div>
  );
};

export default CostwiseBudgetAllocation;