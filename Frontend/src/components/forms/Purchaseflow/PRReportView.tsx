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
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Box } from '@mui/system';

interface PRReportParams {
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
  request_date: string;
  amount?: string;
  item_code?: string;
  item_rate?: number;
  item_p_qty?: number;
  lcurr_amt?: number;
  item_desp?: string;
  project_code?: string;
  create_user?: string;
  type_of_pr?: string;
  p_uom?: string;
  upp?: number;
  l_uom?: string;
  item_l_qty?: string;
  appr_item_p_qty?: number;
  project_name: string;
  status: string;
}

interface PRReportProps {
  reportParams: PRReportParams;
  onClose: () => void;
}

const PRReport: React.FC<PRReportProps> = ({ reportParams, onClose }) => {
  const { fromDate, toDate, projectCode = '', requestStatus = '', prType = '', serviceRmFlag = '', reportType = '' } = reportParams;
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0); // store total amount
  const [subtotals, setSubtotals] = useState<{ [key: string]: number }>({}); // store subtotal amount for purstatus

  // Fetch data from the backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['pr_register_data', fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType],
    queryFn: async (): Promise<any[]> => {
      console.log('Fetching PR register data...');
      return await GmPfServiceInstance.fetchPRregisterdata(fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag, reportType);
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  useEffect(() => {
    if (data) {
      // Format and clean up data
      const formattedData: ReportData[] = data.map((item: any) => ({
        request_number: item.request_number ?? 'N/A',
        request_date: item.request_date ?? 'N/A',
        amount: item.amount ?? 'N/A',
        item_code: item.item_code ?? 'N/A',
        item_rate: item.item_rate ?? 0,
        item_p_qty: item.item_p_qty ?? 0,
        lcurr_amt: item.lcurr_amt ?? 0,
        item_desp: item.item_desp ?? 'N/A',

        //need to check var
        project_code: item.project_code ?? 'N/A',
        create_user: item.create_user ?? '',
        type_of_pr: item.type_of_pr ?? '',
        p_uom: item.p_uom ?? '',
        upp: item.upp ?? 0,
        l_uom: item.l_uom ?? 'N/A',
        item_l_qty: item.item_l_qty ?? 'N/A',
        appr_item_p_qty: item.appr_item_p_qty ?? 0,
        project_name: item.project_name ?? 'N/A',
        status: item.status ?? 'N/A'
      }));

      // Calculate subtotals for status
      const subtotals: { [key: string]: number } = {};
      formattedData.forEach((item) => {
        if (item.amount && !isNaN(Number(item.amount))) {
          const amount = Number(item.amount);
          if (item.status) {
            if (subtotals[item.status]) {
              subtotals[item.status] += amount;
            } else {
              subtotals[item.status] = amount;
            }
          }
        }
      });

      setReportData(formattedData);
      setTotalAmount(formattedData.reduce((sum, item) => sum + (isNaN(Number(item.amount)) ? 0 : Number(item.amount)), 0));

      // Set subtotals in state
      setSubtotals(subtotals);

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

  const generatePDF = () => {
    const input = document.getElementById('pdf-content');

    if (input) {
      // Capture the content with html2canvas
      html2canvas(input, {
        scale: 2, // Increase scale to improve quality, you can adjust this
        useCORS: true, // Ensure external resources are included
        width: input.offsetWidth, // Dynamically set width based on the content
        height: input.offsetHeight, // Dynamically set height
        scrollX: 0,
        scrollY: -window.scrollY // Prevent any page offset issues
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4');

        // Manually add the title to the PDF with specific margins
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(63, 81, 181); // Background color of title
        doc.rect(0, 0, 210, 20, 'F'); // Draw a rectangle for the title background
        doc.text('PROJECT BUDGET ALLOCATION', 105, 15, { align: 'center' });

        // Add the image below the title, making it fit on the page
        const pageHeight = doc.internal.pageSize.height;
        const imgWidth = 190; // Image width
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
        const imgY = 25; // Y-position to start the image

        let currentY = imgY; // Track the current Y position on the page

        // Add the first page
        doc.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight); // Add the image to the first page

        // Calculate the total number of pages needed
        const totalPages = Math.ceil(imgHeight / pageHeight);
        for (let i = 1; i < totalPages; i++) {
          doc.addPage(); // Add new page
          currentY = 25; // Reset Y position for the next page
          doc.addImage(imgData, 'PNG', 10, currentY, imgWidth, imgHeight); // Add the image to the new page
        }

        // Add page numbers
        const pageCount = doc.internal.pages.length;
        for (let page = 1; page <= pageCount; page++) {
          doc.setPage(page); // Switch to the current page
          doc.setFontSize(10); // Set the font size for the page number
          doc.setTextColor(0, 0, 0); // Set the color of the page number
          const pageNumber = `${page} / ${pageCount}`; // Format: Current Page / Total Pages
          doc.text(pageNumber, 105, pageHeight - 10, { align: 'center' }); // Position the page number at the bottom center
        }

        // Save the PDF
        doc.save('Project_Budget_Allocation_Report.pdf');
      });
    }
  };

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
        <DialogTitle>{reportType === 'Summary' ? 'PURCHASE REQUEST REGISTER (SUMMARY)' : 'PURCHASE REQUEST REGISTER (DETAIL)'}</DialogTitle>

        <DialogContent>
          <Box>
            <div>Date: {formattedDate}</div> {/* Display current date and time */}
          </Box>

          <Table
            className="w-full table-collapse"
            id="pdf-content"
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
                  <TableCell>Request No</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Create User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Type of PR</TableCell>
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
                    Request Number
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
                    Project Code
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
                    Project Name
                  </TableCell>
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
                    Type Of PR
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
                  <TableCell
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
                    Currency
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
                    Amount
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
                    Local Amt
                  </TableCell>
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
                    LOUM
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
                    Appr Item
                  </TableCell>
                </TableRow>
              </TableHead>
            )}

            <TableBody>
              {reportData.map((item, index) => {
                //group by status
                const isLastRowForStatus = reportData.slice(0, index).every((prevItem) => prevItem.status !== item.status);

                //group by Request_number
                const isLastRowRequestNumberStatus = reportData
                  .slice(0, index)
                  .every((prevItem) => prevItem.request_number !== item.request_number);

                return reportType === 'Summary' ? (
                  <>
                    {/*PR SUMMARY PURCH STATUS ITEMS */}
                    {isLastRowForStatus && (
                      <TableRow key={`purch-status-${item.status}`}>
                        <TableCell colSpan={1}>
                          <strong style={{ visibility: item.status ? 'visible' : 'hidden' }}>Purchase Status: {item.status}</strong>
                        </TableCell>

                        <TableCell>
                          <strong style={{ visibility: item.project_code ? 'visible' : 'hidden' }}>{item.project_code}</strong>
                        </TableCell>

                        <TableCell colSpan={2}>
                          <strong>sub Total for Status: {subtotals[item.status ?? 'N/A']?.toFixed(2)}</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {/*PR SUMMARY ITEMS */}
                    <TableRow key={`summary-details-${index}`}>
                      <TableCell>
                        <strong style={{ visibility: item.request_number ? 'visible' : 'hidden' }}>{item.request_number}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: item.request_date ? 'visible' : 'hidden' }}>{item.request_date}</strong>
                      </TableCell>
                      <TableCell>
                        <strong style={{ visibility: Number(item.create_user) !== 0 ? 'visible' : 'hidden' }}>{item.create_user}</strong>
                      </TableCell>
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
                    {/*PR Detail STATUS  +  request_number*/}
                    {isLastRowForStatus && isLastRowRequestNumberStatus && (
                      <TableRow key={`purch-status-${item.status}`}>
                        <TableCell colSpan={1}>
                          <div style={{ visibility: item.status ? 'visible' : 'hidden', color: 'blue' }}>{item.status}</div>
                          <div style={{ visibility: item.request_number ? 'visible' : 'hidden', color: 'red' }}>{item.request_number}</div>
                        </TableCell>
                        <TableCell colSpan={2}>
                          <div></div>
                          <div style={{ textAlign: 'center', visibility: item.project_code ? 'visible' : 'hidden' }}>
                            {item.project_code}
                          </div>
                        </TableCell>
                        <TableCell colSpan={4}>
                          <strong style={{ textAlign: 'right', visibility: item.project_name ? 'visible' : 'hidden' }}>
                            {item.project_name}
                          </strong>
                        </TableCell>
                        <TableCell colSpan={5}>
                          <div style={{ visibility: Number(item.type_of_pr) !== 0 ? 'visible' : 'hidden' }}>{item.type_of_pr}</div>
                        </TableCell>
                      </TableRow>
                    )}
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
                      <TableCell>
                        <strong style={{ visibility: Number(item.lcurr_amt) !== 0 ? 'visible' : 'hidden' }}>{item.lcurr_amt}</strong>
                      </TableCell>
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
    </>
  );
};

export default PRReport;
