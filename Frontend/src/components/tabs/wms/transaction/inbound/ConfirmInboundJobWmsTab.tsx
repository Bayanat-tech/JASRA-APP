import React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
//import { ISearch } from 'components/filters/SearchFilter';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { TInboundjobconfirm } from 'pages/WMS/Transaction/Inbound/types/confirmjobInbound_wms.types';
import dayjs from 'dayjs';
import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
// import { FormattedMessage } from 'react-intl';
//import { useLocation } from 'react-router';
import WmsSerivceInstance from 'service/wms/service.wms';
import inbjobconfirmServiceInstance from 'service/wms/transaction/inbound/service.inboundConfirmWms';
// import { Modal } from 'antd';

import useAuth from 'hooks/useAuth';

const rowsPerPageOptions = [10, 20, 50, 100];

const ConfirmInboundJobWmsTab = forwardRef<
  any,
  {
    job_no: string;
    prin_code: string;
    onSelectionChange?: (selectedRows: TInboundjobconfirm[]) => void;
  }
>(({ job_no, prin_code, onSelectionChange }, ref) => {
  const { user } = useAuth();
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRowData, setSelectedRowData] = useState<TInboundjobconfirm | null>(null);
  const gridRef = useRef<any>(null);
  console.log(anchorEl, selectedRowData, 'anchorEl');
  // Helper function to get unique row ID - prioritize packdet_no for manual putaway
  const getRowIdentifier = useCallback((row: TInboundjobconfirm): string => {
    // Check all possible field name variations (uppercase and lowercase)
    const packdetNo = row.packdet_no || row.PACKDET_NO || row.PackDet_No;
    const keyNumber = row.key_number || row.KEY_NUMBER || row.Key_Number;
    const identityNumber = row.identity_number || row.IDENTITY_NUMBER || row.Identity_Number;
    
    // Use packdet_no as priority, fall back to others for row identification only
    const identifier = (packdetNo || keyNumber || identityNumber)?.toString() || '';
    return identifier;
  }, []);

  // Create a unique storage key for this specific job/principal combination
  const storageKey = `job_confirmation_selection_${job_no}_${prin_code}`;

  // Initialize selection state from localStorage or empty
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedRows, setSelectedRows] = useState<TInboundjobconfirm[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  //----------- useQuery--------------
//   const sql_string = `
//   SELECT * 
//   FROM VW_WM_INB_TT_BATCH_DETS
//   WHERE selected = 'N'  AND confirmed = 'N'  AND allocated = 'Y' AND
//  company_code =  '${user?.company_code}'
//     AND job_no = '${job_no}' AND
//     prin_code = '${prin_code}' 
// `;

  const sql_string = `
  SELECT * 
  FROM VW_WM_INB_TT_BATCH_DETS
  WHERE confirmed = 'N' AND
   company_code =  '${user?.company_code}'
    AND job_no = '${job_no}' AND
    prin_code = '${prin_code}' 
`;
  const { data: confirmInboundData, refetch: refetchinboundjobconfirmData } = useQuery({
    queryKey: ['job_confirmation', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Normalize field names from UPPERCASE to lowercase
  const normalizedData = useMemo(() => {
    if (!confirmInboundData || !Array.isArray(confirmInboundData)) {
      console.log('ConfirmInbound: No data to normalize');
      return [];
    }

    const normalized = confirmInboundData.map((row) => {
      const normalizedRow: any = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.toLowerCase()] = row[key];
      });
      return normalizedRow;
    });

    console.log('ConfirmInbound: Normalized data sample:', normalized[0]);
    return normalized;
  }, [confirmInboundData]);

  // Enhanced memoized row data with aggressive filtering (matching QualityClearanceWmsTab)
  const memoizedRowData = useMemo(() => {
    if (!normalizedData || !Array.isArray(normalizedData)) {
      console.log('ConfirmInbound: No data or invalid data structure');
      return [];
    }

    // First, let's see what we're working with
    console.log('ConfirmInbound: Raw data count:', normalizedData.length);
    console.log('ConfirmInbound: Sample row fields:', normalizedData[0] ? Object.keys(normalizedData[0]) : []);

    const validRows = normalizedData.filter((row, index) => {
      // Basic validation
      if (!row || typeof row !== 'object') {
        console.log(`Row ${index} filtered: not an object`);
        return false;
      }

      // Check for packdet_no with all variations
      const packdetNo = row.packdet_no || row.PACKDET_NO || row.PackDet_No;
      const keyNumber = row.key_number || row.KEY_NUMBER || row.Key_Number;
      const identityNumber = row.identity_number || row.IDENTITY_NUMBER || row.Identity_Number;
      const uniqueId = packdetNo || keyNumber || identityNumber;
      
      const criticalFields = ['job_no', 'prin_code'];
      const hasUniqueId = uniqueId !== null && uniqueId !== undefined;
      const hasCriticalFields = criticalFields.every((field) => {
        const value = row[field];
        if (value === null || value === undefined) return false;

        if (typeof value === 'string') {
          const trimmed = value.trim();
          return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined';
        }

        if (typeof value === 'number') return !isNaN(value) && isFinite(value);
        return Boolean(value);
      });

      if (!hasUniqueId || !hasCriticalFields) {
        console.log(`Row ${index} filtered: missing critical fields`, {
          packdet_no: packdetNo,
          key_number: keyNumber,
          identity_number: identityNumber,
          job_no: row.job_no,
          prin_code: row.prin_code
        });
        return false;
      }

      // For debugging
      console.log(`Row ${index} passed basic validation:`, {
        unique_id: uniqueId,
        prod_code: row.prod_code,
        container_no: row.container_no
      });

      return true;
    });

    // Add stable sorting to prevent order changes
    const sortedRows = validRows.sort((a, b) => {
      // Sort by key_number to ensure consistent ordering
      const aId = (a.key_number || a.identity_number)?.toString() || '';
      const bId = (b.key_number || b.identity_number)?.toString() || '';
      return aId.localeCompare(bId);
    });

    console.log(`ConfirmInbound: Final processed data - Input: ${normalizedData.length}, Output: ${sortedRows.length}`);

    return sortedRows;
  }, [normalizedData]);

  // Compute total quantity for displayed rows
  const totalQuantity = useMemo(() => {
    return memoizedRowData.reduce((sum, row) => {
      const qty = parseFloat(row.qty_confirm_string);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }, [memoizedRowData]);

  // Compute total arrived qty and net arrived qty
  const totalArrivedQty = useMemo(() => {
    return memoizedRowData.reduce((sum, row) => {
      const qty = parseFloat(row.receive_qty_string ?? '');
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }, [memoizedRowData]);
  const totalNetArrivedQty = useMemo(() => {
    return memoizedRowData.reduce((sum, row) => {
      const qty = parseFloat(row.net_receive_string ?? '');
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }, [memoizedRowData]);

  const puomValue = memoizedRowData.length > 0 ? memoizedRowData[0].p_uom || memoizedRowData[0].puom || '' : '';
  const totalDisplay = `${totalQuantity} ${puomValue}`;
  const totalArrivedQtyDisplay = `${totalArrivedQty} ${puomValue}`;
  const totalNetArrivedQtyDisplay = `${totalNetArrivedQty} ${puomValue}`;

  const pinnedBottomRowData = [
    {
      prod_name: 'Total:',
      qty_confirm_string: totalDisplay,
      receive_qty_string: totalArrivedQtyDisplay,
      net_receive_string: totalNetArrivedQtyDisplay,
      batch_no: '',
      lot_no: '',
      mfg_date: '',
      exp_date: '',
      container_no: '',
      po_no: '',
      doc_ref: ''
    }
  ];

  // Add a separate effect to monitor data changes
  useEffect(() => {
    console.log('ConfirmInbound: Data update detected', {
      rawDataLength: normalizedData?.length || 0,
      filteredDataLength: memoizedRowData.length,
      isRefreshing,
      selectedCount: selectedRowIds.size
    });
  }, [normalizedData, memoizedRowData, isRefreshing, selectedRowIds.size]);

  // Stable function to update selection state (matching QualityClearanceWmsTab)
  const updateSelectionState = useCallback(
    (newSelectedIds: Set<string>, triggerChange = true) => {
      console.log('=== UPDATE SELECTION STATE ===');
      console.log('1. New selected IDs:', Array.from(newSelectedIds));
      console.log('2. Available row data count:', memoizedRowData.length);
      
      setSelectedRowIds(newSelectedIds);

      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSelectedIds)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }

      // Update selected rows based on current data
      const newSelectedRows = memoizedRowData.filter((row) => {
        const rowId = getRowIdentifier(row);
        const isSelected = newSelectedIds.has(rowId);
        console.log(`Checking row with ID ${rowId}: ${isSelected ? 'SELECTED' : 'not selected'}`);
        return isSelected;
      });
      
      console.log('3. Filtered selected rows count:', newSelectedRows.length);
      console.log('4. Filtered selected rows data:', newSelectedRows);
      
      setSelectedRows(newSelectedRows);

      if (triggerChange) {
        console.log('5. Calling onSelectionChange callback');
        onSelectionChange?.(newSelectedRows);
      }
      
      console.log('=== END UPDATE SELECTION STATE ===');
    },
    [memoizedRowData, onSelectionChange, storageKey, getRowIdentifier]
  );

  // Clean up invalid selections when data changes - but don't interfere with manual selection
  useEffect(() => {
    if (memoizedRowData.length > 0 && !isRefreshing) {
      const validIds = new Set(memoizedRowData.map((row) => getRowIdentifier(row)));
      const cleanedSelection = new Set(Array.from(selectedRowIds).filter((id) => validIds.has(id)));

      console.log('ConfirmInbound: Selection cleanup', {
        validIdsCount: validIds.size,
        currentSelectionCount: selectedRowIds.size,
        cleanedSelectionCount: cleanedSelection.size
      });

      // Only update if there are invalid selections to remove
      if (cleanedSelection.size !== selectedRowIds.size) {
        console.log('ConfirmInbound: Updating selection state due to invalid selections');
        updateSelectionState(cleanedSelection, true);
      }
    }
  }, [memoizedRowData, isRefreshing, selectedRowIds, updateSelectionState, getRowIdentifier]);

  const getCellRenderer = (field: string) => (params: any) => {
    return params.value || '';
  };

  const getAgGridColumns = (): ColDef[] => [
    {
      headerName: '',
      pinned: 'left',
      width: 50,
      maxWidth: 50,
      filter: false,
      sortable: false,
      resizable: false,
      suppressMenu: true,
      lockPosition: true,
      headerComponent: () => {
        const allSelected = selectedRowIds.size === memoizedRowData.length && memoizedRowData.length > 0;
        const someSelected = selectedRowIds.size > 0;
        return (
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) input.indeterminate = someSelected && !allSelected;
            }}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                // Select all using key_number as unique identifier
                const allIds = new Set(memoizedRowData.map((row) => getRowIdentifier(row)));
                updateSelectionState(allIds);
              } else {
                // Deselect all
                updateSelectionState(new Set());
              }
            }}
          />
        );
      },
      cellRenderer: (params: any) => {
        const rowId = getRowIdentifier(params.data);
        const isSelected = selectedRowIds.has(rowId);
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              const newSelectedIds = new Set(selectedRowIds);
              if (e.target.checked) {
                newSelectedIds.add(rowId);
              } else {
                newSelectedIds.delete(rowId);
              }
              updateSelectionState(newSelectedIds);
            }}
          />
        );
      }
    },
    {
      headerName: 'Product',
      field: 'product',
      valueGetter: (params: any) => {
        return `${params.data.prod_name}`;
      },
      minWidth: 210,
      cellStyle: { fontSize: '12px' }
    },
    // {
    //   field: 'confirmed',
    //   headerName: 'Confirmed Flag',
    //   minWidth: 140,
    //   cellRenderer: (params: any) => {
    //     const clearanceFlag = params.value;
    //     const displayValue = clearanceFlag === 'Y' ? 'Yes' : clearanceFlag === 'N' ? 'No' : '';
    //     const rowStyle = clearanceFlag === 'Y' ? { backgroundColor: 'Green', color: 'white', padding: '2px 8px' } : {};
    //     return <div style={rowStyle}>{displayValue}</div>;
    //   },
    //   cellStyle: { fontSize: '12px' },
    //   filter: 'agTextColumnFilter',
    //   filterParams: {
    //     buttons: ['reset', 'apply'],
    //     closeOnApply: true
    //   }
    // },
    {
      field: 'qty_confirm_string',
      headerName: 'Quantity',
      minWidth: 125,
      cellStyle: { fontSize: '12px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'receive_qty_string',
      headerName: 'Arrived Qty.',
      minWidth: 150,
      // cellRenderer: getCellRenderer('qty_arrived_string'),
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'net_receive_string',
      headerName: 'Net Arrived Qty.',
      minWidth: 150,
      // cellRenderer: getCellRenderer('qty_netarrived_string'),
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'batch_no',
      headerName: 'Batch No.',
      minWidth: 100,
      cellRenderer: getCellRenderer('batch_no'),
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'lot_no',
      headerName: 'Lot No.',
      minWidth: 100,
      cellStyle: { fontSize: '12px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'mfg_date',
      headerName: 'Mfg. Date',
      minWidth: 110,
      valueFormatter: (params: any) => {
        const value = params.value;
        if (
          !value ||
          value === '1900-01-01' ||
          value === '3000-12-31' ||
          dayjs(value).isSame('1900-01-01', 'day') ||
          dayjs(value).isSame('3000-12-31', 'day')
        ) {
          return '';
        }
        return dayjs(value).format('DD/MM/YYYY');
      },
      cellStyle: { fontSize: '12px' },
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'exp_date',
      headerName: 'Exp. Date',
      minWidth: 120,
      valueFormatter: (params: any) => {
        const value = params.value;
        if (
          !value ||
          value === '1900-01-01' ||
          value === '3000-12-31' ||
          dayjs(value).isSame('1900-01-01', 'day') ||
          dayjs(value).isSame('3000-12-31', 'day')
        ) {
          return '';
        }
        return dayjs(value).format('DD/MM/YYYY');
      },
      cellStyle: { fontSize: '12px' },
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'container_no',
      headerName: 'Container Code',
      minWidth: 145,
      cellStyle: { fontSize: '12px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'po_no',
      headerName: 'PO Number',
      minWidth: 120,
      cellStyle: { fontSize: '12px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      field: 'doc_ref',
      headerName: 'BL Number',
      minWidth: 120,
      cellStyle: { fontSize: '12px' },
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 80,
      cellRenderer: (params: any) => (
        <IconButton size="small" onClick={(event) => handleActionClick(event, params.data)}>
          <MoreOutlined />
        </IconButton>
      ),
      filter: false,
      sortable: false,
      pinned: 'right'
    }
  ];

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      console.log('ConfirmInbound: Manual refresh triggered');
      setIsRefreshing(true);
      refetchinboundjobconfirmData().finally(() => {
        setTimeout(() => {
          console.log('ConfirmInbound: Refresh completed');
          setIsRefreshing(false);
        }, 100);
      });
    },
    clearSelection: () => {
      console.log('ConfirmInbound: Clearing selection');
      updateSelectionState(new Set());
      localStorage.removeItem(storageKey);
    },
    getSelectedRows: () => {
      console.log('=== GET SELECTED ROWS ===');
      console.log('1. selectedRows state:', selectedRows);
      console.log('2. selectedRows count:', selectedRows.length);
      console.log('3. selectedRowIds:', Array.from(selectedRowIds));
      console.log('4. memoizedRowData count:', memoizedRowData.length);
      
      // If selectedRows is empty but selectedRowIds has values, try to rebuild
      if (selectedRows.length === 0 && selectedRowIds.size > 0) {
        console.warn('WARNING: selectedRows is empty but selectedRowIds has values. Rebuilding...');
        const rebuiltRows = memoizedRowData.filter((row) => selectedRowIds.has(getRowIdentifier(row)));
        console.log('5. Rebuilt rows:', rebuiltRows);
        return rebuiltRows;
      }
      
      return selectedRows;
    },
    getSelectedCount: () => selectedRowIds.size,
    getDataInfo: () => ({
      rawCount: normalizedData?.length || 0,
      filteredCount: memoizedRowData.length,
      selectedCount: selectedRowIds.size
    }),
    processSelectedConfirmations: async () => {
      console.log('=== START CONFIRMATION PROCESS ===');
      
      // Get fresh selected rows
      const currentSelectedRows = selectedRows.length === 0 && selectedRowIds.size > 0
        ? memoizedRowData.filter((row) => selectedRowIds.has(getRowIdentifier(row)))
        : selectedRows;
      
      console.log('1. Selected rows count:', currentSelectedRows.length);
      console.log('2. Selected rows raw data:', JSON.stringify(currentSelectedRows, null, 2));
      
      if (currentSelectedRows.length === 0) {
        console.warn('No rows selected for confirmation');
        return false;
      }

      try {
        // Log each row's available fields
        currentSelectedRows.forEach((row, index) => {
          console.log(`Row ${index} fields:`, Object.keys(row));
          console.log(`Row ${index} packdet_no variations:`, {
            packdet_no: row.packdet_no,
            PACKDET_NO: row.PACKDET_NO,
            PackDet_No: row.PackDet_No
          });
        });

        // Extract ONLY packdet_no for the payload - DO NOT use key_number or identity_number
        const packdetNumbers = currentSelectedRows
          .map((row, index) => {
            const packdetNo = row.packdet_no || row.PACKDET_NO || row.PackDet_No;
            
            console.log(`Extracting packdet_no for row ${index}:`, {
              packdetNo,
              chosen: packdetNo
            });
            
            return packdetNo?.toString();
          })
          .filter((packdetNo): packdetNo is string => {
            const isValid = Boolean(packdetNo) && packdetNo.trim() !== '';
            if (!isValid) {
              console.warn('Invalid packdet_no filtered out:', packdetNo);
            }
            return isValid;
          });

        console.log('3. Extracted packdet_no values:', packdetNumbers);
        console.log('4. packdet_no array length:', packdetNumbers.length);
        console.log('5. Calling service with:', {
          packdetNumbers,
          job_no,
          prin_code
        });

        if (packdetNumbers.length === 0) {
          console.error('ERROR: No valid packdet_no found in selected rows');
          console.error('Selected rows data:', currentSelectedRows);
          return false;
        }

        const result = await inbjobconfirmServiceInstance.processInbJobConfirm(packdetNumbers, job_no, prin_code);
        console.log('6. Service call result:', result);

        // Clear selection and refresh data after successful processing
        updateSelectionState(new Set());
        localStorage.removeItem(storageKey);
        refetchinboundjobconfirmData();

        console.log('=== CONFIRMATION PROCESS COMPLETED ===');
        return true;
      } catch (error) {
        console.error('=== CONFIRMATION PROCESS FAILED ===');
        console.error('Error processing selected confirmations:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
    }
  }));

  //-------------handlerssss---------------
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, rowData: TInboundjobconfirm) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowData(rowData);
  };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  //   setSelectedRowData(null);
  // };

  // const handleConfirmSingle = () => {
  //   if (!selectedRowData) return;

  //   Modal.confirm({
  //     title: 'Confirm Job',
  //     content: `Are you sure you want to confirm this job for product ${selectedRowData.prod_code}?`,
  //     okText: 'Yes, Confirm',
  //     cancelText: 'Cancel',
  //     onOk: async () => {
  //       try {
  //         // Use key_number instead of packdet_no for single confirmation
  //         await inbjobconfirmServiceInstance.processInbJobConfirm([selectedRowData.key_number?.toString() ?? ''], job_no, prin_code);
  //         refetchinboundjobconfirmData();
  //         handleMenuClose();
  //       } catch (error) {
  //         console.error('Error processing confirmation:', error);
  //       }
  //     }
  //   });
  // };

  function handleAgGridSelectionChanged(params: any): void {
    // Keep this for compatibility but rely on manual selection
    console.log('Grid selection event fired');
  }

  // Add event listener for header checkbox after grid is ready
  const onGridReady = (params: any) => {
    gridRef.current = params;
    console.log('ConfirmInbound: Grid ready with data count:', memoizedRowData.length);
  };

  return (
    <div className="flex flex-col space-y-2">
      <CustomAgGrid
        rowHeight={20}
        headerHeight={30}
        rowData={memoizedRowData}
        columnDefs={getAgGridColumns()}
        onGridReady={onGridReady}
        onSelectionChanged={handleAgGridSelectionChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={rowsPerPageOptions}
        height="480px"        
        editable={false}
        suppressRowClickSelection={true}
        suppressRowTransform={true}
        animateRows={false}
        reload_data={false}
        getRowId={(params) => getRowIdentifier(params.data) || `row_${Math.random()}`}
        key={`confirm_grid_${job_no}_${prin_code}_${memoizedRowData.length}_${Date.now()}`}
        pinnedBottomRowData={pinnedBottomRowData}
      />
    </div>
  );
});

ConfirmInboundJobWmsTab.displayName = 'ConfirmInboundJobWmsTab';

export default ConfirmInboundJobWmsTab;