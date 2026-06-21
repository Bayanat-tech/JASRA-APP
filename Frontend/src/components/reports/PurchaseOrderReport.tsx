// import React from 'react';
// import PfReportView from './PfReportView';
// //Po Register (Summary)
// const PurchaseOrderReport: React.FC = () => {
//   return <PfReportView reportPath="d0568077-6f2a-47fa-9552-cdc0ff7adaea" />;
// };

// export default PurchaseOrderReport;

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';

// ── Types ────────────────────────────────────────────────
type PORow = {
  PO_NO:             string;
  PO_DATE:           string;
  SUPPLIER:          string;
  SERVICE_RM_FLAG:   string;
  SUPP_NAME:         string;
  STATUS:            string;
  ITEM_CODE:         string;
  ADDL_ITEM_DESC:    string;
  ITEM_DESP:         string;
  P_UOM:             string;
  APPR_ITEM_P_QTY:   number;
  L_UOM:             string;
  APPR_ITEM_L_QTY:   number;
  ITEM_RATE:         number;
  CURRENCY_RATE:     number;
  AMOUNT:            number;
  PROJECT_NAME:      string;
  CONTACT_NUMBER:    string;
  COMPANY_LOGO_AWSURL: string;
  MAIL_EMAIL:        string;
  COMPANY_NAME:      string;
};

type ItemGroup   = { itemCode: string; itemDesp: string; addlDesc: string; rows: PORow[]; total: number };
type SupplierGroup = { suppName: string; supplier: string; items: ItemGroup[]; total: number };
type POGroup     = { poNo: string; poDate: string; status: string; serviceFlag: string; suppliers: SupplierGroup[]; total: number };

type Filters = {
  supp_name:   string;
  status:      string;
  ref_doc_no:  string;
  amount_from: string;
  amount_to:   string;
  date_from:   string;
  date_to:     string;
};

type FilterOptions = {
  suppNames: string[];
  statuses:  string[];
};

type SortConfig = { col: keyof PORow | null; dir: 'asc' | 'desc' };

// ── Helpers ───────────────────────────────────────────────
function formatAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatQty(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
function formatDate(d: string) {
  if (!d) return '-';
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function parseDateStr(d: string): number {
  if (!d) return 0;
  return new Date(d).getTime() || 0;
}

// ── Grouping: PO → Supplier → Item ───────────────────────
function groupRows(rows: PORow[]): POGroup[] {
  const poMap: Record<string, any> = {};
  for (const r of rows) {
    const poKey   = r.PO_NO;
    const suppKey = r.SUPP_NAME || r.SUPPLIER || 'Unknown Supplier';
    const itemKey = r.ITEM_CODE || r.ITEM_DESP || 'N/A';
    const amount  = parseFloat(String(r.AMOUNT)) || 0;

    if (!poMap[poKey])
      poMap[poKey] = { poNo: r.PO_NO, poDate: r.PO_DATE, status: r.STATUS, serviceFlag: r.SERVICE_RM_FLAG, suppliers: {}, total: 0 };
    if (!poMap[poKey].suppliers[suppKey])
      poMap[poKey].suppliers[suppKey] = { suppName: suppKey, supplier: r.SUPPLIER, items: {}, total: 0 };
    if (!poMap[poKey].suppliers[suppKey].items[itemKey])
      poMap[poKey].suppliers[suppKey].items[itemKey] = { itemCode: r.ITEM_CODE, itemDesp: r.ITEM_DESP, addlDesc: r.ADDL_ITEM_DESC, rows: [], total: 0 };

    poMap[poKey].suppliers[suppKey].items[itemKey].rows.push(r);
    poMap[poKey].suppliers[suppKey].items[itemKey].total += amount;
    poMap[poKey].suppliers[suppKey].total               += amount;
    poMap[poKey].total                                  += amount;
  }
  return Object.values(poMap).map((po: any) => ({
    ...po,
    suppliers: Object.values(po.suppliers).map((s: any) => ({
      ...s,
      items: Object.values(s.items),
    })),
  }));
}

// ── Sort Arrow ────────────────────────────────────────────
function SortArrow({ col, sort }: { col: keyof PORow; sort: SortConfig }) {
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
            <span style={{ fontSize: 16, color: '#1e3a5f' }}>⚙</span>
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

          {/* PO Number search */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PO Number</label>
            <input
              type="text"
              placeholder="Search PO No…"
              value={filters.ref_doc_no}
              onChange={e => onChange({ ...filters, ref_doc_no: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Date Range */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PO Date From</label>
            <input type="date" value={filters.date_from} onChange={e => onChange({ ...filters, date_from: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PO Date To</label>
            <input type="date" value={filters.date_to} onChange={e => onChange({ ...filters, date_to: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Amount Range */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount From</label>
            <input type="number" placeholder="0" value={filters.amount_from} onChange={e => onChange({ ...filters, amount_from: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Amount To</label>
            <input type="number" placeholder="No limit" value={filters.amount_to} onChange={e => onChange({ ...filters, amount_to: e.target.value })}
              style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Dropdowns */}
          {([
            { label: 'Supplier',  key: 'supp_name', opts: options.suppNames },
            { label: 'Status',    key: 'status',    opts: options.statuses  },
          ] as { label: string; key: keyof Filters; opts: string[] }[]).map(({ label, key, opts }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <select value={filters[key]} onChange={e => onChange({ ...filters, [key]: e.target.value })}
                style={{ width: '100%', padding: '9px 10px', fontSize: 13, color: '#111', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', outline: 'none', cursor: 'pointer' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#1e3a5f')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#d1d5db')}>
                <option value="">All</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px 40px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10, background: '#fafafa' }}>
          <button onClick={onReset} style={{ flex: 1, padding: '9px', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>Reset</button>
          <button onClick={() => { onApply(); onClose(); }} style={{ flex: 2, padding: '9px', border: 'none', borderRadius: 7, background: '#1e3a5f', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700 }}>Apply Filters</button>
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────
const PurchaseOrderReport: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const EMPTY_FILTERS: Filters = { supp_name: '', status: '', ref_doc_no: '', amount_from: '', amount_to: '', date_from: '', date_to: '' };
  const [panelOpen, setPanelOpen] = useState(false);
  const [applied,   setApplied]   = useState<Filters>(EMPTY_FILTERS);
  const [pending,   setPending]   = useState<Filters>(EMPTY_FILTERS);

  const [collapsedPOs,   setCollapsedPOs]   = useState<Set<string>>(new Set());
  const [collapsedSupps, setCollapsedSupps] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [sort,   setSort]   = useState<SortConfig>({ col: null, dir: 'asc' });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;

  // ── Fetch all rows (no server-side filter for client-side flexibility) ──
  const { data: allRows = [], isLoading } = useQuery<PORow[]>({
    queryKey: ['po_detail_register'],
queryFn: async () => {
const sql = `
  SELECT
      r.ref_doc_no    AS PO_NO,
      r.doc_date      AS PO_DATE,
      r.supplier,
      r.SERVICE_RM_FLAG,
      r.supp_name,
      r.status,
      r.item_code,
      r.addl_item_desc,
      r.item_desp,
      r.p_uom,
      r.appr_item_p_qty,
      r.l_uom,
      r.appr_item_l_qty,
      r.item_rate,
      r.currency_rate,
      r.amount,
      r.project_name
  FROM VW_BO_PO_REGISTER_JASRA r
`;
  const sqlCount = `SELECT COUNT(*) AS CNT FROM VW_BO_PO_REGISTER_JASRA`;
  console.log(sqlCount, "sqlCount")
  const response = await WmsSerivceInstance.executeRawSql(sql);
  console.log('RAW RESPONSE:', response);        // <-- add this
  console.log('TYPE:', typeof response);         // <-- and this
  return (response as PORow[]) || [];
},
  });

  // ── Filter options ──
  const filterOptions: FilterOptions = useMemo(() => {
    const uniq = (key: keyof PORow) =>
      [...new Set(allRows.map(r => r[key]).filter(Boolean))].sort() as string[];
    return { suppNames: uniq('SUPP_NAME'), statuses: uniq('STATUS') };
  }, [allRows]);

  // ── Client-side filtering ──
  const filteredRows = useMemo(() => {
    return allRows.filter(r => {
      if (applied.supp_name && r.SUPP_NAME !== applied.supp_name) return false;
      if (applied.status    && r.STATUS    !== applied.status)    return false;
      if (applied.ref_doc_no) {
        const q = applied.ref_doc_no.toLowerCase();
        if (!r.PO_NO?.toLowerCase().includes(q)) return false;
      }
      if (applied.amount_from) {
        if ((parseFloat(String(r.AMOUNT)) || 0) < parseFloat(applied.amount_from)) return false;
      }
      if (applied.amount_to) {
        if ((parseFloat(String(r.AMOUNT)) || 0) > parseFloat(applied.amount_to)) return false;
      }
      if (applied.date_from) {
        const from = new Date(applied.date_from).getTime();
        if (parseDateStr(r.PO_DATE) < from) return false;
      }
      if (applied.date_to) {
        const to = new Date(applied.date_to).getTime() + 86400000 - 1;
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

  // ── Sort ──
  const sortedRows = useCallback((rows: PORow[]) => {
    if (!sort.col) return rows;
    return [...rows].sort((a, b) => {
      const col = sort.col!;
      let aVal: any = a[col];
      let bVal: any = b[col];
      if (col === 'PO_DATE') { aVal = parseDateStr(aVal); bVal = parseDateStr(bVal); }
      else if (['AMOUNT', 'ITEM_RATE', 'APPR_ITEM_P_QTY', 'APPR_ITEM_L_QTY', 'CURRENCY_RATE'].includes(col)) {
        aVal = parseFloat(String(aVal)) || 0; bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase(); bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1  : -1;
      return 0;
    });
  }, [sort]);

  const poGroups   = useMemo(() => groupRows(filteredRows), [filteredRows]);
  const grandTotal = poGroups.reduce((s, p) => s + p.total, 0);
  const isFiltered = Object.values(applied).some(Boolean) || search.trim().length > 0;

  // ── Collapse helpers ──
  const togglePO   = (key: string) => setCollapsedPOs(prev   => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const toggleSupp = (key: string) => setCollapsedSupps(prev  => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const allPOKeys   = poGroups.map(p => p.poNo);
  const allSuppKeys = poGroups.flatMap(p => p.suppliers.map(s => `${p.poNo}|||${s.supplier}`));
  const allCollapsed = collapsedPOs.size === allPOKeys.length;

  const handleCollapseAll = () => {
    if (allCollapsed) {
      setCollapsedPOs(new Set());
      setCollapsedSupps(new Set());
    } else {
      setCollapsedPOs(new Set(allPOKeys));
      setCollapsedSupps(new Set(allSuppKeys));
    }
  };

  const handleSort = (col: keyof PORow) => {
    setSort(prev => prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' });
  };

  const handlePrint = () => window.print();

  // ── Excel Export ──
  const handleExcel = async () => {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

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
              row.PO_NO,
              formatDate(row.PO_DATE),
              row.SUPP_NAME,
              row.ITEM_CODE,
              row.ITEM_DESP,
              row.P_UOM,
              parseFloat(String(row.APPR_ITEM_P_QTY)) || 0,
              row.L_UOM,
              parseFloat(String(row.APPR_ITEM_L_QTY)) || 0,
              parseFloat(String(row.ITEM_RATE)) || 0,
              parseFloat(String(row.CURRENCY_RATE)) || 0,
              parseFloat(String(row.AMOUNT)) || 0,
              row.STATUS,
              row.SERVICE_RM_FLAG,
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
    ws['!cols'] = [
      { wch: 26 }, { wch: 13 }, { wch: 28 }, { wch: 16 }, { wch: 32 },
      { wch: 8  }, { wch: 10 }, { wch: 8  }, { wch: 10 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'PO Detail');
    XLSX.writeFile(wb, 'PO_Detail_Register.xlsx');
  };

  // ── PDF Download ──
  const handleDownloadPDF = async () => {
    const { jsPDF }            = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY  = [30, 58, 95]    as [number, number, number];
    const SUPP  = [232, 236, 242] as [number, number, number];
    const ITEM  = [241, 244, 248] as [number, number, number];
    const DTOT  = [213, 220, 232] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];
    const DARK  = [55, 65, 81]    as [number, number, number];
    const NVYTX = [30, 58, 95]    as [number, number, number];
    const BORDER= [209, 213, 219] as [number, number, number];

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
      pdf.text('PO Detail Register', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      if (pg === 1 && isFiltered) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(107, 114, 128);
        const parts = Object.entries(applied).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ');
        if (parts) pdf.text(`Filter: ${parts}`, margin, TABLE_TOP - 2);
      }
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5, right: 5 };
    const indPad1 = { top: 3,   bottom: 3,   left: 12, right: 5 };
    const indPad2 = { top: 2.5, bottom: 2.5, left: 20, right: 5 };

    poGroups.forEach(po => {
      // PO header row
      body.push([{
        content: `PO No :  ${po.poNo}     |     Date : ${formatDate(po.poDate)}     |     Status : ${po.status}     |     Type : ${po.serviceFlag}`,
        colSpan: 9,
        styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
      }]);

      po.suppliers.forEach(supp => {
        body.push([{
          content: `Supplier :  ${supp.suppName}`,
          colSpan: 9,
          styles: { fillColor: SUPP, textColor: NVYTX, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 },
        }]);

        supp.items.forEach(item => {
          body.push([{
            content: `Item :  ${item.itemCode}  —  ${item.itemDesp}${item.addlDesc ? '  (' + item.addlDesc + ')' : ''}`,
            colSpan: 9,
            styles: { fillColor: ITEM, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 },
          }]);

          sortedRows(item.rows).forEach(row => {
            body.push([
              { content: row.P_UOM,  styles: { fontSize: 8 } },
              { content: formatQty(parseFloat(String(row.APPR_ITEM_P_QTY)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: row.L_UOM,  styles: { fontSize: 8 } },
              { content: formatQty(parseFloat(String(row.APPR_ITEM_L_QTY)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: formatAmount(parseFloat(String(row.ITEM_RATE)) || 0), styles: { halign: 'right', fontSize: 8 } },
              { content: 'QAR',      styles: { fontSize: 8 } },
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
          { content: `Supplier Total :  ${supp.suppName}`, colSpan: 7, styles: { fillColor: SUPP, textColor: NVYTX, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } },
          { content: formatAmount(supp.total), styles: { fillColor: SUPP, textColor: NVYTX, fontStyle: 'bold', halign: 'right', fontSize: 9 } },
          { content: '', styles: { fillColor: SUPP } },
        ]);
      });

      body.push([
        { content: `PO Total :  ${po.poNo}`, colSpan: 7, styles: { fillColor: DTOT, textColor: NVYTX, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } },
        { content: formatAmount(po.total), styles: { fillColor: DTOT, textColor: NVYTX, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        { content: '', styles: { fillColor: DTOT } },
      ]);
    });

    body.push([{
      content: '',
      colSpan: 9,
      styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } },
    }]);
    body.push([
      { content: 'Grand Total :', colSpan: 7, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: '', styles: { fillColor: NAVY } },
    ]);

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: {
        0: { cellWidth: 18 }, // PUOM
        1: { cellWidth: 20 }, // P Qty
        2: { cellWidth: 18 }, // LUOM
        3: { cellWidth: 20 }, // L Qty
        4: { cellWidth: 26 }, // Item Rate
        5: { cellWidth: 16 }, // Currency
        6: { cellWidth: 26 }, // Ex Rate
        7: { cellWidth: 28 }, // Amount
        8: { cellWidth: 'auto' as any }, // Project
      },
      head: [[
        { content: 'PUOM',       styles: { halign: 'left',  fontSize: 9 } },
        { content: 'P Qty',      styles: { halign: 'right', fontSize: 9 } },
        { content: 'LUOM',       styles: { halign: 'left',  fontSize: 9 } },
        { content: 'L Qty',      styles: { halign: 'right', fontSize: 9 } },
        { content: 'Item Rate',  styles: { halign: 'right', fontSize: 9 } },
        { content: 'Currency',   styles: { halign: 'left',  fontSize: 9 } },
        { content: 'Ex Rate',    styles: { halign: 'right', fontSize: 9 } },
        { content: 'Amount',     styles: { halign: 'right', fontSize: 9 } },
        { content: 'Project',    styles: { halign: 'left',  fontSize: 9 } },
      ]],
      body,
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
      bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'ellipsize', minCellHeight: 0 },
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

    pdf.save('PO_Detail_Register.pdf');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
    
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .po-report-root {
          font-family: 'DM Sans', sans-serif;
          background: #f4f6f9;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── Toolbar ── */
        .po-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 28px; background: #fff; border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0; z-index: 100; gap: 12px;
        }
        .po-toolbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .po-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }
        .po-btn {
          padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .po-btn-ghost   { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
        .po-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
        .po-btn-primary { border: none; background: #1e3a5f; color: #fff; }
        .po-btn-primary:hover { background: #162d4a; }
        .po-btn-success { border: none; background: #16a34a; color: #fff; }
        .po-btn-success:hover { background: #15803d; }
        .po-btn-filter  { border: 1.5px solid #d1d5db; background: #fff; color: #374151; position: relative; }
        .po-btn-filter.active { border-color: #1e3a5f; color: #1e3a5f; background: #eef2f7; }
        .filter-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
          position: absolute; top: 5px; right: 5px;
        }

        /* Search */
        .po-search {
          padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px;
          font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111;
          outline: none; width: 240px; background: #fff; transition: border-color 0.15s;
        }
        .po-search:focus { border-color: #1e3a5f; }
        .po-search-wrap { position: relative; display: flex; align-items: center; }
        .po-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }

        /* ── Body layout ── */
        .po-body        { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .po-report-area { padding: 12px 28px 0; flex: 1; overflow-y: auto; }
        .po-page        {
          background: #fff; border-radius: 8px 8px 0 0;
          border: 1px solid #e5e7eb; border-bottom: none; overflow: hidden;
        }

        /* Grand total bar */
        .po-grand-total-bar {
          flex-shrink: 0; margin: 0 28px 20px;
          background: #1e3a5f; border-radius: 0 0 8px 8px;
          border: 1px solid #1e3a5f; overflow: hidden;
        }
        .po-grand-total-bar table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .po-grand-total-bar td    { padding: 11px 14px; font-weight: 700; color: #fff; }
        .po-grand-total-bar td.num { text-align: right; font-variant-numeric: tabular-nums; }

        /* Report header */
        .po-report-header {
          padding: 16px 24px 14px; border-bottom: 1px solid #e5e7eb;
          display: flex; justify-content: space-between; align-items: center;
        }
        .po-report-header-right { text-align: right; font-size: 12px; color: #6b7280; line-height: 2; padding-top: 20px; }

        /* Title bar */
        .po-title-bar {
          background: #1e3a5f; color: #fff; text-align: center;
          padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
        }

        /* Meta row */
        .po-meta {
          display: flex; gap: 32px; padding: 9px 24px;
          background: #f9fafb; border-bottom: 1px solid #e5e7eb;
          font-size: 12px; color: #6b7280; flex-wrap: wrap; min-height: 10px;
        }

        /* ── Table ── */
        .po-table-wrap { overflow-x: auto; }

        table.po-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          table-layout: fixed;
        }

        /* Column widths */
        .po-table col.c0 { width: 9%;  }  /* PUOM */
        .po-table col.c1 { width: 10%; }  /* P Qty */
        .po-table col.c2 { width: 9%;  }  /* LUOM */
        .po-table col.c3 { width: 10%; }  /* L Qty */
        .po-table col.c4 { width: 12%; }  /* Item Rate */
        .po-table col.c5 { width: 8%;  }  /* Currency */
        .po-table col.c6 { width: 11%; }  /* Ex Rate */
        .po-table col.c7 { width: 12%; }  /* Amount */
        .po-table col.c8 { width: 19%; }  /* Project */

        .po-table thead th {
          background: #1e3a5f; color: #fff; font-weight: 700;
          font-size: 13px; padding: 11px 14px; text-align: left;
          white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.12);
          overflow: hidden; text-overflow: ellipsis; user-select: none; cursor: pointer;
        }
        .po-table thead th:last-child { border-right: none; }
        .po-table thead th.num { text-align: right; }
        .po-table thead th:hover { background: #162d4a; }

        /* PO group row */
        .po-table tr.po-row td {
          background: #1e3a5f; color: #fff; font-weight: 700;
          font-size: 12px; padding: 5px 14px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          border-bottom: 1px solid rgba(255,255,255,0.08); cursor: pointer;
        }
        .po-table tr.po-row:hover td { background: #162d4a; }

        /* Supplier group row */
        .po-table tr.supp-row td {
          background: #e8ecf2; color: #1e3a5f; font-weight: 700;
          font-size: 12px; padding: 6px 14px 6px 24px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          border-bottom: 1px solid #d5dce8; cursor: pointer;
        }
        .po-table tr.supp-row:hover td { background: #dde3ed; }

        /* Item group row */
        .po-table tr.item-row td {
          background: #f1f4f8; color: #374151; font-weight: 600;
          font-size: 12px; padding: 4px 14px 4px 36px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          border-bottom: 1px solid #e5e7eb;
        }

        /* Data rows */
        .po-table tbody tr.data-row td {
          padding: 4px 10px; border-bottom: 1px solid #e5e7eb;
          color: #374151; vertical-align: middle; font-size: 12px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
        }
        .po-table tbody tr.data-row:hover td { background: #f9fafb; }
        .po-table td.num  { text-align: right; font-variant-numeric: tabular-nums; }
        .po-table td.mono { font-family: 'Courier New', monospace; font-size: 11.5px; }

        /* Totals */
        .po-table tr.item-total td {
          background: #f1f4f8; padding: 3px 14px; font-size: 12px;
          font-weight: 600; color: #374151; border-top: 1px solid #e5e7eb;
          white-space: nowrap;
        }
        .po-table tr.supp-total td {
          background: #e8ecf2; padding: 5px 14px; font-size: 12px;
          font-weight: 700; color: #1e3a5f; white-space: nowrap;
        }
        .po-table tr.po-total td {
          background: #d5dce8; padding: 5px 14px; font-size: 12px;
          font-weight: 700; color: #1e3a5f; white-space: nowrap;
        }

        .po-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

        /* Status badge */
        .status-badge {
          display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;
        }
        .status-badge.approved  { background: #dcfce7; color: #16a34a; }
        .status-badge.pending   { background: #fef9c3; color: #ca8a04; }
        .status-badge.rejected  { background: #fee2e2; color: #dc2626; }
        .status-badge.default   { background: #f1f4f8; color: #374151; }

        /* Chevron */
        .chevron { display: inline-block; margin-right: 6px; font-size: 10px; transition: transform 0.15s; }
        .chevron.open { transform: rotate(90deg); }

        /* Print */
        @media print {
          @page { margin: 0; size: A4 landscape; }
          .po-toolbar, .no-print, .po-grand-total-bar { display: none !important; }
          .po-report-root { background: white; height: auto; overflow: visible; }
          .po-body        { overflow: visible; }
          .po-report-area { padding: 0; overflow: visible; flex: none; }
          .po-page        { border: none; border-radius: 0; box-shadow: none; }
          .po-table tbody tr.data-row td { border-bottom: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb; }
          .print-logo-only { display: block !important; }
        }
        .print-logo-only { display: none; }
      `}</style>

      <div className="po-report-root">
        {/* ── Toolbar ── */}
        <div className="po-toolbar no-print">
          <div className="po-toolbar-left">
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
              PO Detail Register
            </span>
            {isFiltered && (
              <span style={{ fontSize: 11, background: '#eef2f7', color: '#1e3a5f', borderRadius: 4, padding: '3px 9px', fontWeight: 600 }}>
                Filtered
              </span>
            )}
            <div className="po-search-wrap">
              <span className="po-search-icon">🔍</span>
              <input
                className="po-search"
                placeholder="Search PO no / supplier / item…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="po-toolbar-right">
            <button className="po-btn po-btn-ghost" onClick={handleCollapseAll}>
              {allCollapsed ? '⊞ Expand All' : '⊟ Collapse All'}
            </button>
            <button className={`po-btn po-btn-filter ${isFiltered ? 'active' : ''}`} onClick={() => setPanelOpen(true)}>
              {isFiltered && <span className="filter-dot" />}
              ⚙ Parameters
            </button>
            <button className="po-btn po-btn-ghost"   onClick={handlePrint}>🖨 Print</button>
            <button className="po-btn po-btn-success" onClick={handleExcel}>📊 Excel</button>
            <button className="po-btn po-btn-primary" onClick={handleDownloadPDF}>⬇ PDF</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="po-body">
          <div className="po-report-area">
            <div className="po-page" ref={printRef}>

              {/* Report header */}
              <div className="po-report-header">
                <img src={companyLogo} alt="Logo" className="print-logo-only" style={{ height: 54, width: 200, objectFit: 'fill' }} />
                <div className="po-report-header-right">
                  <div><b style={{ color: '#374151' }}>Print Date:</b> {printDate}</div>
                  <div><b style={{ color: '#374151' }}>Print User:</b> {printUser}</div>
                </div>
              </div>

              <div className="po-title-bar">PO Detail Register</div>

              <div className="po-meta">
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
              <div className="po-table-wrap">
                {isLoading ? (
                  <div className="po-empty">Loading data…</div>
                ) : poGroups.length === 0 ? (
                  <div className="po-empty">No records found.</div>
                ) : (
                  <table className="po-table">
                    <colgroup>
                      <col className="c0" /><col className="c1" /><col className="c2" />
                      <col className="c3" /><col className="c4" /><col className="c5" />
                      <col className="c6" /><col className="c7" /><col className="c8" />
                    </colgroup>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('P_UOM')}>PUOM <SortArrow col="P_UOM" sort={sort} /></th>
                        <th className="num" onClick={() => handleSort('APPR_ITEM_P_QTY')}>P Qty <SortArrow col="APPR_ITEM_P_QTY" sort={sort} /></th>
                        <th onClick={() => handleSort('L_UOM')}>LUOM <SortArrow col="L_UOM" sort={sort} /></th>
                        <th className="num" onClick={() => handleSort('APPR_ITEM_L_QTY')}>L Qty <SortArrow col="APPR_ITEM_L_QTY" sort={sort} /></th>
                        <th className="num" onClick={() => handleSort('ITEM_RATE')}>Item Rate <SortArrow col="ITEM_RATE" sort={sort} /></th>
                        <th>Currency</th>
                        <th className="num" onClick={() => handleSort('CURRENCY_RATE')}>Ex Rate <SortArrow col="CURRENCY_RATE" sort={sort} /></th>
                        <th className="num" onClick={() => handleSort('AMOUNT')}>Amount <SortArrow col="AMOUNT" sort={sort} /></th>
                        <th onClick={() => handleSort('PROJECT_NAME')}>Project <SortArrow col="PROJECT_NAME" sort={sort} /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {poGroups.map(po => {
                        const poOpen = !collapsedPOs.has(po.poNo);
                        const statusClass =
                          po.status?.toLowerCase().includes('approv') ? 'approved' :
                          po.status?.toLowerCase().includes('pend')   ? 'pending'  :
                          po.status?.toLowerCase().includes('reject')  ? 'rejected' : 'default';

                        return (
                          <React.Fragment key={po.poNo}>
                            {/* PO header */}
                            <tr className="po-row" onClick={() => togglePO(po.poNo)}>
                              <td colSpan={9}>
                                <span className={`chevron ${poOpen ? 'open' : ''}`}>▶</span>
                                PO No : {po.poNo}
                                &nbsp;&nbsp;|&nbsp;&nbsp;Date : {formatDate(po.poDate)}
                                &nbsp;&nbsp;|&nbsp;&nbsp;
                                <span className={`status-badge ${statusClass}`}>{po.status}</span>
                                &nbsp;&nbsp;|&nbsp;&nbsp;Type : {po.serviceFlag}
                              </td>
                            </tr>

                            {poOpen && po.suppliers.map(supp => {
                              const suppKey  = `${po.poNo}|||${supp.supplier}`;
                              const suppOpen = !collapsedSupps.has(suppKey);
                              return (
                                <React.Fragment key={suppKey}>
                                  {/* Supplier row */}
                                  <tr className="supp-row" onClick={() => toggleSupp(suppKey)}>
                                    <td colSpan={9}>
                                      <span className={`chevron ${suppOpen ? 'open' : ''}`}>▶</span>
                                      Supplier : {supp.suppName}
                                    </td>
                                  </tr>

                                  {suppOpen && supp.items.map(item => (
                                    <React.Fragment key={item.itemCode}>
                                      {/* Item row */}
                                      <tr className="item-row">
                                        <td colSpan={9}>
                                          Item : {item.itemCode} — {item.itemDesp}
                                          {item.addlDesc ? ` (${item.addlDesc})` : ''}
                                        </td>
                                      </tr>

                                      {/* Data rows */}
                                      {sortedRows(item.rows).map((row, ri) => (
                                        <tr key={`${row.PO_NO}-${row.ITEM_CODE}-${ri}`} className="data-row">
                                          <td>{row.P_UOM}</td>
                                          <td className="num">{formatQty(parseFloat(String(row.APPR_ITEM_P_QTY)) || 0)}</td>
                                          <td>{row.L_UOM}</td>
                                          <td className="num">{formatQty(parseFloat(String(row.APPR_ITEM_L_QTY)) || 0)}</td>
                                          <td className="num">{formatAmount(parseFloat(String(row.ITEM_RATE)) || 0)}</td>
                                          <td>QAR</td>
                                          <td className="num">{formatAmount(parseFloat(String(row.CURRENCY_RATE)) || 0)}</td>
                                          <td className="num" style={{ fontWeight: 600 }}>{formatAmount(parseFloat(String(row.AMOUNT)) || 0)}</td>
                                          <td>{row.PROJECT_NAME || '-'}</td>
                                        </tr>
                                      ))}

                                      {/* Item total */}
                                      <tr className="item-total">
                                        <td colSpan={7} style={{ paddingLeft: 36 }}>Item Total : {item.itemCode}</td>
                                        <td className="num">{formatAmount(item.total)}</td>
                                        <td />
                                      </tr>
                                    </React.Fragment>
                                  ))}

                                  {/* Supplier total */}
                                  {suppOpen && (
                                    <tr className="supp-total">
                                      <td colSpan={7} style={{ paddingLeft: 24 }}>Supplier Total : {supp.suppName}</td>
                                      <td className="num">{formatAmount(supp.total)}</td>
                                      <td />
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}

                            {/* PO total */}
                            {poOpen && (
                              <tr className="po-total">
                                <td colSpan={7}>PO Total : {po.poNo}</td>
                                <td className="num">{formatAmount(po.total)}</td>
                                <td />
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Pinned Grand Total */}
          {!isLoading && poGroups.length > 0 && (
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

export default PurchaseOrderReport;