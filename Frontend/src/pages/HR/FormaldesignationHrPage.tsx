import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddFormaldesignationHrForm from 'components/forms/HR/AddFormaldesignationHrForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import formaldesignationServiceInstance from 'service/HR/service.formaldesignation_hr';
import HrServiceInstance from 'service/Service.hr';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TFormalDesignation } from './type/formaldesignation-hr.types';

//import AddCountryWmsForm from 'components/forms/AddCountryWmsForm';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [
    [
      // { field_name: 'country_code', field_value: '', operator: 'contains' },
      // { field_name: 'country_name', field_value: '', operator: 'contains' },
      // { field_name: 'country_gcc', field_value: '', operator: 'contains' },
      // { field_name: 'nationality', field_value: '', operator: 'contains' },
      // { field_name: 'short_desc', field_value: '', operator: 'contains' },
      // { field_name: 'company_code', field_value: '', operator: 'contains' }
    ]
  ]
};
const FormaldesignationHrPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData, setFilterData] = useState<ISearch>(filter);

  const [formaldesignationFormPopup, setFormaldesignationFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Formal designation" />,
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColumnDef<TFormalDesignation>[]>(
    () => [
      {
        id: 'select-col',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
        )
      },
      {
        accessorFn: (row) => row.labour_desg_code,
        id: 'labour_desg_code',
        cell: (info) => info.getValue(),
        meta: {
          filterVariant: 'text'
        },
        header: () => <FormattedMessage id="Labour Desg Code" />
      },
      {
        accessorFn: (row) => row.labour_desg_name,
        id: 'labour_desg_name',
        header: () => <FormattedMessage id="Name" />
      },
      {
        accessorFn: (row) => row.company_code,
        id: 'company_code',
        header: () => <FormattedMessage id="Company Code" />
      },
      {
        accessorFn: (row) => row.labour_desg_short_name,
        id: 'labour_desg_short_name',
        header: () => <FormattedMessage id="Short Name" />
      },
      {
        accessorFn: (row) => row.remarks,
        id: 'remarks',
        header: () => <FormattedMessage id="Remarks" />
      },
      {
        id: 'actions',
        enableHiding: true,
        header: () => <FormattedMessage id="Actions" />,

        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  //----------- useQuery--------------
  const {
    data: formaldesignationData,
    isFetching: isFormaldesignationFetchLoading,
    refetch: refetchFormaldesignationData
  } = useQuery({
    queryKey: ['formaldesignation_data', filterData, paginationData],
    queryFn: () => HrServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditFormaldesignation = (existingData: TFormalDesignation) => {
    setFormaldesignationFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Formaldesignation" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleFormaldesignationPopup = (refetchData?: boolean) => {
    if (formaldesignationFormPopup.action.open === true && refetchData) {
      refetchFormaldesignationData();
    }
    setFormaldesignationFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TFormalDesignation) => {
    actionType === 'edit' && handleEditFormaldesignation(rowOriginal);
  };

  const handleDeleteFormaldesignation = async () => {
    console.log(rowSelection);

    const confirmDelete = window.confirm('Are you sure you want to delete the selected Formal designation?');
    if (confirmDelete) {
      await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
      setRowSelection({});
      refetchFormaldesignationData();
    }
  };

  const handleImportData = async (values: TFormalDesignation[]) => {
    const response = await formaldesignationServiceInstance.addBulkData(values);
    if (response) {
      refetchFormaldesignationData();
      return response;
    }
    return false;
  };

  const handleExportData = async () => {
    const response = await formaldesignationServiceInstance.exportData();
    if (response) {
      refetchFormaldesignationData();
      return response;
    }
    return false;
  };

  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };
  const handleSortingChange = (sorting: SortingState) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };
  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);
  useEffect(() => {
    console.log(rowSelection);
  }, [rowSelection]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outlined"
          onClick={handleDeleteFormaldesignation}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleFormaldesignationPopup()}>
          <FormattedMessage id="Formaldesignation" />
        </Button>
      </div>
      <CustomDataTable
        data={formaldesignationData?.tableData || []}
        columns={columns}
        isDataLoading={isFormaldesignationFetchLoading}
        //--------------filter---------

        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        // handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        //-----------export----------
        tableActions={['export', 'import', 'print']}
        handleImportData={handleImportData}
        handleExportData={handleExportData}
        //-----------delete----------
        row_id="desg_code"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        //-----------pagination----------
        count={formaldesignationData?.count}
        hasPagination={true}
        onPaginationChange={handleChangePagination}
      />
      {!!formaldesignationFormPopup && formaldesignationFormPopup.action.open && (
        <UniversalDialog
          action={{ ...formaldesignationFormPopup.action }}
          onClose={toggleFormaldesignationPopup}
          title={formaldesignationFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddFormaldesignationHrForm
            onClose={toggleFormaldesignationPopup}
            isEditMode={formaldesignationFormPopup?.data?.isEditMode}
            existingData={formaldesignationFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default FormaldesignationHrPage;
