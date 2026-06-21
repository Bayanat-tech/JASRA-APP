import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Box, Button, InputAdornment, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

// import Partner Table
import { TPartner } from './types/partner-wms.types';

//import GM
import PartnerServiceInstance from 'service/GM/service.partner_wms';

// import form
import AddPartnerWmsForm from 'components/forms/AddPartnerWmsForm';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef } from 'ag-grid-community';
import { SearchIcon } from 'lucide-react';

const PartnerWmsPage = () => {
  //--------------constants----------

  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>();
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [, setGridApi] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [, setLs_search] = useState<string>('');
  const [PartnerFormPopup, setPartnerFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: <FormattedMessage id="Add Partner" />,
    data: { existingData: {}, isEditMode: false }
  });

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: '',
        field: 'checkbox',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      {
        field: 'broker_code',
        headerName: 'Broker Code',
        sortable: true,
        filter: true
      },
      {
        field: 'broker_name',
        headerName: 'Broker Name'
      },
      {
        field: 'broker_addr1',
        headerName: 'Address'
      },
      {
        field: 'broker_city',
        headerName: 'City'
      },
      {
        field: 'company_code',
        headerName: 'Company Code'
      },
      {
        field: 'country_code',
        headerName: 'Country Code'
      },
      {
        field: 'broker_contact1',
        headerName: 'Contact Person'
      },
      {
        field: 'broker_telno1',
        headerName: 'Telephone'
      },
      {
        field: 'broker_email1',
        headerName: 'Email'
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

  //----------- useQuery--------------
  const {
    data: broker_code,
    //isFetching: isPartnerFetchLoading,
    refetch: refetchPartnerData
  } = useQuery({
    queryKey: ['broker_code', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', broker_code?.tableData);
  };

  const handleEditPartner = (existingData: TPartner) => {
    setPartnerFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Partner" />,
        data: { existingData, isEditMode: true }
      };
    });
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
    setLs_search(value);

    // Trigger the refetch for the search API
    refetchPartnerData();
  };

  const togglePartnerPopup = (refetchData?: boolean) => {
    if (PartnerFormPopup.action.open === true && refetchData) {
      refetchPartnerData();
    }
    setPartnerFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TPartner) => {
    actionType === 'edit' && handleEditPartner(rowOriginal);
  };

  const handleDeletePartner = async () => {
    await PartnerServiceInstance.deletePartner(Object.keys(rowSelection));
    setRowSelection({});
    refetchPartnerData();
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

  //------------------useEffect----------------
  useEffect(() => {
    setSearchData(null as any);
    setToggleFilter(null as any);
  }, []);

  return (
    <div className="flex flex-col space-y-2">
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
        <Button
          startIcon={<PlusOutlined />}
          color="customBlue"
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          // variant="contained"
          onClick={() => togglePartnerPopup()}
        >
          Partner
        </Button>
        {
          // Delete Button
          <Button
            variant="outlined"
            onClick={handleDeletePartner}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            <FormattedMessage id="Delete" />
          </Button>
        }
      </div>
      <CustomAgGrid
        rowData={broker_code?.tableData || []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination
        height="520px"
        rowHeight={20}
        headerHeight={30}
      />
      {PartnerFormPopup.action.open === true && (
        <UniversalDialog
          action={{ ...PartnerFormPopup.action }}
          onClose={togglePartnerPopup}
          title={PartnerFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddPartnerWmsForm
            onClose={togglePartnerPopup}
            isEditMode={PartnerFormPopup?.data?.isEditMode}
            existingData={PartnerFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
      ;
    </div>
  );
};

export default PartnerWmsPage;
