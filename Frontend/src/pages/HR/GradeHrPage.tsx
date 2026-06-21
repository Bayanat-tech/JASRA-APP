import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddGradeHrForm from 'components/forms/HR/AddGradeHrForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import HrServiceInstance from 'service/Service.hr';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
// import gradeServiceInstance from '../../service/HR/service.grade_hr';
import { TGrade } from './type/grade-hr.types';

//import AddCountryWmsForm from 'components/forms/AddCountryWmsForm';

//import countryServiceInstance from 'service/GM/service.country_wms';

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
const GradeHrPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData, setFilterData] = useState<ISearch>(filter);

  const [gradeFormPopup, setGradeFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Grade" />,
    data: { existingData: {}, isEditMode: false }
  });
  const columns = useMemo<ColumnDef<TGrade>[]>(
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
        accessorFn: (row) => row.grade_code,
        id: 'grade_code',
        cell: (info) => info.getValue(),
        meta: {
          filterVariant: 'text'
        },
        header: () => <FormattedMessage id="Grade Code" />
      },
      {
        accessorFn: (row) => row.grade_name,
        id: 'grade_name',
        header: () => <FormattedMessage id="Grade Name" />
      },
      // {
      //   accessorFn: (row) => row.country_gcc,
      //   id: 'country_gcc',
      //   header: () => <FormattedMessage id="Country GCC" />
      // },
      {
        accessorFn: (row) => row.company_code,
        id: 'company_code',
        header: () => <FormattedMessage id="Company Code" />
      },
      {
        accessorFn: (row) => row.grade_short_name,
        id: 'grade_short_name',
        header: () => <FormattedMessage id="Short Name" />
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <FormattedMessage id="Status" />
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
    data: gradeData,
    isFetching: isGradeFetchLoading,
    refetch: refetchGradeData
  } = useQuery({
    queryKey: ['grade_data', filterData, paginationData],
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

  const handleEditGrade = (existingData: TGrade) => {
    setGradeFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Grade" />,

        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleGradePopup = (refetchData?: boolean) => {
    if (gradeFormPopup.action.open === true && refetchData) {
      refetchGradeData();
    }
    setGradeFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TGrade) => {
    actionType === 'edit' && handleEditGrade(rowOriginal);
  };

  const handleDeleteGrade = async () => {
    // await gradeServiceInstance.deleteGrade(Object.keys(rowSelection));
    setRowSelection({});
    refetchGradeData();
  };

  const handleImportData = async (values: TGrade[]) => {
    // const response = await gradeServiceInstance.addBulkData(values);
    // if (response) {
    //   refetchGradeData();
    //   return response;
    // }
    return false;
  };

  const handleExportData = async () => {
    // const response = await gradeServiceInstance.exportData();
    // if (response) {
    //   refetchGradeData();
    //   return response;
    // }
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
          onClick={handleDeleteGrade}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          <FormattedMessage id="Delete" />
        </Button>
        <Button startIcon={<PlusOutlined />} variant="shadow" onClick={() => toggleGradePopup()}>
          <FormattedMessage id="Grade" />
        </Button>
      </div>
      <CustomDataTable
        data={gradeData?.tableData || []}
        columns={columns}
        isDataLoading={isGradeFetchLoading}
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
        row_id="grade_code"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        //-----------pagination----------
        count={gradeData?.count}
        hasPagination={true}
        onPaginationChange={handleChangePagination}
      />
      {!!gradeFormPopup && gradeFormPopup.action.open && (
        <UniversalDialog
          action={{ ...gradeFormPopup.action }}
          onClose={toggleGradePopup}
          title={gradeFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddGradeHrForm
            onClose={toggleGradePopup}
            isEditMode={gradeFormPopup?.data?.isEditMode}
            existingData={gradeFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default GradeHrPage;
