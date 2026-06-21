import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { TDivision, TEmployeeHr, TSectionHr, TTableEmployeeHr } from 'pages/WMS/types/employee-hr.types';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { filter } from 'utils/constants';
import { getPathNameList, handleChangePagination, handleSortingChange } from 'utils/functions';
import AddEmployeeHrForm from 'components/forms/HR/Masters/Employee/AddEmployeeHrForm';
import dayjs from 'dayjs';
import employeeServiceInstance from 'service/GM/service.employee_hr';
import HrServiceInstance from 'service/Service.hr';
import { Button } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const EmployeeHrPage = () => {
  // Fetch department data using React Query
  const { data: departmentData } = useQuery({
    queryKey: ['department_data'],
    queryFn: () => HrServiceInstance.getMasters('hr', 'hrDepartment')
  });

  // Fetch section data using React Query
  const { data: sectionData } = useQuery({
    queryKey: ['Section_data'],
    queryFn: () => HrServiceInstance.getMasters('hr', 'hrSection')
  });

  // Fetch division data using React Query
  const { data: divisionData } = useQuery({
    queryKey: ['division_data'],
    queryFn: () => HrServiceInstance.getMasters('hr', 'hrDivision')
  });

  // Constants and state management
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [filterData, setFilterData] = useState<ISearch>(filter);
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [employeeFormPopup, setEmployeeFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: 'Add Employee',
    data: { isEditMode: false, employee_code: '' }
  });

  // Handle filter change
  const handleFilterChange = (value: ISearch['search']) => {
    setFilterData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };

  // Define columns for the data table
  const columns = useMemo<ColumnDef<TTableEmployeeHr>[]>(
    () => [
      {
        accessorFn: (row) => row.employee_code,
        id: 'employee_code',
        header: () => <FormattedMessage id="Emp Code" />
      },
      {
        accessorFn: (row) => row.alternate_id,
        id: 'alternate_id',
        header: () => <FormattedMessage id="Alternate ID" />
      },
      {
        accessorFn: (row) => row.rpt_name,
        id: 'rpt_name',
        header: () => <FormattedMessage id="Employee Name" />
      },
      {
        accessorFn: (row) => dayjs(row.join_date).format('DD/MM/YYYY'),
        id: 'join_date',
        meta: {
          filterVariant: 'date'
        },
        header: () => <FormattedMessage id="Join Date" />
      },
      {
        accessorFn: (row) => row.emp_status,
        id: 'emp_status',
        header: () => <FormattedMessage id="Status" />
      },
      {
        accessorFn: (row) => row.labour_desg_code,
        id: 'labour_desg_code',
        header: () => <FormattedMessage id="Designation" />
      },
      {
        accessorFn: (row) => row.div_name,
        meta: {
          filterVariant: 'select',
          listData:
            (divisionData?.tableData as TDivision[])?.map?.((eachDivision) => {
              return { label: eachDivision.div_name, value: eachDivision.div_code };
            }) ?? []
        },
        id: 'div_code',
        header: () => <FormattedMessage id="Division" />
      },
      {
        accessorFn: (row) => row.dept_name,
        meta: {
          filterVariant: 'select',
          listData:
            (departmentData?.tableData as TDepartment[])?.map?.((eachDepartment) => {
              return { label: eachDepartment.dept_name, value: eachDepartment.dept_code };
            }) ?? []
        },
        id: 'dept_code',
        header: () => <FormattedMessage id="Department" />
      },
      {
        accessorFn: (row) => row.section_name,
        meta: {
          filterVariant: 'select',
          listData:
            (sectionData?.tableData as TSectionHr[])?.map?.((eachSection) => {
              return { label: eachSection.section_name, value: eachSection.section_code };
            }) ?? []
        },
        id: 'section_code',
        header: () => <FormattedMessage id="Section" />
      },
      {
        accessorFn: (row) => row.nationality,
        id: 'Nationality',
        header: () => <FormattedMessage id="Nationality" />
      },
      {
        id: 'actions',
        header: () => <FormattedMessage id="Actions" />,
        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [departmentData, divisionData, sectionData]
  );

  // Fetch employee data using React Query
  const {
    data: employeeData,
    isFetching: isEmployeeFetchLoading,
    refetch: refetchEmployeeData
  } = useQuery({
    queryKey: ['employee_data', filterData, paginationData],
    queryFn: () => HrServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, filterData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  // Handle toggle of the employee form popup
  const handleTogglePopup = (existingData?: TEmployeeHr, refetchData?: boolean) => {
    if (employeeFormPopup.action.open && refetchData) {
      refetchEmployeeData();
    }
    setEmployeeFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: `${!!existingData && Object.keys(existingData).length > 0 ? 'Edit' : 'Add'} Employee`,
        data: {
          employee_code: existingData?.employee_code || '',
          isEditMode: !!existingData
        }
      };
    });
  };

  // Handle import of employee data
  const handleImportData = async (values: TEmployeeHr[]) => {
    const response = await employeeServiceInstance.addBulkData(values);
    if (response) {
      refetchEmployeeData();
      return response;
    }
    return false;
  };

  // Handle export of employee data
  const handleExportData = async () => {
    const response = await employeeServiceInstance.exportData();
    if (response) {
      refetchEmployeeData();
      return response;
    }
    return false;
  };

  // Handle actions on the employee data table
  const handleActions = (actionType: string, rowOriginal: TEmployeeHr) => {
    actionType === 'edit' && handleTogglePopup(rowOriginal);
  };

  // Effect to reset the filter toggle state
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  // Custom filter component
  const customFilter = (
    <div className="w-full flex justify-end p-2">
      <Button size="extraSmall" startIcon={<PlusOutlined />} variant="contained" onClick={() => handleTogglePopup()}>
        <FormattedMessage id="Add Employee" />
      </Button>
    </div>
  );

  return (
    <div>
      {/* Custom Data Table for displaying employee data */}
      <CustomDataTable
        columns={columns}
        data={employeeData?.tableData ?? []}
        isDataLoading={isEmployeeFetchLoading}
        customFilter={customFilter}
        handleSortingChange={(sorting: SortingState) => handleSortingChange(sorting, setFilterData)}
        handleFilterChange={handleFilterChange}
        toggleFilter={toggleFilter}
        tableActions={['export', 'import', 'print']}
        handleExportData={handleExportData}
        handleImportData={handleImportData}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        count={employeeData?.count}
        onPaginationChange={(page: number, rowsPerPage: number) => handleChangePagination(page, rowsPerPage, setPaginationData)}
      />
      {/* Universal Dialog for adding/editing employee data */}
      {!!employeeFormPopup && employeeFormPopup.action.open && (
        <UniversalDialog
          action={{ ...employeeFormPopup.action }}
          onClose={handleTogglePopup}
          title={employeeFormPopup.data.isEditMode ? <FormattedMessage id="Edit Employee" /> : <FormattedMessage id="Add Employee" />}
          hasPrimaryButton={false}
        >
          <AddEmployeeHrForm
            onClose={(existingData, refetchData) => handleTogglePopup(existingData, refetchData)}
            isEditMode={employeeFormPopup?.data?.isEditMode}
            employee_code={employeeFormPopup.data.employee_code}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default EmployeeHrPage;
