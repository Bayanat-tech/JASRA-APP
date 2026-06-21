export interface IEmployee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  phone_number?: string;
  is_active: boolean;
}

export interface IAttendanceRecord {
  employee_id: string;
  employee_name: string;
  full_name: string;
  department: string;
  position: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'late' | 'half-day';
}

export interface IAttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
}

export interface IAttendanceMarkRequest {
  file: File;
  action: 'check-in' | 'check-out';
}