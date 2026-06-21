import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from "@mui/material";

const VendorRecentInv = () => {
  const rowData = [
    { invoice: 'INV-1056', date: '20-Oct', po: '2025', amount: 'OMR 2,500', status: 'Approved' },
    { invoice: 'INV-1057', date: '25-Oct', po: '2025', amount: 'OMR 1,500', status: 'Submitted' },
    { invoice: 'INV-1049', date: '10-Oct', po: '2025', amount: 'OMR 3,300', status: 'Paid' },
  ];

  type StatusType = 'Paid' | 'Approved' | 'Submitted' | 'Rejected' | string;

  const getStatusColor = (status : StatusType) => {
    switch (status) {
      case 'Paid': return { bg: '#dcfce7', color: '' };
      case 'Approved': return { bg: '#dbeafe', color: '' };
      case 'Submitted': return { bg: '#fef3c7', color: '' };
      case 'Rejected': return { bg: '#fee2e2', color: '' };
      default: return { bg: '#f3f4f6', color: '' };
    }
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, p: 2, height: 320 }}>
      <Typography variant="h5" fontWeight={600} mb={2} color="#1e293b">
        Recent Invoices
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Invoice #', 'Date', 'PO #', 'Amount', 'Status', 'Action'].map((header) => (
                <TableCell 
                  key={header} 
                  sx={{ 
                    fontWeight: 600, 
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    paddingY: 1.5,
                    borderBottom: '2px solid #e2e8f0'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rowData.map((row, index) => {
              const statusColor = getStatusColor(row.status);
              return (
                <TableRow 
                  key={index}
                  sx={{ 
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': { backgroundColor: '#f8fafc' }
                  }}
                >
                  <TableCell sx={{ paddingY: 1.5, fontWeight: 500 }}>{row.invoice}</TableCell>
                  <TableCell sx={{ paddingY: 1.5 }}>{row.date}</TableCell>
                  <TableCell sx={{ paddingY: 1.5 }}>{row.po}</TableCell>
                  <TableCell sx={{ paddingY: 1.5, fontWeight: 600 }}>{row.amount}</TableCell>
                  <TableCell sx={{ paddingY: 1.5 }}>
                    <Chip 
                      label={row.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.color,
                        fontWeight: 600,
                        minWidth: 80
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ paddingY: 1.5 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        minWidth: 'auto',
                        padding: '2px 8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default VendorRecentInv;