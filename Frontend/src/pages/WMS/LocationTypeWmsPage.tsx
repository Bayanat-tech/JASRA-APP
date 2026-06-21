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
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { FormattedMessage } from 'react-intl';
import { Tlocationtype } from './types/locationtype-wms.types';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
//import locationtypeServiceInstance from 'service/GM/service.locationtype_wms';
import AddLocationTypeWmsForm from 'components/forms/AddLocationTypeWmsForm';
import WmsSerivceInstance from 'service/service.wms';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const LocationtypeWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData] = useState<ISearch>(filter);
  const [, setGridApi] = useState<any>(null);
  const [, setSearchData] = useState<ISearch>();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [, setLs_search] = useState<string>('');
  const [locationtypeFormPopup, setlocationtypeFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Location Type" />,
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
        field: 'company_code',
        headerName: 'Company Code',
        sortable: true,
        filter: true
      },
      {
        field: 'location_type',
        headerName: 'Location Type'
      },
      {
        field: 'loc_cbm',
        headerName: 'Location CBM'
      },
      {
        field: 'loc_wt',
        headerName: 'Location Weight'
      },
      {
        field: 'push_level',
        headerName: 'Push Level'
      },
      {
        field: 'user_dt',
        headerName: 'User Date'
      },
      {
        field: 'user_id',
        headerName: 'User ID'
      },
      {
        field: 'loc_name',
        headerName: 'Location Name'
      },
      {
        field: 'user_id',
        headerName: 'User ID'
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
    data: locationtype_data,
    //isFetching: isCountryFetchLoading,
    refetch: refetchLocationtypeData
  } = useQuery({
    queryKey: ['locationtype_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditLocationType = (existingData: Tlocationtype) => {
    setlocationtypeFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Location Type" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

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
    refetchLocationtypeData();
  };

  const togglelocationtypePopup = (refetchData?: boolean) => {
    if (locationtypeFormPopup.action.open === true && refetchData) {
      refetchLocationtypeData();
    }
    setlocationtypeFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: Tlocationtype) => {
    actionType === 'edit' && handleEditLocationType(rowOriginal);
  };

  const handleDeleteLocationtype = async () => {
    await WmsSerivceInstance.deleteMasters('wms', 'locationtype', Object.keys(rowSelection));
    setRowSelection({});
    refetchLocationtypeData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', locationtype_data?.tableData);
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

  // const handleImportData = async (values: Tlocationtype[]) => {
  //   const response = await locationtypeServiceInstance.addBulkData(values);
  //   if (response) {
  //     refetchLocationtypeData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleExportData = async () => {
  //   const response = await locationtypeServiceInstance.exportData();
  //   if (response) {
  //     refetchLocationtypeData();
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
  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);
  useEffect(() => {
    console.log(rowSelection);
  }, [rowSelection]);
  //---------custom-filter---------

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex p-2 justify-end space-x-2 w-full">
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

        <Button
          size="small"
          variant="outlined"
          onClick={handleDeleteLocationtype}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>

        <Button
          startIcon={<PlusOutlined />}
          color="customBlue"
          // variant="contained"
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          onClick={() => togglelocationtypePopup()}
        >
          Location Type
        </Button>
      </div>

      <CustomAgGrid
        rowData={locationtype_data?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination
        height="520px"
          rowHeight={20}
        headerHeight={30}
        
      />
      {!!locationtypeFormPopup && locationtypeFormPopup.action.open && (
        <UniversalDialog
          action={{ ...locationtypeFormPopup.action }}
          onClose={togglelocationtypePopup}
          title={locationtypeFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddLocationTypeWmsForm
            onClose={togglelocationtypePopup}
            isEditMode={locationtypeFormPopup?.data?.isEditMode}
            existingData={locationtypeFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default LocationtypeWmsPage;
