import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TActivitysubgroup } from 'pages/WMS/types/activitysubgroup-wms';
import { useEffect } from 'react';
import GmServiceInstance from 'service/wms/services.gm_wms';
import * as yup from 'yup';

const AddActivitySubgroupWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TActivitysubgroup;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TActivitysubgroup>({
    initialValues: { act_subgroup_name: '', activity_subgroup_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      activity_subgroup_code: yup.string().required('This field is required'),
      act_subgroup_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await GmServiceInstance.editActivitysubgroup(values);
      } else {
        response = await GmServiceInstance.addActivitysubgroup(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  useEffect(() => {
    console.log(formik.errors);
  }, [formik.errors]);

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={6}>
        <InputLabel>Activity Subgroup Code*</InputLabel>
        <TextField
          value={formik.values.activity_subgroup_code}
          name="activity_subgroup_code"
           fullWidth
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'activity_subgroup_code') && getIn(formik.errors, 'activity_subgroup_code'))}
        />
        {getIn(formik.touched, 'activity_subgroup_code') && getIn(formik.errors, 'activity_subgroup_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'activity_subgroup_code')}
          </FormHelperText>
        )}
      </Grid>
       <Grid item xs={12} sm={6}>
        <InputLabel>Act Group Code*</InputLabel>
        <TextField
          value={formik.values.act_group_code}
          name="act_group_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'act_group_code') && getIn(formik.errors, 'act_group_code'))}
        />
        {getIn(formik.touched, 'act_group_code') && getIn(formik.errors, 'act_group_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'act_group_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={12}>
        <InputLabel>Subgroup Name*</InputLabel>
        <TextField
          value={formik.values.act_subgroup_name}
          name="act_subgroup_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'act_subgroup_name') && getIn(formik.errors, 'act_subgroup_name'))}
        />
        {getIn(formik.touched, 'act_subgroup_name') && getIn(formik.errors, 'act_subgroup_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'act_subgroup_name')}
          </FormHelperText>
        )}
      </Grid>
     
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          // variant="contained"
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
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddActivitySubgroupWmsForm;
