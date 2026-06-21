import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import OperationHrForm from 'components/forms/HR/OperationHrForm';
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
import { Operation } from './type/AddCategoryHr.types';

const OperationHrPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [operationFormPopup, setOperationFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Operation',
    data: { existingData: {}, isEditMode: false }
  });

  const columns = useMemo<ColumnDef<Operation>[]>(
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
        accessorFn: (row: Operation) => row.serial_no,
        id: 'serial_no',
        header: () => <span>Serial No</span>
      },
      {
        accessorFn: (row: Operation) => row.operation_name,
        id: 'operation_name',
        header: () => <span>Operation Name</span>
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
    data: OperationData,
    isFetching: isOperationFetchLoading,
    refetch: refetchOperationData
  } = useQuery({
    queryKey: ['Operation_data', searchData, paginationData],
    queryFn: () => HrServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditOperation = (existingData: Operation) => {
    setOperationFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'Edit Operation',
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleOperationPopup = (refetchData?: boolean) => {
    if (operationFormPopup.action.open === true && refetchData) {
      refetchOperationData();
    }
    setOperationFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: Operation) => {
    if (actionType === 'edit') handleEditOperation(rowOriginal);
  };

  const handleDeleteOperation = async () => {
    await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
    setRowSelection({});
    refetchOperationData();
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
          onClick={handleDeleteOperation}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleOperationPopup()}>
          Operation
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="serial_no"
        data={OperationData?.tableData || []}
        columns={columns}
        count={OperationData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isOperationFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!operationFormPopup && operationFormPopup.action.open && (
        <UniversalDialog
          action={{ ...operationFormPopup.action }}
          onClose={toggleOperationPopup}
          title={operationFormPopup.title}
          hasPrimaryButton={false}
        >
          {/* Replace KpiNameHrForm with your Operation form */}
          <OperationHrForm
            onClose={toggleOperationPopup}
            isEditMode={operationFormPopup?.data?.isEditMode}
            existingData={operationFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default OperationHrPage;
