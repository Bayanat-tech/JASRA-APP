import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import useAuth from 'hooks/useAuth';
import PfSerivceInstance from 'service/service.purhaseflow';

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

// Set the default locale for the date adapter
ChartJS.defaults.locale = enUS.code || 'en-US';

// Helper function to format title
// const formatTitle = (title: string) => {
//   return title
//     .split('_')
//     .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
//     .join(' ');
// };

// Add this helper function before the component
const calculateTotalBudget = (costCentreData: Array<{ BUDGETED_AMT: string }>) => {
  return costCentreData.reduce((total, item) => total + parseFloat(item.BUDGETED_AMT || '0'), 0);
};

const calculateUnutilizedBudget = (totalBudget: number, poValue: string) => {
  return totalBudget - parseFloat(poValue || '0');
};

const rotate360 = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

// interface DashboardBasicData {
//   PR_COUNT: number;
//   PR_PENDING: number;
//   PR_REJECTED: number;
//   PR_CANCEL: number;
//   PR_APPROVED: number;
//   PO_PENDING_COUNT: number;
//   PO_COUNT: number;
//   PO_VALUE: string;
// }

// interface DashboardData {
//   Dashboardbasicdata: DashboardBasicData | null;
//   VW_DB_PO_DIV_COUNTdata: Array<{ DIV_NAME: string; DIV_CODE: number }>;
//   PO_COST_CENTREdata: Array<{ COST_NAME: string; BUDGETED_AMT: string; PO_COST_CENTRE: string }>;
//   VW_DB_POSERVICE_TYPEdata: Array<{ TYPE_OF_PR: string; SERVICE_TYPE_COUNT: number }>;
//   VW_MONTHWISE_POdata: Array<any>;
//   VW_DB_PR_DIV_COUNTdata: Array<{ DIV_NAME: string; PR_DIV_COUNT: number }>;
//   VW_DB_PRSERVICE_TYPEdata: Array<{ TYPE_OF_PR: string; SERVICE_TYPE_COUNT: number }>;
//   PR_SERVICE_RMdata: Array<{ SERVICE_RM_FLAG: string; SERVICE_RM_FLAG_COUNT: number }>;
//   PO_STATUS_COUNTdata: Array<{ STATUS: string | null; PO_STATUS: number }>;
//   PO_SERVICE_RMdata: Array<{ SERVICE_RM_FLAG: string; SERVICE_RM_FLAG_COUNT: number }>;
// }

const CostControllerDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, error, isLoading } = useQuery({
    queryKey: ['dashboard-data', user?.username],
    queryFn: () =>
      PfSerivceInstance.getDashboardData({
        level: 2,
        user: user?.username || '',
        from_date: '2025-01-01',
        to_date: '2025-12-31'
      }),
    enabled: !!user?.username
  });

  useEffect(() => {
    if (user?.username) {
      // Remove the manual fetch call since useQuery handles it
      console.log('Unmount job page');
    }
  }, [user]);

  const renderPieChart = (data: any[], labelKey: string, valueKey: string, title: string) => {
    const isCostCenter = valueKey === 'BUDGETED_AMT';

    // Preprocess data to include all values
    const processedData = data.map((item) => ({
      label: item[labelKey],
      value: isCostCenter ? parseFloat(String(item[valueKey]).replace(/[^0-9.-]+/g, '')) || 0 : Number(item[valueKey]) || 0
    }));

    const total = processedData.reduce((sum, item) => sum + item.value, 0);

    // Calculate percentages and format labels for all values
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
      labels: formattedData.map((item) => item.label), // Remove values from labels
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
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: '175px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          sx={{
            color: '#0d47a1',
            fontWeight: 600
          }}
          variant="h6"
          align="center"
          gutterBottom
        >
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
                    boxWidth: 8, // Reduced from 10
                    padding: 8, // Reduced from 10
                    font: {
                      size: 9 // Reduced from 11
                    },
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
                  font: {
                    weight: 'bold',
                    size: 10
                  },
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

    // Process the VW_MONTHWISE_POdata
    const poData = new Array(12).fill(0); // Initialize array with zeros

    dashboardData?.VW_MONTHWISE_POdata.forEach((item:any) => {
      const monthIndex = parseInt(item.PO_MONTH) - 1; // Convert month to 0-based index
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
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: '275px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          sx={{
            color: '#1976d2',
            fontWeight: 600
          }}
          variant="h6"
          align="center"
          gutterBottom
        >
          PO Amount by Month
        </Typography>
        <div style={{ flex: 1, position: 'relative' }}>
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `Amount: $${context.raw}`;
                    }
                  }
                },
                datalabels: {
                  display: true,
                  anchor: 'center',
                  align: 'center',
                  formatter: (value) => {
                    return value > 0
                      ? `$${new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          maximumFractionDigits: 1
                        }).format(value)}`
                      : '';
                  },
                  font: {
                    weight: 'bold',
                    size: 11
                  },
                  color: '#333'
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
    if (!dashboardData?.PO_COST_CENTREdata) return null;

    // Filter out items where both budget and PO amounts are zero
    const filteredData = dashboardData.PO_COST_CENTREdata.filter(
      (item:any) => parseFloat(item.BUDGETED_AMT) > 0 || parseFloat(item.PO_COST_CENTRE) > 0
    );

    // Sort data by budgeted amount in descending order
    const sortedData = [...filteredData].sort((a, b) => parseFloat(b.BUDGETED_AMT) - parseFloat(a.BUDGETED_AMT));

    // Take only top 5 cost centers
    const topData = sortedData.slice(0, 5);

    const data = {
      labels: topData.map((item) => item.COST_NAME),
      datasets: [
        {
          label: 'Budgeted Amount',
          data: topData.map((item) => parseFloat(item.BUDGETED_AMT)),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
          categoryPercentage: 0.4
        },
        {
          label: 'PO Amount',
          data: topData.map((item) => parseFloat(item.PO_COST_CENTRE)),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
          // Removed invalid property
          categoryPercentage: 0.4
        }
      ]
    };

    // Find the maximum value for scale
    const maxValue = Math.max(...topData.map((item) => Math.max(parseFloat(item.BUDGETED_AMT), parseFloat(item.PO_COST_CENTRE))));

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: '175px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography
          sx={{
            color: '#0d47a1',
            fontWeight: 600
          }}
          variant="h6"
          align="center"
          gutterBottom
        >
          Budget vs PO by Cost Center
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
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: { size: 10 }
                  }
                },
                datalabels: {
                  display: true,
                  align: 'end',
                  anchor: 'end',
                  offset: 4,
                  color: '#333',
                  font: {
                    size: 10,
                    weight: 'bold'
                  },
                  formatter: (value: number) => {
                    return `$${new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                      maximumFractionDigits: 1
                    }).format(value)}`;
                  }
                }
              },
              scales: {
                x: {
                  stacked: false,
                  beginAtZero: true,
                  max: maxValue * 1.3,
                  ticks: {
                    maxTicksLimit: 5,
                    callback: (value: any) => {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(value);
                    }
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    font: { size: 10 },
                    callback: (label: any) => {
                      return label.length > 15 ? label.substr(0, 15) + '...' : label;
                    }
                  }
                }
              }
              // barPercentage: 0.8,
              // categoryPercentage: 0.8
            }}
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

      {/* Basic Data Cards */}
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
            pt: 0, // Add padding-top: 0
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
            const totalBudget = calculateTotalBudget(dashboardData.PO_COST_CENTREdata);
            const unutilizedBudget = calculateUnutilizedBudget(totalBudget, dashboardData.Dashboardbasicdata.PO_VALUE);

            const cardData = [
              { key: 'PR Count', value: dashboardData.Dashboardbasicdata.PR_COUNT },
              { key: 'Rejected PR', value: dashboardData.Dashboardbasicdata.PR_REJECTED },
              { key: 'Cancelled PR', value: dashboardData.Dashboardbasicdata.PR_CANCEL },
              { key: 'PO Count', value: dashboardData.Dashboardbasicdata.PO_COUNT },
              {
                key: 'PO Value',
                value: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 0
                }).format(parseFloat(dashboardData.Dashboardbasicdata.PO_VALUE))
              },
              {
                key: 'Total Budget',
                value: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 0
                }).format(totalBudget)
              },
              {
                key: 'Unutilized Budget',
                value: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 0
                }).format(unutilizedBudget)
              }
            ];

            // Double the cards array for seamless loop
            const duplicatedCards = [...cardData, ...cardData];

            return (
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  animation: `${rotate360} 30s linear infinite`,
                  '&:hover': {
                    animationPlayState: 'paused'
                  },
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
                      width: '250px', // Increased width to accommodate row layout
                      minWidth: '250px',
                      display: 'flex',
                      flexDirection: 'row', // Changed to row
                      justifyContent: 'space-between', // Space between label and value
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
                        maxWidth: '50%' // Limit text width
                      }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        color: 'primary.main'
                      }}
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

      {/* Charts Row */}
      {dashboardData && (
      <Grid container item xs={12} spacing={2} sx={{ pt: 0 }}> {/* Added sx prop to remove top padding */}
          {/* First Row - 3 Charts */}
          <Grid item xs={12} md={4} sx={{ pt: 0 }}>
            {renderPieChart(dashboardData.VW_DB_PR_DIV_COUNTdata, 'DIV_NAME', 'PR_DIV_COUNT', 'PR BY DIVISION')}
          </Grid>
          <Grid item xs={12} md={4} sx={{ pt: 0 }}>
            {renderColumnChart()}
          </Grid>
          <Grid item xs={12} md={4} sx={{ pt: 0 }}>
            {renderPieChart(
              dashboardData.PO_STATUS_COUNTdata.map((item:any) => ({
                ...item,
                STATUS: item.STATUS || 'Pending' // Replace null with 'Pending'
              })),
              'STATUS',
              'PO_STATUS',
              'PO BY STATUS'
            )}
          </Grid>

          {/* Second Row - Graph and 2 Charts */}
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
              <Typography
                variant="h6"
                align="center"
                gutterBottom
                sx={{
                  color: '#1976d2',
                  fontWeight: 600
                }}
              >
                PO by Service Type
              </Typography>
              <div style={{ flex: 1, position: 'relative' }}>
                <Pie
                  height={150}
                  data={{
                    labels: dashboardData?.PO_SERVICE_RMdata.map((item:any) => item.SERVICE_RM_FLAG) || [],
                    datasets: [
                      {
                        data: dashboardData?.PO_SERVICE_RMdata.map((item:any) => item.SERVICE_RM_FLAG_COUNT) || [],
                        backgroundColor: ['#3f51b5', '#9c27b0'], // Different colors for RM and Service
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
                        labels: {
                          boxWidth: 10,
                          padding: 10,
                          font: { size: 11 }
                        }
                      },
                      datalabels: {
                        display: true,
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 12
                        },
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
              <Typography
                variant="h6"
                align="center"
                gutterBottom
                sx={{
                  color: '#0d47a1',
                  fontWeight: 600
                }}
              >
                PO by Request Type
              </Typography>
              <div style={{ flex: 1, position: 'relative' }}>
                <Pie
                  height={150}
                  data={{
                    labels: dashboardData?.VW_DB_PRSERVICE_TYPEdata.map((item:any) => item.TYPE_OF_PR) || [],
                    datasets: [
                      {
                        data: dashboardData?.VW_DB_PRSERVICE_TYPEdata.map((item:any) => item.SERVICE_TYPE_COUNT) || [],
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
                        labels: {
                          boxWidth: 10,
                          padding: 10,
                          font: {
                            size: 11
                          }
                        }
                      },
                      datalabels: {
                        display: true,
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 12
                        },
                        formatter: (value: number) => {
                          return value.toString();
                        }
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

export default CostControllerDashboard;
export { CostControllerDashboard };
