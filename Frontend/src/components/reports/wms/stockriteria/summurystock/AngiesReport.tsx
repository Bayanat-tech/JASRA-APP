import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { TAgingReport } from 'pages/WMS/reports/stockriteria/types/detailStockWms.types';
import { formateAmount } from 'utils/functions';

// Define the AngiesReport component
const AngiesReport = ({
  contentRef,
  data,
  handlePrint
}: {
  contentRef: React.RefObject<HTMLDivElement>; // Ref for the content to be printed
  data: TAgingReport; // Data for the aging report
  handlePrint: () => void; // Function to handle printing
}) => {
  // Get the current user from the useAuth hook
  const { user } = useAuth();
  return (
    <div>
      {/* Print button */}
      <div className="text-right">
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlePrint}>
          Print
        </Button>
      </div>
      {/* Report content */}
      <div className="container mx-auto p-4" ref={contentRef}>
        <span className="flex justify-center">Agieng Stock Report</span>
        <div className="bg-white rounded p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Stock Ageing Report</h1>

          {/* Report header information */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <p>
                <span className="font-semibold"> Date:</span>
                <span className="pl-4">{new Date().toLocaleString()}</span>
              </p>
              <p>
                <span className="font-semibold">User:</span>
                <span className="pl-4">{user?.contact_name}</span>
              </p>
              <p>
                <span className="font-semibold">Report:</span>
                <span className="pl-4">rpt_tock_ageing_period_cbm_su</span>
              </p>
            </div>
          </div>
          {/* Report table */}
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th colSpan={2} className="py-2 px-4 border">
                  Principal
                </th>
                <th className="py-2 px-4 border">Below {data?.d_age1}</th>
                <th className="py-2 px-4 border">
                  {data?.d_age1} - {data?.d_age2}{' '}
                </th>
                <th className="py-2 px-4 border">
                  {data?.d_age2} - {data?.d_age3}{' '}
                </th>
                <th className="py-2 px-4 border">
                  {data?.d_age3} - {data?.d_age4}{' '}
                </th>
                <th className="py-2 px-4 border">
                  {data?.d_age4} - {data?.d_age5}{' '}
                </th>
                <th className="py-2 px-4 border"> Above {data?.d_age5} </th>
                <th className="py-2 px-4 border"> Total </th>
              </tr>
            </thead>
            <tbody>
              {/* Map through the data array to render table rows */}
              {data?.data?.map((item) => {
                return (
                  <>
                    {item.isAgeing === true ? (
                      ''
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-2 px-4 border">
                          {data?.PRIN_CODE + ' ' + data?.PRIN_NAME}
                        </td>
                        {/* Display formatted amounts for each age range */}
                        <td className="py-2 px-4 border">{formateAmount(item?.BELOW_AGE1)}</td>
                        <td className="py-2 px-4 border">{formateAmount(item?.AGE_1)}</td>
                        <td className="py-2 px-4 border">{formateAmount(item?.AGE_2)}</td>
                        <td className="py-2 px-4 border">{formateAmount(item?.AGE_3)}</td>
                        <td className="py-2 px-4 border">{formateAmount(item?.AGE_4)}</td>
                        <td className="py-2 px-4 border">{formateAmount(item?.ABOVE_AGE5)}</td>
                        <td className="py-2 px-4 border">{formateAmount(item?.total)} </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {/* Display grand total row */}
              <tr>
                <td colSpan={2} className="py-2 px-4 border text-right ">
                  Grand Total:
                </td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.BELOW_AGE1_Total ?? ''}</td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.AGE_1_total ?? ''}</td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.AGE_2_total ?? ''}</td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.AGE_3_total ?? ''}</td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.AGE_4_total ?? ''}</td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.ABOVE_AGE5_total ?? ''}</td>
                <td className="py-2 px-4 border">{data?.data?.[data?.data?.length - 1]?.grand_total ?? ''} </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <span className="flex justify-center mt-2 ">Powered by Bayanat Technology</span>
      </div>
    </div>
  );
};

export default AngiesReport;
