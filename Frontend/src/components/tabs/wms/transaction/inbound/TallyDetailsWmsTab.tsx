// import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
// import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import useAuth from 'hooks/useAuth';

import { ColDef } from 'ag-grid-community';
//import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { useEffect, useState, useRef, useCallback } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import AddInboundTallyDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundTallyDetailsForm';
import { TTallyDetails } from 'pages/WMS/Transaction/Inbound/types/tallyDetails.types';
import { FormattedMessage } from 'react-intl';
import tallyServiceInstance from 'service/wms/transaction/inbound/service.tallyDetailsWms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import UniversalDelete from 'components/popup/UniversalDelete';
// import { DeleteOutlined } from '@ant-design/icons';

const rowsPerPageOptions = [10, 20, 50, 100];
/*const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};*/

const TallyDetailsWmsTab = ({
  job_no,
  prin_code,
  onAddTallyDetail
}: {
  job_no: string;
  prin_code: string;
  onAddTallyDetail?: () => void;
}) => {
  //--------------constants----------
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [openDeletePopup, setDeletePopup] = useState<boolean>(false);
  const [, setReloadGrid] = useState<boolean>(false);
  const gridRef = useRef<any>(null);
  
  // Create a unique storage key for this specific job/principal combination
  const storageKey = `tally_details_selection_${job_no}_${prin_code}`;
  
  // Initialize selection state from localStorage or empty
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

  const { user } = useAuth();
  
  // (Removed duplicate declaration of transformedRowData)

  // Stable function to update selection state
  const updateSelectionState = useCallback((newSelectedIds: Set<string>) => {
    setSelectedRowIds(newSelectedIds);
    
    // Persist to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newSelectedIds)));
    } catch (error) {
      console.warn('Failed to save selection to localStorage:', error);
    }
    
    // Update selected rows based on current data
    const newSelectedRows = transformedRowData.filter(row => {
      const rowId = `${row.packdet_no}_${row.seq_number}`;
      return newSelectedIds.has(rowId);
    });
    setSelectedRows(newSelectedRows);
  }, [storageKey]);

  const getAgGridColumns = (handleActions: any): ColDef[] => [
    {
      field: 'prod_name',
      headerName: 'Product',
      minWidth: 340,
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' },
      valueGetter: (params: any) => {
        if (params.node?.rowPinned === 'bottom') return 'Total:';
        const code = params.data.prod_code || '';
        const name = params.data.prod_name || '';
        return code && name ? `${code} - ${name}` : name || code;
      }
    },    { field: 'qty_string', headerName: 'Quantity', minWidth: 125, cellStyle: { fontSize: '12px' } },
    { 
      field: 'quantity', 
      headerName: 'Net Quantity', 
      minWidth: 130, 
      cellStyle: { fontSize: '12px' },
      valueGetter: (params: any) => {
        const quantity = params.data.quantity || '';
        const uom = params.data.pda_puom || '';
        return quantity && uom ? `${quantity} ${uom}` : quantity;
      }
    },
    { field: 'lot_no', headerName: 'Lot No.', minWidth: 100, cellStyle: { fontSize: '12px' } },
    { field: 'container_no', headerName: 'Container Code', minWidth: 150, cellStyle: { fontSize: '12px' } },
    {
      headerName: 'Actions',
      field: 'actions',
      filter: false,
      cellRenderer: (params: any) => {
        // Remove actions for pinned bottom row
        if (params.node?.rowPinned === 'bottom') return null;
        // Hide "edit" button if ALLOCATED is "Y"
        const actionButtons: TAvailableActionButtons[] =
          params.data.allocated === "Y" ? ['delete'] : ['edit', 'delete'];
        return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
      },
      minWidth: 120,
      pinned: 'right',
      cellStyle: { fontSize: '12px' }
    }
  ];

  //----------- useQuery--------------
  const sql_string = `
  SELECT * 
  FROM VW_TI_TALLY_DETAIL 
  WHERE company_code =  '${user?.company_code}'
    AND job_no = '${job_no}' AND
    prin_code = '${prin_code}' 
  ORDER BY updated_at
`;
  //----------- useQuery--------------
  const { data: tallyData, refetch: refetchTallyData } = useQuery({
    queryKey: ['tally_details', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string
  });

  // Transform and validate data to ensure proper row rendering
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
          // Ensure packdet_no is always present and unique
          packdet_no: lowercaseRow.packdet_no || `temp_${index}`,
          seq_number: lowercaseRow.seq_number !== undefined ? lowercaseRow.seq_number : index,
          _uniqueKey: `${lowercaseRow.packdet_no || `temp_${index}`}_${lowercaseRow.seq_number || index}_${lowercaseRow.prod_code || index}`
        };

        return transformedRow;
      })
      .filter((row) => row !== null && row !== undefined);

    return transformed;
  }, [tallyData]);

  // Clean up invalid selections when data changes
  useEffect(() => {
    if (transformedRowData.length > 0) {
      const validIds = new Set(transformedRowData.map(row => `${row.packdet_no}_${row.seq_number}`));
      const cleanedSelection = new Set(
        Array.from(selectedRowIds).filter(id => validIds.has(id))
      );
      
      // Only update if there are invalid selections to remove
      if (cleanedSelection.size !== selectedRowIds.size) {
        updateSelectionState(cleanedSelection);
      }
    }
  }, [transformedRowData, selectedRowIds, updateSelectionState]);

  //-------------handlers---------------
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
    updateSelectionState(new Set()); // Clear selection after delete
    setDeletePopup(false);
    refetchTallyData();
  };

  const handleEditTally = (existingData: TTallyDetails) => {
    setTallyFormPopup({
      action: {
        open: true,
        fullWidth: true,
        maxWidth: 'lg'
      },
      title: <FormattedMessage id="Edit Tally Details" />,
      data: {
        existingData: {
          ...existingData,
          prin_code,
          job_no,
          seq_number: existingData.seq_number // Include seq_number from tally data
        },
        isEditMode: true
      }
    });
  };

  const toggleTallyPopup = (refetchData?: boolean) => {
    if (tallyFormPopup.action.open === true && refetchData) {
      setReloadGrid(true);
      refetchTallyData().then(() => {
        // Remove immediate grid refresh to prevent row disappearing
        setTimeout(() => {
          setReloadGrid(false);
        }, 100);
      });
    }
    setTallyFormPopup({
      action: {
        open: !tallyFormPopup.action.open,
        fullWidth: true,
        maxWidth: 'lg'
      },
      title: <FormattedMessage id="Edit Tally Details" />,
      data: {
        isEditMode: false,
        existingData: {
          prin_code,
          job_no
        }
      }
    });
  };

  const handleDeleteSingle = async (rowData: TTallyDetails) => {
    const deleteData = [
      {
        prin_code: rowData.prin_code as string,
        job_no: rowData.job_no as string,
        packdet_no: rowData.packdet_no as number,
        seq_number: rowData.seq_number as number
      }
    ];
    await tallyServiceInstance.deleteTallyDetails(deleteData);
    // Simplified refresh without forcing grid re-render
    await refetchTallyData();
  };

  const handleActions = (actionType: string, rowOriginal: TTallyDetails) => {
    if (actionType === 'edit') {
      handleEditTally(rowOriginal);
    } else if (actionType === 'delete') {
      handleDeleteSingle(rowOriginal);
    }
  };

  useEffect(() => {
    setToggleFilter(null);
  }, []);

  function handleAgGridSelectionChanged(params: any): void {
    // Keep this for compatibility but rely on manual selection
    console.log('Grid selection event fired');
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

  // --- Replace old total calculation with new UOM-based logic ---

  // Calculate totals for Quantity (by UOM)
  const qtyObjs = transformedRowData.map(row => parseQtyString(row.qty_string));
  const totalQtyObj = sumQtyObjects(qtyObjs);
  const qtyUomOrder = getSortedUomOrder(transformedRowData, 'qty_string');
  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);

  // Create pinned bottom row for ag-Grid
  const pinnedBottomRowData = [
    {
      prod_name: 'Total:', // <-- Use prod_name for the label
      qty_string: totalDisplay,
      quantity: totalDisplay,
      lot_no: '',
      container_no: '',
      actions: ''
    }
  ];

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
        suppressRowClickSelection={true}
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
    </div>
  );
};

export default TallyDetailsWmsTab;