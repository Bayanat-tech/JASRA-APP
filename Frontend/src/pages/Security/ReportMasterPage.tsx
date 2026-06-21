import { PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { ISearch } from 'components/filters/SearchFilter';
import useAuth from 'hooks/useAuth';
import { useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import { TReportmaster } from './type/flowmaster-sec-types';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import GmSecServiceInstance from 'service/security/services.gm_security';
import SecSerivceInstance from 'service/service.security';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { ColDef, GridApi, CellValueChangedEvent } from 'ag-grid-community';
import { toast } from 'react-toastify';

const ReportMasterPage = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 10 });
  const [searchData, setSearchData] = useState<ISearch>();
  const [rowData, setRowData] = useState<any[]>([]);
  const [editedRows, setEditedRows] = useState<{ [key: string]: { field: string; value: any }[] }>({});
  const [originalRows, setOriginalRows] = useState<{ [key: string]: any }>({});
  const [newRows, setNewRows] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const gridApiRef = useRef<GridApi | null>(null);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Module',
        field: 'module',
        sortable: true,
        editable: true,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.module || row.module.trim() === '');
          }
        }
      },
      {
        headerName: 'Report Name',
        field: 'reportname',
        sortable: true,
        editable: true,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.reportname || row.reportname.trim() === '');
          }
        }
      },
      {
        headerName: 'Report Id',
        field: 'reportid',
        editable: true,
        singleClickEdit: true,
        cellClassRules: {
          'invalid-cell': (params) => {
            const row = params.data;
            return row?.isNew && (!row.reportid || row.reportid.trim() === '');
          }
        }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        filter: false,
        cellRenderer: (params: { data: any }) => {
          const actionButtons: TAvailableActionButtons[] = ['delete'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  //----------- useQuery--------------
  const { data: reportmaster, refetch: refetchsecmasterData } = useQuery({
    queryKey: ['SecLogin', searchData, paginationData],
    queryFn: () => WmsSerivceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  useMemo(() => {
    if (reportmaster?.tableData) {
      setRowData([...newRows, ...reportmaster.tableData]);
    }
  }, [reportmaster, newRows]);

  //-------------handlers---------------

  const handleActions = (actionType: string, rowOriginal: TReportmaster) => {
    if (actionType === 'delete') {
      if (rowOriginal.isNew) {
        setNewRows((prev) => prev.filter((row) => row.reportid !== rowOriginal.reportid));
        setRowData((prev) => prev.filter((row) => row.reportid !== rowOriginal.reportid));
      } else if (rowOriginal.report_no !== undefined) {
        handleDeleteSingle(String(rowOriginal.report_no));
      } else {
        toast.error('Cannot delete: Missing report identifier');
      }
    }
  };

  const handleDeleteSingle = async (id: string) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this Report?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await SecSerivceInstance.deleteMasters('security', 'report_master', [id]);
              toast.success('Report deleted successfully');
              refetchsecmasterData();
            } catch (error) {
              console.error('Error deleting record:', error);
              toast.error('Failed to delete report');
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
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
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

  const onCellValueChanged = (params: CellValueChangedEvent) => {
    const { data, newValue, colDef } = params;
    const report_no = data.report_no;
    const field = colDef.field as string;

    if (!report_no) {
      // Handle new rows
      if (data.isNew) {
        setNewRows((prev) => {
          const idx = prev.findIndex((r) => r.tempId === data.tempId);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: newValue };
            return updated;
          }
          return prev;
        });
      }
      return;
    }

    // For existing rows
    setOriginalRows((prev) => {
      if (!prev[report_no]) {
        const original = rowData.find((r) => r.report_no === report_no && !r.isNew);
        if (original) {
          return { ...prev, [report_no]: { ...original } };
        }
      }
      return prev;
    });

    setEditedRows((prev) => {
      const changes = prev[report_no] || [];

      // Check if the value is actually different from original
      const originalValue = originalRows[report_no]?.[field];
      const isChanged = newValue !== originalValue;

      if (isChanged) {
        // Add or update the change
        const existingChangeIndex = changes.findIndex((c) => c.field === field);
        if (existingChangeIndex >= 0) {
          changes[existingChangeIndex].value = newValue;
        } else {
          changes.push({ field, value: newValue });
        }
      } else {
        // Remove the change if it's reverted to original
        const filteredChanges = changes.filter((c) => c.field !== field);
        if (filteredChanges.length === 0) {
          const newState = { ...prev };
          delete newState[report_no];
          return newState;
        }
        return { ...prev, [report_no]: filteredChanges };
      }

      return { ...prev, [report_no]: changes };
    });
  };

  const handleAddRow = () => {
    const newRow = {
      module: '',
      reportname: '',
      reportid: '',
      company_code: 'JASRA',
      tempId: Date.now(),
      isNew: true
    };

    setNewRows((prev) => [newRow, ...prev]);
    setRowData((prev) => [newRow, ...prev]);

    setTimeout(() => {
      if (gridApiRef.current) {
        const rowIndex = 0;
        gridApiRef.current.ensureIndexVisible(rowIndex);
        gridApiRef.current.startEditingCell({
          rowIndex,
          colKey: 'module'
        });
      }
    }, 100);
  };

  const validateNewRows = () => {
    const invalidRows = newRows.filter((row) => !row.module || !row.reportname || !row.reportid);

    if (invalidRows.length > 0) {
      setValidationError('Module, Report Name, and Report ID are required for all new rows.');
      toast.error('Module, Report Name, and Report ID are required for all new rows.');
      return false;
    }

    const reportIds = new Set();
    for (const row of newRows) {
      if (reportIds.has(row.reportid)) {
        setValidationError(`Duplicate Report ID found: ${row.reportid}`);
        toast.error(`Duplicate Report ID found: ${row.reportid}`);
        return false;
      }
      reportIds.add(row.reportid);
    }

    setValidationError(null);
    return true;
  };

  const validateEditRow = (data: { reportid: string; module?: string; reportname?: string }) => {
    if (!data.module || data.module.trim() === '') {
      return 'Module is required';
    }
    if (!data.reportname || data.reportname.trim() === '') {
      return 'Report Name is required';
    }
    if (!data.reportid || data.reportid.trim() === '') {
      return 'Report ID is required';
    }
    return null;
  };

  const handleSave = async () => {
    if (!validateNewRows()) return;

    setIsSaving(true);
    try {
      const savePromises = newRows.map(async (row) => {
        const payload = { ...row };
        delete payload.tempId;
        delete payload.isNew;
        await GmSecServiceInstance.addReportMaster(payload);
      });

      await Promise.all(savePromises);
      toast.success('New reports saved successfully');
      setNewRows([]);
      refetchsecmasterData();
    } catch (error) {
      toast.error('Failed to save some reports');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModify = async () => {
    const reportNumbers = Object.keys(editedRows);
    if (reportNumbers.length === 0) {
      setValidationError('No changes detected to save');
      toast.warn('No changes detected to save');
      return;
    }

    for (const report_no of reportNumbers) {
      const changes = editedRows[report_no];
      const row = rowData.find((r) => r.report_no === Number(report_no));
      if (!row) continue;

      // Create updated row data for validation
      const updatedRow = { ...row };
      changes.forEach((change) => {
        updatedRow[change.field] = change.value;
      });

      const validationErrorMsg = validateEditRow(updatedRow);
      if (validationErrorMsg) {
        setValidationError(validationErrorMsg);
        toast.error(validationErrorMsg);
        return;
      }

      try {
        // Prepare payload with only changed fields
        const payload: any = { report_no: Number(report_no) };
        changes.forEach((change) => {
          payload[change.field] = change.value;
        });

        await GmSecServiceInstance.editReportMaster(payload);
        toast.success(`Report ${report_no} updated successfully`);

        // Update original rows to reflect the changes
        setOriginalRows((prev) => ({
          ...prev,
          [report_no]: { ...prev[report_no], ...payload }
        }));

        refetchsecmasterData();
      } catch (error) {
        toast.error(`Failed to update report ${report_no}`);
      }
    }

    setEditedRows({});
    setValidationError(null);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Button startIcon={<PlusOutlined />} color="customBlue" variant="contained" onClick={handleAddRow} disabled={isSaving}>
          Add Row
        </Button>
        <Button
          startIcon={<SaveOutlined />}
          color="success"
          variant="contained"
          onClick={handleSave}
          disabled={newRows.length === 0 || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button color="primary" variant="contained" onClick={handleModify} disabled={Object.keys(editedRows).length === 0 || isSaving}>
          Modify
        </Button>
      </div>
      {validationError && <div style={{ color: 'red', marginBottom: 8 }}>{validationError}</div>}
      <CustomAgGrid
        rowData={rowData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        onSortChanged={onSortChanged}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        paginationPageSize={1000}
        pagination={true}
        height="600px"
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
};

export default ReportMasterPage;
