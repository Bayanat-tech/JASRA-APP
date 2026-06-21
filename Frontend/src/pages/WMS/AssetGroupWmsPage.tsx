import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TAssetgroup } from './types/Assetgroup-wms.types';

import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddAssetgroupWmsForm from 'components/forms/AddAssetgroupWmsForm';
import { FormattedMessage } from 'react-intl';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import AssetgroupServiceInstance from 'service/GM/service.assetgroup_wms';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const AssetGroupWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData, setFilterData] = useState<ISearch>(filter);

  const [AssetgroupFormPopup, setAssetgroupFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Asset" />,
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColumnDef<TAssetgroup>[]>(
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
        accessorFn: (row) => row.asset_group_code,
        id: 'asset_group_code',
        cell: (info) => info.getValue(),
        meta: {
          filterVariant: 'text'
        },
        header: () => <FormattedMessage id="Asset Group Code" />
      },
      {
        accessorFn: (row) => row.asset_group_name,
        id: 'asset_group_name',
        header: () => <FormattedMessage id="Asset Group Name" />
      },
      {
        accessorFn: (row) => row.company_code,
        id: 'company_code',
        header: () => <FormattedMessage id="Company Code" />
      },
      {
        id: 'actions',
        enableHiding: true,
        header: () => <FormattedMessage id="Actions" />,

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
    data: AssetgroupData,
    isFetching: isAssetgroupFetchLoading,
    refetch: refetchAssetgroupData
  } = useQuery({
    queryKey: ['Assetgroup_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
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

  const handleEditAssetgroup = (existingData: TAssetgroup) => {
    setAssetgroupFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit AssetGroup" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleAssetgroupPopup = (refetchData?: boolean) => {
    if (AssetgroupFormPopup.action.open === true && refetchData) {
      refetchAssetgroupData();
    }
    setAssetgroupFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TAssetgroup) => {
    actionType === 'edit' && handleEditAssetgroup(rowOriginal);
  };

  const handleDeleteAssetgroup = async () => {
    await AssetgroupServiceInstance.deleteAssetgroup(Object.keys(rowSelection));
    setRowSelection({});
    refetchAssetgroupData();
  };

  const handleImportData = async (values: TAssetgroup[]) => {
    const response = await AssetgroupServiceInstance.addBulkData(values);
    if (response) {
      refetchAssetgroupData();
      return response;
    }
    return false;
  };

  const handleExportData = async () => {
    const response = await AssetgroupServiceInstance.exportData();
    if (response) {
      refetchAssetgroupData();
      return response;
    }
    return false;
  };

  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };
  const handleSortingChange = (sorting: SortingState) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };
  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);
  useEffect(() => {
    console.log(rowSelection);
  }, [rowSelection]);
  //---------custom-filter---------
  const customFilter = (
    <div className="flex p-2  justify-end space-x-2 w-full">
      <Button
        size="small"
        variant="outlined"
        onClick={handleDeleteAssetgroup}
        color="error"
        hidden={!Object.keys(rowSelection).length}
        startIcon={<DeleteOutlined />}
      >
        <FormattedMessage id="Delete" />
      </Button>
      <Button startIcon={<PlusOutlined />} variant="contained" size="small" onClick={() => toggleAssetgroupPopup()}>
        <FormattedMessage id="Asset Group" />
      </Button>
    </div>
  );
  return (
    <div className="flex flex-col space-y-2">
      <CustomDataTable
        customFilter={customFilter}
        data={AssetgroupData?.tableData || []}
        columns={columns}
        isDataLoading={isAssetgroupFetchLoading}
        //--------------filter---------

        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        // handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        //-----------export----------
        tableActions={['export', 'import', 'print']}
        handleImportData={handleImportData}
        handleExportData={handleExportData}
        //-----------delete----------
        row_id="asset_group_code"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        //-----------pagination----------
        count={AssetgroupData?.count}
        hasPagination={true}
        onPaginationChange={handleChangePagination}
      />
      {!!AssetgroupFormPopup && AssetgroupFormPopup.action.open && (
        <UniversalDialog
          action={{ ...AssetgroupFormPopup.action }}
          onClose={toggleAssetgroupPopup}
          title={AssetgroupFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddAssetgroupWmsForm
            onClose={toggleAssetgroupPopup}
            isEditMode={AssetgroupFormPopup?.data?.isEditMode}
            existingData={AssetgroupFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default AssetGroupWmsPage;
