// Import necessary icons from ant-design
import { PlusOutlined } from '@ant-design/icons';

// Import useQuery hook from react-query for data fetching
import { useMutation, useQuery } from '@tanstack/react-query';

// Import custom search filter interface
import { ISearch } from 'components/filters/SearchFilter';

// Import custom dialog component
import UniversalDialog from 'components/popup/UniversalDialog';

// Import custom authentication hook
import useAuth from 'hooks/useAuth';

// Import necessary hooks from React
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Import hooks from react-router for navigation and location
import { useLocation, useNavigate } from 'react-router';

// Import WMS service instance for API calls
import WmsSerivceInstance from 'service/wms/service.wms';

// Import useSelector hook from Redux store
import { useSelector } from 'store';

// Import types for universal dialog properties
import { TUniversalDialogProps } from 'types/types.UniversalDialog';

// Import utility function to get path name list
import { getPathNameList } from 'utils/functions';

// Import FormattedMessage component for internationalization
import { FormattedMessage } from 'react-intl';

// Import form component for adding job
//import AddJobWmsForm from 'components/forms/Wms/Transaction/Inbound/AddJobWmsForm';
//import AddOutBoundwmsForm from 'components/forms/Wms/Transaction/outbound/AddOutBoundwmsForm';
import AddOutBoundwmsForm from 'components/forms/Wms/Transaction/Outbound/AddOutBoundwmsForm';

import CustomAgGrid from 'components/grid/CustomAgGrid';
import { gs_userlevel, useInitializeUserLevel } from 'shared/global-state';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

// Define initial filter state
const filter: ISearch = {
  sort: { field_name: 'updated_at', desc: true },
  search: [[]]
};
const OutboundJobWmsPage = () => {
  //-----constant for ref for print job---------
  //--------------constants----------
  const theme = useTheme();
  const primaryColor = `${theme.palette.primary.main}`;
  const { permissions, user_permission } = useAuth(); // Get user permissions from custom hook
  const navigate = useNavigate(); // Hook for navigation

  useInitializeUserLevel();
  const location = useLocation(); // Hook to get current location
  const pathNameList = getPathNameList(location.pathname); // Get list of path names from current location
  const { app } = useSelector((state: any) => state.menuSelectionSlice); // Get selected app from Redux store
  const { user } = useAuth();

  const [cancelModalState, setCancelModalState] = useState<{
    open: boolean;
    jobData: any;
    remarks: string;
    error?: string;
  }>({
    open: false,
    jobData: null,
    remarks: '',
    error: ''
  });

  // State for job form popup
  const [jobFormPopup, setJobFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      //maxWidth: 'sm'
      maxWidth: 'lg'
    },
    title: <FormattedMessage id="Add Job" />,
    data: { existingData: {}, isEditMode: false }
  });

  // Add a function to map job_class codes to human-readable names
  const getJobClassDisplayName = (jobClass: string): string => {
    const jobClassMap: Record<string, string> = {
      N: 'Normal',
      NP: 'Normal (HHT / RFID / AR)',
      M: 'Manual Putaway',
      S: 'Sales Return',
      SP: 'Sales Return (HHT / RFID / AR)',
      NI: 'Non-Inventory',
      CP: 'Co-Packing',
      MR: 'Misc Receipts',
      IWT: 'Inter Warehouse Transfer',
      CD: 'Cross Docking'
    };

    return jobClassMap[jobClass] || jobClass;
  };

  // Create JobClassPill component to display job classes as pills
  const JobClassPill = ({ jobClass }: { jobClass: string }) => {
    // Define color scheme for different job classes
    const getJobClassColor = (jobClass: string): { bg: string; text: string; border: string } => {
      const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        N: { bg: '#E3F2FD', text: '#1565C0', border: '#1565C0' }, // Light blue
        NP: { bg: '#E8F5E9', text: '#2E7D32', border: '#2E7D32' }, // Light green
        M: { bg: '#FFF3E0', text: '#E65100', border: '#E65100' }, // Light orange
        S: { bg: '#F3E5F5', text: '#7B1FA2', border: '#7B1FA2' }, // Light purple
        SP: { bg: '#E1F5FE', text: '#0277BD', border: '#0277BD' }, // Light sky blue
        NI: { bg: '#FFEBEE', text: '#C62828', border: '#C62828' }, // Light red
        CP: { bg: '#E0F7FA', text: '#00838F', border: '#00838F' }, // Light cyan
        MR: { bg: '#F1F8E9', text: '#558B2F', border: '#558B2F' }, // Light lime
        IWT: { bg: '#FFFDE7', text: '#F9A825', border: '#F9A825' }, // Light yellow
        CD: { bg: '#FCE4EC', text: '#C2185B', border: '#C2185B' } // Light pink
      };

      return colorMap[jobClass] || { bg: '#ECEFF1', text: '#455A64', border: '#455A64' }; // Default gray
    };

    const displayName = getJobClassDisplayName(jobClass);
    const { bg, text, border } = getJobClassColor(jobClass);

    return (
      <div
        style={{
          backgroundColor: bg,
          color: text,
          borderRadius: '8px',
          padding: '1px 4px',
          fontSize: '0.6rem',
          fontWeight: 600,
          display: 'inline-block',
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
          border: `0.5px solid ${border}`,
          letterSpacing: '0',
          textAlign: 'center',
          minWidth: '45px',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2'
        }}
      >
        {displayName}
      </div>
    );
  };

  // Define columns for the data table

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Job No',
        field: 'JOB_NO',

        cellRenderer: (params: any) => (
          <div
            onClick={() => {
              navigate(`view/${params.data.JOB_NO}/order_entry`, {
                state: {
                  rowData: params.data
                }
              });
            }}
          >
            <Typography
              sx={{
                '&:hover': {
                  color: primaryColor,
                  textDecoration: 'underline'
                },
                fontSize: '0.775rem',
                color: primaryColor
              }}
              className="cursor-pointer"
            >
              {params.data.JOB_NO}
            </Typography>
          </div>
        ),
        minWidth: 90
      },
      {
        headerName: 'Principal Name',
        field: 'PRIN_NAME',
        width: 120,
        filter: 'agTextColumnFilter',
        minWidth: 190,
        cellStyle: { fontSize: '12px' }
      },
      {
        headerName: 'Job Class',
        field: 'JOB_CLASS',
        minWidth: 180,
        cellRenderer: (params: any) => {
          return <JobClassPill jobClass={params.value} />;
        }
      },
      {
        headerName: 'Job Date',
        field: 'JOB_DATE',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 120
      },
      {
        headerName: 'Confirm Date',
        field: 'CONFIRM_DATE',
        cellStyle: { fontSize: '12px' },
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 125
      },
      {
        headerName: 'Doc Ref',
        field: 'doc_ref',
        cellStyle: { fontSize: '12px' },
        width: 120
      },
      {
        headerName: 'Canceled',
        field: 'canceled',
        cellStyle: { fontSize: '12px' },
        width: 120
      },
      {
        headerName: 'Invoiced',
        cellStyle: { fontSize: '12px' },
        field: 'invoiced',
        width: 120
      },
      {
        headerName: 'Invoice Date',
        cellStyle: { fontSize: '12px' },
        field: 'invoice_date',
        valueFormatter: (params: any) => {
          const date = dayjs(params.value);
          return date.isValid() ? date.format('DD/MM/YYYY') : 'NA';
        },
        width: 120
      },
      {
        headerName: 'Actions',
        field: 'actions',
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          // Add cancel button only for in_progress tab and when inb_cnt_cancel is 0
          if (params.data.oub_cnt_cancel === '0' && !params.data.confirm_date && params.data.canceled !== 'Y') {
            actionButtons.push('cancel' as TAvailableActionButtons);
          }
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    [gs_userlevel]
  );

  //-------------Grid Handlers----------------
  const [gridApi, setGridApi] = useState<any>(null);
  const [searchData, setSearchData] = useState<ISearch>(filter);
  console.log('searchData', searchData);
  console.log('gridApi', gridApi);

  // const onGridReady = (params: any) => {
  //   try {
  //     // Store grid API reference
  //     setGridApi(params.api);

  //     // Adjust columns to fit the available width
  //     params.api.sizeColumnsToFit();

  //     // Add window resize listener to auto-fit columns
  //     window.addEventListener('resize', () => {
  //       setTimeout(() => {
  //         params.api.sizeColumnsToFit();
  //       });
  //     });

  //     // Refresh the grid data
  //     params.api.refreshCells();
  //   } catch (error) {
  //     console.error('Error in grid initialization:', error);
  //   }
  // };

  const onSortChanged = useCallback((params: any) => {
    const columnState = params?.columnApi?.getColumnState();
    const sortedColumn = columnState?.find((col: any) => col.sort);

    setSearchData((prevData) => ({
      ...prevData,
      sort: sortedColumn ? { field_name: sortedColumn.colId, desc: sortedColumn.sort === 'desc' } : { field_name: 'updated_at', desc: true }
    }));
  }, []);

  const onFilterChanged = useCallback((event: any) => {
    const filterModel = event.api.getFilterModel();
    const filters: any[] = [];

    Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
      if (value.filter || value.value) {
        filters.push([
          {
            field_name: field,
            field_value: value.filter || value.value,
            operator: 'equals'
          }
        ]);
      }
    });

    setSearchData((prevData) => ({
      ...prevData,
      search: filters.length > 0 ? filters : [[]]
    }));
  }, []);

  const sql_string = `
   SELECT * 
FROM VW_TI_JOB  
WHERE company_code = '${user?.company_code}'
  AND job_type = 'EXP'
ORDER BY job_date DESC, job_no DESC
FETCH FIRST 100 ROWS ONLY
  `;

  // Fetch job data using react-query

  //----------- useQuery--------------
  const { data: jobData, refetch: refetchJobData } = useQuery({
    queryKey: ['job_data', user?.company_code],
    queryFn: () => WmsSerivceInstance.executeRawSql(sql_string),
    enabled:
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
      )
  });

  // Filter jobData into Pending and Confirmed
  // const pendingJobs = jobData?.filter((job) => job.confirm_date === null && job.canceled !== 'Y') || [];
  const confirmedJobs = jobData?.filter((job) => job.confirm_date !== null) || [];
  const canceledJobs = jobData?.filter((job) => job.canceled === 'Y') || [];

  console.log('jobData', jobData);

  // Create refs to track grid instances and prevent duplicate initialization
  const gridApiRefs = useRef<{ [key: string]: any }>({});
  const [activeTab, setActiveTab] = useState('in_progress');

  // Modified onGridReady function with tab-specific tracking
  const onGridReady = useCallback((params: any) => {
    try {
      // Store grid API reference
      setGridApi(params.api);

      // Adjust columns to fit the available width
      params.api.sizeColumnsToFit();

      // Refresh the grid data
      params.api.refreshCells();
    } catch (error) {
      console.error('Error in grid initialization:', error);
    }
  }, []);

  // Add a useEffect to handle grid resizing
  useEffect(() => {
    const handleResize = () => {
      if (gridApi) {
        setTimeout(() => {
          gridApi.sizeColumnsToFit();
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gridApi]);

  // Set up resize listener only once
  useEffect(() => {
    const handleResize = () => {
      const currentGridApi = gridApiRefs.current[activeTab];
      if (currentGridApi) {
        setTimeout(() => {
          currentGridApi.sizeColumnsToFit();
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab]);

  // Tab change handler
  // const handleTabChange = useCallback((_event: any, newValue: React.SetStateAction<string>) => {
  //   setActiveTab(newValue);

  //   // Refresh grid for the new tab if it already exists
  //   const gridApi = gridApiRefs.current[newValue];
  //   if (gridApi) {
  //     setGridApi(gridApi);
  //     setTimeout(() => {
  //       gridApi.sizeColumnsToFit();
  //       gridApi.refreshCells();
  //     });
  //   }
  // }, []);


  // const handleTabChange = (_event: any, newValue: React.SetStateAction<string>) => {
  //   setActiveTab(newValue);
  // };

  const handleTabChange = (_event: any, newValue: string) => {
    setActiveTab(newValue);
  };

  //   TABS
  const tabs = [
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Canceled', value: 'cancel' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'in_progress':
        return (
          <CustomAgGrid
            rowData={jobData || []}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onSortChanged={onSortChanged}
            onFilterChanged={onFilterChanged}
            paginationPageSize={1000}
            pagination={true}
            height="470px"
            rowHeight={25}
            headerHeight={30}
            getRowStyle={(params: any) => {
              if (params.data?.confirm_date) {
                return { background: '#e6ffe6' };
              } else {
                return { background: '#e6f0ff' };
              }
            }}
            key="in_progress_grid"
            // defaultPageSize={50} // Add this prop
            paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          />
        );
      case 'confirmed':
        return (
          <CustomAgGrid
            rowData={confirmedJobs || []}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onSortChanged={onSortChanged}
            onFilterChanged={onFilterChanged}
            paginationPageSize={1000}
            pagination={true}
            height="470px"
            rowHeight={25}
            headerHeight={30}
            getRowStyle={(params: any) => {
              if (params.data?.confirm_date) {
                return { background: '#e6ffe6' };
              } else {
                return { background: '#e6f0ff' };
              }
            }}
            key="confirmed_grid"
            // defaultPageSize={50} // Add this prop
            paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          />
        );
      case 'cancel':
        return (
          <CustomAgGrid
            rowData={canceledJobs || []}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            onSortChanged={onSortChanged}
            onFilterChanged={onFilterChanged}
            paginationPageSize={1000}
            pagination={true}
            height="470px"
            rowHeight={25}
            headerHeight={30}
            getRowStyle={(params: any) => {
              if (params.data?.canceled === 'Y') {
                return { background: '#ffe6e6' };
              } else {
                return { background: '#e6f0ff' };
              }
            }}
            key="canceled_grid"
            // defaultPageSize={50} // Add this prop
            paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          />
        );
    }
  };

  //-------------handlers--------------

  const handleEditJob = (existingData: any) => {
    setJobFormPopup((prev) => {
      return {
        action: { ...prev.action, open: !prev.action.open },
        title: <FormattedMessage id="Edit Job" />,
        data: { existingData, isEditMode: true }
      };
    });
  };

  const toggleJobPopup = (refetchData?: boolean) => {
    if (jobFormPopup.action.open === true && refetchData) {
      refetchJobData();
    }
    setJobFormPopup((prev) => {
      return { ...prev, data: { isEditMode: false, existingData: {} }, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleActions = (actionType: string, rowOriginal: any) => {
    if (actionType === 'edit') {
      handleEditJob(rowOriginal);
    } else if (actionType === 'cancel') {
      handleOpenCancelModal(rowOriginal);
    }
  };

  //------------------useEffect----------------
  // useEffect(() => {
  //   if (Array.isArray(jobData)) {
  //     const filtered = jobData.filter((row: any) => row.job_type === 'EXP');
  //     setFilteredData(filtered);
  //     console.log('Filtered Data:', filtered);
  //   } else {
  //     setFilteredData([]);
  //   }
  // }, [jobData]);

  const handleOpenCancelModal = (jobData: any) => {
    setCancelModalState({
      open: true,
      jobData: jobData,
      remarks: ''
    });
  };

  const handleCloseCancelModal = () => {
    setCancelModalState({
      open: false,
      jobData: null,
      remarks: '',
      error: ''
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalState.jobData) {
      setCancelModalState((prev) => ({
        ...prev,
        error: 'Invalid job data'
      }));
      return;
    }

    setCancelModalState((prev) => ({ ...prev, error: '' }));

    cancelJobMutation.mutate({
      jobNo: cancelModalState.jobData.job_no,
      principalCode: cancelModalState.jobData.prin_code
    });
  };

  const cancelJobMutation = useMutation({
    mutationFn: async ({ jobNo, principalCode }: { jobNo: string; principalCode: string }) => {
      const query_parameter = `Inbound-CancelJob$$$${user?.company_code}`;
      const query_where = `\`1$string\` = '${user?.company_code}' AND \`2$string\` = '${principalCode}' AND \`3$string\` = '${jobNo}'`;
      const query_updatevalues = `${user?.company_code}$$$${cancelModalState.remarks}$$$Y$$$CURRENT_DATE()$$$GGG`;
      console.log('check values', query_parameter, query_where, query_updatevalues)
      return WmsSerivceInstance.executeRawSqlbody(query_parameter, query_where, query_updatevalues);
    },
    onSuccess: () => {
      handleCloseCancelModal();
      refetchJobData();
    },
    onError: (error: any) => {
      setCancelModalState((prev) => ({
        ...prev,
        error: error?.message || 'Failed to cancel job. Please try again.'
      }));
    }
  });

  return (
    <div className="flex flex-col space-y-2">
      {!!jobFormPopup && jobFormPopup.action.open && (
        <UniversalDialog action={{ ...jobFormPopup.action }} onClose={toggleJobPopup} title={jobFormPopup.title} hasPrimaryButton={false}>
          <AddOutBoundwmsForm
            onClose={toggleJobPopup} // Close job form popup
            isEditMode={jobFormPopup?.data?.isEditMode} // Edit mode state
            existingData={jobFormPopup.data.existingData} // Existing data for the form
          />
        </UniversalDialog>
      )}

      {/* Cancel Modal */}
      <Dialog open={cancelModalState.open} onClose={handleCloseCancelModal} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: '#082A89',
            color: '#fff',
            fontWeight: 600
          }}
        >
          Cancel Job - {cancelModalState.jobData?.job_no}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', mt: 2 }}>
            Are you sure you want to cancel this job? Please provide a reason for cancellation.
          </Typography>
          {cancelModalState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelModalState.error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Cancel Remarks"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={cancelModalState.remarks}
            onChange={(e) => setCancelModalState((prev) => ({ ...prev, remarks: e.target.value, error: '' }))}
            placeholder="Enter cancellation reason..."
            disabled={cancelJobMutation.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelModal} color="primary" disabled={cancelJobMutation.isPending}>
            Close
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={!cancelModalState.remarks.trim() || cancelJobMutation.isPending}
            startIcon={cancelJobMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {cancelJobMutation.isPending ? 'Canceling...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between">
        <Typography
          variant="h5"
          sx={{
            color: '#082A89',
            fontWeight: 600,
            fontSize: '1.5rem'
          }}
        >
          Outbound Job Listing
        </Typography>

        <Button
          startIcon={<PlusOutlined />}
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
          variant="contained"
          onClick={() => toggleJobPopup()}
        >
          Add Job
          {/* <FormattedMessage id="Job" /> */}
        </Button>
      </div>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'background.paper' }}>
        <AppBar position="static">
          <Tabs
            //put this style in tabs
            sx={{
              backgroundColor: theme.palette.grey[100],
              '& .MuiTab-root': {
                transition: 'all 0.3s ease',
                borderRadius: '8px 8px 0 0',
                margin: '0 2px',
                textTransform: 'none',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: 'rgba(8, 42, 137, 0.08)',
                  color: '#082A89'
                }
              },
              '& .Mui-selected': {
                backgroundColor: '#fff',
                color: '#082A89 !important',
                fontWeight: 600,
                border: '2px solid #082A89',
                borderBottom: 'none',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#fff',
                  zIndex: 1
                }
              }
            }}
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="outbound job tabs"
          >
            {tabs.map((tab) => (
              <Tab className="font-semibold" key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </AppBar>

        <Paper elevation={3} className="rounded-none overflow-hidden h-full">
          {renderTabContent()}
        </Paper>
      </Box>
    </div>
  );
};

export default OutboundJobWmsPage;
