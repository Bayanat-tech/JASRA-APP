/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, TextField, Box, InputAdornment, Modal } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
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

import { showAlert } from 'store/CustomAlert/alertSlice'; // adjust path as needed
import { FC } from 'react';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useDispatch } from 'store'; // adjust this path based on your folder structure

import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { Result } from 'antd';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface PonotgeneratedProps {
  costUser: string | null;
  userlevel?: number;
}

const Ponotgenerated: FC<PonotgeneratedProps> = ({ costUser, userlevel }) => {
  console.log('Userlevel in after sending:', userlevel);
  //--------------constants----------
  const { permissions, user_permission, user } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const [createPR, setCreatePR] = useState<boolean>(false);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 1000 });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  // const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelRequestNumber, setCancelRequestNumber] = useState('');
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request',
    data: { existingData: {}, isViewMode: true, isEditMode: false, request_number: '' } // Default request_number
  });
  const [cancelPopup, setCancelPopup] = useState<TUniversalDialogProps & { isPORequest: boolean }>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Cancel Request',
    data: { request_number: '', remarks: '' },
    isPORequest: false // ✅ important
  });

  const [gridApi, setGridApi] = useState<any>(null);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Document No.',
        field: 'document_number',
        valueFormatter: (params: any) => (params.value ? params.value.replace(/\$/g, '/') : ''),
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Request Date',
        field: 'request_date',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : '-';
        },
        cellStyle: { fontSize: '12px' }
      },
      { headerName: 'Project Name', field: 'project_name', cellStyle: { fontSize: '12px' } },
      { headerName: 'Description', field: 'description', cellStyle: { fontSize: '12px' } },
      { headerName: 'Document Type', field: 'document_type', cellStyle: { fontSize: '12px' } },
      { headerName: 'Status', field: 'status', cellStyle: { fontSize: '12px' } },
      // { headerName: 'Company Name', field: 'company_name' },

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
          const actionButtons: TAvailableActionButtons[] = ['view']; // default action button

          if (userlevel === 3 && params.data.document_type === 'Purchase Request') {
            actionButtons.push('view');
          }

          if (userlevel === 5 && params.data.document_type === 'Purchase Request') {
            actionButtons.push('cancel');
          }

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    [userlevel]
  );

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const onSortChanged = useCallback((params: any) => {
    const sortModel = params.api.getServerSideSortModel?.() || [];
    setSearchData((prevData) => ({
      ...prevData,
      sort:
        sortModel.length > 0
          ? { field_name: sortModel[0].colId, desc: sortModel[0].sort === 'desc' }
          : { field_name: 'updated_at', desc: true }
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

  const children = permissions?.[app.toUpperCase()]?.children || {};

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  console.log('Permission Check:', permissionCheck);

  const {
    data: PurchaserequestheaderData,
    // isFetching: isPurchaserequestheaderFetchLoading,
    refetch: refetchPurchaserequestheaderData
  } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () =>
      PfSerivceInstance.getMasters(app, 'ponotgenerated', { page: paginationData.page, rowsPerPage: paginationData.rowsPerPage })
  });
console.log('PurchaserequestheaderData', PurchaserequestheaderData)
  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // Normalize request_number by replacing delimiters with plain text
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'View Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        isEditMode: true,
        isViewMode: true,
        request_number: existingData.request_number // Pass the original request_number
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

  const handleCancelRemarksChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCancelPopup((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        remarks: e.target.value
      }
    }));
  };

  const handleCancelPopupOpen = (request_number: string) => {
    setCancelRequestNumber(request_number);
    setCancelModalOpen(true);
  };
  const handleActions = async (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    const REQUEST_NUMBER = rowOriginal.request_number;
    console.log('Action Type:', actionType);
    console.log('REQUEST_NUMBER:', REQUEST_NUMBER);

    switch (actionType) {
      case 'view':
        handleViewPurchaserequestheader(rowOriginal);
        break;
      case 'cancel':
        console.log('Action Type:', actionType);
        console.log('REQUEST_NUMBER:', REQUEST_NUMBER);
        if (REQUEST_NUMBER.includes('$PR$')) {
          console.log('Valid PR - opening cancel popup');
          handleCancelPopupOpen(REQUEST_NUMBER);
        } else {
          console.log('Invalid PR request number format');
        }
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

  const handleCancelPopupClose = () => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' },
      isPORequest: false
    }));
  };

  // useEffect(() => {
  //   setToggleFilter(null as any);
  //   return () => {};
  // }, []);

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    setSearchData((prevData) => ({
      ...prevData,
      search: [[{ field_name: 'global', field_value: value }]] as ISearch['search']
    }));
  };

  const dispatch = useDispatch();
  const handleAlert = async () => {
    let popupMessage: string | null = null;
    let severity: 'success' | 'info' | 'warning' | 'error' = 'success';

    try {
      if (!user?.loginid || !user?.company_code) {
        console.error('User information is incomplete. Cannot fetch message box.');
        return;
      }
      const messageBoxData = await GmPfServiceInstance.Fetchmessagebox(user?.loginid, user?.company_code);

      if (messageBoxData && messageBoxData.length > 0) {
        const box = messageBoxData[0] as any;
        popupMessage = box.MESSAGE_BOX ?? 'Records saved successfully!';
        severity = (box.MESSAGE_TYPE?.toLowerCase() as typeof severity) ?? 'success';
      } else {
        popupMessage = 'Contact Help desk for checking Message!';
      }

      dispatch(
        showAlert({
          severity,
          message: popupMessage ?? '',
          open: true
        })
      );
    } catch (error) {
      console.error('Error fetching alert message:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while fetching the alert message.',
          open: false
        })
      );
    }
  };

  const handleCancelSubmit = async (cancelRequestNumber: string) => {
    //  const { request_number } = cancelPopup.data;

    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';

    try {
      console.log('Calling cancelFinalApproval API...');
      await GmPfServiceInstance.cancelFinalApproval(COMPANY_CODE, cancelRequestNumber, loginid);
      console.log('cancelFinalApproval API called successfully');

      await handleAlert();
      handleCancelPopupClose();
      refetchPurchaserequestheaderData();
    } catch (error) {
      console.error('Error while calling cancelFinalApproval:', error);
      alert('Failed to cancel the request. Please try again.');
    }
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
        {pathNameList.includes('my_item') && (
          <Button
            startIcon={<PlusOutlined />}
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #082a89, #082a89)',
              minWidth: 'auto',
              padding: { xs: '6px 10px', sm: '8px 16px' },
              whiteSpace: 'nowrap',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(to right, #1675f2, #1675f2)'
              }
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
        onGridReady={onGridReady}
        onSortChanged={onSortChanged}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        paginationPageSize={1000}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
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
        ) : PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.includes('/PR/') ? (
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

      {cancelPopup.action.open && (
        <UniversalDialog
          action={{ ...cancelPopup.action }}
          onClose={handleCancelPopupClose}
          title={cancelPopup.title}
          hasPrimaryButton={true}
          primaryButonTitle="Submit"
          onSave={(arg0?: string) => {
            if (cancelPopup.data.request_number) {
              handleCancelSubmit(cancelPopup.data.request_number);
            }
          }}
        >
          <div>
            <TextField label="Remarks" value={cancelPopup.data.remarks} onChange={handleCancelRemarksChange} fullWidth multiline rows={4} />
            {cancelPopup.isPORequest && (
              <FormControlLabel
                control={
                  <Checkbox checked={createPR} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatePR(e.target.checked)} />
                }
                label="Create PR"
              />
            )}
          </div>
        </UniversalDialog>
      )}

      {cancelModalOpen && (
        <Modal
          open={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          aria-labelledby="cancel-modal-title"
          aria-describedby="cancel-modal-description"
          className="flex items-center justify-center p-4"
        >
          <Result
            className="bg-white rounded-lg shadow-xl p-6"
            extra={
              <>
                <h4 className="mb-4 text-bold">Are you sure you want to cancel Final Approved?</h4>
                <h3 className="mb-4 text-bold text-gray-700">Request Number: {cancelRequestNumber}</h3>

                <div className="flex justify-center gap-3">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleCancelSubmit(cancelRequestNumber);
                      setCancelModalOpen(false);
                    }}
                  >
                    Yes, Cancel
                  </Button>
                  <Button variant="outlined" onClick={() => setCancelModalOpen(false)}>
                    No
                  </Button>
                </div>
              </>
            }
          />
        </Modal>
      )}
    </div>
  );
};

export default Ponotgenerated;
