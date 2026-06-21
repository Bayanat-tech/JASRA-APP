import React, { useState, useEffect } from 'react';

import Modal from '@mui/material/Modal';
import {
  Box,
  TextField,
  Button,
  Typography,
  CssBaseline,
  Grid,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TCostbudget } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import { useSelector } from 'store';
import PfServiceInstance from 'service/service.purhaseflow';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useAuth from 'hooks/useAuth';
import DeleteIcon from '@mui/icons-material/Delete';
interface NewDataEntryComponentProps {
  request_number: string;
  project_code: string;
  onClose: () => void;
}

interface CostOption {
  cost_code: string;
  cost_name: string;
}

/*interface CostListResponse {
  tableData: CostOption[];
  count: number;
}*/

interface BudgetRow {
  company_code: string;
  request_number: string;
  cost_code: string;
  project_code: string;
  month_budget: number; // Store month as a number
  budget_year: number;
  requested_amt: number;
  approved_amt: number;
  po_amount: number;
  pr_amount: number;
  prev_appr_amt: number;
  isNew?: boolean;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentYear = new Date().getFullYear();
const budgetYears = [currentYear, currentYear + 1, currentYear + 2];
const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif' // Set Roboto as the default font
  }
});
const NewDataEntryComponent: React.FC<NewDataEntryComponentProps> = ({ request_number, project_code, onClose }) => {
  const [costCode, setCostCode] = useState<string>('');
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();

 const {
  data: costList,
  isLoading: costLoading,
  error: costError
} = useQuery({
  queryKey: ['cost_data', app],
  queryFn: async () => {
    if (!app) return { tableData: [], count: 0 };

    const response = await PfServiceInstance.proc_build_dynamic_sql({
      parameter: "ddcostmaster",     // 🔹 replaced "division"
      loginid: user?.loginid ?? "",
      code1: user?.company_code ?? "",
      code2: "NULL",
      code3: "NULL",
      code4: "NULL",
      number1: 0,
      number2: 0,
      number3: 0,
      number4: 0,
      date1: null,
      date2: null,
      date3: null,
      date4: null,
    });

    // Ensure response is in correct format
    const tableData = Array.isArray(response)
      ? (response as CostOption[])      // 🔹 replace with your cost type
      : [];

    const count = tableData.length;

    return { tableData, count };
  },
  enabled: !!app
});


  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        console.log('before 1111');
        const response = await GmPfServiceInstance.getBudgetReqCostdetails(request_number, costCode);

        if (Array.isArray(response) && response.length > 0) {
          console.log('Fetched data for cost code selection:', response.length);
          const formattedRows = response.map((budget: any) => ({
            ...budget,
            isNew: true
          }));

          // Set fetched data for later use or display if needed
          setRows(formattedRows);
        } else {
          setRows([]); // Clear rows if no data is found
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
        setRows([]);
      }
    };

    if (costCode) {
      fetchBudgetData();
    }
  }, [costCode, request_number]);

  const handleRowChange = (index: number, field: string, value: string | number) => {
    const updatedRows = [...rows];

    if (!updatedRows[index]) return;

    // Create a copy of the row being modified
    const updatedRow = { ...updatedRows[index], [field]: value };

    // Check for duplicate month and year combinations, but ignore the current row
    if (field === 'month_budget' || field === 'budget_year') {
      const isDuplicate = rows.some(
        (row, rowIndex) =>
          rowIndex !== index && // Ignore the current row
          row.month_budget === updatedRow.month_budget &&
          row.budget_year === updatedRow.budget_year
      );

      if (isDuplicate) {
        alert(`A row with Month: ${months[Number(updatedRow.month_budget) - 1]} and Year: ${updatedRow.budget_year} already exists.`);
        return;
      }
    }

    // Validate requested amount: cannot be 0 or empty
    if (field === 'requested_amt' && (value === '' || Number(value) <= 0)) {
      alert('Requested amount cannot be 0 or empty.');
      return;
    }

    // If all validations pass, update the row
    updatedRows[index] = updatedRow;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    // Check for duplicate entries based on month_budget and budget_year
    const isDuplicate = rows.some((row) => row.month_budget === 1 && row.budget_year === currentYear);

    if (isDuplicate) {
      alert(`A row with Month: January and Year: ${currentYear} already exists.`);
      return;
    }

    // Validate that no existing row has requested_amt as 0 or empty
    const hasInvalidAmount = rows.some((row) => !row.requested_amt || Number(row.requested_amt) <= 0);

    if (hasInvalidAmount) {
      alert('Requested amount cannot be 0 or empty.');
      return;
    }

    // Add new row if all validations pass
    setRows((prevRows) => [
      ...prevRows,
      {
        company_code: user?.company_code ?? '',
        request_number,
        cost_code: costCode,
        project_code,
        month_budget: 1, // Default month
        budget_year: currentYear, // Default year
        requested_amt: 0,
        approved_amt: 0,
        po_amount: 0,
        pr_amount: 0,
        prev_appr_amt: 0
      }
    ]);
  };
  const handleDeleteRow = (index: number) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    for (let row of rows) {
      if (row.month_budget === null || row.budget_year === null || row.requested_amt === null) {
        alert('Please fill out all required fields before saving.');
        return;
      }
    }

    if (!costCode) {
      alert('Please select a cost code.');
      return;
    }

    const saveData: TCostbudget[] = rows.map((row) => ({
      company_code: user?.company_code ?? '',
      request_number,
      cost_code: costCode,
      project_code,
      month_budget: row.month_budget,
      budget_year: row.budget_year.toString(),
      requested_amt: row.requested_amt,
      approved_amt: row.approved_amt,
      po_amount: row.po_amount,
      pr_amount: row.pr_amount,
      prev_appr_amt: row.prev_appr_amt,
      updated_by: user?.loginid ?? ''
    }));

    try {
      const response = await GmPfServiceInstance.updatebudgetcost(saveData);
      if (response) {
        alert('Records saved successfully!');
        onClose();
      } else {
        //  alert('Error saving records');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('An error occurred while saving the data.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Modal
        open={true}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') return;
          onClose();
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            boxShadow: 24,
            p: 4,
            width: '1200px',
            height: '90vh',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
            Budget Allocation for Project Code: <strong>{project_code}</strong>
            <span style={{ marginLeft: '30px', marginRight: '30px' }}>|</span>
            Request Number: <strong>{request_number.replace(/\$/g, '/')}</strong>
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6} sx={{ marginBottom: 2 }}>
              {costLoading ? (
                <CircularProgress />
              ) : costError ? (
                <TextField label="Error loading costs" fullWidth error />
              ) : (
                <Autocomplete
                  id="cost_code"
                  options={costList?.tableData || []}
                  getOptionLabel={(option) => option.cost_name || ''}
                  onChange={(event, value) => setCostCode(value ? value.cost_code : '')}
                  value={costList?.tableData?.find((cost) => cost.cost_code === costCode) || null}
                  renderInput={(params) => <TextField {...params} label="Cost Code" variant="outlined" fullWidth size="small" />}
                  noOptionsText="No options available"
                />
              )}
            </Grid>

            {/* Display Selected Cost Code */}
            <Grid item xs={6}>
              <Typography variant="body1">
                Selected Cost Code: <strong>{costCode || 'None selected'}</strong>
              </Typography>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="none" sx={{ width: '15%' }}>
                    Month
                  </TableCell>
                  <TableCell padding="none" sx={{ width: '15%' }}>
                    Year
                  </TableCell>
                  <TableCell padding="none" sx={{ width: '17%', textAlign: 'right' }}>
                    Requested Amount
                  </TableCell>
                  <TableCell padding="none" sx={{ width: '17%', textAlign: 'right' }}>
                    Approved Amount
                  </TableCell>
                  <TableCell padding="none" sx={{ width: '18%', textAlign: 'right' }}>
                    PO Amount
                  </TableCell>
                  <TableCell padding="none" sx={{ width: '18%', textAlign: 'right' }}>
                    PR Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell padding="none" sx={{ width: '15%' }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={row.month_budget}
                        onChange={(e) => handleRowChange(index, 'month_budget', e.target.value)}
                      >
                        {months.map((month, i) => (
                          <MenuItem key={i} value={i + 1}>
                            {month}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell padding="none" sx={{ width: '15%' }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={row.budget_year}
                        onChange={(e) => handleRowChange(index, 'budget_year', e.target.value)}
                      >
                        {budgetYears.map((year, i) => (
                          <MenuItem key={i} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell padding="none" sx={{ width: '17%', textAlign: 'right' }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={row.requested_amt}
                        onChange={(e) => handleRowChange(index, 'requested_amt', e.target.value)}
                        inputProps={{ style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell padding="none" sx={{ width: '17%', textAlign: 'right' }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={row.approved_amt}
                        onChange={(e) => handleRowChange(index, 'approved_amt', e.target.value)}
                        inputProps={{ style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell padding="none" sx={{ width: '18%', textAlign: 'right' }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={row.po_amount}
                        onChange={(e) => handleRowChange(index, 'po_amount', e.target.value)}
                        inputProps={{ style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell padding="none" sx={{ width: '18%', textAlign: 'right' }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={row.pr_amount}
                        onChange={(e) => handleRowChange(index, 'pr_amount', e.target.value)}
                        inputProps={{ style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ width: '18%', textAlign: 'right' }}>
                      <IconButton color="error" onClick={() => handleDeleteRow(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow sx={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>
                  <TableCell padding="none" colSpan={2} sx={{ fontWeight: 'bold' }}>
                    Total
                  </TableCell>
                  <TableCell padding="none" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    {rows.reduce((sum, row) => sum + Number(row.requested_amt || 0), 0)}
                  </TableCell>
                  <TableCell padding="none" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    {rows.reduce((sum, row) => sum + Number(row.approved_amt || 0), 0)}
                  </TableCell>
                  <TableCell padding="none" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    {rows.reduce((sum, row) => sum + Number(row.po_amount || 0), 0)}
                  </TableCell>
                  <TableCell padding="none" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                    {rows.reduce((sum, row) => sum + Number(row.pr_amount || 0), 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
            {!request_number && (
              <Button variant="contained" onClick={handleAddRow}>
                Add Row
              </Button>
            )}
            <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
              <Button variant="contained" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outlined" onClick={onClose} sx={{ marginLeft: 2 }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default NewDataEntryComponent;
