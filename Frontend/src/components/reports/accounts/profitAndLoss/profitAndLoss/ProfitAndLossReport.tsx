import { PrinterOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import UniversalDialog from 'components/popup/UniversalDialog';
import React, { useState } from 'react';
import { ChildProfitAndLoss } from '../ChildProfitAndLoss';
import { FormattedMessage } from 'react-intl';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import useAuth from 'hooks/useAuth';
import { TProfitAndLossReport } from './profitAndLossAccounts.types';

// Define the ProfitAndLossreport component
const ProfitAndLossreport = ({
  contentRef,
  data,
  handlePrint,
  startDate,
  endDate
}: {
  contentRef: React.RefObject<HTMLDivElement>; // Ref for the content to be printed
  data: TProfitAndLossReport; // Data for the profit and loss report
  handlePrint: () => void; // Function to handle printing
  startDate: Date; // Start date for the report
  endDate: Date; // End date for the report
}) => {
  //---------constants-------------
  // State for the report name
  const [reportName, setReportName] = useState('');
  // State for the print data popup
  const [printDataPopup, setPrintDataPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Print Report" />,
    data: { isPrintDataMode: false }
  });
  //----------handlers----------
  // Function to toggle the print data popup
  const togglePrintData = (refetchData?: boolean) => {
    printDataPopup.action.open = false;
    // if (jobFormPopup.action.open === true && refetchData) {
    //   refetchJobData();
    // }
    setPrintDataPopup((prev) => {
      return { ...prev, data: { isPrintDataMode: false }, action: { ...prev.action, open: false } };
    });
  };
  // Function to handle printing data
  const handlePrinData = (reportName: string) => {
    setReportName(reportName);
    setPrintDataPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Print Data" />,
        data: { isPrintMode: true }
      };
    });
  };
  // Get the current user from the useAuth hook
  const { user } = useAuth();
  // Function to format date to MM/DD/YYYY
  const formatDateToMMDDYYYY = (isoString: any) => {
    const date = new Date(isoString);

    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };
  return (
    <>
      {/* Print button */}
      <div className="text-right">
        <Button startIcon={<PrinterOutlined />} variant="contained" onClick={handlePrint}>
          Print
        </Button>
      </div>
      {/* Report content */}
      <div className=" p-1" ref={contentRef}>
        <span className="flex justify-center">Profit & Loss Report</span>
        {/* Header for the report */}
        <h1 className="text-center font-bold mb-2 text-lg">
          Profit & Loss for the Period {formatDateToMMDDYYYY(startDate)} - {formatDateToMMDDYYYY(endDate)} (Division: BT)
        </h1>
        {/* Report information */}
        <div className="bg-white p-1">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <p>
                <span className="font-semibold">Date:</span>
                <span className="pl-4">{new Date().toLocaleString()}</span>
              </p>
              <p>
                <span className="font-semibold">User:</span>
                <span className="pl-4">{user?.contact_name}</span>
              </p>
              <p>
                <span className="font-semibold">Report:</span>
                <span className="pl-4">rpt_profit_loss</span>
              </p>
            </div>
          </div>
          {/* Separator */}
          <div className="border-t-2 border-gray-300 my-4"></div>
          {/* Table for displaying report data */}
          <table className="w-full">
            {data?.products?.map((item) => {
              return (
                <>
                  {/* Render heading row */}
                  {item.isHeading === true ? (
                    <h2 className="font-bold">{item.h_name}</h2>
                  ) : // Render total row
                  item.isTotal === true ? (
                    <tbody className="w-full mb-2 ">
                      <tr className="font-bold flex justify-between ">
                        <td className="py-2 ">TOTAL</td>
                        <td className="py-2  text-right">{item.lcur_amount}</td>
                      </tr>
                    </tbody>
                  ) : // Render grand total row (empty in this case)
                  item.plGrandTotal === true ? (
                    ''
                  ) : (
                    // Render data row
                    <tbody>
                      <tr
                        className="border-b cursor-pointer hover:bg-gray-200 p-1 flex justify-between mb-2 "
                        onClick={() => handlePrinData(item.h_name)}
                      >
                        <td className="py-2 ">{item.h_name}</td>
                        <td className="py-2  text-right">{item.lcur_amount}</td>
                      </tr>
                    </tbody>
                  )}
                </>
              );
            })}
          </table>
          {/* EBIDTA */}
          <div className="text-center font-bold text-blue-600 my-4">E B I D T A: 000</div>
          {/* Net Profit/Loss */}
          <div className="text-center font-bold text-red-600 my-4">
            NET PROFIT / (LOSS): {data?.products?.[data?.products?.length - 1]?.lcur_amount}
          </div>
        </div>
        {/* Universal dialog for displaying child profit and loss */}
        {!!printDataPopup && printDataPopup.action.open && (
          <UniversalDialog
            action={{ ...printDataPopup.action }}
            onClose={togglePrintData}
            title={printDataPopup.title}
            hasPrimaryButton={false}
          >
            <ChildProfitAndLoss data={reportName} />
          </UniversalDialog>
        )}
        {/* Footer */}
        <span className="flex justify-center mt-2 ">Powered by Bayanat Technology</span>
      </div>
    </>
  );
};

export default ProfitAndLossreport;
