import React, { useEffect, useState, useRef } from 'react';
import { Button, Typography, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas'; // Use html2canvas instead of dom-to-image

import PRGroupTable from './PRGroupDetailTable';

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
  item_code?: string;
  item_rate?: number;
  allocated_approved_qty?: number;
  lcurr_amt?: number;
  addl_item_desc?: string;
  status?: string;
}

interface PRReportProps {
  reportParams: PRReportParams;
  onClose: () => void;
}

const PRReportDetail: React.FC<PRReportProps> = ({ reportParams, onClose }) => {
  const { fromDate, toDate, projectCode = '', requestStatus = '', prType = '', serviceRmFlag = '', reportType = '' } = reportParams;
  const [reportData, setReportData] = useState<PRReportData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date().toISOString().slice(0, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pr_register_data', fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType],
    queryFn: async (): Promise<any[]> => {
      console.log('Fetching PR Register data...');
      return await GmPfServiceInstance.fetchPRregisterdata(fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType);
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  useEffect(() => {
    if (data) {
      setReportData(
        data.map((item: any) => ({
          request_number: item.request_number ?? 'N/A',
          request_date: item.request_date
            ? new Date(item.request_date).toLocaleDateString('en-GB') // Converts to DD/MM/YYYY
            : 'N/A',
          item_code: item.item_code ?? 'N/A',
          item_rate: item.item_rate ?? 0,
          allocated_approved_qty: item.allocated_approved_quantity ?? 0, // Correct field name
          lcurr_amt: item.lcurr_amt ?? 0,
          addl_item_desc: item.addl_item_desc ?? 'N/A', // Correct field name
          status: item.status ?? 'Unknown Status'
        }))
      );
      setOpenDialog(true);
    }
  }, [data]);
  /** ✅ Generates a PDF from the table */
  const generatePDF = async () => {
    if (!tableRef.current) {
      console.error('Element not found for PDF generation.');
      return;
    }

    // Ensure visibility
    tableRef.current.style.display = 'block';

    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for rendering

    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true, // Helps if images are being blocked
      scrollX: 0,
      scrollY: -window.scrollY // Fixes positioning issue
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('PR_Report.pdf');
  };

  /** ✅ Generates an Excel file from the data */
  const generateExcel = () => {
    console.log('Generating Excel...');

    const excelData = reportData.map((item) => ({
      'Request Number': item.request_number,
      'Request Date': item.request_date,
      'Item Code': item.item_code || 'N/A',
      'Item Description': item.addl_item_desc || 'N/A',
      'Item Rate': item.item_rate ? Number(item.item_rate).toFixed(2) : '0.00',
      'Item Quantity': item.allocated_approved_qty ?? 0,
      Amount: item.lcurr_amt ? Number(item.lcurr_amt).toFixed(2) : '0.00',
      Status: item.status || 'Unknown'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PR Report');
    XLSX.writeFile(workbook, `PR_Register_Report_${formattedDate}.xlsx`);
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading data</Typography>;

  return (
    <Dialog open={openDialog} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{ textAlign: 'center', backgroundColor: '#3f51b5', color: '#fff', padding: '16px 0', fontSize: '18px', fontWeight: 'bold' }}
      >
        PR REGISTER REPORT
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div ref={tableRef}>
          <PRGroupTable data={reportData} />
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
      </DialogActions>
    </Dialog>
  );
};

export default PRReportDetail;
