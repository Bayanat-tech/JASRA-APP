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
import activitygroupServiceInstance from 'service/GM/service.activitygroup_wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TActivityGroup } from './types/ActivityGroup-wms.types';
import AddActivityGroupWmsForm from 'components/forms/AddActivityGroupWmsForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const ActivityGroupWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setGridApi] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [, setLs_search] = useState<string>('');
  const [ActivityGroupFormPopup, setActivityGroupFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Activity Group',
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
        field: 'activity_group_code',
        headerName: 'Activity Group Code',
        sortable: true,
        filter: true
      },
      {
        field: 'act_group_name',
        headerName: 'Activity Group Name'
      },
      {
        field: 'company_code',
        headerName: 'Company Code'
      },
      {
        field: 'mandatory_flag',
        headerName: 'Mandatory Flag'
      },
      {
        field: 'validate_flag',
        headerName: 'Validate Flag'
      },
      {
        field: 'account_code',
        headerName: 'Account Code'
      },
      {
        field: 'act_group_type',
        headerName: 'Activity Group Type'
      },
      {
        field: 'alternate_accode',
        headerName: 'Alternate Ac code'
      },
      {
        field: 'exp_account_code',
        headerName: 'Exp Account Code'
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
  // need this const query to fitch the Activity Group Data
  const {
    data: activitygroupData,
    //isFetching: isActivityGroupFetchLoading,
    refetch: refetchActivityGroupData
  } = useQuery({
    queryKey: ['ActivityGroup_Data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  //-------------handlers---------------
  //After add Const Popup we need to add handlers

  const handleEditActivityGroup = (existingData: TActivityGroup) => {
    setActivityGroupFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Activity Group',
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
    refetchActivityGroupData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', activitygroupData?.tableData);
  };

  const toggleActivityGroup = (refetchData?: boolean) => {
    if (ActivityGroupFormPopup.action.open === true && refetchData) {
      refetchActivityGroupData();
    }
    setActivityGroupFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TActivityGroup) => {
    actionType === 'edit' && handleEditActivityGroup(rowOriginal);
  };

  // to use delete Activity Const we need to have Services in Gm_wms
  const handleDeleteActivityGroup = async () => {
    await activitygroupServiceInstance.deleteActivityGroup(Object.keys(rowSelection));
    setRowSelection({});
    refetchActivityGroupData();
  };
  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

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

  //------------------useEffect----------------

  // in order to use the form we need to create form Compent then we add it here
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);
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
        <Button
          startIcon={<PlusOutlined />}
          color="customBlue"
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
          variant="contained"
          onClick={() => toggleActivityGroup()}
        >
          Activity Group
        </Button>
        {
          <Button
            variant="outlined"
            onClick={handleDeleteActivityGroup}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
      </div>

      <CustomAgGrid
        rowData={activitygroupData?.tableData || []}
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

      {!!ActivityGroupFormPopup && ActivityGroupFormPopup.action.open && (
        <UniversalDialog
          action={{ ...ActivityGroupFormPopup.action }}
          onClose={toggleActivityGroup}
          title={ActivityGroupFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddActivityGroupWmsForm
            onClose={toggleActivityGroup}
            isEditMode={ActivityGroupFormPopup?.data?.isEditMode}
            existingData={ActivityGroupFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ActivityGroupWmsPage;
