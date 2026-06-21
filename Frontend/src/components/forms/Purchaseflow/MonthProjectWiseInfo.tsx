import React, { useState } from 'react';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Typography, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TMonthProjectWiseInfo } from 'pages/Purchasefolder/type/budgetrequestheader_pf-types';

interface MonthProjectWiseInfoProps {
  monthProjectData: TMonthProjectWiseInfo[];
}

const MonthProjectWiseInfo: React.FC<MonthProjectWiseInfoProps> = ({ monthProjectData = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (monthProjectData.length === 0) {
    return <Typography sx={{ fontSize: '0.75rem' }}>No data available</Typography>;
  }

  const { project_code, project_name } = monthProjectData[0];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const filterData = (data: TMonthProjectWiseInfo[]) =>
    data.filter((item) => Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase())));

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

  const futureData = monthProjectData.filter((item) => {
    const itemYear = parseInt(item.budget_year, 10);
    const itemMonth = monthNameToNumber[item.month_budget] || 0;
    return itemYear > currentYear || (itemYear === currentYear && itemMonth >= currentMonth);
  });

  const pastData = monthProjectData.filter((item) => {
    const itemYear = parseInt(item.budget_year, 10);
    const itemMonth = monthNameToNumber[item.month_budget] || 0;
    return itemYear < currentYear || (itemYear === currentYear && itemMonth < currentMonth);
  });

  const calculateTotals = (data: TMonthProjectWiseInfo[]) => ({
    requested_amt: data.reduce((sum, item) => sum + (item.requested_amt || 0), 0),
    req_appr_amt: data.reduce((sum, item) => sum + (item.req_appr_amt || 0), 0),
    approved_amt: data.reduce((sum, item) => sum + (item.approved_amt || 0), 0),
    po_amount: data.reduce((sum, item) => sum + (item.po_amount || 0), 0),
    pr_amount: data.reduce((sum, item) => sum + (item.pr_amount || 0), 0)
  });

  const renderTable = (data: TMonthProjectWiseInfo[], title: string, isFuture: boolean, totals: any) => (
    <Box flex={1} p={1} border={1} borderColor="grey.300" borderRadius={2} minWidth={400}>
      <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 'bold', mb: 1 }}>
        {title}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>Month</TableCell>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>Year</TableCell>
            {isFuture && <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>Requested</TableCell>}
            {isFuture && <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>Req Approved</TableCell>}
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>Approved</TableCell>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>PO</TableCell>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>PR</TableCell>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>Remarks</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => {
              const totalAmount = Number(item.pr_amount) + Number(item.po_amount);
              const approvedAmount = Number(item.approved_amt);
              let remarks = '';
              let bgColor = 'transparent';

              if (totalAmount > approvedAmount) {
                remarks = 'Excess';
                bgColor = 'red';
              } else if (totalAmount < approvedAmount) {
                remarks = 'Saving';
                bgColor = 'green';
              }

              return (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.month_budget}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.budget_year}</TableCell>
                  {isFuture && <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.requested_amt.toFixed(2)}</TableCell>}
                  {isFuture && <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.req_appr_amt.toFixed(2)}</TableCell>}
                  <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.approved_amt.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.po_amount.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>{item.pr_amount.toFixed(2)}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: bgColor,
                      color: bgColor !== 'transparent' ? 'white' : 'inherit',
                      fontSize: '0.7rem',
                      padding: '4px'
                    }}
                  >
                    {remarks}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isFuture ? 8 : 6} align="center" sx={{ fontSize: '0.7rem', padding: '4px' }}>
                No data available
              </TableCell>
            </TableRow>
          )}
          <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
            <TableCell colSpan={2} sx={{ fontSize: '0.7rem', padding: '4px' }}>
              <b>Total</b>
            </TableCell>
            {isFuture && (
              <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>
                <b>{totals.requested_amt.toFixed(2)}</b>
              </TableCell>
            )}
            {isFuture && (
              <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>
                <b>{totals.req_appr_amt.toFixed(2)}</b>
              </TableCell>
            )}
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>
              <b>{totals.approved_amt.toFixed(2)}</b>
            </TableCell>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>
              <b>{totals.po_amount.toFixed(2)}</b>
            </TableCell>
            <TableCell sx={{ fontSize: '0.7rem', padding: '4px' }}>
              <b>{totals.pr_amount.toFixed(2)}</b>
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <Box width="100%">
      <Typography variant="h6" sx={{ fontSize: '0.85rem', fontWeight: 'bold', mb: 1 }}>
        Project Code: {project_code} | Project Name: {project_name}
      </Typography>
      {/* 🔹 Search Bar */}
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
      <Box display="flex" gap={1}>
        {renderTable(filterData(futureData), 'Current & Future Months', true, calculateTotals(futureData))}
        {renderTable(filterData(pastData), 'Previous Months', false, calculateTotals(pastData))}
      </Box>
    </Box>
  );
};

export default MonthProjectWiseInfo;
