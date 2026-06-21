import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, TextField, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import AddPurchaserequestPfForm from 'components/forms/Purchaseflow/AddPurchaserequestPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';
import { FC } from 'react';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { ColDef } from 'ag-grid-community';
// import StatusChip from 'types/StatusChip';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { useLocation } from 'react-router';
import { getPathNameList } from 'utils/functions';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface MyitemPOCancelProps {
  costUser: string | null;
}

const MyitemPOCancel: FC<MyitemPOCancelProps> = ({ costUser }) => {
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);

  const { user } = useAuth();
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 1000 });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [gridApi, setGridApi] = useState<any>(null);
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request',
    data: { existingData: {}, isEditMode: false, isViewMode: false, request_number: '' }
  });
  const [cancelPopup, setCancelPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Cancel Request',
    data: { request_number: '', remarks: '' }
  });

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Document No.',
        field: 'document_number',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => params.value?.replace(/\$/g, '/') || ''
      },
      {
        headerName: 'Request Date',
        field: 'request_date',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : '-';
        }
      },
      { headerName: 'Project Name', field: 'project_name', cellStyle: { fontSize: '12px' } },
      { headerName: 'Description', field: 'description', cellStyle: { fontSize: '12px' } },
      { headerName: 'Document Type', field: 'document_type', cellStyle: { fontSize: '12px' } },
      {
        headerName: 'Cancel Date',
        field: 'updated_at',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : '-';
        }
      },
      {
        headerName: 'Status',
        field: 'status',
        cellStyle: { fontSize: '12px' }
        // cellRenderer: (params: any) => <StatusChip status={params.value} />
      },
      {
        headerName: 'Reference Doc No.',
        field: 'reference_doc_no',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => params.value?.replace(/\$/g, '/') || ''
      },
      {
        headerName: 'Amount',
        field: 'amount',
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const num = typeof params.value === 'number' ? params.value : parseFloat(params.value);
          return <div className="text-right">{!isNaN(num) ? num.toFixed(2) : '-'}</div>;
        },
        cellClass: 'text-right'
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
    []
  );

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const onSortChanged = useCallback((params: any) => {
    const sortState = params.api.getColumnState();
    const sortedColumn = sortState.find((column: any) => column.sort);
    setSearchData((prevData) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
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

  const { data: PurchaserequestheaderData, refetch: refetchPurchaserequestheaderData } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'po_cancel_history', { page: paginationData.page, rowsPerPage: paginationData.rowsPerPage })
  });

  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
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

  const handleCancelPopupOpen = (request_number: string) => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '' }
    }));
  };

  const handleActions = async (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    const REQUEST_NUMBER = rowOriginal.request_number;

    switch (actionType) {
      case 'view':
        handleViewPurchaserequestheader(rowOriginal);
        break;
      case 'cancel':
        handleCancelPopupOpen(REQUEST_NUMBER);
        break;
    }
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters(
      'pf',
      'purchaserequestheader',
      gridApi?.getSelectedNodes().map((node: any) => node.data.request_number)
    );
    refetchPurchaserequestheaderData();
  };

  const handleCancelRemarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCancelPopup((prev) => ({
      ...prev,
      data: { ...prev.data, remarks: value }
    }));
  };

  useEffect(() => {
    return () => {};
  }, []);

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    setSearchData((prevData) => ({
      ...prevData,
      search: [[{ field_name: 'global', field_value: value }]] as ISearch['search']
    }));
  };

  const handleCancelPopupClose = () => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' }
    }));
  };

  const handleCancelSubmit = async () => {
    const { request_number, remarks } = cancelPopup.data;
    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }
    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    await GmPfServiceInstance.updatecancelrejectsentback('CANCELLED', request_number, COMPANY_CODE, loginid, '0', remarks, 'N');
    handleCancelPopupClose();
    refetchPurchaserequestheaderData();
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
        {(pathNameList.includes('my_item') || pathNameList.includes('my_items')) && (
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
        (PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.startsWith('BUDGET') ||
        !PurchaserequestheaderFormPopup.data.isEditMode ? (
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
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ))}
      {cancelPopup.action.open && (
        <UniversalDialog
          action={{ ...cancelPopup.action }}
          onClose={handleCancelPopupClose}
          title={cancelPopup.title}
          hasPrimaryButton={true}
          primaryButonTitle="Submit"
          onSave={handleCancelSubmit}
        >
          <div>
            <TextField label="Remarks" value={cancelPopup.data.remarks} onChange={handleCancelRemarksChange} fullWidth multiline rows={4} />
          </div>
        </UniversalDialog>
      )}
    </div>
  );
};

export default MyitemPOCancel;
