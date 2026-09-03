import { LoadingOutlined, PlusOutlined, RollbackOutlined, SaveOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Button,
  FormHelperText,
  Grid,
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
import { ColumnDef } from '@tanstack/react-table';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable from 'components/tables/CustomDataTables';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import axiosServices from 'utils/axios';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import common from '../../../../service/Attendance/common_service';
import HrRequestServiceInstance, { IHrEmployee } from 'service/services.hr';

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
      parameter: 'TRANSFER_REQUEST_EMPLOYEE_DROP_DOWN',
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
  rpt_name?: string;
  dept_head_emp_code?: string;
  dept_head_name?: string;
  supervisor_emp_code?: string;
  supervisor_name?: string;
  engineer_emp_code?: string;
  engineer_name?: string;
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
  const flowLevel = existingData?.flow_level_running ?? 1;
  const isLevel2 = flowLevel === 2;
  const isFieldDisabled = isLevel2 || viewOnly;

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
  const handleReject = () => handleAction('REJECT');
  const handleSentBack = () => handleAction('SENTBACK');

  const getDetail = (upperKey: keyof TSupervisorDetail, lowerKey: keyof TSupervisorDetail) =>
    supervisorDetail?.[upperKey] || supervisorDetail?.[lowerKey] || '-';

  return (
    <Grid container spacing={2} component={'form'} onSubmit={(e) => e.preventDefault()}>
      <Grid item xs={12} sm={6}>
        <InputLabel>Request Number</InputLabel>
        <MuiTextField value={formik.values.request_number || ''} name="request_number" fullWidth disabled />
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>Request Date</InputLabel>
        <MuiTextField
          type="date"
          value={formik.values.request_date || ''}
          name="request_date"
          onChange={formik.handleChange}
          fullWidth
          disabled
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>Select Employee*</InputLabel>
        <Autocomplete
          options={employeeOptions}
          getOptionLabel={(option: any) => option?.rpt_name || option?.employee_name || ''}
          isOptionEqualToValue={(option: any, value: any) => option?.employee_code === value?.employee_code}
          value={employeeOptions.find((emp: any) => emp.employee_code === formik.values.employee_code) || null}
          onChange={(_, newValue: any) => formik.setFieldValue('employee_code', newValue?.employee_code || '')}
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

      <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <InputLabel shrink>Employee Code</InputLabel>
                <MuiTextField value={getDetail('EMPLOYEE_CODE', 'employee_code')} fullWidth disabled size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel shrink>Name</InputLabel>
                <MuiTextField value={getDetail('RPT_NAME', 'rpt_name')} fullWidth disabled size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel shrink>Dept Head</InputLabel>
                <MuiTextField
                  value={`${getDetail('DEPT_HEAD_NAME', 'dept_head_name')} (${getDetail('DEPT_HEAD_EMP_CODE', 'dept_head_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel shrink>Supervisor</InputLabel>
                <MuiTextField
                  value={`${getDetail('SUPERVISOR_NAME', 'supervisor_name')} (${getDetail('SUPERVISOR_EMP_CODE', 'supervisor_emp_code')})`}
                  fullWidth
                  disabled
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel shrink>Engineer</InputLabel>
                <MuiTextField
                  value={`${getDetail('ENGINEER_NAME', 'engineer_name')} (${getDetail('ENGINEER_EMP_CODE', 'engineer_emp_code')})`}
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

      <Grid item xs={12} sm={6}>
        <InputLabel>Transfer W.E.F.</InputLabel>
        <MuiTextField
          type="date"
          value={formik.values.transfer_wef || ''}
          name="transfer_wef"
          onChange={formik.handleChange}
          fullWidth
          disabled={isFieldDisabled}
          inputProps={{
            min: formik.values.request_date || undefined
          }}
          error={Boolean(getIn(formik.touched, 'transfer_wef') && getIn(formik.errors, 'transfer_wef'))}
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
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleSentBack}
                  disabled={formik.isSubmitting || disableActions}
                  startIcon={formik.isSubmitting ? <LoadingOutlined /> : <RollbackOutlined />}
                >
                  Sent Back
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={formik.isSubmitting || disableActions}
                  startIcon={formik.isSubmitting ? <LoadingOutlined /> : <StopOutlined />}
                >
                  Reject
                </Button>
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
    'TRANSFER_REQUEST_PENDING',
    'TRANSFER_REQUEST_IN_PROGRESS',
    'TRANSFER_REQUEST_CLOSED',
    'TRANSFER_REQUEST_REJECT',
    'TRANSFER_REQUEST_SENTBACK'
  ] as const;

  const tabLabels = [
    intl.formatMessage({ id: 'Pending' }) || 'Pending',
    intl.formatMessage({ id: 'In Progress' }) || 'In Progress',
    intl.formatMessage({ id: 'Closed' }) || 'Closed',
    intl.formatMessage({ id: 'Rejected' }) || 'Rejected',
    intl.formatMessage({ id: 'Sent Back' }) || 'Sent Back'
  ];

  const visibleTabs = userFlowLevel === 2 ? tabLabels : tabLabels.slice(0, 4);
  const visibleTabParameters = userFlowLevel === 2 ? tabParameters : tabParameters.slice(0, 4);

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
  // Columns
  // -----------------------------------------------------------------
  const columns = useMemo<ColumnDef<TTransferRequest>[]>(
    () => [
      {
        accessorFn: (row) => row.request_number,
        id: 'request_number',
        header: () => <span>Request Number</span>
      },
      {
        accessorFn: (row) => row.request_date,
        id: 'request_date',
        header: () => <span>Request Date</span>,
        cell: ({ getValue }) => {
          const value = getValue() as string | Date | null | undefined;
          if (!value) return '';
          const d = new Date(value);
          if (isNaN(d.getTime())) return String(value);
          // Clean DD/MM/YYYY format (no time)
          return d.toLocaleDateString('en-GB');
        }
      },
      {
        accessorFn: (row) => row.employee_code,
        id: 'employee_code',
        header: () => <span>Employee</span>
      },
      {
        accessorFn: (row) => row.current_supervisor_empcode,
        id: 'current_supervisor_empcode',
        header: () => <span>Current Supervisor</span>
      },
      {
        accessorFn: (row) => row.transfer_to_supervisor_empcode,
        id: 'transfer_to_supervisor_empcode',
        header: () => <span>Transfer To</span>
      },
      {
        accessorFn: (row) => row.last_action,
        id: 'last_action',
        header: () => <span>Status</span>
      },
      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          // Closed (2), Rejected (3), Sent Back (4) → View only
          if (activeTab >= 2) {
            const actionButtons: TAvailableActionButtons[] = ['view'];
            return (
              <ActionButtonsGroup
                handleActions={(action) => handleActions(action, row.original)}
                buttons={actionButtons}
              />
            );
          }

          // In Progress (1)
          if (activeTab === 1) {
            if (isLevel2Approver) {
              const actionButtons: TAvailableActionButtons[] = ['edit'];
              return (
                <ActionButtonsGroup
                  handleActions={(action) => handleActions(action, row.original)}
                  buttons={actionButtons}
                />
              );
            }
            // Non-Level 2 → view only
            const actionButtons: TAvailableActionButtons[] = ['view'];
            return (
              <ActionButtonsGroup
                handleActions={(action) => handleActions(action, row.original)}
                buttons={actionButtons}
              />
            );
          }

          // Pending (0)
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          return (
            <ActionButtonsGroup
              handleActions={(action) => handleActions(action, row.original)}
              buttons={actionButtons}
            />
          );
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
          {intl.formatMessage({ id: 'Home' }) || 'Home'}
        </Link>
        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Activity' }) || 'Activity'}
        </Link>
        <Link underline="hover" color="inherit" href="/dashboard">
          {intl.formatMessage({ id: 'Request' }) || 'Request'}
        </Link>
        <Typography color="text.primary">
          {intl.formatMessage({ id: 'Transfer Request' }) || 'Transfer Request'}
        </Typography>
      </Breadcrumbs>

      <div className="flex justify-end space-x-2 mb-4">
        <Button
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
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
          {intl.formatMessage({ id: 'New Transfer Request' }) || 'New Transfer Request'}
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
            fontWeight: 600,
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
        <CustomDataTable
          row_id="request_number"
          data={tabData || []}
          columns={columns}
          count={tabData?.length}
          isDataLoading={isTabDataLoading}
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