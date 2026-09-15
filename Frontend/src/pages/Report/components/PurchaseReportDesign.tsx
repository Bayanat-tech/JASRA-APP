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
  COMPANY_CODE: string;
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

// ── Supplementary lookups ────────────────────────────────────────────────
// These two live outside VW_BO_PO_PRINT entirely, so they're fetched as
// their own small queries once the main PO row is known.
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
    // NOTE: every row for a given PO shares the same REF_DOC_NO, so sorting
    // by REF_DOC_NO alone gives Oracle no tiebreaker — rows come back in
    // whatever physical/plan order the engine feels like, not item order.
    // Sort by the actual item sequence (numeric, since it's stored as text)
    // so the printed table always reads 1, 2, 3... instead of some
    // arbitrary order like 3, 2, 12, 9...
    const sql_string = useMemo(() => `
      SELECT *
      FROM VW_BO_PO_PRINT PO_REGISTER
      WHERE
        div_code = '${divCode}' AND
        REF_DOC_NO = REPLACE('${refDocNo}', '$', '/')
      ORDER BY REF_DOC_NO, TO_NUMBER(ITEM_SEQUENCE_NO)
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
    // Sort by item serial number on the frontend regardless of what order
    // the SQL view returns rows in — this is the single source of truth
    // for row order used everywhere below (measurement pass, pagination,
    // totals), so fixing it here fixes it everywhere.
    const poItems = useMemo(() => {
      const items = Array.isArray(data) ? data : [];
      return [...items].sort(
        (a, b) => Number(a.ITEM_SEQUENCE_NO) - Number(b.ITEM_SEQUENCE_NO)
      );
    }, [data]);
    const poData = useMemo(() => (poItems.length > 0 ? poItems[0] : null), [poItems]);
    const signature = isSignatureRequired?.FLAG_YES_NO === 'YES';

    // ── Delivery-site contact (store name, contact person, contact
    // number) lives in MS_PS_PROJECT_MASTER, keyed by the PO's
    // PROJECT_CODE — it has nothing to do with the supplier's own
    // contact fields, which is what the report was mistakenly showing
    // under "Contact Name" / "Contact No" before.
    const sql_for_delivery_info = useMemo(() => `
      SELECT STORE_NAME, CONTACT_NUMBER, CONTACT_PERSON
      FROM MS_PS_PROJECT_MASTER
      WHERE PROJECT_CODE = '${poData?.PROJECT_CODE}'
        AND COMPANY_CODE = '${poData?.COMPANY_CODE}'
    `, [poData?.PROJECT_CODE, poData?.COMPANY_CODE]);

    const { data: deliveryInfo } = useQuery<DeliveryInfo>({
      queryKey: ['purchase_report_delivery_info', poData?.PROJECT_CODE, poData?.COMPANY_CODE],
      staleTime: 1000 * 60 * 5,
      queryFn: () =>
        WmsSerivceInstance.executeRawSql(sql_for_delivery_info).then((res: any) => res?.[0]),
      enabled: !!poData?.PROJECT_CODE && !!poData?.COMPANY_CODE,
    });

    // ── Buyer's display name isn't stored directly on the PO — BUYER on
    // VW_BO_PO_PRINT is a login id, not a printable name. The real name
    // has to be resolved through VW_BUYER_INFO (keyed by REQUEST_NUMBER)
    // and then SEC_LOGIN.
    const sql_for_buyer_name = useMemo(() => `
      SELECT REAL_NAME
      FROM SEC_LOGIN
      WHERE LOGINID IN (
        SELECT LAST_UPDATED
        FROM VW_BUYER_INFO
        WHERE REPLACE(REQUEST_NUMBER, '/', '$') = REPLACE('${poData?.REQUEST_NUMBER}', '/', '$')
      )
    `, [poData?.REQUEST_NUMBER]);

    const { data: buyerInfo } = useQuery<BuyerInfo>({
      queryKey: ['purchase_report_buyer_name', poData?.REQUEST_NUMBER],
      staleTime: 1000 * 60 * 5,
      queryFn: () =>
        WmsSerivceInstance.executeRawSql(sql_for_buyer_name).then((res: any) => res?.[0]),
      enabled: !!poData?.REQUEST_NUMBER,
    });

    // ── Payment term / delivery term / project / remarks come from a
    // dedicated DISTINCT lookup against the print view itself, rather
    // than being read off whichever item row happens to land as
    // poItems[0]. These fields are populated per-item via a correlated
    // subquery in the view, so they aren't guaranteed to be non-null on
    // every single row — a DISTINCT query across the whole PO is the
    // reliable way to get them.
    const sql_for_terms_conditions = useMemo(() => `
      SELECT DISTINCT DLVR_TERM, REMARKS, PAYMENT_TERMS, PROJECT_NAME, PROJECT_CODE
      FROM VW_BO_PO_PRINT PO_REGISTER
      WHERE Company_code = '${poData?.COMPANY_CODE}'
        AND REPLACE(Ref_doc_no, '/', '$') = REPLACE('${refDocNo}', '/', '$')
    `, [poData?.COMPANY_CODE, refDocNo]);

    const { data: termsInfo } = useQuery<TermsInfo>({
      queryKey: ['purchase_report_terms_info', poData?.COMPANY_CODE, refDocNo],
      staleTime: 1000 * 60 * 5,
      queryFn: () =>
        WmsSerivceInstance.executeRawSql(sql_for_terms_conditions).then((res: any) => res?.[0]),
      enabled: !!poData?.COMPANY_CODE && !!refDocNo,
    });

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
    const totalRowRef = useRef<HTMLTableRowElement>(null);
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
      const totalRowH = totalRowRef.current?.offsetHeight ?? 24;
      const heightOf = (idxs: number[]) => idxs.reduce((sum, i) => sum + rowHeights[i], 0);

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

      // ── Pass 1.5: the Total row has to travel with the last chunk of
      // items (it's a summary of the item table, not a standalone block),
      // but Pass 1 above never budgeted room for it. If adding it would
      // overflow the page that chunk already landed on, move just enough
      // trailing rows off so the Total row fits alongside what remains —
      // unlike terms/signature below, the Total genuinely belongs with the
      // items, so it's correct to keep it attached rather than giving it
      // a page of its own.
      {
        const lastIdx = indexChunks.length - 1;
        const isOnlyPageSoFar = lastIdx === 0;
        const reserved =
          pageHeaderH + tableHeadH + footerH + SAFETY_BUFFER_PX +
          (isOnlyPageSoFar ? firstPageExtraH + scopeRowH : 0);
        const usable = PAGE_HEIGHT_PX - reserved;
        const chunk = indexChunks[lastIdx];

        if (heightOf(chunk) + totalRowH > usable) {
          const movedOut: number[] = [];
          while (chunk.length > 0 && heightOf(chunk) + totalRowH > usable) {
            movedOut.unshift(chunk.pop() as number);
          }
          indexChunks.push(movedOut);
        }
      }

      // ── Pass 2: the true LAST page also has to fit the terms text +
      // signature block, which Pass 1 never budgeted for (it only ever
      // packs pages against the item-table-only budget). If terms+signature
      // don't fit on the last page as already packed, the fix is to give
      // terms+signature a page of their own — NOT to evict rows off the
      // last page.
      //
      // Previously this popped rows off the end of the last page one (or
      // several) at a time until the *shrunk* page fit its own terms-free
      // budget, then dumped the popped rows onto the new final page
      // alongside terms+signature. That's wrong: those rows already fit
      // the normal per-page budget (that's how Pass 1 built the page in
      // the first place), so evicting them doesn't reclaim any usable
      // space — it just leaves the vacated space sitting empty. The visible
      // symptom was rows appearing to "spill" onto a new page while the
      // previous page still had a large, unexplained blank gap at the
      // bottom.
      //
      // The correct fix: leave every row exactly where Pass 1 put it. Only
      // decide whether terms+signature can be appended to the existing
      // last page, or need a new trailing page of their own.
      const lastPageIdx = indexChunks.length - 1;
      const last = indexChunks[lastPageIdx];
      const isOnlyPage = lastPageIdx === 0;
      const reservedWithTerms =
        pageHeaderH + tableHeadH + footerH + termsSignH + SAFETY_BUFFER_PX +
        (isOnlyPage ? firstPageExtraH + scopeRowH : 0);
      const usableWithTerms = PAGE_HEIGHT_PX - reservedWithTerms;

      if (heightOf(last) > usableWithTerms) {
        // Terms+signature don't fit alongside the rows already packed onto
        // the last page — give them their own trailing page instead of
        // bumping rows off. (Edge case: if the signature block alone is so
        // large it wouldn't fit even with zero rows, it still just gets its
        // own page — nothing more to do there without shrinking the
        // signature block itself.)
        indexChunks.push([]);
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
              <Typography sx={{ fontWeight: 600 }}>{buyerInfo?.REAL_NAME || '-'}</Typography>
              <Typography sx={{ fontWeight: 600, mt: 0.5 }}>Delivery Address :</Typography>
              <Typography sx={{ mt: 0.5 }}>{deliveryInfo?.STORE_NAME || poData.DELIVERY_ADDRESS || '-'}</Typography>
              <Typography sx={{ fontWeight: 600 }}>Contact Name :</Typography>
              <Typography>{deliveryInfo?.CONTACT_PERSON || '-'}</Typography>
              <Typography sx={{ fontWeight: 600 }}>Contact No :</Typography>
              <Typography>{deliveryInfo?.CONTACT_NUMBER || '-'}</Typography>
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
            <td style={{ border: '1px solid #2f3fa8', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>{termsInfo?.PAYMENT_TERMS ?? poData.PAYMENT_TERMS}</td>
            <td style={{ border: '1px solid #2f3fa8', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>{termsInfo?.DLVR_TERM ?? poData.DLVR_TERM}</td>
            <td style={{ border: '1px solid #2f3fa8', padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>{termsInfo?.PROJECT_CODE ?? poData.PROJECT_CODE}: {termsInfo?.PROJECT_NAME ?? poData.PROJECT_NAME}</td>
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
          {(termsInfo?.REMARKS ?? poData.REMARKS) && (
            <>
              <br />
              <span style={{ fontWeight: 400 }}>{termsInfo?.REMARKS ?? poData.REMARKS}</span>
            </>
          )}
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

    const renderTotalRow = (elRef?: React.Ref<HTMLTableRowElement>) => (
      <tr className="print-row-avoid" ref={elRef}>
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
            {(termsInfo?.REMARKS ?? poData.REMARKS) && (
              <><br />{termsInfo?.REMARKS ?? poData.REMARKS}</>
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

    // The Total row belongs with the last chunk that actually has items in
    // it — not necessarily the last page overall, since the last page may
    // now be a dedicated terms/signature page with no items on it at all.
    const lastItemsPageIdx = pagesToRender.reduce(
      (acc, c, idx) => (c.length > 0 ? idx : acc),
      0
    );

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
              {renderTotalRow(totalRowRef)}
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
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '267mm',
                  breakAfter: isLastPage ? 'auto' : 'page',
                  pageBreakAfter: isLastPage ? 'auto' : 'always',
                },
              }}
            >
              {/* Everything except the footer lives in this flex-grow
                  wrapper, so on print the footer is pushed down to the
                  physical bottom of the page instead of floating right
                  after the content with a dangling gap below it. */}
              <Box sx={{ '@media print': { flex: '1 0 auto' } }}>
                {renderPageHeader()}

                {isFirstPage && (
                  <>
                    {renderPoHeaderBlock()}
                    {renderPaymentTable()}
                  </>
                )}

                {/* ── ITEMS TABLE (dynamically-sized chunk, header repeats
                    on every page that actually has items). A page whose
                    chunk is empty — e.g. a trailing page created solely to
                    hold terms+signature — skips this entirely rather than
                    showing a bare header row with nothing under it. ── */}
                {chunk.length > 0 && (
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
                      {pageIdx === lastItemsPageIdx && renderTotalRow()}
                    </tbody>
                  </table>
                )}

                {isLastPage && renderTermsAndSignature()}
              </Box>

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