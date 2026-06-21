import { CloseOutlined } from '@ant-design/icons';
import { Autocomplete, Grid, MenuItem, Paper, Select, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import IncomeAreaChart from 'components/dashboard/IncomeAreacChart';
import InvoicePieChart from 'components/dashboard/InvoicePieChart';
import MainCard from 'components/MainCard';
import dayjs, { Dayjs } from 'dayjs';
import { TPrincipalWms, TPrinGroupData } from 'pages/WMS/types/principal-wms.types';
import { TSite } from 'pages/WMS/types/site-wms.types';
import { useEffect, useMemo, useState } from 'react';
import WmsSerivceInstance from 'service/service.wms';
import { TFilterDataDashboard, TJobListingDashboard, TwarehouseUtilization } from 'types/dashboard/dashboard.types';
import { formateAmount } from 'utils/functions';

const WmsDashboard = () => {
  // State to manage principal group data
  const [prinGroupData, setPrinGroupData] = useState<TPrinGroupData[]>();

  // State to toggle custom date selection
  const [customDate, setCustomeDate] = useState(false);

  // State to track invoice-related metrics
  const [invoiceData, setInvoiceData] = useState<{
    inbound: number;
    outbound: number;
    return: number;
  }>();

  // Initial filter configuration for dashboard data
  const [filterData, setFilterData] = useState<TFilterDataDashboard>({
    // time: 'current-week', // Default time filter
    time: 'current-year',
    from_date: null as unknown as Date,
    to_date: null as unknown as Date,
    site_code: ['all'], // Default to all sites
    prin_code: '',
    prin_group_code: ''
  });

  // Fetch site data using React Query
  const { data: siteData } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'site');
      if (response) {
        return {
          tableData: response.tableData as TSite[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch principal data using React Query
  const { data: principalData } = useQuery({
    queryKey: ['principal_code'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'principal');
      if (response) {
        return {
          tableData: response.tableData as TPrincipalWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch graph data based on filter criteria using React Query
  const { data: graphData } = useQuery({
    queryKey: ['warehouseGrpah', filterData.time, filterData.to_date, filterData.site_code, filterData.from_date],
    queryFn: async () => {
      let tempFilter = { ...filterData };

      // Pass all site codes only in the default case when site_code is empty or contains 'all'
      if (tempFilter.site_code.length === 0 || tempFilter.site_code.includes('all')) {
        tempFilter.site_code = siteData?.tableData.map((site) => site.site_code) ?? [];
      }

      return await WmsSerivceInstance.getWmsGraph(tempFilter);
    },
    enabled: !!siteData && siteData.tableData.length > 0 && (customDate ? !!filterData.from_date && !!filterData.to_date : true) // Enable query only when siteData is available and valid
  });

  // Fetch dashboard data based on filter criteria using React Query
  const { data: dashboardData } = useQuery({
    queryKey: [
      'warehouseData',
      filterData.time,
      filterData.to_date,
      filterData.site_code,
      filterData.from_date,
      filterData.prin_code,
      filterData.prin_group_code
    ],
    queryFn: async () => await WmsSerivceInstance.getWmsData(filterData),
    enabled: customDate === true ? !!filterData.from_date && !!filterData.to_date : true // Enable query based on custom date selection
  });

  // Memoize the chart component to avoid unnecessary re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chartGraph = useMemo(() => <IncomeAreaChart series={graphData as TwarehouseUtilization} slot={filterData.time} />, [graphData]);

  // Handler to reset custom date selection
  const handleCustomDate = () => {
    setCustomeDate(false);
    setFilterData((prev: any) => ({ ...prev, from_date: null }));
    setFilterData((prev: any) => ({ ...prev, to_date: null }));
    setFilterData((prev: any) => ({ ...prev, time: 'current-week' }));
  };

  // Effect to set principal group data based on fetched principal data
  useEffect(() => {
    if (principalData?.tableData) {
      const tempData: { [key: string]: { label: string; value: string } } = {};
      principalData.tableData.forEach((item) => {
        if (item.prin_group) {
          tempData[item.prin_group] = { label: item.prin_groupName ?? '', value: item.prin_group };
        }
      });
      setPrinGroupData(Object.values(tempData));
    }
  }, [principalData]);

  // Effect to set invoice data based on fetched dashboard data
  useEffect(() => {
    if (!!dashboardData) {
      setInvoiceData((prev: any) => ({ ...prev, outbound: dashboardData?.outbound.total - dashboardData?.outbound.prevTotal }));
      setInvoiceData((prev: any) => ({ ...prev, inbound: dashboardData?.inbound.total - dashboardData?.inbound.prevTotal }));
      setInvoiceData((prev: any) => ({ ...prev, return: dashboardData?.return.total - dashboardData?.return.prevTotal }));
    }
  }, [dashboardData]);

  return (
    <div className="mt-4">
      {/* Main container for the dashboard */}
      <Grid component={Paper} padding={1} container rowSpacing={2} spacing={1}>
        {/* Container for the filter controls */}
        <Grid container item spacing={2} xs={12}>
          {/* Time Duration Filter */}
          <Grid item xs={12} sm={6} md={3} spacing={2}>
            <Select
              placeholder="Time Duration"
              size="small"
              fullWidth
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={filterData?.time}
              onChange={(e) => setFilterData((prev: any) => ({ ...prev, time: e.target.value }))}
            >
              <MenuItem value={'current-week'}>Current Week</MenuItem>
              <MenuItem value={'current-month'}>Current Month</MenuItem>
              <MenuItem value={'current-year'}>Current Year</MenuItem>
              <MenuItem value={'custom'} onClick={() => setCustomeDate(true)}>
                Custom Date
              </MenuItem>
            </Select>
            {customDate && (
              <div className="pt-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="flex justify-between gap-2">
                    {/* From Date Picker */}
                    <DatePicker
                      format="DD/MM/YYYY"
                      className="w-full min-w-28"
                      value={dayjs(filterData?.from_date)}
                      onChange={(newValue: Dayjs | null) => {
                        if (newValue?.isValid()) setFilterData((prev: any) => ({ ...prev, from_date: newValue.toISOString() as string }));
                      }}
                    />
                    {/* To Date Picker */}
                    <DatePicker
                      minDate={dayjs(filterData.from_date)}
                      format="DD/MM/YYYY"
                      className="w-full min-w-28"
                      value={dayjs(filterData?.to_date)}
                      onChange={(newValue: Dayjs | null) => {
                        if (newValue?.isValid()) setFilterData((prev: any) => ({ ...prev, to_date: newValue.toISOString() as string }));
                      }}
                    />
                    {/* Close button to reset custom date */}
                    <CloseOutlined className="cursor-pointer" onClick={handleCustomDate} />
                  </div>
                </LocalizationProvider>
              </div>
            )}
          </Grid>
          {/* Site Filter */}
          <Grid item xs={12} sm={6} md={3} spacing={2}>
            <Autocomplete
              multiple
              id="ac_code"
              filterSelectedOptions
              onChange={(event, value: TSite[] | null) => {
                setFilterData((prev: any) => ({ ...prev, site_code: value?.map((each) => each.site_code) }));
              }}
              defaultValue={[{ site_code: 'all', site_name: 'All' }]}
              size="small"
              options={
                siteData?.tableData
                  ? !filterData.site_code.includes('all')
                    ? [{ site_code: 'all', site_name: 'All' } as any, ...siteData?.tableData]
                    : siteData.tableData
                  : []
              }
              fullWidth
              getOptionLabel={(option) => option?.site_name}
              renderInput={(params) => (
                <TextField
                  placeholder="Select Sites"
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
          </Grid>
          {/* Principal Filter */}
          <Grid item xs={12} sm={6} md={3} spacing={2}>
            <Autocomplete
              id="prin_code"
              value={
                !!filterData?.prin_code
                  ? principalData?.tableData.find((eachPrincipal) => eachPrincipal.prin_code === filterData.prin_code)
                  : ({ prin_name: '' } as TPrincipalWms)
              }
              onChange={(event, value: TPrincipalWms | null) => {
                setFilterData((prev: any) => ({ ...prev, prin_code: value?.prin_code }));
              }}
              size="small"
              options={principalData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.prin_name}
              renderInput={(params) => (
                <TextField
                  placeholder="Select Principal"
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
          </Grid>
          {/* Principal Group Filter */}
          <Grid item xs={12} sm={6} md={3} spacing={2}>
            <Autocomplete
              id="prin_group"
              value={
                !!filterData?.prin_group_code
                  ? prinGroupData?.find((eachPrinGroup) => eachPrinGroup.value === filterData.prin_group_code)
                  : ({ label: '' } as TPrinGroupData)
              }
              onChange={(event, value: TPrinGroupData | null) => {
                setFilterData((prev: any) => ({ ...prev, prin_group_code: value?.value }));
              }}
              size="small"
              options={prinGroupData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.label}
              renderInput={(params) => (
                <TextField
                  placeholder="Select Principal Group"
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
        {/* Container for the analytic cards */}
        <Grid item container spacing={3} xs={12}>
          {/* Total Outbound Card */}
          <Grid item xs={12} sm={4}>
            <AnalyticEcommerce
              isLoss={!!invoiceData?.outbound && invoiceData.outbound < 0}
              orders={dashboardData?.outbound?.count ?? 0}
              title="Total Outbound"
              count={`${dashboardData?.outbound?.total ?? ''} CTN`}
              percentage={
                !!invoiceData?.outbound && dashboardData?.outbound.prevTotal
                  ? formateAmount((invoiceData.outbound * 100) / dashboardData?.outbound.prevTotal)
                  : null
              }
              extra={invoiceData?.outbound ?? 0}
              time={filterData?.time}
              color={!!invoiceData?.outbound && invoiceData.outbound < 0 ? 'error' : 'primary'}
            />
          </Grid>
          {/* Total Inbound Card */}
          <Grid item xs={12} sm={4}>
            <AnalyticEcommerce
              orders={dashboardData?.inbound?.count ?? 0}
              title="Total Inbound"
              count={`${dashboardData?.inbound?.total ?? ''} CTN`}
              percentage={
                !!invoiceData?.inbound && dashboardData?.inbound.prevTotal
                  ? formateAmount((invoiceData.inbound * 100) / dashboardData?.inbound.prevTotal)
                  : null
              }
              extra={invoiceData?.inbound ?? 0}
              time={filterData.time}
              isLoss={!!invoiceData?.inbound && invoiceData.inbound < 0}
              color={!!invoiceData?.inbound && invoiceData.inbound < 0 ? 'error' : 'primary'}
            />
          </Grid>
          {/* Returns Card */}
          <Grid item xs={12} sm={4}>
            <AnalyticEcommerce
              orders={dashboardData?.return?.count ?? 0}
              title="Returns"
              count={`${dashboardData?.return?.total ?? ''}`}
              percentage={
                !!invoiceData?.return && dashboardData?.return.prevTotal
                  ? formateAmount((invoiceData.return * 100) / dashboardData?.return.prevTotal)
                  : null
              }
              extra={invoiceData?.return ?? 0}
              isLoss={!!invoiceData?.return && invoiceData.return < 0}
              color={!!invoiceData?.return && invoiceData.return < 0 ? 'error' : 'primary'}
            />
          </Grid>
        </Grid>
        {/* Container for the charts */}
        <Grid item xs={12}>
          <Grid container spacing={2} xs={12} sm={12} md={12}>
            {/* Main Chart */}
            <Grid xs={12} sm={8.8} item>
              <MainCard>{chartGraph}</MainCard>
            </Grid>
            {/* Pie Chart */}
            <Grid xs={12} sm={3.2} item>
              <InvoicePieChart jobListingData={dashboardData?.jobListing as TJobListingDashboard} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default WmsDashboard;
