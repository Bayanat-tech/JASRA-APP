import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import { CloudUpload, Description, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { TProduct } from './types/product-wms.types';
import productServiceInstance from 'service/GM/service.product_wms';

interface ImportProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: ValidationError[];
}

const MANDATORY_FIELDS = ['PRIN_CODE', 'PROD_CODE', 'PROD_NAME', 'GROUP_CODE', 'BRAND_CODE', 'P_UOM'];

const ImportProductDialog: React.FC<ImportProductDialogProps> = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error('Excel file is empty or has no data rows');
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });

        setExcelData(rows);
        validateData(rows, headers);
        setActiveStep(1);
      } catch (error: unknown) {
        const knownError = error as Error;
        setUploadError(knownError.message || 'Failed to parse Excel file');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (data: any[], headers: string[]) => {
    const errors: ValidationError[] = [];
    const validRows: TProduct[] = [];

    const missingColumns = MANDATORY_FIELDS.filter((field) => !headers.includes(field));
    if (missingColumns.length > 0) {
      setUploadError(`Missing mandatory columns: ${missingColumns.join(', ')}`);
      return;
    }

    data.forEach((row, index) => {
      let rowHasError = false;

      MANDATORY_FIELDS.forEach((field) => {
        if (!row[field] && row[field] !== 0) {
          errors.push({
            row: index + 2,
            field,
            message: `${field} is required`
          });
          rowHasError = true;
        }
      });

      if (row.LENGTH && isNaN(parseFloat(row.LENGTH))) {
        errors.push({
          row: index + 2,
          field: 'LENGTH',
          message: 'LENGTH must be a number'
        });
        rowHasError = true;
      }

      if (!rowHasError) {
        const product: any = {
          prin_code: row.PRIN_CODE?.toString() || '',
          prod_code: row.PROD_CODE?.toString() || '',
          prod_name: row.PROD_NAME?.toString() || '',
          group_code: row.GROUP_CODE?.toString(),
          brand_code: row.BRAND_CODE?.toString(),
          packdesc: row.PACKDESC?.toString(),
          barcode: row.BARCODE?.toString(),
          p_uom: row.P_UOM?.toString(),
          uom_count: 1, // Default value for required field
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'system',
          updated_by: 'system'
        };

        validRows.push(product);
      }
    });

    setValidationResult({
      totalRows: data.length,
      validRows: validRows.length,
      errorRows: errors.length,
      errors
    });
  };

  const handleImport = async () => {
    if (!validationResult) return;

    setIsLoading(true);
    try {
      const validProducts:any = excelData
        .filter((_, index) => !validationResult.errors.some((error) => error.row === index + 2))
        .map((row) => ({
          prin_code: row.PRIN_CODE?.toString() || '',
          prod_code: row.PROD_CODE?.toString() || '',
          prod_name: row.PROD_NAME?.toString() || '',
          group_code: row.GROUP_CODE?.toString(),
          brand_code: row.BRAND_CODE?.toString(),
          packdesc: row.PACKDESC?.toString(),
          barcode: row.BARCODE?.toString(),
          p_uom: row.P_UOM?.toString(),
          uom_count: 1, // Default value for required field
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 'system',
          updated_by: 'system'
        }));

      try {
        const result = await productServiceInstance.addBulkData(validProducts);
        if (result) {
          setUploadSuccess(true);
          setActiveStep(2);
          onSuccess();
        } else {
          throw new Error('Failed to import products');
        }
      } catch (error: unknown) {
        const knownError = error as Error;
        setUploadError(knownError.message || 'Failed to import products');
      }
    } catch (error) {
      setUploadError(error && typeof error === 'object' && 'message' in error ? (error as Error).message : 'Failed to import products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExcelData([]);
    setValidationResult(null);
    setUploadError(null);
    setUploadSuccess(false);
    setActiveStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CloudUpload sx={{ mr: 1 }} />
          Import Products from Excel
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>Upload Excel File</StepLabel>
            <StepContent>
              <Box
                sx={{
                  p: 3,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: 'grey.50'
                }}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUpload />}
                  disabled={isLoading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Excel File
                  <input type="file" hidden accept=".xlsx, .xls" />
                </Button>
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                  Supported formats: .xlsx, .xls
                </Typography>
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
              </Box>
              {uploadError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {uploadError}
                </Alert>
              )}
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Validation Results</StepLabel>
            <StepContent>
              {validationResult && (
                <Box>
                  <Box display="flex" gap={2} mb={2}>
                    <Chip icon={<Description />} label={`Total: ${validationResult.totalRows}`} variant="outlined" />
                    <Chip icon={<CheckCircle />} label={`Valid: ${validationResult.validRows}`} color="success" variant="outlined" />
                    <Chip icon={<ErrorIcon />} label={`Errors: ${validationResult.errorRows}`} color="error" variant="outlined" />
                  </Box>
                  {validationResult.errors.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Validation Errors:
                      </Typography>
                      {validationResult.errors.slice(0, 10).map((error, index) => (
                        <Typography key={index} variant="body2" color="error">
                          Row {error.row}: {error.field} - {error.message}
                        </Typography>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <Typography variant="body2" color="text.secondary">
                          ... and {validationResult.errors.length - 10} more errors
                        </Typography>
                      )}
                    </Paper>
                  )}
                  <Box mt={2}>
                    <Button variant="contained" onClick={handleImport} disabled={validationResult.validRows === 0 || isLoading}>
                      {isLoading ? <CircularProgress size={24} /> : 'Import Valid Rows'}
                    </Button>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Import Complete</StepLabel>
            <StepContent>
              {uploadSuccess ? (
                <Alert severity="success">Successfully imported {validationResult?.validRows} products!</Alert>
              ) : (
                <Alert severity="error">Import failed. Please try again.</Alert>
              )}
              <Box mt={2}>
                <Button variant="outlined" onClick={handleReset}>
                  Import Another File
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportProductDialog;
