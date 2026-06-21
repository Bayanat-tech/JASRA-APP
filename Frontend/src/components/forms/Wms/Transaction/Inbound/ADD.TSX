// import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
// import { Autocomplete, Button, FormHelperText, Grid, InputLabel, MenuItem, Select } from '@mui/material';
// import TextField from '@mui/material/TextField';
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs, { Dayjs } from 'dayjs';
// import { getIn, useFormik } from 'formik';
// import useAuth from 'hooks/useAuth';
// import { useQuery } from '@tanstack/react-query';
// import { useSelector } from 'store';
// import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
// import { useEffect } from 'react';
// import { FormattedMessage } from 'react-intl';
// import * as yup from 'yup';
// import WmsSerivceInstance from 'service/service.wms';
// import { TBasicPrincipalWms } from 'pages/WMS/types/principal-wms.types';
// import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
// import { TDepartment } from 'pages/WMS/types/department-wms.types';
// import { TDivision } from 'pages/WMS/types/division-wms.types';
// import { TCountry } from 'pages/WMS/types/country-wms.types';
// import { TPort } from 'pages/WMS/types/Port-wms.types';
// import CreateInboundJobServiceInstance from 'service/wms/transaction/inbound/service.inboundJobcreateWms';
// //import { values } from 'lodash';

// const AddJobWmsForm = ({
//   onClose,
//   isEditMode,
//   existingData
// }: {
//   onClose: (refetchData?: boolean) => void;
//   isEditMode: Boolean;
//   existingData: TJobInboundWms;
// }) => {
//   //-------------------constants-------------------
//   const { user } = useAuth();
//   const { app } = useSelector((state) => state.menuSelectionSlice);

//   const { data: prinList } = useQuery({
//     queryKey: ['prin_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'ddprincipal', undefined, undefined);
//         if (response) {
//           return {
//             //tableData: response.tableData as TJobInboundWms[],
//             tableData: response.tableData as TPrincipalWms[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch brand data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   const { data: departmentaList } = useQuery({
//     queryKey: ['manufacturer_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'ddepartment', undefined, undefined);
//         if (response) {
//           return {
//             tableData: response.tableData as TDepartment[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch manufacture data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   const { data: divisionList } = useQuery({
//     queryKey: ['division_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'dddivision', undefined, undefined);
//         if (response) {
//           return {
//             tableData: response.tableData as TDivision[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch manufacture data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   const { data: OrigincountryList } = useQuery({
//     queryKey: ['origincountry_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'country', undefined, undefined);
//         if (response) {
//           return {
//             tableData: response.tableData as TCountry[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch manufacture data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   const { data: DestinationcountryList } = useQuery({
//     queryKey: ['destcountry_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'country', undefined, undefined);
//         if (response) {
//           return {
//             tableData: response.tableData as TCountry[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch manufacture data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   const { data: portList } = useQuery({
//     queryKey: ['port_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'port', undefined, undefined);
//         if (response) {
//           return {
//             tableData: response.tableData as TPort[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch manufacture data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   const { data: DestinationportList } = useQuery({
//     queryKey: ['destport_data'],
//     queryFn: async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(app, 'port', undefined, undefined);
//         if (response) {
//           return {
//             tableData: response.tableData as TPort[],
//             count: response.count
//           };
//         }
//         // Return empty data if response is undefined
//         return { tableData: [], count: 0 };
//       } catch (error) {
//         // Handle error case
//         console.error('Failed to fetch manufacture data', error);
//         return { tableData: [], count: 0 }; // Fallback in case of error
//       }
//     }
//   });
//   //------------------formik-----------------
//   const formik = useFormik<TJobInboundWms>({
//     initialValues: {
//       job_no: '',
//       job_type: '',
//       prin_code: '',
//       company_code: user?.company_code,
//       job_date: user?.updated_at ?? new Date(),
//       job_class: 'N',
//       dept_code: '',
//       transport_mode: '',
//       doc_ref: '',
//       port_code: '',
//       description1: '',
//       description2: '',
//       prin_ref1: '',
//       prin_ref2: '',
//       remarks: '',
//       eta: null as unknown as Date,
//       ata: null as unknown as Date,
//       etd: null as unknown as Date,
//       schedule_date: null as unknown as Date,
//       payment_terms: '',
//       curr_code: 'OMR',
//       ex_rate: 1,
//       frieght_value: 0,
//       insurance_value: 0,
//       cust_code: '',
//       container_flag: '',
//       container: '',
//       packdet: 'N',
//       allocated: 'N',
//       canceled: 'N',
//       confirmed: 'N',
//       grn_no: null as unknown as number,
//       invoiced: 'N',
//       completed: '',
//       exp_jobno: '',
//       picked: 'N',
//       ordered: 'N',
//       destination_port: '',
//       vessel_name: '',
//       voyage_no: '',
//       payableat: '',
//       place_receipt: '',
//       place_delivery: '',
//       no_of_original_bl: null as unknown as number,
//       broker_code: '',
//       quotation_ref: '',
//       be_deposits: '',
//       ind_freight: '',
//       country_origin: '',
//       country_destination: '',
//       //task_order: null as unknown as number,
//       custom_recno: '',
//       doc_ref2: '',
//       hawb: '',
//       reexport: '',
//       ref_jobno: '',
//       combined_jobno: '',
//       carrier: '',
//       job_lock: '',
//       courier_code: '',
//       delivery_point: '',
//       div_code: '',
//       salesman_code: '',
//       transit_time: '',
//       document_check: '',
//       delivery_remarks: '',
//       cargo_received: '',
//       delivered_by: '',
//       canceled_by: '',
//       cancel_remarks: '',
//       send_mail: '',
//       backlog_mail: '',
//       dplan_flag: '',
//       trans_batch_id: '',
//       send_mail_dn: '',
//       kpi_inc: '',
//       kpi_exc_remark: '',
//       job_category: 'N/A',
//       edit_user: '',
//       tx_cat_code: '',
//       bcf_code: '',
//       request_category: '',
//       load_point: '',
//       updated_by: user?.loginid ?? '',
//       created_by: user?.loginid ?? '',
//       created_at: user?.created_at ?? new Date(),
//       updated_at: user?.updated_at ?? new Date()
//     },
//     validationSchema: yup.object().shape({
//       job_type: yup.string().required('This field is required')
//     }),
//     onSubmit: async (values, { setSubmitting }) => {
//       setSubmitting(true);
//       let response;
//       if (isEditMode) {
//         //console.log('container date', values.container_date);
//         //response = await CreateInboundJobServiceInstance.editInboundjob(values: TJobInboundWms, prin_code: string, job_no: string);
//         response = await CreateInboundJobServiceInstance.editInboundjob(values);
//         console.log(values);
//       } else {
//         response = await CreateInboundJobServiceInstance.addInboundjob(values);
//       }
//       if (response) {
//         onClose(true);
//         setSubmitting(false);
//       }
//     }
//   });
//   //------------------useEffect------------

//   useEffect(() => {
//     if (isEditMode) {
//       // Destructure existingData, but keep required fields like created_by and updated_by
//       const { updated_at, updated_by, created_at, created_by, ...inboundjobData } = existingData;
//       console.log(existingData);
//       // Ensure required fields are included
//       const formikData: TJobInboundWms = {
//         ...inboundjobData,
//         created_by: existingData.created_by, // Add created_by explicitly
//         updated_by: existingData.updated_by // Add updated_by explicitly
//       };

//       console.log(updated_at, updated_by, created_at, created_by); // Optional: Log for debugging

//       // Set the formik values with the complete object
//       formik.setValues(formikData);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isEditMode]);

//   return (
//     //------------------jobno-----------
//     <Grid container spacing={6} component={'form'} onSubmit={formik.handleSubmit}>
//       <Grid item xs={12} sm={6}>
//         <InputLabel>
//           <FormattedMessage id="Job No" />
//         </InputLabel>
//         <TextField
//           size="small"
//           value={formik.values.job_no}
//           name="job_no"
//           onChange={formik.handleChange}
//           className="w-28"
//           error={Boolean(getIn(formik.touched, 'job_no') && getIn(formik.errors, 'job_no'))}
//         />
//         {getIn(formik.touched, 'job_no') && getIn(formik.errors, 'job_no') && (
//           <FormHelperText error id="helper-text-first_name">
//             {getIn(formik.errors, 'job_no')}
//           </FormHelperText>
//         )}
//       </Grid>
//       <Grid item xs={12}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6}>
//             <InputLabel>
//               {' '}
//               Principal
//               <span className="text-red-500"> *</span>
//             </InputLabel>
//             <Autocomplete
//               id="prin_code"
//               value={
//                 !!formik.values.prin_code
//                   ? prinList?.tableData.find((eachBrand) => eachBrand.prin_code === formik.values.prin_code)
//                   : ({ prin_name: '' } as TPrincipalWms)
//               }
//               onChange={(event, value: TJobInboundWms | TPrincipalWms | null) => {
//                 formik.setFieldValue('prin_code', value?.prin_code);
//               }}
//               size="small"
//               options={prinList?.tableData ?? []}
//               fullWidth
//               autoHighlight
//               getOptionLabel={(option) => (option as TPrincipalWms)?.prin_name || ''}
//               isOptionEqualToValue={(option) => option.prin_code === formik.values.prin_code}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   inputProps={{
//                     ...params.inputProps
//                   }}
//                 />
//               )}
//             />
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <InputLabel>
//               {' '}
//               Department
//               <span className="text-red-500"> *</span>
//             </InputLabel>
//             <Autocomplete
//               id="dept_code"
//               value={
//                 !!formik.values.dept_code
//                   ? departmentaList?.tableData.find((eachBrand) => eachBrand.dept_code === formik.values.dept_code)
//                   : ({ dept_name: '' } as TDepartment)
//               }
//               onChange={(event, value: TJobInboundWms | TDepartment | null) => {
//                 formik.setFieldValue('dept_code', value?.dept_code);
//               }}
//               size="small"
//               options={departmentaList?.tableData ?? []}
//               fullWidth
//               autoHighlight
//               getOptionLabel={(option) => (option as TDepartment)?.dept_name || ''}
//               isOptionEqualToValue={(option) => option.dept_code === formik.values.dept_code}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   inputProps={{
//                     ...params.inputProps
//                   }}
//                 />
//               )}
//             />
//           </Grid>
//         </Grid>
//       </Grid>
//       <Grid item xs={12}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <InputLabel>Job Classification</InputLabel>
//             <Grid item xs={6} sm={6}>
//               <Select value={formik.values.job_class} onChange={(e) => formik.setFieldValue('job_class', e.target.value)} fullWidth>
//                 <MenuItem value="N">Normal</MenuItem>
//                 <MenuItem value="x">CrossDocking</MenuItem>
//                 <MenuItem value="M">Manual Putaway</MenuItem>
//                 <MenuItem value="S">Sales Return(WMS)</MenuItem>
//                 <MenuItem value="O">Non-Inventory</MenuItem>
//                 <MenuItem value="C">Co-Packing</MenuItem>
//                 <MenuItem value="R">Sales return</MenuItem>
//                 <MenuItem value="D">Sales return-Direct</MenuItem>
//                 <MenuItem value="L">LTI</MenuItem>
//                 <MenuItem value="Z">Distribution</MenuItem>
//                 <MenuItem value="RNM">R & M</MenuItem>
//                 <MenuItem value="HAC">HACCP</MenuItem>
//                 <MenuItem value="SAN">Sanitation</MenuItem>
//                 <MenuItem value="SEC">Security</MenuItem>
//                 <MenuItem value="IDE">Indirect Exp</MenuItem>
//                 <MenuItem value="52">Misc Receipts</MenuItem>
//                 <MenuItem value="53">Inter Warehouse TRF</MenuItem>
//                 <MenuItem value="64">Sales Return(RMA)</MenuItem>
//               </Select>
//               {formik.touched.job_class && formik.errors.job_class && <FormHelperText error>{formik.errors.job_class}</FormHelperText>}
//             </Grid>
//           </Grid>
//           <Grid item xs={12} sm={6}>
//             <InputLabel>
//               Job Type
//               <span className="text-red-500"> *</span>
//             </InputLabel>
//             <Grid item xs={6} sm={6}>
//               <Select value={formik.values.job_type} onChange={(e) => formik.setFieldValue('job_type', e.target.value)} fullWidth>
//                 <MenuItem value="IMP">Inbound</MenuItem>
//                 <MenuItem value="EXP">Outbound</MenuItem>
//               </Select>
//               {formik.touched.job_type && formik.errors.job_type && <FormHelperText error>{formik.errors.job_type}</FormHelperText>}
//             </Grid>
//           </Grid>
//           <Grid item xs={4} sm={6}>
//             <InputLabel>
//               <FormattedMessage id="Job Category" />
//             </InputLabel>
//             <Grid item xs={4} sm={4}>
//               <TextField
//                 size="small"
//                 value={formik.values.job_category}
//                 name="job_category"
//                 onChange={formik.handleChange}
//                 fullWidth
//                 error={Boolean(getIn(formik.touched, 'job_category') && getIn(formik.errors, 'job_category'))}
//               />
//             </Grid>
//             {getIn(formik.touched, 'job_category') && getIn(formik.errors, 'job_category') && (
//               <FormHelperText error id="helper-text-first_name">
//                 {getIn(formik.errors, 'job_category')}
//               </FormHelperText>
//             )}
//           </Grid>
//         </Grid>
//       </Grid>
//       <Grid item xs={12}>
//         <Grid container spacing={2}>
//           <Grid item xs={8} sm={14}>
//             <InputLabel>
//               <FormattedMessage id="Job Description" />
//             </InputLabel>
//             <Grid item xs={6} sm={14}>
//               <TextField
//                 size="small"
//                 value={formik.values.description1}
//                 name="description1"
//                 onChange={formik.handleChange}
//                 fullWidth
//                 //required
//                 multiline
//                 rows={4} // You can adjust the number of rows as needed
//                 error={Boolean(getIn(formik.touched, 'description1') && getIn(formik.errors, 'description1'))}
//               />
//             </Grid>
//             {getIn(formik.touched, 'description1') && getIn(formik.errors, 'description1') && (
//               <FormHelperText error id="helper-text-first_name">
//                 {getIn(formik.errors, 'description1')}
//               </FormHelperText>
//             )}
//           </Grid>
//           <Grid item xs={8} sm={14}>
//             <InputLabel>
//               <FormattedMessage id="Job Remarks" />
//             </InputLabel>
//             <Grid item xs={6} sm={16}>
//               <TextField
//                 size="small"
//                 value={formik.values.remarks}
//                 name="remarks"
//                 onChange={formik.handleChange}
//                 fullWidth
//                 //required
//                 multiline
//                 rows={4} // You can adjust the number of rows as needed
//                 error={Boolean(getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks'))}
//               />
//             </Grid>
//             {getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks') && (
//               <FormHelperText error id="helper-text-first_name">
//                 {getIn(formik.errors, 'remarks')}
//               </FormHelperText>
//             )}
//           </Grid>
//           <Grid item xs={12} sm={14}>
//             <InputLabel>
//               <FormattedMessage id="GRN Remarks" />
//             </InputLabel>
//             <Grid item xs={6} sm={16}>
//               <TextField
//                 size="small"
//                 value={formik.values.prin_ref2}
//                 name="prin_ref2"
//                 onChange={formik.handleChange}
//                 fullWidth
//                 //required
//                 multiline
//                 rows={4} // You can adjust the number of rows as needed
//                 error={Boolean(getIn(formik.touched, 'prin_ref2') && getIn(formik.errors, 'prin_ref2'))}
//               />
//             </Grid>
//             {getIn(formik.touched, 'prin_ref2') && getIn(formik.errors, 'prin_ref2') && (
//               <FormHelperText error id="helper-text-first_name">
//                 {getIn(formik.errors, 'prin_ref2')}
//               </FormHelperText>
//             )}
//           </Grid>
//         </Grid>
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <Grid container spacing={4}>
//           <Grid item xs={12}>
//             <Grid container spacing={2}></Grid>
//             <InputLabel> Division </InputLabel>
//             <Autocomplete
//               id="div_code"
//               value={
//                 !!formik.values.div_code
//                   ? divisionList?.tableData.find((eachBrand) => eachBrand.div_code === formik.values.div_code)
//                   : ({ div_name: '' } as TDivision)
//               }
//               onChange={(event, value: TDivision | null) => {
//                 formik.setFieldValue('div_code', value?.div_code);
//               }}
//               size="small"
//               options={(divisionList?.tableData ?? []) as TDivision[]}
//               fullWidth
//               autoHighlight
//               getOptionLabel={(option) => option?.div_name || ''}
//               isOptionEqualToValue={(option) => option.div_code === formik.values.div_code}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   inputProps={{
//                     ...params.inputProps
//                   }}
//                 />
//               )}
//             />
//           </Grid>
//         </Grid>
//       </Grid>
//       <Grid item xs={12} sm={4}>
//         <InputLabel>Transport Mode</InputLabel>
//         <Grid item xs={6} sm={6}>
//           <Select value={formik.values.transport_mode} onChange={(e) => formik.setFieldValue('transport_mode', e.target.value)} fullWidth>
//             <MenuItem value="R">Road\Land</MenuItem>
//             <MenuItem value="S">Sea</MenuItem>
//             <MenuItem value="A">Air</MenuItem>
//           </Select>
//           {formik.touched.transport_mode && formik.errors.transport_mode && (
//             <FormHelperText error>{formik.errors.transport_mode}</FormHelperText>
//           )}
//         </Grid>
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <InputLabel>
//           <FormattedMessage id="Origin Country" />
//         </InputLabel>
//         <Autocomplete
//           id="country_origin"
//           value={
//             !!formik.values.country_origin
//               ? OrigincountryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_origin)
//               : ({ country_name: '' } as TCountry)
//           }
//           onChange={(event, value: TCountry | null) => {
//             formik.setFieldValue('country_origin', value?.country_code);
//             //formik.setFieldValue('tax_country_sn', value?.short_desc);
//           }}
//           options={OrigincountryList?.tableData ?? []}
//           fullWidth
//           autoHighlight
//           getOptionLabel={(option) => option?.country_name}
//           size="small"
//           isOptionEqualToValue={(option) => option.country_code === formik.values.country_origin}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               inputProps={{
//                 ...params.inputProps
//               }}
//             />
//           )}
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <InputLabel>
//           <FormattedMessage id="Destination Country" />
//         </InputLabel>
//         <Autocomplete
//           id="country_destination"
//           value={
//             !!formik.values.country_destination
//               ? DestinationcountryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_destination)
//               : ({ country_name: '' } as TCountry)
//           }
//           onChange={(event, value: TCountry | null) => {
//             formik.setFieldValue('country_destination', value?.country_code);
//             // formik.setFieldValue('tax_country_sn', value?.short_desc);
//           }}
//           options={DestinationcountryList?.tableData ?? []}
//           fullWidth
//           autoHighlight
//           getOptionLabel={(option) => option?.country_name}
//           size="small"
//           isOptionEqualToValue={(option) => option.country_code === formik.values.country_destination}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               inputProps={{
//                 ...params.inputProps
//               }}
//             />
//           )}
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <InputLabel> Port Of Loading </InputLabel>
//         <Autocomplete
//           id="port_code"
//           value={
//             !!formik.values.port_code
//               ? portList?.tableData.find((eachPort) => eachPort.port_code === formik.values.port_code)
//               : ({ port_name: '' } as TPort)
//           }
//           onChange={(event, value: TPort | null) => {
//             formik.setFieldValue('port_code', value?.port_code);
//           }}
//           size="small"
//           options={portList?.tableData ?? []}
//           fullWidth
//           autoHighlight
//           getOptionLabel={(option) => (option as TPort)?.port_name || ''}
//           isOptionEqualToValue={(option) => option.port_code === formik.values.port_code}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               inputProps={{
//                 ...params.inputProps
//               }}
//             />
//           )}
//         />
//       </Grid>
//       <Grid item xs={12} sm={6}>
//         <InputLabel>
//           <FormattedMessage id="Destination Port" />
//         </InputLabel>
//         <Autocomplete
//           id="destination_port"
//           value={
//             !!formik.values.destination_port
//               ? DestinationportList?.tableData.find((eachPort) => eachPort.port_code === formik.values.destination_port)
//               : ({ port_name: '' } as TPort)
//           }
//           onChange={(event, value: TPort | null) => {
//             formik.setFieldValue('destination_port', value?.port_code);
//             // formik.setFieldValue('tax_country_sn', value?.short_desc);
//           }}
//           options={DestinationportList?.tableData ?? []}
//           fullWidth
//           autoHighlight
//           getOptionLabel={(option) => option?.port_name}
//           size="small"
//           isOptionEqualToValue={(option) => option.port_code === formik.values.destination_port}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               inputProps={{
//                 ...params.inputProps
//               }}
//             />
//           )}
//         />
//       </Grid>
//       {/*----------------------Eta Date-------------------------- */}
//       <Grid item xs={12}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={4}>
//             <InputLabel>
//               <FormattedMessage id="Eta Date" />
//               {/* <span className="text-red-500">*</span> */}
//             </InputLabel>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 format="DD/MM/YYYY"
//                 slotProps={{ textField: { size: 'small' } }}
//                 className="w-full "
//                 value={formik.values.schedule_date ? dayjs(formik.values.ata) : null}
//                 onChange={(newValue: Dayjs | null) => {
//                   if (newValue?.isValid()) formik.setFieldValue('eta', newValue.toISOString());
//                 }}
//               />
//               {getIn(formik.touched, 'eta') && getIn(formik.errors, 'eta') && (
//                 <FormHelperText error id="helper-text-first_name">
//                   {getIn(formik.errors, 'eta')}
//                 </FormHelperText>
//               )}
//             </LocalizationProvider>
//           </Grid>
//           {/*----------------------Ata Date-------------------------- */}
//           <Grid item xs={12} sm={4}>
//             <InputLabel>
//               <FormattedMessage id="Ata Date" />
//               {/* <span className="text-red-500">*</span>  */}
//             </InputLabel>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 format="DD/MM/YYYY"
//                 slotProps={{ textField: { size: 'small' } }}
//                 className="w-full "
//                 value={formik.values.schedule_date ? dayjs(formik.values.ata) : null}
//                 onChange={(newValue: Dayjs | null) => {
//                   if (newValue?.isValid()) formik.setFieldValue('ata', newValue.toISOString());
//                 }}
//               />
//               {getIn(formik.touched, 'ata') && getIn(formik.errors, 'ata') && (
//                 <FormHelperText error id="helper-text-first_name">
//                   {getIn(formik.errors, 'ata')}
//                 </FormHelperText>
//               )}
//             </LocalizationProvider>
//           </Grid>
//           {/*----------------------Schedule Date-------------------------- */}
//           <Grid item xs={12} sm={4}>
//             <InputLabel>
//               <FormattedMessage id="Schedule Date" />
//               {/* <span className="text-red-500">*</span> */}
//             </InputLabel>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DatePicker
//                 format="DD/MM/YYYY"
//                 slotProps={{ textField: { size: 'small' } }}
//                 className="w-full "
//                 value={formik.values.schedule_date ? dayjs(formik.values.schedule_date) : null}
//                 onChange={(newValue: Dayjs | null) => {
//                   if (newValue?.isValid()) formik.setFieldValue('schedule_date', newValue.toISOString());
//                 }}
//               />
//               {getIn(formik.touched, 'schedule_date') && getIn(formik.errors, 'schedule_date') && (
//                 <FormHelperText error id="helper-text-first_name">
//                   {getIn(formik.errors, 'schedule_date')}
//                 </FormHelperText>
//               )}
//             </LocalizationProvider>
//           </Grid>
//         </Grid>
//       </Grid>
//       <Grid item xs={12} className="flex justify-end">
//         <Button
//           type="submit"
//           variant="contained"
//           disabled={formik.isSubmitting}
//           startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
//         >
//           <FormattedMessage id="Submit" />
//         </Button>
//       </Grid>
//     </Grid>
//   );
// };
// export default AddJobWmsForm;
