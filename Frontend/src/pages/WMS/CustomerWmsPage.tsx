import { Box, Button, InputAdornment, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'store';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/service.wms';
import CustomGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { getPathNameList } from 'utils/functions';
import { SearchIcon } from 'lucide-react';
import { TCustomer } from './types/customer-wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';
import { PlusOutlined } from '@ant-design/icons';
import AddCustomerWmsForm from 'components/forms/Wms/AddCustomerWmsForm';

const CustomerMasterPage = () => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch | null>(null);
  const [, setGridApi] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [customerFormPopup, setCustomerFormPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'sm' },
    title: 'Add Customer Master',
    data: { existingData: {}, isEditMode: false, isViewMode: false }
  });

  const { isQueryEnabled } = useMemo(() => {
    const children = permissions?.[app.toUpperCase()]?.children || {};
    const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
    const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;

    return {
      isQueryEnabled: !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber)
    };
  }, [permissions, app, pathNameList, user_permission]);

  const columnDefs = useMemo<ColDef<TCustomer>[]>(
    () => [
      {
        headerName: 'Customer Code',
        field: 'cust_code',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: true,
        filter: true
      },
      {
        headerName: 'Customer Name',
        field: 'cust_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Address',
        field: 'cust_addr1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'City',
        field: 'cust_city',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Mobile',
        field: 'cust_mobile_no',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Email',
        field: 'cust_email1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Fax No',
        field: 'cust_faxno1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Telephone No',
        field: 'cust_telno1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        width: 120,
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return (
            <ActionButtonsGroup
              buttons={actionButtons}
              handleActions={(action) => {
                if (action === 'edit') handleEditCustomer(params.data);
                if (action === 'delete') handleDeleteCustomer(params.data);
              }}
            />
          );
        }
      }
    ],
    []
  );

  const {
    data: customerData,
    refetch: refetchCustomerData,
    isLoading
  } = useQuery({
    queryKey: ['customer_data', paginationData, searchData, app],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled: isQueryEnabled
  });

  // GLOBAL SEARCH
  const handleGlobalFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setSearchData(
        value
          ? {
              search: [[{ field_name: 'global', field_value: value, operator: '' }]]
            }
          : null
      );
    }, 500);
  }, []);

  //  Action Handlers
  const handleEditCustomer = (rowData: TCustomer) => {
    setCustomerFormPopup({
      ...customerFormPopup,
      action: { open: true, fullWidth: true, maxWidth: 'sm' },
      title: 'Edit Customer Master',
      data: { existingData: rowData, isEditMode: true, isViewMode: false }
    });
  };

  const toggleCustomerForm = useCallback(() => {
    setCustomerFormPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open },
      data: prev.action.open ? { existingData: {}, isEditMode: false, isViewMode: false } : prev.data
    }));
  }, []);

  const handleDeleteCustomer = async (row: TCustomer) => {
    await WmsSerivceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], [row.cust_code]);
    refetchCustomerData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const onPaginationChanged = useCallback((params: any) => {
    setPaginationData({
      page: params.api.paginationGetCurrentPage(),
      rowsPerPage: params.api.paginationGetPageSize()
    });
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      {/* <Breadcrumbs>
        <Link underline="hover" color="inherit" href="/dashboard">Home</Link>
        <Link underline="hover" color="inherit" href="/wms/master">Master</Link>
        <Typography color="text.primary">Customer</Typography>
      </Breadcrumbs> */}

      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            placeholder="Search customers..."
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

        {!customerFormPopup.action.open && (
          <Button startIcon={<PlusOutlined />} variant="contained" onClick={toggleCustomerForm}>
            Add Customer
          </Button>
        )}
      </div>

      <CustomGrid
        rowData={customerData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onPaginationChanged={onPaginationChanged}
        pagination
        paginationPageSize={paginationData.rowsPerPage}
        height="500px"
      />

      {customerFormPopup.action.open && (
        <UniversalDialog
          action={{ ...customerFormPopup.action }}
          onClose={() => toggleCustomerForm()}
          title={customerFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddCustomerWmsForm
            onClose={() => {
              toggleCustomerForm();
              refetchCustomerData();
            }}
            isEditMode={customerFormPopup.data.isEditMode}
            existingData={customerFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default CustomerMasterPage;
