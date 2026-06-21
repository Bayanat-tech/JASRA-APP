// Import necessary components and hooks from MUI and other libraries
import {
  Button,
  Checkbox,
  CheckboxProps,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Radio,
  RadioGroup,
  RadioProps,
  styled
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import MainCard from 'components/MainCard';
import { useState } from 'react';
import pickingServiceInstance from 'service/wms/transaction/outbound/service.pickingDetailsWms';

// Styled component for custom radio button icon
const BpRadioIcon = styled('span')(({ theme }) => ({
  borderRadius: '50%',
  width: 16,
  height: 16,
  boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: '#f5f8fa',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2
  },
  'input:hover ~ &': {
    backgroundColor: '#ebf1f5',
    ...theme.applyStyles('dark', {
      backgroundColor: '#30404d'
    })
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(206,217,224,.5)',
    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)'
    })
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
    backgroundColor: '#394b59',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
  })
}));

// Styled component for custom checkbox icon
const BpCheckBoxIcon = styled('span')(({ theme }) => ({
  borderRadius: 3,
  width: 16,
  height: 16,
  boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: '#f5f8fa',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2
  },
  'input:hover ~ &': {
    backgroundColor: '#ebf1f5',
    ...theme.applyStyles('dark', {
      backgroundColor: '#30404d'
    })
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background: 'rgba(206,217,224,.5)',
    ...theme.applyStyles('dark', {
      background: 'rgba(57,75,89,.5)'
    })
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
    backgroundColor: '#394b59',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
  })
}));

// Styled component for checked radio button icon
const BpRadioCheckedIcon = styled(BpRadioIcon)({
  backgroundColor: '#137cbd',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&::before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
    content: '""'
  },
  'input:hover ~ &': {
    backgroundColor: '#106ba3'
  }
});

// Styled component for checked checkbox icon
const BpCheckedIcon = styled(BpCheckBoxIcon)({
  backgroundColor: '#137cbd',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&::before': {
    display: 'block',
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""'
  },
  'input:hover ~ &': {
    backgroundColor: '#106ba3'
  }
});

// Custom radio button component
function BpRadio(props: RadioProps) {
  return <Radio disableRipple color="default" checkedIcon={<BpRadioCheckedIcon />} icon={<BpRadioIcon />} {...props} />;
}

// Custom checkbox component
function BpCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      sx={{ '&:hover': { bgcolor: 'transparent' } }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpCheckBoxIcon />}
      inputProps={{ 'aria-label': 'Checkbox demo' }}
      {...props}
    />
  );
}
const PickingOption = ({
  handleSelectPickingOption
}: {
  handleSelectPickingOption: (preference: string, pick: string, min_qty: string, exp_period: string) => Promise<boolean>;
}) => {
  //-------------constants-------------
  // Options for preference radio buttons
  const preferenceOptions = [
    { value: 'none', label: 'None' },
    { value: 'Full Pallete', label: 'Full Pallete' },
    { value: 'Mixed Pallete', label: 'Mixed Pallete' },
    { value: 'Lead To Max Load', label: 'Lead To Max Load' }
  ];

  // State to manage the selected pick criteria
  const [pickCriteria, setPickCriteria] = useState({ preference: 'none', pick: '1', min_qty: 'N', exp_period: 'N' });

  // State to manage the submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  //----------- useQuery--------------
  // Fetch picking options data using react-query
  const { data: pickingOption } = useQuery({
    queryKey: ['picking_option'],
    queryFn: () => pickingServiceInstance.getPickingOptionData()
  });

  //-------------handlers-------------
  // Handler for changing pick criteria radio button
  const handlePickCriteria = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPickCriteria({ ...pickCriteria, pick: (event.target as HTMLInputElement).value });
  };

  // Handler for changing preference radio button
  const handlePickingOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPickCriteria({ ...pickCriteria, preference: (event.target as HTMLInputElement).value });
  };

  // Handler for changing minimum quantity checkbox
  const handleMinimumQuantityChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setPickCriteria({ ...pickCriteria, min_qty: checked ? 'Y' : 'N' });
  };

  // Handler for changing expiry period checkbox
  const handleExpiryPeriodChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setPickCriteria({ ...pickCriteria, exp_period: checked ? 'Y' : 'N' });
  };

  // Handler for form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response = await handleSelectPickingOption(
      pickCriteria.preference,
      pickCriteria.pick,
      pickCriteria.min_qty,
      pickCriteria.exp_period
    );
    if (!!response) {
      setIsSubmitting(false);
    }
  };
  return (
    <Grid container spacing={2}>
      {/* Grid container for layout */}
      <Grid item xs={12} sm={6}>
        {/* MainCard for Preference section */}
        <MainCard border={true} title="Preference" elevation={0}>
          <FormControl>
            {/* RadioGroup for preference options */}
            <RadioGroup defaultValue="none" value={pickCriteria.preference} onChange={handlePickingOptionChange}>
              {preferenceOptions?.map((eachPickingOption) => (
                // FormControlLabel for each preference option
                <FormControlLabel value={eachPickingOption.value} control={<BpRadio />} label={eachPickingOption.label} />
              ))}
            </RadioGroup>
          </FormControl>
        </MainCard>
        {/* FormGroup for checkboxes */}
        <FormGroup>
          {/* Checkbox for minimum quantity */}
          <FormControlLabel
            checked={pickCriteria.min_qty === 'Y'}
            label={'Least Qty'}
            value={pickCriteria.min_qty}
            control={<BpCheckbox onChange={handleMinimumQuantityChange} />}
          />
          {/* Checkbox for expiry period */}
          <FormControlLabel
            checked={pickCriteria.exp_period === 'Y'}
            label={'Ignore Minimum Exp Period'}
            value={pickCriteria.exp_period}
            control={<BpCheckbox onChange={handleExpiryPeriodChange} />}
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12} sm={6}>
        {/* MainCard for Pick Criteria section */}
        <MainCard border={true} title="Pick Criteria" elevation={0}>
          <FormControl>
            {/* RadioGroup for pick criteria options */}
            <RadioGroup defaultValue="none" value={pickCriteria.pick} onChange={handlePickCriteria}>
              {pickingOption?.map((eachPickingCriteria) => (
                // FormControlLabel for each pick criteria option
                <FormControlLabel value={eachPickingCriteria.wave_code} control={<BpRadio />} label={eachPickingCriteria.wave_name} />
              ))}
            </RadioGroup>
          </FormControl>
        </MainCard>
      </Grid>
      <Grid item xs={12} className="flex justify-end">
        {/* Submit button */}
        <Button disabled={isSubmitting} onClick={handleSubmit} variant="contained">
          Ok
        </Button>
      </Grid>
    </Grid>
  );
};

export default PickingOption;
