import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Box, Breadcrumbs, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { TcustomerMastertypes } from './type/customer-master-types';
import { ColDef } from 'ag-grid-community';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';

// import AddSupplierPfForm from 'components/forms/Purchaseflow/AddSupplierPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

import CustomerMasterForm from 'components/forms/Purchaseflow/CustomerMasterForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { SearchIcon } from 'lucide-react';

const CustomerMasterPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [ls_search, setLs_search] = useState<string>('');
  const [CustomermasterViewPopup, setCustomermasterViewPopup] = useState<{
    action: { open: boolean };
    title: string;
    data: { existingData: TcustomerMastertypes | null; isViewMode: boolean };
  }>({
    action: { open: false },
    title: '',
    data: { existingData: null, isViewMode: false }
  });

  const [CustomerFormPopup, setCustomerFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true
      // maxWidth: 'xl'
    },
    title: 'Add Customer Master',
    data: { existingData: {}, isEditMode: false, isViewMode: false }
  });
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerName: '',
        width: 50,
        pinned: 'left',
        filter: false,
        sortable: false
      },
      {
        field: 'cust_code',
        headerName: 'Customer Code',
        sortable: true,
        filter: true
      },
      {
        field: 'cust_name',
        headerName: 'Customer Name',
        sortable: true,
        filter: true
      },
      {
        field: 'cust_add1',
        headerName: 'Customer Address 1',
        sortable: true,
        filter: true
      },
      {
        field: 'cust_add2',
        headerName: 'Customer Address 2',
        sortable: true,
        filter: true
      },
      {
        field: 'cust_add3',
        headerName: 'Customer Address 3',
        sortable: true,
        filter: true
      },
      {
        field: 'pincode',
        headerName: 'Pincode',
        sortable: true,
        filter: true
      },
      {
        field: 'phone_number',
        headerName: 'Phone Number',
        sortable: true,
        filter: true
      },
      {
        field: 'email_id',
        headerName: 'Email ID',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          const actionButtons: TAvailableActionButtons[] = ['edit', 'view', 'delete'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  //----------- useQuery--------------
  const children = permissions?.[app.toUpperCase()]?.children || {}; // Ensure it's always an object

  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());

  console.log('Resolved Module Key:', moduleKey);

  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  console.log('Resolved Serial Number:', serialNumber);

  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  console.log('Permission Check:', permissionCheck);

  const isQueryEnabled = Boolean(permissionCheck); // ✅ Ensures strict boolean value
  console.log('Final Enabled Value:', isQueryEnabled);

  const { data: CustomerData, refetch: refetchCustomerData } = useQuery({
    queryKey: ['customer_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled: isQueryEnabled // ✅ Now always a boolean
    // staleTime: 10000
  });

  console.log('Customer Data:', CustomerData);

  const { refetch: refetchSearchCostmasterData } = useQuery({
    queryKey: ['cost_data', searchData, paginationData],

    queryFn: () => PfSerivceInstance.getPfglobalsearch(app, `cost_master$$$${ls_search}`, paginationData, searchData),

    enabled: isQueryEnabled,

    staleTime: 10000
  });

  //-------------handlers---------------

  const handleViewProjectmaster = (existingData: TcustomerMastertypes) => {
    setCustomermasterViewPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'View Customer Master',
      data: { existingData, isEditMode: false, isViewMode: true }
    }));
  };

  const handleEditCustomer = (existingData: TcustomerMastertypes) => {
    setCustomerFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: 'Edit Customer Master',
      data: { existingData, isEditMode: true }
    }));
  };

  const handledeleteCustomermaster = async (rowOriginal: TcustomerMastertypes) => {
    await PfSerivceInstance.deleteMasters('pf', 'customermaster', [rowOriginal.cust_code]);
    console.log('inside handledeleteProjectmaster');
    console.log(rowOriginal.cust_code);
    refetchCustomerData();
  };

  const toggleSupplierPopup = (refetchData?: boolean) => {
    if (CustomerFormPopup.action.open === true && refetchData) {
      refetchCustomerData();
    }
    setCustomerFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TcustomerMastertypes) => {
    if (actionType === 'edit') {
      handleEditCustomer(rowOriginal);
    } else if (actionType === 'delete') {
      handledeleteCustomermaster(rowOriginal);
    } else if (actionType === 'view') {
      handleViewProjectmaster(rowOriginal);
    }
  };

  const handleDeleteCustomer = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the selected ${pathNameList[pathNameList.length - 1]}?`);
    if (confirmDelete) {
      await PfSerivceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
      setRowSelection({});
      refetchCustomerData();
    }
  };

  // const handleViewProjectmaster = (existingData: TcustomerMastertypes) => {
  //   setCustomermasterViewPopup((prev) => ({
  //     ...prev,
  //     action: { ...prev.action, open: true },
  //     title: 'View Customer Master',
  //     data: { existingData, isViewMode: true }
  //   }));
  // };

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
    refetchSearchCostmasterData();
  };
  const toggleCustomermasterViewPopup = () => {
    setCustomermasterViewPopup((prev) => ({
      ...prev,
      action: { open: !prev.action.open }
    }));
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', CustomerData?.tableData);
  };

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

  //------------------useEffect----------------
  // useEffect(() => {
  //   setSearchData(null as any);
  //   setToggleFilter(null as any);
  // }, []);

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
        <Typography color="text.primary">Customer Master</Typography>
      </Breadcrumbs>
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
        {Object.keys(rowSelection).length > 0 && (
          <Button variant="outlined" onClick={handleDeleteCustomer} color="error" startIcon={<DeleteOutlined />}>
            Delete
          </Button>
        )}
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => toggleSupplierPopup()}>
          Customer
        </Button>
      </div>
      <CustomAgGrid
        rowData={CustomerData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeOptions={[10, 20, 50]}
        pagination={true}
        height="500px"
        onSortChanged={onSortChanged}
      />
      {!!CustomerFormPopup.action.open && (
        <UniversalDialog
          action={{ ...CustomerFormPopup.action }}
          onClose={toggleSupplierPopup}
          title={CustomerFormPopup.title}
          hasPrimaryButton={false}
        >
          <CustomerMasterForm
            onClose={toggleSupplierPopup}
            isEditMode={CustomerFormPopup?.data?.isEditMode}
            existingData={CustomerFormPopup.data.existingData}
            isViewMode={CustomerFormPopup?.data?.isViewMode}
          />
        </UniversalDialog>
      )}
      {!!CustomermasterViewPopup.action.open && (
        <UniversalDialog
          action={{ ...CustomermasterViewPopup.action }}
          onClose={toggleCustomermasterViewPopup}
          title={CustomermasterViewPopup.title}
          hasPrimaryButton={false}
        >
          <CustomerMasterForm
            onClose={toggleCustomermasterViewPopup}
            isEditMode={false} // Ensures edit mode is off
            existingData={CustomermasterViewPopup.data.existingData ?? ({} as TcustomerMastertypes)}
            isViewMode={true} // Disable inputs for view mode
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default CustomerMasterPage;
