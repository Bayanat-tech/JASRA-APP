import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Box } from '@mui/system';

interface POReportParams {
  fromDate: string;
  toDate: string;
  projectCode?: string;
  requestStatus?: string;
  prType?: string;
  serviceRmFlag?: string;
  reportType: 'Summary' | 'Detailed';
}

interface ReportData {
  request_number: string;
  ref_doc_no: String;
  doc_date: String;
  request_date: string;
  amount?: string;
  item_code?: string;
  item_rate?: number;
  item_p_qty?: number;
  lcurr_amt?: number;
  item_desp?: string;
  create_user?: string;
  type_of_pr?: string;
  p_uom?: string;
  upp?: number;
  l_uom?: string;
  item_l_qty?: string;
  appr_item_p_qty?: number;
  project_name: string;
  supplier: string;
  supp_name: string;
}

interface POReportProps {
  reportParams: POReportParams;
  onClose: () => void;
}

const POReport: React.FC<POReportProps> = ({ reportParams, onClose }) => {
  const { fromDate, toDate, projectCode = '', requestStatus = '', prType = '', serviceRmFlag = '', reportType = '' } = reportParams;
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0); // store total amount
  //const [subtotals, setSubtotals] = useState<{ [key: string]: number }>({}); // store subtotal amount for purstatus

  // Fetch data from the backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['po_register_data', fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType],
    queryFn: async (): Promise<any[]> => {
      console.log('Fetching PO register data...');
      return await GmPfServiceInstance.fetchPOregisterdata(fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType);
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  useEffect(() => {
    if (data) {
      // Format and clean up data
      const formattedData: ReportData[] = data.map((item: any) => ({
        request_number: item.request_number ?? 'N/A',
        ref_doc_no: item.ref_doc_no ?? 'N/A',
        request_date: item.request_date ?? 'N/A',
        doc_date: item.doc_date ?? 'N/A',
        amount: item.amount ?? 'N/A',
        item_code: item.item_code ?? 'N/A',
        item_rate: item.item_rate ?? 0,
        item_p_qty: item.item_p_qty ?? 0,
        lcurr_amt: item.lcurr_amt ?? 0,
        item_desp: item.item_desp ?? 'N/A',
        supplier: item.supplier ?? 'N/A',
        supp_name: item.supp_name ?? 'N/A',

        //need to check var
        create_user: item.create_user ?? '',
        type_of_pr: item.type_of_pr ?? '',
        p_uom: item.p_uom ?? '',
        upp: item.upp ?? 0,
        l_uom: item.l_uom ?? 'N/A',
        item_l_qty: item.item_l_qty ?? 'N/A',
        appr_item_p_qty: item.appr_item_p_qty ?? 0,
        project_name: item.project_name ?? 'N/A'
      }));

      setReportData(formattedData);
      setTotalAmount(formattedData.reduce((sum, item) => sum + (isNaN(Number(item.amount)) ? 0 : Number(item.amount)), 0));

      // Set subtotals in state
      //setSubtotals(subtotals);

      // If summary report, remove duplicates by request_number
      if (reportType === 'Summary') {
        const uniqueData = Array.from(new Map(formattedData.map((item) => [item.request_number, item])).values());
        setReportData(uniqueData);
      } else {
        setReportData(formattedData);
      }

      // Calculate the total amount
      const total = formattedData.reduce((sum, item) => {
        const amount = Number(item.amount); // Ensure the amount is numeric
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      setTotalAmount(total);

      setOpenDialog(true); // Automatically open the dialog after data is loaded
    }
  }, [data, reportType]);

  // Function to generate and save PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Purchase Request Report', 14, 10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 20);

    let yPos = 30;

    if (reportType === 'Summary') {
      doc.text('Po No  |  Request Date  |  Amount', 14, yPos);
      yPos += 10;
      reportData.forEach((item) => {
        doc.text(`${item.request_number}  |  ${item.request_date}  |  ${item.amount}`, 14, yPos);
        yPos += 10;
      });
    } else {
      // Detailed Report Layout: Grouping Request Number, Request Date, Amount
      reportData.forEach((item, index) => {
        doc.text(`Po No: ${item.ref_doc_no}`, 14, yPos);
        yPos += 10;
        doc.text(`Doc Date: ${item.doc_date}`, 14, yPos);
        yPos += 10;
        doc.text(`Amount: ${item.amount}`, 14, yPos);
        yPos += 10;

        // Add item details below the PR Number block
        doc.text('Item Code  |  Amount  |  Description', 14, yPos);
        yPos += 10;
        doc.text(`${item.item_code}  |  ${item.lcurr_amt}  |  ${item.item_desp}`, 14, yPos);
        yPos += 10;

        // Add space between each PR Number block
        yPos += 20;
      });
    }
    const POfilePDFName = `Purchase_Order_Report_${formattedDate}.pdf`;
    doc.save(POfilePDFName);
  };

  // const groupedData = reportData.reduce((acc, item) => {
  //   const key = item.ref_doc_no;
  //   if (!acc[key]) {
  //     acc[key] = [];
  //   }
  //   acc[key].push(item);
  //   return acc;
  // }, {} as Record<string, typeof reportData>);

  //current Date DD/MM/YYYY
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  // Function to save data as Excel
  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PR Report');
    const PRExcfileName = `Purchase_Request_Register_${formattedDate}.xlsx`;
    XLSX.writeFile(workbook, PRExcfileName);
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading data</Typography>;

  return (
    <>
      <Dialog open={openDialog} onClose={onClose}>
        <DialogTitle>{reportType === 'Summary' ? 'PURCHASE ORDER REPORT (SUMMARY)' : 'PURCHASE ORDER REPORT (DETAIL)'}</DialogTitle>

        <DialogContent>
          <Box>
            <div>Date: {formattedDate}</div> {/* Display current date and time */}
          </Box>
          <Table
            size="small"
            sx={{
              '& .MuiTableCell-root': {
                fontSize: '10.5px',
                padding: '8px', // Adjust padding
                border: '1px solid #ddd' // Add borders
              }
            }}
          >
            {/*PR SUMMARY HEAD */}
            {reportType === 'Summary' ? (
              <TableHead>
                <TableRow>
                  <TableCell>Po No</TableCell>
                  <TableCell>Po Date</TableCell>
                  <TableCell>Supp Code</TableCell>
                  <TableCell>Supp Name</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
            ) : (
              // PR DETAIL HEAD
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={1}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: 'none',
                      textTransform: 'none',
                      lineHeight: '1.5',
                      backgroundColor: 'white',
                      color: 'red'
                    }}
                  >
                    PO Number
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: 'none',
                      textTransform: 'none',
                      lineHeight: '1.5',
                      backgroundColor: 'white',
                      color: 'black'
                    }}
                  >
                    Supplier Code
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: 'none',
                      textTransform: 'none',
                      lineHeight: '1.5',
                      backgroundColor: 'white',
                      color: 'black'
                    }}
                  >
                    Supplier Name
                    {/* </TableCell>
                  <TableCell
                    colSpan={5}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: 'none',
                      textTransform: 'none',
                      lineHeight: '1.5',
                      backgroundColor: 'white',
                      color: 'black'
                    }}
                  >
                    Type Of PR */}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    rowSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Item Code
                  </TableCell>
                  {/* <TableCell
                    colSpan={6}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Requested Qty/Approved Qty
                  </TableCell> */}
                  <TableCell
                    rowSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Final Rate (Incl Disc)
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.5'
                    }}
                  >
                    {/* Currency */}
                    LOUM
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Ex Rate
                  </TableCell>
                  <TableCell
                    rowSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Appr Item
                  </TableCell>
                  {/* <TableCell
                    rowSpan={2}
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Local Amt
                  </TableCell> */}
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    POUM
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Pqty
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Upp
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    {/* LOUM */}
                    Currency
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    Lqty
                  </TableCell>
                  <TableCell
                    style={{
                      fontSize: '0.60rem',
                      textAlign: 'center',
                      padding: '1px',
                      border: '1px solid black',
                      textTransform: 'none',
                      lineHeight: '1.5'
                    }}
                  >
                    {/* Appr Item */}
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
            )}
            <TableBody>
              {reportData.map((item, index) => {
                //group by Request_number
                return reportType === 'Summary' ? (
                  <>
                    {/*PR SUMMARY ITEMS */}
                    <TableRow key={`summary-details-${index}`}>
                      <TableCell>
                        <strong style={{ visibility: item.ref_doc_no ? 'visible' : 'hidden' }}>{item.ref_doc_no}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.doc_date ? 'visible' : 'hidden' }}>{item.doc_date}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.supplier ? 'visible' : 'hidden' }}>{item.supplier}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.supp_name ? 'visible' : 'hidden' }}>{item.supp_name}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.amount ? 'visible' : 'hidden' }}>{item.amount}</strong>
                      </TableCell>

                      {/* <TableCell>
                        <strong style={{ visibility: Number(item.create_user) !== 0 ? 'visible' : 'hidden' }}>{item.create_user}</strong>
                      </TableCell> */}
                      <TableCell>
                        <strong style={{ visibility: Number(item.amount) !== 0 ? 'visible' : 'hidden' }}>{item.amount}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.type_of_pr) !== 0 ? 'visible' : 'hidden' }}>{item.type_of_pr}</strong>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <>
                    {/*PR Detail PURCH STATUS ITEMS  +  request_number*/}
                    <TableCell colSpan={1}>
                      <div style={{ visibility: item.ref_doc_no ? 'visible' : 'hidden', color: 'red' }}>{item.ref_doc_no}</div>
                    </TableCell>
                    <TableCell colSpan={4}>
                      <strong style={{ textAlign: 'right', visibility: item.supp_name ? 'visible' : 'hidden' }}>{item.supp_name}</strong>
                    </TableCell>
                    <TableCell colSpan={5}>
                      <div style={{ visibility: Number(item.type_of_pr) !== 0 ? 'visible' : 'hidden' }}>{item.type_of_pr}</div>
                    </TableCell>
                    {/*PR DETAIL ITEMS */}
                    <TableRow key={`detailed-details-${index}`}>
                      <TableCell>
                        <strong style={{ visibility: item.item_code ? 'visible' : 'hidden' }}>{item.item_code}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.p_uom ? 'visible' : 'hidden' }}>{item.p_uom}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.item_p_qty ? 'visible' : 'hidden' }}>{item.item_p_qty}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.upp) !== 0 ? 'visible' : 'hidden' }}>{item.upp}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.l_uom) !== 0 ? 'visible' : 'hidden' }}>{item.l_uom}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.item_l_qty) !== 0 ? 'visible' : 'hidden' }}>{item.item_l_qty}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.appr_item_p_qty) !== 0 ? 'visible' : 'hidden' }}>
                          {item.appr_item_p_qty}
                        </strong>
                      </TableCell>

                      {/*Final Rate = item_rate */}
                      <TableCell>
                        <strong style={{ visibility: Number(item.appr_item_p_qty) !== 0 ? 'visible' : 'hidden' }}>
                          {item.appr_item_p_qty}
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>QTR</strong>
                      </TableCell>
                      {/*Ex Rate var 1 */}
                      <TableCell>
                        <strong style={{ visibility: Number(item.amount) !== 0 ? 'visible' : 'hidden' }}>{item.amount}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.amount) !== 0 ? 'visible' : 'hidden' }}>{item.amount}</strong>
                      </TableCell>
                      {/*Local Amt  */}
                      {/* <TableCell>
                        <strong style={{ visibility: Number(item.lcurr_amt) !== 0 ? 'visible' : 'hidden' }}>{item.lcurr_amt}</strong>
                      </TableCell> */}
                    </TableRow>
                  </>
                );
              })}
            </TableBody>

            {/*PR FOOTER */}
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}></TableCell>
                <TableCell>
                  <strong>Grand Total:</strong>
                </TableCell>
                <TableCell colSpan={4}>{totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </DialogContent>

        {/*BUTTONS */}
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Close
          </Button>
          <Button onClick={generatePDF} color="primary">
            Download PDF
          </Button>
          <Button onClick={generateExcel} color="primary">
            Download Excel
          </Button>
          <Button onClick={() => window.print()} color="primary">
            Print Report
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default POReport;
