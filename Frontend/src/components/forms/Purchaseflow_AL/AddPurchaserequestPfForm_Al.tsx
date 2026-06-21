/* eslint-disable react/jsx-pascal-case */
import React, { useState, useEffect, useRef } from 'react';
//import Files from 'components/Files';

import {
  TextField,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select

  //FormControl
} from '@mui/material';
//import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Table } from 'antd';
import { LoadingButton } from '@mui/lab';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
//import { useQuery } from '@tanstack/react-query';
// below for calling dropdown and page get
//import PfServiceInstance_Al from  '../../../service/service.purchaseflow_Al';
import GmPfServiceInstance_Al from 'service/Purchaseflow_Al/services.purchaseflow';
import { dispatch } from 'store';
import useAuth from 'hooks/useAuth';
import { Add as AddIcon } from '@mui/icons-material';
import { TPurchaserequestPf_Al, TItemPrrequest_Al, TPrTermCondition_Al } from 'pages/Purchasefolder_Al/purchaserequestheader_pf-types_Al';
//import { TPurchaserequestPf, TItemPrrequest, TPrTermCondition_Al } from './purchaserequestheader_pf-types_Al';
//import { red } from '@ant-design/colors';
import PurchaseRequestFormprint_Al from './Requestformprint_Al';
import TermsAndCondition_Al from './TermsAndCondition_Al';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { openSnackbar } from 'store/reducers/snackbar';

interface AddPurchaserequestPfFormProps {
  request_number?: string;
}
interface AddPurchaserequestPfFormProps {
  request_number?: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData: TPurchaserequestPf_Al;
}

const initialPurchaseRequest = (): TPurchaserequestPf_Al => ({
  request_number: '', // Unique identifier for the requests
  request_date: new Date(), // Date of the request
  ac_name: '', // Account name of the supplier
  supplier: '', // Supplier code
  description: '', // Description of the request
  remarks: '', // Additional remarks
  amount: 0, // Total amount
  department_code: '', // Department code
  flow_code: '', // Flow code
  flow_level_initial: 0, // Initial flow level
  flow_level_running: 0, // Running flow level
  flow_level_final: 0, // Final flow level
  company_code: '', // Company identifier
  user_dt: '', // User date (consider Date type if needed)
  user_id: '', // User identifier
  currency_rate: 0, // Currency exchange rate
  fa_uploaded: 'N', // Flag indicating if FA is uploaded
  final_approved: 'No', // Flag indicating final approval
  remarks_histry: '', // History of remarks
  cancel_flag: false, // Flag indicating if the request is canceled
  tx_cat_code: '', // Tax category code
  tx_compntcat_code_1: '', // Tax component category code 1
  tx_compntcat_code_2: '', // Tax component category code 2
  tx_compntcat_code_3: '', // Tax component category code 3
  tx_compntcat_code_4: '', // Tax component category code 4
  tx_compnt_1_expmnt: '', // Tax component 1 experiment data
  create_user: '', // User who created the request
  create_date: '', // Creation date (consider Date type if needed)
  tx_cat_name: '', // Tax category name
  tx_compntcat_name: '', // Tax component category name
  curr_code: '', // Currency code
  po_amount: 0, // Purchase order amount
  curr_name: '', // Currency name
  flow_description: '', // Flow description
  last_updated: '', // Last updated timestamp (consider Date type if needed)
  last_action: '', // Last action performed
  history_serial: 0, // History serial number
  cost_code: '', // Cost code
  request_hod_user: '', // HOD user handling the request
  items: [
    {
      item_code: '', // Unique identifier for the item
      supplier: '',
      item_desp: '', // Item description
      item_group_desc: '', // Item group description
      item_group_code: '', // Item group code
      item_rate: 0, // Item rate
      item_qty: 0, // Item quantity
      currency_rate: 0, // Currency exchange rate
      amount: 0, // Total amount
      company_code: '', // Company identifier
      user_dt: '', // User date (consider Date type if needed)
      user_id: '', // User identifier
      request_number: '', // Purchase request number
      curr_code: '', // Currency code
      tx_cat_code: '', // Tax category code
      tx_compntcat_code_1: '', // Tax component category code 1
      tx_compnt_perc_1: 0, // Tax component percentage
      tx_compnt_amt_1: 0, // Tax component amount
      tx_compnt_lcuramt_1: 0, // Tax component local currency amount
      tx_compnt_1_expmt: '', // Tax component exemption
      lcurr_amt: 0, // Local currency amount
      allocated_approved_quantity: 0, // Approved quantity allocation
      selected_item: '', // Selected item flag
      last_action: '', // Last action performed
      history_serial: 0, // History serial number
      curr_name: '', // Currency name
      item_srno: 0, // Item serial number
      supplier_part_code: '', // Supplier part code
      rate_methode: '', // Rate method
      item_canel: '', // Item cancel flag
      tax_name: '', // Tax category name
      cost_code: '', // Cost code
      capex: false // Capital expenditure flag
    }
  ],

  Termscondition: [
    {
      tsupplier: '', // Corrected 'Tsupplier' to 'supplier'
      remarks: '',
      dlvr_term: '',
      payment_terms: '',
      quatation_reference: ''
    }
  ]
});

interface AddPurchaserequestPfFormProps {
  request_number?: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData: TPurchaserequestPf_Al;
}

const AddPurchaserequestPfForm_Al: React.FC<AddPurchaserequestPfFormProps> = ({
  request_number = '',
  onClose,
  isEditMode,
  existingData
}) => {
  const [purchaseRequest, setPurchaseRequest] = useState<TPurchaserequestPf_Al>(initialPurchaseRequest());
  const [termsConditions, setTermsConditions] = useState<TPrTermCondition_Al[]>([]);
  //setPurchaseRequestData(purchaseRequestData as unknown as SetStateAction<TPurchaserequestPf_Al>);
  //onst [termsConditionsdata] = useState<TPrTermCondition[]>([]);
  const [tabIndex, setTabIndex] = useState(0); // Default to the first tab
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  //changes on 01.12.2024
  const [openRequestForm, setOpenRequestForm] = useState(false); // State to control the modal visibility
  //*** */
  //const { app } = useSelector((state) => state.menuSelectionSlice);
  const { user } = useAuth();
  const [tempChanges, setTempChanges] = useState<{ [key: string]: any }>({}); // Store field changes temporarily

  // File attachemnt script

  const totalAmount: number = purchaseRequest?.items?.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0);

  const theme = createTheme({
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif' // Set Roboto as the default font
    }
  });

  // Store the previous tab index value
  const prevTabIndexRef = useRef<number | null>(null);

  useEffect(() => {
    prevTabIndexRef.current = tabIndex;
    const loadPurchaseRequest = async () => {
      if (request_number) {
        try {
          const purchaseRequestData = await GmPfServiceInstance_Al.getRequestNumber(request_number);
          console.log('Received purchase request data inside screen:', purchaseRequestData);
          if (!purchaseRequestData || !Array.isArray(purchaseRequestData.items)) {
            console.error('Purchase request data is missing or items array is not present');
            return; // Exit early if data is missing
          }

          console.log('Received purchase request data:', purchaseRequestData);

          //const items = purchaseRequestData.items; // This is the dynamic items data
          const termsConditionsdata = purchaseRequestData.Termscondition;
          setTermsConditions(termsConditionsdata);
          console.log('term & conditions', termsConditionsdata);
          // const termsConditionsdata = purchaseRequestData.Termscondition;

          // Now group the items by cost_code

          if (purchaseRequestData) setPurchaseRequest(purchaseRequestData);
        } catch (error) {
          console.error('Error loading purchase request:', error);
        }
      } else {
        setPurchaseRequest(initialPurchaseRequest());
      }
    };
    loadPurchaseRequest();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request_number]);

  useEffect(() => {
    console.log('Updated purchaseRequest state:', purchaseRequest);
  }, [purchaseRequest]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const startTime = performance.now();

    // Update Termscondition based on accumulated tempChanges
    setPurchaseRequest((prevState) => {
      const updatedTermsConditions = [...prevState.Termscondition];

      // Apply all temporary changes to the Termscondition array
      Object.keys(tempChanges).forEach((key) => {
        const { field, value, index } = tempChanges[key];
        updatedTermsConditions[index] = {
          ...updatedTermsConditions[index],
          [field]: value
        };
      });

      const endTime = performance.now();
      console.log(`State update took ${endTime - startTime}ms`);
      return {
        ...prevState,
        Termscondition: updatedTermsConditions
      };
    });

    // Clear the tempChanges after applying them
    setTempChanges({});

    // Update the tab index
    setTabIndex(newValue);

    // Log the tab index changes
    const prevTabIndex = prevTabIndexRef.current;
    console.log('Old Tab Index:', prevTabIndex);
    console.log('New Tab Index:', newValue);
    prevTabIndexRef.current = newValue;

    console.log('Tab index changed:', newValue);
  };

  const handleChange = (name: keyof TPurchaserequestPf_Al, value: string | Date | number) => {
    setPurchaseRequest((prevRequest) => ({ ...prevRequest, [name]: value }));
  };

  // Function to update tempChanges when a field changes
  /*const handleChangetermconditon = (field: keyof TPrTermCondition_Al, value: string, index: number) => {
    setTempChanges((prevChanges) => ({
      ...prevChanges,
      [`${index}-${field}`]: { field, value, index } // Store the change temporarily
    }));
  };*/

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /*const parseValue = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except "."
    const parsedValue = parseFloat(sanitizedValue);
    return isNaN(parsedValue) ? 0 : parsedValue;
  };*/

  const handleItemChange = (index: number, name: keyof TItemPrrequest_Al, value: string | number) => {
    setPurchaseRequest((prevRequest) => {
      // Clone items to avoid direct mutation
      const newItems = [...prevRequest.items];
      const item = { ...newItems[index] }; // Create a shallow copy of the item

      // Ensure item_qty is greater than 0 before applying changes
      if (item.item_qty > 0) {
        if (name === 'item_rate' && typeof value === 'string') {
          // Remove non-numeric characters except decimal point (.)
          const sanitizedValue = value.replace(/[^0-9.]/g, '');
          const [integerPart, decimalPart] = sanitizedValue.split('.');
          const validDecimalPart = decimalPart ? decimalPart.slice(0, 2) : ''; // Limit to two decimals
          const formattedValue = `${integerPart}.${validDecimalPart}`;

          // Ensure the value doesn't exceed 9999.99
          const numericValue = parseFloat(formattedValue);
          item.item_rate = numericValue <= 9999.99 ? numericValue : 9999.99;

          // Recalculate the amount
          item.amount = item.item_rate * item.allocated_approved_quantity;
        } else {
          (item as any)[name] = value;
        }

        // Save the updated item back in the array
        newItems[index] = item;
      }

      return { ...prevRequest, items: newItems };
    });
  };

  const validatePurchaseRequest = (data: TPurchaserequestPf_Al) => {
    const errors: string[] = [];

    // Validate top-level fields

    if (!data.remarks || data.remarks.trim() === '') {
      errors.push('Remarks is required.');
    }

    // Validate items array
    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required.');
    } else {
      data.items.forEach((item, index) => {
        // if (!item.l_uom || item.l_uom.trim() === '') {
        //   errors.push(`Item ${index + 1}: Please Select Primary Unit of Measurement(PUM).`);
        // }
        // if (!item.item_l_qty || item.item_l_qty <= 0) {
        //   errors.push(`Item ${index + 1}: Lower Unit Quantity must be greater than 0.`);
        // }
        if (data.flow_level_running === 3 || data.flow_level_running === 1) {
          if (!item.cost_code || item.cost_code.trim() === '') {
            errors.push(`Item ${index + 1}: Please Select Cost Code`);
          }
        }

        // Add more field checks as needed
      });
    }

    return errors;
  };

  console.log(submitStatus);

  const handleAddItem = () => {
    const errors = validatePurchaseRequest(purchaseRequest);
    if (errors.length > 0) {
      setSubmitStatus(errors.join(' '));

      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error);
      });

      dispatch(
        openSnackbar({
          open: true,
          message: `${errors.join(' ')}`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          },
          close: true
        })
      );

      setLoading(false);
      return;
    }

    setPurchaseRequest((prevRequest) => {
      // Clone the existing items
      const newItems = [...prevRequest.items];

      // Create a new item with default values
      const newItem = {
        item_code: '',
        item_desp: '',
        item_group_code: '',
        flow_level_running: 1,
        item_rate: 0,
        p_uom: '',
        l_uom: '',
        upp: 0,
        item_l_qty: 0,
        item_p_qty: 0,
        appr_upp: 0,
        appr_item_l_qty: 0,
        appr_item_p_qty: 0,
        currency_rate: 0,
        amount: 0,
        company_code: '',
        updated_at: new Date(),
        updated_by: '',
        request_number: '',
        curr_code: '',
        lcurr_amt: 0,
        allocated_approved_quantity: 0,
        selected_item: '',
        last_action: 'SAVEASDRAFT',
        history_serial: 0,
        curr_name: '',
        item_srno: 0,
        supplier_part_code: '',
        rate_method: '',
        supplier: '',
        select_item: '',
        discount_amount: 0,
        final_rate: 0,
        item_cancel: '',
        mail_attach: '',
        cash_ind: '',
        service_rm_flag: 'Service',
        addl_item_desc: '',
        pr_amount: 0,
        po_amount: 0,
        month_budget: 0,
        ac_name: '',
        cost_code: '', // Default empty value
        cost_name: '',
        ref_doc_no: '',
        doc_date: null
      };

      // Assign cost_code from the last item if available
      if (newItems.length > 0) {
        const lastItem = newItems[newItems.length - 1];
        newItem.cost_code = lastItem?.cost_code || ''; // Default to empty if undefined
      }

      // Add the new item to the array

      // Return the updated request object
      return {
        ...prevRequest,
        items: newItems
      };
    });
  };

  // In the parent window
  window.addEventListener('message', (event) => {
    // Make sure the message is coming from the expected source (optional but recommended for security)
    if (event.origin !== 'your-child-window-origin') {
      return;
    }

    // Handle the message
    if (event.data.type === 'SET_LAST_ACTION') {
      const action = event.data.action;
      console.log(`Last action received: ${action}`);
      // Set the action in your parent state or global variable
      window.last_action = action;
    }
  });

  /* const handleRemoveItem = (index: number) => {
    setPurchaseRequest((prevRequest) => ({
      ...prevRequest,
      items: prevRequest.items.filter((_, i) => i !== index)
    }));
  };*/

  const handleSaveAsDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSubmitStatus(null);

    //const navigate = useNavigate(); // Initialize navigate

    try {
      const errors = validatePurchaseRequest(purchaseRequest);
      if (errors.length > 0) {
        setSubmitStatus(`Error test: ${errors.join(' ')}`);
        setLoading(false);

        dispatch(
          openSnackbar({
            open: true,
            message: `${errors.join(' ')}`,
            variant: 'alert',
            alert: {
              color: 'error'
            },
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center'
            },
            close: true
          })
        );
        return;
      }

      const purchaseRequestData: TPurchaserequestPf_Al = {
        ...purchaseRequest,
        company_code: user?.company_code ?? '',
        //  updated_by: user?.loginid ?? '',
        //   created_by: user?.loginid ?? '',
        // created_at: user?.created_at ?? new Date(),
        //   updated_at: user?.updated_at ?? new Date(),
        last_action: 'SUBMITTED'
      };
      if (request_number) {
        purchaseRequestData.request_number = request_number;
      }
      purchaseRequestData.last_action = 'SAVEASDRAFT';
      console.log('transaction data', purchaseRequestData.Termscondition);
      await GmPfServiceInstance_Al.updatepurchaserequest(purchaseRequestData);
      setSubmitStatus('Purchase request submitted successfully!');

      // Close the form and exit by navigating to the previous screen
      // navigate(-1); // This will take the user to the previous page in the history stack

      if (!request_number) {
        setPurchaseRequest(initialPurchaseRequest());
      }
    } catch (error) {
      console.error('Error submitting purchase request:', error);
      setSubmitStatus('Error submitting purchase request.');
    } finally {
      setLoading(false);
      //onClose(true);
    }
  };

  // Function to group items by cost_code

  const handleOpenRequestForm = () => {
    // Validate the purchaseRequest before proceeding
    const errors = validatePurchaseRequest(purchaseRequest);
    if (errors.length > 0) {
      setSubmitStatus(errors.join(' '));
      dispatch(
        openSnackbar({
          open: true,
          message: `${errors.join(' ')}`,
          variant: 'alert',
          alert: {
            color: 'error'
          },
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center'
          },
          close: true
        })
      );
      setLoading(false); // Ensure loading is stopped
      return; // Exit the function if there are validation errors
    }

    // Construct the data for the purchase request
    const data: TPurchaserequestPf_Al = {
      ...purchaseRequest, // Spread the existing purchase request properties
      company_code: user?.company_code ?? '', // Use user's company code or fallback
      // updated_by: user?.loginid ?? '', // Use user's login ID for updates
      //created_by: user?.loginid ?? '', // Use user's login ID for creation
      //created_at: user?.created_at ?? new Date(), // Default to the current date if not provided
      //updated_at: user?.updated_at ?? new Date(), // Default to the current date for updates
      Termscondition: termsConditions // Include the current termsConditions state
      // last_action: 'SUBMITTED' // Uncomment if you want to set the last action
    };

    // Update the purchaseRequest state with the constructed data
    setPurchaseRequest(data);

    // Control the opening of the form based on the last action
    if (data.last_action === 'SUBMITTED') {
      setOpenRequestForm(false); // Do not open the form
      // window.close(); // Uncomment if you want to close the current window
    } else {
      setOpenRequestForm(true); // Open the form if the action is not 'SUBMITTED'
    }
  };

  const [, forceUpdate] = useState(0);
  const handleCloseRequestForm = () => {
    console.log(purchaseRequest.Termscondition);

    setOpenRequestForm(false);
    forceUpdate((prev) => prev + 1); // Trigger a re-render manually (avoid this unless necessary)
    console.log('Save');
    window.close();
  };

  /* const handleConfirm = async (purchaseRequestData: TPurchaserequestPf_Al) => {
    setLoading(true);
    setSubmitStatus(null);
    try {
      // Update purchase request status to confirmed
      await GmPfServiceInstance_Al.updatepurchaserequest({ ...purchaseRequestData, last_action: 'APPROVED' });
      setSubmitStatus('Purchase request confirmed successfully!');
      setOpenRequestForm(false);
      window.close();
    } catch (error) {
      console.error('Error confirming purchase request:', error);
      setSubmitStatus('Error confirming purchase request.');
    } finally {
      setLoading(false);
    }
  };*/

  const handleReject = async (purchaseRequestData: TPurchaserequestPf_Al) => {
    setLoading(true);
    setSubmitStatus(null);
    try {
      // Update purchase request status to rejected
      await GmPfServiceInstance_Al.updatepurchaserequest({ ...purchaseRequestData, last_action: 'REJECTED' });
      setSubmitStatus('Purchase request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting purchase request:', error);
      setSubmitStatus('Error rejecting purchase request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSentBack = async (purchaseRequestData: TPurchaserequestPf_Al) => {
    setLoading(true);
    setSubmitStatus(null);
    try {
      // Update purchase request status to sent back
      await GmPfServiceInstance_Al.updatepurchaserequest({ ...purchaseRequestData, last_action: 'SENTBACK' });
      setSubmitStatus('Purchase request sent back successfully!');
    } catch (error) {
      console.error('Error sending back purchase request:', error);
      setSubmitStatus('Error sending back purchase request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setSubmitStatus(null);

    //const navigate = useNavigate(); // Initialize navigate

    try {
      const purchaseRequestData: TPurchaserequestPf_Al = {
        ...purchaseRequest,
        company_code: user?.company_code ?? '',
        // updated_by: user?.loginid ?? '',
        //  created_by: user?.loginid ?? '',
        last_action: 'SUBMITTED'
      };

      if (request_number) {
        purchaseRequestData.request_number = request_number;
      }
      purchaseRequestData.last_action = 'SUBMITTED';
      await GmPfServiceInstance_Al.updatepurchaserequest(purchaseRequestData);
      setSubmitStatus('Purchase request submitted successfully!');

      // Close the form and exit by navigating to the previous screen
      // navigate(-1); // This will take the user to the previous page in the history stack

      if (!request_number) {
        setPurchaseRequest(initialPurchaseRequest());
      }
    } catch (error) {
      console.error('Error submitting purchase request:', error);
      setSubmitStatus('Error submitting purchase request.');
    } finally {
      setLoading(false);
      onClose(true);
    }
  };
  /* const selectedCost = costList?.tableData?.find((cost: CostOption) => String(cost.cost_code) === String(item.cost_code));
  console.log('selectedCost:', selectedCost);*/
  const myTheme = createTheme({
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            fontSize: '0.85rem',
            padding: '0rem 1rem'
          }
        }
      }
    }
  });

  const rows = purchaseRequest.items;
  console.log('rows', rows);

  // const dataSource = [
  //   {
  //     key: '1',
  //     name: 'Mike',
  //     age: 32,
  //     address: '10 Downing Street',
  //   },
  //   {
  //     key: '2',
  //     name: 'John',
  //     age: 42,
  //     address: '10 Downing Street',
  //   },
  // ];

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'item_code',
      key: 'item_code'
    },
    {
      title: 'Request Quantity',
      dataIndex: 'item_qty',
      key: 'item_qty'
    },
    {
      title: 'Request Quantity',
      dataIndex: 'item_qty',
      key: 'item_qty'
    },
    {
      title: 'Item Rate',
      dataIndex: 'item_rate',
      key: 'item_rate'
    },
    {
      title: 'Currency',
      dataIndex: 'curr_code',
      key: 'curr_code'
    },
    {
      title: 'Ex Rate',
      dataIndex: 'currency_rate',
      key: 'currency_rate'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: 'Base Amount',
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: 'Tax Code',
      dataIndex: 'tx_compntcat_code_1',
      key: 'tx_compntcat_code_1'
    },
    {
      title: 'Tax Category',
      dataIndex: 'tx_cat_code',
      key: 'tx_cat_code'
    },
    {
      title: 'Tax %',
      dataIndex: 'tx_compnt_perc_1',
      key: 'tx_compnt_perc_1'
    },
    {
      title: 'Tax Amount',
      dataIndex: 'tx_compnt_amt_1',
      key: 'tx_compnt_amt_1'
    },
    {
      title: 'Tax Type',
      dataIndex: 'tx_compnt_amt_1',
      key: 'tx_compnt_amt_1'
    },
    {
      title: 'Capex',
      dataIndex: 'capex',
      key: 'capex'
    }
  ];

  return (
    <Box sx={{ width: '100%', height: '70vh', margin: 0, padding: 0 }}>
      <Table
        dataSource={rows}
        bordered
        columns={columns}
        expandable={{
          expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.item_desp}</p>
        }}
      />
      {/* Tabs for sw
      itching between sections */}
      <ThemeProvider theme={myTheme}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Purchase Request Tabs">
          <Tab label="Header Detail" />
          <Tab label="Item Detail" />
          <Tab label="Terms and Condition" />
        </Tabs>
      </ThemeProvider>

      <form onSubmit={handleSubmit}>
        <ThemeProvider theme={theme}></ThemeProvider>
        {tabIndex === 2 && (
          <Box>
            {/* Pass additionalData to AddbudgetTab3 */}
            <TermsAndCondition_Al
              Purhasedata={purchaseRequest}
              tabIndex={tabIndex} // Pass the tabIndex prop here
              TermsConditions={termsConditions}
              setTermsConditions={setTermsConditions}
            />
          </Box>
        )}
        {/* Header Detail */}
        {tabIndex === 0 && (
          <div className="flex  gap-4 mt-4">
            {/* left side form */}
            <div className="flex flex-col gap-4 ">
              <div className="flex gap-4">
                {purchaseRequest.request_number && (
                  <TextField
                    label="Request Number"
                    size="medium"
                    name="request_number"
                    value={purchaseRequest.request_number || ''}
                    onChange={(e) => handleChange('request_number', e.target.value)}
                    required
                    InputProps={{
                      readOnly: true
                    }}
                  />
                )}

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Request Date"
                    name="Request Date"
                    format="DD/MM/YYYY"
                    value={purchaseRequest.request_date ? dayjs(purchaseRequest.request_date) : dayjs()} // Ensure request_date is in valid format
                    onChange={(newValue) => handleChange('request_date', newValue ? newValue.toDate() : new Date())}
                  />
                </LocalizationProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    disabled
                    label="Creation Date"
                    name="Request Date"
                    format="DD/MM/YYYY"
                    value={purchaseRequest.create_date ? dayjs(purchaseRequest.create_date) : dayjs()} // Ensure request_date is in valid format
                    onChange={(newValue) => handleChange('create_date', newValue ? newValue.toDate() : new Date())}
                  />
                </LocalizationProvider>

                <TextField
                  label="Creator"
                  name="create_user"
                  size="medium"
                  value={purchaseRequest.create_user || ''}
                  onChange={(e) => handleChange('create_user', e.target.value)}
                />
              </div>
              {/* desc & remarks */}
              <div className="flex flex-col gap-4 ">
                <TextField
                  label="Description"
                  name="description"
                  size="medium"
                  value={purchaseRequest.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />

                <TextField
                  label="Remarks"
                  size="medium"
                  name="remarks"
                  value={purchaseRequest.remarks || ''}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  required
                  multiline
                  rows={4} // You can adjust the number of rows as needed
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <TextField
                  label="Flow"
                  size="medium"
                  name="flow_code"
                  value={purchaseRequest.flow_code || ''}
                  onChange={(e) => handleChange('flow_code', e.target.value)}
                  InputProps={{
                    readOnly: true
                  }}
                  className="w-1/4"
                />

                <Tooltip title={purchaseRequest.flow_description || ''}>
                  <TextField
                    label="Flow Description"
                    size="medium"
                    name="flow_description"
                    value={purchaseRequest.flow_description || ''}
                    onChange={(e) => handleChange('flow_description', e.target.value)}
                    InputProps={{
                      readOnly: true
                    }}
                    className="w-3/4"
                  />
                </Tooltip>
              </div>

              <div className="flex gap-4">
                <TextField
                  label="Tax Category"
                  size="medium"
                  name="tx_cat_code"
                  value={purchaseRequest.tx_cat_code || ''}
                  onChange={(e) => handleChange('tx_cat_code', e.target.value)}
                  InputProps={{
                    readOnly: true
                  }}
                  className="w-1/4"
                />
                <Tooltip title={purchaseRequest.tx_cat_name || ''}>
                  <TextField
                    label="Tax Category Description"
                    size="medium"
                    name="tx_cat_name"
                    value={purchaseRequest.tx_cat_name || ''}
                    onChange={(e) => handleChange('tx_cat_name', e.target.value)}
                    InputProps={{
                      readOnly: true
                    }}
                    className="w-3/4"
                  />
                </Tooltip>
              </div>
              <div className="flex gap-4">
                <TextField
                  label="Tax Code"
                  size="medium"
                  name="tx_compntcat_code_1"
                  value={purchaseRequest.tx_compntcat_code_1 || ''}
                  onChange={(e) => handleChange('tx_compntcat_code_1', e.target.value)}
                  InputProps={{
                    readOnly: true
                  }}
                  className="w-1/4"
                />
                <Tooltip title={purchaseRequest.tx_cat_name || ''}>
                  <TextField
                    label="Tax Category Description"
                    size="medium"
                    name="tx_cat_name"
                    value={purchaseRequest.tx_cat_name || ''}
                    onChange={(e) => handleChange('tx_cat_name', e.target.value)}
                    InputProps={{
                      readOnly: true
                    }}
                    className="w-3/4"
                  />
                </Tooltip>
              </div>
              <div className="flex gap-4">
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Tax Type</InputLabel>
                  <Select labelId="demo-simple-select-label" id="demo-simple-select" label="Age" onChange={() => {}}>
                    <MenuItem>Std</MenuItem>
                    <MenuItem>Zero</MenuItem>
                    <MenuItem>Exempt</MenuItem>
                    <MenuItem>No Vat</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        )}
        {/* Item Detail */}
        {tabIndex === 1 && [1, 3, 5].includes(Number(purchaseRequest?.flow_level_running)) && (
          <>
            <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
              <Table size="small">
                {' '}
                {/* Adjust minWidth as needed */}
                <TableBody>
                  {rows.map((item, index) => (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.item_code} label="Item Code" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.item_desp} label="Item Description" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.item_group_desc} label="Item Group Description" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.item_group_code} label="Item Group Code" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.item_rate} label="Item Rate" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField
                          fullWidth
                          size="small"
                          value={item.item_qty}
                          label="Item Quantity"
                          disabled={item.item_qty <= 0}
                          onChange={(e) => handleItemChange(index, 'item_qty', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.currency_rate} label="Currency Rate" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.amount} label="Amount" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.tx_cat_code} label="Tax Category Code" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.tx_compntcat_code_1} label="Tax Component Category Code 1" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.tx_compnt_perc_1} label="Tax Component Percentage" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.tx_compnt_amt_1} label="Tax Component Amount" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField
                          fullWidth
                          size="small"
                          value={item.tx_compnt_lcuramt_1}
                          label="Tax Component Local Currency Amount"
                          disabled
                        />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.tx_compnt_1_expmt} label="Tax Component Exemption" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField fullWidth size="small" value={item.lcurr_amt} label="Local Currency Amount" disabled />
                      </TableCell>
                      <TableCell padding="none">
                        <TextField
                          fullWidth
                          size="small"
                          value={item.allocated_approved_quantity}
                          label="Allocated Approved Quantity"
                          disabled
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="flex gap-2 mt-4 justify-between">
              <React.Fragment>
                <Typography>React</Typography>
                <Button size="small" variant="contained" onClick={handleAddItem} startIcon={<AddIcon />}>
                  Add Itemggg
                </Button>
              </React.Fragment>

              <div className="flex gap-2 items-center">
                <Typography>TOTAL</Typography>

                <TextField
                  margin="none"
                  type="text"
                  size="small"
                  value={formatNumber(totalAmount)}
                  InputProps={{
                    readOnly: true,
                    style: {
                      textAlign: 'right',
                      fontWeight: 'bold'
                    }
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
                      textAlign: 'right'
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}

        <Box className="mt-2">
          {purchaseRequest?.final_approved?.toUpperCase?.() !== 'YES' &&
            (!purchaseRequest?.fa_uploaded || purchaseRequest?.fa_uploaded === 'N') && (
              <Button
                disabled={!purchaseRequest.request_number}
                size="small"
                variant="contained"
                color="primary"
                onClick={handleOpenRequestForm}
              >
                {Number(purchaseRequest?.flow_level_running) === 1 ? 'Purchase Request' : 'Submit'}
              </Button>
            )}

          {purchaseRequest?.final_approved === 'YES' && (!purchaseRequest?.fa_uploaded || purchaseRequest?.fa_uploaded === 'N') && (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={async () => {
                console.log('Generating PO:', purchaseRequest);
                purchaseRequest.company_code = user?.company_code || 'JASRA';
                purchaseRequest.last_action = 'POGEN';
                try {
                  await GmPfServiceInstance_Al.updatepurchaserequest(purchaseRequest);
                } catch (error) {
                  console.error('Error updating purchase request:', error);
                }
              }}
            >
              Generate PO
            </Button>
          )}

          {purchaseRequest?.final_approved?.toUpperCase?.() !== 'YES' && (
            <LoadingButton
              size="small"
              variant="contained"
              loading={loading}
              color="secondary"
              onClick={handleSaveAsDraft}
              style={{ marginLeft: '10px' }}
            >
              Save as Draft
            </LoadingButton>
          )}

          {purchaseRequest && (
            <PurchaseRequestFormprint_Al
              open={openRequestForm}
              onClose={handleCloseRequestForm}
              onConfirm={() => {
                console.log('Confirming purchase request.');
                handleCloseRequestForm();
              }}
              onReject={handleReject}
              onSentBack={handleSentBack}
              onBack={handleCloseRequestForm}
              initialData={purchaseRequest}
            />
          )}
        </Box>
      </form>
    </Box>
  );
};

export default AddPurchaserequestPfForm_Al;
