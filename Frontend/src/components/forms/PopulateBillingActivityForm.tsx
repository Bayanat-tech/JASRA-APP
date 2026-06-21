import { Autocomplete, Button, Grid, InputLabel, TextField } from '@mui/material';
import { TBillingActivity, TPopulate } from 'pages/WMS/types/billingActivity-wms.types';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import { useQuery } from '@tanstack/react-query';
import UniversalDialog from 'components/popup/UniversalDialog';
import PasswordForm from './common/PasswordForm';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import ActivityServiceInstance from 'service/GM/services.activity_wms';

/**
 * Component to populate billing activity form
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to close the form
 * @param {Boolean} props.isEditMode - Flag to check if it's in edit mode
 * @param {TBillingActivity} props.existingData - Existing data for billing activity
 * @param {String} props.prin_code - Principal code
 */
const PopulateBillingActivityForm = ({
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
  const [prinCode, setPrinCode] = useState<string>(''); // State to store principal code
  const [isSubmit, setIsSubmit] = useState<boolean>(false); // State to handle submit status
  const [passwordActivityFormPopup, setPasswordActivityFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'xs'
    },
    title: 'Add ActivityBilling'
  }); // State to handle password form popup
  const [password, setPassword] = useState<string>(''); // State to store password

  // Function to toggle password popup
  const togglePasswordPopup = (isFormSubmitting?: boolean) => {
    setPasswordActivityFormPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
    if (isFormSubmitting) {
      onClose();
    }
  };

  // Function to handle password form
  const handlePasswordForm = () => {
    setPasswordActivityFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const { app } = useSelector((state: any) => state.menuSelectionSlice); // Get app state from store

  // Fetch principal list using useQuery
  const { data: principalList } = useQuery({
    queryKey: ['principal_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'principal', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TPrincipalWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  // Function to handle form submission
  const handleSubmit = async () => {
    setIsSubmit(true);
    let response;
    const values: TPopulate = {
      from: prin_code,
      to: prinCode,
      activityPassword: password
    };
    response = await ActivityServiceInstance.copyBilling(values);
    if (response) {
      onClose(true);
      setIsSubmit(false);
    }
    togglePasswordPopup(response === true);
    onClose(true);
  };

  return (
    <Grid container spacing={2}>
      {/* From Principal */}
      <Grid item xs={12} sm={12}>
        <InputLabel>
          <FormattedMessage id="From" />
        </InputLabel>
        <TextField id="outlined-basic" variant="outlined" value={prin_code} disabled fullWidth />
      </Grid>
      {/* To Principal */}
      <Grid item xs={12} className="pb-40">
        <InputLabel>
          <FormattedMessage id="To" />
        </InputLabel>
        <Autocomplete
          value={
            !!prinCode
              ? principalList?.tableData.find((eachPrincipal) => eachPrincipal.prin_code === prinCode)
              : ({ prin_name: '' } as TPrincipalWms)
          }
          onChange={(event, value: TPrincipalWms | null) => {
            if (value) setPrinCode(value?.prin_code as string);
          }}
          disablePortal
          getOptionLabel={(option) => option.prin_name}
          getOptionDisabled={(option) => option.prin_code === prin_code}
          options={principalList?.tableData ?? []}
          renderInput={(params: any) => <TextField {...params} />}
          fullWidth
        />
      </Grid>
      {/* Submit Button */}
      <Grid item xs={12} className="flex justify-end">
        <Button disabled={prinCode === '' ? true : false} onClick={handlePasswordForm} variant="contained">
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
      {/* Password Form Popup */}
      {!!passwordActivityFormPopup && passwordActivityFormPopup.action.open && (
        <UniversalDialog
          action={{ ...passwordActivityFormPopup.action }}
          onClose={() => togglePasswordPopup()}
          title={<FormattedMessage id="Enter Password" />}
          primaryButonTitle="Submit"
          onSave={handleSubmit}
          disablePrimaryButton={password === '' || isSubmit === true}
        >
          <PasswordForm password={password} setPassword={setPassword} />
        </UniversalDialog>
      )}
    </Grid>
  );
};

export default PopulateBillingActivityForm;
