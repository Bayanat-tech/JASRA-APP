import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
// import { SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TBrand } from './types/brand-wms.types';
import { FormattedMessage } from 'react-intl';
import AddBrandWmsForm from 'components/forms/AddBrandWmsForm';
// import brandServiceInstance from 'service/GM/service.brand_wms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef, GridApi } from 'ag-grid-community';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};

const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

const BrandWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [filterData] = useState<ISearch>(filter);
  const [, setGridApi] = useState<GridApi | null>(null);
  const gridRef = useRef<any>(null);
  const [, setReloadGrid] = useState<boolean>(false);

  // Manual selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<TBrand[]>([]);

  const [brandFormPopup, setBrandFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Brand',
    data: { existingData: {}, isEditMode: false }
  });

  //----------- useQuery--------------
  const {
    data: brandData,
    // isFetching: isBrandFetchLoading,
    refetch: refetchBrandData
  } = useQuery({
    queryKey: ['brand_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  // Improved row data transformation with proper validation and stable keys
  const transformedRowData = useMemo(() => {
    if (!brandData?.tableData) return [];

    const transformed = (brandData.tableData as any[])
      .map((row, index) => {
        if (!row) return null;

        // Transform camelCase to snake_case
        const transformedRow: TBrand = {
          brand_code: row.brandCode || row.brand_code,
          prin_code: row.prinCode || row.prin_code,
          group_code: row.groupCode || row.group_code,
          brand_name: row.brandName || row.brand_name,
          pref_site: row.prefSite || row.pref_site,
          pref_loc_from: row.prefLocFrom || row.pref_loc_from,
          pref_loc_to: row.prefLocTo || row.pref_loc_to,
          pref_aisle_from: row.prefAisleFrom || row.pref_aisle_from,
          pref_aisle_to: row.prefAisleTo || row.pref_aisle_to,
          pref_col_from: row.prefColFrom ?? row.pref_col_from,
          pref_col_to: row.prefColTo ?? row.pref_col_to,
          pref_ht_from: row.prefHtFrom ?? row.pref_ht_from,
          pref_ht_to: row.prefHtTo ?? row.pref_ht_to,
          company_code: row.companyCode || row.company_code,
          updated_at: row.updatedAt || row.updated_at,
          updated_by: row.updatedBy || row.updated_by,
          created_by: row.createdBy || row.created_by,
          created_at: row.createdAt || row.created_at
        };

        if (!transformedRow.brand_code) return null;

        return {
          ...transformedRow,
          _uniqueKey: `${transformedRow.brand_code}_${transformedRow.prin_code || 'no_prin'}_${transformedRow.company_code || 'no_company'}_${index}`
        };
      })
      .filter((row): row is TBrand & { _uniqueKey: string } => row !== null && typeof row.brand_code === 'string')
      .sort((a, b) => {
        // Add stable sorting to prevent order changes
        return (a.brand_code ?? '').localeCompare(b.brand_code ?? '');
      });

    return transformed;
  }, [brandData?.tableData]);

  // Stable function to update selection state
  const updateSelectionState = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedRowIds(newSelectedIds);

      // Update selected rows based on current data
      const newSelectedRows = transformedRowData.filter((row) => newSelectedIds.has(row._uniqueKey));
      setSelectedRows(newSelectedRows);
    },
    [transformedRowData]
  );

  const columns = useMemo(
    (): ColDef<TBrand>[] => [
      {
        headerName: '',
        pinned: 'left',
        width: 50,
        maxWidth: 50,
        filter: false,
        sortable: false,
        resizable: false,
        suppressMenu: true,
        lockPosition: true,
        headerComponent: () => {
          const allSelected = selectedRowIds.size === transformedRowData.length && transformedRowData.length > 0;
          const someSelected = selectedRowIds.size > 0;
          return (
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected && !allSelected;
              }}
              onChange={(e) => {
                e.stopPropagation();
                if (e.target.checked) {
                  // Select all using _uniqueKey as unique identifier
                  const allIds = new Set(transformedRowData.map((row) => row._uniqueKey));
                  updateSelectionState(allIds);
                } else {
                  // Deselect all
                  updateSelectionState(new Set());
                }
              }}
            />
          );
        },
        cellRenderer: (params: any) => {
          const rowId = params.data._uniqueKey;
          const isSelected = selectedRowIds.has(rowId);
          return (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                const newSelectedIds = new Set(selectedRowIds);
                if (e.target.checked) {
                  newSelectedIds.add(rowId);
                } else {
                  newSelectedIds.delete(rowId);
                }
                updateSelectionState(newSelectedIds);
              }}
            />
          );
        }
      },
      {
        field: 'brand_code',
        headerName: 'Brand Code',
        maxWidth: 140,
        cellStyle: { fontSize: '12px' }
      },
      {
        field: 'brand_name',
        headerName: 'Brand Name',
        flex: 1,
        minWidth: 200,
        cellStyle: { fontSize: '12px' }
      },
      {
        field: 'company_code',
        headerName: 'Company Code',
        maxWidth: 150,
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Actions',
        maxWidth: 140,
        filter: false,
        sortable: false,
        pinned: 'right',
        cellStyle: { fontSize: '12px' },
        cellRenderer: ({ data }: { data: TBrand }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    [selectedRowIds, transformedRowData, updateSelectionState]
  );

  // Clean up invalid selections when data changes
  useEffect(() => {
    if (transformedRowData.length > 0) {
      const validIds = new Set(transformedRowData.map((row) => row._uniqueKey));
      const cleanedSelection = new Set(Array.from(selectedRowIds).filter((id) => validIds.has(id)));

      // Only update if there are invalid selections to remove
      if (cleanedSelection.size !== selectedRowIds.size) {
        updateSelectionState(cleanedSelection);
      }
    }
  }, [transformedRowData, selectedRowIds, updateSelectionState]);

  //-------------handlers---------------
  // const handleChangePagination = (page: number, rowsPerPage: number) => {
  //   setPaginationData({ page, rowsPerPage });
  // };

  const handleEditBrand = (existingData: TBrand) => {
    setBrandFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Brand',
        data: { existingData, isEditMode: true }
      };
    });
  };

  // const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = event.target.value;
  //   setGlobalFilter(value);
  //   const updatedSearchData = {
  //     search: [
  //       [
  //         {
  //           field_name: 'global',
  //           field_value: value,
  //           operator: ''
  //         }
  //       ]
  //     ]
  //   };
  //   setSearchData(updatedSearchData);
  //   setLs_search(value);

  //   // Trigger the refetch for the search API
  //   refetchBrandData();
  // };

  const toggleBrandPopup = (refetchData?: boolean) => {
    if (brandFormPopup.action.open === true && refetchData) {
      setReloadGrid(true);
      refetchBrandData().then(() => {
        // Remove immediate grid refresh to prevent row disappearing
        setTimeout(() => {
          setReloadGrid(false);
        }, 100);
      });
    }
    setBrandFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TBrand) => {
    actionType === 'edit' && handleEditBrand(rowOriginal);
  };

  const handleDeleteBrand = async () => {
    const brandCodesToDelete = selectedRows.map((row) => row.brand_code).filter((code): code is string => typeof code === 'string');
    await WmsSerivceInstance.deleteMasters('wms', 'brand', brandCodesToDelete);
    updateSelectionState(new Set()); // Clear selection after delete
    // Simplified refresh without forcing grid re-render
    await refetchBrandData();
  };

  // const handleImportData = async (values: TBrand[]) => {
  //   const response = await brandServiceInstance.addBulkData(values);
  //   if (response) {
  //     refetchBrandData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleExportData = async () => {
  //   const response = await brandServiceInstance.exportData();
  //   if (response) {
  //     refetchBrandData();
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

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  // Removed the useEffect that was logging rowSelection

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    console.log('Brand Grid ready with data count:', transformedRowData.length);
  };

  // function handleChangePagination(currentPage: number, pageSize: number): void {
  //   setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  // }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        {selectedRows.length > 0 && (
          <Button variant="outlined" onClick={handleDeleteBrand} color="error" startIcon={<DeleteOutlined />}>
            <FormattedMessage id="Delete" />
          </Button>
        )}
        <Button
          sx={{
            // marginTop: '6px',
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
          startIcon={<PlusOutlined />}
          variant="contained"
          onClick={() => toggleBrandPopup()}
        >
          <FormattedMessage id="Add Brand" />
        </Button>
      </div>

      <CustomAgGrid
        ref={gridRef}
        columnDefs={columns}
        rowData={transformedRowData}
        onGridReady={onGridReady}
        suppressRowClickSelection={true}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={rowsPerPageOptions}
        pagination={true}
        height="480px"
        rowHeight={20}
        headerHeight={30}
        animateRows={false}
        suppressRowTransform={true}
        reload_data={false}
        editable={false}
        getRowId={(params) => {
          return params.data._uniqueKey || `row_${Math.random()}`;
        }}
        suppressColumnVirtualisation={true}
      />

      {!!brandFormPopup && brandFormPopup.action.open && (
        <UniversalDialog
          action={{ ...brandFormPopup.action }}
          onClose={toggleBrandPopup}
          title={brandFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddBrandWmsForm
            onClose={toggleBrandPopup}
            isEditMode={brandFormPopup?.data?.isEditMode}
            existingData={brandFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default BrandWmsPage;
