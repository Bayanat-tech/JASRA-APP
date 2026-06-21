import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColDef, GridApi } from 'ag-grid-community';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TGroup } from './types/group-wms.types';
import AddGroupWmsForm from 'components/forms/AddGroupWmsForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { FormattedMessage } from 'react-intl';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};

const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];

const GroupWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [filterData] = useState<ISearch>(filter);
  const [, setGridApi] = useState<GridApi | null>(null);
  const gridRef = useRef<any>(null);
  const [, setReloadGrid] = useState<boolean>(false);

  // Manual selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<TGroup[]>([]);

  const [groupFormPopup, setGroupFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Group',
    data: { existingData: {}, isEditMode: false }
  });

  //----------- useQuery--------------
  const { data: groupData, refetch: refetchGroupData } = useQuery({
    queryKey: ['group_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  // Improved row data transformation with proper validation and stable keys
  const transformedRowData = useMemo(() => {
    if (!groupData?.tableData) return [];

    const transformed = (groupData.tableData as TGroup[])
      .map((row, index) => {
        if (!row || !row.group_code) return null;

        return {
          ...row,
          _uniqueKey: `${row.group_code}_${row.prin_code || 'no_prin'}_${row.company_code || 'no_company'}_${index}`
        };
      })
      .filter((row): row is TGroup & { _uniqueKey: string } => row !== null && typeof row.group_code === 'string')
      .sort((a, b) => {
        // Add stable sorting to prevent order changes
        return (a.group_code ?? '').localeCompare(b.group_code ?? '');
      });

    return transformed;
  }, [groupData?.tableData]);

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
    (): ColDef<TGroup>[] => [
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
        field: 'group_code',
        headerName: 'Group Code',
        maxWidth: 140,
        cellStyle: { fontSize: '12px' }
      },
      {
        field: 'group_name',
        headerName: 'Group Name',
        flex: 1,
        minWidth: 200,
        cellStyle: { fontSize: '12px' }
      },
      {
        field: 'prin_code',
        headerName: 'Principal Code',
        maxWidth: 150,
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
        cellRenderer: ({ data }: { data: TGroup }) => {
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
  // const onGridReady = (params: any) => {
  //   setGridApi(params.api);
  //   params.api.sizeColumnsToFit();
  //   console.log('Grid Data:', groupData?.tableData);
  // };

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
  //   refetchGroupData();
  // };

  // const onFilterChanged = useCallback((event: any) => {
  //   const filterModel = event.api.getFilterModel();
  //   const filters: any[] = [];

  //   Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
  //     if (value.filter || value.value) {
  //       filters.push([
  //         {
  //           field_name: field,
  //           field_value: value.filter || value.value,
  //           operator: 'equals'
  //         }
  //       ]);
  //     }
  //   });

  //   setSearchData((prevData) => ({
  //     ...prevData,
  //     search: filters.length > 0 ? filters : [[]]
  //   }));
  // }, []);

  // const onSortChanged = useCallback((params: any) => {
  //   const columnState = params?.columnApi?.getColumnState();
  //   const sortedColumn = columnState?.find((col: any) => col.sort);

  //   setSearchData((prevData: any) => ({
  //     ...prevData,
  //     sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
  //   }));
  // }, []);

  // const onPaginationChanged = useCallback((params: any) => {
  //   const currentPage = params.api.paginationGetCurrentPage();
  //   const pageSize = params.api.paginationGetPageSize();
  //   setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  // }, []);

  const handleEditGroup = (existingData: TGroup) => {
    setGroupFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Group',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleGroupPopup = (refetchData?: boolean) => {
    if (groupFormPopup.action.open === true && refetchData) {
      setReloadGrid(true);
      refetchGroupData().then(() => {
        // Remove immediate grid refresh to prevent row disappearing
        setTimeout(() => {
          setReloadGrid(false);
        }, 100);
      });
    }
    setGroupFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TGroup) => {
    actionType === 'edit' && handleEditGroup(rowOriginal);
  };

  const handleDeleteGroup = async () => {
    const groupCodesToDelete = selectedRows.map((row) => row.group_code).filter((code): code is string => typeof code === 'string');
    await WmsSerivceInstance.deleteMasters('wms', 'group', groupCodesToDelete);
    updateSelectionState(new Set()); // Clear selection after delete
    // Simplified refresh without forcing grid re-render
    await refetchGroupData();
  };

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    console.log('Group Grid ready with data count:', transformedRowData.length);
  };

  function handleChangePagination(currentPage: number, pageSize: number): void {
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-end space-x-2 ">
        {selectedRows.length > 0 && (
          <Button variant="outlined" onClick={handleDeleteGroup} color="error" startIcon={<DeleteOutlined />} sx={{ marginRight: '8px' }}>
            <FormattedMessage id="Delete" />
          </Button>
        )}
        <Button
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
          startIcon={<PlusOutlined />}
          variant="contained"
          onClick={() => toggleGroupPopup()}
        >
          <FormattedMessage id="Add Group " />
        </Button>
      </div>

      <div className="">
        <CustomAgGrid
          ref={gridRef}
          columnDefs={columns}
          rowData={transformedRowData}
          onGridReady={onGridReady}
          onPaginationChanged={(params: any) =>
            handleChangePagination(params.api.paginationGetCurrentPage(), params.api.paginationGetPageSize())
          }
          suppressRowClickSelection={true}
          paginationPageSize={paginationData.rowsPerPage}
          paginationPageSizeSelector={rowsPerPageOptions}
          pagination={true}
          height="500px"
          rowHeight={20}
          headerHeight={40}
          animateRows={false}
          suppressRowTransform={true}
          reload_data={false}
          editable={false}
          getRowId={(params) => {
            return params.data._uniqueKey || `row_${Math.random()}`;
          }}
          suppressColumnVirtualisation={true}
        />
      </div>

      {!!groupFormPopup && groupFormPopup.action.open && (
        <UniversalDialog
          action={{ ...groupFormPopup.action }}
          onClose={toggleGroupPopup}
          title={groupFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddGroupWmsForm
            onClose={toggleGroupPopup}
            isEditMode={groupFormPopup?.data?.isEditMode}
            existingData={groupFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default GroupWmsPage;
