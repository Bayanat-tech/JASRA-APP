// import { PlusOutlined } from '@ant-design/icons';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { useEffect, useState } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

// import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

import AddShipmentWmsForm from 'components/forms/Wms/Transaction/Inbound/AddInboundShipmentDetailsForm';

import { TContainerDetails } from 'pages/WMS/Transaction/Inbound/types/shipmentDetails.types';
import { FormattedMessage } from 'react-intl';

// import shipmentServiceInstance from 'service/wms/transaction/inbound/service.shipmentDetailsWms';
import shipmentServiceInstance from 'service/wms/transaction/inbound/service.shipmentDetailsWms';
// import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';

const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const rowsPerPageOptions = [10, 20, 50, 100, 500, 1000, 10000];

const ShipmentDetailsWmsTab = ({
  job_no,
  prin_code
}: {
  job_no: string;
  prin_code: string;
}) => {
  //--------------constants----------
  const [paginationData, ] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[3] });
  const [, setToggleFilter] = useState<boolean | null>(null);
  const [filterData,] = useState<ISearch>(filter);
  const [, setSelectedRows] = useState<TContainerDetails[]>([]);
  // Remove menuAnchorEl for top-level menu
  // const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // For row menu
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [rowMenuData, setRowMenuData] = useState<TContainerDetails | null>(null);

  const [shipmentFormPopup, setShipmentFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Shipment Detail" />,
    data: { existingData: {}, isEditMode: false }
  });
  // const columns = useMemo<ColumnDef<TContainerDetails>[]>(
  //   () => [
  //     {
  //       id: 'select-col',
  //       header: ({ table }) => (
  //         <Checkbox
  //           checked={table.getIsAllRowsSelected()}
  //           indeterminate={table.getIsSomeRowsSelected()}
  //           onChange={table.getToggleAllRowsSelectedHandler()}
  //         />
  //       ),
  //       cell: ({ row }) => (
  //         <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
  //       )
  //     },
  //     {
  //       accessorFn: (row) => row.container_no,
  //       id: 'container_no',
  //       header: () => <FormattedMessage id="Container No" />
  //     },
  //     {
  //       accessorFn: (row) => row.truck_no,
  //       id: 'truck_no',
  //       header: () => <FormattedMessage id="" />
  //     },
  //     {
  //       accessorFn: (row) => row.asn_no,
  //       id: 'asn_no',
  //       header: () => <FormattedMessage id="ASN No" />
  //     },
  //     {
  //       accessorFn: (row) => row.po_no,
  //       id: 'po_no',
  //       header: () => <FormattedMessage id="PO No" />
  //     },
  //     {
  //       accessorFn: (row) => row.bl_no,
  //       id: 'bl_no',
  //       header: () => <FormattedMessage id="BL NO" />
  //     },
  //     {
  //       accessorFn: (row) => row.cust_decl_no,
  //       id: 'cust_decl_no',
  //       header: () => <FormattedMessage id="Customs Dec No" />
  //     },
  //     {
  //       accessorFn: (row) => row.doc_ref_no,
  //       id: 'doc_ref_no',
  //       header: () => <FormattedMessage id="Doc Reference No" />
  //     },
  //     {
  //       id: 'actions',
  //       enableHiding: true,
  //       header: () => <FormattedMessage id="Actions" />,

  //       cell: ({ row }) => {
  //         const actionButtons: TAvailableActionButtons[] = ['edit'];

  //         return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
  //       }
  //     }
  //   ],
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // );

  const getAgGridColumns = (handleActions: any): ColDef[] => [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
     pinned: 'left',
      width: 50,
      maxWidth: 50,
      resizable: false,
      sortable: false,
      filter: false,
    },
    {
      field: 'CONTAINER_NO',
      headerName: 'Container No',
      minWidth: 150,
      cellStyle: { fontSize: '8px', },
    },
   {
      field: 'VEHICLE_NO',
      headerName: 'Truck No',
      minWidth: 120,
      cellStyle: { fontSize: '10px', },
    },
    {
      field: 'ASN_NO',
      headerName: 'ASN No',
      minWidth: 120,
      cellStyle: { fontSize: '10px', },
    },
    {
      field: 'PO_NO',
      headerName: 'PO No',
      minWidth: 120,
      cellStyle: { fontSize: '10px', },
    },
    {
      field: 'BL_NO',
      headerName: 'BL NO',
      minWidth: 120,
      cellStyle: { fontSize: '10px', },
    },
    {
      field: 'CUST_DECL_NO',
      headerName: 'Customs Dec No',
      minWidth: 120,
      cellStyle: { fontSize: '10px', },
    },
    {
      field: 'DOC_REF_NO',
      headerName: 'Doc Reference No',
      minWidth: 120,
      cellStyle: { fontSize: '10px', },
    },
    {
      headerName: 'Actions',
      filter: false,
      field: 'actions',
      cellRenderer: (params: any) => {
        // Three-dot menu for row actions (edit, delete, delete all)
        return (
          <>
            <IconButton
              size="small"
              onClick={(e) => {
                setRowMenuAnchorEl(e.currentTarget);
                setRowMenuData(params.data);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </>
        );
      },
      minWidth: 60,
      pinned: 'right'
    }
  ];

  //----------- useQuery--------------
  const {
    data: shipmentData,
    // isFetching: isShipmentFetchLoading,
    refetch: refetchShipmentData
  } = useQuery({
    queryKey: ['shipment_details', filterData, paginationData, job_no, prin_code],
    queryFn: async () => {
      if (!prin_code || !job_no) return { tableData: [] };
      const sql = `SELECT * FROM TI_CONTAINER WHERE PRIN_CODE = '${prin_code}' AND JOB_NO = '${job_no}'`;
      try {
        const json = await WmsSerivceInstance.executeRawSql(sql);
        // Normalize response into { tableData: [] } shape expected by the grid
        if (Array.isArray(json)) return { tableData: json };
        if (Array.isArray((json as any).data)) return { tableData: (json as any).data };
        if (Array.isArray((json as any).result)) return { tableData: (json as any).result };
        if (Array.isArray((json as any).tableData)) return { tableData: (json as any).tableData };
        return { tableData: (json as any).rows || (json as any).records || [] };
      } catch (err) {
        console.error('Error fetching shipment details via executeRawSql:', err);
        return { tableData: [] };
      }
    },
    enabled: !!job_no
  });
  //-------------handlers---------------
  // const handleChangePagination = (page: number, rowsPerPage: number) => {
  //   setPaginationData({ page, rowsPerPage });
  // };

  const handleEditShipment = (existingData: TContainerDetails) => {
    setShipmentFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Shipment" />,

        data: { existingData: { ...existingData, prin_code, job_no }, isEditMode: true }
      };
    });
  };

  const handleDelete = async (rowsToDelete: TContainerDetails[]) => {
    if (!rowsToDelete.length) return;
    const deleteData = rowsToDelete.map((item) => ({
      prin_code: item.prin_code as string,
      job_no: item.job_no as string,
      container_no: item.container_no as string
    }));
    await shipmentServiceInstance.deleteShipmentDetails(deleteData);
    setSelectedRows([]);
    refetchShipmentData();
  };

  const handleDeleteRow = async (row: TContainerDetails) => {
    try {
      await handleDelete([row]);
      setRowMenuAnchorEl(null);
      setRowMenuData(null);
      // Force refresh after delete
      setTimeout(() => {
        refetchShipmentData();
      }, 100);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!shipmentData?.tableData?.length) return;
    try {
      await handleDelete(shipmentData.tableData as TContainerDetails[]);
      setRowMenuAnchorEl(null);
      setRowMenuData(null);
      // Force refresh after delete all
      setTimeout(() => {
        refetchShipmentData();
      }, 100);
    } catch (error) {
      console.error('Error deleting all rows:', error);
    }
  };

  const toggleShipmentPopup = (refetchData?: boolean) => {
    if (shipmentFormPopup.action.open === true && refetchData) {
      // Force refresh after form submission
      setTimeout(() => {
        refetchShipmentData();
      }, 100);
    }
    setShipmentFormPopup((prev) => {
      return {
        ...prev,
        data: { isEditMode: false, existingData: { prin_code, job_no } },
        action: { ...prev.action, open: !prev.action.open }
      };
    });
  };

  const handleActions = (actionType: string, rowOriginal: TContainerDetails) => {
    if (actionType === 'edit') handleEditShipment(rowOriginal);
    if (actionType === 'delete') handleDeleteRow(rowOriginal);
  };

  // const handleFilterChange = (value: ISearch['search']) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       search: value
  //     };
  //   });
  // };
  // const handleSortingChange = (sorting: SortingState) => {
  //   setFilterData((prevData) => {
  //     return {
  //       ...prevData,
  //       sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
  //     };
  //   });
  // };

  // const handleImportData = async (values: TContainerDetails[]) => {
  //   const response = await shipmentServiceInstance.addBulkData(values);
  //   if (response) {
  //     refetchShipmentData();
  //     return response;
  //   }
  //   return false;
  // };

  // const handleExportData = async () => {
  //   const response = await shipmentServiceInstance.exportData(filterData);
  //   if (response) {
  //     refetchShipmentData();
  //     return response;
  //   }
  //   return false;
  // };
  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null);
  }, []);
  //---------custom-filter------
  // const customFilter = (
  //   <div className="flex justify-end space-x-2 w-full p-2">
  //     {/* Delete button removed, now handled by parent */}
  //     <Button
  //       sx={{
  //             backgroundColor: "#fff",
  //             color: "#082A89",
  //             border: "1.5px solid #082A89",
  //             fontWeight: 600,
  //             '&:hover': {
  //               backgroundColor: "#082A89",
  //               color: "#fff",
  //               border: "1.5px solid #082A89"
  //             }
  //           }}
  //      startIcon={<PlusOutlined />} size="small" variant="contained" onClick={() => toggleShipmentPopup()}>
  //       <FormattedMessage id="Add Shipment" />
  //     </Button>
  //   </div>
  // );
  return (
    <div className="flex flex-col space-y-2">
      {/* Remove top-level three-dot menu */}
      <CustomAgGrid
        rowData={shipmentData?.tableData?.filter((row:any) => row && Object.keys(row).length > 0) || []}
        columnDefs={getAgGridColumns(handleActions)}
        paginationPageSize={paginationData.rowsPerPage}
        paginationPageSizeSelector={rowsPerPageOptions}
        height="480px"
        editable={false}
        rowSelection='multiple'
        rowHeight={20}
        headerHeight={30}
        onSelectionChanged={(selected: TContainerDetails[]) => setSelectedRows(selected)}
        reload_data={true}
        getRowId={(params: any) => {
          const d = params.data || {};
          return (
            d.CONTAINER_NO?.toString() || d.OLD_CONTAINER_NO?.toString() || d.VEHICLE_NO?.toString() || d.JOB_NO?.toString() || `row-${(d?.ROW_ID || Math.random()).toString()}`
          );
        }}
      />
      {/* Row action menu */}
      <Menu
        anchorEl={rowMenuAnchorEl}
        open={Boolean(rowMenuAnchorEl)}
        onClose={() => {
          setRowMenuAnchorEl(null);
          setRowMenuData(null);
        }}
      >
        <MenuItem
          onClick={() => {
            if (rowMenuData) {
              handleEditShipment(rowMenuData);
              setRowMenuAnchorEl(null);
              setRowMenuData(null);
            }
          }}
        >
          <FormattedMessage id="Edit" />
        </MenuItem>
        <MenuItem
          onClick={() => rowMenuData && handleDeleteRow(rowMenuData)}
          sx={{ color: '#d32f2f' }}
        >
          <FormattedMessage id="Delete" />
        </MenuItem>
        <MenuItem
          onClick={handleDeleteAll}
          disabled={!shipmentData?.tableData?.length}
          sx={{ color: '#d32f2f' }}
        >
          <FormattedMessage id="Delete All" />
        </MenuItem>
      </Menu>
      {!!shipmentFormPopup && shipmentFormPopup.action.open && (
        <UniversalDialog
          action={{ ...shipmentFormPopup.action }}
          onClose={toggleShipmentPopup}
          title={shipmentFormPopup.title}
          hasPrimaryButton={false}
        >
          <AddShipmentWmsForm
            container_no={shipmentFormPopup?.data.existingData.container_no}
            prin_code={prin_code}
            job_no={job_no}
            onClose={toggleShipmentPopup}
            isEditMode={shipmentFormPopup?.data?.isEditMode}
            existingData={shipmentFormPopup?.data?.existingData}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default ShipmentDetailsWmsTab;