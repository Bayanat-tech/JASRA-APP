import { Grid, InputLabel, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface HRPassportInfoProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}
interface PassportFormData {
  PASSPORT_NO: string;
  PASSPORT_NAME: string;
  PPT_COUNTRY_NAME: string;
  PPT_STATUS: string;
  PPT_VALID_FROM: Date | null;
  PPT_VALID_TO: Date | null;
  PPT_WITH: string;
}

export const HRPassportInfo: React.FC<HRPassportInfoProps> = ({ employeeData, isEditMode }) => {
  const [formData, setFormData] = useState<PassportFormData>({
    PASSPORT_NO: '',
    PASSPORT_NAME: '',
    PPT_COUNTRY_NAME: '',
    PPT_STATUS: '',
    PPT_VALID_FROM: new Date(),
    PPT_VALID_TO: new Date(),
    PPT_WITH: ''
  });

  useEffect(() => {
    if (employeeData) {
      setFormData((prev) => ({
        ...prev,
        PASSPORT_NO: employeeData.PASSPORT_NO || '',
        PASSPORT_NAME: employeeData.PASSPORT_NAME || '',
        PPT_COUNTRY_NAME: employeeData.PPT_COUNTRY_NAME || '',
        PPT_STATUS: employeeData.PPT_STATUS || '',
        PPT_VALID_FROM: employeeData.PPT_VALID_FROM || '',
        PPT_VALID_TO: employeeData.PPT_VALID_TO || '',
        PPT_WITH: employeeData.PPT_WITH || ''
      }));
    }
  }, [employeeData]);
  console.log('Payroll formData:', formData);

  return (
    <Grid container xs={12} component={'form'}>
      <Grid container item xs={12} sm={6} rowGap={2}>
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Passport No." />
          </InputLabel>
          <TextField size="small" name="ppt_no" fullWidth disabled={!isEditMode} value={formData.PASSPORT_NO} />
        </Grid>
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Passport Name" />
          </InputLabel>
          <TextField size="small" name="ppt_name" fullWidth disabled={!isEditMode} value={formData.PASSPORT_NAME} />
        </Grid>
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Issued Country" />
          </InputLabel>
          <TextField size="small" name="ppt_name" fullWidth disabled={!isEditMode} value={formData.PPT_COUNTRY_NAME} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="Valid From" />
          </InputLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              value={formData.PPT_VALID_FROM ? dayjs(formData.PPT_VALID_FROM) : null}
              slotProps={{ textField: { size: 'small' } }}
              sx={{ width: '100%' }}
              name="ppt_valid_from"
              disabled={!isEditMode}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <InputLabel>
            <FormattedMessage id="Valid To" />
          </InputLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              format="DD/MM/YYYY"
              value={formData.PPT_VALID_TO ? dayjs(formData.PPT_VALID_TO) : null}
              slotProps={{ textField: { size: 'small' } }}
              sx={{ width: '100%' }}
              name="ppt_valid_to"
              disabled={!isEditMode}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Passport In Hand" />
          </InputLabel>
          <TextField size="small" name="ppt_name" fullWidth disabled={!isEditMode} value={formData.PPT_WITH} />
        </Grid>
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Status" />
          </InputLabel>
          <TextField size="small" name="ppt_name" fullWidth disabled={!isEditMode} value={formData.PPT_STATUS} />
        </Grid>
      </Grid>
    </Grid>
  );
};
