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
import { TVendor } from '../vendorTypes/TVendor';
// import VendorApprovalRequestForm from 'pages/VendorSystem/forms/VendorApprovalRequestForm';
import VendorApprovalRequestFormDisAct from 'pages/VendorSystem/forms/VendorApprovalRequestFormDisAct'
import { InfoOutlined } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import * as XLSX from 'xlsx';
import { formatDateForGrid } from 'utils/dateFormatter';

type VendorMainPgProps = {
  triggerAddPopup?: boolean;
  onAddPopupHandled?: () => void;
  // mainActiveTab: number;
};

const VendorInProgress = ({ triggerAddPopup, onAddPopupHandled }: VendorMainPgProps) => {
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
    title: 'Edit Vendor Request',
    data: { existingData: {}, isEditMode: true, isViewMode: false }
  });


  // sendback history table
  const sendBackHistoryCols: ColDef[] = [
    {
      headerName: intl.formatMessage({ id: 'SrNo' }) || 'Sr No',
      field: 'serial',
      width: 100,
      valueGetter: (params) => params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
      cellStyle: { fontSize: '0.775rem', textAlign: 'center' }
    },
    {
      headerName: intl.formatMessage({ id: 'History' }) || 'History',
      field: 'history',
      flex: 1,
      valueGetter: (params) => {
        const historyText = params.data.history || '';
        const parts = historyText.split('-');
        return parts.length > 0 ? parts[0].trim() : ''; // only remark
      },
      cellStyle: { fontSize: '0.775rem' }
    },
    {
      headerName: intl.formatMessage({ id: 'Login Name' }) || 'Login Name',
      field: 'loginid',
      flex: 1,
      valueGetter: (params) => {
        const historyText = params.data.history || '';
        const parts = historyText.split('-');
        return parts.length > 1 ? parts.pop().trim() : '';
      },
      cellStyle: { fontSize: '0.775rem' }
    }
  ];


  // sendback history  
  const [sendBackHistoryPopup, setSendBackHistoryPopup] = useState<{
    open: boolean;
    history: { history: string }[];
  }>({
    open: false,
    history: []
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
        alert(intl.formatMessage({ id: 'NoDataToExport' }) || 'No data available to export!');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(vendorData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'InProgressVendors');

      XLSX.writeFile(workbook, `VendorInProgress_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    } else if (action === 'print') {
      if (!vendorData || vendorData.length === 0) {
        alert(intl.formatMessage({ id: 'NoDataToPrint' }) || 'No data available to print!');
        return;
      }

      // ✅ Create a printable HTML table
      const printWindow = window.open('', '', 'width=900,height=650');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
            <title>{intl.formatMessage({ id: 'VendorInProgress' }) || 'Vendor In Progress<'}</title>
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
                <h3>{intl.formatMessage({ id: 'VendorInProgressRequests' }) || 'Vendor In Progress Requests'}</h3>
              <table>
                <thead>
                  <tr>
                        <th>{intl.formatMessage({ id: 'DocumentNumber' }) || 'Document Number'}</th>
                    <th>{intl.formatMessage({ id: 'DocumentDate' }) || 'Document Date'}</th>
                   <th>{intl.formatMessage({ id: 'RefDocNo' }) || 'Ref Doc No'}</th>
                     <th>{intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number'}</th>
                   <th>{intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date'}</th>
                    <th>{intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}</th>
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
      { field: 'DOC_NO', headerName: 'Doc No', width: 100, sortable: true, filter: true, cellStyle: { fontSize: '0.775rem' } },
      {
        field: 'DOC_DATE',
        headerName: 'Doc Date',
        sortable: true,
        filter: true,
        width: 120,
        valueFormatter: (params) => formatDateForGrid(params.value)
      },
      {
        field: 'ACC_NAME',
        headerName: intl.formatMessage({ id: 'Ac Name' }) || 'Ac Name',
        sortable: true,
        filter: true,
        width: 280,
        wrapText: true,
        autoHeight: true
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
        valueFormatter: (params) => formatDateForGrid(params.value)
      },
      {
        field: 'REF_DOC3',
        headerName: intl.formatMessage({ id: 'TruckNo' }) || 'Truck No',
        sortable: true,
        filter: true,
        width: 150
      },

      {
        field: 'REMARKS',
        headerName: intl.formatMessage({ id: 'Remarks' }) || 'Remarks',
        sortable: true,
        filter: true,
        width: 300,
        wrapText: true,
        autoHeight: true
      },
      {
        field: 'AMOUNT',
        headerName: intl.formatMessage({ id: 'Amount' }) || 'Amount',
        sortable: true,
        filter: true,
        width: 150,
        wrapText: true,
        autoHeight: true,
        cellStyle: (params: any) => ({
          fontSize: '0.775rem',
          textAlign: 'right',
          fontWeight: params.node?.rowPinned ? 700 : 400
        }),
        valueFormatter: (params: any) => {
          if (params.node?.rowPinned) return params.value; // pinned row mein already formatted hai
          const amount = Number(params.value);
          if (isNaN(amount)) return '0.00';
          return amount.toFixed(3);
        }
      },
      {
        field: 'LAST_ACTION',
        headerName: intl.formatMessage({ id: 'LastAction' }) || 'Last Action',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 120,
        wrapText: true,
        autoHeight: true,
        valueGetter: (params) => {
          // return value based on LAST_ACTION
          if (params.data?.LAST_ACTION === 'SAVEASDRAFT') return 'SAVEASDRAFT';
          if (params.data?.LAST_ACTION === 'SENTBACK') return 'SENTBACK';
          if (params.data?.LAST_ACTION === 'REJECT') return 'REJECT';
          return params.data?.LAST_ACTION || '';
        }
      },
      {
        field: 'SENDBACK_HISTORY',
        headerName: intl.formatMessage({ id: 'SentBackHistory' }) || 'SentBack History',
        width: 150,
        cellRenderer: (params: { value: string }) => {
          if (!params.value) return null;

          // clean string → split → remove empty entries
          const historyArray = params.value
            .trim()
            .split('|')
            .map(h => h.trim())
            .filter(h => h.length > 0);

          return (
            <IconButton
              size="small"
              onClick={() =>
                setSendBackHistoryPopup({
                  open: true,
                  history: historyArray.map((h) => ({ history: h }))
                })
              }
            >
              <InfoOutlined style={{ fontSize: 18, color: '#1976d2', textAlign: 'center' }} />
            </IconButton>
          );
        }


      },
      {
        headerName: 'Actions',
        width: 100,
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
SELECT 
    H.*,(SELECT AMOUNT FROM VW_VENDOR_AMOUNT K WHERE K.COMPANY_CODE = H.COMPANY_CODE AND K.DOC_NO = H.DOC_NO) AS AMOUNT
FROM VW_TR_AC_LPO_HEADER H
CROSS JOIN VW_VENDOR_APPROVER_STRING V
WHERE H.LAST_ACTION NOT IN ('REJECTED')
  AND (
        (H.FLOW_LEVEL = 1  AND INSTR(V.LEVEL1_STRING, ${user?.loginid1}) > 0)
     OR (H.FLOW_LEVEL = 2 AND INSTR(V.LEVEL2_STRING, ${user?.loginid1}) > 0)
      )
ORDER BY H.DOC_NO DESC
`;
  const { data: vendorData, refetch: refetchVendorData } = useQuery({
    queryKey: ['vendor_request_list', sql_string],
    queryFn: async () => {
      return await VendorSerivceInstance.executeRawSql(sql_string);
    }
  });

  const pinnedBottomRowData = useMemo(() => {
    if (!vendorData || vendorData.length === 0) return [];
    const total = (vendorData as any[]).reduce((sum: number, row: any) => {
      const amount = Number(row.AMOUNT) || 0;
      return sum + amount;
    }, 0);
    return [{
      AMOUNT: 'Total - ' + total.toFixed(3),
    }];
  }, [vendorData]);

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
          pinnedBottomRowData={pinnedBottomRowData}
          getRowStyle={(params) =>
            params.node.rowPinned
              ? { fontWeight: 700, backgroundColor: '#f0f4ff', fontSize: '0.775rem' }
              : {}
          }
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

          <VendorApprovalRequestFormDisAct
            ac_code={user?.loginid1 ?? ''}
            isEditMode={VendorFormPopup?.data?.isEditMode}
            requestData={VendorFormPopup?.data?.existingData}
            requestNumber={VendorFormPopup?.data?.existingData?.Request_number}
            showResetButton={true}
            // mainActiveTab={mainActiveTab}
            onClose={() => {
              closeVendorPopup();
              refetchVendorData();
            }}
          />
        </UniversalDialog>
      )}

      {sendBackHistoryPopup.open && (
        <UniversalDialog
          action={{ open: sendBackHistoryPopup.open, maxWidth: 'sm', fullWidth: true }}
          onClose={() => setSendBackHistoryPopup({ open: false, history: [] })}
          title={intl.formatMessage({ id: 'SendBackHistory' }) || 'Send Back History'}
          hasPrimaryButton={false}
        >
          {sendBackHistoryPopup.history.length > 0 ? (
            <VendorCustomGrid
              rowData={sendBackHistoryPopup.history}
              columnDefs={sendBackHistoryCols}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                cellStyle: { fontSize: '0.775rem' }
              }}
              rowHeight={20}
              headerHeight={30}
              pagination={true}
              paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
              paginationPageSize={100}
              height="300px"
            />

          ) : (
            <p>{intl.formatMessage({ id: 'NoHistoryFound' }) || 'No history found.'}</p>
          )}
        </UniversalDialog>
      )}
    </div>
  );
};

export default VendorInProgress;
