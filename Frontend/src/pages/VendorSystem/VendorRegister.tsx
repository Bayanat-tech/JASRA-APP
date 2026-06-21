import React, { useMemo, useState, useEffect } from 'react';
import { Container, TextField, Paper, Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { ColDef } from 'ag-grid-community';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import VendorServiceInstance from './services/service.vendor';
import { useQuery } from '@tanstack/react-query';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { useDispatch } from 'react-redux';
import useAuth from 'hooks/useAuth';
import * as XLSX from 'xlsx';
import { MoreOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import dayjs from 'dayjs';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Utility functions
const formatDate = (value: any): string => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-GB').format(date); // dd/mm/yyyy
  } catch {
    return '';
  }
};

const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // yyyy-mm-dd
};

const formatToDDMMYYYY = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const amountFormatter = (params: any) => {
  if (params.value === null || params.value === undefined || params.value === '') return '';
  const num = Number(params.value);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

const getAmountCellStyle = (params: any) => {
  const num = Number(params.value);
  return { color: num < 0 ? '#C62828' : '', textAlign: 'right' };
};

// Define a consistent type for rows
interface VendorRow {
  INV_NO: string;
  INV_DATE?: string | null;
  DOC_TYPE?: string | null;
  DOC_NO?: string;
  DOC_DATE?: string | null;
  REMARKS?: string;
  DEBIT_AMT: string | number;
  CREDIT_AMT: string | number;
  BALANCE: string | number;
}

const VendorRegister: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const intl = useIntl();

  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());
  const [filters, setFilters] = useState({ from: getToday(), to: getToday() });

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Fetch vendor leader data
  const { data: vendorLeaderData = [], isFetching } = useQuery<any[], Error>({
    queryKey: ['vendor-leader', filters, user?.loginid],
    queryFn: async () => {
      const from = formatToDDMMYYYY(filters.from);
      const to = formatToDDMMYYYY(filters.to);
      return await VendorServiceInstance.getVendorLeader('BSG', user?.loginid ?? '', from, to);
    },
    enabled: !!filters.from || (!!filters.to && !!user?.loginid),
    retry: false
  });

  useEffect(() => {
    if (isFetching) dispatch(openBackdrop());
    else dispatch(closeBackdrop());
  }, [isFetching, dispatch]);

  // Processed data with running balance
  const processedData: VendorRow[] = useMemo(() => {
    if (!vendorLeaderData || vendorLeaderData.length === 0) return [];
    let runningBalance = 0;
    return vendorLeaderData.map((row: any) => {
      const debit = Number(row.DEBIT_AMT) || 0;
      const credit = Number(row.CREDIT_AMT) || 0;
      runningBalance += credit - debit;

      return {
        INV_NO: row.INV_NO ?? '',
        INV_DATE: row.INV_DATE ?? '',
        DOC_TYPE: row.DOC_TYPE ?? '',
        DOC_NO: row.DOC_NO ?? '',
        DOC_DATE: row.DOC_DATE ?? '',
        REMARKS: row.REMARKS ?? '',
        DEBIT_AMT: row.DEBIT_AMT ?? 0,
        CREDIT_AMT: row.CREDIT_AMT ?? 0,
        BALANCE: runningBalance
      };
    });
  }, [vendorLeaderData]);

  // Totals row
  const totalRow: VendorRow[] = useMemo(() => {
    if (!vendorLeaderData || vendorLeaderData.length === 0) return [];
    const totalDebit = vendorLeaderData.reduce((sum, row) => sum + (Number(row.DEBIT_AMT) || 0), 0);
    const totalCredit = vendorLeaderData.reduce((sum, row) => sum + (Number(row.CREDIT_AMT) || 0), 0);
    const netBalance = totalDebit - totalCredit;

    return [
      {
        INV_NO: 'Total',
        INV_DATE: '',
        DOC_TYPE: '',
        DOC_NO: '',
        DOC_DATE: '',
        REMARKS: '',
        DEBIT_AMT: totalDebit.toFixed(3),
        CREDIT_AMT: totalCredit.toFixed(3),
        BALANCE: netBalance.toFixed(3)
      }
    ];
  }, [vendorLeaderData]);

  // Column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number',
        field: 'INV_NO',
        width: 150,
        cellStyle: (params) => ({
          fontSize: '0.775rem',
          fontWeight: params.node.rowPinned === 'bottom' ? 'bold' : 'normal'
        })
      },
      {
        headerName: intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date',
        field: 'INV_DATE', width: 130, valueFormatter: ({ value }) => formatDate(value)
      },
      {
        headerName: intl.formatMessage({ id: 'DocType' }) || 'Doc Type',
        field: 'DOC_TYPE', width: 110
      },
      {
        headerName: intl.formatMessage({ id: 'DocNumber' }) || 'Doc Number',
        field: 'DOC_NO', width: 130, cellDataType: 'text',
      },
      {
        headerName: intl.formatMessage({ id: 'DocDate' }) || 'Doc Date',
        field: 'DOC_DATE', width: 110, valueFormatter: ({ value }) => formatDate(value)
      },
      {
        headerName: intl.formatMessage({ id: 'Remark' }) || 'Remark',
        field: 'REMARKS', width: 355, wrapText: true, autoHeight: true
      },
      {
        headerName: intl.formatMessage({ id: 'DebitAmount' }) || 'Debit Amt',
        field: 'DEBIT_AMT',
        width: 120,
        cellStyle: (params) => ({ ...getAmountCellStyle(params), fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        headerName: intl.formatMessage({ id: 'CreditAmount' }) || 'Credit Amt',
        field: 'CREDIT_AMT',
        width: 120,
        cellStyle: (params) => ({ ...getAmountCellStyle(params), fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      },
      {
        headerName: intl.formatMessage({ id: 'Balance' }) || 'Balance',
        field: 'BALANCE',
        width: 115,
        cellStyle: (params) => ({ ...getAmountCellStyle(params), fontSize: '0.775rem' }),
        valueFormatter: amountFormatter
      }
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    cellStyle: { fontSize: '0.775rem' }
  }), []);

  const handleView = () => {
    if (!fromDate && !toDate) {
      alert(intl.formatMessage({ id: 'SelectDateFilter' }) || 'Please select at least one date filter.');
      return;
    }
    setFilters({ from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setFromDate(getToday());
    setToDate(getToday());
    setFilters({ from: getToday(), to: getToday() });
  };

  // Export / Print actions
  const handleMenuAction = (action: string) => {
    handleMenuClose();

    if (action === 'export') {
      if (!processedData || processedData.length === 0) {
        alert(intl.formatMessage({ id: 'NoDataToExport' }) || 'No data available to export!');
        return;
      }

      const exportData = [...processedData, ...totalRow];
      const worksheet = XLSX.utils.json_to_sheet(
        exportData.map((row) => ({
          [intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number']: row.INV_NO,
          [intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date']: formatDate(row.INV_DATE),
          [intl.formatMessage({ id: 'DocType' }) || 'Doc Type']: row.DOC_TYPE,
          [intl.formatMessage({ id: 'DocNumber' }) || 'Doc Number']: row.DOC_NO,
          [intl.formatMessage({ id: 'DocDate' }) || 'Doc Date']: formatDate(row.DOC_DATE),
          [intl.formatMessage({ id: 'Remark' }) || 'Remark']: row.REMARKS,
          [intl.formatMessage({ id: 'DebitAmount' }) || 'Debit Amount']: row.DEBIT_AMT,
          [intl.formatMessage({ id: 'CreditAmount' }) || 'Credit Amount']: row.CREDIT_AMT,
          [intl.formatMessage({ id: 'Balance' }) || 'Balance']: row.BALANCE
        }))
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'VendorStatement');
      XLSX.writeFile(workbook, `VendorStatement_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    }

    if (action === 'print') {
      if (!processedData || processedData.length === 0) {
        alert(intl.formatMessage({ id: 'NoDataToPrint' }) || 'No data available to print!');
        return;
      }

      const printData = [...processedData, ...totalRow];
      const tableHtml = `
        <html>
          <head>
               <title>{intl.formatMessage({ id: 'VendorStatement' }) || 'Vendor Statement'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { border-collapse: collapse; width: 100%; font-size: 12px; }
              th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
              th { background: #f2f2f2; }
              tfoot td { font-weight: bold; background: #f9f9f9; }
            </style>
          </head>
          <body>
            <h2>Statement of Account</h2>
             <h2>{intl.formatMessage({ id: 'StatementofAccount' }) || 'Statement of Account'}</h2>
            <table>
              <thead>
                <tr>
              <th>{intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number'}</th>
              <th>{intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date'}</th>
              <th>{intl.formatMessage({ id: 'DocType' }) || 'Doc Type'}</th>
              <th>{intl.formatMessage({ id: 'DocNumber' }) || 'Doc Number'}</th>
              <th>{intl.formatMessage({ id: 'DocDate' }) || 'Doc Date'}</th>
              <th>{intl.formatMessage({ id: 'Remark' }) || 'Remark'}</th>
              <th>{intl.formatMessage({ id: 'DebitAmount' }) || 'Debit Amount'}</th>
              <th>{intl.formatMessage({ id: 'Credit Amount' }) || 'Credit Amount'}</th>
              <th>{intl.formatMessage({ id: 'Balance' }) || 'Balance'}</th>
                </tr>
              </thead>
              <tbody>
                ${printData
          .map(
            (row) => `
                  <tr>
                    <td>${row.INV_NO}</td>
                    <td>${formatDate(row.INV_DATE)}</td>
                    <td>${row.DOC_TYPE}</td>
                    <td>${row.DOC_NO}</td>
                    <td>${formatDate(row.DOC_DATE)}</td>
                    <td>${row.REMARKS ?? ''}</td>
                    <td style="text-align:right;">${row.DEBIT_AMT}</td>
                    <td style="text-align:right;">${row.CREDIT_AMT}</td>
                    <td style="text-align:right;">${row.BALANCE}</td>
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
      <Typography variant="h5" gutterBottom sx={{ color: '#082A89', fontWeight: 600, fontSize: '1.5rem' }}>
        Statement of Account
      </Typography>

      <Paper sx={{ p: 1, display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label={intl.formatMessage({ id: 'FromDate' }) || 'From Date'}
          type="date"
          size="small"
          value={fromDate}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 140 }}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <TextField
          label={intl.formatMessage({ id: 'ToDate' }) || 'To Date'}
          type="date"
          size="small"
          value={toDate}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 140 }}
          onChange={(e) => setToDate(e.target.value)}
        />
        <Button
          size="small"
          onClick={handleView}
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#082A89', color: '#fff', border: '1.5px solid #082A89' }
          }}
        >
          {intl.formatMessage({ id: 'View' }) || 'View'}
        </Button>
        <Button
          size="small"
          onClick={handleClear}
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#082A89', color: '#fff', border: '1.5px solid #082A89' }
          }}
        >
          {intl.formatMessage({ id: 'ClearFilters' }) || 'Clear Filters'}
        </Button>
      </Paper>

      <Box sx={{ width: '100%', height: 'calc(100vh - 200px)' }}>
        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, zIndex: 2 }}>
              <IconButton
                aria-label="more"
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
                  <FormattedMessage id="Export" />
                </MenuItem>
                <MenuItem onClick={() => handleMenuAction('print')}>
                  <FormattedMessage id="Print" />
                </MenuItem>
              </Menu>
            </div>

            <VendorCustomGrid
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowData={processedData}
              pinnedBottomRowData={totalRow}
              pagination
              paginationPageSize={100}
              rowHeight={20}
              headerHeight={30}
              height="470px"
              paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
            />
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default VendorRegister;
