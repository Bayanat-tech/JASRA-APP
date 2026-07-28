import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import axiosServices from 'utils/axios';
import { ReportParameterForm, ParamFieldConfig } from '../common/ReportParameterForm';
import {
  formatAmount, formatQty, formatDate, parseDateStr, formatFilterValue,
  buildFilterParams, isFiltersActive, ReportFilters,
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

// ── Parameter config for THIS report — every other report just writes its own ──
const poReportFields: ParamFieldConfig[][] = [
  [
    { type: 'multiselect', key: 'div_code', label: 'Div Code', endpoint: '/api/report/div-codes', responseKeys: ['DIV_CODE', 'div_code', 'value', 'label'], placeholder: 'Div Code' },
    { type: 'multiselect', key: 'ref_doc_no', label: 'PO Number', endpoint: '/api/report/po-no', responseKeys: ['PO_NO', 'po_no', 'poNo', 'value', 'label'], placeholder: 'PO NO' },
    { type: 'multiselect', key: 'project_name', label: 'Project Name', endpoint: '/api/report/project-names', responseKeys: ['PROJECT_NAME', 'project_name', 'value', 'label'], placeholder: 'All Projects' },
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
    { type: 'multiselect', key: 'supp_name', label: 'Supplier', endpoint: '/api/report/supplier-names', responseKeys: ['SUPP_NAME', 'supp_name', 'value', 'label'], placeholder: 'All Suppliers' },
    { type: 'multiselect', key: 'status', label: 'Status', endpoint: '/api/report/status-options', responseKeys: ['STATUS', 'status', 'value', 'label'], placeholder: 'All Statuses' },
  ],
];

const EMPTY_FILTERS: ReportFilters = {
  supp_name: [], status: [], ref_doc_no: [], project_name: [],
  amount_from: '', amount_to: '', date_from: '', date_to: '', div_code: [],
};

const PurchaseOrderReport: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
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

  // ── PDF Export (unchanged logic — jsPDF paginates & repeats its own header via didDrawPage) ──
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;
    const NAVY = [30, 58, 95] as [number, number, number];
    const SUPP = [232, 236, 242] as [number, number, number];
    const ITEM = [241, 244, 248] as [number, number, number];
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
    const cellPad = { top: 3.5, bottom: 3.5, left: 5, right: 5 };
    const indPad1 = { top: 3, bottom: 3, left: 12, right: 5 };
    const indPad2 = { top: 2.5, bottom: 2.5, left: 20, right: 5 };

    poGroups.forEach(po => {
      body.push([{
        content: `PO No :  ${po.poNo}     |     Date : ${formatDate(po.poDate)}     |     Status : ${po.status}     |     Type : ${po.serviceFlag}`,
        colSpan: 9, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
      }]);
      po.suppliers.forEach(supp => {
        body.push([{ content: `Supplier :  ${supp.suppName}`, colSpan: 9, styles: { fillColor: SUPP, textColor: NAVY, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } }]);
        supp.items.forEach(item => {
          body.push([{ content: `Item :  ${item.itemCode}  —  ${item.itemDesp}${item.addlDesc ? '  (' + item.addlDesc + ')' : ''}`, colSpan: 9, styles: { fillColor: ITEM, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 } }]);
          sortedRows(item.rows).forEach(row => {
            body.push([
              { content: row.P_UOM, styles: { fontSize: 8 } },
              { content: formatQty(parseFloat(String(row.APPR_ITEM_P_QTY)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: row.L_UOM, styles: { fontSize: 8 } },
              { content: formatQty(parseFloat(String(row.APPR_ITEM_L_QTY)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: formatAmount(parseFloat(String(row.ITEM_RATE)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: 'QAR', styles: { fontSize: 8 } },
              { content: formatAmount(parseFloat(String(row.CURRENCY_RATE)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: formatAmount(parseFloat(String(row.AMOUNT)) || 0), styles: { halign: 'right', fontSize: 8, fontStyle: 'bold' } },
              { content: row.PROJECT_NAME || '-', styles: { fontSize: 7.5 } },
            ]);
          });
            body.push([
              { content: `Item Total :  ${item.itemCode}`, colSpan: 7, styles: { fillColor: ITEM, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 } },
              { content: formatAmount(item.total), styles: { fillColor: ITEM, textColor: DARK, fontStyle: 'bold', halign: 'right', fontSize: 8.5 } },
              { content: '', styles: { fillColor: ITEM } },
            ]);
        });
        body.push([
          { content: `Supplier Total :  ${supp.suppName}`, colSpan: 7, styles: { fillColor: SUPP, textColor: NAVY, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } },
          { content: formatAmount(supp.total), styles: { fillColor: SUPP, textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9 } },
          { content: '', styles: { fillColor: SUPP } },
        ]);
      });
      body.push([
        { content: `PO Total :  ${po.poNo}`, colSpan: 7, styles: { fillColor: DTOT, textColor: NAVY, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } },
        { content: formatAmount(po.total), styles: { fillColor: DTOT, textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        { content: '', styles: { fillColor: DTOT } },
      ]);
    });
    body.push([{ content: '', colSpan: 9, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
    body.push([
      { content: 'Grand Total :', colSpan: 7, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: '', styles: { fillColor: NAVY } },
    ]);

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: {
        0: { cellWidth: 18 }, 1: { cellWidth: 20 }, 2: { cellWidth: 18 }, 3: { cellWidth: 20 },
        4: { cellWidth: 26 }, 5: { cellWidth: 16 }, 6: { cellWidth: 26 }, 7: { cellWidth: 28 }, 8: { cellWidth: 'auto' as any },
      },
      head: [[
        { content: 'PUOM', styles: { halign: 'left', fontSize: 9 } },
        { content: 'P Qty', styles: { halign: 'right', fontSize: 9 } },
        { content: 'LUOM', styles: { halign: 'left', fontSize: 9 } },
        { content: 'L Qty', styles: { halign: 'right', fontSize: 9 } },
        { content: 'Item Rate', styles: { halign: 'right', fontSize: 9 } },
        { content: 'Currency', styles: { halign: 'left', fontSize: 9 } },
        { content: 'Ex Rate', styles: { halign: 'right', fontSize: 9 } },
        { content: 'Amount', styles: { halign: 'right', fontSize: 9 } },
        { content: 'Project', styles: { halign: 'left', fontSize: 9 } },
      ]],
      body,
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
      bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'ellipsize', minCellHeight: 0 },
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .po-shell { font-family: 'DM Sans', sans-serif; background: #f4f6f9; height: 100vh; display: flex; flex-direction: column; padding: 14px 28px; box-sizing: border-box; overflow: hidden; }

        .po-tabbar { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 5px; margin-bottom: 14px; flex-shrink: 0; }
        .po-tab { flex: 1; padding: 9px 14px; border-radius: 7px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: 'DM Sans', sans-serif; transition: background 0.15s; background: transparent; color: #374151; }
        .po-tab.active { background: #1e3a5f; color: #fff; }
        .po-tab:disabled { color: #9ca3af; cursor: not-allowed; }
        .po-tab-badge { font-size: 9.5px; padding: 1px 7px; border-radius: 10px; font-weight: 600; background: #dcfce7; color: #16a34a; }
        .po-tab.active .po-tab-badge { background: rgba(255,255,255,0.25); color: #fff; }

        .po-param-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 22px 24px; overflow-y: auto; }
        .po-param-title { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
        .po-param-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }

        /* Report tab occupies all remaining height; only .po-report-scroll scrolls */
        .po-report-root { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .po-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; background: #fff; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; gap: 12px; }
        .po-toolbar-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .po-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }
        .po-btn { padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
        .po-btn-ghost { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
        .po-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
        .po-btn-primary { border: none; background: #1e3a5f; color: #fff; }
        .po-btn-primary:hover { background: #162d4a; }
        .po-btn-success { border: none; background: #16a34a; color: #fff; }
        .po-btn-success:hover { background: #15803d; }

        .po-search { padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111; outline: none; width: 240px; background: #fff; }
        .po-search:focus { border-color: #1e3a5f; }
        .po-search-wrap { position: relative; display: flex; align-items: center; }
        .po-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }

        /* THE scroll container — full remaining height, only this scrolls */
        .po-report-scroll { flex: 1; min-height: 0; overflow-y: auto; margin-top: 12px; }
        .po-page { background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; }

        .po-grand-total-bar { background: #1e3a5f; border-radius: 8px; border: 1px solid #1e3a5f; overflow: hidden; margin-top: 10px; flex-shrink: 0; }
        .po-grand-total-bar table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .po-grand-total-bar td { padding: 11px 14px; font-weight: 700; color: #fff; }
        .po-grand-total-bar td.num { text-align: right; font-variant-numeric: tabular-nums; }

        /* ── Print header content, rendered as rows inside <thead> so it repeats each printed page ── */
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

        .po-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

        /* ── Print: only the report table prints; thead (logo + title + headers) repeats on every page ── */
        @media print {
          @page { margin: 10mm; size: A4 landscape; }
          .po-tabbar, .po-toolbar, .no-print, .po-grand-total-bar, .po-param-card { display: none !important; }
          .po-shell { height: auto; overflow: visible; padding: 0; background: #fff; }
          .po-report-root { flex: none; }
          .po-report-scroll { overflow: visible; height: auto; max-height: none; margin-top: 0; }
          .po-page { border: none; border-radius: 0; }
          table.po-table thead { display: table-header-group; }
          table.po-table tr { page-break-inside: avoid; }
        }
      `}</style>

      <div className="po-shell">
        <div className="po-tabbar no-print">
          <button className={`po-tab ${activeTab === 'parameters' ? 'active' : ''}`} onClick={() => setActiveTab('parameters')}>
            ⚙ Parameters
          </button>
          <button
            className={`po-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => hasGeneratedReport && setActiveTab('report')}
            disabled={!hasGeneratedReport}
            title={hasGeneratedReport ? undefined : 'Generate a report first'}
          >
            📊 Report{hasGeneratedReport && <span className="po-tab-badge">Generated</span>}
          </button>
        </div>

        {activeTab === 'parameters' && (
          <div className="po-param-card">
            <div className="po-param-title">
              PO Detail Register
              {hasGeneratedReport && <span className="po-tab-badge">Report Generated</span>}
            </div>
            <ReportParameterForm rows={poReportFields} filters={pending} onChange={setPending} companyCode={user?.company_code} />
            <div className="po-param-actions">
              <button className="po-btn po-btn-ghost" onClick={handleReset} disabled={dataLoading}>Reset</button>
              <button className="po-btn po-btn-primary" onClick={handleGenerateReport} disabled={dataLoading}>
                {dataLoading ? 'Loading data…' : 'Generate Report'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'report' && hasGeneratedReport && (
          <div className="po-report-root">
            <div className="po-toolbar no-print">
              <div className="po-toolbar-left">
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>PO Detail Register</span>
                {filtersActive && (
                  <span style={{ fontSize: 11, background: '#eef2f7', color: '#1e3a5f', borderRadius: 4, padding: '3px 9px', fontWeight: 600 }}>Filtered</span>
                )}
                <div className="po-search-wrap">
                  <span className="po-search-icon">🔍</span>
                  <input className="po-search" placeholder="Search PO no / supplier / item…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="po-toolbar-right">
                <button className="po-btn po-btn-ghost" onClick={handlePrint}>🖨 Print</button>
                <button className="po-btn po-btn-success" onClick={handleExcel}>📊 Excel</button>
                <button className="po-btn po-btn-primary" onClick={handleDownloadPDF}>⬇ PDF</button>
              </div>
            </div>

            {/* Only this div scrolls; on print, overflow is reset so the browser paginates normally */}
            <div className="po-report-scroll">
              <div className="po-page" ref={printRef}>
                {dataLoading ? (
                  <div className="po-empty">Loading data…</div>
                ) : poGroups.length === 0 ? (
                  <div className="po-empty">No records found.</div>
                ) : (
                  <table className="po-table">
                    <colgroup>
                      <col className="c0" /><col className="c1" /><col className="c2" />
                      <col className="c3" /><col className="c4" /><col className="c5" />
                      <col className="c6" /><col className="c7" /><col className="c8" /><col className="c9" />
                    </colgroup>
                    <thead>
                      {/* Logo + print meta — repeats on every printed page */}
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
                                  {/* <tr className="item-total">
                                    <td colSpan={8}>Item Total : {item.itemCode}</td>
                                    <td className="num">{formatAmount(item.total)}</td>
                                    <td />
                                  </tr> */}
                                </React.Fragment>
                              ))}
                              {/* <tr className="supp-total">
                                <td colSpan={8}>Supplier Total : {supp.suppName}</td>
                                <td className="num">{formatAmount(supp.total)}</td>
                                <td />
                              </tr> */}
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
                )}
              </div>
            </div>

            {!dataLoading && poGroups.length > 0 && (
              <div className="po-grand-total-bar no-print">
                <table>
                  <tbody>
                    <tr>
                      <td colSpan={7}>Grand Total :</td>
                      <td className="num">{formatAmount(grandTotal)}</td>
                      <td style={{ width: 120 }} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PurchaseOrderReport;