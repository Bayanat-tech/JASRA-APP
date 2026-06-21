import React, { useState } from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Typography, TextField, TableHead } from '@mui/material';

type AddBudgetTab2Props = {
  itemBudgets: {
    cost_code: string;
    requested_amt: number;
    req_appr_amt: number;
    pr_amount: number;
    po_amount: number;
    cost_name: string;
    prev_appr_amt: number;
  }[];
};

const AddBudgetTab2: React.FC<AddBudgetTab2Props> = ({ itemBudgets }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered Data Based on Search Input
  const filteredBudgets = itemBudgets.filter((budget) =>
    Object.values(budget).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate Totals
  const totalRequestedAmt = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.requested_amt) || 0), 0);
  const totalReqApprAmt = filteredBudgets.reduce((sum, budget) => sum + (Number(budget.req_appr_amt) || 0), 0);
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
      {/* Scrollable Content */}
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        <Grid item xs={12}>
          {/* Search Field */}
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
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <b>Cost Code</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Requested Amount</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Requested Approved Amount</b>
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
              </TableHead>

              <TableBody>
                {filteredBudgets.map((budget, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{budget.cost_code || 'N/A'}</TableCell>
                    <TableCell align="center">{Number(budget.requested_amt).toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="center">{Number(budget.req_appr_amt).toFixed(2) || '0.00'}</TableCell>
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
                  <TableCell align="center">
                    <b>{totalRequestedAmt.toFixed(2)}</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>{totalReqApprAmt.toFixed(2)}</b>
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

export default AddBudgetTab2;
