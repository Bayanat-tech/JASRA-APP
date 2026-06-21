import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Button,
  ButtonGroup
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import GlobalSearch from 'themes/overrides/GlobalSearch';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { PurchaseRecoveryData } from 'pages/Purchasefolder/type/prrecovery-pf-types';
import PfServiceInstance from 'service/service.purhaseflow';
import { dispatch, useSelector } from 'store';
import { IoSendSharp } from 'react-icons/io5';
import { showAlert } from 'store/CustomAlert/alertSlice';
import CustomAlert from 'components/@extended/CustomAlert';

interface Supplier {
  supp_code: string;
  supp_name: string;
}

const fetchPurchaseRecovery = async (type_of_pr: string): Promise<PurchaseRecoveryData[]> => {
  try {
    console.log('Fetching PurchaseRecovery data...');
    const response = await GmPfServiceInstance.fetchPurchaseRecovery(type_of_pr);
    return response as PurchaseRecoveryData[];
  } catch (error) {
    console.error('Error fetching PurchaseRecovery data:', error);
    throw error;
  }
};

// Helper function to parse date from string
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split(' ')[0].split('/');
  const [hours, minutes, seconds] = dateStr.split(' ')[1].split(':');
  return new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
};

const PRRecovery = ({ type_of_pr }: { type_of_pr: string }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: PurchaserequestheaderData, isFetching } = useQuery({
    queryKey: ['Purchaserequestheader_data', type_of_pr],
    queryFn: () => fetchPurchaseRecovery(type_of_pr),
    staleTime: 10000
  });

  const { app } = useSelector((state) => state.menuSelectionSlice);

  const {
    data: employeeList,
    isLoading: employeeLoading,
    error: employeeError
  } = useQuery({
    queryKey: ['employee_data', app],
    queryFn: async () => {
      if (type_of_pr !== 'Charge to Employee') return { tableData: [], count: 0 };
      if (!app) return { tableData: [], count: 0 };
      try {
        console.log('Fetching Employee Master data...');
        const response = await PfServiceInstance.getMasters(app, 'ddemployeemaster');
        return { tableData: response?.tableData || [], count: response?.count || 0 };
      } catch (err) {
        console.error('Error fetching employee data:', err);
        throw err;
      }
    },
    enabled: !!app && type_of_pr === 'Charge to Employee'
  });

  const { data: supplierList } = useQuery<{ tableData: Supplier[]; count: number }>({
    queryKey: ['supplier_data', app],
    queryFn: async (): Promise<{ tableData: Supplier[]; count: number }> => {
      if (type_of_pr !== 'Charge to Supplier') return { tableData: [], count: 0 };
      if (!app) return { tableData: [], count: 0 };
      try {
        console.log('Fetching Supplier Master data...');
        const response = await PfServiceInstance.getMasters(app, 'ddsupplier');
        return {
          tableData: (response?.tableData || []) as Supplier[],
          count: response?.count || 0
        };
      } catch (err) {
        console.error('Error fetching supplier data:', err);
        throw err;
      }
    },
    enabled: !!app && type_of_pr === 'Charge to Supplier'
  });

  const groupedData = PurchaserequestheaderData?.reduce((acc, row) => {
    if (!acc[row.project_name]) {
      acc[row.project_name] = [];
    }
    acc[row.project_name].push(row);
    return acc;
  }, {} as Record<string, PurchaseRecoveryData[]>);

  const handleSubmit = async () => {
    if (!PurchaserequestheaderData || PurchaserequestheaderData.length === 0) {
      dispatch(
        showAlert({
          open: true,
          message: 'No data to update.',
          severity: 'warning' // you can use 'error' if you want
        })
      );
      return;
    }

    const validData = PurchaserequestheaderData.filter((item) => {
      const requestDate = new Date(item.request_date);
      // const recoveryDate = new Date(item.recovery_date);

      return (
        item.request_number &&
        item.recovery_flag &&
        requestDate instanceof Date &&
        !isNaN(requestDate.getTime()) && // Ensure valid date
        item.amount &&
        item.ac_code &&
        item.alternate_id
      );
    });

    if (validData.length === 0) {
      dispatch(
        showAlert({
          open: true,
          message: 'No valid records to update.',
          severity: 'warning'
        })
      );
      return;
    }

    const formattedData = validData.map((item) => ({
      ...item,
      request_date: item.request_date instanceof Date ? item.request_date : parseDate(item.request_date),
      recovery_date: item.recovery_date instanceof Date ? item.recovery_date : parseDate(item.recovery_date),
      ac_name: item.ac_name || '',
      emp_name: item.emp_name || '',
      supplier: item.supplier || '',
      company_code: item.company_code || '',
      history_serial: item.history_serial || '',
      type_of_pr: item.type_of_pr || '',
      project_name: item.project_name || '',
      recovery_remark: item.recovery_remark || '',
      recovery_confirm: item.recovery_confirm || 'No'
    }));

    console.log('Formatted Data to submit:', formattedData);

    try {
      await Promise.all(formattedData.map((item) => GmPfServiceInstance.UpdPurchaseRecoveryData(item)));
      dispatch(
        showAlert({
          open: true,
          message: 'All purchase recovery data updated successfully!',
          severity: 'success'
        })
      );
    } catch (error) {
      dispatch(
        showAlert({
          open: true,
          message: 'Error updating purchase recovery data!',
          severity: 'error'
        })
      );
      console.error('Error updating purchase recovery data:', error);
    }
  };

  useEffect(() => {
    if (PurchaserequestheaderData && PurchaserequestheaderData.length > 0) {
      console.log('Data available:', PurchaserequestheaderData);
    }
  }, [PurchaserequestheaderData]);

  useEffect(() => {
    console.log('Employee API triggered: ', type_of_pr === 'Charge to Employee' && employeeList);
    console.log('Supplier API triggered: ', type_of_pr === 'Charge to Supplier' && supplierList);
  }, [employeeList, supplierList, type_of_pr]);

  return (
    <div>
      <CustomAlert />
      <GlobalSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <TableContainer component={Paper} className="max-h-[500px]">
        <Table className="table-auto w-full">
          <TableHead>
            <TableRow className="h-6 bg-gray-200">
              {['Request Number', 'Request Date', 'Amount', 'Recovery Date', 'Recovery Remark', 'Confirm']
                .concat(type_of_pr !== 'Charge to Employee' && type_of_pr !== 'Charge to Customer' ? ['AC Code'] : [])
                .concat(type_of_pr !== 'Charge to Supplier' && type_of_pr !== 'Charge to Customer' ? ['Alternate ID'] : [])
                .map((header) => (
                  <TableCell key={header} className="px-2 py-1 text-center font-semibold text-xs">
                    {header}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching ? (
              <TableRow className="h-6">
                <TableCell colSpan={9} className="px-2 py-1 text-xs text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groupedData || {}).map(([projectName, rows]) => (
                <React.Fragment key={projectName}>
                  <TableRow className="h-6 bg-blue-100">
                    <TableCell colSpan={9} className="px-2 py-1 font-semibold text-xs">
                      {projectName || 'N/A'}
                    </TableCell>
                  </TableRow>

                  {rows.map((row, index) => (
                    <TableRow key={index} className="h-6">
                      <TableCell className="px-2 py-1 text-xs">{row.request_number}</TableCell>
                      <TableCell className="px-2 py-1 text-xs">
                        {row.request_date instanceof Date ? row.request_date.toLocaleDateString() : row.request_date}
                      </TableCell>
                      <TableCell className="px-2 py-1 text-xs">{row.amount}</TableCell>

                      {type_of_pr === 'Charge to Supplier' && (
                        <TableCell className="px-2 py-1 text-xs">
                          <select className="border rounded px-2 py-1 text-xs">
                            {supplierList?.tableData?.map((supplier: Supplier) => (
                              <option key={supplier.supp_code} value={supplier.supp_code}>
                                {supplier.supp_name}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                      )}

                      {type_of_pr === 'Charge to Employee' && (
                        <TableCell className="px-2 py-1">
                          {employeeLoading ? (
                            <Typography className="text-xs">Loading...</Typography>
                          ) : employeeError ? (
                            <Typography className="text-xs text-red-500">Error loading employees</Typography>
                          ) : (
                            <Select
                              defaultValue={row.alternate_id || ''}
                              fullWidth
                              size="small"
                              sx={{ minHeight: 30, fontSize: '0.75rem', padding: 0 }}
                            >
                              {employeeList?.tableData?.map((employee: any) => (
                                <MenuItem key={employee.alternate_id} value={employee.alternate_id} sx={{ fontSize: '0.75rem' }}>
                                  {employee.rpt_name}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </TableCell>
                      )}

                      <TableCell className="px-2 py-1">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            value={row.recovery_date as any}
                            format="DD/MM/YYYY"
                            onChange={() => {}}
                            slotProps={{
                              textField: {
                                size: 'small',
                                sx: {
                                  maxWidth: '140px',
                                  minHeight: 30,
                                  fontSize: '0.7rem',
                                  padding: 0,
                                  marginRight: 'auto',
                                  '& input': { fontSize: '0.7rem' }
                                }
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <TextField
                          placeholder="Enter remark"
                          fullWidth
                          size="small"
                          sx={{ minHeight: 30, fontSize: '0.75rem', padding: 0 }}
                        />
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <Select
                          defaultValue={row.recovery_confirm || 'No'}
                          fullWidth
                          size="small"
                          sx={{ minHeight: 30, fontSize: '0.75rem', padding: 0 }}
                        >
                          <MenuItem value="Yes" sx={{ fontSize: '0.75rem' }}>
                            Yes
                          </MenuItem>
                          <MenuItem value="No" sx={{ fontSize: '0.75rem' }}>
                            No
                          </MenuItem>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid item xs={12} marginTop={2} display="flex" justifyContent="space-between" alignItems="center">
        <ButtonGroup>
          <Button variant="outlined" color="primary" size="small" endIcon={<IoSendSharp />} onClick={handleSubmit}>
            Submit
          </Button>
        </ButtonGroup>
      </Grid>
    </div>
  );
};

export default PRRecovery;
