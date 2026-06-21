import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, InputAdornment, Box, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
// import useAuth from 'hooks/useAuth';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import AddPurchaserequestPfForm from 'components/forms/Purchaseflow/AddPurchaserequestPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';
import { FC, useCallback, useMemo, useState } from 'react';
// import StatusChip from 'types/StatusChip';
import { ColDef } from 'ag-grid-community';
import CustomAgGrid from 'components/grid/CustomAgGrid';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface RejectedTab3Props {
  costUser: string | null;
}

const RejectedTab3: FC<RejectedTab3Props> = ({ costUser }) => {
  // const { permissions } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 4000 });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [gridApi, setGridApi] = useState<any>(null);
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Create Purchase Request',
    data: { existingData: {}, isEditMode: false, isViewMode: false, request_number: '' }
  });

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Document No.',
        field: 'document_number',
        valueFormatter: (params: any) => (params.value ? params.value.replace(/\$/g, '/') : '')
      },
      {
        headerName: 'Request Date',
        field: 'request_date',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : '-';
        }
      },
      { headerName: 'Project Name', field: 'project_name' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Document Type', field: 'document_type' },
      {
        headerName: 'Status',
        field: 'status'
        // cellRenderer: (params: any) => <StatusChip status={params.value} />
      },
      {
        headerName: 'Amount',
        field: 'amount',
        cellRenderer: (params: any) => {
          const num = typeof params.value === 'number' ? params.value : parseFloat(params.value);
          return <div className="text-right">{!isNaN(num) ? num.toFixed(2) : '-'}</div>;
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['view'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  const { data: PurchaserequestheaderData, refetch: refetchPurchaserequestheaderData } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () =>
      PfSerivceInstance.getMasters(app, 'Request_Rejected', { page: paginationData.page, rowsPerPage: paginationData.rowsPerPage })
  });

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    if (params.api) {
      params.api.sizeColumnsToFit();
    }
  };

  const onSortChanged = useCallback((params: any) => {
    const sortState = params.api.getColumnState().find((col: any) => col.sort);
    setSearchData((prevData) => ({
      ...prevData,
      sort: sortState ? { field_name: sortState.colId, desc: sortState.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
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

  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // Normalize request_number by replacing delimiters with plain TEXTS
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'View Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        isEditMode: true,
        isViewMode: true,
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

  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    if (actionType === 'view') handleViewPurchaserequestheader(rowOriginal);
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters(
      'pf',
      'purchaserequestheader',
      gridApi?.getSelectedNodes().map((node: any) => node.data.request_number)
    );
    refetchPurchaserequestheaderData();
  };

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    setSearchData((prevData) => ({
      ...prevData,
      search: [[{ field_name: 'global', field_value: value }]] as ISearch['search']
    }));
  };


  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            fullWidth
            onChange={handleGlobalFilterChange}
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
        <Button
          variant="outlined"
          onClick={handleDeletePurchaserequestheader}
          color="error"
          hidden={!gridApi?.getSelectedNodes().length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        {(pathNameList.includes('my_item') || location.pathname.includes('my_item')) && (
          <Button
            startIcon={<PlusOutlined />}
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #082a89, #082a89)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(to right, #1675f2, #1675f2)'
              },
              minWidth: 'auto',
              padding: { xs: '6px 10px', sm: '8px 16px' },
              whiteSpace: 'nowrap'
            }}
            onClick={() => togglePurchaserequestheaderPopup()}
          >
            General Request
          </Button>
        )}
      </div>
      <CustomAgGrid
        rowData={Array.isArray(PurchaserequestheaderData) ? PurchaserequestheaderData : []}
        columnDefs={columnDefs}
        getRowId={(params: any) => params.data?.request_number}
        onSortChanged={onSortChanged}
        suppressRowTransform={true}
        animateRows={false}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
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
          <PurchaseOrderReport
            poNumber={PurchaserequestheaderFormPopup.data.request_number}
            div_code={PurchaserequestheaderFormPopup.data.div_code || ''} // Pass div_code here
            onClose={togglePurchaserequestheaderPopup}
          />
        ) : (
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddPurchaserequestPfForm
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ))}
    </div>
  );
};

export default RejectedTab3;
