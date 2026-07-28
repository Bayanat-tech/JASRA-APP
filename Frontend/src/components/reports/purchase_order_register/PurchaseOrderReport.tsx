import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import axiosServices from 'utils/axios';
import { ReportPage } from './common/ReportPage';
import { ReportParameterForm, ParamFieldConfig } from './common/ReportParameterForm';
import {
  formatAmount, formatQty, formatDate, parseDateStr, formatFilterValue,
  buildFilterParams, isFiltersActive, normalizeStringList, ReportFilters,
} from './common/reportHelpers';

type ViewType = 'detail' | 'summary';

// ── Types ────────────────────────────────────────────────
type PORow = {
  PO_NO: string; PO_DATE: string; SUPPLIER: string; SERVICE_RM_FLAG: string;
  SUPP_NAME: string; STATUS: string; ITEM_CODE: string; ADDL_ITEM_DESC: string;
  ITEM_DESP: string; P_UOM: string; APPR_ITEM_P_QTY: number; L_UOM: string;
  APPR_ITEM_L_QTY: number; ITEM_RATE: number; CURRENCY_RATE: number; AMOUNT: number;
  PROJECT_NAME: string; CONTACT_NUMBER: string; COMPANY_LOGO_AWSURL: string;
  MAIL_EMAIL: string; COMPANY_NAME: string; DIV_CODE: string;
  // added so this single endpoint can also power the Summary view
PROJECT_CODE: string; DESCRIPTION: string; TYPE_OF_PR: string; PR_REF_NO: string; PAYMENT_TERMS: string; WO_NUMBER: string;
};

// ── Detail grouping (PO > Supplier > Item) ──────────────────
type ItemGroup = { itemCode: string; itemDesp: string; addlDesc: string; rows: PORow[]; total: number };
type SupplierGroup = { suppName: string; supplier: string; items: ItemGroup[]; total: number };
type POGroup = { poNo: string; poDate: string; status: string; serviceFlag: string; suppliers: SupplierGroup[]; total: number };
type SortConfig = { col: keyof PORow | null; dir: 'asc' | 'desc' };

function groupRows(rows: PORow[]): POGroup[] {
  const poMap: Record<string, any> = {};
  for (const r of rows) {
    const poKey = r.PO_NO;
    const suppKey = r.SUPP_NAME || r.SUPPLIER || 'Unknown Supplier';
    const itemKey = r.ITEM_CODE || r.ITEM_DESP || 'N/A';
    const amount = parseFloat(String(r.AMOUNT)) || 0;

    if (!poMap[poKey])
      poMap[poKey] = { poNo: r.PO_NO, poDate: r.PO_DATE, status: r.STATUS, serviceFlag: r.SERVICE_RM_FLAG, suppliers: {}, total: 0 };
    if (!poMap[poKey].suppliers[suppKey])
      poMap[poKey].suppliers[suppKey] = { suppName: suppKey, supplier: r.SUPPLIER, items: {}, total: 0 };
    if (!poMap[poKey].suppliers[suppKey].items[itemKey])
      poMap[poKey].suppliers[suppKey].items[itemKey] = { itemCode: r.ITEM_CODE, itemDesp: r.ITEM_DESP, addlDesc: r.ADDL_ITEM_DESC, rows: [], total: 0 };

    poMap[poKey].suppliers[suppKey].items[itemKey].rows.push(r);
    poMap[poKey].suppliers[suppKey].items[itemKey].total += amount;
    poMap[poKey].suppliers[suppKey].total += amount;
    poMap[poKey].total += amount;
  }
  return Object.values(poMap).map((po: any) => ({
    ...po,
    suppliers: Object.values(po.suppliers).map((s: any) => ({ ...s, items: Object.values(s.items) })),
  }));
}

// ── Summary grouping (Division > Project > Status), derived from
//    the SAME rows used for Detail — one row per PO, item amounts summed. ──
type SummaryPoRow = {
  poNo: string; poDate: string; divCode: string; projectName: string; projectCode: string;
  status: string; supplier: string; suppName: string; description: string; typeOfPr: string;
  total: number; PR_REF_NO: string; PAYMENT_TERMS: string; WO_NUMBER: string;
};
// type StatusGroup = { status: string; rows: SummaryPoRow[]; total: number };
// type ProjectGroup = { projectName: string; projectCode: string; statuses: StatusGroup[]; total: number };
// type DivisionGroup = { divCode: string; projects: ProjectGroup[]; total: number };

// function buildSummaryFromDetail(rows: PORow[]): DivisionGroup[] {
//   // Step 1: collapse item-level rows down to one row per PO (sum amount)
//   const poMap: Record<string, SummaryPoRow> = {};
//   for (const r of rows) {
//     const amount = parseFloat(String(r.AMOUNT)) || 0;
//     if (!poMap[r.PO_NO]) {
//       poMap[r.PO_NO] = {
//         poNo: r.PO_NO,PR_REF_NO: r.PR_REF_NO, poDate: r.PO_DATE, divCode: r.DIV_CODE || 'Unassigned',
//         projectName: r.PROJECT_NAME || 'N/A', projectCode: r.PROJECT_CODE || '',
//         status: r.STATUS || 'N/A', supplier: r.SUPPLIER, suppName: r.SUPP_NAME,
//         description: r.DESCRIPTION || '', typeOfPr: r.TYPE_OF_PR || '',
//         total: 0, PAYMENT_TERMS: r.PAYMENT_TERMS || '', WO_NUMBER: r.WO_NUMBER || '',
//       };
//     }
//     poMap[r.PO_NO].total += amount;
//   }

//   // Step 2: fold those PO-level rows into Division > Project > Status
//   const divMap: Record<string, any> = {};
//   Object.values(poMap).forEach(po => {
//     if (!divMap[po.divCode]) divMap[po.divCode] = { divCode: po.divCode, projects: {}, total: 0 };
//     const div = divMap[po.divCode];
//     if (!div.projects[po.projectName])
//       div.projects[po.projectName] = { projectName: po.projectName, projectCode: po.projectCode, statuses: {}, total: 0 };
//     const proj = div.projects[po.projectName];
//     if (!proj.statuses[po.status]) proj.statuses[po.status] = { status: po.status, rows: [], total: 0 };
//     const st = proj.statuses[po.status];

//     st.rows.push(po); st.total += po.total;
//     proj.total += po.total; div.total += po.total;
//   });

//   return Object.values(divMap).map((div: any) => ({
//     ...div,
//     projects: Object.values(div.projects).map((p: any) => ({ ...p, statuses: Object.values(p.statuses) })),
//   }));
// }

function buildSummaryRows(rows: PORow[]): SummaryPoRow[] {
  const poMap: Record<string, SummaryPoRow> = {};
  for (const r of rows) {
    const amount = parseFloat(String(r.AMOUNT)) || 0;
    if (!poMap[r.PO_NO]) {
      poMap[r.PO_NO] = {
        poNo: r.PO_NO,PR_REF_NO: r.PR_REF_NO, poDate: r.PO_DATE, divCode: r.DIV_CODE || 'Unassigned',
        projectName: r.PROJECT_NAME || 'N/A', projectCode: r.PROJECT_CODE || '',
        status: r.STATUS || 'N/A', supplier: r.SUPPLIER, suppName: r.SUPP_NAME,
        description: r.DESCRIPTION || '', typeOfPr: r.TYPE_OF_PR || '',
        total: 0, PAYMENT_TERMS: r.PAYMENT_TERMS || '', WO_NUMBER: r.WO_NUMBER || '',
      };
    }
    poMap[r.PO_NO].total += amount;
  }
  return Object.values(poMap);
}
// ── Param options (unchanged endpoints) ─────────────────────
const getOptions = (endpoint: string, responseKeys: string[]) =>
  (filters: ReportFilters, companyCode?: string) =>
    axiosServices
      .get(`${endpoint}?${buildFilterParams(companyCode, filters)}`)
      .then(res => normalizeStringList(res.data, responseKeys));

const poReportFields: ParamFieldConfig[][] = [
  [
    { type: 'multiselect', key: 'div_code', label: 'Div Code', fetchOptions: getOptions('/api/report/div-codes', ['DIV_CODE', 'div_code', 'value', 'label']), placeholder: 'Div Code' },
    { type: 'multiselect', key: 'ref_doc_no', label: 'PO Number', fetchOptions: getOptions('/api/report/po-no', ['PO_NO', 'po_no', 'poNo', 'value', 'label']), placeholder: 'PO NO' },
    { type: 'multiselect', key: 'project_name', label: 'Project Name', fetchOptions: getOptions('/api/report/project-names', ['PROJECT_NAME', 'project_name', 'value', 'label']), placeholder: 'All Projects' },
  ],
  [
    { type: 'date', key: 'date_from', label: 'PO Date From' },
    { type: 'date', key: 'date_to', label: 'PO Date To' },
  ],
  [
    { type: 'number', key: 'amount_from', label: 'Amount From', placeholder: '0' },
    { type: 'number', key: 'amount_to', label: 'Amount To', placeholder: 'No limit' },
  ],
  [
    { type: 'multiselect', key: 'supp_name', label: 'Supplier', fetchOptions: getOptions('/api/report/supplier-names', ['SUPP_NAME', 'supp_name', 'value', 'label']), placeholder: 'All Suppliers' },
    { type: 'multiselect', key: 'status', label: 'Status', fetchOptions: getOptions('/api/report/status-options', ['STATUS', 'status', 'value', 'label']), placeholder: 'All Statuses' },
  ],
];

const EMPTY_FILTERS: ReportFilters = {
  supp_name: [], status: [], ref_doc_no: [], project_name: [],
  amount_from: '', amount_to: '', date_from: '', date_to: '', div_code: [],
};

// Deliberately NOT part of ReportFilters/EMPTY_FILTERS — it's a display
// toggle, not a server filter, so it doesn't show up in the "Filter: …"
// summary line, doesn't affect isFiltersActive, and switching it never
// triggers a refetch.
const paramLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em',
};

// ── CSS: detail table (po-*) + summary table (pos-*) — only one renders
//    at a time so the class names can coexist safely. ──────────────────
const TABLE_CSS = `
  .po-print-logo-row td, .pos-print-logo-row td { padding: 10px 24px; }
  .po-print-logo-flex, .pos-print-logo-flex { display: flex; justify-content: space-between; align-items: center; }
  .po-print-logo-flex img, .pos-print-logo-flex img { height: 44px; width: auto; object-fit: contain; }
  .po-print-meta-text, .pos-print-meta-text { text-align: right; font-size: 11px; color: #6b7280; line-height: 1.8; }
  .po-title-bar td, .pos-title-bar td { background: #1e3a5f; color: #fff; text-align: center; padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }
  .po-meta-row td, .pos-meta-row td { padding: 9px 24px; background: #f9fafb; font-size: 12px; color: #6b7280; }

  table.po-table, table.pos-table { width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed; }
  .po-table col.c0 { width: 15%; } .po-table col.c1 { width: 15%; } .po-table col.c2 { width: 7%; }
  .po-table col.c3 { width: 8%; } .po-table col.c4 { width: 7%; } .po-table col.c5 { width: 8%; }
  .po-table col.c6 { width: 10%; } .po-table col.c7 { width: 11%; } .po-table col.c8 { width: 8%; } .po-table col.c9 { width: 6%; }
.pos-table col.c0  { width: 15%; }  /* PO No */
.pos-table col.c1  { width: 7%; }   /* PO Date */
.pos-table col.c2  { width: 6%; }   /* Supplier Code */
.pos-table col.c3  { width: 11%; }  /* Supplier Name */
.pos-table col.c4  { width: 7%; }   /* Amount */
.pos-table col.c5  { width: 15%; }  /* PR REF.NO */
.pos-table col.c6  { width: 16%; }  /* Scope of Work */
.pos-table col.c7  { width: 10%; }  /* Payment Terms */
.pos-table col.c8  { width: 8%; }   /* W/O Number */
.pos-table col.c9  { width: 8%; }   /* Type of PR */
.pos-table col.c10 { width: 6%; }   /* Status */

  .po-table th, .po-table td, .pos-table th, .pos-table td { overflow: anywhere; border: 1px solid #9d9db3; padding: 7px 10px; vertical-align: top; }
  .po-table thead th, .pos-table thead th { background: #d9d6e8; color: #1f1f2e; font-weight: 700; font-size: 12.5px; text-align: center; white-space: nowrap; }
  .po-table thead th { cursor: pointer; user-select: none; }
  .po-table thead th:hover { background: #cbc7e0; }
  .po-table thead th.num, .pos-table thead th.num { text-align: right; }
  .po-table thead th.left, .pos-table thead th.left { text-align: left; padding-left: 12px; }

  .po-table tr.po-banner td { background: #fff; font-weight: 700; font-size: 12.5px; color: #111; padding: 8px 10px; }
  .po-table tr.data-row td, .pos-table tr.data-row td { background: #fff; color: #1f1f2e; vertical-align: top; line-height: 1.55; }
  .po-table tr.data-row td.item-desc { white-space: pre-line; }
  .po-table tr.data-row td.num, .pos-table tr.data-row td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .po-table tr.data-row td.currency-cell { text-align: center; white-space: nowrap; }

  .po-table tr.item-total td, .po-table tr.supp-total td, .po-table tr.po-total td { background: #ece9f3; font-weight: 700; color: #1e3a5f; }
  .po-table tr.item-total td { font-size: 12px; }
  .po-table tr.supp-total td, .po-table tr.po-total td { font-size: 12.5px; }

  .pos-table tr.division-banner td { background: #1e3a5f; color: #fff; font-weight: 700; font-size: 12.5px; padding: 8px 12px; }
  .pos-table tr.project-banner td { background: #e8eaf3; color: #1e3a5f; font-weight: 700; font-size: 12px; padding: 7px 12px; }
  .pos-table tr.status-banner td { background: #f2f1f8; color: #374151; font-weight: 600; font-size: 11.5px; padding: 6px 12px; }
  .pos-table tr.status-total td { background: #f2f1f8; font-weight: 700; color: #374151; font-size: 12px; }
  .pos-table tr.project-total td { background: #e0e4ee; font-weight: 700; color: #1e3a5f; font-size: 12.5px; }
  .pos-table tr.division-total td { background: #ece9f3; font-weight: 700; color: #1e3a5f; font-size: 12.5px; }

  @media print {
    table.po-table thead, table.pos-table thead { display: table-header-group; }
    table.po-table tr, table.pos-table tr { page-break-inside: avoid; }
  }
`;

const PurchaseOrderReport: React.FC = () => {
  const { user } = useAuth();

  const [viewType, setViewType] = useState<ViewType>('detail');
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [applied, setApplied] = useState<ReportFilters>(EMPTY_FILTERS);
  const [pending, setPending] = useState<ReportFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ col: null, dir: 'asc' });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;
  const appliedFiltersRef = useRef<ReportFilters>(EMPTY_FILTERS);

  // ── ONE endpoint powers both views now ──
  const { data: allRows = [], isLoading, isFetching, refetch } = useQuery<PORow[]>({
    queryKey: ['po_detail_register'],
    queryFn: async () => {
      const params = buildFilterParams(user?.company_code, appliedFiltersRef.current);
      const response: { data: PORow[] } = await axiosServices.get(`/api/report/po-detail-register?${params}`);
      return response.data || [];
    },
    enabled: false,
    staleTime: Infinity,
  });

  const dataLoading = isLoading || isFetching;

  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      const div = applied.div_code as string[];
      const supp = applied.supp_name as string[];
      const proj = applied.project_name as string[];
      const stat = applied.status as string[];
      const po = applied.ref_doc_no as string[];
      if (div.length && !div.includes(r.DIV_CODE)) return false;
      if (supp.length && !supp.includes(r.SUPP_NAME)) return false;
      if (proj.length && !proj.includes(r.PROJECT_NAME)) return false;
      if (stat.length && !stat.includes(r.STATUS)) return false;
      if (po.length && !po.includes(r.PO_NO)) return false;
      if (applied.amount_from && (parseFloat(String(r.AMOUNT)) || 0) < parseFloat(applied.amount_from as string)) return false;
      if (applied.amount_to && (parseFloat(String(r.AMOUNT)) || 0) > parseFloat(applied.amount_to as string)) return false;
      if (applied.date_from) {
        const from = new Date(applied.date_from as string).getTime();
        if (parseDateStr(r.PO_DATE) < from) return false;
      }
      if (applied.date_to) {
        const to = new Date(applied.date_to as string).getTime() + 86400000 - 1;
        if (parseDateStr(r.PO_DATE) > to) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (viewType === 'detail') {
          if (
            !r.PO_NO?.toLowerCase().includes(q) &&
            !r.SUPP_NAME?.toLowerCase().includes(q) &&
            !r.ITEM_CODE?.toLowerCase().includes(q) &&
            !r.ITEM_DESP?.toLowerCase().includes(q)
          ) return false;
        } else {
          if (
            !r.PO_NO?.toLowerCase().includes(q) &&
            !r.SUPP_NAME?.toLowerCase().includes(q) &&
            !r.PROJECT_NAME?.toLowerCase().includes(q) &&
            !r.DESCRIPTION?.toLowerCase().includes(q)
          ) return false;
        }
      }
      return true;
    });
  }, [allRows, applied, search, viewType]);

  const sortedRows = useCallback((rows: PORow[]) => {
    if (!sort.col) return rows;
    return [...rows].sort((a, b) => {
      const col = sort.col!;
      let aVal: any = a[col]; let bVal: any = b[col];
      if (col === 'PO_DATE') { aVal = parseDateStr(aVal); bVal = parseDateStr(bVal); }
      else if (['AMOUNT', 'ITEM_RATE', 'APPR_ITEM_P_QTY', 'APPR_ITEM_L_QTY', 'CURRENCY_RATE'].includes(col)) {
        aVal = parseFloat(String(aVal)) || 0; bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase(); bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sort]);

  const poGroups = useMemo(() => groupRows(filteredRows), [filteredRows]);
  // const divisionGroups = useMemo(() => buildSummaryFromDetail(filteredRows), [filteredRows]);
  const grandTotal = filteredRows.reduce((s, r) => s + (parseFloat(String(r.AMOUNT)) || 0), 0);
  const filtersActive = isFiltersActive(applied, search);

  const reportTitle = viewType === 'detail' ? 'PO Detail Register' : 'PO Summary Register';

  const handleSort = (col: keyof PORow) => {
    setSort(prev => (prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' }));
  };

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
      const summaryData: any[][] = [
        ['PO Detail Register'],
        [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
        [],
        ['PO No', 'PO Date', 'Supplier', 'Item Code', 'Description', 'PUOM', 'P Qty', 'LUOM', 'L Qty', 'Item Rate', 'Currency Rate', 'Amount (QAR)', 'Status', 'Type'],
      ];
      poGroups.forEach(po => {
        po.suppliers.forEach(supp => {
          supp.items.forEach(item => {
            sortedRows(item.rows).forEach(row => {
              summaryData.push([
                row.PO_NO, formatDate(row.PO_DATE), row.SUPP_NAME, row.ITEM_CODE, row.ITEM_DESP,
                row.P_UOM, parseFloat(String(row.APPR_ITEM_P_QTY)) || 0, row.L_UOM,
                parseFloat(String(row.APPR_ITEM_L_QTY)) || 0, parseFloat(String(row.ITEM_RATE)) || 0,
                parseFloat(String(row.CURRENCY_RATE)) || 0, parseFloat(String(row.AMOUNT)) || 0,
                row.STATUS, row.SERVICE_RM_FLAG,
              ]);
            });
            summaryData.push(['', '', `Item Total: ${item.itemCode}`, '', '', '', '', '', '', '', '', item.total]);
          });
          summaryData.push(['', '', `Supplier Total: ${supp.suppName}`, '', '', '', '', '', '', '', '', supp.total]);
        });
        summaryData.push(['', '', `PO Total: ${po.poNo}`, '', '', '', '', '', '', '', '', po.total]);
      });
      summaryData.push([]);
      summaryData.push(['', '', 'Grand Total', '', '', '', '', '', '', '', '', grandTotal]);
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      ws['!cols'] = [{ wch: 26 }, { wch: 13 }, { wch: 28 }, { wch: 16 }, { wch: 32 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws, 'PO Detail');
      XLSX.writeFile(wb, 'PO_Detail_Register.xlsx');
    } else {
  const summaryData: any[][] = [
    ['PO Summary Register'],
    [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
    [],
    ['PO Number', 'PO Date', 'Supplier Code', 'Supplier Name', 'Amount (QAR)', 'PR Ref No', 'Scope Of Work', 'Payment Term', 'W/O Number', 'Type Of PR', 'Status'],
  ];
  summaryRows.forEach(row => {
    summaryData.push([
      row.poNo, formatDate(row.poDate), row.supplier, row.suppName,
      row.total, row.PR_REF_NO, row.description, row.PAYMENT_TERMS,
      row.WO_NUMBER, row.typeOfPr, row.status,
    ]);
  });
  summaryData.push([]);
  summaryData.push(['', '', '', 'Total:', grandTotal]);
  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  ws['!cols'] = [{ wch: 18 }, { wch: 13 }, { wch: 14 }, { wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'PO Summary');
  XLSX.writeFile(wb, 'PO_Summary_Register.xlsx');
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
      const DTOT = [213, 220, 232] as [number, number, number];
      const body: any[] = [];
      const cellPad = { top: 1.5, bottom: 1.5, left: 5, right: 5 };

      poGroups.forEach(po => {
        po.suppliers.forEach(supp => {
          body.push([{
            content: `PO NO = ${po.poNo}     |     PO Date = ${formatDate(po.poDate)}     |     Supplier = ${supp.suppName}     |     Status = ${po.status}`,
            colSpan: 9,
            styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
          }]);
          supp.items.forEach(item => {
            sortedRows(item.rows).forEach(row => {
              const desc = `${row.ITEM_DESP?.trim() || ''}${row.ADDL_ITEM_DESC?.trim() ? row.ADDL_ITEM_DESC.trim() : ''}`;
              body.push([
                { content: desc, styles: { fontSize: 9, halign: 'left' } },
                { content: row.P_UOM || '', styles: { fontSize: 9 } },
                { content: row.APPR_ITEM_P_QTY ? formatQty(parseFloat(String(row.APPR_ITEM_P_QTY))) : '', styles: { halign: 'right', fontSize: 9 } },
                { content: row.L_UOM || '', styles: { fontSize: 9 } },
                { content: row.APPR_ITEM_L_QTY ? formatQty(parseFloat(String(row.APPR_ITEM_L_QTY))) : '', styles: { halign: 'right', fontSize: 9 } },
                { content: formatAmount(parseFloat(String(row.ITEM_RATE)) || 0), styles: { halign: 'right', fontSize: 9 } },
                { content: formatAmount(parseFloat(String(row.AMOUNT)) || 0), styles: { halign: 'right', fontSize: 9, fontStyle: 'bold' } },
                { content: 'QAR', styles: { fontSize: 9, halign: 'center' } },
                { content: formatAmount(parseFloat(String(row.CURRENCY_RATE)) || 0), styles: { halign: 'right', fontSize: 9 } },
              ]);
            });
          });
        });
        body.push([
          { content: `Total for : ${po.poNo}`, colSpan: 6, styles: { fillColor: DTOT, textColor: NAVY, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } },
          { content: formatAmount(po.total), styles: { fillColor: DTOT, textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
          { content: '', styles: { fillColor: DTOT } },
          { content: '', styles: { fillColor: DTOT } },
        ]);
      });
      body.push([{ content: '', colSpan: 9, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
      body.push([
        { content: 'Grand Total :', colSpan: 6, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
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
      pdf.save('PO_Detail_Register.pdf');
} else {
  const body: any[] = [];
  summaryRows.forEach(row => {
    body.push([
      { content: row.poNo || '', styles: { fontSize: 9, halign: 'left' } },
      { content: formatDate(row.poDate), styles: { fontSize: 9 } },
      { content: row.supplier || '', styles: { fontSize: 9 } },
      { content: row.suppName || '', styles: { fontSize: 9 } },
      { content: formatAmount(row.total), styles: { halign: 'right', fontSize: 9, fontStyle: 'bold' } },
      { content: row.PR_REF_NO || '', styles: { fontSize: 9 } },
      { content: row.description || '', styles: { fontSize: 9 } },
      { content: row.PAYMENT_TERMS || '', styles: { fontSize: 9 } },
      { content: row.WO_NUMBER || '', styles: { fontSize: 9 } },
      { content: row.typeOfPr || '', styles: { fontSize: 9 } },
      { content: row.status || '', styles: { fontSize: 9 } },
    ]);
  });
  body.push([{ content: '', colSpan: 11, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
  body.push([
    { content: 'Total :', colSpan: 4, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
    { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
    { content: '', colSpan: 6, styles: { fillColor: NAVY } },
  ]);

  autoTable(pdf, {
    startY: TABLE_TOP,
    margin: { left: margin, right: margin, top: HEADER_H + 4 },
    columnStyles: {
      0: { cellWidth: 22 }, 1: { cellWidth: 16 }, 2: { cellWidth: 16 }, 3: { cellWidth: 24 },
      4: { cellWidth: 18 }, 5: { cellWidth: 22 }, 6: { cellWidth: 'auto' as any }, 7: { cellWidth: 18 },
      8: { cellWidth: 16 }, 9: { cellWidth: 16 }, 10: { cellWidth: 16 },
    },
    head: [[
      { content: 'PO Number', styles: { halign: 'left', fontSize: 9 } },
      { content: 'PO Date', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Supplier Code', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Supplier Name', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Amount', styles: { halign: 'right', fontSize: 9 } },
      { content: 'PR Ref No', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Scope Of Work', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Payment Term', styles: { halign: 'left', fontSize: 9 } },
      { content: 'W/O Number', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Type Of PR', styles: { halign: 'left', fontSize: 9 } },
      { content: 'Status', styles: { halign: 'left', fontSize: 9 } },
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
  pdf.save('PO_Summary_Register.pdf');
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
  const detailTable = poGroups.length === 0 ? (
    <div className="rp-empty">No records found.</div>
  ) : (
    <table className="po-table">
      <colgroup>
        <col className="c0" /><col className="c1" /><col className="c2" />
        <col className="c3" /><col className="c4" /><col className="c5" />
        <col className="c6" /><col className="c7" /><col className="c8" /><col className="c9" />
      </colgroup>
      <thead>
        <tr className="po-print-logo-row">
          <td colSpan={10}>
            <div className="po-print-logo-flex">
              <img src={companyLogo} alt="Logo" />
              <div className="po-print-meta-text">
                <div><b>Print Date:</b> {printDate}</div>
                <div><b>Print User:</b> {printUser}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr className="po-title-bar"><td colSpan={10}>PO Detail Register</td></tr>
        {filterMetaRow(10, 'po-meta-row')}
        <tr>
          <th className="left" colSpan={2}>Item Code</th>
          <th onClick={() => handleSort('P_UOM')}>PUOM</th>
          <th className="num" onClick={() => handleSort('APPR_ITEM_P_QTY')}>P Qty</th>
          <th onClick={() => handleSort('L_UOM')}>LUOM</th>
          <th className="num" onClick={() => handleSort('APPR_ITEM_L_QTY')}>L Qty</th>
          <th className="num" onClick={() => handleSort('ITEM_RATE')}>Item Rate</th>
          <th className="num" onClick={() => handleSort('AMOUNT')}>Amount</th>
          <th>Currency</th>
          <th className="num" onClick={() => handleSort('CURRENCY_RATE')}>Ex Rate</th>
        </tr>
      </thead>
      <tbody>
        {poGroups.map(po => (
          <React.Fragment key={po.poNo}>
            {po.suppliers.map(supp => (
              <React.Fragment key={`${po.poNo}|||${supp.supplier}`}>
                <tr className="po-banner">
                  <td colSpan={10}>
                    PO NO = {po.poNo} &nbsp;|&nbsp; PO Date = {formatDate(po.poDate)}
                    &nbsp;|&nbsp; Supplier = {supp.suppName} &nbsp;|&nbsp; Status = {po.status}
                  </td>
                </tr>
                {supp.items.map(item => (
                  <React.Fragment key={item.itemCode}>
                    {sortedRows(item.rows).map((row, ri) => (
                      <tr key={`${row.PO_NO}-${row.ITEM_CODE}-${ri}`} className="data-row">
                        <td className="item-desc" colSpan={2}>
                          {row.ITEM_DESP?.trim()}{row.ADDL_ITEM_DESC?.trim() ? row.ADDL_ITEM_DESC?.trim() : ''}
                        </td>
                        <td>{row.P_UOM || ''}</td>
                        <td className="num">{row.APPR_ITEM_P_QTY ? formatQty(parseFloat(String(row.APPR_ITEM_P_QTY))) : ''}</td>
                        <td>{row.L_UOM || ''}</td>
                        <td className="num">{row.APPR_ITEM_L_QTY ? formatQty(parseFloat(String(row.APPR_ITEM_L_QTY))) : ''}</td>
                        <td className="num">{formatAmount(parseFloat(String(row.ITEM_RATE)) || 0)}</td>
                        <td className="num">{formatAmount(parseFloat(String(row.AMOUNT)) || 0)}</td>
                        <td className="currency-cell">QAR</td>
                        <td className="num">{formatAmount(parseFloat(String(row.CURRENCY_RATE)) || 0)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
            <tr className="po-total">
              <td colSpan={8}>Total for : {po.poNo}</td>
              <td className="num">{formatAmount(po.total)}</td>
              <td />
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  const summaryRows = useMemo(() => buildSummaryRows(filteredRows), [filteredRows]);
  // ── Summary table markup ──
const summaryTable = summaryRows.length === 0 ? (
  <div className="rp-empty">No records found.</div>
) : (
  <table className="pos-table">
    <colgroup>
      <col className="c0" /><col className="c1" /><col className="c2" />
      <col className="c3" /><col className="c4" /><col className="c5" /><col className="c6" />
      <col className="c7" /><col className="c8" /><col className="c9" /><col className="c10" /><col className="c11" />
    </colgroup>
    <thead>
      <tr className="pos-print-logo-row">
        <td colSpan={12}>
          <div className="pos-print-logo-flex">
            <img src={companyLogo} alt="Logo" />
            <div className="pos-print-meta-text">
              <div><b>Print Date:</b> {printDate}</div>
              <div><b>Print User:</b> {printUser}</div>
            </div>
          </div>
        </td>
      </tr>
      <tr className="pos-title-bar"><td colSpan={12}>PO Summary Register</td></tr>
      {filterMetaRow(12, 'pos-meta-row')}
      <tr>
        <th className="left">PO Number</th>
        <th className="left">PO Date</th>
        <th className="left">Supplier <br /> Code</th>
        <th className="left">Supplier Name</th>
        <th className="num">Amount</th>
        <th className="left">PR Ref No</th>
        <th className="left">Scope Of Work</th>
        <th className="left">Payment Term</th>
        <th className="left">W/O <br /> Number</th>
        <th className="left">Type Of PR</th>
        <th className="left">Status</th>
      </tr>
    </thead>
    <tbody>
      {summaryRows.map((row, ri) => (
        <tr key={`${row.poNo}-${ri}`} className="data-row">
          <td>{row.poNo}</td>
          <td>{formatDate(row.poDate)}</td>
          <td>{row.supplier}</td>
          <td>{row.suppName}</td>
          <td className="num">{formatAmount(row.total)}</td>
          <td>{row.PR_REF_NO}</td>
          <td>{row.description}</td>
          <td>{row.PAYMENT_TERMS}</td>
          <td>{row.WO_NUMBER}</td>
          <td>{row.typeOfPr}</td>
          <td>{row.status}</td>
        </tr>
      ))}
      <tr className="division-total">
        <td colSpan={4}>Total:</td>
        <td className="num">{formatAmount(grandTotal)}</td>
        <td colSpan={7}></td>
      </tr>
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
              {(['detail', 'summary'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewType(v)}
                  style={{
                    padding: '8px 18px', borderRadius: 7, fontSize: 9, fontWeight: 600,
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
          <ReportParameterForm rows={poReportFields} filters={pending} onChange={setPending} companyCode={user?.company_code} />
        </>
      }
      onGenerate={handleGenerateReport}
      onReset={handleReset}
      generateDisabled={dataLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={viewType === 'detail' ? 'Search PO no / supplier / item…' : 'Search PO no / supplier / project…'}
      onPrint={handlePrint}
      onExcel={handleExcel}
      onPdf={handleDownloadPDF}
      reportContent={tableContent}
showGrandTotal={(viewType === 'detail' ? poGroups.length : summaryRows.length) > 0}      grandTotalValue={formatAmount(grandTotal)}
      css={TABLE_CSS}
    />
  );
};

export default PurchaseOrderReport;