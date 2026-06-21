import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { FormHelperText, Grid, InputLabel, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getIn, useFormik } from 'formik';
import { TLevelThreeAcTree } from 'pages/Finance/types/acTree.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import AcTreeServiceInstance from 'service/Finance/Accounts/Masters/GM/service.actree';
import * as yup from 'yup';

const AddLevelThreeFinanceForm = ({
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
    queryKey: ['acc_level_1'],
    queryFn: () => AcTreeServiceInstance.getLevelThreeData(ac_code as string),
    enabled: !!isEditMode
  }); // Query to fetch level three account data

  //---------------formik------------
  const formik = useFormik<TLevelThreeAcTree>({
    initialValues: { l3_description: '', l3_code: '', l2_code: parent_code },
    validationSchema: yup.object().shape({
      l2_code: yup.string().required('This field is required'),
      l3_description: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      delete values.l3_code;
      if (isEditMode && !!ac_code) {
        response = await AcTreeServiceInstance.updateLevelThreeItem(ac_code, values);
      } else {
        response = await AcTreeServiceInstance.addLevelThreeItem(values);
      }
      setSubmitting(false);

      if (response) onClose();
    }
  }); // Formik setup for form handling

  //-----------useEffect--------------
  useEffect(() => {
    if (isEditMode && levelData && Object.keys(levelData).length > 0 && !isLevelDataFetching) {
      const { l3_description, l2_code, l3_code } = levelData;
      formik.setValues({ l3_description, l2_code, l3_code });
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
            value={formik.values.l3_code}
            name="l3_code"
            disabled
            onChange={formik.handleChange}
            fullWidth
            error={Boolean(getIn(formik.touched, 'l3_code') && getIn(formik.errors, 'l3_code'))}
          />
          {getIn(formik.touched, 'l3_code') && getIn(formik.errors, 'l3_code') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'l3_code')}
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
          value={formik.values.l3_description}
          name="l3_description"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'l3_description') && getIn(formik.errors, 'l3_description'))}
        />
        {getIn(formik.touched, 'l3_description') && getIn(formik.errors, 'l3_description') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'l3_description')}
          </FormHelperText>
        )}
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

export default AddLevelThreeFinanceForm;
