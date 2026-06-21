import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface ReportParams {
  fromDate: string;
  toDate: string;
  projectCode?: string;
  requestStatus?: string;
  prType?: string;
  serviceRmFlag?: string;
}

interface ReportData {
  project_code: string;
  project_name: string;
  prev_appr_amt: number;
  non_charg_pr: number;
  pr_amount: number;
  non_charg_po: number;
  po_amount: number;
  balance: number;
  ch_customer_pr: number;
  ch_customer_po: number;
  ch_employee_pr: number;
  ch_employee_po: number;
  ch_supplier_pr: number;
  ch_supplier_po: number;
}

interface ReportProps {
  reportParams: ReportParams;
  onClose: () => void;
}

const Budgetstatusprojconsolidated: React.FC<ReportProps> = ({ reportParams, onClose }) => {
  const { fromDate, toDate, projectCode = '', requestStatus = '', prType = '', serviceRmFlag = '' } = reportParams;
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const formattedDate = new Date().toISOString().slice(0, 10);
  const { data, isLoading, error } = useQuery({
    queryKey: ['budget_status', fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag],
    queryFn: async (): Promise<any[]> => {
      return await GmPfServiceInstance.bugetcurstatusprojectwiseconsolidated(
        fromDate,
        toDate,
        projectCode,
        requestStatus,
        prType,
        serviceRmFlag
      );
    },
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const formattedData: ReportData[] = data.map((item) => ({
        project_code: item?.project_code ?? 'N/A',
        project_name: item?.project_name ?? 'N/A',
        prev_appr_amt: item?.prev_appr_amt ?? 0,
        non_charg_pr: item?.non_charg_pr ?? 0,
        pr_amount: item?.pr_amount ?? 0,
        non_charg_po: item?.non_charg_po ?? 0,
        po_amount: item?.po_amount ?? 0,
        balance: item?.balance ?? 0,
        ch_customer_pr: item?.ch_customer_pr ?? 0,
        ch_customer_po: item?.ch_customer_po ?? 0,
        ch_employee_pr: item?.ch_employee_pr ?? 0,
        ch_employee_po: item?.ch_employee_po ?? 0,
        ch_supplier_pr: item?.ch_supplier_pr ?? 0,
        ch_supplier_po: item?.ch_supplier_po ?? 0
      }));

      setReportData(formattedData);
      setOpenDialog(true);
    }
  }, [data]);

  console.log('reportData', reportData);
  console.log('data from api', data);

  const tableRef = useRef(null);

  const generatePDF = () => {
    if (!tableRef.current) return; // Prevent errors if ref is null

    html2canvas(tableRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('PROJECT BUDGET STATUS', pdf.internal.pageSize.width / 2, 15, { align: 'center' });

      const imgWidth = 280; // Adjust for A4 landscape width
      const startY = 25; // Adjusted to prevent overlap

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, imgHeight);
      pdf.save(`Project_Budget_Report_${formattedDate}.pdf`);
    });
  };

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget Report');
    XLSX.writeFile(workbook, 'Project_Budget_Report.xlsx');
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <p className="text-red-600">Error loading data</p>;

  return (
    <Dialog open={openDialog} onClose={onClose} maxWidth="lg">
      <DialogContent>
        <div className="p-6 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-bold text-center mb-4">PROJECT BUDGET STATUS</h2>
          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200">
                <tr className="border-b">
                  <th className="border p-2">Project Code</th>
                  <th className="border p-2">Project Name</th>
                  <th className="border p-2">Budget Approved Amt</th>
                  <th className="border p-2" colSpan={2}>
                    PR in Progress
                  </th>
                  <th className="border p-2">Total PR Amt</th>
                  <th className="border p-2" colSpan={2}>
                    Purchase Order
                  </th>
                  <th className="border p-2">Total PO Amt</th>
                  <th className="border p-2">Balance</th>
                  <th className="border p-2">Remarks</th>
                </tr>
                <tr className="border-b bg-gray-100">
                  <th className="border p-2" colSpan={3}></th>
                  <th className="border p-2">Type of PR</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2"></th>
                  <th className="border p-2">Type of PO</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2" colSpan={3}></th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <>
                    <tr className="border-b text-center">
                      <td className="border p-2 align-top">{item.project_code}</td>
                      <td className="border p-2 align-top break-words whitespace-normal w-40 max-w-xs">{item.project_name}</td>
                      <td className="border p-2 text-right align-top">{item.prev_appr_amt}</td>

                      <td className="border p-2 align-right">
                        <div className="flex flex-col">
                          <td className="border border-transparent p-2 text-right align-top">Non Charge</td>
                          <td className="border border-transparent p-2 text-right align-top">Ch.Customer</td>
                          <td className="border border-transparent p-2 text-right align-top">Ch.Employee</td>
                          <td className="border border-transparent p-2 text-right align-top">Ch.Supplier</td>
                        </div>
                      </td>

                      <td className="border p-2 align-right">
                        <div className="flex flex-col">
                          <td className="border border-transparent p-2 text-right">{item.non_charg_pr}</td>
                          <td className="border border-transparent p-2 text-right">{item.ch_customer_pr}</td>
                          <td className="border border-transparent p-2 text-right">{item.ch_employee_pr}</td>
                          <td className="border border-transparent p-2 text-right">{item.ch_supplier_pr}</td>
                        </div>
                      </td>
                      <td className="border p-2 text-right align-top">{item.pr_amount}</td>

                      <td className="border p-2 align-right">
                        <div className="flex flex-col">
                          <td className="border border-transparent p-2 text-right align-top">Non Charge</td>
                          <td className="border border-transparent p-2 text-right align-top">Ch.Customer</td>
                          <td className="border border-transparent p-2 text-right align-top">Ch.Employee</td>
                          <td className="border border-transparent p-2 text-right align-top">Ch.Supplier</td>
                        </div>
                      </td>

                      <td className="border p-2 align-right">
                        <div className="flex flex-col">
                          <td className="border border-transparent p-2 text-right">{item.non_charg_po}</td>
                          <td className="border border-transparent p-2 text-right">{item.ch_customer_po}</td>
                          <td className="border border-transparent p-2 text-right">{item.ch_employee_po}</td>
                          <td className="border border-transparent p-2 text-right">{item.ch_supplier_po}</td>
                        </div>
                      </td>

                      <td className="border p-2 text-right align-top">{item.po_amount}</td>
                      <td className="border p-2 text-right align-top">{item.balance}</td>
                      <td className="border p-2 text-green-600 font-bold align-top">Savings</td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-4">
        <Button onClick={generatePDF} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Download PDF
        </Button>
        <Button onClick={generateExcel} className="bg-green-500 text-white px-4 py-2 rounded-md">
          Download Excel
        </Button>
        <Button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Budgetstatusprojconsolidated;
