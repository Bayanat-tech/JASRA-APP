import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddPrincipalWmsForm from 'components/forms/AddPrincipalWmsForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TPrincipalWms } from './types/principal-wms.types';
import UniversalDelete from 'components/popup/UniversalDelete';
import { FormattedMessage } from 'react-intl';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { Box } from '@mui/system';
import { Button, InputAdornment, TextField } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { SearchIcon } from 'lucide-react';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const PrincipalWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [filterData] = useState<ISearch>(filter);
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const [, setGridApi] = useState<any>(null);
  const [, setSearchData] = useState<ISearch>();
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [, setLs_search] = useState<string>('');
  const [principalFormPopup, setPrincipalFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Principal" />,
    data: { prin_code: '', isEditMode: false }
  }); // State for principal form popup

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
        field: 'prin_code',
        headerName: 'Code',
        sortable: true,
        filter: true
      },
      {
        field: 'prin_name',
        headerName: 'Name'
      },
      {
        field: 'prin_status',
        headerName: 'Status'
      },
      {
        headerName: 'Actions',
        filter: false,
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
    data: principalData,
    //isFetching: isPrincipalFetchLoading,
    refetch: refetchPrincipalData
  } = useQuery({
    queryKey: ['principal_data', filterData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  //-------------handlers---------------

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
    refetchPrincipalData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', principalData?.tableData);
  };

  const handleTogglePopup = (existingData?: TPrincipalWms, refetchData?: boolean) => {
    if (principalFormPopup.action.open && refetchData) {
      refetchPrincipalData();
    }
    setPrincipalFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: `${!!existingData && Object.keys(existingData).length > 0 ? 'Edit' : 'Add'} Principal`,
        data: {
          prin_code: existingData?.prin_code || '',
          isEditMode: !!existingData
        }
      };
    });
  };

  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  const handleActions = (actionType: string, rowOriginal: TPrincipalWms) => {
    actionType === 'edit' && handleTogglePopup(rowOriginal);
  };

  const handleDeletePrincipal = async () => {
    await WmsSerivceInstance.deleteMasters('wms', 'principal', Object.keys(rowSelection));
    setRowSelection({});
    refetchPrincipalData();
    setDeletePopup(false);
  };

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData: any) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
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
  useEffect(() => {
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
          onClick={() => handleTogglePopup()}
        >
          Add Principal
        </Button>
      </div>
      <CustomAgGrid
        rowData={principalData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        rowHeight={20}
        headerHeight={30}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination={true}
        height="500px"
      />
      {!!principalFormPopup && principalFormPopup.action.open && (
        <UniversalDialog
          action={{ ...principalFormPopup.action }}
          onClose={handleTogglePopup}
          title={principalFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddPrincipalWmsForm
            onClose={(existingData, refetchData) => handleTogglePopup(existingData, refetchData)}
            isEditMode={principalFormPopup?.data?.isEditMode}
            prin_code={principalFormPopup.data.prin_code}
          />
        </UniversalDialog>
      )}
      {openDeletePopup === true && (
        <UniversalDelete
          open={openDeletePopup}
          handleClose={handleCloseDelete}
          title={Object.keys(rowSelection).length}
          handleDelete={handleDeletePrincipal}
        />
      )}
    </div>
  );
};

export default PrincipalWmsPage;
