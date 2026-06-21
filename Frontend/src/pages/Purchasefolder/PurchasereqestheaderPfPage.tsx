import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
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
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

const PurchaserequestheaderPfPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [costUser, setCostUser] = useState(null);
  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request',
    data: { existingData: {}, isEditMode: false, isViewMode: false, request_number: '' } // Default request_number
  });

  const columns = useMemo<ColumnDef<TVPurchaserequestheader>[]>(
    () => [
      {
        accessorFn: (row) => row.document_number,
        id: 'document_number',
        header: () => <span>Document Number</span>
      },
      {
        accessorFn: (row) => row.request_date,
        id: 'request_date',
        header: () => <span>Request Date</span>
      },
      {
        accessorFn: (row) => row.flow_code,
        id: 'flow_code',
        header: () => <span>Flow Code</span>
      },
      {
        accessorFn: (row) => row.project_name,
        id: 'project_name',
        header: () => <span>Project Name</span>
      },
      {
        accessorFn: (row) => row.amount,
        id: 'Amount',
        header: () => <span>Amount</span>
      },
      {
        accessorFn: (row) => row.document_type,
        id: 'document_type',
        header: () => <span>Document Type</span>
      },
      {
        accessorFn: (row) => row.flow_level_running,
        id: 'flow_level_running',
        header: () => <span>flow_level_running</span>
      },
      {
        accessorFn: (row) => row.sendback_histry,
        id: 'sendback_histry',
        header: () => <span>Send Back Reason</span>
      },
      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const { user } = useAuth();
  // const username = user?.loginid;
  console.log('s', searchData);
  //----------- useQuery--------------

  const children = permissions?.[app.toUpperCase()]?.children || {}; // Ensure it's always an object

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  console.log('Resolved Module Key:', moduleKey);

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  console.log('Permission Check:', permissionCheck);

  const isQueryEnabled = Boolean(permissionCheck); // ✅ Ensures strict boolean value
  console.log('Final Enabled Value:', isQueryEnabled);

  const {
    data: PurchaserequestheaderData,
    isFetching: isPurchaserequestheaderFetchLoading,
    refetch: refetchPurchaserequestheaderData
  } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'my_task', paginationData, searchData),
    enabled: isQueryEnabled, // ✅ Now always a boolean
    staleTime: 10000
  });
  console.log('pur', PurchaserequestheaderData);
  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // Normalize request_number by replacing delimiters with plain text
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'Edit Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        isEditMode: true,
        request_number: existingData.request_number // Pass the original request_number
      }
    }));
  };
  const handleViewPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    // Normalize request_number by replacing delimiters with plain text
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'View Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title,
      data: {
        // isEditMode: false,
        isViewMode: true,
        request_number: existingData.request_number, // Pass the original request_number
        title: title
      }
    }));
  };

  const togglePurchaserequestheaderPopup = () => {
    const isClosing = PurchaserequestheaderFormPopup.action.open;

    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      // Only reset data when closing, not when opening
      data: isClosing ? { isEditMode: false, existingData: {}, request_number: '' } : prev.data,
      action: { ...prev.action, open: !prev.action.open },
      // Set title based on edit mode (if opening)
      title: !isClosing && prev.data.isEditMode ? 'Edit Purchase Request Header' : 'Create Purchase Request'
    }));

    if (isClosing) {
      refetchPurchaserequestheaderData();
    }
  };

  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    if (actionType === 'edit') {
      console.log('editcalled');
      handleEditPurchaserequestheader(rowOriginal);
    } else if (actionType === 'view') {
      console.log('viewcalled');
      handleViewPurchaserequestheader(rowOriginal);
    }
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters('pf', 'purchaserequestheader', Object.keys(rowSelection));
    setRowSelection({});
    refetchPurchaserequestheaderData();
  };

  //------------------useEffect----------------
  useEffect(() => {
    const fetchCostUser = async () => {
      if (!user) return; // Ensure user is defined before accessing properties

      try {
        const result = await GmPfServiceInstance.CheckCostcontroller(user.loginid, user.company_code);
        setCostUser(result);
      } catch (error) {
        console.error('Error fetching costUser:', error);
      }
    };

    fetchCostUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.loginid, user?.company_code]); // Optional chaining prevents errors

  useEffect(() => {
    setToggleFilter(null as any);
    return () => { };
  }, []);

  //----------------Filter and sorting ----------------
  const handleFilterChange = (value: ISearch['search']) => {
    setSearchData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };

  const handleSortingChange = (sorting: SortingState) => {
    setSearchData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };

  console.log('titles', PurchaserequestheaderFormPopup.title);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outlined"
          onClick={handleDeletePurchaserequestheader}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button
          startIcon={<PlusOutlined />}
          variant="contained"
          sx={{
            background: 'linear-gradient(to right, #082a89, #082a89)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(to right, #1675f2, #1675f2)'
            }
          }}
          onClick={() => togglePurchaserequestheaderPopup()}
        >
          General Request
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="request_number"
        data={PurchaserequestheaderData?.tableData || []}
        columns={columns}
        count={PurchaserequestheaderData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isPurchaserequestheaderFetchLoading}
        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        hasPagination={true}
      />
      {PurchaserequestheaderFormPopup.action.open && (
        <>
          {/* For BUDGET requests or when costUser is YES */}
          {costUser === 'YES' &&
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
            /* For PO requests */
            <PurchaseOrderReport
              poNumber={PurchaserequestheaderFormPopup.data.request_number}
              div_code={PurchaserequestheaderFormPopup.data.div_code || ''} // Pass div_code here
              onClose={togglePurchaserequestheaderPopup}
            />
          ) : (
            /* Default case - use FullDialog for AddPurchaserequestPfForm */
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
          )}
        </>
      )}
    </div>
  );
};

export default PurchaserequestheaderPfPage;
