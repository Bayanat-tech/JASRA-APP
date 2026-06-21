import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridOptions } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import moment from 'moment';
import UniversalDialog from 'components/popup/UniversalDialog';

import EmployeeRegistration from './EmployeeRegistration';
import attendanceServiceInstance from 'service/Attendance/Service.attendance';

const EmployeeListing = () => {
  const gridRef = useRef<any>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [employeeFormPopup, setEmployeeFormPopup] = useState({
    open: false,
    isEditMode: false,
    existingData: null
  });

  const { data: employees, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: attendanceServiceInstance.getEmployees
  });

  const toggleEmployeeFormPopup = useCallback((existingData = null) => {
    setEmployeeFormPopup((prev) => ({
      ...prev,
      open: !prev.open,
      isEditMode: !!existingData,
      existingData
    }));
  }, []);

  const handleActions = (actionType: string, rowData: any) => {
    if (actionType === 'edit') {
      toggleEmployeeFormPopup(rowData);
    }
  };

  const containerStyle = useMemo(
    () => ({
      height: windowWidth < 768 ? '450px' : 'calc(100vh - 250px)',
      width: '100%',
      minHeight: windowWidth < 768 ? '350px' : '400px'
    }),
    [windowWidth]
  );

  const columnDefs = [
    {
      headerName: 'Employee Code',
      field: 'employee_code',
      width: 140,
      minWidth: 100,
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
      headerName: 'Employee ID',
      field: 'employee_id',
      width: 110,
      minWidth: 90,
      suppressSizeToFit: true,
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: false,
        debounceMs: 300
      }
    },
    {
      headerName: 'Full Name',
      field: 'full_name',
      sortable: true,
      filter: true,
      minWidth: 180,
      flex: 2
    },
    {
      headerName: 'Email',
      field: 'email',
      sortable: true,
      filter: true,
      minWidth: 260,
      flex: 2,
      hide: windowWidth < 768
    },
    {
      headerName: 'Position',
      field: 'position',
      sortable: true,
      filter: true,
      minWidth: 130,
      flex: 1
    },
    {
      headerName: 'Hire Date',
      field: 'hire_date',
      sortable: true,
      filter: true,
      minWidth: 120,
      flex: 1
    },
    {
      headerName: 'Phone Number',
      field: 'phone_number',
      sortable: true,
      filter: true,
      minWidth: 130,
      flex: 1,
      hide: windowWidth < 768
    },
    {
      headerName: 'Created At',
      field: 'created_at',
      sortable: true,
      filter: true,
      valueFormatter: (params: { value: string }) => (params.value ? moment.utc(params.value).local().format('YYYY-MM-DD HH:mm:ss') : '')
    },
    {
      headerName: 'Actions',
      field: 'actions',
      filter: false,
      cellRenderer: (params: { data: any }) => {
        const actionButtons: TAvailableActionButtons[] = ['edit'];
        return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
      }
    }
  ];

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

  const gridOptions = useMemo<GridOptions>(
    () => ({
      rowHeight: windowWidth < 768 ? 40 : 25,
      headerHeight: windowWidth < 768 ? 35 : 30,
      enableCellTextSelection: true,
      enableBrowserTooltips: true,
      suppressMenuHide: false,
      pagination: true,
      paginationPageSize: windowWidth < 768 ? 15 : 25,
      animateRows: true,
      popupParent: document.body
    }),
    [windowWidth]
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
    <div className="flex flex-col space-y-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-800"></h1>
        <Button
          startIcon={<PlusOutlined />}
          color="primary"
          variant="contained"
          onClick={() => toggleEmployeeFormPopup()}
          style={{ borderRadius: '8px', padding: '8px 16px' }}
        >
          Register Employee
        </Button>
      </div>

      <div className="relative w-full">
        <style>
          {`
            /* Same styles as AttendancePage */
            .ag-theme-alpine {
              --ag-font-size: ${windowWidth < 768 ? '11px' : '11px'};
              --ag-font-family: -apple-system, system-ui, sans-serif;
              --ag-header-background-color: #f8fafc;
              --ag-odd-row-background-color: #ffffff;
              --ag-row-hover-color: #f1f5f9;
              --ag-selected-row-background-color: #e8f4ff;
              --ag-row-border-color: #f1f1f1;
              --ag-cell-horizontal-padding: ${windowWidth < 768 ? '3px' : '8px'};
              --ag-header-height: ${windowWidth < 768 ? '35px' : '30px'};
              --ag-row-height: ${windowWidth < 768 ? '40px' : '25px'};
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              overflow: hidden;
            }

            /* Critical filter menu styling */
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
              font-size: ${windowWidth < 768 ? '10px' : '12px'};
              color: #374151;
            }

            .ag-theme-alpine .ag-popup {
              z-index: 10003 !important;
              position: fixed !important;
            }

            .ag-theme-alpine .ag-filter-wrapper {
              z-index: 10004 !important;
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
          <AgGridReact
            ref={gridRef}
            rowData={Array.isArray(employees) ? employees : []}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            onGridReady={onGridReady}
            onGridSizeChanged={onGridSizeChanged}
            onFirstDataRendered={onGridSizeChanged}
            suppressScrollOnNewData={true}
            enableBrowserTooltips={true}
          />
        </div>
      </div>

      {employeeFormPopup.open && (
        <UniversalDialog
          action={{ open: employeeFormPopup.open, fullWidth: true, maxWidth: 'md' }}
          onClose={toggleEmployeeFormPopup}
          title="Register Employee"
          hasPrimaryButton={false}
        >
          <EmployeeRegistration
            onClose={toggleEmployeeFormPopup}
            onRegisterSuccess={refetch}
            existingData={employeeFormPopup.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default EmployeeListing;
