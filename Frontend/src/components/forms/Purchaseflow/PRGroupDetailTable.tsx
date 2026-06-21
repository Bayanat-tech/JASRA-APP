import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';

interface PRReportData {
  request_number: string;
  request_date: string;
  item_code?: string;
  item_rate?: number | null;
  allocated_approved_qty?: number | null;
  lcurr_amt?: number | null;
  addl_item_desc?: string;
  status?: string;
}

interface PRGroupDetailTableProps {
  data: PRReportData[];
}

const PRGroupDetailTable: React.FC<PRGroupDetailTableProps> = ({ data }) => {
  const groupedData = data.reduce((acc: Record<string, Record<string, PRReportData[]>>, item) => {
    const statusKey = item.status || 'Unknown Status';
    if (!acc[statusKey]) acc[statusKey] = {};

    const formattedRequestNumber = item.request_number?.replace(/\$/g, '/') ?? 'Unknown';
    const requestKey = `${formattedRequestNumber} | ${item.request_date}`;
    if (!acc[statusKey][requestKey]) acc[statusKey][requestKey] = [];

    acc[statusKey][requestKey].push(item);
    return acc;
  }, {});

  const cellStyles = { py: 0.5, fontSize: '0.75rem' };
  const rightAlignedCellStyles = { ...cellStyles, textAlign: 'right' };

  let pageNumber = 1;

  return (
    <>
      {Object.entries(groupedData).map(([status, requests], index) => (
        <div key={status} style={{ marginBottom: '10px', pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
          <Typography variant="h6" sx={{ mt: 1, mb: 0.5, fontSize: '0.85rem', fontWeight: 'bold' }}>
            Status: {status} (Page {pageNumber++})
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 1 }}>
            <Table size="small" sx={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f0f0f0', height: '24px' }}>
                  <TableCell sx={{ width: '10%', ...cellStyles }}>Item Code</TableCell>
                  <TableCell sx={{ width: '40%', ...cellStyles }}>Item Description</TableCell>
                  <TableCell sx={{ width: '15%', ...rightAlignedCellStyles }}>Item Rate</TableCell>
                  <TableCell sx={{ width: '15%', ...rightAlignedCellStyles }}>Allocated Qty</TableCell>
                  <TableCell sx={{ width: '20%', ...rightAlignedCellStyles }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(requests).map(([requestKey, items]) => {
                  const subtotal = items.reduce((sum: number, item) => sum + (Number(item.lcurr_amt) || 0), 0);

                  return (
                    <React.Fragment key={requestKey}>
                      <TableRow sx={{ height: '24px' }}>
                        <TableCell colSpan={5} sx={{ fontWeight: 'bold', backgroundColor: '#e0e0e0', ...cellStyles }}>
                          {requestKey}
                        </TableCell>
                      </TableRow>

                      {items.map((item, idx) => {
                        const itemRate = Number(item.item_rate) || 0;
                        const allocatedQty = Number(item.allocated_approved_qty) || 0;
                        const lcurrAmt = Number(item.lcurr_amt) || 0;
                        const isServiceLine = item.item_code?.startsWith('SERVICE_LINE');

                        return (
                          <TableRow key={idx} sx={{ height: '24px' }}>
                            <TableCell sx={{ width: '10%', ...cellStyles }}>{isServiceLine ? '' : item.item_code || 'N/A'}</TableCell>
                            <TableCell sx={{ width: '40%', ...cellStyles }}>{item.addl_item_desc || 'N/A'}</TableCell>
                            <TableCell sx={{ width: '15%', ...rightAlignedCellStyles }}>
                              {itemRate > 0 ? itemRate.toFixed(2) : ''}
                            </TableCell>
                            <TableCell sx={{ width: '15%', ...rightAlignedCellStyles }}>{allocatedQty > 0 ? allocatedQty : ''}</TableCell>
                            <TableCell sx={{ width: '20%', ...rightAlignedCellStyles }}>
                              {lcurrAmt > 0 ? lcurrAmt.toFixed(2) : ''}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      <TableRow sx={{ backgroundColor: '#d9edf7', fontWeight: 'bold', height: '24px' }}>
                        <TableCell colSpan={4} sx={{ textAlign: 'right', ...cellStyles, fontWeight: 'bold' }}>
                          Request Total:
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', ...cellStyles, fontWeight: 'bold' }}>{subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}
    </>
  );
};

export default PRGroupDetailTable;
