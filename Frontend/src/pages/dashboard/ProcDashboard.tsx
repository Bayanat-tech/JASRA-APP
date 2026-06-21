import { useQuery } from '@tanstack/react-query';
import PfSerivceInstance from 'service/service.purhaseflow';
import { Grid, Paper, Typography, CircularProgress, Box } from '@mui/material';
import { keyframes } from '@mui/system';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  BarElement
} from 'chart.js';
import { CandlestickElement } from 'chartjs-chart-financial';
import { Pie, Bar } from 'react-chartjs-2';
import 'chartjs-chart-financial';
import { enUS } from 'date-fns/locale';
import 'chartjs-adapter-date-fns';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CustomGauge } from 'components/charts/CustomGauge';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  CandlestickElement,
  TimeScale,
  BarElement,
  ChartDataLabels
);

ChartJS.defaults.locale = enUS.code || 'en-US';

const rotate360 = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

const ProcDashboard = () => {
  const {
    data: dashboardData,
    error,
    isLoading
  } = useQuery({
    queryKey: ['dashboard-data', 'USER_PROC'],
    queryFn: () =>
      PfSerivceInstance.getDashboardData({
        level: 3,
        user: 'USER_PROC',
        from_date: '2025-01-01',
        to_date: '2025-12-31'
      })
  });

  const renderPieChart = (data: any[], labelKey: string, valueKey: string, title: string) => {
    const isCostCenter = valueKey === 'BUDGETED_AMT';

    const processedData = data.map((item) => ({
      label: item[labelKey],
      value: isCostCenter
        ? parseFloat(String(item[valueKey]).replace(/[^0-9.-]+/g, '')) || 0
        : Number(item[valueKey]) || 0
    }));

    const total = processedData.reduce((sum, item) => sum + item.value, 0);

    const formattedData = processedData.map((item) => ({
      ...item,
      percentage: ((item.value / total) * 100).toFixed(2),
      formattedValue: isCostCenter
        ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
          minimumFractionDigits: 0
        }).format(item.value)
        : item.value.toString()
    }));

    const chartData = {
      labels: formattedData.map((item) => item.label),
      datasets: [
        {
          data: formattedData.map((item) => item.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '175px', display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#0d47a1', fontWeight: 600 }} variant="h6" align="center" gutterBottom>
          {title}
          {isCostCenter && (
            <Typography variant="caption" display="block">
              Total Budget:{' '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 2
              }).format(total)}
            </Typography>
          )}
        </Typography>
        <div style={{ flex: 1, position: 'relative' }}>
          <Pie
            height={100}
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context: any) {
                      const dataItem = formattedData[context.dataIndex];
                      return `${dataItem.label}: ${dataItem.formattedValue} (${dataItem.percentage}%)`;
                    }
                  }
                },
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 8,
                    padding: 8,
                    font: { size: 9 },
                    generateLabels: function (chart: any) {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label: any, i: any) => ({
                          text: label,
                          fillStyle: data.datasets[0].backgroundColor[i],
                          hidden: false,
                          lineCap: 'butt',
                          lineDash: [],
                          lineDashOffset: 0,
                          lineJoin: 'miter',
                          lineWidth: 1,
                          strokeStyle: data.datasets[0].backgroundColor[i],
                          pointStyle: 'circle',
                          rotation: 0,
                          datasetIndex: 0,
                          index: i
                        }));
                      }
                      return [];
                    }
                  }
                },
                datalabels: {
                  display: true,
                  color: '#fff',
                  font: { weight: 'bold', size: 10 },
                  formatter: (value: number, ctx: any) => {
                    const dataItem = formattedData[ctx.dataIndex];
                    return dataItem.formattedValue;
                  }
                }
              }
            }}
          />
        </div>
      </Paper>
    );
  };

  const renderBarChart = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const poData = new Array(12).fill(0);

    dashboardData?.VW_MONTHWISE_POdata?.forEach((item: any) => {
      const monthIndex = parseInt(item.PO_MONTH) - 1;
      poData[monthIndex] = parseFloat(item.PO_AMOUNT);
    });

    const data = {
      datasets: [
        {
          label: 'PO Amount',
          data: poData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ],
      labels: monthNames
    };

    return (
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '275px', display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#1976d2', fontWeight: 600 }} variant="h6" align="center" gutterBottom>
          PO Amount by Month
        </Typography>
        <div style={{ flex: 1, position: 'relative' }}>
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `Amount: $${context.raw}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return `$${value}`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </Paper>
    );
  };

  const renderColumnChart = () => {
    const data = {
      labels: ['Mechanical', 'Electrical', 'Office Equipment', 'Publications', 'Employee Benefits'],
      datasets: [
        {
          data: [12234567, 2668210, 1423910, 920182, 10000],
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };

    return (
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '175px', display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#0d47a1', fontWeight: 600 }} variant="h6" align="center" gutterBottom>
          PO by Suppliers
        </Typography>
        <div style={{ flex: 1, position: 'relative' }}>
          <Bar
            height={100}
            data={data}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'end',
                  align: 'right',
                  formatter: (value: number) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value),
                  font: { weight: 'bold' }
                }
              },
              scales: {
                x: {
                  ticks: {
                    callback: (value: any) =>
                      new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(value)
                  }
                }
              }
            }}
          />
        </div>
      </Paper>
    );
  };

  const renderGaugeChart = () => {
    if (!dashboardData?.PO_COST_CENTREdata) return null;

    const totalBudget = dashboardData.PO_COST_CENTREdata.reduce((sum: number, item: any) => {
      return sum + (Number(item.BUDGETED_AMT) || 0);
    }, 0);

    const totalPO = dashboardData.PO_COST_CENTREdata.reduce((sum: number, item: any) => {
      return sum + (Number(item.PO_COST_CENTRE) || 0);
    }, 0);

    const percentage = totalBudget > 0 ? Math.round((totalPO / totalBudget) * 100) : 0;

    return (
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '175px', display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#0d47a1', fontWeight: 600 }} variant="h6" align="center" gutterBottom>
          Budget vs PO
          <Typography variant="caption" display="block">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(totalPO)}{' '}
            /{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(totalBudget)}
          </Typography>
        </Typography>
        <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CustomGauge
            value={percentage}
            size={120}
            thickness={15}
            color={percentage > 90 ? '#f44336' : percentage > 70 ? '#ff9800' : '#1976d2'}
          />
        </div>
      </Paper>
    );
  };

  return (
    <Grid container spacing={2} padding={2}>
      {error && (
        <Grid item xs={12}>
          <Typography variant="h6" color="error">
            Error: {error.message}
          </Typography>
        </Grid>
      )}

      {isLoading ? (
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid
          container
          item
          xs={12}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            height: '120px',
            pt: 0,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              width: '100px',
              height: '100%',
              zIndex: 2
            },
            '&::before': {
              left: 0,
              background: 'linear-gradient(to right, white 0%, transparent 100%)'
            },
            '&::after': {
              right: 0,
              background: 'linear-gradient(to left, white 0%, transparent 100%)'
            }
          }}
        >
          {(() => {
            // ✅ Guard: only render cards if data is available
            if (!dashboardData?.Dashboardbasicdata?.[0]) return null;

            // ✅ Fixed: basicData is inside the component, after data is loaded
            const basicData = dashboardData.Dashboardbasicdata[0];

            // ✅ Fixed: cardData declared before duplicatedCards
            const cardData = [
              { key: 'PR Count', value: basicData.PR_COUNT },
              { key: 'Rejected PR', value: basicData.PR_REJECTED },
              { key: 'Cancelled PR', value: basicData.PR_CANCEL },
              { key: 'PO Count', value: basicData.PO_COUNT },
              {
                key: 'PO Value',
                value: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 0
                }).format(Number(basicData.PO_VALUE))
              },
              { key: 'Suppliers', value: basicData.SUPPLIER },
              { key: 'Cost Centers', value: basicData.COST_CENTERS }
            ];

            const duplicatedCards = [...cardData, ...cardData];

            return (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  animation: `${rotate360} 30s linear infinite`,
                  '&:hover': { animationPlayState: 'paused' },
                  width: 'fit-content',
                  padding: '10px'
                }}
              >
                {duplicatedCards.map(({ key, value }, index) => (
                  <Paper
                    key={`${key}-${index}`}
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: '75px',
                      width: '280px',
                      minWidth: '280px',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'text.secondary',
                        maxWidth: '50%'
                      }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ fontSize: '1.25rem', fontWeight: 500, color: 'primary.main' }}
                    >
                      {value}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            );
          })()}
        </Grid>
      )}

      {dashboardData && (
        <Grid container item xs={12} spacing={2} sx={{ pt: 0 }}>
          <Grid item xs={12} md={4} sx={{ pt: 0 }}>
            {renderPieChart(dashboardData.VW_DB_PR_DIV_COUNTdata, 'DIV_NAME', 'PR_DIV_COUNT', 'PR BY DIVISION')}
          </Grid>
          <Grid item xs={12} md={4} sx={{ pt: 0 }}>
            {renderColumnChart()}
          </Grid>
          <Grid item xs={12} md={4} sx={{ pt: 0 }}>
            {renderGaugeChart()}
          </Grid>

          <Grid item xs={12} md={6}>
            {renderBarChart()}
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                height: '275px',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="h6" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                PR by Service Type
              </Typography>
              <div style={{ flex: 1, position: 'relative' }}>
                <Pie
                  height={150}
                  data={{
                    labels: dashboardData?.PR_SERVICE_RMdata?.map((item: any) => item.SERVICE_RM_FLAG) || [],
                    datasets: [
                      {
                        data: dashboardData?.PR_SERVICE_RMdata?.map((item: any) => item.SERVICE_RM_FLAG_COUNT) || [],
                        backgroundColor: ['#3f51b5', '#9c27b0'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, padding: 10, font: { size: 11 } }
                      },
                      datalabels: {
                        display: true,
                        color: '#fff',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value: number, ctx: any) => {
                          const sum = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((value * 100) / sum).toFixed(0) + '%';
                          return `${value}\n(${percentage})`;
                        }
                      }
                    }
                  }}
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                height: '275px',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(to bottom right, #ffffff, #f0f7ff)',
                border: '1px solid #bbdefb'
              }}
            >
              <Typography variant="h6" align="center" gutterBottom sx={{ color: '#0d47a1', fontWeight: 600 }}>
                PR by Request Type
              </Typography>
              <div style={{ flex: 1, position: 'relative' }}>
                <Pie
                  height={150}
                  data={{
                    labels: dashboardData?.VW_DB_PRSERVICE_TYPEdata?.map((item: any) => item.TYPE_OF_PR) || [],
                    datasets: [
                      {
                        data:
                          dashboardData?.VW_DB_PRSERVICE_TYPEdata?.map((item: any) => item.SERVICE_TYPE_COUNT) || [],
                        backgroundColor: [
                          'rgba(25, 118, 210, 0.8)',
                          'rgba(13, 71, 161, 0.8)',
                          'rgba(21, 101, 192, 0.8)',
                          'rgba(100, 149, 237, 0.8)',
                          'rgba(0, 191, 255, 0.8)',
                          'rgba(30, 144, 255, 0.8)'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { boxWidth: 10, padding: 10, font: { size: 11 } }
                      },
                      datalabels: {
                        display: true,
                        color: '#fff',
                        font: { weight: 'bold', size: 12 },
                        formatter: (value: number) => value.toString()
                      }
                    }
                  }}
                />
              </div>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ProcDashboard;