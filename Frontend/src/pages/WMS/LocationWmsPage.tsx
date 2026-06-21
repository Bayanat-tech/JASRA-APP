import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import AddLocationWmsForm from 'components/forms/AddLocationWmsForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TLocation } from './types/location-wms.types';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef, GridApi } from 'ag-grid-community';

const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

const LocationWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<TLocation[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [locationFormPopup, setLocationFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Location',
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColDef<TLocation>[]>(
    () => [
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        maxWidth: 50,
        filter: false
      },
      {
        field: 'site_code',
        headerName: 'Site Code'
      },
      {
        field: 'location_code',
        headerName: 'location Code'
      },
      {
        field: 'loc_desc',
        headerName: 'Location Description'
      },
      {
        headerName: 'Actions',
        filter: false,
        cellRenderer: ({ data }: { data: TLocation }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  //----------- useQuery--------------
  const {
    data: locationData,
    // isFetching: isLocationFetchLoading,
    refetch: refetchLocationData
  } = useQuery({
    queryKey: ['location_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  //-------------handlers---------------

  const handleEditLocation = (existingData: TLocation) => {
    setLocationFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Location',
        data: { existingData, isEditMode: true }
      };
    });
  };

  // const onFilterChanged = useCallback((event: any) => {
  //   const filterModel = event.api.getFilterModel();
  //   const filters: any[] = [];

  //   Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
  //     if (value.filter || value.value) {
  //       filters.push([
  //         {
  //           field_name: field,
  //           field_value: value.filter || value.value,
  //           operator: 'equals'
  //         }
  //       ]);
  //     }
  //   });

  //   setSearchData((prevData) => ({
  //     ...prevData,
  //     search: filters.length > 0 ? filters : [[]]
  //   }));
  // }, []);

  // const onGridReady = (params: any) => {
  //   setGridApi(params.api);
  //   params.api.sizeColumnsToFit();
  //   console.log('Grid Data:', locationData?.tableData);
  // };

  const toggleLocationPopup = (refetchData?: boolean) => {
    if (locationFormPopup.action.open === true && refetchData) {
      refetchLocationData();
    }
    setLocationFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  // const onSortChanged = useCallback((params: any) => {
  //   const columnState = params?.columnApi?.getColumnState();
  //   const sortedColumn = columnState?.find((col: any) => col.sort);

  //   setSearchData((prevData: any) => ({
  //     ...prevData,
  //     sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
  //   }));
  // }, []);

  // const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value;
  //   setGlobalFilter(value);
  //   const updatedSearchData = {
  //     search: [
  //       [
  //         {
  //           field_name: 'global',
  //           field_value: value,
  //           operator: ''
  //         }
  //       ]
  //     ]
  //   };
  //   setSearchData(updatedSearchData);
  //   setLs_search(value);

  //   // Trigger the refetch for the search API
  //   refetchLocationData();
  // };

  // const onPaginationChanged = useCallback((params: any) => {
  //   const currentPage = params.api.paginationGetCurrentPage();
  //   const pageSize = params.api.paginationGetPageSize();
  //   setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  // }, []);

  const handleActions = (actionType: string, rowOriginal: TLocation) => {
    actionType === 'edit' && handleEditLocation(rowOriginal);
  };

  const handleDeleteLocation = async () => {
    const locationCodesToDelete = rowSelection.map((row) => row.location_code);
    await WmsSerivceInstance.deleteMasters('wms', 'location', locationCodesToDelete);
    setRowSelection([]);
    refetchLocationData();
  };

  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);

  function handleChangePagination(currentPage: number, pageSize: number): void {
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        {rowSelection.length > 0 && (
          <Button variant="outlined" onClick={handleDeleteLocation} color="error" startIcon={<DeleteOutlined />}>
            Delete
          </Button>
        )}
        <Button
          startIcon={<PlusOutlined />}
          // variant="shadow"
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
          onClick={() => toggleLocationPopup()}
        >
          Location
        </Button>
      </div>
      <CustomAgGrid
        columnDefs={columns}
        rowData={locationData?.tableData || []}
        onGridReady={(params: any) => {
          setGridApi(params.api);
          if (params.api) {
            setRowSelection(params.api.getSelectedRows());
          }
        }}
        onSelectionChanged={() => {
          if (gridApi) {
            setRowSelection(gridApi.getSelectedRows());
          }
        }}
        onPaginationChanged={(params: any) =>
          handleChangePagination(params.api.paginationGetCurrentPage(), params.api.paginationGetPageSize())
        }
        rowSelection="multiple"
        suppressRowClickSelection={true}
        paginationPageSize={paginationData.rowsPerPage}
        // paginationPageSizeSelector={rowsPerPageOptions}
        height="520px"
         rowHeight={20}
        headerHeight={30}
         pagination
         paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        // Removed invalid property rowModelType
      />
      {locationFormPopup.action.open === true && (
        <UniversalDialog
          action={{ ...locationFormPopup.action }}
          onClose={toggleLocationPopup}
          title={locationFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddLocationWmsForm
            onClose={toggleLocationPopup}
            isEditMode={locationFormPopup?.data?.isEditMode}
            existingData={locationFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default LocationWmsPage;
