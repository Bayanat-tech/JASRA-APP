import { DeleteOutlined } from '@ant-design/icons';
import { IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import UniversalDialog from 'components/popup/UniversalDialog';
import AddInboundReceivingDetailsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundReceivingDetailsForm';
import { FormattedMessage } from 'react-intl';
import { useState, useMemo } from 'react';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import WmsServiceInstance from 'service/wms/service.wms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';

interface Props {
  job_no: string;
  prin_code: string;
  company_code: string;
}

const ReceivingDetailsWmsTab = ({ job_no, prin_code, company_code }: Props) => {
  const [receivingFormPopup, setReceivingFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Receiving Details" />,
    data: { existingData: {}, isEditMode: false }
  });

  const rowsPerPageOptions = [10, 20, 50, 100];
  const [paginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[3] });

  const sql_string = `
    SELECT * 
    FROM VW_WM_INB_PACKDET_DETS 
    WHERE company_code = '${company_code}'
      AND job_no = '${job_no}' 
      AND prin_code = '${prin_code}' 
    ORDER BY updated_at
  `;

  const { data: receivingData, refetch } = useQuery({
    queryKey: ['receiving_details', sql_string],
    queryFn: () => WmsServiceInstance.executeRawSql(sql_string),
    enabled: !!job_no && !!sql_string
  });

  const transformedRowData: TPackingDetails[] = useMemo(() => {
    if (!receivingData || !Array.isArray(receivingData)) return [];

    return receivingData
      .filter((row: any) => {
        if (!row || typeof row !== 'object') return false;

        const meaningfulFields = [
          'PROD_CODE', 'prod_code', 
          'QTY_STRING', 'qty_string', 
          'CONTAINER_NO', 'container_no', 
          'PO_NO', 'po_no', 
          'BL_NO', 'bl_no', 
          'LOT_NO', 'lot_no'
        ];
        return meaningfulFields.some((field) => {
          const value = row[field];
          return value !== null && value !== undefined && (typeof value === 'string' ? value.trim() !== '' : Boolean(value));
        });
      })
      .map((row: any) => ({
        ...row,
        _hasError: !!(row.error_msg || row.ERROR_MSG)
      }));
  }, [receivingData]);

  // const getCellRenderer = (field: string) => (params: any) => {
  //   return params.value || '';
  // };
  const [, setDeleteRowData] = useState<TPackingDetails | null>(null);
  const [, setDeletePopup] = useState<boolean>(false);

  const handleSingleDelete = (row: TPackingDetails) => {
    setDeleteRowData(row);
    setDeletePopup(true);
  };

  const getAgGridColumns = (handleActions: any): ColDef[] => [
    {
      field: 'PROD_NAME',
      headerName: 'Product',
      minWidth: 320,
      valueGetter: (params) => params.data?.PROD_NAME || params.data?.prod_name || '',
      cellStyle: { display: 'flex', alignItems: 'center' , fontSize: '12px' },
    },
    {
      field: 'QTY_STRING',
      headerName: 'Quantity',
      minWidth: 200,
      valueGetter: (params) => params.data?.QTY_STRING || params.data?.qty_string || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'QUANTITY',
      headerName: 'Net Quantity',
      minWidth: 150,
      cellRenderer: (params: any) => {
        const value = params.data?.QUANTITY ?? params.data?.quantity ?? '';
        const lUom = params.data?.L_UOM || params.data?.l_uom || '';
        return `${value}${lUom ? ` ${lUom}` : ''}`;
      },
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'QTY_ARRIVED_STRING',
      headerName: 'Arrived Qty.',
      minWidth: 150,
      valueGetter: (params) => params.data?.QTY_ARRIVED_STRING || params.data?.qty_arrived_string || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'QTY_NETARRIVED_STRING',
      headerName: 'Net Arrived Qty.',
      minWidth: 150,
      valueGetter: (params) => params.data?.QTY_NETARRIVED_STRING || params.data?.qty_netarrived_string || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'BATCH_NO',
      headerName: 'Batch No.',
      minWidth: 100,
      valueGetter: (params) => params.data?.BATCH_NO || params.data?.batch_no || '',
      cellStyle: { display: 'flex', alignItems: 'center' , fontSize: '12px' },
    },
    {
      field: 'LOT_NO',
      headerName: 'Lot No.',
      minWidth: 100,
      valueGetter: (params) => params.data?.LOT_NO || params.data?.lot_no || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'PO_NO',
      headerName: 'PO No.',
      minWidth: 120,
      valueGetter: (params) => params.data?.PO_NO || params.data?.po_no || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      field: 'DOC_REF',
      headerName: 'Doc Ref No.',
      minWidth: 120,
      valueGetter: (params) => params.data?.DOC_REF || params.data?.doc_ref || '',
      cellStyle: { display: 'flex', alignItems: 'center', fontSize: '12px' }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      pinned: 'right',
      cellRenderer: (params: any) => {
        if (
          params.data &&
          (
            (params.data.PROD_NAME && typeof params.data.PROD_NAME === 'object' && params.data.PROD_NAME.props?.children === 'Total:') ||
            (params.data.prod_name && typeof params.data.prod_name === 'object' && params.data.prod_name.props?.children === 'Total:') ||
            params.node?.rowPinned
          )
        ) return null;

        const isAllocated = (params.data?.ALLOCATED === "Y" || params.data?.allocated === "Y");
        const actionButtons: TAvailableActionButtons[] = isAllocated ? [] : ['edit'];

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {!isAllocated && (
              <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />
            )}
            {!isAllocated && (
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
      minWidth: 100,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }
    }
  ];

  const toggleReceivingPopup = (rowData?: any) => {
    setReceivingFormPopup((prev) => ({
      ...prev,
      data: {
        isEditMode: !!rowData,
        existingData: rowData
          ? {
              ...rowData,
              // Extract packdet_no from either uppercase or lowercase
              packdet_no: rowData.PACKDET_NO || rowData.packdet_no,
              // Extract product info
              prod_code: rowData.PROD_CODE || rowData.prod_code,
              prod_name: rowData.PROD_NAME || rowData.prod_name,
              // Extract UOM info
              p_uom: rowData.P_UOM || rowData.p_uom,
              l_uom: rowData.L_UOM || rowData.l_uom,
              uppp: rowData.UPPP || rowData.uppp || 1,
              uom_count: (rowData.UPPP || rowData.uppp) > 1 ? 2 : 1,
              // Extract quantities
              qty1_arrived: rowData.QTY_PUOM || rowData.qty_puom || 0,
              qty2_arrived: rowData.QTY_LUOM || rowData.qty_luom || 0,
              quantity: rowData.QUANTITY || rowData.quantity || 0,
              // Other fields
              container_no: rowData.CONTAINER_NO || rowData.container_no,
              batch_no: rowData.BATCH_NO || rowData.batch_no,
              lot_no: rowData.LOT_NO || rowData.lot_no,
              po_no: rowData.PO_NO || rowData.po_no,
              doc_ref: rowData.DOC_REF || rowData.doc_ref
            }
          : { prin_code, job_no },
      },
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const handleClose = () => {
    toggleReceivingPopup();
    refetch();
  };

  const handleActions = (actionType: string, rowData: any) => {
    actionType === 'edit' && toggleReceivingPopup(rowData);
  };

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

  // Calculate totals - handle both uppercase and lowercase field names
  const qtyObjs = transformedRowData.map(row => parseQtyString((row as any).QTY_STRING || row.qty_string));
  const arrivedQtyObjs = transformedRowData.map(row => parseQtyString((row as any).QTY_ARRIVED_STRING || row.qty_arrived_string));
  const netArrivedQtyObjs = transformedRowData.map(row => parseQtyString((row as any).QTY_NETARRIVED_STRING || row.qty_netarrived_string));
  const netQtyObjs = transformedRowData.map(row => parseQtyString((row as any).QTY_NETQTY_STRING || row.qty_netqty_string));

  const totalQtyObj = sumQtyObjects(qtyObjs);
  const totalArrivedQtyObj = sumQtyObjects(arrivedQtyObjs);
  const totalNetArrivedQtyObj = sumQtyObjects(netArrivedQtyObjs);
  const totalNetQtyObj = sumQtyObjects(netQtyObjs);

  // Helper function to get UOM order for both field name formats
  const getUomOrderForField = (fieldName: string) => {
    return getSortedUomOrder(
      transformedRowData.map(r => ({ 
        ...r, 
        [fieldName]: r[fieldName.toUpperCase() as keyof TPackingDetails] || r[fieldName as keyof TPackingDetails]
      })), 
      fieldName as keyof TPackingDetails
    );
  };

  const qtyUomOrder = getUomOrderForField('qty_string');
  const arrivedUomOrder = getUomOrderForField('qty_arrived_string');
  const netArrivedUomOrder = getUomOrderForField('qty_netarrived_string');
  const netQtyUomOrder = getUomOrderForField('qty_netqty_string');

  const totalDisplay = qtyObjToString(totalQtyObj, qtyUomOrder);
  const totalArrivedQtyDisplay = qtyObjToString(totalArrivedQtyObj, arrivedUomOrder);
  const totalNetArrivedQtyDisplay = qtyObjToString(totalNetArrivedQtyObj, netArrivedUomOrder);
  const totalNetQtyDisplay = qtyObjToString(totalNetQtyObj, netQtyUomOrder);

  // Create pinned bottom row - include both field name formats
  const pinnedBottomRowData = [
    {
      PROD_NAME: <span style={{ fontWeight: 'bold' }}>Total:</span>,
      prod_name: <span style={{ fontWeight: 'bold' }}>Total:</span>,
      QTY_STRING: totalDisplay,
      qty_string: totalDisplay,
      QUANTITY: totalNetQtyDisplay,
      quantity: totalNetQtyDisplay,
      QTY_ARRIVED_STRING: totalArrivedQtyDisplay,
      qty_arrived_string: totalArrivedQtyDisplay,
      QTY_NETARRIVED_STRING: totalNetArrivedQtyDisplay,
      qty_netarrived_string: totalNetArrivedQtyDisplay,
      LOT_NO: '',
      lot_no: '',
      CONTAINER_NO: '',
      container_no: '',
      PO_NO: '',
      po_no: '',
      DOC_REF: '',
      doc_ref: '',
      actions: null
    }
  ];

  return (
    <>
      <CustomAgGrid
        rowHeight={20}
        headerHeight={30}
        rowData={transformedRowData}
        columnDefs={getAgGridColumns(handleActions)}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={rowsPerPageOptions}
        height="480px"
        editable={false}
        getRowId={(params: any) => {
          const data = params.data;
          const packdetNo = data?.PACKDET_NO || data?.packdet_no;
          const jobNo = data?.JOB_NO || data?.job_no;
          const prodCode = data?.PROD_CODE || data?.prod_code;
          return packdetNo ? `${jobNo}-${packdetNo}` : `${prodCode || 'unknown'}-${Math.random()}`;
        }}
        pinnedBottomRowData={pinnedBottomRowData}
      />

      {receivingFormPopup.action.open && (
        <UniversalDialog
          action={receivingFormPopup.action}
          onClose={toggleReceivingPopup}
          title={receivingFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddInboundReceivingDetailsForm
            job_no={job_no}
            packdet_no={receivingFormPopup.data.existingData.packdet_no}
            prin_code={prin_code}
            initialData={receivingFormPopup.data.existingData || {}}
            onClose={handleClose}
            isEditMode={receivingFormPopup.data.isEditMode}
          />
        </UniversalDialog>
      )}
    </>
  );
};

export default ReceivingDetailsWmsTab;