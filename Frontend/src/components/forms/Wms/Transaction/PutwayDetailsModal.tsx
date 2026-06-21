import { SettingOutlined } from '@ant-design/icons';
import { Button, Grid, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
// import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance, { TddSiteLocation } from 'service/wms/service.wms';
import putwayServiceInstance from 'service/wms/transaction/inbound/service.putwayDetailsWms';
import { TSite } from 'pages/WMS/types/site-wms.types';
// import useAuth from 'hooks/useAuth';

type TPutway = { site_to: string; site_from: string; location_from: string; location_to: string };

interface PutwayDetailsModalProps {
  selectedRows: any[];
  prin_code: string;
  job_no: string;
  onClose: (shouldRefresh?: boolean) => void;
  isManual?: boolean;
  isHht?: boolean; // Add this new prop
}

const PutwayDetailsModal: React.FC<PutwayDetailsModalProps> = ({
  selectedRows,
  prin_code,
  job_no,
  onClose,
  isManual = false,
  isHht = false // Add default value
}) => {
  // const { app } = useSelector((state: any) => state.menuSelectionSlice);
  //   const { user } = useAuth();
  const [putwayDetails, setPutwayDetails] = useState<TPutway>({
    site_to: '',
    site_from: '',
    location_from: '',
    location_to: ''
  });
  const [locationFromOptions, setLocationFromOptions] = useState<TddSiteLocation[]>([]);
  const [locationToOptions, setLocationToOptions] = useState<TddSiteLocation[]>([]);
  const [locationFromLoading, setLocationFromLoading] = useState(false);
  const [locationToLoading, setLocationToLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch site data
  const { data: siteData } = useQuery({
    queryKey: ['ms_site'],
    queryFn: async () => {
      const sql_string = 'SELECT * FROM MS_SITE';
      const response = await WmsSerivceInstance.executeRawSql(sql_string);
      
      if (response) {
        const mappedSites = response.map((site: any) => ({
          site_code: site.SITE_CODE || site.site_code,
          site_name: site.SITE_NAME || site.site_name
        }));
        
        return {
          tableData: mappedSites as TSite[],
          count: mappedSites.length
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  // Fetch locations for "Location From" when site_from changes
  useEffect(() => {
    const fetchLocationFrom = async () => {
      if (!putwayDetails.site_from) {
        setLocationFromOptions([]);
        return;
      }

      setLocationFromLoading(true);
      try {
        const sql_string = `SELECT * FROM MS_LOCATION WHERE SITE_CODE = '${putwayDetails.site_from}'`;
        const response = await WmsSerivceInstance.executeRawSql(sql_string);
        console.log('Location From Response:', response); // Debug log

        const mappedLocations =
          response?.map((location: any) => ({
            location_code: location.LOCATION_CODE || location.location_code,
            loc_desc: location.LOC_DESC || location.loc_desc || location.location_name,
            site_code: location.SITE_CODE || location.site_code,
            loc_type: location.LOC_TYPE || location.loc_type,
            loc_stat: location.LOC_STAT || location.loc_stat
          })) || [];

        console.log('Mapped Location From Options:', mappedLocations); // Debug log
        setLocationFromOptions(mappedLocations);
      } catch (error) {
        console.error('Error fetching location from:', error);
        setLocationFromOptions([]);
      } finally {
        setLocationFromLoading(false);
      }
    };
    fetchLocationFrom();
  }, [putwayDetails.site_from]);

  // Fetch locations for "Location To" when site_to changes
  useEffect(() => {
    const fetchLocationTo = async () => {
      if (!putwayDetails.site_to) {
        setLocationToOptions([]);
        return;
      }

      setLocationToLoading(true);
      try {
        const sql_string = `SELECT * FROM MS_LOCATION WHERE SITE_CODE = '${putwayDetails.site_to}'`;
        const response = await WmsSerivceInstance.executeRawSql(sql_string);
        console.log('Location To Response:', response); // Debug log

        const mappedLocations =
          response?.map((location: any) => ({
            location_code: location.LOCATION_CODE || location.location_code,
            loc_desc: location.LOC_DESC || location.loc_desc || location.location_name,
            site_code: location.SITE_CODE || location.site_code,
            loc_type: location.LOC_TYPE || location.loc_type,
            loc_stat: location.LOC_STAT || location.loc_stat
          })) || [];

        console.log('Mapped Location To Options:', mappedLocations); // Debug log
        setLocationToOptions(mappedLocations);
      } catch (error) {
        console.error('Error fetching location to:', error);
        setLocationToOptions([]);
      } finally {
        setLocationToLoading(false);
      }
    };
    fetchLocationTo();
  }, [putwayDetails.site_to]);

  const handleProcessPutway = async () => {
    setIsProcessing(true);
    try {
      const requestBody = {
        site_from: putwayDetails.site_from,
        site_to: putwayDetails.site_to,
        location_from: putwayDetails.location_from,
        location_to: putwayDetails.location_to,
        packdet_no: selectedRows.map((row) => String(row.packdet_no))
      };

      const queryParams = new URLSearchParams({
        prin_code: prin_code
      });

      await putwayServiceInstance.addPutwayDetails(job_no, queryParams.toString(), requestBody);
      
      onClose(true); // Close and refresh
    } catch (error) {
      console.error('Error processing putway:', error);
      // Handle error appropriately
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleSubmit = async (values: any) => {
  //   try {
  //     if (isHht) {
  //       // Handle HHT putaway logic
  //       // Add your HHT specific API call here
  //     } else if (isManual) {
  //       // Handle manual putaway logic
  //       // Existing manual putaway code
  //     } else {
  //       // Handle normal putaway logic
  //       // Existing normal putaway code
  //     }
  //     onClose(true);
  //   } catch (error) {
  //     console.error('Error processing putaway:', error);
  //   }
  // };

  const updatePutwayDetails = (updates: Partial<TPutway>) => {
    // Add debugging log
    console.log('Updating putway details:', updates);
    setPutwayDetails(prev => {
      const newState = { ...prev, ...updates };
      console.log('New state will be:', newState);
      return newState;
    });
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log('Current putway details state:', putwayDetails);
  }, [putwayDetails]);

  // Change the validation to make location fields optional
  const isFormValid = putwayDetails.site_from && putwayDetails.site_to;
  
  return (
    <div className="p-4">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Site From</InputLabel>
            <Select
              value={putwayDetails.site_from || ''}
              onChange={(event) => {
                const selectedSite = event.target.value;
                console.log('Selected site:', selectedSite);
                // Update both site_from and site_to in a single state update
                updatePutwayDetails({ 
                  site_from: selectedSite, 
                  site_to: selectedSite, 
                  location_from: '',
                  location_to: '' 
                });
              }}
              label="Site From"
            >
              {siteData?.tableData?.map((site) => (
                <MenuItem key={site.site_code} value={site.site_code}>
                  {site.site_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" disabled={!putwayDetails.site_from || locationFromLoading}>
            <InputLabel>Location From</InputLabel>
            <Select
              value={putwayDetails.location_from || ''}
              onChange={(event) => {
                updatePutwayDetails({ location_from: event.target.value });
              }}
              label="Location From"
              endAdornment={locationFromLoading && <CircularProgress size={20} />}
            >
              {locationFromOptions?.length > 0
                ? locationFromOptions.map((location) => (
                    <MenuItem key={location.location_code} value={location.location_code}>
                      {location.location_code}
                    </MenuItem>
                  ))
                : !locationFromLoading && <MenuItem disabled>No locations available</MenuItem>}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" >
            <InputLabel>Site To (Auto-set to match Site From)</InputLabel>
            <Select
              value={putwayDetails.site_to || ''}
              onChange={(event) => {
                updatePutwayDetails({ site_to: event.target.value, location_to: '' });
              }}
              label="Site To (Auto-set to match Site From)"
              sx={{
                backgroundColor: putwayDetails.site_to ? '#f5f5f5' : 'transparent',
                // Add a subtle visual indicator that this is auto-updated
                border: putwayDetails.site_to ? '1px solid #ccc' : '1px solid #c4c4c4'
              }}
            >
              {siteData?.tableData?.map((site) => (
                <MenuItem key={site.site_code} value={site.site_code}>
                  {site.site_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" disabled={!putwayDetails.site_to || locationToLoading}>
            <InputLabel>Location To</InputLabel>
            <Select
              value={putwayDetails.location_to || ''}
              onChange={(event) => {
                updatePutwayDetails({ location_to: event.target.value });
              }}
              label="Location To"
              endAdornment={locationToLoading && <CircularProgress size={20} />}
            >
              {locationToOptions?.length > 0
                ? locationToOptions.map((location) => (
                    <MenuItem key={location.location_code} value={location.location_code}>
                      {location.location_code}
                    </MenuItem>
                  ))
                : !locationToLoading && <MenuItem disabled>No locations available</MenuItem>}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Add a visual indicator message */}
      {putwayDetails.site_from && (
        <div className="mt-2 text-sm text-blue-600">
          <i>Note: Site To is automatically set to match Site From ({putwayDetails.site_from})</i>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button
          variant="outlined"
          onClick={() => onClose(false)}
          disabled={isProcessing}
          sx={{
            color: '#666',
            border: '1.5px solid #666',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1.5px solid #666'
            }
          }}
        >
          <FormattedMessage id="Cancel" />
        </Button>

        <Button
          variant="contained"
          onClick={handleProcessPutway}
          disabled={!isFormValid || isProcessing || selectedRows.length === 0}
          startIcon={isProcessing ? <CircularProgress size={16} /> : <SettingOutlined />}
          sx={{
            backgroundColor: '#082A89',
            '&:hover': {
              backgroundColor: '#0a2d96'
            }
          }}
        >
          {isProcessing ? <FormattedMessage id="Processing..." /> : <FormattedMessage id="Process Putaway" />}
        </Button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <FormattedMessage id="Selected Items" />: {selectedRows.length}
      </div>
    </div>
  );
};

export default PutwayDetailsModal;