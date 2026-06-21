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
    maxWidth: '1400px',
    maxHeight: '85vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
    overflow: 'auto'
  };

  // Get dashboard title based on view
  const getDashboardTitle = () => {
    if (dashboardView.isApproverView) {
      return "Leave Management Dashboard - Team View";
    }
    return "Leave Management Dashboard - Personal View";
  };

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
  const leavesByTypeChartOptionsWithLegend = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 15,
          font: {
            size: 13,
            weight: 'bold' as const,
            family: 'Arial, sans-serif'
          },
          padding: 20,
          color: COLOR_SCHEME.textPrimary,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const employeeCount = pieChartData?.[i]?.EMPLOYEE_COUNT || 0;
                
                let labelText = `${label}: ${value} days`;
                if (dashboardView.isApproverView && employeeCount > 0) {
                  labelText += ` (${employeeCount} ${employeeCount === 1 ? 'employee' : 'employees'})`;
                }
                
                return {
                  text: labelText,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                  strokeStyle: '#fff',
                  lineWidth: 2
                };
              });
            }
            return [];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 16
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
            
            let tooltipText = `${label}: ${value} days (${percentage}%)`;
            
            if (dashboardView.isApproverView && pieChartData) {
              const index = context.dataIndex;
              const employeeCount = pieChartData[index]?.EMPLOYEE_COUNT || 0;
              if (employeeCount > 0) {
                tooltipText += ` - ${employeeCount} ${employeeCount === 1 ? 'employee' : 'employees'}`;
              }
            }
            
            return tooltipText;
          }
        }
      },
      title: {
        display: true,
        text: 'Leave Type Analysis',
        font: {
          size: 18,
          weight: 'bold' as const,
          family: 'Arial, sans-serif'
        },
        color: COLOR_SCHEME.textPrimary,
        padding: {
          bottom: 20
        }
      }
    },
    cutout: '50%'
  };

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

  // Get status color and text
  const getStatusInfo = (status: string, finalApproved: string) => {
    if (finalApproved === 'YES') return { color: 'text-green-700', text: 'Approved', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700 border-green-200' };
    if (status === 'REJECTED') return { color: 'text-red-700', text: 'Rejected', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700 border-red-200' };
    return { color: 'text-orange-700', text: 'Pending', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700 border-orange-200' };
  };

  // Get recent leave requests data
  const allLeaveRequestsTyped = allLeaveRequests as IApiResponse;
  const recentLeaveRequests = (allLeaveRequestsTyped?.tableData as ILeaveRequest[]) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      
      {/* Header with toggle - Always shows immediately */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {getDashboardTitle()}
          </h1>
          <p className="text-gray-600 mt-1">
            {dashboardView.isApproverView 
              ? "Manage and monitor team leave requests and approvals" 
              : "View and track your personal leave requests and status"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {dashboardView.userIsApprover && (
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
              <span className={`text-sm font-semibold ${dashboardView.isApproverView ? 'text-gray-500' : 'text-indigo-600'}`}>
                Personal View
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dashboardView.isApproverView}
                  onChange={handleToggleChange}
                  className="sr-only peer"
                  disabled={isDataLoading}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
              <span className={`text-sm font-semibold ${dashboardView.isApproverView ? 'text-indigo-600' : 'text-gray-500'}`}>
                Team View
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Leave Requests */}
        <div 
          className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-default"
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-xl text-indigo-600">📅</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              {cardTitles.total}
            </h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600 text-center">
            {isDataLoading ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              totalLeavesAvailable
            )}
          </p>
          {isDataLoading && (
            <div className="text-xs text-gray-500 text-center mt-2">
              Loading...
            </div>
          )}
        </div>

        {/* Leaves in Progress  */}
        <div 
          className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${isDataLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-1 cursor-pointer active:scale-95'}`}
          onClick={() => !isDataLoading && handleOpenModal('inProgress')}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
              {isDataLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
              ) : (
                <span className="text-xl text-emerald-600">⏳</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              {cardTitles.pending}
            </h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600 text-center">
            {isDataLoading || loadingInProgress ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              pendingRequestsCount
            )}
          </p>
          <div className="text-xs text-gray-500 text-center mt-2">
            {isDataLoading ? 'Loading data...' : 'Click to view details'}
          </div>
        </div>

        {/* Leaves Approved */}
        <div 
          className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${isDataLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-1 cursor-pointer active:scale-95'}`}
          onClick={() => !isDataLoading && handleOpenModal('approved')}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
              {isDataLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
              ) : (
                <span className="text-xl text-amber-600">✅</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              {cardTitles.approved}
            </h3>
          </div>
          <p className="text-3xl font-bold text-amber-600 text-center">
            {isDataLoading || loadingApproved ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              totalLeavesTaken
            )}
          </p>
          <div className="text-xs text-gray-500 text-center mt-2">
            {isDataLoading ? 'Loading data...' : 'Click to view details'}
          </div>
        </div>

        {/* Leaves Rejected */}
        <div 
          className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${isDataLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-1 cursor-pointer active:scale-95'}`}
          onClick={() => !isDataLoading && handleOpenModal('rejected')}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              {isDataLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
              ) : (
                <span className="text-xl text-red-600">❌</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              {cardTitles.rejected}
            </h3>
          </div>
          <p className="text-3xl font-bold text-red-600 text-center">
            {isDataLoading || loadingRejected ? (
              <div className="h-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              </div>
            ) : (
              leavesRejectedCount
            )}
          </p>
          <div className="text-xs text-gray-500 text-center mt-2">
            {isDataLoading ? 'Loading data...' : 'Click to view details'}
          </div>
        </div>
      </div>

      {/* Charts Section  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        
        {/* Leaves by Type Chart */}
        <div 
          className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${isDataLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-1 cursor-pointer active:scale-95'}`}
          onClick={() => !isDataLoading && handleOpenChartModal('leavesByType')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CategoryIcon className="text-indigo-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">
                {dashboardView.isApproverView ? 'Leave Type Distribution' : 'My Leave Types'}
              </h2>
            </div>
            {!isDataLoading && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Click to expand</span>
            )}
          </div>
          {isDataLoading || loadingApproved ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500 text-sm">Loading chart data...</p>
            </div>
          ) : pieChartData && pieChartData.length > 0 ? (
            <div className="h-64 relative">
              <ReactChart 
                type="doughnut" 
                data={leavesByTypeChartData} 
                options={leavesByTypeChartOptionsNoLegend} 
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No leave data available</p>
            </div>
          )}
        </div>

        {/* Monthly Trend Chart  */}
        <div 
          className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${isDataLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-1 cursor-pointer active:scale-95'}`}
          onClick={() => !isDataLoading && handleOpenChartModal('monthlyTrend')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUpIcon className="text-indigo-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">
                {dashboardView.isApproverView ? 'Monthly Leave Trends' : 'My Leave Trends'}
              </h2>
            </div>
            {!isDataLoading && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Click to expand</span>
            )}
          </div>
          {isDataLoading || loadingApproved ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500 text-sm">Loading chart data...</p>
            </div>
          ) : monthlyTrendData.labels.length > 0 ? (
            <div className="h-64 relative">
              <ReactChart 
                type="line" 
                data={{
                  labels: monthlyTrendData.labels,
                  datasets: [
                    {
                      label: 'Leave Days',
                      data: monthlyTrendData.data,
                      borderColor: COLOR_SCHEME.primary,
                      backgroundColor: `${COLOR_SCHEME.primary}20`,
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }} 
                options={monthlyTrendChartOptions} 
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No trend data available</p>
            </div>
          )}
        </div>

        {/* Monthly Employee Distribution or Recent Requests */}
        {dashboardView.isApproverView ? (
          <div 
            className={`bg-white p-5 rounded-xl shadow-sm transition-all duration-300 ${isDataLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-1 cursor-pointer active:scale-95'}`}
            onClick={() => !isDataLoading && handleOpenChartModal('employeeDistribution')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PeopleIcon className="text-indigo-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-800">
                  Monthly Employee Analysis
                </h2>
              </div>
              {!isDataLoading && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Click to expand</span>
              )}
            </div>
            
            {/* Month selector dropdown - stops propagation */}
            <div className="mb-4" onClick={(e) => e.stopPropagation()}>
              <FormControl size="small" fullWidth>
                <InputLabel>Select Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Select Month"
                  onChange={handleMonthChange}
                  className="bg-white"
                  disabled={isDataLoading}
                >
                  <MenuItem value="all">All Months</MenuItem>
                  {availableMonths.map((month) => (
                    <MenuItem key={month.key} value={month.key}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            
            {isDataLoading || loadingApproved ? (
              <div className="h-48 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                <p className="text-gray-500 text-sm">Loading employee data...</p>
              </div>
            ) : monthlyEmployeeDistributionData.labels.length > 0 ? (
              <div className="h-48 relative">
                <ReactChart 
                  type="bar" 
                  data={{
                    labels: monthlyEmployeeDistributionData.labels,
                    datasets: [
                      {
                        label: 'Leave Days',
                        data: monthlyEmployeeDistributionData.data,
                        backgroundColor: COLOR_SCHEME.secondary,
                        borderColor: COLOR_SCHEME.primary,
                        borderWidth: 2
                      }
                    ]
                  }} 
                  options={monthlyEmployeeDistributionChartOptions} 
                />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">
                  {selectedMonth === 'all' ? 'No employee data available' : 'No data for selected month'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-4">
              <CalendarIcon className="text-indigo-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-800">
                My Recent Requests ({isDataLoading || loadingAllLeaves ? '...' : recentLeaveRequests?.length || 0})
              </h2>
            </div>
            {isDataLoading || loadingAllLeaves ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 text-sm">Loading recent requests...</p>
              </div>
            ) : recentLeaveRequests && recentLeaveRequests.length > 0 ? (
              <div className="h-64 overflow-hidden">
                <div className="overflow-auto h-full">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Applied Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Days</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentLeaveRequests.map((request, index) => {
                        const statusInfo = getStatusInfo(request.LAST_ACTION, request.FINAL_APPROVED);
                        return (
                          <tr 
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(request.REQUEST_DATE)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{request.LEAVE_TYPE}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.badge}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {formatDate(request.LEAVE_START_DATE)} - {formatDate(request.LEAVE_END_DATE)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap font-semibold">{request.LEAVE_DAYS}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No recent leave requests found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Requests Section for Team View */}
      {dashboardView.isApproverView && (
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            📋 Recent Team Requests ({isDataLoading || loadingAllLeaves ? '...' : recentLeaveRequests?.length || 0})
          </h2>
          {isDataLoading || loadingAllLeaves ? (
            <div className="h-40 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-gray-500 text-sm">Loading team requests...</p>
            </div>
          ) : recentLeaveRequests && recentLeaveRequests.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-auto max-h-80">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Employee</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Applied Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Leave Type</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentLeaveRequests.map((request:any, index) => {
                      const statusInfo = getStatusInfo(request.LAST_ACTION, request.FINAL_APPROVED);
                      return (
                        <tr 
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2 whitespace-nowrap">{request.EMPLOYEE_NAME}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{formatDate(request.REQUEST_DATE)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{request.LEAVE_TYPE_DESC}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.badge}`}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDate(request.LEAVE_START_DATE)} - {formatDate(request.LEAVE_END_DATE)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-semibold">{request.LEAVE_DAYS}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-500">No recent leave requests found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Leave Details */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="leave-details-modal"
        aria-describedby="leave-details-description"
      >
        <Box sx={modalStyle}>
          <div className="flex justify-between items-center mb-4">
            <Typography id="leave-details-modal" variant="h6" component="h2" className="font-bold text-indigo-700">
              {modalTitle}
            </Typography>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefreshData}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-semibold"
              >
                <RefreshIcon className="h-3 w-3" />
                Refresh
              </button>
              <IconButton
                aria-label="close"
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          
          {isLoadingModal ? (
            <div className="flex flex-col items-center justify-center h-64">
              <CircularProgress className="text-indigo-600" />
              <Typography className="mt-4 text-gray-600">Loading leave data...</Typography>
            </div>
          ) : modalData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <SearchIcon className="text-gray-400 text-5xl mb-4" />
              <Typography variant="h6" className="text-gray-700 mb-2">
                No leave records found
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                {dashboardView.isApproverView 
                  ? "There are no team leaves in this category."
                  : "You have no leaves in this category."
                }
              </Typography>
            </div>
          ) : (
            <div className="h-[60vh]">
              <MyAgGrid
                height="100%"
                rowHeight={30}
                headerHeight={35}
                rowData={modalData}
                columnDefs={modalColumnDefs}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 25, 50, 100]}
                pagination
              />
            </div>
          )}
        </Box>
      </Modal>

      {/* Modal for Expanded Charts */}
      <Modal
        open={chartModalOpen}
        onClose={handleCloseChartModal}
        aria-labelledby="chart-modal"
        aria-describedby="chart-modal-description"
      >
        <Box sx={chartModalStyle}>
          <div className="flex justify-between items-center mb-4">
            <Typography id="chart-modal" variant="h6" component="h2" className="font-bold text-indigo-700">
              {chartModalTitle}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleCloseChartModal}
              className="text-gray-600 hover:text-gray-800"
            >
              <CloseIcon />
            </IconButton>
          </div>
          
          <div className="h-[70vh]">
            {selectedChartType === 'leavesByType' && (
              <ReactChart 
                type="doughnut" 
                data={leavesByTypeChartData} 
                options={leavesByTypeChartOptionsWithLegend} 
              />
            )}
            
            {selectedChartType === 'monthlyTrend' && (
              <ReactChart 
                type="line" 
                data={{
                  labels: monthlyTrendData.labels,
                  datasets: [
                    {
                      label: 'Leave Days',
                      data: monthlyTrendData.data,
                      borderColor: COLOR_SCHEME.primary,
                      backgroundColor: `${COLOR_SCHEME.primary}20`,
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }} 
                options={monthlyTrendChartOptionsModal} 
              />
            )}
            
            {selectedChartType === 'employeeDistribution' && (
              <div>
                {/* Month selector in modal */}
                <div className="mb-6 flex justify-center">
                  <FormControl size="small" className="min-w-[200px]">
                    <InputLabel>Select Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      label="Select Month"
                      onChange={handleMonthChange}
                      className="bg-white"
                    >
                      <MenuItem value="all">All Months</MenuItem>
                      {availableMonths.map((month) => (
                        <MenuItem key={month.key} value={month.key}>
                          {month.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                
                <div className="h-[calc(70vh-100px)]">
                  <ReactChart 
                    type="bar" 
                    data={{
                      labels: monthlyEmployeeDistributionData.labels,
                      datasets: [
                        {
                          label: 'Leave Days',
                          data: monthlyEmployeeDistributionData.data,
                          backgroundColor: COLOR_SCHEME.secondary,
                          borderColor: COLOR_SCHEME.primary,
                          borderWidth: 2
                        }
                      ]
                    }} 
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