import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
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
//import AddPurchaserequestPfForm from 'components/forms/Purchaseflow/AddPurchaserequestPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVPurchaserequestheader } from './type/purchaserequestheader_pf-types';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport'; // Import PurchaseOrderReport

const POcancelPfPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: false
    },
    title: 'Confirm Purchase Order Cancellation',
    data: { existingData: {}, isEditMode: false, request_number: undefined } // Initialize request_number
  });

  const columns = useMemo<ColumnDef<TVPurchaserequestheader>[]>(
    () => [
      // {
      //   id: 'select-col',
      //    header: ({ table }) => (
      //      <Checkbox
      //       checked={table.getIsAllRowsSelected()}
      //      indeterminate={table.getIsSomeRowsSelected()}
      //       onChange={table.getToggleAllRowsSelectedHandler()}
      //      />
      //     ),
      //     cell: ({ row }) => (
      //       <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
      //      )
      //   },
      {
        accessorFn: (row) => (row.document_number ? row.document_number.replace(/\$/g, '/') : ''),
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
        header: () => <span>project_name</span>
      },
      {
        accessorFn: (row) => row.supplier,
        id: 'supplier',
        header: () => <span>supplier</span>
      },
      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit']; // Show only 'cancel' button
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  //----------- useQuery--------------
  const children = permissions?.[app.toUpperCase()]?.children || {}; // Ensure it's always an object

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  console.log('Resolved Module Key:', moduleKey);

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  console.log('Permission Check:', permissionCheck);

  // const isQueryEnabled = Boolean(permissionCheck); // ✅ Ensures strict boolean value
  //console.log('Final Enabled Value:', isQueryEnabled);

  const {
    data: PurchaserequestheaderData,
    isFetching: isPurchaserequestheaderFetchLoading,
    refetch: refetchPurchaserequestheaderData
  } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, 'po_cancel', paginationData, searchData)
    //  enabled: isQueryEnabled, // ✅ Now always a boolean
    // staleTime: 10000
  });

  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const togglePurchaserequestheaderPopup = (refetchData?: boolean) => {
    if (PurchaserequestheaderFormPopup.action.open && refetchData) {
      refetchPurchaserequestheaderData();
    }
    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {}, request_number: undefined }, // Reset request_number
      action: { ...prev.action, open: !prev.action.open }
    }));
    if (PurchaserequestheaderFormPopup.action.open) {
      refetchPurchaserequestheaderData();
    }
  };

  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader) => {
    if (actionType === 'edit') {
      // Open the ConfirmPO dialog for cancellation
      setPurchaserequestheaderFormPopup((prev) => ({
        action: { ...prev.action, open: true },
        title: 'Confirm Purchase Order Cancellation',
        data: {
          isEditMode: false,
          request_number: rowOriginal.request_number // Use the selected row's request_number
        }
      }));
    }
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfSerivceInstance.deleteMasters('pf', 'purchaserequestheader', Object.keys(rowSelection));
    setRowSelection({});
    refetchPurchaserequestheaderData();
  };

  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);

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
        hasPagination={true}
      />
      {!!PurchaserequestheaderFormPopup && PurchaserequestheaderFormPopup.action.open && (
        <UniversalDialog
          action={{ ...PurchaserequestheaderFormPopup.action }}
          onClose={togglePurchaserequestheaderPopup}
          title={PurchaserequestheaderFormPopup.title}
          hasPrimaryButton={false}
        >
          <PurchaseOrderReport
            poNumber={PurchaserequestheaderFormPopup.data.request_number}
            div_code={PurchaserequestheaderFormPopup.data.div_code || ''}
            onClose={togglePurchaserequestheaderPopup}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default POcancelPfPage;
