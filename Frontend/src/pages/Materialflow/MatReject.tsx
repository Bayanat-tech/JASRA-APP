import { PlusOutlined } from '@ant-design/icons';
import { Button, Box, TextField, InputAdornment} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import MaterialItemDetailsTab from '../Purchasefolder/MaterialItemDetailsTab';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import useAuth from 'hooks/useAuth';

import { ISearch } from 'components/filters/SearchFilter';
import { ColDef } from 'ag-grid-community';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TItemMaterialRequest } from '../Purchasefolder/type/materrequest_pf-types';
import GmMatServiceInstance from '../../service/Purchaseflow/services.material';
import { getPathNameList } from 'utils/functions';
import PfSerivceInstance from 'service/service.purhaseflow';

const MatReject = () => {
  const { user } = useAuth();
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 2000 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [ls_search, setLs_search] = useState<string>('');
  const [, setGridApi] = useState<any>(null);

  const [MaterialFormPopup, setMaterialFormPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true },
    title: 'Edit Material Request',
    data: { existingData: {}, isEditMode: false, isViewMode: false }
  });

  const handleActions = (actionType: string, rowOriginal: TItemMaterialRequest) => {
    if (actionType === 'edit') {
      openMaterialPopup(rowOriginal, true);
    }
  };

  const openMaterialPopup = (data = {}, isEditMode = false) => {
    setMaterialFormPopup({
      action: { open: true, fullWidth: true },
      title: isEditMode ? 'Edit Material Request' : 'Generate Material Request',
      data: {
        existingData: isEditMode ? data : {}, // never pass leftover data on new
        isEditMode,
        isViewMode: false
      }
    });
  };

  const closeMaterialPopup = () => {
    setMaterialFormPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false }
    }));
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'Request_number', headerName: 'Request Number', sortable: true, filter: true },
      { field: 'Request_date', headerName: 'Request Date', sortable: true, filter: true },
      { field: 'Description', headerName: 'Description', sortable: true, filter: true },
      { field: 'requestor_name', headerName: 'Requestor Name', sortable: true, filter: true },
      { field: 'need_by_date', headerName: 'Need By Date', sortable: true, filter: true },
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

  const children = permissions?.[app.toUpperCase()]?.children || {};
  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  const isQueryEnabled = Boolean(permissionCheck);

   const { data: materialDataReject, refetch: refetchMaterialDataReject } = useQuery({
    queryKey: ['materialDataReject', searchData, paginationData],
   queryFn: () => PfSerivceInstance.getMasters('pf', 'Pg_Material_flow_Rejected', paginationData, searchData, user?.loginid),
    enabled: isQueryEnabled
  });


  const { refetch: refetchSearchCostmasterData } = useQuery({
    queryKey: ['Material_search', ls_search, paginationData],
    queryFn: () => GmMatServiceInstance.fetchPfGlobalSearch(`cost_master$$$${ls_search}`, paginationData, searchData),
    enabled: isQueryEnabled && !!ls_search,
    staleTime: 10000
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
    refetchSearchCostmasterData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
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

    setSearchData({ search: filters.length > 0 ? filters : [[]] });
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData: any) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  useEffect(() => {
    setSearchData(null as any);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      {/* <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
          
        <Link underline="hover" color="inherit" href="/dashboard">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/pf/master">
          Master
        </Link>
        <Link underline="hover" color="inherit" href="/pf/master/gm">
          General Master
        </Link>
        <Typography color="text.primary">Material Master</Typography>
      </Breadcrumbs> */}


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
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => openMaterialPopup()}>
          Material Request
        </Button>
      </div>

      <CustomAgGrid
        rowData={materialDataReject?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination
        height="500px"
      />

      {!!MaterialFormPopup.action.open && (
        <UniversalDialog
          action={{ ...MaterialFormPopup.action }}
          onClose={() => {
            closeMaterialPopup();
            refetchMaterialDataReject();
          }}
          title={MaterialFormPopup.title}
          hasPrimaryButton={false}
        >
          <MaterialItemDetailsTab
            key={MaterialFormPopup?.data?.isEditMode ? MaterialFormPopup.data.existingData.Request_number : `new-${Date.now()}`}
            onClose={closeMaterialPopup}
            isEditMode={MaterialFormPopup?.data?.isEditMode}
            requestNumber={MaterialFormPopup?.data?.existingData?.Request_number}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default MatReject;