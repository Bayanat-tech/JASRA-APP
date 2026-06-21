import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { Tsecrollmaster } from './type/flowmaster-sec-types';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import SecSerivceInstance from 'service/service.security';
import AddSecRoleWmsForm from 'components/forms/Security/AddSecRoleSecForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { RowSelectionState } from '@tanstack/react-table';

const SecrollmasterWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setGridApi] = useState<any>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [secroleFormPopup, setCountryFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Role Master',
    data: { existingData: {}, isEditMode: false }
  });
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Select',
        field: 'select-col',
        width: 50,
        headerCheckboxSelection: true,
        checkboxSelection: true,
        cellRenderer: (params: { node: any }) => {
          const { node } = params;
          return <Checkbox checked={node.isSelected()} disabled={!node.selectable} onChange={() => node.setSelected(!node.isSelected())} />;
        }
      },
      {
        headerName: 'Role ID',
        field: 'role_id',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Role Description',
        field: 'role_desc',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Remarks',
        field: 'remarks',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Actions',
        cellRenderer: (params: { data: any }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );
  //----------- useQuery--------------
  const { data: secrollmasterData, refetch: refetchSalesmanData } = useQuery({
    queryKey: ['secrollmasterData', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditsecrollmaster = (existingData: Tsecrollmaster) => {
    setCountryFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit  Role Master',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleCountryPopup = (refetchData?: boolean) => {
    if (secroleFormPopup.action.open === true && refetchData) {
      refetchSalesmanData();
    }
    setCountryFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: Tsecrollmaster) => {
    actionType === 'edit' && handleEditsecrollmaster(rowOriginal);
  };
  const handleDeleteSecrollmaster = async () => {
    await SecSerivceInstance.deleteMasters('security', 'role_master', Object.keys(rowSelection));
    setRowSelection({});
    refetchSalesmanData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', secrollmasterData?.tableData);
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
            onClick={handleDeleteSecrollmaster}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button color="customBlue" startIcon={<PlusOutlined />} variant="contained" onClick={() => toggleCountryPopup()}>
          Add User
        </Button>
      </div>
      <CustomAgGrid
        rowData={secrollmasterData?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        paginationPageSize={1000}
        pagination={true}
        height="500px"
      />
      {!!secroleFormPopup && secroleFormPopup.action.open && (
        <UniversalDialog
          action={{ ...secroleFormPopup.action }}
          onClose={toggleCountryPopup}
          title={secroleFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddSecRoleWmsForm
            onClose={toggleCountryPopup}
            isEditMode={secroleFormPopup?.data?.isEditMode}
            existingData={secroleFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default SecrollmasterWmsPage;
