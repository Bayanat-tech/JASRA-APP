import React, { useEffect, useState } from 'react';
import { TextField, Grid, Avatar, IconButton, InputLabel, Stack, Typography } from '@mui/material';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // corrected to use MUI DatePicker
import {useIntl, FormattedMessage } from 'react-intl';
import dayjs, { Dayjs } from 'dayjs';


interface HRPersonalInfoFormProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

interface FormData {
  EMPLOYEE_CODE: string;
  DIV_NAME: string;
  DEPT_NAME: string;
  SECTION_NAME: string;
  RPT_NAME: string;
  ALTERNATE_ID: string;
  GRADE_NAME: string;
  DESG_NAME: string;
  DESG_CODE: string;
  LABOUR_DESG_CODE: string;
  EMP_PHOTO: object;
  CATEGORY_NAME: string;
  JOIN_DATE: Date | null;
  PROBATION_END_DATE: Date | null;
  PROBATION_CONFIRM_DATE: Date | null;
  NATIONALITY?: string;
  EMP_STATUS?: string;
  DOB?: Date | null;
}


const HRPersonalInfoForm: React.FC<HRPersonalInfoFormProps> = ({ isEditMode, employeeData }) => {
  const [formData, setFormData] = useState<FormData>({
    EMPLOYEE_CODE: '',
    DIV_NAME: '',
    DEPT_NAME: '',
    SECTION_NAME: '',
    RPT_NAME: '',
    ALTERNATE_ID: '',
    GRADE_NAME: '',
    DESG_NAME: '',
    LABOUR_DESG_CODE: '',
    CATEGORY_NAME: '',
    JOIN_DATE: new Date(),
    PROBATION_END_DATE: new Date(),
    PROBATION_CONFIRM_DATE: new Date(),
    DESG_CODE: '',
    EMP_PHOTO: {},
    NATIONALITY: '',
    EMP_STATUS: '',
    DOB: new Date()
  });

  useEffect(() => {
    if (employeeData) {
      setFormData((prevData) => ({
        ...prevData,
        EMPLOYEE_CODE: employeeData.EMPLOYEE_CODE || '',
        DIV_NAME: employeeData.DIV_NAME || '',
        DEPT_NAME: employeeData.DEPT_NAME || '',
        SECTION_NAME: employeeData.SECTION_NAME || '',
        RPT_NAME: employeeData.RPT_NAME || '',
        ALTERNATE_ID: employeeData.ALTERNATE_ID || '',
        GRADE_NAME: employeeData.GRADE_NAME || '',
        DESG_NAME: employeeData.DESG_NAME || '',
        LABOUR_DESG_CODE: employeeData.LABOUR_DESG_CODE || '',
        CATEGORY_NAME: employeeData.CATEGORY_NAME || '',
        JOIN_DATE: employeeData.JOIN_DATE ? new Date(employeeData.JOIN_DATE) : null,
        PROBATION_END_DATE: employeeData.PROBATION_END_DATE ? new Date(employeeData.PROBATION_END_DATE) : null,
        PROBATION_CONFIRM_DATE: employeeData.PROBATION_CONFIRM_DATE ? new Date(employeeData.PROBATION_CONFIRM_DATE) : null,
        NATIONALITY: employeeData.NATIONALITY || '',
        EMP_STATUS: employeeData.EMP_STATUS || '',
        DOB: employeeData.DOB ? new Date(employeeData.DOB) : null
      }));
    }
  }, [employeeData]);
const intl = useIntl();
  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Grid container component={'form'}>
      <Grid container item xs={12} sm={12} spacing={{ xs: 2, sm: 6 }}>
        <Grid container item xs={12} sm={6} rowGap={2}>
          <Grid container item xs={12} sm={12} spacing={2}>
            {/* Employee Division */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                {intl.formatMessage({ id: 'Employee Division' }) || 'Employee Division'}
                        <span className="text-red-500">*</span>
              </InputLabel>
              <TextField
                id="employee Division"
                size="small"
                fullWidth
                name="DIV_NAME"
                value={formData.DIV_NAME}
                onChange={handleChange('DIV_NAME')}
              />
            </Grid>

            {/* Employee Department */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Employee Dept" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField
                id="employeeDivision"
                size="small"
                fullWidth
                name="DEPT_NAME"
                value={formData.DEPT_NAME}
                onChange={handleChange('DEPT_NAME')}
              />
            </Grid>

            {/* Employee Section */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Employee Sec" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField
                id="SECTION_NAME"
                size="small"
                fullWidth
                name="SECTION_NAME"
                value={formData.SECTION_NAME}
                onChange={handleChange('SECTION_NAME')}
              />
            </Grid>
          </Grid>

          {/* Profile Picture */}
          <Grid item container xs={12} spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={5} alignItems={'center'} className="mt-6">
                <IconButton disableRipple>
                  <Avatar sx={{ width: 100, height: 100 }} className="hover:border-4 border-dashed" variant="circular" />
                </IconButton>
                <Typography>
                  <FormattedMessage id="Profile Picture" />
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} alignItems={'right'}>
              <Grid item xs={12} marginBottom={2}>
                <InputLabel>
                  <FormattedMessage id="Name" /> <span className="text-red-500">*</span>
                </InputLabel>
                <TextField
                  id="RPT_NAME"
                  size="small"
                  fullWidth
                  name="RPT_NAME"
                  value={formData.RPT_NAME}
                  onChange={handleChange('RPT_NAME')}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>
                  <FormattedMessage id="Date Of Birth" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{ width: '100%' }}
                    value={formData.DOB ? dayjs(formData.DOB) : null}
                    onChange={(newValue: Dayjs | null) => {
                      setFormData((prev) => ({
                        ...prev,
                        DOB: newValue ? newValue.toDate() : null
                      }));
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          {/* Employee Code */}
          <Grid item container xs={12} sm={12} spacing={2}>
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Employee Code" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField size="small" fullWidth name="EMPLOYEE_CODE" value={formData.EMPLOYEE_CODE} disabled />
            </Grid>

            {/* Alternate Id */}
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Alternet Id" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField size="small" fullWidth name="ALTERNATE_ID" value={formData.ALTERNATE_ID} disabled />
            </Grid>
          </Grid>

          {/* Grade */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Grade" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <TextField id=" GRADE_NAME" size="small" fullWidth name=" GRADE_NAME" value={formData.GRADE_NAME} />
          </Grid>

          {/* Designation */}
          <Grid xs={12} sm={12} spacing={2} container item>
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Designation" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField id=" DESG_NAME" size="small" fullWidth name=" DESG_NAME" value={formData.DESG_NAME} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Formal Designation" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField id="LABOUR_DESG_CODE" size="small" fullWidth name="LABOUR_DESG_CODE" value={formData.LABOUR_DESG_CODE} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Side */}
        <Grid container item xs={12} sm={6} rowGap={2}>
          {/* Category */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Category" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <TextField id="CATEGORY_NAME" size="small" fullWidth name="CATEGORY_NAME" value={formData.CATEGORY_NAME} />
          </Grid>

          {/* Date Of Joining */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Date Of Joining" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                value={formData.JOIN_DATE ? dayjs(formData.JOIN_DATE) : null}
                onChange={(newValue: Dayjs | null) => {
                  setFormData((prev) => ({
                    ...prev,
                    JOIN_DATE: newValue ? newValue.toDate() : null
                  }));
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Probation End Date */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Probation End Date" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                value={formData.PROBATION_END_DATE ? dayjs(formData.PROBATION_END_DATE) : null}
                onChange={(newValue: Dayjs | null) => {
                  setFormData((prev) => ({
                    ...prev,
                    PROBATION_END_DATE: newValue ? newValue.toDate() : null // ✅ keep Date in state
                  }));
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Confirmation Date */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Confirmation Date" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                value={formData.PROBATION_CONFIRM_DATE ? dayjs(formData.PROBATION_CONFIRM_DATE) : null}
                onChange={(newValue: Dayjs | null) => {
                  setFormData((prev) => ({
                    ...prev,
                    PROBATION_CONFIRM_DATE: newValue ? newValue.toDate() : null
                  }));
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Employment Status */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Employment Status" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <TextField id="EMP_STATUS" size="small" fullWidth name="EMP_STATUS" value={formData.EMP_STATUS} />
          </Grid>

          {/* Country */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Country" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <TextField id="NATIONALITY" size="small" fullWidth name="NATIONALITY" value={formData.NATIONALITY} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HRPersonalInfoForm;
