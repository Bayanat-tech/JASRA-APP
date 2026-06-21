import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Autocomplete,
  Chip,
  Button,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import HrRequestServiceInstance, { IHrEmployee } from 'service/services.hr';
import MyAgGrid from 'components/grid/MyAgGrid';
import { ColDef } from 'ag-grid-community';
import dayjs from 'dayjs';
import { InfoIcon } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import { useIntl } from 'react-intl';
// import WmsSerivceInstance from 'service/wms/service.wms';
import HrServiceInstance from 'service/Service.hr';
export interface ILeaveHistory {
  EMPLOYEE_CODE: string;
  EMPLOYEE_NAME: string;
  LEAVE_TYPE: string;
  LEAVE_TYPE_DESC: string;
  LEAVE_START_DATE: string;
  LEAVE_END_DATE: string;
  HDR_LVE_SLNO: number;
  EMP_STATUS : string;
}

export interface ILeaveBalance {
  EMPLOYEE_ID: string;
  LEAVE_TYPE: string;
  LEAVE_TYPE_DESC: string;
  LEAVE_DAYS: number | null;
  MAX_NO_OF_LEAVES: number| null;
  NO_OF_LEAVES_TAKEN: number | null;
  NO_OF_LEAVES_AVAILABLE: number | null;
}

export interface LeaveRecord {
  id: string;
  employee: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: string;
  days: number;
}

export interface LeaveType {
  id: string;
  name: string;
}

interface Props {
  leaveTypes?: LeaveType[];
  leaveData?: LeaveRecord[];
  onView?: (employeeId: string, leaveTypeId: string, fromDate: string, toDate: string) => void;
  isLoading?: boolean;
}

const HrEmployeeRegisterMainPage: React.FC<Props> = ({ leaveTypes = [], leaveData = [], onView = () => {}, isLoading = false }) => {
  const [employee, setEmployee] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [, setGridApi] = useState<any>(null);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 50 });
  const [showGrid, setShowGrid] = useState(false);
  const [allEmployeeLeaveTypes, setAllEmployeeLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<IHrEmployee | null>(null);
  const [showAllLeaves, setShowAllLeaves] = useState(false);
  const { user } = useAuth();

  console.log(user, "user")

  const intl = useIntl();

 const sql_string = `
  SELECT DISTINCT *
  FROM (
    SELECT *
    FROM VW_HR_EMPLOYEE_AWARE
    WHERE EMP_STATUS <> 'S'
    START WITH
      EMPLOYEE_ID = '${user?.loginid1}'
      OR SUPERVISOR_EMPID = '${user?.loginid1}'
      OR DEPT_HEAD_EMPID = '${user?.loginid1}'
      OR MANGR_EMPID = '${user?.loginid1}'
    CONNECT BY NOCYCLE PRIOR EMPLOYEE_ID = SUPERVISOR_EMPID
      OR PRIOR EMPLOYEE_ID = DEPT_HEAD_EMPID
      OR PRIOR EMPLOYEE_ID = MANGR_EMPID
  )
`;

// Fetch all employees
const { data: employees = [], isLoading: employeesLoading } = useQuery<IHrEmployee[], Error>({
  queryKey: ['hr-employees', paginationData, user?.loginid1],
  queryFn: async () => {
    if (!user?.loginid1) {
      throw new Error('User not authenticated');
    }
    try {
      const result = await HrServiceInstance.executeRawSql(sql_string);
      return result as IHrEmployee[];
    } catch (err) {
      console.error('Error fetching employees:', err);
      throw err;
    }
  },
  retry: false
});

  useEffect(() => {
    if (employees && employees.length > 0 && user?.loginid1 && !selectedEmployee) {
      const currentUser = employees.find(emp => 
        emp.EMPLOYEE_ID?.toString() === user.loginid1?.toString()
      );
      
      if (currentUser) {
        console.log('Auto-selecting current user:', currentUser);
        setSelectedEmployee(currentUser);
        setEmployee(currentUser.EMPLOYEE_ID?.toString() || '');
      } else {
        console.log('Current user not found in employees list');
      }
    }
  }, [employees, user?.loginid1, selectedEmployee]);

  useEffect(() => {
    if (employees && employees.length > 0 && user?.loginid1) {
      const currentUser = employees.find(emp => 
        emp.EMPLOYEE_ID?.toString() === user.loginid1?.toString()
      );
      if (currentUser && !selectedEmployee) {
        console.log('Auto-selecting from employees data change:', currentUser);
        setSelectedEmployee(currentUser);
        setEmployee(currentUser.EMPLOYEE_ID?.toString() || '');
      }
    }
  }, [employees]);



const leaveBalanceSql = useMemo(() => {
  if (!employee) return '';
  
  return `
    SELECT EMPLOYEE_ID, LEAVE_TYPE, LEAVE_TYPE_DESC, 
    NVL(NO_OF_LEAVES_AVAILABLE,0) as NO_OF_LEAVES_AVAILABLE
    FROM VW_HR_LEAVE_YEARLY_BAL_SYSDATE_AWARE 
    WHERE EMPLOYEE_ID = '${employee}' 
    AND LEAVE_TYPE NOT IN ('001','008','ABS')
  `;
}, [employee]); 

// Fetch leave balance for selected employee
const { data: leaveBalance = [], isLoading: leaveBalanceLoading } = useQuery<ILeaveBalance[]>({
  queryKey: ['leave-balance', employee, leaveBalanceSql],
  queryFn: async () => {
    if (!employee || !leaveBalanceSql) return [];
    try {
      const result = await HrServiceInstance.executeRawSql(leaveBalanceSql);
      return result as ILeaveBalance[];
    } catch (err) {
      console.error('Error fetching leave balance:', err);
      throw err;
    }
  },
  enabled: !!employee && !!leaveBalanceSql, 
  retry: false
});

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: intl.formatMessage({ id: 'Request Date' }) || 'Request Date',
        field: 'LEAVE_REQUEST_DATE',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type',
        field: 'LEAVE_TYPE_DESC',
        cellStyle: { fontSize: '12px' },
        width: 120,
        minWidth: 150
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Start Date' }) || 'Leave Start Date',
        field: 'LEAVE_START_DATE',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Leave End Date' }) || 'Leave End Date',
        field: 'LEAVE_END_DATE',
        sortable: true,
        filter: true,
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Days' }) || 'Leave Days',
        field: 'LEAVE_DAYS',
        sortable: true,
        filter: true,
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: intl.formatMessage({ id: 'DutyResumeDate' }) || 'DutyResumeDate',
        field: 'DUTY_RESUME_DATE',
        sortable: true,
        filter: true,
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      }
    ],
    []
  );

  // Fetch initial leave history when employee is selected
  const {
    data: initialLeaveHistory = [],
    isLoading: initialLeaveHistoryLoading,
    refetch: refetchInitialLeaveHistory
  } = useQuery<ILeaveHistory[]>({
    queryKey: ['initial-leave-history', employee],
    queryFn: async () => {
      if (!employee) return [];
      try {
        const response = await HrRequestServiceInstance.getLeaveHistory({
          employeeId: employee
        });
        return response as unknown as ILeaveHistory[];
      } catch (err) {
        console.error('Error fetching initial leave history:', err);
        throw err;
      }
    },
    enabled: false,
    retry: false
  });

  // Fetch filtered leave history with all filters
  const {
    data: filteredLeaveHistory = [],
    isLoading: filteredLeaveHistoryLoading,
    refetch: refetchFilteredLeaveHistory
  } = useQuery<ILeaveHistory[]>({
    queryKey: ['filtered-leave-history', employee, leaveType, fromDate, toDate],
    queryFn: async () => {
      if (!employee) return [];
      try {
        const response = await HrRequestServiceInstance.getLeaveHistory({
          employeeId: employee,
          leaveType: leaveType === 'ALL' ? undefined : leaveType || undefined,
          leaveStartDateFrom: fromDate || undefined,
          leaveEndDateTo: toDate || undefined
        });
        return response as unknown as ILeaveHistory[];
      } catch (err) {
        console.error('Error fetching filtered leave history:', err);
        throw err;
      }
    },
    enabled: false,
    retry: false
  });

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  // When employee changes, fetch their initial leave history to get all leave types
  useEffect(() => {
    if (employee) {
      refetchInitialLeaveHistory();
      setLeaveType('');
      setFromDate('');
      setToDate('');
      setShowGrid(false);
    }
  }, [employee, refetchInitialLeaveHistory]);

  // Extract all leave types for the selected employee from initial data
  useEffect(() => {
    if (initialLeaveHistory.length > 0) {
      const uniqueTypes = new Map();
      initialLeaveHistory.forEach((item: ILeaveHistory) => {
        if (!uniqueTypes.has(item.LEAVE_TYPE)) {
          uniqueTypes.set(item.LEAVE_TYPE, {
            id: item.LEAVE_TYPE,
            name: item.LEAVE_TYPE_DESC || item.LEAVE_TYPE
          });
        }
      });
      setAllEmployeeLeaveTypes(Array.from(uniqueTypes.values()));
    } else {
      setAllEmployeeLeaveTypes([]);
    }
  }, [initialLeaveHistory]);

  // Enable View button as soon as any leave type is selected
  const isFormValid = employee && leaveType;

  const handleView = () => {
    if (isFormValid) {
      onView(employee, leaveType, fromDate, toDate);
      setShowGrid(true);
      refetchFilteredLeaveHistory();
    }
  };

  const handleClearFilters = () => {
    setLeaveType('');
    setFromDate('');
    setToDate('');
    setShowGrid(false);
  };

  const handleEmployeeChange = (event: React.SyntheticEvent, newValue: IHrEmployee | null) => {
    setEmployee(newValue?.EMPLOYEE_ID?.toString() || '');
    setSelectedEmployee(newValue);
  };

  // Format balance display
  const formatBalance = (balance: any) => {
    if (balance === undefined || balance === null) {
      return '0.0';
    }

    // Handle empty objects or non-numeric values
    if (typeof balance === 'object' && Object.keys(balance).length === 0) {
      return '0.0';
    }

    if (typeof balance === 'number') {
      return balance.toFixed(1);
    }

    // Try to convert string to number
    const numericBalance = Number(balance);
    if (!isNaN(numericBalance)) {
      return numericBalance.toFixed(1);
    }

    return '0.0';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Main Content Section - Filter Options + Table */}
      <div className="flex-1 order-1 lg:order-none">
        {/* Header */}

        <div className="flex items-center mb-3">
          <CalendarIcon className="mr-2 text-blue-600 text-lg sm:text-xl" />
          <Typography
            variant="h5"
            sx={{
              color: '#082A89',
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            {intl.formatMessage({ id: 'LeaveRequestListing' }) || 'LeaveRequestListing'}
          </Typography>
        </div>

        {/* Filter Section */}
        <div className="bg-slate-100 rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center mb-2">
            <FilterIcon className="mr-1 text-xs text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">{intl.formatMessage({ id: 'FilterOptions' }) || 'FilterOptions'}</h2>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {/* Employee Select */}
            <div className="w-full sm:flex-1">
              <Autocomplete
                options={employees}
                size="small"
                loading={employeesLoading}
                loadingText="Loading employees..."
                getOptionLabel={(option) => option.RPT_NAME || ''}
                isOptionEqualToValue={(option, value) => option.EMPLOYEE_ID?.toString() === value.EMPLOYEE_ID?.toString()}
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                filterOptions={(options, state) => {
                  const inputValue = state.inputValue.toLowerCase();
                  return options?.filter(
                    (option) =>option?.RPT_NAME?.toLowerCase().includes(inputValue) || option?.EMPLOYEE_ID?.toString().includes(inputValue)
                  ) || [];
                }}
                  renderOption={(props, option, { selected }) => {
                  const isCurrentUser = option.EMPLOYEE_ID === user?.loginid1;
                  return (
                    <li
                      {...props}
                      style={{
                        backgroundColor: isCurrentUser ? '#FFFF00' : 'white',
                        fontWeight: isCurrentUser ? '650' : 'normal'
                      }}
                    >
                      {option.RPT_NAME}
                      {isCurrentUser }
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={intl.formatMessage({ id: 'SelectEmployee' }) || 'SelectEmployee'}
                    fullWidth
                    required
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <PersonIcon className="mr-1 text-gray-500 text-sm" />,
                      endAdornment: (
                        <>
                          {employeesLoading && <CircularProgress color="inherit" size={14} />}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </div>

            {/* Leave Type */}
            <div className="w-full sm:flex-1">
              <FormControl fullWidth size="small">
                <InputLabel id="leave-type-label">{intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type'}</InputLabel>
                <Select
                  labelId="leave-type-label"
                  value={leaveType}
                  label={intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type'}
                  onChange={(e) => setLeaveType(e.target.value)}
                  disabled={!employee || initialLeaveHistoryLoading}
                >
                  <MenuItem value="ALL">{intl.formatMessage({ id: 'AllLeaveTypes' }) || 'AllLeaveTypes'}</MenuItem>
                  {allEmployeeLeaveTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* From Date */}
            <div className="w-full sm:w-[150px]">
              <TextField
                label={intl.formatMessage({ id: 'FromDate' }) || 'FromDate'}
                type="date"
                size="small"
                fullWidth
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: toDate }}
                disabled={!employee}
              />
            </div>

            {/* To Date */}
            <div className="w-full sm:w-[150px]">
              <TextField
                label={intl.formatMessage({ id: 'ToDate' }) || 'ToDate'}
                type="date"
                size="small"
                fullWidth
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: fromDate }}
                disabled={!employee}
              />
            </div>

            {/* Buttons - Adjusted height to match fields */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="contained"
                size="small"
                onClick={handleView}
                disabled={!isFormValid || isLoading || filteredLeaveHistoryLoading}
                startIcon={<SearchIcon fontSize="small" />}
                className="flex-1 text-xs h-full"
                sx={{
                  fontSize: '0.895rem',
                  backgroundColor: '#fff',
                  color: '#082A89',
                  border: '1.5px solid #082A89',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#082A89',
                    color: '#fff',
                    border: '1.5px solid #082A89'
                  }
                }}
              >
                {isLoading || filteredLeaveHistoryLoading
                  ? intl.formatMessage({ id: 'Loading...' }) || 'Loading...'
                  : intl.formatMessage({ id: 'Search' }) || 'Search'}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                disabled={!employee}
                startIcon={<ClearIcon fontSize="small" />}
                className="flex-1 text-xs h-full"
                sx={{
                  fontSize: '0.895rem',
                  backgroundColor: '#fff',
                  color: '#082A89',
                  border: '1.5px solid #082A89',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#082A89',
                    color: '#fff',
                    border: '1.5px solid #082A89'
                  }
                }}
              >
                {intl.formatMessage({ id: 'Clear' }) || 'Clear'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showGrid ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-[400px] sm:h-[500px] w-full">
              <MyAgGrid
                height="500px"
                rowHeight={25}
                headerHeight={30}
                rowData={filteredLeaveHistory}
                columnDefs={columnDefs}
                onGridReady={onGridReady}
                onPaginationChanged={onPaginationChanged}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 50, 100, 1000]}
                pagination
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
            <SearchIcon className="text-gray-400 text-3xl sm:text-4xl mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-500 mb-2">
              {intl.formatMessage({ id: 'NoResults' }) || 'NoResults'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">{intl.formatMessage({ id: 'ApplyFilters' }) || 'ApplyFilters'}</p>
          </div>
        )}
      </div>
      {/* Available Balance Section - Updated to show 10 initially with expand option */}
      <div className="order-2 lg:order-none lg:w-56">
        <div className="bg-blue-50 rounded-lg border border-blue-100 p-3 sticky mt-[40px]">
          <div className="flex flex-row justify-between items-center mb-3">
            <div className="flex items-start">
              <BalanceIcon className="mr-2 text-blue-500 text-sm" />
              <h2 className="text-sm font-semibold text-blue-700"> Available Balance as of {dayjs().format('DD/MM/YYYY')}</h2>
            </div>
          </div>

          {leaveBalanceLoading ? (
            <div className="flex justify-center h-20 items-center">
              <CircularProgress size={16} color="primary" />
            </div>
          ) : !employee ? (
            <div className="flex flex-col items-center justify-center h-20 text-center p-2">
              <PersonIcon className="text-blue-300 text-lg mb-1" />
              <p className="text-xs text-blue-600">
                {intl.formatMessage({ id: 'SelectEmployeeToViewBalance' }) || 'SelectEmployeeToViewBalance'}
              </p>
            </div>
          ) : leaveBalance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-center p-2">
              <InfoIcon className="text-blue-300 text-lg mb-1" />
              <p className="text-xs text-blue-600">{intl.formatMessage({ id: 'NoBalanceData' }) || 'NoBalanceData'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Show all leave types if showAllLeaves is true, otherwise show first 10 */}
              {(showAllLeaves ? leaveBalance : leaveBalance.slice(0, 10)).filter(balance => balance && balance.LEAVE_TYPE).map((balance) => {
                const balanceValue =
                  balance?.NO_OF_LEAVES_AVAILABLE != null ? Number(balance.NO_OF_LEAVES_AVAILABLE) : 0;

                const isPositive = balanceValue > 0;

                return (
                  <div
                    key={balance.LEAVE_TYPE}
                    className="flex justify-between items-center p-2 bg-white rounded-md border border-blue-100 shadow-sm"
                  >
                    <span className="text-xs font-medium text-gray-700 truncate">{balance.LEAVE_TYPE_DESC || balance.LEAVE_TYPE}</span>
                    <Chip
                      label={formatBalance(balanceValue)}
                      size="small"
                      color={isPositive ? 'success' : 'error'}
                      variant={isPositive ? 'filled' : 'outlined'}
                      className="text-xs font-semibold min-w-[40px] justify-center"
                      sx={{
                        backgroundColor: isPositive ? '#f0f9ff' : '#fef2f2',
                        color: isPositive ? '#0c4a6e' : '#991b1b',
                        borderColor: isPositive ? '#bae6fd' : '#fecaca'
                      }}
                    />
                  </div>
                );
              })}

              {/* Show "more" button if there are more than 10 leave types */}
              {leaveBalance.length > 10 && (
                <div className="text-center pt-1">
                  <button
                    onClick={() => setShowAllLeaves(!showAllLeaves)}
                    className="text-xs text-blue-500 font-medium bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    {showAllLeaves ? 'Show less' : `+${leaveBalance.length - 10} more`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrEmployeeRegisterMainPage;
