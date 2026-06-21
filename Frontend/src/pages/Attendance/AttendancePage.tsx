import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// import attendanceServiceInstance from 'service/attendance/Service.attendance';
// import moment from 'moment-timezone';
// import moment from 'moment-timezone';
import dayjs from 'dayjs';
import { DatePicker, Button, Tooltip, Grid, Dropdown, Tag, Spin } from 'antd';
import { ExportOutlined, SyncOutlined, MenuOutlined, FilterOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import attendanceServiceInstance from 'service/Attendance/Service.attendance';
import moment from 'moment';

const { RangePicker } = DatePicker;
// const { Text } = Typography;
const { useBreakpoint } = Grid;

interface IAttendanceEvent {
  id: string;
  employee_id: string;
  full_name: string;
  department: string;
  position: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  event_time: string;
  event_type: 'check_in' | 'check_out';
  day_of_week: string;
}

interface IAttendanceResponse {
  data: IAttendanceEvent[];
  total: number;
  page: number;
  limit: number;
}

// AttendanceGrid Component
interface AttendanceGridProps {
  rowData: IAttendanceEvent[];
  isLoading?: boolean;
  isMobile?: boolean;
}

const AttendanceGrid = ({ rowData, isLoading, isMobile = false }: AttendanceGridProps) => {
  const gridRef = useRef<any>(null);
  const screens = useBreakpoint();
  const mobileMode = isMobile || !screens.md;

  const containerStyle = useMemo(
    () => ({
      height: mobileMode ? '450px' : screens.lg ? 'calc(100vh - 250px)' : '500px',
      width: '100%',
      minHeight: mobileMode ? '350px' : '400px'
    }),
    [mobileMode, screens.lg]
  );

  const getDepartmentColor = (dept: string) => {
    const deptColors: { [key: string]: string } = {
      IT: '#1677ff',
      HR: '#722ED1',
      Finance: '#13C2C2',
      Operations: '#52C41A',
      Sales: '#FA8C16',
      Marketing: '#EB2F96'
    };
    return deptColors[dept] || '#1677ff';
  };

  // Mobile-optimized columns
  const mobileColumnDefs: ColDef[] = [
    {
      field: 'employee_id',
      headerName: 'ID',
      width: 70,
      maxWidth: 80,
      cellStyle: {
        fontFamily: 'monospace',
        color: '#1677ff',
        fontSize: '10px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      suppressSizeToFit: true,
      filter: false
    },
    {
      field: 'full_name',
      headerName: 'Employee Name',
      minWidth: 100,
      flex: 2,
      cellStyle: {
        fontWeight: 500,
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px'
      },
      valueFormatter: (params) => {
        const name = params.value || '';
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
      },
      tooltipValueGetter: (params) => params.data.full_name,
      cellRenderer: (params: any) => (
        <Tooltip title={params.data.full_name}>
          <div className="flex flex-col justify-center min-h-full">
            <span className="font-semibold text-sm leading-tight">
              {params.data.full_name?.length > 15 ? params.data.full_name.substring(0, 15) + '...' : params.data.full_name}
            </span>
          </div>
        </Tooltip>
      ),
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true,
        debounceMs: 300
      }
    },
    {
      field: 'department',
      headerName: 'Dept',
      // increased width on mobile to show more department text, removed restrictive maxWidth
      width: 140,
      maxWidth: 200,
      cellRenderer: (params: any) => {
        const color = getDepartmentColor(params.value);
        return (
          <Tooltip title={params.value}>
            <Tag
              color={color}
              style={{
                padding: '1px 4px',
                fontSize: '9px',
                background: `linear-gradient(45deg, ${color}15, ${color}30)`,
                borderColor: `${color}50`,
                color: color,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                lineHeight: '1.2',
                margin: 0,
                width: '100%',
                textAlign: 'center'
              }}
            >
              {params.value?.substring(0, 3).toUpperCase()}
            </Tag>
          </Tooltip>
        );
      },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'event_time',
      headerName: 'Time',
      width: 75,
      maxWidth: 85,
      valueFormatter: (params) => moment.utc(params.value).local().format('HH:mm'),
      cellStyle: {
        fontFamily: 'monospace',
        fontSize: '10px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      tooltipValueGetter: (params) => moment.utc(params.value).local().format('HH:mm:ss'),
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'event_type',
      headerName: 'Event',
      width: 65,
      maxWidth: 75,
      cellRenderer: (params: any) => (
        <Tag
          color={params.value === 'check_in' ? 'success' : 'error'}
          style={{
            padding: '1px 2px',
            fontSize: '9px',
            width: '100%',
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.2',
            minHeight: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {params.value === 'check_in' ? 'IN' : 'OUT'}
        </Tag>
      ),
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    }
  ];

  // Desktop columns
  const desktopColumnDefs: ColDef[] = [
    {
      field: 'employee_id',
      headerName: 'Employee ID',
      width: 110,
      minWidth: 90,
      cellStyle: { fontFamily: 'monospace', color: '#1677ff', fontSize: '11px' },
      suppressSizeToFit: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'full_name',
      headerName: 'Employee Name',
      minWidth: 120,
      flex: 1,
      cellStyle: { fontWeight: 500, fontSize: '11px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'department',
      headerName: 'Department',
      // increased width to better display full department names on desktop
      width: 220,
      minWidth: 160,
      cellRenderer: (params: any) => {
        const color = getDepartmentColor(params.value);
        return (
          <Tag
            color={color}
            style={{
              padding: '0px 8px',
              fontSize: '11px',
              background: `linear-gradient(45deg, ${color}15, ${color}30)`,
              borderColor: `${color}50`,
              color: color,
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {params.value}
          </Tag>
        );
      },
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 130,
      cellStyle: { fontSize: '11px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'event_time',
      headerName: 'Date',
      width: 110,
      valueFormatter: (params) => dayjs(params.value).format('DD MMM YYYY'),
      cellStyle: { color: '#666', fontSize: '11px' },
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          const cellDate = dayjs(cellValue).startOf('day').toDate();
          return cellDate.getTime() - filterLocalDateAtMidnight.getTime();
        }
      }
    },
    {
      field: 'day_of_week',
      headerName: 'Day',
      width: 80,
      valueFormatter: (params) => params.value?.substring(0, 3),
      cellStyle: { textAlign: 'center', color: '#888', fontSize: '11px' },
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false
      }
    },
    {
      field: 'event_time',
      headerName: 'Time',
      width: 100,
      valueFormatter: (params) => moment.utc(params.value).local().format('HH:mm:ss'),
      cellStyle: { fontFamily: 'monospace', fontSize: '11px' },
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      field: 'event_type',
      headerName: 'Event Type',
      width: 110,
      cellRenderer: (params: any) => (
        <Tag
          color={params.value === 'check_in' ? 'success' : 'error'}
          style={{ padding: '0px 8px', fontSize: '11px', width: '80px', textAlign: 'center' }}
        >
          {params.value === 'check_in' ? 'CHECK IN' : 'CHECK OUT'}
        </Tag>
      ),
      filter: 'agSetColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        values: ['check_in', 'check_out']
      }
    }
  ];

  const columnDefs = mobileMode ? mobileColumnDefs : desktopColumnDefs;

  // FIXED: Simplified and corrected default column definition
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: false,
      suppressMenu: false,
      menuTabs: ['filterMenuTab'],
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    }),
    []
  );

  // FIXED: Simplified grid options
  const gridOptions = useMemo<GridOptions>(
    () => ({
      rowHeight: mobileMode ? 40 : 25,
      headerHeight: mobileMode ? 35 : 30,
      enableCellTextSelection: true,
      enableBrowserTooltips: true,
      suppressMenuHide: false,
      pagination: true,
      paginationPageSize: mobileMode ? 15 : 25,
      animateRows: true,
      // FIX: Add popupParent to ensure filter menu renders correctly
      popupParent: document.body
    }),
    [mobileMode]
  );

  const onGridReady = (params: any) => {
    gridRef.current = params.api;
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 100);
  };

  const onGridSizeChanged = (params: any) => {
    params.api.sizeColumnsToFit();
  };

  return (
    <div className="relative w-full">
      <style>
        {`
          /* FIXED: Cleaned up CSS with proper filter styling */
          .ag-theme-alpine {
            --ag-font-size: ${mobileMode ? '11px' : '11px'};
            --ag-font-family: -apple-system, system-ui, sans-serif;
            --ag-header-background-color: #f8fafc;
            --ag-odd-row-background-color: #ffffff;
            --ag-row-hover-color: #f1f5f9;
            --ag-selected-row-background-color: #e8f4ff;
            --ag-row-border-color: #f1f1f1;
            --ag-cell-horizontal-padding: ${mobileMode ? '3px' : '8px'};
            --ag-header-height: ${mobileMode ? '35px' : '30px'};
            --ag-row-height: ${mobileMode ? '40px' : '25px'};
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
          }

          /* FIXED: Critical filter menu styling */
          .ag-theme-alpine .ag-header-cell-menu-button {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: all !important;
            cursor: pointer !important;
          }

          .ag-theme-alpine .ag-menu {
            z-index: 10002 !important;
            position: absolute !important;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }

          .ag-theme-alpine .ag-filter-body-wrapper {
            min-width: 200px;
            padding: 8px;
          }

          .ag-theme-alpine .ag-filter-apply-panel {
            border-top: 1px solid #e5e7eb;
            padding: 8px;
            background: #f9fafb;
          }

          .ag-theme-alpine .ag-header-cell-text {
            font-weight: 600;
            font-size: ${mobileMode ? '10px' : '12px'};
            color: #374151;
          }

          .ag-theme-alpine .ag-cell {
            display: flex;
            align-items: center;
            border-right: 1px solid #f1f5f9;
            padding: ${mobileMode ? '2px 1px' : '4px 8px'};
          }

          .ag-theme-alpine .ag-row {
            border-bottom: 1px solid #f1f5f9;
          }

          .ag-theme-alpine .ag-row-odd {
            background-color: #fafbfc;
          }

          .ag-theme-alpine .ag-header-cell {
            padding: ${mobileMode ? '0 2px' : '0 8px'};
          }

          .ag-theme-alpine .ag-paging-panel {
            padding: ${mobileMode ? '6px 2px' : '8px 4px'};
            font-size: ${mobileMode ? '10px' : '11px'};
          }

          /* FIXED: Ensure filter popup is visible */
          .ag-theme-alpine .ag-popup {
            z-index: 10003 !important;
            position: fixed !important;
          }

          .ag-theme-alpine .ag-filter-wrapper {
            z-index: 10004 !important;
          }

          /* Loading overlay */
          .custom-loading-overlay {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            z-index: 10;
          }

          @media (max-width: 768px) {
            .ag-theme-alpine {
              border-radius: 6px;
            }

            .ag-theme-alpine .ag-menu {
              min-width: 250px;
              max-width: 90vw;
            }
          }
        `}
      </style>

      <div className="ag-theme-alpine" style={containerStyle}>
        {isLoading ? (
          <div className="custom-loading-overlay">
            <Spin size="large" tip="Loading attendance data..." />
          </div>
        ) : (
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            onGridReady={onGridReady}
            onGridSizeChanged={onGridSizeChanged}
            onFirstDataRendered={onGridSizeChanged}
            suppressScrollOnNewData={true}
            enableBrowserTooltips={true}
          />
        )}
      </div>

      {mobileMode && (
        <div className="mt-2 px-2">
          <div className="text-xs text-gray-500 text-center mb-1">
            💡 <strong>Scroll horizontally</strong> to view all data
          </div>
          <div className="text-xs text-gray-400 text-center">Click filter icons in header to filter data</div>
        </div>
      )}
    </div>
  );
};

// Main AttendancePage Component
const AttendancePage = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]);
  // const [countdown] = useState(300);
  const [showFilters, setShowFilters] = useState(!isMobile);

  const {
    data: attendanceData,
    isFetching,
    refetch
  } = useQuery<IAttendanceResponse, Error>({
    queryKey: ['attendance_events', dateRange],
    queryFn: async () => {
      const response = await attendanceServiceInstance.getAttendanceRecords(
        {
          page: 0,
          rowsPerPage: 1000
        },
        dateRange
      );

      const mappedData = response.data.map((record: any) => ({
        id: record.id,
        employee_id: record.employee_id,
        full_name: record.full_name,
        department: record.department,
        position: record.position,
        date: record.date,
        check_in: record.check_in,
        check_out: record.check_out,
        status: record.status,
        event_time: record.event_time,
        event_type: record.event_type,
        day_of_week: record.day_of_week
      }));

      return {
        ...response,
        data: mappedData
      } as IAttendanceResponse;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000
  });

  // Auto refresh timer
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev <= 1) {
  //         refetch();
  //         return 300;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [refetch]);

  // Toggle filters on mobile
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // Export to Excel function
  const handleExport = useCallback(() => {
    if (!attendanceData?.data) return;

    const exportData = attendanceData.data.map((record: IAttendanceEvent) => ({
      'Employee ID': record.employee_id || '',
      'Employee Name': record.full_name || '',
      Department: record.department || '',
      Position: record.position || '',
      Date: record.event_time ? dayjs(record.event_time).format('DD MMM YYYY') : '',
      Day: record.day_of_week || '',
      Time: record.event_time ? moment.utc(record.event_time).local().format('HH:mm') : '',
      'Event Type': record.event_type ? (record.event_type === 'check_in' ? 'CHECK IN' : 'CHECK OUT') : ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');

    const fileName = `Attendance_${dayjs(dateRange[0]).format('YYYY-MM-DD')}_to_${dayjs(dateRange[1]).format('YYYY-MM-DD')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [attendanceData?.data, dateRange]);


  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    }
  };

  // Mobile dropdown menu items
  const mobileMenuItems = [
    {
      key: 'export',
      label: 'Export to Excel',
      icon: <ExportOutlined />,
      onClick: handleExport
    },
    {
      key: 'refresh',
      label: 'Refresh Now',
      icon: <SyncOutlined />,
      onClick: () => refetch()
    },
    {
      key: 'filters',
      label: showFilters ? 'Hide Filters' : 'Show Filters',
      icon: <FilterOutlined />,
      onClick: () => setShowFilters(!showFilters)
    }
  ];

  const renderFilters = () => (
    <div
      className={`w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        } lg:max-h-none lg:opacity-100`}
    >
      <div className="w-full lg:min-w-[300px] lg:max-w-[500px]">
        <RangePicker
          value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
          onChange={handleDateRangeChange}
          style={{ width: '100%' }}
          size={isMobile ? 'middle' : 'large'}
          className="rounded-lg border border-gray-200"
          format="DD/MM/YYYY"
          allowClear={false}
          placeholder={['Start Date', 'End Date']}
        />
      </div>

      <div className="flex items-center gap-3 justify-between lg:justify-end">

        {!isMobile && (
          <Tooltip title="Export to Excel">
            <Button
              icon={<ExportOutlined />}
              type="primary"
              onClick={handleExport}
              loading={isFetching}
              className="flex items-center gap-1"
              style={{ padding: '8px 16px', height: '40px' }}
            >
              Export
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 p-3 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Attendance Records</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Detailed view of all check-in and check-out events</p>
          </div>

          {isMobile && (
            <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight" trigger={['click']}>
              <Button icon={<MenuOutlined />} type="text" size="middle" className="ml-2" />
            </Dropdown>
          )}
        </div>

        {/* Filters Section */}
        {renderFilters()}
      </div>

      {/* Data Grid Section */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <AttendanceGrid rowData={attendanceData?.data || []} isLoading={isFetching} isMobile={isMobile} />
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-10">
          <Tooltip title="Quick Actions">
            <Dropdown menu={{ items: mobileMenuItems }} placement="topRight" trigger={['click']}>
              <Button type="primary" shape="circle" size="large" icon={<MenuOutlined />} className="shadow-lg" />
            </Dropdown>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
