import React, { useState } from 'react';

import { Box, Button, TextField, Switch, Tooltip, ButtonGroup } from '@mui/material';

import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs, { Dayjs } from 'dayjs';

import { Autocomplete } from '@mui/material';

import { useSelector } from 'store';

import { useQuery } from '@tanstack/react-query';

import PfSerivceInstance from 'service/service.purhaseflow';

//import PRReport from '../../forms/Purchaseflow/PRReportView';

import Budgetstatusprojconsolidated from '../../forms/Purchaseflow/Budgetstatusprojconsolidated';
import { AiOutlineEye } from 'react-icons/ai';

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

const BudgetProjwiseconsSelectioncriteria: React.FC = () => {
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

  const handleView = () => {
    const params: ReportParams = {
      fromDate: fromDate?.format('YYYY-MM-DD') || '',

      toDate: toDate?.format('YYYY-MM-DD') || '',

      projectCode: selectedProjectCode || '',

      requestStatus: requestStatusValue,

      prType: prTypeValue,

      serviceRmFlag,

      reportType
    };

    setReportParams(params);

    setShowReport(true);
  };

  const handleToggleDates = () => {
    setDisableDates((prev) => !prev);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" flexDirection="column" gap={2} p={2}>
        {/* Date Pickers with light background color */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="#e7f5ff"
          p={1} // Optional padding for spacing
          borderRadius={1} // Optional rounded corners
          width="50%" // Ensure it takes full width
        >
          <Box display="flex" gap={2}>
            <DesktopDatePicker label="Request Date From" value={fromDate} onChange={setFromDate} disabled={disableDates} />

            <DesktopDatePicker label="Request Date To" value={toDate} onChange={setToDate} disabled={disableDates} />

            <Switch checked={disableDates} onChange={handleToggleDates} color="primary" />
          </Box>
        </Box>

        {/* Fields with equal sizes */}

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
            onChange={(_, value) => {
              if (value === 'Select All') {
                setRequestStatus(['In Progress', 'Approved', 'PO Generated']);
              } else {
                setRequestStatus(value || '');
              }
            }}
            renderInput={(params) => <TextField {...params} label="Request Status" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Select All', 'Non Chargeable', 'Charge to Customer']}
            value={Array.isArray(prType) ? prType[0] : prType} // Display the first item if it's an array
            onChange={(_, value) => {
              if (value === 'Select All') {
                setPrType(['Non Chargeable', 'Charge to Customer']);
              } else {
                setPrType(value || '');
              }
            }}
            renderInput={(params) => <TextField {...params} label="Type of PR" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Select All', 'Service', 'RM']} // Add options here
            value={serviceRmFlag}
            onChange={(_, value) => setServiceRmFlag(value || '')}
            renderInput={(params) => <TextField {...params} label="SERVICE/RM Flag" variant="outlined" fullWidth />}
          />

          <Autocomplete
            options={['Summary', 'Detailed']} // Add options here
            value={reportType}
            onChange={(_, value) => setReportType(value as 'Summary' | 'Detailed')}
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

        {showReport && reportParams && <Budgetstatusprojconsolidated reportParams={reportParams} onClose={() => setShowReport(false)} />}
      </Box>
    </LocalizationProvider>
  );
};

export default BudgetProjwiseconsSelectioncriteria;
