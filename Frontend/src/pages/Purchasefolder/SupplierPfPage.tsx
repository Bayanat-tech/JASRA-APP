import { Box, Breadcrumbs, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'store';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
//import GmSupplierPfServiceInstance from 'service/Purchaseflow/service.supplier_pf';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { getPathNameList } from 'utils/functions';
import { SearchIcon } from 'lucide-react';
import { TSupplier } from './type/supplier-pf-types';
import AddSupplierPfForm from 'components/forms/Purchaseflow/AddSupplierPfForm';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import { PlusOutlined } from '@ant-design/icons';

const SupplierPfPage = () => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch>();
  //const [ setSelectedRows] = useState<any[]>([]);
  const [, setGridApi] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [ls_search, setLs_search] = useState('');

  // Debounce refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  //const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [SuppliermasterFormPopup, setSuppliermasterFormPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'sm' },
    title: 'Add Supplier Master',
    data: { existingData: {}, isEditMode: false, isViewMode: false }
  });

  const { isQueryEnabled } = useMemo(() => {
    const children = permissions?.[app.toUpperCase()]?.children || {};
    const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
    const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;

    const isQueryEnabled = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

    return { isQueryEnabled };
  }, [permissions, app, pathNameList, user_permission]);

  const columnDefs = useMemo<ColDef<TSupplier>[]>(() => {
    return [
      {
        headerName: 'Supplier Code',
        field: 'supp_code',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: true,
        filter: true,
        minWidth: 150
      },
      {
        headerName: 'Supplier Name',
        field: 'supp_name',
        sortable: true,
        filter: true,
        minWidth: 200
      },
      {
        headerName: 'City',
        field: 'supp_city',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Mobile',
        field: 'mobile',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        sortable: false,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
          return (
            <ActionButtonsGroup
              buttons={actionButtons}
              handleActions={(action) => {
                if (action === 'edit') handleEditSupplier(params.data);
                if (action === 'delete') handleDeleteSupplier(params.data);
              }}
            />
          );
        }
      }
    ];
  }, []);

  const {
    data: SupplierData,
    refetch: refetchSupplierData,
    isLoading: isSupplierLoading,
  } = useQuery({
    queryKey: ['supplier_data', searchData, paginationData, app],
    queryFn: () => PfSerivceInstance.getMasters(app, 'supplier_master', paginationData, searchData),
    enabled: isQueryEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  // Search data query
  const {
    data: searchSupplierData,
    // refetch: refetchSearchSupplierData,
    isLoading: isSearchLoading
  } = useQuery({
    queryKey: ['supplier_search', ls_search, paginationData, app],
    queryFn: () => PfSerivceInstance.getPfglobalsearch(app, `supplier_master$$$$${ls_search}`, paginationData, searchData),
    enabled: isQueryEnabled && ls_search.length > 0,
    staleTime: 2 * 60 * 1000
  });

  // Debounced global search handler
  const handleGlobalFilterChange = useCallback((event: any) => {
    const value = event.target.value;
    setGlobalFilter(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setLs_search(value);
      setSearchData({
        search: [[{ field_name: 'global', field_value: value, operator: '' }]]
      });
    }, 500);
  }, []);

  const handleEditSupplier = (rowData: TSupplier) => {
    setSuppliermasterFormPopup({
      ...SuppliermasterFormPopup,
      action: { open: true, fullWidth: true, maxWidth: 'sm' },
      title: 'Edit Supplier Master',
      data: {
        existingData: rowData,
        isEditMode: true,
        isViewMode: false
      }
    });
  };

  // Toggle form

  const toggleSupplierForm = useCallback(() => {
    setSuppliermasterFormPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open },
      data: { ...prev.data, isEditMode: false, existingData: {} }
    }));
  }, []);

  // Delete supplier
  const handleDeleteSupplier = async (rowOriginal: TSupplier) => {
    const ids = (rowOriginal as any)?.supp_code;
    await PfSerivceInstance.deleteMasters('pf', 'supplier_master', [ids]);
    refetchSupplierData();
  };

  //  const handleDeleteSupplier = async (rowOriginal: TSupplier) => {
  //     // derive an identifier from the row data; adjust keys if your backend expects a different field
  //     const id = (rowOriginal as any)?.id ?? (rowOriginal as any)?.supp_id ?? (rowOriginal as any)?.supp_code;
  //     if (!id) return;
  //     await PfSerivceInstance.deleteMasters('gm', 'supplier_master', [id]);
  //     refetchSupplierData();
  //   };

  // Grid ready
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  // Row selection
  // const onSelectionChanged = useCallback(() => {
  //   if (!gridApi) return;
  //   const selectedNodes = gridApi.getSelectedNodes();
  //   const selectedData = selectedNodes.map((node: any) => node.data);
  //   setSelectedRows(selectedData);
  // }, [gridApi]);

  // Determine display data
  const displayData = useMemo(() => {
    return ls_search.length > 0 ? searchSupplierData : SupplierData;
  }, [ls_search, searchSupplierData, SupplierData]);

  const isLoading = isSupplierLoading || isSearchLoading;

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
        <Typography color="text.primary">Supplier Master</Typography>
      </Breadcrumbs>

      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            placeholder="Search suppliers..."
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

        {!SuppliermasterFormPopup.action.open && (
          <Button startIcon={<PlusOutlined />} variant="contained" color="primary" onClick={toggleSupplierForm}>
            Add Supplier
          </Button>
        )}
      </div>

      {SuppliermasterFormPopup.action.open && (
        <UniversalDialog
          action={{ ...SuppliermasterFormPopup.action }}
          onClose={() => toggleSupplierForm()}
          title={SuppliermasterFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddSupplierPfForm
            onClose={() => {
              toggleSupplierForm();
              refetchSupplierData();
            }}
            isEditMode={SuppliermasterFormPopup.data.isEditMode}
            isViewMode={SuppliermasterFormPopup.data.isViewMode}
            existingData={SuppliermasterFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}

      <CustomAgGrid
        rowData={displayData as any}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onPaginationChanged ={onPaginationChanged}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000, 5000, 10000]}
        paginationPageSize={10000}
        rowSelection="multiple"
        // onSelectionChanged={onSelectionChanged}
        height="500px"
      />
    </div>
  );
};

export default SupplierPfPage;
