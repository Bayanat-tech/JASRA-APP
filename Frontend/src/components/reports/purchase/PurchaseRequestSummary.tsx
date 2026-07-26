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
  formatDate,
} from '../../../components/reports/GroupedReport';

// ── Row type ──────────────────────────────────────────────────────────────────
type PRRow = {
  REQUEST_NUMBER: string;
  HEADER_AMOUNT:  number;
  PROJECT_NAME:   string;
  PROJECT_CODE:   string;
  REQUEST_DATE:   string;
  STATUS:         string;
  TYPE_OF_PR:     string;
  DIV_CODE:       string;
  DIV_NAME:       string;
  CREATED_BY:     string;
};

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS: ColumnDef<PRRow>[] = [
  { key: 'REQUEST_NUMBER', label: 'Request No',  width: '22%', mono: true },
  { key: 'REQUEST_DATE',   label: 'Request Date', width: '13%', format: (v) => formatDate(v) },
  { key: 'CREATED_BY',     label: 'Create User',  width: '17%' },
  {
    key: 'HEADER_AMOUNT', label: 'Amount', width: '14%', align: 'right',
    format: (v) => formatAmount(parseFloat(String(v)) || 0),
  },
  { key: 'TYPE_OF_PR', label: 'Type of PR', width: '34%' },
];

// ── Grouping: Division → Project → Status ────────────────────────────────────
const GROUP_BY: GroupByConfig<PRRow>[] = [
  { key: 'DIV_NAME',     label: 'Division',        subKey: 'DIV_CODE'     },
  { key: 'PROJECT_NAME', label: 'Project',         subKey: 'PROJECT_CODE' },
  { key: 'STATUS',       label: 'Project Status'                          },
];

// ── Parameter form types / helpers ────────────────────────────────────────────

interface Option {
  value: string;
  label: string;
}

interface Filters {
  request_date_from: string;
  request_date_to:   string;
  type_of_pr:        string[];
  status:             string[];
  project_name:       string[];
  div_name:           string[];
}

const DEFAULT_FILTERS: Filters = {
  request_date_from: '',
  request_date_to:   '',
  type_of_pr:  ['All'],
  status:       ['All'],
  project_name: ['All'],
  div_name:     ['All'],
};

const uniqueOptions = (rows: PRRow[], key: keyof PRRow): Option[] =>
  Array.from(new Set(rows.map((r) => String(r[key] ?? '')).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ value: v, label: v }));

const parseDateNum = (d: string): number => {
  if (!d) return 0;
  return new Date(d).getTime() || 0;
};

// ── Shared field styling (matches StockDetailReport) ─────────────────────────

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

// ── Select (plain native <select>, styled) ───────────────────────────────────

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

const DateField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={fieldLabelStyle}>{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '7px 10px',
        fontSize: 12,
        border: '1px solid #d1d5db',
        borderRadius: 6,
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const PurchaseRequestSummary: React.FC = () => {
  const { user } = useAuth();
  const printUser = user?.username;
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [pending, setPending] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

  const setPendingField = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setPending((prev) => ({ ...prev, [key]: val }));

  // ── Data fetch (unchanged) ────────────────────────────────────────────────
  const { data: allRows = [], isLoading } = useQuery<PRRow[]>({
    queryKey: ['pr_register_all'],
    queryFn: async () => {
      const sql = `
        SELECT DISTINCT
          r.request_number, r.header_amount, r.project_name, r.project_code,
          r.request_date, r.status, r.type_of_pr, r.div_code,
          COALESCE(d.div_name, r.div_code, 'Unassigned') AS div_name,
          r.created_by
        FROM VW_BO_PR_REGISTER r
        LEFT JOIN MS_HR_DIVISION_JASRA d ON r.div_code = d.div_code
      `;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as PRRow[]) || [];
    },
  });

  // ── Parameter dropdown options, derived from loaded rows ──────────────────
  const typeOptions    = useMemo(() => uniqueOptions(allRows, 'TYPE_OF_PR'),   [allRows]);
  const statusOptions  = useMemo(() => uniqueOptions(allRows, 'STATUS'),       [allRows]);
  const projectOptions = useMemo(() => uniqueOptions(allRows, 'PROJECT_NAME'), [allRows]);
  const divOptions     = useMemo(() => uniqueOptions(allRows, 'DIV_NAME'),     [allRows]);

  // ── Apply the *applied* filters to build the rows the report will show ───
  const filteredRows = useMemo(() => {
    return allRows.filter((r) => {
      const inOrAll = (values: string[], rowVal: string) =>
        values.includes('All') || values.length === 0 || values.includes(rowVal);

      if (!inOrAll(applied.type_of_pr, r.TYPE_OF_PR)) return false;
      if (!inOrAll(applied.status, r.STATUS)) return false;
      if (!inOrAll(applied.project_name, r.PROJECT_NAME)) return false;
      if (!inOrAll(applied.div_name, r.DIV_NAME)) return false;

      const rowDate = parseDateNum(r.REQUEST_DATE);
      if (applied.request_date_from && rowDate < new Date(applied.request_date_from).getTime()) return false;
      if (applied.request_date_to && rowDate > new Date(applied.request_date_to).getTime() + 86399999) return false;

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

  // ── Excel export (unchanged — keeps per-division sheets) ─────────────────
  const handleExcel = async (filteredRows: PRRow[]) => {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    type DivMap = Record<string, {
      divName: string; divCode: string; total: number;
      projects: Record<string, {
        projectName: string; projectCode: string; total: number;
        statuses: Record<string, { status: string; rows: PRRow[]; total: number }>;
      }>;
    }>;

    const divMap: DivMap = {};
    for (const r of filteredRows) {
      const divKey  = r.DIV_NAME || 'Unassigned';
      const projKey = `${r.PROJECT_NAME}|||${r.PROJECT_CODE}`;
      const statKey = r.STATUS;
      const amount  = parseFloat(String(r.HEADER_AMOUNT)) || 0;

      if (!divMap[divKey])
        divMap[divKey] = { divName: divKey, divCode: r.DIV_CODE, projects: {}, total: 0 };
      if (!divMap[divKey].projects[projKey])
        divMap[divKey].projects[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, statuses: {}, total: 0 };
      if (!divMap[divKey].projects[projKey].statuses[statKey])
        divMap[divKey].projects[projKey].statuses[statKey] = { status: r.STATUS, rows: [], total: 0 };

      divMap[divKey].projects[projKey].statuses[statKey].rows.push(r);
      divMap[divKey].projects[projKey].statuses[statKey].total += amount;
      divMap[divKey].projects[projKey].total                   += amount;
      divMap[divKey].total                                     += amount;
    }

    const divisions = Object.values(divMap).map((div: any) => ({
      ...div,
      projects: Object.values(div.projects).map((proj: any) => ({
        ...proj,
        statuses: Object.values(proj.statuses),
      })),
    }));

    const grandTotal = divisions.reduce((s: number, d: any) => s + d.total, 0);

    const summaryData: any[][] = [
      ['Purchase Request Register — Summary'],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Request No', 'Request Date', 'Create User', 'Amount', 'Type of PR', 'Project', 'Project Code', 'Status', 'Division'],
    ];

    divisions.forEach((div: any) => {
      div.projects.forEach((proj: any) => {
        proj.statuses.forEach((sg: any) => {
          sg.rows.forEach((row: PRRow) => {
            summaryData.push([
              row.REQUEST_NUMBER,
              formatDate(row.REQUEST_DATE),
              row.CREATED_BY,
              parseFloat(String(row.HEADER_AMOUNT)) || 0,
              row.TYPE_OF_PR,
              proj.projectName,
              proj.projectCode,
              sg.status,
              div.divName,
            ]);
          });
          summaryData.push(['', '', `Status Total: ${sg.status}`, sg.total, '', '', '', '', '']);
        });
        summaryData.push(['', '', `Project Total: ${proj.projectName}`, proj.total, '', '', '', '', '']);
      });
      summaryData.push(['', '', `Division Total: ${div.divName}`, div.total, '', '', '', '', '']);
    });
    summaryData.push([]);
    summaryData.push(['', '', 'Grand Total', grandTotal, '', '', '', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws, 'PR Summary');

    divisions.forEach((div: any) => {
      const sheetData: any[][] = [
        [`Division: ${div.divName}`],
        ['Request No', 'Request Date', 'Create User', 'Amount', 'Type of PR', 'Project', 'Status'],
      ];
      div.projects.forEach((proj: any) => {
        proj.statuses.forEach((sg: any) => {
          sg.rows.forEach((row: PRRow) => {
            sheetData.push([
              row.REQUEST_NUMBER,
              formatDate(row.REQUEST_DATE),
              row.CREATED_BY,
              parseFloat(String(row.HEADER_AMOUNT)) || 0,
              row.TYPE_OF_PR,
              proj.projectName,
              sg.status,
            ]);
          });
        });
      });
      sheetData.push(['', '', 'Division Total', div.total]);
      const divWs = XLSX.utils.aoa_to_sheet(sheetData);
      divWs['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 30 }, { wch: 14 }];
      const safeName = div.divName.replace(/[:\\/?*[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, divWs, safeName);
    });

    XLSX.writeFile(wb, 'PR_Register_Summary.xlsx');
  };

  // ── PDF export (unchanged) ────────────────────────────────────────────────
  const handlePDF = async (filteredRows: PRRow[]) => {
    const { jsPDF }               = await import('jspdf');
    const { default: autoTable }  = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY      = [30, 58, 95]    as [number, number, number];
    const PROJ      = [232, 236, 242] as [number, number, number];
    const STAT      = [241, 244, 248] as [number, number, number];
    const DTOT      = [213, 220, 232] as [number, number, number];
    const WHITE     = [255, 255, 255] as [number, number, number];
    const DARK      = [55,  65,  81]  as [number, number, number];
    const NAVY_TEXT = [30,  58,  95]  as [number, number, number];
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

    const divMap: Record<string, any> = {};
    for (const r of filteredRows) {
      const divKey  = r.DIV_NAME || 'Unassigned';
      const projKey = `${r.PROJECT_NAME}|||${r.PROJECT_CODE}`;
      const statKey = r.STATUS;
      const amount  = parseFloat(String(r.HEADER_AMOUNT)) || 0;
      if (!divMap[divKey])
        divMap[divKey] = { divName: divKey, projects: {}, total: 0 };
      if (!divMap[divKey].projects[projKey])
        divMap[divKey].projects[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, statuses: {}, total: 0 };
      if (!divMap[divKey].projects[projKey].statuses[statKey])
        divMap[divKey].projects[projKey].statuses[statKey] = { status: r.STATUS, rows: [], total: 0 };
      divMap[divKey].projects[projKey].statuses[statKey].rows.push(r);
      divMap[divKey].projects[projKey].statuses[statKey].total += amount;
      divMap[divKey].projects[projKey].total                   += amount;
      divMap[divKey].total                                     += amount;
    }
    const divisions = Object.values(divMap).map((div: any) => ({
      ...div,
      projects: Object.values(div.projects).map((proj: any) => ({
        ...proj, statuses: Object.values(proj.statuses),
      })),
    }));
    const grandTotal = divisions.reduce((s: number, d: any) => s + d.total, 0);

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
      pdf.text('Purchase Request Register (Summary)', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5,  right: 5 };
    const indPad1 = { top: 3,   bottom: 3,   left: 12, right: 5 };
    const indPad2 = { top: 2.5, bottom: 2.5, left: 20, right: 5 };

    divisions.forEach((div: any) => {
      body.push([{ content: `Division :  ${div.divName}`, colSpan: 5, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } }]);
      div.projects.forEach((proj: any) => {
        body.push([{ content: `Project :  ${proj.projectName}   |   ${proj.projectCode}`, colSpan: 5, styles: { fillColor: PROJ, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } }]);
        proj.statuses.forEach((sg: any) => {
          body.push([{ content: `Project Status :  ${sg.status}`, colSpan: 5, styles: { fillColor: STAT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 } }]);
          sg.rows.forEach((row: PRRow) => {
            body.push([
              { content: row.REQUEST_NUMBER,                                       styles: { font: 'courier', fontSize: 8 } },
              { content: formatDate(row.REQUEST_DATE),                             styles: { fontSize: 8 } },
              { content: row.CREATED_BY,                                           styles: { fontSize: 8 } },
              { content: formatAmount(parseFloat(String(row.HEADER_AMOUNT)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: row.TYPE_OF_PR,                                           styles: { fontSize: 8 } },
            ]);
          });
          body.push([
            { content: `Status Total :  ${sg.status}`, colSpan: 3, styles: { fillColor: STAT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 } },
            { content: formatAmount(sg.total),          styles: { fillColor: STAT, textColor: DARK, fontStyle: 'bold', halign: 'right', fontSize: 8.5 } },
            { content: '',                              styles: { fillColor: STAT } },
          ]);
        });
        body.push([
          { content: `Project Total For :  ${proj.projectName}`, colSpan: 3, styles: { fillColor: PROJ, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } },
          { content: formatAmount(proj.total),                    styles: { fillColor: PROJ, textColor: NAVY_TEXT, fontStyle: 'bold', halign: 'right', fontSize: 9 } },
          { content: '',                                          styles: { fillColor: PROJ } },
        ]);
      });
      body.push([
        { content: `Division Total :  ${div.divName}`, colSpan: 3, styles: { fillColor: DTOT, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } },
        { content: formatAmount(div.total),             styles: { fillColor: DTOT, textColor: NAVY_TEXT, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        { content: '',                                  styles: { fillColor: DTOT } },
      ]);
    });

    body.push([
      { content: 'Grand Total :', colSpan: 3, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: formatAmount(grandTotal),    styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: '',                          styles: { fillColor: NAVY } },
    ]);

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: 32 }, 2: { cellWidth: 34 }, 3: { cellWidth: 30 }, 4: { cellWidth: 40 } },
      head: [[
        { content: 'Request No',   styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Request Date', styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Create User',  styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Amount',       styles: { halign: 'right', fontSize: 10 } },
        { content: 'Type of PR',   styles: { halign: 'left',  fontSize: 10 } },
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

    pdf.save('PR_Register_Summary.pdf');
  };

  const row2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f3f4f6', padding: '6px 10px', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .action-btn-primary:hover { background: #1e40af !important; }
        .action-btn-ghost:hover { background: #EBF4FF !important; border-color: #185FA5 !important; color: #185FA5 !important; }
        .field-row { background: #EEF5FD; border-radius: 8px; padding: 10px 12px; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* Tab bar — always visible. Report tab is only clickable once a
            report has actually been generated; until then it stays disabled. */}
        <div style={{
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Purchase Request Register — Summary</span>
            {hasGeneratedReport && (
              <span style={{
                fontSize: 10, background: '#d1fae5', color: '#065f46',
                padding: '2px 10px', borderRadius: 12, fontWeight: 500,
              }}>
                Report Generated
              </span>
            )}
          </div>

          {/* Parameter form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="field-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <FloatLabel label="Division" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={divOptions}
                  value={pending.div_name}
                  onChange={(v) => setPendingField('div_name', v)}
                />
              </FloatLabel>
              <FloatLabel label="Project Name" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={projectOptions}
                  value={pending.project_name}
                  onChange={(v) => setPendingField('project_name', v)}
                />
              </FloatLabel>
            </div>

            <div className="field-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <FloatLabel label="PR Type" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={typeOptions}
                  value={pending.type_of_pr}
                  onChange={(v) => setPendingField('type_of_pr', v)}
                />
              </FloatLabel>
              <FloatLabel label="Status" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={statusOptions}
                  value={pending.status}
                  onChange={(v) => setPendingField('status', v)}
                />
              </FloatLabel>
            </div>

            <div className="field-row">
              <fieldset style={{ border: '0.5px solid #BFDBFE', borderRadius: 6, padding: '6px 12px 10px', margin: 0, background: 'transparent' }}>
                <legend style={{ fontSize: 10, color: '#6b7280', padding: '0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                  Request Date Range
                </legend>
                <div style={row2}>
                  <DateField
                    label="From"
                    value={pending.request_date_from}
                    onChange={(v) => setPendingField('request_date_from', v)}
                  />
                  <DateField
                    label="To"
                    value={pending.request_date_to}
                    onChange={(v) => setPendingField('request_date_to', v)}
                  />
                </div>
              </fieldset>
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
          <GroupedReportTable<PRRow>
            title="Purchase Request Register — Summary"
            rows={filteredRows}
            isLoading={isLoading}
            columns={COLUMNS}
            groupBy={GROUP_BY}
            amountKey="HEADER_AMOUNT"
            filterDefs={[]}
            searchKeys={['REQUEST_NUMBER', 'CREATED_BY']}
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

export default PurchaseRequestSummary;