import { DeleteOutlined, PlusOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Button, TextField, Box, InputAdornment, useMediaQuery, useTheme, Modal, Checkbox, FormControlLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState, useCallback } from 'react';
import useAuth from 'hooks/useAuth';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { store, useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import AddPurchaserequestPfForm from 'components/forms/Purchaseflow/AddPurchaserequestPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';
import { FC } from 'react';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import UniversalPageMobile from 'components/popup/UniversalPageMobile';
import { Result } from 'antd';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { TDivisionmaster } from './type/division-pf-types';

const filter: ISearch = {
  search: [[]]
};

interface PurchaseRequestTab1Props {
  costUser: string | null;
  userlevel?: number;
}

const PurchaseRequestTab1: FC<PurchaseRequestTab1Props> = ({ costUser, userlevel }) => {
  //--------------constants----------
  const { user } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  // const isItemPage = pathNameList[3]?.toLowerCase() === 'item';
  const app = useSelector((state: any) => state.menuSelectionSlice.app);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 50 });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  // Removed unused toggleFilter state
  const { dispatch } = store;
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [divCode, setDivCode] = useState<string>('');
  const [confirmPO, setConfirmPO] = useState<any>(false);
  const [PoDone, setPoDone] = useState<any>(false);
  const [open, setOpen] = useState<any>(false);
  const [RequestNumber, setRequestNumber] = useState<any>(false);
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Create Purchase Request',
    data: { existingData: {}, isEditMode: false, isViewMode: false, request_number: '' } // Default request_number
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

  // const [PurchaserequestheaderData, setPurchaserequestheaderData] = useState<any>(null);

  // Removed unused gridColumnApi state

  // const defaultColDef = useMemo(
  //   () => ({
  //     sortable: true,
  //     filter: true,
  //     resizable: true,
  //     flex: 1,
  //     minWidth: 100,
  //     floatingFilter: false, // Change to false to hide the floating filter
  //     filterParams: {
  //       buttons: ['reset', 'apply'],
  //       closeOnApply: true
  //     }
  //   }),
  //   []
  // );

  // Memoize stable versions for query keys
  const paginationStable = useMemo(() => ({
    page: paginationData.page,
    rowsPerPage: paginationData.rowsPerPage
  }), [paginationData.page, paginationData.rowsPerPage]);

  const searchStable = useMemo(() =>
    JSON.stringify(searchData.search) +
    (searchData.sort ? `${searchData.sort.field_name}-${searchData.sort.desc}` : ''),
    [searchData.search, searchData.sort]
  );

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





  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Request No.',
        field: 'document_number',
        // flex: 1,
        width: 150,
        filter: 'agTextColumnFilter',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Request Date',
        field: 'request_date',
        width: 150,
        filter: 'agDateColumnFilter',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : '-';
        }
      },
      { headerName: 'Project Name', field: 'project_name', cellStyle: { fontSize: '12px' } },
      { headerName: 'Document Type', field: 'document_type', cellStyle: { fontSize: '12px' } },
      { headerName: 'Description', field: 'description', cellStyle: { fontSize: '12px' } },
      { headerName: 'Reference Doc No.', field: 'reference_doc_no', cellStyle: { fontSize: '12px' } },
      {
        headerName: 'Status',
        field: 'status',
        cellStyle: { fontSize: '12px' }
      },

      {
        headerName: 'Amount',
        field: 'amount',
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const num = typeof params.value === 'number' ? params.value : parseFloat(params.value);
          const formatted = !isNaN(num)
            ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
            : '-';
          return <div className="text-right">{formatted}</div>;
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Sendback History',
        field: 'sendback_histry',
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Actions',
        cellStyle: { fontSize: '12px' },
        field: 'actions',
        cellRenderer: (params: any) => {
          let actionButtons: TAvailableActionButtons[];
          const isPORecord = params.data.request_number?.replace(/\//g, '$')?.includes('PO$');

          if (Number(userlevel) === 5) {
            actionButtons = isPORecord ? ['view', 'add_action', 'cancel'] : ['edit']; // Added 'cancel' for PO records
          } else {
            actionButtons = isPORecord ? ['view'] : ['edit'];
            if ([1, 5].includes(Number(userlevel) ?? 0) && !isPORecord) {
              actionButtons.push('cancel');
            }
          }

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    [userlevel]
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
    } catch (error) {
      console.error('Error in grid initialization:', error);
    }
  };

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

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

    setSearchData((prevData) => ({
      ...prevData,
      search: filters.length > 0 ? filters : [[]]
    }));
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage(); //   REMOVED + 1
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);



  const { data: PurchaserequestheaderData, refetch: refetchPurchaserequestheaderData } = useQuery({
    queryKey: ['Purchaserequestheader_data', paginationStable.page, paginationStable.rowsPerPage, searchStable],
    queryFn: async () => {
      if (!app) {
        return { tableData: [], count: 0 };
      }

      const response = await PfSerivceInstance.getMasters(app, 'my_task', {
        page: paginationStable.page,
        rowsPerPage: paginationStable.rowsPerPage
      });

      console.log('response PurchaserequestheaderData:', response);

      return response ?? { tableData: [], count: 0 }; // Nullish coalescing
    },
    enabled: !!app,
  });

  console.log('PurchaserequestheaderData:', PurchaserequestheaderData);


  // Function to fetch purchase request header data
  // const fetchPurchaserequestheaderData = async () => {

  //   try {
  //     const data = await PfSerivceInstance.getMasters('pf', 'my_task', {
  //       page: paginationStable.page,
  //       rowsPerPage: paginationStable.rowsPerPage,
  //     });
  //     setPurchaserequestheaderData(data);
  //     console.log('PurchaserequestheaderData:', data);
  //   } catch (err) {
  //     console.error('Error fetching purchase request data:', err);
  //   }
  // };

  // // Refetch function (equivalent to refetchPurchaserequestheaderData)
  // const refetchPurchaserequestheaderData = () => {
  //   fetchPurchaserequestheaderData();
  // };

  // // Fetch data on component mount and when dependencies change
  // useEffect(() => {
  //   fetchPurchaserequestheaderData();

  // }, [app, paginationStable.page, paginationStable.rowsPerPage, searchStable]);



  // const handleChangePagination = (page: number, rowsPerPage: number) => {
  //   setPaginationData({ page, rowsPerPage });
  // };

  // const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
  //   const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
  //   const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');

  //   setPurchaserequestheaderFormPopup((prev) => ({
  //     ...prev,
  //     title: prev.title,
  //     action: {
  //       ...prev.action,
  //       open: true // Force open (do not toggle)
  //     },
  //     data: {
  //       ...prev.data,
  //       isEditMode: true,
  //       request_number: existingData.request_number,
  //       title: isBudgetRequest ? 'Budget Request' : 'Purchase Request'
  //     }
  //   }));
  // };

  const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // Normalize request_number by replacing delimiters with plain text
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');

    setDivCode(existingData.div_code || '');
    console.log('Div Code:', existingData.div_code);
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Edit Budget Request' : 'Edit Purchase Request';
    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        // isViewMode: true,
        isEditMode: true,
        true: true,
        request_number: existingData.request_number
      }
    }));
  };

  const togglePurchaserequestheaderPopup = () => {
    const title = userlevel === 2 ? 'Create Budget Request' : 'Create Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      title,
      data: {
        isEditMode: false,
        existingData: {},
        request_number: ''
      },
      action: {
        ...prev.action,
        open: !prev.action.open
      }
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

  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'View Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        isEditMode: false,
        isViewMode: true,
        request_number: existingData.request_number
      }
    }));
  };

  const getPOData = async (request_number: string, actionType: any) => {
    try {
      dispatch(openBackdrop());
      console.log(' getdata1')
      const dataToUpdate = await GmPfServiceInstance.getPONumber(request_number);
      console.log('PO Data retrieved:', dataToUpdate)
      if (!dataToUpdate) {
        return;
      }



      console.log(' getdata2')
      dataToUpdate.last_action = actionType;
      console.log("action_Type")
      console.log("action_Type", actionType)
      console.log('Data to update:', dataToUpdate);
      const response = await GmPfServiceInstance.updatepurchaserorder(dataToUpdate);
      console.log('Update response:', response);
      dispatch(closeBackdrop());
      if (response) {
        setConfirmPO(false);
        setPoDone(true);
        setTimeout(() => {
          setPoDone(false);
        }, 2000);
        refetchPurchaserequestheaderData();
      } else {
        alert('Failed to confirm Purchase Order');
      }
    } catch (error) {
      dispatch(closeBackdrop());
      console.error('Error fetching purchase order:', error);
    }
  };

  const [showSignatureDialog, setShowSignatureDialog] = useState<boolean>(false);

  // Add handleSignatureConfirm function
  const handleSignatureConfirm = async () => {
    if (!RequestNumber || !user?.loginid) {
      console.error('Missing request number or login ID');
      return;
    }

    try {
      const result = await GmPfServiceInstance.updatePrintSignatureInfo(RequestNumber, user.loginid, 'YES');

      if (result) {
        setShowSignatureDialog(false);
        setConfirmPO(true);
      }
    } catch (error) {
      console.error('Error updating signature info:', error);
    }
  };

  // Add handleSignatureDecline function
  const handleSignatureDecline = async () => {
    if (!RequestNumber || !user?.loginid) {
      console.error('Missing request number or login ID');
      return;
    }

    try {
      const result = await GmPfServiceInstance.updatePrintSignatureInfo(RequestNumber, user.loginid, 'NO');

      if (result) {
        setShowSignatureDialog(false);
        setConfirmPO(true);
      }
    } catch (error) {
      console.error('Error updating signature info:', error);
    }
  };

  // Modify handleConfirmPo to show signature dialog first
  const handleConfirmPo = () => {
    setShowSignatureDialog(true);
  };

  const handleActions = async (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    const REQUEST_NUMBER = rowOriginal.request_number?.replace(/\//g, '$');
    console.log('REQUEST_NUMBER (encoded):', REQUEST_NUMBER);

    // To decode it back (replace $ with /)
    const DECODED_REQUEST_NUMBER = REQUEST_NUMBER?.replace(/\$/g, '/');
    console.log('DECODED_REQUEST_NUMBER:', DECODED_REQUEST_NUMBER);
    setRequestNumber(DECODED_REQUEST_NUMBER);

    switch (actionType) {
      case 'view':
        handleViewPurchaserequestheader(rowOriginal);
        break;
      case 'add_action':
        handleConfirmPo();
        break;
      case 'edit':
        handleEditPurchaserequestheader(rowOriginal);
        break;
      case 'cancel':
        // Use handleCancelPopupOpen for both PR and PO cancellations
        const isPORecord = REQUEST_NUMBER?.includes('PO$');
        if (isPORecord) {
          // You might want to set a different title for PO cancellation
          setCancelPopup((prev) => ({
            ...prev,
            title: 'Cancel Purchase Order',
            action: { ...prev.action, open: true },
            data: { request_number: REQUEST_NUMBER, remarks: '' }
          }));
        } else {
          handleCancelPopupOpen(REQUEST_NUMBER);
        }
        break;
    }
  };

  const handleDeletePurchaserequestheader = async () => {
    const selectedNodes = gridApi.getSelectedNodes();
    const selectedIds = selectedNodes.map((node: any) => node.data.request_number);
    await PfSerivceInstance.deleteMasters('pf', 'purchaserequestheader', selectedIds);
    refetchPurchaserequestheaderData();
  };

  const handleCancelRemarksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setCancelPopup((prev) => ({
      ...prev,
      data: { ...prev.data, remarks: value }
    }));
  };

  const [createPR, setCreatePR] = useState<boolean>(false); // Add this near the top with other state declarations

  useEffect(() => {
    // Removed toggleFilter-related logic
    return () => { };
  }, []);

  // const handleFilterChange = (value: ISearch['search']) => {
  //   setSearchData((prevData) => {
  //     return {
  //       ...prevData,
  //       search: value
  //     };
  //   });
  // };

  const handleCancelPopupClose = () => {
    setCancelPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '' }
    }));
  };

  // const handleSortingChange = (sorting: SortingState) => {
  //   setSearchData((prevData) => {
  //     return {
  //       ...prevData,
  //       sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
  //     };
  //   });
  // };

  const handleCancelSubmit = async () => {
    const { request_number, remarks } = cancelPopup.data;

    if (!remarks.trim()) {
      alert('Remarks cannot be empty');
      return;
    }

    const COMPANY_CODE = user?.company_code || '';
    const loginid = user?.loginid || '';
    const createPRValue = createPR ? 'Y' : 'N';

    try {
      dispatch(openBackdrop());

      await GmPfServiceInstance.updatecancelrejectsentback('CANCELLED', request_number, COMPANY_CODE, loginid, '0', remarks, createPRValue);

      refetchPurchaserequestheaderData();
      handleCancelPopupClose();
    } catch (error) {
      console.error('Cancel API failed:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      dispatch(closeBackdrop());
    }
  };

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    setSearchData((prevData) => ({
      ...prevData,
      search: [[{ field_name: 'global', field_value: value }]] as ISearch['search']
    }));
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSelectDivision = (divCode: string) => {
    setDivCode('');
    setDivCode(divCode);
    togglePurchaserequestheaderPopup();
    setOpen(false);
  };

  useEffect(() => {
    console.log('divCode changed:', divCode);
  }, [divCode]);


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

        {showSignatureDialog && (
          <Modal
            open={showSignatureDialog}
            onClose={() => setShowSignatureDialog(false)}
            aria-labelledby="signature-modal-title"
            aria-describedby="signature-modal-description"
            className="flex items-center justify-center p-4"
          >
            <Result
              className="bg-white rounded-lg shadow-xl p-6"
              extra={
                <>
                  <h4 className="mb-2 text-bold">Do you want to include your signature?</h4>
                  <h3 className="mb-2 text-bold">Purchase Order Number : {RequestNumber}</h3>
                  <Button variant="contained" onClick={handleSignatureConfirm}>
                    Yes
                  </Button>
                  <Button variant="outlined" onClick={handleSignatureDecline}>
                    No
                  </Button>
                  <Button variant="outlined" onClick={() => setShowSignatureDialog(false)}>
                    Cancel
                  </Button>
                </>
              }
            />
          </Modal>
        )}

        {confirmPO && (
          <Modal
            open={confirmPO}
            onClose={() => setConfirmPO(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="flex items-center justify-center p-4"
          >
            <Result
              className="bg-white rounded-lg shadow-xl p-6"
              extra={
                <>
                  <h4 className="mb-2 text-bold">Confirm Purchase Order ?</h4>
                  <h3 className="mb-2 text-bold">Purchase Order Number : {RequestNumber}</h3>
                  <Button variant="contained" onClick={() => getPOData(RequestNumber, 'Confirm')}>
                    Confirm
                  </Button>
                  <Button variant="outlined" onClick={() => setConfirmPO(false)}>
                    Close
                  </Button>
                </>
              }
            />
          </Modal>
        )}
        {PoDone && (
          <Modal
            open={PoDone}
            onClose={() => setPoDone(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className="flex items-center justify-center p-4"
          >
            <Result
              className="bg-white rounded-lg shadow-xl p-6"
              status="success"
              title="Purchase Order Confirmed Successfully !"
              extra={
                <>
                  <Button variant="outlined" onClick={() => setPoDone(false)}>
                    OK
                  </Button>
                </>
              }
            />
          </Modal>
        )}

        {/* Division */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-2/4 h-4/6 flex flex-col">
            <div className="flex justify-between items-center mb-4 ">
              <h3 className="text-lg font-bold">Select Division</h3>
              <Button variant="text" onClick={() => setOpen(false)}>
                <CloseCircleFilled />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {(divisionData?.tableData ?? []).map((item, index) => (
                <div>
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg  border-gray-200 mb-2 last:mb-0
                  hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  >
                    <h4 className="text-base font-medium text-[#082a89]">{item.div_name || 'Hello'}</h4>
                    <Button onClick={() => handleSelectDivision(item?.div_code || '')} variant="outlined" size="small">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>

        {(costUser === 'YES' || userlevel === 1 || userlevel === 2) &&
          (pathNameList[3]?.toLowerCase() === 'item' || pathNameList[3]?.toLowerCase() === 'my_item') && (
            <Button
              sx={{
                background: 'linear-gradient(to right, #082a89, #082a89)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(to right, #1675f2, #1675f2)'
                }
              }}
              startIcon={<PlusOutlined />}
              variant="contained"
              // onClick={togglePurchaserequestheaderPopup}
              onClick={() => {
                if (userlevel === 1) {
                  setOpen(true);
                } else if (userlevel === 2) {
                  togglePurchaserequestheaderPopup();
                }
              }}
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
            div_code={PurchaserequestheaderFormPopup.data.div_code || ''}
            onClose={togglePurchaserequestheaderPopup}
          />
        ) : (
          <>
            {isMobile ? (
              <UniversalPageMobile
                action={{ ...PurchaserequestheaderFormPopup.action }}
                onClose={togglePurchaserequestheaderPopup}
                title={PurchaserequestheaderFormPopup.title}
                hasPrimaryButton={false}
              >
                <AddPurchaserequestPfForm
                  divCode={divCode}
                  setDivCode={setDivCode}
                  key={divCode}
                  request_number={PurchaserequestheaderFormPopup.data.request_number}
                  onClose={togglePurchaserequestheaderPopup}
                  isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
                  isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
                  existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
                />
              </UniversalPageMobile>
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
                  key={divCode}
                  request_number={PurchaserequestheaderFormPopup.data.request_number}
                  onClose={togglePurchaserequestheaderPopup}
                  isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
                  isViewMode={PurchaserequestheaderFormPopup.data.isViewMode}
                  existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
                />
              </UniversalDialog>
            )}
          </>
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
          <div className="flex flex-col gap-4">
            <TextField label="Remarks" value={cancelPopup.data.remarks} onChange={handleCancelRemarksChange} fullWidth multiline rows={4} />
            <FormControlLabel control={<Checkbox checked={createPR} onChange={(e) => setCreatePR(e.target.checked)} />} label="Create PR" />
          </div>
        </UniversalDialog>
      )}
    </div>
  );
};

export default PurchaseRequestTab1;