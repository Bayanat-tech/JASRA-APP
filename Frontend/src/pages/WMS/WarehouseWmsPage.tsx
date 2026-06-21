import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { Twarehouse } from './types/warehouse-wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { FormattedMessage } from 'react-intl';
//import WarehouseServiceInstance from 'service/GM/service.warehouse_wms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import AddWarehouseWmsForm from 'components/forms/AddWarehouseWmsForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const WarehouseWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData] = useState<ISearch>(filter);
  const [, setSearchData] = useState<ISearch>();
  const [, setGridApi] = useState<any>(null);
  const [, setLs_search] = useState<string>('');
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [warehouseFormPopup, setWarehouseFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Warehouse" />,
    data: { existingData: {}, isEditMode: false }
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: '',
        field: 'checkbox',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      {
        field: 'wh_code',
        headerName: 'WH Code',
        sortable: true,
        filter: true
      },
      {
        field: 'wh_name',
        headerName: 'WH Name',
        sortable: true
      },
      {
        field: 'address',
        headerName: 'Address',
        sortable: true
      },
      {
        field: 'country_code',
        headerName: 'Country Code'
      },
      {
        field: 'phone',
        headerName: 'Phone'
      },
      {
        field: 'city',
        headerName: 'City'
      },

      {
        headerName: 'Actions',
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  //----------- useQuery--------------
  const {
    data: warehouseData,
    //isFetching: isCountryFetchLoading,
    refetch: refetchWarehouseData
  } = useQuery({
    queryKey: ['warehouseData', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditWarehouse = (existingData: Twarehouse) => {
    setWarehouseFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Warehouse" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleWarehousePopup = (refetchData?: boolean) => {
    if (warehouseFormPopup.action.open === true && refetchData) {
      refetchWarehouseData();
    }
    setWarehouseFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: Twarehouse) => {
    actionType === 'edit' && handleEditWarehouse(rowOriginal);
  };

  const handleDeleteWarehouse = async () => {
    await WmsSerivceInstance.deleteMasters('wms', 'warehouse', Object.keys(rowSelection));
    setRowSelection({});
    refetchWarehouseData();
  };

  // const handleImportData = async (values: Twarehouse[]) => {
  //   const response = await WarehouseServiceInstance.addBulkData(values);
  //   if (response) {
  //     refetchWarehouseData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleExportData = async () => {
  //   const response = await WarehouseServiceInstance.exportData();
  //   if (response) {
  //     refetchWarehouseData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleFilterChange = (value: ISearch['search']) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       search: value
  //     };
  //   });
  // };
  // const handleSortingChange = (sorting: SortingState) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
  //     };
  //   });
  // };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', warehouseData?.tableData);
  };

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

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData: any) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    const updatedSearchData = {
      search: [
        [
          {
            field_name: 'global',
            field_value: value,
            operator: ''
          }
        ]
      ]
    };
    setSearchData(updatedSearchData);
    setLs_search(value);

    // Trigger the refetch for the search API
    refetchWarehouseData();
  };

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);
  useEffect(() => {
    console.log(rowSelection);
  }, [rowSelection]);
  //---------custom-filter---------

  <div className="flex p-2  justify-end space-x-2 w-full">
    <Button
      size="small"
      variant="outlined"
      onClick={handleDeleteWarehouse}
      color="error"
      hidden={!Object.keys(rowSelection).length}
      startIcon={<DeleteOutlined />}
    >
      <FormattedMessage id="Delete" />
    </Button>
  </div>;

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
          />
        </Box>
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => toggleWarehousePopup()}>
          Warehouse
        </Button>
      </div>

      <CustomAgGrid
        rowData={warehouseData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination={true}
        height="500px"
      />
      {!!warehouseFormPopup && warehouseFormPopup.action.open && (
        <UniversalDialog
          action={{ ...warehouseFormPopup.action }}
          onClose={toggleWarehousePopup}
          title={warehouseFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddWarehouseWmsForm
            onClose={toggleWarehousePopup}
            isEditMode={warehouseFormPopup?.data?.isEditMode}
            existingData={warehouseFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default WarehouseWmsPage;
