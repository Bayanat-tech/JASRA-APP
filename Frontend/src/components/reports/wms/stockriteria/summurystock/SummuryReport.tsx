import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { TSummary } from 'pages/WMS/reports/stockriteria/types/detailStockWms.types';
import React from 'react';

const SummuryReport = ({
  contentRef,
  data,
  prin_code,
  handlePrint
}: {
  contentRef: React.RefObject<HTMLDivElement>;
  data: TSummary[];
  prin_code: string;
  handlePrint: () => void;
}) => {
  const { user } = useAuth();

  const totalvalue = {
    open_stk_puom: null as unknown as number,
    open_stk_luom: null as unknown as number,
    open_stk: null as unknown as number,
    qty_in_puom: null as unknown as number,
    qty_in_luom: null as unknown as number,
    qty_in: null as unknown as number,
    qty_out_puom: null as unknown as number,
    qty_out_luom: null as unknown as number,
    qty_out: null as unknown as number,
    qty1baln: null as unknown as number,
    qty2baln: null as unknown as number,
    qty3baln: null as unknown as number
  };

  data?.forEach((item) => {
    const qty1baln = (Number(item?.open_stk_puom) || 0) + (Number(item?.qty_in_puom) || 0) - (Number(item?.qty_out_puom) || 0);
    const qty2baln = (Number(item?.open_stk_luom) || 0) + (Number(item?.qty_in_luom) || 0) - (Number(item?.qty_out_luom) || 0);
    const qty3baln = (Number(item?.open_stk) || 0) + (Number(item?.qty_in) || 0) - (Number(item?.qty_out) || 0);
    return (
      (totalvalue.open_stk_puom += Number(item.open_stk_puom)),
      (totalvalue.open_stk_luom += Number(item.open_stk_luom)),
      (totalvalue.open_stk += Number(item.open_stk)),
      (totalvalue.qty_in_puom += Number(item.qty_in_puom)),
      (totalvalue.qty_in_luom += Number(item.qty_in_luom)),
      (totalvalue.qty_in += Number(item.qty_in)),
      (totalvalue.qty_out_puom += Number(item.qty_out_puom)),
      (totalvalue.qty_out_luom += Number(item.qty_out_luom)),
      (totalvalue.qty_out += Number(item.qty_out)),
      (totalvalue.qty1baln += qty1baln),
      (totalvalue.qty1baln += qty2baln),
      (totalvalue.qty1baln += qty3baln)
    );
  });

  return (
    <>
      <div className="text-right">
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlePrint}>
          Print
        </Button>
      </div>

      <div className="p-4 max-w-5xl mx-auto" ref={contentRef}>
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mt-2">Summary Stock Report</h3>
        </div>
        <div className="mb-4 border-b pb-2">
          <div className="flex justify-between">
            <div>
              <p>
                <span className="font-semibold">Userid:</span> {user?.contact_name}
              </p>
            </div>
          </div>
        </div>
        <div></div>
        <div className="overflow-x-auto">
          <table className="w-full border border-collapse border-black">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 text-left font-bold" rowSpan={2}>
                  Principal Code
                </th>
                <th className="border border-black px-2 py-1 text-left font-bold" rowSpan={2}>
                  Description
                </th>
                <th className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>
                  Open Stk
                </th>
                <th className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>
                  Qty In
                </th>
                <th className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>
                  Qty Out
                </th>
                <th className="border border-black px-2 py-1 text-center font-bold" colSpan={3}>
                  Balance
                </th>
              </tr>
              <tr>
                {['Qty1', 'Qty2', 'Qty3', 'Qty4']?.map((qty, idx) => (
                  <React.Fragment key={idx}>
                    <th className="border border-black px-2 py-1 text-center font-bold">Qty1</th>
                    <th className="border border-black px-2 py-1 text-center font-bold">Qty2</th>
                    <th className="border border-black px-2 py-1 text-center font-bold">Qty</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {!!data &&
                data?.map((item) => {
                  const qty1baln =
                    (Number(item?.open_stk_puom) || 0) + (Number(item?.qty_in_puom) || 0) - (Number(item?.qty_out_puom) || 0);
                  const qty2baln =
                    (Number(item?.open_stk_luom) || 0) + (Number(item?.qty_in_luom) || 0) - (Number(item?.qty_out_luom) || 0);
                  const qty3baln = (Number(item?.open_stk) || 0) + (Number(item?.qty_in) || 0) - (Number(item?.qty_out) || 0);
                  return (
                    <tr className="font-semibold">
                      <td className="border border-black px-2 py-1 text-center">{item?.prin_code}</td>
                      <td className="border border-black px-2 py-1 text-center">{item?.prod_name}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.open_stk_puom)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.open_stk_luom)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.open_stk)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.qty_in_puom)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.qty_in_luom)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.qty_in)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.qty_out_puom)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.qty_out_luom)}</td>
                      <td className="border border-black px-2 py-1 text-center">{parseInt(item?.qty_out)}</td>
                      <td className="border border-black px-2 py-1 text-center">{qty1baln.toFixed(0)}</td>
                      <td className="border border-black px-2 py-1 text-center">{qty2baln.toFixed(0)}</td>
                      <td className="border border-black px-2 py-1 text-center">{qty3baln.toFixed(0)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <table className="w-full border border-collapse border-black">
            <thead>
              <tr>
                <th>Total:</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 text-center font-semibold" colSpan={3}>
                  Open Stk
                </td>
                <td className="border border-black px-2 py-1 text-center font-semibold" colSpan={3}>
                  Qty In
                </td>
                <td className="border border-black px-2 py-1 text-center font-semibold" colSpan={3}>
                  Qty Out
                </td>
                <td className="border border-black px-2 py-1 text-center font-semibold" colSpan={3}>
                  Balance
                </td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty1</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty2</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty3</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty1</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty2</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty3</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty1</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty2</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty3</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty1</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty2</td>
                <td className="border border-black px-2 py-1 text-center font-semibold">Qty3</td>
              </tr>

              <tr className="font-semibold">
                <td className="border border-black px-2 py-1 text-center">{totalvalue.open_stk_puom}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.open_stk_luom}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.open_stk}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.qty_in_puom}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.qty_in_luom}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.qty_in}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.qty_out_puom}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.qty_out_luom}</td>
                <td className="border border-black px-2 py-1 text-center">{totalvalue.qty_out}</td>
                <td className="border border-black px-2 py-1 text-center">
                  {(totalvalue.open_stk_puom + totalvalue.qty_in_puom - totalvalue.qty_out_puom).toFixed(0)}
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {(totalvalue.open_stk_luom + totalvalue.qty_in_luom - totalvalue.qty_out_luom).toFixed(0)}
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {(totalvalue.open_stk + totalvalue.qty_in - totalvalue.qty_out).toFixed(0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SummuryReport;
