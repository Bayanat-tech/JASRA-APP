import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TCompanymaster } from './type/flowmaster-sec-types';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import SecSerivceInstance from 'service/service.security';
import AddCompanySecForm from 'components/forms/Security/AddCompanySecForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';

// const filter: ISearch = {
//   sort: { field_name: 'updated_at', desc: true },
//   search: [[]]
// };

const CompanymasterPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [companyFormPopup, setCompanyFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Comapny Master',
    data: { existingData: {}, isEditMode: false }
  });
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Select',
        field: 'select-col',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 50
      },
      {
        headerName: 'Company Code',
        field: 'company_code',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Company Name',
        field: 'company_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Address 1',
        field: 'address1',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Address 2',
        field: 'address2',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Address 3',
        field: 'address3',
        sortable: true,
        filter: true
      },
      {
        headerName: 'City',
        field: 'city',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Country',
        field: 'country',
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
  console.log(
    'pageHHHH',
    permissions,
    app.toUpperCase(),
    permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
  );

  //----------- useQuery--------------
  const { data: companymasterData, refetch: refetchCompanyData } = useQuery({
    queryKey: ['seccompany', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditcompanymaster = (existingData: TCompanymaster) => {
    setCompanyFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Company Master',
        data: { existingData, isEditMode: true }
      };
    });
  };

  const togglecompanyPopup = (refetchData?: boolean) => {
    if (companyFormPopup.action.open === true && refetchData) {
      refetchCompanyData();
    }
    setCompanyFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TCompanymaster) => {
    actionType === 'edit' && handleEditcompanymaster(rowOriginal);
  };
  const handleCompanymaster = async () => {
    await SecSerivceInstance.deleteMasters('security', 'sec_company', Object.keys(rowSelection));
    setRowSelection({});
    refetchCompanyData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', companymasterData?.tableData);
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
            onClick={handleCompanymaster}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => togglecompanyPopup()}>
          Add Company
        </Button>
      </div>
      <CustomAgGrid
        rowData={companymasterData?.tableData || []}
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
      {!!companyFormPopup && companyFormPopup.action.open && (
        <UniversalDialog
          action={{ ...companyFormPopup.action }}
          onClose={togglecompanyPopup}
          title={companyFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddCompanySecForm
            onClose={togglecompanyPopup}
            isEditMode={companyFormPopup?.data?.isEditMode}
            existingData={companyFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default CompanymasterPage;
