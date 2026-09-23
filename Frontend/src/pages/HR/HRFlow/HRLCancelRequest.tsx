import dayjs from 'dayjs';
import { Typography, IconButton, Menu, MenuItem, Snackbar, Alert, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback, useRef, FC } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
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

const OPERATOR_MAP: Record<string, string> = {
  contains: 'contains',
  notContains: 'not_contains',
  equals: 'equals',
  notEqual: 'not_equals',
  startsWith: 'starts_with',
  endsWith: 'ends_with',
  greaterThan: 'gt',
  greaterThanOrEqual: 'gte',
  lessThan: 'lt',
  lessThanOrEqual: 'lte',
  inRange: 'between',
  blank: 'is_null',
  notBlank: 'is_not_null'
};

function toSearchClause(field: string, model: any) {
  const type = String(model?.type ?? 'equals');
  const operator = OPERATOR_MAP[type] ?? 'equals';
  let value: any = model?.filter ?? model?.value ?? '';
  if (model?.filterType === 'date') {
    value = type === 'inRange' ? [model.dateFrom, model.dateTo] : model.dateFrom ?? '';
  } else if (model?.filterType === 'number') {
    value = type === 'inRange' ? [model.filter, model.filterTo] : model.filter;
  }
  return { field_name: field, field_value: value, operator };
}

const CACHE_BLOCK_SIZE = 20;
const MASTER = 'Pg_leave_flow_cancel';

interface HRLCancelRequestProps {}

const HRLCancelRequest: FC<HRLCancelRequestProps> = () => {
  const { user, permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const intl = useIntl();
  const { isMobile } = useScreenSize();

  const [gridApi, setGridApi] = useState<any>(null);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });
  const openMenu = Boolean(anchorEl);
  const gridRef = useRef<any>(null);

  /* permission */
  const children = permissions?.[app.toUpperCase()]?.children || {};
  const moduleKey = Object.keys(children).find(
    (k) => k.toLowerCase() === pathNameList[3]?.toLowerCase()
  );
  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  const isQueryEnabled =
    !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

  /* export */
  const exportToExcel = () => {
    if (!gridApi) {
      setSnackbar({ open: true, message: 'Grid is not ready yet', severity: 'error' });
      return;
    }
    try {
      const rowData: any[] = [];
      gridApi.forEachNodeAfterFilterAndSort((n: any) => rowData.push(n.data));
      if (!rowData.length) {
        setSnackbar({ open: true, message: 'No data to export', severity: 'warning' });
        return;
      }
      const columnDefs = gridApi.getColumnDefs();
      const exportData = rowData.map((row: any) => {
        const out: any = {};
        columnDefs.forEach((col: any) => {
          if (col.field && col.headerName) out[col.headerName] = row[col.field];
        });
        return out;
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Canceled Leave Requests');
      XLSX.writeFile(wb, `Canceled_Leave_Requests_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
      setSnackbar({ open: true, message: 'Exported to Excel successfully', severity: 'success' });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    }
  };

  /* menu */
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuAction = (a: string) => {
    if (a === 'export') exportToExcel();
    handleMenuClose();
  };
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  /* row actions */
  const handleActions = useCallback((type: string, row: TLeaveApproval) => {
    if (type === 'view') {
      setSelectedRequestNumber(row.REQUEST_NUMBER);
      setViewMode(true);
      setShowFormDialog(true);
    }
  }, []);

  /* columns */
  const columnDefs = useMemo<ColDef<TLeaveApproval>[]>(
    () => [
      {
        headerName: intl.formatMessage({ id: 'No.' }) || 'No.',
        field: 'REQUEST_NUMBER',
        width: 50,
        minWidth: 140,
        cellStyle: { fontSize: '12px', textAlign: 'center' } as any,
        suppressMenu: true,
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: { filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'] }
      },
      {
        headerName: intl.formatMessage({ id: 'Request Date' }) || 'Request Date',
        field: 'REQUEST_DATE',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (p: any) => {
          const d = dayjs(p.value);
          return d.isValid() ? d.format('DD/MM/YYYY') : 'NA';
        },
        sortable: true,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['inRange', 'equals', 'greaterThan', 'lessThan'],
          comparator: (fd: Date, cv: any) => {
            const c = dayjs(cv);
            if (!c.isValid()) return -1;
            if (c.isSame(fd, 'day')) return 0;
            return c.isBefore(fd) ? -1 : 1;
          }
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Employee Name' }) || 'Employee Name',
        field: 'EMPLOYEE_NAME_DISPLAY',
        width: 120,
        minWidth: 220,
        cellStyle: { fontSize: '12px' },
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type',
        field: 'LEAVE_TYPE_DESC',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Start Date' }) || 'Leave Start Date',
        field: 'LEAVE_START_DATE',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (p: any) => {
          const d = dayjs(p.value);
          return d.isValid() ? d.format('DD/MM/YYYY') : 'NA';
        },
        sortable: true,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['inRange', 'equals', 'greaterThan', 'lessThan'],
          comparator: (fd: Date, cv: any) => {
            const c = dayjs(cv);
            if (!c.isValid()) return -1;
            if (c.isSame(fd, 'day')) return 0;
            return c.isBefore(fd) ? -1 : 1;
          }
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Leave End Date' }) || 'Leave End Date',
        field: 'LEAVE_END_DATE',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (p: any) => {
          const d = dayjs(p.value);
          return d.isValid() ? d.format('DD/MM/YYYY') : 'NA';
        },
        sortable: true,
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: ['inRange', 'equals', 'greaterThan', 'lessThan'],
          comparator: (fd: Date, cv: any) => {
            const c = dayjs(cv);
            if (!c.isValid()) return -1;
            if (c.isSame(fd, 'day')) return 0;
            return c.isBefore(fd) ? -1 : 1;
          }
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Remarks' }) || 'Remarks',
        field: 'REMARKS',
        width: 120,
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: intl.formatMessage({ id: 'Status' }) || 'Status',
        field: 'LAST_ACTION',
        width: 120,
        minWidth: 120,
        cellStyle: { fontSize: '12px' },
        sortable: false,
        filter: false,
        cellRenderer: () => (
          <Chip label="Canceled" size="small" color="error" variant="filled" sx={{ fontWeight: 500 }} />
        )
      },
      {
        headerName: intl.formatMessage({ id: 'Actions' }) || 'Actions',
        pinned: 'right',
        width: 100,
        sortable: false,
        filter: false,
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: { data: TLeaveApproval }) => (
          <ActionButtonsGroup
            buttons={['view']}
            handleActions={(a) => handleActions(a, params.data)}
          />
        )
      }
    ],
    [handleActions, intl.locale, intl.messages]
  );

  /* infinite datasource */
  const datasource = useMemo(
    () => ({
      rowCount: undefined,
      getRows: async (params: any) => {
        if (!isQueryEnabled) {
          params.successCallback([], 0);
          return;
        }
        const pageSize = params.endRow - params.startRow;
        const pageNum = Math.floor(params.startRow / pageSize) + 1;

        const sortModel: any[] = params.sortModel ?? [];
        const sort = sortModel.length
          ? { field_name: sortModel[0].colId, desc: sortModel[0].sort === 'desc' }
          : { field_name: 'REQUEST_DATE', desc: true };

        const filterModel: Record<string, any> = params.filterModel ?? {};
        const search: ISearch['search'] = Object.entries(filterModel).map(([f, m]) => [
          toSearchClause(f, m)
        ]);

        const filterPayload: ISearch = { sort, search: search.length ? search : [[]] };

        try {
          const result = await HrServiceInstance.getMasters(
            'hr',
            MASTER,
            { page: pageNum, rowsPerPage: pageSize },
            filterPayload,
            user?.loginid1
          );
          params.successCallback(result?.tableData ?? [], result?.count ?? 0);
        } catch (e) {
          console.error('Grid fetch failed', e);
          setSnackbar({
            open: true,
            message: 'Error loading leave approval data.',
            severity: 'error'
          });
          params.failCallback();
        }
      }
    }),
    [user?.loginid1, isQueryEnabled]
  );

  /* view fetch */
  const { data: editData } = useQuery({
    queryKey: ['edit_leave', selectedRequestNumber],
    queryFn: () =>
      selectedRequestNumber
        ? HrServiceInstance.getMasters(
            'hr',
            'Leaveflow_request',
            undefined,
            undefined,
            selectedRequestNumber
          )
        : Promise.resolve(null),
    enabled: !!selectedRequestNumber
  });

  return (
    <div className="flex flex-col space-y-2">
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 2, right: 8, zIndex: 2 }}>
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
              border: '1px solid',
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

        {!isQueryEnabled ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            You do not have permission to view this data.
          </Typography>
        ) : (
          <MyAgGrid
            ref={gridRef}
            rowModelType="infinite"
            datasource={datasource}
            columnDefs={columnDefs}
            onGridReady={(p) => {
              setGridApi(p.api);
              p.api.sizeColumnsToFit();
            }}
            cacheBlockSize={CACHE_BLOCK_SIZE}
            maxBlocksInCache={2}
            infiniteInitialRowCount={CACHE_BLOCK_SIZE}
            blockLoadDebounceMillis={400}
            height="480px"
            rowHeight={25}
            headerHeight={30}
          />
        )}
      </div>

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

      {showFormDialog && (
        <DialogPop
          open={true}
          onClose={() => {
            setShowFormDialog(false);
            setSelectedRequestNumber(null);
          }}
          title="View Leave Request"
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
              gridApi?.refreshInfiniteCache();
            }}
          />
        </DialogPop>
      )}
    </div>
  );
};

export default HRLCancelRequest;