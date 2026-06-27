import { Chart, registerables } from 'chart.js';
import { Chart as ReactChart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import HrServiceInstance from 'service/Service.hr';
import { ColDef } from 'ag-grid-community';
import MyAgGrid from 'components/grid/MyAgGrid';
import dayjs from 'dayjs';
import {
  Modal,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ISearch } from 'components/filters/SearchFilter';

// Register all Chart.js components
Chart.register(...registerables);
Chart.register(ChartDataLabels);

// Interface for pie chart data
interface IPieChartData {
  LEAVE_TYPE_DESC: string;
  TOTAL_LEAVES_TAKEN: number;
  EMPLOYEE_COUNT: number;
}

// Interface for leave request data
interface ILeaveRequest {
  REQUEST_NUMBER: string;
  LEAVE_TYPE: string;
  LEAVE_TYPE_DESC: string;
  LEAVE_START_DATE: string;
  LEAVE_END_DATE: string;
  LEAVE_DAYS: number;
  LAST_ACTION: string;
  FINAL_APPROVED: string;
  REQUEST_DATE: string;
  LEAVE_REASON: string;
  EMPLOYEE_NAME: string;
  EMPLOYEE_CODE?: string;
}

// Interface for modal leave data
interface IModalLeaveData {
  REQUEST_NUMBER: string;
  REQUEST_DATE: string;
  EMPLOYEE_NAME_DISPLAY: string;
  LEAVE_TYPE_DESC: string;
  LEAVE_START_DATE: string;
  LEAVE_END_DATE: string;
  REMARKS: string;
  NEXT_ACTION_BY_NAME: string;
  LEAVE_DAYS?: number;
  LAST_ACTION?: string;
  FINAL_APPROVED?: string;
  EMPLOYEE_CODE?: string;
}

// Interface for API response
interface IApiResponse {
  tableData: any[];
  count: number;
}

// Dashboard view interface
interface IDashboardView {
  isApproverView: boolean;
  userIsApprover: boolean;
}

// Default filter data
const defaultFilterData: ISearch = {
  sort: { field_name: 'REQUEST_DATE', desc: true },
  search: [[]]
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [dashboardView, setDashboardView] = useState<IDashboardView>({
    isApproverView: false,
    userIsApprover: false
  });
 
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<IModalLeaveData[]>([]);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Chart modal states
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartModalTitle, setChartModalTitle] = useState('');
  const [selectedChartType, setSelectedChartType] = useState<'leavesByType' | 'monthlyTrend' | 'employeeDistribution' | ''>('');

  // Month selector state for Employee Distribution
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  
  // Data loading state - only tracks if essential data is loading
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // State for API calls
  const [paginationData] = useState({ page: 0, rowsPerPage: 100 });
  const [filterData] = useState<ISearch>(defaultFilterData);

  // Color scheme
  const COLOR_SCHEME = {
    primary: '#4F46E5',    // Indigo
    secondary: '#10B981',  // Emerald
    tertiary: '#F59E0B',   // Amber
    quaternary: '#EF4444', // Red
    background: '#F8FAFC', // Light slate
    cardBg: '#FFFFFF',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    chartColors: [
      '#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', 
      '#3B82F6', '#8B5CF6', '#F97316', '#14B8A6', '#EF4444'
    ]
  };

  // Fetch subordinate IDs
  const { 
    data: subordinateIds
  } = useQuery<string[]>({
    queryKey: ['subordinateIds', user?.loginid1],
    queryFn: async (): Promise<string[]> => {
      if (!user?.loginid1) return [];

      try {
        const sql = `
          SELECT DISTINCT EMPLOYEE_ID
          FROM (
            SELECT *
            FROM VW_HR_EMPLOYEE 
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
        
        const result = await HrServiceInstance.executeRawSql(sql);
        
        if (Array.isArray(result)) {
          const ids = result.map((row: any) => row.EMPLOYEE_ID);
          return ids;
        }
        
        return [];
      } catch (err) {
        console.error('Error fetching subordinate IDs:', err);
        return [];
      }
    },
    enabled: !!user?.loginid1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Check if user is an approver (has subordinates)
  useEffect(() => {
    if (subordinateIds && user?.loginid1) {
      const hasSubordinates = subordinateIds.length > 0 && subordinateIds.some((id: string) => id !== user.loginid1);
      setDashboardView(prev => ({
        ...prev,
        userIsApprover: hasSubordinates
      }));
    }
  }, [subordinateIds, user?.loginid1]);

  // Toggle handler - only allow toggle if user is approver
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (dashboardView.userIsApprover) {
      setDashboardView(prev => ({
        ...prev,
        isApproverView: event.target.checked
      }));
    }
  };

  // Fetch in-progress leaves
  const { 
    data: inProgressData,
    isLoading: loadingInProgress
  } = useQuery({
    queryKey: ['dashboardInProgressLeaves', user?.loginid1, dashboardView.isApproverView],
    queryFn: async (): Promise<IApiResponse> => {
      if (!user?.loginid) return { tableData: [], count: 0 };
      
      try {
        const response = await HrServiceInstance.getMasters('hr', 'Pg_leave_flow_InProgress', paginationData, filterData, user?.loginid1);
        
        // Filter data based on view mode
        let filteredData = response?.tableData || [];
       
        if (!dashboardView.isApproverView) {
          // Employee View: Filter to show only current user's leaves
          filteredData = (filteredData as IModalLeaveData[]).filter(
            (item: IModalLeaveData) => item.EMPLOYEE_CODE === user.loginid1
          );
        }
        
        return { tableData: filteredData, count: filteredData.length };
      } catch (err) {
        console.error('Error fetching in-progress leaves:', err);
        return { tableData: [], count: 0 };
      }
    },
    enabled: !!user?.loginid,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2
  });

  // Fetch approved leaves
  const { 
    data: approvedData,
    isLoading: loadingApproved
  } = useQuery({
    queryKey: ['dashboardApprovedLeaves', user?.loginid1, dashboardView.isApproverView],
    queryFn: async (): Promise<IApiResponse> => {
      if (!user?.loginid) return { tableData: [], count: 0 };
      
      try {
        const response = await HrServiceInstance.getMasters('hr', 'Pg_leave_flow_close', paginationData, filterData, user?.loginid1);
        
        // Filter data based on view mode
        let filteredData = response?.tableData || [];        
        if (!dashboardView.isApproverView) {
          // Employee View: Filter to show only current user's leaves
          filteredData = (filteredData as IModalLeaveData[]).filter(
            (item: IModalLeaveData) => item.EMPLOYEE_CODE === user.loginid1
          );
          
        }
        
        return { tableData: filteredData, count: filteredData.length  };
      } catch (err) {
        console.error('Error fetching approved leaves:', err);
        return { tableData: [], count: 0 };
      }
    },
    enabled: !!user?.loginid,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2
  });

  // Fetch rejected leaves
  const { 
    data: rejectedData,
    isLoading: loadingRejected
  } = useQuery({
    queryKey: ['dashboardRejectedLeaves', user?.loginid, dashboardView.isApproverView],
    queryFn: async (): Promise<IApiResponse> => {
      if (!user?.loginid) return { tableData: [], count: 0 };
      
      try {
        const response = await HrServiceInstance.getMasters('hr', 'Pg_leave_flow_Rejected', paginationData, filterData, user?.loginid1);
        
        // Filter data based on view mode
        let filteredData = response?.tableData || [];
        
        if (!dashboardView.isApproverView) {
          // Employee View: Filter to show only current user's leaves
          filteredData = (filteredData as IModalLeaveData[]).filter(
            (item: IModalLeaveData) => item.EMPLOYEE_CODE === user.loginid1
          );
        }
        
        return { tableData: filteredData, count: filteredData.length };
      } catch (err) {
        console.error('Error fetching rejected leaves:', err);
        return { tableData: [], count: 0 };
      }
    },
    enabled: !!user?.loginid,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2
  });

  // Fetch ALL leave requests
  const { 
    data: allLeaveRequests,
    isLoading: loadingAllLeaves
  } = useQuery({
    queryKey: ['Pg_Leave_flow', user?.loginid1, dashboardView.isApproverView],
    queryFn: async (): Promise<IApiResponse> => {
      const response = await HrServiceInstance.getMasters('hr', 'Pg_Leave_flow', paginationData, filterData, user?.loginid1);
      return response || { tableData: [], count: 0 };
    },
    refetchOnWindowFocus: false,
    select: (data: IApiResponse) => {
      if (!data?.tableData) return { tableData: [], count: 0 };
      
      let filteredData = data.tableData as ILeaveRequest[];
      
      if (!dashboardView.isApproverView) {
        // Employee View: Filter to show only current user's leaves
        filteredData = filteredData.filter(
          (item: ILeaveRequest) => item.EMPLOYEE_CODE === user?.loginid1
        );
      }
      
      // Get only the most recent 10 requests for the table
      const recentData = filteredData
        .sort((a, b) => new Date(b.REQUEST_DATE).getTime() - new Date(a.REQUEST_DATE).getTime())
        .slice(0, 10);
      
      return { tableData: recentData, count: filteredData.length };
    },
    enabled: !!user?.loginid
  });

  // Check when all essential data is loaded
  useEffect(() => {
    // Only consider these three as essential for showing the dashboard
    const essentialDataLoading = loadingInProgress || loadingApproved || loadingRejected;
    const essentialDataAvailable = inProgressData !== undefined && approvedData !== undefined && rejectedData !== undefined;
    
    if (!essentialDataLoading && essentialDataAvailable) {
      // Data is loaded, hide loading state
      setTimeout(() => {
        setIsDataLoading(false);
      }, 300); // Small delay for smooth transition
    }
  }, [loadingInProgress, loadingApproved, loadingRejected, inProgressData, approvedData, rejectedData]);

  // Calculate counts from the API data - memoized
  const pendingRequestsCount = useMemo(() => 
    (inProgressData as IApiResponse)?.count || 0, 
    [inProgressData]
  );

  const totalLeavesTaken = useMemo(() => 
    (approvedData as IApiResponse)?.count || 0, 
    [approvedData]
  );

  const leavesRejectedCount = useMemo(() => 
    (rejectedData as IApiResponse)?.count || 0, 
    [rejectedData]
  );

  const totalLeavesAvailable = useMemo(
    () => pendingRequestsCount + totalLeavesTaken + leavesRejectedCount,
    [pendingRequestsCount, totalLeavesTaken, leavesRejectedCount]
  );

  // Prepare pie chart data from approvedData response - memoized
  const pieChartData = useMemo<IPieChartData[]>(() => {
    const approvedDataTyped = approvedData as IApiResponse;
    if (!approvedDataTyped?.tableData || approvedDataTyped.tableData.length === 0) {
      return [];
    }
    const approvedLeaves = approvedDataTyped.tableData as any[];
    
    // Group leaves by type
    const leavesByType: Record<string, { totalDays: number; employeeIds: Set<string> }> = {};
    
    approvedLeaves.forEach((leave: any) => {
      const leaveType = leave.LEAVE_TYPE_DESC || leave.LEAVE_TYPE;
      const leaveDays = Number(leave.LEAVE_DAYS) || 0;
      const employeeCode = leave.EMPLOYEE_CODE || '';
      
      if (!leavesByType[leaveType]) {
        leavesByType[leaveType] = {
          totalDays: 0,
          employeeIds: new Set<string>()
        };
      }
      
      leavesByType[leaveType].totalDays += leaveDays;
      if (employeeCode) {
        leavesByType[leaveType].employeeIds.add(employeeCode);
      }
    });
    
    // Convert to array format
    return Object.entries(leavesByType).map(([leaveType, data]) => ({
      LEAVE_TYPE_DESC: leaveType,
      TOTAL_LEAVES_TAKEN: data.totalDays,
      EMPLOYEE_COUNT: data.employeeIds.size || 1
    })).sort((a, b) => b.TOTAL_LEAVES_TAKEN - a.TOTAL_LEAVES_TAKEN);
  }, [approvedData]);

  // Prepare monthly trend data with employee counts - memoized
  const monthlyTrendData = useMemo(() => {
    const approvedDataTyped = approvedData as IApiResponse;
    if (!approvedDataTyped?.tableData || approvedDataTyped.tableData.length === 0) {
      return { labels: [], data: [], employeeCounts: [], monthKeys: [] };
    }
    
    const approvedLeaves = approvedDataTyped.tableData as any[];
    
    // Group leaves by month
    const leavesByMonth: Record<string, { totalDays: number; employeeIds: Set<string>; monthLabel: string }> = {};
    
    approvedLeaves.forEach((leave: any) => {
      try {
        const startDate = leave.LEAVE_START_DATE ? new Date(leave.LEAVE_START_DATE) : null;
        if (startDate) {
          const year = startDate.getFullYear();
          const month = startDate.getMonth() + 1;
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          const monthLabel = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          const leaveDays = Number(leave.LEAVE_DAYS) || 0;
          const employeeCode = leave.EMPLOYEE_CODE || '';
          
          if (!leavesByMonth[monthKey]) {
            leavesByMonth[monthKey] = {
              totalDays: 0,
              employeeIds: new Set<string>(),
              monthLabel: monthLabel
            };
          }
          leavesByMonth[monthKey].totalDays += leaveDays;
          if (employeeCode) {
            leavesByMonth[monthKey].employeeIds.add(employeeCode);
          }
        }
      } catch (error) {
        console.error('Error processing date:', error);
      }
    });
    
    // Convert to arrays and sort by date
    const sortedMonths = Object.keys(leavesByMonth).sort();
    const labels = sortedMonths.map(monthKey => leavesByMonth[monthKey].monthLabel);
    const data = sortedMonths.map(monthKey => leavesByMonth[monthKey].totalDays);
    const employeeCounts = sortedMonths.map(monthKey => leavesByMonth[monthKey].employeeIds.size);
    
    return { labels, data, employeeCounts, monthKeys: sortedMonths };
  }, [approvedData]);

  // Prepare monthly employee distribution data - memoized
  const monthlyEmployeeDistributionData = useMemo(() => {
    const approvedDataTyped = approvedData as IApiResponse;
    if (!dashboardView.isApproverView || !approvedDataTyped?.tableData || approvedDataTyped.tableData.length === 0) {
      return { labels: [], data: [], months: [] };
    }
    
    const approvedLeaves = approvedDataTyped.tableData as any[];
    
    // Get all unique months from the data
    const monthMap: Record<string, { label: string; employees: Record<string, number> }> = {};
    
    approvedLeaves.forEach((leave: any) => {
      try {
        const startDate = leave.LEAVE_START_DATE ? new Date(leave.LEAVE_START_DATE) : null;
        if (startDate) {
          const year = startDate.getFullYear();
          const month = startDate.getMonth() + 1;
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          const monthLabel = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          const employeeCode = leave.EMPLOYEE_CODE || '';
          const leaveDays = Number(leave.LEAVE_DAYS) || 0;
          
          if (employeeCode) {
            if (!monthMap[monthKey]) {
              monthMap[monthKey] = {
                label: monthLabel,
                employees: {}
              };
            }
            
            if (!monthMap[monthKey].employees[employeeCode]) {
              monthMap[monthKey].employees[employeeCode] = 0;
            }
            monthMap[monthKey].employees[employeeCode] += leaveDays;
          }
        }
      } catch (error) {
        console.error('Error processing date:', error);
      }
    });
    
    // Prepare data for selected month or all months
    if (selectedMonth === 'all') {
      // For "All Months", aggregate data across all months
      const allEmployees: Record<string, number> = {};
      
      Object.values(monthMap).forEach(monthData => {
        Object.entries(monthData.employees).forEach(([employeeCode, days]) => {
          if (!allEmployees[employeeCode]) {
            allEmployees[employeeCode] = 0;
          }
          allEmployees[employeeCode] += days;
        });
      });
      
      // Get top 10 employees across all months
      const sortedEmployees = Object.entries(allEmployees)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
      
      const labels = sortedEmployees.map(([employeeCode]) => {
        // Find employee name for this code
        const employee = approvedLeaves.find((leave: any) => leave.EMPLOYEE_CODE === employeeCode);
        const employeeName = employee?.EMPLOYEE_NAME_DISPLAY || employee?.EMPLOYEE_NAME || `Employee ${employeeCode}`;
        return employeeName.length > 20 ? employeeName.substring(0, 20) + '...' : employeeName;
      });
      
      const data = sortedEmployees.map(([, days]) => days);
      const months = ['All Months'];
      
      return { labels, data, months };
    } else {
      // For specific month
      const monthData = monthMap[selectedMonth];
      if (!monthData) {
        return { labels: [], data: [], months: [selectedMonth] };
      }
      
      // Get top 10 employees for selected month
      const sortedEmployees = Object.entries(monthData.employees)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
      
      const labels = sortedEmployees.map(([employeeCode]) => {
        // Find employee name for this code
        const employee = approvedLeaves.find((leave: any) => leave.EMPLOYEE_CODE === employeeCode);
        const employeeName = employee?.EMPLOYEE_NAME_DISPLAY || employee?.EMPLOYEE_NAME || `Employee ${employeeCode}`;
        return employeeName.length > 20 ? employeeName.substring(0, 20) + '...' : employeeName;
      });
      
      const data = sortedEmployees.map(([, days]) => days);
      const months = [monthData.label];
      
      return { labels, data, months };
    }
  }, [approvedData, dashboardView.isApproverView, selectedMonth]);

  // Get available months for the dropdown
  const availableMonths = useMemo(() => {
    const approvedDataTyped = approvedData as IApiResponse;
    if (!approvedDataTyped?.tableData || approvedDataTyped.tableData.length === 0) {
      return [];
    }
    
    const monthsSet = new Set<string>();
    const approvedLeaves = approvedDataTyped.tableData as any[];
    
    approvedLeaves.forEach((leave: any) => {
      try {
        const startDate = leave.LEAVE_START_DATE ? new Date(leave.LEAVE_START_DATE) : null;
        if (startDate) {
          const year = startDate.getFullYear();
          const month = startDate.getMonth() + 1;
          const monthKey = `${year}-${String(month).padStart(2, '0')}`;
          const monthLabel = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthsSet.add(`${monthKey}|${monthLabel}`);
        }
      } catch (error) {
        console.error('Error processing date:', error);
      }
    });
    
    // Convert to array and sort by date (newest first)
    const monthsArray = Array.from(monthsSet)
      .map(item => {
        const [key, label] = item.split('|');
        return { key, label };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
    
    return monthsArray;
  }, [approvedData]);

  // For modal data, fetch with higher limit when modal opens
  const fetchModalData = async (type: 'inProgress' | 'approved' | 'rejected') => {
    if (!user?.loginid) return { tableData: [], count: 0 };
    
    try {
      let pageName = '';
      switch (type) {
        case 'inProgress':
          pageName = 'Pg_leave_flow_InProgress';
          break;
        case 'approved':
          pageName = 'Pg_leave_flow_close';
          break;
        case 'rejected':
          pageName = 'Pg_leave_flow_Rejected';
          break;
      }
      
      // Fetch with higher limit for modal
      const modalPaginationData = { page: 0, rowsPerPage: 500 };
      const response = await HrServiceInstance.getMasters('hr', pageName, modalPaginationData, filterData, user.loginid1);
      
      // Filter data based on view mode
      let filteredData = response?.tableData || [];
      
      if (!dashboardView.isApproverView && response?.tableData) {
        // Employee View: Filter to show only current user's leaves
        filteredData = (response.tableData as IModalLeaveData[]).filter(
          (item: IModalLeaveData) => item.EMPLOYEE_CODE === user.loginid1
        );
      }
      
      return { tableData: filteredData, count: filteredData.length };
    } catch (err) {
      console.error(`Error fetching ${type} leaves for modal:`, err);
      return { tableData: [], count: 0 };
    }
  };

  // Modal column definitions
  const modalColumnDefs = useMemo<ColDef<IModalLeaveData>[]>(
    () => [
      {
        headerName: 'No.',
        field: 'REQUEST_NUMBER',
        width: 50,
        cellStyle: () => ({
          fontSize: '12px',
          textAlign: 'center' as const
        }),
        minWidth: 140,
        suppressMenu: true,
        sortable: false,
        filter: false
      },
      {
        headerName: 'Request Date',
        field: 'REQUEST_DATE',
        width: 120,
        minWidth: 150,
        cellStyle: () => ({ fontSize: '12px' }),
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        sortable: false,
        filter: false
      },
      {
        headerName: 'Employee Name',
        field: 'EMPLOYEE_NAME_DISPLAY',
        width: 120,
        minWidth: 220,
        cellStyle: () => ({ fontSize: '12px' }),
        sortable: false,
        filter: false
      },
      {
        headerName: 'Leave Type',
        field: 'LEAVE_TYPE_DESC',
        sortable: false,
        filter: false,
        width: 120,
        minWidth: 150,
        cellStyle: () => ({ fontSize: '12px' })
      },
      {
        headerName: 'Leave Start Date',
        field: 'LEAVE_START_DATE',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 120,
        minWidth: 150,
        cellStyle: () => ({ fontSize: '12px' }),
        sortable: false,
        filter: false
      },
      {
        headerName: 'Leave End Date',
        field: 'LEAVE_END_DATE',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 120,
        minWidth: 150,
        cellStyle: () => ({ fontSize: '12px' }),
        sortable: false,
        filter: false
      },
      {
        headerName: 'Remarks',
        field: 'REMARKS',
        sortable: false,
        filter: false,
        width: 120,
        minWidth: 150,
        cellStyle: () => ({ fontSize: '12px' })
      },
      {
        headerName: 'Next Action By',
        field: 'NEXT_ACTION_BY_NAME',
        sortable: false,
        filter: false,
        width: 120,
        minWidth: 220,
        cellStyle: () => ({ fontSize: '12px' })
      }
    ],
    []
  );

  // Function to open modal with specific type
  const handleOpenModal = async (type: 'inProgress' | 'approved' | 'rejected') => {
    if (!user?.loginid) return;

    setModalOpen(true);
    setIsLoadingModal(true);

    // Set modal title based on type
    const titles = {
      inProgress: dashboardView.isApproverView ? 'Leaves Pending Approval' : 'My Pending Leaves',
      approved: dashboardView.isApproverView ? 'Approved Leave Requests' : 'My Approved Leaves',
      rejected: dashboardView.isApproverView ? 'Rejected Leave Requests' : 'My Rejected Leaves'
    };
    setModalTitle(titles[type]);

    try {
      // Fetch fresh data for modal with higher limit
      const result = await fetchModalData(type);
      const dataToShow = (result?.tableData || []) as IModalLeaveData[];
      setModalData(dataToShow);
    } catch (err) {
      console.error('Error loading modal data:', err);
      setModalData([]);
    } finally {
      setIsLoadingModal(false);
    }
  };

  // Function to open chart modal
  const handleOpenChartModal = (chartType: 'leavesByType' | 'monthlyTrend' | 'employeeDistribution') => {
    setSelectedChartType(chartType);
    
    const titles = {
      leavesByType: dashboardView.isApproverView ? 'Leave Type Analysis' : 'My Leave Type Analysis',
      monthlyTrend: dashboardView.isApproverView ? 'Leave Trend Analysis' : 'My Leave Trend Analysis',
      employeeDistribution: 'Employee Leave Analysis by Month'
    };
    
    setChartModalTitle(titles[chartType]);
    setChartModalOpen(true);
  };

  // Refresh data function
  const handleRefreshData = () => {
    setIsDataLoading(true);
    // Reload the page to refresh all data
    setTimeout(() => window.location.reload(), 300);
  };

  // Close modals
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData([]);
    setIsLoadingModal(false);
  };

  const handleCloseChartModal = () => {
    setChartModalOpen(false);
    setSelectedChartType('');
  };

  // Handle month selection change
  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value);
  };

  // Modal style
  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1200px',
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
    overflow: 'auto'
  };

  // Chart modal style
  const chartModalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '960px',
    maxHeight: '85vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
    overflow: 'auto'
  };

  // // Get dashboard title based on view
  // const getDashboardTitle = () => {
  //   if (dashboardView.isApproverView) {
  //     return "Leave Management Dashboard - Team View";
  //   }
  //   return "Leave Management Dashboard - Personal View";
  // };

  // Get card titles based on view
  const getCardTitles = () => {
    if (dashboardView.isApproverView) {
      return {
        total: "Total Leave Requests",
        pending: "Leaves Pending Approval",
        approved: "Approved Leaves",
        rejected: "Rejected Leaves"
      };
    }
    return {
      total: "Total Leave Requests",
      pending: "My Pending Leaves",
      approved: "My Approved Leaves",
      rejected: "My Rejected Leaves"
    };
  };

  const cardTitles = getCardTitles();

  // Prepare leaves by type chart data with data labels
  const leavesByTypeChartData = {
    labels: pieChartData?.map(item => item.LEAVE_TYPE_DESC) || ['No Data'],
    datasets: [
      {
        data: pieChartData?.map(item => item.TOTAL_LEAVES_TAKEN) || [0],
        backgroundColor: COLOR_SCHEME.chartColors,
        hoverBackgroundColor: COLOR_SCHEME.chartColors.map(color => `${color}CC`),
        borderWidth: 3,
        borderColor: '#ffffff',
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold' as const,
            size: 14
          },
          formatter: (value: number) => {
            return value;
          }
        }
      }
    ]
  };

  // Non-modal doughnut chart options (without legend, with data labels)
  const leavesByTypeChartOptionsNoLegend = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 14
        },
        formatter: (value: number) => {
          return value;
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 2,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            
            return `${label}: ${value} days (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%'
  };

  // Modal doughnut chart options (with legend and data labels)
  // const leavesByTypeChartOptionsWithLegend = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       position: 'bottom' as const,
  //       labels: {
  //         boxWidth: 15,
  //         font: {
  //           size: 13,
  //           weight: 'bold' as const,
  //           family: 'Arial, sans-serif'
  //         },
  //         padding: 20,
  //         color: COLOR_SCHEME.textPrimary,
  //         generateLabels: (chart: any) => {
  //           const data = chart.data;
  //           if (data.labels.length && data.datasets.length) {
  //             return data.labels.map((label: string, i: number) => {
  //               const value = data.datasets[0].data[i];
  //               const employeeCount = pieChartData?.[i]?.EMPLOYEE_COUNT || 0;
                
  //               let labelText = `${label}: ${value} days`;
  //               if (dashboardView.isApproverView && employeeCount > 0) {
  //                 labelText += ` (${employeeCount} ${employeeCount === 1 ? 'employee' : 'employees'})`;
  //               }
                
  //               return {
  //                 text: labelText,
  //                 fillStyle: data.datasets[0].backgroundColor[i],
  //                 hidden: false,
  //                 index: i,
  //                 strokeStyle: '#fff',
  //                 lineWidth: 2
  //               };
  //             });
  //           }
  //           return [];
  //         }
  //       }
  //     },
  //     datalabels: {
  //       display: true,
  //       color: '#ffffff',
  //       font: {
  //         weight: 'bold' as const,
  //         size: 16
  //       },
  //       formatter: (value: number) => {
  //         return value;
  //       }
  //     },
  //     tooltip: {
  //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
  //       titleFont: { size: 14, weight: 'bold' as const },
  //       bodyFont: { size: 13, weight: 'bold' as const },
  //       padding: 12,
  //       cornerRadius: 8,
  //       titleColor: '#ffffff',
  //       bodyColor: '#ffffff',
  //       borderColor: '#ffffff',
  //       borderWidth: 2,
  //       callbacks: {
  //         label: function(context: any) {
  //           const label = context.label || '';
  //           const value = context.raw || 0;
  //           const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
  //           const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            
  //           let tooltipText = `${label}: ${value} days (${percentage}%)`;
            
  //           if (dashboardView.isApproverView && pieChartData) {
  //             const index = context.dataIndex;
  //             const employeeCount = pieChartData[index]?.EMPLOYEE_COUNT || 0;
  //             if (employeeCount > 0) {
  //               tooltipText += ` - ${employeeCount} ${employeeCount === 1 ? 'employee' : 'employees'}`;
  //             }
  //           }
            
  //           return tooltipText;
  //         }
  //       }
  //     },
  //     title: {
  //       display: true,
  //       text: 'Leave Type Analysis',
  //       font: {
  //         size: 18,
  //         weight: 'bold' as const,
  //         family: 'Arial, sans-serif'
  //       },
  //       color: COLOR_SCHEME.textPrimary,
  //       padding: {
  //         bottom: 20
  //       }
  //     }
  //   },
  //   cutout: '50%'
  // };

  // Monthly trend chart options (no title in non-modal view)
  const monthlyTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13, weight: 'bold' as const },
        callbacks: {
          title: function(tooltipItems: any) {
            if (dashboardView.isApproverView && monthlyTrendData.employeeCounts) {
              const index = tooltipItems[0].dataIndex;
              const employeeCount = monthlyTrendData.employeeCounts[index];
              return `${tooltipItems[0].label} (${employeeCount} employees)`;
            }
            return tooltipItems[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: false, // Hide title in non-modal view
          text: 'Month',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        },
        grid: {
          display: false
        },
        ticks: {
          color: COLOR_SCHEME.textSecondary
        }
      },
      y: {
        title: {
          display: false, // Hide title in non-modal view
          text: 'Leave Days',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: COLOR_SCHEME.textSecondary
        }
      }
    }
  };

  // Monthly trend chart options for modal (with title)
  const monthlyTrendChartOptionsModal = {
    ...monthlyTrendChartOptions,
    plugins: {
      ...monthlyTrendChartOptions.plugins,
      title: {
        display: true,
        text: 'Leave Trend Analysis',
        font: {
          size: 18,
          weight: 'bold' as const
        },
        color: COLOR_SCHEME.textPrimary
      }
    },
    scales: {
      ...monthlyTrendChartOptions.scales,
      x: {
        ...monthlyTrendChartOptions.scales?.x,
        title: {
          display: true, // Show title in modal view
          text: 'Month',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        }
      },
      y: {
        ...monthlyTrendChartOptions.scales?.y,
        title: {
          display: true, // Show title in modal view
          text: 'Leave Days',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        }
      }
    }
  };

  // Monthly employee distribution chart options (no title in non-modal view)
  const monthlyEmployeeDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13, weight: 'bold' as const }
      }
    },
    scales: {
      x: {
        title: {
          display: false, // Hide title in non-modal view
          text: 'Leave Days',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: COLOR_SCHEME.textSecondary
        }
      },
      y: {
        title: {
          display: false, // Hide title in non-modal view
          text: 'Employees',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        },
        grid: {
          display: false
        },
        ticks: {
          color: COLOR_SCHEME.textSecondary
        }
      }
    }
  };

  // Monthly employee distribution chart options for modal (with title)
  const monthlyEmployeeDistributionChartOptionsModal = {
    ...monthlyEmployeeDistributionChartOptions,
    plugins: {
      ...monthlyEmployeeDistributionChartOptions.plugins,
      title: {
        display: true,
        text: `Top 10 Employees - Leave Days ${selectedMonth === 'all' ? '(All Months)' : `(${monthlyEmployeeDistributionData.months[0]})`}`,
        font: {
          size: 18,
          weight: 'bold' as const
        },
        color: COLOR_SCHEME.textPrimary
      }
    },
    scales: {
      ...monthlyEmployeeDistributionChartOptions.scales,
      x: {
        ...monthlyEmployeeDistributionChartOptions.scales?.x,
        title: {
          display: true, // Show title in modal view
          text: 'Leave Days',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        }
      },
      y: {
        ...monthlyEmployeeDistributionChartOptions.scales?.y,
        title: {
          display: true, // Show title in modal view
          text: 'Employees',
          font: {
            size: 14,
            weight: 'bold' as const
          },
          color: COLOR_SCHEME.textSecondary
        }
      }
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get recent leave requests data
  const allLeaveRequestsTyped = allLeaveRequests as IApiResponse;
  const recentLeaveRequests = (allLeaveRequestsTyped?.tableData as ILeaveRequest[]) || [];
// ── helpers (add above return) ──────────────────────────────────────────────

const cardConfig = [
  {
    key: 'total',
    label: cardTitles.total,
    getValue: () => totalLeavesAvailable,
    loading: () => isDataLoading,
    accent: '#185FA5', bgAccent: '#E6F1FB',
    icon: 'ti-layout-grid',
    badge: 'FY ' + dayjs().year(),
    sub: 'All statuses combined',
    onClick: undefined as (() => void) | undefined,
    static: true,
  },
  {
    key: 'pending',
    label: cardTitles.pending,
    getValue: () => pendingRequestsCount,
    loading: () => isDataLoading || loadingInProgress,
    accent: '#854F0B', bgAccent: '#FAEEDA',
    icon: 'ti-clock-hour-4',
    badge: null,
    sub: 'Click to review',
    onClick: () => !isDataLoading && handleOpenModal('inProgress'),
    static: false,
  },
  {
    key: 'approved',
    label: cardTitles.approved,
    getValue: () => totalLeavesTaken,
    loading: () => isDataLoading || loadingApproved,
    accent: '#0F6E56', bgAccent: '#E1F5EE',
    icon: 'ti-circle-check',
    badge: null,
    sub: 'Click to view',
    onClick: () => !isDataLoading && handleOpenModal('approved'),
    static: false,
  },
  {
    key: 'rejected',
    label: cardTitles.rejected,
    getValue: () => leavesRejectedCount,
    loading: () => isDataLoading || loadingRejected,
    accent: '#993C1D', bgAccent: '#FAECE7',
    icon: 'ti-circle-x',
    badge: null,
    sub: 'Click to view',
    onClick: () => !isDataLoading && handleOpenModal('rejected'),
    static: false,
  },
];

// status → pill class
const pillClass = (status: string, finalApproved: string) => {
  if (finalApproved === 'YES') return 'approved';
  if (status === 'REJECTED') return 'rejected';
  return 'pending';
};
const pillLabel = (status: string, finalApproved: string) => {
  if (finalApproved === 'YES') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Pending';
};

const getMonthlyTrendDataset = () => ({
  label: 'Leave days',
  data: monthlyTrendData.data,
  borderColor: '#185FA5',
  backgroundColor: 'rgba(56,138,221,0.08)',
  borderWidth: 2,
  fill: true,
  tension: 0.4,
  pointRadius: 3,
  pointBackgroundColor: '#185FA5',
});

const getEmployeeDistributionDataset = () => ({
  label: 'Leave days',
  data: monthlyEmployeeDistributionData.data,
  backgroundColor: '#1D9E75',
  borderColor: '#185FA5',
  borderWidth: 1.5,
});

// shared panel-header style
const panelHeadStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
};
const panelTitleGroupStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
};

// ── JSX ─────────────────────────────────────────────────────────────────────

return (
  <div style={{ padding: '20px 24px', minHeight: '100vh', background: '#F8FAFC' }}>

    {/* Top bar */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em', margin: 0, color: '#0F172A' }}>
          Leave management
        </h1>
        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
          {dashboardView.isApproverView ? 'Team view' : 'Personal view'} — fiscal year {dayjs().year()}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: '#F1F5F9', border: '0.5px solid #E2E8F0', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
          <CalendarIcon style={{ fontSize: 13 }} />
          {dayjs().format('MMM YYYY')}
        </span>

        {dashboardView.userIsApprover && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '0.5px solid #E2E8F0', borderRadius: 6, padding: '5px 12px' }}>
            <span style={{ fontSize: 12, color: dashboardView.isApproverView ? '#94A3B8' : '#185FA5', fontWeight: dashboardView.isApproverView ? 400 : 500 }}>
              Personal
            </span>
            <div style={{ width: 1, height: 14, background: '#E2E8F0' }} />
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={dashboardView.isApproverView} onChange={handleToggleChange} disabled={isDataLoading} className="sr-only peer" />
              <div className="w-8 h-[18px] bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:after:translate-x-[14px]" />
            </label>
            <div style={{ width: 1, height: 14, background: '#E2E8F0' }} />
            <span style={{ fontSize: 12, color: dashboardView.isApproverView ? '#185FA5' : '#94A3B8', fontWeight: dashboardView.isApproverView ? 500 : 400 }}>
              Team
            </span>
          </div>
        )}

        <button
          onClick={handleRefreshData}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B', border: '0.5px solid #E2E8F0', borderRadius: 6, padding: '5px 10px', background: 'none', cursor: 'pointer' }}
        >
          <RefreshIcon style={{ fontSize: 13 }} /> Refresh
        </button>
      </div>
    </div>

    {/* Stat cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
      {cardConfig.map(({ key, label, getValue, loading, accent, bgAccent, icon, badge, sub, onClick, static: isStatic }) => (
        <div
          key={key}
          onClick={onClick}
          style={{
            background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 12,
            padding: '14px 16px', cursor: isStatic ? 'default' : 'pointer', transition: 'border-color .15s',
          }}
          onMouseEnter={e => !isStatic && ((e.currentTarget as HTMLDivElement).style.borderColor = '#CBD5E1')}
          onMouseLeave={e => !isStatic && ((e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bgAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: accent }}>
              {/* swap to whatever MUI icon you prefer per card */}
              {key === 'total'    && <CategoryIcon style={{ fontSize: 15, color: accent }} />}
              {key === 'pending'  && <SearchIcon style={{ fontSize: 15, color: accent }} />}
              {key === 'approved' && <TrendingUpIcon style={{ fontSize: 15, color: accent }} />}
              {key === 'rejected' && <CloseIcon style={{ fontSize: 15, color: accent }} />}
            </div>
            {badge && (
              <span style={{ fontSize: 10, background: bgAccent, color: accent, padding: '2px 7px', borderRadius: 20, fontWeight: 500 }}>{badge}</span>
            )}
          </div>

          {loading() ? (
            <div style={{ height: 32, display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={18} style={{ color: accent }} />
            </div>
          ) : (
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.03em', color: accent, lineHeight: 1 }}>
              {getValue()}
            </div>
          )}
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, paddingTop: 8, borderTop: '0.5px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 4 }}>
            {sub}
          </div>
        </div>
      ))}
    </div>

    {/* Charts — strictly side by side */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>

      {/* Donut — Leave type breakdown */}
      <div
        style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 12, padding: 16, cursor: isDataLoading ? 'default' : 'pointer' }}
        onClick={() => !isDataLoading && handleOpenChartModal('leavesByType')}
      >
        <div style={panelHeadStyle}>
          <div style={panelTitleGroupStyle}>
            <CategoryIcon style={{ fontSize: 15, color: '#94A3B8' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>
                {dashboardView.isApproverView ? 'Leave type breakdown' : 'My leave types'}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Approved days by category</div>
            </div>
          </div>
          {!isDataLoading && (
            <span style={{ fontSize: 11, color: '#94A3B8', border: '0.5px solid #E2E8F0', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
              Expand
            </span>
          )}
        </div>

        {isDataLoading || loadingApproved ? (
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={22} style={{ color: '#185FA5' }} />
          </div>
        ) : pieChartData?.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Donut */}
            <div style={{ height: 140, width: 140, flexShrink: 0 }}>
              <ReactChart type="doughnut" data={leavesByTypeChartData} options={leavesByTypeChartOptionsNoLegend} />
            </div>
            {/* Inline legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
              {pieChartData.map((item, i) => {
                const total = pieChartData.reduce((s, d) => s + d.TOTAL_LEAVES_TAKEN, 0);
                const pct = total > 0 ? Math.round((item.TOTAL_LEAVES_TAKEN / total) * 100) : 0;
                const color = COLOR_SCHEME.chartColors[i % COLOR_SCHEME.chartColors.length];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#475569', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.LEAVE_TYPE_DESC}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#0F172A' }}>{item.TOTAL_LEAVES_TAKEN}</span>
                    <span style={{ fontSize: 10, color: '#94A3B8', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94A3B8' }}>
            No data available
          </div>
        )}
      </div>

      {/* Line chart — Monthly trend */}
      <div
        style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 12, padding: 16, cursor: isDataLoading ? 'default' : 'pointer' }}
        onClick={() => !isDataLoading && handleOpenChartModal('monthlyTrend')}
      >
        <div style={panelHeadStyle}>
          <div style={panelTitleGroupStyle}>
            <TrendingUpIcon style={{ fontSize: 15, color: '#94A3B8' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>
                {dashboardView.isApproverView ? 'Monthly leave trend' : 'My leave trend'}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Approved days per month</div>
            </div>
          </div>
          {!isDataLoading && (
            <span style={{ fontSize: 11, color: '#94A3B8', border: '0.5px solid #E2E8F0', borderRadius: 6, padding: '3px 8px' }}>
              Expand
            </span>
          )}
        </div>

        {isDataLoading || loadingApproved ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={22} style={{ color: '#185FA5' }} />
          </div>
        ) : monthlyTrendData.labels.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Line chart */}
            <div style={{ height: 110 }}>
              <ReactChart
                type="line"
                data={{
                  labels: monthlyTrendData.labels,
                  datasets: [getMonthlyTrendDataset()],
                }}
                options={monthlyTrendChartOptions}
              />
            </div>
            {/* Mini bar breakdown — top 3 types */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                Top types this period
              </div>
              {pieChartData.slice(0, 3).map((item, i) => {
                const maxVal = pieChartData[0]?.TOTAL_LEAVES_TAKEN || 1;
                const pct = Math.round((item.TOTAL_LEAVES_TAKEN / maxVal) * 100);
                const color = COLOR_SCHEME.chartColors[i % COLOR_SCHEME.chartColors.length];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#475569', width: 70, textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.LEAVE_TYPE_DESC}
                    </span>
                    <div style={{ flex: 1, height: 5, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#94A3B8', width: 26, textAlign: 'right' }}>
                      {item.TOTAL_LEAVES_TAKEN}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94A3B8' }}>
            No data available
          </div>
        )}
      </div>

      {/* Employee distribution — approver only, full width */}
      {dashboardView.isApproverView && (
        <div
          style={{ gridColumn: '1 / -1', background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 12, padding: 16, cursor: isDataLoading ? 'default' : 'pointer' }}
          onClick={() => !isDataLoading && handleOpenChartModal('employeeDistribution')}
        >
          <div style={panelHeadStyle}>
            <div style={panelTitleGroupStyle}>
              <PeopleIcon style={{ fontSize: 15, color: '#94A3B8' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>Employee leave distribution</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Top 10 employees by approved days</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={e => e.stopPropagation()}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel style={{ fontSize: 12 }}>Month</InputLabel>
                <Select value={selectedMonth} label="Month" onChange={handleMonthChange} disabled={isDataLoading} style={{ fontSize: 12 }}>
                  <MenuItem value="all">All months</MenuItem>
                  {availableMonths.map(m => <MenuItem key={m.key} value={m.key} style={{ fontSize: 12 }}>{m.label}</MenuItem>)}
                </Select>
              </FormControl>
              {!isDataLoading && (
                <span style={{ fontSize: 11, color: '#94A3B8', border: '0.5px solid #E2E8F0', borderRadius: 6, padding: '3px 8px' }}>Expand</span>
              )}
            </div>
          </div>
          {isDataLoading || loadingApproved ? (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={22} style={{ color: '#185FA5' }} />
            </div>
          ) : monthlyEmployeeDistributionData.labels.length > 0 ? (
            <div style={{ height: 110 }}>
              <ReactChart   type="bar"
                  data={{ labels: monthlyEmployeeDistributionData.labels, 
                  datasets: [getEmployeeDistributionDataset()] }}
                  options={monthlyEmployeeDistributionChartOptions}
                />
            </div>
          ) : (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94A3B8' }}>No data available</div>
          )}
        </div>
      )}
    </div>

    {/* Requests table — always full width below charts */}
    <div style={{ background: '#FFFFFF', border: '0.5px solid #E2E8F0', borderRadius: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 0' }}>
        <div style={panelTitleGroupStyle}>
          <CalendarIcon style={{ fontSize: 15, color: '#94A3B8' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>
              {dashboardView.isApproverView ? 'Recent team requests' : 'Recent requests'}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              Latest {isDataLoading || loadingAllLeaves ? '…' : recentLeaveRequests?.length || 0} submissions
            </div>
          </div>
        </div>
      </div>

      {isDataLoading || loadingAllLeaves ? (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={20} style={{ color: '#185FA5' }} />
        </div>
      ) : recentLeaveRequests?.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 10 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid #F1F5F9' }}>
              {(['Request no.', dashboardView.isApproverView && 'Employee', 'Leave type', 'Start', 'End', 'Days', 'Status', 'Next action'] as (string | false)[])
                .filter(Boolean).map(h => (
                  <th key={h as string} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {recentLeaveRequests.map((req: any, i: number) => {
              const cls = pillClass(req.LAST_ACTION, req.FINAL_APPROVED);
              const lbl = pillLabel(req.LAST_ACTION, req.FINAL_APPROVED);
              const pillColors: Record<string, { bg: string; color: string; dot: string }> = {
                approved: { bg: '#ECFDF5', color: '#0F6E56', dot: '#0F6E56' },
                pending:  { bg: '#FFFBEB', color: '#854F0B', dot: '#854F0B' },
                rejected: { bg: '#FAECE7', color: '#993C1D', dot: '#993C1D' },
              };
              const pc = pillColors[cls];
              const initials = (req.EMPLOYEE_NAME || req.EMPLOYEE_NAME_DISPLAY || '?')
                .split(' ').map((n: string) => n[0]).slice(0, 2).join('');
              return (
                <tr
                  key={i}
                  style={{ borderBottom: '0.5px solid #F8FAFC' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFC'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                >
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 11, color: '#0F172A', fontWeight: 500 }}>
                    #{req.REQUEST_NUMBER}
                  </td>
                  {dashboardView.isApproverView && (
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#E6F1FB', color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, flexShrink: 0 }}>
                          {initials}
                        </div>
                        <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 500 }}>
                          {req.EMPLOYEE_NAME || req.EMPLOYEE_NAME_DISPLAY}
                        </span>
                      </div>
                    </td>
                  )}
                  <td style={{ padding: '10px 16px', color: '#475569' }}>{req.LEAVE_TYPE_DESC || req.LEAVE_TYPE}</td>
                  <td style={{ padding: '10px 16px', color: '#475569' }}>{formatDate(req.LEAVE_START_DATE)}</td>
                  <td style={{ padding: '10px 16px', color: '#475569' }}>{formatDate(req.LEAVE_END_DATE)}</td>
                  <td style={{ padding: '10px 16px', color: '#0F172A', fontWeight: 500 }}>{req.LEAVE_DAYS}d</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: pc.bg, color: pc.color }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc.dot }} />
                      {lbl}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#94A3B8', fontSize: 11 }}>
                    {req.NEXT_ACTION_BY_NAME || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94A3B8' }}>
          No recent requests found
        </div>
      )}
    </div>

    {/* Modals — unchanged logic */}
    <Modal open={modalOpen} onClose={handleCloseModal}>
      <Box sx={{ ...modalStyle, borderRadius: 2, p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography style={{ fontSize: 15, fontWeight: 500 }}>{modalTitle}</Typography>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleRefreshData} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '5px 10px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              <RefreshIcon style={{ fontSize: 13 }} /> Refresh
            </button>
            <IconButton onClick={handleCloseModal} size="small"><CloseIcon fontSize="small" /></IconButton>
          </div>
        </div>
        {isLoadingModal ? (
          <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <CircularProgress size={28} />
            <Typography style={{ fontSize: 13, color: '#64748B' }}>Loading data…</Typography>
          </div>
        ) : modalData.length === 0 ? (
          <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <SearchIcon style={{ fontSize: 40, color: '#CBD5E1' }} />
            <Typography style={{ fontSize: 14, color: '#64748B' }}>No records found</Typography>
          </div>
        ) : (
          <div style={{ height: '60vh' }}>
            <MyAgGrid height="100%" rowHeight={30} headerHeight={35} rowData={modalData} columnDefs={modalColumnDefs} paginationPageSize={10} paginationPageSizeSelector={[10, 25, 50, 100]} pagination />
          </div>
        )}
      </Box>
    </Modal>

    <Modal open={chartModalOpen} onClose={handleCloseChartModal}>
      <Box sx={{ ...chartModalStyle, borderRadius: 2, p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Typography style={{ fontSize: 15, fontWeight: 500 }}>{chartModalTitle}</Typography>
          <IconButton onClick={handleCloseChartModal} size="small"><CloseIcon fontSize="small" /></IconButton>
        </div>
        <div style={{ height: '70vh' }}>
              {selectedChartType === 'leavesByType' && (
                pieChartData?.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 48, maxWidth: 720, width: '100%' }}>
                      <div style={{ height: 260, width: 260, flexShrink: 0 }}>
                        <ReactChart type="doughnut" data={leavesByTypeChartData} options={leavesByTypeChartOptionsNoLegend} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 300 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          Breakdown by leave type
                        </div>
                        {pieChartData.map((item, i) => {
                          const total = pieChartData.reduce((s, d) => s + d.TOTAL_LEAVES_TAKEN, 0);
                          const pct = total > 0 ? Math.round((item.TOTAL_LEAVES_TAKEN / total) * 100) : 0;
                          const color = COLOR_SCHEME.chartColors[i % COLOR_SCHEME.chartColors.length];
                          return (
                            <div
                              key={i}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px', background: '#F8FAFC',
                                border: '0.5px solid #E2E8F0', borderRadius: 8
                              }}
                            >
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: '#334155', fontWeight: 500, flex: 1 }}>
                                {item.LEAVE_TYPE_DESC}
                                {dashboardView.isApproverView && item.EMPLOYEE_COUNT > 0 && (
                                  <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 400 }}>
                                    {' '}· {item.EMPLOYEE_COUNT} {item.EMPLOYEE_COUNT === 1 ? 'employee' : 'employees'}
                                  </span>
                                )}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.TOTAL_LEAVES_TAKEN}d</span>
                              <span style={{ fontSize: 11, color: '#94A3B8', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                            </div>
                          );
                        })}
                        <div
                          style={{
                            display: 'flex', justifyContent: 'space-between',
                            marginTop: 4, paddingTop: 10, borderTop: '0.5px solid #E2E8F0'
                          }}
                        >
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>Total approved days</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                            {pieChartData.reduce((s, d) => s + d.TOTAL_LEAVES_TAKEN, 0)}d
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94A3B8' }}>
                    No data available
                  </div>
                )
              )}

            {selectedChartType === 'monthlyTrend' && (
              monthlyTrendData.labels.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
                  <div style={{ flex: 1, minHeight: 300 }}>
                    <ReactChart
                      type="line"
                      data={{ labels: monthlyTrendData.labels, datasets: [getMonthlyTrendDataset()] }}
                      options={monthlyTrendChartOptionsModal}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Top types this period
                    </div>
                    {pieChartData.map((item, i) => {
                      const maxVal = pieChartData[0]?.TOTAL_LEAVES_TAKEN || 1;
                      const pct = Math.round((item.TOTAL_LEAVES_TAKEN / maxVal) * 100);
                      const color = COLOR_SCHEME.chartColors[i % COLOR_SCHEME.chartColors.length];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 13, color: '#475569', width: 110, textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.LEAVE_TYPE_DESC}
                          </span>
                          <div style={{ flex: 1, height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 13, color: '#94A3B8', width: 36, textAlign: 'right' }}>{item.TOTAL_LEAVES_TAKEN}d</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94A3B8' }}>
                  No data available
                </div>
              )
            )}
          {selectedChartType === 'employeeDistribution' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} onClick={e => e.stopPropagation()}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Month</InputLabel>
                  <Select value={selectedMonth} label="Month" onChange={handleMonthChange}>
                    <MenuItem value="all">All months</MenuItem>
                    {availableMonths.map(m => <MenuItem key={m.key} value={m.key}>{m.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
              <div style={{ flex: 1 }}>
                <ReactChart
                  type="bar"
                  data={{ labels: monthlyEmployeeDistributionData.labels, datasets: [getEmployeeDistributionDataset()] }}
                  options={monthlyEmployeeDistributionChartOptionsModal}
                />              
              </div>
            </div>
          )}
        </div>
      </Box>
    </Modal>
  </div>
);
};

export default EmployeeDashboard;