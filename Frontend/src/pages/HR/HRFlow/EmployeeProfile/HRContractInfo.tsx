import { Grid, InputLabel, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormattedMessage } from 'react-intl';
//import { useEffect, useState } from 'react';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface HRContractInfoProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

interface ContactFormData {
  CONTRACT_TYPE: string;
  CONTRACT_TYPE_DESC: string;
  CONTRACT_START_DATE: Date;
  CONTRACT_END_DATE: Date;
  CONTRACT_RENEW: string;
}

export const HRContractInfo: React.FC<HRContractInfoProps> = ({ employeeData, isEditMode }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    CONTRACT_TYPE: '',
    CONTRACT_TYPE_DESC: '',
    CONTRACT_START_DATE: new Date(),
    CONTRACT_END_DATE: new Date(),
    CONTRACT_RENEW: ''
  });

  useEffect(() => {
    if (employeeData) {
      setFormData((prev) => ({
        ...prev,
        CONTRACT_TYPE: employeeData.CONTRACT_TYPE || '',
        CONTRACT_START_DATE: employeeData.CONTRACT_START_DATE || '',
        CONTRACT_END_DATE: employeeData.CONTRACT_END_DATE || '',
        CONTRACT_RENEW: employeeData.CONTRACT_RENEW || ''
      }));
    }
  }, [employeeData]);

  return (
    <Grid container xs={12} component={'form'}>
      <Grid container item xs={12} sm={6} rowGap={2}>
        {/* Contract Type */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Contract Type" />
          </InputLabel>
          <TextField size="small" fullWidth disabled={!isEditMode} name="contract_type" value={formData.CONTRACT_TYPE} />
        </Grid>

        {/* Start and End Date */}
        <Grid container item xs={12} spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Start Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formData.CONTRACT_START_DATE ? dayjs(formData.CONTRACT_START_DATE) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                disabled={!isEditMode}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="End Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                value={formData.CONTRACT_END_DATE ? dayjs(formData.CONTRACT_END_DATE) : null}
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                disabled={!isEditMode}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        {/* Renewable */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Renewable" />
          </InputLabel>
          <TextField size="small" fullWidth disabled={!isEditMode} name="contract_type" value={formData.CONTRACT_RENEW} />
        </Grid>
      </Grid>
    </Grid>
  );
};
