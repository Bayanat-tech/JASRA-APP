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
import { TActivityKPI } from './types/activityKpi-wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { FormattedMessage } from 'react-intl';
import activityKpiServiceInstance from 'service/GM/service.activitykpi_wms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActivityKpiWmsForm from 'components/forms/ActivityKpiWmsForm';
import { ColDef } from 'ag-grid-community';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { SearchIcon } from 'lucide-react';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};

const ActivityKpiWmsPage = () => {
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
  const [activityKpiFormPopup, setActivityKpiFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add KPI" />,
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
        field: 'prin_code',
        headerName: 'Principle Code',
        sortable: true,
        filter: true
      },
      {
        field: 'act_code',
        headerName: 'Activity Code'
      },
      {
        field: 'cust_code',
        headerName: 'Customer Code'
      },
      {
        field: 'job_type',
        headerName: 'Job Type'
      },
      {
        field: 'exp_hours',
        headerName: 'Export Hours'
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

  const {
    data: activityKpiData,
    //isFetching: isActivityKpiFetchLoading,
    refetch: refetchActivityKpiData
  } = useQuery({
    queryKey: ['activity_kpi_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

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
    refetchActivityKpiData();
  };

  const handleEditActivityKpi = (existingData: TActivityKPI) => {
    setActivityKpiFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: <FormattedMessage id="Edit KPI" />,
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleActivityKpiPopup = (refetchData?: boolean) => {
    if (activityKpiFormPopup.action.open && refetchData) {
      refetchActivityKpiData();
    }
    setActivityKpiFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TActivityKPI) => {
    if (actionType === 'edit') handleEditActivityKpi(rowOriginal);
  };

  const handleDeleteActivityKpi = async () => {
    await activityKpiServiceInstance.deleteActivityKpi(Object.keys(rowSelection));
    setRowSelection({});
    refetchActivityKpiData();
  };

  // const handleImportData = async (values: TActivityKPI[]) => {
  //   const response = await activityKpiServiceInstance.addBulkData(values);
  //   if (response) refetchActivityKpiData();
  //   return response ?? false;
  // };

  // const handleExportData = async () => {
  //   const response = await activityKpiServiceInstance.exportData();
  //   if (response) refetchActivityKpiData();
  //   return response;
  // };

  // const handleFilterChange = (value: ISearch['search']) => {
  //   setFilterData((prevData) => ({ ...prevData, search: value }));
  // };

  // const handleSortingChange = (sorting: SortingState) => {
  //   setFilterData((prevData) => ({
  //     ...prevData,
  //     sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
  //   }));
  // };

  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', activityKpiData?.tableData);
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
          onClick={handleDeleteActivityKpi}
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
          onClick={() => toggleActivityKpiPopup()}
        >
          Add KPI
        </Button>
      </div>

      <CustomAgGrid
        rowData={activityKpiData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
          rowHeight={20}
        headerHeight={30}
        pagination
        height="520px"

      />
      {!!activityKpiFormPopup && activityKpiFormPopup.action.open && (
        <UniversalDialog
          action={{ ...activityKpiFormPopup.action }}
          onClose={toggleActivityKpiPopup}
          title={activityKpiFormPopup.title}
          hasPrimaryButton={false}
        >
          <ActivityKpiWmsForm
            onClose={toggleActivityKpiPopup}
            isEditMode={activityKpiFormPopup?.data?.isEditMode}
            existingData={activityKpiFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ActivityKpiWmsPage;
