import { useMemo, useState, useRef, useCallback } from 'react';
import { Button, Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { UploadOutlined, DownloadOutlined, CloudUploadOutlined, EditOutlined } from '@ant-design/icons';
import { ColDef } from 'ag-grid-community';
import * as XLSX from 'xlsx';
import axiosServices from 'utils/axios';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import UniversalDialog from 'components/popup/UniversalDialog';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

// =====================================================================================
// TYPES
// =====================================================================================
type TEmployeeSupervisor = {
  EMPLOYEE_NO: string;
  EMPLOYEE_NAME: string;
  POSITION: string;
  IMMEDIATE_SUPERVISOR: string;
  LEVEL_1: string;
  LEVEL_2: string;
  SENIOR_PAYROLL: string;
  HR_MANAGER: string;
};

// =====================================================================================
// Map Excel row → table columns
// =====================================================================================
const mapExcelRowToApi = (row: any): TEmployeeSupervisor => {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      if (row[k] != null && String(row[k]).trim() !== '') return String(row[k]).trim();
    }
    return '';
  };

  return {
    EMPLOYEE_NO: get('EMPLOYEE_NO', 'Employee_id', 'employee_no', 'Employee ID'),
    EMPLOYEE_NAME: get('EMPLOYEE_NAME', 'Employee name', 'employee_name', 'Employee Name'),
    POSITION: get('POSITION', 'Design', 'position', 'Position'),
    IMMEDIATE_SUPERVISOR: get(
      'IMMEDIATE_SUPERVISOR',
      'Level1',
      'immediate_supervisor',
      'Immediate Supervisor'
    ),
    LEVEL_1: get('LEVEL_1', 'Level2', 'level_1', 'Level 1'),
    LEVEL_2: get('LEVEL_2', 'level3', 'Level3', 'level_2', 'Level 2'),
    SENIOR_PAYROLL: get('SENIOR_PAYROLL', 'level4', 'Level4', 'senior_payroll', 'Senior Payroll'),
    HR_MANAGER: get('HR_MANAGER', 'level5', 'Level5', 'hr_manager', 'HR Manager')
  };
};

// =====================================================================================
// SERVICE
// =====================================================================================
const BulkTransferService = {
  // Bulk insert/update into EMPLOYEE_SUPERVISOUR
  insUpdEmployeeSupervisourBulk: async (data: TEmployeeSupervisor[]) => {
    const response = await axiosServices.post('/api/hr/transfer_request_flow_bulk', { data });
    return response.data;
  },

  // Generic raw SQL
  executeRawSql: async (rawSql: string): Promise<any> => {
    try {
      if (!rawSql) {
        console.warn('Missing raw SQL input.');
        return null;
      }

      const response = await axiosServices.post('/api/wms/inbound/executeRawSql', {
        raw_sql: rawSql
      });

      if (response.data?.success) {
        return response.data;
      }

      console.error('SQL execution failed:', response.data?.error);
      return null;
    } catch (error: unknown) {
      console.error('Error in executeRawSql:', (error as { message: string }).message);
      throw error;
    }
  },

  // Update MS_HR_EMPLOYEE hierarchy from EMPLOYEE_SUPERVISOUR
  updateBulkSupervisor: async () => {
    const response = await axiosServices.post('/api/hr/update_bulk_supervisor');
    return response.data;
  }
};

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================
const BulkTransferUtilityMaster = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog state
  const [dialog, setDialog] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'lg' },
    title: 'Employee Supervisor – Bulk Transfer'
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Dialog grid = only what user just uploaded
  const [uploadedTempData, setUploadedTempData] = useState<TEmployeeSupervisor[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // -----------------------------------------------------------------
  // Shared column defs
  // -----------------------------------------------------------------
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'EMPLOYEE_NO', headerName: 'EMPLOYEE_NO', minWidth: 120 },
      { field: 'EMPLOYEE_NAME', headerName: 'EMPLOYEE_NAME', minWidth: 200 },
      { field: 'POSITION', headerName: 'POSITION', minWidth: 120 },
      { field: 'IMMEDIATE_SUPERVISOR', headerName: 'IMMEDIATE_SUPERVISOR', minWidth: 160 },
      { field: 'LEVEL_1', headerName: 'LEVEL_1', minWidth: 110 },
      { field: 'LEVEL_2', headerName: 'LEVEL_2', minWidth: 110 },
      { field: 'SENIOR_PAYROLL', headerName: 'SENIOR_PAYROLL', minWidth: 140 },
      { field: 'HR_MANAGER', headerName: 'HR_MANAGER', minWidth: 120 }
    ],
    []
  );

  // -----------------------------------------------------------------
  // Download Excel template
  // -----------------------------------------------------------------
  const handleDownloadTemplate = useCallback(() => {
    const sampleRow = {
      EMPLOYEE_NO: '10001',
      EMPLOYEE_NAME: 'Sample Employee',
      POSITION: 'Manager',
      IMMEDIATE_SUPERVISOR: '10002',
      LEVEL_1: '10002',
      LEVEL_2: '10002',
      SENIOR_PAYROLL: '10024',
      HR_MANAGER: '10024'
    };

    const ws = XLSX.utils.json_to_sheet([sampleRow], {
      header: [
        'EMPLOYEE_NO',
        'EMPLOYEE_NAME',
        'POSITION',
        'IMMEDIATE_SUPERVISOR',
        'LEVEL_1',
        'LEVEL_2',
        'SENIOR_PAYROLL',
        'HR_MANAGER'
      ]
    });

    ws['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 22 },
      { wch: 12 },
      { wch: 12 },
      { wch: 16 },
      { wch: 14 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EMPLOYEE_SUPERVISOUR');
    XLSX.writeFile(wb, 'EMPLOYEE_SUPERVISOUR_Template.xlsx');
  }, []);

  // -----------------------------------------------------------------
  // Dialog open / close
  // -----------------------------------------------------------------
  const openDialog = () => {
    setSelectedFile(null);
    setUploadedTempData([]);
    setDialogMessage(null);
    setDialog((prev) => ({
      ...prev,
      action: { ...prev.action, open: true }
    }));
  };

  const closeDialog = () => {
    setDialog((prev) => ({
      ...prev,
      action: { ...prev.action, open: false }
    }));
    setSelectedFile(null);
    setUploadedTempData([]);
    setDialogMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // -----------------------------------------------------------------
  // Excel selected → parse → call bulk API immediately → show uploaded rows in dialog grid
  // -----------------------------------------------------------------
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allow re-selecting the same file
    if (fileInputRef.current) fileInputRef.current.value = '';

    setSelectedFile(file);
    setDialogMessage(null);
    setUploadedTempData([]);
    setIsUploading(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!jsonRows.length) {
        setDialogMessage({
          type: 'error',
          text: 'The selected file has no data rows. Please use the template and try again.'
        });
        return;
      }

      const mapped = jsonRows
        .map(mapExcelRowToApi)
        .filter((r) => r.EMPLOYEE_NO && r.EMPLOYEE_NO.length > 0);

      if (!mapped.length) {
        setDialogMessage({
          type: 'error',
          text: 'No valid employees found. Please ensure EMPLOYEE_NO is filled for every row.'
        });
        return;
      }

      // Call bulk API immediately
      const result = await BulkTransferService.insUpdEmployeeSupervisourBulk(mapped);

      if (!result?.success) {
        setDialogMessage({
          type: 'error',
          text: result?.message || 'Upload failed. Please check the file and try again.'
        });
        return;
      }

      // Success → show exactly what user uploaded
      setUploadedTempData(mapped);
      setDialogMessage({
        type: 'success',
        text: `Upload successful. ${mapped.length} employee record(s) saved. Review the data below.`
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setDialogMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          err?.message ||
          'Unable to save records. Please try again or contact support.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------------------------------------------
  // Update → PROC_UPDATE_BULK_SUPERVISOR via controller
  // -----------------------------------------------------------------
  const handleUpdate = async () => {
    if (!uploadedTempData.length) {
      setDialogMessage({
        type: 'error',
        text: 'Nothing to update. Please upload an Excel file first.'
      });
      return;
    }

    setIsUploading(true);
    setDialogMessage(null);

    try {
      const result = await BulkTransferService.updateBulkSupervisor();

      if (result?.success) {
        setDialogMessage({
          type: 'success',
          text:
            result.message ||
            'Update successful. HR employee supervisor hierarchy has been refreshed.'
        });
      } else {
        setDialogMessage({
          type: 'error',
          text: result?.message || 'Update failed. Please try again.'
        });
      }
    } catch (err: any) {
      console.error('Update API error:', err);
      setDialogMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          err?.message ||
          'Unable to update HR employee records. Please try again or contact support.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Bulk Transfer Utility Master
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<UploadOutlined />}
          onClick={openDialog}
          sx={{
            backgroundColor: '#082A89',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#061f66' }
          }}
        >
          Transfer
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          sx={{
            borderColor: '#082A89',
            color: '#082A89',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              borderColor: '#082A89'
            }
          }}
        >
          Download Excel Template
        </Button>
      </Box>
      
      {/* ===================== DIALOG ===================== */}
      {dialog.action.open && (
        <UniversalDialog
          action={{ ...dialog.action }}
          onClose={closeDialog}
          title={dialog.title}
          hasPrimaryButton={false}
        >
          <Grid container spacing={2}>
            {/* Excel input */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Select an Excel file to upload. After a successful save, the records you uploaded
                will appear in the grid below so you can review them. Then click Update to apply
                hierarchy changes to HR employees.
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CloudUploadOutlined />
                  )
                }
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                disabled={isUploading}
                sx={{ py: 1.5, borderStyle: 'dashed' }}
              >
                {isUploading
                  ? 'Uploading...'
                  : selectedFile
                    ? selectedFile.name
                    : 'Choose Excel File'}
              </Button>
            </Grid>

            {dialogMessage && (
              <Grid item xs={12}>
                <Alert severity={dialogMessage.type}>{dialogMessage.text}</Alert>
              </Grid>
            )}

            {/* Dialog grid = uploaded temp data only */}
            <Grid item xs={12}>
              {uploadedTempData.length > 0 ? (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Uploaded records ({uploadedTempData.length})
                  </Typography>
                  <CustomAgGrid
                    rowData={uploadedTempData}
                    columnDefs={columnDefs}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 15, 25, 50]}
                    height="360px"
                    getRowId={(params) =>
                      params.data?.EMPLOYEE_NO || `upload-${Math.random()}`
                    }
                  />
                </>
              ) : (
                <Box
                  sx={{
                    py: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                    border: '1px dashed #ccc',
                    borderRadius: 1
                  }}
                >
                  {isUploading
                    ? 'Saving your file…'
                    : 'No upload yet. Choose an Excel file to save and review records here.'}
                </Box>
              )}
            </Grid>

            {/* Bottom actions */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={closeDialog} disabled={isUploading}>
                Close
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleUpdate}
                disabled={isUploading || uploadedTempData.length === 0}
                startIcon={
                  isUploading ? <CircularProgress size={16} color="inherit" /> : <EditOutlined />
                }
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </UniversalDialog>
      )}
    </Box>
  );
};

export default BulkTransferUtilityMaster;