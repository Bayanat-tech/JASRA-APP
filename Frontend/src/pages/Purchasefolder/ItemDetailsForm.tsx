// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useQuery } from '@tanstack/react-query';
// import PfServiceInstance from 'service/service.purhaseflow'; // Adjust your import as needed
// import { Button, Grid, ButtonGroup, Tooltip, Modal, Box, Typography, TextField, Autocomplete } from '@mui/material';
// // import { DeleteOutlined } from '@mui/icons-material'; // Import the delete icon
// import { TBasicMaterialRequest, TItemMaterialRequest } from '../../../src/pages/Purchasefolder/type/materrequest_pf-types';
// import { IoPrintSharp, IoSendSharp } from 'react-icons/io5';
// import { Add as AddIcon } from '@mui/icons-material';
// import { MdCancelScheduleSend } from 'react-icons/md';
// import { RiArrowGoBackFill } from 'react-icons/ri';
// // import { dispatch } from 'store';
// // import { showAlert } from 'store/CustomAlert/alertSlice';
// //import CustomAgGrid from 'components/grid/CustomAgGrid';
// import { ColDef } from 'ag-grid-community';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// //import { TPurchaserequestPf } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
// import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
// import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
// //import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
// //import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
// //import { TCostmaster } from 'pages/Purchasefolder/type/costmaster-pf-types';
// //import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
// import GmMatServiceInstance from 'service/Purchaseflow/services.material';
// interface ProdOption {
//   uppp(arg0: string, uppp: any): unknown;
//   l_uom(arg0: string, l_uom: any): unknown;
//   p_uom(arg0: string, p_uom: any): unknown;
//   prod_code: string;
//   prod_name: string;
//   upp: number;
// }
// interface CostOption {
//   cost_code: string;
//   cost_name: string;
// }
// interface CostListResponse {
//   tableData: CostOption[];
//   count: number;
// }
// interface ProdListResponse {
//   tableData: ProdOption[];
//   count: number;
// }

// interface ItemDetailsFormProps {
//   itemDetails: TItemMaterialRequest[];
//   setItemDetails: (items: TItemMaterialRequest[]) => void;
//   user: any;
//   isEditMode: boolean;
// }

// interface UomOption {
//   uom_code: string;
//   uom_name: string;
// }

// interface UomListResponse {
//   tableData: UomOption[];
//   count: number;
// }

// const ItemDetailsForm: React.FC<ItemDetailsFormProps> = ({ itemDetails, setItemDetails, user }) => {
//   // Accessing the app from Redux store
//   const { app } = useSelector((state: any) => state.menuSelectionSlice);

//   const [editingIndex, setEditingIndex] = useState<number | null>(null);

//   // Ref for grid wrapper div
//   const gridWrapperRef = React.useRef(null);

//   // const gridRef = React.useRef<AgGridReact<TItemMaterialRequest>>(null);

//   // State for Modal open/close
//   const [open, setOpen] = useState(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   // Fetch product list using react-query
//   // useQuery<ProdListResponse>({
//   //   queryKey: ['prod_data'],
//   //   queryFn: async () => {
//   //     if (!app) return { tableData: [], count: 0 };
//   //     const response = await PfServiceInstance.getMasters(app, 'ddprodmaster', { page: 1, rowsPerPage: 20 }, null, '10');
//   //     return response ? { tableData: response.tableData as ProdOption[], count: response.count } : { tableData: [], count: 0 };
//   //   },
//   //   enabled: !!app
//   // });

//   useEffect(() => {
//     console.log('typeof setItemDetails', typeof setItemDetails);
//     console.log('setItemDetails', setItemDetails);
//   }, []);

//   const { data: prodList } = useQuery<ProdListResponse>({
//     queryKey: ['prod_data', app],
//     queryFn: async () => {
//       if (!app) return { tableData: [], count: 0 };
//       const response = await GmPfServiceInstance.getddProductMaster('10');
//       if (!response) return { tableData: [], count: 0 };

//       // Transform the response data to match ProdOption type
//       const transformedData = (Array.isArray(response) ? response : [response]).map((item) => ({
//         prod_code: item.prod_code || '',
//         prod_name: item.prod_name || '',
//         upp: item.upp || 0,
//         ...item // Include other properties if needed
//       }));

//       return {
//         tableData: transformedData,
//         count: transformedData.length
//       };
//     },
//     enabled: !!app
//   });

//   const { data: costList } = useQuery<CostListResponse>({
//     queryKey: ['cost_data', app],
//     queryFn: async () => {
//       if (!app) return { tableData: [], count: 0 };
//       const response = await PfServiceInstance.getMasters(app, 'ddcostmaster');
//       return response ? { tableData: response.tableData as CostOption[], count: response.count } : { tableData: [], count: 0 };
//     },
//     enabled: !!app
//   });

//   const { data: uomList } = useQuery<UomListResponse>({
//     queryKey: ['uom_data', app],
//     queryFn: async () => {
//       if (!app) return { tableData: [], count: 0 };
//       const response = await PfServiceInstance.getMasters(app, 'dduommaster');
//       return response ? { tableData: response.tableData as UomOption[], count: response.count } : { tableData: [], count: 0 };
//     },
//     enabled: !!app
//   });

//   // Fetch project list using react-query
//   interface ProjectOption {
//     cost_code: string;
//     project_code: string;
//     project_name: string;
//   }
//   interface ProjectListResponse {
//     tableData: ProjectOption[];
//     count: number;
//   }
//   const { data: projectList } = useQuery<ProjectListResponse>({
//     queryKey: ['project_data', app],
//     queryFn: async () => {
//       if (!app) return { tableData: [], count: 0 };
//       const response = await PfServiceInstance.getMasters(app, 'projectmaster');
//       return response ? { tableData: response.tableData as ProjectOption[], count: response.count } : { tableData: [], count: 0 };
//     },
//     enabled: !!app
//   });

//   const handleSubmit = () => {
//     if (!headerData.cost_code) {
//       alert("Please select a valid 'To Cost Code'");
//       return;
//     }

//     const newItem: TItemMaterialRequest = {
//       ...headerData,
//       item_p_qty: Number(headerData.item_p_qty) || 0,
//       item_l_qty: Number(headerData.item_l_qty) || 0,
//       item_rate: Number(headerData.item_rate) || 0,
//       //remarks: headerData.remarks || '',
//       p_uom: headerData.p_uom || '',
//       l_uom: headerData.l_uom || '',
 
//       item_code: headerData.prod_code || '',
  
//       to_project_code:  '',
//       from_project_code: '',
//       to_cost_code: ''
     
//     };

//     let updatedItems = [...itemDetails];

//     if (editingIndex !== null) {
//       // Replace existing item
//       updatedItems[editingIndex] = newItem;
//     } else {
//       // Add new item
//       updatedItems.push(newItem);
//     }

//     setItemDetails(updatedItems);

//     // Reset form
//     setHeaderData({
//       request_date: new Date(),
//       prod_name: '',
//       project_code: '',
//       cost_code: '',
//       prod_code: '',
//       item_p_qty: 0,
//       p_uom: '',
//       item_l_qty: 0,
//       l_uom: '',
//       item_rate: 0,
//       remarks: '',
//       description: ''
//     });

//     setEditingIndex(null);
//     setOpen(false); // ✅ Close the modal
//   };

//   const handleReject = () => console.log('Reject clicked');
//   const handleSentback = () => console.log('Sentback clicked');
//   const handlePRPrint = () => console.log('PR Print clicked');

//   const columnDefs = React.useMemo<ColDef<any>[]>(
//     () => [
//       {
//         field: 'action',
//         headerName: 'Action',
//         width: 80,
//         pinned: true,
//         cellRenderer: (params: any) => {
//           return (
//             <div className="flex justify-center items-center gap-2">
//               <EditOutlined
//                 style={{
//                   cursor: 'pointer',
//                   fontSize: '16px'
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleEditItem(params.node.rowIndex);
//                 }}
//               />
//               <DeleteOutlined
//                 style={{
//                   cursor: 'pointer',
//                   color: 'red',
//                   fontSize: '16px'
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleRemoveItem(params.node.rowIndex);
//                 }}
//               />
//             </div>
//           );
//         },
//         headerClass: 'flex justify-center'
//       },
//       {
//         headerName: 'From Project Code',
//         field: 'from_project_code',
//         headerClass: 'flex justify-center',
//         width: 210
//       },
//       {
//         headerName: 'To Project Code',
//         field: 'to_project_code',
//         headerClass: 'flex justify-center',
//         width: 210
//       },
//       {
//         headerName: 'From Cost Code',
//         field: 'from_cost_code',
//         headerClass: 'flex justify-center',
//         width: 210
//       },
//       {
//         headerName: 'To Cost Code',
//         field: 'to_cost_code',
//         headerClass: 'flex justify-center',
//         width: 210
//       },
//       {
//         headerName: 'Item Code',
//         field: 'item_code',
//         headerClass: 'flex justify-center',
//         sortable: true,
//         filter: true
//       },
//       {
//         headerName: 'P Quantity',
//         width: 130,
//         type: 'numericColumn',
//         field: 'item_p_qty',
//         sortable: true,
//         filter: true
//       },
//       {
//         headerName: 'P UOM',
//         field: 'p_uom',
//         width: 130,
//         valueGetter: (params) => {
//           const uom = uomList?.tableData?.find((uomItem) => uomItem.uom_code === params.data.p_uom);

//           return uom?.uom_name || params.data.p_uom || '';
//         },
//         suppressCellFlash: true,
//         suppressMovable: true,
//         suppressAutoSize: true
//       },
//       {
//         headerName: 'L Quantity',
//         field: 'item_l_qty',
//         width: 130,
//         type: 'numericColumn'
//       },
//       {
//         headerName: 'L UOM',
//         field: 'l_uom'
//       },
//       {
//         headerName: 'Total Qty',
//         field: 'item_p_qty',

//         width: 130,
//         type: 'numericColumn'
//       },
//       {
//         field: 'upp',
//         headerName: 'UPPP',
//         type: 'numericColumn',

//         headerClass: 'flex justify-center',
//         cellStyle: { backgroundColor: 'lightGrey' }
//       },
//       {
//         headerName: 'Item Rate',
//         field: 'item_rate',
//         type: 'numericColumn',
//         width: 130
//       },

//       {
//         headerName: 'Remarks',
//         field: 'remarks'
//       }
//     ],
//     [uomList]
//   );
//   useEffect(() => {
//     const saved = localStorage.getItem('itemDetails');
//     if (saved) {
//       setItemDetails(JSON.parse(saved));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('itemDetails', JSON.stringify(itemDetails));
//   }, [itemDetails]);

//   React.useEffect(() => {
//     const updatedItems =
//       itemDetails?.length > 0
//         ? itemDetails.map((item, index) => ({
//             ...item,
//             originalIndex: index,
//             //from_project_code: item.from_project_code,
//            //  to_project_code: item.to_project_code,
//            // from_cost_code: item.from_cost_code,  
//            // to_code_code: item.to_cost_code,
//             item_p_qty: Number(item.item_p_qty) || 0,
//             item_l_qty: Number(item.item_l_qty) || 0,
//             item_rate: Number(item.item_rate) || 0,
//         //   remarks: item.remarks || '',
//             p_uom: item.p_uom || '',
//             l_uom: item.l_uom || '',
//           //  project_code: item.project_code || '',
//           //  cost_code: item.cost_code || '',
//             prod_code: item.item_code || ''
//           }))
//         : [];

//     console.log('Original itemDetails:', itemDetails);
//     console.log('Transformed updatedItems:', updatedItems);

//     // Only update if values are actually different
//     const isDifferent = JSON.stringify(itemDetails) !== JSON.stringify(updatedItems);
//     console.log('Is data different?', isDifferent);

//     if (isDifferent) {
//       console.log('Updating itemDetails...');
//       setItemDetails(updatedItems);
//     } else {
//       console.log('No update needed.');
//     }
//   }, [itemDetails]);

//   const handleUpdate = async () => {
//     const basicMaterialRequest: TBasicMaterialRequest = {
      
//       items: itemDetails.map((item) => ({
//         item_code: item.item_code,
//         item_rate: Number(item.item_rate), // ensures it's number
//         p_uom: item.p_uom,
//         item_p_qty: item.item_p_qty,
//         item_l_qty: item.item_l_qty,
        
//         l_uom: item.l_uom,
//         from_cost_code: item.from_cost_code,
//         to_cost_code: item.to_cost_code,
//         from_project_code: item.from_project_code,
//         to_project_code: item.to_project_code
//       }))
//     };
// console.log("update api",basicMaterialRequest);
//     const success = await GmMatServiceInstance.updatematerialrequest(basicMaterialRequest);

//     if (success) {
//       console.log('Material request submitted successfully');
//       // Optional: reset form, refresh list, etc.
//     }
//   };

//   const handleEditItem = (index: number) => {
//     const item = itemDetails[index];
//     if (!item) return;

//     setEditingIndex(index);
//     setHeaderData({
//       request_date: new Date(),
//       project_code:  '',
//       cost_code:  '',
//       prod_code: item.item_code ?? '',
//       prod_name:  '',
//       item_p_qty: item.item_p_qty ?? 0,
//       p_uom: item.p_uom ?? '',
//       item_l_qty: item.item_l_qty ?? 0,
//       l_uom: item.l_uom ?? '',
//       item_rate: item.item_rate ?? 0,
//       remarks: '',
//       description: ''
//     });

//     setOpen(true); // THIS IS THE FIX
//   };

//   // State for modal form fields
//   const [headerData, setHeaderData] = useState({
//     request_date: new Date(),
//     project_code: '',
//     cost_code: '',
//     prod_code: '',
//     prod_name: '',
//     item_p_qty: 0,
//     p_uom: '',
//     item_l_qty: 0,
//     l_uom: '',
//     item_rate: 0,
//     remarks: '',
//     description: ''
//   });
//   const handleRemoveItem = (index: number) => {
//     if (index < 0 || index >= itemDetails.length) return;

//     const updatedItems = [...itemDetails];
//     updatedItems.splice(index, 1);
//     setItemDetails(updatedItems);
//   };

//   const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
//   const userLevel = user?.user_level ?? null;

//   const [currentItem] = React.useState<any>({
//     prod_code: '',
//     item_desp: '',
//     item_group_code: '',
//     item_rate: 0,
//     p_uom: '',
//     flow_level_running: 1,
//     l_uom: '',
//     upp: 1,
//     item_l_qty: 1,
//     item_p_qty: 0,
//     appr_upp: 0,
//     appr_item_l_qty: 0,
//     appr_item_p_qty: 0,
//     currency_rate: 0,
//     amount: 0,
//     company_code: '',
//     updated_at: new Date(),
//     updated_by: '',
//     request_number: '',
//     curr_code: '',
//     lcurr_amt: 0,
//     allocated_approved_quantity: 0,
//     selected_item: '',
//     last_action: 'SAVEASDRAFT',
//     history_serial: 0,
//     curr_name: '',
//     item_sequence_no: 0,
//     item_srno: 0,
//     supplier_part_code: '',
//     rate_method: '',
//     supplier: '',
//     select_item: '',
//     discount_amount: 0,
//     final_rate: 0,
//     item_cancel: '',
//     mail_attach: '',
//     cash_ind: '',

//     addl_item_desc: '',
//     pr_amount: 0,
//     po_amount: 0,
//     month_budget: 0,
//     ac_name: '',
//     cost_code: '',
//     cost_name: '',
//     ref_doc_no: '',
//     doc_date: null
//   });
//   function handleHeaderChange(field: string, value: any): void {
//     setHeaderData((prev: any) => ({
//       ...prev,
//       [field]: value
//     }));
//     setTouchedFields((prev) => ({
//       ...prev,
//       [field]: true
//     }));
//   }

//   const handleBlur = (field: string) => {
//     setTouchedFields((prev) => ({ ...prev, [field]: true }));
//   };

//   return (
//     <div ref={gridWrapperRef} className="ag-theme-alpine grid-wrapper tab-content" style={{ width: '100%', overflowX: 'auto' }}>
//       {/* <AgGridReact
//           ref={gridRef}
//           columnDefs={columnDefs}
//           rowData={itemDetails}
//           defaultColDef={{
//             resizable: true,
//             sortable: true,
//             filter: true
//           }}
//           animateRows={true}
//           suppressCellFocus={true}
//           domLayout="autoHeight"
//         /> */}

//       <AgGridReact
//         rowData={itemDetails}
//         //onCellValueChanged={onCellValueChanged}
//         columnDefs={columnDefs}
//         defaultColDef={{ resizable: true, sortable: true, filter: false }}
//         domLayout="autoHeight"
//         animateRows={true}
//         rowHeight={20}
//         headerHeight={25}
//         overlayNoRowsTemplate="<span>No data to display</span>"
//         suppressDragLeaveHidesColumns={true}
//         suppressRowTransform={true}
//       />
//       {/* Calculate totalAmount as the sum of item_p_qty * item_rate for each item */}
//       {(() => {
//         const totalAmount = itemDetails.reduce((sum, item) => sum + (Number(item.item_p_qty) || 0) * (Number(item.item_rate) || 0), 0);
//         return (
//           <div className="flex gap-2 mt-4 justify-between">
//             <React.Fragment>
//               <Button sx={{ backgroundColor: '#082a89' }} variant="contained" size="small" endIcon={<AddIcon />} onClick={handleOpen}>
//                 Add Row
//               </Button>
//             </React.Fragment>
//             <div className="flex gap-2 items-center">
//               <Typography sx={{ fontWeight: 'bold' }}>TOTAL</Typography>
//               <TextField
//                 margin="none"
//                 type="text"
//                 size="small"
//                 value={totalAmount.toFixed(2)} // Optional: format to 2 decimal places
//                 InputProps={{
//                   readOnly: true,
//                   style: {
//                     textAlign: 'right',
//                     fontWeight: 'bold'
//                   }
//                 }}
//                 sx={{
//                   width: '120px',
//                   '& .MuiInputBase-input': {
//                     textAlign: 'right'
//                   }
//                 }}
//               />
//             </div>
//           </div>
//         );
//       })()}

//       <Grid item xs={12} marginTop={2} display="flex" justifyContent="space-between" alignItems="center">
//         <ButtonGroup variant="contained" size="small" aria-label="Basic button group">
//           <>
//             <Modal open={open} onClose={handleClose} aria-labelledby="add-row-modal-title" aria-describedby="add-row-modal-description">
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   top: '50%',
//                   left: '50%',
//                   transform: 'translate(-50%, -50%)',
//                   width: '80vw',
//                   bgcolor: 'background.paper',
//                   borderRadius: 2,
//                   boxShadow: 24,
//                   p: 4
//                 }}
//               >
//                 <Typography id="add-row-modal-title" variant="h6" component="h2" gutterBottom>
//                   Add Details
//                 </Typography>

//                 <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                   <Box
//                     sx={{
//                       border: '0.5px solid #b0b0b0',
//                       borderRadius: 1,
//                       padding: 2,
//                       display: 'flex',
//                       flexDirection: 'column',
//                       gap: 2,
//                       bgcolor: '#effaff'
//                     }}
//                   >
//                     <Box sx={{ display: 'flex', gap: 2 }}>
//                       <Autocomplete
//                         fullWidth
//                         options={projectList?.tableData ?? []}
//                         getOptionLabel={(option) => option.project_name}
//                         disabled={userLevel !== null && userLevel > 1}
//                         onChange={(event, value) => handleHeaderChange('project_code', value ? value.project_code : '')}
//                         onBlur={() => handleBlur('project_code')}
//                         value={projectList?.tableData?.find((project) => project.project_code === headerData.project_code) || null}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="From Project Code"
//                             variant="outlined"
//                             disabled={!!userLevel && userLevel > 1}
//                             sx={{
//                               maxWidth: '700px',
//                               '& .MuiInputBase-input': { fontSize: '0.8rem' },
//                               '& .MuiInputLabel-root': { fontSize: '0.75rem' },
//                               '& .MuiOutlinedInput-root': {
//                                 '& fieldset': {
//                                   borderColor: touchedFields.project_code && !headerData?.project_code ? 'red' : 'default'
//                                 }
//                               }
//                             }}
//                           />
//                         )}
//                       />

//                       <Autocomplete
//                         options={projectList?.tableData ?? []}
//                         fullWidth
//                         getOptionLabel={(option) => option.project_name}
//                         disabled={userLevel !== null && userLevel > 1}
//                         onChange={(event, value) => handleHeaderChange('project_code', value ? value.project_code : '')}
//                         onBlur={() => handleBlur('project_code')}
//                         value={projectList?.tableData?.find((project) => project.project_code === headerData.project_code) || null}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="To Project Code"
//                             variant="outlined"
//                             disabled={!!userLevel && userLevel > 1}
//                             sx={{
//                               maxWidth: '700px',
//                               '& .MuiInputBase-input': { fontSize: '0.8rem' },
//                               '& .MuiInputLabel-root': { fontSize: '0.75rem' },
//                               '& .MuiOutlinedInput-root': {
//                                 '& fieldset': {
//                                   borderColor: touchedFields.project_code && !headerData?.project_code ? 'red' : 'default'
//                                 }
//                               }
//                             }}
//                           />
//                         )}
//                       />
//                     </Box>

//                     <Box sx={{ display: 'flex', gap: 2 }}>
//                       <Autocomplete
//                         options={costList?.tableData ?? []}
//                         fullWidth
//                         getOptionLabel={(option) => option.cost_code}
//                         disabled={userLevel !== null && userLevel > 1}
//                         onChange={(event, value) => {
//                           console.log('Selected value:', value);
//                           handleHeaderChange('cost_code', value ? value.cost_code : '');
//                         }}
//                         value={costList?.tableData?.find((project) => project.cost_code === headerData?.cost_code) || null}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="From Cost Code"
//                             variant="outlined"
//                             sx={{
//                               maxWidth: '700px',
//                               '& .MuiInputBase-input': { fontSize: '0.8rem' },
//                               '& .MuiInputLabel-root': { fontSize: '0.75rem' },
//                               '& .MuiOutlinedInput-root': {
//                                 '& fieldset': {
//                                   borderColor: touchedFields.cost_code && !headerData?.cost_code ? 'red' : 'default'
//                                 }
//                               }
//                             }}
//                           />
//                         )}
//                       />

//                       <Autocomplete
//                         options={costList?.tableData ?? []}
//                         fullWidth
//                         getOptionLabel={(option) => option.cost_code}
//                         disabled={userLevel !== null && userLevel > 1}
//                         onChange={(event, value) => {
//                           console.log('Selected value:', value);
//                           handleHeaderChange('cost_code', value ? value.cost_code : '');
//                         }}
//                         value={costList?.tableData?.find((project) => project.cost_code === headerData?.cost_code) || null}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="To Cost Code"
//                             variant="outlined"
//                             sx={{
//                               maxWidth: '700px',
//                               '& .MuiInputBase-input': { fontSize: '0.8rem' },
//                               '& .MuiInputLabel-root': { fontSize: '0.75rem' },
//                               '& .MuiOutlinedInput-root': {
//                                 '& fieldset': {
//                                   borderColor: touchedFields.cost_code && !headerData?.cost_code ? 'red' : 'default'
//                                 }
//                               }
//                             }}
//                           />
//                         )}
//                       />
//                     </Box>
//                   </Box>

//                   <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
//                     {/* Item Code - full width */}
//                     <Box sx={{ flex: 1 }}>
//                       <Autocomplete
//                         fullWidth
//                         id=" prod_name"
//                         size="small"
//                         options={prodList?.tableData || []}
//                         getOptionLabel={(option) => option.prod_name || ''}
//                         onChange={(event, value) => {
//                           handleHeaderChange('prod_name', value?.prod_name ?? '');
//                           handleHeaderChange('prod_code', value?.prod_code ?? '');
//                           if (value?.l_uom) {
//                             handleHeaderChange('l_uom', value.l_uom);
//                             handleHeaderChange('p_uom', value.p_uom);
//                             handleHeaderChange('upp', value.upp);
//                           }
//                         }}
//                         value={prodList?.tableData?.find((prod: { prod_name: string }) => prod.prod_name === headerData?.prod_name) || null}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="Item Code"
//                             variant="outlined"
//                             fullWidth
//                             sx={{
//                               '& .MuiInputBase-root': {
//                                 height: '40px',
//                                 paddingTop: '0px',
//                                 paddingBottom: '0px'
//                               },
//                               '& .MuiInputLabel-outlined': {
//                                 transform: 'translate(14px, 10px) scale(1)',
//                                 '&.MuiInputLabel-shrink': {
//                                   transform: 'translate(14px, -9px) scale(0.75)'
//                                 }
//                               }
//                             }}
//                           />
//                         )}
//                         noOptionsText="No options available"
//                       />
//                     </Box>

//                     {/* P UOM - half width */}
//                     <Box sx={{ flex: 0.5 }}>
//                       <Autocomplete
//                         fullWidth
//                         id="p_uom"
//                         size="small"
//                         options={uomList?.tableData || []}
//                         getOptionLabel={(option) => option.uom_name || ''}
//                         onChange={(event, value) => handleHeaderChange('p_uom', value?.uom_code ?? '')}
//                         value={uomList?.tableData?.find((uom: { uom_code: string }) => uom.uom_code === currentItem?.p_uom) || null}
//                         renderInput={(params) => (
//                           <TextField
//                             {...params}
//                             label="P UOM *"
//                             variant="outlined"
//                             fullWidth
//                             sx={{
//                               '& .MuiInputBase-root': {
//                                 height: '40px',
//                                 paddingTop: '0px',
//                                 paddingBottom: '0px'
//                               },
//                               '& .MuiInputLabel-outlined': {
//                                 transform: 'translate(14px, 10px) scale(1)',
//                                 '&.MuiInputLabel-shrink': {
//                                   transform: 'translate(14px, -9px) scale(0.75)'
//                                 }
//                               }
//                             }}
//                           />
//                         )}
//                         noOptionsText="No options available"
//                       />
//                     </Box>

//                     {/* P Quantity - half width */}
//                     <Box sx={{ flex: 0.5 }}>
//                       <TextField
//                         fullWidth
//                         label="P Quantity"
//                         name="item_p_qty"
//                         type="number"
//                         size="small"
//                         value={headerData.item_p_qty}
//                         onChange={(e) => handleHeaderChange('item_p_qty', e.target.value)}
//                         InputProps={{
//                           sx: {
//                             height: '40px',
//                             paddingTop: '0px',
//                             paddingBottom: '0px',
//                             input: {
//                               textAlign: 'right'
//                             }
//                           }
//                         }}
//                         sx={{
//                           '& .MuiInputBase-root': {
//                             height: '40px'
//                           },
//                           '& .MuiInputLabel-outlined': {
//                             transform: 'translate(14px, 10px) scale(1)',
//                             '&.MuiInputLabel-shrink': {
//                               transform: 'translate(14px, -9px) scale(0.75)'
//                             }
//                           }
//                         }}
//                       />
//                     </Box>
//                   </Box>

//                   <Box sx={{ display: 'flex', gap: 2 }}>
//                     <Autocomplete
//                       fullWidth
//                       id="l_uom"
//                       size="small"
//                       options={uomList?.tableData || []}
//                       getOptionLabel={(option) => option.uom_name || ''}
//                       onChange={(event, value) => handleHeaderChange('l_uom', value?.uom_code ?? '')}
//                       value={uomList?.tableData?.find((uom) => uom.uom_code === headerData?.l_uom) || null}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           label="L UOM *"
//                           variant="outlined"
//                           fullWidth
//                           sx={{
//                             '& .MuiInputBase-root': {
//                               height: '40px',
//                               paddingTop: '0px',
//                               paddingBottom: '0px'
//                             },
//                             '& .MuiInputLabel-outlined': {
//                               transform: 'translate(14px, 10px) scale(1)',
//                               '&.MuiInputLabel-shrink': {
//                                 transform: 'translate(14px, -9px) scale(0.75)'
//                               }
//                             }
//                           }}
//                         />
//                       )}
//                       noOptionsText="No options available"
//                     />
//                     <TextField
//                       label="L Quantity"
//                       name="item_l_qty"
//                       value={headerData.item_l_qty}
//                       onChange={(e) => handleHeaderChange('item_l_qty', e.target.value)}
//                       type="number"
//                       fullWidth
//                       InputProps={{
//                         sx: {
//                           height: '40px',
//                           paddingTop: '0px',
//                           paddingBottom: '0px',
//                           input: {
//                             textAlign: 'right'
//                           }
//                         }
//                       }}
//                     />
//                     <TextField
//                       label="Item Rate"
//                       name="item_rate"
//                       type="number"
//                       fullWidth
//                       value={headerData.item_rate}
//                       onChange={(e) => handleHeaderChange('item_rate', e.target.value)}
//                       InputProps={{
//                         sx: {
//                           height: '40px',
//                           paddingTop: '0px',
//                           paddingBottom: '0px',
//                           input: {
//                             textAlign: 'right'
//                           }
//                         }
//                       }}
//                     />

//                     <Box sx={{ flex: 1 }} />
//                   </Box>

//                   <TextField
//                     label="Remarks"
//                     name="remarks"
//                     fullWidth
//                     multiline
//                     rows={2}
//                     value={headerData.remarks}
//                     onChange={(e) => handleHeaderChange('remarks', e.target.value)}
//                   />

//                   <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
//                     <ButtonGroup>
//                       <Button
//                         sx={{ backgroundColor: '#082a89', color: 'white' }}
//                         color="primary"
//                         endIcon={<IoSendSharp />}
//                         onClick={handleSubmit}
//                       >
//                         Submit
//                       </Button>
//                     </ButtonGroup>
//                     <Button onClick={handleClose} color="inherit">
//                       Cancel
//                     </Button>
//                   </Box>
//                 </Box>
//               </Box>
//             </Modal>
//           </>
//           <Button
//             sx={{ backgroundColor: '#082a89', color: 'white' }}
//             color="primary"
//             size="small"
//             endIcon={<IoSendSharp />}
//             onClick={handleUpdate}
//           >
//             Submit
//           </Button>

//           <Button
//             sx={{ backgroundColor: '#082a89' }}
//             color="primary"
//             size="small"
//             endIcon={<MdCancelScheduleSend />}
//             onClick={handleReject}
//           >
//             Reject
//           </Button>
//           <Button sx={{ backgroundColor: '#082a89' }} color="primary" size="small" endIcon={<RiArrowGoBackFill />} onClick={handleSentback}>
//             Send Back
//           </Button>
//         </ButtonGroup>
//         <ButtonGroup variant="outlined" size="medium" aria-label="Basic button group">
//           <Tooltip title="Print & View">
//             <Button sx={{ backgroundColor: '#082a89', color: 'white' }} variant="outlined" color="primary" onClick={handlePRPrint}>
//               <IoPrintSharp />
//             </Button>
//           </Tooltip>
//         </ButtonGroup>
//       </Grid>
//     </div>
//   );
// };

// export default ItemDetailsForm;
