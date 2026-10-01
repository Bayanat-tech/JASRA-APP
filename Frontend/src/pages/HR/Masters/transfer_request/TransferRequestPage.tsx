import { CalendarOutlined, LoadingOutlined, PlusOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons'; // CHANGED
import {
  Autocomplete,
  Button,
  FormHelperText,
  Grid,
  IconButton, // CHANGED
  InputAdornment, // CHANGED
  InputLabel,
  TextField as MuiTextField,
  Tabs,
  Tab,
  useTheme,
  Breadcrumbs,
  Link,
  Typography
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import UniversalDialog from 'components/popup/UniversalDialog';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'; // CHANGED
import { useIntl } from 'react-intl';
import axiosServices from 'utils/axios';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import common from '../../../../service/Attendance/common_service';
import HrRequestServiceInstance, { IHrEmployee } from 'service/services.hr';
import CustomAgGrid from 'components/grid/CustomAgGrid';

// =====================================================================================
// TYPES
// =====================================================================================
type TTransferLastAction = 'SAVEASDRAFT' | 'SUBMITTED' | 'REJECT' | 'SENTBACK';

type TTransferRequest = {
  request_number?: string;
  request_date?: string | Date;
  company_code?: string;
  loginid?: string;
  created_by?: string;
  reason_for_trnsfer: string;
  next_action_by?: string;
  reson_for_rejection?: string;
  employee_code: string;
  created_at?: string | Date;
  updated_by?: string;
  updated_at?: string | Date;
  last_action?: TTransferLastAction;
  current_supervisor_empcode?: string;
  transfer_to_supervisor_empcode: string;
  data_transfer?: string;
  final_approved?: string;
  flow_level_running?: number;
  transfer_wef?: string | Date;
};

type TSupervisorDropdownOption = {
  employee_code: string;
  rpt_name: string;
};

// =====================================================================================
// SERVICE
// =====================================================================================
const TransferRequestServiceInstance = {
  getTransferRequestsByTab: async (
    parameter:
      | 'TRANSFER_REQUEST_PENDING'
      | 'TRANSFER_REQUEST_IN_PROGRESS'
      | 'TRANSFER_REQUEST_CLOSED'
      | 'TRANSFER_REQUEST_REJECT'
      | 'TRANSFER_REQUEST_SENTBACK',
    company_code: string,
    loginid: string
  ): Promise<TTransferRequest[]> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter,
      loginid,
      code1: company_code
    });
    return data || [];
  },

  getTransferToSupervisorOptions: async (company_code: string): Promise<TSupervisorDropdownOption[]> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_TRANSFER_TO_SUPERVISIOR_DROP_DOWN',
      code1: company_code
    });
    return data || [];
  },

  getSupervisorEmployeesDetails: async (loginid: string, employeeCode: string): Promise<any> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_SUPERVISIOR_DETAIL',
      loginid,
      code1: employeeCode
    });
    return data || [];
  },

  getEmployee: async (loginid: string): Promise<any> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_TRANSFER_TO_SUPERVISIOR_DROP_DOWN',
      loginid
    });
    return data || [];
  },

  upsertTransferRequest: async (values: TTransferRequest) => {
    try {
      const response = await axiosServices.post('/api/hr/transfer_request_flow', values);
      return response.data?.success ? response.data : null;
    } catch (error: unknown) {
      console.error('Error saving transfer request:', (error as { message: string }).message);
      return null;
    }
  },

  isLevel2Approver: async (loginid: string): Promise<boolean> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_LEVEL_2_USERS',
      loginid
    });
    return Array.isArray(data) && data.length > 0;
  }
};

// =====================================================================================
// FORM
// =====================================================================================
type TSupervisorDetail = {
  EMPLOYEE_CODE?: string;
  RPT_NAME?: string;
  DEPT_HEAD_EMP_CODE?: string;
  DEPT_HEAD_NAME?: string;
  SUPERVISOR_EMP_CODE?: string;
  SUPERVISOR_NAME?: string;
  ENGINEER_EMP_CODE?: string;
  ENGINEER_NAME?: string;
  employee_code?: string;
  DIVISION?: string;
  DEPARTMENT?: string;
  rpt_name?: string;
  dept_head_emp_code?: string;
  dept_head_name?: string;
  supervisor_emp_code?: string;
  supervisor_name?: string;
  engineer_emp_code?: string;
  engineer_name?: string;
  division?: string;
  department?: string;
};

const formatDateForDisplay = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AddTransferRequestForm = ({
  onClose,
  isEditMode,
  existingData,
  disableActions,
  viewOnly = false
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TTransferRequest;
  disableActions?: boolean;
  viewOnly?: boolean;
}) => {
  const { user } = useAuth();
  console.log('user', user);
  const flowLevel = existingData?.flow_level_running ?? 1;
  const isLevel2 = flowLevel === 2;
  const isFieldDisabled = isLevel2 || viewOnly;

  // CHANGED: ref to the hidden native date input used only for the picker popup
  const wefPickerRef = useRef<HTMLInputElement>(null);

  const toDateInputValue = (date?: string | Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const formik = useFormik<TTransferRequest>({
    initialValues: {
      request_number: '',
      request_date: new Date().toISOString().slice(0, 10),
      employee_code: '',
      transfer_to_supervisor_empcode: '',
      reason_for_trnsfer: '',
      reson_for_rejection: '',
      transfer_wef: '',
      current_supervisor_empcode: '',
      last_action: 'SAVEASDRAFT',
      flow_level_running: 1,
      company_code: user?.company_code
      // created_by_rpt_name: user?.login_name,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Submitting with action:', values.last_action);
        const payload: TTransferRequest = {
          ...values,
          company_code: user?.company_code,
          loginid: user?.user_id,
          created_by: values.created_by || user?.user_id,
          updated_by: user?.user_id,
          request_number: values.request_number ? values.request_number : undefined
        };
        const response = await TransferRequestServiceInstance.upsertTransferRequest(payload);
        if (response) {
          onClose(true);
        }
      } catch (err) {
        console.error('Submit error:', err);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { data: currentSupervisorEmployeeData } = useQuery({
    queryKey: ['currentSupervisorEmployeeData', user?.loginid1],
    queryFn: async () => {
      if (!user?.loginid1) return null;
      try {
        const data = await TransferRequestServiceInstance.getEmployee(user.loginid1);
        return data || [];
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  const { data: transferToSupervisorOptions } = useQuery<TSupervisorDropdownOption[]>({
    queryKey: ['transferToSupervisorOptions', user?.company_code],
    queryFn: () => TransferRequestServiceInstance.getTransferToSupervisorOptions(user?.company_code || ''),
    enabled: !!user?.company_code
  });

  const selectedSupervisorCode = formik.values.transfer_to_supervisor_empcode;

  const { data: supervisorDetailRaw, isFetching: isSupervisorDetailLoading } = useQuery({
    queryKey: ['supervisorDetail', selectedSupervisorCode],
    queryFn: async () => {
      if (!selectedSupervisorCode || !user?.loginid1) return null;
      const data = await TransferRequestServiceInstance.getSupervisorEmployeesDetails(user.loginid1, selectedSupervisorCode);
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!selectedSupervisorCode && !!user?.loginid1,
    retry: false
  });

  const supervisorDetail = supervisorDetailRaw as TSupervisorDetail | null | undefined;
  const employeeOptions = useMemo(() => currentSupervisorEmployeeData || [], [currentSupervisorEmployeeData]);

  useEffect(() => {
    if (isEditMode && existingData) {
      formik.setValues({
        ...existingData,
        request_date: toDateInputValue(existingData.request_date),
        transfer_wef: toDateInputValue(existingData.transfer_wef),
        last_action: existingData.last_action || 'SAVEASDRAFT'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]);

  const handleAction = async (action: TTransferLastAction) => {
    await formik.setFieldValue('last_action', action, false);
    formik.handleSubmit();
  };

  const handleSaveAsDraft = () => handleAction('SAVEASDRAFT');
  const handleSubmitRequest = () => handleAction('SUBMITTED');
  // const handleReject = () => handleAction('REJECT');
  // const handleSentBack = () => handleAction('SENTBACK');

  // CHANGED: opens the hidden native date picker
  const openWefPicker = () => {
    if (isFieldDisabled) return;
    const el = wefPickerRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === 'function') {
      try {
        (el as any).showPicker();
        return;
      } catch {
        // fall through to focus/click
      }
    }
    el.focus();
    el.click();
  };

  const getDetail = (upperKey: keyof TSupervisorDetail, lowerKey: keyof TSupervisorDetail) =>
    supervisorDetail?.[upperKey] || supervisorDetail?.[lowerKey] || '-';

  return (
    <Grid container spacing={2} component={'form'} onSubmit={(e) => e.preventDefault()}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Request Number</InputLabel>
        <MuiTextField value={formik.values.request_number || ''} name="request_number" fullWidth disabled />
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Request Date</InputLabel>
        <MuiTextField
          type="text"
          value={formatDateForDisplay(formik.values.request_date)}
          name="request_date"
          fullWidth
          disabled
        />
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Select Employee*</InputLabel>
        <Autocomplete
          options={employeeOptions}
          getOptionLabel={(option: any) => option?.rpt_name || option?.employee_name || ''}
          isOptionEqualToValue={(option: any, value: any) => option?.employee_code === value?.employee_code}
          value={employeeOptions.find((emp: any) => emp.employee_code === formik.values.employee_code) || null}
          onChange={(_, newValue: any) => {
            formik.setFieldValue('employee_code', newValue?.employee_code || '');
            formik.setFieldValue('current_supervisor_empcode', newValue?.curr_supervisor_code || '');
          }}
          disabled={isFieldDisabled}
          renderInput={(params) => (
            <MuiTextField
              {...params}
              error={Boolean(getIn(formik.touched, 'employee_code') && getIn(formik.errors, 'employee_code'))}
            />
          )}
        />
        {getIn(formik.touched, 'employee_code') && getIn(formik.errors, 'employee_code') && (
          <FormHelperText error>{getIn(formik.errors, 'employee_code')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Transfer to Supervisor*</InputLabel>
        <Autocomplete
          options={transferToSupervisorOptions || []}
          getOptionLabel={(option: TSupervisorDropdownOption) => option?.rpt_name || ''}
          isOptionEqualToValue={(option: TSupervisorDropdownOption, value: any) => option?.employee_code === value?.employee_code}
          value={
            (transferToSupervisorOptions || []).find((sup) => sup.employee_code === formik.values.transfer_to_supervisor_empcode) || null
          }
          onChange={(_, newValue) => {
            formik.setFieldValue('transfer_to_supervisor_empcode', newValue?.employee_code || '');
          }}
          disabled={isFieldDisabled}
          renderInput={(params) => (
            <MuiTextField
              {...params}
              error={Boolean(
                getIn(formik.touched, 'transfer_to_supervisor_empcode') && getIn(formik.errors, 'transfer_to_supervisor_empcode')
              )}
            />
          )}
        />
        {getIn(formik.touched, 'transfer_to_supervisor_empcode') && getIn(formik.errors, 'transfer_to_supervisor_empcode') && (
          <FormHelperText error>{getIn(formik.errors, 'transfer_to_supervisor_empcode')}</FormHelperText>
        )}
      </Grid>

      {selectedSupervisorCode && (
        <Grid item xs={12}>
          <InputLabel sx={{ mb: 1 }}>Supervisor Details</InputLabel>
          {isSupervisorDetailLoading ? (
            <MuiTextField value="Loading..." fullWidth disabled />
          ) : supervisorDetail ? (
            <Grid container spacing={2} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Employee Code</InputLabel>
                <MuiTextField value={getDetail('EMPLOYEE_CODE', 'employee_code')} fullWidth disabled size="small" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Name</InputLabel>
                <MuiTextField value={getDetail('RPT_NAME', 'rpt_name')} fullWidth disabled size="small" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Dept Head</InputLabel>
                <MuiTextField
                  value={`${getDetail('DEPT_HEAD_NAME', 'dept_head_name')} (${getDetail('DEPT_HEAD_EMP_CODE', 'dept_head_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Supervisor</InputLabel>
                <MuiTextField
                  value={`${getDetail('SUPERVISOR_NAME', 'supervisor_name')} (${getDetail('SUPERVISOR_EMP_CODE', 'supervisor_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Engineer</InputLabel>
                <MuiTextField
                  value={`${getDetail('ENGINEER_NAME', 'engineer_name')} (${getDetail('ENGINEER_EMP_CODE', 'engineer_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Division</InputLabel>
                <MuiTextField
                  value={`${getDetail('DIVISION', 'division')} (${getDetail('ENGINEER_EMP_CODE', 'engineer_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <InputLabel shrink>Department</InputLabel>
                <MuiTextField
                  value={`${getDetail('DEPARTMENT', 'department')} (${getDetail('ENGINEER_EMP_CODE', 'engineer_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
            </Grid>
          ) : (
            <MuiTextField value="No details found" fullWidth disabled />
          )}
        </Grid>
      )}

      <Grid item xs={12}>
        <InputLabel>Reason for Transfer</InputLabel>
        <MuiTextField
          value={formik.values.reason_for_trnsfer || ''}
          name="reason_for_trnsfer"
          onChange={formik.handleChange}
          fullWidth
          multiline
          minRows={2}
          disabled={isFieldDisabled}
          error={Boolean(getIn(formik.touched, 'reason_for_trnsfer') && getIn(formik.errors, 'reason_for_trnsfer'))}
        />
        {getIn(formik.touched, 'reason_for_trnsfer') && getIn(formik.errors, 'reason_for_trnsfer') && (
          <FormHelperText error>{getIn(formik.errors, 'reason_for_trnsfer')}</FormHelperText>
        )}
      </Grid>

      {/* CHANGED: Transfer W.E.F. — displays dd/mm/yyyy, stores YYYY-MM-DD in formik (backend unchanged) */}
      <Grid item xs={12} sm={3} sx={{ position: 'relative' }}>
        <InputLabel>Transfer W.E.F.</InputLabel>

        {/* Visible field: display only, formatted dd/mm/yyyy */}
        <MuiTextField
          type="text"
          value={formatDateForDisplay(formik.values.transfer_wef)}
          placeholder="dd/mm/yyyy"
          fullWidth
          disabled={isFieldDisabled}
          onClick={openWefPicker}
          inputProps={{ readOnly: true, style: { cursor: isFieldDisabled ? 'default' : 'pointer' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={openWefPicker} disabled={isFieldDisabled} size="small">
                  <CalendarOutlined />
                </IconButton>
              </InputAdornment>
            )
          }}
          error={Boolean(getIn(formik.touched, 'transfer_wef') && getIn(formik.errors, 'transfer_wef'))}
        />

        {/* Hidden native date input: only used to open the picker; value stays YYYY-MM-DD */}
        <input
          ref={wefPickerRef}
          type="date"
          name="transfer_wef"
          value={formik.values.transfer_wef ? String(formik.values.transfer_wef) : ''}
          min={formik.values.request_date ? String(formik.values.request_date) : undefined}
          onChange={formik.handleChange}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 0,
            opacity: 0,
            border: 0,
            padding: 0,
            pointerEvents: 'none'
          }}
        />
        {getIn(formik.touched, 'transfer_wef') && getIn(formik.errors, 'transfer_wef') && (
          <FormHelperText error>{getIn(formik.errors, 'transfer_wef')}</FormHelperText>
        )}
      </Grid>

      {isLevel2 && (
        <Grid item xs={12}>
          <InputLabel>Reason for Rejection</InputLabel>
          <MuiTextField
            value={formik.values.reson_for_rejection || ''}
            name="reson_for_rejection"
            onChange={formik.handleChange}
            fullWidth
            multiline
            minRows={2}
            disabled={viewOnly}
            error={Boolean(getIn(formik.touched, 'reson_for_rejection') && getIn(formik.errors, 'reson_for_rejection'))}
          />
          {getIn(formik.touched, 'reson_for_rejection') && getIn(formik.errors, 'reson_for_rejection') && (
            <FormHelperText error>{getIn(formik.errors, 'reson_for_rejection')}</FormHelperText>
          )}
        </Grid>
      )}

      <Grid item xs={12} className="flex justify-end space-x-2">
        {viewOnly ? (
          <Button variant="outlined" onClick={() => onClose()}>
            Close
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleSaveAsDraft}
              disabled={formik.isSubmitting || disableActions}
              startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitRequest}
              disabled={formik.isSubmitting || disableActions}
              startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SendOutlined />}
            >
              Submit
            </Button>
            {isLevel2 && isEditMode && (
              <>
                {/* <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleSentBack}
                  disabled={formik.isSubmitting || disableActions}
                  startIcon={formik.isSubmitting ? <LoadingOutlined /> : <RollbackOutlined />}
                >
                  Sent Back
                </Button> */}
                {/* <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={formik.isSubmitting || disableActions}
                  startIcon={formik.isSubmitting ? <LoadingOutlined /> : <StopOutlined />}
                >
                  Reject
                </Button> */}
              </>
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};

// =====================================================================================
// LIST PAGE
// =====================================================================================
const TransferRequestPage = () => {
  const intl = useIntl();
  const { user } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [userFlowLevel, setUserFlowLevel] = useState<number>(1);

  const [TransferRequestPopup, setTransferRequestPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'New Transfer Request',
    data: { existingData: {}, isEditMode: false }
  });

  const { data: currentUserEmployeeData } = useQuery<IHrEmployee | null, Error>({
    queryKey: ['current-user-employee-transfer', user?.loginid1],
    queryFn: async () => {
      if (!user?.loginid1) return null;
      try {
        const data = await HrRequestServiceInstance.getEmployees(user?.loginid1 || '');
        return data[0] || null;
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
    retry: false,
    enabled: !!user?.loginid1
  });

  const { data: level2ApproverData } = useQuery({
    queryKey: ['transfer_request_level2_approver', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return false;
      try {
        return await TransferRequestServiceInstance.isLevel2Approver(user.user_id);
      } catch (err) {
        console.error('Level2 approver query error:', err);
        return false;
      }
    },
    enabled: !!user?.user_id,
    retry: false
  });

  const isLevel2Approver = !!level2ApproverData;

  const safeCompare = (a: string | undefined | null | {}, b: string | undefined | null | {}) => {
    const stringA = typeof a === 'object' && Object.keys(a || {}).length === 0 ? '' : String(a || '');
    const stringB = typeof b === 'object' && Object.keys(b || {}).length === 0 ? '' : String(b || '');
    return stringA.trim() === stringB.trim() && stringA.trim() !== '';
  };

  useEffect(() => {
    if (!user?.loginid1) return;

    const isEmptyValue = (value: any) => {
      if (value === undefined || value === null) return true;
      if (typeof value === 'object' && Object.keys(value).length === 0) return true;
      if (typeof value === 'string' && value.trim() === '') return true;
      return false;
    };

    const namesEmpty =
      isEmptyValue(currentUserEmployeeData?.SUPERVISOR_NAME) ||
      isEmptyValue(currentUserEmployeeData?.DEPT_HEAD_NAME) ||
      isEmptyValue(currentUserEmployeeData?.MANAGER_NAME);

    const isSupervisor =
      safeCompare(currentUserEmployeeData?.EMPLOYEE_ID, currentUserEmployeeData?.DEPT_HEAD_EMPID) ||
      safeCompare(currentUserEmployeeData?.EMPLOYEE_ID, currentUserEmployeeData?.SUPERVISOR_EMPID) ||
      safeCompare(currentUserEmployeeData?.EMPLOYEE_ID, currentUserEmployeeData?.MANGR_EMPID) ||
      namesEmpty;

    setUserFlowLevel(isSupervisor ? 2 : 1);
  }, [user?.loginid1, currentUserEmployeeData]);

  const tabParameters = [
    // 'TRANSFER_REQUEST_PENDING',
    'TRANSFER_REQUEST_IN_PROGRESS',
    'TRANSFER_REQUEST_CLOSED'
    // 'TRANSFER_REQUEST_REJECT',
    // 'TRANSFER_REQUEST_SENTBACK'
  ] as const;

  const tabLabels = [
    // intl.formatMessage({ id: 'Pending', defaultMessage: 'Pending' }),
    intl.formatMessage({ id: 'Pending', defaultMessage: 'Pending' }),
    intl.formatMessage({ id: 'Closed', defaultMessage: 'Closed' })
    // Rejected & Sent Back tabs can be re-enabled later
  ];

  const visibleTabs = userFlowLevel === 2 ? tabLabels : tabLabels.slice(0, 3);
  const visibleTabParameters = userFlowLevel === 2 ? tabParameters : tabParameters.slice(0, 3);

  const {
    data: tabData,
    isFetching: isTabDataLoading,
    refetch: refetchTabData
  } = useQuery({
    queryKey: ['transfer_request_tab', visibleTabParameters[activeTab], user?.company_code, user?.loginid1],
    queryFn: () =>
      TransferRequestServiceInstance.getTransferRequestsByTab(
        visibleTabParameters[activeTab],
        user?.company_code || '',
        user?.user_id || ''
      ),
    enabled: !!user?.company_code && !!user?.user_id && visibleTabParameters[activeTab] !== undefined
  });
  console.log(isTabDataLoading, 'isTabDataLoading');

  // -----------------------------------------------------------------
  // Popup handlers
  // -----------------------------------------------------------------
  const handleEditTransferRequest = useCallback(
    (existingData: TTransferRequest, viewOnly = false) => {
      const disableActions = viewOnly || (!isLevel2Approver && activeTab !== 0);
      setTransferRequestPopup({
        action: { open: true, fullWidth: true, maxWidth: 'md' },
        title: viewOnly ? 'View Transfer Request' : `Transfer Request - Level ${existingData.flow_level_running ?? 1}`,
        data: { existingData, isEditMode: true, disableActions, viewOnly }
      });
    },
    [isLevel2Approver, activeTab]
  );

  const toggleTransferRequestPopup = useCallback(
    (refetchData?: boolean) => {
      if (TransferRequestPopup.action.open === true && refetchData) {
        refetchTabData();
      }
      setTransferRequestPopup((prev) => ({ ...prev, action: { ...prev.action, open: !prev.action.open } }));
    },
    [TransferRequestPopup.action.open, refetchTabData]
  );

  const handleActions = useCallback(
    (actionType: string, rowOriginal: TTransferRequest) => {
      if (actionType === 'edit') {
        handleEditTransferRequest(rowOriginal, false);
      } else if (actionType === 'view') {
        handleEditTransferRequest(rowOriginal, true);
      }
    },
    [handleEditTransferRequest]
  );

  const handleAddTransferRequest = useCallback(() => {
    setTransferRequestPopup({
      action: { open: true, fullWidth: true, maxWidth: 'md' },
      title: 'New Transfer Request',
      data: { existingData: {}, isEditMode: false, disableActions: false, viewOnly: false }
    });
  }, []);

  // -----------------------------------------------------------------
  // AG Grid column definitions
  // -----------------------------------------------------------------
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'request_number',
        headerName: 'Request Number',
        minWidth: 140
      },
      {
        field: 'request_date',
        headerName: 'Request Date',
        minWidth: 130,
        valueFormatter: (params) => {
          if (!params.value) return '';
          const d = new Date(params.value);
          if (isNaN(d.getTime())) return String(params.value);

          // Force dd/mm/yyyy for display only
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        }
      },
      {
        field: 'employee_code',
        headerName: 'Employee',
        valueGetter: (params: any) => {
          const code = params.data?.employee_code || '';
          const name = params.data?.employee_name || '';
          return code && name ? `${code} - ${name}` : code || name || '';
        },
        minWidth: 120
      },
      {
        headerName: 'Current Superior',
        field: 'current_supervisor',
        valueGetter: (params: any) => {
          const code = params.data?.current_supervisor_empcode || '';
          const name = params.data?.current_supervisor_rpt_name || '';
          return code && name ? `${code} - ${name}` : code || name || '';
        },
        minWidth: 220
      },
      {
        headerName: 'Transfer To',
        field: 'transfer_to_supervisor',
        valueGetter: (params: any) => {
          const code = params.data?.transfer_to_supervisor_empcode || '';
          const name = params.data?.transfer_to_supervisor_rpt_name || '';
          return code && name ? `${code} - ${name}` : code || name || '';
        },
        minWidth: 220
      },
      {
        field: 'last_action',
        headerName: 'Status',
        minWidth: 120,
        valueFormatter: (params) => {
          // On Pending tab → show SAVEASDRAFT by default if empty
          if (activeTab === 0 && (!params.value || params.value === '')) {
            return 'SAVEASDRAFT';
          }
          return params.value || '';
        }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        minWidth: 120,
        maxWidth: 140,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const row = params.data as TTransferRequest;
          if (!row) return null;

          let actionButtons: TAvailableActionButtons[] = [];

          // Closed tab → always view only
          if (activeTab === 1) {
            actionButtons = ['view'];
          }
          // In Progress tab
          else {
            actionButtons = isLevel2Approver ? ['edit'] : ['view'];
          }

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row)} buttons={actionButtons} />;
        }
      }
    ],
    [activeTab, isLevel2Approver, handleActions]
  );

  const canCreate = activeTab === 0;

  return (
    <div>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }}>
        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Home', defaultMessage: 'Home' })}
        </Link>
        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Activity', defaultMessage: 'Activity' })}
        </Link>
        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Request', defaultMessage: 'Request' })}
        </Link>
        <Typography color="text.primary">
          {intl.formatMessage({ id: 'Transfer Request', defaultMessage: 'Transfer Request' })}
        </Typography>
      </Breadcrumbs>

      <div className="flex justify-end space-x-2 mb-4">
        <Button
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 300,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          disabled={!canCreate}
          variant="contained"
          onClick={handleAddTransferRequest}
          startIcon={<PlusOutlined />}
        >
          {intl.formatMessage({ id: 'New Transfer Request', defaultMessage: 'New Transfer Request' })}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          backgroundColor: theme.palette.grey[100],
          '& .MuiTabs-indicator': {
            backgroundColor: '#082A89',
            height: '3px'
          },
          '& .MuiTab-root': {
            transition: 'all 0.3s ease',
            borderRadius: '8px 8px 0 0',
            margin: '0 2px',
            textTransform: 'none',
            fontWeight: 500,
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(8, 42, 137, 0.08)',
              color: '#082A89'
            }
          },
          '& .Mui-selected': {
            backgroundColor: '#fff',
            color: '#082A89 !important',
            fontWeight: 300,
            border: '2px solid #082A89',
            borderBottom: 'none',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: '-2px',
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: '#fff',
              zIndex: 1
            }
          }
        }}
      >
        {visibleTabs.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>

      <div className="mt-2">
        <CustomAgGrid
          rowData={tabData || []}
          columnDefs={columnDefs}
          height="520px"
          paginationPageSize={15}
          paginationPageSizeSelector={[10, 15, 25, 50]}
          getRowId={(params: any) => params.data?.request_number || `row-${Math.random()}`}
          // optional: show loading state if you want
          // suppressNoRowsOverlay={isTabDataLoading}
        />
      </div>

      {TransferRequestPopup.action.open === true && (
        <UniversalDialog
          action={{ ...TransferRequestPopup.action }}
          onClose={toggleTransferRequestPopup}
          title={TransferRequestPopup.title}
          hasPrimaryButton={false}
        >
          <AddTransferRequestForm
            onClose={toggleTransferRequestPopup}
            isEditMode={TransferRequestPopup?.data?.isEditMode}
            existingData={TransferRequestPopup.data.existingData}
            disableActions={TransferRequestPopup?.data?.disableActions}
            viewOnly={TransferRequestPopup?.data?.viewOnly}
          />
        </UniversalDialog>
      )}
    </div>
  );
};

export default TransferRequestPage;