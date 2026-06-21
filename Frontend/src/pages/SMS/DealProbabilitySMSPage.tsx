import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Breadcrumbs, Button, Link, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddDealProbabilitySmsForm from 'components/forms/SMS/AddDealProbabilitySmsForm';
import { ColDef } from 'ag-grid-community';
import SmsServiceInstance from 'service/SMS/Service.sms';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import CustomGrid from 'components/grid/CustomGrid';

const DealProbabilitySmsPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 50 });
  const [, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [probabilityFormPopup, setProbabilityFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Add Deal Probability Master',
    data: { existingData: {}, isEditMode: false }
  });
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Deal Probability ID',
        field: 'probability_code',
        sortable: true,
        filter: false
      },
      {
        headerName: 'Deal Probability',
        field: 'deal_probability',
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
  console.log(
    'pageHHHH',
    permissions,
    app.toUpperCase(),
    permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
  );

  //----------- useQuery--------------
  const { data: probabilitymasterData, refetch: refetchprobabilityData } = useQuery({
    queryKey: ['deal_probability', searchData, paginationData],
    queryFn: () => SmsServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });
  //-------------handlers---------------

  const handleEditprobabilitymaster = (rowOriginal: any) => {
    setProbabilityFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: 'Edit Probability Master',
        data: { existingData: rowOriginal, isEditMode: true }
      };
    });
  };

  const toggleprobabilityPopup = (refetchData?: boolean) => {
    if (probabilityFormPopup.action.open === true && refetchData) {
      refetchprobabilityData();
    }
    setProbabilityFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleDeleteSingle = async (id: string) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this ?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await SmsServiceInstance.deleteMasters('sms', 'probability_master', [id]);
              refetchprobabilityData();
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

  const handleActions = (action: string, data: any) => {
    if (action === 'edit') {
      handleEditprobabilitymaster(data);
    } else if (action === 'delete') {
      handleDeleteSingle(data.id);
    }
  };
  const handleprobabilitymaster = async () => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete selected probability?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await SmsServiceInstance.deleteMasters('sms', 'probability_master', Object.keys(rowSelection));
              setRowSelection({});
              refetchprobabilityData();
            } catch (error) {
              console.error('Error deleting records:', error);
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
    console.log('Grid Data:', probabilitymasterData?.tableData);
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

  //----------------Filter and sorting ----------------
  return (
    <div className="flex flex-col space-y-2">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0, mt: 0 }}>
        <Link underline="hover" color="inherit" href="/sms/masters">
          Masters
        </Link>
        <Link underline="hover" color="inherit" href="/sms/masters/gm">
          General Master
        </Link>
        <Typography color="text.primary"> Deal Probability </Typography>
      </Breadcrumbs>
      <div className="flex justify-end space-x-2">
        {
          <Button
            variant="outlined"
            onClick={handleprobabilitymaster}
            color="error"
            hidden={!Object.keys(rowSelection).length}
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        }
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={() => toggleprobabilityPopup()}>
          Add Deal Probability
        </Button>
      </div>
      <CustomGrid
        rowData={(probabilitymasterData?.tableData || []).map((row: any) => ({
          ...row
        }))}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        paginationPageSize={1000}
        pagination={true}
        height="550px"
      />
      {!!probabilityFormPopup && probabilityFormPopup.action.open && (
        <UniversalDialog
          action={{ ...probabilityFormPopup.action }}
          onClose={toggleprobabilityPopup}
          title={probabilityFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddDealProbabilitySmsForm
            onClose={toggleprobabilityPopup}
            isEditMode={probabilityFormPopup?.data?.isEditMode}
            existingData={probabilityFormPopup.data.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default DealProbabilitySmsPage;
