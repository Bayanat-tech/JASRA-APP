import React, { useState, useEffect } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { FaSave } from 'react-icons/fa';

import {
  Box,
  Tooltip,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  ButtonGroup
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { TCostbudget } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import { useSelector } from 'store';
import PfServiceInstance from 'service/service.purhaseflow';
import useAuth from 'hooks/useAuth';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'store'; // adjust this path based on your folder structure
import { showAlert } from 'store/CustomAlert/alertSlice'; // adjust path as needed
//import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
//import { useHandleAlert } from 'store/CustomAlert/messagebox';

interface NewDataEntryComponentProps {
  request_number: string;
  project_code: string;
  onClose: () => void;
  itemData?: any[]; // ✅ Changed to any[] to accept detailed budget data
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
  month_budget: number;
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

const NewDataEntryComponent: React.FC<NewDataEntryComponentProps> = ({ 
  request_number, 
  project_code, 
  onClose,
  itemData // ✅ Accept itemData prop
}) => {
  const [costCode] = useState<string>('');
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  // const [alertMessage, setAlertMessage] = useState('');
  // const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const dispatch = useDispatch();
  const handleAlert = async () => {
    let popupMessage: string | null = null;
    let severity: 'success' | 'info' | 'warning' | 'error' = 'success'; // Default

    try {
      if (!user?.loginid || !user?.company_code) {
        console.error('User information is incomplete. Cannot fetch message box.');
        return;
      }
      const messageBoxData = await GmPfServiceInstance.Fetchmessagebox(user.loginid, user.company_code);
      console.log('messagebox', messageBoxData);

      if (messageBoxData && messageBoxData.length > 0) {
        const box = messageBoxData[0] as any;
        popupMessage = box.MESSAGE_BOX ?? 'Records saved successfully!';
        severity = (box.MESSAGE_TYPE?.toLowerCase() as typeof severity) ?? 'success';
      } else {
        popupMessage = 'Contact Help desk for checking Message!';
      }

      console.log('popupMessage', popupMessage);
      console.log('severity', severity);

      dispatch(
        showAlert({
          severity,
          message: popupMessage ?? '',
          open: true
        })
      );
    } catch (error) {
      console.error('Error fetching alert message:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while fetching the alert message.',
          open: false
        })
      );
    }
  };

  const {
  data: costList,
  //isLoading: costLoading,
  //error: costError
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


  const { data: userLevel } = useQuery({
    queryKey: ['user_level', user?.loginid, user?.company_code],
    queryFn: async () => {
      if (!user?.loginid || !user?.company_code) return null;
      const level = await GmPfServiceInstance.fetchUserlevel(user?.loginid ?? '', user?.company_code ?? '', '003');
      console.log('levelUnique', level);
      return level;
    },
    enabled: !!user?.loginid && !!user?.company_code
  });

  // ✅ Update useEffect to properly map Titembudgetrequest to BudgetRow
  useEffect(() => {
    const fetchBudgetData = async () => {
      console.log('🔍 BudgetAllocation - itemData received:', JSON.stringify(itemData, null, 2));
      console.log('🔍 BudgetAllocation - itemData length:', itemData?.length);
      
      if (itemData && itemData.length > 0) {
        console.log('📦 Using itemData from prop');
        console.log('📦 First item structure:', itemData[0]);
        console.log('📦 Keys in first item:', Object.keys(itemData[0]));
        
        const formattedRows: BudgetRow[] = itemData.map((item: any, index: number) => {
          console.log(`📦 Processing row ${index}:`, item);
          
          const row = {
            company_code: item.company_code || item.companyCode || user?.company_code || '',
            request_number: item.request_number || item.requestNumber || request_number,
            cost_code: item.cost_code || item.costCode || '',
            project_code: item.project_code || item.projectCode || project_code,
            month_budget: Number(item.month_budget || item.monthBudget || item.MONTH_BUDGET) || 0,
            budget_year: Number(item.budget_year || item.budgetYear || item.BUDGET_YEAR) || 0,
            requested_amt: Number(item.requested_amt || item.request_amt || item.requestAmt || item.REQUEST_AMT) || 0,
            approved_amt: Number(item.approved_amt || item.req_appr_amt || item.reqApprAmt || item.REQ_APPR_AMT) || 0,
            po_amount: Number(item.po_amount || item.poAmount || item.PO_AMOUNT) || 0,
            pr_amount: Number(item.pr_amount || item.prAmount || item.PR_AMOUNT) || 0,
            prev_appr_amt: Number(item.prev_appr_amt || item.prevApprAmt || item.PREV_APPR_AMT) || 0,
            isNew: false
          };
          
          console.log(`✅ Formatted row ${index}:`, row);
          return row;
        });
        
        console.log('✅ All formatted rows:', formattedRows);
        setRows(formattedRows);
        return;
      }

      // ✅ Fallback: fetch from API if no prop data
      try {
        console.log('🔍 Fetching from API (no prop data)');
        const response = await GmPfServiceInstance.getBudgetReqCostdetails(request_number, costCode);
        console.log('response', response);
        if (Array.isArray(response) && response.length > 0) {
          console.log('Fetched data for cost code selection:', response.length);
          const formattedRows = response.map((budget: any) => ({
            ...budget,
            isNew: true
          }));
          setRows(formattedRows);
        } else {
          setRows([]);
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
        setRows([]);
      }
    };

    if (request_number) {
      fetchBudgetData();
    }
  }, [costCode, request_number, itemData, project_code, user?.company_code]);

  const handleRowChange = (index: number, field: string, value: string | number) => {
    const updatedRows = [...rows];

    if (!updatedRows[index]) return;

    const updatedRow = { ...updatedRows[index], [field]: value };

    // Check for duplicate month and year combinations, but ignore the current row
    if (field === 'month_budget' || field === 'budget_year' || field === 'cost_code') {
      const isDuplicate = rows.some(
        (row, rowIndex) =>
          rowIndex !== index &&
          row.month_budget === updatedRow.month_budget &&
          row.budget_year === updatedRow.budget_year &&
          row.cost_code === updatedRow.cost_code
      );

      if (isDuplicate) {
        dispatch(
          showAlert({
            severity: 'error',
            message: `A row with Month: ${months[Number(updatedRow.month_budget) - 1]}, Year: ${updatedRow.budget_year}, and Cost Code: ${
              updatedRow.cost_code
            } already exists.`,
            open: true
          })
        );

        return;
      }

      // ❌ Prevent past month-year combinations
      if (updatedRow.month_budget && updatedRow.budget_year) {
        const selectedMonth = Number(updatedRow.month_budget); // 1–12
        const selectedYear = Number(updatedRow.budget_year);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // getMonth returns 0–11
        const currentYear = currentDate.getFullYear();

        if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
          dispatch(
            showAlert({
              severity: 'error',
              message: `You cannot select a past month-year combination: ${months[selectedMonth - 1]} ${selectedYear}.`,
              open: true
            })
          );

          return;
        }
      }
    }

    // Validate requested amount: cannot be 0 or empty
    if (field === 'requested_amt' && (value === '' || Number(value) <= 0)) {
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Requested amount cannot be 0 or empty.',
          open: true
        })
      );

      return;
    }

    updatedRows[index] = updatedRow;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    // Check for duplicate entries based on month_budget and budget_year
    const isDuplicate = rows.some((row) => row.month_budget === 1 && row.budget_year === currentYear);

    if (isDuplicate) {
      dispatch(
        showAlert({
          severity: 'error',
          message: `A row with Month: January and Year: ${currentYear} already exists.`,
          open: true
        })
      );
      return;
    }

    // Validate that no existing row has requested_amt as 0 or empty
    const hasInvalidAmount = rows.some((row) => !row.requested_amt || Number(row.requested_amt) <= 0);

    if (hasInvalidAmount) {
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Requested amount cannot be 0 or empty.',
          open: true
        })
      );

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
        month_budget: 0,
        budget_year: 0,
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
    // Validate that all required fields are filled
    for (let row of rows) {
      if (!row.month_budget || !row.budget_year || !row.requested_amt) {
        dispatch(
          showAlert({
            severity: 'error',
            message: 'Please fill out all required fields before saving.',
            open: true
          })
        );
        return;
      }

      // ✅ Only validate approved_amt when userLevel >= 2
      if (userLevel >= 2 && (!row.approved_amt || Number(row.approved_amt) <= 0)) {
        dispatch(
          showAlert({
            severity: 'error',
            message: 'Approved amount must be greater than zero for all rows.',
            open: true
          })
        );
        return;
      }
    }

    // Prepare data for saving
    const saveData: TCostbudget[] = rows.map((row) => ({
      company_code: user?.company_code ?? '',
      request_number,
      cost_code: row.cost_code,
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
      await GmPfServiceInstance.updatebudgetcost(saveData);
      await handleAlert(); // ✅ this calls the actual alert function
    } catch (error) {
      console.error('Error while saving budget:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Failed to save budget. Please try again.',
          open: true
        })
      );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1200px',
        height: '100vh',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      {/* {alertMessage && (
          <Box sx={{ mb: 2 }}>
            <ReusableAlert message={alertMessage} severity={alertSeverity} onClose={() => setAlertMessage('')} />
          </Box>
        )} */}

      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
        Budget Allocation for Project Code: <strong>{project_code}</strong>
      </Typography>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ minHeight: '30px' }}>
              {['Cost Code', 'Cost Name', 'Month', 'Year', 'Requested Amount', 'Approved Amount', ''].map((header, i) => (
                <TableCell key={i} padding="none" sx={{ fontSize: '0.75rem', py: 0 }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} sx={{ minHeight: '30px' }}>
                <TableCell padding="none" sx={{ py: 0 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={row.cost_code || ''}
                    onChange={(e) => handleRowChange(index, 'cost_code', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem' } }}
                  >
                    {costList?.tableData?.map((cost) => (
                      <MenuItem key={cost.cost_code} value={cost.cost_code} sx={{ fontSize: '0.75rem' }}>
                        {cost.cost_code}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell padding="none" sx={{ py: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={costList?.tableData?.find((cost) => cost.cost_code === row.cost_code)?.cost_name || ''}
                    InputProps={{ readOnly: true, style: { fontSize: '0.75rem' } }}
                  />
                </TableCell>

                <TableCell padding="none" sx={{ py: 0 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={row.month_budget}
                    onChange={(e) => handleRowChange(index, 'month_budget', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem' } }}
                  >
                    {months.map((month, i) => (
                      <MenuItem key={i} value={i + 1} sx={{ fontSize: '0.75rem' }}>
                        {month}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell padding="none" sx={{ py: 0 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={row.budget_year}
                    onChange={(e) => handleRowChange(index, 'budget_year', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem' } }}
                  >
                    {budgetYears.map((year, i) => (
                      <MenuItem key={i} value={year} sx={{ fontSize: '0.75rem' }}>
                        {year}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell padding="none" sx={{ textAlign: 'right', py: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={row.requested_amt}
                    onChange={(e) => handleRowChange(index, 'requested_amt', e.target.value)}
                    inputProps={{ style: { textAlign: 'right', fontSize: '0.75rem' } }}
                    disabled={userLevel > 1} // Disable when flow_level_running > 1
                  />
                </TableCell>

                <TableCell padding="none" sx={{ textAlign: 'right', py: 0 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={row.approved_amt}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value !== 0) {
                        handleRowChange(index, 'approved_amt', value);
                      }
                    }}
                    inputProps={{
                      min: 1,
                      style: {
                        textAlign: 'right',
                        fontSize: '0.75rem'
                      }
                    }}
                    error={userLevel >= 2 && Number(row.approved_amt) === 0}
                    helperText={userLevel >= 2 && Number(row.approved_amt) === 0 ? 'Amount cannot be zero' : ''}
                    disabled={userLevel <= 1}
                  />
                </TableCell>

                <TableCell sx={{ textAlign: 'right', py: 0 }}>
                  <IconButton color="error" onClick={() => handleDeleteRow(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow sx={{ minHeight: '30px' }}>
              <TableCell padding="none" colSpan={4} />
              <TableCell padding="none" sx={{ textAlign: 'right', fontWeight: 'bold', py: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={rows.reduce((sum, row) => sum + Number(row.requested_amt || 0), 0)}
                  inputProps={{ style: { textAlign: 'right', fontWeight: 'bold', fontSize: '0.75rem' }, readOnly: true }}
                />
              </TableCell>
              <TableCell padding="none" sx={{ textAlign: 'right', fontWeight: 'bold', py: 0 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={rows.reduce((sum, row) => sum + Number(row.approved_amt || 0), 0)}
                  inputProps={{ style: { textAlign: 'right', fontWeight: 'bold', fontSize: '0.75rem' }, readOnly: true }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
        <ButtonGroup>
          {request_number && (
            <Button size="small" variant="contained" onClick={handleAddRow} sx={{ backgroundColor: '#082a89' }} endIcon={<AddIcon />}>
              Add Row
            </Button>
          )}
          <Tooltip title="Save">
            <Button
              size="small"
              color="primary"
              sx={{ backgroundColor: '#082a89' }}
              endIcon={<FaSave />}
              variant="contained"
              onClick={handleSave}
            >
              Save
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default NewDataEntryComponent;
