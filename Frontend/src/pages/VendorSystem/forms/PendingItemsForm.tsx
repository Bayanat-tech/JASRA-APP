import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import { ColDef } from 'ag-grid-community';
import VendorSerivceInstance from 'service/wms/service.vendor';



interface PendingItemsFormProps {
  requestNumber: string;
  docNo: string | number;
  headerAcCode: string;
  isViewMode?: boolean;
  hideUploadButton?: boolean;
  onClose: () => void;
  onAddPendingItems: (rows: any[]) => void; // NEW
}

const PendingItemsForm: React.FC<PendingItemsFormProps> = ({
  docNo,
  headerAcCode,
  onClose,
  onAddPendingItems, // NEW
}) => {
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [gridApi, setGridApi] = useState<any>(null);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      const sql = `
        SELECT *
        FROM VW_VM_LPO_DTL_PENDING_AWARE
        WHERE DOC_NO = (
          SELECT REF_DOC_NO
          FROM TR_AC_LPO_HEADER
          WHERE DOC_NO = ${docNo}
        )
        AND HEADER_AC_CODE = '${headerAcCode}'
        AND SERIAL_NO NOT IN (
          SELECT SERIAL_NO
          FROM TR_AC_LPO_DETAIL
          WHERE HEADER_AC_CODE = '${headerAcCode}'
            AND DOC_NO = ${docNo}
        )
        ORDER BY SERIAL_NO
      `;

      const res = await VendorSerivceInstance.executeRawSql(sql);
      setPendingData(res || []);
    } catch (error) {
      console.error('Error fetching pending items:', error);
    }
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      suppressMenu: true,
      sortable: false,
      filter: false
    },
    { field: 'SERIAL_NO', headerName: 'Sr No', width: 90 },
    { field: 'REMARKS', headerName: 'Description', flex: 1, minWidth: 380, maxWidth: 400 },
    { field: 'PRICE', headerName: 'Price', width: 100 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'CURR_CODE', headerName: 'Currency', width: 100 },
    { field: 'EX_RATE', headerName: 'Ex Rate', width: 100 },
    { field: 'baseAmt', headerName: 'Base Amt', width: 100 },
  ], []);

  const handleSave = () => {
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) return;

    onAddPendingItems(selectedRows); // Pass selected rows to parent
    onClose(); // Close dialog
  };

  return (
    <Box sx={{ mt: 1, p: 1, border: '1px solid #d0d0d0', borderRadius: '6px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', height: 400 }}>
      <Box sx={{ flex: 1, overflow: 'auto', border: '1px solid #d0d0d0', borderRadius: '4px' }}>
        <div className="ag-theme-alpine" style={{ minHeight: '100%', width: '100%' }}>
          <VendorCustomGrid
            columnDefs={columnDefs}
            rowData={pendingData}
            pagination={false}
            rowHeight={30}
            rowSelection="multiple"
            onGridReady={(params: any) => setGridApi(params.api)}
            defaultColDef={{ sortable: true, filter: true, resizable: true }}
          />
        </div>
      </Box>

      <Box sx={{ textAlign: 'right', mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89',
              boxShadow: 'none',
            },
          }}
        >
          Save
        </Button>

        <Button variant="outlined" onClick={onClose}
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89',
              boxShadow: 'none',
            },
          }}>
          Close
        </Button>
      </Box>
    </Box>
  );
};
export default PendingItemsForm;