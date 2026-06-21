import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import BlueButton from 'components/buttons/BlueButton';
import MyAgGrid from 'components/grid/MyAgGrid';
// import dayjs from 'dayjs';
import { useMemo, useRef, useState } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
// import { useSelector } from 'store';

const CancelPicking = ({ job_no, prin_code }: { job_no: string; prin_code: string }) => {
  // ag grid state
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  //----------- useQuery--------------
  const sql_string = `
 SELECT * FROM VW_WM_OUB_PICK_TO_CONFIRM WHERE JOB_NO = '${job_no}' AND  PRIN_CODE = '${prin_code}'
`;

  const { data: jobCofirmData, refetch: refetchjobCofirmData } = useQuery({
    queryKey: ['jobCofirmData', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string)
  });

  // Then decide how to handle them (use the first, latest, or join them)
  // Toggle picking popup
  const togglePickingPopup = async () => {
    try {
      const keyNos = Object.values(selectedRows).map((row) => row.key_number);
      const response = await OutboundJobServiceInstance.oubcancelPick(keyNos, job_no, prin_code, 'Y   ');

      if (response) {
        refetchjobCofirmData();
        return true;
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  // ag grid columns
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'checkbox',
        width: 100, // Fixed width
        maxWidth: 40, // Ensures it can't expand
        minWidth: 40, // Ensures it can't shrink smaller
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        sortable: false,
        filter: false,
        suppressMenu: true,
        resizable: false, // Prevent manual resizing
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any
      },
      {
        headerName: 'No',
        field: 'recordNumber',
        width: 80,
        maxWidth: 80,
        minWidth: 60,
        cellStyle: {
          fontSize: '12px',
          textAlign: 'center'
        } as any,
        suppressMenu: true,
        sortable: false,
        filter: false,
        valueGetter: (params: any) => {
          return (params.node?.rowIndex ?? 0) + 1;
        }
      },
      { headerName: 'Order Number ', field: 'ORDER_NO', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Customer ', field: 'CUST_NAME', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Product ', field: 'PROD_NAME', cellStyle: { fontSize: '12px' }, width: 300, minWidth: 350 },
      { headerName: 'Site Code ', field: 'SITE_CODE', cellStyle: { fontSize: '12px' }, width: 300, minWidth: 120 },
      { headerName: 'Location From', field: 'LOCATION_CODE', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Location To', field: 'LOCATION_CODE', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Quantity', field: 'QUANTITY', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Batch Number', field: 'BATCH_NO', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Lot Number', field: 'LOT_NO', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      // { headerName: 'UPPP', field: 'batch_no', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      // {
      //   headerName: 'Production From',
      //   field: 'production_from',
      //   cellStyle: { fontSize: '12px' },
      //   width: 150,
      //   minWidth: 150,
      //   valueFormatter: (params: any) => {
      //     const date = dayjs(params.value);
      //     return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
      //   }
      // },
      // {
      //   headerName: 'Production to',
      //   field: 'production_to',
      //   cellStyle: { fontSize: '12px' },
      //   width: 150,
      //   minWidth: 150,
      //   valueFormatter: (params: any) => {
      //     const date = dayjs(params.value);
      //     return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
      //   }
      // },
      // {
      //   headerName: 'Expiry From',
      //   field: 'expiry_from',
      //   cellStyle: { fontSize: '12px' },
      //   width: 150,
      //   minWidth: 150,
      //   valueFormatter: (params: any) => {
      //     const date = dayjs(params.value);
      //     return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
      //   }
      // },
      // {
      //   headerName: 'Expiry To',
      //   field: 'expiry_to',
      //   cellStyle: { fontSize: '12px' },
      //   width: 150,
      //   minWidth: 150,
      //   valueFormatter: (params: any) => {
      //     const date = dayjs(params.value);
      //     return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
      //   }
      // },
      // {
      //   headerName: 'Actual Quantity',
      //   field: 'act_order_qty',
      //   cellStyle: { fontSize: '12px', textAlign: 'right' } as any,
      //   width: 150,
      //   minWidth: 150
      // }
    ],
    []
  );

  const gridRef = useRef<AgGridReact>(null);

  const onSelectionChanged = () => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node: { data: any }) => node.data);
      setSelectedRows(selectedData);
    }
  };

  // Custom filter component for selecting preference and triggering the picking popup
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end pt-2 pl-2">
        <BlueButton onClick={togglePickingPopup} size="small" disabled={!(Object.keys(selectedRows).length > 0)}>
          Cancel Picking
        </BlueButton>
      </div>

      <MyAgGrid
        ref={gridRef}
        rowSelection="multiple"
        rowData={jobCofirmData || []}
        columnDefs={columnDefs}
        height="480px"
        rowHeight={25}
        headerHeight={30}
        paginationPageSize={10}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100]}
        onSelectionChanged={onSelectionChanged}
      />
    </div>
  );
};

export default CancelPicking;
