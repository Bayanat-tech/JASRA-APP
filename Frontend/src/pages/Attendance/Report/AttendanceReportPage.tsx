import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
// import attendanceServiceInstance from 'service/attendance/Service.attendance';
import attendanceServiceInstance from 'service/Attendance/Service.attendance';
// import { IAttendanceRecord } from 'types/attendance.types';
import { IAttendanceRecord } from 'types/attendance.types';
import dayjs from 'dayjs';
import { DatePicker, Select, Space, Tag } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Extend with optional name if not present in IAttendanceRecord
type FixedAttendanceRecord = IAttendanceRecord & { employee_name?: string };

const AttendanceReportPage = () => {
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]);
  const [department, setDepartment] = useState<string | undefined>();

  const columns = useMemo<ColumnDef<FixedAttendanceRecord>[]>(
    () => [
      {
        accessorFn: (row: FixedAttendanceRecord) => row.employee_id,
        id: 'employee_id',
        header: () => <FormattedMessage id="Employee ID" />
      },
      {
        accessorFn: (row: FixedAttendanceRecord) => row.employee_name,
        id: 'employee_name',
        header: () => <FormattedMessage id="Employee Name" />
      },
      {
        accessorFn: (row: FixedAttendanceRecord) => row.department,
        id: 'department',
        header: () => <FormattedMessage id="Department" />
      },
      {
        accessorFn: (row: FixedAttendanceRecord) => dayjs(row.check_in).format('HH:mm:ss'),
        id: 'check_in',
        header: () => <FormattedMessage id="Check In" />
      },
      {
        accessorFn: (row: FixedAttendanceRecord) => dayjs(row.check_out).format('HH:mm:ss'),
        id: 'check_out',
        header: () => <FormattedMessage id="Check Out" />
      },
      {
        accessorFn: (row: FixedAttendanceRecord) => row.status,
        id: 'status',
        header: () => <FormattedMessage id="Status" />,
        cell: ({ getValue }) => {
          const status = String(getValue());
          const color = status === 'present' ? 'success' : status === 'late' ? 'warning' : 'error';
          return <Tag color={color}>{status.toUpperCase()}</Tag>;
        }
      }
    ],
    []
  );

  const { data: attendanceData, isFetching } = useQuery({
    queryKey: ['attendance_report', paginationData, dateRange, department],
    queryFn: () => attendanceServiceInstance.getAttendanceRecords(paginationData)
  });

  const customFilter = (
    <Space>
      <RangePicker
        value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
          }
        }}
      />
      <Select placeholder="Select Department" style={{ width: 200 }} onChange={setDepartment} allowClear>
        <Option value="IT">IT</Option>
        <Option value="HR">HR</Option>
        <Option value="Finance">Finance</Option>
      </Select>
    </Space>
  );

  return (
    <CustomDataTable
      columns={columns}
      data={attendanceData?.data || []}
      isDataLoading={isFetching}
      customFilter={customFilter}
      handleFilterChange={() => {}}
      row_id="id"
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      count={attendanceData?.data?.length || 0}
      hasPagination
      onPaginationChange={(page: number, rowsPerPage: number) => {
        setPaginationData({ page, rowsPerPage });
      }}
    />
  );
};

export default AttendanceReportPage;
