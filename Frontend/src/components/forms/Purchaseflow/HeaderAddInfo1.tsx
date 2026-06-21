// Updated New Tab Component
import React from 'react';
import { TextField, Grid, MenuItem, Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import { TBasicPrrequest } from 'pages/Purchasefolder/type/purchaserequestheader_pf-types';
import dayjs from 'dayjs';
type HeaderAddInfoProps = {
  purchaseRequest: TBasicPrrequest;
  handleChange: (field: keyof TBasicPrrequest, value: any) => void;
};

const HeaderAddInfo: React.FC<HeaderAddInfoProps> = ({ purchaseRequest, handleChange }) => {
  const formattedNeedByDate = purchaseRequest.need_by_date
    ? dayjs(purchaseRequest.need_by_date).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD'); // Default to today's date if undefined

  return (
    
    <div className="absolute w-[48%] top-0 right-[2%] grid grid-cols-1 mt-28 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-200">
      {/* Type of Contract */}
      <Grid item xs={12}>
        <TextField
          select
          size="small"
          name="type_of_contract"
          value={purchaseRequest.type_of_contract || ''}
          label="Type of Contract"
          onChange={(e) => handleChange('type_of_contract', e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Type of Contract</em>
          </MenuItem>
          <MenuItem value="AMC">AMC</MenuItem>
          <MenuItem value="One Time">One Time</MenuItem>
        </TextField>
      </Grid>

      {/* Type of Material */}
      <Grid item xs={10} sm={1}>
        <TextField
          select
          size="small"
          name="type_of_material_supply"
          value={purchaseRequest.type_of_material_supply || ''}
          label="Type of Material Supply" // The label will appear inside the field box
          onChange={(e) => handleChange('type_of_material_supply', e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Type of Material</em>
          </MenuItem>
          <MenuItem value="Supply">Supply</MenuItem>
          <MenuItem value="Installation">Installation</MenuItem>
          <MenuItem value="Supply Installation">Supply Installation</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={10} sm={1}>
        <TextField
          select
          size="small"
          name="contract_soft_hard"
          value={purchaseRequest.contract_soft_hard || ''}
          label="Contract Type" // The label will appear inside the field box
          onChange={(e) => handleChange('contract_soft_hard', e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Contract Type</em>
          </MenuItem>
          <MenuItem value="Hard">Hard</MenuItem>
          <MenuItem value="Soft">Soft</MenuItem>
          <MenuItem value="Special">Special</MenuItem>
        </TextField>
      </Grid>

      {/* AMC Service Status */}
      <Grid item xs={12} sm={12}>
        <TextField
          select
          size="small"
          name="amc_service_status"
          value={purchaseRequest.amc_service_status || ''}
          label="AMC Service Status" // The label will appear inside the field box
          onChange={(e) => handleChange('amc_service_status', e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select AMC Service Status</em>
          </MenuItem>
          <MenuItem value="Under Approval">Under Approval</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Flag raised">Flag raised</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={12}>
        <TextField
          select
          size="small"
          name="service_type"
          value={purchaseRequest.service_type || ''}
          label="Service Type"
          onChange={(e) => handleChange('service_type', e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Service Type</em>
          </MenuItem>
          <MenuItem value="Manpower">Manpower</MenuItem>
          <MenuItem value="Manpower + Materials">Manpower + Materials</MenuItem>
          <MenuItem value="Material Supply">Material Supply</MenuItem>
          <MenuItem value="Rental Supply of Vehicle">Rental Supply of Vehicle</MenuItem>
          <MenuItem value="Special AMC's">Special AMC's</MenuItem>
          <MenuItem value="Supply & Installation">Supply & Installation</MenuItem>
          <MenuItem value="Supply of Potable Water And Sewage Removal">Supply of Potable Water And Sewage Removal</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          select
          size="small"
          name="type_of_pr"
          value={purchaseRequest.type_of_pr || ''}
          label="Type of PR"
          onChange={(e) => handleChange('type_of_pr', e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Type of PR</em>
          </MenuItem>
          <MenuItem value="Non Chargeable">Non Chargeable</MenuItem>
          <MenuItem value="Charge to Customer">Charge to Customer</MenuItem>
          <MenuItem value="Charge to Employee">Charge to Employee</MenuItem>
          <MenuItem value="Charge to Supplier">Charge to Supplier</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          select
          size="small"
          name="covered_by_contract_yes"
          value={purchaseRequest.covered_by_contract_yes || ''}
          label="Covered by Contract"
          onChange={(e) => handleChange('covered_by_contract_yes', e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Covered by Contract</em>
          </MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          select
          size="small"
          name="flag_sharing_cost"
          value={purchaseRequest.flag_sharing_cost || ''}
          label="Flag Sharing Cost"
          onChange={(e) => handleChange('flag_sharing_cost', e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Flag Sharing Cost</em>
          </MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={12}>
        <TextField
          select
          size="small"
          name="budgeted_yes"
          value={purchaseRequest.budgeted_yes || ''}
          label="Budgeted"
          onChange={(e) => handleChange('budgeted_yes', e.target.value)}
          fullWidth
          variant="outlined"
          InputLabelProps={{
            shrink: true // Ensures the label stays above when the field has focus or a value
          }}
        >
          <MenuItem value="">
            <em>Select Budgeted</em>
          </MenuItem>
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Grid item xs={12} sm={12}>
          <TextField
            select
            size="small"
            name="checked_store_yes"
            value={purchaseRequest.checked_store_yes || ''}
            label="Checked Store"
            onChange={(e) => handleChange('checked_store_yes', e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true // Ensures the label stays above when the field has focus or a value
            }}
          >
            <MenuItem value="">
              <em>Select Checked Store</em>
            </MenuItem>
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Box sx={{ width: '100%' }} className="flex" position="relative">
            <InputLabel
              sx={{
                position: 'absolute',
                top: '-8px',
                left: '10px',
                fontSize: '12px',
                backgroundColor: 'white', // Ensures label is readable on the input field
                paddingLeft: '4px',
                paddingRight: '4px'
              }}
            >
              Need by Date
            </InputLabel>
            <input
              type="date"
              name="need_by_date"
              value={formattedNeedByDate} // Use the formatted value here
              onChange={(e) => handleChange('need_by_date', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Box sx={{ width: '100%' }} className="flex">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={purchaseRequest.good_material_request === 'Y'}
                  onChange={(e) => handleChange('good_material_request', e.target.checked ? 'Y' : 'N')}
                />
              }
              label="Good Material Request"
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Box sx={{ width: '100%' }} className="flex">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={purchaseRequest.service_request === 'Y'}
                  onChange={(e) => handleChange('service_request', e.target.checked ? 'Y' : 'N')}
                />
              }
              label="Service Request"
            />
          </Box>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Box
          sx={{
            border: '1px solid black',
            padding: '16px',
            borderRadius: '8px',
            width: '100%'
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '16px' }}>
            Materials
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_mechanical === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_mechanical', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Mechanical Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_electrical === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_electrical', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Electrical Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_plumbing === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_plumbing', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Plumbing Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_tools === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_tools', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Tools Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_civil === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_civil', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Civil Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_ac === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_ac', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="AC Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_cleaning === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_cleaning', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Cleaning Material"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={purchaseRequest.material_other === 'Y'}
                size="small"
                onChange={(e) => handleChange('material_other', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Other Material"
          />
        </Box>
      </Grid>

      <Grid item xs={12} sm={12}>
        <Box
          sx={{
            border: '1px solid black',
            padding: '16px',
            borderRadius: '8px',
            width: '100%'
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '16px' }}>
            Services
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.services_temp_staff === 'Y'}
                onChange={(e) => handleChange('services_temp_staff', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Temporary Staff Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.services_rentals === 'Y'}
                onChange={(e) => handleChange('services_rentals', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Rental Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.services_subcon_conslt === 'Y'}
                onChange={(e) => handleChange('services_subcon_conslt', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Subcontractor/Consultant Services"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.services_other === 'Y'}
                onChange={(e) => handleChange('services_other', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Other Services"
          />
        </Box>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Box
          sx={{
            border: '1px solid black',
            padding: '2px',
            borderRadius: '8px',
            width: '100%',
            mt: 0 // Reduced top margin to bring the box closer to the previous field
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            Other
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.other_stationery === 'Y'}
                onChange={(e) => handleChange('other_stationery', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Stationery"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.other_it === 'Y'}
                onChange={(e) => handleChange('other_it', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="IT"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.other_new_uniform_ppe === 'Y'}
                onChange={(e) => handleChange('other_new_uniform_ppe', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="New Uniform/PPE"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.other_rplcmt_uniform === 'Y'}
                onChange={(e) => handleChange('other_rplcmt_uniform', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Replacement Uniform"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={purchaseRequest.other_other === 'Y'}
                onChange={(e) => handleChange('other_other', e.target.checked ? 'Y' : 'N')}
              />
            }
            label="Other"
          />
        </Box>
      </Grid>
    </div>
  );
};

export default HeaderAddInfo;
