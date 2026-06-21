import { DeleteOutlined } from '@ant-design/icons';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
import StatusChip from 'types/StatusChip';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';
import { FC } from 'react';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

interface ClosedRequestTab2Props {
  costUser: string | null;
}

const ClosedRequestTab2: FC<ClosedRequestTab2Props> = ({ costUser }) => {
  //--------------constants----------
  const { permissions } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Purchase Request Header',
    data: { existingData: {}, isEditMode: false, isViewMode: false, request_number: '' } // Default request_number
  });

  const columns = useMemo<ColumnDef<TVPurchaserequestheader>[]>(
    () => [
      // {
      //   id: 'select-col',
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={table.getIsAllRowsSelected()}
      //       indeterminate={table.getIsSomeRowsSelected()}
      //       onChange={table.getToggleAllRowsSelectedHandler()}
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
      //   )
      // },
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
        accessorFn: (row) => row.project_name,
        id: 'project_name',
        header: () => <span>Project Name</span>
      },
      {
        accessorFn: (row) => row.document_type,
        id: 'document_type',
        header: () => <span>Document Type</span>
      },
      {
        accessorFn: (row) => row.description,
        id: 'description',
        header: () => <span>Flow Code</span>
      },

      {
        accessorFn: (row) => row.amount,
        id: 'Amount',
        header: () => <span>Amount</span>
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <span>Status</span>,
        cell: ({ row }) => <StatusChip status={row.original.status} />
      },
      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = row.original.document_type === 'Purchase Order' ? ['view', 'cancel'] : ['view'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // const username = user?.loginid;
  console.log('s', searchData);
  //----------- useQuery--------------

  const children = permissions?.[app.toUpperCase()]?.children || {}; // Ensure it's always an object

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  console.log('Resolved Module Key:', moduleKey);

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  // const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  // console.log('Permission Check:', permissionCheck);

  // const isQueryEnabled = Boolean(permissionCheck); // ✅ Ensures strict boolean value
  // console.log('Final Enabled Value:', isQueryEnabled);

  const {
    data: PurchaserequestheaderData,
    isFetching: isPurchaserequestheaderFetchLoading,
    refetch: refetchPurchaserequestheaderData
  } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'MyItem_ClosedRequest', paginationData, searchData)
    // enabled: isQueryEnabled, // ✅ Now always a boolean
  });

  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader) => {
    const normalizedRequestNumber = existingData.request_number.replace(/\$/g, '/');
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      data: {
        isEditMode: true,
        isViewMode: true,
        request_number: existingData.request_number,
        title
      }
    }));
  };

  const togglePurchaserequestheaderPopup = () => {
    // Close the popup and ensure data is always refreshed
    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {}, request_number: '' },
      action: { ...prev.action, open: !prev.action.open }
    }));

    // Refetch data when popup closes
    if (PurchaserequestheaderFormPopup.action.open) {
      refetchPurchaserequestheaderData();
    }
  };

  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    if (actionType === 'view') handleEditPurchaserequestheader(rowOriginal);
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters('pf', 'purchaserequestheader', Object.keys(rowSelection));
    setRowSelection({});
    refetchPurchaserequestheaderData();
  };

  useEffect(() => {
    setToggleFilter(null as any);
    return () => {};
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
            // style={{ marginBottom: '20px' }}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={handleDeletePurchaserequestheader}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        {/* <Button startIcon={<PlusOutlined />} variant="contained" onClick={() => togglePurchaserequestheaderPopup()}>
          Purchaserequestheader
        </Button> */}
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
      {PurchaserequestheaderFormPopup.action.open &&
        // For JONATHAN, check if request starts with 'BUDGET' or Add button was pressed (isEditMode is false)
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
        ) : // For other users, open the corresponding form based on the request_number
        PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.includes('PO$') ? (
          <PurchaseOrderReport poNumber={PurchaserequestheaderFormPopup.data.request_number} onClose={togglePurchaserequestheaderPopup} />
        ) : (
          // Default logic for AddPurchaserequestPfForm if conditions don't match
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

export default ClosedRequestTab2;
