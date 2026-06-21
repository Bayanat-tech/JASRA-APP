import React, { useMemo, useState, useEffect } from 'react';
import { Container, TextField, Paper, Box, Typography, Button, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import { ColDef, ValueFormatterParams, ICellRendererParams } from 'ag-grid-community';
import VendorCustomGrid from 'components/grid/VednorCustomGrid';
import VendorServiceInstance from './services/service.vendor';
import { useQuery } from '@tanstack/react-query';
import { TVendorMain } from './vendorTypes/TVendor';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import { useDispatch } from 'react-redux';
import { MoreOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { useIntl } from 'react-intl';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// helper: format date safely for table cells
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

// helper: today's date in yyyy-mm-dd
const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // yyyy-mm-dd
};

const formatToDDMMYYYY = (value: string) => {
  if (!value) return '';
  const [year, month, day] = value.split('-'); // "yyyy-mm-dd"
  return `${day}/${month}/${year}`; // "dd/mm/yyyy"
};

// Utility formatter for currency/amounts
const amountFormatter = (params: ValueFormatterParams) => {
  if (params.value === null || params.value === undefined || params.value === '') return '';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(Number(params.value));
};

const VendorStatus: React.FC = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const openMenu = Boolean(anchorEl);

  // default values = today's date
  const [fromDate, setFromDate] = useState(getToday());
  const [toDate, setToDate] = useState(getToday());
  const [filters, setFilters] = useState({ from: getToday(), to: getToday() });
  const { user } = useAuth();

  const {
    data: vendorLeaderData = [],
    isFetching,
    error
  } = useQuery<TVendorMain[], Error>({
    queryKey: ['vendor-leader', filters, user?.loginid],
    queryFn: async () => {
      const from = formatToDDMMYYYY(filters.from);
      const to = formatToDDMMYYYY(filters.to);
      return await VendorServiceInstance.getVendorStatus('BSG', user?.loginid ?? '', from, to);
    },
    enabled: !!filters.from && !!filters.to && !!user?.loginid,
    retry: false
  });

  // loader
  useEffect(() => {
    if (isFetching) {
      dispatch(openBackdrop());
    } else {
      dispatch(closeBackdrop());
    }
  }, [isFetching, dispatch]);

  const totalRow = useMemo(() => {
    if (!vendorLeaderData || vendorLeaderData.length === 0) return [];

    const totalAmount = vendorLeaderData.reduce((sum, row) => sum + (Number(row.AMOUNT) || 0), 0);
    const totalLcurAmount = vendorLeaderData.reduce((sum, row) => sum + (Number(row.LCUR_AMOUNT) || 0), 0);

    return [
      {
        DOC_TYPE: 'Total',
        AMOUNT: totalAmount.toFixed(2),
        LCUR_AMOUNT: totalLcurAmount.toFixed(2)
      }
    ];
  }, [vendorLeaderData]);

  const handleMenuAction = (action: string) => {
    handleMenuClose();
    if (action === 'export') {
      if (!vendorLeaderData || vendorLeaderData.length === 0) return;
      const exportData = [...vendorLeaderData, ...totalRow];

      const worksheet = XLSX.utils.json_to_sheet(
        exportData.map((row) => {
          const isVendorRow = 'INV_NO' in row;
          return {
            'Doc Type': row.DOC_TYPE,
            'Doc No': isVendorRow ? (row as TVendorMain).INV_NO : '',
            'Doc Date': isVendorRow ? formatDate((row as TVendorMain).INV_DATE) : '',
            'Doc Ref No': isVendorRow ? (row as TVendorMain).DOC_NO : '',
            Remark: isVendorRow ? (row as TVendorMain).REMARKS : '',
            'Debit Amount': isVendorRow ? (row as TVendorMain).DEBIT_AMOUNT : '',
            'Credit Amount': isVendorRow ? (row as TVendorMain).CREDIT_AMOUNT : '',
            Balance: isVendorRow ? (row as TVendorMain).BALANCE : '',
            Amount: row.AMOUNT ?? '',
            'LCUR Amount': row.LCUR_AMOUNT ?? ''
          };
        })
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Outstanding');
      XLSX.writeFile(workbook, `Outstanding_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    }

    if (action === 'print') {
      window.print();
    }
  };

  // ✅ Column Definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: intl.formatMessage({ id: 'DocType' }) || 'Doc Type',
        field: 'DOC_TYPE',
        width: 110,
        cellStyle: (params) => {
          if (params.node.rowPinned === 'bottom') {
            return { background: '#f1f1f1' };
          }
          return null;
        }
      },
      {
        headerName: intl.formatMessage({ id: 'PONumber' }) || 'PO Number',
        field: 'PO_NO', width: 120
      },
      {
        headerName: intl.formatMessage({ id: 'PODate' }) || 'PO Date',
        field: 'PO_DATE',
        width: 110,
        valueFormatter: ({ value }) => formatDate(value)
      },
      {
        headerName: intl.formatMessage({ id: 'InvoiceNumber' }) || 'Invoice Number',
        field: 'PI_DOC_NO',
        width: 150,
        cellStyle: { textAlign: 'center' },
        valueFormatter: (params) => (params.value === 0 || params.value === '0' ? '' : params.value)
      },
      {
        headerName: intl.formatMessage({ id: 'InvoiceDate' }) || 'Invoice Date',
        field: 'INV_DATE',
        width: 130,
        valueFormatter: ({ value }) => formatDate(value)
      },
      {
        headerName: intl.formatMessage({ id: 'Amount' }) || 'Amount',
        field: 'AMOUNT',
        width: 120,
        cellStyle: { textAlign: 'right' },
        valueFormatter: amountFormatter
      },
      {
        headerName: intl.formatMessage({ id: 'DivisionName' }) || 'Division Name',
        field: 'DIV_NAME', width: 320
      },
      {
        headerName: intl.formatMessage({ id: 'Status' }) || 'Status',
        field: 'PAY_STATUS',
        width: 250,
        cellRenderer: (params: ICellRendererParams) => {
          const status = (params.value as string) || '';

          let chipProps: any = {
            label: status,
            variant: 'outlined',
            sx: {
              borderRadius: '22px',
              fontSize: '0.6rem',     // smaller text
              fontWeight: 700,
              textAlign: 'center',
              // minWidth: '30px',       // narrower
              // maxWidth: '170px',
              height: '14px',         // smaller chip height
              px: '4px',
              width: 'fit-content'              // smaller horizontal padding
            }

          };

          const lowerStatus = status.toLowerCase();

          if (lowerStatus.includes('payment cleared')) {
            chipProps.sx = {
              ...chipProps.sx,
              // backgroundColor: '#1565C0',
              color: '#2E7D32',
              border: 'solid 1px #2E7D32'
            };
          } else if (lowerStatus.includes('not booked')) {
            chipProps.color = 'warning';
          } else if (lowerStatus.includes('adv. payment')) {
            chipProps.sx = {
              ...chipProps.sx,
              // backgroundColor: '#1565C0',
              color: '#1565C0',
              border: 'solid 1px #1565C0',
              margin: '0 4px'
            };
          } else if (lowerStatus.includes('payment pending')) {
            chipProps.color = 'error';
          } else {
            chipProps.color = 'default';
          }

          return <Chip {...chipProps} />;
        }

      }
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      cellStyle: { fontSize: '0.775rem' }
    }),
    []
  );

  // ✅ Row background color logic
  const getRowStyle = (params: any) => {

    const status = (params.data?.PAY_STATUS || '').toLowerCase();
    if (status.includes('payment cleared')) {
      return { backgroundColor: '#eafaf1' };
    } else if (status.includes('not booked')) {
      return { backgroundColor: '#fff9e6' };
    } else if (status.includes('adv. payment')) {
      return { backgroundColor: '#E3F2FD' }; // text visible on dark bg
    } else if (status.includes('payment pending')) {
      return { backgroundColor: '#ffe6e6' };
    }
    return null;
  };

  const handleView = () => {
    if (!fromDate || !toDate) {
      alert(
        intl.formatMessage({ id: 'PleaseSelectDates' }) || 'Please select both From and To dates.'
      );
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      alert(
        intl.formatMessage({ id: 'FromDateGreater' }) || 'From Date cannot be greater than To Date.'
      );
      return;
    }
    setFilters({ from: fromDate, to: toDate });
  };

  const handleClear = () => {
    setFromDate(getToday());
    setToDate(getToday());
    setFilters({ from: getToday(), to: getToday() });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          color: '#082A89',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}
      >
        {intl.formatMessage({ id: 'StatusReport' }) || 'Status Report'}
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 1,
          bgcolor: '#f9f9f9',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'nowrap',
          overflowX: 'auto'
        }}
      >
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
        <Button variant="contained" size="small" onClick={handleView}>
          {intl.formatMessage({ id: 'View' }) || 'View'}
        </Button>
        <Button variant="contained" size="small" onClick={handleClear}>

          {intl.formatMessage({ id: 'ClearFilters' }) || 'Clear Filters'}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {intl.formatMessage({ id: 'FailedToLoadData' }) || 'Failed to load data'}: {error.message}
        </Typography>
      )}

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
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowData={vendorLeaderData}
              rowHeight={20}
              height="470px"
              headerHeight={30}
              pagination={true}
              paginationPageSize={100}
              pinnedBottomRowData={totalRow}
              paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
              getRowStyle={getRowStyle}  // ✅ Apply row-level background color
            />
          </div>
        </div>
      </Box>
    </Container>
  );
};

export default VendorStatus;
