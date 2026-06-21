import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { useDispatch } from 'react-redux';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { useIntl } from 'react-intl';
import { IoIosAttach } from 'react-icons/io';
import EnhancedVendorFilesDialog from '../components/EnhancedVendorFilesDialog';
import PendingItemsForm from './PendingItemsForm';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import UniversalDialog from 'components/popup/UniversalDialog';

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
}

const VendorItemDetails: React.FC<VendorItemDetailsProps> = ({
  vendorDetails = [],
  onRowsChange,
  disabled = false,
  hideReset = false,
  setUpdatedRows,
  updatedRows,
  requestNumber = '',
  docNo,
}) => {
  const dispatch = useDispatch();
  const intl = useIntl();

  // ✅ FIX: prevSourceKey track karo taaki jab source data change ho toh re-initialize ho
  const prevSourceKey = useRef<string>('');

  const [attachmentDialog, setAttachmentDialog] = useState<{
    open: boolean;
    serialNo: number;
    requestNumber: string;
  }>({ open: false, serialNo: 0, requestNumber: '' });

  const [allAttachmentsDialog, setAllAttachmentsDialog] = useState<{
    open: boolean;
    requestNumber: string;
  }>({ open: false, requestNumber: '' });

  const [rowData, setRowData] = useState<any[]>([]);
  const [pinnedBottomRowData, setPinnedBottomRowData] = useState<any[]>([]);
  const [pendingItemsPopup, setPendingItemsPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true, maxWidth: 'md' },
    title: 'Pending Items'
  });

  const handlePendingItemsOpen = () => {
    setPendingItemsPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
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

  const initializeRows = useCallback((data: any[]) => {
    return (data || []).map((r) => {
      const qty = r?.QTY !== undefined && r?.QTY !== null ? Number(r.QTY) : 0;
      const original = r?.ORIGINAL_QTY !== undefined && r?.ORIGINAL_QTY !== null ? Number(r.ORIGINAL_QTY) : qty;
      return {
        ...r,
        QTY: qty,
        ORIGINAL_QTY: original
      };
    });
  }, []);

  // ✅ FIX: isInitialized ref hatao, instead source data ka key track karo
  // Jab bhi updatedRows ya vendorDetails change ho (nayi loading), re-initialize karo
  useEffect(() => {
    const sourceData = updatedRows && updatedRows.length > 0 ? updatedRows : vendorDetails;

    // Ek unique key banao source data ke basis par
    const newKey = sourceData.map(r => `${r.SERIAL_NO}-${r.DOC_NO}`).join('|');

    // Sirf tab initialize karo jab source data actually change hua ho
    if (newKey !== prevSourceKey.current && newKey !== '') {
      prevSourceKey.current = newKey;
      const initializedRows = initializeRows(sourceData);
      setRowData(initializedRows);
    }
  }, [vendorDetails, updatedRows, initializeRows]);

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

  const handleAttachmentClick = useCallback((serialNo: number) => {
    if (!requestNumber) {
      dispatch(
        showAlert({
          open: true,
          message: 'Please save the document first before adding attachments.',
          severity: 'warning'
        })
      );
      return;
    }
    setAttachmentDialog({ open: true, serialNo, requestNumber });
  }, [requestNumber, dispatch]);

  // ✅ FIX: Add pending items ke baad setUpdatedRows bhi call karo
  const handleAddPendingItems = (rows: any[]) => {
    setRowData((prev) => {
      const updated = [...prev, ...rows.map(r => ({
        ...r,
        QTY: Number(r.QTY) || 0,
        ORIGINAL_QTY: Number(r.ORIGINAL_QTY) || Number(r.QTY) || 0
      }))];
      // ✅ Parent ko bhi updated rows bhejo taaki submit mein include ho
      setUpdatedRows?.(updated);
      return updated;
    });
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
      {
        field: 'QTY',
        headerName: intl.formatMessage({ id: 'Qty' }) || 'Qty',
        width: 80,
        // ✅ FIX: disabled prop ke basis par editable control karo
        editable: !disabled,
        cellStyle: (params) => {
          return {
            fontSize: '0.775rem',
            color: disabled ? 'grey' : 'black',
            backgroundColor: disabled ? '' : '#f0f7ff', // editable cells ko highlight karo
          };
        },
        valueSetter: (params) => {
          if (disabled) return false;

          // const originalQty = Number(params.data.ORIGINAL_QTY ?? params.data.QTY ?? 0);
          const raw = params.newValue;

          if (raw === '' || raw === null || raw === undefined) {
            return false;
          }
          const newValue = Number(raw);
          if (isNaN(newValue)) {
            return false;
          }

          const roundedValue = Math.round(newValue * 100) / 100;
          const originalQty = roundedValue;
          const pdoType = params.data?.PDO_TYPE;

          if (pdoType === 'P' || pdoType === 'Q') {
            params.data.QTY = roundedValue;
            return true;
          }
          if (roundedValue <= originalQty) {
            params.data.QTY = roundedValue;
            return true;
          }

          dispatch(
            showAlert({
              open: true,
              message: intl.formatMessage(
                {
                  id: 'QuantityExceedsOriginal',
                  defaultMessage: "You cannot increase quantity beyond original value ({originalQty}) for PDO Type '{pdoType}'."
                },
                { originalQty, pdoType }
              ),
              severity: 'warning'
            })
          );
          return false;
        },
        cellEditor: 'agTextCellEditor',
        valueFormatter: (params) => {
          if (params.value !== null && params.value !== undefined && params.value !== '') {
            const num = Number(params.value);
            return num.toFixed(2);
          }
          return '';
        }
      },
      {
        field: 'ORIGINAL_QTY',
        headerName: intl.formatMessage({ id: 'Org Qty' }) || 'Org Qty',
        width: 100,
        editable: false,
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
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
      {
        headerName: intl.formatMessage({ id: 'Attachments' }) || 'Attachments',
        field: 'attachments',
        width: 100,
        editable: false,
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          if (data?.REMARKS === 'Total') return null;

          return (
            <Tooltip title="View/Add Attachments for this item">
              <IconButton
                size="small"
                onClick={() => handleAttachmentClick(data.SERIAL_NO)}
                disabled={!requestNumber || disabled}
              >
                <IoIosAttach />
              </IconButton>
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
        headerName: intl.formatMessage({ id: 'TaxPercent' }) || 'Tax %',
        width: 85,
        editable: false,
        cellStyle: () => ({ color: 'grey', textAlign: 'right', fontSize: '0.775rem' })
      },
      {
        headerName: intl.formatMessage({ id: 'TaxLocalAmt' }) || 'Tax Local Amt',
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
        headerName: intl.formatMessage({ id: 'TaxComAmt1' }) || 'Tax Com Amt 1',
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
        headerName: intl.formatMessage({ id: 'FinalAmt' }) || 'Final Amt',
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
        editable: !disabled,
      },
      {
        headerName: intl.formatMessage({ id: 'Action' }) || 'Action',
        field: 'action',
        width: 130,
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          if (data?.REMARKS === 'Total') return null;
          const actionButtons: TAvailableActionButtons[] = ['delete'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    [handleActions, amountFormatter, disabled, handleAttachmentClick, intl]
  );

  const recalcTotals = useCallback((data: any[]) => {
    const totalQty = data.reduce((sum, row) => sum + (Number(row.QTY) || 0), 0);
    const totalAmount = data.reduce((sum, row) => sum + (Number(row.QTY) || 0) * (Number(row.PRICE) || 0), 0);
    const totalBaseAmt = data.reduce((sum, row) => sum + (Number(row.QTY) || 0) * (Number(row.PRICE) || 0) * (Number(row.EX_RATE) || 1), 0);

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

  useEffect(() => {
    recalcTotals(rowData || []);
    onRowsChange?.(rowData);
  }, [rowData, recalcTotals, onRowsChange]);

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const updatedRow = event.data;

    setRowData((prev) => {
      const newRowData = (prev || []).map((r) =>
        r.SERIAL_NO === updatedRow.SERIAL_NO
          ? {
            ...r,
            ...updatedRow,
            QTY: updatedRow.QTY !== undefined && updatedRow.QTY !== null ? Number(updatedRow.QTY) : Number(r.QTY || 0)
          }
          : r
      );
      // Cell change hone par parent ko bhi updated rows bhejo
      setUpdatedRows?.(newRowData);
      return newRowData;
    });
  }, [setUpdatedRows]);

  const handleReset = () => {
    setRowData(prev => {
      const reset = prev.map(row => ({ ...row, QTY: 0 }));
      setUpdatedRows?.(reset);
      return reset;
    });
  };

  return (
    <Box sx={{ height: 450, width: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 18px 8px 0', gap: '10px' }}>

        {/* Add Pending Items - hamesha dikhega */}
        {!disabled && (
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

        {/* Reset - sirf tab dikhega jab hideReset false ho */}
        {!hideReset && !disabled && (
          <Button
            onClick={handleReset}
            sx={{
              fontSize: '0.895rem',
              backgroundColor: '#fff',
              color: '#082A89',
              border: '1.5px solid #082A89',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#082A89', color: '#fff', border: '1.5px solid #082A89' }
            }}
          >
            {intl.formatMessage({ id: 'Reset' }) || 'Reset'}
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
          height="425px"
          headerHeight={30}
          paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
          paginationPageSize={100}
          onCellValueChanged={handleCellValueChanged}
          pagination={false}
        />
      </div>

      {attachmentDialog.open && (
        <EnhancedVendorFilesDialog
          requestNumber={attachmentDialog.requestNumber}
          srNo={attachmentDialog.serialNo}
          isViewMode={disabled}
          onClose={() => setAttachmentDialog({ open: false, serialNo: 0, requestNumber: '' })}
          title={`Attachments for Serial No: ${attachmentDialog.serialNo}`}
        />
      )}

      {allAttachmentsDialog.open && (
        <EnhancedVendorFilesDialog
          requestNumber={allAttachmentsDialog.requestNumber}
          isViewMode={disabled}
          onClose={() => setAllAttachmentsDialog({ open: false, requestNumber: '' })}
          showAllAttachments={true}
          title={`All Attachments for Request: ${allAttachmentsDialog.requestNumber}`}
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

export default VendorItemDetails;