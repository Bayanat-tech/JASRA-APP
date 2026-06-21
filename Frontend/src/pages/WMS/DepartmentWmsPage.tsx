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
import AddDepartmentWmsForm from 'components/forms/AddDepartmentWmsForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TDepartment } from './types/department-wms.types';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const DepartmentWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [, setGridApi] = useState<any>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [, setLs_search] = useState<string>('');
  const [departmentFormPopup, setDepartmentFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Department',
    data: { existingData: {}, isEditMode: false }
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: '',
        field: 'checkbox',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50, // 🔹 Decreased width
        maxWidth: 50,
        pinned: 'left',
        sortable: false,
        filter: false,
        suppressSizeToFit: true
      },
      {
        field: 'dept_code',
        headerName: 'Department Code',
        sortable: true,
        filter: true,
        // flex: 1,
        // minWidth: 50,
        width: 110, // 🔹 fixed width🔹 ensures it doesn’t shrink too much
        maxWidth: 160,
        suppressSizeToFit: true
      },
      {
        field: 'dept_name',
        headerName: 'Department Name',
        flex: 2, // 🔹 make it take more space than other columns
        minWidth: 200,
        sortable: true,
        filter: true,
        suppressSizeToFit: true
      },
      {
        field: 'div_code',
        headerName: 'Division Code',
        sortable: true,
        filter: true,
        suppressSizeToFit: true
      },
      {
        field: 'jobno_seq',
        headerName: 'JobNo Sequence',
        sortable: true,
        filter: true,
        suppressSizeToFit: true
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
    data: departmentData,
    //isFetching: isDepartmentFetchLoading,
    refetch: refetchDepartmentData
  } = useQuery({
    queryKey: ['department_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditDepartment = (existingData: TDepartment) => {
    setDepartmentFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Department',
        data: { existingData, isEditMode: true }
      };
    });
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

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', departmentData?.tableData);
  };

  const toggleDepartmentPopup = (refetchData?: boolean) => {
    if (departmentFormPopup.action.open === true && refetchData) {
      refetchDepartmentData();
    }
    setDepartmentFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TDepartment) => {
    actionType === 'edit' && handleEditDepartment(rowOriginal);
  };
  const handleDeleteDepartment = async () => {
    await WmsSerivceInstance.deleteMasters('wms', 'department', Object.keys(rowSelection));
    setRowSelection({});
    refetchDepartmentData();
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
    refetchDepartmentData();
  };
  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);
  return (
    <div className="flex flex-col space-y-2">
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
        {
          <Button
            variant="outlined"
            onClick={handleDeleteDepartment}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
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
          // variant="contained"
          onClick={() => toggleDepartmentPopup()}
        >
          Add Department
        </Button>
      </div>
      {/* <CustomDataTable
        tableActions={['export', 'import']}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="dept_code"
        data={departmentData?.tableData || []}
        columns={columns}
        count={departmentData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isDepartmentFetchLoading}
        toggleFilter={toggleFilter}
      /> */}

      <CustomAgGrid
        rowData={departmentData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination
        rowHeight={20}
        height="520px"
        headerHeight={30}
        // defaultColDef={{ cellStyle: { fontSize: '0.775rem' } }}
      />
      {departmentFormPopup.action.open === true && (
        <UniversalDialog
          action={{ ...departmentFormPopup.action }}
          onClose={toggleDepartmentPopup}
          title={departmentFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddDepartmentWmsForm
            onClose={toggleDepartmentPopup}
            isEditMode={departmentFormPopup?.data?.isEditMode}
            existingData={departmentFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default DepartmentWmsPage;
