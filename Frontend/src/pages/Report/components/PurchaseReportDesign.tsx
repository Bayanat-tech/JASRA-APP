import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import { dynamicData } from './dynamicData';
import { cancel, draft, POsignatureImg } from './img';
import { spellNumber, formatAmount } from './functions';
import { exportPurchaseOrderToExcel } from './purchaseOrderExcelExport';

export interface PurchaseOrderData {
  WO_NUMBER: string;
  PO_REGISTER: string;
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

interface SupplierInfo {
  SUPP_CODE: string;
  SUPP_TELNO1: string;
  SUPP_FAXNO1: string;
  MOBILE: string;
  SUPP_EMAIL1: string;
}

export interface ExcelExportApi {
  exportToExcel: () => Promise<void>;
  isExporting: boolean;
  canExport: boolean;
}

export interface PurchaseReportDesignProps {
  required_values: {
    divCode: string;
    refDocNo: string;
  };
  onExcelExportReady?: (api: ExcelExportApi) => void;
}

const MM_TO_PX = 96 / 25.4;
const PAGE_HEIGHT_PX = 267 * MM_TO_PX;

const SAFETY_BUFFER_PX = 24;

const FRAME_EXTRA_PX = 30;

const MAX_EXTRA_BUFFER_PX = 240;
const EXTRA_BUFFER_STEP_PX = 16;

const SIGNATURE_BOX_HEIGHT_PX = 120;

const SIGNATURE_TOP_GAP_PX = 8;

const TERMS_GAP_PX = 10;

const DEFAULT_LOGO_WIDTH = '48%';
const DEFAULT_HEADER_WIDTH = '40%';

// Extra tolerance (px) allowed when deciding whether terms + signature can
// share the last items page. Anything within this tolerance is trusted to the
// browser's page-break handling; anything above triggers a fresh page.
const LAST_PAGE_TOLERANCE_PX = 120;

interface TrimmedInfo { src: string; w: number; h: number; }
const trimPromises = new Map<string, Promise<TrimmedInfo | null>>();
const trimResolved = new Map<string, TrimmedInfo | null>();

const trimImage = (src: string): Promise<TrimmedInfo | null> => {
  const cached = trimPromises.get(src);
  if (cached) return cached;
  const promise = new Promise<TrimmedInfo | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return resolve(null);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);
        let minX = w, minY = h, maxX = -1, maxY = -1;
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
        if (maxX < 0) return resolve(null);
        const cw = maxX - minX + 1;
        const ch = maxY - minY + 1;
        const out = document.createElement('canvas');
        out.width = cw;
        out.height = ch;
        const octx = out.getContext('2d');
        if (!octx) return resolve(null);
        octx.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
        return resolve({ src: out.toDataURL('image/png'), w: cw, h: ch });
      } catch {
        return resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  trimPromises.set(src, promise.then((r) => { trimResolved.set(src, r); return r; }));
  return trimPromises.get(src) as Promise<TrimmedInfo | null>;
};

const TrimmedImg = ({
  src,
  alt,
  style,
  onTrimmed,
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  onTrimmed?: () => void;
}) => {
  const [info, setInfo] = useState<TrimmedInfo | null>(trimResolved.get(src) ?? null);
  useEffect(() => {
    if (trimResolved.has(src)) {
      setInfo(trimResolved.get(src) ?? null);
      return undefined;
    }
    let cancelled = false;
    trimImage(src).then((r) => {
      if (cancelled) return;
      setInfo(r);
      if (r) onTrimmed?.();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  return (
    <img
      src={info?.src ?? src}
      alt={alt}
      style={{ ...style, ...(info ? { aspectRatio: `${info.w} / ${info.h}` } : {}) }}
    />
  );
};

const CYAN_BG = '#e3f2fd';
const BORDER_BLUE = '#4a6a9c';

const PurchaseReportDesign = forwardRef<HTMLDivElement, PurchaseReportDesignProps>(
  ({ required_values, onExcelExportReady }, ref) => {
    let { divCode, refDocNo } = required_values;
    const [suppCode, setSuppCode] = useState<string>('');
    const [isExportingExcel, setIsExportingExcel] = useState(false);

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

    const { data, isFetching: isDeptdataLoading } = useQuery<PurchaseOrderData[]>({
      queryKey: ['purchase_report_raw_sql', refDocNo],
      staleTime: 1000 * 60 * 5,
      queryFn: () => WmsSerivceInstance.executeRawSql(sql_string) as Promise<PurchaseOrderData[]>,
      enabled: !!refDocNo && !!divCode,
    });

    const { data: isSignatureRequired, isFetching: isSignatureLoading } = useQuery({
      queryKey: ['purchase_report_signature_requirement', refDocNo],
      staleTime: 1000 * 60 * 5,
      queryFn: () =>
        WmsSerivceInstance.executeRawSql(sql_for_signature).then((res: any) => res?.[0]),
      enabled: !!refDocNo,
    });

    const poItems = useMemo(() => {
      const items = Array.isArray(data) ? data : [];
      return [...items].sort(
        (a, b) => Number(a.ITEM_SEQUENCE_NO) - Number(b.ITEM_SEQUENCE_NO)
      );
    }, [data]);
    const poData = useMemo(() => (poItems.length > 0 ? poItems[0] : null), [poItems]);
    const signature = isSignatureRequired?.FLAG_YES_NO === 'YES';

    const sql_for_supp_code = useMemo(() => `
  SELECT SUPP_CODE
  FROM MS_SUPPLIER_JASRA
  WHERE TRIM(SUPP_NAME) = TRIM('${poData?.SUPP_NAME}')
    AND COMPANY_CODE = '${poData?.COMPANY_CODE}'
`, [poData?.SUPP_NAME, poData?.COMPANY_CODE]);

    const { data: resolvedSuppCode, isFetching: isSuppCodeLoading } = useQuery({
      queryKey: ['purchase_report_supp_code', poData?.SUPP_NAME, poData?.COMPANY_CODE],
      staleTime: 1000 * 60 * 5,
      queryFn: async () => {
        const res: any = await WmsSerivceInstance.executeRawSql(sql_for_supp_code);
        const rows: any[] = Array.isArray(res) ? res : res?.data ?? [];
        return rows[1]?.SUPP_CODE || '';
      },
      enabled: !!poData?.SUPP_NAME && !!poData?.COMPANY_CODE,
    });

    useEffect(() => {
      setSuppCode(resolvedSuppCode ?? '');
    }, [resolvedSuppCode]);

    const sql_for_supplier_info = useMemo(() => `
  SELECT SUPP_CODE, SUPP_TELNO1, SUPP_FAXNO1, MOBILE, SUPP_EMAIL1
  FROM MS_SUPPLIER_JASRA
  WHERE SUPP_CODE = '${suppCode}'
    AND COMPANY_CODE = '${poData?.COMPANY_CODE}'
`, [suppCode, poData?.COMPANY_CODE]);

    const { isFetching: isSupplierLoading } = useQuery<SupplierInfo>({
      queryKey: ['purchase_report_supplier_info', suppCode, poData?.COMPANY_CODE],
      staleTime: 1000 * 60 * 5,
      queryFn: async () => {
        const res: any = await WmsSerivceInstance.executeRawSql(sql_for_supplier_info);
        const rows: any[] = Array.isArray(res) ? res : res?.data ?? [];
        return rows[0];
      },
      enabled: !!suppCode && !!poData?.COMPANY_CODE,
    });
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
      if (poData?.PO_CONFIRM === 'N' && poData?.PO_CANCEL === 'N') return 'DRAFT';
      if (poData?.PO_CANCEL === 'Y') return 'Cancelled';
      return undefined;
    }, [poData]);

    const formattedWoNo = useMemo(() => {
      if (!poData) return '-';
      const type = poData.TYPE_OF_PR;
      const wo = poData.WO_NUMBER;

      if (type === 'Charge to Customer') {
        return wo ? `${wo} - Chargeable` : '- - Chargeable';
      } else if (type === 'Non Chargeable') {
        return wo ? `${wo} - Non-Chargeable` : 'WO-N/A - Non-Chargeable';
      } else {
        return 'Charge to Employee';
      }
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

    const div = dynamicData[poData?.DIV_CODE ?? divCode];

    const handleExportExcel = useCallback(async () => {
      if (!poData || !div) return;
      setIsExportingExcel(true);
      try {
        await exportPurchaseOrderToExcel({
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
        });
      } catch (err) {
        console.error('Excel export failed:', err);
      } finally {
        setIsExportingExcel(false);
      }
    }, [poData, poItems, buyerInfo, deliveryInfo, termsInfo, totalAmount, orderDate, formattedWoNo, status, signature, div]);

    const canExport = !!poData && !!div;
    useEffect(() => {
      onExcelExportReady?.({ exportToExcel: handleExportExcel, isExporting: isExportingExcel, canExport });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleExportExcel, isExportingExcel, canExport]);

    const measureBoxRef = useRef<HTMLDivElement>(null);
    const pageHeaderRef = useRef<HTMLDivElement>(null);
    const poHeaderBlockRef = useRef<HTMLDivElement>(null);
    const paymentTableRef = useRef<HTMLTableElement>(null);
    const tableHeadRef = useRef<HTMLTableSectionElement>(null);
    const scopeRowRef = useRef<HTMLTableRowElement>(null);
    const termsTextRef = useRef<HTMLDivElement>(null);
    const signatureRef = useRef<HTMLDivElement>(null);
    const totalRowRef = useRef<HTMLTableRowElement>(null);
    const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

    const [chunks, setChunks] = useState<PurchaseOrderData[][] | null>(null);
    const [extraBuffer, setExtraBuffer] = useState(0);

    useLayoutEffect(() => {
      setChunks(null);
      setExtraBuffer(0);
    }, [poItems]);

    useEffect(() => {
      const box = measureBoxRef.current;
      if (!box) return undefined;

      const pending = Array.from(box.querySelectorAll('img')).filter((img) => !img.complete);
      if (pending.length === 0) return undefined;

      let cancelled = false;
      Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            })
        )
      ).then(() => {
        if (!cancelled) setChunks(null);
      });

      return () => {
        cancelled = true;
      };
    }, [poItems, poData, div]);

    const termsViewportRef = useRef<HTMLDivElement>(null);
    const termsColsRef = useRef<HTMLDivElement>(null);
    const [termsColH, setTermsColH] = useState<number | null>(null);
    const [closingPageCount, setClosingPageCount] = useState(1);
    const [lastPageUsedH, setLastPageUsedH] = useState<number | null>(null);
    const isReportLoading = isDeptdataLoading || isSignatureLoading || isSuppCodeLoading || isSupplierLoading;

    useEffect(() => {
      const vp = termsViewportRef.current;
      if (!vp) return undefined;
      const measure = () => {
        const h = vp.offsetHeight;
        if (h > 0) setTermsColH((prev) => (prev !== null && Math.abs(prev - h) < 1 ? prev : h));
      };
      measure();
      if (typeof ResizeObserver === 'undefined') return undefined;
      const ro = new ResizeObserver(measure);
      ro.observe(vp);
      return () => ro.disconnect();
    }, [poData, isReportLoading]);

    useLayoutEffect(() => {
      const cols = termsColsRef.current;
      if (!cols || !termsColH) return;
      const last = cols.lastElementChild as HTMLElement | null;
      if (!last) return;
      const width = cols.clientWidth;
      const colW = (width - 2 * TERMS_GAP_PX) / 3;
      const left = cols.getBoundingClientRect().left;
      const maxRight = Math.max(...Array.from(last.getClientRects()).map((r) => r.right - left));
      const totalCols = Math.max(1, Math.ceil((maxRight + TERMS_GAP_PX - 0.5) / (colW + TERMS_GAP_PX)));
      const pages = Math.max(1, Math.ceil(totalCols / 3));
      setClosingPageCount((prev) => (prev === pages ? prev : pages));

      if (pages > 1) {
        const top = cols.getBoundingClientRect().top;
        const pageStart = (pages - 1) * (width + TERMS_GAP_PX);
        let used = 0;
        Array.from(cols.children).forEach((ch) => {
          Array.from((ch as HTMLElement).getClientRects()).forEach((r) => {
            if (r.left - left >= pageStart - 1) used = Math.max(used, r.bottom - top);
          });
        });
        setLastPageUsedH(used > 0 ? Math.ceil(used) : null);
      } else {
        setLastPageUsedH(null);
      }
    }, [termsColH, poData, div, isReportLoading]);

    // ── Pagination ──────────────────────────────────────────────────────────
    // Only the FIRST page carries the logo header. Subsequent pages are pure
    // content, so we don't reserve pageHeaderH for them any more.
    useLayoutEffect(() => {
      if (chunks !== null || poItems.length === 0 || !poData) return;

      const buffer = SAFETY_BUFFER_PX + extraBuffer;

      const rowHeights = poItems.map((_, i) => rowRefs.current[i]?.offsetHeight ?? 24);
      const pageHeaderH = pageHeaderRef.current?.offsetHeight ?? 0;
      const firstPageExtraH =
        (poHeaderBlockRef.current?.offsetHeight ?? 0) + (paymentTableRef.current?.offsetHeight ?? 0);
      const tableHeadH = tableHeadRef.current?.offsetHeight ?? 0;
      const scopeRowH = scopeRowRef.current?.offsetHeight ?? 0;
      const termsTextH = termsTextRef.current?.offsetHeight ?? 0;
      const signatureH = (signatureRef.current?.offsetHeight ?? 0) + SIGNATURE_TOP_GAP_PX;
      const totalRowH = totalRowRef.current?.offsetHeight ?? 24;
      const heightOf = (idxs: number[]) => idxs.reduce((sum, i) => sum + rowHeights[i], 0);

      const indexChunks: number[][] = [];
      let current: number[] = [];
      let used = 0;
      let pageIdx = 0;

      poItems.forEach((_, i) => {
        const isFirstDocPage = pageIdx === 0;
        // pageHeaderH only matters on the first page because it's not rendered
        // on the others.
        const reserved =
          tableHeadH + FRAME_EXTRA_PX + buffer +
          (isFirstDocPage ? pageHeaderH + firstPageExtraH + scopeRowH : 0);
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

      {
        const lastIdx = indexChunks.length - 1;
        const isOnlyPageSoFar = lastIdx === 0;
        const reserved =
          tableHeadH + FRAME_EXTRA_PX + buffer +
          (isOnlyPageSoFar ? pageHeaderH + firstPageExtraH + scopeRowH : 0);
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

      const lastPageIdx = indexChunks.length - 1;
      const last = indexChunks[lastPageIdx];
      const isOnlyPage = lastPageIdx === 0;
      // Only the first page carries the header now.
      const reservedWithTerms =
        tableHeadH + termsTextH + signatureH + totalRowH + FRAME_EXTRA_PX + buffer +
        (isOnlyPage ? pageHeaderH + firstPageExtraH + scopeRowH : 0);
      const usableWithTerms = PAGE_HEIGHT_PX - reservedWithTerms;

      // Only push terms + signature to their own page if they clearly don't
      // fit. A small overflow (<= LAST_PAGE_TOLERANCE_PX) is allowed — the
      // browser will nudge the signature block onto a fresh page naturally
      // instead of us forcing an empty page.
      if (heightOf(last) > usableWithTerms + LAST_PAGE_TOLERANCE_PX) {
        indexChunks.push([]);
      }

      setChunks(indexChunks.map((idxs) => idxs.map((i) => poItems[i])));
    }, [chunks, poItems, poData, extraBuffer]);

    // Verify real page heights (unchanged behaviour).
    useLayoutEffect(() => {
      if (chunks === null) return;
      const root = measureBoxRef.current?.parentElement;
      if (!root) return;
      const pages = Array.from(root.querySelectorAll<HTMLElement>('.report-page'));
      const overflowing = pages.some((p) => p.offsetHeight > PAGE_HEIGHT_PX + 1);
      if (overflowing && extraBuffer < MAX_EXTRA_BUFFER_PX) {
        setExtraBuffer((b) => b + EXTRA_BUFFER_STEP_PX);
        setChunks(null);
      }
    }, [chunks]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!divCode || !refDocNo) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">
            No data available. Please select a Division and Reference Document No to view the purchase order report.
          </Typography>
        </Box>
      );
    }

    if (isDeptdataLoading || isSignatureLoading || isSuppCodeLoading || isSupplierLoading) {
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

    const thBase: React.CSSProperties = {
      border: `1px solid ${BORDER_BLUE}`,
      padding: '3px 6px',
      fontSize: 11,
      fontWeight: 700,
      backgroundColor: CYAN_BG,
      textAlign: 'center',
      verticalAlign: 'middle',
    };
    const tdBase: React.CSSProperties = {
      border: `1px solid ${BORDER_BLUE}`,
      padding: '5px 6px',
      fontSize: 10,
      verticalAlign: 'top',
    };

    const renderPageHeader = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box
        ref={elRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          pb: '4px',
          mb: 0.5,
        }}
      >
        {div.logoYes && (
          <Box sx={{ width: div.logoWidth ?? DEFAULT_LOGO_WIDTH, flex: '0 1 auto', display: 'flex', justifyContent: 'flex-start' }}>
            <TrimmedImg
              src={div.logo}
              alt="logo"
              onTrimmed={() => setChunks(null)}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'left center',
                display: 'block',
              }}
            />
          </Box>
        )}
        {div.headerYes && (
          <Box sx={{ width: div.headerWidth ?? DEFAULT_HEADER_WIDTH, flex: '0 1 auto', display: 'flex', justifyContent: 'flex-end', marginLeft: 'auto' }}>
            <TrimmedImg
              src={div.header}
              alt="header text"
              onTrimmed={() => setChunks(null)}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'right center',
                display: 'block',
              }}
            />
          </Box>
        )}
      </Box>
    );

    const renderPoHeaderBlock = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box ref={elRef} className="print-avoid" sx={{ px: 1, pt: 0.25, pb: 0.5 }}>
        <Typography align="center" sx={{ fontWeight: 800, fontSize: 16, mb: 0.5, textDecoration: 'underline' }}>
          PURCHASE ORDER
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: !status ? '1fr 1fr' : '1fr 0.5fr 1.5fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 10.5, mb: 0.5 }}>Supplier Details:</Typography>
            <Typography sx={{ fontSize: 10.5 }}>Supplier Number: {poData?.SUPP_CODE || '-'}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>{poData.SUPP_NAME}</Typography>
            <Typography sx={{ fontSize: 10.5 }}>P.O Box No: {poData.ADDRESS}</Typography>
            <Typography sx={{ fontSize: 10.5 }}>TEL- {poData.SUPP_TELNO1 || '-'}</Typography>
            <Typography sx={{ fontSize: 10.5 }}>FAX- {poData.SUPP_FAXNO1 || '-'}</Typography>
            <Typography sx={{ fontSize: 10.5 }}>MOB - {poData.MOBILE || '-'}</Typography>
            <Typography sx={{ fontSize: 10.5 }}>EMAIL: {poData.SUPP_EMAIL1 || '-'}</Typography>
          </Box>

          {(status === 'Cancelled' || status === 'DRAFT') && (
            <Box sx={{ display: 'flex', backgroundColor: 'transparent', alignItems: 'center' }}>
              <img
                src={status === 'Cancelled' ? cancel : draft}
                alt="status"
                style={{ maxWidth: '150px', maxHeight: '70px', objectFit: 'contain', backgroundColor: 'transparent' }}
              />
            </Box>
          )}

          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 0.25, '& > :nth-of-type(odd)': { textAlign: 'right', pr: 1 } }}>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>Purchase Order No:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>{poData.REF_DOC_NO} Rev: 0</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>DATE:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>{orderDate}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>Buyer:</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>{buyerInfo?.REAL_NAME || '-'}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5, mt: 0.5 }}>Delivery Address :</Typography>
              <Typography sx={{ fontSize: 10.5, mt: 0.5 }}>{deliveryInfo?.STORE_NAME || poData.DELIVERY_ADDRESS || '-'}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>Contact Name :</Typography>
              <Typography sx={{ fontSize: 10.5 }}>{deliveryInfo?.CONTACT_PERSON || '-'}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>Contact No :</Typography>
              <Typography sx={{ fontSize: 10.5 }}>{deliveryInfo?.CONTACT_NUMBER || '-'}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>PR. No :</Typography>
              <Typography sx={{ fontSize: 10.5 }}>{poData.REQUEST_NUMBER || '-'}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 10.5 }}>WO No : </Typography>
              <Typography sx={{ fontSize: 10.5 }}>{formattedWoNo}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );

    const renderPaymentTable = (elRef?: React.Ref<HTMLTableElement>) => (
      <table ref={elRef} className="print-avoid" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={thBase}>PAYMENT TERM</th>
            <th style={thBase}>DELIVERY TERM / PERIOD</th>
            <th style={thBase}>PROJECT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...tdBase, textAlign: 'center' }}>{termsInfo?.PAYMENT_TERMS ?? poData.PAYMENT_TERMS}</td>
            <td style={{ ...tdBase, textAlign: 'center' }}>{termsInfo?.DLVR_TERM ?? poData.DLVR_TERM}</td>
            <td style={{ ...tdBase, textAlign: 'center' }}>{termsInfo?.PROJECT_CODE ?? poData.PROJECT_CODE}: {termsInfo?.PROJECT_NAME ?? poData.PROJECT_NAME}</td>
          </tr>
        </tbody>
      </table>
    );

    const renderItemsTableHead = (elRef?: React.Ref<HTMLTableSectionElement>) => {
      const thItems: React.CSSProperties = { ...thBase, padding: '5px 2px', fontSize: 10.5, whiteSpace: 'nowrap' };
      return (
        <thead ref={elRef}>
          <tr>
            <th style={{ ...thItems, width: '8%' }}>ITEM NO.</th>
            <th style={{ ...thItems, width: '8%' }}>GL CODE</th>
            <th style={{ ...thItems, width: '42%' }}>DESCRIPTION</th>
            <th style={{ ...thItems, width: '12%' }}>Unit of Measure</th>
            <th style={{ ...thItems, width: '6%' }}>QTY</th>
            <th style={{ ...thItems, width: '11%' }}>UNIT PRICE</th>
            <th style={{ ...thItems, width: '13%' }}>Amount({poData.CURR_CODE || 'QAR'})</th>
          </tr>
        </thead>
      );
    };

    const renderScopeRow = (elRef?: React.Ref<HTMLTableRowElement>) => (
      <tr className="print-row-avoid" ref={elRef}>
        <td
          colSpan={7}
          style={{
            border: `1px solid ${BORDER_BLUE}`,
            padding: '4px 6px',
            fontWeight: 700,
            fontSize: '10.5px',
            backgroundColor: '#ffffff',
            whiteSpace: 'pre-line',
          }}
        >
          Scope of Work:- {poData.DESCRIPTION}
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
          <td style={{ ...tdBase, textAlign: 'center' }}>{item.ITEM_SEQUENCE_NO || index + 1}</td>
          <td style={{ ...tdBase, textAlign: 'center' }}>{item.COST_CODE || ''}</td>
          <td style={{ ...tdBase, fontWeight: 700, whiteSpace: 'pre-line' }}>
            {item.SERVICE_RM_FLAG === 'RM' && item.ITEM_CODE !== 'NEWITEM' ? item.ITEM_DESP : item.ADDL_ITEM_DESC}
          </td>
          <td style={{ ...tdBase, textAlign: 'center', fontWeight: 700 }}>{item.PRINT_UOM}</td>
          <td style={{ ...tdBase, textAlign: 'center', fontWeight: 700 }}>{qty === 0 ? '' : qty}</td>
          <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700 }}>{unitPrice === 0 ? '' : unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700 }}>{amount === 0 ? '' : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      );
    };

    const renderTotalRow = (elRef?: React.Ref<HTMLTableRowElement>) => (
      <tr className="print-row-avoid" ref={elRef}>
        <td
          colSpan={6}
          style={{
            border: `1px solid ${BORDER_BLUE}`,
            padding: '3px 6px',
            fontWeight: 700,
            fontSize: 10.5,
          }}
        >
          Total: {spellNumber(totalAmount, poData.CURR_CODE)}
        </td>
        <td
          colSpan={1}
          style={{
            border: `1px solid ${BORDER_BLUE}`,
            padding: '3px 6px',
            fontWeight: 700,
            fontSize: 10.5,
            textAlign: 'right',
          }}
        >
          {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    );

    const renderTermsText = (elRef?: React.Ref<HTMLDivElement>) => (
      <Box ref={elRef}>
        <Box className="print-avoid" sx={{ px: 1, py: 0.75 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 10 }}>
            Above is as per attached quotation Ref: {poData.QUATATION_REFERENCE}
            {poData.REASON_FOR_PO_MODIFY && (
              <><br />{poData.REASON_FOR_PO_MODIFY}</>
            )}
            {(termsInfo?.REMARKS ?? poData.REMARKS) && (
              <><br />{termsInfo?.REMARKS ?? poData.REMARKS}</>
            )}
          </Typography>
          <Typography sx={{ fontSize: 9.5, mt: 0.5 }}>
            1. Our order number is to be quoted on all relevant Invoices &amp; Delivery Notes. Your Invoice to be submitted against the actual Delivery/services to<br />
            our Head Office within seven days from the date of invoice supported with relevant Delivery Note or Job Completion Report or Service Report or attendance sheet whichever is applicable with all Original copies.
          </Typography>
          <Typography sx={{ fontSize: 9.5 }}>2. Notify Procurement Dept. immediately if you are unable to ship/deliver as specified.</Typography>
          <Typography sx={{ fontSize: 9.5 }}>3. Send all correspondence to: procurement@the-maintainers.com</Typography>
          <Typography sx={{ fontSize: 9.5 }}>Procurement Department</Typography>
          <Typography sx={{ fontSize: 9.5 }}>P.O. Box: 201325, 11th Floor Lusail Marina Tower No.50 Lusail-Qatar</Typography>
          <Typography sx={{ fontSize: 9.5 }}>Phone: 8974 4404 0800 Fax: +974 4404 0801</Typography>
        </Box>
      </Box>
    );

    const renderSignatureBlock = (elRef?: React.Ref<HTMLDivElement>) => {
      const refNo = poData?.REF_DOC_NO || '';
      const isAJSS = refNo.startsWith('AJSS');
      const isAND = refNo.startsWith('AND');
      const now = new Date();
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const printDate = `${String(now.getDate()).padStart(2, '0')}-${MONTHS[now.getMonth()]}-${now.getFullYear()}`;
      const formTag = isAND ? 'F502 REV 00' : 'FS05 REV 01';
      const tollFreeLine = isAJSS
        ? 'AL JASSRA SECURITY SERVICES: Toll Free Number: 800-8050.'
        : isAND
          ? 'AND MARKETING EVENTS AND ENTERTAINMENTS: Toll Free Number: 800-8050.'
          : 'The Maintainers Toll Free Number: 800-8050';
      const website = isAJSS
        ? 'Website: aljassrasecurity.com'
        : isAND
          ? 'Website: andagencyqatar.com'
          : 'Website: the-maintainers.com';
      const issued = isAJSS ? 'Form Issued Date: 26-02-2020' : isAND ? '' : `Form Issued Date:${printDate}`;

      const signRow = (
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', px: 1 }}>
          <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 700, fontSize: 11.5 }}>Signature</Box>
          <Box sx={{ width: '38%', borderTop: '1px solid #222', textAlign: 'center', pt: 0.75, fontWeight: 700, fontSize: 11.5 }}>Date</Box>
        </Box>
      );

      return (
        <Box
          ref={elRef}
          className="print-avoid"
          sx={{ border: '1.5px solid #000', boxSizing: 'border-box', mt: `${SIGNATURE_TOP_GAP_PX}px` }}
        >
          <Box sx={{ display: 'flex', height: `${SIGNATURE_BOX_HEIGHT_PX}px`, boxSizing: 'border-box' }}>
            <Box
              sx={{
                width: '50%',
                borderRight: '1.5px solid #000',
                p: '4px 10px 6px 4px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 11.5, mb: 1.5 }}>For Supplier:</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 11.5 }}>I have read &amp; agreed to all terms and conditions.</Typography>
              </Box>
              {signRow}
            </Box>

            <Box sx={{ width: '50%', p: '4px 4px 6px 10px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 11.5, mb: 1.5, textAlign: 'center' }}>
                  For {div?.name || ''}:
                </Typography>
                <Box sx={{ fontSize: 11.5, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  {signature ? (
                    <img src={POsignatureImg} alt="Signature" style={{ maxWidth: '100px', maxHeight: '40px', height: 'auto' }} />
                  ) : (
                    'This Document Is Electronically Approved'
                  )}
                </Box>
              </Box>
              {signRow}
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: CYAN_BG,
              borderTop: '1.5px solid #000',
              borderBottom: '1.5px solid #000',
              px: 1,
              py: 0.75,
            }}
          >
            <Typography align="center" sx={{ fontWeight: 700, fontSize: 11.5 }}>
              {tollFreeLine}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, minWidth: '110px' }}>{formTag}</Typography>
              <Typography align="center" sx={{ fontSize: 11.5, fontWeight: 700, flex: 1 }}>{website}</Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 700, minWidth: '170px', textAlign: 'right' }}>{issued}</Typography>
            </Box>
          </Box>

          {div.footerYes && (
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
          )}
        </Box>
      );
    };

    const renderTermsColumns = (pageIndex: number, elRef?: React.Ref<HTMLDivElement>) => (
      <Box
        ref={elRef}
        sx={{
          width: '100%',
          height: termsColH ? `${termsColH}px` : '100%',
          columnCount: 3,
          columnGap: `${TERMS_GAP_PX}px`,
          columnFill: 'auto',
          fontSize: 5.6,
          lineHeight: 1.05,
          transform: pageIndex > 0 ? `translateX(calc(-${pageIndex} * (100% + ${TERMS_GAP_PX}px)))` : undefined,
        }}
      >
        {div.clauses?.map((clause: { title: string; body: string }) => {
          const isIntro = /^standard purchase terms/i.test(clause.title.trim());
          return (
            <Box key={clause.title} sx={{ mb: 0.6 }}>
              {!isIntro && (
                <Typography component="span" sx={{ fontWeight: 700, fontSize: 5.8, display: 'block' }}>{clause.title}</Typography>
              )}
              <Typography component="span" sx={{ fontSize: 5.6, lineHeight: 1.05, display: 'block' }}>{clause.body}</Typography>
            </Box>
          );
        })}
      </Box>
    );

    const pagesToRender = chunks ?? [poItems];

    const lastItemsPageIdx = pagesToRender.reduce(
      (acc, c, idx) => (c.length > 0 ? idx : acc),
      0
    );

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
        <style>{`@page { size: A4 portrait; margin: 10mm 10mm 14mm 10mm; border: none; padding: 0; @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; } }`}</style>

        {/* Hidden measuring box — keeps the page-header render so pageHeaderH is measured. */}
        <Box
          ref={measureBoxRef}
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
          <Box sx={{ border: '2px solid transparent', boxSizing: 'border-box', px: 1, py: 1 }}>
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
            {renderTermsText(termsTextRef)}
            {renderSignatureBlock(signatureRef)}
          </Box>
        </Box>

        {pagesToRender.map((chunk, pageIdx) => {
          const isFirstPage = pageIdx === 0;
          const isLastPage = pageIdx === pagesToRender.length - 1;

          return (
            <Box
              key={pageIdx}
              className="report-page"
              sx={{
                boxSizing: 'border-box',
                '@media print': {
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  minHeight: '267mm',
                  breakAfter: 'page',
                  pageBreakAfter: 'always',
                },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Logo header only on page 1 */}
              {isFirstPage && renderPageHeader()}

              <Box
                sx={{
                  flex: '1 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #000',
                  boxSizing: 'border-box',
                  px: 1,
                  py: 1,
                }}
              >
                {isFirstPage && (
                  <>
                    {renderPoHeaderBlock()}
                    {renderPaymentTable()}
                  </>
                )}

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

                {isLastPage && (
                  <>
                    {renderTermsText()}
                    {renderSignatureBlock()}
                  </>
                )}
              </Box>
            </Box>
          );
        })}

        {/* Closing pages — no logo header now. */}
        {Array.from({ length: closingPageCount }).map((_, k) => (
          <Box
            key={`closing-${k}`}
            className="closing-page"
            sx={{
              boxSizing: 'border-box',
              height: '267mm',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              '@media print': { breakBefore: 'page', pageBreakBefore: 'always' },
            }}
          >
            <Box
              sx={{
                border: '2px solid #000',
                p: '6px 8px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                ...(k === 0 ? { flex: '1 1 0' } : {}),
              }}
            >
              {k === 0 && (
                <Typography align="center" sx={{ fontWeight: 800, fontSize: 11, fontStyle: 'italic', mb: 0.75, textDecoration: 'underline' }}>
                  Standard Purchase Terms
                </Typography>
              )}
              <Box
                ref={k === 0 ? termsViewportRef : undefined}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 0,
                  ...(k === 0
                    ? { flex: '1 1 0' }
                    : {
                        height:
                          k === closingPageCount - 1 && lastPageUsedH
                            ? `${lastPageUsedH + 2}px`
                            : termsColH
                              ? `${termsColH}px`
                              : 'auto',
                      }),
                }}
              >
                {renderTermsColumns(k, k === 0 ? termsColsRef : undefined)}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }
);

PurchaseReportDesign.displayName = 'PurchaseReportDesign';
export default PurchaseReportDesign;