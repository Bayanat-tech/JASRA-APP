import { Grid, Tabs, Tab, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import SMSDashboardService from 'service/SMS/SMSDashboardService';
import PipelineSummaryChart from './components/PipelineSummaryChart';
import SalesPerformanceTable from '../../components/SalesPerformanceTable';
import DealProbabilityChart from './components/DealProbabilityChart';
import MonthlyForecastChart from '../../components/MonthlyForecastChart';
import NextActionsWidget from './components/NextActionsWidget';
import SegmentPerformanceChart from './components/SegmentPerformanceChart';
import { PipelineData } from 'types/dashboard.types';

const SMSDashboard = () => {
  const { user } = useAuth();
  const selectedSalesPerson = user?.loginid || '';
  const [activeTab, setActiveTab] = useState(0);

  // Use the actual return type from your service
  const { data: pipelineData } = useQuery({
    queryKey: ['pipelineSummary', selectedSalesPerson],
    queryFn: () => SMSDashboardService.getPipelineSummary(selectedSalesPerson),
    enabled: !!selectedSalesPerson
  });

  const { data: salesData } = useQuery({
    queryKey: ['salesPerformance', selectedSalesPerson],
    queryFn: () => SMSDashboardService.getSalesPerformance(selectedSalesPerson),
    enabled: !!selectedSalesPerson
  });

  const { data: probabilityData } = useQuery({
    queryKey: ['dealProbability', selectedSalesPerson],
    queryFn: () => SMSDashboardService.getDealProbability(selectedSalesPerson),
    enabled: !!selectedSalesPerson
  });

  const { data: forecastData } = useQuery({
    queryKey: ['monthlyForecast', selectedSalesPerson],
    queryFn: () => SMSDashboardService.getMonthlyForecast(selectedSalesPerson),
    enabled: !!selectedSalesPerson
  });

  const { data: actionsData } = useQuery({
    queryKey: ['nextActions', selectedSalesPerson],
    queryFn: () => SMSDashboardService.getNextActions(selectedSalesPerson),
    enabled: !!selectedSalesPerson
  });

  const { data: segmentData } = useQuery({
    queryKey: ['segmentPerformance', selectedSalesPerson],
    queryFn: () => SMSDashboardService.getSegmentPerformance(selectedSalesPerson),
    enabled: !!selectedSalesPerson
  });

  //mapping
  const mappedPipelineData: PipelineData[] = Array.isArray(pipelineData?.data)
    ? pipelineData!.data.map((row: any) => ({
        status: row.deal_status,
        value: Number(row.weighted_forecast)
      }))
    : [];

  const mappedSalesData = (salesData?.data ?? []).map((row: any) => ({
    sales_name: row.sales_name,
    target: row.total_deals,
    achievement: row.won_deals,
    pipeline: row.total_forecast_value,
    performance: row.avg_deal_size
  }));

  const mappedDealProb = (probabilityData?.data ?? []).map((row: any) => ({
    probability: row.deal_probability,
    count: row.total_deals
  }));

  const mappedForecastData = (forecastData?.data ?? []).map((row: any) => ({
    month: row.closing_month,
    forecast: row.monthly_forecast,
    actual: row.deal_count
  }));

  const mappedNextAction = (actionsData?.data ?? []).map((row: any) => ({
    action: row.next_action,
    company: row.companies,
    due_date: row.next_closing_date
  }));

const segmentMap = new Map<string, { won: number; total: number }>(); 
(segmentData?.data ?? []).forEach((row: any) => { 
  const seg = row.segment; if (!segmentMap.has(seg)) {
     segmentMap.set(seg, { won: 0, total: 0 }); 
    } 
    const current = segmentMap.get(seg)!; 
    current.won += row.won_deals; 
    current.total += row.total_deals; 
  }); 

  const mappedSegmentData = (segmentData?.data ?? []).map((row: any) => ({
    segment: row.segment,
    performance: row.total_deals > 0
        ?(row.won_deals / row.total_deals) * 100 :0
    }));
console.log("Mapped Segment Data:", mappedSegmentData);


  // --- Calculations ---
  const totalDeals = mappedSalesData.reduce((sum: any, s: { target: any }) => sum + s.target, 0);
  const wonDeals = mappedSalesData.reduce((sum: any, s: { achievement: any }) => sum + s.achievement, 0);
  const avgDealSize =
    mappedSalesData.length > 0
      ? mappedSalesData.reduce((sum: any, s: { performance: any }) => sum + s.performance, 0) / mappedSalesData.length
      : 0;
  const pipelineValue = mappedPipelineData.reduce((sum, p) => sum + p.value, 0);
  const wonDealPercent = totalDeals ? (wonDeals / totalDeals) * 100 : 0;

  const kpis = [
    { label: 'Total Deals', value: totalDeals },
    { label: 'Won Deals %', value: wonDealPercent.toFixed(1) },
    { label: 'Pipeline Value', value: pipelineValue },
    { label: 'Avg Deal Size', value: avgDealSize.toFixed(1) }
  ];

  return (
    <Box sx={{ p: 2 }}>
      {/* ---------- Tabs ------------- */}
      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} centered indicatorColor="primary" textColor="primary">
        <Tab label="Overview" />
        <Tab label="Sales & Forecast" />
        <Tab label="Segments & Actions" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {/* ------------ Overview Tab --------- */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={3} mb={3}>
              {kpis.map((kpi) => (
                <Grid item xs={12} md={3} key={kpi.label}>
                  <MainCard>
                    <Typography variant="subtitle2" color="textSecondary">
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4">{kpi.value}</Typography>
                  </MainCard>
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MainCard title="Pipeline Summary">
                  <PipelineSummaryChart data={mappedPipelineData} />
                </MainCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <MainCard title="Deal Probability">
                  <DealProbabilityChart data={mappedDealProb} />
                </MainCard>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ---------Sales & Forecast Tab --------- */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MainCard title="Sales Performance">
                <SalesPerformanceTable data={mappedSalesData} />
              </MainCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <MainCard title="Monthly Forecast">
                <MonthlyForecastChart data={mappedForecastData} />
              </MainCard>
            </Grid>
          </Grid>
        )}

        {/* -----------Segments & Actions Tab --------------- */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MainCard title="Segment Performance">
                <SegmentPerformanceChart data={mappedSegmentData} />
              </MainCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <MainCard title="Next Actions">
                <NextActionsWidget data={mappedNextAction} />
              </MainCard>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SMSDashboard;
