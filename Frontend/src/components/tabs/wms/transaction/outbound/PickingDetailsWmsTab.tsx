import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import BlueButton from 'components/buttons/BlueButton';
import { ISearch } from 'components/filters/SearchFilter';
import MyAgGrid from 'components/grid/MyAgGrid';
import DataSelection from 'components/popup/DataSelection';
import PickingOption from 'components/popup/PickingOption';
import UniversalDialog from 'components/popup/UniversalDialog';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import pickingServiceInstance from 'service/wms/transaction/outbound/service.pickingDetailsWms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
// import { useSelector } from 'store';

const PickingDetailsWmsTab = ({ job_no, prin_code }: { job_no: string; prin_code: string }) => {
  // ag grid state
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Define the initial filter criteria
  const filter: ISearch = {
    search: [
      [{ field_name: 'prin_code', field_value: prin_code, operator: 'exactmatch' }],
      [{ field_name: 'job_no', field_value: job_no, operator: 'exactmatch' }]
    ]
  };

  //--------------constants----------

  // State for toggling filter
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);

  // State for selected preference
  const [selectedPreference, setSelectedPreference] = useState<{ label: string; value: string; is_mounted: boolean }>({
    label: 'Job',
    value: 'job_no',
    is_mounted: false
  });

  // State for picking option form popup
  const [pickingOptionFormPopup, setPickingOptionFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Picking Option" />
  });

  //----------- useQuery--------------

 const sql_string = `
  SELECT *
  FROM VW_WM_OUB_TO_PICK
  WHERE JOB_NO = '${job_no}'
    AND PRIN_CODE = '${prin_code}'
`;

  const { data: pickingData, refetch: refetchPickingData } = useQuery({
    queryKey: ['picking_data', sql_string],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string)
  });

  //-------------handlers---------------

  // Handle picking item
  const handlePickItem = async (preference: string, pick: string, min_qty: string, exp_period: string) => {

    // Extract array of SERIAL_NO from selectedRows values
    const serialNos = Object.values(selectedRows).map(row => row.SERIAL_NO);

    const response = await pickingServiceInstance.pickOrders(
      // Object.keys(selectedRows),
      serialNos,
      job_no,
      prin_code,
      preference,
      pick,
      min_qty,
      exp_period
    );
    if (!!response) {
      togglePickingPopup();
      setToggleFilter(!toggleFilter);
      refetchPickingData();
      return true;
    }
    return false;
  };

  // Handle preference selection
  const handlePreferenceSelection = (searchfilter: ISearch['search']) => {
    setToggleFilter(!toggleFilter);
    setSelectedPreference((prev) => {
      return { ...prev, is_mounted: false };
    });
  };

  // Toggle picking popup
  const togglePickingPopup = () => {
    setPickingOptionFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  //------------------useEffect----------------
  // Reset toggle filter on component mount
  useEffect(() => {
    setToggleFilter(null as any);
  }, []);

  // Update filter when selected preference changes
  useEffect(() => {
    if (selectedPreference.value === 'job_no') {
      setToggleFilter(!toggleFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreference]);

  // ag grid columns
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'checkbox',
        width: 100, // Fixed width
        maxWidth: 40, // Ensures it can't expand
        minWidth: 40, // Ensures it can't shrink smaller
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        sortable: false,
        filter: false,
        suppressMenu: true,
        resizable: false, // Prevent manual resizing
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any
      },
      {
        headerName: 'No',
        field: 'recordNumber',
        width: 80,
        maxWidth: 80,
        minWidth: 60,
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
      { headerName: 'Order Number ', field: 'ORDER_NO', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Customer ', field: 'cust_name', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Product ', field: 'PROD_NAME', cellStyle: { fontSize: '12px' }, width: 300, minWidth: 350 },
      { headerName: 'Site Code ', field: 'SITE_CODE', cellStyle: { fontSize: '12px' }, width: 300, minWidth: 120 },
      { headerName: 'Lot Number', field: 'LOT_NO', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Location From', field: 'LOC_CODE_FROM', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Location To', field: 'LOC_CODE_TO', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      {
        headerName: 'Quantity',
        field: 'QUANTITY',
        cellStyle: { fontSize: '12px', textAlign: 'right' } as any,
        width: 150,
        minWidth: 150
      },
      // { headerName: 'Batch Number', field: 'batch_no', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      // { headerName: 'UPPP', field: 'batch_no', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      {
        headerName: 'Production From',
        field: 'PRODUCTION_FROM',
        cellStyle: { fontSize: '12px' },
        width: 150,
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: 'Production to',
        field: 'PRODUCTION_TO',
        cellStyle: { fontSize: '12px' },
        width: 150,
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: 'Expiry From',
        field: 'EXPIRY_FROM',
        cellStyle: { fontSize: '12px' },
        width: 150,
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: 'Expiry To',
        field: 'EXPIRY_TO',
        cellStyle: { fontSize: '12px' },
        width: 150,
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: 'Actual Quantity',
        field: 'ACT_ORDER_QTY',
        cellStyle: { fontSize: '12px', textAlign: 'right' } as any,
        width: 150,
        minWidth: 150
      }
    ],
    []
  );

  const gridRef = useRef<AgGridReact>(null);

  const onSelectionChanged = () => {
    if (gridRef.current) {
      const selectedNodes = gridRef.current.api.getSelectedNodes();
      const selectedData = selectedNodes.map((node: { data: any }) => node.data);
      console.log('selectedData', selectedData);
      setSelectedRows(selectedData);
    }
  };

  // Custom filter component for selecting preference and triggering the picking popup
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end pt-2 pl-2">
        <BlueButton onClick={togglePickingPopup} size="small" disabled={!(Object.keys(selectedRows).length > 0)}>
          Pick Orders
        </BlueButton>
      </div>
      <div>
        <MyAgGrid
          ref={gridRef}
          rowSelection="multiple"
          rowData={pickingData || []}
          columnDefs={columnDefs}
          height="480px"
          rowHeight={25}
          headerHeight={30}
          paginationPageSize={10}
          pagination={true}
          paginationPageSizeSelector={[10, 50, 100]}
          onSelectionChanged={onSelectionChanged}
        />
      </div>

      {selectedPreference.value !== 'job_no' && !!selectedPreference.is_mounted && (
        <DataSelection
          selectedItem={selectedPreference} // Selected preference item
          handleSelection={handlePreferenceSelection} // Handler for preference selection
          filter={filter} // Filter criteria
        />
      )}
      {!!pickingOptionFormPopup && pickingOptionFormPopup.action.open && (
        <UniversalDialog
          action={{ ...pickingOptionFormPopup.action }} // Action properties for the dialog
          onClose={togglePickingPopup} // Handler for closing the dialog
          title={pickingOptionFormPopup.title} // Title for the dialog
          hasPrimaryButton={false} // Disable primary button
        >
          <PickingOption handleSelectPickingOption={handlePickItem} />
        </UniversalDialog>
      )}
    </div>
  );
};

export default PickingDetailsWmsTab;
