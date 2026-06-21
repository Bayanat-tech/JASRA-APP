/* eslint-disable react-hooks/exhaustive-deps */
import { Button, TextField } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { IEDIOrderDetail } from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';
import { useEffect, useState } from 'react';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';

interface OrderProps {
  data?: IEDIOrderDetail;
  title?: string;
  isEditMode?: boolean;
}

const NewOrder: React.FC<OrderProps> = ({ data, title, isEditMode }) => {
  const initialOrderDetail: IEDIOrderDetail = {
    company_code: 'BSG', // default as per comment
    prin_code: '', // required field, empty string as default
    job_no: '', // required field, empty string as default
    product_code: '', // required field, empty string as default
    site_code: undefined,
    puom: undefined,
    qty1: undefined,
    luom: undefined,
    qty2: undefined,
    lotno: undefined,
    location_from: undefined,
    location_to: undefined,
    salesman_code: undefined,
    expiry_date_from: undefined,
    expiry_date_to: undefined,
    batch_no: undefined,
    mfg_date_from: undefined,
    mfg_date_to: undefined,
    customer_store_name: undefined,
    order_no: '', // required field, empty string as default
    cust_code: '', // required field, empty string as default
    serial_no: 1, // start with 1 or your preferred default
    serial_number: '-', // default as per comment
    created_at: undefined,
    created_by: undefined,
    updated_at: undefined,
    updated_by: undefined,
    user_id: undefined,
    error_msg: undefined
  };

  const [order, setOrder] = useState<IEDIOrderDetail>(initialOrderDetail);

  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      [name]: value
    }));
  };

  const handleSubmit = (order: IEDIOrderDetail) => {
    OutboundJobServiceInstance.upsertEDIOrderDetailHandler(order);
  };

  const getEDIOrderDetail = async (
    userLoginId: string,
    companyCode: string,
    prinCode: string,
    jobNo: string,
    setOrder: (order: IEDIOrderDetail) => void,
    initialOrderDetail: IEDIOrderDetail
  ) => {
    try {
      const fetchedData = await OutboundJobServiceInstance.getEDIOrderDetailHandler(userLoginId, companyCode, prinCode, jobNo);
      if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
        setOrder(fetchedData[0]);
      } else {
        setOrder(initialOrderDetail);
      }
    } catch (error) {
      setOrder(initialOrderDetail);
    }
  };

  useEffect(() => {
    getEDIOrderDetail(
      user?.loginid ?? '',
      data?.company_code ?? '',
      data?.prin_code ?? '',
      data?.job_no ?? '',
      setOrder,
      initialOrderDetail
    );
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 p-2 ">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Batch Number"
            name="batch_no"
            variant="outlined"
            value={order.batch_no}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Company Code"
            name="company_code"
            variant="outlined"
            value={order.company_code}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Customer Code"
            name="cust_code"
            variant="outlined"
            value={order.cust_code}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Serial Number"
            name="serial_no"
            variant="outlined"
            value={order.serial_no}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            label="Customer/Store Name"
            name="container_no"
            variant="outlined"
            value={order.customer_store_name}
            onChange={handleInputChange}
            fullWidth
          />

          <TextField label="Job Number" name="job_no" variant="outlined" value={order.job_no} onChange={handleInputChange} fullWidth />

          <TextField label="L UOM" name="l_uom" variant="outlined" value={order.luom} onChange={handleInputChange} fullWidth />

          <TextField label="Lot Number" name="lot_no" variant="outlined" value={order.lotno} onChange={handleInputChange} fullWidth />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Order Number"
            name="order_no"
            variant="outlined"
            value={order.order_no}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField label="P UOM" name="p_uom" variant="outlined" value={order.puom} onChange={handleInputChange} fullWidth />
          <TextField
            label="Principle Code"
            name="prin_code"
            variant="outlined"
            value={order.prin_code}
            onChange={handleInputChange}
            fullWidth
          />
        </div>
        <div className="items-center justify-center">
          <Button variant="contained" color="primary" onClick={() => handleSubmit(order)}>
            Submit
          </Button>
        </div>
      </div>
    </>
  );
};
export default NewOrder;
