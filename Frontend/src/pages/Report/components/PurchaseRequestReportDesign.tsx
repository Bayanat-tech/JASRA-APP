import { forwardRef, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import { dynamicData } from './dynamicData';
import { spellNumber, formatAmount, formatDate  } from './functions';

// ── Types ─────────────────────────────────────────────────────────────────

export interface PurchaseRequestData {
  REQUEST_NUMBER: string;
  REQUEST_DATE: string;
  REQUEST_DATE_FORMAT: string;
  COMPANY_CODE: string;
  FA_UPLOADED: string;
  FINAL_APPROVED: string;
  TYPE_OF_PR: string;
  PROJECT_CODE: string;
  LAST_ACTION: string;
  DIV_CODE: string;
  ADDL_ITEM_DESC: string;
  ITEM_CODE: string;
  ITEM_SRNO: string;
  ITEM_RATE: string;
  P_UOM: string;
  DISCOUNT_AMOUNT: string;
  PRINT_UOM: string;
  ITEM_P_QTY: string;
  L_UOM: string;
  AMOUNT: string;
  HEADER_AMOUNT: string;
  CURRENCY_RATE: string;
  LCURR_AMT: string;
  SR_NO: string;
  UPP: string;
  ITEM_L_QTY: string;
  APPR_ITEM_L_QTY: string | null;
  APPR_ITEM_P_QTY: string | null;
  ALLOCATED_APPROVED_QUANTITY: string | null;
  SERVICE_RM_FLAG: string;
  FINAL_RATE: string;
  PROJECT_NAME: string;
  DIV_NAME: string;
  ITEM_DESP: string;
  CURR_CODE: string;
  SUPPLIER: string;
  DESCRIPTION: string;
  REMARKS: string;
  TOTAL_AMOUNT: string | null;
  DEPARTMENT_CODE: string;
  FLOW_CODE: string;
  FLOW_LEVEL_INITIAL: string;
  FLOW_LEVEL_RUNNING: string;
  FLOW_LEVEL_FINAL: string;
  COST_CODE: string;
  PO_AMOUNT: string;
  DOC_DATE: string;
  SERVICE_REQUEST: string;
  GOOD_MATERIAL_REQUEST: string;
  WO_NUMBER: string;
  CHARGEABLE_YES: string;
  CHARGEABLE_NO: string;
  BUDGETED_YES: string;
  BUDGETED_NO: string;
  COVERED_BY_CONTRACT_YES: string;
  COVERED_BY_CONTRACT_NO: string;
  CHECKED_STORE_YES: string;
  CHECKED_STORE_NO: string;
  JUSTIFICATION_COMMENTS: string;
  NEED_BY_DATE: string;
  CAPEX_OPEX_NON_OPEX: string;
  PR_STATUS: string;
  PO_NUMBER: string;
  FINAL_APPROVED_DATE: string;
  SERVICE_TYPE: string;
  CREATED_AT: string;
  CREATED_BY: string;
  UPDATED_AT: string;
  UPDATED_BY: string;
  FLOW_TYPE: string;
  ITEM_SEQUENCE_NO: string;
  STATUS: string;
  PR_CANCEL: string;
  // Material checkboxes
  MATERIAL_MECHANICAL: string;
  MATERIAL_ELECTRICAL: string;
  MATERIAL_CIVIL: string;
  MATERIAL_PLUMBING: string;
  MATERIAL_TOOLS: string;
  MATERIAL_AC: string;
  MATERIAL_CLEANING: string;
  MATERIAL_OTHER: string;
  // Service checkboxes
  SERVICES_TEMP_STAFF: string;
  SERVICES_RENTALS: string;
  SERVICES_SUBCON_CONSLT: string;
  SERVICES_OTHER: string;
  // Other checkboxes
  OTHER_STATIONERY: string;
  OTHER_IT: string;
  OTHER_NEW_UNIFORM_PPE: string;
  OTHER_RPLCMT_UNIFORM: string;
  OTHER_OTHER: string;
  // Extra flags
  FLAG_SHARING_COST: string;
  TYPE_OF_CONTRACT: string;
  TYPE_OF_MATERIAL_SUPPLY: string;
  CONTRACT_SOFT_HARD: string;
  AMC_SERVICE_STATUS: string;
}

export interface PurchaseRequestReportDesignProps {
  required_values: {
    companyCode: string;
    requestNumber: string;
  };
}

// ── Small square checkbox ─────────────────────────────────────────────────
const Chk = ({ label, checked }: { label: string; checked: boolean }) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', mr: '8px', mb: '2px' }}>
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 9, height: 9, border: '1px solid #555', fontSize: 7, lineHeight: 1, flexShrink: 0,
    }}>
      {checked ? '✓' : ''}
    </Box>
    <Typography component="span" sx={{ fontSize: 8.5, whiteSpace: 'nowrap' }}>{label}</Typography>
  </Box>
);

// ── Blue-value label/value pair ───────────────────────────────────────────
const LV = ({ label, value }: { label: string; value?: string }) => (
  <>
    <Typography sx={{ fontWeight: 700, fontSize: 9 }}>{label}:</Typography>
    <Typography sx={{ fontSize: 9, color: '#1a56c4' }}>{value || '-'}</Typography>
  </>
);

// ── Component ─────────────────────────────────────────────────────────────

const PurchaseRequestReportDesign = forwardRef<HTMLDivElement, PurchaseRequestReportDesignProps>(
  ({ required_values }, ref) => {
    const { companyCode, requestNumber } = required_values;

    const sql_string = useMemo(() => `
      SELECT * FROM VW_BO_PR_REGISTER PR_REGISTER
      WHERE Request_Number = '${requestNumber}'
      ORDER BY Request_Number, item_sequence_no
    `, [companyCode, requestNumber]);

    const { data, isFetching: isLoading } = useQuery<PurchaseRequestData[]>({
      queryKey: ['purchase_request_report', companyCode, requestNumber],
      staleTime: 1000 * 60 * 5,
      queryFn: () => WmsSerivceInstance.executeRawSql(sql_string) as Promise<PurchaseRequestData[]>,
    });

    const prItems = useMemo(() => (Array.isArray(data) ? data : []), [data]);
    const prData  = useMemo(() => (prItems.length > 0 ? prItems[0] : null), [prItems]);

    const requestDate = useMemo(() => formatDate(prData?.REQUEST_DATE), [prData?.REQUEST_DATE]);
    const needByDate  = useMemo(() => formatDate(prData?.NEED_BY_DATE),  [prData?.NEED_BY_DATE]);

    // ── Guards ────────────────────────────────────────────────────────────
    if (!companyCode || !requestNumber) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">Please select a Company and Request Number to view the report.</Typography>
        </Box>
      );
    }
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">Loading report...</Typography>
        </Box>
      );
    }
    if (!prData) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2">No records found for the selected filters.</Typography>
        </Box>
      );
    }

    // ── Style tokens ──────────────────────────────────────────────────────
    const bBlue = '1px solid #2f3fa8';
    const bGrey = '1px solid #999';
    const bDark = '1px solid #444';
    const bWhite = '1px solid #fff';

    const thBase: React.CSSProperties = {
      border: bBlue, padding: '3px 5px', fontWeight: 700, fontSize: 9,
      textAlign: 'center', backgroundColor: '#f0f2fc',
    };
    const tdBase: React.CSSProperties = {
      border: bBlue, padding: '3px 5px', fontSize: 9, verticalAlign: 'top',
    };

    // ── Running total ─────────────────────────────────────────────────────
    let totalAmount = 0;

    const isServiceReq = prData.SERVICE_REQUEST === 'Y';
    const isGoodsReq   = prData.GOOD_MATERIAL_REQUEST === 'Y';

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
          lineHeight: 1.3,
          '@media print': {
            width: '190mm',
            margin: 0,
            boxSizing: 'border-box',
            '@page': { size: 'A4 portrait', margin: '10mm' },
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            '& .print-avoid':     { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& .print-row-avoid': { breakInside: 'avoid', pageBreakInside: 'avoid' },
            '& table':  { pageBreakInside: 'auto' },
            '& tr':     { pageBreakInside: 'avoid', pageBreakAfter: 'auto' },
            '& thead':  { display: 'table-header-group' },
            '& tfoot':  { display: 'table-footer-group' },
            '& img':    { maxWidth: '100%', height: 'auto' },
          },
        }}
      >
        {/* ── OUTER TABLE: thead repeats on every printed page ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <td>
                {/* ── HEADER: Logo (left) + Form info + Title (right) ── */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>

                  {/* Logo */}
                  <Box sx={{ width: '30%' }}>
                    {dynamicData[prData.DIV_CODE]?.logoYes && (
                      <img
                        src={dynamicData[prData.DIV_CODE].logo}
                        alt="logo"
                        style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </Box>

                  {/* Form meta + title block */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: 80, justifyContent: 'flex-end', width: '70%' }}>
                    <Box sx={{ mb: 0.5, textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 8.5 }}><strong>Form No.:</strong> MFS/CD/F-101</Typography>
                      <Typography sx={{ fontSize: 8.5 }}><strong>Ref. No.:</strong> 02</Typography>
                      <Typography sx={{ fontSize: 8.5 }}>
                        <strong>Date of Iss:</strong>{' '}
                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
                      Purchase Request Form
                    </Typography>
                    <Typography sx={{ fontSize: 9, color: '#555', mt: 0.25 }}>View Only</Typography>
                  </Box>

                </Box>
                <Box sx={{ borderBottom: bDark, mb: 0.75 }} />
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>

                {/* ── ROW 1: Service / Goods toggle + Date + S/N ── */}
                <Box
                  className="print-avoid"
                  sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}
                >
                  <Chk label="Service Request"        checked={isServiceReq} />
                  <Chk label="GOODS/MATERIAL REQUEST"  checked={isGoodsReq || !isServiceReq} />
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                    <Typography sx={{ fontSize: 9 }}>
                      <strong>DATE REQUESTED:</strong>&nbsp;{requestDate}
                    </Typography>
                    <Typography sx={{ fontSize: 9, fontWeight: 700 }}>
                      S/N:&nbsp;{prData.REQUEST_NUMBER}
                    </Typography>
                  </Box>
                </Box>

                {/* ── ROW 2: Project name + Need By ── */}
                <Box
                  className="print-avoid"
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700 }}>
                      Project&nbsp;&nbsp;&nbsp;{prData.PROJECT_NAME || '-'}
                    </Typography>
                    <Typography sx={{ fontSize: 8, color: '#666', fontStyle: 'italic' }}>
                      (Please state if request is not project related)
                    </Typography>
                    <Typography sx={{ fontSize: 9, mt: 0.3 }}>
                      <strong>Project Code:</strong>&nbsp;{prData.PROJECT_CODE || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700 }}>
                      NEED BY&nbsp;&nbsp;{needByDate}
                    </Typography>
                    <Typography sx={{ fontSize: 8, color: '#666', fontStyle: 'italic' }}>
                      (if urgent please Complete justification below)
                    </Typography>
                    <Typography sx={{ fontSize: 9, mt: 0.3 }}>
                      <strong>W/O Number:</strong>&nbsp;{prData.WO_NUMBER || '-'}
                    </Typography>
                  </Box>
                </Box>

                {/* ── CONTRACT / TYPE INFO GRID TABLE ── */}
                <table
                  className="print-avoid"
                  style={{ width: '100%', borderCollapse: 'collapse', border: bGrey, marginBottom: 6 }}
                >
                  <tbody>
                    <tr>
                      {/* Column 1 */}
                      <td style={{ border: bGrey, padding: '4px 6px', width: '33%', verticalAlign: 'top' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '6px', rowGap: '2px', alignItems: 'baseline' }}>
                          <LV label="Type of Contract"   value={prData.TYPE_OF_CONTRACT} />
                          <LV label="AMC Service Status" value={prData.AMC_SERVICE_STATUS} />
                          <LV label="Covered by"         value={prData.COVERED_BY_CONTRACT_YES === 'Yes' ? 'Yes' : (prData.COVERED_BY_CONTRACT_NO === 'N' ? 'No' : prData.COVERED_BY_CONTRACT_YES)} />
                          <LV label="Checked Store"      value={prData.CHECKED_STORE_YES === 'Yes' ? 'Yes' : (prData.CHECKED_STORE_NO === 'N' ? 'No' : prData.CHECKED_STORE_YES)} />
                        </Box>
                      </td>
                      {/* Column 2 */}
                      <td style={{ border: bGrey, padding: '4px 6px', width: '33%', verticalAlign: 'top' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '6px', rowGap: '2px', alignItems: 'baseline' }}>
                          <LV label="Type of Material Supply" value={prData.TYPE_OF_MATERIAL_SUPPLY} />
                          <LV label="Service Type"            value={prData.SERVICE_TYPE} />
                          <LV label="Flag Sharing Cost"       value={prData.FLAG_SHARING_COST} />
                          <LV label="Need by Date"            value={needByDate} />
                        </Box>
                      </td>
                      {/* Column 3 */}
                      <td style={{ border: bGrey, padding: '4px 6px', width: '33%', verticalAlign: 'top' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '6px', rowGap: '2px', alignItems: 'baseline' }}>
                          <LV label="Contract Type" value={prData.TYPE_OF_CONTRACT} />
                          <LV label="Type of PR"    value={prData.TYPE_OF_PR} />
                          <LV label="Budgeted"      value={prData.BUDGETED_YES === 'Yes' ? 'Yes' : (prData.BUDGETED_NO === 'N' ? 'No' : prData.BUDGETED_YES)} />
                        </Box>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── JUSTIFICATION / OTHER COMMENTS ── */}
                <Box className="print-avoid" sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 10, color: '#2f3fa8', mb: 0.25 }}>
                    JUSTIFICATION/OTHER COMMENTS
                  </Typography>
                  <Box sx={{ border: bGrey, minHeight: 30, p: '3px 6px' }}>
                    <Typography sx={{ fontSize: 9 }}>{prData.JUSTIFICATION_COMMENTS || 'Supply of Compressor '}</Typography>
                  </Box>
                </Box>

                {/* ── MATERIAL / SERVICES / OTHER CHECKBOXES ── */}
                <table
                  className="print-avoid"
                  style={{ width: '100%', borderCollapse: 'collapse', border: bGrey, marginBottom: 6 }}
                >
                  <tbody>
                    <tr>
                      {/* Materials column */}
                      <td style={{ border: bGrey, padding: '4px 6px', width: '33%', verticalAlign: 'top' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 9.5, mb: 0.4 }}>Materials</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <Chk label="Mechanical" checked={prData.MATERIAL_MECHANICAL === 'Y'} />
                          <Chk label="Electrical"  checked={prData.MATERIAL_ELECTRICAL === 'Y'} />
                          <Chk label="Civil"       checked={prData.MATERIAL_CIVIL      === 'Y'} />
                          <Chk label="Plumbing"    checked={prData.MATERIAL_PLUMBING   === 'Y'} />
                          <Chk label="Tools"       checked={prData.MATERIAL_TOOLS      === 'Y'} />
                          <Chk label="AC"          checked={prData.MATERIAL_AC         === 'Y'} />
                          <Chk label="Cleaning"    checked={prData.MATERIAL_CLEANING   === 'Y'} />
                          <Chk label="Other"       checked={prData.MATERIAL_OTHER      === 'Y'} />
                        </Box>
                      </td>

                      {/* Services column */}
                      <td style={{ border: bGrey, padding: '4px 6px', width: '33%', verticalAlign: 'top' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 9.5, mb: 0.4 }}>Services</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <Chk label="Temp Staff"    checked={prData.SERVICES_TEMP_STAFF    === 'Y'} />
                          <Chk label="Rentals"       checked={prData.SERVICES_RENTALS       === 'Y'} />
                          <Chk label="Subcon/Conslt" checked={prData.SERVICES_SUBCON_CONSLT === 'Y'} />
                          <Chk label="Other"         checked={prData.SERVICES_OTHER         === 'Y'} />
                        </Box>
                      </td>

                      {/* Other column */}
                      <td style={{ border: bGrey, padding: '4px 6px', width: '33%', verticalAlign: 'top' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 9.5, mb: 0.4 }}>Other</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <Chk label="Stationery"              checked={prData.OTHER_STATIONERY      === 'Y'} />
                          <Chk label="IT"                      checked={prData.OTHER_IT              === 'Y'} />
                          <Chk label="New Uniform/PPE"         checked={prData.OTHER_NEW_UNIFORM_PPE === 'Y'} />
                          <Chk label="Replacement Uniform/PPE" checked={prData.OTHER_RPLCMT_UNIFORM  === 'Y'} />
                          <Chk label="Other"                   checked={prData.OTHER_OTHER           === 'Y'} />
                        </Box>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── ITEMS TABLE ── */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ ...thBase, width: '4%'  }}>#SR</th>
                      <th style={{ ...thBase, width: '9%'  }}>COST CODE</th>
                      <th style={{ ...thBase, width: '43%' }}>DESCRIPTION</th>
                      <th style={{ ...thBase, width: '9%'  }}>UOM</th>
                      <th style={{ ...thBase, width: '7%'  }}>QTY</th>
                      <th style={{ ...thBase, width: '14%' }}>UNIT COST</th>
                      <th style={{ ...thBase, width: '14%' }}>Total AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prItems.map((item: PurchaseRequestData, index: number) => {
                      const qty       = item.ALLOCATED_APPROVED_QUANTITY
                        ? formatAmount(item.ALLOCATED_APPROVED_QUANTITY)
                        : formatAmount(item.ITEM_L_QTY);
                      const unitPrice = formatAmount(item.FINAL_RATE || item.ITEM_RATE);
                      const amount    = qty * unitPrice;
                      totalAmount    += amount;
                      return (
                        <tr className="print-row-avoid" key={`${item.ITEM_SEQUENCE_NO || index}`}>
                          <td style={{ ...tdBase, textAlign: 'center' }}>{item.ITEM_SEQUENCE_NO || index + 1}</td>
                          <td style={{ ...tdBase, textAlign: 'center' }}>{item.COST_CODE || ''}</td>
                          <td style={{ ...tdBase }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 9 }}>
                              {item.DESCRIPTION || item.ITEM_DESP}
                            </Typography>
                            {/* {item.ADDL_ITEM_DESC && (
                              <Typography sx={{ fontSize: 8.5, color: '#444' }}>{item.ADDL_ITEM_DESC}</Typography>
                            )}
                            {item.REMARKS && (
                              <Typography sx={{ fontSize: 8, fontStyle: 'italic', color: '#555' }}>{item.REMARKS}</Typography>
                            )} */}
                          </td>
                          <td style={{ ...tdBase, textAlign: 'center' }}>{item.PRINT_UOM || item.L_UOM}</td>
                          <td style={{ ...tdBase, textAlign: 'center' }}>{qty || ''}</td>
                          <td style={{ ...tdBase, textAlign: 'right' }}>
                            {unitPrice > 0
                              ? unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : ''}
                          </td>
                          <td style={{ ...tdBase, textAlign: 'right' }}>
                            {amount >= 0
                              ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : ''}
                          </td>
                        </tr>
                      );
                    })}

                    {/* TOTAL row */}
                    <tr className="print-row-avoid">
                      <td
                        colSpan={6}
                        style={{ ...tdBase, fontWeight: 700, textAlign: 'right', backgroundColor: '#f0f2fc' }}
                      >
                        TOTAL AMOUNT IN {prData.CURR_CODE || 'QAR'}{totalAmount >= 0 ? ` — ${spellNumber(totalAmount, prData.CURR_CODE)}` : ''}
                      </td>
                      <td style={{ ...tdBase, fontWeight: 700, textAlign: 'right', backgroundColor: '#f0f2fc' }}>
                        {totalAmount > 0
                          ? totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── SIGNATURE / APPROVAL TABLE ──
                    Exact layout from PDF:
                    ┌────────────┬───────────────┬──────────────────────┬──────────────────────┬──────────────────┐
                    │ REQUESTED  │ APPROVED BY   │ APPROVED BY          │ FINAL APPROVAL       │ Received By      │
                    │ BY         │ (LINE MANAGER)│ (PROJECT MANAGER/HOD)│ PER DOA              │ Procurement Dept │
                    ├────────────┼───────────────┼──────────────────────┼──────────────────────│ Name:            │
                    │  --------  │  -----------  │    -------------     │   ---------------    │ Sign:            │
                    │(Name&Sign) │ (Name & Sign) │   (Name & Sign)      │   (Name & Sign)      │ Date:            │
                    └────────────┴───────────────┴──────────────────────┴──────────────────────┴──────────────────┘
                */}
                <table
                  className="print-avoid"
                  style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, minHeight: 120 }}
                >
                  <tbody>
                    <tr>
                      {/* 4 approval columns headers */}
                      {[
                        'REQUESTED BY',
                        'APPROVED BY (LINE MANAGER)',
                        'APPROVED BY (PROJECT MANAGER/HOD)',
                        'FINAL APPROVAL PER DOA',
                      ].map((label) => (
                        <td
                          key={label}
                          style={{
                            borderTop: bWhite, borderBottom: bWhite, borderLeft: bWhite, padding: '3px 5px', width: '20%',
                            fontWeight: 700, fontSize: 9, textDecoration: 'underline',
                            textAlign: 'center', verticalAlign: 'top',
                          }}
                        >
                          {label}
                        </td>
                      ))}
                      {/* Received By cell — rowSpan 2 */}
                      <td
                        rowSpan={2}
                        style={{
                          border: bDark, padding: '5px 8px', width: '20%', borderLeft: bDark,
                          verticalAlign: 'top', fontSize: 9,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, fontSize: 9, mb: 0.25 }}>Received By</Typography>
                        <Typography sx={{ fontSize: 9, mb: 1 }}>Procurement Department</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '32px 1fr', rowGap: '8px', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: 9, fontWeight: 600 }}>Name:</Typography>
                          <Box sx={{ borderBottom: '1px solid #333' }} />
                          <Typography sx={{ fontSize: 9, fontWeight: 600 }}>Sign:</Typography>
                          <Box sx={{ borderBottom: '1px solid #333' }} />
                          <Typography sx={{ fontSize: 9, fontWeight: 600 }}>Date:</Typography>
                          <Box sx={{ borderBottom: '1px solid #333' }} />
                        </Box>
                      </td>
                    </tr>

                    {/* Signature dashes row */}
                    <tr>
                      {[0, 1, 2, 3].map((i) => (
                        <td
                          key={i}
                          style={{
                            border: bWhite, height: '80%', padding: '6px 10px',
                            verticalAlign: 'bottom', textAlign: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                            <Typography sx={{ fontSize: 9, letterSpacing: 1, color: '#555' }}>
                              ---------------------
                            </Typography>
                            <Typography sx={{ fontSize: 8.5, mt: '2px' }}>(Name &amp; Sign)</Typography>
                          </Box>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {/* ── FOOTER ── */}
                <Box className="print-avoid" sx={{ mt: 1 }}>
                  {dynamicData[prData.DIV_CODE]?.footerYes && (
                    dynamicData[prData.DIV_CODE].multipleFooters ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        {dynamicData[prData.DIV_CODE].multipleFooterImages?.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt={`Footer ${idx + 1}`} style={{ width: '33%', height: 'auto', objectFit: 'cover' }} />
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ borderTop: '1px solid #aaa', pt: 0.5 }}>
                        <img
                          src={dynamicData[prData.DIV_CODE].footer}
                          alt="Footer"
                          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                        />
                      </Box>
                    )
                  )}
                </Box>

              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  }
);

PurchaseRequestReportDesign.displayName = 'PurchaseRequestReportDesign';
export default PurchaseRequestReportDesign;