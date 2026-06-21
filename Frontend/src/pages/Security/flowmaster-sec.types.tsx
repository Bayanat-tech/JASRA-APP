import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { ColDef } from 'ag-grid-community';
import AddFlowmasterSecForm from 'components/forms/Security/AddFlowmasteSecForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import SecSerivceInstance from 'service/service.security';
import { TFlowmaster } from './type/flowmaster-sec-types';
import CustomAgGrid from 'components/grid/CustomAgGrid';

const FlowmasterSecPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setGridApi] = useState<any>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [flowmasterFormPopup, setFlowmasterFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Flowmaster',
    data: { existingData: {}, isEditMode: false }
  });
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        headerName: '',
        width: 50,
        pinned: 'left'
      },
      {
        field: 'flow_code',
        headerName: 'Flow Code'
      },
      {
        field: 'flow_description',
        headerName: 'Flow Description'
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

  console.log(
    'pageGGG',
    permissions,
    app.toUpperCase(),
    permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
  );

  //----------- useQuery--------------
  const { data: flowmasterData, refetch: refetchFlowmasterData } = useQuery({
    queryKey: ['flowmaster_data', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditFlowmaster = (existingData: TFlowmaster) => {
    setFlowmasterFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Flowmaster',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleFlowmasterPopup = (refetchData?: boolean) => {
    if (flowmasterFormPopup.action.open === true && refetchData) {
      refetchFlowmasterData();
    }
    setFlowmasterFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TFlowmaster) => {
    actionType === 'edit' && handleEditFlowmaster(rowOriginal);
  };
  const handleDeleteFlowmaster = async () => {
    await SecSerivceInstance.deleteMasters('security', 'flow_master', Object.keys(rowSelection));
    setRowSelection({});
    refetchFlowmasterData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', flowmasterData?.tableData || []);
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
            onClick={handleDeleteFlowmaster}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button startIcon={<PlusOutlined />} variant="contained" color="customBlue" onClick={() => toggleFlowmasterPopup()}>
          Flowmaster
        </Button>
      </div>
      <CustomAgGrid
        rowData={flowmasterData?.tableData || []}
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
      {!!flowmasterFormPopup && flowmasterFormPopup.action.open && (
        <UniversalDialog
          action={{ ...flowmasterFormPopup.action }}
          onClose={toggleFlowmasterPopup}
          title={flowmasterFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddFlowmasterSecForm
            onClose={toggleFlowmasterPopup}
            isEditMode={flowmasterFormPopup?.data?.isEditMode}
            existingData={flowmasterFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default FlowmasterSecPage;
