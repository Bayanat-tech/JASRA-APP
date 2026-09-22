/* eslint-disable react-hooks/exhaustive-deps */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, TextField, Box, InputAdornment } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
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
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';

import { showAlert } from 'store/CustomAlert/alertSlice'; // adjust path as needed
import { FC } from 'react';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { useDispatch } from 'store'; // adjust this path based on your folder structure

import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import ReportDialogPage from 'pages/Report/ReportDialogPage';
import PurchaseReportDesign from 'pages/Report/components/PurchaseReportDesign';

interface MyitemPOConfirmProps {
  costUser: string | null;
  userlevel?: number;
}

const MyitemPOConfirm: FC<MyitemPOConfirmProps> = ({ costUser, userlevel }) => {
  const [handleReportOpen, setHandleReportOpen] = useState({
    open: false,
    poNumber: '',
    divCode: ''
  });
  console.log('Userlevel in after sending:', userlevel);
  //--------------constants----------
  const { permissions, user_permission, user } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const [createPR, setCreatePR] = useState<boolean>(false);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 6000 });
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
        filter: 'agDateColumnFilter',
        flex: 1,
        // Cell values are strings, AG Grid's default date comparator expects Date objects.
        // Normalise the cell value to midnight (same parsing as valueFormatter) and compare with the filter date.
        filterParams: {
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
        },
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
        headerName: 'Supplier',
        field: 'supplier',
        cellStyle: { fontSize: '12px' },
      },
      { headerName: 'Reference Doc No.', field: 'reference_doc_no', cellStyle: { fontSize: '12px' } },
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
          colId: 'prActions',          // <-- unique id
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['view']; //default action button bold report
        //  const actionButtons: TAvailableActionButtons[] = []; 
        //   if (userlevel === 3 && params.data.document_type === 'Purchase Order') {
        //     actionButtons.push('edit');
        //   }

          if (userlevel === 5 && params.data.document_type === 'Purchase Order') {
            actionButtons.push('cancel');
          }

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      },
      {
        headerName: 'PO Report',
        field: 'actions',
          colId: 'poReportActions',    // <-- unique id, different from above
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['view'];
          return (
              <div className="flex flex-col gap-1">
              <ActionButtonsGroup handleActions={()=>{setHandleReportOpen({ open: true, poNumber: params.data.document_number, divCode: params.data.division_code })}} buttons={actionButtons} /> 
              </div>
        );
        }
      },
    ],
    [userlevel]
  );

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

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
    // Filtering/sorting/search are all client-side (AG Grid), so only pagination belongs in the key.
    queryKey: ['Purchaserequestheader_data', paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'po_modify', { page: paginationData.page, rowsPerPage: paginationData.rowsPerPage })
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
  const REQUEST_NUMBER = rowOriginal.request_number;

  switch (actionType) {
    case 'view':
      handleViewPurchaserequestheader(rowOriginal);
      break;
    case 'edit': {
      const normalizedRequestNumber = REQUEST_NUMBER.replace(/\$/g, '/');
      const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
      const title = isBudgetRequest ? 'Budget Request' : 'Edit Purchase Request';

      setPurchaserequestheaderFormPopup((prev) => ({
        action: { ...prev.action, open: !prev.action.open },
        title,
        data: {
          isEditMode: true,
          isViewMode: false, // false so it's actually editable, not read-only
          request_number: REQUEST_NUMBER
        }
      }));
      break;
    }
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
    // Client-side quick filter across all columns (AG Grid v31+). On older versions use gridApi?.setQuickFilter(value)
    gridApi?.setGridOption('quickFilterText', value);
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
        suppressRowTransform={true}
        animateRows={false}
        onGridReady={onGridReady}
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

      {handleReportOpen.open && (
        <ReportDialogPage
        Report={PurchaseReportDesign}
        required_values={{ divCode: handleReportOpen.divCode, refDocNo: handleReportOpen.poNumber }}
        title="Purchase Order"
        onClose={() => setHandleReportOpen({ open: false, poNumber: '', divCode: '' })}
      />
      )}
    </div>
  );
};

export default MyitemPOConfirm;