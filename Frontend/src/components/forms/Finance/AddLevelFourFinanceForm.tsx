import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getIn, useFormik } from 'formik';
import { TLevelFourAcTree } from 'pages/Finance/types/acTree.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import AcTreeServiceInstance from 'service/Finance/Accounts/Masters/GM/service.actree';
import * as yup from 'yup';

const AddLevelFourFinanceForm = ({
  onClose,
  isEditMode,
  ac_code,
  parent_code
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  ac_code?: string;
  parent_code: string;
}) => {
  //-------------useQuery-----------
  const { data: levelData, isFetching: isLevelDataFetching } = useQuery({
    queryKey: ['acc_level_4'],
    queryFn: () => AcTreeServiceInstance.getLevelFourData(ac_code as string),
    enabled: !!isEditMode
  }); // Query to fetch level four account data

  //---------------formik------------
  const formik = useFormik<TLevelFourAcTree>({
    initialValues: { l4_description: '', l4_code: '', l4_type: 'N', l4_bill: 'N', l4_job: 'N', l3_code: parent_code },
    validationSchema: yup.object().shape({
      l4_description: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      delete values.l4_code;

      if (isEditMode && !!ac_code) {
        response = await AcTreeServiceInstance.updateLevelFourItem(ac_code, values);
      } else {
        response = await AcTreeServiceInstance.addLevelFourItem(values);
      }
      setSubmitting(false);
      if (response) onClose();
    }
  }); // Formik setup for form handling

  //-----------useEffect--------------
  useEffect(() => {
    if (levelData && Object.keys(levelData).length > 0 && !isLevelDataFetching) {
      const { l4_code, l4_description, l4_type, l4_bill, l4_job, l3_code } = levelData;
      formik.setValues({ l4_code, l4_description, l4_type, l4_bill, l4_job, l3_code });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData]); // Effect to set form values when levelData changes

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/*----------------------Code-------------------------- */}
      {isEditMode && (
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="Code" />
          </InputLabel>
          <TextField
            value={formik.values.l4_code}
            name="l4_code"
            disabled
            onChange={formik.handleChange}
            fullWidth
            error={Boolean(getIn(formik.touched, 'l4_code') && getIn(formik.errors, 'l4_code'))}
          />
          {getIn(formik.touched, 'l4_code') && getIn(formik.errors, 'l4_code') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'l4_code')}
            </FormHelperText>
          )}
        </Grid>
      )}
      {/*----------------------Description-------------------------- */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Description" /> <span className="text-red-500">*</span>
        </InputLabel>
        <TextField
          value={formik.values.l4_description}
          name="l4_description"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'l4_description') && getIn(formik.errors, 'l4_description'))}
        />
        {getIn(formik.touched, 'l4_description') && getIn(formik.errors, 'l4_description') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'l4_description')}
          </FormHelperText>
        )}
      </Grid>
      {/*----------------------Status-------------------------- */}
      <Grid item xs={12} sm={6}>
        <InputLabel id="l4_type">Type</InputLabel>
        <Select value={formik.values.l4_type} onChange={formik.handleChange} name="l4_type" fullWidth>
          <MenuItem value={'Y'}>Y</MenuItem>
          <MenuItem value={'N'}>N</MenuItem>
        </Select>
      </Grid>
      {/*----------------------Invoice Spitting-------------------------- */}
      <Grid item xs={12} sm={3}>
        <InputLabel>Invoice Spitting</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={(event, checked) => formik.setFieldValue('l4_bill', checked ? 'Y' : 'N')} />}
          checked={formik.values.l4_bill === 'Y'}
          name="l4_bill"
          label={'Invoice Splitting'}
          value={formik.values.l4_bill}
        />
      </Grid>
      {/*----------------------Job-------------------------- */}
      <Grid item xs={12} sm={3}>
        <InputLabel>Job</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={(event, checked) => formik.setFieldValue('l4_job', checked ? 'Y' : 'N')} />}
          checked={formik.values.l4_job === 'Y'}
          name="l4_job"
          label={'Job'}
          value={formik.values.l4_job}
        />
      </Grid>
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting} // Disable button while form is submitting
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />} // Show loading icon if submitting, otherwise show save icon
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddLevelFourFinanceForm;
