import { ColDef } from 'ag-grid-community';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { DialogPop } from 'components/popup/DIalogPop';
import useAuth from 'hooks/useAuth';
import OrderDetailsForm from 'pages/WMS/Transaction/outbound/OrderDetailsForm';
import { TOrderDetail } from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';

interface OrderDetailsTableProps {
  job_no: string;
  prin_code: string;
  company_code: string;
  refreshTrigger?: number; // Add refresh trigger prop
}

const OrderDetailsTable = ({ job_no, prin_code, company_code, refreshTrigger = 0 }: OrderDetailsTableProps) => {
  const defaultInitialValues: TOrderDetail = {
    company_code: '',
    prin_code: '',
    prod_name: '',
    job_no: '',
    prod_code: '',
    site_code: '',
    p_uom: '',
    qty_puom: 0,
    l_uom: '',
    qty_luom: 0,
    lot_no: '',
    loc_code_from: '',
    loc_code_to: '',
    salesman_code: '',
    expiry_from: new Date(),
    expiry_to: new Date(),
    batch_no: '',
    production_from: new Date(),
    production_to: new Date(),
    order_no: '',
    cust_code: '',
      cust_name: '',
    serial_no: 0,
    created_at: undefined,
    created_by: '',
    updated_at: undefined,
    updated_by: '',
    quantity: 0,
    doc_ref: null,
    po_no: null,
    imp_job_no: null,
    manu_code: null,
    container_no: null,
    unit_price: null,
    picked: null,
    confirmed: null,
    confirmed_date: null,
    uppp: null,
    selected: null,
    aisle_from: null,
    aisle_to: null,
    height_from: null,
    height_to: null,
    column_from: null,
    column_to: null,
    gate_no: null,
    sales_rate: null,
    exp_container_no: null,
    exp_container_size: null,
    exp_container_type: null,
    exp_container_sealno: null,
    moc1: null,
    moc2: null,
    order_serial: null,
    origin_country: null,
    bal_pack_qty: null,
    multi_series: null,
    prod_attrib_code: null,
    prod_grade1: null,
    prod_grade2: null,
    tx_identity_number: null,
    ref_txn_code: null,
    ref_txn_slno: null,
    so_txn_code: null,
    inbound_done: null,
    ref_txn_doc: null,
    supp_code: null,
    supp_reference: null,
    orig_prod_code: null,
    hs_code: null,
    act_order_qty: null,
    bal_order_qty: null,
    minperiod_exppick: 0,
    ignore_minexp_period: null,
    stock_owner: null,
    ind_code: null,
    git_no: null,
    priority: null,
    qty_string: null
  };

  const { user } = useAuth();
  const [data, setData] = useState<TOrderDetail[]>([]);
  const [editData, setEditData] = useState<TOrderDetail>(defaultInitialValues);
  const [refreshKey, setRefreshKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [modalTitle, setmodalTitle] = useState('Order Details');
  const gridRef = useRef<any>(null);
  const prevRefreshTrigger = useRef(refreshTrigger);

  const fetchDataTable = useCallback(async () => {
    try {
      const response = await OutboundJobServiceInstance.getAllOrderDetails(company_code, prin_code, job_no);

      if (Array.isArray(response)) {
        setData(response);
      } else if (response) {
        setData([response]);
      } else {
        setData([]);
      }

      // Refresh the grid if it exists
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.refreshCells();
        gridRef.current.api.redrawRows();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  }, [company_code, prin_code, job_no]);

  useEffect(() => {
    fetchDataTable();
  }, [fetchDataTable]);

  // Add effect to watch for refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== prevRefreshTrigger.current) {
      prevRefreshTrigger.current = refreshTrigger;
      fetchDataTable();
      setRefreshKey((prev) => prev + 1);
    }
  }, [refreshTrigger, fetchDataTable]);

  const handleActions = async (action: string, rowData: any) => {
    if (action === 'edit') {
      console.log('Edit action clicked for row:', rowData);
      setEditData(rowData);
      setmodalTitle('Edit Order Details');
      setOpen(true);
    } else if (action === 'delete') {
      console.log('Delete action clicked for row:', rowData);

      try {
        await OutboundJobServiceInstance.deleteToOrderDetHandler(
          rowData.company_code,
          rowData.prin_code,
          rowData.job_no,
          rowData.serial_no
        );

        await fetchDataTable();
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    } else {
      console.warn(`Unknown action: ${action}`);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    setEditData(defaultInitialValues);
  };

  const handleFormSuccess = () => {
    fetchDataTable();
    setRefreshKey((prev) => prev + 1);
    handleDialogClose();
  };

  const orderDetailcolumnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Sr.No',
        field: 'recordNumber',
        width: 80,
        maxWidth: 80,
        minWidth: 80,
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
      { headerName: 'Product ', field: 'prod_name', cellStyle: { fontSize: '12px' }, width: 300 },
      { headerName: 'Order Number ', field: 'order_no', cellStyle: { fontSize: '12px' }, width: 120 },
      { headerName: 'Quantity', field: 'qty_string', cellStyle: { fontSize: '12px' }, width: 120 },
      { headerName: 'Unit of Measurement', field: 'l_uom', cellStyle: { fontSize: '12px' }, width: 120 },
      { headerName: 'Location From', field: 'loc_code_from', cellStyle: { fontSize: '12px' }, width: 120 },
      { headerName: 'Location To', field: 'loc_code_to', cellStyle: { fontSize: '12px' }, width: 120 },
      {
        headerName: 'Actions',
        field: 'actions',
        pinned: 'right',
        filter: false,
        width: 120,
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    [data]
  );

  return (
    <>
      <CustomAgGrid
        ref={gridRef}
        key={refreshKey}
        rowSelection="single"
        rowData={data}
        columnDefs={orderDetailcolumnDefs}
        height="480px"
        rowHeight={25}
        headerHeight={30}
        paginationPageSize={1000}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        onGridReady={(params) => {
          gridRef.current = params;
        }}
        reload_data={true}
        onCellValueChanged={(params) => {
          console.log('Cell value changed:', params);
          // Handle cell value changes if needed
        }}
        getRowId={(params) => params.data.serial_no.toString()}
        getRowNodeId={(data) => data.serial_no.toString()}
        selectedRows={data.filter((row) => row.selected)}
        suppressRowClickSelection={false}
        rowMultiSelectWithClick={true}
        suppressCellSelection={false}
        suppressRowDeselection={false}
        animateRows={true}
        suppressRowTransform={false}
        suppressColumnVirtualisation={false}
        suppressScrollOnNewData={false}
      />

      {/* Order Details Form POP UP */}
      <DialogPop open={open} onClose={handleDialogClose} title={modalTitle} width={1000}>
        <div>
          <OrderDetailsForm
            loginid={user?.loginid ?? ''}
            job_no={editData?.job_no ?? job_no}
            prin_code={editData?.prin_code ?? prin_code}
            company_code={editData?.company_code ?? company_code}
            editData={editData}
            onSuccess={handleFormSuccess}
            onCancel={handleDialogClose}
          />
        </div>
      </DialogPop>
    </>
  );
};

export default OrderDetailsTable;
