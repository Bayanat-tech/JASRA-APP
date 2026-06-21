import React, { useMemo, useState, useEffect } from 'react';
import { Container, Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { ColDef } from 'ag-grid-community';
// import CustomAgGrid from 'components/grid/CustomAgGrid';
// import VendorCustomGrid from 'components/grid/VendorCustomGrid';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import VendorServiceInstance from './services/service.vendor';
import { useQuery } from '@tanstack/react-query';
import { TVendorMain } from 'pages/VendorSystem/vendorTypes/TVendor';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { useDispatch } from 'react-redux';
import useAuth from 'hooks/useAuth';
import { MoreOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// ✅ Format for displaying dates (dd/MM/yyyy)
const formatDate = (value: any): string => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB').format(date);
  } catch {
    return '';
  }
};

// ✅ Format amount with minus in brackets
const amountFormatter = (value: any) => {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

// ✅ Apply conditional color
const getAmountCellStyle = (params: any) => {
  const num = Number(params.value);
  return {
    color: num < 0 ? '#C62828' : '',
    textAlign: 'right'
  };
};

// ✅ Type-safe export row
type ExportRow = {
  'Invoice Number': string;
  'Invoice Date': string;
  'Doc Type': string;
  'Doc Number': string;
  'Doc Date': string;
  Remark: string;
  'Debit Amount': number | string;
  'Credit Amount': number | string;
  Balance: number | string;
};

const VendorOutstanding: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
   const intl = useIntl();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // ✅ Fetch vendor outstanding data
  const { data: vendorOutstandingData = [], isFetching } = useQuery<TVendorMain[], Error>({
    queryKey: ['vendor-outstanding', user?.loginid],
    queryFn: async () => {
      return await VendorServiceInstance.getVendorOutstanding('BSG', user?.loginid ?? '');
    },
    enabled: !!user?.loginid,
    retry: false
  });

  useEffect(() => {
    if (isFetching) dispatch(openBackdrop());
    else dispatch(closeBackdrop());
  }, [isFetching, dispatch]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
       headerName: intl.formatMessage({ id: 'DocType' }) || 'Doc Type',
        field: 'DOC_TYPE',
        sortable: true,
        filter: true,
        width: 110,
        fontSize: '0.775rem',
        valueGetter: (params) => {
          if (params.data?.DOC_TYPE && params.data.DOC_TYPE.trim() !== '') return params.data.DOC_TYPE;
          return params.data?.REMARKS ? params.data.REMARKS.substring(0, 3) : '';
        },
        cellStyle: (params) => (params.node.rowPinned === 'bottom' ? { fontWeight: 'bold', fontSize: '0.775rem' } : null)
      },
      {   headerName: intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number',
         field: 'INV_NO', sortable: true, filter: true, width: 140, fontSize: '0.775rem' },
      {
       headerName: intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date',
        field: 'INV_DATE',
        sortable: true,
        filter: true,
        width: 140,
        fontSize: '0.775rem',
        valueFormatter: ({ value }) => formatDate(value)
      },
      {
        headerName: intl.formatMessage({ id: 'DocRefNo' }) || 'Doc Ref No',
         field: 'DOC_NO', sortable: true, filter: true, width: 120, fontSize: '0.775rem' },
      {
        headerName: intl.formatMessage({ id: 'Remark' }) || 'Remark',
        field: 'REMARKS',
        sortable: true,
        filter: true,
        width: 400,
        fontSize: '0.775rem',
        wrapText: true,
        autoHeight: true,
        valueGetter: (params) => params.data?.REMARKS?.substring(3) || ''
      },
      {
        headerName: intl.formatMessage({ id: 'DebitAmount' }) || 'Debit Amt',
        field: 'DEBIT_AMOUNT',
        sortable: true,
        filter: true,
        width: 120,
        fontSize: '0.775rem',
        cellStyle: (params) => ({ fontSize: '0.775rem', ...getAmountCellStyle(params) }),
        valueFormatter: (params) => amountFormatter(params.value)
      },
      {
      headerName: intl.formatMessage({ id: 'CreditAmount' }) || 'Credit Amt',
        field: 'CREDIT_AMOUNT',
        sortable: true,
        filter: true,
        width: 120,
        fontSize: '0.775rem',
        cellStyle: (params) => ({ fontSize: '0.775rem', ...getAmountCellStyle(params) }),
        valueFormatter: (params) => amountFormatter(params.value)
      },
      { headerName: intl.formatMessage({ id: 'Balance' }) || 'Balance',
        field: 'BALANCE',
        sortable: true,
        filter: true,
        width: 120,
        fontSize: '0.775rem',
        cellStyle: (params) => ({ fontSize: '0.775rem', ...getAmountCellStyle(params) }),
        valueFormatter: (params) => amountFormatter(params.value)
      }
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({ sortable: true, autoHeight: true, filter: true, resizable: true, cellStyle: { fontSize: '0.775rem' } }),
    []
  );

  // ✅ Process running balance
  const processedData = useMemo(() => {
    if (!vendorOutstandingData || vendorOutstandingData.length === 0) return [];
    let runningBalance = 0;
    return vendorOutstandingData.map((row) => {
      const debit = Number(row.DEBIT_AMOUNT) || 0;
      const credit = Number(row.CREDIT_AMOUNT) || 0;
      runningBalance += credit - debit;
      return { ...row, BALANCE: runningBalance };
    });
  }, [vendorOutstandingData]);

  // ✅ Calculate totals
  const totalRow = useMemo(() => {
    if (!vendorOutstandingData || vendorOutstandingData.length === 0) return [];
    const totalDebit = vendorOutstandingData.reduce((sum, row) => sum + (Number(row.DEBIT_AMOUNT) || 0), 0);
    const totalCredit = vendorOutstandingData.reduce((sum, row) => sum + (Number(row.CREDIT_AMOUNT) || 0), 0);
    const netBalance = totalDebit - totalCredit;
    return [
      {  DOC_TYPE: intl.formatMessage({ id: 'Total' }) || 'Total', DEBIT_AMOUNT: totalDebit.toFixed(3), CREDIT_AMOUNT: totalCredit.toFixed(3), BALANCE: netBalance.toFixed(3) }
    ];
  }, [vendorOutstandingData]);

  // ✅ Export & Print handler
  const handleMenuAction = (action: string) => {
    handleMenuClose();

    if (action === 'export') {
      if (!processedData || processedData.length === 0) {
       alert(intl.formatMessage({ id: 'NoDataToExport' }) || 'No data available to export!');
        return;
      }

      const exportData: ExportRow[] = [
        ...processedData.map((row) => ({
          'Invoice Number': row.INV_NO || row.INVOICE_NUMBER || '',
          'Invoice Date': formatDate(row.INV_DATE || row.INVOICE_DATE),
          'Doc Type': row.DOC_TYPE || '',
          'Doc Number': row.DOC_NO || '',
          'Doc Date': formatDate(row.DOC_DATE),
          Remark: row.REMARKS || '',
          'Debit Amount': row.DEBIT_AMOUNT ?? row.DEBIT_AMT ?? 0,
          'Credit Amount': row.CREDIT_AMOUNT ?? row.CREDIT_AMT ?? 0,
          Balance: row.BALANCE ?? 0
        })),
        ...totalRow.map((row) => ({
          'Invoice Number': '',
          'Invoice Date': '',
          'Doc Type': row.DOC_TYPE,
          'Doc Number': '',
          'Doc Date': '',
          Remark: '',
          'Debit Amount': row.DEBIT_AMOUNT,
          'Credit Amount': row.CREDIT_AMOUNT,
          Balance: row.BALANCE
        }))
      ];

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'VendorStatement');
      XLSX.writeFile(workbook, `VendorStatement_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    }

    if (action === 'print') {
      if (!processedData || processedData.length === 0) {
        alert('No data available to print!');
        return;
      }

      const printData = [...processedData, ...totalRow];
      const tableHtml = `
        <html>
          <head>
            <title>${intl.formatMessage({ id: 'VendorOutstanding' }) || 'Vendor Outstanding'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; font-size: 12px; }
              th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
              th { background: #f2f2f2; }
              tfoot td { font-weight: bold; background: #f9f9f9; }
            </style>
          </head>
          <body>
             <h2>${intl.formatMessage({ id: 'OutstandingReportAsOn' }) || 'Outstanding Report As On'} ${formatDate(new Date())}</h2>
            <table>
              <thead>
                <tr>
                          <th>${intl.formatMessage({ id: 'DocType' }) || 'Doc Type'}</th>
          <th>${intl.formatMessage({ id: 'DocNo' }) || 'Doc No'}</th>
          <th>${intl.formatMessage({ id: 'DocDate' }) || 'Doc Date'}</th>
          <th>${intl.formatMessage({ id: 'DocRefNo' }) || 'Doc Ref No'}</th>
          <th>${intl.formatMessage({ id: 'Remark' }) || 'Remark'}</th>
          <th>${intl.formatMessage({ id: 'DebitAmount' }) || 'Debit Amount'}</th>
          <th>${intl.formatMessage({ id: 'CreditAmount' }) || 'Credit Amount'}</th>
          <th>${intl.formatMessage({ id: 'Balance' }) || 'Balance'}</th>
                </tr>
              </thead>
              <tbody>
                ${printData
                  .map(
                    (row) => `
                   <tr>
            <td>${row.DOC_TYPE || ''}</td>
            <td>${'INV_NO' in row ? row.INV_NO ?? '' : ''}</td>
            <td>${'INV_DATE' in row ? formatDate(row.INV_DATE) : ''}</td>
            <td>${'DOC_NO' in row ? row.DOC_NO ?? '' : ''}</td>
            <td>${'REMARKS' in row ? row.REMARKS ?? '' : ''}</td>
            <td style="text-align:right;">${amountFormatter(row.DEBIT_AMOUNT)}</td>
            <td style="text-align:right;">${amountFormatter(row.CREDIT_AMOUNT)}</td>
            <td style="text-align:right;">${amountFormatter(row.BALANCE)}</td>
          </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <script>window.print();</script>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(tableHtml);
        printWindow.document.close();
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
     <Typography
       variant="h5"
       gutterBottom
      sx={{ color: '#082A89', fontWeight: 600, fontSize: '1.5rem' }}
>
    {intl.formatMessage({ id: 'OutstandingReport' }) || 'Outstanding Report As On'}{' '}
    {formatDate(new Date())}
</Typography>


      <Box sx={{ width: '100%', height: 'calc(100vh - 200px)' }}>
        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, zIndex: 2 }}>
              <IconButton
                aria-label={intl.formatMessage({ id: 'MoreOptions' }) || 'More'}
                aria-controls={openMenu ? 'vendor-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleMenuClick}
                size="small"
                sx={{ background: '#fff', boxShadow: 1, border: '1px solid #e0e0e0', '&:hover': { background: '#f5f5f5' } }}
              >
                <MoreOutlined />
              </IconButton>
              <Menu
                id="vendor-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
               transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => handleMenuAction('export')}>
                      {intl.formatMessage({ id: 'Export' }) || 'Export'}

                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('print')}>
                       {intl.formatMessage({ id: 'Print' }) || 'Print'}
                </MenuItem>
              </Menu>
            </div>
            <VendorCustomGrid
              rowData={processedData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
                  paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
          paginationPageSize={100}
              animateRows={true}
              pinnedBottomRowData={totalRow}
              rowHeight={20}
              height="520px"
              headerHeight={30}
              pagination={true}
            />
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default VendorOutstanding;
