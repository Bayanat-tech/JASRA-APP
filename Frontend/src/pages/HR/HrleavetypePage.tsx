import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddLeavetypeForm from 'components/forms/HR/AddLeaveTypeHrForm';
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
import { TLeavetype } from './type/AddLeavetypeHr.types';

const HrleavetypePage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [leavetypeFormPopup, setLeavetypeFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Leavetype',
    data: { existingData: {}, isEditMode: false }
  });

  const columns = useMemo<ColumnDef<TLeavetype>[]>(
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
        accessorFn: (row: TLeavetype) => row.company_code,
        id: 'company_code',
        header: () => <span>Company Code</span>
      },
      {
        accessorFn: (row: TLeavetype) => row.leave_type,
        id: 'leavetype_code',
        header: () => <span>Leavetype Code</span>
      },
      {
        accessorFn: (row: TLeavetype) => row.leave_type_desc,
        id: 'leavetype_name',
        header: () => <span>Leavetype Name</span>
      },
      {
        accessorFn: (row: TLeavetype) => row.carry_forward,
        id: 'carry_forward',
        header: () => <span>Carry Forward </span>
      },
      {
        accessorFn: (row: TLeavetype) => row.half_day,
        id: 'carry_forward',
        header: () => <span>Half Day </span>
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
    data: LeavetypeData,
    isFetching: isLeavetypeFetchLoading,
    refetch: refetchLeavetypeData
  } = useQuery({
    queryKey: ['Leavetype_data', searchData, paginationData],
    
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

  const handleEditLeavetype = (existingData: TLeavetype) => {
    setLeavetypeFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'Edit Leavetype',
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleLeavetypePopup = (refetchData?: boolean) => {
    if (leavetypeFormPopup.action.open === true && refetchData) {
      refetchLeavetypeData();
    }
    setLeavetypeFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TLeavetype) => {
    if (actionType === 'edit') handleEditLeavetype(rowOriginal);
  };

  const handleDeleteLeavetype = async () => {
    await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
    setRowSelection({});
    refetchLeavetypeData();
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
          onClick={handleDeleteLeavetype}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleLeavetypePopup()}>
          Leavetype
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="leavetype_code"
        data={LeavetypeData?.tableData || []}
        columns={columns}
        count={LeavetypeData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isLeavetypeFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!leavetypeFormPopup && leavetypeFormPopup.action.open && (
        <UniversalDialog
          action={{ ...leavetypeFormPopup.action }}
          onClose={toggleLeavetypePopup}
          title={leavetypeFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddLeavetypeForm
            onClose={toggleLeavetypePopup}
            isEditMode={leavetypeFormPopup?.data?.isEditMode}
            existingData={leavetypeFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default HrleavetypePage;
