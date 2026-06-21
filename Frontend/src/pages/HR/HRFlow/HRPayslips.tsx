// HRPayslips.tsx - Updated to allow current and previous year
import { Typography, Box, Autocomplete, TextField, CircularProgress } from '@mui/material';
import useAuth from 'hooks/useAuth';
import React from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HrServiceInstance from 'service/Service.hr';

// Interface for employee data based on the response
interface IHrEmployee {
  EMPLOYEE_ID: string;
  EMPLOYEE_CODE: string;
  RPT_NAME: string;
  SUPERVISOR_EMPID?: string;
  DEPT_HEAD_EMPID?: string;
  MANGR_EMPID?: string;
}

export default function HRPayslips() {
  const { user } = useAuth();
  const intl = useIntl();
  const navigate = useNavigate();
  const [month, setMonth] = React.useState('');
  const [year, setYear] = React.useState('');
  const [selectedEmployee, setSelectedEmployee] = React.useState<IHrEmployee | null>(null);
  const [allEmployees, setAllEmployees] = React.useState<IHrEmployee[]>([]);

  // Get current year, previous year, and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Calculate min and max dates for the input
  const minDate = `${previousYear}-01`;
  const maxDate = `${currentYear}-${currentMonth}`;

  // Fetch supervisor employees data using direct SQL query
  const { data: currentSupervisorEmployeeData, isLoading: isLoadingEmployees } = useQuery<IHrEmployee[]>({
    queryKey: ['currentSupervisorEmployeeData', user?.loginid1],
    queryFn: async (): Promise<IHrEmployee[]> => {
      if (!user?.loginid1) {
        console.log(' No user login ID found');
        return [];
      }
      
      console.log('🔄 Fetching supervisor employees for user:', user.loginid1);
      
      try {
        // Use direct SQL query to get employees under this supervisor
        const sql = `
            SELECT DISTINCT *
            FROM (
                SELECT *
                FROM VW_HR_EMPLOYEE_AWARE
                WHERE EMP_STATUS <> 'S'
                START WITH 
                    EMPLOYEE_ID = '${user.loginid1}'
                    OR SUPERVISOR_EMPID = '${user.loginid1}'
                    OR DEPT_HEAD_EMPID = '${user.loginid1}'
                    OR MANGR_EMPID = '${user.loginid1}'
                CONNECT BY NOCYCLE PRIOR EMPLOYEE_ID = SUPERVISOR_EMPID
                    OR PRIOR EMPLOYEE_ID = DEPT_HEAD_EMPID
                    OR PRIOR EMPLOYEE_ID = MANGR_EMPID
            )
        `;
        
        console.log('Executing supervisor SQL:', sql);
        const result = await HrServiceInstance.executeRawSql(sql);
        console.log('Supervisor employees SQL response:', result);
        
        if (Array.isArray(result)) {
          console.log(`Found ${result.length} employees under supervisor`);
          return result as IHrEmployee[];
        }
        
        console.log(' No employees found or invalid response');
        return [];
        
      } catch (err) {
        console.error('Error fetching supervisor employees:', err);
        return [];
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  // Debug the current user data
  const { data: currentUserData } = useQuery({
    queryKey: ['currentUserData', user?.loginid1],
    queryFn: async () => {
      if (!user?.loginid1) return null;
      
      try {
        const sql = `
          SELECT EMPLOYEE_ID, EMPLOYEE_CODE, RPT_NAME, SUPERVISOR_EMPID, DEPT_HEAD_EMPID, MANGR_EMPID 
          FROM VW_HR_EMPLOYEE_AWARE 
          WHERE EMPLOYEE_ID = '${user.loginid1}'
        `;
        
        console.log('Fetching current user data with SQL:', sql);
        const result = await HrServiceInstance.executeRawSql(sql);
        console.log('Current user database response:', result);
        
        return result?.[0] || null;
      } catch (error) {
        console.error('Error fetching current user data:', error);
        return null;
      }
    },
    enabled: !!user?.loginid1
  });

  // Combine current user with supervisor employees for dropdown
  React.useEffect(() => {
    if (user?.loginid1) {
      console.log('Current user ID:', user.loginid1);
      console.log(' Supervisor employee data:', currentSupervisorEmployeeData);
      console.log(' Current user full data:', currentUserData);
      
      // Create current user object
      const currentUserEmployee: IHrEmployee = {
        EMPLOYEE_ID: user.loginid1,
        EMPLOYEE_CODE: user.loginid1,
        RPT_NAME: currentUserData?.RPT_NAME || 'Current User'
      };

      // Check if user is supervisor (has employees under them)
      const isSupervisor = currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0;
      console.log('Is supervisor:', isSupervisor);
      console.log('Supervisor data length:', currentSupervisorEmployeeData?.length);

      if (isSupervisor) {
        // User is supervisor - include self + team members (remove duplicates)
        const otherEmployees = currentSupervisorEmployeeData.filter(
          emp => emp.EMPLOYEE_ID !== user.loginid1
        );
        const combinedEmployees = [currentUserEmployee, ...otherEmployees];
        console.log('👥 Combined employees list (no duplicates):', combinedEmployees);
        setAllEmployees(combinedEmployees);
        setSelectedEmployee(currentUserEmployee);
      } else {
        // User is not supervisor - only show self
        console.log('Regular employee - only showing self');
        setAllEmployees([currentUserEmployee]);
        setSelectedEmployee(currentUserEmployee);
      }
    }
  }, [currentSupervisorEmployeeData, user, currentUserData]);

  // Check if user is a supervisor (has employees under them)
  const isSupervisor = Boolean(currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployee || !month || !year) {
      alert('Please select month and year' + (isSupervisor ? ' and employee' : ''));
      return;
    }

    const selectedYear = parseInt(year);
    
    // Validate if selected year is within allowed range
    if (selectedYear !== currentYear && selectedYear !== previousYear) {
      alert(`You can only view payslips for the current year (${currentYear}) and previous year (${previousYear})`);
      return;
    }
    
    // Validate that selected date is not in the future
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      alert('You cannot view payslips for future months');
      return;
    }

    // Navigate to payslip page with parameters
    navigate(`/hr/Activity/Request/employee_payslip_view/${selectedEmployee.EMPLOYEE_ID}/${month}/${year}`);
  };

  // Handle month input change
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const [selectedYear, selectedMonth] = value.split('-');
      const yearNum = parseInt(selectedYear);
      
      // Validate if selected year is within allowed range
      if (yearNum !== currentYear && yearNum !== previousYear) {
        alert(`You can only select months from ${previousYear} and ${currentYear}`);
        setMonth('');
        setYear('');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate that selected date is not in the future
      const selectedDate = new Date(yearNum, parseInt(selectedMonth) - 1);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        alert('You cannot select future months');
        setMonth('');
        setYear('');
        e.target.value = '';
        return;
      }
      
      setMonth(selectedMonth);
      setYear(selectedYear);
    } else {
      setMonth('');
      setYear('');
    }
  };

  // Handle employee selection change
  const handleEmployeeChange = (event: any, newValue: IHrEmployee | null) => {
    setSelectedEmployee(newValue);
  };

  // Show loading while checking supervisor status
  if (isLoadingEmployees) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <Typography variant="h6" sx={{ color: '#082A89', mb: 2 }}>
          Checking your access permissions...
        </Typography>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-4 pt-10">
      <Typography
        variant="h5"
        sx={{
          color: '#082A89',
          fontWeight: 600,
          fontSize: '1.5rem',
          textAlign: 'center',
          mb: 2
        }}
      >
        {intl.formatMessage({ id: 'HRPaySlips' }) || 'HR Pay Slips'}
      </Typography>


      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 mt-4">
        {/* Employee Selection - Always show dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {isSupervisor ? 'Select Employee' : 'Employee'}
          </label>
          <Autocomplete
            id="employee-select"
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            options={allEmployees}
            loading={isLoadingEmployees}
            getOptionLabel={(option: IHrEmployee) => 
              option ? `${option.EMPLOYEE_ID} - ${option.RPT_NAME}` : ''
            }
            isOptionEqualToValue={(option, value) => 
              option.EMPLOYEE_ID === value?.EMPLOYEE_ID
            }
            renderOption={(props, option, { selected }) => {
              const isCurrentUser = option.EMPLOYEE_ID === user?.loginid1;
              return (
                <li 
                  {...props} 
                  style={{ 
                    backgroundColor: isCurrentUser ? '#FFFF00' : 'white',
                  }}
                >
                  {option.EMPLOYEE_ID} - {option.RPT_NAME}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isSupervisor ? "Choose yourself or a team member" : "Your Employee ID"}
                margin="dense"
                required
                InputLabelProps={{ shrink: true }}
                placeholder="Select an employee"
              />
            )}
          />
        </div>

        {/* Month and Year Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 text-center">
            Select Pay Period   
          </label>
          <div className="flex justify-center">
            <input
              type="month"
              value={month && year ? `${year}-${month}` : ''}
              onChange={handleMonthChange}
              className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center w-48"
              min={minDate}
              max={maxDate}
              required
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            Available: {previousYear} January to {currentYear} {new Date().toLocaleString('default', { month: 'long' })}
          </div>
        </div>

        {/* Selected Period and Employee Display */}
        {(month && year) && (
          <div className="border border-green-200 bg-green-50 rounded p-2 text-center">
            <div className="text-sm font-semibold text-green-800">
              Selected Period: {new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            {selectedEmployee && (
              <div className="text-sm text-green-700 mt-1">
                Selected Employee: {selectedEmployee.EMPLOYEE_ID} - {selectedEmployee.RPT_NAME}
              </div>
            )}
          </div>
        )}
        
        {/* View Button */}
        <Box sx={{ mt: 2 }}>
          <button 
            type="submit" 
            className="w-full py-2 rounded bg-blue-500 text-white font-medium hover:bg-blue-600 transition shadow disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!month || !year || !selectedEmployee}
          >
            {isSupervisor ? 'View Selected Payslip' : 'View My Payslip'}
          </button>
        </Box>
      </form>
    </div>
  );
}