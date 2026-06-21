import { Card, Col, Row, Statistic, DatePicker, Space, Spin, Empty } from 'antd';
import {
  UserOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
// import attendanceServiceInstance from 'service/attendance/Service.attendance';
// import { Area, Column } from '@ant-design/charts';
import { useState } from 'react';
import dayjs from 'dayjs';
import attendanceServiceInstance from 'service/Attendance/Service.attendance';
import Column from 'antd/es/table/Column';
// import { Area } from 'recharts/types/cartesian/Area';

const AttendanceDashboardPage = () => {
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]);

  const { data: dailyStats, isLoading: isDailyLoading } = useQuery({
    queryKey: ['daily_stats'],
    queryFn: () => attendanceServiceInstance.getDailyStats()
  });

  const { data: monthlyStats, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['monthly_stats'],
    queryFn: () => attendanceServiceInstance.getMonthlyStats()
  });

  const { data: departmentStats, isLoading: isDeptLoading } = useQuery({
    queryKey: ['department_stats', dateRange],
    queryFn: () => attendanceServiceInstance.getDepartmentStats(dateRange[0], dateRange[1])
  });

  const { data: lateTrends, isLoading: isLateTrendsLoading } = useQuery({
    queryKey: ['late_trends'],
    queryFn: () => attendanceServiceInstance.getLateArrivalTrends(30)
  });

  // const lateTrendsConfig = {
  //   data: Object.entries(lateTrends?.dailyTrends || {}).map(([date, count]) => ({
  //     date: dayjs(date).format('MMM DD'),
  //     value: count,
  //     type: 'Late Arrivals'
  //   })),
  //   xField: 'date',
  //   yField: 'value',
  //   seriesField: 'type',
  //   color: ['#E86452'],
  //   smooth: true,
  //   line: {
  //     size: 3
  //   },
  //   areaStyle: {
  //     fill: 'l(270) 0:#ffffff 0.5:#E86452 1:#E86452'
  //   },
  //   animation: {
  //     appear: {
  //       animation: 'path-in',
  //       duration: 1000
  //     }
  //   }
  // };

  return (
    <div className="flex flex-col space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <DashboardOutlined className="text-blue-600 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
            <p className="text-gray-500">Track and analyze employee attendance patterns</p>
          </div>
        </div>
        <Space className="w-full sm:w-auto">
          <DatePicker.RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
              }
            }}
            className="h-10 rounded-lg shadow-sm"
            size="middle"
          />
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="h-full rounded-2xl shadow-sm border-0 transition-all duration-300 hover:shadow-md"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-xl mr-4">
                <UserOutlined className="text-blue-600 text-xl" />
              </div>
              <Statistic
                title="Total Employees"
                value={dailyStats?.total || 0}
                loading={isDailyLoading}
                valueStyle={{ color: '#1f2937', fontWeight: 600 }}
                className="m-0"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="h-full rounded-2xl shadow-sm border-0 transition-all duration-300 hover:shadow-md"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-xl mr-4">
                <CheckCircleOutlined className="text-green-600 text-xl" />
              </div>
              <Statistic
                title="Present Today"
                value={dailyStats?.present || 0}
                valueStyle={{ color: '#10b981', fontWeight: 600 }}
                loading={isDailyLoading}
                className="m-0"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="h-full rounded-2xl shadow-sm border-0 transition-all duration-300 hover:shadow-md"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-xl mr-4">
                <WarningOutlined className="text-amber-600 text-xl" />
              </div>
              <Statistic
                title="Late Today"
                value={dailyStats?.late || 0}
                valueStyle={{ color: '#f59e0b', fontWeight: 600 }}
                loading={isDailyLoading}
                className="m-0"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="h-full rounded-2xl shadow-sm border-0 transition-all duration-300 hover:shadow-md"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-xl mr-4">
                <CloseCircleOutlined className="text-red-600 text-xl" />
              </div>
              <Statistic
                title="Absent Today"
                value={dailyStats?.absent || 0}
                valueStyle={{ color: '#ef4444', fontWeight: 600 }}
                loading={isDailyLoading}
                className="m-0"
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <CalendarOutlined className="text-blue-500 mr-2" />
                <span>Monthly Attendance Trends</span>
              </div>
            }
            className="rounded-2xl shadow-sm border-0"
            bodyStyle={{ padding: '24px' }}
          >
            {isMonthlyLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Spin size="large" />
              </div>
            ) : monthlyStats && Object.keys(monthlyStats).length > 0 ? (
              <Column
                // data={Object.entries(monthlyStats || {}).map(([date, stats]: [string, any]) => ({
                //   date,
                //   value: stats.present || 0,
                //   type: 'Present'
                // }))}
                // xField="date"
                // yField="value"
                // seriesField="type"
                // columnStyle={{
                //   radius: [4, 4, 0, 0]
                // }}
                // color="#4096ff"
                // height={300}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No monthly data available"
                className="h-80 flex flex-col justify-center"
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center">
                <TeamOutlined className="text-green-500 mr-2" />
                <span>Department-wise Attendance</span>
              </div>
            }
            className="rounded-2xl shadow-sm border-0"
            bodyStyle={{ padding: '24px' }}
          >
            {isDeptLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Spin size="large" />
              </div>
            ) : departmentStats && Object.keys(departmentStats).length > 0 ? (
              <Column
                // data={Object.entries(departmentStats || {})
                //   .map(([dept, stats]: [string, any]) => [
                //     {
                //       department: dept,
                //       value: stats.present || 0,
                //       type: 'Present'
                //     },
                //     {
                //       department: dept,
                //       value: stats.late || 0,
                //       type: 'Late'
                //     }
                //   ])
                //   .flat()}
                // xField="department"
                // yField="value"
                // seriesField="type"
                // isGroup
                // columnStyle={{
                //   radius: [4, 4, 0, 0]
                // }}
                // color={['#52c41a', '#faad14']}
                // height={300}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No department data available"
                className="h-80 flex flex-col justify-center"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Late Arrival Trends */}
      {lateTrends && (
        <Card
          title={
            <div className="flex items-center">
              <WarningOutlined className="text-amber-500 mr-2" />
              <span>Late Arrival Trends (30 Days)</span>
            </div>
          }
          className="rounded-2xl shadow-sm border-0 mt-6"
          bodyStyle={{ padding: '24px' }}
        >
          {isLateTrendsLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Spin size="large" />
            </div>
          )
          
          // : 
          // lateTrends && Object.keys(lateTrends.dailyTrends || {}).length > 0 ? (
          //   <Area {...lateTrendsConfig} height={300} />
          // )
           : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No late arrival data available"
              className="h-80 flex flex-col justify-center"
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default AttendanceDashboardPage;
