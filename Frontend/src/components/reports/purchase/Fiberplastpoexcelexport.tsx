import ExcelJS from 'exceljs';

// ─────────────────────────────────────────────────────────────────────────
// FiberPlast PO → Excel
// Same layout language as purchaseOrderExcelExport.ts (PurchaseReportDesign),
// but with the FiberPlast item columns (P Uom / Qty Puom / L Uom / Qty Luom)
// and the Discounted Total row. Amounts are live formulas so the user can
// edit quantities / prices in Excel and totals recalculate.
// Place at: pages/Report/components/fiberplastPoExcelExport.ts
// ─────────────────────────────────────────────────────────────────────────

export interface FpExcelLine {
  seq: string | number;
  gl: string;
  desc: string;
  pUom: string;
  qtyPuom: number | null;
  lUom: string;
  qtyLuom: number | null;
  unitPrice: number | null;
  amount: number | null;
}

export interface FpExcelParams {
  company: {
    name: string;
    shortName: string;
    website: string;
    formTag: string;
    footerLine1: string;
    footerLine2: string;
  };
  divName?: string;

  docNo: string;
  orderDate: string;
  buyer: string;
  deliveryAddress: string;
  contactName: string;
  contactNo: string;
  prNo: string;
  woNo: string;

  supplier: {
    code: string;
    name: string;
    address: string;
    tel: string;
    fax: string;
    mob: string;
    email: string;
  };

  paymentTerms: string;
  deliveryTerm: string;
  project: string;
  scopeOfWork: string;
  remarks?: string;

  lines: FpExcelLine[];
  currCode: string;
  totalAmount: number;
  totalInWords: string;
  discountAmount: number;
  discountedTotal: number;
  discountedInWords: string;

  quotationRef?: string;
  reasonForModify?: string;
  generalTerms: string[];

  status?: 'DRAFT' | 'Cancelled';
  signatureUrl?: string; // http(s) / data: / relative URL – only when it can be shown
  printDate: string;

  clauses: { title: string; body: string }[];
}

// ─────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────

const CYAN_BG: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
const DARK_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF222222' } };
const GREY_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF666666' } };
const BORDER_BLUE = 'FF9BB1CC';
const BORDER_DARK = 'FFA0A0A0';

const thinBlue = (): Partial<ExcelJS.Borders> => ({
  top: { style: 'thin', color: { argb: BORDER_BLUE } },
  left: { style: 'thin', color: { argb: BORDER_BLUE } },
  bottom: { style: 'thin', color: { argb: BORDER_BLUE } },
  right: { style: 'thin', color: { argb: BORDER_BLUE } }
});

const thinDark = (): Partial<ExcelJS.Borders> => ({
  top: { style: 'thin', color: { argb: BORDER_DARK } },
  left: { style: 'thin', color: { argb: BORDER_DARK } },
  bottom: { style: 'thin', color: { argb: BORDER_DARK } },
  right: { style: 'thin', color: { argb: BORDER_DARK } }
});

// Grid: A..I (9 columns)
const COLS = 9;
const COL_WIDTHS = [7, 10, 40, 9, 11, 9, 11, 14, 16];
const SUM_W = (from: number, to: number) => COL_WIDTHS.slice(from, to + 1).reduce((a, b) => a + b, 0);

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

class MergeTracker {
  private used = new Set<string>();
  merge(ws: ExcelJS.Worksheet, range: string) {
    if (this.used.has(range)) return;
    this.used.add(range);
    ws.mergeCells(range);
  }
}

async function fetchImage(url?: string): Promise<{ buffer: ArrayBuffer; extension: 'png' | 'jpeg' } | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const type = res.headers.get('content-type') || '';
    const isJpeg = /jpe?g/i.test(type) || /\.jpe?g(\?|$)/i.test(url) || /^data:image\/jpe?g/i.test(url);
    return { buffer, extension: isJpeg ? 'jpeg' : 'png' };
  } catch {
    return null;
  }
}

function setCell(
  ws: ExcelJS.Worksheet,
  addr: string,
  value: ExcelJS.CellValue,
  opts: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    size?: number;
    color?: string;
    align?: ExcelJS.Alignment['horizontal'];
    valign?: ExcelJS.Alignment['vertical'];
    fill?: ExcelJS.Fill;
    border?: Partial<ExcelJS.Borders>;
    wrap?: boolean;
    numFmt?: string;
  } = {}
) {
  const cell = ws.getCell(addr);
  cell.value = value;
  cell.font = {
    bold: !!opts.bold,
    italic: !!opts.italic,
    underline: !!opts.underline,
    size: opts.size ?? 10,
    name: 'Arial',
    ...(opts.color ? { color: { argb: opts.color } } : {})
  };
  cell.alignment = { horizontal: opts.align ?? 'left', vertical: opts.valign ?? 'middle', wrapText: opts.wrap ?? true };
  if (opts.fill) cell.fill = opts.fill;
  if (opts.border) cell.border = opts.border;
  if (opts.numFmt) cell.numFmt = opts.numFmt;
  return cell;
}

// Conservative wrapped-line estimate (over-estimates slightly so text never spills into the next row).
function estimateWrappedLines(text: string, colWidthUnits: number, bold = false): number {
  if (!text) return 1;
  const charsPerLine = Math.max(4, Math.floor(colWidthUnits * (bold ? 0.6 : 0.68)));
  return text.split('\n').reduce((total, seg) => total + Math.max(1, Math.ceil(seg.length / charsPerLine)), 0);
}

const rowHeightForLines = (lines: number, minHeight = 16) => Math.min(409, Math.max(minHeight, lines * 14 + 4));

function borderRange(ws: ExcelJS.Worksheet, fromRow: number, toRow: number, border: Partial<ExcelJS.Borders>) {
  for (let r = fromRow; r <= toRow; r++) {
    for (let c = 1; c <= COLS; c++) ws.getCell(r, c).border = border;
  }
}

const safeFileName = (s: string) => (s || 'PO').replace(/[\\/:*?"<>|]/g, '_');

// ─────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────

export async function exportFiberPlastPoToExcel(p: FpExcelParams): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bayanat WMS';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Purchase Order', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0, footer: 0 }
    },
    views: [{ showGridLines: false }]
  });
  ws.columns = COL_WIDTHS.map((width) => ({ width }));

  const mt = new MergeTracker();
  let row = 1;

  // ── Title ──────────────────────────────────────────────────────────
  mt.merge(ws, `A${row}:I${row}`);
  setCell(ws, `A${row}`, 'PURCHASE ORDER', { bold: true, size: 16, underline: true, align: 'center' });
  ws.getRow(row).height = 22;
  row += 1;

  if (p.status) {
    mt.merge(ws, `A${row}:I${row}`);
    setCell(ws, `A${row}`, p.status.toUpperCase(), {
      bold: true,
      size: 14,
      align: 'center',
      color: p.status === 'Cancelled' ? 'FFCC0000' : 'FF999999'
    });
    ws.getRow(row).height = 22;
    row += 1;
  }
  row += 1; // spacer

  // ── Supplier (A:D) vs PO info (E:I) ────────────────────────────────
  const infoStartRow = row;
  const supplierLines: [string, boolean][] = [
    ['Supplier Details:', true],
    [`Supplier Number: ${p.supplier.code || '-'}`, false],
    [String(p.supplier.name || '').toUpperCase(), true],
    [`P.O Box No: ${p.supplier.address || '-'}`, false],
    [`TEL- ${p.supplier.tel || '-'}`, false],
    [`FAX- ${p.supplier.fax || '-'}`, false],
    [`MOB - ${p.supplier.mob || '-'}`, false],
    [`EMAIL: ${p.supplier.email || '-'}`, false]
  ];
  supplierLines.forEach(([text, bold], i) => {
    const r = infoStartRow + i;
    mt.merge(ws, `A${r}:D${r}`);
    setCell(ws, `A${r}`, text, { bold, align: 'left' });
  });

  const poInfoPairs: [string, string, boolean][] = [
    ['Purchase Order No:', p.docNo || '-', true],
    ['DATE:', p.orderDate, true],
    ['Buyer:', p.buyer || '-', true],
    ['Delivery Address:', p.deliveryAddress || '-', false],
    ['Contact Name:', p.contactName || '-', false],
    ['Contact No:', p.contactNo || '-', false],
    ['PR. No:', p.prNo || '-', false],
    ['WO No:', p.woNo || '-', false]
  ];
  poInfoPairs.forEach(([label, value, bold], i) => {
    const r = infoStartRow + i;
    mt.merge(ws, `E${r}:G${r}`);
    mt.merge(ws, `H${r}:I${r}`);
    setCell(ws, `E${r}`, label, { bold: true, align: 'left' });
    setCell(ws, `H${r}`, value, { bold, align: 'left' });
    if (label === 'Delivery Address:') {
      ws.getRow(r).height = rowHeightForLines(estimateWrappedLines(value, SUM_W(7, 8), bold));
    }
  });
  row = infoStartRow + supplierLines.length + 1;

  // ── Payment / Delivery / Project strip ─────────────────────────────
  const PAY_W = SUM_W(0, 3);
  const DLV_W = SUM_W(4, 6);
  const PRJ_W = SUM_W(7, 8);

  const stripHead = row;
  mt.merge(ws, `A${stripHead}:D${stripHead}`);
  mt.merge(ws, `E${stripHead}:G${stripHead}`);
  mt.merge(ws, `H${stripHead}:I${stripHead}`);
  setCell(ws, `A${stripHead}`, 'PAYMENT TERM', { bold: true, align: 'center', fill: CYAN_BG, border: thinBlue() });
  setCell(ws, `E${stripHead}`, 'DELIVERY TERM / PERIOD', { bold: true, align: 'center', fill: CYAN_BG, border: thinBlue() });
  setCell(ws, `H${stripHead}`, 'PROJECT', { bold: true, align: 'center', fill: CYAN_BG, border: thinBlue() });
  ws.getRow(stripHead).height = 18;
  row += 1;

  const stripData = row;
  mt.merge(ws, `A${stripData}:D${stripData}`);
  mt.merge(ws, `E${stripData}:G${stripData}`);
  mt.merge(ws, `H${stripData}:I${stripData}`);
  const payText = p.paymentTerms || '';
  const dlvText = p.deliveryTerm || '';
  const prjText = p.project || '';
  setCell(ws, `A${stripData}`, payText, { align: 'center', border: thinBlue() });
  setCell(ws, `E${stripData}`, dlvText, { align: 'center', border: thinBlue() });
  setCell(ws, `H${stripData}`, prjText, { align: 'center', border: thinBlue() });
  ws.getRow(stripData).height = rowHeightForLines(
    Math.max(estimateWrappedLines(payText, PAY_W), estimateWrappedLines(dlvText, DLV_W), estimateWrappedLines(prjText, PRJ_W))
  );
  row += 2;

  // ── Items table ────────────────────────────────────────────────────
  const itemHead = row;
  const headers = ['ITEM', 'GL', 'DESCRIPTION', 'P Uom', 'Qty Puom', 'L Uom', 'Qty Luom', 'UNIT PRICE', `Amount(${p.currCode})`];
  headers.forEach((h, i) => {
    setCell(ws, ws.getCell(itemHead, i + 1).address, h, { bold: true, align: 'center', fill: CYAN_BG, border: thinBlue() });
  });
  ws.getRow(itemHead).height = 20;
  row += 1;

  // Scope of work
  mt.merge(ws, `A${row}:I${row}`);
  const scopeText = `Scope of Work:- ${p.scopeOfWork || ''}${p.remarks ? `\n${p.remarks}` : ''}`;
  setCell(ws, `A${row}`, scopeText, { bold: true, align: 'left', valign: 'top', border: thinBlue() });
  ws.getRow(row).height = rowHeightForLines(estimateWrappedLines(scopeText, SUM_W(0, 8), true));
  row += 1;

  const firstItemRow = row;
  p.lines.forEach((ln, idx) => {
    const r = row;
    setCell(ws, `A${r}`, ln.seq || idx + 1, { align: 'center', valign: 'top', border: thinBlue() });
    setCell(ws, `B${r}`, ln.gl || '', { align: 'center', valign: 'top', border: thinBlue() });
    setCell(ws, `C${r}`, ln.desc || '', { bold: true, align: 'left', valign: 'top', border: thinBlue() });
    setCell(ws, `D${r}`, ln.pUom || '', { bold: true, align: 'center', valign: 'top', border: thinBlue() });
    setCell(ws, `E${r}`, ln.qtyPuom ?? '', { bold: true, align: 'center', valign: 'top', border: thinBlue(), numFmt: 'General' });
    setCell(ws, `F${r}`, ln.lUom || '', { align: 'center', valign: 'top', border: thinBlue() });
    setCell(ws, `G${r}`, ln.qtyLuom ?? '', { align: 'center', valign: 'top', border: thinBlue(), numFmt: 'General' });
    setCell(ws, `H${r}`, ln.unitPrice ?? '', { bold: true, align: 'right', valign: 'top', border: thinBlue(), numFmt: '#,##0.000000' });

    // Live formula so edits to Qty / Unit Price recalculate the line + totals.
    const amountValue: ExcelJS.CellValue =
      ln.qtyPuom !== null && ln.unitPrice !== null && ln.amount !== null
        ? { formula: `E${r}*H${r}`, result: ln.amount }
        : '';
    setCell(ws, `I${r}`, amountValue, {
      bold: true,
      align: 'right',
      valign: 'top',
      fill: CYAN_BG,
      border: thinBlue(),
      numFmt: '#,##0.00'
    });

    ws.getRow(r).height = rowHeightForLines(estimateWrappedLines(ln.desc || '', COL_WIDTHS[2], true));
    row += 1;
  });
  const lastItemRow = row - 1;

  // Total row
  const totalRow = row;
  mt.merge(ws, `A${totalRow}:H${totalRow}`);
  setCell(ws, `A${totalRow}`, `Total: ${p.totalInWords}`, { bold: true, align: 'left', border: thinBlue() });
  setCell(
    ws,
    `I${totalRow}`,
    p.lines.length > 0 ? { formula: `SUM(I${firstItemRow}:I${lastItemRow})`, result: p.totalAmount } : p.totalAmount,
    { bold: true, align: 'right', fill: CYAN_BG, border: thinBlue(), numFmt: '#,##0.00' }
  );
  ws.getRow(totalRow).height = rowHeightForLines(estimateWrappedLines(`Total: ${p.totalInWords}`, SUM_W(0, 7), true));
  row += 1;

  // Discounted total row
  const discRow = row;
  mt.merge(ws, `A${discRow}:H${discRow}`);
  setCell(ws, `A${discRow}`, `Discounted Total: ${p.discountedInWords}`, { bold: true, align: 'left', border: thinBlue() });
  setCell(ws, `I${discRow}`, { formula: `I${totalRow}-${p.discountAmount || 0}`, result: p.discountedTotal }, {
    bold: true,
    align: 'right',
    fill: CYAN_BG,
    border: thinBlue(),
    numFmt: '#,##0.00'
  });
  ws.getRow(discRow).height = rowHeightForLines(estimateWrappedLines(`Discounted Total: ${p.discountedInWords}`, SUM_W(0, 7), true));
  row += 2;

  // ── Quotation reference + general terms ────────────────────────────
  mt.merge(ws, `A${row}:I${row}`);
  const quoteText = [`Above is as per attached quotation Ref: ${p.quotationRef || ''}`, p.reasonForModify || ''].filter(Boolean).join('\n');
  setCell(ws, `A${row}`, quoteText, { bold: true, size: 9, align: 'left', valign: 'top' });
  ws.getRow(row).height = rowHeightForLines(estimateWrappedLines(quoteText, SUM_W(0, 8), true));
  row += 1;

  p.generalTerms.forEach((line) => {
    mt.merge(ws, `A${row}:I${row}`);
    setCell(ws, `A${row}`, line, { size: 8.5, align: 'left', valign: 'top' });
    ws.getRow(row).height = rowHeightForLines(estimateWrappedLines(line, SUM_W(0, 8)), 14);
    row += 1;
  });
  row += 1;

  // ── Signature grid ─────────────────────────────────────────────────
  const sigTop = row;
  mt.merge(ws, `A${sigTop}:D${sigTop}`);
  setCell(ws, `A${sigTop}`, 'For Supplier:', { bold: true, align: 'left' });
  mt.merge(ws, `E${sigTop}:I${sigTop}`);
  setCell(ws, `E${sigTop}`, `For ${p.divName || p.company.name} :`, { bold: true, align: 'center' });
  ws.getRow(sigTop).height = 18;
  row += 1;

  mt.merge(ws, `A${row}:D${row}`);
  setCell(ws, `A${row}`, 'I have read & agreed to all terms and conditions.', { bold: true, align: 'left' });
  mt.merge(ws, `E${row}:I${row}`);
  setCell(ws, `E${row}`, '', { align: 'center' });
  ws.getRow(row).height = 48;
  const sigImageRow = row;
  row += 1;

  mt.merge(ws, `A${row}:B${row}`);
  setCell(ws, `A${row}`, 'Signature', { bold: true, align: 'center' });
  mt.merge(ws, `C${row}:D${row}`);
  setCell(ws, `C${row}`, 'Date', { bold: true, align: 'center' });
  mt.merge(ws, `E${row}:G${row}`);
  setCell(ws, `E${row}`, 'Signature', { bold: true, align: 'center' });
  mt.merge(ws, `H${row}:I${row}`);
  setCell(ws, `H${row}`, 'Date', { bold: true, align: 'center' });
  ws.getRow(row).height = 18;
  borderRange(ws, sigTop, row, thinDark());

  const sig = await fetchImage(p.signatureUrl);
  if (sig) {
    const imgId = workbook.addImage({ buffer: sig.buffer as any, extension: sig.extension });
    ws.addImage(imgId, { tl: { col: 5.6, row: sigImageRow - 1 + 0.1 }, ext: { width: 100, height: 40 } });
  }
  row += 2;

  // ── Footer strip ───────────────────────────────────────────────────
  mt.merge(ws, `A${row}:I${row}`);
  setCell(ws, `A${row}`, p.company.shortName, { bold: true, size: 10, align: 'center', fill: CYAN_BG, border: thinDark() });
  row += 1;

  mt.merge(ws, `A${row}:B${row}`);
  setCell(ws, `A${row}`, p.company.formTag, { bold: true, size: 9, align: 'left', fill: CYAN_BG, border: thinDark() });
  mt.merge(ws, `C${row}:G${row}`);
  setCell(ws, `C${row}`, `Website: ${p.company.website}`, { bold: true, size: 10, align: 'center', fill: CYAN_BG, border: thinDark() });
  mt.merge(ws, `H${row}:I${row}`);
  setCell(ws, `H${row}`, `Form Issued Date:${p.printDate}`, { bold: true, size: 9, align: 'right', fill: CYAN_BG, border: thinDark() });
  row += 1;

  mt.merge(ws, `A${row}:I${row}`);
  setCell(ws, `A${row}`, p.company.footerLine1, { bold: true, size: 9, align: 'center', color: 'FFFFFFFF', fill: DARK_FILL });
  ws.getRow(row).height = rowHeightForLines(estimateWrappedLines(p.company.footerLine1, SUM_W(0, 8), true), 18);
  row += 1;

  mt.merge(ws, `A${row}:I${row}`);
  setCell(ws, `A${row}`, p.company.footerLine2, { bold: true, size: 9, align: 'center', color: 'FFFFFFFF', fill: GREY_FILL });
  ws.getRow(row).height = rowHeightForLines(estimateWrappedLines(p.company.footerLine2, SUM_W(0, 8), true), 18);

  // ── Sheet 2: Standard Purchase Terms ───────────────────────────────
  if (p.clauses.length > 0) {
    const ws2 = workbook.addWorksheet('Terms & Conditions', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
      views: [{ showGridLines: false }]
    });
    ws2.columns = [{ width: 36 }, { width: 110 }];
    ws2.mergeCells('A1:B1');
    setCell(ws2, 'A1', 'Standard Purchase Terms', { bold: true, italic: true, underline: true, align: 'center', size: 12 });
    ws2.getRow(1).height = 24;

    let r = 2;
    p.clauses.forEach((clause) => {
      const isIntro = /^standard purchase terms/i.test(clause.title.trim());
      if (isIntro) {
        ws2.mergeCells(`A${r}:B${r}`);
        setCell(ws2, `A${r}`, clause.body, { size: 9, align: 'left', valign: 'top' });
        ws2.getRow(r).height = rowHeightForLines(estimateWrappedLines(clause.body, 146));
      } else {
        setCell(ws2, `A${r}`, clause.title, { bold: true, size: 9, align: 'left', valign: 'top', border: thinBlue() });
        setCell(ws2, `B${r}`, clause.body, { size: 9, align: 'left', valign: 'top', border: thinBlue() });
        ws2.getRow(r).height = rowHeightForLines(
          Math.max(estimateWrappedLines(clause.title, 36, true), estimateWrappedLines(clause.body, 110))
        );
      }
      r += 1;
    });
  }

  // ── Download ───────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PurchaseOrder_${safeFileName(p.docNo)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}