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
import { TAlert } from './types/AlertWms_type';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddAlertForm from 'components/forms/AddAlertWmsForm';
import { FormattedMessage } from 'react-intl';
//import alertServiceInstance from 'service/GM/service.alert_wms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};

const AlertWmsPage = () => {
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
  const [alertFormPopup, setAlertFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Alert" />,
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
        field: 'op_code',
        headerName: 'OP Code',
        sortable: true,
        filter: true
      },
      {
        field: 'op_desc',
        headerName: 'OP Description',
        sortable: true
      },
      {
        field: 'op_type',
        headerName: 'OP Type',
        sortable: true
      },
      {
        field: 'op_module',
        headerName: 'OP Module'
      },
      {
        field: 'op_sequence',
        headerName: 'OP Sequence'
      },
      {
        field: 'op_mode',
        headerName: 'OP Mode'
      },
      {
        field: 'instruction',
        headerName: 'Instruction'
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
    data: alertData,
    //isFetching: isAlertFetchLoading,
    refetch: refetchAlertData
  } = useQuery({
    queryKey: ['alert_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  //-------------handlers---------------
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', alertData?.tableData);
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
    refetchAlertData();
  };

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const handleEditAlert = (existingData: TAlert) => {
    setAlertFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: <FormattedMessage id="Edit Alert" />,
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleAlertPopup = (refetchData?: boolean) => {
    if (alertFormPopup.action.open === true && refetchData) {
      refetchAlertData();
    }
    setAlertFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TAlert) => {
    actionType === 'edit' && handleEditAlert(rowOriginal);
  };

  const handleDeleteAlert = async () => {
    await WmsSerivceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
    setRowSelection({});
    refetchAlertData();
  };

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
        < Button
          startIcon={<PlusOutlined />}
          color="customBlue"
          //  variant="contained"
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
          onClick={() => toggleAlertPopup()}
        >
          Add Alert
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleDeleteAlert}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>
      </div>

      <CustomAgGrid
        rowData={alertData?.tableData || []}
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
      {!!alertFormPopup && alertFormPopup.action.open && (
        <UniversalDialog
          action={{ ...alertFormPopup.action }}
          onClose={toggleAlertPopup}
          title={alertFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddAlertForm
            onClose={toggleAlertPopup}
            isEditMode={alertFormPopup?.data?.isEditMode}
            existingData={alertFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default AlertWmsPage;
