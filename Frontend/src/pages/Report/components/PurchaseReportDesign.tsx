import { forwardRef, useMemo } from 'react';
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
// ── Component ─────────────────────────────────────────────────────────────

const PurchaseReportDesign = forwardRef<HTMLDivElement, PurchaseReportDesignProps>(
  ({ required_values }, ref) => {
    let { divCode, refDocNo } = required_values;
    console.log('Rendering PurchaseReportDesign with:', { divCode, refDocNo });

    const div_code_sql = useMemo(()=> `
      SELECT DISTINCT div_code FROM PURCHASE_REQUEST_DETAILS WHERE ref_doc_no = REPLACE('${refDocNo}', '/', '$')
    `,[]);
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
    const poItems  = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const poData   = useMemo(() => (poItems.length > 0 ? poItems[0] : null), [poItems]);
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

    // ── Render ────────────────────────────────────────────────────────────
    let totalAmount = 0;

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
          '@media print': {
            width: '190mm',
            margin: 0,
            boxSizing: 'border-box',
            '@page': { size: 'A4 portrait', margin: '10mm',border: '1px solid #000000ff', padding: '1mm' },
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            '& .print-avoid':     { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& .print-row-avoid': { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& table':  { pageBreakInside: 'auto' },
            '& tr':     { pageBreakInside: 'avoid', pageBreakAfter: 'auto' },
            '& thead':  { display: 'table-header-group' },
            '& tfoot':  { display: 'table-footer-group' },
            '& img':    { maxWidth: '100%', height: 'auto' },
            '& tbody':  { height: '100%' },
            '& td':     { verticalAlign: 'top' },
          },
        }}
      >
        {/* ── OUTER WRAPPER TABLE: thead repeats logo on every page ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <td>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '4px', mb: 0.75 }}>
                  {dynamicData[poData.DIV_CODE].logoYes && (
                    <Box sx={{ width: dynamicData[poData.DIV_CODE].logoWidth ?? '32%', display: 'flex', justifyContent: 'flex-start' }}>
                      <img src={dynamicData[poData.DIV_CODE].logo} alt="logo" style={{ maxHeight: '90px', objectFit: 'contain' }} />
                    </Box>
                  )}
                  {dynamicData[poData.DIV_CODE].headerYes && (
                    <Box sx={{ width: dynamicData[poData.DIV_CODE].headerWidth ?? '63%', display: 'flex', justifyContent: 'flex-end' }}>
                      <img src={dynamicData[poData.DIV_CODE].header} alt="header text" style={{ maxHeight: '90px', objectFit: 'contain' }} />
                    </Box>
                  )}
                </Box>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>

                {/* ── PURCHASE ORDER HEADER ── */}
                <Box className="print-avoid" sx={{ px: 1, pt: 0.5, pb: 1 }}>
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

                {/* ── PAYMENT / DELIVERY / PROJECT ── */}
                <table className="print-avoid" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
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

                {/* ── ITEMS TABLE ── */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '5%'  }}>ITEM NO.</th>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '6%'  }}>GL CODE</th>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '43%' }}>DESCRIPTION</th>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '12%' }}>Unit of Measure</th>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '8%'  }}>QTY</th>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '12%' }}>UNIT PRICE</th>
                      <th style={{ border: '1px solid #2f3fa8', padding: '3px 4px', fontSize: 12.5, fontWeight: 600, width: '14%' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="print-row-avoid">
                      <td colSpan={7} style={{ border: '1px solid #2f3fa8', padding: '4px 6px', fontWeight: 600 }}>
                        Scope of Work:- Provision of Rental Services
                      </td>
                    </tr>

                    {poItems.map((item: PurchaseOrderData, index: number) => {
                      const qty       = item.ALLOCATED_APPROVED_QUANTITY
                        ? formatAmount(item.ALLOCATED_APPROVED_QUANTITY)
                        : formatAmount(item.PO_MOD_AMOUNT);
                      const unitPrice = item.PO_MOD_AMOUNT
                        ? formatAmount(item.PO_MOD_AMOUNT)
                        : formatAmount(item.FINAL_RATE);
                      const amount    = Number(qty) * Number(unitPrice);
                      totalAmount    += amount;
                      return (
                        <tr className="print-row-avoid" key={`${item.ITEM_SEQUENCE_NO || index}-${item.ITEM_DESP || index}`}>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center' }}>{item.ITEM_SEQUENCE_NO || index + 1}</td>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center' }}>{item.COST_CODE || ''}</td>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 6px', fontWeight: 600 }}>
                            {/* {item.DESCRIPTION} */}
                            {item.SERVICE_RM_FLAG === "RM" && item.ITEM_CODE !== "NEWITEM" ? item.ITEM_DESP : item.ADDL_ITEM_DESC}
                            </td>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center', fontWeight: 600 }}>{item.PRINT_UOM}</td>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 4px', textAlign: 'center', fontWeight: 600 }}>{qty === 0 ? '' : qty}</td>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{unitPrice === 0 ? '' :unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ border: '1px solid #2f3fa8', padding: '3px 6px', textAlign: 'right', fontWeight: 600 }}>{ amount === 0 ? '' : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}

                    <tr className="print-row-avoid">
                      <td colSpan={6} style={{ border: '1px solid #2f3fa8', padding: '3px 6px', fontWeight: 600 }}>
                        Total: {spellNumber(totalAmount, poData.CURR_CODE)}
                      </td>
                      <td colSpan={1} style={{ border: '1px solid #2f3fa8', padding: '3px 6px', fontWeight: 600, textAlign: 'right' }}>
                        {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>

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
                              For, {dynamicData[poData.DIV_CODE]?.name || ''}
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

                {/* ── FOOTER ── */}
                <Box className="print-avoid">
                  <Box sx={{ borderTop: '1px solid #5d5d5d', py: 0.8 }}>
                    <Typography align="center" sx={{ fontWeight: 600, fontSize: 13 }}>
                      {dynamicData[poData.DIV_CODE]?.name || ''} Toll Free Number: 800-8050.
                    </Typography>
                    <Typography align="center" sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.05, mt: 0.25 }}>
                      Website: {dynamicData[poData.DIV_CODE]?.website}
                    </Typography>
                  </Box>
                  {dynamicData[poData.DIV_CODE].footerYes && (
                    dynamicData[poData.DIV_CODE].multipleFooters ? (
                      <Box sx={{ py: 0.7, pt: 0.7, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        {dynamicData[poData.DIV_CODE].multipleFooterImages?.map((footerImg: string, idx: number) => (
                          <img key={idx} src={footerImg} alt={`Footer ${idx + 1}`} style={{ width: '33%', height: 'auto', objectFit: 'cover' }} />
                        ))}
                      </Box>
                    ) : (
                      <Box className="print-avoid" sx={{ py: 0.7, px: 1, borderBottom: '1px solid #5d5d5d' }}>
                        <img src={dynamicData[poData.DIV_CODE].footer} alt="Footer" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                      </Box>
                    )
                  )}
                </Box>

                {/* ── TERMS & CONDITIONS (new page) ── */}
                <table className="print-avoid" style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
                  <tbody style={{ height: '100%', width: '100%', borderCollapse: 'collapse', pageBreakBefore: 'always', breakBefore: 'page' } as React.CSSProperties}>
                    <tr>
                      <td>
                        <Typography align="center" sx={{ fontWeight: 800, fontSize: 10, fontStyle: 'italic', mb: 0.75, textDecoration: 'underline' }}>
                          Standard Purchase Terms
                        </Typography>
                        <Box sx={{ columnCount: 3, columnGap: '4px', fontSize: 6, lineHeight: 1 }}>
                          {dynamicData[poData.DIV_CODE].clauses?.map((clause: { title: string; body: string }) => (
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

              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  }
);

PurchaseReportDesign.displayName = 'PurchaseReportDesign';
export default PurchaseReportDesign;