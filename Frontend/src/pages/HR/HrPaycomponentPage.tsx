import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddPaycomponentForm from 'components/forms/HR/AddPayComponentHrForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import HrServiceInstance from 'service/Service.hr';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TPaycomponent } from './type/AddPaycontrollerHr.types';

const PaycomponentHrPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [paycomponentFormPopup, setPaycomponentFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Paycomponent',
    data: { existingData: {}, isEditMode: false }
  });

  const columns = useMemo<ColumnDef<TPaycomponent>[]>(
    () => [
      {
        id: 'select-col',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
        )
      },
      {
        accessorFn: (row: TPaycomponent) => row.company_code,
        id: 'company_code',
        header: () => <span>Company Code</span>
      },
      {
        accessorFn: (row: TPaycomponent) => row.pay_comp_id,
        id: 'pay_comp_id',
        header: () => <span>Pay Comp Code</span>
      },
      {
        accessorFn: (row: TPaycomponent) => row.pay_comp_desc,
        id: 'pay_comp_desc',
        header: () => <span>Pay Comp Desc</span>
      },
      {
        accessorFn: (row: TPaycomponent) => row.remarks,
        id: 'remarks',
        header: () => <span>Remarks</span>
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

  //----------- useQuery--------------

  const {
    data: PaycomponentData,
    isFetching: isPaycomponentFetchLoading,
    refetch: refetchPaycomponentData
  } = useQuery({
    queryKey: ['Paycomponent_data', searchData, paginationData],
    queryFn: () => HrServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  console.log('UseQueryy Call after');
  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditPaycomponent = (existingData: TPaycomponent) => {
    setPaycomponentFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'Edit Paycomponent',
      data: { existingData, isEditMode: true }
    }));
  };

  const togglePaycomponentPopup = (refetchData?: boolean) => {
    if (paycomponentFormPopup.action.open === true && refetchData) {
      refetchPaycomponentData();
    }
    setPaycomponentFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TPaycomponent) => {
    if (actionType === 'edit') handleEditPaycomponent(rowOriginal);
  };

  const handleDeletePaycomponent = async () => {
    await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
    setRowSelection({});
    refetchPaycomponentData();
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
          onClick={handleDeletePaycomponent}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => togglePaycomponentPopup()}>
          Paycomponent
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="paycomponent_code"
        data={PaycomponentData?.tableData || []}
        columns={columns}
        count={PaycomponentData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isPaycomponentFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!paycomponentFormPopup && paycomponentFormPopup.action.open && (
        <UniversalDialog
          action={{ ...paycomponentFormPopup.action }}
          onClose={togglePaycomponentPopup}
          title={paycomponentFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddPaycomponentForm
            onClose={togglePaycomponentPopup}
            isEditMode={paycomponentFormPopup?.data?.isEditMode}
            existingData={paycomponentFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default PaycomponentHrPage;
