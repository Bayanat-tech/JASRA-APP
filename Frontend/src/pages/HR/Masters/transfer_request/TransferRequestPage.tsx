import { CalendarOutlined, LoadingOutlined, PlusOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import {
  Autocomplete,
  Button,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField as MuiTextField,
  Tabs,
  Tab,
  useTheme,
  Breadcrumbs,
  Link,
  Typography
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ColDef } from 'ag-grid-community';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import UniversalDialog from 'components/popup/UniversalDialog';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  // Names match the DB columns. They hold CODES only (never names).
  transfer_to_dept_code?: string; // Dept Head employee code
  transfer_to_engineer?: string; // Engineer employee code
  transfer_to_division: string; // DIV_CODE  (mandatory)
  transfer_to_department: string; // DEPT_CODE (mandatory)
};

// CHANGED: the people list now carries each employee's division and department code
type TPersonOption = {
  employee_code: string;
  rpt_name: string;
  div_code: string;
  dept_code: string;
};

type TCodeNameOption = { code: string; name: string };

type TDetailField = 'transfer_to_dept_code' | 'transfer_to_engineer' | 'transfer_to_division' | 'transfer_to_department';

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

  // Returns employee_code, rpt_name, div_code, dept_code, curr_supervisor_code ...
  getTransferToSupervisorOptions: async (company_code: string): Promise<any[]> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_TRANSFER_TO_SUPERVISIOR_DROP_DOWN',
      code1: company_code
    });
    return data || [];
  },

  // CHANGED: called ONLY when an employee is selected -> filtered by that employee's current supervisor (code1)
  getSupervisorEmployeesDetails: async (loginid: string, supervisorCode: string): Promise<any> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_SUPERVISIOR_DETAIL',
      loginid,
      code1: supervisorCode
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

  // Division / department dropdowns
  getDivisionOptions: async (loginid: string): Promise<TCodeNameOption[]> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_DIVISION_DROP_DOWN',
      loginid
    });
    return (data || []).map((r: any) => ({
      code: String(r.DIV_CODE ?? r.div_code ?? ''),
      name: String(r.DIV_NAME ?? r.div_name ?? '')
    }));
  },

  getDepartmentOptions: async (loginid: string): Promise<TCodeNameOption[]> => {
    const data = await common.proc_build_dynamic_sql_common({
      parameter: 'TRANSFER_REQUEST_DEPARTMENT_DROP_DOWN',
      loginid
    });
    return (data || []).map((r: any) => ({
      code: String(r.DEPT_CODE ?? r.dept_code ?? ''),
      name: String(r.DEPT_NAME ?? r.dept_name ?? '')
    }));
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
// HELPERS
// =====================================================================================
const formatDateForDisplay = (date?: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// "CODE - Name" display used by the grid columns
const codeName = (code?: string | null, name?: string | null): string => {
  const c = code || '';
  const n = name || '';
  return c && n ? `${c} - ${n}` : c || n || '';
};

// CHANGED: normalises a row of the people list (works with upper / lower case keys)
const toPerson = (o: any): TPersonOption => ({
  employee_code: String(o?.employee_code ?? o?.EMPLOYEE_CODE ?? ''),
  rpt_name: String(o?.rpt_name ?? o?.RPT_NAME ?? o?.employee_name ?? ''),
  div_code: String(o?.div_code ?? o?.DIV_CODE ?? ''),
  dept_code: String(o?.dept_code ?? o?.DEPT_CODE ?? '')
});

const setOf = (values: string[]): Set<string> => new Set(values.filter(Boolean));

// =====================================================================================
// FORM
// =====================================================================================
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
  const queryClient = useQueryClient();
  const flowLevel = existingData?.flow_level_running ?? 1;
  const isLevel2 = flowLevel === 2;
  const isFieldDisabled = isLevel2 || viewOnly;

  // Ref to the hidden native date input used only for the picker popup
  const wefPickerRef = useRef<HTMLInputElement>(null);

  // Detail fields the user cleared on purpose — the API response must not refill these
  const clearedFieldsRef = useRef<Set<TDetailField>>(new Set());

  // CHANGED: supervisor-detail API state (called only when an employee is selected)
  const detailRequestRef = useRef(0);
  const [isSupervisorDetailLoading, setIsSupervisorDetailLoading] = useState(false);

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
      transfer_to_dept_code: '',
      transfer_to_engineer: '',
      transfer_to_division: '',
      transfer_to_department: '',
      reason_for_trnsfer: '',
      reson_for_rejection: '',
      transfer_wef: '',
      current_supervisor_empcode: '',
      last_action: 'SAVEASDRAFT',
      flow_level_running: 1,
      company_code: user?.company_code
    },
    // Division and Department are NOT NULL in the DB, so they are required for Draft and Submit.
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.employee_code) errors.employee_code = 'Employee is required';
      if (!values.transfer_to_supervisor_empcode) errors.transfer_to_supervisor_empcode = 'Supervisor is required';
      if (!values.transfer_to_division) errors.transfer_to_division = 'Division is required';
      if (!values.transfer_to_department) errors.transfer_to_department = 'Department is required';
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
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

  // CHANGED: always-current copy of the form values for use inside async callbacks
  const valuesRef = useRef<TTransferRequest>(formik.values);
  valuesRef.current = formik.values;

  const { data: currentSupervisorEmployeeData, isFetching: isEmployeeLoading } = useQuery({
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

  const { data: transferToSupervisorOptions, isFetching: isSupervisorOptionsLoading } = useQuery<any[]>({
    queryKey: ['transferToSupervisorOptions', user?.company_code],
    queryFn: () => TransferRequestServiceInstance.getTransferToSupervisorOptions(user?.company_code || ''),
    enabled: !!user?.company_code
  });

  // Division / department option lists
  const { data: divisionOptions, isFetching: isDivisionLoading } = useQuery<TCodeNameOption[]>({
    queryKey: ['transferDivisionOptions'],
    queryFn: () => TransferRequestServiceInstance.getDivisionOptions(user?.loginid1 || ''),
    enabled: !!user?.loginid1
  });

  const { data: departmentOptions, isFetching: isDepartmentLoading } = useQuery<TCodeNameOption[]>({
    queryKey: ['transferDepartmentOptions'],
    queryFn: () => TransferRequestServiceInstance.getDepartmentOptions(user?.loginid1 || ''),
    enabled: !!user?.loginid1
  });

  // True while any dropdown list / detail lookup is still loading -> form shows a wait cursor
  const isFormLoading =
    isEmployeeLoading || isSupervisorOptionsLoading || isDivisionLoading || isDepartmentLoading || isSupervisorDetailLoading;

  const employeeOptions = useMemo(() => currentSupervisorEmployeeData || [], [currentSupervisorEmployeeData]);

  // CHANGED: normalised supervisor list (with div_code / dept_code)
  const supervisorList = useMemo<TPersonOption[]>(
    () => (transferToSupervisorOptions || []).map(toPerson).filter((p) => p.employee_code),
    [transferToSupervisorOptions]
  );

  // Dept Head / Engineer options = supervisor list + employee list (same values), de-duplicated
  const personOptions = useMemo<TPersonOption[]>(() => {
    const map = new Map<string, TPersonOption>();
    supervisorList.forEach((p) => map.set(p.employee_code, p));
    (employeeOptions as any[]).forEach((o) => {
      const p = toPerson(o);
      if (p.employee_code && !map.has(p.employee_code)) map.set(p.employee_code, p);
    });
    return Array.from(map.values());
  }, [supervisorList, employeeOptions]);

  // -----------------------------------------------------------------
  // CHANGED: frontend cross-filtering (no API call)
  //  - Supervisor / Dept Head / Engineer lists  -> only people of the selected Division / Department
  //  - Division / Department lists              -> only those of the selected people (and of each other)
  // The value that is currently selected is always kept in its list.
  // -----------------------------------------------------------------
  const selDiv = formik.values.transfer_to_division || '';
  const selDept = formik.values.transfer_to_department || '';
  const selSup = formik.values.transfer_to_supervisor_empcode || '';
  const selHead = formik.values.transfer_to_dept_code || '';
  const selEng = formik.values.transfer_to_engineer || '';

  const peopleMatch = useCallback(
    (p: TPersonOption) => (!selDiv || p.div_code === selDiv) && (!selDept || p.dept_code === selDept),
    [selDiv, selDept]
  );

  const supervisorOptionsFiltered = useMemo(
    () => supervisorList.filter((p) => p.employee_code === selSup || peopleMatch(p)),
    [supervisorList, selSup, peopleMatch]
  );

  const selectedPeople = useMemo(() => {
    const codes = new Set([selSup, selHead, selEng].filter(Boolean));
    return personOptions.filter((p) => codes.has(p.employee_code));
  }, [personOptions, selSup, selHead, selEng]);

  // An empty restriction set (nothing selected / no data) means "no restriction", so the user is never stuck.
  const isDivisionAllowed = useMemo(() => {
    const fromPeople = setOf(selectedPeople.map((p) => p.div_code));
    const fromDept = selDept ? setOf(personOptions.filter((p) => p.dept_code === selDept).map((p) => p.div_code)) : new Set<string>();
    return (code: string) => (fromPeople.size === 0 || fromPeople.has(code)) && (fromDept.size === 0 || fromDept.has(code));
  }, [selectedPeople, personOptions, selDept]);

  const isDepartmentAllowed = useMemo(() => {
    const fromPeople = setOf(selectedPeople.map((p) => p.dept_code));
    const fromDiv = selDiv ? setOf(personOptions.filter((p) => p.div_code === selDiv).map((p) => p.dept_code)) : new Set<string>();
    return (code: string) => (fromPeople.size === 0 || fromPeople.has(code)) && (fromDiv.size === 0 || fromDiv.has(code));
  }, [selectedPeople, personOptions, selDiv]);

  // Edit mode: existingData already carries transfer_to_* (same names as the DB columns)
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

  // Opens the hidden native date picker
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

  // User edited a detail field (remember if it was cleared so it isn't auto-refilled)
  const setDetailField = (field: TDetailField, value: string) => {
    if (value) clearedFieldsRef.current.delete(field);
    else clearedFieldsRef.current.add(field);
    formik.setFieldValue(field, value);
  };

  // When the employee changes, the old detail values no longer apply -> reset them
  const resetDetailFields = () => {
    detailRequestRef.current += 1; // ignore any detail response still on its way
    setIsSupervisorDetailLoading(false);
    clearedFieldsRef.current.clear();
    formik.setFieldValue('transfer_to_dept_code', '');
    formik.setFieldValue('transfer_to_engineer', '');
    formik.setFieldValue('transfer_to_division', '');
    formik.setFieldValue('transfer_to_department', '');
  };

  // CHANGED: the ONLY place the supervisor-detail API is called -> when an employee is selected.
  // Fills only the empty detail fields (never overwrites what the user chose, never refills a cleared field).
  const loadSupervisorDetails = async (supervisorCode: string) => {
    if (!supervisorCode || !user?.loginid1) return;
    const requestId = ++detailRequestRef.current;
    setIsSupervisorDetailLoading(true);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['supervisorDetail', supervisorCode],
        queryFn: () => TransferRequestServiceInstance.getSupervisorEmployeesDetails(user.loginid1 || '', supervisorCode),
        staleTime: 5 * 60 * 1000
      });
      if (requestId !== detailRequestRef.current) return; // employee changed meanwhile
      const r = (Array.isArray(data) ? data[0] : data) as Record<string, any> | null | undefined; // most common combination
      if (!r) return;
      const g = (key: string): string => String(r[key] ?? r[key.toLowerCase()] ?? '');
      const fill = (field: TDetailField, value: string) => {
        if (!value || clearedFieldsRef.current.has(field) || valuesRef.current[field]) return;
        formik.setFieldValue(field, value);
      };
      fill('transfer_to_dept_code', g('DEPT_HEAD_EMP_CODE'));
      fill('transfer_to_engineer', g('ENGINEER_EMP_CODE'));
      fill('transfer_to_division', g('DIV_CODE'));
      fill('transfer_to_department', g('DEPT_CODE'));
    } catch (err) {
      console.error('Supervisor detail error:', err);
    } finally {
      if (requestId === detailRequestRef.current) setIsSupervisorDetailLoading(false);
    }
  };

  // Dropdown of people (stores employee_code). CHANGED: filtered by the selected Division / Department.
  const renderPersonDropdown = (label: string, field: 'transfer_to_dept_code' | 'transfer_to_engineer') => {
    const currentValue = (formik.values[field] as string) || '';
    const options = personOptions.filter((p) => p.employee_code === currentValue || peopleMatch(p));
    return (
      <Grid item xs={12} sm={3}>
        <InputLabel shrink>{label}</InputLabel>
        <Autocomplete
          size="small"
          options={options}
          loading={isFormLoading}
          getOptionLabel={(option: TPersonOption) => (option?.rpt_name ? option.rpt_name : option?.employee_code || '')}
          isOptionEqualToValue={(option, value) => option?.employee_code === value?.employee_code}
          value={options.find((p) => p.employee_code === currentValue) || null}
          onChange={(_, newValue) => setDetailField(field, newValue?.employee_code || '')} // stores CODE, not name
          disabled={isFieldDisabled}
          renderInput={(params) => <MuiTextField {...params} />}
        />
      </Grid>
    );
  };

  // Dropdown of code/name pairs (stores the code). CHANGED: filtered by the selected people / the other of Division-Department.
  const renderCodeNameDropdown = (
    label: string,
    field: 'transfer_to_division' | 'transfer_to_department',
    baseOptions: TCodeNameOption[],
    isAllowed: (code: string) => boolean
  ) => {
    const currentValue = (formik.values[field] as string) || '';
    const filtered = baseOptions.filter((o) => o.code === currentValue || isAllowed(o.code));
    const options =
      currentValue && !filtered.some((o) => o.code === currentValue) ? [{ code: currentValue, name: currentValue }, ...filtered] : filtered;
    const hasError = Boolean(getIn(formik.touched, field) && getIn(formik.errors, field));
    return (
      <Grid item xs={12} sm={3}>
        <InputLabel shrink>{label}*</InputLabel>
        <Autocomplete
          size="small"
          options={options}
          loading={isFormLoading}
          getOptionLabel={(option: TCodeNameOption) => option?.name || option?.code || ''}
          isOptionEqualToValue={(option, value) => option?.code === value?.code}
          value={options.find((o) => o.code === currentValue) || null}
          onChange={(_, newValue) => setDetailField(field, newValue?.code || '')} // stores CODE, not name
          disabled={isFieldDisabled}
          renderInput={(params) => <MuiTextField {...params} error={hasError} />}
        />
        {hasError && <FormHelperText error>{getIn(formik.errors, field)}</FormHelperText>}
      </Grid>
    );
  };

  return (
    <Grid
      container
      spacing={2}
      component={'form'}
      onSubmit={(e) => e.preventDefault()}
      sx={isFormLoading ? { cursor: 'wait', '& *': { cursor: 'wait !important' } } : undefined}
    >
      <Grid item xs={12} sm={3}>
        <InputLabel>Request Number</InputLabel>
        <MuiTextField value={formik.values.request_number || ''} name="request_number" fullWidth disabled />
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Request Date</InputLabel>
        <MuiTextField type="text" value={formatDateForDisplay(formik.values.request_date)} name="request_date" fullWidth disabled />
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Select Employee*</InputLabel>
        <Autocomplete
          options={employeeOptions}
          loading={isFormLoading}
          getOptionLabel={(option: any) => option?.rpt_name || option?.employee_name || ''}
          isOptionEqualToValue={(option: any, value: any) => option?.employee_code === value?.employee_code}
          value={employeeOptions.find((emp: any) => emp.employee_code === formik.values.employee_code) || null}
          onChange={(_, newValue: any) => {
            const supCode = newValue?.curr_supervisor_code || '';
            formik.setFieldValue('employee_code', newValue?.employee_code || '');
            formik.setFieldValue('current_supervisor_empcode', supCode);
            // Prefill Supervisor with the employee's current supervisor (user can change it afterwards)
            formik.setFieldValue('transfer_to_supervisor_empcode', supCode);
            // Old dept head / engineer / division / department belonged to the previous employee's supervisor
            resetDetailFields();
            // CHANGED: the one and only supervisor-detail API call
            loadSupervisorDetails(supCode);
          }}
          disabled={isFieldDisabled}
          renderInput={(params) => (
            <MuiTextField {...params} error={Boolean(getIn(formik.touched, 'employee_code') && getIn(formik.errors, 'employee_code'))} />
          )}
        />
        {getIn(formik.touched, 'employee_code') && getIn(formik.errors, 'employee_code') && (
          <FormHelperText error>{getIn(formik.errors, 'employee_code')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Supervisor*</InputLabel>
        <Autocomplete
          options={supervisorOptionsFiltered}
          loading={isFormLoading}
          getOptionLabel={(option: TPersonOption) => option?.rpt_name || option?.employee_code || ''}
          isOptionEqualToValue={(option: TPersonOption, value: TPersonOption) => option?.employee_code === value?.employee_code}
          value={supervisorOptionsFiltered.find((sup) => sup.employee_code === formik.values.transfer_to_supervisor_empcode) || null}
          // CHANGED: no API call and no reset -> other dropdowns are simply filtered on the frontend
          onChange={(_, newValue) => formik.setFieldValue('transfer_to_supervisor_empcode', newValue?.employee_code || '')}
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

      {/* Supervisor Details: editable dropdowns, filtered on the frontend by each other and by the Supervisor */}
      <Grid item xs={12}>
        <InputLabel sx={{ mb: 1 }}>Supervisor Details</InputLabel>
        <Grid container spacing={2} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
          {renderPersonDropdown('Dept Head', 'transfer_to_dept_code')}
          {renderPersonDropdown('Engineer', 'transfer_to_engineer')}
          {renderCodeNameDropdown('Division', 'transfer_to_division', divisionOptions || [], isDivisionAllowed)}
          {renderCodeNameDropdown('Department', 'transfer_to_department', departmentOptions || [], isDepartmentAllowed)}
        </Grid>
        {isSupervisorDetailLoading && <FormHelperText>Loading details...</FormHelperText>}
      </Grid>

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

      {/* Transfer W.E.F. — displays dd/mm/yyyy, stores YYYY-MM-DD in formik (backend unchanged) */}
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
        headerName: 'Supervisor',
        field: 'transfer_to_supervisor',
        valueGetter: (params: any) => {
          const code = params.data?.transfer_to_supervisor_empcode || '';
          const name = params.data?.transfer_to_supervisor_rpt_name || '';
          return code && name ? `${code} - ${name}` : code || name || '';
        },
        minWidth: 220
      },
      // The 4 new columns (code - name; names come from the dynamic SQL)
      {
        headerName: 'Dept Head',
        field: 'transfer_to_dept_code',
        valueGetter: (params: any) => codeName(params.data?.transfer_to_dept_code, params.data?.transfer_to_dept_head_rpt_name),
        minWidth: 200
      },
      {
        headerName: 'Engineer',
        field: 'transfer_to_engineer',
        valueGetter: (params: any) => codeName(params.data?.transfer_to_engineer, params.data?.transfer_to_engineer_rpt_name),
        minWidth: 200
      },
      {
        headerName: 'Division',
        field: 'transfer_to_division',
        valueGetter: (params: any) => codeName(params.data?.transfer_to_division, params.data?.transfer_to_division_name),
        minWidth: 160
      },
      {
        headerName: 'Department',
        field: 'transfer_to_department',
        valueGetter: (params: any) => codeName(params.data?.transfer_to_department, params.data?.transfer_to_department_name),
        minWidth: 160
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

      <div className="mt-2" style={{ cursor: isTabDataLoading ? 'wait' : 'default' }}>
        <CustomAgGrid
          rowData={tabData || []}
          columnDefs={columnDefs}
          height="520px"
          paginationPageSize={15}
          paginationPageSizeSelector={[10, 15, 25, 50]}
          getRowId={(params: any) => params.data?.request_number || `row-${Math.random()}`}
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