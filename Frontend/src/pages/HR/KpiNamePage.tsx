import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import KpiNameHrForm from 'components/forms/HR/KpiNameHrForm';
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
import { KPIName } from './type/AddCategoryHr.types';

const KpiNamePage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [kpiNameFormPopup, setKpiNameFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add KPI Name',
    data: { existingData: {}, isEditMode: false }
  });

  const columns = useMemo<ColumnDef<KPIName>[]>(
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
        accessorFn: (row: KPIName) => row.serial_no,
        id: 'serial_no',
        header: () => <span>Serial No</span>
      },
      {
        accessorFn: (row: KPIName) => row.kpi_name,
        id: 'kpi_name',
        header: () => <span>KPI Name</span>
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
    data: KpiData,
    isFetching: isKpiNameFetchLoading,
    refetch: refetchKpiNameData
  } = useQuery({
    queryKey: ['Serial_no', searchData, paginationData],
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

  const handleEditKpiName = (existingData: KPIName) => {
    setKpiNameFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'Edit KPI Name',
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleKpiNamePopup = (refetchData?: boolean) => {
    if (kpiNameFormPopup.action.open === true && refetchData) {
      refetchKpiNameData();
    }
    setKpiNameFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: KPIName) => {
    if (actionType === 'edit') handleEditKpiName(rowOriginal);
  };

  const handleDeleteKpiName = async () => {
    await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
    setRowSelection({});
    refetchKpiNameData();
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
          onClick={handleDeleteKpiName}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleKpiNamePopup()}>
          KPI Name
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="serial_no"
        data={KpiData?.tableData || []}
        columns={columns}
        count={KpiData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isKpiNameFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!kpiNameFormPopup && kpiNameFormPopup.action.open && (
        <UniversalDialog
          action={{ ...kpiNameFormPopup.action }}
          onClose={toggleKpiNamePopup}
          title={kpiNameFormPopup.title}
          hasPrimaryButton={false}
        >
          <KpiNameHrForm
            onClose={toggleKpiNamePopup}
            isEditMode={kpiNameFormPopup?.data?.isEditMode}
            existingData={kpiNameFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default KpiNamePage;
