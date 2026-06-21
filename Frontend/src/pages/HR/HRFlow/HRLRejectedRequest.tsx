import dayjs from 'dayjs';
import { Typography, IconButton, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { FC } from 'react';
import HrServiceInstance from 'service/Service.hr';
import MyAgGrid from 'components/grid/MyAgGrid';
import { ColDef } from 'ag-grid-community';
import { TLeaveApproval } from 'pages/Purchasefolder/type/leave-approval-types';
import AddLeaveApprovalForm from 'pages/HR/HRFlow/AddLeaveApprovalForm';
import { DialogPop } from 'components/popup/DIalogPop';
import { MoreOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import * as XLSX from 'xlsx';
import useScreenSize from 'hooks/useScreenSize';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface HRLRejectedRequestProps { }

const HRLRejectedRequest: FC<HRLRejectedRequestProps> = ({ }) => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const [gridApi, setGridApi] = useState<any>(null);
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 50 });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState<string | null>(null);
  const { user } = useAuth();
  const [filterData] = useState<ISearch>(filter);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const openMenu = Boolean(anchorEl);
  const { isMobile } = useScreenSize();

  const intl = useIntl();

  const exportToExcel = () => {
    if (!gridApi) {
      setSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'Grid is not ready yet' }) || 'Grid is not ready yet',
        severity: 'error',
      });
      return;
    }

    try {
      // Get all row data
      const rowData: any[] = [];
      gridApi.forEachNodeAfterFilterAndSort((node: any) => {
        rowData.push(node.data);
      });

      if (rowData.length === 0) {
        setSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'No data to export' }) || 'No data to export',
          severity: 'warning',
        });
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
      XLSX.utils.book_append_sheet(wb, ws, 'Rejected Leave Requests');

      // Generate file name
      const fileName = `Rejected_Leave_Requests_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}`;

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
        field: 'LEAVE_TYPE',
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
          <ActionButtonsGroup buttons={['view']} handleActions={(action) => handleActions(action, params.data)} />
        )
      }
    ],
    []
  );

  const onSortChanged = useCallback((params: any) => {
    if (!params?.api) return;
    try {
      const sortModel = params.api.getSortModel();
      setSearchData((prevData) => ({
        ...prevData,
        sort:
          sortModel?.length > 0
            ? { field_name: sortModel[0].colId, desc: sortModel[0].sort === 'desc' }
            : { field_name: 'updated_at', desc: true }
      }));
    } catch (error) {
      // Fallback to default sort
      setSearchData((prevData) => ({
        ...prevData,
        sort: { field_name: 'updated_at', desc: true }
      }));
    }
  }, []);
  const onFilterChanged = useCallback((event: any) => {
    const filterModel = event.api.getFilterModel();
    const filters: ISearch['search'] = Object.entries(filterModel).map(([field, value]: [string, any]) => [
      {
        field_name: field,
        field_value: value.filter || value.value,
        operator: 'equals'
      }
    ]);
    setSearchData((prevData) => ({
      ...prevData,
      search: filters.length > 0 ? filters : [[]]
    }));
  }, []);
  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);
  const children = permissions?.[app.toUpperCase()]?.children || {};
  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  const isQueryEnabled = Boolean(permissionCheck);

  const {
    data: HRLRejectedRequestData,
    refetch,
    isError
  } = useQuery({
    queryKey: ['HRLRejectedRequestData', searchData, paginationData],
    queryFn: () => HrServiceInstance.getMasters('hr', 'Pg_leave_flow_Rejected', paginationData, filterData, user?.loginid1),
    enabled: isQueryEnabled
  });

  const { data: editData } = useQuery({
    queryKey: ['edit_leave', selectedRequestNumber],
    queryFn: () =>
      selectedRequestNumber
        ? HrServiceInstance.getMasters('hr', 'Leaveflow_request', undefined, undefined, selectedRequestNumber)
        : Promise.resolve(null),
    enabled: !!selectedRequestNumber
  });

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const handleActions = useCallback((actionType: string, row: TLeaveApproval) => {
    if (actionType === 'view') {
      handleEditHR(row.REQUEST_NUMBER);
      setViewMode(true);
    }
  }, []);

  const handleEditHR = (requestNumber: string) => {
    setSelectedRequestNumber(requestNumber);
    setShowFormDialog(true);
  };

  useEffect(() => {
    return () => { };
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
              border: '1px solid ',
              borderColor: 'grey.300',
              '&:hover': { background: 'grey.100' }
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
            <MenuItem onClick={() => handleMenuAction('export')}>
              {intl.formatMessage({ id: 'Export' }) || 'Export'}
            </MenuItem>

            <MenuItem onClick={() => handleMenuAction('print')}>
              {intl.formatMessage({ id: 'Print' }) || 'Print'}
            </MenuItem>
          </Menu>
        </div>

        <MyAgGrid
          rowData={HRLRejectedRequestData?.tableData || []}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          onSortChanged={onSortChanged}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 50, 100]}
          pagination
          height="480px"
          rowHeight={25}
          headerHeight={30}
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

      {isError && (
        <Typography color="error">
          {intl.formatMessage({ id: 'Error loading leave approval data.' }) || 'Error loading leave approval data.'}
        </Typography>
      )}

      {showFormDialog && (
        <DialogPop
          open={true}
          onClose={() => {
            setShowFormDialog(false);
            setSelectedRequestNumber(null);
          }}
          title={
            "View Leave Request"
          }
          width={isMobile ? '90%' : '65%'}
        >
          <AddLeaveApprovalForm
            LeavePage={false}
            viewMode={viewMode}
            disableButtons={true}
            data={
              editData?.tableData && editData.tableData[0]
                ? (editData.tableData[0] as TLeaveApproval)
                : null
            }
            onClose={() => setShowFormDialog(false)}
            onSuccess={() => {
              setShowFormDialog(false);
              refetch();
            }}
          />
        </DialogPop>
      )}
    </div>
  );
};
export default HRLRejectedRequest;
