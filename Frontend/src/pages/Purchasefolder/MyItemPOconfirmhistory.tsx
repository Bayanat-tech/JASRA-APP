/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, TextField, Box, InputAdornment } from '@mui/material';
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
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';

import { showAlert } from 'store/CustomAlert/alertSlice'; // adjust path as needed
import { FC } from 'react';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useDispatch } from 'store'; // adjust this path based on your folder structure

import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
// Report imports — same as MyitemPOConfirm
import ReportDialogPage from 'pages/Report/ReportDialogPage';
import PurchaseReportDesign from 'pages/Report/components/PurchaseReportDesign';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface MyitemPOConfirmProps {
  costUser: string | null;
  userlevel?: number;
}

const MyitemPOConfirm: FC<MyitemPOConfirmProps> = ({ costUser, userlevel }) => {
  // PO Report dialog state — same shape as MyitemPOConfirm
  const [handleReportOpen, setHandleReportOpen] = useState({
    open: false,
    poNumber: '',
    divCode: '',
    companyCode: ''
  });

  console.log('Userlevel in after sending:', userlevel);
  //--------------constants----------
  const { permissions, user_permission, user } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const [createPR, setCreatePR] = useState<boolean>(false);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 6000 });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  // const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request',
    data: { existingData: {}, isViewMode: true, isEditMode: false, request_number: '' } // Default request_number
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
  const [divCode, setDivCode] = useState<string>('');

  const [gridApi, setGridApi] = useState<any>(null);

  // Helper: robust PR/PO detection off the (possibly $-delimited) doc number,
  // same pattern used in MyitemPOConfirm — doesn't rely on document_type accuracy.
  const getDocFlags = (rawDocNumber: unknown) => {
    const safeRaw = typeof rawDocNumber === 'string' ? rawDocNumber : '';
    const formattedDocNumber = safeRaw.replace(/\$/g, '/');
    const isPR = /\/PR\//i.test(formattedDocNumber);
    const isPO = /\/PO\//i.test(formattedDocNumber);
    return { formattedDocNumber, isPR, isPO };
  };

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Document No.',
        field: 'document_number',
        valueFormatter: (params: any) => {
          const v = params.value;
          if (typeof v === 'string') return v.replace(/\$/g, '/');
          if (v && typeof v === 'object' && 'message' in v) return String(v.message);
          return '';
        },
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
      {
        headerName: 'Project Name',
        field: 'project_name',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => (typeof params.value === 'string' ? params.value : params.value?.message || '')
      },
      {
        headerName: 'Description',
        field: 'description',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => (typeof params.value === 'string' ? params.value : params.value?.message || '')
      },
      {
        headerName: 'Document Type',
        field: 'document_type',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => (typeof params.value === 'string' ? params.value : params.value?.message || '')
      },
      {
        headerName: 'Status',
        field: 'status',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => (typeof params.value === 'string' ? params.value : params.value?.message || '')
      },
      {
        headerName: 'Reference Doc No.',
        field: 'reference_doc_no',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => (typeof params.value === 'string' ? params.value : params.value?.message || '')
      },
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
        colId: 'prActions',
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const { isPO } = getDocFlags(params.data?.document_number);

          // Only PR / Budget rows get the Actions (view) button — PO rows hide it,
          // same as MyitemPOConfirm's prActions column.
          if (isPO) return null;

          const actionButtons: TAvailableActionButtons[] = ['view']; //default action button

          if (userlevel === 3 && params.data.document_type === 'Purchase Order') {
            actionButtons.push('edit');
          }

          if (userlevel === 5 && params.data.document_type === 'Purchase Order') {
            actionButtons.push('cancel');
          }

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      },
      // PO Report column — only PO rows get the report view button, PR rows hide it.
      {
        headerName: 'PO Report',
        field: 'actions',
        colId: 'poReportActions',
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const { formattedDocNumber, isPR } = getDocFlags(params.data?.document_number);

          if (isPR) return null;

          const divisionCode = params.data?.div_code || params.data?.division_code || '';

          return (
            <div className="flex flex-col gap-1">
              <ActionButtonsGroup
                handleActions={() => {
                  setHandleReportOpen({
                    open: true,
                    poNumber: formattedDocNumber,
                    divCode: divisionCode,
                    companyCode: params.data?.company_code || user?.company_code || ''
                  });
                }}
                buttons={['view']}
              />
            </div>
          );
        }
      }
    ],
    [userlevel, user]
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
    queryFn: () => PfSerivceInstance.getMasters(app, 'po_modify_history', { page: paginationData.page, rowsPerPage: paginationData.rowsPerPage })
  });

  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // 🛑 HARD GUARD: if request_number is not a string, abort
    const rawRequestNumber = existingData?.request_number;
    if (typeof rawRequestNumber !== 'string' || !rawRequestNumber) {
      console.error('Invalid request_number received:', rawRequestNumber);
      return;
    }

    const normalizedRequestNumber = rawRequestNumber.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'View Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => {
      return ({
        action: { ...prev.action, open: !prev.action.open },
        title,
        data: {
          isEditMode: true,
          isViewMode: true,
          request_number: rawRequestNumber
        }
      });
    });
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
    const isPORequest = request_number.includes('PO$');
    setCreatePR(false);
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '' },
      isPORequest
    }));
  };

  const handleActions = async (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    const raw = rowOriginal?.request_number;
    // 🛑 If request_number is an object (like { message }), abort
    if (typeof raw !== 'string') {
      console.error('Invalid request_number in row:', raw);
      return;
    }
    const REQUEST_NUMBER = raw;

    switch (actionType) {
      case 'view':
        handleViewPurchaserequestheader(rowOriginal);
        break;
      case 'cancel':
        if (REQUEST_NUMBER.includes('PO$')) {
          handleCancelPopupOpen(REQUEST_NUMBER);
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
    let popupMessage: string = 'Records saved successfully!';
    let severity: 'success' | 'info' | 'warning' | 'error' = 'success';

    try {
      if (!user?.loginid || !user?.company_code) {
        console.error('User information is incomplete. Cannot fetch message box.');
        return;
      }
      const messageBoxData = await GmPfServiceInstance.Fetchmessagebox(user?.loginid, user?.company_code);

      if (messageBoxData && messageBoxData.length > 0) {
        const box = messageBoxData[0] as any;
        // 🛑 SAFE: Convert whatever comes back into a string
        const rawMessage = box?.MESSAGE_BOX;
        popupMessage =
          typeof rawMessage === 'string'
            ? rawMessage
            : rawMessage?.message
              ? String(rawMessage.message)
              : rawMessage
                ? JSON.stringify(rawMessage)
                : 'Records saved successfully!';

        const rawType = box?.MESSAGE_TYPE;
        const typeStr = typeof rawType === 'string' ? rawType.toLowerCase() : 'success';
        severity = (['success', 'info', 'warning', 'error'].includes(typeStr) ? typeStr : 'success') as typeof severity;
      } else {
        popupMessage = 'Contact Help desk for checking Message!';
      }

      dispatch(showAlert({ severity, message: popupMessage, open: true }));
    } catch (error) {
      console.error('Error fetching alert message:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while fetching the alert message.',
          open: true
        })
      );
    }
  };

  const handleCancelSubmit = async () => {
    const { request_number, remarks } = cancelPopup.data;

    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }

    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    const createPRValue = cancelPopup.isPORequest ? (createPR ? 'Y' : 'N') : 'N';

    try {
      dispatch(openBackdrop());

      await GmPfServiceInstance.updatecancelrejectsentback('CANCELLED', request_number, COMPANY_CODE, loginid, '0', remarks, createPRValue);

      await handleAlert();
      handleCancelPopupClose();
      refetchPurchaserequestheaderData();
    } catch (error) {
      console.error('Cancel request failed:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      dispatch(closeBackdrop());
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
        (() => {
          // 🛑 Safely compute existingData — if it's an error object, use {} instead
          const rawExisting = PurchaserequestheaderFormPopup.data.existingData;
          const safeExistingData =
            rawExisting && typeof rawExisting === 'object' && !Array.isArray(rawExisting) && !('message' in rawExisting) ? rawExisting : {};

          const normalizedRequestNumber = PurchaserequestheaderFormPopup.data.request_number?.replace(/\$/g, '/') || '';
          const isBudget = normalizedRequestNumber.includes('BUDGET');

          if (isBudget || !PurchaserequestheaderFormPopup.data.isEditMode) {
            return (
              <UniversalDialog
                action={{ ...PurchaserequestheaderFormPopup.action }}
                onClose={togglePurchaserequestheaderPopup}
                title={PurchaserequestheaderFormPopup.title}
                hasPrimaryButton={false}
              >
                <AddBudgetrequestPfForm
                  request_number={normalizedRequestNumber}
                  onClose={togglePurchaserequestheaderPopup}
                  isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
                  existingData={safeExistingData}
                />
              </UniversalDialog>
            );
          }

          return (
            <UniversalDialog
              action={{ ...PurchaserequestheaderFormPopup.action }}
              onClose={togglePurchaserequestheaderPopup}
              title={PurchaserequestheaderFormPopup.title}
              hasPrimaryButton={false}
            >
              <AddPurchaserequestPfForm
                            divCode={divCode}
              setDivCode={setDivCode}
  request_number={PurchaserequestheaderFormPopup.data.request_number}   // ✅ raw, e.g. MFS$26$OH012$PR$0025       
           onClose={togglePurchaserequestheaderPopup}
                isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
                isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
                existingData={safeExistingData}
              />
            </UniversalDialog>
          );
        })()}

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
            {cancelPopup.isPORequest && (
              <FormControlLabel
                control={<Checkbox checked={createPR} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatePR(e.target.checked)} />}
                label="Create PR"
              />
            )}
          </div>
        </UniversalDialog>
      )}

      {/* PO Report Dialog — same as MyitemPOConfirm */}
      {handleReportOpen.open && (
        <ReportDialogPage
          Report={PurchaseReportDesign}
          required_values={{
            divCode: handleReportOpen.divCode,
            refDocNo: handleReportOpen.poNumber,
            companyCode: handleReportOpen.companyCode
          }}
          title="Purchase Order"
          onClose={() => setHandleReportOpen({ open: false, poNumber: '', divCode: '', companyCode: '' })}
        />
      )}
    </div>
  );
};

export default MyitemPOConfirm;