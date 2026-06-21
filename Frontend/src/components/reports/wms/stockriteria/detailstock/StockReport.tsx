import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { TDetailReport } from 'pages/WMS/reports/stockriteria/types/detailStockWms.types';
import { FormattedMessage } from 'react-intl';
import { formateAmount } from 'utils/functions';

const StockReport = ({
  contentRef,
  data,
  handlPrint
}: {
  contentRef: React.RefObject<HTMLDivElement>;
  data: TDetailReport;
  handlPrint: () => void;
}) => {
  const { user } = useAuth();

  return (
    <div>
      <div className="text-right">
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlPrint}>
          <FormattedMessage id="Print" />
        </Button>
      </div>

      <div className="p-4" ref={contentRef}>
        <span className="flex justify-center ">Detail Stock Report</span>

        <div className="pb-2 mb-4 text-center">
          <h1 className="text-xl font-semibold">Detail Stock Report grouped on Product (Ascending Order)</h1>
        </div>

        <div className="border-b border-gray-400  mt-2">
          <div>
            <p>
              <span className="font-semibold"> User:</span>
              <span className="pl-4">{user?.contact_name}</span>
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Principal:</span>
              <span className="pl-4">{data?.prin_code ?? ''}</span>
            </p>

            <p>
              <span className="font-semibold">Prin Name:</span>
              <span className="pl-4">{data?.prin_name}</span>
            </p>
          </div>
        </div>

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
                  <div>Job No.</div>
                  <div>Reciept Dt</div>
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
                  <div>Site</div>
                  <div>Location</div>
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
                  <div>Mfg. Date</div>
                  <div>Exp. Date</div>
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
                  <div>Doc Ref.</div>
                  <div>Lot No.</div>
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
                  <div>Batch No.</div>
                  <div>Freeze</div>
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
                  <div>Manf.</div>
                  <div>Container</div>
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
                  <div>Value</div>
                  <div>Curr.</div>
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
                  <div>Qty in Stock</div>
                  <div>
                    <span>PQty</span>
                    <span>LQty</span>
                  </div>
                </TableCell>
                <TableCell
                  colSpan={2}
                  style={{
                    fontSize: '0.50rem',
                    textAlign: 'center',
                    padding: '1px',
                    border: '1px solid black',
                    textTransform: 'none',
                    lineHeight: '1.5'
                  }}
                >
                  <div>Qty Availble</div>
                  <div>
                    <span>PQty</span>
                    <span>LQty</span>
                  </div>
                </TableCell>
                <TableCell
                  colSpan={2}
                  style={{
                    fontSize: '0.50rem',
                    textAlign: 'center',
                    padding: '1px',
                    border: '1px solid black',
                    textTransform: 'none',
                    lineHeight: '1.5'
                  }}
                >
                  <div>Qty Picked</div>
                  <div>
                    <span>PQty</span>
                    <span>LQty</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.products?.map((item) => {
                return (
                  <>
                    {item.prod_name ? (
                      <TableRow className="justify-between">
                        <TableCell
                          colSpan={1}
                          className="font-semibold"
                          style={{
                            fontSize: '0.70rem',
                            textAlign: 'right',
                            lineHeight: '1'
                          }}
                        >
                          Product: {item.prod_code}
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="font-semibold text-left "
                          style={{
                            fontSize: '0.70rem',
                            textAlign: 'right',
                            lineHeight: '1'
                          }}
                        >
                          {item.prod_name}
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="font-semibold text-right "
                          style={{
                            fontSize: '0.70rem',
                            textAlign: 'right',
                            lineHeight: '1',
                            visibility: Number(item.uppp) !== 0 ? 'visible' : 'hidden'
                          }}
                        >
                          UPP: {item?.uppp ?? ''}
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="font-semibold text-right "
                          style={{
                            fontSize: '0.70rem',
                            textAlign: 'right',
                            lineHeight: '1',
                            visibility: Number(item.p_uom) !== 0 ? 'visible' : 'hidden'
                          }}
                        >
                          PUOM: {item?.p_uom ?? ''}
                        </TableCell>
                        <TableCell
                          colSpan={3}
                          className="font-semibold"
                          style={{
                            fontSize: '0.70rem',
                            textAlign: 'right',
                            lineHeight: '1',
                            visibility: Number(item.l_uom) !== 0 ? 'visible' : 'hidden'
                          }}
                        >
                          LUOM: {item?.l_uom}
                        </TableCell>
                      </TableRow>
                    ) : item.isTotal === true ? (
                      <TableRow>
                        <TableCell
                          className="px-1 py-1 font-semibold text-left "
                          colSpan={1}
                          style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}
                        >
                          Product Total
                        </TableCell>
                        <TableCell
                          className="px-1 py-1 font-semibold "
                          style={{
                            fontSize: '0.70rem',
                            textAlign: 'right',
                            lineHeight: '1',
                            visibility: formateAmount(item?.unit_price as string, 0) === '0' ? 'hidden' : 'visible'
                          }}
                        >
                          {formateAmount(item?.unit_price as string, 0)}
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="px-1 py-1 font-semibold"
                          style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}
                        >
                          <span style={{ visibility: formateAmount(item?.pqty_stock as string, 0) === '0' ? 'hidden' : 'visible' }}>
                            Pqty Stock: {formateAmount(item?.pqty_stock as string, 0)}
                          </span>
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="px-1 py-1 font-semibold"
                          style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}
                        >
                          <span style={{ visibility: formateAmount(item?.lqty_stock as string, 0) === '0' ? 'hidden' : 'visible' }}>
                            Lqty Stock: {formateAmount(item?.lqty_stock as string, 0)}
                          </span>
                        </TableCell>
                        <TableCell colSpan={2} className="px-1 py-1" style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <span style={{ visibility: formateAmount(item?.pqty_avl as string, 0) === '0' ? 'hidden' : 'visible' }}>
                            Available Pqty: {formateAmount(item?.pqty_avl as string, 0)}
                          </span>
                        </TableCell>
                        <TableCell colSpan={2} className="px-1 py-1" style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <span style={{ visibility: formateAmount(item?.lqty_avl as string, 0) === '0' ? 'hidden' : 'visible' }}>
                            Available Lqty: {formateAmount(item?.lqty_avl as string, 0)}
                          </span>
                        </TableCell>
                        <TableCell colSpan={2} className="px-1 py-1">
                          <span></span>
                          <span></span>
                        </TableCell>
                      </TableRow>
                    ) : item.stockTotal === true ? (
                      ''
                    ) : (
                      <TableRow>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div>{item?.job_no ?? ''}</div>
                          <div>{item?.txn_date ?? ''}</div>
                        </TableCell>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div>{item?.site_code ?? ''}</div>
                          <div>{item?.location_code ?? ''}</div>
                        </TableCell>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div>{item?.mfg_date ?? ''}</div>
                          <div>{item?.exp_date ?? ''}</div>
                        </TableCell>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div>{item?.doc_ref ?? ''}</div>
                          <div>{item?.lot_no ?? ''}</div>
                        </TableCell>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div style={{ visibility: formateAmount(item?.batch_no as string, 0) === '0' ? 'hidden' : 'visible' }}>
                            {item?.batch_no}
                          </div>
                        </TableCell>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div>{item?.manu_code}</div>
                          <div>{item?.container_no}</div>
                        </TableCell>
                        <TableCell style={{ fontSize: '0.70rem', textAlign: 'center', lineHeight: '1' }}>
                          <div style={{ visibility: formateAmount(item?.unit_price as string, 0) === '0' ? 'hidden' : 'visible' }}>
                            {item?.unit_price}
                          </div>
                          <div>{item?.curr_code}</div>
                        </TableCell>
                        <TableCell colSpan={1} style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div className="">
                            <span
                              className="p-2"
                              style={{ visibility: formateAmount(item?.pqty_stock as string, 0) === '0' ? 'hidden' : 'visible' }}
                            >
                              {item?.pqty_stock}
                            </span>
                            <Divider variant="fullWidth" flexItem orientation="vertical" className="font-extrabold" />

                            <span
                              className="p-2"
                              style={{ visibility: formateAmount(item?.lqty_stock as string, 0) === '0' ? 'hidden' : 'visible' }}
                            >
                              {item?.lqty_stock ?? ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell colSpan={2} className="" style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div className="">
                            <span
                              className="p-2"
                              style={{ visibility: formateAmount(item?.pqty_avl as string, 0) === '0' ? 'hidden' : 'visible' }}
                            >
                              {item?.pqty_avl}
                            </span>
                            <Divider variant="fullWidth" flexItem orientation="vertical" className="font-extrabold" />
                            <span
                              className="p-2"
                              style={{ visibility: formateAmount(item?.lqty_avl as string, 0) === '0' ? 'hidden' : 'visible' }}
                            >
                              {item?.lqty_avl}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell colSpan={2} className="" style={{ fontSize: '0.70rem', textAlign: 'right', lineHeight: '1' }}>
                          <div className="">
                            <span
                              className="p-2"
                              style={{ visibility: formateAmount(item?.pqty_picked as string, 0) === '0' ? 'hidden' : 'visible' }}
                            >
                              {item?.pqty_picked ?? ''}
                            </span>
                            <Divider variant="fullWidth" flexItem orientation="vertical" className="font-extrabold" />
                            <span
                              className="p-2"
                              style={{ visibility: formateAmount(item?.lqty_picked as string, 0) === '0' ? 'hidden' : 'visible' }}
                            >
                              {item.lqty_picked}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}

              <TableRow>
                <TableCell
                  colSpan={1}
                  className="px-1 py-1 font-semibold "
                  style={{ fontSize: '0.70rem', textAlign: 'left', lineHeight: '1' }}
                ></TableCell>
                <TableCell
                  className="px-1 py-1 font-semibold text-left "
                  colSpan={1}
                  style={{ fontSize: '0.70rem', textAlign: 'left', lineHeight: '1' }}
                >
                  Total
                </TableCell>
                <TableCell
                  className="px-1 py-1 font-semibold "
                  style={{
                    fontSize: '0.70rem',
                    textAlign: 'left',
                    lineHeight: '1',
                    visibility:
                      formateAmount(data?.products?.[data?.products?.length - 1].unit_price as string, 0) === '0' ? 'hidden' : 'visible'
                  }}
                >
                  {formateAmount(data?.products?.[data?.products?.length - 1].unit_price as string, 0)}
                </TableCell>
                <TableCell
                  colSpan={1}
                  className="px-1 py-1 font-semibold "
                  style={{ fontSize: '0.70rem', textAlign: 'left', lineHeight: '1' }}
                >
                  <span
                    style={{
                      visibility:
                        formateAmount(data?.products?.[data?.products?.length - 1].pqty_stock as string, 0) === '0' ? 'hidden' : 'visible'
                    }}
                  >
                    Pqty Stock:{formateAmount(data?.products?.[data?.products?.length - 1].pqty_stock as string, 0)}
                  </span>
                  <span
                    className="px-1 py-1 font-semibold "
                    style={{
                      visibility:
                        formateAmount(data?.products?.[data?.products?.length - 1].lqty_stock as string, 0) === '0' ? 'hidden' : 'visible'
                    }}
                  >
                    Lqty Stock: {formateAmount(data?.products?.[data?.products?.length - 1].lqty_stock as string, 0)}
                  </span>
                </TableCell>
                <TableCell colSpan={2} className="px-1 py-1" style={{ fontSize: '0.70rem', textAlign: 'left', lineHeight: '1' }}>
                  <span
                    className="px-1 py-1 font-semibold "
                    style={{
                      visibility:
                        formateAmount(data?.products?.[data?.products?.length - 1].pqty_avl as string, 0) === '0' ? 'hidden' : 'visible'
                    }}
                  >
                    Available Pqty: {formateAmount(data?.products?.[data?.products?.length - 1].pqty_avl as string, 0)}
                  </span>
                  <span
                    className="px-1 py-1 font-semibold "
                    style={{
                      visibility:
                        formateAmount(data?.products?.[data?.products?.length - 1].lqty_avl as string, 0) === '0' ? 'hidden' : 'visible'
                    }}
                  >
                    Pqty Stock: {formateAmount(data?.products?.[data?.products?.length - 1].lqty_avl as string, 0)}
                  </span>
                </TableCell>
                <TableCell colSpan={2} className="px-1 py-1" style={{ fontSize: '0.70rem', textAlign: 'left', lineHeight: '1' }}>
                  <span
                    className="px-1 py-1 font-semibold "
                    style={{
                      visibility:
                        formateAmount(data?.products?.[data?.products?.length - 1].pqty_stock as string, 0) === '0' ? 'hidden' : 'visible'
                    }}
                  >
                    Available Pqty: {formateAmount(data?.products?.[data?.products?.length - 1].pqty_stock as string, 0)}
                  </span>
                  <span
                    className="px-1 py-1 font-semibold "
                    style={{
                      visibility:
                        formateAmount(data?.products?.[data?.products?.length - 1].lqty_avl as string, 0) === '0' ? 'hidden' : 'visible'
                    }}
                  >
                    Available Lqty: {formateAmount(data?.products?.[data?.products?.length - 1].lqty_avl as string, 0)}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default StockReport;
