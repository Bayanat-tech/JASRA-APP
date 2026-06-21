import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TSection } from 'pages/HR/type/AddHR_types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import sectionServiceInstance from 'service/HR/SectionService';

import * as yup from 'yup';

const AddSectionForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData: TSection;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TSection>({
    initialValues: {
      company_code: user?.company_code || '',
      div_code: '',
      dept_code: '',
      section_code: '',
      section_name: '',
      section_short_name: '',
      sect_addr1: '',
      sect_addr2: '',
      sect_addr3: '',
      phone: '',
      fax: '',
      email: '',
      sect_head_id: '',
      remarks: '',
      status: 'N', // Default value
      user_id: user?.created_by || '',
      user_dt: new Date(),
      enterprice_code: '',
      staff_cntrl_ac_group: '',
      staff_loan_ac_group: '',
      salary_expense_ac_code: '',
      expense_sub_type: '',
      expense_type: ''
    },
    validationSchema: yup.object().shape({
      section_code: yup.string().required('This field is required'),
      section_name: yup.string().required('This field is required'),
      sect_addr1: yup.string().required('This field is required'),
      sect_head_id: yup.string().required('This field is required'),
      email: yup.string().email('Invalid email format'),
      phone: yup.string().matches(/^\d+$/, 'Must be a valid phone number')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await sectionServiceInstance.editSection(values);
      } else {
        response = await sectionServiceInstance.addSection(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });

  //------------------useEffect------------
  useEffect(() => {
    if (isEditMode) {
      const { ...sectionData } = existingData;
      formik.setValues(sectionData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/* <Grid container className=''> */}

      <Card style={{ width: '100%', padding: '16px', marginTop: '16px' }}>
        <Box mb={2}>
          <Typography variant="h6" component="div" className="text-lg font-bold">
            <FormattedMessage id="Department" />
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Company Code" />
            </InputLabel>
            <TextField size="small" value={formik.values.company_code} name="company_code" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Division Code" />
            </InputLabel>
            <TextField size="small" value={formik.values.div_code} name="div_code" onChange={formik.handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={8}>
            <InputLabel>
              <FormattedMessage id="Division Name" />
            </InputLabel>
            <TextField size="small" value={formik.values.div_name} name="div_name" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Department Code" />
            </InputLabel>
            <TextField size="small" value={formik.values.dept_code} name="dept_code" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Section Code" />*
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.section_code}
              name="section_code"
              onChange={formik.handleChange}
              fullWidth
              error={Boolean(getIn(formik.touched, 'section_code') && getIn(formik.errors, 'section_code'))}
            />
            {getIn(formik.touched, 'section_code') && getIn(formik.errors, 'section_code') && (
              <FormHelperText error>{getIn(formik.errors, 'section_code')}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={8}>
            <InputLabel>
              <FormattedMessage id="Section Name" />*
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.section_name}
              name="section_name"
              onChange={formik.handleChange}
              fullWidth
              error={Boolean(getIn(formik.touched, 'section_name') && getIn(formik.errors, 'section_name'))}
            />
            {getIn(formik.touched, 'section_name') && getIn(formik.errors, 'section_name') && (
              <FormHelperText error>{getIn(formik.errors, 'section_name')}</FormHelperText>
            )}
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Short Name" />
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.section_short_name}
              name="section_short_name"
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Section Head ID" />*
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.sect_head_id}
              name="sect_head_id"
              onChange={formik.handleChange}
              fullWidth
              error={Boolean(getIn(formik.touched, 'sect_head_id') && getIn(formik.errors, 'sect_head_id'))}
            />
            {getIn(formik.touched, 'sect_head_id') && getIn(formik.errors, 'sect_head_id') && (
              <FormHelperText error>{getIn(formik.errors, 'sect_head_id')}</FormHelperText>
            )}
          </Grid>
          <Grid item xs={12} sm={8}>
            <InputLabel>
              <FormattedMessage id="Section Head Name" />*
            </InputLabel>
            <TextField size="small" value={formik.values.sect_head_name} name="sect_head_name" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
      </Card>
      <Card style={{ width: '100%', padding: '16px', marginTop: '16px' }}>
        <Box mb={2}>
          <Typography variant="h6" component="div" className="text-lg font-bold">
            <FormattedMessage id="Contact Details" />
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Address 1" />*
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.sect_addr1}
              name="sect_addr1"
              onChange={formik.handleChange}
              fullWidth
              error={Boolean(getIn(formik.touched, 'sect_addr1') && getIn(formik.errors, 'sect_addr1'))}
            />
            {getIn(formik.touched, 'sect_addr1') && getIn(formik.errors, 'sect_addr1') && (
              <FormHelperText error>{getIn(formik.errors, 'sect_addr1')}</FormHelperText>
            )}
          </Grid>
          {/* Address 2 */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Address 2" />
            </InputLabel>
            <TextField size="small" value={formik.values.sect_addr2} name="sect_addr2" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {/* Address 3 */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Address 3" />
            </InputLabel>
            <TextField size="small" value={formik.values.sect_addr3} name="sect_addr3" onChange={formik.handleChange} fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Phone" />
            </InputLabel>
            <TextField size="small" value={formik.values.phone} name="phone" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Email" />
            </InputLabel>
            <TextField size="small" value={formik.values.email} name="email" onChange={formik.handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Fax" />
            </InputLabel>
            <TextField size="small" value={formik.values.fax} name="fax" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
      </Card>

      <Card style={{ width: '100%', padding: '16px', marginTop: '16px' }}>
        <Box mb={2}>
          <Typography variant="h6" component="div" className="text-lg font-bold">
            <FormattedMessage id="Account Info" />
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Enterprise Code" />
            </InputLabel>
            <TextField size="small" value={formik.values.enterprice_code} name="enterprice_code" onChange={formik.handleChange} fullWidth />
          </Grid>

          {/* Staff Control A/C Group */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Staff Control A/C Group" />
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.staff_cntrl_ac_group}
              name="staff_cntrl_ac_group"
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {/* Staff Loan A/C Group */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Staff Loan A/C Group" />
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.staff_loan_ac_group}
              name="staff_loan_ac_group"
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>

          {/* Salary Expense A/C Code */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Salary Expense A/C Code" />
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.salary_expense_ac_code}
              name="salary_expense_ac_code"
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          {/* Expense Sub Type */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Expense Sub Type" />
            </InputLabel>
            <TextField
              size="small"
              value={formik.values.expense_sub_type}
              name="expense_sub_type"
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>

          {/* Expense Type */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Expense Type" />
            </InputLabel>
            <TextField size="small" value={formik.values.expense_type} name="expense_type" onChange={formik.handleChange} fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Remarks" />
            </InputLabel>
            <TextField size="small" value={formik.values.remarks} name="remarks" onChange={formik.handleChange} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="User ID" />
            </InputLabel>
            <TextField size="small" value={formik.values.user_id} name="user_id" onChange={formik.handleChange} fullWidth disabled />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Status" />
            </InputLabel>
            <TextField size="small" value={formik.values.status} name="status" onChange={formik.handleChange} fullWidth />
          </Grid>

          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Is Active?" />
            </InputLabel>
            <FormControlLabel
              control={<Checkbox onChange={(e) => formik.setFieldValue('status', e.target.checked ? 'Y' : 'N')} />}
              checked={formik.values.status === 'Y'}
              name="status"
              label={<FormattedMessage id="Yes/No" />}
            />
          </Grid>
        </Grid>
      </Card>
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddSectionForm;
