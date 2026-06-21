import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import WmsSerivceInstance from 'service/wms/service.wms';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import GmSecServiceInstance from 'service/security/services.gm_security';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddQuerySecForm from 'components/forms/Security/QuerymasterSecForm';

const QueryMasterPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [QueryFormPopup, setQueryFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add ',
    data: { existingData: {}, isEditMode: false }
  });
  const columnDefs = useMemo<ColDef[]>(
    () => [
       {
        headerName: 'Company_code',
        field: 'COMPANY_CODE',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Parameter',
        field: 'PARAMETER',
        sortable: true,
        filter: true,
        editable: false
      },
      {
        headerName: 'SQL_STRING',
        field: 'SQL_STRING',
        sortable: true,
        filter: true
      },
      {
        headerName: 'String 1 ',
        field: 'STRING1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'String 2',
        field: 'STRING2',
        sortable: true,
        filter: true
      },
      {
        headerName: 'String 3',
        field: 'STRING3',
        sortable: true,
        filter: true
      },
      {
        headerName: 'String 4',
        field: 'STRING4',
        sortable: true,
        filter: true
      },
      {
        headerName: 'UString 1 ',
        field: 'USTRING1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'UString 2',
        field: 'USTRING2',
        sortable: true,
        filter: true
      },
      {
        headerName: 'UString 3',
        field: 'USTRING3',
        sortable: true,
        filter: true
      },
      {
        headerName: 'UString 4',
        field: 'USTRING4',
        sortable: true,
        filter: true
      },
      {
        headerName: 'UString 5',
        field: 'USTRING5',
        sortable: true,
        filter: true
      },
      {
        headerName: 'UString 6',
        field: 'USTRING6',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Order by',
        field: 'ORDER_BY',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        cellRenderer: (params: { data: any }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );
  console.log(
    'pageHHHH',
    permissions,
    app.toUpperCase(),
    permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
  );

  //----------- useQuery--------------
  const { data: QuerymasterData, refetch: refetchQueryData } = useQuery<any[]>({
    queryKey: ['query_master', searchData, paginationData],
    queryFn: async () => {
      const result = await WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData);
      return result?.tableData ?? [];
    },
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditquerymaster = (rowOriginal: any) => {
    setQueryFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Lead',
        data: { existingData: rowOriginal, isEditMode: true }
      };
    });
  };

  const toggleQueryPopup = (refetchData?: boolean) => {
    if (QueryFormPopup.action.open === true && refetchData) {
      refetchQueryData();
    }
    setQueryFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleDeleteSingle = async (SR_NO: number) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this ?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await GmSecServiceInstance.deletequerymaster('security', 'query_master', [SR_NO.toString()]);
              refetchQueryData();
            } catch (error) {
              console.error('Error deleting record:', error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleActions = (action: string, data: any) => {
    if (action === 'edit') {
      handleEditquerymaster(data);
    } else if (action === 'delete') {
      handleDeleteSingle(data.SR_NO);
    }
  };
  const handleQuerymaster = async () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete ?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await GmSecServiceInstance.deletequerymaster('security', 'query_master', Object.keys(rowSelection));
              setRowSelection({});
              refetchQueryData();
            } catch (error) {
              console.error('Error deleting records:', error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', QuerymasterData);
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
  //------------------useEffect----------------
  // useEffect(() => {
  //   setToggleFilter(null as any);
  //   return () => {};
  // }, []);
  //----------------Filter and sorting ----------------
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        {
          <Button
            variant="outlined"
            onClick={handleQuerymaster}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => toggleQueryPopup()}>
          Add
        </Button>
      </div>
      <CustomAgGrid
        rowData={QuerymasterData ?? []}
        columnDefs={columnDefs}
        getRowId={(params) => params.data.SR_NO.toString()}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        paginationPageSize={1000}
        pagination={true}
        height="500px"
      />
      {!!QueryFormPopup && QueryFormPopup.action.open && (
        <UniversalDialog
          action={{ ...QueryFormPopup.action }}
          onClose={toggleQueryPopup}
          title={QueryFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddQuerySecForm
            onClose={toggleQueryPopup}
            isEditMode={QueryFormPopup?.data?.isEditMode}
            existingData={QueryFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default QueryMasterPage;
