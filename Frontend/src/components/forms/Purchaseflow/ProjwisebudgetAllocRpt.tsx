import React, { useEffect, useState } from 'react';
import {
  Button,
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
  TableFooter,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import * as XLSX from 'xlsx';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

interface projwisebudgetReportParams {
  fromDate: string;
  toDate: string;
  projectCode?: string;
  requestStatus?: string;
  prType?: string;
  serviceRmFlag?: string;
  reportType: 'Summary' | 'Detailed';
}

interface ReportData {
  approved_amt?: string;
  request_number?: string;
  requested_date?: string;
  project_code?: string;
  project_name?: string;
}

interface projwisebudgetReportProps {
  reportParams: projwisebudgetReportParams;
  onClose: () => void;
}

const ProjwisebudgetAllocRpt: React.FC<projwisebudgetReportProps> = ({ reportParams, onClose }) => {
  const { fromDate, toDate, projectCode = '', requestStatus = '', prType = '', serviceRmFlag = '', reportType } = reportParams;
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0); // store total amount
  const [subtotals, setSubtotals] = useState<{ [key: string]: number }>({}); // store subtotal amount per project code

  // Fetch data from the backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['pr_register_data', fromDate, toDate, projectCode, requestStatus, prType, serviceRmFlag],
    queryFn: async (): Promise<any[]> => {
      return await GmPfServiceInstance.fetchProjectwisebudgetAllocation(
        fromDate,
        toDate,
        projectCode,
        requestStatus,
        prType,
        serviceRmFlag
      );
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  useEffect(() => {
    if (data) {
      const formattedData: ReportData[] = data.map((item: any) => ({
        project_name: item.project_name ?? 'N/A',
        approved_amt: item.approved_amt ?? 'N/A',
        request_number: item.request_number ?? 'N/A',
        requested_date: item.requested_date ?? 'N/A',
        project_code: item.project_code ?? 'N/A'
      }));

      const subtotals: { [key: string]: number } = {};
      formattedData.forEach((item) => {
        if (item.approved_amt && !isNaN(Number(item.approved_amt))) {
          const approved_amt = Number(item.approved_amt);
          if (item.project_code) {
            if (subtotals[item.project_code]) {
              subtotals[item.project_code] += approved_amt;
            } else {
              subtotals[item.project_code] = approved_amt;
            }
          }
        }
      });
      setSubtotals(subtotals);
      setReportData(formattedData);
      setTotalAmount(formattedData.reduce((sum, item) => sum + (isNaN(Number(item.approved_amt)) ? 0 : Number(item.approved_amt)), 0));

      if (reportType === 'Summary') {
        const uniqueData = Array.from(new Map(formattedData.map((item) => [item.request_number, item])).values());
        setReportData(uniqueData);
      } else {
        setReportData(formattedData);
      }

      setOpenDialog(true);
    }
  }, [data, reportType]);

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PR Report');
    const PRExcfileName = `Project_budget_allocaltion_${new Date().toLocaleDateString()}.xlsx`;
    XLSX.writeFile(workbook, PRExcfileName);
  };

  //Styles for PDF (Replicating dialog styles)
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      padding: 20,
      fontSize: 10
    },
    section: {
      marginBottom: 10
    },
    table: {
      width: '100%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 10,
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#3f51b5',
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 4,
      fontSize: 10
    },
    tableRow: {
      flexDirection: 'row',
      width: '100%'
    },
    projectRow: {
      backgroundColor: '#DBEAFE',
      borderTop: '1px solid #ccc',
      borderBottom: '1px solid #ccc',
      borderLeft: '1px solid #ccc',
      borderRight: '1px solid #ccc',
      padding: 4,
      flex: 1, // Ensures cells take up equal space
      textAlign: 'left',
      fontWeight: 'bold'
    },
    projectCell: {
      padding: 4,
      flex: 1,
      textAlign: 'left',
      fontWeight: 'bold',
      backgroundColor: '#DBEAFE'
    },
    tableCell: {
      border: '1px solid #ccc',
      padding: 4,
      flex: 1, // Ensures cells take up equal space
      textAlign: 'left',
      fontSize: 10
    },
    tableFooter: {
      fontWeight: 'bold',
      textAlign: 'right'
    },
    subTotal: {
      fontWeight: 'bold',
      textAlign: 'right',
      flex: 1, // Ensures it takes up available space
      borderTop: '1px solid #ccc',
      borderLeft: '1px solid #ccc',
      borderRight: '1px solid #ccc',
      borderBottom: '1px solid #ccc',
      padding: 4
    },
    totalAmount: {
      fontWeight: 'bold',
      textAlign: 'right',
      flex: 1, // Ensures it takes up available space
      borderTop: '1px solid #ccc',
      borderLeft: '1px solid #ccc',
      borderRight: '1px solid #ccc',
      borderBottom: '1px solid #ccc',
      padding: 4
    },
    pageNumber: {
      fontSize: 8,
      textAlign: 'center',
      marginTop: 20
    },
    header: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15
    },
    colspanCell: {
      flex: 1, // Spans two columns by taking more space
      padding: 4,
      borderRightWidth: 1,
      borderColor: '#ccc',
      textAlign: 'center',
      fontSize: 10
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 8,
      color: '#888'
    },
    totalAmountContainer: {
      marginTop: 10,
      paddingHorizontal: 10,
      textAlign: 'right'
    }
  });

  // PDF Generation Logic
  const generatePDF = () => {
    if (!reportData || reportData.length === 0) {
      console.error('No data to generate PDF.');
      return;
    }

    const rowsPerPage = 25; // Adjust this number based on how many rows fit in a page
    const totalPages = Math.ceil(reportData.length / rowsPerPage);

    // Split report data into pages
    const pagesData = [];
    for (let i = 0; i < totalPages; i++) {
      pagesData.push(reportData.slice(i * rowsPerPage, (i + 1) * rowsPerPage));
    }

    const doc = (
      <Document>
        {pagesData.map((pageData, pageIndex) => (
          <Page style={styles.page} key={pageIndex}>
            <View style={styles.section}>
              {/* Header */}
              <Text style={styles.header}>PROJECT BUDGET ALLOCATION</Text>
            </View>

            {/* Table */}
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableHeader]}>Request No</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Request Date</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Approved Amt</Text>
              </View>

              {pageData.map((item, index) => {
                // Check if the current row is the last one for this project
                const isLastRowForProject = index === pageData.length - 1 || pageData[index + 1].project_code !== item.project_code;

                // Alternate row colors
                const rowStyle = index % 2 === 0 ? { backgroundColor: '#f7f7f7' } : { backgroundColor: '#ffffff' };

                return (
                  <React.Fragment key={index}>
                    {/* Project Header: "PROJECT NO" and "PROJECT NAME" */}
                    {(index === 0 || pageData[index - 1].project_code !== item.project_code) && (
                      <View style={styles.tableRow}>
                        <Text style={styles.projectCell}>
                          <Text style={{ fontWeight: 'bold' }}>PROJECT NO: </Text>
                          {item.project_code}
                        </Text>
                        <Text style={[styles.projectCell, styles.colspanCell, { flex: 3 }]}>
                          <Text style={{ fontWeight: 'bold' }}>PROJECT NAME: </Text>
                          {item.project_name}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.tableRow, rowStyle]}>
                      <Text style={styles.tableCell}>{item.request_number}</Text>
                      <Text style={styles.tableCell}>{item.requested_date}</Text>
                      <Text style={styles.tableCell}>{Number(item.approved_amt) !== 0 ? item.approved_amt : 'N/A'}</Text>
                    </View>

                    {/* Subtotal for Project (only for last row in the project) */}
                    {isLastRowForProject && (
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colspanCell, { textAlign: 'right', fontWeight: 'bold' }]}>
                          {'Sub TOTAL:'}
                        </Text>
                        <Text style={styles.subTotal}>
                          <Text style={{ fontWeight: 'bold' }}>{subtotals[item.project_code ?? 'N/A']?.toFixed(2)}</Text>
                        </Text>
                      </View>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Total Amount Row (on the last page only) */}
              {pageIndex === totalPages - 1 && (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colspanCell, { textAlign: 'right', fontWeight: 'bold' }]}>Total:</Text>
                  <Text style={styles.totalAmount}>
                    <Text style={[{ textAlign: 'right', fontWeight: 'bold' }]}>{totalAmount.toFixed(2)}</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Page Number Footer */}
            <View style={styles.footer}>
              <Text style={styles.pageNumber}>
                Page {pageIndex + 1} of {totalPages}
              </Text>
            </View>
          </Page>
        ))}
      </Document>
    );

    pdf(doc)
      .toBlob()
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Project_budget_allocation_${new Date().toLocaleDateString()}.pdf`;
        a.click();
      });
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error loading data</Typography>;

  return (
    <>
      <Dialog open={openDialog} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ textAlign: 'center', backgroundColor: '#3f51b5', color: '#fff', padding: '16px 0', fontSize: '18px', fontWeight: 'bold' }}
        >
          PROJECT BUDGET ALLOCATION
        </DialogTitle>

        <DialogContent>
          <Table size="small" className="w-full table-collapse table-auto" id="pdf-content">
            <TableHead className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-md text-white">
              <TableRow>
                <TableCell className="font-bold text-sm py-1 px-2">Request No</TableCell>
                <TableCell className="font-bold text-sm py-1 px-2">Request Date</TableCell>
                <TableCell className="font-bold text-sm py-1 px-2 text-right">Approved Amt</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {reportData.map((item, index) => {
                const isLastRowForProject = index === reportData.length - 1 || reportData[index + 1].project_code !== item.project_code;

                return (
                  <React.Fragment key={`project-budget-head-${index}`}>
                    {/* Project Header */}
                    {(index === 0 || reportData[index - 1].project_code !== item.project_code) && (
                      <>
                        <TableRow>
                          <TableCell className="bg-blue-100 font-bold text-center py-1 px-2 border-none">
                            <strong>PROJECT NO: {item.project_code}</strong>
                          </TableCell>
                          <TableCell colSpan={2} className="bg-blue-100 font-bold text-center py-1 px-2 border-none">
                            <strong>PROJECT NAME: {item.project_name}</strong>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} className="bg-gray-300 border-none" />
                        </TableRow>
                      </>
                    )}

                    {/* Data Row */}
                    <TableRow className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                      <TableCell className="py-1 px-2">{item.request_number}</TableCell>
                      <TableCell className="py-1 px-2">{item.requested_date}</TableCell>
                      <TableCell className="py-1 px-2 text-right">{Number(item.approved_amt) !== 0 ? item.approved_amt : 'N/A'}</TableCell>
                    </TableRow>

                    {/* Subtotal for the Project (last row for the project only) */}
                    {isLastRowForProject && (
                      <TableRow>
                        <TableCell colSpan={2} className="font-bold text-right py-1 px-2">
                          <strong>Sub TOTAL:</strong>
                        </TableCell>
                        <TableCell className="font-bold text-right py-1 px-2">
                          {subtotals[item.project_code ?? 'N/A']?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold text-right py-1 px-2 text-gray-800">
                  <strong>Total:</strong>
                </TableCell>
                <TableCell className="font-bold text-right py-1 px-2 text-gray-800">{totalAmount.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
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
    </>
  );
};

export default ProjwisebudgetAllocRpt;
