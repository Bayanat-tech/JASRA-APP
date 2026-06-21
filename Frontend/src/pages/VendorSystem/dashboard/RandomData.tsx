import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const RandomData = () => {
  const rowData = [
    { month: 'Sep 2025', totalRaised: 'OMR 14,500', paid: 'OMR 10,000', outstanding: 'OMR 4,500' },
    { month: 'Oct 2025', totalRaised: 'OMR 18,000', paid: 'OMR 5,500', outstanding: 'OMR 12,500' },
  ];

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, p: 2, height: 250 }}>
      <Typography variant="h5" fontWeight={600} mb={2} color="#1e293b">
        Outstanding Summary
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {['Month', 'Total Raised', 'Paid', 'Outstanding'].map((header) => (
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
            {rowData.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': { backgroundColor: '#f8fafc' }
                }}
              >
                <TableCell sx={{ paddingY: 1.5, fontWeight: 500 }}>{row.month}</TableCell>
                <TableCell sx={{ paddingY: 1.5, fontWeight: 600 }}>{row.totalRaised}</TableCell>
                <TableCell sx={{ paddingY: 1.5 }}>{row.paid}</TableCell>
                <TableCell 
                  sx={{ 
                    paddingY: 1.5, 
                    fontWeight: 600,
                    color: '#dc2626'
                  }}
                >
                  {row.outstanding}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RandomData;