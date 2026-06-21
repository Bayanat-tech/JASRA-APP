import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import dayjs from 'dayjs';
import useAuth from 'hooks/useAuth';
import { TPeriodWiseReport } from 'pages/accounts/reports/ageing/types/PeriodWiseAccounts.types';
import { formateAmount } from 'utils/functions';

// Define the AgiengPeriodWiseReport component
const AgiengPeriodWiseReport = ({
  contentRef,
  data,
  handlePrint,
  date_to
}: {
  contentRef: React.RefObject<HTMLDivElement>; // Ref for the content to be printed
  data: TPeriodWiseReport; // Data for the period-wise report
  handlePrint: () => void; // Function to handle printing
  date_to: Date; // Date for the report
}) => {
  // Get the current user from the useAuth hook
  const { user } = useAuth();
  return (
    <>
      {/* Print button */}
      <div className="text-right">
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlePrint}>
          Print
        </Button>
      </div>
      {/* Report content */}
      <div className="p-8" ref={contentRef}>
        <span className="flex justify-center ">Ageing Period Wise Report</span>
        {/* Header for the report */}
        <h1 className="text-2xl text-center mb-6 font-bold">Ageing as on {dayjs(date_to).format('DD-MM-YYYY')} (Division: AMLS)</h1>
        <div>
          {/* Report information */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p>
                <span className="font-semibold">Date:</span>
                <span className="pl-4"> {new Date().toLocaleString()}</span>
              </p>
              <p>
                <span className="font-semibold">User:</span>
                <span className="pl-4">{user?.contact_name}</span>
              </p>
              <p>
                <span className="font-semibold">Report:</span>
                <span className="pl-4">rpt_ageing_period_summary</span>
              </p>
            </div>
          </div>
          {/* Table for displaying report data */}
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                {/* Table headers */}
                <th className="border border-gray-300 p-2 text-left">A/C code</th>
                <th className="border border-gray-300 p-2 text-left">SalesPerson</th>
                <th className="border border-gray-300 p-2 text-left">Dept</th>
                <th className="border border-gray-300 p-2 text-left" rowSpan={2} colSpan={2}>
                  <div className="text-center">Credit</div>
                  <div className="flex justify-between">
                    <span className="mr-2"> Limit</span>
                    <span>Period</span>
                  </div>
                </th>
                <th className="border border-gray-300 p-2 text-left">Un-allocated</th>
                <th className="border border-gray-300 p-2 text-left">Below {data?.d_age1}</th>
                <th className="border border-gray-300 p-2 text-left">
                  {data?.d_age1} - {data?.d_age2}
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  {data?.d_age2} - {data?.d_age3}
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  {data?.d_age3} - {data?.d_age4}
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  {data?.d_age4} - {data?.d_age5}
                </th>
                <th className="border border-gray-300 p-2 text-left">
                  {data?.d_age5} - {data?.d_age6}
                </th>
                <th className="border border-gray-300 p-2 text-left">Above {data?.d_age6}</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through the data array to render table rows */}
              {data?.dataArray?.map((item) => {
                return (
                  <>
                    {/* Render heading row */}
                    {item?.isHeading === true ? (
                      <tr>
                        <td className="border border-gray-300 p-2">{item?.l4_code}</td>
                        <td className="border border-gray-300 p-2" colSpan={12}>
                          {item.l4_description}
                        </td>
                      </tr>
                    ) : // Render total row
                    item.isTotal === true ? (
                      <tr>
                        <td className="border border-gray-300 p-2" colSpan={6}>
                          Total for TRADE CREDITORS - RP
                        </td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_below)}</td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_1)}</td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_2)}</td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_3)}</td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_4)}</td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_5)}</td>
                        <td className="border border-gray-300 p-2">{formateAmount(item?.age_above)}</td>
                      </tr>
                    ) : // Render grand total row (empty in this case)
                    item?.grandTotal === true ? (
                      ''
                    ) : (
                      // Render data row
                      <tr>
                        <td className="border border-gray-300 p-2 text-left">{item?.ac_code}</td>
                        <td className="border border-gray-300 p-2 text-left">{item?.ac_name}</td>
                        <td className="border border-gray-300 p-2 text-left">{item?.dept_code}</td>
                        <td className="border border-gray-300 p-2 text-left" colSpan={2}>
                          <div className="flex justify-between">
                            {/* Display formatted credit amount and period */}
                            <span> {formateAmount(item?.credit_amount ?? 0)} </span>
                            <span>{formateAmount(item?.credit_period ?? 0)}</span>
                          </div>
                        </td>
                        {/* Display formatted amounts for each age range */}
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.un_allocated_amt)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_below)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_1)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_2)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_3)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_4)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_5)}</td>
                        <td className="border border-gray-300 p-2 text-left">{formateAmount(item?.age_above)}</td>
                      </tr>
                    )}
                  </>
                );
              })}

              {/* Render grand total row */}
              <tr>
                <td className="border border-gray-300 p-2" colSpan={6}>
                  Grand Total:
                </td>
                {/* Display formatted grand total amounts for each age range */}
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_below)}</td>
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_1)}</td>
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_2)}</td>
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_3)}</td>
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_4)}</td>
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_5)}</td>
                <td className="border border-gray-300 p-2">{formateAmount(data?.dataArray?.[data?.dataArray.length - 1].age_above)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <span className="flex justify-center mt-2 ">Powered by Bayanat Technology</span>
      </div>
    </>
  );
};

export default AgiengPeriodWiseReport;
