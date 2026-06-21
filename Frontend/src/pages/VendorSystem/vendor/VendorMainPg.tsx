import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import UniversalDialog from 'components/popup/UniversalDialog';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import dayjs from 'dayjs';
import { ColDef } from 'ag-grid-community';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TVendor } from '../vendorTypes/TVendor';
import VendorRequestForm from '../forms/VendorRequestForm';
import VendorSerivceInstance from 'service/wms/service.vendor';
import useAuth from 'hooks/useAuth';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreOutlined } from '@ant-design/icons';
import { InfoOutlined } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import * as XLSX from 'xlsx';
import { formatDateOnly } from 'utils/dateFormatter';

type VendorMainPgProps = {
  triggerAddPopup?: boolean;
  onAddPopupHandled?: () => void;
};

const VendorMainPg = ({ triggerAddPopup, onAddPopupHandled }: VendorMainPgProps) => {
  const { user } = useAuth();
  const intl = useIntl();

  const [VendorFormPopup, setVendorFormPopup] = useState<TUniversalDialogProps>({
    action: { open: false, fullWidth: true },
    title: intl.formatMessage({ id: 'EditVendorRequest' }) || 'Edit Vendor Request',
    data: { existingData: {}, isEditMode: true, isViewMode: false }
  });

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

  // 👉 state for menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleMenuAction = (action: string) => {
    console.log('Selected action:', action);
    handleMenuClose();

    if (action === 'export') {
      if (!vendorData || vendorData.length === 0) {
        alert(intl.formatMessage({ id: 'NoDataToExport' }) || 'No data available to export!');
        return;
      }


      const worksheet = XLSX.utils.json_to_sheet(vendorData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'VendorRequests');


      XLSX.writeFile(workbook, `VendorRequests_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    } else if (action === 'import') {

    } else if (action === 'print') {
      if (!vendorData || vendorData.length === 0) {
        alert(intl.formatMessage({ id: 'NoDataToPrint' }) || 'No data available to print!');
        return;
      }

      const printWindow = window.open('', '', 'width=900,height=650');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
                <title>{intl.formatMessage({ id: 'VendorRequests' }) || 'Vendor Requests'}</title>
              <style>
                table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 12px;
                  font-family: Arial, sans-serif;
                }
                th, td {
                  border: 1px solid #ccc;
                  padding: 6px;
                  text-align: left;
                }
                th {
                  background: #f5f5f5;
                }
              </style>
            </head>
            <body>
              <h2>Vendor Requests</h2>
                   <h2>{intl.formatMessage({ id: 'VendorRequests' }) || 'Vendor Requests'}</h2>
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
                        <td>${row.DOC_NO || ''}</td>
                        <td>${formatDateOnly(row.DOC_DATE)}</td>
                        <td>${row.REF_DOC_NO || ''}</td>
                        <td>${row.INVOICE_NUMBER || ''}</td>
                        <td>${formatDateOnly(row.INVOICE_DATE)}</td>
                        <td>${row.REMARKS || ''}</td>
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

  // 👇 watch for trigger from parent (Vendorpg)
  useEffect(() => {
    if (triggerAddPopup) {
      openVendorPopup(); // open popup in "Add" mode
      onAddPopupHandled?.(); // reset trigger in parent
    }
  }, [triggerAddPopup]);

  const handleActions = async (actionType: string, rowOriginal: TVendor) => {
    if (actionType === 'edit') {
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

  const closeVendorPopup: () => void = () => {
    setVendorFormPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false }
    }));
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'DOC_NO', headerName: ' Doc No', width: 100, sortable: true, filter: true, cellStyle: { fontSize: '0.775rem' } },

      {
        field: 'DOC_DATE',
        headerName: 'Doc Date',
        sortable: true,
        filter: true,
        width: 120,
        valueFormatter: (params) => formatDateOnly(params.value)
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
        width: 130,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => formatDateOnly(params.value)
      },
      {
        field: 'REMARKS',
        headerName: intl.formatMessage({ id: 'Remarks' }) || 'Remarks',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 300,
        wrapText: true,
        autoHeight: true
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
        width: 110,
        cellRenderer: (params: { data: any }) => {
          const data = params.data;
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  const sql_string = `
    SELECT * FROM TR_AC_LPO_HEADER
    WHERE  (LAST_ACTION = 'SAVEASDRAFT' OR LAST_ACTION = 'SENTBACK') AND FLOW_LEVEL = 0  AND AC_CODE = '${user?.loginid}' AND COMPANY_CODE = 'BSG'
    ORDER BY DOC_NO DESC
  `;


  const { data: vendorData, refetch: refetchVendorData } = useQuery({
    queryKey: ['vendor_request_list', sql_string],
    queryFn: async () => {
      return await VendorSerivceInstance.executeRawSql(sql_string);
    }
  });

  return (
    <div className="flex flex-col space-y-2">
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            right: 0,
            zIndex: 2
          }}
        >
          <IconButton
            aria-label="more"
            aria-controls={openMenu ? 'packing-more-menu' : undefined}
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
            id="packing-more-menu"
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
          defaultColDef={{ cellStyle: { fontSize: '0.775rem' } }}
          rowHeight={20}
          height="470px"
          headerHeight={30}
          pagination={true}
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
          <VendorRequestForm
            ac_code={user?.loginid ?? ''}
            isEditMode={VendorFormPopup?.data?.isEditMode}
            requestData={VendorFormPopup?.data?.existingData}
            requestNumber={VendorFormPopup?.data?.existingData?.Request_number}
            onClose={() => {
              closeVendorPopup();
              refetchVendorData();
            }}
            onTabChange={(tabIndex) => {
              setVendorFormPopup((prev) => ({
                ...prev,
                data: { ...prev.data, activeTab: tabIndex }
              }));
            }}
          />
        </UniversalDialog>
      )}

      <div>
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
            <VendorRequestForm
              ac_code={user?.loginid ?? ''}
              isEditMode={VendorFormPopup?.data?.isEditMode}
              requestData={VendorFormPopup?.data?.existingData}
              requestNumber={VendorFormPopup?.data?.existingData?.Request_number}
              onClose={() => {
                closeVendorPopup();
                refetchVendorData();
              }}
              onTabChange={(tabIndex) => {
                setVendorFormPopup((prev) => ({
                  ...prev,
                  data: { ...prev.data, activeTab: tabIndex }
                }));
              }}
            />
          </UniversalDialog>
        )}
      </div>

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

export default VendorMainPg;
