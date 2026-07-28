import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import axiosServices from 'utils/axios';
import { ReportPage } from '../common/ReportPage';
import { ReportParameterForm, ParamFieldConfig } from '../common/ReportParameterForm';
import {
  formatAmount, formatQty, formatDate, parseDateStr, formatFilterValue,
  buildFilterParams, isFiltersActive, normalizeStringList, ReportFilters,
} from '../common/reportHelpers';

// ── Types ────────────────────────────────────────────────
type PORow = {
  PO_NO: string; PO_DATE: string; SUPPLIER: string; SERVICE_RM_FLAG: string;
  SUPP_NAME: string; STATUS: string; ITEM_CODE: string; ADDL_ITEM_DESC: string;
  ITEM_DESP: string; P_UOM: string; APPR_ITEM_P_QTY: number; L_UOM: string;
  APPR_ITEM_L_QTY: number; ITEM_RATE: number; CURRENCY_RATE: number; AMOUNT: number;
  PROJECT_NAME: string; CONTACT_NUMBER: string; COMPANY_LOGO_AWSURL: string;
  MAIL_EMAIL: string; COMPANY_NAME: string; DIV_CODE: string;
};

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

// ── Small helper so each field only has to say endpoint + keys — this is what
//    "fetchOptions" resolves to for the common case of "GET + normalize".
//    A field that needs something else (POST, a different client, a static
//    list) just writes its own function instead of calling this. ──────────
const getOptions = (endpoint: string, responseKeys: string[]) =>
  (filters: ReportFilters, companyCode?: string) =>
    axiosServices
      .get(`${endpoint}?${buildFilterParams(companyCode, filters)}`)
      .then(res => normalizeStringList(res.data, responseKeys));

// ── Parameter config for THIS report — every other report just writes its own ──
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

// ── CSS specific to this report's table — passed into <ReportPage css={...}/>.
//    Reports that don't need a custom table layout can simply omit this prop
//    and get the plain default look from ReportPage. ──────────────────────
const PO_TABLE_CSS = `
  .po-print-logo-row td { padding: 10px 24px; }
  .po-print-logo-flex { display: flex; justify-content: space-between; align-items: center; }
  .po-print-logo-flex img { height: 44px; width: auto; object-fit: contain; }
  .po-print-meta-text { text-align: right; font-size: 11px; color: #6b7280; line-height: 1.8; }
  .po-title-bar td { background: #1e3a5f; color: #fff; text-align: center; padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }
  .po-meta-row td { padding: 9px 24px; background: #f9fafb; font-size: 12px; color: #6b7280; }

  table.po-table { width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed; }
  .po-table col.c0 { width: 15%; } .po-table col.c1 { width: 15%; } .po-table col.c2 { width: 7%; }
  .po-table col.c3 { width: 8%; } .po-table col.c4 { width: 7%; } .po-table col.c5 { width: 8%; }
  .po-table col.c6 { width: 10%; } .po-table col.c7 { width: 11%; } .po-table col.c8 { width: 8%; } .po-table col.c9 { width: 6%; }

  .po-table th, .po-table td { border: 1px solid #9d9db3; padding: 7px 10px; vertical-align: top; }
  .po-table thead th { background: #d9d6e8; color: #1f1f2e; font-weight: 700; font-size: 12.5px; text-align: center; white-space: nowrap; cursor: pointer; user-select: none; }
  .po-table thead th:hover { background: #cbc7e0; }
  .po-table thead th.num { text-align: right; }
  .po-table thead th.left { text-align: left; padding-left: 12px; }

  .po-table tr.po-banner td { background: #fff; font-weight: 700; font-size: 12.5px; color: #111; padding: 8px 10px; }
  .po-table tr.data-row td { background: #fff; color: #1f1f2e; vertical-align: top; line-height: 1.55; }
  .po-table tr.data-row td.item-desc { white-space: pre-line; }
  .po-table tr.data-row td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .po-table tr.data-row td.currency-cell { text-align: center; white-space: nowrap; }

  .po-table tr.item-total td, .po-table tr.supp-total td, .po-table tr.po-total td { background: #ece9f3; font-weight: 700; color: #1e3a5f; }
  .po-table tr.item-total td { font-size: 12px; }
  .po-table tr.supp-total td, .po-table tr.po-total td { font-size: 12.5px; }

  @media print {
    table.po-table thead { display: table-header-group; }
    table.po-table tr { page-break-inside: avoid; }
  }
`;

const PurchaseOrderReport: React.FC = () => {
  const { user } = useAuth();

  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [applied, setApplied] = useState<ReportFilters>(EMPTY_FILTERS);
  const [pending, setPending] = useState<ReportFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig>({ col: null, dir: 'asc' });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;
  const appliedFiltersRef = useRef<ReportFilters>(EMPTY_FILTERS);

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
        if (
          !r.PO_NO?.toLowerCase().includes(q) &&
          !r.SUPP_NAME?.toLowerCase().includes(q) &&
          !r.ITEM_CODE?.toLowerCase().includes(q) &&
          !r.ITEM_DESP?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [allRows, applied, search]);

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
  const grandTotal = poGroups.reduce((s, p) => s + p.total, 0);
  const filtersActive = isFiltersActive(applied, search);

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

  // ── Excel Export (unchanged) ──
  const handleExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
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
  };

// ── PDF Export (now mirrors the on-screen report table exactly) ──
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;
    const NAVY = [30, 58, 95] as [number, number, number];
    const DTOT = [213, 220, 232] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];
    const DARK = [55, 65, 81] as [number, number, number];
    const BORDER = [209, 213, 219] as [number, number, number];

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
      pdf.text('PO Detail Register', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      if (pg === 1 && filtersActive) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(107, 114, 128);
        const parts = Object.entries(applied)
          .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFilterValue(v as string | string[])}`)
          .join(' | ');
        if (parts) pdf.text(`Filter: ${parts}`, margin, TABLE_TOP - 2);
      }
    };

const body: any[] = [];
    const cellPad = { top: 1.5, bottom: 1.5, left: 5, right: 5 }; // tightened from 3.5/3.5

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
      columnStyles: {
        0: { cellWidth: 'auto' as any },
        1: { cellWidth: 16 },
        2: { cellWidth: 18 },
        3: { cellWidth: 16 },
        4: { cellWidth: 18 },
        5: { cellWidth: 22 },
        6: { cellWidth: 24 },
        7: { cellWidth: 18 },
        8: { cellWidth: 18 },
      },
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
  };

  // ── The PO-specific table markup. This is the only piece that changes
  //    report to report — everything else comes from <ReportPage/>. ──────
  const tableContent = poGroups.length === 0 ? (
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
        {filtersActive && (
          <tr className="po-meta-row">
            <td colSpan={10}>
              <b>Filter:</b>{' '}
              {[
                ...Object.entries(applied)
                  .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
                  .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFilterValue(v as string | string[])}`),
                ...(search.trim() ? [`search: "${search.trim()}"`] : []),
              ].join(' | ')}
            </td>
          </tr>
        )}
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

  return (
    <ReportPage
      title="PO Detail Register"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      hasGeneratedReport={hasGeneratedReport}
      dataLoading={dataLoading}
      filtersActive={filtersActive}
      paramsContent={<ReportParameterForm rows={poReportFields} filters={pending} onChange={setPending} companyCode={user?.company_code} />}
      onGenerate={handleGenerateReport}
      onReset={handleReset}
      generateDisabled={dataLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search PO no / supplier / item…"
      onPrint={handlePrint}
      onExcel={handleExcel}
      onPdf={handleDownloadPDF}
      reportContent={tableContent}
      showGrandTotal={poGroups.length > 0}
      grandTotalValue={formatAmount(grandTotal)}
      css={PO_TABLE_CSS}
    />
  );
};

export default PurchaseOrderReport;