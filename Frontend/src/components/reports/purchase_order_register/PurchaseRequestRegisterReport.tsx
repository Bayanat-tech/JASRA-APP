import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import axiosServices from 'utils/axios';
import { ReportPage } from './common/ReportPage';
import { ReportParameterForm, ParamFieldConfig } from './common/ReportParameterForm';
import {
  formatAmount, formatQty, formatDate, formatFilterValue,
  isFiltersActive, ReportFilters,
} from './common/reportHelpers';

type ViewType = 'detail' | 'summary';

// ─────────────────────────────────────────────────────────────────────────
// Like PurchaseOrderSummaryReport.tsx, PR has no dedicated /api/report/*
// endpoint — every query (report rows + parameter dropdown options) goes
// through the generic raw-SQL executor.
//
// ⚠️ Adjust RAW_SQL_ENDPOINT if PR uses a different mount than PO does.
// ⚠️ Adjust the company-code column/value below if it isn't `company_code`.
// ─────────────────────────────────────────────────────────────────────────
const RAW_SQL_ENDPOINT = '/api/wms/inbound/executeRawSql';

async function runRawSql<T = any>(raw_sql: string): Promise<T[]> {
  const res = await axiosServices.post(RAW_SQL_ENDPOINT, { raw_sql });
  return (res.data?.data ?? []) as T[];
}

function sqlStr(v: any): string {
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlNum(v: any): string {
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(n) : '0';
}

// ── Row type — one row per PR line item (mirrors your VW_BO_PR_REGISTER
//    SELECT). Trimmed to what the report actually displays/groups by; add
//    more columns from your original query here if you need them. ────────
type PRRow = {
  REQUEST_NUMBER: string;
  REQUEST_DATE: string;
  DIV_CODE: string;
  DIV_NAME: string;
  PROJECT_NAME: string;
  PROJECT_CODE: string;
  STATUS: string;
  TYPE_OF_PR: string;
  ITEM_CODE: string;
  ITEM_DESP: string;
  ADDL_ITEM_DESC: string;
  P_UOM: string;
  ITEM_P_QTY: number;
  L_UOM: string;
  ITEM_L_QTY: number;
  ITEM_RATE: number;
  AMOUNT: number;
  HEADER_AMOUNT: number;
  CURR_CODE: string;
  CURRENCY_RATE: number;
  SUPPLIER: string;
  DESCRIPTION: string;
  CREATED_BY: string;
  ITEM_SEQUENCE_NO: number;
};

// ── Detail grouping: Request Number > line items ────────────────────────
type RequestGroup = {
  requestNumber: string; requestDate: string; status: string; typeOfPr: string;
  divName: string; projectName: string; items: PRRow[]; total: number;
};

function groupRows(rows: PRRow[]): RequestGroup[] {
  const map: Record<string, RequestGroup> = {};
  for (const r of rows) {
    const key = r.REQUEST_NUMBER;
    const amount = parseFloat(String(r.AMOUNT)) || 0;
    if (!map[key]) {
      map[key] = {
        requestNumber: r.REQUEST_NUMBER, requestDate: r.REQUEST_DATE, status: r.STATUS,
        typeOfPr: r.TYPE_OF_PR, divName: r.DIV_NAME, projectName: r.PROJECT_NAME,
        items: [], total: 0,
      };
    }
    map[key].items.push(r);
    map[key].total += amount;
  }
  return Object.values(map);
}

// ── Summary grouping (Division > Project > Status), derived from the SAME
//    detail rows: collapse to one row per request using HEADER_AMOUNT
//    (already a header-level total, so we take it once, not SUM(amount)). ─
type SummaryRow = {
  requestNumber: string; requestDate: string; divName: string; divCode: string;
  projectName: string; projectCode: string; status: string; typeOfPr: string;
  createdBy: string; total: number;
};
type StatusGroup = { status: string; rows: SummaryRow[]; total: number };
type ProjectGroup = { projectName: string; projectCode: string; statuses: StatusGroup[]; total: number };
type DivisionGroup = { divName: string; divCode: string; projects: ProjectGroup[]; total: number };

function buildSummaryFromDetail(rows: PRRow[]): DivisionGroup[] {
  const reqMap: Record<string, SummaryRow> = {};
  for (const r of rows) {
    if (!reqMap[r.REQUEST_NUMBER]) {
      reqMap[r.REQUEST_NUMBER] = {
        requestNumber: r.REQUEST_NUMBER, requestDate: r.REQUEST_DATE,
        divName: r.DIV_NAME || 'Unassigned', divCode: r.DIV_CODE || '',
        projectName: r.PROJECT_NAME || 'N/A', projectCode: r.PROJECT_CODE || '',
        status: r.STATUS || 'N/A', typeOfPr: r.TYPE_OF_PR || '',
        createdBy: r.CREATED_BY || '', total: parseFloat(String(r.HEADER_AMOUNT)) || 0,
      };
    }
  }

  const divMap: Record<string, any> = {};
  Object.values(reqMap).forEach((req) => {
    if (!divMap[req.divName]) divMap[req.divName] = { divName: req.divName, divCode: req.divCode, projects: {}, total: 0 };
    const div = divMap[req.divName];
    if (!div.projects[req.projectName])
      div.projects[req.projectName] = { projectName: req.projectName, projectCode: req.projectCode, statuses: {}, total: 0 };
    const proj = div.projects[req.projectName];
    if (!proj.statuses[req.status]) proj.statuses[req.status] = { status: req.status, rows: [], total: 0 };
    const st = proj.statuses[req.status];

    st.rows.push(req); st.total += req.total;
    proj.total += req.total; div.total += req.total;
  });

  return Object.values(divMap).map((div: any) => ({
    ...div,
    projects: Object.values(div.projects).map((p: any) => ({ ...p, statuses: Object.values(p.statuses) })),
  }));
}

// ── Base SQL — item-level, from your VW_BO_PR_REGISTER query ────────────
const BASE_SELECT = `SELECT
    r.request_number,
    r.request_date,
    r.div_code,
    r.div_name,
    r.project_name,
    r.project_code,
    r.status,
    r.type_of_pr,
    r.item_code,
    r.item_desp,
    r.addl_item_desc,
    r.p_uom,
    r.item_p_qty,
    r.l_uom,
    r.item_l_qty,
    r.item_rate,
    r.amount,
    r.header_amount,
    r.curr_code,
    r.currency_rate,
    r.supplier,
    r.description,
    r.created_by,
    r.item_sequence_no
FROM VW_BO_PR_REGISTER r`;

/** Shared WHERE-clause builder — mirrors PurchaseOrderSummaryReport's pattern.
 * `excludeKey` lets a field's own dropdown query skip filtering on itself. */
function buildFilterClauses(filters: ReportFilters, excludeKey?: string): string[] {
  const clauses: string[] = [];
  const divName = (filters.div_name as string[]) || [];
  const requestNumber = (filters.request_number as string[]) || [];
  const projectName = (filters.project_name as string[]) || [];
  const status = (filters.status as string[]) || [];
  const typeOfPr = (filters.type_of_pr as string[]) || [];

  if (excludeKey !== 'div_name' && divName.length) clauses.push(`r.div_name IN (${divName.map(sqlStr).join(', ')})`);
  if (excludeKey !== 'request_number' && requestNumber.length) clauses.push(`r.request_number IN (${requestNumber.map(sqlStr).join(', ')})`);
  if (excludeKey !== 'project_name' && projectName.length) clauses.push(`r.project_name IN (${projectName.map(sqlStr).join(', ')})`);
  if (excludeKey !== 'status' && status.length) clauses.push(`r.status IN (${status.map(sqlStr).join(', ')})`);
  if (excludeKey !== 'type_of_pr' && typeOfPr.length) clauses.push(`r.type_of_pr IN (${typeOfPr.map(sqlStr).join(', ')})`);
  if (excludeKey !== 'amount_from' && filters.amount_from) clauses.push(`r.header_amount >= ${sqlNum(filters.amount_from)}`);
  if (excludeKey !== 'amount_to' && filters.amount_to) clauses.push(`r.header_amount <= ${sqlNum(filters.amount_to)}`);
  if (excludeKey !== 'date_from' && filters.date_from) clauses.push(`r.request_date >= TO_DATE(${sqlStr(filters.date_from)}, 'YYYY-MM-DD')`);
  if (excludeKey !== 'date_to' && filters.date_to) clauses.push(`r.request_date <= TO_DATE(${sqlStr(filters.date_to)}, 'YYYY-MM-DD')`);

  return clauses;
}

function buildDetailQuery(filters: ReportFilters, companyCode?: string) {
  const where: string[] = [
    `r.company_code = ${sqlStr(companyCode || 'JASRA')}`,
    ...buildFilterClauses(filters),
  ];
  return `${BASE_SELECT}\nWHERE ${where.join('\n  AND ')}\nORDER BY r.request_number, r.item_sequence_no`;
}

// ── Parameter dropdown options: DISTINCT off the view, scoped by company
//    AND every other currently-selected filter. ─────────────────────────
function getDistinctOptions(column: string, filterKey: string) {
  return async (filters: ReportFilters, companyCode?: string): Promise<string[]> => {
    const where = [
      `r.company_code = ${sqlStr(companyCode || 'JASRA')}`,
      `r.${column} IS NOT NULL`,
      ...buildFilterClauses(filters, filterKey),
    ];
    const sql = `SELECT DISTINCT r.${column} AS value
FROM VW_BO_PR_REGISTER r
WHERE ${where.join('\n  AND ')}
ORDER BY r.${column}`;

    const rows = await runRawSql<any>(sql);
    return rows.map((r) => String(r.VALUE ?? r.value ?? '').trim()).filter(Boolean);
  };
}

const prReportFields: ParamFieldConfig[][] = [
  [
    { type: 'multiselect', key: 'div_name', label: 'Division', fetchOptions: getDistinctOptions('div_name', 'div_name'), placeholder: 'All Divisions' },
    { type: 'multiselect', key: 'request_number', label: 'Request No', fetchOptions: getDistinctOptions('request_number', 'request_number'), placeholder: 'Request No' },
    { type: 'multiselect', key: 'project_name', label: 'Project Name', fetchOptions: getDistinctOptions('project_name', 'project_name'), placeholder: 'All Projects' },
  ],
  [
    { type: 'date', key: 'date_from', label: 'Request Date From' },
    { type: 'date', key: 'date_to', label: 'Request Date To' },
  ],
  [
    { type: 'number', key: 'amount_from', label: 'Amount From', placeholder: '0' },
    { type: 'number', key: 'amount_to', label: 'Amount To', placeholder: 'No limit' },
  ],
  [
    { type: 'multiselect', key: 'type_of_pr', label: 'PR Type', fetchOptions: getDistinctOptions('type_of_pr', 'type_of_pr'), placeholder: 'All Types' },
    { type: 'multiselect', key: 'status', label: 'Status', fetchOptions: getDistinctOptions('status', 'status'), placeholder: 'All Statuses' },
  ],
];

const EMPTY_FILTERS: ReportFilters = {
  div_name: [], request_number: [], project_name: [], status: [], type_of_pr: [],
  amount_from: '', amount_to: '', date_from: '', date_to: '',
};

const paramLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em',
};

// ── CSS: detail table (pr-*) + summary table (prs-*) — only one renders
//    at a time so the class names can coexist safely. ──────────────────
const TABLE_CSS = `
  .pr-print-logo-row td, .prs-print-logo-row td { padding: 10px 24px; }
  .pr-print-logo-flex, .prs-print-logo-flex { display: flex; justify-content: space-between; align-items: center; }
  .pr-print-logo-flex img, .prs-print-logo-flex img { height: 44px; width: auto; object-fit: contain; }
  .pr-print-meta-text, .prs-print-meta-text { text-align: right; font-size: 11px; color: #6b7280; line-height: 1.8; }
  .pr-title-bar td, .prs-title-bar td { background: #1e3a5f; color: #fff; text-align: center; padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }
  .pr-meta-row td, .prs-meta-row td { padding: 9px 24px; background: #f9fafb; font-size: 12px; color: #6b7280; }

  table.pr-table, table.prs-table { width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed; }
  .pr-table col.c0 { width: 26%; } .pr-table col.c1 { width: 8%; } .pr-table col.c2 { width: 9%; }
  .pr-table col.c3 { width: 8%; } .pr-table col.c4 { width: 9%; } .pr-table col.c5 { width: 11%; }
  .pr-table col.c6 { width: 13%; } .pr-table col.c7 { width: 8%; } .pr-table col.c8 { width: 8%; }
  .prs-table col.c0 { width: 22%; } .prs-table col.c1 { width: 15%; } .prs-table col.c2 { width: 20%; }
  .prs-table col.c3 { width: 28%; } .prs-table col.c4 { width: 15%; }

  .pr-table th, .pr-table td, .prs-table th, .prs-table td { border: 1px solid #9d9db3; padding: 7px 10px; vertical-align: top; }
  .pr-table thead th, .prs-table thead th { background: #d9d6e8; color: #1f1f2e; font-weight: 700; font-size: 12.5px; text-align: center; white-space: nowrap; }
  .pr-table thead th { cursor: pointer; user-select: none; }
  .pr-table thead th:hover { background: #cbc7e0; }
  .pr-table thead th.num, .prs-table thead th.num { text-align: right; }
  .pr-table thead th.left, .prs-table thead th.left { text-align: left; padding-left: 12px; }

  .pr-table tr.pr-banner td { background: #1e3a5f; color: #fff; font-weight: 700; font-size: 12.5px; padding: 8px 10px; }
  .pr-table tr.data-row td, .prs-table tr.data-row td { background: #fff; color: #1f1f2e; vertical-align: top; line-height: 1.55; }
  .pr-table tr.data-row td.item-desc { white-space: pre-line; }
  .pr-table tr.data-row td.num, .prs-table tr.data-row td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .pr-table tr.data-row td.currency-cell { text-align: center; white-space: nowrap; }

  .pr-table tr.pr-total td { background: #ece9f3; font-weight: 700; color: #1e3a5f; font-size: 12.5px; }

  .prs-table tr.division-banner td { background: #1e3a5f; color: #fff; font-weight: 700; font-size: 12.5px; padding: 8px 12px; }
  .prs-table tr.project-banner td { background: #e8eaf3; color: #1e3a5f; font-weight: 700; font-size: 12px; padding: 7px 12px; }
  .prs-table tr.status-banner td { background: #f2f1f8; color: #374151; font-weight: 600; font-size: 11.5px; padding: 6px 12px; }
  .prs-table tr.status-total td { background: #f2f1f8; font-weight: 700; color: #374151; font-size: 12px; }
  .prs-table tr.project-total td { background: #e0e4ee; font-weight: 700; color: #1e3a5f; font-size: 12.5px; }
  .prs-table tr.division-total td { background: #ece9f3; font-weight: 700; color: #1e3a5f; font-size: 12.5px; }

  @media print {
    table.pr-table thead, table.prs-table thead { display: table-header-group; }
    table.pr-table tr, table.prs-table tr { page-break-inside: avoid; }
  }
`;

const PurchaseRequestRegisterReport: React.FC = () => {
  const { user } = useAuth();

  const [viewType, setViewType] = useState<ViewType>('detail');
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [applied, setApplied] = useState<ReportFilters>(EMPTY_FILTERS);
  const [pending, setPending] = useState<ReportFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ col: keyof PRRow | null; dir: 'asc' | 'desc' }>({ col: null, dir: 'asc' });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;
  const appliedFiltersRef = useRef<ReportFilters>(EMPTY_FILTERS);

  // ── ONE raw-SQL query powers both views ──
  const { data: allRows = [], isLoading, isFetching, refetch } = useQuery<PRRow[]>({
    queryKey: ['pr_detail_register'],
    queryFn: async () => {
      const sql = buildDetailQuery(appliedFiltersRef.current, user?.company_code);
      return runRawSql<PRRow>(sql);
    },
    enabled: false,
    staleTime: Infinity,
  });

  const dataLoading = isLoading || isFetching;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return allRows;
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (viewType === 'detail') {
        return (
          r.REQUEST_NUMBER?.toLowerCase().includes(q) ||
          r.ITEM_CODE?.toLowerCase().includes(q) ||
          r.ITEM_DESP?.toLowerCase().includes(q) ||
          r.SUPPLIER?.toLowerCase().includes(q)
        );
      }
      return (
        r.REQUEST_NUMBER?.toLowerCase().includes(q) ||
        r.PROJECT_NAME?.toLowerCase().includes(q) ||
        r.CREATED_BY?.toLowerCase().includes(q) ||
        r.DESCRIPTION?.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, viewType]);

  const sortedRows = useCallback((rows: PRRow[]) => {
    if (!sort.col) return rows;
    return [...rows].sort((a, b) => {
      const col = sort.col!;
      let aVal: any = a[col]; let bVal: any = b[col];
      if (col === 'ITEM_RATE' || col === 'AMOUNT' || col === 'ITEM_P_QTY' || col === 'ITEM_L_QTY' || col === 'CURRENCY_RATE') {
        aVal = parseFloat(String(aVal)) || 0; bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase(); bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sort]);

  const handleSort = (col: keyof PRRow) => {
    setSort((prev) => (prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' }));
  };

  const requestGroups = useMemo(() => groupRows(filteredRows), [filteredRows]);
  const divisionGroups = useMemo(() => buildSummaryFromDetail(filteredRows), [filteredRows]);

  const grandTotalDetail = filteredRows.reduce((s, r) => s + (parseFloat(String(r.AMOUNT)) || 0), 0);
  const grandTotalSummary = divisionGroups.reduce((s, d) => s + d.total, 0);
  const grandTotal = viewType === 'detail' ? grandTotalDetail : grandTotalSummary;

  const filtersActive = isFiltersActive(applied, search);
  const reportTitle = viewType === 'detail' ? 'PR Detail Register' : 'PR Summary Register';

  const handlePrint = () => window.print();

  const handleGenerateReport = async () => {
    setApplied({ ...pending });
    appliedFiltersRef.current = { ...pending };
    try { await refetch(); } finally { setHasGeneratedReport(true); setActiveTab('report'); }
  };

  const handleReset = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setHasGeneratedReport(false);
    setActiveTab('parameters');
  };

  // ── Excel Export — branches by view, both read from the same allRows ──
  const handleExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    if (viewType === 'detail') {
      const rows: any[][] = [
        ['PR Detail Register'],
        [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
        [],
        ['Request No', 'Request Date', 'Item Code', 'Description', 'PUOM', 'P Qty', 'LUOM', 'L Qty', 'Item Rate', 'Amount', 'Currency', 'Ex Rate', 'Status', 'Type'],
      ];
      requestGroups.forEach((req) => {
        sortedRows(req.items).forEach((row) => {
          rows.push([
            row.REQUEST_NUMBER, formatDate(row.REQUEST_DATE), row.ITEM_CODE, row.ITEM_DESP,
            row.P_UOM, parseFloat(String(row.ITEM_P_QTY)) || 0, row.L_UOM,
            parseFloat(String(row.ITEM_L_QTY)) || 0, parseFloat(String(row.ITEM_RATE)) || 0,
            parseFloat(String(row.AMOUNT)) || 0, row.CURR_CODE, parseFloat(String(row.CURRENCY_RATE)) || 0,
            row.STATUS, row.TYPE_OF_PR,
          ]);
        });
        rows.push(['', '', `Request Total: ${req.requestNumber}`, '', '', '', '', '', '', req.total]);
      });
      rows.push([]);
      rows.push(['', '', 'Grand Total', '', '', '', '', '', '', grandTotalDetail]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 22 }, { wch: 13 }, { wch: 16 }, { wch: 32 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws, 'PR Detail');
      XLSX.writeFile(wb, 'PR_Detail_Register.xlsx');
    } else {
      const rows: any[][] = [
        ['PR Summary Register'],
        [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
        [],
        ['Division', 'Request No', 'Request Date', 'Created By', 'Amount', 'Type of PR', 'Status'],
      ];
      divisionGroups.forEach((div) => {
        div.projects.forEach((proj) => {
          rows.push([`Project : ${proj.projectName} | ${proj.projectCode}`]);
          proj.statuses.forEach((st) => {
            st.rows.forEach((row) => {
              rows.push([div.divName, row.requestNumber, formatDate(row.requestDate), row.createdBy, row.total, row.typeOfPr, row.status]);
            });
            rows.push(['', '', '', '', st.total, `Status Total: ${st.status}`]);
          });
          rows.push(['', '', '', '', proj.total, `Project Total For: ${proj.projectName}`]);
        });
        rows.push(['', '', '', '', div.total, `Division Total: ${div.divName}`]);
      });
      rows.push([]);
      rows.push(['', '', '', '', grandTotalSummary, 'Grand Total']);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 13 }, { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'PR Summary');
      XLSX.writeFile(wb, 'PR_Summary_Register.xlsx');
    }
  };

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

  // ── PDF Export — branches by view ──
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;
    const NAVY = [30, 58, 95] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];
    const DARK = [55, 65, 81] as [number, number, number];
    const BORDER = [209, 213, 219] as [number, number, number];

    let logoBase64 = '';
    try { logoBase64 = await getBase64FromUrl(companyLogo); } catch { /* skip */ }

    const HEADER_H = 36, TITLE_Y = 27, TABLE_TOP = filtersActive ? 44 : 39;

    const drawPageHeader = (data: any) => {
      const pg = data.pageNumber as number;
      if (logoBase64) pdf.addImage(logoBase64, 'PNG', margin, 5, 32, 16);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
      pdf.text(`Page ${pg}`, pageW - margin, 9, { align: 'right' });
      pdf.text(`Print Date : ${printDate}`, pageW - margin, 14, { align: 'right' });
      pdf.text(`Print User : ${printUser}`, pageW - margin, 19, { align: 'right' });
      pdf.setFillColor(...NAVY);
      pdf.rect(margin, TITLE_Y, pageW - margin * 2, 8, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(...WHITE);
      pdf.text(reportTitle, pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      if (pg === 1 && filtersActive) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(107, 114, 128);
        const parts = Object.entries(applied)
          .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFilterValue(v as string | string[])}`)
          .join(' | ');
        if (parts) pdf.text(`Filter: ${parts}`, margin, TABLE_TOP - 2);
      }
    };

    if (viewType === 'detail') {
      const TOT = [213, 220, 232] as [number, number, number];
      const body: any[] = [];
      const cellPad = { top: 1.5, bottom: 1.5, left: 5, right: 5 };

      requestGroups.forEach((req) => {
        body.push([{
          content: `PR No = ${req.requestNumber}     |     Request Date = ${formatDate(req.requestDate)}     |     Status = ${req.status}     |     Type = ${req.typeOfPr}`,
          colSpan: 9,
          styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
        }]);
        sortedRows(req.items).forEach((row) => {
          const desc = `${row.ITEM_DESP?.trim() || ''}${row.ADDL_ITEM_DESC?.trim() ? ' ' + row.ADDL_ITEM_DESC.trim() : ''}`;
          body.push([
            { content: desc, styles: { fontSize: 9, halign: 'left' } },
            { content: row.P_UOM || '', styles: { fontSize: 9 } },
            { content: row.ITEM_P_QTY ? formatQty(parseFloat(String(row.ITEM_P_QTY))) : '', styles: { halign: 'right', fontSize: 9 } },
            { content: row.L_UOM || '', styles: { fontSize: 9 } },
            { content: row.ITEM_L_QTY ? formatQty(parseFloat(String(row.ITEM_L_QTY))) : '', styles: { halign: 'right', fontSize: 9 } },
            { content: formatAmount(parseFloat(String(row.ITEM_RATE)) || 0), styles: { halign: 'right', fontSize: 9 } },
            { content: formatAmount(parseFloat(String(row.AMOUNT)) || 0), styles: { halign: 'right', fontSize: 9, fontStyle: 'bold' } },
            { content: row.CURR_CODE || '', styles: { fontSize: 9, halign: 'center' } },
            { content: formatAmount(parseFloat(String(row.CURRENCY_RATE)) || 0), styles: { halign: 'right', fontSize: 9 } },
          ]);
        });
        body.push([
          { content: `Total for : ${req.requestNumber}`, colSpan: 6, styles: { fillColor: TOT, textColor: NAVY, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } },
          { content: formatAmount(req.total), styles: { fillColor: TOT, textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
          { content: '', styles: { fillColor: TOT } },
          { content: '', styles: { fillColor: TOT } },
        ]);
      });
      body.push([{ content: '', colSpan: 9, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
      body.push([
        { content: 'Grand Total :', colSpan: 6, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: formatAmount(grandTotalDetail), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: '', styles: { fillColor: NAVY } },
        { content: '', styles: { fillColor: NAVY } },
      ]);

      autoTable(pdf, {
        startY: TABLE_TOP,
        margin: { left: margin, right: margin, top: HEADER_H + 4 },
        columnStyles: { 0: { cellWidth: 'auto' as any }, 1: { cellWidth: 16 }, 2: { cellWidth: 18 }, 3: { cellWidth: 16 }, 4: { cellWidth: 18 }, 5: { cellWidth: 22 }, 6: { cellWidth: 24 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 } },
        head: [[
          { content: 'Item Description', styles: { halign: 'left', fontSize: 9 } },
          { content: 'PUOM', styles: { halign: 'left', fontSize: 9 } },
          { content: 'P Qty', styles: { halign: 'right', fontSize: 9 } },
          { content: 'LUOM', styles: { halign: 'left', fontSize: 9 } },
          { content: 'L Qty', styles: { halign: 'right', fontSize: 9 } },
          { content: 'Item Rate', styles: { halign: 'right', fontSize: 9 } },
          { content: 'Amount', styles: { halign: 'right', fontSize: 9 } },
          { content: 'Currency', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Ex Rate', styles: { halign: 'right', fontSize: 9 } },
        ]],
        body,
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
        bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'linebreak', minCellHeight: 0 },
        tableLineColor: BORDER, tableLineWidth: 0.25,
        didDrawPage: drawPageHeader,
        didDrawCell: (data) => {
          const { cell, doc } = data;
          doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        },
      });
      pdf.save('PR_Detail_Register.pdf');
    } else {
      const LIGHT = [232, 234, 243] as [number, number, number];
      const STOT = [242, 241, 248] as [number, number, number];
      const DTOT = [224, 228, 238] as [number, number, number];
      const body: any[] = [];
      const cellPad = { top: 1.5, bottom: 1.5, left: 5, right: 5 };

      divisionGroups.forEach((div) => {
        body.push([{ content: `Division : ${div.divName}`, colSpan: 5, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } }]);
        div.projects.forEach((proj) => {
          body.push([{ content: `Project : ${proj.projectName}${proj.projectCode ? `  |  ${proj.projectCode}` : ''}`, colSpan: 5, styles: { fillColor: LIGHT, textColor: NAVY, fontStyle: 'bold', fontSize: 9, cellPadding: cellPad } }]);
          proj.statuses.forEach((st) => {
            body.push([{ content: `Project Status : ${st.status}`, colSpan: 5, styles: { fillColor: [242, 243, 246], textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: cellPad } }]);
            st.rows.forEach((row) => {
              body.push([
                { content: row.requestNumber || '', styles: { fontSize: 9, halign: 'left' } },
                { content: formatDate(row.requestDate), styles: { fontSize: 9 } },
                { content: row.createdBy || '', styles: { fontSize: 9 } },
                { content: row.typeOfPr || '', styles: { fontSize: 9 } },
                { content: formatAmount(row.total), styles: { halign: 'right', fontSize: 9, fontStyle: 'bold' } },
              ]);
            });
            body.push([
              { content: `Status Total : ${st.status}`, colSpan: 4, styles: { fillColor: STOT, textColor: DARK, fontStyle: 'bold', fontSize: 9 } },
              { content: formatAmount(st.total), styles: { fillColor: STOT, textColor: DARK, fontStyle: 'bold', halign: 'right', fontSize: 9 } },
            ]);
          });
          body.push([
            { content: `Project Total For : ${proj.projectName}`, colSpan: 4, styles: { fillColor: DTOT, textColor: NAVY, fontStyle: 'bold', fontSize: 9.5 } },
            { content: formatAmount(proj.total), styles: { fillColor: DTOT, textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
          ]);
        });
        body.push([
          { content: `Division Total : ${div.divName}`, colSpan: 4, styles: { fillColor: [236, 233, 243], textColor: NAVY, fontStyle: 'bold', fontSize: 9.5 } },
          { content: formatAmount(div.total), styles: { fillColor: [236, 233, 243], textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        ]);
      });
      body.push([{ content: '', colSpan: 5, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
      body.push([
        { content: 'Grand Total :', colSpan: 4, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: formatAmount(grandTotalSummary), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      ]);

      autoTable(pdf, {
        startY: TABLE_TOP,
        margin: { left: margin, right: margin, top: HEADER_H + 4 },
        columnStyles: { 0: { cellWidth: 34 }, 1: { cellWidth: 22 }, 2: { cellWidth: 40 }, 3: { cellWidth: 'auto' as any }, 4: { cellWidth: 26 } },
        head: [[
          { content: 'Request No', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Request Date', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Created By', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Type of PR', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Amount', styles: { halign: 'right', fontSize: 9 } },
        ]],
        body,
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
        bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'linebreak', minCellHeight: 0 },
        tableLineColor: BORDER, tableLineWidth: 0.25,
        didDrawPage: drawPageHeader,
        didDrawCell: (data) => {
          const { cell, doc } = data;
          doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        },
      });
      pdf.save('PR_Summary_Register.pdf');
    }
  };

  const filterMetaRow = (colSpan: number, className: string) => filtersActive && (
    <tr className={className}>
      <td colSpan={colSpan}>
        <b>Filter:</b>{' '}
        {[
          ...Object.entries(applied)
            .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFilterValue(v as string | string[])}`),
          ...(search.trim() ? [`search: "${search.trim()}"`] : []),
        ].join(' | ')}
      </td>
    </tr>
  );

  // ── Detail table markup ──
  const detailTable = requestGroups.length === 0 ? (
    <div className="rp-empty">No records found.</div>
  ) : (
    <table className="pr-table">
      <colgroup>
        <col className="c0" /><col className="c1" /><col className="c2" />
        <col className="c3" /><col className="c4" /><col className="c5" />
        <col className="c6" /><col className="c7" /><col className="c8" />
      </colgroup>
      <thead>
        <tr className="pr-print-logo-row">
          <td colSpan={9}>
            <div className="pr-print-logo-flex">
              <img src={companyLogo} alt="Logo" />
              <div className="pr-print-meta-text">
                <div><b>Print Date:</b> {printDate}</div>
                <div><b>Print User:</b> {printUser}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr className="pr-title-bar"><td colSpan={9}>PR Detail Register</td></tr>
        {filterMetaRow(9, 'pr-meta-row')}
        <tr>
          <th className="left">Item Description</th>
          <th onClick={() => handleSort('P_UOM')}>PUOM</th>
          <th className="num" onClick={() => handleSort('ITEM_P_QTY')}>P Qty</th>
          <th onClick={() => handleSort('L_UOM')}>LUOM</th>
          <th className="num" onClick={() => handleSort('ITEM_L_QTY')}>L Qty</th>
          <th className="num" onClick={() => handleSort('ITEM_RATE')}>Item Rate</th>
          <th className="num" onClick={() => handleSort('AMOUNT')}>Amount</th>
          <th>Currency</th>
          <th className="num" onClick={() => handleSort('CURRENCY_RATE')}>Ex Rate</th>
        </tr>
      </thead>
      <tbody>
        {requestGroups.map((req) => (
          <React.Fragment key={req.requestNumber}>
            <tr className="pr-banner">
              <td colSpan={9}>
                PR No = {req.requestNumber} &nbsp;|&nbsp; Request Date = {formatDate(req.requestDate)}
                &nbsp;|&nbsp; Status = {req.status} &nbsp;|&nbsp; Type = {req.typeOfPr}
              </td>
            </tr>
            {sortedRows(req.items).map((row, ri) => (
              <tr key={`${row.REQUEST_NUMBER}-${row.ITEM_CODE}-${ri}`} className="data-row">
                <td className="item-desc">
                  {row.ITEM_DESP?.trim()}{row.ADDL_ITEM_DESC?.trim() ? ' ' + row.ADDL_ITEM_DESC?.trim() : ''}
                </td>
                <td>{row.P_UOM || ''}</td>
                <td className="num">{row.ITEM_P_QTY ? formatQty(parseFloat(String(row.ITEM_P_QTY))) : ''}</td>
                <td>{row.L_UOM || ''}</td>
                <td className="num">{row.ITEM_L_QTY ? formatQty(parseFloat(String(row.ITEM_L_QTY))) : ''}</td>
                <td className="num">{formatAmount(parseFloat(String(row.ITEM_RATE)) || 0)}</td>
                <td className="num">{formatAmount(parseFloat(String(row.AMOUNT)) || 0)}</td>
                <td className="currency-cell">{row.CURR_CODE || ''}</td>
                <td className="num">{formatAmount(parseFloat(String(row.CURRENCY_RATE)) || 0)}</td>
              </tr>
            ))}
            <tr className="pr-total">
              <td colSpan={6}>Total for : {req.requestNumber}</td>
              <td className="num">{formatAmount(req.total)}</td>
              <td />
              <td />
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  // ── Summary table markup ──
  const summaryTable = divisionGroups.length === 0 ? (
    <div className="rp-empty">No records found.</div>
  ) : (
    <table className="prs-table">
      <colgroup>
        <col className="c0" /><col className="c1" /><col className="c2" />
        <col className="c3" /><col className="c4" />
      </colgroup>
      <thead>
        <tr className="prs-print-logo-row">
          <td colSpan={5}>
            <div className="prs-print-logo-flex">
              <img src={companyLogo} alt="Logo" />
              <div className="prs-print-meta-text">
                <div><b>Print Date:</b> {printDate}</div>
                <div><b>Print User:</b> {printUser}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr className="prs-title-bar"><td colSpan={5}>PR Summary Register</td></tr>
        {filterMetaRow(5, 'prs-meta-row')}
        <tr>
          <th className="left">Request No</th>
          <th className="left">Request Date</th>
          <th className="left">Created By</th>
          <th className="left">Type of PR</th>
          <th className="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        {divisionGroups.map((div) => (
          <React.Fragment key={div.divName}>
            <tr className="division-banner"><td colSpan={5}>Division : {div.divName}</td></tr>
            {div.projects.map((proj) => (
              <React.Fragment key={`${div.divName}|||${proj.projectName}`}>
                <tr className="project-banner">
                  <td colSpan={5}>Project : {proj.projectName}{proj.projectCode ? ` | ${proj.projectCode}` : ''}</td>
                </tr>
                {proj.statuses.map((st) => (
                  <React.Fragment key={`${proj.projectName}|||${st.status}`}>
                    <tr className="status-banner"><td colSpan={5}>Project Status : {st.status}</td></tr>
                    {st.rows.map((row, ri) => (
                      <tr key={`${row.requestNumber}-${ri}`} className="data-row">
                        <td>{row.requestNumber}</td>
                        <td>{formatDate(row.requestDate)}</td>
                        <td>{row.createdBy}</td>
                        <td>{row.typeOfPr}</td>
                        <td className="num">{formatAmount(row.total)}</td>
                      </tr>
                    ))}
                    <tr className="status-total">
                      <td colSpan={4}>Status Total : {st.status}</td>
                      <td className="num">{formatAmount(st.total)}</td>
                    </tr>
                  </React.Fragment>
                ))}
                <tr className="project-total">
                  <td colSpan={4}>Project Total For : {proj.projectName}</td>
                  <td className="num">{formatAmount(proj.total)}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="division-total">
              <td colSpan={4}>Division Total : {div.divName}</td>
              <td className="num">{formatAmount(div.total)}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  const tableContent = viewType === 'detail' ? detailTable : summaryTable;

  return (
    <ReportPage
      title={reportTitle}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      hasGeneratedReport={hasGeneratedReport}
      dataLoading={dataLoading}
      filtersActive={filtersActive}
      paramsContent={
        <>
          <div style={{ marginBottom: 20 }}>
            <label style={paramLabelStyle}>Report View</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['detail', 'summary'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewType(v)}
                  style={{
                    padding: '8px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                    border: viewType === v ? '1.5px solid #1e3a5f' : '1.5px solid #d1d5db',
                    background: viewType === v ? '#1e3a5f' : '#fff',
                    color: viewType === v ? '#fff' : '#374151', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {v === 'detail' ? 'Detail Report' : 'Summary Report'}
                </button>
              ))}
            </div>
          </div>
          <ReportParameterForm rows={prReportFields} filters={pending} onChange={setPending} companyCode={user?.company_code} />
        </>
      }
      onGenerate={handleGenerateReport}
      onReset={handleReset}
      generateDisabled={dataLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={viewType === 'detail' ? 'Search request no / item / supplier…' : 'Search request no / project / created by…'}
      onPrint={handlePrint}
      onExcel={handleExcel}
      onPdf={handleDownloadPDF}
      reportContent={tableContent}
      showGrandTotal={(viewType === 'detail' ? requestGroups.length : divisionGroups.length) > 0}
      grandTotalValue={formatAmount(grandTotal)}
      css={TABLE_CSS}
    />
  );
};

export default PurchaseRequestRegisterReport;