import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Grid, Typography, Divider, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';

export interface ReportData {
  SERIAL_NUMBER: number;
  REQUEST_NUMBER: string;
  REQUEST_DATE: string;
  DESCRIPTION: string;
  REMARKS: string;
  AMOUNT: number | null;
  ITEM_CODE?: string | null;
  ITEM_RATE?: number | null;
  ITEM_QTY?: number | null;
  CURRENCY_RATE?: number | null;
}

interface PurchaseRequestLogProps {
  requestNumber: string;
  open: boolean;
  onClose: () => void;
}

const PurchaseRequestLog: React.FC<PurchaseRequestLogProps> = ({ requestNumber, open, onClose }) => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSerials, setExpandedSerials] = useState<Set<number>>(new Set());
  const [previousData, setPreviousData] = useState<ReportData[]>([]);

  useEffect(() => {
    if (!open || !requestNumber || requestNumber.trim() === '') return;

    console.log('Fetching log for request:', requestNumber);
    const sanitizedRequestNumber = requestNumber.replace(/\//g, '$$');
    setLoading(true);
    setError(null);

    GmPfServiceInstance.PRlogreport(sanitizedRequestNumber)
      .then((response: any) => {
        console.log('API Response:', response);

        const responseData = Array.isArray(response) ? response : response.data;

        if (!Array.isArray(responseData)) {
          setError('Invalid API response format');
          console.error('Invalid API response format:', response);
          setLoading(false);
          return;
        }

        const formattedData: ReportData[] = responseData.map((item: any) => ({
          SERIAL_NUMBER: item?.SERIAL_NUMBER ?? 0,
          REQUEST_NUMBER: item?.REQUEST_NUMBER ?? '',
          REQUEST_DATE: item?.REQUEST_DATE ?? '',
          DESCRIPTION: item?.DESCRIPTION ?? '',
          REMARKS: item?.REMARKS ?? '',
          AMOUNT: item?.AMOUNT ? parseFloat(item.AMOUNT) : null,
          ITEM_CODE: item?.ITEM_CODE ?? null,
          ITEM_RATE: item?.ITEM_RATE ? parseFloat(item.ITEM_RATE) : null,
          ITEM_QTY: item?.ITEM_QTY ? parseFloat(item.ITEM_QTY) : null,
          CURRENCY_RATE: item?.CURRENCY_RATE ? parseFloat(item.CURRENCY_RATE) : null
        }));

        setPreviousData(data);
        setData(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [requestNumber, open]);

  const formatValue = (value: any) => {
    if (value === null || value === '0.00' || value === undefined) {
      return 'N/A';
    }
    return value;
  };

  // Compare with previous data and highlight the changed fields
  const getChangeStyle = (current: any, previous: any) => {
    // Compare current value with previous value and highlight if changed
    if (current !== previous) {
      return { backgroundColor: '#ffcccb' }; // Light red background for changes
    }
    return {};
  };

  const handleToggleSerial = (serialNumber: number) => {
    setExpandedSerials((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(serialNumber)) {
        newExpanded.delete(serialNumber);
      } else {
        newExpanded.add(serialNumber);
      }
      return newExpanded;
    });
  };

  const groupedData = data.reduce((acc: { [key: number]: ReportData[] }, item: ReportData) => {
    if (!acc[item.SERIAL_NUMBER]) {
      acc[item.SERIAL_NUMBER] = [];
    }
    acc[item.SERIAL_NUMBER].push(item);
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Purchase Request Log</DialogTitle>
      <DialogContent>
        {loading ? (
          <p>Loading purchase request log...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : data.length === 0 ? (
          <p>No data available</p>
        ) : (
          <Box>
            {/* Display Request Number and Request Date */}
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="h6">Request Number:</Typography>
                <Typography>{formatValue(data[0].REQUEST_NUMBER)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Request Date:</Typography>
                <Typography>{formatValue(data[0].REQUEST_DATE)}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ margin: '16px 0' }} />

            {/* Iterate over grouped serial numbers */}
            {Object.keys(groupedData).map((serialNumber) => {
              const serialItems = groupedData[serialNumber as unknown as number];
              const previousSerialItems = previousData.filter((item) => item.SERIAL_NUMBER === Number(serialNumber));

              return (
                <Box key={`serial-${serialNumber}`} sx={{ marginBottom: '16px' }}>
                  {/* Clickable serial number to toggle collapse */}
                  <Grid container spacing={2} sx={{ cursor: 'pointer' }} onClick={() => handleToggleSerial(Number(serialNumber))}>
                    <Grid item xs={11}>
                      <Typography variant="h6" color="primary">
                        Serial Number: {serialNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton onClick={() => handleToggleSerial(Number(serialNumber))}>
                        {expandedSerials.has(Number(serialNumber)) ? <ExpandMore /> : <ChevronRight />}
                      </IconButton>
                    </Grid>
                  </Grid>

                  {/* Collapsible content */}
                  <Collapse in={expandedSerials.has(Number(serialNumber))}>
                    <Grid container spacing={3} sx={{ marginBottom: '16px' }}>
                      {/* Description, Remarks, and Amount (Displayed only once for each serial number) */}
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">Description:</Typography>
                        <Typography style={getChangeStyle(serialItems[0].DESCRIPTION, previousSerialItems[0]?.DESCRIPTION)}>
                          {formatValue(serialItems[0].DESCRIPTION)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">Remarks:</Typography>
                        <Typography style={getChangeStyle(serialItems[0].REMARKS, previousSerialItems[0]?.REMARKS)}>
                          {formatValue(serialItems[0].REMARKS)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle1">Amount:</Typography>
                        <Typography style={getChangeStyle(serialItems[0].AMOUNT, previousSerialItems[0]?.AMOUNT)}>
                          {formatValue(serialItems[0].AMOUNT)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider />

                    {/* Item Details for each entry under the same serial number */}
                    <Grid container spacing={3}>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Item Code</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Item Rate</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="subtitle2">Quantity</Typography>
                      </Grid>
                    </Grid>

                    {serialItems.map((entry) => {
                      const previousEntry = previousSerialItems.find((item) => item.ITEM_CODE === entry.ITEM_CODE);

                      return (
                        <Grid container spacing={3} key={`item-${entry.SERIAL_NUMBER}`} sx={{ marginBottom: '8px' }}>
                          <Grid item xs={4}>
                            <Typography style={getChangeStyle(entry.ITEM_CODE, previousEntry?.ITEM_CODE)}>
                              {formatValue(entry.ITEM_CODE)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography style={getChangeStyle(entry.ITEM_RATE, previousEntry?.ITEM_RATE)}>
                              {formatValue(entry.ITEM_RATE)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography style={getChangeStyle(entry.ITEM_QTY, previousEntry?.ITEM_QTY)}>
                              {formatValue(entry.ITEM_QTY)}
                            </Typography>
                          </Grid>
                        </Grid>
                      );
                    })}
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseRequestLog;
