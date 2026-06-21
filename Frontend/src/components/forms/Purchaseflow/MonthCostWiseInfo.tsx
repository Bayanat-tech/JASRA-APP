import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, InputBase } from '@mui/material';
import { TMonthCostWiseInfo } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from 'react';
interface MonthCostWiseInfoProps {
  monthCostData: TMonthCostWiseInfo[];
}

const MonthCostWiseInfo: React.FC<MonthCostWiseInfoProps> = ({ monthCostData = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  console.log('Received Data:', monthCostData);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthNameToNumber: Record<string, number> = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12
  };

  const filterData = (type: 'past' | 'current' | 'future') => {
    return monthCostData
      .filter((item) => {
        const itemYear = parseInt(item.budget_year, 10);
        const itemMonth = monthNameToNumber[item.month_budget] || 0;

        if (type === 'future') return itemYear > currentYear || (itemYear === currentYear && itemMonth > currentMonth);
        if (type === 'current') return itemYear === currentYear && itemMonth === currentMonth;
        return itemYear < currentYear || (itemYear === currentYear && itemMonth < currentMonth);
      })
      .filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())));
  };

  const filteredFutureData = filterData('future');
  const filteredCurrentData = filterData('current');
  const filteredPastData = filterData('past');

  const calculateTotals = (data: TMonthCostWiseInfo[]) => ({
    requested_amt: data.reduce((sum, item) => sum + (Number(item.requested_amt) || 0), 0),
    req_approved_amt: data.reduce((sum, item) => sum + (Number(item.req_approved_amt) || 0), 0),
    approved_amt: data.reduce((sum, item) => sum + (Number(item.approved_amt) || 0), 0),
    po_amount: data.reduce((sum, item) => sum + (Number(item.po_amount) || 0), 0),
    pr_amount: data.reduce((sum, item) => sum + (Number(item.pr_amount) || 0), 0)
  });

  const renderTable = (data: TMonthCostWiseInfo[], title: string) => {
    const totals = calculateTotals(data);

    return (
      <Box flex={1} p={1} border={1} borderColor="grey.300" borderRadius={1} minWidth={400}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '100px' }}>Cost Code</TableCell>
              <TableCell sx={{ width: '150px' }}>Requested Amount</TableCell>
              <TableCell sx={{ width: '150px' }}>Req Approved Amount</TableCell>
              <TableCell sx={{ width: '120px' }}>Month Budget</TableCell>
              <TableCell sx={{ width: '120px' }}>Budget Year</TableCell>
              <TableCell sx={{ width: '150px' }}>Approved Amount</TableCell>
              <TableCell sx={{ width: '120px' }}>PO Amount</TableCell>
              <TableCell sx={{ width: '120px' }}>PR Amount</TableCell>
              <TableCell sx={{ width: '200px' }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => {
                const totalAmount = Number(item.pr_amount) + Number(item.po_amount);
                const approvedAmount = Number(item.approved_amt);
                let remarks = '',
                  bgColor = 'transparent';

                if (totalAmount > approvedAmount) {
                  remarks = 'Excess';
                  bgColor = 'red';
                } else if (totalAmount < approvedAmount) {
                  remarks = 'Saving';
                  bgColor = 'green';
                }

                return (
                  <TableRow key={index}>
                    {[
                      item.cost_code,
                      item.requested_amt,
                      item.req_approved_amt,
                      item.month_budget,
                      item.budget_year,
                      item.approved_amt,
                      item.po_amount,
                      item.pr_amount,
                      remarks
                    ].map((value, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          fontSize: '0.75rem',
                          padding: '4px',
                          backgroundColor: idx === 8 ? bgColor : 'transparent',
                          color: bgColor !== 'transparent' && idx === 8 ? 'white' : 'inherit'
                        }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ fontSize: '0.75rem', padding: '4px' }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
            <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
              <TableCell sx={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px' }}>Total</TableCell>
              {[totals.requested_amt, totals.req_approved_amt, '', '', totals.approved_amt, totals.po_amount, totals.pr_amount, ''].map(
                (value, idx) => (
                  <TableCell key={idx} sx={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px' }}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box width="100%">
      <Box display="flex" alignItems="center" border={1} borderColor="grey.400" borderRadius={2} p={1} mb={2} width="50%">
        <SearchIcon sx={{ fontSize: '1rem', color: 'gray', mr: 1 }} />
        <InputBase
          placeholder="Search table..."
          fullWidth
          sx={{ fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <Box display="flex" gap={1} flexWrap="wrap">
        {renderTable([...filteredCurrentData, ...filteredFutureData], 'Current & Future Months')}
        {renderTable(filteredPastData, 'Previous Months')}
      </Box>
    </Box>
  );
};

export default MonthCostWiseInfo;
