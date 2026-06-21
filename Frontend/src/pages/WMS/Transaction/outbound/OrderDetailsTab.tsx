// components/tabs/OrderEntryTab.tsx
import React, { useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import MyAgGrid from 'components/grid/MyAgGrid';
import { TOrderDetail } from './types/jobOutbound_wms.types';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import dayjs from 'dayjs';
import { MoreOutlined } from '@ant-design/icons';
import { IconButton } from '@mui/material';

interface OrderDetailsEntryTabProps {
  data: TOrderDetail[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (data: TOrderDetail) => void;
  onDelete: (data: TOrderDetail) => void;
  handleEDIClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const OrderDetailsTab: React.FC<OrderDetailsEntryTabProps> = ({ data, loading, onAdd, onEdit, onDelete, handleEDIClick }) => {
  const handleActions = (action: string, rowData: TOrderDetail) => {
    switch (action) {
      case 'edit':
        console.log('Edit action triggered for:', rowData);
        onEdit(rowData);
        break;
      case 'delete':
        onDelete(rowData);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  const orderDetailcolumnDefs: ColDef[] = useMemo(
    () => [
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
      { headerName: 'Order Number ', field: 'order_no', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Customer ', field: 'cust_name', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Product ', field: 'prod_name', cellStyle: { fontSize: '12px' }, width: 300, minWidth: 350 },
      { headerName: 'Site Code ', field: 'site_code', cellStyle: { fontSize: '12px' }, width: 300, minWidth: 120 },
      { headerName: 'Location From', field: 'loc_code_from', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Location To', field: 'loc_code_to', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Quantity', field: 'quantity', cellStyle: { fontSize: '12px', textAlign : 'right' }as any, width: 150, minWidth: 150 },
      // { headerName: 'Avaliable Quantity', field: 'bal_order_qty', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Batch Number', field: 'batch_no', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      { headerName: 'Lot Number', field: 'batch_no', cellStyle: { fontSize: '12px' }, width: 150, minWidth: 150 },
      {
        headerName: 'Production From',
        field: 'production_from',
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
        field: 'production_to',
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
        field: 'expiry_from',
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
        field: 'expiry_to',
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
        field: 'act_order_qty',
        cellStyle: { fontSize: '12px', textAlign: 'right' } as any,
        width: 150,
        minWidth: 150
      },
      {
        headerName: 'Actions',
        field: 'actions',
        pinned: 'right',
        filter: false,
        width: 120,
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
    <>
      <div style={{ position: 'relative' }}>
        {/* 3-dots menu absolutely positioned at top-right of grid header */}
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 8,
            zIndex: 5
            // Adjust top/right as needed to align with grid header
          }}
        >
          <IconButton
            aria-label="more"
            // aria-controls={openMenu ? 'packing-more-menu' : undefined}
            aria-haspopup="true"
            // aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleEDIClick}
            size="small"
            sx={{
              background: '#fff',
              boxShadow: 1,
              border: '1px solid #e0e0e0',
              '&:hover': { background: '#f5f5f5' }
            }}
          >
            <MoreOutlined />
          </IconButton>
        </div>

        {/* Grid */}
        <div>
          <MyAgGrid
            rowData={data}
            columnDefs={orderDetailcolumnDefs}
            key={data.length ?? 0}
            height="480px"
            rowHeight={25}
            headerHeight={30}
            paginationPageSize={10}
            pagination={true}
            paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          />
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTab;
