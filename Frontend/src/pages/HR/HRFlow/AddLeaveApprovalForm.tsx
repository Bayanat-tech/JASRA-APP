import React, { useEffect, useRef, useState } from 'react';
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
  Skeleton,
  Autocomplete,
  Dialog,
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
import { FaFileExport, FaSave, FaHistory } from 'react-icons/fa';
import { DialogPop } from 'components/popup/DIalogPop';
import { SentBackPopup } from 'pages/Purchasefolder/MyTaskPendingRequestTab';
import HrRequestServiceInstance, { IHrEmployee, IValidateLeaveResponse } from 'service/services.hr';
import * as XLSX from 'xlsx';
import WmsReportView from 'components/reports/WmsReportView';
import UniversalDialog from 'components/popup/UniversalDialog';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useIntl } from 'react-intl';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { EyeOutlined } from '@ant-design/icons';
import HRLeaveFilesDialog from './HRFileAttachment/HRLeaveFilesDialog';
import { IoIosAttach } from 'react-icons/io';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getRequestFlowUsers } from './getRequestFlowUsers';
import { closeBackdrop, openBackdrop } from 'store/reducers/backdropSlice';
import HrServiceInstance from 'service/Service.hr';
import FileUploadServiceInstance from 'service/services.files';
import LogReport from './LogReport';
const { v4: uuidv4 } = require('uuid');

type AddLeaveApprovalFormProps = {
  LeavePage?: boolean;
  data?: TLeaveApproval | null;
  onClose?: () => void;
  onSuccess?: () => void;
  closed?: boolean;
  isEditMode?: boolean;
  viewMode?: boolean;
  CreateMode?: boolean; //not being used
  disableButtons?: boolean;
};

type ApproverIds = {
  SUPERVISOR_EMPID: string;
  DEPT_HEAD_EMPID: string;
  MANGR_EMPID: string;
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

const AddLeaveApprovalForm: React.FC<AddLeaveApprovalFormProps> = ({
  data,
  LeavePage,
  onClose,
  closed,
  onSuccess,
  viewMode,
  isEditMode = false,
  disableButtons = false
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [newInsertedData, setNewInsertedData] = useState<TLeaveApproval | null>(null);

  console.log('AddLeaveApprovalForm data', data);

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
    is_half_day: string | boolean;
    division_head?: string;
    SUPERVISOR_EMPID: string;
    DEPT_HEAD_EMPID: string;
    MANGR_EMPID: string;
    IMMEDIATE_SUPERVISOR_NAME: string;
    HOD_NAME: string;
    DEPT_HEAD_NAME: string;
    [key: string]: any;
  };

  const intl = useIntl();
  // const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
  const uuidRef = useRef<string | null>(null);

  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: intl.formatMessage({ id: 'Upload Files' }) || 'Upload Files'
  });

  const [formData, setFormData] = useState<FormDataType>({
    request_number: '',
    request_date: new Date().toISOString().split('T')[0],
    EMPLOYEE_ID: '',
    employee_code: '',
    Employee_Name: '',
    is_half_day: 'N',
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
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);

  const [sentBackPopup, setSentBackPopup] = useState<SentBackPopupState>({
    title: intl.formatMessage({ id: 'Send Back' }) || 'Send Back',
    open: false,
    data: {
      request_number: '',
      level: 0,
      remarks: ''
    }
  });

  console.log('formData', formData);

  const [leaveSentBack, setLeaveSentBack] = useState<boolean>(false);
  const [leaveReject, setLeaveReject] = useState<boolean>(false);
  const [viewAttachments, setViewAttachments] = useState<boolean>(false);

  const [leaveTypes, setLeaveTypes] = useState<ILeaveType[]>([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState<boolean>(false);
  const [, setLeaveTypesError] = useState<string>('');
  const [formReady, setFormReady] = useState(false);
  const [viewLogOpen, setViewLogOpen] = useState(false);
  const [hasAttachments, setHasAttachments] = useState<boolean>(false);
  const leaveTypesRequiringAttachments = ['002', '014', '016', 'ACL'];

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
  const [sentBackParams, setSentBackParams] = useState<any>({
    LOGIN_ID: '',
    USERNAME: '',
    SENTBACK_HISTORY: ''
  });
  const [rejectParams, setRejectParams] = useState<any>({
    CANCEL_REMARK: ''
  });

  // Snackbar state for export notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Report dialog state
  const [printPopup, setPrintPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },
    title: intl.formatMessage({ id: 'Print Leave Request' }) || 'Print Leave Request',
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

  const DynamicViewName = user?.company_code === 'BSG' ?  'VW_HR_EMPLOYEE_AWARE' : 'VW_HR_EMPLOYEE'

  const sql_string = `
   SELECT * FROM ${DynamicViewName} WHERE EMPLOYEE_ID = '${user?.loginid1}'
  `;

  const { data: currentUserEmployeeData } = useQuery({
    queryKey: ['currentUserEmployeeData', sql_string],
    queryFn: async () => {
      const result = await HrServiceInstance.executeRawSql(sql_string);
      return result?.[0]; // Return only the first element
    }
  });
  const viewlog_sql = `
   SELECT 
     lrfh.REQUEST_NUMBER,
     lrfh.LAST_ACTION,
     lrfh.LEAVE_TYPE,
     lt.LEAVE_TYPE_DESC,
     lrfh.UPDATED_BY,
     lrfh.UPDATED_BY || ' - ' || emp.RPT_NAME as UPDATED_BY_DISPLAY,
     lrfh.UPDATED_AT,
     lrfh.NEXT_ACTION_BY,
     lrfh.NEXT_ACTION_BY || ' - ' || next_emp.RPT_NAME as NEXT_ACTION_BY_DISPLAY
    FROM LEAVE_REQUEST_FLOW_HISTRY lrfh
    LEFT JOIN VW_HR_EMPLOYEE_AWARE emp ON lrfh.UPDATED_BY = emp.EMPLOYEE_ID
    LEFT JOIN VW_HR_EMPLOYEE_AWARE next_emp ON lrfh.NEXT_ACTION_BY = next_emp.EMPLOYEE_ID
    LEFT JOIN VW_MS_HR_LEAVE_TYPES_AWARE lt ON lrfh.LEAVE_TYPE = lt.LEAVE_TYPE
    WHERE REQUEST_NUMBER like '${formData.request_number ? formData.request_number : newInsertedData?.REQUEST_NUMBER || ''}'
    AND LAST_ACTION <> 'SAVEASDRAFT'
    ORDER BY UPDATED_AT 
`;

  const { data: logData } = useQuery({
    queryKey: ['logData', viewlog_sql],
    queryFn: async () => {
      const result = await HrServiceInstance.executeRawSql(viewlog_sql);
      return result; // Return only the first element
    }
  });

  console.log('logData', logData)
  console.log('REQUEST_NUMBER', data?.REQUEST_NUMBER)

  const getInsertedData = async (uuid: string) => {
    const sql_string = `SELECT * FROM LEAVE_REQUEST_FLOW WHERE UUID = '${uuid}'`;
    try {
      const results = await HrServiceInstance.executeRawSql(sql_string);
      return results?.[0];
    } catch (err) {
      console.error('Error fetching inserted data:', err);
    }
  };

  console.log('userData', currentUserEmployeeData);

  // // Query to get logged-in user's employee data only
  // const { data: currentUserEmployeeData } = useQuery<IHrEmployee | null, Error>({
  //   queryKey: ['current-user-employee'],
  //   queryFn: async () => {
  //     try {

  // console.log('in currentUserEmployeeData', user?.loginid1);
  //       const data = await HrRequestServiceInstance.getEmployees(user?.loginid1);
  //       return data[0] || null;
  //     } catch (err) {
  //       console.error('Query error:', err);
  //       throw err;
  //     }
  //   },
  // });

  // console.log('currentUserEmployeeData', currentUserEmployeeData);

  const { data: currentSupervisorEmployeeData } = useQuery<IHrEmployee[] | null, Error>({
    queryKey: ['currentSupervisorEmployeeData', user?.loginid1],
    queryFn: async () => {
      if (!user?.loginid1) return null;
      try {
        const data = await HrRequestServiceInstance.getSupervisorEmployees(user.loginid1);
        console.log('currentSupervisorEmployeeData data', data);
        return data || [];
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  // const supervisor = currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0;

  console.log('currentSupervisorEmployeeData', currentSupervisorEmployeeData);

  // Report data query
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

  //Get user flow
  // Transform in useQuery
  const { data: userFlowData } = useQuery({
    queryKey: ['userFlowData', formData?.request_number],
    queryFn: async () => {
      const response = await getRequestFlowUsers(formData?.request_number, user?.loginid1 || '');

      return response || null;
    },
    enabled: leaveSentBack && !!formData?.request_number
  });

  console.log('userFlowData', userFlowData);

  // Query for attached files
  const { data: attachedFiles, refetch: refetchAttachedFiles } = useQuery({
    queryKey: ['attachedFiles', formData.request_number],
    queryFn: async () => {
      if (!formData.request_number) return [];
      const response = await FileUploadServiceInstance.getEmployeeFiles(formData.request_number, 'hr');
      return response || [];
    },
    enabled: !!formData.request_number
  });

  // Update hasAttachments when attachedFiles changes
  useEffect(() => {
    setHasAttachments(attachedFiles && attachedFiles.length > 0);
  }, [attachedFiles]);

  // // Update your change handler
  // useEffect(() => {
  //   if (userFlowData) {
  //     setSentBackParams((prev: any) => ({
  //       ...prev,
  //       LOGIN_ID: userFlowData?.LOGIN_ID || '',
  //       USERNAME: userFlowData?.USERNAME || '',
  //       SENTBACK_HISTORY: prev.SENTBACK_HISTORY || ''
  //     }));
  //   }
  // }, [userFlowData]);

  // const handleRemarksChange = (value: string) => {
  //   setSentBackParams((prev: any) => ({
  //     ...prev,
  //     SENTBACK_HISTORY: value
  //   }));
  // };
  // const handleRejectRemarksChange = (value: string) => {
  //   setRejectParams((prev: any) => ({
  //     ...prev,
  //     CANCEL_REMARK: value
  //   }));
  // };
  useEffect(() => {
    setHasAttachments(attachedFiles && attachedFiles.length > 0);
  }, [attachedFiles]);

  useEffect(() => {
    if (filesDialogOpen && formData.request_number) {
      refetchAttachedFiles();
    }
  }, [filesDialogOpen, formData.request_number, refetchAttachedFiles]);

  useEffect(() => {
 
  }, [hasAttachments]);
 

  // Update form data when user data loads
  useEffect(() => {
    if (currentUserEmployeeData && !data) {
      const employeeId = currentUserEmployeeData.EMPLOYEE_ID?.toString() || '';
      const employeeCode = currentUserEmployeeData.EMPLOYEE_CODE || '';
      const employeeName = currentUserEmployeeData.RPT_NAME || '';

      setFormData((prev: any) => ({
        ...prev,
        EMPLOYEE_ID: employeeId,
        employee_code: employeeCode,
        Employee_Name: employeeName,
        SUPERVISOR_EMPID: currentUserEmployeeData.SUPERVISOR_EMPID || '',
        DEPT_HEAD_EMPID: currentUserEmployeeData.DEPT_HEAD_EMPID || '',
        MANGR_EMPID: currentUserEmployeeData.MANGR_EMPID || ''
      }));
      setFormReady(true);

      // Fetch approver names
      fetchApproverNames(currentUserEmployeeData);

      // Fetch leave types for this employee
      fetchLeaveTypes(employeeId);
    }
  }, [currentUserEmployeeData]);
  useEffect(() => {
    if (data) {
      const employeeData = {
        SUPERVISOR_EMPID: data.IMMEDIATE_SUPERVISOR || '',
        DEPT_HEAD_EMPID: data.DEPT_HEAD || '',
        MANGR_EMPID: data.HOD || ''
      };
      fetchApproverNames(employeeData);
    }
  }, [data]);

  useEffect(() => {
    if (formData.EMPLOYEE_ID) {
      fetchLeaveTypes(formData.EMPLOYEE_ID);
    }
  }, [formData.EMPLOYEE_ID]);

  useEffect(() => {
    if (!data && newInsertedData) {
      console.log('TRAVEL_END_DATE:-----', newInsertedData.TRAVEL_END_DATE);
      console.log('Setting form data from newInsertedData', newInsertedData);
      setFormData({
        request_number: newInsertedData.REQUEST_NUMBER || '',
        request_date: newInsertedData.REQUEST_DATE || '',
        employee_code: newInsertedData.EMPLOYEE_CODE || '',
        leave_type: newInsertedData.LEAVE_TYPE || '',
        leave_type_desc: newInsertedData.LEAVE_TYPE_DESC || '',
        Employee_Name: newInsertedData.EMPLOYEE_NAME || '',
        leave_start_date: newInsertedData.LEAVE_START_DATE || '',
        leave_end_date: newInsertedData.LEAVE_END_DATE || '',
        resume_date: newInsertedData.RESUME_DATE || '',
        leave_days: newInsertedData.LEAVE_DAYS?.toString() || '',
        remarks: newInsertedData.REMARKS || '',
        company_code: user?.company_code || '',
        rpt_name: newInsertedData.EMPLOYEE_CODE || '',
        EMPLOYEE_ID: newInsertedData.EMPLOYEE_ID || newInsertedData.EMPLOYEE_CODE || '',
        SUPERVISOR_EMPID: newInsertedData.IMMEDIATE_SUPERVISOR || '',
        DEPT_HEAD_EMPID: newInsertedData.DEPT_HEAD || '',
        MANGR_EMPID: newInsertedData.HOD || '',
        contact_details_during_leave: newInsertedData.CONTACT_DETAILS_DURING_LEAVE || '',
        CONTACT_DETAILS_DURING_LEAVE: newInsertedData.CONTACT_DETAILS_DURING_LEAVE || '',
        NAME_OF_REPLACEMENT: newInsertedData.NAME_OF_REPLACEMENT || '',
        TRAVEL_DATE: newInsertedData.TRAVEL_DATE || '',
        TRAVEL_END_DATE: newInsertedData.TRAVEL_END_DATE || '',
        CAUSE_TYPE: newInsertedData.CAUSE_TYPE || '',
        ADV_PAYMENT: newInsertedData.ADV_PAYMENT || '',
        LEAVE_ALLOWANCE: newInsertedData.LEAVE_ALLOWANCE || '',
        is_half_day: newInsertedData.HALF_DAY || 'N',
        // Fix the comparison to handle 'Y'/'N' values
        resume_work: newInsertedData.RESUME_WORK || false,
        actual_resume_date: newInsertedData.ACTUAL_RESUME_DATE || '',
        DUTY_RESUME_DATE: newInsertedData.DUTY_RESUME_DATE || '',
        AIR_ROUTE: newInsertedData.AIR_ROUTE || '',
        AIR_TICKET: newInsertedData.AIR_TICKET || '',
        IMMEDIATE_SUPERVISOR_NAME: newInsertedData.IMMEDIATE_SUPERVISOR_NAME || '',
        HOD_NAME: newInsertedData.HOD_NAME || '',
        DEPT_HEAD_NAME: newInsertedData.DEPT_HEAD_NAME || ''
      });
      setFormReady(true);
    }
          console.log('Setting form data from props data', data);
    if (data) {
      console.log('Setting form data from props data', data);
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
        is_half_day: data.HALF_DAY || 'N',
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
      setFormReady(true);
    }
  }, [data, user?.company_code]);

  // useEffect(() => {
  //   console.log('employee_code', formData?.employee_code, user?.loginid);
  //   console.log('formData', formData)
  //   if (formData?.EMPLOYEE_ID === user?.loginid || formData?.employee_code === '') {
  //     setIsSameUser(true);
  //   }
  // }, [ user?.loginid]);

  const isSubmitDisabled = (): boolean => {
  const requiresAttachment = leaveTypesRequiringAttachments.includes(formData.leave_type);
  
    return viewMode || (requiresAttachment && !hasAttachments);
  };

  const handleViewLog = () => {
    setViewLogOpen(true);
  }
  const handleViewLogClose = () => {
    setViewLogOpen(false);
  }

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
        'Travel Start Date': formData.TRAVEL_DATE,
        'Travel End Date': formData.TRAVEL_END_DATE,
        'Name of Replacement': formData.NAME_OF_REPLACEMENT,
        'Immediate Supervisor': approverNames.SUPERVISOR_EMPID,
        'Department Head': approverNames.DEPT_HEAD_EMPID,
        HOD: approverNames.MANGR_EMPID,
        'Half Day': formData.is_half_day
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
      setSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'leaveExportSuccess' }) || 'Leave request exported successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: intl.formatMessage({ id: 'leaveExportFailed' }) || 'Failed to export leave request',
        severity: 'error'
      });
    }
  };

  const handleUploadPopup = () => {
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
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

  // const getMinSelectableDate = (): string => {
  //   const today = new Date();
  //   const currentDay = today.getDate();
  //   const currentMonth = today.getMonth();
  //   const currentYear = today.getFullYear();

  //   if (currentDay < 23) {
  //     let prevMonth = currentMonth - 1;
  //     let year = currentYear;

  //     if (prevMonth < 0) {
  //       prevMonth = 11;
  //       year = currentYear - 1;
  //     }

  //     return `${year}-${String(prevMonth + 1).padStart(2, '0')}-23`;
  //   }

  //   return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-23`;
  // };

  useEffect(() => {
    const fetchLeaveDays = async () => {

      if (formData.leave_start_date && formData.leave_end_date && formData.leave_type) {
        const start = parseCustomDate(formData.leave_start_date);
        const end = parseCustomDate(formData.leave_end_date);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          try {
            const result = await HrRequestServiceInstance.LeaveDaysCount({
              leaveStartDate: String(start),
              leaveEndDate: String(end),
              leaveType: formData.leave_type,
              companycode : String(user?.company_code)
            })
            setFormData((prev) => ({
              ...prev,
              leave_days: result?.leaveDays?.toString() || "",
            }));
          } catch (error) {
            console.error("Error calculating leave days:", error);
          }
        }
      }
    }
    fetchLeaveDays();
  }, [formData.leave_start_date, formData.leave_end_date,formData.leave_type]);

  const getEmployeeNameById = async (employeeId: string): Promise<string> => {
    console.log('getEmployeeNameById', employeeId);
    if (!employeeId) return '';

    try {
      const sql_string = `SELECT * FROM VW_HR_EMPLOYEE_AWARE WHERE EMPLOYEE_ID = '${employeeId}'`;
      const result = await HrServiceInstance.executeRawSql(sql_string);
      return result?.[0]?.RPT_NAME || ''; // Adjust field name as needed
    } catch (error) {
      console.error(`Error fetching employee name for ID ${employeeId}:`, error);
      return '';
    }
  };

  const fetchApproverNames = async (employeeData: ApproverIds | null) => {
    console.log('fetchApproverNames', employeeData);
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

    dispatch(openBackdrop());
    setLeaveTypesLoading(true);
    setLeaveTypesError('');

    try {
      // const sql = `SELECT * FROM VW_HR_EMP_LEAVE_ENTITLE_AWARE WHERE EMPLOYEE_ID = ${employeeId}`

      // const leaveHistory = await HrServiceInstance.executeRawSql(sql);
      
      const leaveHistory = await HrRequestServiceInstance.getLeaveHistory({ employeeId });
      const uniqueTypes = new Map<string, ILeaveType>();
      leaveHistory?.forEach((leave: any) => {
        if (leave.LEAVE_TYPE && leave.LEAVE_DESC) {
          if (!uniqueTypes.has(leave.LEAVE_TYPE)) {
            uniqueTypes.set(leave.LEAVE_TYPE, {
              value: leave.LEAVE_TYPE,
              label: leave.LEAVE_DESC
            });
          }
        }
      });

      let types = Array.from(uniqueTypes.values()).sort((a, b) => a.label.localeCompare(b.label));

      // If formData.leave_type is set but missing in types, add it
      if (formData.leave_type && !types.find((t) => t.value === formData.leave_type)) {
        // Optionally, add at the start or end with a placeholder label
        types = [{ value: formData.leave_type, label: formData.leave_type_desc || formData.leave_type }, ...types];
      }

      setLeaveTypes(types);
      dispatch(closeBackdrop());
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setLeaveTypesError('Failed to load leave types');
      setLeaveTypes([]);
    } finally {
      setLeaveTypesLoading(false);
      dispatch(closeBackdrop());
    }
  };

  const validateLeave = async () => {
    if (!formData.EMPLOYEE_ID) {
      dispatch(
        showAlert({
          severity: 'error',
          message: intl.formatMessage({ id: 'SelectEmployeeFirst' }) || 'Please select an employee first',
          open: true
        })
      );
      return;
    }

    if (!formData.leave_type || !formData.leave_start_date || !formData.leave_end_date) {
      dispatch(
        showAlert({
          severity: 'error',
          message:
            intl.formatMessage({ id: 'FillAllRequiredLeaveDetails' }) ||
            'Please fill all required leave details (Leave Type, Start Date, End Date)',
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
          message: intl.formatMessage({ id: 'LeaveDaysMustBeGreaterThanZero' }) || 'Leave days must be greater than zero',
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

      console.log('validate result', result);

      setValidationResult(result);

      let isValid = result.success && result.isValid;
      let message = result.message || 'Leave validation passed!';
      let severity: 'success' | 'error' = 'success';

      if (result.availableBalance !== undefined && result.availableBalance < requestedDays) {
        isValid = false;
        severity = 'error';
        message = intl.formatMessage(
          {
            id: 'InsufficientLeaveBalance',
            defaultMessage: 'Insufficient leave balance. Available: {available} days, Requested: {requested} days'
          },
          {
            available: result.availableBalance,
            requested: requestedDays
          }
        );
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
          message: intl.formatMessage({ id: 'FailedToValidateLeaveRequest' }) || 'Failed to validate leave request',
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

      if (!request_date) errors.push(intl.formatMessage({ id: 'RequestDateRequired', defaultMessage: 'Request Date is required.' }));

      if (!EMPLOYEE_ID) errors.push(intl.formatMessage({ id: 'EmployeeCodeRequired', defaultMessage: 'Employee Code is required.' }));

      if (!leave_type) errors.push(intl.formatMessage({ id: 'LeaveTypeRequired', defaultMessage: 'Leave Type is required.' }));

      if (!leave_start_date)
        errors.push(intl.formatMessage({ id: 'LeaveStartDateRequired', defaultMessage: 'Leave Start Date is required.' }));

      if (!leave_end_date) errors.push(intl.formatMessage({ id: 'LeaveEndDateRequired', defaultMessage: 'Leave End Date is required.' }));

      if (!remarks) errors.push(intl.formatMessage({ id: 'RemarksRequired', defaultMessage: 'Remarks are required.' }));
      //  if (!actual_resume_date) errors.push('Actual Resume Date is required.');
      // if (!DUTY_RESUME_DATE) errors.push('Duty Resume Date is required.');
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

    if (actionType === 'SENTBACK') {
      payload = {
        ...payload,
        SENTBACK_HISTORY: sentBackParams?.SENTBACK_HISTORY || '',
        NEXT_ACTION_BY: sentBackParams?.LOGIN_ID || ''
      } as typeof payload & { NEXT_ACTION_BY: string };
    }
    if (actionType === 'REJECTED') {
      payload = {
        ...payload,
        CANCEL_REMARK: rejectParams?.CANCEL_REMARK || ''
      } as typeof payload & { CANCEL_REMARK: string };
    }

    console.log('Payload for Save:', payload);

    //Generate and assign UUID for new draft requests
    if (payload.REQUEST_NUMBER === '' && actionType === 'SAVEASDRAFT') {
      uuidRef.current = uuidv4();
      console.log('uniqueId', uuidRef.current);
      payload = {
        ...payload,
        UUID: uuidRef.current
      } as typeof payload & { UUID: string };
    }

    const result = await dispatch(hrapprovalInstance.upsertLeaveApprovalManualHandler(payload));

    if (result) {
      if (payload.REQUEST_NUMBER === '' && actionType === 'SAVEASDRAFT') {
        try {
          const insertedData = await getInsertedData(uuidRef.current || '');
          localStorage.setItem('realRequestNumber', insertedData.REQUEST_NUMBER || '');
          setNewInsertedData(insertedData);
          // refetchnewInsertedData();
          console.log('Inserted Data after Save as Draft:', newInsertedData);
        } catch (err) {
          console.error('Error fetching inserted data:', err);
        }
      }

      onSuccess?.();
      // if (actionType !== 'SAVEASDRAFT') {
        onClose?.();
      // }
      setViewAttachments(true);
      dispatch(closeBackdrop());
    } else {
      dispatch(closeBackdrop());
      dispatch(
        showAlert({
          severity: 'error',
          message: intl.formatMessage({ id: 'LeaveSaveError' }) || 'An error occurred while saving the leave request.',
          open: true
        })
      );
    }
  };

  const handleSentBackPopupClose = () => {
    setSentBackPopup((prev) => ({ ...prev, open: false }));
  };

  // Print handler
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
  
  const refreshAttachments = async () => {
    if (formData.request_number || newInsertedData?.REQUEST_NUMBER) {
      await refetchAttachedFiles();
    }
  };

  // Update the filesDialogOpen useEffect
  useEffect(() => {
    if (filesDialogOpen) {
      refreshAttachments();
    }
  }, [filesDialogOpen, formData.request_number, newInsertedData?.REQUEST_NUMBER]);

  if (!formReady) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6"> {intl.formatMessage({ id: 'Loading' }) || 'Loading...'}</Typography>
      </Box>
    );
  }

  const RequestNumberExist = formData.request_number !== '' && formData.request_number !== null && formData.request_number !== undefined;

  // Add this function to handle employee selection
  const handleEmployeeChange = (event: any, value: IHrEmployee | null) => {
    if (value) {
      setFormData((prev) => ({
        ...prev,
        employee_code: value.EMPLOYEE_CODE || '',
        Employee_Name: value.RPT_NAME || '',
        EMPLOYEE_ID: value.EMPLOYEE_ID?.toString() || value.EMPLOYEE_CODE || '',
        rpt_name: value.RPT_NAME || '',
        SUPERVISOR_EMPID: value.SUPERVISOR_EMPID || '',
        DEPT_HEAD_EMPID: value.DEPT_HEAD_EMPID || '',
        MANGR_EMPID: value.MANGR_EMPID || ''
      }));

      // Fetch approver names for the selected employee
      fetchApproverNames(value);

      // Fetch leave types for the selected employee
      if (value.EMPLOYEE_ID || value.EMPLOYEE_CODE) {
        fetchLeaveTypes(value.EMPLOYEE_ID?.toString() || value.EMPLOYEE_CODE || '');
      }
    } else {
      // Reset employee-related fields
      setFormData((prev) => ({
        ...prev,
        employee_code: '',
        Employee_Name: '',
        EMPLOYEE_ID: '',
        rpt_name: '',
        SUPERVISOR_EMPID: '',
        DEPT_HEAD_EMPID: '',
        MANGR_EMPID: ''
      }));
    }
  };

  const isRequestNumber = formData.request_number != '' || formData.request_number != null || formData.request_number != undefined;
  console.log('showCancel', isRequestNumber);

  const isSupervisor = Boolean(currentSupervisorEmployeeData && currentSupervisorEmployeeData?.length > 0);
  console.log('isSupervisor', isSupervisor);

  //Conditionally Render Buttons Based on View Mode and User Role
  const CreateMode = formData.request_number === '' || formData.request_number === null || formData.request_number === undefined;

  const isCreator =
    data?.CREATED_BY === user?.loginid1 || data?.CREATED_BY === undefined || data?.CREATED_BY === null || data?.CREATED_BY === '';
  console.log('isCreator', data?.CREATED_BY, user?.loginid1);
  const readOnly =
    data?.CREATED_BY === user?.loginid1 || data?.CREATED_BY === '' || data?.CREATED_BY === null || data?.CREATED_BY === undefined;

  return (
    <div className="max-w-7xl mx-auto">
      <CustomAlert />

      <div className="mt-2 space-y-2">
        {/* <!-- Header Section --> */}
        {(formData.request_number || newInsertedData?.REQUEST_NUMBER) && (
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-md font-medium text-gray-800 mb-3">
                {intl.formatMessage({ id: 'Leave Request Number' })}{' '}
                {formData.request_number ? formData.request_number : newInsertedData?.REQUEST_NUMBER || ''}
              </h2>
            </div>
            <div className="border-b border-gray-300 mt-2"></div>
          </div>
        )}

        {/* <!-- Basic Information --> */}
        <div>
          {/* <h3 className="text-md font-medium text-gray-700 mb-3">{intl.formatMessage({ id: 'Basic Information' })}</h3> */}

          <div className="flex flex-col gap-2 items-start ">
            {/* Employee Code and Name - Display as text */}
            <div>
              {/* <label className="block text-md font-medium text-gray-700 mb-3">{intl.formatMessage({ id: 'EmployeeCodeAndName' })}</label> */}

              <div className="flex items-center">
                <span className="text-lg font-medium text-gray-800">
                  {data?.EMPLOYEE_NAME_DISPLAY ? ` ${data.EMPLOYEE_NAME_DISPLAY}` : `${user?.loginid} - ${formData.Employee_Name}` || ''}
                </span>

              </div>
              {currentSupervisorEmployeeData && currentSupervisorEmployeeData.length > 0 && !isEditMode && (
                <Autocomplete
                  id="employee"
                  value={
                    currentSupervisorEmployeeData?.find(
                      (employee: IHrEmployee) =>
                        employee.EMPLOYEE_CODE === formData.employee_code || employee.EMPLOYEE_ID?.toString() === formData.EMPLOYEE_ID
                    ) || null
                  }
                  onChange={handleEmployeeChange}
                  size="medium"
                  options={currentSupervisorEmployeeData || []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option: IHrEmployee) => (option ? `${option.EMPLOYEE_CODE} - ${option.RPT_NAME}` : '')}
                  isOptionEqualToValue={(option: IHrEmployee, value: IHrEmployee) =>
                    option.EMPLOYEE_CODE === value?.EMPLOYEE_CODE || option.EMPLOYEE_ID === value?.EMPLOYEE_ID
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={intl.formatMessage({ id: 'Employee' })}
                      margin="dense"
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        ...params.InputProps,
                        readOnly: viewMode
                      }}
                    />
                  )}
                  readOnly={viewMode}
                  disabled={viewMode}
                />
              )}
            </div>

            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={intl.formatMessage({ id: 'Request Date' })}
                  value={formData.request_date ? dayjs(formData.request_date) : dayjs()}
                  // onChange={(newValue) => handleChange('request_date', newValue)}
                  format="DD/MM/YYYY"
                  readOnly={true}
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

              {data?.ACTUAL_RESUME_DATE && data.ACTUAL_RESUME_DATE !== '0000-00-00' && data.ACTUAL_RESUME_DATE.trim() !== '' && (
                <div className="flex flex-col p-4 mt-2 border-2 rounded">
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
              )}
            </div>
          </div>
          <div className="border-b border-gray-300 mt-4"></div>
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
                      Available Leaves : {validationResult.availableBalance}
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
                    readOnly={!readOnly || viewMode}
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
                  readOnly={!readOnly || viewMode}
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
                  minDate={formData.leave_start_date ? dayjs(formData.leave_start_date) : undefined}
                  format="DD/MM/YYYY"
                  readOnly={!readOnly || viewMode}
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
                  disabled={validationLoading || !formData.EMPLOYEE_ID || !formData.leave_type || !readOnly || viewMode}
                  control={
                    <Checkbox
                      checked={formData.is_half_day === 'Y'}
                      onChange={(e) => handleChange('is_half_day', e.target.checked ? 'Y' : 'N')}
                    />
                  }
                  label={intl.formatMessage({ id: 'Half Day' }) || 'Half Day'}
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
                  // !formData.leave_start_date ||
                  // !formData.leave_end_date ||
                  // !readOnly ||
                  viewMode
                }
                className="whitespace-nowrap min-w-auto px-3 text-sm"
              >
                {validationLoading
                  ? intl.formatMessage({ id: 'Validating' }) || 'Validating...'
                  : intl.formatMessage({ id: 'Validate' }) || 'Validate'}
              </Button>
            </div>
            {leaveTypesRequiringAttachments.includes(formData.leave_type) && (
            <div className="mt-2 felx items-center w-64 shrink">
              <Alert severity={hasAttachments ? "success" : "warning"} sx={{ py: 0.5 }}>
                {hasAttachments 
                  ? intl.formatMessage({ id: 'Attachments Added' }) || '✓ Attachments added successfully'
                  : intl.formatMessage({ id: 'Attachments Required' }) || '⚠️ Attachments required for this leave type'
                }
              </Alert>
            </div>
          )}
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
                    readOnly: !readOnly || viewMode
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
                    readOnly: !readOnly || viewMode
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
                    readOnly: !readOnly || viewMode
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
                  readOnly: !readOnly || viewMode
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
                  readOnly: !readOnly || viewMode
                }}
              />
            </div>
          </div>

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

              <FormControl fullWidth size="small" margin="dense">
                <InputLabel>{intl.formatMessage({ id: 'Air Ticket' }) || 'Air Ticket'}</InputLabel>
                <Select
                  value={formData.AIR_TICKET}
                  onChange={(e) => handleChange('AIR_TICKET', e.target.value)}
                  label="Air Ticket"
                  inputProps={{
                    readOnly: !readOnly || viewMode
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

              <div className="grid grid-cols-2 gap-4 ">
                {/* <div > */}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={intl.formatMessage({ id: 'Travel Start Date' })}
                    value={formData.TRAVEL_DATE ? dayjs(formData.TRAVEL_DATE) : null}
                    onChange={(newValue) => handleChange('TRAVEL_DATE', newValue)}
                    format="DD/MM/YYYY"
                    readOnly={!readOnly || viewMode}
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
                    readOnly={!readOnly || viewMode}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        margin: 'dense'
                      }
                    }}
                  />
                </LocalizationProvider>
              </div>

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
                  readOnly: !readOnly || viewMode
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
              {(isCreator || CreateMode) && (
                <Button type="button" size="small" endIcon={<FaSave />} onClick={() => handleSave('SAVEASDRAFT')} disabled={disableButtons || RequestNumberExist}>
                  {intl.formatMessage({ id: 'Save as Draft' }) || 'Save as Draft'}
                </Button>
              )}
              {isCreator ? (
                <Button
                  type="button"
                  size="small"
                  endIcon={<IoSendSharp />}
                  onClick={() => handleSave('SUBMITTED')}
                  disabled={disableButtons || isSubmitDisabled()}
                      title={
                      isSubmitDisabled() && leaveTypesRequiringAttachments.includes(formData.leave_type) && !hasAttachments
                        ? intl.formatMessage({ id: 'AttachmentsRequired' }) || 'Please attach files before submitting'
                        : ''
                    }
                >
                  {intl.formatMessage({ id: 'Submit' }) || 'Submit'}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="small"
                  endIcon={<IoSendSharp />}
                  onClick={() => handleSave('SUBMITTED')}
                  disabled={disableButtons || isSubmitDisabled()}
                >
                  {intl.formatMessage({ id: 'Approve' }) || 'Approve'}
                </Button>
              )}

              {!CreateMode && (
                <>
                  {((isCreator && !data?.ACTUAL_RESUME_DATE) || viewAttachments) && (
                    <Button
                      type="button"
                      size="small"
                      endIcon={<MdCancelScheduleSend />}
                      onClick={() => handleSave('CANCEL')}
                      disabled={disableButtons}
                    >
                      {intl.formatMessage({ id: 'Cancel' }) || 'Cancel'}
                    </Button>
                  )}

                  {!isCreator && (
                    <>
                      <Button
                        type="button"
                        size="small"
                        endIcon={<MdCancelScheduleSend />}
                        onClick={(e) => {
                          console.log('Reject button clicked');
                          e.preventDefault();
                          setLeaveReject(true);
                        }}
                        disabled={disableButtons}
                      >
                        {intl.formatMessage({ id: 'Reject' }) || 'Reject'}
                      </Button>
                      <Button
                        type="button"
                        size="small"
                        endIcon={<MdCancelScheduleSend />}
                        onClick={(e) => {
                          console.log('Send Back button clicked');
                          e.preventDefault();
                          setLeaveSentBack(true);
                        }}
                        disabled={disableButtons}
                      >
                        {intl.formatMessage({ id: 'Send Back' }) || 'Send Back'}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Tooltip title={intl.formatMessage({ id: 'View Log' }) || 'View Log'}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleViewLog}
                  size="small"
                >
                  <FaHistory />
                </Button>
              </Tooltip>

              <Tooltip title={intl.formatMessage({ id: 'Export Leave Request' }) || 'Export Leave Request'}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClick={handleExport}
                  //  disabled={!isEditMode || disableButtons}
                  size="small"
                >
                  <FaFileExport />
                </Button>
              </Tooltip>

              <Tooltip title={intl.formatMessage({ id: 'Print Leave Request Form' }) || 'Print Leave Request Form'}>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClick={handlePrint}
                  // disabled={!isEditMode || disableButtons}
                  size="small"
                >
                  <IoPrintSharp />
                </Button>
              </Tooltip>

              {(viewAttachments || formData.request_number || newInsertedData?.REQUEST_NUMBER) && (
                <Tooltip title={intl.formatMessage({ id: 'Attach & View' }) || 'Attach & View'}>
                  <Button
                    type="button"
                    onClick={() => setFilesDialogOpen(true)}
                    variant="outlined"
                    color="primary"
                    // disabled={!isEditMode || disableButtons}
                    size="small"
                  >
                    <IoIosAttach />
                  </Button>
                </Tooltip>
              )}
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

      {/* VIEW LOG DIALOG */}
      {viewLogOpen && (
        <Dialog
          fullScreen
          open={viewLogOpen}
          onClose={handleViewLogClose}

        >
                    <div className='flex justify-between items-center bg-[#082a89] p-2'>
            <Button onClick={handleViewLogClose} className='text-white'>
              Close
            </Button>
            <div className='text-white text-center flex-1'>
              <span className='text-xl font-bold'>
                Log Report 
              </span>
            </div>
            <div className='w-12'></div> {/* Spacer to balance the Close button */}
          </div>
        
          <LogReport logData={logData} />
        </Dialog>   
      )}

      {/* SEND BACK */}
      <DialogPop open={leaveSentBack} onClose={() => setLeaveSentBack(false)} title={'Send Back Request'} width={500}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
          {/* Uncomment and fix Autocomplete if needed */}
          {userFlowData && (
            <Autocomplete
              id="userflow"
              value={
                sentBackParams.LOGIN_ID
                  ? (Array.isArray(userFlowData)
                    ? userFlowData.find((user: any) => user.LOGIN_ID === sentBackParams.LOGIN_ID)
                    : userFlowData) || null
                  : null
              }
              onChange={(event, newValue: any) => {
                if (newValue) {
                  setSentBackParams((prev: any) => ({
                    ...prev,
                    LOGIN_ID: newValue.LOGIN_ID || '',
                    USERNAME: newValue.USERNAME || ''
                  }));
                }
              }}
              size="medium"
              options={Array.isArray(userFlowData) ? userFlowData : [userFlowData].filter(Boolean)}
              fullWidth
              autoHighlight
              getOptionLabel={(option: any) => (option ? `${option.LOGIN_ID} - ${option.USERNAME}` : '')}
              isOptionEqualToValue={(option: any, value: any) => option.LOGIN_ID === value?.LOGIN_ID}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={intl.formatMessage({ id: 'Employee' })}
                  margin="dense"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={2}
            label={intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}
            size="small"
            margin="dense"
            required
            value={sentBackParams?.SENTBACK_HISTORY || ''}
            onChange={(e) =>
              setSentBackParams((prev: any) => ({
                ...prev,
                SENTBACK_HISTORY: e.target.value
              }))
            }
          />

          <Button
            type="button"
            variant="contained"
            size="small"
            endIcon={<MdCancelScheduleSend />}
            onClick={() => handleSave('SENTBACK')}
            disabled={!sentBackParams.LOGIN_ID || !sentBackParams.SENTBACK_HISTORY}
            sx={{ alignSelf: 'flex-start' }}
          >
            {intl.formatMessage({ id: 'Send Back' }) || 'Send Back'}
          </Button>
        </Box>
      </DialogPop>

      {/* REJECT */}
      <DialogPop
        open={leaveReject}
        onClose={() => setLeaveReject(false)}
        title={'Reject Request'}
        width={500}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label={intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}
            size="small"
            margin="dense"
            required
            value={rejectParams?.CANCEL_REMARK || ''}
            onChange={(e) => setRejectParams((prev: any) => ({
              ...prev,
              CANCEL_REMARK: e.target.value
            }))}
          />

          <Button
            variant="contained"
            color="error"
            size="small"
            endIcon={<MdCancelScheduleSend />}
            onClick={() => handleSave('REJECTED')}
            disabled={!rejectParams.CANCEL_REMARK}
            sx={{ alignSelf: 'flex-start' }}
          >
            {intl.formatMessage({ id: 'Reject' }) || 'Reject'}
          </Button>
        </Box>
      </DialogPop>

      {/* Report dialog */}
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
            <Typography> {intl.formatMessage({ id: 'NoReportSelected' }) || 'No report selected'}</Typography>
          )}
        </UniversalDialog>
      )}

      {uploadFilesPopup && uploadFilesPopup.action.open && (
        <UniversalDialog
          action={{ ...uploadFilesPopup.action }}
          onClose={handleUploadPopup}
          title={uploadFilesPopup.title}
          hasPrimaryButton={false}
        >
          <HRLeaveFilesDialog requestNumber={formData.request_number} isViewMode={!isEditMode} onClose={() => setFilesDialogOpen(false)} />
        </UniversalDialog>
      )}

      {filesDialogOpen && (
        <HRLeaveFilesDialog
          LeavePage={LeavePage}
          requestNumber={formData.request_number || newInsertedData?.REQUEST_NUMBER || ''}
          isViewMode={Boolean(!isEditMode || viewMode)}
        onClose={() => {
          setFilesDialogOpen(false);
          refreshAttachments();
        }}
        />
      )}
    </div>
  );
};

export default AddLeaveApprovalForm;
