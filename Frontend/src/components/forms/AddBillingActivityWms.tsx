import { Button, Autocomplete, Grid, TextField, InputLabel, Select, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { TBillingActivity } from 'pages/WMS/types/billingActivity-wms.types';
import { TActivityWms } from 'pages/WMS/types/activity-wms.types';
import { TUocWms } from 'pages/WMS/types/TUoc-wms.types';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import PasswordForm from './common/PasswordForm';
import UniversalDialog from 'components/popup/UniversalDialog';
import ActivityServiceInstance from 'service/GM/services.activity_wms';

const AddBillingActivityWmsForm = ({
  onClose,
  isEditMode,
  existingData,
  prin_code
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TBillingActivity;
  prin_code: string;
}) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [passwordActivityFormPopup, setPasswordActivityFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },
    title: 'Add ActivityBilling'
  });
  const [password, setPassword] = useState<string>('');

  // Toggle the password popup
  const togglePasswordPopup = (isFormSubmitting?: boolean) => {
    setPasswordActivityFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
    if (isFormSubmitting) {
      onClose();
    }
  };

  // Handle password form submission
  const handlePasswordForm = () => {
    setPasswordActivityFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  // Initialize formik for form handling
  const formik = useFormik<TBillingActivity>({
    initialValues: {
      prin_code: prin_code,
      act_code: '',
      jobtype: '',
      uoc: '',
      moc1: '',
      moc2: '',
      bill_amount: null as unknown as number,
      cost: null as unknown as number
    },
    onSubmit: () => handlePasswordForm()
  });

  // Fetch activity data using react-query
  const { data: activityData } = useQuery({
    queryKey: ['activity_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'activity');
      if (response) {
        return {
          tableData: response.tableData as TActivityWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch UOC data using react-query
  const { data: UOCData } = useQuery({
    queryKey: ['uoc'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'uoc');
      if (response) {
        return {
          tableData: response.tableData as TUocWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch MOC1 data using react-query
  const { data: MOC1Data } = useQuery({
    queryKey: ['moc1'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'moc1');
      if (response) {
        return {
          tableData: response.tableData as TUocWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Fetch MOC2 data using react-query
  const { data: MOC2Data } = useQuery({
    queryKey: ['moc2'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'moc2');
      if (response) {
        return {
          tableData: response.tableData as TUocWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmit(true);
    let response, values;
    values = { ...formik.values, activityPassword: password };
    if (isEditMode) {
      response = await ActivityServiceInstance.editActivity(values, existingData.act_code);
    } else {
      response = await ActivityServiceInstance.addBilling(values);
    }
    if (response) {
      onClose(true);
      setIsSubmit(false);
    }
    togglePasswordPopup(response === true);
    onClose(true);
  };

  // Set form values if in edit mode
  useEffect(() => {
    if (isEditMode && !!existingData) {
      formik.setValues({
        prin_code: existingData.prin_code,
        act_code: existingData.act_code,
        jobtype: existingData.jobtype,
        uoc: existingData.uoc,
        moc1: existingData.moc1,
        moc2: existingData.moc2,
        bill_amount: existingData.bill_amount,
        cost: existingData.cost
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        {/*----------------------Prin Code-------------------------- */}
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="Principal" />
          </InputLabel>
          {/* Principal Code TextField */}
          <TextField id="outlined-basic" variant="outlined" value={formik.values.prin_code} disabled fullWidth size="small" />
        </Grid>
        {/*----------------------Activity-------------------------- */}
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="Activity" />
          </InputLabel>
          {/* Activity Autocomplete */}
          <Autocomplete
            id="act_code"
            value={
              !!formik.values.act_code
                ? activityData?.tableData.find((eachActivity) => eachActivity.activity_code === formik.values.act_code)
                : ({ activity: '' } as TActivityWms)
            }
            onChange={(event, value: TActivityWms | null) => {
              formik.setFieldValue('act_code', value?.activity_code);
            }}
            size="small"
            options={activityData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.activity}
            isOptionEqualToValue={(option) => option.activity_code === formik.values.act_code}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
        </Grid>
        {/*----------------------Act code-------------------------- */}
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="ACT CODE" />
          </InputLabel>
          {/* Act Code TextField */}
          <TextField
            id="outlined-basic"
            name="act_code"
            variant="outlined"
            disabled
            value={formik.values.act_code}
            fullWidth
            size="small"
          />
        </Grid>
        {/*----------------------Job Type-------------------------- */}
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="Job Type" />
          </InputLabel>
          {/* Job Type Select */}
          <Select value={formik.values.jobtype} onChange={formik.handleChange} name="jobtype" fullWidth size="small">
            <MenuItem value={'IMP'}>Import</MenuItem>
            <MenuItem value={'EXP'}>Export</MenuItem>
            <MenuItem value={'TFR'}>Transfer</MenuItem>
          </Select>
        </Grid>
        {/*----------------------Uoc-------------------------- */}
        <Grid item xs={4}>
          <InputLabel>
            <FormattedMessage id="UOC" />
          </InputLabel>
          {/* UOC Autocomplete */}
          <Autocomplete
            id="uoc"
            value={
              !!formik.values.uoc
                ? UOCData?.tableData?.find((eachUoc) => eachUoc.charge_code === formik.values.uoc)
                : ({ description: '' } as TUocWms)
            }
            onChange={(event, value: TUocWms | null) => {
              formik.setFieldValue('uoc', value?.charge_code);
            }}
            size="small"
            options={UOCData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.description}
            isOptionEqualToValue={(option) => option.charge_code === formik.values.uoc}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <InputLabel>
            <FormattedMessage id="MOC1" />
          </InputLabel>
          {/* MOC1 Autocomplete */}
          <Autocomplete
            id="moc1"
            value={
              !!formik.values.moc1
                ? MOC1Data?.tableData.find((eachUoc) => eachUoc.charge_code === formik.values.moc1)
                : ({ description: '' } as TUocWms)
            }
            onChange={(event, value: TUocWms | null) => {
              formik.setFieldValue('moc1', value?.charge_code);
            }}
            size="small"
            options={MOC1Data?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.description}
            isOptionEqualToValue={(option) => option.charge_code === formik.values.moc1}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <InputLabel>
            <FormattedMessage id="MOĆ2" />
          </InputLabel>
          {/* MOC2 Autocomplete */}
          <Autocomplete
            id="moc2"
            value={
              !!formik.values.moc2
                ? MOC2Data?.tableData.find((eachUoc) => eachUoc.charge_code === formik.values.moc2)
                : ({ description: '' } as TUocWms)
            }
            onChange={(event, value: TUocWms | null) => {
              formik.setFieldValue('moc2', value?.charge_code);
            }}
            size="small"
            options={MOC2Data?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.description}
            isOptionEqualToValue={(option) => option.charge_code === formik.values.moc2}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
              />
            )}
          />
        </Grid>
        {/*----------------------Bill Amount-------------------------- */}
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="BILL AMOUNT" />
          </InputLabel>
          {/* Bill Amount TextField */}
          <TextField
            name="bill_amount"
            id="outlined-basic"
            type="number"
            variant="outlined"
            value={formik.values.bill_amount}
            inputProps={{ min: 0 }}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
              const inputValue = event.target.value;
              if (inputValue.charAt(0) !== '-') {
                formik.handleChange(event);
              }
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' }
              }
            }}
            fullWidth
            size="small"
          />
        </Grid>
        {/*----------------------Cost-------------------------- */}
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="COST" />
          </InputLabel>
          {/* Cost TextField */}
          <TextField
            name="cost"
            value={formik.values.cost}
            inputProps={{ min: 0 }}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
              const inputValue = event.target.value;
              if (inputValue.charAt(0) !== '-') {
                formik.handleChange(event);
              }
            }}
            InputProps={{
              inputProps: {
                style: { textAlign: 'right' }
              }
            }}
            fullWidth
            id="outlined-basic"
            type="number"
            variant="outlined"
            size="small"
          />
        </Grid>
        {/*----------------------Submit Button-------------------------- */}
        <Grid item xs={12} className="flex justify-end">
          <Button type="submit" variant="contained" id="dsds">
            <FormattedMessage id="Submit" />
          </Button>
        </Grid>
      </Grid>
      {/* Add Password Dialogue Box */}
      {!!passwordActivityFormPopup && passwordActivityFormPopup.action.open && (
        <UniversalDialog
          action={{ ...passwordActivityFormPopup.action }}
          onClose={() => togglePasswordPopup()}
          title={<FormattedMessage id="Enter Password" />}
          primaryButonTitle="Submit"
          onSave={handleSubmit}
          disablePrimaryButton={password === '' || isSubmit === true}
        >
          {/* Password Form Component */}
          <PasswordForm password={password} setPassword={setPassword} />
        </UniversalDialog>
      )}
    </form>
  );
};

export default AddBillingActivityWmsForm;
