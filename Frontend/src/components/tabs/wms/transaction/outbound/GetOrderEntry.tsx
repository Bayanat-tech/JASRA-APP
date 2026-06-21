import { ColDef } from 'ag-grid-community';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import dayjs from 'dayjs';
import { IToOrderEntry } from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';

import { useMemo } from 'react';
import OrderEntryServiceInstance from 'service/wms/transaction/outbound/service.orderentryWms';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';

interface GetOrderEntryProps {
  TableOrderData: IToOrderEntry[];
  setOrderEntry: (value: boolean) => void;
  setmodalTitle?: (title: string) => void;
  setEditOrderData?: (data: IToOrderEntry) => void;
  setTableOrderData: (data: IToOrderEntry[]) => void;
}

const GetOrderEntry = ({ TableOrderData, setTableOrderData, setOrderEntry, setmodalTitle, setEditOrderData }: GetOrderEntryProps) => {
  const handleActions = async (action: string, rowData: IToOrderEntry) => {
    if (action === 'delete') {
      try {
        const deleteSuccess = await OrderEntryServiceInstance.deleteSingleOrderEntry(rowData.id);
        if (!deleteSuccess) return;
        const freshData = await OrderEntryServiceInstance.getOrderentry(rowData.job_no);
        setTableOrderData(freshData || []);
      } catch (error) {
        console.error('Delete action failed:', error);
        return; // Error handling is already done in the service
      } finally {
        setOrderEntry(false);
      }
    }

    if (action === 'edit') {
      const freshData = await OrderEntryServiceInstance.getSingleOrderEntry(rowData.id);
      setmodalTitle?.('Edit Order Entry');
      setOrderEntry(true);
      console.log('Edit action clicked for row:', freshData);
      setEditOrderData?.(freshData || rowData);
    }
  };

  // Helper functions

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  console.log('TableOrderData:', TableOrderData);
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Sr. No',
        field: 'recordNumber',
        width: 100,
        cellStyle: {
          fontSize: '12px',
          textAlign: 'center'
        } as any,
        minWidth: 90,
        suppressMenu: true,
        sortable: false,
        filter: false,
        valueGetter: (params: any) => {
          return (params.node?.rowIndex ?? 0) + 1;
        }
      },
      {
        headerName: 'Customer Code',
        field: 'cust_code',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Order No.',
        field: 'order_no',
        width: 150,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Order Date',
        field: 'order_date',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        }
      },
      {
        headerName: 'Due Date',
        field: 'order_due_date',
        width: 120,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        minWidth: 150
      },
      {
        headerName: 'Currency',
        field: 'curr_code',
        width: 80,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Exchange Rate',
        field: 'ex_rate',
        width: 100,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },

      {
        headerName: 'MOC1',
        field: 'moc1',
        width: 80,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'MOC2',
        field: 'moc2',
        width: 80,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Container No.',
        field: 'exp_container_no',
        width: 150,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Container Size',
        field: 'exp_container_size',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Container Type',
        field: 'exp_container_type',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Seal No.',
        field: 'exp_container_sealno',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150
      },
      {
        headerName: 'Customer Ref.',
        field: 'cust_reference',
        width: 150,
        cellStyle: { fontSize: '12px' },
        minWidth: 180
      },
      {
        headerName: 'Pack Start',
        field: 'pack_start',
        width: 120,
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : ''),
        minWidth: 150
      },
      {
        headerName: 'Pack End',
        field: 'pack_end',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
      },
      {
        headerName: 'Load Start',
        field: 'load_start',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
      },
      {
        headerName: 'Load End',
        field: 'load_end',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 150,
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
      },
      {
        headerName: 'Actions',
        pinned: 'right',
        field: 'actions',
        width: 100,
        filter: false,
        cellStyle: { fontSize: '12px' },
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    [TableOrderData]
  );

  return (
    <>
      <CustomAgGrid
        rowData={TableOrderData || []}
        columnDefs={columnDefs}
        key={TableOrderData.length}
        height="480px"
        rowHeight={25}
        headerHeight={30}
        paginationPageSize={10}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
      />
    </>
  );
};
export default GetOrderEntry;
