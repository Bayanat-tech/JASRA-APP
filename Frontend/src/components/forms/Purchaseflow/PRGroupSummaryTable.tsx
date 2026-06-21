import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';

interface PRReportData {
  request_number: string;
  request_date: string;
  header_amount?: number | null | string;
  status?: string;
  project_name?: string;
  type_of_pr?: string;
  service_rm_flag?: string;
  div_code?: string;
}

interface PRGroupSummaryTableProps {
  data: PRReportData[];
}

const PRGroupSummaryTable: React.FC<PRGroupSummaryTableProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.request_number.localeCompare(b.request_number));

  const groupedData = sortedData.reduce((acc, item) => {
    const statusKey = item.status || 'Unknown Status';
    const divKey = item.div_code || 'Unknown Div';
    const projectKey = item.project_name || 'Unknown Project';

    if (!acc[statusKey]) acc[statusKey] = {};
    if (!acc[statusKey][divKey]) acc[statusKey][divKey] = {};
    if (!acc[statusKey][divKey][projectKey]) acc[statusKey][divKey][projectKey] = [];

    acc[statusKey][divKey][projectKey].push(item);
    return acc;
  }, {} as Record<string, Record<string, Record<string, PRReportData[]>>>);

  const calculateTotal = (items: PRReportData[]) => items.reduce((sum, item) => sum + (parseFloat(item.header_amount as string) || 0), 0);

  const grandTotal = calculateTotal(data);

  console.log('this is data which is given ', data);

  return (
    <>
      <Typography variant="h6" sx={{ textAlign: 'center', my: 2, fontWeight: 'bold' }}>
        PR REGISTER SUMMARY REPORT
      </Typography>
      {Object.entries(groupedData).map(([status, divGroups]) => {
        const statusTotal = Object.values(divGroups).reduce(
          (sum, projects) =>
            sum +
            Object.values(projects)
              .flat()
              .reduce((s, i) => s + (parseFloat(i.header_amount as string) || 0), 0),
          0
        );
        return (
          <div key={status} style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
            <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontSize: '0.85rem', fontWeight: 'bold' }}>
              Status: {status}
            </Typography>
            {Object.entries(divGroups).map(([divCode, projectGroups]) => {
              const divTotal = Object.values(projectGroups)
                .flat()
                .reduce((sum, i) => sum + (parseFloat(i.header_amount as string) || 0), 0);
              return (
                <div key={divCode}>
                  <Typography variant="subtitle1" sx={{ fontSize: '0.80rem', fontWeight: 'bold', ml: 2 }}>
                    Div Code: {divCode}
                  </Typography>
                  {Object.entries(projectGroups).map(([projectName, items]) => {
                    const projectTotal = calculateTotal(items);
                    return (
                      <div key={projectName}>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', ml: 4 }}>
                          Project: {projectName}
                        </Typography>
                        <TableContainer component={Paper} sx={{ mb: 1, ml: 6 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                                <TableCell>Request Number</TableCell>
                                <TableCell>Request Date</TableCell>
                                <TableCell>Project Name</TableCell>
                                <TableCell>Type of PR</TableCell>
                                <TableCell>Services</TableCell>
                                <TableCell>Div Code</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell sx={{ textAlign: 'center' }}>{item.request_number}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>{item.request_date}</TableCell>
                                  <TableCell sx={{ textAlign: 'right' }}>{item.project_name || 'N/A'}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>{item.type_of_pr}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>{item.service_rm_flag}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>{item.div_code}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>{item.status}</TableCell>
                                  <TableCell sx={{ textAlign: 'right' }}>
                                    {parseFloat((item.header_amount as string) || '0').toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow sx={{ backgroundColor: '#d9edf7', fontWeight: 'bold' }}>
                                <TableCell colSpan={7} sx={{ textAlign: 'right' }}>
                                  Project Total:
                                </TableCell>
                                <TableCell>{projectTotal.toFixed(2)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    );
                  })}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'right', mr: 6 }}>
                    Div Code Total: {divTotal.toFixed(2)}
                  </Typography>
                </div>
              );
            })}
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'right', mr: 4 }}>
              Status Total: {statusTotal.toFixed(2)}
            </Typography>
          </div>
        );
      })}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableBody>
            <TableRow sx={{ backgroundColor: '#ffeb99', fontWeight: 'bold' }}>
              <TableCell colSpan={7} sx={{ textAlign: 'right' }}>
                Grand Total:
              </TableCell>
              <TableCell>{grandTotal.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default PRGroupSummaryTable;
