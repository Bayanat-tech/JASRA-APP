import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import { dynamicData } from './dynamicData';
import { cancel, draft, POsignatureImg as signatureImg } from './img';
import { spellNumber, formatAmount } from './functions';

export interface PurchaseOrderData {
  PO_CANCEL: string;
  REQUEST_NUMBER: string;
  REF_DOC_NO: string;
  DOC_DATE: string;
  SUPP_NAME: string;
  SUPP_CODE: string;
  ADDRESS: string;
  SUPP_CONTACT1: string;
  SUPP_TELNO1: string;
  SUPP_FAXNO1: string;
  SUPP_EMAIL1: string;
  MOBILE: string;
  BUYER: string;
  PAYMENT_TERMS: string;
  DLVR_TERM: string;
  PROJECT_CODE: string;
  PROJECT_NAME: string;
  ITEM_DESP: string;
  DESCRIPTION: string;
  ITEM_RATE: string;
  ITEM_P_QTY: string;
  PRINT_UOM: string;
  AMOUNT: string;
  PO_MOD_AMOUNT: string;
  FINAL_RATE: string;
  CURRENCY_RATE: string;
  CURR_CODE: string;
  LCURR_AMT: string;
  DISCOUNT_AMOUNT: string;
  STATUS: string;
  PO_CONFIRM: string;
  REASON_FOR_PO_MODIFY: string;
  QUATATION_REFERENCE: string;
  DELIVERY_ADDRESS: string;
  TYPE_OF_PR: string;
  REMARKS: string;
  DIV_NAME: string;
  COMPANY_LOGO: string;
  ITEM_SEQUENCE_NO: string;
  ADDL_ITEM_DESC: string;
  COST_CODE: string;
  DIV_CODE: string;
  ALLOCATED_APPROVED_QUANTITY: string | null;
  SERVICE_RM_FLAG: string;
  ITEM_CODE: string;
}

// ── Props: accepts required_values so it can plug into ReportDialogPage ──
export interface PurchaseReportDesignProps {
  required_values: {
    divCode: string;
    refDocNo: string;
  };
}

// ── Pagination constants ────────────────────────────────────────────────
// A4 = 297mm tall, minus the 10mm top + 10mm bottom @page margin = 267mm
// of usable content height per printed page. Converted to CSS px (96dpi)
// so it can be compared against measured DOM element heights.
const MM_TO_PX = 96 / 25.4;
const PAGE_HEIGHT_PX = 267 * MM_TO_PX;
// Safety buffer so rounding / sub-pixel drift between the on-screen
// measurement pass and the real print engine never causes a block to be
// counted as "fits" when it's actually a hair over the page edge.
// If you ever see a block spill onto its own near-empty page again,
// bump this up further — it's the single easiest knob to turn.
const SAFETY_BUFFER_PX = 32;

// ── Component ─────────────────────────────────────────────────────────────

const PurchaseReportDesign = forwardRef<HTMLDivElement, PurchaseReportDesignProps>(
  ({ required_values }, ref) => {
    let { divCode, refDocNo } = required_values;
    console.log('Rendering PurchaseReportDesign with:', { divCode, refDocNo });

    const div_code_sql = useMemo(() => `
      SELECT DISTINCT div_code FROM PURCHASE_REQUEST_DETAILS WHERE ref_doc_no = REPLACE('${refDocNo}', '/', '$')
    `, []);
    const { data: divCodeData } = useQuery({
      queryKey: ['purchase_report_div_code', refDocNo],
      queryFn: () => WmsSerivceInstance.executeRawSql(div_code_sql).then((res: any) => res?.[0]?.DIV_CODE || ''),
      enabled: !!refDocNo,
    });
    if (!divCode && refDocNo) {
      divCode = divCodeData;
    }

    // ── SQL strings ───────────────────────────────────────────────────────
    const sql_string = useMemo(() => `
      SELECT *
      FROM VW_BO_PO_PRINT PO_REGISTER
      WHERE
        div_code = '${divCode}' AND
        REF_DOC_NO = REPLACE('${refDocNo}', '$', '/')
      ORDER BY REF_DOC_NO
    `, [divCode, refDocNo]);

    const sql_for_signature = useMemo(() => `
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
    `, [refDocNo]);

    // ── Queries ───────────────────────────────────────────────────────────
    const { data, isFetching: isDeptdataLoading } = useQuery<PurchaseOrderData[]>({
      queryKey: ['purchase_report_raw_sql', refDocNo],
      staleTime: 1000 * 60 * 5,
      queryFn: () => WmsSerivceInstance.executeRawSql(sql_string) as Promise<PurchaseOrderData[]>,
      enabled: !!refDocNo && !!divCode,
    });

    const { data: isSignatureRequired } = useQuery({
      queryKey: ['purchase_report_signature_requirement', refDocNo],
      staleTime: 1000 * 60 * 5,
      queryFn: () =>
        WmsSerivceInstance.executeRawSql(sql_for_signature).then((res: any) => res?.[0]),
    });

    // ── Derived values ────────────────────────────────────────────────────
    const poItems = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const poData = useMemo(() => (poItems.length > 0 ? poItems[0] : null), [poItems]);
    const signature = isSignatureRequired?.FLAG_YES_NO === 'YES';

    const status = useMemo(() => {
      if (poData?.PO_CONFIRM === 'Y' && poData?.PO_CANCEL === 'Y') return 'DRAFT';
      if (poData?.PO_CANCEL === 'Y') return 'Cancelled';
      return undefined;
    }, [poData]);

    const orderDate = useMemo(() => {
      if (!poData?.DOC_DATE) return '-';
      const parsed = new Date(poData.DOC_DATE);
      return Number.isNaN(parsed.getTime())
        ? poData.DOC_DATE
        : parsed.toLocaleDateString('en-GB');
    }, [poData?.DOC_DATE]);

    const totalAmount = useMemo(() => {
      return poItems.reduce((sum, item) => {
        const qty = item.ALLOCATED_APPROVED_QUANTITY
          ? formatAmount(item.ALLOCATED_APPROVED_QUANTITY)
          : formatAmount(item.PO_MOD_AMOUNT);
        const unitPrice = item.PO_MOD_AMOUNT
          ? formatAmount(item.PO_MOD_AMOUNT)
          : formatAmount(item.FINAL_RATE);
        return sum + Number(qty) * Number(unitPrice);
      }, 0);
    }, [poItems]);

    // ── Refs used to measure real rendered heights (hidden pass) ──────────
    const pageHeaderRef = useRef<HTMLDivElement>(null);
    const poHeaderBlockRef = useRef<HTMLDivElement>(null);
    const paymentTableRef = useRef<HTMLTableElement>(null);
    const tableHeadRef = useRef<HTMLTableSectionElement>(null);
    const scopeRowRef = useRef<HTMLTableRowElement>(null);
    const termsSignRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

    // Computed page chunks — null while the measurement pass hasn't run yet.
    const [chunks, setChunks] = useState<PurchaseOrderData[][] | null>(null);

    // Reset and recompute whenever the underlying item list changes
    useLayoutEffect(() => {
      setChunks(null);
    }, [poItems]);

    useLayoutEffect(() => {
      if (chunks !== null || poItems.length === 0 || !poData) return;

      const rowHeights = poItems.map((_, i) => rowRefs.current[i]?.offsetHeight ?? 24);
      const pageHeaderH = pageHeaderRef.current?.offsetHeight ?? 0;
      const firstPageExtraH =
        (poHeaderBlockRef.current?.offsetHeight ?? 0) + (paymentTableRef.current?.offsetHeight ?? 0);
      const tableHeadH = tableHeadRef.current?.offsetHeight ?? 0;
      const scopeRowH = scopeRowRef.current?.offsetHeight ?? 0;
      const footerH = footerRef.current?.offsetHeight ?? 0;
      const termsSignH = termsSignRef.current?.offsetHeight ?? 0;

      // ── Pass 1: greedily fill pages using actual measured row heights ──
      const indexChunks: number[][] = [];
      let current: number[] = [];
      let used = 0;
      let pageIdx = 0;

      poItems.forEach((_, i) => {
        const isFirstDocPage = pageIdx === 0;
        const reserved =
          pageHeaderH + tableHeadH + footerH + SAFETY_BUFFER_PX +
          (isFirstDocPage ? firstPageExtraH + scopeRowH : 0);
        const usable = PAGE_HEIGHT_PX - reserved;
        const h = rowHeights[i];

        if (current.length > 0 && used + h > usable) {
          indexChunks.push(current);
          current = [];
          used = 0;
          pageIdx += 1;
        }
        current.push(i);
        used += h;
      });
      indexChunks.push(current);

      // ── Pass 2: the true LAST page also has to fit the terms text +
      // signature block. Pass 1 above never budgeted for that, so the
      // packed last page can be too full once terms+signature are added.
      //
      // Previously this popped rows onto a new page ONE AT A TIME and
      // stopped the moment the new page had a single row left on it —
      // which is exactly why you'd end up with a near-empty trailing
      // page holding just one stray row (or none) next to the signature
      // block. Instead: pop as many trailing rows as are actually needed
      // so the shrunk-down old last page fits its own (terms-free)
      // budget, then dump ALL of those popped rows together onto the new
      // final page, so it's a real, reasonably-filled page rather than
      // an island.
      const heightOf = (idxs: number[]) => idxs.reduce((sum, i) => sum + rowHeights[i], 0);

      const lastPageIdx = indexChunks.length - 1;
      const last = indexChunks[lastPageIdx];
      const isOnlyPage = lastPageIdx === 0;
      const reservedWithTerms =
        pageHeaderH + tableHeadH + footerH + termsSignH + SAFETY_BUFFER_PX +
        (isOnlyPage ? firstPageExtraH + scopeRowH : 0);
      const usableWithTerms = PAGE_HEIGHT_PX - reservedWithTerms;

      if (heightOf(last) > usableWithTerms) {
        const movedOut: number[] = [];
        // Pop from the end until what's left on `last` fits its own
        // (terms-free) budget again — could be several rows, not just one.
        while (last.length > 0 && heightOf(last) > usableWithTerms) {
          movedOut.unshift(last.pop() as number);
        }
        // movedOut becomes the real final page: it carries the rows that
        // no longer fit on the previous page, alongside terms+signature.
        // (Edge case: if the signature block alone is so large that even
        // zero rows fit usableWithTerms, movedOut ends up empty and the
        // signature simply gets its own page — nothing more to be done
        // there without shrinking the signature block itself.)
        indexChunks.push(movedOut);
      }

      setChunks(indexChunks.map((idxs) => idxs.map((i) => poItems[i])));
    }, [chunks, poItems, poData]);

    // ── Guard: no data / loading ──────────────────────────────────────────
    if (!divCode || !refDocNo) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">
            No data available. Please select a Division and Reference Document No to view the purchase order report.
          </Typography>
        </Box>
      );
    }

    if (isDeptdataLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">Loading report...</Typography>
        </Box>
      );
    }

    if (!poData) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">No records found for the selected filters.</Typography>
        </Box>
      );
    }

    const div = dynamicData[poData.DIV_CODE];

    // ── Reusable JSX blocks (shared between the hidden measurement pass
    // and the real, visible, paginated output) ────────────────────────────
    const renderPageHeader = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box ref={elRef} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '4px', mb: 0.75 }}>
        {div.logoYes && (
          <Box sx={{ width: div.logoWidth ?? '32%', display: 'flex', justifyContent: 'flex-start' }}>
            <img src={div.logo} alt="logo" style={{ maxHeight: '90px', objectFit: 'contain' }} />
          </Box>
        )}
        {div.headerYes && (
          <Box sx={{ width: div.headerWidth ?? '63%', display: 'flex', justifyContent: 'flex-end' }}>
            <img src={div.header} alt="header text" style={{ maxHeight: '90px', objectFit: 'contain' }} />
          </Box>
        )}
      </Box>
    );

    const renderPoHeaderBlock = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box ref={elRef} className="print-avoid" sx={{ px: 1, pt: 0.5, pb: 1 }}>
        <Typography align="center" sx={{ fontWeight: 800, fontSize: 28, mt: -0.25, mb: 0.25 }}>
          PURCHASE ORDER
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: !status ? '1fr 1fr' : '1fr 0.5fr 1.5fr', gap: 2 }}>
          {/* Supplier */}
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Supplier Details:</Typography>
            <Typography>Supplier Number: {poData.SUPP_CODE}</Typography>
            <Typography sx={{ fontWeight: 600, textTransform: 'uppercase' }}>{poData.SUPP_NAME}</Typography>
            <Typography>{poData.ADDRESS}</Typography>
            <Typography>TEL- {poData.SUPP_TELNO1 || '-'}</Typography>
            <Typography>FAX- {poData.SUPP_FAXNO1 || '-'}</Typography>
            <Typography>MOB - {poData.MOBILE || '-'}</Typography>
            <Typography>EMAIL: {poData.SUPP_EMAIL1 || '-'}</Typography>
          </Box>

          {/* Status stamp */}
          {(status === 'Cancelled' || status === 'DRAFT') && (
            <Box sx={{ display: 'flex', backgroundColor: 'transparent', alignItems: 'center' }}>
              <img
                src={status === 'Cancelled' ? cancel : draft}
                alt="status"
                style={{ maxWidth: '150px', maxHeight: '70px', objectFit: 'contain', backgroundColor: 'transparent' }}
              />
            </Box>
          )}

          {/* PO details grid */}
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 0.25 }}>
              <Typography sx={{ fontWeight: 600 }}>Purchase Order No:</Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{poData.REF_DOC_NO} Rev:0</Typography>
              <Typography sx={{ fontWeight: 600 }}>DATE:</Typography>
              <Typography sx={{ fontWeight: 600 }}>{orderDate}</Typography>
              <Typography sx={{ fontWeight: 600 }}>Buyer:</Typography>
              <Typography sx={{ fontWeight: 600 }}>{poData.BUYER || '-'}</Typography>
              <Typography sx={{ fontWeight: 600, mt: 0.5 }}>Delivery Address :</Typography>
              <Typography sx={{ mt: 0.5 }}>{poData.DELIVERY_ADDRESS || '-'}</Typography>
              <Typography sx={{ fontWeight: 600 }}>Contact Name :</Typography>
              <Typography>{poData.SUPP_CONTACT1 || '-'}</Typography>
              <Typography sx={{ fontWeight: 600 }}>Contact No :</Typography>
              <Typography>{poData.SUPP_TELNO1 || '-'}</Typography>
              <Typography sx={{ fontWeight: 600 }}>PR. No :</Typography>
              <Typography>{poData.REQUEST_NUMBER || '-'}</Typography>
              <Typography sx={{ fontWeight: 600 }}>WO No :</Typography>
              <Typography>{poData.TYPE_OF_PR || '-'}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );

    const renderPaymentTable = (elRef?: React.Ref<HTMLTableElement>) => (
      <table ref={elRef} className="print-avoid" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #2f3fa8', borderBottom: '0', padding: '3px 6px', fontSize: 13, fontWeight: 600 }}>PAYMENT TERM</th>
            <th style={{ border: '1px solid #2f3fa8', borderBottom: '0', padding: '3px 6px', fontSize: 13, fontWeight: 600 }}>DELIVERY TERM / PERIOD</th>
            <th style={{ border: '1px solid #2f3fa8', borderBottom: '0', padding: '3px 6px', fontSize: 13, fontWeight: 600 }}>PROJECT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #2f3fa8', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>{poData.PAYMENT_TERMS}</td>
            <td style={{ border: '1px solid #2f3fa8', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>{poData.DLVR_TERM}</td>
            <td style={{ border: '1px solid #2f3fa8', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>{poData.PROJECT_CODE}: {poData.PROJECT_NAME}</td>
          </tr>
        </tbody>
      </table>
    );

    const renderItemsTableHead = (elRef?: React.Ref<HTMLTableSectionElement>) => (
      <thead ref={elRef}>
        <tr>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '5%' }}>ITEM NO.</th>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '6%' }}>GL CODE</th>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '43%' }}>DESCRIPTION</th>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '12%' }}>Unit of Measure</th>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '8%' }}>QTY</th>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '12%' }}>UNIT PRICE</th>
          <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '14%' }}>Amount</th>
        </tr>
      </thead>
    );

    const renderScopeRow = (elRef?: React.Ref<HTMLTableRowElement>) => (
      <tr className="print-row-avoid" ref={elRef}>
        <td colSpan={7} style={{ border: '1px solid #2f3fa8', padding: '4px 6px', fontWeight: 600 }}>
          Scope of Work:- Provision of Rental Services
        </td>
      </tr>
    );

    const renderItemRow = (item: PurchaseOrderData, index: number, elRef?: React.Ref<HTMLTableRowElement>) => {
      const qty = item.ALLOCATED_APPROVED_QUANTITY
        ? formatAmount(item.ALLOCATED_APPROVED_QUANTITY)
        : formatAmount(item.PO_MOD_AMOUNT);
      const unitPrice = item.PO_MOD_AMOUNT
        ? formatAmount(item.PO_MOD_AMOUNT)
        : formatAmount(item.FINAL_RATE);
      const amount = Number(qty) * Number(unitPrice);
      return (
        <tr
          className="print-row-avoid"
          ref={elRef}
          key={`${item.ITEM_SEQUENCE_NO || index}-${item.ITEM_DESP || index}`}
        >
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center' }}>{item.ITEM_SEQUENCE_NO || index + 1}</td>
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center' }}>{item.COST_CODE || ''}</td>
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 6px', fontWeight: 600 }}>
            {item.SERVICE_RM_FLAG === 'RM' && item.ITEM_CODE !== 'NEWITEM' ? item.ITEM_DESP : item.ADDL_ITEM_DESC}
          </td>
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center', fontWeight: 600 }}>{item.PRINT_UOM}</td>
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center', fontWeight: 600 }}>{qty === 0 ? '' : qty}</td>
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{unitPrice === 0 ? '' : unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style={{ border: '1px solid #2f3fa8', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{amount === 0 ? '' : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      );
    };

    const renderTotalRow = () => (
      <tr className="print-row-avoid">
        <td colSpan={6} style={{ border: '1px solid #2f3fa8', padding: '3px 6px', fontWeight: 600 }}>
          Total: {spellNumber(totalAmount, poData.CURR_CODE)}
        </td>
        <td colSpan={1} style={{ border: '1px solid #2f3fa8', padding: '3px 6px', fontWeight: 600, textAlign: 'right' }}>
          {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    );

    const renderTermsAndSignature = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box ref={elRef}>
        {/* ── TERMS TEXT ── */}
        <Box className="print-avoid" sx={{ px: 1, py: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 12 }}>
            Above is as per attached quotation Ref: {poData.QUATATION_REFERENCE}
            {poData.REASON_FOR_PO_MODIFY && (
              <><br />{poData.REASON_FOR_PO_MODIFY}</>
            )}
            {poData.REMARKS && (
              <><br />{poData.REMARKS}</>
            )}
          </Typography>
          <Typography sx={{ fontSize: 11.5, mt: 0.5 }}>1. Our order number is to be quoted on all relevant Invoices &amp; Delivery Notes. Your Invoice to be submitted against the actual Delivery/services to our Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable with all Original copies.</Typography>
          <Typography sx={{ fontSize: 11.5 }}>2. Notify Procurement Dept. immediately if you are unable to ship/deliver as specified.</Typography>
          <Typography sx={{ fontSize: 11.5 }}>3. Send all correspondence to: procurement@and.qa</Typography>
          <Typography sx={{ fontSize: 11.5 }}>Procurement Department</Typography>
          <Typography sx={{ fontSize: 11.5 }}>P.O. Box: 201325, 11th Floor Lusail Marina Tower No.50 Lusail-Qatar</Typography>
          <Typography sx={{ fontSize: 11.5 }}>Phone: 8974 4404 0800 Fax: +974 4404 0801</Typography>
        </Box>

        {/* ── SIGNATURE TABLE ── */}
        <table className="print-avoid" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            <tr className="print-row-avoid">
              {/* LEFT: Supplier */}
              <td style={{ border: '1px solid #5d5d5d', width: '50%', verticalAlign: 'top', padding: '8px 10px', height: 150 }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 12.5, mb: 2 }}>For Supplier:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 12 }}>I have read &amp; agreed to all terms and conditions.</Typography>
                  </Box>
                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', px: 1 }}>
                    <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 600 }}>Signature</Box>
                    <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 600 }}>Date</Box>
                  </Box>
                </Box>
              </td>

              {/* RIGHT: Company */}
              <td style={{ border: '1px solid #5d5d5d', width: '50%', verticalAlign: 'top', padding: '8px 10px', height: 150 }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 12.5, mb: 2, textAlign: 'center' }}>
                      For, {div?.name || ''}
                    </Typography>
                    <Box sx={{ fontSize: 12, textAlign: 'center', mt: 2, display: 'flex', justifyContent: 'center' }}>
                      {signature ? (
                        <img src={signatureImg} alt="Signature" style={{ maxWidth: '100px', height: 'auto' }} />
                      ) : (
                        'This Document Is Electronically Approved'
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', px: 1 }}>
                    <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 600 }}>Signature</Box>
                    <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 600 }}>Date</Box>
                  </Box>
                </Box>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    );

    const renderPageFooter = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box ref={elRef} className="print-avoid">
        <Box sx={{ borderTop: '1px solid #5d5d5d', py: 0.8 }}>
          <Typography align="center" sx={{ fontWeight: 600, fontSize: 13 }}>
            {div?.name || ''} Toll Free Number: 800-8050.
          </Typography>
          <Typography align="center" sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.05, mt: 0.25 }}>
            Website: {div?.website}
          </Typography>
        </Box>
        {div.footerYes && (
          div.multipleFooters ? (
            <Box sx={{ py: 0.7, pt: 0.7, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              {div.multipleFooterImages?.map((footerImg: string, idx: number) => (
                <img key={idx} src={footerImg} alt={`Footer ${idx + 1}`} style={{ width: '33%', height: 'auto', objectFit: 'cover' }} />
              ))}
            </Box>
          ) : (
            <Box className="print-avoid" sx={{ py: 0.7, px: 1, borderBottom: '1px solid #5d5d5d' }}>
              <img src={div.footer} alt="Footer" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
            </Box>
          )
        )}
      </Box>
    );

    // While the measurement pass hasn't produced real chunks yet, fall
    // back to a single page so something sensible renders on first paint.
    // useLayoutEffect runs before the browser paints, so in practice this
    // fallback is never actually visible to the user.
    const pagesToRender = chunks ?? [poItems];

    // ── Render ────────────────────────────────────────────────────────────
    return (
      <Box
        ref={ref}
        className="print-container"
        sx={{
          width: '100%',
          maxWidth: '190mm',
          mx: 'auto',
          backgroundColor: '#fff',
          color: '#111',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 9,
          lineHeight: 1.2,
          position: 'relative',
          '@media print': {
            width: '190mm',
            margin: 0,
            boxSizing: 'border-box',
            '@page': { size: 'A4 portrait', margin: '10mm', border: '1px solid #000000ff', padding: '1mm' },
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            '& .print-avoid': { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& .print-row-avoid': { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& table': { pageBreakInside: 'auto' },
            '& tr': { pageBreakInside: 'avoid', pageBreakAfter: 'auto' },
            '& thead': { display: 'table-header-group' },
            '& tfoot': { display: 'table-footer-group' },
            '& img': { maxWidth: '100%', height: 'auto' },
            '& tbody': { height: '100%' },
            '& td': { verticalAlign: 'top' },
          },
        }}
      >
        {/* ── HIDDEN MEASUREMENT PASS ──────────────────────────────────────
            Renders every section once, off-screen, at the real print width,
            purely so we can read real pixel heights back via refs and pack
            pages that are actually full instead of guessing a row count. */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 0,
            left: '-99999px',
            width: '190mm',
            visibility: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {renderPageHeader(pageHeaderRef)}
          {renderPoHeaderBlock(poHeaderBlockRef)}
          {renderPaymentTable(paymentTableRef)}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
            {renderItemsTableHead(tableHeadRef)}
            <tbody>
              {renderScopeRow(scopeRowRef)}
              {poItems.map((item, i) =>
                renderItemRow(item, i, (el) => { rowRefs.current[i] = el; })
              )}
            </tbody>
          </table>
          {renderTermsAndSignature(termsSignRef)}
          {renderPageFooter(footerRef)}
        </Box>

        {/* ── VISIBLE, PAGINATED OUTPUT ───────────────────────────────────── */}
        {pagesToRender.map((chunk, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === pagesToRender.length - 1;

          return (
            <Box
              key={pageIdx}
              className="report-page"
              sx={{
                '@media print': {
                  breakAfter: isLastPage ? 'auto' : 'page',
                  pageBreakAfter: isLastPage ? 'auto' : 'always',
                },
              }}
            >
              {renderPageHeader()}

              {isFirstPage && (
                <>
                  {renderPoHeaderBlock()}
                  {renderPaymentTable()}
                </>
              )}

              {/* ── ITEMS TABLE (dynamically-sized chunk, header repeats every page) ── */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
                {renderItemsTableHead()}
                <tbody>
                  {isFirstPage && renderScopeRow()}
                  {chunk.map((item, i) => {
                    const index = pagesToRender
                      .slice(0, pageIdx)
                      .reduce((sum, c) => sum + c.length, 0) + i;
                    return renderItemRow(item, index);
                  })}
                  {isLastPage && renderTotalRow()}
                </tbody>
              </table>

              {isLastPage && renderTermsAndSignature()}

              {renderPageFooter()}
            </Box>
          );
        })}

        {/* ── TERMS & CONDITIONS (always its own final page) ── */}
        <Box
          className="print-avoid"
          sx={{
            '@media print': {
              breakBefore: 'page',
              pageBreakBefore: 'always',
            },
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
            <tbody>
              <tr>
                <td>
                  <Typography align="center" sx={{ fontWeight: 800, fontSize: 10, fontStyle: 'italic', mb: 0.75, textDecoration: 'underline' }}>
                    Standard Purchase Terms
                  </Typography>
                  <Box sx={{ columnCount: 3, columnGap: '4px', fontSize: 6, lineHeight: 1 }}>
                    {div.clauses?.map((clause: { title: string; body: string }) => (
                      <Box key={clause.title} sx={{ breakInside: 'avoid', mb: 0.6 }}>
                        <Typography component="span" sx={{ fontWeight: 600, fontSize: 5, display: 'block' }}>{clause.title}</Typography>
                        <Typography component="span" sx={{ fontSize: 6, lineHeight: 1, display: 'block' }}>{clause.body}</Typography>
                      </Box>
                    ))}
                  </Box>
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Box>
    );
  }
);

PurchaseReportDesign.displayName = 'PurchaseReportDesign';
export default PurchaseReportDesign;