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

import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
//import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import AddItemmasterPfForm from 'components/forms/Purchaseflow/AddItemmasterPfForm';
import { TItemmaster } from './type/itemmaster-pf-types';

const ItemmasterPfPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [ItemmasterFormPopup, setItemmasterFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Item Master',
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColumnDef<TItemmaster>[]>(
    () => [
      //  {
      //  id: 'select-col',
      //   header: ({ table }) => (
      //     <Checkbox
      //      checked={table.getIsAllRowsSelected()}
      //      indeterminate={table.getIsSomeRowsSelected()}
      //       onChange={table.getToggleAllRowsSelectedHandler()}
      //      />
      //    ),
      //     cell: ({ row }) => (
      //      <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
      //    )
      // },
      {
        accessorFn: (row) => row.item_code,
        id: 'item_code',
        header: () => <span>Item Code</span>
      },
      {
        accessorFn: (row) => row.item_desp,
        id: 'item_desp',
        header: () => <span> Item Description </span>
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
  console.log(
    'page',
    permissions,
    app.toUpperCase(),
    permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
  );

  //----------- useQuery--------------
  // Fetch data from the backend
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
    data: itemmasterData,
    isFetching: isItemmasterFetchLoading,
    refetch: refetchItemmasterData
  } = useQuery({
    queryKey: ['cost_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled: isQueryEnabled, // ✅ Now always a boolean
    staleTime: 10000
  });

  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditItemmaster = (existingData: TItemmaster) => {
    setItemmasterFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Item Master',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleCostmasterPopup = (refetchData?: boolean) => {
    if (ItemmasterFormPopup.action.open === true && refetchData) {
      refetchItemmasterData();
    }
    setItemmasterFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TItemmaster) => {
    actionType === 'edit' && handleEditItemmaster(rowOriginal);
  };
  const handleDeleteitemmaster = async () => {
    await PfSerivceInstance.deleteMasters('pf', 'projectmaster', Object.keys(rowSelection));
    console.log('inside handledeleteProjectmaster');
    console.log(Object.keys(rowSelection));
    setRowSelection({});
    refetchItemmasterData();
  };
  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        {
          <Button
            variant="outlined"
            onClick={handleDeleteitemmaster}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleCostmasterPopup()}>
          Itemmaster
        </Button>
      </div>
      <CustomDataTable
        tableActions={['export', 'import']}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="item_code"
        data={itemmasterData?.tableData || []}
        columns={columns}
        count={itemmasterData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isItemmasterFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!ItemmasterFormPopup && ItemmasterFormPopup.action.open && (
        <UniversalDialog
          action={{ ...ItemmasterFormPopup.action }}
          onClose={toggleCostmasterPopup}
          title={ItemmasterFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddItemmasterPfForm
            onClose={toggleCostmasterPopup}
            isEditMode={ItemmasterFormPopup?.data?.isEditMode}
            existingData={ItemmasterFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ItemmasterPfPage;
