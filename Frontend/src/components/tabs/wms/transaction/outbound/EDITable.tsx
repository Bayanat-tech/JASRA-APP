import { ColDef } from 'ag-grid-community';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { DialogPop } from 'components/popup/DIalogPop';
import useAuth from 'hooks/useAuth';
import OrderDetailsForm from 'pages/WMS/Transaction/outbound/OrderDetailsForm';
import { IEDIOrderDetail, TOrderDetail } from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';

import { useEffect, useMemo, useRef, useState } from 'react';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';

interface OrderDetailsFormProps {
  loginid: string;
  job_no: string;
  prin_code: string;
  company_code: string;
}

const EDITable = ({ loginid, job_no, prin_code, company_code }: OrderDetailsFormProps) => {
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
  const [data, setData] = useState<IEDIOrderDetail[]>([]);
  const [editData, setEditData] = useState<TOrderDetail>(defaultInitialValues);
  const initialLoad = useRef(true);

  const [open, setOpen] = useState(false);
  const [modalTitle, setmodalTitle] = useState('Order Details');

  const fetchData = async () => {
    try {
      const response = await OutboundJobServiceInstance.getEDIOrderDetailHandler(loginid ?? '', company_code, prin_code, job_no);
console.log('responsesandeep' ,response)
      if (Array.isArray(response)) {
        setData(response);
      } else if (response) {
        setData([response]);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      fetchData();
    }
  }, []);

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

        await fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    } else {
      console.warn(`Unknown action: ${action}`);
    }
  };

  // Function to close the dialog
  const handleDialogClose = () => setOpen(false);

  const columnDefs: ColDef[] = useMemo(
    () => [

  { headerName: 'Order No', field: 'order_no' },

  { headerName: 'Product Code', field: 'product_code' },
  { headerName: 'PUOM', field: 'puom' },
  { headerName: 'Qty (PUOM)', field: 'qty1' },
  { headerName: 'LUOM', field: 'luom' },
  { headerName: 'Qty (LUOM)', field: 'qty2' },

  { headerName: 'Batch No', field: 'batch_no' },
  { headerName: 'Lot No', field: 'lotno' },
  { headerName: 'Serial No', field: 'serial_no' },
  { headerName: 'Serial Number', field: 'serial_number' },

  { headerName: 'Site Code', field: 'site_code' },
  { headerName: 'Location From', field: 'location_from' },
  { headerName: 'Location To', field: 'location_to' },

  { headerName: 'Customer Code', field: 'cust_code' },
  { headerName: 'Customer Store', field: 'customer_store_name' },
  { headerName: 'Salesman Code', field: 'salesman_code' },

  { headerName: 'Expiry Date From', field: 'expiry_date_from' },
  { headerName: 'Expiry Date To', field: 'expiry_date_to' },
  { headerName: 'MFG Date From', field: 'mfg_date_from' },
  { headerName: 'MFG Date To', field: 'mfg_date_to' },

  { headerName: 'User ID', field: 'user_id' },
  { headerName: 'Created At', field: 'created_at' },
  { headerName: 'Created By', field: 'created_by' },
  { headerName: 'Updated At', field: 'updated_at' },
  { headerName: 'Updated By', field: 'updated_by' },

  { headerName: 'Error Message', field: 'error_msg' },

      {
        headerName: 'Actions',
        field: 'actions',
        pinned: 'right',
        filter: false,
        width: 10,
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
        rowSelection="single"
        rowData={data}
        columnDefs={columnDefs}
        paginationPageSize={1000}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        rowHeight={30}
      />

      {/* Order Detiails Form POP UP */}
      <DialogPop
        open={open}
        onClose={handleDialogClose}
        title={modalTitle}
        width={3000} // You can pass any width value (number or string)
      >
        {/* Your custom content goes here */}
        <div>
          <OrderDetailsForm
            loginid={user?.loginid ?? ''}
            job_no={editData?.job_no ?? ''}
            prin_code={editData?.prin_code ?? ''}
            company_code={editData?.company_code ?? ''}
            editData={editData}
          />
        </div>
      </DialogPop>
    </>
  );
};
export default EDITable;
