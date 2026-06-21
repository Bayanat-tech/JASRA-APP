import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useEffect } from 'react';
import activitygroupServiceInstance from 'service/GM/service.activitygroup_wms';
import * as yup from 'yup';

//import TActivityGroup
import { TActivityGroup } from 'pages/WMS/types/ActivityGroup-wms.types';

const AddActivityGroupWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TActivityGroup;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TActivityGroup>({
    initialValues: { act_group_name: '', activity_group_code: '', company_code: user?.company_code },

    validationSchema: yup.object().shape({
      activity_group_code: yup.string().required('This field is required'),
      act_group_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await activitygroupServiceInstance.editActivityGroup(values);
      } else {
        response = await activitygroupServiceInstance.addActivityGroup(values);
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
  //------------------Handlers------------
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...activitygroupData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(activitygroupData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Activity Group Code*</InputLabel>
        <TextField
          value={formik.values.activity_group_code}
          name="activity_group_code"
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'activity_group_code') && getIn(formik.errors, 'activity_group_code'))}
        />
        {getIn(formik.touched, 'activity_group_code') && getIn(formik.errors, 'activity_group_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'activity_group_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Activity Group Name*</InputLabel>
        <TextField
          value={formik.values.act_group_name}
          name="act_group_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'act_group_name') && getIn(formik.errors, 'act_group_name'))}
        />
        {getIn(formik.touched, 'act_group_name') && getIn(formik.errors, 'act_group_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'act_group_name')}
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

export default AddActivityGroupWmsForm;
