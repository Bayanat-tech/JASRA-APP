import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import UniversalDialog from 'components/popup/UniversalDialog';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import VendorSerivceInstance from 'service/wms/service.vendor';
import useAuth from 'hooks/useAuth';

import { ColDef } from 'ag-grid-community';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TVendor } from './vendorTypes/TVendor';
import VendorApprovalActions from 'pages/VendorSystem/forms/VendorApprovalRequestForm';

import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import * as XLSX from 'xlsx';

type VendorMainPgProps = {
  triggerAddPopup?: boolean;
  onAddPopupHandled?: () => void;
};

const VendorSendBackData = ({ triggerAddPopup, onAddPopupHandled }: VendorMainPgProps) => {
  const { user } = useAuth();
  const intl = useIntl();

  useEffect(() => {
    if (triggerAddPopup) {
      openVendorPopup();
      onAddPopupHandled?.();
    }
  }, [triggerAddPopup]);

  const [VendorFormPopup, setVendorFormPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true },
    title: intl.formatMessage({ id: 'EditVendorRequest' }) || 'Edit Vendor Request',
    data: { existingData: {}, isEditMode: true, isViewMode: false }
  });

  // 👉 Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 👉 Menu Action Handler
  const handleMenuAction = (action: string) => {
    handleMenuClose();

    if (action === 'export') {
      if (!vendorData || vendorData.length === 0) {
        alert('No data available to export!');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(vendorData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'InProgressVendors');

      XLSX.writeFile(workbook, `VendorInProgress_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    } else if (action === 'print') {
      if (!vendorData || vendorData.length === 0) {
        alert('No data available to print!');
        return;
      }

      // ✅ Create a printable HTML table
      const printWindow = window.open('', '', 'width=900,height=650');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
             <title>${intl.formatMessage({ id: 'VendorInProgressTitle' }) || 'Vendor In Progress'}</title>
              <style>
                table {
                  border-collapse: collapse;
                  width: 100%;
                  font-size: 12px;
                  font-family: Arial, sans-serif;
                }
                th, td {
                  border: 1px solid #ccc;
                  padding: 6px;
                  text-align: left;
                }
                th {
                  background: #f2f2f2;
                }
              </style>
            </head>
            <body>
           <h3>${intl.formatMessage({ id: 'VendorInProgressHeader' }) || 'Vendor In Progress Requests'}</h3>
              <table>
                <thead>
                  <tr>
                    <th>${intl.formatMessage({ id: 'DocNo' }) || 'Document Number'}</th>
                    <th>${intl.formatMessage({ id: 'DocDate' }) || 'Document Date'}</th>
                    <th>${intl.formatMessage({ id: 'RefDocNo' }) || 'Ref Doc No'}</th>
                    <th>${intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number'}</th>
                    <th>${intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date'}</th>
                    <th>${intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${vendorData
            .map(
              (row: any) => `
                      <tr>
                        <td>${row.DOC_NO ?? ''}</td>
                        <td>${row.DOC_DATE ? dayjs(row.DOC_DATE).format('DD/MM/YYYY') : ''}</td>
                        <td>${row.REF_DOC_NO ?? ''}</td>
                        <td>${row.INVOICE_NUMBER ?? ''}</td>
                        <td>${row.INVOICE_DATE ? dayjs(row.INVOICE_DATE).format('DD/MM/YYYY') : ''}</td>
                        <td>${row.REMARKS ?? ''}</td>
                      </tr>
                    `
            )
            .join('')}
                </tbody>
              </table>
            </body>
          </html>
        `);

        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleActions = async (actionType: string, rowOriginal: TVendor) => {
    if (actionType === 'view') {
      openVendorPopup(rowOriginal, true);
    }
  };

  const openVendorPopup = (data = {}, isEditMode = false) => {
    setVendorFormPopup({
      action: { open: true, fullWidth: true },
      title: isEditMode
        ? intl.formatMessage({ id: 'EditPurchaseInvoices' }) || 'Edit Purchase Invoices'
        : intl.formatMessage({ id: 'AddPurchaseInvoices' }) || 'Add Purchase Invoices',
      data: {
        existingData: isEditMode ? data : {},
        isEditMode,
        isViewMode: false
      }
    });
  };

  const closeVendorPopup = () => {
    setVendorFormPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false }
    }));
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'DOC_NO', headerName: intl.formatMessage({ id: 'DocNo' }) || 'Document Number',
        width: 170, sortable: true, filter: true, cellStyle: { fontSize: '0.775rem' }
      },
      {
        field: 'DOC_DATE',
        headerName: intl.formatMessage({ id: 'DocDate' }) || 'Document Date',
        sortable: true,
        filter: true,
        width: 150,
        valueFormatter: (params) => (params.value ? dayjs(params.value).format('DD/MM/YYYY') : '')
      },
      {
        field: 'REF_DOC_NO', headerName: intl.formatMessage({ id: 'RefDocNo' }) || 'Ref Doc No',
        sortable: true, filter: true, width: 120
      },
      {
        field: 'INVOICE_NUMBER', headerName: intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number',
        sortable: true, filter: true, width: 150
      },
      {
        field: 'INVOICE_DATE',
        headerName: intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date',
        sortable: true,
        filter: true,
        width: 130,
        valueFormatter: (params) => (params.value ? dayjs(params.value).format('DD/MM/YYYY') : '')
      },
      {
        field: 'REMARKS',
        headerName: intl.formatMessage({ id: 'Remarks' }) || 'Remark',
        sortable: true,
        filter: true,
        width: 460,
        wrapText: true,
        autoHeight: true
      },
      {
        headerName: intl.formatMessage({ id: 'Actions' }) || 'Actions',
        width: 80,
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          const actionButtons: TAvailableActionButtons[] = ['view'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  const sql_string = `
    SELECT * FROM TR_AC_LPO_HEADER
    WHERE LAST_ACTION = 'SENTBACK' AND COMPANY_CODE = 'BSG'
    ORDER BY DOC_NO DESC
  `;

  const { data: vendorData, refetch: refetchVendorData } = useQuery({
    queryKey: ['vendor_request_list', sql_string],
    queryFn: async () => {
      return await VendorSerivceInstance.executeRawSql(sql_string);
    }
  });

  console.log('sql string', sql_string);

  return (
    <div className="flex flex-col space-y-2">
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', right: 8, zIndex: 2 }}>
          <IconButton
            aria-label="more"
            aria-controls={openMenu ? 'vendor-inprogress-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleMenuClick}
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
          <Menu
            id="vendor-inprogress-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleMenuAction('export')}>
              <FormattedMessage id="Export" />
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction('print')}>
              <FormattedMessage id="Print" />
            </MenuItem>
          </Menu>
        </div>

        <VendorCustomGrid
          rowData={vendorData || []}
          columnDefs={columnDefs}
          rowHeight={20}
          height="470px"
          headerHeight={30}
          pagination
          defaultColDef={{ cellStyle: { fontSize: '0.775rem' } }}
          paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
          paginationPageSize={100}
        />
      </div>

      {!!VendorFormPopup.action.open && (
        <UniversalDialog
          action={{ ...VendorFormPopup.action, maxWidth: 'xl', fullWidth: true }}
          onClose={() => {
            closeVendorPopup();
            refetchVendorData();
          }}
          title={VendorFormPopup.title}
          hasPrimaryButton={false}
        >
          <VendorApprovalActions
            ac_code={user?.loginid ?? ''}
            isEditMode={VendorFormPopup?.data?.isEditMode}
            requestData={VendorFormPopup?.data?.existingData}
            requestNumber={VendorFormPopup?.data?.existingData?.Request_number}
            disableActions={true}
            onClose={() => {
              closeVendorPopup();
              refetchVendorData();
            }}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default VendorSendBackData;
