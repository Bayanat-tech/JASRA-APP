import { Autocomplete, Button, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { TAirfareHr, TAirport } from 'pages/WMS/types/employee-hr.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import HrServiceInstance from 'service/Service.hr';

export const AirfareInfo = ({
  handleNext,
  handleBack,
  airfareInfo,
  setAirfareInfo,
  submitting
}: {
  submitting: boolean;
  handleNext: () => void;
  handleBack: () => void;
  airfareInfo: TAirfareHr;
  setAirfareInfo: React.Dispatch<React.SetStateAction<TAirfareHr>>;
}) => {
  //--------------constants-----------
  // State to manage the open status of a modal
  const [open, setOpen] = useState(false);
  // Get the app state from the Redux store
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  // State to track if the form has been submitted
  const [isSubmitted, setIsSubmitted] = useState(false);

  //------------formik------------
  // Initialize formik with initial values and submit handler
  const formik = useFormik<TAirfareHr>({
    initialValues: airfareInfo,
    onSubmit: async (values) => {
      // Update airfare information and mark the form as submitted
      setAirfareInfo((prev) => ({ ...prev, ...values }));
      setIsSubmitted(() => true);
    }
  });

  //---------useQuery------------
  // Fetch airport data using a custom query hook
  const { data: airportData } = useQuery({
    queryKey: ['airport_data'],
    queryFn: async () => {
      // Fetch airport data from the HR service
      const response = await HrServiceInstance.getMasters(app, 'hrAirport');
      if (response) {
        return {
          tableData: response.tableData as TAirport[],
          count: response.count
        };
      }
      // Handle undefined case by returning empty data
      return { tableData: [], count: 0 };
    }
  });

  //----------handlers------------
  // Handler to close the modal
  const handleClose = () => {
    setOpen(false);
  };

  // Handler to open the modal
  const handleOpen = () => {
    setOpen(true);
  };

  //-----------useEffect----------
  // Effect to set formik values when airfareInfo changes
  useEffect(() => {
    if (!!airfareInfo && !!Object.keys(airfareInfo).length && !isSubmitted) {
      formik.setValues(airfareInfo);
    } else if (isSubmitted && JSON.stringify(airfareInfo) === JSON.stringify(formik.values)) {
      handleNext();
      setIsSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airfareInfo]);

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit}>
      <Grid container item xs={12} sm={6} rowGap={2}>
        <Grid item xs={12} marginBottom={2}>
          <Typography variant="h4" className="text-black py-2 font-semibold">
            <FormattedMessage id="Airfare Information" />
          </Typography>
        </Grid>
        {/* ----------Fare Code--------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Fare Code" />
          </InputLabel>
          <Autocomplete
            id="farCode"
            value={
              !!formik.values.airport_code
                ? airportData?.tableData.find((eachAirport) => eachAirport.airport_code === formik.values.airport_code)
                : ({ airport_name: '' } as TAirport)
            }
            onChange={(event, value: TAirport | null) => {
              if (value?.airport_code) formik.setFieldValue('airport_code', value?.airport_code);
            }}
            size="small"
            options={airportData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option?.airport_name}
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
        <Grid container item xs={12} spacing={{ sm: 8, xs: 2 }}>
          {/* -------Eligbility----------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Eligibily" />
            </InputLabel>
            <Select
              name="ticket_eligibility"
              size="small"
              fullWidth
              labelId="demo-controlled-open-select-label"
              id="eligibility"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              value={formik.values.ticket_eligibility}
              onChange={formik.handleChange}
            >
              <MenuItem value={'Y'}>
                <FormattedMessage id="Yes" />
              </MenuItem>
              <MenuItem value={'N'}>
                <FormattedMessage id="No" />
              </MenuItem>
            </Select>
          </Grid>
          {/* ---No. of Adult Depended------ */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="No. of Adult Depended" />
            </InputLabel>
            <TextField
              type="number"
              value={formik.values.ticket_dpend_adult}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              size="small"
              name="ticket_dpend_adult"
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container item spacing={{ sm: 4, xs: 2 }}>
          {/* -----Total No. of Adults------ */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="Total No. of Adults" />
            </InputLabel>
            <TextField
              type="number"
              value={formik.values.ta_no}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              size="small"
              name="ta_no"
              fullWidth
            />
          </Grid>
          {/* ------No. of Childrens-------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="No. of Childrens" />
            </InputLabel>
            <TextField
              type="number"
              value={formik.values.tc_no}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              size="small"
              name="tc_no"
              fullWidth
            />
          </Grid>

          {/* ------No. of Infants---------- */}
          <Grid item xs={12} sm={4}>
            <InputLabel>
              <FormattedMessage id="No. of Infants" />
            </InputLabel>
            <TextField
              type="number"
              value={formik.values.ti_no}
              inputProps={{ min: 0 }}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                const inputValue = event.target.value;
                if (inputValue.charAt(0) !== '-') {
                  formik.handleChange(event);
                }
              }}
              size="small"
              name="ti_no"
              fullWidth
            />
          </Grid>
        </Grid>

        {/* -------Ticket Once in Months------- */}
        <Grid item xs={12}>
          <InputLabel>
            <FormattedMessage id="Ticket Once in Months" />
          </InputLabel>
          <TextField
            type="number"
            value={formik.values.ticket_eligible_period}
            inputProps={{ min: 0 }}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
              const inputValue = event.target.value;
              if (inputValue.charAt(0) !== '-') {
                formik.handleChange(event);
              }
            }}
            size="small"
            name="ticket_eligible_period"
            fullWidth
          />
        </Grid>
      </Grid>

      {/* -----------Back and Next Button */}
      <Grid item xs={12} marginTop={{ sm: 29, xs: 18 }}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Back" />
          </Button>
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }} disabled={submitting}>
            <FormattedMessage id="Submit" />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};
