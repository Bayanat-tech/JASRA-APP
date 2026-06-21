import React, { useState } from 'react';

import { Box, Button, TextField, Switch, ButtonGroup, Tooltip } from '@mui/material';

import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AiOutlineEye } from 'react-icons/ai';

import dayjs, { Dayjs } from 'dayjs';

import { Autocomplete } from '@mui/material';

import { useSelector } from 'store';

import { useQuery } from '@tanstack/react-query';

import PfSerivceInstance from 'service/service.purhaseflow';

import POReport from '../../forms/Purchaseflow/POReportView';

interface ProjectOption {
  project_code: string;

  project_name: string;
}

interface ProjectListResponse {
  tableData: ProjectOption[];

  count: number;
}

interface ReportParams {
  fromDate: string;

  toDate: string;

  projectCode: string;

  requestStatus: string;

  prType: string;

  serviceRmFlag: string;

  reportType: 'Summary' | 'Detailed'; // <-- Fixed Type Issue
}

const POSelectCriteria: React.FC = () => {
  const [fromDate, setFromDate] = useState<Dayjs | null>(dayjs());

  const [toDate, setToDate] = useState<Dayjs | null>(dayjs());

  const [selectedProjectCode, setSelectedProjectCode] = useState<string>('');

  const [requestStatus, setRequestStatus] = useState<string | string[]>('');

  const [prType, setPrType] = useState<string | string[]>('');

  const [serviceRmFlag, setServiceRmFlag] = useState<string>('');

  const [reportType, setReportType] = useState<'Summary' | 'Detailed'>('Summary'); // <-- Fixed Type Issue

  const [showReport, setShowReport] = useState(false);

  const [reportParams, setReportParams] = useState<ReportParams | null>(null);

  const [disableDates, setDisableDates] = useState(false);

  const { app } = useSelector((state) => state.menuSelectionSlice);

  // Fetch project list from backend

  const { data: projectList } = useQuery<ProjectListResponse>({
    queryKey: ['project_data'],

    queryFn: async () => {
      const response = await PfSerivceInstance.getMasters(app, 'projectmaster');

      return response ? { tableData: response.tableData as ProjectOption[], count: response.count } : { tableData: [], count: 0 };
    },

    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const requestStatusValue = Array.isArray(requestStatus) ? requestStatus.join(', ') : requestStatus;

  const prTypeValue = Array.isArray(prType) ? prType.join(', ') : prType;

  const handleView = async () => {
    console.log('Current Report Type:', reportType); // Debugging log

    const params: ReportParams = {
      fromDate: fromDate?.format('DD-MM-YYYY') || '',
      toDate: toDate?.format('DD-MM-YYYY') || '',
      projectCode: selectedProjectCode || '',
      requestStatus: requestStatus.includes('Select All') ? 'All' : requestStatusValue,
      prType: prType.includes('Select All') ? 'All' : prTypeValue,
      serviceRmFlag: serviceRmFlag === 'Select All' ? 'All' : serviceRmFlag,
      reportType: reportType
    };

    console.log('Final Payload:', params);

    setReportParams(params);
    setShowReport(true);
  };

  const handleRequestStatusChange = (_: any, value: string | null) => {
    if (value === 'Select All') {
      setRequestStatus(['Select All']);
    } else {
      setRequestStatus(value ? [value] : '');
    }
  };

  const handlePrTypeChange = (_: any, value: string | null) => {
    if (value === 'Select All') {
      setPrType(['Select All']);
    } else {
      setPrType(value ? [value] : '');
    }
  };

  const handleServiceRmFlagChange = (_: any, value: string | null) => {
    setServiceRmFlag(value === 'Select All' ? 'All' : value || '');
  };

  const handleToggleDates = () => {
    setDisableDates((prev) => {
      const newDisableState = !prev;

      // If disabling, set both dates to null
      if (newDisableState) {
        setFromDate(null);
        setToDate(null);
      } else {
        // If enabling, set them to today's date
        setFromDate(dayjs());
        setToDate(dayjs());
      }

      return newDisableState;
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" flexDirection="column" gap={2} p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" bgcolor="#e7f5ff" p={1} borderRadius={1} width="50%">
          <Box display="flex" gap={2}>
            <DesktopDatePicker label="Request Date From" value={fromDate} onChange={setFromDate} disabled={disableDates} />
            <DesktopDatePicker label="Request Date To" value={toDate} onChange={setToDate} disabled={disableDates} />
            <Switch checked={disableDates} onChange={handleToggleDates} color="primary" />
          </Box>
        </Box>
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
          <Autocomplete
            options={projectList?.tableData || []}
            getOptionLabel={(option) => option.project_name || ''}
            onChange={(_, value) => setSelectedProjectCode(value?.project_code || '')}
            renderInput={(params) => <TextField {...params} label="Project" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Select All', 'In Progress', 'Approved', 'PO Generated']}
            value={Array.isArray(requestStatus) ? requestStatus[0] : requestStatus} // Display the first item if it's an array
            onChange={handleRequestStatusChange}
            renderInput={(params) => <TextField {...params} label="Request Status" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Select All', 'Charge to Supplier', 'Charge to Customer', 'Charge to Employee', 'Non Chargeable']}
            value={Array.isArray(prType) ? prType[0] : prType}
            onChange={handlePrTypeChange}
            renderInput={(params) => <TextField {...params} label="Type of PR" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Select All', 'Service', 'RM']}
            value={serviceRmFlag === 'All' ? 'Select All' : serviceRmFlag}
            onChange={handleServiceRmFlagChange}
            renderInput={(params) => <TextField {...params} label="SERVICE/RM Flag" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Summary', 'Detailed']}
            value={reportType}
            onChange={(_, value) => {
              console.log('Selected Report Type:', value);
              setReportType((value as 'Summary' | 'Detailed') || 'Summary');
            }}
            renderInput={(params) => <TextField {...params} label="Report Type" variant="outlined" fullWidth />}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <ButtonGroup>
            <Tooltip title="View">
              <Button size="small" variant="outlined" color="primary" onClick={handleView}>
                <AiOutlineEye />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>

        {showReport && reportParams && <POReport reportParams={reportParams} onClose={() => setShowReport(false)} />}
      </Box>
    </LocalizationProvider>
  );
};

export default POSelectCriteria;
