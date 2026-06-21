import { PlusOutlined } from '@ant-design/icons';
import { Button, Box, TextField, InputAdornment, Breadcrumbs, Link, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
// import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import PfSerivceInstance from 'service/service.purhaseflow';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import AddProjectmasterPfForm from 'components/forms/Purchaseflow/AddProjectmasterPfForm';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TVProjectmaster } from './type/projectmaster-pf-types';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';

const ProjectmasterPfPage = () => {
  //-------------- State ----------
  // const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch | null>(null);
  // const [, setToggleFilter] = useState<boolean | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  //const [ls_search, setLs_search] = useState<string>('');

  const [ProjectmasterViewPopup, setProjectmasterViewPopup] = useState({
    action: { open: false },
    title: '',
    data: { existingData: null as TVProjectmaster | null, isViewMode: false }
  });

  const [ProjectmasterFormPopup, setProjectmasterFormPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'sm' },
    title: 'Add Project Master',
    data: { existingData: {}, isEditMode: false, isViewMode: false }
  });
  const [, setGridApi] = useState<any>(null);

  //-------------- Columns ----------
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: '',
        field: 'checkbox',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        filter: false,
        sortable: false
      },
      {
        headerName: 'Project Code',
        field: 'project_code',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Project Name',
        field: 'project_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Division Name',
        field: 'div_name',
        sortable: true,
        filter: true
      },
      {
        headerName: 'Total Project Cost',
        field: 'total_project_cost',
        sortable: true,
        filter: true,
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => {
          const value = params.value;
          return value ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
        }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: (params: any) => {
          const data = params.data as TVProjectmaster;
          const actionButtons: TAvailableActionButtons[] = ['edit', 'view', 'delete'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  //-------------- Permissions & Fetch ----------
  // const children = permissions?.[app.toUpperCase()]?.children || {};
  // const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
  // const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  // const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);
  // const isQueryEnabled = Boolean(permissionCheck);

  const { data: ProjectmasterData, refetch: refetchProjectmasterData } = useQuery({
    queryKey: ['projectmaster_data', searchData, paginationData],
    queryFn: () => PfSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData)
    // enabled: isQueryEnabled
  });

  // const { refetch: refetchSearchCostmasterData } = useQuery({
  //   queryKey: ['cost_data', searchData, paginationData],

  //   queryFn: () => PfSerivceInstance.getPfglobalsearch(app, `cost_master$$$${ls_search}`, paginationData, searchData)

  //   // enabled: isQueryEnabled,

  //   // staleTime: 10000
  // });

  //-------------- Handlers ----------
  const toggleProjectmasterPopup = (refetchData?: boolean) => {
    setProjectmasterFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {} },
      action: { ...prev.action, open: !prev.action.open }
    }));
    // if (refetchData) refetchProjectmasterData();
  };

  const toggleProjectmasterViewPopup = () => {
    setProjectmasterViewPopup((prev) => ({
      ...prev,
      action: { open: !prev.action.open }
    }));
  };

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
    const updatedSearchData = {
      search: [
        [
          {
            field_name: 'global',
            field_value: value,
            operator: ''
          }
        ]
      ]
    };
    setSearchData(updatedSearchData);

  };

  const handleActions = (actionType: string, rowOriginal: TVProjectmaster) => {
    if (actionType === 'edit') {
      setProjectmasterFormPopup({
        ...ProjectmasterFormPopup,
        title: 'Edit Project Master',
        action: { ...ProjectmasterFormPopup.action, open: true },
        data: { existingData: rowOriginal, isEditMode: true, isViewMode: false }
      });
    } else if (actionType === 'view') {
      setProjectmasterFormPopup({
        ...ProjectmasterFormPopup,
        title: 'View Project Master',
        action: { ...ProjectmasterFormPopup.action, open: true },
        data: { existingData: rowOriginal, isEditMode: false, isViewMode: true }
      });
    } else if (actionType === 'delete') {
      handleDeleteProjectmaster(rowOriginal);
    }
  };

  const handleDeleteProjectmaster = async (rowOriginal: TVProjectmaster) => {
    await PfSerivceInstance.deleteMasters('pf', 'projectmaster', [rowOriginal.project_code]);
    refetchProjectmasterData();
  };

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', ProjectmasterData?.tableData);
  };

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData: any) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
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

    setSearchData((prevData) => ({
      ...prevData,
      search: filters.length > 0 ? filters : [[]]
    }));
  }, []);


  //-------------- Render ----------
  return (
    <div className="flex flex-col space-y-2">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/pf/master">
          Master
        </Link>
        <Link underline="hover" color="inherit" href="/pf/master/gm">
          General Master
        </Link>
        <Typography color="text.primary">Project Masters</Typography>
      </Breadcrumbs>
      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Button color="customBlue" startIcon={<PlusOutlined />} variant="contained" onClick={() => toggleProjectmasterPopup()}>
          Create
        </Button>
      </div>

      <CustomAgGrid
        rowData={ProjectmasterData as any}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={1000}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        pagination={true}
        height="500px"
      />

      {/* Form Dialog */}
      {ProjectmasterFormPopup.action.open && (
        <UniversalDialog
          action={{ ...ProjectmasterFormPopup.action }}
          onClose={() => toggleProjectmasterPopup(true)}
          title={ProjectmasterFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddProjectmasterPfForm
            onClose={() => toggleProjectmasterPopup(true)}
            isEditMode={ProjectmasterFormPopup.data.isEditMode}
            isViewMode={ProjectmasterFormPopup.data.isViewMode}
            existingData={ProjectmasterFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}

      {/* View Dialog */}
      {ProjectmasterViewPopup.action.open && (
        <UniversalDialog
          action={{ ...ProjectmasterViewPopup.action }}
          onClose={toggleProjectmasterViewPopup}
          title={ProjectmasterViewPopup.title}
          hasPrimaryButton={false}
        >
          <AddProjectmasterPfForm
            onClose={toggleProjectmasterViewPopup}
            isEditMode={false}
            isViewMode={true}
            existingData={ProjectmasterViewPopup.data.existingData ?? ({} as TVProjectmaster)}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ProjectmasterPfPage;
