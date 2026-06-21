// import { SettingOutlined } from '@ant-design/icons';
// import { Button, Grid, TextField } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
//import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { FormattedMessage } from 'react-intl';
import clearanceServiceInstance from 'service/wms/transaction/inbound/service.qualityclearanceWms';
import UniversalDelete from 'components/popup/UniversalDelete';
import AddInboundQualityClearanceForm from 'components/forms/Wms/Transaction/AddInboundQualityClearanceForm';
// import DataDebugger from 'components/debug/DataDebugger';

// type TQuality = {
//   truck_condition: string;
//   container_condition: string;
//   container_type: string;
//   ref_box_temp: string;
//   prod_temp: string;
//   prod_con_acceptance: string;
// };

const rowsPerPageOptions = [10, 20, 50, 100];
/*const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};*/

const QualityClearanceDetailsWmsTab = forwardRef<
  any,
  {
    job_no: string;
    prin_code: string;
    onSelectionChange?: (selectedRows: TPackingDetails[]) => void;
  }
>(({ job_no, prin_code, onSelectionChange }, ref) => {
  //--------------constants----------
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const { user } = useAuth();
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const gridRef = useRef<any>(null);

  // Create a unique storage key for this specific job/principal combination
  const storageKey = `quality_clearance_selection_${job_no}_${prin_code}`;

  // Initialize selection state from localStorage or empty
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedRows, setSelectedRows] = useState<TPackingDetails[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [packingFormPopup, setPackingFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Packing Detail" />,
    data: { existingData: {}, isEditMode: false }
  });

  //----------- useQuery--------------
  const sql_string = `
  SELECT * 
  FROM VW_WM_INB_PACKDET_DETS 
  WHERE company_code = '${user?.company_code}'
    AND job_no = '${job_no}' 
    AND prin_code = '${prin_code}'
  ORDER BY updated_at
`;

  const { data: packingData, refetch: refetchPackingData } = useQuery({
    queryKey: ['packing_details', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

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
        // Helper function to check if a row has clearance
        const isRowCleared = (row: any) => {
          const clearance = row.CLEARANCE || row.clearance;
          return clearance === "Y" || clearance === "y";
        };
        
        // Only rows that can be selected (CLEARANCE !== "Y")
        const selectableRows = memoizedRowData.filter(row => !isRowCleared(row));
        const selectableIds = new Set(selectableRows.map(row => {
          const id = row.packdet_no || row.PACKDET_NO;
          return id?.toString();
        }).filter(Boolean));
        
        const allSelected = selectableRows.length > 0 && Array.from(selectableIds).every(id => selectedRowIds.has(id));
        const someSelected = Array.from(selectableIds).some(id => selectedRowIds.has(id));
        const isDisabled = selectableRows.length === 0;

        return (
          <input
            type="checkbox"
            checked={allSelected}
            disabled={isDisabled}
            ref={input => {
              if (input) input.indeterminate = someSelected && !allSelected;
            }}
            onChange={e => {
              e.stopPropagation();
              if (isDisabled) return;
              if (e.target.checked) {
                // Select only rows where CLEARANCE !== "Y"
                updateSelectionState(selectableIds);
              } else {
                // Deselect only those rows
                const newSelectedIds = new Set(selectedRowIds);
                selectableIds.forEach(id => newSelectedIds.delete(id));
                updateSelectionState(newSelectedIds);
              }
            }}
          />
        );
      },
      cellRenderer: (params: any) => {
        const rowId = (params.data.packdet_no || params.data.PACKDET_NO)?.toString();
        if (!rowId) return null;
        
        const isSelected = selectedRowIds.has(rowId);
        const clearance = params.data.CLEARANCE || params.data.clearance;
        const isCleared = clearance === "Y" || clearance === "y";
        
        return (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isCleared}
            onChange={(e) => {
              e.stopPropagation();
              if (isCleared) return;
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
      field: 'prod_name', 
      headerName: 'Product', 
      minWidth: 200, 
      cellStyle: { fontSize: '12px' },
      valueGetter: (params: any) => params.data?.prod_name || params.data?.PROD_NAME || ''
    },
    { 
      field: 'qty_string', 
      headerName: 'Quantity', 
      minWidth: 160, 
      cellStyle: { fontSize: '12px' },
      valueGetter: (params: any) => params.data?.qty_string || params.data?.QTY_STRING || ''
    },
    {
      field: 'QUANTITY',
      headerName: 'Net Quantity',
      minWidth: 150,
      cellRenderer: (params: any) => {
        const value = params.data?.QUANTITY ?? params.data?.quantity ?? '';
        const lUom = params.data?.l_uom || params.data?.L_UOM || '';
        return lUom ? `${value} ${lUom}` : value;
      },
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },    
    {
      field: 'qty_arrived_string',
      headerName: 'Arrived Qty.',
      minWidth: 200,
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' },
      valueGetter: (params: any) => params.data?.qty_arrived_string || params.data?.QTY_ARRIVED_STRING || ''
    },
    {
      field: 'qty_netarrived_string',
      headerName: 'Net Arrived Qty.',
      minWidth: 150,
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' },
      valueGetter: (params: any) => params.data?.qty_netarrived_string || params.data?.QTY_NETARRIVED_STRING || ''
    },
    { 
      field: 'lot_no', 
      headerName: 'Lot No.', 
      cellStyle: { fontSize: '12px' }, 
      minWidth: 100,
      valueGetter: (params: any) => params.data?.lot_no || params.data?.LOT_NO || ''
    },
    {
      field: 'MFG_DATE',
      headerName: 'Mfg. Date',
      cellStyle: { fontSize: '12px' },
      minWidth: 120,
      valueFormatter: (params: any) => {
        const val = params.value;
        if (!val || val === '1900-01-01' || val === '3000-12-31' || val.startsWith('1899-')) return '';
        return val ? new Date(val).toLocaleDateString() : '';
      }
    },
    {
      field: 'EXP_DATE',
      headerName: 'Exp. Date',
      cellStyle: { fontSize: '12px' },
      minWidth: 120,
      valueFormatter: (params: any) => {
        const val = params.value;
        if (!val || val === '1900-01-01' || val === '3000-12-31' || val.startsWith('3000-')) return '';
        return val ? new Date(val).toLocaleDateString() : '';
      }
    },
    { 
      field: 'po_no', 
      headerName: 'PO Number', 
      cellStyle: { fontSize: '12px' }, 
      minWidth: 120,
      valueGetter: (params: any) => params.data?.po_no || params.data?.PO_NO || ''
    },
    { 
      field: 'bl_no', 
      headerName: 'BL Number', 
      minWidth: 120, 
      cellStyle: { fontSize: '12px' },
      valueGetter: (params: any) => params.data?.bl_no || params.data?.BL_NO || ''
    },
    { 
      field: 'doc_ref', 
      headerName: 'Doc Reference No.', 
      minWidth: 160, 
      cellStyle: { fontSize: '12px' },
      valueGetter: (params: any) => params.data?.doc_ref || params.data?.DOC_REF || ''
    }
  ];

  // Enhanced memoized row data with aggressive filtering
  const memoizedRowData = useMemo(() => {
    if (!packingData || !Array.isArray(packingData)) {
      console.log('QualityClearance: No data or invalid data structure');
      return [];
    }

    console.log('QualityClearance: Raw data received:', packingData);

    // Add stable sorting to prevent order changes
    const sortedRows = packingData.sort((a, b) => {
      // Sort by packdet_no to ensure consistent ordering
      const aId = (a.packdet_no || a.PACKDET_NO)?.toString() || '';
      const bId = (b.packdet_no || b.PACKDET_NO)?.toString() || '';
      return aId.localeCompare(bId);
    });

    console.log(`QualityClearance: Final processed data - Input: ${packingData.length}, Output: ${sortedRows.length}`);

    return sortedRows;
  }, [packingData]);

  // --- Add helpers for UOM parsing and summing (copy from ReceivingDetailsWmsTab) ---

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

  // --- Replace total quantity calculations with UOM-aware logic ---

  // Calculate totals for Quantity, Arrived Qty, Net Arrived Qty
  const qtyObjs = memoizedRowData.map(row => parseQtyString(row.qty_string));
  const arrivedQtyObjs = memoizedRowData.map(row => parseQtyString(row.qty_arrived_string));
  const netArrivedQtyObjs = memoizedRowData.map(row => parseQtyString(row.qty_netarrived_string));

  const totalQtyObj = sumQtyObjects(qtyObjs);
  const totalArrivedQtyObj = sumQtyObjects(arrivedQtyObjs);
  const totalNetArrivedQtyObj = sumQtyObjects(netArrivedQtyObjs);

  const qtyUomOrder = getSortedUomOrder(memoizedRowData, 'qty_string');
  const arrivedUomOrder = getSortedUomOrder(memoizedRowData, 'qty_arrived_string');
  const netArrivedUomOrder = getSortedUomOrder(memoizedRowData, 'qty_netarrived_string');

  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);
  const totalArrivedQtyDisplay = qtyObjToString(totalArrivedQtyObj, arrivedUomOrder);
  const totalNetArrivedQtyDisplay = qtyObjToString(totalNetArrivedQtyObj, netArrivedUomOrder);

  // Create pinned bottom row for ag-Grid
  const pinnedBottomRowData = [
    {
      prod_name: 'Total:', 
      qty_string: totalDisplay,
      qty_arrived_string: totalArrivedQtyDisplay,
      qty_netarrived_string: totalNetArrivedQtyDisplay,
      lot_no: '',
      container_no: '',
      po_no: '',
      bl_no: '',
      doc_ref: '',
    }
  ];

  // Add a separate effect to monitor data changes
  useEffect(() => {
    console.log('QualityClearance: Data update detected', {
      rawDataLength: packingData?.length || 0,
      filteredDataLength: memoizedRowData.length,
      isRefreshing,
      selectedCount: selectedRowIds.size
    });
  }, [packingData, memoizedRowData, isRefreshing, selectedRowIds.size]);

  // Stable function to update selection state
  const updateSelectionState = useCallback(
    (newSelectedIds: Set<string>, triggerChange = true) => {
      console.log('QualityClearance: Updating selection state', {
        previousCount: selectedRowIds.size,
        newCount: newSelectedIds.size,
        newIds: Array.from(newSelectedIds)
      });
      
      setSelectedRowIds(newSelectedIds);

      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSelectedIds)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }

      // Update selected rows based on current data
      const newSelectedRows = memoizedRowData.filter((row) => {
        const rowId = (row.packdet_no || row.PACKDET_NO)?.toString();
        return rowId && newSelectedIds.has(rowId);
      });
      
      console.log('QualityClearance: Selected rows updated', {
        rowCount: newSelectedRows.length,
        rows: newSelectedRows
      });
      
      setSelectedRows(newSelectedRows);

      if (triggerChange) {
        onSelectionChange?.(newSelectedRows);
      }
    },
    [memoizedRowData, onSelectionChange, storageKey]
  );

  // Clean up invalid selections when data changes - but don't interfere with manual selection
  useEffect(() => {
    if (memoizedRowData.length > 0 && !isRefreshing) {
      const validIds = new Set(
        memoizedRowData
          .map((row) => (row.packdet_no || row.PACKDET_NO)?.toString())
          .filter(Boolean)
      );
      const cleanedSelection = new Set(Array.from(selectedRowIds).filter((id) => validIds.has(id)));

      console.log('QualityClearance: Selection cleanup', {
        validIdsCount: validIds.size,
        currentSelectionCount: selectedRowIds.size,
        cleanedSelectionCount: cleanedSelection.size,
        validIds: Array.from(validIds),
        currentSelection: Array.from(selectedRowIds),
        cleanedSelection: Array.from(cleanedSelection)
      });

      // Only update if there are invalid selections to remove
      if (cleanedSelection.size !== selectedRowIds.size) {
        console.log('QualityClearance: Updating selection state due to invalid selections');
        updateSelectionState(cleanedSelection, true);
      }
    }
  }, [memoizedRowData, isRefreshing, selectedRowIds, updateSelectionState]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      console.log('QualityClearance: Manual refresh triggered');
      setIsRefreshing(true);
      refetchPackingData().finally(() => {
        setTimeout(() => {
          console.log('QualityClearance: Refresh completed');
          setIsRefreshing(false);
        }, 100);
      });
    },
    clearSelection: () => {
      console.log('QualityClearance: Clearing selection');
      updateSelectionState(new Set());
      localStorage.removeItem(storageKey);
    },
    getSelectedRows: () => {
      // Add validation and normalization here
      return selectedRows.map(row => ({
        ...row,
        packdet_no: row.packdet_no || row.PACKDET_NO,
        prod_code: row.prod_code || row.PROD_CODE,
        job_no: row.job_no || row.JOB_NO,
        prin_code: row.prin_code || row.PRIN_CODE
      }));
    },
    getSelectedCount: () => selectedRowIds.size,
    getDataInfo: () => ({
      rawCount: packingData?.length || 0,
      filteredCount: memoizedRowData.length,
      selectedCount: selectedRowIds.size
    })
  }));

  // Add a method to manually refresh data (can be called from parent)
  const refreshData = () => {
    refetchPackingData();
  };

  // Expose refresh method to parent via useImperativeHandle if needed
  useEffect(() => {
    // Listen for custom refresh events if needed
    const handleRefresh = () => {
      refreshData();
    };

    window.addEventListener('refreshQualityClearance', handleRefresh);
    return () => {
      window.removeEventListener('refreshQualityClearance', handleRefresh);
    };
  }, []);

  //-------------handlers---------------
  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  const handleDelete = async () => {
    const deleteData = selectedRows.map((item) => ({
      prin_code: item.prin_code as string,
      job_no: item.job_no as string,
      packdet_no: item.packdet_no as number
    }));
    await clearanceServiceInstance.deletePackingDetails(deleteData);
    updateSelectionState(new Set()); // Clear selection after delete
    setDeletePopup(false);
    refetchPackingData();
  };
  const togglePackingPopup = (refetchData?: boolean) => {
    if (packingFormPopup.action.open === true && refetchData) {
      refetchPackingData();
      // Maintain selection after refetch by re-selecting based on packdet_no
      setTimeout(() => {
        const stillExistingIds = new Set<string>();
        const stillExistingRows: TPackingDetails[] = [];

        memoizedRowData.forEach((row) => {
          const rowId = row.packdet_no?.toString();
          if (rowId && selectedRowIds.has(rowId)) {
            stillExistingIds.add(rowId);
            stillExistingRows.push(row);
          }
        });

        setSelectedRowIds(stillExistingIds);
        setSelectedRows(stillExistingRows);
        onSelectionChange?.(stillExistingRows);
      }, 100);
    }
    setPackingFormPopup((prev) => {
      return {
        ...prev,
        title: <FormattedMessage id="Add Packing Details" />,
        data: { existingData: { prin_code, job_no } },
        action: { ...prev.action, open: !prev.action.open }
      };
    });
  };

  useEffect(() => {
    setToggleFilter(null);
  }, []);

  function handleAgGridSelectionChanged(params: any): void {
    // Keep this for compatibility but rely on manual selection
    console.log('Grid selection event fired');
  }

  const onGridReady = (params: any) => {
    gridRef.current = params;
    console.log('QualityClearance: Grid ready with data count:', memoizedRowData.length);
  };

  // Add effect to monitor grid state
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      const displayedRowCount = gridRef.current.api.getDisplayedRowCount();
      console.log('QualityClearance: Grid state check', {
        expectedRows: memoizedRowData.length,
        displayedRows: displayedRowCount,
        gridReady: !!gridRef.current.api
      });
    }
  }, [memoizedRowData]);

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
        getRowId={(params) => {
          const id = params.data.packdet_no || params.data.PACKDET_NO;
          if (!id) {
            console.warn('Row missing both packdet_no and PACKDET_NO:', params.data);
          }
          return id?.toString() || `row_${Math.random()}`;
        }}
        key={`quality_grid_${job_no}_${prin_code}_${memoizedRowData.length}_${Date.now()}`}
        pinnedBottomRowData={pinnedBottomRowData}
      />
      {!!packingFormPopup && packingFormPopup.action.open && (
        <UniversalDialog
          action={{ ...packingFormPopup.action }}
          onClose={togglePackingPopup}
          title={packingFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddInboundQualityClearanceForm
            selectedRows={selectedRows}
            job_no={job_no}
            prin_code={prin_code}
            onClose={togglePackingPopup}
          />
        </UniversalDialog>
      )}
      {openDeletePopup === true && (
        <UniversalDelete open={openDeletePopup} handleClose={handleCloseDelete} title={selectedRows.length} handleDelete={handleDelete} />
      )}
    </div>
  );
});

QualityClearanceDetailsWmsTab.displayName = 'QualityClearanceDetailsWmsTab';

export default QualityClearanceDetailsWmsTab;