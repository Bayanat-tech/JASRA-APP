import { DeleteOutlined, MoreOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import useAuth from 'hooks/useAuth';
import { ColDef } from 'ag-grid-community';
//import { ISearch } from 'components/filters/SearchFilter';
// import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import React, { useEffect, useState, useMemo } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
// import { TUniversalDialogProps } from 'types/types.UniversalDialog';

import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddInboundPackingDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundPackingDetailsForm';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { FormattedMessage } from 'react-intl';
import packingServiceInstance from 'service/wms/transaction/inbound/service.packingDetailsWms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import UniversalDelete from 'components/popup/UniversalDelete';
import * as XLSX from 'xlsx';
import { TPackDetailEDI } from '../../../../../../src/pages/WMS/Transaction/Inbound/types/packingDetails.types';
// import { dispatch } from 'store';

/*const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};*/
const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 10000];

const PackingDetailsWmsTab = ({ job_no, prin_code, company_code }: { job_no: string; prin_code: string; company_code: string }) => {
  //--------------constants----------
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[3] });

  const { user } = useAuth();
  // const [, setToggleFilter] = useState<boolean | null>(null);
  // const [filterData] = useState<ISearch>(filter);
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<TPackingDetails[]>([]);
  const [deleteRowData, setDeleteRowData] = useState<TPackingDetails | null>(null);
  // Add packingFormPopup state
  const [packingFormPopup, setPackingFormPopup] = useState<{ open: boolean; row: TPackingDetails | null }>({
    open: false,
    row: null
  });

  // State for 3-dot menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // State for import modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  // Add state for EDI temp data and loading
  const [ediTempData, setEdiTempData] = useState<any[]>([]);
  const [ediLoading, setEdiLoading] = useState(false);
  // Add state to store original Excel data
  const [, setOriginalExcelData] = useState<any[]>([]);

  // Add CSS styles for error rows
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'packing-error-styles';
    style.textContent = `
      .ag-row.error-row {
        background-color: #ffebee !important;
      }
      .ag-row.error-row:hover {
        background-color: #ffcdd2 !important;
      }
      .ag-row.error-row .ag-cell {
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('packing-error-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Apply error styling to rows after grid renders

  // const getCellRenderer = (field: string) => (params: any) => {
  //   return params.value || '';
  // };

  const getAgGridColumns = (handleActions: any): ColDef[] => [
    {
      field: 'PROD_NAME',
      headerName: 'Product',
      minWidth: 320,
      valueGetter: (params) => params.data?.PROD_NAME || params.data?.prod_name || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'QTY_STRING',
      headerName: 'Quantity',
      minWidth: 115,
      valueGetter: (params) => params.data?.QTY_STRING || params.data?.qty_string || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'QUANTITY',
      headerName: 'Net Quantity',
      minWidth: 140,
      cellRenderer: (params: any) => {
        const value = params.data?.QUANTITY ?? params.data?.quantity ?? '';
        const lUom = params.data?.L_UOM || params.data?.l_uom || '';
        return `${value}${lUom ? ` ${lUom}` : ''}`;
      },
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'BATCH_NO',
      headerName: 'Batch No.',
      minWidth: 100,
      valueGetter: (params) => params.data?.BATCH_NO || params.data?.batch_no || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'LOT_NO',
      headerName: 'Lot No.',
      minWidth: 100,
      valueGetter: (params) => params.data?.LOT_NO || params.data?.lot_no || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'CONTAINER_NO',
      headerName: 'Container Code',
      minWidth: 145,
      valueGetter: (params) => params.data?.CONTAINER_NO || params.data?.container_no || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'PO_NO',
      headerName: 'PO Number',
      minWidth: 120,
      valueGetter: (params) => params.data?.PO_NO || params.data?.po_no || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'DOC_REF',
      headerName: 'Doc Reference No.',
      minWidth: 160,
      valueGetter: (params) => params.data?.DOC_REF || params.data?.doc_ref || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: (params: any) => {
        if (params.data && (params.data.PROD_CODE === 'Total' || params.data.prod_code === 'Total' || params.node?.rowPinned)) return null;
        const isAllocated = params.data && (params.data.ALLOCATED === "Y" || params.data.allocated === "Y");
        const actionButtons: TAvailableActionButtons[] = isAllocated ? [] : ['edit'];
        const showDelete = !isAllocated;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />
            {showDelete && (
              <IconButton
                size="small"
                color="error"
                onClick={() => handleSingleDelete(params.data)}
                sx={{
                  '&:hover': {
                    backgroundColor: '#ffebee'
                  }
                }}
              >
                <DeleteOutlined style={{ fontSize: 16 }} />
              </IconButton>
            )}
          </div>
        );
      },
      minWidth: 150,
      pinned: 'right',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }
    }
  ];
  const sql_string = `
  SELECT * 
  FROM VW_WM_INB_PACKDET_DETS 
  WHERE company_code =  '${company_code}'
    AND job_no = '${job_no}' AND
    prin_code = '${prin_code}' 
`;
  //----------- useQuery--------------
  const { data: packingData, refetch: refetchPackingData } = useQuery({
    queryKey: ['packing_details', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string
  });

  // Transform data to add error flag for styling
  const transformedRowData = useMemo(() => {
    if (!packingData || !Array.isArray(packingData)) return [];

    return packingData
      .filter((row: any) => {
        if (!row || typeof row !== 'object') return false;
        const meaningfulFields = ['PROD_CODE', 'prod_code', 'QTY_STRING', 'qty_string', 'CONTAINER_NO', 'container_no', 'PO_NO', 'po_no', 'BL_NO', 'bl_no', 'LOT_NO', 'lot_no'];
        return meaningfulFields.some((field) => {
          const value = row[field];
          return value !== null && value !== undefined && (typeof value === 'string' ? value.trim() !== '' : Boolean(value));
        });
      })
      .map((row: any) => ({
        ...row,
        _hasError: !!(row.error_msg || row.ERROR_MSG)
      }));
  }, [packingData]);

  useEffect(() => {
    const applyErrorStyling = () => {
      const gridElement = document.querySelector('.ag-root-wrapper');
      if (!gridElement) return;

      const rows = gridElement.querySelectorAll('.ag-row');
      rows.forEach((row: any) => {
        const rowIndex = row.getAttribute('row-index');
        if (rowIndex !== null) {
          const rowData = transformedRowData[parseInt(rowIndex)];
          if (rowData && rowData.error_msg) {
            row.classList.add('error-row');
          } else {
            row.classList.remove('error-row');
          }
        }
      });
    };

    // Apply styling after a short delay to ensure grid is rendered
    const timeoutId = setTimeout(applyErrorStyling, 100);

    // Also apply on scroll/pagination changes
    const gridElement = document.querySelector('.ag-root-wrapper');
    if (gridElement) {
      const observer = new MutationObserver(applyErrorStyling);
      observer.observe(gridElement, { childList: true, subtree: true });

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }

    return () => clearTimeout(timeoutId);
  }, [transformedRowData]);

  //-------------handlers---------------
  const handleCloseDelete = () => {
    setDeletePopup(false);
    setDeleteRowData(null);
  };

  // Handler for single row delete
  const handleSingleDelete = (row: TPackingDetails) => {
    setDeleteRowData(row);
    setDeletePopup(true);
  };

  const handleDelete = async () => {
    let deleteData;

    if (deleteRowData) {
      // Single row delete
      deleteData = [
        {
          prin_code: deleteRowData.prin_code as string,
          job_no: deleteRowData.job_no as string,
          packdet_no: deleteRowData.packdet_no as number
        }
      ];
    } else {
      // Multiple rows delete (existing functionality)
      deleteData = selectedRows.map((item) => ({
        prin_code: item.prin_code as string,
        job_no: item.job_no as string,
        packdet_no: item.packdet_no as number
      }));
    }

    await packingServiceInstance.deletePackingDetails(deleteData);
    setSelectedRows([]);
    setDeleteRowData(null);
    setDeletePopup(false);
    refetchPackingData();
  };

  // const togglePackingPopup = (refetchData?: boolean) => {
  //   if (packingFormPopup.open === true && refetchData) {
  //     refetchPackingData();
  //   }
  //   setPackingFormPopup((prev) => ({
  //     open: !prev.open,
  //     row: null
  //   }));
  // };

  const handleActions = (actionType: string, rowOriginal: TPackingDetails) => {
    if (actionType === 'edit') {
      setPackingFormPopup({ open: true, row: rowOriginal });
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Example menu actions
  const handleMenuAction = (action: string) => {
    if (action === 'import') {
      setImportModalOpen(true);
    }
    // Implement export/print as needed
    handleMenuClose();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleImportFileClick = () => {
    document.getElementById('packing-import-file-input')?.click();
  };

  function parseDate(value: string): Date | undefined {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  function parseNumber(value: any): number | undefined {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  // Add this helper function to safely trim string values
  const safeTrim = (value: any): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') return value.trim();
    return String(value).trim(); // Convert non-string values to string
  };

  // Helper function to format dates for Oracle DB (YYYY-MM-DD format)
  // const formatDateForOracle = (date: Date | undefined): string | undefined => {
  //   if (!date || !(date instanceof Date) || isNaN(date.getTime())) return undefined;
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // };

  const transformPackDetailEDI = (rawData: any[]): TPackDetailEDI[] => {
    console.log('Raw data before transformation:', rawData);

    const transformedData = rawData.map((row: any, index: number) => {
      // Create transformed object with safe trim for all string fields
      const transformed = {
        user_id: user?.loginid ?? '',
        company_code: user?.company_code ?? '',
        prin_code: safeTrim(row['prin_code']) || prin_code,
        job_no: safeTrim(row['job_no']) || job_no,
        packdet_no: index + 1,

        container_no: safeTrim(row['Container no']),
        vessel_name: safeTrim(row['Vessel name']),
        voyage_no: safeTrim(row['Voyage no']),

        product_code: safeTrim(row['Product code']) || '',
        puom: safeTrim(row['P_UOM']),
        qty_puom: parseNumber(row['QTY_PUOM']),
        luom: safeTrim(row['L_UOM']),
        qty_luom: parseNumber(row['QTY_LUOM']),
        unit_price: parseNumber(row['Rate']),
        curr_code: safeTrim(row['currency']),

        lot_no: safeTrim(row['lot no']),
        mfg_date: parseDate(row['mfg date']),
        exp_date: parseDate(row['exp date']),

        manu_code: safeTrim(row['manu']),
        origin_country: safeTrim(row['origin country']),
        from_site: row['site code'] !== undefined ? String(row['site code']) : undefined,
        to_site: undefined,
        location_from: safeTrim(row['location code']),
        location_to: undefined,

        batch_no: safeTrim(row['BATCH_NO']),
        po_no: safeTrim(row['Po No']),

        created_at: undefined,
        created_by: 'SYSTEM',
        updated_at: undefined,
        updated_by: 'SYSTEM'
      };

      // Log any row with missing required fields
      if (!transformed.product_code) {
        console.warn('Row missing product_code:', row);
      }

      return transformed;
    });

    console.log('Transformed data:', transformedData);
    return transformedData;
  };

  // Helper to map UPPER_SNAKE_CASE keys to camelCase/small letter keys for API payload
  // function toApiPayloadLower(row: any): any {
  //   return {
  //     company_code: row.company_code ?? row.COMPANY_CODE ?? '',
  //     prin_code: row.prin_code ?? row.PRIN_CODE ?? '',
  //     job_no: row.job_no ?? row.JOB_NO ?? '',
  //     packdet_no: row.packdet_no ?? row.PACKDET_NO ?? '',
  //     container_no: row.container_no ?? row.CONTAINER_NO ?? '',
  //     vessel_name: row.vessel_name ?? row.VESSEL_NAME ?? '',
  //     voyage_no: row.voyage_no ?? row.VOYAGE_NO ?? '',
  //     product_code: row.prod_code ?? row.PROD_CODE ?? '',
  //     p_uom: row.p_uom ?? row.P_UOM ?? row.puom ?? null,
  //     qty_puom: row.qty_puom ?? row.QTY_PUOM ?? '',
  //     l_uom: row.l_uom ?? row.L_UOM ?? row.luom ?? null,
  //     qty_luom: row.qty_luom ?? row.QTY_LUOM ?? '',
  //     unit_price: row.unit_price ?? row.UNIT_PRICE ?? '',
  //     curr_code: row.curr_code ?? row.CURR_CODE ?? '',
  //     lot_no: row.lot_no ?? row.LOT_NO ?? null,
  //     mfg_date: row.mfg_date ?? row.MFG_DATE ?? null,
  //     exp_date: row.exp_date ?? row.EXP_DATE ?? null,
  //     manu_code: row.manu_code ?? row.MANU_CODE ?? null,
  //     origin_country: row.origin_country ?? row.ORIGIN_COUNTRY ?? null,
  //     from_site: row.from_site ?? row.FROM_SITE ?? null,
  //     to_site: row.to_site ?? row.TO_SITE ?? null,
  //     location_from: row.location_from ?? row.LOCATION_FROM ?? null,
  //     location_to: row.location_to ?? row.LOCATION_TO ?? null,
  //     batch_no: row.batch_no ?? row.BATCH_NO ?? null,
  //     po_no: row.po_no ?? row.PO_NO ?? '',
  //     created_at: row.created_at ?? row.CREATED_AT ?? '',
  //     created_by: row.created_by ?? row.CREATED_BY ?? '',
  //     updated_at: row.updated_at ?? row.UPDATED_AT ?? '',
  //     updated_by: row.updated_by ?? row.UPDATED_BY ?? '',
  //     user_id: row.user_id ?? row.USER_ID ?? '',
  //     error_msg: row.error_msg ?? row.ERROR_MSG ?? null,
  //   };
  // }

  // Import handler: uploads parsed data to backend and refreshes table
  const handleImportData = async (values: unknown[]): Promise<boolean> => {
    try {
      console.log('Import data values:', values);

      if (!Array.isArray(values) || values.length === 0) {
        console.error('No data to upload.');
        return false;
      }

      // Transform raw Excel data into typed TPackDetailEDI[]
      const ediData = transformPackDetailEDI(values as any[]);

      if (ediData.length === 0) {
        console.error('No valid rows found after transformation');
        alert('No valid data rows found in the file. Please check the file format.');
        return false;
      }

      // Call backend bulk upload API with explicit error catching
      try {
        console.log('Calling upsertPackDetailEDIHandler with data:', ediData);
        const response = await packingServiceInstance.upsertPackDetailEDIHandler(ediData);
        console.log('upsertPackDetailEDIHandler response:', response);

        if (response) {
          return true;
        } else {
          console.error('API returned falsy value:', response);
          return false;
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        alert(`API call failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error('Error while importing data:', error);
      alert(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleImportSubmit = async () => {
    if (importFile) {
      try {
        setEdiLoading(true);
        // Parse Excel/CSV file
        const data = await importFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        console.log('Parsed Excel data:', jsonData);

        // Immediately display the extracted Excel data in the grid
        const enrichedData = jsonData.map((row: any) => ({
          ...row,
          job_no,
          prin_code
        }));

        // Store the original Excel data
        setOriginalExcelData(enrichedData);

        // Show the Excel data in the grid immediately before any validation
        setEdiTempData(enrichedData);

        // Then send to backend for validation (optional)
        try {
          console.log('Sending data for validation:', enrichedData);
          const success = await handleImportData(enrichedData);

          // If validation successful, fetch the validated data with error messages
          if (success) {
            const company_code = user?.company_code ?? '';
            const user_id = user?.loginid ?? '';

            const validatedData = await packingServiceInstance.getEDIPackdetHandler(job_no, prin_code, company_code, user_id);
            console.log('Received EDI temp data with validations:', validatedData);

            if (Array.isArray(validatedData)) {
              // Merge original Excel data with validation results
              const mergedData = mergeOriginalAndValidatedData(enrichedData, validatedData);
              console.log('Merged data:', mergedData);

              // Update the grid with merged data that includes error messages
              setEdiTempData(mergedData);
            }
          }
        } catch (validationError) {
          console.error('Validation failed, but still showing Excel data:', validationError);
          // We continue showing the imported data even if validation fails
        }
      } catch (error) {
        console.error('Failed to parse file:', error);
        alert('Failed to process the file. Please check the console for details.');
      } finally {
        setEdiLoading(false);
      }
    }
  };

  // Modify mergeOriginalAndValidatedData to normalize error fields
  const mergeOriginalAndValidatedData = (originalData: any[], validatedData: any[]): any[] => {
    // If we don't have validation data, return original data
    if (!validatedData || validatedData.length === 0) return originalData;

    // Create a map of validated data using a key that can uniquely identify each record
    const validatedMap = new Map();
    validatedData.forEach((vRow) => {
      // Create a key using fields that would uniquely identify a record
      // Adjust these fields based on what makes a record unique in your context
      const key = getUniqueKey(vRow);
      validatedMap.set(key, vRow);
    });

    // Merge original data with validation data
    return originalData.map((originalRow) => {
      const key = getUniqueKey(originalRow);
      const validatedRow = validatedMap.get(key);

      if (validatedRow) {
        // Normalize error message to use a single field name
        const errorMsg = validatedRow.error_msg || validatedRow.ERROR_MSG || null;

        // Merge the two rows, giving priority to original fields if both exist
        return {
          ...originalRow, // Original Excel data first
          ...validatedRow, // Then overlay validation data
          // Preserve important original fields that might be renamed in validation
          'Product code': originalRow['Product code'] || validatedRow['Product code'] || originalRow.prod_code || validatedRow.prod_code,
          // Use normalized error message and remove the duplicate
          error_msg: errorMsg,
          ERROR_MSG: undefined // Set to undefined to remove the duplicate field
        };
      }

      // If no matching validated row, return original row
      return originalRow;
    });
  };

  // Helper to generate a unique key for a record based on its contents
  const getUniqueKey = (row: any): string => {
    // Create a unique key from the combination of fields that identify a record
    // Adjust these fields as needed for your data structure
    const prodCode = row['Product code'] || row.prod_code || row.PROD_CODE || '';
    const containerNo = row['Container no'] || row.container_no || row.CONTAINER_NO || '';
    const lotNo = row['lot no'] || row.lot_no || row.LOT_NO || '';
    const poNo = row['Po No'] || row.po_no || row.PO_NO || '';

    // Return a concatenated string that should uniquely identify a record
    return `${prodCode}|${containerNo}|${lotNo}|${poNo}`;
  };

  // Modify handleEdiSave to use the original data if available
  const handleEdiSave = async () => {
    if (!user?.loginid || !job_no || !prin_code) {
      alert('Missing required parameters for saving data');
      return;
    }

    if (!ediTempData || ediTempData.length === 0) {
      alert('No data to save');
      return;
    }

    setEdiLoading(true);
    try {
      // First attempt to save the data directly if it hasn't been validated
      if (ediTempData[0] && !('error_msg' in ediTempData[0]) && !('ERROR_MSG' in ediTempData[0])) {
        // This is raw Excel data that hasn't been validated yet
        console.log('Saving raw Excel data first');
        const transformedData = transformPackDetailEDI(ediTempData);
        await packingServiceInstance.upsertPackDetailEDIHandler(transformedData);
      }

      // Then call the standard save function which works with validated data
      console.log('Calling copyEDIToPackdetHandler');
      const response = await packingServiceInstance.copyEDIToPackdetHandler(user.loginid, job_no, prin_code, company_code);
      console.log('copyEDIToPackdetHandler response:', response);

      setImportModalOpen(false);
      setImportFile(null);
      setEdiTempData([]);
      setOriginalExcelData([]); // Clear original data too
      refetchPackingData();
    } catch (err) {
      console.error('Failed to save data', err);
      alert(`Failed to save data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setEdiLoading(false);
    }
  };

  // Add new function to handle direct column mapping for raw Excel data
  const getEdiPreviewColumns = (): ColDef[] => {
    if (!Array.isArray(ediTempData) || ediTempData.length === 0) {
      console.warn('No EDI data available for column generation');
      return [];
    }

    // Get all possible keys from all rows to ensure we catch all columns
    const allKeys = new Set<string>();
    ediTempData.forEach((row) => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach((key) => allKeys.add(key));
      }
    });

    // Key fields to show first
    const priorityFields = [
      'error_msg', // Only include the lowercase version for error message
      'Product code',
      'PRODUCT_CODE',
      'product_code',
      'PROD_CODE',
      'prod_code',
      'P_UOM',
      'p_uom',
      'PUOM',
      'puom',
      'L_UOM',
      'l_uom',
      'LUOM',
      'luom',
      'QTY_PUOM',
      'qty_puom',
      'QTY_LUOM',
      'qty_luom',
      'Container no',
      'CONTAINER_NO',
      'container_no',
      'lot no',
      'LOT_NO',
      'lot_no',
      'Po No',
      'PO_NO',
      'po_no'
    ];

    // Create a map to detect and handle case-insensitive duplicates
    const normalizedFields = new Map<string, string>();
    Array.from(allKeys).forEach((key) => {
      const lowerKey = key.toLowerCase();
      // If we already have this key in a different case, skip it
      // Prioritize error_msg (lowercase) over ERROR_MSG
      if (lowerKey === 'error_msg') {
        normalizedFields.set(lowerKey, 'error_msg');
      } else if (lowerKey === 'error_msg' && normalizedFields.has(lowerKey)) {
        // Skip, we already have the lowercase version
      } else if (normalizedFields.has(lowerKey)) {
        // Skip this duplicate unless it's a priority field that supersedes the existing one
        const existingKey = normalizedFields.get(lowerKey)!;
        const existingPriority = priorityFields.indexOf(existingKey);
        const newPriority = priorityFields.indexOf(key);
        if (newPriority !== -1 && (existingPriority === -1 || newPriority < existingPriority)) {
          normalizedFields.set(lowerKey, key);
        }
      } else {
        normalizedFields.set(lowerKey, key);
      }
    });

    // Get the deduplicated list of fields using the normalized map
    const uniqueKeys = Array.from(normalizedFields.values());

    // Sort keys - priority fields first, then alphabetically
    const sortedKeys = uniqueKeys.sort((a, b) => {
      const aIndex = priorityFields.indexOf(a);
      const bIndex = priorityFields.indexOf(b);

      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.localeCompare(b);
    });

    // Filter out some internal fields that users don't need to see
    const filteredKeys = sortedKeys.filter(
      (key) =>
        ![
          'USER_ID',
          'CREATED_AT',
          'CREATED_BY',
          'UPDATED_AT',
          'UPDATED_BY',
          'user_id',
          'created_at',
          'created_by',
          'updated_at',
          'updated_by',
          'ERROR_MSG'
        ].includes(key)
    );

    return filteredKeys.map((key) => {
      // Format header name to be more readable
      const headerName = key
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return {
        field: key,
        headerName: headerName,
        minWidth: key.toLowerCase().includes('error') ? 300 : 120,
        width: key.toLowerCase().includes('error') ? 300 : undefined,
        flex: key.toLowerCase().includes('error') ? 2 : 1,
        resizable: true,
        sortable: true,
        filter: true,
        cellRenderer: (params: any) => {
          const isErrorField = key.toLowerCase().includes('error');
          const hasError = isErrorField && params.value;

          const cellStyle =
            isErrorField && hasError
              ? {
                  color: '#d32f2f',
                  fontWeight: 500,
                  padding: '4px',
                  whiteSpace: 'normal',
                  lineHeight: 1.3,
                  fontSize: '12px'
                }
              : { padding: '4px', fontSize: '12px' };

          return <div style={cellStyle}>{params.value !== null && params.value !== undefined ? String(params.value) : ''}</div>;
        },
        cellStyle: (params: any) => {
          // If this row has an error message (in any column), highlight the entire row
          const rowData = params.data;
          const hasError =
            rowData &&
            (rowData.error_msg || // Check normalized error field
              Object.keys(rowData).some(
                (k) => k.toLowerCase().includes('error') && rowData[k] && k !== 'ERROR_MSG' // Skip uppercase duplicate
              ));

          if (hasError) {
            return {
              backgroundColor: key.toLowerCase().includes('error') ? '#ffebee' : '#fff1f0',
              whiteSpace: key.toLowerCase().includes('error') ? 'normal' : 'nowrap',
              overflow: 'visible'
            };
          }
          return null;
        }
      };
    });
  };

  // Update getErrorCount to use the normalized error field
  const getErrorCount = () => {
    if (!Array.isArray(ediTempData)) return 0;
    return ediTempData.filter((row) => {
      // Check only error_msg (lowercase) to avoid counting duplicates
      return (
        row.error_msg ||
        // Also check any other error fields except ERROR_MSG (which is the duplicate)
        Object.keys(row).some((key) => key.toLowerCase().includes('error') && key !== 'ERROR_MSG' && row[key])
      );
    }).length;
  };

  // Update getErrorSummary to use the normalized error field
  const getErrorSummary = () => {
    if (!Array.isArray(ediTempData)) return [];

    // Extract all error messages
    const allErrors: string[] = [];
    ediTempData.forEach((row) => {
      const errorMsg = row.error_msg; // Only use the normalized field
      if (errorMsg) {
        // Split by periods and semicolons to get individual error messages
        const parts: string[] = errorMsg.split(/[.;]/).filter((part: string) => part.trim().length > 0);
        allErrors.push(...parts);
      }
    });

    // Count occurrences of each error type
    const errorCounts: Record<string, number> = {};
    allErrors.forEach((error) => {
      const trimmed = error.trim();
      errorCounts[trimmed] = (errorCounts[trimmed] || 0) + 1;
    });

    // Convert to array and sort by frequency
    return Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 most common errors
      .map(([message, count]) => ({ message, count }));
  };

  // Helper to provide error fix suggestions based on error message
  const getErrorFixSuggestion = (errorMessage: string): React.ReactNode => {
    if (errorMessage.includes('Invalid PROD_CODE')) {
      return (
        <span>
          The product code doesn't exist in the system. Check the product master list or use the <strong>Product Search</strong> feature to
          find valid codes. Format example: <code>BM0001</code>
        </span>
      );
    }
    if (errorMessage.includes('Invalid P_UOM')) {
      return (
        <span>
          The primary UOM must be a valid unit of measure code from the system. Common values: <code>PC</code> (Piece), <code>BOX</code>,{' '}
          <code>KG</code>, <code>CTN</code> (Carton)
        </span>
      );
    }
    if (errorMessage.includes('Invalid L_UOM')) {
      return (
        <span>
          The loose UOM must be a valid unit of measure code from the system. Common values: <code>PC</code> (Piece), <code>BOX</code>,{' '}
          <code>KG</code>, <code>CTN</code> (Carton)
        </span>
      );
    }
    if (errorMessage.includes('Invalid MANU_CODE')) {
      return (
        <span>
          The manufacturer code doesn't exist in the system. Check the manufacturer master list or consult with your system administrator.
          Format example: <code>MANU001</code>
        </span>
      );
    }
    return <span>Verify the data format and ensure it matches system requirements</span>;
  };

  // Sample template data for download
  const getSampleTemplateData = () => {
    return [
      {
        'Product code': 'BM0001', // Must exist in system
        P_UOM: 'PC', // Valid UOM code (PC, BOX, KG, etc.)
        QTY_PUOM: '10',
        L_UOM: 'PC', // Valid UOM code (PC, BOX, KG, etc.)
        QTY_LUOM: '1',
        'Container no': 'CONT001',
        'Vessel name': 'VESSEL1',
        'Voyage no': 'VOY001',
        'Po No': 'PO001',
        'lot no': 'LOT001',
        'mfg date': '2023-01-01',
        'exp date': '2024-01-01',
        manu: 'MANU001', // Must exist in system
        'origin country': 'OMN',
        'site code': '1',
        'location code': 'A-01-01',
        currency: 'OMR',
        Rate: '0'
      }
    ];
  };

  // Generate and download template
  const handleDownloadTemplate = () => {
    try {
      const templateData = getSampleTemplateData();
      const worksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Product code
        { wch: 10 }, // P_UOM
        { wch: 10 }, // QTY_PUOM
        { wch: 10 }, // L_UOM
        { wch: 10 }, // QTY_LUOM
        { wch: 15 }, // Container no
        { wch: 15 }, // Vessel name
        { wch: 15 }, // Voyage no
        { wch: 15 }, // Po No
        { wch: 15 }, // lot no
        { wch: 15 }, // mfg date
        { wch: 15 }, // exp date
        { wch: 15 }, // manu
        { wch: 15 }, // origin country
        { wch: 10 }, // site code
        { wch: 15 }, // location code
        { wch: 10 }, // currency
        { wch: 10 } // Rate
      ];

      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'PackingTemplate');

      // Save the file
      XLSX.writeFile(workbook, 'PackingDetails_Template.xlsx');
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Failed to generate template. Please try again.');
    }
  };

  function handleImportModalClose(): void {
    setImportModalOpen(false);
    setImportFile(null);
    setEdiTempData([]);
    setEdiLoading(false);
  }

  function handleAgGridSelectionChanged(params: any): void {
    const selectedRows = params.api.getSelectedRows();
    setSelectedRows(selectedRows);
  }

  function getValidRecordsCount(): number {
    if (!Array.isArray(ediTempData)) return 0;
    return ediTempData.filter((row) => !row.error_msg).length;
  }

  // --- Add helpers for UOM total calculation (copy/adapt from ReceivingDetailsWmsTab) ---

  // Helper to parse qty string like "120 Ctn 50 Pcs" into { Ctn: 120, Pcs: 50 }
  function parseQtyString(qtyString: string | undefined): Record<string, number> {
    if (!qtyString) return {};
    const regex = /([\d.]+)\s*([^\d\s]+)/g;
    const result: Record<string, number> = {};
    let match;
    while ((match = regex.exec(qtyString)) !== null) {
      const qty = parseFloat(match[1]);
      const uom = match[2];
      if (!isNaN(qty) && uom) {
        result[uom] = (result[uom] || 0) + qty;
      }
    }
    return result;
  }

  // Helper to sum qty objects
  function sumQtyObjects(arr: Array<Record<string, number>>): Record<string, number> {
    return arr.reduce((acc, obj) => {
      for (const [uom, qty] of Object.entries(obj)) {
        acc[uom] = (acc[uom] || 0) + qty;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  // Helper to stringify qty object, preserving order of first appearance, with comma after each UOM
  function qtyObjToString(qtyObj: Record<string, number>, uomOrder: string[]): string {
    return uomOrder
      .filter(uom => qtyObj[uom] && qtyObj[uom] !== 0)
      .map(uom => `${qtyObj[uom]} ${uom}`)
      .join(', ');
  }

  // Helper to get all UOMs and sort them by total quantity (largest first)
  function getSortedUomOrder(rowData: TPackingDetails[], field: keyof TPackingDetails): string[] {
    const uomTotals: Record<string, number> = {};
    rowData.forEach(row => {
      const qtyObj = parseQtyString(row[field] as string | undefined);
      Object.entries(qtyObj).forEach(([uom, qty]) => {
        uomTotals[uom] = (uomTotals[uom] || 0) + qty;
      });
    });
    // Sort by total descending, then alphabetically for tie-breaker
    return Object.keys(uomTotals).sort((a, b) => {
      if (uomTotals[b] !== uomTotals[a]) return uomTotals[b] - uomTotals[a];
      return a.localeCompare(b);
    });
  }

  // --- Replace old total calculation with new UOM-based logic ---

  // Calculate totals for Quantity and Net Quantity (by UOM)
  const qtyObjs = transformedRowData.map(row => parseQtyString(row.QTY_STRING || row.qty_string));
  const totalQtyObj = sumQtyObjects(qtyObjs);
  const qtyUomOrder = getSortedUomOrder(transformedRowData.map(r => ({ 
    ...r, 
    qty_string: r.QTY_STRING || r.qty_string 
  })), 'qty_string');
  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);

  // Create pinned bottom row for ag-Grid
  const pinnedBottomRowData = [
    {
      PROD_NAME: 'Total:',
      prod_name: 'Total:',
      QTY_STRING: totalDisplay,
      qty_string: totalDisplay,
      BATCH_NO: '',
      batch_no: '',
      LOT_NO: '',
      lot_no: '',
      CONTAINER_NO: '',
      container_no: '',
      PO_NO: '',
      po_no: '',
      DOC_REF: '',
      doc_ref: '',
      QUANTITY: totalDisplay,
      quantity: totalDisplay,
      actions: null
    }
  ];

  return (
    <div className="flex flex-col space-y-2">
      {/* {customFilter} */}
      {/* Add a wrapper with relative positioning for the grid and absolute for the 3-dots */}
      <div style={{ position: 'relative' }}>
        {/* 3-dots menu absolutely positioned at top-right of grid header */}
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 8,
            zIndex: 2
            // Adjust top/right as needed to align with grid header
          }}
        >
          <IconButton
            aria-label="more"
            aria-controls={openMenu ? 'packing-more-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleMenuClick}
            size="small"
            sx={{
              background: '#fff',
              boxShadow: 1,
              border: '1px solid #e0e0e0',
              '&:hover': { background: '#f5f5f5' }
            }}
          >
            <MoreOutlined />
          </IconButton>
          <Menu
            id="packing-more-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleMenuAction('import')}>
              <FormattedMessage id="Import" />
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('export')}>
              <FormattedMessage id="Export" />
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('print')}>
              <FormattedMessage id="Print" />
            </MenuItem>
          </Menu>
        </div>
        <CustomAgGrid
          rowHeight={20}
          headerHeight={30}
          rowData={transformedRowData}
          columnDefs={getAgGridColumns(handleActions)}
          onSelectionChanged={handleAgGridSelectionChanged}
          paginationPageSize={paginationData.rowsPerPage}
          paginationPageSizeSelector={rowsPerPageOptions}
          height="480px"
          editable={false}
          rowSelection="multiple"
          getRowId={(params: any) => {
            const data = params.data;
            if (!data) return `empty-${Math.random()}`;
            const packdetNo = data.PACKDET_NO || data.packdet_no;
            const jobNo = data.JOB_NO || data.job_no;
            const prodCode = data.PROD_CODE || data.prod_code;
            return packdetNo ? `${jobNo}-${packdetNo}` : `${prodCode || 'unknown'}-${Math.random()}`;
          }}
          pinnedBottomRowData={pinnedBottomRowData}
        />
      </div>
      {openDeletePopup === true && (
        <UniversalDelete
          open={openDeletePopup}
          handleClose={handleCloseDelete}
          title={deleteRowData ? 1 : selectedRows.length}
          handleDelete={handleDelete}
        />
      )}
      <Dialog
        open={importModalOpen}
        onClose={handleImportModalClose}
        maxWidth={ediTempData.length > 0 ? 'xl' : 'xs'}
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <Box
          sx={{
            background: '#082a88',
            color: '#fff',
            px: 3,
            py: 2,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              fontWeight: 600,
              fontSize: 18,
              color: '#fff',
              background: 'transparent'
            }}
          >
            <FormattedMessage id="Import Packing Details" />
          </DialogTitle>
        </Box>
        <DialogContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: ediTempData.length ? 400 : 260,
            background: '#f8fafc'
          }}
        >
          {!ediTempData.length ? (
            <Box
              sx={{
                border: '1.5px dashed #173A5E',
                borderRadius: 2,
                p: 4,
                width: '100%',
                maxWidth: 340,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#fff',
                boxShadow: 1
              }}
            >
              <input
                id="packing-import-file-input"
                type="file"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                onChange={handleImportFileChange}
              />
              <IconButton
                onClick={handleImportFileClick}
                sx={{
                  background: '#082a88',
                  color: '#fff',
                  mb: 2,
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  boxShadow: 2,
                  '&:hover': { background: '#205081' }
                }}
                size="large"
              >
                <UploadOutlined style={{ fontSize: 32 }} />
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                <FormattedMessage id={importFile ? 'Change File' : 'Choose File'} />
              </Typography>
              {importFile && (
                <Typography variant="body2" sx={{ color: '#173A5E', mb: 1, wordBreak: 'break-all' }}>
                  <UploadOutlined style={{ marginRight: 6 }} />
                  {importFile.name}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
                <FormattedMessage id="Supported formats: .csv, .xlsx" />
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', background: '#fff', borderRadius: 2, p: 2, boxShadow: 1, maxHeight: 500, overflow: 'auto' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 2, color: '#173A5E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>
                  <FormattedMessage id="Preview Imported Data" />
                  <Typography component="span" variant="caption" sx={{ ml: 1, color: '#666' }}>
                    ({ediTempData.length} records)
                  </Typography>
                </span>
                {getErrorCount() > 0 && (
                  <Typography
                    component="span"
                    sx={{ color: '#d32f2f', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center' }}
                  >
                    <span style={{ marginRight: '4px' }}>⚠️</span>
                    {getErrorCount()} records with errors • {getValidRecordsCount()} valid records
                  </Typography>
                )}
              </Typography>
              <Box sx={{ height: 280, width: '100%' }}>
                {ediTempData.length > 0 ? (
                  <CustomAgGrid
                    rowData={ediTempData}
                    columnDefs={getEdiPreviewColumns()}
                    paginationPageSize={50}
                    paginationPageSizeSelector={[10, 25, 50]}
                    height="100%"
                    editable={false}
                    getRowId={(params: any) =>
                      `edi-${params.data?.PROD_CODE || params.data?.prod_code || params.data?.product_code || ''}-${Math.random()}`
                    }
                    rowHeight={40} // Increased for better readability
                    getRowStyle={(params) => {
                      // Check for error in upper or lowercase field names
                      if (params.data && (params.data.ERROR_MSG || params.data.error_msg)) {
                        return {
                          background: '#fff1f0',
                          cursor: 'pointer',
                          borderBottom: '1px solid #ffcdd2'
                        };
                      }
                      return null;
                    }}
                    suppressRowTransform={true}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="textSecondary">
                      <FormattedMessage id="No data to preview" />
                    </Typography>
                  </Box>
                )}
              </Box>
              {getErrorCount() > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #ffcdd2' }}>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '8px' }}>⚠️</span>
                    <FormattedMessage id="Validation Errors Found" />
                  </Typography>

                  {/* Error summary section with fixes */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#d32f2f', display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '6px', fontSize: '16px' }}>🔍</span>
                      <FormattedMessage id="What's wrong and how to fix it:" />
                    </Typography>

                    <Box
                      sx={{
                        mb: 2,
                        pl: 2,
                        pr: 1.5,
                        py: 1.5,
                        backgroundColor: '#fff',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        maxHeight: '140px',
                        overflowY: 'auto'
                      }}
                    >
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {getErrorSummary().map((error, idx) => (
                          <li key={idx} style={{ fontSize: '13px', marginBottom: '10px' }}>
                            <div style={{ fontWeight: 600, color: '#d32f2f', marginBottom: '3px' }}>
                              {error.message} ({error.count} {error.count === 1 ? 'occurrence' : 'occurrences'})
                            </div>
                            <div style={{ color: '#333' }}>{getErrorFixSuggestion(error.message)}</div>
                          </li>
                        ))}
                      </ul>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        backgroundColor: '#e8f4fd',
                        borderRadius: 1,
                        borderLeft: '4px solid #1976d2'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 0.5 }}>
                        <FormattedMessage id="How to resolve:" />
                      </Typography>

                      <Typography variant="body2" sx={{ fontSize: '13px', mb: 1 }}>
                        <FormattedMessage id="We recommend following these steps:" />
                      </Typography>

                      <ol style={{ margin: '4px 0', paddingLeft: '24px', fontSize: '13px', lineHeight: 1.5 }}>
                        <li style={{ marginBottom: '8px' }}>
                          <strong>
                            <FormattedMessage id="Download our template:" />
                          </strong>{' '}
                          Use the template button below to get a properly formatted file with sample data
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          <strong>
                            <FormattedMessage id="Fill with valid data:" />
                          </strong>{' '}
                          Replace sample data with your actual data, ensuring all codes exist in the system
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                          <strong>
                            <FormattedMessage id="Re-upload the file:" />
                          </strong>{' '}
                          Click "Cancel" and start over with your corrected file
                        </li>
                        <li>
                          <strong>
                            <FormattedMessage id="Or continue with valid records only:" />
                          </strong>{' '}
                          If you prefer, click "Save {getValidRecordsCount()} Valid Records" to import only the valid entries
                        </li>
                      </ol>
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666', fontStyle: 'italic' }}>
                    <FormattedMessage id="Note: Red highlighted rows in the preview contain validation errors and will be skipped during import." />
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, background: '#f8fafc', justifyContent: 'space-between' }}>
          <div>
            {ediTempData.length > 0 && getErrorCount() > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadOutlined style={{ transform: 'rotate(180deg)' }} />}
                sx={{ mr: 1, color: '#0277bd', borderColor: '#0277bd' }}
                onClick={handleDownloadTemplate}
              >
                <FormattedMessage id="Download Template" />
              </Button>
            )}
          </div>
          <div>
            <Button onClick={handleImportModalClose} variant="outlined" sx={{ minWidth: 100, mr: 1 }} disabled={ediLoading}>
              <FormattedMessage id="Cancel" />
            </Button>
            {!ediTempData.length ? (
              <Button
                onClick={handleImportSubmit}
                disabled={!importFile || ediLoading}
                variant="contained"
                sx={{
                  minWidth: 100,
                  background: '#173A5E',
                  color: '#fff',
                  '&:hover': { background: '#205081' }
                }}
              >
                <FormattedMessage id="Upload" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  console.log('Save button clicked');
                  handleEdiSave();
                }}
                disabled={ediLoading || !ediTempData.length}
                variant="contained"
                color="primary"
                sx={{
                  minWidth: 100,
                  background: '#173A5E',
                  color: '#fff',
                  '&:hover': { background: '#205081' }
                }}
              >
                <FormattedMessage id="Save All Records" />
              </Button>
            )}
          </div>
        </DialogActions>
      </Dialog>
      {packingFormPopup.open && (
        <AddInboundPackingDetailsForm
          job_no={packingFormPopup.row?.job_no || job_no}
          packdet_no={packingFormPopup.row?.packdet_no !== undefined ? String(packingFormPopup.row.packdet_no) : ''}
          prin_code={packingFormPopup.row?.prin_code || prin_code}
          isEditMode={true}
          onClose={(refetchData?: boolean) => {
            setPackingFormPopup({ open: false, row: null });
            if (refetchData) refetchPackingData();
          }}
        />
      )}
    </div>
  );
};

export default PackingDetailsWmsTab;