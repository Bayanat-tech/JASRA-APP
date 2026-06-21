import { Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TEMPLOYEES } from 'pages/WMS/types/employee-hr.types';

interface HRIdCardInfoProps {
  initialData?: Partial<TEMPLOYEES>;
  isEditMode: boolean;
  employeeData?: TEMPLOYEES;
}

export const HRIdCardInfo: React.FC<HRIdCardInfoProps> = ({ employeeData, isEditMode }) => {
  return (
    <Grid container xs={12} component={'form'}>
      <Grid container item xs={12} sm={6} rowGap={2}>
        <Grid container item xs={12} spacing={{ sm: 9, xs: 2 }}>
          {/* -----------Id Labourcard No.--------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="ID/Labourcard No." />
            </InputLabel>
            <TextField
              type="text"
              inputProps={{ min: 0 }}
              name="labourcard_no"
              value={employeeData?.LABOUR_CARD_NO || ''}
              size="small"
              fullWidth
              disabled={!isEditMode}
            />
          </Grid>

          {/* ------------PASI No.---------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="PASI No." />
            </InputLabel>
            <TextField
              type="text"
              inputProps={{ min: 0 }}
              name="pasi_no"
              value={employeeData?.PASI_NO || ''}
              size="small"
              fullWidth
              disabled={!isEditMode}
            />
          </Grid>
        </Grid>

        <Grid container item xs={12} spacing={{ sm: 6, xs: 2 }}>
          {/* ------------Valid From----------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid From" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                // value={employeeData?.labourcard_valid_from ? dayjs(employeeData.labourcard_valid_from) : null} // set later
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="labourcard_valid_from"
                disabled={!isEditMode}
              />
            </LocalizationProvider>
            {/* <FormHelperText error id="helper-text-labourcard_valid_from">{/* error message * /}</FormHelperText> */}
          </Grid>

          {/* -------------Valid To------------------ */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Valid To" />
              {/* <span className="text-red-500">*</span> */}
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                // minDate={employeeData?.labourcard_valid_from ? dayjs(employeeData.labourcard_valid_from) : undefined} // set later
                // value={employeeData?.labourcard_valid_to ? dayjs(employeeData.labourcard_valid_to) : null} // set later
                // onChange={} // set handler later
                slotProps={{ textField: { size: 'small' } }}
                sx={{ width: '100%' }}
                name="labourcard_valid_to"
                disabled={!isEditMode}
              />
            </LocalizationProvider>
            {/* <FormHelperText error id="helper-text-labourcard_valid_to">{/* error message * /}</FormHelperText> */}
          </Grid>
        </Grid>

        {/* ----------------Status----------------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Status" />
            {/* <span className="text-red-500">*</span> */}
          </InputLabel>
          <Select
            name="labourcard_status"
            size="small"
            fullWidth
            labelId="demo-controlled-open-select-label"
            id="labourcard_status"
            // value={employeeData?.labourcard_status || ''}

            disabled={!isEditMode}
          >
            <MenuItem value={'A'}>
              <FormattedMessage id="Valid" />
            </MenuItem>
            <MenuItem value={'I'}>
              <FormattedMessage id="Expired" />
            </MenuItem>
          </Select>
        </Grid>
      </Grid>
    </Grid>
  );
};
