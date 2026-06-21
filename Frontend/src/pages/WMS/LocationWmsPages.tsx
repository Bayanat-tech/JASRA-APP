import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
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
//import { TCountry } from './types/country-wms.types';
import { TLocation } from './types/location-wms.types';

//import AddCountryWmsForm from 'components/forms/AddCountryWmsForm';
import AddLocationWmsForm from 'components/forms/AddLocationWmsForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
//import GmServiceInstance from 'service/wms/services.gm_wms';
//import locationServiceInstance from 'service/GM/service.location_wms';

const LocationWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [locationFormPopup, setLocationFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Location',
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColumnDef<TLocation>[]>(
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
        accessorFn: (row) => row.site_code,
        id: 'site_code',
        header: () => <span>Site Code</span>
      },
      {
        accessorFn: (row) => row.location_code,
        id: 'location_code',
        header: () => <span>Location Code</span>
      },
      {
        accessorFn: (row) => row.loc_desc,
        id: 'location_desc',
        header: () => <span>Location Name</span>
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
    data: locationData,
    isFetching: isLocationFetchLoading,
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
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditLocation = (existingData: TLocation) => {
    setLocationFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Location',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleLocationPopup = (refetchData?: boolean) => {
    if (locationFormPopup.action.open === true && refetchData) {
      refetchLocationData();
    }
    setLocationFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TLocation) => {
    actionType === 'edit' && handleEditLocation(rowOriginal);
  };
  const handleDeleteLocation = async () => {
    await WmsSerivceInstance.deleteMasters('wms', 'location', Object.keys(rowSelection));
    setRowSelection({});
    refetchLocationData();
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
            onClick={handleDeleteLocation}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleLocationPopup()}>
          Location
        </Button>
      </div>
      <CustomDataTable
        tableActions={['export', 'import']}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="location_code"
        data={locationData?.tableData || []}
        columns={columns}
        count={locationData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isLocationFetchLoading}
        toggleFilter={toggleFilter}
        hasPagination={true}
      />
      {!!locationFormPopup && locationFormPopup.action.open && (
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
