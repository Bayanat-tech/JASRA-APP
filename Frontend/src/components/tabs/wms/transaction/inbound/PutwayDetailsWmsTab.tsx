// Importing necessary icons and components from various libraries
import { SettingOutlined } from '@ant-design/icons';
import { Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import { createPortal } from 'react-dom';

import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import dayjs from 'dayjs';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { TSite } from 'pages/WMS/types/site-wms.types';
import WmsSerivceInstance from 'service/wms/service.wms';
import useAuth from 'hooks/useAuth';

const rowsPerPageOptions = [10, 20, 50, 100];

const PutwayDetailsWmsTab = forwardRef<
  any,
  {
    job_no: string;
    prin_code: string;
    onSelectionChange?: (selectedRows: any[]) => void;
  }
>(({ job_no, prin_code, onSelectionChange }, ref) => {
  const { user } = useAuth();
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const gridRef = useRef<any>(null);

  // Modal and menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  // Create storage key for this specific job/principal combination
  const storageKey = `putway_selection_${job_no}_${prin_code}`;

  // Initialize selection state from localStorage or empty
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Putway details state
  const [localPutwayDetails, setLocalPutwayDetails] = useState({
    site_from: '',
    site_to: '',
    location_from: '',
    location_to: ''
  });

  // Add state to track first location codes for each site
  const [firstLocationCodes, setFirstLocationCodes] = useState<Record<string, string>>({});

  //----------- useQuery--------------
  const sql_string = `
    SELECT * 
    FROM VW_WM_INB_PACKDET_DETS 
    WHERE allocated = 'N' AND CLEARANCE = 'Y' AND
    company_code = '${user?.company_code}'
      AND job_no = '${job_no}' AND
      prin_code = '${prin_code}' 
    ORDER BY updated_at
  `;

  const { data: putwayData, refetch: refetchPutwayData } = useQuery({
    queryKey: ['putway_details', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string
  });

  // Fetch site data
  const { data: siteData } = useQuery({
    queryKey: ['site_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'site');
      if (response) {
        return {
          tableData: response.tableData as TSite[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  // Location queries
  const { data: locationFromOptions, isLoading: locationFromLoading } = useQuery({
    queryKey: ['location_from', localPutwayDetails.site_from],
    queryFn: async () => {
      if (!localPutwayDetails.site_from) return [];
      const response = await WmsSerivceInstance.getMasters(app, 'location', undefined, undefined, undefined, undefined, {
        site_code: localPutwayDetails.site_from
      });

      // Store first location code for this site
      if (response?.tableData && response.tableData.length > 0) {
        setFirstLocationCodes((prev) => ({
          ...prev,
          [localPutwayDetails.site_from]: (response.tableData as any[])[0].location_code
        }));
      }

      return response?.tableData || [];
    },
    enabled: !!localPutwayDetails.site_from
  });

  const { data: locationToOptions, isLoading: locationToLoading } = useQuery({
    queryKey: ['location_to', localPutwayDetails.site_to],
    queryFn: async () => {
      if (!localPutwayDetails.site_to) return [];
      const response = await WmsSerivceInstance.getMasters(app, 'location', undefined, undefined, undefined, undefined, {
        site_code: localPutwayDetails.site_to
      });

      // Store first location code for this site
      if (response?.tableData && response.tableData.length > 0) {
        setFirstLocationCodes((prev) => ({
          ...prev,
          [localPutwayDetails.site_to]: (response.tableData as any[])[0].location_code
        }));
      }

      return response?.tableData || [];
    },
    enabled: !!localPutwayDetails.site_to
  });

  // Memoize the row data to prevent unnecessary re-renders
  const memoizedRowData = useMemo(() => {
    if (!putwayData) return [];

    const transformed = putwayData
      .map((row: any, index: number) => ({
        ...row,
        PACKDET_NO: row.PACKDET_NO || `temp_${index}`,
        _uniqueKey: `${row.PACKDET_NO || `temp_${index}`}_${row.PROD_CODE || index}_${index}`
      }))
      .filter((row) => row !== null && row !== undefined);

    return transformed;
  }, [putwayData]);

  // Compute total quantity for displayed rows (by UOM)
  const qtyObjs = memoizedRowData.map(row => parseQtyString(row.QTY_STRING));
  const arrivedQtyObjs = memoizedRowData.map(row => parseQtyString(row.QTY_ARRIVED_STRING));
  const netArrivedQtyObjs = memoizedRowData.map(row => parseQtyString(row.QTY_NETARRIVED_STRING));

  const totalQtyObj = sumQtyObjects(qtyObjs);
  const totalArrivedQtyObj = sumQtyObjects(arrivedQtyObjs);
  const totalNetArrivedQtyObj = sumQtyObjects(netArrivedQtyObjs);

  const qtyUomOrder = getSortedUomOrder(memoizedRowData, 'QTY_STRING');
  const arrivedUomOrder = getSortedUomOrder(memoizedRowData, 'QTY_ARRIVED_STRING');
  const netArrivedUomOrder = getSortedUomOrder(memoizedRowData, 'QTY_NETARRIVED_STRING');

  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);
  const totalArrivedQtyDisplay = qtyObjToString(totalArrivedQtyObj, arrivedUomOrder);
  const totalNetArrivedQtyDisplay = qtyObjToString(totalNetArrivedQtyObj, netArrivedUomOrder);

  // Create pinned bottom row for ag-Grid
  const pinnedBottomRowData = [
    {
      PROD_NAME: 'Total:',
      QTY_STRING: totalDisplay,
      QTY_ARRIVED_STRING: totalArrivedQtyDisplay,
      QTY_NETARRIVED_STRING: totalNetArrivedQtyDisplay,
      LOT_NO: '',
      CONTAINER_NO: '',
      PO_NO: '',
      DOC_REF: '',
      QUANTITY: totalDisplay
    }
  ];

  // Stable function to update selection state
  const updateSelectionState = useCallback(
    (newSelectedIds: Set<string>, triggerChange = true) => {
      console.log('=== CHILD: updateSelectionState ===');
      console.log('newSelectedIds:', Array.from(newSelectedIds));
      
      setSelectedRowIds(newSelectedIds);

      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSelectedIds)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }

      // Update selected rows based on current data
      // Use _uniqueKey for matching
      const newSelectedRows = memoizedRowData.filter((row) => newSelectedIds.has(row._uniqueKey));
      console.log('newSelectedRows length:', newSelectedRows.length);
      console.log('newSelectedRows:', newSelectedRows);
      
      setSelectedRows(newSelectedRows);

      if (triggerChange) {
        console.log('Calling parent onSelectionChange with', newSelectedRows.length, 'rows');
        onSelectionChange?.(newSelectedRows);
      }
    },
    [memoizedRowData, onSelectionChange, storageKey]
  );

  // Update putway details
  const updatePutwayDetails = useCallback((updates: Partial<typeof localPutwayDetails>) => {
    setLocalPutwayDetails((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clean up invalid selections when data changes
  useEffect(() => {
    if (memoizedRowData.length > 0 && !isRefreshing) {
      // Use _uniqueKey for validation
      const validIds = new Set(memoizedRowData.map((row) => row._uniqueKey));
      const cleanedSelection = new Set(Array.from(selectedRowIds).filter((id) => validIds.has(id)));

      if (cleanedSelection.size !== selectedRowIds.size) {
        updateSelectionState(cleanedSelection, true);
      }
    }
  }, [memoizedRowData, isRefreshing, selectedRowIds, updateSelectionState]);

  // Modal portal management
  useEffect(() => {
    if (menuOpen && !portalContainer) {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'center';

      document.body.appendChild(container);
      setPortalContainer(container);
    }

    if (!menuOpen && portalContainer) {
      if (document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
      setPortalContainer(null);
    }
  }, [menuOpen, portalContainer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (portalContainer && document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
    };
  }, [portalContainer]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      setIsRefreshing(true);
      refetchPutwayData().finally(() => {
        // Remove immediate grid refresh to prevent row disappearing
        setTimeout(() => setIsRefreshing(false), 100);
      });
    },
    clearSelection: () => {
      updateSelectionState(new Set());
      localStorage.removeItem(storageKey);
    },
    getSelectedRows: () => {
      console.log('=== CHILD: getSelectedRows called ===');
      console.log('Returning selectedRows length:', selectedRows.length);
      console.log('selectedRows:', selectedRows);
      console.log('selectedRowIds size:', selectedRowIds.size);
      return selectedRows;
    },
    getSelectedCount: () => selectedRowIds.size
  }));

  // Handler functions
  // const handleMenuClick = () => {
  //   setMenuOpen(true);
  // };

  const handleClose = () => {
    setMenuOpen(false);
  };

  const handlePackingItemPutway = () => {
    const selectedKeys = selectedRows.map(row => ({
      packdet_no: row.PACKDET_NO,
      prod_code: row.PROD_CODE
    }));
    console.log('Selected rows:', selectedRows);
    const processPayload = {
      ...localPutwayDetails,
      effective_location_from: firstLocationCodes[localPutwayDetails.site_from] || localPutwayDetails.location_from,
      effective_location_to: firstLocationCodes[localPutwayDetails.site_to] || localPutwayDetails.location_to,
      selected_items: selectedKeys
    };

    console.log('Processing putway with payload:', processPayload);
    handleClose();
  };

  // Define the columns for the data table
  function getAgGridColumns(): ColDef[] {
    return [
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
                  // Use _uniqueKey for all selection
                  const allIds = new Set(memoizedRowData.map((row) => row._uniqueKey));
                  updateSelectionState(allIds);
                } else {
                  updateSelectionState(new Set());
                }
              }}
            />
          );
        },
        cellRenderer: (params: any) => {
          const rowId = params.data._uniqueKey;
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
        field: 'PROD_NAME', 
        headerName: 'Product', 
        minWidth: 200, 
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const prodCode = params.data?.PROD_CODE || '';
          const prodName = params.data?.PROD_NAME || '';
          return prodCode && prodName ? `${prodCode} - ${prodName}` : prodName || prodCode;
        }
      },
      { field: 'QTY_STRING', headerName: 'Quantity', minWidth: 150, cellStyle: { fontSize: '12px' } },
    {
      field: 'QUANTITY',
      headerName: 'Net Quantity',
      minWidth: 150,
      cellRenderer: (params: any) => {
        const value = params.value ?? '';
        const lUom = params.data?.L_UOM ? ` ${params.data.L_UOM}` : '';
        return `${value}${lUom}`;
      },
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },       {
        field: 'QTY_ARRIVED_STRING',
        headerName: 'Arrived Qty.',
        minWidth: 200,
        cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
      },
      {
        field: 'QTY_NETARRIVED_STRING',
        headerName: 'Net Arrived Qty.',
        minWidth: 175,
        cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
      },
      { field: 'BATCH_NO', headerName: 'Batch No.', minWidth: 120, cellStyle: { fontSize: '12px' } },
      { field: 'LOT_NO', headerName: 'Lot No.', minWidth: 100, cellStyle: { fontSize: '12px' } },
      {
        field: 'MFG_DATE',
        headerName: 'Mfg. Date',
        minWidth: 120,
        valueFormatter: (params: any) => {
          const val = params.value;
          if (val === '1900-01-01' || val === '3000-12-31') return '';
          return val ? dayjs(val).format('DD/MM/YYYY') : '';
        },
        cellStyle: { fontSize: '12px' }
      },
      {
        field: 'EXP_DATE',
        headerName: 'Exp. Date',
        minWidth: 120,
        valueFormatter: (params: any) => {
          const val = params.value;
          if (val === '1900-01-01' || val === '3000-12-31') return '';
          return val ? dayjs(val).format('DD/MM/YYYY') : '';
        },
        cellStyle: { fontSize: '12px' }
      },
      { field: 'CONTAINER_NO', headerName: 'Container Code', minWidth: 145, cellStyle: { fontSize: '12px' } },
      { field: 'PO_NO', headerName: 'PO Number', minWidth: 120, cellStyle: { fontSize: '12px' } },
      { field: 'DOC_REF', headerName: 'BL Number', minWidth: 120, cellStyle: { fontSize: '12px' } }
    ];
  }

  function handleAgGridSelectionChanged(params: any): void {
    // Keep this for compatibility but rely on manual selection
    console.log('Grid selection event fired');
  }

  const onGridReady = (params: any) => {
    gridRef.current = params;
  };

  const ModalContent = () => (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '600px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <Typography variant="h6" component="h2" style={{ marginBottom: '24px' }}>
        Configure Putway Details
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Site From</InputLabel>
            <Select
              value={localPutwayDetails.site_from || ''}
              onChange={(event) => {
                updatePutwayDetails({ site_from: event.target.value, location_from: '' });
              }}
              label="Site From"
              MenuProps={{
                container: portalContainer,
                disablePortal: false,
                PaperProps: {
                  style: {
                    zIndex: 10001,
                    maxHeight: 300
                  }
                }
              }}
            >
              {siteData?.tableData?.map((site) => (
                <MenuItem key={site.site_code} value={site.site_code}>
                  {site.site_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small" disabled={!localPutwayDetails.site_from}>
            <InputLabel>Location From</InputLabel>
            <Select
              value={localPutwayDetails.location_from || ''}
              onChange={(event) => {
                updatePutwayDetails({ location_from: event.target.value });
              }}
              label="Location From"
              endAdornment={locationFromLoading && <CircularProgress size={20} />}
              MenuProps={{
                container: portalContainer,
                disablePortal: false,
                PaperProps: {
                  style: {
                    zIndex: 10001,
                    maxHeight: 300
                  }
                }
              }}
            >
              {locationFromOptions?.map((location: any) => (
                <MenuItem key={location.location_code} value={location.location_code}>
                  {location.loc_desc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Site To</InputLabel>
            <Select
              value={localPutwayDetails.site_to || ''}
              onChange={(event) => {
                updatePutwayDetails({ site_to: event.target.value, location_to: '' });
              }}
              label="Site To"
              MenuProps={{
                container: portalContainer,
                disablePortal: false,
                PaperProps: {
                  style: {
                    zIndex: 10001,
                    maxHeight: 300
                  }
                }
              }}
            >
              {siteData?.tableData?.map((site) => (
                <MenuItem key={site.site_code} value={site.site_code}>
                  {site.site_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small" disabled={!localPutwayDetails.site_to}>
            <InputLabel>Location To</InputLabel>
            <Select
              value={localPutwayDetails.location_to || ''}
              onChange={(event) => {
                updatePutwayDetails({ location_to: event.target.value });
              }}
              label="Location To"
              endAdornment={locationToLoading && <CircularProgress size={20} />}
              MenuProps={{
                container: portalContainer,
                disablePortal: false,
                PaperProps: {
                  style: {
                    zIndex: 10001,
                    maxHeight: 300
                  }
                }
              }}
            >
              {locationToOptions?.map((location: any) => (
                <MenuItem key={location.location_code} value={location.location_code}>
                  {location.loc_desc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{
            color: '#666',
            border: '1.5px solid #666',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1.5px solid #666'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          sx={{
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
          variant="outlined"
          onClick={handlePackingItemPutway}
          startIcon={<SettingOutlined />}
          disabled={
            selectedRows.length === 0 ||
            !localPutwayDetails.site_from ||
            !localPutwayDetails.site_to ||
            !localPutwayDetails.location_from ||
            !localPutwayDetails.location_to
          }
        >
          Process Putway
        </Button>
      </div>
    </div>
  );

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
        getRowId={(params) => params.data._uniqueKey}
        key={`${job_no}_${prin_code}_${memoizedRowData.length}`}
        pinnedBottomRowData={pinnedBottomRowData}
      />
      {/* Remove the old total row div below the grid */}
      {menuOpen && portalContainer && createPortal(<ModalContent />, portalContainer)}
    </div>
  );
});

PutwayDetailsWmsTab.displayName = 'PutwayDetailsWmsTab';

export default PutwayDetailsWmsTab;

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
function getSortedUomOrder(rowData: any[], field: string): string[] {
  const uomTotals: Record<string, number> = {};
  rowData.forEach(row => {
    const qtyObj = parseQtyString(row[field]);
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