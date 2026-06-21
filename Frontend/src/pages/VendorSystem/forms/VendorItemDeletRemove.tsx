import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Button, IconButton, Tooltip, Badge } from '@mui/material';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { IoIosAttach } from 'react-icons/io';
import EnhancedVendorFilesDialog from '../components/EnhancedVendorFilesDialog';
import FileUploadServiceInstance from 'service/services.files';
import UniversalDialog from 'components/popup/UniversalDialog';
import PendingItemsForm from './PendingItemsForm';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

interface VendorItemDetailsProps {
  vendorDetails: any[];
  onRowsChange?: (rows: any[]) => void;
  disabled?: boolean;
  hideReset?: boolean;
  setUpdatedRows?: React.Dispatch<React.SetStateAction<any[]>>;
  updatedRows?: any[];
  requestNumber?: string;
  docNo?: string | number;
  refDocNo?: string | number | null;
  mainActiveTab?: number;
}

const VendorItemDeletRemove: React.FC<VendorItemDetailsProps> = ({
  vendorDetails = [],
  onRowsChange,
  disabled = false,
  hideReset = false,
  setUpdatedRows,
  updatedRows,
  requestNumber = '',
  docNo,
  mainActiveTab,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  console.log('VendorItemDeletRemove Props:', mainActiveTab)
  const [attachmentDialog, setAttachmentDialog] = useState<{
    open: boolean;
    serialNo: number;
    requestNumber: string;
  }>({ open: false, serialNo: 0, requestNumber: '' });

  console.log('Component Props:', {
    requestNumber,
    vendorDetailsCount: vendorDetails.length,
    updatedRowsCount: updatedRows?.length,
    requestNumberExists: !!requestNumber
  });

  const [pendingItemsPopup, setPendingItemsPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'md' },
    title: 'Pending Items'
  });

  const initializeRows = useCallback((data: any[]) => {
    console.log('Initializing rows with data:', data);
    return (data || []).map((r, index) => {
      const qty = r?.QTY !== undefined && r?.QTY !== null ? Number(r.QTY) : 0;
      const original = r?.ORIGINAL_QTY !== undefined && r?.ORIGINAL_QTY !== null ? Number(r.ORIGINAL_QTY) : qty;
      const serialNo = r.SERIAL_NO || r.srNo || r.SR_NO || index + 1;

      console.log(`Row ${index}: SERIAL_NO=${serialNo}, REMARKS=${r.REMARKS}`);

      return {
        ...r,
        SERIAL_NO: serialNo, // Ensure SERIAL_NO exists
        QTY: qty,
        ORIGINAL_QTY: original,
        attachmentCount: r.attachmentCount || 0
      };
    });
  }, []);

  const [rowData, setRowData] = useState<any[]>(() => {
    const rows = initializeRows(updatedRows || vendorDetails || []);
    console.log('Initial rowData:', rows);
    return rows;
  });
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState<any[]>([]);
  const [, setIsLoadingAttachments] = useState(false);

  // Helper to normalize files response
  const normalizeFilesResponse = useCallback((res: any): any[] => {
    console.log('Normalizing response:', res);

    if (!res) {
      console.log('No response');
      return [];
    }

    if (Array.isArray(res)) {
      console.log('Response is array, length:', res.length);
      return res;
    }

    if (res.data) {
      console.log('Response has data property');
      if (Array.isArray(res.data)) {
        console.log('data is array, length:', res.data.length);
        return res.data;
      }
      if (res.data.allFiles && Array.isArray(res.data.allFiles)) {
        console.log('data.allFiles found, length:', res.data.allFiles.length);
        return res.data.allFiles;
      }
      if (res.data.groupedBySrNo && typeof res.data.groupedBySrNo === 'object') {
        const files = Object.values(res.data.groupedBySrNo).flat();
        console.log('data.groupedBySrNo found, total files:', files.length);
        return files;
      }
    }

    if (res.allFiles && Array.isArray(res.allFiles)) {
      console.log('allFiles found, length:', res.allFiles.length);
      return res.allFiles;
    }

    if (res.groupedBySrNo && typeof res.groupedBySrNo === 'object') {
      const files = Object.values(res.groupedBySrNo).flat();
      console.log('groupedBySrNo found, total files:', files.length);
      return files;
    }

    console.log('No recognizable format found');
    return [];
  }, []);

  // Fetch attachment counts for all items
  useEffect(() => {
    console.log('Attachment count effect triggered');
    console.log('requestNumber:', requestNumber);
    console.log('rowData length:', rowData.length);
    console.log('rowData:', rowData);

    if (!requestNumber) {
      console.log('No requestNumber, skipping attachment fetch');
      return;
    }

    if (!rowData || rowData.length === 0) {
      console.log('No rowData, skipping attachment fetch');
      return;
    }

    const fetchAttachmentCounts = async () => {
      setIsLoadingAttachments(true);
      console.log('Starting to fetch attachment counts...');

      try {
        console.log('Calling getAllVendorFiles with requestNumber:', requestNumber);
        const allFilesResponse = await FileUploadServiceInstance.getAllVendorFiles(requestNumber);
        console.log('getAllVendorFiles response:', allFilesResponse);

        const allFiles = normalizeFilesResponse(allFilesResponse);
        console.log('Normalized all files:', allFiles);
        console.log('Total files found:', allFiles.length);

        // Group files by SR_NO for easier lookup
        const filesBySrNo: Record<number, any[]> = {};

        allFiles.forEach((file: any, index: number) => {
          const srNo = file.srNo || file.sr_no || file.SR_NO || file.serial_no || 0;
          console.log(`File ${index}: srNo=${srNo}, name=${file.orgFileName || file.org_file_name}`);

          if (!filesBySrNo[srNo]) {
            filesBySrNo[srNo] = [];
          }
          filesBySrNo[srNo].push(file);
        });

        console.log('Files grouped by SR_NO:', filesBySrNo);

        // Update rowData with counts
        setRowData(prev => {
          const updated = prev.map(row => {
            if (row.REMARKS === 'Total') {
              console.log('Skipping Total row');
              return row;
            }

            const srNo = row.SERIAL_NO || row.srNo || row.SR_NO || 0;
            const count = filesBySrNo[srNo] ? filesBySrNo[srNo].length : 0;
            const hasAttachments = count > 0;

            console.log(`Row ${row.SERIAL_NO}: srNo=${srNo}, count=${count}, hasAttachments=${hasAttachments}`);

            return {
              ...row,
              attachmentCount: count,
              attachments: filesBySrNo[srNo] || []
            };
          });

          console.log('Updated rowData:', updated);
          return updated;
        });

      } catch (error) {
        console.error('Error fetching attachment counts:', error);
        // Set all counts to 0 on error
        setRowData(prev => {
          const reset = prev.map(row => ({
            ...row,
            attachmentCount: 0,
            attachments: []
          }));
          console.log('Reset rowData due to error:', reset);
          return reset;
        });

        dispatch(
          showAlert({
            open: true,
            message: 'Failed to load attachment counts',
            severity: 'error'
          })
        );
      } finally {
        setIsLoadingAttachments(false);
        console.log('Finished fetching attachment counts');
      }
    };

    fetchAttachmentCounts();
  }, [requestNumber, rowData.length, normalizeFilesResponse, dispatch]);

  // Refresh attachment count for specific serial number
  const refreshAttachmentCount = useCallback(async (serialNo: number) => {
    console.log('Refreshing attachment count for SR:', serialNo);

    if (!requestNumber || !serialNo) {
      console.log('Missing requestNumber or serialNo');
      return;
    }

    try {
      console.log('Calling getFilesBySrNo:', { requestNumber, serialNo });
      const response = await FileUploadServiceInstance.getFilesBySrNo(requestNumber, serialNo);
      console.log('getFilesBySrNo response:', response);

      const files = normalizeFilesResponse(response);
      const count = files.length;
      console.log(`Found ${count} files for SR ${serialNo}`);

      setRowData(prev => prev.map(row =>
        (row.SERIAL_NO === serialNo)
          ? { ...row, attachmentCount: count, attachments: files }
          : row
      ));
    } catch (error) {
      console.error(`Error refreshing attachment count for SR ${serialNo}:`, error);
    }
  }, [requestNumber, normalizeFilesResponse]);

  const amountFormatter = useCallback((params: any) => {
    if (params.value === null || params.value === undefined || params.value === '') return '';
    const num = Number(params.value);
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(Math.abs(num));
    return num < 0 ? `(-${formatted})` : formatted;
  }, []);

  const handleActions = useCallback(
    (action: string, data: any) => {
      if (action === 'delete') {
        setRowData((prev) => {
          const updated = prev.filter((row) => row.SERIAL_NO !== data.SERIAL_NO);
          setUpdatedRows?.(updated);
          dispatch(
            showAlert({
              open: true,
              message: intl.formatMessage({ id: 'ItemDeletedSuccessfully' }) || 'Item deleted successfully.',
              severity: 'success'
            })
          );
          return updated;
        });
      }
    },
    [dispatch, setUpdatedRows, intl]
  );

  // const handleAttachmentClick = useCallback((serialNo: number) => {
  //   console.log('Attachment clicked for SR:', serialNo);
  //   console.log('requestNumber:', requestNumber);

  //   if (!requestNumber) {
  //     console.log('No requestNumber, showing warning');
  //     dispatch(
  //       showAlert({
  //         open: true,
  //         message: 'Please save the document first before viewing attachments.',
  //         severity: 'warning'
  //       })
  //     );
  //     return;
  //   }
  //   setAttachmentDialog({ open: true, serialNo, requestNumber });
  // }, [requestNumber, dispatch]);

  const handleAttachmentClick = useCallback((serialNo: number) => {
    console.log('Attachment clicked for SR:', serialNo);

    // If in view mode (disabled=true) and no requestNumber, show warning
    if (disabled && (!requestNumber || requestNumber.toString().trim() === '')) {
      dispatch(
        showAlert({
          open: true,
          message: 'Document reference not available in view mode.',
          severity: 'warning'
        })
      );
      return;
    }

    // If in edit mode and no requestNumber, document needs to be saved first
    if (!disabled && (!requestNumber || requestNumber.toString().trim() === '')) {
      dispatch(
        showAlert({
          open: true,
          message: 'Please save the document first before adding attachments.',
          severity: 'warning'
        })
      );
      return;
    }

    setAttachmentDialog({
      open: true,
      serialNo,
      requestNumber: requestNumber.toString()
    });
  }, [requestNumber, dispatch, disabled]);
  // Memoized column definitions

  const handlePendingItemsOpen = () => {
    setPendingItemsPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleAddPendingItems = (rows: any[]) => {
    setRowData((prev) => {
      const updated = [...prev, ...rows.map(r => ({
        ...r,
        QTY: Number(r.QTY) || 0,
        ORIGINAL_QTY: Number(r.ORIGINAL_QTY) || Number(r.QTY) || 0
      }))];
      setUpdatedRows?.(updated);
      return updated;
    });
  };

  const handleOpenPendingPopup = () => {
    if (!docNo && !vendorDetails?.[0]?.DOC_NO) {
      dispatch(showAlert({ open: true, message: 'Document number is missing.', severity: 'warning' }));
      return;
    }
    setPendingItemsPopup(prev => ({
      ...prev,
      action: { ...prev.action, open: true }
    }));
  };



  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'SERIAL_NO',
        headerName: intl.formatMessage({ id: 'SrNo' }) || 'Sr No',
        width: 85,
        editable: false,
        cellStyle: () => ({ color: 'grey', fontSize: '0.775rem' })
      },
      {
        field: 'REMARKS',
        headerName: intl.formatMessage({ id: 'Description' }) || 'Description',
        width: 380,
        editable: false,
        wrapText: true,
        cellStyle: (params) => {
          if (params.value === 'Total') {
            return { fontWeight: 'bold', color: 'black', fontSize: '0.775rem' };
          }
          return { color: 'grey', fontWeight: 'normal', fontSize: '0.775rem' };
        }
      },
      // {
      //         field: 'QTY',
      //         headerName: intl.formatMessage({ id: 'Qty.....' }) || 'Qty....',
      //         width: 80,
      //         editable: true,
      //         cellStyle: (params) => {
      //           return {
      //             fontSize: '0.775rem',
      //             color: disabled ? 'grey' : '',
      //           };
      //         },
      //         valueSetter: (params) => {
      //           if (disabled) return false;

      //           const originalQty = Number(params.data.ORIGINAL_QTY ?? params.data.QTY ?? 0);
      //           const raw = params.newValue;

      //           if (raw === '' || raw === null || raw === undefined) {
      //             return false;
      //           }
      //           const newValue = Number(raw);
      //           if (isNaN(newValue)) {
      //             return false;
      //           }

      //           // Round to 2 decimal places
      //           const roundedValue = Math.round(newValue * 100) / 100;

      //           const pdoType = params.data?.PDO_TYPE;

      //           if (pdoType === 'P' || pdoType === 'Q') {
      //             // Allow any qty (including increase)
      //             params.data.QTY = roundedValue;
      //             return true;
      //           }
      //           if (roundedValue <= originalQty) {
      //             // Allow only decrease or same for other PDO_TYPEs
      //             params.data.QTY = roundedValue;
      //             return true;
      //           }

      //           dispatch(
      //             showAlert({
      //               open: true,
      //               message: intl.formatMessage(
      //                 {
      //                   id: 'QuantityExceedsOriginal',
      //                   defaultMessage: "You cannot increase quantity beyond original value ({originalQty}) for PDO Type '{pdoType}'."
      //                 },
      //                 { originalQty, pdoType }
      //               ),
      //               severity: 'warning'
      //             })
      //           );
      //           return false;
      //         },
      //         cellEditor: 'agTextCellEditor',
      //         valueFormatter: (params) => {
      //           if (params.value !== null && params.value !== undefined && params.value !== '') {
      //             const num = Number(params.value);
      //             return num.toFixed(2);
      //           }
      //           return '';
      //         }
      //       },

      {
        field: 'QTY',
        headerName: intl.formatMessage({ id: 'Qty' }) || 'Qty',
        width: 80,
        editable: true,
        cellStyle: () => ({
          fontSize: '0.775rem',
          color: disabled ? 'grey' : '',
        }),
        cellEditor: 'agTextCellEditor',
      }
      ,

      // {
      //   field: 'ORIGINAL_QTY',
      //   headerName: intl.formatMessage({ id: 'Org Qty' }) || 'Org Qty',
      //   width: 100,
      //   editable: false,
      //   cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
      //   valueFormatter: amountFormatter
      // },
      {
        field: 'PRICE',
        headerName: intl.formatMessage({ id: 'Rate' }) || 'Rate',
        width: 100,
        editable: false,
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        headerName: intl.formatMessage({ id: 'Amount' }) || 'Amount',
        field: 'amount',
        width: 110,
        editable: false,
        valueGetter: (params) => {
          if (params.node?.rowPinned) return params.data.amount;
          const qty = Number(params.data.QTY) || 0;
          const price = Number(params.data.PRICE) || 0;
          return qty * price;
        },
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        field: 'CURR_CODE',
        headerName: intl.formatMessage({ id: 'Currency' }) || 'Currency',
        width: 105,
        editable: false,
        cellStyle: { color: 'grey' }
      },
      {
        field: 'EX_RATE',
        headerName: intl.formatMessage({ id: 'ExRate' }) || 'Ex Rate',
        width: 95,
        editable: false,
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        headerName: intl.formatMessage({ id: 'BaseAmt' }) || 'Base Amt',
        field: 'baseAmt',
        width: 110,
        editable: false,
        valueGetter: (params) => {
          if (params.node?.rowPinned) return params.data.baseAmt;
          const qty = Number(params.data.QTY) || 0;
          const price = Number(params.data.PRICE) || 0;
          const exRate = Number(params.data.EX_RATE) || 1;
          return qty * price * exRate;
        },
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      // {
      //   headerName: intl.formatMessage({ id: 'Attachments' }) || 'Attachments',
      //   field: 'attachments',
      //   width: 110,
      //   editable: false,
      //   cellRenderer: (params: { data: any }) => {
      //     const data = params.data;

      //     if (data?.REMARKS === 'Total') {
      //       console.log('Total row, no attachment button');
      //       return null;
      //     }

      //     const serialNo = data.SERIAL_NO || data.srNo || data.SR_NO || 0;
      //     const attachmentCount = data.attachmentCount || 0;
      //     const hasAttachments = attachmentCount > 0;

      //     console.log(`Rendering attachment button for SR ${serialNo}:`, {
      //       serialNo,
      //       attachmentCount,
      //       hasAttachments,
      //       requestNumber: !!requestNumber,
      //       disabled
      //     });

      //     return (
      //       <Tooltip
      //         title={
      //           !requestNumber
      //             ? 'Please save document first'
      //             : hasAttachments
      //               ? `View ${attachmentCount} attachment${attachmentCount !== 1 ? 's' : ''}`
      //               : 'No attachments'
      //         }
      //       >
      //         <span>
      //           <Badge
      //             badgeContent={attachmentCount}
      //             color="primary"
      //             invisible={!hasAttachments}
      //             sx={{
      //               '& .MuiBadge-badge': {
      //                 fontSize: '0.6rem',
      //                 height: '16px',
      //                 minWidth: '16px',
      //               }
      //             }}
      //           >
      //             <IconButton
      //               size="small"
      //               onClick={() => handleAttachmentClick(serialNo)}
      //               disabled={!requestNumber || disabled}
      //               sx={{
      //                 opacity: hasAttachments ? 1 : 0.6,
      //                 '&:hover': {
      //                   backgroundColor: hasAttachments ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
      //                 }
      //               }}
      //             >
      //               <IoIosAttach />
      //               {isLoadingAttachments && <span style={{ fontSize: '0.6rem', marginLeft: '4px' }}>...</span>}
      //             </IconButton>
      //           </Badge>
      //         </span>
      //       </Tooltip>
      //     );
      //   }
      // },
      {
        headerName: intl.formatMessage({ id: 'Attachments' }) || 'Attachments',
        field: 'attachments',
        width: 110,
        editable: false,
        cellRenderer: (params: { data: any }) => {
          const data = params.data;

          if (data?.REMARKS === 'Total') {
            return null;
          }

          const serialNo = data.SERIAL_NO || data.srNo || data.SR_NO || 0;
          const attachmentCount = data.attachmentCount || 0;
          const hasAttachments = attachmentCount > 0;

          // SIMPLIFIED CHECK - remove all complex checks
          const shouldEnable = requestNumber && requestNumber !== '' && requestNumber !== '0';

          console.log('Button render:', {
            serialNo,
            requestNumber,
            shouldEnable,
            attachmentCount
          });

          return (
            <Tooltip
              title={
                !shouldEnable
                  ? 'Document not available'
                  : hasAttachments
                    ? `View ${attachmentCount} attachment${attachmentCount !== 1 ? 's' : ''}`
                    : 'No attachments'
              }
            >
              <span>
                <Badge
                  badgeContent={attachmentCount}
                  color="primary"
                  invisible={!hasAttachments}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.6rem',
                      height: '16px',
                      minWidth: '16px',
                    }
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleAttachmentClick(serialNo)}
                    disabled={!shouldEnable}
                    sx={{
                      opacity: shouldEnable ? 1 : 0.4,
                      color: hasAttachments ? 'primary.main' : 'text.secondary',
                      '&:hover': shouldEnable ? {
                        backgroundColor: 'rgba(25, 118, 210, 0.1)'
                      } : {},
                    }}
                  >
                    <IoIosAttach />
                  </IconButton>
                </Badge>
              </span>
            </Tooltip>
          );
        }
      },
      {
        field: 'TX_CAT_CODE',
        headerName: intl.formatMessage({ id: 'TaxCode' }) || 'Tax Code',
        width: 110,
        editable: false,
        cellStyle: { color: 'grey' }
      },
      {
        field: 'TX_COMPNT_PERC_1',
        headerName: 'Tax %',
        width: 85,
        editable: false,
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' })
      },
      {
        headerName: 'Tax Local Amt',
        field: 'taxLocalAmt',
        width: 135,
        editable: false,
        valueGetter: (params) => {
          if (params.node?.rowPinned) return params.data.taxLocalAmt;
          const qty = Number(params.data.QTY) || 0;
          const price = Number(params.data.PRICE) || 0;
          const exRate = Number(params.data.EX_RATE) || 1;
          const taxPerc = (Number(params.data.TX_COMPNT_PERC_1) || 0) / 100;
          return qty * price * exRate * taxPerc;
        },
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        headerName: 'Tax Com Amt 1',
        field: 'taxComAmt1',
        width: 140,
        editable: false,
        valueGetter: (params) => {
          if (params.node?.rowPinned) return params.data.taxComAmt1;
          const qty = Number(params.data.QTY) || 0;
          const price = Number(params.data.PRICE) || 0;
          const taxPerc = (Number(params.data.TX_COMPNT_PERC_1) || 0) / 100;
          return qty * price * taxPerc;
        },
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        headerName: 'Final Amt',
        field: 'finalAmt',
        width: 120,
        editable: false,
        valueGetter: (params) => {
          if (params.node?.rowPinned) return params.data.finalAmt;
          const qty = Number(params.data.QTY) || 0;
          const price = Number(params.data.PRICE) || 0;
          const exRate = Number(params.data.EX_RATE) || 1;
          const taxPerc = (Number(params.data.TX_COMPNT_PERC_1) || 0) / 100;
          const baseAmt = qty * price * exRate;
          return baseAmt + baseAmt * taxPerc;
        },
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        field: 'ITEM_REMARK',
        headerName: intl.formatMessage({ id: 'Item Remark' }) || 'Item Remark',
        width: 150,
        cellStyle: { color: 'grey' },
        editable: false,
      },
    ],
    [handleActions, amountFormatter, disabled, handleAttachmentClick, intl, requestNumber]
  );

  // Totals calculation
  const recalcTotals = useCallback((data: any[]) => {
    const totalQty = data.reduce((sum, row) => sum + (Number(row.QTY) || 0), 0);
    const totalAmount = data.reduce((sum, row) => sum + (Number(row.QTY) || 0) * (Number(row.PRICE) || 0), 0);
    const totalBaseAmt = data.reduce((sum, row) =>
      sum + (Number(row.QTY) || 0) * (Number(row.PRICE) || 0) * (Number(row.EX_RATE) || 1), 0);

    const totalTaxLocalAmt = data.reduce((sum, row) => {
      const qty = Number(row.QTY) || 0;
      const price = Number(row.PRICE) || 0;
      const exRate = Number(row.EX_RATE) || 1;
      const taxPerc = (Number(row.TX_COMPNT_PERC_1) || 0) / 100;
      return sum + qty * price * exRate * taxPerc;
    }, 0);

    const totalTaxComAmt1 = data.reduce((sum, row) => {
      const qty = Number(row.QTY) || 0;
      const price = Number(row.PRICE) || 0;
      const taxPerc = (Number(row.TX_COMPNT_PERC_1) || 0) / 100;
      return sum + qty * price * taxPerc;
    }, 0);

    const totalFinalAmt = data.reduce((sum, row) => {
      const qty = Number(row.QTY) || 0;
      const price = Number(row.PRICE) || 0;
      const exRate = Number(row.EX_RATE) || 1;
      const taxPerc = (Number(row.TX_COMPNT_PERC_1) || 0) / 100;
      const baseAmt = qty * price * exRate;
      return sum + (baseAmt + baseAmt * taxPerc);
    }, 0);

    setPinnedBottomRowData([
      {
        REMARKS: 'Total',
        QTY: totalQty,
        amount: Number(totalAmount.toFixed(3)),
        baseAmt: Number(totalBaseAmt.toFixed(3)),
        taxLocalAmt: Number(totalTaxLocalAmt.toFixed(3)),
        taxComAmt1: Number(totalTaxComAmt1.toFixed(3)),
        finalAmt: Number(totalFinalAmt.toFixed(3))
      }
    ]);
  }, []);

  // When rowData changes, recalc totals
  useEffect(() => {
    recalcTotals(rowData || []);
    onRowsChange?.(rowData);
    setUpdatedRows?.(rowData);
  }, [rowData, recalcTotals, onRowsChange, setUpdatedRows]);

  // Cell edit handler
  // const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
  //   const updatedRow = event.data;
  //   const newRowData = (rowData || []).map((r) =>
  //     r.SERIAL_NO === updatedRow.SERIAL_NO
  //       ? {
  //         ...r,
  //         ...updatedRow,
  //         QTY: updatedRow.QTY !== undefined && updatedRow.QTY !== null ? Number(updatedRow.QTY) : Number(r.QTY || 0)
  //       }
  //       : r
  //   );

  //   setRowData(newRowData);
  //   setUpdatedRows?.(newRowData);
  // }, [rowData, setUpdatedRows]);

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    if (disabled) return;

    const originalQty = Number(event.data.ORIGINAL_QTY ?? 0);
    const raw = event.newValue;

    if (raw === '' || raw === null || raw === undefined) {
      event.node.setDataValue('QTY', event.oldValue);
      return;
    }

    const newValue = Math.floor(Number(raw));
    if (isNaN(newValue)) {
      event.node.setDataValue('QTY', event.oldValue);
      return;
    }

    const pdoType = event.data?.PDO_TYPE;

    if (pdoType !== 'P' && pdoType !== 'Q' && newValue > originalQty) {
      dispatch(
        showAlert({
          open: true,
          message: `You cannot increase quantity beyond original value (${originalQty}) for PDO Type '${pdoType}'.`,
          severity: 'warning'
        })
      );

      event.node.setDataValue('QTY', event.oldValue);
      return;
    }

    const newRowData = rowData.map((r) =>
      r.SERIAL_NO === event.data.SERIAL_NO
        ? { ...r, QTY: newValue }
        : r
    );

    setRowData(newRowData);
  }, [rowData, dispatch, disabled]);


  const handleReset = () => {
    setRowData((prev) =>
      prev.map((row) => ({
        ...row,
        QTY: 0
      }))
    );
  };

  return (
    <Box sx={{ height: 380, width: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginRight: '18px', marginBottom: '8px' }}>
        {/* Reset button shows only if hideReset is false */}
        {!hideReset && (
          <Button
            onClick={handleReset}
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
          >
            {intl.formatMessage({ id: 'Reset' }) || 'Reset'}
          </Button>
        )}

        {/* Add Pending Item button always visible */}
        {mainActiveTab === 0 && (
          <Button
            onClick={handleOpenPendingPopup}
            sx={{
              fontSize: '0.895rem',
              backgroundColor: '#fff',
              color: '#082A89',
              border: '1.5px solid #082A89',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#082A89', color: '#fff', border: '1.5px solid #082A89' }
            }}
          >
            Add Pending Items
          </Button>
        )}
      </div>


      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%', overflowX: 'auto' }}>
        <VendorCustomGrid
          columnDefs={columnDefs}
          defaultColDef={{
            filter: true,
            sortable: true,
            resizable: true,
            headerClass: 'ag-center-header',
            cellStyle: { whiteSpace: 'normal', wordWrap: 'break-word', fontSize: '0.775rem' }
          }}
          rowData={rowData}
          pinnedBottomRowData={pinnedBottomRowData}
          rowHeight={20}
          height="380px"
          headerHeight={30}
          paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
          paginationPageSize={100}
          onCellValueChanged={handleCellValueChanged}
        />
      </div>

      {/* Item-specific Attachment Dialog */}
      {attachmentDialog.open && (
        <EnhancedVendorFilesDialog
          requestNumber={attachmentDialog.requestNumber}
          srNo={attachmentDialog.serialNo}
          isViewMode={disabled}
          onClose={() => {
            setAttachmentDialog({ open: false, serialNo: 0, requestNumber: '' });
            // Refresh attachment count for this item after dialog closes
            refreshAttachmentCount(attachmentDialog.serialNo);
          }}
          title={`Attachments for Serial No: ${attachmentDialog.serialNo}`}
        />
      )}
      {pendingItemsPopup && pendingItemsPopup.action.open && (
        <UniversalDialog
          action={{ ...pendingItemsPopup.action }}
          onClose={handlePendingItemsOpen}
          title={pendingItemsPopup.title}
          hasPrimaryButton={false}
        >
          <PendingItemsForm
            requestNumber={requestNumber || vendorDetails?.[0]?.DOC_NO || ''}
            docNo={docNo || vendorDetails?.[0]?.DOC_NO || ''}
            headerAcCode={vendorDetails?.[0]?.HEADER_AC_CODE || ''}
            isViewMode={disabled}
            hideUploadButton={disabled}
            onAddPendingItems={handleAddPendingItems}
            onClose={handlePendingItemsOpen} />
        </UniversalDialog>
      )}
    </Box>
  );
};

export default VendorItemDeletRemove;