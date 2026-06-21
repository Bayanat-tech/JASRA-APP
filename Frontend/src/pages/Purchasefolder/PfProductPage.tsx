import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Box, Breadcrumbs, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import { TProduct } from '../WMS/types/product-wms.types';
//import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { FormattedMessage } from 'react-intl';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import UniversalDialog from 'components/popup/UniversalDialog';
import AddPfProductForm from '../../components/forms/Purchaseflow/AddPfProductform';
import { SearchIcon } from 'lucide-react';

const PfProductPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData] = useState<ISearch>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [openDialog, setOpenDialog] = useState(false);

  // Removed unused states:
  // const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({...});
  // const [cancelPopup, setCancelPopup] = useState<TUniversalDialogProps>({...});

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  //----------- useQuery--------------
  const { data: productData } = useQuery({
    queryKey: ['prod_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  }); //refetch: refetchProductData

  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditProduct = (existingData: TProduct) => {
    // Future edit handler logic
  };

  const handleActions = (actionType: string, rowOriginal: TProduct) => {
    actionType === 'edit' && handleEditProduct(rowOriginal);
  };

  // Columns for AgGrid
  const columnDefs = useMemo<ColDef<TProduct>[]>(
    () => [
      {
        headerName: 'Prin Code',
        field: 'prin_code',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: true,
        filter: true
      },
      {
        headerName: 'Prod Code',
        field: 'prod_code',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Product Name',
        field: 'prod_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Group Code',
        field: 'group_code',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Brand Code',
        field: 'brand_code',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Bar Code',
        field: 'barcode',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

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
        <Typography color="text.primary">Product Master</Typography>
      </Breadcrumbs>
      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
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
        <Button variant="outlined" color="error" hidden={!Object.keys(rowSelection).length} startIcon={<DeleteOutlined />}>
          <FormattedMessage id="Delete" />
        </Button>

        <Button startIcon={<PlusOutlined />} variant="contained" color="customBlue" onClick={handleOpenDialog}>
          <FormattedMessage id="Product" />
        </Button>

        <UniversalDialog
          disablePrimaryButton={true} // Replace `open={openDialog}` with `action={{ open: openDialog, fullWidth: true, maxWidth: 'lg' }}`
          action={{ open: openDialog, fullWidth: true, maxWidth: 'lg' }}
          onClose={handleCloseDialog}
          title="Add Product"
        >
          <AddPfProductForm onClose={handleCloseDialog} isEditMode={false} />
        </UniversalDialog>
      </div>

      <CustomAgGrid
        rowData={productData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={(params: any) => setRowSelection(params.api.getSelectedRows())}
        onPaginationChanged={(params: any) =>
          handleChangePagination(params.api.paginationGetCurrentPage(), params.api.paginationGetPageSize())
        }
        paginationPageSize={1000}
        paginationPageSizeSelector={[10, 20, 50, 100, 500, 1000]}
        pagination={true}
        height="470px"
      />
    </div>
  );
};

export default PfProductPage;
