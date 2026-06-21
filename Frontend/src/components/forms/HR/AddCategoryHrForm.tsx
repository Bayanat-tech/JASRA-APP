import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TCategory } from 'pages/HR/type/AddCategoryHr.types';
import { useEffect } from 'react';
import hrCategoyServiceInstance from 'service/HR/HRCategoryService';
// import { useSelector } from 'store';
import { FormattedMessage } from 'react-intl';

const AddCategoryForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TCategory;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  // const { app } = useSelector((state) => state.menuSelectionSlice);

  console.log(user);
  console.log('Show User Details');

  const formik = useFormik<TCategory>({
    initialValues: {
      company_code: user?.company_code,
      category_code: '',
      category_name: '',
      category_short_name: '',
      remarks: '',

      status: 'active' // Default value, adjust as necessary
    },
    // validationSchema: yup.object().shape({
    //   category_code: yup.string().required('This field is required'),
    //   category_name: yup.string().required('This field is required')
    // }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await hrCategoyServiceInstance.editHrCategory(values);
      } else {
        response = await hrCategoyServiceInstance.addHrCategory(values);
      }
      if (response) {
        onClose(true);
      }
      setSubmitting(false);
    }
  });

  useEffect(() => {
    if (isEditMode && existingData) {
      const { ...categoryData } = existingData;
      formik.setValues(categoryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Company Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.company_code}
          name="company_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'company_code') && getIn(formik.errors, 'company_code'))}
        />
        {getIn(formik.touched, 'company_code') && getIn(formik.errors, 'company_code') && (
          <FormHelperText error>{getIn(formik.errors, 'company_code')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Category Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.category_code}
          name="category_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'category_code') && getIn(formik.errors, 'category_code'))}
        />
        {getIn(formik.touched, 'category_code') && getIn(formik.errors, 'category_code') && (
          <FormHelperText error>{getIn(formik.errors, 'category_code')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Category Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.category_name}
          name="category_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'category_name') && getIn(formik.errors, 'category_name'))}
        />
        {getIn(formik.touched, 'category_name') && getIn(formik.errors, 'category_name') && (
          <FormHelperText error>{getIn(formik.errors, 'category_name')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Category Short Name" />
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.category_short_name}
          name="category_short_name"
          onChange={formik.handleChange}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Remarks" />
        </InputLabel>
        <TextField size="small" value={formik.values.remarks} name="remarks" onChange={formik.handleChange} fullWidth />
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Status" />
        </InputLabel>
        <FormControlLabel
          control={
            <Checkbox
              checked={formik.values.status === 'A'}
              onChange={(event) => {
                formik.setFieldValue('status', event.target.checked ? 'A' : 'N');
              }}
            />
          }
          label={<FormattedMessage id="Active" />}
        />
      </Grid>
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

export default AddCategoryForm;
