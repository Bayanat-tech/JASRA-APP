import dayjs from 'dayjs';
import { IconButton, Menu, MenuItem, Snackbar, Alert, Typography } from '@mui/material';
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

// AG Grid filter type → backend operator
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

  // Field name is already uppercase in AG Grid (matches backend whitelist)
  return { field_name: field, field_value: value, operator };
}

/** AG Grid cache block size. Must be ≤ backend's maxLimit (100 for InProgress). */
const CACHE_BLOCK_SIZE = 20;

interface HRLInProgressProps {}

const HRLInProgress: FC<HRLInProgressProps> = () => {
  const intl = useIntl();
  const { user, permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
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

  /* ---------------- permission ---------------- */
  const children = permissions?.[app.toUpperCase()]?.children || {};
  const moduleKey = Object.keys(children).find(
    (key) => key.toLowerCase() === pathNameList[3]?.toLowerCase()
  );
  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  const isQueryEnabled =
    !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

  /* ---------------- export ---------------- */
  const exportToExcel = () => {
    if (!gridApi) {
      setSnackbar({ open: true, message: 'Grid is not ready yet', severity: 'error' });
      return;
    }
    try {
      const rowData: any[] = [];
      gridApi.forEachNodeAfterFilterAndSort((node: any) => rowData.push(node.data));

      if (rowData.length === 0) {
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
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Approvals InProgress');
      XLSX.writeFile(wb, `Leave_Approvals_InProgress_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
      setSnackbar({ open: true, message: 'Exported to Excel successfully', severity: 'success' });
    } catch (e) {
      console.error('Export error:', e);
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    }
  };

  /* ---------------- menu ---------------- */
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuAction = (action: string) => {
    if (action === 'export') exportToExcel();
    handleMenuClose();
  };
  const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  /* ---------------- row actions ---------------- */
  const handleActions = useCallback((actionType: string, row: TLeaveApproval) => {
    if (actionType === 'view') {
      setSelectedRequestNumber(row.REQUEST_NUMBER);
      setViewMode(true);
      setShowFormDialog(true);
    }
  }, []);

  /* ---------------- columns (field names = backend whitelist) ---------------- */
  const columnDefs = useMemo<ColDef<TLeaveApproval>[]>(
    () => [
      {
        headerName: intl.formatMessage({ id: 'No.' }) || 'No.',
        field: 'REQUEST_NUMBER',
        minWidth: 140,
        sortable: true,
        filter: 'agTextColumnFilter',
        filterParams: { filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'] },
        cellStyle: { fontSize: '12px', textAlign: 'center' } as any
      },
      {
        headerName: intl.formatMessage({ id: 'Request Date' }) || 'Request Date',
        field: 'REQUEST_DATE',
        minWidth: 150,
        sortable: true,
        filter: 'agDateColumnFilter',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (p: any) => {
          const d = dayjs(p.value);
          return d.isValid() ? d.format('DD/MM/YYYY') : 'NA';
        },
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
        minWidth: 220,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type',
        field: 'LEAVE_TYPE_DESC',
        minWidth: 150,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: intl.formatMessage({ id: 'Leave Start Date' }) || 'Leave Start Date',
        field: 'LEAVE_START_DATE',
        minWidth: 150,
        sortable: true,
        filter: 'agDateColumnFilter',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (p: any) => {
          const d = dayjs(p.value);
          return d.isValid() ? d.format('DD/MM/YYYY') : 'NA';
        },
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
        minWidth: 150,
        sortable: true,
        filter: 'agDateColumnFilter',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (p: any) => {
          const d = dayjs(p.value);
          return d.isValid() ? d.format('DD/MM/YYYY') : 'NA';
        },
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
        minWidth: 150,
        sortable: true,
        filter: 'agTextColumnFilter',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: intl.formatMessage({ id: 'Next Action By' }) || 'Next Action By',
        field: 'NEXT_ACTION_BY_NAME',
        minWidth: 220,
        sortable: true,
        filter: 'agTextColumnFilter',
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
          <ActionButtonsGroup
            buttons={['view']}
            handleActions={(action) => handleActions(action, params.data)}
          />
        )
      }
    ],
    [handleActions, intl.locale, intl.messages]
  );

  /* ---------------- infinite datasource ---------------- */
  const datasource = useMemo(
    () => ({
      rowCount: undefined,
      getRows: async (params: any) => {
        if (!isQueryEnabled) {
          params.successCallback([], 0);
          return;
        }

        const pageSize = params.endRow - params.startRow;      // == cacheBlockSize
        const pageNum = Math.floor(params.startRow / pageSize) + 1;

        // Sort from AG Grid
        const sortModel: any[] = params.sortModel ?? [];
        const sort = sortModel.length
          ? { field_name: sortModel[0].colId, desc: sortModel[0].sort === 'desc' }
          : { field_name: 'REQUEST_DATE', desc: true };

        // Filter from AG Grid
        const filterModel: Record<string, any> = params.filterModel ?? {};
        const search: ISearch['search'] = Object.entries(filterModel).map(([field, model]) => [
          toSearchClause(field, model)
        ]);

        const filterPayload: ISearch = {
          sort,
          search: search.length ? search : [[]]
        };

        try {
            const result = await HrServiceInstance.getMasters(
              'hr',
              'Pg_leave_flow_InProgress',
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

  /* ---------------- view dialog ---------------- */
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
          title={'View Leave Request'}
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

export default HRLInProgress;