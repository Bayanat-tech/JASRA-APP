import React, { forwardRef, useImperativeHandle, useMemo, useEffect, useState, useRef, useCallback } from 'react';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddInboundTallyDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundTallyDetailsForm';
import { TTallyDetails } from 'pages/WMS/Transaction/Inbound/types/tallyDetails.types';
import { FormattedMessage } from 'react-intl';
import tallyServiceInstance from 'service/wms/transaction/inbound/service.tallyDetailsWms';
import PutawayWithPalletIdServiceInstance from 'service/wms/transaction/inbound/service.putawaywithpalletidWms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import UniversalDelete from 'components/popup/UniversalDelete';
import { Button, TextField, MenuItem, CircularProgress } from '@mui/material';

const rowsPerPageOptions = [10, 20, 50, 100];

interface PutawayHHTDetailsProps {
  job_no: string;
  prin_code: string;
  onAddTallyDetail?: () => void;
  isTabActive?: boolean;
  onClose?: () => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  isEditMode?: boolean;
}

const PutawayHHTDetails = forwardRef<any, PutawayHHTDetailsProps>((props, ref) => {
  const { job_no, prin_code, isTabActive = true, onClose, onSelectionChange } = props;

  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const gridRef = useRef<any>(null);

  const storageKey = `tally_details_selection_${job_no}_${prin_code}`;

  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedRows, setSelectedRows] = useState<TTallyDetails[]>([]);

  const [tallyFormPopup, setTallyFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Edit Tally Details" />,
    data: { existingData: {}, isEditMode: false }
  });

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingRow, setEditingRow] = useState<TTallyDetails | null>(null);
  const [isEditingExistingRow, setIsEditingExistingRow] = useState<boolean>(false);
  const [palletId, setPalletId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [palletProducts, setPalletProducts] = useState<any[]>([]);
  const [availablePallets, setAvailablePallets] = useState<string[]>([]);
  const [locationCodeError, setLocationCodeError] = useState<string>('');
  const [locationCodes, setLocationCodes] = useState<string[]>([]);
  const [siteCodes, setSiteCodes] = useState<string[]>([]);
  const [locationCodesLoading, setLocationCodesLoading] = useState<boolean>(false);

  const { user } = useAuth();

  const getAgGridColumns = (handleActions: any): ColDef[] => [
    { field: 'pallet_id', headerName: 'Pallet ID', minWidth: 120, cellStyle: { fontSize: '12px' } },
    { field: 'location_code', headerName: 'Location Code', minWidth: 120, cellStyle: { fontSize: '12px' } },
    { field: 'prod_name', headerName: 'Product', minWidth: 210, cellStyle: { fontSize: '12px' } },
    { field: 'qty_string', headerName: 'Quantity', minWidth: 125, cellStyle: { fontSize: '12px' } },
    { field: 'batch_no', headerName: 'Batch No.', minWidth: 120, cellStyle: { fontSize: '12px' } },
    { field: 'lot_no', headerName: 'Lot No.', minWidth: 100, cellStyle: { fontSize: '12px' } },
    {
      field: 'mfg_date',
      headerName: 'MFG Date',
      minWidth: 120,
      cellStyle: { fontSize: '12px' },
      valueFormatter: (params: any) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '';
      }
    },
    {
      field: 'exp_date',
      headerName: 'EXP Date',
      minWidth: 120,
      cellStyle: { fontSize: '12px' },
      valueFormatter: (params: any) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '';
      }
    },
    { field: 'container_no', headerName: 'Container Code', minWidth: 150, cellStyle: { fontSize: '12px' } },
    {
      headerName: 'Actions',
      field: 'actions',
      filter: false,
      cellRenderer: (params: any) => {
        // Remove actions for pinned bottom row
        if (params.node?.rowPinned === 'bottom') return null;
        const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
        return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
      },
      minWidth: 120,
      cellStyle: { fontSize: '12px' }
    }
  ];

  const sql_string = `
  SELECT * 
  FROM VW_TI_TALLY_DETAIL 
  WHERE company_code =  '${user?.company_code}'
    AND job_no = '${job_no}' AND
    prin_code = '${prin_code}' 
  ORDER BY updated_at
`;

  const { data: tallyData, refetch: refetchTallyData } = useQuery({
    queryKey: ['tally_details', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string
  });

  const transformedRowData = useMemo(() => {
    if (!tallyData) return [];

    const transformed = tallyData
      .map((row: any, index: number) => {
        // Convert all keys to lowercase to match column definitions
        const lowercaseRow = Object.keys(row).reduce((acc: any, key: string) => {
          acc[key.toLowerCase()] = row[key];
          return acc;
        }, {});

        const transformedRow = {
          ...lowercaseRow,
          packdet_no: lowercaseRow.packdet_no || `temp_${index}`,
          seq_number: lowercaseRow.seq_number !== undefined ? lowercaseRow.seq_number : index,
          _uniqueKey: `${lowercaseRow.packdet_no || `temp_${index}`}_${lowercaseRow.seq_number || index}_${lowercaseRow.prod_code || index}`
        };

        return transformedRow;
      })
      .filter((row: any) => row !== null && row !== undefined);

    return transformed;
  }, [tallyData]);

  const updateSelectionState = useCallback(
    (newSelectedIds: Set<string>) => {
      setSelectedRowIds(newSelectedIds);

      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(newSelectedIds)));
      } catch (error) {
        console.warn('Failed to save selection to localStorage:', error);
      }

      const newSelectedRows = transformedRowData.filter((row: any) => {
        const rowId = `${row.packdet_no}_${row.seq_number}`;
        return newSelectedIds.has(rowId);
      });
      setSelectedRows(newSelectedRows);

      if (onSelectionChange) {
        onSelectionChange(newSelectedRows);
      }
    },
    [storageKey, transformedRowData, onSelectionChange]
  );

  useEffect(() => {
    if (transformedRowData.length > 0) {
      const validIds = new Set(transformedRowData.map((row: any) => `${row.packdet_no}_${row.seq_number}`));
      const cleanedSelection = new Set(Array.from(selectedRowIds).filter((id) => validIds.has(id)));

      if (cleanedSelection.size !== selectedRowIds.size) {
        updateSelectionState(cleanedSelection);
      }
    }
  }, [transformedRowData, selectedRowIds, updateSelectionState]);

  useEffect(() => {
    if (!editingRow && isTabActive === false) {
      setEditModalOpen(true);
      setEditingRow({} as TTallyDetails);
      setPalletId('');
      setSelectedLocation('');
    }
  }, [isTabActive]);

  useEffect(() => {
    if (isTabActive === false) {
      setEditModalOpen(true);
      setEditingRow({} as TTallyDetails);
      setPalletId('');
      setSelectedLocation('');
    }
  }, [isTabActive]);

  useEffect(() => {
    return () => {
      if (isTabActive === false) {
        setEditModalOpen(false);
        setEditingRow(null);
        setPalletId('');
        setSelectedLocation('');
      }
    };
  }, [isTabActive]);

  const handleCloseDelete = () => {
    setDeletePopup(false);
  };

  const handleDelete = async () => {
    const deleteData = selectedRows.map((item) => ({
      prin_code: item.prin_code as string,
      job_no: item.job_no as string,
      packdet_no: item.packdet_no as number,
      seq_number: item.seq_number as number
    }));
    await tallyServiceInstance.deleteTallyDetails(deleteData);
    updateSelectionState(new Set());
    setDeletePopup(false);
    refetchTallyData();
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingRow(null);
    setPalletId('');
    setSelectedLocation('');
    if (onClose && !isTabActive) {
      onClose();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;

    try {
      const success = await PutawayWithPalletIdServiceInstance.Putawaywithpalletid({
        prin_code: prin_code,
        job_no: job_no,
        prod_code: editingRow.prod_code as string,
        packdet_no: String(editingRow.packdet_no),
        pallet_id: palletId,
        location_from: selectedLocation
      });

      if (success) {
        closeEditModal();
        refetchTallyData();
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleEditTally = useCallback(
    (rowData: TTallyDetails) => {
      // Show ALL pallets regardless of allocated flag
      const uniquePallets = [
        ...new Set(
          transformedRowData
            // .filter((row: any) => row.allocated !== "Y") // Commented out - show all pallets
            .map((row: any) => row.pallet_id)
        )
      ].filter(Boolean);
      
      setAvailablePallets(uniquePallets as string[]);

      const productsForPallet = transformedRowData.filter((row: any) => row.pallet_id === rowData.pallet_id);
      setPalletProducts(productsForPallet);

      setEditingRow(rowData);
      setPalletId(rowData.pallet_id || '');
      setSelectedLocation(rowData.location_code || '');
      setIsEditingExistingRow(true);
      setEditModalOpen(true);
    },
    [transformedRowData]
  );

  // Fetch all location codes and site codes for the user's company once
  useEffect(() => {
    async function fetchLocationCodes() {
      setLocationCodesLoading(true);
      try {
        const sql = `SELECT * FROM MS_LOCATION WHERE COMPANY_CODE = '${user?.company_code}'`;
        const res = await WmsSerivceInstance.executeRawSql(sql);
        setLocationCodes(res?.map((loc: any) => loc.LOCATION_CODE || loc.location_code) || []);
        setSiteCodes(res?.map((loc: any) => loc.SITE_CODE || loc.site_code).filter(Boolean) || []);
      } catch {
        setLocationCodes([]);
        setSiteCodes([]);
      } finally {
        setLocationCodesLoading(false);
      }
    }
    if (user?.company_code) fetchLocationCodes();
  }, [user?.company_code]);

  // Validate location code and site code on change
  const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedLocation(value);

    const siteCode = value.slice(0, 2);
    const locationCode = value.slice(2);

    if (siteCode && siteCodes.length > 0 && !siteCodes.includes(siteCode)) {
      setLocationCodeError('Site code does not exist');
      return;
    }

    // Only validate location code if site code is valid
    if (locationCode && locationCodes.length > 0 && !locationCodes.includes(locationCode)) {
      setLocationCodeError('Location code does not exist');
    } else {
      setLocationCodeError('');
    }
  }, [siteCodes, locationCodes]);

  useEffect(() => {
    setToggleFilter(null);
  }, []);

  function handleAgGridSelectionChanged(params: any): void {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedData = selectedNodes?.map((node: any) => node.data) || [];

    // Update selected rows
    setSelectedRows(selectedData);

    // Notify parent component about selection change
    if (onSelectionChange) {
      onSelectionChange(selectedData);
    }
  }

  const handleActions = (action: string, rowData: TTallyDetails) => {
    if (action === 'edit') {
      handleEditTally(rowData);
    } else if (action === 'delete') {
      updateSelectionState(new Set([`${rowData.packdet_no}_${rowData.seq_number}`]));
      setDeletePopup(true);
    }
  };

  function toggleTallyPopup(): void {
    setTallyFormPopup((prev) => ({
      ...prev,
      action: {
        ...prev.action,
        open: !prev.action.open
      }
    }));
  }

  // --- Add helpers for UOM total calculation (similar to PackingDetailsWmsTab) ---

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
  function getSortedUomOrder(rowData: TTallyDetails[], field: keyof TTallyDetails): string[] {
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

  // --- Calculate totals for Quantity (by UOM) ---
  const qtyObjs = transformedRowData.map(row => parseQtyString(row.qty_string));
  const totalQtyObj = sumQtyObjects(qtyObjs);
  const qtyUomOrder = getSortedUomOrder(transformedRowData, 'qty_string');
  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);

  // Create pinned bottom row for ag-Grid
  const pinnedBottomRowData = [
    {
      pallet_id: 'Total:',
      location_code: '',
      product: '',
      qty_string: totalDisplay,
      batch_no: '',
      lot_no: '',
      mfg_date: '',
      exp_date: '',
      container_no: '',
      actions: '',
      quantity: totalDisplay
    }
  ];

  useImperativeHandle(ref, () => ({
    refreshData: () => {
      refetchTallyData();
    },
    clearSelection: () => {
      updateSelectionState(new Set());
    },
    getSelectedRows: () => {
      return Array.from(selectedRows);
    },
    openProcessModal: () => {
      // Open the process modal with empty/default data
      // Show ALL pallets regardless of allocated flag
      const uniquePallets = [
        ...new Set(
          transformedRowData
            // .filter((row: any) => row.allocated !== "Y") // Commented out - show all pallets
            .map((row: any) => row.pallet_id)
        )
      ].filter(Boolean);
      setAvailablePallets(uniquePallets as string[]);
      setEditingRow({} as TTallyDetails);
      setPalletId('');
      setSelectedLocation('');
      setIsEditingExistingRow(false);
      setEditModalOpen(true);
    }
  }));

  return (
    <div className="flex flex-col space-y-2">
      <CustomAgGrid
        ref={gridRef}
        rowHeight={20}
        headerHeight={30}
        rowData={transformedRowData}
        columnDefs={getAgGridColumns(handleActions)}
        onSelectionChanged={handleAgGridSelectionChanged}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={rowsPerPageOptions}
        height="480px"
        editable={false}
        suppressRowClickSelection={false} // Allow row selection
        rowSelection="multiple" // Enable multiple selection
        suppressRowTransform={true}
        animateRows={false}
        reload_data={false}
        getRowId={(params) => `${params.data.packdet_no}_${params.data.seq_number}` || `row_${Math.random()}`}
        pinnedBottomRowData={pinnedBottomRowData}
      />
      {!!tallyFormPopup && tallyFormPopup.action.open && (
        <UniversalDialog
          action={{ ...tallyFormPopup.action }}
          onClose={toggleTallyPopup}
          title={tallyFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddInboundTallyDetailsForm
            job_no={job_no}
            packdet_no={tallyFormPopup?.data.existingData.packdet_no}
            seq_number={tallyFormPopup?.data.existingData.seq_number}
            prin_code={prin_code}
            onClose={toggleTallyPopup}
            isEditMode={tallyFormPopup?.data?.isEditMode}
          />
        </UniversalDialog>
      )}
      {openDeletePopup === true && (
        <UniversalDelete open={openDeletePopup} handleClose={handleCloseDelete} title={selectedRows.length} handleDelete={handleDelete} />
      )}

      {editModalOpen && editingRow && (
        <UniversalDialog
          action={{
            open: editModalOpen,
            fullWidth: true,
            maxWidth: 'md'
          }}
          onClose={closeEditModal}
          title={isEditingExistingRow ? "Edit Process Putaway Details" : "Process Putaway Details"}
          hasPrimaryButton={false}
        >
          <div className="p-4">
            <div className="mb-4">
              <TextField
                select
                fullWidth
                label="Pallet ID"
                value={palletId}
                onChange={(e) => {
                  setPalletId(e.target.value);
                  const productsForPallet = transformedRowData.filter((row: any) => row.pallet_id === e.target.value);
                  setPalletProducts(productsForPallet);
                  // Auto-select the first row with this pallet_id if no specific row is selected
                  if (!editingRow?.packdet_no && productsForPallet.length > 0) {
                    setEditingRow(productsForPallet[0]);
                  }
                }}
                size="small"
                variant="outlined"
              >
                {availablePallets.map((pallet) => (
                  <MenuItem key={pallet} value={pallet}>
                    {pallet}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            {palletId && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Products in Pallet:</h3>
                  <div className="max-h-60 overflow-auto border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Primary Qty.</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Lowest Qty.</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total Qty.</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {palletProducts.map((product, index) => (
                          <tr key={index} className="text-xs">
                            <td className="px-3 py-2">{product.prod_name}</td>
                            <td className="px-3 py-2 text-right">{product.pda_qty_puom || 0}</td>
                            <td className="px-3 py-2 text-right">{product.pda_qty_luom || 0}</td>
                            <td className="px-3 py-2 text-right">{product.quantity || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <TextField
                    fullWidth
                    label="Location Code"
                    value={selectedLocation}
                    onChange={handleLocationChange}
                    size="small"
                    variant="outlined"
                    autoComplete="off"
                    error={!!locationCodeError}
                    helperText={locationCodesLoading ? <CircularProgress size={16} /> : locationCodeError}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outlined"
                onClick={closeEditModal}
                sx={{
                  color: '#666',
                  border: '1.5px solid #666',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    border: '1.5px solid #666'
                  }
                }}
              >
                <FormattedMessage id="Cancel" />
              </Button>

              <Button
                variant="contained"
                onClick={handleSaveEdit}
                disabled={!palletId || !selectedLocation || !!locationCodeError}
                sx={{
                  backgroundColor: '#082A89',
                  '&:hover': {
                    backgroundColor: '#0a2d96'
                  }
                }}
              >
                <FormattedMessage id="Save Changes" />
              </Button>
            </div>
          </div>
        </UniversalDialog>
      )}
    </div>
  );
});

export default PutawayHHTDetails;