import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  Checkbox,
  Alert,
  Collapse,
  FormControlLabel,
  Snackbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton
} from '@mui/material';
import CustomAlert from 'components/@extended/CustomAlert';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { TLeaveApproval } from 'pages/Purchasefolder/type/leave-approval-types';
import { IoSendSharp, IoPrintSharp } from 'react-icons/io5';
import { MdCancelScheduleSend } from 'react-icons/md';
import hrapprovalInstance from 'service/Service.hr';
import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { useQuery } from '@tanstack/react-query';
import WmsReportView from 'components/reports/WmsReportView';
import UniversalDialog from 'components/popup/UniversalDialog';
import WmsSerivceInstance from 'service/wms/service.wms';
import { FaFileExport, FaSave } from 'react-icons/fa';
import { DialogPop } from 'components/popup/DIalogPop';
import { SentBackPopup } from 'pages/Purchasefolder/MyTaskPendingRequestTab';
import HrRequestServiceInstance, { IHrEmployee, IValidateLeaveResponse } from 'service/services.hr';
import * as XLSX from 'xlsx';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { EyeOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';

type AddLeaveApprovalFormProps = {
  data?: TLeaveApproval | null;
  onClose?: () => void;
  onSuccess?: () => void;
  isEditMode?: boolean;
  viewMode?: boolean;
  approveResumption?: boolean;
  disableButtons?: boolean;
};

interface SentBackPopupState {
  title: string;
  open: boolean;
  data: {
    request_number: string;
    level: number;
    remarks: string;
  };
}

interface ILeaveType {
  value: string;
  label: string;
}

const LeaveResumptionForm: React.FC<AddLeaveApprovalFormProps> = ({
  data,
  onClose,
  onSuccess,
  isEditMode,
  viewMode,
  disableButtons,
  approveResumption
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  type FormDataType = {
    CONTACT_DETAILS_DURING_LEAVE: unknown;
    contact_details_during_leave: string;
    NAME_OF_REPLACEMENT: unknown;
    TRAVEL_DATE: string;
    TRAVEL_END_DATE: string;
    CAUSE_TYPE: unknown;
    ADV_PAYMENT: unknown;
    LEAVE_ALLOWANCE: unknown;
    request_number: string;
    request_date: string;
    employee_code: string;
    leave_type: string;
    leave_type_desc: string;
    leave_start_date: string;
    leave_end_date: string;
    resume_date: string;
    leave_days: string;
    remarks: string;
    company_code: string;
    rpt_name: string;
    EMPLOYEE_ID: string;
    Employee_Name: string;
    is_half_day: boolean;
    division_head?: string;
    SUPERVISOR_EMPID: string;
    DEPT_HEAD_EMPID: string;
    MANGR_EMPID: string;
    IMMEDIATE_SUPERVISOR_NAME: string;
    HOD_NAME: string;
    DEPT_HEAD_NAME: string;
    [key: string]: any;
  };

  const [formData, setFormData] = useState<FormDataType>({
    request_number: '',
    request_date: new Date().toISOString().split('T')[0],
    EMPLOYEE_ID: '',
    employee_code: '',
    Employee_Name: '',
    is_half_day: false,
    leave_type: '',
    leave_type_desc: '',
    leave_start_date: '',
    leave_end_date: '',
    resume_date: '',
    leave_days: '',
    remarks: '',
    company_code: user?.company_code || '',
    rpt_name: '',
    SUPERVISOR_EMPID: '',
    DEPT_HEAD_EMPID: '',
    MANGR_EMPID: '',
    contact_details_during_leave: '',
    CONTACT_DETAILS_DURING_LEAVE: '',
    NAME_OF_REPLACEMENT: '',
    TRAVEL_DATE: '',
    TRAVEL_END_DATE: '',
    CAUSE_TYPE: '',
    ADV_PAYMENT: '',
    LEAVE_ALLOWANCE: '',
    resume_work: false,
    actual_resume_date: '',
    DUTY_RESUME_DATE: '',
    AIR_ROUTE: '',
    AIR_TICKET: '',
    IMMEDIATE_SUPERVISOR_NAME: '',
    HOD_NAME: '',
    DEPT_HEAD_NAME: ''
  });

  const intl = useIntl();
  const [sentBackPopup, setSentBackPopup] = useState<SentBackPopupState>({
    title: intl.formatMessage({ id: 'Send Back' }) || 'Send Back',
    open: false,
    data: {
      request_number: '',
      level: 0,
      remarks: ''
    }
  });

  const [leaveTypes, setLeaveTypes] = useState<ILeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState<boolean>(false);
  const [, setLeaveTypesError] = useState<string>('');

  const [approverNames, setApproverNames] = useState<{
    SUPERVISOR_EMPID: string;
    DEPT_HEAD_EMPID: string;
    MANGR_EMPID: string;
  }>({
    SUPERVISOR_EMPID: '',
    DEPT_HEAD_EMPID: '',
    MANGR_EMPID: ''
  });

  const [approverLoading, setApproverLoading] = useState<boolean>(false);
  const [validationLoading, setValidationLoading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<IValidateLeaveResponse | null>(null);
  const [showValidationAlert, setShowValidationAlert] = useState<boolean>(false);

  // Snackbar state for export notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Report popup state
  const [printPopup, setPrintPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },

    title: intl.formatMessage({ id: 'Print Leave Resumption' }) || 'Print Leave Resumption',
    data: { isPrintMode: false }
  });

  const [previewReportPopup, setPreviewReportPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: intl.formatMessage({ id: 'Print Report' }) || 'Print Report',

    data: { selectedReport: null }
  });

  // Query to get logged-in user's employee data only
  const { data: currentUserEmployeeData } = useQuery<IHrEmployee | null, Error>({
    queryKey: ['current-user-employee', user?.loginid1],
    queryFn: async () => {
      if (!user?.loginid1) return null;
      try {
        const data = await HrRequestServiceInstance.getEmployees(user.loginid1);
        return data[0] || null;
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  // Query to fetch report data
  const {
    data: reportData,
    isLoading: reportsLoading,
    isError: reportsError,
    refetch: refetchReportListData
  } = useQuery({
    queryKey: ['employee_reports'],
    queryFn: async () => {
      const reports = await WmsSerivceInstance.getAllEmployeeReports();
      return reports || null;
    },
    enabled: printPopup.action.open
  });

  // Update form data when user data loads
  useEffect(() => {
    if (currentUserEmployeeData) {
      const employeeId = currentUserEmployeeData.EMPLOYEE_ID?.toString() || '';
      const employeeCode = currentUserEmployeeData.EMPLOYEE_CODE || '';
      const employeeName = currentUserEmployeeData.RPT_NAME || '';

      setFormData((prev) => ({
        ...prev,
        EMPLOYEE_ID: employeeId,
        employee_code: employeeCode,
        Employee_Name: employeeName,
        SUPERVISOR_EMPID: currentUserEmployeeData.SUPERVISOR_EMPID || '',
        DEPT_HEAD_EMPID: currentUserEmployeeData.DEPT_HEAD_EMPID || '',
        MANGR_EMPID: currentUserEmployeeData.MANGR_EMPID || ''
      }));

      // Fetch approver names
      fetchApproverNames(currentUserEmployeeData);

      // Fetch leave types for this employee
      fetchLeaveTypes(employeeId);
    }
  }, [currentUserEmployeeData]);
  useEffect(() => {
    if (data) {
      setFormData({
        request_number: data.REQUEST_NUMBER || '',
        request_date: data.REQUEST_DATE || '',
        employee_code: data.EMPLOYEE_CODE || '',
        leave_type: data.LEAVE_TYPE || '',
        leave_type_desc: data.LEAVE_TYPE_DESC || '',
        Employee_Name: data.EMPLOYEE_NAME || '',
        leave_start_date: data.LEAVE_START_DATE || '',
        leave_end_date: data.LEAVE_END_DATE || '',
        resume_date: data.RESUME_DATE || '',
        leave_days: data.LEAVE_DAYS?.toString() || '',
        remarks: data.REMARKS || '',
        company_code: user?.company_code || '',
        rpt_name: data.EMPLOYEE_CODE || '',
        EMPLOYEE_ID: data.EMPLOYEE_ID || data.EMPLOYEE_CODE || '',
        SUPERVISOR_EMPID: data.IMMEDIATE_SUPERVISOR || '',
        DEPT_HEAD_EMPID: data.DEPT_HEAD || '',
        MANGR_EMPID: data.HOD || '',
        contact_details_during_leave: data.CONTACT_DETAILS_DURING_LEAVE || '',
        CONTACT_DETAILS_DURING_LEAVE: data.CONTACT_DETAILS_DURING_LEAVE || '',
        NAME_OF_REPLACEMENT: data.NAME_OF_REPLACEMENT || '',
        TRAVEL_DATE: data.TRAVEL_DATE || '',
        TRAVEL_END_DATE: data.TRAVEL_END_DATE || '',
        CAUSE_TYPE: data.CAUSE_TYPE || '',
        ADV_PAYMENT: data.ADV_PAYMENT || '',
        LEAVE_ALLOWANCE: data.LEAVE_ALLOWANCE || '',
        is_half_day: false,
        // Fix the comparison to handle 'Y'/'N' values
        resume_work: data.RESUME_WORK || false,
        actual_resume_date: data.ACTUAL_RESUME_DATE || '',
        DUTY_RESUME_DATE: data.DUTY_RESUME_DATE || '',
        AIR_ROUTE: data.AIR_ROUTE || '',
        AIR_TICKET: data.AIR_TICKET || '',
        IMMEDIATE_SUPERVISOR_NAME: data.IMMEDIATE_SUPERVISOR_NAME || '',
        HOD_NAME: data.HOD_NAME || '',
        DEPT_HEAD_NAME: data.DEPT_HEAD_NAME || ''
      });
    }
  }, [data, user?.company_code]);
  // Export functionality
  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = {
        'Request Number': formData.request_number || '',
        'Request Date': formData.request_date,
        'Employee Code': formData.employee_code,
        'Employee Name': formData.Employee_Name,
        'Leave Type': formData.leave_type_desc || formData.leave_type,
        'Leave Start Date': formData.leave_start_date,
        'Leave End Date': formData.leave_end_date,
        'Leave Days': formData.leave_days,
        'Resume Date': formData.resume_date,
        Remarks: formData.remarks,
        'Contact Details': formData.CONTACT_DETAILS_DURING_LEAVE,
        'Leave Allowance': formData.LEAVE_ALLOWANCE,
        'Advance Payment': formData.ADV_PAYMENT,
        'Cause Type': formData.CAUSE_TYPE,
        'Travel Date': formData.TRAVEL_DATE,
        'Name of Replacement': formData.NAME_OF_REPLACEMENT,
        'Immediate Supervisor': approverNames.SUPERVISOR_EMPID,
        'Department Head': approverNames.DEPT_HEAD_EMPID,
        HOD: approverNames.MANGR_EMPID,
        'Half Day': formData.is_half_day ? 'Yes' : 'No'
      };

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet([exportData]);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Request');

      // Generate file name
      const fileName = `Leave_Request_${formData.request_number || ''}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      // Export to file
      XLSX.writeFile(wb, fileName);

      // Show success message
      setSnackbar({ open: true, message: 'Leave request exported successfully', severity: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({ open: true, message: 'Failed to export leave request', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const parseCustomDate = (dateString: any) => {
    if (!dateString) return new Date(NaN);

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      return new Date(`${year}-${month}-${day}`);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // ignore
    }

    return new Date(NaN);
  };

  useEffect(() => {
    if (formData.leave_start_date && formData.leave_end_date) {
      const start = parseCustomDate(formData.leave_start_date);
      const end = parseCustomDate(formData.leave_end_date);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays !== Number(formData.leave_days)) {
          setFormData((prev) => ({
            ...prev,
            leave_days: diffDays > 0 ? diffDays.toString() : ''
          }));
        }
      }
    }
  }, [formData.leave_start_date, formData.leave_end_date]);

  const getEmployeeNameById = async (employeeId: string): Promise<string> => {
    if (!employeeId) return '';

    try {
      const employeeArr = await HrRequestServiceInstance.getEmployees(employeeId);
      return employeeArr[0]?.RPT_NAME || ''; // Use RPT_NAME (or Employee_Name as fallback)
    } catch (error) {
      console.error(`Error fetching employee name for ID ${employeeId}:`, error);
      return '';
    }
  };

  const fetchApproverNames = async (employeeData: IHrEmployee | null) => {
    if (!employeeData) {
      setApproverNames({
        SUPERVISOR_EMPID: '',
        DEPT_HEAD_EMPID: '',
        MANGR_EMPID: ''
      });
      return;
    }

    setApproverLoading(true);
    try {
      const names = await Promise.all([
        getEmployeeNameById(employeeData.SUPERVISOR_EMPID || ''),
        getEmployeeNameById(employeeData.DEPT_HEAD_EMPID || ''),
        getEmployeeNameById(employeeData.MANGR_EMPID || '')
      ]);

      setApproverNames({
        SUPERVISOR_EMPID: names[0],
        DEPT_HEAD_EMPID: names[1],
        MANGR_EMPID: names[2]
      });

      setFormData((prev) => ({
        ...prev,
        SUPERVISOR_EMPID: employeeData.SUPERVISOR_EMPID || '',
        DEPT_HEAD_EMPID: employeeData.DEPT_HEAD_EMPID || '',
        MANGR_EMPID: employeeData.MANGR_EMPID || ''
      }));
    } catch (error) {
      console.error('Error fetching approver names:', error);
    } finally {
      setApproverLoading(false);
    }
  };

  const fetchLeaveTypes = async (employeeId: string) => {
    if (!employeeId) return;

    setLeaveTypesLoading(true);
    setLeaveTypesError('');

    try {
      const leaveHistory = await HrRequestServiceInstance.getLeaveHistory({
        employeeId: employeeId
      });

      const uniqueTypes = new Map<string, ILeaveType>();
      leaveHistory.forEach((leave: any) => {
        if (leave.LEAVE_TYPE && leave.LEAVE_DESC) {
          if (!uniqueTypes.has(leave.LEAVE_TYPE)) {
            uniqueTypes.set(leave.LEAVE_TYPE, {
              value: leave.LEAVE_TYPE,
              label: leave.LEAVE_DESC
            });
          }
        }
      });
      const options = Array.from(uniqueTypes.values()).sort((a, b) => a.label.localeCompare(b.label));
      console.log('Fetched leave types:', options);

      setLeaveTypes(Array.from(uniqueTypes.values()).sort((a, b) => a.label.localeCompare(b.label)));
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setLeaveTypesError('Failed to load leave types');
      setLeaveTypes([]);
    } finally {
      setLeaveTypesLoading(false);
    }
  };

  const validateLeave = async () => {
    if (!formData.EMPLOYEE_ID) {
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Please select an employee first',
          open: true
        })
      );
      return;
    }

    if (!formData.leave_type || !formData.leave_start_date || !formData.leave_end_date) {
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Please fill all required leave details (Leave Type, Start Date, End Date)',
          open: true
        })
      );
      return;
    }

    const requestedDays = Number(formData.leave_days);
    if (requestedDays <= 0) {
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Leave days must be greater than zero',
          open: true
        })
      );
      return;
    }

    setValidationLoading(true);
    setValidationResult(null);
    setShowValidationAlert(true);

    try {
      const result = await HrRequestServiceInstance.getValidateLeave({
        companyCode: 'BSG',
        employeeId: formData.EMPLOYEE_ID,
        leaveStartDate: formData.leave_start_date,
        leaveEndDate: formData.leave_end_date,
        leaveType: formData.leave_type,
        leaveDays: requestedDays
      });

      setValidationResult(result);

      let isValid = result.success && result.isValid;
      let message = result.message || 'Leave validation passed!';
      let severity: 'success' | 'error' = 'success';

      if (result.availableBalance !== undefined && result.availableBalance < requestedDays) {
        isValid = false;
        severity = 'error';
        message = `Insufficient leave balance. Available: ${result.availableBalance} days, Requested: ${requestedDays} days`;
      }

      if (result.message && result.message.includes('$$$')) {
        const parts = result.message.split('$$$');
        if (parts.length === 2) {
          const balance = parseFloat(parts[1]);
          if (!isNaN(balance) && balance < requestedDays) {
            isValid = false;
            severity = 'error';
            message = `Insufficient leave balance. Available: ${balance} days, Requested: ${requestedDays} days`;
          } else if (!isNaN(balance)) {
            result.availableBalance = balance;
            message = `Leave validation passed! Available balance: ${balance} days`;
          }
        }
      }

      dispatch(
        showAlert({
          severity,
          message,
          open: true
        })
      );

      setValidationResult({
        ...result,
        isValid,
        message
      });
    } catch (error) {
      console.error('Error validating leave:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'Failed to validate leave request',
          open: true
        })
      );
    } finally {
      setValidationLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    let formattedValue = value;
    console.log('handleChange', field, value);

    // Special handling for leave type selection
    if (field === 'leave_type') {
      const selectedLeaveType = leaveTypes.find((lt) => lt.value === value);
      const updatedForm = {
        ...formData,
        leave_type: value,
        leave_type_desc: selectedLeaveType ? selectedLeaveType.label : ''
      };
      setFormData(updatedForm);
      setValidationResult(null);
      setShowValidationAlert(false);
      return;
    }

    // For all other fields
    const updatedForm = { ...formData, [field]: formattedValue };

    if ((field === 'leave_start_date' || field === 'leave_end_date') && updatedForm.leave_start_date && updatedForm.leave_end_date) {
      try {
        // Use Dayjs for date calculations to avoid timezone issues
        const start = dayjs(updatedForm.leave_start_date);
        const end = dayjs(updatedForm.leave_end_date);

        if (start.isValid() && end.isValid()) {
          if (start <= end) {
            // Dayjs diff method calculates difference in days
            const dayDiff = end.diff(start, 'day') + 1; // +1 for inclusive calculation
            updatedForm.leave_days = dayDiff > 0 ? dayDiff.toString() : '0';
          } else {
            updatedForm.leave_days = '0';
          }
        } else {
          updatedForm.leave_days = '0';
        }
      } catch (error) {
        console.error('Error calculating leave days:', error);
        updatedForm.leave_days = '0';
      }
    }
    console.log('updatedForm handleChange', field, value);
    setFormData(updatedForm);

    if (['leave_type', 'leave_start_date', 'leave_end_date', 'leave_days'].includes(field)) {
      setValidationResult(null);
      setShowValidationAlert(false);
    }
  };

  const handleSave = async (actionType: string) => {
    dispatch(openBackdrop());
    const {
      request_number,
      request_date,
      EMPLOYEE_ID,
      leave_type,
      leave_start_date,
      leave_end_date,
      leave_days,
      remarks,
      SUPERVISOR_EMPID,
      DEPT_HEAD_EMPID,
      MANGR_EMPID,
      resume_work,
      actual_resume_date,
      DUTY_RESUME_DATE
    } = formData;

    if (actionType === 'SAVEASDRAFT' || actionType === 'SUBMITTED') {
      const errors: string[] = [];

      if (!request_date) errors.push('Request Date is required.');
      if (!EMPLOYEE_ID) errors.push('Employee Code is required.');
      if (!leave_type) errors.push('Leave Type is required.');
      if (!leave_start_date) errors.push('Leave Start Date is required.');
      if (!leave_end_date) errors.push('Leave End Date is required.');
      if (!remarks) errors.push('Remarks are required.');
      if (!actual_resume_date) errors.push('Actual Resume Date is required.');
      if (!DUTY_RESUME_DATE) errors.push('Duty Resume Date is required.');
      if (errors.length) {
        dispatch(closeBackdrop());
        dispatch(
          showAlert({
            severity: 'error',
            message: errors.join('\n'),
            open: true
          })
        );
        return;
      }
    }

    let payload = {
      COMPANY_CODE: user?.company_code || '',
      EMPLOYEE_NAME: formData.Employee_Name || '',
      CREATED_BY: user?.loginid1 || '',
      UPDATED_BY: user?.loginid1 || '',
      LAST_ACTION: actionType,
      REQUEST_NUMBER: request_number || '',
      REQUEST_DATE: dayjs(request_date).format('YYYY-MM-DD'),
      EMPLOYEE_CODE: EMPLOYEE_ID,
      LEAVE_TYPE: leave_type,
      LEAVE_START_DATE: dayjs(leave_start_date).format('YYYY-MM-DD'),
      LEAVE_END_DATE: dayjs(leave_end_date).format('YYYY-MM-DD'),
      LEAVE_DAYS: leave_days ? Number(leave_days) : 0,
      REMARKS: remarks || 'Draft save',
      FLOW_CODE: '004',
      HOD: MANGR_EMPID,
      IMMEDIATE_SUPERVISOR: SUPERVISOR_EMPID,
      DEPT_HEAD: DEPT_HEAD_EMPID,
      LEAVE_ALLOWANCE: formData.LEAVE_ALLOWANCE || '',
      ADV_PAYMENT: formData.ADV_PAYMENT || '',
      CAUSE_TYPE: formData.CAUSE_TYPE || '',
      TRAVEL_DATE: formData.TRAVEL_DATE ? dayjs(formData.TRAVEL_DATE).format('YYYY-MM-DD') : '0000/00/00',
      TRAVEL_END_DATE: formData.TRAVEL_END_DATE ? dayjs(formData.TRAVEL_END_DATE).format('YYYY-MM-DD') : '0000/00/00',
      NAME_OF_REPLACEMENT: formData.NAME_OF_REPLACEMENT || '',
      CONTACT_DETAILS_DURING_LEAVE: formData.CONTACT_DETAILS_DURING_LEAVE || '',
      RESUME_DATE: formData.resume_date || '',
      LEAVE_TYPE_DESC: formData.leave_type_desc || '',
      HALF_DAY: formData.is_half_day,
      // Add the new leave resumption fields
      RESUME_WORK: resume_work ? 'Yes' : 'No',
      ACTUAL_RESUME_DATE: actual_resume_date ? dayjs(actual_resume_date).format('YYYY-MM-DD') : '',
      DUTY_RESUME_DATE: DUTY_RESUME_DATE ? dayjs(DUTY_RESUME_DATE).format('YYYY-MM-DD') : '',
      AIR_ROUTE: formData.AIR_ROUTE || '',
      AIR_TICKET: formData.AIR_TICKET || ''
    };

    console.log('Payload for Save:', payload);

    const result = await dispatch(hrapprovalInstance.upsertLeaveApprovalManualHandler(payload));

    if (result) {
      onSuccess?.();
      onClose?.();
      dispatch(closeBackdrop());
    } else {
      dispatch(closeBackdrop());
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while saving the leave request.',
          open: true
        })
      );
    }
  };
  const handleSentBackPopupClose = () => {
    setSentBackPopup((prev) => ({ ...prev, open: false }));
  };

  // Handler to open report popup
  const handlePrint = () => {
    if (!printPopup.action.open) {
      refetchReportListData();
    }
    setPrintPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open }
    }));
  };

  const togglePreviewPopup = (report?: any) => {
    setPreviewReportPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: !prev.action.open },
      data: { selectedReport: report ?? null }
    }));
  };

  return (
    <Box maxWidth="xl" mx="auto" px={2}>
      <CustomAlert />
      <div className="mt-2 space-y-2">
        {/* <!-- Header Section --> */}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-md font-medium text-gray-800 mb-3">
              {intl.formatMessage({ id: 'Leave Request Number' })} {formData.request_number}
            </h2>
          </div>
          <div className="border-b border-gray-300 mt-2"></div>
        </div>

        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-800">
            {data?.EMPLOYEE_NAME_DISPLAY ? ` ${data.EMPLOYEE_NAME_DISPLAY}` : `${user?.loginid} - ${formData.Employee_Name}` || ''}
          </span>
        </div>

        {/* <!-- Basic Information --> */}
        <div>
          {/* <h3 className="text-md font-medium text-gray-700 mb-3">{intl.formatMessage({ id: 'Basic Information' })}</h3> */}

          <div className="flex flex-col  gap-4  md:flex-row">
            {/* Employee Code and Name - Display as text */}
            <div className="flex flex-col gap-4">
              {/* <label className="block text-md font-medium text-gray-700 mb-3">{intl.formatMessage({ id: 'EmployeeCodeAndName' })}</label> */}
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={intl.formatMessage({ id: 'Request Date' })}
                    value={formData.request_date ? dayjs(formData.request_date) : dayjs()}
                    onChange={(newValue) => handleChange('request_date', newValue)}
                    format="DD/MM/YYYY"
                    readOnly={true}
                    // readOnly={viewMode || formData?.EMPLOYEE_ID !==|| formData?.employee_code == ''}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        margin: 'dense',
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div className="flex flex-col p-4 border-2 rounded">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  {intl.formatMessage({ id: 'LeaveResumptionDetails' }) || 'Leave Resumption Details'}
                </h3>

                <div className="flex flex-col gap-4">
                  <FormControlLabel
                    control={
                      <Checkbox
                        readOnly={viewMode}
                        checked={formData.actual_resume_date ? true : formData.resume_work || false}
                        onChange={(e) => handleChange('resume_work', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={intl.formatMessage({ id: 'ResumeWork' }) || 'Resume Work'}
                  />
                  {/* Conditional Date Fields - shown side by side when checkbox is checked */}

                  <>
                    {/* Actual Resume Date */}
                    <div className="flex flex-col gap-4">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          readOnly={viewMode}
                          label={intl.formatMessage({ id: 'Actual Resume Date' })}
                          value={formData.actual_resume_date ? dayjs(formData.actual_resume_date) : null}
                          onChange={(newValue) => handleChange('actual_resume_date', newValue)}
                          minDate={formData.leave_end_date ? dayjs(formData.leave_end_date) : undefined}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              margin: 'dense',
                              required: true
                            }
                          }}
                        />
                      </LocalizationProvider>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          readOnly={viewMode}
                          label={intl.formatMessage({ id: 'Duty Resume Date' })}
                          value={formData.DUTY_RESUME_DATE ? dayjs(formData.DUTY_RESUME_DATE) : null}
                          onChange={(newValue) => handleChange('DUTY_RESUME_DATE', newValue)}
                          minDate={formData.leave_end_date ? dayjs(formData.leave_end_date) : undefined}
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              margin: 'dense',
                              required: true
                            }
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Leave Details & Settings & Approver Details --> */}
        {/* <div className="grid grid-cols-3 gap-4"> */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4">
          {/* <!-- Leave Details --> */}
          <div className="flex flex-col">
            <h3 className="text-md font-medium text-gray-700 mb-2">{intl.formatMessage({ id: 'Leave Details' })}</h3>

            <Collapse in={showValidationAlert}>
              {validationResult && (
                <Alert
                  severity={validationResult.isValid ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                  onClose={() => setShowValidationAlert(false)}
                >
                  <Typography variant="body2">{validationResult.message}</Typography>
                  {validationResult.validationErrors && validationResult.validationErrors.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {validationResult.validationErrors.map((error, index) => (
                        <Typography key={index} variant="body2" component="div">
                          • {error}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {validationResult.availableBalance !== undefined && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {intl.formatMessage(
                        { id: 'AvailableBalance', defaultMessage: 'Available Balance: {balance} days' },
                        { balance: validationResult.availableBalance }
                      )}
                    </Typography>
                  )}
                </Alert>
              )}
            </Collapse>

            <div className="flex flex-col gap-2">
              <div>
                <FormControl fullWidth size="small" margin="dense" required>
                  <InputLabel>{intl.formatMessage({ id: 'LeaveType' }) || 'Leave Type'}</InputLabel>
                  <Select
                    value={formData.leave_type}
                    onChange={(e) => handleChange('leave_type', e.target.value)}
                    label={intl.formatMessage({ id: 'Leave Type' }) || 'Leave Type'}
                    disabled={leaveTypesLoading || !formData.EMPLOYEE_ID}
                    inputProps={{
                      readOnly: approveResumption || data?.FINAL_APPROVED === 'YES' || viewMode
                    }}
                  >
                    <MenuItem value="">
                      <em>{intl.formatMessage({ id: 'Select' }) || 'Select'}</em>
                    </MenuItem>
                    {leaveTypes.map((leaveType) => (
                      <MenuItem key={leaveType.value} value={leaveType.value}>
                        {leaveType.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={intl.formatMessage({ id: 'Leave Start Date' })}
                  value={formData.leave_start_date ? dayjs(formData.leave_start_date) : null}
                  onChange={(newValue) => handleChange('leave_start_date', newValue)}
                  format="DD/MM/YYYY"
                  readOnly={approveResumption || data?.FINAL_APPROVED === 'YES'}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      margin: 'dense',
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={intl.formatMessage({ id: 'Leave End Date' }) || 'Leave End Date'}
                  value={formData.leave_end_date ? dayjs(formData.leave_end_date) : null}
                  onChange={(newValue) => handleChange('leave_end_date', newValue)}
                  format="DD/MM/YYYY"
                  readOnly={approveResumption || data?.FINAL_APPROVED === 'YES'}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      margin: 'dense',
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>

              <div className="grid grid-cols-2 gap-4 ">
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'Leave Days' }) || 'Leave Days'}
                  size="small"
                  margin="dense"
                  value={formData.leave_days}
                  InputProps={{ readOnly: true }}
                />

                <FormControlLabel
                  control={<Checkbox checked={formData.is_half_day} onChange={(e) => handleChange('is_half_day', e.target.checked)} />}
                  label={intl.formatMessage({ id: 'Half Day' }) || 'Half Day'}
                  disabled={viewMode || approveResumption || data?.FINAL_APPROVED === 'YES'}
                />
              </div>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={validateLeave}
                disabled={
                  validationLoading ||
                  !formData.EMPLOYEE_ID ||
                  !formData.leave_type ||
                  !formData.leave_start_date ||
                  !formData.leave_end_date ||
                  approveResumption ||
                  data?.FINAL_APPROVED === 'YES'
                }
                className="whitespace-nowrap min-w-auto px-3 text-sm"
              >
                {validationLoading
                  ? intl.formatMessage({ id: 'Validating' }) || 'Validating...'
                  : intl.formatMessage({ id: 'Validate' }) || 'Validate'}
              </Button>
            </div>
          </div>

          {/* <!-- Settings --> */}
          <div className="flex flex-col">
            <h3 className="text-md font-medium text-white mb-2">{intl.formatMessage({ id: 'Settings' }) || 'Settings'}</h3>

            <div className="flex flex-col  gap-2">
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>{intl.formatMessage({ id: 'Leave Allowance' }) || 'Leave Allowance'}</InputLabel>
                <Select
                  value={formData.LEAVE_ALLOWANCE}
                  onChange={(e) => handleChange('LEAVE_ALLOWANCE', e.target.value)}
                  label="Leave Allowance"
                  inputProps={{
                    readOnly: approveResumption || data?.FINAL_APPROVED === 'YES'
                  }}
                >
                  <MenuItem value="">
                    <em>{intl.formatMessage({ id: 'Select' }) || 'Select'}</em>
                  </MenuItem>
                  {['Yes', 'No'].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {intl.formatMessage({ id: opt }) || opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>{intl.formatMessage({ id: 'Advance Payment' }) || 'Advance Payment'}</InputLabel>
                <Select
                  value={formData.ADV_PAYMENT}
                  onChange={(e) => handleChange('ADV_PAYMENT', e.target.value)}
                  inputProps={{
                    readOnly: approveResumption || data?.FINAL_APPROVED === 'YES'
                  }}
                  label="Advance Payment"
                >
                  <MenuItem value="">
                    <em>{intl.formatMessage({ id: 'Select' }) || 'Select'}</em>
                  </MenuItem>
                  {['Yes', 'No'].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {intl.formatMessage({ id: opt }) || opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>{intl.formatMessage({ id: 'Cause Type' }) || 'Cause Type'}</InputLabel>
                <Select
                  value={formData.CAUSE_TYPE}
                  onChange={(e) => handleChange('CAUSE_TYPE', e.target.value)}
                  inputProps={{
                    readOnly: approveResumption || data?.FINAL_APPROVED === 'YES'
                  }}
                  label="Cause Type"
                >
                  <MenuItem value="">
                    <em>{intl.formatMessage({ id: 'Select' }) || 'Select'}</em>
                  </MenuItem>
                  {['Occupational', 'Non Occupational'].map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {intl.formatMessage({ id: opt }) || opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={2}
                label={intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}
                size="small"
                margin="dense"
                required
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                InputProps={{
                  readOnly: approveResumption || data?.FINAL_APPROVED === 'YES'
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label={intl.formatMessage({ id: 'Contact Details During Leave' }) || 'Contact Details During Leave'}
                size="small"
                margin="dense"
                value={formData.CONTACT_DETAILS_DURING_LEAVE}
                onChange={(e) => handleChange('CONTACT_DETAILS_DURING_LEAVE', e.target.value)}
                InputProps={{
                  readOnly: approveResumption || data?.FINAL_APPROVED === 'YES'
                }}
              />
            </div>
          </div>

          {/* <!-- Approver Details --> */}
          <div className="flex flex-col">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              {intl.formatMessage({ id: 'Approver Details' }) || 'Approver Details'}
            </h3>

            <div className="flex flex-col gap-2">
              {formData.IMMEDIATE_SUPERVISOR_NAME || formData.DEPT_HEAD_NAME || formData.HOD_NAME
                ? [
                    {
                      label: intl.formatMessage({ id: 'Immediate Supervisor' }) || 'Immediate Supervisor',
                      key: 'IMMEDIATE_SUPERVISOR_NAME',
                      name: formData.IMMEDIATE_SUPERVISOR_NAME,
                      id: formData.IMMEDIATE_SUPERVISOR_NAME
                    },
                    {
                      label: intl.formatMessage({ id: 'Department Head' }) || 'Department Head',
                      key: 'DEPT_HEAD_NAME',
                      name: formData.DEPT_HEAD_NAME,
                      id: formData.DEPT_HEAD_NAME
                    },
                    {
                      label: intl.formatMessage({ id: 'HOD' }) || 'HOD',
                      key: 'HOD_NAME',
                      name: formData.HOD_NAME,
                      id: formData.HOD_NAME
                    }
                  ].map(({ label, key, name, id }) => (
                    <div key={key}>
                      <TextField
                        fullWidth
                        label={label}
                        size="small"
                        margin="dense"
                        value={
                          name ||
                          (approverLoading
                            ? intl.formatMessage({ id: 'Loading' }) || 'Loading...'
                            : intl.formatMessage({ id: 'NotAssigned' }) || 'Not assigned')
                        }
                        InputProps={{
                          readOnly: true
                        }}
                        disabled={approverLoading}
                      />
                    </div>
                  ))
                : [
                    {
                      label: intl.formatMessage({ id: 'Immediate Supervisor' }) || 'Immediate Supervisor',
                      key: 'SUPERVISOR_EMPID',
                      name: approverNames.SUPERVISOR_EMPID,
                      id: formData.SUPERVISOR_EMPID
                    },
                    {
                      label: intl.formatMessage({ id: 'Department Head' }) || 'Department Head',
                      key: 'DEPT_HEAD_EMPID',
                      name: approverNames.DEPT_HEAD_EMPID,
                      id: formData.DEPT_HEAD_EMPID
                    },
                    {
                      label: intl.formatMessage({ id: 'HOD' }) || 'HOD',
                      key: 'MANGR_EMPID',
                      name: approverNames.MANGR_EMPID,
                      id: formData.MANGR_EMPID
                    }
                  ].map(({ label, key, name, id }) => (
                    <div key={key}>
                      <TextField
                        fullWidth
                        label={label}
                        size="small"
                        margin="dense"
                        value={
                          name ||
                          (approverLoading
                            ? intl.formatMessage({ id: 'Loading' }) || 'Loading...'
                            : intl.formatMessage({ id: 'NotAssigned' }) || 'Not assigned')
                        }
                        InputProps={{
                          readOnly: true
                        }}
                        disabled={approverLoading}
                      />
                    </div>
                  ))}
            </div>

            <div className="grid grid-cols-2 gap-4 ">
              {/* <div > */}

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={intl.formatMessage({ id: 'Travel Start Date' })}
                  value={formData.TRAVEL_DATE ? dayjs(formData.TRAVEL_DATE) : null}
                  onChange={(newValue) => handleChange('TRAVEL_DATE', newValue)}
                  format="DD/MM/YYYY"
                  readOnly={approveResumption || data?.FINAL_APPROVED === 'YES'}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      margin: 'dense'
                    }
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={intl.formatMessage({ id: 'Travel End Date' })}
                  value={formData.TRAVEL_END_DATE ? dayjs(formData.TRAVEL_END_DATE) : null}
                  onChange={(newValue) => handleChange('TRAVEL_END_DATE', newValue)}
                  minDate={formData.TRAVEL_END_DATE ? dayjs(formData.TRAVEL_END_DATE) : undefined}
                  format="DD/MM/YYYY"
                  readOnly={approveResumption || data?.FINAL_APPROVED === 'YES'}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      margin: 'dense'
                    }
                  }}
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={intl.formatMessage({ id: 'Air Route' }) || 'Air Route'}
                size="small"
                margin="dense"
                value={formData.AIR_ROUTE}
                onChange={(e) => handleChange('AIR_ROUTE', e.target.value)}
                InputProps={{
                  readOnly: approveResumption || data?.FINAL_APPROVED === 'YES'
                }}
              />

              {data?.LAST_ACTION === 'SENTBACK' && data?.SENTBACK_HISTORY != '' && (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={intl.formatMessage({ id: 'Send Back Remarks' }) || 'Send Back Remarks'}
                  size="small"
                  margin="dense"
                  value={data?.SENTBACK_HISTORY || ''}
                  // onChange={(e) => handleChange('remarks', e.target.value)}
                  InputProps={{
                    readOnly: true
                  }}
                />
              )}
              {data?.LAST_ACTION === 'REJECTED' && data?.CANCEL_REMARK != '' && (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={intl.formatMessage({ id: 'Reject Remarks' }) || 'Reject Remarks'}
                  size="small"
                  margin="dense"
                  value={data?.CANCEL_REMARK || ''}
                  InputProps={{
                    readOnly: true
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* <!-- Action Buttons --> */}
        <div className="sticky bottom-0 p-4 bg-white  z-10 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Button size="small" endIcon={<FaSave />} disabled={viewMode} onClick={() => handleSave('SAVEASDRAFT')}>
                {intl.formatMessage({ id: 'Save as Draft' }) || 'Save as Draft'}
              </Button>
              <Button size="small" endIcon={<IoSendSharp />} disabled={viewMode} onClick={() => handleSave('SUBMITTED')}>
                {intl.formatMessage({ id: 'Submit' }) || 'Submit'}
              </Button>
              <Button size="small" endIcon={<MdCancelScheduleSend />} disabled={viewMode} onClick={() => handleSave('CANCELLED')}>
                {intl.formatMessage({ id: 'Cancel' }) || 'Cancel'}
              </Button>
            </div>

            <div className="flex gap-2">
              <Tooltip title={intl.formatMessage({ id: 'Export Leave Request' }) || 'Export Leave Request'}>
                <Button variant="outlined" color="primary" onClick={handleExport} disabled={!isEditMode} size="small">
                  <FaFileExport />
                </Button>
              </Tooltip>

              <Tooltip title={intl.formatMessage({ id: 'Print Leave Request Form' }) || 'Print Leave Request Form'}>
                <Button variant="outlined" color="primary" onClick={handlePrint} disabled={!isEditMode} size="small">
                  <IoPrintSharp />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      {/* Snackbar for export notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {sentBackPopup.open && (
        <DialogPop open={sentBackPopup.open} onClose={handleSentBackPopupClose} title={sentBackPopup.title} width={1500}>
          <SentBackPopup
            request_number={sentBackPopup.data.request_number}
            flowLevel={sentBackPopup.data.level}
            onClose={handleSentBackPopupClose}
            onLevelChange={(level) =>
              setSentBackPopup((prev) => ({
                ...prev,
                data: { ...prev.data, level }
              }))
            }
            onRemarksChange={(remarks) =>
              setSentBackPopup((prev) => ({
                ...prev,
                data: { ...prev.data, remarks }
              }))
            }
          />
        </DialogPop>
      )}

      {/* Report dialog for leave resumption form */}
      {printPopup.action.open && (
        <UniversalDialog action={printPopup.action} onClose={handlePrint} title={printPopup.title} hasPrimaryButton={false}>
          {reportsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={50} />
              ))}
            </div>
          ) : reportsError ? (
            <div className="p-4 text-red-500">Failed to load reports. Please try again.</div>
          ) : (
            <List>
              {reportData?.map((report) => (
                <ListItem disablePadding key={report.reportid}>
                  <ListItemButton onClick={() => togglePreviewPopup(report)}>
                    <ListItemText
                      primary={
                        <span
                          style={{ fontWeight: previewReportPopup.data.selectedReport?.reportid === report.reportid ? 'bold' : 'normal' }}
                        >
                          {report.reportname}
                        </span>
                      }
                    />
                    <EyeOutlined className="hover:text-blue-900 ml-2" />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </UniversalDialog>
      )}

      {previewReportPopup.action.open && (
        <UniversalDialog
          action={previewReportPopup.action}
          onClose={() => togglePreviewPopup()}
          title={previewReportPopup.title}
          hasPrimaryButton={false}
        >
          {previewReportPopup.data.selectedReport ? (
            <WmsReportView
              reportId={previewReportPopup.data.selectedReport.reportid}
              parameters={{
                company_code: formData.company_code,
                div_code: formData.div_code || '10',
                LOGINID: user?.loginid1,
                Reportobject: 'Leave Resumption Report',
                ReportTitle: previewReportPopup.data.selectedReport.reportname,
                EMPLOYEE_CODE: formData.employee_code
              }}
              onClose={() => togglePreviewPopup()}
            />
          ) : (
            <Typography>{intl.formatMessage({ id: 'NoReportSelected' }) || 'No report selected'}</Typography>
          )}
        </UniversalDialog>
      )}
    </Box>
  );
};

export default LeaveResumptionForm;
