import React, { useEffect, useState, useRef } from 'react';
import { Button, Typography, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import autoTable from 'jspdf-autotable';

import PRGroupSummaryTable from './PRGroupSummaryTable';

interface PRReportParams {
  fromDate: string;
  toDate: string;
  projectCode?: string;
  requestStatus?: string;
  prType?: string;
  serviceRmFlag?: string;
  reportType?: string;
}

interface PRReportData {
  request_number: string;
  request_date: string;
  header_amount?: number | null;
  status?: string;
  project_name?: string;
  service_rm_flag?: string;
  type_of_pr?: string;
  div_code?: string;
}

interface PRReportProps {
  reportParams: PRReportParams;
  onClose: () => void;
}

const PRReportSummary: React.FC<PRReportProps> = ({ reportParams, onClose }) => {
  const { fromDate, toDate, projectCode = '', requestStatus = '', prType = '', serviceRmFlag = '', reportType = '' } = reportParams;
  const [reportData, setReportData] = useState<PRReportData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date().toISOString().slice(0, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pr_register_summary', fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType],
    queryFn: async (): Promise<any[]> => {
      return await GmPfServiceInstance.fetchPRregisterdata(fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType);
    },
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (data) {
      setReportData(
        data.map((item: any) => ({
          request_number: item.request_number ?? 'N/A',
          request_date: item.request_date ? new Date(item.request_date).toLocaleDateString('en-GB') : 'N/A',
          header_amount: item.header_amount ?? 0,
          status: item.status ?? 'Unknown Status',
          project_name: item.project_name ?? 'N/A',
          service_rm_flag: item.service_rm_flag ?? 'Unknown service_rm_flag',
          type_of_pr: item.type_of_pr ?? 'Unknown type_of_pr',
          div_code: item.div_code ?? 'Unknown div_code'
        }))
      );
      setOpenDialog(true);
    }
  }, [data]);

  const generatePDF = () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('PR REGISTER SUMMARY REPORT', pdf.internal.pageSize.width / 2, 15, { align: 'center' });

    const tableColumnHeaders = ['Request Number', 'Request Date', 'Project Name', 'Amount', 'Status', 'Type of PR', 'Services'];
    const tableRows = reportData.map((item) => [
      item.request_number,
      item.request_date,
      item.project_name || 'N/A',
      Number(item.header_amount) ? Number(item.header_amount).toFixed(2) : '0.00',
      item.status || 'Unknown',
      item.type_of_pr || 'Unknown',
      item.service_rm_flag || 'Unknown'
    ]);

    autoTable(pdf, {
      head: [tableColumnHeaders],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 81, 181], textColor: 255, fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    pdf.save(`PR_Register_Summary_${formattedDate}.pdf`);
  };

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map((item) => ({
        'Request Number': item.request_number,
        'Request Date': item.request_date,
        'Project Name': item.project_name,
        'Type Of Pr': item.type_of_pr,
        Services: item.service_rm_flag,
        Amount: Number(item.header_amount) ? Number(item.header_amount).toFixed(2) : '0.00',
        Status: item.status
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PR Summary Report');
    XLSX.writeFile(workbook, `PR_Register_Summary_${formattedDate}.xlsx`);
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading data</Typography>;

  return (
    <Dialog open={openDialog} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{ textAlign: 'center', backgroundColor: '#3f51b5', color: '#fff', padding: '16px 0', fontSize: '18px', fontWeight: 'bold' }}
      >
        PR REGISTER SUMMARY REPORT
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div ref={tableRef}>
          <PRGroupSummaryTable data={reportData} />
        </div>
      </DialogContent>

      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={generatePDF} sx={{ backgroundColor: 'blue', color: 'white', '&:hover': { backgroundColor: 'darkblue' } }}>
          Download PDF
        </Button>
        <Button onClick={generateExcel} sx={{ backgroundColor: 'green', color: 'white', '&:hover': { backgroundColor: 'darkgreen' } }}>
          Download Excel
        </Button>
        <Button onClick={onClose} sx={{ backgroundColor: 'gray', color: 'white', '&:hover': { backgroundColor: 'darkgray' } }}>
          Close
        </Button>
        <Button onClick={() => window.print()} color="primary">
          Print Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PRReportSummary;
