// Importing necessary icons and components from external libraries
import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';

// Importing types and utility functions
import { GrnReportT } from 'pages/WMS/Transaction/Inbound/types/grnInbound_wms.types';
import { formateAmount } from 'utils/functions';
const GrnReport = ({
  contentRef,
  data,
  handlePrint
}: {
  contentRef: React.RefObject<HTMLDivElement>;
  data: GrnReportT[];
  handlePrint: () => void;
}) => {
  return (
    <div>
      {/* Button to trigger print functionality */}
      <div className="text-right">
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlePrint}>
          {/* Print button with printer icon */}
          Print
        </Button>
      </div>

      <div ref={contentRef} className="gap-1 p-2">
        <Typography variant="h4" align="center" gutterBottom sx={{ borderBottom: '1px solid black', borderTop: '1px solid black' }}>
          GOODS RECEIPT NOTE (GRN)
        </Typography>
        <div>
          {data?.map((data) => {
            return (
              <div className="page-break">
                <Grid container spacing={1} padding={0}>
                  <Grid container>
                    <Grid item xs={7} border={1} padding={1}>
                      <Grid container item>
                        <Grid item xs={3}>
                          <Typography className="font-bold no-margin">Principal:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                          <Typography variant="h5"> {data?.prin_name ?? ''}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="h6" className="font-bold no-margin">
                            Job Number:
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" className="font-bold no-margin">
                            {data?.job_no ?? ''}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="h6" className="font-bold no-margin">
                            GRN:
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" className="font-bold no-margin">
                            {data?.grn_no ?? ''}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container item>
                        <Grid item xs={3}>
                          <Typography style={{ fontSize: '0.60rem' }} className="font-bold no-margin">
                            GRN Remarks:
                          </Typography>
                        </Grid>
                        <Grid item xs={10}>
                          <Typography style={{ fontSize: '0.60rem' }}>{data?.prin_ref2 ?? ''}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={5} border={1} padding={1}>
                      <Grid container item>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>WMS GRN Date:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>
                            {dayjs(data?.grn_date).isValid() ? dayjs(data?.grn_date).format('DD-MM-YYYY') : ''}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Grid container item>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>Container No:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>{data?.container_no ?? ''}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container item>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>Container Size:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>{data?.container_size || ''}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container item>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>Doc.Ref:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>{data?.doc_ref || ''}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container item>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>Cust Ref No.:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>{data?.po_no || ''}</Typography>
                        </Grid>
                      </Grid>
                      <Grid container item>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>GRN Generated By:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography style={{ fontSize: '0.60rem' }}>{data?.user_id || ''}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <TableContainer style={{ marginTop: 1, padding: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow style={{ border: '1px solid black' }}>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5'
                          }}
                        >
                          Prod.Code/Name
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5'
                          }}
                        >
                          <div>Asn Pqy</div>
                          <div>Asn Lqy</div>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5'
                          }}
                        >
                          <div>Mfg Date</div>
                          <div>Exp Date</div>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5'
                          }}
                        >
                          <div>Batch No</div>
                          <div>Lot No</div>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5'
                          }}
                        >
                          <div>Gross Wt</div>
                          <div>Net Wt</div>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5'
                          }}
                        >
                          <div>Volume</div>
                          <div>Zone</div>
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            lineHeight: '1.5'
                          }}
                        >
                          Received Good Qty
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            whiteSpace: 'nowrap',
                            lineHeight: '1.5'
                          }}
                        >
                          Damage Qty
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Total (Good + Damage)
                        </TableCell>
                        <TableCell
                          style={{
                            fontSize: '0.50rem',
                            textAlign: 'center',
                            padding: '1px',
                            border: '1px solid black',
                            textTransform: 'none',
                            lineHeight: '1.5',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Short / Excess
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {data?.products?.map((item) => {
                        const TotRecdam = Math.round((Number(item.qtypuom) || 0) + (Number(item.qty_dam) || 0));

                        return (
                          <>
                            {item.grnTotal === true ? (
                              ''
                            ) : item.isTotal === true ? (
                              <TableRow></TableRow>
                            ) : (
                              <>
                                <TableRow>
                                  <TableCell
                                    colSpan={10}
                                    style={{
                                      fontWeight: 'bold',
                                      fontSize: '0.70rem',
                                      textDecoration: 'underline',
                                      textAlign: 'left',
                                      lineHeight: '1',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {item.prod_code && item.prod_name ? `${item.prod_code} ${item.prod_name}` : ' '}
                                  </TableCell>
                                </TableRow>

                                <TableRow>
                                  <TableCell></TableCell>
                                  {/* ASN PQY + LQY */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    {Number(item.qtypuom) !== 0 || Number(item.qtyluom) !== 0 ? (
                                      <>
                                        {Number(item.qtypuom) !== 0 && <div>{item.qtypuom} CTN</div>}
                                        {Number(item.qtyluom) !== 0 && <div>L.Qty: {Math.round(item.qtyluom)} PCS</div>}
                                      </>
                                    ) : (
                                      <div style={{ visibility: 'hidden' }}>&nbsp;</div>
                                    )}
                                  </TableCell>

                                  {/* mfg + exp */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    <div style={{ visibility: item.mfg_date ? 'visible' : 'hidden' }}>{item.mfg_date ?? ''}</div>
                                    <div style={{ visibility: item.exp_date ? 'visible' : 'hidden' }}>{item.exp_date ?? ''}</div>
                                  </TableCell>

                                  {/* batch_no + lot_no */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    <div style={{ visibility: Number(item.batch_no) !== 0 ? 'visible' : 'hidden' }}>
                                      {item?.batch_no ?? ''}
                                    </div>
                                    <div style={{ visibility: Number(item.lot_no) !== 0 ? 'visible' : 'hidden' }}>{item?.lot_no ?? ''}</div>
                                  </TableCell>

                                  {/* gross_wt + net_wt */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    <div style={{ visibility: Number(item.grosswt) !== 0 ? 'visible' : 'hidden' }}>
                                      {formateAmount(item?.grosswt as string, 2)}
                                    </div>
                                    <div style={{ visibility: Number(item.netwt) !== 0 ? 'visible' : 'hidden' }}>
                                      {formateAmount(item?.netwt as string, 2)}
                                    </div>
                                  </TableCell>

                                  {/* volume + Zone */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    <div style={{ visibility: Number(item.volume) !== 0 ? 'visible' : 'hidden' }}>
                                      {formateAmount(item?.volume as string, 2)}
                                    </div>
                                    <div style={{ visibility: item.site_code ? 'visible' : 'hidden' }}>{item.site_code ?? ''}</div>
                                  </TableCell>

                                  {/* Received Good Qty */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    <div style={{ visibility: Number(item.qtypuom) !== 0 ? 'visible' : 'hidden' }}>{item.qtypuom} CTN</div>
                                    <div style={{ visibility: Number(item.qtyluom) !== 0 ? 'visible' : 'hidden' }}>
                                      L.Qty: {Math.round(item.qtyluom)} PCS
                                    </div>
                                  </TableCell>

                                  {/* Damage Qty */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    <div style={{ visibility: Number(item.qty_dam) !== 0 ? 'visible' : 'hidden' }}>
                                      {Math.round(item.qty_dam) ?? ''} CTN
                                    </div>
                                    <div style={{ visibility: Number(item.qtyluom_dam) !== 0 ? 'visible' : 'hidden' }}>
                                      L.Qty: {Math.round(Number(item.qtyluom_dam)) ?? ''} PCS
                                    </div>
                                  </TableCell>

                                  {/* Total (Good + Damage) */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>{TotRecdam}</TableCell>

                                  {/* Short / Excess */}
                                  <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                                    {Number(TotRecdam) === Number(item.qtypuom)
                                      ? ''
                                      : Number(TotRecdam) < Number(item.qtypuom)
                                      ? 'Short'
                                      : 'Excess'}
                                  </TableCell>
                                </TableRow>

                                {item.children.length > 0 && (
                                  <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell className="divide-y-2 divide-white"></TableCell>
                                    <TableCell className="divide-y-2 divide-white"></TableCell>
                                    <TableCell className="divide-y-2 divide-white"></TableCell>
                                    <TableCell className="divide-y-2 divide-white"></TableCell>
                                    <TableCell></TableCell>
                                    <TableCell colSpan={2} className="font-semibold">
                                      Serial No:
                                    </TableCell>
                                    <TableCell></TableCell>
                                  </TableRow>
                                )}

                                {item.children?.map((children) => {
                                  return (
                                    <TableRow>
                                      <TableCell></TableCell>
                                      <TableCell className="divide-y-2 divide-white"></TableCell>
                                      <TableCell className="divide-y-2 divide-white"></TableCell>
                                      <TableCell className="divide-y-2 divide-white"></TableCell>
                                      <TableCell className="divide-y-2 divide-white"></TableCell>
                                      <TableCell></TableCell>
                                      <TableCell>{children?.serial_number ?? ''}</TableCell>
                                      <TableCell></TableCell>
                                      <TableCell></TableCell>
                                    </TableRow>
                                  );
                                })}
                              </>
                            )}
                          </>
                        );
                      })}

                      <TableRow style={{ border: '1px solid black', padding: '0px' }}>
                        <TableCell className="font-bold" style={{ fontSize: '0.6rem' }}>
                          <div>Total ASN (Expected)</div>
                          <div>PALLET TOTAL: {data?.products?.reduce((total, product) => total + Number(product.cnt_lotno || ''), 0)}</div>
                        </TableCell>

                        <TableCell>
                          <TableCell style={{ fontSize: '0.6rem' }}>
                            <div>
                              Qty: {Math.round(data?.products?.reduce((total, product) => total + Number(product.qtypuom || ''), 0))} CTN
                            </div>
                            <div>
                              L.Qty: {Math.round(data?.products?.reduce((total, product) => total + Number(product.qtyluom || ''), 0))} PCS
                            </div>
                          </TableCell>
                        </TableCell>
                        <TableCell className="font-bold" style={{ fontSize: '0.6rem' }}>
                          GRN Total
                        </TableCell>

                        <TableCell style={{ fontSize: '0.6rem' }}>
                          <div>
                            {formateAmount(
                              data?.products?.reduce((total, product) => total + (parseFloat(product.grosswt) || 0), 0),
                              2
                            )}
                          </div>
                          <div>
                            {formateAmount(
                              data?.products?.reduce((total, product) => total + (parseFloat(product.netwt) || 0), 0),
                              2
                            )}
                          </div>
                        </TableCell>

                        <TableCell></TableCell>
                        <TableCell style={{ fontSize: '0.6rem' }}>
                          <div>{formateAmount(data?.products?.[data?.products?.length - 1]?.volume as string)}</div>
                        </TableCell>
                        <TableCell colSpan={2} style={{ fontSize: '0.6rem' }}>
                          <div>
                            Qty: {Math.round(data?.products?.reduce((total, product) => total + Number(product.qtypuom || ''), 0))} CTN
                          </div>
                          <div>
                            L.Qty: {Math.round(data?.products?.reduce((total, product) => total + Number(product.qtyluom || ''), 0))} PCS
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GrnReport;
