import { useEffect, useState } from 'react';

// material-ui
import { Grid, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart, { Props as ChartProps } from 'react-apexcharts';

// project import

import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
// types
import { ThemeMode } from 'types/config';
import { TJobListingDashboard } from 'types/dashboard/dashboard.types';

// chart options
const areaChartOptions = {
  chart: {
    width: 350,
    type: 'donut',
    stacked: false,
    zoom: {
      enabled: false
    }
  },
  plotOptions: {
    donut: {
      size: '15%'
    }
  },
  stroke: {
    width: 0
  },
  dataLabels: {
    enabled: false
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        }
      }
    }
  ],
  legend: {
    show: false
  }
};

// ==============================|| INVOICE - PIE CHART ||============================== //

const InvoicePieChart = ({ jobListingData }: { jobListingData: TJobListingDashboard }) => {
  const theme = useTheme();
  const { mode } = useConfig();

  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState<ChartProps>(areaChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      labels: ['Confirm', 'Pending to Confirm', 'Cancelled'],
      colors: ['#2E7D32', '#F9A825', '#C62828'], // Professional colors: green, amber, red
      tooltip: {
        custom: function ({ series, seriesIndex, w }: any) {
          return `<div class="pie_box">
          <span class="PieDot" style='background-color:${w.globals.colors[seriesIndex]}'></span>
          <span class="fontsize">${w.globals.labels[seriesIndex]}${' '}
          <span class="fontsizeValue">${series[seriesIndex]}%</span></span></div>`;
        }
      },
      theme: {
        mode: mode === ThemeMode.DARK ? 'dark' : 'light'
      }
    }));
  }, [mode, primary, secondary, line, theme]);

  const [series, setSeries] = useState<ApexAxisChartSeries | ApexNonAxisChartSeries | undefined>([0, 0, 0]);

  useEffect(() => {
    setSeries([jobListingData?.confirm ?? 0, jobListingData?.pending ?? 0, jobListingData?.cancelled ?? 0]);
    // eslint-disable-next-line prettier/prettier, react-hooks/exhaustive-deps
  }, [jobListingData]);

  //sx style

  return (
    <Grid
      container
      className="w-full"
      alignItems="center"
      spacing={1}
      component={MainCard}
      title={
        <Typography variant="h6" align="center" sx={{ mb: 1 }}>
          Job Status
        </Typography>
      } // Adjusted title placement
      sx={{
        '.pie_box': { padding: 2, display: 'flex', gap: 1, alignItems: 'center', width: '100%' },
        '.PieDot': { width: 12, height: 12, borderRadius: '50%' },
        '.fontsize': { fontWeight: 500, fontSize: '0.875rem', lineHeight: '1.375rem', color: theme.palette.secondary.main },
        '.fontsizeValue': { color: theme.palette.secondary.dark },
        mt: 0.5 // Reduced top margin
      }}
      minHeight={300}
      minWidth={340}
    >
      <Grid item xs={12} sx={{ '& .apexcharts-canvas': { margin: '0 auto' } }}>
        <ReactApexChart offsetY={0} options={options} series={series} type="donut" height={downMD ? '100%' : 265} />
      </Grid>

      {/* Footer with color legend */}
      <Grid item xs={12} sx={{ mt: 1 }}>
        {' '}
        {/* Reduced margin above footer */}
        <Typography variant="body2" align="center" color="textSecondary">
          <span style={{ color: theme.palette.success.main }}>● Confirm</span> |{' '}
          <span style={{ color: theme.palette.warning.main }}>● Pending to Confirm</span> |{' '}
          <span style={{ color: theme.palette.error.main }}>● Cancelled</span>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default InvoicePieChart;
