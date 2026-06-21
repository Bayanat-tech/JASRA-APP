import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CloudUpload } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TProduct } from './types/product-wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddProductWmsForm from 'components/forms/AddProductWmsForm';
import { FormattedMessage, useIntl } from 'react-intl';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
// import productServiceInstance from 'service/GM/service.product_wms';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef, GridApi } from 'ag-grid-community';
import ImportProductDialog from './ImportProductDialog';
// import { useTheme } from '@mui/material';
const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

const ProductWmsPage = () => {
  //--------------constants----------
  // const theme = useTheme();
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: 10000 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<TProduct[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const intl = useIntl();

  // Enhanced debugging
  useEffect(() => {
    console.log('=== Translation Debug ===');
    console.log('Current locale:', intl.locale);
    console.log('Available messages:', intl.messages);
    console.log('Test translations:', {
      'Product Code': intl.formatMessage({ id: 'Product Code' }),
      Actions: intl.formatMessage({ id: 'Actions' }),
      'Product Name': intl.formatMessage({ id: 'Product Name' })
    });
    console.log('Direct message lookup:', {
      'Product Code': intl.messages?.['Product Code'],
      Actions: intl.messages?.['Actions'],
      'Product Name': intl.messages?.['Product Name']
    });
  }, [intl.locale, intl.messages]);

  const [productFormPopup, setProductFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Product" />,
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColDef<TProduct>[]>(
    () => [
      {
        // headerName: intl.formatMessage({ id: "Select" }),
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        maxWidth: 50,
        filter: false
      },
      {
        field: 'prinCode',
        headerName: intl.formatMessage({ id: 'Prin Code' }) || 'Prin Code',
        maxWidth: 120
      },
      {
        field: 'prodCode',
        headerName: intl.formatMessage({ id: 'Product Code' }) || 'Product Code',
        maxWidth: 140
      },
      {
        field: 'prodName',
        headerName: intl.formatMessage({ id: 'Product Name' }) || 'Product Name',
        flex: 1,
        minWidth: 200
      },
      {
        field: 'groupCode',
        headerName: intl.formatMessage({ id: 'Group Code' }) || 'Group Code',
        maxWidth: 130
      },
      {
        field: 'brandCode',
        headerName: intl.formatMessage({ id: 'Brand Code' }) || 'Brand Code',
        maxWidth: 130
      },
      {
        field: 'barcode',
        headerName: intl.formatMessage({ id: 'Barcode' }) || 'Barcode',
        maxWidth: 130
      },
      {
        headerName: intl.formatMessage({ id: 'Actions' }) || 'Actions',
        maxWidth: 140,
        filter: false,
        cellRenderer: ({ data }: { data: TProduct }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    [intl.locale, intl.messages] // Add intl.messages to dependencies
  );

  //----------- useQuery--------------
  const {
    data: productData,
    // isFetching: isProductFetchLoading,
    refetch: refetchProductData
  } = useQuery({
    queryKey: ['prod_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------
  // const handleChangePagination = (page: number, rowsPerPage: number) => {
  //   setPaginationData({ page, rowsPerPage });
  // };

  const handleEditProduct = (existingData: TProduct) => {
    setProductFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Product" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleProductPopup = (refetchData?: boolean) => {
    if (productFormPopup.action.open === true && refetchData) {
      refetchProductData();
    }
    setProductFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };
  function handleChangePagination(currentPage: number, pageSize: number): void {
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }

  const handleActions = (actionType: string, rowOriginal: TProduct) => {
    actionType === 'edit' && handleEditProduct(rowOriginal);
  };
  const handleDeleteProduct = async () => {
    const productCodesToDelete = rowSelection.map((row) => row.prodCode);
    await WmsSerivceInstance.deleteMasters('wms', 'product', productCodesToDelete);
    setRowSelection([]);
    refetchProductData(); // This will update the grid data automatically
    // Remove any api.setRowData() calls here
  };
  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        {rowSelection.length > 0 && (
          <Button variant="outlined" onClick={handleDeleteProduct} color="error" startIcon={<DeleteOutlined />}>
            <FormattedMessage id="Delete" />
          </Button>
        )}
        <Button
          startIcon={<PlusOutlined />}
          sx={{
            marginTop: '6px',
            marginBottom: '4px',
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
          variant="contained"
          onClick={() => toggleProductPopup()}
        >
          <FormattedMessage id="Add Product" />
        </Button>
        <Button
          startIcon={<CloudUpload />}
          sx={{
            marginTop: '6px',
            marginBottom: '4px',
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#1976d2',
            border: '1.5px solid #1976d2',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#1976d2',
              color: '#fff',
              border: '1.5px solid #1976d2'
            }
          }}
          variant="contained"
          onClick={() => setImportDialogOpen(true)}
        >
          <FormattedMessage id="Import" />
        </Button>
      </div>

      <CustomAgGrid
        columnDefs={columns}
        rowData={productData?.tableData || []} // Grid updates automatically when this changes
        onGridReady={(params: any) => {
          setGridApi(params.api);
          if (params.api) {
            setRowSelection(params.api.getSelectedRows());
          }
        }}
        onSelectionChanged={() => {
          if (gridApi) {
            setRowSelection(gridApi.getSelectedRows());
          }
        }}
        onPaginationChanged={(params: any) =>
          handleChangePagination(params.api.paginationGetCurrentPage(), params.api.paginationGetPageSize())
        }
        rowSelection="multiple"
        suppressRowClickSelection={true}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={rowsPerPageOptions}
        pagination={true}
        height="500px"
        rowHeight={20}
        headerHeight={40}
      />
      {!!productFormPopup && productFormPopup.action.open && (
        <UniversalDialog
          action={{ ...productFormPopup.action }}
          onClose={toggleProductPopup}
          title={productFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddProductWmsForm
            onClose={toggleProductPopup}
            isEditMode={productFormPopup?.data?.isEditMode}
            existingData={productFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
      <ImportProductDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
          refetchProductData();
          setImportDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ProductWmsPage;
