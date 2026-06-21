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
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

// import Port Table
import { TPort } from './types/Port-wms.types';

//import GM
import PortServiceInstance from 'service/GM/service.port_wms';

// import form
import AddPortWmsForm from 'components/forms/AddPortWmsForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const PortWmsPage = () => {
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
  const [PortFormPopup, setPortFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Port',
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
        field: 'port_code',
        headerName: 'Port Code',
        sortable: true,
        filter: true
      },
      {
        field: 'port_name',
        headerName: 'Port Name',
        sortable: true
      },
      {
        field: 'trp_mode',
        headerName: 'TRP Mode',
        sortable: true
      },
      {
        field: 'country_code',
        headerName: ' Country Code'
      },
      {
        field: 'company_code',
        headerName: ' Company Code'
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
    data: Port_data,
    //isFetching: isPortFetchLoading,
    refetch: refetchPortData
  } = useQuery({
    queryKey: ['Port_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------
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
    refetchPortData();
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
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', Port_data?.tableData);
  };

  const handleEditPort = (existingData: TPort) => {
    setPortFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Port',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const togglePortPopup = (refetchData?: boolean) => {
    if (PortFormPopup.action.open === true && refetchData) {
      refetchPortData();
    }
    setPortFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TPort) => {
    actionType === 'edit' && handleEditPort(rowOriginal);
  };

  const handleDeletePort = async () => {
    await PortServiceInstance.deletePort(Object.keys(rowSelection));
    setRowSelection({});
    refetchPortData();
  };

  //------------------useEffect----------------

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
          //  variant="contained"
          onClick={() => togglePortPopup()}
        >
          Port kk
        </Button>
        {
          // Delete Button
          <Button
            variant="outlined"
            onClick={handleDeletePort}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
      </div>
      <CustomAgGrid
        rowData={Port_data?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination
        height="520px"
        headerHeight={30}
        rowHeight={20}
        
      />
      {PortFormPopup.action.open === true && (
        <UniversalDialog
          action={{ ...PortFormPopup.action }}
          onClose={togglePortPopup}
          title={PortFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddPortWmsForm
            onClose={togglePortPopup}
            isEditMode={PortFormPopup?.data?.isEditMode}
            existingData={PortFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
      ;
    </div>
  );
};

export default PortWmsPage;
