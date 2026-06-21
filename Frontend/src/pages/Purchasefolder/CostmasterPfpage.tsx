/* eslint-disable no-empty-pattern */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Box, Breadcrumbs, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import AddCostmasterPfForm from 'components/forms/Purchaseflow/AddCostmasterPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TCostmaster } from 'pages/Purchasefolder/type/costmaster-pf-types';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const CostmasterPfPage = () => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [gridApi, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch>();
  const [/*ssdsd*/] = useState<RowSelectionState>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [ls_search, setLs_search] = useState<string>('');

  // Form state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<TCostmaster | null>(null);

  // Refs for debouncing - FIXED: Added proper initial values
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized permission check - FIXED: Removed unused serialNumber
  const { isQueryEnabled } = useMemo(() => {
    const children = permissions?.[app.toUpperCase()]?.children || {};
    const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
    const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
    const isQueryEnabled = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

    return { isQueryEnabled };
  }, [permissions, app, pathNameList, user_permission]);

  // Columns for AgGrid
  const columnDefs = useMemo<ColDef<TCostmaster>[]>(
    () => [
      {
        headerName: 'Cost Code',
        field: 'cost_code',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: true,
        filter: true,
        minWidth: 150,
        editable: true 
      },
      {
        headerName: 'Cost Name',
        field: 'cost_name',
        sortable: true,
        filter: true,
        minWidth: 200,
         editable: true
      },
      {
        headerName: 'Actions',
        sortable: false,
        filter: false,
        resizable: false,
        width: 120,
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return (
            <ActionButtonsGroup
              handleActions={(action) => {
                if (action === 'edit' && params.data) {
                  handleEditCostmaster(params.data);
                }
              }}
              buttons={actionButtons}
            />
          );
        }
      }
    ],
    []
  );
  const {
    data: CostmasterData,
    refetch: refetchCostmasterData,
    isLoading: isCostmasterLoading,
    error: costmasterError
  } = useQuery({
    queryKey: ['cost_data', searchData, paginationData, app],
    queryFn: () => PfSerivceInstance.getMasters(app, 'cost_master', paginationData, searchData),
    enabled: isQueryEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false
  });

  const {
    data: searchCostmasterData,
    refetch: refetchSearchCostmasterData,
    isLoading: isSearchLoading
  } = useQuery({
    queryKey: ['cost_data_search', ls_search, paginationData, app],
    queryFn: () => PfSerivceInstance.getPfglobalsearch(app, `cost_master$$$$${ls_search}`, paginationData, searchData),
    enabled: isQueryEnabled && ls_search.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1
  });

  const handleGlobalFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setLs_search(value);

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
    }, 500);
  }, []);
  const handleEditCostmaster = useCallback((existingData: TCostmaster) => {
    setIsFormVisible(false);
    setTimeout(() => {
      setIsEditMode(true);
      setFormData({ ...existingData });
      setIsFormVisible(true);
    }, 0);
  }, []);

  const toggleCostmasterForm = useCallback(() => {
    setIsFormVisible((prev) => !prev);
    if (!isFormVisible) {
      setIsEditMode(false);
      setFormData(null);
    }
  }, [isFormVisible]);

  const handleDeleteCostmaster = useCallback(async () => {
    if (!gridApi) {
      console.error('Grid API not available');
      return;
    }

    const selectedNodes = gridApi.getSelectedNodes();
    const selectedIds = selectedNodes.map((node: any) => node.data?.request_number).filter(Boolean);

    if (selectedIds.length === 0) {
      console.warn('No rows selected for deletion');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
      return;
    }

    try {
      await PfSerivceInstance.deleteMasters('pf', 'cost_master', selectedIds);
      setSelectedRows([]);
      await Promise.all([refetchCostmasterData(), refetchSearchCostmasterData()]);

      console.log('Items deleted successfully');
    } catch (error) {
      console.error('Error deleting items:', error);

      alert('Error deleting items. Please try again.');
    }
  }, [gridApi, refetchCostmasterData, refetchSearchCostmasterData]);

  const onFilterChanged = useCallback((event: any) => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = setTimeout(() => {
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
    }, 300);
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

  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  const onSelectionChanged = useCallback(() => {
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedNodes();
      const selectedData = selectedNodes.map((node: any) => node.data);
      setSelectedRows(selectedData);
    }
  }, [gridApi]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  // Determine which data to display
  const displayData = useMemo(() => {
    return ls_search.length > 0 ? searchCostmasterData : CostmasterData;
  }, [ls_search, searchCostmasterData, CostmasterData]);

  const isLoading = isCostmasterLoading || isSearchLoading;

  return (
    <div className="flex flex-col space-y-2">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/pf/master">
          Master
        </Link>
        <Link underline="hover" color="inherit" href="/pf/master/gm">
          General Master
        </Link>
        <Typography color="text.primary">Cost Master</Typography>
      </Breadcrumbs>

      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            placeholder="Search cost masters..."
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={18} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {selectedRows.length > 0 && (
          <Button variant="outlined" onClick={handleDeleteCostmaster} color="error" startIcon={<DeleteOutlined />} disabled={isLoading}>
            Delete ({selectedRows.length})
          </Button>
        )}

        {!isFormVisible && (
          <Button startIcon={<PlusOutlined />} variant="contained" color="customBlue" onClick={toggleCostmasterForm} disabled={isLoading}>
            Add Costmaster
          </Button>
        )}
      </div>

      {/* Form overlay */}
      {isFormVisible && (
        <div className="form-overlay">
          <AddCostmasterPfForm
            onClose={toggleCostmasterForm}
            isEditMode={isEditMode}
            existingData={formData || { id: '', cost_code: '', cost_name: '' }}

          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <Typography>Loading cost masters...</Typography>
        </div>
      )}

      {/* Error state */}
      {costmasterError && (
        <div className="flex justify-center items-center h-32 text-red-500">
          <Typography>Error loading cost masters. Please try again.</Typography>
        </div>
      )}

      {/* AgGrid table */}
      {!isFormVisible && !isLoading && !costmasterError && (
        <CustomAgGrid
          rowData={displayData as any}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          onSortChanged={onSortChanged}
          onSelectionChanged={onSelectionChanged}
          paginationPageSize={1000}
          paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          pagination={true}
          height="500px"
          // FIXED: Removed loading prop if it doesn't exist in CustomAgGrid
          rowSelection="multiple"
        />
      )}
    </div>
  );
};

export default CostmasterPfPage;
