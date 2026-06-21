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
//import { TCountry } from './types/country-wms.types';
import { TProdtype } from './types/producttype-wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddProducttypeWmsForm from 'components/forms/AddProdTypeWmsForm';
//import AddCountryWmsForm from 'components/forms/AddCountryWmsForm';
import { FormattedMessage } from 'react-intl';
//import countryServiceInstance from 'service/GM/service.country_wms';
import producttypeServiceInstance from 'service/GM/service.prodtype_wms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const ProducttypeWmsPage = () => {
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
  const [producttypeFormPopup, setProducttypeFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Producttype" />,
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
        field: 'prodtype_code',
        headerName: 'Product Type Code',
        sortable: true,
        filter: true
      },
      {
        field: 'prodtype_desc',
        headerName: 'Product Type Name'
      },
      {
        field: 'company_code',
        headerName: 'Company Code'
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
    data: producttypeData,
    //isFetching: isProducttypeFetchLoading,
    refetch: refetchProducttypeData
  } = useQuery({
    queryKey: ['producttype_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditProducttype = (existingData: TProdtype) => {
    setProducttypeFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Product Type" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

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
    refetchProducttypeData();
  };

  const toggleProducttypePopup = (refetchData?: boolean) => {
    if (producttypeFormPopup.action.open === true && refetchData) {
      refetchProducttypeData();
    }
    setProducttypeFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TProdtype) => {
    actionType === 'edit' && handleEditProducttype(rowOriginal);
  };

  const handleDeleteProducttype = async () => {
    await producttypeServiceInstance.deleteProducttype(Object.keys(rowSelection));
    setRowSelection({});
    refetchProducttypeData();
  };

  // const handleImportData = async (values: TProdtype[]) => {
  //   const response = await producttypeServiceInstance.addBulkData(values);
  //   if (response) {
  //     refetchProducttypeData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleExportData = async () => {
  //   const response = await producttypeServiceInstance.exportData();
  //   if (response) {
  //     refetchProducttypeData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleFilterChange = (value: ISearch['search']) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       search: value
  //     };
  //   });
  // };
  // const handleSortingChange = (sorting: SortingState) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
  //     };
  //   });
  // };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', producttypeData?.tableData);
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

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

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
      <div className="flex p-2  justify-end space-x-2 w-full">
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
          size="small"
          variant="outlined"
          onClick={handleDeleteProducttype}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>
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
          onClick={() => toggleProducttypePopup()}
        >
          Producttype
        </Button>
      </div>
      <CustomAgGrid
        rowData={producttypeData?.tableData || []}
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
      {!!producttypeFormPopup && producttypeFormPopup.action.open && (
        <UniversalDialog
          action={{ ...producttypeFormPopup.action }}
          onClose={toggleProducttypePopup}
          title={producttypeFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddProducttypeWmsForm
            onClose={toggleProducttypePopup}
            isEditMode={producttypeFormPopup?.data?.isEditMode}
            existingData={producttypeFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ProducttypeWmsPage;
