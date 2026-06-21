import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Box, Breadcrumbs, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import AddMatCategorymasterPfForm from 'components/forms/Purchaseflow/AddMatCategorymasterPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TMatrialCateogrymst } from 'pages/Purchasefolder/type/CatMatmaster-pf-types';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { Search as SearchIcon } from 'lucide-react';

const MaterialCatmasterPfpage = () => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [gridApi, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [ls_search, setLs_search] = useState<string>('');
  //const [/*ssdsd*/] = useState<RowSelectionState>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<TMatrialCateogrymst | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const filterTimeoutRef = useRef<number | null>(null);

  // Columns for AgGrid
  const columnDefs = useMemo<ColDef<TMatrialCateogrymst>[]>(
    () => [
      {
        headerName: 'Material Category Description',
        field: 'mater_category_desp',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Company Code',
        field: 'company_code',
        sortable: true,
        filter: true
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
                  handleEditMaterialCategory(params.data);
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

  // Permission 
  const { isQueryEnabled } = useMemo(() => {
    const children = permissions?.[app.toUpperCase()]?.children || {};
    const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
    const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
    const isQueryEnabled = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

    return { isQueryEnabled };
  }, [permissions, app, pathNameList, user_permission]);

  const {
    data: CatMatData,
    refetch: refetchCatMatData,
   isLoading: isCatMatLoading
  } = useQuery({
    queryKey: ['mat_category', searchData, paginationData, app],
    queryFn: async () => PfSerivceInstance.getMasters(app, 'matcat_master', paginationData, searchData),
    enabled: isQueryEnabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  const {
    data: CatMatSearchData,
    refetch: refetchSearchCatMatData,
    isLoading: isSearchLoading
  } = useQuery({
    queryKey: ['CatMat_Data', ls_search, paginationData, app],
    queryFn: async () => PfSerivceInstance.getPfglobalsearch(app, `matcat_master$$$$${ls_search}`, paginationData, searchData),
    enabled: isQueryEnabled && ls_search.length > 0,
    staleTime: 10000
  });

  const rowsFromResponse = (resp: any) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (resp.tableData) return resp.tableData;
    if (resp.data) return resp.data;
    return [];
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', CatMatData);
  };

  const onSelectionChanged = (params: any) => {
    const selected = params.api.getSelectedRows();
    setSelectedRows(selected);
  };

  // Global filter
  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
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
  };

  const handleEditMaterialCategory = useCallback((existingData: TMatrialCateogrymst) => {
    setIsFormVisible(false);
    setTimeout(() => {
      setIsEditMode(true);
      setFormData({ ...existingData });
      setIsFormVisible(true);
    });
  },[]);

  const toggleCatMatmasterForm = useCallback(() => {
    setIsFormVisible((prev) => !prev); 
      if (!isFormVisible) {
      setIsEditMode(false);
      setFormData(null);
    }
  }, [isFormVisible]);


  // Delete selected rows
  const handleDeleteCatMatmaster = async () => {
    if (!gridApi) {
      console.error('Grid API not available');
      return;
    }

    const selectedNodes = gridApi.getSelectedNodes();
    const selectedIds = selectedNodes.map((node: any) => node.data?.mater_category_code).filter(Boolean);

    if (selectedIds.length === 0) {
      console.warn('No rows selected for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) {
      return;
    }

    try {
      await PfSerivceInstance.deleteMasters(app, 'matcat_master', selectedIds);
      setSelectedRows([]);
      if (refetchCatMatData) await refetchCatMatData();
      if (refetchSearchCatMatData) await refetchSearchCatMatData();
      console.log('Items deleted successfully');
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Error deleting items. Please try again.');
    }
  };

  const onFilterChanged = useCallback((event: any) => {
    if (filterTimeoutRef.current) {
      window.clearTimeout(filterTimeoutRef.current);
    }

    filterTimeoutRef.current = window.setTimeout(() => {
      const filterModel = event.api.getFilterModel();
      const filters: any[] = [];

      Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
        const filterValue = value?.filter ?? value?.value;
        if (filterValue !== undefined) {
          filters.push([
            {
              field_name: field,
              field_value: filterValue,
              operator: 'equals'
            }
          ]);
        }
      });

      setSearchData((prevData) => ({
        ...(prevData ?? {}),
        search: filters.length > 0 ? filters : [[]]
      }));
    }, 400);
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState?.();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData: any) => ({
      ...(prevData ?? {}),
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  useEffect(() => {
    setSearchData(null);
  }, []);

  const displayRows = useMemo(() => {
    if (ls_search && CatMatSearchData) return rowsFromResponse(CatMatSearchData);
    return rowsFromResponse(CatMatData);
  }, [ls_search, CatMatData, CatMatSearchData]);

  const isLoading = isCatMatLoading|| isSearchLoading;


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
        <Typography color="text.primary">Material Category Master</Typography>
      </Breadcrumbs>

      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            disabled={isLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {selectedRows.length > 0 && (
          <Button variant="outlined" onClick={handleDeleteCatMatmaster} color="error" startIcon={<DeleteOutlined />}disabled={isLoading}>
            Delete
          </Button>
        )}

        {!isFormVisible && (
          <Button startIcon={<PlusOutlined />} variant="contained" color="primary" onClick={toggleCatMatmasterForm}disabled={isLoading}>
            Add Material Category
          </Button>
        )}
      </div>

      {/* Form overlay */}
      {isFormVisible && (
        <div className="form-overlay">
          <AddMatCategorymasterPfForm
            onClose={toggleCatMatmasterForm}
            isEditMode={isEditMode}
            existingData={
              formData || {
                mater_category_code: '',
                mater_category_desp: ''
              }
            }
          />
        </div>
      )}

      {/* AgGrid table */}
      {!isFormVisible && (
        <CustomAgGrid
          rowData={displayRows}
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
        />
      )}
    </div>
  );
};

export default MaterialCatmasterPfpage;





















// import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
// import { Box, Breadcrumbs, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
// import { useQuery } from '@tanstack/react-query';
// import { ISearch } from 'components/filters/SearchFilter';
// import useAuth from 'hooks/useAuth';
// import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
// import { useLocation } from 'react-router';
// import PfSerivceInstance from 'service/service.purhaseflow';
// import { useSelector } from 'store';
// import { getPathNameList } from 'utils/functions';
// import AddMatCategorymasterPfForm from 'components/forms/Purchaseflow/AddMatCategorymasterPfForm';
// import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
// import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
// import { TMatrialCateogrymst } from 'pages/Purchasefolder/type/CatMatmaster-pf-types';
// import CustomAgGrid from 'components/grid/CustomAgGrid';
// import { ColDef } from 'ag-grid-community';
// import { Search as SearchIcon } from 'lucide-react';

// const MaterialCatmasterPfpage = () => {
//   const { permissions, user_permission } = useAuth();
//   const location = useLocation();
//   const pathNameList = getPathNameList(location.pathname);
//   const { app } = useSelector((state: any) => state.menuSelectionSlice);

//   // pagination defaults
//   const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: 10 });
//   const [gridApi, setGridApi] = useState<any>(null);
//   const [searchData, setSearchData] = useState<ISearch | null>(null);
//   const [globalFilter, setGlobalFilter] = useState<string>('');
//   const [ls_search, setLs_search] = useState<string>('');
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);

//   // Form state
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [formData, setFormData] = useState<TMatrialCateogrymst | null>(null);

//   // debounce refs
//   const searchTimeoutRef = useRef<number | null>(null);
//   const filterTimeoutRef = useRef<number | null>(null);
//   const mountedRef = useRef(true);

//   useEffect(() => {
//     return () => {
//       mountedRef.current = false;
//       if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
//       if (filterTimeoutRef.current) window.clearTimeout(filterTimeoutRef.current);
//     };
//   }, []);

//   // Permission 
//   const { isQueryEnabled } = useMemo(() => {
//     const children = permissions?.[app?.toUpperCase()]?.children || {};
//     const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
//     const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
//     const isQueryEnabled = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

//     return { isQueryEnabled };
//   }, [permissions, app, pathNameList, user_permission]);

//   // --- single query that switches between global-search and normal fetch ---
//   const searchKey = useMemo(() => {
//     // stringify searchData so queryKey changes only when logical content changes
//     return JSON.stringify({ ls_search, paginationData, searchData });
//   }, [ls_search, paginationData, searchData]);

//   const {
//     data: CatMatData,
//     refetch: refetchCatMatData,
//     isLoading: isCatMatLoading
//   } = useQuery({
//     queryKey: ['mat_category', app, searchKey],
//     queryFn: async () => {
//       // choose endpoint based on presence of ls_search
//       if (ls_search && ls_search.length > 0) {
//         return PfSerivceInstance.getPfglobalsearch(app, `matcat_master$$$$${ls_search}`, paginationData, searchData);
//       }
//       return PfSerivceInstance.getMasters(app, 'matcat_master', paginationData, searchData);
//     },
//     enabled: isQueryEnabled,
//     staleTime: 10000,
//     refetchOnWindowFocus: false
//   });

//   const rowsFromResponse = (resp: any) => {
//     if (!resp) return [];
//     if (Array.isArray(resp)) return resp;
//     if (resp.tableData) return resp.tableData;
//     if (resp.data) return resp.data;
//     return [];
//   };

//   // Handlers: move edit handler above columnDefs so it's stable for memo
//   const handleEditMaterialCategory = useCallback((existingData: TMatrialCateogrymst) => {
//     // avoid unmounting/remounting the form repeatedly — update state then show form
//     setIsEditMode(true);
//     setFormData({ ...existingData });
//     setIsFormVisible(true);
//   }, []);

//   const columnDefs = useMemo<ColDef<TMatrialCateogrymst>[]>(
//     () => [
//       {
//         headerName: 'Material Category Description',
//         field: 'mater_category_desp',
//         sortable: true,
//         filter: true
//       },
//       {
//         headerName: 'Company Code',
//         field: 'company_code',
//         sortable: true,
//         filter: true
//       },
//       {
//         headerName: 'Actions',
//         sortable: false,
//         filter: false,
//         resizable: false,
//         width: 120,
//         cellRenderer: (params: any) => {
//           const actionButtons: TAvailableActionButtons[] = ['edit'];
//           return (
//             <ActionButtonsGroup
//               handleActions={(action) => {
//                 if (action === 'edit' && params.data) {
//                   handleEditMaterialCategory(params.data);
//                 }
//               }}
//               buttons={actionButtons}
//             />
//           );
//         }
//       }
//     ],
//     [handleEditMaterialCategory]
//   );

//   const onGridReady = (params: any) => {
//     setGridApi(params.api);
//     params.api.sizeColumnsToFit();
//   };

//   const onSelectionChanged = (params: any) => {
//     const selected = params.api.getSelectedRows();
//     setSelectedRows(selected);
//   };

//   // Global filter 
//   const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setGlobalFilter(value);

//     if (searchTimeoutRef.current) {
//       window.clearTimeout(searchTimeoutRef.current);
//     }

//     searchTimeoutRef.current = window.setTimeout(() => {
//       if (!mountedRef.current) return;
//       setLs_search(value);

//       const updatedSearchData: ISearch = {
//         search: [
//           [
//             {
//               field_name: 'global',
//               field_value: value,
//               operator: ''
//             }
//           ]
//         ]
//       };
//       setSearchData(updatedSearchData);
//     }, 500);
//   };

//   const toggleCatMatmasterForm = useCallback(() => {
//     setIsFormVisible((prev) => {
//       const next = !prev;
//       if (next === false) {
//         // closing form -> reset edit state
//         setIsEditMode(false);
//         setFormData(null);
//       }
//       return next;
//     });
//   }, []);

//   // Delete selected rows
//   const handleDeleteCatMatmaster = async () => {
//     if (!gridApi) return;

//     const selectedNodes = gridApi.getSelectedNodes();
//     const selectedIds = selectedNodes.map((node: any) => node.data?.mater_category_code).filter(Boolean);

//     if (selectedIds.length === 0) return;

//     if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} item(s)?`)) return;

//     try {
//       await PfSerivceInstance.deleteMasters(app, 'matcat_master', selectedIds);
//       setSelectedRows([]);
//       if (refetchCatMatData) await refetchCatMatData();
//     } catch (error) {
//       console.error('Error deleting items:', error);
//       alert('Error deleting items. Please try again.');
//     }
//   };

//   // Filter changed (debounced)
//   const onFilterChanged = useCallback((event: any) => {
//     if (filterTimeoutRef.current) {
//       window.clearTimeout(filterTimeoutRef.current);
//     }

//     filterTimeoutRef.current = window.setTimeout(() => {
//       const filterModel = event.api.getFilterModel();
//       const filters: any[] = [];

//       Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
//         const filterValue = value?.filter ?? value?.value;
//         if (filterValue !== undefined) {
//           filters.push([
//             {
//               field_name: field,
//               field_value: filterValue,
//               operator: 'equals'
//             }
//           ]);
//         }
//       });

//       setSearchData((prevData) => ({
//         ...(prevData ?? {}),
//         search: filters.length > 0 ? filters : [[]]
//       }));
//     }, 350);
//   }, []);

//   const onPaginationChanged = useCallback((params: any) => {
//     const currentPage = params.api.paginationGetCurrentPage();
//     const pageSize = params.api.paginationGetPageSize();
//     setPaginationData({ page: currentPage, rowsPerPage: pageSize });
//   }, []);

//   const onSortChanged = useCallback((params: any) => {
//     const columnState = params?.columnApi?.getColumnState?.();
//     const sortedColumn = columnState?.find((col: any) => col.sort);

//     setSearchData((prevData: any) => ({
//       ...(prevData ?? {}),
//       sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
//     }));
//   }, []);

//   useEffect(() => {
//     // initialize searchData once
//     setSearchData(null);
//   }, []);

//   const displayRows = useMemo(() => {
//     return rowsFromResponse(CatMatData);
//   }, [CatMatData]);

//   const isLoading = isCatMatLoading;

//   return (
//     <div className="flex flex-col space-y-2">
//       <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
//         <Link underline="hover" color="inherit" href="/dashboard">
//           Home
//         </Link>
//         <Link underline="hover" color="inherit" href="/pf/master">
//           Master
//         </Link>
//         <Link underline="hover" color="inherit" href="/pf/master/gm">
//           General Master
//         </Link>
//         <Typography color="text.primary">Material Category Master</Typography>
//       </Breadcrumbs>

//       <div className="flex justify-end space-x-2">
//         <Box sx={{ flexGrow: 1 }}>
//           <TextField
//             value={globalFilter}
//             onChange={handleGlobalFilterChange}
//             fullWidth
//             variant="outlined"
//             disabled={isLoading}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />
//         </Box>

//         {selectedRows.length > 0 && (
//           <Button variant="outlined" onClick={handleDeleteCatMatmaster} color="error" startIcon={<DeleteOutlined />} disabled={isLoading}>
//             Delete
//           </Button>
//         )}

//         {!isFormVisible && (
//           <Button startIcon={<PlusOutlined />} variant="contained" color="primary" onClick={() => { setIsEditMode(false); setFormData(null); setIsFormVisible(true); }} disabled={isLoading}>
//             Add Material Category
//           </Button>
//         )}
//       </div>

//       {/* Form overlay */}
//       {isFormVisible && (
//         <div className="form-overlay">
//           <AddMatCategorymasterPfForm
//             onClose={toggleCatMatmasterForm}
//             isEditMode={isEditMode}
//             existingData={
//               formData || {
//                 mater_category_code: '',
//                 mater_category_desp: ''
//               }
//             }
//           />
//         </div>
//       )}

//       {/* AgGrid table */}
//       {!isFormVisible && (
//         <CustomAgGrid
//           rowData={displayRows}
//           columnDefs={columnDefs}
//           onGridReady={onGridReady}
//           onFilterChanged={onFilterChanged}
//           onPaginationChanged={onPaginationChanged}
//           onSortChanged={onSortChanged}
//           onSelectionChanged={onSelectionChanged}
//           paginationPageSize={paginationData.rowsPerPage}
//           paginationPageSizeSelector={[10, 50, 100, 500]}
//           pagination={true}
//           height="500px"
//         />
//       )}
//     </div>
//   );
// };

// export default MaterialCatmasterPfpage;




