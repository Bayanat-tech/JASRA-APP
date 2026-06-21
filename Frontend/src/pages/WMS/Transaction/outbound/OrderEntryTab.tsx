// components/tabs/OrderEntryTab.tsx
import React, { useEffect, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import MyAgGrid from 'components/grid/MyAgGrid';
import { IToOrderEntry } from './types/jobOutbound_wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import dayjs from 'dayjs';

interface OrderEntryTabProps {
  data: IToOrderEntry[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (data: IToOrderEntry) => void;
  onDelete: (data: IToOrderEntry) => void;
}

const OrderEntryTab: React.FC<OrderEntryTabProps> = ({ data, loading, onAdd, onEdit, onDelete }) => {
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  useEffect(() => {
    console.log('Order Entry Data:', data);
  }, [data]); 

  const handleActions = (action: string, rowData: IToOrderEntry) => {
    switch (action) {
      case 'edit':
        onEdit(rowData);
        break;
      case 'delete':
        onDelete(rowData);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'No',
        field: 'recordNumber',
        width: 100,
        cellStyle: {
          fontSize: '12px',
          textAlign: 'center'
        } as any,
      minWidth: 60,
        suppressMenu: true,
        sortable: false,
        filter: false,
        valueGetter: (params: any) => {
          return (params.node?.rowIndex ?? 0) + 1;
        }
      },
      {
        headerName: 'Order No.',
        field: 'order_no',
        width: 150,
        cellStyle: { fontSize: '12px' },
        minWidth: 120
      },
      {
        headerName: 'Customer',
        field: 'cust_name',
        width: 120, // these two props are necessary
        minWidth: 150,
        cellStyle: { fontSize: '12px' },
      },
      {
        headerName: 'Order Date',
        field: 'order_date',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 120,
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
        minWidth: 120
      },
      {
        headerName: 'Currency',
        field: 'curr_code',
        width: 80,
        cellStyle: { fontSize: '12px' },
        minWidth: 120
      },
      {
        headerName: 'Exchange Rate',
        field: 'ex_rate',
        width: 100,
        cellStyle: {
          fontSize: '12px',
          textAlign: 'right'
        }as any,
        minWidth: 150
      },

      {
        headerName: 'MOC 1',
        field: 'moc1',
        width: 80,
         cellStyle: {
          fontSize: '12px',
          textAlign: 'right'
        }as any,
        minWidth: 100
      },
      {
        headerName: 'MOC 2',
        field: 'moc2',
        width: 80,
         cellStyle: {
          fontSize: '12px',
          textAlign: 'right'
        }as any,
        minWidth: 100
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
        minWidth: 170
      },
      {
        headerName: 'Pack End',
        field: 'pack_end',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 170,
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
      },
      {
        headerName: 'Load Start',
        field: 'load_start',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 170,
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : '')
      },
      {
        headerName: 'Load End',
        field: 'load_end',
        width: 120,
        cellStyle: { fontSize: '12px' },
        minWidth: 170,
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
    [data]
  );

  return (
    <div>
      <MyAgGrid // keep it as your table name
        rowData={data}
        columnDefs={columnDefs}
        key={data.length ?? 0}
        height="470px" // add this line
        rowHeight={25} // add this line
        headerHeight={30} // and this line
        paginationPageSize={10}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
      />
    </div>
  );
};

export default OrderEntryTab;
