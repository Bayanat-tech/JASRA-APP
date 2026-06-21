// import { ArrowLeftOutlined, DownCircleOutlined, PlusOutlined, RightCircleOutlined, UploadOutlined } from '@ant-design/icons';
// import {
//   AppBar,
//   Autocomplete,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   InputAdornment,
//   Menu,
//   MenuItem,
//   Modal,
//   Paper,
//   Radio,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
//   useTheme
// } from '@mui/material';
// import PickingDetailsWmsTab from 'components/tabs/wms/transaction/outbound/PickingDetailsWmsTab';
// // import OrderEntryWmsTab from 'components/tabs/wms/transaction/outbound/OrderEntryWmsTab';
// import useAuth from 'hooks/useAuth';
// import { useEffect, useMemo, useRef, useState } from 'react';
// import { FormattedMessage } from 'react-intl';
// import { useLocation, useNavigate, useParams } from 'react-router';
// import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';
// import { dispatch, useSelector } from 'store';
// import { TPair } from 'types/common';
// import ErrorBoundary from 'utils/ErrorHandlers/Erroroundary';
// import { getPathNameList } from 'utils/functions';
// import * as XLSX from 'xlsx';
// import { IEDIOrderDetail, IToOrderEntry, TOrderDetail } from './types/jobOutbound_wms.types';
// import { Alert, Progress } from 'antd';
// import OrderEntryServiceInstance from 'service/wms/transaction/outbound/service.orderentryWms';
// import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
// import { openSnackbar } from 'store/reducers/snackbar';
// import axiosServices from 'utils/axios';
// import { IApiResponse } from 'types/types.services';
// import { DialogPop } from 'components/popup/DIalogPop';
// import EDITable from 'components/tabs/wms/transaction/outbound/EDITable';
// import JobConfirmation from 'components/tabs/wms/transaction/outbound/JobConfirmation';
// import React from 'react';
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { useQuery } from '@tanstack/react-query';
// import BlueButton from 'components/buttons/BlueButton';
// import dayjs from 'dayjs';
// import { SearchIcon, SendIcon } from 'lucide-react';
// import { TCurrency } from 'pages/WMS/types/currency-wms.types';
// import WmsSerivceInstance from 'service/service.wms';
// import CustomAgGrid from 'components/grid/CustomAgGrid';
// import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
// import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
// import { ColDef } from 'ag-grid-community';
// import { Field, Form, Formik, useFormikContext } from 'formik';
// import * as Yup from 'yup';
// import MyAgGrid from 'components/grid/MyAgGrid';

// interface OrderDetailsFormProps {
//   loginid: string;
//   job_no: string;
//   prin_code: string;
//   company_code: string;
//   editData: any;
//   onSuccess?: () => void;
//   onCancel?: () => void;
//   refetchTableOrderDetailsData: () => void;
// }

// const OrderDetailsFormContent = ({
//   onCancel,
//   siteOptions,
//   orderEntryOptions,
//   custCode,
//   locOption,
//   LotNum,
//   isEditing,
//   onProductSelect
// }: {
//   onCancel: () => void;
//   siteOptions: any[];
//   orderEntryOptions: any[];
//   custCode: any[];
//   locOption: any[];
//   LotNum: any[];
//   isEditing: boolean;
//   onProductSelect: () => void;
// }) => {
//   const { values, errors, touched, setFieldValue, handleChange, isSubmitting } = useFormikContext<TOrderDetail>();

//   const calculateQuantity = (currentValues: TOrderDetail) => {
//     return (currentValues.qty_puom || 0) + (currentValues.qty_luom || 0);
//   };

//   return (
//     <Form>
//       <div className="grid grid-cols-1 gap-4">
//         {/* Order Number and Product */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="grid grid-cols-2 gap-4">
//             <Autocomplete
//               options={orderEntryOptions || []}
//               getOptionLabel={(option) => option?.order_no || ''}
//               isOptionEqualToValue={(option, value) => option?.order_no === value?.order_no}
//               value={orderEntryOptions.find((option) => option.order_no === values.order_no) || null}
//               onChange={(_, newValue) => {
//                 setFieldValue('order_no', newValue?.order_no || '');
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Order Number"
//                   variant="outlined"
//                   fullWidth
//                   size="small"
//                   error={touched.order_no && Boolean(errors.order_no)}
//                   helperText={touched.order_no && errors.order_no}
//                 />
//               )}
//             />

//             <Autocomplete
//               options={custCode}
//               value={custCode.find((option) => option?.cust_code === values.cust_code) || null}
//               getOptionLabel={(option) => option?.cust_name || ''}
//               isOptionEqualToValue={(option, value) => option?.cust_code === value?.cust_code}
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
//           </div>
//           <div>
//             <Field
//               as={TextField}
//               fullWidth
//               size="small"
//               name="prod_code"
//               label="Product"
//               variant="outlined"
//               value={values.prod_code}
//               onChange={handleChange}
//               InputProps={{
//                 readOnly: true,
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton edge="end" onClick={onProductSelect} size="small">
//                       <SearchIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//             />
//           </div>
//         </div>

//         {/* Site and Locations */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex flex-col gap-4">
//             <Autocomplete
//               options={siteOptions || []}
//               getOptionLabel={(option) => option?.SITE_CODE || ''}
//               isOptionEqualToValue={(option, value) => option?.SITE_CODE === value?.site_code}
//               value={siteOptions.find((option) => option.SITE_CODE === values.site_code) || null}
//               onChange={async (_, newValue) => {
//                 const selectedSiteCode = newValue?.SITE_CODE || '';
//                 setFieldValue('site_code', selectedSiteCode);
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Site Code"
//                   variant="outlined"
//                   fullWidth
//                   size="small"
//                   error={touched.site_code && Boolean(errors.site_code)}
//                   helperText={touched.site_code && errors.site_code}
//                 />
//               )}
//             />

//             <Autocomplete
//               options={locOption}
//               getOptionLabel={(option) => option?.LOCATION_CODE || ''}
//               isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
//               value={locOption.find((option) => option.LOCATION_CODE === values.loc_code_from) || null}
//               onChange={(_, newValue) => {
//                 setFieldValue('loc_code_from', newValue?.LOCATION_CODE || '');
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Location From"
//                   variant="outlined"
//                   fullWidth
//                   size="small"
//                   error={touched.loc_code_from && Boolean(errors.loc_code_from)}
//                   helperText={touched.loc_code_from && errors.loc_code_from}
//                 />
//               )}
//             />

//             <Autocomplete
//               options={locOption}
//               getOptionLabel={(option) => option?.LOCATION_CODE || ''}
//               isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.loc_code_to}
//               value={locOption.find((option) => option.LOCATION_CODE === values.loc_code_to) || null}
//               onChange={(_, newValue) => {
//                 setFieldValue('loc_code_to', newValue?.LOCATION_CODE || '');
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Location To"
//                   variant="outlined"
//                   fullWidth
//                   size="small"
//                   error={touched.loc_code_to && Boolean(errors.loc_code_to)}
//                   helperText={touched.loc_code_to && errors.loc_code_to}
//                 />
//               )}
//             />
//           </div>

//           {/* Quantity and UOM */}
//           <div className="flex flex-col gap-4">
//             <div className="grid grid-cols-2 gap-4">
//               <Field
//                 as={TextField}
//                 fullWidth
//                 size="small"
//                 name="qty_puom"
//                 label="Primary Quantity"
//                 type="number"
//                 variant="outlined"
//                 value={values.qty_puom}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                   handleChange(e);
//                   setFieldValue(
//                     'quantity',
//                     calculateQuantity({
//                       ...values,
//                       qty_puom: Number(e.target.value)
//                     })
//                   );
//                 }}
//                 error={touched.qty_puom && Boolean(errors.qty_puom)}
//                 helperText={touched.qty_puom && errors.qty_puom}
//               />

//               <Field
//                 as={TextField}
//                 fullWidth
//                 size="small"
//                 name="p_uom"
//                 label="Primary UOM"
//                 variant="outlined"
//                 value={values.p_uom}
//                 InputProps={{ readOnly: true }}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Field
//                 as={TextField}
//                 fullWidth
//                 size="small"
//                 name="qty_luom"
//                 label="Lowest Quantity"
//                 type="number"
//                 variant="outlined"
//                 value={values.qty_luom}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                   handleChange(e);
//                   setFieldValue(
//                     'quantity',
//                     calculateQuantity({
//                       ...values,
//                       qty_luom: Number(e.target.value)
//                     })
//                   );
//                 }}
//               />

//               <Field
//                 as={TextField}
//                 fullWidth
//                 size="small"
//                 name="l_uom"
//                 label="Lowest UOM"
//                 variant="outlined"
//                 value={values.l_uom}
//                 InputProps={{ readOnly: true }}
//               />
//             </div>

//             <Field
//               as={TextField}
//               fullWidth
//               size="small"
//               name="quantity"
//               variant="outlined"
//               value={isEditing ? values.quantity : calculateQuantity(values)}
//               InputProps={{
//                 readOnly: true,
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Typography color="textSecondary" variant="body2">
//                       Quantity
//                     </Typography>
//                   </InputAdornment>
//                 ),
//                 inputProps: { style: { textAlign: 'right', paddingRight: '8px' } }
//               }}
//             />
//           </div>
//         </div>

//         {/* Other Fields */}
//         <div className="grid grid-cols-3 gap-4">
//           <Autocomplete
//             options={LotNum}
//             getOptionLabel={(option) => option?.LOT_NO || ''}
//             isOptionEqualToValue={(option, value) => option?.LOT_NO === value?.LOT_NO}
//             value={values.lot_no ? { LOT_NO: values.lot_no } : null}
//             onChange={(_, newValue) => {
//               setFieldValue('lot_no', newValue?.LOT_NO || '');
//             }}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Lot Number"
//                 variant="outlined"
//                 fullWidth
//                 size="small"
//                 error={touched.lot_no && Boolean(errors.lot_no)}
//                 helperText={touched.lot_no && errors.lot_no}
//               />
//             )}
//           />

//           <Field
//             as={TextField}
//             fullWidth
//             size="small"
//             name="batch_no"
//             label="Batch Number"
//             variant="outlined"
//             value={values.batch_no}
//             onChange={handleChange}
//           />

//           <Field
//             as={TextField}
//             fullWidth
//             size="small"
//             name="salesman_code"
//             label="Salesman Code"
//             variant="outlined"
//             value={values.salesman_code}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end mt-8 gap-4">
//           <Button variant="outlined" onClick={onCancel} size="small">
//             Cancel
//           </Button>
//           <BlueButton type="submit" disabled={isSubmitting} size="small">
//             {isEditing ? 'Update' : 'Add'}
//           </BlueButton>
//         </div>
//       </div>
//     </Form>
//   );
// };

// // Add this before OrderDetailsForm component
// const ProductSelectionDialog = ({
//   open,
//   onClose,
//   prodOptions,
//   onProductSelect
// }: {
//   open: boolean;
//   onClose: () => void;
//   prodOptions: any[];
//   onProductSelect: (product: any) => void;
// }) => {
//   const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

//   const RadioCellRenderer = (params: any) => {
//     const isSelected = params.node.isSelected();

//     const handleChange = () => {
//       params.api.forEachNode((node: any) => {
//         node.setSelected(false);
//       });
//       params.node.setSelected(true);
//       params.api.refreshCells({ force: true });
//     };

//     return (
//       <Radio
//         checked={isSelected}
//         onChange={handleChange}
//         color="primary"
//         size="small"
//         value={params.node.id}
//         sx={{
//           padding: '0',
//           '&.Mui-checked': {
//             color: 'primary.main'
//           }
//         }}
//       />
//     );
//   };

//   const columnDefs: ColDef[] = useMemo(
//     () => [
//       {
//         headerName: 'Select',
//         field: 'checkbox',
//         width: 10,
//         cellRenderer: RadioCellRenderer,
//         cellStyle: { display: 'flex', justifyContent: 'center' } as any,
//         minWidth: 10,
//         maxWidth: 30,
//         suppressMenu: true,
//         sortable: false,
//         filter: false
//       },
//       // { headerName: 'Product Code ', field: 'PROD_CODE', width: 100, minWidth: 100, cellStyle: { fontSize: '12px' } },
//       { headerName: 'Product Name ', field: 'PROD_NAME', width: 200, minWidth: 200, cellStyle: { fontSize: '12px' } },
//       { headerName: 'P_UOM ', field: 'P_UOM', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
//       { headerName: 'L_UOM ', field: 'L_UOM', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
//       { headerName: 'UPPP ', field: 'UPPP', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
//       { headerName: 'UPP', field: 'UPP', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } }
//     ],
//     []
//   );

//   return (
//     <DialogPop open={open} onClose={onClose} title="Product Selection" width={1000}>
//       <MyAgGrid
//         rowSelection="single"
//         rowData={prodOptions}
//         columnDefs={columnDefs}
//         paginationPageSize={1000}
//         pagination={true}
//         paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
//         height="480px"
//         rowHeight={25}
//         headerHeight={30}
//         onSelectionChanged={(params) => {
//           const selectedNode = params.api.getSelectedNodes()[0];
//           if (selectedNode) {
//             setSelectedProduct(selectedNode.data);
//           }
//         }}
//       />
//       <div className="flex justify-end mt-4">
//         <BlueButton
//           onClick={() => {
//             if (selectedProduct) {
//               onProductSelect(selectedProduct);
//             }
//           }}
//         >
//           OK
//         </BlueButton>
//       </div>
//     </DialogPop>
//   );
// };

// const OrderDetailsForm = ({
//   loginid,
//   job_no,
//   prin_code,
//   company_code,
//   editData,
//   onSuccess,
//   onCancel,
//   refetchTableOrderDetailsData
// }: OrderDetailsFormProps) => {
//   const formikRef = useRef<any>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [siteOptions, setSiteOptions] = useState<any[]>([]);
//   const [orderEntryOptions, setOrderOptions] = useState<any[]>([]);
//   const [custCode, setCustCode] = useState<any[]>([]);
//   const [LotNum, setLotnum] = useState<any[]>([]);
//   const [locOption, setLocOptions] = useState<any[]>([]);
//   const [prodOptions, setProdOptions] = useState<any[]>([]);
//   const [openProductDialog, setOpenProductDialog] = useState(false);

//   // Default initial values
//   const defaultInitialValues: TOrderDetail = {
//     company_code: company_code || 'BSG',
//     prin_code: prin_code || '',
//     job_no: job_no || '',
//     prod_code: '',
//     prod_name: '',
//     site_code: '',
//     p_uom: '',
//     qty_puom: 0,
//     l_uom: '',
//     qty_luom: 0,
//     lot_no: '',
//     loc_code_from: '',
//     loc_code_to: '',
//     salesman_code: '',
//     expiry_from: new Date(),
//     expiry_to: new Date(),
//     batch_no: '',
//     production_from: new Date(),
//     production_to: new Date(),
//     order_no: '',
//     cust_code: '',
//     serial_no: 0,
//     created_at: undefined,
//     created_by: '',
//     updated_at: undefined,
//     updated_by: '',
//     quantity: 0,
//     doc_ref: null,
//     po_no: null,
//     imp_job_no: null,
//     manu_code: null,
//     container_no: null,
//     unit_price: null,
//     picked: null,
//     confirmed: null,
//     confirmed_date: null,
//     uppp: null,
//     selected: null,
//     aisle_from: null,
//     aisle_to: null,
//     height_from: null,
//     height_to: null,
//     column_from: null,
//     column_to: null,
//     gate_no: null,
//     sales_rate: null,
//     exp_container_no: null,
//     exp_container_size: null,
//     exp_container_type: null,
//     exp_container_sealno: null,
//     moc1: null,
//     moc2: null,
//     order_serial: null,
//     origin_country: null,
//     bal_pack_qty: null,
//     multi_series: null,
//     prod_attrib_code: null,
//     prod_grade1: null,
//     prod_grade2: null,
//     tx_identity_number: null,
//     ref_txn_code: null,
//     ref_txn_slno: null,
//     so_txn_code: null,
//     inbound_done: null,
//     ref_txn_doc: null,
//     supp_code: null,
//     supp_reference: null,
//     orig_prod_code: null,
//     hs_code: null,
//     act_order_qty: null,
//     bal_order_qty: null,
//     minperiod_exppick: 0,
//     ignore_minexp_period: null,
//     stock_owner: null,
//     ind_code: null,
//     git_no: null,
//     priority: null
//   };

//   // Transform keys to lowercase for consistency
//   const transformKeysToLowerCase = (obj: any): TOrderDetail => {
//     if (!obj) return defaultInitialValues;

//     const result: any = {};
//     Object.keys(obj).forEach((key) => {
//       const lowerCaseKey = key.toLowerCase();
//       result[lowerCaseKey] = obj[key];
//     });

//     // Ensure all required fields are present
//     return { ...defaultInitialValues, ...result };
//   };

//   // Get initial values based on editData
//   const getInitialValues = (): TOrderDetail => {
//     if (editData && editData.serial_no && editData.serial_no > 0) {
//       setIsEditing(true);
//       return transformKeysToLowerCase(editData);
//     }
//     setIsEditing(false);
//     return defaultInitialValues;
//   };

//   // Fetch dropdown data
//   const fetchDropdownData = async () => {
//     try {
//       const [siteResponse, orderEntryResponse, locationResponse, custResponse, lotResponse] = await Promise.all([
//         OutboundJobServiceInstance.getddSiteCode(),
//         OrderEntryServiceInstance.getOrderentry(job_no || ''),
//         WmsSerivceInstance.getddLocationCode(),
//         OutboundJobServiceInstance.getddPrinceCustomer(company_code, prin_code),
//         OutboundJobServiceInstance.getddLotNum()
//       ]);

//       setSiteOptions(siteResponse || []);
//       setOrderOptions(orderEntryResponse || []);
//       setLocOptions(locationResponse || []);
//       setCustCode(custResponse || []);
//       setLotnum(lotResponse || []);
//     } catch (error) {
//       console.error('Error fetching dropdown data:', error);
//     }
//   };

//   // Fetch product data
//   const fetchProductData = async () => {
//     try {
//       dispatch(openBackdrop());
//       const effectiveCompanyCode = company_code?.trim() || editData?.company_code?.trim() || '';
//       const effectivePrinCode = prin_code?.trim() || editData?.prin_code?.trim() || '';

//       const prodResponse = await WmsSerivceInstance.getddPrinceProduct(effectiveCompanyCode, effectivePrinCode);

//       setProdOptions(prodResponse || []);
//       dispatch(closeBackdrop());
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       dispatch(closeBackdrop());
//     }
//   };

//   useEffect(() => {
//     fetchDropdownData();
//   }, [company_code, prin_code, job_no]);

//   // Handle product selection
//   const handleProductSelect = (product: any) => {
//     if (formikRef.current) {
//       formikRef.current.setFieldValue('prod_code', product.PROD_CODE || '');
//       formikRef.current.setFieldValue('prod_name', product.PROD_NAME || '');
//       formikRef.current.setFieldValue('p_uom', product.P_UOM || '');
//       formikRef.current.setFieldValue('l_uom', product.L_UOM || '');
//     }
//     setOpenProductDialog(false);
//   };

//   // Handle form submission
//   const handleSubmit = async (values: TOrderDetail, { setSubmitting }: any) => {
//     try {
//       console.log('Form submitted:', values);

//       // Prepare data for submission
//       const submitData = {
//         ...values,
//         login_id: loginid,
//         created_by: isEditing ? values.created_by : loginid,
//         updated_by: loginid,
//         created_at: isEditing ? values.created_at : new Date(),
//         updated_at: new Date()
//       };

//       await OutboundJobServiceInstance.upsertOutboundOrderDetailManualHandler(submitData);

//       if (onSuccess) {
//         onSuccess();
//       }

//       refetchTableOrderDetailsData();

//       dispatch(
//         openSnackbar({
//           open: true,
//           message: `Order details ${isEditing ? 'updated' : 'created'} successfully`,
//           variant: 'alert',
//           alert: { color: 'success' },
//           close: true
//         })
//       );
//     } catch (error) {
//       console.error('Error in form submission:', error);
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: `Failed to ${isEditing ? 'update' : 'create'} order details`,
//           variant: 'alert',
//           alert: { color: 'error' },
//           close: true
//         })
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Validation schema
//   const orderDetailsValidationSchema = Yup.object().shape({
//     order_no: Yup.string().required('Order Number is required'),
//     cust_code: Yup.string().required('Customer Code is required'),
//     prod_code: Yup.string().required('Product Code is required'),
//     site_code: Yup.string().required('Site Code is required'),
//     loc_code_from: Yup.string().required('Location From is required'),
//     loc_code_to: Yup.string().required('Location To is required'),
//     qty_puom: Yup.number()
//       .required('Primary Quantity is required')
//       .typeError('Primary Quantity must be a number')
//       .min(0.01, 'Primary Quantity must be at least 0.01')
//       .test('total-quantity', 'Total quantity must be greater than 0', function (value) {
//         const { qty_luom } = this.parent;
//         return (value || 0) + (qty_luom || 0) > 0;
//       })
//   });

//   return (
//     <div>
//       <Formik
//         innerRef={formikRef}
//         enableReinitialize={true}
//         initialValues={getInitialValues()}
//         validationSchema={orderDetailsValidationSchema}
//         onSubmit={handleSubmit}
//       >
//         {({ isSubmitting, setFieldValue, values }) => (
//           <>
//             <OrderDetailsFormContent
//               onCancel={onCancel || (() => {})}
//               siteOptions={siteOptions}
//               orderEntryOptions={orderEntryOptions}
//               custCode={custCode}
//               locOption={locOption}
//               LotNum={LotNum}
//               isEditing={isEditing}
//               onProductSelect={() => {
//                 fetchProductData();
//                 setOpenProductDialog(true);
//               }}
//             />
//           </>
//         )}
//       </Formik>

//       <ProductSelectionDialog
//         open={openProductDialog}
//         onClose={() => setOpenProductDialog(false)}
//         prodOptions={prodOptions}
//         onProductSelect={handleProductSelect}
//       />
//     </div>
//   );
// };

// // Order Entry Form Component
// const OrderEntryForm = ({
//   initialValues,
//   onSubmit,
//   onCancel,
//   customerOptions,
//   currencyOptions,
//   isEditing
// }: {
//   initialValues: IToOrderEntry;
//   onSubmit: (values: IToOrderEntry) => Promise<void>;
//   onCancel: () => void;
//   customerOptions: any[];
//   currencyOptions: TCurrency[];
//   isEditing: boolean;
// }) => {
//   const { setFieldValue, values, errors, touched } = useFormikContext<IToOrderEntry>();

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
//         <Button variant="outlined" onClick={onCancel}>
//           Cancel
//         </Button>
//         <BlueButton variant="contained" type="submit" startIcon={<SendIcon />}>
//           {isEditing ? 'Update' : 'Add'}
//         </BlueButton>
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

// const OutboundJobTabsWmsPage = () => {
//   //--------------------------constants------------------------
//   const { user } = useAuth();
//   // Extract user permissions and permissions object from useAuth hook
//   const { user_permission, permissions } = useAuth();
//   // Hook to navigate programmatically
//   const navigate = useNavigate();
//   // Hook to get the current location object
//   const location = useLocation();
//   const rowData = location.state?.rowData;
//   // Hook to get the current theme
//   const theme = useTheme();
//   // Get the list of path names from the current location pathname
//   const pathNameList = getPathNameList(location.pathname);
//   // Extract the selected app from the Redux store
//   const { app } = useSelector((state: any) => state.menuSelectionSlice);
//   // Extract tab and id parameters from the URL
//   const { tab, id } = useParams();
//   const availableTabs: TPair<''>[] = [
//     { label: 'Order Entry', value: 'order_entry' },
//     { label: 'Order Details', value: 'order_details' },
//     { label: 'Picking Details', value: 'picking_details' },
//     { label: 'Cancel Picking', value: 'cancel_picking' },
//     { label: 'Job Confirmation', value: 'job_confirmation' },
//     { label: 'Services & Activities', value: 'services_activities' },
//     { label: 'Job Costing', value: 'job_costing' }
//   ];

//   const [selectedTab, setSelectedTab] = useState<string>('order_entry');
//   const [editOrderData, setEditOrderData] = useState<IToOrderEntry>();

//   // State for import modal
//   const [importModalOpen, setImportModalOpen] = useState(false);
//   const [viewModal, setViewModal] = useState(false);
//   const [importFile, setImportFile] = useState<File | null>(null);
//   const [percent, setPercent] = useState(0);

//   const handleClose = () => {
//     setViewModal(false);
//   };

//   const [open, setOpen] = useState(false);
//   const [orderEntry, setOrderEntry] = useState(false);
//   const [modalTitle, setmodalTitle] = useState('Order Details');

//   const [editOrderDetailData, setEditOrderDetailData] = useState<any>(null);

//   // Function to open the Order Details
//   const handleDialogOpen = () => {
//     setOpen(true);
//     setmodalTitle('Enter Order Details');
//   };

//   // Function to open the Order Entry
//   const handleOrderEntryOpen = () => {
//     setOrderEntryFormInitialValues(defaultOrderValues);
//     setOrderEntry(true);
//     setmodalTitle('Order Entry');
//   };

//   // Function to close the dialog
//   const handleDialogClose = () => setOpen(false);
//   const handleOrderEntryClose = () => {
//     setEditOrderData(undefined);
//     setOrderEntry(false);
//   };

//   //----------- useQuery--------------
//   // Fetch job data using useQuery hook
//   // const { data: jobData, isFetching: isJobFetching } = useQuery({
//   //   queryKey: ['single_job_data', id],
//   //   queryFn: () => OutboundJobServiceInstance.getOutboundJobOrder(id as string),
//   //   enabled: !!id // Enable query only if id is present
//   // });

//   //--------------------------Get Order Data --- TableOrderData------------------------

//   const { data: TableOrderData, refetch: refetchTableOrder } = useQuery({
//     queryKey: ['order_entry_data', rowData?.job_no],
//     queryFn: async () => {
//       const response = await OrderEntryServiceInstance.getOrderentry(rowData?.job_no ?? '');
//       if (response) {
//         return {
//           tableData: response as IToOrderEntry[],
//           count: response.length
//         };
//       }
//       return { tableData: [], count: 0 };
//     }
//   });

//   const { data: TableOrderDetailsData, refetch: refetchTableOrderDetailsData } = useQuery({
//     queryKey: ['order_details_data', rowData.company_code, rowData.prin_code, rowData.job_no],
//     queryFn: async () => {
//       try {
//         const response = await OutboundJobServiceInstance.getAllOrderDetails(rowData.company_code, rowData.prin_code, rowData.job_no);

//         let tableData: TOrderDetail[] = [];

//         if (Array.isArray(response)) {
//           tableData = response;
//         } else if (response) {
//           tableData = [response];
//         }

//         return {
//           tableData,
//           count: tableData.length
//         };
//       } catch (error) {
//         console.error('Error fetching order details:', error);
//         return {
//           tableData: [] as TOrderDetail[],
//           count: 0
//         };
//       }
//     },
//     enabled: !!rowData.company_code && !!rowData.prin_code && !!rowData.job_no, // Only run query when these values are available
//     refetchOnMount: true,
//     refetchOnWindowFocus: false
//   });

//   // ORDER ENTRY
//   const defaultOrderValues = React.useMemo<IToOrderEntry>(
//     () => ({
//       id: 0,
//       company_code: rowData ? rowData.company_code : '',
//       prin_code: rowData ? rowData.prin_code : '',
//       job_no: rowData ? rowData.job_no : '',
//       cust_code: '',
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
//     [rowData]
//   );

//   const [custCode, setCustCode] = useState<any>('');

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

//   const [orderEntryFormInitialValues, setOrderEntryFormInitialValues] = useState<IToOrderEntry>(defaultOrderValues);
//   const [isEditingOrder, setIsEditingOrder] = useState(false);

//   // Simplified handleSubmit with Formik
//   const handleOrderEntrySubmit = async (values: IToOrderEntry) => {
//     try {
//       if (isEditingOrder) {
//         await OrderEntryServiceInstance.updateSingleOrderEntry(values.id, values);
//       } else {
//         await OrderEntryServiceInstance.createOrderEntry(values);
//       }

//       refetchTableOrder();
//       handleOrderEntryClose();

//       dispatch(
//         openSnackbar({
//           open: true,
//           message: `Order ${isEditingOrder ? 'updated' : 'created'} successfully`,
//           variant: 'alert',
//           alert: { color: 'success' },
//           close: true
//         })
//       );
//     } catch (error) {
//       console.error('Order operation failed:', error);
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: `Failed to ${isEditingOrder ? 'update' : 'create'} order`,
//           variant: 'alert',
//           alert: { color: 'error' },
//           close: true
//         })
//       );
//     }
//   };

//   const handleActions = async (action: string, rowData: IToOrderEntry) => {
//     if (action === 'delete') {
//       try {
//         const deleteSuccess = await OrderEntryServiceInstance.deleteSingleOrderEntry(rowData.id);
//         if (deleteSuccess) {
//           refetchTableOrder();
//           dispatch(
//             openSnackbar({
//               open: true,
//               message: 'Order deleted successfully',
//               variant: 'alert',
//               alert: { color: 'success' },
//               close: true
//             })
//           );
//         }
//       } catch (error) {
//         console.error('Delete action failed:', error);
//       }
//     }

//     if (action === 'edit') {
//       try {
//         const freshData = await OrderEntryServiceInstance.getSingleOrderEntry(rowData.id);
//         setOrderEntryFormInitialValues(freshData || rowData);
//         setIsEditingOrder(true);
//         setmodalTitle('Edit Order Entry');
//         setOrderEntry(true);
//       } catch (error) {
//         console.error('Failed to fetch order data:', error);
//       }
//     }
//   };

//   // Improved useEffect for initial data fetching
//   useEffect(() => {
//     const initializeOrderEntryData = async () => {
//       try {
//         let customerResponse;
//         if (editOrderData?.id && editOrderData.id !== 0) {
//           customerResponse = await OutboundJobServiceInstance.getddPrinceCustomer(editOrderData.company_code, editOrderData.prin_code);
//           setOrderEntryFormInitialValues(editOrderData);
//           setIsEditingOrder(true);
//         } else if (rowData) {
//           customerResponse = await OutboundJobServiceInstance.getddPrinceCustomer(rowData.company_code, rowData.prin_code);
//           setOrderEntryFormInitialValues({
//             ...defaultOrderValues,
//             company_code: rowData.company_code,
//             prin_code: rowData.prin_code,
//             job_no: rowData.job_no
//           });
//           setIsEditingOrder(false);
//         }
//         setCustCode(customerResponse || []);
//       } catch (error) {
//         console.error('Failed to initialize order entry data:', error);
//       }
//     };

//     initializeOrderEntryData();
//   }, [editOrderData, rowData]);

//   useEffect(() => {
//     if (TableOrderDetailsData && gridRef.current && gridRef.current.api) {
//       gridRef.current.api.refreshCells();
//       gridRef.current.api.redrawRows();
//     }
//   }, [TableOrderDetailsData]);

//   const formatDateTime = (dateTimeString: string) => {
//     return new Date(dateTimeString).toLocaleString();
//   };

//   const columnDefs: ColDef[] = useMemo(
//     () => [
//       {
//         headerName: 'Sr. No',
//         field: 'recordNumber',
//         width: 100,
//         cellStyle: {
//           fontSize: '12px',
//           textAlign: 'center'
//         } as any,
//         minWidth: 90,
//         suppressMenu: true,
//         sortable: false,
//         filter: false,
//         valueGetter: (params: any) => {
//           return (params.node?.rowIndex ?? 0) + 1;
//         }
//       },
//       {
//         headerName: 'Customer Code',
//         field: 'cust_code',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Order No.',
//         field: 'order_no',
//         width: 150,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Order Date',
//         field: 'order_date',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150,
//         valueFormatter: (params: any) => {
//           const date = dayjs(params.value);
//           return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
//         }
//       },
//       {
//         headerName: 'Due Date',
//         field: 'order_due_date',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         valueFormatter: (params: any) => {
//           const date = dayjs(params.value);
//           return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
//         },
//         minWidth: 150
//       },
//       {
//         headerName: 'Currency',
//         field: 'curr_code',
//         width: 80,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Exchange Rate',
//         field: 'ex_rate',
//         width: 100,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },

//       {
//         headerName: 'MOC1',
//         field: 'moc1',
//         width: 80,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'MOC2',
//         field: 'moc2',
//         width: 80,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Container No.',
//         field: 'exp_container_no',
//         width: 150,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Container Size',
//         field: 'exp_container_size',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Container Type',
//         field: 'exp_container_type',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Seal No.',
//         field: 'exp_container_sealno',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150
//       },
//       {
//         headerName: 'Customer Ref.',
//         field: 'cust_reference',
//         width: 150,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 180
//       },
//       {
//         headerName: 'Pack Start',
//         field: 'pack_start',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         valueFormatter: (params) => (params.value ? formatDateTime(params.value) : ''),
//         minWidth: 150
//       },
//       {
//         headerName: 'Pack End',
//         field: 'pack_end',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150,
//         valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
//       },
//       {
//         headerName: 'Load Start',
//         field: 'load_start',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150,
//         valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
//       },
//       {
//         headerName: 'Load End',
//         field: 'load_end',
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         minWidth: 150,
//         valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
//       },
//       {
//         headerName: 'Actions',
//         pinned: 'right',
//         field: 'actions',
//         width: 100,
//         filter: false,
//         cellStyle: { fontSize: '12px' },
//         cellRenderer: (params: any) => {
//           const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
//           return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
//         }
//       }
//     ],
//     [TableOrderData]
//   );

//   //--------------------------Order Details------------------------

//   const gridRef = useRef<any>(null);

//   const orderDetailcolumnDefs: ColDef[] = useMemo(
//     () => [
//       {
//         headerName: 'Sr.No',
//         field: 'recordNumber',
//         width: 80,
//         maxWidth: 80,
//         minWidth: 80,
//         cellStyle: {
//           fontSize: '12px',
//           textAlign: 'center'
//         } as any,
//         suppressMenu: true,
//         sortable: false,
//         filter: false,
//         valueGetter: (params: any) => {
//           return (params.node?.rowIndex ?? 0) + 1;
//         }
//       },
//       { headerName: 'Product ', field: 'prod_name', cellStyle: { fontSize: '12px' }, width: 300 },
//       { headerName: 'Order Number ', field: 'order_no', cellStyle: { fontSize: '12px' }, width: 120 },
//       { headerName: 'Quantity', field: 'qty_string', cellStyle: { fontSize: '12px' }, width: 120 },
//       { headerName: 'Unit of Measurement', field: 'l_uom', cellStyle: { fontSize: '12px' }, width: 120 },
//       { headerName: 'Location From', field: 'loc_code_from', cellStyle: { fontSize: '12px' }, width: 120 },
//       { headerName: 'Location To', field: 'loc_code_to', cellStyle: { fontSize: '12px' }, width: 120 },
//       {
//         headerName: 'Actions',
//         field: 'actions',
//         pinned: 'right',
//         filter: false,
//         width: 120,
//         cellStyle: { fontSize: '12px' },
//         cellRenderer: (params: any) => {
//           const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
//           return <ActionButtonsGroup handleActions={(action) => handleOrderDetailsActions(action, params.data)} buttons={actionButtons} />;
//         }
//       }
//     ],
//     [TableOrderDetailsData]
//   );

//   const handleOrderDetailsActions = async (action: string, rowData: any) => {
//     if (action === 'edit') {
//       console.log('Edit action clicked for row:', rowData);
//       setEditOrderDetailData(rowData); // Set the data to edit
//       setmodalTitle('Edit Order Details');
//       setOpen(true);
//     } else if (action === 'delete') {
//       console.log('Delete action clicked for row:', rowData);

//       try {
//         await OutboundJobServiceInstance.deleteToOrderDetHandler(
//           rowData.company_code,
//           rowData.prin_code,
//           rowData.job_no,
//           rowData.serial_no
//         );

//         refetchTableOrderDetailsData(); // Use the refetch function instead of fetchDataTable
//       } catch (error) {
//         console.error('Error deleting record:', error);
//       }
//     } else {
//       console.warn(`Unknown action: ${action}`);
//     }
//   };

//   //--------------------------Modal------------------------
//   const handleOk = async () => {
//     dispatch(openBackdrop());
//     try {
//       const response: IApiResponse<TOrderDetail> = await axiosServices.post('api/wms/outbound/copyEDIToOrderDetailHandler', {
//         login_id: user?.loginid ?? '',
//         job_no: rowData?.job_no ?? '',
//         prin_code: rowData?.prin_code ?? '',
//         company_code: rowData?.company_code ?? ''
//       });

//       if (response.data.success) {
//         dispatch(
//           openSnackbar({
//             open: true,
//             message: response.data.message || 'EDI copied to Order Detail successfully',
//             variant: 'alert',
//             alert: { color: 'success' },
//             close: true
//           })
//         );
//       }

//       return response.data.success;
//     } catch (error: unknown) {
//       const knownError = error as { message?: string };
//       dispatch(
//         openSnackbar({
//           open: true,
//           message: knownError.message || 'Something went wrong while copying EDI to Order Detail',
//           variant: 'alert',
//           alert: { color: 'error' },
//           severity: 'error',
//           close: true
//         })
//       );
//       return false;
//     } finally {
//       setViewModal(false);
//       dispatch(closeBackdrop());
//     }
//   };

//   const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '90%',
//     bgcolor: 'background.paper',
//     boxShadow: 24,
//     p: 4
//   };

//   // Handler to change the selected tab
//   const handleTabChange = (tabValue: string) => {
//     setSelectedTab(tabValue);
//     navigate(`/wms/transactions/outbound/jobs_oub/view/${id}/${tabValue}`, {
//       state: { rowData }
//     });
//   };

//   // Function to render the content based on the selected tab
//   const renderTab = (tabValue: string) => {
//     switch (tabValue) {
//       case 'order_entry':
//         return (
//           <>
//             <MyAgGrid
//               rowData={TableOrderData?.tableData || []}
//               columnDefs={columnDefs}
//               key={TableOrderData?.tableData?.length ?? 0}
//               height="480px"
//               rowHeight={25}
//               headerHeight={30}
//               paginationPageSize={10}
//               pagination={true}
//               paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
//             />
//           </>
//         );

//       case 'order_details':
//         return (
//           <CustomAgGrid
//             ref={gridRef}
//             rowSelection="single"
//             rowData={TableOrderDetailsData?.tableData || []}
//             columnDefs={orderDetailcolumnDefs}
//             height="480px"
//             rowHeight={25}
//             headerHeight={30}
//             paginationPageSize={1000}
//             pagination={true}
//             paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
//             onGridReady={(params) => {
//               gridRef.current = params;
//             }}
//             reload_data={true}
//             onCellValueChanged={(params) => {
//               console.log('Cell value changed:', params);
//               // Handle cell value changes if needed
//             }}
//             getRowId={(params) => params.data.serial_no}
//             getRowNodeId={(data) => data.serial_no}
//             selectedRows={TableOrderDetailsData?.tableData.filter((row) => row.selected)}
//             suppressRowClickSelection={false}
//             rowMultiSelectWithClick={true}
//             suppressCellSelection={false}
//             suppressRowDeselection={false}
//             animateRows={true}
//             suppressRowTransform={false}
//             suppressColumnVirtualisation={false}
//             suppressScrollOnNewData={false}
//           />
//         );

//       case 'picking_details':
//         return (
//           <ErrorBoundary>
//             <PickingDetailsWmsTab job_no={id as string} prin_code={rowData?.prin_code as string} />
//           </ErrorBoundary>
//         );
//       case 'job_confirmation':
//         return <JobConfirmation job_no={id as string} prin_code={rowData?.prin_code as string} />;

//       default:
//         return null;
//     }
//   };

//   //--------------------------useEffect------------------------

//   // Effect to set the selected tab when the tab parameter changes
//   useEffect(() => {
//     tab && setSelectedTab(tab);
//   }, [tab]);

//   //--------------------------IMPORT------------------------

//   const handleImportModalClose = () => {
//     setImportModalOpen(false);
//     setImportFile(null);
//   };

//   const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setImportFile(e.target.files[0]);
//     }
//   };

//   const handleImportFileClick = () => {
//     document.getElementById('packing-import-file-input')?.click();
//   };

//   const handleImportSubmit = async () => {
//     if (importFile) {
//       try {
//         // Parse Excel/CSV file
//         setPercent(0);
//         const data = await importFile.arrayBuffer();
//         const workbook = XLSX.read(data, { type: 'array' });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

//         // Optionally, add job_no and prin_code to each row if needed
//         const enrichedData = jsonData.map((row: any) => ({
//           ...row,
//           user_id: user?.loginid ?? '',
//           company_code: user?.company_code ?? null,
//           prin_code: rowData?.prin_code ?? '',
//           job_no: rowData?.job_no ?? ''
//         }));

//         console.log('enrichedData:', enrichedData);

//         const success = await handleImportData(enrichedData);
//         if (success) {
//           setPercent(0);
//           setViewModal(true);
//           setImportModalOpen(false);
//           setImportFile(null);
//         }
//       } catch (error) {
//         console.error('Failed to parse file:', error);
//       }
//     }
//   };

//   // Import handler: uploads parsed data to backend and refreshes table
//   const handleImportData = async (values: unknown[]): Promise<boolean> => {
//     try {
//       setPercent(50);
//       console.log('value', values);

//       if (!Array.isArray(values) || values.length === 0) {
//         console.error('No data to upload.');
//         return false;
//       }

//       // Transform raw Excel data into typed IEDIOrderDetail[]
//       const ediData = transformOrderDetailEDI(values as any[]);
//       console.log('ediData', ediData);

//       // Call backend bulk upload API

//       const response = await OutboundJobServiceInstance.upsertEDIOrderDetailHandler(ediData);
//       console.log('Data imported successfully:', response);

//       if (response) {
//         // Show success message
//         console.log('Data imported successfully:', response);
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error('Error while importing data:', error);
//       return false;
//     }
//   };

//   // Helper functions (implement as per your project)
//   const parseNumber = (val: any): number | undefined => {
//     const num = Number(val);
//     return isNaN(num) ? undefined : num;
//   };

//   const parseDate = (val: any): Date | undefined => {
//     const date = val ? new Date(val) : undefined;
//     return date instanceof Date && !isNaN(date.getTime()) ? date : undefined;
//   };

//   const transformOrderDetailEDI = (rawData: any): IEDIOrderDetail => {
//     return rawData.map((row: any, index: number) => ({
//       company_code: user?.company_code ?? '',
//       prin_code: row['prin_code']?.trim(),
//       job_no: row['job_no']?.trim(),
//       product_code: row['Product Code']?.trim(),
//       site_code: row['site_code']?.trim() || undefined,
//       puom: row['puom']?.trim() || undefined,
//       qty1: parseNumber(row['qty1']),
//       luom: row['luom']?.trim() || undefined,
//       qty2: parseNumber(row['qty2']),
//       lotno: row['lotno']?.trim() || undefined,
//       location_from: row['location_from']?.trim() || undefined,
//       location_to: row['location_to']?.trim() || undefined,
//       salesman_code: row['salesman_code']?.trim() || undefined,
//       expiry_date_from: parseDate(row['expiry_date_from']),
//       expiry_date_to: parseDate(row['expiry_date_to']),
//       batch_no: row['batch_no']?.trim() || undefined,
//       mfg_date_from: parseDate(row['mfg_date_from']),
//       mfg_date_to: parseDate(row['mfg_date_to']),
//       customer_store_name: row['Customer/Store Name']?.trim() || undefined,
//       order_no: row['Order No']?.trim(),
//       cust_code: '0000', // Default value, can be changed as needed
//       serial_no: index + 1,
//       serial_number: row['serial_number']?.trim() || '-',
//       created_at: new Date(),
//       created_by: 'SYSTEM',
//       updated_at: new Date(),
//       updated_by: 'SYSTEM',
//       user_id: user?.loginid ?? '',
//       error_msg: row['error_msg']?.trim() || undefined
//     }));
//   };

//   //--------------------------Menu List------------------------
//   const BasicMenu = () => {
//     const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//     const open = Boolean(anchorEl);
//     const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//       setAnchorEl(event.currentTarget);
//     };
//     const handleClose = () => {
//       setAnchorEl(null);
//     };

//     const handleMenuAction = (action: string) => {
//       if (action === 'import') {
//         setImportModalOpen(true);
//       }
//     };

//     return (
//       <>
//         <div>
//           <Button
//             startIcon={open ? <DownCircleOutlined /> : <RightCircleOutlined />}
//             sx={{
//               fontSize: '0.895rem',
//               backgroundColor: '#fff',
//               color: '#082A89',
//               border: '1.5px solid #082A89',
//               fontWeight: 600,
//               '&:hover': {
//                 backgroundColor: '#082A89',
//                 color: '#fff',
//                 border: '1.5px solid #082A89'
//               }
//             }}
//             variant="contained"
//             onClick={handleClick}
//           >
//             EDI
//             {/* <FormattedMessage id="Job" /> */}
//           </Button>
//           <Menu disableScrollLock={true} id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
//             <MenuItem onClick={() => handleMenuAction('import')}>Import</MenuItem>
//             <MenuItem onClick={() => handleMenuAction('export')}>Export</MenuItem>
//             <MenuItem onClick={() => handleMenuAction('print')}>Print</MenuItem>
//           </Menu>
//         </div>
//       </>
//     );
//   };

//   // Helper function for permission check
//   const hasTabPermission = (tab: TPair<''>) => {
//     if (!user_permission) return false;

//     const appKey = app.toUpperCase();
//     const childKey = pathNameList[3]?.toUpperCase();
//     const serialNumber = permissions?.[appKey]?.children?.[childKey]?.serial_number?.toString();

//     return serialNumber && Object.keys(user_permission).includes(serialNumber);
//   };

//   return (
//     <div className="w-full h-full">
//       <div className="sm:flex sm:justify-between sm:items-center">
//         <div className="my-6 flex items-center justify-between space-x-4">
//           {/* Button to navigate back to the jobs list */}
//           <IconButton onClick={() => navigate('/wms/transactions/outbound/jobs_oub')}>
//             <ArrowLeftOutlined />
//           </IconButton>
//           {/* Display the job number */}
//           {/* <Typography className="text-xl sm:text-3xl font-semibold ">{jobData?.job_no}</Typography> */}
//           <Alert message={`Job Number: ${rowData?.job_no}`} type="info" />
//           <Alert message={`Principal Code: ${rowData?.prin_code}`} type="info" />
//         </div>
//         <div className="flex items-center space-x-2">
//           {tab === 'order_entry' ? (
//             <Button
//               startIcon={<PlusOutlined />}
//               sx={{
//                 fontSize: '0.895rem',
//                 backgroundColor: '#fff',
//                 color: '#082A89',
//                 border: '1.5px solid #082A89',
//                 fontWeight: 600,
//                 '&:hover': {
//                   backgroundColor: '#082A89',
//                   color: '#fff',
//                   border: '1.5px solid #082A89'
//                 }
//               }}
//               variant="contained"
//               onClick={handleOrderEntryOpen}
//             >
//               Order Entry
//               {/* <FormattedMessage id="Job" /> */}
//             </Button>
//           ) : tab === 'order_details' ? (
//             <Button
//               startIcon={<PlusOutlined />}
//               sx={{
//                 fontSize: '0.895rem',
//                 backgroundColor: '#fff',
//                 color: '#082A89',
//                 border: '1.5px solid #082A89',
//                 fontWeight: 600,
//                 '&:hover': {
//                   backgroundColor: '#082A89',
//                   color: '#fff',
//                   border: '1.5px solid #082A89'
//                 }
//               }}
//               variant="contained"
//               onClick={handleDialogOpen}
//             >
//               Order Details
//               {/* <FormattedMessage id="Job" /> */}
//             </Button>
//           ) : null}

//           <BasicMenu />
//         </div>
//       </div>

//       {/* ORDER ENTRY FORM */}
//       <DialogPop open={orderEntry} onClose={handleOrderEntryClose} title={modalTitle} width={1000}>
//         <Formik
//           initialValues={orderEntryFormInitialValues}
//           validationSchema={orderEntryValidationSchema}
//           onSubmit={handleOrderEntrySubmit}
//           enableReinitialize
//         >
//           {({ isSubmitting }) => (
//             <OrderEntryForm
//               initialValues={orderEntryFormInitialValues}
//               onSubmit={handleOrderEntrySubmit}
//               onCancel={handleOrderEntryClose}
//               customerOptions={Array.isArray(custCode) ? custCode : []}
//               currencyOptions={currencyList?.tableData || []}
//               isEditing={isEditingOrder}
//             />
//           )}
//         </Formik>
//       </DialogPop>

//       {/* Order Detiails Form POP UP */}
//       {/* Order Details Form POP UP */}
//       <DialogPop open={open} onClose={handleDialogClose} title={modalTitle} width={1000}>
//         <OrderDetailsForm
//           loginid={user?.loginid ?? ''}
//           job_no={rowData?.job_no ?? ''}
//           prin_code={rowData?.prin_code ?? ''}
//           company_code={rowData?.company_code ?? ''}
//           editData={editOrderDetailData} // Use the editData state instead of rowData
//           onSuccess={() => {
//             refetchTableOrderDetailsData(); // Refresh the table data
//             handleDialogClose(); // Close the dialog
//           }}
//           onCancel={handleDialogClose}
//           refetchTableOrderDetailsData={refetchTableOrderDetailsData}
//         />
//       </DialogPop>

//       <Box sx={{ bgcolor: 'background.paper' }}>
//         <AppBar position="static">
//           <Tabs
//             sx={{
//               backgroundColor: theme.palette.grey[100],
//               '& .MuiTab-root': {
//                 transition: 'all 0.3s ease',
//                 borderRadius: '8px 8px 0 0',
//                 margin: '0 2px',
//                 textTransform: 'none',
//                 fontWeight: 500,
//                 color: theme.palette.text.secondary,
//                 '&:hover': {
//                   backgroundColor: 'rgba(8, 42, 137, 0.08)',
//                   color: '#082A89'
//                 }
//               },
//               '& .Mui-selected': {
//                 backgroundColor: '#fff',
//                 color: '#082A89 !important',
//                 fontWeight: 600,
//                 border: '2px solid #082A89',
//                 borderBottom: 'none',
//                 position: 'relative',
//                 '&::before': {
//                   content: '""',
//                   position: 'absolute',
//                   bottom: '-2px',
//                   left: 0,
//                   right: 0,
//                   height: '2px',
//                   backgroundColor: '#fff',
//                   zIndex: 1
//                 }
//               }
//             }}
//             value={selectedTab}
//             variant="scrollable"
//             scrollButtons="auto"
//             aria-label="scrollable auto tabs example"
//           >
//             {availableTabs
//               .filter((tab) => hasTabPermission(tab)) // Pre-filter tabs by permission
//               .map((tab) => (
//                 <Tab
//                   key={tab.value}
//                   className="font-semibold"
//                   aria-label={`${tab.label} tab`}
//                   value={tab.value}
//                   label={<FormattedMessage id={tab.label} />}
//                   onClick={() => handleTabChange(tab.value)}
//                 />
//               ))}
//           </Tabs>
//         </AppBar>

//         <Paper elevation={3} className="rounded-none overflow-hidden h-full">
//           {renderTab(selectedTab)}
//         </Paper>
//       </Box>

//       <Dialog
//         open={importModalOpen}
//         onClose={handleImportModalClose}
//         maxWidth="xs"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             overflow: 'visible'
//           }
//         }}
//       >
//         <Box
//           sx={{
//             background: '#173A5E',
//             color: '#fff',
//             px: 3,
//             py: 2,
//             borderTopLeftRadius: 12,
//             borderTopRightRadius: 12
//           }}
//         >
//           <DialogTitle
//             sx={{
//               p: 0,
//               fontWeight: 600,
//               fontSize: 18,
//               color: '#fff',
//               background: 'transparent'
//             }}
//           >
//             <FormattedMessage id="Import Packing Details" />
//           </DialogTitle>
//         </Box>
//         <DialogContent
//           sx={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             minHeight: 260,
//             background: '#f8fafc'
//           }}
//         >
//           <Box
//             sx={{
//               border: '1.5px dashed #173A5E',
//               borderRadius: 2,
//               p: 4,
//               width: '100%',
//               maxWidth: 340,
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               background: '#fff',
//               boxShadow: 1
//             }}
//           >
//             <input
//               id="packing-import-file-input"
//               type="file"
//               accept=".csv,.xlsx"
//               style={{ display: 'none' }}
//               onChange={handleImportFileChange}
//             />
//             <IconButton
//               onClick={handleImportFileClick}
//               sx={{
//                 background: '#173A5E',
//                 color: '#fff',
//                 mb: 2,
//                 width: 64,
//                 height: 64,
//                 borderRadius: '50%',
//                 boxShadow: 2,
//                 '&:hover': { background: '#205081' }
//               }}
//               size="large"
//             >
//               <UploadOutlined style={{ fontSize: 32 }} />
//             </IconButton>
//             <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
//               <FormattedMessage id={importFile ? 'Change File' : 'Choose File'} />
//             </Typography>
//             {importFile && <Progress percent={percent} status="active" />}
//             {importFile && (
//               <Typography variant="body2" sx={{ color: '#173A5E', mb: 1, wordBreak: 'break-all' }}>
//                 <UploadOutlined style={{ marginRight: 6 }} />
//                 {importFile.name}
//               </Typography>
//             )}
//             <Typography variant="caption" sx={{ color: '#888', mt: 1 }}>
//               <FormattedMessage id="Supported formats: .csv, .xlsx" />
//             </Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2, background: '#f8fafc' }}>
//           <Button onClick={handleImportModalClose} variant="outlined" sx={{ minWidth: 100 }}>
//             <FormattedMessage id="Cancel" />
//           </Button>
//           <Button
//             onClick={handleImportSubmit}
//             disabled={!importFile}
//             variant="contained"
//             sx={{
//               minWidth: 100,
//               background: '#173A5E',
//               color: '#fff',
//               '&:hover': { background: '#205081' }
//             }}
//           >
//             <FormattedMessage id="Upload" />
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Modal open={viewModal} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
//         <Box sx={style}>
//           <EDITable
//             loginid={user?.loginid ?? ''}
//             job_no={rowData?.job_no ?? ''}
//             prin_code={rowData?.prin_code ?? ''}
//             company_code={rowData?.company_code ?? ''}
//           />
//           <div className="flex gap-2 items-center justify-end mt-4">
//             <Button variant="outlined" onClick={handleClose}>
//               Cancel
//             </Button>
//             <Button variant="contained" onClick={handleOk}>
//               OK
//             </Button>
//           </div>
//         </Box>
//       </Modal>
//     </div>
//   );
// };

// export default OutboundJobTabsWmsPage;
