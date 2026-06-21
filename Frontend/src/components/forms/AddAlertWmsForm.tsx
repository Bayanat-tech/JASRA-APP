import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel, TextField } from '@mui/material';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TAlert } from 'pages/WMS/types/AlertWms_type';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import alertServiceInstance from 'service/GM/service.alert_wms';
import * as yup from 'yup';

const AddAlertForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TAlert;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TAlert>({
    initialValues: {
      company_code: user?.company_code || '',
      op_code: '',
      op_type: '',
      op_desc: '',
      op_sequence: '',
      op_module: '',
      op_mode: '',
      instruction: 'N'
    },
    validationSchema: yup.object().shape({
      op_code: yup.number().required('This field is required'),
      op_type: yup.string().required('This field is required'),
      op_desc: yup.string().required('This field is required'),
      op_sequence: yup.number().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await alertServiceInstance.editAlert(values);
      } else {
        response = await alertServiceInstance.addAlert(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });

  //------------------Handlers------------
  const handleInstructionChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    formik.setFieldValue('instruction', checked ? 'Y' : 'N');
  };

  //------------------useEffect------------
  useEffect(() => {
    if (isEditMode) {
      const { ...alertData } = existingData;

      formik.setValues(alertData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Operation Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.op_code}
          name="op_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'op_code') && getIn(formik.errors, 'op_code'))}
        />
        {getIn(formik.touched, 'op_code') && getIn(formik.errors, 'op_code') && (
          <FormHelperText error>{getIn(formik.errors, 'op_code')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Operation Type" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.op_type}
          name="op_type"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'op_type') && getIn(formik.errors, 'op_type'))}
        />
        {getIn(formik.touched, 'op_type') && getIn(formik.errors, 'op_type') && (
          <FormHelperText error>{getIn(formik.errors, 'op_type')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Operation Description" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.op_desc}
          name="op_desc"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'op_desc') && getIn(formik.errors, 'op_desc'))}
        />
        {getIn(formik.touched, 'op_desc') && getIn(formik.errors, 'op_desc') && (
          <FormHelperText error>{getIn(formik.errors, 'op_desc')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Operation Sequence" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.op_sequence}
          name="op_sequence"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'op_sequence') && getIn(formik.errors, 'op_sequence'))}
        />
        {getIn(formik.touched, 'op_sequence') && getIn(formik.errors, 'op_sequence') && (
          <FormHelperText error>{getIn(formik.errors, 'op_sequence')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Operation Module" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.op_module}
          name="op_module"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'op_module') && getIn(formik.errors, 'op_module'))}
        />
        {getIn(formik.touched, 'op_module') && getIn(formik.errors, 'op_seqop_moduleuence') && (
          <FormHelperText error>{getIn(formik.errors, 'op_module')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Operation Mode" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.op_mode}
          name="op_mode"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'op_mode') && getIn(formik.errors, 'op_mode'))}
        />
        {getIn(formik.touched, 'op_mode') && getIn(formik.errors, 'op_mode') && (
          <FormHelperText error>{getIn(formik.errors, 'op_mode')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Is Instruction?" />
        </InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleInstructionChange} />}
          checked={formik.values.instruction === 'Y'}
          name="instruction"
          label={<FormattedMessage id="Yes/No" />}
        />
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
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddAlertForm;
