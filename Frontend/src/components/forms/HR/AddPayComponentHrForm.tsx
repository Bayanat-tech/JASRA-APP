import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPaycomponent } from 'pages/HR/type/AddPaycontrollerHr.types';
import { useEffect } from 'react';
import hrPayComponentInstance from 'service/HR/HRPaycomponenteService';
import * as yup from 'yup';
// import { useSelector } from 'store';
import { FormattedMessage } from 'react-intl';

const AddPaycomponentForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TPaycomponent;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  // const { app } = useSelector((state) => state.menuSelectionSlice);

  const formik = useFormik<TPaycomponent>({
    initialValues: {
      company_code: user?.company_code,
      pay_comp_id: '',
      pay_comp_desc: '',
      remarks: ''
    },
    validationSchema: yup.object().shape({
      pay_comp_id: yup.string().required('This field is required'),
      pay_comp_desc: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await hrPayComponentInstance.editHrPaycomponent(values);
      } else {
        response = await hrPayComponentInstance.addHrPaycomponent(values);
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
          <FormattedMessage id="Pay comp id" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.pay_comp_id}
          name="pay_comp_id"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'pay_comp_id') && getIn(formik.errors, 'pay_comp_id'))}
        />
        {getIn(formik.touched, 'pay_comp_id') && getIn(formik.errors, 'pay_comp_id') && (
          <FormHelperText error>{getIn(formik.errors, 'pay_comp_id')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Pay Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.pay_comp_desc}
          name="pay_comp_desc"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'pay_comp_desc') && getIn(formik.errors, 'pay_comp_desc'))}
        />
        {getIn(formik.touched, 'pay_comp_desc') && getIn(formik.errors, 'pay_comp_desc') && (
          <FormHelperText error>{getIn(formik.errors, 'pay_comp_desc')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Remarks" />
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.remarks}
          name="remarks"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks'))}
        />
        {getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks') && (
          <FormHelperText error>{getIn(formik.errors, 'remarks')}</FormHelperText>
        )}
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

export default AddPaycomponentForm;
