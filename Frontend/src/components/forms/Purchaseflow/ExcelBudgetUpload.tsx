import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@mui/material/Modal';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  CircularProgress,
  ButtonGroup,
  Tooltip,
  Divider
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import useAuth from 'hooks/useAuth';
import { debounce } from 'lodash';
import { ImExit } from 'react-icons/im';
import { FaSave } from 'react-icons/fa';
import { openBackdrop } from 'store/reducers/backdropSlice';
import { dispatch } from 'store';
import CustomAlert from 'components/@extended/CustomAlert';
interface ExcelBudgetUploadComponentProps {
  request_number?: string;
  onClose: () => void;
}

interface BudgetRow {
  company_code: string;
  request_number: string;
  cost_code: string;
  month_budget: number;
  budget_year: string;
  requested_amt: number;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentYear = new Date().getFullYear();

const ExcelBudgetUpload: React.FC<ExcelBudgetUploadComponentProps> = ({ request_number = '', onClose }) => {
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await GmPfServiceInstance.getbudgetexcel(request_number);
        if (response?.success && Array.isArray(response.data) && response.data.length > 0) {
          const years = new Set<string>();

          const formattedRows = response.data.map((budget: any) => {
            const budgetYear = budget.budget_year?.toString() || currentYear.toString();
            years.add(budgetYear);

            return {
              company_code: budget.company_code || user?.company_code || '',
              request_number: budget.request_number,
              cost_code: budget.cost_code || '',
              month_budget: parseFloat(budget.month_budget) || 1,
              budget_year: budgetYear,
              requested_amt: parseFloat(budget.requested_amt) || 0
            };
          });

          setRows(formattedRows);
          setAvailableYears(Array.from(years).sort());
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
  }, [request_number, user?.company_code]);

  const handleRowChange = (index: number, field: string, value: string | number) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index] = { ...updatedRows[index], [field]: value };
      return updatedRows;
    });
  };

  const handleDeleteRow = (index: number) => {
    setRows((prevRows) => {
      // Only delete the specific row and don't filter
      const updatedRows = [...prevRows];
      updatedRows.splice(index, 1);
      return updatedRows;
    });
  };

  // Implement debounced search handler to reduce the number of function calls
  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300); // Debouncing for 300ms

  // Filter rows dynamically based on search term
  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) =>
        row.cost_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.budget_year.toString().includes(searchTerm) ||
        row.requested_amt.toString().includes(searchTerm) ||
        months[row.month_budget - 1]?.toLowerCase().includes(searchTerm.toLowerCase()) // Added month search
    );
  }, [searchTerm, rows]);

  const handleSave = async () => {
    setIsSaving(true);
    dispatch(openBackdrop());

    const transformedRows = rows.map((row) => ({
      ...row,
      budget_year: row.budget_year.toString(),
      requested_amt: row.requested_amt.toString()
    }));

    console.log('Saving data:', transformedRows);

    if (onClose) onClose();

    try {
      await GmPfServiceInstance.saveexcelbudgetdata(transformedRows, request_number, (alert) => {
        console.log(alert.message); // Example: Replace with actual alert handling logic
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
          width: '800px',
          maxHeight: '70vh',
          borderRadius: 2,
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
          BUDGET ALLOCATION
          <br />
          Request Number:{' '}
          <Typography component="span" sx={{ fontWeight: 750 }}>
            {request_number.replace(/\$/g, '/')}
          </Typography>
        </Typography>
        <Divider sx={{ marginBottom: '12px', borderBottomWidth: '2px', borderColor: 'black' }} />
        <CustomAlert />
        {/* Search Field */}
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          size="small"
          sx={{ marginBottom: 2 }}
          onChange={(e) => debouncedSearch(e.target.value)} // Using the debounced function
        />

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <strong>Cost Code</strong>
          </Grid>
          <Grid item xs={3}>
            <strong>Month</strong>
          </Grid>
          <Grid item xs={2}>
            <strong>Year</strong>
          </Grid>
          <Grid item xs={3}>
            <strong>Requested Amount</strong>
          </Grid>
          <Grid item xs={1}>
            <strong>Action</strong>
          </Grid>
        </Grid>

        {filteredRows.length > 0 ? (
          filteredRows.map((row, index) => (
            <Grid container spacing={2} key={index} alignItems="center">
              <Grid item xs={3}>
                <TextField fullWidth variant="outlined" value={row.cost_code} disabled size="small" />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
                  <Select value={row.month_budget} disabled size="small">
                    {months.map((month, i) => (
                      <MenuItem key={i} value={i + 1}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <Select value={row.budget_year} disabled size="small">
                    {availableYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="number"
                  value={row.requested_amt}
                  onChange={(e) => handleRowChange(index, 'requested_amt', parseFloat(e.target.value))}
                  size="small"
                />
              </Grid>
              <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton onClick={() => handleDeleteRow(index)} color="error">
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CircularProgress />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            borderTop: '1px solid #eee',
            paddingTop: '16px',
            backgroundColor: 'white'
          }}
        >
          <ButtonGroup>
            <Tooltip title="Save">
              <Button sx={{ backgroundColor: '#082a89', color: 'white' }} color="primary" onClick={handleSave} disabled={isSaving}>
                <FaSave />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup>
            <Tooltip title="Exit">
              <Button size="small" onClick={onClose}>
                <ImExit />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>
      </Box>
    </Modal>
  );
};
export default ExcelBudgetUpload;
