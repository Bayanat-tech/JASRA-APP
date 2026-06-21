import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';
import useAuth from 'hooks/useAuth';
import { Typography, IconButton, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import HrServiceInstance from 'service/Service.hr';
import MyAgGrid from 'components/grid/MyAgGrid';
import { ColDef } from 'ag-grid-community';
import { TLeaveApproval } from 'pages/Purchasefolder/type/leave-approval-types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import LeaveResumptionForm from './LeaveResumptionForm';
import { DialogPop } from 'components/popup/DIalogPop';
import dayjs from 'dayjs';
import { MoreOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { useIntl } from 'react-intl';
import { isMobile } from 'react-device-detect';

const LeaveResumptionApprovalPage = () => {
  const { user } = useAuth();

  const filter: ISearch = {
    sort: { field_name: 'updated_at', desc: true },
    search: [
      [
        {
          field_name: 'next_action_by',
          field_value: user?.loginid1 ?? '',
          operator: 'exactmatch'
        }
      ]
    ]
  };
  const intl = useIntl();
  const [filterData] = useState<ISearch>(filter);
  const [gridApi, setGridApi] = useState<any>(null);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [, setSearchData] = useState<any>();
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const openMenu = Boolean(anchorEl);

  const sql_string = `
  SELECT *
  FROM VW_HR_LEAVE_REQUEST_FLOW
  WHERE COMPANY_CODE = 'BSG'
  AND ( ACTUAL_RESUME_DATE IS NULL
  AND RESUME_DATE_APPROVED = 'NO'
    AND FINAL_APPROVED = 'YES'
    AND CREATED_BY = '${user?.loginid1}')
OR (ACTUAL_RESUME_DATE IS NOT NULL 
  AND RESUME_DATE_APPROVED = 'NO'
AND FINAL_APPROVED = 'YES' AND
LAST_ACTION = 'SAVEASDRAFT' AND CREATED_BY = '${user?.loginid1}')
`;

  const { data, refetch, isError } = useQuery({
    queryKey: ['Pg_Leave_flow', paginationData, filterData, user?.loginid1, sql_string],
    queryFn: () => HrServiceInstance.executeRawSql(sql_string),
    refetchOnWindowFocus: false
  });

  const { data: editData, refetch: editDataRefetch } = useQuery({
    queryKey: ['edit_leave', selectedRequestNumber],
    queryFn: () =>
      selectedRequestNumber
        ? HrServiceInstance.getMasters('hr', 'Leaveflow_request', undefined, undefined, selectedRequestNumber)
        : Promise.resolve(null),
    enabled: !!selectedRequestNumber
  });

  const exportToExcel = () => {
    if (!gridApi) {
      setSnackbar({ open: true, message: 'Grid is not ready yet', severity: 'error' });
      return;
    }

    try {
      // Get all row data
      const rowData: any[] = [];
      gridApi.forEachNodeAfterFilterAndSort((node: any) => {
        rowData.push(node.data);
      });

      if (rowData.length === 0) {
        setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
        return;
      }

      // Get column definitions
      const columnDefs = gridApi.getColumnDefs();

      // Create data with proper headers
      const exportData = rowData.map((row: any) => {
        const exportedRow: any = {};
        columnDefs.forEach((col: any) => {
          if (col.field && col.headerName) {
            exportedRow[col.headerName] = row[col.field];
          }
        });
        return exportedRow;
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Resumption Approvals');

      // Generate file name
      const fileName = `Leave_Resumption_Approvals_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}`;

      // Export to Excel
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      setSnackbar({ open: true, message: 'Exported to Excel successfully', severity: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuAction = (action: string) => {
    if (action === 'export') {
      exportToExcel();
    }
    handleMenuClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditHR = (requestNumber: string) => {
    setSelectedRequestNumber(requestNumber);
    setShowFormDialog(true);
  };

  const handleActions = useCallback((actionType: string, row: TLeaveApproval) => {
    if (actionType === 'edit') {
      handleEditHR(row.REQUEST_NUMBER);
      editDataRefetch();
    }
  }, []);

  const columnDefs = useMemo<ColDef<TLeaveApproval>[]>(
    () => [
      {
        headerName: intl.formatMessage({ id: 'No.' }) || 'No.',
        field: 'REQUEST_NUMBER',
        width: 50,
        cellStyle: {
          fontSize: '12px',
          textAlign: 'center'
        } as any,
        minWidth: 140,
        suppressMenu: true,
        sortable: false,
        filter: false
      },
      {
        headerName: intl.formatMessage({ id: 'Request Date' }) || 'Request Date',
        field: 'REQUEST_DATE',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        sortable: false,
        filter: false
      },

      {
        headerName: intl.formatMessage({ id: 'Employee Name' }) || 'Employee Name',
        field: 'EMPLOYEE_NAME_DISPLAY',
        width: 120,
        minWidth: 220,
        cellStyle: { fontSize: '12px' },
        sortable: false,
        filter: false
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type',
        field: 'LEAVE_TYPE_DESC',
        sortable: false,
        filter: false,
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' }
      },

      {
        headerName: intl.formatMessage({ id: 'Leave Start Date' }) || 'Leave Start Date',
        field: 'LEAVE_START_DATE',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        sortable: false,
        filter: false
      },

      {
        headerName: intl.formatMessage({ id: 'Leave End Date' }) || 'Leave End Date',
        field: 'LEAVE_END_DATE',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        sortable: false,
        filter: false
      },
      {
        headerName: intl.formatMessage({ id: 'Actual Resume Date' }) || 'Actual Resume Date',
        field: 'ACTUAL_RESUME_DATE',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 140,
        minWidth: 180,
        cellStyle: { fontSize: '12px' },
        sortable: false,
        filter: false
      },
      {
        headerName: intl.formatMessage({ id: 'Duty Resume Date' }) || 'Duty Resume Date',
        field: 'DUTY_RESUME_DATE',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 140,
        minWidth: 180,
        cellStyle: { fontSize: '12px' },
        sortable: false,
        filter: false
      },
    {
        headerName: intl.formatMessage({ id: 'Remarks' }) || 'Remarks',

        field: 'REMARKS',
        sortable: false,
        filter: false,
           width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' }
      },
      
      {
        headerName: intl.formatMessage({ id: 'Next Action By' }) || 'Next Action By',
        field: 'NEXT_ACTION_BY_NAME',
        sortable: false,
        filter: false,
        width: 120,
        minWidth: 220,
        cellStyle: { fontSize: '12px' }
      },

    

      {
        headerName: intl.formatMessage({ id: 'Actions' }) || 'Actions',
        pinned: 'right',
        width: 100,
        sortable: false,
        filter: false,
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: { data: TLeaveApproval }) => (
          <ActionButtonsGroup buttons={['edit']} handleActions={(action) => handleActions(action, params.data)} />
        )
      }
    ],
    [handleActions]
  );

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const onFilterChanged = useCallback((event: any) => {
    const filterModel = event.api.getFilterModel();
    const filters: any[] = [];

    Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
      if (value.filter || value.value) {
        filters.push([
          {
            field_name: field,
            field_value: value.filter || value.value,
            operator: 'equals'
          }
        ]);
      }
    });

    setSearchData((prev: any) => ({
      ...prev,
      search: filters.length > 0 ? filters : [[]]
    }));
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    setPaginationData({
      page: params.api.paginationGetCurrentPage(),
      rowsPerPage: params.api.paginationGetPageSize()
    });
  }, []);

  const onSortChanged = useCallback((params: any) => {
    const sortedColumn = params?.columnApi?.getColumnState()?.find((col: any) => col.sort);
    setSearchData((prev: any) => ({
      ...prev,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 8,
            zIndex: 2
          }}
        >
          <IconButton
            aria-label="more"
            aria-controls={openMenu ? 'packing-more-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleMenuClick}
            size="small"
            sx={{
              background: '#fff',
              boxShadow: 1,
              border: '1px solid #e0e0e0',
              '&:hover': { background: '#f5f5f5' }
            }}
          >
            <MoreOutlined />
          </IconButton>
          <Menu
            id="packing-more-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleMenuAction('export')}>{intl.formatMessage({ id: 'Export' }) || 'Export'}</MenuItem>

            <MenuItem onClick={() => handleMenuAction('Print')}>{intl.formatMessage({ id: 'Print' }) || 'Print'}</MenuItem>
          </Menu>
        </div>

        <MyAgGrid
          height="480px"
          rowHeight={25}
          headerHeight={30}
          rowData={data || []}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          onSortChanged={onSortChanged}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 50, 100, 1000]}
          pagination
        />
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {isError && <Typography color="error">Error loading leave approval data.</Typography>}

      {showFormDialog && (
        <DialogPop
          onClose={() => {
            setShowFormDialog(false);
            setSelectedRequestNumber(null);
          }}
          open={showFormDialog}
          title={
            selectedRequestNumber
              ? intl.formatMessage({ id: 'Edit Leave Request' }) || 'Edit Leave Request'
              : intl.formatMessage({ id: 'Leave Request Form' }) || 'Leave Request Form'
          }
           width={isMobile ? '90%' : '65%'}
        >
          <LeaveResumptionForm
            data={(editData?.tableData?.[0] as TLeaveApproval) ?? null}
            onClose={() => setShowFormDialog(false)}
            onSuccess={() => {
              setShowFormDialog(false);
              refetch();
              editDataRefetch();
            }}
          />
        </DialogPop>
      )}
    </div>
  );
};

export default LeaveResumptionApprovalPage;
