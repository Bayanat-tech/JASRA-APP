import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { Box, Chip, Stack, IconButton, Tooltip, Breadcrumbs, Link, Typography } from '@mui/material';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ISearch } from 'components/filters/SearchFilter';
import { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import { getPathNameList } from 'utils/functions';
import { filter } from 'utils/constants';
import HrRequestServiceInstance from 'service/services.hr';
import MyAgGrid from 'components/grid/MyAgGrid';
import { ColDef, CellStyle } from 'ag-grid-community';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import HRAddEmployeeForm from './HRAddEmployeeForm';
import { DialogPop } from 'components/popup/DIalogPop';
import {useIntl } from 'react-intl';

const HREmployeeProfileMainPage = () => {
   const intl = useIntl();
  const { user, permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  const [filterData] = useState<ISearch>(filter);
  const [, setGridApi] = useState<any>(null);
  const [, setSearchData] = useState<any>();
  const [, setToggleFilter] = useState<boolean | null>(null);

  const [paginationData, setPaginationData] = useState({
    page: 0,
    rowsPerPage: rowsPerPageOptions[0]
  });

  const [employeeFormPopup, setEmployeeFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
       title: intl.formatMessage({ id: 'AddEmployee' }) || 'Add Employee',
    data: { isEditMode: false, employee_code: '' }
  });

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const columnDefs = useMemo<ColDef<TEMPLOYEES>[]>(
    () => [
      {
        headerName: intl.formatMessage({ id: 'No.' }) || 'No.',
        width: 60,
        cellStyle: {
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center'
        } as CellStyle,
        minWidth: 60,
        sortable: false,
        filter: false,
        valueGetter: (params: any) => {
          return (params.node?.rowIndex ?? 0) + 1;
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Employee Code' }) || 'Employee Code',
        field: 'EMPLOYEE_CODE',
        width: 120,
        minWidth: 180,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
         headerName: intl.formatMessage({ id: 'AlternateID' }) || 'Alternate ID',
        
        field: 'ALTERNATE_ID',
        width: 120,
        minWidth: 180,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
        headerName: intl.formatMessage({ id: 'ReportName' }) || 'Report Name',
        
        field: 'RPT_NAME',
        width: 180,
        minWidth: 180,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
          headerName: intl.formatMessage({ id: 'JoinDate' }) || 'JoinDate',
        field: 'JOIN_DATE',
        width: 120,
        minWidth: 120,
        cellStyle: { fontSize: '12px' } as CellStyle,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        sortable: true,
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            const cellDate = dayjs(cellValue);
            if (cellDate.isValid()) {
              const cellDateAtMidnight = cellDate.startOf('day').toDate();
              if (cellDateAtMidnight < filterLocalDateAtMidnight) {
                return -1;
              } else if (cellDateAtMidnight > filterLocalDateAtMidnight) {
                return 1;
              } else {
                return 0;
              }
            }
            return 0;
          }
        }
      },
      {
          headerName: intl.formatMessage({ id: 'Status' }) || 'Status',
        field: 'EMP_STATUS',
        width: 120,
        minWidth: 120,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agSetColumnFilter',
        cellRenderer: (params: any) => {
          const status = params.value;
          let color: any = 'default';
          if (status === 'Active') color = 'success';
          if (status === 'Inactive') color = 'error';
          if (status === 'On Leave') color = 'warning';

          return <Chip label={status} color={color} size="small" variant="filled" />;
        }
      },
      {
        headerName: intl.formatMessage({ id: 'Designation' }) || 'Designation',
        field: 'LABOUR_DESG_CODE',
        width: 150,
        minWidth: 150,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agTextColumnFilter'
      },
      {
          headerName: intl.formatMessage({ id: 'Division' }) || 'Division',
        field: 'DIV_NAME',
        width: 120,
        minWidth: 280,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agSetColumnFilter'
      },
      {
         headerName: intl.formatMessage({ id: 'Department' }) || 'Department',
        field: 'DEPT_NAME',
        width: 150,
        minWidth: 250,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agSetColumnFilter'
      },
      {
         headerName: intl.formatMessage({ id: 'Section' }) || 'Section',
        field: 'SECTION_NAME',
        width: 150,
        minWidth: 300,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agSetColumnFilter'
      },
      {
         headerName: intl.formatMessage({ id: 'Nationality' }) || 'Nationality',
        field: 'NATIONALITY',
        width: 120,
        minWidth: 120,
        cellStyle: { fontSize: '12px' } as CellStyle,
        sortable: true,
        filter: 'agSetColumnFilter'
      },
      {
          headerName: intl.formatMessage({ id: 'Actions' }) || 'Actions',
        pinned: 'right',
        width: 100,
        sortable: false,
        filter: false,
        cellStyle: {
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        } as CellStyle,
        cellRenderer: (params: any) => {
          return (
            <Stack direction="row" spacing={0.5}>
            <Tooltip title={intl.formatMessage({ id: 'EditEmployee' }) || 'Edit Employee'}>
                <IconButton size="small" color="primary" onClick={() => handleActions('edit', params.data)}>
                  <EditOutlined style={{ fontSize: '14px' }} />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    []
  );

  const { data: employeeData, refetch: refetchEmployeeData } = useQuery({
    queryKey: ['employee_data', filterData, paginationData, user?.loginid],
    queryFn: async () => {
      try {
        if (user?.loginid || user?.username) {
          const employeeCode = user?.loginid || user?.username;
          const specificEmployee = await HrRequestServiceInstance.getEmployees(employeeCode);
          return { tableData: specificEmployee || [] };
        }
        const employees = await HrRequestServiceInstance.getEmployees('');
        return { tableData: employees };
      } catch (error) {
        console.error('Error fetching employee data:', error);
        return { tableData: [] };
      }
    },
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  const handleTogglePopup = (existingData?: TEMPLOYEES, refetchData?: boolean) => {
    if (employeeFormPopup.action.open && refetchData) {
      refetchEmployeeData();
    }
    setEmployeeFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: `${!!existingData && Object.keys(existingData).length > 0 ? 'Edit' : 'Add'} Employee`,
        data: {
          employeeData: existingData,
          isEditMode: !!existingData
        }
      };
    });
  };

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  const onSortChanged = useCallback((params: any) => {
    const sortedColumn = params?.columnApi?.getColumnState()?.find((col: any) => col.sort);
    setSearchData((prev: any) => ({
      ...prev,
      sort: sortedColumn
        ? {
            field_name: sortedColumn.colId,
            desc: sortedColumn.sort === 'desc'
          }
        : { field_name: 'updated_at', desc: true }
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

    setSearchData((prev: any) => ({
      ...prev,
      search: filters.length > 0 ? filters : [[]]
    }));
  }, []);

  const handleActions = (actionType: string, rowOriginal: TEMPLOYEES) => {
    if (actionType === 'edit') {
      handleTogglePopup(rowOriginal); // Pass the entire employee object
    }
  };
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
            {intl.formatMessage({ id: 'Home' }) || 'Home'}
        </Link>
        <Link underline="hover" color="inherit" href="/pf/activity">
        {intl.formatMessage({ id: 'Masters' }) || 'Masters'}
        </Link>
        <Link underline="hover" color="inherit" href="/pf/activity/request">
            {intl.formatMessage({ id: 'GeneralMaster' }) || 'General Master'}
        </Link>
        <Typography color="text.primary">  {intl.formatMessage({ id: 'EmployeeProfile' }) || 'Employee Profile'}</Typography>
      </Breadcrumbs>

      <MyAgGrid
        rowData={employeeData?.tableData ?? []}
        columnDefs={columnDefs}
        onGridReady={(params) => {
          console.log('Grid Ready, rowData:', employeeData?.tableData || []);
          onGridReady(params);
        }}
        height="480px"
        rowHeight={25}
        headerHeight={30}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={50}
        paginationPageSizeSelector={[10, 20, 50, 100, 1000]}
        pagination
      />

      {employeeFormPopup.action.open && (
        <DialogPop
          width="80%"
          open={employeeFormPopup.action.open}
           title={intl.formatMessage({ id: 'EditEmployee' }) || 'Edit Employee'}
          
          onClose={() => handleTogglePopup(undefined, false)}
        >
          <HRAddEmployeeForm
            onClose={(existingData, refetchData) => handleTogglePopup(existingData, refetchData)}
            isEditMode={employeeFormPopup.data.isEditMode}
            employeeData={employeeFormPopup.data.employeeData}
          />
        </DialogPop>
      )}
    </Box>
  );
};

export default HREmployeeProfileMainPage;
