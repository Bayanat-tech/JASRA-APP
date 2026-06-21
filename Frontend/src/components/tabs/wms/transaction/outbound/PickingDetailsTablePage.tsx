// import { ColDef } from 'ag-grid-community';
// import { AgGridReact } from 'ag-grid-react';
// import CustomAgGrid from 'components/grid/CustomAgGrid';
// import { useEffect, useMemo, useRef, useState } from 'react';
// import WmsSerivceInstance from 'service/wms/service.wms';

// interface PickingDetailsTablePageProps {
//   job_no: string;
//   prin_code: string;
// }

// const PickingDetailsTablePage = ({ job_no, prin_code }: PickingDetailsTablePageProps) => {
//   const [data, setData] = useState<any[]>([]);
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await WmsSerivceInstance.getMasters(
//           'wms',
//           'picking_details',
//           { page: 0, rowsPerPage: 10 },
//           {
//             search: [
//               [{ field_name: 'prin_code', field_value: prin_code, operator: 'exactmatch' }],
//               [{ field_name: 'job_no', field_value: job_no, operator: 'exactmatch' }]
//             ]
//           }
//         );

//         if (Array.isArray(response?.tableData)) {
//           setData(response.tableData || []);
//         } else if (response) {
//           setData([response]);
//         } else {
//           setData([]);
//         }
//       } catch (error) {
//         console.error('Error fetching picking details:', error);
//         setData([]);
//       }
//     };

//     fetchData();
//   }, [job_no, prin_code]);

//   const columnDefs: ColDef[] = useMemo(
//     () => [
//       {
//         headerName: '',
//         field: 'checkbox',
//         width: 100, // Fixed width
//         maxWidth: 40, // Ensures it can't expand
//         minWidth: 40, // Ensures it can't shrink smaller
//         checkboxSelection: true,
//         headerCheckboxSelection: true,
//         headerCheckboxSelectionFilteredOnly: true,
//         sortable: false,
//         filter: false,
//         suppressMenu: true,
//         resizable: false, // Prevent manual resizing
//         cellStyle: {
//           textAlign: 'center',
//           fontSize: '12px'  
//         } as any
//       },
//     {
//         headerName: 'Sr.No',
//         field: 'recordNumber',
//         width: 100,
//         cellStyle: {
//           fontSize: '12px',
//           textAlign: 'left'
//         } as any,
//         minWidth: 60,
//         maxWidth: 60,
//         suppressMenu: true,
//         sortable: false,
//         filter: false,
//         valueGetter: (params: any) => {
//           return (params.node?.rowIndex ?? 0) + 1;
//         }
//       },
      
//       {
//         headerName: 'Product',
//         field: 'prod_code',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       },
//       {
//         headerName: 'Order Number',
//         field: 'order_no',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       },
//       {
//         headerName: 'Primary Quantity',
//         field: 'qty_puom',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       },
//       {
//         headerName: 'Primary UOM',
//         field: 'p_uom',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       },
//       {
//         headerName: 'Lowest Quantity',
//         field: 'qty_luom',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       },
//       {
//         headerName: 'Lowest UOM',
//         field: 'l_uom',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       },
//       {
//         headerName: 'Quantity',
//         field: 'qty_string',
//         minWidth: 130,
//         width: 200,
//         cellStyle: { fontSize: '12px' } as any
//       }
//     ],
//     []
//   );
//   const onSelectionChanged = () => {
//     if (gridRef.current) {
//       const selectedNodes = gridRef.current.api.getSelectedNodes();
//       const selectedData = selectedNodes.map((node: { data: any }) => node.data);
//       setSelectedRows(selectedData);
//     }
//   };

//   const gridRef = useRef<AgGridReact>(null);

//   return (
//     <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
//       <CustomAgGrid
//         rowSelection="multiple"
//         rowData={data}
//         columnDefs={columnDefs}
//         paginationPageSize={10}
//         pagination={true}
//         paginationPageSizeSelector={[10, 50, 100]}
//         rowHeight={30}
//         onSelectionChanged={onSelectionChanged}
//       />

//       {/* Display selected rows count for debugging */}
//       <div style={{ marginTop: '10px' }}>Selected rows: {selectedRows.length}</div>
//     </div>
//   );
// };

// export default PickingDetailsTablePage;
