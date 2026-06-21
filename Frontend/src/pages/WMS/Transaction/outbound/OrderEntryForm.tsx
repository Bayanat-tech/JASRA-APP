// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useEffect, useState } from 'react';
// import { Autocomplete, TextField } from '@mui/material';
// import { FormattedMessage } from 'react-intl';
// import SendIcon from '@mui/icons-material/Send';

// import BlueButton from 'components/buttons/BlueButton';
// import { IToOrderEntry } from './types/jobOutbound_wms.types';
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// import dayjs, { Dayjs } from 'dayjs';
// import OrderEntryServiceInstance from 'service/wms/transaction/outbound/service.orderentryWms';
// import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
// import { useQuery } from '@tanstack/react-query';
// import { TCurrency } from 'pages/WMS/types/currency-wms.types';
// import WmsSerivceInstance from 'service/service.wms';
// import { useSelector } from 'store';

// interface OrderEntryFormProps {
//   onSubmit: (data: IToOrderEntry) => void;
//   handleOrderEntryClose: () => void;
//   jobData: IToOrderEntry | null;
//   editOrderData?: IToOrderEntry;
// }

// const OrderEntryForm: React.FC<OrderEntryFormProps> = React.memo(({ onSubmit, jobData, editOrderData, handleOrderEntryClose }) => {
//   const defaultOrderValues = React.useMemo<IToOrderEntry>(
//     () => ({
//       id: 0,
//       company_code: jobData ? jobData.company_code : '',
//       prin_code: jobData ? jobData.prin_code : '',
//       job_no: jobData ? jobData.job_no : '',
//       cust_code: '001',
//       order_no: 'TST20230003',
//       order_date: new Date(),
//       order_due_date: new Date(),
//       curr_code: 'QAR',
//       ex_rate: 1.0,
//       uoc: 'EA',
//       moc1: '0',
//       moc2: '0',
//       exp_container_no: 'TCLU1234567',
//       exp_container_size: null,
//       exp_container_type: 'DRY',
//       exp_container_sealno: 'SEAL12345',
//       cust_reference: 'REF-2023-001',
//       pack_start: null,
//       pack_end: null,
//       load_start: null,
//       load_end: null,
//       po_no: null,
//       po_date: null,
//       act_code: null,
//       volume: null,
//       net_weight: null,
//       assigned_pda_user: null,
//       order_serial: null,
//       ref_txn_code: null,
//       ref_txn_docno: null,
//       ref_txn_slno: null,
//       so_txn_code: null,
//       delivery_term: null,
//       salesman_code: null,
//       recollected_flag: '',
//       recollected_dt: null,
//       recollected_remarks: null,
//       stuff_start: null,
//       stuff_end: null,
//       pick_start: null,
//       pick_end: null,
//       allow_doc_gen: null,
//       pre_so: null,
//       assigned_pack_user: null,
//       order_location: null,
//       route_code: null,
//       manifest_no: null,
//       vehicle_no: null,
//       order_load_seq_nr: null
//     }),
//     [jobData]
//   ); // Only recalculate when jobData changes
//   const { app } = useSelector((state) => state.menuSelectionSlice);
//   const [orderEntryData, setOrderEntryData] = useState<IToOrderEntry>(defaultOrderValues);
//   const [ButtonText, setButtonText] = useState<string>('Add');
//   const [custCode, setCustCode] = useState<any>('');

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setOrderEntryData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDateChange = (newValue: Dayjs | null) => {
//     setOrderEntryData({
//       ...orderEntryData,
//       order_date: newValue?.toDate() || null // or newValue?.format() if you want a string
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       if (editOrderData?.id) {
//         await OrderEntryServiceInstance.updateSingleOrderEntry(orderEntryData.id, orderEntryData);
//         await OrderEntryServiceInstance.getOrderentry(orderEntryData.job_no);
//         setOrderEntryData(defaultOrderValues);
//         handleOrderEntryClose();
//       } else {
//         onSubmit(orderEntryData);
//         handleOrderEntryClose();
//       }
//     } catch (error) {
//       console.error('Update failed:', error);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (editOrderData?.id && editOrderData.id !== 0) {
//         const response = await OutboundJobServiceInstance.getddPrinceCustomer(editOrderData.company_code, editOrderData.prin_code);
//         console.log('update response', response);
//         setCustCode(response);
//         setOrderEntryData(editOrderData);
//         setButtonText('Update');
//       } else if (jobData) {
//         const response = await OutboundJobServiceInstance.getddPrinceCustomer(jobData.company_code, jobData.prin_code);
//         console.log('add response', response);
//         setCustCode(response);
//         setOrderEntryData({
//           ...defaultOrderValues,
//           company_code: jobData.company_code,
//           prin_code: jobData.prin_code,
//           job_no: jobData.job_no
//         });
//         setButtonText('Add');
//       }
//     };

//     fetchData();
//   }, [editOrderData]);

//   const { data: currencyList } = useQuery({
//     queryKey: ['currency_data'],
//     queryFn: async () => {
//       const response = await WmsSerivceInstance.getMasters(app, 'currency', undefined, undefined);
//       if (response) {
//         return {
//           tableData: response.tableData as TCurrency[],
//           count: response.count
//         };
//       }
//       return { tableData: [], count: 0 };
//     }
//   });

//   return (
//     <div>
//       {/* Order Information Section */}
//       <div className="mb-8">
//         <h2 className="text-sm font-bold text-gray-800 pb-3">Order Information</h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Customer Details Column */}
//           <div className="space-y-4">
//             <Autocomplete
//               options={Array.isArray(custCode) ? custCode : []}
//               getOptionLabel={(option) => option?.cust_name || ''}
//               isOptionEqualToValue={(option, value) => option?.cust_code === value?.cust_code}
//               value={Array.isArray(custCode) ? custCode.find((option) => option?.cust_code === orderEntryData.cust_code) : null}
//               onChange={(_, newValue) => {
//                 setOrderEntryData((prev) => ({
//                   ...prev,
//                   cust_code: newValue?.cust_code || ''
//                 }));
//               }}
//               renderInput={(params) => <TextField {...params} label="Customer Code" variant="outlined" fullWidth size="small" />}
//             />

//             <TextField
//               label="Order Number"
//               id="order-number"
//               name="order_no"
//               value={orderEntryData.order_no}
//               onChange={handleInputChange}
//               fullWidth
//               size="small"
//             />
//           </div>

//           {/* Date Column */}
//           <div className="space-y-4">
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Order Date"
//                 name="order_date"
//                 format="DD/MM/YYYY"
//                 value={dayjs(orderEntryData.order_date || new Date())}
//                 onChange={handleDateChange}
//                 slotProps={{ textField: { size: 'small', fullWidth: true } }}
//               />
//             </LocalizationProvider>

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Order Due Date"
//                 name="order_due_date"
//                 format="DD/MM/YYYY"
//                 value={dayjs(orderEntryData.order_due_date || new Date())}
//                 onChange={handleDateChange}
//                 slotProps={{ textField: { size: 'small', fullWidth: true } }}
//               />
//             </LocalizationProvider>
//           </div>

//           {/* Currency Column */}
//           <div className="space-y-4">
//             <Autocomplete
//               options={currencyList?.tableData ?? []}
//               getOptionLabel={(option) => option?.curr_name || ''}
//               isOptionEqualToValue={(option, value) => option?.curr_code === value?.curr_code}
//               value={currencyList?.tableData.find((option) => option.curr_code === orderEntryData.curr_code) || null}
//               onChange={(_, newValue) => {
//                 setOrderEntryData((prev) => ({
//                   ...prev,
//                   curr_code: newValue?.curr_code || ''
//                 }));
//               }}
//               renderInput={(params) => <TextField {...params} label="Currency" variant="outlined" fullWidth size="small" />}
//             />

//             <TextField
//               label="Exchange Rate"
//               id="exchange-rate"
//               name="ex_rate"
//               value={orderEntryData.ex_rate}
//               onChange={handleInputChange}
//               fullWidth
//               size="small"
//             />
//           </div>
//         </div>

//            {/* Customer Reference & Timing */}

//         <div className="mt-8">
//           <h2 className="text-sm font-bold text-gray-800 pb-3 ">Timing & Reference</h2>
//           <div className="space-y-4">
//             <TextField
//               label="Customer Reference"
//               id="customer-reference"
//               name="cust_reference"
//               value={orderEntryData.cust_reference}
//               onChange={handleInputChange}
//               fullWidth
//               size="small"
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <TextField
//                 label="Pack Start"
//                 id="pack-start"
//                 name="pack_start"
//                 value={orderEntryData.pack_start}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="Pack End"
//                 id="pack-end"
//                 name="pack_end"
//                 value={orderEntryData.pack_end}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <TextField
//                 label="Load Start"
//                 id="load-start"
//                 name="load_start"
//                 value={orderEntryData.load_start}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="Load End"
//                 id="load-end"
//                 name="load_end"
//                 value={orderEntryData.load_end}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//         {/* UOC/Measurement Section */}
//         <div>
//           <h2 className="text-sm font-bold text-gray-800 pb-3">UOC/Measurement</h2>

//           <div className="space-y-4">
//             <TextField label="UOC" id="uoc" name="uoc" value={orderEntryData.uoc} onChange={handleInputChange} fullWidth size="small" />

//             <div className="grid grid-cols-2 gap-4">
//               <TextField
//                 label="MOC1"
//                 id="moc1"
//                 name="moc1"
//                 value={orderEntryData.moc1}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="MOC2"
//                 id="moc2"
//                 name="moc2"
//                 value={orderEntryData.moc2}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//             </div>
//           </div>
//         </div> 

//            {/* Export Container Details */}
//         <div>
//           <h2 className="text-sm font-bold text-gray-800 pb-3 ">Export Container Details</h2>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <TextField
//                 label="Container Number"
//                 id="container-number"
//                 name="exp_container_no"
//                 value={orderEntryData.exp_container_no}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="Container Type"
//                 id="container-type"
//                 name="exp_container_type"
//                 value={orderEntryData.exp_container_type}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <TextField
//                 label="Container Size"
//                 id="container-size"
//                 name="exp_container_size"
//                 value={orderEntryData.exp_container_size}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//               <TextField
//                 label="Seal Number"
//                 id="seal-number"
//                 name="exp_container_sealno"
//                 value={orderEntryData.exp_container_sealno}
//                 onChange={handleInputChange}
//                 fullWidth
//                 size="small"
//               />
//             </div>
//           </div>
//         </div>     
       
//       </div>

    

//       {/* Submit Button */}
//       <div className="flex justify-end mt-2">
//         <BlueButton
//           variant="contained"
//           color="primary"
//           size="medium"
//           onClick={handleSubmit}
//           startIcon={<SendIcon />}
//         >
//           <FormattedMessage id={ButtonText} />
//         </BlueButton>
//       </div>
//     </div>
//   );
// });

// export default OrderEntryForm;
