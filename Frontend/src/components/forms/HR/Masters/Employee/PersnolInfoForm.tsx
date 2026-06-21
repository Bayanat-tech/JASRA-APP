import { Autocomplete, Avatar, Button, FormHelperText, Grid, IconButton, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import CustomTooltip from 'components/CustomTooltip';
import { ISearch } from 'components/filters/SearchFilter';
// import CustomTooltip from 'components/CustomTooltip';
import ImageCrop from 'components/popup/ImageCrop';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import {
  TCategoryHr,
  TDesgHr,
  TDivision,
  TEmpStatusHr,
  TFormalDesgHr,
  TGradeHr,
  TPersnolHr,
  TSectionHr
} from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
//import HrServiceInstance from 'service/HR/service.hr';
// import HrServiceInstance from 'service/HR/service.hr';
import HrServiceInstance from 'service/Service.hr';
import WmsSerivceInstance from 'service/wms/service.wms';
import * as yup from 'yup';
const PersnolInfoForm = ({
  handleNext,
  persnolInfo,
  setPersnolInfo,
  isEditMode
}: {
  isEditMode: boolean;
  handleNext: () => void;
  persnolInfo: TPersnolHr;
  setPersnolInfo: (value: TPersnolHr) => void;
}) => {
  //----------Constants--------
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [fileUploadDialog, setFileUploadDialog] = useState<boolean>(false);

  //----------------formik-----------------
  const formik = useFormik<TPersnolHr>({
    initialValues: persnolInfo,
    validationSchema: yup.object().shape({
      alternate_id: yup.string().required('This field is required'),
      rpt_name: yup.string().required('This field is required'),
      grade_code: yup.string().required('This field is required'),
      desg_code: yup.string().required('This field is required'),
      labour_desg_code: yup.string().required('This field is required'),
      category_code: yup.string().required('This field is required'),
      birth_date: yup.date().required('This field is required'),
      join_date: yup.date().required('This field is required'),
      probation_end_date: yup.date().required('This field is required'),
      probation_confirm_date: yup.date().required('This field is required'),
      country_code: yup.string().required('This field is required'),
      emp_status: yup.string().required('This field is required'),
      div_code: yup.string().required('This field is required'),
      dept_code: yup.string().required('This field is required'),
      section_code: yup.string().required('This field is required')
    }),
    onSubmit: async (values) => {
      setPersnolInfo(values);
      handleNext();
    }
  });

  //----------- useQuery--------------
  // Fetch country data
  const { data: countryData } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'country');
      if (response) {
        return {
          tableData: response.tableData as TCountry[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch grade data
  const { data: gradeData } = useQuery({
    queryKey: ['hrGrade_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters(app, 'grademaster');
      if (response) {
        return {
          tableData: response.tableData as TGradeHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch employee status data
  const { data: empStatusData } = useQuery({
    queryKey: ['emp_status_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters(app, 'hrEmployeeStatus');
      if (response) {
        return {
          tableData: response.tableData as TEmpStatusHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch designation data
  const { data: designationData } = useQuery({
    queryKey: ['hrDesignation_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters(app, 'designation');
      if (response) {
        return {
          tableData: response.tableData as TDesgHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch formal designation data
  const { data: formalDesignationData } = useQuery({
    queryKey: ['hrFormal_Designation_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters(app, 'formaldesignation');
      if (response) {
        return {
          tableData: response.tableData as TFormalDesgHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch category data
  const { data: categoryData } = useQuery({
    queryKey: ['category_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters(app, 'categorymaster');
      if (response) {
        return {
          tableData: response.tableData as TCategoryHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch department data based on division code
  const { data: departmentData } = useQuery({
    queryKey: ['department_data', formik.values.div_code],
    queryFn: async () => {
      const searchData: ISearch = {
        sort: { field_name: 'updated_at', desc: true },
        search: [[{ field_name: 'div_code', field_value: formik.values.div_code, operator: 'exactmatch' }]]
      };
      const response = await HrServiceInstance.getMasters('hr', 'hrDepartment', undefined, searchData);
      if (response) {
        return {
          tableData: response.tableData as TDepartment[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    },
    enabled: !!formik.values.div_code && formik.values.div_code.length > 0
  });

  // Fetch section data based on department code
  const { data: sectionData } = useQuery({
    queryKey: ['section_data', formik.values.dept_code],
    queryFn: async () => {
      const searchData: ISearch = {
        search: [
          [{ field_name: 'dept_code', field_value: formik.values.dept_code, operator: 'exactmatch' }],
          [{ field_name: 'div_code', field_value: formik.values.div_code, operator: 'exactmatch' }]
        ]
      };
      const response = await HrServiceInstance.getMasters('hr', 'hrSection', undefined, searchData);
      if (response) {
        return {
          tableData: response.tableData as TSectionHr[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    },
    enabled: !!formik.values.dept_code && formik.values.dept_code.length > 0
  });

  // Fetch division data
  const { data: divisionData } = useQuery({
    queryKey: ['division_data'],
    queryFn: async () => {
      const response = await HrServiceInstance.getMasters('hr', 'hrDivision');
      if (response) {
        return {
          tableData: response.tableData as TDivision[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  //---------handlers------
  // Handle opening file upload dialog
  const handleOpenFileUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setFileUploadDialog(true);
  };

  // Handle uploaded file
  const handleUploadedFile = (fileUrl: string) => {
    formik.setFieldValue('emp_photo', fileUrl);
    setFileUploadDialog(false);
  };

  //-----------useEffect----------
  // Set form values when persnolInfo changes
  useEffect(() => {
    if (!!persnolInfo && !!Object.keys(persnolInfo).length) {
      formik.setValues(persnolInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persnolInfo]);
  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} marginBottom={3}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          <FormattedMessage id="Persnol Information" />
        </Typography>
      </Grid>

      <Grid container item xs={12} sm={12} spacing={{ xs: 2, sm: 6 }}>
        <Grid container item xs={12} sm={6} rowGap={2}>
          <Grid container item xs={12} sm={12} spacing={2}>
            {/* Employee Division */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Employee Division" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <Autocomplete
                id="employeeDivision"
                value={
                  !!formik.values.div_code
                    ? divisionData?.tableData.find((eachDiv) => eachDiv.div_code === formik.values.div_code)
                    : ({ div_name: '' } as TDivision)
                }
                onChange={(event, value: TDivision | null) => {
                  formik.setFieldValue('div_code', value?.div_code);
                }}
                size="small"
                options={divisionData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.div_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />
              {getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'div_code')}
                </FormHelperText>
              )}
            </Grid>
            {/* Employee Department */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Employee Dept" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <Autocomplete
                disabled={!departmentData ? true : false}
                id="employeeDept"
                value={
                  !!formik.values.dept_code
                    ? departmentData?.tableData.find((eachDepartment) => eachDepartment.dept_code === formik.values.dept_code)
                    : ({ dept_name: '' } as TDepartment)
                }
                onChange={(event, value: TDepartment | null) => {
                  formik.setFieldValue('dept_code', value?.dept_code);
                }}
                size="small"
                options={departmentData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.dept_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />
              {getIn(formik.touched, 'dept_code') && getIn(formik.errors, 'dept_code') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'dept_code')}
                </FormHelperText>
              )}
            </Grid>
            {/* Employee Section */}
            <Grid item xs={12} sm={4}>
              <InputLabel>
                <FormattedMessage id="Employee Section" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <Autocomplete
                id="employeeSection"
                disabled={!sectionData ? true : false}
                value={
                  !!formik.values.section_code
                    ? sectionData?.tableData.find((eachSection) => eachSection.section_code === formik.values.section_code)
                    : ({ section_name: '' } as TSectionHr)
                }
                onChange={(event, value: TSectionHr | null) => {
                  formik.setFieldValue('section_code', value?.section_code);
                }}
                size="small"
                options={sectionData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.section_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />
              {getIn(formik.touched, 'section_code') && getIn(formik.errors, 'section_code') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'section_code')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>
          {/* Profile Picture */}
          <Grid item container xs={12} spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={5} alignItems={'center'} className="mt-6">
                <CustomTooltip message={formik.values.emp_photo ? 'Change Picture' : 'Upload Profile Picture'}>
                  <IconButton disableRipple onClick={handleOpenFileUpload}>
                    <Avatar
                      sx={{ border: formik.values.emp_photo && 2, width: 100, height: 100 }}
                      className="hover:border-4 border-dashed"
                      variant="circular"
                      src={formik.values.emp_photo}
                    />
                  </IconButton>
                </CustomTooltip>
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
                  size="small"
                  value={formik.values.rpt_name}
                  onChange={formik.handleChange}
                  name="rpt_name"
                  error={getIn(formik.touched, 'rpt_name') && getIn(formik.errors, 'rpt_name')}
                  fullWidth
                />
                {getIn(formik.touched, 'rpt_name') && getIn(formik.errors, 'rpt_name') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'rpt_name')}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <InputLabel>
                  <FormattedMessage id="Date Of Birth" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    value={formik.values.birth_date ? dayjs(formik.values.birth_date) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) formik.setFieldValue('birth_date', newValue.toISOString());
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="birth_date"
                  />
                </LocalizationProvider>
                {getIn(formik.touched, 'birth_date') && getIn(formik.errors, 'birth_date') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'birth_date')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Employee Code */}
          <Grid item container xs={12} sm={12} spacing={2}>
            {!isEditMode ? null : (
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Employee Code" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <TextField
                  error={getIn(formik.touched, 'employee_code') && getIn(formik.errors, 'employee_code')}
                  value={formik.values.employee_code}
                  size="small"
                  name="employee_code"
                  fullWidth
                  disabled
                />
                {getIn(formik.touched, 'employee_code') && getIn(formik.errors, 'employee_code') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'employee_code')}
                  </FormHelperText>
                )}
              </Grid>
            )}
            {/* Alternate Id */}
            <Grid item xs={12} sm={!isEditMode ? 12 : 6}>
              <InputLabel>
                <FormattedMessage id="Alternet Id" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <TextField
                disabled={isEditMode}
                error={getIn(formik.touched, 'alternate_id') && getIn(formik.errors, 'alternate_id')}
                onChange={formik.handleChange}
                value={formik.values.alternate_id}
                size="small"
                name="alternate_id"
                fullWidth
              />
              {getIn(formik.touched, 'alternate_id') && getIn(formik.errors, 'alternate_id') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'alternate_id')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>

          {/* Grade */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Grade" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <Autocomplete
              id="grade"
              value={
                !!formik.values.grade_code
                  ? gradeData?.tableData.find((eachCategory) => eachCategory.grade_code === formik.values.grade_code)
                  : ({ grade_name: '' } as TGradeHr)
              }
              onChange={(event, value: TGradeHr | null) => {
                formik.setFieldValue('grade_code', value?.grade_code);
              }}
              size="small"
              options={gradeData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.grade_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {getIn(formik.touched, 'grade_code') && getIn(formik.errors, 'grade_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'grade_code')}
              </FormHelperText>
            )}
          </Grid>

          {/* Designation */}
          <Grid xs={12} sm={12} spacing={2} container item>
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Designation" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <Autocomplete
                id="designation"
                value={
                  !!formik.values.desg_code
                    ? designationData?.tableData?.find((eachDesg) => eachDesg.desg_code === formik.values.desg_code)
                    : ({ desg_name: '' } as TDesgHr)
                }
                onChange={(event, value: TDesgHr | null) => {
                  formik.setFieldValue('desg_code', value?.desg_code);
                }}
                size="small"
                options={designationData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.desg_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />
              {getIn(formik.touched, 'desg_code') && getIn(formik.errors, 'desg_code') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'desg_code')}
                </FormHelperText>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Formal Designation" />
                <span className="text-red-500">*</span>
              </InputLabel>
              <Autocomplete
                id="formalDesignation"
                value={
                  !!formik.values.labour_desg_code
                    ? formalDesignationData?.tableData.find((eachFormal) => eachFormal.labour_desg_code === formik.values.labour_desg_code)
                    : ({ labour_desg_name: '' } as TFormalDesgHr)
                }
                onChange={(event, value: TFormalDesgHr | null) => {
                  formik.setFieldValue('labour_desg_code', value?.labour_desg_code);
                }}
                size="small"
                options={formalDesignationData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.labour_desg_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />
              {getIn(formik.touched, 'labour_desg_code') && getIn(formik.errors, 'labour_desg_code') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'labour_desg_code')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* --------------Grade------------------ */}
        <Grid container item xs={12} sm={6} rowGap={2}>
          {/* Category */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Category" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <Autocomplete
              id="category"
              value={
                !!formik.values.category_code
                  ? categoryData?.tableData.find((eachCategory) => eachCategory.category_code === formik.values.category_code)
                  : ({ category_name: '' } as TCategoryHr)
              }
              onChange={(event, value: TCategoryHr | null) => {
                formik.setFieldValue('category_code', value?.category_code);
              }}
              size="small"
              options={categoryData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.category_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {getIn(formik.touched, 'category_code') && getIn(formik.errors, 'category_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'category_code')}
              </FormHelperText>
            )}
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
                maxDate={dayjs(formik.values.probation_end_date)}
                value={formik.values.join_date ? dayjs(formik.values.join_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('join_date', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="join_date"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'join_date') && getIn(formik.errors, 'join_date') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'join_date')}
              </FormHelperText>
            )}
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
                minDate={dayjs(formik.values.join_date)}
                value={formik.values.probation_end_date ? dayjs(formik.values.probation_end_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('probation_end_date', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="probation_end_date"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'probation_end_date') && getIn(formik.errors, 'probation_end_date') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'probation_end_date')}
              </FormHelperText>
            )}
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
                value={formik.values.probation_confirm_date ? dayjs(formik.values.probation_confirm_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('probation_confirm_date', newValue.toISOString());
                }}
                slotProps={{ textField: { size: 'small' } }}
                sx={{
                  width: '100%'
                }}
                name="probation_confirm_date"
              />
            </LocalizationProvider>
            {getIn(formik.touched, 'probation_confirm_date') && getIn(formik.errors, 'probation_confirm_date') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'probation_confirm_date')}
              </FormHelperText>
            )}
          </Grid>
          {/* Employment Status */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Employment Status" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <Autocomplete
              id="emp_status"
              value={
                !!formik.values.emp_status
                  ? empStatusData?.tableData?.find((eachEmpStat) => eachEmpStat.empstatus_code === formik.values.emp_status)
                  : ({ empstatus_name: '' } as TEmpStatusHr)
              }
              onChange={(event, value: TEmpStatusHr | null) => {
                formik.setFieldValue('emp_status', value?.empstatus_code);
              }}
              size="small"
              options={empStatusData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.empstatus_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {getIn(formik.touched, 'emp_status') && getIn(formik.errors, 'emp_status') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'emp_status')}
              </FormHelperText>
            )}
          </Grid>
          {/* Country */}
          <Grid item xs={12}>
            <InputLabel>
              <FormattedMessage id="Country" />
              <span className="text-red-500">*</span>
            </InputLabel>
            <Autocomplete
              id="country"
              value={
                !!formik.values.country_code
                  ? countryData?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_code)
                  : ({ country_name: '' } as TCountry)
              }
              onChange={(event, value: TCountry | null) => {
                formik.setFieldValue('country_code', value?.country_code);
              }}
              size="small"
              options={countryData?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.country_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputProps={{
                    ...params.inputProps
                  }}
                />
              )}
            />
            {getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'country_code')}
              </FormHelperText>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* ----------Submit Form------------------- */}
      <Grid item xs={12} marginTop={12.5}>
        <Stack direction="row" justifyContent="end">
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Next" />
          </Button>
        </Stack>
      </Grid>

      {/* ----------Define Upload Profile Picture---- */}
      {fileUploadDialog && (
        <ImageCrop
          Image={formik.values.emp_photo}
          open={fileUploadDialog}
          onClose={() => setFileUploadDialog(false)}
          onSubmit={handleUploadedFile}
          dialogTitle="Upload Profile Picture"
        />
      )}
    </Grid>
  );
};

export default PersnolInfoForm;
