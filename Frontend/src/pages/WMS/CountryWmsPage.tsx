import { Box, Button, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddCountryWmsForm from 'components/forms/AddCountryWmsForm';
import UniversalDelete from 'components/popup/UniversalDelete';
import UniversalDialog from 'components/popup/UniversalDialog';
import { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation } from 'react-router';
import countryServiceInstance from 'service/GM/service.country_wms';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TCountry } from './types/country-wms.types';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { PlusOutlined } from '@ant-design/icons';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const CountryWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth(); // Get user permissions
  const location = useLocation(); // Get current location
  const pathNameList = getPathNameList(location.pathname); // Get path name list
  const { app } = useSelector((state: any) => state.menuSelectionSlice); // Get selected app from state
  const serialNo = permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString(); // Get serial number for permissions
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] }); // State for pagination data
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const gridRef = useRef<any>(null); // Use ref for ag-grid like InboundJobWmsPage
  const [, setSearchData] = useState<ISearch>();
  const [filterData] = useState<ISearch>(filter);
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [, setLs_search] = useState<string>('');
  const [countryFormPopup, setCountryFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Country" />,
    data: { existingData: {}, isEditMode: false }
  }); // State for country form popup

  const intl = useIntl();

  console.log(intl.locale);

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

  //----------- useQuery--------------
  const {
    data: countryData,
    isLoading,
    error,
    refetch: refetchCountryData
  } = useQuery({
    queryKey: ['country_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled: !!user_permission && Object.keys(user_permission)?.includes(serialNo)
  }); // Query to fetch country data

  const columnDefs = useMemo<ColDef[]>(
    () => [
      // {
      //   headerName: '',
      //   field: 'checkbox',
      //   checkboxSelection: true,
      //   headerCheckboxSelection: true,
      //   width: 50,
      //   pinned: 'left',
      //   sortable: false,
      //   filter: false
      // },
      {
        field: 'country_code',
        headerName: intl.formatMessage({ id: 'Country Code' }) || 'Country Code',
        sortable: true,
        filter: true
      },
      {
        field: 'country_name',
        headerName: intl.formatMessage({ id: 'Country Name' }) || 'Country Name'
      },
      {
        field: 'country_gcc',
        headerName: 'Country GCC'
      },
      {
        field: 'company_code',
        headerName: 'Company Code'
      },
      {
        field: 'short_desc',
        headerName: 'Short Description'
      },
      {
        field: 'nationality',
        headerName: 'Nationality'
      },
      {
        headerName: 'Actions',
        filter: 'false',
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  // Transform API data to ensure each row has an 'id' property for the grid
  const gridTableData = useMemo(() => {
    if (!countryData?.tableData || !Array.isArray(countryData.tableData)) return [];
    return countryData.tableData.map((row: any) => ({
      ...row,
      id: row.country_code || Math.random().toString(36).substring(2, 9)
    }));
  }, [countryData]);

  // Debug: log gridTableData before rendering grid
  console.log('gridTableData:', gridTableData);

  // Add debugging to see what data is coming from API
  useEffect(() => {
    console.log('=== COUNTRY DATA DEBUG ===');
    console.log('1. Raw countryData:', countryData);
    console.log('2. countryData type:', typeof countryData);
    console.log('3. countryData.tableData:', countryData?.tableData);
    console.log('4. Is loading:', isLoading);
    console.log('5. Error:', error);
    console.log('6. Array check:', Array.isArray(countryData?.tableData));
    console.log('7. Length:', countryData?.tableData?.length);
    console.log('8. Sample data:', countryData?.tableData?.slice(0, 2));
  }, [countryData, isLoading, error]);

  // Add effect to monitor grid data changes and force refresh
  useEffect(() => {
    console.log('=== GRID DATA UPDATE ===');
    console.log('Country data length:', countryData?.tableData?.length || 0);
    console.log('Sample country data:', countryData?.tableData?.slice(0, 3));
    console.log('Grid ref current:', !!gridRef.current);

    // Force grid refresh when data changes
    if (gridRef.current?.api && Array.isArray(countryData?.tableData) && (countryData?.tableData?.length || 0) > 0) {
      console.log('Forcing grid refresh...');
      setTimeout(() => {
        gridRef.current.api.refreshCells({ force: true });
        gridRef.current.api.redrawRows();
      }, 100);
    }
  }, [countryData]);

  //-------------handlers---------------

  const handleEditCountry = (existingData: TCountry) => {
    setCountryFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Country" />,
        data: { existingData, isEditMode: true }
      };
    }); // Handle edit country
  };

  const toggleCountryPopup = (refetchData?: boolean) => {
    if (countryFormPopup.action.open === true && refetchData) {
      refetchCountryData();
    }
    setCountryFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    }); // Toggle country form popup
  };

  const handleActions = (actionType: string, rowOriginal: TCountry) => {
    actionType === 'edit' && handleEditCountry(rowOriginal); // Handle actions
  };

  const handleDeleteCountry = async () => {
    await countryServiceInstance.deleteCountry(Object.keys(rowSelection)); // Handle delete country
    setRowSelection({});
    refetchCountryData();
    setDeletePopup(false);
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
    refetchCountryData();
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

  const onGridReady = (params: any) => {
    gridRef.current = params; // Assign grid ref like InboundJobWmsPage
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', countryData?.tableData);
  };

  const onSelectionChanged = useCallback((params: any) => {
    const selectedRows = params.api.getSelectedRows();
    const selectedRowIds: RowSelectionState = {};
    selectedRows.forEach((row: any, index: number) => {
      selectedRowIds[index] = true;
    });
    setRowSelection(selectedRowIds);
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData: any) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  //---------custom-filter---------

  return (
    <div className="flex flex-col space-y-2">
      {/* Fallback message if gridTableData is empty but API has data */}
      {Array.isArray(countryData?.tableData) && (countryData?.tableData?.length ?? 0) > 0 && gridTableData.length === 0 && (
        <div style={{ color: 'red', fontWeight: 'bold' }}>Grid data is empty but API returned data. Check data mapping and getRowId.</div>
      )}
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
          // color="customBlue"
          // variant="contained"
          disabled={user_permission?.[serialNo].new === 'N'}
          onClick={() => toggleCountryPopup()}
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
        >
          Add Country
        </Button>
        {Object.keys(rowSelection).length > 0 && (
          <Button
            color="error"
            variant="contained"
            disabled={user_permission?.[serialNo].delete === 'N'}
            onClick={() => setDeletePopup(true)}
          >
            Delete Selected ({Object.keys(rowSelection).length})
          </Button>
        )}
      </div>

      <CustomAgGrid
        ref={gridRef}
        key={gridTableData.length > 0 ? `${gridTableData.length}-${gridTableData[0]?.id}` : 'empty'}
        rowData={gridTableData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onSelectionChanged={onSelectionChanged}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination={true}
        rowSelection="multiple"
        suppressRowClickSelection={true}
        height="500px"
        rowHeight={20}
        headerHeight={30}
        getRowId={(params: any) => {
          const data = params.data;
          if (!data) return `empty-row-${Math.random()}`;
          return data.id || data.country_code || Math.random().toString(36).substring(2, 9);
        }}
      />

      {!!countryFormPopup && countryFormPopup.action.open && (
        <UniversalDialog
          action={{ ...countryFormPopup.action }}
          onClose={toggleCountryPopup} // Handle dialog close
          title={countryFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddCountryWmsForm
            onClose={toggleCountryPopup}
            isEditMode={countryFormPopup?.data?.isEditMode}
            existingData={countryFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
      {openDeletePopup === true && (
        <UniversalDelete
          open={openDeletePopup}
          handleClose={handleCloseDelete}
          title={Object.keys(rowSelection).length}
          handleDelete={handleDeleteCountry}
        />
      )}
    </div>
  );
};

export default CountryWmsPage;

// To test if the query is the issue, try removing the 'enabled' property from useQuery temporarily.
