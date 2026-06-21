import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableFooter, Typography } from '@mui/material';

interface ReportData {
  project_name?: string;
  project_code?: string;
  approved_amt?: string;
  request_number?: string;
  requested_date?: string;
}

interface GroupedTableProps {
  data: ReportData[];
}

const GroupedTable: React.FC<GroupedTableProps> = ({ data }) => {
  // Group data by project_code and project_name
  const groupedData = data.reduce((acc, item) => {
    const key = `${item.project_code}-${item.project_name}`;
    if (!acc[key]) {
      acc[key] = {
        projectCode: item.project_code,
        projectName: item.project_name,
        budgets: []
      };
    }
    acc[key].budgets.push({
      request_number: item.request_number,
      requested_date: item.requested_date,
      approved_amt: item.approved_amt
    });
    return acc;
  }, {} as Record<string, { projectCode?: string; projectName?: string; budgets: ReportData[] }>);

  return (
    <>
      {Object.values(groupedData).map((group, index) => (
        <div key={index}>
          {/* Group Header */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Project Code: {group.projectCode} | Project Name: {group.projectName}
          </Typography>

          {/* Table for Budget Details */}
          <Table size="small" sx={{ mb: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Request No</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Approved Amt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.budgets.map((budget, idx) => (
                <TableRow key={idx}>
                  <TableCell>{budget.request_number}</TableCell>
                  <TableCell>{budget.requested_date}</TableCell>
                  <TableCell>{budget.approved_amt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>
                  <strong>Total:</strong>
                </TableCell>
                <TableCell>{group.budgets.reduce((sum, budget) => sum + (Number(budget.approved_amt) || 0), 0).toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      ))}
    </>
  );
};

export default GroupedTable;
