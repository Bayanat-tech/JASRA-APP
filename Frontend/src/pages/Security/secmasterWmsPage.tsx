import { PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TSecmaster } from './type/flowmaster-sec-types';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import SecSerivceInstance from 'service/service.security';
import AddSecLoginSecForm from 'components/forms/Security/AddSecLoginSecForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';

// const filter: ISearch = {
//   sort: { field_name: 'updated_at', desc: true },
//   search: [[]]
// };

const SecmasterWmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setGridApi] = useState<any>(null);
  // Removed unused rowSelection state

  const [secroleFormPopup, setSecmasterFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Create User Login',
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
        cellRenderer: (params: {
          node: { isSelected: () => boolean | undefined; selectable: any; setSelected: (arg0: boolean) => void };
        }) => (
          <Checkbox
            checked={params.node.isSelected()}
            disabled={!params.node.selectable}
            onChange={() => params.node.setSelected(!params.node.isSelected())}
          />
        )
      },
      {
        headerName: 'User ID',
        field: 'id',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Username',
        field: 'username',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Contact No',
        field: 'contact_no',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Email ID',
        field: 'email_id',
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

  //----------- useQuery--------------
  const { data: secmasterData, refetch: refetchsecmasterData } = useQuery({
    queryKey: ['SecLogin', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditsecmaster = (existingData: TSecmaster) => {
    setSecmasterFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit User Login',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const togglesecmasterPopup = (refetchData?: boolean) => {
    if (secroleFormPopup.action.open === true && refetchData) {
      refetchsecmasterData();
    }
    setSecmasterFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TSecmaster) => {
    if (actionType === 'edit') {
      handleEditsecmaster(rowOriginal);
    } else if (actionType === 'delete') {
      handleDeleteSingle(rowOriginal.id);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await SecSerivceInstance.deleteMasters('security', 'sec_login', [id]);
              refetchsecmasterData();
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

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', secmasterData?.tableData || []);
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

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => togglesecmasterPopup()}>
          Add User
        </Button>
      </div>
      <CustomAgGrid
        rowData={secmasterData?.tableData || []}
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
          onClose={togglesecmasterPopup}
          title={secroleFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddSecLoginSecForm
            onClose={togglesecmasterPopup}
            isEditMode={secroleFormPopup?.data?.isEditMode}
            existingData={secroleFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default SecmasterWmsPage;
