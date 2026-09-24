// purchaseOrderExcelExport.ts
import ExcelJS from 'exceljs';
import WmsSerivceInstance from 'service/wms/service.wms';

export interface PurchaseOrderExportData {
  poData: any;
  poItems: any[];
  supplierInfo?: any;
  buyerInfo?: any;
  deliveryInfo?: any;
  termsInfo?: any;
}

const toNum = (v: any): number => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

async function rawSql<T = any>(sql: string): Promise<T[]> {
  const res: any = await WmsSerivceInstance.executeRawSql(sql);
  return Array.isArray(res) ? res : (res?.data ?? []);
}

/**
 * Fetches everything needed to build the Excel file for a given PO.
 */
export async function fetchPurchaseOrderExportData(
  refDocNo: string
): Promise<PurchaseOrderExportData | null> {
  if (!refDocNo) return null;
  const slashed = refDocNo.replace(/\//g, '$');

  const divRows = await rawSql<{ DIV_CODE: string }>(
    `SELECT DISTINCT div_code FROM PURCHASE_REQUEST_DETAILS WHERE ref_doc_no = '${slashed}'`
  );
  const divCode = divRows?.[0]?.DIV_CODE;
  if (!divCode) return null;

  const poRows: any[] = await rawSql(
    `SELECT * FROM VW_BO_PO_PRINT PO_REGISTER
     WHERE div_code = '${divCode}' AND REF_DOC_NO = REPLACE('${slashed}', '$', '/')
     ORDER BY REF_DOC_NO, TO_NUMBER(ITEM_SEQUENCE_NO)`
  );
  if (!poRows.length) return null;

  const poItems = [...poRows].sort(
    (a, b) => Number(a.ITEM_SEQUENCE_NO) - Number(b.ITEM_SEQUENCE_NO)
  );
  const poData = poItems[0];

  let supplierInfo: any;
  try {
    const suppRows: any[] = await rawSql(
      `SELECT SUPP_CODE FROM MS_SUPPLIER_JASRA
       WHERE TRIM(SUPP_NAME) = TRIM('${poData.SUPP_NAME}')
         AND COMPANY_CODE = '${poData.COMPANY_CODE}'`
    );
    const suppCode = suppRows?.[1]?.SUPP_CODE || '';
    if (suppCode) {
      const rows: any[] = await rawSql(
        `SELECT SUPP_CODE, SUPP_TELNO1, SUPP_FAXNO1, MOBILE, SUPP_EMAIL1
         FROM MS_SUPPLIER_JASRA
         WHERE SUPP_CODE = '${suppCode}' AND COMPANY_CODE = '${poData.COMPANY_CODE}'`
      );
      supplierInfo = rows?.[0];
    }
  } catch { /* ignore */ }

  let buyerInfo: any;
  try {
    const rows: any[] = await rawSql(
      `SELECT REAL_NAME FROM SEC_LOGIN
       WHERE LOGINID IN (
         SELECT LAST_UPDATED FROM VW_BUYER_INFO
         WHERE REPLACE(REQUEST_NUMBER, '/', '$') = REPLACE('${poData.REQUEST_NUMBER}', '/', '$')
       )`
    );
    buyerInfo = rows?.[0];
  } catch { /* ignore */ }

  let deliveryInfo: any;
  try {
    const rows: any[] = await rawSql(
      `SELECT STORE_NAME, CONTACT_NUMBER, CONTACT_PERSON
       FROM MS_PS_PROJECT_MASTER
       WHERE PROJECT_CODE = '${poData.PROJECT_CODE}' AND COMPANY_CODE = '${poData.COMPANY_CODE}'`
    );
    deliveryInfo = rows?.[0];
  } catch { /* ignore */ }

  let termsInfo: any;
  try {
    const rows: any[] = await rawSql(
      `SELECT DISTINCT DLVR_TERM, REMARKS, PAYMENT_TERMS, PROJECT_NAME, PROJECT_CODE
       FROM VW_BO_PO_PRINT PO_REGISTER
       WHERE Company_code = '${poData.COMPANY_CODE}'
         AND REPLACE(Ref_doc_no, '/', '$') = REPLACE('${refDocNo}', '/', '$')`
    );
    termsInfo = rows?.[0];
  } catch { /* ignore */ }

  return { poData, poItems, supplierInfo, buyerInfo, deliveryInfo, termsInfo };
}

/**
 * Builds an styled .xlsx workbook from already-loaded PO data and triggers download.
 */
export async function exportPurchaseOrderToExcel(
  data: PurchaseOrderExportData,
  fileName?: string
) {
  const { poData, poItems, supplierInfo, buyerInfo, deliveryInfo, termsInfo } = data;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Purchase Order');

  // ── Column Widths (mimicking PDF layout) ──────────────────────────────
  sheet.columns = [
    { width: 10 }, // A: Item No / Supplier label
    { width: 14 }, // B: GL Code
    { width: 45 }, // C: Description
    { width: 8 },  // D: UOM
    { width: 10 }, // E: Qty
    { width: 14 }, // F: Unit Price
    { width: 16 }, // G: Amount
  ];

  // ── Helper Styles ────────────────────────────────────────────────────
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  const centerAlign: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };
  const rightAlign: Partial<ExcelJS.Alignment> = { horizontal: 'right', vertical: 'middle' };
  const boldFont: Partial<ExcelJS.Font> = { bold: true };

  let currentRow = 1;

  // ── Title ────────────────────────────────────────────────────────────
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const titleCell = sheet.getCell(`A${currentRow}`);
  titleCell.value = 'PURCHASE ORDER';
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = centerAlign;
  currentRow += 2;

  // ── Supplier Details (Left) & PO Details (Right) ────────────────────
  const startDetailsRow = currentRow;

  // Left Side: Supplier Details
  sheet.getCell(`A${currentRow}`).value = 'Supplier Details:';
  sheet.getCell(`A${currentRow}`).font = boldFont;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `Supplier Number: ${supplierInfo?.SUPP_CODE || poData.SUPP_CODE || ''}`;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = poData.SUPP_NAME || '';
  sheet.getCell(`A${currentRow}`).font = boldFont;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = poData.ADDRESS || '';
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `TEL- ${supplierInfo?.SUPP_TELNO1 || ''}`;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `FAX- ${supplierInfo?.SUPP_FAXNO1 || ''}`;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `MOB - ${supplierInfo?.MOBILE || ''}`;
  currentRow++;
  sheet.getCell(`A${currentRow}`).value = `EMAIL: ${supplierInfo?.SUPP_EMAIL1 || ''}`;

  // Right Side: PO Details (Merged D:F)
  let rightRow = startDetailsRow;
  const rightDetails = [
    ['Purchase Order No:', `${poData.REF_DOC_NO} Rev:0`],
    ['DATE:', poData.DOC_DATE ? new Date(poData.DOC_DATE).toLocaleDateString('en-GB') : '-'],
    ['Buyer:', buyerInfo?.REAL_NAME || '-'],
    ['Delivery Address :', deliveryInfo?.STORE_NAME || poData.DELIVERY_ADDRESS || '-'],
    ['Contact Name :', deliveryInfo?.CONTACT_PERSON || '-'],
    ['Contact No :', deliveryInfo?.CONTACT_NUMBER || '-'],
    ['PR. No :', poData.REQUEST_NUMBER || '-'],
    ['WO No :', poData.TYPE_OF_PR || '-'],
  ];

  rightDetails.forEach(([label, value]) => {
    sheet.mergeCells(`D${rightRow}:F${rightRow}`);
    sheet.getCell(`D${rightRow}`).value = label;
    sheet.getCell(`D${rightRow}`).font = boldFont;
    sheet.getCell(`D${rightRow}`).alignment = { horizontal: 'left' };

    sheet.mergeCells(`E${rightRow}:G${rightRow}`);
    sheet.getCell(`E${rightRow}`).value = value;
    sheet.getCell(`E${rightRow}`).alignment = { horizontal: 'left' };
    rightRow++;
  });

  // Move currentRow to after the right details
  currentRow = Math.max(currentRow, rightRow) + 1;

  // ── Payment Term / Delivery Term / Project Table ─────────────────────
  const tableHeaderRow = currentRow;
  sheet.mergeCells(`A${tableHeaderRow}:B${tableHeaderRow}`);
  sheet.getCell(`A${tableHeaderRow}`).value = 'PAYMENT TERM';
  sheet.getCell(`A${tableHeaderRow}`).font = boldFont;
  sheet.getCell(`A${tableHeaderRow}`).alignment = centerAlign;
  sheet.getCell(`A${tableHeaderRow}`).border = thinBorder;

  sheet.mergeCells(`C${tableHeaderRow}:E${tableHeaderRow}`);
  sheet.getCell(`C${tableHeaderRow}`).value = 'DELIVERY TERM / PERIOD';
  sheet.getCell(`C${tableHeaderRow}`).font = boldFont;
  sheet.getCell(`C${tableHeaderRow}`).alignment = centerAlign;
  sheet.getCell(`C${tableHeaderRow}`).border = thinBorder;

  sheet.mergeCells(`F${tableHeaderRow}:G${tableHeaderRow}`);
  sheet.getCell(`F${tableHeaderRow}`).value = 'PROJECT';
  sheet.getCell(`F${tableHeaderRow}`).font = boldFont;
  sheet.getCell(`F${tableHeaderRow}`).alignment = centerAlign;
  sheet.getCell(`F${tableHeaderRow}`).border = thinBorder;

  const tableValueRow = currentRow + 1;
  sheet.mergeCells(`A${tableValueRow}:B${tableValueRow}`);
  sheet.getCell(`A${tableValueRow}`).value = termsInfo?.PAYMENT_TERMS || poData.PAYMENT_TERMS || '';
  sheet.getCell(`A${tableValueRow}`).alignment = centerAlign;
  sheet.getCell(`A${tableValueRow}`).border = thinBorder;

  sheet.mergeCells(`C${tableValueRow}:E${tableValueRow}`);
  sheet.getCell(`C${tableValueRow}`).value = termsInfo?.DLVR_TERM || poData.DLVR_TERM || '';
  sheet.getCell(`C${tableValueRow}`).alignment = centerAlign;
  sheet.getCell(`C${tableValueRow}`).border = thinBorder;

  sheet.mergeCells(`F${tableValueRow}:G${tableValueRow}`);
  sheet.getCell(`F${tableValueRow}`).value = `${termsInfo?.PROJECT_CODE || poData.PROJECT_CODE || ''}: ${termsInfo?.PROJECT_NAME || poData.PROJECT_NAME || ''}`;
  sheet.getCell(`F${tableValueRow}`).alignment = centerAlign;
  sheet.getCell(`F${tableValueRow}`).border = thinBorder;

  currentRow = tableValueRow + 2;

  // ── Items Table Header ───────────────────────────────────────────────
  const itemHeaderRow = currentRow;
  const headers = ['ITEM NO.', 'GL CODE', 'DESCRIPTION', 'UOM', 'QTY', 'UNIT PRICE', 'Amount'];
  headers.forEach((header, index) => {
    const cell = sheet.getCell(itemHeaderRow, index + 1);
    cell.value = header;
    cell.font = boldFont;
    cell.alignment = centerAlign;
    cell.border = thinBorder;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } }; // Light gray background
  });
  currentRow++;

  // ── Scope of Work ────────────────────────────────────────────────────
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const scopeCell = sheet.getCell(`A${currentRow}`);
  scopeCell.value = `Scope of Work:- ${poData.DESCRIPTION || ''}`;
  scopeCell.font = boldFont;
  scopeCell.alignment = { horizontal: 'left', vertical: 'middle' };
  scopeCell.border = thinBorder;
  currentRow++;

  // ── Items Loop ───────────────────────────────────────────────────────
  let totalAmount = 0;
  poItems.forEach((item, idx) => {
    const qty = item.ALLOCATED_APPROVED_QUANTITY
      ? toNum(item.ALLOCATED_APPROVED_QUANTITY)
      : toNum(item.PO_MOD_AMOUNT);
    const unitPrice = item.PO_MOD_AMOUNT
      ? toNum(item.PO_MOD_AMOUNT)
      : toNum(item.FINAL_RATE);
    const amount = qty * unitPrice;
    totalAmount += amount;

    const description =
      item.SERVICE_RM_FLAG === 'RM' && item.ITEM_CODE !== 'NEWITEM'
        ? item.ITEM_DESP
        : item.ADDL_ITEM_DESC;

    const rowData = [
      item.ITEM_SEQUENCE_NO || idx + 1,
      item.COST_CODE || '',
      description || '',
      item.PRINT_UOM || '',
      qty,
      unitPrice,
      amount,
    ];

    rowData.forEach((val, colIdx) => {
      const cell = sheet.getCell(currentRow, colIdx + 1);
      cell.value = val;
      cell.border = thinBorder;
      if (colIdx === 0 || colIdx === 1 || colIdx === 3 || colIdx === 4) {
        cell.alignment = centerAlign;
      } else if (colIdx === 5 || colIdx === 6) {
        cell.alignment = rightAlign;
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }
    });
    currentRow++;
  });

  // ── Total Row ────────────────────────────────────────────────────────
  sheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const totalLabelCell = sheet.getCell(`A${currentRow}`);
  totalLabelCell.value = `Total: ${spellNumber(totalAmount, poData.CURR_CODE)}`;
  totalLabelCell.font = boldFont;
  totalLabelCell.alignment = { horizontal: 'left' };
  totalLabelCell.border = thinBorder;

  const totalValueCell = sheet.getCell(`G${currentRow}`);
  totalValueCell.value = totalAmount;
  totalValueCell.font = boldFont;
  totalValueCell.alignment = rightAlign;
  totalValueCell.border = thinBorder;
  totalValueCell.numFmt = '#,##0.00';

  currentRow += 2;

  // ── Terms & Conditions ───────────────────────────────────────────────
  sheet.mergeCells(`A${currentRow}:G${currentRow}`);
  const termsCell = sheet.getCell(`A${currentRow}`);
  termsCell.value = `Above is as per attached quotation Ref: ${poData.QUATATION_REFERENCE || ''}\n` +
    `${poData.REASON_FOR_PO_MODIFY ? poData.REASON_FOR_PO_MODIFY + '\n' : ''}` +
    `${termsInfo?.REMARKS || poData.REMARKS || ''}`;
  termsCell.alignment = { wrapText: true, vertical: 'top' };
  currentRow++;

  const standardTerms = [
    '1. Our order number is to be quoted on all relevant Invoices & Delivery Notes. Your Invoice to be submitted against the actual Delivery/services to our Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable with all Original copies.',
    '2. Notify Procurement Dept. immediately if you are unable to ship/deliver as specified.',
    '3. Send all correspondence to: procurement@and.qa',
    'Procurement Department',
    'P.O. Box: 201325, 11th Floor Lusail Marina Tower No.50 Lusail-Qatar',
    'Phone: 8974 4404 0800 Fax: +974 4404 0801',
  ];

  standardTerms.forEach((term) => {
    sheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const cell = sheet.getCell(`A${currentRow}`);
    cell.value = term;
    cell.alignment = { wrapText: true, vertical: 'top' };
    currentRow++;
  });

  currentRow += 1;

  // ── Signature Block ──────────────────────────────────────────────────
  const sigStartRow = currentRow;
  
  // Left Side: For Supplier
  sheet.mergeCells(`A${sigStartRow}:C${sigStartRow}`);
  sheet.getCell(`A${sigStartRow}`).value = 'For Supplier:';
  sheet.getCell(`A${sigStartRow}`).font = boldFont;
  sheet.getCell(`A${sigStartRow}`).alignment = { horizontal: 'left' };
  
  sheet.mergeCells(`A${sigStartRow + 1}:C${sigStartRow + 1}`);
  sheet.getCell(`A${sigStartRow + 1}`).value = 'I have read & agreed to all terms and conditions.';
  sheet.getCell(`A${sigStartRow + 1}`).alignment = { horizontal: 'left' };

  // Right Side: For Company
  sheet.mergeCells(`E${sigStartRow}:G${sigStartRow}`);
  sheet.getCell(`E${sigStartRow}`).value = `For, THE MAINTAINERS`; // Or div.name
  sheet.getCell(`E${sigStartRow}`).font = boldFont;
  sheet.getCell(`E${sigStartRow}`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`E${sigStartRow + 1}:G${sigStartRow + 1}`);
  sheet.getCell(`E${sigStartRow + 1}`).value = 'This Document Is Electronically Approved';
  sheet.getCell(`E${sigStartRow + 1}`).alignment = { horizontal: 'center' };

  // Signature Lines
  const lineRow = sigStartRow + 3;
  sheet.mergeCells(`A${lineRow}:B${lineRow}`);
  sheet.getCell(`A${lineRow}`).value = 'Signature';
  sheet.getCell(`A${lineRow}`).border = { top: { style: 'thin' } };
  sheet.getCell(`A${lineRow}`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`C${lineRow}:C${lineRow}`);
  sheet.getCell(`C${lineRow}`).value = 'Date';
  sheet.getCell(`C${lineRow}`).border = { top: { style: 'thin' } };
  sheet.getCell(`C${lineRow}`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`E${lineRow}:F${lineRow}`);
  sheet.getCell(`E${lineRow}`).value = 'Signature';
  sheet.getCell(`E${lineRow}`).border = { top: { style: 'thin' } };
  sheet.getCell(`E${lineRow}`).alignment = { horizontal: 'center' };

  sheet.mergeCells(`G${lineRow}:G${lineRow}`);
  sheet.getCell(`G${lineRow}`).value = 'Date';
  sheet.getCell(`G${lineRow}`).border = { top: { style: 'thin' } };
  sheet.getCell(`G${lineRow}`).alignment = { horizontal: 'center' };

  // ── Generate and Download File ───────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = String(poData.REF_DOC_NO || 'PurchaseOrder').replace(/[\\/:*?"<>|]/g, '_');
  a.download = fileName ?? `${safeName}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Helper function to convert number to words (mimicking the PDF's spellNumber)
// You can replace this with your existing spellNumber import if you have it.
function spellNumber(amount: number, currency: string): string {
  // Basic implementation - replace with your actual logic
  return `${amount.toFixed(2)} ${currency || ''}`; 
}