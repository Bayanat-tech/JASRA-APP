// // components/forms/OrderEntryForm.tsx
// import React from 'react';
// import { Formik, Form, useFormikContext, Field } from 'formik';
// import * as Yup from 'yup';
// import { Autocomplete, TextField, Button } from '@mui/material';
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs from 'dayjs';

// import { IToOrderEntry } from './types/jobOutbound_wms.types';
// import { TCurrency } from 'pages/WMS/types/currency-wms.types';

// interface OrderEntryFormProps {
//   mode: 'create' | 'edit';
//   initialData: IToOrderEntry | null;
//   rowData: any;
//   customerOptions: any[];
//   currencyOptions: TCurrency[];
//   onSuccess: () => void;
//   onCancel: () => void;
//   isSubmitting?: boolean;
  
// }

// // Form content component
// const OrderEntryFormContent: React.FC<{
//   onCancel: () => void;
//   customerOptions: any[];
//   currencyOptions: TCurrency[];
//   isEditing: boolean;
// }> = ({ onCancel, customerOptions, currencyOptions, isEditing }) => {
//   const { values, errors, touched, setFieldValue, isSubmitting } = useFormikContext<IToOrderEntry>();

//   return (
//     <Form>
//       {/* Order Information Section */}
//       <div className="mb-8">
//         <h2 className="text-sm font-bold text-gray-800 pb-3">Order Information</h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Customer Details Column */}
//           <div className="space-y-4">
//             <Autocomplete
//               options={customerOptions}
//               getOptionLabel={(option) => `${option.cust_code} - ${option.cust_name}`}
//               value={customerOptions.find((option) => option.cust_code === values.cust_code) || null}
//               onChange={(_, newValue) => {
//                 setFieldValue('cust_code', newValue?.cust_code || '');
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Customer Code"
//                   variant="outlined"
//                   fullWidth
//                   size="small"
//                   error={touched.cust_code && Boolean(errors.cust_code)}
//                   helperText={touched.cust_code && errors.cust_code}
//                 />
//               )}
//             />

//             <Field
//               as={TextField}
//               label="Order Number"
//               name="order_no"
//               fullWidth
//               size="small"
//               error={touched.order_no && Boolean(errors.order_no)}
//               helperText={touched.order_no && errors.order_no}
//             />
//           </div>

//           {/* Date Column */}
//           <div className="space-y-4">
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Order Date"
//                 value={dayjs(values.order_date)}
//                 onChange={(newValue) => setFieldValue('order_date', newValue?.toDate())}
//                 slotProps={{
//                   textField: {
//                     size: 'small',
//                     fullWidth: true,
//                     error: touched.order_date && Boolean(errors.order_date),
//                     helperText: touched.order_date && errors.order_date
//                   }
//                 }}
//               />
//             </LocalizationProvider>

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 label="Order Due Date"
//                 value={dayjs(values.order_due_date)}
//                 onChange={(newValue) => setFieldValue('order_due_date', newValue?.toDate())}
//                 slotProps={{
//                   textField: {
//                     size: 'small',
//                     fullWidth: true,
//                     error: touched.order_due_date && Boolean(errors.order_due_date),
//                     helperText: touched.order_due_date && errors.order_due_date
//                   }
//                 }}
//               />
//             </LocalizationProvider>
//           </div>

//           {/* Currency Column */}
//           <div className="space-y-4">
//             <Autocomplete
//               options={currencyOptions}
//               getOptionLabel={(option) => `${option.curr_code} - ${option.curr_name}`}
//               value={currencyOptions.find((option) => option.curr_code === values.curr_code) || null}
//               onChange={(_, newValue) => {
//                 setFieldValue('curr_code', newValue?.curr_code || '');
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Currency"
//                   variant="outlined"
//                   fullWidth
//                   size="small"
//                   error={touched.curr_code && Boolean(errors.curr_code)}
//                   helperText={touched.curr_code && errors.curr_code}
//                 />
//               )}
//             />

//             <Field
//               as={TextField}
//               label="Exchange Rate"
//               name="ex_rate"
//               type="number"
//               fullWidth
//               size="small"
//               error={touched.ex_rate && Boolean(errors.ex_rate)}
//               helperText={touched.ex_rate && errors.ex_rate}
//             />
//           </div>
//         </div>

//         {/* Customer Reference & Timing */}
//         <div className="mt-8">
//           <h2 className="text-sm font-bold text-gray-800 pb-3">Timing & Reference</h2>
//           <div className="space-y-4">
//             <Field as={TextField} label="Customer Reference" name="cust_reference" fullWidth size="small" />

//             <div className="grid grid-cols-2 gap-4">
//               <Field as={TextField} label="Pack Start" name="pack_start" fullWidth size="small" />
//               <Field as={TextField} label="Pack End" name="pack_end" fullWidth size="small" />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Field as={TextField} label="Load Start" name="load_start" fullWidth size="small" />
//               <Field as={TextField} label="Load End" name="load_end" fullWidth size="small" />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//         {/* UOC/Measurement Section */}
//         <div>
//           <h2 className="text-sm font-bold text-gray-800 pb-3">UOC/Measurement</h2>
//           <div className="space-y-4">
//             <Field as={TextField} label="UOC" name="uoc" fullWidth size="small" />

//             <div className="grid grid-cols-2 gap-4">
//               <Field as={TextField} label="MOC1" name="moc1" fullWidth size="small" />
//               <Field as={TextField} label="MOC2" name="moc2" fullWidth size="small" />
//             </div>
//           </div>
//         </div>

//         {/* Export Container Details */}
//         <div>
//           <h2 className="text-sm font-bold text-gray-800 pb-3">Export Container Details</h2>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <Field as={TextField} label="Container Number" name="exp_container_no" fullWidth size="small" />
//               <Field as={TextField} label="Container Type" name="exp_container_type" fullWidth size="small" />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Field as={TextField} label="Container Size" name="exp_container_size" fullWidth size="small" />
//               <Field as={TextField} label="Seal Number" name="exp_container_sealno" fullWidth size="small" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Button */}
//       <div className="flex justify-end mt-2 space-x-2">
//         <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
//           Cancel
//         </Button>
//         <Button variant="contained" type="submit" disabled={isSubmitting}>
//           {isEditing ? 'Update' : 'Add'}
//         </Button>
//       </div>
//     </Form>
//   );
// };

// // Validation Schema
// const orderEntryValidationSchema = Yup.object().shape({
//   cust_code: Yup.string().required('Customer code is required'),
//   order_no: Yup.string().required('Order number is required'),
//   order_date: Yup.date().required('Order date is required'),
//   order_due_date: Yup.date().required('Order due date is required').min(Yup.ref('order_date'), 'Due date cannot be before order date'),
//   curr_code: Yup.string().required('Currency is required'),
//   ex_rate: Yup.number().required('Exchange rate is required').positive('Exchange rate must be positive'),
//   exp_container_no: Yup.string().required('Container number is required'),
//   exp_container_sealno: Yup.string().required('Seal number is required')
// });

// const NewOrderForm: React.FC<OrderEntryFormProps> = ({
//   mode,
//   initialData,
//   rowData,
//   customerOptions,
//   currencyOptions,
//   onSuccess,
//   onCancel,
//   isSubmitting = false
// }) => {
//   // Default values
//   const defaultOrderValues: IToOrderEntry = React.useMemo(
//     () => ({
//       id: 0,
//       company_code: rowData?.company_code || '',
//       prin_code: rowData?.prin_code || '',
//       job_no: rowData?.job_no || '',
//       cust_code: '',
//       order_no: '',
//       order_date: new Date(),
//       order_due_date: new Date(),
//       curr_code: 'QAR',
//       ex_rate: 1.0,
//       uoc: 'EA',
//       moc1: '0',
//       moc2: '0',
//       exp_container_no: '',
//       exp_container_size: null,
//       exp_container_type: 'DRY',
//       exp_container_sealno: '',
//       cust_reference: '',
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
//     [rowData]
//   );

//   // Get initial values based on mode
//   const getInitialValues = (): IToOrderEntry => {
//     if (mode === 'edit' && initialData) {
//       return {
//         ...defaultOrderValues,
//         ...initialData,
//         order_date: initialData.order_date ? new Date(initialData.order_date) : new Date(),
//         order_due_date: initialData.order_due_date ? new Date(initialData.order_due_date) : new Date()
//       };
//     }
//     return defaultOrderValues;
//   };

//   const handleSubmit = async (values: IToOrderEntry, { setSubmitting }: any) => {
//     try {
//       // This should be handled by the parent component through the dialog
//       onSuccess();
//     } catch (error) {
//       console.error('Form submission failed:', error);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Formik initialValues={getInitialValues()} validationSchema={orderEntryValidationSchema} onSubmit={handleSubmit} enableReinitialize>
//       <OrderEntryFormContent
//         onCancel={onCancel}
//         customerOptions={customerOptions}
//         currencyOptions={currencyOptions}
//         isEditing={mode === 'edit'}
//       />
//     </Formik>
//   );
// };

// export default NewOrderForm;
