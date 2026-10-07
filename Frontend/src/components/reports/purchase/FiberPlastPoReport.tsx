import React, { useMemo, useRef, useState } from 'react';
import { Autocomplete, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useQuery } from '@tanstack/react-query';
import { useReactToPrint } from 'react-to-print';
// import useAuth from 'hooks/useAuth';
import WmsSerivceInstance from 'service/wms/service.wms';
import { dynamicData } from 'pages/Report/components/dynamicData';
import { cancel, draft } from 'pages/Report/components/img';
import { spellNumber } from 'pages/Report/components/functions';
import { FP_CLAUSES, Clause } from 'pages/Report/components/fiberplastTerms';
import { exportFiberPlastPoToExcel, FpExcelLine } from './Fiberplastpoexcelexport';
// ** FiberPlast (AJFP) PO Report **

/* ───────────────────────────── CONFIG ───────────────────────────── */

const SIGNATORY_LOGINID = 'USER_PM';
const UNIT_PRICE_DECIMALS = 6;

// Static company text used when dynamicData has no entry / images for this division.
const COMPANY = {
  name: 'AL JASSRA FIBERPLAST LLC',
  shortName: 'Al Jassra Fiberplast LLC',
  website: 'aljassra-fiberplast.com',
  procurementEmail: 'procurement@aljassra-fiberplast.com',
  formTag: 'F505 REV 00',
  footerLine1: 'P.O. Box : 23300, Doha - Qatar, C.R No. : 122339, Tel: (+974) 4432 6930, Fax: (+974) 4432 1102',
  footerLine2: 'E-mail: info@aljassra-fiberplast.com, Website : www.aljassra-fiberplast.com'
};

// General terms printed under the items table (used by both the print view and the Excel export).
const GENERAL_TERMS: string[] = [
  '1. Our order number is to be quoted on all relevant Invoices & Delivery Notes. Your Invoice to be submitted against the actual Delivery/Services to our Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable with all Original copies.',
  '2. Notify Procurement Dept. immediately if you are unable to ship/deliver as specified.',
  `3. Send all correspondence to: ${COMPANY.procurementEmail}`,
  'Procurement Department',
  'P.O. Box: 201325, 11th Floor Lusail Marina Tower No.50 Lusail-Qatar',
  'Phone: +974 4404 0800   Fax: +974 4404 0801'
];

const CYAN_BG = '#e3f2fd';
const BORDER_BLUE = '#9bb1cc';
const SIGNATURE_BOX_HEIGHT_PX = 110;
const TERMS_GAP_PX = 10;

const PRINT_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    margin: 10mm 10mm 14mm 10mm;
    @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;

/* ───────────────────────────── HELPERS ───────────────────────────── */

type Row = Record<string, any>;

const esc = (v: unknown) => String(v ?? '').replace(/'/g, "''");
const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === '';

const toNum = (v: unknown): number => {
  if (isBlank(v)) return 0;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const toRows = (res: any): Row[] => {
  const rows: any[] = Array.isArray(res) ? res : res?.data ?? [];
  return rows.map((r) => Object.fromEntries(Object.entries(r ?? {}).map(([k, v]) => [k.toUpperCase(), v])));
};

const runSql = (sql: string): Promise<Row[]> => WmsSerivceInstance.executeRawSql(sql).then(toRows);

const fmt = (n: number | null, decimals = 2) =>
  n === null ? '' : n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const fmtQty = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 3 });

/* ── Ported Bold report expressions ───────────────────────────────── */

// WO No - Updated to handle "PO" type and use WO_NUMBER from API
const getWoNo = (row: Row): string => {
  const type = row.TYPE_OF_PR;
  const wo = row.WO_NUMBER;
  if (type === 'Charge to Customer') return `${wo ?? ''} - Chargeable`;
  if (type === 'Non Chargeable') return isBlank(wo) ? 'WO-N/A - Non-Chargeable' : `${wo} - Non-Chargeable`;
  if (type === 'PO') return wo || 'Charge to Employee';
  return 'Charge to Employee';
};

// Quantity: Use QTY_PUOM from API, fallback to ALLOCATED_APPROVED_QUANTITY
const getQty = (row: Row): number => {
  if (!isBlank(row.QTY_PUOM)) return toNum(row.QTY_PUOM);
  return isBlank(row.ALLOCATED_APPROVED_QUANTITY) ? toNum(row.PO_MOD_APPR_QTY) : toNum(row.ALLOCATED_APPROVED_QUANTITY);
};

// Unit Price: Use FINAL_RATE from API, fallback to PO_MOD_FINAL_RATE
const getUnitPrice = (row: Row): number | null => {
  const finalRate = toNum(row.FINAL_RATE);
  const modRate = toNum(row.PO_MOD_FINAL_RATE);
  if (modRate === 0 && finalRate === 0) return null;
  return modRate !== 0 ? modRate : finalRate;
};

// Amount: quantity * unit price
const getAmount = (row: Row): number | null => {
  const qty = getQty(row);
  const price = getUnitPrice(row);
  if (!qty || price === null) return null;
  return qty * price;
};

// Item Description: Use ITEM_DESP from API
const getItemDesc = (row: Row): string => row.ITEM_DESP || row.ADDL_ITEM_DESC || '';

/* ───────────────────────────── STYLES ───────────────────────────── */

const thBase: React.CSSProperties = {
  border: `1px solid ${BORDER_BLUE}`,
  padding: '4px 3px',
  fontSize: 10,
  fontWeight: 700,
  backgroundColor: CYAN_BG,
  textAlign: 'center',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap'
};

const tdBase: React.CSSProperties = {
  border: `1px solid ${BORDER_BLUE}`,
  padding: '5px 6px',
  fontSize: 10,
  verticalAlign: 'top'
};

const LV = ({ l, v, bold }: { l: string; v: React.ReactNode; bold?: boolean }) => (
  <>
    <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>{l}</Typography>
    <Typography sx={{ fontSize: 10.5, fontWeight: bold ? 700 : 400 }}>{v}</Typography>
  </>
);

/* ───────────────────────────── COMPONENT ───────────────────────────── */

const FiberPlastPoReport: React.FC = () => {
  const companyCode: string = 'BSG';

  const [docNo, setDocNo] = useState<string | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const companyClause = (col: string) => (companyCode ? `${col} = '${esc(companyCode)}' AND ` : '');
  const docKey = `REPLACE('${esc(docNo)}', '/', '$')`;

  /* 1. PO dropdown list */
  const { data: poList = [], isFetching: poListLoading } = useQuery<string[]>({
    queryKey: ['fp_po_list', companyCode],
    staleTime: 1000 * 60 * 5,
    queryFn: () =>
      runSql(
        `SELECT DISTINCT DOC_NO FROM VW_BOIM_PO_PRINT ${companyCode ? `WHERE COMPANY_CODE = '${esc(companyCode)}'` : ''} ORDER BY DOC_NO DESC`
      ).then((rows) => rows.map((r) => String(r.DOC_NO ?? '')).filter(Boolean))
  });

  /* 2. Main PO rows */
  const { data: mainRows, isFetching: mainLoading } = useQuery<Row[]>({
    queryKey: ['fp_po_main', companyCode, docNo],
    staleTime: 1000 * 60 * 5,
    enabled: !!docNo,
    queryFn: () =>
      runSql(
        `SELECT * FROM VW_BOIM_PO_PRINT PO_REGISTER WHERE ${companyClause('COMPANY_CODE')} REPLACE(DOC_NO, '/', '$') = ${docKey}`
      )
  });

  /* 3. Delivery term / remarks / payment terms */
  const { data: termsInfo, isFetching: termsLoading } = useQuery<Row | undefined>({
    queryKey: ['fp_po_terms', companyCode, docNo],
    staleTime: 1000 * 60 * 5,
    enabled: !!docNo,
    queryFn: () =>
      runSql(
        `SELECT DISTINCT DLVR_TERM, REMARKS, PAYMENT_TERMS FROM VW_BOIM_PO_PRINT WHERE ${companyClause('COMPANY_CODE')} REPLACE(DOC_NO, '/', '$') = ${docKey}`
      ).then((rows) => rows[0])
  });

  /* 4. Buyer name */
  const { data: buyerInfo, isFetching: buyerLoading } = useQuery<Row | undefined>({
    queryKey: ['fp_po_buyer', companyCode, docNo],
    staleTime: 1000 * 60 * 5,
    enabled: !!docNo,
    queryFn: () =>
      runSql(`
        SELECT REAL_NAME FROM SEC_LOGIN WHERE LOGINID IN (
          SELECT LAST_UPDATED FROM VW_BUYER_INFO
          WHERE REPLACE(REQUEST_NUMBER, '/', '$') IN (
            SELECT DISTINCT REPLACE(REQUEST_NUMBER, '/', '$') FROM VW_BO_PO_PRINT
            WHERE ${companyClause('Company_code')} REPLACE(Ref_doc_no, '/', '$') = ${docKey}
          )
        )
      `).then((rows) => rows[0])
  });

  /* 5. Delivery store / contact */
  const { data: deliveryInfo, isFetching: deliveryLoading } = useQuery<Row | undefined>({
    queryKey: ['fp_po_delivery', companyCode, docNo],
    staleTime: 1000 * 60 * 5,
    enabled: !!docNo,
    queryFn: () =>
      runSql(`
        SELECT STORE_NAME, CONTACT_NUMBER, CONTACT_PERSON FROM MS_PS_PROJECT_MASTER
        WHERE PROJECT_CODE IN (
          SELECT PROJECT_CODE FROM VW_BO_PO_PRINT PO_REGISTER
          WHERE ${companyClause('Company_code')} REPLACE(Ref_doc_no, '/', '$') = ${docKey}
        )
      `).then((rows) => rows[0])
  });

  /* 6. Approver signature path */
  const { data: signatureInfo } = useQuery<Row | undefined>({
    queryKey: ['fp_po_signature', SIGNATORY_LOGINID],
    staleTime: 1000 * 60 * 30,
    queryFn: () => runSql(`SELECT PATH_SIGN FROM SEC_LOGIN WHERE LOGINID = '${esc(SIGNATORY_LOGINID)}'`).then((rows) => rows[0])
  });

  const isLoading = mainLoading || termsLoading || buyerLoading || deliveryLoading;

  const items = useMemo(
    () => [...(mainRows ?? [])].sort((a, b) => toNum(a.ITEM_SEQUENCE_NO) - toNum(b.ITEM_SEQUENCE_NO)),
    [mainRows]
  );
  const poData: Row | null = items.length > 0 ? items[0] : null;

  const div = (dynamicData as Record<string, any>)[String(poData?.DIV_CODE ?? '')];

  const clauses: Clause[] = Array.isArray(div?.clauses) && div.clauses.length > 0 ? div.clauses : FP_CLAUSES;

  const status = useMemo(() => {
    if (!poData) return undefined;
    if (poData.PO_CANCEL === 'Y') return 'Cancelled';
    if (poData.PO_CONFIRM === 'N' && poData.PO_CANCEL === 'N') return 'DRAFT';
    return undefined;
  }, [poData]);

  const orderDate = useMemo(() => {
    if (!poData?.DOC_DATE) return '-';
    const parsed = new Date(poData.DOC_DATE);
    return Number.isNaN(parsed.getTime()) ? String(poData.DOC_DATE) : parsed.toLocaleDateString('en-GB');
  }, [poData]);

  const totalAmount = useMemo(() => items.reduce((sum, r) => sum + (getAmount(r) ?? 0), 0), [items]);
  const discountAmount = toNum(poData?.DISC_HDR || poData?.DISCOUNT_AMOUNT);
  const discountedTotal = totalAmount - discountAmount;
  const currCode = poData?.CURR_CODE || 'QAR';

  const signaturePath = String(signatureInfo?.PATH_SIGN ?? '').trim();
  const canShowSignature = /^(https?:|data:|\/)/i.test(signaturePath);

  const now = new Date();
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const printDate = `${String(now.getDate()).padStart(2, '0')}-${MONTHS[now.getMonth()]}-${now.getFullYear()}`;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: docNo ? `PO-${docNo.replace(/[\\/]/g, '-')}` : 'Purchase-Order',
    pageStyle: PRINT_PAGE_STYLE
  });

  /* ───────────── Excel export ───────────── */

  const handleExportExcel = async () => {
    if (!poData || !docNo) return;
    setIsExportingExcel(true);
    try {
      const paymentTerms = termsInfo?.PAYMENT_TERMS ?? poData.PAYMENT_TERMS;
      const deliveryTerm = termsInfo?.DLVR_TERM ?? poData.DLVR_TERM;
      const remarks = termsInfo?.REMARKS ?? poData.REMARKS;
      const project = [poData.PROJECT_CODE?.trim(), poData.PROJECT_NAME].filter(Boolean).join(': ');

      const lines: FpExcelLine[] = items.map((row, i) => {
        const qty = getQty(row);
        return {
          seq: row.ITEM_SEQUENCE_NO || i + 1,
          gl: row.ITEM_CODE || '',
          desc: getItemDesc(row),
          pUom: row.P_UOM || '',
          qtyPuom: qty ? qty : null,
          lUom: row.L_UOM || '',
          qtyLuom: isBlank(row.QTY_LUOM) ? null : toNum(row.QTY_LUOM),
          unitPrice: getUnitPrice(row),
          amount: getAmount(row)
        };
      });

      await exportFiberPlastPoToExcel({
        company: COMPANY,
        divName: div?.name,
        docNo: String(poData.DOC_NO ?? docNo),
        orderDate,
        buyer: buyerInfo?.REAL_NAME || poData.BUYER || '-',
        deliveryAddress: deliveryInfo?.STORE_NAME || poData.PROJECT_NAME || poData.DELIVERY_ADDRESS || '-',
        contactName: deliveryInfo?.CONTACT_PERSON || poData.CONTACT_PERSON || '-',
        contactNo: deliveryInfo?.CONTACT_NUMBER || poData.CONTACT_NUMBER || '-',
        prNo: poData.PR_NO || poData.REQUEST_NUMBER || '-',
        woNo: getWoNo(poData),
        supplier: {
          code: poData.SUPP_CODE || '-',
          name: poData.SUPP_NAME || '',
          address: poData.ADDRESS || '',
          tel: poData.SUPP_TELNO1 || '-',
          fax: poData.PARTY_FAX || poData.SUPP_FAXNO1 || '-',
          mob: poData.MOBILE ?? '',
          email: poData.SUPP_EMAIL1 || '-'
        },
        paymentTerms: paymentTerms ?? '',
        deliveryTerm: deliveryTerm ?? '',
        project,
        scopeOfWork: poData.SCOPE_WORK || poData.DESCRIPTION || '',
        remarks: remarks ?? '',
        lines,
        currCode,
        totalAmount,
        totalInWords: spellNumber(totalAmount, poData.CURR_CODE),
        discountAmount,
        discountedTotal,
        discountedInWords: spellNumber(discountedTotal, poData.CURR_CODE),
        quotationRef: poData.QUATATION_REFERENCE,
        reasonForModify: poData.REASON_FOR_PO_MODIFY,
        generalTerms: GENERAL_TERMS,
        status: status as 'DRAFT' | 'Cancelled' | undefined,
        signatureUrl: canShowSignature ? signaturePath : undefined,
        printDate,
        clauses
      });
    } catch (err) {
      console.error('Excel export failed:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  /* ───────────── render pieces ───────────── */

  const renderPageHeader = () => {
    // const hasImages = div && (div.logoYes || div.headerYes);
    // if (!hasImages) {
    //   return (
    //     <Box sx={{ pb: '4px', mb: 0.5 }}>
    //       <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{COMPANY.name}</Typography>
    //     </Box>
    //   );
    // }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '4px', mb: 0.5 }}>
        {/* {div.logoYes && (
          <Box sx={{ width: div.logoWidth ?? '32%', display: 'flex', justifyContent: 'flex-start' }}>
            <img src={div.logo} alt="logo" style={{ maxHeight: '65px', objectFit: 'contain' }} />
          </Box>
        )} */}
        {/* {div.headerYes && (
          <Box sx={{ width: div.headerWidth ?? '63%', display: 'flex', justifyContent: 'flex-end' }}>
            <img src={div.header} alt="header text" style={{ maxHeight: '65px', objectFit: 'contain' }} />
          </Box>
        )} */}
      </Box>
    );
  };

  const renderSignRow = () => (
    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', px: 1 }}>
      <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 700, fontSize: 11 }}>Signature</Box>
      <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 700, fontSize: 11 }}>Date</Box>
    </Box>
  );

  const renderSignatureBlock = () => (
    <Box className="print-avoid" sx={{ border: '1.5px solid #000', boxSizing: 'border-box', mt: 1 }}>
      <Box sx={{ display: 'flex', height: `${SIGNATURE_BOX_HEIGHT_PX}px`, boxSizing: 'border-box' }}>
        <Box sx={{ width: '50%', borderRight: '1.5px solid #000', p: '4px 10px 6px 4px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 11, mb: 1.5 }}>For Supplier:</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 11 }}>I have read &amp; agreed to all terms and conditions.</Typography>
          </Box>
          {renderSignRow()}
        </Box>
        <Box sx={{ width: '50%', p: '4px 4px 6px 10px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 11, mb: 1, textAlign: 'center' }}>For {div?.name || COMPANY.name} :</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {canShowSignature && (
                <img src={signaturePath} alt="Signature" style={{ maxWidth: '100px', maxHeight: '40px', height: 'auto' }} />
              )}
            </Box>
          </Box>
          {renderSignRow()}
        </Box>
      </Box>

      <Box sx={{ backgroundColor: CYAN_BG, borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', px: 1, py: 0.75 }}>
        <Typography align="center" sx={{ fontWeight: 700, fontSize: 11 }}>{COMPANY.shortName}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, minWidth: '110px' }}>{COMPANY.formTag}</Typography>
          <Typography align="center" sx={{ fontSize: 11, fontWeight: 700, flex: 1 }}>Website: {COMPANY.website}</Typography>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, minWidth: '170px', textAlign: 'right' }}>Form Issued Date:{printDate}</Typography>
        </Box>
      </Box>

      {div?.footerYes ? (
        div.multipleFooters ? (
          <Box sx={{ py: 0.6, px: 0.5, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            {div.multipleFooterImages?.map((footerImg: string, idx: number) => (
              <img key={idx} src={footerImg} alt={`Footer ${idx + 1}`} style={{ width: '25%', height: 'auto', objectFit: 'fill' }} />
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 0.6, px: 0.5 }}>
            <img src={div.footer} alt="Footer" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
          </Box>
        )
      ) : (
        <Box sx={{ backgroundColor: '#222', color: '#fff', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>
          <Box sx={{ py: 0.5 }}>{COMPANY.footerLine1}</Box>
          <Box sx={{ py: 0.5, backgroundColor: '#666' }}>{COMPANY.footerLine2}</Box>
        </Box>
      )}
    </Box>
  );

  const renderReport = (po: Row) => {
    const paymentTerms = termsInfo?.PAYMENT_TERMS ?? po.PAYMENT_TERMS;
    const deliveryTerm = termsInfo?.DLVR_TERM ?? po.DLVR_TERM;
    const remarks = termsInfo?.REMARKS ?? po.REMARKS;
    const project = [po.PROJECT_CODE?.trim(), po.PROJECT_NAME].filter(Boolean).join(': ');

    return (
      <Box
        ref={printRef}
        className="print-container"
        sx={{
          width: '190mm',
          maxWidth: '100%',
          mx: 'auto',
          p: 2,
          backgroundColor: '#fff',
          color: '#111',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 10,
          lineHeight: 1.2,
          boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
          '@media print': {
            width: '190mm',
            p: 0,
            boxShadow: 'none',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            '& .print-avoid': { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& table': { pageBreakInside: 'auto' },
            '& tr': { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& thead': { display: 'table-header-group' },
            '& img': { maxWidth: '100%', height: 'auto' }
          }
        }}
      >
        {renderPageHeader()}

        <Box sx={{ border: '2px solid #000', boxSizing: 'border-box', px: 1, py: 1 }}>
          <Box className="print-avoid" sx={{ px: 1, pt: 0.25, pb: 0.5 }}>
            <Typography align="center" sx={{ fontWeight: 800, fontSize: 16, mb: 0.5, textDecoration: 'underline' }}>
              PURCHASE ORDER
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: status ? '1fr 0.5fr 1.5fr' : '1fr 1fr', gap: 2 }}>
              {/* Supplier */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 10.5, mb: 0.5 }}>Supplier Details:</Typography>
                <Typography sx={{ fontSize: 10.5 }}>Supplier Number: {po.SUPP_CODE || '-'}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>{po.SUPP_NAME}</Typography>
                <Typography sx={{ fontSize: 10.5 }}>P.O Box No: {po.ADDRESS}</Typography>
                <Typography sx={{ fontSize: 10.5 }}>TEL- {po.SUPP_TELNO1 || '-'}</Typography>
                <Typography sx={{ fontSize: 10.5 }}>FAX- {po.PARTY_FAX || po.SUPP_FAXNO1 || '-'}</Typography>
                <Typography sx={{ fontSize: 10.5 }}>MOB - {po.MOBILE ?? ''}</Typography> {/* Fixed: Removed '-' fallback */}
                <Typography sx={{ fontSize: 10.5 }}>EMAIL: {po.SUPP_EMAIL1 || '-'}</Typography>
              </Box>

              {status && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={status === 'Cancelled' ? cancel : draft}
                    alt="status"
                    style={{ maxWidth: '150px', maxHeight: '70px', objectFit: 'contain' }}
                  />
                </Box>
              )}

              {/* PO info */}
              <Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '130px 1fr',
                    rowGap: 0.25,
                    '& > :nth-of-type(odd)': { textAlign: 'right', pr: 1 }
                  }}
                >
                  <LV l="Purchase Order No:" v={po.DOC_NO} bold />
                  <LV l="DATE:" v={orderDate} bold />
                  <LV l="Buyer:" v={buyerInfo?.REAL_NAME || po.BUYER || '-'} bold />
                  <LV l="Delivery Address :" v={deliveryInfo?.STORE_NAME || po.PROJECT_NAME || po.DELIVERY_ADDRESS || '-'} />
                  <LV l="Contact Name :" v={deliveryInfo?.CONTACT_PERSON || po.CONTACT_PERSON || '-'} />
                  <LV l="Contact No :" v={deliveryInfo?.CONTACT_NUMBER || po.CONTACT_NUMBER || '-'} />
                  <LV l="PR. No :" v={po.PR_NO || po.REQUEST_NUMBER || '-'} />
                  <LV l="WO No :" v={getWoNo(po)} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Payment / delivery / project strip */}
          <table className="print-avoid" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={thBase}>PAYMENT TERM</th>
                <th style={thBase}>DELIVERY TERM / PERIOD</th>
                <th style={thBase}>PROJECT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...tdBase, textAlign: 'center' }}>{paymentTerms}</td>
                <td style={{ ...tdBase, textAlign: 'center' }}>{deliveryTerm}</td>
                <td style={{ ...tdBase, textAlign: 'center' }}>{project}</td>
              </tr>
            </tbody>
          </table>

          {/* Items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ ...thBase, width: '5%' }}>ITEM</th>
                <th style={{ ...thBase, width: '7%' }}>GL</th>
                <th style={{ ...thBase, width: '34%' }}>DESCRIPTION</th>
                <th style={{ ...thBase, width: '7%' }}>P Uom</th>
                <th style={{ ...thBase, width: '9%' }}>Qty Puom</th>
                <th style={{ ...thBase, width: '7%' }}>L Uom</th>
                <th style={{ ...thBase, width: '9%' }}>Qty Luom</th>
                <th style={{ ...thBase, width: '11%' }}>UNIT PRICE</th>
                <th style={{ ...thBase, width: '11%' }}>{`Amount(${currCode})`}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={9}
                  style={{ border: `1px solid ${BORDER_BLUE}`, padding: '4px 6px', fontWeight: 700, fontSize: 10.5, backgroundColor: '#fff' }}
                >
                  Scope of Work:- {po.SCOPE_WORK || po.DESCRIPTION}
                  {remarks && (
                    <>
                      <br />
                      <span style={{ fontWeight: 400 }}>{remarks}</span>
                    </>
                  )}
                </td>
              </tr>

              {items.map((row, i) => {
                const qty = getQty(row);
                const price = getUnitPrice(row);
                const amount = getAmount(row);
                return (
                  <tr key={`${row.ITEM_SEQUENCE_NO ?? i}-${i}`}>
                    <td style={{ ...tdBase, textAlign: 'center' }}>{row.ITEM_SEQUENCE_NO || i + 1}</td>
                    <td style={{ ...tdBase, textAlign: 'center' }}>{row.ITEM_CODE || ''}</td>
                    <td style={{ ...tdBase, fontWeight: 700 }}>{getItemDesc(row)}</td>
                    <td style={{ ...tdBase, textAlign: 'center', fontWeight: 700 }}>{row.P_UOM || ''}</td>
                    <td style={{ ...tdBase, textAlign: 'center', fontWeight: 700 }}>{qty ? fmtQty(qty) : ''}</td>
                    <td style={{ ...tdBase, textAlign: 'center' }}>{row.L_UOM || ''}</td>
                    {/* Fixed: Show 0 instead of blank */}
                    <td style={{ ...tdBase, textAlign: 'center' }}>{isBlank(row.QTY_LUOM) ? '' : fmtQty(toNum(row.QTY_LUOM))}</td>
                    <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700 }}>{fmt(price, UNIT_PRICE_DECIMALS)}</td>
                    <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700, backgroundColor: CYAN_BG }}>{fmt(amount)}</td>
                  </tr>
                );
              })}

              {/* Totals */}
              <tr>
                <td colSpan={8} style={{ border: `1px solid ${BORDER_BLUE}`, padding: '3px 6px', fontWeight: 700, fontSize: 10.5 }}>
                  Total: {spellNumber(totalAmount, po.CURR_CODE)}
                </td>
                <td style={{ border: `1px solid ${BORDER_BLUE}`, padding: '3px 6px', fontWeight: 700, fontSize: 10.5, textAlign: 'right', backgroundColor: CYAN_BG }}>
                  {fmt(totalAmount)}
                </td>
              </tr>
              <tr>
                <td colSpan={8} style={{ border: `1px solid ${BORDER_BLUE}`, padding: '3px 6px', fontWeight: 700, fontSize: 10.5 }}>
                  Discounted Total: {spellNumber(discountedTotal, po.CURR_CODE)}
                </td>
                <td style={{ border: `1px solid ${BORDER_BLUE}`, padding: '3px 6px', fontWeight: 700, fontSize: 10.5, textAlign: 'right', backgroundColor: CYAN_BG }}>
                  {fmt(discountedTotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Quotation reference + terms text */}
          <Box className="print-avoid" sx={{ px: 1, py: 0.75 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 10 }}>
              Above is as per attached quotation Ref: {po.QUATATION_REFERENCE}
              {po.REASON_FOR_PO_MODIFY && (
                <>
                  <br />
                  {po.REASON_FOR_PO_MODIFY}
                </>
              )}
            </Typography>
            {GENERAL_TERMS.map((line, idx) => (
              <Typography key={idx} sx={{ fontSize: 9.5, ...(idx === 0 ? { mt: 0.5 } : {}) }}>
                {line}
              </Typography>
            ))}
          </Box>

          {renderSignatureBlock()}
        </Box>

        {/* Standard Purchase Terms (own page, 3 columns) */}
        {clauses.length > 0 && (
          <Box sx={{ mt: 2, '@media print': { mt: 0, breakBefore: 'page', pageBreakBefore: 'always' } }}>
            {renderPageHeader()}
            <Box sx={{ border: '2px solid #000', p: '6px 8px', boxSizing: 'border-box' }}>
              <Typography align="center" sx={{ fontWeight: 800, fontSize: 11, fontStyle: 'italic', mb: 0.75, textDecoration: 'underline' }}>
                Standard Purchase Terms
              </Typography>
              <Box sx={{ columnCount: 3, columnGap: `${TERMS_GAP_PX}px`, fontSize: 5.6, lineHeight: 1.05 }}>
                {clauses.map((clause) => {
                  const isIntro = /^standard purchase terms/i.test(clause.title.trim());
                  return (
                    <Box key={clause.title} sx={{ mb: 0.6 }}>
                      {!isIntro && (
                        <Typography component="span" sx={{ fontWeight: 700, fontSize: 5.8, display: 'block' }}>
                          {clause.title}
                        </Typography>
                      )}
                      <Typography component="span" sx={{ fontSize: 5.6, lineHeight: 1.05, display: 'block', whiteSpace: 'pre-line' }}>
                        {clause.body}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  /* ───────────── page ───────────── */

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          size="small"
          sx={{ width: { xs: '100%', sm: 420 } }}
          options={poList}
          value={docNo}
          loading={poListLoading}
          onChange={(_, value) => setDocNo(value)}
          noOptionsText="No purchase orders found"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Purchase Order"
              placeholder="Select / search PO number"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {poListLoading ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          disabled={!poData || isLoading}
          onClick={() => handlePrint()}
          sx={{ textTransform: 'none' }}
        >
          Print
        </Button>
        <Button
          variant="contained"
          startIcon={isExportingExcel ? <CircularProgress color="inherit" size={16} /> : <FileDownloadIcon />}
          disabled={!poData || isLoading || isExportingExcel}
          onClick={handleExportExcel}
          sx={{ textTransform: 'none', backgroundColor: '#1f7a3a', '&:hover': { backgroundColor: '#26a34a' } }}
        >
          {isExportingExcel ? 'Exporting…' : 'Export to Excel'}
        </Button>
      </Box>

      <Box sx={{ backgroundColor: '#eef1f5', p: 2, minHeight: 300, overflow: 'auto' }}>
        {!docNo && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
            <Typography variant="body2">Select a purchase order to view its report.</Typography>
          </Box>
        )}

        {docNo && isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
            <CircularProgress size={28} />
          </Box>
        )}

        {docNo && !isLoading && !poData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
            <Typography variant="body2">No records found for the selected purchase order.</Typography>
          </Box>
        )}

        {docNo && !isLoading && poData && renderReport(poData)}
      </Box>
    </Box>
  );
};

export default FiberPlastPoReport;