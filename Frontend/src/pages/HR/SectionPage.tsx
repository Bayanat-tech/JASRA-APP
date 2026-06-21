import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import AddSectionForm from 'components/forms/HR/SectionForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import sectionServiceInstance from 'service/HR/SectionService';
import HrServiceInstance from 'service/Service.hr';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TSection } from './type/AddHR_types';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};

const SectionPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterData, setFilterData] = useState<ISearch>(filter);

  const [sectionFormPopup, setSectionFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Add Section" />,
    data: { existingData: {}, isEditMode: false }
  });

  const columns = useMemo<ColumnDef<TSection>[]>(
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
        accessorFn: (row) => row.div_code,
        id: 'div_code',
        header: () => <FormattedMessage id="Division Code" />
      },
      {
        accessorFn: (row) => row.dept_code,
        id: 'dept_code',
        header: () => <FormattedMessage id="Department Code" />
      },
      {
        accessorFn: (row) => row.section_code,
        id: 'section_code',
        cell: (info) => info.getValue(),
        meta: {
          filterVariant: 'text'
        },
        header: () => <FormattedMessage id="Section Code" />
      },
      {
        accessorFn: (row) => row.section_name,
        id: 'section_name',
        header: () => <FormattedMessage id="Section Name" />
      },
      {
        accessorFn: (row) => row.section_short_name,
        id: 'section_short_name',
        header: () => <FormattedMessage id="Section Short Name" />
      },
      {
        accessorFn: (row) => row.sect_addr1,
        id: 'sect_addr1',
        header: () => <FormattedMessage id="Address 1" />
      },
      {
        accessorFn: (row) => row.sect_addr2,
        id: 'sect_addr2',
        header: () => <FormattedMessage id="Address 2" />
      },
      {
        accessorFn: (row) => row.sect_addr3,
        id: 'sect_addr3',
        header: () => <FormattedMessage id="Address 3" />
      },
      {
        accessorFn: (row) => row.phone,
        id: 'phone',
        header: () => <FormattedMessage id="Phone" />
      },
      {
        accessorFn: (row) => row.fax,
        id: 'fax',
        header: () => <FormattedMessage id="Fax" />
      },
      {
        accessorFn: (row) => row.email,
        id: 'email',
        header: () => <FormattedMessage id="Email" />
      },
      {
        accessorFn: (row) => row.sect_head_id,
        id: 'sect_head_id',
        header: () => <FormattedMessage id="Section Head ID" />
      },
      {
        accessorFn: (row) => row.remarks,
        id: 'remarks',
        header: () => <FormattedMessage id="Remarks" />
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => <FormattedMessage id="Status" />
      },
      {
        accessorFn: (row) => row.user_id,
        id: 'user_id',
        header: () => <FormattedMessage id="User ID" />
      },
      {
        accessorFn: (row) => (row.user_dt ? row.user_dt.toLocaleString() : ''),
        id: 'user_dt',
        header: () => <FormattedMessage id="User Date" />
      },
      {
        accessorFn: (row) => row.enterprice_code,
        id: 'enterprice_code',
        header: () => <FormattedMessage id="Enterprise Code" />
      },
      {
        accessorFn: (row) => row.staff_cntrl_ac_group,
        id: 'staff_cntrl_ac_group',
        header: () => <FormattedMessage id="Staff Control Account Group" />
      },
      {
        accessorFn: (row) => row.staff_loan_ac_group,
        id: 'staff_loan_ac_group',
        header: () => <FormattedMessage id="Staff Loan Account Group" />
      },
      {
        accessorFn: (row) => row.salary_expense_ac_code,
        id: 'salary_expense_ac_code',
        header: () => <FormattedMessage id="Salary Expense Account Code" />
      },
      {
        accessorFn: (row) => row.expense_sub_type,
        id: 'expense_sub_type',
        header: () => <FormattedMessage id="Expense Sub Type" />
      },
      {
        accessorFn: (row) => row.expense_type,
        id: 'expense_type',
        header: () => <FormattedMessage id="Expense Type" />
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
    data: sectionData,
    isFetching: isSectionFetchLoading,
    refetch: refetchSectionData
  } = useQuery({
    queryKey: ['section_data', filterData, paginationData],
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

  const handleEditSection = (existingData: TSection) => {
    setSectionFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title: <FormattedMessage id="Edit Section" />,
      data: { existingData, isEditMode: true }
    }));
  };

  const toggleSectionPopup = (refetchData?: boolean) => {
    if (sectionFormPopup.action.open === true && refetchData) {
      refetchSectionData();
    }
    setSectionFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleActions = (actionType: string, rowOriginal: TSection) => {
    actionType === 'edit' && handleEditSection(rowOriginal);
  };

  const handleDeleteSection = async () => {
    await HrServiceInstance.deleteMasters(app, pathNameList[pathNameList.length - 1], Object.keys(rowSelection));
    setRowSelection({});
    refetchSectionData();
  };

  const handleImportData = async (values: TSection[]) => {
    const response = await sectionServiceInstance.addBulkSections(values);
    if (response) {
      refetchSectionData();
      return response;
    }
    return false;
  };

  const handleExportData = async () => {
    const response = await sectionServiceInstance.exportSectionsData();
    if (response) {
      refetchSectionData();
      return response;
    }
    return false;
  };

  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => ({
      ...prevData,
      search: value
    }));
  };

  const handleSortingChange = (sorting: SortingState) => {
    setFilterData((prevData) => ({
      ...prevData,
      sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
    }));
  };

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  //---------custom-filter---------
  const customFilter = (
    <div className="flex p-2 justify-end space-x-2 w-full">
      <Button
        size="extraSmall"
        variant="outlined"
        onClick={handleDeleteSection}
        color="error"
        hidden={!Object.keys(rowSelection).length}
        startIcon={<DeleteOutlined />}
      >
        <FormattedMessage id="Delete" />
      </Button>
      <Button startIcon={<PlusOutlined />} variant="contained" size="extraSmall" onClick={() => toggleSectionPopup()}>
        <FormattedMessage id="Add Section" />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col space-y-2">
      <CustomDataTable
        customFilter={customFilter}
        data={sectionData?.tableData || []}
        columns={columns}
        isDataLoading={isSectionFetchLoading}
        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        tableActions={['export', 'import', 'print']}
        handleImportData={handleImportData}
        handleExportData={handleExportData}
        row_id="section_code"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        count={sectionData?.count}
        hasPagination={true}
        onPaginationChange={handleChangePagination}
      />
      {!!sectionFormPopup && sectionFormPopup.action.open && (
        <UniversalDialog
          action={{ ...sectionFormPopup.action }}
          onClose={toggleSectionPopup}
          title={sectionFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddSectionForm
            onClose={toggleSectionPopup}
            isEditMode={sectionFormPopup?.data?.isEditMode}
            existingData={sectionFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default SectionPage;
