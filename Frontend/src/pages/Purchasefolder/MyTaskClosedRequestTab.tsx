import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, TextField, InputAdornment, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import UniversalDialog from 'components/popup/UniversalDialog';
import AddPurchaserequestPfForm from 'components/forms/Purchaseflow/AddPurchaserequestPfForm';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
// import StatusChip from 'types/StatusChip';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';
import { FC } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { PlusOutlined } from '@ant-design/icons';
import { TDivisionmaster } from './type/division-pf-types';

// AG Grid date filter: cell values are strings (not Date objects), so normalise the cell value
// to midnight (same parsing as the column's valueFormatter) before comparing with the filter date.
const dateFilterParams = {
  buttons: ['reset', 'apply'],
  comparator: (filterLocalDateAtMidnight: Date, cellValue: any) => {
    if (!cellValue) return -1;
    const cellDate = dayjs(cellValue);
    if (!cellDate.isValid()) return -1;

    const cellTime = cellDate.startOf('day').valueOf();
    const filterTime = filterLocalDateAtMidnight.getTime();

    if (cellTime === filterTime) return 0;
    return cellTime < filterTime ? -1 : 1;
  }
};

interface MyTaskClosedRequestTabProps {
  costUser: string | null;
}
const MyTaskClosedRequestTab: FC<MyTaskClosedRequestTabProps> = ({ costUser }) => {
  const { permissions, user_permission, user } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 50 });
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [gridApi, setGridApi] = useState<any>(null);
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request',
    data: { existingData: {}, isEditMode: false, isViewMode: false, request_number: '' } // Default request_number
  });
  const [divCode, setDivCode] = useState<string>('');
  const [openCreatePopup, setOpenCreatePopup] = useState(false);
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Document No.',
        field: 'document_number',
        flex: 1,
        filter: 'agTextColumnFilter',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Request Date',
        field: 'request_date',
        flex: 1,
        filter: 'agDateColumnFilter',
        filterParams: dateFilterParams,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : '-';
        },
        cellStyle: { fontSize: '12px' }
      },
      { headerName: 'Project Name', field: 'project_name', cellStyle: { fontSize: '12px' } },
      { headerName: 'Document Type', field: 'document_type', cellStyle: { fontSize: '12px' } },
      // { headerName: 'Company Name', field: 'company_name' },
      { headerName: 'Description', field: 'description', cellStyle: { fontSize: '12px' } },
      {
        headerName: 'Status',
        field: 'status',
        cellStyle: { fontSize: '12px' }
        // cellRenderer: (params: any) => <StatusChip status={params.value} />
      },
      { headerName: 'Assign To', field: 'next_action_by', cellStyle: { fontSize: '12px' } },
      {
        headerName: 'Amount',
        field: 'amount',
        cellRenderer: (params: any) => {
          const num = typeof params.value === 'number' ? params.value : parseFloat(params.value);
          return <div className="text-right">{!isNaN(num) ? num.toFixed(2) : '-'}</div>;
        },
        cellClass: 'text-right',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['view'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const onGridReady = (params: any) => {
    try {
      // Store grid API reference
      setGridApi(params.api);
      // Adjust columns to fit the available width
      params.api.sizeColumnsToFit();
      // Add window resize listener to auto-fit columns
      window.addEventListener('resize', () => {
        setTimeout(() => {
          params.api.sizeColumnsToFit();
        });
      });
      // Set quick filter focus
      params.api.setQuickFilter(globalFilter);
      // Refresh the grid data
      params.api.refreshCells();
    } catch (error) {}
  };

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
  const { data: PurchaserequestheaderData, refetch: refetchPurchaserequestheaderData } = useQuery({
    // Filter/sort/search are client-side (AG Grid), so the key only holds what the API call actually uses,
    // plus the endpoint name so different tabs never share a cache entry.
    queryKey: ['Purchaserequestheader_data', 'My_History', paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'My_History', { page: paginationData.page, rowsPerPage: paginationData.rowsPerPage }),
    enabled: isQueryEnabled
  });
  
  // const { data: divisionData } = useQuery({
  //   queryKey: ['division', app],
  //   queryFn: async () => {
  //     if (!app) return { tableData: [] as TDivisionmaster[], count: 0 };
  //     const resp = await PfSerivceInstance.getMasters(app, 'division');
  //     return resp
  //       ? { tableData: resp.tableData as TDivisionmaster[], count: resp.count }
  //       : { tableData: [] as TDivisionmaster[], count: 0 };
  //   },
  //   enabled: !!app
  // });

  const { data: divisionData } = useQuery({
      queryKey: ['division', app],
      queryFn: async () => {
        if (!app) return { tableData: [], count: 0 };
  
        const response = await PfSerivceInstance.proc_build_dynamic_sql({
          parameter: "division",
          loginid: user?.loginid ?? "",
          code1: user?.company_code ?? "",
          code2: "NULL",
          code3: "NULL",
          code4: "NULL",
          number1: 0,
          number2: 0,
          number3: 0,
          number4: 0,
          date1: null,
          date2: null,
          date3: null,
          date4: null,
        });
  
        // ✔ FIX: response is array → wrap into expected shape
        const tableData = Array.isArray(response) ? response as TDivisionmaster[] : [];
        const count = tableData.length;
  
        return { tableData, count };
      },
      enabled: !!app,
    });


  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // Normalize request_number by replacing delimiters with plain text
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'View Purchase Request';
    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        isViewMode: true,
        isEditMode: true,
        true: true,
        request_number: existingData.request_number
      }
    }));
  };
  const togglePurchaserequestheaderPopup = () => {
    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {}, request_number: '' },
      action: { ...prev.action, open: !prev.action.open }
    }));
    if (PurchaserequestheaderFormPopup.action.open) {
      refetchPurchaserequestheaderData();
    }
  };
  const toggleCreatePopup = useCallback(() => {
    // If opening, ensure divCode is set from best available source
    if (!openCreatePopup) {
      // priority: user's div_code -> existing state -> first division from API -> ''
      const userDiv = user && (user as any).div_code ? (user as any).div_code : '';
      const firstDiv = divisionData?.tableData?.[0]?.div_code || '';
      const resolved = userDiv || divCode || firstDiv || '';
      setDivCode(resolved);
    }
    setOpenCreatePopup((v) => !v);
  }, [openCreatePopup, user, divCode, divisionData]);
  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    if (actionType === 'view') handleViewPurchaserequestheader(rowOriginal);
  };
  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters(
      'pf',
      'purchaserequestheader',
      gridApi?.getSelectedNodes().map((node: any) => node.data.request_number)
    );
    gridApi?.deselectAll();
    refetchPurchaserequestheaderData();
  };
  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    // Client-side quick filter across all columns (AG Grid v31+)
    gridApi?.setGridOption('quickFilterText', value);
  };
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        {pathNameList[3]?.toLowerCase() === 'my_item' && (
          <>
            <Button
              sx={{
                background: 'linear-gradient(to right, #082a89, #082a89)',
                color: '#fff',
                minWidth: 'auto',
                padding: { xs: '6px 10px', sm: '8px 16px' },
                whiteSpace: 'nowrap',
                '&:hover': {
                  background: 'linear-gradient(to right, #1675f2, #1675f2)'
                }
              }}
              startIcon={<PlusOutlined />}
              variant="contained"
              color="primary"
              onClick={toggleCreatePopup}
            >
              General Request
            </Button>
            <Button
              variant="outlined"
              onClick={handleDeletePurchaserequestheader}
              color="error"
              hidden={!gridApi?.getSelectedNodes().length}
              startIcon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </>
        )}
      </div>
      <CustomAgGrid
        rowData={Array.isArray(PurchaserequestheaderData) ? PurchaserequestheaderData : []}
        columnDefs={columnDefs}
        getRowId={(params: any) => params.data?.request_number}
        suppressRowTransform={true}
        animateRows={false}
        onGridReady={onGridReady}
        onPaginationChanged={onPaginationChanged}
        pagination
        paginationPageSize={6000}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000, 2000, 4000, 6000]}
      />
      {PurchaserequestheaderFormPopup.action.open &&
        (costUser === 'YES' &&
        (PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.startsWith('BUDGET') ||
          !PurchaserequestheaderFormPopup.data.isEditMode) ? (
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddBudgetrequestPfForm
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ) : PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.includes('PO$') ? (
          <PurchaseOrderReport poNumber={PurchaserequestheaderFormPopup.data.request_number} onClose={togglePurchaserequestheaderPopup} />
        ) : (
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddPurchaserequestPfForm
              divCode={divCode}
              setDivCode={setDivCode}
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ))}
      {openCreatePopup && (
        <UniversalDialog
          action={{ open: openCreatePopup, fullWidth: true, maxWidth: 'lg' }}
          onClose={toggleCreatePopup}
          title="Create Purchase Request"
          hasPrimaryButton={false}
        >
          <AddPurchaserequestPfForm
            divCode={divCode}
            setDivCode={setDivCode}
            request_number={''}
            onClose={() => {
              toggleCreatePopup();
            }}
            isEditMode={false}
            isViewMode={false}
            existingData={{} as any}
          />
        </UniversalDialog>
      )}
    </div>
  );
};
export default MyTaskClosedRequestTab;