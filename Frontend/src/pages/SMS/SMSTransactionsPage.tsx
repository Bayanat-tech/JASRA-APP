import { PlusOutlined } from '@ant-design/icons';
import { Button, CircularProgress } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { toast } from 'react-toastify';
import { TsalesRequestmaster } from 'types/SMS/sms.types';
import SmsServiceInstance from 'service/SMS/Service.sms';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import UniversalDialog from 'components/popup/UniversalDialog';
import AddSmsTransactionForm from 'components/forms/SMS/AddSmsTransactionForm';

const datePickerComponent = {
  datePickerEditor: forwardRef((props: any, ref) => {
    const [date, setDate] = useState(() => {
      if (!props.value) return null;
      if (typeof props.value === 'string') {
        const parsed = dayjs(props.value, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
        return parsed.isValid() ? parsed : null;
      }
      return null;
    });

    const dateRef = useRef(date);

    useImperativeHandle(ref, () => ({
      getValue() {
        return dateRef.current && dateRef.current.isValid() ? dateRef.current.format('DD/MM/YYYY') : '';
      },
      isCancelBeforeStart: () => false,
      isCancelAfterEnd: () => false
    }));

    const handleDateChange = (newDate: Dayjs | null) => {
      dateRef.current = newDate;
      setDate(newDate);
      props.api.stopEditing();
      props.api.refreshCells({ force: true });
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={date}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              sx: { '.MuiInputBase-input': { padding: '5px' } }
            }
          }}
        />
      </LocalizationProvider>
    );
  })
};

const SalesRequestSmsPage = () => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData] = useState({ page: 1, rowsPerPage: 20000 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [rowData, setRowData] = useState<any[]>([]);
  const gridRef = useRef<any>(null);
  const [masterData, setMasterData] = useState<any>({});
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [formDialog, setFormDialog] = useState({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md' as const
    },
    title: 'Add Transaction',
    data: { existingData: {}, isEditMode: false }
  });

  // Fetch master data for dropdowns
  useEffect(() => {
    const fetchMasters = async () => {
      setLoadingMasters(true);
      try {
        const res = await SmsServiceInstance.getAllMasterData();
        if (res?.data) setMasterData(res.data);
      } finally {
        setLoadingMasters(false);
      }
    };
    fetchMasters();
  }, []);

  //----------- useQuery--------------
  const { data: salesRequestmaster, refetch: refetchsalesRequestmasterData } = useQuery({
    queryKey: ['sales_request', searchData, paginationData],
    queryFn: () => SmsServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  useMemo(() => {
    if (salesRequestmaster?.tableData) {
      const clonedData = salesRequestmaster.tableData.map((row: any) => ({ ...row }));
      setRowData([...clonedData]);
    }
  }, [salesRequestmaster]);

  //-------------handlers---------------

  const handleActions = (actionType: string, rowOriginal: TsalesRequestmaster) => {
    if (actionType === 'delete') {
      if (rowOriginal.isNew) {
        setRowData((prev) => prev.filter((row) => row.sr_no !== rowOriginal.sr_no));
      } else if (rowOriginal.sr_no !== undefined) {
        handleDeleteSingle(String(rowOriginal.sr_no));
      } else {
        toast.error('Cannot delete: Missing sr_no');
      }
    }
  };

  const handleDeleteSingle = async (id: string) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this Request?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await SmsServiceInstance.deleteMasters('SMS', 'sales_request', [id]);
              toast.success('Sales Request deleted successfully');
              refetchsalesRequestmasterData();
            } catch (error) {
              console.error('Error deleting record:', error);
              toast.error('Failed to delete ');
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

  // Register the custom editor during grid initialization
  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onFilterChanged = useCallback((event: any) => {
    const filterModel = event.api.getFilterModel();
    const filters: any[] = [];

    Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
      if (value.filter || value.value) {
        filters.push([{ field_name: field, field_value: value.filter || value.value, operator: 'equals' }]);
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

  const onCellValueChanged = useCallback((params: CellValueChangedEvent) => {
    const { newValue, colDef } = params;
    const field = colDef.field as string;

    if (field === 'deal_status' && newValue !== 'Lost') {
      params.data.lost_reason = '';
      params.api.refreshCells({ rowNodes: [params.node], columns: ['lost_reason'] });
    }

    if (field === 'deal_date' || field === 'project_closing_date') {
      if (!newValue || !dayjs(newValue, 'DD/MM/YYYY', true).isValid()) {
        toast.error(`Invalid date format for ${colDef.headerName}`);
      }
    }
  }, []);

  // Form dialog handlers
  const handleAdd = useCallback(() => {
    setFormDialog((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      title: 'Add Transaction',
      data: { existingData: {}, isEditMode: false }
    }));
  }, []);

  const handleEdit = useCallback((rowData: any) => {
    setFormDialog((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      title: 'Edit Transaction',
      data: { existingData: rowData, isEditMode: true }
    }));
  }, []);

  const handleCloseForm = useCallback(
    (refetch?: boolean) => {
      if (refetch) {
        refetchsalesRequestmasterData();
      }
      setFormDialog((prev) => ({
        ...prev,
        action: { ...prev.action, open: false },
        data: { existingData: {}, isEditMode: false }
      }));
    },
    [refetchsalesRequestmasterData]
  );

  // All columns included!
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Sr No',
        field: 'sr_no',
        sortable: true,
        editable: false,
        filter: false,
        minWidth: 70,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.sr_no || row.sr_no.trim() === '');
          }
        }
      },
      {
        headerName: 'Salesman Name',
        field: 'sales_name',
        editable: false, // Make it non-editable
        width: 150,
        singleClickEdit: false,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.sales_name || row.sales_name.trim() === '');
          }
        }
      },
      {
        headerName: 'Company Name',
        field: 'company_name',
        editable: false,
        singleClickEdit: true,
        width: 150,
        //minWidth: 60,
        //maxWidth: 300,
        cellEditor: 'agSelectCellEditor',
        //cellEditorPopup: true,
        cellEditorParams: {
          values: masterData?.companies?.map((c: any) => c.company_name)?.sort((a: string, b: string) => a.localeCompare(b)) || []
        },
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.company_name || row.company_name.trim() === '');
          }
        }
      },
      {
        headerName: 'Service Offered',
        field: 'service_offered',
        editable: false,
        singleClickEdit: true,
        width: 150,
        //minWidth: 80,
        maxWidth: 300,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: masterData?.services?.map((s: any) => s.service_name)?.sort((a: string, b: string) => a.localeCompare(b)) || []
        },
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.service_offered || row.service_offered.trim() === '');
          }
        }
      },
      {
        headerName: 'Segment',
        field: 'segment',
        editable: false,
        singleClickEdit: true,
        width: 90,
        //minWidth: 70,
        maxWidth: 300,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: masterData?.segments?.map((s: any) => s.segment_name)?.sort((a: string, b: string) => a.localeCompare(b)) || []
        },
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.segment || row.segment.trim() === '');
          }
        }
      },
      {
        headerName: 'Contact Name',
        field: 'contact_name',
        editable: false,
        singleClickEdit: true,
        width: 140,
        //minWidth: 60,
        //maxWidth: 300,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.contact_name || row.contact_name.trim() === '');
          }
        }
      },
      {
        headerName: 'Contact No',
        field: 'contact_number',
        // editable: true,
        singleClickEdit: true,
        width: 110,
        //minWidth: 80,
        //maxWidth: 180,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.contact_number || row.contact_number.trim() === '');
          }
        }
      },
      {
        headerName: 'Deal Description',
        field: 'deal_desc',
        //editable: true,
        width: 150,
        //minWidth: 90,
        //maxWidth: 500,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.deal_desc || row.deal_desc.trim() === '');
          }
        }
      },
      {
        headerName: 'Deal Reference',
        field: 'deal_ref',
        //editable: true,
        width: 140,
        //minWidth: 80,
        //maxWidth: 400,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.deal_ref || row.deal_ref.trim() === '');
          }
        }
      },
      {
        headerName: 'Deal Date',
        field: 'deal_date',
        //editable: true,
        singleClickEdit: true,
        width: 120,
        cellEditor: 'datePickerEditor',
        valueGetter: (params) => {
          if (!params.data?.deal_date) return null;
          return params.data.deal_date; // Return the string directly
        },
        valueFormatter: (params) => {
          if (!params.value) return '';
          const d = dayjs(params.value, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
          return d.isValid() ? d.format('DD/MM/YYYY') : params.value;
        }
      },
      {
        headerName: 'Deal Size',
        field: 'deal_size',
        // editable: true,
        width: 20,
        // minWidth: 25,
        //maxWidth: 100,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.deal_size || row.deal_size.trim() === '');
          }
        }
      },
      {
        headerName: 'Deal Probability',
        field: 'deal_probability',
        //editable: true,
        width: 150,
        //minWidth: 60,
        //maxWidth: 300,
        singleClickEdit: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: masterData?.probabilities?.map((p: any) => p.deal_probability)?.sort((a: string, b: string) => a.localeCompare(b)) || []
        },
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.deal_probability || row.deal_probability.trim() === '');
          }
        }
      },
      {
        headerName: 'Deal Status',
        field: 'deal_status',
        //editable: true,
        width: 90,
        //minWidth: 50,
        maxWidth: 120,
        singleClickEdit: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: masterData?.deals?.map((d: any) => d.deal_status)?.sort((a: string, b: string) => a.localeCompare(b)) || []
        },
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.deal_status || row.deal_status.trim() === '');
          }
        }
      },
      {
        headerName: 'Weighted Forecast',
        field: 'weighted_forecast',
        //editable: true,
        width: 170,
        //minWidth: 50,
        //maxWidth: 300,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.weighted_forecast || row.weighted_forecast.trim() === '');
          }
        }
      },
      {
        headerName: 'Lost Reason',
        field: 'lost_reason',
        minWidth: 160,
        maxWidth: 300,
        singleClickEdit: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorPopup: true,
        cellEditorParams: {
          values: masterData?.reasons?.map((r: any) => r.lost_reason)?.sort((a: string, b: string) => a.localeCompare(b)) || []
        },
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.lost_reason || row.lost_reason.trim() === '');
          }
        }
      },
      {
        headerName: 'Status Update',
        field: 'status_update',
        //editable: true,
        width: 135,
        //minWidth: 50,
        maxWidth: 300,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.status_update || row.status_update.trim() === '');
          }
        }
      },
      {
        headerName: 'Project Closing Date',
        field: 'project_closing_date',
        //editable: true,
        width: 120,
        singleClickEdit: true,
        cellEditor: 'datePickerEditor',
        valueGetter: (params) => {
          if (!params.data?.project_closing_date) return null;
          return params.data.project_closing_date; // Return the string directly
        },
        valueFormatter: (params) => {
          if (!params.value) return '';
          const d = dayjs(params.value, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
          return d.isValid() ? d.format('DD/MM/YYYY') : params.value;
        }
      },
      {
        headerName: 'Next Action',
        field: 'next_action',
        //editable: true,
        width: 80,
        //minWidth: 50,
        maxWidth: 800,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.next_action || row.next_action.trim() === '');
          }
        }
      },
      {
        headerName: 'Note',
        field: 'note',
        editable: false,
        width: 100,
        //minWidth: 50,
        maxWidth: 800,
        singleClickEdit: false,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.note || row.note.trim() === '');
          }
        }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        filter: false,
        cellRenderer: (params: { data: any }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
          return (
            <ActionButtonsGroup
              handleActions={(action) => {
                if (action === 'edit') {
                  handleEdit(params.data);
                } else if (action === 'delete') {
                  handleActions('delete', params.data);
                }
              }}
              buttons={actionButtons}
            />
          );
        }
      }
    ],
    [masterData]
  );

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Sales Transaction</h2>
          <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={handleAdd} disabled={loadingMasters}>
            Add Transaction
          </Button>
        </div>

        {loadingMasters ? (
          <div className="flex justify-center items-center h-96">
            <CircularProgress />
          </div>
        ) : (
          <div className="ag-theme-alpine" style={{ height: '600px' }}>
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              rowHeight={25}
              headerHeight = {35}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
                minWidth: 120
              }}
              pagination={true}
              paginationPageSize={paginationData.rowsPerPage}
              paginationPageSizeSelector={[20, 50, 100, 500, 2000,5000,10000]}
              onGridReady={onGridReady}
              onFilterChanged={onFilterChanged}
              onSortChanged={onSortChanged}
              onCellValueChanged={onCellValueChanged}
              suppressRowClickSelection={true}
              components={datePickerComponent}
            />
          </div>
        )}
      </div>

      {formDialog.action.open && (
        <UniversalDialog action={formDialog.action} onClose={() => handleCloseForm()} title={formDialog.title} hasPrimaryButton={false}>
          <AddSmsTransactionForm
            onClose={handleCloseForm}
            isEditMode={formDialog.data.isEditMode}
            existingData={formDialog.data.existingData}
            masterData={masterData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default SalesRequestSmsPage;
