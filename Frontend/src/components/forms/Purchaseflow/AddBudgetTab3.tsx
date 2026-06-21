import React, { useState } from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Typography, TextField } from '@mui/material';

type AddbudgetTab3Props = {
  project_budgets: {
    company_code: string;
    project_code: string;
    month_budget: number | string; // Allow both number and string for month_budget
    budget_year: string;
    requested_amt: number;
    approved_amt: number;
    po_amount: number;
    pr_amount: number;
    prev_appr_amt: number;
  }[];
};

const AddbudgetTab3: React.FC<AddbudgetTab3Props> = ({ project_budgets }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getMonthName = (month: number): string => {
    const months = ['N/A', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month] || 'N/A';
  };

  // Function to check if the value contains the search term (case insensitive)
  const containsSearchTerm = (value: any, searchTerm: string) => {
    if (value && typeof value === 'string') {
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (typeof value === 'number') {
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  };

  // Handle the search for month names specifically
  const getMonthSearchTerm = (searchTerm: string): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const search = searchTerm.toLowerCase();
    const matchedMonth = months.find((month) => month.toLowerCase().includes(search));
    return matchedMonth || ''; // Return matched month or empty string if no match
  };

  // Filter the budget list based on the search term
  const filteredBudgets = project_budgets.filter((budget) => {
    const monthMatch = getMonthSearchTerm(searchTerm);
    return (
      Object.values(budget).some((value) => containsSearchTerm(value, searchTerm)) ||
      (monthMatch && getMonthName(Number(budget.month_budget)) === monthMatch)
    );
  });

  // Calculate totals
  const totalRequestedAmt = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.requested_amt) || 0), 0);
  const totalApprovedAmt = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.approved_amt) || 0), 0);
  const totalPrAmount = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.pr_amount) || 0), 0);
  const totalPoAmount = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.po_amount) || 0), 0);
  const totalPrevApprAmt = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.prev_appr_amt) || 0), 0);

  return (
    <Grid
      container
      spacing={2}
      padding={2}
      style={{ height: 'calc(100vh - 100px)', maxHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        {filteredBudgets.length > 0 && (
          <Grid item xs={12} sx={{ marginBottom: '16px' }}>
            <Typography variant="h6">Project Code: {filteredBudgets[0].project_code}</Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          {/* Search Input */}
          <Grid item xs={12} style={{ left: 0, padding: '10px', width: '50%', minWidth: '250px' }}>
            <TextField
              variant="outlined"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              style={{ width: '50%', minWidth: '250px' }}
            />
          </Grid>
          <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell align="center">
                    <b>Month Budget</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Budget Year</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Requested Amount</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Approved Amount</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>PR Amount</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>PO Amount</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Prev Approved Amount</b>
                  </TableCell>
                </TableRow>

                {filteredBudgets.map((budget, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{budget.month_budget ? getMonthName(Number(budget.month_budget)) : 'N/A'}</TableCell>
                    <TableCell align="center">{budget.budget_year || 'N/A'}</TableCell>
                    <TableCell align="center">{Number(budget.requested_amt).toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="center">{Number(budget.approved_amt).toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="center">{Number(budget.pr_amount).toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="center">{Number(budget.po_amount).toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="center">{Number(budget.prev_appr_amt).toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                ))}

                {/* Totals Row */}
                <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                  <TableCell align="center">
                    <b>Total</b>
                  </TableCell>
                  <TableCell align="center">-</TableCell>
                  <TableCell align="center">
                    <b>{totalRequestedAmt.toFixed(2)}</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>{totalApprovedAmt.toFixed(2)}</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>{totalPrAmount.toFixed(2)}</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>{totalPoAmount.toFixed(2)}</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>{totalPrevApprAmt.toFixed(2)}</b>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {filteredBudgets.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary" align="center">
              No matching budget data found.
            </Typography>
          </Grid>
        )}
      </div>
    </Grid>
  );
};

export default AddbudgetTab3;
