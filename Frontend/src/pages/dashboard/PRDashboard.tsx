import { useQuery } from '@tanstack/react-query';
import { Grid, Paper, Typography, CircularProgress } from '@mui/material';
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
// import ProcDashboard from './ProcDashboard';
// import { CostControllerDashboard } from './CostControllerDashboard';
import PfSerivceInstance from '../../service/service.purhaseflow';

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
    ChartDataLabels // Add this line
);

// Set the default locale for the date adapter
ChartJS.defaults.locale = enUS.code || 'en-US';

// Helper function to format title
const formatTitle = (title: string) => {
    return title
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
};

const WmsDashboard = () => {
    const { user } = useAuth();

    const isAllowedUser = (username: string) => {
        const allowedExactUsers = ['USER_PM', 'TEST_PM', 'USER_PROC', 'TEST_PROC', 'USER_PROC1'];
        const procRegex = /^USER_PROC\d*$/;
        return allowedExactUsers.includes(username) || procRegex.test(username);
    };

    const {
        data: dashboardData,
        error,
        isLoading
    } = useQuery({
        queryKey: ['dashboard-data', user?.username],
        queryFn: () =>
            PfSerivceInstance.getDashboardData({
                level: 1,
                user: user?.username === 'USER_PM' ? 'USER_PROC' : user?.username || '',
                from_date: '2026-01-01',
                to_date: '2026-12-31'
            }),
        enabled: !!user?.username && isAllowedUser(user.username ?? '')
    });

    const renderPieChart = (data: any[], labelKey: string, valueKey: string, title: string) => {
        const isCostCenter = valueKey === 'BUDGETED_AMT';

        // Preprocess data to include all values
        const processedData = data.map((item) => ({
            label: item[labelKey],
            value: isCostCenter ? parseFloat(String(item[valueKey]).replace(/[^0-9.-]+/g, '')) || 0 : Number(item[valueKey]) || 0
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
                                        boxWidth: 10,
                                        padding: 10,
                                        font: {
                                            size: 11
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

        dashboardData?.VW_MONTHWISE_POdata.forEach((item: any) => {
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

    if (!user?.username || isLoading) {
        if (isAllowedUser(user?.username ?? '')) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '100px'
                    }}
                >
                    <Paper
                        elevation={4}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: '#fff'
                        }}
                    >
                        <CircularProgress />
                        <Typography variant="h6" sx={{ mt: 2, color: '#23272b' }}>
                            Please wait while we prepare your dashboard.
                        </Typography>
                    </Paper>
                </div>
            );
        } else {
            return <div></div>;
        }
    }

    // Simplified check for PROC users and PM
    const isProcUser = /^USER_PROC\d*$/.test(user.username) || user.username === 'USER_PM';

    if (isProcUser) {
        return (
            <Grid container spacing={2} padding={2}>
                {error && (
                    <Grid item xs={12}>
                        <Typography variant="h6" color="error">
                            Error: {error.message}
                        </Typography>
                    </Grid>
                )}

                {/* Basic Data Cardsss */}
                {!dashboardData?.Dashboardbasicdata ? (
                    <Grid item xs={12}>
                        <Typography variant="h6">Loading dashboard data...</Typography>
                    </Grid>
                ) : (
                    <Grid container item xs={12} spacing={2} marginBottom={2}>
                        {Object.entries(dashboardData.Dashboardbasicdata)
                            .filter(([key]) =>
                                [
                                    'PR_COUNT',
                                    'PR_PENDING',
                                    'PR_REJECTED',
                                    'PR_CANCEL',
                                    'PR_APPROVED',
                                    'PO_PENDING_COUNT'
                                    // 'PO_COUNT'
                                ].includes(key)
                            )
                            .map(([key, value]) => (
                                <Grid item xs={6} sm={4} md={3} lg={2} key={key}>
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            minHeight: '25px',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: '#ffffff',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            component="div"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            {formatTitle(key)}
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            component="div"
                                            sx={{
                                                fontSize: '1.75rem',
                                                fontWeight: 600,
                                                color: 'primary.main'
                                                // mt: 1,
                                            }}
                                        >
                                            {String(value ?? 0)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                    </Grid>
                )}

                {/* Charts Row */}
                {dashboardData && (
                    <Grid container item xs={12} spacing={2}>
                        {/* First Row - 3 Charts */}
                        <Grid item xs={12} md={4}>
                            {renderPieChart(dashboardData.VW_DB_PR_DIV_COUNTdata, 'DIV_NAME', 'PR_DIV_COUNT', 'PR BY DIVISION')}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {renderPieChart(dashboardData.PR_STATUS_COUNTdata, 'STATUS', 'PR_STATUS', 'PR BY STATUS')}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            {renderPieChart(
                                dashboardData.PO_STATUS_COUNTdata.map((item: { STATUS: string | null; PO_STATUS: number }) => ({
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
                                    PR by Service Type
                                </Typography>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Pie
                                        height={150}
                                        data={{
                                            labels: dashboardData?.PR_SERVICE_RMdata.map((item: any) => item.SERVICE_RM_FLAG) || [],
                                            datasets: [
                                                {
                                                    data: dashboardData?.PR_SERVICE_RMdata.map((item: any) => item.SERVICE_RM_FLAG_COUNT) || [],
                                                    backgroundColor: ['rgba(63, 81, 181, 0.8)', 'rgba(156, 39, 176, 0.8)'],
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
                                    PR by Request Type
                                </Typography>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Pie
                                        height={150}
                                        data={{
                                            labels: dashboardData?.VW_DB_PRSERVICE_TYPEdata.map((item: any) => item.TYPE_OF_PR) || [],
                                            datasets: [
                                                {
                                                    data: dashboardData?.VW_DB_PRSERVICE_TYPEdata.map((item: any) => item.SERVICE_TYPE_COUNT) || [],
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
    }

    // if (/^USER_CC\d+$/.test(user.username)) {
    //   return <CostControllerDashboard />;
    // }

    // if (/^USER_PROC\d+$/.test(user.username)) {
    //   return <ProcDashboard />;
    // }

    if (isAllowedUser(user?.username ?? '')) {
        return (
            <Grid container spacing={2} padding={2} justifyContent="center" alignItems="center" style={{ minHeight: '1000px' }}>
                <Grid item>
                    <CircularProgress />
                </Grid>
            </Grid>
        );
    } else {
        return <div></div>;
    }
};
export default WmsDashboard;
