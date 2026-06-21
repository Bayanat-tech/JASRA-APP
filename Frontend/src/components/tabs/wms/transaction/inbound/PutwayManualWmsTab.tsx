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

const PutwayManualWmsTab = forwardRef<
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
  const storageKey = `putway_manual_selection_${job_no}_${prin_code}`;

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

  //----------- useQuery with TT_BATCH--------------
  const sql_string = `
    SELECT * 
    FROM VW_WM_INB_TT_BATCH_DETS
    WHERE company_code = '${user?.company_code}'
      AND job_no = '${job_no}' AND
      prin_code = '${prin_code}' 
    ORDER BY updated_at
  `;

  const { data: putwayData, refetch: refetchPutwayData } = useQuery({
    queryKey: ['putway_manual_details', sql_string],
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
      return response?.tableData || [];
    },
    enabled: !!localPutwayDetails.site_to
  });

  // Memoize the row data to prevent unnecessary re-renders
  const memoizedRowData = useMemo(() => {
    if (!putwayData) return [];

    const transformed = putwayData
      .map((row: any, index: number) => {
        // Transform uppercase keys to lowercase to match column field names
        const transformedRow = {
          packdet_no: row.PACKDET_NO ?? row.packdet_no ?? `temp_${index}`,
          prod_code: row.PROD_CODE ?? row.prod_code,
          pallet_id: row.PALLET_ID ?? row.pallet_id,
          site_code: row.SITE_CODE ?? row.site_code,
          location_code: row.LOCATION_CODE ?? row.location_code,
          prod_name: row.PROD_NAME ?? row.prod_name,
          receive_qty_string: row.RECEIVE_QTY_STRING ?? row.receive_qty_string,
          net_receive_string: row.NET_RECEIVE_STRING ?? row.net_receive_string,
          lot_no: row.LOT_NO ?? row.lot_no,
          mfg_date: row.MFG_DATE ?? row.mfg_date,
          exp_date: row.EXP_DATE ?? row.exp_date,
          container_no: row.CONTAINER_NO ?? row.container_no,
          po_no: row.PO_NO ?? row.po_no,
          doc_ref: row.DOC_REF ?? row.doc_ref,
          confirmed: row.CONFIRMED ?? row.confirmed,
          description1: row.DESCRIPTION1 ?? row.description1,
          _uniqueKey: `${row.PACKDET_NO || row.packdet_no || `temp_${index}`}_${row.PROD_CODE || row.prod_code || index}_${index}`
        };

        return transformedRow;
      })
      .filter((row) => row !== null && row !== undefined);

    return transformed;
  }, [putwayData]);

  // Stable function to update selection state
  const updateSelectionState = useCallback(
    (newSelectedIds: Set<string>, triggerChange = true) => {
      setSelectedRowIds(newSelectedIds);

      // Persist to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSelectedIds)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }

      // Update selected rows based on current data
      const newSelectedRows = memoizedRowData.filter((row) => newSelectedIds.has(row.packdet_no?.toString()));
      setSelectedRows(newSelectedRows);

      if (triggerChange) {
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
      const validIds = new Set(memoizedRowData.map((row) => row.packdet_no?.toString()));
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
    getSelectedRows: () => selectedRows,
    getSelectedCount: () => selectedRowIds.size
  }));

  // Handler functions
  const handleClose = () => {
    setMenuOpen(false);
  };

  const handlePackingItemPutway = () => {
    // Implementation for putway processing
    console.log('Processing manual putway for selected items:', selectedRows);
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
          const allSelected = selectedRowIds.size === memoizedRowData.filter(row => !row.confirmed).length && memoizedRowData.filter(row => !row.confirmed).length > 0;
          const someSelected = selectedRowIds.size > 0;
          // Disable header checkbox if all rows are confirmed (none selectable)
          const allRowsConfirmed = memoizedRowData.length > 0 && memoizedRowData.every(row => row.confirmed);
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
                  // Only select rows that are not confirmed
                  const allIds = new Set(memoizedRowData.filter(row => !row.confirmed).map((row) => row.packdet_no?.toString()));
                  updateSelectionState(allIds);
                } else {
                  updateSelectionState(new Set());
                }
              }}
              disabled={allRowsConfirmed}
            />
          );
        },
        cellRenderer: (params: any) => {
          const rowId = params.data.packdet_no?.toString();
          const isSelected = selectedRowIds.has(rowId);
          // Only disable if confirmed is NOT 'N'
          const isConfirmed = params.data.confirmed !== 'N';
          return (
            <input
              type="checkbox"
              checked={isSelected}
              disabled={isConfirmed}
              onChange={(e) => {
                e.stopPropagation();
                if (isConfirmed) return; // Prevent selection if confirmed
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
      { field: 'prod_code', headerName: 'Product Code', minWidth: 135, cellStyle: { fontSize: '12px' } },
      { field: 'pallet_id', headerName: 'Pallet ID', minWidth: 100, cellStyle: { fontSize: '12px' } },
      { field: 'site_code', headerName: 'Site Code', minWidth: 100, cellStyle: { fontSize: '12px' } },
      { field: 'location_code', headerName: 'Location', minWidth: 100, cellStyle: { fontSize: '12px' } },
      { field: 'prod_name', headerName: 'Product Name', minWidth: 200, cellStyle: { fontSize: '12px' } },
      { field: 'receive_qty_string', headerName: 'Receive Quantity', minWidth: 125, cellStyle: { fontSize: '12px' } },
      { field: 'net_receive_string', headerName: 'Net Qty.', minWidth: 95, cellStyle: { fontSize: '12px' } },
      { field: 'lot_no', headerName: 'Lot No.', minWidth: 100, cellStyle: { fontSize: '12px' } },
      {
        field: 'mfg_date',
        headerName: 'Mfg. Date',
        minWidth: 120,
        valueFormatter: (params: any) => (params.value ? dayjs(params.value).format('DD/MM/YYYY') : ''),
        cellStyle: { fontSize: '12px' }
      },
      {
        field: 'exp_date',
        headerName: 'Exp. Date',
        minWidth: 120,
        valueFormatter: (params: any) => (params.value ? dayjs(params.value).format('DD/MM/YYYY') : ''),
        cellStyle: { fontSize: '12px' }
      },
      { field: 'container_no', headerName: 'Container Code', minWidth: 145, cellStyle: { fontSize: '12px' } },
      { field: 'po_no', headerName: 'PO Number', minWidth: 120, cellStyle: { fontSize: '12px' } },
      { field: 'doc_ref', headerName: 'BL Number', minWidth: 120, cellStyle: { fontSize: '12px' } },

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
        Configure Manual Putway Details
      </Typography>

      {/* Show description1 if available in the first selected row */}
      {selectedRows.length > 0 && selectedRows[0].description1 && (
        <Typography variant="body2" style={{ marginBottom: '16px', color: '#555' }}>
          Description: {selectedRows[0].description1}
        </Typography>
      )}

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
          Process Manual Putway
        </Button>
      </div>
    </div>
  );

  // --- Add helpers for UOM total calculation (copied from TallyDetailsWmsTab) ---
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

  function sumQtyObjects(arr: Array<Record<string, number>>): Record<string, number> {
    return arr.reduce((acc, obj) => {
      for (const [uom, qty] of Object.entries(obj)) {
        acc[uom] = (acc[uom] || 0) + qty;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  function qtyObjToString(qtyObj: Record<string, number>, uomOrder: string[]): string {
    return uomOrder
      .filter(uom => qtyObj[uom] && qtyObj[uom] !== 0)
      .map(uom => `${qtyObj[uom]} ${uom}`)
      .join(', ');
  }

  function getSortedUomOrder(rowData: any[], field: string): string[] {
    const uomTotals: Record<string, number> = {};
    rowData.forEach(row => {
      const qtyObj = parseQtyString(row[field]);
      Object.entries(qtyObj).forEach(([uom, qty]) => {
        uomTotals[uom] = (uomTotals[uom] || 0) + qty;
      });
    });
    return Object.keys(uomTotals).sort((a, b) => {
      if (uomTotals[b] !== uomTotals[a]) return uomTotals[b] - uomTotals[a];
      return a.localeCompare(b);
    });
  }

  // --- Calculate totals for Quantity (by UOM) ---
  const qtyObjs = memoizedRowData.map(row => parseQtyString(row.receive_qty_string));
  const totalQtyObj = sumQtyObjects(qtyObjs);
  const qtyUomOrder = getSortedUomOrder(memoizedRowData, 'receive_qty_string');
  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);

  // --- Calculate totals for Net Qty (by UOM) ---
  const netQtyObjs = memoizedRowData.map(row => parseQtyString(row.net_receive_string));
  const totalNetQtyObj = sumQtyObjects(netQtyObjs);
  const netQtyUomOrder = getSortedUomOrder(memoizedRowData, 'net_receive_string');
  const totalNetDisplay = qtyObjToString(totalNetQtyObj, netQtyUomOrder);

  // --- Create pinned bottom row for ag-Grid ---
  const pinnedBottomRowData = [
    {
      prod_code: '',
      pallet_id: '',
      site_code: '',
      location_code: '',
      prod_name: 'Total:',
      receive_qty_string: totalDisplay,
      net_receive_string: totalNetDisplay,
      lot_no: '',
      mfg_date: '',
      exp_date: '',
      container_no: '',
      po_no: '',
      doc_ref: ''
    }
  ];

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
        getRowId={(params) => `${params.data.packdet_no}` || `row_${Math.random()}`}
        key={`${job_no}_${prin_code}_${memoizedRowData.length}_manual`}
        pinnedBottomRowData={pinnedBottomRowData}
      />

      {menuOpen && portalContainer && createPortal(<ModalContent />, portalContainer)}
    </div>
  );
});

PutwayManualWmsTab.displayName = 'PutwayManualWmsTab';

export default PutwayManualWmsTab;