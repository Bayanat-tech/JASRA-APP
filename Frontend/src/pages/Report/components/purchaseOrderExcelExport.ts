import ExcelJS from 'exceljs';
import { spellNumber, formatAmount } from './functions';
import type { PurchaseOrderData } from './PurchaseReportDesign';
import WmsSerivceInstance from 'service/wms/service.wms';
import { dynamicData } from './dynamicData';
import { POsignatureImg } from './img';

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

interface DeliveryInfo {
  STORE_NAME: string;
  CONTACT_NUMBER: string;
  CONTACT_PERSON: string;
}

interface BuyerInfo {
  REAL_NAME: string;
}

interface TermsInfo {
  DLVR_TERM: string;
  REMARKS: string;
  PAYMENT_TERMS: string;
  PROJECT_NAME: string;
  PROJECT_CODE: string;
}

interface DivInfo {
  name?: string;
  logo?: string;
  header?: string;
  logoYes?: boolean;
  headerYes?: boolean;
  logoWidth?: string;
  headerWidth?: string;
  footerYes?: boolean;
  footer?: string;
  multipleFooters?: boolean;
  multipleFooterImages?: string[];
  clauses?: { title: string; body: string }[];
}

export interface ExportPurchaseOrderToExcelParams {
  poData: PurchaseOrderData;
  poItems: PurchaseOrderData[];
  buyerInfo?: BuyerInfo;
  deliveryInfo?: DeliveryInfo;
  termsInfo?: TermsInfo;
  totalAmount: number;
  orderDate: string;
  formattedWoNo: string;
  status?: 'DRAFT' | 'Cancelled';
  signature: boolean;
  signatureImg?: string; // resolved URL of POsignatureImg
  div: DivInfo;
}

// ─────────────────────────────────────────────────────────────────────────
// Style constants — kept in sync with PurchaseReportDesign.tsx
// ─────────────────────────────────────────────────────────────────────────

const CYAN_BG: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
const BORDER_BLUE = 'FF9BB1CC';
const BORDER_DARK = 'FFA0A0A0';

const thinBlue = (): Partial<ExcelJS.Borders> => ({
  top: { style: 'thin', color: { argb: BORDER_BLUE } },
  left: { style: 'thin', color: { argb: BORDER_BLUE } },
  bottom: { style: 'thin', color: { argb: BORDER_BLUE } },
  right: { style: 'thin', color: { argb: BORDER_BLUE } },
});

const thinDark = (): Partial<ExcelJS.Borders> => ({
  top: { style: 'thin', color: { argb: BORDER_DARK } },
  left: { style: 'thin', color: { argb: BORDER_DARK } },
  bottom: { style: 'thin', color: { argb: BORDER_DARK } },
  right: { style: 'thin', color: { argb: BORDER_DARK } },
});

// Number of grid columns the whole sheet is built on (A..G)
const COLS = 7;
// const LAST_COL_LETTER = 'G';

// Column widths (Excel units) for A..G. Also used to work out the sheet's width in pixels
// so the header images can be sized/placed to exactly match the table width.
const COL_WIDTHS = [8, 9, 46, 15, 9, 15, 17];
const COL_PX = COL_WIDTHS.map((w) => Math.round(w * 7 + 5));
const TOTAL_PX = COL_PX.reduce((a, b) => a + b, 0);

// Same defaults as renderPageHeader() in PurchaseReportDesign.tsx so Excel matches the screen.
const DEFAULT_LOGO_WIDTH_PCT = 0.48;
const DEFAULT_HEADER_WIDTH_PCT = 0.4;

// ─────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────

/** Track every range we've merged so we never call mergeCells twice on an
 * overlapping range (this is what caused "Cannot merge already merged cells"). */
class MergeTracker {
  private used = new Set<string>();

  merge(ws: ExcelJS.Worksheet, range: string) {
    if (this.used.has(range)) return;
    this.used.add(range);
    ws.mergeCells(range);
  }
}

async function fetchAsBuffer(url?: string): Promise<ArrayBuffer | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function guessExtension(url: string): 'png' | 'jpeg' {
  return /\.jpe?g(\?|$)/i.test(url) ? 'jpeg' : 'png';
}

interface PreparedImage {
  buffer: ArrayBuffer;
  extension: 'png' | 'jpeg';
  /** Natural size (px) of the buffer that will be embedded (after trimming). */
  width: number;
  height: number;
}

/**
 * Loads an image, crops away its blank (transparent / white) margins so the visible artwork
 * reaches the edges (same idea as TrimmedImg on the screen), and returns the cropped PNG plus
 * its pixel size. The size is needed so the image can be placed WITHOUT stretching it.
 * Falls back to the untouched image if the browser can't decode / crop it.
 */
async function prepareImage(url?: string): Promise<PreparedImage | null> {
  const original = await fetchAsBuffer(url);
  if (!original || !url) return null;
  const originalExt = guessExtension(url);

  try {
    const blob = new Blob([original]);
    const bitmap = await createImageBitmap(blob);
    const w = bitmap.width;
    const h = bitmap.height;
    if (!w || !h) return { buffer: original, extension: originalExt, width: 700, height: 100 };

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { buffer: original, extension: originalExt, width: w, height: h };
    ctx.drawImage(bitmap, 0, 0);

    const { data } = ctx.getImageData(0, 0, w, h);
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = (y * w + x) * 4;
        const isContent = data[i + 3] > 20 && (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240);
        if (isContent) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return { buffer: original, extension: originalExt, width: w, height: h };

    const cw = maxX - minX + 1;
    const ch = maxY - minY + 1;
    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    const octx = out.getContext('2d');
    if (!octx) return { buffer: original, extension: originalExt, width: w, height: h };
    octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);

    const croppedBlob: Blob | null = await new Promise((resolve) => out.toBlob(resolve, 'image/png'));
    if (!croppedBlob) return { buffer: original, extension: originalExt, width: w, height: h };
    return { buffer: await croppedBlob.arrayBuffer(), extension: 'png', width: cw, height: ch };
  } catch {
    return { buffer: original, extension: originalExt, width: 700, height: 100 };
  }
}

/** "48%" -> 0.48, "100%" -> 1. Anything unparseable falls back to `fallback`. */
function pctToFraction(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const m = /^\s*([\d.]+)\s*%\s*$/.exec(String(value));
  if (!m) return fallback;
  const n = Number(m[1]) / 100;
  return n > 0 && n <= 1 ? n : fallback;
}

/** Converts a horizontal pixel offset from the left edge of column A into the fractional
 * zero-based column index ExcelJS expects for an image anchor. */
function pxToColAnchor(px: number): number {
  let remaining = Math.max(0, px);
  for (let i = 0; i < COL_PX.length; i += 1) {
    if (remaining <= COL_PX[i]) return i + remaining / COL_PX[i];
    remaining -= COL_PX[i];
  }
  return COL_PX.length;
}

function setCell(
  ws: ExcelJS.Worksheet,
  addr: string,
  value: string | number,
  opts: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    size?: number;
    align?: ExcelJS.Alignment['horizontal'];
    valign?: ExcelJS.Alignment['vertical'];
    fill?: ExcelJS.Fill;
    border?: Partial<ExcelJS.Borders>;
    wrap?: boolean;
  } = {}
) {
  const cell = ws.getCell(addr);
  cell.value = value;
  cell.font = { bold: !!opts.bold, italic: !!opts.italic, underline: !!opts.underline, size: opts.size ?? 10, name: 'Arial' };
  cell.alignment = { horizontal: opts.align ?? 'left', vertical: opts.valign ?? 'middle', wrapText: opts.wrap ?? true };
  if (opts.fill) cell.fill = opts.fill;
  if (opts.border) cell.border = opts.border;
  return cell;
}

/**
 * Rough estimate of how many lines `text` will wrap to inside a merged range
 * whose combined column width is `colWidthUnits` (Excel width units, roughly
 * ≈ characters for a normal-weight font). Bold text is noticeably wider per
 * character, so `bold` tightens the chars-per-line estimate. This is what's
 * used to size row heights so wrapped text doesn't spill into the row below.
 *
 * NOTE: these ratios are intentionally conservative (i.e. they tend to
 * over-estimate the line count slightly rather than under-estimate it).
 * Under-estimating is what causes wrapped text to visually spill into the
 * row below in Excel, which is worse than a row that's a touch too tall.
 */
function estimateWrappedLines(text: string, colWidthUnits: number, bold = false): number {
  if (!text) return 1;
  const charsPerLine = Math.max(4, Math.floor(colWidthUnits * (bold ? 0.6 : 0.68)));
  return text
    .split('\n')
    .reduce((total, segment) => total + Math.max(1, Math.ceil(segment.length / charsPerLine)), 0);
}

/** Converts an estimated line count into a row height (points), with a small
 * buffer so imprecise character-width estimates don't still clip text. */
function rowHeightForLines(lines: number, minHeight = 16): number {
  return Math.max(minHeight, lines * 16 + 4);
}

function borderRange(ws: ExcelJS.Worksheet, fromRow: number, toRow: number, border: Partial<ExcelJS.Borders>) {
  for (let r = fromRow; r <= toRow; r++) {
    for (let c = 1; c <= COLS; c++) {
      ws.getCell(r, c).border = border;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Standalone data fetch (for callers that don't render PurchaseReportDesign,
// e.g. a modal that only shows PfReportView and needs export data on demand)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Runs the same set of raw-SQL lookups PurchaseReportDesign.tsx does via
 * react-query hooks, but as a plain sequential async function with no
 * dependency on component state. Pass a slash-formatted ref doc no
 * (e.g. "MFS/26/OH003/PO/0003") — same format the on-screen report expects.
 * Returns null if no rows are found for that PO.
 */
export async function fetchPurchaseOrderExportData(
  refDocNo: string,
  divCodeHint?: string
): Promise<ExportPurchaseOrderToExcelParams | null> {
  if (!refDocNo) return null;

  // 1. Resolve div_code if the caller didn't already have it.
  let divCode = divCodeHint || '';
  if (!divCode) {
    const divCodeSql = `
      SELECT DISTINCT div_code FROM PURCHASE_REQUEST_DETAILS WHERE ref_doc_no = REPLACE('${refDocNo}', '/', '$')
    `;
    const divRes: any = await WmsSerivceInstance.executeRawSql(divCodeSql);
    divCode = divRes?.[0]?.DIV_CODE || '';
  }

  // 2. Main PO + line items.
  const sqlString = `
    SELECT *
    FROM VW_BO_PO_PRINT PO_REGISTER
    WHERE
      div_code = '${divCode}' AND
      REF_DOC_NO = REPLACE('${refDocNo}', '$', '/')
    ORDER BY REF_DOC_NO, TO_NUMBER(ITEM_SEQUENCE_NO)
  `;
  const rawItems = (await WmsSerivceInstance.executeRawSql(sqlString)) as PurchaseOrderData[] | undefined;
  const poItems = Array.isArray(rawItems)
    ? [...rawItems].sort((a, b) => Number(a.ITEM_SEQUENCE_NO) - Number(b.ITEM_SEQUENCE_NO))
    : [];
  const poData = poItems[0];
  if (!poData) return null;

  // 3. Signature requirement flag.
  const sqlForSignature = `
    SELECT NVL(
      (
        SELECT FLAG_YES_NO
        FROM PRINT_SIGNATURE_INFO
        WHERE TRIM(REF_DOC_NO) = REPLACE('${refDocNo}', '/', '$')
        FETCH FIRST 1 ROWS ONLY
      ),
      'NO'
    ) AS FLAG_YES_NO
    FROM DUAL
  `;
  const signatureRes: any = await WmsSerivceInstance.executeRawSql(sqlForSignature);
  const signature = signatureRes?.[0]?.FLAG_YES_NO === 'YES';

  // 4. Delivery info.
  const sqlForDeliveryInfo = `
    SELECT STORE_NAME, CONTACT_NUMBER, CONTACT_PERSON
    FROM MS_PS_PROJECT_MASTER
    WHERE PROJECT_CODE = '${poData.PROJECT_CODE}'
      AND COMPANY_CODE = '${poData.COMPANY_CODE}'
  `;
  const deliveryRes: any = await WmsSerivceInstance.executeRawSql(sqlForDeliveryInfo);
  const deliveryInfo = deliveryRes?.[0];

  // 5. Buyer name.
  const sqlForBuyerName = `
    SELECT REAL_NAME
    FROM SEC_LOGIN
    WHERE LOGINID IN (
      SELECT LAST_UPDATED
      FROM VW_BUYER_INFO
      WHERE REPLACE(REQUEST_NUMBER, '/', '$') = REPLACE('${poData.REQUEST_NUMBER}', '/', '$')
    )
  `;
  const buyerRes: any = await WmsSerivceInstance.executeRawSql(sqlForBuyerName);
  const buyerInfo = buyerRes?.[0];

  // 6. Terms / delivery / project text (overrides the values embedded in poData when present).
  const sqlForTermsConditions = `
    SELECT DISTINCT DLVR_TERM, REMARKS, PAYMENT_TERMS, PROJECT_NAME, PROJECT_CODE
    FROM VW_BO_PO_PRINT PO_REGISTER
    WHERE Company_code = '${poData.COMPANY_CODE}'
      AND REPLACE(Ref_doc_no, '/', '$') = REPLACE('${refDocNo}', '/', '$')
  `;
  const termsRes: any = await WmsSerivceInstance.executeRawSql(sqlForTermsConditions);
  const termsInfo = termsRes?.[0];

  // 7. Derived fields — same logic as PurchaseReportDesign.tsx's useMemo blocks.
  const status: 'DRAFT' | 'Cancelled' | undefined =
    poData.PO_CONFIRM === 'N' && poData.PO_CANCEL === 'N'
      ? 'DRAFT'
      : poData.PO_CANCEL === 'Y'
      ? 'Cancelled'
      : undefined;

  const formattedWoNo = (() => {
    const type = poData.TYPE_OF_PR;
    const wo = poData.WO_NUMBER;
    if (type === 'Charge to Customer') return wo ? `${wo} - Chargeable` : '- - Chargeable';
    if (type === 'Non Chargeable') return wo ? `${wo} - Non-Chargeable` : 'WO-N/A - Non-Chargeable';
    return 'Charge to Employee';
  })();

  const orderDate = (() => {
    if (!poData.DOC_DATE) return '-';
    const parsed = new Date(poData.DOC_DATE);
    return Number.isNaN(parsed.getTime()) ? poData.DOC_DATE : parsed.toLocaleDateString('en-GB');
  })();

  const totalAmount = poItems.reduce((sum, item) => {
    const qty = item.ALLOCATED_APPROVED_QUANTITY ? formatAmount(item.ALLOCATED_APPROVED_QUANTITY) : formatAmount(item.PO_MOD_AMOUNT);
    const unitPrice = item.PO_MOD_AMOUNT ? formatAmount(item.PO_MOD_AMOUNT) : formatAmount(item.FINAL_RATE);
    return sum + Number(qty) * Number(unitPrice);
  }, 0);

  const div = dynamicData[poData.DIV_CODE ?? divCode];
  if (!div) return null;

  return {
    poData,
    poItems,
    buyerInfo,
    deliveryInfo,
    termsInfo,
    totalAmount,
    orderDate,
    formattedWoNo,
    status,
    signature,
    signatureImg: POsignatureImg,
    div,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────

export async function exportPurchaseOrderToExcel(params: ExportPurchaseOrderToExcelParams): Promise<void> {
  const { poData, poItems, buyerInfo, deliveryInfo, termsInfo, totalAmount, orderDate, formattedWoNo, status, signature, signatureImg, div } = params;

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
    horizontalCentered: true, // centers the table on the printed page
    margins: { left: 0.3, right: 0.3, top: 0.75, bottom: 0.5, header: 0, footer: 0 },
  },
  views: [{ showGridLines: false }],
});

  // Column widths — proportional to the 5% / 6% / 44% / 12% / 7% / 12% / 14% item table
  ws.columns = COL_WIDTHS.map((width) => ({ width }));

const mt = new MergeTracker();
const TOP_SPACER_PT = 18;
ws.getRow(1).height = TOP_SPACER_PT; // empty spacer row
let row = 2;                         

  // ── Header: same placement as the on-screen report ───────────────────
  //   LEFT  : div.logo   (company-info block with the blue bar)
  //   RIGHT : div.header (brand logo), flush with the right edge of the table
  // Each image keeps its own proportions (no stretching), is cropped of blank margins and is
  // sized as a % of the table width using the same widths the screen uses.
  const HEADER_ROWS = 5;
  const [logoImg, headerImg] = await Promise.all([
    prepareImage(div.logoYes ? div.logo : undefined),
    prepareImage(div.headerYes ? div.header : undefined),
  ]);

  const logoW = logoImg ? Math.round(TOTAL_PX * pctToFraction(div.logoWidth, DEFAULT_LOGO_WIDTH_PCT)) : 0;
  const logoH = logoImg ? Math.round((logoW * logoImg.height) / logoImg.width) : 0;
  const headerW = headerImg ? Math.round(TOTAL_PX * pctToFraction(div.headerWidth, DEFAULT_HEADER_WIDTH_PCT)) : 0;
  const headerH = headerImg ? Math.round((headerW * headerImg.height) / headerImg.width) : 0;

  const headerBlockPx = Math.max(logoH, headerH, 5 * 20);
  // rows are in points (1px = 0.75pt); split the block evenly over the header rows
  const headerRowPt = (headerBlockPx * 0.75) / HEADER_ROWS;
  for (let r = row; r < row + HEADER_ROWS; r++) ws.getRow(r).height = headerRowPt;
  const headerRowPx = headerBlockPx / HEADER_ROWS;

  if (logoImg) {
    const imgId = workbook.addImage({ buffer: logoImg.buffer as any, extension: logoImg.extension });
    const topOffsetRows = (headerBlockPx - logoH) / 2 / headerRowPx;
    ws.addImage(imgId, { tl: { col: 0, row: row - 1 + topOffsetRows }, ext: { width: logoW, height: logoH } });
  }
  if (headerImg) {
    const imgId = workbook.addImage({ buffer: headerImg.buffer as any, extension: headerImg.extension });
    const topOffsetRows = (headerBlockPx - headerH) / 2 / headerRowPx;
    ws.addImage(imgId, {
      tl: { col: pxToColAnchor(TOTAL_PX - headerW), row: row - 1 + topOffsetRows },
      ext: { width: headerW, height: headerH },
    });
  }
  row += HEADER_ROWS;

  // ── Title ─────────────────────────────────────────────────────────
  mt.merge(ws, `A${row}:G${row}`);
  setCell(ws, `A${row}`, 'PURCHASE ORDER', { bold: true, size: 16, underline: true, align: 'center' });
  ws.getRow(row).height = 22;
  row += 1;

  // spacer
  row += 1;

  // ── Supplier Details (A:C)  vs  PO Info (D:G) ───────────────────────
  const infoStartRow = row;
  const supplierLines = [
    ['Supplier Details:', true],
    [`Supplier Number: ${poData.SUPP_CODE || '-'}`, false],
    [String(poData.SUPP_NAME || '').toUpperCase(), true],
    [`P.O Box No: ${poData.ADDRESS || '-'}`, false],
    [`TEL- ${poData.SUPP_TELNO1 || '-'}`, false],
    [`FAX- ${poData.SUPP_FAXNO1 || '-'}`, false],
    [`MOB - ${poData.MOBILE || '-'}`, false],
    [`EMAIL: ${poData.SUPP_EMAIL1 || '-'}`, false],
  ] as const;

  supplierLines.forEach(([text, bold], i) => {
    const r = infoStartRow + i;
    mt.merge(ws, `A${r}:C${r}`);
    setCell(ws, `A${r}`, text, { bold, align: 'left' });
  });

  const poInfoPairs: [string, string][] = [
    ['Purchase Order No:', `${poData.REF_DOC_NO || '-'} Rev: 0`],
    ['DATE:', orderDate],
    ['Buyer:', buyerInfo?.REAL_NAME || '-'],
    ['Delivery Address:', deliveryInfo?.STORE_NAME || poData.DELIVERY_ADDRESS || '-'],
    ['Contact Name:', deliveryInfo?.CONTACT_PERSON || '-'],
    ['Contact No:', deliveryInfo?.CONTACT_NUMBER || '-'],
    ['PR. No:', poData.REQUEST_NUMBER || '-'],
    ['WO No:', formattedWoNo],
  ];

  poInfoPairs.forEach(([label, value], i) => {
    const r = infoStartRow + i;
    mt.merge(ws, `D${r}:E${r}`);
    mt.merge(ws, `F${r}:G${r}`);
    setCell(ws, `D${r}`, label, { bold: true, align: 'left' });
    setCell(ws, `F${r}`, value, { bold: true, align: 'left' });
  });

  const infoEndRow = infoStartRow + supplierLines.length - 1;

  // DRAFT / CANCELLED stamp — overlay note in a spare cell area is unreliable
  // in Excel, so we surface status as bold red text instead of the PNG stamp.
  if (status) {
    const stampRow = infoStartRow;
    setCell(ws, `H${stampRow}` /* off-grid, ignored by print area */, '', {});
    const cell = ws.getCell(`C${infoEndRow + 1}`);
    cell.value = status.toUpperCase();
    cell.font = { bold: true, size: 14, color: { argb: status === 'Cancelled' ? 'FFCC0000' : 'FF999999' } };
    cell.alignment = { horizontal: 'center' };
  }

  row = infoEndRow + 2;

  // ── Payment / Delivery / Project strip ──────────────────────────────
  // Merged column widths (sum of the ws.columns widths set above): A:C ≈ 63, D:E ≈ 24, F:G ≈ 32.
  const PAY_COL_W = 63;
  const DLVR_COL_W = 24;
  const PROJ_COL_W = 32;

  const headerRow = row;
  mt.merge(ws, `A${headerRow}:C${headerRow}`);
  mt.merge(ws, `D${headerRow}:E${headerRow}`);
  mt.merge(ws, `F${headerRow}:G${headerRow}`);
  const stripHeaders: [string, number][] = [
    ['PAYMENT TERM', PAY_COL_W],
    ['DELIVERY TERM / PERIOD', DLVR_COL_W],
    ['PROJECT', PROJ_COL_W],
  ];
  stripHeaders.forEach(([label], i) => {
    const addr = [`A${headerRow}`, `D${headerRow}`, `F${headerRow}`][i];
    setCell(ws, addr, label, { bold: true, align: 'center', fill: CYAN_BG, border: thinBlue() });
  });
  const headerLines = Math.max(...stripHeaders.map(([text, w]) => estimateWrappedLines(text, w, true)));
  ws.getRow(headerRow).height = rowHeightForLines(headerLines);
  row += 1;

  const dataRow = row;
  mt.merge(ws, `A${dataRow}:C${dataRow}`);
  mt.merge(ws, `D${dataRow}:E${dataRow}`);
  mt.merge(ws, `F${dataRow}:G${dataRow}`);
  const paymentTermText = termsInfo?.PAYMENT_TERMS ?? poData.PAYMENT_TERMS ?? '-';
  const deliveryTermText = termsInfo?.DLVR_TERM ?? poData.DLVR_TERM ?? '-';
  const projectText = `${termsInfo?.PROJECT_CODE ?? poData.PROJECT_CODE ?? ''}: ${termsInfo?.PROJECT_NAME ?? poData.PROJECT_NAME ?? ''}`;
  setCell(ws, `A${dataRow}`, paymentTermText, { align: 'center', border: thinBlue() });
  setCell(ws, `D${dataRow}`, deliveryTermText, { align: 'center', border: thinBlue() });
  setCell(ws, `F${dataRow}`, projectText, { align: 'center', border: thinBlue() });
  const dataLines = Math.max(
    estimateWrappedLines(paymentTermText, PAY_COL_W),
    estimateWrappedLines(deliveryTermText, DLVR_COL_W),
    estimateWrappedLines(projectText, PROJ_COL_W)
  );
  ws.getRow(dataRow).height = rowHeightForLines(dataLines);
  row += 2;

  // ── Items table ──────────────────────────────────────────────────────
  // const headerRow = row;
const itemsHeaderRow = row;
const headers = ['ITEM NO.', 'GL CODE', 'DESCRIPTION', 'Unit of Measure', 'QTY', 'UNIT PRICE', 'Amount'];
headers.forEach((h, i) => {
  setCell(ws, ws.getCell(itemsHeaderRow, i + 1).address, h, {
    bold: true, align: 'center', fill: CYAN_BG, border: thinBlue(),
  });
});
row += 1;

  // Scope of work row
  mt.merge(ws, `A${row}:G${row}`);
  const scopeText = `Scope of Work:- ${poData.DESCRIPTION || ''}${(termsInfo?.REMARKS ?? poData.REMARKS) ? `\n${termsInfo?.REMARKS ?? poData.REMARKS}` : ''}`;
  setCell(ws, `A${row}`, scopeText, { bold: true, align: 'left', border: thinBlue() });
  ws.getRow(row).height = rowHeightForLines(estimateWrappedLines(scopeText, COLS === 7 ? 46 + 8 + 9 + 15 + 9 + 15 + 17 : 120, true));
  row += 1;

  const sortedItems = [...poItems].sort((a, b) => Number(a.ITEM_SEQUENCE_NO) - Number(b.ITEM_SEQUENCE_NO));

  sortedItems.forEach((item, idx) => {
    const qty = item.ALLOCATED_APPROVED_QUANTITY ? formatAmount(item.ALLOCATED_APPROVED_QUANTITY) : formatAmount(item.PO_MOD_AMOUNT);
    const unitPrice = item.PO_MOD_AMOUNT ? formatAmount(item.PO_MOD_AMOUNT) : formatAmount(item.FINAL_RATE);
    const amount = Number(qty) * Number(unitPrice);
    const description = item.SERVICE_RM_FLAG === 'RM' && item.ITEM_CODE !== 'NEWITEM' ? item.ITEM_DESP : item.ADDL_ITEM_DESC;

    setCell(ws, `A${row}`, item.ITEM_SEQUENCE_NO || idx + 1, { align: 'center', border: thinBlue() });
    setCell(ws, `B${row}`, item.COST_CODE || '', { align: 'center', border: thinBlue() });
    setCell(ws, `C${row}`, description || '', { bold: true, align: 'left', border: thinBlue() });
    setCell(ws, `D${row}`, item.PRINT_UOM || '', { bold: true, align: 'center', border: thinBlue() });
    setCell(ws, `E${row}`, qty === 0 ? '' : qty, { bold: true, align: 'center', border: thinBlue() });
    const upCell = setCell(ws, `F${row}`, unitPrice === 0 ? '' : Number(unitPrice), { bold: true, align: 'right', border: thinBlue() });
    upCell.numFmt = '#,##0.00';
    const amtCell = setCell(ws, `G${row}`, amount === 0 ? '' : amount, { bold: true, align: 'right', border: thinBlue() });
    amtCell.numFmt = '#,##0.00';
    row += 1;
  });

  // Total row
  mt.merge(ws, `A${row}:F${row}`);
  setCell(ws, `A${row}`, `Total: ${spellNumber(totalAmount, poData.CURR_CODE)}`, { bold: true, align: 'left', border: thinBlue() });
  const totalCell = setCell(ws, `G${row}`, totalAmount, { bold: true, align: 'right', fill: CYAN_BG, border: thinBlue() });
  totalCell.numFmt = '#,##0.00';
  row += 2;

  // ── Terms paragraph ──────────────────────────────────────────────────
  mt.merge(ws, `A${row}:G${row}`);
  const termsPara = [
    `Above is as per attached quotation Ref: ${poData.QUATATION_REFERENCE || '-'}`,
    poData.REASON_FOR_PO_MODIFY || '',
    termsInfo?.REMARKS ?? poData.REMARKS ?? '',
  ]
    .filter(Boolean)
    .join('\n');
  setCell(ws, `A${row}`, termsPara, { bold: true, size: 9, align: 'left' });
  ws.getRow(row).height = 16 * (termsPara.split('\n').length || 1);
  row += 1;

  mt.merge(ws, `A${row}:G${row}`);
  setCell(
    ws,
    `A${row}`,
    '1. Our order number is to be quoted on all relevant Invoices & Delivery Notes. Your Invoice to be submitted against the actual Delivery/services to our Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable with all Original copies.',
    { size: 8.5, align: 'left' }
  );
  ws.getRow(row).height = 30;
  row += 1;

  [
    '2. Notify Procurement Dept. immediately if you are unable to ship/deliver as specified.',
    '3. Send all correspondence to: procurement@the-maintainers.com',
    'Procurement Department',
    'P.O. Box: 201325, 11th Floor Lusail Marina Tower No.50 Lusail-Qatar',
    'Phone: 8974 4404 0800 Fax: +974 4404 0801',
  ].forEach((line) => {
    mt.merge(ws, `A${row}:G${row}`);
    setCell(ws, `A${row}`, line, { size: 8.5, align: 'left' });
    row += 1;
  });

  row += 1;

  // ── Signature grid ───────────────────────────────────────────────────
  const sigTop = row;
  mt.merge(ws, `A${sigTop}:C${sigTop}`);
  setCell(ws, `A${sigTop}`, 'For Supplier:', { bold: true, align: 'left', border: thinDark() });
  mt.merge(ws, `D${sigTop}:G${sigTop}`);
  setCell(ws, `D${sigTop}`, `For ${div?.name || ''}:`, { bold: true, align: 'center', border: thinDark() });
  row += 1;

  mt.merge(ws, `A${row}:C${row}`);
  setCell(ws, `A${row}`, 'I have read & agreed to all terms and conditions.', { bold: true, align: 'left', border: thinDark() });

  mt.merge(ws, `D${row}:G${row}`);
  if (signature && signatureImg) {
    const sigBuf = await fetchAsBuffer(signatureImg);
    if (sigBuf) {
      const imgId = workbook.addImage({ buffer: sigBuf as any, extension: guessExtension(signatureImg) });
      ws.addImage(imgId, { tl: { col: 4.3, row: row - 1 + 0.05 }, ext: { width: 100, height: 40 } });
      setCell(ws, `D${row}`, '', { border: thinDark() });
    }
  } else {
    setCell(ws, `D${row}`, 'This Document Is Electronically Approved', { align: 'center', border: thinDark() });
  }
  ws.getRow(row).height = 34;
  row += 2;

  mt.merge(ws, `A${row}:B${row}`);
  setCell(ws, `A${row}`, 'Signature', { bold: true, align: 'center', border: thinDark() });
  mt.merge(ws, `C${row}:C${row}`);
  setCell(ws, `C${row}`, 'Date', { bold: true, align: 'center', border: thinDark() });
  mt.merge(ws, `D${row}:E${row}`);
  setCell(ws, `D${row}`, 'Signature', { bold: true, align: 'center', border: thinDark() });
  mt.merge(ws, `F${row}:G${row}`);
  setCell(ws, `F${row}`, 'Date', { bold: true, align: 'center', border: thinDark() });
  row += 1;

  borderRange(ws, sigTop, row - 1, thinDark());

  row += 1;

  // ── Footer strip ─────────────────────────────────────────────────────
  const refNo = poData.REF_DOC_NO || '';
  let footerTitle = 'THE MAINTAINERS: Toll Free Number: 800-8050.';
  let footerWebsite = 'Website: the-maintainers.com';
  let formTag = 'FS05 REV 01';
  let issuedDate = `Form Issued Date: ${orderDate}`;

  if (refNo.startsWith('AJSS')) {
    footerTitle = 'AL JASSRA SECURITY SERVICES: Toll Free Number: 800-8050.';
    footerWebsite = 'Website: aljassrasecurity.com';
    issuedDate = 'Form Issued Date: 26-02-2020';
  } else if (refNo.startsWith('AND')) {
    footerTitle = 'AND MARKETING EVENTS AND ENTERTAINMENTS: Toll Free Number: 800-8050.';
    footerWebsite = 'Website: andagencyqatar.com';
    formTag = 'F502 REV 00';
    issuedDate = '';
  }

  mt.merge(ws, `A${row}:B${row}`);
  setCell(ws, `A${row}`, formTag, { bold: true, size: 9, align: 'left', fill: CYAN_BG, border: thinDark() });
  mt.merge(ws, `C${row}:E${row}`);
  setCell(ws, `C${row}`, footerTitle, { bold: true, size: 9, align: 'center', fill: CYAN_BG, border: thinDark() });
  mt.merge(ws, `F${row}:G${row}`);
  setCell(ws, `F${row}`, issuedDate, { bold: true, size: 9, align: 'right', fill: CYAN_BG, border: thinDark() });
  row += 1;

  mt.merge(ws, `A${row}:G${row}`);
  setCell(ws, `A${row}`, footerWebsite, { bold: true, size: 9, align: 'center', fill: CYAN_BG, border: thinDark() });
  row += 2;

  // ── Second sheet: Standard Purchase Terms clauses ────────────────────
  if (div.clauses?.length) {
    const ws2 = workbook.addWorksheet('Terms & Conditions', { views: [{ showGridLines: false }] });
    ws2.columns = [{ width: 4 }, { width: 34 }, { width: 4 }, { width: 4 }, { width: 34 }, { width: 4 }, { width: 4 }, { width: 34 }];
    ws2.mergeCells('A1:H1');
    setCell(ws2, 'A1', 'Standard Purchase Terms', { bold: true, italic: true, underline: true, align: 'center', size: 12 });

    const colStarts = ['B', 'E', 'H']; // 3 pseudo-columns to mimic the printed 3-column layout
    const colRow = [2, 2, 2];
    div.clauses.forEach((clause, i) => {
      const col = colStarts[i % 3];
      const r = colRow[i % 3];
      setCell(ws2, `${col}${r}`, `${clause.title}\n${clause.body}`, { size: 8, align: 'left' });
      ws2.getRow(r).height = Math.max(30, Math.ceil(clause.body.length / 30) * 12);
      colRow[i % 3] += 1;
    });
  }

  // ── Save / download ──────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `PurchaseOrder_${(poData.REF_DOC_NO || 'PO').replace(/[\\/:*?"<>|]/g, '_')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}